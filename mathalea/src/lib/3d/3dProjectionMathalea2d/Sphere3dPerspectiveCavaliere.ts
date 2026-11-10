import { bleuMathalea } from '../../../lib/colors'
import {
  assombrirOuEclaircir,
  colorToLatexOrHTML,
} from '../../2d/colorToLatexOrHtml'
import { droite } from '../../2d/droites'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from '../../2d/PointAbstrait'
import { polygone } from '../../2d/polygones'
import { polyline } from '../../2d/Polyline'
import { segment } from '../../2d/segmentsVecteurs'
import { tracePoint } from '../../2d/TracePoint'
import { estDansPolygone } from '../../2d/utilitairesGeometriques'
import { pointIntersectionDD, pointSurSegment } from '../../2d/utilitairesPoint'
import { vide2d } from '../../2d/Vide2d'
import { choisitLettresDifferentes } from '../../outils/aleatoires'
import {
  Point3d,
  Vecteur3d,
  cercle3d,
  droite3d,
  point3d,
  rotation3d,
  vecteur3d,
} from './elementsEtTransformations3d'

const longueur = (A: PointAbstrait, B: PointAbstrait): number =>
  Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)

/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%% OBJETS COMPLEXES %%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/
/**
 * LA SPHERE - ANCIENNE FONCTION
 *
 * @author Jean-claude Lhote
 * Produit une sphère : choisir un nombre de parallèles impair pour avoir l'équateur. normal défini l'axe Nord-Sud.
 * rayon est le rayon de la sphère. l'équateur est dans le plan xy l'axe Nord-Sud est sur z
 * @param {Point3d} centre
 * @param {Number} rayon
 * @param {Number} nbParalleles
 * @param {Number} nbMeridiens
 * @param {string} color
 */
/**
 * Classe de la sphère
 * @param {Point3d} centre Centre de la sphère
 * @param {number} rayon Rayon de la sphère
 * @param {string} [colorEquateur = 'red'] Couleur de l'équateur : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorEnveloppe = bleuMathalea] Couleur de l'enveloppe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} [nbParalleles = 0]  Le nombre de parallèles au total
 * @param {string} [colorParalleles = 'gray'] Couleur des parallèles de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} [nbMeridiens = 0]  Le nombre de méridiens au total
 * @param {string} [colorMeridiens = 'gray'] Couleur des méridiens de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageAxe = false] Permet (ou pas) l'affichage de l'axe de la sphère.
 * @param {string} [colorAxe = 'black'] Couleur de l'axe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} inclinaison angle d'inclinaison de l'axe N-S
 * @param {boolean} faceCachee Si false on économise tout ce qui est en pointillé à l'arrière.
 * @property {Point3d} centre Centre de la sphère
 * @property {Vecteur3d} rayon Rayon de la sphère
 * @property {string} colorEquateur Couleur de l'équateur : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {string} colorEnveloppe Couleur de l'enveloppe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {number} nbParalleles Le nombre de parallèles au total
 * @property {string} colorParalleles Couleur des parallèles de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {number} nbMeridiens Le nombre de méridiens au total

/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%% OBJETS COMPLEXES %%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/
/**
 * LA SPHERE - ANCIENNE FONCTION
 *
 * @author Jean-claude Lhote
 * Produit une sphère : choisir un nombre de parallèles impair pour avoir l'équateur. normal défini l'axe Nord-Sud.
 * rayon est le rayon de la sphère. l'équateur est dans le plan xy l'axe Nord-Sud est sur z
 * @param {Point3d} centre
 * @param {Number} rayon
 * @param {Number} nbParalleles
 * @param {Number} nbMeridiens
 * @param {string} color
 */
/**
 * Classe de la sphère
 * @param {Point3d} centre Centre de la sphère
 * @param {number} rayon Rayon de la sphère
 * @param {string} [colorEquateur = 'red'] Couleur de l'équateur : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorEnveloppe = bleuMathalea] Couleur de l'enveloppe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} [nbParalleles = 0]  Le nombre de parallèles au total
 * @param {string} [colorParalleles = 'gray'] Couleur des parallèles de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} [nbMeridiens = 0]  Le nombre de méridiens au total
 * @param {string} [colorMeridiens = 'gray'] Couleur des méridiens de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageAxe = false] Permet (ou pas) l'affichage de l'axe de la sphère.
 * @param {string} [colorAxe = 'black'] Couleur de l'axe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} inclinaison angle d'inclinaison de l'axe N-S
 * @param {boolean} faceCachee Si false on économise tout ce qui est en pointillé à l'arrière.
 * @property {Point3d} centre Centre de la sphère
 * @property {Vecteur3d} rayon Rayon de la sphère
 * @property {string} colorEquateur Couleur de l'équateur : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {string} colorEnveloppe Couleur de l'enveloppe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {number} nbParalleles Le nombre de parallèles au total
 * @property {string} colorParalleles Couleur des parallèles de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {number} nbMeridiens Le nombre de méridiens au total
 * @property {string} colorMeridiens Couleur des méridiens de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {boolean} affichageAxe Permet (ou pas) l'affichage de l'axe de la sphère.
 * @property {string} colorAxe Couleur de l'axe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {Array} c2d Contient les commandes à tracer en 2d de cette fonction
 * @author Éric Elter (d'après version précédente de Jean-claude Lhote)
 * @class
 */

export class Sphere3d extends ObjetMathalea2D {
  constructor(
    centre: Point3d,
    rayon: Vecteur3d | number,
    colorEquateur = 'red',
    colorEnveloppe = bleuMathalea,
    nbParalleles = 0,
    colorParalleles = 'gray',
    nbMeridiens = 0,
    colorMeridiens = 'gray',
    affichageAxe = false,
    colorAxe = 'black',
    inclinaison = 0,
    faceCachee = true,
  ) {
    super()
    this.centre = centre
    this.rayon = typeof rayon === 'number' ? rayon : rayon.norme
    this.objets = []
    this.colorEquateur = colorEquateur
    this.colorEnveloppe = colorEnveloppe
    this.nbParalleles = nbParalleles
    this.colorParalleles = colorParalleles
    this.nbMeridiens = nbMeridiens
    this.colorMeridiens = colorMeridiens
    this.affichageAxe = affichageAxe
    this.colorAxe = colorAxe
    const droiteRot = droite3d(
      point3d(this.centre.x, this.centre.y, this.centre.z),
      vecteur3d(0, 1, 0),
    )
    const poleNord = rotation3d(
      point3d(
        this.centre.x,
        this.centre.y,
        this.centre.z + this.rayon,
        true,
        choisitLettresDifferentes(1, 'OQWX' + this.centre.label)[0],
        'left',
      ),
      droiteRot,
      inclinaison,
    )
    const poleSud = rotation3d(
      point3d(
        this.centre.x,
        this.centre.y,
        this.centre.z - this.rayon,
        true,
        choisitLettresDifferentes(
          1,
          'OQWX' + this.centre.label + poleNord.label,
        )[0],
        'left',
      ),
      droiteRot,
      inclinaison,
    )
    const nbParallelesDeConstruction = 36 // Ce nb de paralleles permet de construire l'enveloppe de la sphère (le "cercle" apparent de la sphère)
    const divisionParalleles =
      this.nbParalleles !== 0
        ? Math.round((2 * nbParallelesDeConstruction) / this.nbParalleles)
        : 1
    let unDesParalleles
    let centreParallele
    let rayonDuParallele
    let normal
    const paralleles: {
      listePoints3d: Point3d[][]
      ptCachePremier: PointAbstrait[]
      indicePtCachePremier: number[]
      ptCacheDernier: PointAbstrait[]
      indicePtCacheDernier: number[]
    } = {
      listePoints3d: [],
      ptCachePremier: [],
      indicePtCachePremier: [],
      ptCacheDernier: [],
      indicePtCacheDernier: [],
    }
    const enveloppeSphere1: PointAbstrait[] = []
    let enveloppeSphere2: PointAbstrait[] = []
    let premierParallele = 100
    let indicePremier = 0
    let indiceDernier = 0
    this.c2d = []

    // Construction de tous les paralleles
    // Construction du parallèle le plus proche du pôle nord
    centreParallele = rotation3d(
      point3d(
        this.centre.x,
        this.centre.y,
        this.centre.z +
          this.rayon *
            Math.sin(
              (((nbParallelesDeConstruction - 1) / nbParallelesDeConstruction) *
                Math.PI) /
                2,
            ),
      ),
      droiteRot,
      inclinaison,
    )
    rayonDuParallele = rotation3d(
      vecteur3d(
        this.rayon *
          Math.cos(
            (((nbParallelesDeConstruction - 1) / nbParallelesDeConstruction) *
              Math.PI) /
              2,
          ),
        0,
        0,
      ),
      droiteRot,
      inclinaison,
    )
    normal = rotation3d(vecteur3d(0, 0, 1), droiteRot, inclinaison)
    unDesParalleles = cercle3d(centreParallele, normal, rayonDuParallele)
    paralleles.listePoints3d.push(unDesParalleles[1])
    paralleles.ptCachePremier.push(pointAbstrait(0, 0))
    paralleles.indicePtCachePremier.push(0)
    paralleles.ptCacheDernier.push(pointAbstrait(0, 0))
    paralleles.indicePtCacheDernier.push(0)

    // Construction de tous les autres parallèles jusqu'au plus proche du pôle sud
    for (
      let k = nbParallelesDeConstruction - 2, poly, j = 1;
      k > -nbParallelesDeConstruction;
      k -= 1
    ) {
      centreParallele = rotation3d(
        point3d(
          this.centre.x,
          this.centre.y,
          this.centre.z +
            this.rayon *
              Math.sin(((k / nbParallelesDeConstruction) * Math.PI) / 2),
        ),
        droiteRot,
        inclinaison,
      )
      rayonDuParallele = rotation3d(
        vecteur3d(
          this.rayon *
            Math.cos(((k / nbParallelesDeConstruction) * Math.PI) / 2),
          0,
          0,
        ),
        droiteRot,
        inclinaison,
      )

      normal = rotation3d(vecteur3d(0, 0, 1), droiteRot, inclinaison)
      poly = polygone(unDesParalleles[2])
      unDesParalleles = cercle3d(
        centreParallele,
        normal,
        rayonDuParallele,
        false,
      )
      paralleles.listePoints3d.push(unDesParalleles[1])
      for (let ee = 0; ee < paralleles.listePoints3d[0].length; ee++) {
        paralleles.listePoints3d[j][ee].isVisible = !estDansPolygone(
          paralleles.listePoints3d[j][ee].c2d,
          poly,
        )
      }
      paralleles.ptCachePremier.push(pointAbstrait(0, 0))
      paralleles.indicePtCachePremier.push(0)
      paralleles.ptCacheDernier.push(pointAbstrait(0, 0))
      paralleles.indicePtCacheDernier.push(0)

      for (
        let ee = 0, s, s1, d1, d2, jj, pt;
        ee < paralleles.listePoints3d[0].length;
        ee++
      ) {
        const extremite1 = paralleles.listePoints3d[j][ee].c2d
        const extremite2 =
          paralleles.listePoints3d[j][
            (ee + 1) % paralleles.listePoints3d[0].length
          ].c2d
        s =
          longueur(extremite1, extremite2) < 0.001
            ? vide2d()
            : segment(extremite1, extremite2)
        // Recherche du point d'intersection entre le parallèle actuel et le précédent.
        if (
          !paralleles.listePoints3d[j][ee].isVisible &&
          paralleles.listePoints3d[j][
            (ee + 1) % paralleles.listePoints3d[0].length
          ].isVisible
        ) {
          jj = ee - 3
          s1 = droite(
            paralleles.listePoints3d[j - 1][
              (paralleles.listePoints3d[0].length + jj) %
                paralleles.listePoints3d[0].length
            ].c2d,
            paralleles.listePoints3d[j - 1][
              (paralleles.listePoints3d[0].length + jj - 1) %
                paralleles.listePoints3d[0].length
            ].c2d,
          )
          // Le point d'intersection avec ce segment précis du parallèle actuel est avec l'un des 7 (nombre totalement empirique) segments les plus proches du parallèle précédent.
          let cptBoucleInfinie = 0
          while (!s.estSecant(s1) && cptBoucleInfinie < 7) {
            jj++
            s1 = droite(
              paralleles.listePoints3d[j - 1][
                (paralleles.listePoints3d[0].length + jj) %
                  paralleles.listePoints3d[0].length
              ].c2d,
              paralleles.listePoints3d[j - 1][
                (paralleles.listePoints3d[0].length + jj - 1) %
                  paralleles.listePoints3d[0].length
              ].c2d,
            )
            cptBoucleInfinie++
          }
          if (cptBoucleInfinie === 7) {
            // console.info('Boucle infinie')
          } else {
            // s étant secant avec s1, on mène plusieurs actions :
            d1 = droite(
              paralleles.listePoints3d[j][ee].c2d,
              paralleles.listePoints3d[j][
                (ee + 1) % paralleles.listePoints3d[0].length
              ].c2d,
            )
            d2 = droite(
              paralleles.listePoints3d[j - 1][
                (paralleles.listePoints3d[0].length + jj) %
                  paralleles.listePoints3d[0].length
              ].c2d,
              paralleles.listePoints3d[j - 1][
                (paralleles.listePoints3d[0].length + jj - 1) %
                  paralleles.listePoints3d[0].length
              ].c2d,
            )
            pt = pointIntersectionDD(d1, d2) // 1) Tout d'abord, ce point d'intersection est donc la frontière entre le visible et le caché et on l'enregistre comme élément de l'enveloppe de la sphère
            if (!pt) {
              window.notify(
                "Erreur dans le calcul du point d'intersection entre d1 et d2",
                { d1, d2 },
              )
              continue
            }
            enveloppeSphere1.push(pt)
            //  2) Ensuite, si pt est le tout premier point d'intersection trouvé, on enregistre quel est le premier parallèle et quel est son indice
            // Ces informmations serviront pour le tracé de l'enveloppe près du pôle Nord.
            if (premierParallele >= j) {
              premierParallele = j
              indicePremier = jj % paralleles.listePoints3d[0].length
            }
            // 3) On note ce point pour le futur tracé du parallèle, si besoin
            paralleles.ptCachePremier[j] = pt
            paralleles.indicePtCachePremier[j] = ee
          }
        } else if (
          paralleles.listePoints3d[j][ee].isVisible &&
          !paralleles.listePoints3d[j][
            (ee + 1) % paralleles.listePoints3d[0].length
          ].isVisible
        ) {
          // Si le point précédent était l'entrée dans la partie cachée, alors celui-ci sera celui de l'entrée dans la partie visible (ou inversement)
          // car pour chaque parallèle intersecté avec le précédent, il y a "forcément" deux points sauf tangence mais ce n'est pas un pb.
          jj = ee - 3
          s1 = droite(
            paralleles.listePoints3d[j - 1][
              (paralleles.listePoints3d[0].length + jj) %
                paralleles.listePoints3d[0].length
            ].c2d,
            paralleles.listePoints3d[j - 1][
              (paralleles.listePoints3d[0].length + jj - 1) %
                paralleles.listePoints3d[0].length
            ].c2d,
          )
          // On recherche le point d'intersection
          let cptBoucleInfinie = 0
          while (!s.estSecant(s1) && cptBoucleInfinie < 7) {
            jj++
            s1 = droite(
              paralleles.listePoints3d[j - 1][
                (paralleles.listePoints3d[0].length + jj) %
                  paralleles.listePoints3d[0].length
              ].c2d,
              paralleles.listePoints3d[j - 1][
                (paralleles.listePoints3d[0].length + jj - 1) %
                  paralleles.listePoints3d[0].length
              ].c2d,
            )
            cptBoucleInfinie++
          }
          if (cptBoucleInfinie === 7) {
            // console.info('Boucle infinie')
          } else {
            // s étant secant avec s1, on mène plusieurs actions :
            d1 = droite(
              paralleles.listePoints3d[j][ee].c2d,
              paralleles.listePoints3d[j][
                (ee + 1) % paralleles.listePoints3d[0].length
              ].c2d,
            )
            d2 = droite(
              paralleles.listePoints3d[j - 1][
                (paralleles.listePoints3d[0].length + jj) %
                  paralleles.listePoints3d[0].length
              ].c2d,
              paralleles.listePoints3d[j - 1][
                (paralleles.listePoints3d[0].length + jj - 1) %
                  paralleles.listePoints3d[0].length
              ].c2d,
            )
            pt = pointIntersectionDD(d1, d2)
            if (!pt) {
              window.notify(
                "Erreur dans le calcul du point d'intersection entre d1 et d2",
                { d1, d2 },
              )
              continue
            }
            // 1) Tout d'abord, ce point d'intersection est donc la frontière entre le visible et le caché et on l'enregistre comme élément de l'enveloppe de la sphère
            enveloppeSphere2.push(pt)
            // 2) Ensuite, si pt est le tout premier point d'intersection trouvé, on enregistre quel est le premier parallèle et quel est son indice
            // Ces informmations serviront pour le tracé de l'enveloppe près du pôle Sud.
            if (premierParallele >= j) {
              premierParallele = j
              indiceDernier = jj
            }
            // 3) On note ce point pour le futur tracé du parallèle, si besoin
            paralleles.ptCacheDernier[j] = pt
            paralleles.indicePtCacheDernier[j] = ee
          }
        }
      }
      j++
    }

    if (this.nbParalleles !== 0) {
      let t = tracePoint(poleNord.c2d, this.colorParalleles)
      t.style = 'o'
      t.taille = 0.5
      this.c2d.push(t)
      t = tracePoint(
        poleSud.c2d,
        assombrirOuEclaircir(this.colorParalleles, 50),
      )
      t.style = 'o'
      t.taille = 0.5
      this.c2d.push(t)
    }

    // Construction des parallèles demandés
    for (
      let k = nbParallelesDeConstruction, j = -1;
      k > -nbParallelesDeConstruction;
      k -= 1
    ) {
      const polyLineVisible = [] // Contient l'ensemble des points du parallèle contenus dans la partie visible
      let polyLineCachee = [] // Idem pour la partie cachée.
      if (
        (this.nbParalleles !== 0 || k === 0) &&
        k !== nbParallelesDeConstruction &&
        k % divisionParalleles === 0
      ) {
        // k=0 : C'est l'équateur
        for (let ee = 0; ee < paralleles.listePoints3d[0].length; ee++) {
          if (paralleles.indicePtCachePremier[j] === ee) {
            polyLineCachee.push(paralleles.ptCachePremier[j])
          } else if (paralleles.indicePtCacheDernier[j] === ee) {
            polyLineCachee.push(paralleles.ptCacheDernier[j])
          } else {
            // Tracé des pointilles ou pas des parallèles
            if (
              !paralleles.listePoints3d[j][ee].isVisible &&
              !paralleles.listePoints3d[j][
                (ee + 1) % paralleles.listePoints3d[0].length
              ].isVisible
            ) {
              polyLineCachee.push(paralleles.listePoints3d[j][ee].c2d)
            } else {
              polyLineVisible.push(
                paralleles.listePoints3d[j][
                  (ee + 1) % paralleles.listePoints3d[0].length
                ].c2d,
              )
            }
          }
        }
        if (k < 36 && k > -30) {
          // uniquement à bonne distance des pôles pour éviter les points trop proches
          let securite = 0
          if (polyLineCachee.length > 4) {
            // une précaution au cas où la liste de points est courte ça pourrait boucler à l'infini
            while (
              securite < 10 &&
              longueur(
                polyLineCachee[polyLineCachee.length - 1],
                polyLineCachee[0],
              ) < 1
            ) {
              const dernierPoint = polyLineCachee.pop()
              if (dernierPoint)
                polyLineCachee = [
                  pointAbstrait(dernierPoint.x, dernierPoint.y),
                  ...polyLineCachee,
                ]
              securite++
            }
          }
          if (polyLineVisible.length > 4) {
            while (
              securite < 20 &&
              longueur(
                polyLineVisible[polyLineVisible.length - 1],
                polyLineVisible[0],
              ) < 1
            ) {
              const premierPoint = polyLineVisible.shift()
              if (premierPoint)
                polyLineVisible.push(
                  pointAbstrait(premierPoint.x, premierPoint.y),
                )
              securite++
            }
          }
        }
        if (faceCachee) {
          const ligneCachee =
            polyLineCachee.length > 0 ? polyline(...polyLineCachee) : null // parfois, il n'y a rien à cacher près du pôle nord
          if (ligneCachee && k === 0) {
            // là on est certain qu'il y a du monde à cacher
            ligneCachee.color = colorToLatexOrHTML(this.colorEquateur)
            ligneCachee.epaisseur = 1.5
          } else {
            if (ligneCachee)
              ligneCachee.color = colorToLatexOrHTML(this.colorParalleles)
          }
          if (faceCachee && ligneCachee) {
            ligneCachee.pointilles = 4
            ligneCachee.opacite = 0.5
            this.c2d.push(ligneCachee)
          }
        }
        const ligneVisible =
          polyLineVisible.length > 0 ? polyline(...polyLineVisible) : null // et rien non plus à montrer près du pôle sud.
        if (ligneVisible && k === 0) {
          // là on est certain qu'il y a du monde à montrer
          ligneVisible.color = colorToLatexOrHTML(this.colorEquateur)
          ligneVisible.epaisseur = 1.5
        } else {
          if (ligneVisible)
            ligneVisible.color = colorToLatexOrHTML(this.colorParalleles)
        }
        if (ligneVisible) {
          this.c2d.push(ligneVisible)
        }
      }
      j++
    }

    // Construction des méridiens demandés
    if (this.nbMeridiens !== 0) {
      const divisionMeridiens = Math.round(36 / this.nbMeridiens)
      for (let k = 0, s; k < 18; k += divisionMeridiens) {
        const polyLineCachee1 = []
        const polyLineVisible1 = []
        const polyLineCachee2 = []
        const polyLineVisible2 = []

        for (let ee = 1; ee < paralleles.listePoints3d.length - 1; ee++) {
          // Affichage des méridiens sans le dernier segment relié aux pôles
          if (
            !paralleles.listePoints3d[ee][k].isVisible &&
            !paralleles.listePoints3d[
              (ee + 1) % paralleles.listePoints3d.length
            ][k].isVisible
          ) {
            //  s.pointilles = 4 // Laisser 4 car sinon les pointilles ne se voient dans les petits cercles
            //  s.opacite = 0.5
            polyLineCachee1.push(paralleles.listePoints3d[ee][k].c2d)
          } else {
            polyLineVisible1.push(paralleles.listePoints3d[ee][k].c2d)
          }
          if (
            !paralleles.listePoints3d[ee][k + 18].isVisible &&
            !paralleles.listePoints3d[
              (ee + 1) % paralleles.listePoints3d.length
            ][k + 18].isVisible
          ) {
            //   s.pointilles = 4 // Laisser 4 car sinon les pointilles ne se voient dans les petits cercles
            //   s.opacite = 0.5
            polyLineCachee2.push(paralleles.listePoints3d[ee][k + 18].c2d)
          } else {
            polyLineVisible2.push(paralleles.listePoints3d[ee][k + 18].c2d)
          }
        }
        // Affichage de la partie reliée au pôle Nord
        let extremite1 = poleNord.c2d
        let extremite2 = paralleles.listePoints3d[1][k].c2d
        s =
          longueur(extremite1, extremite2) < 0.001
            ? vide2d()
            : segment(
                poleNord.c2d,
                paralleles.listePoints3d[1][k].c2d,
                this.colorMeridiens,
              )
        this.c2d.push(s)
        extremite1 = paralleles.listePoints3d[1][k + 18].c2d
        extremite2 = poleNord.c2d
        s =
          longueur(extremite1, extremite2) < 0.001
            ? vide2d()
            : segment(
                paralleles.listePoints3d[1][k + 18].c2d,
                poleNord.c2d,
                this.colorMeridiens,
              )
        this.c2d.push(s)
        // Affichage de la partie reliée au pôle Sud
        extremite1 = poleSud.c2d
        extremite2 =
          paralleles.listePoints3d[paralleles.listePoints3d.length - 1][k].c2d
        s =
          longueur(extremite1, extremite2) < 0.001
            ? vide2d()
            : segment(
                poleSud.c2d,
                paralleles.listePoints3d[paralleles.listePoints3d.length - 1][k]
                  .c2d,
                this.colorMeridiens,
              )
        if (
          faceCachee &&
          !paralleles.listePoints3d[paralleles.listePoints3d.length - 1][0]
            .isVisible
        ) {
          s.pointilles = 4 // Laisser 4 car sinon les pointilles ne se voient dans les petits cercles
          s.opacite = 0.5
          this.c2d.push(s)
        } else {
          if (faceCachee) this.c2d.push(s)
        }
        extremite1 =
          paralleles.listePoints3d[paralleles.listePoints3d.length - 1][k + 18]
            .c2d
        extremite2 = poleSud.c2d
        s =
          longueur(extremite1, extremite2) < 0.001
            ? vide2d()
            : segment(
                paralleles.listePoints3d[paralleles.listePoints3d.length - 1][
                  k + 18
                ].c2d,
                poleSud.c2d,
                this.colorMeridiens,
              )
        if (
          faceCachee &&
          !paralleles.listePoints3d[paralleles.listePoints3d.length - 1][k]
            .isVisible
        ) {
          s.pointilles = 4 // Laisser 4 car sinon les pointilles ne se voient dans les petits cercles
          s.opacite = 0.5
          this.c2d.push(s)
        } else {
          if (faceCachee) this.c2d.push(s)
        }

        const ligneVisible1 = polyline(...polyLineVisible1)
        const ligneVisible2 = polyline(...polyLineVisible2)

        if (faceCachee) {
          const ligneCachee1 = polyline(...polyLineCachee1)
          const ligneCachee2 = polyline(...polyLineCachee2)
          ligneCachee1.pointilles = 4
          ligneCachee1.opacite = 0.5
          ligneCachee2.pointilles = 4
          ligneCachee2.opacite = 0.5
          this.c2d.push(ligneCachee1, ligneCachee2)
        }
        this.c2d.push(ligneVisible1, ligneVisible2)
      }
    }

    // L'enveloppe finale contiendra les points de l'enveloppe 1 + les points de l'enveloppe 2 inversée (sinon le polygone serait croisé)
    // A cela, il faut ajouter les points autour des pôles car les premiers parallèles ne s'intersectent pas forcément.
    enveloppeSphere2 = enveloppeSphere2.reverse()
    const enveloppeSphere = [...enveloppeSphere1]

    // Pour trouver les points du cercle apparent près du pôle sud
    // On va prendre les points du premier parallèle intersecté entre l'indice du premier point d'intersection et l'indice du dernier point d'intersection.
    let ii = 1
    while (
      (indiceDernier + paralleles.listePoints3d[0].length / 2 + ii) %
        paralleles.listePoints3d[0].length <
      (indicePremier + paralleles.listePoints3d[0].length / 2) %
        paralleles.listePoints3d[0].length
    ) {
      enveloppeSphere.push(
        paralleles.listePoints3d[
          2 * nbParallelesDeConstruction - 1 - premierParallele
        ][
          (indiceDernier + paralleles.listePoints3d[0].length / 2 + ii) %
            paralleles.listePoints3d[0].length
        ].c2d,
      )
      ii++
    }
    enveloppeSphere.push(...enveloppeSphere2)
    // Pour trouver les points du cercle apparent près du pôle nord
    // On va prendre les points du premier parallèle intersecté entre l'indice du premier point d'intersection et l'indice du dernier point d'intersection.
    // La gestion des indices est plus compliquée car il arrive de repasser de 35 à 0 (36 modulo 36) d'où cette double gestion.
    if (indiceDernier > indicePremier) {
      ii = 1
      while (
        indiceDernier + ii <
        indicePremier + paralleles.listePoints3d[0].length
      ) {
        enveloppeSphere.push(
          paralleles.listePoints3d[premierParallele][
            (indiceDernier + ii) % paralleles.listePoints3d[0].length
          ].c2d,
        )
        ii++
      }
    } else {
      ii = 1
      while (indiceDernier + ii < indicePremier) {
        enveloppeSphere.push(
          paralleles.listePoints3d[premierParallele][indiceDernier + ii].c2d,
        )
        ii++
      }
    }
    const p = polygone(enveloppeSphere, this.colorEnveloppe)
    p.epaisseur = 1.5

    this.c2d.push(p)

    if (this.affichageAxe) {
      const l = longueur(poleNord.c2d, poleSud.c2d)
      let ee = 1
      const poly = polygone(enveloppeSphere)
      // poly.isVisible = false
      while (
        ee < 2 &&
        estDansPolygone(
          pointSurSegment(poleNord.c2d, poleSud.c2d, ee * l),
          poly,
        )
      ) {
        ee += 0.01
      }
      let extremite1 = pointSurSegment(
        poleNord.c2d,
        poleSud.c2d,
        Math.max(ee - 0.01, 1) * l,
      )
      let extremite2 = poleNord.c2d
      let s =
        longueur(extremite1, extremite2) < 0.001
          ? vide2d()
          : segment(extremite2, extremite1, this.colorAxe)

      s.pointilles = 2
      this.c2d.push(s)
      extremite1 = poleSud.c2d
      extremite2 = pointSurSegment(poleNord.c2d, poleSud.c2d, 1.1 * l)
      s =
        longueur(extremite1, extremite2) < 0.001
          ? vide2d()
          : segment(extremite1, extremite2, this.colorAxe)

      this.c2d.push(s)
      extremite1 = poleNord.c2d
      extremite2 = pointSurSegment(poleNord.c2d, poleSud.c2d, -0.1 * l)
      s =
        longueur(extremite1, extremite2) < 0.001
          ? vide2d()
          : segment(extremite1, extremite2, this.colorAxe)

      this.c2d.push(s)
    }
    this.objets = this.c2d
  }
}
/**
 * Crée une sphère
 * @param {Point3d} centre Centre de la sphère
 * @param {Vecteur3d} rayon Vecteur correspondant au rayon de la sphère
 * @param {string} [colorEquateur = 'red'] Couleur de l'équateur : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {string} [colorEnveloppe = bleuMathalea] Couleur de l'enveloppe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} [nbParalleles = 0]  Le nombre de parallèles au total
 * @param {string} [colorParalleles = 'gray'] Couleur des parallèles de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} [nbMeridiens = 0]  Le nombre de méridiens au total
 * @param {string} [colorMeridiens = 'gray'] Couleur des méridiens de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageAxe = false] Permet (ou pas) l'affichage de l'axe de la sphère.
 * @param {string} [colorAxe = 'black'] Couleur de l'axe de la sphère : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {number} inclinaison Angle d'inclinaison de l'axe N-S
 * @example sphere3d(A,v) // Crée une sphère de centre A et dont le rayon correspond au vecteur v, l'équateur rouge et l'enveloppe bleue
 * @example sphere3d(A,v,'green','pink') // Crée une sphère de centre A et dont le rayon correspond au vecteur v, l'équateur vert et l'enveloppe rose
 * @example sphere3d(A,v,'green','pink',18,'red') // Crée une sphère de centre A et dont le rayon correspond au vecteur v, l'équateur vert, l'enveloppe rose, avec 18 parallèles rouges
 * @example sphere3d(A,v,'green','pink',18,'red',36,bleuMathalea) // Crée une sphère de centre A et dont le rayon correspond au vecteur v, l'équateur vert, l'enveloppe rose, avec 18 parallèles rouges et 36 méridiens verts
 * @example sphere3d(A,v,'green','pink',18,'red',36,bleuMathalea,true,'#f15929') // Crée une sphère de centre A et dont le rayon correspond au vecteur v, l'équateur vert, l'enveloppe rose, avec 18 parallèles rouges, 36 méridiens verts et un axe affiché orange
 * @author Éric Elter (d'après version précédente de Jean-claude Lhote)
 * @return {Sphere3d}
 */
export function sphere3d(
  centre: Point3d,
  rayon: Vecteur3d | number,
  colorEquateur = 'red',
  colorEnveloppe = bleuMathalea,
  nbParalleles = 0,
  colorParalleles = 'gray',
  nbMeridiens = 0,
  colorMeridiens = 'black',
  affichageAxe = false,
  colorAxe = 'black',
  inclinaison = 0,
  faceCachee = true,
) {
  return new Sphere3d(
    centre,
    rayon,
    colorEquateur,
    colorEnveloppe,
    nbParalleles,
    colorParalleles,
    nbMeridiens,
    colorMeridiens,
    affichageAxe,
    colorAxe,
    inclinaison,
    faceCachee,
  )
}
