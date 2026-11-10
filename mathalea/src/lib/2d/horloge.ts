import type Hms from '../../modules/Hms'
import { cercle } from './cercle'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { polygone } from './polygones'
import { segment } from './segmentsVecteurs'
import { latex2d } from './textes'
import { rotation, similitude, translation } from './transformations'
import { vecteur } from './Vecteur'

/**
 * Un objet pour avoir une horloge
 * Si heure n'est pas définie, il n'y a pas d'aiguilles.
 * @author Jean-claude Lhote
 * Date de publication : 01/02/2025
 */
export default class Horloge extends ObjetMathalea2D {
  constructor(x = 0, y = 0, rayon = 2, heure?: Hms) {
    super()
    this.objets = []
    const O = pointAbstrait(x, y)
    const C = cercle(O, rayon)
    C.opacite = 0.8
    this.objets.push(C)
    const rouage = cercle(O, 0.15, 'black', 'gray')
    rouage.epaisseur = 3
    const ecartNumeros = 0.5
    for (let i = 1; i <= 12; i++) {
      const angleRot = (Math.PI / 180) * (90 - i * 30)
      const numero = latex2d(
        String(i),
        x + (rayon - ecartNumeros) * Math.cos(angleRot),
        y + (rayon - ecartNumeros) * Math.sin(angleRot),
        { letterSize: 'footnotesize', orientation: 0, opacity: 0.6 },
      )
      this.objets.push(numero)
    }
    this.objets.push(rouage)
    const t = segment(x + rayon - 0.2, y, x + rayon - 0.05, y)
    for (let i = 0; i < 4; i++) {
      const tick1 = rotation(t, O, 30 + i * 90)
      const tick2 = rotation(t, O, 60 + i * 90)
      const tick3 = rotation(t, O, 90 + i * 90)
      const opaciteTick = 0.8
      tick1.opacite = opaciteTick
      tick2.opacite = opaciteTick
      tick3.opacite = opaciteTick
      this.objets.push(tick1, tick2, tick3)
    }

    if (heure != null) {
      const h = heure.hour
      const m = heure.minute
      const alpha = 90 - h * 30 - m / 2
      const beta = 90 - m * 6
      const epissure = 3
      const point0 = translation(O, vecteur(0.2, 0))
      const extTitAig = pointAbstrait(x + rayon - 1, y)
      const m1TitAig = similitude(extTitAig, point0, epissure, 0.9)
      const m2TitAig = similitude(extTitAig, point0, -epissure, 0.9)
      const polyTitAig = polygone(point0, m1TitAig, extTitAig, m2TitAig)
      const extGdeAig = pointAbstrait(x + rayon - 0.6, y)
      const m1GdeAig = similitude(extGdeAig, point0, epissure, 0.9)
      const m2GdeAig = similitude(extGdeAig, point0, -epissure, 0.9)
      const polyGdeAig = polygone(point0, m1GdeAig, extGdeAig, m2GdeAig)
      const grandeAiguille = rotation(polyGdeAig, O, beta)
      const petiteAiguille = rotation(polyTitAig, O, alpha)
      petiteAiguille.epaisseur = 1
      grandeAiguille.epaisseur = 1
      this.objets.push(petiteAiguille, grandeAiguille)
    }
  }

  svg(coef: number) {
    let code = ''
    if (this.objets != null) {
      for (const objet of this.objets) {
        code += objet.svg(coef) + '\n'
      }
    }
    return code
  }

  // à remplacer par un code tikzPicture plus propre ?
  tikz() {
    let code = ''
    if (this.objets != null) {
      for (const objet of this.objets) {
        code += objet.tikz()
      }
    }
    return code
  }
}
