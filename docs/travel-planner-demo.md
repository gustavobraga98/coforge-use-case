# Planejador de Viagens — Documento de Visão

## Objetivo

Criar uma plataforma fictícia de planejamento de viagens corporativas para demonstrar, de forma clara e segura, o potencial de uma experiência assistida por IA.

A plataforma não representa um produto de cliente nem utiliza dados reais. Ela existe para mostrar como uma pessoa pode transformar um pedido em linguagem natural em um plano de ação completo, com informações organizadas, escolhas claras e execução acompanhada.

## A ideia central

Em vez de a pessoa precisar navegar por várias telas, comparar opções manualmente e preencher diversos formulários, ela conversa com um assistente dentro da plataforma.

O assistente entende o objetivo da viagem, consulta as informações necessárias, apresenta opções adequadas e conduz a pessoa pelas decisões importantes. Quando houver uma ação que precise de confirmação, a plataforma torna essa decisão explícita e fácil de entender.

O resultado desejado é uma experiência que pareça uma central de planejamento: simples para começar, rica quando for preciso analisar alternativas e sempre transparente sobre o que será feito.

## Tema da demonstração

O tema será uma plataforma fictícia de viagens corporativas, chamada provisoriamente de **Atlas Travel**.

Ela atende pessoas que precisam planejar, aprovar e acompanhar viagens de trabalho. A demonstração deve se concentrar na jornada de Gustavo, mas deixar claro que há regras, orçamento e responsabilidades por trás de cada decisão.

## Dois modos da mesma plataforma

A plataforma terá um controle visível chamado **Assistente IA**. Ele permite ligar ou desligar a experiência assistida, sem alterar os dados, as regras ou as capacidades já existentes na plataforma.

Com o assistente desligado, a demonstração apresenta uma experiência tradicional: a pessoa informa destino e datas, aplica filtros, compara opções de voo e hotel, verifica custos e confirma a reserva pelas telas da plataforma.

Com o assistente ligado, a mesma pessoa pode descrever a necessidade em linguagem natural. O assistente usa as informações e ações já disponíveis para organizar alternativas, pedir escolhas relevantes e acompanhar a conclusão do plano.

No modo assistido, a área de trabalho passa a ser uma composição própria: o contexto compacto da rota fica na rail esquerda, o globo permanece como foco visual central e o chat ocupa uma rail persistente à direita por toda a altura disponível abaixo do cabeçalho. A ativação faz uma transição breve que torna essa reorganização perceptível; em preferências de movimento reduzido, a composição muda sem deslocamentos ou pulsos.

O contraste é intencional: a IA não substitui a plataforma nem elimina os controles tradicionais. Ela torna as capacidades existentes mais acessíveis, coordenadas e contextuais. Os controles usuais continuam disponíveis para que a pessoa escolha como deseja interagir.

### Sequência de apresentação

1. Mostrar rapidamente o planejamento manual de uma viagem: datas, filtros, comparação e reserva.
2. Ligar o controle **Assistente IA**.
3. Repetir o mesmo objetivo com uma solicitação natural.
4. Mostrar como a plataforma organiza opções, apoia decisões e conduz a confirmação, preservando os mesmos dados e regras do modo tradicional.

## Cenários de demonstração

O mock começa sem uma viagem pré-configurada. A busca tradicional oferece uma lista curada de 20 cidades de demonstração para origem e destino. Cada combinação gera, de modo determinístico na sessão, um cenário fictício coerente de período, compromisso, orçamento, voos e hospedagem. A seleção não consulta disponibilidade externa.

## Cenário principal

A demonstração começa com um pedido natural, como:

> “Planeje uma viagem para Gustavo, de São Paulo a Nova York, entre 12 e 16 de novembro. Ele precisa chegar antes das 15h no dia 12, prefere voos diretos e o orçamento é de até US$ 3.000.”

A plataforma transforma esse pedido em um plano de viagem. Para isso, considera preferências do viajante, datas, agenda, orçamento e regras da empresa, sempre com informações totalmente fictícias.

Em seguida, ela apresenta alternativas que façam sentido. Por exemplo, uma opção mais econômica, outra mais confortável e outra que priorize o horário de chegada.

## O que a pessoa deve perceber durante a demonstração

### 1. A conversa inicia o trabalho

A pessoa começa com uma solicitação comum, do jeito que explicaria a necessidade a um colega. Não é necessário conhecer menus, filtros ou processos internos para começar.

### 2. As informações aparecem na forma certa

Em vez de uma resposta longa em texto, a plataforma pode apresentar o que ajuda na decisão:

- opções de voo e hotel comparadas lado a lado;
- um resumo visual do itinerário;
- custo total estimado;
- alertas de orçamento ou de política;
- uma linha do tempo da viagem.

Cada elemento deve deixar a situação mais clara, não apenas enfeitar a tela.

### 3. A plataforma pede decisões quando elas realmente importam

Nem toda escolha precisa ser feita por conversa. Quando houver alternativas relevantes, a plataforma oferece uma interação objetiva.

Exemplo:

> “Encontrei duas opções dentro do horário desejado. Você prefere reduzir o custo em US$ 280 ou encurtar a viagem em três horas?”

A decisão pode ser tomada diretamente em uma comparação visual, e não apenas respondida em texto.

### 4. Ações sensíveis são claras e aprovadas

Antes de confirmar algo que gere custo, ultrapasse uma regra ou altere uma reserva, a plataforma mostra o impacto e pede aprovação.

Exemplo:

> “Esta opção excede o orçamento em US$ 180, mas é a única que permite chegar a tempo da reunião. Deseja solicitar a exceção?”

A pessoa vê o motivo, o valor e as alternativas antes de avançar.

### 5. O plano evolui enquanto a pessoa acompanha

Depois de uma escolha, o itinerário, o orçamento e os próximos passos se atualizam. A pessoa deve sentir que está colaborando com a plataforma, e não esperando por uma resposta estática.

As escolhas nos widgets retornam ao agente automaticamente. Confirmar o calendário comunica as datas completas; selecionar voo ou hospedagem atualiza os custos compartilhados com o modo tradicional. Datas numéricas ambíguas continuam pendentes até essa decisão. A revisão final exige um clique explícito e permanece inteiramente simulada.

## Jornada demonstrada

1. A pessoa descreve a necessidade da viagem.
2. A plataforma organiza as restrições e identifica informações que faltam.
3. Ela monta alternativas coerentes e explica seus principais trade-offs.
4. A pessoa escolhe uma alternativa ou ajusta preferências pela própria tela.
5. Quando necessário, uma aprovação é solicitada com contexto.
6. A plataforma confirma a reserva simulada e apresenta o itinerário final.
7. O resumo final mostra o que foi decidido, o custo previsto e os próximos passos.

## Cenário de continuação: mudança inesperada

Depois de concluir o planejamento inicial, a demonstração pode mostrar uma situação comum:

> “O voo de volta foi cancelado. Reorganize a viagem para que Gustavo participe da reunião de quinta-feira e permaneça dentro da política da empresa.”

Esse segundo momento reforça que a plataforma não serve apenas para pesquisar opções. Ela ajuda a lidar com mudanças, avaliar consequências e conduzir uma nova decisão de forma organizada.

## Limites do mock

- Todos os nomes, valores, itinerários, políticas e reservas serão fictícios.
- A única integração externa permitida é Geoapify, usada exclusivamente para geocodificar localidades e renderizar o mapa. A geografia é real; planejamento, preços, políticas e confirmação seguem fictícios.
- Nenhuma integração real, compra, reserva ou comunicação externa será realizada.
- A demonstração não reproduz telas, dados, regras ou fluxos de qualquer cliente.
- O foco é a experiência e o potencial de aplicação em diferentes plataformas, não o funcionamento de uma operação de viagens real.

## Mensagem que a demonstração deve deixar

Uma plataforma que já possui dados, regras e ações pode se tornar muito mais simples de usar quando a pessoa consegue conversar com ela, visualizar as melhores opções e decidir no momento certo.

O planejador de viagens é apenas o exemplo. A mesma abordagem pode apoiar muitos produtos e processos corporativos que hoje exigem procurar informações, comparar alternativas, pedir aprovação e executar tarefas em várias etapas.
