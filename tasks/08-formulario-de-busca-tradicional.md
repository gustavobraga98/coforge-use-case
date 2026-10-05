# T8 — Criar o formulário de busca tradicional

## Objetivo

Disponibilizar o ponto de partida do planejamento manual, usando os mesmos dados e restrições da viagem canônica.

## Escopo

- Criar campos acessíveis para origem, destino, datas de ida e volta e viajante.
- Apresentar o formulário sem viagem pré-configurada e permitir selecionar São Paulo, Rio de Janeiro ou Buenos Aires como origem e Nova York, Londres ou Cidade do México como destinos fictícios.
- Exibir uma ação de busca simulada e um estado de carregamento ou processamento local.
- Manter o formulário disponível quando o Assistente IA estiver desligado.

## Critérios de aceite

- A pessoa pode identificar e alterar origem, destino e período usando teclado.
- A tela inicial não exibe rota ou período pré-configurados; a seleção de um destino carrega valores provenientes dos dados fictícios canônicos.
- Ao selecionar uma origem e um destino fictícios, a interface atualiza período, rota e opções para o cenário canônico correspondente.
- A busca não consulta serviços externos e deixa explícito que trabalha com opções simuladas.
- A submissão encaminha a interface para o estado de resultados da busca tradicional.

## Fora de escopo

Filtros, comparação de opções, cálculo de totais e confirmação simulada.

> Evolução registrada: o mapa pode usar geografia real via MapLibre e Geoapify; a busca e suas opções continuam locais e simuladas.

## Dependências

- T3 — Criar o conjunto canônico de dados fictícios.
- T5 — Implementar o controle Assistente IA.
