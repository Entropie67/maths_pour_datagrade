import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
export const titre = 'Déterminer la valeur de $p$ dans une fonction affine'
export const interactifReady = true

export const dateDePublication = '30/11/2024'
export const uuid = '25d1f'
export const refs = {
  'fr-fr': ['can2F20-03'],
  'fr-ch': ['1mF2-20'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class TrouverpFonctionAffine extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const nom = ['f', 'g', 'h']
    const nomF = choice(nom)
    const a = this.quotaRandint('a', -10, 10, [0])
    const b = this.quotaRandint('b', -10, 10, [0])
    const m = this.quotaRandint('m', -10, 10, [0])
    const p = b - m * a
    this.reponse = texNombre(p, 0)
    this.question = `$${nomF}$ est la fonction définie par ${context.isDiaporama ? '<br>' : ''} $${nomF}(x)=${rienSi1(m)}x+p$.<br>
    Déterminer la valeur de $p$ sachant que ${context.isDiaporama ? '<br>' : ''} $${nomF}(${a})=${b}$.`
    this.correction = `Comme $${nomF}(${a})=${b}$, alors : <br>
    $\\begin{aligned}
    ${rienSi1(m)}${m === 1 ? '' : '\\times'} ${ecritureParentheseSiNegatif(a)}+p&=${b}\\\\
    ${m * a}+p&=${b}\\\\
    p&=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`
    if (this.interactif) {
      this.question += '<br>$p=$'
    }

    this.canReponseACompleter = '$p=\\ldots$'
  }
}
