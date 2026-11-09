import { propositionsQcm } from '../../../lib/interactif/qcm'
import { texPiCoefficient } from '../../../lib/mathFonctions/trigo'
import { combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Déterminer le cadran d'un angle"
export const interactifReady = true

export const dateDePublication = '04/05/2026'
export const uuid = 'f05d3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoFct-1'],
}

/**
 * Déterminer dans quel cadran se trouve un angle.
 * @author Nathan Scheinmann
 */
export default class DeterminerCadranAngle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbCols = 2
    this.nbColsCorr = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Déterminer dans quel cadran se trouve le point du cercle trigonométrique repéré par l'angle donné."
        : 'Déterminer dans quel cadran se trouvent les points du cercle trigonométrique repérés par les angles donnés.'

    const denominateurs = combinaisonListes(
      [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      this.nbQuestions,
    )

    for (
      let i = 0,
        numerateur,
        denominateur,
        reste,
        quotient,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      denominateur = denominateurs[i]
      let essais = 0
      do {
        numerateur = randint(-12 * denominateur, 12 * denominateur, [0])
        reste =
          ((numerateur % (2 * denominateur)) + 2 * denominateur) %
          (2 * denominateur)
        essais++
      } while (this.estSurUnAxe(reste, denominateur) && essais < 20)
      if (this.estSurUnAxe(reste, denominateur)) {
        cpt++
        continue
      }
      quotient = (numerateur - reste) / (2 * denominateur)

      const angle = this.texAngle(numerateur, denominateur)
      const angleReduit = this.texAngle(reste, denominateur)
      const cadran = this.cadran(reste, denominateur)

      texte = `$${angle}$`
      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = texte
      this.autoCorrection[i].propositions = ['I', 'II', 'III', 'IV'].map(
        (roman) => ({
          texte: roman,
          statut: roman === cadran,
        }),
      )
      this.autoCorrection[i].options = {
        ordered: true,
      }
      if (this.interactif) {
        texte += propositionsQcm(this, i).texte
      }

      texteCorr = `Deux mesures qui diffèrent d'un multiple de $2\\pi$ repèrent le même point du cercle trigonométrique.<br>`
      texteCorr += `La mesure de $[0;2\\pi[$ associée à $${angle}$ est $${angleReduit}$ car $${angle}=${angleReduit}${this.texMultipleDeuxPi(quotient)}$.<br>`
      texteCorr += `Le premier cadran repère les points dont les mesures d'angles sont dans $\\left]0;\\dfrac{\\pi}{2}\\right[$, le deuxième dans $\\left]\\dfrac{\\pi}{2};\\pi\\right[$, le troisième dans $\\left]\\pi;\\dfrac{3\\pi}{2}\\right[$ et le quatrième dans $\\left]\\dfrac{3\\pi}{2};2\\pi\\right[$.<br>`
      texteCorr += `Ce point se trouve donc dans le cadran $${miseEnEvidence(`\\mathrm{${cadran}}`)}$.`

      if (this.questionJamaisPosee(i, numerateur, denominateur)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  private texAngle(numerateur: number, denominateur: number) {
    return texPiCoefficient({ num: numerateur, den: denominateur })
  }

  private cadran(numerateur: number, denominateur: number) {
    const doubleNumerateur = 2 * numerateur
    if (doubleNumerateur < denominateur) return 'I'
    if (doubleNumerateur < 2 * denominateur) return 'II'
    if (doubleNumerateur < 3 * denominateur) return 'III'
    return 'IV'
  }

  private estSurUnAxe(numerateur: number, denominateur: number) {
    const doubleNumerateur = 2 * numerateur
    return (
      numerateur === 0 ||
      doubleNumerateur === denominateur ||
      numerateur === denominateur ||
      doubleNumerateur === 3 * denominateur
    )
  }

  private texMultipleDeuxPi(quotient: number) {
    if (quotient === 0) return ''
    return `${new FractionEtendue(quotient, 1).ecritureAlgebrique}\\times 2\\pi`
  }
}
