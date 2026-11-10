import { point } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { repere } from '../../lib/2d/reperes'
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
  "Déterminer l'affixe du quatrième sommet d'un parallélogramme"
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = 'f7eaa'
export const refs = {
  'fr-fr': ['TEC2-12'],
  'fr-ch': [],
}

/**
 * Déterminer l'affixe de D tel que ABCD soit un parallélogramme : z_D = z_A + z_C - z_B.
 * @author Stéphane Guyon
 */
export default class AffixeQuatriemeSommet extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const m = 6
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const xA = randint(-m, m)
      const yA = randint(-m, m)
      const xB = randint(-m, m)
      const yB = randint(-m, m)
      const xC = randint(-m, m)
      const yC = randint(-m, m)
      // Les vecteurs AB et AD (= BC) ont des composantes d'au moins 2 en valeur absolue
      // et le parallélogramme n'est pas aplati : le déterminant de AB et BC est assez grand
      const composantes = [xB - xA, yB - yA, xC - xB, yC - yB]
      if (composantes.some((c) => Math.abs(c) < 2)) continue
      if (Math.abs((xB - xA) * (yC - yB) - (yB - yA) * (xC - xB)) < 8) continue
      if (!this.questionJamaisPosee(i, xA, yA, xB, yB, xC, yC)) continue
      const zA = new Complexe(xA, yA)
      const zB = new Complexe(xB, yB)
      const zC = new Complexe(xC, yC)
      const xD = xA + xC - xB
      const yD = yA + yC - yB
      const zD = new Complexe(xD, yD)
      const A = point(xA, yA, 'A', 'above left')
      const B = point(xB, yB, 'B', 'below left')
      const C = point(xC, yC, 'C', 'below right')
      const D = point(xD, yD, 'D', 'above right')
      const xs = [xA, xB, xC, xD, 0]
      const ys = [yA, yB, yC, yD, 0]
      const xMin = Math.min(...xs) - 1
      const xMax = Math.max(...xs) + 1
      const yMin = Math.min(...ys) - 1
      const yMax = Math.max(...ys) + 1
      const figure = mathalea2d(
        {
          xmin: xMin - 0.5,
          xmax: xMax + 0.5,
          ymin: yMin - 0.5,
          ymax: yMax + 0.5,
          pixelsParCm: 30,
          scale: 0.6,
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
        polygone([A, B, C, D]),
        tracePoint(A, B, C, D),
        labelPoint(A, B, C, D),
      )
      createQuestion(this, i, {
        question: `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, on considère les points $A$, $B$ et $C$ d'affixes respectives $z_A=${zA.tex()}$, $z_B=${zB.tex()}$ et $z_C=${zC.tex()}$.<br>Déterminer l'affixe du point $D$ tel que $ABCD$ soit un parallélogramme.`,
        correction: `${figure}<br>Notons $z_D$ l'affixe du point $D$.<br>$ABCD$ est un parallélogramme si et seulement si $\\overrightarrow{AB}=\\overrightarrow{DC}$, c'est-à-dire $z_B-z_A=z_C-z_D$.<br>
          On en déduit que $z_D=z_A+z_C-z_B$.<br>
          $z_D=(${zA.tex()})+(${zC.tex()})-(${zB.tex()})=${miseEnEvidence(zD.tex())}$`,
        answer: { value: zD.tex() },
        field: {
          keyboard: KeyboardType.complexes,
          texteAvant: '<br>$z_D=$',
        },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
