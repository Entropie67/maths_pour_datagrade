import { bleuMathalea } from '../../lib/colors'
import { texcolors } from '../format/style'
import { combinaisonListesSansChangerOrdre } from '../outils/arrayOutils'
import { numberFormat, texNombre } from '../outils/texNombre'
import { arc } from './Arc'
import { axeY, labelY } from './AxeY'
import { cercle } from './cercle'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import type { IRepere } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { motifs } from './pattern'
import type { PointAbstrait } from './PointAbstrait'
import { pointAbstrait } from './PointAbstrait'
import { Polygone, polygone } from './polygones'
import { carre } from './polygonesParticuliers'
import { polyline } from './Polyline'
import { pointDansRepere } from './reperes'
import { segment } from './segmentsVecteurs'
import {
  latexParCoordonnees,
  TexteParPoint,
  texteParPoint,
  texteParPosition,
} from './textes'
import { tracePoint } from './TracePoint'
import { rotation, similitude, translation } from './transformations'
import { vecteur } from './Vecteur'
import { vide2d, type Vide2d } from './Vide2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'

/**
 * Trace un graphique cartésien dans un repère
 *
 *
 * @param {array} data
 * @param {object} repere
 * @author Rémi Angot
 */
export class TraceGraphiqueCartesien extends ObjetMathalea2D {
  constructor(
    data: number[][],
    repere: IRepere,
    {
      couleurDesPoints = 'red',
      couleurDuTrait = bleuMathalea,
      styleDuTrait = '', // plein par défaut
      epaisseurDuTrait = 2,
      styleDesPoints = 'x', // croix par défaut
      tailleDesPoints = 3,
    }: {
      couleurDesPoints?: string
      couleurDuTrait?: string
      styleDuTrait?: string
      epaisseurDuTrait?: number
      styleDesPoints?: string
      tailleDesPoints?: number
    },
  ) {
    super()
    this.objets = []
    const listePoints: PointAbstrait[] = []
    for (const [x, y] of data) {
      const M = pointDansRepere(x, y, repere)
      listePoints.push(M)
      const t = tracePoint(M, couleurDesPoints)
      t.style = styleDesPoints
      t.taille = tailleDesPoints
      this.objets.push(t)
    }
    const l = polyline(...listePoints)
    l.epaisseur = epaisseurDuTrait
    l.color = colorToLatexOrHTML(couleurDuTrait)
    if (styleDuTrait === 'pointilles') {
      l.pointilles = 5
    }
    this.objets.push(l)
    this.bordures = repere.bordures as unknown as [
      number,
      number,
      number,
      number,
    ]
  }

  // LES SORTIES TiKZ et SVG
  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }

  svgml(coeff: number, amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.svgml === 'undefined') code += '\n\t' + objet.svg(coeff)
      else code += '\n\t' + objet.svgml(coeff, amp)
    }
    return code
  }

  tikzml(amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.tikzml === 'undefined') code += `\t${objet.tikz()}\n`
      else code += `\t${objet.tikzml(amp)}\n`
    }
    return code
  }
}

export function traceGraphiqueCartesien(
  data: number[][],
  repere: IRepere,
  {
    couleurDesPoints = 'red',
    couleurDuTrait = bleuMathalea,
    styleDuTrait = '', // plein par défaut
    epaisseurDuTrait = 2,
    styleDesPoints = 'x', // croix par défaut
    tailleDesPoints = 3,
  }: {
    couleurDesPoints?: string
    couleurDuTrait?: string
    styleDuTrait?: string
    epaisseurDuTrait?: number
    styleDesPoints?: string
    tailleDesPoints?: number
  },
) {
  return new TraceGraphiqueCartesien(data, repere, {
    couleurDesPoints,
    couleurDuTrait,
    styleDuTrait,
    epaisseurDuTrait,
    styleDesPoints,
    tailleDesPoints,
  })
}

/**
 * Trace une barre pour un histogramme
 *
 * @param {number} x
 * @param {number} hauteur
 * @param {string} legende
 * @param {number} epaisseur
 * @param {string} couleur
 * @param {number} opaciteDeRemplissage
 * @param {number} angle
 * @author Rémi Angot
 */
export class TraceBarre extends ObjetMathalea2D {
  p: Polygone | Vide2d
  texte: TexteParPoint
  constructor(
    x: number,
    hauteur: number,
    legende = '',
    {
      epaisseur = 0.6,
      couleurDeRemplissage = bleuMathalea,
      color = 'black',
      opaciteDeRemplissage = 0.3,
      angle = 66,
      unite = 1,
      hachures = false,
    }: {
      epaisseur?: number
      couleurDeRemplissage?: string
      color?: string
      opaciteDeRemplissage?: number
      angle?: number
      unite?: number
      hachures?: boolean | string
    },
  ) {
    super()
    this.p =
      hauteur === 0
        ? vide2d(x, 0)
        : polygone([
            pointAbstrait(x - epaisseur / 2, 0),
            pointAbstrait(x - epaisseur / 2, hauteur * unite),
            pointAbstrait(x + epaisseur / 2, hauteur * unite),
            pointAbstrait(x + epaisseur / 2, 0),
          ])
    if (this.p instanceof Polygone) {
      this.p.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
      this.p.opaciteDeRemplissage = opaciteDeRemplissage
      this.p.color = colorToLatexOrHTML(color)
      if (hachures) {
        this.p.hachures = hachures
      }
    }
    let bordures: { xmin: number; ymin: number; xmax: number; ymax: number }
    this.texte = texteParPosition(
      legende,
      x,
      -0.2,
      angle,
      'black',
      1,
      'gauche',
    ) as TexteParPoint
    if (this.p instanceof Polygone) {
      bordures = fixeBordures([this.p, this.texte], {
        rxmin: 0,
        rxmax: 0,
        rymin: 0,
        rymax: 0,
      })
    } else {
      bordures = fixeBordures([this.texte], {
        rxmin: 0,
        rxmax: 0,
        rymin: 0,
        rymax: 0,
      })
    }
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }

  tikz() {
    return this.p.tikz() + '\n' + this.texte.tikz()
  }

  svg(coeff: number) {
    return this.p.svg(coeff) + '\n' + this.texte.svg(coeff)
  }
}

export function traceBarre(
  x: number,
  hauteur: number,
  legende = '',
  {
    epaisseur = 0.6,
    couleurDeRemplissage = bleuMathalea,
    color = 'black',
    opaciteDeRemplissage = 0.3,
    angle = 66,
    unite = 1,
    hachures = false,
  }: {
    epaisseur?: number
    couleurDeRemplissage?: string
    color?: string
    opaciteDeRemplissage?: number
    angle?: number
    unite?: number
    hachures?: boolean | string
  },
) {
  return new TraceBarre(x, hauteur, legende, {
    epaisseur,
    couleurDeRemplissage,
    color,
    opaciteDeRemplissage,
    angle,
    unite,
    hachures,
  })
}

/**
 * Trace une barre horizontale pour un histogramme
 *
 * @param {number} longueur
 * @param {number} y
 * @param {string} legende
 * @param {number} epaisseur
 * @param {string} couleur
 * @param {number} opaciteDeRemplissage
 * @param {number} angle
 * @author Rémi Angot
 */
export class TraceBarreHorizontale extends ObjetMathalea2D {
  p: Polygone | Vide2d
  texte: TexteParPoint
  constructor(
    longueur: number,
    y: number,
    legende = '',
    {
      epaisseur = 0.6,
      couleurDeRemplissage = bleuMathalea,
      color = 'black',
      opaciteDeRemplissage = 0.3,
      unite = 1,
      angle = 0,
      hachures = false,
    }: {
      epaisseur?: number
      couleurDeRemplissage?: string
      color?: string
      opaciteDeRemplissage?: number
      unite?: number
      angle?: number
      hachures?: boolean
    },
  ) {
    super()
    this.bordures = [0, y - epaisseur / 2, unite * longueur, y + epaisseur / 2]
    this.p =
      longueur === 0
        ? vide2d(0, y)
        : polygone([
            pointAbstrait(0, y - epaisseur / 2),
            pointAbstrait(0, y + epaisseur / 2),
            pointAbstrait(unite * longueur, y + epaisseur / 2),
            pointAbstrait(unite * longueur, y - epaisseur / 2),
          ])
    if (this.p instanceof Polygone) {
      this.p.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
      this.p.opaciteDeRemplissage = opaciteDeRemplissage
      this.p.color = colorToLatexOrHTML(color)
      if (hachures) {
        this.p.hachures = hachures
      }
    }
    this.texte = texteParPosition(
      legende,
      -0.2,
      y,
      angle,
      'black',
      1,
      'gauche',
    ) as TexteParPoint
  }

  tikz() {
    return this.p.tikz() + '\n' + this.texte.tikz()
  }

  svg(coeff: number) {
    return this.p.svg(coeff) + '\n' + this.texte.svg(coeff)
  }
}

export function traceBarreHorizontale(
  longueur: number,
  y: number,
  legende = '',
  {
    epaisseur = 0.6,
    couleurDeRemplissage = bleuMathalea,
    color = 'black',
    opaciteDeRemplissage = 0.3,
    unite = 1,
    angle = 0,
    hachures = false,
  }: {
    epaisseur?: number
    couleurDeRemplissage?: string
    color?: string
    opaciteDeRemplissage?: number
    unite?: number
    angle?: number
    hachures?: boolean
  },
) {
  return new TraceBarreHorizontale(longueur, y, legende, {
    epaisseur,
    couleurDeRemplissage,
    color,
    opaciteDeRemplissage,
    unite,
    angle,
    hachures,
  })
}

/** Trace un diagramme en barres
 * @param {number[]} hauteursBarres Tableau des effectifs
 * @param {string[]} etiquettes Tableau des labels pour chaque effectif
 * @param {Object} parametres À saisir entre accolades
 * @param {boolean} [parametres.reperageTraitPointille = false] Présence (ou non) du trait en pointillés, reliant le haut de chaque barre à l'axe des ordonnées
 * @param {string} [parametres.couleurDeRemplissage = bleuMathalea] Couleur de remplissage de toutes les barres : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [parametres.titreAxeVertical = ''] Titre de l'axe des ordonnées
 * @param {boolean} [parametres.titre = ''] Titre du diagramme
 * @param {boolean} [parametres.hauteurDiagramme = 5] Hauteur du diagramme
 * @param {string[]} [parametres.coeff = 2] Largeur entre deux barres
 * @param {string} [parametres.axeVertical = true] Présence (ou non) de l'axe vertical
 * @param {boolean[]} [parametres.etiquetteValeur = true] Présence (ou non) de l'effectif sur chaque barre
 * @param {boolean[]} [parametres.labelAxeVert = true] Présence (ou non) des labels numériques sur l'axe vertical
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {number[]} bordures Coordonnées de la fenêtre d'affichage du genre [-2,-2,5,5]
 * @class
 */
export class DiagrammeBarres extends ObjetMathalea2D {
  constructor(
    hauteursBarres: number[],
    etiquettes: string[],
    {
      reperageTraitPointille = false,
      couleurDeRemplissage = bleuMathalea,
      titreAxeVertical = '',
      titre = '',
      hauteurDiagramme = 5,
      coeff = 2,
      axeVertical = false,
      etiquetteValeur = true,
      labelAxeVert = false,
    }: {
      reperageTraitPointille?: boolean
      couleurDeRemplissage?: string
      titreAxeVertical?: string
      titre?: string
      hauteurDiagramme?: number
      coeff?: number
      axeVertical?: boolean
      etiquetteValeur?: boolean
      labelAxeVert?: boolean
    },
  ) {
    super()
    this.objets = []
    for (let j = 0; j < hauteursBarres.length; j++) {
      const abscisseBarre = j * coeff
      const hauteurBarre =
        (hauteursBarres[j] * hauteurDiagramme) / Math.max(...hauteursBarres)
      this.objets.push(
        traceBarre(abscisseBarre, hauteurBarre, etiquettes[j], {
          couleurDeRemplissage,
        }),
      )
      if (reperageTraitPointille) {
        const ligne = segment(-1, hauteurBarre, abscisseBarre, hauteurBarre)
        ligne.pointilles = 5
        ligne.epaisseur = 0.2
        this.objets.push(ligne)
      }
      if (etiquetteValeur) {
        if (hauteursBarres[j] !== 0) {
          this.objets.push(
            texteParPoint(
              numberFormat(hauteursBarres[j]),
              pointAbstrait(abscisseBarre, hauteurBarre + 0.5),
            ),
          ) // On écrit la valeur au-dessus de la barre sauf pour une hauteur de 0
        }
      }
      // Calculs permettant de graduer l'axe vertical et de placer des valeurs
      const steps = [1, 2, 5, 10, 20]
      const yticks = [1, 2, 5, 5, 5]
      let istep = 1
      let step = 1
      let ytick = 1
      while (Math.max(...hauteursBarres) / step > 5 && istep < 5) {
        istep += 1
        step = steps[istep - 1]
        ytick = yticks[istep - 1]
      }
      if (istep === 5) istep = 2
      while (Math.max(...hauteursBarres) / step > 5) {
        istep = istep + 1
        step = istep * 10
        ytick = 5
      }

      if (labelAxeVert)
        this.objets.push(
          labelY(
            0,
            Math.max(...hauteursBarres),
            (step * hauteurDiagramme) / Math.max(...hauteursBarres),
            'black',
            -3,
            Math.max(...hauteursBarres) / hauteurDiagramme,
          ),
        )
      if (axeVertical)
        this.objets.push(
          axeY(
            0,
            hauteurDiagramme + 1,
            0.2,
            (step * hauteurDiagramme) / Math.max(...hauteursBarres),
            0.2,
            'black',
            ytick,
            titreAxeVertical,
          ),
        )
    }
    if (titre !== '')
      this.objets.push(
        texteParPoint(
          titre,
          pointAbstrait(-3, hauteurDiagramme + 1),
          0,
          'black',
          1,
          'droite',
          false,
          1,
        ),
      )
    this.bordures = [1000, 1000, -1000, -1000]
    for (const objet of this.objets) {
      if (objet.bordures !== undefined) {
        this.bordures = [
          Math.min(this.bordures[0], objet.bordures[0]),
          Math.min(this.bordures[1], objet.bordures[1]),
          Math.max(this.bordures[2], objet.bordures[2]),
          Math.max(this.bordures[3], objet.bordures[3]),
        ]
      }
    }
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}

/** Trace un diagramme en barres
 * @param {number[]} hauteursBarres Tableau des effectifs
 * @param {string[]} etiquettes Tableau des labels pour chaque effectif
 * @param {Object} parametres À saisir entre accolades
 * @param {boolean} [parametres.reperageTraitPointille = false] Présence (ou non) du trait en pointillés, reliant le haut de chaque barre à l'axe des ordonnées
 * @param {string} [parametres.couleurDeRemplissage = bleuMathalea] Couleur de remplissage de toutes les barres : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {number} [parametres.titreAxeVertical = ''] Titre de l'axe des ordonnées
 * @param {boolean} [parametres.titre = ''] Titre du diagramme
 * @param {boolean} [parametres.hauteurDiagramme = 5] Hauteur du diagramme
 * @param {string[]} [parametres.coeff = 2] Largeur entre deux barres
 * @param {string} [parametres.axeVertical = true] Présence (ou non) de l'axe vertical
 * @param {boolean[]} [parametres.etiquetteValeur = true] Présence (ou non) de l'effectif sur chaque barre
 * @param {boolean[]} [parametres.labelAxeVert = true] Présence (ou non) des labels numériques sur l'axe vertical
 * @example diagrammeBarres([15, 25, 30, 10, 20], ['Compas', 'Rapporteur', 'Règle', 'Crayon', 'Gomme'])
 * // Trace un diagramme en barres avec les options par défaut
 * @example diagrammeBarres([15, 25, 30, 10, 20], ['Compas', 'Rapporteur', 'Règle', 'Crayon', 'Gomme'],{
 * reperageTraitPointille: true, couleurDeRemplissage: 'red', titreAxeVertical: 'Nombre de réponses',
 * titre = 'Matériel mathématique dans sa trousse', * hauteurDiagramme: 10, coeff: 3, etiquetteValeur: false }})
 * // Trace un diagramme en barres avec modification de quelques options par défaut
 * @return {DiagrammeBarres}
 */
export function diagrammeBarres(
  hauteursBarres: number[],
  etiquettes: string[],
  {
    reperageTraitPointille = false,
    couleurDeRemplissage = bleuMathalea,
    titreAxeVertical = '',
    titre = '',
    hauteurDiagramme = 5,
    coeff = 2,
    axeVertical = false,
    etiquetteValeur = true,
    labelAxeVert = false,
  } = {},
) {
  return new DiagrammeBarres(hauteursBarres, etiquettes, {
    reperageTraitPointille,
    couleurDeRemplissage,
    titreAxeVertical,
    titre,
    hauteurDiagramme,
    coeff,
    axeVertical,
    etiquetteValeur,
    labelAxeVert,
  })
}

/**
 * Étiquette d'un secteur (pourcentage, valeur, mesure) : fond blanc et fin cadre arrondi
 * pour rester lisible par-dessus les couleurs du diagramme.
 */
function etiquetteSecteur(texte: string, A: PointAbstrait) {
  const etiquette = latexParCoordonnees(
    texte,
    A.x,
    A.y,
    'black',
    20,
    12,
    'white',
    8,
  )
  etiquette.bordure = 'gray'
  etiquette.padding = 2
  return etiquette
}

/** Trace un diagramme circulaire
 * @param {Object} parametres À saisir entre accolades
 * @param {number[]} parametres.effectifs Liste des effectifs à donner impérativement
 * @param {number} [parametres.x = 0] Abscisse du point en bas à gauche
 * @param {number} [parametres.y = 0] Ordonnée du point en bas à gauche
 * @param {number} [parametres.rayon = 4] Rayon du diagramme circulaire
 * @param {boolean} [parametres.semi = false] True pour un semi-circulaire, false pour un circulaire
 * @param {boolean} [parametres.legendeAffichage = true] Présence (ou non) de la légende (ensemble des labels)
 * @param {string[]} [parametres.labels = []] Labels associés aux effectifs respectifs. Tableau de même taille que effectifs.
 * @param {string} [parametres.legendePosition = 'droite'] Position de la légende à choisir parmi : 'droite', 'dessus' ou 'dessous'
 * @param {boolean[]} [parametres.mesures = []] Présence (ou non) de la mesure de chaque secteur. Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.visibles = []] Découpe (ou non) du secteur (pour créer des diagrammes à compléter). Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.pourcents = []] Présence (ou non) du pourcentage de l'effectif total associé au secteur. Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.valeurs = []] Présence (ou non) de des valeurs de l'effectif. Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.hachures = []] Présence (ou non) de hachures dans le secteur associé. Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.remplissage = []] Présence (ou non) d'une couleur de remplissage dans le secteur associé. Tableau de même taille que effectifs.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {number} x Abscisse du point en bas à gauche
 * @property {number} y Ordonnée du point en bas à gauche
 * @property {number[]} bordures Coordonnées de la fenêtre d'affichage du genre [-2,-2,5,5]
 * @class
 */
export class DiagrammeCirculaire extends ObjetMathalea2D {
  x: number
  y: number

  constructor({
    effectifs = [],
    x = 0,
    y = 0,
    rayon = 4,
    labels = [],
    semi = false,
    legendeAffichage = true,
    legendePosition = 'droite',
    mesures = [],
    visibles = [],
    pourcents = [],
    valeurs = [],
    hachures = [],
    remplissage = [],
  }: {
    effectifs?: number[]
    x?: number
    y?: number
    rayon?: number
    labels?: string[]
    semi?: boolean
    legendeAffichage?: boolean
    legendePosition?: string
    mesures?: boolean[]
    visibles?: boolean[]
    pourcents?: boolean[]
    valeurs?: boolean[]
    hachures?: boolean[]
    remplissage?: boolean[]
  } = {}) {
    super()
    this.objets = []
    const listeHachuresDisponibles = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10]
    const listeMotifs = combinaisonListesSansChangerOrdre(
      listeHachuresDisponibles,
      effectifs.length,
    )
    this.bordures = [1000, 1000, -1000, -1000]
    this.x = x
    this.y = y
    const centre = pointAbstrait(this.x + rayon, this.y + (semi ? 0 : rayon))
    const depart = pointAbstrait(
      this.x + 2 * rayon,
      semi ? this.y : this.y + rayon,
    )
    const contour = semi
      ? arc(
          translation(centre, vecteur(rayon, 0)),
          centre,
          180,
          true,
          'white',
          'black',
        )
      : cercle(centre, rayon, 'black')
    let positionLegende // On prévoit l'emplacement de la légende si celle-ci est demandée
    switch (legendePosition) {
      case 'droite':
        positionLegende = { x: this.x + 2 * rayon + 1, y: this.y }
        break
      case 'dessus':
        positionLegende = {
          x: this.x,
          y: this.y + (semi ? rayon + 1 : 2 * rayon + 1),
        }
        break
      case 'dessous':
      default:
        positionLegende = { x: this.x, y: this.y - 1.5 }
        break
    }
    let T = pointAbstrait(positionLegende.x, positionLegende.y)
    const angleTotal = semi ? 180 : 360
    const effectifTotal = effectifs.reduce(
      (somme: number, valeur: number) => somme + valeur,
      0,
    )
    const secteurs = []
    const legendes = []
    const etiquettes = []
    const etiquettes2 = []
    const etiquettes3 = []
    let alpha = 0 // alpha est l'angle à partir duquel démarre le secteur
    let legendeMax = 0
    for (
      let i = 0, a, angle, legende, textelegende, hachure;
      i < effectifs.length;
      i++
    ) {
      // on crée les secteurs
      angle = (angleTotal * effectifs[i]) / effectifTotal
      a = arc(rotation(depart, centre, alpha), centre, angle, true)
      if (hachures[i]) {
        hachure = motifs(listeMotifs[i])
        a.hachures = hachure
        a.couleurDesHachures = colorToLatexOrHTML(texcolors(i + 1))
        a.couleurDeRemplissage = colorToLatexOrHTML(texcolors(i + 2))
      } else {
        hachure = false
        a.hachures = ''
      }
      a.opaciteDeRemplissage = 0.7
      if (remplissage[i])
        a.couleurDeRemplissage = colorToLatexOrHTML(texcolors(i + 1))
      if (visibles[i]) secteurs.push(a)
      if (valeurs[i]) {
        etiquettes.push(
          etiquetteSecteur(
            texNombre(effectifs[i]),
            similitude(depart, centre, alpha + (angle * 3) / 4, 0.8),
          ),
        )
      }
      if (pourcents[i]) {
        etiquettes2.push(
          etiquetteSecteur(
            texNombre((100 * effectifs[i]) / effectifTotal, 0) + '\\,\\%',
            similitude(depart, centre, alpha + angle / 4, 0.8),
          ),
        )
      }
      if (mesures[i]) {
        etiquettes3.push(
          etiquetteSecteur(
            texNombre(angle, 0) + '^\\circ',
            similitude(depart, centre, alpha + angle / 2, 0.6),
          ),
        )
      }
      alpha += angle

      // on crée les légendes
      switch (legendePosition) {
        case 'droite':
          legende = carre(
            translation(T, vecteur(0, 1.5 * i)),
            translation(T, vecteur(1, 1.5 * i)),
            'black',
          )
          textelegende = texteParPoint(
            labels[i],
            translation(T, vecteur(1.2, i * 1.5 + 0.5)),
            0,
            'black',
            1.5,
            'gauche',
            false,
          )
          legendeMax = Math.max(legendeMax, labels[i].length * 0.6)
          break
        default:
          legende = carre(T, translation(T, vecteur(1, 0)), 'black')
          textelegende = texteParPoint(
            labels[i],
            translation(T, vecteur(1.2, 0.5)),
            0,
            'black',
            1.5,
            'gauche',
            false,
          )
          T = translation(T, vecteur(labels[i].length * 0.6 + 1, 0))
          legendeMax = legendeMax + labels[i].length * 0.6 + 2.2
          break
      }

      legende.couleurDeRemplissage = a.couleurDeRemplissage
      legende.couleurDesHachures = a.couleurDesHachures
      legende.hachures = hachure
      legende.opaciteDeRemplissage = 0.7
      legendes.push(legende, textelegende)
    }
    this.objets.push(contour)
    this.objets.push(...secteurs)
    if (legendeAffichage) this.objets.push(...legendes)
    this.objets.push(...etiquettes, ...etiquettes2, ...etiquettes3)
    // calcul des bordures
    this.bordures[0] = this.x - 0.5
    this.bordures[1] =
      this.y -
      0.5 -
      (legendeAffichage ? (legendePosition === 'dessous' ? 2 : 0) : 0)
    this.bordures[2] =
      this.x +
      rayon * 2 +
      1 +
      (legendeAffichage
        ? legendePosition === 'droite'
          ? legendeMax
          : Math.max(legendeMax, this.x + rayon * 2 + 1) -
            (this.x + rayon * 2 + 1)
        : 0)
    this.bordures[3] =
      this.y +
      (semi ? rayon : rayon * 2) +
      (legendeAffichage
        ? legendePosition === 'dessus'
          ? 2
          : legendePosition === 'droite'
            ? Math.max(
                this.y + (semi ? rayon : rayon * 2),
                effectifs.length * 1.5,
              ) -
              (this.y + (semi ? rayon : rayon * 2))
            : 0
        : 0)
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  ttikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}\n`
    }
    return code
  }
}

/** Trace un diagramme circulaire
 * @param {Object} parametres À saisir entre accolades
 * @param {number[]} parametres.effectifs Liste des effectifs à donner impérativement
 * @param {number} [parametres.x = 0] Abscisse du point en bas à gauche
 * @param {number} [parametres.y = 0] Ordonnée du point en bas à gauche
 * @param {number} [parametres.rayon = 4] Rayon du diagramme circulaire
 * @param {boolean} [parametres.semi = false] True pour un semi-circulaire, false pour un circulaire
 * @param {boolean} [parametres.legendeAffichage = true] Présence (ou non) de la légende (ensemble des labels)
 * @param {string[]} [parametres.labels = []] Labels associés aux effectifs respectifs. Tableau de même taille que effectifs.
 * @param {string} [parametres.legendePosition = 'droite'] Position de la légende à choisir parmi : 'droite', 'dessus' ou 'dessous'
 * @param {boolean[]} [parametres.mesures = []] Présence (ou non) de la mesure de chaque secteur. Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.visibles = []] Découpe (ou non) du secteur (pour créer des diagrammes à compléter). Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.pourcents = []] Présence (ou non) du pourcentage de l'effectif total associé au secteur. Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.valeurs = []] Présence (ou non) de des valeurs de l'effectif. Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.hachures = []] Présence (ou non) de hachures dans le secteur associé. Tableau de même taille que effectifs.
 * @param {boolean[]} [parametres.remplissage = []] Présence (ou non) d'une couleur de remplissage dans le secteur associé. Tableau de même taille que effectifs.
 * @example diagrammeCirculaire({ rayon: 7, semi: false, legendePosition: 'dessous',
 * effectifs: [15, 25, 30, 10, 20],
 * labels: ['Compas', 'Rapporteur', 'Règle', 'Crayon', 'Gomme'],
 * mesures: [true, true, true, false, true],
 * visibles: [true, false, true, true, true],
 * pourcents: [true, true, true, false, true],
 * valeurs: [true, false, true, true, false],
 * hachures: [true, true, true, false, true],
 * remplissage: [false, true, true, true, true] })
 * // Trace un diagramme semi-circulaire de rayon 7 avec différentes options
 * @return {DiagrammeCirculaire}
 */
export function diagrammeCirculaire({
  effectifs,
  x = 0,
  y = 0,
  rayon = 4,
  labels = [],
  semi = false,
  legendeAffichage = true,
  legendePosition = 'droite',
  mesures = [],
  visibles = [],
  pourcents = [],
  valeurs = [],
  hachures = [],
  remplissage = [],
}: {
  effectifs?: number[]
  x?: number
  y?: number
  rayon?: number
  labels?: string[]
  semi?: boolean
  legendeAffichage?: boolean
  legendePosition?: string
  mesures?: boolean[]
  visibles?: boolean[]
  pourcents?: boolean[]
  valeurs?: boolean[]
  hachures?: boolean[]
  remplissage?: boolean[]
} = {}) {
  return new DiagrammeCirculaire({
    effectifs,
    x,
    y,
    rayon,
    labels,
    semi,
    legendeAffichage,
    legendePosition,
    mesures,
    visibles,
    pourcents,
    valeurs,
    hachures,
    remplissage,
  })
}

export type SerieBarresEmpilees = {
  /** Légende de la série */
  nom: string
  /** Couleur de remplissage (ignorée si `hachures` est renseigné) */
  couleur?: string
  /** Motif de hachures (cf. `motifs()`), par exemple 'bricks' */
  hachures?: string
}

/**
 * Trace un diagramme en barres empilées (une barre par étiquette, une couche par série).
 * @param {SerieBarresEmpilees[]} series Description des couches, de la plus basse à la plus haute
 * @param {number[][]} valeurs valeurs[j][k] : hauteur de la couche k de la barre j
 * @param {string[]} etiquettes Légende sous chaque barre
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [parametres.valeurMax = 500] Valeur maximale de l'axe vertical
 * @param {number} [parametres.graduation = 50] Pas de la graduation verticale
 * @param {number} [parametres.hauteur = 6] Hauteur du graphique en cm
 * @param {number} [parametres.largeurBarre = 0.8] Largeur d'une barre en cm
 * @param {number} [parametres.espacement = 1.2] Distance entre les centres de deux barres
 * @param {string} [parametres.titre = ''] Titre du diagramme
 * @param {string} [parametres.titreAxeVertical = ''] Titre de l'axe des ordonnées
 * @param {boolean} [parametres.quadrillage = true] Lignes horizontales à chaque graduation
 * @return {NestedObjetMathalea2dArray} Objets à passer à mathalea2d
 */
export function diagrammeBarresEmpilees(
  series: SerieBarresEmpilees[],
  valeurs: number[][],
  etiquettes: string[],
  {
    valeurMax = 500,
    graduation = 50,
    hauteur = 6,
    largeurBarre = 0.8,
    espacement = 1.2,
    titre = '',
    titreAxeVertical = '',
    quadrillage = true,
  }: {
    valeurMax?: number
    graduation?: number
    hauteur?: number
    largeurBarre?: number
    espacement?: number
    titre?: string
    titreAxeVertical?: string
    quadrillage?: boolean
  } = {},
): NestedObjetMathalea2dArray {
  const objets: NestedObjetMathalea2dArray = []
  const unite = hauteur / valeurMax
  const largeurTotale = etiquettes.length * espacement
  // Quadrillage et graduation verticale
  for (let v = 0; v <= valeurMax; v += graduation) {
    const y = v * unite
    if (quadrillage) {
      const ligne = segment(0, y, largeurTotale, y, 'gray')
      ligne.epaisseur = 0.5
      ligne.opacite = 0.5
      objets.push(ligne)
    }
    objets.push(texteParPosition(String(v), -0.2, y, 0, 'black', 0.8, 'droite'))
  }
  objets.push(segment(0, 0, largeurTotale, 0))
  // Barres empilées
  for (let j = 0; j < etiquettes.length; j++) {
    const xCentre = (j + 0.5) * espacement
    let base = 0
    for (let k = 0; k < series.length; k++) {
      const haut = base + valeurs[j][k]
      const barre = polygone(
        pointAbstrait(xCentre - largeurBarre / 2, base * unite),
        pointAbstrait(xCentre - largeurBarre / 2, haut * unite),
        pointAbstrait(xCentre + largeurBarre / 2, haut * unite),
        pointAbstrait(xCentre + largeurBarre / 2, base * unite),
      )
      barre.couleurDeRemplissage = colorToLatexOrHTML(
        series[k].couleur ?? 'white',
      )
      barre.opaciteDeRemplissage = 1
      const motif = series[k].hachures
      if (motif != null) {
        barre.hachures = motif
        barre.couleurDesHachures = colorToLatexOrHTML('black')
      }
      objets.push(barre)
      base = haut
    }
    objets.push(texteParPosition(etiquettes[j], xCentre, -0.4, 0, 'black', 0.8))
  }
  // Légende
  const yLegende = -1.5
  let x =
    (largeurTotale -
      series.reduce(
        (somme, serie) => somme + 1.4 + serie.nom.length * 0.2,
        0,
      )) /
    2
  series.forEach((serie) => {
    const carreLegende = polygone(
      pointAbstrait(x, yLegende - 0.25),
      pointAbstrait(x, yLegende + 0.25),
      pointAbstrait(x + 0.5, yLegende + 0.25),
      pointAbstrait(x + 0.5, yLegende - 0.25),
    )
    carreLegende.couleurDeRemplissage = colorToLatexOrHTML(
      serie.couleur ?? 'white',
    )
    carreLegende.opaciteDeRemplissage = 1
    const motifLegende = serie.hachures
    if (motifLegende != null) {
      carreLegende.hachures = motifLegende
      carreLegende.couleurDesHachures = colorToLatexOrHTML('black')
    }
    objets.push(
      carreLegende,
      texteParPosition(serie.nom, x + 0.7, yLegende, 0, 'black', 0.8, 'gauche'),
    )
    x += 1.4 + serie.nom.length * 0.2
  })
  if (titre !== '') {
    objets.push(
      texteParPosition(
        titre,
        largeurTotale / 2,
        hauteur + 0.8,
        0,
        'black',
        1.2,
      ),
    )
  }
  if (titreAxeVertical !== '') {
    const titreAxe = texteParPosition(
      titreAxeVertical,
      -1.3,
      hauteur / 2,
      -90,
      'black',
      0.9,
    )
    // Les bordures par défaut d'un texte vertical comptent deux fois sa longueur
    const demiLongueur = titreAxeVertical.length * 0.1
    titreAxe.bordures = [
      -1.3 - 0.3,
      hauteur / 2 - demiLongueur,
      -1.3 + 0.3,
      hauteur / 2 + demiLongueur,
    ]
    objets.push(titreAxe)
  }
  return objets
}
