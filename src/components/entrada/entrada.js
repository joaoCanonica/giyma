// A ENTRADA, "O FLORESCER" (≤ 2,6 s, uma vez por sessão). Inline no topo do <body>:
// a camada só existe se este JS a criar (sem JS, reduced-motion ou revisita: estado final).
// Tudo é criado em t0 (DOMContentLoaded) com atrasos: a linha do tempo é única e pode
// ser pausada/posicionada (?entrada=pausada expõe window.__entrada.seek(ms) para capturas).
(function () {
  var q = new URLSearchParams(location.search).get('entrada');
  var CHAVE = 'giyma-entrada';
  if (q === '0') return;
  if (q !== '1' && q !== 'pausada') {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      if (sessionStorage.getItem(CHAVE)) return;
      sessionStorage.setItem(CHAVE, '1');
    } catch {
      /* sem storage: segue, sem lembrar */
    }
  }

  var NS = 'http://www.w3.org/2000/svg';
  var CURVA = 'cubic-bezier(0.22, 0.61, 0.24, 1)';
  var ABRIR = 'cubic-bezier(0.6, 0, 0.2, 1)';
  var raiz = document.documentElement;
  raiz.setAttribute('data-entrada', '');

  function el(tag, cls, pai) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (pai) pai.appendChild(e);
    return e;
  }
  function caminho(d, pai) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('pathLength', '1');
    pai.appendChild(p);
    return p;
  }

  // ---------- camada ----------
  var camada = el('div', 'entrada');
  var metE = el('div', 'entrada-metade entrada-metade--e', camada);
  var metD = el('div', 'entrada-metade entrada-metade--d', camada);
  var pilha = el('div', 'entrada-pilha', camada);
  pilha.setAttribute('aria-hidden', 'true');
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '160 55 334 405');
  svg.setAttribute('class', 'entrada-monograma');
  var g = document.createElementNS(NS, 'g');
  svg.appendChild(g);
  pilha.appendChild(svg);
  // Monograma em partes, na ordem do desenho (curvas do giyma-logo-mark.svg).
  var haste = caminho('M327 443.5V360', g);
  var ladoE = caminho('M327 443.5H176.5V237', g);
  var arco = caminho('M176.5 222A150.5 150.5 0 0 1 477.5 222', g);
  var ladoD = caminho('M477.5 237V443.5H327', g);
  var folhas = [
    'M327 366C319 283.5 261.5 239.5 176.5 243.5',
    'M327 366C267 378 181.5 318.5 176.5 243.5',
    'M327 366C335 283.5 392.5 239.5 477.5 243.5',
    'M327 366C387 378 472.5 318.5 477.5 243.5',
  ].map(function (d) {
    return caminho(d, g);
  });
  var nome = el('span', 'entrada-nome', pilha);
  // Uma letra por span: o tracking "se fecha" com transform (sem mexer no layout, CLS 0).
  var letras = 'GIYMA'.split('').map(function (c) {
    var s = el('span', '', nome);
    s.textContent = c;
    return s;
  });
  var sub = el('span', 'entrada-sub', pilha);
  sub.textContent = 'SAÚDE E ESTÉTICA AVANÇADA';
  var pular = el('button', 'entrada-pular', camada);
  pular.type = 'button';
  pular.textContent = 'Pular';
  pular.setAttribute('aria-label', 'Pular a abertura');
  (document.body || raiz).prepend(camada);

  // ---------- fim e pular ----------
  var anims = [];
  var acabou = false;
  function fim(focar) {
    if (acabou) return;
    acabou = true;
    anims.forEach(function (a) {
      a.cancel();
    });
    camada.remove();
    raiz.removeAttribute('data-entrada');
    ['keydown', 'pointerdown', 'wheel', 'touchmove'].forEach(function (t) {
      removeEventListener(t, pularAgora, true);
    });
    if (focar) {
      var destino = document.querySelector('[data-entrada-destino]');
      if (destino) destino.focus({ preventScroll: true });
    }
  }
  function pularAgora(ev) {
    fim(ev && ev.target === pular && ev.type === 'keydown');
  }
  pular.addEventListener('click', function () {
    fim(true);
  });
  ['keydown', 'pointerdown', 'wheel', 'touchmove'].forEach(function (t) {
    addEventListener(t, pularAgora, { capture: true, passive: true });
  });

  // ---------- linha do tempo (ms desde t0) ----------
  // Saídas usam fill "forwards": um "both" preencheria para trás e venceria a entrada.
  function anima(alvo, quadros, inicio, duracao, curva, preenche) {
    var a = alvo.animate(quadros, {
      delay: inicio,
      duration: duracao,
      easing: curva || CURVA,
      fill: preenche || 'both',
    });
    anims.push(a);
    return a;
  }
  function desenha(p, inicio, duracao, curva) {
    return anima(
      p,
      [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      inicio,
      duracao,
      curva || 'linear',
    );
  }
  function elipse(cx, cy, rx, ry) {
    return (
      'M' +
      (cx - rx) +
      ' ' +
      cy +
      'A' +
      rx +
      ' ' +
      ry +
      ' 0 1 0 ' +
      (cx + rx) +
      ' ' +
      cy +
      'A' +
      rx +
      ' ' +
      ry +
      ' 0 1 0 ' +
      (cx - rx) +
      ' ' +
      cy +
      'Z'
    );
  }
  function metade(lado, W, H, t) {
    var w = W / 2;
    var d = t ? W * 0.12 : 0.1;
    var rx = t ? W * 1.05 : 0.1;
    var ry = t ? H * 1.35 : 0.1;
    var cx = lado === 'e' ? w - d : d;
    return "path(evenodd, 'M0 0H" + w + 'V' + H + 'H0Z' + elipse(cx, H / 2, rx, ry) + "')";
  }

  function comecar() {
    if (acabou) return;
    var W = innerWidth;
    var H = innerHeight;
    // 0,3–1,1 s: haste de baixo para cima; depois quadrado e arco num traço contínuo.
    desenha(haste, 300, 200, 'ease-in');
    desenha(ladoE, 500, 180);
    desenha(arco, 680, 240);
    desenha(ladoD, 920, 180, 'ease-out');
    // 1,1–1,6 s: as folhas crescem para os lados a partir do topo da haste; GIYMA fecha o tracking.
    folhas.forEach(function (f) {
      desenha(f, 1100, 500, CURVA);
    });
    anima(nome, [{ opacity: 0 }, { opacity: 1 }], 1150, 450);
    letras.forEach(function (l, i) {
      anima(
        l,
        [{ transform: 'translateX(' + (i - 2) * 0.55 + 'em)' }, { transform: 'none' }],
        1150,
        450,
      );
    });
    anima(sub, [{ opacity: 0 }, { opacity: 1 }], 1450, 300);
    // 1,6–2,6 s: a tela pérola se abre do centro para os lados em duas curvas.
    anima(
      metE,
      [{ clipPath: metade('e', W, H, 0) }, { clipPath: metade('e', W, H, 1) }],
      1600,
      1000,
      ABRIR,
    );
    anima(
      metD,
      [{ clipPath: metade('d', W, H, 0) }, { clipPath: metade('d', W, H, 1) }],
      1600,
      1000,
      ABRIR,
    );
    anima(nome, [{ opacity: 1 }, { opacity: 0 }], 1600, 300, CURVA, 'forwards');
    anima(sub, [{ opacity: 1 }, { opacity: 0 }], 1600, 250, CURVA, 'forwards');
    anima(pular, [{ opacity: 1 }, { opacity: 0 }], 2300, 300, 'linear', 'forwards');
    // O monograma encolhe e vai para o cabeçalho (FLIP com WAAPI).
    var destino = document.querySelector('[data-entrada-destino] svg g');
    var marca = document.querySelector('[data-entrada-destino]');
    if (destino) {
      var de = g.getBoundingClientRect();
      var para = destino.getBoundingClientRect();
      var caixa = svg.getBoundingClientRect();
      svg.style.transformOrigin = de.left - caixa.left + 'px ' + (de.top - caixa.top) + 'px';
      var s = para.width / de.width;
      anima(
        svg,
        [
          { transform: 'none' },
          {
            transform:
              'translate(' +
              (para.left - de.left) +
              'px,' +
              (para.top - de.top) +
              'px) scale(' +
              s +
              ')',
          },
        ],
        1700,
        800,
      );
      anima(svg, [{ opacity: 1 }, { opacity: 0 }], 2450, 150, 'linear', 'forwards');
    }
    var ultima = marca
      ? anima(marca, [{ opacity: 0 }, { opacity: 1 }], 2350, 250, 'linear')
      : anims[anims.length - 1];
    ultima.finished.then(
      function () {
        fim(false);
      },
      function () {},
    );

    if (q === 'pausada') {
      anims.forEach(function (a) {
        a.pause();
        a.currentTime = 0;
      });
      window.__entrada = {
        seek: function (ms) {
          anims.forEach(function (a) {
            a.currentTime = ms;
          });
        },
      };
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', comecar);
  else comecar();
})();
