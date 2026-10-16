> 🇧🇷 Português · 🇬🇧 [English](gabarito_INSTRUCOES.en.md)

# Gabarito humano (ground truth) — como preencher

O gabarito é a **nota de referência verdadeira** de cada projeto, dada por **você** aplicando a
rubrica completa. É contra ele que se mede o erro da IA: `erro_abs = |nota_IA − nota_humana|`.
**Você pontua os 5 projetos uma vez** (não as 150 execuções) — a nota humana é fixa por projeto.

## O que preencher

No arquivo **`gabarito.csv`**, preencha as 5 colunas de nota, **cada uma de 0 a 20 (inteiro)**:

| Coluna | Categoria | O que avalia (resumo — detalhe em `rubrica-qualidade-codigo.md`) |
|---|---|---|
| `g1_funcionamento` | Funcionamento | ISO 25010 Adequação Funcional: roda, entrega o esperado, sem código morto/quebrado |
| `g2_legibilidade` | Legibilidade | Clean Code: nomes, formatação, comentários úteis, padronização |
| `g3_estrutura` | Estrutura | DRY / SRP: funções curtas e coesas, sem duplicação, responsabilidade única |
| `g4_solid` | SOLID | Aplicação dos 5 princípios SOLID |
| `g5_nao_funcionais` | Não-funcionais | Segurança, testes, performance |

- A coluna `observacoes` é opcional (justificativa livre por projeto — ajuda na apresentação oral).
- **NÃO** preencha `nota_global` — ela não existe no template; o script calcula por soma.

## Depois de preencher

```
node gabarito_check.js
```

O script:
- valida que tudo está preenchido e que cada nota é inteiro de 0 a 20;
- calcula `nota_global = g1+g2+g3+g4+g5` (0–100, pesos iguais);
- gera `gabarito_computed.csv` (1 linha/projeto) e `gabarito_long.csv` (1 linha/projeto×categoria).

Se faltar célula, ele lista exatamente quais e não grava nada — é só completar e rodar de novo.

## Dicas

- Edite em um editor de texto ou VS Code (não no Excel pt-BR, que pode trocar a vírgula por `;`).
- Pontue olhando o **mesmo código que a IA viu**: os 5 projetos ficam na pasta que você apontou em
  `projetos.local.config` (variável `ABP`), cada um na subpasta mapeada para P1…P5.
- Viés de avaliador único é uma limitação conhecida — declare no relatório (Parte 5/12).
