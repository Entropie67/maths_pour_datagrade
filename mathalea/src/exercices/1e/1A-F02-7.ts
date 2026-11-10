import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '16/10/2025'
export const uuid = '1ebd6'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-F02-7'],
  'fr-ch': ['1mQCM-50', '2mQCM-13'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer la position relative de deux droites'
export default class auto1AF2g extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
  ): void {
    this.enonce = `$(D)$ et $(D')$ sont deux droites dans un repère du plan.<br>
    L'équation réduite de $(D)$ est : $y=${reduireAxPlusB(a, b)}$ et celle de $(D')$ est : $y=${reduireAxPlusB(c, d)}$.<br>
    La droite $(D)$ est strictement au-dessus de la droite $(D')$ sur : `
    this.correction = ` La droite $(D)$ est strictement au-dessus de la droite $(D')$ lorsque $${reduireAxPlusB(a, b)}>${reduireAxPlusB(c, d)}$.<br>
     $\\begin{aligned}
     ${reduireAxPlusB(a, b)}&>${reduireAxPlusB(c, d)}\\\\
     ${reduireAxPlusB(a - c, 0)}&>${reduireAxPlusB(0, d - b)}\\\\
     x&${a - c > 0 ? '>' : '<'}${new FractionEtendue(d - b, a - c).texFractionSimplifiee}
     \\end{aligned}$<br>
     La droite $(D)$ est donc strictement au-dessus de la droite $(D')$ sur : 
     ${
       a - c > 0
         ? `$${miseEnEvidence(`\\left]${new FractionEtendue(d - b, a - c).texFractionSimplifiee}\\,;\\, +\\infty\\right[`)}$`
         : `$${miseEnEvidence(`\\left]-\\infty\\,;\\,${new FractionEtendue(d - b, a - c).texFractionSimplifiee}\\right[`)}$`
     }.`
    if (a - c > 0) {
      this.reponses = [
        `$\\left]${new FractionEtendue(d - b, a - c).texFractionSimplifiee}\\,;\\, +\\infty\\right[$`,
        `$\\left]-\\infty\\,;\\,${new FractionEtendue(d - b, a - c).texFractionSimplifiee}\\right[$`,
        `$\\left]${new FractionEtendue(a - c, d - b).texFractionSimplifiee}\\,;\\, +\\infty\\right[$`,
        `$\\left]-\\infty\\,;\\,${new FractionEtendue(a - c, d - b).texFractionSimplifiee}\\right[$`,
      ]
    } else {
      this.reponses = [
        `$\\left]-\\infty\\,;\\,${new FractionEtendue(d - b, a - c).texFractionSimplifiee}\\right[$`,
        `$\\left]${new FractionEtendue(d - b, a - c).texFractionSimplifiee}\\,;\\, +\\infty\\right[$`,
        `$\\left]${new FractionEtendue(a - c, d - b).texFractionSimplifiee}\\,;\\, +\\infty\\right[$`,
        `$\\left]-\\infty\\,;\\,${new FractionEtendue(a - c, d - b).texFractionSimplifiee}\\right[$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 2, 5, 6)
  }

  versionAleatoire: () => void = () => {
    const a = randint(-9, 9, 0)
    const b = randint(-9, 9, 0)
    const c = randint(-9, 9, [0, a])
    let d = randint(-9, 9, 0)

    // Continuer tant que les conditions problématiques sont remplies
    while (
      d - b === a - c || // Éviter les pentes relatives identiques
      d - b === c - a || // Éviter le cas symétrique
      d === b // Éviter que les ordonnées à l'origine soient identiques
    ) {
      d = randint(-9, 9, 0)
    }

    this.appliquerLesValeurs(a, b, c, d)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacing = 2
  }
}
