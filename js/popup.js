/* =========================================================================
   Поп-ап со-владельцев — общий между страницами.
   Использует position:fixed + getBoundingClientRect для авто-flip.
   ========================================================================= */
(function () {
  var timer = null;
  var activeId = null;

  window.showCoPopup = function (id, evt) {
    clearTimeout(timer);

    /* Закрываем предыдущий */
    if (activeId && activeId !== id) {
      var prev = document.getElementById(activeId);
      if (prev) prev.style.display = 'none';
    }
    activeId = id;

    var el = document.getElementById(id);
    if (!el) return;

    var rect = evt.currentTarget.getBoundingClientRect();
    var W = 300;

    /* Горизонтальное позиционирование с прижатием к viewport */
    var left = rect.left;
    if (left + W > window.innerWidth - 12) left = window.innerWidth - W - 12;
    if (left < 8) left = 8;

    el.style.display = 'block';
    el.style.left = left + 'px';

    /* Открываем вверх или вниз — куда больше места */
    var spaceAbove = rect.top;
    var spaceBelow = window.innerHeight - rect.bottom;
    if (spaceAbove > spaceBelow) {
      el.style.top = 'auto';
      el.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
    } else {
      el.style.bottom = 'auto';
      el.style.top = (rect.bottom + 6) + 'px';
    }
  };

  window.hideCoPopup = function (id) {
    timer = setTimeout(function () {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
      activeId = null;
    }, 150);
  };

  window.keepCoPopup = function () {
    clearTimeout(timer);
  };
})();
