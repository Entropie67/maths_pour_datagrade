import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '228b5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1NO4F-5', '9R2NO4F-5', '9R3NO4F-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Donner la valeur décimale d'une fraction"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ1FMns2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(n: number, d: number, dist: number[]): void {
    const fmt = (x: number) => `$${texNombre(x)}$`

    this.enonce = `À quel nombre décimal le nombre $\\dfrac{${n}}{${d}}$ est-il égal ?`

    if (d === 5) {
      this.correction = `On peut transformer la fraction pour obtenir un dénominateur égal à $10$ :<br>`
      this.correction += `$\\dfrac{${n}}{5}=\\dfrac{${2 * n}}{10}=${miseEnEvidence(texNombre(n / d))}$.`
    } else {
      // Pour d === 4, on donne directement la réponse sans étape intermédiaire
      this.correction = `$\\dfrac{${n}}{4}=${miseEnEvidence(texNombre(n / d))}$.`
    }

    // Correct en premier (le moteur mélange les propositions).
    this.reponses = [fmt(n / d), fmt(dist[0]), fmt(dist[1]), fmt(dist[2])]
  }

  versionOriginale: () => void = () => {
    // 2/5 = 0,4 ; distracteurs officiels : 0,2 ; 0,25 ; 0,5.
    this.appliquerLesValeurs(2, 5, [0.2, 0.25, 0.5])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const donnees: [number, number, number[]][] = [
      [2, 5, [0.2, 0.25, 0.5]], // 0,4
      [1, 5, [0.1, 0.25, 0.5]], // 0,2
      [3, 5, [0.3, 0.5, 0.75]], // 0,6
      [4, 5, [0.4, 0.5, 0.75]], // 0,8
      [1, 4, [0.2, 0.4, 0.5]], // 0,25
      [3, 4, [0.34, 0.5, 0.7]], // 0,75
    ]

    let compteur = 0
    do {
      const [n, d, dist] = choice(donnees)
      this.appliquerLesValeurs(n, d, dist)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () => this.enonce
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
  }
}
