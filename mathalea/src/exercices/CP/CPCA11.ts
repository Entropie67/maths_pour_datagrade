import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Ajouter des presque-doubles'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '22/12/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '3ca3a'

export const refs = {
  'fr-fr': ['CPCA11'],
  'fr-ch': [],
}
export default class AjouterPresqueDoubles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = ['Nombre minimum', 1]
    this.sup = 1
    this.besoinFormulaire2Numerique = ['Nombre maximum', 99]
    this.sup2 = 30
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(this.sup, this.sup2)
      const delta = a === 1 ? 1 : choice([-1, 1])
      const b = a + delta
      const reponse = a + b
      const question =
        `$${a}+${b}$` +
        ajouteQuestionMathlive({
          exercice: this,
          question: i,
          reponseParams: { formatInteractif: 'mathalea-mathfield' },
          objetReponse: { reponse: { value: reponse } },
          texteAvant: '$=$',
          typeInteractivite: 'mathlive',
        })
      const correction =
        delta === 1
          ? `$${a}+${b} = ${a}+${a}+1 = ${2 * a}+1 = ${miseEnEvidence(String(reponse))}$`
          : `$${a}+${b} = ${a}+${a}-1 = ${2 * a}-1 = ${miseEnEvidence(String(reponse))}$`

      if (this.questionJamaisPosee(i, a, delta)) {
        this.listeQuestions.push(question)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }
  }
}
