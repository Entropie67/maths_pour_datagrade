import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Convertir en litres'
export const interactifReady = true

export const uuid = 'ff7fe'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class convertirLitres extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteApres: 'L' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle
      ? 510
      : choice([
          randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9),
          randint(1, 9) * 10 + randint(1, 9),
        ])
    const reponse = arrondi(a / 1000, 3)
    this.reponse = reponse
    this.question = `$${a}\\text{ cm}^3=$ `
    this.correction = `$1\\text{ cm}^3 = 0,001 \\text{ dm}^3$ et $1\\text{ dm}^3 = 1$ L.<br>
             $${a} \\text{ cm}^3 = ${a}\\times 0,001 \\text{ dm}^3=${miseEnEvidence(`${texNombre(reponse, 3)}`)}$ L.`
    if (!this.interactif) {
      this.question += ' $\\ldots$ L'
    }
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = this.question
  }
}
