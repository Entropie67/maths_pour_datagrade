// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 66354 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'

import { bleuMathalea } from '../../lib/colors'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora
 *
 */
export const uuid = '66354'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Déterminer une équation de droite à partir de sa représentation graphique'
export const dateDePublication = '13/02/2026'

export default class Auto1AF075Old extends ExerciceQcmA {
  private appliquerLesValeurs(
    fracNum: number,
    fracDen: number,
    ordOrigine: number,
  ): void {
    const m = new FractionEtendue(fracNum, fracDen)
    const typeBonneReponse = choice(['reduite', 'cartesienne'])

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const A = pointAbstrait(0, ordOrigine)
    const B = pointAbstrait(fracDen, ordOrigine + fracNum)
    const Bx = pointAbstrait(B.x, A.y)
    const sABx = A.x !== Bx.x || A.y !== Bx.y ? segment(A, Bx) : vide2d()
    const sBBx = B.x !== Bx.x || B.y !== Bx.y ? segment(B, Bx) : vide2d()

    sBBx.epaisseur = 2
    sBBx.pointilles = 5
    sABx.epaisseur = 2
    sABx.pointilles = 5

    const lA = latex2d('A', 0.3, ordOrigine + 0.3, { letterSize: 'scriptsize' })
    const traceA = tracePoint(A, 'black')
    traceA.taille = 3
    traceA.epaisseur = 2

    const lB = latex2d('B', B.x + 0.3, B.y + 0.3, { letterSize: 'scriptsize' })
    const traceB = tracePoint(B, 'black')
    traceB.taille = 3
    traceB.epaisseur = 2

    const lABx = latex2d(`${fracDen}`, milieu(A, Bx).x, A.y + 0.3, {
      color: 'red',
      letterSize: 'scriptsize',
    })
    const lBBx = latex2d(`${fracNum}`, B.x + 0.5, milieu(B, Bx).y, {
      color: bleuMathalea,
      letterSize: 'scriptsize',
    })

    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2

    const xmin = -5
    const ymin = -5
    const xmax = 5
    const ymax = 5

    const r1 = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: ymax,
      yUnite: 1,
      thickHauteur: 0.1,
      xLabelMin: xmin + 1,
      xLabelMax: xmax - 1,
      yLabelMax: ymax - 1,
      yLabelMin: ymin + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      yLabelDistance: 1,
      yLabelEcart: 0.3,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 0.1,
      grilleSecondaireXDistance: 0.1,
      grilleSecondaireOpacite: 0.1,
      grilleSecondaireYMin: ymin - 0.1,
      grilleSecondaireYMax: ymax + 0.1,
      grilleSecondaireXMin: xmin - 0.1,
      grilleSecondaireXMax: xmax + 0.1,
    })

    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.1,
        ymax: ymax + 0.1,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      o,
    )

    const objetC = mathalea2d(
      {
        xmin,
        xmax,
        ymin,
        ymax: ymax + 0.1,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      traceA,
      lA,
      lB,
      traceB,
      o,
      sABx,
      sBBx,
      lABx,
      lBBx,
    )

    // ===== Formes d'équation (sans $) =====

    const nuReduite = `y=${m.texFractionSimplifiee}x${ecritureAlgebrique(ordOrigine)}`
    const nuInversee = `y=${new FractionEtendue(fracDen, fracNum).texFractionSimplifiee}x${ecritureAlgebrique(ordOrigine)}`
    const nuOpposee = `y=${new FractionEtendue(-fracNum, fracDen).texFractionSimplifiee}x${ecritureAlgebrique(ordOrigine)}`

    // Forme cartésienne normalisée (coeff de x positif)
    let aCart = -fracNum
    let bCart = fracDen
    let cCart = -fracDen * ordOrigine
    if (aCart < 0) {
      aCart = -aCart
      bCart = -bCart
      cCart = -cCart
    }
    const nuCartesienne = this.nuEquationCartesienne(aCart, bCart, cCart)
    const nuCartesienneFausse = this.nuEquationCartesienne(aCart, bCart, -cCart)

    // ===== Énoncé =====
    this.enonce =
      'On a représenté ci-dessous une droite $\\mathcal{D}$ dans un repère orthonormé.<br><br>' +
      objet +
      '<br>Une équation de la droite $\\mathcal{D}$ est :'

    // ===== Correction (commune) =====
    this.correction = `En prenant deux points $A$ et $B$ sur la droite, on obtient le coefficient directeur :<br>
    $m=\\dfrac{${miseEnEvidence(fracNum, bleuMathalea)}}{${miseEnEvidence(fracDen, 'red')}}=${miseEnEvidence(`${m.texFractionSimplifiee}`)}$.<br>
    L'ordonnée à l'origine est $p=${ordOrigine}$.<br>
    L'équation réduite de la droite est donc : $${miseEnEvidence(nuReduite)}$.<br>`
    this.correction += `${objetC}`

    // ===== Les 4 réponses =====
    switch (typeBonneReponse) {
      case 'reduite':
        this.reponses = [
          `$${nuReduite}$`,
          `$${nuInversee}$`,
          `$${nuCartesienneFausse}$`,
          `$${nuOpposee}$`,
        ]
        break

      case 'cartesienne':
      default: {
        // Cheminement aligned :
        // y = mx + p
        // -mx + y - p = 0  (on passe tout à gauche)
        // On multiplie par k (= -den ou +den selon le signe de -fracNum) pour avoir coeff x > 0
        const mOpp = new FractionEtendue(-fracNum, fracDen) // -m
        // Étape intermédiaire : (-m)x + y + (-p) = 0

        // Facteur multiplicatif : on veut que -fracNum * k > 0, avec |k| = fracDen
        // Si -fracNum > 0 (fracNum < 0), k = fracDen
        // Si -fracNum < 0 (fracNum > 0), k = -fracDen
        const k = fracNum > 0 ? -fracDen : fracDen

        this.correction += `<br>On a :<br>
        $\\begin{aligned}
        y&=${m.texFractionSimplifiee}x${ecritureAlgebrique(ordOrigine)}\\\\
        ${mOpp.texFractionSimplifiee}x+y${ecritureAlgebrique(-ordOrigine)}&=0\\\\
        ${miseEnEvidence(nuCartesienne)}&\\quad\\text{(en multipliant par } ${k}\\text{)}
        \\end{aligned}$`
        this.reponses = [
          `$${nuCartesienne}$`,
          `$${nuInversee}$`,
          `$${nuCartesienneFausse}$`,
          `$${nuOpposee}$`,
        ]
        break
      }
    }
  }

  private nuEquationCartesienne(a: number, b: number, c: number): string {
    return `${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}y${c !== 0 ? ecritureAlgebrique(c) : ''}=0`
  }

  versionOriginale: () => void = () => {
    // Droite y = -3/2 x + 2 (comme dans l'image du sujet)
    const fracNum = -3
    const fracDen = 2
    const ordOrigine = 2
    const m = new FractionEtendue(fracNum, fracDen)

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const A = pointAbstrait(0, ordOrigine)
    const B = pointAbstrait(fracDen, ordOrigine + fracNum)
    const Bx = pointAbstrait(B.x, A.y)
    const sABx = segment(A, Bx)
    const sBBx = segment(B, Bx)

    sBBx.epaisseur = 2
    sBBx.pointilles = 5
    sABx.epaisseur = 2
    sABx.pointilles = 5

    const lA = latex2d('A', 0.3, ordOrigine + 0.3, { letterSize: 'scriptsize' })
    const traceA = tracePoint(A, 'black')
    traceA.taille = 3
    traceA.epaisseur = 2

    const lB = latex2d('B', B.x + 0.3, B.y + 0.3, { letterSize: 'scriptsize' })
    const traceB = tracePoint(B, 'black')
    traceB.taille = 3
    traceB.epaisseur = 2

    const lABx = latex2d(`${fracDen}`, milieu(A, Bx).x, A.y + 0.3, {
      color: 'red',
      letterSize: 'scriptsize',
    })
    const lBBx = latex2d(`${fracNum}`, B.x + 0.5, milieu(B, Bx).y, {
      color: bleuMathalea,
      letterSize: 'scriptsize',
    })

    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2

    const xmin = -5
    const ymin = -5
    const xmax = 5
    const ymax = 5

    const r1 = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: ymax,
      yUnite: 1,
      thickHauteur: 0.1,
      xLabelMin: xmin + 1,
      xLabelMax: xmax - 1,
      yLabelMax: ymax - 1,
      yLabelMin: ymin + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      yLabelDistance: 1,
      yLabelEcart: 0.3,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 0.1,
      grilleSecondaireXDistance: 0.1,
      grilleSecondaireOpacite: 0.1,
      grilleSecondaireYMin: ymin - 0.1,
      grilleSecondaireYMax: ymax + 0.1,
      grilleSecondaireXMin: xmin - 0.1,
      grilleSecondaireXMax: xmax + 0.1,
    })

    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.1,
        ymax: ymax + 0.1,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      o,
    )

    const objetC = mathalea2d(
      {
        xmin,
        xmax,
        ymin,
        ymax: ymax + 0.1,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      traceA,
      lA,
      lB,
      traceB,
      o,
      sABx,
      sBBx,
      lABx,
      lBBx,
    )

    this.enonce =
      'On a représenté ci-dessous une droite $\\mathcal{D}$ dans un repère orthonormé.<br><br>' +
      objet +
      '<br>Une équation de la droite $\\mathcal{D}$ est :'

    this.correction = `En prenant deux points $A$ et $B$ sur la droite, on obtient le coefficient directeur :<br>
    $m=\\dfrac{${miseEnEvidence(fracNum, bleuMathalea)}}{${miseEnEvidence(fracDen, 'red')}}=${miseEnEvidence(`${m.texFractionSimplifiee}`)}$.<br>
    L'ordonnée à l'origine est $p=${ordOrigine}$.<br>
    L'équation réduite de la droite est donc : $${miseEnEvidence(`y=${m.texFractionSimplifiee}x${ecritureAlgebrique(ordOrigine)}`)}$.<br>`
    this.correction += `${objetC}`

    this.reponses = [
      `$y=-\\dfrac{3}{2}x+2$`,
      `$y=\\dfrac{2}{3}x+2$`,
      `$2x-3y-6=0$`,
      `$\\dfrac{x}{3}+\\dfrac{y}{2}-1=0$`,
    ]
  }

  versionAleatoire: () => void = () => {
    const listeFractions: [number, number][] = [
      [2, 3],
      [3, 4],
      [-2, 3],
      [-3, 4],
      [1, 3],
      [-1, 3],
    ]
    const frac = choice(listeFractions)
    const ordOrigine = randint(1, 3) * choice([-1, 1])
    this.appliquerLesValeurs(frac[0], frac[1], ordOrigine)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
