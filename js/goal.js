/* =========================================================================
   Страница цели — навигация по дереву TREE, хлебные крошки, карточки.
   Зависимости: window.TREE
   ========================================================================= */

/* ───── Карта узлов: id → { node, parent } ───── */
var nodeMap = {};
(function buildMap(node, parent) {
  nodeMap[node.id] = { node: node, parent: parent };
  if (node.children) node.children.forEach(function (c) { buildMap(c, node); });
})(TREE, null);

/* ───── State ───── */
var urlParams = new URLSearchParams(window.location.search);
var startId = urlParams.get('goalId') || 'g1';
if (!nodeMap[startId]) startId = 'g1';          /* fallback на валидный узел */
var curId = startId;
var expandedIds = {};
expandedIds[startId] = true;

/* ───── Хелперы типов/статусов ───── */
function dotColor(p) { return p >= 100 ? '#22c55e' : p > 0 ? '#f59e0b' : '#d1d5db'; }
function typeClass(t) { return t === 'x' ? 'x' : t === 'ind' ? 'ind' : t === 'cmd' ? 'cmd' : 'project'; }
function tagClass(t) { return t === 'x' ? 'tag--x' : t === 'ind' ? 'tag--ind' : 'tag--cmd'; }
function tagLabel(t) { return t === 'x' ? 'Х-цель' : t === 'ind' ? 'Инд.' : 'Ком.'; }

/* Окончание слова «подцель» по числу */
function plural(n) {
  var d10 = n % 10, d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return 'ь';        /* 1 подцель  */
  if (d10 >= 2 && d10 <= 4 && (d100 < 10 || d100 >= 20)) return 'и'; /* 2 подцели */
  return 'ей';                                       /* 5 подцелей */
}

/* ───── Предки (для крошек) ───── */
function getAncestors(id) {
  var path = [];
  var cur = nodeMap[id];
  while (cur) {
    path.unshift(cur.node);
    cur = cur.parent ? nodeMap[cur.parent.id] : null;
  }
  return path;
}

/* ───── Хлебные крошки ───── */
function renderBreadcrumb() {
  var el = document.getElementById('tree-nav');
  el.innerHTML = '';
  var ancestors = getAncestors(curId);
  ancestors.forEach(function (n, i) {
    var isLast = i === ancestors.length - 1;
    var span = document.createElement('span');
    span.className = 'tn-item tn-item--' + typeClass(n.type) + (isLast ? ' is-active' : '');
    span.title = n.name;
    var label = n.name.length > 32 ? n.name.slice(0, 30) + '…' : n.name;

    if (n.type === 'project') {
      span.innerHTML = '<i class="ti ti-arrow-left" style="font-size:11px"></i> ' + label;
      span.onclick = function () { window.location.href = 'index.html'; };
    } else {
      span.innerHTML =
        '<span class="tag ' + tagClass(n.type) + '" style="font-size:9px;padding:1px 5px;margin-right:3px">' +
        tagLabel(n.type) + '</span>' + label;
      if (!isLast) {
        span.onclick = (function (nid) { return function () { navigateTo(nid); }; })(n.id);
      }
    }
    el.appendChild(span);

    if (!isLast) {
      var sep = document.createElement('span');
      sep.className = 'tn-sep';
      sep.textContent = '›';
      el.appendChild(sep);
    }
  });
}

/* ───── Навигация ───── */
var lastDir = 'fade';   /* направление последнего перехода: 'in' | 'up' | 'fade' */

/* Внутреннее переключение узла + вычисление направления анимации */
function setCurrent(id) {
  var prevDepth = getAncestors(curId).length;
  curId = id;
  expandedIds = {};
  expandedIds[id] = true;
  var newDepth = getAncestors(id).length;
  lastDir = newDepth > prevDepth ? 'in' : newDepth < prevDepth ? 'up' : 'fade';
}

/* Навигация с записью в историю браузера */
function navigateTo(id) {
  if (!nodeMap[id] || id === curId) return;
  setCurrent(id);
  history.pushState({ goalId: id }, '', '?goalId=' + id);
  renderAll();
  document.querySelector('.goal-content').scrollTop = 0;
}

/* Кнопки «назад / вперёд» браузера и deep-link */
window.addEventListener('popstate', function (e) {
  var id = (e.state && e.state.goalId) ||
    new URLSearchParams(location.search).get('goalId') || startId;
  if (!nodeMap[id]) id = startId;
  setCurrent(id);
  renderAll();
});

window.selQ = function (i) {
  document.querySelectorAll('.q-tab').forEach(function (t, idx) {
    t.className = 'q-tab' + (idx === i ? ' is-active' : '');
  });
};

/* ───── Render ───── */
function renderAll() {
  renderBreadcrumb();
  renderGoals();
  var cur = nodeMap[curId] ? nodeMap[curId].node : null;
  if (cur) {
    document.getElementById('page-title').textContent =
      cur.name.length > 50 ? cur.name.slice(0, 48) + '…' : cur.name;
  }
}

function renderGoals() {
  var area = document.getElementById('goals-area');
  area.innerHTML = '';

  var entry = nodeMap[curId];
  if (!entry) {
    area.innerHTML = '<div class="no-parent">Цель не найдена</div>';
    return;
  }
  var cur = entry.node;
  var parentNode = entry.parent;

  /* Родительская цель — кликабельна «вверх» */
  area.appendChild(sectionLabel('Родительская цель'));
  if (parentNode && parentNode.type !== 'project') {
    area.appendChild(buildCard(parentNode, 'parent', false));
  } else {
    var np = document.createElement('div');
    np.className = 'no-parent';
    np.textContent = 'Это цель верхнего уровня — привязана напрямую к проекту';
    area.appendChild(np);
  }

  /* Текущая цель */
  area.appendChild(sectionLabel('Текущая цель'));
  area.appendChild(buildCard(cur, 'current', true));

  /* Дочерние цели — кликабельны «вниз» */
  var childCount = cur.children ? cur.children.length : 0;
  area.appendChild(sectionLabel('Дочерние цели (' + childCount + ')'));
  if (childCount) {
    cur.children.forEach(function (ch) {
      area.appendChild(buildCard(ch, 'child', false));
    });
  } else {
    var empty = document.createElement('div');
    empty.className = 'children-empty';
    empty.innerHTML = '<i class="ti ti-stack-2" style="font-size:16px;color:var(--gray-300)"></i>' +
      'У этой цели нет дочерних целей — это нижний уровень дерева';
    area.appendChild(empty);
  }

  /* Направленная анимация перехода */
  area.classList.remove('goals-area--in', 'goals-area--up', 'goals-area--fade');
  void area.offsetWidth;                       /* перезапуск анимации */
  area.classList.add('goals-area--' + lastDir);
}

function sectionLabel(text) {
  var lbl = document.createElement('div');
  lbl.className = 'card-section-label';
  lbl.innerHTML = text + ' <div class="csl-line"></div>';
  return lbl;
}

function buildCard(node, variant, isExpanded) {
  var card = document.createElement('div');
  card.className = 'goal-card goal-card--' + variant;
  card.id = 'card-' + node.id;

  var isOpen = !!expandedIds[node.id];
  var dc = dotColor(node.pct || 0);
  var canExpand = node.dos && node.dos.length > 0;
  var childN = node.children ? node.children.length : 0;
  var canNavigate = childN > 0;

  /* Дочерняя карточка с детьми — кликабельна целиком (drill in) */
  var drillable = variant === 'child' && canNavigate;
  if (drillable) card.classList.add('is-drillable');

  /* Действия в правой части: зависят от роли карточки */
  var actionHtml = '';
  if (variant === 'parent') {
    actionHtml = '<button class="nav-up-btn" title="Подняться к родительской цели">↑ Вверх</button>';
  } else if (variant === 'child') {
    if (canNavigate) actionHtml += '<span class="child-count" title="Дочерних целей">↓ ' + childN + ' подцел' + plural(childN) + '</span>';
    actionHtml += '<span class="drill-hint">Провалиться</span>';
  }
  actionHtml += '<i class="ti ti-copy copy-ic"></i>';

  /* Header */
  var hdr = document.createElement('div');
  hdr.className = 'goal-header';
  hdr.innerHTML =
    (canExpand
      ? '<i class="ti ti-chevron-right gh-arrow' + (isOpen ? ' is-open' : '') + '" id="arr-' + node.id + '"></i>'
      : '<span class="gh-spacer"></span>') +
    '<span class="g-dot" style="background:' + dc + '"></span>' +
    '<span class="tag ' + tagClass(node.type) + '">' + tagLabel(node.type) + '</span>' +
    '<span class="gh-name' + (variant === 'current' ? ' gh-name--big' : '') + '">' + node.name + '</span>' +
    '<div class="inline-prog"><div class="inline-prog-f" style="width:' + (node.pct || 0) + '%;background:' + dc + '"></div></div>' +
    '<span class="gh-weight">' + (node.weight || '—') + '</span>' +
    '<div class="gh-action">' + actionHtml + '</div>';

  /* Шеврон — всегда разворачивает детали (peek), не навигирует */
  function toggleDetails() {
    if (!canExpand) return;
    expandedIds[node.id] = !expandedIds[node.id];
    var arr = document.getElementById('arr-' + node.id);
    var body = document.getElementById('body-' + node.id);
    if (arr) arr.classList.toggle('is-open', expandedIds[node.id]);
    if (body) body.classList.toggle('is-open', expandedIds[node.id]);
  }

  var chevron = hdr.querySelector('.gh-arrow');
  if (chevron) chevron.onclick = function (e) { e.stopPropagation(); toggleDetails(); };

  var upBtn = hdr.querySelector('.nav-up-btn');
  if (upBtn) upBtn.onclick = function (e) { e.stopPropagation(); navigateTo(node.id); };

  /* Клик по карточке:
     - parent  → подняться к родителю
     - child с детьми → провалиться внутрь
     - иначе   → раскрыть/свернуть детали */
  hdr.onclick = function (e) {
    if (e.target.closest('.gh-arrow') || e.target.closest('.copy-ic') ||
        e.target.closest('.nav-up-btn')) return;
    if (variant === 'parent') { navigateTo(node.id); return; }
    if (drillable) { navigateTo(node.id); return; }
    toggleDetails();
  };

  card.appendChild(hdr);

  /* Body */
  if (canExpand) {
    card.appendChild(divEl('goal-divider'));
    card.appendChild(buildBody(node, isOpen));
  }

  return card;
}

function divEl(cls) {
  var d = document.createElement('div');
  d.className = cls;
  return d;
}

function buildBody(node, isOpen) {
  var body = document.createElement('div');
  body.className = 'goal-body' + (isOpen ? ' is-open' : '');
  body.id = 'body-' + node.id;

  var dodHtml = (node.dod || []).map(function (line) {
    return line === '' ? '<br>' : '<div class="dod-line">' + line + '</div>';
  }).join('');

  var dosHtml = (node.dos || []).map(function (d) { return '<li>' + d + '</li>'; }).join('');
  var factColor = node.factVal && node.factVal !== '—' ? 'var(--gray-700)' : '#ababab';

  body.innerHTML =
    '<div class="two-col">' +
      '<div style="display:flex;flex-direction:column;gap:16px">' +
        '<div class="field">' +
          '<div class="field-label">Цель и ожидаемый результат (Definition of Success)</div>' +
          '<div class="field-val field-val--primary"><ul>' + dosHtml + '</ul></div>' +
        '</div>' +
        '<div class="field">' +
          '<div class="field-label">План действий (Definition of Done)</div>' +
          '<div class="field-val">' + dodHtml + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
          '<div class="field" style="max-width:280px">' +
            '<div class="field-label">Тип цели</div>' +
            '<div class="field-val">' + (node.goalType || '—') + '</div>' +
          '</div>' +
          '<div class="checkbox-row"><div class="checkbox-fake"></div>Обратный показатель ' +
            '<i class="ti ti-info-circle" style="font-size:15px;color:var(--gray-400);margin-left:4px"></i></div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:14px">' +
        '<div class="field"><div class="field-label">Вес, %</div><div class="field-val">' + (node.weightNum || '—') + '</div></div>' +
        '<div class="field"><div class="field-label">Стратегический приоритет</div><div class="field-val">' + (node.strategicPriority || '—') + '</div></div>' +
        '<div class="field"><div class="field-label">Период</div><div class="field-val">' + (node.period || '—') + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<div class="section-title">Оценка сотрудника</div>' +
      '<div class="assess-row">' +
        '<div class="field"><div class="field-label">План</div>' +
          '<div class="assess-val"><span>' + (node.planVal || '—') + '</span><span class="assess-unit">' + (node.planUnit || '') + '</span></div>' +
        '</div>' +
        '<div class="field"><div class="field-label">Факт</div>' +
          '<div class="assess-val"><span style="color:' + factColor + '">' + (node.factVal || '—') + '</span><span class="assess-unit">' + (node.factUnit || '') + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="field"><div class="field-label">Комментарий к результату</div>' +
        '<div class="assess-val" style="color:#ababab">' + (node.comment || 'Комментарий не внесён') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="divider-line"></div>' +
    '<button class="collapse-btn" data-collapse="' + node.id + '">Свернуть</button>';

  /* Кнопка «Свернуть» */
  var btn = body.querySelector('[data-collapse]');
  btn.onclick = function () {
    expandedIds[node.id] = false;
    var arr = document.getElementById('arr-' + node.id);
    if (arr) arr.classList.remove('is-open');
    body.classList.remove('is-open');
  };

  return body;
}

/* ───── Init ───── */
history.replaceState({ goalId: curId }, '', '?goalId=' + curId);
renderAll();
