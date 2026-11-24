import { PREFIXO } from '../storage/storage';

export const CHAVE_DASHBOARD = `${PREFIXO}dashboard`;

/** Cartões do Dashboard na ordem padrão, com o título exibido em cada um. */
export const CARTOES_DASHBOARD = [
  { id: 'saldo', titulo: 'Saldo total atual' },
  { id: 'receitas', titulo: 'Receitas do mês' },
  { id: 'despesas', titulo: 'Despesas do mês' },
  { id: 'resultado', titulo: 'Resultado do mês' },
  { id: 'saude', titulo: 'Saúde financeira' },
  { id: 'despesas-categoria', titulo: 'Despesas por categoria' },
  { id: 'receitas-despesas', titulo: 'Receitas e despesas (6 meses)' },
  { id: 'orcamento', titulo: 'Orçamento do mês' },
  { id: 'metas', titulo: 'Metas ativas' },
  { id: 'projecao', titulo: 'Projeção do saldo' },
  { id: 'recorrencias', titulo: 'Recorrências usadas na projeção' },
] as const;

export type CartaoDashboardId = (typeof CARTOES_DASHBOARD)[number]['id'];

export interface PreferenciasDashboard {
  /** Todos os cartões, na ordem escolhida. */
  ordem: CartaoDashboardId[];
  /** Cartões que não devem ser exibidos. */
  ocultos: CartaoDashboardId[];
}

const IDS = CARTOES_DASHBOARD.map((cartao) => cartao.id);
const IDS_VALIDOS = new Set<string>(IDS);

export function preferenciasDashboardPadrao(): PreferenciasDashboard {
  return { ordem: [...IDS], ocultos: [] };
}

export function cartaoPorId(id: CartaoDashboardId) {
  return CARTOES_DASHBOARD.find((cartao) => cartao.id === id) as (typeof CARTOES_DASHBOARD)[number];
}

/** Mantém apenas ids conhecidos, sem repetição e na ordem em que aparecem. */
function lerIds(bruto: unknown): CartaoDashboardId[] {
  if (!Array.isArray(bruto)) return [];
  const vistos = new Set<string>();
  const ids: CartaoDashboardId[] = [];
  for (const item of bruto) {
    if (typeof item !== 'string' || !IDS_VALIDOS.has(item) || vistos.has(item)) continue;
    vistos.add(item);
    ids.push(item as CartaoDashboardId);
  }
  return ids;
}

/**
 * Lê as preferências do Dashboard. Dados ausentes ou malformados voltam ao padrão;
 * cartões novos entram visíveis ao final para não sumirem numa atualização do app.
 */
export function lerPreferenciasDashboard(storage: Storage): PreferenciasDashboard {
  try {
    const bruto: unknown = JSON.parse(storage.getItem(CHAVE_DASHBOARD) ?? 'null');
    if (typeof bruto !== 'object' || bruto === null) return preferenciasDashboardPadrao();
    const { ordem, ocultos } = bruto as { ordem?: unknown; ocultos?: unknown };
    const lidos = lerIds(ordem);
    const ordemFinal = lidos.length === 0 ? [...IDS] : [...lidos, ...IDS.filter((id) => !lidos.includes(id))];
    return { ordem: ordemFinal, ocultos: lerIds(ocultos) };
  } catch {
    return preferenciasDashboardPadrao();
  }
}

/** Grava as preferências; sem armazenamento disponível elas valem só até recarregar. */
export function gravarPreferenciasDashboard(prefs: PreferenciasDashboard, storage: Storage): void {
  try {
    storage.setItem(CHAVE_DASHBOARD, JSON.stringify(prefs));
  } catch {
    // Conveniência apenas: falha de gravação não deve atrapalhar o Dashboard.
  }
}

/** Troca um cartão de posição; nas extremidades a ordem não muda. */
export function moverCartao(ordem: CartaoDashboardId[], id: CartaoDashboardId, direcao: -1 | 1): CartaoDashboardId[] {
  const atual = ordem.indexOf(id);
  const destino = atual + direcao;
  if (atual < 0 || destino < 0 || destino >= ordem.length) return ordem;
  const nova = [...ordem];
  nova[atual] = ordem[destino];
  nova[destino] = id;
  return nova;
}

/** Leva um cartão para a posição do destino, inserindo-o antes dele. */
export function moverCartaoPara(ordem: CartaoDashboardId[], id: CartaoDashboardId, destino: CartaoDashboardId): CartaoDashboardId[] {
  const de = ordem.indexOf(id);
  const para = ordem.indexOf(destino);
  if (de < 0 || para < 0 || de === para) return ordem;
  const nova = [...ordem];
  nova.splice(de, 1);
  nova.splice(de < para ? para - 1 : para, 0, id);
  return nova;
}
