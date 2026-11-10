import { context } from '../../../modules/context'
import {
  assombrirOuEclaircir,
  colorToLatexOrHTML,
  type ColourNames,
} from '../../2d/colorToLatexOrHtml'
import { distancePointDroite, droite } from '../../2d/droites'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import type { PointAbstrait } from '../../2d/PointAbstrait'
import { polygone } from '../../2d/polygones'
import { segment } from '../../2d/segmentsVecteurs'
import { tracePoint } from '../../2d/TracePoint'
import { translation } from '../../2d/transformations'
import { pointIntersectionDD } from '../../2d/utilitairesPoint'
import { cross, dot, vecteur } from '../../2d/Vecteur'
import {
  demicercle3d,
  droite3d,
  Point3d,
  rotation3d,
  translation3d,
  Vecteur3d,
  vecteur3d,
} from './elementsEtTransformations3d'

/**
 * Classe du cylindre : un cylindre de révolution défini par les centres de ses 2 bases
 * Permet en faisant varier les rayons des deux bases de créer des troncs de cônes (A VERIFIER)
 * @param {Point3d} centrebase1 Centre de la première base
 * @param {Point3d} centrebase2 Centre de la seconde base
 * @param {Vecteur3d} rayon1 Vecteur correspondant au rayon de la première base
 * @param {Vecteur3d} rayon2 Vecteur correspondant au rayon de la seconde base
 * @param {string} [color = 'black'] Couleur des "bords" du cylindre : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageGeneratrices = true] Permet (ou pas) l'affichage de génératrices du cylindre
 * @param {boolean} [affichageCentreBases = false] Permet (ou pas) l'affichage des centres respectifs de chaque base
 * @param {boolean} [affichageAxe = false] Permet (ou pas) l'affichage de l'axe du cylindre
 * @param {string} [colorAxe = 'black'] Couleur de l'axe et des centres respectifs de chaque base du cylindre : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [cylindreColore = false] Permet (ou pas) de colorier le cylindre
 * @param {string} [colorCylindre = 'lightgray'] Couleur du cylindre (avec gestion intégrée de la nuance de couleurs): du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [avecFaceHaut = true] Permet (ou pas) d'afficher la face haut du cylindre
 * @property {Point3d} centrebase1 Centre de la première base
 * @property {Point3d} centrebase2 Centre de la seconde base
 * @property {Vecteur3d} rayon1 Vecteur correspondant au rayon de la première base
 * @property {Vecteur3d} rayon2 Vecteur correspondant au rayon de la seconde base
 * @property {string} color Couleur des "bords" du cylindre : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {boolean} affichageGeneratrices Permet (ou pas) l'affichage de génératrices du cylindre
 * @property {boolean} affichageCentreBases Permet (ou pas) l'affichage des centres respectifs de chaque base
 * @property {boolean} affichageAxe Permet (ou pas) l'affichage de l'axe du cylindre
 * @property {string} colorAxe Couleur de l'axe et des centres respectifs de chaque base du cylindre : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {boolean} cylindreColore Permet (ou pas) de colorier le cylindre
 * @property {string} colorCylindre Couleur du cylindre (avec gestion intégrée de la nuance de couleurs): du type 'red', bleuMathalea ou du type '#f15929'
 * @property {number} angleDepart Angle de rotation à partir duquel les demis-cercles formant la base sont tracés
 * @property {Points[]} pointsBase1 Liste des points formant la ligne de la base 1
 * @property {Points[]} pointsBase2 Liste des points formant la ligne de la base 2
 * @property {Array} c2d Contient les commandes à tracer en 2d de cette fonction
 * @author Jean-claude Lhote (optimisé par Éric Elter)
 * @class
 */

export class Cylindre3d extends ObjetMathalea2D {
  normal: Vecteur3d
  centrebase1: Point3d
  centrebase2: Point3d
  pointsBase1: PointAbstrait[]
  pointsBase2: PointAbstrait[]
  rayon1: Vecteur3d
  rayon2: Vecteur3d
  color: [string, string]
  affichageGeneratrices: boolean
  affichageCentreBases: boolean
  affichageAxe: boolean
  colorAxe: string
  cylindreColore: boolean
  colorCylindre: string
  angleDepart: number
  c2d: ObjetMathalea2D[]
  constructor(
    centrebase1: Point3d,
    centrebase2: Point3d,
    rayon1: Vecteur3d,
    rayon2: Vecteur3d,
    color: string = 'black',
    affichageGeneratrices = true,
    affichageCentreBases = false,
    affichageAxe = false,
    colorAxe = 'black',
    cylindreColore = false,
    colorCylindre = 'lightgray',
    avecFaceHaut = true,
  ) {
    super()
    this.centrebase1 = centrebase1
    this.centrebase2 = centrebase2
    this.rayon1 = rayon1
    this.rayon2 = rayon2
    this.color = colorToLatexOrHTML(color)
    this.affichageGeneratrices = affichageGeneratrices
    this.affichageCentreBases = affichageCentreBases
    this.affichageAxe = affichageAxe
    this.colorAxe = colorAxe
    this.cylindreColore = cylindreColore
    this.colorCylindre = colorCylindre
    this.c2d = []
    let s
    this.normal = vecteur3d(this.centrebase1, this.centrebase2)
    const coords = cross(this.normal.matrice, this.rayon1.matrice) as number[]
    const coordsArray = coords as any as number[]
    const prodvec = vecteur3d(coordsArray[0], coordsArray[1], coordsArray[2])
    const prodscal = dot(prodvec.matrice, vecteur3d(0, 1, 0).matrice) as number

    let cote1, cote2
    const centre1PlusBasQueCentre2 =
      this.centrebase1.c2d.y !== this.centrebase2.c2d.y
        ? this.centrebase1.c2d.y < this.centrebase2.c2d.y
        : context.anglePerspective > 0
    if (prodscal * context.anglePerspective > 0) {
      cote1 = centre1PlusBasQueCentre2 ? 'direct' : 'indirect'
      cote2 = centre1PlusBasQueCentre2 ? 'indirect' : 'direct'
    } else {
      cote2 = centre1PlusBasQueCentre2 ? 'direct' : 'indirect'
      cote1 = centre1PlusBasQueCentre2 ? 'indirect' : 'direct'
    }
    cote2 = this.rayon1.x === 0 && this.rayon1.y === 0 ? 'indirect' : cote2
    cote1 = this.rayon1.x === 0 && this.rayon1.y === 0 ? 'direct' : cote1
    // Cette partie permet de chercher le bon angle de départ pour le tracé des demi-bases
    // Recherche du premier point visible sur la demi-base visible
    let angleDepart = 0
    let distanceMax = 0
    const d = droite3d(this.centrebase1, this.normal)
    let ptReference = rotation3d(
      translation3d(this.centrebase1, this.rayon1),
      d,
      angleDepart,
    )
    const secondPt = rotation3d(
      translation3d(this.centrebase1, this.rayon1),
      d,
      angleDepart + 1,
    )
    const sensRecherche =
      distancePointDroite(ptReference.c2d, d.c2d) <
      distancePointDroite(secondPt.c2d, d.c2d)
        ? 1
        : -1
    while (distancePointDroite(ptReference.c2d, d.c2d) > distanceMax) {
      distanceMax = distancePointDroite(ptReference.c2d, d.c2d)
      angleDepart = angleDepart + sensRecherche
      ptReference = rotation3d(
        translation3d(this.centrebase1, this.rayon1),
        d,
        angleDepart,
      )
    }
    angleDepart = angleDepart - sensRecherche
    // angleDepart est donc l'angle qui permet d'avoir un tracé de demicercle3d idéal
    this.angleDepart = angleDepart
    // Description de chaque demi-base en position verticale
    // c1 : cercle bas derrière
    const c1 = demicercle3d(
      this.centrebase1,
      this.normal,
      this.rayon1,
      cote1,
      true,
      this.color[0],
      angleDepart,
    )
    // c3 : cercle haut derrière
    const c3 = demicercle3d(
      this.centrebase2,
      this.normal,
      this.rayon2,
      cote1,
      false,
      this.color[0],
      angleDepart,
    )
    // c2 : cercle bas devant
    const c2 = demicercle3d(
      this.centrebase1,
      this.normal,
      this.rayon1,
      cote2,
      false,
      this.color[0],
      angleDepart,
    )
    // c4 : cercle haut devant
    const c4 = demicercle3d(
      this.centrebase2,
      this.normal,
      this.rayon2,
      cote2,
      false,
      this.color[0],
      angleDepart,
    )
    this.pointsBase1 = [...c1.listePoints, ...c2.listePoints]
    this.pointsBase2 = [...c3.listePoints, ...c4.listePoints]
    if (this.cylindreColore) {
      let polygon = [...c4.listePoints]
      for (let i = c2.listePoints.length - 1; i >= 0; i--) {
        polygon.push(c2.listePoints[i])
      }
      const faceColoree = polygone(polygon, 'white')
      faceColoree.couleurDeRemplissage = colorToLatexOrHTML(this.colorCylindre)
      this.c2d.push(faceColoree)

      polygon = [...c3.listePoints]
      for (let i = c4.listePoints.length - 1; i >= 0; i--) {
        polygon.push(c4.listePoints[i])
      }
      const baseColoree = polygone(polygon, 'white')
      baseColoree.couleurDeRemplissage = colorToLatexOrHTML(
        assombrirOuEclaircir(this.colorCylindre as ColourNames, 25),
      )
      this.c2d.push(baseColoree)
    }

    if (this.affichageGeneratrices) {
      for (let i = 1; i < c1.listePoints.length - 1; i += 2) {
        s = segment(c3.listePoints[i], c1.listePoints[i], this.color[0])
        s.pointilles = 2
        s.opacite = 0.3
        this.c2d.push(s)
      }
    }

    s = segment(c4.listePoints[0], c2.listePoints[0], this.color[0])
    this.c2d.push(s)

    if (this.affichageGeneratrices) {
      for (let i = 1; i < c2.listePoints.length - 1; i++) {
        s = segment(c4.listePoints[i], c2.listePoints[i], this.color[0])
        this.c2d.push(s)
      }
    }

    s = segment(
      c4.listePoints[c2.listePoints.length - 1],
      c2.listePoints[c2.listePoints.length - 1],
      this.color[0],
    )
    this.c2d.push(s)

    this.c2d.push(c1, c2)
    if (avecFaceHaut) this.c2d.push(c3, c4)

    if (this.affichageCentreBases) {
      this.c2d.push(
        tracePoint(this.centrebase1.c2d, this.centrebase2.c2d, this.colorAxe),
      )
    }

    if (this.affichageAxe) {
      let distanceMin = 9999
      const pt = c2.listePoints
      let i = 0
      const axeCylindre = droite(this.centrebase2.c2d, this.centrebase1.c2d)
      while (distancePointDroite(pt[i], axeCylindre) < distanceMin) {
        distanceMin = distancePointDroite(pt[i], d.c2d)
        i++
      }
      s = segment(this.centrebase2.c2d, this.centrebase1.c2d, this.colorAxe)
      s.pointilles = 2
      s.opacite = 0.7
      this.c2d.push(s)

      // Construction de l'extension de l'axe
      s = droite(pt[i], pt[i - 1])
      const ptAxe1 = pointIntersectionDD(s, axeCylindre)
      if (!ptAxe1) {
        window.notify('Axe du cylindre non défini correctement', {
          s,
          axeCylindre,
        })
        return
      }
      s = segment(this.centrebase1.c2d, ptAxe1, this.colorAxe)
      s.pointilles = 2
      s.opacite = 0.7
      this.c2d.push(s)
      s = segment(
        translation(ptAxe1, vecteur(this.centrebase1.c2d, ptAxe1)),
        ptAxe1,
        this.colorAxe,
      )
      s.opacite = 0.7
      this.c2d.push(s)

      const ptAxe2 = translation(
        this.centrebase2.c2d as PointAbstrait,
        vecteur(
          translation(ptAxe1, vecteur(this.centrebase1.c2d, ptAxe1)),
          this.centrebase1.c2d,
        ),
      )
      s = segment(ptAxe2, this.centrebase2.c2d)
      s.opacite = 0.7
      this.c2d.push(s)
    }
  }
}
/**
 * Crée un cylindre de révolution défini par les centres de ses 2 bases
 * Permet en faisant varier les rayons des deux bases de créer des troncs de cônes (A VERIFIER)
 * @param {Point3d} centrebase1 Centre de la première base
 * @param {Point3d} centrebase2 Centre de la seconde base
 * @param {Vecteur3d} rayon1 Vecteur correspondant au rayon de la première base
 * @param {Vecteur3d} rayon2 Vecteur correspondant au rayon de la seconde base
 * @param {string} [color = 'black'] Couleur des "bords" du cylindre : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageGeneratrices = true] Permet (ou pas) l'affichage de génératrices du cylindre
 * @param {boolean} [affichageCentreBases = false] Permet (ou pas) l'affichage des centres respectifs de chaque base
 * @param {boolean} [affichageAxe = false] Permet (ou pas) l'affichage de l'axe du cylindre
 * @param {string} [colorAxe = 'black'] Couleur de l'axe et des centres respectifs de chaque base du cylindre : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [cylindreColore = false] Permet (ou pas) de colorier le cylindre
 * @param {string} [colorCylindre = 'lightgray'] Couleur du cylindre (avec gestion intégrée de la nuance de couleurs): du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [avecFaceHaut = true] Permet (ou pas) d'afficher la face haut du cylindre
 * @example cylindre3d(A, B, v, v, bleuMathalea)
 * // Retourne un cylindre à bords bleus dont les bases ont pour centre respectif A et B et le rayon est donné par le vecteur v.
 * @example cylindre3d(A, B, v, v, 'green', false, true, true, 'red', true, 'lightblue')
 * // Retourne un cylindre à bords verts dont les bases ont pour centre respectif A et B et le rayon est donné par le vecteur v.
 * // Les génératrices sont invisibles, les centres et axe sont visibles et rouges, le cylindre est coloré en bleu.
 * @author Jean-claude Lhote (optimisé par Éric Elter)
 * @return {Cylindre3d}
 */
export function cylindre3d(
  centrebase1: Point3d,
  centrebase2: Point3d,
  rayon: Vecteur3d,
  rayon2: Vecteur3d,
  color: string = 'black',
  affichageGeneratrices = true,
  affichageCentreBases = false,
  affichageAxe = false,
  colorAxe = 'black',
  cylindreColore = false,
  colorCylindre = 'lightgray',
  avecFaceHaut = true,
) {
  return new Cylindre3d(
    centrebase1,
    centrebase2,
    rayon,
    rayon2,
    color,
    affichageGeneratrices,
    affichageCentreBases,
    affichageAxe,
    colorAxe,
    cylindreColore,
    colorCylindre,
    avecFaceHaut,
  )
}
