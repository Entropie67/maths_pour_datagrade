import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Compléter une suite'
export const interactifReady = true

export const uuid = '22c02'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['autres-13'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q24 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const pE = this.canOfficielle ? 3 : randint(1, 9)
    const k = 0.25
    this.reponse = texNombre(pE + k, 2)
    this.question = `Complète la suite de nombres.<br>
       $${texNombre(pE - 2 * k, 2, true)}$ ${sp(2)} ; ${sp(2)} $${texNombre(pE - k, 2)}$ ${sp(2)} ; ${sp(2)} $${texNombre(pE, 2)}$ ${sp(2)} ;  ${sp(2)} ${this.interactif ? '' : '$\\ldots$'}`
    this.correction = `On obtient un nombre de cette suite en ajoutant $${texNombre(k, 2)}$ au nombre précédent.<br>
       Ainsi, le nombre qui suit est $${texNombre(pE, 2)}+${texNombre(k, 2)}=${miseEnEvidence(texNombre(pE + k, 2))}$.`
    this.canEnonce = 'Complète la suite de nombres.'
    this.canReponseACompleter = `$${texNombre(pE - 2 * k, 2)}$ \\, ;  $${texNombre(pE - k, 2)}$ \\, ;  $${texNombre(pE, 2)}$\\,  ;   $\\ldots$`
  }
}
