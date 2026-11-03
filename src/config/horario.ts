import type { Excecao, Semana } from '../lib/horario.ts';
import { bloqueante, type Bloqueante, type Confirmado } from './tipos.ts';

/**
 * Horário de atendimento. Não está no Google nem no Instagram: trava produção.
 * Quando chegar, trocar por confirmado({ dom: [], seg: [{ abre: '09:00', fecha: '18:00' }], ... }, fonte).
 */
const semana: Confirmado<Semana> | Bloqueante = bloqueante('horário não informado');

export const horario = {
  semana,
  /** Feriados, recessos e horários especiais (data local, AAAA-MM-DD). */
  excecoes: [] as readonly Excecao[],
  fuso: 'America/Sao_Paulo',
  /** O que o site mostra enquanto o horário não chega. */
  textoSemHorario: 'Horário pelo WhatsApp',
} as const;
