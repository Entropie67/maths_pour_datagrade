import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'c6952'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1NO4I-4', '9R2NO4I-4', '9R3NO4I-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Convertir une fraction d'heure en minutes"
export const dateDePublication = '06/06/2026'

type Scenario = {
  afficheFraction: string
  estDecimal: boolean
  num: number
  den: number
}

// Tous les dénominateurs divisent 60, ce qui garantit une durée entière de minutes.
const scenarios: Scenario[] = [
  { afficheFraction: '\\dfrac{1}{2}', estDecimal: false, num: 1, den: 2 },
  { afficheFraction: '\\dfrac{1}{4}', estDecimal: false, num: 1, den: 4 },
  { afficheFraction: '\\dfrac{1}{5}', estDecimal: false, num: 1, den: 5 },
  { afficheFraction: '\\dfrac{1}{10}', estDecimal: false, num: 1, den: 10 },
  { afficheFraction: '\\dfrac{1}{20}', estDecimal: false, num: 1, den: 20 },
  { afficheFraction: '\\dfrac{1}{3}', estDecimal: false, num: 1, den: 3 },
  { afficheFraction: '\\dfrac{2}{3}', estDecimal: false, num: 2, den: 3 },
  { afficheFraction: '\\dfrac{1}{6}', estDecimal: false, num: 1, den: 6 },
  { afficheFraction: '0,1', estDecimal: true, num: 1, den: 10 },
]

const scenarioOfficiel: Scenario = {
  afficheFraction: '\\dfrac{1}{10}',
  estDecimal: false,
  num: 1,
  den: 10,
}

/**
 * DNB Antilles juin 2026 - Question 6
 * @author Rémi Angot
 */
export default class AutoQ6Antillesbrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(scenario: Scenario): void {
    const { afficheFraction, estDecimal, num, den } = scenario
    const dureeCorrecte = (num * 60) / den
    const dureeDecimale = num / den
    const unite = estDecimal ? 'heure' : "d'heure"

    this.enonce = `Parmi les propositions suivantes, quelle durée correspond à $${afficheFraction}$ ${unite} ?`

    this.reponses = [
      `$${texNombre(dureeCorrecte)}$ min`,
      `$${texNombre(dureeDecimale, 3)}$ min`,
      `$1$ min`,
      `$${den}$ min`,
    ]

    const calcul = estDecimal
      ? `${afficheFraction}\\times 60=${texNombre(dureeCorrecte)}`
      : `${afficheFraction}\\times 60=\\dfrac{${num * 60}}{${den}}`

    this.correction = `$1$ h vaut $60$ min, donc $${afficheFraction}$ ${unite} vaut $${calcul}$, soit $${miseEnEvidence(`${texNombre(dureeCorrecte)}`)}$ min.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(scenarioOfficiel)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    this.appliquerLesValeurs(choice(scenarios))
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options = { vertical: true, radio: true }
  }
}
