export function initStatusbar() {
  const now = new Date();
  const last = document.querySelector("[data-status-last]");
  const tz = document.querySelector("[data-status-tz]");
  const year = document.querySelector("[data-current-year]");

  if (last) {
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    last.textContent = `${yyyy}-${mm}-${dd}`;
  }

  if (tz) tz.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  if (year) year.textContent = String(now.getFullYear());
}

export function initActiveNav() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  document.querySelectorAll("[data-nav]").forEach((anchor) => {
    const href = (anchor.getAttribute("href") || "").toLowerCase();
    const isActive = href === path || (path === "" && href === "index.html");
    anchor.classList.toggle("active", isActive);
  });
}
