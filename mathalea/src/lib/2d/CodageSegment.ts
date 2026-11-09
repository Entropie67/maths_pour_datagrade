import { ObjetMathalea2D } from './ObjetMathalea2D'
import { PointAbstrait } from './PointAbstrait'
import { segment, Segment } from './segmentsVecteurs'
import { TexteParPoint } from './textes'
import { milieu } from './utilitairesPoint'

/**
 * Code un segment
 * @param {PointAbstrait} A Première extrémité du segment
 * @param {PointAbstrait} B Seconde extrémité du segment
 * @param {string} [mark='||'] Symbole posé sur le segment
 * @param {string} [color='black'] Couleur du symbole : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [echelle=1] Taille relative du symbole
 * @example codageSegment(H,K) // Code le segment [HK] avec la marque noire '||'
 * @example codageAngle(H,K,'x','green') // Code le segment [HK] avec la marque verte 'x'
 * @example codageAngle(H,K,'x','green',{echelle : 3}) // Code le segment [HK] avec la marque verte 'x' et de taille 3.
 * @author Rémi Angot
 * @return {TexteParPoint}
 */
// JSDOC Validee par EE Juin 2022

export function codageSegment(
  A: PointAbstrait,
  B: PointAbstrait,
  mark = '||',
  color = 'black',
  echelle = 0.5,
) {
  const O = milieu(A, B)
  const s = segment(A, B)
  let angle
  if (B.x > A.x) {
    angle = -parseInt(s.angleAvecHorizontale.toFixed(0))
  } else {
    angle = -parseInt(s.angleAvecHorizontale.toFixed(0)) + 180
  }
  return new TexteParPoint(mark, O, angle, color, echelle)
}
/**
 * Code plusieurs segments de la même façon
 * @param {string} [mark = '||'] Symbole posé sur le segment
 * @param {string} [color = 'black'] Couleur du symbole : : du type 'red', bleuMathalea ou du type '#a12345'
 * @param  {PointAbstrait[]|Segment|number} args Les segments différement codés + Taille relative du codage
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class CodageSegments extends ObjetMathalea2D {
  echelle: number
  stringColor: string // Pour pouvoir passer une simple couleur aux autres constructeurs.
  mark: string
  isEchelle: boolean
  args: (PointAbstrait | Segment | number)[]
  constructor(mark = '||', color = 'black', ...args: any[]) {
    super()
    this.args = args
    this.mark = mark
    this.stringColor = color
    this.isEchelle = typeof args[args.length - 1] === 'number'
    this.echelle = this.isEchelle ? (args[args.length - 1] as number) : 1
    const trouveExtrem = function (
      xmin: number,
      ymin: number,
      xmax: number,
      ymax: number,
      ...pointsOuSegment: (PointAbstrait | Segment)[]
    ): [number, number, number, number] {
      if (pointsOuSegment.length === 0) return [xmin, ymin, xmax, ymax]
      else {
        const premierElement = pointsOuSegment.shift() as unknown
        if (premierElement instanceof Segment) {
          xmin = Math.min(xmin, premierElement.x1, premierElement.x2)
          xmax = Math.max(xmax, premierElement.x1, premierElement.x2)
          ymin = Math.min(ymin, premierElement.y1, premierElement.y2)
          ymax = Math.max(ymax, premierElement.y1, premierElement.y2)
          return trouveExtrem(xmin, ymin, xmax, ymax, ...pointsOuSegment)
        } else if (premierElement instanceof PointAbstrait) {
          xmin = Math.min(xmin, premierElement.x)
          xmax = Math.max(xmax, premierElement.x)
          ymin = Math.min(ymin, premierElement.y)
          ymax = Math.max(ymax, premierElement.y)
          return trouveExtrem(xmin, ymin, xmax, ymax, ...pointsOuSegment)
        } else {
          return trouveExtrem(xmin, ymin, xmax, ymax, ...pointsOuSegment)
        }
      }
    }
    this.bordures = trouveExtrem(
      1000,
      1000,
      -1000,
      -1000,
      ...(args as (PointAbstrait | Segment)[]),
    ) as unknown as [number, number, number, number]
  }

  svg(coeff: number) {
    let code = ''
    if (Array.isArray(this.args[0])) {
      // Si on donne un tableau de points
      for (let i = 0; i < this.args[0].length - 1; i++) {
        const codage = codageSegment(
          this.args[0][i],
          this.args[0][i + 1],
          this.mark,
          this.stringColor,
          this.echelle,
        )
        code += codage.svg(coeff)
        code += '\n'
      }
      const codage = codageSegment(
        this.args[0][this.args[0].length - 1],
        this.args[0][0],
        this.mark,
        this.stringColor,
        this.echelle,
      )
      code += codage.svg(coeff)
      code += '\n'
    } else if (this.args[0].constructor === Segment) {
      for (
        let i = 0;
        i < (this.isEchelle ? this.args.length - 1 : this.args.length);
        i++
      ) {
        const codage = codageSegment(
          (this.args[i] as Segment).extremite1,
          (this.args[i] as Segment).extremite2,
          this.mark,
          this.stringColor,
          this.echelle,
        )
        code += codage.svg(coeff)
        code += '\n'
      }
    } else {
      for (
        let i = 0;
        i < (this.isEchelle ? this.args.length - 1 : this.args.length);
        i += 2
      ) {
        if (
          [this.args[i], this.args[i + 1]].every(
            (p) => p instanceof PointAbstrait,
          )
        ) {
          const codage = codageSegment(
            this.args[i] as PointAbstrait,
            this.args[i + 1] as PointAbstrait,
            this.mark,
            this.stringColor,
            this.echelle,
          )
          code += codage.svg(coeff)
          code += '\n'
        }
      }
    }
    code = `<g id="${this.id}">${code}</g>`
    return code
  }

  tikz() {
    let code = ''
    if (Array.isArray(this.args[0])) {
      // Si on donne une liste de points
      for (let i = 0; i < this.args[0].length - 1; i++) {
        code += codageSegment(
          this.args[0][i],
          this.args[0][i + 1],
          this.mark,
          this.stringColor,
          this.echelle,
        ).tikz()
        // code += '\n'
      }
      code += codageSegment(
        this.args[0][this.args[0].length - 1],
        this.args[0][0],
        this.mark,
        this.stringColor,
      ).tikz()
      // code += '\n'
    } else if (this.args[0].constructor === Segment) {
      const condition = this.isEchelle ? this.args.length - 1 : this.args.length
      for (let i = 0; i < condition; i++) {
        code += codageSegment(
          (this.args[i] as Segment).extremite1,
          (this.args[i] as Segment).extremite2,
          this.mark,
          this.stringColor,
        ).tikz()
        //   code += '\n'
      }
    } else {
      const condition = this.isEchelle ? this.args.length - 1 : this.args.length
      for (let i = 0; i < condition; i += 2) {
        if (
          [this.args[i], this.args[i + 1]].every(
            (p) => p instanceof PointAbstrait,
          )
        ) {
          code += codageSegment(
            this.args[i] as PointAbstrait,
            this.args[i + 1] as PointAbstrait,
            this.mark,
            this.stringColor,
            this.echelle,
          ).tikz()
          // code += '\n'
        }
      }
    }
    return code
  }
}
/**
 * Code plusieurs segments de la même façon
 * @param {string} [mark = '||'] Symbole posé sur le segment
 * @param {string} [color = 'black'] Couleur du symbole : : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {PointAbstrait[]|Segments|number} args Les segments différement codés + Taille relative du codage. Voir exemples.
 * @example codageSegments('×',bleuMathalea,A,B, B,C, C,D) // Code les segments [AB], [BC] et [CD] avec une croix bleue
 * @example codageSegments('×',bleuMathalea,A,B, B,C, C,D, 1.2) // Code les segments [AB], [BC] et [CD] avec une croix bleue et une taille de 1.2
 * @example codageSegments('×',bleuMathalea,[A,B,C,D]) // Code les segments [AB], [BC], [CD] et [DA] (attention, chemin fermé, pratique pour des polygones pas pour des lignes brisées)
 * @example codageSegments('×',bleuMathalea,[A,B,C,D],1.5) // Code les segments [AB], [BC], [CD] et [DA] (attention, chemin fermé, pratique pour des polygones pas pour des lignes brisées) et une taille de la marque de 1.5
 * @example codageSegments('×',bleuMathalea,s1,s2,s3) // Code les segments s1, s2 et s3 avec une croix bleue
 * @example codageSegments('×',bleuMathalea,p.listePoints) // Code tous les segments du polygone avec une croix bleue
 * @author Rémi Angot
 * @return {CodageSegments}
 */
// JSDOC Validee par EE Juin 2022

export function codageSegments(mark = '||', color = 'black', ...args: any[]) {
  return new CodageSegments(mark, color, ...args)
}
