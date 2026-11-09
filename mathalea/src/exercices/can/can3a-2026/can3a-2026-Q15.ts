import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une expression avec un carré'
export const interactifReady = true

export const uuid = '1pwa0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q15 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, x?: number) {
    if (a == null || x == null) {
      // Version aléatoire
      a = randint(1, 10)
      x = randint(-10, -2)
    }

    this.reponse = x ** 2 + a

    // Construction de l'expression
    const expression = `x^2${ecritureAlgebrique(a)}`

    this.question = `Calcule $${expression}$ pour $x=${x}$.`

    if (this.interactif) {
      this.question += '<br>'
    }

    this.correction = `Pour $x=${x}$, on obtient : $(${x})^2+${a}=${x ** 2}+${a}=${miseEnEvidence(this.reponse)}$.<br>
Pour $x=${x}$, $${expression}$ prend la valeur $${miseEnEvidence(this.reponse)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, -3)
    else this.enonce()
  }
}
