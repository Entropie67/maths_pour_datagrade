import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '23/04/2023'
export const interactifReady = true

export const titre = 'Mettre au même dénominateur des expressions littérales'

/**
 * Mettre au même dénominateur des expressions littérales
 * @author Gilles Mora
 * 2L11-8
 */
export const uuid = '641bc'

export const refs = {
  'fr-fr': ['2L13-4'],
  'fr-ch': [],
}
export default class MettreAuMemeDenominateurLit extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Expressions simples\n 2 : Expressions complexes\n 3 : Mélange',
    ]

    this.nbQuestions = 2
    this.sup = 3
    this.comment = `Les expressions simples sont des expressions du type $a+\\dfrac{b}{x}$ ou $ax+\\dfrac{b}{x}$ ou $a+\\dfrac{b}{cx+d}$.<br>
  Les expressions complexes nécessitent par exemple un développement du numérateur et peuvent avoir deux valeurs interdites.`
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1, 2, 3]
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [4, 5, 6, 7]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7]
    } // 1, 2, 3, 4, 5, 6, 7

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0,
        texte,
        texteCorr,
        cpt = 0,
        typesDeQuestions,
        consigne1,
        consigne2,
        consigneI1,
        consigneI2;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      consigne1 =
        "Préciser les valeurs interdites éventuelles, puis écrire l'expression sous la forme d'un quotient : "
      consigne2 =
        "Préciser les valeurs interdites éventuelles, puis écrire l'expression sous la forme d'un quotient (réduire le numérateur) : "
      consigneI1 = ' Écrire avec un seul quotient :<br>'
      consigneI2 = ' Écrire avec un seul quotient (réduire le numérateur) :<br>'
      switch (typesDeQuestions) {
        case 1: // bx +/- a/x
          {
            const a = randint(1, 9)
            const b = randint(-9, 9, 0)
            const choix = choice([true, false])
            texte = consigne1
            texte += `$${rienSi1(b)}x${choix ? '-' : '+'}\\dfrac{${a}}{x}$.`
            texteCorr = this.interactif
              ? ''
              : `Déterminer les valeurs interdites de cette expression, revient à déterminer les valeurs qui annulent le dénominateur de $\\dfrac{${a}}{x}$, puisque la division par $0$ n'existe pas.<br>
          $0$ est donc une valeur interdite. <br>`

            texteCorr += `Pour $x\\in \\mathbb{R}^*$,<br>
            $\\begin{aligned}
            ${rienSi1(b)}x${choix ? '-' : '+'}\\dfrac{${a}}{x}&=\\dfrac{${rienSi1(b)}x^2}{x}${choix ? '-' : '+'}\\dfrac{${a}}{x}\\\\
           &= \\dfrac{${rienSi1(b)}x^2${choix ? '-' : '+'}${a}}{x}
           \\end{aligned}$
        `
            const reponse = choix
              ? [`\\dfrac{${reduirePolynomeDegre3(0, b, 0, -a)}}{x}`]
              : [`\\dfrac{${reduirePolynomeDegre3(0, b, 0, a)}}{x}`]
            handleAnswers(this, i, { reponse: { value: reponse } })
            if (this.interactif) {
              texte = consigneI1
              texte +=
                ` $${rienSi1(b)}x${choix ? '-' : '+'}\\dfrac{${a}}{x}=$` +
                ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
            }
          }
          break
        case 2: // b +/- a/x
          {
            const a = randint(1, 9)
            const b = randint(-9, 9, 0)
            const choix = choice([true, false])
            texte = consigne1
            texte += `$${b}${choix ? '+' : '-'}\\dfrac{${a}}{x}$.`
            texteCorr = this.interactif
              ? ''
              : `Déterminer les valeurs interdites de cette expression, revient à déterminer les valeurs qui annulent le dénominateur de $\\dfrac{${a}}{x}$, puisque la division par $0$ n'existe pas.<br>
            $0$ est donc une valeur interdite. <br>`

            texteCorr += `Pour $x\\in \\mathbb{R}^*$, <br>
            $\\begin{aligned}
            ${b}${choix ? '+' : '-'}\\dfrac{${a}}{x}&=\\dfrac{${rienSi1(b)}x}{x}${choix ? '+' : '-'}\\dfrac{${a}}{x}\\\\
            &=\\dfrac{${rienSi1(b)}x${choix ? '+' : '-'}${a}}{x}
            \\end{aligned}$`
            const reponse = choix
              ? [`\\dfrac{${reduireAxPlusB(b, a)}}{x}`]
              : [`\\dfrac{${reduireAxPlusB(b, -a)}}{x}`]
            handleAnswers(this, i, { reponse: { value: reponse } })
            if (this.interactif) {
              texte = consigneI1
              texte +=
                ` $${b}${choix ? '+' : '-'}\\dfrac{${a}}{x}=$` +
                ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
            }
          }
          break

        case 3: // a +/- b/(cx+d)
          {
            let b
            const a = randint(-5, 5, 0)
            const choix = choice([true, false])
            const c = randint(-2, 5, 0)
            const k = randint(1, 4)
            const d = choice([k * c, randint(-5, 5, 0)])
            b = choice([abs(d - 1), abs(d + 1)])
            if (b === 0) {
              b = b + 1
            }
            const f = new FractionEtendue(-d, c).simplifie()
            texte = consigne2
            texte += `$${a}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$.`
            if (context.isDiaporama) {
              texteCorr = ''
            } else {
              texteCorr = this.interactif
                ? ''
                : ` Déterminer les valeurs interdites de cette expression, revient à déterminer les valeurs qui annulent le dénominateur de $\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$,
            puisque la division par $0$ n'existe pas.<br>`
            }
            texteCorr += this.interactif
              ? ''
              : `L'équation $${reduireAxPlusB(c, d)}=0$ a pour solution $${f.texFraction}$. <br>
            $${f.texFraction}$ est donc une valeur interdite pour l'expression. <br>`
            texteCorr += `Pour $x\\in \\mathbb{R}\\smallsetminus\\left\\{${f.texFraction}\\right\\}$, <br>
            $\\begin{aligned}
${a}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}&=\\dfrac{${a}(${reduireAxPlusB(c, d)})}{${reduireAxPlusB(c, d)}}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}\\\\
            &=\\dfrac{${reduireAxPlusB(a * c, a * d)}${choix ? '+' : '-'}${b}}{${reduireAxPlusB(c, d)}}\\\\
            &=\\dfrac{${choix ? `${reduireAxPlusB(a * c, a * d + b)}` : `${reduireAxPlusB(a * c, a * d - b)}`}}{${reduireAxPlusB(c, d)}}
            \\end{aligned}$`
            const reponse = choix
              ? [
                  `\\dfrac{${reduireAxPlusB(a * c, a * d + b)}}{${reduireAxPlusB(c, d)}}`,
                  `\\dfrac{${reduireAxPlusB(-a * c, -a * d - b)}}{${reduireAxPlusB(-c, -d)}}`,
                ]
              : [
                  `\\dfrac{${reduireAxPlusB(a * c, a * d - b)}}{${reduireAxPlusB(c, d)}}`,
                  `\\dfrac{${reduireAxPlusB(-a * c, -a * d + b)}}{${reduireAxPlusB(-c, -d)}}`,
                ]
            handleAnswers(this, i, { reponse: { value: reponse } })
            if (this.interactif) {
              texte = consigneI1
              texte +=
                `$${a}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}=$` +
                ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
            }
          }
          break

        case 4: // a/x +/- b/(cx+d)
          {
            let compteur = 0
            let a = 0
            let b = 0
            let choix = false
            let c = 0
            let d = 0
            let k = 0
            do {
              a = randint(-5, 5, 0)
              choix = choice([true, false])
              c = randint(-2, 5, 0)
              k = randint(1, 4)
              d = choice([k * c, randint(-5, 5, 0)])
              b = choice([abs(d - 1), abs(d + 1)])
              if (b === 0) {
                b = b + 1
              }

              const f = new FractionEtendue(-d, c).simplifie()
              const reponse = choix
                ? [
                    `\\dfrac{${reduireAxPlusB(a * c + b, a * d)}}{x(${reduireAxPlusB(c, d)})}`,
                    `\\dfrac{${reduireAxPlusB(-a * c - b, -a * d)}}{x(${reduireAxPlusB(-c, -d)})}`,
                  ]
                : [
                    `\\dfrac{${reduireAxPlusB(a * c - b, a * d)}}{x(${reduireAxPlusB(c, d)})}`,
                    `\\dfrac{${reduireAxPlusB(-a * c + b, -a * d)}}{x(${reduireAxPlusB(-c, -d)})}`,
                  ]
              texte = consigne2
              texte += `$\\dfrac{${a}}{x}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$.`
              if (context.isDiaporama) {
                texteCorr = ''
              } else {
                texteCorr = this.interactif
                  ? ''
                  : `Déterminer les valeurs interdites de cette expression, revient à déterminer les valeurs qui annulent le dénominateur de $\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$,
            puisque la division par $0$ n'existe pas.<br>`
              }
              texteCorr += this.interactif
                ? ''
                : ` L'équation $${reduireAxPlusB(c, d)}=0$ a pour solution $${f.texFraction}$. <br>
             $0$ et $${f.texFraction}$ sont donc des valeurs interdites pour l'expression. <br>`

              texteCorr += `Pour $x\\in \\mathbb{R}\\smallsetminus\\left\\{${-d / c < 0 ? `${f.texFraction}\\,;\\,0` : `0\\,;\\,${f.texFraction}`}\\right\\}$,<br>
            $\\begin{aligned} 
            \\dfrac{${a}}{x}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}&=\\dfrac{${a}(${reduireAxPlusB(c, d)})}{x(${reduireAxPlusB(c, d)})}${choix ? '+' : '-'}\\dfrac{${rienSi1(b)}x}{x(${reduireAxPlusB(c, d)})}\\\\
           & =\\dfrac{${reduireAxPlusB(a * c, a * d)}${choix ? '+' : '-'}${rienSi1(b)}x}{x(${reduireAxPlusB(c, d)})}\\\\
           &=\\dfrac{${choix ? `${reduireAxPlusB(a * c + b, a * d)}` : `${reduireAxPlusB(a * c - b, a * d)}`}}{x(${reduireAxPlusB(c, d)})}
           \\end{aligned}$`

              handleAnswers(this, i, { reponse: { value: reponse } })
              if (this.interactif) {
                texte = consigneI2
                texte +=
                  `$\\dfrac{${a}}{x}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}=$` +
                  ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
              }
            } while (
              compteur++ < 50 &&
              ((a * c + b === 0 && choix) || (a * c - b === 0 && !choix))
            )
          }
          break

        case 5: // ax+b/(cx+d)
          {
            let b
            const a = randint(-3, 9, 0)

            const c = randint(-2, 5, 0)
            const k = randint(1, 4)
            const d = choice([k * c, randint(-5, 5, 0)])
            b = choice([abs(d - 1), abs(d + 1)])
            if (b === 0) {
              b = b + 1
            }
            const f = new FractionEtendue(-d, c).simplifie()
            texte = consigne2
            texte += `$${rienSi1(a)}x+\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$.`
            if (context.isDiaporama) {
              texteCorr = ''
            } else {
              texteCorr = this.interactif
                ? ''
                : `Déterminer les valeurs interdites de cette expression, revient à
            déterminer les valeurs qui annulent le dénominateur de $\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$,
            puisque la division par $0$ n'existe pas.<br>`
            }
            texteCorr += this.interactif
              ? ''
              : `L'équation $${reduireAxPlusB(c, d)}=0$ a pour solution $${f.texFraction}$. <br>
            $${f.texFraction}$ est une valeur interdite pour le quotient $\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$.<br>`

            texteCorr += `Pour $x\\in \\mathbb{R}\\smallsetminus\\left\\{${f.texFraction}\\right\\}$, <br>
            $\\begin{aligned}
            ${rienSi1(a)}x+\\dfrac{${b}}{${reduireAxPlusB(c, d)}}&=\\dfrac{${rienSi1(a)}x(${reduireAxPlusB(c, d)})}{${reduireAxPlusB(c, d)}}+\\dfrac{${b}}{${reduireAxPlusB(c, d)}}\\\\
            &=\\dfrac{${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x+${b}}{${reduireAxPlusB(c, d)}}
            \\end{aligned}$`
            const reponse = [
              `\\dfrac{${reduirePolynomeDegre3(0, a * c, a * d, b)}}{${reduireAxPlusB(c, d)}}`,
            ]
            handleAnswers(this, i, { reponse: { value: reponse } })
            if (this.interactif) {
              texte = consigneI2
              texte +=
                `$${rienSi1(a)}x+\\dfrac{${b}}{${reduireAxPlusB(c, d)}}=$` +
                ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
            }
          }
          break

        case 6: // ax+e+b/(cx+d)
          {
            const a = randint(-3, 9, 0)
            const e = randint(-5, 5, 0)
            const c = randint(-2, 5, 0)
            const k = randint(1, 4)
            const d = choice([k * c, randint(-5, 5, 0)])
            let b = choice([abs(d - 1), abs(d + 1)])
            if (b === 0) {
              b = b + 1
            }
            const f = new FractionEtendue(-d, c).simplifie()
            texte = consigne2
            texte += `$${reduireAxPlusB(a, e)}+\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$.`
            if (context.isDiaporama) {
              texteCorr = ''
            } else {
              texteCorr = this.interactif
                ? ''
                : `Déterminer les valeurs interdites de cette expression, revient à
            déterminer les valeurs qui annulent le dénominateur de $\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$,
            puisque la division par $0$ n'existe pas.<br>`
            }
            texteCorr += this.interactif
              ? ''
              : `L'équation $${reduireAxPlusB(c, d)}=0$ a pour solution $${f.texFraction}$. <br>
              $${f.texFraction}$ est donc une valeur interdite pour l'expression. <br>`

            texteCorr += `
            Pour $x\\in \\mathbb{R}\\smallsetminus\\left\\{${f.texFraction}\\right\\}$, <br>
            $\\begin{aligned}
            ${reduireAxPlusB(a, e)}+\\dfrac{${b}}{${reduireAxPlusB(c, d)}}
           & = \\dfrac{(${reduireAxPlusB(a, e)})(${reduireAxPlusB(c, d)})}{${reduireAxPlusB(c, d)}}+\\dfrac{${b}}{${reduireAxPlusB(c, d)}}\\\\
            &=\\dfrac{(${reduirePolynomeDegre3(0, a * c, a * d + e * c, e * d)})+${b}}{${reduireAxPlusB(c, d)}}\\\\
           & =\\dfrac{${reduirePolynomeDegre3(0, a * c, a * d + e * c, e * d + b)}}{${reduireAxPlusB(c, d)}}
           \\end{aligned}$`
            const reponse = [
              `\\dfrac{${reduirePolynomeDegre3(0, a * c, a * d + e * c, e * d + b)}}{${reduireAxPlusB(c, d)}}`,
            ]
            handleAnswers(this, i, { reponse: { value: reponse } })
            if (this.interactif) {
              texte = consigneI2
              texte +=
                `$${reduireAxPlusB(a, e)}+\\dfrac{${b}}{${reduireAxPlusB(c, d)}}=$` +
                ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
            }
          }
          break

        case 7: // a/(ex+f) +/- b/(cx+d)
        default:
          {
            const choix = choice([true, false])
            const a = randint(-3, 9, 0)
            const c = randint(-2, 5, 0)
            const e = randint(1, 9, c)
            const k = randint(1, 4)
            const d = choice([k * c, randint(-5, 5, 0)])
            const f = choice([k * c, randint(-5, 5, 0)])
            let b = choice([abs(d - 1), abs(d + 1)])
            if (b === 0) {
              b = b + 1
            }
            const f1 = new FractionEtendue(-d, c).simplifie()
            const f2 = new FractionEtendue(-f, e).simplifie()
            texte = consigne2
            texte += `$\\dfrac{${a}}{${reduireAxPlusB(e, f)}}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$.`
            if (context.isDiaporama) {
              texteCorr = ''
            } else {
              texteCorr = this.interactif
                ? ''
                : `Déterminer les valeurs interdites de cette expression, revient à déterminer les valeurs qui annulent les dénominateurs de $\\dfrac{${a}}{${reduireAxPlusB(e, f)}}$ et de $\\dfrac{${b}}{${reduireAxPlusB(c, d)}}$, puisque la division par $0$ n'existe pas.<br>
              `
            }
            texteCorr += this.interactif
              ? ''
              : `L'équation $${reduireAxPlusB(e, f)}=0$ a pour solution $${f2.texFraction}$. <br>
            L'équation $${reduireAxPlusB(c, d)}=0$ a pour solution $${f1.texFraction}$. <br>`

            texteCorr += `$${f2.texFraction}$ et $${f1.texFraction}$ sont donc des valeurs interdites pour l'expression. <br>
            Pour $x\\in \\mathbb{R}\\smallsetminus\\left\\{${-d / c < -f / e ? `${f1.texFraction}\\,;\\,${f2.texFraction}` : `${f2.texFraction}\\,;\\,${f1.texFraction}`}\\right\\}$, <br>
            $\\begin{aligned}
            \\dfrac{${a}}{${reduireAxPlusB(e, f)}}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}
            &= \\dfrac{${a}(${reduireAxPlusB(c, d)})}{(${reduireAxPlusB(e, f)})(${reduireAxPlusB(c, d)})}${choix ? '+' : '-'}\\dfrac{${b}(${reduireAxPlusB(e, f)})}{(${reduireAxPlusB(e, f)})(${reduireAxPlusB(c, d)})}\\\\
            &=\\dfrac{${a}(${reduireAxPlusB(c, d)})${choix ? `${ecritureAlgebriqueSauf1(b)}` : `${ecritureAlgebriqueSauf1(-b)}`}(${reduireAxPlusB(e, f)})}{(${reduireAxPlusB(e, f)})(${reduireAxPlusB(c, d)})}\\\\
            &=\\dfrac{${choix ? `${reduireAxPlusB(a * c + b * e, a * d + b * f)}` : `${reduireAxPlusB(a * c - b * e, a * d - b * f)}`}}{(${reduireAxPlusB(e, f)})(${reduireAxPlusB(c, d)})}
            \\end{aligned}$`
            const reponse = choix
              ? [
                  `\\dfrac{${reduireAxPlusB(a * c + b * e, a * d + b * f)}}{(${reduireAxPlusB(e, f)})(${reduireAxPlusB(c, d)})}`,
                  `\\dfrac{${reduireAxPlusB(-a * c - b * e, -a * d - b * f)}}{(${reduireAxPlusB(-c, -d)})(${reduireAxPlusB(e, f)})}`,
                  `\\dfrac{${reduireAxPlusB(-a * c - b * e, -a * d - b * f)}}{(${reduireAxPlusB(c, d)})(${reduireAxPlusB(-e, -f)})}`,
                ]
              : [
                  `\\dfrac{${reduireAxPlusB(a * c - b * e, a * d - b * f)}}{(${reduireAxPlusB(e, f)})(${reduireAxPlusB(c, d)})}`,
                  `\\dfrac{${reduireAxPlusB(-a * c + b * e, -a * d + b * f)}}{(${reduireAxPlusB(-e, -f)})(${reduireAxPlusB(c, d)})}`,
                  `\\dfrac{${reduireAxPlusB(-a * c + b * e, -a * d + b * f)}}{(${reduireAxPlusB(e, f)})(${reduireAxPlusB(-c, -d)})}`,
                ]
            handleAnswers(this, i, { reponse: { value: reponse } })
            if (this.interactif) {
              texte = consigneI2
              texte +=
                `$\\dfrac{${a}}{${reduireAxPlusB(e, f)}}${choix ? '+' : '-'}\\dfrac{${b}}{${reduireAxPlusB(c, d)}}=$` +
                ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique)
            }
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replaceAll('\\end{aligned}$', '').trim()
        // aRemplacer = aRemplacer.replaceAll('.', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += ` ${miseEnEvidence(aRemplacer)}\\end{aligned}$`
        // Fin de cette uniformisation

        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
