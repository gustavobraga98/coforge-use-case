# T15 — Exibir o progresso do planejamento assistido

## Objetivo

Tornar as etapas do planejamento conduzido pelo Assistente IA visíveis durante toda a conversa.

## Escopo

- Exibir, apenas no modo assistido, uma faixa fixa abaixo do cabeçalho.
- Mostrar as etapas Budget, Route, Dates, Flight, Stay e Review & confirm.
- Derivar o estado de cada etapa diretamente do motor compartilhado do plano, sem estado paralelo.
- Marcar as etapas como pendentes, atual ou concluídas; alterações que invalidam escolhas anteriores devem fazer o indicador retroceder.
- Após a confirmação simulada, manter todas as etapas marcadas como concluídas.
- Preservar acessibilidade com estrutura rotulada, etapa atual identificada e resumo textual do progresso.
- Manter o indicador do modo tradicional inalterado.

## Critérios de aceite

- A faixa aparece somente com o Assistente IA ativo e permanece disponível durante a conversa em desktop e mobile.
- Os estados iniciais, as transições canônicas, a confirmação concluída e as invalidações de rota, datas ou escolhas posteriores são refletidos corretamente.
- Leitores de tela recebem o progresso e a etapa atual de forma compreensível.
- A interface respeita a preferência de movimento reduzido.

## Fora de escopo

Alterar a ordem do fluxo, criar novas decisões, persistir o plano ou modificar o indicador do modo tradicional.

## Dependências

T6 — Jornada conversacional e widgets GenUI.
