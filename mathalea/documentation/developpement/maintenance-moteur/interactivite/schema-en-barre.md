# Custom element « Schéma en barre »

Tag : `schema-en-barre`. Les six schémas en barre qui modélisent les
problèmes arithmétiques, avec tous leurs textes éditables : l'élève (ou le
professeur) choisit un schéma puis le complète. Rendu HTML interactif ou figé,
LaTeX (TikZ) et Typst. S'y ajoutent trois schémas de problèmes à plusieurs
étapes, qui ne sont pas proposés dans ce choix (voir
[Schémas à étapes](#schémas-à-étapes)).

La recette côté exercice est dans
[Formats interactifs spécialisés](../../auteurs-exercices/complements/formats-interactifs.md#schéma-en-barre).
Cette page documente l'implémentation.

## Fichiers

| Fichier                                          | Rôle                                                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `src/lib/customElements/SchemaEnBarreElement.ts` | Le custom element, ses types, la comparaison de deux schémas, le helper `addSchemaEnBarre()` et les trois rendus |
| `src/app.css`                                    | Styles (classes préfixées `schema-en-barre__`), en thème clair et sombre                                         |
| `src/lib/problems/problemesSchemasEnBarre.ts`    | Banque de problèmes avec leur schéma attendu, par type de schéma                                                 |
| `src/exercices/6e/6N4A-5.ts`                     | Exercice : choisir et compléter le schéma d'un problème, puis répondre (couteau suisse schéma + champ MathLive)  |
| `src/exercices/6e/6N4A-2.ts`                     | Exercice : retrouver les nombres manquants dans l'énoncé et un schéma à étapes figé (`schemaEnBarreFige()`)      |
| `src/exercices/profs/P030.ts`                    | Outil du professeur : le composant seul, avec un réglage pour imposer le type                                    |
| `tests/unit/schemaEnBarreElement.test.ts`        | Tests unitaires                                                                                                  |

Le composant vit dans le DOM clair (pas de shadow DOM) : les couleurs suivent
le thème via les variables `--color-coopmaths*`. Les rectangles ont un fond
transparent, des bordures et du texte colorés, également en LaTeX et Typst,
pour permettre l’écriture sur un schéma imprimé ou projeté. En HTML, les
pointillés sont dessinés dans leur largeur réservée par un SVG, sans
dépendre de la largeur des caractères de la police.

## Les six schémas et leurs textes

| Type                              | Textes (`CleTexteSchema`)                                    |
| --------------------------------- | ------------------------------------------------------------ |
| `additif-parties-tout`            | `partieA`, `partieB`, `tout` (accolade au-dessus)            |
| `additif-comparaison`             | `partieA` (grande), `partieB` (petite), `difference`         |
| `additif-comparaison-total`       | `partieA` (grande), `partieB` (petite), `difference`, `tout` |
| `multiplicatif-parties-tout`      | `part`, `nombreDeParts` (flèche dessous), `tout`             |
| `multiplicatif-comparaison`       | `etiquetteA`, `etiquetteB`, `part`, `nFois`                  |
| `multiplicatif-comparaison-total` | `etiquetteA`, `etiquetteB`, `part`, `nFois`, `tout`          |

Le choix du type (six vignettes : une colonne additive et une colonne
multiplicative, sur trois lignes) et le schéma ne sont
jamais affichés ensemble : choisir une vignette fait apparaître le schéma, le
bouton « Changer de schéma » ramène les vignettes sans perdre les textes déjà
saisis. Les champs sont des `textarea` d'une ligne qui grandissent avec leur
contenu (`ajusteHauteur()`), vides par défaut et sans placeholder : les
libellés génériques (`LIBELLES_TEXTE`) ne servent qu'aux vignettes et à
l'`aria-label`.

Dans les schémas multiplicatifs, tous les rectangles partagent le même texte
`part` (saisir dans l'un remplit les autres). Le nombre de rectangles se
règle de 2 à 5, ou `'plus'` : trois rectangles, des pointillés, puis un
dernier rectangle qui ferme la barre (parties-tout comme comparaison).

Dans les deux schémas de comparaison avec total, une accolade à droite porte le
tout (A + B). Ce choix est porté par le type, sans réglage dans l'état : le
schéma est correct seulement si l'élève choisit le bon des deux. Passer à un
schéma sans `tout` efface ce texte.

Au rejeu, `parseSchemaEnBarreState()` reprend les copies antérieures à la
séparation, qui avaient un bouton « Afficher le tout » : un type de comparaison
simple avec `toutVisible: true` ou un `tout` renseigné devient le type avec
total.

Un texte de rectangle peut tenir sur deux lignes (`Roses\n6 fleurs` :
la grandeur, puis la quantité et son unité, comme dans les schémas des
manuels). Le rendu figé remplace `\n` par `<br>` ; TikZ et Typst agrandissent
alors les rectangles (`hauteurRect()`).

## État et valeur

`value` est le JSON de `SchemaEnBarreState` :
`{ type, textes, nbRectangles }`, avec `type` à `null` tant que rien n'est
choisi et tous les textes de `CLES_TEXTE_SCHEMA` toujours présents (vides par
défaut).
`parseSchemaEnBarreState()` relit ce JSON en tolérant les champs manquants ;
le setter `value` délègue à `update()`, qui redessine.

Attributs de `create()` : `type-impose` (le choix des six schémas n'est pas
proposé), `initial-state` (JSON d'un état partiel), `interactivity-on`.

## Correction

`verifQuestion()` compare le schéma de l'élève à
`autoCorrection[i].valeur.reponse.value`, le JSON d'un `SchemaEnBarreAttendu`
posé par `addSchemaEnBarre(exercice, i, { attendu })`, avec
`comparerSchemas()` :

- le type doit être le bon ;
- seule la place des nombres est vérifiée, avec `nombreBienPlace()` : pour
  chaque texte de `attendu.textes` qui contient un nombre, le texte de
  l'élève à la même place doit contenir ce nombre (le reste est ignoré :
  `Matin\n12 pages` attendu accepte `12`, `12 pages` ou `Isabelle 12`,
  virgule ou point décimal, espaces des milliers). Les textes eux-mêmes ne
  sont pas jugés : un texte attendu sans nombre (`?`, une étiquette) est
  toujours accepté ;
- `attendu.textesIndicatifs` (les étiquettes A et B par exemple) ne sont pas
  vérifiés : ils ne servent qu'à l'affichage du schéma de la correction ;
- `partieA` et `partieB` peuvent être échangés dans le seul schéma additif
  parties-tout, où les deux parties jouent le même rôle ;
- `nbRectangles` n'est vérifié que s'il est présent dans l'attendu.

`clesNombresVerifies(attendu.textes)` donne les textes dont le nombre est
vérifié (ceux qui portent un seul nombre). Passés à `create()` dans
`nombresEnEvidence`, ils mettent ce nombre en orange (`orangeMathalea`) dans le
schéma figé, en HTML, LaTeX et Typst : c'est ce que fait la correction de
`6N4A-5` pour montrer les nombres à placer. Le rendu encadre les nombres de
deux caractères privés (`\uE000`…`\uE001`) que `champHtml()`, `echappeLatex()` et
`echappeTypst()` remplacent par leur mise en forme ; l'état (`value`) n'est
jamais modifié.

Le score est de 1 point pour le schéma entier. Après la vérification, le type
et les textes dont le nombre est mal placé reçoivent la classe `is-faux`, puis
le composant devient inerte. Lorsque le type est imposé, le feedback sur les
nombres mal placés ne commente pas le choix du type de schéma.

## Rendus imprimés

`create()` choisit la sortie dans cet ordre (`context.isHtml` reste vrai
pendant un export Typst) :

1. `context.isTypst` → `<mathalea-typst>${schemaTypst()}</mathalea-typst>` ;
2. `!context.isHtml` → `schemaLatex()` ; mais si l'interactivité est active
   sans type imposé, rien n'est imprimé : l'élève dessine le schéma ;
3. sinon la balise `<schema-en-barre>`, suivie du `span#resultatCheck…` et du
   `div#feedback…` quand l'interactivité est active.

Les trois rendus partagent la géométrie `GEO` (en `em` pour le HTML, ce qui
permet des vignettes réduites par un simple `font-size`, converties en cm pour
TikZ et en `em` Typst). Les accolades LaTeX utilisent `decoration={brace}`
(bibliothèque chargée automatiquement par `preambuleTex.ts`). Le Typst
n'utilise aucun paquet : accolades et flèches horizontales passent par le
helper `mathalea-schema-span` (injecté par `buildTypstDocument.ts` dès qu'il
est cité), l'accolade verticale par `stretch(brace.r)` sur la hauteur mesurée
des barres.

Les textes saisis sont protégés par `echappeLatex()` et `echappeTypst()` : ce
sont des nombres, des unités ou des prénoms, pas du LaTeX.

## Dans l'exercice `6N4A-5`

Chaque question est un `mathalea-couteau-suisse` à deux enfants : le schéma
(index de la question) et le champ MathLive de la phrase de conclusion, qui
reçoit l'index décalé de `DECALAGE_INDEX_CONCLUSION` (100) pour que ses
identifiants (`champTexteEx…Q…`, `resultatCheckEx…Q…`) ne se confondent pas
avec ceux du schéma. Par défaut, la question vaut donc deux points (le couteau
suisse additionne les `pointsMaxQuestion()` de ses enfants). Le paramètre
`sup4` (« Évaluation du schéma ») permet de ne pas évaluer le schéma (1) :
le couteau suisse ne contient alors que le champ de la conclusion, la question
vaut un point, le schéma reste à disposition de l'élève mais n'est ni vérifié
ni coloré, et la correction ne met pas ses nombres en orange. Avec 2 (par
défaut, comme avant l'ajout du paramètre), le schéma et le résultat final
valent un point chacun.

La banque `problemesSchemasEnBarre.ts` fournit, pour chaque problème, le
schéma attendu (textes « grandeur, quantité, unité »), les calculs (`Calcul`,
écrits par `texLigneCalcul()` : texte d'introduction, calcul avec ou sans
unités selon le réglage « Unités dans les calculs », phrase à la ligne) et la
phrase de conclusion (`texConclusion()`), dont la valeur
est la réponse attendue dans le champ.

Quand un problème demande deux valeurs (« Combien de billes possède chaque
enfant ? »), `conclusion.suite` porte la seconde. La phrase utilise alors un
`multi-mathfield` à deux champs, à l'index décalé, avec le barème
`toutPourUnPoint` : le point n'est accordé que si les deux réponses sont
justes, et la question garde le même total que les autres.

L'archive `6N4A-5-old` (uuid `b7c21`) tire encore dans quatre familles, qui
mêlent comparaisons simples et avec total. Elles sont figées dans
`famillesArchive6N4A5` : ne pas les modifier, sous peine de changer les énoncés
des liens déjà partagés. Ses problèmes attendent le type avec total quand le
total intervient, comme dans la version courante. Elle ignore
`conclusion.suite` et ne demande qu'une valeur, comme à sa publication.

## Schémas à étapes

`TYPES_SCHEMA_EN_BARRE_ETAPES` regroupe trois types qui restent en dehors de
`TYPES_SCHEMA_EN_BARRE` : ajouter un type à cette liste l'ajouterait aux
vignettes de `6N4A-5` et décalerait la numérotation de ses réglages et de ceux
de `P030`.

| Type                        | Textes (`CleTexteSchema`)                                                            | Dessin                                                     |
| --------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `additif-trois-parties`     | `tout` (accolade au-dessus), `partieA`, `partieB`, `partieC`                         | Une barre de trois parties                                 |
| `additif-somme-comparaison` | `partieA`, `partieB` (en haut), `partieC`, `difference` (en bas)                     | Une somme de deux parties comparée à une quantité          |
| `multiplicatif-avec-reste`  | `nombreDeParts`, `part` (en haut), `partPartage`, `reste`, `nombrePartages` (en bas) | Un produit, puis son partage en parts égales avec un reste |

Le dessin de `multiplicatif-avec-reste` dépend des nombres du problème,
transmis par `repartition` (`RepartitionAvecReste` :
`nbHaut × partHaut = nbBas × partBas + reste`) et convertis en largeurs par
`geometrieAvecReste()` :

- dans une rangée, toutes les parts ont la même largeur, et la plus grande part
  de l'énoncé est la plus large ;
- de 2 à 5 parts, toutes sont dessinées ; au-delà, deux rectangles, des
  pointillés et le dernier rectangle ;
- les deux rangées finissent au même endroit. Sans pointillés, tout est à
  l'échelle ; sinon, les pointillés occupent la place des parts non dessinées et
  l'écart entre les deux largeurs reste entre 1,15 et 1,6 ;
- le reste est un rectangle étroit, à l'échelle autant que possible, et son texte
  est écrit dessous, aligné à droite ;
- seule la première part de chaque rangée porte son texte, car le schéma ne peut
  contenir qu'un champ de saisie par valeur.

Le réglage du nombre de rectangles n'est pas affiché pour ce type.

Sur le papier, les rectangles ont une hauteur fixée d'avance : une étiquette de
plus de 14 caractères agrandit ceux des schémas additifs à étapes, et les parts
du schéma avec reste ont toujours la hauteur de deux lignes
(`hauteurRectImprime()`).

## Dans l'exercice `6N4A-2`

L'élève ne choisit pas le schéma : il retrouve les nombres manquants, dans
l'énoncé, dans le schéma ou dans les deux. Les réponses sont donc des nombres
corrigés un à un par des champs MathLive (quatre points par question), pas un
état du composant.

`schemaEnBarreFige()` produit ce schéma sans custom element : du HTML ordinaire,
du TikZ ou du Typst. Le texte d'une zone à compléter porte `MARQUE_CHAMP_SCHEMA`,
que `schemaHtml()` remplace par le champ reçu dans `champs`. Les nombres restent
dans le texte de l'énoncé et comptent donc dans l'empreinte de stabilité, ce qui
ne serait pas le cas dans l'attribut `initial-state` d'un custom element.

Chaque zone (`zone0` à `zone3`) n'apparaît qu'une fois dans le texte d'un
problème, car les remplacements ne portent que sur sa première occurrence.

## Dans l'exercice `6N5-10`

L'exercice conserve sa banque de problèmes et ses tirages. Le paramètre `sup4`
propose trois modes : répondre uniquement (1, par défaut), compléter le schéma
imposé puis répondre (2), choisir et compléter le schéma puis répondre (3).
Le paramètre historique `sup3`, qui fixe l'ordre des problèmes, reste inchangé.

`src/lib/problems/schemaProblemeVarie.ts` traduit les données des quinze
catégories en schémas attendus, sans tirage supplémentaire. Les transformations
utilisent le modèle additif parties-tout. Pour les comparaisons multiplicatives
qui portent sur la boîte seule (types 12, 13 et 15), son prix accompagne
l'étiquette de sa ligne ; le schéma attendu est `multiplicatif-comparaison`. Le
type 14, qui demande la somme du sachet et de la boîte, attend
`multiplicatif-comparaison-total`.
Le nombre de rectangles n'est pas imposé quand le nombre de parts ou le
multiplicateur est l'inconnue.

Les modes avec schéma utilisent le même couteau suisse que `6N4A-5` : un point
pour le schéma et un pour la réponse, avec l'index du champ MathLive décalé de 100. Les unités et les options de comparaison de la réponse initiale sont
conservées. Les corrections emploient le composant commun dans les trois modes,
avec la valeur calculée à la place de l'inconnue.
