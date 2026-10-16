> 🇧🇷 Português · 🇬🇧 [English](README.en.md)

# Parte 1 — Processo utilizado

Esta parte conta **como** o estudo foi pensado e montado, e **por quê**. É a metodologia: o desenho do
experimento, o instrumento de medição (a rubrica e os prompts) e as lições aprendidas no caminho.

> 🟢 **Comece por aqui** se quer entender o estudo. As Partes 2 (resultados) e 3 (códigos) fazem mais
> sentido depois de ler isto.

## Conteúdo

| Arquivo | O que é |
|---|---|
| [`desenho-experimental.md`](desenho-experimental.md) | **O coração desta parte.** Explica, para iniciantes, o desenho 5×2×5×3, os fatores, a rubrica, os níveis de instrução, o gabarito humano e as fórmulas de erro. |
| [`licoes-aprendidas.md`](licoes-aprendidas.md) | Retrospectiva honesta do processo (em 5W3H): o que funcionou, o que falhou, o que custou e o que ficou de aprendizado. |
| [`instrumento/`](instrumento/) | O **instrumento de coleta**: a régua e os pedidos feitos à IA. |

### A pasta `instrumento/`

É o "questionário" do experimento — só que o respondente é um modelo de IA.

| Arquivo / pasta | O que é |
|---|---|
| [`instrumento/rubrica-qualidade-codigo.md`](instrumento/rubrica-qualidade-codigo.md) | A **rubrica**: 5 categorias de 0 a 20 (100 no total). A régua única, igual para a IA e para o humano. |
| [`instrumento/prompts-niveis-instrucao.md`](instrumento/prompts-niveis-instrucao.md) | Discussão dos **5 níveis de instrução** (do mínimo ao excessivo). |
| [`instrumento/prompts/`](instrumento/prompts/) | Os **5 textos de prompt** exatos (`prompt_n1.txt` … `prompt_n5.txt`) enviados à IA. |
| [`instrumento/schemas/`](instrumento/schemas/) | Os **5 esquemas JSON** que forçam a saída num formato limpo e validável. |
| [`instrumento/COMO-AVALIAR-OS-PROJETOS.md`](instrumento/COMO-AVALIAR-OS-PROJETOS.md) | Guia para produzir o **gabarito humano** (avaliar os 5 projetos às cegas). |
| [`instrumento/gabarito_INSTRUCOES.md`](instrumento/gabarito_INSTRUCOES.md) | Como preencher o `gabarito.csv`. |

## Próximas partes

- **[Parte 2 — Resultados](../2-resultados/)**: o relatório, os gráficos e os dados.
- **[Parte 3 — Códigos para rodar](../3-codigos/)**: como reproduzir a coleta e a análise.
