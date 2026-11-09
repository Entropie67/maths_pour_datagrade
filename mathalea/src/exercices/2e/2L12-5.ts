import { all, isEqual, isReduced } from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { fraction } from '../../modules/fractions'

export const interactifReady = true

export const titre = 'Développer avec les identités remarquables'
export const dateDeModifImportante = '26/04/2023' // Correction par Rémi Angot avec ajout des réponses pour les case 4 à 8

/**
 * Développer avec les 3 identités remarquables
 * @author Jean-claude Lhote
 */
export const uuid = '04b0a'

export const refs = {
  'fr-fr': ['2L12-5', 'BP2AutoI1', 'BP1AUTO077'],
  'fr-ch': ['11LSFA3G-6'],
}
// Toute expression égale à l'énoncé est acceptée, à condition d'être développée et réduite
const formeDeveloppeeReduite = all([isEqual(), isReduced()])

export default class DevelopperIdentitesRemarquables2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Coefficient de x égal à 1\n2 : Coefficient de x supérieur à 1\n3 : Coefficient de x rationnel\n4 : Mélange des cas 1 et 2',
    ]

    this.besoinFormulaire2Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : (a+b)²',
        '2 : (a-b)²',
        '3 : (a+b)(a-b)',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.consigne = 'Développer et réduire les expressions suivantes.'

    this.nbQuestions = 5
    this.sup = 4
    this.sup2 = 4

    this.correctionDetailleeDisponible = true
    this.spacingCorr = context.isHtml ? 3 : 2
    if (!context.isHtml) {
      this.correctionDetaillee = false
    }
  }

  nouvelleVersion() {
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

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      max: 3,
      melange: 4,
      defaut: 1,
    })

    // let typesDeQuestionsDisponibles = []
    // if (this.sup === 1) {
    //   typesDeQuestionsDisponibles = [1, 2, 3] // coef de x = 1
    // } else if (this.sup === 2) {
    //   typesDeQuestionsDisponibles = [4, 5, 6] // coef de x > 1
    // } else if (this.sup === 3) {
    //   typesDeQuestionsDisponibles = [7, 8, 9] // coef de x fractionnaire
    // } else {
    //   typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6]
    // } // Tous les cas possibles sauf fractions
    // const listeTypeDeQuestions = combinaisonListes(typesDeQuestionsDisponibles, this.nbQuestions)

    for (let k = 0; k < listeTypeDeQuestions.length; k++) {
      if (listeTypeDeQuestions[k] === 1) {
        // (a+b)²
        if (this.sup === 1) {
          listeTypeDeQuestions[k] = 1
        } else if (this.sup === 2) {
          listeTypeDeQuestions[k] = 4
        } else if (this.sup === 3) {
          listeTypeDeQuestions[k] = 7
        } else {
          listeTypeDeQuestions[k] = choice([1, 4])
        } // Tous les cas possibles sauf fractions
      } else if (listeTypeDeQuestions[k] === 2) {
        // (a-b)²
        if (this.sup === 1) {
          listeTypeDeQuestions[k] = 2
        } else if (this.sup === 2) {
          listeTypeDeQuestions[k] = 5
        } else if (this.sup === 3) {
          listeTypeDeQuestions[k] = 8
        } else {
          listeTypeDeQuestions[k] = choice([2, 5])
        } // Tous les cas possibles sauf fractions
      } else if (listeTypeDeQuestions[k] === 3) {
        // (a-b)(a+b)
        if (this.sup === 1) {
          listeTypeDeQuestions[k] = 3
        } else if (this.sup === 2) {
          listeTypeDeQuestions[k] = 6
        } else if (this.sup === 3) {
          listeTypeDeQuestions[k] = 9
        } else {
          listeTypeDeQuestions[k] = choice([3, 6])
        } // Tous les cas possibles sauf fractions
      }
    }

    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b, typesDeQuestions;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      b = randint(2, 9)
      a = randint(1, 9, [b])
      const uneFraction = choice(listeFractions)
      const ns = uneFraction[0]
      const ds = uneFraction[1]
      const frac = fraction(ns, ds).texFraction
      const frac2 = fraction(ns * ns, ds * ds).texFraction
      const dblProdFrac = fraction(ns * 2 * a, ds).simplifie().texFraction
      texteCorr = ''
      switch (typesDeQuestions) {
        case 1:
          texte = `$(x+${a})^2$` // (x+a)²
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a+b)^2=a^2+2ab+b^2$, <br> avec $\\color{blue} a = x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
            texteCorr += `$\\left(\\color{blue}x\\color{black}+\\color{green}${a}\\color{black}\\right)^2=\\color{blue}x\\color{black}^2+2 \\times \\color{blue}x \\color{black}\\times \\color{green}${a} \\color{black}+ \\color{green}${a}\\color{black}^2$ <br>`
            texteCorr += `$\\phantom{\\left(\\color{blue}x\\color{black}+\\color{green}${a}\\color{black}\\right)^2} = x^2+${2 * a}x+${a * a}$`
          } else {
            texteCorr += `$(x+${a})^2=x^2+${2 * a}x+${a * a}$`
          }
          handleAnswers(this, i, {
            reponse: {
              value: `x^2+${2 * a}x+${a * a}`,
              compare: formeDeveloppeeReduite,
            },
          })
          break
        case 2:
          texte = `$(x-${a})^2$` // (x-a)²
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a-b)^2=a^2-2ab+b^2$, <br> avec $\\color{blue} a = x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
          }
          texteCorr += `$(x-${a})^2=x^2-2 \\times ${a} \\times x+${a}^2=x^2-${2 * a}x+${a * a}$`
          handleAnswers(this, i, {
            reponse: {
              value: `x^2-${2 * a}x+${a * a}`,
              compare: formeDeveloppeeReduite,
            },
          })
          break
        case 3:
          texte = `$(x-${a})(x+${a})$` // (x-a)(x+a)
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a+b)(a-b)=a^2-b^2$, <br> avec $\\color{blue} a = x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
          }
          texteCorr += `$(x-${a})(x+${a})=x^2-${a}^2=x^2-${a * a}$`
          handleAnswers(this, i, {
            reponse: { value: `x^2-${a * a}`, compare: formeDeveloppeeReduite },
          })
          break
        case 4:
          texte = `$(${b}x+${a})^2$` // (bx+a)²  b>1
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a+b)^2=a^2+2ab+b^2$, <br> avec $\\color{blue} a = ${b}x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
          }
          texteCorr += `$(${b}x+${a})^2=(${b}x)^2+2 \\times ${b}x \\times ${a} + ${a}^2=${b * b}x^2+${2 * b * a}x+${a * a}$`
          handleAnswers(this, i, {
            reponse: {
              value: `${b * b}x^2+${2 * b * a}x+${a * a}`,
              compare: formeDeveloppeeReduite,
            },
          })
          break
        case 5:
          texte = `$(${b}x-${a})^2$` // (bx-a)² b>1
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a-b)^2=a^2-2ab+b^2$, <br> avec $\\color{blue} a = ${b}x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
          }
          texteCorr += `$(${b}x-${a})^2=(${b}x)^2-2 \\times ${b}x \\times ${a} + ${a}^2=${b * b}x^2-${2 * b * a}x+${a * a}$`
          handleAnswers(this, i, {
            reponse: {
              value: `${b * b}x^2-${2 * b * a}x+${a * a}`,
              compare: formeDeveloppeeReduite,
            },
          })
          break
        case 6:
          texte = `$(${b}x-${a})(${b}x+${a})$` // (bx-a)(bx+a) b>1
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a+b)(a-b)=a^2-b^2$, <br> avec $\\color{blue} a = ${b}x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
          }
          texteCorr += `$(${b}x-${a})(${b}x+${a})=(${b}x)^2-${a}^2=${b * b}x^2-${a * a}$`
          handleAnswers(this, i, {
            reponse: {
              value: `${b * b}x^2-${a * a}`,
              compare: formeDeveloppeeReduite,
            },
          })
          break
        case 7:
          texte = `$\\left(${frac}x+${a}\\right)^2$` // (kx+a)² k rationnel
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a+b)^2=a^2+2ab+b^2$, <br> avec $\\color{blue} a = ${new FractionEtendue(ns, ds).simplifie().texFraction}x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
          }
          texteCorr += `$\\left(${frac}x+${a}\\right)^2=\\left(${frac}x\\right)^2+2 \\times ${frac}x \\times ${a} + ${a}^2=${frac2}x^2+${new FractionEtendue(ns * 2 * a, ds).texFraction}x+${a * a}$`
          handleAnswers(this, i, {
            reponse: {
              value: `${frac2}x^2+${dblProdFrac}x+${a * a}`,
              compare: formeDeveloppeeReduite,
            },
          })
          break
        case 8:
          texte = `$\\left(${frac}x-${a}\\right)^2$` // (kx-a)² k rationnel
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a-b)^2=a^2-2ab+b^2$, <br> avec $\\color{blue} a = ${frac}x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
          }
          texteCorr += `$\\left(${frac}x-${a}\\right)^2=\\left(${frac}x\\right)^2-2 \\times ${frac}x \\times ${a} + ${a}^2=${frac2}x^2-${dblProdFrac}x+${a * a}$`
          handleAnswers(this, i, {
            reponse: {
              value: `${frac2}x^2-${dblProdFrac}x+${a * a}`,
              compare: formeDeveloppeeReduite,
            },
          })
          break
        case 9:
        default:
          //  (bx-a)(bx+a) avec a entier et b rationnel simple
          texte = `$\\left(${frac}x-${a}\\right)\\left(${frac}x+${a}\\right)$` // b>1
          if (this.correctionDetaillee) {
            texteCorr += `On développe l'expression en utilisant l'identité remarquable $(a+b)(a-b)=a^2-b^2$, <br> avec $\\color{blue} a = ${frac}x\\color{black}$ et $\\color{green} b = ${a} \\color{black} $ : <br>`
          }
          texteCorr += `$\\left(${frac}x-${a}\\right)\\left(${frac}x+${a}\\right)=\\left(${frac}x\\right)^2-${a}^2=${frac2}x^2-${a * a}$`
          handleAnswers(this, i, {
            reponse: {
              value: `${frac2}x^2-${a * a}`,
              compare: formeDeveloppeeReduite,
            },
          })
          break
      }
      if (this.interactif)
        texte +=
          ' $=$ ' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierFullOperations)
      if (this.questionJamaisPosee(i, typesDeQuestions, a)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
        const textCorrSplit = texteCorr.split('=')
        let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
        aRemplacer = aRemplacer.replace('$', '')

        texteCorr = ''
        for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
          texteCorr += textCorrSplit[ee] + '='
        }
        texteCorr += `$ $${miseEnEvidence(aRemplacer)}$` + '.' // Gestion du point final
        // Fin de cette uniformisation

        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
