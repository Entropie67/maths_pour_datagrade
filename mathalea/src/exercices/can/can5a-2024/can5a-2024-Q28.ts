import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Décomposer une fraction'
export const interactifReady = true

export const uuid = '8bef8'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.spacing = 3
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: FractionEtendue
    if (this.canOfficielle) {
      reponse = new FractionEtendue(2, 7)
      this.question = '$\\dfrac{9}{7}=1+ \\text{?}$ '
      this.correction = `$\\dfrac{9}{7}=\\dfrac{7}{7}+\\dfrac{2}{7}=1+${miseEnEvidence(reponse.texFraction)}$`
    } else {
      const listeFractions = [
        [4, 3, 1, 1, 3],
        [10, 7, 1, 3, 7],
        [12, 7, 1, 5, 7],
        [9, 4, 2, 1, 4],
        [17, 7, 2, 3, 7],
        [16, 3, 5, 1, 3],
        [17, 3, 5, 2, 3],
        [11, 9, 1, 2, 9],
        [8, 7, 1, 1, 7],
        [10, 7, 1, 3, 7],
        [15, 11, 1, 4, 11],
        [13, 7, 1, 6, 7],
        [13, 9, 1, 4, 9],
        [16, 9, 1, 7, 9],
        [18, 7, 2, 4, 7],
        [10, 9, 1, 1, 9],
      ]
      const a = choice(listeFractions)
      const frac1 = new FractionEtendue(a[0], a[1])
      reponse = new FractionEtendue(a[3], a[4])
      this.question = `$${frac1.texFraction}=${Math.floor(a[0] / a[1])} + \\text{?}$  `
      this.correction = `$${frac1.texFraction}=\\dfrac{${a[0] - a[3]}}{${a[1]}}+\\dfrac{${a[3]}}{${a[4]}}=${a[2]}+${miseEnEvidence(reponse.texFraction)}$`
    }
    this.reponse = reponse.texFraction

    this.canReponseACompleter = '? $=\\dfrac{\\ldots}{\\ldots}$'
    if (!this.interactif) {
      this.question += '<br> ? $=\\dfrac{\\ldots}{\\ldots}$'
    } else {
      this.question += '<br>'
      this.optionsChampTexte = { texteAvant: '? $=$' }
    }
  }
}
