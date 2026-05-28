(function () {
  // ── Año en footer ──
  document.getElementById('year').textContent = new Date().getFullYear();

  // ── Header: estado al hacer scroll ──
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Nav mobile: toggle ──
  const toggle = document.getElementById('nav-toggle');
  const panel  = document.getElementById('nav-panel');
  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // ── Nav: link activo según sección visible ──
  const links    = Array.from(document.querySelectorAll('.nav__link'));
  const sections = links
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  const setActive = () => {
    let activeIdx = -1;
    const y = window.scrollY + 120;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) activeIdx = i; });
    links.forEach((l, i) => l.classList.toggle('is-active', i === activeIdx));
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // ── Áreas de práctica: expandir / contraer ──
  document.querySelectorAll('.practice__item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.tagName === 'A') return;
      const wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.practice__item').forEach(i => i.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  // ── Reveal on scroll ──
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  // ── Email: copiar al portapapeles ──
  document.querySelectorAll('.email-copy').forEach(el => {
    const email   = el.dataset.email;
    const tooltip = el.querySelector('.email-copy__tooltip');
    let timer;

    el.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        tooltip.textContent = '¡Copiado!';
      } catch {
        // Fallback para navegadores sin permiso de clipboard
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        tooltip.textContent = '¡Copiado!';
      }

      tooltip.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(() => {
        tooltip.classList.remove('is-visible');
        tooltip.textContent = 'Copiar email';
      }, 2000);
    });

    el.addEventListener('mouseenter', () => {
      if (!tooltip.classList.contains('is-visible')) {
        tooltip.textContent = 'Copiar email';
      }
    });
  });

  // ── Formulario de contacto: validación ──
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  const validators = {
    name:    v => v.trim().length >= 2,
    phone:   v => /^[\d\s+()-]{7,}$/.test(v.trim()),
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    area:    v => v.trim().length > 0,
    message: v => v.trim().length >= 6,
  };

  const setError = (input, hasErr) => {
    input.closest('.field').classList.toggle('has-error', hasErr);
  };

  Object.keys(validators).forEach(name => {
    const input = form.elements[name];
    input.addEventListener('blur', () => {
      if (input.value !== '') setError(input, !validators[name](input.value));
    });
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('has-error')) {
        setError(input, !validators[name](input.value));
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    Object.keys(validators).forEach(name => {
      const input = form.elements[name];
      const valid = validators[name](input.value);
      setError(input, !valid);
      if (!valid && ok) { ok = false; input.focus(); }
    });
    if (ok) {
      form.style.display = 'none';
      success.classList.add('is-visible');
    }
  });
})();