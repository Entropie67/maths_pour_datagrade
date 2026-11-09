import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = 'e56b3'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.formatInteractif = 'fillInTheBlank'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 7 : this.quotaRandint('a', 5, 9)
    const b = this.canOfficielle ? 3 : this.quotaRandint('b', 2, 6)
    const c = this.canOfficielle ? 2 : this.quotaRandint('c', 2, 6)

    this.reponse = texNombre(a + b + c, 0)
    this.consigne = 'Complète. '
    this.question = `${a}+${b}= %{champ1} -${c} `
    this.correction = `Le nombre cherché est donné par : $${a}+${b}+${c}$ soit $${miseEnEvidence(this.reponse)}$.`
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a}+${b}=\\ldots -${c}$ `
  }
}
