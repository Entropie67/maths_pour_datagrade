import { context } from '../../modules/context'
import { arc } from './Arc'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { latex2d } from './textes'
import { rotation } from './transformations'
import { angleOriente } from './utilitairesGeometriques'
import { pointSurSegment } from './utilitairesPoint'

/**
 * Affiche la mesure de l'angle ABC arrondie au degré près
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} B Sommet de l'angle
 * @param {PointAbstrait} C Point sur l'autre côté de l'angle
 * @param {string} [color='black'] Couleur de la mesure de l'angle : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [distance=1.5] Taille de l'angle
 * @param {string} [label=''] Si vide, alors affiche la mesure de l'angle sinon affiche ce label.
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [parametres.ecart=0.5] Distance entre l'arc et sa mesure
 * @param {boolean} [parametres.saillant=true] True si on veut l'angle saillant, false si on veut l'angle rentrant.
 * @param {string} [parametres.colorArc='black']  Couleur de l'arc  : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {boolean} [parametres.rayon=false] True pour fermer l'angle, par deux rayons (en vue de colorier l'intérieur).
 * @param {string} [parametres.couleurDeRemplissage='none'] 'none' si on ne veut pas de remplissage, sinon une couleur du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [parametres.opaciteDeRemplissage=0.5] Taux d'opacité du remplissage entre 0 et 1
 * @param {number} [parametres.arcEpaisseur=1] Epaisseur de l'arc
 * @param {boolean} [parametres.mesureEnGras=false] True pour mettre en gras la mesure affichée
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {PointAbstrait} depart Point sur un côté de l'angle
 * @property {PointAbstrait} sommet Sommet de l'angle
 * @property {PointAbstrait} arrivee Point sur l'autre côté de l'angle
 * @property {number} distance Taille de l'angle
 * @property {number} ecart Distance entre l'arc et sa mesure
 * @property {boolean} saillant True si on veut l'angle saillant, false si on veut l'angle rentrant.
 * @property {number} epaisseur Epaisseur de l'arc
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class AfficheMesureAngle extends ObjetMathalea2D {
  depart: PointAbstrait
  sommet: PointAbstrait
  arrivee: PointAbstrait
  distance: number
  ecart: number
  saillant: boolean

  constructor(
    A: PointAbstrait,
    B: PointAbstrait,
    C: PointAbstrait,
    color = 'black',
    distance = 1.5,
    label = '',
    {
      ecart = 0.5,
      mesureEnGras = false,
      saillant = true,
      colorArc = 'black',
      rayon = false,
      couleurDeRemplissage = 'none',
      opaciteDeRemplissage = 0.5,
      arcEpaisseur = 1,
    } = {},
  ) {
    super()
    this.depart = A
    this.arrivee = C
    this.sommet = B
    this.distance = distance
    const mesureAngle = saillant
      ? angleOriente(this.depart, this.sommet, this.arrivee)
      : angleOriente(this.depart, this.sommet, this.arrivee) > 0
        ? angleOriente(this.depart, this.sommet, this.arrivee) - 360
        : 360 + angleOriente(this.depart, this.sommet, this.arrivee)
    this.ecart = ecart
    this.saillant = saillant
    this.epaisseur = arcEpaisseur
    const M = pointSurSegment(this.sommet, this.depart, this.distance)
    const N = rotation(
      pointSurSegment(
        this.sommet,
        M,
        this.distance + (this.ecart * 20) / context.pixelsParCm,
      ),
      this.sommet,
      mesureAngle / 2,
    )
    let mesureAngleString
    if (label !== '') {
      mesureAngleString = label
    } else {
      mesureAngleString =
        Math.round(Math.abs(mesureAngle)).toString() + '^\\circ'
    }
    const mesure = latex2d(mesureAngleString, N.x, N.y, {
      color,
      letterSize: 'scriptsize',
    })
    const marque = arc(
      M,
      B,
      mesureAngle,
      rayon,
      couleurDeRemplissage,
      colorArc,
      opaciteDeRemplissage,
    )
    marque.epaisseur = this.epaisseur
    this.bordures = [
      Math.min(N.x, M.x) - 0.5,
      Math.min(N.y, M.y) - 0.5,
      Math.max(N.x, M.x) + 0.5,
      Math.max(N.y, M.y) + 0.5,
    ]
    this.objets = [mesure, marque]
  }
}
/**
 * Affiche la mesure de l'angle ABC arrondie au degré près
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} B Sommet de l'angle
 * @param {PointAbstrait} C Point sur l'autre côté de l'angle
 * @param {string} [color='black'] Couleur de la mesure de l'angle : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [distance=1.5] Rayon de l'arc de cercle.
 * @param {string} [label=''] Si vide, alors affiche la mesure de l'angle sinon affiche ce label.
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [parametres.ecart=0.5] Distance entre l'arc et sa mesure
 * @param {boolean} [parametres.saillant=true] True si on veut l'angle saillant, false si on veut l'angle rentrant.
 * @param {string} [parametres.colorArc='black']  Couleur de l'arc  : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {boolean} [parametres.rayon=false] True pour fermer l'angle, par deux rayons (en vue de colorier l'intérieur).
 * @param {string} [parametres.couleurDeRemplissage='none'] 'none' si on ne veut pas de remplissage, sinon une couleur du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [parametres.opaciteDeRemplissage=0.5] Taux d'opacité du remplissage entre 0 et 1
 * @param {number} [parametres.arcEpaisseur=1] Epaisseur de l'arc
 * @param {boolean} [parametres.mesureEnGras=false] True pour mettre en gras la mesure affichée
 * @example afficheMesureAngle(M,N,O)
 * // Affiche la mesure de l'angle MNO (en noir, avec un arc de rayon 1,5 "cm").
 * @example afficheMesureAngle(M,N,O,'red',2,'pop',{ecart:1,saillant:false,colorArc:bleuMathalea,rayon:true,couleurDeRemplissage:orangeMathalea,opaciteDeRemplissage:0.8,arcEpaisseur:2,mesureEnGras:true})
 * // Affiche le label pop en gras et rouge, sur l'angle rentrant MNO, avec un arc bleu, epais de 2 et de rayon 2 "cm", à 1 "cm" de l'arc rempli en orange avec une opacité de 80%, cerné par ses rayons.
 * @return {AfficheMesureAngle}
 */
// JSDOC Validee par EE Juin 2022

export function afficheMesureAngle(
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  color = 'black',
  distance = 1.5,
  label = '',
  {
    ecart = 0.5,
    mesureEnGras = false,
    saillant = true,
    colorArc = 'black',
    rayon = false,
    couleurDeRemplissage = 'none',
    opaciteDeRemplissage = 0.5,
    arcEpaisseur = 1,
  } = {},
) {
  return new AfficheMesureAngle(A, B, C, color, distance, label, {
    ecart,
    mesureEnGras,
    saillant,
    colorArc,
    rayon,
    couleurDeRemplissage,
    opaciteDeRemplissage,
    arcEpaisseur,
  })
}
