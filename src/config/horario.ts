import type { Excecao, Semana } from '../lib/horario.ts';
import { confirmado, type Bloqueante, type Confirmado } from './tipos.ts';

/**
 * Horário de atendimento (João, 04/11/2026): "fica aberta normalmente das 09 às 12 e das 14 às
 * 18h"; o atendimento é com avaliação individual e agendamento prévio. Os dias não vieram
 * explícitos: segunda a sexta, sábado e domingo fechados (conferir com a clínica).
 */
const DIA = [
  { abre: '09:00', fecha: '12:00' },
  { abre: '14:00', fecha: '18:00' },
] as const;
const semana: Confirmado<Semana> | Bloqueante = confirmado(
  { dom: [], seg: DIA, ter: DIA, qua: DIA, qui: DIA, sex: DIA, sab: [] },
  'João, 04/11/2026 (09–12 e 14–18; dias úteis por padrão)',
);

export const horario = {
  semana,
  /** Feriados, recessos e horários especiais (data local, AAAA-MM-DD). */
  excecoes: [] as readonly Excecao[],
  fuso: 'America/Sao_Paulo',
  /** Mostrado junto do horário: o atendimento é sempre agendado. */
  observacao: 'Atendimento com avaliação individual e agendamento prévio pelo WhatsApp.',
  /** O que o site mostra enquanto o horário não chega. */
  textoSemHorario: 'Horário pelo WhatsApp',
} as const;
