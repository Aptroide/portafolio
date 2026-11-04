  (function () {
    var top = document.querySelector('.top');
    if (!top || !window.ResizeObserver) return;
    new ResizeObserver(function () {
      document.documentElement.style.setProperty('--hdr', top.offsetHeight + 'px');
    }).observe(top);
  })();
