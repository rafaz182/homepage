import { DEFAULT_LOCALE, SUPPORTED_LOCALES, STORAGE_KEYS } from "./config.js";
import { getByPath } from "./dom.js";

export function getCurrentLocale() {
  const params = new URLSearchParams(window.location.search);
  const urlLocale = params.get("lang");
  const savedLocale = localStorage.getItem(STORAGE_KEYS.locale);
  const browserLocale = normalizeLocale(navigator.language);

  if (SUPPORTED_LOCALES.includes(urlLocale)) return urlLocale;
  if (SUPPORTED_LOCALES.includes(savedLocale)) return savedLocale;
  if (SUPPORTED_LOCALES.includes(browserLocale)) return browserLocale;

  return DEFAULT_LOCALE;
}

export function normalizeLocale(locale) {
  if (!locale) return DEFAULT_LOCALE;
  const exact = SUPPORTED_LOCALES.find((item) => item.toLowerCase() === locale.toLowerCase());
  if (exact) return exact;

  const language = locale.split("-")[0].toLowerCase();
  return SUPPORTED_LOCALES.find((item) => item.toLowerCase().startsWith(`${language}-`)) || DEFAULT_LOCALE;
}

export function applyI18n(ui) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = getByPath(ui, element.dataset.i18n);
    if (value != null) element.textContent = value;
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const attrPairs = element.dataset.i18nAttr.split(",").map((item) => item.trim()).filter(Boolean);

    attrPairs.forEach((pair) => {
      const [attr, key] = pair.split(":").map((item) => item.trim());
      const value = getByPath(ui, key);
      if (attr && value != null) element.setAttribute(attr, value);
    });
  });
}

export function initLocaleSwitcher(currentLocale) {
  document.querySelectorAll("[data-locale-switch]").forEach((button) => {
    const locale = button.dataset.localeSwitch;
    const isCurrent = locale === currentLocale;

    button.setAttribute("aria-pressed", String(isCurrent));
    button.classList.toggle("active", isCurrent);

    button.addEventListener("click", () => {
      if (!SUPPORTED_LOCALES.includes(locale)) return;

      localStorage.setItem(STORAGE_KEYS.locale, locale);

      const url = new URL(window.location.href);
      url.searchParams.set("lang", locale);
      window.location.href = url.toString();
    });
  });
}
