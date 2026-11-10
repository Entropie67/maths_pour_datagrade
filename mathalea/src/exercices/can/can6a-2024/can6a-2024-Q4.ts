import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec une proportionnalité'
export const interactifReady = true

export const uuid = '4b9d2'
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
    this.optionsChampTexte = { texteApres: 'g' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const unit = this.canOfficielle ? 4 : this.quotaRandint('unit', 3, 6)
    const a = this.canOfficielle ? 2 : this.quotaRandint('a', 2, 4)
    const b = this.canOfficielle ? 6 : this.quotaRandint('b', 5, 7)

    this.reponse = b * unit
    this.question = `$${a}$ carreaux de chocolats pèsent $${a * unit}$ g.<br>
      $${b}$ carreaux de chocolat pèsent  `
    this.correction = `$${a}$ carreaux de chocolats pèsent $${a * unit}$ g,  donc $1$ carreau pèse $${unit}$ g.<br>
      Donc $${b}$ carreaux pèsent  $${b}\\times${unit}$ g $=${miseEnEvidence(texNombre(this.reponse, 0))}$ g.`

    if (!this.interactif) {
      this.question += '$\\ldots$ g.'
    }
    this.canEnonce = `$${a}$ carreaux de chocolats pèsent $${a * unit}$ g.`
    this.canReponseACompleter = `$${b}$ carreaux de chocolat pèsent $\\ldots$ g.`
  }
}
