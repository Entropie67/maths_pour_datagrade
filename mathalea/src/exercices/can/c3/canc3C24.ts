import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre = 'Ajouter des dizaines/centaines'
export const interactifReady = true

export const dateDePublication = '10/01/2026'
/**
 * @author Gilles Mora
 */
export const uuid = '03256'

export const refs = {
  'fr-fr': ['canc3C24'],
  'fr-ch': [],
}
export default class AjouterDizainesCentaines extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.typeExercice = 'simple'
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '' }
  }

  nouvelleVersion() {
    switch (
      choice([1, 2, 3]) //
    ) {
      case 1:
        {
          const a = randint(2, 9) * 10 + randint(1, 9)
          const b = randint(3, 9) * 10
          this.question = `Calculer $${a}+${b}$.`
          this.correction = `$${a}+${b}=${miseEnEvidence(a + b)}$`
          this.reponse = a + b
          if (this.interactif) {
            this.question = `$${a}+${b}= $ `
          }
        }
        break
      case 2:
        {
          const a = randint(2, 9) * 100 + randint(2, 9) * 10 + randint(1, 9)
          const b = randint(3, 9) * 10
          this.question = `Calculer $${a}+${b}$.`
          this.correction = `$${a}+${b}=${miseEnEvidence(texNombre(a + b))}$`
          this.reponse = a + b
          if (this.interactif) {
            this.question = `$${a}+${b}= $ `
          }
        }
        break
      case 3:
      default:
        {
          const a = randint(2, 9) * 100 + randint(2, 9) * 10 + randint(1, 9)
          const b = randint(3, 9) * 100
          this.question = `Calculer $${a}+${b}$.`
          this.correction = `$${a}+${b}=${miseEnEvidence(texNombre(a + b))}$`
          this.reponse = a + b
          if (this.interactif) {
            this.question = `$${a}+${b}= $ `
          }
        }
        break
    }
  }
}
