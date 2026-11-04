// Marca um script que ainda não existe. Sai com código 1 de propósito:
// uma auditoria ausente nunca pode parecer aprovada.
export function pendente(nome, sessao, oQueFara) {
  console.error(`✗ ${nome}: ainda não implementado (${sessao}).\n  Vai: ${oQueFara}`);
  process.exit(1);
}
