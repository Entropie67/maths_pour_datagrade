import { ObjetMathalea2D } from './ObjetMathalea2D'
import { segment } from './segmentsVecteurs'

/**
 * Trace un repère orthonormé
 * @param {number} [xmin=-30] Valeur minimale sur l'axe des abscisses
 * @param {number} [ymin=-30] Valeur minimale sur l'axe des ordonnées
 * @param {number} [xmax=30] Valeur maximale sur l'axe des abscisses
 * @param {number} [ymax=30] Valeur maximale sur l'axe des ordonnées
 * @param {number} [thick=0.2] Demi-longueur des tirets de chaque graduation
 * @param {number} [xstep=1] Pas sur l'axe des abscisses
 * @param {number} [ystep=1] Pas sur l'axe des ordonnées
 * @param {number} [epaisseur=2] Epaisseur des deux axes
 * @param {string} [color='black'] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [tailleExtremites=4] Taille des flèches à l'extrémité des axes.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class Axes extends ObjetMathalea2D {
  constructor(
    xmin = -30,
    ymin = -30,
    xmax = 30,
    ymax = 30,
    thick = 0.2,
    xstep = 1,
    ystep = 1,
    epaisseur = 2,
    color = 'black',
    tailleExtremites = 4,
  ) {
    super()
    this.objets = []
    let yabscisse
    ymin > 0 ? (yabscisse = ymin) : (yabscisse = 0)
    let xordonnee
    xmin > 0 ? (xordonnee = xmin) : (xordonnee = 0)
    const abscisse = segment(xmin, yabscisse, xmax, yabscisse, color)
    abscisse.styleExtremites = '->'
    abscisse.tailleExtremites = tailleExtremites
    abscisse.epaisseur = epaisseur
    const ordonnee = segment(xordonnee, ymin, xordonnee, ymax, color)
    ordonnee.styleExtremites = '->'
    ordonnee.epaisseur = epaisseur
    ordonnee.tailleExtremites = tailleExtremites
    this.objets.push(abscisse, ordonnee)
    for (let x = xmin; x < xmax; x = x + xstep) {
      const s = segment(x, yabscisse - thick, x, yabscisse + thick, color)
      s.epaisseur = epaisseur
      this.objets.push(s)
    }
    for (let y = ymin; y < ymax; y = y + ystep) {
      const s = segment(xordonnee - thick, y, xordonnee + thick, y, color)
      s.epaisseur = epaisseur
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
 * Trace un repère orthonormé
 * @param {number} [xmin=-30] Valeur minimale sur l'axe des abscisses
 * @param {number} [ymin=-30] Valeur minimale sur l'axe des ordonnées
 * @param {number} [xmax=30] Valeur maximale sur l'axe des abscisses
 * @param {number} [ymax=30] Valeur maximale sur l'axe des ordonnées
 * @param {number} [thick=0.2] Demi-longueur des tirets de chaque graduation
 * @param {number} [xstep=1] Pas sur l'axe des abscisses
 * @param {number} [ystep=1] Pas sur l'axe des ordonnées
 * @param {number} [epaisseur=2] Epaisseur des deux axes
 * @param {string} [color='black'] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @example axes()
 * // Trace un repère orthonormé dont les axes des abscisses et des ordonnées ont pour minimum -30, maximum -30, épaisseur 2, avec un pas de 1 et de couleur noire. Le tiret de chaque graduation mesure 0,4.
 * @example axes(-10,-5,20,3,0.25,2,0.5,1,'red')
 * // Trace un repère orthonormé rouge dont les axes des abscisses et des ordonnées ont pour épaisseur 1 et dont le tiret de chaque graduation mesure 0,5.
 * // L'axe des abscisses va de -10 à 20 avec un pas de 2. L'axe des ordonnées va de -5 à 3 avec un pas de 0,5.
 * @return {Axes}
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022

export function axes(
  xmin = -30,
  ymin = -30,
  xmax = 30,
  ymax = 30,
  thick = 0.2,
  xstep = 1,
  ystep = 1,
  epaisseur = 2,
  color = 'black',
) {
  return new Axes(xmin, ymin, xmax, ymax, thick, xstep, ystep, epaisseur, color)
}
