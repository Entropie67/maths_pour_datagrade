import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { Courbe } from '../../../lib/2d/Courbe'
import {
    droiteHorizontaleParPoint,
    droiteVerticaleParPoint,
} from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import type { TracePoint } from '../../../lib/2d/TracePoint'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { bleuMathalea } from '../../../lib/colors'
import { createList } from '../../../lib/format/lists'
import { tableauSignesFacteurs } from '../../../lib/mathFonctions/etudeFonction'
import MonomePlusieursVariables from '../../../lib/mathFonctions/MonomePlusieursVariables'
import PolynomePlusieursVariables from '../../../lib/mathFonctions/PolynomePlusieursVariables'
import {
    ecritureAlgebrique,
    ecritureAlgebriqueSauf0,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Étudier une fonction homographiquee et tracer sa courbe représentative'
export const dateDePublication = '17/11/2025'
export const interactifReady = false
export const uuid = '2rgct'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mFctRat-1'],
}

/**
 * Étudier une fonction homographiquee et tracer sa courbe représentative
 * @author Nathan Scheinmann
 */

export default class ExerciceTangenteCourbe extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaire2CaseACocher = ['Numérateur constant', true]
    this.besoinFormulaire3CaseACocher = [
      'Avec la recherche des asymptotes',
      true,
    ]
    this.besoinFormulaire4CaseACocher = [
      'Avec la question sur la représentation graphique',
      true,
    ]
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let xInterditFrac = new FractionEtendue(1, 1)
      let xInterdit = 0.1
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      do {
        a = this.sup2 ? 0 : randint(1, 5, [0])
        b = randint(-10, 10, [0])
        c = randint(-10, 10, [0])
        d = randint(-10, 10, [0])
        xInterditFrac = new FractionEtendue(-d, c)
        xInterdit = xInterditFrac.valeurDecimale
      } while (xInterdit > 4 || xInterdit < -4)
      const fnum = new PolynomePlusieursVariables([
        new MonomePlusieursVariables(new FractionEtendue(a, 1), {
          variables: ['x'],
          exposants: [1],
        }),
        new MonomePlusieursVariables(new FractionEtendue(b, 1), {
          variables: ['x'],
          exposants: [0],
        }),
      ])
      const fden = new PolynomePlusieursVariables([
        new MonomePlusieursVariables(new FractionEtendue(c, 1), {
          variables: ['x'],
          exposants: [1],
        }),
        new MonomePlusieursVariables(new FractionEtendue(d, 1), {
          variables: ['x'],
          exposants: [0],
        }),
      ])
      const f = (x: number) =>
        fnum.evaluer({ x: new FractionEtendue(x, 1) }).valeurDecimale /
        fden.evaluer({ x: new FractionEtendue(x, 1) }).valeurDecimale
      let valLimG = -0.5
      do {
        valLimG = valLimG + 0.05
      } while (Math.abs(f(xInterdit + valLimG)) < 10)
      let valLimD = 0.5
      do {
        valLimD = valLimD - 0.05
      } while (Math.abs(f(xInterdit + valLimD)) < 10)
      const r = repere({
        xMin: -8,
        xMax: 8,
        yMin: -8,
        yMax: 8,
        yLabelEcart: 0.8,
        yLabelDistance: 2,
        xLabelDistance: 2,
        grilleX: false,
        grilleY: false,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: -8,
        grilleSecondaireYMax: 8,
        grilleSecondaireXMin: -8,
        grilleSecondaireXMax: 8,
      })
      const courbe1 = new Courbe(f, {
        repere: r,
        step: 0.03,
        xMin: -8,
        xMax: xInterdit + valLimG,
        yMin: -1000,
        yMax: 1000,
        usePgfplots: true,
        fLatex: `(${a}*x+${b})/(${c}*x+${d})`, // Use the polynomial's pgfplots expression
      })
      courbe1.color = colorToLatexOrHTML('red')
      courbe1.epaisseur = 1
      const courbe2 = new Courbe(f, {
        repere: r,
        step: 0.03,
        xMin: xInterdit + valLimD,
        xMax: 8,
        yMin: -1000,
        yMax: 1000,
        usePgfplots: true,
        fLatex: `(${a}*x+${b})/(${c}*x+${d})`, // Use the polynomial's pgfplots expression
      })
      courbe2.color = colorToLatexOrHTML('red')
      courbe2.epaisseur = 1
      const asymptoteVerticale = droiteVerticaleParPoint(
        pointAbstrait(xInterdit, 0),
        '',
        bleuMathalea,
      )
      asymptoteVerticale.pointilles = 5
      asymptoteVerticale.usePgfplots = true
      asymptoteVerticale.pgfplotsOptions = 'dashed'
      const yAsymptote = a / c
      const asymptoteHorizontale = droiteHorizontaleParPoint(
        pointAbstrait(0, yAsymptote),
        '',
        bleuMathalea,
      )
      asymptoteHorizontale.pointilles = 5
      asymptoteHorizontale.usePgfplots = true
      asymptoteHorizontale.pgfplotsOptions = 'dashed'

      const intersectionPoints: TracePoint[] = []
      if (a !== 0) {
        const xZero = -b / a
        const pointIntersectionX = tracePoint(pointAbstrait(xZero, 0), 'green')
        pointIntersectionX.style = 'x'
        pointIntersectionX.taille = 4
        pointIntersectionX.tailleTikz = pointIntersectionX.taille / 15
        pointIntersectionX.usePgfplots = true
        pointIntersectionX.pgfplotsMark = 'x'
        pointIntersectionX.pgfplotsOptions = 'thick'
        intersectionPoints.push(pointIntersectionX)
      }
      if (d !== 0) {
        const yZero = b / d
        const pointIntersectionY = tracePoint(pointAbstrait(0, yZero), 'green')
        pointIntersectionY.style = 'x'
        pointIntersectionY.taille = 4
        pointIntersectionY.tailleTikz = pointIntersectionY.taille / 15
        pointIntersectionY.usePgfplots = true
        pointIntersectionY.pgfplotsMark = 'x'
        pointIntersectionY.pgfplotsOptions = 'thick'
        intersectionPoints.push(pointIntersectionY)
      }

      const o = texteParPosition('O', -0.5, -0.5, 0, 'black', 1)
      const fString = this.sup2
        ? `\\dfrac{${b}}{${rienSi1(c)}x${ecritureAlgebriqueSauf0(d)}}`
        : `\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(b)}}{${rienSi1(c)}x${ecritureAlgebriqueSauf0(d)}}`
      const numString = this.sup2
        ? `${b}`
        : `${rienSi1(a)}x${ecritureAlgebrique(b)}`
      const denString = `${rienSi1(c)}x${ecritureAlgebriqueSauf0(d)}`
      texte += `Soit la fonction homographique $f$ définie par $f(x)=${fString}$.<br>`
      let sousquestions = [
        `Déterminer le domaine de définition de $f$.`,
        `Déterminer les intersections avec les axes.`,
        `Déterminer les équations respectives des asymptotes verticales et horizontales, si la fonction en admet.`,
        `Établir un tableau des signes.`,
      ]
      // remove the second element of the list
      sousquestions = this.sup3
        ? sousquestions
        : sousquestions.filter((_, index) => index !== 2)
      const question1 =
        `Étudier la fonction $f$.` +
        createList({
          items: sousquestions,
          style: 'roman',
        })
      const question2 = `Tracer la courbe représentative de $f$ à l'aide des informations précédemment trouvées.`
      const questions = this.sup4 ? [question1, question2] : [question1]
      if (this.sup4) {
        texte += createList({
          items: questions,
          style: 'alpha',
        })
      } else {
        texte += questions[0]
      }
      const cor1 = `On exclut du domaine de définition les valeurs de $x$ qui annulent le dénominateur, c'est-à-dire on résout l'équation $${rienSi1(c)}x${ecritureAlgebriqueSauf0(d)}=0$, ce qui donne $x=${new FractionEtendue(-d, c).texFractionSimplifiee}$.<br>$${miseEnEvidence(`D_f=\\mathbb{R}\\setminus\\left\\{${new FractionEtendue(-d, c).texFractionSimplifiee}\\right\\}`)}$.<br>`
      let cor2 = `Pour déterminer l'intersection avec l'axe des abscisses, on détermine les zéros de $f$, c'est-à-dire les valeurs de $x$ qui annulent le numérateur. `
      if (this.sup2) {
        cor2 += `Comme le numérateur est constant et non nul, la fonction $f$ n'admet pas d'intersection avec l'axe des abscisses.<br>`
      } else {
        cor2 += `On résout l'équation $${rienSi1(a)}x${ecritureAlgebrique(b)}=0$, ce qui donne $x=${new FractionEtendue(-b, a).texFractionSimplifiee}$.`
      }
      cor2 += `<br>L'intersection avec l'axe des ordonnées s'obtient en calculant $f(0)=${new FractionEtendue(b, d).texFractionSimplifiee}$.<br>`
      if (this.sup2) {
        cor2 += `Ainsi, $${miseEnEvidence(`\\left\\{\\left(0\\,;\\,${new FractionEtendue(b, d).texFractionSimplifiee}\\right)\\right\\}`)}$ est le point d'intersection de la courbe représentative de $f$ avec l'axe des ordonnées. <br>`
      } else {
        cor2 += `Ainsi, $${miseEnEvidence(`\\left\\{\\left(${new FractionEtendue(-b, a).texFractionSimplifiee}\\,;\\,0\\right)\\right\\}`)}$ et $${miseEnEvidence(`\\left\\{\\left(0\\,;\\,${new FractionEtendue(b, d).texFractionSimplifiee}\\right)\\right\\}`)}$ sont, respectivement, les points d'intersection de la courbe représentative de $f$ avec les axes des abscisses et des ordonées. <br>`
      }
      const cor3 = `L'asymptote verticale a pour équation $${miseEnEvidence(`x=${new FractionEtendue(-d, c).texFractionSimplifiee}`)}$, la valeur exclue du domaine de définition.<br> L'asymptote horizontale a pour équation $y=\\dfrac{a}{c}$ où $a$ et $c$ sont les coefficient dans l'expression générale d'une fonction homographique $\\dfrac{ax+b}{cx+d}$. Dans notre cas, $${miseEnEvidence(`y=${new FractionEtendue(a, c).texFractionSimplifiee}`)}$.<br>`
      let tableHtml = ''
      if (this.sup2) {
        tableHtml = tableauSignesFacteurs(
          [
            {
              nom: `$${numString}$`,
              fonction: (x) => b,
            },
            {
              nom: `$${denString}$`,
              fonction: (x: number) => c * x + d,
              zero: { valeur: xInterditFrac, interdit: true },
            },
          ],
          -15,
          15,
          {
            nomFonction: '$f(x)$',
            fractionTex: true,
            borneInf: '-\\infty',
            borneSup: '+\\infty',
          },
        )
      } else {
        tableHtml = tableauSignesFacteurs(
          [
            {
              nom: `$${numString}$`,
              fonction: (x) => a * x + b,
              zero: { valeur: new FractionEtendue(-b, a), interdit: false },
            },
            {
              nom: `$${denString}$`,
              fonction: (x) => c * x + d,
              zero: { valeur: xInterditFrac, interdit: true },
            },
          ],
          -15,
          15,
          {
            nomFonction: '$f(x)$',
            fractionTex: true,
            borneInf: '-\\infty',
            borneSup: '+\\infty',
          },
        )
      }
      const cor4 = `Le tableau de signes de la fonction $f$ est donné par :<br>${tableHtml}.`
      let listeCor = [cor1, cor2, cor3, cor4]
      const objetsGraphiques = [
        r,
        o,
        courbe1,
        courbe2,
        asymptoteVerticale,
        asymptoteHorizontale,
        ...intersectionPoints,
      ]
      const corb = mathalea2d(
        {
          xmin: -8,
          ymin: -8,
          xmax: 8,
          ymax: 8,
          scale: 1,
          usePgfplots: true,
          centerLatex: true,
        },
        ...objetsGraphiques,
      )
      listeCor = this.sup3
        ? listeCor
        : listeCor.filter((_, index) => index !== 2)
      if (this.sup4) {
        texteCorr += createList({
          items: [
            `Pour l'étude de la fonction : ${createList({
              items: listeCor,
              style: 'roman',
            })}`,
            `Pour la représentation graphique, on a <br>${corb}`,
          ],
          style: 'alpha',
        })
      } else {
        texteCorr += createList({
          items: listeCor,
          style: 'roman',
        })
        texteCorr += `En complément, voici la représentation graphique de $f$ :<br>${corb}`
      }
      if (this.questionJamaisPosee(i, a, b, c, d)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
