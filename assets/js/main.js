// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  // Highlight in-page nav links while scrolling (index page only)
  const sections = document.querySelectorAll('main [id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(sec => observer.observe(sec));
  }

  // Any element marked data-requires-auth needs a logged-in session before
  // it's allowed to reach its destination (e.g. "Report an issue").
  document.querySelectorAll('[data-requires-auth]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = el.dataset.authTarget || el.getAttribute('href') || 'report.html';
      if (localStorage.getItem('nagorik_auth') !== 'true') {
        e.preventDefault();
        window.location.href = `login.html?next=${encodeURIComponent(target)}`;
      }
      // else: already authenticated, let the normal link/click proceed
    });
  });

  // Demo forms: prevent real submission, show a lightweight confirmation
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.form-note');
      if (note) {
        note.textContent = form.dataset.successMessage || 'Submitted. Thank you.';
        note.style.color = '#2E8B57';
      }
    });
  });

  // Login / Register tab switcher (login.html)
  const authTabs = document.querySelectorAll('.auth-tabs button');
  const authPanels = document.querySelectorAll('.auth-panel');
  if (authTabs.length && authPanels.length) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        authPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`.auth-panel[data-panel="${tab.dataset.tab}"]`).classList.add('active');
      });
    });
  }

  // Login / Register forms: on "submit", store a demo session and return
  // the visitor to wherever they were trying to go (?next=...), or the feed.
  document.querySelectorAll('form[data-auth-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('nagorik_auth', 'true');
      const note = form.querySelector('.form-note');
      if (note) {
        note.textContent = 'Signed in — redirecting…';
        note.style.color = '#2E8B57';
      }
      const next = new URLSearchParams(window.location.search).get('next');
      setTimeout(() => {
        window.location.href = next || 'browse_feed.html';
      }, 500);
    });
  });
});