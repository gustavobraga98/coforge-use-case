# T3 — Criar o conjunto canônico de dados fictícios

## Objetivo

Centralizar todos os dados usados pelo mock para assegurar consistência entre telas e modos de interação.

## Escopo

- Modelar e preencher dados fictícios do viajante Gustavo.
- Incluir um catálogo de solicitações entre São Paulo, Rio de Janeiro ou Buenos Aires e Nova York, Londres ou Cidade do México, cada uma com agenda, opções de voo e hotéis.
- Incluir orçamento, política corporativa e estado inicial da viagem.
- Expor os dados em uma única fonte consumível pela interface.

## Critérios de aceite

- Nenhum dado identifica pessoas, empresas, reservas ou fornecedores reais.
- Valores, horários, duração e totais são internamente coerentes.
- Os dados permitem apresentar os trade-offs de menor custo, maior conforto e melhor horário de chegada.
- Um único módulo ou fonte concentra os dados usados pela interface.
- Cada cenário tem rota, período, orçamento e opções internamente coerentes, sem depender de disponibilidade externa.

## Fora de escopo

Consulta externa, persistência de alterações e geração de dados em tempo real. A geração local e determinística de cenários fictícios a partir dos critérios informados é permitida.

> Evolução registrada: a geocodificação de localidades poderá usar Geoapify, mas não altera este catálogo nem torna voos, hotéis, preços ou políticas reais.

## Dependências

T1 — Inicializar a aplicação do mock.
