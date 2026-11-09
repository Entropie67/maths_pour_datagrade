import { arrondi } from '../outils/nombres'
import { afficheCoteSegment } from './AfficheCoteSegment'
import { arc } from './Arc'
import { cercle, Cercle } from './cercle'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pattern } from './pattern'
import { PointAbstrait, pointAbstrait } from './PointAbstrait'
import { polygone } from './polygones'
import { segment } from './segmentsVecteurs'
import { homothetie, rotation, translation } from './transformations'
import { longueur } from './utilitairesGeometriques'
import { pointAdistance } from './utilitairesPoint'
import { vecteur } from './Vecteur'

/**
 *
 * @param {int} Longueur
 * @param {int} largeur
 * @param {int} profondeur
 *
 */
export class Pave extends ObjetMathalea2D {
  constructor(
    L = 10,
    l = 5,
    h = 5,
    origine = pointAbstrait(0, 0),
    cote = true,
    angleDeFuite = 30,
    coefficientDeFuite = 0.5,
  ) {
    super()
    this.objets = []
    const A = origine
    const B = pointAbstrait(A.x + L, A.y)
    const C = pointAbstrait(B.x, B.y + l)
    const D = pointAbstrait(A.x, A.y + l)
    const p = polygone(A, B, C, D)
    const E = pointAdistance(A, h * coefficientDeFuite, angleDeFuite)
    const F = translation(B, vecteur(A, E))
    const G = translation(C, vecteur(A, E))
    const H = translation(D, vecteur(A, E))
    const sAE = segment(A, E)
    const sBF = segment(B, F)
    const sCG = segment(C, G)
    const sDH = segment(D, H)
    const sEF = segment(E, F)
    const sFG = segment(F, G)
    const sGH = segment(G, H)
    const sHE = segment(H, E)
    sAE.pointilles = 5
    sEF.pointilles = 5
    sHE.pointilles = 5

    this.objets.push(p, sAE, sBF, sCG, sDH, sEF, sFG, sGH, sHE)
    if (cote) {
      this.objets.push(afficheCoteSegment(segment(B, A), L + ' cm', 1))
      this.objets.push(afficheCoteSegment(segment(A, D), l + ' cm', 1))
      this.objets.push(afficheCoteSegment(segment(F, B), h + ' cm', 1))
    }
    const { xmin, xmax, ymin, ymax } = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [xmin, ymin, xmax, ymax]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      objet.color = this.color
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}`
    }
    return code
  }
}

export function pave(
  L = 10,
  l = 5,
  h = 5,
  origine = pointAbstrait(0, 0),
  cote = true,
  angleDeFuite = 30,
  coefficientDeFuite = 0.5,
) {
  return new Pave(L, l, h, origine, cote, angleDeFuite, coefficientDeFuite)
}

/**  Trace l'ellipse de centre O et de rayon rx et ry (la construction, dite “par réduction d’ordonnée”, montre que l'ellipse est la transformée de Newton de 2 cercles concentriques)
 * @param {PointAbstrait} O Centre de l'ellipse
 * @param {number} rx Premier rayon de l'ellipse
 * @param {number} ry Second rayon de l'ellipse
 * @param {string} [color = 'black'] Couleur de l'ellipse : du type 'red', bleuMathalea ou du type '#a12345'
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {PointAbstrait} centre Centre du cercle
 * @property {number} rx Premier rayon de l'ellipse
 * @property {number} ry Second rayon de l'ellipse
 * @property {string} color Couleur de l'ellipse. À associer obligatoirement à colorToLatexOrHTML().
 * @property {string} couleurDeRemplissage Couleur de remplissage. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opaciteDeRemplissage Opacité de l'ellipse si couleur de remplissage choisie.
 * @property {number[]} bordures Coordonnées de la fenêtre d'affichage du genre [-2,-2,5,5]
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Aout 2022
export class Ellipse extends ObjetMathalea2D {
  centre: PointAbstrait
  rx: number
  ry: number
  couleurDeRemplissage: string[]
  opaciteDeRemplissage: number
  constructor(O: PointAbstrait, rx: number, ry: number, color = 'black') {
    super()
    this.color = colorToLatexOrHTML(color)
    this.centre = O
    this.rx = rx
    this.ry = ry
    this.couleurDeRemplissage = colorToLatexOrHTML('none')
    this.opaciteDeRemplissage = 1
    this.bordures = [O.x - rx, O.y - ry, O.x + rx, O.y + ry]
  }

  svg(coeff: number) {
    if (this.epaisseur !== 1) {
      this.style += ` stroke-width="${this.epaisseur}" `
    }
    switch (this.pointilles) {
      case 1:
        this.style += ' stroke-dasharray="6 10" '
        break
      case 2:
        this.style += ' stroke-dasharray="6 3" '
        break
      case 3:
        this.style += ' stroke-dasharray="3 2 6 2 " '
        break
      case 4:
        this.style += ' stroke-dasharray="1 2" '
        break
      case 5:
        this.style += ' stroke-dasharray="5 5" '
        break
    }

    if (this.opacite !== 1) {
      this.style += ` stroke-opacity="${this.opacite}" `
    }
    if (
      this.couleurDeRemplissage[0] === '' ||
      this.couleurDeRemplissage[0] === 'none'
    ) {
      this.style += ' fill="none" '
    } else {
      this.style += ` fill="${this.couleurDeRemplissage[0]}" `
      this.style += ` fill-opacity="${this.opaciteDeRemplissage}" `
    }

    return `<ellipse cx="${this.centre.xSVG(coeff)}" cy="${this.centre.ySVG(coeff)}" rx="${this.rx * coeff}" ry="${this.ry * coeff}" stroke="${this.color[0]}" ${this.style} id="${this.id}" />`
  }

  tikz() {
    let optionsDraw = ''
    const tableauOptions = []
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color=${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width = ${this.epaisseur}`)
    }
    switch (this.pointilles) {
      case 1:
        tableauOptions.push(' dash dot ')
        break
      case 2:
        tableauOptions.push(' densely dash dot dot ')
        break
      case 3:
        tableauOptions.push(' dash dot dot ')
        break
      case 4:
        tableauOptions.push(' dotted ')
        break
      case 5:
        tableauOptions.push(' dashed ')
        break
    }

    if (this.opacite !== 1) {
      tableauOptions.push(`opacity = ${this.opacite}`)
    }
    if (this.opaciteDeRemplissage !== 1) {
      tableauOptions.push(`fill opacity = ${this.opaciteDeRemplissage}`)
    }
    if (
      this.couleurDeRemplissage[1] !== '' &&
      this.couleurDeRemplissage[1] !== 'none' &&
      this.couleurDeRemplissage[1] !== ''
    ) {
      tableauOptions.push(
        `preaction={fill,color = ${this.couleurDeRemplissage[1]}}`,
      )
    }
    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }
    return `\\draw${optionsDraw} (${this.centre.x},${this.centre.y}) ellipse (${this.rx}cm and ${this.ry}cm);`
  }

  svgml(coeff: number, amp: number) {
    if (this.epaisseur !== 1) {
      this.style += ` stroke-width="${this.epaisseur}" `
    }

    if (this.opacite !== 1) {
      this.style += ` stroke-opacity="${this.opacite}" `
    }

    let code = `<path d="M ${this.centre.xSVG(coeff) + this.rx * coeff} ${this.centre.ySVG(coeff)} C ${this.centre.xSVG(coeff) + this.rx * coeff} ${this.centre.ySVG(coeff)}, `
    let compteur = 1
    for (let k = 1, variation; k < 181; k++) {
      variation = ((Math.random() * 2 - 1) * amp) / 10
      code += `${this.centre.xSVG(coeff) + arrondi((this.rx + variation) * Math.cos((2 * k * Math.PI) / 180) * coeff, 2)} ${this.centre.ySVG(coeff) + arrondi((this.ry + variation) * Math.sin((2 * k * Math.PI) / 180) * coeff, 2)}, `
      compteur++
    }
    if (compteur % 2 === 0)
      code += ` ${this.centre.xSVG(coeff) + this.rx * coeff} ${this.centre.ySVG(coeff)}, `
    code += ` ${this.centre.xSVG(coeff) + this.rx * coeff} ${this.centre.ySVG(coeff)} Z" stroke="${this.color[0]}" ${this.style}"/>`
    return code
  }

  tikzml(amp: number) {
    let optionsDraw = ''
    const tableauOptions = []
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color=${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width = ${this.epaisseur}`)
    }

    if (this.opacite !== 1) {
      tableauOptions.push(`opacity = ${this.opacite}`)
    }
    tableauOptions.push(
      `decorate,decoration={random steps, amplitude = ${amp}pt}`,
    )
    optionsDraw = '[' + tableauOptions.join(',') + ']'

    const code = `\\draw${optionsDraw} (${this.centre.x},${this.centre.y}) ellipse (${this.rx}cm and ${this.ry}cm);`
    return code
  }
}

/**  Trace l'ellipse de centre O et de rayon rx et ry (la construction, dite “par réduction d’ordonnée”, montre que l'ellipse est la transformée de Newton de 2 cercles concentriques)
 * @param {PointAbstrait} O Centre de l'ellipse
 * @param {number} rx Premier rayon de l'ellipse
 * @param {number} ry Second rayon de l'ellipse
 * @param {string} [color = 'black'] Couleur de l'ellipse : du type 'red', bleuMathalea ou du type '#a12345'
 * @example ellipse(M, 1, 3) // Trace, en noir, l'ellipse de centre M et de rayons 1 et 3
 * @example M, 1, 3, 'red') // Trace, en rouge, l'ellipse de centre M et de rayons 1 et 3
 * @author Rémi Angot
 * @return {Ellipse}
 */
// JSDOC Validee par EE Aout 2022
export function ellipse(
  O: PointAbstrait,
  rx: number,
  ry: number,
  color = 'black',
) {
  return new Ellipse(O, rx, ry, color)
}

/**
 * @param {PointAbstrait} centre centre de l'ellipse
 * @param {number} Rx rayon en X
 * @param {number} Ry rayon en Y
 * @param {string} hemisphere 'nord' pour tracer au-dessus du centre, 'sud' pour tracer en dessous
 * @param {boolean | number} pointilles Si false, l'ar est en trait plein, sinon en pointillés
 * @param {boolean} rayon Si true, alors l'arc est fermé par un segment.
 * @param {string} color Facultatif, 'black' par défaut
 * @param {string} couleurDeRemplissage si 'none' alors pas de remplissage.
 * @param {number} opaciteDeRemplissage Transparence de remplissage de 0 à 1. Facultatif, 0.2 par défaut
 * @author Jean-claude Lhote
 * @return {SemiEllipse} Objet SemiEllipse
 */
export class SemiEllipse extends ObjetMathalea2D {
  centre: PointAbstrait
  rx: number
  ry: number
  rayon: boolean
  hachures: string | boolean
  couleurDeRemplissage: string[]
  opaciteDeRemplissage: number
  couleurDesHachures: string[]
  epaisseurDesHachures: number
  distanceDesHachures: number
  M: PointAbstrait
  N: PointAbstrait
  angle: number
  large: number
  sweep: number
  constructor({
    centre,
    rx,
    ry,
    hemisphere = 'nord',
    pointilles = 0,
    rayon = false,
    couleurDeRemplissage = 'none',
    color = 'black',
    opaciteDeRemplissage = 0.2,
    hachures = false,
    anglesAxe = 0,
  }: {
    centre: PointAbstrait
    rx: number
    ry: number
    hemisphere?: string
    pointilles?: number
    rayon?: boolean
    couleurDeRemplissage?: string
    color?: string
    opaciteDeRemplissage?: number
    hachures?: string | boolean
    anglesAxe?: number
  }) {
    super()
    this.centre = centre
    this.rx = rx
    this.ry = ry
    this.rayon = rayon
    this.color = colorToLatexOrHTML(color)
    this.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
    this.opaciteDeRemplissage = opaciteDeRemplissage
    this.hachures = hachures
    this.couleurDesHachures = colorToLatexOrHTML('black')
    this.epaisseurDesHachures = 1
    this.distanceDesHachures = 10
    this.pointilles = pointilles
    this.anglesAxe = anglesAxe
    this.angle = hemisphere === 'nord' ? 180 : -180
    this.M = pointAbstrait(centre.x + rx, centre.y)
    const med = homothetie(
      rotation(this.M, centre, this.angle / 2),
      centre,
      ry / rx,
    )

    this.large = 0
    this.sweep = 0
    if (this.angle > 180) {
      this.sweep = 0 // option pour path : permet de savoir quel morceau de cercle tracé parmi les 2 possibles. Voir https://developer.mozilla.org/fr/docs/Web/SVG/Tutorial/Paths pour plus de détails
      this.large = 1 // option pour path : permet de savoir sur un morceau de cercle choisi, quel parcours prendre.
    } else if (this.angle < -180) {
      this.large = 1
      this.sweep = 1
    } else {
      this.large = 0
      this.sweep = 1 - (this.angle > 0 ? 1 : 0)
    }
    this.N = rotation(this.M, centre, this.angle)
    // reglage des bordures intégrant les rotation
    const [bxmin, bymin, bxmax, bymax] = [
      Math.min(this.M.x, this.N.x, med.x) - 0.1,
      Math.min(this.M.y, this.N.y, med.y) - 0.1,
      Math.max(this.M.x, this.N.x, med.x) + 0.1,
      Math.max(this.M.y, this.N.y, med.y) + 0.1,
    ]
    let bA = pointAbstrait(bxmin, bymin) // (xmin, yMin)
    let bB = pointAbstrait(bxmax, bymin) // (xmax, yMin)
    let bC = pointAbstrait(bxmax, bymax) // (xmax, yMax)
    let bD = pointAbstrait(bxmin, bymax) // (xmiSn, yMax)
    const bCentre = pointAbstrait((bA.x + bB.x) / 2, (bA.y + bB.y) / 2)
    bA = rotation(bA, bCentre, this.anglesAxe)
    bB = rotation(bB, bCentre, this.anglesAxe)
    bC = rotation(bC, bCentre, this.anglesAxe)
    bD = rotation(bD, bCentre, this.anglesAxe)
    this.bordures = [
      Math.min(bA.x, bB.x, bC.x, bD.x),
      Math.min(bA.y, bB.y, bC.y, bD.y),
      Math.max(bA.x, bB.x, bC.x, bD.x),
      Math.max(bA.y, bB.y, bC.y, bD.y),
    ]
  }

  svg(coeff: number) {
    if (this.rayon) {
      this.style = ''
      if (this.epaisseur !== 1) {
        this.style += ` stroke-width="${this.epaisseur}" `
      }

      switch (this.pointilles) {
        case 1:
          this.style += ' stroke-dasharray="6 10" '
          break
        case 2:
          this.style += ' stroke-dasharray="6 3" '
          break
        case 3:
          this.style += ' stroke-dasharray="3 2 6 2 " '
          break
        case 4:
          this.style += ' stroke-dasharray="1 2" '
          break
        case 5:
          this.style += ' stroke-dasharray="5 5" '
          break
      }

      if (this.hachures) {
        if (this.couleurDeRemplissage.length < 1) {
          this.couleurDeRemplissage = colorToLatexOrHTML('none')
        }

        return (
          pattern({
            motif: String(this.hachures),
            id: typeof this.id === 'string' ? this.id : undefined,
            distanceDesHachures: this.distanceDesHachures,
            epaisseurDesHachures: this.epaisseurDesHachures,
            couleurDesHachures: this.couleurDesHachures[0],
            couleurDeRemplissage: this.couleurDeRemplissage[0],
            opaciteDeRemplissage: this.opaciteDeRemplissage,
          }) +
          `<g transform="rotate(${-this.anglesAxe}, ${this.centre.xSVG(coeff)}, ${this.centre.xSVG(coeff)})"><path d="M${this.M.xSVG(coeff)} ${this.M.ySVG(coeff)} A ${this.rx * coeff} ${this.ry * coeff} 0 ${this.large} ${this.sweep} ${this.N.xSVG(coeff)} ${this.N.ySVG(coeff)} L ${this.centre.xSVG(coeff)} ${this.centre.ySVG(coeff)} Z" stroke="${this.color[0]}"  ${this.style} id="${this.id}" fill="url(#pattern${this.id})" />`
        )
      } else {
        if (this.opacite !== 1) {
          this.style += ` stroke-opacity="${this.opacite}" `
        }
        if (
          this.couleurDeRemplissage[0] !== 'none' &&
          this.couleurDeRemplissage[0] !== ''
        ) {
          this.style += ` fill-opacity="${this.opaciteDeRemplissage}" `
        }

        return `<g transform="rotate(${-this.anglesAxe}, ${this.centre.xSVG(coeff)}, ${this.centre.xSVG(coeff)})"><path d="M${this.M.xSVG(coeff)} ${this.M.ySVG(coeff)} A ${this.rx * coeff} ${this.ry * coeff} 0 ${this.large} ${this.sweep} ${this.N.xSVG(coeff)} ${this.N.ySVG(coeff)} L ${this.centre.xSVG(coeff)} ${this.centre.ySVG(coeff)} Z" stroke="${this.color[0]}" fill="${this.couleurDeRemplissage[0]}" ${this.style}/>  </g>`
      }
    } else {
      this.style = ''
      if (this.epaisseur !== 1) {
        this.style += ` stroke-width="${this.epaisseur}" `
      }

      switch (this.pointilles) {
        case 1:
          this.style += ' stroke-dasharray="6 10" '
          break
        case 2:
          this.style += ' stroke-dasharray="6 3" '
          break
        case 3:
          this.style += ' stroke-dasharray="3 2 6 2 " '
          break
        case 4:
          this.style += ' stroke-dasharray="1 2" '
          break
        case 5:
          this.style += ' stroke-dasharray="5 5" '
          break
      }
      if (this.opacite !== 1) {
        this.style += ` stroke-opacity="${this.opacite}" `
      }
      this.style += ` fill-opacity="${this.opaciteDeRemplissage}" `

      return `<g transform="rotate(${-this.anglesAxe}, ${this.centre.xSVG(coeff)}, ${this.centre.xSVG(coeff)})"><path d="M${this.M.xSVG(coeff)} ${this.M.ySVG(coeff)} A ${this.rx * coeff} ${this.ry * coeff} 0 ${this.large} ${this.sweep} ${this.N.xSVG(coeff)} ${this.N.ySVG(coeff)}" stroke="${this.color[0]}" fill="${this.couleurDeRemplissage[0]}" ${this.style} id="${this.id}" />  </g>`
    }
  }

  tikz() {
    let optionsDraw = ''
    const tableauOptions = []
    if (this.anglesAxe !== 0) {
      tableauOptions.push(`rotate=${this.anglesAxe}`)
    }
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color=${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width = ${this.epaisseur}`)
    }
    switch (this.pointilles) {
      case 1:
        tableauOptions.push(' dash dot ')
        break
      case 2:
        tableauOptions.push(' densely dash dot dot ')
        break
      case 3:
        tableauOptions.push(' dash dot dot ')
        break
      case 4:
        tableauOptions.push(' dotted ')
        break
      case 5:
        tableauOptions.push(' dashed ')
        break
    }

    if (this.opacite !== 1) {
      tableauOptions.push(`opacity = ${this.opacite}`)
    }

    if (
      this.couleurDeRemplissage[1] !== 'none' &&
      this.couleurDeRemplissage[1] !== ''
    ) {
      tableauOptions.push(`fill opacity = ${this.opaciteDeRemplissage}`)
      tableauOptions.push(`fill = ${this.couleurDeRemplissage[1]}`)
    }

    if (this.hachures) {
      tableauOptions.push(
        pattern({
          motif: String(this.hachures),
          id: typeof this.id === 'string' ? this.id : undefined,
          distanceDesHachures: this.distanceDesHachures,
          couleurDesHachures: this.couleurDesHachures[1],
          couleurDeRemplissage: this.couleurDeRemplissage[1],
          opaciteDeRemplissage: this.opaciteDeRemplissage,
        }),
      )
    }
    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }
    if (
      this.couleurDeRemplissage[1] !== 'none' &&
      this.couleurDeRemplissage[1] !== ''
    )
      return `\\filldraw  ${optionsDraw} (${this.M.x},${this.M.y}) arc [start angle=0, end angle = ${this.angle}, x radius = ${this.rx}, y radius = ${this.ry}]; -- cycle ;`
    else
      return `\\draw${optionsDraw} (${this.M.x},${this.M.y}) arc [start angle=0, end angle = ${this.angle}, x radius = ${this.rx}, y radius = ${this.ry}];`
  }

  svgml(coeff: number, amp: number) {
    this.style = ''
    let P: PointAbstrait
    if (this.epaisseur !== 1) {
      this.style += ` stroke-width="${this.epaisseur}" `
    }
    if (this.opacite !== 1) {
      this.style += ` stroke-opacity="${this.opacite}" `
    }
    this.style += ' fill="none" '
    let code = `<g transform="rotate(${-this.anglesAxe}, ${this.centre.xSVG(coeff)}, ${this.centre.xSVG(coeff)})"> `
    code += `<path d="M${this.M.xSVG(coeff)} ${this.M.ySVG(coeff)} S ${this.M.xSVG(coeff)} ${this.M.ySVG(coeff)}, `
    let compteur = 1
    const r = longueur(this.centre, this.M)
    for (
      let k = 0, variation;
      Math.abs(k) <= Math.abs(this.angle) - 2;
      k += this.angle < 0 ? -2 : 2
    ) {
      variation = (((Math.random() * 2 - 1) / r) * amp) / 10
      P = rotation(
        homothetie(this.M, this.centre, 1 + variation),
        this.centre,
        k,
      )
      code += `${arrondi(P.xSVG(coeff), 2)} ${arrondi(P.ySVG(coeff), 2)}, `
      compteur++
    }
    P = rotation(this.M, this.centre, this.angle)
    if (compteur % 2 === 0) code += `${P.xSVG(coeff)} ${P.ySVG(coeff)}, ` // Parce qu'on utilise S et non C dans le path
    code += `${P.xSVG(coeff)} ${P.ySVG(coeff)}`
    code += `" stroke="${this.color[0]}" ${this.style}/>`
    code += '</g>'
    return code
  }

  tikzml(amp: number) {
    let optionsDraw = ''
    const tableauOptions = []
    if (this.anglesAxe !== 0) {
      tableauOptions.push(`rotate=${this.anglesAxe}`)
    }
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color=${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width = ${this.epaisseur}`)
    }
    if (this.opacite !== 1) {
      tableauOptions.push(`opacity = ${this.opacite}`)
    }

    tableauOptions.push(
      `decorate,decoration={random steps, amplitude = ${amp}pt}`,
    )

    optionsDraw = '[' + tableauOptions.join(',') + ']'
    if (this.couleurDeRemplissage[1] !== 'none')
      return `\\filldraw  ${optionsDraw} (${this.M.x},${this.M.y}) arc [start angle=0, end angle = ${this.angle}, x radius = ${this.rx}, y radius = ${this.ry}]; -- cycle ;`
    else
      return `\\draw${optionsDraw} (${this.M.x},${this.M.y}) arc [start angle=0, end angle = ${this.angle}, x radius = ${this.rx}, y radius = ${this.ry}];`
  }
}

/**
 * @param {PointAbstrait} centre centre de l'ellipse
 * @param {number} rx rayon en X
 * @param {number} ry rayon en Y
 * @param {string} hemisphere 'nord' pour tracer au-dessus du centre, 'sud' pour tracer en dessous
 * @param {boolean | number} pointilles Si false, l'ar est en trait plein, sinon en pointillés
 * @param {boolean} rayon Si true, alors l'arc est fermé par un segment.
 * @param {string} color Facultatif, 'black' par défaut
 * @param {string} couleurDeRemplissage si 'none' alors pas de remplissage.
 * @param {number} opaciteDeRemplissage Transparence de remplissage de 0 à 1. Facultatif, 0.2 par défaut
 * @author Jean-claude Lhote
 * @return {SemiEllipse} Objet SemiEllipse
 */
export function semiEllipse({
  centre,
  rx,
  ry,
  hemisphere = 'nord',
  pointilles = 0,
  rayon = false,
  couleurDeRemplissage = 'none',
  color = 'black',
  opaciteDeRemplissage = 0.2,
  hachures = false,
  anglesAxe = 0,
}: {
  centre: PointAbstrait
  rx: number
  ry: number
  hemisphere?: string
  pointilles?: number
  rayon?: boolean
  couleurDeRemplissage?: string
  color?: string
  opaciteDeRemplissage?: number
  hachures?: string | boolean
  anglesAxe?: number
}) {
  return new SemiEllipse({
    centre,
    rx,
    ry,
    hemisphere,
    pointilles,
    rayon,
    couleurDeRemplissage,
    color,
    opaciteDeRemplissage,
    anglesAxe,
  })
}

/**
 * Trace un cône
 * @param {PointAbstrait} centre Centre de la base
 * @param {number} rx Rayon sur l'axe des abscisses
 * @param {number} hauteur Distance verticale entre le centre et le sommet.
 * @param {string} [color = 'black'] Facultatif, 'black' par défaut
 * @param {string} [couleurDeRemplissage = 'none'] none' si on ne veut pas de remplissage, sinon une couleur du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [opaciteDeRemplissage = 0.2] Taux d'opacité du remplissage
 * @author Jean-claude Lhote
 * @private
 */
export class Cone extends ObjetMathalea2D {
  sommet: PointAbstrait
  centre: PointAbstrait
  couleurDeRemplissage: string
  opaciteDeRemplissage: number
  stringColor: string
  constructor({
    centre,
    rx,
    hauteur,
    couleurDeRemplissage = 'none',
    color = 'black',
    opaciteDeRemplissage = 0.2,
  }: {
    centre: PointAbstrait
    rx: number
    hauteur: number
    couleurDeRemplissage?: string
    color?: string
    opaciteDeRemplissage?: number
  }) {
    super()
    const sommet = pointAbstrait(centre.x, centre.y + hauteur)
    this.sommet = sommet
    this.centre = centre
    this.stringColor = color
    this.couleurDeRemplissage = couleurDeRemplissage
    this.opaciteDeRemplissage = opaciteDeRemplissage
    this.objets = [
      semiEllipse({
        centre,
        rx,
        ry: rx / 3,
        hemisphere: 'nord',
        rayon: false,
        pointilles: 1,
        couleurDeRemplissage,
        color,
        opaciteDeRemplissage,
      }),
      semiEllipse({
        centre,
        rx,
        ry: rx / 3,
        hemisphere: 'sud',
        rayon: false,
        pointilles: 0,
        couleurDeRemplissage,
        color,
        opaciteDeRemplissage,
      }),
      segment(pointAbstrait(centre.x + rx, centre.y + 0.1), sommet, color),
      segment(pointAbstrait(centre.x - rx, centre.y + 0.1), sommet, color),
    ]
    let xMin = 1000
    let yMin = 1000
    let yMax = -1000
    let xMax = -1000
    for (const obj of this.objets) {
      xMin = Math.min(xMin, obj.bordures[0])
      yMin = Math.min(yMin, obj.bordures[1])
      xMax = Math.max(xMax, obj.bordures[2])
      yMax = Math.max(yMax, obj.bordures[3])
    }
    this.bordures = [xMin, yMin, xMax, yMax]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      objet.color = colorToLatexOrHTML(this.stringColor)
      code += objet.svg(coeff) + '\n'
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      objet.color = colorToLatexOrHTML(this.stringColor)
      code += objet.tikz() + '\t'
    }
    return code
  }
}

export class Sphere2d extends ObjetMathalea2D {
  centre: PointAbstrait
  couleurDeRemplissage: string
  opaciteDeRemplissage: number
  constructor({
    centre,
    rx,
    couleurDeRemplissage = 'none',
    color = 'black',
    opaciteDeRemplissage = 0.2,
  }: {
    centre: PointAbstrait
    rx: number
    couleurDeRemplissage?: string
    color?: string
    opaciteDeRemplissage?: number
  }) {
    super()
    const grandCercle = new Cercle(centre, rx, color, couleurDeRemplissage)
    this.centre = centre
    this.color = colorToLatexOrHTML(color)
    this.couleurDeRemplissage = couleurDeRemplissage
    this.opaciteDeRemplissage = opaciteDeRemplissage
    this.objets = [
      grandCercle,
      semiEllipse({
        centre,
        rx,
        ry: rx / 3,
        hemisphere: 'nord',
        rayon: false,
        pointilles: 1,
        couleurDeRemplissage,
        color,
        opaciteDeRemplissage,
      }),
      semiEllipse({
        centre,
        rx,
        ry: rx / 3,
        hemisphere: 'sud',
        rayon: false,
        pointilles: 0,
        couleurDeRemplissage,
        color,
        opaciteDeRemplissage,
      }),
    ]
    let xMin = 1000
    let yMin = 1000
    let yMax = -1000
    let xMax = -1000
    for (const obj of this.objets) {
      xMin = Math.min(xMin, obj.bordures[0])
      yMin = Math.min(yMin, obj.bordures[1])
      xMax = Math.max(xMax, obj.bordures[2])
      yMax = Math.max(yMax, obj.bordures[3])
    }
    this.bordures = [xMin, yMin, xMax, yMax]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      objet.color = this.color.slice() as [string, string]
      code += objet.svg(coeff) + '\n'
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      objet.color = this.color
      code += objet.tikz() + '\t'
    }
    return code
  }
}

export function sphere2d({
  centre,
  rx,
  couleurDeRemplissage = 'none',
  color = 'black',
  opaciteDeRemplissage = 0.2,
}: {
  centre: PointAbstrait
  rx: number
  couleurDeRemplissage?: string
  color?: string
  opaciteDeRemplissage?: number
}) {
  return new Sphere2d({
    centre,
    rx,
    couleurDeRemplissage,
    color,
    opaciteDeRemplissage,
  })
}

// Cette fonction donne un rendu correct que si la hauteur est suffisamment grande
export function cone({
  centre,
  rx,
  hauteur,
  couleurDeRemplissage = 'none',
  color = 'black',
  opaciteDeRemplissage = 0.2,
}: {
  centre: PointAbstrait
  rx: number
  hauteur: number
  couleurDeRemplissage?: string
  color?: string
  opaciteDeRemplissage?: number
}) {
  return new Cone({
    centre,
    rx,
    hauteur,
    couleurDeRemplissage,
    color,
    opaciteDeRemplissage,
  })
}

/**
 * Trace un cylindre
 * @param {PointAbstrait} centre Centre de la base
 * @param {number} rx Rayon sur l'axe des abscisses
 * @param {number} hauteur Distance verticale entre le centre et le sommet.
 * @param {string} [position = 'DeboutVuDessus'] Facultatif, 'DeboutVuDessus' par défaut, ou 'baseAvantCoucheVuGauche' a faire : baseCoteCoucheVuDroite
 * @param {string} [color = 'black'] Facultatif, 'black' par défaut
 * @param {string} [couleurDeRemplissage = 'none'] none' si on ne veut pas de remplissage, sinon une couleur du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [opaciteDeRemplissage = 0.2] Taux d'opacité du remplissage
 * @param {number} [angleDeFuite = 30] pour 'baseAvantCoucheVuDroite'
 * @param {number} [coefficientDeFuite = 0.5] 'baseAvantCoucheVuDroite'
 * @author Olivier Mimeau // d'après Cone de Jean-claude Lhote
 * @private
 */
export class Cylindre extends ObjetMathalea2D {
  centre: PointAbstrait
  centre2: PointAbstrait
  couleurDeRemplissage: string
  opaciteDeRemplissage: number
  stringColor: string
  constructor({
    centre,
    rx,
    hauteur,
    position = 'DeboutVuDessus',
    couleurDeRemplissage = 'none',
    color = 'black',
    opaciteDeRemplissage = 0.2,
    angleDeFuite = 30,
    coefficientDeFuite = 0.5,
  }: {
    centre: PointAbstrait
    rx: number
    hauteur: number
    position?: string
    couleurDeRemplissage?: string
    color?: string
    opaciteDeRemplissage?: number
    angleDeFuite?: number
    coefficientDeFuite?: number
  }) {
    super()
    let centre2 = pointAbstrait(centre.x + hauteur, centre.y)
    // this.centre2 = centre2 plus est modifié suivant la position
    this.centre = centre
    this.stringColor = color
    this.couleurDeRemplissage = couleurDeRemplissage
    this.opaciteDeRemplissage = opaciteDeRemplissage
    switch (position) {
      case 'baseCoteCoucheVuDroite':
        centre2 = pointAbstrait(centre.x + hauteur, centre.y)
        this.objets = [
          semiEllipse({
            centre,
            rx,
            ry: rx / 3,
            hemisphere: 'sud',
            rayon: false,
            pointilles: 1,
            couleurDeRemplissage,
            color,
            opaciteDeRemplissage,
            hachures: false,
            anglesAxe: 90,
          }),
          semiEllipse({
            centre,
            rx,
            ry: rx / 3,
            hemisphere: 'nord',
            rayon: false,
            pointilles: 0,
            couleurDeRemplissage,
            color,
            opaciteDeRemplissage,
            hachures: false,
            anglesAxe: 90,
          }),
          ellipse(centre2, rx / 3, rx, color),
          segment(
            pointAbstrait(centre.x - 0.1, centre.y + rx),
            pointAbstrait(centre2.x + 0.1, centre2.y + rx),
            color,
          ),
          segment(
            pointAbstrait(centre.x - 0.1, centre.y - rx),
            pointAbstrait(centre2.x + 0.1, centre2.y - rx),
            color,
          ),
        ]
        break
      case 'baseAvantCoucheVuGauche': {
        centre2 = pointAdistance(
          centre,
          hauteur * coefficientDeFuite,
          angleDeFuite,
        )
        const ey = -rx * Math.cos((angleDeFuite * Math.PI) / 180)
        const ex = rx * Math.sin((angleDeFuite * Math.PI) / 180)
        const debutArc = pointAbstrait(centre2.x + ex, centre2.y + ey)
        const demiCerclePlein = arc(
          debutArc,
          centre2,
          180,
          false,
          couleurDeRemplissage,
          color,
          opaciteDeRemplissage,
          'none',
        )
        const demiCerclePointille = arc(
          debutArc,
          centre2,
          -180,
          false,
          couleurDeRemplissage,
          color,
          opaciteDeRemplissage,
          'none',
        )
        demiCerclePointille.pointilles = 1
        this.objets = [
          cercle(centre, rx),
          // cercle(centre, rx, color, couleurDeRemplissage, 'none', 1, 0, opaciteDeRemplissage, 1, 10),
          demiCerclePlein,
          demiCerclePointille,
          segment(
            pointAbstrait(centre.x + ex, centre.y + ey),
            pointAbstrait(centre2.x + ex, centre2.y + ey),
            color,
          ),
          segment(
            pointAbstrait(centre.x - ex, centre.y - ey),
            pointAbstrait(centre2.x - ex, centre2.y - ey),
            color,
          ),
        ]

        break
      }
      case 'DeboutVuDessus':
      default:
        centre2 = pointAbstrait(centre.x, centre.y + hauteur)
        this.objets = [
          semiEllipse({
            centre,
            rx,
            ry: rx / 3,
            hemisphere: 'nord',
            rayon: false,
            pointilles: 1,
            couleurDeRemplissage,
            color,
            opaciteDeRemplissage,
          }),
          semiEllipse({
            centre,
            rx,
            ry: rx / 3,
            hemisphere: 'sud',
            rayon: false,
            pointilles: 0,
            couleurDeRemplissage,
            color,
            opaciteDeRemplissage,
          }),
          ellipse(centre2, rx, rx / 3, color),
          segment(
            pointAbstrait(centre.x + rx, centre.y - 0.1),
            pointAbstrait(centre2.x + rx, centre2.y + 0.1),
            color,
          ),
          segment(
            pointAbstrait(centre.x - rx, centre.y - 0.1),
            pointAbstrait(centre2.x - rx, centre2.y + 0.1),
            color,
          ),
        ]
        break
    }
    this.centre2 = centre2
    let xMin = 1000
    let yMin = 1000
    let yMax = -1000
    let xMax = -1000
    for (const obj of this.objets) {
      xMin = Math.min(xMin, obj.bordures[0])
      yMin = Math.min(yMin, obj.bordures[1])
      xMax = Math.max(xMax, obj.bordures[2])
      yMax = Math.max(yMax, obj.bordures[3])
    }
    this.bordures = [xMin, yMin, xMax, yMax]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      objet.color = colorToLatexOrHTML(this.stringColor)
      code += objet.svg(coeff) + '\n'
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      objet.color = colorToLatexOrHTML(this.stringColor)
      code += objet.tikz() + '\t'
    }
    return code
  }
}

export function cylindre({
  centre,
  rx,
  hauteur,
  position,
  couleurDeRemplissage = 'none',
  color = 'black',
  opaciteDeRemplissage = 0.2,
  angleDeFuite = 30,
  coefficientDeFuite = 0.5,
}: {
  centre: PointAbstrait
  rx: number
  hauteur: number
  position?: string
  couleurDeRemplissage?: string
  color?: string
  opaciteDeRemplissage?: number
  angleDeFuite?: number
  coefficientDeFuite?: number
}) {
  return new Cylindre({
    centre,
    rx,
    hauteur,
    position,
    couleurDeRemplissage,
    color,
    opaciteDeRemplissage,
    angleDeFuite,
    coefficientDeFuite,
  })
}
