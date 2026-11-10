import { bleuMathalea } from '../../lib/colors'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { segment } from './segmentsVecteurs'

/**  Trace une grille quadrillée dont le coin en bas à gauche est (xmin, ymin) et celui à droite est au maximum (xmax, ymax), de couleur et opacité choisie, avec un pas choisi et avec ou sans pointillés
 * @param {number} [xmin = -30] Abscisse du coin en bas à gauche de la grille
 * @param {number} [ymin = -30] Ordonnée du coin en bas à gauche de la grille
 * @param {number} [xmax = 30] Abscisse du coin en haut à droite de la grille
 * @param {number} [ymax = 30] Ordonnée du coin en haut à droite de la grille
 * @param {string} [color = 'gray'] Couleur de la grille : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [opacite = 0.4] Opacité de la grille : entre 0 et 1
 * @param {number} [step = 1] Pas de la grille
 * @param {number} [pointilles = 0] Style des pointillés de la grille (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur de la grille. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opacite Opacité de la grille : entre 0 et 1
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Aout 2022

export class Grille extends ObjetMathalea2D {
  constructor(
    xmin = -30,
    ymin = -30,
    xmax = 30,
    ymax = 30,
    color = 'gray',
    opacite = 0.4,
    step = 1,
    pointilles = 0,
  ) {
    super()
    this.color = colorToLatexOrHTML(color)
    this.opacite = opacite
    this.objets = []
    let x = xmin
    let nbStep = Math.round((xmax - xmin) / step)
    for (let i = 0; i <= nbStep; i++) {
      const s = segment(x, ymin, x, ymax, color)
      x += step
      s.opacite = this.opacite
      if (pointilles) {
        s.pointilles = 5
      }
      this.objets.push(s)
    }
    let y = ymin
    nbStep = Math.round((ymax - ymin) / step)
    for (let i = 0; i <= nbStep; i++) {
      const s = segment(xmin, y, xmax, y, color)
      y += step
      s.opacite = this.opacite
      if (pointilles) {
        s.pointilles = 5
      }
      this.objets.push(s)
    }
    this.bordures = [xmin, ymin, xmax, ymax]
  }

  // this.commentaire = `Grille(xmin = ${xmin}, ymin = ${ymin}, xmax = ${xmax}, ymax = ${ymax}, color = ${this.color}, opacite = ${this.opacite}, pas = ${step})`
  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }

  svgml(coeff: number, amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (objet.svgml) {
        code += '\n\t' + objet.svgml(coeff, amp)
      } else {
        code += '\n\t' + objet.svg(coeff)
      }
    }
    return code
  }

  tikzml(amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.tikzml === 'undefined') {
        code += `\t${objet.tikz()}\n`
      } else {
        code += `\t${objet.tikzml(amp)}\n`
      }
    }
    return code
  }
}
/**  Trace une grille quadrillée dont le coin en bas à gauche est (xmin, ymin) et celui à droite est au maximum (xmax, ymax), de couleur et opacité choisie, avec un pas choisi et avec ou sans pointillés
 * @param {number} [xmin = -30] Abscisse du coin en bas à gauche de la grille
 * @param {number} [ymin = -30] Ordonnée du coin en bas à gauche de la grille
 * @param {number} [xmax = 30] Abscisse du coin en haut à droite de la grille
 * @param {number} [ymax = 30] Ordonnée du coin en haut à droite de la grille
 * @param {string} [color = 'gray'] Couleur de la grille : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [opacite = 0.4] Opacité de la grille : entre 0 et 1
 * @param {number} [step = 1] Pas de la grille
 * @param {number} [pointilles = 0] Style des pointillés de la grille (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @example grid = grille() // Trace une grille avec toutes les options par défaut
 * @example grid = grille(-3, -3, 27, 18, 'red', 0.2, 0.5, true) // Trace une grille avec toutes les options différentes de celles par défaut
 * @author Rémi Angot
 * @return {Grille}
 */
// JSDOC Validee par EE Aout 2022

export function grille(
  xmin = -30,
  ymin = -30,
  xmax = 30,
  ymax = 30,
  color = 'gray',
  opacite = 0.4,
  step = 1,
  pointilles = 0,
) {
  return new Grille(xmin, ymin, xmax, ymax, color, opacite, step, pointilles)
}
/**  Trace des parallèles à l'axe des abscisses
 * @param {number} [xmin = -30] Abscisse du coin en bas à gauche de ces parallèles
 * @param {number} [ymin = -30] Ordonnée du coin en bas à gauche de ces parallèles
 * @param {number} [xmax = 30] Abscisse du coin en haut à droite de ces parallèles
 * @param {number} [ymax = 30] Ordonnée du coin en haut à droite de ces parallèles
 * @param {string} [color = 'gray'] Couleur de ces parallèles : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [opacite = 0.4] Opacité de ces parallèles : entre 0 et 1
 * @param {number} [step = 1] Pas de ces parallèles
 * @param {number} [pointilles = 0] Style des pointillés de ces parallèles (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur de ces parallèles. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opacite Opacité de ces parallèles : entre 0 et 1
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Aout 2022

export class LignesHorizontales extends ObjetMathalea2D {
  constructor(
    xmin = -30,
    ymin = -30,
    xmax = 30,
    ymax = 30,
    color = 'gray',
    opacite = 0.4,
    step = 1,
    pointilles = '',
  ) {
    super()
    this.color = colorToLatexOrHTML(color)
    this.opacite = opacite
    this.objets = []
    for (let i = ymin; i <= ymax; i += step) {
      const s = segment(xmin, i, xmax, i, color)
      s.opacite = this.opacite
      if (pointilles) {
        s.pointilles = 5
      }
      this.objets.push(s)
    }
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}
/**  Trace des parallèles à l'axe des abscisses
 * @param {number} [xmin = -30] Abscisse du coin en bas à gauche de ces parallèles
 * @param {number} [ymin = -30] Ordonnée du coin en bas à gauche de ces parallèles
 * @param {number} [xmax = 30] Abscisse du coin en haut à droite de ces parallèles
 * @param {number} [ymax = 30] Ordonnée du coin en haut à droite de ces parallèles
 * @param {string} [color = 'gray'] Couleur de ces parallèles : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [opacite = 0.4] Opacité de ces parallèles : entre 0 et 1
 * @param {number} [step = 1] Pas de ces parallèles
 * @param {number} [pointilles = 0] Style des pointillés de ces parallèles (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @example grid = lignesHorizontales() // Trace des parallèles à l'axe des abscisses avec toutes les options par défaut
 * @example grid = lignesHorizontales(-3, -3, 27, 18, 'red', 0.2, 0.5, true) // Trace des parallèles à l'axe des abscisses avec toutes les options différentes de celles par défaut
 * @author Rémi Angot
 * @return {LignesHorizontales}
 */
// JSDOC Validee par EE Aout 2022

export function lignesHorizontales(
  xmin = -30,
  ymin = -30,
  xmax = 30,
  ymax = 30,
  color = 'gray',
  opacite = 0.4,
  step = 1,
  pointilles = '',
) {
  return new LignesHorizontales(
    xmin,
    ymin,
    xmax,
    ymax,
    color,
    opacite,
    step,
    pointilles,
  )
}
/**  Trace des verticales à l'axe des ordonnées
 * @param {number} [xmin = -30] Abscisse du coin en bas à gauche de ces parallèles
 * @param {number} [ymin = -30] Ordonnée du coin en bas à gauche de ces parallèles
 * @param {number} [xmax = 30] Abscisse du coin en haut à droite de ces parallèles
 * @param {number} [ymax = 30] Ordonnée du coin en haut à droite de ces parallèles
 * @param {string} [color = 'gray'] Couleur de ces parallèles : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [opacite = 0.4] Opacité de ces parallèles : entre 0 et 1
 * @param {number} [step = 1] Pas de ces parallèles
 * @param {number} [pointilles = 0] Style des pointillés de ces parallèles (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur de ces parallèles. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opacite Opacité de ces parallèles : entre 0 et 1
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Aout 2022

export class LignesVerticales extends ObjetMathalea2D {
  constructor(
    xmin = -30,
    ymin = -30,
    xmax = 30,
    ymax = 30,
    color = 'gray',
    opacite = 0.4,
    step = 1,
    pointilles = '',
  ) {
    super()
    this.color = colorToLatexOrHTML(color)
    this.opacite = opacite
    this.objets = []
    for (let i = xmin; i <= xmax; i = i + step) {
      const s = segment(i, ymin, i, ymax, color)
      s.opacite = this.opacite
      if (pointilles) {
        s.pointilles = 5
      }
      this.objets.push(s)
    }
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}
/**
 * LignesVerticales(xmin,ymin,xmax,ymax,color,opacite,pas)
 *
 * @author Rémi Angot
 */
/**  Trace des parallèles à l'axe des ordonnées
 * @param {number} [xmin = -30] Abscisse du coin en bas à gauche de ces parallèles
 * @param {number} [ymin = -30] Ordonnée du coin en bas à gauche de ces parallèles
 * @param {number} [xmax = 30] Abscisse du coin en haut à droite de ces parallèles
 * @param {number} [ymax = 30] Ordonnée du coin en haut à droite de ces parallèles
 * @param {string} [color = 'gray'] Couleur de ces parallèles : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [opacite = 0.4] Opacité de ces parallèles : entre 0 et 1
 * @param {number} [step = 1] Pas de ces parallèles
 * @param {number} [pointilles = 0] Style des pointillés de ces parallèles (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @example grid = lignesHorizontales() // Trace des parallèles à l'axe des ordonnées avec toutes les options par défaut
 * @example grid = lignesHorizontales(-3, -3, 27, 18, 'red', 0.2, 0.5, true) // Trace des parallèles à l'axe des ordonnées avec toutes les options différentes de celles par défaut
 * @author Rémi Angot
 * @return {LignesVerticales}
 */
// JSDOC Validee par EE Aout 2022

export function lignesVerticales(
  xmin = -30,
  ymin = -30,
  xmax = 30,
  ymax = 30,
  color = 'gray',
  opacite = 0.4,
  step = 1,
  pointilles = '',
) {
  return new LignesVerticales(
    xmin,
    ymin,
    xmax,
    ymax,
    color,
    opacite,
    step,
    pointilles,
  )
}

export class Seyes extends ObjetMathalea2D {
  constructor(
    xmin = 0,
    ymin = 0,
    xmax = 15,
    ymax = 15,
    opacite1 = 0.5,
    opacite2 = 0.2,
  ) {
    super()
    this.objets = []
    for (let y = ymin; y <= ymax; y = y + 0.25) {
      if (y % 1 !== 0) {
        const d = segment(xmin, y, xmax, y, 'red')
        d.opacite = opacite2
        this.objets.push(d)
      }
    }
    this.objets.push(grille(xmin, ymin, xmax, ymax, bleuMathalea, opacite1, 1))
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}
/**
 * Fais un quadrillage avec des grands carreaux.
 *
 * Pour une sortie LaTeX, il faut penser à ajouter scale = .8
 *
 * @param {number} xmin
 * @param {number} ymin
 * @param {number} xmax
 * @param {number} ymax
 * @param {number?} opacite1=0.5
 * @param {number?} opacite2=0.2
 * @author Rémi Angot
 */

export function seyes(
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number,
  opacite1 = 0.5,
  opacite2 = 0.2,
) {
  return new Seyes(xmin, ymin, xmax, ymax, opacite1, opacite2)
}
