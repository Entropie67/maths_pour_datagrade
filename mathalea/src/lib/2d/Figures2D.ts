import { context } from '../../modules/context'
import { droite, type Droite } from './droites'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait, type PointAbstrait } from './PointAbstrait'
import { type Segment } from './segmentsVecteurs'
import {
  homothetie,
  rotation,
  symetrieAxiale,
  translation,
} from './transformations'
import { vecteur } from './Vecteur'

// ne fonctionne qu'avec cx=0 et cy=0... je ne sais pas pourquoi.
// Donc si cx = 0 et cy = 0, alors, il y a plein de code qui ne sert à rien.
function computeSymmetryMatrix(
  progress: number,
  angleDeg: number,
  cx: number,
  cy: number,
) {
  const angle = (angleDeg * Math.PI) / 180
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)

  const sy = 1 - 2 * progress

  const a = cosA * cosA + sinA * sinA * sy
  const b = cosA * sinA * (1 - sy)
  const c = cosA * sinA * (1 - sy)
  const d = sinA * sinA + cosA * cosA * sy

  const tx = cx - a * cx - c * cy
  const ty = cy - b * cx - d * cy

  return { a, b, c, d, tx, ty }
}

type ReflectionLoopAnimationConfig = {
  type: 'loop'
  id: string
  axe: Droite
  pixelsParCm: number
  onDirectionChange?: (direction: number) => void
}

type AutoReflectionAnimationConfig = {
  type: 'auto'
  id: string
  cx: number
  cy: number
  pixelsParCm: number
  symmetryAngles: number[]
}

type ReflectionAnimationConfig =
  ReflectionLoopAnimationConfig | AutoReflectionAnimationConfig

const reflectionAnimationElementTag = 'reflection-animation'
const reflectionAnimationConfigs = new Map<string, ReflectionAnimationConfig>()

function registerReflectionAnimation(config: ReflectionAnimationConfig): void {
  reflectionAnimationConfigs.set(config.id, config)
}

if (
  typeof customElements !== 'undefined' &&
  customElements.get(reflectionAnimationElementTag) === undefined
) {
  class ReflectionAnimationElement extends HTMLElement {
    private animationId = ''
    private config: ReflectionAnimationConfig | undefined
    private frameId: number | null = null
    private timeoutId: number | null = null
    private clipPath: SVGClipPathElement | null = null

    connectedCallback() {
      this.animationId = this.getAttribute('animation-id') ?? ''
      this.config = reflectionAnimationConfigs.get(this.animationId)
      if (!this.config) return
      this.setup()
    }

    disconnectedCallback() {
      this.cancelLoop()
      this.clipPath?.remove()
      this.clipPath = null
      reflectionAnimationConfigs.delete(this.animationId)
    }

    private setup(): void {
      if (!this.config) return
      const figure = document.getElementById(
        this.config.id,
      ) as SVGElement | null
      if (!figure) return
      if (this.config.type === 'loop') {
        this.setupLoopReflection(figure, this.config)
      } else {
        this.setupAutoReflection(figure, this.config)
      }
    }

    private setupLoopReflection(
      figure: SVGElement,
      config: ReflectionLoopAnimationConfig,
    ): void {
      const cx = (config.axe.x1 + config.axe.x2) / 2
      const cy = (config.axe.y1 + config.axe.y2) / 2
      this.createClipPath({
        figure,
        id: config.id,
        x: cx * config.pixelsParCm - 250,
        y: cy * config.pixelsParCm - 250,
        width: 500,
        height: 500,
      })

      let progress = 0
      let direction = 1
      const angleAxe =
        (Math.atan2(
          config.axe.y1 - config.axe.y2,
          config.axe.x2 - config.axe.x1,
        ) *
          180) /
        Math.PI

      const animateLoop = () => {
        progress += 0.004 * direction
        if (progress > 1) {
          progress = 1
          direction = -1
          config.onDirectionChange?.(direction)
          this.timeoutId = window.setTimeout(() => {
            this.frameId = window.requestAnimationFrame(animateLoop)
          }, 2000)
          return
        }
        if (progress < 0) {
          progress = 0
          direction = 1
          config.onDirectionChange?.(direction)
          this.timeoutId = window.setTimeout(() => {
            this.frameId = window.requestAnimationFrame(animateLoop)
          }, 200)
          return
        }
        this.applyReflectionFrame(
          figure,
          progress,
          angleAxe,
          cx * config.pixelsParCm,
          cy * config.pixelsParCm,
          5,
        )
        this.frameId = window.requestAnimationFrame(animateLoop)
      }

      animateLoop()
    }

    private setupAutoReflection(
      figure: SVGElement,
      config: AutoReflectionAnimationConfig,
    ): void {
      this.createClipPath({
        figure,
        id: config.id,
        x: config.cx * config.pixelsParCm,
        y: config.cy * config.pixelsParCm - 250,
        width: 500,
        height: 500,
      })

      if (config.symmetryAngles.length === 0) {
        figure.setAttribute('transform', 'scale(1,1)')
        return
      }

      let currentSymmetry = 0

      const animateSymmetry = (angleDeg: number, onComplete: () => void) => {
        const rect = document.getElementById(`clipingRect_${config.id}`)
        if (!rect) return
        rect.setAttribute('x', String(config.cx * config.pixelsParCm))
        rect.setAttribute('y', String(config.cy * config.pixelsParCm - 250))
        rect.setAttribute('width', '500')
        rect.setAttribute('height', '500')
        rect.setAttribute(
          'transform',
          `rotate(${angleDeg + 90}, ${config.cx * config.pixelsParCm}, ${
            config.cy * config.pixelsParCm
          })`,
        )

        let progress = 0
        const step = () => {
          progress += 0.004
          if (progress > 1) progress = 1
          this.applyReflectionFrame(
            figure,
            progress,
            angleDeg,
            config.cx * config.pixelsParCm,
            config.cy * config.pixelsParCm,
            2,
          )

          if (progress < 1) {
            this.frameId = window.requestAnimationFrame(step)
          } else {
            onComplete()
          }
        }

        this.frameId = window.requestAnimationFrame(step)
      }

      const next = () => {
        const angle = config.symmetryAngles[currentSymmetry]
        animateSymmetry(angle, () => {
          currentSymmetry = (currentSymmetry + 1) % config.symmetryAngles.length
          // Pause pour laisser le temps de regarder la figure initiale
          this.timeoutId = window.setTimeout(next, 2500)
        })
      }

      next()
    }

    private createClipPath({
      figure,
      id,
      x,
      y,
      width,
      height,
    }: {
      figure: SVGElement
      id: string
      x: number
      y: number
      width: number
      height: number
    }): void {
      this.clipPath?.remove()
      document.getElementById(`clip-${id}`)?.remove()
      const clipPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'clipPath',
      )
      const clipId = `clip-${id}`
      clipPath.setAttribute('id', clipId)
      const rect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect',
      )
      rect.setAttribute('id', `clipingRect_${id}`)
      rect.setAttribute('x', String(x))
      rect.setAttribute('y', String(y))
      rect.setAttribute('width', String(width))
      rect.setAttribute('height', String(height))
      clipPath.appendChild(rect)
      figure.appendChild(clipPath)
      figure.setAttribute('clip-path', `url(#${clipId})`)
      this.clipPath = clipPath
    }

    private applyReflectionFrame(
      figure: SVGElement,
      progress: number,
      angleDeg: number,
      cx: number,
      cy: number,
      shadowBlur: number,
    ): void {
      const shadowOffsetX =
        (1 - Math.abs(Math.cos(progress * Math.PI))) *
        5 *
        Math.cos((angleDeg * Math.PI) / 180)
      const shadowOffsetY =
        (1 - Math.abs(Math.cos(progress * Math.PI))) *
        5 *
        Math.sin((angleDeg * Math.PI) / 180)
      const shadowStyle = `drop-shadow(${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px rgb(80, 80, 80))`
      figure.setAttribute('style', `filter: ${shadowStyle}`)

      const { a, b, c, d, tx, ty } = computeSymmetryMatrix(
        progress,
        angleDeg,
        cx,
        cy,
      )
      figure.setAttribute(
        'transform',
        `matrix(${a} ${b} ${c} ${d} ${tx} ${ty})`,
      )
    }

    private cancelLoop(): void {
      if (this.frameId != null) {
        window.cancelAnimationFrame(this.frameId)
        this.frameId = null
      }
      if (this.timeoutId != null) {
        window.clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
    }
  }

  customElements.define(
    reflectionAnimationElementTag,
    ReflectionAnimationElement,
  )
}

export function reflectionAnimationMarkup(animationIds: string[]): string {
  if (!context.isHtml || animationIds.length === 0) return ''
  return [...new Set(animationIds)]
    .filter((id) => reflectionAnimationConfigs.has(id))
    .map(
      (id) =>
        `<${reflectionAnimationElementTag} animation-id="${id}"></${reflectionAnimationElementTag}>`,
    )
    .join('\n')
}
function rotatedBoundingBoxWithCenter(
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number,
  alpha: number,
  cx: number,
  cy: number,
): [number, number, number, number] {
  const w2 = (xmax - xmin) / 2
  const h2 = (ymax - ymin) / 2

  const cosA = Math.cos(alpha)
  const sinA = Math.sin(alpha)

  const dx = Math.abs(w2 * cosA) + Math.abs(h2 * sinA)
  const dy = Math.abs(w2 * sinA) + Math.abs(h2 * cosA)

  const centerX = (xmin + xmax) / 2
  const centerY = (ymin + ymax) / 2

  const rotatedCenterX = cosA * (centerX - cx) - sinA * (centerY - cy) + cx
  const rotatedCenterY = sinA * (centerX - cx) + cosA * (centerY - cy) + cy

  return [
    rotatedCenterX - dx,
    rotatedCenterY - dy,
    rotatedCenterX + dx,
    rotatedCenterY + dy,
  ]
}
// Classe de base pour les formes 2D sans les méthodes de transformation et d'animation de Figure2D
export class Shape2D extends ObjetMathalea2D {
  codeSvg: string
  codeTikz: string
  x: number
  y: number
  angle: number
  scale: { x: number; y: number }
  width: number // laargeur en cm
  height: number // hauteur en cm
  pixelsParCm: number
  bordures: [number, number, number, number] // [xmin, ymin, xmax, ymax]
  opacite = 1
  constructor({
    name = '',
    codeSvg,
    codeTikz,
    x = 0,
    y = 0,
    angle = 0,
    scale = { x: 1, y: 1 },
    width,
    height,
    pixelsParCm = context.pixelsParCm,
    opacite = 1,
    bordures,
  }: {
    name?: string
    codeSvg: string
    codeTikz: string
    x?: number
    y?: number
    angle?: number
    scale?: { x: number; y: number }
    width: number
    height: number
    pixelsParCm?: number
    opacite?: number
    bordures?: [number, number, number, number]
  }) {
    super()
    this.name = name
    this.codeSvg = codeSvg
    this.codeTikz = codeTikz
    this.x = x
    this.y = y
    this.angle = angle
    this.scale = scale
    this.width = width
    this.height = height
    this.pixelsParCm = pixelsParCm
    this.opacite = opacite
    this.bordures = bordures ?? [
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.x + this.width / 2,
      this.y + this.height / 2,
    ]
  }

  svg(coeff: number) {
    return `<g opacity=${this.opacite} transform="translate(${(this.x * coeff).toFixed(2)}, ${(-this.y * coeff).toFixed(2)}) ${this.scale.x !== 1 || this.scale.y !== 1 || coeff !== 20 ? `scale(${((this.scale.x * coeff) / 20).toFixed(3)},${((this.scale.y * coeff) / 20).toFixed(3)})` : ''} ${this.angle !== 0 ? `rotate(${(-this.angle).toFixed(2)})` : ''}">${this.codeSvg}</g>`
  }

  tikz() {
    // const tikzCenterX = this.width / 2
    // const tikzCenterY = this.height / 2
    return `\\begin{scope}[fill opacity=${this.opacite}, shift={(${this.x.toFixed(2)},${this.y.toFixed(2)})}${this.scale.x !== 1 ? `, xscale=${this.scale.x.toFixed(3)}` : ''}${this.scale.y !== 1 ? `, yscale=${this.scale.y.toFixed(3)}` : ''}${this.angle !== 0 ? `, rotate around={${this.angle}:(0,0)}` : ''}]
    ${this.codeTikz}
    \\end{scope}`
  }

  updateBordures() {
    this.bordures = [
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.x + this.width / 2,
      this.y + this.height / 2,
    ]
    if (this.angle !== 0) {
      this.bordures = rotatedBoundingBoxWithCenter(
        this.bordures[0],
        this.bordures[1],
        this.bordures[2],
        this.bordures[3],
        (this.angle * Math.PI) / 180,
        this.x,
        this.y,
      )
    }
  }

  rotate(angle: number) {
    this.angle += angle
    this.bordures = rotatedBoundingBoxWithCenter(
      this.bordures[0],
      this.bordures[1],
      this.bordures[2],
      this.bordures[3],
      (angle * Math.PI) / 180,
      this.x,
      this.y,
    )
    return this
  }

  dilate(factor: { x: number; y: number } | number) {
    if (typeof factor === 'number') {
      factor = { x: factor, y: factor }
    }
    this.scale.x *= factor.x
    this.scale.y *= factor.y
    this.width = this.width * factor.x
    this.height = this.height * factor.y
    let xmin = this.bordures[0]
    let ymin = this.bordures[1]
    let xmax = this.bordures[2]
    let ymax = this.bordures[3]
    xmin = (xmin - this.x) * factor.x + this.x
    ymin = (ymin - this.y) * factor.y + this.y
    xmax = (xmax - this.x) * factor.x + this.x
    ymax = (ymax - this.y) * factor.y + this.y
    this.bordures = [xmin, ymin, xmax, ymax]
    return this
  }

  translate(dx: number, dy: number) {
    this.x += dx
    this.y += dy
    this.bordures = [
      this.bordures[0] + dx,
      this.bordures[1] + dy,
      this.bordures[2] + dx,
      this.bordures[3] + dy,
    ]
    return this
  }

  flip(axes: 'x' | 'y' | 'xy' = 'x') {
    if (axes === 'x') {
      this.scale.x = -this.scale.x
      this.angle = -this.angle
    } else if (axes === 'y') {
      this.scale.y = -this.scale.y
      this.angle = -this.angle
    } else if (axes === 'xy') {
      this.scale.x = -this.scale.x
      this.scale.y = -this.scale.y
    }
    return this
  }

  clone() {
    const codeTikz = String(this.codeTikz)
    const codeSvg = String(this.codeSvg)
    const x = Number(this.x)
    const y = Number(this.y)
    const angle = Number(this.angle)
    const scale = { x: this.scale.x, y: this.scale.y }
    const width = Number(this.width)
    const height = Number(this.height)
    const pixelsParCm = Number(this.pixelsParCm)

    return new Shape2D({
      codeSvg,
      codeTikz,
      x,
      y,
      angle,
      scale,
      width,
      height,
      pixelsParCm,
      opacite: this.opacite,
      bordures: this.bordures,
    })
  }
}

// Classe pour les figures 2D avec des méthodes de transformation et d'animation basée sur Shape2D
export class Figure2D extends Shape2D {
  codeSvg: string
  codeTikz: string
  scale: { x: number; y: number }
  angle: number
  width: number // laargeur en cm
  height: number // hauteur en cm
  pixelsParCm: number
  axes: Segment[]
  nonAxe: Segment | null
  centre: PointAbstrait | null
  nbAxes: number
  name: string
  bordures: [number, number, number, number] // [xmin, ymin, xmax, ymax]
  opacite: number
  constructor({
    codeSvg,
    codeTikz,
    x = 0,
    y = 0,
    angle = 0,
    scale = { x: 1, y: 1 },
    width = 0,
    height = 0,
    pixelsParCm = context.pixelsParCm,
    axes = [],
    nonAxe = null,
    centre = null,
    nbAxes,
    opacite = 1,
    name = Date.now().toString(),
  }: {
    codeSvg: string
    codeTikz: string
    x?: number
    y?: number
    angle?: number
    scale?: { x: number; y: number }
    width: number
    height: number
    pixelsParCm?: number
    axes?: Segment[]
    centre?: PointAbstrait | null
    nbAxes?: number
    opacite?: number
    name?: string
    nonAxe?: Segment | null
  }) {
    super({ codeSvg, codeTikz, x, y, angle, scale, width, height })
    this.name = name
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.pixelsParCm = pixelsParCm
    this.angle = angle
    this.scale = scale
    this.codeSvg = codeSvg
    this.codeTikz = codeTikz
    this.opacite = opacite
    this.bordures = [
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.x + this.width / 2,
      this.y + this.height / 2,
    ]
    this.axes = axes
    this.nonAxe = nonAxe
    this.nbAxes = nbAxes ?? this.axes.length
    this.centre = centre
    if (this.angle !== 0) {
      this.bordures = rotatedBoundingBoxWithCenter(
        this.bordures[0],
        this.bordures[1],
        this.bordures[2],
        this.bordures[3],
        (this.angle * Math.PI) / 180,
        this.x,
        this.y,
      )
    }
  }

  svg(coeff: number) {
    return `<g opacity=${this.opacite} transform="translate(${(this.x * coeff).toFixed(2)}, ${(-this.y * coeff).toFixed(2)}) scale(${this.scale.x.toFixed(3)},${this.scale.y.toFixed(3)}) rotate(${(-this.angle).toFixed(2)})">${this.codeSvg}</g>`
  }

  tikz() {
    // const tikzCenterX = this.width / 2
    // const tikzCenterY = this.height / 2
    return `\\begin{scope}[fill opacity=${this.opacite}, shift={(${this.x.toFixed(2)},${this.y.toFixed(2)})}, xscale=${this.scale.x.toFixed(3)}, yscale=${this.scale.y.toFixed(3)}, rotate around={${-this.angle.toFixed(2)}:(0,0)}]
    ${this.codeTikz}
    \\end{scope}`
  }

  rotate(angle: number) {
    this.angle += angle
    this.axes = this.axes.map((el) =>
      rotation(el, pointAbstrait(this.x, this.y), angle),
    )
    if (this.nonAxe) {
      this.nonAxe = rotation(this.nonAxe, pointAbstrait(this.x, this.y), angle)
    }
    if (this.centre) {
      this.centre = rotation(this.centre, pointAbstrait(this.x, this.y), angle)
    }
    this.bordures = rotatedBoundingBoxWithCenter(
      this.bordures[0],
      this.bordures[1],
      this.bordures[2],
      this.bordures[3],
      (this.angle * Math.PI) / 180,
      this.x,
      this.y,
    )
    return this
  }

  dilate(factor: { x: number; y: number } | number) {
    if (typeof factor === 'number') {
      factor = { x: factor, y: factor }
    }
    this.scale.x *= factor.x
    this.scale.y *= factor.y
    this.width = this.width * factor.x
    this.height = this.height * factor.y
    if (this.centre) {
      this.centre = pointAbstrait(
        (this.centre.x - this.x) * factor.x + this.x,
        (this.centre.y - this.y) * factor.y + this.y,
      )
    }
    this.axes = this.axes.map((el) =>
      homothetie(el, pointAbstrait(this.x, this.y), factor.x),
    )
    if (this.nonAxe) {
      this.nonAxe = homothetie(
        this.nonAxe,
        pointAbstrait(this.x, this.y),
        factor.x,
      )
    }
    let xmin = this.bordures[0]
    let ymin = this.bordures[1]
    let xmax = this.bordures[2]
    let ymax = this.bordures[3]
    xmin = (xmin - this.x) * factor.x + this.x
    ymin = (ymin - this.y) * factor.y + this.y
    xmax = (xmax - this.x) * factor.x + this.x
    ymax = (ymax - this.y) * factor.y + this.y
    this.bordures = [xmin, ymin, xmax, ymax]
    return this
  }

  translate(dx: number, dy: number) {
    this.x += dx
    this.y += dy
    this.axes = this.axes.map((el) => translation(el, vecteur(dx, dy)))
    if (this.nonAxe) {
      this.nonAxe = translation(this.nonAxe, vecteur(dx, dy))
    }
    if (this.centre) {
      this.centre = pointAbstrait(this.centre.x + dx, this.centre.y + dy)
    }

    this.bordures = [
      this.bordures[0] + dx,
      this.bordures[1] + dy,
      this.bordures[2] + dx,
      this.bordures[3] + dy,
    ]
    return this
  }

  flip(axes: 'x' | 'y' | 'xy' = 'x') {
    if (axes === 'y') {
      this.scale.x = -this.scale.x
      this.angle = -this.angle
      this.axes = this.axes.map((el) =>
        symetrieAxiale(
          el,
          droite(
            pointAbstrait(this.x, this.y),
            pointAbstrait(this.x + 1, this.y),
          ),
        ),
      )
      if (this.nonAxe) {
        this.nonAxe = symetrieAxiale(
          this.nonAxe,
          droite(
            pointAbstrait(this.x, this.y),
            pointAbstrait(this.x + 1, this.y),
          ),
        )
      }
      if (this.centre) {
        this.centre = symetrieAxiale(
          this.centre,
          droite(
            pointAbstrait(this.x, this.y),
            pointAbstrait(this.x + 1, this.y),
          ),
        )
      }
    } else if (axes === 'x') {
      this.scale.y = -this.scale.y
      this.angle = -this.angle
      this.axes = this.axes.map((el) =>
        symetrieAxiale(
          el,
          droite(
            pointAbstrait(this.x, this.y),
            pointAbstrait(this.x, this.y + 1),
          ),
        ),
      )
      if (this.nonAxe) {
        this.nonAxe = symetrieAxiale(
          this.nonAxe,
          droite(
            pointAbstrait(this.x, this.y),
            pointAbstrait(this.x, this.y + 1),
          ),
        )
      }
      if (this.centre) {
        this.centre = symetrieAxiale(
          this.centre,
          droite(
            pointAbstrait(this.x, this.y),
            pointAbstrait(this.x, this.y + 1),
          ),
        )
      }
    } else if (axes === 'xy') {
      this.scale.x = -this.scale.x
      this.scale.y = -this.scale.y
      this.axes = this.axes.map((el) =>
        rotation(el, pointAbstrait(this.x, this.y), 180),
      )
      if (this.nonAxe) {
        this.nonAxe = rotation(this.nonAxe, pointAbstrait(this.x, this.y), 180)
      }
      if (this.centre) {
        this.centre = rotation(this.centre, pointAbstrait(this.x, this.y), 180)
      }
    }
    return this
  }

  symetrie(axe: Droite) {
    // Calcul de l'angle de l'axe par rapport à l'horizontale
    const angleAxe =
      (Math.atan2(axe.y1 - axe.y2, axe.x2 - axe.x1) * 180) / Math.PI
    // Calcul du centre de symétrie (image de (this.x, this.y) par la symétrie d'axe 'axe')
    // Formule de la symétrie orthogonale d'un point (px, py) par rapport à la droite passant par (x1, y1), (x2, y2)
    const { a, b, c, d, tx, ty } = computeSymmetryMatrix(1, angleAxe, 0, 0)

    const svg = `<g transform="matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})">${this.codeSvg}</g>`
    const xImg = a * this.x - c * this.y + tx
    const yImg = -b * this.x + d * this.y - ty
    // Calcul du code TikZ pour la symétrie
    // On applique la même transformation que pour le SVG, mais en TikZ
    // L'angle de symétrie est angleAxe, le centre est (0,0) car la matrice est centrée sur (0,0)
    // Inversion de l'axe des y pour TikZ (y vers le haut)
    const tikz = `\\begin{scope}[cm={${a.toFixed(4)},${-b.toFixed(4)},${-c.toFixed(4)},${d.toFixed(4)},(${tx.toFixed(4)},${-ty.toFixed(4)})}]
  ${this.codeTikz}
  \\end{scope}`
    // Nouvelle instance avec les mêmes propriétés, mais codeSvg/codeTikz modifiés
    const symForme = new Figure2D({
      codeSvg: svg,
      codeTikz: tikz,
      x: xImg,
      y: yImg,
      // L'angle après symétrie : 2 * angleAxe - this.angle
      angle: (360 - this.angle) % 360,
      scale: this.scale,
      width: this.width,
      height: this.height,
      pixelsParCm: this.pixelsParCm,
      axes: this.axes.map((el) => symetrieAxiale(el, axe)),
      nonAxe: this.nonAxe,
      centre: this.centre == null ? null : symetrieAxiale(this.centre, axe),
      nbAxes: this.nbAxes,
      opacite: this.opacite,
      name: this.name + '_sym',
    })
    symForme.bordures = rotatedBoundingBoxWithCenter(
      symForme.bordures[0],
      symForme.bordures[1],
      symForme.bordures[2],
      symForme.bordures[3],
      (angleAxe * Math.PI) / 180,
      xImg,
      yImg,
    )
    return symForme
  }

  copy(newName: string) {
    const codeTikz = String(this.codeTikz)
    const codeSvg = String(this.codeSvg)
    const x = Number(this.x)
    const y = Number(this.y)
    const angle = Number(this.angle)
    const scale = { x: this.scale.x, y: this.scale.y }
    const width = Number(this.width)
    const height = Number(this.height)
    const pixelsParCm = Number(this.pixelsParCm)
    const axes = this.axes.map((el) => el)
    const centre = this.centre
    const nbAxes = Number(this.nbAxes)
    const opacite = Number(this.opacite)
    const name = newName
    return new Figure2D({
      codeSvg,
      codeTikz,
      x,
      y,
      angle,
      scale,
      width,
      height,
      pixelsParCm,
      axes,
      centre,
      nbAxes,
      opacite,
      name,
    })
  }

  rotationAnimee({
    angleStart = 0,
    angleEnd = 180,
    cx,
    cy,
    duration = '2s',
    repeatCount = 'indefinite',
    loop = true,
    delay = 0,
  }: {
    angleStart?: number
    angleEnd?: number
    duration?: string
    repeatCount?: string
    loop?: boolean
    delay?: number
    cx?: number
    cy?: number
  }) {
    if (cx === undefined) {
      cx = this.x * this.pixelsParCm
    } else cx *= this.pixelsParCm
    if (cy === undefined) {
      cy = -this.y * this.pixelsParCm
    } else cy *= -this.pixelsParCm
    return new Figure2D({
      codeSvg: `<g> 
      <animateTransform
      attributeName="transform"
      type="rotate"
      from="${angleStart} ${cx} ${cy}"
      to="${angleEnd} ${cx} ${cy}"
      dur="${duration}"
      repeatCount="${repeatCount}"
      begin="${loop ? `0s; ${delay}s` : '0s'}"
      keyTimes="0;0.4;0.5;0.9;1"
      values="${angleStart} ${cx} ${cy};${angleEnd} ${cx} ${cy};${angleEnd} ${cx} ${cy};${angleStart} ${cx} ${cy};${angleStart} ${cx} ${cy}"
      />
        <g transform="translate(${this.x * this.pixelsParCm}, ${-this.y * this.pixelsParCm}) scale(${this.scale.x},${this.scale.y}) rotate(${-this.angle})">${this.codeSvg}</g>
      </g>`,
      codeTikz: `\\begin{scope}[shift={(${this.x},${this.y})}, xscale=${this.scale.x}, yscale=${this.scale.y}, rotate around={${this.angle}:(0,0)}]${this.codeTikz}\\end{scope})`,
      width: this.width,
      height: this.height,
      pixelsParCm: this.pixelsParCm,
    })
  }

  dilatationAnimee({
    cx,
    cy,
    factorXStart = 1,
    factorXEnd = -1,
    factorYStart = 1,
    factorYEnd = 1,
    duration = '1s',
    repeatCount = 'infinite',
    loop = true,
    delay = 0,
  }: {
    factorXStart?: number
    factorXEnd?: number
    factorYStart?: number
    factorYEnd?: number
    duration?: string
    repeatCount?: string
    loop?: boolean
    delay?: number
    cx?: number
    cy?: number
  }) {
    if (cx === undefined) {
      cx = this.x * this.pixelsParCm
    }
    if (cy === undefined) {
      cy = -this.y * this.pixelsParCm
    }
    return new Figure2D({
      codeSvg: `<g transform="translate(${cx}, ${cy})"> 
      <g>
      <animateTransform
      attributeName="transform"
      type="scale"
      from="${factorXStart} ${factorYStart}"
      to="${factorXEnd} ${factorYEnd}"
      dur="${duration}"
      repeatCount="${repeatCount}"
      begin="${loop ? `0s; ${delay}s` : '0s'}"
      keyTimes="0;0.4;0.5;0.9;1"
      values="${factorXStart} ${factorYStart};${factorXEnd} ${factorYEnd};${factorXEnd} ${factorYEnd};${factorXStart} ${factorYStart};${factorXStart} ${factorYStart}"
      />
        <g transform=" scale(${this.scale.x},${this.scale.y}) rotate(${-this.angle})">${this.codeSvg}</g>
      </g>
      </g>`,
      codeTikz: `\\begin{scope}[shift={(${this.x},${this.y})}, xscale=${this.scale.x}, yscale=${this.scale.y}, rotate around={${this.angle}:(0,0)}]${this.codeTikz}\\end{scope})`,
      width: this.width,
      height: this.height,
      pixelsParCm: this.pixelsParCm,
    })
  }

  translationAnimee({
    dx,
    dy,
    duration = '1s',
    repeatCount = 'infinite',
    loop = true,
    delay = 0,
  }: {
    dx: number
    dy: number
    duration?: string
    repeatCount?: string
    loop?: boolean
    delay?: number
  }) {
    return new Figure2D({
      codeSvg: `<g>
      <animateTransform
      attributeName="transform"
      type="translate"
      from="${this.x * this.pixelsParCm} ${-this.y * this.pixelsParCm}"
      to="${this.x * this.pixelsParCm + dx} ${-this.y * this.pixelsParCm - dy}"
      dur="${duration}"
      repeatCount="${repeatCount}"
      begin="${loop ? `0s; ${delay}s` : '0s'}"
      keyTimes="0;0.4;0.5;0.9;1"
      values="${this.x * this.pixelsParCm} ${-this.y * this.pixelsParCm};${this.x * this.pixelsParCm + dx} ${-this.y * this.pixelsParCm - dy};${this.x * this.pixelsParCm + dx} ${-this.y * this.pixelsParCm - dy};${this.x * this.pixelsParCm} ${-this.y * this.pixelsParCm};${this.x * this.pixelsParCm} ${-this.y * this.pixelsParCm}"
      />
        <g transform=" scale(${this.scale.x},${this.scale.y}) rotate(${-this.angle})">${this.codeSvg}</g>
      </g>`,
      codeTikz: `\\begin{scope}[shift={(${this.x},${this.y})}, xscale=${this.scale.x}, yscale=${this.scale.y}, rotate around={${this.angle}:(0,0)}]${this.codeTikz}\\end{scope})`,
      width: this.width,
      height: this.height,
      pixelsParCm: this.pixelsParCm,
    })
  }

  get axesAngles() {
    let angles: number[] = []
    if (this.Axes.length > 0) {
      angles = this.Axes.map((el) => {
        const angle = (Math.atan2(el.y1 - el.y2, el.x2 - el.x1) * 180) / Math.PI
        return angle
      })
    } else if (this.nonAxe) {
      const angle =
        (Math.atan2(
          this.nonAxe.y1 - this.nonAxe.y2,
          this.nonAxe.x2 - this.nonAxe.x1,
        ) *
          180) /
        Math.PI
      angles = [angle]
    }
    return angles
  }

  loopReflectionAnimee(
    axe: Droite,
    id: string,
    onDirectionChange?: (direction: number) => void,
  ) {
    const copieAnimee = new Figure2D({
      codeSvg: `<g id="${id}" style="filter: drop-shadow(0px 0px 0px rgb(80, 80, 80))">
        ${this.svg(this.pixelsParCm)}
      </g>`,
      codeTikz: this.tikz(),
      width: this.width / this.scale.x,
      height: this.height / this.scale.y,
      pixelsParCm: this.pixelsParCm,
      scale: { x: 1, y: 1 },
      angle: 0,
      x: 0,
      y: 0,
      opacite: 1,
    })

    const ppcm = this.pixelsParCm

    copieAnimee.name = id
    copieAnimee.reflectionAnimationId = id
    registerReflectionAnimation({
      type: 'loop',
      id,
      axe,
      pixelsParCm: ppcm,
      onDirectionChange,
    })
    return copieAnimee
  }

  // Fonction pour créer une figure animée avec une réflexion automatique selon les axes de la figure
  autoReflectionAnimee(id: string, cx: number, cy: number) {
    const copieAnimee = new Figure2D({
      codeSvg: `<g id="${id}" style="filter: drop-shadow(0px 0px 0px rgb(80, 80, 80))"> 
      ${this.svg(20)}
       transform="matrix(1 0 0 1 0 0)"
      </g>`, // >
      codeTikz: this.tikz(),
      width: this.width / this.scale.x,
      height: this.height / this.scale.y,
      pixelsParCm: this.pixelsParCm,
      scale: { x: 1, y: 1 },
      angle: 0,
      x: 0,
      y: 0,
      opacite: 1,
      axes: this.Axes,
      nonAxe: this.nonAxe,
      centre: this.centre,
    })

    const ppcm = this.pixelsParCm

    copieAnimee.name = id
    copieAnimee.reflectionAnimationId = id
    registerReflectionAnimation({
      type: 'auto',
      id,
      cx,
      cy,
      pixelsParCm: ppcm,
      symmetryAngles: copieAnimee.axesAngles,
    })
    return copieAnimee
  }

  set Axes(axes: Segment[]) {
    this.axes = axes
    this.nbAxes = axes.length
  }

  get Axes() {
    return this.axes.map((el) => rotation(el, pointAbstrait(0, 0), this.angle))
  }
}

export function shapeToFigure2D(shape: Shape2D): Figure2D {
  return new Figure2D({
    codeSvg: shape.codeSvg,
    codeTikz: shape.codeTikz,
    x: shape.x,
    y: shape.y,
    angle: shape.angle,
    scale: shape.scale,
    width: shape.width,
    height: shape.height,
    pixelsParCm: shape.pixelsParCm,
    opacite: shape.opacite,
    axes: [],
    nonAxe: null,
    centre: null,
    nbAxes: 0,
    name: Date.now().toString(),
  })
}
export function figure2DToShape(figure: Figure2D): Shape2D {
  return new Shape2D({
    codeSvg: figure.codeSvg,
    codeTikz: figure.codeTikz,
    x: figure.x,
    y: figure.y,
    angle: figure.angle,
    scale: figure.scale,
    width: figure.width,
    height: figure.height,
    pixelsParCm: figure.pixelsParCm,
    opacite: figure.opacite,
    bordures: figure.bordures,
  })
}
