import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Convertir des dm en m et réciproquement'
export const interactifReady = true

export const uuid = '1bb1e'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = new FractionEtendue(7, 10).texFraction
      this.question = 'Complète : <br> $7\\text{ dm}=$ '
      this.correction = ` Comme $1\\text{ m}$ $=10\\text{ dm}$, alors $1\\text{ dm}=0,1\\text{ m}$.<br>
      Ainsi, pour passer des $\\text{dm}$ aux $\\text{m}$, on divise par $10$.<br>
        Comme $7\\div 10 =0,7$, alors $7\\text{ dm}=${miseEnEvidence('0,7')}\\text{ m}$. `
      this.canReponseACompleter = ' $7\\text{ dm}=\\ldots\\text{ m}$'
      if (this.interactif) {
        this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
      } else {
        this.question += `${context.isHtml ? '$\\ldots\\text{ m}$' : ''}`
      }
    } else {
      if (this.quotaChoice('cas', [true, false])) {
        const a = randint(3, 15)
        this.reponse = new FractionEtendue(a, 10).texFraction
        this.question = `Complète : <br>$${a}\\text{ dm}=$`
        this.correction = `
         Comme $1\\text{ m}$ $=10\\text{ dm}$, alors $1\\text{ dm}=0,1\\text{ m}$.<br>
        Ainsi, pour passer des $\\text{dm}$ aux $\\text{m}$, on divise par $10$.<br>
      Comme $${a}\\div 10 =${texNombre(a / 10, 1)}$, alors $${a}\\text{ dm}=${miseEnEvidence(texNombre(a / 10, 1))}\\text{ m}$.  `
        this.canReponseACompleter = `$${a}\\text{ dm}=\\ldots\\text{ m}$`
        if (this.interactif) {
          this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
        } else {
          this.question += `${context.isHtml ? '$\\ldots\\text{ m}$' : ''}`
        }
      } else {
        const a = randint(15, 60)
        this.reponse = String(a * 10)
        this.question = `Complète : <br> $${texNombre(a, 0)}\\text{ m}$ $=$ `
        if (this.interactif) {
          this.optionsChampTexte = { texteApres: '$\\text{ dm}$' }
        } else {
          this.question += `${context.isHtml ? '$\\ldots\\text{ dm}$' : ''}`
        }
        this.correction = ` Comme $1\\text{ m}$ $=10\\text{ dm}$,  pour passer des $\\text{m}$ aux $\\text{dm}$, on multiplie par $10$.<br>
            Comme $${texNombre(a, 1)}\\times 10 =${texNombre(a * 10, 0)}$, alors $${texNombre(a, 2)}\\text{ m}=${miseEnEvidence(texNombre(a * 10, 0))}\\text{ dm}$.`
        this.canReponseACompleter = ` $${texNombre(a, 0)}\\text{ m}$ $= \\ldots\\text{ dm}$`
      }
    }
    this.canEnonce = 'Complète.'
  }
}
