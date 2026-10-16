> 🇧🇷 Português · 🇬🇧 [English](licoes-aprendidas.en.md)

# Lições Aprendidas — Projeto "Avaliação de qualidade de código por IA"

**Contexto:** Trabalho Final de Estatística Aplicada (DSM/FATEC) — Augusto Henrique Buin.
Retrospectiva do **processo** de execução do projeto (não dos resultados estatísticos, que estão no
relatório). O foco aqui é o "como": engenharia, operação, decisões e incidentes ao longo da coleta de
**150 avaliações automáticas de código** por dois modelos de IA.
**Data:** 2026-06-19.

> **Atualização (2026-06-19):** as seções **1–5** cobrem a *coleta e análise dos dados*; a **Parte 2**
> (seções 6–10, ao final) acrescenta a retrospectiva da *organização e publicação do repositório GitHub*.

---

## 1. Visão geral do processo (5W3H)

| Dimensão | No projeto |
|---|---|
| **O quê** *(What)* | Projeto empírico ponta a ponta: desenho fatorial → **validação do instrumento** → **coleta de 150 execuções** → tratamento → análise estatística → relatório/notebook/PDF/entrega. Grande parte do esforço foi **engenharia e operação** (scripts, orquestração, contorno de cotas). |
| **Por quê** *(Why)* | Produzir um trabalho com **dados reais** e uma pergunta defensável (efeito do nível de instrução × capacidade do modelo na avaliação de código). O rigor (validar antes, gabarito às cegas, declarar confundimentos) guiou as decisões. |
| **Onde** *(Where)* | Windows local; Git Bash + PowerShell; duas CLIs de IA (Claude Code, Gemini CLI); 5 repositórios; painel AI Studio. O ambiente pesou (paths/encoding do Windows, subshells MSYS, sistemas de cota). |
| **Quando** *(When)* | Janela apertada (~1–2 dias). O **timing externo** virou crítico: resets de cota, janelas de throttle, coleta de várias horas. |
| **Quem** *(Who)* | Estudante (decisões + gabarito humano + recargas), assistente de IA (orquestração/análise/escrita), subagentes (verificação de alucinação) e os dois modelos estudados. Divisão clara: humano no *ground-truth* e nas decisões; IA na execução. |
| **Como** *(How)* | Desenho 5×2×5×3; execuções *headless*; scripts **resumíveis** com neutralização anti-contaminação; `parse.js`; pipeline pandas/scipy; **paralelização particionada**; geração automática de relatório/gráficos/notebook/PDF. |
| **Quanto custou** *(How much)* | **~R$800** (Claude US$ 114,42 ≈ R$ 593 + Gemini ≈ R$ 210), além de horas de relógio e consumo significativo de tokens/compute do assistente. |
| **Quantos** *(How many)* | 150 execuções · ~5 reinícios/incidentes de coleta · 3 recargas do Gemini · 30 problemas verificados · 9 gráficos · 17 partes de relatório · 58 células de notebook. |

---

## 2. Pontos positivos (o que funcionou)

1. **Validar antes de coletar em massa.** As 8 execuções de validação pegaram um bug de escala (a nota
   virando a *média* das sub-notas, ex.: "9") **antes** das 150. Seguro barato que salvou o dataset.
2. **Resumibilidade + idempotência.** Foi a **decisão de design mais valiosa**: salvou em **todos** os
   incidentes (falhas de cota, kills de processo, runs concorrentes). Sempre dava para recomeçar de onde parou.
3. **Disciplina metodológica.** Gabarito preenchido **às cegas** (independência), neutralização
   anti-contaminação, confundimento fornecedor×tier declarado e — crucial — a IA **não** gerou o ground-truth.
4. **Adaptação sob restrição.** Cada parede virou pivô controlado: cota do Gemini esgotou → API key; a API
   forçou outro modelo → decisão limpa (padronizar, re-rodar, documentar) com teste de paridade.
5. **Cultura de verificação.** Teste da chave antes do run cheio; smoke-test do notebook; paridade de
   modelo; alucinação verificada por **agentes independentes lendo o código real**. "Não confie, verifique."
6. **Resultado robusto.** A análise revelou um achado limpo e não-óbvio (o "efeito-U" condicional à
   capacidade do modelo).

---

## 3. Pontos negativos (a melhorar)

1. **Presumir que um processo parou (falha de verificação).** Um `TaskStop` retornou *"not found"* e
   assumiu-se que o processo havia morrido — mas ele estava **órfão e rodando concorrente**, arriscando
   corromper dados. *Verificar a morte do processo, nunca presumir.*
2. **Estimativas de custo repetidamente otimistas.** Custo por célula do Gemini foi subestimado em ~30×
   (chute ~R$0,03–0,10; real ~R$2,70). Conclusões precipitadas ("é mais que suficiente", "esgotou de vez").
   *Ancoragem no modelo de token errado e otimismo sem hedge.*
3. **Infra/cotas subdimensionadas no planejamento.** Limite de sessão do Claude, exaustão de capacidade do
   tier grátis do Gemini e a taxa de queima de crédito **não foram antecipados**. O relógio real ficou muito
   acima do estimado; quase todo o atrito veio daí.
4. **Mapeamento auth→modelo descoberto tarde.** Só se percebeu que a API key servia outro modelo (3.5 em vez
   de 2.5) **no meio** da coleta → custou re-rodar 22 células.
5. **Timeout ausente no início.** Um subprocesso pendurado travou a coleta por ~1h até ser notado. Defesa
   que deveria existir desde o começo.
6. **Desperdício acumulado.** Re-coleta, *hammering* de throttle e tentativas falhas (que ainda faturam)
   gastaram tempo/dinheiro evitáveis com pré-voo melhor.

---

## 4. Aprendizados (princípios para a próxima)

- **Pré-voo de dependências externas** antes de escalar: cotas, limites de taxa, mapeamento **auth→modelo** e
  **custo medido de 1 unidade** antes de comprometer N.
- **Jobs longos nascem resumíveis, idempotentes e com timeout** — não é "depois", é dia 1.
- **Verifique estado, não presuma** — especialmente "isso parou mesmo?". Confirme via `ps`/PID.
- **Ancore estimativas em dados reais cedo** e **declare incerteza**; ao errar, **corrija imediatamente e com
  transparência**.
- **Mantenha o humano no ground-truth e nas decisões**; mantenha a **saída da IA fora do gabarito** — senão o
  experimento se invalida.
- **Separe preocupações e particione** para paralelizar com segurança (premium×leve; `índice % N`); **nunca**
  rode dois orquestradores no mesmo diretório de saída.
- **Documente desvios enquanto acontecem** (bug de escala, troca de modelo, custo) — a seção de Limitações
  praticamente se escreve sozinha.

---

## 5. Síntese

O **planejamento metodológico** foi o ponto forte (validação, rigor e resumibilidade salvaram o projeto); a
**previsão de infraestrutura e custo** foi o ponto fraco (quase todo o atrito veio de cotas/limites que um
pré-voo teria antecipado). Os mecanismos de segurança — **resumir, verificar, documentar** — absorveram o
atrito sem perda de dado nem de validade. A postura mais valiosa, no fim, foi **verificar tudo**, incluindo
admitir e corrigir os próprios erros de estimativa.

---

# Parte 2 — Organização e publicação do repositório

*Retrospectiva da fase posterior à entrega acadêmica: transformar o projeto num **repositório GitHub
público e bilíngue** (estrutura em 3 partes, anonimização, convenção de commits, espelho em inglês,
gráficos e PDFs nos dois idiomas). Mesmo formato das seções 1–5; aqui o "como" é o **meta-processo**.*

## 6. Visão geral da publicação (5W3H)

| Dimensão | Na publicação |
|---|---|
| **O quê** *(What)* | Empacotar o projeto entregue num repositório público em 3 partes (processo / resultados / códigos): anonimização P1–P5, parametrização dos scripts, convenção de commits, espelho em inglês e gráficos/PDFs bilíngues. |
| **Por quê** *(Why)* | Compartilhar o estudo de forma **didática e reprodutível**, sem expor equipes terceiras nem segredos, e preparar terreno para um futuro artigo. |
| **Onde** *(Where)* | Windows local; Git Bash + PowerShell; Git/GitHub; Python (`markdown`, `matplotlib`), Node, Edge headless; 16 subagentes de tradução. |
| **Quando** *(When)* | Pós-entrega — **sem** pressão de cota/custo desta vez; o gargalo virou **organização e consistência**, não infraestrutura. |
| **Quem** *(Who)* | Estudante (decisões: licença, idioma do commit, o que publicar), assistente (montagem/anonimização/commits), 16 subagentes (tradução paralela sob um **brief único**). |
| **Como** *(How)* | Esqueleto 3-partes; `.gitignore` + varreduras (`grep`, `git check-ignore`, `git add -n`); config local gitignored; fan-out de tradução com brief; auditoria de links; gráficos PT/EN; PDF via Edge headless; commits Conventional incrementais. |
| **Quanto custou** *(How much)* | **Sem custo de API** (nenhuma coleta nova); custo = tokens/compute do assistente + tempo de organização. |
| **Quantos** *(How many)* | ~16 docs espelhados · 6 commits · 18 gráficos (9 PT + 9 EN) · 2 PDFs · 222 links auditados · 2 bugs de link pré-existentes corrigidos. |

---

## 7. Pontos positivos (o que funcionou)

1. **Anonimização e segredos como invariantes verificados por máquina.** A cada commit: `grep` por nomes
   reais, `git check-ignore`, `git add -n`. Foi isso — não o olho — que pegou o `.gitignore` engolindo um
   arquivo e confirmou **zero vazamento**.
2. **Parametrização via config gitignored.** Nomes reais e chave saíram dos scripts para um
   `projetos.local.config` fora do Git → repo público limpo **e** executável. Padrão reaproveitável.
3. **"Roda mesmo?" em vez de "parece certo".** Rodar `gerar_graficos.py` de um diretório qualquer provou o
   refactor de caminhos; o smoke da geração de PDF validou a toolchain. Mesmo "não confie, verifique".
4. **Auditoria de links automatizada.** O checker achou **2 links quebrados que eu mesmo introduzi** ao
   mover arquivos para a estrutura nova — coisa que revisão visual não pega.
5. **Brief único para o fan-out.** Um só contrato de terminologia+links guiou 16 subagentes em paralelo:
   consistência + contexto enxuto. E eles **reportaram dúvidas**, o que revelou os ajustes reais.
6. **Convenção de commit antes do 1º commit** — porque o histórico é permanente; a regra "anonimização vale
   na mensagem" nasceu daí.
7. **Commits incrementais separados por preocupação** (ex.: o `fix(docs)` dos bugs pré-existentes apartado
   do `i18n`).

---

## 8. Pontos de atrito (a melhorar)

1. **Bugs viajaram junto na cópia.** Ao mover relatório/scripts para a estrutura 3-partes, links relativos
   quebraram **silenciosamente** e só apareceram 2 fases depois. *Auditar links/caminhos no momento de
   relocar, não lá na frente.*
2. **`.gitignore` com allow-list é frágil.** `/projetos-base/*` + exceções engoliu um arquivo novo. *Pasta
   com ignore-de-lista exige nova exceção a cada arquivo que se queira manter.*
3. **Escapes em heredoc do Bash morderam 2×.** Regex com `\` no heredoc perdeu barra duas vezes. *Em
   heredoc, evitar regex com barra/escape — usar `split/join` ou escrever o script em arquivo.*
4. **Caminho MSYS × Windows nativo.** `/c/...` falhou no `sys.path` do Python (precisa `C:/...`). Mesma
   família de atrito Windows da Parte 1 (cp1252, aspas).
5. **Artefatos derivados ficam obsoletos.** Editar o relatório EN **depois** de gerar o PDF deixou o PDF
   defasado → regerar. *Regenerar derivados (PDF, gráficos) é passo de **build final**, não ad-hoc.*
6. **Sem verificação visual.** Faltou `pdftoppm` para renderizar os PDFs; só deu para conferir
   magic-byte/tamanho. *Ter sempre um caminho de verificação para artefato binário.*

---

## 9. Aprendizados (princípios para a próxima)

- **Invariantes valem em todo artefato** — inclusive mensagem de commit e histórico do Git — e se checam por
  **comando**, não por confiança (sem nome real, sem segredo, links resolvem, script roda).
- **Separe decisão humana de execução mecânica**: licença, idioma do commit e o que publicar foram
  perguntados; o resto foi automático.
- **Toda transição merece verificação imediata.** Quase todo atrito veio de *transições* — trocar de
  estrutura, cruzar PT↔EN, MSYS↔Windows, fonte↔artefato — onde o erro passa calado.
- **Paralelize com um contrato** (o brief) e peça **incerteza reportada**: a divergência dos agentes é o
  radar de qualidade.

---

## 10. Síntese

A disciplina que salvou a coleta (validar, resumir, verificar) virou, na publicação, **verificação mecânica
de invariantes**: segredo, anonimização, links e build conferidos por comando. O ponto fraco foram as
**transições** — mover arquivos de estrutura, cruzar idiomas, MSYS↔Windows, fonte↔derivado — onde os erros
aparecem em silêncio e cobram caro depois. A lição que costura as duas partes: **cada transição precisa de
um check automático na hora** — foi o que, no fim, pegou cada problema.
