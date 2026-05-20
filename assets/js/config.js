export const DEFAULT_LOCALE = "pt-BR";

export const SUPPORTED_LOCALES = ["pt-BR", "en-US"];

export const STORAGE_KEYS = {
  locale: "rafaz_locale",
  theme: "rafaz_theme",
};

export const DATA_PATHS = {
  ui: (locale) => `data/ui.${locale}.json`,
  cv: (locale) => `data/resume.${locale}.json`,
};
