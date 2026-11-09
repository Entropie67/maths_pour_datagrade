import Decimal from 'decimal.js'
import { texPrix } from '../../lib/format/style'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Utiliser une proportionnalité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDeModifImportante = '18/09/2026'

export const uuid = '6640b'

export const refs = {
  'fr-fr': ['6P3autoA-4'],
  'fr-ch': ['9R1FA1C-9', '9R2FA1C-9', '9R3FA1C-9'],
}

const transformations = [
  {
    numerateur: 2,
    denominateur: 1,
    operation: '\\times',
    verbe: 'multipliée',
    diviseur: 2,
  },
  {
    numerateur: 1,
    denominateur: 2,
    operation: '\\div',
    verbe: 'divisée',
    diviseur: 2,
  },
  {
    numerateur: 3,
    denominateur: 1,
    operation: '\\times',
    verbe: 'multipliée',
    diviseur: 3,
  },
  {
    numerateur: 1,
    denominateur: 3,
    operation: '\\div',
    verbe: 'divisée',
    diviseur: 3,
  },
  {
    numerateur: 4,
    denominateur: 1,
    operation: '\\times',
    verbe: 'multipliée',
    diviseur: 4,
  },
  {
    numerateur: 1,
    denominateur: 4,
    operation: '\\div',
    verbe: 'divisée',
    diviseur: 4,
  },
  {
    numerateur: 5,
    denominateur: 1,
    operation: '\\times',
    verbe: 'multipliée',
    diviseur: 5,
  },
  {
    numerateur: 1,
    denominateur: 5,
    operation: '\\div',
    verbe: 'divisée',
    diviseur: 5,
  },
  {
    numerateur: 10,
    denominateur: 1,
    operation: '\\times',
    verbe: 'multipliée',
    diviseur: 10,
  },
  {
    numerateur: 1,
    denominateur: 10,
    operation: '\\div',
    verbe: 'divisée',
    diviseur: 10,
  },
]

export default class ProportionnaliteCoefficients extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 3
    this.sup = '11'
    this.optionsChampTexte = { texteApres: `${sp()}$\\text{€}$` }
    this.besoinFormulaireTexte = [
      'Choix des coefficients',
      `Nombres séparés par des tirets
1 : Double
2 : Moitié
3 : Triple
4 : Tiers
5 : Quadruple
6 : Quart
7 : Multiplier par 5
8 : Diviser par 5
9 : Multiplier par 10
10 : Diviser par 10
11 : Mélange`,
    ]
  }

  nouvelleVersion() {
    const choixTransformation = this.fromQuestionPlan(
      'transformation',
      (nbQuestions) =>
        gestionnaireFormulaireTexte({
          saisie: this.sup,
          min: 1,
          max: 10,
          defaut: 11,
          melange: 11,
          nbQuestions,
        }).map(Number),
    )
    const transformation = transformations[choixTransformation - 1] ?? transformations[0]
    const fruits = [
      ['pêches', 4, 10, 30],
      ['noix', 5, 4, 13],
      ['cerises', 6, 11, 20],
      ['pommes', 2, 20, 40],
      ['framboises', 15, 1, 5],
      ['fraises', 7, 5, 10],
      ['citrons', 1.5, 15, 30],
      ['bananes', 1.5, 15, 25],
    ]
    const a = this.quotaRandint('fruit', 0, 7)
    const b = fruits[a][1] as number
    // Le prix final est toujours un nombre entier de centimes. Pour un tiers,
    // la masse de départ est aussi un multiple de 0,3 kg.
    const candidats = Array.from(
      { length: (fruits[a][3] as number) - (fruits[a][2] as number) + 1 },
      (_, i) => i + (fruits[a][2] as number),
    ).filter((valeur) => {
      const prixFinal = new Decimal(valeur)
        .div(10)
        .times(b)
        .times(transformation.numerateur)
        .div(transformation.denominateur)
      return (
        prixFinal.times(100).isInteger() &&
        (transformation.denominateur !== 3 || valeur % 3 === 0)
      )
    })
    const c = candidats[randint(0, candidats.length - 1)]
    const masseInitiale = new Decimal(c).div(10)
    const masseDemandee = masseInitiale
      .times(transformation.numerateur)
      .div(transformation.denominateur)
    const prixInitial = masseInitiale.times(b)
    const prixFinal = prixInitial
      .times(transformation.numerateur)
      .div(transformation.denominateur)
    this.reponse = prixFinal.toNumber()
    this.question = `$${texNombre(masseInitiale)}${sp()}\\text{kg}$ de ${fruits[a][0]} coûtent $${texPrix(prixInitial)}${sp()}\\text{€}$,
    combien coûtent $${texNombre(masseDemandee)}${sp()}\\text{kg}$ de ${fruits[a][0]} ?`
    this.correction = `On reconnaît une situation de proportionnalité.<br>
    La masse de ${fruits[a][0]} est proportionnelle au prix payé.<br>
    $${texNombre(masseInitiale)}${sp()}\\text{kg} ${transformation.operation} ${transformation.diviseur} = ${texNombre(masseDemandee)}${sp()}\\text{kg}$. La masse est ${transformation.verbe} par $${transformation.diviseur}$, donc le prix payé est aussi ${transformation.verbe} par $${transformation.diviseur}$.<br>
    $${texPrix(prixInitial)}${sp()}\\text{€} ${transformation.operation} ${transformation.diviseur} = ${miseEnEvidence(texPrix(this.reponse))}${sp()}\\text{€}$.<br>
    $${texNombre(masseDemandee)}${sp()}\\text{kg}$ de ${fruits[a][0]} coûtent alors $${miseEnEvidence(texPrix(this.reponse))}${sp()}\\text{€}$.
    `

    this.canReponseACompleter = `$\\dots${sp()}\\text{€}$`
  }
}
