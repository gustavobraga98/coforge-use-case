# Atlas Travel — Plano de Entrega do Mock

## Definição de concluído

O mock estará concluído quando demonstrar, ponta a ponta, que a mesma plataforma permite planejar uma viagem de forma tradicional ou assistida por IA, preservando dados, regras e decisões consistentes entre os dois modos.

## Plano de alto nível

### 1. Fundar a experiência

- Definir a marca e a interface fictícias do Atlas Travel.
- Criar dados simulados para Gustavo, voos, hotéis, agenda, orçamento e política corporativa.
- Exibir um controle visível de alternância **Assistente IA**.

## Backlog da primeira etapa

As tarefas abaixo são deliberadamente independentes o bastante para gerar PRs pequenos, revisáveis e com uma finalidade clara. A ordem indica a dependência recomendada.

### T1 — Inicializar a aplicação do mock

**Objetivo:** criar a estrutura executável do projeto e uma tela inicial vazia para o Atlas Travel.

**Escopo:** configurar o framework, comandos de desenvolvimento/build, estilos globais mínimos e uma rota única para a demonstração.

**Critérios de aceite:**

- O projeto inicia localmente com um único comando documentado.
- A tela inicial renderiza sem erros de console.
- Há uma estrutura clara para componentes, dados simulados e estilos.
- O README explica como executar o mock.

**Fora de escopo:** conteúdo final, integração externa, lógica de busca ou persistência.

### T2 — Definir identidade visual e layout-base

**Objetivo:** estabelecer a linguagem visual do Atlas Travel e o esqueleto da experiência.

**Escopo:** criar tokens básicos (cores, tipografia, espaçamentos), cabeçalho da aplicação, área principal de trabalho e regiões reservadas para chat, plano de viagem e ações. A composição será centrada em um globo 3D interativo com geografia real e trajetórias simuladas. Os componentes reutilizáveis devem aceitar dados estruturados para futura compatibilidade com GenUI do CopilotKit v2.

**Critérios de aceite:**

- A marca provisória “Atlas Travel” aparece de modo consistente.
- A tela comunica uma plataforma corporativa de planejamento, sem remeter a uma marca real.
- O layout funciona em largura desktop de apresentação e não quebra em uma largura intermediária.
- Componentes reutilizáveis de superfície, botão, badge e cartão estão disponíveis.

**Depende de:** T1.

### T3 — Criar o conjunto canônico de dados fictícios

**Objetivo:** centralizar todos os dados usados pelo mock para assegurar consistência entre telas e modos de interação.

**Escopo:** modelar e preencher dados fictícios do viajante Gustavo, solicitação São Paulo–Nova York, agenda, opções de voo, hotéis, orçamento, política e estado inicial da viagem.

**Critérios de aceite:**

- Nenhum dado identifica pessoas, empresas, reservas ou fornecedores reais.
- Valores, horários, duração e totais são internamente coerentes.
- Os dados permitem apresentar pelo menos três trade-offs: menor custo, maior conforto e melhor horário de chegada.
- Um único módulo/fonte concentra os dados que serão consumidos pela interface.

**Depende de:** T1.

### T4 — Exibir o contexto inicial da viagem

**Objetivo:** tornar visível, na interface, a solicitação e as restrições que orientarão o planejamento.

**Escopo:** criar um resumo de viagem com viajante, rota, período, compromisso principal, preferências e limite de orçamento; alimentá-lo pelos dados canônicos.

**Critérios de aceite:**

- A tela mostra Gustavo, São Paulo–Nova York, 12–16 de novembro, chegada antes das 15h, preferência por voo direto e teto de US$ 3.000.
- O conteúdo usa exclusivamente os dados do módulo fictício.
- O componente suporta estados visuais de pendente, em planejamento e pronto para reserva, mesmo que ainda não haja transição funcional.

**Depende de:** T2 e T3.

### T5 — Implementar o controle Assistente IA

**Objetivo:** disponibilizar a alternância central entre os modos tradicional e assistido, sem alterar os dados da viagem.

**Escopo:** criar o controle acessível “Assistente IA”, seu estado na aplicação e a adaptação visual da área de trabalho para cada modo.

**Critérios de aceite:**

- O controle deixa inequívoco se o assistente está ligado ou desligado.
- A alteração é imediata e preserva o contexto e os dados da viagem.
- Com o assistente desligado, a interface apresenta o ponto de partida do fluxo tradicional.
- Com o assistente ligado, a interface apresenta o ponto de partida da experiência conversacional.
- O controle pode ser operado por teclado e possui rótulo acessível.

**Depende de:** T2, T3 e T4.

### T6 — Criar a narrativa inicial do assistente

**Objetivo:** estabelecer o primeiro momento da experiência assistida, usando o cenário canônico sem ainda executar pesquisa ou reserva.

**Escopo:** apresentar a mensagem natural de planejamento e uma resposta inicial que organize visualmente as restrições reconhecidas.

**Critérios de aceite:**

- A solicitação natural de Gustavo é exibida como mensagem de entrada.
- A resposta identifica corretamente rota, datas, horário de chegada, voo direto e orçamento.
- A interface indica que o plano está sendo organizado e prepara as áreas que receberão alternativas nas próximas etapas.
- Não há alegação de consulta, reserva ou integração real.

**Depende de:** T3, T4 e T5.

### T7 — Revisar a fundação para demonstração

**Objetivo:** validar que a primeira etapa é uma base estável para os fluxos manual e assistido posteriores.

**Escopo:** revisar textos fictícios, consistência visual, responsividade essencial, navegação por teclado e instruções de execução.

**Critérios de aceite:**

- Todos os itens de aceite de T1 a T6 permanecem atendidos na integração.
- Não há referências a dados, marcas ou operações reais.
- A tela inicial comunica claramente o objetivo do mock em menos de um minuto de apresentação.
- Build e verificações disponíveis no projeto concluem com sucesso.

**Depende de:** T1 a T6.

### 2. Construir o modo tradicional

- Disponibilizar busca por origem, destino, datas e filtros.
- Permitir comparar opções de voo e hotel.
- Mostrar resumo de custos, alertas de política/orçamento e confirmação simulada.

### 3. Construir o modo assistido

- Aceitar um pedido inicial em linguagem natural para a viagem de Gustavo entre São Paulo e Nova York.
- Extrair e apresentar as restrições: datas, chegada antes das 15h, voo direto e orçamento de até US$ 3.000.
- Exibir alternativas com trade-offs claros: economia, conforto e melhor horário.
- Permitir que a escolha seja feita por componentes visuais, e não apenas pelo chat.

### 4. Demonstrar governança e decisão

- Consolidar o orçamento e compará-lo ao limite disponível.
- Exibir alertas explicáveis de política.
- Solicitar aprovação antes de uma reserva simulada ou exceção, com motivo, impacto e alternativas.

### 5. Fechar a jornada

- Confirmar a reserva de forma simulada.
- Apresentar o itinerário final, linha do tempo, custo previsto, decisões tomadas e próximos passos.
- Atualizar visivelmente o plano e o orçamento a cada escolha.

### 6. Extensão opcional: mudança inesperada

- Simular o cancelamento do voo de volta após a conclusão do plano inicial.
- Propor uma reorganização que preserve a reunião de quinta-feira e permaneça dentro da política corporativa.

## Critérios de aceite

- A apresentação permite executar o fluxo manual e repetir o mesmo objetivo via IA.
- A IA coordena capacidades existentes da plataforma, sem parecer substituí-la.
- Cada escolha relevante apresenta contexto, comparação e consequência financeira ou de política.
- Reservas, dados e aprovações são explicitamente fictícios e simulados.
- O resultado final reúne, de forma compreensível, itinerário, custo, status e próximos passos.

## Prioridade de entrega

O cenário de cancelamento é uma segunda etapa. O fluxo principal — planejamento e confirmação simulada — deve estar polido e apresentável antes de sua implementação.
