import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '6db78'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer le nombre de solution d'une équation"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ4FMt2026 extends ExerciceQcmACourt {
  private nombreSolutions = 0
  private regleSolutions = ''

  // Équation du type ax = b, x/a = b ou a/x = k (a ≠ 0, k ≠ 0) : une seule solution
  private equationUneSolution(): string {
    const a = randint(2, 9)
    const b = randint(1, 9) * choice([1, -1])
    const num = randint(-9, 9, 0) // a ≠ 0 pour a/x = k
    const k = randint(1, 9) * choice([1, -1]) // k ≠ 0
    return choice([
      `${a}x = ${b}`,
      `\\dfrac{x}{${a}} = ${b}`,
      `\\dfrac{${num}}{x} = ${k}`,
    ])
  }

  // x^2 = k avec k > 0 : deux solutions réelles opposées
  private equationDeuxSolutions(): string {
    return `x^2 = ${choice([2, 3, 4, 5, 9, 16, 25, 36])}`
  }

  // x^2 = -k (k > 0) ou a/x = 0 (a ≠ 0) : aucune solution réelle
  private equationAucuneSolution(): string {
    const num = randint(-9, 9, 0) // a ≠ 0 pour a/x = 0
    return choice([
      `x^2 = -${choice([1, 2, 4, 9, 16, 25])}`,
      `\\dfrac{${num}}{x} = 0`,
    ])
  }

  private appliquerLesValeurs(
    type: 'deux' | 'une' | 'aucune',
    correct: string,
    distracteurs: string[],
  ): void {
    let formulation: string
    let regle: string
    if (type === 'deux') {
      formulation = 'admet deux solutions réelles'
      regle =
        'Une équation de la forme $x^2=k$ avec $k>0$ admet deux solutions réelles opposées.'
    } else if (type === 'une') {
      formulation = 'admet une unique solution réelle'
      regle =
        "Une équation du type $ax=b$ (avec $a\\neq 0$) ou $\\dfrac{a}{x}=k$ (avec $a\\neq 0$ et $k\\neq 0$) admet une unique solution. <br> L'équation $x^2=0$ aussi : $x=0$."
    } else {
      formulation = "n'admet aucune solution réelle"
      regle =
        "Une équation $x^2=k$ avec $k<0$, ou $\\dfrac{a}{x}=0$ (avec $a\\neq 0$), n'admet aucune solution réelle."
    }

    this.nombreSolutions = type === 'deux' ? 2 : type === 'une' ? 1 : 0
    this.regleSolutions = regle
    this.enonce = `Quelle équation ${formulation} ?`

    this.correction = `${regle}<br>`
    this.correction += `La bonne réponse est donc $${miseEnEvidence(correct)}$.<br><br>`
    this.correction += `${texteGras('Rappel :')} <br>
    $\\bullet $ L'équation $ax=b$ a une solution si $a\\neq 0$ ; <br>
    $\\bullet$ L'équation $\\dfrac{a}{x}=k$ (avec $a\\neq 0$) a une solution si $k\\neq 0$, aucune si $k=0$ ; <br>
    $\\bullet$ L'équation $x^2=k$ a deux solutions si $k>0$, une seule si $k=0$, aucune si $k<0$.`

    this.reponses = [
      `$${correct}$`,
      `$${distracteurs[0]}$`,
      `$${distracteurs[1]}$`,
      `$${distracteurs[2]}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : deux solutions réelles ?  -> x²=4  (distracteurs 2x=-1, x²=-1, x/2=4)
    this.appliquerLesValeurs('deux', 'x^2 = 4', [
      '2x = -1',
      'x^2 = -1',
      '\\dfrac{x}{2} = 4',
    ])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const type = choice(['deux', 'une', 'aucune']) as
        'deux' | 'une' | 'aucune'
      let correct: string
      let distracteurs: string[]

      if (type === 'deux') {
        correct = this.equationDeuxSolutions()
        distracteurs = [
          this.equationUneSolution(),
          this.equationAucuneSolution(),
          this.equationUneSolution(),
        ]
      } else if (type === 'une') {
        correct = choice([this.equationUneSolution(), 'x^2 = 0'])
        distracteurs = [
          this.equationDeuxSolutions(),
          this.equationAucuneSolution(),
          this.equationDeuxSolutions(),
        ]
      } else {
        correct = this.equationAucuneSolution()
        distracteurs = [
          this.equationUneSolution(),
          this.equationDeuxSolutions(),
          this.equationUneSolution(),
        ]
      }

      this.appliquerLesValeurs(type, correct, distracteurs)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () => {
      const equation = this.reponses[0].replace(/^\$|\$$/g, '')
      return this.interactif
        ? `Le nombre de solutions réelles de l'équation $${equation}$ est `
        : `Déterminer le nombre de solutions réelles de l'équation $${equation}$.`
    }
    this.reponseCourte = () => String(this.nombreSolutions)
    this.correctionCourte = () => {
      const equation = this.reponses[0].replace(/^\$|\$$/g, '')
      const n = this.nombreSolutions
      return `${this.regleSolutions}<br>L'équation $${equation}$ admet donc $${miseEnEvidence(String(n))}$ solution${n > 1 ? 's' : ''} réelle${n > 1 ? 's' : ''}.`
    }
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
