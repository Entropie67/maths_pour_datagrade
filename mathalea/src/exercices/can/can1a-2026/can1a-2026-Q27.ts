import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'
export const titre =
  "Déterminer les intervalles de croissance ou de décroissance d'une fonction du second degré"
export const interactifReady = true

export const uuid = 'gletu'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q24 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { intervalle: true }
    this.formatChampTexte = KeyboardType.clavierEnsemble
  }

  enonce(a?: number, b?: number, c?: number, typeMono?: string): void {
    if (a == null || b == null || c == null || typeMono == null) {
      a = randint(-10, 10, 0)
      b = randint(-5, 5, 0)
      c = randint(-9, 9, 0)
      typeMono = choice(['croissante', 'décroissante'])
    }

    const alpha = -b // sommet en x = -b (car f(x) = a(x+b)² + c = a(x-(-b))² + c)

    let texteF: string
    if (a === 1) {
      texteF = `(${reduireAxPlusB(1, b)})^2${ecritureAlgebrique(c)}`
    } else if (a === -1) {
      texteF = `-(${reduireAxPlusB(1, b)})^2${ecritureAlgebrique(c)}`
    } else {
      texteF = `${rienSi1(a)}(${reduireAxPlusB(1, b)})^2${ecritureAlgebrique(c)}`
    }

    // Déterminer la bonne réponse
    let bonneReponse: string
    if (typeMono === 'croissante') {
      bonneReponse =
        a > 0 ? `[${alpha}\\,;\\,+\\infty[` : `]-\\infty\\,;\\,${alpha}]`
    } else {
      bonneReponse =
        a > 0 ? `]-\\infty\\,;\\,${alpha}]` : `[${alpha}\\,;\\,+\\infty[`
    }

    this.reponse = bonneReponse
    this.question = `Pour tout réel $x$, on définit : $f(x)=${texteF}$.<br>Donner le plus grand intervalle $I$ sur lequel $f$ est ${typeMono}.<br>`

    if (this.interactif) {
      this.question += '$I=$'
    } else {
      this.question += '$I=\\ldots$'
    }

    const sens = a > 0 ? 'positif' : 'négatif'
    const variation =
      a > 0 ? 'décroissante puis croissante' : 'croissante puis décroissante'
    const parabole = a > 0 ? 'tournée vers le haut' : 'tournée vers le bas'

    if (b > 0) {
      this.correction = `On reconnaît la forme canonique $f(x)=a(x-\\alpha)^2+\\beta$ avec $\\alpha=${alpha}$.<br>`
    } else {
      this.correction = `On reconnaît la forme canonique $f(x)=a(x-\\alpha)^2+\\beta$ avec $\\alpha=${alpha}$.<br>`
    }
    this.correction += `Le coefficient $${a}$ devant la parenthèse est strictement ${sens}, la fonction est donc d'abord ${variation} (parabole «${sp()}${parabole}${sp()}»).<br>
    Ainsi, $f$ est ${typeMono} sur $${miseEnEvidence(bonneReponse)}$.`

    this.canEnonce = `Pour tout réel $x$, on définit : $f(x)=${texteF}$.<br>Donner le plus grand intervalle $I$ sur lequel $f$ est ${typeMono}.`
    this.canReponseACompleter = '$I=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-3, -1, 5, 'croissante')
    else this.enonce()
  }
}
