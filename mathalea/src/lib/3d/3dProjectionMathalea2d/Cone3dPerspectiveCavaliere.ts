import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import {
  Point3d,
  Vecteur3d,
  droite3d,
  polygone3d,
  rotation3d,
  translation3d,
  vecteur3d,
} from './elementsEtTransformations3d'
import { pyramide3d } from './Pyramide3dPerspectiveCavaliere'

/**
 * Classe du cône
 * @param {Point3d} centre Centre de la base du cône
 * @param {Point3d} sommet Sommet du cône
 * @param {Vecteur3d} rayon Rayon de la base du cône
 * @param {string} [color = 'black'] Couleur des génératrices visibles et de la base du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageAxe = true] Permet (ou pas) l'affichage de l'axe du cône.
 * @param {string} [colorAxe = 'black'] Couleur de l'axe et du centre de la base du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorCone = 'gray'] Couleur du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} affichageCentre Affiche ou pas le centre du cône.
 * @property {Point3d} centre centre de la base du cône
 * @property {Point3d} sommet Sommet du cône
 * @property {Vecteur3d} rayon Rayon de la base du cône
 * @property {string} color Couleur des génératrices visibles et de la base du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {boolean} affichageAxe Permet (ou pas) l'affichage de l'axe du cône.
 * @property {string} colorAxe Couleur de l'axe et du centre de la base du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {string} colorCone Couleur du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {Array} c2d Contient les commandes à tracer en 2d de cette fonction
 * @author Éric Elter (d'après version précédente de Jean-claude Lhote)
 * @class
 */

export class Cone3d extends ObjetMathalea2D {
  constructor(
    centre: Point3d,
    sommet: Point3d,
    rayon: Vecteur3d,
    color: string = 'black',
    affichageAxe = true,
    colorAxe = 'black',
    colorCone = 'gray',
    affichageCentre = true,
    affichageBase = true,
  ) {
    super()
    this.centre = centre
    this.sommet = sommet
    this.rayon = rayon
    this.color = colorToLatexOrHTML(color)
    this.colorAxe = colorAxe
    this.colorCone = colorCone

    const pt1 = translation3d(this.centre, this.rayon)
    const ptsBase = [pt1]
    const nbSommets = 36
    for (let ee = 1; ee < nbSommets; ee++) {
      ptsBase.push(
        rotation3d(
          pt1,
          droite3d(this.centre, vecteur3d(this.sommet, this.centre)),
          (ee * 360) / nbSommets,
        ),
      )
    }
    const p = polygone3d(ptsBase, this.color[0])
    // this.c2d = pyramide3d(p, this.sommet, this.color, this.centre, affichageAxe, this.colorAxe, false, true, this.colorCone).c2d
    this.c2d = pyramide3d(
      p,
      this.sommet,
      this.color[0],
      affichageCentre ? this.centre : undefined,
      affichageAxe,
      this.colorAxe,
      false,
      true,
      this.colorCone,
      affichageBase,
    ).c2d
  }
}
/**
 * Crée un cône
 * @param {Point3d} centre centre de la base du cône
 * @param {Point3d} sommet Sommet du cône
 * @param {Vecteur3d} rayon Rayon de la base du cône
 * @param {string} [color = 'black'] Couleur des génératrices visibles et de la base du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageAxe = true] Permet (ou pas) l'affichage de l'axe du cône.
 * @param {string} [colorAxe = 'black'] Couleur de l'axe et du centre de la base du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorCone = 'gray'] Couleur du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} affichageCentre Affiche ou pas le centre du cône.
 * @example cone3d(A,B,v) // Créé un cône de centre A, de sommet B et dont le rayon correspond au vecteur v
 * @example cone3d(A,B,v,'red') // Créé un cône de centre A, de sommet B et dont le rayon correspond au vecteur v, la couleur du cône en fil de fer est rouge
 * @example cone3d(A,B,v,'red',true,'green') // Créé un cône de centre A, de sommet B et dont le rayon correspond au vecteur v, la couleur du cône en fil de fer est rouge, l'axe est affiché en vert
 * @example cone3d(A,B,v,'red',true,'green',bleuMathalea) // Créé un cône de centre A, de sommet B et dont le rayon correspond au vecteur v, la couleur du cône en fil de fer est rouge, l'axe est affiché en vert et la face externe du cône est bleue
 * @author Éric Elter
 * @return {Cone3d}
 */
export function cone3d(
  centre: Point3d,
  sommet: Point3d,
  rayon: Vecteur3d,
  color: string = 'black',
  affichageAxe = false,
  colorAxe = 'black',
  colorCone = 'gray',
  affichageCentre = true,
  affichageBase = true,
) {
  return new Cone3d(
    centre,
    sommet,
    rayon,
    color,
    affichageAxe,
    colorAxe,
    colorCone,
    affichageCentre,
    affichageBase,
  )
}
