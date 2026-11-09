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
import { rienSi1 } from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { abs } from '../../../lib/outils/nombres'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Associer un point à un réel sur un cercle trigonométrique'
export const interactifReady = true

export const dateDePublication = '31/10/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 *
*/

export const uuid = 'aa661'

export const refs = {
  'fr-fr': ['can1G2-04', 'BP1GEO05'],
  'fr-ch': [],
}
export default class AngleSurCercleTrigo extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.alphanumeric
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, k
    const r = 5
    const O = pointAbstrait(0, 0, 'O', 'below left')
    const o = texteParPosition('O', -0.4, -0.4, 0, 'black', 1)
    const I = pointAbstrait(r, 0, 'I')
    const J = pointAbstrait(0, r, 'J')
    const K = pointAbstrait(-r, 0, 'K')
    const L = pointAbstrait(0, -r, 'L')
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
      nom,
      o,
    )
    switch (this.quotaChoice('type', [1, 2, 3, 4, 5])) {
      case 1: // les 0
        a = choice([
          '0',
          '2\\pi',
          '4\\pi',
          '-2\\pi',
          '-4\\pi',
          '\\pi',
          '-\\pi',
          '3\\pi',
          '5\\pi',
        ])
        this.question = `Quel est le point-image du réel $${a}$  ?<br>

        `
        this.question += `${objet}`
        if (
          a === '0' ||
          a === '2\\pi' ||
          a === '4\\pi' ||
          a === '-2\\pi' ||
          a === '-4\\pi'
        ) {
          if (a === '0') {
            this.correction = `Le point ${texteEnCouleurEtGras('I')} est le point-image du réel $0$.`
          } else {
            this.correction = `Comme $${a}=0$ modulo $2\\pi$, le point-image de $${a}$ est le point ${texteEnCouleurEtGras('I')}.  `
          }
          this.reponse = 'I'
        }
        if (a === '\\pi' || a === '-\\pi' || a === '3\\pi' || a === '5\\pi') {
          if (a === '\\pi') {
            this.correction = `Le point ${texteEnCouleurEtGras('K')} est le point-image du réel $\\pi$.`
          } else {
            this.correction = `Comme $${a}=\\pi$ modulo $2\\pi$, le point-image de $${a}$ est le point ${texteEnCouleurEtGras('K')}.  `
          }
          this.reponse = 'K'
        }
        break
      case 2: // les pi/6
        k = choice([1, 5, 7, 11, 13]) * choice([-1, 1])
        if (k > 0) {
          this.question = `Quel est le point-image du réel $\\dfrac{${rienSi1(k)}\\pi}{6}$  ?<br>

        `
        } else {
          this.question = `Quel est le point-image du réel $-\\dfrac{${rienSi1(abs(k))}\\pi}{6}$  ?<br>

        `
        }
        this.question += `${objet}`
        if (k === 1 || k === 13 || k === -11) {
          if (k === 1) {
            this.correction = `Le point ${texteEnCouleurEtGras('A')} est le point-image du réel $\\dfrac{\\pi}{6}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{6}=\\dfrac{\\pi}{6}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{6}$ est le point ${texteEnCouleurEtGras('A')}.`
          }
          this.reponse = 'A'
        }
        if (k === 5 || k === -7) {
          if (k === 5) {
            this.correction = `Le point ${texteEnCouleurEtGras('F')} est le point-image du réel $\\dfrac{5\\pi}{6}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{6}=\\dfrac{5\\pi}{6}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{6}$ est le point ${texteEnCouleurEtGras('F')}.  `
          }
          this.reponse = 'F'
        }
        if (k === 7 || k === -5) {
          if (k === 7) {
            this.correction = `Le point ${texteEnCouleurEtGras('G')} est le point-image du réel $\\dfrac{${k}\\pi}{6}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{6}=\\dfrac{7\\pi}{6}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{6}$ est le point ${texteEnCouleurEtGras('G')}.  `
          }
          this.reponse = 'G'
        }
        if (k === 11 || k === -1 || k === -13) {
          if (k === -1) {
            this.correction = `Le point ${texteEnCouleurEtGras('Q')} est le point-image du réel $-\\dfrac{\\pi}{6}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{6}=\\dfrac{7\\pi}{6}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{6}$ est le point ${texteEnCouleurEtGras('Q')}.  `
          }
          this.reponse = 'Q'
        }
        break

      case 3: // les pi/4
        k = choice([1, 3, 5, 7, 9]) * choice([-1, 1])
        if (k > 0) {
          this.question = `Quel est le point-image du réel $\\dfrac{${rienSi1(k)}\\pi}{4}$  ?<br>

        `
        } else {
          this.question = `Quel est le point-image du réel $-\\dfrac{${rienSi1(abs(k))}\\pi}{4}$  ?<br>

        `
        }
        this.question += `${objet}`
        if (k === 1 || k === 9 || k === -7) {
          if (k === 1) {
            this.correction = `Le point ${texteEnCouleurEtGras('B')} est le point-image du réel $\\dfrac{\\pi}{4}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{4}=\\dfrac{\\pi}{4}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{4}$ est le point ${texteEnCouleurEtGras('B')}.`
          }
          this.reponse = 'B'
        }
        if (k === 3 || k === -5) {
          if (k === 3) {
            this.correction = `Le point ${texteEnCouleurEtGras('E')} est le point-image du réel $\\dfrac{3\\pi}{4}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{4}=\\dfrac{3\\pi}{4}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{4}$ est le point ${texteEnCouleurEtGras('E')}.  `
          }
          this.reponse = 'E'
        }
        if (k === 5 || k === -3) {
          if (k === 5) {
            this.correction = `Le point ${texteEnCouleurEtGras('H')} est le point-image du réel $\\dfrac{${k}\\pi}{4}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{4}=\\dfrac{5\\pi}{4}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{4}$ est le point ${texteEnCouleurEtGras('H')}.  `
          }
          this.reponse = 'H'
        }
        if (k === 7 || k === -1 || k === -9) {
          if (k === -1) {
            this.correction = `Le point ${texteEnCouleurEtGras('P')} est le point-image du réel $-\\dfrac{\\pi}{4}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{4}=-\\dfrac{\\pi}{4}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{4}$ est le point ${texteEnCouleurEtGras('P')}.  `
          }
          this.reponse = 'P'
        }
        break

      case 4: // les pi/3
        k = choice([1, 2, 4, 5, 7, 8]) * choice([-1, 1])
        if (k > 0) {
          this.question = `Quel est le point-image du réel $\\dfrac{${rienSi1(k)}\\pi}{3}$  ?<br>

        `
        } else {
          this.question = `Quel est le point-image du réel $-\\dfrac{${rienSi1(abs(k))}\\pi}{3}$  ?<br>

        `
        }
        this.question += `${objet}`
        if (k === 1 || k === 7 || k === -5) {
          if (k === 1) {
            this.correction = `Le point ${texteEnCouleurEtGras('C')} est le point-image du réel $\\dfrac{\\pi}{3}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{3}=\\dfrac{\\pi}{3}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{3}$ est le point ${texteEnCouleurEtGras('C')}.`
          }
          this.reponse = 'C'
        }
        if (k === 2 || k === -4 || k === 8) {
          if (k === 2) {
            this.correction = `Le point ${texteEnCouleurEtGras('D')} est le point-image du réel $\\dfrac{2\\pi}{3}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{3}=\\dfrac{2\\pi}{3}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{3}$ est le point ${texteEnCouleurEtGras('D')}.  `
          }
          this.reponse = 'D'
        }
        if (k === 4 || k === -2 || k === -8) {
          this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{3}=-\\dfrac{2\\pi}{3}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{3}$ est le point ${texteEnCouleurEtGras('M')}.  `
          this.reponse = 'M'
        }
        if (k === 5 || k === -1 || k === -7) {
          if (k === -1) {
            this.correction = `Le point ${texteEnCouleurEtGras('N')} est le point-image du réel $-\\dfrac{\\pi}{3}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{3}=-\\dfrac{\\pi}{3}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{3}$ est le point ${texteEnCouleurEtGras('N')}.  `
          }
          this.reponse = 'N'
        }
        break

      case 5: // les pi/2
        k = choice([1, 3, 5, 7]) * choice([-1, 1])
        if (k > 0) {
          this.question = `Quel est le point-image du réel $\\dfrac{${rienSi1(k)}\\pi}{2}$  ?<br>

        `
        } else {
          this.question = `Quel est le point-image du réel $-\\dfrac{${rienSi1(abs(k))}\\pi}{2}$  ?<br>

        `
        }
        this.question += `${objet}`
        if (k === 1 || k === 5 || k === -3 || k === -7) {
          if (k === 1) {
            this.correction = `Le point ${texteEnCouleurEtGras('J')} est le point-image du réel $\\dfrac{\\pi}{2}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{2}=\\dfrac{\\pi}{2}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{2}$ est le point ${texteEnCouleurEtGras('J')}.`
          }
          this.reponse = 'J'
        }
        if (k === 3 || k === -1 || k === -5 || k === 7) {
          if (k === -1) {
            this.correction = `Le point ${texteEnCouleurEtGras('L')} est le point-image du réel $-\\dfrac{\\pi}{2}$.`
          } else {
            this.correction = `Comme $\\dfrac{${rienSi1(k)}\\pi}{2}=-\\dfrac{\\pi}{2}$ modulo $2\\pi$, le point-image de $\\dfrac{${rienSi1(k)}\\pi}{2}$ est le point ${texteEnCouleurEtGras('L')}.  `
          }
          this.reponse = 'L'
        }

        break
    }
  }
}
