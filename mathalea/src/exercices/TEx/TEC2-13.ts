import { codageMilieu } from '../../lib/2d/CodageMilieu'
import { point } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { choice } from '../../lib/outils/arrayOutils'
import { bleuMathalea } from '../../lib/colors'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer l’affixe du milieu d’un segment'
export const dateDePublication = '28/10/2026'
export const uuid = 'fd0bc'
export const interactifReady = true
export const refs = { 'fr-fr': ['TEC2-10-3'], 'fr-ch': [] }

/** @author Stéphane Guyon */
export default class AfficheMilieuSegment extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 2
  }

  nouvelleVersion(): void {
    for (let i = 0; i < this.nbQuestions; i++) {
      const noms = choice([
        ['A', 'B', 'I'],
        ['M', 'N', 'K'],
        ['P', 'Q', 'J'],
      ])
      const [nomA, nomB, nomI] = noms
      // Les parties réelles et imaginaires ont même parité deux à deux :
      // le milieu a des coordonnées entières.
      const xa = randint(-4, 4)
      const ya = randint(-4, 4)
      const xb = xa + 2 * randint(-3, 3, [0])
      const yb = ya + 2 * randint(-3, 3)
      const xi = (xa + xb) / 2
      const yi = (ya + yb) / 2
      const za = new Complexe(xa, ya)
      const zb = new Complexe(xb, yb)
      const zi = new Complexe(xi, yi)

      const A = point(xa, ya, nomA, 'above left')
      const B = point(xb, yb, nomB, 'above right')
      const I = point(xi, yi, nomI, 'below')
      const xMin = Math.min(xa, xb, 0) - 1.5
      const xMax = Math.max(xa, xb, 0) + 1.5
      const yMin = Math.min(ya, yb, 0) - 1.5
      const yMax = Math.max(ya, yb, 0) + 1.5
      const seg = segment(A, B, bleuMathalea)
      const figure = mathalea2d(
        {
          xmin: xMin - 0.5,
          xmax: xMax + 0.5,
          ymin: yMin - 0.5,
          ymax: yMax + 0.5,
          pixelsParCm: 30,
          scale: 0.7,
        },
        repere({
          xMin,
          xMax,
          yMin,
          yMax,
          xUnite: 1,
          yUnite: 1,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: 'gray',
          grilleOpacite: 0.4,
          xThickDistance: 1,
          yThickDistance: 1,
          xLegende: '',
          yLegende: '',
          axeXStyle: '->',
          axeYStyle: '->',
        }),
        seg,
        codageMilieu(A, B, bleuMathalea, '×', false),
        tracePoint(A, B, I),
        labelPoint(A, B, I),
      )
      createQuestion(this, i, {
        question: `Dans le plan complexe, on considère les points $${nomA}$ et $${nomB}$ d’affixes respectives $z_${nomA}=${za.tex()}$ et $z_${nomB}=${zb.tex()}$.<br>Calculer l’affixe $z_${nomI}$ du milieu $${nomI}$ du segment $[${nomA}${nomB}]$.`,
        correction: `Le milieu $${nomI}$ de $[${nomA}${nomB}]$ a pour affixe la moyenne des affixes de $${nomA}$ et $${nomB}$ :<br>$z_${nomI}=\\dfrac{z_${nomA}+z_${nomB}}{2}=\\dfrac{(${za.tex()})+(${zb.tex()})}{2}=\\dfrac{${new Complexe(xa + xb, ya + yb).tex()}}{2}=${miseEnEvidence(zi.tex())}$<br>${figure}`,
        answer: { value: zi.tex() },
        field: {
          keyboard: KeyboardType.complexes,
          texteAvant: `<br>$z_${nomI}=$`,
        },
      })
    }
  }
}
