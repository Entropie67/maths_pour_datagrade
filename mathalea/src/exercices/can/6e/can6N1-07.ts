import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Encadrer à la dizaine, centaine'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '16/11/2023' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '26/11/2024'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 */
export const uuid = 'b9582'

export const refs = {
  'fr-fr': ['can6N1-07', '6N1A-flash6', '2N14-flash3'],
  'fr-ch': [],
}
export default class EncadrerDizaine extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let question1, correction1, N
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (
        choice([1, 2]) // 1,1,2,3,4,5,6,7,8
      ) {
        case 1:
          {
            const um = randint(0, 1) * 1000
            const c = randint(0, 9) * 100
            const d = randint(1, 9) * 10
            const u = randint(1, 9)
            N = um + c + d + u

            question1 = `Encadrer $${texNombre(N)}$ entre deux dizaines consécutives.`

            if (this.interactif) {
              question1 +=
                '<br>' +
                remplisLesBlancs(
                  this,
                  i,
                  `%{champ1}< ${texNombre(N)} <  %{champ2}`,
                  KeyboardType.clavierDeBase,
                )
            }

            correction1 = `$${miseEnEvidence(`${texNombre(um + c + d)}`)} < ${texNombre(N)}< ${miseEnEvidence(`${texNombre(um + c + d + 10)}`)}$ `
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: `${um + c + d}` },
              champ2: { value: `${um + c + d + 10}` },
            })
            this.canEnonce = question1
            this.canReponseACompleter = `$\\ldots < ${texNombre(N)}< \\ldots$`
          }
          break

        case 2:
        default:
          {
            const um = randint(0, 9) * 1000
            const c = randint(1, 9) * 100
            const d = randint(1, 9) * 10
            const u = randint(0, 9)
            N = um + c + d + u

            question1 = `Encadrer $${texNombre(N)}$ entre deux centaines consécutives.`

            if (this.interactif) {
              question1 +=
                '<br>' +
                remplisLesBlancs(
                  this,
                  i,
                  `%{champ1}< ${texNombre(N)} <  %{champ2}`,
                  KeyboardType.clavierDeBase,
                )
            }
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: `${um + c}` },
              champ2: { value: `${um + c + 100}` },
            })
            correction1 = `$${miseEnEvidence(`${texNombre(um + c)}`)} < ${texNombre(N)}< ${miseEnEvidence(`${texNombre(um + c + 100)}`)}$ `
            this.canEnonce = question1
            this.canReponseACompleter = `$\\ldots < ${texNombre(N)}< \\ldots$`
          }
          break
      }

      if (this.questionJamaisPosee(i, String(N))) {
        this.listeQuestions[i] = question1
        this.listeCorrections[i] = correction1
        this.listeCanEnonces[i] = this.canEnonce
        this.listeCanReponsesACompleter[i] = this.canReponseACompleter
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
