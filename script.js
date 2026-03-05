(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth scroll with offset for sticky nav
  const nav = document.querySelector('.cocoa-nav');
  const navHeight = () => (nav ? nav.getBoundingClientRect().height : 0);

  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const top = window.scrollY + target.getBoundingClientRect().top - navHeight() - 10;
    window.scrollTo({ top, behavior: 'smooth' });

    // Close mobile nav after click
    const navCollapse = document.getElementById('nav');
    if (navCollapse && navCollapse.classList.contains('show') && window.bootstrap) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse);
      bsCollapse.hide();
    }
  });

  // Active link highlighting
  const sections = ['#challenge', '#solution', '#value', '#roadmap', '#partner']
    .map((id) => document.querySelector(id))
    .filter(Boolean);

  const navLinks = Array.from(document.querySelectorAll('.navbar .nav-link'));

  const setActive = (id) => {
    navLinks.forEach((l) => {
      const href = l.getAttribute('href');
      l.classList.toggle('active', href === id);
    });
  };

  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible && visible.target && visible.target.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: `-${Math.round(navHeight() + 20)}px 0px -60% 0px`, threshold: [0.15, 0.25, 0.4] }
    );

    sections.forEach((s) => io.observe(s));
  }

  // Lead form UX (client-only demo)
  const form = document.getElementById('leadForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        if (status) status.textContent = 'Please complete the required fields.';
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());

      // No backend wired; keep this non-destructive and clear
      if (status) {
        status.textContent = `Thanks, ${data.name || '—'} — we’ll respond to ${data.email || 'your email'} soon.`;
      }

      form.reset();
      form.classList.remove('was-validated');
    });
  }
})();
