import { droite } from '../../lib/2d/droites'
import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { milieu } from '../../lib/2d/utilitairesPoint'
import type { IAlea2iep } from '../Alea2iep.types'

/**
 * Trace la médiatrice de [AB] au compas. Le paramétrage des longueurs correspond à la distance entre le milieu du segment et le point d'intersection des arcs de cercles
 * @param {point} A
 * @param {point} B
 * @param {objet} options Défaut : {longueur1: 3, longueur2: 3, codage: 'X', couleurCodage : this.couleurCodage, couleurCompas: this.couleurCompas, coderFigure: true}
 * @return {array} [arc1, arc2, arc3, arc4, codage1?, codage2?, codageCarre?]
 */
export const milieuALaRegle = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  nom?: string,
): void {
  if (this.x(A) === this.x(B) && this.y(A) === this.y(B)) {
    return
  }
  const depart = A.x < B.x ? A : A.x > B.x ? B : A.y < B.y ? A : B
  const arrivee = depart === A ? B : A
  const d = droite(depart, arrivee)
  const O = milieu(A, B, nom)
  const isRegleVisible = this.regle.visibilite
  this.regleMontrerGraduations()
  if (!isRegleVisible) {
    this.regleMontrer()
  }
  this.regleRotationTranslation(d.angleAvecHorizontale, depart, {})
  this.crayonMontrer(O)
  this.pointCreer(O, nom === undefined ? {} : { label: nom })
  if (!isRegleVisible) {
    this.regleMasquer()
  }
  this.regleMasquerGraduations()
}
