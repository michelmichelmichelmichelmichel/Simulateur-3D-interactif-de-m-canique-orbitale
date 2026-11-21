# Traces des interactions avec l'IA

Outil utilisé : **Claude Code** (application de bureau Claude, onglet Code).

## Contenu
- `sessions/` : export intégral de chaque session (demandes, réponses, actions
  exécutées et résultats des outils), y compris les tentatives infructueuses et
  les propositions rejetées.
- `JOURNAL.md` : résumé de chaque session et analyse des interactions significatives.

## Convention
- Une session = une tâche précise.
- Pour chaque session, deux fichiers :
  - `sessions/AAAA-MM-JJ_NN_sujet.jsonl` : export **brut et complet** produit par
    l'application Claude (menu Export de la session), anonymisé ;
  - `sessions/AAAA-MM-JJ_NN_sujet.md` : version **lisible** (messages, réponses,
    outils appelés et résultats), générée par `scripts/export-trace.mjs`.
- Régénérer : exporter la session depuis l'application, extraire `transcript.jsonl`
  du zip, puis `node scripts/export-trace.mjs <transcript.jsonl> <nom>`.

## Anonymisation et limites (signalées conformément à l'énoncé)
- **Adresses e-mail** : remplacées par `[MASQUÉ : adresse e-mail]`
  (sauf `noreply@anthropic.com`, adresse générique des commits). Aucune autre
  donnée n'est masquée.
- **Version lisible (.md)** : les raisonnements internes du modèle (« thinking »)
  n'y figurent pas et les résultats d'outils de plus de 4 000 caractères y sont
  tronqués. Rien n'est retiré de l'export brut (.jsonl).
- **Export en cours de session** : un export ne contient que ce qui précède le
  moment où il est fait. La session 01 est exportée de nouveau à sa clôture
  pour inclure la fin des échanges.
- Les captures d'écran prises par l'IA ne sont pas incluses (une seule, sans
  information personnelle).
