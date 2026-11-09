# Exercice simple et Course aux nombres

`ExerciceSimple` (`src/exercices/ExerciceSimple.ts`) décrit **une** question,
sa réponse et sa correction. Le moteur génère autant de questions que demandé
en rappelant `nouvelleVersion()` avec une graine différente, écarte les
doublons et gère l'interactivité. C'est la forme la plus simple pour débuter,
et celle des questions de Course aux nombres (CAN).

## Exemple minimal

Modèle : `src/exercices/modèlesExos/00_simple_Course_au_Nombres.ts`.

```ts
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Calculer la somme de deux entiers'
export const interactifReady = true
export const dateDePublication = '24/09/2026'
export const uuid = 'UUID_GENERE'
export const refs = {
  'fr-fr': ['REFERENCE'],
  'fr-ch': [],
}

export default class SommeDeuxEntiers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = randint(1, 10)
    const b = randint(1, 10)
    this.question = `$${texNombre(a, 0)}+${texNombre(b, 0)}$`
    this.correction = `$${texNombre(a, 0)}+${texNombre(b, 0)}=${miseEnEvidence(texNombre(a + b, 0))}$`
    this.reponse = a + b
  }
}
```

Les imports sont écrits pour un fichier placé dans `src/exercices/6e/` ;
depuis `src/exercices/can/6e/`, ajouter un niveau de `../`.

- `this.question` : l'énoncé ;
- `this.correction` : la correction détaillée ;
- `this.reponse` : la réponse attendue, qui suffit à rendre l'exercice
  interactif.

`this.consigne` est commune à toutes les questions de l'exercice : elle n'est
pas mémorisée à chaque appel de `nouvelleVersion()`. Ne pas y placer les
données tirées au sort propres à une question (coordonnées de points, valeurs,
noms…). Après la génération, seule la dernière consigne affectée subsiste,
alors que les questions, réponses et corrections ont été conservées séparément.
Les données de chaque tirage doivent figurer dans `this.question`, avec un
format de rendu adapté. Vérifier aussi le rendu avec plusieurs questions,
même si le constructeur fixe `this.nbQuestions = 1` : un lien partagé peut
demander un autre nombre de questions avec le paramètre `n`.

`nouvelleVersion()` ne connaît pas l'indice de la question : ne pas écrire de
boucle, ne pas remplir `listeQuestions`.
Ne pas appeler `handleAnswers(this, 0, …)` dans cette méthode : cet appel
écraserait la réponse de la première question à chaque nouveau tirage.
Renseigner uniquement `this.reponse` ; le moteur l'enregistre au bon indice,
y compris pour un texte à trous avec plusieurs champs et un barème.

## Fonctionnement

`mathaleaHandleExerciceSimple()` (`src/lib/mathalea.ts`) :

1. appelle `nouvelleVersion()` une fois par question, avec une graine dérivée
   de celle de l'exercice ;
2. écarte la question si sa correction a déjà été produite
   (`questionJamaisPosee()` sur `this.correction`) ;
3. appelle `handleAnswers()` avec `this.reponse` ;
4. ajoute le champ de saisie à la fin de `this.question`.

## Réponse et comparaison

Le moteur convertit `this.reponse` avant de la passer à `handleAnswers()` :

| `this.reponse`                              | Traitement                                                      |
| ------------------------------------------- | --------------------------------------------------------------- |
| `number` ou `string`                        | convertie en chaîne ; sans option, tout calcul égal est accepté |
| `FractionEtendue`                           | `texFraction`                                                   |
| `Decimal`                                   | `toString()`                                                    |
| `Complexe`                                  | `tex()`                                                         |
| `Grandeur`, `Hms`                           | transmises telles quelles                                       |
| tableau                                     | plusieurs réponses acceptées                                    |
| objet (`{ reponse: {…} }`, `{ champ1: {…} }`) | transmis tel quel à `handleAnswers()`                         |

Comme un nombre est converti en chaîne, `this.reponse = 7` accepte aussi
`3+4`. Pour n'accepter que le résultat, ou pour toute autre forme attendue,
préciser les [options de comparaison](options-de-comparaison.md) :

```ts
this.optionsDeComparaison = { nombreDecimalSeulement: true }
this.reponse = a + b
```

```ts
this.optionsDeComparaison = { ensembleDeNombres: true }
this.reponse = `\\{${x1};${x2}\\}`
```

`this.compare` remplace `fonctionComparaison()`, par exemple par un comparateur
de [checks composables](checks-composables.md). Pour un contrôle complet, passer
l'objet attendu par `handleAnswers()` :

```ts
this.reponse = {
  reponse: { value: '\\dfrac{-3}{(3x+2)^2}', options: { fonction: true, variable: 'x' } },
}
```

## Champ de saisie

- `this.formatChampTexte` : le clavier (`KeyboardType.clavierDeBase`…) et les
  classes du champ ;
- `this.optionsChampTexte` : `{ texteAvant, texteApres }` pour écrire autour du
  champ (unité, signe `=`…).

## Texte à trous

Avec `this.formatInteractif = 'fillInTheBlank'`, `this.question` contient les
trous `%{champ1}`, `%{champ2}`… et `this.reponse` donne la réponse de chaque
trou :

```ts
this.formatInteractif = 'fillInTheBlank'
this.consigne = 'Encadrer chaque nombre par deux entiers consécutifs.'
this.question = `%{champ1}<${texNombre(decimal, 1)}<%{champ2}`
this.reponse = {
  bareme: toutPourUnPoint,
  champ1: { value: entierInf },
  champ2: { value: entierSup },
}
```

Avec un seul trou, `this.reponse` peut rester un nombre ou une chaîne.

## Version QCM

Un exercice simple peut proposer une version QCM à partir de distracteurs :
voir [Coder un QCM](coder-un-qcm.md#variante-exercicesimple).

## Répartir les cas entre les questions

Chaque question étant tirée indépendamment, un `choice()` peut retomber sur le
même cas pour toutes les questions. `ExerciceSimple` fournit des tirages
équilibrés sur l'ensemble des questions d'une version :

```ts
const operation = this.quotaChoice('operation', ['+', '-', '×'])
const n = this.quotaRandint('n', 2, 9)
```

`fromQuestionPlan(cle, construirePlan)` permet un plan sur mesure. Sur un
exercice à une seule question, ces méthodes reviennent à `choice()` et
`randint()` : un exercice publié peut les adopter sans changer ses tirages
à une question. Vérifier tout de même la
[stabilité des tirages](../../../tests/stabilite-exercices.md).

## Spécificités de la Course aux nombres

- Les questions de CAN sont rangées dans `src/exercices/can/` par niveau, avec
  une référence commençant par `can` (`can6C2-02`, `can2L10-01`…).
- Pour la version papier du concours, `this.canEnonce` remplace l'énoncé dans
  la grille et `this.canReponseACompleter` donne la zone à compléter (par
  exemple `$\\ldots < 3{,}5 < \\ldots$`).
- Les sujets complets de CAN assemblent des questions existantes
  (`src/exercices/_automatismesCan.ts`) ; voir la vue Course aux nombres dans
  [Système d'interactivité](../../maintenance-moteur/interactivite/systeme-interactivite.md#interactivité-dans-la-vue-course-aux-nombres).
