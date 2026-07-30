/* =========================================================
   NAVALHA & OFÍCIO — script.js
   -----------------------------------------------------------
   Organização:
   1. Utilidades
   2. Header + menu mobile + barra de progresso
   3. Animação de entrada ao rolar (reveal)
   4. Contadores animados do hero
   5. Dados de serviços e barbeiros (fonte única de verdade)
   6. Sistema de agendamento (wizard de 5 passos)
   7. Calendário customizado
   8. Horários disponíveis
   9. Resumo + integração com WhatsApp
   10. Depoimentos (slider)
   11. Rodapé (ano automático)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ============ 1. UTILIDADES ============ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============ 2. HEADER + MENU MOBILE + BARRA DE PROGRESSO ============ */
  const header = $('#header');
  const scrollProgress = $('#scrollProgress');

  function onScroll(){
    // Header muda de aparência após pequeno scroll
    header.classList.toggle('is-scrolled', window.scrollY > 40);

    // Barra de progresso de leitura da página
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    scrollProgress.style.width = progresso + '%';
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navToggle = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  navToggle.addEventListener('click', () => {
    const aberto = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', aberto);
  });
  $$('.mobile-menu__link, .mobile-menu__cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============ 3. ANIMAÇÃO DE ENTRADA (REVEAL) ============ */
  const revealEls = $$('[data-reveal]');
  // Aplica um pequeno atraso escalonado dentro de cada seção (efeito cascata)
  const porSecao = {};
  revealEls.forEach(el => {
    const secao = el.closest('section') || el.parentElement;
    porSecao[secao] = porSecao[secao] || 0;
    el.style.setProperty('--i', porSecao[secao]);
    porSecao[secao]++;
  });

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting){
        entrada.target.classList.add('is-visible');
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));

  /* ============ 4. CONTADORES ANIMADOS DO HERO ============ */
  const contadores = $$('[data-count]');
  function animarContador(el){
    const alvo = parseFloat(el.dataset.count);
    const casasDecimais = parseInt(el.dataset.decimal || '0', 10);
    const duracao = 1600;
    const inicio = performance.now();

    function passo(agora){
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const facilitado = 1 - Math.pow(1 - progresso, 3); // ease-out cúbico
      const valor = alvo * facilitado;
      el.textContent = casasDecimais > 0
        ? valor.toFixed(casasDecimais)
        : Math.round(valor).toLocaleString('pt-BR');
      if (progresso < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  const heroStatsObserver = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting){
        contadores.forEach(animarContador);
        heroStatsObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  const heroStatsEl = $('.hero__stats');
  if (heroStatsEl) heroStatsObserver.observe(heroStatsEl);

  /* ============ 5. DADOS DE SERVIÇOS E BARBEIROS ============ */
  // Fonte única de dados usada para montar as opções do agendamento.
  // Mantém sincronia com os cartões estáticos exibidos nas seções "Serviços" e "Barbeiros".
  const servicesData = [
    { id: 'corte',        nome: 'Corte clássico',        preco: 65,  duracao: '45 min' },
    { id: 'barba',        nome: 'Barba completa',        preco: 55,  duracao: '30 min' },
    { id: 'combo',        nome: 'Combo Ofício',          preco: 105, duracao: '1h 20min' },
    { id: 'hidratacao',   nome: 'Hidratação capilar',    preco: 45,  duracao: '25 min' },
    { id: 'pigmentacao',  nome: 'Pigmentação de barba',  preco: 60,  duracao: '40 min' },
    { id: 'sobrancelha',  nome: 'Sobrancelha na navalha',preco: 25,  duracao: '15 min' },
  ];

  const barbersData = [
    { id: 'caue',   nome: 'Cauê Bastos',  especialidade: 'Navalha clássica' },
    { id: 'thales', nome: 'Thales Moura', especialidade: 'Especialista em barba' },
    { id: 'igor',   nome: 'Igor Prado',   especialidade: 'Cortes contemporâneos' },
  ];

  /* ============ 6. SISTEMA DE AGENDAMENTO ============ */
  const bookingCard   = $('.booking__card');
  const stepsEls       = $$('.booking__step', bookingCard);
  const panels         = $$('.booking__panel', bookingCard);
  const serviceOptions = $('#serviceOptions');
  const barberOptions  = $('#barberOptions');
  const slotOptions    = $('#slotOptions');

  // Estado central do agendamento
  const estado = {
    passo: 1,
    servico: null,
    barbeiro: null,
    data: null,       // objeto Date
    horario: null,
  };

  /* --- Renderiza cartões de serviço --- */
  servicesData.forEach(servico => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'option-card';
    card.dataset.id = servico.id;
    card.innerHTML = `
      <strong>${servico.nome}</strong>
      <span>${servico.duracao}</span>
      <em>R$ ${servico.preco}</em>
    `;
    card.addEventListener('click', () => {
      estado.servico = servico;
      $$('.option-card', serviceOptions).forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      habilitarProximo(1);
    });
    serviceOptions.appendChild(card);
  });

  /* --- Renderiza cartões de barbeiro --- */
  barbersData.forEach(barbeiro => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'option-card';
    card.dataset.id = barbeiro.id;
    card.innerHTML = `
      <strong>${barbeiro.nome}</strong>
      <span>${barbeiro.especialidade}</span>
    `;
    card.addEventListener('click', () => {
      estado.barbeiro = barbeiro;
      $$('.option-card', barberOptions).forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      habilitarProximo(2);
    });
    barberOptions.appendChild(card);
  });

  function habilitarProximo(passo){
    const painel = $(`.booking__panel[data-panel="${passo}"]`);
    const botao = $('[data-next]', painel);
    if (botao) botao.disabled = false;
  }

  /* --- Navegação entre passos --- */
  function irParaPasso(numero){
    estado.passo = numero;

    panels.forEach(p => p.classList.toggle('is-active', Number(p.dataset.panel) === numero));

    stepsEls.forEach(s => {
      const n = Number(s.dataset.step);
      s.classList.toggle('is-active', n === numero);
      s.classList.toggle('is-done', n < numero);
    });

    // Ao entrar no passo de horários, gera os slots para a data/barbeiro escolhidos
    if (numero === 4) renderizarHorarios();
    // Ao entrar na confirmação, monta o resumo
    if (numero === 5) montarResumo();

    bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $$('[data-next]', bookingCard).forEach(botao => {
    botao.addEventListener('click', () => irParaPasso(estado.passo + 1));
  });
  $$('[data-prev]', bookingCard).forEach(botao => {
    botao.addEventListener('click', () => irParaPasso(estado.passo - 1));
  });

  // Permite clicar diretamente num passo já concluído para editar a escolha
  stepsEls.forEach(s => {
    s.addEventListener('click', () => {
      const n = Number(s.dataset.step);
      if (s.classList.contains('is-done')) irParaPasso(n);
    });
  });

  /* ============ 7. CALENDÁRIO CUSTOMIZADO ============ */
  const calendarGrid = $('#calendarGrid');
  const calMonthLabel = $('#calMonthLabel');
  const calPrev = $('#calPrev');
  const calNext = $('#calNext');

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let mesExibido = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const nomesMeses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

  function renderizarCalendario(){
    calendarGrid.innerHTML = '';
    calMonthLabel.textContent = `${nomesMeses[mesExibido.getMonth()]} de ${mesExibido.getFullYear()}`;

    const primeiroDiaSemana = new Date(mesExibido.getFullYear(), mesExibido.getMonth(), 1).getDay();
    const totalDias = new Date(mesExibido.getFullYear(), mesExibido.getMonth() + 1, 0).getDate();

    // Espaços vazios antes do dia 1
    for (let i = 0; i < primeiroDiaSemana; i++){
      const vazio = document.createElement('span');
      vazio.className = 'calendar__day is-empty';
      calendarGrid.appendChild(vazio);
    }

    for (let dia = 1; dia <= totalDias; dia++){
      const dataAtual = new Date(mesExibido.getFullYear(), mesExibido.getMonth(), dia);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar__day';
      btn.textContent = dia;

      const ehPassado = dataAtual < hoje;
      const ehSegunda = dataAtual.getDay() === 1; // Barbearia fechada às segundas
      const indisponivel = ehPassado || ehSegunda;

      if (indisponivel) btn.classList.add('is-disabled');
      if (dataAtual.getTime() === hoje.getTime()) btn.classList.add('is-today');
      if (estado.data && dataAtual.getTime() === estado.data.getTime()) btn.classList.add('is-selected');

      if (!indisponivel){
        btn.addEventListener('click', () => {
          estado.data = dataAtual;
          estado.horario = null; // muda a data reinicia o horário escolhido
          renderizarCalendario();
          habilitarProximo(3);
        });
      }

      calendarGrid.appendChild(btn);
    }
  }

  calPrev.addEventListener('click', () => {
    mesExibido = new Date(mesExibido.getFullYear(), mesExibido.getMonth() - 1, 1);
    renderizarCalendario();
  });
  calNext.addEventListener('click', () => {
    mesExibido = new Date(mesExibido.getFullYear(), mesExibido.getMonth() + 1, 1);
    renderizarCalendario();
  });

  renderizarCalendario();

  /* ============ 8. HORÁRIOS DISPONÍVEIS ============ */
  const horariosBase = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

  // Gera uma "disponibilidade" determinística (mesma data + mesmo barbeiro = mesmos horários ocupados),
  // simulando uma agenda real sem precisar de backend.
  function horariosOcupados(dataISO, barbeiroId){
    const semente = `${dataISO}-${barbeiroId}`;
    let hash = 0;
    for (let i = 0; i < semente.length; i++){
      hash = (hash * 31 + semente.charCodeAt(i)) >>> 0;
    }
    return horariosBase.filter((_, i) => (hash >> i) % 5 === 0);
  }

  function renderizarHorarios(){
    slotOptions.innerHTML = '';
    if (!estado.data || !estado.barbeiro) return;

    const dataISO = estado.data.toISOString().slice(0, 10);
    const ocupados = horariosOcupados(dataISO, estado.barbeiro.id);

    horariosBase.forEach(horario => {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'slot';
      slot.textContent = horario;

      const ocupado = ocupados.includes(horario);
      if (ocupado){
        slot.classList.add('is-taken');
        slot.disabled = true;
      }
      if (estado.horario === horario) slot.classList.add('is-selected');

      slot.addEventListener('click', () => {
        estado.horario = horario;
        $$('.slot', slotOptions).forEach(s => s.classList.remove('is-selected'));
        slot.classList.add('is-selected');
        habilitarProximo(4);
      });

      slotOptions.appendChild(slot);
    });
  }

  /* ============ 9. RESUMO + INTEGRAÇÃO COM WHATSAPP ============ */
  const bookingForm = $('#bookingForm');
  const bookingSummary = $('#bookingSummary');
  const confirmBtn = $('#confirmWhatsApp');

  // TODO: substituir pelo número real da barbearia (formato: 55DDDNUMERO, apenas dígitos)
  const NUMERO_WHATSAPP = '5534900000000';

  function formatarDataExtenso(data){
    return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  }

  function montarResumo(){
    if (!estado.servico || !estado.barbeiro || !estado.data || !estado.horario) return;
    bookingSummary.innerHTML = `
      <div><strong>Serviço:</strong> ${estado.servico.nome} — R$ ${estado.servico.preco}</div>
      <div><strong>Barbeiro:</strong> ${estado.barbeiro.nome}</div>
      <div><strong>Data:</strong> ${formatarDataExtenso(estado.data)}</div>
      <div><strong>Horário:</strong> ${estado.horario}</div>
    `;
  }

  function validarCampo(input, regex){
    const field = input.closest('.field');
    const valido = regex ? regex.test(input.value.trim()) : input.value.trim().length > 1;
    field.classList.toggle('has-error', !valido);
    return valido;
  }

  confirmBtn.addEventListener('click', () => {
    const nomeInput = $('#clientName');
    const telInput = $('#clientPhone');
    const notaInput = $('#clientNote');

    const nomeValido = validarCampo(nomeInput);
    const telValido = validarCampo(telInput, /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/);

    if (!nomeValido || !telValido){
      const primeiroErro = $('.field.has-error', bookingForm);
      if (primeiroErro) primeiroErro.querySelector('input, textarea').focus();
      return;
    }

    const mensagem =
`Olá, Navalha & Ofício! Gostaria de confirmar meu agendamento:

Serviço: ${estado.servico.nome} (R$ ${estado.servico.preco})
Barbeiro: ${estado.barbeiro.nome}
Data: ${formatarDataExtenso(estado.data)}
Horário: ${estado.horario}

Nome: ${nomeInput.value.trim()}
Telefone: ${telInput.value.trim()}${notaInput.value.trim() ? `
Observação: ${notaInput.value.trim()}` : ''}`;

    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank', 'noopener');
  });

  /* ============ 10. DEPOIMENTOS (SLIDER) ============ */
  const track = $('#testimonialsTrack');
  const dotsContainer = $('#testimonialsDots');
  const slides = $$('.testimonial', track);
  let slideAtual = 0;
  let autoplayId;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ver depoimento ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => irParaSlide(i, true));
    dotsContainer.appendChild(dot);
  });
  const dots = $$('button', dotsContainer);

  function irParaSlide(indice, manual = false){
    slideAtual = indice;
    track.style.transform = `translateX(-${slideAtual * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === slideAtual));
    if (manual) reiniciarAutoplay();
  }

  function proximoSlide(){
    irParaSlide((slideAtual + 1) % slides.length);
  }

  function reiniciarAutoplay(){
    clearInterval(autoplayId);
    autoplayId = setInterval(proximoSlide, 6000);
  }
  reiniciarAutoplay();

  /* ============ 11. RODAPÉ — ANO AUTOMÁTICO ============ */
  $('#year').textContent = new Date().getFullYear();

});
