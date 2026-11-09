---
name: typst-check
description: Valider et corriger le rendu Typst d'un exercice MathALÉA. Utiliser quand l'utilisateur demande de "vérifier typst", "checker typst", "corriger typst", cite un identifiant d'exercice suivi de "typst" (ex. "6N2C-1 typst"), veut lancer `typst:check`, ou demande de réparer une erreur de compilation Typst. Sert aussi à analyser reports/typst-status.json et à proposer des correctifs dans src/components/setup/typst/latexToTypst.ts.
---

# Valider le rendu Typst d'un exercice

`pnpm typst:check` ouvre le site avec Playwright et compile le document avec le
même compilateur WASM qu'en production. Référence complète :
`documentation/developpement/maintenance-moteur/exports/typst.md` et
`documentation/tests/tests-locaux.md`.

## Prérequis

Le serveur de développement doit tourner sur `http://localhost:5173` (sinon
`pnpm dev`). Pour un autre port, passer `MATHALEA_URL=http://localhost:5199`.

## Commandes

```sh
# Un exercice, par référence ou par uuid
uuid=6N2C-1 pnpm typst:check

# Tout le catalogue (avec une limite)
ALL=1 LIMIT=50 pnpm typst:check

# Seulement les exercices en échec, ou jamais testés
FAILING=1 pnpm typst:check
UNTESTED=1 LIMIT=100 pnpm typst:check
```

Sans navigateur : `pnpm typst:check:fast` (lots, compilation CLI),
`pnpm typst:check:source` (source seule), `pnpm typst:check:compile` (binaire
`typst` requis).

## Résultats

- Statuts et diagnostics : `reports/typst-status.json` (clé `exercises.<ref>`,
  champs `status`, `failureMode`, `diagnostics`, `typstScreenshot`,
  `htmlScreenshot`).
- Captures : `screenshots/typst-check/<uuid>/typst.png` et `html.png`.

## Démarche

1. Lancer le test sur l'exercice demandé.
2. Lire son entrée dans `reports/typst-status.json`.
3. Comparer visuellement `typst.png` et `html.png`.
4. Traiter selon `failureMode` :
   - `compile_error` : partir des `diagnostics`, retrouver la ligne fautive du
     `.typ` généré (visible dans la vue Typst du site), puis remonter à la
     cause dans `latexToTypst.ts` (`latexMathToTypst()` pour les formules,
     `htmlToTypst()` pour le texte et la structure).
   - `unprocessed_math` : un `{...}` visible dans le rendu signifie que
     `tex2typst` n'a pas converti une macro LaTeX. La repérer dans le source
     de l'exercice et ajouter un pré-traitement dans `latexMathToTypst()`.
   - `missing_figure` : une figure SVG n'a pas été embarquée. Vérifier
     `svgToTypstImage()` et la collecte des figures dans `htmlToTypst()`
     (souvent un élément `.mathalea2d` non détecté par le sélecteur).
   - `missing_package` : un paquet `@preview/...` n'a pas pu être téléchargé ;
     vérifier la connexion réseau.
   - `visual_overlap` : chevauchement visible sur la capture ; corriger la
     mise en page dans `htmlToTypst()` ou `buildTypstDocument.ts`.
   - `interactive_only` : l'exercice n'a pas de rendu statique (par exemple
     `figureApigeom` sans repli). Ne rien corriger, passer au suivant.
5. Corriger de façon ciblée : un correctif dans le convertisseur profite à
   tous les exercices ; ne modifier l'exercice que si sa sortie est fautive.
6. Relancer le test pour vérifier, puis `pnpm check:changed` et les tests
   unitaires de `src/components/setup/typst/` concernés.

## Fichiers clés

- `src/components/setup/typst/latexToTypst.ts` : convertisseur HTML/LaTeX →
  Typst (`htmlToTypst()`, `latexMathToTypst()`, `svgToTypstImage()`).
- `src/components/setup/typst/buildTypstDocument.ts` : assemblage du document.
- `src/components/setup/typst/typstCompiler.ts` : enveloppe du compilateur WASM.
- `tests/e2e/tests/typst_check/typst_check.test.ts` : le test lui-même.
