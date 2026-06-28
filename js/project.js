/* =========================================================================
   Страница X-проекта — правая панель со-владельцев, таблица целей, модалка.
   Зависимости: COOWNERS, QUARTERS, initials, popup.js, goals-table.js
   ========================================================================= */

/* ───────── Со-владельцы проекта (правая панель) ───────── */

var CO_VISIBLE = 3;     /* сколько со-владельцев видно до раскрытия */
var coOpen = false;

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


/* ───────── Переход на страницу цели ───────── */
function goToGoal(goalId, goalName) {
  var params = new URLSearchParams();
  params.set('goalId', goalId || 'g1');
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
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

  if (submitBtn) submitBtn.onclick = function () {
    var sel = modal.querySelector('input[name="goalType"]:checked');
    var type = sel ? sel.value : 'cmd';
    window.location.href = 'goal-form.html?type=' + type;
  };
})();


/* ───────── Init ───────── */
renderCoowners();
GoalsTable.mount({
  sectionId: 'goals-section',
  onNavigate: goToGoal,
  expand: 'first',          /* открыт только первый квартал */
});
