import type { IPolygone } from './Interfaces'
import { mediatrice } from './Mediatrice'
import { pointAbstrait, PointAbstrait } from './PointAbstrait'
import { Droite, droite } from './droites'
import { homothetie, projectionOrtho } from './transformations'
import { milieu, pointIntersectionDD } from './utilitairesPoint'

/**
 * Retourne l'aire du triangle si p est un triangle, false sinon.
 * @param {Polygone} p Triangle
 * @example aireTriangle(poygone(A,B,C)) // Retourne l'aire du triangle ABC
 * @example aireTriangle(poygone(A,B,C,D)) // Retourne false car le polygone n'est pas un triangle
 * @author Jean-claude Lhote
 * @return {boolean|number}
 */
// JSDOC Validee par EE Juin 2022

export function aireTriangle(p: IPolygone) {
  if (p.listePoints.length !== 3) return false
  const A = p.listePoints[0]
  const B = p.listePoints[1]
  const C = p.listePoints[2]
  return (
    (1 / 2) * Math.abs((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y))
  )
}

/**
 * Médiane issue de A relative à [BC]
 * @author Jean-claude Lhote
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {PointAbstrait} C
 * @param {string} color
 */
export function medianeTriangle(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  color = 'black',
) {
  const I = milieu(B, C)
  return droite(A, I, '', color)
}
/**
 * Crée le centre de gravité du triangle ABC
 * @param {PointAbstrait} A Premier sommet du triangle
 * @param {PointAbstrait} B Deuxième sommet du triangle
 * @param {PointAbstrait} C Troisième sommet du triangle
 * @param {string} [nom=''] Nom du centre
 * @param {string} [positionLabel = 'above'] Position du nom par rapport au point
 * @example G = centreGraviteTriangle(F,C,N)
 * // Crée G, le centre de gravité du triangle FCN,sans être nommé.
 * @example G = centreGraviteTriangle(F,C,N,'G','below')
 * // Crée G, le centre de gravité du triangle FCN, en notant G sous le point, s'il est tracé et labellisé.
 * @return {PointAbstrait}
 * @author Jean-claude Lhote
 */
// JSDOC Validee par EE Juin 2022
export function centreGraviteTriangle(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  nom = '',
  positionLabel = 'above',
) {
  const d = medianeTriangle(B, A, C)
  const e = medianeTriangle(A, B, C)
  const p = pointIntersectionDD(d, e)
  const x = p.x
  const y = p.y
  return new PointAbstrait(x, y, nom, positionLabel)
}
/**  Trace la hauteur issue de A relative à [BC]
 * @param {PointAbstrait} A Point dont est issue la hauteur
 * @param {PointAbstrait} B Première extrémité du segment dont est relative la hauteur
 * @param {PointAbstrait} C Seconde extrémité du segment dont est relative la hauteur
 * @param {string} [color = 'black'] Couleur de cette hauteur : du type 'red', bleuMathalea ou du type '#a12345'
 * @example hauteurTriangle (M, N, P) // Trace, en noir, la hauteur issue de M relative à [NP]
 * @example hauteurTriangle (M, N, P, 'red') // Trace, en rouge, la hauteur issue de M relative à [NP]
 * @author Jean-claude Lhote
 * @return {Droite}
 */
// JSDOC Validee par EE Aout 2022
export function hauteurTriangle(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  color = 'black',
) {
  const d = droite(B, C)
  const p = projectionOrtho(A, d)
  return droite(p, A, '', color)
}

/**
 * Orthocentre du triangle ABC
 * @author Jean-claude Lhote
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {PointAbstrait} C
 * @param {string} nom
 */
export function orthoCentre(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  nom = '',
  positionLabel = 'above',
) {
  const d = hauteurTriangle(B, A, C)
  const e = hauteurTriangle(A, B, C)
  const p = pointIntersectionDD(d, e)
  const x = p.x
  const y = p.y
  return pointAbstrait(x, y, nom, positionLabel)
}

/**
 * Crée le centre du cercle circonscrit au triangle ABC
 * @param {PointAbstrait} A Premier sommet du triangle
 * @param {PointAbstrait} B Deuxième sommet du triangle
 * @param {PointAbstrait} C Troisième sommet du triangle
 * @param {string} [nom=''] Nom du centre
 * @param {string} [positionLabel = 'above'] Position du nom par rapport au point
 * @example G = centreCercleCirconscrit(F,C,N)
 * // Crée G, le centre du cercle circonscrit au triangle FCN,sans être nommé.
 * @example G = centreCercleCirconscrit(F,C,N,'G','below')
 * // Crée G, le centre du cercle circonscrit au triangle FCN, en notant G sous le point, s'il est tracé et labellisé.
 * @return {PointAbstrait}
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022
export function centreCercleCirconscrit(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  nom = '',
  positionLabel = 'above',
) {
  const d = mediatrice(A, B)
  const e = mediatrice(B, C)
  const p = pointIntersectionDD(d as Droite, e as Droite)
  const x = p.x
  const y = p.y
  return pointAbstrait(x, y, nom, positionLabel)
}

/**
 * Crée le centre du cercle inscrit au triangle ABC
 * @param {PointAbstrait} A Premier sommet du triangle
 * @param {PointAbstrait} B Deuxième sommet du triangle
 * @param {PointAbstrait} C Troisième sommet du triangle
 * @param {string} [nom=''] Nom du centre
 * @param {string} [positionLabel = 'above'] Position du nom par rapport au point
 * @example G = centreCercleInscrit(F,C,N)
 * // Crée G, le centre du cercle inscrit au triangle FCN,sans être nommé.
 * @example G = centreCercleInscrit(F,C,N,'G','below')
 * // Crée G, le centre du cercle inscrit au triangle FCN, en notant G sous le point, s'il est tracé et labellisé.
 * @return {PointAbstrait}
 * @author Olivier Mimeau
 */

export function centreCercleInscrit(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  nom = '',
  positionLabel = 'above',
) {
  const B1 = piedBissectrice(A, B, C)
  const C1 = piedBissectrice(B, C, A)
  const d = droite(B, B1)
  const e = droite(C, C1)
  const p = pointIntersectionDD(d, e)
  const x = p.x
  const y = p.y
  return pointAbstrait(x, y, nom, positionLabel)
}

/* Pied de la bissectrice issue du sommet B du triangle ABC.
 *
 */
/**
 * Crée le Pied de la bissectrice issue du sommet B du triangle ABC.
 * @param {PointAbstrait} A Premier sommet du triangle
 * @param {PointAbstrait} B Deuxième sommet du triangle
 * @param {PointAbstrait} C Troisième sommet du triangle
 * @param {string} [nom=''] Nom du centre
 * @param {string} [positionLabel = 'above'] Position du nom par rapport au point
 * @example I = piedBissectrice(F,C,N)
 * // Crée I, le pied de la bissectrice issue du sommet C du triangle FCN,sans être nommé.
 * @example I = piedBissectrice(F,C,N,'I','below')
 * // Crée I, le pied de la bissectrice issue du sommet C du triangle FCN, en notant I sous le point, s'il est tracé et labellisé.
 * @return {PointAbstrait}
 * @author Olivier Mimeau
 */
export function piedBissectrice(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  nom?: string,
  positionLabel?: string,
): PointAbstrait {
  //  Le point est sur le segment [AC] tel que MA/MC=BA/BC.
  const AB = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)
  const BC = Math.sqrt((C.x - B.x) ** 2 + (C.y - B.y) ** 2)
  const M = homothetie(C, A, AB / (AB + BC))
  return pointAbstrait(M.x, M.y, nom, positionLabel)
}
