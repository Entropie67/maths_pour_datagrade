import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une différence de deux carrés'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 * Créé pendant l'été 2021

 * Date de publication
*/
export const uuid = '76ac6'

export const refs = {
  'fr-fr': ['can2L11-01'],
  'fr-ch': ['NR'],
}
export default class CalculAstucieuxAvecDifferenceCarre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 15, 40)

    if (context.isAmc) this.versionQcm = false
    const b = this.versionQcm ? a + randint(1, 2) : a + 1
    if (this.quotaChoice('ordre', [true, false])) {
      this.question = this.versionQcm
        ? `$${b}^2-${a}^2$ est égal à : `
        : `Calculer $${b}^2-${a}^2$.`
      this.correction = `La forme du calcul fait penser à l'identité remarquable :<br> $a^2-b^2=(a+b)(a-b)$.<br>
      En l'utilisant avec $a=${b}$ et $b=${a}$, on obtient : <br>
      $${b}^2-${a}^2=(${b}+${a})(${b}-${a})=${b + a}\\times ${b - a}=${miseEnEvidence(b ** 2 - a ** 2)}$.`
      this.reponse = b ** 2 - a ** 2
      if (this.versionQcm) {
        this.distracteurs = [
          `$${(a - b) ** 2}$`,
          `$${-b - a}$`,
          `$${-1 * (a - b) ** 2}$`,
        ]
      }
    } else {
      this.question = this.versionQcm
        ? `$${a}^2-${b}^2$ est égal à : `
        : `Calculer $${a}^2-${b}^2$.`
      this.correction = `La forme du calcul fait penser à l'identité remarquable :<br> $a^2-b^2=(a-b)(a+b)$.<br>
      En l'utilisant avec $a=${a}$ et $b=${b}$, on obtient : <br>
      $${a}^2-${b}^2=(${a}-${b})(${a}+${b})=${a - b}\\times ${a + b}=${miseEnEvidence(a ** 2 - b ** 2)}$.`
      this.reponse = a ** 2 - b ** 2
      if (this.versionQcm) {
        this.distracteurs = [
          `$${(a - b) ** 2}$`,
          `$${a + b}$`,
          `$${-1 * (a - b) ** 2}$`,
        ]
      }
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
