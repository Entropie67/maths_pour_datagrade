/**
 * Rend visible un element d'après son id
 * @param {number} id id propre à un objet MathALEA2d
 * @example montrerParDiv(s2.id) // Affiche l'objet s2
 * @author Rémi Angot
 */

import type { DemiDroite } from '../lib/2d/DemiDroite'
import type { Droite } from '../lib/2d/droites'
import { fixeBordures } from '../lib/2d/fixeBordures'
import type {
  IDroite,
  IPointAbstrait,
  IPolygone,
  IVecteur,
} from '../lib/2d/Interfaces'
import { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import type { PointAbstrait } from '../lib/2d/PointAbstrait'
import type { Polygone } from '../lib/2d/polygones'
import type { Segment } from '../lib/2d/segmentsVecteurs'
import {
  affiniteOrtho,
  homothetie,
  rotation,
  symetrieAxiale,
  translation,
} from '../lib/2d/transformations'
import type { Vecteur } from '../lib/2d/Vecteur'
import { arrondi } from '../lib/outils/nombres'

// JSDOC Validee par EE Juin 2022
export function montrerParDiv(id: string) {
  const elt = document.getElementById(id)
  if (elt != null) {
    elt.style.visibility = 'visible'
  } else {
    console.log(id + " n'existe pas et ne peut pas être rendu visible.")
  }
}

/**
 * Rend invisible un element d'après son id
 * @param {number} id id propre à un objet MathALEA2d
 * @example cacherParDiv(s2.id) // Cache l'objet s2
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022
export function cacherParDiv(id: string) {
  const elt = document.getElementById(id)
  if (elt != null) {
    elt.style.visibility = 'hidden'
  } else {
    console.log(id + " n'existe pas et ne peut pas être caché.")
  }
}

/**
 * Masque un objet pendant t0 secondes puis l'affiche pendant (t-t0) secondes avant de recommencer r fois ce cycle en tout
 * @param {ObjetMathalea2D} objet Objet MathALEA2d masqué puis affiché
 * @param {number} [t0=1] Temps en secondes avant l'apparition.
 * @param {number} [t=5] Temps à partir duquel l'animation recommence.
 * @param {string|number} [r='Infinity'] Nombre de répétitions (infini si ce n'est pas un nombre).
 * @example afficherTempo(ob1)
 * // Affiche ob1 au bout de 1 seconde, pendant 4 secondes puis le masque. Ce cycle est répété indéfiniment.
 * @example afficherTempo(ob1,2,9,10)
 * // Sur un cycle de 9 secondes, affiche ob1 au bout de 2 seconde puis le masque en fin de cycle. Ce cycle est répété 10 fois.
 */
// JSDOC Validee par EE Juin 2022
export function afficherTempo(
  objet: ObjetMathalea2D,
  t0 = 1,
  t = 5,
  r: number | string = 'Infinity',
) {
  let compteur = 1 // Nombre d'animations
  const checkExist = setInterval(function () {
    if (document.getElementById(String(objet.id))) {
      clearInterval(checkExist)
      cacherParDiv(String(objet.id))
      if (Number(r) === 1) {
        // On le montre au bout de t0 et on ne le cache plus
        setTimeout(function () {
          montrerParDiv(String(objet.id))
        }, t0 * 1000)
      } else {
        const cacheRepete = setInterval(function () {
          cacherParDiv(String(objet.id))
        }, t * 1000) // On cache tous les t s
        setTimeout(function () {
          montrerParDiv(String(objet.id)) // On attend t0 pour montrer
          const montreRepete = setInterval(function () {
            montrerParDiv(String(objet.id))
            compteur++
            if (typeof r === 'number') {
              if (compteur >= r) {
                clearInterval(cacheRepete)
                clearInterval(montreRepete)
              }
            }
          }, t * 1000) // On montre tous les t s (vu qu'on a décalé de t0)
        }, t0 * 1000) // Fin de l'animation en boucle
      }
    }
  }, 100) // vérifie toutes les  100ms que le div existe
}

/**
 * Affiche un objet pendant t0 secondes puis le cache pendant (t-t0) secondes avant de recommencer r fois ce cycle en tout
 * @param {ObjetMathalea2D} objet Objet MathALEA2d affiché puis masqué
 * @param {number} [t0=1] Temps en secondes avant l'apparition
 * @param {number} [t=5] Temps à partir duquel l'animation recommence
 * @param {string|number} [r='Infinity'] Nombre de répétitions (infini si ce n'est pas un nombre)
 * @example cacherTempo(figure1)
 * // Affiche figure1 pendant 1 seconde, puis le cache pendant 4 secondes et recommence ce cycle indéfiniment.
 * @example cacherTempo(figure1,2,8,3)
 * // Affiche figure1 pendant 2 secondes, puis le cache pendant 6 secondes et recommence ce cycle 3 fois en tout.
 * @author Éric Elter
 */
// JSDOC Validee par EE Juin 2022
export function cacherTempo(
  objet: ObjetMathalea2D,
  t0 = 1,
  t = 5,
  r: number | string = 'Infinity',
) {
  let compteur = 1 // Nombre d'animations
  const checkExist = setInterval(function () {
    if (document.getElementById(String(objet.id))) {
      clearInterval(checkExist)
      montrerParDiv(String(objet.id))
      if (Number(r) === 1) {
        // On le cache au bout de t0 et on ne le montre plus
        setTimeout(function () {
          cacherParDiv(String(objet.id))
        }, t0 * 1000)
      } else {
        const montreRepete = setInterval(function () {
          montrerParDiv(String(objet.id))
        }, t * 1000) // On cache tous les t s
        setTimeout(function () {
          cacherParDiv(String(objet.id)) // On attend t0 pour montrer
          const cacheRepete = setInterval(function () {
            cacherParDiv(String(objet.id))
            compteur++
            if (typeof r === 'number') {
              if (compteur >= r) {
                clearInterval(cacheRepete)
                clearInterval(montreRepete)
              }
            }
          }, t * 1000) // On montre tous les t s (vu qu'on a décalé de t0)
        }, t0 * 1000) // Fin de l'animation en boucle
      }
    }
  }, 100) // vérifie toutes les  100ms que le div existe
}

/**
 * Masque une suite d'objets puis les affiche un par un, de t secondes en t secondes avant de recommencer r fois, tApresDernier secondes après l'affichage de tous les objets
 * @param {ObjetMathalea2D[]} objets Liste d'objets MathALEA2d masqués puis affichés
 * @param {number} [t = 1] Temps en secondes entre l'apparition de chaque objet
 * @param {string} [r = 'Infinity'] Nombre de répétitions (infini si ce n'est pas un nombre).
 * @param {number} [tApresDernier = 5] Temps, après l'affichage du dernier objet, à partir duquel l'animation recommence.
 * @example afficherUnParUn([s1,s2])
 * // Affiche s1 au bout de 1 seconde, puis s2 après 1 nouvelle seconde, puis les masque après 5 secondes. Ce cycle est répété indéfiniment.
 * @example afficherUnParUn([s1,s2],2,9,10)
 * // Affiche s1 au bout de 2 secondes, puis s2 après 2 nouvelles secondes, puis les masque après 10 secondes. Ce cycle est répété en tout 9 fois.
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022
export function afficherUnParUn(
  objets: ObjetMathalea2D[],
  t = 1,
  r = 'Infinity',
  tApresDernier = 5,
) {
  let t0 = t
  const tf = objets.length * t + tApresDernier
  for (const objet of objets) {
    afficherTempo(objet, t0, tf, r)
    t0 += t
  }
}

/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%% LES TRANSFORMATIONS ANIMÉES %%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/

/**
 * Fait apparaître une liste d'objets de façon animée.
 * @param {ObjetMathalea2D[]} liste liste d'objets à faire apparaître
 * @param {number} [dur = 2] Durée de l'animation en secondes
 * @param {number} [pourcentage = 0.5] Pourcentage de la durée à partir de laquelle les objets sont visibles
 * @param {number|string} [repeat = 'indefinite'] Nombre de répétitions de l'animation, peut être un entier.
 * @author Rémi Angot
 */
// JSDOC Non Validee EE Juin 2022 (non testée)
export class ApparitionAnimee extends ObjetMathalea2D {
  liste: ObjetMathalea2D | ObjetMathalea2D[]
  dur: number
  pourcentage: number
  repeat: string

  constructor(
    liste: ObjetMathalea2D | ObjetMathalea2D[],
    dur = 2,
    pourcentage = 0.5,
    repeat = 'indefinite',
  ) {
    super()
    this.liste = liste
    this.dur = dur
    this.pourcentage = pourcentage
    this.repeat = repeat
  }

  svg(coeff: number) {
    let code = '<g> '
    if (Array.isArray(this.liste)) {
      for (const objet of this.liste) {
        code += '\n' + objet.svg(coeff)
      }
    } else {
      // si ce n'est pas une liste
      code += '\n' + this.liste.svg(coeff)
    }
    code += `<animate attributeType="CSS"
    attributeName="visibility"
    from="hidden"
    to="hidden"
    values="hidden;visible;hidden"
    keyTimes="0; ${this.pourcentage}; 1"
    dur="${this.dur}"
    repeatCount="${this.repeat}"/>`
    code += '</g>'
    return code
  }

  tikz() {
    return ''
  }
}
/**
 * Fait apparaître une liste d'objets de façon animée
 * @param {ObjetMathalea2D[]} liste liste d'objets à faire apparaître
 * @param {number} [dur = 2] Durée de l'animation en secondes
 * @param {number} [pourcentage = 0.5] Pourcentage de la durée à partir de laquelle les objets sont visibles
 * @param {number|string} [repeat = 'indefinite'] Nombre de répétitions de l'animation, peut être un entier
 * @return {ApparitionAnimee}
 * @example Fonction non utilisée donc pas d'exemple, fonction non testée, peut être bugguée
 * @author Rémi Angot
 */
// JSDOC Non Validee EE Juin 2022 (impossible à tester car non utilisée)
export function apparitionAnimee(
  liste: ObjetMathalea2D | ObjetMathalea2D[],
  dur = 2,
  pourcentage = 0.5,
  repeat = 'indefinite',
) {
  return new ApparitionAnimee(liste, dur, pourcentage, repeat)
}
/**
 * translationAnimee(s,v) //Animation de la translation de vecteur v pour s
 * translationAnimee([a,b,c],v) //Animation de la translation de vecteur v pour les objets a, b et v
 *
 * @author Rémi Angot
 */
export class TranslationAnimee extends ObjetMathalea2D {
  liste: ObjetMathalea2D | ObjetMathalea2D[]

  v: Vecteur
  animation: string
  constructor(
    liste: ObjetMathalea2D | ObjetMathalea2D[],
    v: Vecteur,
    animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
  ) {
    super()
    this.liste = Array.isArray(liste) ? liste : [liste]
    this.v = v
    this.animation = animation
    const liste2 = this.liste.map((el) => translation(el, v as IVecteur))
    const bordures = fixeBordures(
      this.liste.concat(liste2 as ObjetMathalea2D[]),
    )
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }

  svg(coeff: number) {
    let code = '<g> '
    if (Array.isArray(this.liste)) {
      for (const objet of this.liste) {
        code += '\n' + objet.svg(coeff)
      }
    } else {
      // si ce n'est pas une liste
      code += '\n' + this.liste.svg(coeff)
    }
    if (Array.isArray(this.v)) {
      code += '<animateMotion path="M 0 0 l'
      for (const vecteur of this.v) {
        code += ` ${vecteur.xSVG(coeff)} ${vecteur.ySVG(coeff)} `
      }
      code += `${this.animation} />`
    } else {
      code += `<animateMotion path="M 0 0 l ${this.v.xSVG(coeff)} ${this.v.ySVG(coeff)} " ${this.animation} />`
    }
    code += '</g>'
    return code
  }

  tikz() {
    return ''
  }
}
export function translationAnimee(
  liste: ObjetMathalea2D | ObjetMathalea2D[],
  v: Vecteur,
  animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
) {
  return new TranslationAnimee(liste, v, animation)
}

/**
 * rotationAnimee(s,O,a) //Animation de la rotation de centre O et d'angle a pour s
 * rotationAnimee([a,b,c],O,a) //Animation de la rotation de centre O et d'angle a pour les objets a, b et c
 *
 * @author Rémi Angot
 */
export class RotationAnimee extends ObjetMathalea2D {
  liste: (PointAbstrait | Droite | Segment | DemiDroite | Polygone)[]
  O: PointAbstrait | IPointAbstrait
  angle: number
  animation: string
  constructor(
    liste:
      | (PointAbstrait | Droite | Segment | DemiDroite | IPolygone)[]
      | Droite
      | Segment
      | DemiDroite
      | IPolygone
      | PointAbstrait,
    O: PointAbstrait | IPointAbstrait,
    angle: number,
    animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
  ) {
    super()
    this.liste = (Array.isArray(liste) ? liste : [liste]) as (
      | PointAbstrait
      | Droite
      | Segment
      | DemiDroite
      | Polygone
    )[]
    this.O = O
    this.angle = angle
    this.animation = animation
    const liste2 = this.liste.map(
      (el) =>
        rotation(el as any, O, angle) as
          | PointAbstrait
          | Droite
          | Segment
          | DemiDroite
          | Polygone,
    )
    const bordures = fixeBordures([...this.liste.concat(liste2)])
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }

  svg(coeff: number) {
    let code = '<g> '
    for (const objet of this.liste) {
      code += '\n' + objet.svg(coeff)
    }
    if (this.O.xSVG != null && this.O.ySVG != null) {
      code += `<animateTransform
  attributeName="transform"
  type="rotate"
  from="0 ${this.O.xSVG(coeff)} ${this.O.ySVG(coeff)}"
  to="${-this.angle} ${this.O.xSVG(coeff)} ${this.O.ySVG(coeff)}"
  ${this.animation}
  />`
    }

    code += '</g>'
    return code
  }

  tikz() {
    return ''
  }
}
export function rotationAnimee(
  liste:
    | (PointAbstrait | Droite | Segment | DemiDroite | IPolygone)[]
    | Droite
    | Segment
    | DemiDroite
    | IPolygone
    | PointAbstrait,
  O: IPointAbstrait | PointAbstrait,
  angle: number,
  animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
) {
  return new RotationAnimee(liste, O, angle, animation)
}
/**
 * homothetieAnimee(s,O,k) //Animation de la homothetie de centre O et de rapport k pour s
 * homothetieAnimee([a,b,c],O,k) //Animation de la homothetie de centre O et de rapport k pour les objets a, b et v
 *
 * @author Rémi Angot
 */
export class HomothetieAnimee extends ObjetMathalea2D {
  p: Polygone
  O: PointAbstrait
  k: number
  animation: string
  constructor(
    p: Polygone,
    O: PointAbstrait,
    k: number,
    animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
  ) {
    super()
    this.p = p
    this.O = O
    this.k = k
    this.animation = animation
    const bordures =
      this.k > 1
        ? fixeBordures([this.O, homothetie(this.p, this.O, this.k)])
        : fixeBordures([this.O, this.p])
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
    if (this.k > 1) {
      this.bordures = homothetie(this.p, this.O, this.k).bordures
    }
    this.bordures = homothetie(this.p, this.O, this.k).bordures
  }

  svg(coeff: number) {
    const binomesXY1 = this.p.binomesXY(coeff)
    const p2 = homothetie(this.p, this.O, this.k)
    const binomesXY2 = p2.binomesXY(coeff)
    const code = `<polygon stroke="${this.p.color[0]}" stroke-width="${this.p.epaisseur}" fill="${this.p.couleurDeRemplissage[0]}" >
  <animate attributeName="points" ${this.animation}
  from="${binomesXY1}"
  to="${binomesXY2}"
  />
  </polygon>`
    return code
  }

  tikz() {
    return ''
  }
}
export function homothetieAnimee(
  p: Polygone,
  O: PointAbstrait,
  k: number,
  animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
) {
  return new HomothetieAnimee(p, O, k, animation)
}

/**
 * symetrieAnimee(s,d) //Animation de la symetrie d'axe (d) pour s
 * symetrieAnimee([a,b,c],d) //Animation de la symetrie d'axe (d) pour les objets a, b et v
 *
 * @author Rémi Angot
 */
export class SymetrieAnimee extends ObjetMathalea2D {
  p: IPolygone
  d: IDroite
  animation: string
  constructor(
    p: IPolygone,
    d: IDroite,
    animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
  ) {
    super()
    this.p = p
    this.d = d
    this.animation = animation
    const bordures = fixeBordures([p, symetrieAxiale(p as any, d as Droite)])
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }

  svg(coeff: number) {
    const binomesXY1 = this.p.binomesXY(coeff)
    const p2 = symetrieAxiale(this.p, this.d as IDroite)
    const binomesXY2 = p2.binomesXY(coeff)
    const code = `<polygon stroke="${this.p.color[0]}" stroke-width="${this.p.epaisseur}" fill="${this.p.couleurDeRemplissage[0]}" >
    <animate attributeName="points" ${this.animation}
    from="${binomesXY1}"
    to="${binomesXY2}"
    />
    </polygon>`
    return code
  }

  tikz() {
    return ''
  }
}
export function symetrieAnimee(
  p: IPolygone,
  d: IDroite,
  animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
) {
  return new SymetrieAnimee(p, d, animation)
}

export class AffiniteOrthoAnimee extends ObjetMathalea2D {
  p: IPolygone
  d: IDroite
  k: number
  animation: string
  constructor(
    p: IPolygone,
    d: IDroite,
    k: number,
    animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
  ) {
    super()
    this.p = p
    this.d = d
    this.k = k
    this.animation = animation
    const bordures = fixeBordures([p, affiniteOrtho(p, d, k)])
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }

  svg(coeff: number) {
    const binomesXY1 = this.p.binomesXY(coeff)
    const p2 = affiniteOrtho(this.p, this.d, this.k)
    const binomesXY2 = p2.binomesXY(coeff)
    const code = `<polygon stroke="${this.p.color[0]}" stroke-width="${this.p.epaisseur}" fill="${this.p.couleurDeRemplissage[0]}" >
    <animate attributeName="points" ${this.animation}
    from="${binomesXY1}"
    to="${binomesXY2}"
    />
    </polygon>`
    return code
  }

  tikz() {
    return ''
  }
}
export function affiniteOrthoAnimee(
  p: IPolygone,
  d: IDroite,
  k: number,
  animation = 'begin="0s" dur="2s" repeatCount="indefinite"',
) {
  return new AffiniteOrthoAnimee(p, d, k, animation)
}

export class TranslationPuisRotationAnimee extends ObjetMathalea2D {
  figure1: ObjetMathalea2D | ObjetMathalea2D[]
  v: IVecteur
  figure2: ObjetMathalea2D | ObjetMathalea2D[]
  O: PointAbstrait
  angle: number
  t1: number
  t2: number
  numId: string
  constructor(
    numId: string,
    figure1: ObjetMathalea2D | ObjetMathalea2D[],
    v: Vecteur,
    figure2: ObjetMathalea2D | ObjetMathalea2D[],
    O: PointAbstrait,
    angle: number,
    t1 = 5,
    t2 = 2,
  ) {
    super()
    this.figure1 = figure1
    this.v = v
    this.figure2 = figure2
    this.O = O
    this.angle = angle
    this.t1 = t1
    this.t2 = t2
    this.numId = numId
  }

  svg(coeff: number): string {
    if (Array.isArray(this.figure2)) {
      this.figure2.forEach((fig) => {
        afficherTempo(fig, this.t1, this.t1 + this.t2, 1)
      })
    } else {
      afficherTempo(this.figure2, this.t1, this.t1 + this.t2, 1)
    }
    let code = '<g> '
    // Translation de figure1 de vecteur v
    if (Array.isArray(this.figure1)) {
      // Si la figure1 est constituée d'une liste d'éléments
      for (const objet of this.figure1) {
        code += '\n' + objet.svg(coeff)
      }
    } else {
      // Si la figure1 n'est constituée que d'un élément
      code += '\n' + this.figure1.svg(coeff)
    }
    code += `<animateTransform
    attributeName="transform"
    attributeType="XML"
    type="translate"
    from="0 0"
    to="${arrondi(this.v.xSVG(coeff), 0)} ${arrondi(this.v.ySVG(coeff), 0)}"
    begin="0s" dur="${this.t1}s" fill="freeze"  repeatCount="1" id="translat${this.numId}"
    /></path></g>`
    if (Array.isArray(this.figure1)) {
      this.figure1.forEach((fig) => {
        cacherTempo(fig, this.t1, 0, 1)
      })
    } else {
      cacherTempo(this.figure1, this.t1, 0, 1)
    }

    // Rotation de figure2 de centre O et de angle angle
    code += '<g>'
    if (Array.isArray(this.figure2)) {
      // Si la figure2 est constituée d'une liste d'éléments
      for (const objet of this.figure2) {
        code += '\n' + objet.svg(coeff)
      }
    } else {
      // Si la figure2 n'est constituée que d'un élément
      code += '\n' + this.figure2.svg(coeff)
    }
    code += `<animateTransform
  attributeName="transform"
  type="rotate"
  from="0 ${this.O.xSVG(coeff)} ${this.O.ySVG(coeff)}"
  to="${-this.angle} ${this.O.xSVG(coeff)} ${this.O.ySVG(coeff)}"
  begin="translat${this.numId}.end" dur="${this.t2}s" fill="freeze" repeatCount="1" id="rotat-${this.numId}"
  /></path>`

    code += '</g>'
    return code
  }
}
export function translationPuisRotationAnimees(
  numId: string,
  figure1: ObjetMathalea2D | ObjetMathalea2D[],
  v: Vecteur,
  figure2: ObjetMathalea2D | ObjetMathalea2D[],
  O: PointAbstrait,
  angle: number,
  t1 = 5,
  t2 = 2,
) {
  return new TranslationPuisRotationAnimee(
    numId,
    figure1,
    v,
    figure2,
    O,
    angle,
    t1,
    t2,
  )
}
