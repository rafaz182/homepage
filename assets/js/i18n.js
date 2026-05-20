import { DEFAULT_LOCALE, SUPPORTED_LOCALES, STORAGE_KEYS } from "./config.js";
import { getByPath } from "./dom.js";

export function getCurrentLocale() {
  const params = new URLSearchParams(window.location.search);
  const urlLocale = normalizeLocale(params.get("lang"));
  const savedLocale = normalizeLocale(localStorage.getItem(STORAGE_KEYS.locale));
  const browserLocale = getBrowserLocale();

  if (SUPPORTED_LOCALES.includes(urlLocale)) return urlLocale;
  if (SUPPORTED_LOCALES.includes(savedLocale)) return savedLocale;
  if (SUPPORTED_LOCALES.includes(browserLocale)) return browserLocale;

  return DEFAULT_LOCALE;
}

export function getBrowserLocale() {
  const candidates = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (SUPPORTED_LOCALES.includes(normalized)) return normalized;
  }

  return DEFAULT_LOCALE;
}

export function normalizeLocale(locale) {
  if (!locale) return "";

  const exact = SUPPORTED_LOCALES.find((item) => item.toLowerCase() === locale.toLowerCase());
  if (exact) return exact;

  const language = locale.split("-")[0].toLowerCase();
  return SUPPORTED_LOCALES.find((item) => item.toLowerCase().startsWith(`${language}-`)) || "";
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
  document.querySelectorAll("[data-locale-switcher]").forEach((select) => {
    select.value = currentLocale;

    select.addEventListener("change", () => {
      changeLocale(select.value, currentLocale);
    });
  });

  // Compatibility with the old button-based implementation.
  document.querySelectorAll("[data-locale-switch]").forEach((button) => {
    const locale = button.dataset.localeSwitch;
    const isCurrent = locale === currentLocale;

    button.setAttribute("aria-pressed", String(isCurrent));
    button.classList.toggle("active", isCurrent);

    button.addEventListener("click", () => {
      changeLocale(locale, currentLocale);
    });
  });
}

function changeLocale(locale, currentLocale) {
  const normalized = normalizeLocale(locale);

  if (!SUPPORTED_LOCALES.includes(normalized)) return;
  if (normalized === currentLocale) return;

  localStorage.setItem(STORAGE_KEYS.locale, normalized);

  const url = new URL(window.location.href);
  url.searchParams.set("lang", normalized);
  window.location.href = url.toString();
}
