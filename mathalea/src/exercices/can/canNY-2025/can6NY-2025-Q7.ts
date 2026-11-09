import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Compléter une suite'
export const interactifReady = true

export const uuid = '70f3f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CompleterUneSuite extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const k = this.quotaRandint('k', 3, 9)
    const nbre2 = 2025 + k
    const nbre3 = nbre2 + k
    this.reponse = nbre3 + k
    this.question = `Compléter la suite : <br>
   $${texNombre(2025)}$${sp(3)}; ${sp(3)}$${texNombre(nbre2)}$ ${sp(3)}; ${sp(3)}$${texNombre(nbre3)}$ ${sp(3)}; ${sp(3)}`
    this.correction = `$${texNombre(2025)}+${k}=${texNombre(nbre2)}$ et  $${texNombre(nbre2)}+${k}=${texNombre(nbre3)}$, donc le nombre suivant est  $${texNombre(nbre3)}+${k}=${miseEnEvidence(texNombre(this.reponse, 0))}$.`
    if (!this.interactif) {
      this.question += `${sp(3)}$\\ldots$`
    }
    this.canEnonce = 'Compléter la suite.'
    this.canReponseACompleter = `$${texNombre(2025)}$ ; $${texNombre(nbre2)}$ ; $${texNombre(nbre3)}$ ; $\\ldots$`
  }
}
