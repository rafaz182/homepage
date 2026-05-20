import { setHref, setText } from "./dom.js";

export function renderCareer(cv, ui = {}) {
  if (!cv?.profile) return;

  renderSidebar(cv.profile);
  renderExperienceList(cv.experience || [], ui);
  renderSource(cv.meta);
}

function renderSidebar(profile) {
  const { name, title, location, links = {} } = profile;

  setText("#sidebar-name", name);
  setText("#sidebar-subtitle", [title, location].filter(Boolean).join(" • "));
  setText("#sidebar-title", [title, location].filter(Boolean).join(" • "));

  setText("#sidebar-email", links.email || "—");
  if (links.email) setHref("#sidebar-email", `mailto:${links.email}`);

  setText("#sidebar-linkedin", shortenUrl(links.linkedin, "https://linkedin.com"));
  setHref("#sidebar-linkedin", links.linkedin || "#");

  setText("#sidebar-github", shortenUrl(links.github, "https://github.com"));
  setHref("#sidebar-github", links.github || "#");
}

function renderExperienceList(experience, ui = {}) {
  const list = document.getElementById("experience-list");
  if (!list) return;

  if (!Array.isArray(experience) || experience.length === 0) {
    list.innerHTML = "";
    const item = document.createElement("li");
    item.className = "item";

    const message = document.createElement("p");
    message.style.color = "var(--muted)";
    message.style.fontFamily = "var(--mono)";
    message.style.fontSize = "13px";
    message.textContent = ui?.career?.empty || "—";

    item.append(message);
    list.append(item);
    return;
  }

  list.innerHTML = "";
  experience.forEach((job) => list.append(createExperienceItem(job, ui)));
}

function createExperienceItem(job, ui = {}) {
  const item = document.createElement("li");
  item.className = "item";

  const title = document.createElement("h3");
  title.textContent = [job.company, job.role].filter(Boolean).join(" — ");
  item.append(title);

  const meta = document.createElement("div");
  meta.className = "meta";
  const period = `${formatDate(job.startDate, ui)} → ${formatDate(job.endDate, ui)}`;
  meta.textContent = [period, job.location].filter(Boolean).join(" • ");
  item.append(meta);

  const highlights = Array.isArray(job.highlights) ? job.highlights : [];
  if (highlights.length) {
    const highlightsList = document.createElement("ul");
    highlights.forEach((highlight) => {
      const li = document.createElement("li");
      li.textContent = highlight;
      highlightsList.append(li);
    });
    item.append(highlightsList);
  }

  const tags = Array.isArray(job.tags) ? job.tags : [];
  if (tags.length) {
    const chips = document.createElement("div");
    chips.className = "chips";

    tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = tag;
      chips.append(chip);
    });

    item.append(chips);
  }

  return item;
}

function renderSource(meta = {}) {
  const sourceEl = document.getElementById("cv-source");
  if (!sourceEl) return;

  if (meta?.source) sourceEl.href = meta.source;
}

function formatDate(dateStr, ui = {}) {
  if (!dateStr) return ui?.date?.present || "present";

  const [year, month] = String(dateStr).split("-");
  const monthIndex = Number.parseInt(month, 10) - 1;
  const months = ui?.date?.monthsShort || [];

  if (!year || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return dateStr;
  }

  const monthLabel = months[monthIndex] || month;
  return `${monthLabel}/${year}`;
}

function shortenUrl(url, prefix) {
  if (!url) return "—";
  return url.replace(prefix, "");
}
