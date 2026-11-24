# Dashboard personalizável (v2: edição na própria tela)

> **Substitui:** [SPEC/2026-11-24-personalizacao-do-dashboard.md](2026-11-24-personalizacao-do-dashboard.md). A v1 permanece como registro. Esta versão troca o painel modal por edição direta no Dashboard: arrastar cartões, mover com setas e ocultar em cada cartão, sem sair da tela.

## O quê e por quê

O Dashboard reúne onze cartões: os quatro indicadores do mês (saldo total, receitas, despesas e resultado), saúde financeira, os gráficos de despesas por categoria e de receitas e despesas em 6 meses, orçamento do mês, metas ativas, projeção do saldo e recorrências usadas na projeção. Hoje todos aparecem sempre, na mesma ordem.

A v1 permitia personalizar por um painel modal separado da tela. Esta versão deixa a edição onde o resultado aparece: o botão "Personalizar" ativa um modo de edição no próprio Dashboard, os cartões podem ser arrastados para a nova posição e cada um traz controles para mover e ocultar. A escolha continua salva no navegador. A mudança é só de apresentação: não altera cálculos, valores, seleção de mês nem o estado financeiro descrito em `2026-10-01-dashboard-e-projecao-v2.md`.

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

1. O cabeçalho do Dashboard oferece, ao lado de "Nova transação", um botão "Personalizar" com um ícone de edição (lápis) ao lado do texto; acioná-lo entra no modo de personalização e acioná-lo de novo sai. O botão mantém o nome acessível "Personalizar" e expõe o estado com `aria-pressed`.
2. Ao entrar no modo, nenhum diálogo ou modal é aberto: o próprio Dashboard mostra uma barra de edição com a instrução de arrastar os cartões e os botões "Restaurar padrão" e "Concluir".
3. No modo de edição, cada cartão visível ganha uma faixa de controles com uma alça de arrastar, o nome do cartão, botões de mover para cima e para baixo e um botão de ocultar; o primeiro cartão não sobe e o último não desce, com o botão correspondente desabilitado.
4. Arrastar um cartão e soltá-lo sobre outro move o cartão arrastado para a posição do cartão de destino, com efeito imediato; a ordem visual, a de leitura e a de tabulação do Dashboard passam a seguir a nova ordem. O cartão em arrasto e o destino recebem destaque visual.
5. As setas também movem o cartão, uma posição por acionamento; depois de mover, o foco permanece na seta acionada do mesmo cartão.
6. Ocultar um cartão o remove imediatamente do Dashboard e o coloca na seção "Cartões ocultos" do modo de edição, com a ação "Mostrar"; ao mostrar de novo, o cartão volta com o mesmo conteúdo e a posição relativa que tinha na ordem.
7. Toda alteração de ordem ou visibilidade é gravada no navegador a cada ação, numa chave própria com o prefixo do app, separada do estado financeiro; depois de recarregar a página, a ordem e a visibilidade continuam as escolhidas.
8. No primeiro acesso, sem preferência gravada, o Dashboard mostra os onze cartões na ordem atual, sem nenhum oculto, e sem controles de edição visíveis.
9. A ação "Restaurar padrão" volta todos os cartões à ordem original, todos visíveis, e grava o resultado; ela aparece na barra de edição e também no estado em que todos os cartões estão ocultos.
10. Preferências inválidas ou incompatíveis não quebram a tela nem geram erro no console: JSON malformado volta ao padrão; identificadores desconhecidos são ignorados; duplicados são considerados uma vez; cartões conhecidos que faltam na preferência gravada entram visíveis ao final da lista.
11. A personalização não altera dados nem cálculos: os valores dos indicadores, os gráficos, o orçamento, as metas, a projeção, as recorrências e o mês selecionado permanecem iguais aos atuais, e a chave do estado financeiro não é escrita ao personalizar.
12. O seletor de mês e o estado inicial de primeiros passos, exibido sem contas e transações, não são personalizáveis nem ocultáveis; continuam funcionando e o parâmetro de mês na URL segue valendo.
13. Se todos os cartões estiverem ocultos, o Dashboard mostra uma mensagem informando isso e a ação "Restaurar padrão"; fora do modo de edição não há cartões nem a seção "Cartões ocultos". Dentro do modo, a seção "Cartões ocultos" lista todos os cartões, cada um com "Mostrar".
14. O modo de edição é operável por teclado: todos os controles são alcançáveis por `Tab`, cada controle tem nome acessível com o título do cartão, como "Ocultar Despesas por categoria" e "Mover Orçamento do mês para cima", estados de pressionado e desabilitado são expostos, e cada mudança de ordem ou visibilidade é anunciada em região `aria-live`. A alça de arrastar é decorativa; as setas garantem a reordenação sem mouse.
15. A grade e a barra de edição funcionam em 360 px sem rolagem horizontal, cartões ocultos não deixam espaços vazios e não há sobreposição; transições, se houver, respeitam `prefers-reduced-motion: reduce`.
16. Os testes cobrem: ordem padrão sem controles, entrada e saída do modo, arrastar e soltar, setas com foco preservado, ocultar e mostrar, persistência após recarregar, restaurar padrão, preferência malformada e incompleta, estado com todos ocultos, ausência de diálogo, elementos fixos e valores inalterados.

## Fora do escopo

- Painel ou modal de personalização; a edição acontece no próprio Dashboard.
- Gestos de arrastar específicos para toque; no celular, as setas cobrem a reordenação.
- Reordenar cartões enquanto estão ocultos; eles mantêm a posição relativa na ordem.
- Redimensionar cartões ou escolher a quantidade de colunas; a grade responsiva continua automática.
- Criar novos indicadores, gráficos ou cartões personalizados.
- Personalizar o seletor de mês, o estado inicial de primeiros passos ou telas além do Dashboard.
- Sincronizar preferências entre navegadores, perfis ou dispositivos; elas valem no armazenamento local do navegador atual.
- Exportar, importar ou versionar as preferências junto com os dados financeiros.
- Alterar fórmulas, cálculos ou o comportamento dos cartões existentes.
