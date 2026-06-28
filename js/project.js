/* =========================================================================
   Страница X-проекта — рендер правой панели со-владельцев и таблицы целей.
   Зависимости: window.COOWNERS, window.QUARTERS, window.initials, popup.js
   ========================================================================= */

var SHOW_LIMIT = 5;
var showAllMap = {};
var collapsedQ = {};   /* свёрнутые кварталы: id → true */


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

/* Склонение «дочерних (целей)» по числу */
function pluralChild(n) {
  var d10 = n % 10, d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return 'дочерняя';
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return 'дочерние';
  return 'дочерних';
}

/* Склонение «цель» по числу */
function pluralGoal(n) {
  var d10 = n % 10, d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return 'цель';
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return 'цели';
  return 'целей';
}


/* ───────── Со-владельцы проекта (правая панель) ───────── */

var CO_VISIBLE = 3;     /* сколько со-владельцев видно до раскрытия */
var coOpen = false;

/* Склонение «совладелец» по числу */
function pluralCoowner(n) {
  var d10 = n % 10, d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return 'совладелец';
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return 'совладельца';
  return 'совладельцев';
}

function coRow(c) {
  return '<div class="co-item">' +
    '<div class="co-av">' + c.ini + '</div>' +
    '<div class="co-info"><span class="co-name">' + c.name + '</span>' +
    '<span class="co-dept">' + c.dept + '</span></div>' +
  '</div>';
}

function renderCoowners() {
  var list = document.getElementById('co-list');
  if (!list) return;

  var shown = coOpen ? COOWNERS.length : Math.min(CO_VISIBLE, COOWNERS.length);
  var html = '';
  for (var i = 0; i < shown; i++) html += coRow(COOWNERS[i]);

  var rest = COOWNERS.length - CO_VISIBLE;
  if (rest > 0) {
    html += '<button class="co-more-btn" id="co-more-btn">' +
      '<i class="ti ti-' + (coOpen ? 'minus' : 'plus') + '"></i>' +
      (coOpen ? 'Скрыть' : 'ещё ' + rest + ' ' + pluralCoowner(rest)) +
    '</button>';
  }
  list.innerHTML = html;

  var btn = document.getElementById('co-more-btn');
  if (btn) btn.onclick = function () { coOpen = !coOpen; renderCoowners(); };
}


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
  var ownerWeight = row.weights && row.weights[0]
    ? '<span class="owner-weight">' + row.weights[0] + '</span>' : '';

  var html = '<i class="ti ti-crown owner-crown"></i>' +
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
      '<span class="depth-badge" title="Глубина вложенности и число дочерних целей">' +
        '<i class="ti ti-chevron-down"></i>' + depth + ' ур.' +
        '<span class="depth-badge-sep">|</span>' + total + ' ' + pluralChild(total) +
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


/* ───────── Модалка «Добавить цель» ───────── */
(function () {
  var modal = document.getElementById('add-goal-modal');
  if (!modal) return;
  var openBtn = document.getElementById('add-goal-btn');
  var closeBtn = document.getElementById('agm-close');
  var cancelBtn = document.getElementById('agm-cancel');
  var submitBtn = document.getElementById('agm-submit');

  function open() {
    modal.hidden = false;
    document.addEventListener('keydown', onKey);
    var checked = modal.querySelector('input[name="goalType"]:checked');
    if (checked) checked.focus();
  }
  function close() {
    modal.hidden = true;
    document.removeEventListener('keydown', onKey);
    if (openBtn) openBtn.focus();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  if (openBtn) openBtn.onclick = open;
  if (closeBtn) closeBtn.onclick = close;
  if (cancelBtn) cancelBtn.onclick = close;
  /* Клик по затемнению (вне карточки) закрывает */
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

  if (submitBtn) submitBtn.onclick = function () {
    var sel = modal.querySelector('input[name="goalType"]:checked');
    var type = sel ? sel.value : 'cmd';
    /* Заглушка: страницы создания цели пока нет */
    console.log('Создание цели, тип:', type);
    close();
  };
})();


/* ───────── Init ───────── */
/* По умолчанию открыт только первый квартал, остальные свёрнуты */
QUARTERS.forEach(function (q, i) { if (i > 0) collapsedQ[q.id] = true; });

renderCoowners();
render();
