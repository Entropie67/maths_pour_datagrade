// import iepLoadPromise from 'instrumenpoche'
import { droite } from '../lib/2d/droites'
import { pointAbstrait, PointAbstrait } from '../lib/2d/PointAbstrait'
import { Segment, segment } from '../lib/2d/segmentsVecteurs'
import {
  homothetie,
  rotation,
  translation,
  translation2Points,
} from '../lib/2d/transformations'
import {
  angleModulo,
  angleOriente,
  longueur,
  norme,
} from '../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointAdistance,
  pointSurSegment,
} from '../lib/2d/utilitairesPoint'
import { vecteur } from '../lib/2d/Vecteur'
import { bleuMathalea, orangeMathalea } from '../lib/colors'
import { context } from './context'
import { reporterAuCompas2pointsCentreDirection } from './iepMacros/compas'
import {
  bissectriceAuCompas,
  cercleCirconscrit,
  hauteur,
  mediane,
  mediatriceAuCompas,
  mediatriceRegleEquerre,
} from './iepMacros/droitesRemarquables'
import { milieuALaRegle } from './iepMacros/milieu'
import {
  paralleleAuCompas,
  paralleleAuCompasAvecDescription,
  paralleleRegleEquerre2points3epoint,
  paralleleRegleEquerreDroitePointAvecDescription,
  perpendiculaireCompasPoint,
  perpendiculaireCompasPointSurLaDroite,
  perpendiculaireRegleEquerre2points3epoint,
  perpendiculaireRegleEquerreDroitePoint,
  perpendiculaireRegleEquerrePointSurLaDroite,
} from './iepMacros/parallelesEtPerpendiculaires'
import {
  parallelogramme2sommetsConsecutifsCentre,
  parallelogramme3sommetsConsecutifs,
  parallelogrammeAngleCentre,
  partageSegment,
} from './iepMacros/parallelogrammes'
import { carre1point1longueur } from './iepMacros/quadrilateres'
import {
  demiTourPoint,
  demiTourPolygone,
  homothetiePoint,
  homothetiePolygone,
  rotationPoint,
  rotationPolygone,
  symetrieAxialePoint,
  symetrieAxialePolygone,
  translationPoint,
  translationPolygone,
} from './iepMacros/transformations'
import {
  triangle1longueur2angles,
  triangle2longueurs1angle,
  triangle3longueurs,
  triangleEquilateral,
  triangleEquilateral2Sommets,
  triangleIsocele2Longueurs,
  triangleRectangle2Cotes,
  triangleRectangleCoteHypotenuse,
} from './iepMacros/triangles'

const store: Record<string, string> = {}

export class StoreIep {
  static getXml(id: string) {
    return store[id]
  }

  static saveXml(id: string, xml: string) {
    store[id] = xml
  }
}

type ObjetIep = {
  visibilite: boolean
  position: PointAbstrait
  angle: number
  zoom: number
}

type Regle = ObjetIep & {
  longueur: number // Longueur de la règle en cm
}

type Rapporteur = ObjetIep & {
  rayon: number // Rayon du rapporteur en cm
}

type Compas = ObjetIep & {
  orientation: 'droite' | 'gauche' // Orientation du compas
  ecartement: number // Ecartement du compas en cm
  leve: boolean // Le compas est-il levé ?
}

type StringOutil =
  'regle' | 'equerre' | 'requerre' | 'rapporteur' | 'compas' | 'crayon'

type VisibiliteInstrumentsIep = Record<StringOutil, boolean>
type PositionsInstrumentsIep = Partial<Record<StringOutil, PointAbstrait>>

const outilsIep: StringOutil[] = [
  'regle',
  'equerre',
  'requerre',
  'rapporteur',
  'compas',
  'crayon',
]

const EPSILON_SEGMENT_IEP = 1e-9

export type OptionsIep = {
  id?: string // Identifiant de l'objet
  tempo?: number // Temps d'attente après l'instruction
  vitesse?: number // Vitesse de déplacement des instruments
  sens?: number // Vitesse de rotation des instruments
  couleur?: string // Couleur des traits
  epaisseur?: number // Epaisseur des traits
  pointilles?: boolean // Pointillés ou traits pleins
  couleurLabel?: string // Couleur du label des points
  couleurPoint?: string // Couleur du nom des points
  description?: boolean // Pour ajouter un texte qui décrit les étapes de construction
  placerNomsSommets?: boolean // Place les noms à l'extérieur d'un triangle
  positionsRangementInstruments?: PositionsInstrumentsIep
}

export type OptionsOutil = OptionsIep & {}

export type OptionsCrayon = OptionsOutil & {
  vecteur?: boolean
}

export type OptionsOutilMesure = OptionsCrayon & {
  longueur?: number // Longueur pour la règle ou le compas
  codage?: string // Code pour le codage
  couleurCodage?: string // Couleur du codage
  sens?: number // Sens de la rotation
  zeroSurPremierPoint?: boolean // Place le zéro de la règle sur le premier point du segment
}

export type OptionsRegle = OptionsOutilMesure & {}

export type OptionsEquerre = OptionsRegle & {}

export type OptionsRequerre = OptionsEquerre & {}

export type OptionsRapporteur = OptionsOutilMesure & {}

export type OptionsCompas = OptionsRapporteur & {
  rayon?: number // Rayon du cercle tracé par le compas
  delta?: number // Delta pour l'arc de cercle autour d'un point
  couleurCompas?: string // Couleur du compas
}

export type OptionsPoint = OptionsCrayon & {
  label?: string // Label du point
  dx?: number // Décalage horizontal du label du point
  dy?: number // Décalage vertical du label du point
  taille?: number // Taille du label du point
}

export type OptionsTexte = OptionsIep & {
  police?: string
  taille?: number
  couleur?: string
  couleurFond?: string
  opaciteFond?: string
  couleurCadre?: string
  epaisseurCadre?: number
  marge?: number
  margeGauche?: number
  margeDroite?: number
  margeHaut?: number
  margeBas?: number
}
/*
 * Classe parente de tous les objets Alea2iep
 *
 * @author Rémi Angot
 */
/**
 * Angles (en degrés, sens trigonométrique) de début et de fin de l'arc de
 * centre centre allant de A à B : le plus petit des deux arcs, et pour un
 * demi-cercle, celui parcouru de A à B dans le sens trigonométrique.
 */
export function anglesArcCentre2Extremites(
  centre: PointAbstrait,
  A: PointAbstrait,
  B: PointAbstrait,
): { debut: number; fin: number } {
  const debut = (Math.atan2(A.y - centre.y, A.x - centre.x) * 180) / Math.PI
  const angleB = (Math.atan2(B.y - centre.y, B.x - centre.x) * 180) / Math.PI
  let balayage = (((angleB - debut) % 360) + 360) % 360
  if (balayage > 180 + 1e-6) balayage -= 360
  return { debut, fin: debut + balayage }
}

export default class Alea2iep {
  idIEP: number // Identifiant pour les tracés
  idHTML: number // Identifiant pour les div et le svg
  tempo: number // Pause par défaut après une instruction
  vitesse: number // Vitesse par défaut pour les déplacements d'instruments
  couleur: string // Couleur par défaut
  couleurCompas: string
  couleurTexte: string
  couleurPoint: string // Couleur du nom des points
  couleurCodage: string
  couleurTraitsDeConstruction: string
  epaisseur: number
  epaisseurTraitsDeConstruction: number
  pointilles: boolean
  liste_script: string[] // Liste des instructions xml mise à jour par les méthodes
  translationX: number
  translationY: number // Par défaut l'angle en haut à gauche est le point de coordonnées (0,10)
  xMin: number // Garde en mémoire les coordonnées extrêmes des objets créés
  yMin: number
  xMax: number
  yMax: number
  regle: Regle
  crayon: ObjetIep
  equerre: ObjetIep
  requerre: ObjetIep & { abscisse: number }
  rapporteur: Rapporteur
  compas: Compas
  xml: string // Code XML de l'animation
  private visibilitesPreservees: VisibiliteInstrumentsIep[] = []
  private nomsDesPoints = new WeakMap<PointAbstrait, number>()
  symetrieAxialePoint = symetrieAxialePoint
  parallelogramme3sommetsConsecutifs = parallelogramme3sommetsConsecutifs
  parallelogrammeAngleCentre = parallelogrammeAngleCentre
  partageSegment = partageSegment
  paralleleRegleEquerre2points3epoint = paralleleRegleEquerre2points3epoint
  perpendiculaireRegleEquerre2points3epoint =
    perpendiculaireRegleEquerre2points3epoint

  perpendiculaireRegleEquerreDroitePoint =
    perpendiculaireRegleEquerreDroitePoint

  perpendiculaireRegleEquerrePointSurLaDroite =
    perpendiculaireRegleEquerrePointSurLaDroite

  perpendiculaireCompasPointSurLaDroite = perpendiculaireCompasPointSurLaDroite
  perpendiculaireCompasPoint = perpendiculaireCompasPoint
  paralleleRegleEquerreDroitePointAvecDescription =
    paralleleRegleEquerreDroitePointAvecDescription

  paralleleAuCompasAvecDescription = paralleleAuCompasAvecDescription
  paralleleAuCompas = paralleleAuCompas
  reporterAuCompas2pointsCentreDirection =
    reporterAuCompas2pointsCentreDirection
  mediatriceAuCompas = mediatriceAuCompas
  mediatriceRegleEquerre = mediatriceRegleEquerre
  hauteur = hauteur
  mediane = mediane
  bissectriceAuCompas = bissectriceAuCompas
  cercleCirconscrit = cercleCirconscrit
  milieuALaRegle = milieuALaRegle
  triangle3longueurs = triangle3longueurs
  triangleRectangleCoteHypotenuse = triangleRectangleCoteHypotenuse
  triangleRectangle2Cotes = triangleRectangle2Cotes
  triangle1longueur2angles = triangle1longueur2angles
  triangle2longueurs1angle = triangle2longueurs1angle
  triangleEquilateral2Sommets = triangleEquilateral2Sommets
  triangleEquilateral = triangleEquilateral
  carre1point1longueur = carre1point1longueur
  rotationPoint = rotationPoint
  translationPoint = translationPoint
  demiTourPoint = demiTourPoint
  homothetiePoint = homothetiePoint
  rotationPolygone = rotationPolygone
  symetrieAxialePolygone = symetrieAxialePolygone
  translationPolygone = translationPolygone
  demiTourPolygone = demiTourPolygone
  homothetiePolygone = homothetiePolygone
  parallelogramme2sommetsConsecutifsCentre =
    parallelogramme2sommetsConsecutifsCentre

  triangleIsocele2Longueurs = triangleIsocele2Longueurs

  constructor() {
    this.idIEP = 0 // Identifiant pour les tracés
    this.idHTML = 0 // Identifiant pour les div et le svg
    this.tempo = 5 // Pause par défaut après une instruction
    this.vitesse = 10 // Vitesse par défaut pour les déplacements d'instruments
    this.couleur = bleuMathalea // Couleur par défaut
    this.couleurCompas = 'forestgreen'
    this.couleurTexte = 'black'
    this.couleurPoint = 'black' // Couleur du nom des points
    this.couleurCodage = orangeMathalea
    this.couleurTraitsDeConstruction = 'gray'
    this.epaisseur = 2
    this.epaisseurTraitsDeConstruction = 0.5
    this.pointilles = false
    this.liste_script = [] // Liste des instructions xml mise à jour par les méthodes

    this.translationX = 0
    this.translationY = 10 // Par défaut l'angle en haut à gauche est le point de coordonnées (0,10)

    // Garde en mémoire les coordonnées extrêmes des objets créés
    this.xMin = 0
    this.yMin = 0
    this.xMax = 0
    this.yMax = 0

    // Sauvegarde de l'état des instruments
    this.regle = {
      visibilite: false,
      position: pointAbstrait(0, 0),
      angle: 0,
      longueur: 15,
      zoom: 100,
    }

    this.crayon = {
      visibilite: false,
      position: pointAbstrait(0, 0),
      angle: 0,
      zoom: 100,
    }

    this.equerre = {
      visibilite: false,
      position: pointAbstrait(0, 0),
      angle: 0,
      zoom: 100,
    }

    this.requerre = {
      visibilite: false,
      position: pointAbstrait(0, 0),
      angle: 0,
      zoom: 100,
      abscisse: 0, // abscisse de l'équerre sur la règle
    }

    this.rapporteur = {
      visibilite: false,
      position: pointAbstrait(0, 0),
      angle: 0,
      rayon: 5.2,
      zoom: 100,
    }

    this.compas = {
      visibilite: false,
      position: pointAbstrait(0, 0),
      angle: 0,
      orientation: 'droite',
      ecartement: 0,
      leve: false,
      zoom: 100,
    }

    this.xml = ''
  }
  /** **** Fin du constructeur */

  // Transforme les coordonnées MathALEA2D en coordonnées pour le XML d'IEP
  x(A: PointAbstrait) {
    const x = Math.round((A.x + this.translationX) * 30)
    if (A.x > this.xMax) {
      this.xMax = A.x
    }
    if (A.x < this.xMin) {
      this.xMin = A.x
    }
    return x
  }

  y(A: PointAbstrait) {
    const y = Math.round((-A.y + this.translationY) * 30)
    if (A.y < this.yMin) {
      this.yMin = A.y
    }
    if (A.y > this.yMax) {
      this.yMax = A.y
    }
    return y
  }

  /**
   * Renvoie le script xml
   *
   */
  script() {
    if (this.xml.length > 1) {
      return this.xml
    } else {
      let codeXML = '<?xml version="1.0" encoding="UTF-8"?>\n'
      codeXML += '<INSTRUMENPOCHE version="2">\n'
      codeXML += this.liste_script.join('\n')
      codeXML += '\n</INSTRUMENPOCHE>'
      return codeXML
    }
  }

  /**
   * Renvoie le code HTML de l'animation
   * @param {number} numeroExercice - Numéro de l'exercice
   * @param {number} i - Numéro de la question
   */
  html(numeroExercice: number, id2 = 0) {
    if (context.isHtml) {
      // Enregistrer les custom elements InstrumentPoche à la demande
      this.ensureInstrumenPocheElementsRegistered()

      const id = `IEP_${numeroExercice}_${id2}`
      StoreIep.saveXml(id, this.script())
      const codeHTML = `<alea-instrumenpoche id=${id}>`
      return codeHTML
    }
    return ''
  }

  /**
   *
   * @param {number} [id1] NumeroExercice - Numéro de l'exercice
   * @param {number} [id2] Numéro de la question
   * @return Code HTML avec le bouton qui affiche ou masque un div avec l'animation
   */
  htmlBouton(id1 = 0, id2 = 0) {
    if (context.isHtml) {
      // Enregistrer les custom elements InstrumentPoche à la demande
      this.ensureInstrumenPocheElementsRegistered()

      const id = `IEP_${id1}_${id2}`
      StoreIep.saveXml(id, this.script())
      const codeHTML = `<alea-buttoninstrumenpoche id=${id}>`
      return codeHTML
    }
    return ''
  }

  /**
   * Enregistre les custom elements InstrumentPoche si ce n'est pas déjà fait
   */
  private async ensureInstrumenPocheElementsRegistered() {
    if (customElements.get('alea-instrumenpoche') === undefined) {
      try {
        const { ElementInstrumenpoche, ElementButtonInstrumenpoche } =
          await import('./ElementInstrumenpoche')
        if (customElements.get('alea-instrumenpoche') === undefined) {
          // obliger à vérifier à nouveau car si c'est un appel concurrent,
          //  le premier peut avoir enregistré les éléments
          customElements.define('alea-instrumenpoche', ElementInstrumenpoche)
          customElements.define(
            'alea-buttoninstrumenpoche',
            ElementButtonInstrumenpoche,
          )
        }
      } catch (error) {
        // Ignore les erreurs de double enregistrement qui peuvent survenir lors de rechargements
        if (
          error instanceof DOMException &&
          error.name === 'NotSupportedError'
        ) {
          console.debug('Custom elements already registered:', error.message)
        } else {
          throw error
        }
      }
    }
  }

  /**
   **************************
   *** FONCTIONS COMMUNES ***
   **************************
   */

  recadre(xmin: number, ymax: number) {
    this.translationX = 1 - xmin
    this.translationY = ymax + 3
  }

  taille(width: number, height: number) {
    this.liste_script.push(`<viewBox width="${width}" height="${height}" />`)
  }

  montrer(outil: StringOutil, A: PointAbstrait, options: OptionsIep = {}) {
    const tempo = options.tempo ?? this.tempo
    if (!this[outil].visibilite || this[outil].position !== A) {
      // On ajoute une ligne xml que si l'objet est caché ou doit apparaitre à un autre endroit
      let codeXML = ''
      let A1
      if (typeof A === 'undefined') {
        // A1 est une copie de A ou (0,0) si A n'est pas défini
        A1 = this[outil].position
      } else {
        A1 = A
      }
      if (this[outil].visibilite) {
        // S'il est déjà visible, montrer devient un déplacer
        this.deplacer(outil, A1, options)
      } else {
        codeXML = `<action objet="${outil}" mouvement="montrer" abscisse="${this.x(A1)}" ordonnee="${this.y(A1)}" tempo="${tempo}" />`
        this[outil].visibilite = true
      }
      this[outil].position = A1
      this.liste_script.push(codeXML)
    }
  }

  regleMontrer(A?: PointAbstrait, options: OptionsRegle = {}) {
    this.montrer('regle', A ?? this.regle.position, options)
  }

  crayonMontrer(A?: PointAbstrait, options: OptionsCrayon = {}) {
    this.montrer('crayon', A ?? this.crayon.position, options)
  }

  equerreMontrer(A?: PointAbstrait, options: OptionsEquerre = {}) {
    this.montrer('equerre', A ?? this.equerre.position, options)
  }

  requerreMontrer(A?: PointAbstrait, options: OptionsRequerre = {}) {
    this.montrer('requerre', A ?? this.requerre.position, options)
  }

  requerreRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options: OptionsRequerre = {},
  ) {
    this.rotationTranslation('requerre', angle, A, options)
  }

  compasMontrer(A?: PointAbstrait, options: OptionsCompas = {}) {
    this.montrer('compas', A ?? this.compas.position, options)
  }

  rapporteurMontrer(A?: PointAbstrait, options: OptionsRapporteur = {}) {
    this.montrer('rapporteur', A ?? this.rapporteur.position, options)
  }

  masquer(outil: StringOutil, options: OptionsOutil = {}) {
    const visibilitePreservee = this.visibilitesPreservees.at(-1)
    if (visibilitePreservee?.[outil] === true) return
    const tempo = options.tempo ?? this.tempo
    if (this[outil].visibilite) {
      // On ajoute une ligne xml que si l'objet est visible
      const codeXML = `<action objet="${outil}" mouvement="masquer" tempo="${tempo}" />`
      this[outil].visibilite = false
      this.liste_script.push(codeXML)
    }
  }

  regleMasquer(options: OptionsRegle = {}) {
    this.masquer('regle', options)
  }

  crayonMasquer(options: OptionsCrayon = {}) {
    this.masquer('crayon', options)
  }

  equerreMasquer(options: OptionsEquerre = {}) {
    this.masquer('equerre', options)
  }

  requerreMasquer(options: OptionsRequerre = {}) {
    this.masquer('requerre', options)
  }

  compasMasquer(options: OptionsCompas = {}) {
    this.masquer('compas', options)
  }

  rapporteurMasquer(options: OptionsRapporteur = {}) {
    this.masquer('rapporteur', options)
  }

  sauvegarderVisibiliteInstruments(): VisibiliteInstrumentsIep {
    return Object.fromEntries(
      outilsIep.map((outil) => [outil, this[outil].visibilite]),
    ) as VisibiliteInstrumentsIep
  }

  restaurerVisibiliteInstruments(
    etat: VisibiliteInstrumentsIep,
    options: OptionsIep = {},
  ) {
    for (const outil of outilsIep) {
      if (etat[outil]) {
        this.montrer(outil, this[outil].position, options)
      } else {
        this.masquer(outil, options)
      }
    }
  }

  preserverVisibiliteInstruments<T>(
    callback: () => T,
    options: OptionsIep = {},
  ): T {
    const etat = this.sauvegarderVisibiliteInstruments()
    this.visibilitesPreservees.push(etat)
    try {
      return callback()
    } finally {
      this.visibilitesPreservees.pop()
      this.restaurerVisibiliteInstruments(etat, options)
    }
  }

  rangerInstruments(
    positions: PositionsInstrumentsIep,
    outils: StringOutil[] = outilsIep,
    options: OptionsIep = {},
  ) {
    const optionsRangement = {
      tempo: 0,
      vitesse: 20,
      sens: 100000,
      ...options,
    }
    for (const outil of outils) {
      const position = positions[outil]
      if (position !== undefined && this[outil].visibilite) {
        this.rotationTranslation(outil, 0, position, optionsRangement)
      }
    }
  }

  deplacer(outil: StringOutil, A: PointAbstrait, options: OptionsOutil = {}) {
    const tempo = options.tempo ?? this.tempo
    const vitesse = options.vitesse ?? this.vitesse
    if (this[outil].position !== A) {
      // On n'ajoute une commande xml que s'il y a vraiment un déplacement
      const codeXML = `<action objet="${outil}" mouvement="translation" abscisse="${this.x(A)}" ordonnee="${this.y(A)}" tempo="${tempo}" vitesse="${vitesse}" />`
      this[outil].position = A
      this.liste_script.push(codeXML)
    }
  }

  regleDeplacer(A: PointAbstrait, options: OptionsRegle = {}) {
    this.deplacer('regle', A, options)
  }

  texteDeplacer(
    id: string | number,
    A: PointAbstrait,
    options: OptionsIep = {},
  ) {
    const tempo = options.tempo ?? this.tempo
    const vitesse = options.vitesse ?? this.vitesse
    const codeXML = `<action objet="texte" id="${id}" mouvement="translation" abscisse="${this.x(A)}" ordonnee="${this.y(A)}" tempo="${tempo}" vitesse="${vitesse}" />`
    this.liste_script.push(codeXML)
  }

  crayonDeplacer(A: PointAbstrait, options: OptionsCrayon = {}) {
    this.deplacer('crayon', A, options)
  }

  equerreDeplacer(A: PointAbstrait, options: OptionsEquerre = {}) {
    this.deplacer('equerre', A, options)
  }

  requerreDeplacer(A: PointAbstrait, options: OptionsRequerre = {}) {
    this.deplacer('requerre', A, options)
  }

  compasDeplacer(A: PointAbstrait, options: OptionsCompas = {}) {
    this.deplacer('compas', A, options)
  }

  rapporteurDeplacer(A: PointAbstrait, options: OptionsRapporteur = {}) {
    this.deplacer('rapporteur', A, options)
  }

  rotation(
    outil: StringOutil,
    angle: number | PointAbstrait,
    options: OptionsCompas = {},
  ) {
    const tempo = options.tempo ?? this.tempo
    const sens = options.sens ?? Math.round(this.vitesse / 2)
    let angleDeRotation: number
    if (typeof angle === 'number') {
      angleDeRotation = angle
    } else {
      const d = droite(this[outil].position, angle)
      angleDeRotation = d.angleAvecHorizontale
    }
    if (this[outil].angle !== angle) {
      // Si la rotation est inutile, on ne la fait pas
      // Les angles de MathALEA2D et de IEP sont opposés !!!!!
      const codeXML = `<action objet="${outil}" mouvement="rotation" angle="${-1 * angleDeRotation}" tempo="${tempo}" sens="${sens}" />`
      this[outil].angle = angleDeRotation
      if (typeof angleDeRotation === 'number' && isFinite(angleDeRotation)) {
        this.liste_script.push(codeXML)
      } else {
        console.error("Angle de rotation non défini pour l'objet .", outil)
      }
    }
  }

  regleRotation(angle: number | PointAbstrait, options: OptionsRegle = {}) {
    this.rotation('regle', angle, options)
  }

  rotationTranslation(
    outil: StringOutil,
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options: OptionsOutilMesure = {},
  ) {
    const tempo = options.tempo ?? this.tempo
    const vitesse = options.vitesse ?? this.vitesse
    const sens = options.sens ?? Math.round(this.vitesse / 2)
    let angleDeRotation: number
    if (typeof angle === 'number') {
      angleDeRotation = angle
    } else {
      const d = droite(this[outil].position, angle)
      angleDeRotation = d.angleAvecHorizontale
    }
    if (
      !this[outil].visibilite ||
      this[outil].angle !== angleDeRotation ||
      this[outil].position !== A
    ) {
      const codeXML = `<action objet="${outil}" mouvement="rotation_translation" angle="${-1 * angleDeRotation}" abscisse="${this.x(A)}" ordonnee="${this.y(A)}" tempo="${tempo}" sens="${sens}" vitesse="${vitesse}" />`
      this[outil].angle = angleDeRotation
      this[outil].position = A
      this[outil].visibilite = true
      if (typeof angleDeRotation === 'number' && isFinite(angleDeRotation)) {
        this.liste_script.push(codeXML)
      } else {
        console.error("Angle de rotation non défini pour l'objet .", outil)
      }
    }
  }

  regleRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options: OptionsRegle = {},
  ) {
    this.rotationTranslation('regle', angle, A, options)
  }

  crayonRotation(angle: number | PointAbstrait, options: OptionsCrayon = {}) {
    this.rotation('crayon', angle, options)
  }

  equerreRotation(angle: number | PointAbstrait, options: OptionsEquerre = {}) {
    this.rotation('equerre', angle, options)
  }

  equerreRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options: OptionsEquerre = {},
  ) {
    this.rotationTranslation('equerre', angle, A, options)
  }

  requerreRotation(
    angle: number | PointAbstrait,
    options: OptionsRequerre = {},
  ) {
    this.rotation('requerre', angle, options)
  }

  compasRotation(angle: number | PointAbstrait, options: OptionsCompas = {}) {
    this.rotation('compas', angle, options)
  }
  compasRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options: OptionsRegle = {},
  ) {
    this.rotationTranslation('compas', angle, A, options)
  }

  rapporteurRotation(
    angle: number | PointAbstrait,
    options: OptionsRapporteur = {},
  ) {
    this.rotation('rapporteur', angle, options)
  }

  rapporteurRotationTranslation(
    angle: number | PointAbstrait,
    A: PointAbstrait,
    options: OptionsRapporteur = {},
  ) {
    this.rotationTranslation('rapporteur', angle, A, options)
  }

  /**
   * @param {string} outil - 'regle', 'equerre', 'requerre, 'compas' ou 'rapporteur'
   * @param {number} echelle 200 pour doubler la taille
   * @param {objet} [options] tempo = 0 par défaut
   */
  zoom(outil: StringOutil, echelle: number, options: OptionsIep = {}) {
    const tempo = options.tempo ?? 0
    this[outil].zoom = echelle
    this.liste_script.push(
      `<action echelle="${echelle}" mouvement="zoom" objet="${outil}" tempo="${tempo}" />`,
    )
  }

  /**
   *
   * @param {number} pourcentage 200 pour doubler la taille
   * @param {objet} [options] tempo = 0 par défaut
   */
  regleZoom(echelle: number, options: OptionsIep = {}) {
    this.zoom('regle', echelle, options)
    this.regle.longueur = (this.regle.longueur * echelle) / 100
  }

  /**
   *
   * @param {number} pourcentage 200 pour doubler la taille
   * @param {objet} [options] tempo = 0 par défaut
   */
  equerreZoom(echelle: number, options: OptionsIep = {}) {
    this.zoom('equerre', echelle, options)
  }

  /**
   *
   * @param {number} pourcentage 200 pour doubler la taille
   * @param {objet} [options] tempo = 0 par défaut
   */
  requerreZoom(echelle: number, options: OptionsIep = {}) {
    this.zoom('requerre', echelle, options)
  }

  /**
   *
   * @param {number} pourcentage 200 pour doubler la taille
   * @param {objet} [options] tempo = 0 par défaut
   */
  rapporteurZoom(echelle: number, options: OptionsIep = {}) {
    this.zoom('rapporteur', echelle, options)
  }

  /**
   *
   * @param {number} pourcentage 200 pour doubler la taille
   * @param {objet} [options] tempo = 0 par défaut
   */
  compasZoom(echelle: number, options: OptionsIep = {}) {
    this.zoom('compas', echelle, options)
  }

  /**
   **************************
   ********* POINT **********
   **************************
   */

  /**
   * Créer un point avec la croix pour le situer et son nom en bas à droite par défaut. L'id sera sauvegardé dans l'objet point. S'il n'est pas défini alors on prend le premier entier disponible.
   * @param {PointAbstrait} A
   * @param {objet} [options] Défaut : { dx = 0.1, dy, label = A.nom, tempo = this.tempo, couleur = this.couleurPoint, couleurLabel = this.couleurTexte, id }
   */
  pointCreer(A: PointAbstrait, options: OptionsPoint = {}) {
    const label = options.label ?? A.nom
    const couleur = options.couleurPoint ?? options.couleur ?? this.couleurPoint
    const tempo = options.tempo ?? this.tempo
    const couleurLabel = options.couleurLabel ?? couleur
    if (options.id) {
      A.id = options.id
    } else {
      this.idIEP++
      A.id = this.idIEP
    }
    let codeXML
    if (label) {
      codeXML = `<action abscisse="${this.x(A)}" ordonnee="${this.y(A)}" couleur="${couleur}" id="${A.id}" mouvement="creer" objet="point" tempo="${tempo}"/>`
      // codeXML += `\n<action couleur="${couleurLabel}" nom="${label}" id="${this.idIEP}" mouvement="nommer" objet="point" tempo="${tempo}"  />`
      const M = pointAbstrait(A.x, A.y)
      if (options.dx) {
        M.x += options.dx
      }
      if (options.dy) {
        M.y += options.dy
      }
      const idNom = this.textePoint(`$${label}$`, M, {
        tempo: 0,
        couleur: couleurLabel,
        taille: options.taille,
      })
      this.nomsDesPoints.set(A, idNom)
    } else {
      this.nomsDesPoints.delete(A)
      codeXML = `<action abscisse="${this.x(A)}" ordonnee="${this.y(A)}" couleur="${couleur}" id="${A.id}" mouvement="creer" objet="point" tempo="${tempo}" />`
    }
    this.liste_script.push(codeXML)
  }

  /**
   *
   * Création de plusieurs points
   * On peut passer des points ou des options. Toutes les options sont intégrées à tous les points.
   */
  pointsCreer(...args: (PointAbstrait | OptionsPoint)[]) {
    const options: OptionsPoint = { tempo: 0 }
    args
      .filter((arg) => !(arg instanceof PointAbstrait))
      .forEach((option) => {
        // On intègre aux options les paramètres des arguments qui ne sont pas des points
        Object.assign(options, option)
      })
    args
      .filter((arg) => arg instanceof PointAbstrait)
      .forEach((point) => {
        this.pointCreer(point, options)
      })
  }

  /**
   * Masquer un point
   * @param {PointAbstrait} A
   * @param {objet} [options] Défaut : { tempo: 0 }
   */
  pointMasquer(...args: (PointAbstrait | OptionsPoint)[]) {
    const options: OptionsPoint = { tempo: 0 }
    args
      .filter((arg) => !(arg instanceof PointAbstrait))
      .forEach((option) => {
        // On intègre aux options les paramètres des arguments qui ne sont pas des points
        Object.assign(options, option)
      })
    args
      .filter((arg) => arg instanceof PointAbstrait)
      .forEach((point) => {
        this.liste_script.push(
          `<action id="${point.id}" mouvement="masquer" objet="point" tempo="${options.tempo}" />`,
        )
      })
  }

  /**
   * Montrer un point qui aurait été caché
   * @param {PointAbstrait} A
   * @param {objet} [options] Défaut : { tempo: 0 }
   */
  pointMontrer(A: PointAbstrait, options: OptionsPoint = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action id="${A.id}" mouvement="montrer" objet="point" tempo="${tempo}" />`,
    )
  }

  /**
   * Anime la translation d'un point
   * @param {PointAbstrait} A
   * @param {number} x Abscisse du point d'arrivée
   * @param {number} y Ordonnée du point d'arrivée
   * @param {objet} [options] Défaut : { tempo: this.tempo, vitesse: this.vitesse }
   */
  pointDeplacer(
    A: PointAbstrait,
    x: number,
    y: number,
    options: OptionsPoint = {},
  ) {
    const tempo = options.tempo ?? this.tempo
    const vitesse = options.vitesse ?? this.vitesse
    const B = pointAbstrait(x, y)
    this.liste_script.push(
      `<action abscisse="${this.x(B)}" ordonnee="${this.y(B)}" id="${A.id}" mouvement="translation" objet="point" tempo="${tempo}" vitesse="${vitesse}" />`,
    )
  }

  /**
   * Ajoute un label au point { dx, dy, couleur = this.couleurPoint, tempo = this.tempo }
   * @param {PointAbstrait} A
   * @param {string} nom
   * @param {objet} [options] dx pour le déplacement vertical du nom du point, dy pour le déplacemetn horizontal, couleur: this.couleurPoint, tempo: this.tempo
   */
  pointNommer(A: PointAbstrait, nom: string, options: OptionsPoint = {}) {
    // const coordonneesTexte = ''
    const M = pointAbstrait(A.x, A.y)
    if (options.dx) {
      M.x += options.dx
    }
    if (options.dy) {
      M.y += options.dy
    }
    const idNom = this.textePoint(`$${nom}$`, M, options)
    this.nomsDesPoints.set(A, idNom)
    // this.liste_script.push(`<action couleur="${couleur}" nom="${nom}" id="${A.id}" mouvement="nommer" objet="point" tempo="${tempo}" ${coordonneesTexte} />`)
  }

  /** Déplace le nom créé par pointCreer ou pointNommer, sans déplacer le point. */
  pointNomDeplacer(A: PointAbstrait, options: OptionsPoint = {}) {
    const idNom = this.nomsDesPoints.get(A)
    if (idNom === undefined) return
    const position = pointAbstrait(
      A.x + (options.dx ?? 0),
      A.y + (options.dy ?? 0),
    )
    this.texteDeplacer(idNom, position, options)
  }

  /**
   **************************
   ********* COMPAS *********
   **************************
   */

  /**
   * Change l'orientation du compas. Par défaut, elle est vers la droite. L'orientation courante du compas est sauvegardée dans this.compas.orientation
   * @param {objet} [options] Défaut : { tempo: this.tempo}
   */
  compasRetourner(options: OptionsCompas = {}) {
    const tempo = options.tempo ?? this.tempo
    const codeXML = `<action mouvement="retourner" objet="compas" tempo="${tempo}" />`
    if (this.compas.orientation === 'droite') {
      this.compas.orientation = 'gauche'
    } else {
      this.compas.orientation = 'droite'
    }
    this.liste_script.push(codeXML)
  }

  /**
   *
   * @param {number} longueur écartement en cm
   * @param {objet} [options] Défaut : { tempo: this.tempo, vitesse: this.vitesse }
   */
  compasEcarter(l: number, options: OptionsCompas = {}) {
    const tempo = options.tempo ?? this.tempo
    const vitesse = options.vitesse ?? this.vitesse
    const codeXML = `<action ecart="${l * 30}" mouvement="ecarter" objet="compas" tempo="${tempo}" vitesse="${vitesse}" />`
    this.compas.ecartement = l
    this.liste_script.push(codeXML)
  }

  /**
   * Fais apparaitre la règle à l'horizontale, met le compas vertical et écarte le compas le long de la règle pour lire son écartement
   * @param {number} longueur
   * @param {*} options Défaut : { tempo: this.tempo, vitesse: this.vitesse, sens : this.vitesse / 2 }
   */
  compasEcarterAvecRegle(l: number, options: OptionsCompas = {}) {
    this.regleRotation(0, options)
    this.regleMontrer(this.compas.position, options)
    this.regleDeplacer(this.compas.position, options)
    this.compasMontrer(this.compas.position, options)
    this.compasRotation(0, options)
    this.compasEcarter(l, options)
  }

  /**
   *
   * @param {PointAbstrait} A Pointe du compas
   * @param {PointAbstrait} B Mine du compas
   * @param {objet} [options] Défaut : { tempo: this.tempo, vitesse: this.vitesse, sens : this.vitesse / 2 }
   */
  compasEcarter2Points(
    A: PointAbstrait,
    B: PointAbstrait,
    options: OptionsCompas = {},
  ) {
    const s = segment(A, B)
    s.isVisible = false
    const angle = s.angleAvecHorizontale
    this.compasRotationTranslation(angle, A, options)
    this.compasEcarter(longueur(A, B), options)
  }

  /**
   * Remettre le compas en position standard. Son état est sauvegardé dans le booléen this.compas.leve.
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  compasLever(options: OptionsCompas = {}) {
    const tempo = options.tempo ?? this.tempo
    if (!this.compas.leve) {
      // On ne fait rien si le compas est déjà levé
      const codeXML = `<action mouvement="lever" objet="compas" tempo="${tempo} />`
      this.compas.leve = true
      this.liste_script.push(codeXML)
    }
  }

  /**
   * Voir le compas en vue de dessus avant qu'il trace un arc de cercle
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  compasCoucher(options: OptionsCompas = {}) {
    const tempo = options.tempo ?? this.tempo
    if (this.compas.leve) {
      // On ne fait rien si le compas est déjà levé
      const codeXML = `<action mouvement="coucher" objet="compas" tempo="${tempo}" />`
      this.compas.leve = false
      this.liste_script.push(codeXML)
    }
  }

  /**
   * Trace l'arc de centre centre allant de A à B : le plus petit des deux arcs
   * (pour un demi-cercle, celui parcouru de A à B dans le sens trigonométrique).
   * @param centre
   * @param A
   * @param B
   * @param options
   */
  compasTracerArcCentre2extremites(
    centre: PointAbstrait,
    A: PointAbstrait,
    B: PointAbstrait,
    options: OptionsCompas = {},
  ) {
    const compasVisibility = this.compas.visibilite
    if (!compasVisibility) {
      this.compasMontrer()
    }
    /*  this.compasRotationTranslation(
      angleOriente(pointAbstrait(centre.x + 5, centre.y), centre, A),
      centre,
      options,
    )*/
    this.compasEcarter2Points(centre, A, options)
    const { debut, fin } = anglesArcCentre2Extremites(centre, A, B)
    this.compasTracerArc2Angles(debut, fin, options)

    if (options?.positionsRangementInstruments !== undefined) {
      this.rangerInstruments(
        options.positionsRangementInstruments,
        ['rapporteur'],
        {
          tempo: 0,
          vitesse: 20,
        },
      )
    }
    if (!compasVisibility) {
      this.compasMasquer()
    }
  }
  /**
   * Trace un arc de cercle en gardant l'écartement et le centre actuel. L'angle de départ sera choisi pour être le plus proche de l'angle actuel
   * @param {number} angle1
   * @param {number} angle2
   * @param {objet} [options] Défaut : { tempo: this.tempo, sens: this.vitesse / 2, epaisseur: this.epaisseur, couleur: this.couleurCompas, pointilles: this.pointilles }
   * @return {id}
   */
  compasTracerArc2Angles(
    angle1: number,
    angle2: number,
    options: OptionsCompas = {},
  ) {
    const tempo = options.tempo ?? this.tempo
    const sens = options.sens ?? this.vitesse / 2
    const epaisseur = options.epaisseur ?? 0.5
    const couleurCompas = options.couleurCompas ?? this.couleurCompas
    const pointillesTexte = options.pointilles ? 'pointille="tiret"' : ''
    this.idIEP += 1
    if (
      Math.abs(this.compas.angle - angle1) >
      Math.abs(this.compas.angle - angle2)
    ) {
      // On cherche à commencer par le point le plus proche de la position courante du compas
      ;[angle1, angle2] = [angle2, angle1]
    }
    let codeXML = `<action sens="${sens}" angle="${-angle1}" mouvement="rotation" objet="compas" tempo="${tempo}" />\n`
    codeXML += '<action mouvement="lever" objet="compas" />\n'
    codeXML += `<action sens="${sens}" angle="${-angle1}" mouvement="rotation" objet="compas" />\n`
    let sensTexte
    if (angle2 > angle1) {
      sensTexte = sens
    } else {
      sensTexte = -1 * sens
    }
    codeXML += `<action couleur="${couleurCompas}" epaisseur="${epaisseur}" sens="${sensTexte}" debut="${-angle1}" fin="${-angle2}" mouvement="tracer" objet="compas"  ${pointillesTexte} id="${this.idIEP}" />\n`
    codeXML += `<action mouvement="coucher" objet="compas" tempo="${tempo}"/>`
    this.compas.angle = angle2
    this.liste_script.push(codeXML)
    return this.idIEP
  }

  /**
   * Trace un arc de cercle autour d'un point. La longueur de l'arc est déterminée par l'option delta en degré qui est ajoutée de part et d'autre du point
   * @param {PointAbstrait} centre
   * @param {PointAbstrait} point
   * @param {objet} [options] Défaut : { delta: 10, tempo: this.tempo, sens: this.vitesse / 2, epaisseur: this.epaisseur, couleur: this.couleurCompas, pointilles: this.pointilles }
   * @return {id}
   */
  compasTracerArcCentrePoint(
    centre: PointAbstrait,
    point: PointAbstrait,
    options: OptionsCompas = {},
  ) {
    const delta = options.delta ?? 10
    this.compasMontrer(this.compas.position, options)
    this.compasDeplacer(centre, options)
    const s = segment(centre, point)
    s.visibility = false
    const angle1 = s.angleAvecHorizontale - delta
    const angle2 = s.angleAvecHorizontale + delta
    if (
      Math.abs(this.compas.ecartement - longueur(this.compas.position, point)) >
      0.1
    ) {
      this.compasEcarter(longueur(centre, point), options)
    }
    return this.compasTracerArc2Angles(angle1, angle2, options)
  }

  /**
   *
   * @param {PointAbstrait} centre
   * @param {PointAbstrait} point Point de départ du tracé du cercle
   * @param {objet} [options] Défaut : { tempo: this.tempo, sens: this.vitesse / 2, epaisseur: this.epaisseur, couleur: this.couleurCompas, pointilles: this.pointilles }
   */
  compasCercleCentrePoint(
    centre: PointAbstrait,
    point: PointAbstrait,
    options: OptionsCompas = {},
  ) {
    this.compasEcarter2Points(centre, point, options)
    const d = droite(centre, point)
    const angle1 = d.angleAvecHorizontale
    this.compasTracerArc2Angles(angle1, angle1 + 360, options)
  }

  /**
   **************************
   ******** REQUERRE ********
   **************************
   */

  /**
   *
   * @param {number} déplacement en nombre de cm (le déplacement peut être positif ou négatif)
   * @param {*} options Défaut : { tempo: this.tempo, vitesse: this.vitesse }
   */
  requerreGlisserEquerre(deplacement: number, options: OptionsRequerre = {}) {
    const tempo = options.tempo ?? this.tempo
    const vitesse = options.vitesse ?? this.vitesse
    this.liste_script.push(
      `<action abscisse="${deplacement * 30}" mouvement="glisser" objet="requerre" tempo="${tempo}" vitesse="${vitesse}" />`,
    )
  }

  /**
   **************************
   ******* RAPPORTEUR *******
   **************************
   */

  // Non pris en charge par le lecteur JS
  // this.rapporteurCirculaire = function (tempo=this.tempo) {
  // //     this.liste_script.push(`<action mouvement="circulaire" objet="rapporteur" tempo="${tempo}"/>`)
  // }
  // this.rapporteurSemiCirculaire = function (tempo=this.tempo) {
  // //     this.liste_script.push(`<action mouvement="semicirculaire" objet="rapporteur" tempo="${tempo}"/>`)
  // }

  /**
   * Montre ou masque les graduations du rapporteur
   * @param {PointAbstrait} A
   * @param {string} nom
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  // rapporteurGraduations ()

  /**
   * Masque la graduation externe du rapporteur (laisse l'autre graduation visible)
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */

  rapporteurMasquerGraduationsExterieures(options: OptionsRapporteur = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action mouvement="masquer_nombres" objet="rapporteur" tempo="${tempo}"/>`,
    )
  }

  /**
   * Montre la graduation extérieure si elle avait été précédemment cachée
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  rapporteurMontrerGraduationsExterieures(options: OptionsRapporteur = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action mouvement="montrer_nombres" objet="rapporteur" tempo="${tempo}"/>`,
    )
  }

  /**
   * Masque la graduation interne du rapporteur (laisse l'autre graduation visible)
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  rapporteurMasquerGraduationsInterieures(options: OptionsRapporteur = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action mouvement="vide" objet="rapporteur" tempo="${tempo}"/>`,
    )
  }

  /**
   * Montre la graduation interne si elle avait été précédemment cachée
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  rapporteurMontrerGraduationsInterieures(options: OptionsRapporteur = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action mouvement="graduations" objet="rapporteur" tempo="${tempo}"/>`,
    )
  }

  /**
   * Met le rapporteur en position avec le centre en A et le 0 de droite alogné avec le point B
   * @param {PointAbstrait} A
   * @param {PointAbstrait} B
   * @param {objet} [options] Défaut : { tempo: this.tempo, vitesse: this.vitesse, sens : this.vitesse / 2 }
   */
  rapporteurDeplacerRotation2Points(
    A: PointAbstrait,
    B: PointAbstrait,
    options: OptionsRapporteur = {},
  ) {
    const d = droite(A, B)
    d.isVisible = false
    this.rapporteurMontrer(this.rapporteur.position, options)
    this.rapporteurDeplacer(A, options)
    this.rapporteurRotation(d.angleAvecHorizontale, options)
  }

  /**
   * Fais une petite marque (couleur et épaisseur d'un trait de construction) sur une graduation du rapporteur
   * @param {number} angle
   * @param {objet} [options] Défaut : { tempo: this.tempo, vitesse: this.vitesse, couleur: this.couleurTraitsDeConstruction, epaisseur: this.epaisseurTraitsDeConstruction }
   */
  rapporteurCrayonMarqueAngle(angle: number, options: OptionsCrayon = {}) {
    const O = this.rapporteur.position
    const distanceBord = (this.rapporteur.rayon * this.rapporteur.zoom) / 100
    const M = pointAdistance(O, distanceBord, angle + this.rapporteur.angle)
    const N = pointAdistance(
      O,
      distanceBord + 0.3,
      angle + this.rapporteur.angle,
    )
    this.crayonMontrer(this.crayon.position, options)
    this.crayonDeplacer(M, options)
    this.tracer(N, options)
  }

  /**
   * Le crayon va faire une marque sur la graduation du rapporteur, le rapporteur va se cacher et on trace une demi-droite dont on peut choisir la "longueur" (par défaut 90% de celle de la règle)
   * @param {PointAbstrait} A Centre du rapporteur
   * @param {PointAbstrait} B Point avec lequel le 0 de droite sera aligné
   * @param {number} angle
   * @param {objet} [options] { longueur: 0.9 * this.regle.longueur, couleur: this.couleur, tempo: this.tempo, vitesse: this.vitesse, sens : this.vitesse / 2, epaisseur: this.epaisseur, pointilles: this.pointilles }
   */
  rapporteurTracerDemiDroiteAngle(
    A: PointAbstrait,
    B: PointAbstrait,
    angle: number,
    options: OptionsCrayon = {},
  ) {
    const rapporteurVisibilite = this.rapporteur.visibilite
    if (!rapporteurVisibilite) this.rapporteurMontrer()
    if (angle > 0) {
      this.rapporteurDeplacerRotation2Points(A, B, options)
      this.rapporteurCrayonMarqueAngle(angle, options)
    } else {
      const B2 = rotation(B, A, 180)
      this.rapporteurDeplacerRotation2Points(A, B2, options)
      this.rapporteurCrayonMarqueAngle(180 - Math.abs(angle), options)
    }
    const d = droite(A, B)
    d.isVisible = false
    const M = pointAdistance(
      A,
      (this.rapporteur.rayon * this.rapporteur.zoom) / 100,
      d.angleAvecHorizontale + angle,
    )
    if (options?.positionsRangementInstruments !== undefined) {
      this.rangerInstruments(
        options.positionsRangementInstruments,
        ['rapporteur'],
        {
          tempo: 0,
          vitesse: 20,
        },
      )
    }
    if (!rapporteurVisibilite) this.rapporteurMasquer(options)
    this.regleDemiDroiteOriginePoint(A, M, options)
  }

  /**
   **************************
   ********* REGLE **********
   **************************
   */

  /**
   * Masquer les graduations sur la règle
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  regleMasquerGraduations(options: OptionsIep = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action mouvement="vide" objet="regle" tempo="${tempo}"/>`,
    )
  }

  /**
   * Montrer les graduations sur la règle si elles avaient été masquées
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  regleMontrerGraduations(options: OptionsIep = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action mouvement="graduations" objet="regle" tempo="${tempo}"/>`,
    )
  }

  /**
   * Modifie la taille de la règle
   * @param {number} longueur
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  regleModifierLongueur(longueur = 20, options: OptionsIep = {}) {
    const tempo = options.tempo ?? this.tempo
    this.regle.longueur = longueur
    this.liste_script.push(
      `<action mouvement="modifier_longueur" objet="regle" longueur="${this.regle.longueur}" tempo="${tempo}"/>`,
    )
  }

  /**
   * Trace une demi-droite d'origine O passant par A (ou en direction de A si les points sont trop éloignés)
   * @param {PointAbstrait} O Origine
   * @param {PointAbstrait} A Direction
   * @param {objet} [options] Défaut {longueur: this.regle.longueur, tempo : this.tempo, vitesse: this.vitesse, sens: this.vitesse / 2}
   */
  regleDemiDroiteOriginePoint(
    O: PointAbstrait,
    A: PointAbstrait,
    options: OptionsRegle = {},
  ) {
    this.regleDemiDroite(O, A, options)
  }

  /**
   * Trace une demi-droite d'origine O passant par A, ou de direction donnée par un angle avec l'horizontale
   * @param {PointAbstrait} O Origine
   * @param {number|PointAbstrait} direction Point de direction ou angle en degrés
   * @param {objet} [options] Défaut {longueur: this.regle.longueur, tempo : this.tempo, vitesse: this.vitesse, sens: this.vitesse / 2}
   */
  regleDemiDroite(
    O: PointAbstrait,
    direction: number | PointAbstrait,
    options: OptionsRegle = {},
  ) {
    const longueurRegle = options.longueur ?? this.regle.longueur
    const M =
      typeof direction === 'number'
        ? pointAdistance(O, longueurRegle, angleModulo(direction))
        : pointSurSegment(O, direction, longueurRegle)
    this.regleSegment(O, M, options)
  }

  /**
   * Trace une droite passant par les points A et B, ou passant par A avec la pente indiquée
   * @param {PointAbstrait} A
   * @param {number|PointAbstrait} direction Point de direction ou coefficient directeur de la droite
   * @param {objet} [options] Défaut {longueur: this.regle.longueur, tempo : this.tempo, vitesse: this.vitesse, sens: this.vitesse / 2}
   */
  regleDroite(
    A: PointAbstrait,
    direction: number | PointAbstrait,
    options: OptionsRegle = {},
  ) {
    const longueurRegle = options.longueur ?? this.regle.longueur
    const B =
      typeof direction === 'number'
        ? pointAdistance(
            A,
            1,
            Number.isFinite(direction)
              ? (Math.atan(direction) * 180) / Math.PI
              : direction > 0
                ? 90
                : -90,
          )
        : direction
    const M = homothetie(
      B,
      A,
      (-longueurRegle * 0.5 + longueur(A, B) * 0.5) / longueur(A, B),
    )
    const N = homothetie(
      A,
      B,
      (-longueurRegle * 0.5 + longueur(A, B) * 0.5) / longueur(A, B),
    )
    if (this.x(A) <= this.x(B)) {
      this.regleSegment(M, N, options)
    } else {
      this.regleSegment(N, M, options)
    }
  }

  /**
   * Avec la règle, on prolonge le segment de l cm du coté de la 2e extrémité si l est positif sinon du côté de la première extrémité
   * @param {PointAbstrait} A
   * @param {PointAbstrait} B
   * @param {objet} [options] Défaut {longueur: this.regle.longueur - 3, tempo: this.tempo, vitesse: this.vitesse, sens: this.vitesse / 2}
   */
  regleProlongerSegment(
    A: PointAbstrait,
    B: PointAbstrait,
    options: OptionsRegle = {},
  ) {
    const longueur = options.longueur ?? this.regle.longueur - 3
    if (longueur > 0) {
      const B1 = pointSurSegment(B, A, 3)
      const B2 = pointSurSegment(B, A, -longueur)
      this.regleSegment(B1, B2, options)
    } else {
      const A1 = pointSurSegment(A, B, 3)
      const A2 = pointSurSegment(A, B, longueur)
      this.regleSegment(A1, A2, options)
    }
  }

  /**
   **************************
   ********* TRAITS *********
   **************************
   */

  /**
   * Le crayon trace un trait de sa position courante jusqu'au point B
   * @param {PointAbstrait} B
   * @param {objet} [options] Défaut { tempo: this.tempo, vitesse: this.vitesse, epaisseur: this.epaisseur, couleur: this.couleur, pointilles: this.pointilles, vecteur: false }
   * @return {id} id utilisée pour le tracé
   */
  tracer(B: PointAbstrait, options: OptionsCrayon = {}) {
    const tempo = options.tempo ?? this.tempo
    const vitesse = options.vitesse ?? this.vitesse
    const epaisseur = options.epaisseur ?? this.epaisseur
    const couleur = options.couleur ?? this.couleur
    const pointilles = options.pointilles ?? this.pointilles
    const pointillesTexte = pointilles ? 'pointille="tiret"' : ''
    const vecteurTexte = options.vecteur ? 'style="vecteur"' : ''
    this.idIEP += 1
    const codeXML = `<action abscisse="${this.x(B)}" ordonnee="${this.y(B)}" epaisseur="${epaisseur}" couleur="${couleur}" mouvement="tracer" objet="crayon" tempo="${tempo}" vitesse="${vitesse}"  ${pointillesTexte} ${vecteurTexte} id="${this.idIEP}" />`
    this.crayon.position = B
    this.liste_script.push(codeXML)
    return this.idIEP
  }

  /**
   * Trace au crayon le segment [AB]
   * @param {PointAbstrait} A Première extrémité
   * @param {PointAbstrait} B Deuxième extrémité
   * @param {*} options
   * @return {id} id utilisée pour le tracé
   */
  trait(A: PointAbstrait, B: PointAbstrait, options: OptionsCrayon = {}) {
    this.crayonDeplacer(A, options)
    return this.tracer(B, options)
  }

  /**
   * Trace au crayon le segment [AB] sans tempo et avec une vitesse multipliée par 1 000
   * @param {PointAbstrait} A Première extrémité
   * @param {PointAbstrait} B Deuxième extrémité
   * @param {*} options
   * @return {id} id utilisée pour le tracé
   */
  traitRapide(A: PointAbstrait, B: PointAbstrait, options: OptionsCrayon = {}) {
    const tempo = 0
    const vitesse = 10000
    this.crayonDeplacer(A, Object.assign({ tempo, vitesse }, options))
    return this.tracer(B, Object.assign({ tempo, vitesse }, options))
  }

  /**
   * Masque le trait d'id fourni
   * @param {number} id
   * @param {objet} [options] Défaut : { vitesse: 200 }
   */
  traitMasquer(id: number, options: OptionsCrayon = {}) {
    const vitesse = options.vitesse ?? 200
    this.liste_script.push(
      `<action mouvement="masquer" objet="trait" id="${id}" vitesse="${vitesse}" />`,
    )
  }

  /**
   *
   * @param {segment/point} arg1 Segment à tracer ou première extrémité
   * @param {objet/point} arg2 options ou deuxième extrémité
   * @param {objet} [arg3] si les deux premiers arguments étaient des points
   * @returns {id} identifiant utilisé pour le trait
   */
  regleSegment(
    arg1: Segment | PointAbstrait,
    arg2?: OptionsRegle | PointAbstrait,
    arg3?: OptionsRegle,
  ) {
    let A: PointAbstrait, B: PointAbstrait
    let id: number = -1
    let options: OptionsRegle = {}
    if (arg1 instanceof Segment) {
      A = arg1.extremite1
      B = arg1.extremite2
      if (arg2 instanceof PointAbstrait) {
        window.notify(
          "regleSegment appelé avec un mauvais jeu d'arguments (arg1 est un segment mais arg2 est un point)",
          { arg1, arg2, arg3 },
        )
      } else {
        if (typeof arg2 === 'object') {
          options = arg2
        }
      }
    } else {
      if (arg1 instanceof PointAbstrait && arg2 instanceof PointAbstrait) {
        A = arg1
        B = arg2
      } else {
        window.notify(
          "regleSegment appelé avec un mauvais jeu d'arguments (arg1 et arg2 ne sont pas des points)",
          { arg1, arg2, arg3 },
        )
        A = pointAbstrait(0, 0)
        B = pointAbstrait(0, 0)
      }
      if (typeof arg3 === 'object') {
        options = arg3
      }
    }
    const longueurRegle = options.longueur ?? this.regle.longueur
    const longueurSegment = longueur(A, B)
    const regleVisibleInitialement = this.regle.visibilite
    if (longueurSegment > EPSILON_SEGMENT_IEP) {
      const premierPoint = options.zeroSurPremierPoint
        ? A
        : this.premierPointReglePourSegment(A, B)
      const secondPoint = premierPoint === A ? B : A
      const pointDepartRegle = options.zeroSurPremierPoint
        ? A
        : this.pointDepartReglePourSegmentCentre(
            A,
            B,
            longueurRegle,
            premierPoint,
          )
      const angleRegle = droite(premierPoint, secondPoint).angleAvecHorizontale
      if (!regleVisibleInitialement) this.regleMontrer()
      this.regleRotationTranslation(angleRegle, pointDepartRegle, options)
    }
    if (this.crayon != null) {
      if (
        longueur(this.crayon.position, A) < longueur(this.crayon.position, B)
      ) {
        // Le crayon ira au point le plus proche
        this.crayonMontrer(A, options)
        id = this.tracer(B, options)
      } else {
        this.crayonMontrer(B, options)
        id = this.tracer(A, options)
      }
    }
    if (!regleVisibleInitialement) this.regleMasquer()
    return id
  }

  private pointDepartReglePourSegmentCentre(
    A: PointAbstrait,
    B: PointAbstrait,
    longueurRegle: number,
    premierPoint = this.premierPointReglePourSegment(A, B),
  ) {
    const longueurSegment = longueur(A, B)
    const marge = Math.max((longueurRegle - longueurSegment) / 2, 0)
    const secondPoint = premierPoint === A ? B : A
    return pointSurSegment(premierPoint, secondPoint, -marge)
  }

  private premierPointReglePourSegment(A: PointAbstrait, B: PointAbstrait) {
    if (Math.abs(A.x - B.x) < EPSILON_SEGMENT_IEP) {
      return A.y <= B.y ? A : B
    }
    return A.x <= B.x ? A : B
  }

  /**
   * Trace un polygone avec les options par défaut que l'on ne peut pas changer ici
   * @param  {...points} sommets du polygonne séparés par des virgules
   */
  polygoneTracer(...sommets: PointAbstrait[]) {
    const regleVisibleInitialement = this.regle.visibilite
    if (!regleVisibleInitialement) this.regleMontrer()
    for (let i = 0; i < sommets.length - 1; i++) {
      this.regleSegment(sommets[i], sommets[i + 1])
    }
    this.regleSegment(sommets[sommets.length - 1], sommets[0])
    if (!regleVisibleInitialement) this.regleMasquer()
  }

  /**
   * Trace un polygone avec traitRapide()
   * @param  {...points} sommets du polygonne séparés par des virgules
   */
  polygoneRapide(...args: (PointAbstrait | OptionsCrayon)[]) {
    const sommets: PointAbstrait[] = []
    const option: OptionsCrayon = {}
    args.forEach((arg) => {
      if (arg instanceof PointAbstrait) {
        sommets.push(arg)
      } else if (typeof arg === 'object') {
        Object.assign(option, arg)
      } else {
        window.notify("polygoneRapide appelé avec un mauvais jeu d'arguments", {
          arg,
        })
      }
    })
    if (sommets.length > 2) {
      for (let i = 0; i < sommets.length - 1; i++) {
        this.traitRapide(sommets[i], sommets[i + 1], option)
      }
      this.traitRapide(sommets[sommets.length - 1], sommets[0], option)
    } else
      throw Error(
        `Pour utiliser polygoneRapide, il faut passer une liste de points ! et pas ça : ${JSON.stringify(sommets)} `,
      )
  }

  /**
   **************************
   ********* TEXTE **********
   **************************
   */

  /**
   * Ecris un texte collé au point. On peut choisir un fond, un cadre, l'opacité du fond, la police...
   * @param {string} texte
   * @param {PointAbstrait} A
   * @param {objet} [options] Défaut : { tempo: this.tempo, police: false, couleur: this.couleurTexte, couleurFond, opaciteFond, couleurCadre, epaisseurCadre, marge, margeGauche, margeDroite, margeHaut, margeBas }
   * @return {id}
   */
  textePoint(texte: string, A: PointAbstrait, options: OptionsTexte = {}) {
    const tempo = options.tempo ?? this.tempo
    this.idIEP++
    const policeTexte = options.police ? `police="${options.police}"` : ''
    let stringOptions = ''
    if (options.couleurFond) {
      stringOptions += ` couleur_fond="${options.couleurFond}"`
    }
    if (options.opaciteFond) {
      stringOptions += ` opacite_fond="${options.opaciteFond}"`
    }
    if (options.couleurCadre) {
      stringOptions += ` couleur_cadre="${options.couleurCadre}"`
    }
    if (options.epaisseurCadre) {
      stringOptions += ` epaisseur_cadre="${options.epaisseurCadre}"`
    }
    if (options.marge) {
      stringOptions += ` marge="${options.marge}"`
    }
    if (options.margeGauche) {
      stringOptions += ` marge_gauche="${options.margeGauche}"`
    }
    if (options.margeDroite) {
      stringOptions += ` marge_droite="${options.margeDroite}"`
    }
    if (options.margeBas) {
      stringOptions += ` marge_bas="${options.margeBas}"`
    }
    if (options.margeHaut) {
      stringOptions += ` marge_haut="${options.margeHaut}"`
    }
    if (options.taille) {
      stringOptions += ` taille="${options.taille}"`
    }
    let codeXML = `<action abscisse="${this.x(A)}" ordonnee="${this.y(A)}" id="${this.idIEP}" mouvement="creer" objet="texte" />`
    codeXML += `\n<action ${policeTexte} couleur="${options.couleur || this.couleurTexte}" texte="${texte}" id="${this.idIEP}" mouvement="ecrire" objet="texte" ${stringOptions} tempo="${tempo}" />`
    this.liste_script.push(codeXML)
    return this.idIEP
  }

  /**
   * Ecris un texte collé au point de coordonnées (x,y). On peut choisir un fond, un cadre, l'opacité du fond, la police...
   * @param {string} texte
   * @param {number} x Abscisse du coin en haut à gauche
   * @param {number} y Ordonnée du coin en haut à gauche
   * @param {objet} [options] Défaut : { tempo: this.tempo, police: false, couleur: this.couleurTexte, couleurFond, opaciteFond, couleurCadre, epaisseurCadre, marge, margeGauche, margeDroite, margeHaut, margeBas }
   */
  textePosition(
    texte: string,
    x: number,
    y: number,
    options: OptionsTexte = {},
  ) {
    const A = pointAbstrait(x, y)
    return this.textePoint(texte, A, options)
  }

  longueurSegment(
    A: PointAbstrait,
    B: PointAbstrait,
    dy: number,
    options: OptionsTexte = {},
  ) {
    const l = longueur(A, B)
    const v = vecteur(A, B)
    const w = vecteur((-v.y * dy) / norme(v), (v.x * dy) / norme(v))
    const ancrage = translation(
      translation(pointSurSegment(A, B, l / 2 - 0.7), w),
      vecteur(0, 1),
    )
    return this.textePoint(`${l} cm`, ancrage, options)
  }

  mesureAngle(A: PointAbstrait, O: PointAbstrait, B: PointAbstrait) {
    const a = angleOriente(A, O, B)
    const C = translation(
      homothetie(rotation(A, O, a / 2), O, 1.3 / longueur(O, A)),
      vecteur(-0.2, 0.5),
    )
    return this.textePoint(Math.abs(a) + '°', C)
  }

  /**
   * Masque le trait d'id fourni
   * @param {array} id
   * @param {objet} [options] Défaut : { tempo: 0 }
   */
  texteMasquer(...args: (number | OptionsIep)[]) {
    const options: OptionsIep = { tempo: 0 }
    args
      .filter((arg) => !(typeof arg === 'number'))
      .forEach((option) => {
        // On intègre aux options les paramètres des arguments qui ne sont pas des id
        Object.assign(options, option)
      })
    args
      .filter((arg) => typeof arg === 'number')
      .forEach((id) => {
        this.liste_script.push(
          `<action mouvement="masquer" objet="texte" id="${id}" tempo="${options.tempo}" />`,
        )
      })
  }

  /**
   * Change la couleur d'un texte déjà créé dont on donne l'id retourné par this.textePoint ou this.textePosition
   * Nécessité de redonner le texte car on réécrit le texte dans une autre couleur.
   * @param {string} texte
   * @param {number} id
   * @param {string} couleur
   */
  texteChangeCouleur(texte: string, id: number, couleur: string) {
    this.liste_script.push(
      `\n<action couleur="${couleur}" texte="${texte}" id="${id}" mouvement="ecrire" objet="texte" />`,
    )
  }

  /**
   * Met l'animation en pause forçant l'utilisateur à appuyer sur lecture pour voir la suite
   * @param {objet} [options] tempo : délai (dixièmes de seconde) avant que le bouton "continuer" n'apparaisse
   */
  pause(options: OptionsIep = {}) {
    if (options.tempo !== undefined) {
      this.liste_script.push(
        `<action mouvement="pause" tempo="${options.tempo}" />`,
      )
    } else {
      this.liste_script.push('<action mouvement="pause" />')
    }
  }

  /**
   **************************
   ******* CODAGES **********
   **************************
   */

  /**
   *
   * @param {segment/point} Segment à coder ou première extrémité
   * @param {objet/point} options ou deuxième extrémité
   * @param {objet} [options] si les deux premiers arguments étaient des points. Défaut : { tempo: this.tempo, couleur: this.couleurCodage, codage: '//', }
   * @return {id}
   */
  segmentCodage(
    arg1: Segment | PointAbstrait,
    arg2?: OptionsRegle | PointAbstrait,
    arg3?: OptionsRegle,
  ) {
    let s: Segment
    let options: OptionsRegle = {}
    if (arg1 instanceof Segment) {
      s = arg1
      if (arg2 instanceof PointAbstrait) {
        window.notify(
          "segmentCodage appelé avec un mauvais jeu d'arguments (arg1 est un segment mais arg2 est un point",
          { arg1, arg2, arg3 },
        )
      } else {
        if (typeof arg2 === 'object') {
          options = arg2
        }
      }
    } else {
      if (arg1 instanceof PointAbstrait && arg2 instanceof PointAbstrait) {
        s = segment(arg1, arg2)
      } else {
        window.notify(
          "segmentCodage appelé avec un mauvais jeu d'arguments (arg1 et arg2 ne sont pas des points)",
          { arg1, arg2, arg3 },
        )
        s = segment(pointAbstrait(0, 0), pointAbstrait(0, 0))
      }
      if (typeof arg3 === 'object') {
        options = arg3
      }
    }
    const tempo = options.tempo ?? this.tempo
    const couleur =
      options.couleurCodage ?? options.couleur ?? this.couleurCodage
    const codage = options.codage ?? '\\'
    this.idIEP++
    const id = this.idIEP
    const M = milieu(s.extremite1, s.extremite2)
    const codeXML = `<action abscisse="${this.x(M)}" ordonnee="${this.y(M)}" forme="${codage}"  couleur="${couleur}" id="${id}" tempo="${tempo}" mouvement="creer" objet="longueur" />`
    this.liste_script.push(codeXML)
    return id
  }

  /**
   *
   * @param {number} id Identifiant du codage
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  segmentCodageMasquer(id: number, options: OptionsIep = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action id="${id}" mouvement="masquer" objet="longueur" tempo="${tempo}" />`,
    )
  }

  /**
   *
   * @param {number} id Identifiant du codage
   * @param {objet} [options] Défaut : { tempo: this.tempo }
   */
  segmentCodageMontrer(id: number, options: OptionsIep = {}) {
    const tempo = options.tempo ?? this.tempo
    this.liste_script.push(
      `<action id="${id}" mouvement="montrer" objet="longueur" tempo="${tempo}" />`,
    )
  }

  /**
   * Trace le petit carré au crayon
   * @param {PointAbstrait} A Point sur un côté de l'angle
   * @param {PointAbstrait} B Sommet de l'angle
   * @param {PointAbstrait} C Point sur un côté de l'angle
   * @param {objet} [options] Défaut : {longueur : 0.3, couleur: this.couleurCodage}
   * @return {array} [idTrait1, idTrait2]
   */
  codageAngleDroit(
    A: PointAbstrait,
    B: PointAbstrait,
    C: PointAbstrait,
    options: OptionsRegle = {},
  ) {
    const longueur = options.longueur ?? 0.3
    const couleur =
      options.couleurCodage ?? options.couleur ?? this.couleurCodage
    this.crayonMontrer()
    const C1 = pointSurSegment(B, C, longueur)
    const A1 = pointSurSegment(B, A, longueur)
    const M = translation2Points(A1, B, C1)
    const options1 = { ...options } // On recopie options pour pouvoir en changer le tempo du premier tracé
    options1.tempo = 0
    const trait1 = this.trait(C1, M, Object.assign({}, options1, { couleur }))
    const trait2 = this.trait(M, A1, Object.assign({}, options, { couleur }))
    return [trait1, trait2]
  }

  /**
   * Masque le codage d'un angle droit
   * @param {number} id Identifiant du codage d'un angle droit
   * @param {objet} [options] Défaut { tempo: 0 }
   */
  codageAngleDroitMasquer(id: [number, number], options: OptionsIep = {}) {
    const tempo = options.tempo ?? 0
    this.traitMasquer(id[0], Object.assign({ tempo }, options))
    this.traitMasquer(id[1], Object.assign({ tempo }, options))
  }

  /**
   * Code un angle. L'option codage peut être "simple", "/", "//", "///", "O"
   * "double", "double/", "double//", "double///", "doubleO"
   * "triple", "triple/", "triple//", "triple///", "tripleO"
   * "plein", "plein/", "plein//", "plein///", "pleinO"
   * @param {PointAbstrait} A Point sur un côté de l'angle
   * @param {PointAbstrait} B Sommet de l'angle
   * @param {PointAbstrait} C Point sur un côté de l'angle
   * @param {objet} [options] Défaut : { rayon : 1, couleur: this.couleurCodage, codage: 'plein'}
   * @return {id} L'identifiant correspond à l'identifiant des 3 points de l'angle séparés par _
   */
  angleCodage(
    B: PointAbstrait,
    A: PointAbstrait,
    C: PointAbstrait,
    options: OptionsCompas = {},
  ) {
    const couleur =
      options.couleurCodage ?? options.couleur ?? this.couleurCodage
    const codage = options.codage ?? 'plein'
    const rayon = options.rayon ?? 1
    const tempo = options.tempo ?? this.tempo
    const id = B.id + '_' + A.id + '_' + C.id
    const d1 = droite(A, B)
    const d2 = droite(A, C)
    d1.isVisible = false
    d2.isVisible = false
    const angle1 = -d1.angleAvecHorizontale
    const angle2 = -d2.angleAvecHorizontale
    const codeXML = `<action abscisse="${this.x(A)}" ordonnee="${this.y(A)}" rayon="${rayon * 30}" angle1="${angle1}" angle2="${angle2}" forme="${codage}"  couleur="${couleur}" id="${id}" tempo="${tempo}" mouvement="creer" objet="angle" />`
    this.liste_script.push(codeXML)
    return id
  }

  /**
   * Masque un codage préalablement créé
   * @param {PointAbstrait} A
   * @param {PointAbstrait} B
   * @param {PointAbstrait} C
   * @param {objet} [options] Défaut { tempo: 0 }
   */
  angleCodageMasquer(
    B: PointAbstrait,
    A: PointAbstrait,
    C: PointAbstrait,
    options: OptionsIep = {},
  ) {
    const tempo = options.tempo ?? 0
    const id = B.id + '_' + A.id + '_' + C.id
    this.liste_script.push(
      `<action id="${id}" mouvement="masquer" objet="angle" tempo="${tempo}" />`,
    )
  }

  /**
   * Montre un codage préalablement créé
   * @param {PointAbstrait} A
   * @param {PointAbstrait} B
   * @param {PointAbstrait} C
   * @param {objet} [options] Défaut { tempo: 0 }
   */
  angleCodageMontrer(
    B: PointAbstrait,
    A: PointAbstrait,
    C: PointAbstrait,
    options: OptionsIep = {},
  ) {
    const tempo = options.tempo ?? 0
    const id = B.id + '_' + A.id + '_' + C.id
    this.liste_script.push(
      `<action id="${id}" mouvement="montrer" objet="angle" tempo="${tempo}" />`,
    )
  }

  /**
   * Affiche une image (donnée par son URL) au point A
   * @param {string} url
   * @returns {id}
   */
  image(url: string, A = pointAbstrait(0, 0)) {
    this.idIEP++
    let codeXML
    codeXML = `<action id="${this.idIEP}" url="${url}" mouvement="chargement" objet="image" />`
    codeXML += `\n<action abscisse="${this.x(A)}" ordonnee="${this.y(A)}" id="${this.idIEP}" mouvement="translation" objet="image" vitesse="100000" />`
    this.liste_script.push(codeXML)
    return this.idIEP
  }
}
