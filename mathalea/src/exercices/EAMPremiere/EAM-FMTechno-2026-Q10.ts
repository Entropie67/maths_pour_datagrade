import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '1a8c6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une identité remarquable'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ10FMt2026 extends ExerciceQcmACourt {
  // Distracteurs forçables (distA/B/C) pour reproduire la version officielle.
  private appliquerLesValeurs(
    n1: number,
    c1: number,
    n2: number,
    c2: number,
    distA?: string,
    distB?: string,
    distC?: string,
  ): void {
    const num = n1 * c1 + n2 * c2
    const den = c1 + c2
    const M = num / den

    this.enonce = `Un élève a obtenu la note de $${n1}/20$ à un devoir coefficienté $${c1}$ et la note de $${n2}/20$ à un devoir coefficienté $${c2}$.<br>`
    this.enonce += `La moyenne de l'élève est :`

    this.correction = `La moyenne est pondérée par les coefficients.<br><br>`
    this.correction += `$\\overline{M} = \\dfrac{${n1} \\times ${c1} + ${n2} \\times ${c2}}{${c1} + ${c2}} = \\dfrac{${num}}{${den}} = ${miseEnEvidence(texNombre(M))}$<br>`

    let dist1: string, dist2: string, dist3: string
    if (distA && distB && distC) {
      dist1 = distA
      dist2 = distB
      dist3 = distC
    } else {
      dist1 = `$${texNombre((n1 + n2) / 2)}$` // moyenne simple (coefficients ignorés)
      dist2 = `$${texNombre((n1 * c2 + n2 * c1) / den)}$` // coefficients échangés
      dist3 = `$${texNombre(num / 2)}$` // division par le nombre de devoirs au lieu de la somme des coefficients
    }

    this.reponses = [`$${texNombre(M)}$`, dist1, dist2, dist3]
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : 10 (coeff 2) et 16 (coeff 1) => 12  (distracteurs 11, 13, 14)
    this.appliquerLesValeurs(10, 2, 16, 1, '$11$', '$13$', '$14$')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // [n1, c1, n2, c2] : moyenne et distracteurs tous entiers (≤ 20), notes distinctes, coeffs distincts
    const donnees: [number, number, number, number][] = [
      // --- Coefficients 2 et 1 ---
      [10, 2, 16, 1], // 12 (image)
      [14, 2, 8, 1], // 12
      [8, 2, 14, 1], // 10
      [12, 2, 6, 1], // 10
      [16, 2, 4, 1], // 12
      [10, 2, 4, 1], // 8
      [6, 2, 12, 1], // 8
      [16, 1, 10, 2], // 12
      [8, 1, 14, 2], // 12
      [12, 1, 6, 2], // 8
      [4, 1, 10, 2], // 8

      // --- Coefficients 3 et 1 ---
      [12, 3, 4, 1], // Moyenne = 10 (Distracteurs: 8, 6, 20)
      [8, 3, 16, 1], // Moyenne = 10 (Distracteurs: 12, 14, 20)
      [4, 3, 12, 1], // Moyenne = 6  (Distracteurs: 8, 10, 12)
      [4, 1, 12, 3], // Moyenne = 10 (Distracteurs: 8, 6, 20)
      [12, 1, 4, 3], // Moyenne = 6  (Distracteurs: 8, 10, 12)
      [16, 1, 8, 3], // Moyenne = 10 (Distracteurs: 12, 14, 20)
    ]

    let compteur = 0
    do {
      const [n1, c1, n2, c2] = choice(donnees)
      this.appliquerLesValeurs(n1, c1, n2, c2)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /La moyenne de l'élève est :\s*$/,
        this.interactif
          ? "La moyenne de l'élève est "
          : "Calculer la moyenne de l'élève.",
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
