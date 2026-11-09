/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { grille } from '../../../lib/2d/Grille'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import {
  segment,
  segmentAvecExtremites,
} from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { fraction } from '../../../modules/fractions'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Déterminer la longueur d'une ligne brisée"
export const interactifReady = true

export const uuid = 'd0a64'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let A,
      B,
      C,
      D,
      E,
      F,
      G,
      H,
      J,
      K,
      a,
      b,
      s1,
      s2,
      s3,
      s4,
      s5,
      s6,
      s7,
      s8,
      xmin,
      xmax,
      ymin,
      ymax,
      objets
    const choix = choice(['a', 'b', 'd', 'e']) //
    if (this.canOfficielle) {
      this.question =
        'Quelle est la longueur de la ligne brisée en unité de longueur (u.l.) ? <br>'
      a = grille(-1, 0, 7, 4, 'gray', 1, 1)
      b = choice([3, 4, 5, 6])
      A = pointAbstrait(1, 1, 'A', 'below')
      B = pointAbstrait(1, 3, 'B', 'below')
      C = pointAbstrait(3, 1, 'C', 'above')
      D = pointAbstrait(3, 2, 'D', 'above')
      E = pointAbstrait(5, 2, 'C', 'above')
      F = pointAbstrait(5, 1, 'D', 'above')
      J = pointAbstrait(6, 1, 'C', 'above')
      K = pointAbstrait(6, 2, 'D', 'above')
      G = pointAbstrait(0, 4, 'C', 'above') // unite
      H = pointAbstrait(4, 4, 'D', 'above') // unite
      s1 = segmentAvecExtremites(G, H)
      s1.epaisseur = 3
      s2 = segment(A, B, bleuMathalea)
      s2.epaisseur = 3
      s3 = segment(C, A, bleuMathalea)
      s3.epaisseur = 3
      s4 = segment(C, D, bleuMathalea)
      s4.epaisseur = 3
      s5 = segment(D, E, bleuMathalea)
      s5.epaisseur = 3
      s6 = segment(E, F, bleuMathalea)
      s6.epaisseur = 3
      s7 = segment(F, J, bleuMathalea)
      s7.epaisseur = 3
      s8 = segment(J, K, bleuMathalea)
      s8.epaisseur = 3
      xmin = -1
      ymin = 0
      xmax = 7
      ymax = 5
      const objets = []
      objets.push(
        texteParPosition(
          '1 u.l.',
          milieu(G, H).x,
          milieu(G, H).y + 0.7,
          0,
          'black',
          context.isHtml ? 1 : 0.7,
        ),
        a,
        s1,
        s2,
        s3,
        s4,
        s5,
        s6,
        s7,
        s8,
      )
      this.reponse = fraction(10, 4).texFraction
      this.question +=
        mathalea2d(
          {
            xmin,
            ymin,
            xmax,
            ymax,
            pixelsParCm: 20,
            mainlevee: false,
            amplitude: 0.5,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        ) + '<br>'
      this.optionsChampTexte = { texteApres: 'u.l.' }
      this.correction = `Une unité correspond à $4$ carreaux, la ligne brisée mesure $10$ carreaux, soit $${miseEnEvidence(`\\dfrac{10}{4}`)}$ u.l. ou
       plus simplement $${miseEnEvidence(`\\dfrac{5}{2}`)}$ u.l. `

      this.canEnonce = mathalea2d(
        {
          xmin,
          ymin,
          xmax,
          ymax,
          pixelsParCm: 20,
          mainlevee: false,
          amplitude: 0.5,
          scale: 0.5,
          center: !context.isHtml,
        },
        objets,
      )
      this.canReponseACompleter =
        'Longueur de la ligne brisée en unité de longueur (u.l.) : <br> $\\ldots$ u.l.'
    } else {
      this.question =
        'Quelle est la longueur de la ligne brisée en unité de longueur (u.l.) ? <br>'
      if (choix === 'a') {
        a = grille(-2, -2, 7, 4, 'gray', 1, 1)
        b = choice([3, 4, 5, 6])
        A = pointAbstrait(0, 2, 'A', 'below')
        B = pointAbstrait(1, 2, 'B', 'below')
        C = pointAbstrait(1, 0, 'C', 'above')
        D = pointAbstrait(2, 0, 'D', 'above')
        E = pointAbstrait(2, 2, 'C', 'above')
        F = pointAbstrait(3, 2, 'D', 'above')
        G = pointAbstrait(0, 4, 'C', 'above')
        H = pointAbstrait(b, 4, 'D', 'above')
        s1 = segmentAvecExtremites(G, H)
        s1.epaisseur = 2
        s2 = segment(A, B)
        s2.epaisseur = 2
        s3 = segment(C, B)
        s3.epaisseur = 2
        s4 = segment(C, D)
        s4.epaisseur = 2
        s5 = segment(D, E)
        s5.epaisseur = 2
        s6 = segment(E, F)
        s6.epaisseur = 2
        xmin = -1
        ymin = -2
        xmax = 7
        ymax = 5
        const objets = []
        objets.push(
          texteParPosition(
            '1 u.l.',
            milieu(G, H).x,
            milieu(G, H).y + 0.7,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          a,
          s1,
          s2,
          s3,
          s4,
          s5,
          s6,
        )
        this.reponse = fraction(7, b).texFraction
        this.question +=
          mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 20,
              mainlevee: false,
              amplitude: 0.5,
              scale: 0.5,
              center: !context.isHtml,
            },
            objets,
          ) + '<br>'
        this.correction = `Une unité correspond à $${b}$ carreaux, la ligne brisée mesure $7$ carreaux, soit $${miseEnEvidence(`\\dfrac{${7}}{${b}}`)}$ u.l. `
      }
      if (choix === 'b') {
        a = grille(-2, -1, 7, 4, 'gray', 1, 1)
        b = choice([3, 4, 5, 6])
        A = pointAbstrait(0, 2, 'A', 'below')
        B = pointAbstrait(1, 2, 'B', 'below')
        C = pointAbstrait(1, 0, 'C', 'above')
        D = pointAbstrait(4, 0, 'D', 'above')
        E = pointAbstrait(4, 1, 'C', 'above')
        G = pointAbstrait(0, 4, 'C', 'above')
        H = pointAbstrait(b, 4, 'D', 'above')
        s1 = segmentAvecExtremites(G, H)
        s1.epaisseur = 2
        s2 = segment(A, B)
        s2.epaisseur = 2
        s3 = segment(C, B)
        s3.epaisseur = 2
        s4 = segment(C, D)
        s4.epaisseur = 2
        s5 = segment(D, E)
        s5.epaisseur = 2

        xmin = -1
        ymin = -1
        xmax = 7
        ymax = 5
        objets = []
        objets.push(
          texteParPosition(
            '1 u.l.',
            milieu(G, H).x,
            milieu(G, H).y + 0.7,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          a,
          s1,
          s2,
          s3,
          s4,
          s5,
        )
        this.reponse = fraction(7, b).texFraction
        this.question +=
          mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 20,
              mainlevee: false,
              amplitude: 0.5,
              scale: 0.5,
              center: !context.isHtml,
            },
            objets,
          ) + '<br>'
        this.correction = `Une unité correspond à $${b}$ carreaux, la ligne brisée mesure $7$ carreaux, soit $${miseEnEvidence(`\\dfrac{${7}}{${b}}`)}$ u.l. `
      }
      if (choix === 'c') {
        a = grille(-2, -1, 7, 4, 'gray', 1, 1)
        b = choice([3, 4, 5, 6])
        A = pointAbstrait(0, 2, 'A', 'below')
        B = pointAbstrait(1, 2, 'B', 'below')
        C = pointAbstrait(1, 0, 'C', 'above')
        D = pointAbstrait(3, 0, 'D', 'above')
        E = pointAbstrait(3, 2, 'C', 'above')
        G = pointAbstrait(0, 4, 'C', 'above')
        H = pointAbstrait(b, 4, 'D', 'above')
        s1 = segmentAvecExtremites(G, H)
        s1.epaisseur = 2
        s2 = segment(A, B)
        s2.epaisseur = 2
        s3 = segment(C, B)
        s3.epaisseur = 2
        s4 = segment(C, D)
        s4.epaisseur = 2
        s5 = segment(D, E)
        s5.epaisseur = 2

        xmin = -1
        ymin = -1
        xmax = 7
        ymax = 5
        objets = []
        objets.push(
          texteParPosition(
            '1 u.l.',
            milieu(G, H).x,
            milieu(G, H).y + 0.7,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          a,
          s1,
          s2,
          s3,
          s4,
          s5,
        )
        this.reponse = fraction(7, b).texFraction
        this.question +=
          mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 20,
              mainlevee: false,
              amplitude: 0.5,
              scale: 0.5,
              center: !context.isHtml,
            },
            objets,
          ) + '<br>'
        this.correction = `Une unité correspond à $${b}$ carreaux, la ligne brisée mesure $7$ carreaux, soit $${miseEnEvidence(`\\dfrac{${7}}{${b}}`)}$ u.l. `
      }
      if (choix === 'd') {
        a = grille(-2, -1, 7, 4, 'gray', 1, 1)
        b = choice([3, 4, 6])
        A = pointAbstrait(0, 2, 'A', 'below')
        B = pointAbstrait(1, 2, 'B', 'below')
        C = pointAbstrait(1, 1, 'C', 'above')
        D = pointAbstrait(3, 1, 'D', 'above')
        E = pointAbstrait(3, 2, 'C', 'above')
        G = pointAbstrait(0, 4, 'C', 'above')
        H = pointAbstrait(b, 4, 'D', 'above')
        s1 = segmentAvecExtremites(G, H)
        s1.epaisseur = 2
        s2 = segment(A, B)
        s2.epaisseur = 2
        s3 = segment(C, B)
        s3.epaisseur = 2
        s4 = segment(C, D)
        s4.epaisseur = 2
        s5 = segment(D, E)
        s5.epaisseur = 2

        xmin = -1
        ymin = -1
        xmax = 7
        ymax = 5
        objets = []
        objets.push(
          texteParPosition(
            '1 u.l.',
            milieu(G, H).x,
            milieu(G, H).y + 0.7,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          a,
          s1,
          s2,
          s3,
          s4,
          s5,
        )
        this.reponse = fraction(5, b).texFraction
        this.question +=
          mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 20,
              mainlevee: false,
              amplitude: 0.5,
              scale: 0.5,
              center: !context.isHtml,
            },
            objets,
          ) + '<br>'
        this.correction = `Une unité correspond à $${b}$ carreaux, la ligne brisée mesure $5$ carreaux, soit $${miseEnEvidence(`\\dfrac{${5}}{${b}}`)}$ u.l. `
      }
      if (choix === 'e') {
        a = grille(-2, -1, 7, 4, 'gray', 1, 1)
        b = choice([3, 4, 6])
        A = pointAbstrait(0, 2, 'A', 'below')
        B = pointAbstrait(1, 2, 'B', 'below')
        C = pointAbstrait(2, 2, 'C', 'above')
        D = pointAbstrait(2, 1, 'D', 'above')
        E = pointAbstrait(4, 1, 'C', 'above')
        G = pointAbstrait(0, 4, 'C', 'above')
        H = pointAbstrait(b, 4, 'D', 'above')
        s1 = segmentAvecExtremites(G, H)
        s1.epaisseur = 2
        s2 = segment(A, B)
        s2.epaisseur = 2
        s3 = segment(C, B)
        s3.epaisseur = 2
        s4 = segment(C, D)
        s4.epaisseur = 2
        s5 = segment(D, E)
        s5.epaisseur = 2

        xmin = -1
        ymin = -1
        xmax = 7
        ymax = 5
        objets = []
        objets.push(
          texteParPosition(
            '1 u.l.',
            milieu(G, H).x,
            milieu(G, H).y + 0.7,
            0,
            'black',
            context.isHtml ? 1 : 0.7,
          ),
          a,
          s1,
          s2,
          s3,
          s4,
          s5,
        )
        this.reponse = fraction(5, b).texFraction
        this.question +=
          mathalea2d(
            {
              xmin,
              ymin,
              xmax,
              ymax,
              pixelsParCm: 20,
              mainlevee: false,
              amplitude: 0.5,
              scale: 0.5,
              center: !context.isHtml,
            },
            objets,
          ) + '<br>'
        this.correction = `Une unité correspond à $${b}$ carreaux, la ligne brisée mesure $5$ carreaux, soit $${miseEnEvidence(`\\dfrac{${5}}{${b}}`)}$ u.l. `
      }
      this.optionsChampTexte = { texteApres: 'u.l.' }

      this.canReponseACompleter = '$\\ldots$ u.l.'
    }
  }
}
