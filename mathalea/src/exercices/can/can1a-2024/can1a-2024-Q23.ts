import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'

export const titre = 'Résoudre une inéquation'
export const interactifReady = true

export const uuid = 'f0f67'
/**
 * @author Gilles Mora
 */
export default class solutionInequation extends ExerciceSimple {
  constructor() {
    super()
    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
  }

  nouvelleVersion() {
    let reponse
    let b1: number
    let b2: number
    let choix: string
    if (this.canOfficielle) {
      b1 = 8
      b2 = -6
      reponse = ']-\\infty;-8[\\cup]6;+\\infty['
      this.question = `Solutions de $(${reduireAxPlusB(1, b1)})(${reduireAxPlusB(1, b2)})  >0$<br>`
      this.correction = `$(${reduireAxPlusB(1, b1)})(${reduireAxPlusB(1, b2)})$ est l'expression factorisée d'une fonction polynôme du second degré de la forme $a(x-x_1)(x-x_2)$.<br>
    Les racines sont $x_1=${-b1}$ et $x_2=${-b2}$. <br>
    Le polynôme est du signe de $a=1$ (donc positif) sauf entre ses racines.<br>
    L'ensemble solution est donc :  $${miseEnEvidence(reponse)}$.   
     `
    } else {
      b1 = randint(-9, 9, 0)
      b2 = randint(-9, 9, [0, b1])
      choix = choice(['>', '<'])
      if (choix === '>') {
        reponse =
          -b1 > -b2
            ? `]-\\infty;${-b2}[\\cup]${-b1};+\\infty[`
            : `]-\\infty;${-b1}[\\cup]${-b2};+\\infty[`
      } else {
        reponse = -b1 > -b2 ? `]${-b2}\\,;\\,${-b1}[` : `]${-b1}\\,;\\,${-b2}[`
      }
      this.question = `Solutions de $(${reduireAxPlusB(1, b1)})(${reduireAxPlusB(1, b2)})  ${choix} 0$<br>`
      this.correction = `$(${reduireAxPlusB(1, b1)})(${reduireAxPlusB(1, b2)})$ est l'expression factorisée d'une fonction polynôme du second degré de la forme $a(x-x_1)(x-x_2)$.<br>
    Les racines sont $x_1=${-b1}$ et $x_2=${-b2}$. <br>
    Le polynôme est du signe de $a=1$ (donc positif) sauf entre ses racines.<br>
    L'ensemble solution est donc :  $${miseEnEvidence(reponse)}$.   
     `
    }
    this.reponse = {
      reponse: {
        value: reponse,
        options: { intervalle: true },
      },
    }
  }
}
