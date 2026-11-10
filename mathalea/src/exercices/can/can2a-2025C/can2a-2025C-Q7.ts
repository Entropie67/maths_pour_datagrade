import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un produit de plusieurs facteurs'
export const interactifReady = true

export const uuid = '7x3ep'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ7 extends ExerciceCan {
  enonce(cas?: number): void {
    // Chaque cas : [facteurs dans l'ordre d'affichage, paire1 (indices), paire2 (indices)]
    // Le produit de la paire 8×décimal donne un entier, les autres donnent un produit simple
    const tableauCas: {
      facteurs: number[]
      paire1: [number, number]
      paire2: [number, number]
    }[] = [
      // VO : 3 × 2 × 5 × 8 × 2,5 = (2×5) × (8×2,5) × 3 = 10 × 20 × 3 = 600
      { facteurs: [3, 2, 5, 8, 2.5], paire1: [1, 2], paire2: [3, 4] },
      // 2 × 5 × 3 × 8 × 3,5 = (2×5) × (8×3,5) × 3 = 10 × 28 × 3 = 840
      { facteurs: [2, 5, 3, 8, 3.5], paire1: [0, 1], paire2: [3, 4] },
      // 7 × 4 × 5 × 8 × 2,5 = (4×5) × (8×2,5) × 7 = 20 × 20 × 7 = 2800
      { facteurs: [3, 4, 5, 8, 2.5], paire1: [1, 2], paire2: [3, 4] },
      // 3 × 4 × 5 × 8 × 4,5 = (4×5) × (8×4,5) × 3 = 20 × 36 × 3 = 2160
      { facteurs: [3, 4, 5, 8, 4.5], paire1: [1, 2], paire2: [3, 4] },
      // 9 × 2 × 5 × 8 × 4,5 = (2×5) × (8×4,5) × 9 = 10 × 36 × 9 = 3240
      { facteurs: [3, 2, 5, 8, 4.5], paire1: [1, 2], paire2: [3, 4] },
      // 2 × 8 × 3,5 × 4 × 5 = (4×5) × (8×3,5) × 2 = 20 × 28 × 2 = 1120
      { facteurs: [2, 8, 2.5, 4, 5], paire1: [3, 4], paire2: [1, 2] },
      // 6 × 2 × 5 × 8 × 3,5 = (2×5) × (8×3,5) × 6 = 10 × 28 × 6 = 1680
      { facteurs: [3, 2, 5, 8, 3.5], paire1: [1, 2], paire2: [3, 4] },
      // 7 × 2 × 5 × 8 × 4,5 = (2×5) × (8×4,5) × 7 = 10 × 36 × 7 = 2520
      { facteurs: [3, 2, 5, 8, 4.5], paire1: [1, 2], paire2: [3, 4] },
    ]

    if (cas == null) {
      cas = this.quotaChoice('cas', [1, 2, 3, 4, 5, 6, 7])
    }

    const choix = tableauCas[cas]
    const f = choix.facteurs
    const [i1, j1] = choix.paire1
    const [i2, j2] = choix.paire2
    const prodPaire1 = new Decimal(f[i1]).mul(f[j1])
    const prodPaire2 = new Decimal(f[i2]).mul(f[j2])

    // Le facteur restant (celui qui n'est dans aucune paire)
    const indices = [0, 1, 2, 3, 4]
    const indiceRestant = indices.find(
      (i) => i !== i1 && i !== j1 && i !== i2 && i !== j2,
    )!
    const facteurRestant = f[indiceRestant]

    let resultat = new Decimal(1)
    for (const v of f) {
      resultat = resultat.mul(v)
    }

    const texteFacteurs = f.map((v) => texNombre(v, 1)).join('\\times ')

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = texNombre(resultat, 0)
    this.question = `$${texteFacteurs}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }

    this.correction = `On regroupe astucieusement :<br>
    $\\underbrace{${texNombre(f[i1], 1)}\\times ${texNombre(f[j1], 1)}}_{${texNombre(prodPaire1, 0)}}\\times \\underbrace{${texNombre(f[i2], 1)}\\times ${texNombre(f[j2], 1)}}_{${texNombre(prodPaire2, 0)}}\\times ${texNombre(facteurRestant, 1)}=${texNombre(prodPaire1, 0)}\\times ${texNombre(prodPaire2, 0)}\\times ${texNombre(facteurRestant, 1)}=${miseEnEvidence(texNombre(resultat, 0))}$`
    this.canEnonce = `$${texteFacteurs}=$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(0)
    else this.enonce()
  }
}
