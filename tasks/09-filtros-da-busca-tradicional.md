# T9 — Implementar filtros da busca tradicional

## Objetivo

Permitir refinar as opções simuladas antes da comparação, sem alterar o conjunto canônico de dados.

## Escopo

- Adicionar filtros de voo direto, horário de chegada e faixa de preço.
- Exibir os filtros aplicados e uma ação para restaurar os valores iniciais.
- Aplicar os filtros localmente aos resultados simulados.
- Preservar filtros e critérios ao alternar entre resultados de voo e hotel.

## Critérios de aceite

- A preferência por voo direto e a chegada antes das 15h podem ser aplicadas pela interface.
- A lista de resultados muda de forma coerente com os filtros selecionados.
- Cada filtro possui rótulo acessível, operação por teclado e foco visível.
- A interface não sugere consulta em tempo real ou integração externa.

## Fora de escopo

Escolha de voo ou hotel, alertas de política e confirmação simulada.

## Dependências

- T3 — Criar o conjunto canônico de dados fictícios.
- T8 — Criar o formulário de busca tradicional.

