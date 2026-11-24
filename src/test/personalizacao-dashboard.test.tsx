import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { gerarExemplo } from '../data/exemplo';
import { hojeISO } from '../domain/date';
import {
  CARTOES_DASHBOARD,
  CHAVE_DASHBOARD,
  lerPreferenciasDashboard,
  moverCartaoPara,
  preferenciasDashboardPadrao,
  type PreferenciasDashboard,
} from '../lib/dashboard';
import { CHAVE_ESTADO } from '../storage/storage';
import { construirEstado, renderizarApp } from './helpers';

const HOJE = hojeISO();
const TODOS = CARTOES_DASHBOARD.map((cartao) => cartao.id);
const estado = () => gerarExemplo(HOJE);

function idsVisiveis(): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-cartao]')).map((el) => el.dataset.cartao as string);
}

function cartao(id: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-cartao="${id}"]`) as HTMLElement;
}

function anuncio(): string | undefined {
  return document.querySelector('.dashboard .sr-somente')?.textContent ?? undefined;
}

function gravarPrefs(prefs: PreferenciasDashboard) {
  localStorage.setItem(CHAVE_DASHBOARD, JSON.stringify(prefs));
}

async function entrarEmEdicao(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(screen.getByRole('button', { name: 'Personalizar' }));
}

function arrastar(idArrastado: string, idDestino: string) {
  const arrastado = cartao(idArrastado);
  const destino = cartao(idDestino);
  fireEvent.dragStart(arrastado);
  fireEvent.dragOver(destino);
  fireEvent.drop(destino);
}

describe('dashboard personalizável na própria tela', () => {
  it('entra e sai do modo de edição, expondo controles e estados acessíveis', async () => {
    const usuario = userEvent.setup();
    renderizarApp('/', estado());

    const botao = screen.getByRole('button', { name: 'Personalizar' });
    expect(botao).toHaveTextContent('✎');
    expect(botao).toHaveAttribute('aria-pressed', 'false');
    expect(idsVisiveis()).toHaveLength(TODOS.length);
    expect(screen.queryByRole('button', { name: 'Ocultar Saldo total atual' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Modo de personalização' })).not.toBeInTheDocument();

    await usuario.click(botao);
    expect(botao).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('region', { name: 'Modo de personalização' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(idsVisiveis()).toHaveLength(TODOS.length);
    expect(cartao('saldo')).toHaveAttribute('draggable', 'true');
    expect(screen.getByRole('button', { name: 'Mover Saldo total atual para cima' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mover Recorrências usadas na projeção para baixo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Ocultar Saldo total atual' })).toBeInTheDocument();

    await usuario.click(botao);
    expect(botao).toHaveAttribute('aria-pressed', 'false');
    expect(cartao('saldo')).toHaveAttribute('draggable', 'false');
    expect(screen.queryByRole('button', { name: 'Ocultar Saldo total atual' })).not.toBeInTheDocument();
  });

  it('arrasta para cima e para baixo, destaca origem e destino e persiste a ordem completa', async () => {
    const usuario = userEvent.setup();
    const primeira = renderizarApp('/', estado());
    await entrarEmEdicao(usuario);

    fireEvent.dragStart(cartao('projecao'));
    expect(cartao('projecao').className).toContain('dashboard__cartao--arrastando');
    fireEvent.dragOver(cartao('metas'));
    expect(cartao('metas').className).toContain('dashboard__cartao--alvo');
    fireEvent.drop(cartao('metas'));
    expect(cartao('projecao').className).not.toContain('dashboard__cartao--arrastando');
    expect(cartao('metas').className).not.toContain('dashboard__cartao--alvo');
    expect(idsVisiveis().slice(7, 10)).toEqual(['orcamento', 'projecao', 'metas']);
    expect(anuncio()).toBe('Cartão Projeção do saldo movido para a posição 9.');

    arrastar('saldo', 'despesas');
    expect(idsVisiveis().slice(0, 4)).toEqual(['receitas', 'saldo', 'despesas', 'resultado']);
    expect(anuncio()).toBe('Cartão Saldo total atual movido para a posição 2.');

    const antesDoAutoArrasto = localStorage.getItem(CHAVE_DASHBOARD);
    arrastar('saude', 'saude');
    expect(localStorage.getItem(CHAVE_DASHBOARD)).toBe(antesDoAutoArrasto);
    expect(anuncio()).toBe('Cartão Saldo total atual movido para a posição 2.');

    const ordemFinal = idsVisiveis();
    primeira.unmount();
    renderizarApp('/', estado());
    expect(idsVisiveis()).toEqual(ordemFinal);
  });

  it('move com as setas, mantém o foco e atualiza o anúncio', async () => {
    const usuario = userEvent.setup();
    renderizarApp('/', estado());
    await entrarEmEdicao(usuario);

    const subir = screen.getByRole('button', { name: 'Mover Projeção do saldo para cima' });
    subir.focus();
    await usuario.click(subir);
    expect(document.activeElement).toBe(subir);
    expect(idsVisiveis().slice(7, 10)).toEqual(['orcamento', 'projecao', 'metas']);
    expect(anuncio()).toBe('Cartão Projeção do saldo movido para a posição 9.');

    const descer = screen.getByRole('button', { name: 'Mover Saldo total atual para baixo' });
    descer.focus();
    await usuario.click(descer);
    expect(document.activeElement).toBe(descer);
    expect(idsVisiveis().slice(0, 3)).toEqual(['receitas', 'saldo', 'despesas']);
    expect(anuncio()).toBe('Cartão Saldo total atual movido para a posição 2.');
  });

  it('oculta, reordena e mostra o cartão de volta na posição relativa, persistindo tudo', async () => {
    const usuario = userEvent.setup();
    const primeira = renderizarApp('/', estado());
    await entrarEmEdicao(usuario);

    await usuario.click(screen.getByRole('button', { name: 'Ocultar Despesas por categoria' }));
    expect(cartao('despesas-categoria')).toBeNull();
    expect(anuncio()).toBe('Cartão Despesas por categoria oculto.');
    const ocultos = screen.getByRole('region', { name: 'Cartões ocultos' });
    expect(within(ocultos).getByText('Despesas por categoria')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.queryByRole('region', { name: 'Cartões ocultos' })).not.toBeInTheDocument();
    expect(cartao('despesas-categoria')).toBeNull();
    await entrarEmEdicao(usuario);

    arrastar('recorrencias', 'saldo');
    expect(idsVisiveis()[0]).toBe('recorrencias');
    await usuario.click(screen.getByRole('button', { name: 'Mostrar Despesas por categoria' }));
    expect(idsVisiveis()).toEqual([
      'recorrencias',
      'saldo',
      'receitas',
      'despesas',
      'resultado',
      'saude',
      'despesas-categoria',
      'receitas-despesas',
      'orcamento',
      'metas',
      'projecao',
    ]);
    expect(screen.queryByRole('region', { name: 'Cartões ocultos' })).not.toBeInTheDocument();

    const ordemFinal = idsVisiveis();
    primeira.unmount();
    renderizarApp('/', estado());
    expect(idsVisiveis()).toEqual(ordemFinal);
    expect(screen.queryByRole('region', { name: 'Cartões ocultos' })).not.toBeInTheDocument();
  });

  it('restaura a ordem padrão a partir de uma preferência alterada', async () => {
    const usuario = userEvent.setup();
    gravarPrefs({ ordem: [...TODOS].reverse(), ocultos: ['saldo', 'metas'] });
    renderizarApp('/', estado());
    await entrarEmEdicao(usuario);

    expect(idsVisiveis()[0]).toBe('recorrencias');
    const ocultos = screen.getByRole('region', { name: 'Cartões ocultos' });
    expect(within(ocultos).getByText('Saldo total atual')).toBeInTheDocument();
    expect(within(ocultos).getByText('Metas ativas')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Restaurar padrão' }));
    expect(idsVisiveis()).toEqual(TODOS);
    expect(screen.queryByRole('region', { name: 'Cartões ocultos' })).not.toBeInTheDocument();
    expect(lerPreferenciasDashboard(localStorage)).toEqual(preferenciasDashboardPadrao());
    expect(anuncio()).toBe('Preferências do dashboard restauradas.');
  });

  it('trata todos os cartões ocultos fora e dentro do modo de edição', async () => {
    const usuario = userEvent.setup();
    gravarPrefs({ ordem: TODOS, ocultos: TODOS });
    const primeira = renderizarApp('/', estado());

    expect(screen.getByText(/Todos os cartões estão ocultos/)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Cartões do dashboard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Cartões ocultos' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Mês' })).toBeInTheDocument();

    await entrarEmEdicao(usuario);
    const ocultos = screen.getByRole('region', { name: 'Cartões ocultos' });
    expect(within(ocultos).getAllByRole('listitem')).toHaveLength(TODOS.length);
    expect(screen.queryByRole('group', { name: 'Cartões do dashboard' })).not.toBeInTheDocument();

    await usuario.click(within(ocultos).getByRole('button', { name: 'Mostrar Saldo total atual' }));
    expect(idsVisiveis()).toEqual(['saldo']);
    expect(cartao('saldo')).toHaveAttribute('draggable', 'true');
    expect(within(ocultos).getAllByRole('listitem')).toHaveLength(TODOS.length - 1);
    expect(JSON.parse(localStorage.getItem(CHAVE_DASHBOARD) ?? '{}').ocultos).not.toContain('saldo');

    await usuario.click(screen.getByRole('button', { name: 'Restaurar padrão' }));
    expect(idsVisiveis()).toEqual(TODOS);
    expect(screen.queryByRole('region', { name: 'Cartões ocultos' })).not.toBeInTheDocument();
    primeira.unmount();
  });

  it('normaliza preferências inválidas sem perder cartões conhecidos', () => {
    const padrao = preferenciasDashboardPadrao();
    const casos: Array<{ nome: string; bruto: string | null; esperado: PreferenciasDashboard }> = [
      { nome: 'sem chave', bruto: null, esperado: padrao },
      { nome: 'JSON inválido', bruto: '{quebrado', esperado: padrao },
      { nome: 'campos com tipo errado', bruto: JSON.stringify({ ordem: 'saldo', ocultos: 3 }), esperado: padrao },
      { nome: 'ordem vazia', bruto: JSON.stringify({ ordem: [], ocultos: [] }), esperado: padrao },
      {
        nome: 'ids desconhecidos e duplicados',
        bruto: JSON.stringify({ ordem: ['metas', 'x', 'metas'], ocultos: ['metas', 'x', 'metas'] }),
        esperado: { ordem: ['metas', ...TODOS.filter((id) => id !== 'metas')], ocultos: ['metas'] },
      },
      {
        nome: 'cartões faltando entram visíveis no fim',
        bruto: JSON.stringify({ ordem: ['despesas', 'metas'], ocultos: ['despesas-categoria'] }),
        esperado: {
          ordem: ['despesas', 'metas', ...TODOS.filter((id) => id !== 'despesas' && id !== 'metas')],
          ocultos: ['despesas-categoria'],
        },
      },
    ];

    for (const caso of casos) {
      if (caso.bruto === null) localStorage.removeItem(CHAVE_DASHBOARD);
      else localStorage.setItem(CHAVE_DASHBOARD, caso.bruto);
      expect(lerPreferenciasDashboard(localStorage), caso.nome).toEqual(caso.esperado);
    }

    expect(moverCartaoPara(TODOS, 'projecao', 'metas').slice(7, 10)).toEqual(['orcamento', 'projecao', 'metas']);
    expect(moverCartaoPara(TODOS, 'saldo', 'despesas').slice(0, 4)).toEqual(['receitas', 'saldo', 'despesas', 'resultado']);
    expect(moverCartaoPara(TODOS, 'saldo', 'saldo')).toBe(TODOS);
  });

  it('não altera dados, mês, gráficos ou o estado financeiro ao personalizar', async () => {
    const usuario = userEvent.setup();
    const { unmount } = renderizarApp('/?mes=2026-09', estado());
    const estadoAntes = localStorage.getItem(CHAVE_ESTADO);
    const saldoAntes = screen.getByTestId('saldo-total').textContent;
    const receitasAntes = screen.getByTestId('receitas').textContent;
    const despesasAntes = screen.getByTestId('despesas').textContent;
    const resultadoAntes = screen.getByTestId('resultado').textContent;
    const tabelaAntes = screen.getByRole('table', { name: 'Receitas e despesas por mês', hidden: true });
    const categoriasAntes = screen.getByRole('table', { name: 'Despesas por categoria', hidden: true }).textContent;

    await entrarEmEdicao(usuario);
    await usuario.click(screen.getByRole('button', { name: 'Ocultar Receitas e despesas (6 meses)' }));
    await usuario.click(screen.getByRole('button', { name: 'Mover Orçamento do mês para cima' }));

    expect(screen.getByTestId('saldo-total').textContent).toBe(saldoAntes);
    expect(screen.getByTestId('receitas').textContent).toBe(receitasAntes);
    expect(screen.getByTestId('despesas').textContent).toBe(despesasAntes);
    expect(screen.getByTestId('resultado').textContent).toBe(resultadoAntes);
    expect(tabelaAntes).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Despesas por categoria', hidden: true }).textContent).toBe(categoriasAntes);
    expect(screen.getByRole('group', { name: 'Mês' })).toHaveTextContent(/setembro de 2026/i);
    expect(localStorage.getItem(CHAVE_ESTADO)).toBe(estadoAntes);
    expect(JSON.parse(localStorage.getItem(CHAVE_DASHBOARD) ?? '{}')).toMatchObject({
      ocultos: expect.arrayContaining(['receitas-despesas']),
    });
    unmount();

    renderizarApp('/', construirEstado());
    expect(screen.getByText('Bem-vindo! Comece criando uma conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Personalizar' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Mês' })).toBeInTheDocument();
  });
});
