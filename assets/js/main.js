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

  // Show/hide profile button based on auth state
  const loginBtn = document.getElementById('loginBtn');
  const profileBtn = document.getElementById('profileBtn');
  const isAuth = localStorage.getItem('nagorik_auth') === 'true';
  const userData = JSON.parse(localStorage.getItem('nagorik_user') || '{}');

  if (loginBtn && profileBtn) {
    if (isAuth) {
      loginBtn.style.display = 'none';
      profileBtn.style.display = 'flex';
      // Update avatar with user initial
      if (userData.name) {
        profileBtn.innerHTML = `<span style="font-weight:700;font-size:14px;color:var(--red);">${userData.name.charAt(0).toUpperCase()}</span>`;
      }
    } else {
      loginBtn.style.display = 'inline-flex';
      profileBtn.style.display = 'none';
    }
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

  // "Home" link (#top) needs special handling:
  // 1. Browsers skip re-scrolling if the URL hash doesn't change (e.g. clicking
  //    Home twice in a row when the URL is already "...#top" does nothing by
  //    default) — so we intercept the click and scroll manually every time.
  // 2. The IntersectionObserver above only watches sections inside <main>,
  //    so it never re-activates "Home" on its own when scrolling back up —
  //    a plain scroll listener handles that instead.
  const homeLink = document.querySelector('.main-nav a[href="#top"]');
  if (homeLink && navLinks.length) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', window.location.pathname);
      navLinks.forEach(link => link.classList.remove('active'));
      homeLink.classList.add('active');
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY < 80) {
        navLinks.forEach(link => link.classList.remove('active'));
        homeLink.classList.add('active');
      }
    });
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
      // Get user name from form
      const nameInput = form.querySelector('#regName') || form.querySelector('#loginEmail');
      const userName = nameInput ? nameInput.value : 'Nagorik User';
      localStorage.setItem('nagorik_auth', 'true');
      localStorage.setItem('nagorik_user', JSON.stringify({ name: userName, email: form.querySelector('#loginEmail, #regEmail')?.value || '' }));
      const note = form.querySelector('.form-note');
      if (note) {
        note.textContent = 'Signed in — redirecting…';
        note.style.color = '#2E8B57';
      }
      const next = new URLSearchParams(window.location.search).get('next');
      setTimeout(() => {
        window.location.href = next || 'user.html';
      }, 500);
    });
  });
});