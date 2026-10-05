# Atlas Travel — Plano de Entrega do Mock

## Definição de concluído

O mock estará concluído quando demonstrar, ponta a ponta, que a mesma plataforma permite planejar uma viagem de forma tradicional ou assistida por IA, preservando dados, regras e decisões consistentes entre os dois modos.

## Plano de alto nível

### 1. Fundar a experiência

- Definir a marca e a interface fictícias do Atlas Travel.
- Criar um catálogo de cenários simulados para Gustavo, com partidas de São Paulo, Rio de Janeiro e Buenos Aires para Nova York, Londres e Cidade do México, cada qual com voos, hotéis, agenda, orçamento e política corporativa.
- Exibir um controle visível de alternância **Assistente IA**.

### 2. Construir o modo tradicional

- Disponibilizar busca por origem, destino, datas e filtros, permitindo escolher um dos destinos fictícios disponíveis.
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

Depois que o fluxo manual estiver estabelecido, o mock evoluirá a interface web React existente com MapLibre GL JS e um backend local em Python/FastAPI. Geoapify será a única integração externa, limitada à geocodificação de localidades e aos tiles do mapa; a chave fica no ambiente local e deve ser restringida por origem no provedor. O agente PydanticAI será exposto por AG-UI diretamente pelo FastAPI e consumido pela SPA Vite. Ele chamará as mesmas capacidades do plano legado e atualizará componentes React registrados como GenUI tipada; a confirmação simulada continua uma decisão humana explícita. A geografia pode ser real; planejamento, preços, políticas, seleções e confirmação permanecem inteiramente fictícios. Nenhum agente gera HTML ou JSX arbitrário.

## Critérios de aceite

- Widgets de calendário, comparação e revisão são decisões humanas vinculadas a chamadas AG-UI. O clique grava o resultado estruturado, atualiza o plano comum aos modos e retoma o agente automaticamente.
- Datas, filtros, seleções, orçamento e confirmação têm uma fonte de estado na sessão React; custos e política são calculados pelas mesmas funções do fluxo tradicional.
- Mudanças invalidam a revisão anterior. Falhas do modelo preservam as escolhas e permitem repetir a resposta sem reaplicar a confirmação.
- O histórico do protocolo preserva mensagens `assistant.toolCalls` e `tool.toolCallId`; o histórico visual exibe cada widget junto à mensagem correspondente. Conteúdo de raciocínio não é exibido.
- A interface apresenta datas em `DD/MM/YYYY`. O calendário recebe valores ISO internamente e vem pré-preenchido para datas numéricas no padrão local ou informadas por extenso.
- Verificação automatizada inclui componentes React, motor de plano e ciclo real de serialização/deserialização AG-UI com modelo de teste local. O modelo LM Studio é verificado separadamente por smoke test.

- A apresentação permite executar o fluxo manual e repetir o mesmo objetivo via IA.
- A tela inicial não traz uma viagem pronta; a pessoa pode escolher São Paulo, Rio de Janeiro ou Buenos Aires como origem e Nova York, Londres ou Cidade do México como destino no modo tradicional, e a rota, o contexto, as opções e os valores exibidos acompanham o cenário selecionado.
- A IA coordena capacidades existentes da plataforma, sem parecer substituí-la.
- Cada escolha relevante apresenta contexto, comparação e consequência financeira ou de política.
- Reservas, dados e aprovações são explicitamente fictícios e simulados.
- O resultado final reúne, de forma compreensível, itinerário, custo, status e próximos passos.

## Prioridade de entrega

O cenário de cancelamento é uma segunda etapa. O fluxo principal — planejamento e confirmação simulada — deve estar polido e apresentável antes de sua implementação.
