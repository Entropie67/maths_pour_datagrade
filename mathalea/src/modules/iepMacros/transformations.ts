import type { Droite } from '../../lib/2d/droites'
import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import type { Polygone } from '../../lib/2d/polygones'
import {
  homothetie,
  rotation,
  symetrieAxiale,
  translation,
} from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { vecteur } from '../../lib/2d/Vecteur'
import { shuffle } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { stringNombre } from '../../lib/outils/texNombre'
import type { IAlea2iep, OptionsCompas } from '../Alea2iep.types'
import { randint } from '../outils'
import { perpendiculaireRegleEquerre2points3epoint } from './parallelesEtPerpendiculaires'
import { bleuMathalea } from '../../lib/colors'

const marques = ['/', '//', '///', 'O', '\\\\']

/**
 *
 * @param {objet} p point dont on construit l'image et qui doit être tracé.
 * @param {objet} d axe de symétrie.
 * @param {string} nom nom de l'image
 * @param {objet} options couleur et couleurCodage
 * @author Liouba Leroux et Jean-claude Lhote
 */
export const symetrieAxialePoint = function (
  this: IAlea2iep,
  p: PointAbstrait,
  d: Droite,
  nom: string,
  options: OptionsCompas = {},
) {
  if (nom === undefined || nom === '') {
    nom = p.nom + "'"
  }
  const image = symetrieAxiale(p, d, nom) // on définit le point image (pour le viser avec la règle on ajoute une apostrophe au nom)
  if (longueur(p, image) !== 0) {
    const M = milieu(p, image) // on crée le point milieu
    const N = rotation(p, M, 90)
    const D = rotation(N, M, 180)
    this.regleMasquerGraduations(options)
    perpendiculaireRegleEquerre2points3epoint.call(
      this,
      N,
      D,
      p,
      Object.assign({}, options, {
        couleur: options.couleur ?? this.couleurTraitsDeConstruction,
        epaisseur: this.epaisseurTraitsDeConstruction,
        pointilles: true,
      }),
    )
    this.compasEcarter2Points(M, p, options)
    this.compasTracerArcCentrePoint(M, image, options)
    this.regleMasquer(options)
    this.equerreMasquer(options)
    this.segmentCodage(p, M, options)
    this.segmentCodage(image, M, options)
    this.crayonMasquer(options)
    this.compasMasquer(options)
  }
  this.pointCreer(image, options) // on construit l'image
}

/**
 *
 * @param {objet} p  le point dont on veut construire l'image
 * @param {objet} centre le centre de la rotation
 * @param {number} angle l'angle de la rotation
 * @param {string} nom le nom de l'image (si pas précisé ce sera le nom de l'antécédent avec un ')
 * @param {objet} param4 options couleur et couleurCodage
 * @author Jean-claude Lhote
 */
export const rotationPoint = function (
  this: IAlea2iep,
  p: PointAbstrait,
  centre: PointAbstrait,
  angle: number,
  nom: string,
  options: OptionsCompas = {},
) {
  if (nom === undefined || nom === '') {
    nom = p.nom + "'"
  }
  const image = rotation(p, centre, angle, nom) // on définit le point image (pour le viser avec la règle on ajoute une apostrophe au nom)
  this.regleSegment(
    centre,
    p,
    Object.assign({}, options, {
      epaisseur: this.epaisseurTraitsDeConstruction,
      pointilles: true,
    }),
  ) // On trace le support du rapporteur
  this.rapporteurMontrer(centre, options)
  this.rapporteurTracerDemiDroiteAngle(
    centre,
    p,
    angle,
    Object.assign({}, options, {
      epaisseur: this.epaisseurTraitsDeConstruction,
      pointilles: true,
    }),
  ) // On trace le deuxième côté
  this.regleMasquer(options)
  this.rapporteurMasquer(options)
  this.compasEcarter2Points(centre, p, options) // on prend l'écartement du compas
  this.compasTracerArcCentrePoint(centre, image, options) // On fait l'arc qui coupe la demi-droite
  this.compasMasquer(options)
  this.pointCreer(image, options) // On marque le point image (qui est nommé)
  if (options.codage) {
    if (Math.abs(angle) === 90) {
      this.codageAngleDroit(p, centre, image, options)
    } else {
      this.angleCodage(p, centre, image, options)
      this.textePoint(
        Math.abs(angle) + '°',
        translation(
          homothetie(
            rotation(p, centre, angle / 2),
            centre,
            1.3 / longueur(centre, p),
          ),
          vecteur(-0.2, 0.5),
        ),
        options,
      )
    }
  }
}

//   /**
//  *
//  * @param {objet} p point dont on construit l'image et qui doit être tracé.
//  * @param {objet} d axe de symétrie.
//  * @param {string} nom nom de l'image
//  * @param {objet} options couleur et couleurCodage
//  * @author Liouba Leroux et Jean-claude Lhote
//  */
//   this.symetrieAxialePoint = function (p, d, nom, { couleur = this.couleur, couleurCodage = this.couleurCodage, codage = '//' } = {}) {
//     this.epaisseur = 0.5 // épaisseur et couleur de crayon de papier bien taillé pour la construction
//     this.couleur = 'gray'
//     if (nom === undefined || nom === '') {
//       nom = p.nom + "'"
//     }
//     const image = symetrieAxiale(p, d, nom) // on définit le point image (pour le viser avec la règle on ajoute une apostrophe au nom)
//     if (longueur(p, image) !== 0) {
//       const M = milieu(p, image) // on crée le point milieu
//       const N = rotation(p, M, 90)
//       const D = rotation(N, M, 180)
//       this.regleMasquerGraduations()
//       this.perpendiculaireRegleEquerre2points3epoint(N, D, p)
//       this.compasEcarter2Points(M, p)
//       this.compasTracerArcCentrePoint(M, image)
//       this.regleSegment(p, image)
//       this.regleMasquer()
//       this.equerreMasquer()
//       this.segmentCodage(p, M, { codage: codage, couleur: couleurCodage })
//       this.segmentCodage(image, M, { codage: codage, couleur: couleurCodage })
//       this.crayonMasquer()
//       this.compasMasquer()
//     }
//     this.pointCreer(image, { couleur: couleur, couleurLabel: couleur }) // on construit l'image
//   }

/**
 *
 * @param {objet} p  le point dont on veut construire l'image
 * @param {objet} le point de départ de la translation
 * @param {objet} le point d'arrivée de la translation
 * @param {string} nom le nom de l'image (si pas précisé ce sera le nom de l'antécédent avec un ')
 * @param {objet} param4 options couleur et couleurCodage
 * @author Jean-claude Lhote
 */
export const translationPoint = function (
  this: IAlea2iep,
  p: PointAbstrait,
  A: PointAbstrait,
  B: PointAbstrait,
  nom: string,
  options: OptionsCompas = {},
) {
  const v = vecteur(A, B)
  if (nom === undefined || nom === '') {
    nom = p.nom + "'"
  }
  const image = translation(p, v, nom) // on définit le point image (pour le viser avec la règle on ajoute une apostrophe au nom)
  if (longueur(A, p) !== 0) {
    // si le point de départ A est l'antécédent, alors le point d'arrivée B est l'image... pas besoin de construction
    this.compasEcarter2Points(A, p, options)
    this.compasTracerArcCentrePoint(B, image, options)
    this.compasEcarter2Points(A, B, options)
    this.compasTracerArcCentrePoint(p, image, options)
  }
  this.compasMasquer()
  this.pointCreer(image, options)
  const choix1 = randint(0, 4)
  const choix2 = randint(0, 4, choix1)
  const marque1 = marques[choix1]
  const marque2 = marques[choix2]
  this.traitRapide(
    p,
    image,
    Object.assign({}, options, { epaisseur: 0.5, pointilles: true }),
  )
  this.traitRapide(
    A,
    B,
    Object.assign({}, options, { epaisseur: 0.5, pointilles: true }),
  )
  this.segmentCodage(p, image, Object.assign({}, options, { codage: marque1 }))
  this.segmentCodage(A, B, Object.assign({}, options, { codage: marque1 }))
  this.traitRapide(
    B,
    image,
    Object.assign({}, options, { epaisseur: 0.5, pointilles: true }),
  )
  this.traitRapide(
    A,
    p,
    Object.assign({}, options, { epaisseur: 0.5, pointilles: true }),
  )
  this.segmentCodage(B, image, Object.assign({}, options, { codage: marque2 }))
  this.segmentCodage(A, p, Object.assign({}, options, { codage: marque2 }))
}

/**
 *
 * @param {objet} p  le point dont on veut construire l'image
 * @param {objet} centre le centre de la rotation
 * @param {string} nom le nom de l'image (si pas précisé ce sera le nom de l'antécédent avec un ')
 * @param {objet} param4 options couleur et couleurCodage
 * @author Jean-claude Lhote
 */
export const demiTourPoint = function (
  this: IAlea2iep,
  p: PointAbstrait,
  centre: PointAbstrait,
  nom: string,
  options: OptionsCompas = {},
) {
  if (nom === undefined || nom === '') {
    nom = p.nom + "'"
  }
  const image = rotation(p, centre, 180, nom) // on définit le point image (pour le viser avec la règle on ajoute une apostrophe au nom)
  this.compasEcarter2Points(centre, p, options)
  this.compasTracerArcCentrePoint(centre, image, options)
  this.compasMasquer(options)
  this.crayonDeplacer(p, options)
  this.regleSegment(
    p,
    image,
    Object.assign({}, options, { epaisseur: 0.5, pointilles: true }),
  ) // on trace le segment
  this.pointCreer(image, options) // on construit l'image
  this.regleMasquer(options)
  this.crayonMasquer(options)
  this.segmentCodage(p, centre, options)
  this.segmentCodage(centre, image, options)
}

type OptionsHomothetiePoint = OptionsCompas & {
  positionTexte: { x: number; y: number }
}

/**
 *
 * @param {objet} p point dont on doit construire l'image
 * @param {objet} centre de l'homothétie
 * @param {number} k rapport de l'homothétie
 * @param {array} noms tableau contenant les différents noms des sommets dans le même ordre que ceux de p. Si vide, alors on ajoute ' à ceux de p
 * @param {objet} param4 options (couleur)
 */
export const homothetiePoint = function (
  this: IAlea2iep,
  p: PointAbstrait,
  centre: PointAbstrait,
  k: number,
  nom: string,
  options: OptionsHomothetiePoint,
) {
  let idTexte: number
  if (nom === undefined || nom === '') {
    nom = p.nom + "'"
  }
  const image = homothetie(p, centre, k, nom) // on définit le point image (pour le viser avec la règle on ajoute une apostrophe au nom)
  if (k > 0) {
    idTexte = this.textePosition(
      `Comme le rapport est positif, alors les points ${p.nom} et ${image.nom} sont du même côté de ${centre.nom}.`,
      options.positionTexte.x,
      options.positionTexte.y,
      Object.assign({ taille: 15 }, options),
    )
  } else {
    idTexte = this.textePosition(
      `Comme le rapport est négatif, alors ${centre.nom} est entre les points ${p.nom} et ${image.nom}.`,
      options.positionTexte.x,
      options.positionTexte.y,
      Object.assign({ taille: 15 }, options),
    )
  }
  this.regleSegment(
    p,
    centre,
    Object.assign({}, options, { epaisseur: 0.5, pointilles: true }),
  )
  const l = longueur(p, centre)
  const lprime = arrondi(l, 1) * Math.abs(k)
  const idTexte1 = this.textePosition(
    `La mesure de [${centre.nom}${p.nom}] est ${stringNombre(l, 1)} cm et le rapport de l'homothétie est ${stringNombre(k, 3)}`,
    options.positionTexte.x,
    options.positionTexte.y - 1,
    Object.assign({ taille: 15 }, options),
  )
  const idTexte2 = this.textePosition(
    `donc ${centre.nom}${image.nom} est ${stringNombre(l, 1)} cm × ${stringNombre(Math.abs(k), 3)} = ${stringNombre(lprime, 2)} cm.`,
    options.positionTexte.x,
    options.positionTexte.y - 2,
    Object.assign({ taille: 15 }, options),
  )
  this.regleSegment(
    centre,
    image,
    Object.assign({}, options, { epaisseur: 0.5, pointilles: true }),
  )
  this.regleMasquer(options)
  this.crayonMasquer(options)
  this.pointCreer(image, Object.assign({ couleurPoint: bleuMathalea }, options))
  this.pause()
  this.texteMasquer(idTexte1, options)
  this.texteMasquer(idTexte2, options)
  this.texteMasquer(idTexte, options)
}
/**
 *
 * @param {objet} p le polygone qui est déjà tracé
 * @param {objet} centre le centre de la rotation
 * @param {number} angle l'angle de rotation
 * @author Jean-claude Lhote
 * @param {objet} param4 options couleur et couleurCodage
 */
export const rotationPolygone = function (
  this: IAlea2iep,
  p: Polygone,
  centre: PointAbstrait,
  angle: number,
  noms: string[] = [],
  options: OptionsCompas = {
    couleur: this.couleur,
    couleurCodage: this.couleurCodage,
  },
) {
  let nom
  const p2 = rotation(p, centre, angle)
  let codageAngle
  const marquesAlea = shuffle(marques)
  for (let i = 0; i < p.listePoints.length; i++) {
    nom = noms[i] !== undefined ? noms[i] : p.listePoints[i].nom + "'"
    codageAngle = i < 1 ? (options.codage ?? 'plein') : ''
    if (longueur(centre, p.listePoints[i]) !== 0) {
      // this.rotationPoint(...)
      rotationPoint.call(
        this,
        p.listePoints[i],
        centre,
        angle,
        nom,
        Object.assign({}, options, { codage: codageAngle }),
      )
      this.segmentCodage(
        p.listePoints[i],
        centre,
        Object.assign({}, options, { codage: marquesAlea[i] }),
      )
      this.segmentCodage(
        p2.listePoints[i],
        centre,
        Object.assign({}, options, { codage: marquesAlea[i] }),
      )
    }
  }
  this.polygoneRapide(
    ...p2.listePoints,
    Object.assign(options, { epaisseur: 2 }),
  )
}

/**
 *
 * @param {objet} p polygone dont on construit l'image et qui doit être tracé avec ses points nommés.
 * @param {objet} d axe de symétrie.
 * @param {string[]} noms tableau contenant les noms des sommets dans le même ordre que p
 * @param {objet} param3 options couleur et couleurCodage
 * @author Liouba Leroux et Jean-claude Lhote
 */
export const symetrieAxialePolygone = function (
  this: IAlea2iep,
  p: Polygone,
  d: Droite,
  noms: string[] = [],
  options: OptionsCompas = {},
) {
  let nom: string
  const p2 = symetrieAxiale(p, d)
  let i = 0
  const marques = ['/', '//', '///', 'O', '\\\\']
  for (const sommet of p.listePoints) {
    nom = noms[i] !== undefined ? noms[i] : sommet.nom + "'"
    // this.symetrieAxialePoint(...)
    symetrieAxialePoint.call(
      this,
      sommet,
      d,
      nom,
      Object.assign({}, options, { codage: marques[i], epaisseur: 0.5 }),
    )
    i++
  }
  this.compasMasquer(options)
  this.crayonMasquer(options)
  this.polygoneRapide(
    ...p2.listePoints,
    Object.assign({}, options, { epaisseur: 2 }),
  )
}

/**
 *
 * @param {objet} p polygone dont on construit l'image
 * @param {objet} A point de départ de la translation
 * @param {objet} B point d'arrivée de la translation
 * @param {string[]} noms tableau contenant les noms des sommets dans le même ordre que p
 * @param {objet} param3 options couleur et couleurCodage
 * @author Jean-claude Lhote
 */
export const translationPolygone = function (
  this: IAlea2iep,
  p: Polygone,
  A: PointAbstrait,
  B: PointAbstrait,
  noms: string[] = [],
  options: OptionsCompas = {},
) {
  let nom
  const v = vecteur(A, B)
  const p2 = translation(p, v)
  for (let i = 0; i < p.listePoints.length; i++) {
    nom = noms[i] !== undefined ? noms[i] : p.listePoints[i].nom + "'"
    // this.translationPoint(...)
    translationPoint.call(this, p.listePoints[i], A, B, nom, options)
  }
  this.polygoneRapide(
    ...p2.listePoints,
    Object.assign({}, options, { epaisseur: 2 }),
  )
}

/**
 *
 * @param {objet} p  le polygone dont on veut construire l'image qui doit être tracé
 * @param {objet} centre le centre de symétrie
 * @param {array} noms les noms des sommets images (si pas précisé ce sera le nom de l'antécédent avec un ')
 * @param {objet} param3 options couleur et couleurCodage
 * @author Jean-claude Lhote
 */
export const demiTourPolygone = function (
  this: IAlea2iep,
  p: Polygone,
  centre: PointAbstrait,
  noms: string[] = [],
  options: OptionsCompas = {},
) {
  const p2 = rotation(p, centre, 180)
  let nom
  let i = 0
  const marques = ['/', '//', '///', 'O', '\\\\']
  for (const sommet of p.listePoints) {
    nom = noms[i] !== undefined ? noms[i] : sommet.nom + "'"
    // this.demiTourPoint(...)
    demiTourPoint.call(
      this,
      sommet,
      centre,
      nom,
      Object.assign({}, options, { codage: marques[i] }),
    )
    i++
  }
  this.polygoneRapide(
    ...p2.listePoints,
    Object.assign({}, options, { epaisseur: 2 }),
  )
}

/**
 *
 * @param {objet} p polygone dont on doit construire l'image
 * @param {objet} centre de l'homothétie
 * @param {number} k rapport de l'homothétie
 * @param {array} noms tableau contenant les différents noms des sommets dans le même ordre que ceux de p. Si vide, alors on ajoute ' à ceux de p
 * @param {objet} param4 options (couleur)
 */
export const homothetiePolygone = function (
  this: IAlea2iep,
  p: Polygone,
  centre: PointAbstrait,
  k: number,
  noms = [],
  options: OptionsCompas = {},
) {
  let nom
  const p2 = homothetie(p, centre, k)
  const t = this.textePosition(
    'Comme k est ' +
      (k >= 0 ? 'positif' : 'négatif') +
      ' alors ' +
      (k >= 0
        ? 'les figures sont du même côté de ' + centre.nom
        : centre.nom + ' est entre les figures'),
    0,
    0,
    Object.assign({ taille: 15 }, options),
  )
  let i = 0
  for (const sommet of p.listePoints) {
    nom = noms[i] !== undefined ? noms[i] : sommet.nom + "'"
    // this.homothetiePoint(...)
    homothetiePoint.call(
      this,
      sommet,
      centre,
      k,
      nom,
      Object.assign({}, options, {
        epaisseur: 1,
        positionTexte: { x: 0, y: 0 },
      }),
    )
    i++
  }
  this.polygoneRapide(
    ...p2.listePoints,
    Object.assign({}, options, { epaisseur: 2 }),
  )
  this.texteMasquer(t, options)
}
