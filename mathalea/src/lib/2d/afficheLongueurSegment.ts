import { context } from '../../modules/context'
import { stringNombre } from '../outils/texNombre'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { texteParPoint } from './textes'
import { rotation } from './transformations'
import { milieu, pointSurSegment } from './utilitairesPoint'

/**
 * Affiche la longueur de [AB] au-dessus si A est le point le plus à gauche sinon au dessous.
 * @param  {PointAbstrait} A Première extrémité du segment
 * @param  {PointAbstrait} B Seconde extrémité du segment
 * @param  {string} [color='black'] Couleur de la longueur affichée : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param  {number} [d=0.5] Distance entre l'affichage de la longueur et le segment.
 * @param  {string} [unite='cm'] Affiche cette unité après la valeur numérique de la longueur.
 * @param  {boolean} [horizontal=false] Si true, alors le texte est horizontal, sinon le texte est parallèle au segment.
 * @param  {number} [precision=1]
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur de la longueur affichée. À associer obligatoirement à colorToLatexOrHTML().
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class AfficheLongueurSegment extends ObjetMathalea2D {
  stringColor: string
  angle: number
  O: PointAbstrait
  M: PointAbstrait
  distance: number
  text: string

  constructor(
    A: PointAbstrait,
    B: PointAbstrait,
    color = 'black',
    d = 0.5,
    unite = 'cm',
    horizontal = false,
    precision = 1,
  ) {
    super()
    this.stringColor = color
    this.O = milieu(A, B)
    this.M = rotation(A, this.O, -90)
    const s = segment(A, B)
    // s.longueur est calculée à partir de coordonnées arrondies au centième : on utilise les points eux-mêmes
    const l = stringNombre(Math.hypot(B.x - A.x, B.y - A.y), precision)
    this.text = `${l}${unite !== '' ? ' ' + unite : ''}`
    this.distance = horizontal ? d - 0.1 + this.text.length / 10 : d
    if (horizontal) {
      this.angle = 0
    } else if (B.x > A.x) {
      this.angle = -s.angleAvecHorizontale
    } else {
      this.angle = 180 - s.angleAvecHorizontale
    }
    this.bordures = [
      this.O.x - 0.5,
      this.O.y - 0.5,
      this.O.x + 0.5,
      this.O.y + 0.5,
    ] // C'est n'importe quoi, mais de toute façon, le segment a ses bordures, lui !
  }

  svg(coeff: number) {
    const N = pointSurSegment(this.O, this.M, (this.distance * 20) / coeff)
    return texteParPoint(
      this.text,
      N,
      this.angle,
      this.stringColor,
      1,
      'milieu',
      false,
    ).svg(coeff)
  }

  tikz() {
    const N = pointSurSegment(this.O, this.M, this.distance / context.scale)
    return texteParPoint(
      this.text,
      N,
      this.angle,
      this.stringColor,
      1,
      'milieu',
      false,
    ).tikz()
  }
}
/**
 * Affiche la longueur de [AB] au-dessus si A est le point le plus à gauche sinon au dessous.
 * @param  {PointAbstrait} A Première extrémité du segment
 * @param  {PointAbstrait} B Seconde extrémité du segment
 * @param  {string} [color='black'] Couleur affichée de la longueur affichée : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param  {number} [d=0.5] Distance entre l'affichage de la longueur et le segment.
 * @param  {string} [unite='cm'] Affiche cette unité après la valeur numérique de la longueur.
 * @param  {boolean} [horizontal=false] Si true, alors le texte est horizontal, sinon le texte est parallèle au segment.
 * @param  {number} [precision=1]
 * @example  afficheLongueurSegment(A,B)
 * // Affiche la longueur du segment [AB] (en noir, à 0,5 "cm" du segment, complétée par l'unité cm et parallèlement au segment).
 * @example  afficheLongueurSegment(A,B,bleuMathalea,1,'mm',true)
 * // Affiche la longueur du segment [AB], en bleu, à 1 "cm" du segment, complétée par l'unité mm et horizontalement.
 * @return {AfficheLongueurSegment}
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022

export function afficheLongueurSegment(
  A: PointAbstrait,
  B: PointAbstrait,
  color = 'black',
  d = 0.5,
  unite = 'cm',
  horizontal = false,
  precision = 1,
) {
  return new AfficheLongueurSegment(
    A,
    B,
    color,
    d,
    unite,
    horizontal,
    precision,
  )
}
