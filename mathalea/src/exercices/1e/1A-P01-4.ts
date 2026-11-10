import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Trouver les valeurs d’un paramètre pour qu’un nombre soit une probabilité'
export const dateDePublication = '23/10/2026'
export const interactifReady = true

export const uuid = '987e0'
export const refs = {
  'fr-fr': ['1A-P01-4'],
  'fr-ch': [],
}

/**
 * Savoir qu'une probabilité est un nombre compris entre 0 et 1 :
 * trouver l'intervalle des valeurs de a pour lesquelles (a + b)/d est une probabilité.
 * @author Arnaud Meistermann
 */
export default class ParametreProbabilite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    this.consigne = ''

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const decalage = randint(-6, 6, 0)
      const denominateur = randint(2, 9)
      const borneInf = -decalage
      const borneSup = denominateur - decalage
      const expression = `\\dfrac{a${ecritureAlgebrique(decalage)}}{${denominateur}}`
      let texte = `Pour quelles valeurs du réel $a$ le nombre $${expression}$ peut-il être une probabilité ?<br>
      Donner la réponse sous la forme d’un intervalle.`
      if (this.interactif) {
        texte += `<br>${ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble)}`
      }
      handleAnswers(this, i, {
        reponse: {
          value: `[${borneInf};${borneSup}]`,
          options: { intervalle: true },
        },
      })
      const correction = `Le nombre $${expression}$ est une probabilité si et seulement s’il est compris entre $0$ et $1$ :<br>
      $\\begin{aligned}
      0\\leqslant ${expression}\\leqslant 1
      &\\iff 0\\leqslant a${ecritureAlgebrique(decalage)}\\leqslant ${denominateur} \\quad\\text{(car } ${denominateur}>0\\text{)}\\\\
      &\\iff ${borneInf}\\leqslant a\\leqslant ${borneSup}.
      \\end{aligned}$<br>
      Les valeurs possibles de $a$ forment l’intervalle $${miseEnEvidence(`[${borneInf}\\,;\\,${borneSup}]`)}$.`

      if (this.questionJamaisPosee(i, decalage, denominateur)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
