import { confirmado, opcional } from './tipos.ts';

const LAT = -27.819478;
const LNG = -50.3300233;

export const contato = {
  /** Funil único: só dígitos, com DDI. */
  whatsapp: confirmado('5549998273904', 'bio do Instagram e ficha do Google'),
  telefoneExibicao: confirmado('(49) 99827-3904', 'bio do Instagram e ficha do Google'),
  instagram: confirmado(
    { usuario: 'dra_estersantos', url: 'https://www.instagram.com/dra_estersantos/' },
    'perfil do Instagram (02/11/2026)',
  ),
  endereco: confirmado(
    {
      logradouro: 'Rua Rui Barbosa',
      numero: '277',
      bairro: 'Centro',
      cidade: 'Lages',
      uf: 'SC',
      cep: '88501-170',
      pais: 'BR',
    },
    'bio do Instagram e ficha do Google',
  ),
  geo: confirmado({ lat: LAT, lng: LNG }, 'ficha do Google (02/11/2026)'),
  plusCode: confirmado('5MJ9+6X', 'ficha do Google (02/11/2026)'),
  mapas: confirmado(
    {
      googleFicha: 'https://www.google.com/maps?cid=332599069459016165',
      googleRota: `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`,
      waze: `https://waze.com/ul?ll=${LAT},${LNG}&navigate=yes`,
      appleMapas: `https://maps.apple.com/?ll=${LAT},${LNG}&q=${encodeURIComponent('Giyma Saúde e Estética Avançada')}`,
    },
    'coordenadas e cid da ficha do Google',
  ),
  /** Instruções de chegada (referências, entrada). Vazio até a clínica mandar. */
  comoChegar: [] as readonly string[],
  estacionamento: opcional<string>(null),
} as const;

export function enderecoEmLinha(): string {
  const e = contato.endereco.valor;
  return `${e.logradouro}, ${e.numero}, ${e.bairro}, ${e.cidade}/${e.uf}, CEP ${e.cep}`;
}
