import { context } from '../../../modules/context'
import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { Droite, droite } from '../../2d/droites'
import { fixeBordures } from '../../2d/fixeBordures'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from '../../2d/PointAbstrait'
import { Polygone, polygone } from '../../2d/polygones'
import { polyline } from '../../2d/Polyline'
import { representant } from '../../2d/representantVecteur'
import { Segment, segment } from '../../2d/segmentsVecteurs'
import { matriceMultiply, normalize, Vecteur, vecteur } from '../../2d/Vecteur'

/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%% OBJET PARENT %%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/
/*
 * Classe parente de tous les objets de MathALEA2D
 *
 * @author Rémi Angot
 */
// let numId = 0
/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%% OBJETS DE BASE %%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/
/**
 * LE POINT
 *
 * @author Jean-claude Lhote
 * PointAbstrait de l'espace défini par ses trois coordonnées (Si deux sont données seulement, le point est dans le plan XY)
 * le paramètre visible définit si ce point est placé devant (par défaut) ou derrière une surface. Il sera utilisé pour définir la visibilité des arêtes qui en partent
 */

export class Point3d {
  x: number
  y: number
  z: number
  isVisible: boolean
  label: string
  typeObjet: string
  c2d: PointAbstrait
  constructor(
    x: number,
    y: number,
    z: number,
    isVisible: boolean,
    label: string,
    positionLabel: string,
  ) {
    const alpha = (context.anglePerspective * Math.PI) / 180 // context.anglePerspective peut être changé globalement pour modifier la perspective
    const rapport = context.coeffPerspective // idem pour context.coefficientPerspective qui est la réduction sur l'axe y.
    const MT = [
      [1, rapport * Math.cos(alpha), 0],
      [0, rapport * Math.sin(alpha), 1],
    ] // La matrice de projection 3d -> 2d
    this.x = x
    this.y = y
    this.z = z
    this.isVisible = isVisible
    this.label = label
    this.typeObjet = 'point3d'
    const V = [this.x, this.y, this.z]
    const W = matriceMultiply(MT, V)
    this.c2d = pointAbstrait(
      Number(W[0].toFixed(2)),
      Number(W[1].toFixed(2)),
      this.label,
      positionLabel,
    )
  }
}

export function point3d(
  x: number,
  y: number,
  z = 0,
  visible = true,
  label = '',
  positionLabel = 'above left',
) {
  return new Point3d(x, y, z, visible, label, positionLabel)
}
/**
 * LE VECTEUR
 *
 * @author Jean-claude Lhote
 * le vecteur3d est sans doute l'objet le plus important de cette base d'objets
 * On les utilise dans tous les objets complexes et dans toutes les transformations
 * Ils servent notament à définir la direction des plans.
 *
 * 3 usages : vecteur3d(A,B) ou vecteur3d(x,y,z) ou vecteur3d(math.matrix([x,y,z]))
 * A et B sont deux objets de type Point3d
 * x,y et z sont trois nombres
 * la commande math.matrix([x,y,z]) crée une matrice colonne.
 *
 * L'objet créé est de type Vecteur3d
 * sa propriété p2d est un objet Vecteur (2 dimensions : c'est la projection du vecteur)
 * sa propriété this.representant(A) est le dessin du représentant d'origine A.
 * exemples :
 * let v = vecteur3d(3,5,1) -> définit un vecteur de composantes (3;5;1)
 * let w = vecteur(point3d(0,0,0),point3d(1,1,1)) -> définit un vecteur d'origine O et d'extrémité M(1;1;1)
 * let fleche = w.representant(point3d(5,0,0)) -> fleche est un objet 2d qui représente le vecteur w au point (5;0;0)
 */

export class Vecteur3d {
  x: number = 0
  y: number = 0
  z: number = 0
  matrice: [number, number, number]
  norme: number
  c2d: Vecteur
  representant: (A: Point3d) => Segment
  constructor(...args: [Point3d, Point3d] | [number, number, number]) {
    const alpha = (context.anglePerspective * Math.PI) / 180
    const rapport = context.coeffPerspective
    const MT = [
      [1, rapport * Math.cos(alpha), 0],
      [0, rapport * Math.sin(alpha), 1],
    ] // ceci est la matrice de projection 3d -> 2d
    if (args.length === 2) {
      this.x = args[1].x - args[0].x
      this.y = args[1].y - args[0].y
      this.z = args[1].z - args[0].z
    } else if (args.length === 3) {
      this.x = args[0]
      this.y = args[1]
      this.z = args[2]
    }
    this.matrice = [this.x, this.y, this.z] // On exporte cette matrice colonne utile pour les calculs vectoriels qui seront effectués par math
    this.norme = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2) // la norme du vecteur
    const W = matriceMultiply(MT, this.matrice) // voilà comment on obtient les composantes du projeté 2d du vecteur
    this.c2d = vecteur(W[0], W[1]) // this.c2d est l'objet 2d qui représente l'objet 3d this
    this.representant = function (A: Point3d) {
      const B = translation3d(A, this)
      return representant(vecteur(A.c2d, B.c2d), A.c2d) // qui retourne un représentant de vecteur 2d (objet dessiné)
    }
  }
}

export function vecteur3d(
  ...args: [Point3d, Point3d] | [number, number, number]
) {
  return new Vecteur3d(...args)
}
/**
 * L'ARETE
 * @author Jean-Claude lhote
 * Une telle arête est définie par deux points
 * Si l'un des deux points n'est pas visible (propriété visible à false) alors l'arête aura aussi visible à false
 * sa propriété p2d est un segment en pointillé ou en trait plein suivant sa visibilité.
 */

export class Arete3d {
  extremite1: Point3d
  extremite2: Point3d
  color: string
  isVisible: boolean
  c2d: Segment
  constructor(
    point1: Point3d,
    point2: Point3d,
    color: string,
    isVisible: boolean,
  ) {
    this.extremite1 = point1
    this.extremite2 = point2
    this.color = Array.isArray(color) ? color[0] : color // MGu parfois un tableau de couleurs, pasd compatible avec segment.
    this.isVisible = isVisible
    if (!point1.isVisible || !point2.isVisible || !this.isVisible) {
      this.isVisible = false
    } else {
      this.isVisible = true
    }
    this.c2d = segment(point1.c2d, point2.c2d, this.color)
    if (!this.isVisible) {
      this.c2d.pointilles = 2
    } else {
      this.c2d.pointilles = 0
    }
  }
}
// l'arête est visible par défaut sauf si p1 ou p2 sont invisibles

export function arete3d(
  p1: Point3d,
  p2: Point3d,
  color = 'black',
  visible = true,
) {
  return new Arete3d(p1, p2, color, visible)
}
/**
 * LA DROITE
 *
 * @author Jean-claude Lhote
 * Droite de l'espace définie par point et vecteur directeur droite3d(A,v)
 * Droite de l'espace définie par 2 points droite3d(A,B)
 * Les droites servent principalement à définir des axes de rotation dans l'espace
 */
export class Droite3d {
  directeur: Vecteur3d = vecteur3d(0, 0, 1) // le vecteur directeur de la droite
  origine: Point3d
  point: any
  c2d: Droite
  constructor(point3D: Point3d, vecteur3D: Vecteur3d) {
    if (vecteur3D.constructor === Vecteur3d) {
      this.directeur = vecteur3D
    } else if (vecteur3D.constructor === Point3d) {
      this.directeur = vecteur3d(point3D, vecteur3D)
    }
    this.origine = point3D
    const M = translation3d(this.origine, this.directeur)
    this.point = M
    this.c2d = droite(this.origine.c2d, M.c2d) // la droite correspndant à la projection de cette droite dans le plan Mathalea2d
    this.c2d.isVisible = false
  }
}

export function droite3d(point3D: Point3d, vecteur3D: Vecteur3d) {
  return new Droite3d(point3D, vecteur3D)
}

/**
 * Crée un demi-cercle
 * @param {Point3d} centre Centre du demi-cercle
 * @param {Vecteur3d} normal Vecteur normal au demi-cercle
 * @param {Vecteur3d} rayon Vecteur correspondant au rayon
 * @param {string} [sens = 'direct'] Sens de rotation pour créer le demi-cercle ('direct' ou 'indirect")
 * @param {boolean} [estCache = false] Si false, alors le tracé est en trait plein, sinon le tracé est en pointillés
 * @param {string} [color = 'black'] Couleur du demi-cercle : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} [angledepart = context.anglePerspective] Angle en degré entre le vecteur rayon depuis le centre et le point de début de tracé du demi-cercle
 * @example demicercle3d(A,n,v) // Crée un demi-cercle noir en trait plein de centre A, de vecteur normal v, dont le rayon correspond au vecteur v et le sens est direct
 * @example demicercle3d(A,n,v,'indirect',true,'red',0) // Crée un demi-cercle rouge en pointillés de centre A, de vecteur normal v, dont le rayon correspond au vecteur v, le sens est direct et l'angle de départ est 0°.
 * @author Éric Elter (d'après version précédente de Jean-claude Lhote)
 * @return {demiCercle}
 */

export function demicercle3d(
  centre: Point3d,
  normal: Vecteur3d,
  rayon: Vecteur3d,
  sens: string = 'direct',
  estCache: boolean = false,
  color: string = 'black',
  angledepart: number = context.anglePerspective,
) {
  let signe
  const M = []
  const listepoints = []
  const listePoints3d = []
  if (sens === 'direct') {
    signe = 1
  } else {
    signe = -1
  }
  const d = droite3d(centre, normal)
  M.push(rotation3d(translation3d(centre, rayon), d, angledepart))
  listePoints3d.push(M[0])
  listepoints.push(M[0].c2d)

  for (let i = 1; i < 19; i++) {
    M.push(rotation3d(M[i - 1], d, 10 * signe))
    listePoints3d.push(M[i])
    listepoints.push(M[i].c2d)
  }
  const demiCercle = polyline(listepoints, color)
  if (estCache) {
    demiCercle.pointilles = 2
    demiCercle.opacite = 0.9
  }
  return demiCercle
}
/**
 * L'ARC
 *
 *@author Mickael Guironnet
 * Le nom est trompeur, il s'agit le plus souvent d'un morceau d'ellipse représentant un arc projeté
 * Utilisé pour représenter un arc dont une moitié est visible mais pas l'autre.
 *
 * normal et rayon sont deux vecteurs 3d
 * normal est un vecteur normal au plan du cercle
 * rayon est le vecteur qui part du centre et qui joint la 1ere extremité visible.
 * cote est soit 'caché' soit 'visible'
 *
 */

export function arc3d(
  centre: Point3d,
  normal: Vecteur3d,
  rayon: Vecteur3d,
  cote: 'visible' | 'caché',
  color: string,
  angledepart: number,
  angledefin: number,
) {
  const M = []
  const listepoints = []
  const d = droite3d(centre, normal)
  M.push(rotation3d(translation3d(centre, rayon), d, angledepart))
  listepoints.push(M[0].c2d)

  const nbr = Math.floor((angledefin - angledepart) / 10)
  for (let i = 1; i <= nbr; i++) {
    M.push(rotation3d(M[i - 1], d, 10))
    listepoints.push(M[i].c2d)
  }
  const arc = polyline(listepoints, color)
  if (cote === 'caché') {
    arc.pointilles = 2
    arc.opacite = 0.3
  }
  return arc
}
/**
 * LE CERCLE
 *
 * @author Jean-claude Lhote
 *
 * C'est la version entière du cercle : soit totalement visible, soit totalement caché.
 * visible est un booléen
 *
 */

export function cercle3d(
  centre: Point3d,
  normal: Vecteur3d,
  rayon: Vecteur3d,
  visible: boolean = true,
  color: string = 'black',
  pointilles: boolean = false,
): [Polygone, Point3d[], PointAbstrait[]] {
  const M: Point3d[] = []
  const listepoints: PointAbstrait[] = []
  const listepoints3d: Point3d[] = []
  const d = droite3d(centre, normal)
  M.push(rotation3d(translation3d(centre, rayon), d, context.anglePerspective))
  listepoints3d.push(M[0])
  listepoints.push(M[0].c2d)
  for (let i = 1; i < 36; i++) {
    M.push(rotation3d(M[i - 1], d, 10))
    listepoints3d.push(M[i])
    listepoints.push(M[i].c2d)
  }
  const C = polygone(listepoints, color)
  C.isVisible = visible
  if (pointilles) {
    C.pointilles = 2
  }
  return [C, listepoints3d, listepoints]
}
/**
 * LE POLYGONE
 *
 * @author Jean-claude Lhote
 * usages : polygone3d([A,B,C,...],color) ou polygone3d(A,B,C...) où A,B,C ... sont des point3d. color='black' par défaut.
 */
export class Polygone3d {
  listePoints: Point3d[]
  color: string = 'black'
  listePoints2d: PointAbstrait[]
  aretes: Arete3d[]
  c2d: Segment[]
  constructor(...args: [Point3d[], string] | Point3d[]) {
    if (Array.isArray(args[0])) {
      // Si le premier argument est un tableau
      this.listePoints = args[0]
      if (typeof args[1] === 'string' && args[1] !== '') {
        this.color = args[1]
      }
    } else {
      this.listePoints = args.filter((arg) => arg instanceof Point3d)
      this.color = 'black'
    }
    const segments3d = []
    let A
    const segments = []
    A = this.listePoints[0]
    this.listePoints2d = [A.c2d]
    for (let i = 1; i < this.listePoints.length; i++) {
      segments3d.push(
        arete3d(
          A,
          this.listePoints[i],
          this.color,
          A.isVisible && this.listePoints[i].isVisible,
        ),
      )
      segments.push(segments3d[i - 1].c2d)
      A = this.listePoints[i]
      this.listePoints2d.push(A.c2d)
    }
    segments3d.push(
      arete3d(
        A,
        this.listePoints[0],
        this.color,
        A.isVisible && this.listePoints[0].isVisible,
      ),
    )
    segments.push(segments3d[this.listePoints.length - 1].c2d)
    this.aretes = segments3d
    this.c2d = segments
  }
}

export function polygone3d(
  ...args: [Point3d[], string] | Point3d[]
): Polygone3d {
  return new Polygone3d(...args)
}

/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%% TRANSFORMATIONS%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/
/**
 * LA ROTATION VECTORIELLE
 *
 * @author Jean-claude Lhote
 * Cette rotation se distingue de la rotation d'axe (d) par le fait qu'on tourne autour d'une droite vectorielle
 * Elle sert à faire tourner des vecteurs essentiellement.
 * Si on l'utilise sur un point, alors il tournera autour d'une droite passant par l'origine.
 *
 * @param {*} point3D pour l'instant, cette fonction ne fait tourner qu'un point3d ou un vecteur3d
 * @param {*} vecteur3D vecteur directeur de l'axe de rotation (l'axe passe par l'origine, pour tourner autour d'une droite particulière on utilise rotation3d())
 * @param {*} angle Angle de rotation
 */

export function rotationV3d<T extends Point3d | Vecteur3d>(
  point3D: T,
  vecteur3D: Vecteur3d,
  angle: number,
): T {
  let V, p2
  const unitaire = normalize(vecteur3D.matrice) as number[] // on normalise le vecteur directeur de l'axe de rotation pour faire les calculs de rotation vectorielle
  const u = unitaire[0]
  const v = unitaire[1]
  const w = unitaire[2]
  const c = Math.cos((angle * Math.PI) / 180)
  const s = Math.sin((angle * Math.PI) / 180)
  const k = 1 - c
  const matrice = [
    [u * u * k + c, u * v * k - w * s, u * w * k + v * s],
    [u * v * k + w * s, v * v * k + c, v * w * k - u * s],
    [u * w * k - v * s, v * w * k + u * s, w * w * k + c],
  ]
  if (point3D instanceof Point3d) {
    V = [point3D.x, point3D.y, point3D.z]
    p2 = matriceMultiply(matrice, V)
    return point3d(p2[0], p2[1], p2[2]) as T
  } else {
    V = point3D
    p2 = matriceMultiply(matrice, V.matrice)
    return vecteur3d(p2[0], p2[1], p2[2]) as T
  }
}

/**
 * LA ROTATION D'AXE UNE DROITE
 *
 * @author Jean-claude Lhote
 *
 * @param {Point3d} point3D Pour l'instant on ne fait tourner qu'un point3d
 * Remarque : ça n'a aucun sens de faire tourner un vecteur autour d'une droite particulière, on utilise la rotation vectorielle pour ça.
 * @param {Droite3d} droite3D Axe de rotation
 * @param {Number} angle Angle de rotation
 * @param {string} color couleur du polygone créé. si non précisé la couleur sera celle du polygone argument
 */

export function rotation3d<T extends Point3d | Vecteur3d | Polygone3d>(
  point3D: T,
  droite3D: Droite3d,
  angle: number,
  color?: string,
): T {
  const directeur = droite3D.directeur
  const origine = droite3D.origine
  if (point3D instanceof Point3d) {
    const V = vecteur3d(origine, point3d(0, 0, 0))
    const W = vecteur3d(point3d(0, 0, 0), origine)
    const M = translation3d(point3D, V)
    const N = rotationV3d(M, directeur, angle)
    return translation3d(N, W)
  }
  if (point3D instanceof Vecteur3d) {
    return rotationV3d(point3D, directeur, angle)
  }
  if (point3D instanceof Polygone3d) {
    const rotated = point3D.listePoints.map((p: Point3d) =>
      rotation3d(p, droite3D, angle),
    )
    return polygone3d(rotated, color ?? point3D.color) as T
  }
  return point3D
}

/**
 * @author Jean-claude Lhote
 * Crée une flèche en arc de cercle pour montrer un sens de rotation autour d'un axe 3d
 * cette flèche est dessinée dans le plan orthogonal à l'axe qui passe par l'origine de l'axe
 * le rayon est ici un vecteur 3d qui permet de fixer le point de départ de la flèche par translation de l'origine de l'axe
 * l'angle définit l'arc formé par la flèche
 * son sens est définit par le vecteur directeur de l'axe (changer le signe de chaque composante de ce vecteur pour changer le sens de rotation)
 */

export class SensDeRotation3d extends ObjetMathalea2D {
  constructor(
    axe: Droite3d,
    rayon: Vecteur3d,
    angle: number,
    epaisseur: number,
    color: string,
  ) {
    super()
    this.epaisseur = epaisseur
    this.color = colorToLatexOrHTML(color)
    this.c2d = []
    let M
    let N
    let s
    M = translation3d(axe.origine, rayon)
    for (let i = 0; i < angle; i += 5) {
      N = rotation3d(M, axe, 5)
      s = segment(M.c2d, N.c2d, color)
      s.epaisseur = this.epaisseur
      this.c2d.push(s)
      M = N
    }
    N = rotation3d(M, axe, 5)
    s = segment(M.c2d, N.c2d, color)
    s.epaisseur = this.epaisseur
    this.c2d.push(s)
    const d = droite3d(N, axe.directeur)
    const A = rotation3d(M, d, 30)
    const B = rotation3d(M, d, -30)
    s = segment(N.c2d, A.c2d, color)
    s.epaisseur = this.epaisseur
    this.c2d.push(s)
    s = segment(N.c2d, B.c2d, color)
    s.epaisseur = this.epaisseur
    this.c2d.push(s)
  }
}

export function sensDeRotation3d(
  axe: Droite3d,
  rayon: Vecteur3d,
  angle: number,
  epaisseur: number,
  color: string,
) {
  return new SensDeRotation3d(axe, rayon, angle, epaisseur, color)
}

/**
 * LA TRANSLATION
 *
 * @author Jean-claude Lhote
 * @param {Point3d | Polygone3d} point3D Pour l'instant on ne translate qu'un point3d ou un polygone3d
 * @param {Vecteur3d} vecteur3D
 */

export function translation3d<T extends Point3d | Polygone3d>(
  point3D: T,
  vecteur3D: Vecteur3d,
): T {
  if (point3D instanceof Point3d) {
    const x = point3D.x + vecteur3D.x
    const y = point3D.y + vecteur3D.y
    const z = point3D.z + vecteur3D.z
    return point3d(x, y, z) as T
  } else if (point3D instanceof Polygone3d) {
    const p = []
    for (let i = 0; i < point3D.listePoints.length; i++) {
      p.push(translation3d(point3D.listePoints[i], vecteur3D))
    }
    return polygone3d(p, point3D.color) as T
  }
  window.notify(
    "translation3d ne peut être appliqué qu'à un point3d ou un polygone3d",
    point3D,
  )
  return point3D
}
/**
 * L'homothetie
 * @author Jean-claude Lhote
 * La même chose qu'ne 2d, mais en 3d...
 * Pour les points3d les polygones ou les vecteurs (multiplication scalaire par rapport)
 */

export function homothetie3d<T extends Point3d | Vecteur3d | Polygone3d>(
  point3D: T,
  centre: Point3d,
  rapport: number,
  color?: string,
): T {
  let V
  const p = []
  if (point3D instanceof Point3d) {
    V = vecteur3d(centre, point3D)
    V.x *= rapport
    V.y *= rapport
    V.z *= rapport
    return translation3d(centre, V) as T
  } else if (point3D instanceof Vecteur3d) {
    V = vecteur3d(point3D.x, point3D.y, point3D.z)
    V.x *= rapport
    V.y *= rapport
    V.z *= rapport
    return V as T
  } else if (point3D instanceof Polygone3d) {
    for (let i = 0; i < point3D.listePoints.length; i++) {
      p.push(homothetie3d(point3D.listePoints[i], centre, rapport, color))
    }
    return polygone3d(p, color ?? point3D.color) as T
  }
  window.notify(
    "homothetie3d ne peut être appliqué qu'à un point3d, un vecteur3d ou un polygone3d",
    point3D,
  )
  return point3D
}

export class CodageAngleDroit3D extends ObjetMathalea2D {
  constructor(A: Point3d, B: Point3d, C: Point3d, color = 'black', taille = 1) {
    super()
    const BA = vecteur3d(B, A)
    const BC = vecteur3d(B, C)
    const k1 = BA.norme
    const k2 = BC.norme
    const M1 = homothetie3d(A, B, (taille * 0.5) / k1)
    const M3 = homothetie3d(C, B, (taille * 0.5) / k2)
    const BM1 = vecteur3d(B, M1)
    const BM3 = vecteur3d(B, M3)
    const x = B.x + BM1.x + BM3.x
    const y = B.y + BM1.y + BM3.y
    const z = B.z + BM1.z + BM3.z
    const M2 = point3d(x, y, z)
    const M1M2 = arete3d(M1, M2, color)
    const M2M3 = arete3d(M2, M3, color)
    const bordures = fixeBordures([M1M2.c2d, M2M3.c2d])
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
    this.svg = function (coeff) {
      return M1M2.c2d.svg(coeff) + M2M3.c2d.svg(coeff)
    }
    this.tikz = function () {
      return M1M2.c2d.tikz() + M2M3.c2d.tikz()
    }
  }
}
