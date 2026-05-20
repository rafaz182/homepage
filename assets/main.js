import { getCurrentLocale, applyI18n, initLocaleSwitcher } from "./js/i18n.js";
import { loadSiteData } from "./js/data-loader.js";
import { renderHome } from "./js/home.js";
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
  renderHome(cv);
  initResumePdfExport({ ui, locale });
}

main().catch((error) => {
  console.error("[site] failed to initialize", error);
});
