# T6 — Criar a narrativa inicial do assistente

## Objetivo

Estabelecer o primeiro momento da experiência assistida por meio de uma conversa local, interpretando o pedido da pessoa sem executar pesquisa ou reserva.

## Escopo

- Disponibilizar um chat para que a pessoa escreva o pedido inicial de planejamento.
- Exibir o pedido canônico de Gustavo como sugestão clicável, sem enviá-lo automaticamente.
- Criar um endpoint local em FastAPI com um agente PydanticAI para extrair as restrições do pedido em uma estrutura tipada.
- Configurar o agente para usar o endpoint compatível com OpenAI do LM Studio. Em desenvolvimento e testes locais, usar o modelo `qwen3.6-35b-a3b@q4_k_s`.
- Manter a URL do endpoint e o nome do modelo configuráveis por variáveis de ambiente, sem credenciais ou serviços externos.
- Validar a resposta do agente contra um esquema estruturado antes de apresentá-la na interface.
- Manter o histórico apenas na sessão atual para que mensagens posteriores possam ajustar as restrições já reconhecidas.
- Exibir uma resposta inicial que organize visualmente as restrições reconhecidas a partir dos dados estruturados.
- Indicar que o plano está sendo organizado.
- Preparar as áreas que receberão alternativas nas próximas etapas.

## Critérios de aceite

- A pessoa pode iniciar a conversa com uma solicitação natural; o pedido de Gustavo está disponível como sugestão de demonstração.
- Com o LM Studio local disponível, o agente identifica corretamente rota, datas, horário de chegada, voo direto e orçamento.
- A interface recebe e apresenta somente dados estruturados e validados; o agente não gera HTML ou JSX.
- A indisponibilidade do endpoint local apresenta um estado de erro compreensível e não bloqueia o modo tradicional.
- Pedidos parciais apresentam as restrições identificadas e solicitam objetivamente as informações que faltam.
- A interface indica que o plano está sendo organizado e prepara as áreas de alternativas.
- Não há alegação de consulta, reserva ou integração real.

## Fora de escopo

Escolha de opções, solicitação de aprovação, confirmação de reserva, consultas externas, persistência e uso de modelos ou serviços de IA remotos.

## Dependências

- T3 — Criar o conjunto canônico de dados fictícios.
- T4 — Exibir o contexto inicial da viagem.
- T5 — Implementar o controle Assistente IA.
