import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { tableauVariationsFonction } from '../../../lib/mathFonctions/etudeFonction'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { abs } from '../../../lib/outils/nombres'
import { sp } from '../../../lib/outils/outilString'
import type FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un encadrement avec la fonction carré'
export const interactifReady = true

export const uuid = 'd077f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ13 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? -1 : randint(-9, -2)
    const b = this.canOfficielle ? 4 : randint(1, 9)
    const fonction = (x: number) => x ** 2
    const derivee = (x: number) => 2 * x
    const tolerance = 0.005
    const xMin = a
    const xMax = b
    const tableau = tableauVariationsFonction(
      fonction as (x: number | FractionEtendue) => number,
      derivee as (x: number | FractionEtendue) => number,
      xMin,
      xMax,
      {
        step: 1,
        tolerance,
      },
    )
    if (abs(a) < b) {
      this.reponse = {
        bareme: toutPourUnPoint,
        champ1: { value: 0 },
        champ2: { value: b ** 2 },
      }
    } else {
      this.reponse = {
        bareme: toutPourUnPoint,
        champ1: { value: 0 },
        champ2: { value: a ** 2 },
      }
    }
    this.correction = `$${a}\\leqslant x \\leqslant ${b}$ signifie $x\\in [${a}\\,;\\,${b}]$. <br>
    Puisque la fonction carré est strictement décroissante sur $]-\\infty\\,;\\,0]$ et strictement croissante sur $[0\\,;\\,+\\infty[$, on obtient son tableau de variations
        sur l'intervalle $[${a}\\,;\\,${b}]$${sp()}: <br>${tableau}
        `
    this.correction += `On constate que le minimum de $x^2$ sur $[${a}\\,;\\,${b}]$  est $0$ et son maximum est $${Math.max(abs(a), b) ** 2}$. <br>
On en déduit que si  $${a} \\leqslant x \\leqslant ${b}$ alors, ${sp(2)}$${miseEnEvidence(0)} \\leqslant x^2 \\leqslant ${miseEnEvidence(`${Math.max(abs(a), b) ** 2}`)}$.`
    this.consigne = `Si $${a}\\leqslant x \\leqslant ${b}$ alors${sp()}:`
    this.question = '%{champ1}\\leqslant x^2 \\leqslant %{champ2}'

    this.canEnonce = `Si $${a}\\leqslant x \\leqslant ${b}$ alors `
    this.canReponseACompleter = '$\\ldots \\leqslant x^2 \\leqslant \\ldots$'
  }
}
