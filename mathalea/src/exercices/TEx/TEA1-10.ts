import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer l'ensemble des diviseurs d'un entier"
export const dateDePublication = '23/09/2026'
export const uuid = 'dc62f'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TEA1-10'],
  'fr-ch': [],
}

const entiersComposesInferieursA100 = Array.from(
  { length: 96 },
  (_, indice) => indice + 4,
).filter((entier) => listeDesDiviseurs(entier).length > 2)

/**
 * Déterminer dans Z tous les diviseurs d'un entier composé inférieur à 100.
 * @author Stéphane Guyon
 */
export default class DiviseursRelatifs extends Exercice {
  constructor() {
    super()
    this.consigne =
      "Déterminer dans $\\mathbb Z$ l'ensemble des diviseurs de chacun des entiers suivants."
    this.nbQuestions = 4
  }

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const entier = choice(entiersComposesInferieursA100)
      const diviseursPositifs = listeDesDiviseurs(entier)
      const diviseursRelatifs = [
        ...diviseursPositifs.map((diviseur) => -diviseur).reverse(),
        ...diviseursPositifs,
      ]
      const reponse = `\\{${diviseursRelatifs.join(';')}\\}`

      if (this.questionJamaisPosee(i, entier)) {
        this.listeQuestions[i] =
          `$D_{${entier}}=$` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble)
        this.listeCorrections[i] =
          `Les diviseurs positifs de $${entier}$ sont $${diviseursPositifs.join('\\,;\\,')}$. ` +
          `Si $d$ divise $${entier}$, alors $-d$ divise aussi $${entier}$. ` +
          `Ainsi, $D_{${entier}}=${miseEnEvidence(reponse)}$.`

        handleAnswers(this, i, {
          reponse: { value: reponse, options: { ensembleDeNombres: true } },
        })
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
