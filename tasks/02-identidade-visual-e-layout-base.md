# T2 — Definir identidade visual e layout-base

## Objetivo

Estabelecer a linguagem visual do Atlas Travel e o esqueleto da experiência.

## Escopo

- Criar tokens básicos de cores, tipografia e espaçamentos.
- Implementar o cabeçalho da aplicação e a área principal de trabalho.
- Reservar regiões para chat, plano de viagem e ações.
- Criar componentes reutilizáveis de superfície, botão, badge e cartão.
- Estabelecer o globo 3D interativo como foco da composição, usando geografia real e trajetórias simuladas.
- Manter props estruturadas nos componentes reutilizáveis para futura renderização via GenUI do CopilotKit v2.

## Critérios de aceite

- A marca provisória “Atlas Travel” aparece de modo consistente.
- A tela comunica uma plataforma corporativa de planejamento, sem remeter a uma marca real.
- O layout funciona em largura desktop de apresentação e não quebra em uma largura intermediária.
- Os componentes base estão disponíveis para as próximas tarefas.
- A arquitetura dos componentes não exige que o assistente gere HTML ou JSX arbitrário para apresentar dados estruturados.

## Fora de escopo

Dados específicos da viagem, alternância de modo e fluxos de planejamento.

## Dependências

T1 — Inicializar a aplicação do mock.
