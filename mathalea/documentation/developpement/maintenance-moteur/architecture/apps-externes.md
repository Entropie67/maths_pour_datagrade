# Apps externes (iframe) et remontée des scores

Les exercices de `src/exercices/apps/` ne génèrent pas de questions : ils
affichent une application tierce dans une `iframe` (mathix.org, coopmaths.fr,
forge…). Ils héritent tous de `ExternalApp`
(`src/exercices/apps/_ExternalApp.ts`), qui construit l'`iframe`, ajuste sa
hauteur et fait le pont entre l'app et les stores de MathALÉA.

## Paramètres passés à l'app

`ExternalApp.html` ajoute à l'URL de l'app :

- les paramètres de l'exercice (`sup`) sous forme de `searchParams` ;
- `v=eleve` en vue élève ;
- `embed=1` si l'URL initiale demandait `v=embed`, afin que l'app conserve
  l'information d'intégration même lorsque la vue élève remplace `v` ;
- `numeroExercice` (indice de l'exercice dans la séance) ;
- `seed`.

## Protocole `postMessage`

Tous les messages portent `numeroExercice` : `ExternalApp` ignore ceux qui ne
correspondent pas à son propre indice.

| `type`              | Sens           | Rôle                                                                                      |
| ------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| `mathaleaSettings`  | app → MathALÉA | L'app renvoie ses paramètres (`urlParams`), stockés dans `exercicesParams[i].sup`         |
| `height`            | app → MathALÉA | Ajuste la hauteur de l'`iframe` à la hauteur de contenu annoncée, avec une marge de 20 px |
| `mathaleaSendScore` | app → MathALÉA | Score final d'une tentative (`score`, `numberOfQuestions`, `finalState`)                  |
| `mathaleaAskScore`  | app → MathALÉA | L'app demande le score déjà enregistré                                                    |
| `mathaleaHasScore`  | MathALÉA → app | Restitution d'une copie précédente (`score`, `numberOfQuestions`, `finalState`)           |

`mathaleaHasScore` est émis par `handleCapytale.ts` au chargement d'une copie
d'élève (`window.postMessage`), puis relayé à l'`iframe`.

Avant le premier message `height`, MathALÉA dimensionne l'iframe avec un ratio
de secours dépendant de l'orientation de la fenêtre. Dès que l'app publie une
hauteur finie et strictement positive, cette hauteur devient la source de vérité
et les redimensionnements de la fenêtre ne réappliquent plus le ratio. Le
message n'est accepté que s'il provient de l'iframe concernée et porte son
`numeroExercice`.

## Règle du meilleur score

Comme pour les exercices MathALÉA, **seule la meilleure tentative est
conservée** : `resultsByExercice[i]` et `exercicesParams[i].bestScore` ne sont
mis à jour que si le nouveau score est supérieur ou égal au meilleur score
connu. Le meilleur score persisté entre deux sessions arrive par Capytale dans
`exercicesParams[i].bestScore` : c'est cette valeur, et non le dernier
`numberOfPoints` en mémoire, qui sert de référence après un rechargement.

`ExternalApp` protège aussi la copie contre deux défauts constatés côté apps :

- un score supérieur au nombre de questions est plafonné et signalé via
  `window.notify` ; il révèle en général une app qui **cumule** le score reçu
  par `mathaleaHasScore` avec celui de la nouvelle tentative (l'app doit stocker
  le score restauré dans une variable dédiée, jamais dans son compteur de
  points) ;
- `handleScore()` n'installe son écouteur `message` qu'une fois, alors que le
  getter `html` est appelé à chaque rendu.

## Remontée du score vers Moodle

Avec `recorder=moodle`, `ExternalApp` transmet le score de l'app comme le fait
une vue élève : après la mise à jour de `resultsByExercice`, il poste au parent
le message `mathalea:score` (`sendToMoodle()`), que `moodle.scorm.js` (SCORM) ou
`moodle.js` (question GIFT) convertit en note. Voir
[Réponses d'élève transmises aux LMS](../interactivite/reponses-lms.md).

- Le message n'est envoyé que pour une tentative qui devient le meilleur score ;
  une tentative moins bonne ne modifie donc pas la note.
- L'entrée de `resultsByExercice` porte `alea` (la graine) : `moodle.scorm.js`
  l'enregistre dans `cmi.suspend_data`.
- `finalState` n'est pas transmis (HTML pour la vue professeur, trop lourd pour
  les 4 096 caractères de `cmi.suspend_data`). Comme l'app ne rejoue pas de
  copie, Moodle ne conserve que la note.
- Le test `tests/unit/ExternalApp.moodle.test.ts` couvre l'envoi du message.

## Ajouter une app

Une app est une page web autonome, avec sa propre URL, que MathALÉA affiche
dans une `iframe`. Côté MathALÉA, il suffit d'un fichier dans
`src/exercices/apps/` :

```ts
import ExternalApp from './_ExternalApp'

export const uuid = 'challengeRelatif'
export const titre = 'Relever le challenge des nombres relatifs'

class challengeRelatif extends ExternalApp {
  constructor() {
    super('https://coopmaths.fr/challenge/?mathalea')
  }
}

export default challengeRelatif
```

Côté app, lire les paramètres ajoutés à l'URL et répondre par `postMessage` :

```js
const urlParams = new URLSearchParams(window.location.search)
const numeroExercice = Number(urlParams.get('numeroExercice'))
const vue = urlParams.get('v')
const isEmbedded = urlParams.get('embed') === '1' || vue === 'embed'

// en fin de partie
window.parent.postMessage(
  {
    type: 'mathaleaSendScore',
    score,
    numberOfQuestions,
    numeroExercice,
    finalState,
  },
  '*',
)

// quand le professeur change un réglage
window.parent.postMessage(
  {
    type: 'mathaleaSettings',
    urlParams: window.location.search,
    numeroExercice,
  },
  '*',
)

// À chaque changement de taille du contenu intégré
window.parent.postMessage(
  { type: 'height', height: document.body.scrollHeight, numeroExercice },
  '*',
)
```

`finalState` (facultatif) est du HTML qui résume la partie (réponses,
conseils) ; il est rendu à l'app par `mathaleaHasScore` quand le professeur
consulte la copie. Le paramètre `v=eleve` permet à une app paramétrable de
distinguer la vue élève (par exemple pour masquer ses réglages).

## Voir aussi

- [Questions de cours](questions-de-cours.md) : l'app `questionsDeCours` a
  désormais un équivalent natif, les deux cohabitent
- [Utilisation avec Capytale](../../../utilisation/integrations/capytale.md)
