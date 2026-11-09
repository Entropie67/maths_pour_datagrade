import Decimal from 'decimal.js'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnCouleur, miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Factoriser avec $a^2-b^2$'
export const uuid = '47f20'
export const interactifReady = true

export const dateDeModifImportante = '17/02/2026'
export const refs = {
  'fr-fr': ['2L12-8', 'BP1AUTO086'],
  'fr-ch': ['11LSFA3I-3'],
}
/**
 * @author Gilles Mora
 */
export default class factorisationDifferenceCarres extends Exercice {
  constructor() {
    super()
    this.sup = 11
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : x²-a²',
        '2 : x²-a',
        '3 : a²x²-b²',
        '4 : a²x²-b²',
        '5 : x/a²-b²',
        '6 : a²x²-b² avec a en fraction',
        '7 : ax²-b² avec des décimaux',
        '8 : (ax+b)²-c²',
        '9 : (ax+b)²-(cx+d)²',
        '10 : e²(ax+b)²-f²(cx+d)²',
        '11 : Mélange',
      ].join('\n'),
    ]
    this.comment =
      "Une factorisation sera acceptée si chaque facteur est de degré inférieur au degré de l'expression initiale."
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 10,
      melange: 11,
      defaut: 11,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.consigne =
        this.nbQuestions > 1
          ? 'Factoriser les expressions suivantes.'
          : "Factoriser l'expression suivante."

      let texte = ''
      let texteCorr = ''
      const texteEgaliteR = `On utilise l'égalité remarquable $${miseEnCouleur('a', 'red')}^2-${miseEnCouleur('b', bleuMathalea)}^2=(${miseEnCouleur('a', 'red')}-${miseEnCouleur('b', bleuMathalea)})(${miseEnCouleur('a', 'red')}+${miseEnCouleur('b', bleuMathalea)})$ avec `
      const choix = choice([true, false])

      switch (listeTypeDeQuestions[i]) {
        case 1: // x^2-a^2
          {
            const a = randint(1, 15)
            texte = `${choix ? `$x^2-${a * a}$` : `$${a * a}-x^2$`}`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `${choix ? `$a=${miseEnCouleur('x', 'red')}$  et $b=${miseEnCouleur(`${a}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`${a}`, 'red')}$ et $b=${miseEnCouleur('x', bleuMathalea)}$`}.<br>`
              if (choix === true) {
                texteCorr += `$\\begin{aligned}
         x^2-${a * a}&=\\underbrace{${miseEnCouleur('x', 'red')}^2-${miseEnCouleur(`${a}`, bleuMathalea)}^2}_{a^2-b^2}\\\\
         &=\\underbrace{(${miseEnCouleur('x', 'red')}-${miseEnCouleur(`${a}`, bleuMathalea)})(${miseEnCouleur('x', 'red')}+${miseEnCouleur(`${a}`, bleuMathalea)})}_{(a-b)(a+b)}
         \\end{aligned}$ `
              } else {
                texteCorr += `$\\begin{aligned}
          ${a * a}-x^2&=\\underbrace{${miseEnCouleur(`${a}`, 'red')}^2-${miseEnCouleur('x', bleuMathalea)}^2}_{a^2-b^2}\\\\
          &=\\underbrace{(${miseEnCouleur(`${a}`, 'red')}-${miseEnCouleur('x', bleuMathalea)})(${miseEnCouleur(`${a}`, 'red')}+${miseEnCouleur('x', bleuMathalea)})}_{(a-b)(a+b)}
          \\end{aligned}$ `
              }
            } else {
              if (choix === true) {
                texteCorr = `$x^2-${a * a}=(x-${a})(x+${a})`
              } else {
                texteCorr += `$${a * a}-x^2=(${a}-x)(${a}+x)`
              }
            }

            handleAnswers(this, i, {
              reponse: {
                value: choix
                  ? `(${reduireAxPlusB(1, -a)})(${reduireAxPlusB(1, a)})`
                  : `(${reduireAxPlusB(1, a)})(${reduireAxPlusB(-1, a)})`,
                options: { exclusifFactorisation: true },
              },
            })
          }
          break

        case 2: // x^2-a
          {
            const a = randint(2, 30, [4, 9, 16, 25])
            texte = `${choix ? `$x^2-${a}$` : `$${a}-x^2$`}`
            // texte += choix ? `(x-\\sqrt{${a}})(x+\\sqrt{${a}})` : `(\\sqrt{${a}}-x)(\\sqrt{${a}}+x)`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `${choix ? `$a=${miseEnCouleur('x', 'red')}$  et $b=${miseEnCouleur(`\\sqrt{${a}}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`\\sqrt{${a}}`, 'red')}$  et $b=${miseEnCouleur('x', bleuMathalea)}$`}.<br>`
              if (choix === true) {
                texteCorr += `$\\begin{aligned}
         x^2-${a}&=\\underbrace{${miseEnCouleur('x', 'red')}^2-(${miseEnCouleur(`\\sqrt{${a}}`, bleuMathalea)})^2}_{a^2-b^2}\\\\
         &=\\underbrace{(${miseEnCouleur('x', 'red')}-${miseEnCouleur(`\\sqrt{${a}}`, bleuMathalea)})(${miseEnCouleur('x', 'red')}+${miseEnCouleur(`\\sqrt{${a}}`, bleuMathalea)})}_{(a-b)(a+b)}
         \\end{aligned}$ `
              } else {
                texteCorr += `$\\begin{aligned}
          ${a}-x^2&=\\underbrace{(${miseEnCouleur(`\\sqrt{${a}}`, 'red')})^2-x^2}_{a^2-b^2}\\\\
          &=\\underbrace{(${miseEnCouleur(`\\sqrt{${a}}`, 'red')}-${miseEnCouleur('x', bleuMathalea)})(${miseEnCouleur(`\\sqrt{${a}}`, 'red')}+${miseEnCouleur('x', bleuMathalea)})}_{(a-b)(a+b)}
          \\end{aligned}$ `
              }
            } else {
              if (choix === true) {
                texteCorr = `$x^2-${a}=(x-\\sqrt{${a}})(x+\\sqrt{${a}})`
              } else {
                texteCorr += `$${a}-x^2=(\\sqrt{${a}}-x)(\\sqrt{${a}}+x)`
              }
            }

            handleAnswers(this, i, {
              reponse: {
                value: choix
                  ? `(x-\\sqrt{${a}})(x+\\sqrt{${a}})`
                  : `(\\sqrt{${a}}-x)(\\sqrt{${a}}+x)`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break
        case 3: // a²x^2-b^2)
          {
            const a = randint(2, 15)
            const b = randint(1, 15)
            texte = `${choix ? `$${a * a}x^2-${b * b}$` : `$${b * b}-${a * a}x^2$`}`
            // texte+=`$(${reduireAxPlusB(-a, b)})(${reduireAxPlusB(a, b)})$`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `${choix ? `$a=${miseEnCouleur(`${a}x`, 'red')}$  et $b=${miseEnCouleur(`${b}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`${b}`, 'red')}$  et $b=${miseEnCouleur(`${a}x`, bleuMathalea)}$`}.<br>`
              if (choix === true) {
                texteCorr += `$\\begin{aligned}
       ${a * a}x^2-${b * b}&=\\underbrace{(${miseEnCouleur(`${a}x`, 'red')})^2-${miseEnCouleur(`${b}`, bleuMathalea)}^2}_{a^2-b^2}\\\\
       &=\\underbrace{(${miseEnCouleur(`${a}x`, 'red')}-${miseEnCouleur(`${b}`, bleuMathalea)})(${miseEnCouleur(`${a}x`, 'red')}+${miseEnCouleur(`${b}`, bleuMathalea)})}_{(a-b)(a+b)}
       \\end{aligned}$ `
              } else {
                texteCorr += `$\\begin{aligned}
        ${b * b}-${a * a}x^2&=\\underbrace{${miseEnCouleur(`${b}`, 'red')}^2-(${miseEnCouleur(`${a}x`, bleuMathalea)})^2}_{a^2-b^2}\\\\
        &=\\underbrace{(${miseEnCouleur(`${b}`, 'red')}-${miseEnCouleur(`${a}x`, bleuMathalea)})(${miseEnCouleur(`${b}`, 'red')}+${miseEnCouleur(`${a}x`, bleuMathalea)})}_{(a-b)(a+b)}
        \\end{aligned}$ `
              }
            } else {
              if (choix === true) {
                texteCorr = `$${a * a}x^2-${b * b}=(${a}x-${b})(${a}x+${b})`
              } else {
                texteCorr += `$${b * b}-${a * a}x^2=(${b}-${a}x)(${b}+${a}x)`
              }
            }

            handleAnswers(this, i, {
              reponse: {
                value: choix
                  ? `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, -b)})`
                  : `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(-a, b)})`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break

        case 4: // ax^2-b^2
          {
            const a = randint(2, 23, [4, 9, 16])
            const b = randint(1, 10)
            texte = `${choix ? `$${a}x^2-${b * b}$` : `$${b * b}-${a}x^2$`}`
            // texte+=`$(${reduireAxPlusB(-a, b)})(${reduireAxPlusB(a, b)})$`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `${choix ? `$a=${miseEnCouleur(`\\sqrt{${a}}x`, 'red')}$  et $b=${miseEnCouleur(`${b}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`${b}`, 'red')}$  et $b=${miseEnCouleur(`\\sqrt{${a}}x`, bleuMathalea)}$`}.<br>`
              if (choix === true) {
                texteCorr += `$\\begin{aligned}
       ${a}x^2-${b * b}&=\\underbrace{(${miseEnCouleur(`\\sqrt{${a}}x`, 'red')})^2-${miseEnCouleur(`${b}`, bleuMathalea)}^2}_{a^2-b^2}\\\\
       &=\\underbrace{(${miseEnCouleur(`\\sqrt{${a}}x`, 'red')}-${miseEnCouleur(`${b}`, bleuMathalea)})(${miseEnCouleur(`\\sqrt{${a}}x`, 'red')}+${miseEnCouleur(`${b}`, bleuMathalea)})}_{(a-b)(a+b)}
       \\end{aligned}$ `
              } else {
                texteCorr += `$\\begin{aligned}
        ${b * b}-${a}x^2&=\\underbrace{${miseEnCouleur(`${b}`, 'red')}^2-(\\sqrt{${a}}x)^2}_{a^2-b^2}\\\\
        &=\\underbrace{(${miseEnCouleur(`${b}`, 'red')}-${miseEnCouleur(`\\sqrt{${a}}x`, bleuMathalea)})(${miseEnCouleur(`${b}`, 'red')}+${miseEnCouleur(`\\sqrt{${a}}x`, bleuMathalea)})}_{(a-b)(a+b)}
        \\end{aligned}$ `
              }
            } else {
              if (choix === true) {
                texteCorr = `$${a}x^2-${b * b}=(\\sqrt{${a}}x-${b})(\\sqrt{${a}}x+${b})`
              } else {
                texteCorr += `$${b * b}-${a}x^2=(${b}-\\sqrt{${a}}x)(${b}+\\sqrt{${a}}x)`
              }
            }

            handleAnswers(this, i, {
              reponse: {
                value: choix
                  ? `(\\sqrt{${a}}x-${b})(\\sqrt{${a}}x+${b})`
                  : `(${b}-\\sqrt{${a}}x)(${b}+\\sqrt{${a}}x)`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break

        case 5: // x/a^2-b^2
          {
            const a = randint(2, 10)
            const b = randint(1, 10)
            texte = `${choix ? `$\\dfrac{x^2}{${a * a}}-${b * b}$` : `$${b * b}-\\dfrac{x^2}{${a * a}}$`}`
            // texte+=`$(${reduireAxPlusB(-a, b)})(${reduireAxPlusB(a, b)})$`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `${choix ? `$a=${miseEnCouleur(`\\dfrac{x}{${a}}`, 'red')}$  et $b=${miseEnCouleur(`${b}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`${b}`, 'red')}$  et $b=${miseEnCouleur(`\\dfrac{x}{${a}}`, bleuMathalea)}$`}.<br>`
              if (choix === true) {
                texteCorr += `$\\begin{aligned}
      \\dfrac{x^2}{${a * a}}-${b * b}&=\\underbrace{\\left(${miseEnCouleur(`\\dfrac{x}{${a}}`, 'red')}\\right)^2-${miseEnCouleur(`${b}`, bleuMathalea)}^2}_{a^2-b^2}\\\\
       &=\\underbrace{\\left(${miseEnCouleur(`\\dfrac{x}{${a}}`, 'red')}-${miseEnCouleur(`${b}`, bleuMathalea)}\\right)\\left(${miseEnCouleur(`\\dfrac{x}{${a}}`, 'red')}+${miseEnCouleur(`${b}`, bleuMathalea)}\\right)}_{(a-b)(a+b)}
       \\end{aligned}$ `
              } else {
                texteCorr += `$\\begin{aligned}
        ${b * b}- \\dfrac{x^2}{${a * a}}&=\\underbrace{${miseEnCouleur(`${b}`, 'red')}^2-\\left(${miseEnCouleur(`\\dfrac{x}{${a}}`, bleuMathalea)}\\right)^2}_{a^2-b^2}\\\\
        &=\\underbrace{\\left(${miseEnCouleur(`${b}`, 'red')}-${miseEnCouleur(`\\dfrac{x}{${a}}`, bleuMathalea)}\\right)\\left(${miseEnCouleur(`${b}`, 'red')}+${miseEnCouleur(`\\dfrac{x}{${a}}`, bleuMathalea)}\\right)}_{(a-b)(a+b)}
        \\end{aligned}$ `
              }
            } else {
              if (choix === true) {
                texteCorr = `$${a}x^2-${b * b}=\\left(\\dfrac{x}{${a}}-${b}\\right)\\left(\\dfrac{x}{${a}}+${b}\\right)`
              } else {
                texteCorr += `$${b * b}-${a}x^2=\\left(${b}-\\dfrac{x}{${a}}\\right)\\left((${b}+\\dfrac{x}{${a}}\\right)`
              }
            }

            handleAnswers(this, i, {
              reponse: {
                value: choix
                  ? `(\\dfrac{x}{${a}}-${b})(\\dfrac{x}{${a}}+${b})`
                  : `(${b}-\\dfrac{x}{${a}})(${b}+\\dfrac{x}{${a}})`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break

        case 6: // ax^2-b^2 avec a fraction
          {
            const Fractions = [
              [1, 2],
              [1, 3],
              [2, 3],
              [1, 4],
              [3, 4],
              [1, 5],
              [2, 5],
              [3, 5],
              [4, 5],
              [1, 6],
              [5, 6],
              [1, 7],
              [2, 7],
              [3, 7],
              [4, 7],
              [5, 7],
              [6, 7],
              [1, 8],
              [3, 8],
              [5, 8],
              [7, 8],
              [1, 9],
              [2, 9],
              [3, 10],
              [7, 10],
              [9, 10],
              [4, 9],
              [5, 9],
              [7, 9],
              [8, 9],
              [1, 10],
            ]
            const uneFraction = choice(Fractions)
            const ns = uneFraction[0]
            const ds = uneFraction[1]
            const dfrac = fraction(ns, ds)
            const dfrac2 = fraction(ns * ns, ds * ds)
            const b = randint(1, 15)
            texte = `${choix ? `$${dfrac2.texFraction}x^2-${b * b}$` : `$${b * b}-${dfrac2.texFraction}x^2$`}`
            // texte+=choix ? `(${reduireAxPlusB(dfrac, b)})(${reduireAxPlusB(dfrac, -b)})` : `(${reduireAxPlusB(dfrac, b)})(${reduireAxPlusB(dfrac.oppose(), b)})`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `${choix ? `$a=${miseEnCouleur(`${dfrac.texFraction}x`, 'red')}$  et $b=${miseEnCouleur(`${b}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`${b}`, 'red')}$  et $b=${miseEnCouleur(`${dfrac.texFraction}x`, bleuMathalea)}$`}.<br>`
              if (choix === true) {
                texteCorr += `$\\begin{aligned}
       ${dfrac2.texFraction}x^2-${b * b}&=\\underbrace{\\left(${miseEnCouleur(`${dfrac.texFraction}x`, 'red')}\\right)^2-${miseEnCouleur(`${b}`, bleuMathalea)}^2}_{a^2-b^2}\\\\
       &=\\underbrace{\\left(${miseEnCouleur(`${dfrac.texFraction}x`, 'red')}-${miseEnCouleur(`${b}`, bleuMathalea)}\\right)\\left(${miseEnCouleur(`${dfrac.texFraction}x`, 'red')}+${miseEnCouleur(`${b}`, bleuMathalea)}\\right)}_{(a-b)(a+b)}
       \\end{aligned}$ `
              } else {
                texteCorr += `$\\begin{aligned}
        ${b * b}-${dfrac2.texFraction}x^2&=\\underbrace{${miseEnCouleur(`${b}`, 'red')}^2-\\left(${miseEnCouleur(`${dfrac.texFraction}x`, bleuMathalea)}\\right)^2}_{a^2-b^2}\\\\
        &=\\underbrace{\\left(${miseEnCouleur(`${b}`, 'red')}-${miseEnCouleur(`${dfrac.texFraction}x`, bleuMathalea)}\\right)\\left(${miseEnCouleur(`${b}`, 'red')}+${miseEnCouleur(`${dfrac.texFraction}x`, bleuMathalea)}\\right)}_{(a-b)(a+b)}
        \\end{aligned}$ `
              }
            } else {
              if (choix === true) {
                texteCorr = `$${dfrac2.texFraction}x^2-${b * b}=(${dfrac.texFraction}x-${b})(${dfrac.texFraction}x+${b})`
              } else {
                texteCorr += `$${b * b}-x^2=\\left(${b}-${dfrac.texFraction}x\\right)\\left(${b}+${dfrac.texFraction}x\\right)`
              }
            }

            handleAnswers(this, i, {
              reponse: {
                value: choix
                  ? `(${reduireAxPlusB(dfrac, b)})(${reduireAxPlusB(dfrac, -b)})`
                  : `(${reduireAxPlusB(dfrac, b)})(${reduireAxPlusB(-dfrac, b)})`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break
        case 7:
          {
            // ax^2-b^2 avec décimaux
            const a = new Decimal(randint(1, 19, 10)).div(10)
            const b = new Decimal(randint(1, 19, 10)).div(10)
            const facteur1 = reduireAxPlusB(a, b)
            const facteur2 = reduireAxPlusB(a, b.mul(-1))
            texte = `${choix ? `$${texNombre(new Decimal(a.mul(a)), 2)}x^2-${texNombre(new Decimal(b.mul(b)), 2)}$` : `$${texNombre(new Decimal(b.mul(b)), 2)}-${texNombre(new Decimal(a.mul(a)), 2)}x^2$`}`
            // texte += `<br>$(${facteur1})(${facteur2})$`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `${choix ? `$a=${miseEnCouleur(`${texNombre(a, 2)}x`, 'red')}$  et $b=${miseEnCouleur(`${texNombre(b, 2)}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`${texNombre(b, 2)}`, 'red')}$  et $b=${miseEnCouleur(`${texNombre(a, 2)}x`, bleuMathalea)}$`}.<br>`
              if (choix === true) {
                texteCorr += `$\\begin{aligned}
     ${texNombre(new Decimal(a.mul(a)), 2)}x^2-${texNombre(new Decimal(b.mul(b)), 2)}&=\\underbrace{(${miseEnCouleur(`${texNombre(a, 2)}x`, 'red')})^2-(${miseEnCouleur(`${texNombre(b, 2)}`, bleuMathalea)})^2}_{a^2-b^2}\\\\
     &=\\underbrace{(${miseEnCouleur(`${texNombre(a, 2)}x`, 'red')}-${miseEnCouleur(`${texNombre(b, 2)}`, bleuMathalea)})(${miseEnCouleur(`${texNombre(a, 2)}x`, 'red')}+${miseEnCouleur(`${texNombre(b, 2)}`, bleuMathalea)})}_{(a-b)(a+b)}
     \\end{aligned}$ `
              } else {
                texteCorr += `$\\begin{aligned}
     ${texNombre(new Decimal(b.mul(b)), 2)}-${texNombre(new Decimal(a.mul(a)), 2)}x^2&=\\underbrace{${miseEnCouleur(`${texNombre(b, 2)}`, 'red')}^2-(${miseEnCouleur(`${texNombre(a, 2)}x`, bleuMathalea)})^2}_{a^2-b^2}\\\\
      &=\\underbrace{(${miseEnCouleur(`${texNombre(b, 2)}`, 'red')}-${miseEnCouleur(`${texNombre(a, 2)}x`, bleuMathalea)})(${miseEnCouleur(`${texNombre(b, 2)}`, 'red')}+${miseEnCouleur(`${texNombre(a, 2)}x`, bleuMathalea)})}_{(a-b)(a+b)}
      \\end{aligned}$ `
              }
            } else {
              if (choix === true) {
                texteCorr = `$${texNombre(new Decimal(a.mul(a)), 2)}x^2-${texNombre(new Decimal(b.mul(b)), 2)}=(${texNombre(a, 2)}x-${b})(${texNombre(a, 2)}x+${b})`
              } else {
                texteCorr += `$${texNombre(new Decimal(b.mul(b)), 2)}-${texNombre(new Decimal(a.mul(a)), 2)}x^2=(${texNombre(b, 2)}-${texNombre(a, 2)}x)(${texNombre(b, 2)}+${texNombre(a, 2)}x)`
              }
            }

            handleAnswers(this, i, {
              reponse: {
                value: choix
                  ? `(${facteur1})(${facteur2})`
                  : `(${reduireAxPlusB(a.mul(-1), b)})(${facteur1})`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break
        case 8: // ((ax+b)^2-c^2)
          {
            const a = randint(-10, 10, 0)
            const b = randint(-15, 15, 0)
            const c = randint(1, 12)
            texte = `${choix ? `$(${reduireAxPlusB(a, b)})^2-${c * c}$` : `$${c * c}-(${reduireAxPlusB(a, b)})^2$`}`
            // texte += choix ? `(${reduireAxPlusB(a, b + c)})(${reduireAxPlusB(a, b - c)})` : `(${reduireAxPlusB(-a, c - b)})(${reduireAxPlusB(-a, c + b)})`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `${choix ? `$a=${miseEnCouleur(`${reduireAxPlusB(a, b)}`, 'red')}$  et $b=${miseEnCouleur(`${c}`, bleuMathalea)}$` : `$a=${miseEnCouleur(`${c}`, 'red')}$  et $b=${miseEnCouleur(`${reduireAxPlusB(a, b)}`, bleuMathalea)}$`}.<br>`
              if (choix === true) {
                texteCorr += `$\\begin{aligned}
      (${reduireAxPlusB(a, b)})^2-${c * c}&=\\underbrace{(${miseEnCouleur(`${reduireAxPlusB(a, b)}`, 'red')})^2-${miseEnCouleur(`${c}`, bleuMathalea)}^2}_{a^2-b^2}\\\\
       &=\\underbrace{(${miseEnCouleur(`${reduireAxPlusB(a, b)}`, 'red')}-${miseEnCouleur(`${c}`, bleuMathalea)})(${miseEnCouleur(`${reduireAxPlusB(a, b)}`, 'red')}+${miseEnCouleur(`${c}`, bleuMathalea)})}_{(a-b)(a+b)}\\\\
       &=${c === b ? `${reduireAxPlusB(a, b - c)}(${reduireAxPlusB(a, b + c)})` : `${c === -b ? `${reduireAxPlusB(a, b + c)}(${reduireAxPlusB(a, b - c)})` : `(${reduireAxPlusB(a, b - c)})(${reduireAxPlusB(a, b + c)})`}`}
       \\end{aligned}$ `
              } else {
                texteCorr += `$\\begin{aligned}
        ${c * c}-(${miseEnCouleur(`${reduireAxPlusB(a, b)}`, bleuMathalea)})^2&=\\underbrace{${miseEnCouleur(`${c}`, 'red')}^2-(${miseEnCouleur(`${reduireAxPlusB(a, b)}`, bleuMathalea)})^2}_{a^2-b^2}\\\\
        &=\\underbrace{(${miseEnCouleur(`${c}`, 'red')}-(${miseEnCouleur(`${reduireAxPlusB(a, b)}`, bleuMathalea)}))(${miseEnCouleur(`${c}`, 'red')}+(${miseEnCouleur(`${reduireAxPlusB(a, b)}`, bleuMathalea)}))}_{(a-b)(a+b)}\\\\
        &=(${reduireAxPlusB(-a, c - b)})(${reduireAxPlusB(a, b + c)})
        \\end{aligned}$ `
              }
            } else {
              if (choix === true) {
                texteCorr = `$(${reduireAxPlusB(a, b)})^2-${c * c}=(${reduireAxPlusB(a, b + c)})(${reduireAxPlusB(a, b - c)})`
              } else {
                texteCorr += `$${c * c}-(${reduireAxPlusB(a, b)})^2=(${reduireAxPlusB(-a, c - b)})(${reduireAxPlusB(a, c + b)})`
              }
            }

            handleAnswers(this, i, {
              reponse: {
                value: choix
                  ? `${c === b ? `${reduireAxPlusB(a, b - c)}(${reduireAxPlusB(a, b + c)})` : `${c === -b ? `${reduireAxPlusB(a, b + c)}(${reduireAxPlusB(a, b - c)})` : `(${reduireAxPlusB(a, b - c)})(${reduireAxPlusB(a, b + c)})`}`}`
                  : `(${reduireAxPlusB(-a, c - b)})(${reduireAxPlusB(a, c + b)})`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break

        case 9: // (ax+b)^2-(cx+d)^2
          {
            const a = randint(-10, 10, 0)
            const b = randint(-15, 15)
            const c = randint(-10, 10, 0)
            const d = randint(-15, 15, b)
            const facteur1 = reduireAxPlusB(a - c, b - d)
            const facteur2 = reduireAxPlusB(a + c, b + d)
            const facteurConstant = [facteur1, facteur2].filter(
              (el) => !el.includes('x'),
            )

            texte = `$(${reduireAxPlusB(a, b)})^2-(${reduireAxPlusB(c, d)})^2$`
            // texte += `<br>$(${facteur1})(${facteur2})$`
            // texte += choix ? `(${reduireAxPlusB(a, b + c)})(${reduireAxPlusB(a, b - c)})` : `(${reduireAxPlusB(-a, c - b)})(${reduireAxPlusB(-a, c + b)})`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `$a=${miseEnCouleur(`${reduireAxPlusB(a, b)}`, 'red')}$  et $b=${miseEnCouleur(`${reduireAxPlusB(c, d)}`, bleuMathalea)}$.<br>`

              texteCorr += `$\\begin{aligned}
      (${reduireAxPlusB(a, b)})^2-(${reduireAxPlusB(c, d)})^2&=\\underbrace{(${miseEnCouleur(`${reduireAxPlusB(a, b)}`, 'red')})^2-(${miseEnCouleur(`${reduireAxPlusB(c, d)}`, bleuMathalea)})^2}_{a^2-b^2}\\\\
       &=\\underbrace{((${miseEnCouleur(`${reduireAxPlusB(a, b)}`, 'red')})-(${miseEnCouleur(`${reduireAxPlusB(c, d)}`, bleuMathalea)}))((${miseEnCouleur(`${reduireAxPlusB(a, b)}`, 'red')})+(${miseEnCouleur(`${reduireAxPlusB(c, d)}`, bleuMathalea)}))}_{(a-b)(a+b)}\\\\
       &=(${reduireAxPlusB(a, b)}${ecritureAlgebriqueSauf1(-c)}x${ecritureAlgebrique(-d)})(${reduireAxPlusB(a, b)}${ecritureAlgebriqueSauf1(c)}x${ecritureAlgebrique(d)})\\\\
       \\end{aligned}$ `
              texteCorr += `<br>$\\phantom{(${reduireAxPlusB(a, b)})^2-(${reduireAxPlusB(c, d)})^2}=`
              if (facteurConstant.length === 0) {
                texteCorr += `(${facteur1})(${facteur2})$`
              } else {
                if (facteur1.includes('x')) {
                  texteCorr += `${facteur2}(${facteur1})$`
                } else {
                  texteCorr += `${facteur1}(${facteur2})$`
                }
              }
            } else {
              texteCorr += `$(${reduireAxPlusB(a, b)})^2-(${reduireAxPlusB(c, d)})^2=`
              if (facteurConstant.length === 0) {
                texteCorr += `(${facteur1})(${facteur2})`
              } else {
                if (facteur1.includes('x')) {
                  texteCorr += `${facteur2}(${facteur1})`
                } else {
                  texteCorr += `${facteur1}(${facteur2})`
                }
              }
            }
            handleAnswers(this, i, {
              reponse: {
                value: `(${facteur1})(${facteur2})`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break

        case 10:
          {
            // e²(ax+b)²-f²(cx+d)²
            const a = randint(2, 9) * choice([-1, 1])
            const b = randint(1, 9) * choice([-1, 1])
            const c = randint(2, 9)
            const d = randint(1, 9) * choice([-1, 1])
            const e = randint(2, 6, [a, b])
            const f = randint(2, 6, [c, d, e])
            const facteur1 = reduireAxPlusB(e * a - c * f, b * e - d * f)
            const facteur2 = reduireAxPlusB(a * e + c * f, b * e + d * f)
            const facteurConstant = [facteur1, facteur2].filter(
              (el) => !el.includes('x'),
            )
            texte = `$${e ** 2}(${a}x${ecritureAlgebrique(b)})^2-${f ** 2}(${c}x${ecritureAlgebrique(d)})^2$` // (ax+b)²-(cx+d)²
            // texte += ` $(${facteur1})(${facteur2})$<br>`
            if (this.correctionDetaillee) {
              texteCorr =
                texteEgaliteR +
                `$a=${miseEnCouleur(`${e}(${a}x${ecritureAlgebrique(b)})`, 'red')}$ et $b=${miseEnCouleur(`${f}(${c}x${ecritureAlgebrique(d)}))`, bleuMathalea)}$.<br>`
              texteCorr += `
  $\\begin{aligned}${e ** 2}(${a}x${ecritureAlgebrique(b)})^2-${f ** 2}(${c}x${ecritureAlgebrique(d)})^2
  &=\\underbrace{(${miseEnCouleur(`${e}(${a}x${ecritureAlgebrique(b)})`, 'red')})^2-(${miseEnCouleur(`${f}(${c}x${ecritureAlgebrique(d)})`, bleuMathalea)})^2}_{a^2-b^2}\\\\
  &=\\underbrace{[(${miseEnCouleur(`${e}(${a}x${ecritureAlgebrique(b)})`, 'red')})-(${miseEnCouleur(`${f}(${c}x${ecritureAlgebrique(d)})`, bleuMathalea)})][(${miseEnCouleur(`${e}(${a}x${ecritureAlgebrique(b)})`, 'red')})+(${miseEnCouleur(`${f}(${c}x${ecritureAlgebrique(d)})`, bleuMathalea)})]}_{(a-b)(a+b)}\\\\
   &= \\left[(${e}\\times ${a < 0 ? `(${a}x)` : `${a}x`}${ecritureAlgebrique(e)}\\times ${ecritureParentheseSiNegatif(b)})-(${f}\\times ${c < 0 ? `(${c}x)` : `${c}x`}${ecritureAlgebrique(f)}\\times ${ecritureParentheseSiNegatif(d)})\\right]
 \\left[(${e}\\times ${a < 0 ? `(${a}x)` : `${a}x`}${ecritureAlgebrique(e)}\\times ${ecritureParentheseSiNegatif(b)})+(${f}\\times ${c < 0 ? `(${c}x)` : `${c}x`}${ecritureAlgebrique(f)}\\times ${ecritureParentheseSiNegatif(d)})\\right]\\\\
   &= (${a * e}x${ecritureAlgebrique(b * e)}${ecritureAlgebrique(-c * f)}x${ecritureAlgebrique(-d * f)})(${a * e}x${ecritureAlgebrique(b * e)}${ecritureAlgebrique(c * f)}x${ecritureAlgebrique(d * f)})\\\\`
              if (facteurConstant.length === 0 || !facteur1.includes('x')) {
                texteCorr += ` &=(${facteur1})(${facteur2})\\end{aligned}$`
              } else {
                texteCorr += ` &= (${facteur2})(${facteur1})\\end{aligned}$`
              }
            } else {
              texteCorr = ` $${e ** 2}(${a}x${ecritureAlgebrique(b)})^2-${f ** 2}(${c}x${ecritureAlgebrique(d)})^2`
              if (facteurConstant.length === 0 || !facteur1.includes('x')) {
                texteCorr += ` = (${facteur1})(${facteur2})`
              } else {
                texteCorr += ` = (${facteur2})(${facteur1})`
              }
            }
            handleAnswers(this, i, {
              reponse: {
                value: `(${facteur1})(${facteur2})`,
                options: { unSeulFacteurLitteral: true },
              },
            })
          }
          break
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierFullOperations,
        { texteAvant: ' $=$' },
      )

      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], texte)) {
        // Si la question n'a jamais été posée, on en créé une autre
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        const avecAligned = aRemplacer.includes('aligned')
        const sansAccolades = !aRemplacer.includes('a+b')
        if (avecAligned && sansAccolades)
          aRemplacer = aRemplacer.replace('\\end{aligned}$', '')
        else if (sansAccolades) aRemplacer = aRemplacer.replace('$', '')
        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        if (avecAligned && sansAccolades)
          texteCorr += `${miseEnEvidence(aRemplacer)}\\end{aligned}$`
        else if (sansAccolades) texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
        else if (aRemplacer.includes('\\end{aligned}$')) {
          const sansFin = aRemplacer.replace('\\end{aligned}$', '')
          // La forme factorisée est mise en évidence sans les couleurs de la méthode : c'est ce que l'élève saisit.
          const facteurs = sansFin.match(
            /^\s*\\underbrace\{(.*)\}(_\{\(a-b\)\(a\+b\)\})\s*$/s,
          )
          const sansCouleur = (t: string) =>
            t.replace(
              /\{\\color(?:\[HTML\])?\{[^}]*\}\s*((?:[^{}]|\{[^{}]*\})*)\}/g,
              '$1',
            )
          texteCorr += facteurs
            ? `\\underbrace{${miseEnEvidence(sansCouleur(facteurs[1]))}}${facteurs[2]}\\end{aligned}$`
            : `${miseEnEvidence(sansFin)}\\end{aligned}$`
        }
        else texteCorr += aRemplacer
        // Fin de cette uniformisation

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
