import { setHref, setText } from "./dom.js";

export function renderHome(cv) {
  if (!cv?.profile) return;

  renderSidebar(cv.profile);
  renderHero(cv);
  renderSchema(cv.profile);
}

function renderSidebar(profile) {
  const { name, title, location, links = {} } = profile;

  setText("#sidebar-name", name);
  setText("#sidebar-subtitle", [title, location].filter(Boolean).join(" • "));

  setText("#sidebar-email", links.email || "—");
  if (links.email) setHref("#sidebar-email", `mailto:${links.email}`);

  setText("#sidebar-linkedin", shortenUrl(links.linkedin, "https://linkedin.com"));
  setHref("#sidebar-linkedin", links.linkedin || "#");

  setText("#sidebar-github", shortenUrl(links.github, "https://github.com"));
  setHref("#sidebar-github", links.github || "#");
}

function renderHero(cv) {
  const { profile, experience = [], skills = {} } = cv;

  setText("#hero-name", profile.name);
  if (profile.bio) setText("#hero-sub", profile.bio);

  const current = experience.find((item) => item.endDate === null);
  if (current) {
    setText("#now-company", current.company);
    setText("#now-role", current.role);
  }

  const languages = Array.isArray(skills.languages) ? skills.languages : [];
  const platforms = Array.isArray(skills.platforms) ? skills.platforms : [];
  const stack = [...languages, ...platforms].join(" • ");

  if (stack) setText("#status-stack", stack);
}

function renderSchema(profile) {
  const schema = document.getElementById("schema-org");
  if (!schema) return;

  try {
    const json = JSON.parse(schema.textContent);
    json.name = profile.name;
    json.jobTitle = profile.title;
    json.sameAs = [profile.links?.linkedin, profile.links?.github].filter(Boolean);
    schema.textContent = JSON.stringify(json, null, 2);
  } catch (error) {
    console.warn("[schema-org] invalid JSON-LD", error);
  }
}

function shortenUrl(url, prefix) {
  if (!url) return "—";
  return url.replace(prefix, "");
}
