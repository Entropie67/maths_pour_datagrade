// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 3b917 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductiblesFaciles } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '07/09/2025'
export const uuid = '3b917'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation simple'
/**
 * @author Gilles Mora
 */
export default class Auto1AC11bOld extends ExerciceQcmA {
  versionOriginale: () => void = () => {
    this.enonce = "La solution de l'équation  $3x=0$ est : "
    this.correction = ` On divise par $3$ chacun des deux membres  de l'équation pour obtenir $x=0$.<br>
    C'est bien $3\\times 0$ qui est égal à $0$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('0')}$.`

    this.reponses = [
      '$\\vphantom{\\dfrac{1}{3}}0$',
      '$\\vphantom{\\dfrac{1}{3}}-3$',
      '$\\dfrac{1}{3}$',
      '$-\\dfrac{1}{3}$',
    ]
  }

  versionAleatoire = () => {
    // Un type par appel : versionAleatoire() est rappelée par ExerciceQcm pour chaque
    // question (et à chaque tirage rejeté), sans index de question.
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
    switch (typeDeQuestion) {
      case 1:
        {
          const a = randint(-9, 9, [-1, 1, 0])
          this.enonce = `La solution de l'équation  $${a}x=0$ est : `
          this.correction = ` On divise par $${a}$ chacun des deux membres  de l'équation pour obtenir $x=0$.<br>
    C'est bien $${a}\\times 0$ qui est égal à $0$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('0')}$.`

          this.reponses = [
            '$\\vphantom{\\dfrac{1}{3}}0$',
            `$\\vphantom{\\dfrac{1}{3}}${-a}$`,
            `$\\dfrac{1}{${abs(a)}}$`,
            `$-\\dfrac{1}{${abs(a)}}$`,
          ]
        }
        break
      case 2:
        {
          const a = randint(2, 10)
          this.enonce = `La solution de l'équation  $\\dfrac{x}{${a}}=0$ est : `

          this.correction = ` On multiplie par $${a}$ chacun des deux membres  de l'équation pour obtenir $x=0$.<br>
    C'est bien $0\\div ${a}$ qui est égal à $0$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('0')}$.`
          this.reponses = [
            '$\\vphantom{\\dfrac{1}{3}}0$',
            `$\\vphantom{\\dfrac{1}{3}}${-a}$`,
            `$\\dfrac{1}{${abs(a)}}$`,
            `$-\\dfrac{1}{${abs(a)}}$`,
          ]
        }
        break

      case 3:
        {
          const a = randint(-10, 10, [-1, 1, 0])
          this.enonce = `La solution de l'équation $\\dfrac{${a}}{x}=1$ est : `

          this.correction = ` La fraction $\\dfrac{${a}}{x}$ est égale à $1$, lorsque son numérateur et son dénominateur sont égaux, c'est-à-dire lorsque $x=${a}$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(a)}$.`
          this.reponses = [
            `$\\vphantom{\\dfrac{1}{3}}${a}$`,
            `$\\vphantom{\\dfrac{1}{3}}${-a}$`,
            `$\\dfrac{1}{${abs(a)}}$`,
            `$-\\dfrac{1}{${abs(a)}}$`,
          ]
        }
        break
      case 4:
        {
          const a = randint(-10, 10, [-1, 1, 0])
          this.enonce = `La solution de l'équation $\\dfrac{x}{${a}}=1$ est : `

          this.correction = ` La fraction $\\dfrac{x}{${a}}$ est égale à $1$, lorsque son numérateur et son dénominateur sont égaux, c'est-à-dire lorsque $x=${a}$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(a)}$.`
          this.reponses = [
            `$\\vphantom{\\dfrac{1}{3}}${a}$`,
            `$\\vphantom{\\dfrac{1}{3}}${-a}$`,
            `$\\dfrac{1}{${abs(a)}}$`,
            `$-\\dfrac{1}{${abs(a)}}$`,
          ]
        }
        break

      case 5:
        {
          const a = randint(-10, 10, [-1, 1, 0])
          this.enonce = `La solution de l'équation $\\dfrac{${a}}{x}=${a}$ est : `

          this.correction = ` La fraction $\\dfrac{${a}}{x}$ est égale à $${a}$, lorsque son  dénominateur est égal à $1$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('1')}$.`
          this.reponses = [
            `$\\vphantom{\\dfrac{1}{3}}1$`,
            `$\\vphantom{\\dfrac{1}{3}}${a}$`,
            `$\\vphantom{\\dfrac{1}{3}}${-a}$`,
            `$\\dfrac{1}{${abs(a)}}$`,
          ]
        }
        break

      case 6:
        {
          const a = randint(-9, 9, [-1, 1, 0])
          this.enonce = `La solution de l'équation  $${a}x=${a}$ est : `
          this.correction = ` On divise par $${a}$ chacun des deux membres  de l'équation pour obtenir $x=1$.<br>
    C'est bien $${a}\\times 1$ qui est égal à $${a}$.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence('1')}$.`

          this.reponses = [
            '$\\vphantom{\\dfrac{1}{3}}1$',
            `$\\vphantom{\\dfrac{1}{3}}${-a}$`,
            `$\\dfrac{1}{${abs(a)}}$`,
            `$-\\dfrac{1}{${abs(a)}}$`,
          ]
        }
        break

      case 7:
        {
          // a/x = b : résolution par produit en croix, solution a/b.
          // b différent de ±1 et de ±a pour que les quatre réponses soient distinctes
          // (et éviter de retomber sur les cas 3 et 5).
          const a = randint(-10, 10, [-1, 0, 1])
          const b = randint(-10, 10, [-1, 0, 1, a, -a])
          const solution = new FractionEtendue(a, b)
          this.enonce = `La solution de l'équation $\\dfrac{${a}}{x}=${b}$ est : `
          this.correction = `L'équation est définie si le dénominateur $x$ n'est pas nul, c'est-à-dire si $x\\neq 0$.<br>
    De plus, l'équation $\\dfrac{${a}}{x}=${b}$ équivaut à $\\dfrac{${a}}{x}=\\dfrac{${b}}{1}$, ce qui conduit par produit en croix à $${a}\\times 1=${b}\\times x$, soit à $x=${solution.texFraction}$${
      solution.texFraction === solution.texFractionSimplifiee
        ? ''
        : `, c'est-à-dire à $x=${solution.texFractionSimplifiee}$`
    }.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(solution.texFractionSimplifiee)}$.`

          this.reponses = [
            `$\\vphantom{\\dfrac{1}{3}}${solution.texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${new FractionEtendue(b, a).texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${new FractionEtendue(-a, b).texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${a * b}$`,
          ]
        }
        break

      case 8:
        {
          // a + b/x = c avec a et c entiers relatifs : on isole b/x puis produit en croix.
          // b différent de ±(c-a) pour que les quatre réponses soient distinctes.
          const a = randint(-9, 9, [0])
          const c = randint(-9, 9, [a])
          const b = randint(-9, 9, [0, c - a, a - c])
          const absB = abs(b)
          const secondMembre = b > 0 ? c - a : a - c
          const solution = new FractionEtendue(absB, secondMembre)
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
              ? `$x=${solution.texFractionSimplifiee}$`
              : `$x=${solution.texFraction}$${
                  solution.texFraction === solution.texFractionSimplifiee
                    ? ''
                    : `, c'est-à-dire à $x=${solution.texFractionSimplifiee}$`
                }`
          this.enonce = `La solution de l'équation $${equationTex}$ est : `
          this.correction = `L'équation est définie si le dénominateur $x$ n'est pas nul, c'est-à-dire si $x\\neq 0$.<br>
    De plus, l'équation $${equationTex}$ équivaut à ${isolementTex}.<br>
    Comme $\\dfrac{${absB}}{x}=\\dfrac{${secondMembre}}{1}$, le produit en croix conduit à $${absB}\\times 1=${secondMembre}\\times x$, soit à ${resolutionTex}.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(solution.texFractionSimplifiee)}$.`

          this.reponses = [
            `$\\vphantom{\\dfrac{1}{3}}${solution.texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${solution.oppose().texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${inverse.texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${inverse.oppose().texFractionSimplifiee}$`,
          ]
        }
        break

      case 9:
      default:
        {
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
          const solution = solutionBrute.simplifie()
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
              ? `$x=${solution.texFractionSimplifiee}$`
              : `$x=${solutionBrute.texFraction}$${
                  solutionBrute.texFraction === solution.texFractionSimplifiee
                    ? ''
                    : `, c'est-à-dire à $x=${solution.texFractionSimplifiee}$`
                }`
          this.enonce = `La solution de l'équation $${equationTex}$ est : `
          this.correction = `L'équation est définie si le dénominateur $x$ n'est pas nul, c'est-à-dire si $x\\neq 0$.<br>
    De plus, l'équation $${equationTex}$ équivaut à ${isolementTex}.<br>
    Le produit en croix conduit à $${absB}\\times ${secondMembre.den}=${ecritureParentheseSiNegatif(secondMembre.num)}\\times x$, soit à ${resolutionTex}.<br>
        Ainsi, la solution de l'équation est $${miseEnEvidence(solution.texFractionSimplifiee)}$.`

          this.reponses = [
            `$\\vphantom{\\dfrac{1}{3}}${solution.texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${solution.oppose().texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${inverse.texFractionSimplifiee}$`,
            `$\\vphantom{\\dfrac{1}{3}}${inverse.oppose().texFractionSimplifiee}$`,
          ]
        }
        break
    }
  }

  constructor() {
    super()
    this.besoinFormulaire3Texte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : $ax=0$\n2 : $\\dfrac{x}{a}=0$\n3 : $\\dfrac{a}{x}=1$\n4 : $\\dfrac{x}{a}=1$\n5 : $\\dfrac{a}{x}=a$\n6 : $ax=a$\n7 : $\\dfrac{a}{x}=b$\n8 : $a+\\dfrac{b}{x}=c$ ($a$ et $c$ entiers)\n9 : $a+\\dfrac{b}{x}=c$ ($a$ ou $c$ fractionnaires)\n0 : Mélange',
    ]
    this.sup3 = '0'
    this.versionAleatoire()
  }
}
