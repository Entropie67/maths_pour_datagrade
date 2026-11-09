import { createList } from '../../lib/format/lists'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import {
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = false
export const titre = 'Étudier une fonction exponentielle et sa position avec une droite'

export const dateDePublication = '25/05/2026'

export const uuid = 'a31f6'
export const refs = {
  'fr-fr': ['1AN31-6','TSA3-27', 'TCA7-27'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 */
export default class FonctionExponentielleAvecDroite extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const b = randint(2, 8)
      const minimum = randint(2, 9)
      const coefficientExponentielle = 2 * (b - 1)
      const coefficientDroite = 2 * b
      const constante = minimum - 2 * b + 1

      const expressionFonction = `\\mathrm{e}^{2x}+${rienSi1(coefficientExponentielle)}\\mathrm{e}^{x}-${coefficientDroite}x${ecritureAlgebriqueSauf0(constante)}`
      const expressionDroite = `-${coefficientDroite}x${ecritureAlgebriqueSauf0(constante)}`
      const expressionDeriveeDeveloppee = `2\\mathrm{e}^{2x}+${rienSi1(coefficientExponentielle)}\\mathrm{e}^{x}-${coefficientDroite}`
      const expressionDeriveeFactorisee = `2\\left(\\mathrm{e}^{x}-1\\right)\\left(\\mathrm{e}^{x}+${b}\\right)`

      const tableauEtude = tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 5],
            [`$f'(x)$`, 2, 50],
            ['$f(x)$', 3, 50],
          ],
          ['$-\\infty$', 30, '$0$', 30, '$+\\infty$', 30],
        ],
        tabLines: [
          ['Line', 10, '', 0, '-', 20, 'z', 20, '+'],
          [
            'Var',
            10,
            '+/',
            30,
            `-/$${minimum}$`,
            30,
            '+/',
            30,
          ],
        ],
        espcl: 8,
        deltacl: 0.8,
        lgt: 5,
        hauteurLignes: [15, 15, 25],
      })

      const questions = [
        `Montrer que, pour tout $x\\in\\mathbb{R}$, $f'(x)=${expressionDeriveeFactorisee}$.`,
        `Étudier le signe de $f'(x)$ sur $\\mathbb{R}$.`,
        `Dresser le tableau de variations de la fonction $f$ sur $\\mathbb{R}$.`,
        `En déduire le signe de $f(x)$ sur $\\mathbb{R}$.`,
        `Déterminer la position relative de la courbe $\\mathcal{C}_f$ et de la droite $\\left(\\mathcal{D}\\right)$.`,
      ]

      const styleSousQuestions = questions.length > 1 ? 'alpha' : 'none'
      const listeObjets = createList({
        items: [
          `la courbe $\\mathcal{C}_f$ représentative de la fonction $f$,`,
          `la droite $\\left(\\mathcal{D}\\right)$ d'équation $y=${expressionDroite}$.`,
        ],
        style: 'fleches',
      })
      const texte = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par :
      \\[
        f(x)=${expressionFonction}.
      \\]
      Dans le plan rapporté à un repère orthogonal, on considère :<br>
      ${listeObjets}
      ${createList({ items: questions, style: styleSousQuestions })}`

      const correction1 = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme somme de fonctions dérivables sur $\\mathbb{R}$.<br>
      Pour tout $x\\in\\mathbb{R}$, on sait que si $u$ est une fonction dérivable sur $\\mathbb{R}$, alors $\\left(e^{u}\\right)'=u'\\mathrm{e}^{u}$.<br>
      On en déduit que : <br>
      $\\begin{aligned}
      f'(x)&=${expressionDeriveeDeveloppee} \\end{aligned}$<br>
      On obtient une expression développée de la dérivée.<br>
      Développons l'expression factorisée de l'énoncé : <br>
      $\\begin{aligned}
      ${expressionDeriveeFactorisee}
      &=2\\left(\\mathrm{e}^{2x}+${b}\\mathrm{e}^{x}-\\mathrm{e}^{x}-${b}\\right)\\\\
      &=2\\mathrm{e}^{2x}${ecritureAlgebriqueSauf1(2*b-2)}\\mathrm{e}^{x}-${coefficientDroite}\\\\
      &=f'(x).
      \\end{aligned}$<br>
      Ainsi, pour tout $x\\in\\mathbb{R}$, $${miseEnEvidence(`f'(x)=${expressionDeriveeFactorisee}`)}$.`

      let correction2 = `Pour tout réel $x$, $\\mathrm{e}^{x}>0$, donc $\\mathrm{e}^{x}+${b}>0$.<br>
      Le signe de $f'(x)$ est donc celui de $\\mathrm{e}^{x}-1$.<br>
      Or <br>
      $\\begin{aligned}
      \\mathrm{e}^{x}>1
      &\\iff \\mathrm{e}^{x}>\\mathrm{e}^{0}\\\\
      &\\iff x>0&\\text{car la fonction exponentielle est strictement croissante sur }\\mathbb{R}.\\\\
      \\end{aligned}$`
     
      correction2 +=`<br>On en déduit que $f'(x)<0$ sur $]-\\infty;0[$, $f'(0)=0$ et $f'(x)>0$ sur $]0;+\\infty[$.`

      const correction3 = `La fonction $f$ est décroissante sur $]-\\infty;0]$ puis croissante sur $[0;+\\infty[$.<br>
      De plus,
      $f(0)=\\mathrm{e}^{0}+${coefficientExponentielle}\\mathrm{e}^{0}${ecritureAlgebriqueSauf0(constante)}=${1 + coefficientExponentielle + constante}$.<br><br>
      ${tableauEtude}<br><br>`

      const correction4 = `La fonction dérivée s'annule et change de signe en $0$.<br>
      D'après ses variations,  $f$ admet un minimum en $0$ qui vaut  $f(0)=${1 + coefficientExponentielle + constante}$, strictement positif.<br>
      Donc, pour tout $x\\in\\mathbb{R}$, $${miseEnEvidence('f(x)>0')}$.`

      const correction5 = `Pour étudier la position relative de la courbe $\\mathcal{C}_f$ et de la droite $\\left(\\mathcal{D}\\right)$, on étudie le signe de $f(x)-\\left(${expressionDroite}\\right)$.<br>
      On simplifie cette différence :<br>
      $\\begin{aligned}
      f(x)-\\left(${expressionDroite}\\right)
      &=${expressionFonction}-\\left(${expressionDroite}\\right)\\\\
      &=\\mathrm{e}^{2x}+${rienSi1(coefficientExponentielle)}\\mathrm{e}^{x}\\\\
      &=\\mathrm{e}^{x}\\left(\\mathrm{e}^{x}+${coefficientExponentielle}\\right).
      \\end{aligned}$<br>
      Pour tout réel $x$, $\\mathrm{e}^{x}>0$ et $\\mathrm{e}^{x}+${coefficientExponentielle}>0$.<br>
      Ainsi, pour tout réel $x$, $f(x)-\\left(${expressionDroite}\\right)>0$, donc $f(x)>${expressionDroite}$.<br>
      La courbe $\\mathcal{C}_f$ est donc ${texteEnCouleurEtGras('strictement au-dessus')} de la droite $\\mathcal{D}$ sur $\\mathbb{R}$.`

      const texteCorr = createList({
        items: [correction1, correction2, correction3, correction4, correction5],
        style: styleSousQuestions,
      })

      if (this.questionJamaisPosee(i, b, minimum)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
