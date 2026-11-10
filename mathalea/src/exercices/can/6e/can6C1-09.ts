import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const dateDePublication = '02/02/2026'
export const titre = 'Multiplier un nombre par $4$ ou $8$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Éric Elter
 */
export const uuid = '5kmb3'

export const refs = {
  'fr-fr': ['can6C1-09', '6N3autoD-7'],
  'fr-ch': ['NR'],
}

export default class NombreFois4Ou8 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = randint(1, 4) * 10 + randint(1, 9, 5)
    this.reponse = 0
    if (this.quotaChoice('multiplicateur', [4, 8]) === 4) {
      this.reponse = a * 4
      this.question = `Calculer $${a}\\times 4$.`
      this.correction = `$${a}\\times 4 = ${miseEnEvidence(this.reponse)}$<br>`
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
    Pour multiplier par $4$, on peut multiplier par $2$ puis encore multiplier par $2$.<br>
    $${a}\\times 4 = ${a}\\times 2 \\times 2 = ${a * 2} \\times 2 = ${this.reponse}$.<br>`,
        bleuMathalea,
      )
    } else {
      this.reponse = a * 8
      this.question = `Calculer $${a}\\times 8$.`
      this.correction = `$${a}\\times 8 = ${miseEnEvidence(this.reponse)}$<br>`
      this.correction += texteEnCouleur(
        `<br> Mentalement : <br>
    Pour multiplier par $8$, on peut multiplier par $2$ puis encore multiplier par $2$ puis encore multiplier par $2$.<br>
    $${a}\\times 8 = ${a}\\times 2 \\times 2 \\times 2 = ${a * 2} \\times 2  \\times 2 = ${a * 2 * 2} \\times 2 = ${this.reponse}$.<br>`,
        bleuMathalea,
      )
    }
  }
}
