import { getCurrentLocale, applyI18n, initLocaleSwitcher } from "./js/i18n.js";
import { loadSiteData } from "./js/data-loader.js";
import { renderHome } from "./js/home.js";
import { renderAbout } from "./js/about.js";
import { initActiveNav, initStatusbar } from "./js/statusbar.js";
import { initTheme } from "./js/theme.js";
import { initResumePdfExport } from "./js/resume-pdf.js";

async function main() {
  const locale = getCurrentLocale();
  document.documentElement.lang = locale;

  const { ui, cv } = await loadSiteData(locale);

  applyI18n(ui);
  initTheme(ui);
  initLocaleSwitcher(locale);
  initActiveNav();
  initStatusbar();

  const page = getCurrentPage();

  if (page === "about") {
    renderAbout(cv, ui);
  } else {
    renderHome(cv);
  }

  initResumePdfExport({ ui, locale });
}

function getCurrentPage() {
  const explicitPage = document.body?.dataset?.page;
  if (explicitPage) return explicitPage;

  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  if (file === "sobre.html") return "about";
  if (file === "index.html" || file === "") return "home";

  return "home";
}

main().catch((error) => {
  console.error("[site] failed to initialize", error);
});
