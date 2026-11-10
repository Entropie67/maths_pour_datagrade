import { point } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer l'affixe du symétrique d'un point par rapport à un autre"
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '2f495'
export const refs = {
  'fr-fr': ['TEC2-14'],
  'fr-ch': [],
}

const triplets = [
  ['A', 'B', 'C'],
  ['M', 'N', 'P'],
  ['E', 'F', 'G'],
  ['R', 'S', 'T'],
  ['H', 'K', 'L'],
]

/**
 * Calculer l'affixe de C, symétrique de B par rapport à A (A milieu de [BC]).
 * @author Stéphane Guyon
 */
export default class AffixeSymetrique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const xA = randint(-6, 6)
      const yA = randint(-6, 6)
      const xB = randint(-6, 6)
      const yB = randint(-6, 6)
      if (
        (xA !== xB || yA !== yB) &&
        this.questionJamaisPosee(i, xA, yA, xB, yB)
      ) {
        const [P, Q, R] = triplets[i % triplets.length]
        const zA = new Complexe(xA, yA)
        const zB = new Complexe(xB, yB)
        const xC = 2 * xA - xB
        const yC = 2 * yA - yB
        const zC = new Complexe(xC, yC)
        const affixe = zC.tex()
        const oppose = new Complexe(-xB, -yB).tex()
        const developpe = `${new Complexe(2 * xA, 2 * yA).tex()}${oppose.startsWith('-') ? '' : '+'}${oppose}`
        // Les graduations sont sous l'axe des abscisses et à gauche de celui des ordonnées :
        // l'étiquette est toujours rejetée du côté opposé aux axes.
        const position = (x: number, y: number) =>
          `${y >= 0 ? 'above' : 'below'} ${x >= 0 ? 'right' : 'left'}`
        const A = point(xA, yA, P, position(xA, yA))
        const B = point(xB, yB, Q, position(xB, yB))
        const C = point(xC, yC, R, position(xC, yC))
        const xs = [xA, xB, xC, 0]
        const ys = [yA, yB, yC, 0]
        const xMin = Math.min(...xs) - 1
        const xMax = Math.max(...xs) + 1
        const yMin = Math.min(...ys) - 1
        const yMax = Math.max(...ys) + 1
        const segBC = segment(B, C)
        segBC.pointilles = 2
        const figure = mathalea2d(
          {
            xmin: xMin - 0.5,
            xmax: xMax + 0.5,
            ymin: yMin - 0.5,
            ymax: yMax + 0.5,
            pixelsParCm: 20,
            scale: 0.5,
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
          segBC,
          tracePoint(A, B, C),
          labelPoint(A, B, C),
        )
        createQuestion(this, i, {
          question: `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, on considère les points $${P}$ et $${Q}$ d'affixes respectives $z_${P}=${zA.tex()}$ et $z_${Q}=${zB.tex()}$.<br>Soit $${R}$ le symétrique de $${Q}$ par rapport à $${P}$.${this.interactif ? '' : `<br>Déterminer l'affixe de $${R}$.`}`,
          correction: `Notons $z_${R}=x+iy$ l'affixe de $${R}$, avec $x$ et $y$ réels.<br>
          $${R}$ est le symétrique de $${Q}$ par rapport à $${P}$, donc $${P}$ est le milieu de $[${Q}${R}]$ :<br>
          $z_${P}=\\dfrac{z_${Q}+z_${R}}{2}$, d'où $z_${R}=2z_${P}-z_${Q}$.<br>
          $z_${R}=2\\times(${zA.tex()})-(${zB.tex()})=${developpe}=${miseEnEvidence(affixe)}$<br>${figure}`,
          answer: { value: affixe },
          field: {
            keyboard: KeyboardType.complexes,
            texteAvant: `<br>$z_${R}=$`,
          },
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
