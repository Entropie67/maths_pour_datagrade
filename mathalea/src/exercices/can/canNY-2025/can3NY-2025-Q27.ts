import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = ''
export const interactifReady = true

export const uuid = '986cd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class ComparerFractions extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', -5, 5, [0, -1, 1])
    this.reponse = this.quotaRandint('reponse', -9, 9, [-1, 0, 1])
    const b = -a * this.reponse + 2025
    this.question = `Donner la solution de l'équation : <br>$${a}x+${texNombre(b, 0)}=${texNombre(2025, 0)}$.`
    this.correction = `On procède par étapes successives.<br>
        On commence par isoler $${a}x$ dans le membre de gauche en ajoutant
        $${ecritureAlgebrique(-b)}$ dans chacun des membres, puis on divise
        par $${a}$ pour obtenir la solution : <br>
        $\\begin{aligned}
        ${a}x${ecritureAlgebrique(b)}&=${texNombre(2025, 0)}\\\\
       ${a}x&=${texNombre(2025, 0)}${ecritureAlgebrique(-b)}\\\\
       ${a}x&=${texNombre(2025 - b, 0)}\\\\
       x&=\\dfrac{${texNombre(2025 - b, 0)}}{${a}}\\\\
       x&=${this.reponse}
       \\end{aligned}$<br>
       La solution de l'équation $${a}x+${texNombre(b, 0)}=${texNombre(2025, 0)}$ est $${miseEnEvidence(texNombre(this.reponse, 0))}$.
       `
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
