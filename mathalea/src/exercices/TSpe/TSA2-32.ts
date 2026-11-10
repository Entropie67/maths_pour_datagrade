import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf0,
  ecritureParentheseSiMoins,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer les limites à gauche et à droite en un réel'
export const dateDePublication = '08/10/2026'
export const dateDeModifImportante = '06/11/2026'

export const uuid = 'a19fb'
export const interactifReady = true
export const refs = {
  'fr-fr': ['TSA2-32', 'TCA2-32'],
  'fr-ch': [],
}

/** @author Stéphane Guyon */
export default class LimitesEnUnReel extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 5
    this.besoinFormulaireNumerique = [
      'Type de fonction',
      5,
      '1 : 1/(ax+b)\n2 : 1/(ax+b)²\n3 : (cx+d)/(ax+b)\n4 : (cx+d)/(x²-a²), en a et -a\n5 : Mélange des quatre types',
    ]
  }

  nouvelleVersion(): void {
    this.consigne = this.interactif
      ? this.nbQuestions === 1
        ? 'Déterminer les limites demandées.'
        : 'Déterminer les limites demandées pour chaque fonction.'
      : ''
    const selectedType = Number(this.sup)
    const questionTypes = combinaisonListes(
      [1, 2, 3, 4].includes(selectedType) ? [selectedType] : [1, 2, 3, 4],
      this.nbQuestions,
    )
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const questionType = questionTypes[i]
      const drawnPoint = randint(-6, 6)
      const quadratic = questionType === 4
      const point = quadratic
        ? -Math.abs(drawnPoint || 1)
        : questionType === 2 && drawnPoint === 0
          ? 1
          : drawnPoint
      const root = Math.abs(point)
      const affineNumerator = questionType === 3 || quadratic
      const coefficient = randint(-5, 5, 0)
      const constant = randint(
        -9,
        9,
        quadratic
          ? [-coefficient * point, coefficient * point]
          : -coefficient * point,
      )
      // Dénominateur affine ax+b (a de signe quelconque, a ≠ 0) qui s'annule en `point`
      const slope = quadratic ? 1 : randint(-5, 5, 0)
      const pointTex = texNombre(point)
      const affineDenominator = reduireAxPlusB(slope, -slope * point)
      const squared = questionType === 2
      const denominator = squared
        ? `(${affineDenominator})^2`
        : quadratic
          ? `x^2-${texNombre(root ** 2)}`
          : affineDenominator
      const numerator = affineNumerator
        ? reduireAxPlusB(coefficient, constant)
        : '1'
      const numeratorLimit = affineNumerator
        ? coefficient * point + constant
        : 1
      const expression = `\\dfrac{${numerator}}{${denominator}}`
      if (!this.questionJamaisPosee(i, expression, point)) continue

      const denominatorRightSign = quadratic
        ? point < 0
          ? -1
          : 1
        : Math.sign(slope)
      const quotientRightSign = numeratorLimit * denominatorRightSign
      const leftLimit =
        squared || quotientRightSign < 0 ? '+\\infty' : '-\\infty'
      const rightLimit =
        squared || quotientRightSign > 0 ? '+\\infty' : '-\\infty'
      const otherPoint = -point
      const otherPointTex = texNombre(otherPoint)
      const otherNumeratorLimit = coefficient * otherPoint + constant
      const otherQuotientRightSign = otherNumeratorLimit * -denominatorRightSign
      const otherLeftLimit =
        otherQuotientRightSign < 0 ? '+\\infty' : '-\\infty'
      const otherRightLimit =
        otherQuotientRightSign > 0 ? '+\\infty' : '-\\infty'
      const limit = (side: '-' | '+', at = pointTex) =>
        `\\displaystyle\\lim_{x\\to ${at}^{${side}}}f(x)`
      const answerFields = this.interactif
        ? addMultiMathfield(this, i, {
            dataTemplate: `$${limit('-')}=$%{field0} et $${limit('+')}=$%{field1}${quadratic ? `<br>$${limit('-', otherPointTex)}=$%{field2} et $${limit('+', otherPointTex)}=$%{field3}` : ''}`,
            dataOptions: {
              field0: {
                keyboard: KeyboardType.clavierLimitesSimple,
                ldots: true,
              },
              field1: {
                keyboard: KeyboardType.clavierLimitesSimple,
                ldots: true,
              },
              ...(quadratic
                ? {
                    field2: {
                      keyboard: KeyboardType.clavierLimitesSimple,
                      ldots: true,
                    },
                    field3: {
                      keyboard: KeyboardType.clavierLimitesSimple,
                      ldots: true,
                    },
                  }
                : {}),
            },
          })
        : quadratic
          ? `Calculer les limites à gauche et à droite de $f$ en $${pointTex}$ et en $${otherPointTex}$.`
          : `Calculer les limites à gauche et à droite de $f$ en $${pointTex}$.`
      this.listeQuestions[i] =
        `Soit $f$ la fonction définie sur $\\mathbb R\\setminus\\{${quadratic ? `${texNombre(-root)};${texNombre(root)}` : pointTex}\\}$ par $f(x)=${expression}$.<br>${answerFields}`

      const numeratorExplanation = affineNumerator
        ? `$\\displaystyle\\lim_{x\\to ${pointTex}}(${numerator})=${texNombre(coefficient)}\\times${ecritureParentheseSiMoins(point)}${ecritureAlgebriqueSauf0(constant)}=${texNombre(numeratorLimit)}$<br>`
        : 'Le numérateur est constant, égal à $1$, et strictement positif.<br>'
      const signTable = squared
        ? ''
        : tableauDeVariation({
            tabInit: [
              [
                ['$x$', 1.5, 10],
                [`$${denominator}$`, 1.5, 30],
              ],
              quadratic
                ? [
                    '$-\\infty$',
                    20,
                    `$${texNombre(-root)}$`,
                    20,
                    `$${texNombre(root)}$`,
                    20,
                    '$+\\infty$',
                    20,
                  ]
                : ['$-\\infty$', 20, `$${pointTex}$`, 20, '$+\\infty$', 20],
            ],
            tabLines: [
              quadratic
                ? [
                    'Line',
                    30,
                    '',
                    0,
                    '+',
                    20,
                    'z',
                    10,
                    '-',
                    20,
                    'z',
                    10,
                    '+',
                    20,
                    '',
                    0,
                  ]
                : slope > 0
                  ? ['Line', 30, '', 0, '-', 20, 'z', 10, '+', 20, '', 0]
                  : ['Line', 30, '', 0, '+', 20, 'z', 10, '-', 20, '', 0],
            ],
            espcl: quadratic ? 4 : 2.5,
            lgt: 4,
          })
      const signExplanation = squared
        ? ''
        : quadratic
          ? `Soit $x\\in \\mathbb{R}$.<br>On factorise le dénominateur :<br>$${denominator}=(${reduireAxPlusB(1, -root)})(${reduireAxPlusB(1, root)})$<br>Le produit est positif à l’extérieur des racines et négatif entre les racines.<br>On en déduit le tableau de signes de $${denominator}$.<br>${signTable}<br>`
          : `Soit $x\\in \\mathbb{R}$.<br>On résout $${affineDenominator}>0\\iff ${slope === 1 ? '' : `${reduireAxPlusB(slope, 0)}>${texNombre(slope * point)}\\iff `}x${slope > 0 ? '>' : '\\lt'}${pointTex}$.<br>
      On en déduit le tableau de signes de $${affineDenominator}$ :<br>${signTable}<br>`
      const denominatorExplanation = squared
        ? `Pour tout $x\\neq ${pointTex}$, on a $(${affineDenominator})^2>0$, donc<br>
          $\\displaystyle\\lim_{x\\to ${pointTex}^{-}}(${affineDenominator})^2=0^+$ et $\\displaystyle\\lim_{x\\to ${pointTex}^{+}}(${affineDenominator})^2=0^+$.<br>`
        : `Pour $x\\lt ${pointTex}$, on a $${affineDenominator}${slope > 0 ? '\\lt' : '>'}0$, donc $\\displaystyle\\lim_{x\\to ${pointTex}^{-}}(${affineDenominator})=0^${slope > 0 ? '-' : '+'}$.<br>
          Pour $x>${pointTex}$, on a $${affineDenominator}${slope > 0 ? '>' : '\\lt'}0$, donc $\\displaystyle\\lim_{x\\to ${pointTex}^{+}}(${affineDenominator})=0^${slope > 0 ? '+' : '-'}$.<br>`
      this.listeCorrections[i] =
        `${numeratorExplanation}${signExplanation}${denominatorExplanation}
      ${affineNumerator ? 'Par quotient,' : 'Comme $1>0$, par quotient,'} $${limit('-')}=${miseEnEvidence(leftLimit)}$ et $${limit('+')}=${miseEnEvidence(rightLimit)}$.`
      if (quadratic) {
        const numeratorAt = (at: number) =>
          `$\\displaystyle\\lim_{x\\to ${texNombre(at)}}(${numerator})=${texNombre(coefficient)}\\times${ecritureParentheseSiMoins(at)}${ecritureAlgebriqueSauf0(constant)}=${texNombre(coefficient * at + constant)}$`
        const denominatorAt = (at: number) => {
          const atTex = texNombre(at)
          return `D’après le tableau de signes précédent, au voisinage de $${atTex}$, le dénominateur est ${at > 0 ? 'négatif à gauche et positif à droite' : 'positif à gauche et négatif à droite'}.<br>
          Donc $\\displaystyle\\lim_{x\\to ${atTex}^{-}}(${denominator})=0^{${at > 0 ? '-' : '+'}}$ et $\\displaystyle\\lim_{x\\to ${atTex}^{+}}(${denominator})=0^{${at > 0 ? '+' : '-'}}$`
        }
        this.listeCorrections[i] = createList({
          style: 'none',
          items: [
            {
              description: texteEnCouleurEtGras(
                'Étude du signe du dénominateur',
                bleuMathalea,
              ),
              text: `<br>${signExplanation}`,
            },
            {
              description: texteEnCouleurEtGras(
                `Limites en $${pointTex}$`,
                bleuMathalea,
              ),
              text: `<br>${numeratorAt(point)}<br>${denominatorAt(point)}<br>
              Par quotient, $${limit('-')}=${miseEnEvidence(leftLimit)}$ et $${limit('+')}=${miseEnEvidence(rightLimit)}$.`,
            },
            {
              description: texteEnCouleurEtGras(
                `Limites en $${otherPointTex}$`,
                bleuMathalea,
              ),
              text: `<br>${numeratorAt(otherPoint)}<br>${denominatorAt(otherPoint)}<br>
              Par quotient, $${limit('-', otherPointTex)}=${miseEnEvidence(otherLeftLimit)}$ et $${limit('+', otherPointTex)}=${miseEnEvidence(otherRightLimit)}$.`,
            },
          ],
        })
      }
      handleAnswers(
        this,
        i,
        {
          bareme: toutPourUnPoint,
          field0: { value: leftLimit },
          field1: { value: rightLimit },
          ...(quadratic
            ? {
                field2: { value: otherLeftLimit },
                field3: { value: otherRightLimit },
              }
            : {}),
        },
        { formatInteractif: 'multi-mathfield' },
      )
      i++
    }
    listeQuestionsToContenu(this)
  }
}
