/* ===========================
   BLOGSPACE - main.js
   =========================== */

// ── Dark Mode ─────────────────────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ── User Dropdown ─────────────────────────────────────────────────────────
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');

if (userMenuBtn && userDropdown) {
  userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    userDropdown.classList.remove('show');
  });
}

// ── Mobile Menu ───────────────────────────────────────────────────────────
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('show');
  });
}

// ── Flash message auto-dismiss ────────────────────────────────────────────
const flash = document.querySelector('.flash');
if (flash) {
  setTimeout(() => {
    flash.style.transition = 'opacity 0.5s ease';
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 500);
  }, 4000);
}

// ── Password visibility toggle ────────────────────────────────────────────
document.querySelectorAll('.password-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁' : '🙈';
  });
});

// ── Word count & read time for post forms ─────────────────────────────────
const contentTextarea = document.getElementById('content');
const wordCountEl = document.getElementById('wordCount');
const readTimeEl = document.getElementById('readTimeEstimate');

if (contentTextarea && wordCountEl && readTimeEl) {
  function updateWordCount() {
    const text = contentTextarea.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    wordCountEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    readTimeEl.textContent = `~${readTime} min read`;
  }

  contentTextarea.addEventListener('input', updateWordCount);
  updateWordCount(); // run once on load (for edit page)
}

// ── Like button (AJAX) ────────────────────────────────────────────────────
const likeBtn = document.getElementById('likeBtn');
if (likeBtn) {
  likeBtn.addEventListener('click', async () => {
    const postId = likeBtn.dataset.postId;
    try {
      const res = await fetch(`/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      document.getElementById('likeCount').textContent = data.likes;
      likeBtn.classList.toggle('liked', data.isLiked);
      likeBtn.querySelector('.like-icon').textContent = data.isLiked ? '❤️' : '🤍';
    } catch (err) {
      console.error('Like error:', err);
    }
  });
}

// ── Dashboard tab filter ──────────────────────────────────────────────────
const filterTabs = document.querySelectorAll('.filter-tab');
if (filterTabs.length) {
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      const rows = document.querySelectorAll('.posts-table tbody tr');

      rows.forEach((row) => {
        const status = row.dataset.status;
        row.style.display = filter === 'all' || status === filter ? '' : 'none';
      });
    });
  });
}

// ── Settings smooth scroll ────────────────────────────────────────────────
document.querySelectorAll('.settings-nav-link[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.querySelectorAll('.settings-nav-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
  });
});
