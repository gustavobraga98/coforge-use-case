# T13 — Confirmar o plano tradicional de forma simulada

## Objetivo

Encerrar o fluxo manual com uma confirmação explícita e claramente fictícia.

## Escopo

- Disponibilizar a ação de confirmar quando o plano tiver voo, hotel e status elegível.
- Exibir uma etapa de revisão com itens selecionados, custo total e avisos aplicáveis.
- Registrar a confirmação apenas no estado local da aplicação.
- Exibir um estado final que informe que a reserva é simulada.

## Critérios de aceite

- A confirmação exige uma ação deliberada da pessoa após a revisão do plano.
- A interface não permite confirmar um plano incompleto ou bloqueado por alerta obrigatório.
- O estado final reúne voo, hotel, custo previsto e o rótulo de simulação.
- Nenhuma compra, reserva, comunicação externa ou persistência é executada.

## Fora de escopo

Aprovação de exceções, itinerário detalhado final e interação pelo Assistente IA.

## Dependências

- T12 — Consolidar custos e alertas do plano tradicional.

