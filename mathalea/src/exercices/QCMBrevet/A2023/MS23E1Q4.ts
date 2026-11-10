import { choice } from '../../../lib/outils/arrayOutils'
import FractionEtendue from '../../../modules/FractionEtendue'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '80f6g'
export const refs = {
  'fr-fr': ['3S2QCM-7', 'BP2FLUC8', 'BP1AUTO008'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Probabilités (septembre 2023 Métropole)'
export const dateDePublication = '05/01/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleSep23Ex1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(
    nbBoules: number,
    facteur: number,
    negation: boolean,
  ): void {
    const boules = Array.from({ length: nbBoules }, (_, i) => i + 1)
    const boulesFav = negation
      ? boules.filter((b) => b % facteur !== 0)
      : boules.filter((b) => b % facteur === 0)
    const nbIssuesFav = boulesFav.length
    const fracReponse = new FractionEtendue(nbIssuesFav, nbBoules)
    const distracteur1 = fracReponse.sommeFraction(
      new FractionEtendue(1, nbBoules),
    )
    const distracteur2 = new FractionEtendue(1, nbBoules)
    this.reponses = [
      `$${fracReponse.texFractionSimplifiee}$`,
      `$${distracteur1.texFraction}$`,
      `$${distracteur2.texFraction}$`,
    ]
    this.enonce = negation
      ? `Dans un sac opaque, on dispose de $${nbBoules}$ boules numérotées de $1$ à $${nbBoules}$. On tire une boule au hasard. Quelle est la probabilité de ne pas obtenir un multiple de $${facteur}$ ?`
      : `Dans un sac opaque, on dispose de $${nbBoules}$ boules numérotées de $1$ à $${nbBoules}$. On tire une boule au hasard. Quelle est la probabilité d'obtenir un multiple de $${facteur}$ ?`
    this.correction = `Les issues favorables sont les boules numérotées $${boulesFav.join('$, $')}$.<br>
    Il y a $${nbBoules}$ issues possibles, la probabilité de l'événement est donc $${
      fracReponse.estIrreductible
        ? fracReponse.texFractionSimplifiee
        : `${fracReponse.texFraction}${fracReponse.texSimplificationAvecEtapes()}`
    }$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(8, 2, false)
  }

  versionAleatoire = () => {
    const n = 3
    do {
      const a = choice([8, 10, 12, 15, 9])
      const b = choice([2, 3, 4])
      const c = choice([true, false])

      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
