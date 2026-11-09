import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Traduire une phrase en calcul puis l'effectuer"
export const interactifReady = true

export const dateDePublication = '16/11/2022'
export const dateDeModifImportante = '30/10/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */

export const uuid = '04048'

export const refs = {
  'fr-fr': ['can2N11-03'],
  'fr-ch': ['NR'],
}
export default class ProgrammeCalcul2 extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    // ${texNombre(ecritureParenthesesSiNegatif(a / 5 - e))}^2=${texNombre((a / 5 - e) * (a / 5 - e))}$
  }

  nouvelleVersion() {
    let a!: number
    let b!: number
    let reponse, f1, f2

    switch (
      this.quotaChoice('cas', [1, 2, 3, 4, 5, 6, 7, 8]) //
    ) {
      case 1: // x^2+y^2
        a = randint(-6, 6, 0)
        b = randint(-10, 10, [0, a])

        this.question = this.versionQcm
          ? `Choisir deux nombres puis calculer la somme de leurs carrés. <br>
     Le résultat obtenu, si on choisit comme nombres $${a}$ et $${b}$, est :`
          : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} la somme de leurs carrés. <br>
     Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''} comme nombres $${a}$ et $${b}$ ?`
        this.reponse = this.versionQcm
          ? `$${texNombre(a ** 2 + b ** 2)}$`
          : a ** 2 + b ** 2
        this.correction = `$${ecritureParentheseSiNegatif(a)}^2+${ecritureParentheseSiNegatif(b)}^2=${miseEnEvidence(a ** 2 + b ** 2)}$`

        this.distracteurs = [
          `${(a + b) ** 2 === a ** 2 + b ** 2 ? `$${texNombre((a - b) ** 2)}$` : `$${texNombre((a + b) ** 2)}$`}`,
          `$${texNombre(a ** 2 + b)}$`,
          `$${texNombre(a + b ** 2)}$`,
          `$${texNombre(a - b ** 2)}$`,
        ]

        break
      case 2: // (x+y)^2
        a = randint(-5, 5, 0)
        b = randint(-7, 7, [0, a, -a])
        reponse = (a + b) ** 2

        this.question = this.versionQcm
          ? `Choisir deux nombres puis calculer le carré de leur somme. <br>
   Le résultat obtenu, si on choisit comme nombres $${a}$ et $${b}$, est :`
          : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} le carré de leur somme. <br>
   Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''}comme nombres $${a}$ et $${b}$ ?`

        this.reponse = this.versionQcm ? `$${texNombre(reponse)}$` : reponse
        this.correction = `$(${a}${ecritureAlgebrique(b)})^2=${miseEnEvidence(`${reponse}`)}$`

        this.distracteurs = [
          `$${texNombre(a ** 2 + b ** 2)}$`, // Erreur : carré de la somme vs somme des carrés
          `$${texNombre(a + b)}$`, // Erreur : oubli du carré
          `$${texNombre(a ** 2 + 2 * a * b)}$`, // Erreur : développement incomplet
        ]
        break

      case 3: // 2(x+y)^2
        a = randint(-5, 5, 0)
        b = randint(-5, 5, [0, a, -a])
        reponse = 2 * (a + b) ** 2

        this.question = this.versionQcm
          ? `Choisir deux nombres puis calculer le double du carré de leur somme. <br>
   Le résultat obtenu, si on choisit comme nombres $${a}$ et $${b}$, est :`
          : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} le double du carré de leur somme. <br>
   Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''}comme nombres $${a}$ et $${b}$ ?`

        this.reponse = this.versionQcm ? `$${texNombre(reponse)}$` : reponse
        this.correction = `$2\\times (${a}+${ecritureParentheseSiNegatif(b)})^2=2\\times ${(a + b) ** 2}=${miseEnEvidence(`${reponse}`)}$`

        this.distracteurs = [
          `$${texNombre((2 * (a + b)) ** 2)}$`, // Erreur : (2(x+y))² au lieu de 2(x+y)²
          `$${texNombre(2 * (a + b))}$`, // Erreur : oubli du carré
          `$${texNombre((a + b) ** 2)}$`, // Erreur : oubli du facteur 2
        ]
        break

      case 4: // 2(x*y) et 2*(x+y)
        if (choice([true, false])) {
          a = randint(-10, 10, 0)
          b = randint(-5, 5, [0, a])
          reponse = 2 * a * b

          this.question = this.versionQcm
            ? `Choisir deux nombres puis calculer le double de leur produit. <br>
     Le résultat obtenu, si on choisit comme nombres $${a}$ et $${b}$, est :`
            : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} le double de leur produit. <br>
     Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''}comme nombres $${a}$ et $${b}$ ?`

          this.reponse = this.versionQcm ? `$${texNombre(reponse)}$` : reponse
          this.correction = `$2\\times${ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(`${reponse}`)}$`

          this.distracteurs = [
            `$${texNombre(2 * (a + b))}$`, // Erreur : double de la somme au lieu du produit
            `$${texNombre(a * b)}$`, // Erreur : oubli du facteur 2
            `$${texNombre(2 * a + 2 * b)}$`, // Erreur : distributivité mal appliquée
          ]
        } else {
          a = randint(-10, 10, 0)
          b = randint(-10, 10, [0, a, -a])
          reponse = 2 * (a + b)

          this.question = this.versionQcm
            ? `Choisir deux nombres puis calculer le double de leur somme. <br>
       Le résultat obtenu, si on choisit comme nombres $${a}$ et $${b}$, est :`
            : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} le double de leur somme. <br>
       Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''}comme nombres $${a}$ et $${b}$ ?`

          this.reponse = this.versionQcm ? `$${texNombre(reponse)}$` : reponse
          this.correction = `$2\\times(${a}+${ecritureParentheseSiNegatif(b)})=${miseEnEvidence(`${reponse}`)}$`

          this.distracteurs = [
            `$${texNombre(2 * a * b)}$`, // Erreur : double du produit au lieu de la somme
            `$${texNombre(a + b)}$`, // Erreur : oubli du facteur 2
            `$${texNombre((a + b) ** 2)}$`, // Erreur : carré au lieu du double
          ]
        }
        break

      case 5: // 1/x+1/y
        a = randint(-10, 10, 0)
        b = randint(-4, 4, [-1, 0]) * a // b + a ne doit pas être nul
        f1 = new FractionEtendue(1, a)
        f2 = new FractionEtendue(1, b)
        reponse = f1.sommeFraction(f2).simplifie()

        this.question = this.versionQcm
          ? `Choisir deux nombres puis calculer la somme de leur inverse. <br>
   Le résultat obtenu, si on choisit comme nombres $${a}$ et $${b}$, est :`
          : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} la somme de leur inverse. <br>
   Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''}comme nombres $${a}$ et $${b}$ ?`

        this.reponse = this.versionQcm
          ? `$${reponse.texFractionSimplifiee}$`
          : reponse
        this.correction = `L'inverse de $${a}$ est : $${f1.texFraction}$ ;<br>
  L'inverse de $${b}$ est : $${f2.texFraction}$ ;<br>
  La somme des inverses est donc : $${f1.texFraction}+${f2.texFraction}=\\dfrac{1\\times${ecritureParentheseSiNegatif(b / a)}}{${a}\\times${ecritureParentheseSiNegatif(b / a)}}+${f2.texFraction}=
  \\dfrac{${b / a}}{${b}}+${f2.texFraction}=
  \\dfrac{${b / a + f2.n}}{${b}}=
   ${miseEnEvidence(`${reponse.texFractionSimplifiee}`)}$`

        this.distracteurs = [
          `$\\dfrac{1}{${a + b}}$`, // Erreur : inverse de la somme au lieu de somme des inverses
          `$\\dfrac{2}{${a * b}}$`, // Erreur : mauvais calcul
          `$${new FractionEtendue(2, a + b).texFractionSimplifiee}$`, // Erreur : résultat décimal au lieu de fraction
        ]
        break

      case 6: // 1/(x+y)
        a = randint(-10, 10, 0)
        b = randint(-10, 10, [0, -a])
        reponse = new FractionEtendue(1, a + b)

        this.question = this.versionQcm
          ? `Choisir deux nombres puis calculer l'inverse de leur somme. <br>
   Le résultat obtenu, si on choisit comme nombres $${a}$ et $${b}$, est :`
          : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} l'inverse de leur somme. <br>
   Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''} comme nombres $${a}$ et $${b}$ ?`

        this.reponse = this.versionQcm
          ? `$${reponse.texFractionSimplifiee}$`
          : reponse
        this.correction = `La somme de $${a}$ et $${b}$ est $${a + b}$. <br>
  Son inverse est : $${miseEnEvidence(`${reponse.texFractionSimplifiee}`)}$.`

        this.distracteurs = [
          `$${new FractionEtendue(1, a + b).oppose().texFractionSimplifiee}$`,
          `$${-a - b}$`,
          `$${new FractionEtendue(a + b, a * b).texFractionSimplifiee}$`, //
        ]
        break

      case 7: // 1/(x+y) avec x fraction
        a = randint(2, 10)
        b = randint(1, 10)
        f1 = new FractionEtendue(1, a)
        f2 = new FractionEtendue(1 + b * a, a)
        reponse = new FractionEtendue(a, 1 + b * a)

        this.question = this.versionQcm
          ? `Choisir deux nombres puis calculer l'inverse de leur somme. <br>
   Le résultat obtenu, si on choisit comme nombres $${f1.texFraction}$ et $${b}$, est :`
          : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} l'inverse de leur somme. <br>
   Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''} comme nombres $${f1.texFraction}$ et $${b}$ ?`

        this.reponse = this.versionQcm
          ? `$${reponse.texFractionSimplifiee}$`
          : reponse
        this.correction = `La somme de $${f1.texFraction}$ et $${b}$ est : $${f1.texFraction}+${b}=${f1.texFraction}+\\dfrac{${b}\\times ${a}}{${a}}=
  ${f1.texFraction}+\\dfrac{${b * a}}{${a}}=${f2.texFraction}$. <br>
  <br>
  Son inverse est : $${miseEnEvidence(`${reponse.texFractionSimplifiee}`)}$.`

        this.distracteurs = [
          `$${new FractionEtendue(1 + b * a, a).texFractionSimplifiee}$`, // Erreur : inverse de chaque terme séparément
          `$\\dfrac{${a}}{${1 + b}}$`,
          `$${new FractionEtendue(1, a + b).texFractionSimplifiee}$`, // Erreur : pas d'inversion
        ]
        break

      case 8: // 1/(x+y)^2
        a = randint(-9, 9, 0)
        if (a < 0) {
          b = randint(-2, 6, [0, -a])
        } else {
          b = randint(-6, 2, [0, -a])
        }
        reponse = new FractionEtendue(1, (a + b) ** 2)

        this.question = this.versionQcm
          ? `Choisir deux nombres puis calculer l'inverse du carré de leur somme. <br>
   Le résultat obtenu, si on choisit comme nombres $${a}$ et $${b}$, est :`
          : `Choisir deux nombres puis calculer ${context.isDiaporama ? '<br>' : ''} l'inverse du carré de leur somme. <br>
   Quel résultat obtient-on si on choisit ${context.isDiaporama ? '<br>' : ''} comme nombres $${a}$ et $${b}$ ?`

        this.reponse = this.versionQcm
          ? `$${reponse.texFractionSimplifiee}$`
          : reponse
        this.correction = `La somme de $${a}$ et $${b}$ est : $${a + b}$.<br>
  Le carré de cette somme est : $${ecritureParentheseSiNegatif(a + b)}^2=${(a + b) ** 2}$.<br>
  L'inverse de ce carré est : $${miseEnEvidence(`${reponse.texFractionSimplifiee}`)}$.`

        this.distracteurs = [
          `$${new FractionEtendue(1, a + b).texFractionSimplifiee}$`, // Erreur : oubli du carré
          `$${new FractionEtendue(1, a ** 2 + b ** 2).texFractionSimplifiee}$`, // Erreur : somme des carrés au lieu de carré de la somme
          `$${new FractionEtendue(a ** 2 + b ** 2, a ** 2 * b ** 2).texFractionSimplifiee}$`, // Erreur : résultat décimal au lieu de fraction
        ]
        break
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
    if (this.versionQcm) {
      // Secours : Confondre somme, différence, produit et carré.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [
          (a - b) ** 2,
          -((a + b) ** 2),
          a * b,
          -a * b,
          a + b,
          a - b,
          -a - b,
          2 * (a - b),
          a ** 2 + b ** 2,
        ].map((n) => `$${texNombre(n)}$`),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
