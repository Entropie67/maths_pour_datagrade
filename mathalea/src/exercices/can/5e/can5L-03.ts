import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'

export const titre = 'Trouver deux entiers consécutifs'
export const interactifReady = true

export const dateDePublication = '18/09/2026'
export const uuid = 'f4a18'
export const refs = {
  'fr-fr': ['can5L-03'],
  'fr-ch': [],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres.
 * @author Gilles Mora
 */
export default class EntiersConsecutifs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const n1 = randint(8, 20)
      const n2 = n1 + 1
      let texte = `La somme de deux entiers consécutifs est $${n1 + n2}$.<br>
    Quels sont ces deux entiers ? `
      if (this.interactif) {
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            i,
            '\\text{ Le plus petit est } %{champ1} \\text{ et le plus grand est } %{champ2}.',
            KeyboardType.clavierDeBase,
          )
      }
      this.correction = `Si on retranche $1$ au plus grand des deux nombres, il devient égal au plus petit et la somme est diminuée de $1$.<br>
Ainsi le double du plus petit nombre est $${n1 + n2 - 1}$.<br>
          $${n1 + n2 - 1}\\div 2=${n1}$. <br>
          Le plus petit nombre est $${miseEnEvidence(texNombre(n1, 0))}$ et le plus grand est $${miseEnEvidence(texNombre(n2, 0))}$.
          `

      handleAnswers(this, i, {
        bareme: (listePoints) => [Math.min(listePoints[0], listePoints[1]), 1],
        champ1: { value: `${n1}` },
        champ2: { value: `${n2}` },
      })
      this.canEnonce = texte
      this.canReponseACompleter = '$\\ldots$ et $\\ldots$'
      if (this.questionJamaisPosee(i, n1, n2)) {
        this.listeCorrections[i] = this.correction
        this.listeQuestions[i] = texte
        this.listeCanEnonces[i] = this.canEnonce
        this.listeCanReponsesACompleter[i] = this.canReponseACompleter
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
