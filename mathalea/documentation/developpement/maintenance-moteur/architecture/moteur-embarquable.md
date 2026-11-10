# Moteur embarquable

Le moteur embarquable est un second build de MathALÉA, à côté du site : il ne
contient que ce qu'il faut pour générer, afficher et corriger des exercices
dans une autre application (l'application mobile
[mathalea-mobile](https://forge.apps.education.fr/coopmaths/mathalea-mobile)).
Le site et `pnpm build` n'en dépendent pas.

## Construire

```bash
pnpm makeJson        # déjà fait par pnpm build
pnpm build:moteur
```

Sortie dans `dist-moteur/` (ignoré par Git) : `moteur.js` (module ES), un
morceau par exercice dans `morceaux/`, `moteur.css` (CSS du site, polices en
chemins relatifs), `fonts/` et `manifest.json` (version, `api`, empreinte
SHA-256 de chaque fichier). Environ 70 Mo, 20 Mo compressé.

## API (`src/moteur/index.ts`)

| Fonction                            | Rôle                                                                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialiser()`                     | charge MathLive ; `window.notify` remplacé par un simple journal (pas de Bugsnag)                                                                                                                                               |
| `preparerExercice(params, numero)`  | charge l'exercice par uuid, applique les paramètres (`n`, `s`…) et la graine, renvoie titre, graine et questions (contexte, énoncé, correction) ; avec `interactif: false`, énoncés imprimables (sans champs ni QCM cliquables) |
| `afficher(element)`                 | KaTeX, MathLive, figures réduites à la largeur de l'élément (`ajusterFigures`)                                                                                                                                                  |
| `verifier(exercice, i)`             | vérifie la question `i`, même logique que `QuestionParPage.svelte`                                                                                                                                                              |
| `ecrireReponses(reponses)`          | réinjecte des réponses (`mathaleaWriteStudentPreviousAnswers`)                                                                                                                                                                  |
| `monterClavier(cible)`              | monte `Keyboard.svelte` (clavier de MathALÉA)                                                                                                                                                                                   |
| `listerExercices('FR' \| 'CH')`     | exercices du référentiel du site, chargés à la demande                                                                                                                                                                          |
| `definirLangue('fr-FR' \| 'fr-CH')` | `referentielLocale` ; en `fr-CH`, notations et vocabulaire suisses                                                                                                                                                              |

`API_MOTEUR` est incrémenté à chaque changement incompatible de cette API ;
l'application hôte refuse un moteur dont la version d'API ne correspond pas.

## Différences avec le site

- `vite.moteur.config.ts` définit `import.meta.env.VITE_MOTEUR_EMBARQUE` :
  `src/lib/components/version.ts` n'interroge alors pas `version.txt` (le
  contrôle de mise à jour du site n'a pas de sens dans une application).
- Les identifiants des champs restent ceux du site (`champTexteEx<n>Q<i>`) :
  deux exercices affichés ensemble doivent avoir des `numero` différents.

## Publication

`pnpm build:deploy` publie aussi le moteur sur `https://mathalea.fr/releases/`,
d'où l'application le met à jour sans passer par les stores : voir
[Publier le moteur](publication-moteur.md).
