import Figure from 'apigeom'
import type Point from 'apigeom/src/elements/points/Point'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'd3b6c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Reconnaître la nature d'un quadrilatère à partir de ses diagonales"
export const dateDePublication = '06/06/2026'

/**
 * DNB Amérique du Nord juin 2026 - Question 3
 * Le quadrilatère est tracé à main levée : c'est le codage des diagonales
 * (milieu commun, longueurs égales, perpendicularité) qui donne sa nature.
 * @author Rémi Angot
 */
export default class AutoQ3ANbrevet2026 extends ExerciceQcmA {
  private construireFigure(
    diagonalesEgales: boolean,
    perpendiculaires: boolean,
  ): string {
    const figure = new Figure({
      xMin: -1.5,
      yMin: -1.5,
      width: 300,
      height: 220,
      pixelsPerUnit: 36,
    })
    figure.options.color = 'black'

    // ABCD : diagonales AC et BD toujours perpendiculaires (AC↗(4,2), BD↘(2,-4))
    // Les trois cas (rectangle, losange, parallélogramme) ne se distinguent que par le codage.
    const A = figure.create('Point', {
      x: 0,
      y: 1,
      label: 'A',
      shape: '',
    }) as Point
    const B = figure.create('Point', {
      x: 1,
      y: 4,
      label: 'B',
      shape: '',
    }) as Point
    const C = figure.create('Point', {
      x: 4,
      y: 3,
      label: 'C',
      shape: '',
    }) as Point
    const D = figure.create('Point', {
      x: 3,
      y: 0,
      label: 'D',
      shape: '',
    }) as Point
    const O = figure.create('Point', { x: 2, y: 2, isVisible: false }) as Point

    figure.create('Segment', { point1: A, point2: B })
    figure.create('Segment', { point1: B, point2: C })
    figure.create('Segment', { point1: C, point2: D })
    figure.create('Segment', { point1: D, point2: A })
    figure.create('Segment', { point1: A, point2: C })
    figure.create('Segment', { point1: B, point2: D })
    figure.optimizeLabels()

    // Codage : les diagonales se coupent toujours en leur milieu (parallélogramme)
    const marqueAC = '|'
    const marqueBD = diagonalesEgales ? '|' : '||'
    figure.create('MarkBetweenPoints', { point1: O, point2: A, text: marqueAC })
    figure.create('MarkBetweenPoints', { point1: O, point2: C, text: marqueAC })
    figure.create('MarkBetweenPoints', { point1: O, point2: B, text: marqueBD })
    figure.create('MarkBetweenPoints', { point1: O, point2: D, text: marqueBD })

    if (perpendiculaires) {
      figure.create('MarkRightAngle', {
        point: O,
        directionPoint: C,
        size: 0.3,
      })
    }

    // addHandDrawnFilter() est appelé inconditionnellement dans clearHtml() :
    // les <defs> avec le filtre feTurbulence sont toujours présents dans le SVG.
    // On injecte l'attribut SVG filter="url(#handDrawn)" directement dans la balise,
    // plus robuste que svg.style.filter qui peut être perdu lors des re-rendus Svelte
    // (et applicable tel quel à la chaîne SVG statique générée pour Typst).
    if (context.isTypst)
      return apigeomFigureToSvg(figure).replace(
        /<svg\b/,
        '<svg filter="url(#handDrawn)"',
      )
    if (!context.isHtml) return figure.tikz()
    return figure
      .getStaticHtml({ center: true })
      .replace(/<svg\b/, '<svg filter="url(#handDrawn)"')
  }

  private appliquerLesValeurs(
    diagonalesEgales: boolean,
    perpendiculaires: boolean,
  ): void {
    // On évite volontairement le cas du carré : un carré étant à la fois un losange
    // et un rectangle, plusieurs réponses seraient correctes (incompatible avec un QCU).
    const optionCarre = "C'est un carré."
    const optionRectangle = "C'est un rectangle."
    const optionLosange = "C'est un losange."
    const optionNi = "Ce n'est ni un losange, ni un rectangle."

    let bonneReponse: string
    let natureCorr: string
    if (diagonalesEgales) {
      bonneReponse = optionRectangle
      natureCorr = 'un rectangle'
    } else if (perpendiculaires) {
      bonneReponse = optionLosange
      natureCorr = 'un losange'
    } else {
      bonneReponse = optionNi
      natureCorr = 'un parallélogramme quelconque'
    }

    const figure = this.construireFigure(diagonalesEgales, perpendiculaires)

    this.enonce = `Un professeur a dessiné à main levée le quadrilatère ci-dessous avec ses diagonales.<br>
Que peut-on affirmer à propos de la nature de ce quadrilatère ?<br>
${figure}`

    // Justification selon le codage affiché
    const justifs: string[] = ['Les diagonales se coupent en leur milieu']
    if (diagonalesEgales) justifs.push('sont de même longueur')
    if (perpendiculaires) justifs.push('sont perpendiculaires')
    this.correction = `${justifs.join(' et ')}, donc c'est ${texteEnCouleurEtGras(natureCorr)}.`

    // reponses[0] est la bonne réponse, les autres options du QCM suivent
    const autres = [
      optionLosange,
      optionRectangle,
      optionCarre,
      optionNi,
    ].filter((opt) => opt !== bonneReponse)
    this.reponses = [bonneReponse, ...autres]
  }

  versionOriginale: () => void = () => {
    // Diagonales de même longueur qui se coupent en leur milieu → rectangle
    this.appliquerLesValeurs(true, false)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const [egales, perp] = choice([
      [true, false], // rectangle
      [false, true], // losange
      [false, false], // parallélogramme quelconque
    ]) as [boolean, boolean]
    this.appliquerLesValeurs(egales, perp)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options = { vertical: true, radio: true }
  }
}
