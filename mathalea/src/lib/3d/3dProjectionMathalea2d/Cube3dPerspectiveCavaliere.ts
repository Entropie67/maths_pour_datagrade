import { context } from '../../../modules/context'
import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import { polygone, polygoneAvecNom } from '../../2d/polygones'
import { segment } from '../../2d/segmentsVecteurs'
import { vide2d } from '../../2d/Vide2d'
import {
  point3d,
  translation3d,
  vecteur3d,
} from './elementsEtTransformations3d'

/**
 * Classe du cube : construit le cube d'arète c dont le sommet en bas à gauche a les coordonnées x,y,z
 * (la face avant est dans le plan xz, la face de droite est toujours visible, la face de haut ou du bas est visible selon context.anglePerspective)
 * @param {number} x Abscisse du sommet du cube en bas à gauche
 * @param {number} y Ordonnée du sommet du cube en bas à gauche
 * @param {number} x Altitude du sommet du cube en bas à gauche
 * @param {number} c Longueur de l'arête du cube
 * @param {string} [color = 'black'] Couleur des arêtes du cube : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorAV = 'lightgray'] Couleur de la face avant du cube : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorHautouBas = 'white'] Couleur de la face visible du dessus (ou du dessous) du cube : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorDr = 'darkgray'] Couleur de la face de droite (toujours visible) du cube : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [aretesCachee = true] Si true, les arêtes cachées sont visibles.
 * @param {boolean} [affichageNom = false] Si true, le nom des sommets est affiché
 * @param {string[]} [nom = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']] Nom du cube
 * @property {boolean} affichageNom Si true, le nom des sommets est affiché
 * @property {Point3d[]} sommets Tableau contenant les sommets du cube
 * @property {Array} c2d Contient les commandes à tracer en 2d de cette fonction
 * @author Jean-claude Lhote (Amendée par Éric Elter)
 * @class
 */

export class Cube3d extends ObjetMathalea2D {
  constructor(
    x: number,
    y: number,
    z: number,
    c: number,
    color = 'black',
    colorAV = 'lightgray',
    colorHautouBas = 'white',
    colorDr = 'darkgray',
    aretesCachee = true,
    affichageNom = false,
    nom = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  ) {
    super()
    this.affichageNom = affichageNom
    const A = point3d(x, y, z)
    A.c2d.nom = nom[0]
    const vx = vecteur3d(c, 0, 0)
    const vy = vecteur3d(0, c, 0)
    const vz = vecteur3d(0, 0, c)
    const B = translation3d(A, vx)
    B.c2d.nom = nom[1]
    const C = translation3d(B, vz)
    C.c2d.nom = nom[2]
    const D = translation3d(A, vz)
    D.c2d.nom = nom[3]
    let pointsFace = [A.c2d, B.c2d, C.c2d, D.c2d]
    const faceAV = this.affichageNom
      ? polygoneAvecNom(...pointsFace)
      : polygone(pointsFace, color)
    if (this.affichageNom) faceAV[0].color = colorToLatexOrHTML(color)
    const E = translation3d(A, vy)
    E.c2d.nom = nom[4]
    const F = translation3d(E, vx)
    F.c2d.nom = nom[5]
    const G = translation3d(F, vz)
    G.c2d.nom = nom[6]
    const H = translation3d(D, vy)
    H.c2d.nom = nom[7]
    pointsFace = [E.c2d, F.c2d, G.c2d, H.c2d]
    const faceArr = this.affichageNom
      ? polygoneAvecNom(...pointsFace)
      : vide2d()

    const faceDr = polygone([B.c2d, F.c2d, G.c2d, C.c2d], color)
    let faceVisibleHautOuBas, areteCachee3, areteCachee2, areteCachee1
    if (context.anglePerspective > 0) {
      faceVisibleHautOuBas = polygone([D.c2d, C.c2d, G.c2d, H.c2d], color) // Cette face est en fonction de context.anglePerspective
      areteCachee1 = segment(E.c2d, H.c2d, color)
      areteCachee2 = segment(E.c2d, F.c2d, color)
      areteCachee3 = segment(E.c2d, A.c2d, color)
    } else {
      faceVisibleHautOuBas = polygone([A.c2d, B.c2d, F.c2d, E.c2d], color)
      areteCachee1 = segment(E.c2d, H.c2d, color)
      areteCachee2 = segment(D.c2d, H.c2d, color)
      areteCachee3 = segment(G.c2d, H.c2d, color)
    }
    areteCachee1.pointilles = 2
    areteCachee2.pointilles = 2
    areteCachee3.pointilles = 2

    this.sommets = [A, B, C, D, E, F, G, H]
    // Les 8 sommets sont indispensables pour pouvoir les utiliser ensuite.
    if (aretesCachee) {
      if (Array.isArray(faceAV)) {
        faceAV[0].couleurDeRemplissage = colorToLatexOrHTML(colorAV)
      } else {
        faceAV.couleurDeRemplissage = colorToLatexOrHTML(colorAV)
      }
      faceVisibleHautOuBas.couleurDeRemplissage =
        colorToLatexOrHTML(colorHautouBas)
      faceDr.couleurDeRemplissage = colorToLatexOrHTML(colorDr)
      this.c2d = [
        faceAV.length === 2 ? faceAV[0] : faceAV,
        faceAV.length === 2 ? faceAV[1] : vide2d(),
        faceDr,
        faceVisibleHautOuBas,
      ]
    } else {
      this.c2d = [
        faceAV.length === 2 ? faceAV[0] : faceAV,
        faceAV.length === 2 ? faceAV[1] : vide2d(),
        faceDr,
        faceVisibleHautOuBas,
        faceArr.length === 2 ? faceArr[1] : vide2d(),
        areteCachee1,
        areteCachee2,
        areteCachee3,
      ]
    }
  }
}
/**
 * Crée un cube d'arète c dont le sommet en bas à gauche a les coordonnées x,y,z
 * (la face avant est dans le plan xz, la face de droite est toujours visible, la face de haut ou du bas est visible selon context.anglePerspective)
 * @param {number} x Abscisse du sommet du cube en bas à gauche
 * @param {number} y Ordonnée du sommet du cube en bas à gauche
 * @param {number} x Altitude du sommet du cube en bas à gauche
 * @param {number} c Longueur de l'arête du cube
 * @param {string} [color = 'black'] Couleur des arêtes du cube : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorAV = 'lightgray'] Couleur de la face avant du cube : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorHautouBas = 'white'] Couleur de la face visible du dessus (ou du dessous) du cube : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorDr = 'darkgray'] Couleur de la face de droite (toujours visible) du cube : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [aretesCachee = true] Si true, les arêtes cachées sont visibles.
 * @param {boolean} [affichageNom = false] Si true, le nom des sommets est affiché
 * @param {string[]} [nom = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']] Nom du cube
 * @example cube(0,0,0,10)
 * // Construit un cube noir d'arête 10 dont le sommet en bas à gauche est l'origine du repère et dont les faces visibles sont colorées aux couleurs par défaut.
 * // Les arêtes cachées sont visibles et le cube ne porte pas de nom.
 * @example cube(0,0,0,10,'red','','','',false)
 * // Construit un cube rouge d'arête 10 dont le sommet en bas à gauche est l'origine du repère et dont aucune face n'est coloriée.
 * // Les arêtes cachées sont invisibles et le cube ne porte pas de nom.
 * @example cube(0,0,0,10,'#f15929','','','',trie,true)
 * // Construit un cube orange d'arête 10 dont le sommet en bas à gauche est l'origine du repère et dont aucune face n'est coloriée.
 * // Les arêtes cachées sont visibles et le cube s'appelle ABCDEFGH.
 * @author Jean-claude Lhote (Amendée par Éric Elter)
 * @return {Cube3d}
 */
export function cube3d(
  x: number,
  y: number,
  z: number,
  c: number,
  color = 'black',
  colorAV = 'lightgray',
  colorHautouBas = 'white',
  colorDr = 'darkgray',
  aretesCachee = true,
  affichageNom = false,
  nom = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
) {
  return new Cube3d(
    x,
    y,
    z,
    c,
    color,
    colorAV,
    colorHautouBas,
    colorDr,
    aretesCachee,
    affichageNom,
    nom,
  )
}
