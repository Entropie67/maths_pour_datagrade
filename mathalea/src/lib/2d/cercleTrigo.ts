import type FractionEtendue from '../../modules/FractionEtendue'
import {
  coopmathsCorpusLightest,
  noirMathalea,
  orangeMathalea,
  parseHexColor,
} from '../colors'
import {
  angleTex,
  normalizeAnglePiFraction,
  trigoCircleAngles,
} from '../mathFonctions/trigo'
import { ObjetMathalea2D } from './ObjetMathalea2D'

export type TrigoCircleMarkedPoint = {
  angle: number | FractionEtendue
  color?: string
  radius?: number
  label?: string
  /**
   * Trace en pointillés les projections du point sur les axes et écrit les
   * valeurs exactes du cosinus (axe des abscisses) et du sinus (axe des
   * ordonnées). Réservé aux angles de la table `trigoCircleAngles`.
   */
  projection?: boolean
}

/** Données exactes (cos, sin) d'un angle de la table, ou undefined. */
function donneesExactes(angle: number | FractionEtendue) {
  const n = normalizeAnglePiFraction(angle)
  return trigoCircleAngles.find(
    (a) => a.angleRad.num * n.den === n.num * a.angleRad.den,
  )
}

export type TrigoCircleOptions = {
  radius?: number
  showRadians?: boolean
  showDegrees?: boolean
  showCoordinates?: boolean
  showGuides?: boolean
  showAxisLabels?: boolean
  showBasePoints?: boolean
  guideAngles?: Array<number | FractionEtendue>
  labelAngles?: Array<number | FractionEtendue>
  markedPoints?: TrigoCircleMarkedPoint[]
}

function estimateTextHalfWidth(text: string, fontSize: number): number {
  let w = 0
  for (const ch of text) {
    if (ch === 'π') w += 0.78
    else if (ch === '√') w += 0.72
    else w += 0.58
  }
  return (w * fontSize) / 2
}

/**
 * Texte centré en (cx, cy). Un radical « √n » est dessiné en entier
 * (signe et barre au-dessus du radicande) : le caractère √ des polices
 * n'a pas de barre et son trait montant est souvent rogné.
 */
function svgTextPart(
  cx: number,
  cy: number,
  text: string,
  fontSize: number,
  className: string,
  style: string,
  strokeColor: string,
): string {
  const racine = text.indexOf('√')
  if (racine === -1) {
    return `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" class="${className}"${style}>${text}</text>`
  }
  const prefixe = text.slice(0, racine)
  const radicande = text.slice(racine + 1)
  const charW = 0.6 * fontSize
  const prefixW = prefixe.length * charW
  const signeW = 0.7 * fontSize
  const radicandeW = radicande.length * charW + 0.1 * fontSize
  const x0 = cx - (prefixW + signeW + radicandeW) / 2
  const haut = cy - 0.62 * fontSize
  const bas = cy + 0.5 * fontSize
  const xs = x0 + prefixW
  const trace = [
    `M${xs.toFixed(1)},${(cy + 0.05 * fontSize).toFixed(1)}`,
    `L${(xs + 0.12 * fontSize).toFixed(1)},${(cy - 0.02 * fontSize).toFixed(1)}`,
    `L${(xs + 0.32 * fontSize).toFixed(1)},${bas.toFixed(1)}`,
    `L${(xs + signeW).toFixed(1)},${haut.toFixed(1)}`,
    `L${(xs + signeW + radicandeW).toFixed(1)},${haut.toFixed(1)}`,
  ].join(' ')
  let code = ''
  if (prefixe !== '') {
    code += `<text x="${(x0 + prefixW / 2).toFixed(1)}" y="${cy.toFixed(1)}" class="${className}"${style}>${prefixe}</text>`
  }
  code += `<path d="${trace}" fill="none" stroke="${strokeColor}" stroke-width="${(0.08 * fontSize).toFixed(1)}" stroke-linejoin="miter" stroke-linecap="butt"/>`
  code += `<text x="${(xs + signeW + (radicandeW - 0.1 * fontSize) / 2 + 0.05 * fontSize).toFixed(1)}" y="${cy.toFixed(1)}" class="${className}"${style}>${radicande}</text>`
  return code
}

/** Largeur d'un texte, avec un radical dessiné comme dans `svgTextPart`. */
function largeurTexte(text: string, fontSize: number): number {
  const racine = text.indexOf('√')
  if (racine === -1) return 2 * estimateTextHalfWidth(text, fontSize)
  const radicande = text.length - racine - 1
  return (racine * 0.6 + 0.7 + radicande * 0.6 + 0.1) * fontSize
}

/** Demi-largeur et demi-hauteur d'une étiquette (fraction ou nombre seul). */
function tailleEtiquette(
  label: string,
  r: number,
  scale: number,
): { demiLargeur: number; demiHauteur: number } {
  const slash = label.indexOf('/')
  if (slash === -1) {
    const fs = r * 0.082 * scale
    return { demiLargeur: largeurTexte(label, fs) / 2, demiHauteur: 0.6 * fs }
  }
  const fs = r * 0.073 * scale
  const l = Math.max(
    largeurTexte(label.slice(0, slash), fs),
    largeurTexte(label.slice(slash + 1), fs),
  )
  return {
    demiLargeur: l / 2 + r * 0.012,
    demiHauteur: r * 0.065 * scale + 0.62 * fs,
  }
}

type EtiquetteAxe = {
  texte: string
  color: string
  /** Abscisse (axe x) ou ordonnée (axe y) du point projeté. */
  position: number
  /** Côté de l'axe où l'on écrit la valeur (1 ou -1). */
  cote: 1 | -1
  demiLargeur: number
  demiHauteur: number
}

/**
 * Écarte les étiquettes d'un même côté d'un axe quand elles se chevauchent,
 * en les décalant le long de l'axe, de part et d'autre de leur position.
 */
function repousse(
  etiquettes: EtiquetteAxe[],
  demiTaille: (e: EtiquetteAxe) => number,
  ecart: number,
): void {
  for (const cote of [1, -1] as const) {
    const meme = etiquettes
      .filter((e) => e.cote === cote)
      .sort((a, b) => a.position - b.position)
    for (let k = 0; k + 1 < meme.length; k++) {
      const [e1, e2] = [meme[k], meme[k + 1]]
      const manque = demiTaille(e1) + demiTaille(e2) + ecart - (e2.position - e1.position)
      if (manque > 0) {
        e1.position -= manque / 2
        e2.position += manque / 2
      }
    }
  }
}

function svgFractionLabel(
  cx: number,
  cy: number,
  label: string,
  r: number,
  /** Mise en valeur : agrandissement, couleur, gras et halo blanc. */
  emphasis?: { scale: number; color: string },
): string {
  const slash = label.indexOf('/')
  const scale = emphasis?.scale ?? 1
  const style =
    emphasis == null
      ? ''
      : ` style="fill:${emphasis.color};font-family:'KaTeX_Main','Latin Modern Roman','STIX Two Text',Georgia,serif;font-weight:700;paint-order:stroke;stroke:white;stroke-width:${(r * 0.03).toFixed(1)}px;stroke-linejoin:round${slash === -1 ? `;font-size:${(r * 0.082 * scale).toFixed(1)}px` : `;font-size:${(r * 0.073 * scale).toFixed(1)}px`}"`
  const couleurTrait = emphasis?.color ?? noirMathalea
  if (slash === -1) {
    return svgTextPart(cx, cy, label, r * 0.082 * scale, 'label', style, couleurTrait)
  }
  const num = label.slice(0, slash)
  const den = label.slice(slash + 1)
  const hh = r * 0.065 * scale
  const fs = r * 0.073 * scale
  const bw =
    Math.max(estimateTextHalfWidth(num, fs), estimateTextHalfWidth(den, fs)) +
    r * 0.012
  const barStyle =
    emphasis == null
      ? ''
      : ` style="stroke:${emphasis.color};stroke-width:${(r * 0.012).toFixed(1)}px"`
  return (
    svgTextPart(cx, cy - hh, num, fs, 'frac-part', style, couleurTrait) +
    `<line x1="${(cx - bw).toFixed(1)}" y1="${(cy - 0.5).toFixed(1)}" x2="${(cx + bw).toFixed(1)}" y2="${(cy - 0.5).toFixed(1)}" class="frac-bar"${barStyle}/>` +
    svgTextPart(cx, cy + hh, den, fs, 'frac-part', style, couleurTrait)
  )
}

function svgAxisLabel(x: number, y: number, content: string): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="axis-label">${content}</text>`
}

function angleLabelRadiusFactor(angleDeg: number): number {
  const a = Math.round(angleDeg)
  if (a === 45 || a === 135 || a === 225 || a === 315) return 0.56
  if (a === 90 || a === 270) return 0.66
  if (a === 0 || a === 180) return 0.72
  return 0.8
}

export function compactTexForSvg(value: string): string {
  return value
    .replace(/-\\dfrac\{\\sqrt\{3\}\}\{2\}/g, '-√3/2')
    .replace(/\\dfrac\{\\sqrt\{3\}\}\{2\}/g, '√3/2')
    .replace(/-\\dfrac\{\\sqrt\{2\}\}\{2\}/g, '-√2/2')
    .replace(/\\dfrac\{\\sqrt\{2\}\}\{2\}/g, '√2/2')
    .replace(/-\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '-$1/$2')
    .replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
    .replace(/\\pi/g, 'π')
    .replace(/[{}]/g, '')
    .replace(/\\textnon définie/g, 'non définie')
}

function tikzColor(color: string): string {
  return parseHexColor(color) == null ? color : 'black'
}

function tikzColorDefinition(name: string, color: string): string {
  const parsed = parseHexColor(color)
  if (parsed == null) return ''
  return `\\definecolor{${name}}{HTML}{${parsed.withoutHash}}\n`
}

export class CercleTrigo extends ObjetMathalea2D {
  private options: Required<TrigoCircleOptions>

  constructor(options: TrigoCircleOptions = {}) {
    super()
    const radius = options.radius ?? 2
    this.options = {
      radius,
      showRadians: options.showRadians ?? true,
      showDegrees: options.showDegrees ?? false,
      showCoordinates: options.showCoordinates ?? false,
      showGuides: options.showGuides ?? true,
      showAxisLabels: options.showAxisLabels ?? true,
      showBasePoints: options.showBasePoints ?? true,
      guideAngles: options.guideAngles ?? [],
      labelAngles: options.labelAngles ?? [],
      markedPoints: options.markedPoints ?? [],
    }
    this.bordures = [-radius * 2.05, -radius * 1.9, radius * 2.05, radius * 1.9]
  }

  svg(coeff: number): string {
    const r = this.options.radius * coeff
    const degreeRadius = r * 0.5
    const guideColor = coopmathsCorpusLightest
    const pointR = (r * 0.033).toFixed(1)
    const pointStroke = (r * 0.013).toFixed(1)
    const arrowId = `${this.id}-arr`
    let code = `<g id="${this.id}" class="trigo-circle">`
    code += `<defs>
<marker id="${arrowId}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
<path d="M0,0 L6,3 L0,6 Z" fill="${guideColor}"/>
</marker>
</defs>`
    code += `<style>
.trigo-circle text{font-family:"KaTeX_Math","STIX Two Math","Latin Modern Math",Georgia,serif}
.trigo-circle .axis{stroke:${guideColor};stroke-width:1.2}
.trigo-circle .guide{stroke:${guideColor};stroke-width:.8;opacity:.35}
.trigo-circle .circle{fill:white;stroke:${noirMathalea};stroke-width:1.4}
.trigo-circle .label{fill:${noirMathalea};font-size:${(r * 0.082).toFixed(1)}px;text-anchor:middle;dominant-baseline:middle}
.trigo-circle .frac-part{fill:${noirMathalea};font-size:${(r * 0.073).toFixed(1)}px;text-anchor:middle;dominant-baseline:middle}
.trigo-circle .frac-bar{stroke:${noirMathalea};stroke-width:${(r * 0.005).toFixed(1)}}
.trigo-circle .coord{fill:${noirMathalea};font-size:${(r * 0.068).toFixed(1)}px;text-anchor:middle;dominant-baseline:middle}
.trigo-circle .axis-label{fill:${guideColor};font-size:${(r * 0.082).toFixed(1)}px;text-anchor:middle;dominant-baseline:middle}
.trigo-circle .degree{fill:${coopmathsCorpusLightest};font-size:${(r * 0.065).toFixed(1)}px;text-anchor:middle;dominant-baseline:middle}
</style>`
    code += `<circle class="circle" cx="0" cy="0" r="${r.toFixed(1)}"/>`
    code += `<line class="axis" x1="${(-1.2 * r).toFixed(1)}" y1="0" x2="${(1.22 * r).toFixed(1)}" y2="0" marker-end="url(#${arrowId})"/>`
    code += `<line class="axis" x1="0" y1="${(1.2 * r).toFixed(1)}" x2="0" y2="${(-1.22 * r).toFixed(1)}" marker-end="url(#${arrowId})"/>`
    if (this.options.showAxisLabels) {
      code += svgAxisLabel(1.32 * r, 0.1 * r, 'x')
      code += svgAxisLabel(0.08 * r, -1.32 * r, 'y')
    }
    if (this.options.showGuides) {
      const guideAngles =
        this.options.guideAngles.length > 0
          ? this.options.guideAngles
          : trigoCircleAngles.map((angle) => angle.angleRad)
      for (const guideAngle of guideAngles) {
        const normalized = normalizeAnglePiFraction(guideAngle)
        const radians = (normalized.num / normalized.den) * Math.PI
        code += `<line class="guide" x1="0" y1="0" x2="${(Math.cos(radians) * r).toFixed(1)}" y2="${(-Math.sin(radians) * r).toFixed(1)}"/>`
      }
    }
    for (const angle of trigoCircleAngles) {
      if (this.options.showBasePoints) {
        code += `<circle cx="${(angle.x * r).toFixed(1)}" cy="${(-angle.y * r).toFixed(1)}" r="${pointR}" fill="white" stroke="#216d9a" stroke-width="${pointStroke}"/>`
      }
      if (this.options.showRadians) {
        const mustShowLabel = this.options.labelAngles.length === 0
        if (mustShowLabel) {
          const lr = r * angleLabelRadiusFactor(angle.angleDeg)
          code += svgFractionLabel(
            angle.x * lr,
            -angle.y * lr,
            compactTexForSvg(angle.angleTex),
            r,
          )
        }
      }
      if (this.options.showDegrees) {
        code += `<text x="${(angle.x * degreeRadius).toFixed(1)}" y="${(-angle.y * degreeRadius).toFixed(1)}" class="degree">${angle.angleDeg}°</text>`
      }
      if (this.options.showCoordinates) {
        const cr = r * 1.22
        code += `<text x="${(angle.x * cr).toFixed(1)}" y="${(-angle.y * cr).toFixed(1)}" class="coord">(${compactTexForSvg(angle.cosTex)};${compactTexForSvg(angle.sinTex)})</text>`
      }
    }
    if (this.options.showRadians && this.options.labelAngles.length > 0) {
      for (const labelAngle of this.options.labelAngles) {
        const normalized = normalizeAnglePiFraction(labelAngle)
        const radians = (normalized.num / normalized.den) * Math.PI
        const degrees = (normalized.num / normalized.den) * 180
        const lr = r * angleLabelRadiusFactor(degrees)
        code += svgFractionLabel(
          Math.cos(radians) * lr,
          -Math.sin(radians) * lr,
          compactTexForSvg(angleTex(normalized)),
          r,
        )
      }
    }
    // Projections sur les axes : traits en pointillés puis valeurs exactes,
    // collées aux axes, du côté opposé au point, sans chevauchement.
    const echelle = 1.35
    const etiquettesCos: EtiquetteAxe[] = []
    const etiquettesSin: EtiquetteAxe[] = []
    for (const point of this.options.markedPoints) {
      const exact = point.projection ? donneesExactes(point.angle) : undefined
      if (exact == null) continue
      const color = point.color ?? orangeMathalea
      const px = exact.x * r
      const py = -exact.y * r
      const dash = `stroke="${color}" stroke-width="1.6" stroke-dasharray="${(r * 0.04).toFixed(1)} ${(r * 0.03).toFixed(1)}"`
      code += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="0" ${dash}/>`
      code += `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="0" y2="${py.toFixed(1)}" ${dash}/>`
      const texteCos = compactTexForSvg(exact.cosTex)
      const texteSin = compactTexForSvg(exact.sinTex)
      etiquettesCos.push({
        texte: texteCos,
        color,
        position: px,
        cote: exact.y >= 0 ? 1 : -1,
        ...tailleEtiquette(texteCos, r, echelle),
      })
      etiquettesSin.push({
        texte: texteSin,
        color,
        position: py,
        cote: exact.x >= 0 ? -1 : 1,
        ...tailleEtiquette(texteSin, r, echelle),
      })
      // Mesure de l'angle, à l'extérieur du cercle
      code += svgFractionLabel(
        exact.x * 1.2 * r,
        -exact.y * 1.2 * r,
        compactTexForSvg(angleTex(normalizeAnglePiFraction(point.angle).simplifie())),
        r,
        { scale: 1.35, color },
      )
    }
    const ecart = 0.04 * r
    // Axe des abscisses : étiquettes sous (cote 1) ou au-dessus (cote -1) de l'axe
    repousse(etiquettesCos, (e) => e.demiLargeur, ecart)
    for (const e of etiquettesCos) {
      code += svgFractionLabel(
        e.position,
        e.cote * (ecart + e.demiHauteur),
        e.texte,
        r,
        { scale: echelle, color: e.color },
      )
    }
    // Axe des ordonnées : étiquettes à gauche (cote -1) ou à droite (cote 1)
    repousse(etiquettesSin, (e) => e.demiHauteur, ecart)
    for (const e of etiquettesSin) {
      code += svgFractionLabel(
        e.cote * (ecart + e.demiLargeur),
        e.position,
        e.texte,
        r,
        { scale: echelle, color: e.color },
      )
    }
    for (const point of this.options.markedPoints) {
      const normalized = normalizeAnglePiFraction(point.angle)
      const radians = (normalized.num / normalized.den) * Math.PI
      const color = point.color ?? orangeMathalea
      const pointRadius = (point.radius ?? 0.055) * coeff
      code += `<circle cx="${(Math.cos(radians) * r).toFixed(1)}" cy="${(-Math.sin(radians) * r).toFixed(1)}" r="${pointRadius.toFixed(1)}" fill="${color}" stroke="${noirMathalea}" stroke-width="0.6"/>`
    }
    code += '</g>'
    return code
  }

  tikz(): string {
    const r = this.options.radius
    let code = [
      `\\draw[->, gray] (${(-1.2 * r).toFixed(3)},0) -- (${(1.26 * r).toFixed(3)},0) node[above] {$x$};`,
      `\\draw[->, gray] (0,${(-1.2 * r).toFixed(3)}) -- (0,${(1.26 * r).toFixed(3)}) node[right] {$y$};`,
      `\\draw[thick] (0,0) circle (${r});`,
    ].join('\n')
    if (this.options.showGuides) {
      const guideAngles =
        this.options.guideAngles.length > 0
          ? this.options.guideAngles
          : trigoCircleAngles.map((angle) => angle.angleRad)
      code += guideAngles
        .map((guideAngle) => {
          const normalized = normalizeAnglePiFraction(guideAngle)
          const deg = (normalized.num / normalized.den) * 180
          return `\\draw[gray!45, thin] (0,0) -- (${deg}:${r});`
        })
        .join('\n')
    }
    for (const angle of trigoCircleAngles) {
      if (this.options.showBasePoints) {
        code += `\\fill (${angle.angleDeg}:${r}) circle (0.45pt);\n`
      }
      if (this.options.showRadians) {
        const mustShowLabel = this.options.labelAngles.length === 0
        if (mustShowLabel) {
          code += `\\node[font=\\tiny] at (${angle.angleDeg}:${(r * 0.78).toFixed(3)}) {$${angle.angleTex}$};\n`
        }
      }
      if (this.options.showDegrees) {
        code += `\\node[font=\\tiny, gray] at (${angle.angleDeg}:${(r * 0.5).toFixed(3)}) {$${angle.angleDeg}^{\\circ}$};\n`
      }
      if (this.options.showCoordinates) {
        code += `\\node[font=\\tiny] at (${angle.angleDeg}:${(r * 1.55).toFixed(3)}) {$\\left(${angle.cosTex};${angle.sinTex}\\right)$};\n`
      }
    }
    if (this.options.showRadians && this.options.labelAngles.length > 0) {
      for (const labelAngle of this.options.labelAngles) {
        const normalized = normalizeAnglePiFraction(labelAngle)
        const deg = (normalized.num / normalized.den) * 180
        code += `\\node[font=\\tiny] at (${deg}:${(r * angleLabelRadiusFactor(deg)).toFixed(3)}) {$${angleTex(normalized)}$};\n`
      }
    }
    for (let index = 0; index < this.options.markedPoints.length; index++) {
      const point = this.options.markedPoints[index]
      const normalized = normalizeAnglePiFraction(point.angle)
      const deg = (normalized.num / normalized.den) * 180
      const color = point.color ?? orangeMathalea
      const colorName = `trigoPoint${index}`
      const exact = point.projection ? donneesExactes(point.angle) : undefined
      if (exact != null) {
        const px = (exact.x * r).toFixed(3)
        const py = (exact.y * r).toFixed(3)
        const nom = parseHexColor(color) == null ? tikzColor(color) : colorName
        code =
          tikzColorDefinition(colorName, color) +
          code +
          `\\draw[dashed, ${nom}] (${px},${py}) -- (${px},0);\n` +
          `\\draw[dashed, ${nom}] (${px},${py}) -- (0,${py});\n` +
          `\\node[font=\\tiny, ${exact.y >= 0 ? 'below' : 'above'}] at (${px},0) {$${exact.cosTex}$};\n` +
          `\\node[font=\\tiny, ${exact.x >= 0 ? 'left' : 'right'}] at (0,${py}) {$${exact.sinTex}$};\n` +
          `\\node[font=\\scriptsize, ${nom}] at (${exact.angleDeg}:${(r * 1.2).toFixed(3)}) {$${angleTex(normalized.simplifie())}$};\n`
      }
      code =
        tikzColorDefinition(colorName, color) +
        code +
        `\\fill[${parseHexColor(color) == null ? tikzColor(color) : colorName}] (${deg}:${r}) circle (${point.radius ?? 0.055});\n`
      if (point.label) {
        code += `\\node[font=\\scriptsize, ${parseHexColor(color) == null ? tikzColor(color) : colorName}] at (${deg}:${(r * 1.14).toFixed(3)}) {$${point.label}$};\n`
      }
    }
    return code
  }
}

export function cercleTrigo(options?: TrigoCircleOptions): CercleTrigo {
  return new CercleTrigo(options)
}
