import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { latex2d, texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Donner le nombre de solutions d'une équation à partir d'un graphique"
export const interactifReady = true

export const uuid = 'w5wjo'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q21 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(nbre?: number): void {
    if (nbre == null) {
      nbre = choice([1, 2, 3, 4])
    }

    const r = repere({
      xMin: -1,
      xMax: 3,
      xUnite: 2,
      yMin: -1,
      yMax: 5,
      grilleXDistance: 2,
      thickHauteur: 0.2,
      xLabelMin: -1,
      xLabelMax: 3,
      yLabelMax: 4,
      yLabelMin: -4,
      xThickMax: 3,
      axeXStyle: '->',
      axeYStyle: '->',
      yLabelDistance: 1,
      yLabelEcart: 0.6,
    })
    const F = (x: number) => 2.75 * x ** 3 - 9.75 * x ** 2 + 9 * x + 2
    const fDerivee = (x: number) => 8.25 * x ** 2 - 19.5 * x + 9
    const tang = (x: number) => fDerivee(2) * (x - 2) + F(2)
    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const cf = latex2d('\\mathscr{C}_f', 0.5, 2.5, {
      color: bleuMathalea,
      letterSize: 'normalsize',
    })

    const graphique = mathalea2d(
      { xmin: -4, xmax: 6, ymin: -1.1, ymax: 5.1, pixelsParCm: 30, scale: 0.8 },
      r,
      o,
      cf,
      courbe(F, { repere: r, color: bleuMathalea, epaisseur: 1.5, step: 0.05 }),
      courbe(tang, { repere: r, color: 'red', epaisseur: 2 }),
    )

    // F(x) = 2.75x³ - 9.75x² + 9x + 2
    // F(0)=2, F(1)=4, F(2)=-0.5, F(3)=2
    // Max local en x≈0.55 : F≈4.3 ; Min local en x≈1.82 : F≈-0.6
    // y=1 → 3 solutions, y=2 → 2 solutions, y=3 → 1 solution, y=4 → 1 solution
    let reponse: number
    if (nbre === 1 || nbre === 2) {
      reponse = 1
    } else {
      reponse = 3
    }

    this.question = `À partir du graphique ci-dessous qui représente une fonction $f$ et une tangente à cette représentation.<br>`
    this.question += graphique
    this.question += `<br>Quel est le nombre de solutions de $f(x)= ${nbre}$ ?${this.interactif ? '' : ' $\\ldots$'}`

    this.correction = `La droite d'équation $y=${nbre}$ coupe $${reponse}$ fois la courbe de $f$, on en déduit que le nombre de solutions de l'équation $f(x)=${nbre}$ est $${miseEnEvidence(reponse)}$.`
    this.reponse = reponse
    this.canEnonce =
      `À partir du graphique ci-dessous qui représente une fonction $f$ et une tangente à cette représentation.<br>` +
      graphique
    this.canReponseACompleter = `Quel est le nombre de solutions de $f(x)=${nbre}$ ?<br>
     $\\ldots$ solution(s)`
    this.canNumeroLie = 21
    this.canLiee = [20, 22]
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3)
    else this.enonce()
  }
}
