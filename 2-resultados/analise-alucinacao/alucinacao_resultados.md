> 🇧🇷 Português · 🇬🇧 [English](alucinacao_resultados.en.md)

# Análise de alucinação — resultados

Amostra de **30 problemas** apontados pela IA (15 premium + 15 leve, 3 por projeto×config), verificados
um a um contra o **código-fonte real** dos projetos. Veredito por alegação:
- **VERDADEIRO** = a alegação confere com o código.
- **PARCIAL** = o núcleo confere, mas há imprecisão em um detalhe/mecanismo descrito.
- **FALSO** = alucinação (a alegação é factualmente falsa; o código não contém o descrito).

> **Versão pública:** a coluna de evidência foi omitida. Ela citava arquivos, linhas e trechos do
> código das equipes, o que permitiria identificá-las. Os vereditos e a síntese não mudam.

| id | proj | config | veredito | evidência |
|---|---|---|---|---|
| 1 | P1 | leve | **FALSO** | *omitida* |
| 2 | P1 | leve | VERDADEIRO | *omitida* |
| 3 | P1 | leve | PARCIAL | *omitida* |
| 4 | P1 | premium | VERDADEIRO | *omitida* |
| 5 | P1 | premium | VERDADEIRO | *omitida* |
| 6 | P1 | premium | VERDADEIRO | *omitida* |
| 7 | P2 | leve | VERDADEIRO | *omitida* |
| 8 | P2 | leve | PARCIAL | *omitida* |
| 9 | P2 | leve | PARCIAL | *omitida* |
| 10 | P2 | premium | VERDADEIRO | *omitida* |
| 11 | P2 | premium | VERDADEIRO | *omitida* |
| 12 | P2 | premium | VERDADEIRO | *omitida* |
| 13 | P3 | leve | PARCIAL | *omitida* |
| 14 | P3 | leve | VERDADEIRO | *omitida* |
| 15 | P3 | leve | VERDADEIRO | *omitida* |
| 16 | P3 | premium | VERDADEIRO | *omitida* |
| 17 | P3 | premium | VERDADEIRO | *omitida* |
| 18 | P3 | premium | PARCIAL | *omitida* |
| 19 | P4 | leve | VERDADEIRO | *omitida* |
| 20 | P4 | leve | VERDADEIRO | *omitida* |
| 21 | P4 | leve | VERDADEIRO | *omitida* |
| 22 | P4 | premium | VERDADEIRO | *omitida* |
| 23 | P4 | premium | VERDADEIRO | *omitida* |
| 24 | P4 | premium | VERDADEIRO | *omitida* |
| 25 | P5 | leve | VERDADEIRO | *omitida* |
| 26 | P5 | leve | VERDADEIRO | *omitida* |
| 27 | P5 | leve | VERDADEIRO | *omitida* |
| 28 | P5 | premium | VERDADEIRO | *omitida* |
| 29 | P5 | premium | PARCIAL | *omitida* |
| 30 | P5 | premium | VERDADEIRO | *omitida* |

## Síntese

| | VERDADEIRO | PARCIAL | **FALSO (alucinação)** |
|---|---|---|---|
| **premium** (15) | 13 (87%) | 2 (13%) | **0 (0%)** |
| **leve** (15) | 10 (67%) | 4 (27%) | **1 (6,7%)** |
| **Geral** (30) | 23 (77%) | 6 (20%) | **1 (3,3%)** |

**Taxa de alucinação (alegações falsas): ~3,3% no geral — 0% no premium, 6,7% no leve.**

- As alegações são, na grande maioria, **factualmente corretas**: ambos os modelos raramente inventam.
- A **única alucinação** foi do **leve**: um aviso específico do React Compiler que sequer está habilitado
  no projeto — uma alegação técnica plausível, porém falsa.
- As **imprecisões parciais** são mais frequentes no leve (4 vs 2) e costumam ser de *enquadramento*
  (o fato existe, mas o mecanismo/detalhe descrito está impreciso — ex.: chamar de "validação" o que é
  falha de asserção; afirmar ausência de CONTRIBUTING.md que existe).
- *Nota metodológica:* os problemas 7 e 8 (leve) apontam a ausência de um `GEMINI.md` — um arquivo de
  instrução de IA, **não** um defeito de código; é observação de baixo valor (e os arquivos de IA foram
  neutralizados na coleta).

*Verificação feita por verificadores automatizados lendo o código; recomenda-se validação humana por
amostragem (sobretudo dos casos PARCIAL).*
