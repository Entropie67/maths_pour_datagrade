---
name: nouvel-exercice
description: Créer un nouvel exercice MathALÉA (fichier de src/exercices/), interactif ou non. Utiliser quand l'utilisateur demande de "créer", "écrire", "ajouter" ou "coder" un exercice, donne une nouvelle référence (ex. "5P12"), ou décrit une notion à transformer en exercice. Ne pas utiliser pour modifier un exercice déjà publié (voir modifier-exercice-publie).
---

# Créer un exercice

Guide complet : `documentation/developpement/auteurs-exercices/creer-un-exercice.md`.
Le lire avant de commencer, ainsi que les pages citées ci-dessous au moment
où elles servent.

## 1. Cadrer

- Chercher un exercice récent, proche par le niveau et le type
  (`rg "notion" src/exercices`), en évitant les fichiers `*Old*` / `*-old*`.
- Choisir le modèle de `src/exercices/modèlesExos/` le plus proche :
  `10_simple.ts` (une question, `ExerciceSimple`), `20_exercice_classique.ts`,
  `21_parametrable.ts`, `25_figure_accessible.ts` (figure décrite),
  `40_questions_et_sous_questions.ts` (a), b), c)).
- Vérifier que la référence voulue est libre (`rg "'<REF>'" src/exercices`) ;
  sinon ajouter un suffixe (`5A11-1`, `5A11-2`…).

## 2. Écrire

- Métadonnées : `titre`, `dateDePublication` (date du jour, `jj/mm/aaaa`),
  `uuid` neuf (`pnpm getNewUuid`, jamais copié), `refs` (`'fr-fr'`, `'fr-ch'`).
- Rédaction : `rediger-un-exercice.md` (infinitif, ponctuation, nombres entre
  `$`, `miseEnEvidence()` sur la seule réponse finale, `bleuMathalea` pour
  les explications, pas de « ... »).
- Paramètres : `besoinFormulaireTexte` plutôt qu'un menu numérique
  (`complements/formulaires-parametres.md`).
- Interactivité : `interactivite-simple.md`. Un seul champ par question
  (`remplisLesBlancs()` ou `createQuestion()` avec `subQuestions` sinon) ;
  barème fixe par question quel que soit le tirage.
- Comparaison des réponses : jamais de fonction de comparaison dans le fichier
  de l'exercice (ni `compare: (saisie, reponse) => …`, ni helper local). Combiner
  en priorité les checks de `src/lib/interactif/checks/` avec `seq()` ou
  `all()`, avant les options de `fonctionComparaison()`. Si aucun check
  ne convient, en créer un dans `checks/` (`complements/checks-composables.md`).
- Sorties : l'énoncé doit rester lisible en HTML non interactif et en LaTeX.
- Accessibilité (section du même nom dans `rediger-un-exercice.md`) : chaque figure
  `mathalea2d` porte une `description` en texte brut (valeurs tirées avec
  `stringNombre()`, sans `$` ni LaTeX, sans la réponse) ou `decorative: true`. Si la
  description donnerait la réponse, elle présente la tâche et le constructeur
  déclare `this.demandeLaVue = true` avec la raison. Ne jamais désigner un élément
  par sa seule couleur ou sa seule position. Champs et formats du moteur, sans
  HTML écrit à la main.

## 3. Valider

Suivre `valider-un-exercice.md` :

```sh
pnpm makeJson                 # référence visible dans les menus
pnpm check:changed
pnpm prebuild-unit-tests
pnpm a11y:check               # informatif : défauts d'accessibilité de l'exercice
```

Puis contrôler dans le navigateur (`http://localhost:5173/alea/?id=<REF>`,
serveur `pnpm dev` déjà lancé de préférence) : plusieurs graines, chaque
paramètre, réponse juste / fausse / vide, correction, interactivité coupée,
aperçu LaTeX, description des figures. Utiliser de vrais clics souris (Playwright), pas
`element.click()`.

Le hook de pre-commit enregistre tout seul l'empreinte de stabilité du nouvel
`uuid`. Ne pas committer sans l'accord de l'utilisateur ; message au format
`ex(<REF>): …` ou `feat(<REF>): …`.
