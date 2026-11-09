import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductiblesFaciles } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '07/09/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '56e60'

export const refs = {
  'fr-fr': ['1A-C10-10', '2A-C3-8'],
  'fr-ch': ['10LCFA5C-11', '10LSFA5C-11', '11CTFA4C-11', '11LCFA4C-11', '11LSFA4C-11', '1mQCM-22'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation simple'
/**
 * @author Gilles Mora
 */
export default class Auto1AC11b extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.besoinFormulaire3Texte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : $ax=0$\n2 : $\\dfrac{x}{a}=0$\n3 : $\\dfrac{a}{x}=1$\n4 : $\\dfrac{x}{a}=1$\n5 : $\\dfrac{a}{x}=a$\n6 : $ax=a$\n7 : $\\dfrac{a}{x}=b$\n8 : $a+\\dfrac{b}{x}=c$ ($a$ et $c$ entiers)\n9 : $a+\\dfrac{b}{x}=c$ ($a$ ou $c$ fractionnaires)\n0 : Mélange',
    ]
    this.sup3 = '0'
  }

  nouvelleVersion() {
    let equation = ''
    if (context.isAmc) this.versionQcm = true

    const typeDeQuestion = Number(
      gestionnaireFormulaireTexte({
        saisie: this.sup3,
        min: 1,
        max: 9,
        defaut: 0,
        melange: 0,
        nbQuestions: 1,
      })[0],
    )
    // Solution attendue et distracteurs (pour la version QCM), en LaTeX sans les $
    let solution: string
    let distracteurs: string[]
    switch (typeDeQuestion) {
      case 1: {
        const a = randint(-9, 9, [-1, 1, 0])
        equation = `$${a}x=0$`
        this.correction = ` On divise par $${a}$ chacun des deux membres de l'équation pour obtenir $x=0$.<br>
    C'est bien $${a}\\times 0$ qui est égal à $0$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('0')}$.`
        solution = '0'
        distracteurs = [
          `${-a}`,
          `\\dfrac{1}{${abs(a)}}`,
          `-\\dfrac{1}{${abs(a)}}`,
        ]
        break
      }
      case 2: {
        const a = randint(2, 10)
        equation = `$\\dfrac{x}{${a}}=0$`
        this.correction = ` On multiplie par $${a}$ chacun des deux membres de l'équation pour obtenir $x=0$.<br>
    C'est bien $0\\div ${a}$ qui est égal à $0$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('0')}$.`
        solution = '0'
        distracteurs = [`${-a}`, `\\dfrac{1}{${a}}`, `-\\dfrac{1}{${a}}`]
        break
      }
      case 3: {
        const a = randint(-10, 10, [-1, 1, 0])
        equation = `$\\dfrac{${a}}{x}=1$`
        this.correction = ` La fraction $\\dfrac{${a}}{x}$ est égale à $1$, lorsque son numérateur et son dénominateur sont égaux, c'est-à-dire lorsque $x=${a}$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(a)}$.`
        solution = `${a}`
        distracteurs = [
          `${-a}`,
          `\\dfrac{1}{${abs(a)}}`,
          `-\\dfrac{1}{${abs(a)}}`,
        ]
        break
      }
      case 4: {
        const a = randint(-10, 10, [-1, 1, 0])
        equation = `$\\dfrac{x}{${a}}=1$`
        this.correction = ` La fraction $\\dfrac{x}{${a}}$ est égale à $1$, lorsque son numérateur et son dénominateur sont égaux, c'est-à-dire lorsque $x=${a}$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(a)}$.`
        solution = `${a}`
        distracteurs = [
          `${-a}`,
          `\\dfrac{1}{${abs(a)}}`,
          `-\\dfrac{1}{${abs(a)}}`,
        ]
        break
      }
      case 5: {
        const a = randint(-10, 10, [-1, 1, 0])
        equation = `$\\dfrac{${a}}{x}=${a}$`
        this.correction = ` La fraction $\\dfrac{${a}}{x}$ est égale à $${a}$, lorsque son dénominateur est égal à $1$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('1')}$.`
        solution = '1'
        distracteurs = [`${a}`, `${-a}`, `\\dfrac{1}{${abs(a)}}`]
        break
      }
      case 6: {
        const a = randint(-9, 9, [-1, 1, 0])
        equation = `$${a}x=${a}$`
        this.correction = ` On divise par $${a}$ chacun des deux membres de l'équation pour obtenir $x=1$.<br>
    C'est bien $${a}\\times 1$ qui est égal à $${a}$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('1')}$.`
        solution = '1'
        distracteurs = [
          `${-a}`,
          `\\dfrac{1}{${abs(a)}}`,
          `-\\dfrac{1}{${abs(a)}}`,
        ]
        break
      }
      case 7: {
        // a/x = b : résolution par produit en croix, solution a/b.
        // b différent de ±1 et de ±a pour que les quatre réponses soient distinctes
        // (et éviter de retomber sur les cas 3 et 5).
        const a = randint(-10, 10, [-1, 0, 1])
        const b = randint(-10, 10, [-1, 0, 1, a, -a])
        const solutionFraction = new FractionEtendue(a, b)
        equation = `$\\dfrac{${a}}{x}=${b}$`
        this.correction = `L'équation est définie si le dénominateur $x$ n'est pas nul, c'est-à-dire si $x\\neq 0$.<br>
    De plus, l'équation $\\dfrac{${a}}{x}=${b}$ équivaut à $\\dfrac{${a}}{x}=\\dfrac{${b}}{1}$, ce qui conduit par produit en croix à $${a}\\times 1=${b}\\times x$, soit à $x=${solutionFraction.texFraction}$${
      solutionFraction.texFraction === solutionFraction.texFractionSimplifiee
        ? ''
        : `, c'est-à-dire à $x=${solutionFraction.texFractionSimplifiee}$`
    }.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(solutionFraction.texFractionSimplifiee)}$.`
        solution = solutionFraction.texFractionSimplifiee
        distracteurs = [
          new FractionEtendue(b, a).texFractionSimplifiee,
          new FractionEtendue(-a, b).texFractionSimplifiee,
          `${a * b}`,
        ]
        break
      }
      case 8: {
        // a + b/x = c avec a et c entiers relatifs : on isole b/x puis produit en croix.
        // b différent de ±(c-a) pour que les quatre réponses soient distinctes.
        const a = randint(-9, 9, [0])
        const c = randint(-9, 9, [a])
        const b = randint(-9, 9, [0, c - a, a - c])
        const absB = abs(b)
        const secondMembre = b > 0 ? c - a : a - c
        const solutionFraction = new FractionEtendue(absB, secondMembre)
        const inverse = new FractionEtendue(secondMembre, absB)
        const equationTex = `${a}${b > 0 ? '+' : '-'}\\dfrac{${absB}}{x}=${c}`
        const isolementTex =
          c === 0
            ? `$\\dfrac{${absB}}{x}=${secondMembre}$`
            : `$\\dfrac{${absB}}{x}=${
                b > 0
                  ? `${c}-${ecritureParentheseSiNegatif(a)}`
                  : `${a}-${ecritureParentheseSiNegatif(c)}`
              }$, c'est-à-dire à $\\dfrac{${absB}}{x}=${secondMembre}$`
        const resolutionTex =
          abs(secondMembre) === 1
            ? `$x=${solutionFraction.texFractionSimplifiee}$`
            : `$x=${solutionFraction.texFraction}$${
                solutionFraction.texFraction ===
                solutionFraction.texFractionSimplifiee
                  ? ''
                  : `, c'est-à-dire à $x=${solutionFraction.texFractionSimplifiee}$`
              }`
        equation = `$${equationTex}$`
        this.correction = `L'équation est définie si le dénominateur $x$ n'est pas nul, c'est-à-dire si $x\\neq 0$.<br>
    De plus, l'équation $${equationTex}$ équivaut à ${isolementTex}.<br>
    Comme $\\dfrac{${absB}}{x}=\\dfrac{${secondMembre}}{1}$, le produit en croix conduit à $${absB}\\times 1=${secondMembre}\\times x$, soit à ${resolutionTex}.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(solutionFraction.texFractionSimplifiee)}$.`
        solution = solutionFraction.texFractionSimplifiee
        distracteurs = [
          solutionFraction.oppose().texFractionSimplifiee,
          inverse.texFractionSimplifiee,
          inverse.oppose().texFractionSimplifiee,
        ]
        break
      }
      case 9:
      default: {
        // a + b/x = c avec a ou c fraction irréductible, voire les deux (comme 1/2 - 5/x = 0).
        // On impose un second membre isolé non entier : c'est une fraction m/n irréductible
        // avec n > 1, ce qui garantit que les quatre réponses sont distinctes
        // (|m| = |b|n imposerait n = 1). Seul le tirage « a et c fractions » peut produire
        // un second membre entier, d'où la boucle.
        const nouvelleFraction = () =>
          choice([true, false])
            ? choice(obtenirListeFractionsIrreductiblesFaciles())
            : choice(obtenirListeFractionsIrreductiblesFaciles()).oppose()
        const b = randint(-9, 9, [0])
        const absB = abs(b)
        let aValue: FractionEtendue
        let cValue: FractionEtendue
        let secondMembre: FractionEtendue
        let cpt = 0
        do {
          // 1 : a fraction et c entier, 2 : a entier et c fraction, 3 : a et c fractions
          const typeDeCouple = randint(1, 3)
          aValue =
            typeDeCouple === 2
              ? new FractionEtendue(randint(-5, 5, [0]), 1)
              : nouvelleFraction()
          cValue =
            typeDeCouple === 1
              ? new FractionEtendue(randint(-5, 5), 1)
              : nouvelleFraction()
          secondMembre = (
            b > 0
              ? cValue.differenceFraction(aValue)
              : aValue.differenceFraction(cValue)
          ).simplifie()
          cpt++
        } while (secondMembre.den === 1 && cpt < 50)
        const solutionBrute = new FractionEtendue(
          absB * secondMembre.den,
          secondMembre.num,
        )
        const solutionFraction = solutionBrute.simplifie()
        const inverse = new FractionEtendue(
          secondMembre.num,
          absB * secondMembre.den,
        ).simplifie()
        const equationTex = `${aValue.texFractionSimplifiee}${b > 0 ? '+' : '-'}\\dfrac{${absB}}{x}=${cValue.texFractionSimplifiee}`
        const minuend = b > 0 ? cValue : aValue
        const subtrahend = b > 0 ? aValue : cValue
        const isolementTex =
          minuend.num === 0 || subtrahend.num === 0
            ? `$\\dfrac{${absB}}{x}=${secondMembre.texFractionSimplifiee}$`
            : `$\\dfrac{${absB}}{x}=${minuend.texFractionSimplifiee}-${ecritureParentheseSiNegatif(subtrahend)}$, c'est-à-dire à $\\dfrac{${absB}}{x}=${secondMembre.texFractionSimplifiee}$`
        const resolutionTex =
          abs(secondMembre.num) === 1
            ? `$x=${solutionFraction.texFractionSimplifiee}$`
            : `$x=${solutionBrute.texFraction}$${
                solutionBrute.texFraction ===
                solutionFraction.texFractionSimplifiee
                  ? ''
                  : `, c'est-à-dire à $x=${solutionFraction.texFractionSimplifiee}$`
              }`
        equation = `$${equationTex}$`
        this.correction = `L'équation est définie si le dénominateur $x$ n'est pas nul, c'est-à-dire si $x\\neq 0$.<br>
    De plus, l'équation $${equationTex}$ équivaut à ${isolementTex}.<br>
    Le produit en croix conduit à $${absB}\\times ${secondMembre.den}=${ecritureParentheseSiNegatif(secondMembre.num)}\\times x$, soit à ${resolutionTex}.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(solutionFraction.texFractionSimplifiee)}$.`
        solution = solutionFraction.texFractionSimplifiee
        distracteurs = [
          solutionFraction.oppose().texFractionSimplifiee,
          inverse.texFractionSimplifiee,
          inverse.oppose().texFractionSimplifiee,
        ]
        break
      }
    }

    if (this.versionQcm) {
      this.question = `La solution de l'équation ${equation} est :`
      // Le \vphantom aligne la hauteur des propositions, qu'elles soient fractionnaires ou non
      const proposition = (tex: string) => `$\\vphantom{\\dfrac{1}{3}}${tex}$`
      this.reponse = proposition(solution)
      this.distracteurs = distracteurs.map(proposition)
    } else {
      this.reponse = solution
      // En interactif, x= à la ligne devant le champ ; sur papier (PDF), consigne classique
      this.question = this.interactif
        ? `La solution de l'équation ${equation} est :<br>$x=$`
        : `Déterminer la solution de l'équation ${equation}.`
    }
  }
}
