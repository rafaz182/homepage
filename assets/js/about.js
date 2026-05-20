import { setHref, setText } from "./dom.js";

export function renderAbout(cv, ui = {}) {
  if (!cv?.profile) return;

  renderSidebar(cv.profile);
  renderProfile(cv);
  renderStrengths(cv.profile);
  renderSpokenLanguages(cv.languages, cv.meta?.locale);
  renderSkills(cv.skills, ui);
  renderContact(cv.profile);
  renderFooterStack(cv.skills, ui);
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

function renderProfile(cv) {
  const { profile } = cv;

  setText("#bio-main", profile.bio || "—");
  setText("#bio-interests", profile.interests || "—");
}

function renderStrengths(profile) {
  const strengthsEl = document.getElementById("strengths");
  if (!strengthsEl) return;

  const strengths = Array.isArray(profile.strengths) ? profile.strengths : [];
  strengthsEl.textContent = strengths.length ? `${strengths.join(", ")}.` : "—";
}

function renderSpokenLanguages(languages = [], locale = "pt-BR") {
  const spokenLanguagesEl = document.getElementById("spoken-languages");
  if (!spokenLanguagesEl) return;

  const langText = languages
    .map((item) => `${item.language}: ${levelLabel(item.level, locale)}`)
    .join(" • ");

  spokenLanguagesEl.textContent = langText || "—";
}

function renderSkills(skills = {}, ui = {}) {
  const skillsEl = document.getElementById("skills-block");
  if (!skillsEl) return;

  const labels = ui?.skills || {};

  const rows = [
    { label: labels.languages || "languages", values: skills.languages },
    { label: labels.platforms || "platforms", values: skills.platforms },
    { label: labels.architecture || "architecture", values: skills.architecture },
    { label: labels.tools || "tools", values: skills.tools },
    { label: labels.practices || "practices", values: skills.practices },
  ];

  skillsEl.innerHTML = rows
    .filter((row) => Array.isArray(row.values) && row.values.length)
    .map((row) => `
      <p style="margin:4px 0;font-size:13px;">
        <span style="color:var(--muted);min-width:90px;display:inline-block;">${escapeHtml(row.label)}</span>
        ${escapeHtml(row.values.join(" • "))}
      </p>
    `)
    .join("") || "—";
}

function renderContact(profile) {
  const contactEl = document.getElementById("contact-block");
  if (!contactEl) return;

  const { links = {} } = profile;

  contactEl.innerHTML = [
    links.email ? `email: <a href="mailto:${escapeAttr(links.email)}">${escapeHtml(links.email)}</a>` : "",
    links.linkedin ? `linkedin: <a href="${escapeAttr(links.linkedin)}" rel="noreferrer">${escapeHtml(links.linkedin)}</a>` : "",
    links.github ? `github: <a href="${escapeAttr(links.github)}" rel="noreferrer">${escapeHtml(links.github)}</a>` : "",
  ].filter(Boolean).join("<br/>") || "—";
}

function renderFooterStack(skills = {}, ui = {}) {
  const languages = Array.isArray(skills.languages) ? skills.languages : [];
  const platforms = Array.isArray(skills.platforms) ? skills.platforms : [];
  const stackStr = [...languages, ...platforms].join(" • ");
  const prefix = ui?.footer?.stack || "stack";

  setText("#footer-stack", stackStr ? `${prefix}: ${stackStr}` : `${prefix}: —`);
}

function levelLabel(level, locale) {
  const normalized = String(level || "").toLowerCase().replace(/_/g, " ");

  const labels = {
    "pt-BR": {
      native: "nativo",
      fluent: "fluente",
      "full professional": "profissional completo",
      professional: "profissional",
      advanced: "avançado",
      intermediate: "intermediário",
    },
    "en-US": {
      native: "native",
      fluent: "fluent",
      "full professional": "full professional",
      professional: "professional",
      advanced: "advanced",
      intermediate: "intermediate",
    },
  };

  return labels[locale]?.[normalized] || labels["en-US"][normalized] || level;
}

function shortenUrl(url, prefix) {
  if (!url) return "—";
  return url.replace(prefix, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
