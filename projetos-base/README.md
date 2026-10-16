> 🇧🇷 Português · 🇬🇧 [English](README.en.md)

# projetos-base/ — os 5 projetos avaliados (adiado)

Esta pasta é um **espaço reservado**. Ela ainda **não contém** os 5 projetos de software que este
estudo avaliou — e isso é intencional.

## Por que está vazia

1. **Autoria de terceiros.** Os 5 projetos foram desenvolvidos por **outras equipes** de estudantes
   (Aprendizagem Baseada em Projetos — ABP). Não são trabalho do autor deste estudo.
2. **Ética da crítica.** O estudo **avalia e critica** a qualidade desses projetos. Publicá-los
   atrelados a equipes identificáveis seria delicado. Por isso, em todo o repositório eles aparecem
   apenas como **P1–P5** (anonimizados), e os nomes/caminhos reais ficam só na máquina do autor
   (no arquivo `3-codigos/coleta/projetos.local.config`, fora do controle de versão).

## Plano futuro (mediante autorização)

Quando **cada equipe autorizar**, o plano é referenciar o repositório dela aqui como um
**submódulo Git** (`git submodule`), fixando o *commit* exato que foi avaliado — assim o estudo fica
100% reproduzível **sem copiar** o código de terceiros (o submódulo só aponta para o repositório
original deles, preservando autoria e licença).

Exemplo de como ficará (ilustrativo):

```bash
# (somente após autorização da equipe correspondente)
git submodule add <url-do-repo-da-equipe> projetos-base/P1
cd projetos-base/P1 && git checkout <commit-sha-avaliado>
```

Até lá, para **reproduzir a coleta** você aponta os scripts para a sua própria cópia local dos
projetos, configurando `3-codigos/coleta/projetos.local.config` (veja
`3-codigos/coleta/projetos.local.config.example`).
