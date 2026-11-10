import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Déterminer le nombre de faces d'un solide"
export const interactifReady = true

export const uuid = 'tfw5s'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q22 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(typeSolide?: string, avecLabels?: boolean) {
    if (typeSolide == null) {
      typeSolide = choice(['prisme_pentagonal', 'tetraedre', 'pyramide'])
    }

    if (avecLabels == null) {
      avecLabels = true
    }

    let reponse: number
    let objets: NestedObjetMathalea2dArray

    if (typeSolide === 'prisme_pentagonal') {
      const A = pointAbstrait(0, 1, 'A', 'left')
      const B = pointAbstrait(1.5, 0, 'B', 'below')
      const C = pointAbstrait(7.5, 0.5, 'C', 'below')
      const D = pointAbstrait(6, 1.5, 'D', 'above right')
      const E = pointAbstrait(3, 2, 'E', 'above right')

      // Base supérieure (pentagone) : A' - B' - C' - D' - E'
      const Ap = pointAbstrait(0, 5, "A'")
      const Bp = pointAbstrait(1.5, 4, "B'")
      const Cp = pointAbstrait(7.5, 4.5, "C'")
      const Dp = pointAbstrait(6, 5.5, "D'")
      const Ep = pointAbstrait(3, 6, "E'")

      // Arêtes visibles de la base supérieure
      const segBaseSup1 = segment(Ap, Ep)
      const segBaseSup2 = segment(Ep, Dp)
      const segBaseSup3 = segment(Dp, Cp)

      // Arêtes visibles latérales
      const seg1 = segment(A, Ap) // Arête verticale avant-gauche
      const seg2 = segment(C, Cp) // Arête verticale avant-droite

      // Face latérale avant-gauche (A-B-B'-A')
      const faceAB = polygone([A, B, Bp, Ap], 'black')

      // Face latérale avant-droite (B-C-C'-B')
      const faceBC = polygone([B, C, Cp, Bp], 'black')

      // Face latérale arrière-droite - seulement C-C'-D' (sans D)
      const segCCp = segment(C, Cp)
      const segCpDp = segment(Cp, Dp)

      // Arêtes cachées en pointillés
      const s1 = segment(A, E) // Base inférieure A-E
      const s2 = segment(E, D) // Base inférieure E-D
      const s3 = segment(D, C) // Base inférieure D-C - EN POINTILLÉS
      const s4 = segment(E, Ep) // Arête verticale arrière E-E'
      const s5 = segment(D, Dp) // Arête verticale arrière D-D' - EN POINTILLÉS
      const s6 = segment(B, Bp) // Arête verticale milieu B-B'
      s1.pointilles = 2
      s2.pointilles = 2
      s3.pointilles = 2
      s4.pointilles = 2
      s5.pointilles = 2
      s6.pointilles = 2

      objets = [
        faceAB,
        faceBC,
        segCCp,
        segCpDp,
        segBaseSup1,
        segBaseSup2,
        segBaseSup3,
        seg1,
        seg2,
        s1,
        s2,
        s3,
        s4,
        s5,
        s6,
      ]

      if (avecLabels) {
        objets.push(labelPoint(A, B, C, D, E, Ap, Bp, Cp, Dp, Ep))
      }

      reponse = 7

      this.question =
        mathalea2d(
          {
            xmin: -1,
            ymin: -1,
            xmax: 8.5,
            ymax: 7,
            pixelsParCm: 20,
            scale: 0.6,
            center: !context.isHtml,
          },
          objets,
        ) + '<br>Nombre de faces de ce solide'

      this.correction = `Ce solide est un prisme à base pentagonale. Il a $${miseEnEvidence(7)}$ faces : $2$ faces pentagonales (bases) et $5$ faces rectangulaires (faces latérales).`
    } else if (typeSolide === 'tetraedre') {
      const A = pointAbstrait(0, 0, 'A', 'left')
      const B = pointAbstrait(3, 0, 'B', 'right')
      const C = pointAbstrait(1, 1, 'C')
      const D = pointAbstrait(2, 4, 'D')

      const s1 = segment(C, D)
      const s2 = segment(A, C)
      const s3 = segment(C, B)
      s1.pointilles = 2
      s2.pointilles = 2
      s3.pointilles = 2

      const poly1 = polygone([A, B, D], 'black')

      objets = [poly1, s1, s2, s3]

      if (avecLabels) {
        objets.push(labelPoint(A, B, C, D))
      }

      reponse = 4

      this.question =
        mathalea2d(
          {
            xmin: -1,
            ymin: -0.5,
            xmax: 4,
            ymax: 5,
            scale: 0.6,
            pixelsParCm: 30,
            center: !context.isHtml,
          },
          objets,
        ) + '<br>Nombre de faces de ce solide'

      this.correction = `Ce solide est un tétraèdre. Il a $${miseEnEvidence(4)}$ faces triangulaires.`
    } else {
      const A = pointAbstrait(0, 0, 'A', 'below')
      const B = pointAbstrait(3, 0, 'B', 'below')
      const C = pointAbstrait(3.5, 1, 'C')
      const D = pointAbstrait(0.8, 1, 'D')
      const S = pointAbstrait(1.75, 4, 'S')

      const s1 = segment(A, D)
      const s2 = segment(D, S)
      const s3 = segment(D, C)
      s1.pointilles = 2
      s2.pointilles = 2
      s3.pointilles = 2

      const poly1 = polygone([A, B, S], 'black')
      const poly2 = polygone([B, C, S], 'black')

      objets = [poly1, poly2, s1, s2, s3]

      if (avecLabels) {
        objets.push(labelPoint(A, B, C, D, S))
      }

      reponse = 5

      this.question =
        mathalea2d(
          {
            xmin: -1,
            ymin: -1,
            xmax: 4,
            ymax: 6,

            scale: 0.6,
            pixelsParCm: 30,
            center: !context.isHtml,
          },
          objets,
        ) + '<br>Nombre de faces de ce solide'
      this.correction = `Ce solide est une pyramide à base carrée. Il a $${miseEnEvidence(5)}$ faces : $1$ face carrée et $4$ faces triangulaires.`
    }

    this.reponse = reponse
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('prisme_pentagonal', true)
    else this.enonce()
  }
}
