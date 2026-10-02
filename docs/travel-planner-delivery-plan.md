# Atlas Travel — Plano de Entrega do Mock

## Definição de concluído

O mock estará concluído quando demonstrar, ponta a ponta, que a mesma plataforma permite planejar uma viagem de forma tradicional ou assistida por IA, preservando dados, regras e decisões consistentes entre os dois modos.

## Plano de alto nível

### 1. Fundar a experiência

- Definir a marca e a interface fictícias do Atlas Travel.
- Criar dados simulados para Gustavo, voos, hotéis, agenda, orçamento e política corporativa.
- Exibir um controle visível de alternância **Assistente IA**.

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

## Direção técnica de evolução

Depois que o fluxo manual estiver estabelecido, o mock evoluirá a interface web React existente com um backend local em Python/FastAPI e um agente PydanticAI. O CopilotKit conectará a conversa e as ações do agente aos componentes React registrados como GenUI, que continuarão recebendo dados tipados e estruturados. Essa evolução deve demonstrar coordenação entre agente e interface sem permitir geração de HTML ou JSX arbitrário e sem introduzir integrações, reservas ou dados reais.

## Critérios de aceite

- A apresentação permite executar o fluxo manual e repetir o mesmo objetivo via IA.
- A IA coordena capacidades existentes da plataforma, sem parecer substituí-la.
- Cada escolha relevante apresenta contexto, comparação e consequência financeira ou de política.
- Reservas, dados e aprovações são explicitamente fictícios e simulados.
- O resultado final reúne, de forma compreensível, itinerário, custo, status e próximos passos.

## Prioridade de entrega

O cenário de cancelamento é uma segunda etapa. O fluxo principal — planejamento e confirmação simulada — deve estar polido e apresentável antes de sua implementação.
