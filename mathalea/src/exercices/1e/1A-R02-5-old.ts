// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bd0c9 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 06/10/2026 (commit 3ca3967a1).
/**
 * Exercice 1A-R7 : Déterminer une valeur manquante dans un tableau de proportionnalité
 *
 * Tableau 2x2 (lignes : x, y). y = k*x.
 * La valeur dans l'une des cases est manquante.
 * x : entiers. Un x ≤ 10 : x1 ∈ {2;4;6;8;10}. Un x > 10 : x2 ∈ {20;30;40;50}.
 * y : entiers ou décimaux à 1 décimale (au plus un non-entier).
 * Coeffs k = p/q avec q ∈ {1,2,5,10} (décimaux "propres").
 * Correction : deux méthodes (via k ou produits en croix) + suggestion sans calculatrice.
 *
 * @author G.Marris
 * @date 17/09/2025
 * @updated 07/10/2025 - Refactorisation : architecture conforme (appliquerLesValeurs)
 */

import { tableauColonneLigne } from '../../lib/2d/tableau'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteItalique } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

// ============================================================================
// MÉTADONNÉES
// ============================================================================
export const uuid = 'bd0c9'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Déterminer une valeur manquante dans un tableau de proportionnalité'
export const dateDePublication = '17/09/2025'

// ============================================================================
// INTERFACES TYPESCRIPT
// ============================================================================
interface CoeffPQ {
  p: number
  q: number
}

type PositionCase = 1 | 2 | 3 | 4 // 1:x1?, 2:x2?, 3:y1?, 4:y2?

interface DonneesExercice {
  x1: number
  x2: number
  y1: number
  y2: number
  pos: PositionCase
  k: number
}

// ============================================================================
// CLASSE PRINCIPALE
// ============================================================================
export default class Auto1AR7Old extends ExerciceQcmA {
  // ==========================================================================
  // 1. DONNÉES STATIQUES
  // ==========================================================================
  private static readonly COEFFS_PQ: CoeffPQ[] = [
    { p: 1, q: 10 }, // 0.1
    { p: 1, q: 5 }, // 0.2
    { p: 1, q: 2 }, // 0.5
    { p: 3, q: 2 }, // 1.5
    { p: 2, q: 1 }, // 2
    { p: 5, q: 2 }, // 2.5
    { p: 3, q: 1 }, // 3
    { p: 4, q: 1 }, // 4
    { p: 5, q: 1 }, // 5
    { p: 10, q: 1 }, // 10
  ]

  private static readonly MAX_TENTATIVES = 500

  // ==========================================================================
  // 2. MÉTHODES UTILITAIRES PRIVÉES
  // ==========================================================================

  /**
   * Formate un nombre pour une proposition de réponse
   */
  private formatRep = (n: number, d = 1): string => `$${texNombre(n, d)}$`

  /**
   * Calcule les trois distracteurs selon la case manquante
   */
  private calcDistracteurs(
    pos: PositionCase,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    k: number,
  ): [number, number, number] {
    switch (pos) {
      case 1: // x1 ? (bon: x1 = y1/k)
        return [(y2 * x2) / y1, y1 + x2, y1 * k]
      case 2: // x2 ? (bon: x2 = y2/k)
        return [(y1 * x1) / y2, y2 + x1, y2 * k]
      case 3: // y1 ? (bon: y1 = k*x1)
        return [(x2 * y2) / x1, x1 + y2, x1 / k]
      case 4: // y2 ? (bon: y2 = k*x2)
        return [(x1 * y1) / x2, x2 + y1, x2 / k]
      default:
        throw new Error(`Position invalide: ${pos}`)
    }
  }

  /**
   * Construit le tableau HTML/LaTeX avec la valeur manquante
   */
  private construireTableau(
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    pos: PositionCase,
  ): string {
    const entetesColonnes: (string | number)[] = []
    const entetesLignes: (string | number)[] = ['x', 'y']

    let cellules: (string | number)[]
    switch (pos) {
      case 1:
        cellules = ['?', texNombre(x2), texNombre(y1, 1), texNombre(y2, 1)]
        break
      case 2:
        cellules = [texNombre(x1), '?', texNombre(y1, 1), texNombre(y2, 1)]
        break
      case 3:
        cellules = [texNombre(x1), texNombre(x2), '?', texNombre(y2, 1)]
        break
      case 4:
        cellules = [texNombre(x1), texNombre(x2), texNombre(y1, 1), '?']
        break
    }

    return tableauColonneLigne(entetesColonnes, entetesLignes, cellules)
  }

  /**
   * Génère la correction avec les deux méthodes et la vérification
   */
  private genererCorrection(donnees: DonneesExercice): string {
    const { x1, x2, y1, y2, pos, k } = donnees

    // Calcul de la bonne réponse
    let bonne: number
    switch (pos) {
      case 1:
        bonne = x1
        break
      case 2:
        bonne = x2
        break
      case 3:
        bonne = y1
        break
      case 4:
        bonne = y2
        break
    }

    // Méthode 1 : calcul de k
    let kTex: string
    let methode1: string

    switch (pos) {
      case 1: // x1 manquant
        kTex = `\\dfrac{${texNombre(y2, 1)}}{${texNombre(x2, 1)}} = ${texNombre(k, 1)}`
        methode1 = `On a $? = \\dfrac{${texNombre(y1, 1)}}{k} = \\dfrac{${texNombre(y1, 1)}}{${texNombre(k, 1)}} = ${miseEnEvidence(texNombre(bonne, 1))}$`
        break
      case 2: // x2 manquant
        kTex = `\\dfrac{${texNombre(y1, 1)}}{${texNombre(x1, 1)}} = ${texNombre(k, 1)}`
        methode1 = `On a $? = \\dfrac{${texNombre(y2, 1)}}{k} = \\dfrac{${texNombre(y2, 1)}}{${texNombre(k, 1)}} = ${miseEnEvidence(texNombre(bonne, 1))}$`
        break
      case 3: // y1 manquant
        kTex = `\\dfrac{${texNombre(y2, 1)}}{${texNombre(x2, 1)}} = ${texNombre(k, 1)}`
        methode1 = `On a $? = k\\times ${texNombre(x1, 1)} = ${texNombre(k, 1)}\\times ${texNombre(x1, 1)} = ${miseEnEvidence(texNombre(bonne, 1))}$`
        break
      case 4: // y2 manquant
        kTex = `\\dfrac{${texNombre(y1, 1)}}{${texNombre(x1, 1)}} = ${texNombre(k, 1)}`
        methode1 = `On a $? = k\\times ${texNombre(x2, 1)} = ${texNombre(k, 1)}\\times ${texNombre(x2, 1)} = ${miseEnEvidence(texNombre(bonne, 1))}$`
        break
    }

    // Méthode 2 : produits en croix
    let methode2: string
    switch (pos) {
      case 1:
        methode2 = `On a $? \\times ${texNombre(y2, 1)} = ${texNombre(x2, 1)}\\times ${texNombre(y1, 1)}$, donc $\\,? = \\dfrac{${texNombre(x2, 1)}\\times ${texNombre(y1, 1)}}{${texNombre(y2, 1)}} = ${miseEnEvidence(texNombre(bonne, 1))}$`
        break
      case 2:
        methode2 = `On a $? \\times ${texNombre(y1, 1)} = ${texNombre(x1, 1)}\\times ${texNombre(y2, 1)}$, donc $\\,? = \\dfrac{${texNombre(x1, 1)}\\times ${texNombre(y2, 1)}}{${texNombre(y1, 1)}} = ${miseEnEvidence(texNombre(bonne, 1))}$`
        break
      case 3:
        methode2 = `On a $${texNombre(x1, 1)} \\times ${texNombre(y2, 1)} = ${texNombre(x2, 1)}\\times ?$, donc $\\,? = \\dfrac{${texNombre(x1, 1)}\\times ${texNombre(y2, 1)}}{${texNombre(x2, 1)}} = ${miseEnEvidence(texNombre(bonne, 1))}$`
        break
      case 4:
        methode2 = `On a $${texNombre(x1, 1)} \\times ? = ${texNombre(x2, 1)}\\times ${texNombre(y1, 1)}$, donc $\\,? = \\dfrac{${texNombre(x2, 1)}\\times ${texNombre(y1, 1)}}{${texNombre(x1, 1)}} = ${miseEnEvidence(texNombre(bonne, 1))}$`
        break
    }

    // Vérification (égalité des produits en croix)
    const vX1 = pos === 1 ? bonne : x1
    const vX2 = pos === 2 ? bonne : x2
    const vY1 = pos === 3 ? bonne : y1
    const vY2 = pos === 4 ? bonne : y2
    const verification = `$${texNombre(vX1, 1)}\\times ${texNombre(vY2, 1)} = ${texNombre(vX1 * vY2, 1)} \\text{ et } ${texNombre(vX2, 1)}\\times ${texNombre(vY1, 1)} = ${texNombre(vX2 * vY1, 1)}$`

    return (
      'On a $y = k\\times x$.<br>' +
      texteItalique('Méthode 1 – avec le coefficient de proportionnalité') +
      ' :<br>' +
      `On calcule $k$ avec une colonne connue : $k = ${kTex}$.<br>` +
      `${methode1}<br>` +
      texteItalique('Méthode 2 – les produits en croix sont égaux') +
      ' :<br>' +
      `${methode2}.<br>` +
      `Vérification : ${verification}<br>` +
      texteItalique('Astuce : sans calculatrice') +
      ", un ordre de grandeur du produit en croix à obtenir permet souvent de déterminer la seule proposition qui permet de l'approcher."
    )
  }

  // ==========================================================================
  // 3. CONSTRUCTEUR
  // ==========================================================================
  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  // ==========================================================================
  // 4. VERSIONS (qui appellent appliquerLesValeurs())
  // ==========================================================================

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs({
      x1: 6,
      x2: 14,
      y1: 18,
      y2: 42,
      pos: 4,
      k: 3,
    })
  }

  versionAleatoire: () => void = () => {
    // Génération avec plusieurs tentatives pour garantir des propositions uniques
    for (let tentative = 0; tentative < Auto1AR7Old.MAX_TENTATIVES; tentative++) {
      // Choix du coefficient k
      const { p, q } = choice(Auto1AR7Old.COEFFS_PQ)
      const k = p / q

      // Position de la case manquante
      const pos = randint(1, 4) as PositionCase

      // Génération des valeurs x
      const x1 = choice([2, 4, 6, 8, 10])
      const x2 = choice([20, 30, 40, 50])

      // Calcul des y correspondants
      const y1 = k * x1
      const y2 = k * x2

      // Au plus un y non-entier
      const nbNonEntiers = [y1, y2].filter((y) => !Number.isInteger(y)).length
      if (nbNonEntiers > 1) continue

      // Calcul de la bonne réponse selon la position
      let bonne: number
      switch (pos) {
        case 1:
          bonne = x1
          break
        case 2:
          bonne = x2
          break
        case 3:
          bonne = y1
          break
        case 4:
          bonne = y2
          break
      }

      // Calcul des distracteurs
      const [d1, d2, d3] = this.calcDistracteurs(pos, x1, x2, y1, y2, k)

      // Vérification unicité des propositions
      const propositions = [bonne, d1, d2, d3]
      const propStr = propositions.map((n) => this.formatRep(n, 1))

      if (new Set(propStr).size !== 4) continue

      // Si toutes les conditions sont satisfaites, appliquer les valeurs
      this.appliquerLesValeurs({ x1, x2, y1, y2, pos, k })
      return
    }

    // Fallback si échec
    console.warn(
      'Impossible de générer des propositions uniques, utilisation de la version originale',
    )
    this.versionOriginale()
  }

  // ==========================================================================
  // 5. MÉTHODE CENTRALE : appliquerLesValeurs
  // ==========================================================================

  private appliquerLesValeurs(donnees: DonneesExercice): void {
    const { x1, x2, y1, y2, pos, k } = donnees

    // ========================================================================
    // CONSTRUCTION ÉNONCÉ
    // ========================================================================
    const tableau = this.construireTableau(x1, x2, y1, y2, pos)

    this.enonce =
      'Les valeurs de $y$ sont proportionnelles à celles de $x$.<br>' +
      'Déterminer la valeur manquante (?) dans le tableau ci-dessous.<br>' +
      tableau

    // ========================================================================
    // CONSTRUCTION RÉPONSES
    // ========================================================================
    let bonne: number
    switch (pos) {
      case 1:
        bonne = x1
        break
      case 2:
        bonne = x2
        break
      case 3:
        bonne = y1
        break
      case 4:
        bonne = y2
        break
    }

    const [d1, d2, d3] = this.calcDistracteurs(pos, x1, x2, y1, y2, k)

    this.reponses = [
      this.formatRep(bonne, 1),
      this.formatRep(d1, 1),
      this.formatRep(d2, 1),
      this.formatRep(d3, 1),
    ]

    // ========================================================================
    // CONSTRUCTION CORRECTION
    // ========================================================================
    this.correction = this.genererCorrection(donnees)
  }
}
