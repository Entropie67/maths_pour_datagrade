import { courbe } from '../../lib/2d/Courbe'
import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment, type Segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'

import {
  crochetD,
  crochetG,
  type CrochetD,
  type CrochetG,
} from '../../lib/2d/intervalles'
import { bleuMathalea } from '../../lib/colors'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import type { ReciprocalInequalityGraphicElements } from '../../types/1A-C10'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '01/10/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '4503b'
//
/**
 *
 * @author Gilles Mora + Claude ia pour la factorisation
 *
 */
export const refs = {
  'fr-fr': ['1A-C10-5'],
  'fr-ch': ['2mQCM-2'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre =
  'Résoudre une inéquation du type $\\dfrac{1}{x}<a$ ou $\\dfrac{1}{x}>a$ (avec ou sans courbe)'
export default class Auto1AC10e extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierEnsemble
    // Clavier allégé : crochets, point-virgule, fraction, infini et réunion
    this.optionsChampTexte = {
      dataKeys: ['[', ']', ';', '\\frac{#0}{#1}', '\\infty', '\\cup'],
    }
    this.optionsDeComparaison = { intervalle: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.besoinFormulaire5CaseACocher = ['Sans la courbe']
    this.sup5 = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const typeInequation = this.quotaChoice('type', ['inf', 'sup'] as (
      'inf' | 'sup'
    )[])
    const estInegStrict = this.quotaChoice('strict', [true, false])
    const val = this.quotaRandint('val', -6, 6, [-1, 0, 1])
    this.appliquerLesValeurs(val, estInegStrict, typeInequation)
  }

  private appliquerLesValeurs(
    val: number,
    estInegStrict: boolean,
    typeInequation: 'inf' | 'sup',
  ): void {
    // Détermination du signe d'inégalité
    const signeInégalité =
      typeInequation === 'inf'
        ? estInegStrict
          ? '<'
          : ' \\leqslant '
        : estInegStrict
          ? '>'
          : ' \\geqslant '

    // Création des éléments graphiques
    const elements = this.creerElementsGraphiques(
      val,
      estInegStrict,
      typeInequation,
    )
    const { graphique, graphiqueC } = this.creerGraphiques(val, elements)
    const reponses = this.formaterReponses(val, estInegStrict, typeInequation)
    // Intervalle attendu, sans le « S = » (qui reste hors de la mise en évidence)
    const intervalle = reponses[0].replace(/^\$S = /, '').replace(/\$$/, '')

    // Énoncé
    this.question = this.sup5
      ? `On note $(I)$ l'inéquation, sur $\\mathbb{R}^*$, $\\dfrac{1}{x}${signeInégalité} ${val}$.<br><br>
         Déterminer l'ensemble $S$ des solutions de cette inéquation.`
      : `${deuxColonnes(
          `On a représenté l'hyperbole d'équation $y=\\dfrac{1}{x}$. <br><br>
           On note $(I)$ l'inéquation, sur $\\mathbb{R}^*$, $\\dfrac{1}{x}${signeInégalité} ${val}$.<br><br>`,
          `${graphique}`,
        )} Déterminer l'ensemble $S$ des solutions de cette inéquation.`

    // Correction
    this.correction = this.genererCorrection(
      val,
      estInegStrict,
      typeInequation,
      graphiqueC,
      intervalle,
    )

    // Réponse : l'intervalle seul, ou « S = intervalle » (propositions du QCM)
    if (this.versionQcm) {
      this.reponse = reponses[0]
      this.distracteurs = reponses.slice(1)
    } else {
      this.reponse = intervalle
        .replaceAll('\\,', '')
        .replaceAll('\\left', '')
        .replaceAll('\\right', '')
      if (this.interactif) this.question += '<br>$S=$'
    }
  }

  private creerElementsGraphiques(
    val: number,
    estInegStrict: boolean,
    typeInequation: 'inf' | 'sup',
  ): ReciprocalInequalityGraphicElements {
    const o = latex2d('\\text{O}', -0.2, -0.3, { letterSize: 'scriptsize' })
    const O = pointAbstrait(0, 0)

    // Droite horizontale fixe selon le signe de val
    const yDroite = val > 0 ? 1.5 : -1.5

    // Calcul de la position d'intersection sur l'hyperbole avec yDroite
    const xIntersection = 1 / yDroite
    const A = pointAbstrait(xIntersection, yDroite)
    const Ax = pointAbstrait(xIntersection, 0)
    const sAAx = segment(A, Ax)
    sAAx.epaisseur = 2
    sAAx.pointilles = 5

    // Calcul de la borne réelle pour les labels
    const borneReelle = 1 / val

    // Point graphique de la borne sur l'axe des x
    const bornePoint = pointAbstrait(xIntersection, 0)

    // Segments de solution et crochets selon le type d'inéquation
    let segmentsSolution: Segment[] = []
    let crochets: (CrochetD | CrochetG)[] = []

    if (typeInequation === 'inf') {
      if (val > 0) {
        // Pour 1/x < a avec a > 0 : ]-∞,0[ ∪ ]1/a,+∞[ (strict) ou [1/a,+∞[ (large)
        const AxI = pointAbstrait(-4, 0)
        const sAxIO = segment(AxI, O, 'red')
        sAxIO.epaisseur = 2

        const AxI2 = pointAbstrait(4, 0)
        const sAxI2Bx = segment(bornePoint, AxI2, 'red')
        sAxI2Bx.epaisseur = 2

        segmentsSolution = [sAxIO, sAxI2Bx]
        crochets = [
          crochetD(O, 'red'), // 0[  (ouvert à droite)
          estInegStrict
            ? crochetG(bornePoint, 'red')
            : crochetD(bornePoint, 'red'), // ]1/a (strict) ou [1/a (large)
        ]
      } else {
        // Pour 1/x < a avec a < 0 : ]1/a,0[ (strict) ou [1/a,0[ (large)
        const sAxO = segment(bornePoint, O, 'red')
        sAxO.epaisseur = 2

        segmentsSolution = [sAxO]
        crochets = [
          estInegStrict
            ? crochetG(bornePoint, 'red')
            : crochetD(bornePoint, 'red'), // ]1/a (strict) ou [1/a (large)
          crochetD(O, 'red'), // 0[  (ouvert à droite)
        ]
      }
    } else {
      if (val > 0) {
        // Pour 1/x > a avec a > 0 : ]0,1/a[ (strict) ou ]0,1/a] (large)
        const sAxO = segment(O, bornePoint, 'red')
        sAxO.epaisseur = 2

        segmentsSolution = [sAxO]
        crochets = [
          crochetG(O, 'red'), // ]0  (ouvert à gauche)
          estInegStrict
            ? crochetD(bornePoint, 'red')
            : crochetG(bornePoint, 'red'), // 1/a[ (strict) ou 1/a] (large)
        ]
      } else {
        // Pour 1/x > a avec a < 0 : ]-∞,1/a[ ∪ ]0,+∞[ (strict) ou ]-∞,1/a] ∪ ]0,+∞[ (large)
        const AxI = pointAbstrait(-4, 0)
        const sAxIBx = segment(AxI, bornePoint, 'red')
        sAxIBx.epaisseur = 2

        const AxI2 = pointAbstrait(4, 0)
        const sOAxI2 = segment(O, AxI2, 'red')
        sOAxI2.epaisseur = 2

        segmentsSolution = [sAxIBx, sOAxI2]
        crochets = [
          estInegStrict
            ? crochetD(bornePoint, 'red')
            : crochetG(bornePoint, 'red'), // 1/a[ (strict) ou 1/a] (large)
          crochetG(O, 'red'), // ]0  (ouvert à gauche)
        ]
      }
    }

    // Textes pour les labels
    const textes = [
      latex2d(`y=${val}`, 4, yDroite > 0 ? 2 : -1, {
        letterSize: 'scriptsize',
      }),
      latex2d('y=\\dfrac{1}{x}', 1.2, 3, { letterSize: 'scriptsize' }),
    ]

    // Ajouter le label pour l'abscisse de la borne réelle
    if (val > 0) {
      textes.push(
        latex2d(`\\dfrac{1}{${val}}`, borneReelle + 0.3, -0.8, {
          letterSize: 'scriptsize',
        }),
      )
    } else {
      textes.push(
        latex2d(`-\\dfrac{1}{${Math.abs(val)}}`, borneReelle - 0.3, 0.9, {
          letterSize: 'scriptsize',
        }),
      )
    }

    return {
      o,
      O,
      Ax,
      sAAx,
      segmentsSolution,
      crochets,
      textes,
      yDroite,
    }
  }

  private creerGraphiques(
    val: number,
    elements: ReciprocalInequalityGraphicElements,
  ) {
    const { o, sAAx, segmentsSolution, crochets, textes, yDroite } = elements

    const r1 = repere({
      xMin: -4,
      yMin: -3,
      yMax: 4,
      xMax: 4.5,
      xUnite: 1,
      yUnite: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleX: false,
      grilleY: false,
      xThickListe: [0],
      yThickListe: [0],
      xLabelListe: [-6],
      yLabelListe: [-6],
    })

    const f = (x: number) => 1 / Number(x)

    // Droite horizontale fixe
    const Cg = droite(
      pointAbstrait(-4, yDroite),
      pointAbstrait(4, yDroite),
      '',
      'green',
    )
    Cg.epaisseur = 2

    // Graphique simple pour l'énoncé
    const graphique = mathalea2d(
      {
        xmin: -5,
        xmax: 5,
        ymin: -5.5,
        ymax: 5,
        pixelsParCm: 20,
        scale: 0.7,
      },
      r1,
      o,
      courbe(f, {
        yMin: -4.5,
        yMax: 4,
        repere: r1,
        color: bleuMathalea,
        epaisseur: 2,
        step: 0.01,
      }),
    )

    // Graphique complet pour la correction
    const graphiqueC = mathalea2d(
      {
        xmin: -4,
        xmax: 4.5,
        ymin: -5.5,
        ymax: 5,
        pixelsParCm: 25,
        scale: 1,
      },
      courbe(f, {
        repere: r1,
        color: bleuMathalea,
        epaisseur: 2,
        step: 0.01,
        yMin: -4,
        yMax: 4,
      }),
      Cg,
      r1,
      o,
      sAAx,
      ...segmentsSolution,
      ...crochets,
      ...textes,
    )

    return { graphique, graphiqueC }
  }

  private formaterReponses(
    val: number,
    estInegStrict: boolean,
    typeInequation: 'inf' | 'sup',
  ) {
    const borne =
      val > 0 ? `\\dfrac{1}{${val}}` : `-\\dfrac{1}{${Math.abs(val)}}`

    if (typeInequation === 'inf') {
      if (val > 0) {
        // Pour 1/x < a avec a > 0 : ]-∞,0[ ∪ ]1/a,+∞[
        const intervalleCorrect = `]-\\infty\\,;\\,0[ \\cup ${estInegStrict ? '\\left]' : '\\left['}${borne}\\,;\\,+\\infty\\right[`
        const intervalleIncorrect = `]-\\infty\\,;\\,0[ \\cup ${estInegStrict ? '\\left[' : '\\left]'}${val}\\,;\\,+\\infty\\right[`
        return [
          `$S = ${intervalleCorrect}$`,
          `$S = ${intervalleIncorrect}$`,
          `$S = \\left]0\\,;\\,${val}${estInegStrict ? '\\right[' : '\\right]'}$`,
          `$S = \\left]0\\,;\\,${borne}${estInegStrict ? '\\right[' : '\\right]'}$`,
        ]
      } else {
        // Pour 1/x < a avec a < 0 : ]1/a,0[
        const intervalleCorrect = `\\left${estInegStrict ? ']' : '['}${borne}\\,;\\,0\\right[`
        const intervalleIncorrect = `\\left${estInegStrict ? ']' : '['}${val}\\,;\\,0\\right[`
        return [
          `$S = ${intervalleCorrect}$`,
          `$S = ${intervalleIncorrect}$`,
          `$S = \\left]-\\infty\\,;\\,${val}${estInegStrict ? '\\right[' : '\\right]'} \\cup ]0\\,;\\,+\\infty[$`,
          `$S = \\left]-\\infty\\,;\\,${borne}${estInegStrict ? '\\right[' : '\\right]'} \\cup ]0\\,;\\,+\\infty[$`,
        ]
      }
    } else {
      if (val > 0) {
        // Pour 1/x > a avec a > 0 : ]0,1/a[
        const intervalleCorrect = `\\left]0\\,;\\,${borne}${estInegStrict ? '\\right[' : '\\right]'}`
        const intervalleIncorrect = `\\left]0\\,;\\,${val}${estInegStrict ? '\\right[' : '\\right]'}`
        return [
          `$S = ${intervalleCorrect}$`,
          `$S = ${intervalleIncorrect}$`,
          `$S = ]-\\infty\\,;\\,0[ \\cup \\left]${val}\\,;\\,+\\infty\\right[$`,
          `$S = ]-\\infty\\,;\\,0[ \\cup \\left]${borne}\\,;\\,+\\infty\\right[$`,
        ]
      } else {
        // Pour 1/x > a avec a < 0 : ]-∞,1/a[ ∪ ]0,+∞[
        const intervalleCorrect = `\\left]-\\infty\\,;\\,${borne}${estInegStrict ? '\\right[' : '\\right]'} \\cup ]0\\,;\\,+\\infty[`
        const intervalleIncorrect = `\\left]-\\infty\\,;\\,${val}${estInegStrict ? '\\right[' : '\\right]'} \\cup ]0\\,;\\,+\\infty[`
        return [
          `$S = ${intervalleCorrect}$`,
          `$S = ${intervalleIncorrect}$`,
          `$S = \\left]${val}\\,;\\,0\\right[$`,
          `$S = \\left]${borne}\\,;\\,0\\right[$`,
        ]
      }
    }
  }

  private genererCorrection(
    val: number,
    estInegStrict: boolean,
    typeInequation: 'inf' | 'sup',
    graphiqueC: string,
    reponseCorrecte: string,
  ) {
    const borne =
      val > 0 ? `\\dfrac{1}{${val}}` : `-\\dfrac{1}{${Math.abs(val)}}`
    const positionText =
      typeInequation === 'inf'
        ? estInegStrict
          ? 'strictement en dessous de'
          : ' sur ou sous '
        : estInegStrict
          ? 'strictement au-dessus de'
          : ' sur ou au-dessus de '

    return `Pour résoudre graphiquement cette inéquation : <br>
            $\\bullet$ On trace l'hyperbole d'équation $y=\\dfrac{1}{x}$. <br>
            $\\bullet$ On trace la droite horizontale d'équation $y=${val}$. Cette droite coupe l'hyperbole en un point dont l'abscisse est : $${borne}$. <br>
            $\\bullet$ Les solutions de l'inéquation sont les abscisses respectives des points de la courbe qui se situent ${positionText} la droite.<br>
            ${graphiqueC}
            Comme la fonction inverse est définie sur $\\mathbb{R}^*$, $0$ est une valeur interdite et donc l'ensemble des solutions de l'inéquation $(I)$ est : $S=${miseEnEvidence(reponseCorrecte)}$.`
  }
}
