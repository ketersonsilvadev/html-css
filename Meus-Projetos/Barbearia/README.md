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

## O que você PRECISA trocar antes de publicar

| O quê | Onde | Como achar |
|---|---|---|
| Número de WhatsApp | `js/script.js`, constante `NUMERO_WHATSAPP` (linha ~/9. RESUMO) | Formato `55DDDNUMERO`, só números |
| Número de WhatsApp (2x) | `index.html` — botão flutuante e rodapé (`href="https://wa.me/..."`) | busque por `wa.me` |
| Endereço, telefone, e-mail, horário | `index.html`, seção `#contato` | busque por `location__list` |
| Mapa | `index.html`, `iframe` da seção `#contato` | Google Maps → Compartilhar → Incorporar mapa → cole o `src` |
| Fotos reais (interior, cortes, barbeiros) | `index.html`, todas as tags `<img src="https://picsum.photos/...">` | troque o `src` pelo caminho da sua imagem, ex: `assets/img/corte-01.webp` |

Todas as imagens hoje são **placeholders** (serviço `picsum.photos`) com um filtro CSS
`duotone` que já aplica a identidade de cor da marca. Quando trocar por fotos reais,
o filtro continua funcionando — só recomendo já exportar as fotos em WebP (ver seu
checklist de otimização).

## Como o agendamento funciona (sem backend)

O sistema de agendamento é 100% front-end — não tem banco de dados. O fluxo:

1. Cliente escolhe serviço → barbeiro → data (calendário customizado em JS,
   com segunda-feira bloqueada) → horário (uma "agenda falsa" gerada por hash,
   pra simular horários ocupados sem precisar de servidor).
2. No passo final, ele preenche nome e telefone.
3. Ao clicar em **Confirmar no WhatsApp**, o JS monta uma mensagem de texto com
   tudo que foi escolhido e abre o WhatsApp Web/App com a mensagem pronta
   (`wa.me/numero?text=mensagem`).

Se um dia você quiser deixar isso "de verdade" (gravando o agendamento em algum lugar
antes de mandar pro WhatsApp), o próximo passo natural é plugar o Formspree ou EmailJS
que já estão na sua lista de ferramentas — ou uma função serverless simples salvando
num Google Sheets/Firebase. Dá pra fazer numa próxima sessão.

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

## Identidade visual (pra você reaproveitar o raciocínio em outros projetos)

- **Paleta**: preto fosco `#0b0a08`, grafite `#17140f`, madeira `#4a3324`,
  dourado envelhecido `#b08d57`/`#d9bd8a`, creme `#ede4d3`.
- **Tipografia**: Playfair Display (títulos, com itálico pra dar ar de alfaiataria),
  Inter (corpo de texto, neutro e legível), Space Mono (rótulos, preços, dados —
  reforça a ideia de "ficha técnica" de um ofício).
- **Elemento de assinatura**: a navalha em traço dourado, usada no logo, no hero
  em tamanho grande e como divisor entre seções — é o fio condutor visual que
  substitui o clichê de tesoura/pente que toda barbearia genérica usa.

Qualquer ajuste que quiser (paleta mais escura, trocar a fonte, adicionar
pagamento online, etc.), é só me chamar.
