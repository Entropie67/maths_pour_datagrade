# Utilisation avec Capytale

Dans Capytale, une activité MathALÉA charge MathALÉA dans une iframe avec un mode recorder. MathALÉA communique avec Capytale par `postMessage` via le protocole de l'activité.

## Modes d'affichage

- `create` : création ou édition d'une séance côté professeur.
- `assignment` : activité côté élève.
- `review` : relecture des réponses, notes et commentaires.
- `view` : consultation de la séance d'un collègue dans la bibliothèque, avant clonage.

## Données échangées

Capytale sauvegarde les paramètres de séance et les réponses d'élèves. MathALÉA récupère les paramètres d'activité, signale les modifications et envoie les résultats lorsque l'élève valide.

Le code d'intégration côté MathALÉA est dans `src/lib/handleCapytale.ts`.

Chaque envoi de résultats (`saveStudentAssignment`) contient `evaluation` (total des
points obtenus) et `scoreMax` (total des points possibles de toute la séance, y compris
les exercices pas encore soumis). `scoreMax` somme, pour chaque exercice, le barème
calculé à sa génération (`pointsMaxParExercice`) multiplié par son coefficient de barème ;
pour un exercice sans barème connu (app externe), c'est le maximum de son résultat. En vue
Course aux nombres, il vaut la somme des maxima des résultats envoyés ensemble.

## Réglages par défaut et aperçu

Une nouvelle séance utilise « Tout interactif » par défaut. Les exercices ajoutés
par le menu ou par la recherche `Ctrl/Cmd+K` sont interactifs par défaut.
Les réglages d'une séance déjà enregistrée sont conservés.

L'aperçu reprend les paramètres des exercices (dont le barème) et les réglages
Course aux nombres : interactivité, chronomètre global ou par question,
chronomètre désactivé et feedback après chaque question. Comme dans Capytale,
l'élève ne peut pas modifier l'interactivité dans cet aperçu.

## Réglages de séance : aller-retour avec Capytale

`toolGetActivityParams` (Capytale → MathALÉA) fournit l'activité enregistrée,
`platformGetActivityParams` (MathALÉA → Capytale) renvoie ce qui doit être
enregistré, aussi bien lors d'une sauvegarde que lors d'un clonage.

Deux règles évitent que les réglages de l'enseignant (accès aux corrections,
affichage des titres, pages identiques ou différentes…) soient perdus :

- **En mode `create`, MathALÉA n'impose aucun réglage** issu de l'activité
  chargée : le choix de l'enseignant est restauré tel quel. En particulier
  `isSolutionAccessible` n'est forcé à `true` que hors mode création, là où le
  professeur consulte une séance ou une copie.
- **Hors mode `create`, `platformGetActivityParams` renvoie l'activité telle
  qu'elle a été reçue** (`activityFromCapytale`). Les stores contiennent alors
  des réglages d'affichage imposés par MathALÉA (`v: 'eleve'`,
  `isInteractiveFree: false`, graines effacées, `done`…) qui, sans cela,
  seraient enregistrés à la place des réglages de l'enseignant lors d'un
  clonage.

Par sécurité, une séance enregistrée avec `v: 'eleve'` ou `v: 'can'` (séance
clonée par une version antérieure) est ramenée à la page de configuration en
mode `create`.

Les tests unitaires correspondants sont dans `tests/unit/capytaleActivityParams.test.ts`.

Pour un exercice de type « app » (iframe tierce), la remontée du score suit le
protocole décrit dans
[Apps externes](../../developpement/maintenance-moteur/architecture/apps-externes.md).

## Perte de connexion avec Capytale

Si l'élève n'est plus en mesure d'enregistrer sa copie (session Capytale expirée, coupure réseau, page parente qui ne répond plus), la copie est verrouillée pour éviter qu'il travaille sans que ses réponses soient enregistrées.

- La librairie RPC utilisée ne gère aucun timeout : `callCapytale()` en ajoute un (15 s) pour qu'une page parente muette soit détectée au lieu de laisser la promesse indéfiniment en attente.
- Tout échec de `saveStudentAssignment` qui n'est pas une erreur métier (« copie rendue » ou « Copie verrouillée », qui donnent un simple message temporaire) passe le store `capytaleConnectionLost` à `true`.
- `CapytaleConnectionLostModal.svelte`, monté dans `App.svelte` quand `recorder=capytale`, affiche alors une modale bloquante (non fermable par Échap) : l'élève ne peut plus modifier sa copie.
- La sauvegarde en échec est conservée et rejouée automatiquement avec un délai croissant (3 s, 5 s, 10 s, 20 s puis 30 s), ou immédiatement via le bouton « Réessayer maintenant ». Dès qu'elle aboutit, la copie est déverrouillée et l'élève est informé que ses réponses ont bien été enregistrées.
- Bugsnag n'est notifié qu'une seule fois par coupure, pas à chaque tentative.

Les tests unitaires correspondants sont dans `tests/unit/capytaleSaveConnection.test.ts`.
