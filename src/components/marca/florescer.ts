// "O Florescer": evento (uma vez, ao entrar na tela), nunca progresso do scroll.
// (a) revelação: clip-path path() com duas elipses (as folhas) que se afastam do centro.
// (b) haste: o CSS anima quando [data-aberto] entra.

const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function elipse(cx: number, cy: number, rx: number, ry: number): string {
  const f = (n: number) => n.toFixed(1);
  return `M${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}Z`;
}

/** Duas folhas: começam finas junto à haste (centro) e se afastam até cobrir o bloco. */
function folhas(w: number, h: number, t: 0 | 1): string {
  const meio = w / 2;
  const [desloc, rx, ry] =
    t === 0 ? [w * 0.03, w * 0.03, h * 0.16] : [w * 0.15, w * 0.95, h * 1.25];
  return `path('${elipse(meio - desloc, h / 2, rx, ry)}${elipse(meio + desloc, h / 2, rx, ry)}')`;
}

function florescer(el: HTMLElement): void {
  el.dataset.florido = '';
  const alvo = el.querySelector<HTMLElement>(':scope > .florescer-alvo');
  if (!alvo || reduzido()) return;
  const { width: w, height: h } = alvo.getBoundingClientRect();
  if (!w || !h) return;
  const duracao = Number(el.dataset.duracao ?? 800);
  alvo.animate([{ clipPath: folhas(w, h, 0) }, { clipPath: folhas(w, h, 1) }], {
    duration: duracao,
    easing: 'cubic-bezier(0.22, 0.61, 0.24, 1)',
  });
}

const observador = new IntersectionObserver(
  (entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      observador.unobserve(el);
      if (el.hasAttribute('data-florescer')) florescer(el);
      else el.dataset.aberto = '';
    }
  },
  { threshold: 0.3, rootMargin: '0px 0px -8% 0px' },
);

for (const el of document.querySelectorAll<HTMLElement>(
  '[data-florescer]:not([data-florido]), [data-haste]:not([data-aberto])',
)) {
  observador.observe(el);
}
