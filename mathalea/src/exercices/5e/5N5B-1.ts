import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1 } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Calculer la valeur d'une expression littérale avec une ou deux variables"
export const interactifReady = true

export const dateDeModificationImportante = '26/05/2025'

/**
 * Calculer la valeur d'une expression littérale
 *
 * * ax+b
 * * a(x+b)
 * * x^2+y^2
 * * x^2-y^2
 * * ax^2+b(x-1)+cy^3
 * * ax^2+bx+c
 * * ax^2+bx-c
 * * ax^2-bx+c
 * * axy+x+y
 * * (ax+b)(cy-d)
 * @author Rémi Angot
 * Modifications pour intégrer des nombres relatifs + mise en forme Jean-claude Lhote le 26/05/2025 + ajout des clones 4L21 et 4L22
 * 5L14
 */
export const uuid = '17e39'

export const refs = {
  'fr-fr': ['5N5B-1'],
  'fr-2016': ['5L14-1'],
  'fr-ch': ['9R2FA3A-3', '9R3FA3A-3', '10CTFA4B-3', '10LCFA4B-3', '10LSFA4B-3', '11CTFA3B-3', '11LCFA3B-3', '11LSFA3B-3', 'PRQAL02A-2'],
}
export default class CalculerLaValeurDUneExpressionLitterale extends Exercice {
  version: string
  constructor() {
    super()
    this.version = '5L14'
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    // let typesDeQuestionsDisponibles = range1(10)
    let typesDeQuestionsDisponibles

    if (this.version === '5L13-5' || this.version === '4L21') {
      typesDeQuestionsDisponibles = range1(2)
    } else {
      typesDeQuestionsDisponibles = range1(10)
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let a, b, c, d, x, y
      switch (listeTypeDeQuestions[i]) {
        case 1: // ax+b
          a = randint(2, 10)
          x = randint(2, 10, a)
          b = randint(1, 10, [a, x])

          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1], 3)
            a *= changeSigne[0]
            b = changeSigne[1]
            x *= changeSigne[2]
          }
          texte = `Calculer $${a}x${ecritureAlgebrique(b)}$ pour $x=${x}$`
          texteCorr = `Pour $x=${x}$ : <br>`
          texteCorr += `$\\begin{aligned}${a}x${ecritureAlgebrique(b)}
          &=${a}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\\\
          &=${a * x}${ecritureAlgebrique(b)}\\\\
          &=${miseEnEvidence(`${a * x + b}`)}\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: a * x + b } })
          break
        case 2: // a(x+b)
          a = randint(2, 10)
          x = randint(2, 10, a)
          b = randint(1, 10, [a, x])
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1], 3)
            a *= changeSigne[0]
            b = changeSigne[1]
            x *= changeSigne[2]
          }
          texte = `Calculer $${a}(x${ecritureAlgebrique(b)})$ pour $x=${x}$`
          texteCorr = `Pour $x=${x}$ : <br>`
          texteCorr += `$\\begin{aligned}${a}(x${ecritureAlgebrique(b)})
          &=${a}\\times (${x}${ecritureAlgebrique(b)})\\\\
          &=${a}\\times ${ecritureParentheseSiNegatif(x + b)}\\\\
          &=${miseEnEvidence(`${a * (x + b)}`)}\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: a * (x + b) } })
          break
        case 3: // x^2+y^2
          x = randint(2, 10)
          y = randint(2, 10)
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1, -1], 2)
            x *= changeSigne[0]
            y *= changeSigne[1]
          }
          texte = `Calculer $x^2+y^2$ pour $x=${x}$ et $y=${y}$`
          texteCorr = `Pour $x=${x}$ et $y=${y}$ : <br>`
          texteCorr += `$\\begin{aligned}x^2+y^2
          &=${ecritureParentheseSiNegatif(x)}^2+${ecritureParentheseSiNegatif(y)}^2\\\\
          &=${x ** 2}+${y ** 2}\\\\
          &=${miseEnEvidence(`${x ** 2 + y ** 2}`)}\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: x ** 2 + y ** 2 } })
          break
        case 4: // x^2-y^2
          x = randint(2, 10)
          y = randint(1, x - 1)
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1, -1], 2)
            x *= changeSigne[0]
            y *= changeSigne[1]
          }
          texte = `Calculer $x^2-y^2$ pour $x=${x}$ et $y=${y}$`
          texteCorr = `Pour $x=${x}$ et $y=${y}$ : <br>`
          texteCorr += `$\\begin{aligned}x^2-y^2
          &=${ecritureParentheseSiNegatif(x)}^2-${ecritureParentheseSiNegatif(y)}^2\\\\
          &=${x ** 2}-${y ** 2}\\\\
          &=${miseEnEvidence(`${x ** 2 - y ** 2}`)}\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: x ** 2 - y ** 2 } })
          break
        case 5: // ax^2+b(x-1)+cy^3
          a = randint(2, 5)
          b = randint(2, 6)
          c = randint(2, 6)
          x = randint(3, 6)
          y = choice([1, 2, 3, 5, 10])
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1, -1, 1], 5)
            x *= changeSigne[0]
            y *= changeSigne[1]
            a *= changeSigne[2]
            b *= changeSigne[3]
            c *= changeSigne[4]
          }
          texte = `Calculer $${a}x^2${ecritureAlgebrique(b)}(x-1)${ecritureAlgebrique(c)}y^3$ pour $x=${x}$ et $y=${y}$`
          texteCorr = `Pour $x=${x}$ et $y=${y}$ : <br>`
          texteCorr += `$\\begin{aligned}${a}x^2${ecritureAlgebrique(b)}(x-1)${ecritureAlgebrique(c)}y^3&=${a}\\times ${ecritureParentheseSiNegatif(x)}^2${ecritureAlgebrique(b)}(${x}-1)${ecritureAlgebrique(c)}\\times ${ecritureParentheseSiNegatif(y)}^3\\\\
          &=${a}\\times ${x ** 2}${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(x - 1)}${ecritureAlgebrique(c)}\\times ${ecritureParentheseSiNegatif(y ** 3)}\\\\
          &=${a * x ** 2}${ecritureAlgebrique(b * (x - 1))}${ecritureAlgebrique(c * y ** 3)}\\\\
          &=${miseEnEvidence(`${a * x ** 2 + b * (x - 1) + c * y ** 3}`)}
          \\end{aligned}$`
          handleAnswers(this, i, {
            reponse: { value: a * x ** 2 + b * (x - 1) + c * y ** 3 },
          })
          break
        case 6: // ax^2+bx+c
          a = randint(2, 5)
          b = randint(2, 6)
          c = randint(2, 6)
          x = randint(3, 6)
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1, -1, 1], 4)
            x *= changeSigne[0]
            a *= changeSigne[2]
            b *= changeSigne[3]
            c *= changeSigne[1]
          }
          texte = `Calculer $${a}x^2${ecritureAlgebrique(b)}x${ecritureAlgebrique(c)}$ pour $x=${x}$`
          texteCorr = `Pour $x=${x}$ : <br>`
          texteCorr += `$\\begin{aligned}${a}x^2${ecritureAlgebrique(b)}x${ecritureAlgebrique(c)}
          &=${a}\\times ${x}^2${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(c)}\\\\
          &=${a}\\times ${x ** 2}${ecritureAlgebrique(b * x)}${ecritureAlgebrique(c)}\\\\
          &=${a * x ** 2}${ecritureAlgebrique(b * x)}${ecritureAlgebrique(c)}\\\\
          &=${miseEnEvidence(`${a * x ** 2 + b * x + c}`)}\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: { value: a * x ** 2 + b * x + c },
          })
          break
        case 7: // ax^2+bx-c
          a = randint(2, 5)
          b = randint(2, 6)
          c = randint(2, 6)
          x = randint(3, 6)
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1], 3)
            x *= changeSigne[0]
            a *= changeSigne[1]
            b *= changeSigne[2]
          }
          texte = `Calculer $${a}x^2${ecritureAlgebrique(b)}x-${c}$ pour $x=${x}$`
          texteCorr = `Pour $x=${x}$ : <br>`
          texteCorr += `$\\begin{aligned}${a}x^2${ecritureAlgebrique(b)}x-${c}
          &=${a}\\times ${ecritureParentheseSiNegatif(x)}^2${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(x)}-${c}\\\\
          &=${a}\\times ${x ** 2}${ecritureAlgebrique(b * x)}-${c}\\\\
          &=${miseEnEvidence(`${a * x ** 2 + b * x - c}`)}\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: { value: a * x ** 2 + b * x - c },
          })
          break
        case 8: // ax^2-bx+c
          a = randint(2, 5)
          b = randint(2, a)
          c = randint(2, 6)
          x = randint(3, 6)
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1], 3)
            x *= changeSigne[0]
            a *= changeSigne[1]
            c *= changeSigne[2]
          }
          texte = `Calculer $${a}x^2-${b}x${ecritureAlgebrique(c)}$ pour $x=${x}$`
          texteCorr = `Pour $x=${x}$ : <br>`
          texteCorr += `$\\begin{aligned}${a}x^2-${b}x${ecritureAlgebrique(c)}
          &=${a}\\times ${ecritureParentheseSiNegatif(x)}^2-${b}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(c)}\\\\
          &=${a}\\times ${x ** 2}${ecritureAlgebrique(-b * x)}${ecritureAlgebrique(c)}\\\\
          &=${miseEnEvidence(`${a * x ** 2 - b * x + c}`)}\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: { value: a * x ** 2 - b * x + c },
          })
          break

        case 9: // axy+x+y
          a = randint(2, 10)
          x = randint(2, 10)
          y = randint(2, 10, x)
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1], 3)
            x *= changeSigne[0]
            a *= changeSigne[1]
            y *= changeSigne[2]
          }
          texte = `Calculer $${a}xy+x+y$ pour $x=${x}$ et $y=${y}$`
          texteCorr = `Pour $x=${x}$ et $y=${y}$ : <br>`
          texteCorr += `$\\begin{aligned}${a}xy+x+y&=${a}\\times ${ecritureParentheseSiNegatif(x)}\\times ${ecritureParentheseSiNegatif(y)}${ecritureAlgebrique(x)}${ecritureAlgebrique(y)}\\\\
          &=${a * x * y}${ecritureAlgebrique(x)}${ecritureAlgebrique(y)}\\\\
          &=${miseEnEvidence(`${a * x * y + x + y}`)}\\end{aligned}$`
          handleAnswers(this, i, { reponse: { value: a * x * y + x + y } })
          break
        case 10: // (ax+b)(cy-d)
        default:
          a = randint(2, 10)
          x = randint(2, 10)
          b = randint(1, 10)
          y = randint(2, 10, x)
          c = randint(2, 10)
          d = randint(1, Math.min(10, c * y))
          if (this.version.startsWith('4L')) {
            const changeSigne = combinaisonListes([-1, 1, -1, 1, -1, 1], 6)
            x *= changeSigne[0]
            a *= changeSigne[2]
            c *= changeSigne[3]
            y *= changeSigne[1]
            b *= changeSigne[4]
            d *= changeSigne[5]
          }
          texte = `Calculer $(${a}x${ecritureAlgebrique(b)})(${c}y${ecritureAlgebrique(-d)})$ pour $x=${x}$ et $y=${y}$`
          texteCorr = `Pour $x=${x}$ et $y=${y}$ : <br>`
          texteCorr += `$\\begin{aligned}(${a}x${ecritureAlgebrique(b)})(${c}y${ecritureAlgebrique(-d)})
          &=(${a}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)})(${c}\\times ${ecritureParentheseSiNegatif(y)}${ecritureAlgebrique(-d)})\\\\
          &=(${a * x}${ecritureAlgebrique(b)})(${c * y}${ecritureAlgebrique(-d)})\\\\
          &=${a * x + b}\\times ${ecritureParentheseSiNegatif(c * y - d)}\\\\
          &=${miseEnEvidence(`${texNombre((a * x + b) * (c * y - d), 0)}`)}\\end{aligned}$`
          handleAnswers(this, i, {
            reponse: { value: (a * x + b) * (c * y - d) },
          })
          break
      }
      texte += this.interactif
        ? ' : ' + ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
        : '.'

      if (this.questionJamaisPosee(i, texteCorr)) {
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
