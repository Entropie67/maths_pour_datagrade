import { cercleCentrePoint } from '../../../lib/2d/cercle'
import { grille } from '../../../lib/2d/Grille'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { pointSurCercle } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Associer une mesure d'angle à un point du cercle trigonométrique"
export const interactifReady = true

export const dateDePublication = '31/10/2022'
export const dateDeModifImportante = '06/11/2024'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 *
*/

export const uuid = '33ae8'

export const refs = {
  'fr-fr': ['can1G2-05'],
  'fr-ch': ['2mTrigoTri-4'],
}
export default class PointSurCercleTrigo extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.grecTrigo
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let choix
    const r = 5
    const O = pointAbstrait(0, 0, 'O', 'below left')
    const o = texteParPosition('O', -0.4, -0.4, 0, 'black', 1)
    const I = pointAbstrait(r, 0, 'I', 'right')
    const J = pointAbstrait(0, r, 'J', 'above')
    const K = pointAbstrait(-r, 0, 'K', 'left')
    const L = pointAbstrait(0, -r, 'L', 'below')
    const I2 = pointAbstrait(-r, 0)
    const J2 = pointAbstrait(0, -r)
    const s1 = segment(I, I2)
    const s2 = segment(J, J2)
    const c = cercleCentrePoint(O, I)
    c.epaisseur = 3
    const sOI = segment(O, I, bleuMathalea)
    sOI.epaisseur = 3
    const A1 = pointSurCercle(c, 30, 'A', 'above right')
    const A2 = pointSurCercle(c, 210, 'G', 'below left')
    const sA1A2 = segment(A1, A2, bleuMathalea)
    sA1A2.epaisseur = 1
    sA1A2.pointilles = 5
    const B1 = pointSurCercle(c, 45, 'B', 'above right')
    const B2 = pointSurCercle(c, 225, 'H', 'below left')
    const sB1B2 = segment(B1, B2, bleuMathalea)
    sB1B2.epaisseur = 1
    sB1B2.pointilles = 5
    const C1 = pointSurCercle(c, 60, 'C', 'above right')
    const C2 = pointSurCercle(c, 240, 'M', 'below left')
    const sC1C2 = segment(C1, C2, bleuMathalea)
    sC1C2.epaisseur = 1
    sC1C2.pointilles = 5
    const D1 = pointSurCercle(c, 120, 'D', 'above left')
    const D2 = pointSurCercle(c, -60, 'N', 'below right')
    const sD1D2 = segment(D1, D2, bleuMathalea)
    sD1D2.epaisseur = 1
    sD1D2.pointilles = 5
    const E1 = pointSurCercle(c, 135, 'E', 'above left')
    const E2 = pointSurCercle(c, -45, 'P', 'below right')
    const sE1E2 = segment(E1, E2, bleuMathalea)
    sE1E2.epaisseur = 1
    sE1E2.pointilles = 5
    const F1 = pointSurCercle(c, 150, 'F', 'above left')
    const F2 = pointSurCercle(c, -30, 'Q', 'below right')
    const sF1F2 = segment(F1, F2, bleuMathalea)
    sF1F2.epaisseur = 1
    sF1F2.pointilles = 5
    const g = grille(-5, -5, 5, 5, 'black', 0.4, 2.5)
    const nom = polygoneAvecNom(
      A1,
      A2,
      B1,
      B2,
      C1,
      C2,
      D1,
      D2,
      E1,
      E2,
      F1,
      F2,
      I,
      J,
      K,
      L,
    )[1]
    const objet = mathalea2d(
      {
        xmin: -r - 3,
        xmax: r + 3,
        ymin: -r - 1.5,
        ymax: r + 1,
        pixelsParCm: 15,
        scale: 0.45,
        center: !context.isHtml,
      },
      c,
      s1,
      s2,
      sA1A2,
      sB1B2,
      sC1C2,
      sD1D2,
      sE1E2,
      sF1F2,
      g,
      o,
      nom,
    )
    switch (
      this.quotaRandint('type', 1, 16) //, 2, 3, 4, 5
    ) {
      case 1: // point I
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $I$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le réel $${miseEnEvidence('2\\pi')}$ est associé au point $I$ dans $${choix}$. `
          this.reponse = '2\\pi'
        } else {
          this.correction = `Le réel $${miseEnEvidence(0)}$ est associé au point $I$ dans $${choix}$. `
          this.reponse = '0'
        }

        break
      case 2: // point A
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $A$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === ']-\\pi\\,;\\,\\pi]') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{\\pi}{6}')}$ est associé au point $A$ dans $${choix}$. `
          this.reponse = '\\dfrac{\\pi}{6}'
        } else if (choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $A$ est le point-image de $\\dfrac{\\pi}{6}$.<br>
            $\\dfrac{\\pi}{6}+2\\pi=\\dfrac{13\\pi}{6}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('\\dfrac{13\\pi}{6}')}$ est associé au point $A$ dans $${choix}$. `
          this.reponse = '\\dfrac{13\\pi}{6}'
        } else {
          this.correction = `Le point $A$ est le point-image de $\\dfrac{\\pi}{6}$.<br>
            $\\dfrac{\\pi}{6}-2\\pi=-\\dfrac{11\\pi}{6}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{11\\pi}{6}')}$ est associé au point $A$ dans $${choix}$. `
          this.reponse = '-\\dfrac{11\\pi}{6}'
        }
        break

      case 3: // point B
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $B$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === ']-\\pi\\,;\\,\\pi]') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{\\pi}{4}')}$ est associé au point $B$ dans $${choix}$. `
          this.reponse = '\\dfrac{\\pi}{4}'
        } else if (choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $B$ est le point-image de $\\dfrac{\\pi}{4}$.<br>
            $\\dfrac{\\pi}{4}+2\\pi=\\dfrac{9\\pi}{4}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('\\dfrac{9\\pi}{4}')}$ est associé au point $B$ dans $${choix}$. `
          this.reponse = '\\dfrac{9\\pi}{4}'
        } else {
          this.correction = `Le point $B$ est le point-image de $\\dfrac{\\pi}{4}$.<br>
            $\\dfrac{\\pi}{4}-2\\pi=-\\dfrac{7\\pi}{4}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{7\\pi}{4}')}$ est associé au point $B$ dans $${choix}$. `
          this.reponse = '-\\dfrac{7\\pi}{4}'
        }

        break

      case 4: // point C
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $C$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === ']-\\pi\\,;\\,\\pi]') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{\\pi}{3}')}$ est associé au point $C$ dans $${choix}$. `
          this.reponse = '\\dfrac{\\pi}{3}'
        } else if (choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $C$ est le point-image de $\\dfrac{\\pi}{3}$.<br>
            $\\dfrac{\\pi}{3}+2\\pi=\\dfrac{7\\pi}{3}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('\\dfrac{7\\pi}{3}')}$ est associé au point $C$ dans $${choix}$. `
          this.reponse = '\\dfrac{7\\pi}{3}'
        } else {
          this.correction = `Le point $C$ est le point-image de $\\dfrac{\\pi}{3}$.<br>
            $\\dfrac{\\pi}{3}-2\\pi=-\\dfrac{5\\pi}{3}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{5\\pi}{3}')}$ est associé au point $C$ dans $${choix}$. `
          this.reponse = '-\\dfrac{5\\pi}{3}'
        }

        break

      case 5: // point J
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $J$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === ']-\\pi\\,;\\,\\pi]') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{\\pi}{2}')}$ est associé au point $J$ dans $${choix}$. `
          this.reponse = '\\dfrac{\\pi}{2}'
        } else if (choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $J$ est le point-image de $\\dfrac{\\pi}{2}$.<br>
            $\\dfrac{\\pi}{2}+2\\pi=\\dfrac{5\\pi}{2}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('\\dfrac{5\\pi}{2}')}$ est associé au point $J$ dans $${choix}$. `
          this.reponse = '\\dfrac{5\\pi}{2}'
        } else {
          this.correction = `Le point $J$ est le point-image de $\\dfrac{\\pi}{2}$.<br>
            $\\dfrac{\\pi}{2}-2\\pi=-\\dfrac{3\\pi}{2}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{3\\pi}{2}')}$ est associé au point $J$ dans $${choix}$. `
          this.reponse = '-\\dfrac{3\\pi}{2}'
        }

        break

      case 6: // point D
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $D$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === ']-\\pi\\,;\\,\\pi]') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{2\\pi}{3}')}$ est associé au point $D$ dans $${choix}$. `
          this.reponse = '\\dfrac{2\\pi}{3}'
        } else if (choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $D$ est le point-image de $\\dfrac{2\\pi}{3}$.<br>
            $\\dfrac{2\\pi}{3}+2\\pi=\\dfrac{8\\pi}{3}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('\\dfrac{8\\pi}{3}')}$ est associé au point $D$ dans $${choix}$. `
          this.reponse = '\\dfrac{8\\pi}{3}'
        } else {
          this.correction = `Le point $D$ est le point-image de $\\dfrac{2\\pi}{3}$.<br>
            $\\dfrac{2\\pi}{3}-2\\pi=-\\dfrac{4\\pi}{3}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{4\\pi}{3}')}$ est associé au point $D$ dans $${choix}$. `
          this.reponse = '-\\dfrac{4\\pi}{3}'
        }

        break

      case 7: // point E
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $E$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === ']-\\pi\\,;\\,\\pi]') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{3\\pi}{4}')}$ est associé au point $E$ dans $${choix}$. `
          this.reponse = '\\dfrac{3\\pi}{4}'
        } else if (choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $E$ est le point-image de $\\dfrac{3\\pi}{4}$.<br>
            $\\dfrac{3\\pi}{4}+2\\pi=\\dfrac{11\\pi}{4}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('\\dfrac{11\\pi}{4}')}$ est associé au point $E$ dans $${choix}$. `
          this.reponse = '\\dfrac{11\\pi}{4}'
        } else {
          this.correction = `Le point $E$ est le point-image de $\\dfrac{3\\pi}{4}$.<br>
            $\\dfrac{3\\pi}{4}-2\\pi=-\\dfrac{5\\pi}{4}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{5\\pi}{4}')}$ est associé au point $E$ dans $${choix}$. `
          this.reponse = '-\\dfrac{5\\pi}{4}'
        }

        break

      case 8: // point F
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $F$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === ']-\\pi\\,;\\,\\pi]') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{5\\pi}{6}')}$ est associé au point $F$ dans $${choix}$. `
          this.reponse = '\\dfrac{5\\pi}{6}'
        } else if (choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $F$ est le point-image de $\\dfrac{5\\pi}{6}$.<br>
            $\\dfrac{5\\pi}{6}+2\\pi=\\dfrac{17\\pi}{6}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('\\dfrac{17\\pi}{6}')}$ est associé au point $F$ dans $${choix}$. `
          this.reponse = '\\dfrac{17\\pi}{6}'
        } else {
          this.correction = `Le point $F$ est le point-image de $\\dfrac{5\\pi}{6}$.<br>
            $\\dfrac{5\\pi}{6}-2\\pi=-\\dfrac{7\\pi}{6}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{7\\pi}{6}')}$ est associé au point $F$ dans $${choix}$. `
          this.reponse = '-\\dfrac{7\\pi}{6}'
        }

        break

      case 9: // point K
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $K$ ?<br>

        `
        this.question += `${objet}`
        if (choix === ']-2\\pi\\,;\\,0]') {
          this.correction = `Le réel $${miseEnEvidence('-\\pi')}$ est associé au point $K$ dans $${choix}$. `
          this.reponse = '-\\pi'
        } else {
          this.correction = `Le réel $${miseEnEvidence('\\pi')}$ est associé au point $K$ dans $${choix}$. `
          this.reponse = '\\pi'
        }

        break

      case 10: // point G
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\,;\\,0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $G$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{7\\pi}{6}')}$ est associé au point $G$ dans $${choix}$. `
          this.reponse = '\\dfrac{7\\pi}{6}'
        } else {
          this.correction = `Le point $G$ est le point-image de $\\dfrac{7\\pi}{6}$.<br>
            $\\dfrac{7\\pi}{6}-2\\pi=-\\dfrac{5\\pi}{6}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{5\\pi}{6}')}$ est associé au point $G$ dans $${choix}$. `
          this.reponse = '-\\dfrac{5\\pi}{6}'
        }

        break
      case 11: // point H
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\;\\ 0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $H$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{5\\pi}{4}')}$ est associé au point $H$ dans $${choix}$. `
          this.reponse = '\\dfrac{5\\pi}{4}'
        } else {
          this.correction = `Le point $H$ est le point-image de $\\dfrac{5\\pi}{4}$.<br>
            $\\dfrac{5\\pi}{4}-2\\pi=-\\dfrac{3\\pi}{4}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{3\\pi}{4}')}$ est associé au point $H$ dans $${choix}$. `
          this.reponse = '-\\dfrac{3\\pi}{4}'
        }

        break

      case 12: // point M
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\;\\ 0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $M$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{4\\pi}{3}')}$ est associé au point $M$ dans $${choix}$. `
          this.reponse = '\\dfrac{4\\pi}{3}'
        } else {
          this.correction = `Le point $M$ est le point-image de $\\dfrac{4\\pi}{3}$.<br>
            $\\dfrac{4\\pi}{3}-2\\pi=-\\dfrac{2\\pi}{3}\\in ${choix}$.<br>
             Le réel $${miseEnEvidence('-\\dfrac{2\\pi}{3}')}$ est associé au point $M$ dans $${choix}$. `
          this.reponse = '-\\dfrac{2\\pi}{3}'
        }

        break

      case 13: // point L
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\;\\ 0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $L$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le réel $${miseEnEvidence('\\dfrac{3\\pi}{2}')}$ est associé au point $L$ dans $${choix}$. `
          this.reponse = '\\dfrac{3\\pi}{2}'
        } else {
          this.correction = `Le réel $${miseEnEvidence('-\\dfrac{\\pi}{2}')}$ est associé au point $L$ dans $${choix}$. `
          this.reponse = '-\\dfrac{\\pi}{2}'
        }

        break

      case 14: // point N
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\;\\ 0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $N$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $N$ est le point-image de $-\\dfrac{\\pi}{3}$.<br>
          $-\\dfrac{\\pi}{3}+2\\pi=\\dfrac{5\\pi}{3}\\in ${choix}$.<br>
           Le réel $${miseEnEvidence('\\dfrac{5\\pi}{3}')}$ est associé au point $N$ dans $${choix}$. `
          this.reponse = '\\dfrac{5\\pi}{3}'
        } else {
          this.correction = `Le réel $${miseEnEvidence('-\\dfrac{\\pi}{3}')}$ est associé au point $N$ dans $${choix}$. `
          this.reponse = '-\\dfrac{\\pi}{3}'
        }

        break

      case 15: // point P
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\;\\ 0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $P$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $P$ est le point-image de $-\\dfrac{\\pi}{4}$.<br>
          $-\\dfrac{\\pi}{4}+2\\pi=\\dfrac{7\\pi}{4}\\in ${choix}$.<br>
           Le réel $${miseEnEvidence('\\dfrac{7\\pi}{4}')}$ est associé au point $P$ dans $${choix}$. `
          this.reponse = '\\dfrac{7\\pi}{4}'
        } else {
          this.correction = `Le réel $${miseEnEvidence('-\\dfrac{\\pi}{4}')}$ est associé au point $P$ dans $${choix}$. `
          this.reponse = '-\\dfrac{\\pi}{4}'
        }

        break

      case 16: // point Q
      default:
        choix = choice([
          '[0\\,;\\,2\\pi[',
          ']-\\pi\\,;\\,\\pi]',
          '[\\pi\\,;\\,3\\pi[',
          ']-2\\pi\\;\\ 0]',
        ])
        this.question = `Quel réel de $${choix}$ a pour point-image le point $Q$ ?<br>

        `
        this.question += `${objet}`
        if (choix === '[0\\,;\\,2\\pi[' || choix === '[\\pi\\,;\\,3\\pi[') {
          this.correction = `Le point $Q$ est le point-image de $-\\dfrac{\\pi}{6}$.<br>
          $-\\dfrac{\\pi}{6}+2\\pi=\\dfrac{11\\pi}{6}\\in ${choix}$.<br>
           Le réel $${miseEnEvidence('\\dfrac{11\\pi}{6}')}$ est associé au point $Q$ dans $${choix}$. `
          this.reponse = '\\dfrac{11\\pi}{6}'
        } else {
          this.correction = `Le réel $${miseEnEvidence('-\\dfrac{\\pi}{6}')}$ est associé au point $Q$ dans $${choix}$. `
          this.reponse = '-\\dfrac{\\pi}{6}'
        }

        break
    }
  }
}
