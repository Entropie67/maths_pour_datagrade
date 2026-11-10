import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Déduire une comparaison du signe d'une différence"
export const dateDePublication = '16/07/2026'
export const dateDeModifImportante = '02/10/2026'
export const uuid = '16c85'

export const refs = {
  'fr-fr': ['1A-C01-7', '2A-N1-6'],
  'fr-ch': ['9R1QCMNO-2', '9R2QCMNO-2', '9R3QCMNO-2'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Déduire l'ordre de deux fractions à partir du signe de leur différence.
 * @author Stéphane Guyon
 */
export default class ComparerFractionsAvecDifference extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
      <p style="margin: 0;">
        Si deux nombres réels $A$ et $B$ vérifient $A-B > 0$, alors $A > B$.
      </p>
    `
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const n = this.quotaRandint('n', 30, 60)
    const forme = this.quotaChoice('forme', [1, 2])
    // Hors QCM, les deux fractions sont présentées dans un ordre aléatoire
    const inverser = choice([true, false])
    const fraction1 = `\\dfrac{${n}}{${n + 1}}`
    const fraction2 = `\\dfrac{${n + 1}}{${n + 2}}`

    const donnee =
      forme === 1
        ? `$${fraction1}-${fraction2} < 0$`
        : `$${fraction2}-${fraction1} > 0$`
    const explication =
      forme === 1
        ? `La différence $${fraction1}-${fraction2}$ est négative.<br>
        Le premier nombre $\\left(${fraction1}\\right)$ est donc inférieur au second $\\left(${fraction2}\\right)$`
        : `La différence $${fraction2}-${fraction1}$ est positive.<br>
        On a donc $${fraction2} > ${fraction1}$`

    if (this.versionQcm) {
      this.consigne = ''
      this.question = `On sait que :
        ${donnee}.<br><br>
        On peut en déduire que :`
      this.reponse = `$${fraction1} < ${fraction2}$`
      this.distracteurs = [
        `$\\dfrac{${n + 1}}{${n}} < \\dfrac{${n + 1}}{${n + 2}}$`,
        `$\\dfrac{${n + 1}}{${n}} < \\dfrac{${n + 2}}{${n + 1}}$`,
        `$\\dfrac{${n + 1}}{${n + 1}} < \\dfrac{${n}}{${n + 2}}$`,
      ]
      this.correction = `${explication}${forme === 1 ? ' :' : ", c'est-à-dire :"}<br>
        $${miseEnEvidence(`${fraction1} < ${fraction2}`)}$.`
    } else {
      const [membre1, membre2] = inverser
        ? [fraction2, fraction1]
        : [fraction1, fraction2]
      const symbole = inverser ? '>' : '<'
      this.consigne = ''
      // En interactif, les deux fractions entourent le champ de réponse
      this.question = `On sait que :
        ${donnee}.<br>
        Compléter avec le symbole $<$ ou $>$.${this.interactif ? '' : `<br>$${membre1} \\,\\ldots\\, ${membre2}$`}`
      this.optionsChampTexte = {
        texteAvant: `<br>$${membre1}$`,
        texteApres: `$${membre2}$`,
        dataKeys: ['<', '>'],
      }
      this.optionsDeComparaison = { texteSansCasse: true }
      this.reponse = symbole
      this.correction = `${explication}.<br>
        Ainsi, $${membre1} ${miseEnEvidence(symbole)} ${membre2}$.`
    }
  }
}
