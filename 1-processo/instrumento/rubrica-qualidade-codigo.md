> 🇧🇷 Português · 🇬🇧 [English](rubrica-qualidade-codigo.en.md)

# Rubrica de Avaliação de Qualidade de Código

**Trabalho Final – Estatística Aplicada (DSM / FATEC)**
**Uso da IA para avaliação de código em projetos acadêmicos**

---

## Como esta rubrica é usada (leia antes)

Esta rubrica tem **dois papéis distintos** que NÃO devem se misturar:

1. **Régua de medição (FIXA).** A rubrica completa — as 5 categorias, 100 pontos — é
   aplicada de forma idêntica a:
   - **gabarito humano**: você pontua os 5 projetos uma vez → gera `nota_humana_ref`;
   - **leitura de cada saída da IA**: a IA devolve a nota dela → `nota_ia`.
   A régua **nunca muda** entre execuções. É o que torna as 150 observações comparáveis.

2. **Manipulação experimental (VARIÁVEL).** O fator `nivel_instrucao` controla **quanto
   desta rubrica é revelado à IA no prompt** (ver tabela no fim). A forma de pontuar a
   saída NÃO muda — só muda o que a IA foi informada.

> Princípio da ordenação: as categorias estão dispostas **do mais óbvio ao menos óbvio**
> para um desenvolvedor iniciante. Um avaliador pouco instruído tende a capturar as
> categorias óbvias sozinho; o valor de instruir está em forçar atenção às não-óbvias.

**Escala por categoria (0–20):**

| Faixa | Significado |
|------:|-------------|
| 0–4   | Ausente / problema crítico |
| 5–9   | Deficiente |
| 10–13 | Regular |
| 14–17 | Bom |
| 18–20 | Excelente |

**Nota final = soma das 5 categorias (0–100).** Pesos iguais (20 cada) por padrão —
ajustáveis se você quiser dar mais peso ao não-óbvio (registrar a decisão no relatório).

Legenda: **[O]** = critério objetivo (checável por linter/métrica/ferramenta) ·
**[S]** = critério subjetivo (depende de julgamento).

---

## Categoria 1 — Funcionamento e Conformidade Básica  *(MAIS ÓBVIO)*  — 20 pts
Âncora: **ISO/IEC 25010 — Adequação Funcional** (completude, correção, pertinência).

- **[O]** O código compila / executa sem erros.
- **[O]** As funcionalidades previstas no ABP estão presentes.
- **[O]** Ausência de código morto, comentado ou quebrado evidente.
- **[S]** O resultado condiz com o objetivo declarado do projeto.

---

## Categoria 2 — Legibilidade e Padronização  — 20 pts
Âncora: **Clean Code** (nomes, formatação) · **ISO 25010 — Analisabilidade**.

- **[O]** Convenção de nomenclatura consistente (verificável por linter).
- **[O]** Formatação e indentação consistentes (formatter/linter).
- **[S]** Nomes significativos para variáveis, funções e classes.
- **[S]** Comentários úteis — explicam o "porquê", não o óbvio.

---

## Categoria 3 — Estrutura e Organização  — 20 pts
Âncora: **Clean Code (DRY, funções pequenas)** · **SOLID — SRP** · **ISO 25010 — Modularidade**.

- **[O]** Funções/métodos curtos (ex.: limite de linhas; complexidade ciclomática baixa).
- **[O]** Ausência de duplicação relevante (DRY) — detectável por clone detector.
- **[S]** Responsabilidade única por função/módulo (SRP).
- **[S]** Separação de camadas / coesão adequada.

---

## Categoria 4 — Design e Princípios SOLID  — 20 pts
Âncora: **SOLID — OCP, LSP, ISP, DIP** · **ISO 25010 — Modificabilidade, Reusabilidade**.

- **[S]** Abstrações/interfaces adequadas; dependência de abstrações (DIP/ISP).
- **[S]** Aberto para extensão, fechado para modificação (OCP).
- **[S]** Baixo acoplamento e alta coesão entre módulos.
- **[S]** Substituibilidade de subtipos sem quebrar o contrato (LSP).

> Categoria majoritariamente subjetiva: exige experiência → tende a ser **invisível** para
> iniciantes e só aparece quando explicitamente instruída.

---

## Categoria 5 — Atributos Não-Funcionais "Invisíveis"  *(MENOS ÓBVIO)*  — 20 pts
Âncora: **ISO/IEC 25010 — Segurança, Confiabilidade, Eficiência de Desempenho,
Testabilidade, Portabilidade**.

- **[O]** Tratamento de erros/exceções e casos-limite (edge cases).
- **[O]** Existência / cobertura de testes automatizados.
- **[O]** Vulnerabilidades evidentes (entrada não validada, segredos no código) — SAST/lint.
- **[S]** Eficiência/performance adequada ao contexto do projeto.
- **[S]** Portabilidade / configuração externalizada (sem valores fixos no código).

---

## Mapeamento: níveis de instrução (`nivel_instrucao`)

O que muda é **quanto da rubrica acima vai no prompt** — a forma de pontuar a saída é sempre a régua completa.

| Nível | Rótulo | O que é revelado à IA no prompt |
|------:|--------|----------------------------------|
| 1 | Pouquíssima | Nada da rubrica. Ex.: *"Avalie a qualidade deste código de 0 a 100 e justifique."* |
| 2 | Pouca | Apenas as categorias óbvias (1 e 2), só os títulos. |
| 3 | Razoável | Categorias 1–3 com descrição breve. |
| 4 | Muita | Rubrica completa (1–5) com descrição e critérios. |
| 5 | Excessiva | Rubrica completa + todos os sub-critérios, exemplos exaustivos, ênfase repetida e instruções redundantes (testa se "instrução demais" degrada o resultado). |

**Hipótese de trabalho:** `erro_abs = |nota_ia − nota_humana_ref|` deve diminuir de
Pouquíssima → Muita (a IA passa a enxergar o não-óbvio) e pode **voltar a subir** em
Excessiva (sobrecarga / alucinação). A forma dessa curva é o resultado central.

---

## Saída padronizada esperada da IA (schema JSON)

Para automatizar a coleta das 150 execuções, instrua a IA a responder **somente** com:

O modelo devolve **apenas** o bloco de avaliação abaixo; os metadados (`projeto`,
`configuracao`, `nivel_instrucao`, `repeticao`) são anexados por você ao montar o CSV.

```json
{
  "nota_final": 0,
  "categorias": {
    "c1_funcionamento": 0,
    "c2_legibilidade": 0,
    "c3_estrutura": 0,
    "c4_solid": 0,
    "c5_nao_funcionais": 0
  },
  "problemas": [
    { "categoria": "c5_nao_funcionais", "severidade": "alta", "descricao": "..." }
  ],
  "n_problemas": 0
}
```

`nota_final`, `categorias` e `n_problemas` alimentam direto o CSV. `problemas[]` serve
para a verificação de alucinação (checar, numa amostra, se cada item realmente existe no código).
