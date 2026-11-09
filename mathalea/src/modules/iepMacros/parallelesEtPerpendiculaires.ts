import { cercle } from '../../lib/2d/cercle'
import {
  Droite,
  droite,
  droiteParPointEtPerpendiculaire,
} from '../../lib/2d/droites'
import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import {
  homothetie,
  projectionOrtho,
  rotation,
  similitude,
  translation,
  translation2Points,
} from '../../lib/2d/transformations'
import {
  angleOriente,
  longueur,
  pointEstSur,
} from '../../lib/2d/utilitairesGeometriques'
import {
  pointIntersectionLC,
  pointSurDroite,
  pointSurSegment,
} from '../../lib/2d/utilitairesPoint'
import { cross, dot, vecteur } from '../../lib/2d/Vecteur'
import type {
  IAlea2iep,
  OptionsCompas,
  OptionsEquerre,
} from '../Alea2iep.types'

/**
 * Trace la parallèle à (AB) passant par C avec la règle et l'équerre. Peut prolonger le segment [AB] si le pied de la hauteur est trop éloigné des extrémités du segment
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {PointAbstrait} C
 * @param {*} [options]
 */
export const paralleleRegleEquerre2points3epoint = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  options?: OptionsEquerre,
) {
  let H1
  // G est le point le plus à gauche, D le plus à droite et H le projeté de C sur (AB)
  // H1 est un point de (AB) à gauche de H, c'est là où seront la règle et l'équerre avant de glisser

  const d = droite(A, B)
  const H = projectionOrtho(C, d)
  const AB = [B.x - A.x, B.y - A.y, 0]
  const AC = [C.x - A.x, C.y - A.y, 0]
  const prodScal = dot(AB, AC)
  const prodVect = cross(AB, AC)
  let angleRequerre: number = -90
  let sensGlisser = -1
  if (prodScal < 0) {
    H1 = B
    angleRequerre = 90
    sensGlisser = 1
  } else {
    H1 = A
  }
  const H2 = translation(H1, vecteur(H, C))
  const dist = longueur(H, C) / 3
  const requerreZoom = this.requerre.zoom
  const requerreVisibility = this.requerre.visibilite
  this.requerreZoom(dist * 100)
  this.requerreGlisserEquerre(0, { tempo: 0 })
  if (!requerreVisibility) this.requerreMontrer()
  this.requerreRotationTranslation(
    d.angleAvecHorizontale + angleRequerre,
    H1,
    options,
  )
  this.requerreGlisserEquerre(
    sensGlisser *
      (prodVect[2] < 0 ? -longueur(H, C) / dist : longueur(H, C) / dist),
    options ?? {},
  )
  const crayonVisibility = this.crayon.visibilite
  if (!crayonVisibility) this.crayonMontrer()
  this.trait(H2, C)
  if (options?.positionsRangementInstruments !== undefined) {
    this.rangerInstruments(
      options.positionsRangementInstruments,
      ['requerre', 'crayon'],
      {
        tempo: 0,
        vitesse: 20,
      },
    )
  }
  if (!requerreVisibility) this.requerreMasquer()
  if (!crayonVisibility) this.crayonMasquer()
}
/**
 * Trace la perpendiculaire à (AB) passant par C avec la règle et l'équerre. Peut prolonger le segment [AB] si le pied de la hauteur est trop éloigné des extrémités du segment
 * Description désactivée par défaut.
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {PointAbstrait} C
 * @param {*} [options]
 */
export const perpendiculaireRegleEquerre2points3epoint = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  options: OptionsCompas = {},
) {
  const longueurRegle = this.regle.longueur
  const zoomEquerre = this.equerre.zoom
  const d = droite(A, B)
  d.nom = `(${A.nom}${B.nom})`
  let dist
  if (A.nom === undefined) A.nom = 'A'
  if (B.nom === undefined) B.nom = 'B'
  if (pointEstSur(C, droite(A, B))) {
    const H = rotation(C, C, 0)
    const dd = droiteParPointEtPerpendiculaire(C, d)
    C = pointIntersectionLC(dd, cercle(H, 5.5))
    dist = 7.5
  } else {
    const H = projectionOrtho(C, d)
    dist = longueur(H, C) * 1.2 + 2
  }
  this.equerreZoom((dist * 100) / 7.5, options)
  this.regleModifierLongueur(Math.max(dist * 2, 15), options)
  this.perpendiculaireRegleEquerreDroitePoint(d, C, options)
  this.equerreZoom(zoomEquerre, options)
  this.regleModifierLongueur(longueurRegle, options)
  this.regleMasquer(options)
  this.equerreMasquer(options)
  this.crayonMasquer(options)
}

/**
 * Construit à la règle et à l'équerre la perpendiculaire à une droite d passant par un point P n'appartenant pas à d.
 * description désactivable.
 * @param {Droite} d
 * @param {PointAbstrait} P
 * @param {boolean} [description]
 */
export const perpendiculaireRegleEquerreDroitePoint = function (
  this: IAlea2iep,
  d: Droite,
  P: PointAbstrait,
  options: OptionsCompas = {},
) {
  const pointSurD = pointEstSur(P, d)
  const H = pointSurD ? P : projectionOrtho(P, d)
  let A: PointAbstrait
  let B: PointAbstrait
  let P3: PointAbstrait
  let pointCodage: PointAbstrait
  let textePositionnement: string

  if (pointSurD) {
    const C = cercle(P, 6)
    A = pointSurDroite(d, -10000)
    B = pointSurDroite(d, 10000)
    const pointIntersectionDC = pointIntersectionLC(d, C)
    P3 = rotation(pointIntersectionDC, P, 90)

    if (P3.y < P.y) P3 = rotation(P3, P, 180)
    pointCodage = P3
    textePositionnement = `1. Placer un côté de l'angle droit de l'équerre sur la droite ${d.nom} avec l'angle droit au point ${P.nom}.`
  } else {
    A = rotation(P, H, 90)
    B = rotation(A, H, 180)
    P3 = homothetie(P, H, 1.2)
    pointCodage = P
    textePositionnement = `1. Placer un côté de l'angle droit de l'équerre sur la droite ${d.nom} et l'autre côté de l'angle droit passant par le point ${P.nom}.`
  }
  const optionsCodage = Object.assign({}, options, { couleurCodage: 'red' })

  const P3B = pointSurSegment(P3, H, 0.4)
  const HB = pointSurSegment(H, P3, 0.4)
  const P4 = rotation(P3, H, 180)
  const P4B = pointSurSegment(
    P3,
    P4,
    Math.min(this.regle.longueur, longueur(P3, H) + 1),
  )
  const alpha = angleOriente(pointAbstrait(10000, H.y), H, B)

  if (options.description)
    this.textePosition(textePositionnement, 0, 10, { couleur: 'lightblue' })

  const equerreVisibility = this.equerre.visibilite
  if (!equerreVisibility) this.equerreMontrer()
  this.equerreRotationTranslation(alpha, H, options)

  if (options.description)
    this.textePosition(`2. Faire deux traits le long de l'équerre.`, 0, 9.3, {
      couleur: 'lightblue',
    })

  this.trait(P3, P3B, Object.assign({}, options, { tempo: 5, epaisseur: 1 }))
  this.trait(H, HB, Object.assign({}, options, { tempo: 5, epaisseur: 1 }))

  if (options.positionsRangementInstruments !== undefined) {
    this.rangerInstruments(options.positionsRangementInstruments, ['equerre'], {
      tempo: 0,
      vitesse: 20,
    })
  } else if (!equerreVisibility) {
    this.equerreMasquer(options)
  }

  const regleVisibility = this.regle.visibilite
  if (!regleVisibility) this.regleMontrer()
  this.regleRotationTranslation(alpha - 90, P3, options)

  if (options.description)
    this.textePosition(
      `3. Tracer la perpendiculaire à ${d.nom} à la règle.`,
      0,
      8.6,
      { couleur: 'lightblue' },
    )

  this.trait(P3, P4B, options)

  if (options.positionsRangementInstruments !== undefined) {
    this.rangerInstruments(options.positionsRangementInstruments, ['regle'], {
      tempo: 0,
      vitesse: 20,
    })
  } else if (!regleVisibility) {
    this.regleMasquer()
  }

  if (options.description)
    this.textePosition("4. Coder l'angle droit.", 0, 7.9, {
      couleur: 'lightblue',
    })

  this.codageAngleDroit(A, H, pointCodage, optionsCodage)
}

/**
 * Trace la perpendiculaire à une droite passant par un point de cette droite à l'équerre et à la règle.
 * @param {Droite} d
 * @param {number} x  // pour choisir le point sur d : l'abscisse de A
 * @param {boolean} description
 */
export const perpendiculaireRegleEquerrePointSurLaDroite = function (
  this: IAlea2iep,
  d: Droite,
  x: number,
  options: OptionsCompas = {},
) {
  const A = pointSurDroite(d, x, 'A')
  const B = pointSurDroite(d, x + 5)
  const P1 = rotation(B, A, 90)
  const P2 = rotation(P1, A, 180)
  if (d.nom === undefined) {
    d.nom = '(d)'
  }
  this.traitRapide(pointSurDroite(d, -20), pointSurDroite(d, 20), options)
  this.pointCreer(A, options)
  if (options.description)
    this.textePosition(
      `1. Placer un côté de l'angle droit de l'équerre sur la droite ${d.nom}.`,
      0,
      10,
      { couleur: 'lightblue' },
    )
  this.equerreRotation(d.angleAvecHorizontale, options)
  this.equerreMontrer(B, options)
  if (options.description) {
    this.textePosition(
      `2. Faire glisser l'équerre sur la droite jusqu'au point ${A.nom}`,
      0,
      9.3,
      { couleur: 'lightblue' },
    )
  }
  this.equerreDeplacer(A, options)
  if (options.description)
    this.textePosition(
      "3. Tracer le long de l'autre côté de l'angle droit de l'équerre.",
      0,
      8.6,
      { couleur: 'lightblue' },
    )
  this.crayonMontrer(A, options)
  this.tracer(P1, options)
  this.equerreMasquer(options)
  if (options.description)
    this.textePosition(
      `4. Prolonger la perpendiculaire à ${d.nom} à la règle.`,
      0,
      7.9,
      { couleur: 'lightblue' },
    )
  this.regleRotation(d.angleAvecHorizontale - 90, options)
  this.regleMontrer(P1, options)
  this.crayonDeplacer(P1, options)
  this.tracer(P2, options)
  if (options.description)
    this.textePosition("4. Coder l'angle droit.", 0, 7.2, {
      couleur: 'lightblue',
    })
  this.regleMasquer(options)
  this.codageAngleDroit(P1, A, B, options)
}
/**
 * Trace la perpendiculaire à une droite passant par un point de cette droite au compas.
 * @param {Droite} d
 * @param {number} x // pour choisir le point sur d : l'abscisse de A
 * @param {boolean} description
 */
export const perpendiculaireCompasPointSurLaDroite = function (
  this: IAlea2iep,
  d: Droite,
  x: number,
  options: OptionsCompas = {},
) {
  const A = pointSurDroite(d, x, 'A')
  const B = pointSurDroite(d, x + 3, 'B')
  const C = pointSurDroite(d, x - 3, 'C')
  const P1 = similitude(B, A, 90, 1.2)
  const P2 = similitude(B, A, -90, 1.2)
  if (d.nom === undefined) {
    d.nom = '(d)'
  }
  this.traitRapide(pointSurDroite(d, -20), pointSurDroite(d, 20), options)
  this.pointCreer(A, options)
  if (options.description)
    this.textePosition(
      "1. Avec le compas, marquer deux points B et C de part et d'autre de A, tels que AB=AC.",
      0,
      10,
      { couleur: 'lightblue' },
    )
  this.compasEcarter2Points(A, B, options)
  this.compasTracerArcCentrePoint(A, B, { couleur: 'lightgray', epaisseur: 1 })
  this.compasTracerArcCentrePoint(A, C, { couleur: 'lightgray', epaisseur: 1 })
  if (options.description) {
    this.textePosition(
      '2. Choisir un écartement de compas supérieur à la longueur AB.',
      0,
      9.3,
      { couleur: 'lightblue' },
    )
  }
  this.compasEcarter2Points(B, P1, options)
  if (options.description)
    this.textePosition(
      '3. Tracer un arc de cercle de centre B avec cet écartement.',
      0,
      8.6,
      { couleur: 'lightblue' },
    )
  this.compasTracerArcCentrePoint(B, P1, { couleur: 'lightgray', epaisseur: 1 })
  if (options.description)
    this.textePosition(
      '4. Tracer un arc de cercle de centre C en conservant le même écartement.',
      0,
      7.9,
      { couleur: 'lightblue' },
    )
  this.compasTracerArcCentrePoint(C, P1, { couleur: 'lightgray', epaisseur: 1 })
  this.compasMasquer(options)
  if (options.description) {
    this.textePosition(
      "4. Tracer la droite qui passe par le point d'intersection des arcs de cercle et par le point A.",
      0,
      7.2,
      { couleur: 'lightblue' },
    )
  }
  this.regleRotation(d.angleAvecHorizontale - 90, options)
  const P11 = homothetie(P1, A, 1.1)
  const P12 = homothetie(P2, A, 1.1)
  this.regleMontrer(P11, options)
  this.crayonMontrer(P11, options)
  this.tracer(P12, options)
  if (options.description)
    this.textePosition("5. Coder l'angle droit.", 0, 6.5, {
      couleur: 'lightblue',
    })
  this.regleMasquer(options)
  this.codageAngleDroit(P1, A, B, options)
}
/**
 * Trace la perpendiculaire à une droite passant par un point n'appartenant pas à cette droite au compas.
 * @param {Droite} d
 * @param {number} x // pour choisir le point sur d : l'abscisse de A
 * @param {boolean} description
 */
export const perpendiculaireCompasPoint = function (
  this: IAlea2iep,
  d: Droite,
  A: PointAbstrait,
  options: OptionsCompas = {},
) {
  const H = projectionOrtho(A, d)
  const B = similitude(A, H, -90, 1.2, 'B')
  const C = homothetie(B, H, -0.7, 'C')
  const D = rotation(A, H, 180)
  const P1 = homothetie(A, H, 1.2)
  const P2 = homothetie(A, H, -1.2)
  if (d.nom === '') {
    d.nom = '(d)'
  }
  if (A.nom === '') {
    A.nom = 'A'
  }
  this.traitRapide(pointSurDroite(d, -20), pointSurDroite(d, 20), options)
  this.textePoint(
    d.nom,
    translation(pointSurDroite(d, 0), vecteur(0, -0.5)),
    options,
  )
  this.pointCreer(A, options)
  if (options.description)
    this.textePosition(
      `1. Choisir deux points B et C sur la droite ${d.nom}.`,
      0,
      11,
      { couleur: 'lightblue', tempo: 20 },
    )
  this.tempo = 20
  this.pointCreer(B, options)
  this.pointCreer(C, options)
  if (options.description)
    this.textePosition(
      `2. Tracer un arc de cercle de centre B passant par A et un autre de centre C passant par ${A.nom}.`,
      0,
      10.3,
      { couleur: 'lightblue', tempo: 20 },
    )
  this.compasEcarter2Points(B, A, options)
  this.compasTracerArcCentrePoint(
    B,
    D,
    Object.assign({}, options, { couleur: 'lightgray', epaisseur: 1 }),
  )
  this.compasEcarter2Points(C, A, options)
  this.compasTracerArcCentrePoint(
    C,
    D,
    Object.assign({}, options, { couleur: 'lightgray', epaisseur: 1 }),
  )
  if (options.description)
    this.textePosition(
      `3. Ces deux arcs de cercle se recoupent en un point qui est le symétrique de ${A.nom} par rapport à ${d.nom}`,
      0,
      9.6,
      { couleur: 'lightblue', tempo: 20 },
    )
  this.compasMasquer(options)
  if (options.description)
    this.textePosition(
      "4. Tracer la droite qui passe par le point d'intersection des arcs de cercle et par le point A.",
      0,
      8.9,
      { couleur: 'lightblue', tempo: 20 },
    )
  this.regleRotation(d.angleAvecHorizontale - 90, options)
  this.regleMontrer(P1, options)
  this.crayonMontrer(P1, options)
  this.tracer(P2, options)
  if (options.description)
    this.textePosition("5. Coder l'angle droit.", 0, 8.2, {
      couleur: 'lightblue',
      tempo: 20,
    })
  this.regleMasquer(options)
  this.codageAngleDroit(P1, H, B, options)
}
/**
 * Trace la parallèlee à (AB) passant par C avec la règle et l'équerre.
 * Cette macro réalise la construction en décrivant ce qu'elle fait à chaque étape
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {PointAbstrait} M
 * @param {boolean} dessus
 * @param {*} [options]
 */
export const paralleleRegleEquerreDroitePointAvecDescription = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  M: PointAbstrait,
  dessus: boolean,
  options: OptionsCompas = { description: true },
) {
  A.nom = 'A'
  B.nom = 'B'
  M.nom = 'M'
  const AA = homothetie(A, B, 2)
  const BB = homothetie(B, A, 2)
  const d = droite(A, B)
  const dd = rotation(d, A, 90)
  const H = projectionOrtho(M, dd)
  const N = homothetie(M, H, 1.5)
  const P = homothetie(H, M, 2)
  const originalTempo = this.tempo
  this.tempo = 10
  this.pointMasquer(AA, BB, options)
  this.traitRapide(AA, BB, options)
  this.textePosition(
    'Parallèle à une droite passant par un point (règle et équerre)',
    -10,
    10.7,
    { couleur: 'green', taille: 4, tempo: 20 },
  )
  if (options.description)
    this.textePosition(
      "On veut construire la parallèle à (AB) passant par M à la règle et à l'equerre.",
      -10,
      10,
      { couleur: 'red', taille: 4, tempo: 50 },
    )
  if (options.description)
    this.textePosition(
      "1. Placer l'équerre un côté de l'angle droit le long de la droite (AB).",
      -9,
      9.3,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.equerreMontrer(A, options)
  this.equerreRotation(
    d.angleAvecHorizontale + (dessus ? -90 : 0),
    Object.assign({}, options, { tempo: 20 }),
  )
  if (options.description)
    this.textePosition(
      "2. Placer ensuite la règle contre l'autre côté de l'angle droit de l'équerre.",
      -9,
      8.6,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.regleRotation(d.angleAvecHorizontale - 90, options)
  this.regleMontrer(AA, options)
  this.regleDeplacer(
    homothetie(rotation(B, A, 90), A, 1.5),
    Object.assign({}, options, { tempo: 20 }),
  )
  if (options.description)
    this.textePosition(
      'Remarque : On peut tracer des pointillés pour matérialiser la position de la règle.',
      -9.5,
      7.9,
      { couleur: 'pink', taille: 2, tempo: 10 },
    )
  this.crayonMontrer(A, options)
  this.tracer(homothetie(rotation(B, A, dessus ? 90 : -90), A, 1.5), options)
  if (options.description)
    this.textePosition(
      "3. Faire glisser l'équerre le long de la règle jusqu'au point M.",
      -9,
      7.2,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  if (!dessus) {
    this.equerreRotation(d.angleAvecHorizontale - 90, options)
  }
  this.equerreDeplacer(H, Object.assign({}, options, { tempo: 20 }))
  if (options.description)
    this.textePosition(
      '4. Tracer le segment de droite passant par M.',
      -9,
      6.5,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.crayonDeplacer(H, options)
  this.tracer(N, options)
  this.equerreMasquer(options)
  if (options.description)
    this.textePosition(
      '5. Placer la règle sur ce segment et prolonger la parallèle à (AB).',
      -9,
      5.8,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.regleDeplacer(P, options)
  this.regleRotation(d.angleAvecHorizontale, options)
  this.tracer(P, options)
  this.regleMasquer(options)
  if (options.description)
    this.textePosition('6. Pour finir, coder la figure.', -9, 5.1, {
      couleur: 'lightblue',
      taille: 2,
      tempo: 20,
    })
  this.codageAngleDroit(B, A, H, options)
  this.codageAngleDroit(A, H, M, options)
  this.crayonMasquer(options)
  this.tempo = originalTempo
}

/**
 *
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {PointAbstrait} C
 * @param {boolean} description
 */
export const paralleleAuCompasAvecDescription = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  options: OptionsCompas = { description: true },
) {
  const D = translation2Points(C, A, B, 'D')
  A.nom = 'A'
  B.nom = 'B'
  C.nom = 'C'
  const AA = homothetie(A, B, 1.5)
  const BB = homothetie(B, A, 1.5)
  const N = homothetie(C, D, 1.5)
  const P = homothetie(D, C, 1.5)
  const originalTempo = this.tempo
  this.tempo = 10
  this.traitRapide(AA, BB, options)
  this.textePosition(
    'Parallèle à une droite passant par un point (compas et règle)',
    -10,
    10.7,
    { couleur: 'green', taille: 4, tempo: 20 },
  )
  if (options.description)
    this.textePosition(
      'On veut construire la parallèle à (AB) passant par C à la règle et au compas.',
      -10,
      10,
      { couleur: 'red', taille: 4, tempo: 30 },
    )
  if (options.description)
    this.textePosition(
      "1. Prendre avec le compas l'écartement correspondant à la longueur AB.",
      -9,
      9.3,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.compasEcarter2Points(A, B, options)
  if (options.description)
    this.textePosition(
      '2. Reporter cette longueur à partir du point C.',
      -9,
      8.6,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.compasTracerArcCentrePoint(
    C,
    D,
    Object.assign({}, options, { couleur: 'lightgray', epaisseur: 1 }),
  )
  if (options.description)
    this.textePosition(
      "3. Prendre ensuite avec le compas l'écartement correspondant à la longueur AC.",
      -9,
      7.9,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.compasEcarter2Points(A, C, options)
  if (options.description)
    this.textePosition(
      '4. Reporter cette longueur à partir du point B.',
      -9,
      7.2,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.compasTracerArcCentrePoint(
    B,
    D,
    Object.assign({}, options, { couleur: 'lightgray', epaisseur: 1 }),
  )
  this.compasMasquer(options)
  if (options.description)
    this.textePosition(
      "5. Noter D, le point d'intersection des deux arcs de cercle.",
      -9,
      6.5,
      { couleur: 'lightblue', taille: 2, tempo: 10 },
    )
  this.pointCreer(D, options)
  if (options.description)
    this.textePosition('6. Tracer la droite passant par C et D.', -9, 5.8, {
      couleur: 'lightblue',
      taille: 2,
      tempo: 10,
    })
  this.regleSegment(N, P, options)
  this.regleMasquer(options)
  this.crayonMasquer(options)
  this.tempo = originalTempo
}

/**
 *
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {PointAbstrait} C
 * @param {boolean} description
 */
export const paralleleAuCompas = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  C: PointAbstrait,
  options: OptionsCompas = {},
) {
  const D = translation2Points(C, A, B)
  const N = homothetie(C, D, 1.5)
  const P = homothetie(D, C, 1.5)
  this.compasEcarter2Points(A, B, options)
  this.compasTracerArcCentrePoint(C, D, options)
  this.compasEcarter2Points(A, C, options)
  this.compasTracerArcCentrePoint(B, D, options)
  this.compasMasquer(options)
  // this.pointCreer(D, options)
  this.regleSegment(N, P, options)
  return D
}
