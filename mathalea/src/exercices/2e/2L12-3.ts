import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'

export const titre = 'Développer $(a-b)^2$'
export const interactifReady = true

/**
 * Développer (a-b)²
 * @author Matthieu Devillers
 */
export const uuid = '5a4ad'

export const refs = {
  'fr-fr': ['2L12-3', 'BP1AUTO076'],
  'fr-ch': ['11LSFA3G-3'],
}

export default class DevelopperIdentitesRemarquables4 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      5,
      '1 : Coefficient de x égal à 1\n 2 : Coefficient de x supérieur à 1\n 3 : Coefficient de x négatif\n 4 : Coefficient de x rationnel\n 5 : Mélange des cas précédents',
    ]

    this.correctionDetailleeDisponible = true
    this.spacingCorr = context.isHtml ? 3 : 2
    if (!context.isHtml) {
      this.correctionDetaillee = false
    }
    this.nbQuestions = 4
    this.sup = 5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Développer puis réduire l'expression suivante."
        : 'Développer puis réduire les expressions suivantes.'
    const listeFractions = [
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
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 9],
      [1, 10],
      [3, 10],
      [7, 10],
      [9, 10],
    ]
    let typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1] // coef de x = 1
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [2] // coef de x > 1
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = [3] // coef de x positif, difference au carrée.
    } else if (this.sup === 4) {
      typesDeQuestionsDisponibles = [4] // coefficients rationnels
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4]
    } // mélange des questions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, texteCorr2, cpt = 0, a, b, typesDeQuestions;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      a = randint(1, 12)
      b = randint(2, 12)
      const uneFraction = choice(listeFractions)
      const ns = uneFraction[0]
      const ds = uneFraction[1]
      const dfrac = fraction(ns, ds).texFraction
      const dfrac2 = fraction(ns * ns, ds * ds).texFraction
      const dbleProdFrac = fraction(2 * ns * a, ds).texFraction
      const dbleProdFracRed = fraction(2 * ns * a, ds).simplifie().texFraction
      texteCorr = ''
      texteCorr2 = ''
      switch (typesDeQuestions) {
        case 1:
          texte = `$\\left(x-${a}\\right)^2$` // (x-a)^2
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a-b)^2=a^2-2ab+b^2$, avec $\\color{blue} a = x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br> <br>`
            texteCorr += `$\\left(\\color{blue}x\\color{black}-\\color{green}${a}\\color{black}\\right)^2=\\color{blue}x\\color{black}^2-2 \\times \\color{blue}x \\color{black}\\times \\color{green}${a} \\color{black}+ \\color{green}${a}\\color{black}^2$ <br>`
            texteCorr += `$\\phantom{\\left(\\color{blue}x\\color{black}-\\color{green}${a}\\color{black}\\right)^2} = x^2-${2 * a}x+${a * a}$`
          } else {
            texteCorr += `$\\left(x+${a} \\right)^2=x^2-${2 * a}x+${a * a}$`
          }
          handleAnswers(this, i, {
            reponse: { value: `x^2-${2 * a}x+${a * a}` },
          })
          break
        case 2:
          texte = `$\\left(${b}x-${a}\\right)^2$` // b>1
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a-b)^2=a^2-2ab+b^2$, avec $\\color{blue} a = ${b}x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br> <br>`
            texteCorr += `$\\left(\\color{blue}${b}x\\color{black}-\\color{green}${a}\\color{black}\\right)^2 = \\left(\\color{blue}${b}x\\color{black}\\right)^2 - 2 \\times \\color{blue}${b}x\\color{black} \\times \\color{green}${a} + ${a}\\color{black}^2$ <br>`
            texteCorr += `$\\phantom{\\left(\\color{blue}${b}x\\color{black}-\\color{green}${a}\\color{black}\\right)^2} = ${b * b}x^2-${2 * b * a}x+${a * a}$`
          } else {
            texteCorr += `$\\left(${b}x+${a}\\right)^2 = ${b * b}x^2-${2 * b * a}x+${a * a}$`
          }
          handleAnswers(this, i, {
            reponse: { value: `${b * b}x^2-${2 * b * a}x+${a * a}` },
          })
          break
        case 3:
          b = -b
          texte = `$\\left(${b}x+${a}\\right)^2$` // b>1
          if (this.correctionDetaillee) {
            texteCorr += `On remarque que : $\\left(${b}x+${a}\\right)^2 = \\left(${a}-${-b}x\\right)^2$ <br>`
            texteCorr += `Et on développe l'expression en utilisant l'identité remarquable $\\left(a-b\\right)^2=a^2-2ab+b^2$, avec $\\color{blue} a = ${a}\\color{black}$ et $\\color{green} b = ${-b}x \\color{black} $ : <br> <br>`
            texteCorr += `$\\left(\\color{green}${b}x\\color{black}+\\color{blue}${a}\\color{black}\\right)^2 = \\left(\\color{blue}${a}\\color{black}-\\color{green}${-b}x\\color{black}\\right)^2 $ <br>`
            texteCorr += `$\\phantom{\\left(\\color{blue}${b}x\\color{black}+\\color{green}${a}\\color{black}\\right)^2} = \\color{blue}${a}\\color{black}^2 - 2 \\times \\color{blue}${a}\\color{black} \\times \\color{green}${-b}x \\color{black} + \\left(\\color{green} ${-b}x\\color{black}\\right)^2$ <br>`
            texteCorr += `$\\phantom{\\left(\\color{blue}${b}x\\color{black}+\\color{green}${a}\\color{black}\\right)^2} = ${a * a} -${2 * -b * a}x+${b * b}x^2$ <br>`
            texteCorr += `$\\phantom{\\left(\\color{blue}${b}x\\color{black}+\\color{green}${a}\\color{black}\\right)^2} = ${b * b}x^2-${2 * -b * a}x+${a * a}$`
            texteCorr2 += `<br><br> Autre méthode possible : développer en utilisant $\\left(a+b\\right)^2$ avec $a = ${b}x$ et $ b = ${a} $. <br>`
          } else {
            texteCorr = texte + `$= ${b * b}x^2-${2 * -b * a}x+${a * a}$`
          }

          handleAnswers(this, i, {
            reponse: { value: `${b * b}x^2-${2 * -b * a}x+${a * a}` },
          })
          break
        case 4:
        default:
          texte = `$\\left(${dfrac}x-${a}\\right)^2$`
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a-b)^2=a^2-2ab+b^2$, avec $\\color{blue} a = ${dfrac}x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br> <br>`
            texteCorr += `$\\left(\\color{blue}${dfrac}x\\color{black}-\\color{green}${a}\\color{black}\\right)^2 = \\left(\\color{blue}${dfrac}x\\color{black}\\right)^2 - 2 \\times \\color{blue}${dfrac}x\\color{black} \\times \\color{green}${a} + ${a}\\color{black}^2 $ <br><br>`
            texteCorr += `$\\phantom{\\left(\\color{blue}${dfrac}x\\color{black}-\\color{green}${a}\\color{black}\\right)^2} = ${dfrac2}x^2-${dbleProdFrac}x+${a * a}$`
            if (pgcd(ns, ds) !== 1 || pgcd(2 * ns * a, ds) !== 1) {
              texteCorr += `<br><br>$\\phantom{\\left(\\color{blue}${dfrac}x\\color{black}-\\color{green}${a}\\color{black}\\right)^2} = ${dfrac2}x^2-${dbleProdFracRed}x+${a * a}$`
            }
          } else {
            texteCorr = texte + `$= ${dfrac2}x^2-${dbleProdFracRed}x+${a * a}$`
          }
          handleAnswers(this, i, {
            reponse: { value: `${dfrac2}x^2-${dbleProdFrac}x+${a * a}` },
          })
          break
      }

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      texteCorr += texteCorr2
      if (this.interactif)
        texte +=
          '$=$' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierFullOperations)
      if (this.questionJamaisPosee(i, a, b, ns, ds, typesDeQuestions)) {
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
