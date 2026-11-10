import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Calculer la probabilité d'un événement en tirant une boule numérotée"
export const dateDePublication = '27/10/2026'
export const interactifReady = true

export const uuid = 'd2078'

export const refs = {
  'fr-fr': ['2P10-9', '1A-P03-5'],
  'fr-ch': ['11LSNO4C-6'],
}

/**
 * @author Stéphane Guyon
 */

function estPremier(n: number): boolean {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false
  }
  return true
}

/** Liste des entiers de 1 à n vérifiant un prédicat. */
function filtre(n: number, predicat: (k: number) => boolean): number[] {
  return Array.from({ length: n }, (_, k) => k + 1).filter(predicat)
}

export default class ProbaBouleNumerotee extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nbBoules = choice([20, 25, 30, 36, 40, 45, 50])
    this.consigne = `Une urne contient $${nbBoules}$ boules indiscernables au toucher, numérotées de $1$ à $${nbBoules}$. On tire une boule au hasard et on note son numéro.`

    // Les scénarios alternent d'une question à l'autre
    const types = combinaisonListes([1, 2, 3], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let description: string
      let favorables: number[]
      let cle: number
      let justification: string

      switch (types[i]) {
        case 1:
          description = 'obtenir un nombre premier'
          favorables = filtre(nbBoules, estPremier)
          cle = 0
          justification = `Les nombres premiers compris entre $1$ et $${nbBoules}$ sont${sp()}: $${favorables.join(
            ';' + sp(),
          )}$.`
          break
        case 2: {
          const k = randint(3, 7)
          description = `obtenir un multiple de $${k}$`
          favorables = filtre(nbBoules, (n) => n % k === 0)
          cle = k
          justification = `Les multiples de $${k}$ compris entre $1$ et $${nbBoules}$ sont${sp()}: $${favorables.join(
            ';' + sp(),
          )}$.`
          break
        }
        default: {
          const chiffre = randint(1, 5)
          description = `obtenir un nombre qui contient le chiffre $${chiffre}$`
          favorables = filtre(nbBoules, (n) =>
            String(n).includes(String(chiffre)),
          )
          cle = 10 + chiffre
          justification = `Les nombres qui contiennent le chiffre $${chiffre}$ sont${sp()}: $${favorables.join(
            ';' + sp(),
          )}$.`
          break
        }
      }

      if (favorables.length === 0 || favorables.length === nbBoules) continue
      if (!this.questionJamaisPosee(i, types[i], cle)) continue

      const fraction = new FractionEtendue(favorables.length, nbBoules)
      const simplifiee = fraction.simplifie()
      let texte = `Calculer la probabilité $p$ d'${description}.`
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
          { texteAvant: '<br>$p=$' },
        )
      }
      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: simplifiee.texFraction,
            options: { fractionEgale: true },
          },
        },
        { formatInteractif: 'mathlive' },
      )

      const calcul =
        fraction.texFraction === simplifiee.texFraction
          ? miseEnEvidence(fraction.texFraction)
          : `${fraction.texFraction}=${miseEnEvidence(simplifiee.texFraction)}`
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = `${justification}<br>
        Il y a $${favorables.length}$ cas favorables sur $${nbBoules}$ cas possibles, les boules étant indiscernables au toucher (situation d'équiprobabilité).<br>
        $p=${calcul}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
