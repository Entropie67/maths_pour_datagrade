# Contrôler les corrections minimales

`pnpm corrections:check` génère le corpus de régression du ticket #9651 : la
série initiale, les exercices aux couleurs pédagogiques, les corrections
partielles signalées, des QCM et des réponses graphiques. Le test utilise
Vitest et jsdom ; aucun serveur Vite ni navigateur n’est nécessaire.

```sh
pnpm corrections:check
CHANGED_FILES="src/exercices/6e/6N1E.ts" pnpm corrections:check
CORRECTIONS_FILTER="4e/4G12" pnpm corrections:check
```

`CHANGED_FILES` ajoute au corpus les exercices directement modifiés ou ajoutés.
Un changement dans un helper ne sélectionne pas automatiquement tout le
catalogue : les régressions partagées sont couvertes par le corpus et les tests
unitaires. `CORRECTIONS_FILTER` remplace cette sélection par un chemin partiel
ou un uuid. Un filtre sans correspondance échoue. Les outils techniques et les archives sont exclus, sauf les deux archives
explicitement présentes dans le lien historique du ticket.

Le contrôle est intégré au job GitLab `testExosModifiedConsolidated` et à
`tasks/exoModified.sh`. Il teste trois graines et les combinaisons de paramètres
`sup`, `sup2`, `sup3` utilisées par le contrôle de stabilité (un paramètre à la
fois), en mode HTML non interactif. Pour chaque question, il exige une réponse
explicite, une réponse orange ou les bonnes propositions d’un QCM. Une absence
de réponse courte doit être déclarée explicitement :

- `reponseCourteDisponible = false` pour un exercice entièrement graphique ou
  démonstratif ;
- `listeReponsesCourtes[i] = null` pour une question particulière.

Voir le [contrat auteur](../developpement/auteurs-exercices/rediger-un-exercice.md#réponse-courte-et-correction-minimale).

Le contrôle ne prouve pas que la réponse est mathématiquement juste, complète,
ou que toutes les branches aléatoires sont couvertes. Il ne remplace pas la
relecture ni `pnpm stability:check`. Le catalogue historique n’est pas entièrement
migré vers ces déclarations : la sélection ciblée évite de confondre les figures
et tableaux anciens avec de nouveaux oublis. Toute modification de ces exercices
doit préciser leur contrat de réponse courte.

Implémentation : `tests/e2e/tests/minimalCorrections/minimalCorrections.test.ts`.
Les tests unitaires vérifient aussi la priorité des réponses explicites, le
repli complet, leur remise à zéro et leur prise en compte dans les exports.
