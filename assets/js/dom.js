export function getByPath(obj, path) {
  return String(path)
    .split(".")
    .reduce((acc, key) => acc?.[key], obj);
}

export function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value != null) element.textContent = value;
}

export function setHref(selector, value) {
  const element = document.querySelector(selector);
  if (element && value != null) element.href = value;
}
