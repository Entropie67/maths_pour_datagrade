import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer le produit des solutions d’une équation produit nul'
export const interactifReady = true

export const dateDePublication = '25/10/2021'
export const dateDeModifImportante = '30/10/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = 'ab332'

export const refs = {
  'fr-fr': ['can3L1-05', '2L22-flash1'],
  'fr-ch': [],
}
export default class SolutionsEquationProduit extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.versionQcm = false
  }

  nouvelleVersion() {
    const cours =
      "On reconnaît une équation produit nul. <br>Un produit de facteurs est nul, si et seulement si l'un au moins de ses facteurs est nul.<br>"
    switch (
      this.versionQcm
        ? this.quotaChoice('casQcm', [2, 3])
        : this.quotaChoice('cas', [1, 2, 3])
    ) {
      case 1: // cas (x+b)(x+p)=0
        {
          const b = randint(-10, 10)
          const p = randint(-10, 10, [0, b])
          this.question = this.versionQcm
            ? `Le produit des solutions de l'équation ${b === 0 ? `$x(${reduireAxPlusB(1, p)})=0$` : `$(${reduireAxPlusB(1, b)})(${reduireAxPlusB(1, p)})=0$`} est égal à :`
            : `Calculer le produit des solutions de l'équation ${b === 0 ? `$x(${reduireAxPlusB(1, p)})=0$` : `$(${reduireAxPlusB(1, b)})(${reduireAxPlusB(1, p)})=0$`}.` //
          this.correction =
            cours +
            `
$\\begin{aligned}
${b === 0 ? `x(${reduireAxPlusB(1, p)})&=0` : `(${reduireAxPlusB(1, b)})(${reduireAxPlusB(1, p)})&=0`}\\\\
${reduireAxPlusB(1, b)}=0 &\\text{ ou } ${reduireAxPlusB(1, p)}=0\\\\
x=${-b} &\\text{ ou } x=${-p}
\\end{aligned}$<br>
Le produit de ces solutions est donc égal à : $${ecritureParentheseSiNegatif(-b)}\\times ${ecritureParentheseSiNegatif(-p)}=${miseEnEvidence(b * p)}$.`
          this.reponse = this.versionQcm ? `$${b * p}$` : b * p
          this.distracteurs = [
            `$${-b - p}$`,
            '$0$',
            `$${-b * p}$`,
            `$${b + p}$`,
          ]
          if (this.versionQcm) {
            // Secours : Ne garder qu’une solution ou soustraire les solutions.
            this.distracteurs = distracteursDistincts(
              String(this.reponse),
              this.distracteurs,
              [`$${-b}$`, `$${-p}$`, `$${b - p}$`, `$${p - b}$`],
              Math.max(3, this.distracteurs.length),
            )
          }
        }
        break
      case 2: // cas (ax+b)(cx+d)=0 codé avec ia
        {
          // Génération des coefficients pour avoir des solutions fractionnaires simples
          const a = randint(2, 5) // coefficient de x dans le premier facteur
          const c = randint(2, 5, [a]) // coefficient de x dans le second facteur (différent de a)
          const b = randint(-8, 8, [0]) // terme constant du premier facteur
          const d = randint(-8, 8, [0, b]) // terme constant du second facteur (différent de b)

          // Les solutions sont x = -b/a et x = -d/c
          const sol1 = new FractionEtendue(-b, a)
          const sol2 = new FractionEtendue(-d, c)

          // Le produit des solutions est (-b/a) × (-d/c) = bd/(ac)
          const produitSolutions = new FractionEtendue(b * d, a * c)

          this.question = this.versionQcm
            ? `Le produit des solutions de l'équation $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=0$ est égal à :`
            : `Calculer le produit des solutions de l'équation $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=0$.`

          this.correction =
            cours +
            `
$\\begin{aligned}
(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})&=0\\\\
${reduireAxPlusB(a, b)}=0 &\\text{ ou } ${reduireAxPlusB(c, d)}=0\\\\
${a}x=${-b} &\\text{ ou } ${c}x=${-d}\\\\
x=${sol1.texFractionSimplifiee} &\\text{ ou } x=${sol2.texFractionSimplifiee}
\\end{aligned}$<br>
Le produit de ces solutions est donc égal à : $${sol1.simplifie().ecritureParentheseSiNegatif}\\times ${sol2.simplifie().ecritureParentheseSiNegatif}=${miseEnEvidence(produitSolutions.texFractionSimplifiee)}$.`

          this.reponse = this.versionQcm
            ? `$${produitSolutions.texFractionSimplifiee}$`
            : {
                reponse: {
                  value: produitSolutions.texFractionSimplifiee,
                  options: { fractionEgale: true },
                },
              }

          // Distracteurs basés sur des erreurs classiques
          const somme = sol1.sommeFraction(sol2)
          const produitNumerateurs = new FractionEtendue(
            sol1.numIrred * sol2.numIrred,
            1,
          )
          const produitOppose = produitSolutions.oppose()

          this.distracteurs = [
            `$${somme.texFractionSimplifiee}$`, // somme au lieu du produit
            `$${produitNumerateurs.texFractionSimplifiee}$`, // produit des numérateurs seulement
            `$${produitOppose.texFractionSimplifiee}$`, // produit avec mauvais signe
            '$0$', // confusion avec équation du second degré
          ]
          if (this.versionQcm) {
            // Secours : Ne garder qu’une solution ou soustraire les solutions.
            this.distracteurs = distracteursDistincts(
              String(this.reponse),
              this.distracteurs,
              [
                `$${sol1.texFractionSimplifiee}$`,
                `$${sol2.texFractionSimplifiee}$`,
                `$${sol1.differenceFraction(sol2).texFractionSimplifiee}$`,
                `$${sol2.differenceFraction(sol1).texFractionSimplifiee}$`,
              ],
              Math.max(3, this.distracteurs.length),
            )
          }
        }
        break

      case 3: // cas (ax+b)(cx+d)=0 sol entières codé avec ia
        {
          const p = randint(-6, 6, [0]) // première solution entière
          const q = randint(-6, 6, [0, p]) // seconde solution entière (différente de p)

          // On choisit des coefficients a et c pour construire les facteurs
          const a = randint(2, 5)
          const c = randint(2, 5)
          const b = -a * p
          const d = -c * q

          // Le produit des solutions est p × q
          const produitSolutions = p * q

          this.question = this.versionQcm
            ? `Le produit des solutions de l'équation $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=0$ est égal à :`
            : `Calculer le produit des solutions de l'équation $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=0$.`

          this.correction =
            cours +
            `
$\\begin{aligned}
(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})&=0\\\\
${reduireAxPlusB(a, b)}=0 &\\text{ ou } ${reduireAxPlusB(c, d)}=0\\\\
${a}x=${-b} &\\text{ ou } ${c}x=${-d}\\\\
x=${p} &\\text{ ou } x=${q}
\\end{aligned}$<br>
Le produit de ces solutions est donc égal à : $${ecritureParentheseSiNegatif(p)}\\times ${ecritureParentheseSiNegatif(q)}=${miseEnEvidence(produitSolutions)}$.`

          this.reponse = this.versionQcm
            ? `$${produitSolutions}$`
            : produitSolutions

          this.distracteurs = [
            `$${p + q}$`,
            `$${-produitSolutions}$`,
            `$${Math.abs(p - q)}$`,
            '$0$',
          ]
          if (this.versionQcm) {
            // Secours : Ne garder qu’une solution ou soustraire les solutions.
            this.distracteurs = distracteursDistincts(
              String(this.reponse),
              this.distracteurs,
              [`$${p}$`, `$${q}$`, `$${p - q}$`, `$${q - p}$`],
              Math.max(3, this.distracteurs.length),
            )
          }
        }
        break
    }
  }
}
