> 🇧🇷 Português · 🇬🇧 [English](desenho-experimental.en.md)

# Desenho experimental — o "como" e o "porquê"

Este documento explica **como o estudo foi montado** e **por que** cada decisão foi tomada, de forma
que alguém sem familiaridade com estatística ou com modelos de IA consiga acompanhar. Termos técnicos
estão explicados aqui e no [GLOSSÁRIO](../GLOSSARIO.md).

---

## 1. A pergunta

> Quando pedimos a uma **IA** para avaliar a qualidade de um código, **quanto importa o nível de
> detalhe da instrução** que damos a ela, e **quanto importa a capacidade do modelo** usado?

"Avaliar a qualidade" aqui significa dar uma **nota de 0 a 100** para um projeto de software e apontar
seus problemas. Queremos saber se a IA chega perto de um **gabarito humano** (a nota "verdadeira", dada
por uma pessoa que leu o código com calma) e o que faz ela errar mais ou menos.

---

## 2. Os ingredientes do experimento (os "fatores")

Um **experimento fatorial** é aquele em que combinamos todos os valores de vários fatores entre si.
Aqui há quatro fatores:

| Fator | O que é | Valores |
|---|---|---|
| **Projeto** | Qual software está sendo avaliado | P1, P2, P3, P4, P5 (5 projetos acadêmicos full-stack, anonimizados) |
| **Configuração** | A "capacidade" do modelo de IA | `premium` = Claude Opus 4.8 · `leve` = Gemini 3.5 Flash |
| **Nível de instrução** | Quanto da régua de avaliação é revelado no pedido | 1, 2, 3, 4, 5 |
| **Repetição** | A mesma condição repetida para medir o "ruído" | 1, 2, 3 |

Multiplicando tudo: **5 × 2 × 5 × 3 = 150 execuções**. Cada execução é **uma** avaliação automática
(uma configuração de IA, num nível, lê um projeto e devolve nota + problemas). 150 é a quantidade de "observações"
do estudo. (Para um trabalho individual, o mínimo exigido era 80; coletamos 150, com folga.)

> **Por que repetir 3 vezes?** Modelos de IA não são determinísticos: pedir a mesma coisa duas vezes
> pode dar respostas um pouco diferentes. Repetir mede essa **variabilidade** (chamada aqui de
> *confiabilidade*): quanto a nota "balança" entre repetições da mesma condição.

---

## 3. A régua: a rubrica de qualidade

Para a nota não ser um chute, definimos uma **rubrica** fixa — a mesma régua para a IA e para o
gabarito humano. São **5 categorias, cada uma de 0 a 20 pontos**, somando **100**:

| Categoria | Mede | Base conceitual |
|---|---|---|
| **c1 — Funcionamento** | O código roda e entrega o esperado? | ISO/IEC 25010 (Adequação Funcional) |
| **c2 — Legibilidade** | Nomes, formatação, consistência | Clean Code |
| **c3 — Estrutura** | Funções coesas, sem duplicação | DRY / SRP |
| **c4 — SOLID** | Abstrações e baixo acoplamento | Princípios SOLID |
| **c5 — Não-funcionais** | Segurança, testes, performance | — |

As cinco categorias têm **peso igual**. A rubrica completa está em
[`instrumento/rubrica-qualidade-codigo.md`](instrumento/rubrica-qualidade-codigo.md).

---

## 4. O fator principal: o nível de instrução

Este é o fator que o estudo "mexe" de propósito. Os **5 níveis revelam a rubrica progressivamente** —
do pedido mais vago ao mais detalhado (e possivelmente *detalhado demais*):

| Nível | Quanto da rubrica o prompt revela |
|---|---|
| **1** | Nada — só "dê uma nota de 0 a 100 e aponte problemas" |
| **2** | As 2 primeiras categorias (c1, c2) |
| **3** | As 3 primeiras (c1–c3) |
| **4** | As 5 categorias, com descrição |
| **5** | As 5 categorias com descrição **exaustiva** (instrução "excessiva") |

Os textos exatos estão em [`instrumento/prompts/`](instrumento/prompts/) e a discussão de cada nível em
[`instrumento/prompts-niveis-instrucao.md`](instrumento/prompts-niveis-instrucao.md). Para cada nível há
também um **esquema JSON** ([`instrumento/schemas/`](instrumento/schemas/)) que força a saída da IA num
formato limpo e validável (nota, sub-notas, lista de problemas).

> **Hipótese do "efeito-U":** esperávamos que o erro **caísse** do nível 1 ao 4 (mais instrução, mais
> precisão) e talvez **voltasse a subir** no nível 5 (instrução demais confunde). Por isso o desenho é
> em forma de "U". O resultado real (e a surpresa) está no [relatório](../2-resultados/relatorio-final.md).

---

## 5. O gabarito humano (ground truth)

Para medir o **erro** da IA, precisamos de uma verdade de referência: a **nota humana** de cada
projeto, dada por uma pessoa aplicando a mesma rubrica. Isso é o **gabarito** (*ground truth*).

- É fixo **por projeto**: `G(P1) … G(P5)` (uma nota 0–100 cada), não por execução.
- Foi preenchido **às cegas** — antes de olhar qualquer resposta da IA. Isso é crucial: se a pessoa
  lesse primeiro o que a IA apontou, a nota humana "ancoraria" na da IA e o erro cairia
  artificialmente, **invalidando o estudo**. A independência do gabarito é inegociável.
- O passo a passo está em [`instrumento/COMO-AVALIAR-OS-PROJETOS.md`](instrumento/COMO-AVALIAR-OS-PROJETOS.md)
  e [`instrumento/gabarito_INSTRUCOES.md`](instrumento/gabarito_INSTRUCOES.md).

---

## 6. As contas principais (variáveis derivadas)

A partir da nota da IA (`nota_final`) e do gabarito (`G`), calculam-se:

- **Erro absoluto** — o quão longe a IA ficou da verdade, sem se importar com a direção:
  $$\text{erro\_abs} = \lvert \text{nota\_final} - G(\text{projeto}) \rvert$$
- **Erro com sinal (viés)** — mostra se a IA tende a ser **generosa** (positivo) ou **severa**
  (negativo):
  $$\text{erro\_sinal} = \text{nota\_final} - G(\text{projeto})$$

Outras medidas usadas no relatório: **variância amostral** (com *n*−1), **desvio-padrão**,
**coeficiente de variação (CV)**, teste de **Mann-Whitney** (comparar premium × leve sem supor
distribuição normal), correlações de **Spearman** e **Pearson**, e a **confiabilidade** (desvio-padrão
entre as 3 repetições). O que cada uma significa está no [GLOSSÁRIO](../GLOSSARIO.md).

---

## 7. Cuidados que protegem a validade

- **Anti-contaminação.** Antes de cada execução, os scripts **escondem** arquivos que dariam dicas à
  IA (`CLAUDE.md`, `GEMINI.md`, `.clinerules` etc.) e os **restauram** ao final. Assim a IA avalia só
  o código, não instruções deixadas pelos autores.
- **Mesma régua, mesmo escopo.** A IA e o humano avaliam o **projeto inteiro** (frontend + backend),
  ignorando dependências (`node_modules`), código gerado e assets.
- **Confundimento declarado.** As duas configurações diferem em **fornecedor** (Anthropic × Google) e
  em **tier** ao mesmo tempo. Não dá para separar os dois efeitos, então o estudo conclui sempre em
  termos de "configuração leve/premium", **nunca** de marca.
- **Resumibilidade e timeout.** A coleta de 150 execuções é longa e sujeita a falhas de cota/rede; os
  scripts são **resumíveis** (continuam de onde pararam) e têm **timeout** por execução.

A retrospectiva honesta de tudo que deu certo e errado está em
[`licoes-aprendidas.md`](licoes-aprendidas.md).

---

## 8. Em uma frase

> 5 projetos × 2 configurações de IA × 5 níveis de instrução × 3 repetições = **150 avaliações
> automáticas**, comparadas a um **gabarito humano cego**, para medir como a **instrução** e a
> **capacidade do modelo** afetam a **precisão**, a **severidade** e o **custo** da avaliação de código.
