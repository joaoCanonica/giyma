// Motor de horário: "aberto agora · fecha às 18h", "fechado · abre amanhã às 9h".
// Puro e testável: recebe o instante, a semana, as exceções e o fuso.

export type DiaSemana = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';
export const DIAS: readonly DiaSemana[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const NOMES_DIA: Record<DiaSemana, string> = {
  dom: 'domingo',
  seg: 'segunda',
  ter: 'terça',
  qua: 'quarta',
  qui: 'quinta',
  sex: 'sexta',
  sab: 'sábado',
};

/** "HH:MM", 24 h. Intervalo no mesmo dia (fecha > abre). */
export interface Intervalo {
  readonly abre: string;
  readonly fecha: string;
}
/** Dia sem intervalos = fechado. */
export type Semana = Readonly<Record<DiaSemana, readonly Intervalo[]>>;
export interface Excecao {
  /** Data local AAAA-MM-DD. */
  readonly data: string;
  /** Vazio = fechado o dia todo. */
  readonly intervalos: readonly Intervalo[];
  readonly motivo?: string;
}

export interface Abertura {
  /** Data local AAAA-MM-DD. */
  readonly data: string;
  readonly dia: DiaSemana;
  readonly hora: string;
  /** 0 = hoje, 1 = amanhã… */
  readonly emDias: number;
}

export type Estado =
  | { readonly aberto: true; readonly fechaAs: string; readonly depois: Abertura | null }
  | { readonly aberto: false; readonly abre: Abertura | null };

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function minutos(hhmm: string): number {
  const m = HHMM.exec(hhmm);
  if (!m) throw new Error(`hora inválida: "${hhmm}" (use HH:MM)`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Erros de configuração (vazio = ok). */
export function validarSemana(semana: Semana, excecoes: readonly Excecao[] = []): string[] {
  const erros: string[] = [];
  const conferir = (onde: string, lista: readonly Intervalo[]) => {
    const ordenados = [...lista].sort((a, b) => a.abre.localeCompare(b.abre));
    let fimAnterior = -1;
    for (const i of ordenados) {
      try {
        const a = minutos(i.abre);
        const f = minutos(i.fecha);
        if (f <= a)
          erros.push(`${onde}: fecha (${i.fecha}) precisa ser depois de abre (${i.abre})`);
        if (a < fimAnterior) erros.push(`${onde}: intervalos sobrepostos`);
        fimAnterior = f;
      } catch (e) {
        erros.push(`${onde}: ${(e as Error).message}`);
      }
    }
  };
  for (const d of DIAS) conferir(d, semana[d] ?? []);
  for (const e of excecoes) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.data)) erros.push(`exceção: data inválida "${e.data}"`);
    conferir(`exceção ${e.data}`, e.intervalos);
  }
  return erros;
}

interface Local {
  data: string;
  dia: DiaSemana;
  min: number;
}

/** Data, dia da semana e minuto do dia no fuso indicado. */
export function horaLocal(instante: Date, fuso: string): Local {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(instante);
  const p = (t: Intl.DateTimeFormatPartTypes) => partes.find((x) => x.type === t)?.value ?? '';
  const mapa: Record<string, DiaSemana> = {
    Sun: 'dom',
    Mon: 'seg',
    Tue: 'ter',
    Wed: 'qua',
    Thu: 'qui',
    Fri: 'sex',
    Sat: 'sab',
  };
  const dia = mapa[p('weekday')];
  if (!dia) throw new Error('dia da semana não reconhecido');
  return {
    data: `${p('year')}-${p('month')}-${p('day')}`,
    dia,
    min: Number(p('hour')) * 60 + Number(p('minute')),
  };
}

function somarDias(data: string, n: number): { data: string; dia: DiaSemana } {
  const [a, m, d] = data.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(a, m - 1, d + n));
  const iso = t.toISOString().slice(0, 10);
  return { data: iso, dia: DIAS[t.getUTCDay()] as DiaSemana };
}

function intervalosDoDia(
  data: string,
  dia: DiaSemana,
  semana: Semana,
  excecoes: readonly Excecao[],
) {
  const exc = excecoes.find((e) => e.data === data);
  const lista = exc ? exc.intervalos : (semana[dia] ?? []);
  return [...lista].sort((a, b) => minutos(a.abre) - minutos(b.abre));
}

/** Próxima abertura a partir de (data, minuto), procurando até 14 dias à frente. */
function proximaAbertura(
  local: Local,
  semana: Semana,
  excecoes: readonly Excecao[],
  aPartirDe: number,
): Abertura | null {
  for (let n = 0; n <= 14; n++) {
    const { data, dia } = n === 0 ? local : somarDias(local.data, n);
    for (const i of intervalosDoDia(data, dia, semana, excecoes)) {
      if (n > 0 || minutos(i.abre) >= aPartirDe) return { data, dia, hora: i.abre, emDias: n };
    }
  }
  return null;
}

export function estadoEm(
  instante: Date,
  semana: Semana,
  excecoes: readonly Excecao[] = [],
  fuso = 'America/Sao_Paulo',
): Estado {
  const local = horaLocal(instante, fuso);
  for (const i of intervalosDoDia(local.data, local.dia, semana, excecoes)) {
    const a = minutos(i.abre);
    const f = minutos(i.fecha);
    if (local.min >= a && local.min < f) {
      return {
        aberto: true,
        fechaAs: i.fecha,
        depois: proximaAbertura(local, semana, excecoes, f),
      };
    }
  }
  return { aberto: false, abre: proximaAbertura(local, semana, excecoes, local.min + 1) };
}

/** "9h", "9h30", "18h". */
export function formatarHora(hhmm: string): string {
  const [h, m] = hhmm.split(':') as [string, string];
  return `${Number(h)}h${m === '00' ? '' : m}`;
}

function quando(a: Abertura): string {
  if (a.emDias === 0) return `hoje às ${formatarHora(a.hora)}`;
  if (a.emDias === 1) return `amanhã às ${formatarHora(a.hora)}`;
  const nome = NOMES_DIA[a.dia];
  const art = a.dia === 'sab' || a.dia === 'dom' ? 'no' : 'na';
  return `${art} ${nome} às ${formatarHora(a.hora)}`;
}

/** Texto curto para a interface. */
export function descreverEstado(estado: Estado): string {
  if (estado.aberto) return `Aberto agora · fecha às ${formatarHora(estado.fechaAs)}`;
  if (!estado.abre) return 'Fechado';
  return `Fechado · abre ${quando(estado.abre)}`;
}

/** Linhas da tabela semanal: "segunda · 9h–12h, 14h–18h". Dias iguais não são agrupados aqui. */
export function linhasDaSemana(semana: Semana): { dia: DiaSemana; nome: string; texto: string }[] {
  const ordem: DiaSemana[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
  return ordem.map((dia) => {
    const lista = semana[dia] ?? [];
    return {
      dia,
      nome: NOMES_DIA[dia],
      texto: lista.length
        ? lista.map((i) => `${formatarHora(i.abre)}–${formatarHora(i.fecha)}`).join(', ')
        : 'fechado',
    };
  });
}
