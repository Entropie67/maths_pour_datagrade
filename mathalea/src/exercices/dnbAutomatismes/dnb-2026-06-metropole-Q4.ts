import { choice } from '../../lib/outils/arrayOutils'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'b7773'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une probabilité'
export const dateDePublication = '12/08/2026'

/**
 * DNB Métropole juin 2026 - Question 4
 * Calculer une probabilité
 * @author Jean-Claude Lhote
 */
export default class AutoQ4Metropole2026 extends ExerciceQcmA {
  private appliquerLesValeurs(
    r: number,
    b: number,
    v: number,
    couleur: 'bleue' | 'rouge' | 'verte',
  ): void {
    this.enonce = `Un sac contient $${r}$ boules rouges, $${b}$ boules bleues et $${v}$ boules vertes.<br>
On tire au hasard une boule dans le sac et on note sa couleur.
Sachant que toutes les boules ont la même probabilité d’être choisies, quelle est la probabilité d’obtenir
une boule ${couleur} ?`
    const total = r + b + v
    const num = couleur === 'rouge' ? r : couleur === 'bleue' ? b : v
    const distracteurDen1 =
      couleur === 'rouge' ? b + v : couleur === 'bleue' ? v + r : r + b

    this.reponses = [
      `$\\dfrac{${num}}{${total}}$`,
      `$\\dfrac{${num}}{${distracteurDen1}}$`,
      1 / num === num / total
        ? `$\\dfrac{${num}}{${distracteurDen1}}$` // On met ça et la question sera recalée à cause de la présence de doublon
        : `$\\dfrac{1}{${num}}$`,
      `$\\dfrac{1}{3}$`,
    ]

    this.correction = ``
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(10, 4, 6, 'bleue')
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    do {
      const r = randint(4, 8)
      const v = randint(4, 8, r)
      const b = randint(4, 8, [r, v])
      const couleur = choice(['rouge', 'verte', 'bleue'])
      const num = couleur === 'rouge' ? r : couleur === 'bleue' ? b : v
      const total = r + b + v
      const distracteurDen1 =
        couleur === 'rouge' ? b + v : couleur === 'bleue' ? v + r : r + b
      if (
        num / total === 1 / 3 ||
        num / distracteurDen1 === 1 / 3 ||
        1 / num === 1 / 3 ||
        1 / num === num / total ||
        1 / num === num / distracteurDen1
      ) {
        this.reponses = []
        continue
      }
      this.appliquerLesValeurs(r, b, v, couleur as 'bleue' | 'rouge' | 'verte')
    } while (this.reponses.length !== 4)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
