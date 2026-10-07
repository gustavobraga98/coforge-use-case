# T6 — Jornada conversacional e widgets GenUI

## Objetivo

Estabelecer uma jornada conversacional via PydanticAI, AG-UI e CopilotKit, coordenando apenas dados e decisões fictícios do plano.

## Escopo

- Disponibilizar um chat para que a pessoa escreva o pedido inicial de planejamento.
- Exibir o pedido canônico de Gustavo como sugestão clicável, sem enviá-lo automaticamente.
- Criar um endpoint local em FastAPI com um agente PydanticAI para extrair as restrições do pedido em uma estrutura tipada.
- Configurar o agente para usar o provider `openai-codex` do PydanticAI, autenticado pelo Codex CLI, com o modelo `gpt-6-luna` como padrão.
- Manter o nome do modelo configurável por `CODEX_MODEL`, sem armazenar credenciais no projeto.
- Validar a resposta do agente contra um esquema estruturado antes de apresentá-la na interface.
- Manter o histórico apenas na sessão atual para que mensagens posteriores possam ajustar as restrições já reconhecidas.
- Exibir uma resposta inicial que organize visualmente as restrições reconhecidas a partir dos dados estruturados.
- Indicar que o plano está sendo organizado.
- Preparar as áreas que receberão alternativas nas próximas etapas.
- Expor o agente em `/api/assistant/ag-ui` por `AGUIAdapter.dispatch_request` e manter `/api/assistant/interpret` compatível.
- Usar o App Router do Next.js como aplicação web e o Copilot Runtime local como ponte entre a rail Atlas e o stream AG-UI do FastAPI.
- Manter a rail Atlas em CopilotKit headless, com componentes GenUI tipados por Zod e sem UI de chat pronta do framework.
- Espelhar rota, período, filtros, seleções, custo e confirmação entre chat e workspace; confirmação simulada exige decisão humana explícita.
- Padronizar todas as datas visíveis em `DD/MM/YYYY`. Datas numéricas seguem essa leitura; datas em português ou inglês por extenso preenchem o calendário com o valor ISO correspondente para aprovação ou edição.
- Ampliação de escopo aprovada: calendário, seleção de voo/hospedagem, custos, revisão e confirmação simulada também são operáveis no chat.
- Registrar ferramentas frontend tipadas no CopilotKit, preservar chamadas e resultados no histórico do protocolo e retomar automaticamente após cada decisão humana.
- Usar um motor compartilhado de plano para ambos os modos, com preços canônicos e invalidação de seleções/revisão quando o período muda.
- Permitir editar escolhas anteriores e repetir uma resposta interrompida sem perder a decisão já aplicada.
- Validar cada ferramenta contra a próxima etapa elegível (`orçamento → rota → datas → voo → hospedagem → revisão → confirmação`), para que o modelo não possa saltar etapas ou atualizar preços e seleções fora do motor local.
- Solicitar e confirmar o teto de orçamento antes de qualquer outra etapa; valores sugeridos não podem ser tratados como escolha da pessoa.
- Preservar um retrato do plano em cada widget histórico; alterações posteriores não podem reescrever uma comparação ou custo já exibido.

## Critérios de aceite

- A pessoa pode iniciar a conversa com uma solicitação natural; o pedido de Gustavo está disponível como sugestão de demonstração.
- O primeiro widget da jornada assistida solicita o orçamento máximo em USD, sem assumir US$ 3.000; esse valor pode aparecer somente como sugestão editável e deve vir preenchido quando a pessoa já tiver informado um valor monetário inequívoco.
- Com o Codex CLI autenticado, o agente identifica corretamente rota, datas, horário de chegada, voo direto e orçamento.
- A interface recebe e apresenta somente dados estruturados e validados; o agente não gera HTML ou JSX.
- A indisponibilidade do endpoint local apresenta um estado de erro compreensível e não bloqueia o modo tradicional.
- Pedidos parciais apresentam as restrições identificadas e solicitam objetivamente as informações que faltam.
- A interface indica que o plano está sendo organizado e prepara as áreas de alternativas.
- Não há alegação de consulta, reserva ou integração real.
- Confirmar o calendário envia datas ISO e `datesConfirmed` em uma mensagem `tool` vinculada ao `toolCallId`; não exige digitar “Done!”.
- Datas ambíguas não recebem ordem ou ano presumidos. Os campos exigem datas completas e retorno posterior à partida.
- O agente recebe estado atualizado e avança de calendário para voo, hospedagem, custos e revisão sem repetir decisões resolvidas.
- Texto isolado não confirma a simulação; o botão de revisão exige plano elegível e revisão atual.
- Testes de componentes exercitam cliques e os payloads seguintes; testes do endpoint verificam descoberta e retomada de ferramentas pelo Copilot Runtime e AG-UI.

## Fora de escopo

Aprovação de exceções, reserva real, integrações de viagem e persistência. O modelo remoto é limitado ao provider `openai-codex`; geocodificação segue o limite já aprovado na visão.

## Dependências

- T3 — Criar o conjunto canônico de dados fictícios.
- T4 — Exibir o contexto inicial da viagem.
- T5 — Implementar o controle Assistente IA.
