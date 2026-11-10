import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import type { Expression } from '@cortex-js/compute-engine'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ce from '../../lib/interactif/comparisonFunctions'
import {
  developpe,
  regroupeTermesMemeDegre,
  suppressionParentheses,
} from '../../lib/mathFonctions/outilsMaths'

export const titre =
  'Développer puis réduire des expressions littérales complexes'
export const dateDePublication = '20/04/2024'
// export const dateDeModifImportante =

export const interactifReady = true

/* export const amcType = 'AMCHybride'
export const amcReady = true
*/

/**
 * Développer puis réduire une expression littérale.
 *
 * @author Matthieu DEVILLERS refactorisé par Jean-claude Lhote
 */
export const uuid = '889ef'
export const refs = {
  'fr-fr': ['2L13-2'],
  'fr-ch': ['1mCL1-4', '11LSFA3G-9'],
}

export default class DevelopperReduireExprComplexe extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de questions',
      `Nombres séparés par des tirets
1 : '(ax+b)(cx+d)+(ex+f)(gx+h)'
2 : '(ax+b)(cx+d)-(ex+f)(gx+h)'
3 : '(ax+b)^2 + (cx+d)^2'
4 : '(ax+b)^2 - (cx+d)^2'
5 : '(ax+b)^2 + (cx+d)(ex+f)'
6 : '(ax+b)^2 - (cx+d)(ex+f)'
7 : '(cx+d)(ex+f) + (ax+b)^2'
8 : '(cx+d)(ex+f) - (ax+b)^2'
9 : '(ax+b)(ax-b) + (cx+d)^2'
10 : '(ax-b)(ax+b) - (cx+d)^2'
11 : 'Mélange'
`,
    ]
    this.besoinFormulaire2CaseACocher = [
      'Coefficients strictement positifs',
      true,
    ]
    this.besoinFormulaire3Numerique = [
      'Niveau de détail dans la correction détaillée',
      3,
    ]
    this.besoinFormulaire4CaseACocher = ['Couleur dans la correction', true]
    // Héritage de la classe Exercice()
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.nbQuestions = 3
    this.sup = '3'
    this.sup2 = false
    this.sup3 = 3
    this.sup4 = true

    this.listeAvecNumerotation = false
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Développer puis réduire les expressions littérales suivantes.'
        : "Développer puis réduire l'expression littérale suivante."

    const lettresPossibles = ['x', 'y', 'z', 'n']

    let listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 10,
      defaut: 1,
      melange: 11,
      nbQuestions: this.nbQuestions,
    })

    listeTypeDeQuestions = combinaisonListes(
      listeTypeDeQuestions,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const isColored = this.sup4
      const level: 0 | 1 | 2 = (this.sup3 - 1) as 0 | 1 | 2
      const isPositif = this.sup2
      // Initialisation des variables didactiques en fonction du type de question voulu
      let ope = '+' // valeur par défaut
      let factsProd1Diff = true // par défaut
      let factsProd2Diff = true // par défaut
      let prod1Remarquable = false // par défaut
      switch (listeTypeDeQuestions[i]) {
        case 2: // '(ax+b)(cx+d)-(ex+f)(gx+h)'
          ope = '-'
        // eslint-disable-next-line no-fallthrough
        case 1: // '(ax+b)(cx+d)+(ex+f)(gx+h)'
          break
        case 4: // '(ax+b)^2-(cx+d)^2'
          ope = '-'
        // eslint-disable-next-line no-fallthrough
        case 3: // '(ax+b)^2+(cx+d)^2'
          factsProd1Diff = false
          factsProd2Diff = false
          break
        case 6: // '(ax+b)^2-(cx+d)(ex+f)'
          ope = '-'
        // eslint-disable-next-line no-fallthrough
        case 5: // '(ax+b)^2+(cx+d)(ex+f)'
          factsProd1Diff = false
          break
        case 8: // '(cx+d)(ex+f)-(ax+b)^2'
          ope = '-'
        // eslint-disable-next-line no-fallthrough
        case 7: // '(cx+d)(ex+f)+(ax+b)^2'
          factsProd2Diff = false
          break
        case 10: // '(ax-b)(ax+b)-(cx+d)^2'
          ope = '-'
        // eslint-disable-next-line no-fallthrough
        case 9: // '(ax-b)(ax+b)+(cx+d)^2'
          prod1Remarquable = true
          factsProd2Diff = false
          break
      }
      // initialisation des coefficients
      let c, d, g, h
      const a = randint(isPositif ? 1 : -5, 5, 0)
      const b = randint(isPositif ? 1 : -5, 5, 0)
      if (prod1Remarquable) {
        c = a
        d = -b
      } else if (!factsProd1Diff) {
        c = a
        d = b
      } else {
        c = randint(isPositif ? 1 : -5, 5, [0, a])
        d = randint(isPositif ? 1 : -5, 5, [0, b])
      }
      const e = randint(isPositif ? 1 : -5, 5, 0)
      const f = randint(isPositif ? 1 : -5, 5, 0)
      if (!factsProd2Diff) {
        g = e
        h = f
      } else {
        g = randint(isPositif ? 1 : -5, isPositif ? 9 : 5, [0, e])
        h = randint(isPositif ? 1 : -5, isPositif ? 9 : 5, [0, f])
      }
      const choixLettre = choice(lettresPossibles)
      const expression1 = factsProd1Diff
        ? `(${rienSi1(a)} ${choixLettre}${ecritureAlgebrique(b)}) (${rienSi1(c)} ${choixLettre}${ecritureAlgebrique(d)})`
        : `(${rienSi1(a)} ${choixLettre}${ecritureAlgebrique(b)})^2`
      const expression2 = factsProd2Diff
        ? `(${rienSi1(e)} ${choixLettre}${ecritureAlgebrique(f)}) (${rienSi1(g)} ${choixLettre}${ecritureAlgebrique(h)})`
        : `(${rienSi1(e)} ${choixLettre}${ecritureAlgebrique(f)})^2`
      const expressionDeveloppee1 = developpe(expression1, {
        isColored,
        colorOffset: 0,
        level,
      })
      const expressionDeveloppee2 = developpe(expression2, {
        isColored,
        colorOffset: 4,
        level,
      })
      const parsedExp1: Expression = ce.parse(
        developpe(expression1, {
          isColored: false,
          colorOffset: 0,
          level: 0,
        }).replaceAll('\\dfrac', '\\frac'),
      )
      const devExpr1 = parsedExp1 != null ? parsedExp1.latex : ''
      if (devExpr1 === '') {
        window.notify("Erreur dans le développement de l'expression 1", {
          expression1,
        })
      }
      const parsedExp2 = ce.parse(
        developpe(expression2, {
          isColored: false,
          colorOffset: 0,
          level: 0,
        }).replaceAll('\\dfrac', '\\frac'),
      )
      const devExpr2 = parsedExp2 != null ? parsedExp2.latex : ''
      if (devExpr2 === '') {
        window.notify("Erreur dans le développement de l'expression 2", {
          expression2,
        })
      }
      const sansParentheses = suppressionParentheses(
        `(${devExpr1})${ope}(${devExpr2})`,
        { isColored },
      )
      const sansParenthesesNetB = suppressionParentheses(
        `(${devExpr1})${ope}(${devExpr2})`,
        { isColored: false },
      )
      const expression = `${expression1}${ope}${expression2}`
      const expressionOrdonnee = regroupeTermesMemeDegre(sansParenthesesNetB, {
        isColored,
      })
      const coeffX2 = ope === '-' ? a * c - e * g : a * c + e * g
      const coeffX =
        ope === '-'
          ? a * d + b * c - e * h - f * g
          : a * d + b * c + e * h + f * g
      const coeffConst = String(ope === '-' ? b * d - f * h : b * d + f * h)
      const reponse = `${reduirePolynomeDegre3(0, coeffX2, coeffX, Number(coeffConst), choixLettre)}`
      let texte = `$${lettreDepuisChiffre(i + 1)}=${expression}$`
      let texteCorr = `$\\begin{aligned}${lettreDepuisChiffre(i + 1)} &=${expression}\\\\`
      // ici on va rédiger la correction détaillée
      if (this.correctionDetaillee) {
        // La correction dans le texte pour tester
        texteCorr += `&=\\left(${expressionDeveloppee1}\\right)${ope}\\left(${expressionDeveloppee2}\\right)\\\\ \n`
        texteCorr += `&=${sansParentheses}\\\\ \n`
        texteCorr += `&=${expressionOrdonnee}\\\\ \n`
      } else {
        texteCorr += `&=(${devExpr1})${ope}(${devExpr2})\\\\ \n`
      }

      texteCorr += `&=${miseEnEvidence(reponse)}\\end{aligned}$`

      // La correction pour de vrai
      if (!context.isAmc && this.interactif) {
        handleAnswers(this, i, { reponse: { value: reponse } })
        texte += this.interactif
          ? `<br>$${lettreDepuisChiffre(i + 1)} = $` +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecVariable,
            )
          : ''
      } else {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          options: {
            multicols: true,
            barreseparation: true,
          },
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  enonce: texte + '<br>',
                  statut: 4,
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `valeur de $m$ dans $m${choixLettre}^2+n${choixLettre}+p$`,
                    valeur: coeffX2,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `valeur de $n$ dans $m${choixLettre}^2+n${choixLettre}+p$`,
                    valeur: coeffX,
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: `valeur de $p$ dans $m${choixLettre}^2+n${choixLettre}+p$`,
                    valeur: Number(coeffConst),
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: true,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
