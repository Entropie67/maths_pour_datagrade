import { tableauSignesFonction } from '../../../lib/mathFonctions/etudeFonction'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { abs } from '../../../lib/outils/nombres'
import type FractionEtendue from '../../../modules/FractionEtendue'
export const titre =
  'Retrouver un polynôme du second degré à partir de son tableau de signes'
export const interactifReady = true

export const dateDePublication = '08/09/2024'
export const uuid = 'c0f97'
export const refs = {
  'fr-fr': ['can1SD22-01'],
  'fr-ch': ['1mF3-14'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class PolyTableauSignes extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable

    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -9, 9, [0]) // coefficient a
    const b = this.quotaRandint('b', -9, 9) // racine1
    const c = randint(-9, 9, b) // racine2
    const fonction = (x: number | FractionEtendue) => {
      if (typeof x !== 'number') {
        window.notify(
          "La fonction de can1F27 n'accepte que des numbers et a reçu un x qui n'en est pas",
          x,
        )
        return 0
      }
      return a * (x - b) * (x - c)
    }
    const tableau = tableauSignesFonction(fonction, -10, 10, {
      step: 1,
      tolerance: 0.1,
      substituts: [
        { antVal: -10, antTex: '-\\infty' },
        { antVal: 10, antTex: '+\\infty' },
      ],
    })
    this.reponse = `${a}(${reduireAxPlusB(1, -b)})(${reduireAxPlusB(1, -c)})`
    this.question =
      "On donne le tableau de signes d'une fonction polynôme du second degré définie par $f(x)=ax^2+bx+c$. <br>"
    this.question += `<br>${tableau}<br>`
    this.question += `Sachant que $|a|= ${abs(a)}$, donner une expression factorisée de $f(x)$.`
    this.correction = `Le tableau de signes de $f(x)$ indique que la parabole représentant $f$ est tournée vers le ${a > 0 ? 'haut.' : 'bas.'}<br>
    En effet la fonction est d'abord ${a > 0 ? 'positive puis négative, puis positive.' : ' négative puis positive, puis négative.'} <br>
    On en déduit que $a$ est ${a > 0 ? 'positif.' : 'négatif.'} Puisque $|a|= ${abs(a)}$, alors $a=${a}$.<br>
    De plus, le tableau de signes donne les racines de la fonction $f$ : $${Math.min(b, c)}$ et $${Math.max(b, c)}$.<br>
    La forme factorisée d'une fonction polynôme du second degré est donnée par $a(x-x_1)(x-x_2)$ où $x_1$ et $x_2$ sont les racines de $f$.<br>
    Ainsi, $f(x)=$`
    if (b === 0) {
      this.correction += ` $${miseEnEvidence(`${rienSi1(a)}x(${reduireAxPlusB(1, -c)})`)}$`
    }
    if (c === 0) {
      this.correction += ` $${miseEnEvidence(`${rienSi1(a)}x(${reduireAxPlusB(1, -b)})`)}$`
    }
    if (c !== 0 && b !== 0) {
      this.correction += ` $${miseEnEvidence(`${rienSi1(a)}(${reduireAxPlusB(1, -b)})(${reduireAxPlusB(1, -c)})`)}$`
    }

    if (this.interactif) {
      this.question += '<br>$f(x)=$'
    }

    this.canReponseACompleter = '$f(x)=\\ldots$'
  }
}
