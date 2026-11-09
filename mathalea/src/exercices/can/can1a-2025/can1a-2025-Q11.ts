import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Transformer des heures décimales'
export const interactifReady = true

export const uuid = 'cd32b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q11 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'min' }
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const h = this.canOfficielle ? 2 : randint(1, 9)
    const m = this.canOfficielle ? 0.7 : randint(1, 9) / 10
    this.reponse = texNombre(m * 60, 0)
    this.question = `$${texNombre(h + m, 1)}$  h $ = ${h}$ h`
    if (!this.interactif) {
      this.question += ' $\\ldots$ min'
    }
    this.correction = `$${texNombre(h + m, 1)} = ${h} \\text{ h } + ${texNombre(m, 1)}\\times 60 \\text{ min } = ${h} \\text{ h }  ${miseEnEvidence(this.reponse)} \\text{ min}$`
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `$${texNombre(h + m, 1)}$  h $ = ${h}$ h $\\ldots$ min`
  }
}
