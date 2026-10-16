> 🇧🇷 Português · 🇬🇧 [English](GLOSSARIO.en.md)

# Glossário

Termos técnicos usados no repositório, explicados em linguagem simples. A ideia é que você entenda o
estudo **só com este repositório**, sem precisar de conhecimento prévio de estatística ou de IA.

## IA, modelos e a coleta

- **IA / LLM (Large Language Model).** Um "modelo de linguagem" — um programa treinado em muito texto
  que responde a pedidos escritos. Aqui ele é usado para **ler código e dar uma nota**.
- **Configuração `premium` / `leve`.** As duas "potências" de IA comparadas. `premium` = um modelo mais
  capaz (e caro): **Claude Opus 4.8**. `leve` = um modelo mais rápido e barato: **Gemini 3.5 Flash**.
- **Prompt.** O texto do pedido enviado à IA ("avalie este projeto e dê uma nota..."). Os 5 prompts do
  estudo estão em [`1-processo/instrumento/prompts/`](1-processo/instrumento/prompts/).
- **Nível de instrução (1–5).** Quanto da régua de avaliação o prompt revela: do mínimo (nível 1) ao
  detalhe excessivo (nível 5). É o fator que o estudo manipula de propósito.
- **Token.** A "fatia" de texto que os modelos contam para medir tamanho e cobrar. Mais ou menos uma
  palavra (ou pedaço dela). `tokens_total` e `output_tokens` medem o consumo de cada execução.
- **CLI (Command-Line Interface) / headless.** Rodar a IA pelo **terminal**, sem interface gráfica,
  controlada por scripts. "Headless" = sem tela, automatizada.
- **Schema JSON.** Um "molde" que obriga a resposta da IA a vir num formato fixo e validável (nota,
  sub-notas, lista de problemas). Garante dados limpos. Veja
  [`1-processo/instrumento/schemas/`](1-processo/instrumento/schemas/).
- **Alucinação.** Quando a IA afirma com confiança algo **falso** — aqui, apontar um "problema" no
  código que **não existe**. A taxa de alucinação foi medida em
  [`2-resultados/analise-alucinacao/`](2-resultados/analise-alucinacao/).
- **Neutralização / anti-contaminação.** Esconder arquivos que dariam dicas à IA (`CLAUDE.md`,
  `GEMINI.md`, `.clinerules`) durante a avaliação, para que ela julgue só o código.

## Avaliação de qualidade de código

- **Rubrica.** A "régua" de avaliação: 5 categorias de 0 a 20 (100 no total), igual para a IA e para o
  humano. Em [`1-processo/instrumento/rubrica-qualidade-codigo.md`](1-processo/instrumento/rubrica-qualidade-codigo.md).
- **Gabarito / ground truth.** A nota **humana** de referência de cada projeto — a "verdade" contra a
  qual o erro da IA é medido. Fixa por projeto: `G(P1) … G(P5)`.
- **Às cegas (blind).** Pontuar o gabarito **antes** de ver as respostas da IA, para a nota humana não
  ser influenciada por ela. Proteger isso é o que mantém o estudo válido.
- **ISO/IEC 25010.** Uma norma internacional de **qualidade de software**; aqui inspira a categoria c1
  (Funcionamento / Adequação Funcional).
- **Clean Code.** Conjunto de boas práticas de **legibilidade** (nomes claros, funções pequenas);
  inspira a categoria c2.
- **DRY (Don't Repeat Yourself).** "Não se repita": evitar código duplicado. Base da categoria c3.
- **SRP (Single Responsibility Principle).** "Responsabilidade única": cada parte do código faz uma
  coisa só. Também na categoria c3.
- **SOLID.** Cinco princípios de design orientado a objetos (incluindo o SRP) para código flexível e
  desacoplado. É a categoria c4.

## Estatística

- **Experimento fatorial.** Desenho em que se combinam **todos** os valores de vários fatores. Aqui:
  5 projetos × 2 configurações × 5 níveis × 3 repetições = **150** execuções.
- **Observação.** Cada unidade de dado — aqui, **uma execução** (uma avaliação registrada). São 150.
- **`erro_abs` (erro absoluto).** O quão longe a nota da IA ficou do gabarito, sem direção:
  `|nota_IA − G|`. Quanto menor, mais precisa a IA.
- **`erro_sinal` / viés.** `nota_IA − G`. Positivo = a IA foi **generosa**; negativo = **severa**.
- **Média, mediana, moda.** Medidas de "centro": média = soma/quantidade; mediana = valor do meio;
  moda = valor mais frequente. A **mediana** é mais robusta a valores extremos.
- **Variância amostral / desvio-padrão.** Medem o "espalhamento" dos dados. A variância amostral usa
  `n−1` no denominador (correção para amostras). O desvio-padrão é a raiz da variância (mesma unidade
  dos dados).
- **Coeficiente de variação (CV).** Desvio-padrão dividido pela média (em %). Permite comparar a
  dispersão de grupos com médias diferentes.
- **Confiabilidade.** Aqui: o desvio-padrão da nota **entre as 3 repetições** da mesma condição. Mede o
  "ruído" do avaliador automático — quanto a nota balança ao repetir o mesmo pedido.
- **Teste de Mann-Whitney (U).** Teste **não-paramétrico** que compara dois grupos (ex.: premium ×
  leve) sem supor que os dados seguem uma distribuição normal. Útil quando os dados são assimétricos.
- **Correlação de Spearman / Pearson.** Medem se duas variáveis "andam juntas". **Pearson** capta
  relação **linear**; **Spearman** capta relação **monotônica** (por ordem) e é mais robusto. Valor de
  −1 a +1.
- **p-valor / significância.** A chance de ver um resultado tão extremo quanto o observado se não
  houvesse efeito real. Por convenção, `p < 0,05` é considerado "estatisticamente significativo".
- **Efeito-U.** Um padrão em forma de "U": o erro **cai** e depois **volta a subir**. A hipótese era que
  instrução demais (nível 5) pioraria a IA. O estudo achou um U **condicional**: só aparece no modelo
  leve (ver [relatório](2-resultados/relatorio-final.md)).
- **Confundimento (confounding).** Quando dois efeitos não podem ser separados. Aqui, `premium` e
  `leve` diferem em **fornecedor** e em **capacidade** ao mesmo tempo — por isso as conclusões falam de
  "configuração", nunca de marca.

## Git e repositório

- **Submódulo (git submodule).** Um repositório Git **referenciado** dentro de outro, sem copiar o
  código. Será usado (mediante autorização) para apontar aos 5 projetos-base preservando a autoria
  deles. Ver [`projetos-base/`](projetos-base/).
- **`.gitignore`.** Lista de arquivos que o Git **ignora** de propósito — aqui, segredos
  (`.gemini_key`), config local (`projetos.local.config`) e saídas pesadas.
- **Licença MIT / CC BY 4.0.** MIT cobre o **código**; CC BY 4.0 cobre o **conteúdo** (textos, dados,
  gráficos). Ver [`LICENSE`](LICENSE) e [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md).
