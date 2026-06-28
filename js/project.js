/* =========================================================================
   Страница X-проекта — рендер правой панели со-владельцев и таблицы целей.
   Зависимости: window.COOWNERS, window.QUARTERS, window.initials, popup.js
   ========================================================================= */

var SHOW_LIMIT = 5;
var showAllMap = {};


/* ───────── Глубина и размер поддерева ───────── */

/* Максимальная глубина вложенности под строкой (0 = нет детей) */
function subtreeDepth(row) {
  if (!row.children || !row.children.length) return 0;
  var max = 0;
  row.children.forEach(function (c) {
    var d = subtreeDepth(c);
    if (d > max) max = d;
  });
  return max + 1;
}

/* Всего потомков под строкой (все уровни) */
function descendantCount(row) {
  if (!row.children || !row.children.length) return 0;
  var n = 0;
  row.children.forEach(function (c) { n += 1 + descendantCount(c); });
  return n;
}

/* Склонение «подцель» по числу */
function pluralSub(n) {
  var d10 = n % 10, d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return 'подцель';
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return 'подцели';
  return 'подцелей';
}


/* ───────── Со-владельцы проекта (правая панель) ───────── */

function renderCoowners() {
  var stack = document.getElementById('co-stack');
  stack.innerHTML = '';
  var n = Math.min(5, COOWNERS.length);
  for (var i = 0; i < n; i++) {
    var d = document.createElement('div');
    d.className = 'av-sm';
    d.style.fontSize = '11px';
    d.textContent = COOWNERS[i].ini;
    stack.appendChild(d);
  }
  if (COOWNERS.length > 5) {
    var cnt = document.createElement('div');
    cnt.className = 'av-count';
    cnt.textContent = '+' + (COOWNERS.length - 5);
    stack.appendChild(cnt);
  }
  document.getElementById('co-summary-text').textContent = COOWNERS.length + ' со-владельцев';

  var full = document.getElementById('co-full');
  full.innerHTML = '';
  COOWNERS.forEach(function (c) {
    var row = document.createElement('div');
    row.className = 'co-item';
    row.innerHTML =
      '<div class="av-sm">' + c.ini + '</div>' +
      '<div><div class="co-name">' + c.name + '</div>' +
      '<div class="co-dept">' + c.dept + '</div></div>';
    full.appendChild(row);
  });
}

var coOpen = false;
window.toggleCoowners = function () {
  coOpen = !coOpen;
  document.getElementById('co-full').className = 'co-full' + (coOpen ? ' is-open' : '');
  document.getElementById('co-expand-ic').style.transform = coOpen ? 'rotate(180deg)' : '';
  document.getElementById('co-expand-label').textContent = coOpen ? 'Скрыть' : 'Показать всех';
};


/* ───────── Таблица целей ───────── */

function tagHtml(type, extraTags) {
  var html = '';
  if (type === 'ind') html += '<span class="tag tag--ind">Индивидуальная цель</span>';
  else if (type === 'cmd') html += '<span class="tag tag--cmd">Командная цель</span>';
  if (extraTags && extraTags.indexOf('x') !== -1) html += '<span class="tag tag--x">Х-цель</span>';
  return html;
}

function ownerCellHtml(row) {
  if (!row.owners || !row.owners.length) return '';
  var owner = row.owners[0];
  var coOwners = row.owners.slice(1);
  var ownerName = owner.split('|')[0].trim();
  var ownerIni = initials(ownerName);
  var ownerWeight = row.weights && row.weights[0]
    ? '<span class="owner-weight">' + row.weights[0] + '</span>' : '';

  var html = '<span class="owner-av-xs">' + ownerIni + '</span>' +
             '<span class="owner-label">' + owner + ownerWeight + '</span>';

  if (!coOwners.length) return html;

  /* Стек + поп-ап */
  var popupId = 'cop-' + row.id;
  var stackMax = 4;
  var shown = Math.min(stackMax, coOwners.length);

  html += '<span class="owner-sep"></span>';
  html +=
    '<span class="co-stack-wrap"' +
    '  onmouseenter="showCoPopup(\'' + popupId + '\', event)"' +
    '  onmouseleave="hideCoPopup(\'' + popupId + '\')">';

  html += '<span class="co-stack">';
  for (var i = 0; i < shown; i++) {
    html += '<span class="co-av-xs">' + initials(coOwners[i].split('|')[0].trim()) + '</span>';
  }
  if (coOwners.length > stackMax) {
    html += '<span class="co-av-xs co-av-count">+' + (coOwners.length - stackMax) + '</span>';
  }
  html += '</span>';
  html += '<span class="co-count-label">' + coOwners.length + ' со-вл.</span>';

  /* Попап */
  var rows = '';
  coOwners.forEach(function (co, ci) {
    var parts = co.split('|');
    var name = parts[0].trim();
    var dept = (parts[1] || '').trim();
    var w = row.weights && row.weights[ci + 1] ? row.weights[ci + 1] : '—';
    rows +=
      '<div class="co-popup-row">' +
        '<span class="co-popup-av">' + initials(name) + '</span>' +
        '<div class="co-popup-info">' +
          '<div class="co-popup-name">' + name + '</div>' +
          '<div class="co-popup-dept">' + dept + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="co-popup-weight">' + w + '</div>' +
          '<div class="co-popup-weight-label">вес участия</div>' +
        '</div>' +
      '</div>';
  });

  html +=
    '<div id="' + popupId + '" class="co-popup"' +
    '  onmouseenter="keepCoPopup()" onmouseleave="hideCoPopup(\'' + popupId + '\')">' +
      '<div class="co-popup-head">' +
        '<span class="co-popup-head-title">Со-владельцы · ' + coOwners.length + '</span>' +
        '<span class="co-popup-head-hint">Вес участия</span>' +
      '</div>' +
      '<div class="co-popup-list">' + rows + '</div>' +
      '<div class="co-popup-foot">Открой цель для полных деталей →</div>' +
    '</div>' +
    '</span>';

  return html;
}

function renderRow(tbody, row) {
  /* Indent */
  var indent = '';
  for (var i = 0; i < row.level; i++) {
    indent += (i === row.level - 1)
      ? '<span class="indent-corner"></span>'
      : '<span class="indent-line"></span>';
  }

  var tr = document.createElement('tr');
  tr.className = 'tr-l' + Math.min(row.level, 2);
  tr.dataset.id = row.id;

  /* Бейдж глубины поддерева: «⤵ 7 ур. · 8 подцелей» */
  var depthBadge = '';
  if (row.hasChildren) {
    var depth = subtreeDepth(row);
    var total = descendantCount(row);
    depthBadge =
      '<span class="depth-badge" title="Глубина вложенности и число подцелей">' +
        '<i class="ti ti-corner-right-down"></i>' + depth + ' ур.' +
        '<span class="depth-badge-sep">·</span>' + total + ' ' + pluralSub(total) +
      '</span>';
  }

  /* Шеврон / спейсер */
  var chevron = row.hasChildren
    ? '<span class="row-chevron" data-act="toggle">' +
        '<i class="ti ti-chevron-' + (row.open ? 'down' : 'right') + '"></i>' +
      '</span>'
    : '<span class="row-chevron-spacer"></span>';

  tr.innerHTML =
    '<td class="td-name">' +
      '<div class="indent-line-wrap">' + indent + '</div>' +
      '<div style="display:flex;align-items:flex-start;gap:0;flex:1;min-width:0">' +
        chevron +
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

  /* Шеврон — переключить раскрытие */
  var chev = tr.querySelector('[data-act="toggle"]');
  if (chev) chev.addEventListener('click', function (e) {
    e.stopPropagation();
    row.open = !row.open;
    render();
  });

  /* Стрелка — перейти на страницу цели */
  var arrow = tr.querySelector('[data-act="nav"]');
  if (arrow) arrow.addEventListener('click', function (e) {
    e.stopPropagation();
    goToGoal(row.id, row.name);
  });

  /* Клик по строке — тоже toggle */
  tr.onclick = function (e) {
    if (e.target.closest('[data-act]')) return;
    if (row.hasChildren) {
      row.open = !row.open;
      render();
    }
  };

  tbody.appendChild(tr);

  if (row.open && row.children && row.children.length) {
    row.children.forEach(function (ch) { renderRow(tbody, ch); });
  }
}

function render() {
  var section = document.getElementById('goals-section');
  section.innerHTML = '';

  QUARTERS.forEach(function (q) {
    var block = document.createElement('div');
    block.className = 'quarter-block';

    var heading = document.createElement('div');
    heading.className = 'quarter-heading';
    heading.innerHTML =
      '<span class="qh-label">' + q.label + '</span>' +
      '<span class="qh-status" style="background:' + q.sc + ';color:' + q.st + '">Статус «' + q.status + '»</span>';
    block.appendChild(heading);

    var table = document.createElement('table');
    table.className = 'goals-table';
    table.innerHTML =
      '<thead><tr>' +
        '<th>Название</th>' +
        '<th class="right">План</th><th class="right">Факт</th><th></th>' +
      '</tr></thead>';

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

function goToGoal(goalId, goalName) {
  var params = new URLSearchParams();
  params.set('goalId', goalId || 'g1');
  params.set('goal', goalName || '');
  params.set('proj', 'Адаптация новичка за 7 дней');
  window.location.href = 'goal.html?' + params.toString();
}


/* ───────── Init ───────── */
renderCoowners();
render();
