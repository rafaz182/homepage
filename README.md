# Atualização de labels do PDF

Este pacote atualiza a internacionalização do PDF gerado pelo site.

## Arquivos relevantes

- `assets/js/resume-pdf.js`
- `data/ui.pt-BR.json`
- `data/ui.en-US.json`

## O que mudou

O gerador de PDF deixou de usar labels fixas em inglês para seções e mensagens visíveis. Agora ele lê as labels de `ui.LOCALE.json`, na nova chave `pdf`.

Exemplo:

```json
"pdf": {
  "filenameSuffix": "Curriculo",
  "sections": {
    "experience": "Experiência",
    "education": "Formação",
    "skills": "Competências",
    "languages": "Idiomas"
  },
  "notes": {
    "recentExperience": "Exibindo as 5 experiências mais recentes · histórico completo em rafaz.dev/carreira"
  }
}
```

## Importante

As chaves abaixo não foram alteradas:

```json
"actions": {
  "downloadPdf": "...",
  "exportResume": "..."
}
```

## Convenção mantida

O currículo continua sendo carregado por locale em:

```js
cv: (locale) => `data/resume.${locale}.json`
```

Ou seja:

- `data/resume.pt-BR.json`
- `data/resume.en-US.json`
