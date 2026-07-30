# Navalha & Ofício — Barbearia Premium

Site completo de barbearia premium com sistema de agendamento integrado ao WhatsApp.

## Como rodar

1. Abra a pasta no VS Code.
2. Clique com o botão direito em `index.html` → **Open with Live Server**.
   (Ou dê duplo clique no arquivo — funciona sem servidor, mas o Live Server evita
   problemas de cache ao editar CSS/JS.)

## Estrutura de arquivos

```
navalha-oficio/
├── index.html          → todas as seções do site
├── css/
│   └── style.css        → tokens de design + todos os componentes + responsivo
├── js/
│   └── script.js         → menu, animações, agendamento, WhatsApp, depoimentos
└── README.md
```

Um único HTML com âncoras (`#sobre`, `#servicos` etc.) — é uma **landing page de página
única**, o padrão mais comum pra site de barbearia com agendamento.


## Checklist aplicado neste projeto

- ✅ `box-sizing: border-box` global
- ✅ Mobile-first via `clamp()` na tipografia + breakpoints em 1024px / 900px / 640px
- ✅ `background-attachment` não foi usado (evitei o bug do iOS Safari) — texturas do hero
  são `position: absolute` com gradientes, mais seguras em qualquer dispositivo
- ✅ Imagens com `alt` descritivo, `loading="lazy"`, `object-fit: cover`
- ✅ `:focus-visible` em todos os elementos interativos
- ✅ Contraste checado: texto claro sobre fundo escuro em toda a página
- ✅ `prefers-reduced-motion` respeitado (desliga animações se o usuário pedir)
- ✅ Nomenclatura de classes consistente (BEM: `.bloco__elemento--modificador`)
- ✅ Sem `!important` em nenhuma regra

