import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const dateDePublication = '02/05/2023'
export const titre = 'Résoudre des équations avec un quotient'

/**
 * Mettre au même dénominateur des expressions littérales
 * @author Gilles Mora
 * 2L11-8
 */
export const uuid = 'b5828'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ResoudreEquationsQuotient extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Type d'équations",
      3,
      '1 : A(x)/B(x)=0\n 2 : A(x)/B(x)=a ou a/A(x)=b/B(x)\n 3 : Mélange',
    ]

    this.nbQuestions = 2
    this.sup = 3
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1, 2]
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [3, 4]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4]
    } // 1, 2, 3, 4, 5, 6, 7

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a: number
      let b: number
      let c: number
      let d: number
      let k1: number
      let k2: number
      let choix: boolean
      let e: number
      let f: number
      const typesDeQuestions = listeTypeDeQuestions[i]
      const consigne1 =
        "Préciser les valeurs interdites éventuelles, puis résoudre l'équation : "
      let ensValeursInterdites: string
      let ensSolutions: string
      let valInterdite: FractionEtendue
      let valInterdite2: FractionEtendue
      let valSolution: FractionEtendue
      switch (typesDeQuestions) {
        case 1: // (ax+b)/(cx+d)=0
          a = randint(-3, 9, 0)
          b = randint(-9, 9)
          c = randint(-9, 9, 0)
          d = randint(-9, 9)
          while (a * d - b * c === 0) {
            a = randint(-3, 9, 0)
            b = randint(-9, 9)
            c = randint(-9, 9, 0)
            d = randint(-9, 9)
          }
          choix = choice([true, false])
          texte = consigne1
          if (b === 0) {
            texte += `$\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}=0$.`
          } else {
            texte += `${choix ? `$\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}=0$` : `$\\dfrac{${b}${ecritureAlgebriqueSauf1(a)}x}{${reduireAxPlusB(c, d)}}=0$`}.`
          }
          if (context.isDiaporama) {
            texteCorr = ''
          } else {
            if (b === 0) {
              texteCorr =
                "Déterminer les valeurs interdites revient à déterminer les valeurs qui annulent le dénominateur du quotient, puisque la division par $0$ n'existe pas.<br>"
            } else {
              texteCorr =
                "Déterminer les valeurs interdites revient à déterminer les valeurs qui annulent le dénominateur du quotient, puisque la division par $0$ n'existe pas.<br>"
            }
          }
          // Constantes utiles
          valInterdite = new FractionEtendue(-d, c)
          valSolution = new FractionEtendue(-b, a)
          ensValeursInterdites = `\\left\\{${valInterdite.texFractionSimplifiee}\\right\\}`
          ensSolutions = `\\left\\{${valSolution.texFractionSimplifiee}\\right\\}`

          texteCorr += `Or $${reduireAxPlusB(c, d)}=0$ si et seulement si  $x=${valInterdite.texFractionSimplifiee}$. <br>
          Donc l'ensemble des valeurs interdites est  $${ensValeursInterdites}$. <br>`
          if (b === 0) {
            texteCorr += `Pour tout $x\\in \\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFractionSimplifiee}\\right\\}$, <br>
 $\\begin{aligned}
 \\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}&=0 \\\\
 ${reduireAxPlusB(a, b)}&=0 ${sp(7)} \\text{ car }\\dfrac{A(x)}{B(x)}=0 \\text{ si et seulement si } A(x)=0 \\text{ et } B(x)\\neq 0\\\\
x&= ${valSolution.texFractionSimplifiee}
\\end{aligned}$<br>`
          } else {
            texteCorr += `Pour tout $x\\in \\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFractionSimplifiee}\\right\\}$,<br>
 $\\begin{aligned}
 ${choix ? `\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}&=0` : `\\dfrac{${b}${ecritureAlgebriqueSauf1(a)}x}{${reduireAxPlusB(c, d)}}&=0`}\\\\
 ${choix ? `${reduireAxPlusB(a, b)}&=0` : `${b}${ecritureAlgebriqueSauf1(a)}x&=0`}${sp(7)} \\text{ car }\\dfrac{A(x)}{B(x)}=0 \\text{ si et seulement si } A(x)=0 \\text{ et } B(x)\\neq 0\\\\
x&= ${valSolution.texFractionSimplifiee}
\\end{aligned}$<br>`
          }

          texteCorr += ` $${valSolution.texFractionSimplifiee}$ n'est pas une valeur interdite, donc l'ensemble des solutions de cette équation est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.`
          break
        case 2: // (ax^2+/-b)/(cx+d)=0
          a = randint(1, 4)
          k1 = randint(1, 10)
          b = a * k1 * k1
          c = randint(-9, 9, 0)
          k2 = randint(-4, 4, 0)
          d = c * k2

          choix = choice([true, false])
          texte = consigne1
          // WARN: c'est quoi cette condition alors qu'on déclare choix juste au-dessus ?
          if (choice([true, false])) {
            texte += `${choix ? `$\\dfrac{${rienSi1(a)}x^2-${b}}{${reduireAxPlusB(c, d)}}=0$` : `$\\dfrac{${b}-${rienSi1(a)}x^2}{${reduireAxPlusB(c, d)}}=0$`}.`
            if (context.isDiaporama) {
              texteCorr = ''
            } else {
              texteCorr =
                "Déterminer les valeurs interdites revient à déterminer les valeurs qui annulent le dénominateur du quotient, puisque la division par $0$ n'existe pas.<br>"
            }
            // Constantes utiles
            valInterdite = new FractionEtendue(-k2, 1)
            ensValeursInterdites = `\\left\\{${valInterdite.texFractionSimplifiee}\\right\\}`

            texteCorr += `Or $${reduireAxPlusB(c, d)}=0$ si et seulement si  $x=${valInterdite.texFractionSimplifiee}$. <br>
          Donc l'ensemble des valeurs interdites est  $${ensValeursInterdites}$.<br>
          Pour tout $x\\in \\mathbb{R}\\smallsetminus${ensValeursInterdites}$, <br>
            $\\begin{aligned}
            ${choix ? `\\dfrac{${rienSi1(a)}x^2-${b}}{${reduireAxPlusB(c, d)}}&=0` : `\\dfrac{${b}-${rienSi1(a)}x^2}{${reduireAxPlusB(c, d)}}&=0`}\\\\
            ${choix ? `${rienSi1(a)}x^2-${b}&=0` : `${b}-${rienSi1(a)}x^2&=0`}${sp(7)} \\text{ car }\\dfrac{A(x)}{B(x)}=0 \\text{ si et seulement si } A(x)=0 \\text{ et } B(x)\\neq 0\\\\
            ${rienSi1(a)}x^2&=${b}\\\\
            x^2&=${k1 * k1}\\\\
           x= ${k1}&\\text{ ou } x= -${k1}
           \\end{aligned}$<br>
           `
            if (-k2 === k1 || k2 === k1) {
              if (-k2 === k1) {
                ensSolutions = `\\left\\{${-k1}\\right\\}`
                texteCorr += `  $${k1}$ est une valeur interdite, donc l'ensemble des solutions de cette équation est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.
        `
              } else {
                ensSolutions = `\\left\\{${k1}\\right\\}`
                texteCorr += `  $${-k1}$ est une valeur interdite, donc l'ensemble des solutions de cette équation est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.
        `
              }
            } else {
              ensSolutions = `\\left\\{${-k1}\\,;\\,${k1}\\right\\}`
              texteCorr += `  $${-k1}$ et $${k1}$ ne sont pas des valeurs interdites, donc l'ensemble des solutions de cette équation est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.
        `
            }
          } else {
            texte += `${choix ? `$\\dfrac{${rienSi1(a)}x^2+${b}}{${reduireAxPlusB(c, d)}}=0$` : `$\\dfrac{${b}+${rienSi1(a)}x^2}{${reduireAxPlusB(c, d)}}=0$`}.`
            if (context.isDiaporama) {
              texteCorr = ''
            } else {
              texteCorr =
                "Déterminer les valeurs interdites revient à déterminer les valeurs qui annulent le dénominateur du quotient, puisque la division par $0$ n'existe pas.<br>"
            }
            // Constantes utiles
            ensValeursInterdites = `\\left\\{${-k2}\\right\\}`
            ensSolutions = '\\emptyset'

            texteCorr += `Or $${reduireAxPlusB(c, d)}=0$ si et seulement si  $x=${-k2}$. <br>
Donc l'ensemble des valeurs interdites est  $${ensValeursInterdites}$.<br>
Pour tout $x\\in \\mathbb{R}\\smallsetminus${ensValeursInterdites}$, <br>
  $\\begin{aligned}
  ${choix ? `\\dfrac{${rienSi1(a)}x^2+${b}}{${reduireAxPlusB(c, d)}}&=0` : `\\dfrac{${b}+${rienSi1(a)}x^2}{${reduireAxPlusB(c, d)}}&=0`}\\\\
  ${choix ? `${rienSi1(a)}x^2+${b}&=0` : `${b}+${rienSi1(a)}x^2&=0`}${sp(7)} \\text{ car }\\dfrac{A(x)}{B(x)}=0 \\text{ si et seulement si } A(x)=0 \\text{ et } B(x)\\neq 0\\\\
  ${rienSi1(a)}x^2&=-${b}\\\\
  x^2&=-${k1 * k1}
 \\end{aligned}$<br>
 `
            texteCorr += `Puisque $-${k1 * k1}<0$, cette équation n'a pas de solution, donc l'ensemble des solutions est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.`
          }

          break
        case 3: // (ax+b)/(cx+d)=e
          a = randint(-3, 5, 0)
          b = randint(-9, 9)
          c = randint(-9, 9, 0)
          d = randint(-9, 9)
          e = randint(-9, 9, 0)
          while (a * d - b * c === 0 || a - e * c === 0) {
            a = randint(-3, 5)
            b = randint(-9, 9)
            c = randint(-9, 9, 0)
            d = randint(-9, 9)
            e = randint(-9, 9, 0)
          }
          choix = choice([true, false])
          texte = consigne1
          if (b === 0) {
            texte += `$\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}=${e}$.`
          } else {
            texte += `${choix ? `$\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}=${e}$` : `$\\dfrac{${b}${ecritureAlgebriqueSauf1(a)}x}{${reduireAxPlusB(c, d)}}=${e}$`}.`
          }
          if (context.isDiaporama) {
            texteCorr = ''
          } else {
            texteCorr =
              "Déterminer les valeurs interdites revient à déterminer les valeurs qui annulent le dénominateur du quotient, puisque la division par $0$ n'existe pas.<br>"
          }
          valInterdite = new FractionEtendue(-d, c)
          ensValeursInterdites = `\\left\\{${valInterdite.texFractionSimplifiee}\\right\\}`
          valSolution = new FractionEtendue(e * d - b, a - e * c)
          texteCorr += `Or $${reduireAxPlusB(c, d)}=0$ si et seulement si  $x=${valInterdite.texFractionSimplifiee}$. <br>
          Donc l'ensemble des valeurs interdites est  $${ensValeursInterdites}$. <br>
          Pour tout $x\\in \\mathbb{R}\\smallsetminus${ensValeursInterdites}$,<br>`
          if (b === 0) {
            texteCorr += `
            $\\begin{aligned}
            \\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}&=${e}\\\\
            ${reduireAxPlusB(a, b)}&=${e}\\times(${reduireAxPlusB(c, d)})${sp(7)} \\text{ car les produits en croix sont égaux.}\\\\
            ${reduireAxPlusB(a, b)}&= ${reduireAxPlusB(e * c, e * d)}\\\\
           ${rienSi1(a - e * c)}x&= ${e * d - b} ${a - e * c === 1 ? '' : '\\\\'}
          ${a - e * c === 1 ? '' : `x&=${valSolution.texFractionSimplifiee}`} 
           \\end{aligned}$<br>`
          } else {
            texteCorr += `
            $\\begin{aligned}
           ${choix ? `\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}&=${e}` : `\\dfrac{${b}${ecritureAlgebriqueSauf1(a)}x}{${reduireAxPlusB(c, d)}}&=${e}`}\\\\
            ${choix ? `${reduireAxPlusB(a, b)}&=${e}\\times(${reduireAxPlusB(c, d)})` : `${b}${ecritureAlgebriqueSauf1(a)}x&=${e}\\times(${reduireAxPlusB(c, d)})`}${sp(7)}\\text{ car les produits en croix sont égaux.}\\\\
            ${reduireAxPlusB(a, b)}&= ${reduireAxPlusB(e * c, e * d)}\\\\
            ${rienSi1(a - e * c)}x&= ${e * d - b}\\\\
           x&=${valSolution.texFractionSimplifiee}
           \\end{aligned}$<br>`
          }

          if (-d * (a - e * c) - c * (e * d - b) === 0) {
            ensSolutions = '\\emptyset'
            texteCorr += `$${valSolution.texFractionSimplifiee}$ est  une valeur interdite, donc l'ensemble des solutions de cette équation est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.`
          } else {
            ensSolutions = `\\left\\{${valSolution.texFractionSimplifiee}\\right\\}`
            texteCorr += `$${valSolution.texFractionSimplifiee}$ n'est pas une valeur interdite, donc l'ensemble des solutions de cette équation est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.`
          }
          break

        case 4: // e/(ax+b)=f/(cx+d)
        default:
          a = randint(-3, 9, 0)
          b = randint(-9, 9)
          c = randint(-2, 9, [0, a])
          d = randint(-9, 9)
          e = randint(-9, 9, 0)
          f = randint(-9, 9, 0)
          while (
            c * (f * b - a * d) === -d * (e * c - f * a) ||
            a * (f * b - a * d) === -b * (e * c - f * a)
          ) {
            // pas de VI sol enfin normalement :-)
            a = randint(-3, 9, 0)
            b = randint(-9, 9)
            c = randint(-2, 9, [0, a])
            d = randint(-9, 9)
            e = randint(-9, 9, 0)
            f = randint(-9, 9, 0)
          }

          if (e * c - f * a === 0) {
            e = e + 10
          }
          choix = choice([true, false])
          texte = consigne1
          texte += `$\\dfrac{${e}}{${reduireAxPlusB(a, b)}}=\\dfrac{${f}}{${reduireAxPlusB(c, d)}}$.`
          if (context.isDiaporama) {
            texteCorr = ''
          } else {
            texteCorr =
              "Déterminer les valeurs interdites revient à déterminer les valeurs qui annulent les dénominateurs des quotients, puisque la division par $0$ n'existe pas.<br>"
          }
          valInterdite = new FractionEtendue(-d, c)
          valInterdite2 = new FractionEtendue(-b, a)
          valSolution = new FractionEtendue(-e * d + f * b, e * c - f * a)
          if (-a * d + b * c === 0) {
            ensValeursInterdites = `\\left\\{${valInterdite.texFractionSimplifiee}\\right\\}`
          } else {
            // on ordonne les valeurs interdites par ordre croissant
            if (-d / c < -b / a) {
              ensValeursInterdites = `\\left\\{${valInterdite.texFractionSimplifiee}\\,;\\,${valInterdite2.texFractionSimplifiee} \\right\\}`
            } else {
              ensValeursInterdites = `\\left\\{${valInterdite2.texFractionSimplifiee} \\, ; \\,${valInterdite.texFractionSimplifiee}\\right\\}`
            }
          }
          texteCorr += `Or $${reduireAxPlusB(a, b)}=0$ si et seulement si  $x = ${valInterdite2.texFractionSimplifiee}$ et $${reduireAxPlusB(c, d)}=0$ si et seulement si  $x = ${valInterdite.texFractionSimplifiee} $. <br>Donc l'ensemble des valeurs interdites est $${ensValeursInterdites}$. <br>`

          texteCorr += `Pour tout $x\\in \\mathbb{R}\\smallsetminus ${ensValeursInterdites}$,<br>
 $\\begin{aligned}
 \\dfrac{${e}}{${reduireAxPlusB(a, b)}}&=\\dfrac{${f}}{${reduireAxPlusB(c, d)}}\\\\
 ${f}\\times (${reduireAxPlusB(a, b)})&=${e}\\times (${reduireAxPlusB(c, d)})${sp(7)} \\text{ car les produits en croix sont égaux.}\\\\
 ${reduireAxPlusB(f * a, f * b)}&=${reduireAxPlusB(e * c, e * d)}\\\\
${rienSi1(-e * c + f * a)}x&= ${e * d - f * b}${-e * c + f * a === 1 ? '' : '\\\\'}
          ${-e * c + f * a === 1 ? '' : `x&=${valSolution.texFractionSimplifiee}`} 
\\end{aligned}$<br>`

          if (-b * (e * c - f * a) === a * (-e * d + f * b)) {
            ensSolutions = '\\emptyset'
            texteCorr += ` $${valSolution.texFractionSimplifiee}$ est  une valeur interdite, donc l'ensemble des solutions de cette équation est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.`
          } else {
            ensSolutions = `\\left\\{${valSolution.texFractionSimplifiee}\\right\\}`
            texteCorr += ` $${valSolution.texFractionSimplifiee}$ n'est pas une valeur interdite, donc l'ensemble des solutions de cette équation est  $${miseEnEvidence(`\\mathscr{S}=${ensSolutions}`)}$.`
          }
          break
      }
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          2 * i,
          KeyboardType.clavierEnsemble,
          { texteAvant: '<br>Ensemble des valeurs interdites : ' },
        )
        texte += ajouteChampTexteMathLive(
          this,
          2 * i + 1,
          KeyboardType.clavierEnsemble,
          { texteAvant: '<br>Ensemble des solutions : ' },
        )
      }
      handleAnswers(this, 2 * i, {
        reponse: {
          value: ensValeursInterdites,
          options: { ensembleDeNombres: true },
        },
      })
      handleAnswers(this, 2 * i + 1, {
        reponse: {
          value: ensSolutions,
          options: { ensembleDeNombres: true },
        },
      })
      if (this.questionJamaisPosee(i, a, b, c, d)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
