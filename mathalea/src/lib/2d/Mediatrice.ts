import { bleuMathalea } from '../../lib/colors'
import { codageMediatrice } from './CodageMediatrice'
import { codageSegments } from './CodageSegment'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { Droite } from './droites'
import type { IDroite } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { traceCompas } from './traceCompas'
import { rotation } from './transformations'
import { longueur } from './utilitairesGeometriques'
import { milieu, pointSurSegment } from './utilitairesPoint'

/**
 * Trace la médiatrice d'un segment, en laissant éventuellement apparents les traits de construction au compas
 * @param {PointAbstrait} A Première extrémité du segment
 * @param {PointAbstrait} B Seconde extrémité du segment
 * @param {string} [nom = ''] Nom affiché de la droite
 * @param {string} [couleurMediatrice = 'red'] Couleur de la médiatrice : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {string} [color=bleuMathalea] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {string} [couleurConstruction = 'black'] Couleur des traits de construction : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {boolean} [construction = false] Si construction est true, alors on affiche le codage et aussi les coups de compas utiles à la construction.
 * @param {boolean} [detail = false] Si detail est true, alors on affiche aussi en pointillés les rayons utiles à la construction.
 * @param {string} [markmilieu = 'x'] Symbole posé sur les deux parties du segment
 * @param {string} [markrayons = '||'] Symbole posé sur les quatre rayons (si détail est true)
 * @param {number} [epaisseurMediatrice = 1] Epaisseur de la médiatrice
 * @param {number} [opaciteMediatrice = 1] Taux d'opacité de la médiatrice
 * @param {number} [pointillesMediatrice = 0] Si cette valeur est entre 1 et 5, la médiatrice est en pointillés
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur du codage. À associer obligatoirement à colorToLatexOrHTML().
 * @property {string} couleurMediatrice Couleur de la médiatrice : du type 'red', bleuMathalea ou du type '#a12345'
 * @property {number} epaisseurMediatrice Epaisseur de la médiatrice
 * @property {number} opaciteMediatrice Taux d'opacité de la médiatrice
 * @property {number} pointillesMediatrice Si cette valeur est entre 1 et 5, la médiatrice est en pointillés
 * @property {string} couleurConstruction Couleur des traits de construction : du type 'red', bleuMathalea ou du type '#a12345'.
 * @return {Mediatrice|Droite}
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class Mediatrice extends ObjetMathalea2D implements IDroite {
  couleurMediatrice?: string
  epaisseurMediatrice?: number
  opaciteMediatrice?: number
  pointillesMediatrice?: number
  couleurConstruction?: string
  x1: number
  y1: number
  x2: number
  y2: number
  a: number
  b: number
  c: number
  pente: number
  angleAvecHorizontale: number
  nom: string

  constructor(
    A: PointAbstrait,
    B: PointAbstrait,
    nom = '',
    couleurMediatrice = 'red',
    color = bleuMathalea,
    couleurConstruction = 'black',
    construction = false,
    detail = false,
    markmilieu = '×',
    markrayons = '||',
    epaisseurMediatrice = 1,
    opaciteMediatrice = 1,
    pointillesMediatrice = 0,
  ) {
    super()
    const O = milieu(A, B)
    const m = rotation(A, O, 90)
    const n = rotation(A, O, -90)
    const M = pointSurSegment(O, m, longueur(A, B) * 0.785)
    const N = pointSurSegment(O, n, longueur(A, B) * 0.785)
    const d = new Droite(M, N, nom, couleurMediatrice)
    this.x1 = d.x1
    this.y1 = d.y1
    this.x2 = d.x2
    this.y2 = d.y2
    this.a = d.a
    this.b = d.b
    this.c = d.c
    this.pente = d.pente
    this.nom = d.nom
    this.angleAvecHorizontale = d.angleAvecHorizontale
    if (arguments.length < 5) {
      // Si on n'a que 2 arguments, on retourne juste une Droite
      this.color = colorToLatexOrHTML(couleurMediatrice)
      this.pointilles = pointillesMediatrice
      this.opacite = opaciteMediatrice
      this.epaisseur = epaisseurMediatrice
      return d // Si il n'y a pas s'objets supplémentaires, il faut créer un objet Droite
    } else {
      if (longueur(A, B) < 0.1) {
        window.notify(
          'ConstructionMediatrice : Points trop rapprochés pour créer cet objet',
          {
            A,
            B,
          },
        )
      }
      this.color = colorToLatexOrHTML(color)
      this.couleurMediatrice = couleurMediatrice
      this.epaisseurMediatrice = epaisseurMediatrice
      this.opaciteMediatrice = opaciteMediatrice
      this.pointillesMediatrice = pointillesMediatrice
      this.couleurConstruction = couleurConstruction
      this.epaisseur = 1
      d.epaisseur = this.epaisseurMediatrice
      d.opacite = this.opaciteMediatrice
      d.pointilles = this.pointillesMediatrice
      if (!construction && !detail) return d // Si il n'y a pas s'objets supplémentaires, il faut créer un objet Droite
      this.objets = [d]
      if (construction) {
        const arcm1 = traceCompas(A, M, 20, this.couleurConstruction)
        const arcm2 = traceCompas(B, M, 20, this.couleurConstruction)
        const arcn1 = traceCompas(A, N, 20, this.couleurConstruction)
        const arcn2 = traceCompas(B, N, 20, this.couleurConstruction)
        const codage = codageMediatrice(
          A,
          B,
          this.couleurMediatrice,
          markmilieu,
        )
        this.objets.push(arcm1, arcm2, arcn1, arcn2, d, codage)
      }
      if (detail) {
        const sAM = segment(A, M, this.couleurConstruction)
        sAM.pointilles = 5
        const sBM = segment(B, M, this.couleurConstruction)
        sBM.pointilles = 5
        const sAN = segment(A, N, this.couleurConstruction)
        sAN.pointilles = 5
        const sBN = segment(B, N, this.couleurConstruction)
        sBN.pointilles = 5
        const codes = codageSegments(
          markrayons,
          this.couleurConstruction,
          A,
          M,
          B,
          M,
          A,
          N,
          B,
          N,
        )
        this.objets.push(sAM, sBM, sAN, sBN, codes)
      }
    }
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    code = `<g id="${this.id}">${code}</g>`
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

  svgml(coeff: number, amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.svgml === 'undefined') code += '\n\t' + objet.svg(coeff)
      else code += '\n\t' + objet.svgml(coeff, amp)
    }
    return code
  }

  tikzml(amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.tikzml === 'undefined') code += `\t${objet.tikz()}`
      else code += `\t${objet.tikzml(amp)}`
    }
    return code
  }
}
/**
 * Trace la médiatrice d'un segment, en laissant éventuellement apparents les traits de construction au compas
 * @param {PointAbstrait} A Première extrémité du segment
 * @param {PointAbstrait} B Seconde extrémité du segment
 * @param {string} [nom=''] Nom affiché de la droite
 * @param {string} [couleurMediatrice = 'red'] Couleur de la médiatrice : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {string} [color=bleuMathalea] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {string} [couleurConstruction='black'] Couleur des traits de construction : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {boolean} [construction=false] Si construction est true, alors on affiche le codage et aussi les coups de compas utiles à la construction.
 * @param {boolean} [detail=false] Si detail est true, alors on affiche aussi en pointillés les rayons utiles à la construction.
 * @param {string} [markmilieu='x'] Symbole posé sur les deux parties du segment
 * @param {string} [markrayons='||'] Symbole posé sur les quatre rayons (si détail est true)
 * @param {number} [epaisseurMediatrice = 1] Epaisseur de la médiatrice
 * @param {number} [opaciteMediatrice = 1] Taux d'opacité de la médiatrice
 * @param {number} [pointillesMediatrice = 0] Si cette valeur est entre 1 et 5, la médiatrice est en pointillés
 * @example mediatrice(M,N)
 * // Trace, en rouge, la médiatrice du segment[MN], d'épaisseur 1, avec une opacité de 100 % sans autre option
 * @example mediatrice(M,N,'d',bleuMathalea)
 * // Trace, en bleu, la médiatrice du segment[MN], d'épaisseur 1, avec une opacité de 100 % et qui s'appelle 'd'
 * @example mediatrice(M,N,'',bleuMathalea,'red','green',true,true,'OO','XX',2,0.5,3)
 * // Trace, en bleu, la médiatrice du segment[MN], d'épaisseur 2, avec une opacité de 50 % sans nom
 * // Les traits de construction sont dessinés en vert avec la marque 'OO' pour le segment initial et la marque 'XX' pour les rayons, toutes ces marques étant rouge.
 * @author Rémi Angot {amendée par Éric Elter en juin 2022}
 * @return {Mediatrice|Droite}
 */
// JSDOC Validee par EE Juin 2022

export function mediatrice(
  A: PointAbstrait,
  B: PointAbstrait,
  nom = '',
  couleurMediatrice = 'red',
  color = bleuMathalea,
  couleurConstruction = 'black',
  construction = false,
  detail = false,
  markmilieu = '×',
  markrayons = '||',
  epaisseurMediatrice = 1,
  opaciteMediatrice = 1,
  pointillesMediatrice = 0,
) {
  if (arguments.length < 5) return new Mediatrice(A, B, nom, couleurMediatrice)
  else
    return new Mediatrice(
      A,
      B,
      nom,
      couleurMediatrice,
      color,
      couleurConstruction,
      construction,
      detail,
      markmilieu,
      markrayons,
      epaisseurMediatrice,
      opaciteMediatrice,
      pointillesMediatrice,
    )
}
