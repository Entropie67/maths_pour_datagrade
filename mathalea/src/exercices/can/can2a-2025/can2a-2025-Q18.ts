import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Déterminer un coefficient multiplicateur ou un taux d'évolution"
export const interactifReady = true

export const uuid = '2462a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class CoeffMultiplicateur extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question = 'Multiplier par $0,8$ revient à faire une baisse de : '
      this.correction = `Comme $0,8=1-0,2=1-\\dfrac{20}{100}$, multiplier par $0,8$ revient à baisser de $${miseEnEvidence('20')}\\,\\%$. `
      this.reponse = 20
      this.optionsChampTexte = { texteApres: '$\\%$.' }
      if (!this.interactif) {
        this.question += '$\\ldots\\,\\%$'
      }
      this.canEnonce = 'Multiplier par $0,8$ revient à baisser de  '
      this.canReponseACompleter = '$\\ldots\\,\\%$'
    } else {
      const taux = new Decimal(randint(1, 29, [10, 20])).div(100)
      const Taux = taux.mul(100)
      const coeff = taux.add(1)
      if (choice([true, false])) {
        this.question = `Multiplier par $${texNombre(coeff, 2)}$ revient à augmenter de  `
        this.correction = `Comme $${texNombre(coeff, 2)}=1+${texNombre(taux, 2)}=1+\\dfrac{${Taux}}{100}$, multiplier par $${texNombre(coeff, 2)}$ revient à augmenter de $${miseEnEvidence(texNombre(Taux, 0))}\\,\\%$. `
        this.reponse = new Decimal(taux).mul(100)
        this.optionsChampTexte = { texteApres: '$\\%$.' }
        if (!this.interactif) {
          this.question += '$\\ldots\\,\\%$'
        }
        this.canEnonce = `Multiplier par $${texNombre(coeff, 2)}$ revient à augmenter de  `
        this.canReponseACompleter = '$\\ldots\\,\\%$'
      } else {
        this.question = `Augmenter de $${texNombre(Taux, 0)}\\,\\%$ revient à multiplier par : `
        this.correction = `Augmenter de $${texNombre(Taux, 0)}\\,\\%$ revient à multiplier par $1 + \\dfrac{${texNombre(Taux, 0)}}{100} = 1 + ${texNombre(taux, 2)} = ${miseEnEvidence(texNombre(coeff, 2))}$.`

        if (!this.interactif) {
          this.question += '$\\ldots$'
        }
        this.reponse = coeff
        this.canEnonce = `Augmenter de $${texNombre(Taux, 0)}\\,\\%$ revient à multiplier par `
      }
    }
  }
}
