import { droite } from '../../../lib/2d/droites'
import { symboleParallele } from '../../../lib/outils/notationsGeometrie'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Calculer une longueur à l'aide du théorème de Thalès (triangles emboîtés)"
export const interactifReady = true

export const uuid = 'wela0'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q27 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '$CE=$' }
  }

  enonce(ab?: number, k?: number, dc?: number) {
    if (ab == null || k == null || dc == null) {
      ab = randint(1, 4)
      k = randint(2, 3)
      dc = randint(k * ab, 22)
    }

    const be = k * ab
    const A = pointAbstrait(6, 0, 'A', 'below right')
    const D = pointAbstrait(0.46, 2.92, 'D', 'above left')
    const E = pointAbstrait(4, 1, 'E', 'below')
    const B = pointAbstrait(6.22, 2, 'B', 'above right')
    const C = pointAbstrait(0, -1, 'C', 'left')
    const xmin = -1
    const ymin = -1.5
    const xmax = 7.5
    const ymax = 4
    const objets: NestedObjetMathalea2dArray = []
    objets.push(
      texteParPosition(
        `${ab}`,
        milieu(A, B).x + 0.3,
        milieu(A, B).y - 0.2,
        0,
        'black',
        1,
        'milieu',
        true,
      ),
      texteParPosition(
        '?',
        milieu(C, E).x,
        milieu(C, E).y - 0.5,
        0,
        'black',
        1,
        'milieu',
        true,
      ),
      texteParPosition(
        `${be}`,
        milieu(B, E).x,
        milieu(B, E).y + 0.2,
        0,
        'black',
        1,
        'milieu',
        true,
      ),
      texteParPosition(
        `${dc}`,
        milieu(D, C).x - 0.3,
        milieu(C, B).y + 0.5,
        0,
        'black',
        1,
        'milieu',
        true,
      ),
      labelPoint(A, B, C, D, E),
      droite(B, C),
      droite(D, A),
      droite(C, D),
      droite(A, B),
    )

    const reponse = k * dc

    this.question = `$(AB)${symboleParallele()}(CD)$<br><br>`
    this.question += mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 25,
        mainlevee: false,
        amplitude: 0.5,
        scale: 0.7,
      },
      objets,
    )

    if (!this.interactif && context.isHtml) {
      this.question += '<br>$CE=\\ldots$'
    }

    this.correction = `Le triangle $ECD$ est un agrandissement du triangle $EAB$. La longueur $BE$ est $${k}$ fois plus grande que la longueur $AB$.
On en déduit que la longueur $EC$ est $${k}$ fois plus grande que la longueur $CD$.<br>
Ainsi, $CE=${k}\\times ${dc}=${miseEnEvidence(reponse)}$.`
    this.reponse = reponse
    this.canEnonce = `$(AB)${symboleParallele()}(CD)$<br><br>`
    this.canEnonce += mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 25,
        mainlevee: false,
        amplitude: 0.5,
        scale: 0.7,
      },
      objets,
    )
    this.canReponseACompleter = '$CE=\\ldots$'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 2, 11)
    else this.enonce()
  }
}
