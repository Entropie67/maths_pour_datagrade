import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème de monnaie'
export const interactifReady = true

export const uuid = 'c35c9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N62Q13 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: 'pièces' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 1.2 : randint(11, 29, 20) / 10

    this.reponse = texNombre(a * 10, 0)
    this.question = `Combien faut-il de pièces de $10$ centimes pour avoir $${texNombre(a, 2, true)}$ € ? `
    this.correction = `Il faut $10$ pièces de $10$ centimes pour faire $1$ €. <br>
    Il faut donc $${miseEnEvidence(this.reponse)}$ pièces pour faire $${texNombre(a, 2, true)}$ €.`

    this.canReponseACompleter = '$\\ldots$ pièces'
  }
}
