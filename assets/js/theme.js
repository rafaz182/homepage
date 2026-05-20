import { STORAGE_KEYS } from "./config.js";

export function initTheme(ui) {
  setTheme(getPreferredTheme(), ui);

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark", ui);
    });
  });
}

function getPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === "dark" || saved === "light") return saved;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme, ui) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.theme, theme);

  const label = theme === "dark"
    ? ui?.actions?.themeDark || "theme: dark"
    : ui?.actions?.themeLight || "theme: light";

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(theme === "dark"));
    button.textContent = label;
  });

  document.querySelectorAll("[data-status-theme]").forEach((element) => {
    element.textContent = theme;
  });
}
