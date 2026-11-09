import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '6dff5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Développer une identité remarquable'
export const dateDePublication = '17/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ1FMt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    total: number,
    pourcentage: number,
    dist1: number,
    dist2: number,
    dist3: number,
  ): void {
    const sol = (total * pourcentage) / 100
    const dixPourCent = total / 10 // 10 % du total
    const facteur = pourcentage / 10 // 2, 3 ou 4

    this.enonce = `Un lycée compte $${total}$ élèves. $${pourcentage}\\,\\%$ des élèves sont externes. <br>
    Le nombre d'externes est :`

    this.correction = `Prendre $10\\,\\%$ de $${total}$ revient à diviser $${total}$ par $10$, ce qui donne $${texNombre(dixPourCent, 0)}$.<br>`
    this.correction += `Pour obtenir $${pourcentage}\\,\\%$ de $${total}$, on multiplie ce résultat par $${facteur}$ : $${facteur} \\times ${texNombre(dixPourCent, 0)} = ${texNombre(sol, 0)}$.<br>`
    this.correction += `Il y a donc $${miseEnEvidence(texNombre(sol, 0))}$ élèves externes dans ce lycée.`

    this.reponses = [
      `$${texNombre(sol, 0)}$`,
      `$${texNombre(dist1, 0)}$`,
      `$${texNombre(dist2, 0)}$`,
      `$${texNombre(dist3, 0)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : 500 élèves, 20 %  => 100
    this.appliquerLesValeurs(500, 20, 20, 520, 10)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const pourcentage = choice([20, 30, 40])
      const total = choice([500, 600, 700, 800])

      // Distracteurs alignés sur la logique de l'image (500, 20 % → 20 ; 520 ; 10)
      const dist1 = pourcentage // confond le pourcentage avec le résultat
      const dist2 = total + pourcentage // ajoute le pourcentage au total
      const dist3 = (total * pourcentage) / 1000 // erreur de division par 1000

      this.appliquerLesValeurs(total, pourcentage, dist1, dist2, dist3)
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
        /Le nombre d'externes est :\s*$/,
        this.interactif
          ? "Le nombre d'externes est "
          : "Calculer le nombre d'élèves externes de ce lycée.",
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
