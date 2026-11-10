import { afficheLongueurSegment } from '../../../lib/2d/afficheLongueurSegment'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { labelPoint } from '../../../lib/2d/textes'
import { pointAdistance } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un produit scalaire dans un trapèze rectangle'
export const interactifReady = true

export const uuid = 'tm9ti'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q22 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(
    a?: number,
    b?: number,
    c?: number,
    choix?: string,
    choixb?: boolean,
  ): void {
    if (
      a == null ||
      b == null ||
      c == null ||
      choix == null ||
      choixb == null
    ) {
      a = randint(5, 10)
      b = randint(2, 4)
      c = randint(3, 6)
      choix = choice(['a', 'b', 'c'])
      choixb = choice([true, false])
    }

    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAdistance(A, a, 0, 'B', 'below')
    const D = pointAdistance(A, c, 90, 'D', 'above')
    const C = pointAdistance(D, b, 0, 'C', 'above')

    const poly = polygone(A, B, C, D)
    const a1 = afficheLongueurSegment(B, A, 'black', 0.5, '')
    const a2 = afficheLongueurSegment(D, C, 'black', 0.5, '')

    const objets = []
    const xmin = Math.min(A.x, B.x, C.x, D.x) - 1
    const ymin = Math.min(A.y, B.y, C.y, D.y) - 1
    const xmax = Math.max(A.x, B.x, C.x, D.x) + 1
    const ymax = Math.max(A.y, B.y, C.y, D.y) + 1

    objets.push(
      labelPoint(A, B, C, D),
      a1,
      a2,
      poly,
      codageAngleDroit(B, A, D),
      codageAngleDroit(A, D, C),
    )

    const graphique = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 15,
        mainlevee: false,
        amplitude: 0.3,
        scale: 0.5,
        center: !context.isHtml,
      },
      objets,
    )

    if (choix === 'a') {
      const vecteur2 = choixb ? '\\overrightarrow{AD}' : '\\overrightarrow{DA}'
      this.question = graphique
      this.reponse = 0
      if (this.interactif) {
        this.optionsChampTexte = {
          texteAvant: `$\\overrightarrow{AB}\\cdot ${vecteur2}=$`,
        }
      } else {
        this.question += `<br>Calculer $\\overrightarrow{AB}\\cdot ${vecteur2}$.`
      }
      this.correction = `Les vecteurs $\\overrightarrow{AB}$ et $${vecteur2}$ sont orthogonaux.<br>
      Donc $\\overrightarrow{AB}\\cdot ${vecteur2}=${miseEnEvidence(0)}$.`
      this.canEnonce = `$ABCD$ est un trapèze rectangle.<br>` + graphique
      this.canReponseACompleter = `$\\overrightarrow{AB}\\cdot ${vecteur2}=\\ldots$`
    }

    if (choix === 'b') {
      this.question = graphique
      this.reponse = -a * (a - b)
      if (this.interactif) {
        this.optionsChampTexte = {
          texteAvant: '$\\overrightarrow{AB}\\cdot \\overrightarrow{BC}=$',
        }
      } else {
        this.question +=
          '<br>Calculer $\\overrightarrow{AB}\\cdot \\overrightarrow{BC}$.'
      }
      this.correction = `Le projeté orthogonal du point $C$ sur $(AB)$ est le point $H$ tel que $BH=${a - b}$.<br>
      On a : $\\overrightarrow{AB}\\cdot \\overrightarrow{BC}=\\overrightarrow{AB}\\cdot \\overrightarrow{BH}$ avec $\\overrightarrow{AB}$ et $\\overrightarrow{BH}$ colinéaires de sens contraire.<br>
      On en déduit $\\overrightarrow{AB}\\cdot \\overrightarrow{BC}=-AB\\times BH=-${a}\\times ${a - b}=${miseEnEvidence(-a * (a - b))}$.`
      this.canEnonce = `$ABCD$ est un trapèze rectangle.<br>` + graphique
      this.canReponseACompleter =
        '$\\overrightarrow{AB}\\cdot \\overrightarrow{BC}=\\ldots$'
    }

    if (choix === 'c') {
      const vecteur2 = choixb ? '\\overrightarrow{DC}' : '\\overrightarrow{CD}'
      this.question = graphique
      this.reponse = choixb ? a * b : -a * b
      if (this.interactif) {
        this.optionsChampTexte = {
          texteAvant: `$\\overrightarrow{AB}\\cdot ${vecteur2}=$`,
        }
      } else {
        this.question += `<br>Calculer $\\overrightarrow{AB}\\cdot ${vecteur2}$.`
      }
      this.correction = `Les vecteurs $\\overrightarrow{AB}$ et $${vecteur2}$ sont colinéaires ${choixb ? 'de même sens' : 'de sens contraire'}.<br>
      On a : $\\overrightarrow{AB}\\cdot ${vecteur2}=${a}\\times ${choixb ? `${b}` : `(-${b})`}=${miseEnEvidence(choixb ? a * b : -a * b)}$.`
      this.canEnonce = `$ABCD$ est un trapèze rectangle.<br>` + graphique
      this.canReponseACompleter = `$\\overrightarrow{AB}\\cdot ${vecteur2}=\\ldots$`
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5, 2, 3, 'c', false)
    else this.enonce()
  }
}
