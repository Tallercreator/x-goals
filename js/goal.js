/* =========================================================================
   Страница цели — детальная карточка + панель + «Связанные цели».
   Зависимости: TREE, initials, goals-table.js, popup.js
   ========================================================================= */

/* ── Карта узлов дерева: id → { node, parent } ── */
var nodeMap = {};
(function buildMap(node, parent) {
  nodeMap[node.id] = { node: node, parent: parent };
  if (node.children) node.children.forEach(function (c) { buildMap(c, node); });
})(TREE, null);

/* ── Текущая цель ── */
var urlParams = new URLSearchParams(window.location.search);
var curId = urlParams.get('goalId') || 'g1';
if (!nodeMap[curId]) curId = 'g1';

/* ── Хелперы ── */
function typeClass(t) { return t === 'x' ? 'x' : t === 'ind' ? 'ind' : t === 'cmd' ? 'cmd' : 'project'; }
function tagClass(t) { return t === 'x' ? 'tag--x' : t === 'ind' ? 'tag--ind' : 'tag--cmd'; }
function tagLabel(t) { return t === 'x' ? 'Х-цель' : t === 'ind' ? 'Инд.' : 'Ком.'; }
function unitLabel(u) { return u === 'дн' ? 'Дни' : (u || '—'); }

function getAncestors(id) {
  var path = [], cur = nodeMap[id];
  while (cur) { path.unshift(cur.node); cur = cur.parent ? nodeMap[cur.parent.id] : null; }
  return path;
}

function goToGoal(id) {
  if (id) window.location.href = 'goal.html?goalId=' + id;
}

/* ── Хлебные крошки ── */
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
      span.innerHTML = '<span class="tag ' + tagClass(n.type) +
        '" style="font-size:9px;padding:1px 5px;margin-right:3px">' + tagLabel(n.type) + '</span>' + label;
      if (!isLast) span.onclick = (function (nid) { return function () { goToGoal(nid); }; })(n.id);
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

/* ── Карточка цели ── */
function renderCard() {
  var node = nodeMap[curId].node;

  document.getElementById('gc-title').textContent = node.name;
  document.getElementById('gc-dos').textContent = (node.dos || []).join('\n');
  document.getElementById('gc-dod').textContent = (node.dod || []).join('\n');
  document.getElementById('gc-type').textContent = node.goalType || '—';
  document.getElementById('gc-unit').textContent = unitLabel(node.planUnit);
  document.getElementById('gc-plan').textContent = node.planVal || '—';
  document.getElementById('gc-weight').textContent = node.weightNum ? node.weightNum + '%' : '—';
  document.getElementById('gc-period').textContent = node.period || '—';

  /* Панель: владелец */
  document.getElementById('sp-owner-ini').textContent = initials(node.owner || '');
  document.getElementById('sp-owner-name').textContent = node.owner || '—';
  document.getElementById('sp-owner-dept').textContent = node.dept || '';

  document.title = 'OTP Space — ' + node.name;
}

/* ── Сворачивание карточки ── */
function setupCardCollapse() {
  var body = document.getElementById('gd-body');
  var chevron = document.getElementById('gd-collapse');
  var collapseBtn = document.getElementById('gc-collapse-btn');

  function toggle() {
    var collapsed = body.hidden = !body.hidden;
    chevron.className = 'ti ti-chevron-' + (collapsed ? 'down' : 'up') + ' gd-collapse';
  }
  chevron.onclick = toggle;
  if (collapseBtn) collapseBtn.onclick = toggle;

  var add = document.getElementById('gc-add');
  if (add) add.onclick = function () { window.location.href = 'goal-form.html?type=ind'; };
}

/* ── Сворачивание «Связанных целей» ── */
function setupRelatedCollapse() {
  var head = document.getElementById('related-head');
  var chevron = document.getElementById('related-chevron');
  var area = document.getElementById('related-goals');
  head.onclick = function () {
    var collapsed = area.hidden = !area.hidden;
    chevron.className = 'ti ti-chevron-' + (collapsed ? 'right' : 'down') + ' related-chevron';
  };
}

/* ── Init ── */
renderBreadcrumb();
renderCard();
setupCardCollapse();
setupRelatedCollapse();

GoalsTable.mount({
  sectionId: 'related-goals',
  onNavigate: goToGoal,             /* клик по строке — на эту цель */
  expand: { pathTo: curId },        /* раскрыт квартал и ветка текущей цели */
});
