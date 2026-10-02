# T12 — Consolidar custos e alertas do plano tradicional

## Objetivo

Mostrar o impacto financeiro e de política das escolhas de voo e hotel antes da confirmação.

## Escopo

- Calcular localmente o custo total estimado a partir das opções selecionadas.
- Comparar o total com o orçamento disponível de US$ 3.000.
- Exibir alertas explicáveis para estouro de orçamento ou opção fora da política fictícia.
- Indicar alternativas selecionadas e pendências que impedem a confirmação.

## Critérios de aceite

- O resumo discrimina voo, hospedagem e total previsto.
- O status do orçamento se atualiza ao trocar voo ou hotel.
- Cada alerta informa motivo, impacto financeiro e uma orientação acionável para revisar a escolha.
- O resumo distingue claramente estados dentro da política, com alerta e bloqueado por informação ausente.

## Fora de escopo

Fluxo de aprovação de exceção, reserva real e persistência de escolhas.

## Dependências

- T3 — Criar o conjunto canônico de dados fictícios.
- T10 — Exibir e comparar opções de voo.
- T11 — Exibir e comparar opções de hotel.

