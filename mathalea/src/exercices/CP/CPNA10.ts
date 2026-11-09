import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Ajouter ou soustraire $1$ ou $2$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/12/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '3ca39'

export const refs = {
  'fr-fr': ['CPNA10'],
  'fr-ch': [],
}
export default class AjouterOuSoustraire1ou2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = ['Nombre minimum', 11]
    this.sup = 11
    this.besoinFormulaire2Numerique = ['Nombre maximum', 97]
    this.sup2 = 97
    this.besoinFormulaire3Texte = [
      'Nombres à ajouter',
      'Nombres séparés par des tirets\n1 : Ajouter ou soustraire 1\n2 : Ajouter ou soustraire 2\n3 : Mélange',
    ]
    this.sup3 = '3'
  }

  nouvelleVersion() {
    const deltas = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(this.sup, this.sup2)
      const delta = choice([-1, 1]) * deltas[i]
      const reponse = a + delta
      const question =
        `$${a}${ecritureAlgebrique(delta)}$` +
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
          ? `Le nombre qui suit $${a}$ est $${miseEnEvidence(String(a + 1))}$.`
          : delta === 2
            ? `Le nombre qui suit $${a}$ est $${String(a + 1)}$. Le nombre qui suit $${a + 1}$ est $${miseEnEvidence(
                String(a + 2),
              )}$.`
            : delta === -1
              ? `Le nombre qui précède $${a}$ est $${miseEnEvidence(String(a - 1))}$.`
              : ` Le nombre qui précède $${a}$ est $${String(a - 1)}$. Le nombre qui précède $${a - 1}$ est $${miseEnEvidence(
                  String(a - 2),
                )}$.`

      if (this.questionJamaisPosee(i, a, delta)) {
        this.listeQuestions.push(question)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }
  }
}
