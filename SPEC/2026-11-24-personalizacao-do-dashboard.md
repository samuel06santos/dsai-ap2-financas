# Dashboard personalizável (2026-11-24)

## O quê e por quê

O Dashboard reúne hoje onze cartões: os quatro indicadores do mês (saldo total, receitas, despesas e resultado), saúde financeira, os gráficos de despesas por categoria e de receitas e despesas em 6 meses, orçamento do mês, metas ativas, projeção do saldo e recorrências usadas na projeção. Todos aparecem sempre, na mesma ordem, mesmo para quem acompanha apenas o saldo e o orçamento e precisa rolar por cartões que não usa — ou para quem quer ver a projeção antes dos gráficos.

Esta parte deixa o usuário escolher quais cartões aparecem e em que ordem, guardando a escolha no navegador. É a personalização que ficou de fora em `2026-10-01-dashboard-e-projecao-v2.md`, `2026-10-05-redesenho-dashboard.md` e `2026-10-04-layout-e-navegacao.md`. A mudança é só de apresentação: não altera cálculos, valores, seleção de mês nem o estado financeiro descrito em `2026-10-01-dashboard-e-projecao-v2.md`.

Os cartões personalizáveis, identificados pelo título exibido, são:

- Saldo total atual
- Receitas do mês
- Despesas do mês
- Resultado do mês
- Saúde financeira
- Despesas por categoria
- Receitas e despesas (6 meses)
- Orçamento do mês
- Metas ativas
- Projeção do saldo
- Recorrências usadas na projeção

## Critérios de aceitação

1. O cabeçalho do Dashboard oferece a ação "Personalizar dashboard" ao lado de "Nova transação", que abre um painel ou diálogo com o mesmo nome e lista todos os cartões na ordem atual, inclusive os ocultos.
2. Cada item da lista mostra o nome do cartão, um controle para mostrar ou ocultar e botões para mover para cima e para baixo; o primeiro item não pode subir e o último não pode descer, com o botão correspondente desabilitado.
3. Mostrar ou ocultar um cartão tem efeito imediato no Dashboard: o cartão oculto deixa de ser renderizado, não aparece na árvore de acessibilidade e seus links não recebem foco; ao mostrar de novo, o cartão volta com o mesmo conteúdo e a mesma posição relativa.
4. Mover um cartão tem efeito imediato: a ordem visual, a de leitura e a de tabulação do Dashboard passam a seguir a ordem configurada. Cartões ocultos não deixam espaços vazios; em telas largas a grade se organiza em duas colunas e, em 360 px, em uma coluna, sem rolagem horizontal nem sobreposição.
5. Toda alteração de ordem ou visibilidade é gravada no navegador a cada ação, numa chave própria com o prefixo do app, separada do estado financeiro; depois de recarregar a página, a ordem e a visibilidade continuam as escolhidas.
6. No primeiro acesso, sem preferência gravada, o Dashboard mostra os onze cartões na ordem atual, sem nenhum oculto.
7. A ação "Restaurar padrão" volta todos os cartões à ordem original, todos visíveis, e grava o resultado; ela aparece no painel de personalização e também no estado em que todos os cartões estão ocultos.
8. Preferências inválidas ou incompatíveis não quebram a tela nem geram erro no console: JSON malformado volta ao padrão; identificadores desconhecidos são ignorados; duplicados são considerados uma vez; cartões conhecidos que faltam na preferência gravada entram visíveis ao final da lista.
9. A personalização não altera dados nem cálculos: os valores dos indicadores, os gráficos, o orçamento, as metas, a projeção, as recorrências e o mês selecionado permanecem iguais aos atuais, e a chave do estado financeiro não é escrita ao personalizar.
10. O seletor de mês e o estado inicial de primeiros passos, exibido sem contas e transações, não são personalizáveis nem ocultáveis; continuam funcionando e o parâmetro de mês na URL segue valendo.
11. Se todos os cartões estiverem ocultos, o Dashboard mostra uma mensagem informando isso, com as ações "Personalizar dashboard" e "Restaurar padrão"; o seletor de mês continua visível.
12. O painel é operável por teclado: o foco entra nele ao abrir, `Esc` fecha e devolve o foco ao botão que o abriu, todos os controles são alcançáveis por `Tab`, e cada controle tem nome acessível com o título do cartão, como "Ocultar Despesas por categoria" e "Mover Orçamento do mês para cima".
13. O estado de visibilidade de cada item é exposto por `aria-pressed` ou controle equivalente, e cada mudança de ordem ou visibilidade é anunciada em região `aria-live`; após mover, o foco permanece no controle acionado do mesmo cartão.
14. O painel funciona em 360 px sem rolagem horizontal e respeita `prefers-reduced-motion: reduce` caso use transições.
15. Os testes cobrem: ordem padrão, ocultar e mostrar com persistência após recarregar, mover e persistir, restaurar padrão, preferência malformada e incompleta, estado com todos ocultos, elementos fixos e valores inalterados.

## Fora do escopo

- Arrastar e soltar para reordenar; a ordenação é feita pelos botões de subir e descer.
- Redimensionar cartões ou escolher a quantidade de colunas; a grade responsiva continua automática.
- Criar novos indicadores, gráficos ou cartões personalizados.
- Personalizar o seletor de mês, o estado inicial de primeiros passos ou telas além do Dashboard.
- Sincronizar preferências entre navegadores, perfis ou dispositivos; elas valem no armazenamento local do navegador atual.
- Exportar, importar ou versionar as preferências junto com os dados financeiros.
- Alterar fórmulas, cálculos ou o comportamento dos cartões existentes.
