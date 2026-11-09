import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Compléter une suite'
export const interactifReady = true

export const uuid = 'b0353'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM2Q24 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const pE = this.canOfficielle ? 2.9 : (randint(1, 8) * 10 + 9) / 10
    const k = this.canOfficielle ? 0.3 : randint(2, 4) / 10
    this.reponse = texNombre(pE + k, 1)
    this.question = `Complète la suite de nombres.<br>
       $${texNombre(pE - 2 * k, 1)}$ ${sp(2)} ; ${sp(2)} $${texNombre(pE - k, 1)}$ ${sp(2)} ; ${sp(2)} $${texNombre(pE, 1)}$ ${sp(2)} ;  ${sp(2)} ${this.interactif ? '' : '$\\ldots$'}`
    this.correction = `On obtient un nombre de cette suite en ajoutant $${texNombre(k, 1)}$ au nombre précédent.<br>
       Ainsi, le nombre qui suit est $${texNombre(pE, 1)}+${texNombre(k, 1)}=${miseEnEvidence(texNombre(pE + k, 1))}$.`
    this.canEnonce = 'Complète la suite de nombres.'
    this.canReponseACompleter = `$${texNombre(pE - 2 * k, 1)}$ \\, ;  $${texNombre(pE - k, 1)}$ \\, ;  $${texNombre(pE, 1)}$\\,  ;   $\\ldots$`
  }
}
