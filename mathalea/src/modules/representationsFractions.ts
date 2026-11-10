import { arc } from '../lib/2d/Arc'
import { cercle } from '../lib/2d/cercle'
import { colorToLatexOrHTML } from '../lib/2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import { pointAbstrait, PointAbstrait } from '../lib/2d/PointAbstrait'
import { polygone } from '../lib/2d/polygones'
import { carre } from '../lib/2d/polygonesParticuliers'
import { segment } from '../lib/2d/segmentsVecteurs'
import { latex2d, texteParPosition } from '../lib/2d/textes'
import { rotation, translation } from '../lib/2d/transformations'
import { vecteur } from '../lib/2d/Vecteur'
import { bleuMathalea } from '../lib/colors'
import { stringNombre } from '../lib/outils/texNombre'
import type { NestedObjetMathalea2dArray } from '../types/2d'
import type FractionEtendue from './FractionEtendue'
import { quotientier } from './outils'

type FractionRepresentationType = 'gateau' | 'barre' | 'segment'

/**
 * Représentation graphique de la fraction irréductible
 */
export function representationFractionIrred(
  fraction: FractionEtendue,
  x: number,
  y: number,
  rayon: number,
  depart: number = 0,
  type: FractionRepresentationType = 'gateau',
  couleur: string = 'gray',
  unite0: number | string = 0,
  unite1: number | string = 1,
  scale: number = 1,
  label: string = '',
): ObjetMathalea2D[] {
  let num: number
  let k: number
  const objets: ObjetMathalea2D[] = []
  const n = quotientier(fraction.numIrred, fraction.denIrred)
  num = fraction.numIrred

  const unegraduation = function (
    x: number,
    y: number,
    couleur: string = 'black',
    epaisseur: number = 1,
  ) {
    const A = pointAbstrait(x, y + 0.2, '')
    const B = pointAbstrait(x, y - 0.2, '')
    const g = segment(A, B, couleur)
    g.epaisseur = epaisseur
    return g
  }

  if (type === 'gateau') {
    for (k = 0; k < n; k++) {
      const O = pointAbstrait(x + k * 2 * (rayon + 0.5), y)
      const C = cercle(O, rayon)
      objets.push(C)
      for (let i = 0; i < fraction.denIrred; i++) {
        const s = segment(
          O,
          rotation(
            pointAbstrait(x + rayon + k * 2 * (rayon + 0.5), y),
            O,
            90 - (i * 360) / fraction.denIrred,
          ),
        )
        objets.push(s)
      }
      let dep = rotation(
        pointAbstrait(x + rayon + k * 2 * (rayon + 0.5), y),
        O,
        90 - (depart * 360) / fraction.denIrred,
      )
      for (let j = 0; j < Math.min(fraction.denIrred, num); j++) {
        const a = arc(dep, O, -360 / fraction.denIrred, true, couleur)
        a.opacite = 0.3
        dep = rotation(dep, O, -360 / fraction.denIrred)
        objets.push(a)
      }
      num -= fraction.denIrred
    }
    if (Math.abs(fraction.numIrred) % Math.abs(fraction.denIrred) !== 0) {
      const O = pointAbstrait(x + k * 2 * (rayon + 0.5), y)
      const C = cercle(O, rayon)
      objets.push(C)
      for (let i = 0; i < fraction.denIrred; i++) {
        const s = segment(
          O,
          rotation(
            pointAbstrait(x + rayon + k * 2 * (rayon + 0.5), y),
            O,
            90 - (i * 360) / fraction.denIrred,
          ),
        )
        objets.push(s)
      }
      let dep = rotation(
        pointAbstrait(x + rayon + k * 2 * (rayon + 0.5), y),
        O,
        90 - (depart * 360) / fraction.denIrred,
      )
      for (let j = 0; j < Math.min(fraction.denIrred, num); j++) {
        const a = arc(dep, O, -360 / fraction.denIrred, true, couleur)
        a.opacite = 0.3
        dep = rotation(dep, O, -360 / fraction.denIrred)
        objets.push(a)
      }
    }
  } else if (type === 'segment') {
    for (k = 0; k < n; k++) {
      const O = pointAbstrait(x + k * rayon, y)
      const C = translation(O, vecteur(rayon, 0))
      const s = segment(O, C)
      s.styleExtremites = '-|'
      objets.push(s)
      for (let i = 0; i < fraction.denIrred; i++) {
        const s = segment(
          translation(O, vecteur((i * rayon) / fraction.denIrred, 0)),
          translation(O, vecteur(((i + 1) * rayon) / fraction.denIrred, 0)),
        )
        s.styleExtremites = '|-'
        objets.push(s)
      }
      const a = segment(
        O,
        pointAbstrait(
          O.x + (Math.min(num, fraction.denIrred) * rayon) / fraction.denIrred,
          O.y,
        ),
        couleur,
      )
      a.opacite = 0.4
      a.epaisseur = 6
      objets.push(a)
      num -= fraction.denIrred
    }
    const O = pointAbstrait(x + k * rayon, y)
    const C = translation(O, vecteur(rayon, 0))
    const s = segment(O, C)
    s.styleExtremites = '-|'
    objets.push(s)
    for (let i = 0; i < fraction.denIrred; i++) {
      const s = segment(
        translation(O, vecteur((i * rayon) / fraction.denIrred, 0)),
        translation(O, vecteur(((i + 1) * rayon) / fraction.denIrred, 0)),
      )
      s.styleExtremites = '|-'
      objets.push(s)
    }
    if (num > 0) {
      const a = segment(
        O,
        pointAbstrait(
          O.x +
            (Math.min(fraction.numIrred, fraction.denIrred) * rayon) /
              fraction.denIrred,
          O.y,
        ),
        couleur,
      )
      a.opacite = 0.4
      a.epaisseur = 6
      objets.push(a)
    }
    objets.push(unegraduation(x, y))
    if (typeof unite0 === 'number' && typeof unite1 === 'number') {
      for (k = 0; k <= n + 1; k++) {
        objets.push(
          texteParPosition(
            stringNombre(unite0 + k * (unite1 - unite0), 0),
            x + rayon * k,
            y - 0.6,
            0,
            'black',
            scale,
            'milieu',
            true,
            1,
          ),
        )
      }
    } else {
      if (unite0 != null) {
        objets.push(
          texteParPosition(
            String(unite0),
            x,
            y - 0.6,
            0,
            'black',
            scale,
            'milieu',
            true,
            1,
          ),
        )
      }
      if (unite1 != null) {
        objets.push(
          texteParPosition(
            String(unite1),
            x + rayon,
            y - 0.6,
            0,
            'black',
            scale,
            'milieu',
            true,
            1,
          ),
        )
      }
      if (label != null) {
        objets.push(
          texteParPosition(
            label,
            x + (rayon * fraction.numIrred) / fraction.denIrred,
            y - 0.6,
            0,
            'black',
            scale,
            'milieu',
            true,
            1,
          ),
        )
      }
    }
  } else {
    // Type 'barre'
    let diviseur
    if (fraction.denIrred % 6 === 0) {
      diviseur = 6
    } else if (fraction.denIrred % 5 === 0) {
      diviseur = 5
    } else if (fraction.denIrred % 4 === 0) {
      diviseur = 4
    } else if (fraction.denIrred % 3 === 0) {
      diviseur = 3
    } else if (fraction.denIrred % 2 === 0) {
      diviseur = 2
    } else {
      diviseur = 1
    }
    const tailleCarres = Math.max(rayon / diviseur, 1)
    for (k = 0; k < n; k++) {
      for (let j = 0; j < diviseur; j++) {
        for (let h = 0; h < fraction.denIrred / diviseur; h++) {
          const O = pointAbstrait(
            x + k * (diviseur * tailleCarres + 1) + j * tailleCarres,
            y + h * tailleCarres,
          )
          const C: PointAbstrait = translation(O, vecteur(tailleCarres, 0))
          const dep = carre(O, C, 'black')
          dep.couleurDeRemplissage = colorToLatexOrHTML(couleur)
          dep.opaciteDeRemplissage = 0.4
          objets.push(dep)
        }
      }
      num -= fraction.denIrred
    }
    if (num > 0) {
      for (let j = 0; j < diviseur; j++) {
        for (let h = 0; h < fraction.denIrred / diviseur; h++) {
          const O = pointAbstrait(
            x + n * (diviseur * tailleCarres + 1) + j * tailleCarres,
            y + h * tailleCarres,
          )
          const C = translation(O, vecteur(tailleCarres, 0))
          const dep = carre(O, C, 'black')
          objets.push(dep)
        }
      }
      for (let i = 0; i < num; i++) {
        const O = pointAbstrait(
          x + n * (diviseur * tailleCarres + 1) + (i % diviseur) * tailleCarres,
          y + quotientier(i, diviseur) * tailleCarres,
        )
        const C = translation(O, vecteur(tailleCarres, 0))
        const dep = carre(O, C, 'black')
        dep.couleurDeRemplissage = colorToLatexOrHTML(couleur)
        dep.opaciteDeRemplissage = 0.4
        objets.push(dep)
      }
    }
  }
  return objets
}

/**
 * Représentation graphique de la fraction (non simplifiée)
 */
export function representationFraction(
  fraction: FractionEtendue,
  x: number,
  y: number,
  rayon: number,
  depart: number = 0,
  type: FractionRepresentationType = 'gateau',
  couleur = 'gray',
  unite0: string | number = 0,
  unite1: string | number = 1,
  scale = 1,
  label = '',
): ObjetMathalea2D[] {
  const objets: ObjetMathalea2D[] = []
  let num: number
  let k: number
  const n = quotientier(Math.abs(fraction.num), Math.abs(fraction.den))
  num = Math.abs(fraction.num)

  const unegraduation = function (
    x: number,
    y: number,
    couleur: string = 'black',
    epaisseur: number = 1,
  ) {
    const A = pointAbstrait(x, y + 0.2)
    const B = pointAbstrait(x, y - 0.2)
    const g = segment(A, B, couleur)
    g.epaisseur = epaisseur
    return g
  }

  if (type === 'gateau') {
    for (k = 0; k < n; k++) {
      const O = pointAbstrait(x + k * 2 * (rayon + 0.5), y)
      const C = cercle(O, rayon)
      objets.push(C)
      for (let i = 0; i < fraction.den; i++) {
        const s = segment(
          O,
          rotation(
            pointAbstrait(x + rayon + k * 2 * (rayon + 0.5), y),
            O,
            90 - (i * 360) / fraction.den,
          ),
        )
        objets.push(s)
      }
      let dep = rotation(
        pointAbstrait(x + rayon + k * 2 * (rayon + 0.5), y),
        O,
        90 - (depart * 360) / fraction.den,
      )
      for (let j = 0; j < Math.min(fraction.den, num); j++) {
        const a = arc(dep, O, -360 / fraction.den, true, couleur)
        a.opacite = 0.3
        dep = rotation(dep, O, -360 / fraction.den)
        objets.push(a)
      }
      num -= fraction.den
    }
    if (fraction.num % fraction.den !== 0) {
      const O = pointAbstrait(x + k * 2 * (rayon + 0.5), y)
      const C = cercle(O, rayon)
      objets.push(C)
      for (let i = 0; i < fraction.den; i++) {
        const s = segment(
          O,
          rotation(
            pointAbstrait(x + rayon + k * 2 * (rayon + 0.5), y),
            O,
            90 - (i * 360) / fraction.den,
          ),
        )
        objets.push(s)
      }

      let dep = rotation(
        pointAbstrait(x + rayon + k * 2 * (rayon + 0.5), y),
        O,
        90 - (depart * 360) / fraction.den,
      )
      if (fraction.num % fraction.den !== 0) {
        for (let j = 0; j < Math.min(fraction.den, num); j++) {
          const a = arc(dep, O, -360 / fraction.den, true, couleur)
          a.opacite = 0.3
          dep = rotation(dep, O, -360 / fraction.den)
          objets.push(a)
        }
      }
    }
  } else if (type === 'segment') {
    for (k = 0; k < n; k++) {
      const O = pointAbstrait(x + k * rayon, y)
      const C = translation(O, vecteur(rayon, 0))
      const s = segment(O, C)
      s.styleExtremites = '-|'
      objets.push(s)
      for (let i = 0; i < fraction.den; i++) {
        const s = segment(
          translation(O, vecteur((i * rayon) / fraction.den, 0)),
          translation(O, vecteur(((i + 1) * rayon) / fraction.den, 0)),
        )
        s.styleExtremites = '|-'
        objets.push(s)
      }
      const a = segment(
        O,
        pointAbstrait(
          O.x + (Math.min(num, fraction.den) * rayon) / fraction.den,
          O.y,
        ),
        couleur,
      )
      a.opacite = 0.4
      a.epaisseur = 6
      objets.push(a)
      num -= fraction.den
    }
    const O = pointAbstrait(x + k * rayon, y)
    const C = translation(O, vecteur(rayon, 0))
    const s = segment(O, C)
    s.styleExtremites = '-|'
    objets.push(s)
    for (let i = 0; i < fraction.den; i++) {
      const s = segment(
        translation(O, vecteur((i * rayon) / fraction.den, 0)),
        translation(O, vecteur(((i + 1) * rayon) / fraction.den, 0)),
      )
      s.styleExtremites = '|-'
      objets.push(s)
    }
    if (num > 0) {
      const a = segment(
        O,
        pointAbstrait(
          O.x + (Math.min(num, fraction.den) * rayon) / fraction.den,
          O.y,
        ),
        couleur,
      )
      a.opacite = 0.4
      a.epaisseur = 6
      objets.push(a)
    }
    objets.push(unegraduation(x, y))
    if (typeof unite0 === 'number' && typeof unite1 === 'number') {
      for (k = 0; k <= n + 1; k++) {
        objets.push(
          texteParPosition(
            String(unite0 + k * (unite1 - unite0)),
            x + rayon * k,
            y - 0.6,
            0,
            'black',
            scale,
            'milieu',
            true,
            1,
          ),
        )
      }
    } else {
      if (String(unite0) !== '') {
        objets.push(
          texteParPosition(
            String(unite0),
            x,
            y - 0.6,
            0,
            'black',
            scale,
            'milieu',
            true,
            1,
          ),
        )
      }
      if (String(unite1) !== '') {
        objets.push(
          texteParPosition(
            String(unite1),
            x + rayon,
            y - 0.6,
            0,
            'black',
            scale,
            'milieu',
            true,
            1,
          ),
        )
      }
      if (label !== '') {
        objets.push(
          texteParPosition(
            label,
            x + (rayon * fraction.num) / fraction.den,
            y - 0.6,
            0,
            'black',
            scale,
            'milieu',
            true,
            1,
          ),
        )
      }
    }
  } else {
    // Type barre
    let diviseur
    if (fraction.den % 6 === 0) {
      diviseur = 6
    } else if (fraction.den % 5 === 0) {
      diviseur = 5
    } else if (fraction.den % 4 === 0) {
      diviseur = 4
    } else if (fraction.den % 3 === 0) {
      diviseur = 3
    } else if (fraction.den % 2 === 0) {
      diviseur = 2
    } else {
      diviseur = 1
    }
    const tailleCarres = Math.max(rayon / diviseur, 1)
    for (k = 0; k < n; k++) {
      for (let j = 0; j < diviseur; j++) {
        for (let h = 0; h < fraction.den / diviseur; h++) {
          const O = pointAbstrait(
            x + k * (diviseur * tailleCarres + 1) + j * tailleCarres,
            y + h * tailleCarres,
          )
          const C = translation(O, vecteur(tailleCarres, 0))
          const dep = carre(O, C, 'black')
          dep.couleurDeRemplissage = colorToLatexOrHTML(couleur)
          dep.opaciteDeRemplissage = 0.4
          objets.push(dep)
        }
      }
      num -= fraction.den
    }
    if (num > 0) {
      for (let j = 0; j < diviseur; j++) {
        for (let h = 0; h < fraction.den / diviseur; h++) {
          const O = pointAbstrait(
            x + n * (diviseur * tailleCarres + 1) + j * tailleCarres,
            y + h * tailleCarres,
          )
          const C = translation(O, vecteur(tailleCarres, 0))
          const dep = carre(O, C, 'black')
          objets.push(dep)
        }
      }
      for (let i = 0; i < num; i++) {
        const O = pointAbstrait(
          x + n * (diviseur * tailleCarres + 1) + (i % diviseur) * tailleCarres,
          y + quotientier(i, diviseur) * tailleCarres,
        )
        const C = translation(O, vecteur(tailleCarres, 0))
        const dep = carre(O, C, 'black')
        dep.couleurDeRemplissage = colorToLatexOrHTML(couleur)
        dep.opaciteDeRemplissage = 0.4
        objets.push(dep)
      }
    }
  }
  return objets
}

export function representeFractionSurBarre(
  fraction: FractionEtendue,
  denominator: number,
  max: number,
  width: number,
): NestedObjetMathalea2dArray {
  const hauteur = 0.2

  const objets: NestedObjetMathalea2dArray = []
  function unegraduation(x: number, width: number, vide = false) {
    const A = pointAbstrait(x, hauteur / 2)
    const B = pointAbstrait(x, -hauteur / 2)
    const C = pointAbstrait(x + width, -hauteur / 2)
    const D = pointAbstrait(x + width, hauteur / 2)
    const rect = polygone([A, B, C, D])
    rect.couleurDeRemplissage = vide
      ? colorToLatexOrHTML('white')
      : colorToLatexOrHTML(bleuMathalea)
    rect.couleur = colorToLatexOrHTML(bleuMathalea)
    rect.opaciteDeRemplissage = 0.5
    return rect
  }
  const ratio = denominator / fraction.den
  const widthByPart = width / denominator
  for (let i = 0; i < fraction.num * ratio; i++) {
    objets.push([unegraduation(i * widthByPart, widthByPart, false)])
  }
  for (let i = fraction.num * ratio; i < max * denominator; i++) {
    objets.push([unegraduation(i * widthByPart, widthByPart, true)])
  }
  for (let k = 0; k <= max; k++) {
    const seg = segment(k * width, -hauteur - 0.1, k * width, hauteur + 0.1)
    seg.color = colorToLatexOrHTML(bleuMathalea)
    seg.epaisseur = 3
    const txt = latex2d(k.toString(), k * width, hauteur + 1, {
      color: 'black',
      letterSize: 'normalsize',
    })
    objets.push([seg, txt])
  }
  return objets
}
