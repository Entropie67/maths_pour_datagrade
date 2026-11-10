import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Écrire un nombre à partir des dizaines ou des centaines'
export const interactifReady = true

export const uuid = '2264e'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 2500
      this.question = 'Écris le nombre égal à $25$ centaines. '
      this.correction = `$25$ centaines $=25\\times 100=${miseEnEvidence(texNombre(2500))}$`
    } else {
      const choix = this.quotaChoice('choix', [true, false])
      const a = this.quotaRandint('a', 12, 29)
      this.reponse = choix ? a * 100 : a * 10
      this.question = `Écris le nombre égal à $${a}$ ${choix ? 'centaines' : 'dizaines'}. `
      this.correction = `$${a}$ ${choix ? 'centaines' : 'dizaines'} $=${a}\\times ${choix ? '100' : '10'}=${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    }
  }
}
