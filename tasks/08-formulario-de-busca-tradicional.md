# T8 — Criar o formulário de busca tradicional

## Objetivo

Disponibilizar o ponto de partida do planejamento manual, usando os mesmos dados e restrições da viagem canônica.

## Escopo

- Criar campos acessíveis para origem, destino, datas de ida e volta e viajante.
- Pré-preencher o formulário com a viagem de Gustavo entre São Paulo e Nova York, de 12 a 16 de novembro.
- Exibir uma ação de busca simulada e um estado de carregamento ou processamento local.
- Manter o formulário disponível quando o Assistente IA estiver desligado.

## Critérios de aceite

- A pessoa pode identificar e alterar origem, destino e período usando teclado.
- Os valores iniciais são provenientes dos dados fictícios canônicos.
- A busca não consulta serviços externos e deixa explícito que trabalha com opções simuladas.
- A submissão encaminha a interface para o estado de resultados da busca tradicional.

## Fora de escopo

Filtros, comparação de opções, cálculo de totais e confirmação simulada.

## Dependências

- T3 — Criar o conjunto canônico de dados fictícios.
- T5 — Implementar o controle Assistente IA.

