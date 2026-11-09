import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer a % de c quand a vaut $100$, $50$, $25$, $10$, $1$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '12/10/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '3b4d6'

export const refs = {
  'fr-fr': ['can3C4-05', '3AutoN05'],
  'fr-ch': [],
}
export default class PrendreUnPourcentage extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.correctionDetailleeDisponible = true
    this.versionQcmDisponible = true
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', [100, 50, 25, 10, 1])
    const c = this.quotaRandint('c', 20, 200)
    const resultat = (a * c) / 100

    this.question = `Déterminer la valeur de $${a}\\,\\%$ de $${c}$.`

    this.correction = `Pour calculer $${a}\\,\\%$ de $${c}$, on calcule $\\dfrac{${a} \\times ${c}}{100} = \\dfrac{${a}}{100} \\times ${c}=${texNombre(a / 100, 2)}\\times ${c} = ${texNombre(resultat, 2)}$.<br>
    Donc $${a}\\,\\%$ de $${c}$ est égal à $${miseEnEvidence(texNombre(resultat, 2))}$.`

    this.reponse = `${texNombre(resultat, 2)}`

    // proposer des distracteurs pour la version QCM
    if (this.versionQcm) {
      // construire une liste de candidats d'erreurs courantes puis filtrer pour éviter la bonne réponse
      const candidates = [
        // erreurs fréquentes
        a * c, // oubli de diviser par 100 (ex : 50% de 20 -> 50*20 = 1000)
        (a * c) / 10, // division par 10 au lieu de 100 (décalage de la virgule)
        (a * c) / 1000, // erreur de position de la virgule
        ((100 - a) * c) / 100, // valeur complémentaire (100-a)% de c
        (100 * c) / a, // inversion (on calcule c en pourcentage de a)
        Math.floor(resultat), // arrondi inférieur
        Math.ceil(resultat), // arrondi supérieur
        Math.max(1, Math.round(resultat) - 1), // proche inférieur
        Math.round(resultat) + 1, // proche supérieur
      ]

      // filtrer, dédupliquer et retirer la bonne réponse
      const uniq = Array.from(
        new Set(candidates.filter((n) => n > 0 && n !== resultat)),
      )

      const picked = shuffle(uniq).slice(0, 4)

      this.distracteurs = picked.map((n) => `$${texNombre(n, 2)}$`)
    }
  }
}
