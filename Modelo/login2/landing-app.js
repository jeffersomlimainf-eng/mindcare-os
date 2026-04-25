// Nav scrolled state
(function(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.style.boxShadow = '0 16px 40px -14px rgba(90, 30, 120, 0.22), inset 0 1px 0 rgba(255,255,255,0.9)';
    } else {
      nav.style.boxShadow = '0 10px 30px -14px rgba(90, 30, 120, 0.18), inset 0 1px 0 rgba(255,255,255,0.9)';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
