# Atlas Travel — Brief de experiência da T2

## Trabalho e público

O mock é apresentado a stakeholders que avaliam como uma plataforma corporativa existente pode tornar o planejamento de viagens mais claro com assistência por IA. A primeira tela deve permitir entender, em poucos segundos, que a plataforma organiza uma viagem no modo convencional e pode evoluir para uma experiência assistida.

**Modo da superfície:** Operar. A pessoa deve conseguir localizar o contexto, a rota e a próxima ação sem depender do efeito visual.

## Direção selecionada: Atlas orbital

**Decisão de implementação:** a composição entregue foi aprovada como uma adaptação funcional da direção em 30 de setembro de 2026. Ela preserva o globo 3D real e interativo como prioridade; os painéis laterais seguem uma estrutura operacional mais simples que a composição exploratória aprovada. Essa decisão encerra a busca de correspondência pixel a pixel e serve como a referência visual para as próximas tarefas.

Uma carta de navegação orbital contemporânea transforma a Terra em contexto de trabalho: o globo interativo é uma visualização geográfica real, enquanto rotas, status e informações de viagem são fictícios.

- **Foco:** globo 3D central, manipulável por arrastar e aproximar; a rota São Paulo–Nova York aparece como trajetória simulada sobre geografia real.
- **Sistema:** superfícies escuras de alta legibilidade, linhas geodésicas luminosas, indicadores técnicos contidos e uma hierarquia nítida entre contexto, plano e ação.
- **Estrutura:** cabeçalho mínimo; na abertura, globo e resumo de planejamento na área central; ao iniciar a comparação tradicional, a área de decisão recebe a maior largura, com resumo persistente e globo reduzido como contexto. Em celular, a etapa ativa vem antes do mapa contextual.
- **Transição característica:** a ativação do Assistente IA altera a atmosfera do espaço de trabalho, realça a rota e revela um chat lateral. O estado convencional permanece íntegro e retorna ao ser desativado.

## Componentes e GenUI

Os componentes são React comuns e reutilizáveis nos dois modos. Eles recebem props tipadas e estruturadas, para poderem ser registrados posteriormente como renderizadores GenUI do CopilotKit v2.

- Base da T2: cabeçalho e área de trabalho em `App`, `GlobeWorkspace`, `Surface`, `Card`, `Button`, `Badge` e regiões laterais para rota e planejamento. A região de planejamento poderá se transformar em um `AssistantPanel` recolhível na T5, sem substituir o globo.
- Renderizadores futuros: `TripContextCard`, `ConstraintSummary`, `RoutePreview`, `TravelOptionComparison`, `BudgetPolicyStatus`, `PlanningProgress`, `ApprovalCard` e `ItineraryTimeline`.
- O globo e a animação de ativação pertencem ao estado da aplicação. O assistente pode solicitar mudanças de estado explícitas, mas não gera HTML ou JSX arbitrário.

## Limites e estados

- A T2 estabelece a fundação visual e os espaços reservados; não implementa dados específicos da viagem, chat funcional, ações do agente, busca ou reserva.
- O globo usa geografia real local; nenhuma API de mapas, dados de tráfego ou integração externa é necessária.
- O layout deve manter a leitura em desktop de apresentação e em uma largura intermediária, com controles utilizáveis por teclado e foco visível.
