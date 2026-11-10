import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une image par une fonction affine'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '30/10/2026'
/**
 * @author Jean-claude Lhote avec Gilles Mora
  * Créé pendant l'été 2021

*/
export const uuid = 'cf55d'

export const refs = {
  'fr-fr': ['can3F2-02', '2F13-flash4'],
  'fr-ch': ['NR'],
}
export default class CalculImageParFonctionAffine extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br> ' }
  }

  nouvelleVersion() {
    let nomF
    let x!: number
    let n!: number
    let m!: number
    let y!: number
    switch (
      this.versionQcm
        ? this.quotaChoice('cas', [2, 3])
        : this.quotaChoice('cas', [1, 2, 3])
    ) {
      case 1:
        x = randint(-9, 9, [0, 1, -1])
        n = choice([2, 4, 5])
        m = randint(2, 6, [n, n * 2, n * 3])
        nomF = choice(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'm', 't', 'k'])
        this.question = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=${m}x+${n}$.<br>
        Quelle est l'image de $${x}$ par la fonction $${nomF}$ ?`
        this.correction = `Comme $${nomF}(x)=${m}x+${n}$, on a  :<br>
         $\\begin{aligned}
         ${nomF}(${x})&=${m}\\times ${ecritureParentheseSiNegatif(x)}+${n}\\\\
         &=${m * x}+${n}\\\\
         &=${miseEnEvidence(m * x + n)}
         \\end{aligned}$`
        this.reponse = m * x + n
        this.optionsDeComparaison = { nombreDecimalSeulement: true }
        break
      case 2:
        x = randint(-9, 9, [0, 1, -1])
        n = choice([2, 3, 5])
        m = randint(2, 6, [n, n * 2, n * 3])
        y = randint(-9, 9, [x, 0])
        nomF = choice(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'm', 't', 'k'])
        this.question = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=\\dfrac{${m}}{${n}}x${ecritureAlgebrique(y)}$.<br>        
            `
        this.question += this.versionQcm
          ? `L'image de $${n * x}$ par la fonction $${nomF}$ est :`
          : `Quelle est l'image de $${n * x}$ par la fonction $${nomF}$ ?`

        this.correction = `Comme $${nomF}(x)=\\dfrac{${m}}{${n}}x${ecritureAlgebrique(y)}$, on a :<br>
        $\\begin{aligned}
        ${nomF}(${n * x})&=\\dfrac{${m}}{${n}}\\times ${ecritureParentheseSiNegatif(n * x)}${ecritureAlgebrique(y)}\\\\
        &=${m}\\times \\dfrac{${n * x}}{${n}}${ecritureAlgebrique(y)}\\\\
        &=${m * x}${ecritureAlgebrique(y)}\\\\
        &=${miseEnEvidence(m * x + y)}
        \\end{aligned}$`
        this.reponse = this.versionQcm ? `$${texNombre(m * x + y)}$` : m * x + y
        this.distracteurs = [
          `$${new FractionEtendue(m * x, n * x).ajouteEntier(y).texFractionSimplifiee}$`,
          `$${texNombre(n * x + y)}$`,
          `$${texNombre(m * n * x + y)}$`,
        ]
        this.optionsDeComparaison = { fractionEgale: true }
        break

      case 3:
        n = choice([2, 3, 5])
        m = randint(2, 6, [n, n * 2, n * 3])
        x = randint(-5, 5, [0, 1, -1, n, -n, 2 * n, -2 * n])
        y = randint(-5, 5, [x, 0])
        nomF = choice(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'm', 't', 'k'])
        this.question = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=\\dfrac{${m}}{${n}}x${ecritureAlgebrique(y)}$.<br>         `
        this.question += this.versionQcm
          ? `L'image de $${x}$ par la fonction $${nomF}$ est :`
          : `Quelle est l'image de $${x}$ par la fonction $${nomF}$ ?`

        this.correction = `Comme $${nomF}(x)=\\dfrac{${m}}{${n}}x${ecritureAlgebrique(y)}$, on a :<br>
        $\\begin{aligned}
        ${nomF}(${x})&=\\dfrac{${m}}{${n}}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(y)}\\\\
        &=${new FractionEtendue(m * x, n).texFractionSimplifiee}${ecritureAlgebrique(y)}\\\\
        &=${miseEnEvidence(`${new FractionEtendue(m * x, n).ajouteEntier(y).texFractionSimplifiee}`)}
        \\end{aligned}$`
        this.reponse = this.versionQcm
          ? `$${new FractionEtendue(m * x, n).ajouteEntier(y).texFractionSimplifiee}$`
          : `${new FractionEtendue(m * x, n).ajouteEntier(y).texFractionSimplifiee}`
        this.distracteurs = [
          `$${new FractionEtendue(m * x, n * x).ajouteEntier(y).texFractionSimplifiee}$`,
          `$${new FractionEtendue(m, n).ajouteEntier(x + y).texFractionSimplifiee}$`,
          `$${texNombre(m * x + y)}$`,
        ]
        this.optionsDeComparaison = {
          fractionEgale: true,
          nombreDecimalSeulement: true,
        }
        break
    }
    if (this.versionQcm) {
      // Secours : Oublier l’ordonnée à l’origine ou changer son signe.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [
          new FractionEtendue(m * x, n).texFractionSimplifiee,
          new FractionEtendue(m * x, n).ajouteEntier(-y).texFractionSimplifiee,
          String(m * x),
          String(y),
          String(-y),
        ].map((n) => `$${n}$`),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
