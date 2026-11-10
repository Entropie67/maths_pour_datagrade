import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Déterminer la somme des racines d'une fonction polynôme factorisée"
export const interactifReady = true

export const uuid = 'jeaa7'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a1?: number, b1?: number, a2?: number, b2?: number): void {
    if (a1 == null || b1 == null || a2 == null || b2 == null) {
      a1 = choice([2, 3])
      b1 = a1 * randint(-4, 4, 0)
      a2 = 1
      b2 = randint(-9, 9, 0)
    }

    // Racines : x1 = -b1/a1 et x2 = -b2/a2
    const x1 = new FractionEtendue(-b1, a1)
    const x2 = new FractionEtendue(-b2, a2)
    const somme = x1.sommeFraction(x2).simplifie()

    this.reponse = somme.texFraction
    this.question = `Somme $S$ des racines de : $f(x)=(${reduireAxPlusB(a1, b1)})(${reduireAxPlusB(a2, b2)})$ ?<br>`
    this.correction = `Les racines de $f$ sont les solutions de $(${reduireAxPlusB(a1, b1)})(${reduireAxPlusB(a2, b2)})=0$.<br>
    On reconnaît une équation produit-nul.<br> 
    $${reduireAxPlusB(a1, b1)}=0$  ou $${reduireAxPlusB(a2, b2)}=0$<br>
     $x=${x1.simplifie().texFraction}$ ou $x=${texNombre(x2.valeurDecimale, 0)}$<br>
    
    Ainsi, la somme est $S=${x1.simplifie().texFraction}+${x2.valeurDecimale < 0 ? '(' : ''}${texNombre(x2.valeurDecimale, 0)}${x2.valeurDecimale < 0 ? ')' : ''}=${miseEnEvidence(somme.texFraction)}$`
    if (this.interactif) {
      this.question += '$S=$'
    } else {
      this.question += '$S=\\ldots$'
    }
    this.canEnonce = `Somme $S$ des racines de : $f(x)=(${reduireAxPlusB(a1, b1)})(${reduireAxPlusB(a2, b2)})$ ?`
    this.canReponseACompleter = '$S=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(2, -4, 1, 5)
    else this.enonce()
  }
}
