# Moteur d'export AMC

Cette page décrit le pipeline partagé d'Auto Multiple Choice. Pour déclarer AMC
dans un exercice, consultez le
[guide auteur](../../auteurs-exercices/complements/export-amc.md).

## Entrées

Le moteur traite principalement :

- les métadonnées `amcReady` et `amcType` ;
- `autoCorrectionAMC`, structure canonique des nouveaux développements ;
- `autoCorrection`, réutilisée par certains QCM et chemins d'inférence ;
- `questionsAMC`, structure historique encore présente dans des exercices.

Les types sont définis dans `src/lib/amc/amcTypes.ts`.

## Pipeline

1. `amcInference.ts` déduit une structure AMC lorsque le format interactif
   fournit assez d'informations.
2. `amcNormalize.ts` transforme les variantes acceptées en une représentation
   cohérente.
3. `amcRender.ts` produit le contenu consommé par l'export LaTeX AMC.
4. Les anciens exercices peuvent encore utiliser `amcConvert()` pour alimenter
   `questionsAMC`.

Le document LaTeX généré commence par la directive
`% !TEX encoding = UTF-8 Unicode`. Le téléchargement encode également le
contenu avec `TextEncoder` et déclare le type MIME en UTF-8. Cette directive
évite que les éditeurs, notamment TeXShop, interprètent comme ISO Latin 9 un
source composé uniquement de caractères ASCII.

La preview HTML conserve les contenus mathématiques délimités par `$...$` ou
`\[...\]` avant d'y convertir les sauts de ligne textuels. Les séparateurs
`\\` des environnements KaTeX comme `array`, `aligned` ou les matrices ne
doivent jamais devenir des balises `<br>`.

Pour un exercice de type `simple`, `mathaleaHandleExerciceSimple()` place les
différentes variantes dans `listeQuestions`. Après cette génération,
`question` ne contient que le dernier tirage : la preview AMC doit donc capturer
`listeQuestions` afin de ne pas réutiliser cette dernière variante à la place
de la première.

L'inférence est une aide, pas un remplacement pour une déclaration explicite
quand la question contient plusieurs sous-réponses ou un format ambigu.

## Politique d'inférence par `formatInteractif`

La décision se prend exclusivement à partir de
`autoCorrection[i].formatInteractif`. Les alias historiques et les custom
elements modernes doivent conduire au même contrat AMC.

Au moment du rendu LaTeX, le nombre de propositions vraies est vérifié une
dernière fois : dès qu'un QCM en contient plusieurs, l'environnement AMC
`questionmult` est utilisé, même si une ancienne métadonnée le déclare encore
comme `qcmMono`.

Chaque entrée de premier niveau de `autoCorrectionAMC` produit son propre
`\element{groupe}{...}`. Une consigne ou une introduction commune est répétée
dans ces éléments et ne doit pas fusionner plusieurs variantes dans un élément
unique : AMC peut ainsi tirer séparément chaque variante du groupe.

| Formats observés                                                                                | Inférence automatique                                      | Condition                                                                                                                                      |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `qcm`, `mathalea-qcm`                                                                           | `qcmMono` ou `qcmMult`                                     | au moins deux propositions ; `qcmMult` dès qu'une question possède plusieurs réponses vraies                                                   |
| `mathalea-mathfield`, ancien `mathlive`, ancien `calcul`                                        | `AMCNum`                                                   | une seule valeur finie, comparaison standard et options dont la sémantique est représentable par les cases AMC, sans réponses alternatives     |
| `fillInTheBlank`, `fill-in-the-blank`, `multi-mathfield`, `tableauMathlive`, `tableau-mathlive` | `AMCNum` pour un champ, `AMCHybride` pour plusieurs champs | les champs doivent être indépendants ; chaque champ non transposable devient un sous-bloc `AMCOpen`                                            |
| `mathalea-couteau-suisse`                                                                       | `AMCHybride`                                               | chaque enfant est inféré selon son propre `formatInteractif` ; un enfant non transposable devient seul un sous-bloc `AMCOpen`                  |
| `liste-deroulante`                                                                              | `AMCOpen`                                                  | la correction interactive ne contient pas toujours la liste complète des choix ; un QCM n'est sûr que si l'exercice le construit explicitement |
| formats texte, construction, clic, glisser-déposer, tableur, éditeurs et composants graphiques  | `AMCOpen`                                                  | l'énoncé LaTeX statique et la correction restent imprimables, mais la réponse ne peut pas être transposée fidèlement                           |
| format absent ou inconnu                                                                        | `AMCOpen`                                                  | aucun exercice ne doit disparaître silencieusement de la page d'export                                                                         |

Une réponse contenant plusieurs valeurs acceptées ne doit pas être réduite
arbitrairement à la première valeur : elle bascule en `AMCOpen` tant qu'une
représentation AMC équivalente n'est pas démontrée.

Une liste déroulante ordinaire ne conserve que la bonne valeur dans
`autoCorrection` et reste donc en `AMCOpen` : les distracteurs ne doivent pas
être inventés. En revanche, lorsqu'un exercice appelle explicitement
`listeDeroulanteToQcm()` pendant sa passe AMC, les propositions booléennes ainsi
produites priment sur le snapshot interactif et sont conservées comme
`qcmMono`/`qcmMult`. L'audit QCM couvre aussi ces QCM tardifs, absents de la
passe HTML interactive.

Lorsqu'un QCM existe déjà dans le snapshot HTML interactif, ce snapshot reste
la source canonique des propositions et de leurs statuts. Certains générateurs
historiques ne consomment pas les mêmes tirages aléatoires en contexte AMC ;
leur passe AMC peut donc correspondre à une autre variante dès la deuxième
question. Les textes imprimables du QCM sont récupérés par une passe LaTeX hors
AMC, qui suit la même séquence de tirages que la passe HTML. La preview ne doit
jamais associer l'énoncé d'une variante aux propositions d'une autre.

Pour un format multichamp, l'indépendance est également vérifiée au niveau de
la question. Un `callback` global conduit à `AMCOpen`. Un barème explicite reste
compatible seulement si sa table de vérité, sur toutes les combinaisons de
champs justes ou faux, est identique au barème indépendant (somme des points sur
le nombre de champs) ; un barème « tout juste ou zéro » ne peut pas être inféré
en plusieurs grilles AMC. Lorsque les champs sont indépendants, chacun est
traité séparément : un champ inférable devient `AMCNum` ou QCM d'intervalles,
tandis qu'un champ non transposable devient seul `AMCOpen`. Les grilles issues
d'un même multi-mathfield restent toutefois les sous-blocs d'une unique entrée
`AMCHybride` dans `autoCorrectionAMC` : elles ne deviennent pas autant de
questions AMC de premier niveau. Les grilles issues d'un tableau sont libellées
par leurs coordonnées (« Ligne 2, colonne 3 ») afin de rester associables à la
cellule demandée sur papier.

`mathalea-couteau-suisse` suit la même règle de regroupement. Une entrée du
parent représente une seule question imprimée : l'inférence parcourt son tableau
`elements`, convertit les enfants numériques et QCM, puis rassemble
tous les blocs dans une seule entrée `AMCHybride`. Les enfants incompatibles ne
dégradent pas les autres réponses : chacun devient localement un `AMCOpen`.
L'inférence ne regroupe donc jamais plusieurs entrées de premier niveau sur la
seule base de leur nombre ; l'appartenance à la même question doit être portée
explicitement par l'agrégateur.

Pour les champs mathématiques, le format ne suffit pas à autoriser `AMCNum`.
L'inférence relit aussi chaque réponse enregistrée par `handleAnswers()` :

- `compare` doit être absent ou égal à la comparaison standard
  `fonctionComparaison` ;
- les options actuellement reconnues sont `nombreDecimalSeulement`,
  `nombreAvecEspace`,
  `fractionIrreductible`, `fractionEgale`, `fractionIdentique`,
  `fractionDecimale`, `fractionSimplifiee`, `fractionReduite`,
  `ecritureScientifique`, `puissance`, `unite`, `HMS`, `coordonnees` et
  `estDansIntervalle` ;
- `noFeedback` est sans effet sur la réponse AMC ;
- toute autre option active ou fonction de comparaison spécialisée conduit à
  `AMCOpen` tant qu'une équivalence AMC dédiée n'est pas implémentée et testée.

Le nom historique `fractionEgale` rencontré directement comme
`formatInteractif` n'est pas assimilé à cette option de comparaison : faute de
contrat moderne porté par un mathfield, il reste en `AMCOpen`. Seule l'option
`fractionEgale` enregistrée dans la réponse d'un format mathfield déclenche
l'inférence fractionnaire décrite ci-dessous.

Une fraction numérique est réduite avant le dimensionnement des cases AMC. Une
fraction de dénominateur `1` devient un entier : `100/25` produit ainsi une
réponse `4`, et non une grille dimensionnée à partir d'une écriture décimale
approchée. Pour une `fractionEgale` non entière, le contrat interactif reste
inchangé, mais le contrat AMC attend la fraction irréductible et ajoute à
l'énoncé : « La fraction doit être simplifiée au maximum. » L'enseignant peut
toujours commuter manuellement la question en `AMCOpen` dans l'interface.

Avec `fractionIdentique`, l'inférence conserve au contraire exactement le
numérateur et le dénominateur enregistrés, y compris lorsqu'ils sont
réductibles. La grille fractionnaire AMC reproduit ainsi le contrat interactif
sans normaliser la fraction.

Avec `fractionDecimale`, AMC attend une fraction dont le dénominateur est une
puissance de 10. Une écriture déjà décimale, par exemple `50/100`, est conservée.
Sinon, une fraction possédant une écriture décimale finie est convertie vers la
plus petite puissance de 10 adaptée : `1/2` devient ainsi `5/10`. Une fraction
sans écriture décimale finie reste en `AMCOpen`. Le comparateur interactif garde
sa souplesse et continue d'accepter toute fraction décimale équivalente.

Les options `fractionSimplifiee` et `fractionReduite` autorisent plusieurs
écritures valides en interactif. En AMC, elles sont ramenées à la fraction
irréductible et l'énoncé précise : « La fraction doit être simplifiée au
maximum. » Cette contrainte supplémentaire ne modifie pas le contrat
interactif.

L'option `nombreAvecEspace` contrôle uniquement le groupement des chiffres dans
la saisie interactive. Elle n'altère pas la valeur mathématique : AMC la retire
avant de construire la grille numérique, qui porte sur le nombre lui-même.

L'option `estDansIntervalle` est transposée avec la commande native
`\AMCIntervals` lorsque les deux bornes sont numériques, finies et strictement
ordonnées. L'intervalle interactif devient le choix central d'une partition de
trois intervalles contigus de même amplitude, avec un distracteur de chaque
côté. L'élève choisit donc sur papier l'intervalle valide au lieu d'y écrire une
valeur libre. Les intervalles non bornés ou symboliques restent en `AMCOpen`.

L'option `coordonnees` décompose un couple numérique en grilles « Abscisse » et
« Ordonnée ». Un triplet ajoute une grille « Cote ». Les coordonnées
fractionnaires sont réduites et l'énoncé demande alors une simplification
maximale. Les coordonnées symboliques, les réponses alternatives et les
dimensions autres que deux ou trois restent en `AMCOpen`.

L'option `puissance` produit les deux zones AMC « Base » et « Exposant »
uniquement lorsque la réponse attendue est une puissance numérique explicite à
base et exposant entiers. Par exemple, `(-4)^{-3}` est représentable. Une
puissance littérale, une base décimale ou une expression qui ne se réduit pas à
la forme `base^exposant` reste en `AMCOpen`. Les options voisines, notamment
`sansExposantUn`, ne sont pas assimilées automatiquement à ce contrat.

L'option `unite` est inférée lorsque la valeur attendue est une instance de
`Grandeur`. Le contrat interactif continue d'accepter les conversions d'unités,
mais le contrat AMC code uniquement la mesure dans l'unité de la réponse et
affiche cette unité à droite de la grille numérique. En multichamp, chaque
grille porte donc sa propre unité. `precisionUnite` devient alors la tolérance
numérique AMC. Une réponse unitaire enregistrée comme simple chaîne reste en
`AMCOpen`, car son unité ne peut pas être extraite de façon suffisamment sûre.

L'option `HMS` produit un `AMCHybride` composé d'une grille numérique de deux
chiffres pour les heures, les minutes et les secondes. Chaque unité est affichée
à droite de sa grille. Une composante nulle reste présente : l'absence de case
noircie vaut alors zéro dans AMC. Lorsque la réponse attendue est une chaîne
explicitement au format `HM`, sans composante secondes, seules les grilles
heures et minutes sont produites. Une instance `Hms`, qui ne conserve pas cette
intention de présentation, produit par sécurité les trois grilles.

`interactifType` n'existe plus et ne doit pas être renseigné. Un item sans
`autoCorrection[i].formatInteractif` ne peut pas utiliser de format global de
repli.

## Invariants

- une entrée `AMCNum` décrit une réponse numérique unique ;
- `AMCHybride` contient plusieurs blocs indépendants ;
- un QCM conserve le même statut des propositions en HTML et en AMC ;
- un format dynamique doit fournir une alternative imprimable ;
- la correction AMC ne doit pas dépendre du DOM ou d'un état JavaScript.

Toute évolution des structures doit préserver les exercices historiques ou
prévoir une migration ciblée.

## Validation

Les rapports `AMCNum` et les tests d'exercices sont décrits dans
[Rapports d'exercices](../../../tests/rapports-exercices.md). Vérifiez également
les sorties LaTeX pour chaque type AMC modifié.

`src/lib/amc/amcQcmCorpus.audit.test.ts` parcourt les exercices référencés qui
déclarent `qcm`, `mathalea-qcm`, `qcmMono` ou `qcmMult`, génère leur version
interactive puis leur contrat AMC avec une graine fixe, et compare pour chaque
proposition le texte et le statut. Les répertoires `beta` et les fichiers dont
le nom contient `old` sont exclus de cet audit. Chaque exercice est un test
distinct, avec son propre délai, pour tenir sur les runners lents de la CI.
