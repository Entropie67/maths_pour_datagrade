import { context } from '../../modules/context'
import { orangeMathalea, vertMathalea } from '../colors'
import { DomReadyActionElement } from '../customElements/DomReadyAction'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { texteParPosition } from './textes'
import { vide2d } from './Vide2d'

const lectureImageAnimeeAction = 'lecture-image-animee'

type LectureImageAnimeePayload = {
  figureId: string
  x: number | number[]
  y: number | number[]
  pixelsParCm: number
  couleurVerticale: string
  couleurHorizontale: string
}

export type LectureImageAnimeeOptions = {
  figureId: string
  x: number | number[]
  y: number | number[]
  pixelsParCm: number
  couleurVerticale?: string
  couleurHorizontale?: string
}

let lectureImageAnimeeRegistered = false

function registerLectureImageAnimee() {
  if (lectureImageAnimeeRegistered) return
  lectureImageAnimeeRegistered = true
  DomReadyActionElement.registerCallback<LectureImageAnimeePayload>(
    lectureImageAnimeeAction,
    ({ element, payload }) => {
      const previousElement = element.previousElementSibling
      const svg =
        previousElement instanceof SVGSVGElement &&
        previousElement.id === payload.figureId
          ? previousElement
          : document.getElementById(payload.figureId)
      if (!(svg instanceof SVGSVGElement)) return
      const namespace = 'http://www.w3.org/2000/svg'
      const xValues = Array.isArray(payload.x) ? payload.x : [payload.x]
      const yValues = Array.isArray(payload.y) ? payload.y : [payload.y]

      const createAnimatedLine = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string,
        delay: number,
      ) => {
        const line = document.createElementNS(namespace, 'line')
        line.setAttribute('x1', `${x1}`)
        line.setAttribute('y1', `${y1}`)
        line.setAttribute('x2', `${x1}`)
        line.setAttribute('y2', `${y1}`)
        line.setAttribute('stroke', color)
        line.setAttribute('stroke-width', '4')
        line.setAttribute('stroke-dasharray', '10 7')
        line.setAttribute('stroke-linecap', 'round')
        line.setAttribute('opacity', '1')
        const animateX = document.createElementNS(namespace, 'animate')
        animateX.setAttribute('attributeName', 'x2')
        animateX.setAttribute('from', `${x1}`)
        animateX.setAttribute('to', `${x2}`)
        animateX.setAttribute('dur', '0.45s')
        animateX.setAttribute('begin', 'indefinite')
        animateX.setAttribute('fill', 'freeze')
        animateX.setAttribute('data-delay', `${delay}`)
        const animateY = document.createElementNS(namespace, 'animate')
        animateY.setAttribute('attributeName', 'y2')
        animateY.setAttribute('from', `${y1}`)
        animateY.setAttribute('to', `${y2}`)
        animateY.setAttribute('dur', '0.45s')
        animateY.setAttribute('begin', 'indefinite')
        animateY.setAttribute('fill', 'freeze')
        animateY.setAttribute('data-delay', `${delay}`)
        line.appendChild(animateX)
        line.appendChild(animateY)
        return line
      }
      const playAnimation = () => {
        const existingGroup = svg.querySelector(
          `[data-lecture-image-animee="${payload.figureId}"]`,
        )
        existingGroup?.remove()

        const group = document.createElementNS(namespace, 'g')
        group.setAttribute('data-lecture-image-animee', payload.figureId)
        group.setAttribute('aria-hidden', 'true')
        xValues.forEach((xValue, index) => {
          const x = xValue * payload.pixelsParCm
          const y = -yValues[index] * payload.pixelsParCm
          const antecedentText = document.createElementNS(namespace, 'text')
          antecedentText.textContent = `${xValues[index]}`
          antecedentText.setAttribute('x', `${x}`)
          antecedentText.setAttribute(
            'y',
            `${yValues[index] <= 0 ? 0.7 * payload.pixelsParCm - 45 : 0.7 * payload.pixelsParCm}`,
          )
          antecedentText.setAttribute('fill', payload.couleurVerticale)
          antecedentText.setAttribute('font-weight', '700')
          antecedentText.setAttribute(
            'font-size',
            `${0.6 * payload.pixelsParCm}`,
          )
          antecedentText.setAttribute('text-anchor', 'middle')
          antecedentText.setAttribute('dominant-baseline', 'hanging')
          group.appendChild(antecedentText)

          group.appendChild(
            createAnimatedLine(x, 0, x, y, payload.couleurVerticale, 150),
          )
          group.appendChild(
            createAnimatedLine(x, y, 0, y, payload.couleurHorizontale, 800),
          )

          const text = document.createElementNS(namespace, 'text')
          const labelIsOnLeft = xValues[index] > 0
          const labelOffset = 0.35 * payload.pixelsParCm
          text.textContent = `${yValues[index]}`
          text.setAttribute(
            'x',
            `${labelIsOnLeft ? -labelOffset : labelOffset}`,
          )
          text.setAttribute('y', `${y}`)
          text.setAttribute('fill', payload.couleurHorizontale)
          text.setAttribute('font-weight', '700')
          text.setAttribute('font-size', `${0.6 * payload.pixelsParCm}`)
          text.setAttribute('text-anchor', labelIsOnLeft ? 'end' : 'start')
          text.setAttribute('dominant-baseline', 'middle')
          text.setAttribute('opacity', '0')
          const animateText = document.createElementNS(namespace, 'animate')
          animateText.setAttribute('attributeName', 'opacity')
          animateText.setAttribute('from', '0')
          animateText.setAttribute('to', '1')
          animateText.setAttribute('dur', '0.35s')
          animateText.setAttribute('begin', 'indefinite')
          animateText.setAttribute('fill', 'freeze')
          animateText.setAttribute('data-delay', '1250')
          text.appendChild(animateText)
          group.appendChild(text)
        })

        svg.appendChild(group)
        group
          .querySelectorAll<SVGAnimateElement>('animate[data-delay]')
          .forEach((animate) => {
            const delay = Number(animate.getAttribute('data-delay') ?? 0)
            window.setTimeout(() => animate.beginElement(), delay)
          })
      }

      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = 'Revoir'
      button.className =
        'ml-3 rounded-md border border-coopmaths-action px-3 py-1 text-sm font-semibold text-coopmaths-action hover:bg-coopmaths-action hover:text-white'
      button.setAttribute('aria-label', "Revoir l'animation de lecture")
      button.addEventListener('click', playAnimation)
      element.replaceChildren(button)
      playAnimation()

      return () => {
        button.removeEventListener('click', playAnimation)
        svg
          .querySelector(`[data-lecture-image-animee="${payload.figureId}"]`)
          ?.remove()
        element.replaceChildren()
      }
    },
  )
}

export function lectureImageAnimee({
  figureId,
  x,
  y,
  pixelsParCm,
  couleurVerticale = vertMathalea,
  couleurHorizontale = orangeMathalea,
}: LectureImageAnimeeOptions): string {
  registerLectureImageAnimee()
  return DomReadyActionElement.create({
    action: lectureImageAnimeeAction,
    payload: {
      figureId,
      x,
      y,
      pixelsParCm,
      couleurVerticale,
      couleurHorizontale,
    },
  })
}

export class LectureImage extends ObjetMathalea2D {
  x: number
  y: number
  xscale: number
  yscale: number
  textAbs: string
  textOrd: string
  stringColor: string
  constructor(
    x: number,
    y: number,
    xscale = 1,
    yscale = 1,
    color = 'red',
    textAbs = '',
    textOrd = '',
  ) {
    super()
    this.x = x
    this.y = y
    this.xscale = xscale
    this.yscale = yscale
    // if (textAbs === '') textAbs = x.toString()
    // if (textOrd === '') textOrd = y.toString()
    this.textAbs = textAbs
    this.textOrd = textOrd
    this.stringColor = color
    this.bordures = [0, 0, 0, 0]
  }

  svg(coeff: number) {
    const x0 = this.x / this.xscale
    const y0 = this.y / this.yscale
    const M = pointAbstrait(x0, y0)
    const X = pointAbstrait(x0, 0)
    const Y = pointAbstrait(0, y0)
    const Sx =
      M.x === X.x && M.y === X.y ? vide2d() : segment(X, M, this.stringColor)
    const Sy =
      M.x === Y.x && M.y === Y.y ? vide2d() : segment(M, Y, this.stringColor)
    // vide2D n'a pas de styleExtremites ni pointilles mais on s'en fiche car on ne l'affiche pas : son svg() est vide
    Sx.styleExtremites = '->'
    Sy.styleExtremites = '->'
    Sx.pointilles = 5
    Sy.pointilles = 5
    return (
      '\t\n' +
      Sx.svg(coeff) +
      '\t\n' +
      Sy.svg(coeff) +
      '\t\n' +
      (this.textAbs != null
        ? texteParPosition(
            this.textAbs,
            x0,
            (-1 * 20) / coeff,
            0,
            this.stringColor,
          ).svg(coeff)
        : '') +
      '\t\n' +
      (this.textOrd != null
        ? texteParPosition(
            this.textOrd,
            (-1 * 20) / coeff,
            y0,
            0,
            this.stringColor,
          ).svg(coeff)
        : '')
    )
  }

  tikz() {
    const x0 = this.x / this.xscale
    const y0 = this.y / this.yscale
    const M = pointAbstrait(x0, y0)
    const X = pointAbstrait(x0, 0)
    const Y = pointAbstrait(0, y0)
    const Sx =
      M.x === X.x && M.y === X.y ? vide2d() : segment(X, M, this.stringColor)
    const Sy =
      M.x === Y.x && M.y === Y.y ? vide2d() : segment(M, Y, this.stringColor)
    // vide2D n'a pas de styleExtremites ni pointilles mais on s'en fiche car on ne l'affiche pas : son svg() est vide
    Sx.styleExtremites = '->'
    Sy.styleExtremites = '->'
    Sx.pointilles = 5
    Sy.pointilles = 5
    return (
      '\t' +
      Sx.tikz() +
      '\t' +
      Sy.tikz() +
      '\t' +
      texteParPosition(
        this.textAbs,
        x0,
        -1 / context.scale,
        0,
        this.stringColor,
      ).tikz() +
      '\t' +
      texteParPosition(
        this.textOrd,
        -1 / context.scale,
        y0,
        0,
        this.stringColor,
      ).tikz()
    )
  }

  svgml(coeff: number, amp: number) {
    const x0 = this.x / this.xscale
    const y0 = this.y / this.yscale
    const M = pointAbstrait(this.x, this.y)
    const X = pointAbstrait(x0, 0)
    const Y = pointAbstrait(0, y0)
    const Sx =
      M.x === X.x && M.y === X.y ? vide2d() : segment(X, M, this.stringColor)
    const Sy =
      M.x === Y.x && M.y === Y.y ? vide2d() : segment(M, Y, this.stringColor)
    // vide2D n'a pas de styleExtremites ni pointilles mais on s'en fiche car on ne l'affiche pas : son svg() est vide
    Sx.styleExtremites = '->'
    Sy.styleExtremites = '->'
    Sx.pointilles = 5
    Sy.pointilles = 5
    return (
      '\t\n' +
      Sx.svgml(coeff, amp) +
      '\t\n' +
      Sy.svgml(coeff, amp) +
      '\t\n' +
      texteParPosition(
        this.textAbs,
        x0,
        (-1 * 20) / coeff,
        0,
        this.stringColor,
      ).svg(coeff) +
      '\t\n' +
      texteParPosition(
        this.textOrd,
        (-1 * 20) / coeff,
        y0,
        0,
        this.stringColor,
      ).svg(coeff)
    )
  }

  tikzml(amp: number) {
    const x0 = this.x / this.xscale
    const y0 = this.y / this.yscale
    const M = pointAbstrait(this.x, this.y)
    const X = pointAbstrait(x0, 0)
    const Y = pointAbstrait(0, y0)
    const Sx =
      M.x === X.x && M.y === X.y ? vide2d() : segment(X, M, this.stringColor)
    const Sy =
      M.x === Y.x && M.y === Y.y ? vide2d() : segment(M, Y, this.stringColor)
    // vide2D n'a pas de styleExtremites ni pointilles mais on s'en fiche car on ne l'affiche pas : son svg() est vide
    Sx.styleExtremites = '->'
    Sy.styleExtremites = '->'
    Sx.pointilles = 5
    Sy.pointilles = 5
    return (
      '\t' +
      Sx.tikzml(amp) +
      '\t' +
      Sy.tikzml(amp) +
      '\t' +
      texteParPosition(
        this.textAbs,
        x0,
        -1 / context.scale,
        0,
        this.stringColor,
      ).tikz() +
      '\t' +
      texteParPosition(
        this.textOrd,
        -1 / context.scale,
        y0,
        0,
        this.stringColor,
      ).tikz()
    )
  }
}
/**
 */
export function lectureImage(
  x: number,
  y: number,
  xscale = 1,
  yscale = 1,
  color = 'red',
  textAbs = '',
  textOrd = '',
): LectureImage {
  return new LectureImage(x, y, xscale, yscale, color, textAbs, textOrd)
}
