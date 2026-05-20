# i18n update — Home, Sobre e Carreira

Este pacote mantém a convenção:

```txt
assets/main.js
assets/js/*.js
data/ui.pt-BR.json
data/ui.en-US.json
data/resume.pt-BR.json
data/resume.en-US.json
```

## Arquivos principais atualizados nesta rodada

- `carreira.html`
- `assets/main.js`
- `assets/js/career.js`
- `data/ui.pt-BR.json`
- `data/ui.en-US.json`

## Referência dos dados

As referências dos arquivos JSON ficam em `assets/js/config.js`:

```js
export const DATA_PATHS = {
  ui: (locale) => `data/ui.${locale}.json`,
  cv: (locale) => `data/resume.${locale}.json`,
};
```

Portanto:

```txt
pt-BR -> data/ui.pt-BR.json + data/resume.pt-BR.json
en-US -> data/ui.en-US.json + data/resume.en-US.json
```

## Página Carreira

`carreira.html` usa:

```html
<body data-page="career">
<script type="module" src="assets/main.js"></script>
```

O roteamento da página fica em `assets/main.js`, e a renderização específica da lista de experiências fica em `assets/js/career.js`.

## Regra seguida nesta rodada

Strings existentes em `ui.*.json` e `resume.*.json` não foram alteradas. Foram adicionadas apenas novas chaves necessárias para remover strings hardcoded do `carreira.html`.

## Language switcher

The language selector is rendered with `select[data-locale-switcher]` in `index.html`, `carreira.html`, and `sobre.html`.

Initial locale resolution is handled in `assets/js/i18n.js` by `getCurrentLocale()`:

1. `?lang=pt-BR` or `?lang=en-US` in the URL;
2. `localStorage.rafaz_locale`, only after the user manually changes the selector;
3. `navigator.languages` / `navigator.language`;
4. `DEFAULT_LOCALE` from `assets/js/config.js`.

Changing the selector persists the chosen locale and updates the current URL with `?lang=<locale>`.
