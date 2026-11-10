import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { droite } from '../../2d/droites'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import type { PointAbstrait } from '../../2d/PointAbstrait'
import { polygone, renommePolygone } from '../../2d/polygones'
import { segment } from '../../2d/segmentsVecteurs'
import { labelPoint } from '../../2d/textes'
import { tracePoint } from '../../2d/TracePoint'
import { translation } from '../../2d/transformations'
import {
  estDansPolygone,
  longueur,
  norme,
} from '../../2d/utilitairesGeometriques'
import { pointIntersectionDD, pointSurSegment } from '../../2d/utilitairesPoint'
import { vecteur } from '../../2d/Vecteur'
import { choisitLettresDifferentes } from '../../outils/aleatoires'
import { Point3d, Polygone3d, arete3d } from './elementsEtTransformations3d'

/**
 * Classe de la pyramide
 * (optimisée au niveau des pointillés pour une base sur le plan xOy et un sommet plus haut ou plus bas que la base)
 * @param {Polygone3d} base Base de la pyramide
 * @param {Point3d} sommet Sommet de la pyramide
 * @param {string} [color = 'black'] Couleur des arêtes du prisme droit : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {Point3d} [centre] Centre de la pyramide... Entraine l'affichage de ce centre
 * @param {boolean} [affichageAxe = false] Permet (ou pas) l'affichage de l'axe de la pyramide. Ne fonctionne que si centre est défini.
 * @param {string} [colorAxe = 'black'] Couleur de l'axe et du centre de la base de la pyramide : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageNom = false] Permet (ou pas) l'affichage du nom des sommets de la pyramide.
 * @param {boolean} [estCone = false] Permet (ou pas) de considérer la pyramide comme un cône... dans le cas où la base est un disque.
 * @param {string} [colorCone = 'gray'] Couleur du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {Polygone3d} base Base de la pyramide
 * @property {Point3d} sommet Sommet de la pyramide
 * @property {string} color Couleur des arêtes de la pyramide : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {Point3d} centre Centre de la pyramide... Entraine l'affichage de ce centre
 * @property {boolean} affichageAxe Permet (ou pas) l'affichage de l'axe de la pyramide. Ne fonctionne que si centre est défini.
 * @property {string} colorAxe Couleur de l'axe et du centre de la base de la pyramide : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {boolean} affichageNom Permet (ou pas) l'affichage du nom des sommets de la pyramide.
 * @property {string} nom Nom de la pyramide (si affichageNom = true)
 * @property {string} colorCone Couleur du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {arete3d[]} aretesSommet Ce tableau contient les arêtes liant le sommet de la pyramide aux sommets de la base
 * @property {Array} c2d Contient les commandes à tracer en 2d de cette fonction
 * @author Éric Elter (d'après version précédente de Jean-claude Lhote)
 * @class
 */

export class Pyramide3d extends ObjetMathalea2D {
  constructor(
    base: Polygone3d,
    sommet: Point3d,
    color: string = 'black',
    centre?: Point3d,
    affichageAxe = false,
    colorAxe = 'black',
    affichageNom = false,
    estCone = false,
    colorCone = 'gray',
    affichageBase = true,
  ) {
    super()
    base.color = color
    this.base = base
    this.sommet = sommet
    this.color = colorToLatexOrHTML(color)
    this.centre = centre
    this.affichageAxe = affichageAxe
    this.colorAxe = colorAxe
    this.affichageNom = affichageNom
    this.estCone = estCone
    this.colorCone = colorCone
    this.c2d = []
    this.nom = ''
    let s

    // Stockage de toutes les arêtes issues du sommet
    this.aretesSommet = []

    for (let i = 0; i < this.base.listePoints.length; i++) {
      s = arete3d(this.base.listePoints[i], this.sommet, color, true)
      // s.c2d.isVisible = false
      this.aretesSommet.push(s)
    }

    // Stockage de toutes les arêtes de la base
    const aretesBase = []
    for (let i = 0; i < this.base.listePoints.length; i++) {
      s = arete3d(
        this.base.listePoints[i],
        this.base.listePoints[(i + 1) % this.base.listePoints.length],
        color,
        true,
      )
      aretesBase.push(s)
    }

    // Recherche des sommets arrières (donc toutes les arêtes issues de ce point sont cachées)
    let sommetCache = false
    let sommetCacheAvant
    const angleReference = [0, 0]
    const sommetGeneratriceCone = []

    for (let i = 0; i < this.base.listePoints.length; i++) {
      sommetCacheAvant = sommetCache
      sommetCache = false
      for (let j = 1; j < this.base.listePoints.length - 1; j++) {
        const poly = polygone([
          this.sommet.c2d,
          this.base.listePoints[(i + j) % this.base.listePoints.length].c2d,
          this.base.listePoints[(i + j + 1) % this.base.listePoints.length].c2d,
        ])
        poly.isVisible = false
        sommetCache =
          sommetCache || estDansPolygone(this.base.listePoints[i].c2d, poly)
      }
      if (this.estCone && sommetCacheAvant !== sommetCache && i !== 0) {
        if (sommetCache)
          sommetGeneratriceCone.push(
            this.aretesSommet[
              (this.aretesSommet.length + i - 1) % this.aretesSommet.length
            ],
          )
        else sommetGeneratriceCone.push(this.aretesSommet[i])
        if (sommetCache) angleReference[1] = i
        else angleReference[0] = i
      }
      if (sommetCache) {
        if (sommet.z > this.base.listePoints[0].z) {
          // Si le sommet est au-dessus de la base
          this.aretesSommet[i].isVisible = false
          this.aretesSommet[i].c2d.pointilles = 2
          aretesBase[i].c2d.pointilles = 2
          aretesBase[
            (this.base.listePoints.length + i - 1) %
              this.base.listePoints.length
          ].c2d.pointilles = 2
        }
      }
    }

    if (this.estCone && angleReference[1] <= angleReference[0]) {
      angleReference[1] += this.base.listePoints.length
    }

    if (this.estCone && sommetGeneratriceCone.length === 1) {
      sommetGeneratriceCone.push(
        this.aretesSommet[this.aretesSommet.length - 1],
      )
      angleReference[1] = this.aretesSommet.length - 1
    }
    if (this.estCone) {
      const premierPlan = [this.sommet.c2d]
      for (let i = angleReference[0]; i < angleReference[1]; i++) {
        premierPlan.push(
          this.base.listePoints[i % this.base.listePoints.length].c2d,
        )
        // ok
      }
      const faceAv = polygone(premierPlan, this.colorCone)
      faceAv.couleurDeRemplissage = colorToLatexOrHTML(this.colorCone)
      this.c2d.push(faceAv)
    }

    if (!this.estCone) {
      let longueurSegment
      if (this.sommet.z > this.base.listePoints[0].z) {
        // Si le sommet est au-dessus de la base
        // Recherche de l'arête cachée possible issue de deux sommets non cachés.
        for (let i = 0; i < this.base.listePoints.length; i++) {
          sommetCache = false
          longueurSegment = longueur(
            this.base.listePoints[i].c2d,
            this.base.listePoints[(i + 1) % this.base.listePoints.length].c2d,
          )
          s = segment(
            pointSurSegment(
              this.base.listePoints[i].c2d,
              this.base.listePoints[(i + 1) % this.base.listePoints.length].c2d,
              longueurSegment / 20,
            ),
            pointSurSegment(
              this.base.listePoints[i].c2d,
              this.base.listePoints[(i + 1) % this.base.listePoints.length].c2d,
              (19 * longueurSegment) / 20,
            ),
          )
          s.isVisible = false
          for (let j = 0; j < this.aretesSommet.length; j++) {
            sommetCache = sommetCache || !!s.estSecant(this.aretesSommet[j].c2d)
          }
          if (sommetCache) aretesBase[i].c2d.pointilles = 2
        }
      } else {
        // Si le sommet est en dessous de la base
        for (let i = 0; i < this.base.listePoints.length; i++) {
          longueurSegment = longueur(
            this.base.listePoints[i].c2d,
            this.sommet.c2d,
          )
          s = segment(
            pointSurSegment(
              this.base.listePoints[i].c2d,
              this.sommet.c2d,
              longueurSegment / 20,
            ),
            this.sommet.c2d,
          )
          s.isVisible = false
          let j = 0
          while (j < aretesBase.length && !s.estSecant(aretesBase[j].c2d)) {
            j++
          }
          if (j < aretesBase.length) this.aretesSommet[i].c2d.pointilles = 2
        }
      }
      for (let i = 0; i < this.base.listePoints.length; i++) {
        this.c2d.push(this.aretesSommet[i].c2d)
      }
    } else {
      for (let i = 0; i < sommetGeneratriceCone.length; i++) {
        this.c2d.push(sommetGeneratriceCone[i].c2d)
      }
    }

    if (affichageBase) {
      for (let i = 0; i < this.base.listePoints.length; i++) {
        this.c2d.push(aretesBase[i].c2d)
      }
    }

    if (this.centre !== undefined && this.centre.constructor === Point3d) {
      this.c2d.push(tracePoint(this.centre.c2d, this.colorAxe))
      if (this.centre.label === '')
        this.centre.label = choisitLettresDifferentes(1, 'OQWX')[0]
      this.c2d.push(...labelPoint(this.centre.c2d))

      if (this.affichageAxe) {
        // Axe affiché que si centre précisé
        if (this.sommet.z > 0) {
          let intersectionTrouvee = false
          let ee = 0
          // Recherche du point d'intersection visuelle entre l'axe et une arête visible de la base
          while (!intersectionTrouvee && ee < aretesBase.length) {
            s = aretesBase[ee].c2d
            if (s.pointilles !== 2) {
              // L'arête coupée doit être visible
              const d1 = droite(this.centre.c2d, this.sommet.c2d)
              d1.isVisible = false
              intersectionTrouvee = !!s.estSecant(d1)
            }
            ee++
          }
          if (intersectionTrouvee) {
            ee--
            const d1 = droite(
              this.base.listePoints[ee].c2d,
              this.base.listePoints[(ee + 1) % this.base.listePoints.length]
                .c2d,
            )
            d1.isVisible = false
            const d2 = droite(this.centre.c2d, this.sommet.c2d)
            d2.isVisible = false
            const ptBase = pointIntersectionDD(d1, d2)
            if (!ptBase) {
              window.notify('Axe de la pyramide non défini correctement', {
                d1,
                d2,
              })
              return
            }
            s = segment(ptBase, this.sommet.c2d, this.colorAxe)
            s.pointilles = 2
            this.c2d.push(s)
            s = segment(
              ptBase,
              translation(ptBase, vecteur(this.centre.c2d, ptBase)),
              this.colorAxe,
            )
            this.c2d.push(s)
            s = segment(
              this.sommet.c2d as PointAbstrait,
              translation(
                this.sommet.c2d as PointAbstrait,
                vecteur(ptBase, this.centre.c2d),
              ),
              this.colorAxe,
            )
            this.c2d.push(s)
          }
        } else {
          s = segment(this.centre.c2d, this.sommet.c2d, this.colorAxe)
          s.pointilles = 2
          this.c2d.push(s)
          const v = vecteur(this.centre.c2d, this.sommet.c2d)
          const L = longueur(this.base.listePoints[0].c2d, this.centre.c2d)
          const h = 2 * norme(v)
          s = segment(
            this.sommet.c2d as PointAbstrait,
            translation(
              this.sommet.c2d as PointAbstrait,
              vecteur((L * v.x) / h, (L * v.y) / h),
            ),
            this.colorAxe,
          )
          this.c2d.push(s)
          s = segment(
            this.centre.c2d,
            translation(
              this.centre.c2d,
              vecteur((-L * v.x) / h, (-L * v.y) / h),
            ),
            this.colorAxe,
          )
          this.c2d.push(s)
        }
      }
    }

    if (this.affichageNom) {
      const p = polygone(this.base.listePoints2d)
      p.isVisible = false
      if (this.centre.label === '' || this.centre.label === this.sommet.label)
        this.sommet.label = choisitLettresDifferentes(1, 'OQWX')[0]
      const labelsRenseignes = p.listePoints.map((pt) => pt.nom).join('')
      const nomBase =
        labelsRenseignes === ''
          ? choisitLettresDifferentes(
              this.base.listePoints.length,
              'OQWX' + this.sommet.label + this.centre.label,
            )
          : Array.from(labelsRenseignes)
      renommePolygone(p, nomBase)
      for (let ee = 0; ee < this.base.listePoints2d.length; ee++) {
        this.base.listePoints2d[ee].positionLabel =
          this.sommet.z > 0 ? 'below' : 'above'
      }
      this.c2d.push(labelPoint(...p.listePoints))
      this.c2d.push(labelPoint(this.sommet.c2d))
      this.nom = nomBase.join('') + this.sommet.label
    }
  }
}
/**
 * Crée une pyramide
 * @param {Polygone3d} base Base de la pyramide
 * @param {Point3d} sommet Sommet de la pyramide
 * @param {string} [color = 'black'] Couleur des arêtes de la pyramide : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {Point3d} [centre] Centre de la pyramide... Entraine l'affichage de ce centre
 * @param {boolean} [affichageAxe = false] Permet (ou pas) l'affichage de l'axe de la pyramide. Ne fonctionne que si centre est défini.
 * @param {string} [colorAxe = 'black'] Couleur de l'axe et du centre de la base de la pyramide : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageNom = false] Permet (ou pas) l'affichage du nom des sommets de la pyramide.
 * @param {boolean} [estCone = false] Permet (ou pas) de considérer la pyramide comme un cône
 * @param {string} [colorCone = 'gray'] Couleur du cône : du type 'red', bleuMathalea ou du type '#f15929'
 * @author Éric Elter (d'après version précédente de Jean-claude Lhote)
 * @example pyramide3d(p,A) // Créé une pyramide de base p et de sommet A
 * @example pyramide3d(p,A,'red') // Créé une pyramide de base p et de sommet A et dont les arêtes sont rouges
 * @example pyramide3d(p,A,'red',B) // Créé une pyramide de base p et de sommet A et dont les arêtes sont rouges, le centre affiché est B
 * @example pyramide3d(p,A,'red',B,true,'green') // Créé une pyramide de base p et de sommet A et dont les arêtes sont rouges, le centre affiché est B, l'axe affiché est vert
 * @example pyramide3d(p,A,'red',B,true,'green',true) // Créé une pyramide de base p et de sommet A et dont les arêtes sont rouges, le centre affiché est B, l'axe affiché est vert, les sommets sont nommés
 * @example pyramide3d(c,A,'red',B,true,'green',false,true) // Créé un CONE de cercle c et de sommet A et dont les "arêtes" sont rouges, le centre affiché est B, l'axe affiché est vert
 * @example pyramide3d(c,A,'red',B,true,'green',false,true,bleuMathalea) // Créé un CONE de cercle c et de sommet A et dont les "arêtes" sont rouges, le centre affiché est B, l'axe affiché est vert et le cône est peint en vert
 * @return {Pyramide3d}
 */
export function pyramide3d(
  base: Polygone3d,
  sommet: Point3d,
  color = 'black',
  centre?: Point3d,
  affichageAxe = false,
  colorAxe = 'black',
  affichageNom = false,
  estCone = false,
  colorCone = 'gray',
  affichageBase = true,
) {
  return new Pyramide3d(
    base,
    sommet,
    color,
    centre,
    affichageAxe,
    colorAxe,
    affichageNom,
    estCone,
    colorCone,
    affichageBase,
  )
}
