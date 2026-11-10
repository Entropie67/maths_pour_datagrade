# Générateur QCM JSON

Ce générateur permet de créer facilement des exercices QCM pour Mathalea à partir de fichiers JSON.

## Fonctionnalités

- **QCM simples** : Une seule bonne réponse par question
- **QCM à réponses multiples** : Plusieurs bonnes réponses possibles
- **Questions aléatoires** : Sélection aléatoire parmi plusieurs questions
- **Corrections détaillées** : Corrections spécifiques pour chaque réponse
- **Validation automatique** : Validation de la structure JSON
- **Compatibilité AMC** : Support pour l'export vers AMC

## Structure JSON

### Structure de base

```json
{
  "titre": "Titre de l'exercice",
  "consigne": "Consigne optionnelle",
  "options": {
    "vertical": false,
    "ordered": false,
    "lastChoice": 8
  },
  "questions": [
    {
      "enonce": "Énoncé de la question",
      "reponses": [
        "Bonne réponse (toujours en premier)",
        "Mauvaise réponse 1",
        "Mauvaise réponse 2",
        "Mauvaise réponse 3"
      ],
      "corrections": [
        "Correction pour la bonne réponse",
        "Correction pour la mauvaise réponse 1",
        "Correction pour la mauvaise réponse 2",
        "Correction pour la mauvaise réponse 3"
      ]
    }
  ]
}
```

### QCM à réponses multiples

```json
{
  "titre": "QCM à réponses multiples",
  "questions": [
    {
      "enonce": "Quels sont les nombres pairs ?",
      "reponses": ["2", "3", "4", "5"],
      "bonnesReponses": [true, false, true, false],
      "corrections": [
        "Correct ! 2 est pair",
        "Faux ! 3 est impair",
        "Correct ! 4 est pair",
        "Faux ! 5 est impair"
      ]
    }
  ]
}
```

## Utilisation

### Méthode 1 : Classe directe

```typescript
import QcmJsonGenerator from './QcmJsonGenerator'
import type { QcmJsonData } from './QcmJsonGenerator'

const qcmData: QcmJsonData = {
  titre: 'Mon QCM',
  questions: [
    {
      enonce: 'Combien font 2 + 2 ?',
      reponses: ['4', '3', '5', '22'],
      corrections: [
        'Correct !',
        'Erreur de calcul',
        'Erreur de calcul',
        "Ce n'est pas une concaténation",
      ],
    },
  ],
}

export default class MonQcm extends QcmJsonGenerator {
  constructor() {
    super(qcmData)
  }
}
```

### Méthode 2 : Fonctions utilitaires

```typescript
import { createSimpleQcm, createMultipleChoiceQcm } from './utils/qcmUtils'

// QCM simple
const ExerciceSimple = createSimpleQcm(
  'Combien font 3 × 7 ?',
  ['21', '18', '24', '28'],
  ['Correct !', 'Erreur', 'Erreur', 'Erreur'],
  'Multiplication',
)

// QCM à réponses multiples
const ExerciceMultiple = createMultipleChoiceQcm(
  'Quels sont les nombres premiers ?',
  ['2', '3', '4', '5'],
  [true, true, false, true],
  ['Correct !', 'Correct !', 'Faux', 'Correct !'],
  'Nombres premiers',
)
```

### Méthode 3 : Depuis un fichier JSON

```typescript
import { createQcmFromJson } from './utils/qcmUtils'
import qcmData from './exemples/qcm-mathematiques.json'

const ExerciceDepuisJson = createQcmFromJson(qcmData)

export default ExerciceDepuisJson
```

## Options disponibles

- **vertical** : `true` pour afficher les réponses verticalement (utile pour les longues réponses)
- **ordered** : `true` pour conserver l'ordre des réponses (pas de mélange)
- **lastChoice** : Index à partir duquel ne pas mélanger les réponses (ex: "Je ne sais pas")

## Validation

Le générateur valide automatiquement :

- La présence du titre
- La présence d'au moins une question
- La structure des questions (énoncé, réponses)
- La cohérence des corrections et bonnes réponses

## Exemples complets

Consultez les fichiers :

- `exemples/qcm-mathematiques.json` : Exemple de fichier JSON
- `exemples/ExempleQcmJson.ts` : Exemple d'utilisation basique
- `exemples/ExemplesQcmUtils.ts` : Exemples avec les fonctions utilitaires

## Support LaTeX

Le générateur supporte les formules LaTeX avec KaTeX :

- Utilisez `$formule$` pour les formules inline
- Utilisez `$$formule$$` pour les formules en bloc
- Doublez les backslashes dans les chaînes JSON : `\\frac{1}{2}`

## Compatibilité

- Compatible avec l'interface interactive de Mathalea
- Support AMC pour l'export vers Auto Multiple Choice
- Fonctionne avec les corrections automatiques
