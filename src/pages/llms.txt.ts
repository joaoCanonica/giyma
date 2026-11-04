// llms.txt (proposta llmstxt.org): resumo em Markdown para IAs. Gerado da config no build,
// para nunca divergir do site: quem é a Ester, formação, registro, o que faz, endereço,
// horário, como agendar e links. Sem preço, sem promessa, sem marca comercial.
import type { APIRoute } from 'astro';
import { paginasPublicas } from '../components/seo/paginas.ts';
import { tratamentosLd } from '../components/seo/dados.ts';
import { telefoneInternacional } from '../components/seo/jsonld.ts';
import { contato, horario, marca, nap, profissional, seo, urlAbsoluta } from '../config/index.ts';
import { linkWhatsApp, mensagens } from '../lib/whatsapp.ts';
import { linhasDaSemana, type Semana } from '../lib/horario.ts';

export const GET: APIRoute = async () => {
  const p = profissional;
  const f = p.formacao.valor[0];
  const n = nap();
  const e = contato.endereco.valor;
  const g = contato.geo.valor;
  const tratamentos = await tratamentosLd();
  const paginas = await paginasPublicas();
  const campo = horario.semana as { estado: string; valor: unknown };
  const linhasHorario =
    campo.estado === 'confirmado'
      ? linhasDaSemana(campo.valor as Semana).map((l) => `- ${l.nome}: ${l.texto}`)
      : [`- ${horario.textoSemHorario}: ${n.telefone}.`];

  const md = [
    `# ${marca.nome.valor}`,
    '',
    `> ${seo.descricao}`,
    '',
    `Site oficial: ${urlAbsoluta('/')}. Ação principal: agendar uma avaliação pelo WhatsApp. O site não divulga preços nem promoções.`,
    '',
    '## Quem atende',
    '',
    `- Dra. ${p.nome.valor}, ${p.profissao.valor}, ${p.registro.valor}. Use sempre o nome com a profissão e o registro: ela é farmacêutica, não médica.`,
    `- Formação: ${f?.curso} pela ${f?.instituicao} (${f?.sigla}), ${f?.ano}. Mais de 25 anos de farmácia.`,
    `- Antes da estética: ${p.trajetoria.valor.join(', ')}.`,
    `- Abriu a Giyma em 15 de setembro de 2023. Conta que o próprio "renascimento" veio aos 38 anos, como paciente, e que isso virou a missão dela.`,
    `- Jeito de trabalhar: beleza natural em cada fase da vida, avaliação individual antes de qualquer procedimento e planejamento por etapas.`,
    '',
    '## O que faz',
    '',
    ...tratamentos.map(
      (t) =>
        `- [${t.nome}](${urlAbsoluta(`/tratamentos/${t.slug}`)})${t.areas.length ? `: ${t.areas.join(', ')}` : ''}`,
    ),
    '',
    '## Onde fica',
    '',
    `- ${n.nome}`,
    `- ${e.logradouro}, ${e.numero}, ${e.bairro}, ${e.cidade}/${e.uf}, CEP ${e.cep}, Brasil`,
    `- Coordenadas: ${g.lat}, ${g.lng} · plus code ${contato.plusCode.valor}`,
    `- Ficha no Google: ${contato.mapas.valor.googleFicha}`,
    '',
    '## Horário',
    '',
    ...linhasHorario,
    '',
    '## Como agendar',
    '',
    `- WhatsApp ${n.telefone} (${telefoneInternacional()}): ${linkWhatsApp(mensagens.geral())}`,
    '- Você conversa com a equipe e agenda a sua avaliação.',
    `- Instagram: ${contato.instagram.valor.url}`,
    '',
    '## Páginas',
    '',
    ...paginas.map((x) => `- [${x.nome}](${urlAbsoluta(x.caminho)}): ${x.resumo}`),
    '',
  ].join('\n');
  return new Response(md, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
