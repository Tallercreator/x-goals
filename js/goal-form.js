/* =========================================================================
   Страница создания цели — заголовок по типу, кнопки навигации.
   ?type=ind | cmd
   ========================================================================= */
(function () {
  var params = new URLSearchParams(window.location.search);
  var type = params.get('type') === 'cmd' ? 'cmd' : 'ind';

  var title = document.getElementById('form-title');
  if (title) {
    title.textContent = type === 'cmd'
      ? 'Создание командной цели'
      : 'Создание индивидуальной цели';
  }
  document.title = 'OTP Space — ' + (type === 'cmd' ? 'Командная цель' : 'Индивидуальная цель');

  function goBack() { window.location.href = 'index.html'; }

  var cancel = document.getElementById('f-cancel');
  if (cancel) cancel.onclick = goBack;

  var submit = document.getElementById('f-submit');
  if (submit) submit.onclick = function () {
    /* Заглушка: бэкенда нет — просто возвращаемся к проекту */
    goBack();
  };
})();
