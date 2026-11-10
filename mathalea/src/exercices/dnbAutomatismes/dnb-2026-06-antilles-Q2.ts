import Figure from 'apigeom'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'dcde4'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const titre =
  "Déterminer le symétrique d'un point par une symétrie centrale"
export const dateDePublication = '06/06/2026'

type Disposition = {
  posO: [number, number]
  posK: [number, number]
  posM: [number, number]
  posDistracteurs: [number, number][]
}

const GRID_MAX = 8

/**
 * DNB Antilles juin 2026 - Question 2
 * K et M sont toujours disposés de sorte que O soit le milieu de [MK]
 * (M = 2O - K, avec un vecteur OK de coordonnées paires et non nulles pour
 * rester sur des nœuds du quadrillage). Les 3 distracteurs ne sont pas des
 * points choisis au hasard mais des pièges classiques :
 *  - le symétrique de K par rapport à l'axe VERTICAL passant par O,
 *  - le symétrique de K par rapport à l'axe HORIZONTAL passant par O,
 *  - le milieu du segment [OK] (confusion classique symétrique/milieu).
 * @author Rémi Angot
 */
export default class AutoQ2Antillesbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierMajuscules
    this.optionsDeComparaison = { texteSansCasse: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  private choisirDisposition(): Disposition {
    const magnitudes = [2, 4]
    const vx = choice(magnitudes) * choice([1, -1])
    const vy = choice(magnitudes) * choice([1, -1])
    const ox = randint(Math.abs(vx), GRID_MAX - Math.abs(vx))
    const oy = randint(Math.abs(vy), GRID_MAX - Math.abs(vy))

    const posO: [number, number] = [ox, oy]
    const posK: [number, number] = [ox + vx, oy + vy]
    const posM: [number, number] = [ox - vx, oy - vy]
    // Symétrique de K par rapport à l'axe vertical (x = ox) passant par O.
    const symetriqueVertical: [number, number] = [ox - vx, oy + vy]
    // Symétrique de K par rapport à l'axe horizontal (y = oy) passant par O.
    const symetriqueHorizontal: [number, number] = [ox + vx, oy - vy]
    // Milieu du segment [OK] (piège : milieu au lieu de symétrique).
    const milieuOK: [number, number] = [ox + vx / 2, oy + vy / 2]

    return {
      posO,
      posK,
      posM,
      posDistracteurs: [symetriqueVertical, symetriqueHorizontal, milieuOK],
    }
  }

  private construireFigure(labels: string[], disposition: Disposition): string {
    const { posO, posK, posM, posDistracteurs } = disposition
    const [labelK, labelM, ...labelsDistracteurs] = labels

    const figure = new Figure({
      xMin: -0.5,
      yMin: -0.5,
      width: (GRID_MAX + 1) * 36,
      height: (GRID_MAX + 1) * 36,
      pixelsPerUnit: 36,
    })
    figure.options.color = 'black'
    figure.create('Grid', {
      axeX: false,
      axeY: false,
      labelX: false,
      labelY: false,
    })

    figure.create('Point', {
      x: posK[0],
      y: posK[1],
      label: labelK,
      shape: 'x',
    })
    figure.create('Point', {
      x: posM[0],
      y: posM[1],
      label: labelM,
      shape: 'x',
    })
    figure.create('Point', { x: posO[0], y: posO[1], label: 'O', shape: 'x' })
    posDistracteurs.forEach((pos, i) => {
      figure.create('Point', {
        x: pos[0],
        y: pos[1],
        label: labelsDistracteurs[i],
        shape: 'x',
      })
    })
    figure.optimizeLabels()

    if (context.isTypst) return apigeomFigureToSvg(figure)
    return context.isHtml
      ? figure.getStaticHtml({ center: true })
      : figure.tikz()
  }

  enonce(labels?: string[], disposition?: Disposition) {
    if (disposition == null) {
      disposition = this.choisirDisposition()
    }
    if (labels == null) {
      const pool = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'L',
        'M',
        'N',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
      ]
      labels = shuffle(pool).slice(0, 5)
    }
    const [labelK, labelM] = labels
    const figure = this.construireFigure(labels, disposition)

    this.reponse = labelM
    this.question = `Dans le quadrillage ci-contre, quel est le symétrique du point $${labelK}$ par la symétrie centrale de centre $O$ ?<br>
${figure}`
    if (this.interactif) this.question += '<br>'

    this.correction = `Le point $O$ est le milieu du segment $[${labelM}${labelK}]$ donc le symétrique du point $${labelK}$ par la symétrie centrale de centre $O$ est $${miseEnEvidence(labelM)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.enonce(['K', 'M', 'L', 'P', 'N'], {
        posO: [3, 3],
        posK: [5, 5],
        posM: [1, 1],
        posDistracteurs: [
          [1, 5],
          [4, 4],
          [5, 1],
        ],
      })
    } else {
      this.enonce()
    }
  }
}
