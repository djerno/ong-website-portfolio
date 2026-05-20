/* EcoAction NGO — main.js
   - Mobile menu
   - FR/EN language toggle (uses window.EcoAction_I18N)
   - Sticky header shadow
   - Reveal-on-scroll
   - Animated counters
*/

(function(){
  'use strict';

  // ---------- Mobile burger ----------
  const burger = document.querySelector('[data-burger]');
  const nav = document.querySelector('[data-nav]');
  if (burger && nav){
    burger.addEventListener('click', ()=>{
      const open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
      });
    });
  }

  // ---------- Header shadow on scroll ----------
  const header = document.querySelector('.site-header');
  if (header){
    const onScroll = ()=>header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  // ---------- i18n ----------
  const STORAGE_KEY = 'EcoAction_lang';
  function applyLang(lang){
    const dict = (window.EcoAction_I18N || {})[lang];
    if (!dict) return;
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el=>{
      // data-i18n-attr="placeholder:newsletter.placeholder,aria-label:nav.home"
      el.getAttribute('data-i18n-attr').split(',').forEach(pair=>{
        const [attr,key] = pair.split(':').map(s=>s.trim());
        if (attr && key && dict[key] != null) el.setAttribute(attr, dict[key]);
      });
    });
    document.querySelectorAll('[data-lang-btn]').forEach(b=>{
      b.classList.toggle('active', b.getAttribute('data-lang-btn') === lang);
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === lang));
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch(e){}
  }
  document.querySelectorAll('[data-lang-btn]').forEach(b=>{
    b.addEventListener('click', ()=>applyLang(b.getAttribute('data-lang-btn')));
  });
  const saved = (function(){ try { return localStorage.getItem(STORAGE_KEY); } catch(e){ return null; } })();
  applyLang(saved === 'en' ? 'en' : 'fr');

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold: .12, rootMargin: '0px 0px -40px 0px'});
    revealEls.forEach(el=>io.observe(el));
  } else {
    revealEls.forEach(el=>el.classList.add('in'));
  }

  // ---------- Animated counters ----------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window){
    const fmt = new Intl.NumberFormat('fr-FR');
    const animate = (el)=>{
      const target = parseFloat(el.dataset.count) || 0;
      const dur = parseInt(el.dataset.duration || '1600', 10);
      const start = performance.now();
      const step = (now)=>{
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = Math.round(target * eased);
        el.textContent = fmt.format(v);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io2 = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting){ animate(e.target); io2.unobserve(e.target); }
      });
    }, {threshold: .4});
    counters.forEach(c=>io2.observe(c));
  }

  // ---------- Newsletter submit ----------
  const nlForm = document.querySelector('[data-newsletter]');
  if (nlForm){
    nlForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const btn = nlForm.querySelector('button');
      const original = btn.textContent;
      const lang = document.documentElement.getAttribute('lang') || 'fr';
      btn.textContent = lang === 'en' ? 'Sent ✓' : 'Envoyé ✓';
      btn.disabled = true;
      setTimeout(()=>{ btn.textContent = original; btn.disabled = false; nlForm.reset(); }, 2400);
    });
  }
})();
