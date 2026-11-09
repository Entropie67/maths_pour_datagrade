import { bleuMathalea } from '../../lib/colors'
import { randint } from '../../modules/outils'
import { rangeMinMax } from '../outils/nombres'
import { lettreDepuisChiffre } from '../outils/outilString'
import { codageAngleDroit } from './CodageAngleDroit'
import { codageSegments } from './CodageSegment'
import type { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait, type PointAbstrait } from './PointAbstrait'
import { polygone, polygoneAvecNom } from './polygones'
import { homothetie, rotation, translation } from './transformations'
import { pointAdistance, pointSurSegment } from './utilitairesPoint'
import { vecteur } from './Vecteur'

/*********************************************/
/**
 * fonction qui retourne le parallélogramme ABCD dont on donne les 3 premiers points A, B et C
 *
 * @param {string} nom
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {PointAbstrait} C
 * @return {PolygoneAvecNom}
 */

export function parallelogramme3points(
  nom: string,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
) {
  const D = translation(A, vecteur(B, C), nom[3])
  A.nom = nom[0]
  B.nom = nom[1]
  C.nom = nom[2]
  return polygoneAvecNom(A, B, C, D)
}
/**
 * parallelogramme2points1hauteur(A,B,5) renvoie un parallélogramme ABCD de base [AB] et de hauteur h
 * parallelogramme2points1hauteur(A,7,5) renvoie un parallélogramme ABCD de base 7cm (le point B est choisi sur le cercle de centre A et de rayon 7cm) et de hauteur h
 *
 * @param {String} nom
 * @param {objet} A
 * @param {objet} B
 * @param {number} h
 * @return {PolygoneAvecNom}
 */
export function parallelogramme2points1hauteur(
  nom: string,
  A: PointAbstrait,
  B: PointAbstrait,
  h: number,
) {
  if (typeof B === 'number') {
    B = pointAdistance(A, B, randint(-180, 180))
  }
  A.nom = nom[0]
  B.nom = nom[1]
  let H = rotation(B, A, 90)
  H = pointSurSegment(A, H, h)
  const pointHomothetie = homothetie(
    B,
    A,
    randint(-5, 5, rangeMinMax(-2, 2)) / 10,
  )
  const D = translation(H, vecteur(A, pointHomothetie as PointAbstrait), nom[3])
  const C = translation(D, vecteur(A, B), nom[2])
  return polygoneAvecNom(A, B, C, D)
}
/**
 * Construit un rectangle à partir d'un point A et de deux longueurs
 * @param {PointAbstrait} A
 * @param {number} longueur
 * @param {number} largeur
 * @param {object} options
 * @param {string} [options.nom] noms des sommets
 * @param {number} [options.angleRotation] angle de rotation du rectangle
 * @return {PolygoneAvecNom}
 * @example rectangle1Point2Longueurs(A, 5, 3)
 * @example rectangle1Point2Longueurs(A, 5, 3, { nom: 'ABCD' })
 * @example rectangle1Point2Longueurs(A, 5, 3, { angleRotation: 45 })
 * @example rectangle1Point2Longueurs(A, 5, 3, { nom: 'ABCD', angleRotation: 45 })
 * @author Guillaume Valmont d'après 6M11 d'Éric Elter
 */
export function rectangle1Point2Longueurs(
  A: PointAbstrait,
  longueur: number,
  largeur: number,
  options: {
    nom?: string
    angleRotation?: number
    avecCodageSegments?: boolean
    avecCodagesAnglesDroits?: boolean
  } = { avecCodageSegments: true, avecCodagesAnglesDroits: true },
) {
  const objets: ObjetMathalea2D[] = []
  const angleRotation = options.angleRotation ?? 0
  const B = pointAdistance(A, longueur, angleRotation)
  const C = rotation(pointAdistance(B, largeur, 180 + angleRotation), B, -90)
  const D = rotation(pointAdistance(A, largeur, angleRotation), A, 90)
  if (options.nom) {
    A.nom = options.nom[0]
    B.nom = options.nom[1]
    C.nom = options.nom[2]
    D.nom = options.nom[3]
  } else {
    const numA = randint(1, 26)
    const numB = randint(1, 26, [numA])
    const numC = randint(1, 26, [numA, numB])
    const numD = randint(1, 26, [numA, numB, numC])
    A.nom = lettreDepuisChiffre(numA)
    B.nom = lettreDepuisChiffre(numB)
    C.nom = lettreDepuisChiffre(numC)
    D.nom = lettreDepuisChiffre(numD)
  }
  objets.push(...polygoneAvecNom(A, B, C, D))
  if (options.avecCodageSegments || options.avecCodageSegments === undefined) {
    // Lorsqu'un objet d'options est passé, le avecCodageSegments: true par défaut est écrasé donc s'il n'est pas redéfini en false, on le considère comme true
    objets.push(
      codageSegments('/', 'red', B, C, D, A),
      codageSegments('||', bleuMathalea, A, B, C, D),
    )
  }
  if (
    options.avecCodagesAnglesDroits ||
    options.avecCodagesAnglesDroits === undefined
  ) {
    // Lorsqu'un objet d'options est passé, le avecCodagesAnglesDroits: true par défaut est écrasé donc s'il n'est pas redéfini en false, on le considère comme true
    objets.push(
      codageAngleDroit(A, B, C),
      codageAngleDroit(D, C, B),
      codageAngleDroit(A, D, C),
      codageAngleDroit(B, A, D),
    )
  }
  return objets
}

/**
 * Trace le polygone régulier direct à n côtés qui a pour côté [AB]
 * Pour tracer le polygone régulier indirect de côté [AB], on iversera A et B
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {number} n Nombre de côtés
 * @param {string} [color = 'black'] Couleur de l'arc ou 'none' : du type 'red', bleuMathalea ou du type '#a12345'
 * @return {Polygone}
 * @author Rémi Angot
 **/
export function polygoneRegulier(
  A: PointAbstrait,
  B: PointAbstrait,
  n: number,
  color = 'black',
) {
  const listePoints = [A, B]
  for (let i = 1; i < n - 1; i++) {
    listePoints[i + 1] = rotation(
      listePoints[i - 1],
      listePoints[i],
      -180 + 360 / n,
    )
  }
  return polygone(listePoints, color)
}

/**
 * polygoneRegulierParCentreEtRayon(O,r,n) //Trace le polygone régulier à n côtés et de rayon r
 * @returns {Polygone} Objet Mathalea2d
 * @author Rémi Angot
 */
export function polygoneRegulierParCentreEtRayon(
  O: PointAbstrait,
  r: number,
  n: number,
  color = 'black',
) {
  const p = []
  p[0] = pointAbstrait(O.x + r, O.y)
  for (let i = 1; i < n; i++) {
    p[i] = rotation(p[i - 1], O, -360 / n)
  }
  return polygone(p, color)
}

/**
 * Trace un carré
 * @param {PointAbstrait} A Un sommet du carré
 * @param {PointAbstrait} B Un sommet du carré, consécutif au précédent
 * @param {string} [color = 'black'] Couleur de l'arc ou 'none' : du type 'red', bleuMathalea ou du type '#a12345'
 * @example carre(M,N)
 *  // Trace le carré noir de sommets consécutifs M et N dans le sens direct
 * @example carre(N,M)
 *  // Trace le carré noir de sommets consécutifs M et N dans le sens indirect
 * @example carre(M,N,bleuMathalea)
 *  // Trace le carré bleu de sommets consécutifs M et N dans le sens direct
 * @return {Polygone}
 * @author Rémi Angot
 * JSDOC Validee par EE Juin 2022
 *
 */
export function carre(A: PointAbstrait, B: PointAbstrait, color = 'black') {
  return polygoneRegulier(A, B, 4, color)
}
