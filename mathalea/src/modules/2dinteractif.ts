import { colorToLatexOrHTML } from '../lib/2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../lib/2d/PointAbstrait'
import { Polygone, polygone } from '../lib/2d/polygones'
import { orangeMathalea, vertMathalea } from '../lib/colors'
import {
  registerFractionCliquable,
  type FractionCliquablePartData,
} from '../lib/customElements/FractionCliquableElement'
import { context } from './context'

export class FractionCliquable extends ObjetMathalea2D {
  private numeroExercice?: number
  private questionIndex?: number
  private rectangles: Array<
    FractionCliquablePartData & {
      polygone: Polygone
      bordure: Polygone
      couleur: string
      hachures: boolean | string
      epaisseurDesHachures?: number
    }
  > = []

  constructor(
    x: number,
    y: number,
    unites: number,
    denominateur: number,
    options: {
      longueur?: number
      ecart?: number
      hauteur?: number
      liste1?: number[]
      liste2?: number[]
      couleur1?: string
      couleur2?: string
      hachures1?: boolean
      hachures2?: boolean
      couleur?: string
      cliquable?: boolean
      numeroExercice?: number
      questionIndex?: number
    } = {},
  ) {
    super()
    if (!options) options = {}
    this.numeroExercice = options.numeroExercice
    this.questionIndex = options.questionIndex
    const longueur = options.longueur ?? 4
    const ecart = options.ecart ?? 1
    const hauteur = options.hauteur ?? 1
    const liste1 = options.liste1 ?? []
    const liste2 = options.liste2 ?? []
    let couleur1 = options.couleur1 ?? orangeMathalea
    let couleur2 = options.couleur2 ?? vertMathalea
    if (!context.isHtml) {
      couleur1 = options.couleur1 ?? 'gray'
      couleur2 = options.couleur2 ?? 'lightgray'
    }
    const hachures1 = options.hachures1 ? 'north east lines' : false
    const hachures2 = options.hachures2 ? 'dots' : false
    const cliquable = options.cliquable !== undefined ? options.cliquable : true
    const couleurInitiale =
      options.couleur ?? (liste1.length === 0 ? couleur1 : 'white')
    const couleur =
      cliquable && couleurInitiale === 'none' ? orangeMathalea : couleurInitiale
    let rectangleIndex = 0
    for (let i = 0; i < unites; i++) {
      const origine = pointAbstrait(x + i * (longueur + ecart), y)
      for (let j = 0; j < denominateur; j++) {
        const x1 = origine.x + (j * longueur) / denominateur
        const x2 = origine.x + ((j + 1) * longueur) / denominateur
        if (liste1.includes(i * denominateur + j + 1)) {
          this.addRectangle(rectangleIndex++, x1, y, x2, y + hauteur, {
            cliquable,
            etat: true,
            couleur: couleur1,
            hachures: hachures1,
          })
        } else if (liste2.includes(i * denominateur + j + 1)) {
          this.addRectangle(rectangleIndex++, x1, y, x2, y + hauteur, {
            cliquable,
            etat: true,
            couleur: couleur2,
            hachures: hachures2,
          })
        } else {
          this.addRectangle(rectangleIndex++, x1, y, x2, y + hauteur, {
            cliquable,
            couleur,
            etat: false,
          })
        }
      }
    }
  }

  private addRectangle(
    index: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: {
      couleur: string
      cliquable: boolean
      hachures?: boolean | string
      etat: boolean
    },
  ) {
    const A = pointAbstrait(x1, y1)
    const B = pointAbstrait(x2, y1)
    const C = pointAbstrait(x2, y2)
    const D = pointAbstrait(x1, y2)
    const rectangle = polygone(A, B, C, D)
    const bordure = polygone(A, B, C, D)
    rectangle.couleurDeRemplissage = colorToLatexOrHTML(options.couleur)
    rectangle.couleurDesHachures = colorToLatexOrHTML('black')
    rectangle.hachures = options.hachures ?? false
    rectangle.epaisseurDesHachures = 4
    rectangle.epaisseur = 0
    bordure.epaisseur = 1
    this.rectangles.push({
      id: `fractionCliquable${this.id}R${index}`,
      etat: options.etat,
      cliquable: options.cliquable,
      out: { opacity: '0' },
      over: { opacity: '0.2' },
      click: { opacity: '1' },
      polygone: rectangle,
      bordure,
      couleur: options.couleur,
      hachures: options.hachures ?? false,
    })
  }

  svg(coeff: number) {
    registerFractionCliquable({
      id: `fractionCliquable${this.id}`,
      numeroExercice: this.numeroExercice,
      questionIndex: this.questionIndex,
      parts: this.rectangles.map(
        ({ id, etat, cliquable, out, over, click }) => ({
          id,
          etat,
          cliquable,
          out,
          over,
          click,
        }),
      ),
    })
    return this.rectangles
      .map((rectangle) => {
        return `<g id="${rectangle.id}">\n${rectangle.polygone.svg(coeff)}\n</g>\n${rectangle.bordure.svg(coeff)}`
      })
      .join('\n')
  }

  get value() {
    return JSON.stringify(
      this.rectangles.map(({ id, etat }) => ({
        id,
        etat,
      })),
    )
  }

  tikz() {
    return this.rectangles
      .map((rectangle) => {
        if (rectangle.etat) {
          rectangle.bordure.couleurDeRemplissage = colorToLatexOrHTML(
            rectangle.couleur,
          )
        }
        rectangle.bordure.couleurDesHachures = colorToLatexOrHTML('black')
        rectangle.bordure.hachures = rectangle.hachures
        rectangle.bordure.epaisseurDesHachures =
          rectangle.epaisseurDesHachures ?? 4
        return rectangle.bordure.tikz()
      })
      .join('\n')
  }
}

export function fractionCliquable(
  x: number,
  y: number,
  unites: number,
  denominateur: number,
  options: {
    longueur?: number
    ecart?: number
    hauteur?: number
    liste1?: number[]
    liste2?: number[]
    couleur1?: string
    couleur2?: string
    hachures1?: boolean
    hachures2?: boolean
    couleur?: string
    cliquable?: boolean
    numeroExercice?: number
    questionIndex?: number
  },
) {
  return new FractionCliquable(x, y, unites, denominateur, options)
}
