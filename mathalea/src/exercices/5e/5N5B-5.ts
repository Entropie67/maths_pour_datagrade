import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer une expression littérale simple pour une valeur donnée, dont les fractions'
export const interactifReady = true
export const dateDePublication = '14/05/2026'

export const uuid = '79a6e'
export const refs = {
  'fr-fr': ['5N5B-5'],
  'fr-2016': ['5L14-6'],
  'fr-ch': ['9R2FA3A-2', '9R3FA3A-2', '10CTFA4B-2', '10LCFA4B-2', '10LSFA4B-2', '11CTFA3B-2', '11LCFA3B-2', '11LSFA3B-2', 'PRQAL02A-3'],
}
/**
 * Calculer une expression littérale simple pour de "petites" valeurs,
 * dont un peu de relatifs et de fractions simples, dans l'idée de retravailler tous les "pièges" habituels par calcul mental.
 * @author Mireille Gain
 */
export default class CalculerUneExpressionSimpleFractions extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.besoinFormulaireCaseACocher = ['Afficher tous les signes ✕']
    this.sup = false
    this.besoinFormulaire2CaseACocher = ['Avec des nombres relatifs']
    this.sup2 = false
    this.besoinFormulaire3Texte = [
      "Types d'expressions",
      `1 : x + a\n 2 : ax\n3 : -x + a\n4 : a + bx\n5 : x^2\n6 : x + a/d\n7 : Mélange`,
    ]
    this.sup3 = 7
    this.besoinFormulaire4CaseACocher = [`L'inconnue est une fraction`]
    this.sup4 = false
    this.besoinFormulaire5CaseACocher = ['Avec uniquement la lettre $x$']
    this.sup5 = false
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['x+a', 'ax', '-x+a', 'a+bx', 'x*x', 'x+a/d'],
    })
    const listeTypeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const b = randint(2, 5)
    let d = randint(4, 9) //Valeurs possibles des dénominateurs
    const k = randint(2, 5) //Multiplicande du dénominateur multiple
    const r = this.sup2
      ? choice([-1, 1]) //Possibilité de valeurs négatives
      : 1
    const alea = choice([0, 1])
    const x = this.sup4
      ? choice([1, 3, 5, 7]) * r //Numérateur nombre premier
      : randint(1, 6) * r
    const inconnue = this.sup5
      ? 'x'
      : choice(['x', 'y', 'z', 'm', 't', 'a', 'b', 'c'])
    this.consigne = this.sup4
      ? `Pour $${inconnue}=${fraction(x, b * k).texFraction}$, calculer${sp()}:`
      : `Pour $${inconnue}=${x}$, calculer${sp()}:`

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let expression = ''
      let answer: FractionEtendue
      let a = choice([3, 5, 7], d)

      if (!this.sup4) {
        switch (listeTypeQuestions[i]) {
          case 'x+a':
            if (alea === 0) {
              expression = `${inconnue} + ${a}`
              texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${ecritureParentheseSiNegatif(x)} + ${a}$<br>`
            } else {
              expression = ` ${a} + ${inconnue}`
              texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} + ${ecritureParentheseSiNegatif(x)}$<br>`
            }
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(x + a)}$`
            answer = new FractionEtendue(x + a, 1)
            break
          case 'ax':
            expression = this.sup
              ? `${a} \\times ${inconnue}`
              : `${a}${inconnue}`
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times ${ecritureParentheseSiNegatif(x)}$<br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a * x)}$`
            answer = new FractionEtendue(a * x, 1)
            break
          case '-x+a':
            if (alea === 0) {
              expression = `${-a} + ${inconnue}`
              texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${-a} + ${ecritureParentheseSiNegatif(x)}$<br>`
              texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(-a + x)}$`
              answer = new FractionEtendue(-a + x, 1)
            } else {
              expression = `-${inconnue} + ${a}`
              texteCorr = `$${lettreDepuisChiffre(i + 1)} = -${ecritureParentheseSiNegatif(x)} + ${a}$<br>`
              texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(-x + a)}$`
              answer = new FractionEtendue(-x + a, 1)
            }
            break
          case 'a+bx':
            if (alea === 0) {
              expression = this.sup
                ? `${a} + ${b} \\times ${inconnue}`
                : `${a} + ${b} ${inconnue}`
              texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} + ${b} \\times ${ecritureParentheseSiNegatif(x)}$<br>`
              texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${a} + ${ecritureParentheseSiNegatif(b * x)}$<br>`
            } else {
              expression = this.sup
                ? `${b} \\times ${inconnue} + ${a}`
                : `${b} ${inconnue} + ${a}`
              texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${b} \\times ${ecritureParentheseSiNegatif(x)} + ${a}$<br>`
              texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${ecritureParentheseSiNegatif(b * x)} + ${a}$<br>`
            }
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(a + b * x)}$`
            answer = new FractionEtendue(a + b * x, 1)
            break

          case 'x*x':
            expression = this.sup
              ? `${inconnue} \\times ${inconnue}`
              : `${inconnue}^2`
            texteCorr = this.sup
              ? `$${lettreDepuisChiffre(i + 1)} = ${x} \\times ${ecritureParentheseSiNegatif(x)}$<br>`
              : `$${lettreDepuisChiffre(i + 1)} = ${ecritureParentheseSiNegatif(x)}^2$<br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(x * x)}$<br>`
            answer = new FractionEtendue(x * x, 1)
            break
          default:
            // 'x+a/d':
            a = fraction(a, d).numIrred
            d = fraction(a, d).denIrred
            if (alea === 0) {
              expression = `${fraction(a, d).texFraction} + ${inconnue}`
              texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${fraction(a, d).texFraction} + ${x}$<br><br>`
              texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${fraction(a, d).texFraction} + ${fraction(x * d, d).texFraction}$<br><br>`
            } else {
              expression = `${inconnue} + ${fraction(a, d).texFraction}`
              texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${x} + ${fraction(a, d).texFraction}$<br><br>`
              texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${fraction(x * d, d).texFraction} + ${fraction(a, d).texFraction}$<br><br>`
            }
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(fraction(x * d + a, d).texFraction)}$`
            answer = new FractionEtendue(x * d + a, d)
            break
        }
      } else {
        switch (listeTypeQuestions[i]) {
          case 'x+a':
            expression = `${inconnue} + ${a}`
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${fraction(x, b * k).texFraction} + ${a}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${fraction(x, b * k).texFraction} + ${fraction(a * b * k, b * k).texFraction}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(fraction(x + a * b * k, b * k).texFraction)}$`
            answer = new FractionEtendue(x + a * b * k, b * k)
            break
          case 'ax':
            expression = this.sup
              ? `${a} \\times ${inconnue}`
              : `${a}${inconnue}`
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} \\times ${fraction(x, b * k).texFraction}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(fraction(a * x, b * k).texFraction)}$`
            answer = new FractionEtendue(a * x, b * k)
            break
          case '-x+a':
            expression = `-${inconnue} + ${a}`
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = -${fraction(x, b * k).texFraction} + ${a}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = -${fraction(x, b * k).texFraction} + ${fraction(a * b * k, b * k).texFraction}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(fraction(-x + a * b * k, b * k).texFraction)}$`
            answer = new FractionEtendue(-x + a * b * k, b * k)
            break
          case 'a+bx':
            expression = this.sup
              ? `${a} + ${b} \\times ${inconnue}`
              : `${a} + ${b} ${inconnue}`
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${a} + ${b} \\times ${fraction(x, b * k).texFraction}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${fraction(a * b * k, b * k).texFraction} + ${fraction(b * x, b * k).texFraction}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(fraction(a * b * k + b * x, b * k).texFraction)}$`
            answer = new FractionEtendue(a * b * k + b * x, b * k)
            break
          case 'x*x':
            expression = this.sup
              ? `${inconnue} \\times ${inconnue}`
              : `${inconnue}^2`
            texteCorr = this.sup
              ? `$${lettreDepuisChiffre(i + 1)} = ${x} \\times ${ecritureParentheseSiNegatif(x)}$<br>`
              : `$${lettreDepuisChiffre(i + 1)} = ${ecritureParentheseSiNegatif(x)}^2$<br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(x * x)}$<br>`
            answer = new FractionEtendue(x * x, 1)
            break
          default:
            // 'x+a/b':
            expression = `${inconnue} + ${fraction(a, b).texFraction}`
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${fraction(x, b * k).texFraction} + ${fraction(a, b).texFraction}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${fraction(x, b * k).texFraction} + ${fraction(a * k, b * k).texFraction}$<br><br>`
            texteCorr += `$${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(fraction(x + a * k, b * k).texFraction)}$`
            answer = new FractionEtendue(x + a * k, b * k)
            break
        }
      }
      texte = `$${lettreDepuisChiffre(i + 1)} = ${expression}$`
      if (this.interactif) {
        texte += `<br>$${lettreDepuisChiffre(i + 1)} = $`
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
        )
        handleAnswers(this, i, {
          reponse: {
            value: answer.simplifie().texFSD,
            options: { fractionEgale: true, nombreDecimalSeulement: true },
          },
        })
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
