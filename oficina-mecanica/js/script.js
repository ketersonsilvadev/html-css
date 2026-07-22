

document.addEventListener('DOMContentLoaded', () => {
  ativarMenuMobile();
  marcarLinkAtivo();
  ativarRevelacaoNoScroll();
  ativarValidacaoDeFormulario();
});

function ativarMenuMobile() {
  const botao = document.getElementById('navToggle');
  const menu = document.getElementById('navMobile');
  if (!botao || !menu) return;

  botao.addEventListener('click', () => {
    const estaAberto = !menu.hasAttribute('hidden');
    if (estaAberto) {
      menu.setAttribute('hidden', '');
      botao.setAttribute('aria-expanded', 'false');
    } else {
      menu.removeAttribute('hidden');
      botao.setAttribute('aria-expanded', 'true');
    }
  });
}

function marcarLinkAtivo() {
  const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .nav-mobile a').forEach((link) => {
    const destino = link.getAttribute('href');
    if (destino === paginaAtual) {
      link.classList.add('ativo');
    }
  });
}

function ativarRevelacaoNoScroll() {
  const elementos = document.querySelectorAll('.revelar');
  if (!elementos.length) return;

  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('mostrar'));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('mostrar');
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elementos.forEach((el) => observador.observe(el));
}

function ativarValidacaoDeFormulario() {
  const form = document.getElementById('formContato');
  if (!form) return;

  const mensagemSucesso = document.getElementById('mensagemEnvio');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    let formularioValido = true;

    form.querySelectorAll('.erro').forEach((el) => (el.textContent = ''));

    formularioValido = validarCampo('nome', (valor) => valor.trim().length >= 2,
      'Digite seu nome completo.') && formularioValido;

    formularioValido = validarCampo('telefone', (valor) => valor.replace(/\D/g, '').length >= 10,
      'Digite um telefone válido com DDD.') && formularioValido;

    formularioValido = validarCampo('email', (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor),
      'Digite um e-mail válido.') && formularioValido;

    formularioValido = validarCampo('mensagem', (valor) => valor.trim().length >= 10,
      'Conte um pouco mais sobre o problema do veículo (mín. 10 caracteres).') && formularioValido;

    if (formularioValido) {

      form.reset();
      if (mensagemSucesso) {
        mensagemSucesso.textContent = 'Recebemos sua mensagem! Nossa equipe entra em contato em até 1 dia útil.';
        mensagemSucesso.classList.add('visivel');
      }
    } else if (mensagemSucesso) {
      mensagemSucesso.classList.remove('visivel');
    }
  });

  function validarCampo(idCampo, testeValido, textoErro) {
    const campo = document.getElementById(idCampo);
    if (!campo) return true;
    const erroEl = document.getElementById(`erro-${idCampo}`);
    const valido = testeValido(campo.value);
    if (!valido && erroEl) {
      erroEl.textContent = textoErro;
    }
    return valido;
  }
}
