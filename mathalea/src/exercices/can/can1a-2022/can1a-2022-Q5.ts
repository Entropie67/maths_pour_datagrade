import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une équation du premier degré'
export const interactifReady = true

export const uuid = '9laai'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q5 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
      fractionEgale: true,
    }
    this.optionsChampTexte = { texteAvant: '<br>$S=\\{$', texteApres: '$\\}$' }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = randint(2, 10)
      b = a + randint(1, 8)
    }

    const f = new FractionEtendue(-b, a)

    this.question = `Résoudre l'équation $${reduireAxPlusB(a, b)}=0$.`
    this.correction = `On se ramène à une équation du type $a\\times x=b$ :<br>
$\\begin{aligned}
${a}x${ecritureAlgebrique(b)}&=0\\\\
${a}x&=${-b}\\\\
x&=${f.texFraction}${f.texSimplificationAvecEtapes()}
\\end{aligned}$<br>
L'équation $${reduireAxPlusB(a, b)}=0$ a pour solution $x=${miseEnEvidence(f.texFractionSimplifiee)}$.`
    this.reponse = f
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 7)
    else this.enonce()
  }
}
