# rafaz.dev

Personal portfolio and résumé website for [rafaz.dev](https://rafaz.dev).

The project is a lightweight static site hosted on GitHub Pages. It uses plain HTML, CSS and JavaScript modules, with résumé data and UI strings separated into JSON files to support internationalization and easier content maintenance.

## Overview

This repository contains a simple personal homepage with:

- Home page with professional snapshot and current role.
- Career page rendered from structured résumé data.
- About page rendered from structured profile, skills, strengths and contact data.
- Internationalization support for Portuguese and English.
- Browser language detection with manual language switcher.
- Theme toggle with persisted preference.
- PDF résumé generation using the same localized résumé data.
- Static deployment compatible with GitHub Pages.

## Project structure

```txt
.
├── index.html
├── carreira.html
├── sobre.html
├── data/
│   ├── resume.pt-BR.json
│   ├── resume.en-US.json
│   ├── ui.pt-BR.json
│   └── ui.en-US.json
├── assets/
│   ├── main.js
│   ├── style.css
│   ├── favicon.svg
│   └── js/
│       ├── about.js
│       ├── career.js
│       ├── config.js
│       ├── data-loader.js
│       ├── dom.js
│       ├── home.js
│       ├── i18n.js
│       ├── resume-pdf.js
│       ├── statusbar.js
│       └── theme.js
└── README.md
```

## How it works

The site keeps page structure, UI labels and résumé content separated.

### HTML pages

The HTML files define the page layout and contain only the minimum static structure needed for rendering.

Pages use:

```html
<body data-page="home">
```

or:

```html
<body data-page="career">
<body data-page="about">
```

The value of `data-page` tells `assets/main.js` which renderer should be executed.

### JavaScript entrypoint

`assets/main.js` is the main entrypoint. It:

1. Resolves the current locale.
2. Loads the localized UI and résumé JSON files.
3. Applies translated UI strings.
4. Initializes theme, status bar, navigation and PDF export.
5. Dispatches rendering to the correct page module.

### Localized data

The site currently supports:

```txt
pt-BR
en-US
```

UI strings live in:

```txt
data/ui.pt-BR.json
data/ui.en-US.json
```

Résumé content lives in:

```txt
data/resume.pt-BR.json
data/resume.en-US.json
```

The paths are defined in:

```js
// assets/js/config.js
export const DATA_PATHS = {
  ui: (locale) => `data/ui.${locale}.json`,
  cv: (locale) => `data/resume.${locale}.json`,
};
```

## Internationalization

The locale resolution order is:

1. `?lang=pt-BR` or `?lang=en-US` from the URL.
2. The value saved in `localStorage`.
3. Browser language from `navigator.languages` or `navigator.language`.
4. Fallback locale defined in `assets/js/config.js`.

Example URLs:

```txt
https://rafaz.dev/?lang=pt-BR
https://rafaz.dev/?lang=en-US
```

The selected locale is persisted locally so returning visitors keep their preference.

## Adding new UI strings

Add new interface strings to both UI files:

```txt
data/ui.pt-BR.json
data/ui.en-US.json
```

Use `data-i18n` in HTML for text content:

```html
<span data-i18n="nav.home">Início</span>
```

Use `data-i18n-attr` for attributes:

```html
<button data-i18n-attr="aria-label:actions.languageSwitcherAria">
  ...
</button>
```

Do not store professional résumé content in `ui.*.json`. Use the résumé files for profile, experience, skills, languages, projects and SEO-related résumé data.

## Updating résumé content

Edit the localized résumé files:

```txt
data/resume.pt-BR.json
data/resume.en-US.json
```

The site reads the same structure for both locales. Keep both files aligned to avoid missing fields in one language.

Common sections include:

- `profile`
- `experience`
- `skills`
- `education`
- `certifications`
- `languages`
- `seo`
- `projects`

## PDF export

The résumé PDF is generated client-side using pdfmake.

PDF rendering lives in:

```txt
assets/js/resume-pdf.js
```

The PDF uses:

- localized résumé content from `resume.LOCALE.json`;
- localized labels from `ui.LOCALE.json`;
- the current locale selected in the site.

PDF-specific labels are stored under the `pdf` key in each UI file.

## Theme

Theme behavior is handled by:

```txt
assets/js/theme.js
```

The selected theme is persisted in `localStorage`. If no preference exists, the site follows the user's system preference.

## Running locally

Because the site uses JavaScript modules and `fetch()` to load JSON files, open it through a local HTTP server instead of opening `index.html` directly with `file://`.

From the repository root:

```bash
python -m http.server 8000
```

Then open:

```txt
http://localhost:8000
```

## Deployment

The site is designed to run on GitHub Pages.

Typical deployment flow:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

GitHub Pages will serve the static files directly.

## Development notes

- Keep `actions.downloadPdf` and `actions.exportResume` stable in `ui.*.json`, since they are used by the existing UI contract.
- Prefer adding new keys instead of changing existing ones when extending UI behavior.
- Keep `resume.pt-BR.json` and `resume.en-US.json` structurally equivalent.
- Avoid hardcoding user-facing strings in HTML or JavaScript.
- Use page-specific modules for page-specific rendering logic.
- Keep `assets/main.js` as a small orchestration layer.

## License

This is a personal portfolio project. Add a license if you intend to make the repository reusable by others.
