# Valider un exercice

La validation commence par les rendus de l'exercice, puis se termine par les
tests automatisés adaptés.

## Vérification manuelle

Dans un terminal :

```sh
pnpm dev
```

Dans l'application :

1. ouvrez l'exercice par sa référence ou son UUID ;
2. régénérez plusieurs versions ;
3. modifiez chaque paramètre disponible ;
4. testez une réponse correcte, incorrecte et vide ;
5. affichez la correction ;
6. désactivez l'interactivité ;
7. contrôlez un aperçu imprimable ou LaTeX ;
8. contrôlez l'accessibilité des figures : dans l'inspecteur, chaque
   `svg.mathalea2d` porte `role="img"` et un `aria-label`, ou `aria-hidden="true"`.
   Relisez la description sur plusieurs tirages : elle reprend les valeurs affichées,
   en texte lisible (pas de `$`, ni de `{,}`), sans donner la réponse. Les champs de
   réponse placés dans la figure restent atteignables au clavier.

Vérifiez particulièrement les doublons, les divisions par zéro, les valeurs
limites et les corrections qui ne correspondent pas à l'énoncé.

### Vue relecture

La vue `?v=relecture` liste, du plus récent au plus ancien, les nouveaux
exercices (`datePublication`) et les exercices mis à jour (`dateModification`)
du référentiel, avec un champ de recherche (référence, titre ou UUID). Le bouton
placé après chaque titre affiche, sous l'exercice, un lien par vue : prof non
interactive, élève interactive, diaporama, Course aux nombres, TBI, Typst,
Typst avec correction minimale et LaTeX, ainsi qu'un bouton « Toutes » qui les
ouvre toutes dans des onglets. Safari n'ouvre qu'un onglet par clic tant que
les fenêtres surgissantes ne sont pas autorisées pour le site : un message le
signale alors et le relecteur peut cliquer sur chaque vue.

Les boutons ✓ et ✗ placés après le bouton d'ouverture enregistrent le verdict
du relecteur (fond vert ou rouge ; un second clic l'efface). Ce suivi est
propre au navigateur : il est stocké dans le `localStorage` sous la clé
`relectureEtats`, par UUID d'exercice. La
liste des vues est définie dans `src/lib/components/relecture.ts`.

## Format et types

```sh
pnpm format
pnpm check:changed
```

`pnpm format` applique le formatage du dépôt. `pnpm check:changed` est la
commande de typage par défaut : à lancer après chaque modification de fichier
`.ts` ou `.svelte`, sans qu'il soit utile de la relancer avant le commit. Elle contrôle les fichiers `.ts` et `.svelte` de `src/` modifiés depuis
`HEAD` (nouveaux fichiers et suppressions compris) **et leurs dépendants**, en
quelques secondes :

```sh
pnpm check:changed                          # fichiers modifiés + dépendants
pnpm check:changed src/exercices/6e/6N1E.ts # fichiers donnés explicitement
pnpm check:changed --max 1000               # seuil de bascule (500 par défaut)
pnpm check:changed --no-deps                # sans les dépendants
pnpm check:changed --all                    # équivaut à pnpm check
```

Le script reconstruit le graphe des imports relatifs de `src/` et remonte
transitivement vers les fichiers qui importent les fichiers modifiés (un parent
d'exercice entraîne ainsi ses enfants). Seules les erreurs de ces fichiers sont
affichées. Les chargements dynamiques par `import.meta.glob` ne sont pas suivis :
ils ne portent pas de dépendance de types.

### Quand lancer `pnpm check`

`pnpm check` vérifie tous les fichiers TypeScript et Svelte (environ une minute
et demie). Il est inutile après une modification limitée à un exercice. Il sert
quand `pnpm check:changed` ne peut pas voir les conséquences du changement :

- le script bascule de lui-même sur le contrôle complet quand plus de 500
  fichiers sont concernés (un utilitaire de `src/lib` importé partout,
  `ExerciceSimple`…) ou quand un `.d.ts` a changé : rien à décider dans ce cas ;
- à lancer à la main si `tsconfig*.json`, `package.json`, le fichier de
  verrouillage, ou la configuration Svelte ou Vite ont changé ;
- à lancer à la main si un fichier `.json` importé par du TypeScript a changé
  (le script ne suit que les `.ts` et `.svelte`) ;
- à lancer à la main après une fusion ou un rebasage avec `main`, puisque le
  code des autres contributeurs interagit avec le vôtre.

## Tests unitaires

Avant un commit :

```sh
pnpm prebuild-unit-tests
```

Cette commande exécute les tests unitaires de `tests/unit` et de `src`.

## Modifier un exercice déjà publié

Les liens partagés par les utilisateurs contiennent l'`uuid`, la graine du tirage
et les paramètres choisis. Déplacer un appel au générateur aléatoire, ou en
ajouter un avant les autres, décale toutes les valeurs suivantes : les corrigés
déjà distribués ne correspondent plus à l'énoncé. Le contrôle porte sur
plusieurs valeurs de `sup`, `sup2` et `sup3`, pas seulement sur celles par
défaut.

```sh
CHANGED_FILES="src/exercices/6e/6N1E.ts" pnpm stability:check
```

Corriger une coquille, reformuler ou refactoriser sans toucher à l'ordre des
tirages passe sans problème. Si le test signale une dérive assumée, la version
publiée doit être archivée et la version corrigée prendre un `uuid` neuf :

```sh
pnpm archive 6N1E
```

Le détail de la règle et des trois issues possibles est dans
[Stabilité des tirages](../../tests/stabilite-exercices.md).

## Contrôler l'accessibilité

```sh
pnpm a11y:check
```

Ce test informatif, qui ne bloque jamais, analyse les exercices modifiés sur la
branche : figures sans `description`, descriptions qui ne sont pas en texte brut,
champs écrits à la main, images sans `alt`, désignations par la couleur ou la
position à relire. Sur un exercice déjà publié, traiter ce que la modification
ajoute ou retouche, sans migrer tout le fichier. Voir
[Contrôle d'accessibilité](../../tests/controle-accessibilite.md).

## Rapports ciblés d'exercices

Si la modification touche l'interactivité, `autoCorrection` ou AMC, utilisez
les commandes décrites dans
[Rapports d'exercices](../../tests/rapports-exercices.md). Préférez un chemin de
fichier ciblé pendant le développement.

## Checklist

- les métadonnées sont uniques et complètes ;
- les questions sont variées et ne se répètent pas ;
- l'énoncé et la correction sont cohérents ;
- le titre, la consigne et la ponctuation respectent
  [Rédiger un exercice](rediger-un-exercice.md) ;
- le HTML interactif fonctionne ;
- le HTML non interactif reste compréhensible ;
- le rendu LaTeX est exploitable ;
- les figures et les énoncés respectent la section
  [Accessibilité](rediger-un-exercice.md#accessibilité) ;
- `pnpm check:changed` (ou `pnpm check` dans les cas prévus ci-dessus) et `pnpm prebuild-unit-tests` passent ;
- pour un exercice déjà publié, `pnpm stability:check` passe ou la dérive est
  assumée et documentée ;
- les rapports ciblés utiles ne signalent pas de régression.

Pour comprendre les tests globaux ou la CI, consultez
[Tests et CI](../../tests/README.md).
