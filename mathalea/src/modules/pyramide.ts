/* eslint-disable no-unmodified-loop-condition */
import { BoiteBuilder } from '../lib/2d/BoiteBuilder'
import { Complexe } from '../lib/mathFonctions/Complexe'
import { choice } from '../lib/outils/arrayOutils'
import { stringNombre } from '../lib/outils/texNombre'
import type { NestedObjetMathalea2dArray } from '../types/2d'
import type FractionEtendue from './FractionEtendue'
import { fraction } from './fractions'
import { randint } from './outils'

/**
 * @author Jean-claude Lhote
 */
export default class Pyramide {
  operation: '+' | '*'
  nombreEtages: number
  valeurs: (number | FractionEtendue | Complexe)[][]
  isVisible: boolean[][]
  fractionOn: boolean
  complexOn: boolean

  /**
   *
   * @param {object} param0
   * @param {string} param0.operation
   * @param {number} param0.nombreEtages
   * @param {number[]|number[][]} param0.rangeData
   * @param {number[]}  param0.exclusions
   * @param {boolean} param0.fractionOn
   */
  constructor({
    operation = '+',
    nombreEtages = 3,
    rangeData = [1, 10],
    exclusions = [],
    fractionOn = false,
    complexOn = false,
  }: {
    operation: '+' | '*'
    nombreEtages: number
    rangeData: [number, number] | [[number, number], [number, number]]
    exclusions: number[]
    fractionOn: boolean
    complexOn?: boolean
  }) {
    this.operation = operation
    this.nombreEtages = nombreEtages
    this.valeurs = []
    this.isVisible = []
    this.fractionOn = fractionOn
    this.complexOn = !!complexOn
    const assureHasNegative =
      rangeData instanceof Array &&
      typeof rangeData[0] === 'number' &&
      typeof rangeData[1] === 'number'
        ? rangeData[0] < 0 && rangeData[1] > 0
        : rangeData instanceof Array &&
          rangeData.length === 2 &&
          rangeData[0] instanceof Array &&
          rangeData[1] instanceof Array &&
          typeof rangeData[0][0] === 'number' &&
          typeof rangeData[0][1] === 'number' &&
          typeof rangeData[1][0] === 'number' &&
          typeof rangeData[1][1] === 'number' &&
          rangeData[0][0] < 0 &&
          rangeData[0][1] > 0
    let compteur = 0
    do {
      for (let y = nombreEtages - 1; y >= 0; y--) {
        this.valeurs[y] = []
        this.isVisible[y] = []
        for (let x = 0, num, den; x <= y; x++) {
          if (y === nombreEtages - 1) {
            if (this.complexOn) {
              // Génération de complexes aléatoires (parties réelles et imaginaires)
              const rd = rangeData as [number, number]
              const re = this.fractionOn
                ? fraction(randint(rd[0], rd[1], exclusions), choice([1, 2, 3]))
                : randint(rd[0], rd[1], exclusions)
              const im = this.fractionOn
                ? fraction(randint(rd[0], rd[1], exclusions), choice([1, 2, 3]))
                : randint(rd[0], rd[1], exclusions)
              this.valeurs[y][x] = new Complexe(re, im)
            } else if (this.fractionOn) {
              const rd = rangeData as [[number, number], [number, number]]
              den = choice(rd[1])
              num = randint(rd[0][0], rd[0][1], exclusions.concat([den]))
              this.valeurs[y][x] = fraction(num, den).simplifie()
            } else {
              const rd = rangeData as [number, number]
              this.valeurs[y][x] = randint(rd[0], rd[1], exclusions)
            }
          } else {
            switch (operation) {
              case '+':
                if (this.complexOn) {
                  this.valeurs[y][x] = (this.valeurs[y + 1][x] as Complexe).add(
                    this.valeurs[y + 1][x + 1] as Complexe,
                  )
                } else if (this.fractionOn) {
                  this.valeurs[y][x] = (
                    this.valeurs[y + 1][x] as FractionEtendue
                  )
                    .sommeFraction(
                      this.valeurs[y + 1][x + 1] as FractionEtendue,
                    )
                    .simplifie()
                } else {
                  this.valeurs[y][x] =
                    Number(this.valeurs[y + 1][x]) +
                    Number(this.valeurs[y + 1][x + 1])
                }
                break
              case '*':
                if (this.complexOn) {
                  this.valeurs[y][x] = (this.valeurs[y + 1][x] as Complexe).mul(
                    this.valeurs[y + 1][x + 1] as Complexe,
                  )
                } else if (this.fractionOn) {
                  this.valeurs[y][x] = (
                    this.valeurs[y + 1][x] as FractionEtendue
                  )
                    .produitFraction(
                      this.valeurs[y + 1][x + 1] as FractionEtendue,
                    )
                    .simplifie()
                } else {
                  this.valeurs[y][x] =
                    Number(this.valeurs[y + 1][x]) *
                    Number(this.valeurs[y + 1][x + 1])
                }
                break
            }
          }
          this.isVisible[y][x] = false
        }
      }
      // eslint-disable no-unmodified-loop-condition
    } while (
      (compteur++ < 100 &&
        !this.valeurs.some((etage) => etage.some((val) => Number(val) < 0)) &&
        assureHasNegative) ||
      (this.valeurs.some((etage) => etage.some((val) => Number(val) < 0)) &&
        !assureHasNegative)
    )
  }

  visible(x: number, y: number) {
    return this.isVisible[y][x]
  }

  estSolvable(x: number, y: number): boolean {
    if (this.visible(x, y)) return true
    else if (y === this.nombreEtages - 1) return false
    else return this.estSolvable(x, y + 1) && this.estSolvable(x + 1, y + 1)
  }

  choisisUneCaseNonVisible(): [number, number] {
    let x, y
    let trouve = false
    let cpt = 0
    do {
      cpt++
      y = randint(1, this.nombreEtages - 1)
      x = randint(0, y)
      let seul = true
      for (let i = 0; i < y; i++) {
        if (i !== x && !this.visible(i, y)) seul = false
      }
      if (seul && cpt < 20) trouve = false
      else trouve = !this.visible(x, y)
    } while (!trouve)
    return [x, y]
  }

  aleatoirise() {
    let solvable = false
    do {
      const [x, y] = this.choisisUneCaseNonVisible()
      this.isVisible[y][x] = true
      solvable = this.estSolvable(0, 0)
    } while (!solvable)
  }

  representeMoi(xO = 0, yO = 0): NestedObjetMathalea2dArray {
    const objets = []
    const hCase = this.fractionOn ? 2 : 1.5
    const wCase = this.complexOn ? 6 : 4
    for (let y = this.nombreEtages; y > 0; y--) {
      for (let x = 0; x < y; x++) {
        objets.push(
          new BoiteBuilder({
            xMin: xO + x * wCase + (this.nombreEtages - y) * (wCase / 2),
            yMin: yO + (this.nombreEtages - y) * hCase,
            xMax:
              xO + x * wCase + wCase + (this.nombreEtages - y) * (wCase / 2),
            yMax: yO + (1 + this.nombreEtages - y) * hCase,
          })
            .addTextIn({
              isLaTeX: true,
              textIn: !this.isVisible[y - 1][x]
                ? ''
                : this.fractionOn
                  ? (this.valeurs[y - 1][x] as FractionEtendue)
                      .texFractionSimplifiee
                  : this.complexOn
                    ? (this.valeurs[y - 1][x] as Complexe).tex()
                    : stringNombre(Number(this.valeurs[y - 1][x]), 0),
              opacity: 1,
            })
            .render(),
        )
      }
    }
    return objets
  }
}
