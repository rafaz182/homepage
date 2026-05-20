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
