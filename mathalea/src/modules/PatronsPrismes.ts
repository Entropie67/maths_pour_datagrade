import { barycentre, polygone, Polygone } from '../lib/2d/polygones'
import {
  choice,
  combinaisonListes,
  enleveElement,
} from '../lib/outils/arrayOutils'
import { randint } from '../modules/outils'

import { codageSegment } from '../lib/2d/CodageSegment'
import { fixeBordures } from '../lib/2d/fixeBordures'
import type { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from '../lib/2d/PointAbstrait'
import { Segment, segment } from '../lib/2d/segmentsVecteurs'
import { latex2d, type Latex2d } from '../lib/2d/textes'
import { translation } from '../lib/2d/transformations'
import { longueur } from '../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../lib/2d/utilitairesPoint'
import { vecteur } from '../lib/2d/Vecteur'
import { mathalea2d } from '../modules/mathalea2d'

/**
 * Bibliotheque de base
 * classe FacePrisme : arbre qui permet de definir un prisme (formes et faces)
 * classe Arete : arete d'un prisme
 * fonctions de construction de patron "enT, enS et au hasard"
 * fonctions utilitaires (modulo360 et modulo (en général) et detections d'angles saillant)
 * @author Olivier Mimeau
 */

const zoom = 0.4 // scale: 0.4

type ListeDesBases = {
  description: string
  nomCourt: string
  nbSommet: number
  listeCotes: number[]
  listeAngles: number[]
}[]

export type AreteDuPatron = {
  face: FacePrisme
  numArete: number
}

export const listeDeBases: ListeDesBases = [
  {
    description: 'Triangle quelconque',
    nomCourt: 'Triangle1',
    nbSommet: 3,
    listeCotes: [2, 3],
    listeAngles: [60],
  },
  {
    description: 'Triangle rectangle',
    nomCourt: 'TriangleRect',
    nbSommet: 3,
    listeCotes: [3, 4],
    listeAngles: [90],
  },
  {
    description: 'parallelogramme',
    nomCourt: 'Parallelogramme',
    nbSommet: 4,
    listeCotes: [5, 3, 5],
    listeAngles: [120, 60],
  },
  {
    description: 'Trapèze',
    nomCourt: 'Trapèze',
    nbSommet: 4,
    listeCotes: [5, 3, 4],
    listeAngles: [90, 90],
  },
  {
    description: 'Quadrilatere quelconque',
    nomCourt: 'Quadrilatere',
    nbSommet: 4,
    listeCotes: [4, 3, 5],
    listeAngles: [120, 50],
  },
  {
    description: 'Quadrilatere un angle rentrant',
    nomCourt: 'QuadConcave',
    nbSommet: 4,
    listeCotes: [5, 3, 3],
    listeAngles: [25, 250],
  },
  {
    description: 'Pentagone',
    nomCourt: 'Pentagone',
    nbSommet: 5,
    listeCotes: [2, 3, 3, 2],
    listeAngles: [120, 70, 140],
  },
  {
    description: 'Pentagone-Maison',
    nomCourt: 'PentagoneMaison',
    nbSommet: 5,
    listeCotes: [4, 3, 4, 2],
    listeAngles: [90, 90, 135],
  },
  {
    description: 'Hexagone regulier',
    nomCourt: 'HexaRegulier',
    nbSommet: 6,
    listeCotes: [2.5, 2.5, 2.5, 2.5, 2.5],
    listeAngles: [120, 120, 120, 120, 120],
  },
  {
    description: 'Hexagone',
    nomCourt: 'Hexagone',
    nbSommet: 6,
    listeCotes: [2, 3, 3.5, 2.5, 3],
    listeAngles: [120, 120, 140, 120, 100],
  },
  {
    description: 'Hexagone un angle rentrant',
    nomCourt: 'HexaConcave',
    nbSommet: 6,
    listeCotes: [4, 2, 2, 2, 2],
    listeAngles: [90, 90, 270, 90],
  },
  {
    description: 'Hexagone deux angles rentrants',
    nomCourt: 'HexaConcave2',
    nbSommet: 6,
    listeCotes: [4, 2, 2, 5, 2],
    listeAngles: [45, 270, 45, 45],
  },
]

export class Arete {
  numero: number = 0 //ce ne sont pas des numero absolus mais des indices dans le tableau des aretes de la face
  longueur: number = 0
  autreFace: FacePrisme
  autreArete: number
  connectee: boolean = false
  constructor(
    num: number,
    long: number,
    faceConnexion: FacePrisme,
    autreArete: number,
    connectee: boolean,
  ) {
    this.numero = num
    this.longueur = long
    this.autreFace = faceConnexion
    this.autreArete = autreArete
    this.connectee = connectee
  }

  setFaceConnectee(faceConnexion: FacePrisme, autreArete: number): void {
    this.autreFace = faceConnexion
    this.autreArete = autreArete
    this.connectee = true
  }

  setFaceConnectable(faceConnexion: FacePrisme, autreArete: number): void {
    this.autreFace = faceConnexion
    this.autreArete = autreArete
    this.connectee = false
  }

  copieArete(): Arete {
    return new Arete(
      this.numero,
      this.longueur,
      this.autreFace,
      this.autreArete,
      this.connectee,
    )
  }
}

/*
 * base1 doit etre definie dans le sens horaire
 */
export class FacePrisme {
  private _numFace: number
  private _aretes: Arete[] = []
  private _anglesCotes: number[] = []
  private _sommets: PointAbstrait[] = []
  private _dessin: Polygone
  private _isBase: boolean = true
  constructor(
    numeroFace: number,
    nombresdeCotes: number,
    longueurCotes: number[],
    anglesCotes: number[],
    base: boolean,
    pointDepart: PointAbstrait = pointAbstrait(0, 0),
    angleDepart: number = 0,
  ) {
    this._numFace = numeroFace
    for (let j = 0; j < nombresdeCotes - 1; j++) {
      this._aretes[j] = new Arete(j, longueurCotes[j], this, -1, false) // faceConnectee et autreArete à remplir plus tard
    }
    this._sommets[0] = pointDepart
    let sommeAngles = modulo360(angleDepart)
    this._sommets[1] = pointAdistance(
      this._sommets[0],
      longueurCotes[0],
      sommeAngles,
    )
    this._anglesCotes[0] = sommeAngles
    for (let j = 0; j < nombresdeCotes - 2; j++) {
      sommeAngles += 180 - anglesCotes[j]
      this._anglesCotes[j + 1] = modulo360(sommeAngles)
      this._sommets[j + 2] = pointAdistance(
        this._sommets[j + 1],
        longueurCotes[j + 1],
        sommeAngles,
      )
    }

    const s = segment(this._sommets[nombresdeCotes - 1], this._sommets[0])
    this._anglesCotes[nombresdeCotes - 1] = modulo360(s.angleAvecHorizontale)
    this._aretes[nombresdeCotes - 1] = new Arete(
      nombresdeCotes - 1,
      longueur(this._sommets[0], this._sommets[nombresdeCotes - 1]),
      this,
      -1,
      false,
    )
    this._isBase = base
    this._dessin = polygone(this._sommets)
  } // fin constructor

  get dessin(): Polygone {
    return this._dessin
  }

  get sommets(): PointAbstrait[] {
    return this._sommets
  }

  sommeti(i: number): PointAbstrait {
    return this._sommets[modulo(i, this._sommets.length)]
  }

  get aretes(): Arete[] {
    return this._aretes
  }

  get anglesCotes(): number[] {
    return this._anglesCotes
  }

  anglesCotei(i: number): number {
    return this._anglesCotes[modulo(i, this._anglesCotes.length)]
  }

  aretesi(i: number): Arete {
    return this._aretes[modulo(i, this._aretes.length)]
  }

  get base(): boolean {
    return this._isBase
  }

  get numFace(): number {
    return this._numFace
  }

  ajouteFaceConnectee(
    numArete: number,
    face: FacePrisme,
    autreArete: number,
  ): void {
    // a faire : verifie si le numero d'arete de l'autre face existe
    this._aretes[numArete].setFaceConnectee(face, autreArete)
  }

  ajouteFaceConnectable(
    numArete: number,
    face: FacePrisme,
    autreArete: number,
  ): void {
    this._aretes[numArete].setFaceConnectable(face, autreArete)
  }

  listerConnections(): string {
    let resultat = `=== Face ${this._numFace} (Base: ${this._isBase}) ===<br>`

    // Ajouter les faces connectées
    resultat += '<br>--- Faces connectées ---<br>'
    this._aretes.forEach((connection) => {
      if (connection.autreFace) {
        resultat += `Arête ${connection.numero} :`
        if (connection.autreFace.numFace === this._numFace) {
          resultat += `Non définie<br>`
        } else {
          resultat += connection.connectee ? ` Connectée ` : ` Connectable `
          resultat += `à la face ${connection.autreFace.numFace}(Base: ${connection.autreFace.base})<br>`
        }
      } else {
        resultat += `Arête ${connection.numero} : Aucune face connectée.<br>`
      }
    })
    return resultat
  }

  parcoursCompletNonRedondant(): string {
    const facesVisitees: Set<number> = new Set() // Stocke les numéros de faces déjà visitées
    let resultat: string = ''

    // Fonction récursive pour le parcours en profondeur (DFS)
    const parcourir = (face: FacePrisme, niveau: number = 0) => {
      if (facesVisitees.has(face.numFace)) {
        return // Évite les redondances
      }
      facesVisitees.add(face.numFace)
      // Ajoute la face actuelle au résultat
      const indent = '  '.repeat(niveau)
      resultat += `${indent}Face ${face.numFace} (Base: ${face.base})<br>`
      resultat += face.listerConnections() + `<br>`
      // Parcourt les faces connectées
      face._aretes.forEach((connection) => {
        if (connection.autreFace) {
          parcourir(connection.autreFace, niveau + 1)
        }
      })
    }

    // Lancer le parcours à partir de cette face
    parcourir(this)

    return resultat
  }

  trouverFaceParNumero(numFaceRecherche: number): FacePrisme | null {
    const facesVisitees: Set<number> = new Set()

    const parcourir = (face: FacePrisme): FacePrisme | null => {
      if (facesVisitees.has(face.numFace)) {
        return null
      }
      facesVisitees.add(face.numFace)
      if (face.numFace === numFaceRecherche) {
        return face
      }
      // Parcourt les faces connectées
      for (const connection of face._aretes) {
        if (connection.autreFace) {
          const resultat = parcourir(connection.autreFace)
          if (resultat) {
            return resultat
          }
        }
      }

      return null
    }

    return parcourir(this)
  }

  static listerFacesLateralesDirectementConnecteesOuConnectables(
    faceBase: FacePrisme,
  ): number[] {
    const facesLaterales: number[] = []
    const listeAretesDispo = faceBase.trouveAretesdisponibles(true)
    // Parcourt les faces connectées directement à la base
    faceBase._aretes.forEach((connection) => {
      if (
        connection.autreFace &&
        !connection.autreFace.base &&
        listeAretesDispo.indexOf(connection.numero) > -1
      ) {
        facesLaterales.push(connection.autreFace.numFace)
      }
    })
    return facesLaterales
  }

  faceConnecteei(numArete: number): FacePrisme | null {
    const connection = this._aretes.find((conn) => conn.numero === numArete)
    if (
      connection &&
      connection.autreFace &&
      connection.autreFace._numFace !== this._numFace
    ) {
      return connection.autreFace
    } else {
      return null
    }
  }

  faceConnectablei(numArete: number): FacePrisme | null {
    const connection = this._aretes.find((conn) => conn.numero === numArete)
    if (
      connection &&
      connection.autreFace &&
      connection.autreFace._numFace !== this._numFace
    ) {
      return connection.autreFace
    } else {
      return null
    }
  }

  /**
   * Retourne la liste des indices des aretes de cette face qui ne sont pas encore reliées à une autre face.
   * @returns Un tableau d'indices d'aretes disponibles.
   */
  listerIndicesAretesDisponibles(): number[] {
    const aretesDisponibles: number[] = []

    // Parcourir les aretes connectées
    this._aretes.forEach((connection) => {
      if (
        !connection.autreFace ||
        connection.autreFace.numFace === this._numFace
      ) {
        aretesDisponibles.push(connection.numero)
      }
    })
    // Parcourir les aretes connectables
    /*  this._facesConnectables.forEach((connection) => {
      if (!connection.face || connection.face.numFace === this._numFace) {
        // Vérifier si l'arete n'est pas déjà dans la liste (pour éviter les doublons)
        if (!aretesDisponibles.includes(connection.arete)) {
          aretesDisponibles.push(connection.arete)
        }
      }
    }) */

    return aretesDisponibles
  }

  creerFaceLateraleSurBase(
    NumFace: number,
    base1: boolean,
    numCoteBase: number,
    hauteurPrisme: number,
  ): FacePrisme {
    // Implémentation pour créer une face latérale connectée à une base à partir d'un numéro d'arête et d'un numéro de face
    let maface: FacePrisme = new FacePrisme(-1, 4, [1, 1, 1], [90, 90], false) // valeurs temporaires
    let pointDecale = pointAdistance(
      this.sommeti(numCoteBase),
      hauteurPrisme,
      this.anglesCotei(numCoteBase) - 90,
    )
    if (!base1) {
      pointDecale = this.sommeti(numCoteBase)
    }
    if (this.base) {
      maface = new FacePrisme(
        NumFace,
        4,
        [
          this.aretesi(numCoteBase).longueur,
          hauteurPrisme,
          this.aretesi(numCoteBase).longueur,
        ],
        [90, 90],
        false,
        pointDecale,
        this.anglesCotei(numCoteBase), // this.anglesCotes[numCoteBase],
      )
    } else {
      console.warn(
        `La face ${this._numFace} n'est pas une base. Impossible de créer une face latérale à partir d'une arête.`,
      )
    }
    // ajouter les connexions entre la face latérale créée et la base
    maface.ajouteFaceConnectee(base1 ? 2 : 0, this, numCoteBase)
    this.ajouteFaceConnectee(numCoteBase, maface, base1 ? 2 : 0)
    // inutile de chercher si l'autre base existe déjà pour la connecter

    // On gère les connexions (faces connectables) avec les autres faces latérales qui serait connectées sur les arrêtes adjacentes de la base
    let autreFace: FacePrisme | null = null
    for (let i = -1; i <= 1; i += 2) {
      if (this.aretesi(numCoteBase + i).autreArete !== -1) {
        autreFace = this.aretesi(numCoteBase + i).autreFace
        if (autreFace) {
          maface.ajouteFaceConnectable(2 - i, autreFace, 2 + i) // (3, autreFace, 1)
          autreFace.ajouteFaceConnectable(2 + i, maface, 2 - i) // (1, maface, 3)
        }
      }
    }

    // Gérer les connexions (faces connectables) avec la deuxieme base si nécessaire
    // numCoteBase : car parallèle à base de départ
    const lesBases = this.trouverDeuxiemeBase()
    if (lesBases) {
      autreFace = lesBases[0]
      if (autreFace) {
        maface.ajouteFaceConnectable(base1 ? 0 : 2, autreFace, numCoteBase)
        autreFace.ajouteFaceConnectable(numCoteBase, maface, base1 ? 0 : 2)
      }
    }

    return maface
  }

  creerFaceLateraleSurFaceLaterale(
    NumFace: number,
    numCote: number, // de this à partir duquel on construit la face latérale
    hauteurPrisme: number,
  ): FacePrisme {
    // Implémentation pour créer une face latérale connectée à une base à partir d'un numéro d'arête et d'un numéro de face
    const numCoteConstruit = modulo(numCote + 2, 4) // le numéro du coté de la face latérale qui sera construit (côté parallèle à la base)
    let maface: FacePrisme = new FacePrisme(-1, 4, [1, 1, 1], [90, 90], false) // valeurs temporaires
    if (!this.base) {
      if (numCote === 3 || numCote === 1) {
        const plusMoins1 = numCote === 3 ? -1 : 1
        // l'arete 2 de this est connecté à la base il faut la longeur de la bonne arete de la base
        const largeurFaceLaterale = this.aretesi(2).autreFace.aretesi(
          this.aretesi(2).autreArete + plusMoins1,
        ).longueur
        let pointDecale = this.sommeti(1)
        if (numCote === 3) {
          pointDecale = pointAdistance(
            this.sommeti(0),
            largeurFaceLaterale,
            this.anglesCotei(0) + 180,
          )
        }
        maface = new FacePrisme(
          NumFace,
          4,
          [largeurFaceLaterale, hauteurPrisme, largeurFaceLaterale],
          [90, 90],
          false,
          pointDecale,
          this.anglesCotei(0), // this.anglesCotes[numCoteBase],
        )

        // ajouter les connexions entre la face latérale créée et la face actuelle (this)
        maface.ajouteFaceConnectee(numCoteConstruit, this, numCote)
        this.ajouteFaceConnectee(numCote, maface, numCoteConstruit)

        // gerer avec la base (les bases) si elle existe deja ou pas
        // si this.aretesi(2).autreFace.base
        let num: number = 0
        for (let i = 0; i < 4; i++) {
          if (this.aretesi(i).autreFace.base) {
            const num = this.aretesi(i).autreFace.aretesi(
              this.aretesi(i).autreArete + plusMoins1,
            ).numero
            maface.ajouteFaceConnectable(i, this.aretesi(i).autreFace, num)
            this.aretesi(i).autreFace.ajouteFaceConnectable(num, maface, i)
          }
        }

        // dsdsq
        num = this.aretesi(2).autreFace.aretesi(
          this.aretesi(2).autreArete + 2 * plusMoins1,
        ).autreFace.numFace
        if (num !== this.aretesi(2).autreFace._numFace) {
          const tface = this.aretesi(2).autreFace.aretesi(
            this.aretesi(2).autreArete + 2 * plusMoins1,
          ).autreFace
          const autreNumCote = numCote === 3 ? 1 : 3
          maface.ajouteFaceConnectable(numCote, tface, autreNumCote)
          tface.ajouteFaceConnectable(autreNumCote, maface, numCote)
        }
      } else {
        console.warn(
          `La face ${this._numFace} n'est pas une base. Impossible de créer une face latérale à partir d'une arête.`,
        )
      }
    }
    return maface
  }

  creer2emeBaseSurFaceLaterale(
    NumFace: number,
    base1: FacePrisme,
    //  numCoteBase: number, /// sert a quoi ?)
  ): FacePrisme {
    // Implémentation pour créer une face latérale connectée à une base à partir d'un numéro d'arête et d'un numéro de face
    const maface: FacePrisme = new FacePrisme(NumFace, 3, [1, 1], [90], true)
    const angleDepart = this.anglesCotei(2)
    const numCoteBase = this.aretesi(2).autreArete
    const angleDepart2 = this.aretesi(2).autreFace.anglesCotei(numCoteBase)
    const angleDecale = modulo360(angleDepart2 + angleDepart + 180)
    const longueursCotes = []
    const anglesCotes = []
    const aretes = []
    for (let i = 0; i < base1.aretes.length; i++) {
      longueursCotes.push(base1.aretes[i].longueur)
      anglesCotes.push(modulo360(-base1.anglesCotes[i] + angleDecale))
      const newArete = base1.aretes[i].copieArete()

      if (newArete.autreFace === base1) {
        newArete.autreFace = maface
      }

      aretes.push(newArete)
    }

    maface._anglesCotes = anglesCotes
    maface._aretes = aretes
    // calcul points

    maface._sommets[0] = this._sommets[0]
    for (let i = 1; i < aretes.length; i++) {
      maface._sommets[i] = pointAdistance(
        maface._sommets[i - 1],
        maface._aretes[i - 1].longueur,
        maface._anglesCotes[i - 1],
      )
    }
    // calage points
    if (numCoteBase !== 0) {
      const vecteurDecale = vecteur(
        maface._sommets[numCoteBase],
        maface._sommets[0],
      )
      for (let i = 0; i < maface._sommets.length; i++) {
        maface._sommets[i] = translation(maface._sommets[i], vecteurDecale)
      }
    }
    // ajouter les connexions entre la face latérale créée et la base
    maface.ajouteFaceConnectee(numCoteBase, this, 0)
    this.ajouteFaceConnectee(0, maface, numCoteBase)

    for (let i = 0; i < maface.aretes.length; i++) {
      const tmpFace = maface._aretes[i].autreFace
      if (i !== numCoteBase && tmpFace !== maface) {
        maface.ajouteFaceConnectable(i, tmpFace, 0)
        tmpFace.ajouteFaceConnectable(0, maface, i)
      }
    }
    maface._dessin = polygone(maface._sommets)
    return maface
  }

  trouverDeuxiemeBase(): FacePrisme[] {
    const lesBases: FacePrisme[] = []
    const facesVisitees: Set<number> = new Set<number>()

    // Fonction récursive pour parcourir les faces connectées et connectables
    const parcourir = (face: FacePrisme) => {
      if (facesVisitees.has(face.numFace)) {
        return // Pas besoin de retourner un tableau ici
      }
      facesVisitees.add(face.numFace)
      if (face.base && face.numFace !== this._numFace) {
        lesBases.push(face)
      }
      face._aretes.forEach((connection) => {
        if (connection.autreFace) {
          parcourir(connection.autreFace)
        }
      })
    }
    // Lancer le parcours à partir de cette face
    parcourir(this)

    return lesBases
  }

  parcoursFacesLaterales(): FacePrisme[] {
    const facesVisitees: Set<number> = new Set<number>()
    const facesLaterales: FacePrisme[] = []
    const parcourir = (face: FacePrisme) => {
      if (!facesVisitees.has(face.numFace)) {
        facesVisitees.add(face.numFace)
        if (!face.base) {
          facesLaterales.push(face)
        }
        face._aretes.forEach((connection) => {
          if (connection.autreFace) {
            parcourir(connection.autreFace)
          }
        })
      }
    }
    parcourir(this)
    return facesLaterales
  }

  trouveAreteslateralesDisponiblesPourFaceLaterale(
    sens: number = 0,
  ): AreteDuPatron[] {
    const resultat: AreteDuPatron[] = []
    if (sens === 0 || sens === 1) {
      if (this.aretesi(1).autreFace === this) {
        resultat.push({ face: this, numArete: 1 })
      } else if (this.aretesi(1).autreFace && this.aretesi(1).connectee) {
        resultat.push(
          ...this.aretesi(
            1,
          ).autreFace.trouveAreteslateralesDisponiblesPourFaceLaterale(1),
        )
      }
    }
    if (sens === 0 || sens === 3) {
      if (this.aretesi(3).autreFace === this) {
        resultat.push({ face: this, numArete: 3 })
      } else if (this.aretesi(3).autreFace && this.aretesi(3).connectee) {
        resultat.push(
          ...this.aretesi(
            3,
          ).autreFace.trouveAreteslateralesDisponiblesPourFaceLaterale(3),
        )
      }
    }
    return resultat
  }

  /*
   * base1 : la definition des angles saillant depend du sens : anti horaire pour base1 et horaire pour base 2
   * facesExistantes = true : renvoie la liste des aretes ou des faces sont déja crée
   * facesExistantes = false : renvoie la liste des aretes ou on peut creer une faces latérales (angles saillants)
   */
  trouveAretesdisponibles(
    base1: boolean,
    facesExistantes: boolean = false,
  ): number[] {
    const resultat: number[] = []
    for (let i = 0; i < this.aretes.length; i++) {
      const laFaceiDoitExister =
        facesExistantes && this.aretesi(i).autreFace !== this
      const regardeLAretei = facesExistantes
        ? laFaceiDoitExister
        : this.aretesi(i).autreFace === this
      if (regardeLAretei) {
        let saillant = true
        if (base1) {
          saillant =
            angleSaillantBase1(this.anglesCotei(i), this.anglesCotei(i - 1)) &&
            angleSaillantBase1(this.anglesCotei(i + 1), this.anglesCotei(i))
        } else {
          saillant =
            angleSaillantBase2(this.anglesCotei(i), this.anglesCotei(i - 1)) &&
            angleSaillantBase2(this.anglesCotei(i + 1), this.anglesCotei(i))
        }

        if (saillant) {
          resultat.push(i)
        } // resultat.push(i)
      }
    }
    return resultat
  }

  trouveToutesAreteslateralesDisponibles(sens: number = 0): AreteDuPatron[] {
    // Parcours l'objet pourlister parcoursles faces laterales
    const listeFaceslaterales = this.parcoursFacesLaterales()
    // effectue la liste des aretes latterales dispo dans cette liste
    const resultat: { face: FacePrisme; numArete: number }[] = []
    listeFaceslaterales.forEach((lface) => {
      for (let i = 1; i < 4; i += 2) {
        if (lface.aretesi(i).autreFace.numFace === lface.numFace) {
          resultat.push({ face: lface, numArete: i })
        }
      }
    })
    return resultat
  }

  trouveToutesAretesSurBordDeLongueur(long: number = 0): AreteDuPatron[] {
    /*       longueur: number = 0
  autreFace: FacePrisme
  autreArete: number
  connectee: boolean = false */
    // Parcours l'objet pourlister parcoursles faces laterales
    /*     const listeFaceslaterales = this.parcoursFacesLaterales()
    // effectue la liste des aretes latterales dispo dans cette liste
    const resultat: { face: FacePrisme; numArete: number }[] = []
    listeFaceslaterales.forEach((lface) => {
      for (let i = 1; i < 4; i += 2) {
        if (
          !lface.aretesi(i).connectee &&
          lface.aretesi(i).longueur === long
        ) {
          resultat.push({ face: lface, numArete: i })
        }
      }
    })
 */
    const resultat: AreteDuPatron[] = []
    const facesVisitees: Set<number> = new Set() // Stocke les numéros de faces déjà visitées

    // Fonction récursive pour le parcours en profondeur (DFS)
    const parcourir = (face: FacePrisme, niveau: number = 0) => {
      if (facesVisitees.has(face.numFace)) {
        return // Évite les redondances
      }
      facesVisitees.add(face.numFace)
      // regarde les aretes de la face
      face._aretes.forEach((connection) => {
        if (!connection.connectee && connection.longueur === long) {
          resultat.push({ face: face, numArete: connection.numero })
        }
      })

      // Parcourt les faces connectées
      face._aretes.forEach((connection) => {
        if (connection.autreFace) {
          parcourir(connection.autreFace, niveau + 1)
        }
      })
    }

    // Lancer le parcours à partir de cette face
    parcourir(this)

    return resultat

    return resultat
  }

  creerSegment(num: number, couleur: string = 'red'): Segment {
    return segment(this.sommeti(num), this.sommeti(num + 1), couleur, '->')
  }

  afficheNumeroFace(): Latex2d {
    const coord = barycentre(this.dessin)
    return latex2d(`${this._numFace}`, coord.x, coord.y, {})
  }

  dessinerFace(
    Numero: boolean,
    premiersSegments: 'sans' | 'seg0' | 'seg0seg1',
  ): ObjetMathalea2D[] {
    const reponse: ObjetMathalea2D[] = []
    reponse.push(this.dessin)
    if (premiersSegments !== 'sans') {
      reponse.push(this.creerSegment(0))
      if (premiersSegments === 'seg0seg1') {
        reponse.push(this.creerSegment(1, 'blue'))
      }
    }
    if (Numero) {
      reponse.push(this.afficheNumeroFace())
    }
    return reponse
  }

  codageCotes(): ObjetMathalea2D[] {
    const facesVisitees: Set<number> = new Set() // Stocke les numéros de faces déjà visitées
    const aretesVisitees: string[] = [] // Stocke les numéros d'arêtes déjà visitées
    const lesLongueurs: number[] = []
    const lesCodages: string[] = ['|', 'X', 'O', '||', '|||', '/', '//', '///']

    const lesDessins: ObjetMathalea2D[] = []
    // Fonction récursive pour le parcours en profondeur (DFS)
    const parcourir = (face: FacePrisme, niveau: number = 0) => {
      if (facesVisitees.has(face.numFace)) {
        return // Évite les redondances
      }
      facesVisitees.add(face.numFace) // Marque la face actuelle comme visitée

      // Parcourt les arretes pour ajouter les codages le cas echéant et pour parcourir les faces connectées
      face._aretes.forEach((item) => {
        const empreinteArete = `${face.numFace}-${item.numero}`
        if (!aretesVisitees.includes(empreinteArete) || niveau > 10) {
          aretesVisitees.push(empreinteArete)
          if (item.connectee) {
            const autreEmpreinteArete = `${item.autreFace.numFace}-${item.autreArete}`
            aretesVisitees.push(autreEmpreinteArete)
          }

          if (!lesLongueurs.includes(item.longueur)) {
            lesLongueurs.push(item.longueur)
          }
          const indexLongueur = lesLongueurs.indexOf(item.longueur)
          const A = face.sommeti(item.numero)
          const B = face.sommeti(item.numero + 1)
          lesDessins.push(
            codageSegment(A, B, lesCodages[indexLongueur], 'black', 1),
          )
          if (item.connectee) {
            parcourir(item.autreFace, niveau + 1)
          }
        }
      })
    }

    // Lancer le parcours à partir de cette face

    parcourir(this)
    return lesDessins
  }

  // Numero: 'sans' | 'standard' | 'hasard' : distinction 'standard' | 'hasard' sans effet car deja implementaer a la fabrication du patron.
  patron(
    Numero: 'sans' | 'standard' | 'hasard',
    premiersSegments: 'sans' | 'seg0' | 'seg0seg1',
  ): ObjetMathalea2D[] {
    const facesVisitees: Set<number> = new Set() // Stocke les numéros de faces déjà visitées
    const lesDessins: ObjetMathalea2D[] = []
    // Fonction récursive pour le parcours en profondeur (DFS)
    const parcourir = (face: FacePrisme, niveau: number = 0) => {
      if (facesVisitees.has(face.numFace)) {
        return // Évite les redondances
      }
      facesVisitees.add(face.numFace) // Marque la face actuelle comme visitée

      // Dessine la face actuelle
      lesDessins.push(...face.dessinerFace(Numero !== 'sans', premiersSegments))
      // Ajouter le dessin de la face au résultat (ici, on concatène les dessins en HTML)
      // Parcourt les faces connectées
      face._aretes.forEach((connection) => {
        if (connection.autreFace) {
          parcourir(connection.autreFace, niveau + 1)
        }
      })
    }

    // Lancer le parcours à partir de cette face
    parcourir(this)
    return lesDessins
  }

  // Numero: 'sans' | 'standard' | 'hasard' : distinction 'standard' | 'hasard' sans effet car deja implementaer a la fabrication du patron.
  dessinerObjet(
    Numero: 'sans' | 'standard' | 'hasard',
    premiersSegments: 'sans' | 'seg0' | 'seg0seg1',
  ): string {
    const lesDessins: ObjetMathalea2D[] = this.patron(Numero, premiersSegments)
    let resultat: string = ''
    resultat = mathalea2d(
      Object.assign(
        {
          display: 'block', //'inline-block',
          scale: zoom,
          id: '' /* `correction1Ex${this.numeroExercice}Q${i}` */,
        } as const,
        fixeBordures(lesDessins),
      ),
      lesDessins,
    )
    return resultat
  }
}

// enT = true : on autorise un patron en T
// enS = true : on autorise un patron en S
export function patronHasard(
  nbSommetBase: number,
  hauteurPrisme: number,
  listeCotesBase: number[],
  listeAnglesBase: number[],
  options: {
    angleDeDepart: number //= 0,
    horizontal: 'horizontal' | 'vertical' | 'sansOrientation'
    enT: boolean //= false, // on force à ne pas faire de patron en T
    enS: boolean //= false, // on force à ne pas faire de patron en S
    tNumerotation: 'sans' | 'standard' | 'hasard'
  } = {
    angleDeDepart: 0,
    horizontal: 'sansOrientation',
    enT: false, // on force à ne pas faire de patron en T
    enS: false,
    tNumerotation: 'sans',
  },
): FacePrisme {
  const tempNum: number[] = []
  let num: number[] = []
  for (let k = 0; k < nbSommetBase; k++) {
    if (options.tNumerotation === 'hasard') {
      tempNum.push(k + 3)
    } else tempNum.push(10 + k)
  }
  if (options.tNumerotation === 'hasard') {
    tempNum.push(1)
    tempNum.push(2)
    num = combinaisonListes(tempNum)
  } else {
    num.push(1)
    num.push(...tempNum)
  }
  let ordreFace = 0
  let nbFacesLatRestant = nbSommetBase
  let base1 = new FacePrisme(
    num[ordreFace],
    nbSommetBase,
    listeCotesBase,
    listeAnglesBase,
    true,
    pointAbstrait(0, 0),
    options.angleDeDepart, // angle depart
  )
  ordreFace += 1
  let base2: FacePrisme = new FacePrisme( // valeurs temporaires
    -1,
    nbSommetBase,
    listeCotesBase,
    listeAnglesBase,
    true,
  ) // valeur temporaire

  /**
   * armature : on choisit cote de la base1 à partir duquel on commence à construire les faces latérales
   * onc choisit le nombre de faces latérales sur la première ligne (c'est à dire les faces latérales qui seront connectées directement à la base1)
   * pour chaque face latérale de la première ligne on choisit une arete disponible pour construire la face latérale suivante
   * on construit la base2 à partir d'une face latérale connectée ou connectable à la base1
   */

  // numDebutCoteBase = randint(0, base1.aretes.length - 1)
  let listeAretesDispo = base1.trouveAretesdisponibles(true)
  const numDebutCoteBase = choice(listeAretesDispo)
  if (
    options.horizontal === 'horizontal' ||
    options.horizontal === 'vertical'
  ) {
    const angleDepart1 =
      options.horizontal === 'horizontal'
        ? 0
        : options.horizontal === 'vertical'
          ? 90
          : options.angleDeDepart
    const anglePlus = base1.anglesCotei(numDebutCoteBase)
    base1 = new FacePrisme(
      num[0],
      nbSommetBase,
      listeCotesBase,
      listeAnglesBase,
      true,
      pointAbstrait(0, 0),
      angleDepart1 - anglePlus, // angle depart
    )
  }
  // Nombres de faces latérales sur la première ligne
  const maface1 = base1.creerFaceLateraleSurBase(
    num[ordreFace],
    true, // true c'est bien la base1
    numDebutCoteBase,
    hauteurPrisme,
  )
  ordreFace += 1
  nbFacesLatRestant -= 1
  let maface: FacePrisme
  enleveElement(listeAretesDispo, numDebutCoteBase)

  if (!options.enT && listeAretesDispo.length === 1) {
    base1.creerFaceLateraleSurBase(
      num[ordreFace],
      true, // true c'est bien la base1
      listeAretesDispo[0],
      hauteurPrisme,
    )
    ordreFace += 1
    nbFacesLatRestant -= 1
    enleveElement(listeAretesDispo, listeAretesDispo[0])
  }
  // si listeAretesDispo.length===0) on passe dirrectement à ajoutbase2 sur maface1
  // puis fin des faces latérales donc
  if (listeAretesDispo.length > 0) {
    const nbAretesDispoDeDepart = listeAretesDispo.length
    const minAretesDispoRestant = options.enT || options.enS ? 0 : 1 // si pas en T et pas en S il doit rester une face latérale (à connecter)
    // pour eviter que toutes soit alignées
    const nbFaceLateralesBaseAConnecter = randint(
      minAretesDispoRestant,
      nbAretesDispoDeDepart - minAretesDispoRestant,
    )

    maface = maface1
    do {
      const listeAretesLateralesDisponibles =
        maface.trouveAreteslateralesDisponiblesPourFaceLaterale()
      const tFace = choice(listeAretesLateralesDisponibles)
      maface = tFace.face.creerFaceLateraleSurFaceLaterale(
        num[ordreFace],
        tFace.numArete,
        hauteurPrisme,
      )
      ordreFace += 1
      nbFacesLatRestant -= 1
      listeAretesDispo = base1.trouveAretesdisponibles(true)
      // ajoute une face
      // et listeAretesDispo = base1.trouveAretesdisponibles(true)
    } while (
      listeAretesDispo.length >
      nbAretesDispoDeDepart - nbFaceLateralesBaseAConnecter
    )
    // }
  }
  // partie créer base2
  const aretesDispo = base1.trouveAretesdisponibles(true, true) // (true, true)

  if (options.enS && aretesDispo.length > 1) {
    enleveElement(aretesDispo, maface1.aretesi(2).autreArete) // enleveElement(listeAretesDispo, maface1.numFace)
  }
  let faceauPif: FacePrisme
  if (options.enT && nbFacesLatRestant === 0) {
    faceauPif = maface1
  } else {
    const tempnum = choice(aretesDispo)
    faceauPif = base1.aretesi(tempnum).autreFace // base1.trouverFaceParNumero(choice(facesLaterales))
  }

  if (faceauPif) {
    base2 = faceauPif.creer2emeBaseSurFaceLaterale(
      options.tNumerotation === 'hasard' ? num[ordreFace] : 2,
      base1,
    )
    ordreFace += options.tNumerotation === 'hasard' ? 1 : 0
  }

  if ((!options.enT || !options.enS) && listeAretesDispo.length > 0) {
    const baseChoisie = choice([base1, base2])
    listeAretesDispo = baseChoisie.trouveAretesdisponibles(
      baseChoisie === base1,
    )

    const numAreteChoisie = choice(listeAretesDispo)
    maface = baseChoisie.creerFaceLateraleSurBase(
      num[ordreFace],
      baseChoisie === base1,
      numAreteChoisie,
      hauteurPrisme,
    )
    ordreFace += 1
    nbFacesLatRestant -= 1
  }
  /**
   * l'armature est faite, il reste à ajouter les faces laterales
   * pour chaque face qui reste
   * oun choisit sur faces laterales disponibles
   * ou sur base si base on choisit base 1 ou base 2
   */
  // si reste 1 ou + base1.trouveAretesdisponibles(true) il faudra forecer la ceation d'une face laterale sur base1 ou 2
  // mais peute etre savoir si cette 2eme face pas deja crée cf

  let choix = ['base', 'laterale']
  for (let j = 0; j < nbFacesLatRestant; j++) {
    listeAretesDispo = base1.trouveAretesdisponibles(true)
    if (listeAretesDispo.length < 1) {
      choix = ['laterale']
    }
    const choixBaseOuLaterale = choice(choix) // 999
    switch (choixBaseOuLaterale) {
      case 'base':
        {
          const baseChoisie = choice([base1, base2])
          if (listeAretesDispo.length === 1) {
            choix = ['laterale']
          }
          const numAreteChoisie = choice(listeAretesDispo)
          maface = baseChoisie.creerFaceLateraleSurBase(
            num[ordreFace],
            baseChoisie === base1,
            numAreteChoisie,
            hauteurPrisme,
          )
          ordreFace += 1
        }
        break
      case 'laterale':
        {
          const aretesDispo = base1.trouveToutesAreteslateralesDisponibles()
          const uFace = choice(aretesDispo)
          maface = uFace.face.creerFaceLateraleSurFaceLaterale(
            num[ordreFace],
            uFace.numArete,
            hauteurPrisme,
          )
          ordreFace += 1
        }
        break
    }
  }
  return base1
}

export function patronEnS(
  nbSommetBase: number,
  hauteurPrisme: number,
  listeCotesBase: number[],
  listeAnglesBase: number[],
  options: {
    angleDeDepart: number //= 0,
    enT?: boolean //= false, // on force à ne pas faire de patron en T
    horizontal: 'horizontal' | 'vertical' | 'sansOrientation'
    tNumerotation?: 'sans' | 'standard' | 'hasard'
  } = {
    angleDeDepart: 0,
    enT: false, // on force à ne pas faire de patron en T
    horizontal: 'sansOrientation', // on force à faire un patron en S horizontal
    tNumerotation: 'sans',
  },
): FacePrisme {
  /**
   * armature : on choisit cote de la base1 à partir duquel on commence à construire les faces latérales
   * on construit les faces latérales alignes
   * pour chaque face latérale de la première ligne on choisit une arete disponible pour construire la face latérale suivante
   * on construit la base2 en face de la base1
   */
  const tempNum: number[] = []
  let num: number[] = []
  for (let k = 0; k < nbSommetBase; k++) {
    if (options.tNumerotation === 'hasard') {
      tempNum.push(k + 3)
    } else tempNum.push(10 + k)
  }
  if (options.tNumerotation === 'hasard') {
    tempNum.push(1)
    tempNum.push(2)
    num = combinaisonListes(tempNum)
  } else {
    num.push(1)
    num.push(...tempNum)
  }
  let ordreFace = 0

  let base1 = new FacePrisme(
    num[ordreFace],
    nbSommetBase,
    listeCotesBase,
    listeAnglesBase,
    true,
    pointAbstrait(0, 0),
    options.angleDeDepart, // angle depart
  )

  const numDebutCoteBase = choice(base1.trouveAretesdisponibles(true))
  if (
    options.horizontal === 'horizontal' ||
    options.horizontal === 'vertical'
  ) {
    const angleDepart1 =
      options.horizontal === 'horizontal'
        ? 0
        : options.horizontal === 'vertical'
          ? 90
          : options.angleDeDepart
    const anglePlus = base1.anglesCotei(numDebutCoteBase)
    base1 = new FacePrisme(
      num[0],
      nbSommetBase,
      listeCotesBase,
      listeAnglesBase,
      true,
      pointAbstrait(0, 0),
      angleDepart1 - anglePlus, // angle depart
    )
  }
  ordreFace += 1

  // Nombres de faces latérales sur la première ligne
  let maface: FacePrisme
  const maface1 = base1.creerFaceLateraleSurBase(
    num[ordreFace],
    true, // true c'est bien la base1
    numDebutCoteBase,
    hauteurPrisme,
  )
  ordreFace += 1
  maface = maface1
  for (let j = 1; j < nbSommetBase; j++) {
    const listeAretesLateralesDisponibles =
      maface.trouveAreteslateralesDisponiblesPourFaceLaterale()
    const tFace = choice(listeAretesLateralesDisponibles)
    maface = tFace.face.creerFaceLateraleSurFaceLaterale(
      num[ordreFace],
      tFace.numArete,
      hauteurPrisme,
    )
    ordreFace += 1
  }
  const aretesDispo = base1.trouveAretesdisponibles(true, true)
  if (!options.enT && aretesDispo.length > 1) {
    enleveElement(aretesDispo, maface1.aretesi(2).autreArete)
  }
  const faceauPif = base1.aretesi(choice(aretesDispo)).autreFace // base1.trouverFaceParNumero(choice(facesLaterales))
  if (faceauPif) {
    faceauPif.creer2emeBaseSurFaceLaterale(
      options.tNumerotation === 'hasard' ? num[ordreFace] : 2,
      base1,
    )
  }

  return base1
}

export function patronEnT(
  nbSommetBase: number,
  hauteurPrisme: number,
  listeCotesBase: number[],
  listeAnglesBase: number[],
  options: {
    angleDeDepart: number
    horizontal: 'horizontal' | 'vertical' | 'sansOrientation' // si true on force à faire un patron en T horizontal
    tNumerotation?: 'sans' | 'standard' | 'hasard'
  } = {
    angleDeDepart: 0,
    horizontal: 'sansOrientation', // on force à faire un patron en S horizontal
    tNumerotation: 'sans',
  },
): FacePrisme {
  /**
   * armature : on choisit cote de la base1 à partir duquel on commence à construire les faces latérales
   * on construit la base1 en tenant compte de horizontalon construit les faces latérales alignes
   * pour chaque face latérale de la première ligne on choisit une arete disponible pour construire la face latérale suivante
   * on construit la base2 en face de la base1
   */
  const tempNum: number[] = []
  let num: number[] = []
  for (let k = 0; k < nbSommetBase; k++) {
    if (options.tNumerotation === 'hasard') {
      tempNum.push(k + 3)
    } else tempNum.push(10 + k)
  }
  if (options.tNumerotation === 'hasard') {
    tempNum.push(1)
    tempNum.push(2)
    num = combinaisonListes(tempNum)
  } else {
    num.push(1)
    num.push(...tempNum)
  }
  let ordreFace = 0

  let base1 = new FacePrisme(
    num[0],
    nbSommetBase,
    listeCotesBase,
    listeAnglesBase,
    true,
    pointAbstrait(0, 0),
    options.angleDeDepart, // angle depart
  )
  const numDebutCoteBase = choice(base1.trouveAretesdisponibles(true))
  if (
    options.horizontal === 'horizontal' ||
    options.horizontal === 'vertical'
  ) {
    const angleDepart1 =
      options.horizontal === 'horizontal'
        ? 0
        : options.horizontal === 'vertical'
          ? 90
          : options.angleDeDepart
    const anglePlus = base1.anglesCotei(numDebutCoteBase)
    base1 = new FacePrisme(
      num[0],
      nbSommetBase,
      listeCotesBase,
      listeAnglesBase,
      true,
      pointAbstrait(0, 0),
      angleDepart1 - anglePlus, // angle depart
    )
  }
  ordreFace += 1
  // Nombres de faces latérales sur la première ligne
  const mafaceDeBase = base1.creerFaceLateraleSurBase(
    num[ordreFace],
    true, // true c'est bien la base1
    numDebutCoteBase,
    hauteurPrisme,
  )
  ordreFace += 1
  for (let j = 1; j < nbSommetBase; j++) {
    const listeAretesLateralesDisponibles =
      mafaceDeBase.trouveAreteslateralesDisponiblesPourFaceLaterale()
    const tFace = choice(listeAretesLateralesDisponibles)
    tFace.face.creerFaceLateraleSurFaceLaterale(
      num[ordreFace],
      tFace.numArete,
      hauteurPrisme,
    )
    ordreFace += 1
  }

  mafaceDeBase.creer2emeBaseSurFaceLaterale(
    options.tNumerotation === 'hasard' ? num[ordreFace] : 2,
    base1,
  )

  return base1
}

function angleSaillantBase1(a: number, b: number): boolean {
  let rep = true
  const difference = modulo360(a - b)
  rep = difference > 0 && difference < 180
  return rep
}

function angleSaillantBase2(a: number, b: number): boolean {
  let rep = true
  const difference = modulo360(a - b)
  rep = difference > 180 && difference < 360
  return rep
}

function modulo360(a: number): number {
  return ((a % 360) + 360) % 360
}

function modulo(a: number, n: number): number {
  return ((a % n) + n) % n
}
