import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'cb99a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une image par une fonction'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6FMt2026 extends ExerciceQcmACourt {
  // f(x) = x(ax + b) ; on calcule l'image de x0.
  // Distracteurs forçables (distA/B/C) pour reproduire la version officielle.
  private appliquerLesValeurs(
    a: number,
    b: number,
    x0: number,
    distA?: string,
    distB?: string,
    distC?: string,
  ): void {
    const signeNombre = (n: number) => (n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`)

    const prod = a * x0
    const inner = prod + b
    const correct = x0 * inner

    this.enonce = `On considère la fonction $f$ définie sur $\\R$ par $f(x) = x(${reduireAxPlusB(a, b)})$.<br>`
    this.enonce += `L'image de $${x0}$ par cette fonction est :`

    this.correction = `On remplace $x$ par $${x0}$ :<br>`
    this.correction += `$\\begin{aligned}
f${ecritureParentheseSiNegatif(x0)} &= ${ecritureParentheseSiNegatif(x0)}\\times\\left(${a}\\times ${ecritureParentheseSiNegatif(x0)} ${signeNombre(b)}\\right)\\\\
&= ${ecritureParentheseSiNegatif(x0)}\\times\\left(${prod} ${signeNombre(b)}\\right)\\\\
&= ${ecritureParentheseSiNegatif(x0)}\\times ${ecritureParentheseSiNegatif(inner)}\\\\
&= ${miseEnEvidence(`${correct}`)}
\\end{aligned}$`

    const repCorrecte = `$${texNombre(correct, 0)}$`
    let dist1, dist2, dist3
    if (distA && distB && distC) {
      dist1 = distA
      dist2 = distB
      dist3 = distC
    } else {
      dist1 = `$${texNombre(x0 + inner, 0)}$` // addition au lieu de la multiplication
      dist2 = `$${texNombre(-correct, 0)}$` // opposé (erreur de signe)
      dist3 = `$${texNombre(inner, 0)}$` // oubli de multiplier ecritureParentheseSiNegatif x
    }

    this.reponses = [repCorrecte, dist1, dist2, dist3]
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : f(x) = x(3x - 6), image de -2 => 24  (distracteurs -14, -24, -48)
    this.appliquerLesValeurs(3, -6, -2, '$-14$', '$-24$', '$-48$')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // [a, b, x0] : a ∈ {2,3,4}, b ≠ 0, x0 ∈ {-3,-2,2,3} (pas de -1, 0, 1), ecritureParentheseSiNegatifenthèse ≠ 0
    const donnees: [number, number, number][] = [
      [3, -6, -2], // image
      [2, -4, -3],
      [2, 4, -3],
      [3, -2, -2],
      [4, -6, -3],
      [4, 4, -2],
      [3, 2, -2],
      [4, -2, -2],
      [3, 6, -3],
      [2, 2, -3],
    ]

    let compteur = 0
    do {
      const [a, b, x0] = choice(donnees)
      this.appliquerLesValeurs(a, b, x0)
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
        /L'image de \$([^$]*)\$ par cette fonction est :\s*$/,
        (_, x: string) =>
          this.interactif
            ? `L'image de $${x}$ par cette fonction est `
            : `Calculer l'image de $${x}$ par cette fonction.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBase
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
