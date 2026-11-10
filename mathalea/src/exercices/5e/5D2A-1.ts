import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../lib/outils/embellissements'
export const titre = 'Trouver des probabilités simples'
export const dateDePublication = '01/05/2021'
export const interactifReady = true

/**
 *
 * @author Rémi Angot et Matthieu Devillers
 */
export const uuid = 'a813f'

export const refs = {
  'fr-fr': ['5D2A-1', 'BP2FLUC14', 'BP1AUTO012'],
  'fr-2016': ['5S21-1', 'BP2FLUC14'],
  'fr-ch': ['11LSNO4C-3'],
}
export default class ProbabilitesSimples extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3
    this.nbCols = 2 // Uniquement pour la sortie LaTeX

    // this.sup = 1  // Niveau de difficulté
  }

  nouvelleVersion() {
    for (let i = 0; i < this.nbQuestions;) {
      let texte

      const pG = randint(20, 60) // pG est un pourcentage
      const pN = randint(10, 100 - pG - 10)
      // const pP = 100 - pG - pN
      const sport = choice([
        'hand-ball',
        'football',
        'rugby',
        'basket',
        'volley-ball',
        'water-polo',
        'baseball',
      ])
      texte = `Lors d'un match de ${sport}, l'équipe qui reçoit un adversaire a une probabilité de $${texNombre(pG / 100)}$ de gagner son match`
      texte += ` et $${texNombre(pN / 100)}$ de faire un match nul.<br><br>`
      const reponse1 = texNombre((pG + pN) / 100)
      const reponse2 = texNombre(1 - (pG + pN) / 100)

      texte += `${addMultiMathfield(this, i, {
        dataTemplate: `a) Quelle est la probabilité, pour cette équipe, de ne pas perdre le match ? %{champ1}<br>
        b) Quelle est la probabilité, pour cette équipe, de perdre le match ? %{champ2}`,
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierNumbers },
          champ2: { keyboard: KeyboardType.clavierNumbers },
        },
      })}`

      let correction1 = `${numAlpha(0)} Ne pas perdre un match, c'est, soit le gagner, soit faire un match nul. La probabilité est donc : <br> <br>`
      correction1 += `P(«${sp(1)}Ne pas perdre le match${sp(1)}») $=$ P(«${sp(1)}Gagner le match${sp(1)}») + P(«${sp(1)}Match nul${sp(1)}») <br>`
      correction1 += `P(«${sp(1)}Ne pas perdre le match${sp(1)}») $= ${texNombre(pG / 100)} + ${texNombre(pN / 100)}$ <br> `

      correction1 += `P(«${sp(1)}Ne pas perdre le match${sp(1)}») $= ${miseEnEvidence(`${reponse1}`)}$<br>`

      correction1 += `<br><br>${numAlpha(1)} L'évènement «${sp(1)}Perdre le match${sp(1)}» est l'évènement contraire de «${sp(1)}Ne pas perdre le match${sp(1)}». On peut donc affirmer que : <br> <br>`
      correction1 += `P(«${sp(1)}Perdre le match${sp(1)}») $+$ P(«${sp(1)}Ne pas perdre le match${sp(1)}») $= 1$ <br>`
      correction1 += `P(«${sp(1)}Perdre le match${sp(1)}») $=1-$ P(«${sp(1)}Ne pas perdre le match${sp(1)}»)<br>`
      correction1 += `P(«${sp(1)}Perdre le match${sp(1)}») $=1-${texNombre((pG + pN) / 100)}$<br>`

      correction1 += `P(«${sp(1)}Perdre le match${sp(1)}») $=${miseEnEvidence(`${reponse2}`)}$<br>`
      if (this.questionJamaisPosee(i, pG)) {
        handleAnswers(
          this,
          i,
          {
            champ1: { value: reponse1 },
            champ2: { value: reponse2 },
            bareme: toutAUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction1
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
