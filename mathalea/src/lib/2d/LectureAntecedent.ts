import { context } from '../../modules/context'
import { orangeMathalea, vertMathalea } from '../colors'
import { DomReadyActionElement } from '../customElements/DomReadyAction'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { texteParPosition } from './textes'
import { vide2d } from './Vide2d'

const lectureAntecedentAnimeeAction = 'lecture-antecedent-animee'

type LectureAntecedentAnimeePayload = {
  figureId: string
  x: number[]
  y: number
  pixelsParCm: number
  couleurVerticale: string
  couleurHorizontale: string
}

export type LectureAntecedentAnimeeOptions = {
  figureId: string
  x: number | number[]
  y: number
  pixelsParCm: number
  couleurVerticale?: string
  couleurHorizontale?: string
}

let lectureAntecedentAnimeeRegistered = false

function registerLectureAntecedentAnimee() {
  if (lectureAntecedentAnimeeRegistered) return
  lectureAntecedentAnimeeRegistered = true
  DomReadyActionElement.registerCallback<LectureAntecedentAnimeePayload>(
    lectureAntecedentAnimeeAction,
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
      const y = -payload.y * payload.pixelsParCm

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
          `[data-lecture-antecedent-animee="${payload.figureId}"]`,
        )
        existingGroup?.remove()

        const group = document.createElementNS(namespace, 'g')
        group.setAttribute('data-lecture-antecedent-animee', payload.figureId)
        group.setAttribute('aria-hidden', 'true')

        const yText = document.createElementNS(namespace, 'text')
        const labelIsOnLeft = payload.y > 0
        const labelOffset = 0.6 * payload.pixelsParCm
        const xLabelY = payload.y < 0 ? -labelOffset : labelOffset
        yText.textContent = `${payload.y}`
        yText.setAttribute('x', `${labelIsOnLeft ? -labelOffset : labelOffset}`)
        yText.setAttribute('y', `${y}`)
        yText.setAttribute('fill', payload.couleurHorizontale)
        yText.setAttribute('font-weight', '700')
        yText.setAttribute('font-size', `${0.6 * payload.pixelsParCm}`)
        yText.setAttribute('text-anchor', labelIsOnLeft ? 'end' : 'start')
        yText.setAttribute('dominant-baseline', 'middle')
        yText.setAttribute('opacity', '0')
        const animateYText = document.createElementNS(namespace, 'animate')
        animateYText.setAttribute('attributeName', 'opacity')
        animateYText.setAttribute('from', '0')
        animateYText.setAttribute('to', '1')
        animateYText.setAttribute('dur', '0.35s')
        animateYText.setAttribute('begin', 'indefinite')
        animateYText.setAttribute('fill', 'freeze')
        animateYText.setAttribute('data-delay', '1250')
        yText.appendChild(animateYText)
        group.appendChild(yText)

        xValues.forEach((xValue, index) => {
          const x = xValue * payload.pixelsParCm
          const horizontalLine = createAnimatedLine(
            0,
            y,
            x,
            y,
            payload.couleurHorizontale,
            150 + 300 * index,
          )
          const verticalLine = createAnimatedLine(
            x,
            y,
            x,
            0,
            payload.couleurVerticale,
            800 + 300 * index,
          )
          group.appendChild(verticalLine)
          group.appendChild(horizontalLine)

          const valueLabel = document.createElementNS(namespace, 'text')
          valueLabel.textContent = `${xValue}`
          valueLabel.setAttribute('x', `${x}`)
          valueLabel.setAttribute('y', `${xLabelY}`)
          valueLabel.setAttribute('fill', payload.couleurVerticale)
          valueLabel.setAttribute('font-weight', '700')
          valueLabel.setAttribute('font-size', `${0.6 * payload.pixelsParCm}`)
          valueLabel.setAttribute('text-anchor', 'middle')
          valueLabel.setAttribute('dominant-baseline', 'hanging')
          valueLabel.setAttribute('opacity', '0')
          const animateValueLabel = document.createElementNS(
            namespace,
            'animate',
          )
          animateValueLabel.setAttribute('attributeName', 'opacity')
          animateValueLabel.setAttribute('from', '0')
          animateValueLabel.setAttribute('to', '1')
          animateValueLabel.setAttribute('dur', '0.35s')
          animateValueLabel.setAttribute('begin', 'indefinite')
          animateValueLabel.setAttribute('fill', 'freeze')
          animateValueLabel.setAttribute('data-delay', `${1250 + 200 * index}`)
          valueLabel.appendChild(animateValueLabel)
          group.appendChild(valueLabel)
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
      const hasAntecedent = xValues.length > 0
      button.textContent = hasAntecedent ? 'Revoir' : 'Aucun antécédent'
      button.disabled = !hasAntecedent
      button.className =
        'ml-3 rounded-md border border-coopmaths-action px-3 py-1 text-sm font-semibold text-coopmaths-action enabled:hover:bg-coopmaths-action enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
      button.setAttribute(
        'aria-label',
        hasAntecedent
          ? "Revoir l'animation de lecture"
          : 'Aucun antécédent à afficher',
      )
      if (hasAntecedent) button.addEventListener('click', playAnimation)
      element.replaceChildren(button)
      if (hasAntecedent) playAnimation()

      return () => {
        button.removeEventListener('click', playAnimation)
        svg
          .querySelector(
            `[data-lecture-antecedent-animee="${payload.figureId}"]`,
          )
          ?.remove()
        element.replaceChildren()
      }
    },
  )
}

export function lectureAntecedentAnimee({
  figureId,
  x,
  y,
  pixelsParCm,
  couleurVerticale = orangeMathalea,
  couleurHorizontale = vertMathalea,
}: LectureAntecedentAnimeeOptions): string {
  registerLectureAntecedentAnimee()
  return DomReadyActionElement.create({
    action: lectureAntecedentAnimeeAction,
    payload: {
      figureId,
      x: Array.isArray(x) ? x : [x],
      y,
      pixelsParCm,
      couleurVerticale,
      couleurHorizontale,
    },
  })
}

export class LectureAntecedent extends ObjetMathalea2D {
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
    xscale: number,
    yscale: number,
    color = 'black',
    textOrd: string,
    textAbs: string,
  ) {
    super()
    //
    this.x = x
    this.y = y
    this.xscale = xscale
    this.yscale = yscale
    // if (textAbs == null) textAbs = this.x.toString().replace('.', ',')
    // if (textOrd == null) textOrd = this.y.toString().replace('.', ',')
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
      M.x === X.x && M.y === X.y ? vide2d() : segment(M, X, this.stringColor)
    const Sy =
      M.x === Y.x && M.y === Y.y ? vide2d() : segment(Y, M, this.stringColor)
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
      M.x === X.x && M.y === X.y ? vide2d() : segment(M, X, this.stringColor)
    const Sy =
      M.x === Y.x && M.y === Y.y ? vide2d() : segment(Y, M, this.stringColor)
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
    const M = pointAbstrait(x0, y0)
    const X = pointAbstrait(x0, 0)
    const Y = pointAbstrait(0, y0)
    const Sx =
      M.x === X.x && M.y === X.y ? vide2d() : segment(M, X, this.stringColor)
    const Sy =
      M.x === Y.x && M.y === Y.y ? vide2d() : segment(Y, M, this.stringColor)
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
    const M = pointAbstrait(x0, y0)
    const X = pointAbstrait(x0, 0)
    const Y = pointAbstrait(0, y0)
    const Sx =
      M.x === X.x && M.y === X.y ? vide2d() : segment(M, X, this.stringColor)
    const Sy =
      M.x === Y.x && M.y === Y.y ? vide2d() : segment(Y, M, this.stringColor)
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

export function lectureAntecedent(
  x: number,
  y: number,
  xscale: number,
  yscale: number,
  color = 'black',
  textOrd: string,
  textAbs: string,
): LectureAntecedent {
  return new LectureAntecedent(x, y, xscale, yscale, color, textOrd, textAbs)
}
