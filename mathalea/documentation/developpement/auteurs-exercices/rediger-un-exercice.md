# Rédiger un exercice

Ces règles portent sur la formulation et la présentation d'un exercice
(titre, consigne, énoncés, corrections), pas sur sa mécanique. Elles
s'appliquent que l'exercice soit écrit à la main ou généré par une IA.
Pour construire la classe elle-même, voir
[Créer un exercice](creer-un-exercice.md).

## Aucun aléa dans le constructeur

Le constructeur d'un exercice ne tire **jamais** de valeur au hasard : ni
`randint`, `choice`, `shuffle`, `combinaisonListes`, `prenom()`, `Math.random()`,
ni initialiseur de champ de classe qui en appelle un
(`private ordre = shuffle([1, 2, 3])`). Tout tirage se fait dans
`nouvelleVersion()`, ou dans une fonction qu'elle appelle.

Pourquoi : le générateur n'est initialisé avec la graine (`alea=…` de l'URL)
qu'au début de `nouvelleVersion()`. Un tirage fait dans le constructeur ne
dépend donc pas de la graine : le même lien donne un exercice différent à chaque
chargement, et les liens partagés ne sont plus reproductibles. Le test de
stabilité ne le détecte pas toujours.

```ts
// Non : la valeur par défaut du paramètre change à chaque chargement de la page
constructor() {
  super()
  this.sup2 = randint(2, 4)
}

// Oui : valeur fixe pour le paramètre, tirage dans nouvelleVersion()
constructor() {
  super()
  this.sup2 = 3
}
nouvelleVersion() {
  const a = randint(-5, 5)
  // …
}
```

- Un paramètre (`this.sup`, `this.sup2`…) a une valeur par défaut **fixe**. Pour
  proposer « au hasard », ajouter un choix du menu (par exemple `0 : Au hasard`) et
  tirer la valeur dans `nouvelleVersion()`.
- Des données construites à partir de valeurs aléatoires (les `affirmations`
  d'un `ExerciceVraiFaux`, un tableau de cas…) se construisent dans
  `nouvelleVersion()`, avant `super.nouvelleVersion()` si la classe parente les
  utilise.
- Les classes `ExerciceQcm…` appellent `this.versionAleatoire()` dans leur
  constructeur : c'est sans conséquence car `nouvelleVersion()` retire de nouveau
  les valeurs, mais n'y conserver aucun état tiré au hasard et ne pas copier ce
  schéma ailleurs.

## Titre et consignes à l'infinitif

- Le `titre` de l'exercice commence par un verbe à l'infinitif.
- Le titre ne se termine ni par un point final ni par un astérisque. Éviter
  les espaces en début ou fin de titre et les espaces doublées. Les points
  de suspension qui annoncent une liste incomplète restent possibles.
- La `consigne` (et toute instruction donnée à l'élève) est rédigée à
  l'infinitif, pas à l'impératif ni à la deuxième personne.

```ts
// Oui
export const titre = 'Ajouter 9 à un entier'
this.consigne = 'Calculer.'

// Non
export const titre = 'Additionne 9 à un nombre'
this.consigne = 'Calcule.'
```

## Ponctuation

Toute phrase se termine par un point, y compris dans les énoncés et les
corrections. Exception : quand un saut de ligne suit un deux-points et que la
ou les lignes suivantes sont une expression purement mathématique, on ne met
pas de point final après cette expression.

```ts
// Oui
const texte = 'Calculer la somme suivante :\n$$3 + 5$$'

// Non — pas de "..." pour éviter de finir la phrase
const texteCorr = `Le résultat est ${resultat}...`
```

Ne jamais utiliser `...` pour couper court à une phrase dans une correction :
écrire la phrase complète.

Quand le champ de saisie interactif termine une phrase, le point final va dans
`texteApres`, après l'unité s'il y en a une. Sans phrase autour du champ
(simple retour à la ligne, `$A=$`…), pas de point.

`texteApres` est toujours séparé du champ par une seule espace, ajoutée par le
moteur (`texteApresChamp()`, `src/lib/outils/outilString.ts`) : ne pas la
mettre soi-même. Une espace en tête de `texteApres` est ignorée.

```ts
// Oui
this.optionsChampTexte = {
  texteAvant: '<br>Sa vitesse moyenne est ',
  texteApres: '$\\text{km/h}$.',
}
```

En revanche, quand des points de suspension sont réellement nécessaires
(énumération, suite qui continue, valeur à compléter…), ils doivent être
écrits `\ldots` et non trois points littéraux, pour un rendu typographique
correct.

```ts
// Oui — suite qui continue
sortie.enonce.valeurs = [triangle.a1, '\\ldots', triangle.a3]

// Non
sortie.enonce.valeurs = [triangle.a1, '...', triangle.a3]
```

## Nombres, unités et virgules

- Tous les nombres, sauf les dates (ex. `en 1789`), doivent être écrits
  entre `$...$` : `$3$`, pas `3`, y compris quand le nombre apparaît au
  milieu d'une phrase par ailleurs en texte normal.
- Avant une unité, on met une espace insécable (`sp()` dans le code, ou
  `~` en LaTeX/Typst).
- Un pourcentage s'écrit avec une espace insécable entre le nombre et le
  signe `%`, jamais `33%` ni `33 %` : `33${sp()}%` dans un texte, et
  `$33\\,\\%$` (ou `$33~\\%$`) dans une zone mathématique, où `sp()` ne
  convient pas. Cette règle vaut aussi quand le nombre est une variable :
  `${taux}${sp()}%`. Elle ne s'applique ni aux commentaires, ni aux valeurs
  CSS (`width: 100%`), ni aux adresses.
- Une unité n'est jamais du texte brut comme `cm` : elle s'écrit
  `\text{cm}`, à l'intérieur d'une zone mathématique (`$...$`).
- On met une virgule avant « soit » et avant « alors ».
- On met une virgule après « or ».
- Les guillemets « » sont suivis et précédés d'une espace insécable : `sp()`
  après « et avant », soit `«${sp()}texte${sp()}»` dans une chaîne en
  template literal.

```ts
// Oui
const texte = `La distance est de $${d}${sp()}\\text{cm}$, soit $${d / 100}${sp()}\\text{m}$.`
const texte2 = 'Or, les deux droites sont parallèles, donc les angles sont égaux.'
const texte3 = `Le prix a baissé de ${taux}${sp()}%, soit $${taux}\\,\\%$ en notation mathématique.`

// Non
const texte = `La distance est de ${d} cm, soit ${d / 100} m.`
const texte3 = `Le prix a baissé de ${taux}%, ou de ${taux} %.`
const texte2 = 'Or les deux droites sont parallèles.'
```

## Couleur du résultat final

- Le résultat final attendu est mis en valeur avec `miseEnEvidence()`
  (couleur `orangeMathalea`). Cette couleur est réservée à ce seul usage.
  `miseEnEvidence()` ne fonctionne qu'à l'intérieur d'une zone `$...$`.
- Si l'exercice est interactif, la valeur passée à `miseEnEvidence()` doit
  être **exactement** la réponse que l'élève doit saisir : ne pas y inclure
  d'unité, de mise en forme ou de texte que le champ de saisie n'attend pas.
- Si un exercice existe en QCM **et** en champ libre (voir
  [Conserver un QCM en option](interactivite-simple.md#conserver-un-qcm-en-option)),
  écrire une seule `correction`, avec la valeur attendue dans `miseEnEvidence()` et
  l'unité en noir juste après : `$${miseEnEvidence(v)}\\text{ cm}$`. Le mode se règle seul
  (`mettreEnEvidenceSelonMode()`, `src/lib/interactif/alignerMiseEnEvidenceQcm.ts`) :
  en QCM et sans interactivité, la bonne proposition complète passe en orange, unité
  comprise ; en champ libre, seule la valeur du champ reste en orange. Écrire la
  proposition complète dans `miseEnEvidence()` (`${miseEnEvidence(`${v}\\text{ cm}`)}`)
  donne le même résultat. Aucune `correctionCourte` n'est nécessaire pour régler la couleur.
- **Règle de fond : l'orange de la `correction` contient exactement ce que le champ de
  saisie attend, ni plus ni moins** (valeur, avec son signe, et l'unité seulement si le champ
  l'attend, par exemple « (Préciser l'unité.) »). `mettreEnEvidenceSelonMode()` ne sait que
  retirer d'une mise en évidence un libellé, une unité ou un texte que le champ n'attend pas ;
  elle ne peut pas deviner une valeur que la correction n'écrit pas. Si le champ attend `-12,5`
  alors que la correction du QCM dit « baissé de `12,5 %` », la correction doit écrire `-12,5`
  quelque part (par exemple dans la ligne `t = … = -12,5 %`) et y mettre l'orange, sinon une
  `correctionCourte` reste nécessaire pour la saisie libre. Une `correctionCourte` ne sert
  plus à régler la couleur : elle ne reste que pour une autre rédaction.
- **Quand une `correctionCourte` reste utile.** Seulement quand la question de la saisie
  libre n'est pas celle du QCM, si bien que les deux corrections ne mettent pas en évidence
  la même chose :
  - le QCM propose un calcul ou une expression (`200 \\times 0,95`) et le champ attend le
    résultat (`190`) ;
  - le champ attend une valeur signée ou d'une autre forme que la proposition (`-4,5` pour
    « baisse de 4,5 % ») ;
  - le champ attend un ensemble (`\\{6\\,;\\,-0,8\\}`) ou un intervalle alors que la proposition
    du QCM est une phrase (« 6 et -0,8 ») ;
  - la saisie libre pose une autre question (l'ordonnée d'un point, au lieu de « quel point
    est sur la courbe ? »), avec un `enonceCourt` différent.

  Dans les autres cas, ne pas écrire de `correctionCourte` : une seule `correction`, avec la
  même conclusion pour tous les modes (par exemple « Le pourcentage est donc … » plutôt que
  « La bonne réponse est donc … »), suffit. Une remarque propre au QCM (« 12,56 cm³ n'est
  qu'une valeur approchée ») peut rester dans la correction : elle s'affiche aussi en saisie libre.
- Quand le résultat à mettre en valeur est une phrase mêlant texte et
  mathématiques (par exemple la réponse d'un QCM), on mélange les deux
  fonctions : `texteEnCouleurEtGras()` pour les portions de texte (en
  dehors de `$...$`, c'est son seul usage possible) et `miseEnEvidence()`
  pour les portions mathématiques (à l'intérieur de `$...$`). `miseEnEvidence()`
  ne contient jamais de texte, même dans `\text{}`, pas même une unité :
  `$${miseEnEvidence(v)}$ ${texteEnCouleurEtGras('cm$^3$')}`.
- Une unité que l'élève ne saisit pas reste en noir, hors de `miseEnEvidence()` :
  `$${miseEnEvidence(v)}\\text{ cm}$`. Pour un champ HMS, seules les valeurs sont
  en évidence : `$${miseEnEvidence(h)}\\text{ h }${miseEnEvidence(m)}\\text{ min}$`.
- Quand le texte ne peut pas sortir du mode mathématique (cellule d'un tableau ou
  du tableur, colonne d'un `aligned`, légende d'un `\underbrace`), le colorer avec
  `miseEnCouleur('\\textbf{…}')`, jamais avec `miseEnEvidence()`.
- Tout texte explicatif de la correction (méthode, calcul intermédiaire,
  bloc "Mentalement :") utilise `texteEnCouleur(texte, bleuMathalea)` — ne
  jamais laisser la couleur par défaut de `texteEnCouleur()`, qui est
  `orangeMathalea` et produirait une explication orange par erreur. Les
  nombres présents dans ce texte restent soumis à la règle ci-dessus : ils
  sont écrits entre `$...$` à l'intérieur même de la chaîne passée à
  `texteEnCouleur()`.

```ts
import {
  miseEnEvidence,
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { bleuMathalea } from '../../lib/colors'

// Résultat final : orange, valeur brute attendue par le champ de saisie
const texteCorr = `$${a}+9=${miseEnEvidence(resultat)}$`

// Résultat final mêlant texte et maths (QCM) : mélange des deux fonctions
const texteQcm = `${texteEnCouleurEtGras('Le nombre')} $${miseEnEvidence(a)}$ ${texteEnCouleurEtGras('a pour image')} $${miseEnEvidence(image)}$ ${texteEnCouleurEtGras('par la fonction')} $${miseEnEvidence('f')}$.`

// Explication : bleu explicite, jamais la couleur par défaut ;
// les nombres restent entre $ dans la chaîne
const explication = texteEnCouleur(
  'Mentalement, on ajoute $10$ puis on retire $1$.',
  bleuMathalea,
)
```

## Rigueur des corrections

Une correction constitue une démonstration complète, adaptée aux outils du
programme du niveau visé. Nommer le théorème utilisé et vérifier ses hypothèses
avant de conclure. Un calcul ou une conjecture numérique ne remplace pas une
justification.

Pour les suites de terminale spécialité :

- préciser les rangs concernés et justifier le sens des inégalités lors d'une
  division ou d'un passage aux inverses ;
- écrire les limites avec `\lim_{n\to+\infty}`, plutôt qu'abréger une conclusion
  par `u_n\to\ell` dans une phrase ;
- pour le théorème des gendarmes, établir l'encadrement et la limite commune
  des deux suites encadrantes ; pour le théorème de comparaison, établir
  l'inégalité et la limite infinie de la suite utilisée pour comparer ;
- pour une récurrence, présenter l'initialisation au bon rang, l'hypothèse
  d'hérédité à un rang arbitraire, la preuve au rang suivant et la conclusion
  par le principe de récurrence ;
- pour une suite définie par `u_{n+1}=f(u_n)`, établir sa convergence avant
  d'utiliser la continuité de `f` en sa limite pour obtenir `\ell=f(\ell)`.
  Résoudre cette équation seule ne prouve pas la convergence ;
- pour réfuter une affirmation générale, donner un contre-exemple et vérifier
  qu'il satisfait les hypothèses tout en contredisant la conclusion.

## Réponse courte et correction minimale

La réponse finale en orange est extraite automatiquement pour la correction
minimale (Typst, TBI, flashcards, diaporama PDF, « J’ai / Qui a », OMR) et pour
le tableau des réponses du diaporama. Les explications intermédiaires ne doivent
pas utiliser cette couleur.

Pour conserver une autre convention de couleurs ou fournir une réponse structurée,
remplir `this.listeReponsesCourtes[i]` pendant la génération, avec un fragment
HTML/LaTeX autonome (formules entre `$...$`). Il a priorité sur l’extraction :

```ts
this.listeReponsesCourtes[i] = `$${a * b}$`
```

Pour un `ExerciceSimple`, affecter `this.reponseCourteExplicite` dans
`nouvelleVersion()` ; le moteur la copie pour chaque question. Les réponses
explicites sont effacées à chaque génération, y compris entre deux questions
simples, pour éviter de conserver une réponse d’un ancien tirage.

Quand la réponse nécessite une construction, un tableau ou une démonstration,
déclarer `this.reponseCourteDisponible = false` dans le constructeur et expliquer
la raison dans un commentaire. La correction complète est alors conservée,
même si elle contient une étape orange. Une réponse explicite non vide reste
prioritaire. Pour un exercice mixte, affecter seulement
`this.listeReponsesCourtes[i] = null` aux questions concernées. `undefined` ou
une chaîne vide laisse l’extraction automatique s’appliquer.

Le tableau du diaporama conserve les lettres des QCM ; pour une question sans
réponse courte, il propose une miniature agrandissable de la correction. Les
réglages signalent cette présentation avant de lancer le diaporama.

Le contrôle [des corrections minimales](../../tests/corrections-minimales.md)
vérifie les exercices modifiés en CI. Ne pas déclarer une absence de réponse
courte pour masquer un résultat final oublié.

## Correction d'une décomposition en facteurs premiers

La correction d'une décomposition est un calcul par étapes : une égalité par
ligne, chaque ligne découpant les facteurs composés en deux facteurs. Seule la
dernière ligne est un produit de facteurs premiers (mise en évidence), avec ou
sans puissances. Ne pas afficher deux produits de facteurs premiers successifs
(par exemple `2\times 2\times 3 = 2^2\times 3`).

Utiliser `texCalculDecomposition(n, { nom, puissancesOn })` de
`src/lib/outils/primalite.ts` (ou `lignesDecompositionFacteursPremiers` pour
récupérer les lignes). Modèle : `src/exercices/3e/3A11.ts`.

## Accessibilité

Un élève qui utilise un lecteur d'écran doit recevoir la même information qu'un
élève qui voit la page. Ces règles s'appliquent à tout nouvel exercice ; les
exercices déjà publiés ne sont pas migrés en bloc. Modèle :
`src/exercices/modèlesExos/25_figure_accessible.ts`.

### Décrire chaque figure

Tout appel à `mathalea2d` d'un nouvel exercice porte une de ces deux options :

```ts
// La figure porte de l'information : la décrire avec les valeurs tirées.
const description = `Rectangle de longueur ${stringNombre(L, 1)}${sp()}cm et de largeur ${stringNombre(l, 1)}${sp()}cm. Ses quatre angles sont droits.`
texte += mathalea2d(
  Object.assign({ scale: 0.7, description }, fixeBordures(objets)),
  objets,
)

// La figure n'apporte rien (ornement) : la masquer.
texte += mathalea2d(
  Object.assign({ decorative: true }, fixeBordures(ornement)),
  ornement,
)
```

La description remplace le tracé et ses étiquettes, qui ne sont alors plus lus.
Les champs de réponse placés dans la figure (`MetaInteractif2d`) restent
accessibles. La description doit donc :

- reprendre tout ce que la figure donne : longueurs, codages, noms des points ;
- ne pas révéler la réponse (`6M2B-1` donne les côtés, jamais l'aire) ; dans une
  correction, elle peut la contenir ;
- être en texte brut, sans `$` ni LaTeX. C'est une exception à la règle des
  nombres entre `$...$` : utiliser `stringNombre()` et non `texNombre()`, qui
  donnerait `3{,}5`. `sp()` reste possible.

Une figure ApiGeom ou 3D, un tableau ou un autre composant n'a pas cette option :
donner son information dans le texte de l'énoncé.

### Quand la description donnerait la réponse

Dans `6G0-7` (« Graphiquement, les points sont-ils alignés ? »), décrire la position
des points revient à résoudre l'exercice. La description présente alors la tâche
sans la résoudre, et le constructeur déclare que l'exercice demande la vue, en
donnant la raison :

```ts
this.demandeLaVue = true // Décrire la position des points donnerait la réponse.
```

Ce marqueur ne dispense pas de `description`. Il ne convient pas à une figure
simplement difficile à décrire.

### Désigner sans couleur ni position

Ne jamais désigner un élément par sa seule couleur ni par sa seule position :
un élève qui n'y a pas accès, ou une impression en noir et blanc, ne permet plus
de le retrouver. Le nommer.

```ts
// Oui
'Calculer la longueur du segment $[AB]$.'
'Dans la figure 2, calculer l’aire du carré.'

// Non
'Calculer la longueur du segment rouge.'
'Calculer l’aire de la figure ci-dessous, à gauche.'
```

### Champs et formats du moteur

Utiliser les champs et formats interactifs du moteur
(`ajouteChampTexteMathLive()`, `remplisLesBlancs()`, `createQuestion()`,
`MetaInteractif2d`… : voir [Interactivité simple](interactivite-simple.md)), jamais
un `<input>`, un `<select>` ou un autre élément écrit à la main : le moteur leur
donne leur nom accessible et les rend utilisables au clavier.

### Images

Une balise `<img>` porte toujours un attribut `alt` : le contenu de l'image, ou
`alt=""` si elle n'apporte rien.

`pnpm a11y:check` signale ces points sur les exercices modifiés, sans jamais
bloquer : voir [Contrôle d'accessibilité](../../tests/controle-accessibilite.md).

## Métadonnées

- `uuid` et `refs` ne sont jamais copiés depuis un autre exercice : générer
  un `uuid` avec `pnpm getNewUuid` et vérifier que la référence est libre.
  Voir [Créer un exercice](creer-un-exercice.md#2-déclarer-les-métadonnées).

## Modifier un exercice déjà publié

Si la modification touche un exercice déjà publié (donc déjà partagé avec un
`uuid` et une graine), lancer la vérification de stabilité des tirages :

```sh
CHANGED_FILES="src/exercices/6e/6N1E.ts" pnpm stability:check
```

Le détail de la règle et des trois issues possibles est dans
[Stabilité des tirages](../../tests/stabilite-exercices.md).

## Checklist rapide

- [ ] le titre commence par un infinitif ;
- [ ] aucun tirage au hasard dans le constructeur (valeurs par défaut des paramètres fixes) ;
- [ ] la consigne et les énoncés sont à l'infinitif ;
- [ ] toutes les phrases finissent par un point (sauf formule à la ligne
      après un deux-points), y compris celle qui se termine par le champ
      de saisie (point dans `texteApres`) ;
- [ ] aucun `...` pour couper court à une phrase ; les points de suspension
      réellement utiles sont écrits `\ldots` ;
- [ ] tous les nombres (sauf les dates) sont entre `$...$` ;
- [ ] une espace insécable précède chaque unité, et l'unité est écrite
      `\text{...}` dans une zone `$...$` ;
- [ ] une espace insécable précède chaque `%` (`${sp()}%` en texte, `\\,\\%` en
      maths) ;
- [ ] virgule avant « soit » et « alors », virgule après « or » ;
- [ ] le résultat final est dans `miseEnEvidence()` (ou un mélange
      `texteEnCouleurEtGras()` / `miseEnEvidence()` si la réponse mêle texte
      et maths), et correspond exactement à la réponse attendue si
      l'exercice est interactif ;
- [ ] les explications de correction utilisent `bleuMathalea` explicitement ;
- [ ] chaque figure `mathalea2d` porte une `description` en texte brut, avec les
      valeurs tirées et sans la réponse, ou `decorative: true` si elle n'apporte
      rien ;
- [ ] si la description donnerait la réponse, elle présente seulement la tâche et
      le constructeur déclare `this.demandeLaVue = true` ;
- [ ] aucun élément n'est désigné par sa seule couleur (« le segment rouge ») ni par
      sa seule position (« à gauche », « ci-dessous ») ;
- [ ] les champs viennent du moteur, sans HTML écrit à la main ;
- [ ] `uuid` et `refs` sont neufs, pas copiés ;
- [ ] `pnpm stability:check` passe si un exercice publié a été modifié.
- [ ] `dateDeModifImportante` est créée ou mise à jour à la date du jour dès
      que la modification est importante (nouvelle option, nouvelle saisie,
      correction changée) ; voir [Stabilité des tirages](../../tests/stabilite-exercices.md#date-de-modification-importante).
- [ ] En QCM et champ libre, `miseEnEvidence()` ne contient que la valeur que
      le mode attendu demande (voir « Couleur du résultat final »).
- [ ] En champ libre, la dernière phrase de la consigne est une question (« Quel
      est… ? »), et non une phrase à trous qui se termine par « : ».
- [ ] En champ libre, le clavier (`clavierReponseCourte`) correspond à la réponse :
      fraction → `clavierDeBaseAvecFraction`, entiers relatifs → `clavierDeBase`,
      entiers naturels ou décimaux positifs → `clavierNumbers`.
- [ ] En champ libre, si la forme de la réponse compte, un mode de comparaison
      est imposé (`compareReponseCourte` ou `optionsDeComparaison`) ; sinon la
      comparaison par défaut convient.
