import { context } from '../../modules/context'
import type { Point3d } from '../3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { cercle } from './cercle'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { plot } from './Plot'
import type { PointAbstrait } from './PointAbstrait'
import { pointAbstrait } from './PointAbstrait'
import { Polygone } from './polygones'
import { carre } from './polygonesParticuliers'
import { segment } from './segmentsVecteurs'

/**
 * tracePoint(A) // Place une croix à l'emplacement du point A
 * tracePoint(A,B,C,D) // Place une croix pour les différents points
 * tracePoint(A,B,C,D,bleuMathalea) // Place une croix pour les différents points
 * Après coup, on peut notamment changer l'épaissseur, le style et l'opacité du point par :
 * pt = tracePoint(A)
 * pt.epaisseur = 5 (par défaut : 1)
 * pt.opacite = 0.2 (par défaut : 0.8 = 80%)
 * pt.style = '#' (choix parmi 'x','o','#','|','+','.' et par défaut : 'x')
 * @property {string} color
 * @author Rémi Angot et Jean-claude Lhote
 */

export class TracePoint extends ObjetMathalea2D {
  taille: number
  tailleTikz: number
  points: (PointAbstrait | Point3d)[]
  couleurDeRemplissage?: string[]
  usePgfplots: boolean
  pgfplotsOptions?: string
  pgfplotsMark?: string
  constructor(...points: (PointAbstrait | PointAbstrait | Point3d | string)[]) {
    super()
    this.taille = 3
    this.tailleTikz = this.taille / 15
    this.epaisseur = 1
    this.opacite = 0.8
    this.style = 'x'
    this.usePgfplots = false
    let xmin = 1000
    let xmax = -1000
    let ymin = 1000
    let ymax = -1000
    let lePoint
    if (typeof points[points.length - 1] === 'string') {
      this.color = colorToLatexOrHTML(String(points[points.length - 1]))
      points.pop()
    } else this.color = colorToLatexOrHTML('black')
    this.points = points as (PointAbstrait | Point3d)[]
    for (const unPoint of this.points) {
      const point = unPoint as PointAbstrait | Point3d
      if (point.typeObjet !== 'point3d' && point.typeObjet !== 'point')
        window.notify('TracePoint : argument invalide', { ...points })
      lePoint = point.typeObjet === 'point' ? point : (point as Point3d).c2d
      xmin = Math.min(xmin, lePoint.x - this.taille / context.pixelsParCm)
      xmax = Math.max(xmax, lePoint.x + this.taille / context.pixelsParCm)
      ymin = Math.min(ymin, lePoint.y - this.taille / context.pixelsParCm)
      ymax = Math.max(ymax, lePoint.y + this.taille / context.pixelsParCm)
    }
    this.bordures = [xmin, ymin, xmax, ymax]
  }

  svg(coeff: number) {
    const objetssvg = []
    let s1
    let s2
    let p1
    let p2
    let c, A
    for (const unPoint of this.points) {
      if (unPoint.typeObjet === 'point3d') {
        A = (unPoint as Point3d).c2d
      } else {
        A = unPoint
      }
      if (this.style === 'x') {
        s1 = segment(
          pointAbstrait(A.x - this.taille / coeff, A.y + this.taille / coeff),
          pointAbstrait(A.x + this.taille / coeff, A.y - this.taille / coeff),
          this.color[0],
        )
        s2 = segment(
          pointAbstrait(A.x - this.taille / coeff, A.y - this.taille / coeff),
          pointAbstrait(A.x + this.taille / coeff, A.y + this.taille / coeff),
          this.color[0],
        )
        s1.epaisseur = this.epaisseur
        s2.epaisseur = this.epaisseur
        s1.opacite = this.opacite
        s2.opacite = this.opacite
        objetssvg.push(s1, s2)
      } else if (this.style === 'o') {
        p1 = pointAbstrait(A.x, A.y)
        c = cercle(p1, this.taille / coeff, this.color[0])
        c.epaisseur = this.epaisseur
        c.opacite = this.opacite
        c.couleurDeRemplissage = this.color
        c.opaciteDeRemplissage = this.opacite / 2
        objetssvg.push(c)
      } else if (this.style === '#') {
        p1 = pointAbstrait(A.x - this.taille / coeff, A.y - this.taille / coeff)
        p2 = pointAbstrait(A.x + this.taille / coeff, A.y - this.taille / coeff)
        c = carre(p1, p2, this.color[0]) as unknown as Polygone
        c.epaisseur = this.epaisseur
        c.opacite = this.opacite
        c.couleurDeRemplissage = [
          this.color[0] ?? 'black',
          this.color[1] ?? 'black',
        ]
        c.opaciteDeRemplissage = this.opacite / 2
        objetssvg.push(c)
      } else if (this.style === '+') {
        s1 = segment(
          pointAbstrait(A.x, A.y + this.taille / coeff),
          pointAbstrait(A.x, A.y - this.taille / coeff),
          this.color[0],
        )
        s2 = segment(
          pointAbstrait(A.x - this.taille / coeff, A.y),
          pointAbstrait(A.x + this.taille / coeff, A.y),
          this.color[0],
        )
        s1.epaisseur = this.epaisseur
        s2.epaisseur = this.epaisseur
        s1.opacite = this.opacite
        s2.opacite = this.opacite
        objetssvg.push(s1, s2)
      } else if (this.style === '|') {
        s1 = segment(
          pointAbstrait(A.x, A.y + this.taille / coeff),
          pointAbstrait(A.x, A.y - this.taille / coeff),
          this.color[0],
        )
        s1.epaisseur = this.epaisseur
        s1.opacite = this.opacite
        objetssvg.push(s1)
      } else if (this.style === '.') {
        s1 = plot(A.x, A.y, {
          couleur: this.color[0],
          rayon: this.epaisseur * 0.05,
          couleurDeRemplissage: this.color[0],
        })
        objetssvg.push(s1)
      }
    }
    let code = ''
    for (const objet of objetssvg) {
      code += '\n\t' + objet.svg(coeff)
    }
    code = `<g id="${this.id}">` + code + '</g>'
    return code
  }

  tikz() {
    if (this.usePgfplots) {
      const coords: PointAbstrait[] = []
      for (const unPoint of this.points) {
        if (unPoint.typeObjet === 'point3d') {
          coords.push((unPoint as Point3d).c2d)
        } else {
          coords.push(unPoint as PointAbstrait)
        }
      }
      if (coords.length === 0) return ''
      const colorLatex = this.color[1].replace(/[{}]/g, '') || 'black'
      const styleToMark: Record<string, { mark: string; filled?: boolean }> = {
        x: { mark: 'x' },
        '+': { mark: '+' },
        '|': { mark: '|' },
        '#': { mark: 'square*', filled: true },
        o: { mark: '*', filled: true },
        '.': { mark: '*', filled: true },
      }
      const descriptor = styleToMark[this.style] ?? styleToMark.x
      const mark = this.pgfplotsMark ?? descriptor.mark
      const options = ['only marks']
      options.push(`color=${colorLatex}`)
      options.push(`mark=${mark}`)
      const markSize =
        (this.tailleTikz ?? this.taille / 15) *
        10 *
        (this.style === '.' ? 0.7 : 1)
      options.push(`mark size=${Number(Math.max(0.6, markSize).toFixed(3))}pt`)
      if (this.opacite !== 1) {
        options.push(`opacity=${this.opacite}`)
      }
      const markOptions: string[] = []
      if (descriptor.filled) {
        markOptions.push(`fill=${colorLatex}`)
      }
      markOptions.push(`draw=${colorLatex}`)
      if (markOptions.length > 0) {
        options.push(`mark options={${markOptions.join(',')}}`)
      }
      if (this.pgfplotsOptions && this.pgfplotsOptions.trim() !== '') {
        options.push(this.pgfplotsOptions)
      }
      const formatCoord = (val: number) =>
        Number.isFinite(val) ? Number(val.toFixed(4)).toString() : '0'
      const coordsTex = coords
        .map((pt) => `(${formatCoord(pt.x)},${formatCoord(pt.y)})`)
        .join(' ')
      return `\\addplot [${options.join(',')}] coordinates { ${coordsTex} };\n`
    }
    const objetstikz = []
    let s1
    let s2
    let p1
    let p2
    let c, A
    for (const unPoint of this.points) {
      if (unPoint.typeObjet === 'point3d') {
        A = (unPoint as Point3d).c2d
      } else {
        A = unPoint
      }
      if (this.style === 'x') {
        this.tailleTikz = this.taille / 16 // EE : Sinon, on ne voit pas la croix.
        s1 = segment(
          pointAbstrait(A.x - this.tailleTikz, A.y + this.tailleTikz),
          pointAbstrait(A.x + this.tailleTikz, A.y - this.tailleTikz),
          this.color[1],
        )
        s2 = segment(
          pointAbstrait(A.x - this.tailleTikz, A.y - this.tailleTikz),
          pointAbstrait(A.x + this.tailleTikz, A.y + this.tailleTikz),
          this.color[1],
        )
        s1.epaisseur = this.epaisseur / 1.6
        s2.epaisseur = this.epaisseur / 1.6
        s1.opacite = this.opacite
        s2.opacite = this.opacite
        objetstikz.push(s1, s2)
      } else if (this.style === 'o') {
        p1 = pointAbstrait(A.x, A.y)
        c = cercle(p1, this.tailleTikz, this.color[1])
        c.epaisseur = this.epaisseur
        c.opacite = this.opacite
        c.couleurDeRemplissage = this.color
        c.opaciteDeRemplissage = this.opacite / 2
        objetstikz.push(c)
      } else if (this.style === '#') {
        p1 = pointAbstrait(A.x - this.tailleTikz, A.y - this.tailleTikz)
        p2 = pointAbstrait(A.x + this.tailleTikz, A.y - this.tailleTikz)
        c = carre(p2, p1, this.color[1]) as unknown as Polygone
        c.epaisseur = this.epaisseur
        c.opacite = this.opacite
        c.couleurDeRemplissage = [
          this.color[0] ?? 'black',
          this.color[1] ?? 'black',
        ]
        c.opaciteDeRemplissage = this.opacite / 2
        objetstikz.push(c)
      } else if (this.style === '+') {
        s1 = segment(
          pointAbstrait(A.x, A.y + this.tailleTikz),
          pointAbstrait(A.x, A.y - this.tailleTikz),
          this.color[1],
        )
        s2 = segment(
          pointAbstrait(A.x - this.tailleTikz, A.y),
          pointAbstrait(A.x + this.tailleTikz, A.y),
          this.color[1],
        )
        s1.epaisseur = this.epaisseur
        s2.epaisseur = this.epaisseur
        s1.opacite = this.opacite
        s2.opacite = this.opacite
        objetstikz.push(s1, s2)
      } else if (this.style === '|') {
        s1 = segment(
          pointAbstrait(A.x, A.y + this.tailleTikz),
          pointAbstrait(A.x, A.y - this.tailleTikz),
          this.color[1],
        )
        s1.epaisseur = this.epaisseur
        s1.opacite = this.opacite
        objetstikz.push(s1)
      } else if (this.style === '.') {
        s1 = plot(A.x, A.y, {
          couleur: this.color[0],
          rayon: this.epaisseur * 0.05,
          couleurDeRemplissage: this.color[1], // je mets la couleur html, car elle va être parsée par colorToLatexOrHtml à nouveau
        })
        objetstikz.push(s1)
      }
    }
    let code = ''
    for (const objet of objetstikz) {
      code += objet.tikz()
    }
    return code
  }
}

/**
 * @param  {(PointAbstrait |PointCliquable| string)[]} args Points précédemment créés. Si le dernier argument est une chaîne de caractère, définit la couleur des points tracés.
 * @return  {TracePoint}
 * @example tracePoint(A,B,C,'red) // Trace les points A,B,C précédemment créés en rouge
 * @example tracePoint(A).style = '|' // Le style du point A sera '|' et non 'x' par défaut.
 * @example tracePoint(A).epaisseur = 5 // L'épaisseur du style du point sera 5 et non 1 par défaut.
 * @example tracePoint(A).opacite = 0.4 // L'opacité du style du point sera 40% et non 80%(0.8) par défaut.
 */

export function tracePoint(
  ...args: (PointAbstrait | PointAbstrait | Point3d | string)[]
) {
  return new TracePoint(...args)
}
