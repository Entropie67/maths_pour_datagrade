// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 84c9f continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { courbe } from '../../lib/2d/Courbe'
import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment, type Segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

import {
  crochetD,
  crochetG,
  type CrochetD,
  type CrochetG,
} from '../../lib/2d/intervalles'
import { bleuMathalea } from '../../lib/colors'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { SquareInequalityGraphicElements } from '../../types/1A-C10'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '26/09/2025'
export const dateDeModifImportante = '12/10/2025'
export const uuid = '84c9f'
//
/**
 *
 * @author Gilles Mora + Claude ia pour la factorisation
 *
 */
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Résoudre une inéquation du type $x^2<a$ ou $x^2>a$ avec ou sans courbe (solutions sous forme d'intervalles)"
export default class Auto1AC10dOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    val: number,
    estInegStrict: boolean,
    typeInequation: 'inf' | 'sup',
  ): void {
    // Détermination du signe d'inégalité
    const signeInegalité =
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

    // Énoncé
    this.enonce = this.sup5
      ? `On note $(I)$ l'inéquation, sur $\\mathbb{R}$, $x^2${signeInegalité} ${val}$.<br><br>
         L'ensemble des solutions $S$ de cette inéquation est :`
      : `${deuxColonnes(
          `On a représenté la parabole d'équation $y=x^2$. <br><br>
           On note $(I)$ l'inéquation, sur $\\mathbb{R}$, $x^2${signeInegalité} ${val}$.<br><br>`,
          `${graphique}`,
        )}
         
         L'ensemble des solutions $S$ de cette inéquation est :`

    // Correction
    this.correction = this.genererCorrection(
      val,
      estInegStrict,
      typeInequation,
      graphiqueC,
      reponses[0],
    )

    // Réponses
    this.reponses = reponses
  }

  // Méthode utilitaire pour créer les éléments graphiques communs
  private creerElementsGraphiques(
    val: number,
    estInegStrict: boolean,
    typeInequation: 'inf' | 'sup',
  ): SquareInequalityGraphicElements {
    const o = latex2d('\\text{O}', -0.2, -0.3, { letterSize: 'scriptsize' })

    // Position graphique fixe pour l'affichage
    const valGraphique = 2
    const racineValGraphique = Math.sqrt(valGraphique)

    // Points et segments verticaux
    const A = pointAbstrait(racineValGraphique, valGraphique)
    const Ax = pointAbstrait(A.x, 0)
    const sAAx = segment(A, Ax)
    sAAx.epaisseur = 2
    sAAx.pointilles = 5

    const B = pointAbstrait(-racineValGraphique, valGraphique)
    const Bx = pointAbstrait(B.x, 0)
    const sBBx = segment(B, Bx)
    sBBx.epaisseur = 2
    sBBx.pointilles = 5

    // Segments de solution et crochets selon le type d'inéquation
    let segmentsSolution: Segment[] = []
    let crochets: (CrochetD | CrochetG)[] = []

    if (typeInequation === 'inf') {
      // ]-√val, √val[ (strict) ou [-√val, √val] (large)
      const sAxBx = segment(Bx, Ax, 'red')
      sAxBx.epaisseur = 2
      segmentsSolution = [sAxBx]
      crochets = [
        estInegStrict ? crochetG(Bx, 'red') : crochetD(Bx, 'red'), // ]-√val (strict) ou [-√val (large)
        estInegStrict ? crochetD(Ax, 'red') : crochetG(Ax, 'red'), // √val[  (strict) ou √val]  (large)
      ]
    } else {
      // ]-∞,-√val[ ∪ ]√val,+∞[ (strict) ou ]-∞,-√val] ∪ [√val,+∞[ (large)
      const BxI = pointAbstrait(-4, 0)
      const sBxBxI = segment(BxI, Bx, 'red')
      sBxBxI.epaisseur = 2

      const AxI = pointAbstrait(4, 0)
      const sAxAxI = segment(Ax, AxI, 'red')
      sAxAxI.epaisseur = 2

      segmentsSolution = [sBxBxI, sAxAxI]
      crochets = [
        estInegStrict ? crochetD(Bx, 'red') : crochetG(Bx, 'red'), // -√val[ (strict) ou -√val] (large)
        estInegStrict ? crochetG(Ax, 'red') : crochetD(Ax, 'red'), // ]√val  (strict) ou [√val  (large)
      ]
    }

    // Textes
    const textes = [
      latex2d(`y=${val}`, 4, 2.7, { letterSize: 'scriptsize' }),
      latex2d('y=x^2', 3, 4.5, { letterSize: 'scriptsize' }),
      latex2d(`-\\sqrt{${val}}`, -racineValGraphique, -0.6, {
        letterSize: 'scriptsize',
      }),
      latex2d(`\\sqrt{${val}}`, racineValGraphique, -0.6, {
        letterSize: 'scriptsize',
      }),
      latex2d(`${val}`, -0.5, valGraphique + 0.1, { letterSize: 'scriptsize' }),
    ]

    return {
      o,
      A,
      Ax,
      B,
      Bx,
      sAAx,
      sBBx,
      segmentsSolution,
      crochets,
      textes,
      valGraphique,
    }
  }

  // Méthode utilitaire pour créer le repère et les graphiques
  private creerGraphiques(
    val: number,
    elements: SquareInequalityGraphicElements,
  ) {
    const { o, sAAx, sBBx, segmentsSolution, crochets, textes, valGraphique } =
      elements

    const r1 = repere({
      xMin: -4,
      yMin: -0.5,
      yMax: 5,
      xMax: 4,
      xUnite: 1,
      yUnite: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleX: false,
      grilleY: false,
      xThickListe: [0],
      yThickListe: [valGraphique],
      xLabelListe: [-6],
      yLabelListe: [-6],
    })

    const f = (x: number) => Number(x) ** 2
    const Cg = droite(
      pointAbstrait(-3, valGraphique),
      pointAbstrait(3, valGraphique),
      '',
      'green',
    )
    Cg.epaisseur = 2

    // Graphique simple pour l'énoncé
    const graphique = mathalea2d(
      {
        xmin: -5,
        xmax: 5,
        ymin: -0.5,
        ymax: 5,
        pixelsParCm: 20,
        scale: 0.7,
      },
      r1,
      o,
      textes[4],
      courbe(f, { repere: r1, color: bleuMathalea, epaisseur: 2 }),
    )

    // Graphique complet pour la correction
    const graphiqueC = mathalea2d(
      {
        xmin: -6,
        xmax: 6,
        ymin: -0.5,
        ymax: 5,
        pixelsParCm: 30,
        scale: 1,
      },
      courbe(f, { repere: r1, color: bleuMathalea, epaisseur: 2 }),
      Cg,
      r1,
      o,
      sAAx,
      sBBx,
      ...segmentsSolution,
      ...crochets,
      ...textes,
    )

    return { graphique, graphiqueC }
  }

  // Méthode utilitaire pour formater les réponses sous forme d'intervalles
  private formaterReponses(
    val: number,
    estInegStrict: boolean,
    typeInequation: 'inf' | 'sup',
  ) {
    if (typeInequation === 'inf') {
      const crochets = estInegStrict
        ? `]-\\sqrt{${val}}\\,;\\,\\sqrt{${val}}[`
        : `[-\\sqrt{${val}}\\,;\\,\\sqrt{${val}}]`
      const valIncorrects = estInegStrict
        ? `]-${texNombre(val / 2, 1)}\\,;\\,${texNombre(val / 2, 1)}[`
        : `[-${texNombre(val / 2, 1)}\\,;\\,${texNombre(val / 2, 1)}]`

      return [
        `$S = ${crochets}$`,
        `$S = ${valIncorrects}$`,
        `$S = \\{-\\sqrt{${val}}\\, ; \\,\\sqrt{${val}}\\}$`,
        `$S = ]-\\infty\\,;\\,-\\sqrt{${val}}${estInegStrict ? '[' : ']'} \\cup ${estInegStrict ? ']' : '['}\\sqrt{${val}}\\,;\\,+\\infty[$`,
      ]
    } else {
      const intervalleCorrect = estInegStrict
        ? `]-\\infty\\,;\\,-\\sqrt{${val}}[ \\cup ]\\sqrt{${val}}\\,;\\,+\\infty[`
        : `]-\\infty\\,;\\,-\\sqrt{${val}}] \\cup [\\sqrt{${val}}\\,;\\,+\\infty[`
      const valIncorrect = estInegStrict
        ? `]-\\infty\\,;\\,-${texNombre(val / 2, 1)}[ \\cup ]${texNombre(val / 2, 1)}\\,;\\,+\\infty[`
        : `]-\\infty\\,;\\,-${texNombre(val / 2, 1)}] \\cup [${texNombre(val / 2, 1)}\\,;\\,+\\infty[`

      return [
        `$S = ${intervalleCorrect}$`,
        `$S = ${valIncorrect}$`,
        `$S = \\{-\\sqrt{${val}} \\,; \\,\\sqrt{${val}}\\}$`,
        `$S = ]-\\sqrt{${val}}\\,;\\,\\sqrt{${val}}[$`,
      ]
    }
  }

  // Méthode utilitaire pour générer la correction
  private genererCorrection(
    val: number,
    estInegStrict: boolean,
    typeInequation: 'inf' | 'sup',
    graphiqueC: string,
    reponseCorrecte: string,
  ) {
    const positionText =
      typeInequation === 'inf'
        ? estInegStrict
          ? 'strictement en dessous de'
          : ' sur ou sous '
        : estInegStrict
          ? 'strictement au-dessus de'
          : ' sur ou au-dessus de '

    return `Pour résoudre graphiquement cette inéquation : <br>
            $\\bullet$ On trace la parabole d'équation $y=x^2$. <br>
            $\\bullet$ On trace la droite horizontale d'équation $y=${val}$. Cette droite coupe la parabole en $-\\sqrt{${val}}$ et $\\sqrt{${val}}$. <br>
            $\\bullet$ Les solutions de l'inéquation sont les abscisses respectives des points de la courbe qui se situent ${positionText} la droite.<br>
            ${graphiqueC}<br>
            On en déduit que l'ensemble des solutions de l'inéquation $(I)$ est : ${texteEnCouleurEtGras(reponseCorrecte)}.`
  }

  versionOriginale: () => void = () => {
    // Version originale : x² ≥ 10
    this.appliquerLesValeurs(
      10, // val
      false, // estInegStrict
      'sup', // typeInequation
    )
  }

  versionAleatoire: () => void = () => {
    const typeInequation = choice(['inf', 'sup'] as const)
    const estInegStrict = choice([true, false])
    const val = randint(2, 19, [4, 9, 16])

    this.appliquerLesValeurs(val, estInegStrict, typeInequation)
  }

  constructor() {
    super()

    this.versionAleatoire()
    this.besoinFormulaire5CaseACocher = ['Sans la courbe']
  }
}
