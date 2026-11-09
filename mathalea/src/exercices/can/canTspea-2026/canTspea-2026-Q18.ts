import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

import { choice } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
export const titre = 'Résoudre une inéquation du second degré'
export const interactifReady = true

export const uuid = 'j3wun'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ18 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { intervalle: true }
    this.formatChampTexte = KeyboardType.clavierEnsemble
  }

  enonce(a?: number, x1?: number, x2?: number, choix?: boolean): void {
    if (a == null || x1 == null || x2 == null) {
      a = randint(-5, -2)
      x1 = randint(-9, 9, 0)
      x2 = randint(-9, 9, [0, x1])
      choix = choice([true, false])
    }

    const petit = Math.min(x1, x2)
    const grand = Math.max(x1, x2)

    this.reponse = choix
      ? `]-\\infty ; ${petit}] \\cup [${grand} ; +\\infty[`
      : `[${petit};${grand}]`
    this.optionsChampTexte = {
      texteAvant: '<br>',
      texteApres:
        '<br>(Tous les nombres dans un intervalle ou une suite de nombres doivent être séparés exclusivement par un point-virgule.)',
    }

    this.question = `L'ensemble des solutions sur $\\mathbb{R}$ de l'inéquation $${a}(${reduireAxPlusB(1, -x1)})(${x2}-x)${choix ? '\\geqslant' : '\\leqslant'} 0$ est : `
    if (!this.interactif) {
      this.question += '$\\ldots$'
    }

    this.correction = `On écrit l'expression sous la forme $a(x-x_1)(x-x_2)$.<br>
    $${a}(${reduireAxPlusB(1, -x1)})(${x2}-x)= ${a}(${reduireAxPlusB(1, -x1)})(x-${x2})\\times(-1)= ${-a}(${reduireAxPlusB(1, -x1)})(x-${x2})$.<br>
    Les racines sont : $${x1}$ et $${x2}$.<br>
    Un polynôme du second degré est du signe de $a$ sauf entre ses racines. Ici $a>0$, donc le polynôme est négatif entre les racines, et positif à l'extérieur. <br>
    L'ensemble des solutions est ${choix ? `$${miseEnEvidence(`]-\\infty\\,;\\,${petit}] \\cup [${grand}\\,;+\\infty[`)}$` : `$${miseEnEvidence(`[${petit}\\,;\\,${grand}]`)}$`}.`

    this.canEnonce = `L'ensemble des solutions sur $\\mathbb{R}$ de l'inéquation $${a}(${reduireAxPlusB(1, -x1)})(${x2}-x)${choix ? '\\geqslant' : '\\leqslant'} 0$ est :`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-2, -4, 7, true)
    else this.enonce()
  }
}
