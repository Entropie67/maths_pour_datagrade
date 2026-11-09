import { cercle } from '../../lib/2d/cercle'
import { droite, droiteParPointEtPerpendiculaire } from '../../lib/2d/droites'
import { pointAbstrait, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { homothetie, rotation } from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import {
  pointAdistance,
  pointIntersectionCC,
  pointIntersectionDD,
  pointIntersectionLC,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { nombreAvecEspace } from '../../lib/outils/texNombre'
import type { IAlea2iep, OptionsCompas } from '../Alea2iep.types'
import { randint } from '../outils'
import { bleuMathalea } from '../../lib/colors'

type PositionNom = Pick<PointAbstrait, 'x' | 'y'>
type TraitNom = readonly [PositionNom, PositionNom]

function distanceAuTrait(x: number, y: number, [A, B]: TraitNom): number {
  const dx = B.x - A.x
  const dy = B.y - A.y
  const projection =
    dx * dx + dy * dy === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((x - A.x) * dx + (y - A.y) * dy) / (dx * dx + dy * dy)),
        )
  return Math.hypot(x - A.x - projection * dx, y - A.y - projection * dy)
}

/** Segments qui approchent l'arc IEP de 10° de part et d'autre du point. */
function traitsArc(centre: PointAbstrait, point: PointAbstrait): TraitNom[] {
  const rayon = longueur(centre, point)
  const angle = Math.atan2(point.y - centre.y, point.x - centre.x)
  const points = Array.from({ length: 9 }, (_, index) => {
    const direction = angle + ((index - 4) * 2.5 * Math.PI) / 180
    return {
      x: centre.x + rayon * Math.cos(direction),
      y: centre.y + rayon * Math.sin(direction),
    }
  })
  return points
    .slice(1)
    .map((pointFinal, index): TraitNom => [points[index], pointFinal])
}

/** Choisit un emplacement éloigné des traits de la figure et de la construction. */
function optionsNomSommet(
  sommet: PointAbstrait,
  sommets: PointAbstrait[],
  options: OptionsCompas,
  traitsSupplementaires: TraitNom[] = [],
): OptionsCompas {
  if (!options.placerNomsSommets) return options
  const centreX = sommets.reduce((somme, point) => somme + point.x, 0) / 3
  const centreY = sommets.reduce((somme, point) => somme + point.y, 0) / 3
  const traits: TraitNom[] = [
    [sommets[0], sommets[1]],
    [sommets[1], sommets[2]],
    [sommets[2], sommets[0]],
    ...traitsSupplementaires,
  ]
  let meilleurScore = -Infinity
  let dx = 0
  let dy = 0
  for (const rayon of [0.65, 0.85, 1.05]) {
    for (let index = 0; index < 16; index++) {
      const angle = (index * Math.PI) / 8
      const directionX = Math.cos(angle)
      const directionY = Math.sin(angle)
      // Les textes IEP sont ancrés en haut à gauche : environ 0,5 cm de côté.
      const x = sommet.x + rayon * directionX
      const y = sommet.y + rayon * directionY
      const distance = Math.min(
        ...traits.map((trait) => distanceAuTrait(x, y, trait)),
        ...sommets
          .filter((point) => point !== sommet)
          .map((point) => Math.hypot(x - point.x, y - point.y)),
      )
      const eloignementDuCentre =
        directionX * (sommet.x - centreX) + directionY * (sommet.y - centreY)
      const score =
        Math.min(distance, 0.75) -
        0.35 * (rayon - 0.65) +
        0.01 * eloignementDuCentre
      if (score > meilleurScore) {
        meilleurScore = score
        dx = x - sommet.x - 0.25
        dy = y - sommet.y + 0.25
      }
    }
  }
  return {
    ...options,
    dx: options.dx ?? dx,
    dy: options.dy ?? dy,
  }
}

/**
 * Macro de construction d'un triangle à partir de ses 3 dimensions. Le premier point aura pour coordonnées (6,0).
 * @param {string} ABC Une chaine de caractère de 3 lettre
 * @param {*} AB Distance entre le 1er et le 2e sommet
 * @param {*} AC Distance entre le 1er et le 3e sommet
 * @param {*} BC Distance entre le 2e et le 3e sommet
 * @param {boolean} description Affichage d'un texte descriptif des étapes de la construction
 * @return {array} [A, B, C] les 3 sommets du triangle (objets MathALEA2D)
 */
export const triangle3longueurs = function (
  this: IAlea2iep,
  ABC: string,
  AB: number,
  AC: number,
  BC: number,
  options: OptionsCompas = {},
) {
  const A = pointAbstrait(6, 0)
  const B = pointAdistance(A, AB, randint(-20, 20))
  const p = triangle2points2longueurs(A, B, AC, BC)
  const C = p.listePoints[2]
  let description = options.description ?? true
  if (ABC.length !== 3) {
    description = false
  } else {
    A.nom = ABC[0]
    B.nom = ABC[1]
    C.nom = ABC[2]
  }

  if (description)
    this.textePosition(
      `${A.nom + B.nom} = ${nombreAvecEspace(AB)} cm`,
      0,
      -2,
      options,
    )
  const traitsSupplementaires: TraitNom[] = [
    ...traitsArc(A, C),
    ...traitsArc(B, C),
  ]
  this.pointCreer(
    A,
    optionsNomSommet(A, [A, B, C], options, traitsSupplementaires),
  )
  // this.regleRotation(droite(A,B).angleAvecHorizontale, options)
  // this.regleMontrer(A, options)
  this.regleSegment(
    A,
    B,
    Object.assign({}, options, { zeroSurPremierPoint: true }),
  )
  this.pointCreer(
    B,
    optionsNomSommet(B, [A, B, C], options, traitsSupplementaires),
  )
  this.crayonMasquer(options)
  if (description)
    this.textePosition(
      `${A.nom + C.nom} = ${nombreAvecEspace(AC)} cm donc ${C.nom} appartient au cercle de centre ${A.nom} et de rayon ${nombreAvecEspace(AC)} cm.`,
      0,
      -3,
      options,
    )
  this.couleur = 'forestgreen'
  this.epaisseur = 2
  this.compasMontrer(A, options)
  this.compasEcarterAvecRegle(AC, options)
  this.compasTracerArcCentrePoint(A, C, options)
  if (description)
    this.textePosition(
      `${B.nom + C.nom} = ${nombreAvecEspace(BC)} cm donc ${C.nom} appartient au cercle de centre ${B.nom} et de rayon ${nombreAvecEspace(BC)} cm.`,
      0,
      -4,
      options,
    )
  this.compasDeplacer(B, options)
  this.compasEcarterAvecRegle(BC, options)
  this.compasTracerArcCentrePoint(B, C, options)
  this.compasMasquer(options)
  this.couleur = bleuMathalea
  this.epaisseur = 3
  if (description)
    this.textePosition(
      `Le point ${C.nom} est à une intersection des deux cercles.`,
      0,
      -5,
      options,
    )
  this.pointCreer(
    C,
    optionsNomSommet(C, [A, B, C], options, traitsSupplementaires),
  )
  this.regleSegment(B, C, options)
  this.regleSegment(C, A, options)
  this.crayonMasquer(options)
  this.regleMasquer(options)
  return [A, B, C]
}
/**
 * Macro de construction d'un triangle rectangle (l'angle droit est le 2e point dans l'ordre du nom)
 *  à partir de la donnée de la longueur d'un côté et de la longueur de l'hypoténuse.
 *  Le premier sommet aura pour coordonnées (6, 0)
 * @param {string} ABC Une chaine de caractère de 3 lettre
 * @param {*} AB Distance entre le 1er et le 2e sommet
 * @param {*} AC Distance entre le 1er et le 3e sommet (hypoténuse)
 * @param {boolean} description Affichage d'un texte descriptif des étapes de la construction
 * @return {array} [A, B, C] les 3 sommets du triangle (objets MathALEA2D)
 */
export const triangleRectangleCoteHypotenuse = function (
  this: IAlea2iep,
  ABC: string,
  AB: number,
  AC: number,
  options: OptionsCompas = {},
) {
  // Triangle rectangle en B
  const A = pointAbstrait(6, 0)
  const B = pointAdistance(A, AB, randint(-20, 20))
  const dAB = droite(A, B)
  dAB.isVisible = false
  const dBC = droiteParPointEtPerpendiculaire(B, dAB)
  dBC.isVisible = false
  const cAC = cercle(A, AC)
  cAC.isVisible = false
  const C = pointIntersectionLC(dBC, cAC)
  const c = homothetie(C, B, 1.2)
  let description = options.description ?? true
  if (ABC.length !== 3) {
    description = false
  } else {
    A.nom = ABC[0]
    B.nom = ABC[1]
    C.nom = ABC[2]
  }

  if (longueur(A, C) > 8) this.equerreZoom(150)
  if (description)
    this.textePosition(`${A.nom + B.nom} = ${nombreAvecEspace(AB)} cm`, 0, -2)
  this.equerreRotation(dAB.angleAvecHorizontale, options)
  const traitsSupplementaires: TraitNom[] = options.placerNomsSommets
    ? [[B, c], ...traitsArc(A, C)]
    : []
  this.pointCreer(
    A,
    optionsNomSommet(A, [A, B, C], options, traitsSupplementaires),
  )
  this.regleSegment(A, B, options)
  this.pointCreer(
    B,
    optionsNomSommet(B, [A, B, C], options, traitsSupplementaires),
  )
  if (description)
    this.textePosition(
      `${A.nom + B.nom + C.nom} est un triangle rectangle en ${B.nom} donc ${C.nom} appartient à la perpendiculaire à (${A.nom + B.nom}) passant par ${B.nom}.`,
      0,
      -3,
      options,
    )
  this.equerreMontrer(A, options)
  this.equerreDeplacer(B, options)
  this.tracer(c, options)
  this.equerreMasquer(options)
  this.codageAngleDroit(A, B, C, options)
  this.crayonMasquer(options)
  if (description)
    this.textePosition(
      `${A.nom + C.nom} = ${nombreAvecEspace(AC)} cm donc ${C.nom} appartient au cercle de centre ${A.nom} et de rayon ${nombreAvecEspace(AC)} cm.`,
      0,
      -4,
      options,
    )
  this.compasMontrer(A, options)
  this.compasEcarterAvecRegle(AC, options)
  this.couleur = 'forestgreen'
  this.epaisseur = 2
  this.compasTracerArcCentrePoint(A, C, options)
  this.couleur = bleuMathalea
  this.epaisseur = 2
  if (description)
    this.textePosition(
      `${C.nom} est à une intersection de la perpendiculaire et du cercle.`,
      0,
      -5,
      options,
    )
  this.crayonMontrer(C, options)
  this.pointCreer(
    C,
    optionsNomSommet(C, [A, B, C], options, traitsSupplementaires),
  )
  this.compasMasquer(options)
  this.regleSegment(A, C, options)
  this.regleMasquer(options)
  this.crayonMasquer(options)
  return [A, B, C]
}

/**
 * Macro de construction d'un triangle rectangle (l'angle droit est le 2e point dans l'ordre du nom)
 *  à partir de la donnée de la longueur des deux côtés de l'angle droit.
 *  Le premier sommet aura pour coordonnées (6, 0)
 * @param {string} ABC Une chaine de caractère de 3 lettre
 * @param {*} AB Distance entre le 1er et le 2e sommet
 * @param {*} AC Distance entre le 1er et le 3e sommet (hypoténuse)
 * @param {boolean} description Affichage d'un texte descriptif des étapes de la construction
 * @return {array} [A, B, C] les 3 sommets du triangle (objets MathALEA2D)
 */
export const triangleRectangle2Cotes = function (
  this: IAlea2iep,
  ABC: string,
  AB: number,
  BC: number,
  options: OptionsCompas = {},
) {
  // Triangle rectangle en B
  const A = pointAbstrait(6, 0)
  const B = pointAdistance(A, AB, randint(-20, 20))
  const dAB = droite(A, B)
  dAB.isVisible = false
  const dBC = droiteParPointEtPerpendiculaire(B, dAB)
  dBC.isVisible = false
  const cBC = cercle(B, BC)
  cBC.isVisible = false
  const C = pointIntersectionLC(dBC, cBC)
  const c = homothetie(C, B, 1.2)
  let description = options.description ?? true
  if (ABC.length !== 3) {
    description = false
  } else {
    A.nom = ABC[0]
    B.nom = ABC[1]
    C.nom = ABC[2]
  }

  if (longueur(A, C) > 8) this.equerreZoom(150, options)
  if (description)
    this.textePosition(
      `${A.nom + B.nom} = ${nombreAvecEspace(AB)} cm`,
      0,
      -2,
      options,
    )
  this.equerreRotation(dAB.angleAvecHorizontale, options)
  const traitsSupplementaires: TraitNom[] = options.placerNomsSommets
    ? [[B, c]]
    : []
  this.pointCreer(
    A,
    optionsNomSommet(A, [A, B, C], options, traitsSupplementaires),
  )
  this.regleSegment(A, B, options)
  this.pointCreer(
    B,
    optionsNomSommet(B, [A, B, C], options, traitsSupplementaires),
  )
  if (description)
    this.textePosition(
      `${A.nom + B.nom + C.nom} est un triangle rectangle en ${B.nom} donc ${C.nom} appartient à la perpendiculaire à (${A.nom + B.nom}) passant par ${B.nom}.`,
      0,
      -3,
      options,
    )
  this.equerreMontrer(A, options)
  this.equerreDeplacer(B, options)
  this.tracer(c, options)
  this.equerreMasquer(options)
  this.codageAngleDroit(A, B, C, options)
  if (description)
    this.textePosition(
      `${B.nom + C.nom} = ${nombreAvecEspace(BC)} cm donc ${C.nom} est à ${nombreAvecEspace(BC)} cm de ${B.nom} sur la perpendiculaire à (${A.nom + B.nom}) passant par ${B.nom}.`,
      0,
      -4,
      options,
    )
  this.regleMontrer(B, options)
  this.regleRotation(C, options)
  this.crayonDeplacer(C, options)
  this.pointCreer(
    C,
    optionsNomSommet(C, [A, B, C], options, traitsSupplementaires),
  )
  this.couleur = bleuMathalea
  this.epaisseur = 2
  this.compasMasquer(options)
  this.regleSegment(A, C, options)
  this.regleMasquer(options)
  this.crayonMasquer(options)

  return [A, B, C]
}

type OptionsTriangle1longueur2angles = OptionsCompas & {
  mesure?: boolean
}
/**
 * Macro de construction d'un triangle à partir d'une longueur et des 2 angles adajcents au côté connu. Le premier point aura pour coordonnées (6,0).
 * @param {string} ABC Une chaine de caractère de 3 lettre
 * @param {*} AB Distance entre le 1er et le 2e sommet
 * @param {*} BAC Angle au 1er sommet
 * @param {*} CBA Angle au 2e sommet
 * @param {boolean} description Affichage d'un texte descriptif des étapes de la construction
 * @return {array} [A, B, C] les 3 sommets du triangle (objets MathALEA2D)
 */
export const triangle1longueur2angles = function (
  this: IAlea2iep,
  NOM: string | string[],
  AB: number,
  BAC: number,
  CBA: number,
  options: OptionsTriangle1longueur2angles = {},
) {
  const angle = randint(-20, 20)
  const a1 = BAC
  const a2 = CBA
  const A = pointAbstrait(6, 0)
  const B = pointAdistance(A, AB, angle)
  const D = pointAdistance(A, 5.2, a1 + angle)
  const D2 = pointSurSegment(A, D, 10)
  const D1 = pointSurSegment(D, D2, 0.4)
  const E = pointAdistance(B, 3, 180 - a2 + angle)
  const E2 = pointSurSegment(B, E, 10)
  const E1 = pointSurSegment(E, E2, -0.4)
  const F = pointAdistance(B, 5.2, 180 - a2 + angle)
  const F1 = pointSurSegment(F, E2, 0.4)
  const d = rotation(droite(A, B), A, a1)
  D.isVisible = false
  const d2 = rotation(droite(B, A), B, -a2)
  d2.isVisible = false
  const C = pointIntersectionDD(d, d2)
  let description = options.description ?? true
  const mesure = options.mesure ?? false
  if (NOM.length !== 3) {
    description = false
  } else {
    A.nom = NOM[0]
    B.nom = NOM[1]
    C.nom = NOM[2]
  }
  this.couleur = bleuMathalea
  this.epaisseur = 3
  const traitsSupplementaires: TraitNom[] = [
    [A, D2],
    [B, E2],
  ]
  this.pointCreer(
    A,
    optionsNomSommet(A, [A, B, C], options, traitsSupplementaires),
  )
  if (description)
    this.textePosition(
      `On trace le côté [${A.nom + B.nom}] de ${nombreAvecEspace(AB)} cm.`,
      0,
      -4,
      options,
    )
  this.regleSegment(A, B, options)
  this.pointCreer(
    B,
    optionsNomSommet(B, [A, B, C], options, traitsSupplementaires),
  )
  this.couleur = 'grey'
  this.epaisseur = 1
  this.rapporteurMontrer(A, options)
  this.rapporteurDeplacer(A, options)
  this.rapporteurRotation(angle, options)
  if (description)
    this.textePosition(
      `On place un repère à ${a1} degrés pour tracer la demi-droite [${A.nom + C.nom}).`,
      0,
      -5,
      options,
    )
  this.epaisseur = 3
  this.trait(D, D1, Object.assign({}, options, { tempo: 20 }))
  this.epaisseur = 1
  this.rapporteurMasquer(options)
  this.regleSegment(A, D2, options)
  this.regleMasquer(options)
  this.angleCodage(B, A, C, options)
  this.rapporteurMontrer(A, options)
  this.rapporteurDeplacer(B, options)
  if (description)
    this.textePosition(
      `On place un repère à ${a2} degrés pour tracer la demi-droite [${B.nom + C.nom}).`,
      0,
      -6,
      options,
    )
  this.epaisseur = 3
  this.trait(E, E1, Object.assign({}, options, { tempo: 10 }))
  this.trait(F, F1, Object.assign({}, options, { tempo: 20 }))
  this.epaisseur = 1
  this.rapporteurMasquer(options)
  this.regleMontrer(B, options)
  this.regleSegment(B, E2, options)
  this.angleCodage(C, B, A, options)
  this.pointCreer(
    C,
    optionsNomSommet(C, [A, B, C], options, traitsSupplementaires),
  )
  // this.pointNommer(C, C.nom, -0.5, 1, options)
  this.couleur = bleuMathalea
  this.epaisseur = 3
  this.regleSegment(B, C, options)
  this.regleSegment(C, A, options)
  this.regleMasquer(options)
  this.crayonMasquer(options)
  if (description && mesure)
    this.textePosition(
      `On peut mesurer ${A.nom + C.nom} ≈ ${nombreAvecEspace(longueur(A, C, 1))} cm et ${B.nom + C.nom} ≈ ${nombreAvecEspace(longueur(B, C, 1))} cm.`,
      0,
      -7,
      options,
    )

  return [A, B, C]
}
/**
 * Macro de construction d'un triangle à partir des longueurs des deux côtés d'un angle Le premier point a pour coordonnées (6,0).
 * @param {string} ABC Une chaine de caractère de 3 lettre
 * @param {*} AB Distance entre le 1er et le 2e sommet
 * @param {*} AC Distance entre le 1er et le 3e sommet
 * @param {*} BAC Angle au 1er sommet
 * @param {boolean} description Affichage d'un texte descriptif des étapes de la construction
 * @return {array} [A, B, C] les 3 sommets du triangle (objets MathALEA2D)
 */
export const triangle2longueurs1angle = function (
  this: IAlea2iep,
  NOM: string,
  AB: number,
  AC: number,
  BAC: number,
  options: OptionsCompas = {},
) {
  let description = options.description ?? true
  const angle = randint(-20, 20)
  const a1 = BAC
  const A = pointAbstrait(6, 0)
  const B = pointAdistance(A, AB, angle)
  const D = pointAdistance(A, 5.2, a1 + angle)
  const D2 = pointSurSegment(A, D, 10)
  const D1 = pointSurSegment(D, D2, 0.4)
  const C = pointSurSegment(A, D2, AC)
  if (NOM.length !== 3) {
    description = false
  } else {
    A.nom = NOM[0]
    B.nom = NOM[1]
    C.nom = NOM[2]
  }
  this.couleur = bleuMathalea
  this.epaisseur = 3
  const traitsSupplementaires: TraitNom[] = options.placerNomsSommets
    ? [[A, D2]]
    : []
  this.pointCreer(
    A,
    optionsNomSommet(A, [A, B, C], options, traitsSupplementaires),
  )
  if (description)
    this.textePosition(
      `On trace le côté [${A.nom + B.nom}] de ${nombreAvecEspace(AB)} cm.`,
      0,
      -4,
      options,
    )
  this.regleSegment(A, B, options)
  this.pointCreer(
    B,
    optionsNomSommet(B, [A, B, C], options, traitsSupplementaires),
  )
  this.couleur = 'grey'
  this.epaisseur = 1
  this.rapporteurMontrer(A, options)
  this.rapporteurDeplacer(A, options)
  this.rapporteurRotation(angle, options)
  if (description)
    this.textePosition(
      `On place un repère à ${a1} degrés pour tracer la demi-droite [${A.nom + C.nom}).`,
      0,
      -5,
      options,
    )
  this.epaisseur = 3
  this.trait(D, D1, Object.assign({}, options, { tempo: 20 }))
  this.epaisseur = 1
  this.rapporteurMasquer(options)
  this.regleSegment(A, D2, options)
  this.angleCodage(B, A, C, options)
  this.rapporteurMasquer(options)
  if (description)
    this.textePosition(
      `On place le point ${C.nom} sur la demi-droite [${A.nom + C.nom}) à ${AC} cm de ${A.nom}.`,
      0,
      -6,
      options,
    )
  this.epaisseur = 3
  this.couleur = bleuMathalea
  this.crayonDeplacer(C, options)
  this.pointCreer(
    C,
    optionsNomSommet(C, [A, B, C], options, traitsSupplementaires),
  )
  this.regleSegment(A, C, options)
  this.crayonMasquer(options)
  if (description)
    this.textePosition(`On trace le côté [${B.nom + C.nom}].`, 0, -7, options)
  this.regleMontrer(C, options)
  this.crayonMontrer(C, options)
  this.regleSegment(C, B, options)
  this.regleMasquer(options)
  this.crayonMasquer(options)
  return [A, B, C]
}

/**
 * Trace un triangle équilatéral à partir de la donnée de 2 points
 * @param {point} A
 * @param {point} B
 * @param {string} nomC
 * @return {array} [A, B, C]
 */
export const triangleEquilateral2Sommets = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  nomC: string = '',
) {
  const C = rotation(B, A, 60)
  C.nom = nomC
  this.traitRapide(A, B)
  this.pointCreer(A)
  this.pointCreer(B)
  this.compasEcarter2Points(A, B)
  this.compasTracerArcCentrePoint(A, C)
  this.compasTracerArcCentrePoint(B, C)
  this.pointCreer(C)
  this.compasMasquer()
  this.regleSegment(A, C)
  this.regleSegment(C, B)
  this.regleMasquer()
  this.crayonMasquer()
  this.segmentCodage(A, B)
  this.segmentCodage(A, C)
  this.segmentCodage(B, C)
  return [A, B, C]
}
/**
 * Trace un triangle équilatéral à partir de la donnée de la longueur du côté. Le premier point a pour coordonnées (6;0)
 * @param {string} NOM
 * @param {number} AB
 * @return {array} [A, B, C]
 */

export const triangleEquilateral = function (
  this: IAlea2iep,
  NOM: string | string[],
  AB: number,
  options: OptionsCompas = {},
) {
  const A = pointAbstrait(6, 0)
  const B = pointAdistance(A, AB, randint(-20, 20))
  const C = rotation(B, A, 60)
  if (NOM.length === 3) {
    A.nom = NOM[0]
    B.nom = NOM[1]
    C.nom = NOM[2]
  }
  this.regleSegment(A, B)
  const traitsSupplementaires: TraitNom[] = [
    ...traitsArc(A, C),
    ...traitsArc(B, C),
  ]
  this.pointCreer(
    A,
    optionsNomSommet(A, [A, B, C], options, traitsSupplementaires),
  )
  this.pointCreer(
    B,
    optionsNomSommet(B, [A, B, C], options, traitsSupplementaires),
  )
  this.compasEcarter2Points(A, B)
  this.compasTracerArcCentrePoint(A, C)
  this.compasTracerArcCentrePoint(B, C)
  this.pointCreer(
    C,
    optionsNomSommet(C, [A, B, C], options, traitsSupplementaires),
  )
  this.compasMasquer()
  this.regleSegment(A, C)
  this.regleSegment(C, B)
  this.regleMasquer()
  this.crayonMasquer()
  this.segmentCodage(A, B)
  this.segmentCodage(A, C)
  this.segmentCodage(B, C)
  return [A, B, C]
}

export const triangleIsocele2Longueurs = function (
  this: IAlea2iep,
  NOM: string | string[],
  AB: number, // côtés égaux
  AC: number, // base,
  options: OptionsCompas = {},
) {
  const A = pointAbstrait(6, 0)
  const C = pointAdistance(A, AC, randint(-10, 10))
  const c1 = cercle(A, AB)
  const c2 = cercle(C, AB)
  const B = pointIntersectionCC(c1, c2, 'C', 1)

  //
  if (NOM.length === 3) {
    A.nom = NOM[0]
    B.nom = NOM[2]
    C.nom = NOM[1]
  }
  this.pointCreer(A, options)
  // this.regleRotation(droite(A,B).angleAvecHorizontale, options)
  // this.regleMontrer(A, options)
  this.regleSegment(A, C, options)
  this.compasMontrer(A, options)
  this.pointCreer(C, options)
  this.compasEcarterAvecRegle(AB, options)
  this.compasTracerArcCentrePoint(A, B, options)
  this.compasTracerArcCentrePoint(C, B, options)
  this.pointCreer(B, options)
  this.compasMasquer(options)
  this.couleur = bleuMathalea
  this.epaisseur = 3
  if (options.description)
    this.textePosition(
      `Le point ${B.nom} est à une intersection des deux cercles.`,
      0,
      -5,
      options,
    )
  this.pointCreer(B, options)
  this.regleSegment(B, C, options)
  this.regleSegment(B, A, options)
  this.crayonMasquer(options)
  this.regleMasquer(options)
  return [A, B, C]
}
