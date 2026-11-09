import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Calculer une probabilité à partir de la probabilité de l'événement contraire"
export const interactifReady = true

export const uuid = 'cpgry'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ10 extends ExerciceCan {
  enonce(pAuB?: Decimal, pBbar?: Decimal): void {
    if (pAuB == null || pBbar == null) {
      // P(A∪B) = P(A) + P(B) car disjoints
      // P(B) = 1 - P(Bbar)
      // P(A) = P(A∪B) - P(B) = P(A∪B) - 1 + P(Bbar)
      let pA: Decimal
      let pB: Decimal
      do {
        pBbar = new Decimal(randint(1, 8, 5)).div(10)
        pB = new Decimal(1).sub(pBbar)
        pA = new Decimal(randint(1, 4)).div(10)
        pAuB = pA.add(pB)
      } while (pAuB.gte(1) || pA.lte(0))
    }

    const pB = new Decimal(1).sub(pBbar)
    const pA = pAuB.sub(pB)

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = texNombre(pA, 2)

    this.question = `$P(A\\cup B)=${texNombre(pAuB, 1)}$ et $P(\\overline{B})=${texNombre(pBbar, 1)}$.<br>
    Les événements $A$ et $B$ sont disjoints.<br>
  `
    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '$P(A)=$' }
    } else {
      this.question += '$P(A)=\\ldots$'
    }

    this.correction = `Les événements $A$ et $B$ sont disjoints, donc $P(A\\cup B)=P(A)+P(B)$.<br>
    On a $P(B)=1-P(\\overline{B})=1-${texNombre(pBbar, 1)}=${texNombre(pB, 1)}$.<br>
    Donc $P(A)=P(A\\cup B)-P(B)=${texNombre(pAuB, 1)}-${texNombre(pB, 1)}=${miseEnEvidence(texNombre(pA, 2))}$.`

    this.canEnonce = `$P(A\\cup B)=${texNombre(pAuB, 1)}$ et $P(\\overline{B})=${texNombre(pBbar, 1)}$.\\\\
    Les événements $A$ et $B$ sont disjoints.`
    this.canReponseACompleter = '$P(A)=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(new Decimal(0.7), new Decimal(0.6))
    else this.enonce()
  }
}
