import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une dérivée'
export const interactifReady = true

export const uuid = 'f78d0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ18 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.lycee
    this.optionsDeComparaison = { fonction: true, variable: 'x' }
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: " <br>$f'(x)=$" }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? -2 : randint(-5, 5, [-1, 0, 1])
    const b = this.canOfficielle ? 5 : randint(3, 9)
    this.reponse = `${a}\\times e^{${a}x}+\\dfrac{1}{${b}}`
    this.question = `Soit $f(x)=\\mathrm{e}^{${a}x}+\\dfrac{x}{${b}}$<br>`
    if (!this.interactif) {
      this.question += "$f'(x)=\\ldots$"
    }
    this.correction = `D'après le cours, si $f=\\mathrm{e}^u$ alors $f'=u'\\times \\mathrm{e}^{u}$.<br>
    De plus, $\\dfrac{x}{${b}}=\\dfrac{1}{${b}}x$.<br>
    Donc $f'(x)=${miseEnEvidence(`${a}\\mathrm{e}^{${a}x}+\\dfrac{1}{${b}}`)}$.`
    this.canEnonce = ` $f(x)=\\mathrm{e}^{${a}x}+\\dfrac{x}{${b}}$`
    this.canReponseACompleter = "$f'(x)=\\ldots$"
  }
}
