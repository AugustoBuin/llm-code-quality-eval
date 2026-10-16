> 🇧🇷 Português · 🇬🇧 [English](README.en.md)

# Parte 2 — Resultados

Esta parte traz **o que foi encontrado**: o relatório completo, os gráficos, a verificação de
alucinações e os dados brutos (anonimizados) que sustentam tudo.

## O achado principal, em uma frase

> O erro da IA **cai** conforme a instrução fica mais detalhada — mas o **excesso** de instrução só
> atrapalha o **modelo leve** (efeito-U **condicional à capacidade**). O modelo premium é mais preciso,
> aponta ~3× mais problemas e é mais confiável, ao custo de ~2,8× mais caro.

## Conteúdo

| Arquivo / pasta | O que é |
|---|---|
| [`relatorio-final.md`](relatorio-final.md) | **O relatório completo** (17 partes): descritiva, testes, correlações, custo, alucinação e interpretações. Versão em PDF: [`relatorio-final.pdf`](relatorio-final.pdf). |
| [`graficos/`](graficos/) | Os **9 gráficos** (PNG) usados no relatório — erro por nível, boxplots, dispersões, confiabilidade, custo etc. |
| [`analise-alucinacao/`](analise-alucinacao/) | Verificação factual de uma amostra de 30 problemas apontados pela IA: quantos eram reais vs. inventados. |
| [`dados/`](dados/) | Os **dados** que alimentam a análise (todos anonimizados em P1–P5). |

### A pasta `dados/`

| Arquivo | 1 linha = | Colunas-chave |
|---|---|---|
| [`dados/dados.csv`](dados/dados.csv) | uma **execução** (das 150) | `projeto, configuracao, nivel_instrucao, repeticao, nota_final, c1..c5, n_problemas, tokens, cost_usd, duration_ms` |
| [`dados/problemas.csv`](dados/problemas.csv) | um **problema apontado** pela IA | `projeto, configuracao, nivel, repeticao, idx, categoria, severidade` |
| [`dados/gabarito_computed.csv`](dados/gabarito_computed.csv) | um **projeto** (gabarito humano) | `projeto, g1..g5, nota_global` |
| [`dados/gabarito.csv`](dados/gabarito.csv) | o gabarito humano **de entrada** (sem a soma) | idem, sem `nota_global` |
| [`dados/gabarito_long.csv`](dados/gabarito_long.csv) | um **projeto × categoria** | `projeto, categoria, nota_humana` |

> **Anonimização.** Os projetos avaliados aparecem só como P1–P5. Os nomes reais das equipes não estão
> em lugar nenhum deste repositório (ver a Parte 3 e [`projetos-base/`](../projetos-base/)). Nesta versão
> pública, os textos livres que citavam o código das equipes (descrição de cada problema, observações do
> gabarito e evidências da análise de alucinação) foram omitidos; nenhum número da análise depende deles.

## Como reproduzir

A análise que gera estes números e gráficos está na **[Parte 3 — Códigos](../3-codigos/)**. O caminho
mais rápido é abrir o notebook no Google Colab (link na Parte 3) e subir os CSVs de [`dados/`](dados/).
