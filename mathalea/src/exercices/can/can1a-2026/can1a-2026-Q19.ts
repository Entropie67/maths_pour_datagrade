import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Calculer la probabilité d'un événement dans un cas d'événements indépendants"
export const interactifReady = true

export const uuid = 'sy6zk'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q19 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(pA?: Decimal, pB?: Decimal): void {
    if (pA == null || pB == null) {
      pA = new Decimal(randint(1, 9)).div(10)
      pB = new Decimal(randint(1, 9)).div(10)
    }

    const pAinterB = pA.mul(pB)

    this.reponse = texNombre(pA, 2)
    this.question = `Si $P(A\\cap B)=${texNombre(pAinterB, 2)}$ et $P(B)=${texNombre(pB, 1)}$ avec $A$ et $B$ deux événements indépendants, alors :<br>`

    this.correction = `Comme $A$ et $B$ sont des événements indépendants, $P(A\\cap B)=P(A)\\times P(B)$.<br>
    On cherche donc $P(A)$ tel que $P(A)\\times ${texNombre(pB, 1)}=${texNombre(pAinterB, 2)}$.<br>
    $P(A)=\\dfrac{${texNombre(pAinterB, 2)}}{${texNombre(pB, 1)}}=${miseEnEvidence(texNombre(pA, 2))}$`

    if (this.interactif) {
      this.question += '$P(A)=$'
    } else {
      this.question += '$P(A)=\\ldots$'
    }
    this.canEnonce = `Si $P(A\\cap B)=${texNombre(pAinterB, 2)}$ et $P(B)=${texNombre(pB, 1)}$ avec $A$ et $B$ deux événements indépendants, alors :`
    this.canReponseACompleter = '$P(A)=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(new Decimal(0.2), new Decimal(0.9))
    else this.enonce()
  }
}
