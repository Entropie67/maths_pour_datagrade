import { courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { latex2d, texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Déterminer le produit de deux images à partir d'un graphique"
export const interactifReady = true

export const uuid = 'bndfk'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q20 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(type?: string): void {
    if (type == null) {
      type = choice(['01', '12', '02'])
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
    // tangente en x = nbre
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

    let x1: number
    let x2: number
    if (type === '01') {
      x1 = 0
      x2 = 1
    } else if (type === '12') {
      x1 = 1
      x2 = 2
    } else {
      x1 = 0
      x2 = 2
    }

    const f1 = F(x1)
    const f2 = F(x2)
    const reponse = f1 * f2

    this.question = `À partir du graphique ci-dessous qui représente une fonction $f$ et une tangente à cette représentation.<br>`
    this.question += graphique
    this.question += `<br>$f(${x1})\\times f(${x2})=${this.interactif ? '$' : '\\ldots$'}`

    this.correction = `$f(${x1})=${f1}$ et $f(${x2})=${f2}$, donc $f(${x1})\\times f(${x2})=${f1}\\times ${ecritureParentheseSiNegatif(f2)}=${miseEnEvidence(reponse)}$.`
    this.reponse = reponse
    this.canEnonce =
      `À partir du graphique ci-dessous qui représente une fonction $f$ et une tangente à cette représentation.<br>` +
      graphique
    this.canReponseACompleter = `$f(${x1})\\times f(${x2})=\\ldots$`
    this.canNumeroLie = 20
    this.canLiee = [21, 22]
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce('01')
    else this.enonce()
  }
}
