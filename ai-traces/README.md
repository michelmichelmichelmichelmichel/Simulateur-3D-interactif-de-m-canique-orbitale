# Traces des interactions avec l'IA

Outil utilisé : **Claude Code** (application de bureau Claude, onglet Code).

## Contenu
- `sessions/` : export intégral de chaque session (demandes, réponses, actions
  exécutées et résultats des outils), y compris les tentatives infructueuses et
  les propositions rejetées.
- `JOURNAL.md` : résumé de chaque session et analyse des interactions significatives.

## Convention
- Une session = une tâche précise.
- Fichier : `sessions/AAAA-MM-JJ_NN_sujet.md` (ou `.jsonl` pour l'export brut).
- Les sources brutes sont aussi conservées localement par Claude Code
  (`~/.claude/projects/<projet>/*.jsonl`).

## Anonymisation
Seules les données sensibles sont masquées (adresses e-mail, identifiants,
jetons). Chaque masquage est signalé par `[MASQUÉ : nature]`.
