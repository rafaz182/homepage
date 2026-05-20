import { DATA_PATHS } from "./config.js";

export async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${path}: HTTP ${response.status}`);
  return response.json();
}

export async function loadSiteData(locale) {
  const [ui, cv] = await Promise.all([
    loadJson(DATA_PATHS.ui(locale)),
    loadJson(DATA_PATHS.cv(locale)),
  ]);

  return { ui, cv };
}
