import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '10151'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec une proportion'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ2CEs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    partie: number,
    numFrac: number,
    denFrac: number,
    customDists?: number[],
  ): void {
    const total = (partie * denFrac) / numFrac

    this.enonce = `Dans un lycée, $${partie}$ élèves de première générale suivent la spécialité Mathématiques ce qui représente $\\dfrac{${numFrac}}{${denFrac}}$ de l'ensemble des élèves de première générale. <br>
    Le nombre d'élèves en première générale dans ce lycée est :`

    this.correction = `Notons $N$ le nombre total d'élèves en première générale.<br>
    L'énoncé nous indique que : $\\dfrac{${numFrac}}{${denFrac}} \\times N = ${partie}$.<br>
    Ainsi :<br>
    $N = ${partie} \\times \\dfrac{${denFrac}}{${numFrac}} = \\dfrac{${partie} \\times ${denFrac}}{${numFrac}} = ${total}$<br>
    Le nombre d'élèves en première générale dans ce lycée est donc de $${miseEnEvidence(texNombre(total, 0))}$.`

    let distracteursUniques: number[] = []

    if (customDists && customDists.length === 3) {
      // Force les distracteurs exacts du PDF pour la version originale
      distracteursUniques = customDists
    } else {
      // Génération automatique cohérente pour les versions aléatoires
      const d1 = Math.round((partie * numFrac) / denFrac) // Piège : multiplication directe au lieu de division
      const d2 = partie * 2 // Piège : double de l'effectif partiel
      const d3 = total + (randint(0, 1) === 0 ? 50 : -50) // Piège : arrondi supérieur ou inférieur

      const candidates = [d1, d2, d3]
      distracteursUniques = [...new Set(candidates)].filter(
        (d) => d !== total && d > 0,
      )

      // Sécurité pour garantir d'avoir 3 distracteurs uniques
      while (distracteursUniques.length < 3) {
        const extra = total + randint(-3, 3) * 20
        if (
          extra !== total &&
          extra > 0 &&
          !distracteursUniques.includes(extra)
        ) {
          distracteursUniques.push(extra)
        }
      }
    }

    this.reponses = [
      `$${texNombre(total, 0)}$`,
      `$${texNombre(distracteursUniques[0], 0)}$`,
      `$${texNombre(distracteursUniques[1], 0)}$`,
      `$${texNombre(distracteursUniques[2], 0)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Version exacte du PDF : 150 représente 3/5 de l'ensemble
    // Distracteurs stricts du PDF : 90, 200, 300
    this.appliquerLesValeurs(150, 3, 5, [90, 200, 300])
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    // Banque de 11 cas configurés avec les fractions demandées
    const cas = [
      { partie: 150, numFrac: 3, denFrac: 5 }, // Cas original
      { partie: 80, numFrac: 2, denFrac: 5 }, // total = 200
      { partie: 120, numFrac: 2, denFrac: 5 }, // total = 300
      { partie: 160, numFrac: 4, denFrac: 5 }, // total = 200
      { partie: 240, numFrac: 4, denFrac: 5 }, // total = 300
      { partie: 120, numFrac: 2, denFrac: 3 }, // total = 180
      { partie: 150, numFrac: 2, denFrac: 3 }, // total = 240
      { partie: 200, numFrac: 2, denFrac: 3 }, // total = 300
      { partie: 120, numFrac: 3, denFrac: 4 }, // total = 160
      { partie: 150, numFrac: 3, denFrac: 4 }, // total = 200
      { partie: 180, numFrac: 3, denFrac: 4 }, // total = 240
    ]

    do {
      const choix = choice(cas)
      this.appliquerLesValeurs(choix.partie, choix.numFrac, choix.denFrac)
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
        /Le nombre d'élèves en première générale dans ce lycée est :\s*$/,
        this.interactif
          ? "Le nombre d'élèves en première générale dans ce lycée est "
          : "Calculer le nombre d'élèves en première générale dans ce lycée.",
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
