// assets/main.js
(function () {
  const STORAGE_KEY = "rafaz_theme";

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.textContent = theme === "dark" ? "theme: dark" : "theme: light";
    }
    const themeText = document.querySelector("[data-status-theme]");
    if (themeText) themeText.textContent = theme;
  }

  function initThemeEarly() {
    // avoid flash by setting ASAP
    setTheme(getPreferredTheme());
  }

  function initToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  function initActiveNav() {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path) a.classList.add("active");
      if (path === "" && href === "index.html") a.classList.add("active");
    });
  }

  function initStatusbar() {
    const now = new Date();
    const last = document.querySelector("[data-status-last]");
    if (last) {
      // YYYY-MM-DD
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      last.textContent = `${yyyy}-${mm}-${dd}`;
    }
    const tz = document.querySelector("[data-status-tz]");
    if (tz) tz.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  }

  // Run
  initThemeEarly();
  window.addEventListener("DOMContentLoaded", () => {
    initToggle();
    initActiveNav();
    initStatusbar();
  });
})();
