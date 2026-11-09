import { stringNombre } from '../outils/texNombre'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { texteParPoint } from './textes'

/**
 * Trace une droite verticale graduée
 * @param {number} [ymin=-2] Valeur minimale sur l'axe vertical
 * @param {number} [ymax=5] Valeur maximale sur l'axe vertical
 * @param {number} [thick=0.2] Largeur des tirets de chaque graduation principale
 * @param {number} [ystep=1] Pas sur l'axe des ordonnées
 * @param {number} [epaisseur=2] Epaisseur des deux axes
 * @param {string} [color='black'] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [ytick=2] Nombre de partage entre deux graduations principales
 * @param {string} [titre=''] Titre de l'axe
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {number[]} bordures Coordonnées de la fenêtre d'affichage du genre [-2,-2,5,5]
 * @author Frédéric Piou
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class AxeY extends ObjetMathalea2D {
  constructor(
    ymin = -2,
    ymax = 5,
    thick = 0.2,
    ystep = 1,
    epaisseur = 2,
    color = 'black',
    ytick = 2,
    titre = '',
  ) {
    super()
    this.objets = []
    if (titre !== '') {
      this.objets.push(
        texteParPoint(
          titre,
          pointAbstrait(-1 - thick - 0.1, ymax),
          0,
          color,
          1,
          'droite',
          false,
          1,
        ),
      )
    }
    const ordonnee = segment(-1, ymin.valueOf(), -1, ymax.valueOf(), color)
    ordonnee.styleExtremites = '->'
    ordonnee.epaisseur = epaisseur
    this.objets.push(ordonnee)
    for (let y = ymin; y < ymax; y = y + ystep) {
      const s = segment(-1 - thick, y.valueOf(), -1, y.valueOf(), color)
      s.epaisseur = epaisseur
      this.objets.push(s)
    }
    for (let y = ymin; y < ymax; y = y + ystep / ytick) {
      const s = segment(-1 - thick / 2, y.valueOf(), -1, y.valueOf(), color)
      s.epaisseur = epaisseur
      this.objets.push(s)
    }
    this.bordures = [1000, 1000, -1000, -1000]
    for (const objet of this.objets) {
      if (objet.bordures !== undefined) {
        this.bordures = [
          Math.min(this.bordures[0], objet.bordures[0]),
          Math.min(this.bordures[1], objet.bordures[1]),
          Math.max(this.bordures[2], objet.bordures[2]),
          Math.max(this.bordures[3], objet.bordures[3]),
        ]
      }
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
 * Trace une droite verticale graduée
 * @param {number} [ymin=-2] Valeur minimale sur l'axe vertical
 * @param {number} [ymax=5] Valeur maximale sur l'axe vertical
 * @param {number} [thick=0.2] Largeur des tirets de chaque graduation principale
 * @param {number} [ystep=1] Pas sur l'axe des ordonnées
 * @param {number} [epaisseur=2] Epaisseur des deux axes
 * @param {string} [color='black'] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [ytick=2] Nombre de partage entre deux graduations principales
 * @param {string} [titre=''] Titre de l'axe
 * @example axeY()
 * // Trace un axe noir vertical gradué de -2 à 5, de 1 en 1, avec une petite graduation entre deux graduations principales (de longueur 0.2 et d'épaisseur 2), et sans titre
 * @example axeY(0,10,0.25,2,1,'red',5,'titre')
 * // Trace un axe rouge vertical gradué de 0 à 10, de 2 en 2, avec quatre petites graduations entre deux graduations principales (de longueur 0.25 et d'épaisseur 1), et avec comme titre de l'axe : titre
 * @author Frédéric Piou
 * @return {AxeY}
 */
// JSDOC Validee par EE Juin 2022

export function axeY(
  ymin = -2,
  ymax = 5,
  thick = 0.2,
  ystep = 1,
  epaisseur = 2,
  color = 'black',
  ytick = 2,
  titre = '',
) {
  return new AxeY(ymin, ymax, thick, ystep, epaisseur, color, ytick, titre)
}

/**  Place des labels sur un axe vertical précédemment
 * @param  {number} [ymin = 1] Ordonnée minimale sur l'axe
 * @param  {number} [ymax = 20] Ordonnée maximale sur l'axe
 * @param  {number} [step = 1] Pas entre chaque label
 * @param {string} [color = 'black'] Couleur des labels : du type 'red', bleuMathalea ou du type '#a12345'
 * @param  {number} [pos = -0.6] Décalage entre les labels et l'axe vertical
 * @param  {number} [coeff = 1] Coefficient multiplicatif sur chaque label
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @author Rémi Angot modifié par Frédéric Piou
 * @class
 */
// JSDOC Validee par EE Septembre 2022

export class LabelY extends ObjetMathalea2D {
  constructor(
    ymin = 1,
    ymax = 20,
    step = 1,
    color = 'black',
    pos = -0.6,
    coeff = 1,
  ) {
    super()
    this.objets = []
    for (let y = Math.ceil(ymin / coeff); y * coeff <= ymax; y = y + step) {
      this.objets.push(
        texteParPoint(
          stringNombre(y * coeff, 3),
          pointAbstrait(pos, y),
          0,
          color,
          1,
          'gauche',
          true,
        ),
      )
    }
    const bordures = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
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
/**  Place des labels sur un axe vertical précédemment
 * @param  {number} [ymin = 1] Ordonnée minimale sur l'axe
 * @param  {number} [ymax = 20] Ordonnée maximale sur l'axe
 * @param  {number} [step = 1] Pas entre chaque label
 * @param {string} [color = 'black'] Couleur des labels : du type 'red', bleuMathalea ou du type '#a12345'
 * @param  {number} [pos = -0.6] Décalage entre les labels et l'axe vertical
 * @param  {number} [coeff = 1] Coefficient multiplicatif sur chaque label
 * @example labelY()
 * // Note, sur un axe (prédéfini de 1 en 1), des labels noirs, de 0 à 20, de 2 en 2, avec un décalage de -0,6 par rapport à l'axe
 * @example labelY(0, 160, 2, 'red', -2, 20)
 * // Note, sur un axe (prédéfini de 1 en 1), des labels rouges, de 0 à 160, de 40 (2*20) en 40, avec un décalage de -2 par rapport à l'axe.
 * @author Rémi Angot modifié par Frédéric Piou
 * @return {LabelY}
 */
// JSDOC Validee par EE Septembre 2022

export function labelY(
  ymin = 1,
  ymax = 20,
  step = 1,
  color = 'black',
  pos = -0.6,
  coeff = 1,
) {
  return new LabelY(ymin, ymax, step, color, pos, coeff)
}
