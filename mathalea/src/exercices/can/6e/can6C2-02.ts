import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Ajouter $10n + 9$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '5b591'

export const refs = {
  'fr-fr': ['can6C2-02', 'CM2N4J-flash1'],
  'fr-ch': [],
}

export default class Ajoute10NPlus9 extends ExerciceSimple {
  constructor() {
    super()
    this.consigne = `Calculer${sp()}:`
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 3, 9)
    const b = this.quotaRandint('b', 2, 8)
    const c = this.quotaRandint('c', 1, 5)
    this.reponse = a * 10 + b + c * 10 + 9
    this.question = `$${texNombre(a * 10 + b, 0)} + ${texNombre(c * 10 + 9, 0)}$`

    // `${this.question} \\dots \\dots`
    this.correction = `$${texNombre(a * 10 + b, 0)} + ${texNombre(c * 10 + 9, 0)}= ${miseEnEvidence(texNombre(this.reponse, 0))}$<br>`
    this.correction += texteEnCouleur(
      `<br> Mentalement${sp()}: <br>
   Pour ajouter $${c * 10 + 9}$, on peut ajouter $${(c + 1) * 10}$ puis retrancher $1$.<br>
   Ainsi,  $${texNombre(a * 10 + b, 0)} + ${texNombre(c * 10 + 9, 0)}=(${texNombre(a * 10 + b, 0)}+${texNombre((c + 1) * 10, 0)}) - 1 =${texNombre(a * 10 + b + (c + 1) * 10, 0)} - 1=${texNombre(this.reponse, 0)}$.
    `,
      bleuMathalea,
    )
  }
}
