(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || t === 'light') d.dataset.theme = t;
  } catch (e) {}
})();
