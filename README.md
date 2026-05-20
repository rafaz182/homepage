# i18n update package

Copie estes arquivos para a raiz do repositório, preservando a estrutura:

- `assets/main.js`
- `assets/js/*.js`
- `data/resume.pt-BR.json`
- `data/resume.en-US.json`
- `data/ui.pt-BR.json`
- `data/ui.en-US.json`
- `sobre.html`
- `index.html` se quiser aplicar também a Home já modularizada

A referência dos resumes fica em `assets/js/config.js`:

```js
export const DATA_PATHS = {
  ui: (locale) => `data/ui.${locale}.json`,
  cv: (locale) => `data/resume.${locale}.json`,
};
```

Com isso, para `pt-BR` o site carrega `data/resume.pt-BR.json`; para `en-US`, carrega `data/resume.en-US.json`.

Teste local:

```bash
python -m http.server 8000
```

URLs:

- `http://localhost:8000/index.html?lang=pt-BR`
- `http://localhost:8000/index.html?lang=en-US`
- `http://localhost:8000/sobre.html?lang=pt-BR`
- `http://localhost:8000/sobre.html?lang=en-US`
