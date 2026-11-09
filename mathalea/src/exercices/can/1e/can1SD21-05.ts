import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre = 'Résoudre une équation du second degré'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '04/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Gilles Mora

 */
export const uuid = '7a950'

export const refs = {
  'fr-fr': ['can1SD21-05'],
  'fr-ch': [],
}
export default class ResoudreEquationSecondDegre extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte, texteCorr, a, b, c, d, x1, x2
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      x1 = randint(-5, 5, 0)
      x2 = randint(-5, 5, [0, x1, -x1])
      a = randint(1, 3) * choice([-1, 1])
      b = -a * (x1 + x2)
      c = a * x1 * x2
      d = b * b - 4 * a * c
      while (d > 144) {
        a = randint(1, 5) * choice([-1, 1])
        x1 = randint(-5, 5, 0)
        x2 = randint(-5, 5, [0, x1, -x1])
        b = -a * (x1 + x2)
        c = a * x1 * x2
        d = b * b - 4 * a * c
      }

      texte = `$${reduirePolynomeDegre3(0, a, b, c)}=0$<br>
       Sachant que  $\\Delta=${d}$, donner les solutions de cette équation`
      handleAnswers(this, i, {
        reponse: {
          value: `${Math.min(x1, x2)};${Math.max(x1, x2)}`,
          options: { suiteDeNombres: true },
        },
      })

      if (!this.interactif) {
        texte += '.'
      } else {
        texte += ', séparées par un point-virgule : '
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFullOperations,
        )
        /* texte += 'dans l\'ordre croissant :<br>'
        texte += remplisLesBlancs(this, i, ' %{champ1}  \\text{ et  }  %{champ2} ', KeyboardType.clavierDeBaseAvecFraction)
        handleAnswers(this, i, {
          bareme: (listePoints) => [Math.min(listePoints[0], listePoints[1]), 1],
          champ1: { value: Math.min(x1, x2) },
          champ2: { value: Math.max(x1, x2) }
        }
        ) */
      }
      texteCorr = `$\\Delta>0$ donc l'équation admet deux solutions : $x_1 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$. `
      texteCorr += `<br>$x_1 = \\dfrac{${-b} -\\sqrt{${d}}}{2\\times ${ecritureParentheseSiNegatif(a)}}=${miseEnEvidence(texNombre((-b - Math.sqrt(d)) / (2 * a), 0))}$ et
       $x_2 = \\dfrac{${-b} +\\sqrt{${d}}}{2\\times ${ecritureParentheseSiNegatif(a)}}=${miseEnEvidence(texNombre((-b + Math.sqrt(d)) / (2 * a), 0))}$`
      if (this.questionJamaisPosee(i, a, x1, x2)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    this.canEnonce = texte
  }
}
