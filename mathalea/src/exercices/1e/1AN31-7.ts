import { createList } from '../../lib/format/lists'

import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import {
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = false
//
export const titre = 'Étudier une fonction avec une exponentielle'

export const dateDePublication = '14/05/2026'

export const uuid = '55eb2'
export const refs = {
  'fr-fr': ['1AN31-7', 'TSA3-28', 'TCA7-28'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 */
export default class FonctionExponentielle extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(-5, 5, 0)
      const b = randint(-5, 5)
      const k = randint(-5, 5, 0)

      const abscisseTangente = randint(-5, 5, 0)
      const coefficientDerivee = a * k
      const constanteDerivee = a + b * k
      const coeffTangente =
        coefficientDerivee * abscisseTangente + constanteDerivee
      const racineDerivee = new FractionEtendue(
        -constanteDerivee,
        coefficientDerivee,
      )

      const limiteMoinsInfini = k > 0 ? '0' : a > 0 ? '-\\infty' : '+\\infty'
      const limitePlusInfini = k > 0 ? (a > 0 ? '+\\infty' : '-\\infty') : '0'
      const ligneSigneDerivee =
        coefficientDerivee > 0
          ? ['Line', 10, '', 0, '-', 20, 'z', 20, '+']
          : ['Line', 10, '', 0, '+', 20, 'z', 20, '-']
      const ligneVariation =
        coefficientDerivee > 0
          ? [
              'Var',
              10,
              `+/$${limiteMoinsInfini}$`,
              30,
              `-/$f\\left( ${racineDerivee.texFractionSimplifiee}\\right)$`,
              30,
              `+/$${limitePlusInfini}$`,
              30,
            ]
          : [
              'Var',
              10,
              `-/$${limiteMoinsInfini}$`,
              30,
              `+/$f\\left( ${racineDerivee.texFractionSimplifiee}\\right)$`,
              30,
              `-/$${limitePlusInfini}$`,
              30,
            ]
      const tableauEtude = tableauDeVariation({
        tabInit: [
          [
            ['$x$', 2, 5],
            [`$f'(x)$`, 2, 50],
            ['$f(x)$', 3, 50],
          ],
          [
            '$-\\infty$',
            30,
            `$ ${racineDerivee.texFractionSimplifiee}$`,
            30,
            '$+\\infty$',
            30,
          ],
        ],
        tabLines: [ligneSigneDerivee, ligneVariation],
        espcl: 8,
        deltacl: 0.8,
        lgt: 5,
        hauteurLignes: [15, 15, 25],
      })
      const question1 = `Calculer $f'(x)$ et donner le résultat sous forme factorisée.`
      const question2 = `Étudier le signe de $f'(x)$ et en déduire les variations de $f$.`
      const question3 = `Déterminer une équation de la tangente à la courbe de $f$ au point d'abscisse $${abscisseTangente}$.`
      const texte =
        `On considère la fonction $f$ définie sur $\\mathbb{R}$ par :
      $f(x)=(${reduireAxPlusB(a, b)})\\mathrm{e}^{${rienSi1(k)}x}$.<br>` +
        createList({
          items: [question1, question2, question3],
          style: 'nombres',
        })

      const correction1 = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme produit de fonctions dérivables sur $\\mathbb{R}$.<br>
      On pose $u(x)=${reduireAxPlusB(a, b)}$ et $v(x)=\\mathrm{e}^{${rienSi1(k)}x}$.<br>
      Alors $u'(x)=${a}$ et $v'(x)=${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}$.<br>
      On sait que $(uv)'=u'v+uv'$.<br>
      Soit $x\\in\\mathbb{R}$.<br>
      $\\begin{aligned}
      f'(x)&=${rienSi1(a)}\\mathrm{e}^{${rienSi1(k)}x}+(${reduireAxPlusB(a, b)})\\times ${ecritureParentheseSiNegatif(k)}\\mathrm{e}^{${rienSi1(k)}x}\\\\
      &=\\mathrm{e}^{${rienSi1(k)}x}\\left(${a}${ecritureAlgebriqueSauf1(k)}(${reduireAxPlusB(a, b)})\\right)\\\\
      &=${miseEnEvidence(`\\mathrm{e}^{${rienSi1(k)}x}(${reduireAxPlusB(coefficientDerivee, constanteDerivee)})`)}.
      \\end{aligned}$`
      let correction2 = `On a $\\mathrm{e}^{${rienSi1(k)}x}>0$ pour tout réel $x$.<br>
      Le signe de $f'(x)$ est donc le même que celui de $${reduireAxPlusB(coefficientDerivee, constanteDerivee)}$.<br>
      On résout : <br>`
      if (coefficientDerivee > 0) {
        correction2 += `$\\begin{aligned}
        \\phantom{\\iff}&${reduireAxPlusB(coefficientDerivee, constanteDerivee)}>0\\\\
        \\iff&${rienSi1(coefficientDerivee)}x>${-constanteDerivee}\\\\
        \\iff&x>${racineDerivee.texFractionSimplifiee}
        \\end{aligned}$`
      } else if (coefficientDerivee < 0) {
        correction2 += `$\\begin{aligned}
        \\phantom{\\iff}&${reduireAxPlusB(coefficientDerivee, constanteDerivee)}>0\\\\
        \\iff&${rienSi1(coefficientDerivee)}x>${-constanteDerivee}\\\\
        \\iff&x<${racineDerivee.texFractionSimplifiee}
        \\end{aligned}$`
      }
      correction2 += `<br>
      On regroupe le signe de $f'$ et les variations de $f$ dans le tableau suivant :<br><br>
      ${tableauEtude}<br><br><br>`
      const correction3 = `Pour déterminer une équation de la tangente à la courbe de $f$ au point d'abscisse $a$, on utilise la formule : $y=f'(a)(x-a)+f(a)$.<br>
     On en déduit :  $y=f'(${abscisseTangente})(x${ecritureAlgebriqueSauf0(-abscisseTangente)})+f(${abscisseTangente})$.<br>
      On a $f(${abscisseTangente})=\\left(${a}\\times${ecritureParentheseSiNegatif(abscisseTangente)}${ecritureAlgebriqueSauf0(b)}\\right)\\mathrm{e}^{${rienSi1(k)}\\times${ecritureParentheseSiNegatif(abscisseTangente)}}=${a * abscisseTangente + b}\\mathrm{e}^{${k * abscisseTangente}}$.<br>
       $f'(${abscisseTangente})=\\left(${coefficientDerivee}\\times${ecritureParentheseSiNegatif(abscisseTangente)}${ecritureAlgebriqueSauf0(constanteDerivee)}\\right)\\mathrm{e}^{${rienSi1(k)}\\times${ecritureParentheseSiNegatif(abscisseTangente)}}=${coefficientDerivee * abscisseTangente + constanteDerivee}\\mathrm{e}^{${k * abscisseTangente}}$.<br>
      Donc, l'équation de la tangente est : $y=${coeffTangente}\\mathrm{e}^{${k * abscisseTangente}}(x${ecritureAlgebriqueSauf0(-abscisseTangente)})${ecritureAlgebriqueSauf0(a * abscisseTangente + b)}\\mathrm{e}^{${k * abscisseTangente}}$,
      ou encore : $${miseEnEvidence(`y=${coeffTangente}\\mathrm{e}^{${k * abscisseTangente}}x${ecritureAlgebriqueSauf0(a * abscisseTangente + b - coeffTangente * abscisseTangente)}\\mathrm{e}^{${k * abscisseTangente}}`)}$`

      const texteCorr = createList({
        items: [correction1, correction2, correction3],
        style: 'nombres',
      })

      if (this.questionJamaisPosee(i, a, b, k)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
