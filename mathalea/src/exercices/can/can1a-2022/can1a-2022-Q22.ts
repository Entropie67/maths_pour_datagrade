import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { latex2d, texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Déterminer le coefficient directeur d'une tangente à partir d'un graphique"
export const interactifReady = true

export const uuid = '7ozz7'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q22 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(): void {
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

    // f'(2) = 8.25×4 - 19.5×2 + 9 = 33 - 39 + 9 = 3
    const reponse = fDerivee(2)

    this.question = `À partir du graphique ci-dessous qui représente une fonction $f$ et une tangente à cette représentation.<br>`
    this.question += graphique
    this.question += `<br>Quel est le coefficient directeur $a$ de la tangente à $\\mathscr{C}_f$ au point d'abscisse $2$ ?${this.interactif ? '' : ' $\\ldots$'}`

    this.correction = `Le coefficient directeur de la tangente à la courbe au point d'abscisse $2$ est  $${miseEnEvidence(reponse)}$.`
    this.reponse = reponse
    this.canEnonce =
      `À partir du graphique ci-dessous qui représente une fonction $f$ et une tangente à cette représentation.<br>` +
      graphique
    this.canReponseACompleter = `Quel est le coefficient directeur $a$ de la tangente au point d'abscisse $2$ ? <br>$\\ldots$`
    this.canNumeroLie = 22
    this.canLiee = [20, 21]
  }

  nouvelleVersion(): void {
    this.enonce()
  }
}
