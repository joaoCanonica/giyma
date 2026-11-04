import type { Excecao, Semana } from '../lib/horario.ts';
import { confirmado, type Bloqueante, type Confirmado } from './tipos.ts';

/**
 * Horário de atendimento (João, 04/11/2026): segunda a sexta, em horário comercial estendido,
 * frequentemente das 9h às 19h, conforme a agenda da Ester e o procedimento. A agenda é
 * personalizada: o site sempre pede para confirmar o horário antes de ir.
 */
const DIA = [{ abre: '09:00', fecha: '19:00' }] as const;
const semana: Confirmado<Semana> | Bloqueante = confirmado(
  { dom: [], seg: DIA, ter: DIA, qua: DIA, qui: DIA, sex: DIA, sab: [] },
  'João, 04/11/2026 (segunda a sexta, frequentemente 9h–19h, com agendamento)',
);

export const horario = {
  semana,
  /** Feriados, recessos e horários especiais (data local, AAAA-MM-DD). */
  excecoes: [] as readonly Excecao[],
  fuso: 'America/Sao_Paulo',
  /** Mostrado junto do horário: o atendimento é sempre agendado. */
  observacao:
    'A agenda é personalizada, com avaliação individual: confirme o seu horário pelo WhatsApp antes de vir.',
  /** O que o site mostra enquanto o horário não chega. */
  textoSemHorario: 'Horário pelo WhatsApp',
} as const;
