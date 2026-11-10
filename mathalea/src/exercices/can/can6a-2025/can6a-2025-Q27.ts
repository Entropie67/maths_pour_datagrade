import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Convertir des fractions d'heure en minutes"
export const interactifReady = true

export const uuid = '61128'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025N6Q27 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$', texteApres: 'min' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 0.5 : choice([0.25, 0.5, 0.75])
    this.reponse = texNombre(a * 60, 0)
    this.question = 'Complète. <br> '
    this.question += `$${texNombre(a, 2)}$ h`
    if (a === 0.5) {
      this.correction = `$${texNombre(a, 2)}$ h $=\\dfrac{1}{2}$ h $=${miseEnEvidence(this.reponse)}$ min`
    } else if (a === 0.25) {
      this.correction = `$${texNombre(a, 2)}$ h $=\\dfrac{1}{4}$ h $=${miseEnEvidence(this.reponse)}$ min`
    } else {
      this.correction = `$${texNombre(a, 2)}$ h $=\\dfrac{3}{4}$ h $=${miseEnEvidence(this.reponse)}$ min`
    }
    if (!this.interactif) {
      this.question += ' $= \\ldots$ min '
    }
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${texNombre(a, 2)}$ h $=\\ldots$ min `
  }
}
