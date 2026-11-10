import { arrondi } from '../outils/nombres'
import { Repere } from './reperes'
type LAbel = {
  valeur: number
  texte: string
}
/**
 * exemple : const repere = new RepereBuilder({xMin: -5, xMax:5, yMin: -3, yMax: 3}).setUniteX(1).setUniteY(2).buildCustom()
 */
export default class RepereBuilder {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  private yThickDistance: number = 1
  private xThickDistance: number = 1
  private xThickMax: number = 10
  private xThickMin: number = -10
  private yThickMax: number = 10
  private yThickMin: number = -10
  private xUnite: number = 1
  private yUnite: number = 1
  private grilleX: boolean | 'pointilles' = true
  private grilleXDistance: number = 1
  private grilleXMin: number = -10
  private grilleXMax: number = 10
  private grilleY: boolean | 'pointilles' = true
  private grilleYDistance: number = 1
  private grilleYMin: number = -10
  private grilleYMax: number = 10
  private grilleSecondaireX: boolean | 'pointilles' = false
  private grilleSecondaireXDistance: number = 1
  private grilleSecondaireXMin: number = -10
  private grilleSecondaireXMax: number = 10
  private grilleSecondaireY: boolean | 'pointilles' = false
  private grilleSecondaireYDistance: number = 1
  private grilleSecondaireYMin: number = -10
  private grilleSecondaireYMax: number = 10
  private axesEpaisseur: number = 1
  private thickEpaisseur: number = 1
  private xLabelMax: number = 10
  private xLabelMin: number = -10
  private xLabelDistance: number = 1
  private yLabelMax: number = 10
  private yLabelMin: number = -10
  private yLabelDistance: number = 1
  private xLabelListe: number[] | { valeur: number; texte: string }[] = []
  private yLabelListe: number[] | { valeur: number; texte: string }[] = []
  private thickHauteur: number = 0.13
  private axesCouleur: string = 'black'
  axeXStyle: string = '->'
  axeYStyle: string = '->'
  xLabelEcart: number = 0.5
  yLabelEcart: number = 0.5
  xThickListe?: boolean | number[] = true
  yThickListe?: boolean | number[] = true
  grilleCouleur?: string
  grilleOpacite?: number
  grilleSecondaireCouleur?: string

  /**
   * Le constructeur de l'objet RepereBuilder. Les paramètres à fournir sont minimales. Le reste est à configurer via les setters et l'instanciation du repère se fait à travers les builders exposés.
   * @param {number} xMin
   * @param {number} xMax
   * @param {number} yMin
   * @param {number} yMax
   */
  constructor(
    {
      xMin,
      xMax,
      yMin,
      yMax,
    }: { xMin: number; xMax: number; yMin: number; yMax: number } = {
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
    },
  ) {
    this.xMin = xMin ?? -10
    this.xMax = xMax ?? 10
    this.yMin = yMin ?? -10
    this.yMax = yMax ?? 10
    this.grilleX = false
    this.grilleY = false
    this.grilleSecondaireX = false
    this.grilleSecondaireY = false
    this.axesEpaisseur = 1
    this.thickEpaisseur = 1.2
  }

  /**
   * méthode qui retourne l'objet Repere construit est invoquée par les méthodes buildCustom() et buildStandard() qui elles sont exposées.
   * @private
   */
  private build() {
    return new Repere({
      xMin: this.xMin,
      xMax: this.xMax,
      yMin: this.yMin,
      yMax: this.yMax,
      xUnite: this.xUnite,
      yUnite: this.yUnite,
      xThickDistance: this.xThickDistance,
      yThickDistance: this.yThickDistance,
      yThickMin: this.yThickMin,
      yThickMax: this.yThickMax,
      xThickMin: this.xThickMin,
      xThickMax: this.xThickMax,
      grilleX: this.grilleX,
      grilleXMin: this.grilleXMin,
      grilleXMax: this.grilleXMax,
      grilleXDistance: this.grilleXDistance,
      grilleY: this.grilleY,
      grilleYMin: this.grilleYMin,
      grilleYMax: this.grilleYMax,
      grilleYDistance: this.grilleYDistance,
      grilleSecondaireX: this.grilleSecondaireX,
      grilleSecondaireXMin: this.grilleSecondaireXMin,
      grilleSecondaireXMax: this.grilleSecondaireXMax,
      grilleSecondaireXDistance: this.grilleSecondaireXDistance,
      grilleSecondaireY: this.grilleSecondaireY,
      grilleSecondaireYMin: this.grilleSecondaireYMin,
      grilleSecondaireYMax: this.grilleSecondaireYMax,
      grilleSecondaireYDistance: this.grilleSecondaireYDistance,
      axesEpaisseur: this.axesEpaisseur,
      thickEpaisseur: this.thickEpaisseur,
      xLabelMin: this.xLabelMin,
      xLabelMax: this.xLabelMax,
      xLabelDistance: this.xLabelDistance,
      yLabelMin: this.yLabelMin,
      yLabelMax: this.yLabelMax,
      yLabelDistance: this.yLabelDistance,
      xLabelListe: this.xLabelListe,
      yLabelListe: this.yLabelListe,
      axeXisVisible: true,
      axeYisVisible: true,
      axesCouleur: 'black',
      axeXStyle: this.axeXStyle,
      axeYStyle: this.axeYStyle,
      grilleXOpacite: 0.4,
      grilleYOpacite: 0.4,
      grilleSecondaireXOpacite: 0.3,
      grilleSecondaireYOpacite: 0.3,

      thickHauteur: 0.13,
      thickCouleur: this.axesCouleur,
      xThickListe: this.xThickListe ?? false,
      yThickListe: this.yThickListe ?? false,
      precisionLabelX: 1,
      precisionLabelY: 1,
      xLabelEcart: this.xLabelEcart,
      yLabelEcart: this.yLabelEcart,
      xLegende: '',
      xLegendePosition: [],
      yLegende: '',
      yLegendePosition: [],
      grille: true,
      grilleDistance: 1,
      grilleCouleur: 'black',
      grilleOpacite: 0.4,
      grilleEpaisseur: 1,
      grilleSecondaire: false,
      grilleSecondaireDistance: 1,
      grilleSecondaireCouleur: 'gray',
      grilleSecondaireOpacite: 0.3,
      grilleSecondaireEpaisseur: 1,
      grilleXListe: [],
      grilleXCouleur: this.grilleCouleur ?? 'gray',
      grilleYListe: [],
      grilleYCouleur: this.grilleCouleur ?? 'gray',
      grilleSecondaireXListe: [],
      grilleSecondaireXCouleur: this.grilleSecondaireCouleur ?? 'lightgray',
      grilleSecondaireYListe: [],
      grilleSecondaireYCouleur: this.grilleSecondaireCouleur ?? 'lightgray',
    })
  }

  /**
   * Un build avec des axes à coordonnées entières
   */
  buildStandard() {
    this.xUnite = 1
    this.yUnite = 1
    this.xThickDistance = 1
    this.yThickDistance = 1
    return this.build()
  }

  /**
   * Un build libre pour faire ce qu'on veut
   */
  buildCustom() {
    return this.build()
  }

  /**
   * Un build pour la trigo
   * @param {number} n diviseur de Pi pour graduer l'axe des abscisses.
   */
  buildTrigo(n: number) {
    const labels = []
    let i = 0
    for (let x = 0; x < this.xLabelMax; x += Math.PI / n) {
      if (x !== 0) {
        labels.push({
          valeur: arrondi(x, 2),
          texte: `\\frac{${i > 1 ? i.toString() : ''}\\Pi}{${n}}`,
        })
      }
      i++
    }
    i = 0
    for (let x = 0; x > this.xLabelMin; x -= Math.PI / n) {
      if (x !== 0) {
        labels.push({
          valeur: arrondi(x, 2),
          texte: `\\frac{${i < -1 ? i.toString() : '-'}\\Pi}{${n}}`,
        })
      }
      i--
    }
    this.xLabelListe = labels
    return this.build()
  }

  /**
   * méthode pour fixer l'échelle en x
   * @param {number} u l'échelle (1 par défaut)
   */
  setUniteX(u: number) {
    this.xUnite = u
    return this
  }

  /**
   * méthode pour fixer l'échelle en y
   * @param {number} u l'échelle (1 par défaut)
   */
  setUniteY(u: number) {
    this.yUnite = u
    return this
  }

  /**
   * méthode pour paramétrer les graduations sur l'axe des abscisses
   * @param {number} xMax la première
   * @param {number} xMin la dernière
   * @param {number} dx la distance entre deux graduations
   */
  setThickX({ xMax, xMin, dx }: { xMax: number; xMin: number; dx: number }) {
    this.xThickDistance = dx
    this.xThickMin = xMin
    this.xThickMax = xMax
    return this
  }

  /**
   * méthode pour paramétrer les graduations sur l'axe des ordonnées
   * @param {number} yMax la première
   * @param {number} yMin la dernière
   * @param {number} dy la distance entre deux graduations
   */
  setThickY({ yMax, yMin, dy }: { yMax: number; yMin: number; dy: number }) {
    this.yThickDistance = dy
    this.yThickMin = yMin
    this.yThickMax = yMax
    return this
  }

  /**
   * méthode pour paramétrer la grille principale
   * @param {{dx: number, xMin: number, xMax: number, style: string}} grilleX
   * @param {{dy: number, yMin: number, yMax: number, style: string}} grilleY
   */
  setGrille({
    grilleX,
    grilleY,
  }: {
    grilleX: { dx: number; xMin?: number; xMax?: number; style?: 'pointilles' }
    grilleY: { dy: number; yMin?: number; yMax?: number; style?: 'pointilles' }
  }) {
    if (grilleX) {
      this.grilleX = grilleX.style ? grilleX.style : true
      this.grilleXDistance = grilleX.dx ?? 1
      this.grilleXMin = grilleX.xMin ?? this.xMin
      this.grilleXMax = grilleX.xMax ?? this.xMax
    } else this.grilleX = false
    if (grilleY) {
      this.grilleY = grilleY.style ? grilleY.style : true
      this.grilleYDistance = grilleY.dy ?? 1
      this.grilleYMin = grilleY.yMin ?? this.yMin
      this.grilleYMax = grilleY.yMax ?? this.yMax
    } else this.grilleY = false
    return this
  }

  /**
   * méthode pour paramétrer la grille secondaire
   * @param {{dx: number, xMin: number, xMax: number}} grilleX
   * @param {{dy: number, yMin: number, yMax: number}} grilleY
   */
  setGrilleSecondaire({
    grilleX,
    grilleY,
  }: {
    grilleX: { dx: number; xMin?: number; xMax?: number; style?: 'pointilles' }
    grilleY: { dy: number; yMin?: number; yMax?: number; style?: 'pointilles' }
  }) {
    if (grilleX) {
      this.grilleSecondaireX = grilleX.style ? grilleX.style : true
      this.grilleSecondaireXDistance = grilleX.dx ?? 1
      this.grilleSecondaireXMin = grilleX.xMin ?? this.xMin
      this.grilleSecondaireXMax = grilleX.xMax ?? this.xMax
    } else this.grilleSecondaireX = false
    if (grilleY) {
      this.grilleSecondaireY = grilleY.style ? grilleY.style : true
      this.grilleSecondaireYDistance = grilleY.dy ?? 1
      this.grilleSecondaireYMin = grilleY.yMin ?? this.yMin
      this.grilleSecondaireYMax = grilleY.yMax ?? this.yMax
    } else this.grilleSecondaireY = false
    return this
  }

  /**
   * méthode pour paramétrer les labels sur l'axe des abscisses
   * @param {number} dx distance entre deux labels
   * @param {number} xMin le premier
   * @param {number} xMax le dernier
   */
  setLabelX({
    dx,
    xMin,
    xMax,
    xLabelEcart,
  }: {
    xMax?: number
    xMin?: number
    dx: number
    xLabelEcart?: number
  }) {
    this.xLabelMin = xMin ?? this.xMin
    this.xLabelMax = xMax ?? this.xMax
    this.xLabelDistance = dx
    this.xLabelEcart = xLabelEcart ?? 1
    return this
  }

  /**
   * méthode pour paramétrer les labels sur l'axe des ordonnées
   * @param {number} dy distance entre deux labels
   * @param {number} yMin le premier
   * @param {number} yMax le dernier
   * @param {number} yLabelEcart l'écart entre le label et l'axe (en unité de repère)
   */
  setLabelY({
    dy,
    yMin,
    yMax,
    yLabelEcart,
  }: {
    yMax?: number
    yMin?: number
    dy: number
    yLabelEcart?: number
  }) {
    this.yLabelMin = yMin ?? this.yMin
    this.yLabelMax = yMax ?? this.yMax
    this.yLabelDistance = dy
    this.yLabelEcart = yLabelEcart ?? 1
    return this
  }

  /**
   * Une méthode pour renseigner des labels non standards
   * @param {{valeur: number, texte: string}[]} labels un array de valeurs et leurs traduction en latex
   */
  setLabelsX(labels: LAbel[]) {
    this.xLabelListe = labels
    return this
  }

  /**
   * Une méthode pour renseigner des labels non standards
   * @param {{valeur: number, texte: string}[]} labels un array de valeurs et leurs traduction en latex
   */
  setLabelsY(labels: LAbel[]) {
    this.yLabelListe = labels
    return this
  }
}
