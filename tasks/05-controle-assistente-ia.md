# T5 — Implementar o controle Assistente IA

## Objetivo

Disponibilizar a alternância central entre os modos tradicional e assistido, sem alterar os dados da viagem.

## Escopo

- Criar o controle acessível “Assistente IA”.
- Armazenar o estado de ativação na aplicação.
- Adaptar visualmente a área de trabalho para cada modo.
- Preservar o mesmo contexto de viagem durante a alternância.

## Critérios de aceite

- O controle deixa inequívoco se o assistente está ligado ou desligado.
- A alteração é imediata e preserva o contexto e os dados da viagem.
- Com o assistente desligado, a interface apresenta o ponto de partida do fluxo tradicional.
- Com o assistente ligado, a interface apresenta o ponto de partida da experiência conversacional.
- O controle pode ser operado por teclado e possui rótulo acessível.

## Fora de escopo

Pesquisa de voos/hotéis, análise real de linguagem natural e reserva.

## Dependências

- T2 — Definir identidade visual e layout-base.
- T3 — Criar o conjunto canônico de dados fictícios.
- T4 — Exibir o contexto inicial da viagem.
