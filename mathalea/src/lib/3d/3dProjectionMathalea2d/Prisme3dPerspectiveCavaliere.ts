import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import { polygone, renommePolygone } from '../../2d/polygones'
import { segment } from '../../2d/segmentsVecteurs'
import { labelPoint } from '../../2d/textes'
import { estDansPolygone, longueur } from '../../2d/utilitairesGeometriques'
import { pointSurSegment } from '../../2d/utilitairesPoint'
import { choisitLettresDifferentes } from '../../outils/aleatoires'
import {
  Polygone3d,
  Vecteur3d,
  arete3d,
  translation3d,
  vecteur3d,
} from './elementsEtTransformations3d'

/**
 * Classe du prisme droit
 * Ce prisme droit est optimisé dans son tracé des arêtes cachées pour des bases dans le plan (xOy) et son vecteur normal selon (Oz)
 * Pour d'autres usages, il faut approfondir la fonction mais laissé en l'état car justement pas d'autre usage demandé.
 * @param {Polygone3d} base Une des deux bases du prisme droit
 * @param {Vecteur3d} vecteur Vecteur normal à la base dont la norme indique la hauteur du prisme droit.
 * @param {string} [color = 'black'] Couleur des arêtes du prisme droit : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageNom = false] Permet (ou pas) l'affichage du nom des sommets du prisme.
 * @property {Polygone3d} base1 La base entièrement visible du prisme droit
 * @property {Vecteur3d} vecteur Vecteur normal à la base dont la norme indique la hauteur du prisme droit.
 * @property {string} [color = 'black'] Couleur des arêtes du prisme droit : du type 'red', bleuMathalea ou du type '#f15929'
 * @property {boolean} [affichageNom = false] Permet (ou pas) l'affichage du nom des sommets du prisme.
 * @property {Array} c2d Contient les commandes à tracer en 2d de cette fonction
 * @property {string} nom Nom du prisme
 * @author Éric Elter (d'après version précédente de Jean-claude Lhote)
 * @class
 */

export class Prisme3d extends ObjetMathalea2D {
  constructor(
    base: Polygone3d,
    vecteur: Vecteur3d,
    color: string = 'black',
    affichageNom = false,
    nomBase2?: string,
    positionLabels2?: string[],
  ) {
    super()
    this.affichageNom = affichageNom
    this.color = colorToLatexOrHTML(color)
    base.color = this.color[0]
    this.vecteur = vecteur
    if (this.vecteur.y === 0 && this.vecteur.x === 0) {
      this.base1 =
        this.vecteur.z >= 1
          ? base
          : translation3d(
              base,
              vecteur3d(this.vecteur.x, this.vecteur.y, -this.vecteur.z),
            )
      this.base2 = this.vecteur.z < 1 ? base : translation3d(base, this.vecteur)
    } else {
      this.base1 = base
      this.base2 = translation3d(base, vecteur)
    }
    this.base2.color = this.base1.color
    this.c2d = []
    let s
    // On trace this.base1 (toujours visible)
    for (let i = 0; i < this.base1.listePoints.length; i++) {
      this.c2d.push(this.base1.c2d[i])
    }
    // On cherche les sommets cachés de this.base2
    let toutesLesAretesSontVisibles = true
    for (let i = 0; i < this.base1.listePoints.length; i++) {
      const areteVisibleOuPas = estDansPolygone(
        pointSurSegment(
          this.base1.listePoints[i].c2d,
          this.base2.listePoints[i].c2d,
          longueur(
            this.base1.listePoints[i].c2d,
            this.base2.listePoints[i].c2d,
          ) / 50,
        ),
        polygone(this.base1.listePoints2d),
      )
      this.base2.listePoints[i].isVisible = !areteVisibleOuPas
      toutesLesAretesSontVisibles =
        !areteVisibleOuPas && toutesLesAretesSontVisibles
    }
    // On trace les arêtes de this.base2
    for (let i = 0; i < this.base2.listePoints.length; i++) {
      s = arete3d(
        this.base2.listePoints[i],
        this.base2.listePoints[
          i + 1 === this.base2.listePoints.length ? 0 : i + 1
        ],
        this.color[0],
      )
      if (toutesLesAretesSontVisibles) {
        // Cas particulier où aucun sommet de this.base2 n'est caché (cas de certains tétraèdres)
        let areteVisibleOuPas = true
        for (let ee = 0; ee < this.base1.listePoints.length; ee++) {
          const areteLiaison = segment(
            this.base1.listePoints[ee].c2d,
            this.base2.listePoints[ee].c2d,
          )
          areteVisibleOuPas =
            areteVisibleOuPas && !!areteLiaison.estSecant(s.c2d)
        }
        s = arete3d(
          this.base2.listePoints[i],
          this.base2.listePoints[
            i + 1 === this.base2.listePoints.length ? 0 : i + 1
          ],
          this.color[0],
          !areteVisibleOuPas,
        )
      }
      this.c2d.push(s.c2d)
    }
    // On trace les arêtes de liaison entre les bases
    for (let i = 0; i < this.base1.listePoints.length; i++) {
      s = arete3d(
        this.base1.listePoints[i],
        this.base2.listePoints[i],
        this.color[0],
      )
      this.c2d.push(s.c2d)
    }

    if (this.affichageNom) {
      let p = polygone(this.base1.listePoints2d)
      const listeLettres = choisitLettresDifferentes(
        this.base1.listePoints.length,
        'OQWX',
      )
      const nomBase1 = base.listePoints2d.map(
        (el, index) => el.nom ?? listeLettres[index],
      )

      renommePolygone(p, nomBase1)
      for (let ee = 0; ee < this.base1.listePoints2d.length; ee++) {
        this.base1.listePoints2d[ee].positionLabel =
          base.listePoints2d[ee].positionLabel ?? 'above'
      }
      this.c2d.push(labelPoint(...p.listePoints))
      p = polygone(this.base2.listePoints2d)
      const listeDeLettres2 = choisitLettresDifferentes(
        this.base1.listePoints.length,
        'OQWX' + nomBase1,
      )
      renommePolygone(p, nomBase2 ?? listeDeLettres2)
      for (let ee = 0; ee < this.base2.listePoints2d.length; ee++) {
        this.base2.listePoints2d[ee].positionLabel =
          positionLabels2?.[ee] ?? 'below'
      }
      this.c2d.push(labelPoint(...p.listePoints))
      this.nom = nomBase1 + (nomBase2 ?? '')
    }
  }
}
/**
 * Crée un prisme droit
 * Ce prisme droit est optimisé dans son tracé des arêtes cachées pour des bases dans le plan (xOy) et son vecteur normal selon (Oz)
 * Pour d'autres usages, il faut approfondir la fonction mais laissé en l'état car justement pas d'autre usage demandé.
 * @param {Polygone3d} base Une des deux bases du prisme droit
 * @param {Vecteur3d} vecteur Vecteur normal à la base dont la norme indique la hauteur du prisme droit.
 * @param {string} [color = 'black'] Couleur des arêtes du prisme droit : du type 'red', bleuMathalea ou du type '#f15929'
 * @param {boolean} [affichageNom = false] Permet (ou pas) l'affichage du nom des sommets du prisme.
 * @param {string} [nomBase2] Nom de la base 2
 * @param {string[]} [positionLabels2] Position des labels de la base 2
 * @example prisme3d(p, v)
 * // Retourne un prisme droit de base p dont un vecteur normal à la base est v.
 * @example prisme3d(p, v, bleuMathalea, true)
 * // Retourne un prisme droit de base p dont un vecteur normal à la base est v, de couleur V et dont les sommets sont nommés
 * @author Éric Elter (d'après version précédente de Jean-claude Lhote)
 * @return {Prisme3d}
 */
export function prisme3d(
  base: Polygone3d,
  vecteur: Vecteur3d,
  color: string = 'black',
  affichageNom = false,
  nomBase2?: string,
  positionLabels2?: string[],
) {
  return new Prisme3d(
    base,
    vecteur,
    color,
    affichageNom,
    nomBase2,
    positionLabels2,
  )
}
