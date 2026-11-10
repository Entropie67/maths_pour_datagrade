import { orangeMathalea } from '../colors'
import { DomReadyActionElement } from '../customElements/DomReadyAction'

const penteAffineAnimeeAction = 'pente-affine-animee'

type PenteAffineAnimeePayload = {
  figureId: string
  b: number
  numerateur: number
  denominateur: number
  pixelsParCm: number
  couleur: string
  focusFigure: boolean
}

export type PenteAffineAnimeeOptions = {
  figureId: string
  b: number
  numerateur: number
  denominateur: number
  pixelsParCm: number
  couleur?: string
  focusFigure?: boolean
}

let penteAffineAnimeeRegistered = false

function registerPenteAffineAnimee() {
  if (penteAffineAnimeeRegistered) return
  penteAffineAnimeeRegistered = true

  DomReadyActionElement.registerCallback<PenteAffineAnimeePayload>(
    penteAffineAnimeeAction,
    ({ element, payload }) => {
      const svg = document.getElementById(payload.figureId)
      if (!(svg instanceof SVGSVGElement)) return

      const namespace = 'http://www.w3.org/2000/svg'
      const color = payload.couleur
      const coeff = payload.pixelsParCm
      const x0 = 0
      const y0 = -payload.b * coeff
      const x1 = payload.denominateur * coeff
      const y1 = y0
      const y2 = -(payload.b + payload.numerateur) * coeff

      const createText = (
        textContent: string,
        x: number,
        y: number,
        anchor: 'start' | 'middle' | 'end',
      ) => {
        const text = document.createElementNS(namespace, 'text')
        text.textContent = textContent
        text.setAttribute('x', `${x}`)
        text.setAttribute('y', `${y}`)
        text.setAttribute('fill', color)
        text.setAttribute('font-weight', '700')
        text.setAttribute('font-size', `${0.55 * coeff}`)
        text.setAttribute('text-anchor', anchor)
        text.setAttribute('dominant-baseline', 'middle')
        return text
      }

      const createAnimatedLine = (
        xStart: number,
        yStart: number,
        xEnd: number,
        yEnd: number,
        delay: number,
      ) => {
        const line = document.createElementNS(namespace, 'line')
        line.setAttribute('x1', `${xStart}`)
        line.setAttribute('y1', `${yStart}`)
        line.setAttribute('x2', `${xStart}`)
        line.setAttribute('y2', `${yStart}`)
        line.setAttribute('stroke', color)
        line.setAttribute('stroke-width', '4')
        line.setAttribute('stroke-dasharray', '10 7')
        line.setAttribute('stroke-linecap', 'round')

        const animateX = document.createElementNS(namespace, 'animate')
        animateX.setAttribute('attributeName', 'x2')
        animateX.setAttribute('from', `${xStart}`)
        animateX.setAttribute('to', `${xEnd}`)
        animateX.setAttribute('dur', '0.55s')
        animateX.setAttribute('begin', 'indefinite')
        animateX.setAttribute('fill', 'freeze')
        animateX.setAttribute('data-delay', `${delay}`)

        const animateY = document.createElementNS(namespace, 'animate')
        animateY.setAttribute('attributeName', 'y2')
        animateY.setAttribute('from', `${yStart}`)
        animateY.setAttribute('to', `${yEnd}`)
        animateY.setAttribute('dur', '0.55s')
        animateY.setAttribute('begin', 'indefinite')
        animateY.setAttribute('fill', 'freeze')
        animateY.setAttribute('data-delay', `${delay}`)

        line.appendChild(animateX)
        line.appendChild(animateY)
        return line
      }

      const playAnimation = () => {
        if (payload.focusFigure) {
          if (!svg.hasAttribute('tabindex')) svg.setAttribute('tabindex', '-1')
          svg.focus({ preventScroll: true })
          svg.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }

        svg
          .querySelector(`[data-pente-affine-animee="${payload.figureId}"]`)
          ?.remove()

        const group = document.createElementNS(namespace, 'g')
        group.setAttribute('data-pente-affine-animee', payload.figureId)
        group.setAttribute('aria-hidden', 'true')

        const point = document.createElementNS(namespace, 'circle')
        point.setAttribute('cx', `${x0}`)
        point.setAttribute('cy', `${y0}`)
        point.setAttribute('r', `${0.12 * coeff}`)
        point.setAttribute('fill', color)
        group.appendChild(point)

        group.appendChild(createText(`${payload.b}`, -0.35 * coeff, y0, 'end'))
        group.appendChild(createAnimatedLine(x0, y0, x1, y1, 250))
        group.appendChild(
          createText(
            `${payload.denominateur}`,
            (x0 + x1) / 2,
            y0 - 0.35 * coeff,
            'middle',
          ),
        )
        group.appendChild(createAnimatedLine(x1, y1, x1, y2, 950))
        group.appendChild(
          createText(
            `${payload.numerateur}`,
            x1 + 0.3 * coeff,
            (y1 + y2) / 2,
            'start',
          ),
        )

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
      button.textContent = 'Animation'
      button.className =
        'mt-2 rounded-md border border-coopmaths-action px-3 py-1 text-sm font-semibold text-coopmaths-action hover:bg-coopmaths-action hover:text-white'
      button.setAttribute(
        'aria-label',
        "Afficher l'animation du coefficient directeur",
      )
      button.addEventListener('click', playAnimation)
      element.replaceChildren(button)

      return () => {
        button.removeEventListener('click', playAnimation)
        svg
          .querySelector(`[data-pente-affine-animee="${payload.figureId}"]`)
          ?.remove()
        element.replaceChildren()
      }
    },
  )
}

export function penteAffineAnimee({
  figureId,
  b,
  numerateur,
  denominateur,
  pixelsParCm,
  couleur = orangeMathalea,
  focusFigure = true,
}: PenteAffineAnimeeOptions): string {
  registerPenteAffineAnimee()
  return DomReadyActionElement.create({
    action: penteAffineAnimeeAction,
    payload: {
      figureId,
      b,
      numerateur,
      denominateur,
      pixelsParCm,
      couleur,
      focusFigure,
    },
  })
}
