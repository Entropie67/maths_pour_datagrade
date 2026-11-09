import { bleuMathalea } from '../../lib/colors'
import { context } from '../../modules/context'
import { arrondi } from '../outils/nombres'
import { nombreAvecEspace } from '../outils/texNombre'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { latex2d, latexParCoordonnees, texteParPosition } from './textes'
import { tracePoint } from './TracePoint'

/**  Trace un axe gradué
 * @param {Object} parametres À saisir entre accolades
 * @param {number?} [parametres.Unite = 10] Nombre de cm par unité
 * @param {number?} [parametres.Min = 10] Valeur minimum labelisée sur l'axe (les graduations commencent un peu avant)
 * @param {number?} [parametres.Max = 10] Valeur maximum labelisée sur l'axe (les graduations finissent un peu après)
 * @param {number?} [parametres.x = 0] Abscisse du point de départ du tracé
 * @param {number?} [parametres.y = 0] Ordonnée du point de départ du tracé
 * @param {number?} [parametres.axeEpaisseur = 2] Épaisseur de l'axe gradué
 * @param {string?} [parametres.axeCouleur = 'black'] Couleur de l'axe gradué : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {string?} [parametres.axeStyle = "->"] Style final de l'axe gradué
 * @param {number?} [parametres.axeHauteur = 4] Définit la "largeur" de l'axe, celle des graduations et du style final
 * @param {string?} [parametres.axePosition = 'H'] Position de l'axe : 'H' pour horizontal, 'V' pour vertical
 * @param {number?} [parametres.thickEpaisseur = 2] Épaisseur des graduations
 * @param {string?} [parametres.thickCouleur = axeCouleur] Couleur des graduations : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number?} [parametres.thickDistance = 1] Distance entre deux graduations principales
 * @param {number?} [parametres.thickOffset = 0] Décalage de toutes les graduations sur l'axe (pour, par exemple, faire coïncider le début de l'axe avec une graduation)
 * @param {boolean?} [parametres.thickSec = false] Affichage (ou pas) des graduations secondaires
 * @param {number?} [parametres.thickSecDist = 0.1] Distance entre deux graduations secondaires
 * @param {boolean?} [parametres.thickTer = false] Affichage (ou pas) des graduations secondaires
 * @param {number?} [parametres.thickTerDist = 0.1] Distance entre deux graduations tertiaires, false sinon
 * @param {[number, string][]} [parametres.pointListe = []] Liste de points à mettre sur l'axe comme, par exemple, [[3.4,'A'],[3.8,'B']]. Les noms se placent au-dessus de l'axe.
 * @param {number?} [parametres.labelPointTaille = 10] Taille (hauteur) de la police des points (de la liste des points pointListe) utilisée de 5 = \small à 20=\huge...
 * @param {number?} [parametres.labelPointLargeur = 20] Largeur de la boîte où sont affichés les points (de la liste des points pointListe) utilisée de 5 = \small à 20=\huge...
 * @param {string?} [parametres.pointCouleur =  bleuMathalea] Couleur des points de la liste pointListe : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number?} [parametres.pointTaille = 4] Taille en pixels des points de la liste  pointListe
 * @param {string?} [parametres.pointStyle = '+'] Style des points de la liste pointListe
 * @param {number?} [parametres.pointOpacite = 0.8] Opacité des points de la liste pointListe
 * @param {number?} [parametres.pointEpaisseur = 2] Épaisseur des points de la liste pointListe
 * @param {boolean?} [parametres.labelsPrincipaux = true] Présence (ou non) des labels numériques principaux
 * @param {boolean?} [parametres.labelsSecondaires = false] Présence (ou non) des labels numériques secondaires
 * @param {number?} [parametres.step1 = 1] Pas des labels numériques principaux
 * @param {number?} [parametres.step2 = 1] Pas des labels numériques secondaires
 * @param {number?} [parametres.labelDistance = (axeHauteur + 10) / context.pixelsParCm] Distance entre les labels et l'axe
 * @param {number?} [parametres.labelCustomDistance = (axeHauteur + 10) / context.pixelsParCm] Distance entre les labels et l'axe
 * @param {array?} [parametres.labelListe = []] Liste de labels à mettre sous l'axe comme, par exemple, [[2.8,'x'],[3.1,'y']]. Les noms se placent en dessous de l'axe.
 * @param {boolean?} [parametres.labelListeScriptsize = false] Si true, les labels de la liste labelListe sont en \scriptsize
 * @param {string?} [parametres.labelColor = 'black'] Couleur des labels de la liste labelListe : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number?} [parametres.labelScale = 1] Echelle des labels
 * @param {string?} [parametres.Legende = ''] Légende de l'axe
 * @param {number?} [parametres.LegendePosition] Position de la légende
 * @property {number?} Unite Nombre de cm par unité
 * @property {number?} Min Valeur minimum labelisée sur l'axe (les graduations commencent un peu avant)
 * @property {number?} Max Valeur maximum labelisée sur l'axe (les graduations finissent un peu après)
 * @author Jean-claude Lhote
 * @return {array} Liste d'objets MathAlea2D
 */
// JSDOC Validee par EE Aout 2022

export class DroiteGraduee extends ObjetMathalea2D {
  Unite: number
  Min: number
  Max: number
  constructor({
    Unite = 10,
    Min = 0,
    Max = 2,
    x = 0,
    y = 0,
    axeEpaisseur = 2,
    axeCouleur = 'black',
    axeStyle = '->',
    axeHauteur = 4,
    axePosition = 'H',
    thickEpaisseur = 2,
    thickCouleur = axeCouleur,
    thickDistance = 1,
    thickOffset = 0,
    thickSecDist = 0.1,
    thickSec = false,
    thickTerDist = 0.01,
    thickTer = false,
    pointListe = [],
    labelPointTaille = 10,
    labelPointLargeur = 20,
    pointCouleur = bleuMathalea,
    pointTaille = 4,
    pointStyle = '+',
    pointOpacite = 0.8,
    pointEpaisseur = 2,
    labelsPrincipaux = true,
    labelsSecondaires = false,
    labelColor = 'black',
    step1 = 1,
    step2 = 1,
    labelCustomDistance = (axeHauteur + 10) / context.pixelsParCm,
    labelDistance = (axeHauteur + 10) / context.pixelsParCm,
    labelListe = [],
    labelListeScriptsize = false,
    // labelColor = 'black',
    // labelScale = 1,
    Legende = '',
    LegendePosition = (Max - Min) * Unite + 1.5,
  }: {
    Unite?: number
    Min?: number
    Max?: number
    x?: number
    y?: number
    axeEpaisseur?: number
    axeCouleur?: string
    axeStyle?: string
    axeHauteur?: number
    axePosition?: string
    thickEpaisseur?: number
    thickCouleur?: string
    thickDistance?: number
    thickOffset?: number
    thickSecDist?: number
    thickSec?: boolean
    thickTerDist?: number
    thickTer?: boolean
    pointListe?: [number, string][]
    labelPointTaille?: number
    labelPointLargeur?: number
    pointCouleur?: string
    pointTaille?: number
    pointStyle?: string
    pointOpacite?: number
    pointEpaisseur?: number
    labelsPrincipaux?: boolean
    labelsSecondaires?: boolean
    step1?: number
    step2?: number
    labelCustomDistance?: number
    labelDistance?: number
    labelListe?: [number, string][]
    labelColor?: string
    Legende?: string
    LegendePosition?: number
    labelListeScriptsize?: boolean
  }) {
    super()
    // correctif Jean-claude Lhote 15/08/2023
    // Les propriétés exportables
    this.Unite = Unite
    this.Min = Min
    this.Max = Max
    this.objets = []
    let S
    let T
    let P
    let i
    let longueurTotale = (Max - Min) * Unite + 0.5 // la longueur totale de l'axe flèche comprise
    let absord = [1, 0] // Constantes pour gérer la verticalité ou l'horizontalité de l'axe
    if (axePosition !== 'H') absord = [0, 1]
    // dessin de l'axe
    if (axeStyle === '->') {
      longueurTotale += 0.2
      S = segment(
        x - 0.2 * absord[0],
        y - 0.2 * absord[1],
        x + longueurTotale * absord[0],
        y + longueurTotale * absord[1],
        axeCouleur,
      )
      S.styleExtremites = '->'
      S.tailleExtremites = axeHauteur
      S.epaisseur = axeEpaisseur
    } else {
      S = segment(
        x,
        y,
        x + longueurTotale * absord[0],
        y + longueurTotale * absord[1],
        axeCouleur,
      )
      S.styleExtremites = axeStyle || '|->'
      S.epaisseur = axeEpaisseur
      S.tailleExtremites = axeHauteur
    }
    this.objets.push(S)
    let factor
    const r = 10 / context.pixelsParCm
    if (thickTer) factor = 1 / thickTerDist
    else if (thickSec) factor = 1 / thickSecDist
    else factor = 1 / thickDistance

    const Min2 = Math.ceil((Min + thickOffset) * factor) // début des graduations (ne coïncide pas nécéssairement avec le début de la droite)
    const Max2 = Math.floor((Max - thickOffset) * factor) // fin des graduations
    const pas1 = Math.round(thickDistance * factor)
    const pas2 = Math.round(thickSecDist * factor)
    for (let j = Min2; j <= Max2; j++) {
      i = (j - Min * factor) / factor
      if (j % pas1 === 0) {
        // Graduation principale
        S = segment(
          x + i * Unite * absord[0] - (axeHauteur / 8) * r * absord[1],
          y - (axeHauteur / 8) * r * absord[0] + i * Unite * absord[1],
          x + i * Unite * absord[0] + (axeHauteur / 8) * r * absord[1],
          y + (axeHauteur / 8) * r * absord[0] + i * Unite * absord[1],
          thickCouleur,
        )
        S.epaisseur = thickEpaisseur
        this.objets.push(S)
      } else if (j % pas2 === 0 && thickSec) {
        // Graduation secondaire
        S = segment(
          x + i * Unite * absord[0] - (axeHauteur / 12) * r * absord[1],
          y - (axeHauteur / 12) * r * absord[0] + i * Unite * absord[1],
          x + i * Unite * absord[0] + (axeHauteur / 12) * r * absord[1],
          y + (axeHauteur / 12) * r * absord[0] + i * Unite * absord[1],
          thickCouleur,
        )
        S.epaisseur = thickEpaisseur / 2
        S.opacite = 0.8
        this.objets.push(S)
      } else if (thickTer) {
        // Graduation tertiaire
        S = segment(
          x + i * Unite * absord[0] - (axeHauteur / 16) * r * absord[1],
          y - (axeHauteur / 16) * r * absord[0] + i * Unite * absord[1],
          x + i * Unite * absord[0] + (axeHauteur / 16) * r * absord[1],
          y + (axeHauteur / 16) * r * absord[0] + i * Unite * absord[1],
          thickCouleur,
        )
        S.epaisseur = thickEpaisseur / 4
        S.opacite = 0.6
        this.objets.push(S)
      }
    }
    // Les labels principaux
    if (labelsPrincipaux) {
      for (let j = Min2; j <= Max2; j++) {
        if (j % (step1 * pas1) === 0) {
          i = (j - Min * factor) / factor
          T = latexParCoordonnees(
            `${nombreAvecEspace(arrondi(Min + i, 3))}`,
            x + i * Unite * absord[0] - labelDistance * absord[1],
            y + i * Unite * absord[1] - labelDistance * absord[0],
            'black',
            0,
            0,
            '',
            8,
          )
          this.objets.push(T)
        }
      }
    }
    if (labelsSecondaires) {
      for (let j = Min2; j <= Max2; j++) {
        if (j % (step2 * pas2) === 0 && j % (step1 * pas1) !== 0) {
          i = (j - Min * factor) / factor
          T = latexParCoordonnees(
            `${nombreAvecEspace(arrondi(Min + i, 3))}`,
            x + i * Unite * absord[0] - labelDistance * absord[1],
            y + i * Unite * absord[1] - labelDistance * absord[0],
            'black',
            0,
            0,
            '',
            8,
          )
          this.objets.push(T)
        }
      }
    }
    // Les labels facultatifs
    let t
    if (labelListe.length !== 0) {
      for (const p of labelListe) {
        t = latex2d(
          p[1],
          x -
            labelCustomDistance * absord[1] +
            (p[0] - Min) * absord[0] * Unite,
          y -
            labelCustomDistance * absord[0] +
            (p[0] - Min) * absord[1] * Unite,
          {
            letterSize: labelListeScriptsize ? 'scriptsize' : 'normalsize',
            color: labelColor,
          },
        )
        this.objets.push(t)
      }
    }
    if (Legende !== '') {
      this.objets.push(
        texteParPosition(
          Legende,
          x + LegendePosition * absord[0],
          y + LegendePosition * absord[1],
        ),
      )
    }
    if (pointListe.length !== 0) {
      let lab
      for (const p of pointListe) {
        P = pointAbstrait(
          x + (p[0] - Min) * absord[0] * Unite,
          y + (p[0] - Min) * absord[1] * Unite,
          p[1],
        )
        T = tracePoint(P, pointCouleur)
        T.taille = pointTaille
        T.tailleTikz = Math.max(T.taille / 30, 0.1)
        T.opacite = pointOpacite
        T.style = pointStyle
        T.epaisseur = pointEpaisseur
        lab = latex2d(
          p[1],
          x - 0.8 * absord[1] + (p[0] - Min) * absord[0] * Unite,
          y + 0.8 * absord[0] + (p[0] - Min) * absord[1] * Unite,
          { color: pointCouleur },
        )

        this.objets.push(T, lab)
      }
    }
    const bordures = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }
}
/**  Trace un axe gradué
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [parametres.Unite = 10] Nombre de cm par unité
 * @param {number} [parametres.Min = 10] Valeur minimum labelisée sur l'axe (les graduations commencent un peu avant)
 * @param {number} [parametres.Max = 10] Valeur maximum labelisée sur l'axe (les graduations finissent un peu après)
 * @param {number} [parametres.x = 0] Abscisse du point de départ du tracé
 * @param {number} [parametres.y = 0] Ordonnée du point de départ du tracé
 * @param {number} [parametres.axeEpaisseur = 2] Épaisseur de l'axe gradué
 * @param {string} [parametres.axeCouleur = 'black'] Couleur de l'axe gradué : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {string} [parametres.axeStyle = '->'] Style final de l'axe gradué
 * @param {number} [parametres.axeHauteur = 4] Définit la "largeur" de l'axe, celle des graduations et du style final
 * @param {string} [parametres.axePosition = 'H'] Position de l'axe : 'H' pour horizontal, 'V' pour vertical
 * @param {number} [parametres.thickEpaisseur = 2] Épaisseur des graduations
 * @param {string} [parametres.thickCouleur = axeCouleur] Couleur des graduations : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.thickDistance = 1] Distance entre deux graduations principales
 * @param {number} [parametres.thickOffset = 0] Décalage de toutes les graduations sur l'axe (pour, par exemple, faire coïncider le début de l'axe avec une graduation)
 * @param {boolean?} [parametres.thickSec = false] Affichage (ou pas) des graduations secondaires
 * @param {number} [parametres.thickSecDist = 0.1] Distance entre deux graduations secondaires
 * @param {boolean?} [parametres.thickTer = false] Affichage (ou pas) des graduations secondaires
 * @param {number} [parametres.thickTerDist = 0.1] Distance entre deux graduations tertiaires, false sinon
 * @param {array?} [parametres.pointListe = []] Liste de points à mettre sur l'axe comme, par exemple, [[3.4,'A'],[3.8,'B']]. Les noms se placent au-dessus de l'axe.
 * @param {number} [parametres.labelPointTaille = 10] Taille (hauteur) de la police des points (de la liste des points pointListe) utilisée de 5 = \small à 20=\huge...
 * @param {number} [parametres.labelPointLargeur = 20] Largeur de la boîte où sont affichés les points (de la liste des points pointListe) utilisée de 5 = \small à 20=\huge...
 * @param {string} [parametres.pointCouleur = bleuMathalea] Couleur des points de la liste pointListe : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number} [parametres.pointTaille = 4] Taille en pixels des points de la liste  pointListe
 * @param {string} [parametres.pointStyle = '+'] Style des points de la liste pointListe
 * @param {number} [parametres.pointOpacite = 0.8] Opacité des points de la liste pointListe
 * @param {number} [parametres.pointEpaisseur = 2] Épaisseur des points de la liste pointListe
 * @param {boolean?} [parametres.labelsPrincipaux = true] Présence (ou non) des labels numériques principaux
 * @param {boolean?} [parametres.labelsSecondaires = false] Présence (ou non) des labels numériques secondaires
 * @param {array?} [parametres.labelListe = []] Liste de labels à mettre sous l'axe comme, par exemple, [[2.8,'x'],[3.1,'y']]. Les noms se placent en dessous de l'axe. * @param {number} [parametres.step1 = 1] Pas des labels numériques principaux
 * @param {number} [parametres.step2 = 1] Pas des labels numériques secondaires
 * @param {number} [parametres.labelDistance = (axeHauteur + 10) / context.pixelsParCm] Distance entre les labels et l'axe
 * @param {number} [parametres.labelCustomDistance = (axeHauteur + 10) / context.pixelsParCm] Distance entre les labels de labelListe et l'axe
 * @param {string?} [parametres.labelColor = 'black'] Couleur des labels de la liste labelListe : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {number?} [parametres.labelScale = 1] Echelle des labels
 * @param {string} [parametres.Legende = ''] Légende de l'axe
 * @param {number} [parametres.LegendePosition] Position de la légende
 * @example droiteGraduee({
        x: 0,
        y: 3,
        Min: -2.7,
        Max: 12 + 0.2,
        thickSec: true,
        Unite: 3,
        thickCouleur: 'red',
        axeCouleur: bleuMathalea,
        axeHauteur: 4,
        labelsPrincipaux: false,
        labelListe: [[0, 'O'], [1, 'I']],
        pointListe: [[-1, 'A'], [5, 'B'], [7.2, 'C']],
        labelListeScriptsize: true,
        pointTaille: 6,
        pointCouleur: 'gray',
        pointStyle: '|',
        pointEpaisseur: 3
      })
 // Trace une droite graduée avec différentes options
 * @author Jean-claude Lhote
 * @return {DroiteGraduee}
 */
// JSDOC Validee par EE Aout 2022

export function droiteGraduee({
  Unite = 10,
  Min = 0,
  Max = 2,
  x = 0,
  y = 0,
  axeEpaisseur = 2,
  axeCouleur = 'black',
  axeStyle = '->',
  axeHauteur = 4,
  axePosition = 'H',
  thickEpaisseur = 2,
  thickCouleur = axeCouleur,
  thickDistance = 1,
  thickOffset = 0,
  thickSecDist = 0.1,
  thickSec = false,
  thickTerDist = 0.01,
  thickTer = false,
  pointListe = [],
  labelPointTaille = 10,
  labelPointLargeur = 20,
  pointCouleur = bleuMathalea,
  pointTaille = 4,
  pointStyle = '+',
  pointOpacite = 0.8,
  pointEpaisseur = 2,
  labelsPrincipaux = true,
  labelsSecondaires = false,
  labelColor = 'black',
  step1 = 1,
  step2 = 1,
  labelCustomDistance = (axeHauteur + 10) / context.pixelsParCm,
  labelDistance = (axeHauteur + 10) / context.pixelsParCm,
  labelListe = [],
  // labelColor = 'black',
  // labelScale = 1,
  labelListeScriptsize = false,
  Legende = '',
  LegendePosition = (Max - Min) * Unite + 1.5,
}: {
  Unite?: number
  Min?: number
  Max?: number
  x?: number
  y?: number
  axeEpaisseur?: number
  axeCouleur?: string
  axeStyle?: string
  axeHauteur?: number
  axePosition?: string
  thickEpaisseur?: number
  thickCouleur?: string
  thickDistance?: number
  thickOffset?: number
  thickSecDist?: number
  thickSec?: boolean
  thickTerDist?: number
  thickTer?: boolean
  pointListe?: [number, string][]
  labelPointTaille?: number
  labelPointLargeur?: number
  pointCouleur?: string
  pointTaille?: number
  pointStyle?: string
  pointOpacite?: number
  pointEpaisseur?: number
  labelsPrincipaux?: boolean
  labelsSecondaires?: boolean
  step1?: number
  step2?: number
  labelCustomDistance?: number
  labelDistance?: number
  labelListe?: [number, string][]
  labelListeScriptsize?: boolean
  labelColor?: string
  Legende?: string
  LegendePosition?: number
}) {
  return new DroiteGraduee({
    Unite,
    Min,
    Max,
    x,
    y,
    axeEpaisseur,
    axeCouleur,
    axeStyle,
    axeHauteur,
    axePosition,
    thickEpaisseur,
    thickCouleur,
    thickDistance,
    thickOffset,
    thickSecDist,
    thickSec,
    thickTerDist,
    thickTer,
    pointListe,
    labelPointTaille,
    labelPointLargeur,
    pointCouleur,
    pointTaille,
    pointStyle,
    pointOpacite,
    pointEpaisseur,
    labelsPrincipaux,
    labelsSecondaires,
    step1,
    step2,
    labelDistance,
    labelCustomDistance,
    labelListe,
    labelListeScriptsize,
    labelColor,
    Legende,
    LegendePosition,
  })
}
