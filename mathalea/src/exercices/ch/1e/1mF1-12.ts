import MonomePlusieursVariables from '../../../lib/mathFonctions/MonomePlusieursVariables'
import PolynomePlusieursVariables from '../../../lib/mathFonctions/PolynomePlusieursVariables'
import { combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import EquationSecondDegre from '../../../modules/EquationSecondDegre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre =
  "Déterminer le domaine de définition d'une fonction inverse ou racine"
export const interactifReady = false

export const dateDePublication = '14/03/2025'
/**
 * @author Nathan Scheinmann
 */

export const uuid = '6ea62'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['1mF1-12'],
}
export default class DomaineDeDefinition extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      8,
      '1 : 1/q(x)\n2 : p(x)/q(x)\n3 : √p(x)\n4 : √p(x)/q(x)\n5 : p(x)/√q(x)\n6 : √p(x)/√q(x)\n7 : √p(x)+√q(x)\n8 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Degrés des polynômes',
      3,
      '1 : 1er degré\n2 : 2e degré\n3 : Mélange',
    ]
    this.sup2 = 3
    this.sup = 1
  }

  solutionEq(p: PolynomePlusieursVariables): FractionEtendue {
    if (p.monomes.length === 1) {
      return new FractionEtendue(0, 1)
    } else {
      const termConst = p.monomes.find(
        (monome) => monome.degre === 0,
      ) as MonomePlusieursVariables
      const termLin = p.monomes.find(
        (monome) => monome.degre === 1,
      ) as MonomePlusieursVariables
      return termConst.coefficient
        .oppose()
        .diviseFraction(termLin.coefficient)
        .simplifie()
    }
  }

  // Notation pour les différents intervalles:
  // sqrt ['o','-infty','f',val], ['f',val,'o','+infty'] ['f',val,'f',val] ou [R,['o',val,'o',val]]
  // 1/x [R,val]] ou [R,val1,val2]]
  computeDomainePolynome(
    type: string,
    p: PolynomePlusieursVariables,
    racinesP: FractionEtendue[],
  ): string[][] {
    if (type === 'sqrt') {
      if (racinesP.length === 1) {
        if (
          p.monomes.find((monome) => monome.degre === 1)?.coefficient.signe ===
          1
        ) {
          return [['f', racinesP[0].texFractionSimplifiee, 'o', '+infty']]
        } else {
          return [['o', '-infty', 'f', racinesP[0].texFractionSimplifiee]]
        }
      } else if (racinesP.length === 2) {
        if (
          p.monomes.find((monome) => monome.degre === 2)?.coefficient.signe ===
          1
        ) {
          return [
            ['o', '-infty', 'f', racinesP[0].texFractionSimplifiee],
            ['f', racinesP[1].texFractionSimplifiee, 'o', '+infty'],
          ]
        } else if (
          p.monomes.find((monome) => monome.degre === 2)?.coefficient.signe ===
          -1
        ) {
          return [
            [
              'f',
              racinesP[0].texFractionSimplifiee,
              'f',
              racinesP[1].texFractionSimplifiee,
            ],
          ]
        }
      }
    } else if (type === 'invSqrt') {
      if (racinesP.length === 1) {
        if (
          p.monomes.find((monome) => monome.degre === 1)?.coefficient.signe ===
          1
        ) {
          return [['o', racinesP[0].texFractionSimplifiee, 'o', '+infty']]
        } else {
          return [['o', '-infty', 'o', racinesP[0].texFractionSimplifiee]]
        }
      } else if (racinesP.length === 2) {
        if (
          p.monomes.find((monome) => monome.degre === 2)?.coefficient.signe ===
          1
        ) {
          return [
            ['o', '-infty', 'o', racinesP[0].texFractionSimplifiee],
            ['o', racinesP[1].texFractionSimplifiee, 'o', '+infty'],
          ]
        } else if (
          p.monomes.find((monome) => monome.degre === 2)?.coefficient.signe ===
          -1
        ) {
          return [
            [
              'o',
              racinesP[0].texFractionSimplifiee,
              'o',
              racinesP[1].texFractionSimplifiee,
            ],
          ]
        }
      }
    } else if (type === 'inverse') {
      if (racinesP.length === 1) {
        return [['R', racinesP[0].texFractionSimplifiee]]
      } else if (racinesP.length === 2) {
        return [
          [
            'R',
            racinesP[0].texFractionSimplifiee,
            racinesP[1].texFractionSimplifiee,
          ],
        ]
      }
    }
    return [['']]
  }

  // --- Helper: parse an endpoint (assumes LaTeX fractions like "\dfrac{num}{den}" or ±infty)
  parseEndpoint(s: string): number {
    if (s === '+infty') return Infinity
    if (s === '-infty') return -Infinity
    const regex = /\\dfrac\{([^}]+)\}\{([^}]+)\}/
    const match = s.match(regex)
    if (match) {
      // Replace commas with dots if needed
      const num = parseFloat(match[1].replace(',', '.'))
      const den = parseFloat(match[2].replace(',', '.'))
      if (s.match(/-/)) {
        return -num / den
      } else {
        return num / den
      }
    }
    return parseFloat(s)
  }

  // --- Existing helper: intersect two intervals (works for both sqrt– and R–types)
  intersectTwoIntervals(i1: string[], i2: string[]): string[][] {
    // Both are R–type:
    if (i1[0] === 'R' && i2[0] === 'R') {
      const exclusions = Array.from(new Set([...i1.slice(1), ...i2.slice(1)]))
      exclusions.sort((a, b) => this.parseEndpoint(a) - this.parseEndpoint(b))
      return [['R', ...exclusions]]
    }
    // One is R–type and one is sqrt–type:
    if (i1[0] === 'R' && i2[0] !== 'R') {
      return this.intersectSqrtAndR(i2, i1)
    }
    if (i2[0] === 'R' && i1[0] !== 'R') {
      return this.intersectSqrtAndR(i1, i2)
    }
    // Both are sqrt–type: expected format [lMarker, lVal, rMarker, rVal]
    const l1 = this.parseEndpoint(i1[1])
    const u1 = this.parseEndpoint(i1[3])
    const l2 = this.parseEndpoint(i2[1])
    const u2 = this.parseEndpoint(i2[3])

    // Lower bound: maximum of the two lower endpoints.
    let newLower: string, newLowerMarker: string
    if (l1 > l2) {
      newLower = i1[1]
      newLowerMarker = i1[0]
    } else if (l2 > l1) {
      newLower = i2[1]
      newLowerMarker = i2[0]
    } else {
      newLower = i1[1]
      newLowerMarker = i1[0] === 'o' || i2[0] === 'o' ? 'o' : 'f'
    }
    // Upper bound: minimum of the two upper endpoints.
    let newUpper: string, newUpperMarker: string
    if (u1 < u2) {
      newUpper = i1[3]
      newUpperMarker = i1[2]
    } else if (u2 < u1) {
      newUpper = i2[3]
      newUpperMarker = i2[2]
    } else {
      newUpper = i1[3]
      newUpperMarker = i1[2] === 'o' || i2[2] === 'o' ? 'o' : 'f'
    }
    const lowerVal = this.parseEndpoint(newLower)
    const upperVal = this.parseEndpoint(newUpper)
    if (
      lowerVal > upperVal ||
      (lowerVal === upperVal &&
        (newLowerMarker === 'o' || newUpperMarker === 'o'))
    ) {
      return [] // no intersection
    }
    return [[newLowerMarker, newLower, newUpperMarker, newUpper]]
  }

  // --- Helper: intersect a sqrt–type interval with an R–type interval
  intersectSqrtAndR(sqrtInterval: string[], rInterval: string[]): string[][] {
    const exclusions = rInterval.slice(1)
    let intervals: string[][] = [sqrtInterval]
    exclusions.forEach((ex) => {
      const exVal = this.parseEndpoint(ex)
      const newIntervals: string[][] = []
      intervals.forEach((inter) => {
        const lVal = this.parseEndpoint(inter[1])
        const uVal = this.parseEndpoint(inter[3])
        if (exVal <= lVal || exVal >= uVal) {
          newIntervals.push(inter)
        } else {
          const left = [inter[0], inter[1], 'o', ex]
          const right = ['o', ex, inter[2], inter[3]]
          if (this.parseEndpoint(left[1]) < this.parseEndpoint(left[3]))
            newIntervals.push(left)
          if (this.parseEndpoint(right[1]) < this.parseEndpoint(right[3]))
            newIntervals.push(right)
        }
      })
      intervals = newIntervals
    })
    return intervals
  }

  // --- NEW: reduce (merge) overlapping or adjacent sqrt–intervals
  reduceUnionSqrt(intervals: string[][]): string[][] {
    // Expect intervals in sqrt–format: [marker, left, marker, right]
    type IntervalObj = {
      left: number
      right: number
      leftMarker: string // 'o' for open, 'f' for closed
      rightMarker: string
      leftStr: string
      rightStr: string
    }

    const objs: IntervalObj[] = intervals.map((interval) => ({
      left: this.parseEndpoint(interval[1]),
      right: this.parseEndpoint(interval[3]),
      leftMarker: interval[0],
      rightMarker: interval[2],
      leftStr: interval[1],
      rightStr: interval[3],
    }))

    // Sort by left endpoint; if equal, closed endpoints (f) come before open (o).
    objs.sort((a, b) => {
      if (a.left !== b.left) return a.left - b.left
      return a.leftMarker === b.leftMarker ? 0 : a.leftMarker === 'f' ? -1 : 1
    })

    const merged: IntervalObj[] = []
    for (const cur of objs) {
      if (merged.length === 0) {
        merged.push({ ...cur })
      } else {
        const last = merged[merged.length - 1]
        // Check if cur overlaps or touches last.
        if (
          cur.left < last.right ||
          (cur.left === last.right &&
            (last.rightMarker === 'f' || cur.leftMarker === 'f'))
        ) {
          // Extend the merged interval if needed.
          if (cur.right > last.right) {
            last.right = cur.right
            last.rightMarker = cur.rightMarker
            last.rightStr = cur.rightStr
          } else if (cur.right === last.right) {
            if (last.rightMarker === 'o' && cur.rightMarker === 'f') {
              last.rightMarker = 'f'
            }
          }
        } else {
          merged.push({ ...cur })
        }
      }
    }

    // If the merged union covers the whole real line, return an R–type interval.
    if (
      merged.length === 1 &&
      merged[0].left === -Infinity &&
      merged[0].right === Infinity
    ) {
      return [['R']]
    }
    if (merged.length === 0) return [[]] // no intervals left
    // Convert merged objects back to our string[][] format.
    return merged.map((obj) => [
      obj.leftMarker,
      obj.leftStr,
      obj.rightMarker,
      obj.rightStr,
    ])
  }

  // --- Updated intersectDomains that calls reduceUnionSqrt on sqrt–type intervals
  intersectDomains(domain1: string[][], domain2: string[][]): string[][] {
    let result: string[][] = []
    domain1.forEach((interval1) => {
      domain2.forEach((interval2) => {
        const inter = this.intersectTwoIntervals(interval1, interval2)
        result.push(...inter)
      })
    })

    // If all results are sqrt–type intervals, try to reduce the union.
    const allSqrt = result.every(
      (interval) => interval.length === 4 && interval[0] !== 'R',
    )
    if (allSqrt) {
      result = this.reduceUnionSqrt(result)
    }
    return result
  }

  convertDomainToLatex(domain: string[][]): string {
    // Helper to convert an endpoint to its LaTeX representation.
    function convertEndpoint(ep: string): string {
      if (ep === '+infty') return '+\\infty'
      if (ep === '-infty') return '-\\infty'
      return ep // Assume already in LaTeX form (e.g. "\dfrac{num}{den}")
    }

    const intervalsLatex: string[] = []
    for (const interval of domain) {
      // Handle R-type intervals: ℝ minus some excluded points.
      if (interval.length === 0) {
        intervalsLatex.push('\\emptyset')
      } else if (interval[0] === 'R') {
        const exclusions = interval
          .slice(1)
          .map(convertEndpoint)
          .join('\\,;\\,')
        intervalsLatex.push(
          `\\mathbb{R}\\setminus\\left\\{${exclusions}\\right\\}`,
        )
      } else if (interval.length === 4) {
        const [lMarker, lValue, rMarker, rValue] = interval
        // 'f' stands for closed (use [ or ]) and 'o' stands for open (use ( or ))
        const leftBracket = lMarker === 'f' ? '\\left[' : '\\left]'
        const rightBracket = rMarker === 'f' ? '\\right]' : '\\right['
        const leftValLatex = convertEndpoint(lValue)
        const rightValLatex = convertEndpoint(rValue)
        // Use a semicolon as the separator with a thin space before and after.
        intervalsLatex.push(
          `${leftBracket}${leftValLatex}\\,;\\,${rightValLatex}${rightBracket}`,
        )
      } else {
        intervalsLatex.push(interval.join('\\,;\\,'))
      }
    }

    // Join multiple intervals using the union symbol.
    return intervalsLatex.join(' \\cup ')
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []
    this.autoCorrection = []
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 8,
      defaut: 1,
      listeOfCase: [
        '1/q',
        'p/q',
        'racineP',
        'racineP/q',
        'p/racineQ',
        'racineP/racineQ',
        'racineP+racineQ',
      ],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      texte =
        'Déterminer le domaine de définition de la fonction $f$ définie par $f(x) = '
      let p: PolynomePlusieursVariables
      let q: PolynomePlusieursVariables
      let pEq: EquationSecondDegre
      let qEq: EquationSecondDegre
      let stringQ = ''
      let stringP = ''
      let racinesP: FractionEtendue[]
      let racinesQ: FractionEtendue[]
      let degP: number
      let degQ: number
      if (this.sup2 === 3) {
        degP = randint(1, 2)
        degQ = randint(1, 2)
      } else if (this.sup2 === 2) {
        degP = 2
        degQ = 2
      } else {
        degP = 1
        degQ = 1
      }
      if (degP === 2 && degQ === 2) {
        do {
          const a = new FractionEtendue(
            randint(-10, 10, [0]),
            randint(-10, 10, [0]),
          ).simplifie()
          const b = new FractionEtendue(
            randint(-10, 10, [0]),
            randint(-10, 10, [0]),
          ).simplifie()
          const c = new FractionEtendue(
            randint(-10, 10, [0]),
            randint(-10, 10, [0]),
          ).simplifie()
          const d = new FractionEtendue(
            randint(-10, 10, [0]),
            randint(-10, 10, [0]),
          ).simplifie()
          pEq = EquationSecondDegre.aPartirDesSolutions(
            a,
            b,
            new FractionEtendue(a.den * b.den, 1),
            { variable: 'x', format: 'reduit' },
          )
          qEq = EquationSecondDegre.aPartirDesSolutions(
            c,
            d,
            new FractionEtendue(c.den * d.den, 1),
            { variable: 'x', format: 'reduit' },
          )
        } while (
          pEq.equationTex === qEq.equationTex &&
          pEq.delta.signe !== 1 &&
          qEq.delta.signe !== 1
        )
        p = pEq.polynomeFormeReduite()
        q = qEq.polynomeFormeReduite()
        racinesP = pEq.solutionFrac() as FractionEtendue[]
        racinesQ = qEq.solutionFrac() as FractionEtendue[]
      } else if (degP === 1 && degQ === 2) {
        do {
          const a = new FractionEtendue(
            randint(-10, 10, [0]),
            randint(-10, 10, [0]),
          ).simplifie()
          const b = new FractionEtendue(
            randint(-10, 10, [0]),
            randint(-10, 10, [0]),
          ).simplifie()
          pEq = EquationSecondDegre.aPartirDesSolutions(
            a,
            b,
            new FractionEtendue(a.den * b.den, 1),
            { variable: 'x', format: 'reduit' },
          )
        } while (pEq.delta.signe !== 1)
        p = pEq.polynomeFormeReduite()
        racinesP = pEq.solutionFrac() as FractionEtendue[]
        q = PolynomePlusieursVariables.createRandomPolynome(1, 1, 2, 'entier', [
          'x',
        ])
        racinesQ = [this.solutionEq(q)]
      } else if (degP === 2 && degQ === 1) {
        do {
          const a = new FractionEtendue(
            randint(-10, 10, [0]),
            randint(-10, 10, [0]),
          ).simplifie()
          const b = new FractionEtendue(
            randint(-10, 10, [0]),
            randint(-10, 10, [0]),
          ).simplifie()
          qEq = EquationSecondDegre.aPartirDesSolutions(
            a,
            b,
            new FractionEtendue(a.den * b.den, 1),
            { variable: 'x', format: 'reduit' },
          )
        } while (qEq.delta.signe !== 1)
        q = qEq.polynomeFormeReduite()
        racinesQ = qEq.solutionFrac() as FractionEtendue[]
        p = PolynomePlusieursVariables.createRandomPolynome(1, 1, 2, 'entier', [
          'x',
        ])
        racinesP = [this.solutionEq(p)]
      } else {
        p = PolynomePlusieursVariables.createRandomPolynome(1, 1, 2, 'entier', [
          'x',
        ])
        q = PolynomePlusieursVariables.createRandomPolynome(1, 1, 2, 'entier', [
          'x',
        ])
        racinesP = [this.solutionEq(p)]
        racinesQ = [this.solutionEq(q)]
      }
      stringP = p.toString()
      stringQ = q.toString()
      const coeffDomP = p.ordonner().monomes[0].coefficient
      const coeffDomQ = q.ordonner().monomes[0].coefficient
      switch (listeTypeDeQuestions[i]) {
        case '1/q':
          {
            const domLatexQ = this.convertDomainToLatex(
              this.computeDomainePolynome('inverse', q, racinesQ),
            )

            texte += `\\dfrac{1}{${stringQ}}$`
            texteCorr += `La condition sur le domaine de définition est la suivante \\[${stringQ}\\neq 0,\\] car le dénominateur d'une fraction ne peut pas valoir $0$. `
            if (degQ === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringQ}$. On obtient que ces valeurs sont $\\left\\{${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ `
            } else {
              texteCorr += `La valeur qui annule $${stringQ}$ est $${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}.$ `
            }
            texteCorr += `Ainsi, le domaine de définition est donné par
          \\[D_f=${miseEnEvidence(domLatexQ)}\\]`
          }
          break
        case 'p/q':
          {
            const domLatexQ = this.convertDomainToLatex(
              this.computeDomainePolynome('inverse', q, racinesQ),
            )

            texte += `\\dfrac{${stringP}}{${stringQ}}$`
            texteCorr += `La condition sur le domaine de définition est la suivante \\[${stringQ}\\neq 0,\\] car le dénominateur d'une fraction ne peut pas valoir $0$. <br> Le numérateur n'influence pas le domaine de définition dans ce cas.`
            if (degQ === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringQ}$. On obtient que ces valeurs sont $\\left\\{${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ `
            } else {
              texteCorr += `La valeur qui annule $${stringQ}$ est $${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}.$ `
            }
            texteCorr += `Ainsi, le domaine de définition est donné par
          \\[D_f=${miseEnEvidence(domLatexQ)}\\]`
          }
          break
        case 'racineP':
          {
            texte += `\\sqrt{${stringP}}$`
            const domLatexP = this.convertDomainToLatex(
              this.computeDomainePolynome('sqrt', p, racinesP),
            )
            texteCorr += `La condition sur le domaine de définition est la suivante : \\[${stringP}\\geqslant 0,\\] car la racine est définie sur les nombres positifs.
          <br>`
            if (degP === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringP}$. On obtient que ces valeurs sont $\\left\\{${racinesP.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ Le coefficient dominant de $${stringP}$ est $${coeffDomP.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la parabole associée est ${coeffDomP.signe === 1 ? 'convexe' : 'concave'}. `
            } else {
              texteCorr += `Le zéro de $${stringP}$ est $${racinesP.map((item) => item.texFractionSimplifiee).join(',')}.$ La pente de $${stringP}$ est $${coeffDomP.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la droite associée est ${coeffDomP.signe === 1 ? 'croissante' : 'décroissante'}. `
            }
            texteCorr += `Ainsi, $${stringP}$ est positif sur l'intervalle sur l'intervalle $${domLatexP}$, c'est également l'intervalle qui vérifie la première condition.<br> Le domaine de définition de $f$ correspond à l'intervalle déterminé '
          \\[D_f=${miseEnEvidence(domLatexP)}\\]`
          }
          break
        case 'racineP/q':
          {
            texte += `\\dfrac{\\sqrt{${stringP}}}{${stringQ}}$`
            const domLatexP = this.convertDomainToLatex(
              this.computeDomainePolynome('sqrt', p, racinesP),
            )
            const domLatexQ = this.convertDomainToLatex(
              this.computeDomainePolynome('inverse', q, racinesQ),
            )
            texteCorr += `Les conditions sur le domaine de définition sont les suivantes : \\[\\text{Première condition : }${stringP}\\geqslant 0,\\] car la racine est définie sur les nombres positifs. \\[\\text{Deuxième condition : }${stringQ}\\neq 0,\\] car le dénominateur ne peut pas valoir $0$.
          <br>`
            if (degP === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringP}$. On obtient que ces valeurs sont $\\left\\{${racinesP.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ Le coefficient dominant de $${stringP}$ est $${coeffDomP.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la parabole associée est ${coeffDomP.signe === 1 ? 'convexe' : 'concave'}. `
            } else {
              texteCorr += `Le zéro de $${stringP}$ est $${racinesP.map((item) => item.texFractionSimplifiee).join(',')}.$ La pente de $${stringP}$ est $${coeffDomP.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la droite associée est ${coeffDomP.signe === 1 ? 'croissante' : 'décroissante'}. `
            }
            texteCorr += `Ainsi, $${stringP}$ est positif sur l'intervalle sur l'intervalle $${domLatexP}$, c'est également l'intervalle qui vérifie la première condition.<br> On s'occupe à présent de la deuxième condition. `
            if (degQ === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringQ}$. On obtient que ces valeurs sont $\\left\\{${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ `
            } else {
              texteCorr += `Le zéro de $${stringQ}$ est $${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}.$ `
            }
            texteCorr += `Ainsi, $${stringQ}$ est différent de zéro sur l'intervalle $${domLatexQ}$, c'est également l'intervalle qui vérifie la deuxième condition.<br> Le domaine de définition de $f$ correspond à l'intersection des deux intervalles 
          \\[D_f=${domLatexP.match('cup') ? '\\left (\\,' : ''}${domLatexP}${domLatexP.match('cup') ? '\\,\\right )' : ''}\\cap ${domLatexQ.match('cup') ? '\\left (\\,' : ''}${domLatexQ}${domLatexQ.match('cup') ? '\\,\\right )' : ''}=${miseEnEvidence(this.convertDomainToLatex(this.intersectDomains(this.computeDomainePolynome('inverse', q, racinesQ), this.computeDomainePolynome('sqrt', p, racinesP))))}\\]`
          }
          break
        case 'p/racineQ':
          {
            texte += `\\dfrac{${stringP}}{\\sqrt{${stringQ}}}$`
            const domLatexQ = this.convertDomainToLatex(
              this.computeDomainePolynome('invSqrt', q, racinesQ),
            )
            texteCorr += `La condition sur le domaine de définition est la suivante\\[${stringQ}> 0,\\] car la racine est définie sur les nombres positifs et le dénominateur ne peut pas valoir $0$. Le numérateur n'influence pas le domaine de définition dans ce cas.
          <br>`
            if (degQ === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringQ}$. On obtient que ces valeurs sont $\\left\\{${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ Le coefficient dominant de $${stringQ}$ est $${coeffDomQ.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la parabole associée est ${coeffDomQ.signe === 1 ? 'convexe' : 'concave'}. `
            } else {
              texteCorr += `Le zéro de $${stringQ}$ est $${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}.$ La pente de $${stringQ}$ est $${coeffDomQ.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la droite associée est ${coeffDomQ.signe === 1 ? 'croissante' : 'décroissante'}. `
            }
            texteCorr += `Ainsi, $${stringQ}$ est strictement positif sur l'intervalle $${domLatexQ}$, c'est également l'intervalle qui vérifie la deuxième condition.<br> Le domaine de définition de $f$ est donc
          \\[D_f=${miseEnEvidence(domLatexQ)}\\]`
          }
          break
        case 'racineP/racineQ':
          {
            const domLatexP = this.convertDomainToLatex(
              this.computeDomainePolynome('sqrt', p, racinesP),
            )
            const domLatexQ = this.convertDomainToLatex(
              this.computeDomainePolynome('invSqrt', q, racinesQ),
            )
            texte += `\\dfrac{\\sqrt{${stringP}}}{\\sqrt{${stringQ}}}$`
            texteCorr += `Les conditions sur le domaine de définition sont les suivantes : \\[\\text{Première condition : }${stringP}\\geqslant 0,\\] car la racine est définie sur les nombres positifs. \\[\\text{Deuxième condition : }${stringQ}> 0,\\] car la racine est définie sur les nombres positifs et le dénominateur ne peut pas valoir $0$.
          <br>`
            if (degP === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringP}$. On obtient que ces valeurs sont $\\left\\{${racinesP.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ Le coefficient dominant de $${stringP}$ est $${coeffDomP.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la parabole associée est ${coeffDomP.signe === 1 ? 'convexe' : 'concave'}. `
            } else {
              texteCorr += `Le zéro de $${stringP}$ est $${racinesP.map((item) => item.texFractionSimplifiee).join(',')}.$ La pente de $${stringP}$ est $${coeffDomP.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la droite associée est ${coeffDomP.signe === 1 ? 'croissante' : 'décroissante'}. `
            }
            texteCorr += `Ainsi, $${stringP}$ est positif sur l'intervalle sur l'intervalle $${domLatexP}$, c'est également l'intervalle qui vérifie la première condition.<br> On fait de même avec $${stringQ}$. `
            if (degQ === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringQ}$. On obtient que ces valeurs sont $\\left\\{${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ Le coefficient dominant de $${stringQ}$ est $${coeffDomQ.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la parabole associée est ${coeffDomQ.signe === 1 ? 'convexe' : 'concave'}. `
            } else {
              texteCorr += `Le zéro de $${stringQ}$ est $${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}.$ La pente de $${stringQ}$ est $${coeffDomQ.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la droite associée est ${coeffDomQ.signe === 1 ? 'croissante' : 'décroissante'}. `
            }
            texteCorr += `Ainsi, $${stringQ}$ est strictement positif sur l'intervalle $${domLatexQ}$, c'est également l'intervalle qui vérifie la deuxième condition.<br> Le domaine de définition de $f$ correspond à l'intersection des deux intervalles 
          \\[D_f=${domLatexP.match('cup') ? '\\left (\\,' : ''}${domLatexP}${domLatexP.match('cup') ? '\\,\\right )' : ''}\\cap ${domLatexQ.match('cup') ? '\\left (\\,' : ''}${domLatexQ}${domLatexQ.match('cup') ? '\\,\\right )' : ''}=${miseEnEvidence(this.convertDomainToLatex(this.intersectDomains(this.computeDomainePolynome('invSqrt', q, racinesQ), this.computeDomainePolynome('sqrt', p, racinesP))))}\\]`
          }
          break
        case 'racineP+racineQ':
          {
            texte += `\\sqrt{${stringP}}+\\sqrt{${stringQ}}$`
            const domLatexP = this.convertDomainToLatex(
              this.computeDomainePolynome('sqrt', p, racinesP),
            )
            const domLatexQ = this.convertDomainToLatex(
              this.computeDomainePolynome('sqrt', q, racinesQ),
            )
            texteCorr += `Les conditions sur le domaine de définition sont les suivantes : \\[\\text{Première condition : }${stringP}\\geqslant 0\\] \\[\\text{Deuxième condition : }${stringQ}\\geqslant 0,\\] car la racine est définie sur les nombres positifs.
          <br>`
            if (degP === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringP}$. On obtient que ces valeurs sont $\\left\\{${racinesP.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ Le coefficient dominant de $${stringP}$ est $${coeffDomP.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la parabole associée est ${coeffDomP.signe === 1 ? 'convexe' : 'concave'}. `
            } else {
              texteCorr += `Le zéro de $${stringP}$ est $${racinesP.map((item) => item.texFractionSimplifiee).join(',')}.$ La pente de $${stringP}$ est $${coeffDomP.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la droite associée est ${coeffDomP.signe === 1 ? 'croissante' : 'décroissante'}. `
            }
            texteCorr += `Ainsi, $${stringP}$ est positif sur l'intervalle sur l'intervalle $${domLatexP}$, c'est également l'intervalle qui vérifie la première condition.<br> On fait de même avec $${stringQ}$. `
            if (degQ === 2) {
              texteCorr += `On détermine les valeurs qui annulent $${stringQ}$. On obtient que ces valeurs sont $\\left\\{${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}\\right\\}.$ Le coefficient dominant de $${stringQ}$ est $${coeffDomQ.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la parabole associée est ${coeffDomQ.signe === 1 ? 'convexe' : 'concave'}. `
            } else {
              texteCorr += `Le zéro de $${stringQ}$ est $${racinesQ.map((item) => item.texFractionSimplifiee).join(',')}.$ La pente de $${stringQ}$ est $${coeffDomQ.texFractionSimplifiee}${coeffDomP.signe === 1 ? '>0' : '<0'}$, donc la droite associée est ${coeffDomQ.signe === 1 ? 'croissante' : 'décroissante'}. `
            }
            texteCorr += `Ainsi, $${stringQ}$ est positif sur l'intervalle $${domLatexQ}$, c'est également l'intervalle qui vérifie la deuxième condition.<br> Le domaine de définition de $f$ correspond à l'intersection des deux intervalles 
          \\[D_f=${domLatexP.match('cup') ? '\\left (\\,' : ''}${domLatexP}${domLatexP.match('cup') ? '\\,\\right )' : ''}\\cap ${domLatexQ.match('cup') ? '\\left (\\,' : ''}${domLatexQ}${domLatexQ.match('cup') ? '\\,\\right )' : ''}=${miseEnEvidence(this.convertDomainToLatex(this.intersectDomains(this.computeDomainePolynome('sqrt', q, racinesQ), this.computeDomainePolynome('sqrt', p, racinesP))))}\\]`
          }
          break
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++

      listeQuestionsToContenu(this)
    }
  }
}
