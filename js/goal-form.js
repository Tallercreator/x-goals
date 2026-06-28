/* =========================================================================
   Страница создания цели — переключение полей по типу (ind | cmd),
   повторяемые исполнители для командной цели.
   ?type=ind | cmd
   ========================================================================= */
(function () {
  var params = new URLSearchParams(window.location.search);
  var type = params.get('type') === 'cmd' ? 'cmd' : 'ind';

  var isCmd = type === 'cmd';

  /* Заголовок + title вкладки */
  var title = document.getElementById('form-title');
  if (title) {
    title.textContent = isCmd ? 'Создание командной цели' : 'Создание индивидуальной цели';
  }
  document.title = 'OTP Space — ' + (isCmd ? 'Командная цель' : 'Индивидуальная цель');

  /* Показать нужный набор полей */
  var fieldsInd = document.getElementById('fields-ind');
  var fieldsCmd = document.getElementById('fields-cmd');
  if (fieldsInd) fieldsInd.hidden = isCmd;
  if (fieldsCmd) fieldsCmd.hidden = !isCmd;

  /* Текст кнопки submit */
  var submit = document.getElementById('f-submit');
  if (submit) submit.textContent = isCmd ? 'Добавить цель' : 'Создать цель';

  /* ── Навигация ── */
  function goBack() { window.location.href = 'index.html'; }

  var cancel = document.getElementById('f-cancel');
  if (cancel) cancel.onclick = goBack;
  if (submit) submit.onclick = goBack;   /* бэкенда нет */

  /* ── Повторяемые исполнители (командная цель) ── */
  var executors = document.getElementById('c-executors');
  var addBtn = document.getElementById('c-add-executor');

  function wireDelete(row) {
    var del = row.querySelector('.executor-del');
    if (del) del.onclick = function () {
      /* нельзя удалить последнюю строку */
      if (executors.querySelectorAll('.executor-row').length > 1) row.remove();
    };
  }

  if (executors) {
    executors.querySelectorAll('.executor-row').forEach(wireDelete);
  }

  if (addBtn && executors) {
    addBtn.onclick = function () {
      var first = executors.querySelector('.executor-row');
      var clone = first.cloneNode(true);
      /* очистить значение веса в новой строке */
      var w = clone.querySelector('input[type="text"]');
      if (w) w.value = '';
      executors.appendChild(clone);
      wireDelete(clone);
    };
  }
})();
