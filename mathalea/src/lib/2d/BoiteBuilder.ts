import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { pointAbstrait } from './PointAbstrait'
import { Polygone, polygone } from './polygones'
import {
  latex2d,
  Latex2d,
  LatexParCoordonnees,
  TexteParPoint,
  texteParPosition,
} from './textes'

/**
 * Un constructeur de boites rectangulaires.
 * remplace l'objet Mathalea2d Boite()
 * On construit une Boite de base puis on peut
 * Ajouter des couleurs avec la méthode addColor()
 * Ajouter du texte ou du latex dedans avec addTextIn()
 * Enfin, la méthode render() retourne l'objet Mathalea2d ou un array d'objet Mathalea2d pour la fonction mathalea2d()
 * Exemple : const maBoite = new BoiteBuilder({xMin:0, yMin:0, xMax:3, yMax: 2}).addTextIn({textIn: '\\dfrac{1}{2}'}).render()
 */

export class BoiteBuilder {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  forme: Polygone
  text!: LatexParCoordonnees | TexteParPoint | Latex2d
  constructor({
    xMin,
    xMax,
    yMin,
    yMax,
  }: {
    xMin: number
    xMax: number
    yMin: number
    yMax: number
  }) {
    this.xMin = xMin
    this.xMax = xMax
    this.yMin = yMin
    this.yMax = yMax
    this.forme = polygone([
      pointAbstrait(xMin, yMin),
      pointAbstrait(xMax, yMin),
      pointAbstrait(xMax, yMax),
      pointAbstrait(xMin, yMax),
    ])
  }

  /**
   * l'objet ou l'array d'objet pour la fonction mathalea2d()
   * @return {[Polygone|Vide2d,LatexParCoordonnees|TexteParPoint)]|Polygone}
   */
  render() {
    return this.text ? [this.forme, this.text] : this.forme
  }

  /**
   * La méthode retourne l'objet afin de la rendre chaînable
   * @param {Object} params
   * @param {string} [params.color]
   * @param {string} [params.colorBackground]
   * @param {number} [params.opacity]
   * @param {number} [params.backgroudOpacity]
   * @return {BoiteBuilder}
   */
  addColor({
    color,
    colorBackground,
    opacity,
    backgroudOpacity,
  }: {
    color?: string
    colorBackground?: string
    opacity?: number
    backgroudOpacity?: number
  }) {
    this.forme.color = colorToLatexOrHTML(color ?? 'black')
    this.forme.opacite = opacity ?? 1
    this.forme.couleurDeRemplissage = colorToLatexOrHTML(
      colorBackground ?? 'none',
    )
    this.forme.opaciteDeRemplissage = backgroudOpacity ?? 0.7
    return this
  }

  /**
   * La méthode retourne l'objet afin de la rendre chaînable
   * @param {string} textIn si contient '\\' alors c'est une commande latex rendue par latexParCoordonnees()
   * @param {string} color
   * @param {number} opacity
   * @param {number} size (facteur d'agrandissement ou de réduction 1 par défaut)
   * @return {BoiteBuilder}
   */
  addTextIn({
    textIn,
    color,
    opacity,
    size,
    isLaTeX = false,
  }: {
    textIn: string
    color?: string
    opacity?: number
    size?: number
    isLaTeX?: boolean
  }) {
    if (typeof textIn !== 'string') {
      window.notify(
        'BoiteBuilder.addTextIn() requiert un texteIn de type string ',
        { textIn },
      )
    }
    if (textIn.length > 0) {
      this.text =
        isLaTeX || textIn.includes('\\')
          ? latex2d(
              textIn,
              (this.xMin + this.xMax) / 2,
              (this.yMin + this.yMax) / 2,
              {
                color: color ?? 'black',
                backgroundColor: '',
                letterSize: 'normalsize',
              },
            )
          : texteParPosition(
              textIn,
              (this.xMin + this.xMax) / 2,
              (this.yMin + this.yMax) / 2,
              0,
              color ?? 'black',
              size,
            )
      this.text.opacite = opacity ?? 1
    }
    return this
  }
}
