import { droite } from '../../lib/2d/droites'
import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { projectionOrtho, rotation } from '../../lib/2d/transformations'
import { angleOriente, longueur } from '../../lib/2d/utilitairesGeometriques'
import { milieu, pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { centreCercleCirconscrit } from '../../lib/2d/utilitairesTriangle'
import type {
  IAlea2iep,
  OptionsCompas,
  OptionsOutilMesure,
  OptionsRegle,
} from '../Alea2iep.types'

type OptionsMediatriceAuCompas = OptionsCompas & {
  longueur1?: number // Longueur pour le codage d'angle
  longueur2?: number // Longueur pour le codage d'angle
  coderFigure?: boolean // Si true, on ajoute le codage de la figure
}

/**
 * Trace la médiatrice de [AB] au compas. Le paramétrage des longueurs correspond à la distance entre le milieu du segment et le point d'intersection des arcs de cercles
 * @param {point} A
 * @param {point} B
 * @param {objet} options Défaut : {longueur1: 3, longueur2: 3, codage: 'X', couleurCodage : this.couleurCodage, couleurCompas: this.couleurCompas, coderFigure: true}
 * @return {array} [arc1, arc2, arc3, arc4, codage1?, codage2?, codageCarre?]
 */
export const mediatriceAuCompas = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  options: OptionsMediatriceAuCompas = {},
): number[] {
  options.longueur1 = options.longueur1 ?? 3
  options.longueur2 = options.longueur2 ?? -3
  options.codage = options.codage ?? 'X'
  options.couleurCodage = options.couleurCodage ?? this.couleurCodage
  options.couleurCompas = options.couleurCompas ?? this.couleurCompas
  options.coderFigure = options.coderFigure ?? true
  const O = milieu(A, B)
  const O2 = rotation(A, O, -90)
  const M = pointSurSegment(O, O2, options.longueur1)
  const N = pointSurSegment(O, O2, options.longueur2)
  this.compasMontrer()
  this.compasDeplacer(A, options)
  let arc1, arc2, arc3, arc4
  if (options.longueur1 === -1 * options.longueur2) {
    // Si la distance est la même des deux côtés, on peut faire les arcs de part et d'autre
    this.compasEcarter(longueur(A, M), {
      vitesse: options.vitesse,
      sens: options.vitesse,
    })
    arc1 = this.compasTracerArcCentrePoint(A, M, {
      delta: options.delta,
      couleur: options.couleurCompas,
      sens: options.sens,
      vitesse: options.vitesse,
      tempo: options.tempo,
    })
    arc2 = this.compasTracerArcCentrePoint(A, N, {
      delta: options.delta,
      couleur: options.couleurCompas,
      sens: options.sens,
      vitesse: options.vitesse,
      tempo: options.tempo,
    })
    arc4 = this.compasTracerArcCentrePoint(B, N, {
      delta: options.delta,
      couleur: options.couleurCompas,
      sens: options.sens,
      vitesse: options.vitesse,
      tempo: options.tempo,
    })
    arc3 = this.compasTracerArcCentrePoint(B, M, {
      delta: options.delta,
      couleur: options.couleurCompas,
      sens: options.sens,
      vitesse: options.vitesse,
      tempo: options.tempo,
    })
  } else {
    this.compasEcarter(longueur(A, M), options)
    arc1 = this.compasTracerArcCentrePoint(A, M, {
      delta: options.delta,
      couleur: options.couleurCompas,
      sens: options.sens,
      vitesse: options.vitesse,
      tempo: options.tempo,
    })
    arc2 = this.compasTracerArcCentrePoint(B, M, {
      delta: options.delta,
      couleur: options.couleurCompas,
      sens: options.sens,
      vitesse: options.vitesse,
      tempo: options.tempo,
    })
    arc3 = this.compasTracerArcCentrePoint(B, N, {
      delta: options.delta,
      couleur: options.couleurCompas,
      sens: options.sens,
      vitesse: options.vitesse,
      tempo: options.tempo,
    })
    arc4 = this.compasTracerArcCentrePoint(A, N, {
      delta: options.delta,
      couleur: options.couleurCompas,
      sens: options.sens,
      vitesse: options.vitesse,
      tempo: options.tempo,
    })
  }
  this.compasMasquer()
  if (M.x <= N.x) {
    this.regleDroite(M, N, options)
  } else {
    this.regleDroite(N, M, options)
  }
  this.regleMasquer()
  if (options.coderFigure) {
    const codage1 = this.segmentCodage(A, O, {
      codage: options.codage,
      couleur: options.couleurCodage,
      tempo: options.tempo,
    })
    const codage2 = this.segmentCodage(O, B, {
      codage: options.codage,
      couleur: options.couleurCodage,
      tempo: options.tempo,
    })
    const codageCarre = this.codageAngleDroit(A, O, O2, {
      couleur: options.couleurCodage,
      tempo: options.tempo,
      vitesse: options.vitesse,
    })
    return [arc1, arc2, arc3, arc4, codage1, codage2, ...codageCarre]
  } else {
    return [arc1, arc2, arc3, arc4]
  }
}
/**
 * Trace la médiatrice du segment [AB] avec la méthode Règle + équerre.
 * @param {point} A
 * @param {point} B
 * @param {booléen} codage
 */
export const mediatriceRegleEquerre = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  codage = 'X',
) {
  const O = milieu(A, B)
  this.regleMontrer()
  this.regleDeplacer(A)
  this.regleRotation(B)
  this.crayonMontrer()
  const O2 = rotation(A, O, -90)
  const O3 = rotation(A, O, 90)
  const M = pointSurSegment(O, O2, 0.2)
  const N = pointSurSegment(O, O3, 0.2)
  if (this.y(M) > this.y(N)) {
    this.trait(O, M)
  } else {
    this.trait(O, N)
  }
  this.regleMasquer()
  if (this.x(A) < this.x(B)) {
    this.equerreDeplacer(A)
    this.equerreMontrer()
    this.equerreRotation(B)
  } else {
    this.equerreDeplacer(B)
    this.equerreMontrer()
    this.equerreRotation(A)
  }
  this.equerreDeplacer(O)
  this.crayonDeplacer(O)
  this.trait(O, O2)
  this.equerreMasquer()
  this.regleDroite(O2, O3)
  this.regleMasquer()
  this.segmentCodage(A, O, { codage })
  this.segmentCodage(O, B, { codage })
  this.codageAngleDroit(A, O, O2)
}
/**
 * Trace la hauteur issue de C dans un triangle ABC. Prolonge si besoin le segment [AB] pour avoir le pied de la hauteur et le codage de l'angle droit.
 * @param {point} A 1er point de la base
 * @param {point} B 2e point de la base
 * @param {point} C Sommet dont est issue la hauteur
 * @param {booléen} codage angle droit ajouté si true
 */
export const hauteur = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  codage = true,
) {
  const d = droite(A, B)
  d.isVisible = false
  const H = projectionOrtho(C, d)
  let G, D
  if (this.x(A) < this.x(B)) {
    G = A
    D = B
  } else {
    G = B
    D = A
  }
  if (this.x(H) < this.x(G) || this.x(H) > this.x(D)) {
    if (this.x(H) < this.x(G)) {
      // si le pied de la hauteur est trop à gauche
      this.regleProlongerSegment(D, G, {
        longueur: longueur(G, H) + 2,
        pointilles: true,
        couleur: 'red',
      })
    }
    if (this.x(H) > this.x(D)) {
      // si le pied de la hauteur est trop à droite
      this.regleProlongerSegment(G, D, {
        longueur: longueur(D, H) + 2,
        pointilles: true,
        couleur: 'red',
      })
    }
    this.regleMasquer()
  }
  if (this.x(A) < this.x(B)) {
    this.equerreDeplacer(A)
    this.equerreMontrer()
    this.equerreRotation(B)
  } else {
    this.equerreDeplacer(B)
    this.equerreMontrer()
    this.equerreRotation(A)
  }
  this.equerreDeplacer(H)
  this.crayonMontrer()
  this.crayonDeplacer(H)
  this.trait(H, C, { epaisseur: 1, couleur: 'red' })
  this.equerreMasquer()
  if (codage) {
    this.codageAngleDroit(A, H, C, { epaisseur: 1, couleur: 'red' })
  }
  this.crayonMasquer()
}
/**
 * Trace la médiane issue de C passant par le milieu de [AB]
 * @param {point} A
 * @param {point} B
 * @param {point} C
 * @param {objet} options
 */
export const mediane = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  options: OptionsRegle = {},
) {
  options.codage = options.codage ?? 'X'
  options.epaisseur = options.epaisseur ?? 1
  options.couleur = options.couleur ?? 'green'
  const O = milieu(A, B)
  this.regleMontrer(A, options)
  this.regleRotation(B, options)
  this.crayonMontrer()
  const O2 = rotation(A, O, -90)
  const O3 = rotation(A, O, 90)
  const M = pointSurSegment(O, O2, 0.2)
  const N = pointSurSegment(O, O3, 0.2)
  if (M.y > N.y) {
    this.trait(O, M, options)
  } else {
    this.trait(O, N, options)
  }
  this.regleSegment(O, C, options)
  if (options.codage) {
    this.segmentCodage(A, O, options)
    this.segmentCodage(O, B, options)
  }
}

type OptionsIepBissectrice = OptionsCompas & {
  masquerTraitsDeConstructions?: boolean // Si true, on masque les traits de construction
  distanceDeA?: number // Distance de A pour pointSurSegment()
}
/**
 * Trace la bissectrice de l'angle ABC au compas.
 * @param {point} A
 * @param {point} B
 * @param {point} C
 * @param {objet} param3
 * @returns {objet} {arc1, arc2, arc3, arc4}
 * { codage = '/', l = 2, couleur = this.couleur, tempo = this.tempo, vitesse = this.vitesse, sens = Math.round(this.vitesse / 2), epaisseur = this.epaisseur, pointilles = this.pointilles, couleurCodage = this.couleurCodage, masquerTraitsDeConstructions = true } = {}
 */
export const bissectriceAuCompas = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  options: OptionsIepBissectrice = {},
) {
  options.codage = options.codage ?? '/'
  options.distanceDeA = options.distanceDeA ?? 2
  options.masquerTraitsDeConstructions =
    options.masquerTraitsDeConstructions ?? true
  options.longueur = options.longueur ?? longueur(B, A)
  options.epaisseur = options.epaisseur ?? 1
  const A1 = pointSurSegment(B, A, options.distanceDeA)
  const C1 = pointSurSegment(B, C, options.distanceDeA)
  const angle = angleOriente(A, B, C)
  const M = rotation(B, A1, -(180 - angle))
  const arc1 = this.compasTracerArcCentrePoint(B, A1, options)
  const arc2 = this.compasTracerArcCentrePoint(B, C1, options)
  const arc3 = this.compasTracerArcCentrePoint(A1, M, options)
  const arc4 = this.compasTracerArcCentrePoint(C1, M, options)
  this.compasMasquer()
  this.regleDemiDroiteOriginePoint(B, M, options)
  this.regleMasquer()
  this.crayonMasquer()
  if (options.codage) {
    this.angleCodage(A, B, M, options)
    this.angleCodage(M, B, C, options)
  }
  if (options.masquerTraitsDeConstructions) {
    this.traitMasquer(arc1)
    this.traitMasquer(arc2)
    this.traitMasquer(arc3)
    this.traitMasquer(arc4)
  }
  return { arc1, arc2, arc3, arc4 }
}

type OptionsIepCercleCirconscrit = OptionsOutilMesure & {
  couleurMediatrice?: string
  couleurCercle?: string
}
/**
 * Construit les 3 médiatrices des côtés du triangle ABC puis le cercle circonscrit au triangle
 * @param {point} A
 * @param {point} B
 * @param {point} C
 * @param {objet} options
 */
export const cercleCirconscrit = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  options: OptionsIepCercleCirconscrit = {},
) {
  options.couleurMediatrice =
    options.couleurMediatrice ?? options.couleur ?? this.couleur
  options.couleurCercle =
    options.couleurCercle ?? options.couleur ?? this.couleur
  options.codage = options.codage ?? 'X'
  const m1 = mediatriceAuCompas.call(this, A, B, options)
  this.traitMasquer(m1[0]) // On cache les arcs de cercle une fois la médiatrice tracée
  this.traitMasquer(m1[1])
  this.traitMasquer(m1[2])
  this.traitMasquer(m1[3])
  options.codage = '||'
  const m2 = mediatriceAuCompas.call(this, B, C, options)
  this.traitMasquer(m2[0])
  this.traitMasquer(m2[1])
  this.traitMasquer(m2[2])
  this.traitMasquer(m2[3])
  options.codage = '///'
  const m3 = mediatriceAuCompas.call(this, A, C, options)
  this.traitMasquer(m3[0])
  this.traitMasquer(m3[1])
  this.traitMasquer(m3[2])
  this.traitMasquer(m3[3])
  const O = centreCercleCirconscrit(A, B, C)
  options.couleur = options.couleurCercle
  this.compasCercleCentrePoint(O, A, options)
}
