import { bleuMathalea } from '../../lib/colors'
import { codageBissectrice } from './CodageBissectrice'
import { codageSegments } from './CodageSegment'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { DemiDroite, demiDroite } from './DemiDroite'
import { droite } from './droites'
import type { PointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { traceCompas } from './traceCompas'
import { rotation, symetrieAxiale } from './transformations'
import { angleOriente, longueur, pointEstSur } from './utilitairesGeometriques'
import { pointSurSegment } from './utilitairesPoint'

/**
 * Trace la bissectrice d'un angle, en laissant éventuellement apparents les traits de construction au compas
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} O Sommet de l'angle
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle
 * @param {string} [couleurBissectrice = 'red'] Couleur de la médiatrice : du type 'red', bleuMathalea ou du type '#a12345'. Si 'none' ou '', pas de hachures.
 * @param {string} [color=bleuMathalea] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {string} [couleurConstruction = 'black'] Couleur de la médiatrice : du type 'red', bleuMathalea ou du type '#a12345'. Si 'none' ou '', pas de hachures.
 * @param {boolean} [construction=false] Si construction est true, alors on affiche le codage et aussi les coups de compas utiles à la construction.
 * @param {boolean} [detail=false] Si detail est true, alors on affiche aussi en pointillés les rayons utiles à la construction.
 * @param {string} [mark='×'] Symbole posé sur les arcs
 * @param {number} [tailleLosange = 5] Longueur d'un côté du losange de construction
 * @param {number} [epaisseurBissectrice = 1] Epaisseur de la bissectrice
 * @param {number} [opaciteBissectrice = 1] Taux d'opacité de la bissectrice
 * @param {number} [pointillesBissectrice = 0] Si cette valeur est entre 1 et 5, la bissectrice est en pointillés
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} couleurBissectrice Couleur de la médiatrice : du type 'red', bleuMathalea ou du type '#a12345'. Si 'none' ou '', pas de hachures.
 * @property {string} color Couleur du codage. À associer obligatoirement à colorToLatexOrHTML().
 * @property {string} couleurConstruction Couleur de la médiatrice. À associer obligatoirement à colorToLatexOrHTML(). Si 'none' ou '', pas de hachures.
 * @property {string} mark Symbole posé sur les arcs
 * @property {number} tailleLosange Longueur d'un côté du losange de construction
 * @property {number} epaisseurBissectrice Epaisseur de la bissectrice
 * @property {number} opaciteBissectrice Taux d'opacité de la bissectrice
 * @property {number} pointillesBissectrice Si cette valeur est entre 1 et 5, la bissectrice est en pointillés
 * @author Rémi Angot (amendée par Éric Elter en juin 2022)
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class Bissectrice extends DemiDroite {
  tailleLosange?: number
  mark?: string
  couleurBissectrice?: string
  epaisseurBissectrice?: number
  opaciteBissectrice?: number
  pointillesBissectrice?: number
  couleurConstruction?: string

  constructor(
    A: PointAbstrait,
    O: PointAbstrait,
    B: PointAbstrait,
    couleurBissectrice = 'red',
    color = bleuMathalea,
    couleurConstruction = 'black',
    construction = false,
    detail = false,
    mark = '×',
    tailleLosange = 5,
    epaisseurBissectrice = 1,
    opaciteBissectrice = 1,
    pointillesBissectrice = 0,
  ) {
    const demiangle = angleOriente(A, O, B) / 2
    const m = pointSurSegment(O, A, 3)
    const X = rotation(m, O, demiangle)
    super(O, X, couleurBissectrice)
    this.color = colorToLatexOrHTML(color)
    this.tailleLosange = tailleLosange
    this.mark = mark
    this.couleurBissectrice = couleurBissectrice
    this.epaisseurBissectrice = epaisseurBissectrice
    this.couleurConstruction = couleurConstruction
    this.opaciteBissectrice = opaciteBissectrice
    this.pointillesBissectrice = pointillesBissectrice
    if (longueur(A, O) < 0.001 || longueur(O, B) < 0.001)
      window.notify('Bissectrice : points confondus', { A, O, B })
    // Construction de la bissectrice
    const d = demiDroite(O, X, couleurBissectrice)
    d.epaisseur = epaisseurBissectrice
    d.opacite = opaciteBissectrice
    d.pointilles = pointillesBissectrice
    this.objets = [d]
    const M = pointSurSegment(O, A, this.tailleLosange)
    const N = pointSurSegment(O, B, this.tailleLosange)
    const dMN = droite(M, N)
    const P = symetrieAxiale(O, dMN) as PointAbstrait
    if (construction || detail) {
      if (!pointEstSur(M, segment(O, A))) {
        const sOM = segment(O, M, this.couleurConstruction)
        this.objets.push(sOM)
      }
      if (!pointEstSur(N, segment(O, B))) {
        const sON = segment(O, N, this.couleurConstruction)
        this.objets.push(sON)
      }
      if (construction) {
        const codage = codageBissectrice(A, O, B, color, mark)
        const tNP = traceCompas(N, P, 20, this.couleurConstruction)
        const tMP = traceCompas(M, P, 20, this.couleurConstruction)
        const tOM = traceCompas(O, M, 20, this.couleurConstruction)
        const tON = traceCompas(O, N, 20, this.couleurConstruction)
        this.objets.push(codage, tNP, tMP, tOM, tON)
      }
      if (detail) {
        const sMP = segment(M, P, this.couleurConstruction)
        const sNP = segment(N, P, this.couleurConstruction)
        sMP.pointilles = 5
        sNP.pointilles = 5
        const codes = codageSegments(this.mark, color, O, M, M, P, O, N, N, P)
        this.objets.push(sMP, sNP, codes)
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
 * Trace la bissectrice d'un angle, en laissant éventuellement apparents les traits de construction au compas
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} O Sommet de l'angle
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle
 * @param {string} [couleurBissectrice = 'red'] Couleur de la médiatrice : du type 'red', bleuMathalea ou du type '#a12345' Si 'none' ou '', pas de hachures.
 * @param {string} [color=bleuMathalea] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {string} [couleurConstruction = 'black'] Couleur de la médiatrice : du type 'red', bleuMathalea ou du type '#a12345' Si 'none' ou '', pas de hachures.
 * @param {boolean} [construction=false] Si construction est true, alors on affiche le codage et aussi les coups de compas utiles à la construction.
 * @param {boolean} [detail=false] Si detail est true, alors on affiche aussi en pointillés les rayons utiles à la construction.
 * @param {string} [mark='×'] Symbole posé sur les arcs
 * @param {number} [tailleLosange = 5] Longueur d'un côté du losange de construction
 * @param {number} [epaisseurBissectrice = 1] Epaisseur de la bissectrice
 * @param {number} [opaciteBissectrice = 1] Taux d'opacité de la bissectrice
 * @param {number} [pointillesBissectrice = 0] Si cette valeur est entre 1 et 5, la bissectrice est en pointillés
 * @example bissectrice(N,R,J)
 * // Trace, en rouge, la bissectrice de l'angle NRJ, d'épaisseur 1 et d'opacité 100 %, sans autre option
 * @example bissectrice(N,R,J,bleuMathalea)
 * // Trace, en bleu, la bissectrice de l'angle NRJ, d'épaisseur 1 et d'opacité 100 %, sans autre option
 * @example bissectrice(N,R,J,bleuMathalea,'red','green',true,true,'||',6,2,0.5,3)
 * // Trace, en rouge, la bissectrice de l'angle NRJ, d'épaisseur 1 et d'opacité 100 %. Les traits de construction sont dessinés en vert avec les marques '||' en rouge.
 * @author Rémi Angot (amendée par Éric Elter en juin 2022)
 * @return {Bissectrice}
 */
// JSDOC Validee par EE Juin 2022

export function bissectrice(
  A: PointAbstrait,
  O: PointAbstrait,
  B: PointAbstrait,
  couleurBissectrice = 'red',
  color = bleuMathalea,
  couleurConstruction = 'black',
  construction = false,
  detail = false,
  mark = '×',
  tailleLosange = 5,
  epaisseurBissectrice = 1,
  opaciteBissectrice = 1,
  pointillesBissectrice = 0,
) {
  return new Bissectrice(
    A,
    O,
    B,
    couleurBissectrice,
    color,
    couleurConstruction,
    construction,
    detail,
    mark,
    tailleLosange,
    epaisseurBissectrice,
    opaciteBissectrice,
    pointillesBissectrice,
  )
}
