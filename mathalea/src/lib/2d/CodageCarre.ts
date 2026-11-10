import { codageAngleDroit } from './CodageAngleDroit'
import { codageSegments } from './CodageSegment'
import type { IPolygone } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'

/**
 * Code un carré
 * @param {Polygone} c Carré à coder
 * @param {string} [color = 'black'] Couleur des codages : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {string} [mark='x'] Symbole posé sur les côtés
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class CodageCarre extends ObjetMathalea2D {
  constructor(c: IPolygone, color = 'black', mark = '×') {
    super()
    this.objets = []
    this.objets.push(codageSegments(mark, color, ...c.listePoints))
    this.objets.push(
      codageAngleDroit(
        c.listePoints[0],
        c.listePoints[1],
        c.listePoints[2],
        color,
      ),
    )
    this.objets.push(
      codageAngleDroit(
        c.listePoints[1],
        c.listePoints[2],
        c.listePoints[3],
        color,
      ),
    )
    this.objets.push(
      codageAngleDroit(
        c.listePoints[2],
        c.listePoints[3],
        c.listePoints[0],
        color,
      ),
    )
    this.objets.push(
      codageAngleDroit(
        c.listePoints[3],
        c.listePoints[0],
        c.listePoints[1],
        color,
      ),
    )
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
 * Met un codage complet sur un carré
 * @param {Polygone} c Carré à coder
 * @param {string} [color = 'black'] Couleur des codages : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {string} [mark='x'] Symbole posé sur les côtés
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @example codageCarre(carre) // Code, en noir, le carré carre.
 * @example codageCarre(carre,'red','||') // Code, en rouge, le carré carre avec la marque || sur les côtés
 * @return {CodageCarre}
 */
// JSDOC Validee par EE Juin 2022

export function codageCarre(c: IPolygone, color = 'black', mark = '×') {
  return new CodageCarre(c, color, mark)
}
