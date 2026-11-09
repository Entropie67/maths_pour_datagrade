import { context } from '../../../modules/context'
import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import { polygone, polygoneAvecNom } from '../../2d/polygones'
import { estDansQuadrilatere, longueur } from '../../2d/utilitairesGeometriques'
import { arrondi } from '../../outils/nombres'
import {
  arete3d,
  point3d,
  Point3d,
  polygone3d,
  translation3d,
  vecteur3d,
} from './elementsEtTransformations3d'

export class PaveLPH3d extends ObjetMathalea2D {
  constructor(
    x: number,
    y: number,
    z: number,
    c: number,
    l: number,
    p: number,
    h: number,
    color = 'black',
  ) {
    super()
    let A, B, C, D, F, G, H, faceAv, faceTop, faceD
    this.c2d = []
    const vx = vecteur3d(c, 0, 0)
    const vy = vecteur3d(0, c, 0)
    const vz = vecteur3d(0, 0, c)

    for (let i = 0; i < l; i++) {
      for (let j = 0; j < p; j++) {
        for (let k = 0; k < h; k++) {
          A = point3d(x + i * c, y + j * c, z + k * c)
          B = translation3d(A, vx)
          C = translation3d(B, vz)
          D = translation3d(A, vz)
          F = translation3d(B, vy)
          G = translation3d(F, vz)
          H = translation3d(D, vy)
          if (j === 0) {
            faceAv = polygone([A.c2d, B.c2d, C.c2d, D.c2d], color)
            faceAv.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
            this.c2d.push(faceAv)
          }
          if (i === l - 1) {
            faceD = polygone([B.c2d, F.c2d, G.c2d, C.c2d], color)
            faceD.couleurDeRemplissage = colorToLatexOrHTML('darkgray')
            this.c2d.push(faceD)
          }
          if (k === h - 1) {
            faceTop = polygone([D.c2d, C.c2d, G.c2d, H.c2d], color)
            faceTop.couleurDeRemplissage = colorToLatexOrHTML('white')
            this.c2d.push(faceTop)
          }
        }
      }
    }
  }
}
/**
 *
 * @param {number} x coordonnées du sommet en bas à gauche
 * @param {number} y
 * @param {number} z
 * @param {number} c longueur de l'unité
 * @param {number} p profondeur
 * @param {number} l longueur
 * @param {number} h hauteur
 * @param {*} color couleur
 * @returns {PaveLPH3d}
 */
export function paveLPH3d(
  x: number,
  y: number,
  z: number,
  c: number,
  l: number,
  p: number,
  h: number,
  color = 'black',
) {
  return new PaveLPH3d(x, y, z, c, l, p, h, color)
}
/**
 * Classe du pavé : construit le pavé ABCDEFGH dont les arêtes [AB],[AD] et [AE] délimitent 3 faces adjacentes.
 * La gestion des arêtes cachées est prise en compte et n'est pas forcément E.
 * En travaillant sur le signe de context.anglePerspective et sur celui de la hauteur (B.z), on peut avoir une vision de haut, de bas, de gauche, de droite comme dans l'exercice....
 * @param {Point3d} A Sommet du pavé droit
 * @param {Point3d} B Sommet du pavé droit
 * @param {Point3d} D Sommet du pavé droit
 * @param {Point3d} E Sommet du pavé droit
 * @param {boolean} [affichageNom = false] Permet (ou pas) l'affichage du nom des sommets du pavé droit.
 * @param {string} [nom = 'ABCDEFGH'] Nom du pavé droit
 * @property {Point3d[]} sommets Tableau contenant les sommets du pavé droit
 * @property {string} color Couleur des arêtes du pavé droit : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {Polygone3d} base Base ABFE du pavé droit
 * @property {Vecteur3d} hauteur Vecteur AD
 * @property {Arete3d} aretes Tableau contenant les arêtes du pavé droit
 * @property {Array} c2d Contient les commandes à tracer en 2d de cette fonction
 * @author Jean-claude Lhote (optimisé par Éric Elter)
 * @class
 */
export class Pave3d extends ObjetMathalea2D {
  constructor(
    A: Point3d,
    B: Point3d,
    D: Point3d,
    E: Point3d,
    color = 'black',
    affichageNom = false,
    nom = 'ABCDEFGH',
  ) {
    super()
    this.affichageNom = affichageNom
    const v1 = vecteur3d(A, B)
    const v2 = vecteur3d(A, E)
    const C = translation3d(D, v1)
    const H = translation3d(D, v2)
    const G = translation3d(C, v2)
    const F = translation3d(B, v2)

    // Determination du point caché
    function distanceMoyenne4points(pt: Point3d) {
      const dist1 = longueur(pt.c2d, A.c2d, 5)
      const dist2 = longueur(pt.c2d, B.c2d, 5)
      const dist3 = longueur(pt.c2d, C.c2d, 5)
      const dist4 = longueur(pt.c2d, D.c2d, 5)
      return arrondi((dist1 + dist2 + dist3 + dist4) / 4, 5)
    }

    E.isVisible = !estDansQuadrilatere(E.c2d, A.c2d, B.c2d, C.c2d, D.c2d)
    F.isVisible = !estDansQuadrilatere(F.c2d, A.c2d, B.c2d, C.c2d, D.c2d)
    G.isVisible = !estDansQuadrilatere(G.c2d, A.c2d, B.c2d, C.c2d, D.c2d)
    H.isVisible = !estDansQuadrilatere(H.c2d, A.c2d, B.c2d, C.c2d, D.c2d)
    if (E.isVisible && F.isVisible && G.isVisible && H.isVisible) {
      const minimum = Math.min(
        distanceMoyenne4points(E),
        distanceMoyenne4points(F),
        distanceMoyenne4points(G),
        distanceMoyenne4points(H),
      )
      E.isVisible = minimum !== distanceMoyenne4points(E)
      F.isVisible = minimum !== distanceMoyenne4points(F)
      G.isVisible = minimum !== distanceMoyenne4points(G)
      H.isVisible = minimum !== distanceMoyenne4points(H)
    }
    // Fin de determination du point caché
    this.sommets = [A, B, C, D, E, F, G, H]
    this.color = colorToLatexOrHTML(color)
    this.base = polygone3d(A, B, F, E)
    this.hauteur = vecteur3d(A, D)
    this.c2d = []
    this.aretes = [
      arete3d(A, B, color),
      arete3d(A, D, color),
      arete3d(A, E, color),
      arete3d(C, B, color),
      arete3d(F, B, color),
      arete3d(C, D, color),
      arete3d(C, G, color),
      arete3d(F, G, color),
      arete3d(F, E, color),
      arete3d(H, G, color),
      arete3d(H, E, color),
      arete3d(H, D, color),
    ]
    for (const arete of this.aretes) {
      this.c2d.push(arete.c2d)
    }
    if (this.affichageNom) {
      let pointsFace = [A.c2d, B.c2d, C.c2d, D.c2d]
      A.c2d.nom = nom[0]
      B.c2d.nom = nom[1]
      C.c2d.nom = nom[2]
      D.c2d.nom = nom[3]
      E.c2d.nom = nom[4]
      F.c2d.nom = nom[5]
      G.c2d.nom = nom[6]
      H.c2d.nom = nom[7]

      const faceAV = polygoneAvecNom(...pointsFace, context.isHtml ? 0.5 : 1.5)
      pointsFace = [E.c2d, F.c2d, G.c2d, H.c2d]
      const faceArr = polygoneAvecNom(...pointsFace, context.isHtml ? 0.5 : 1.5)
      this.c2d.push(faceAV[1], faceArr[1])
    }
  }
}
/**
 * Construit le pavé ABCDEFGH dont les arêtes [AB],[AD] et [AE] délimitent 3 faces adjacentes.
 * La gestion des arêtes cachées est prise en compte et n'est pas forcément E.
 * En travaillant sur le signe de context.anglePerspective et sur celui de la hauteur (B.z), on peut avoir une vision de haut, de bas, de gauche, de droite comme dans l'exercice....
 * @param {Point3d} A Sommet du pavé droit
 * @param {Point3d} B Sommet du pavé droit
 * @param {Point3d} D Sommet du pavé droit
 * @param {Point3d} E Sommet du pavé droit
 * @param {boolean} [affichageNom = false] Permet (ou pas) l'affichage du nom des sommets du pavé droit.
 * @param {string} [nom = 'ABCDEFGH'] Nom du pavé droit
 * @example pave(A,B,D,E) // Créé un pavé noir sans nom
 * @example pave(A,B,D,E,bleuMathalea) // Créé un pavé bleu sans nom
 * @example pave(A,B,D,E,'red',true,'MNOPQRST') // Créé un pavé rouge dont les sommets sont nommés M, N, O, P, Q, R, S et T
 * @author Jean-claude Lhote (optimisé par Éric Elter)
 * @return {Pave3d}
 */
export function pave3d(
  A: Point3d,
  B: Point3d,
  D: Point3d,
  E: Point3d,
  color = 'black',
  affichageNom = false,
  nom = 'ABCDEFGH',
) {
  return new Pave3d(A, B, D, E, color, affichageNom, nom)
}
