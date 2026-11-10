import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Convertir des heures en heures/minutes'
export const interactifReady = true

export const uuid = '565f3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q27 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$ ' }
    this.formatInteractif = 'fillInTheBlank'
  }

  nouvelleVersion() {
    const h = this.canOfficielle ? 2 : randint(1, 2)
    const min = this.canOfficielle ? 30 : randint(1, 5) * 10
    this.correction = `Comme $1$ h $=60$ min, $${h}$ h $=${h}\\times 60 $ min $=${texNombre(h * 60, 0)}$ min.<br>
    $${texNombre(h * 60 + min, 0)}$ min $=${miseEnEvidence(h)}$ h $${miseEnEvidence(min)}$ min.`
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: h },
      champ2: { value: min },
    }
    this.consigne = 'Complète.'
    this.question = `${h * 60 + min}\\text{ min  }= ~%{champ1} ~\\text{h}~%{champ2}~\\text{min}`
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${texNombre(h * 60 + min, 0)}$ min $=\\ldots$ h $\\ldots$ min `
  }
}
