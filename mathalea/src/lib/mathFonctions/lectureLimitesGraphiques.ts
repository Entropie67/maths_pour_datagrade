import { cercle } from '../2d/cercle'
import { colorToLatexOrHTML } from '../2d/colorToLatexOrHtml'
import { Courbe } from '../2d/Courbe'
import { droiteVerticaleParPoint } from '../2d/droites'
import { pointAbstrait } from '../2d/PointAbstrait'
import { repere } from '../2d/reperes'
import { bleuMathalea } from '../colors'
import { KeyboardType } from '../interactif/claviers/keyboard'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'

export type LimitValue = string
type GraphRepere = ReturnType<typeof commonRepere>

const blue = bleuMathalea
const markerBlue = 'blue'
const dotGap = 0.16

export const answerKeyboard =
  KeyboardType.clavierLectureLimites ?? KeyboardType.clavierLimites ?? ''
export const notExists = '\\not\\exists'

export function texLimit(value: LimitValue): string {
  if (value === notExists) return '\\not\\exists'
  return value
}

export function randomPointValue(
  leftLimit: number,
  rightLimit: number,
  min = -2,
  max = 6,
): LimitValue {
  const mode = randint(1, 4)
  if (mode === 1) return notExists
  if (mode === 2) return String(leftLimit)
  if (mode === 3) return String(rightLimit)
  return String(randint(min, max, [leftLimit, rightLimit]))
}

export function horizontalGapForSlope(slope: number): number {
  return dotGap / Math.sqrt(1 + slope ** 2)
}

export function pointMark(x: number, y: number, filled: boolean) {
  if (!filled) {
    const openCircle = cercle(pointAbstrait(x, y), dotGap, markerBlue, 'none')
    openCircle.epaisseur = 2.5
    return openCircle
  }
  return cercle(pointAbstrait(x, y), dotGap, markerBlue, markerBlue)
}

export function pgfCurve(
  f: (x: number) => number,
  graphRepere: GraphRepere,
  xMin: number,
  xMax: number,
  fLatex: string,
) {
  const curve = new Courbe(f, {
    repere: graphRepere,
    xMin,
    xMax,
    yMin: graphRepere.yMin,
    yMax: graphRepere.yMax,
    step: 0.03,
    usePgfplots: true,
    fLatex,
  })
  curve.color = colorToLatexOrHTML(blue)
  curve.epaisseur = 2
  curve.samples = 120
  return curve
}

export function commonRepere({
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
  return repere({
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite: 1,
    yUnite: 1,
    thickHauteur: 0.08,
    grilleSecondaire: true,
    grilleSecondaireXMin: xMin,
    grilleSecondaireXMax: xMax,
    grilleSecondaireYMin: yMin,
    grilleSecondaireYMax: yMax,
    grilleSecondaireDistance: 1,
  })
}

export function verticalAsymptote(a: number) {
  const asymptote = droiteVerticaleParPoint(pointAbstrait(a, 0), '', blue)
  asymptote.pointilles = 5
  asymptote.usePgfplots = true
  asymptote.pgfplotsOptions = 'dashed'
  return asymptote
}

export function renderGraph(
  graphRepere: GraphRepere,
  objets: any[],
  scale = 0.65,
) {
  return mathalea2d(
    {
      xmin: graphRepere.xMin,
      xmax: graphRepere.xMax,
      ymin: graphRepere.yMin,
      ymax: graphRepere.yMax,
      scale,
      pixelsParCm: 28,
      usePgfplots: true,
      centerLatex: true,
      display: 'block', center: true,
    },
    graphRepere,
    ...objets,
  )
}
