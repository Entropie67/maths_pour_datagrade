# Contrôler l'accessibilité des exercices

`pnpm a11y:check` signale les défauts d'accessibilité des exercices nouveaux ou
modifiés. Ce contrôle informe l'auteur et ne bloque jamais une livraison : un
défaut ou un exercice qui plante ne le fait pas échouer. Il utilise Vitest et
jsdom ; aucun serveur Vite ni navigateur n'est nécessaire.

```sh
pnpm a11y:check
CHANGED_FILES="src/exercices/6e/6N1E.ts" pnpm a11y:check
A11Y_FILTER="6e/6N1E" pnpm a11y:check
```

## Sélection des exercices

- `A11Y_FILTER` : chemin partiel ou uuid ; prime sur le reste.
- `CHANGED_FILES` : fichiers de `src/exercices/` séparés par des retours à la ligne,
  des espaces ou des virgules. Les chemins que git met entre guillemets, comme
  `"src/exercices/mod\303\250lesExos/25_figure_accessible.ts"`, sont décodés : la
  sortie de `git diff --name-only` convient telle quelle.
- Sans ces variables : les exercices modifiés depuis le départ de la branche
  (`origin/main`), commits, fichiers en cours et nouveaux fichiers compris.

Le catalogue entier n'est jamais parcouru par défaut : les exercices déjà publiés
ne sont pas migrés et produiraient des milliers de signalements. Un changement
dans un helper ne sélectionne pas les exercices qui l'utilisent. Les archives et
les outils (`apps`, `ressources`, `profs`, `beta`) sont écartés ; `modèlesExos` est
analysé, car les auteurs le recopient.

## Ce qui est vérifié

Chaque exercice est généré avec trois graines et les combinaisons de paramètres
`sup`, `sup2`, `sup3` du contrôle de stabilité, en mode HTML, interactif compris
s'il est disponible.

| Niveau   | Vérification                                                                                          | Où                 |
| -------- | ----------------------------------------------------------------------------------------------------- | ------------------ |
| Défaut   | Une figure `mathalea2d` sans `description` ni `decorative`                                            | énoncé, correction |
| Défaut   | Une description qui contient `$`, du LaTeX, `{,}`, une balise, `undefined` ou `NaN`                   | énoncé, correction |
| Défaut   | Un `<input>`, `<select>` ou `<textarea>` écrit à la main, hors cases de QCM et éléments personnalisés | énoncé, correction |
| Défaut   | Un `<img>` sans attribut `alt`                                                                        | énoncé, correction |
| À relire | `demandeLaVue` déclaré                                                                                | constructeur       |
| À relire | Une désignation possible par la seule couleur ou la seule position                                    | énoncé             |

Les règles et leurs correctifs sont dans la section
[Accessibilité](../developpement/auteurs-exercices/rediger-un-exercice.md#accessibilité)
du guide de rédaction ; le rapport renvoie à la sous-section utile.

### La recherche des désignations

C'est une heuristique, donc un point « à relire » et non un défaut. Elle lit le
texte de l'énoncé, sans les formules, les figures, les champs ni la correction.
Elle cherche un élément de figure suivi d'une couleur (`segment rouge`, `partie
grisée`), `en rouge`, `à gauche`, `à droite`. `en haut` et `en bas` ne sont pas
cherchés : sur le catalogue, ces mots décrivaient autre chose qu'une désignation.

Pour rester écoutée, elle écarte :

- les mots qui contiennent une couleur ou une position (`ouvert`, `perpendiculaire`) ;
- un élément nommé : `le segment rouge $[AB]$`, `$(d)$ en rouge`,
  `en rouge la tangente $T$`, `à gauche de $A$` ;
- les consignes à exécuter : `Colorier en rouge`, `Tracer la droite en bleu`,
  `doit être en vert` ;
- les objets dont la couleur est une donnée : `3 boules rouges` ;
- les sens mathématiques et de lecture : `limite à gauche`, `à droite de la virgule`,
  `de gauche à droite`, `tourne à gauche`, `en haut à gauche` d'une case ;
- `la figure ci-dessous` s'il n'y a qu'une figure. Elle est alors sans ambiguïté,
  et ce motif seul faisait presque tous les signalements sur un échantillon du
  catalogue. Il n'est retenu qu'à partir de deux figures dans le même fragment.

## Lire le rapport

```text
5e/5G3A-11.ts (uuid dbc1d) : 1 défaut(s), 0 à relire
  Défaut : 72 figure(s) sur 72 sans `description` ni `decorative` (graine a11y-a, question 1).
    → Ajouter à cet appel de mathalea2d `description` (valeurs tirées, sans la réponse) ou `decorative: true`. …
```

La graine et les paramètres cités (`s=2`, `interactif`) sont ceux de la première
occurrence, pour la reproduire. Un exercice sans signalement n'apparaît pas.

Sur un exercice déjà publié, traiter ce que la modification ajoute ou retouche :
il n'est pas demandé de migrer tout le fichier. Les textes et les options peuvent
changer sans déplacer de tirage ; `pnpm stability:check` le confirme.

## Ce que le contrôle ne voit pas

- La qualité d'une description : exacte, complète, sans la réponse.
- Les figures ApiGeom, 3D, les tableaux et les autres composants, sans cette option.
- Le contenu écrit par un élément personnalisé dans le navigateur.
- Le rendu réel : ordre de lecture, clavier, contraste, nom accessible calculé par
  le navigateur. Voir la [navigation au clavier](navigation-clavier.md).
- Les branches aléatoires absentes des trois graines.
- Les désignations hors de sa liste de mots : `la figure de gauche`, `le rectangle
hachuré`, ou un élément absent de la liste des éléments de figure.
- Une figure produite par un helper sans option `description` est signalée comme
  les autres : le rapport indique alors de donner l'information dans l'énoncé.

## En CI

Le contrôle est le dernier sous-test du job GitLab `testExosModifiedConsolidated`
et de `tasks/exoModified.sh`. Il n'entre pas dans le décompte des sous-tests
bloquants. Le code de sortie n'est différent de zéro que si l'outil lui-même échoue
(`pnpm makeJson`, Vitest) ; le résumé l'indique alors sans changer le résultat.

Les filtres `[ -f "$f" ]` de ces scripts laissent passer les chemins entre
guillemets : les autres sous-tests les ignorent, car ils attendent un chemin
commençant par `src/exercices/`, et seul ce contrôle les décode.

Implémentation : `tests/e2e/tests/accessibilite/accessibilite.test.ts` et
`tests/e2e/helpers/accessibiliteExercice.ts`. Tests unitaires :
`tests/unit/accessibiliteExercice.test.ts`.
