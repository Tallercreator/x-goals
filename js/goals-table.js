/* =========================================================================
   Общий модуль таблицы целей (страница проекта и страница цели).
   Зависимости: window.QUARTERS, window.initials, popup.js
   API: GoalsTable.mount({ sectionId, onNavigate(id,name), expand })
        expand: 'first' | { pathTo: '<id>' }
   ========================================================================= */
window.GoalsTable = (function () {
  var SHOW_LIMIT = 5;
  var showAllMap = {};
  var collapsedQ = {};
  var onNavigate = null;
  var sectionId = 'goals-section';

  /* ── Глубина / размер поддерева ── */
  function subtreeDepth(row) {
    if (!row.children || !row.children.length) return 0;
    var max = 0;
    row.children.forEach(function (c) { var d = subtreeDepth(c); if (d > max) max = d; });
    return max + 1;
  }
  function descendantCount(row) {
    if (!row.children || !row.children.length) return 0;
    var n = 0;
    row.children.forEach(function (c) { n += 1 + descendantCount(c); });
    return n;
  }

  /* ── Склонения ── */
  function pluralChild(n) {
    var d10 = n % 10, d100 = n % 100;
    if (d10 === 1 && d100 !== 11) return 'дочерняя';
    if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return 'дочерние';
    return 'дочерних';
  }
  function pluralGoal(n) {
    var d10 = n % 10, d100 = n % 100;
    if (d10 === 1 && d100 !== 11) return 'цель';
    if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return 'цели';
    return 'целей';
  }

  /* ── Теги типа ── */
  function tagHtml(type, extraTags) {
    var html = '';
    if (type === 'ind') html += '<span class="tag tag--ind">Индивидуальная цель</span>';
    else if (type === 'cmd') html += '<span class="tag tag--cmd">Командная цель</span>';
    if (extraTags && extraTags.indexOf('x') !== -1) html += '<span class="tag tag--x">Х-цель</span>';
    return html;
  }

  /* ── Ячейка владельца + со-владельцы ── */
  function ownerCellHtml(row) {
    if (!row.owners || !row.owners.length) return '';
    var owner = row.owners[0];
    var coOwners = row.owners.slice(1);
    var ownerWeight = row.weights && row.weights[0]
      ? '<span class="owner-weight">' + row.weights[0] + '</span>' : '';

    var html = '<i class="ti ti-crown owner-crown"></i>' +
               '<span class="owner-label">' + owner + ownerWeight + '</span>';
    if (!coOwners.length) return html;

    var popupId = 'cop-' + row.id;
    var stackMax = 4;
    var shown = Math.min(stackMax, coOwners.length);

    html += '<span class="owner-sep"></span>';
    html += '<span class="co-stack-wrap"' +
            '  onmouseenter="showCoPopup(\'' + popupId + '\', event)"' +
            '  onmouseleave="hideCoPopup(\'' + popupId + '\')">';
    html += '<span class="co-stack">';
    for (var i = 0; i < shown; i++) {
      html += '<span class="co-av-xs">' + initials(coOwners[i].split('|')[0].trim()) + '</span>';
    }
    if (coOwners.length > stackMax) {
      html += '<span class="co-av-xs co-av-count">+' + (coOwners.length - stackMax) + '</span>';
    }
    html += '</span><span class="co-count-label">' + coOwners.length + ' со-вл.</span>';

    var rows = '';
    coOwners.forEach(function (co, ci) {
      var parts = co.split('|');
      var name = parts[0].trim();
      var dept = (parts[1] || '').trim();
      var w = row.weights && row.weights[ci + 1] ? row.weights[ci + 1] : '—';
      rows += '<div class="co-popup-row">' +
        '<span class="co-popup-av">' + initials(name) + '</span>' +
        '<div class="co-popup-info"><div class="co-popup-name">' + name + '</div>' +
        '<div class="co-popup-dept">' + dept + '</div></div>' +
        '<div><div class="co-popup-weight">' + w + '</div>' +
        '<div class="co-popup-weight-label">вес участия</div></div>' +
      '</div>';
    });
    html += '<div id="' + popupId + '" class="co-popup"' +
      '  onmouseenter="keepCoPopup()" onmouseleave="hideCoPopup(\'' + popupId + '\')">' +
        '<div class="co-popup-head">' +
          '<span class="co-popup-head-title">Со-владельцы · ' + coOwners.length + '</span>' +
          '<span class="co-popup-head-hint">Вес участия</span>' +
        '</div>' +
        '<div class="co-popup-list">' + rows + '</div>' +
        '<div class="co-popup-foot">Открой цель для полных деталей →</div>' +
      '</div></span>';
    return html;
  }

  /* ── Строка ── */
  function renderRow(tbody, row) {
    var indent = '';
    for (var i = 0; i < row.level; i++) {
      indent += (i === row.level - 1)
        ? '<span class="indent-corner"></span>'
        : '<span class="indent-line"></span>';
    }

    var tr = document.createElement('tr');
    tr.className = 'tr-l' + Math.min(row.level, 2) + (row.id === GoalsTable._currentId ? ' tr-current' : '');
    tr.dataset.id = row.id;

    var depthBadge = '';
    if (row.hasChildren) {
      depthBadge = '<span class="depth-badge" title="Глубина вложенности и число дочерних целей">' +
          '<i class="ti ti-chevron-down"></i>' + subtreeDepth(row) + ' ур.' +
          '<span class="depth-badge-sep">|</span>' + descendantCount(row) + ' ' + pluralChild(descendantCount(row)) +
        '</span>';
    }

    var chevron = row.hasChildren
      ? '<span class="row-chevron" data-act="toggle"><i class="ti ti-chevron-' + (row.open ? 'down' : 'right') + '"></i></span>'
      : '<span class="row-chevron-spacer"></span>';

    tr.innerHTML =
      '<td class="td-name">' +
        '<div class="indent-line-wrap">' + indent + '</div>' +
        '<div style="display:flex;align-items:flex-start;gap:0;flex:1;min-width:0">' + chevron +
          '<div class="row-inner">' +
            '<div class="row-tags">' + tagHtml(row.type, row.tags) + depthBadge + '</div>' +
            '<div class="row-name' + (row.level > 0 ? ' row-name--l1' : '') + '">' + row.name + '</div>' +
            '<div class="row-owners">' + ownerCellHtml(row) + '</div>' +
          '</div>' +
        '</div>' +
      '</td>' +
      '<td class="td-plan">' + (row.plan || '—') + '</td>' +
      '<td class="td-fact td-fact--' + row.factClass + '">' + (row.fact || '—') + '</td>' +
      '<td class="td-arrow" data-act="nav"><i class="ti ti-chevron-right"></i></td>';

    var chev = tr.querySelector('[data-act="toggle"]');
    if (chev) chev.addEventListener('click', function (e) {
      e.stopPropagation(); row.open = !row.open; render();
    });

    var arrow = tr.querySelector('[data-act="nav"]');
    if (arrow) arrow.addEventListener('click', function (e) {
      e.stopPropagation(); if (onNavigate) onNavigate(row.id, row.name);
    });

    tr.onclick = function (e) {
      if (e.target.closest('[data-act]')) return;
      if (row.hasChildren) { row.open = !row.open; render(); }
    };

    tbody.appendChild(tr);
    if (row.open && row.children && row.children.length) {
      row.children.forEach(function (ch) { renderRow(tbody, ch); });
    }
  }

  /* ── Рендер всех кварталов ── */
  function render() {
    var section = document.getElementById(sectionId);
    if (!section) return;
    section.innerHTML = '';

    QUARTERS.forEach(function (q) {
      var block = document.createElement('div');
      block.className = 'quarter-block';

      var isCollapsed = !!collapsedQ[q.id];
      var heading = document.createElement('div');
      heading.className = 'quarter-heading' + (isCollapsed ? ' is-collapsed' : '');
      heading.innerHTML =
        '<i class="ti ti-chevron-' + (isCollapsed ? 'right' : 'down') + ' qh-chevron"></i>' +
        '<span class="qh-label">' + q.label + '</span>' +
        '<span class="qh-status" style="background:' + q.sc + ';color:' + q.st + '">' + q.status + '</span>' +
        '<span class="qh-count">' + q.rows.length + ' ' + pluralGoal(q.rows.length) + '</span>';
      heading.onclick = (function (qid) {
        return function () { collapsedQ[qid] = !collapsedQ[qid]; render(); };
      })(q.id);
      block.appendChild(heading);

      if (isCollapsed) { section.appendChild(block); return; }

      var table = document.createElement('table');
      table.className = 'goals-table';
      table.innerHTML = '<thead><tr><th>Название</th>' +
        '<th class="right">План</th><th class="right">Факт</th><th></th></tr></thead>';

      var tbody = document.createElement('tbody');
      var limit = showAllMap[q.id] ? 999 : SHOW_LIMIT;
      var shown = 0;
      q.rows.forEach(function (row, idx) {
        if (shown >= limit) return;
        renderRow(tbody, row);
        shown++;
        if (idx < q.rows.length - 1 && shown < limit) {
          var sep = document.createElement('tr');
          sep.className = 'tr-sep';
          sep.innerHTML = '<td colspan="4"></td>';
          tbody.appendChild(sep);
        }
      });

      if (!showAllMap[q.id] && q.rows.length > SHOW_LIMIT) {
        var more = document.createElement('tr');
        more.className = 'show-more-tr';
        more.innerHTML = '<td colspan="4">+ ещё ' + (q.rows.length - SHOW_LIMIT) + ' целей</td>';
        more.onclick = (function (qid) { return function () { showAllMap[qid] = true; render(); }; })(q.id);
        tbody.appendChild(more);
      }

      table.appendChild(tbody);
      block.appendChild(table);
      section.appendChild(block);
    });
  }

  /* Открыть путь до строки с заданным id, вернуть id её квартала */
  function openPathTo(id) {
    var foundQ = null;
    function walk(row, ancestors) {
      if (row.id === id) { ancestors.forEach(function (a) { a.open = true; }); return true; }
      if (row.children) {
        for (var i = 0; i < row.children.length; i++) {
          if (walk(row.children[i], ancestors.concat([row]))) return true;
        }
      }
      return false;
    }
    QUARTERS.forEach(function (q) { q.rows.forEach(function (r) { if (walk(r, [])) foundQ = q.id; }); });
    return foundQ;
  }

  function mount(opts) {
    onNavigate = opts.onNavigate || null;
    sectionId = opts.sectionId || 'goals-section';
    showAllMap = {};
    collapsedQ = {};
    GoalsTable._currentId = (opts.expand && opts.expand.pathTo) || null;

    if (opts.expand === 'first') {
      QUARTERS.forEach(function (q, i) { if (i > 0) collapsedQ[q.id] = true; });
    } else if (opts.expand && opts.expand.pathTo) {
      var qid = openPathTo(opts.expand.pathTo);
      QUARTERS.forEach(function (q) { if (q.id !== qid) collapsedQ[q.id] = true; });
    }
    render();
  }

  return { mount: mount, render: render, _currentId: null };
})();
