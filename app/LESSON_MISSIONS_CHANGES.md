# Alteracoes em lessons com missoes

Data de referencia: 2026-05-15

## Visao geral

Este documento registra as alteracoes recentes relacionadas a lessons com missoes e os pontos de atencao para ajustes. O foco esta nas regras de catalogo de lessons, geracao de missoes e aviso de desbloqueio.

## Mudancas registradas

### 1) Catalogo de lessons e mapeamento remoto

Arquivos:
- app/src/data/lessonCatalog.js

Principais alteracoes:
- Passa a mesclar lessons locais e remotas, mantendo fallback local quando a API falha.
- Normaliza questoes de lessons remotas (exercicios -> questions) com ordenacao por orderIndex.
- Resolucao de cores de opcoes com fallback padrao.
- Inclui campo mission no lesson mapeado (remoto ou local).

Impacto:
- Lessons podem vir do backend com missao associada e gerar missoes dinamicas.
- Ordem de exibicao das questions segue orderIndex remoto.

### 2) Catalogo de missoes e geracao dinamica

Arquivos:
- app/src/data/lessonMissionCatalog.js

Principais alteracoes:
- Introduz geracao dinamica de missoes do tipo FIND a partir das opcoes da lesson.
- Cria missoes do tipo "balloons" com regras de spawn/completude e mensagens de feedback.
- Mantem fallback de missoes estaticas (starterMissionTemplates) quando nao ha missoes dinamicas.
- Normaliza id/missionId para evitar inconsistencias.

Impacto:
- Lessons com mission.type == "FIND" podem gerar varias missoes (uma por cor/opcao).
- IDs de missoes sao derivados de lesson.id + label normalizada.

### 3) Aviso de missao desbloqueada

Arquivos:
- app/src/utils/lessonMissionNotice.js

Principais alteracoes:
- Exibe aviso ao desbloquear missao quando lesson.mission.type existe.

Impacto:
- A UX passa a orientar o jogador a falar com o NPC para iniciar a missao.

## Pontos de atencao para corrigir

1) Conteudo em PT/EN misturado
- Ex.: "Baloes red", "Encontre os baloes red no mapa".
- Acao: padronizar idioma nas strings de missao e no lessonCatalog.

2) Placeholder de prompt de FIND
- Se mission.description nao contem "{color}", a string fallback e usada.
- Acao: garantir que as descricoes remotas usem "{color}" quando apropriado.

3) Confianca em labels para IDs
- IDs usam slugify(label). Se houver labels duplicadas ou mudancas de label, o ID muda.
- Acao: avaliar uso de IDs estaveis (ex.: optionId) no backend.

4) Ordem de missoes dinamicas
- Ordem e baseada no indice das opcoes coletadas.
- Acao: se ordem for relevante, definir campo order no backend ou na configuracao local.

5) Validacao de dados remotos
- Lessons remotas podem vir sem mission/fields esperados.
- Acao: adicionar validacoes adicionais e logs de alerta para payload incompleto.

## Referencias

- app/src/data/lessonCatalog.js
- app/src/data/lessonMissionCatalog.js
- app/src/utils/lessonMissionNotice.js

