import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une somme de nombres avec des unités'
export const dateDePublication = '05/11/2022'
export const interactifReady = true

/**
 * @author Gilles Mora
 * Créé le 5/11/2022

 */

export const uuid = '85e82'

export const refs = {
  'fr-fr': ['canc3M03'],
  'fr-ch': [],
}
export default class CalculAvecUnite extends ExerciceSimple {
  constructor() {
    super()

    this.nbQuestions = 1

    this.typeExercice = 'simple'

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const prefixes = ['k', 'h', 'da', '', 'd', 'c', 'm']

    const unite = this.quotaChoice('unite', ['g', 'm', 'L'])
    let k
    const a = this.quotaRandint('a', 1, 9)
    const b = this.quotaRandint('b', 1, 19)
    switch (this.quotaChoice('cas', [1, 2, 3])) {
      case 1:
        k = randint(0, 5)
        if (choice([true, false])) {
          this.question = `Compléter : <br>
        $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 1]}${unite} }= ${this.interactif ? '' : `\\ldots \\text{ ${prefixes[k + 1]}${unite}}`}$`
          this.reponse = a * 10 + b
          this.optionsChampTexte = {
            texteApres: `$\\text{ ${prefixes[k + 1]}${unite}}$`,
          }
          this.correction = `$${a}\\text{ ${prefixes[k]}${unite} }=${a * 10}\\text{ ${prefixes[k + 1]}${unite} }$<br>
        Ainsi, $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 1]}${unite} }
        = ${a * 10}\\text{ ${prefixes[k + 1]}${unite}}+${b}\\text{ ${prefixes[k + 1]}${unite} }
        = ${miseEnEvidence(a * 10 + b)}\\text{ ${prefixes[k + 1]}${unite}}$.`
          this.canEnonce = 'Compléter. '
          this.canReponseACompleter = `$${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 1]}${unite} }= \\ldots \\text{ ${prefixes[k + 1]}${unite}}$`
        } else {
          this.question = `Compléter : <br>
        $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 1]}${unite} }= ${this.interactif ? '' : `\\ldots \\text{ ${prefixes[k]}${unite}}`}$`
          this.reponse = a + b / 10
          this.optionsChampTexte = {
            texteApres: `$\\text{ ${prefixes[k]}${unite}}$`,
          }
          this.correction = `$${b}\\text{ ${prefixes[k + 1]}${unite} }=${texNombre(b / 10, 1)}\\text{ ${prefixes[k]}${unite} }$<br>
        Ainsi, $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 1]}${unite} }
        = ${a}\\text{ ${prefixes[k]}${unite}}+${texNombre(b / 10, 1)}\\text{ ${prefixes[k]}${unite} }
        = ${miseEnEvidence(texNombre(a + b / 10, 1))}\\text{ ${prefixes[k]}${unite}}$.`
          this.canEnonce = 'Compléter. '
          this.canReponseACompleter = `$${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 1]}${unite} }= \\ldots \\text{ ${prefixes[k]}${unite}}$`
        }
        break

      case 2:
        k = randint(0, 4)
        if (choice([true, false])) {
          this.question = `Compléter : <br>
            $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 2]}${unite} }= ${this.interactif ? '' : `\\ldots \\text{ ${prefixes[k + 2]}${unite}}`}$`
          this.reponse = a * 100 + b
          this.optionsChampTexte = {
            texteApres: `$\\text{ ${prefixes[k + 2]}${unite}}$`,
          }
          this.correction = `$${a}\\text{ ${prefixes[k]}${unite} }=${a * 100}\\text{ ${prefixes[k + 2]}${unite} }$<br>
            Ainsi, $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 2]}${unite} }
            = ${a * 100}\\text{ ${prefixes[k + 2]}${unite}}+${b}\\text{ ${prefixes[k + 2]}${unite} }
            = ${miseEnEvidence(a * 100 + b)}\\text{ ${prefixes[k + 2]}${unite}}$.`
          this.canEnonce = 'Compléter. '
          this.canReponseACompleter = `$${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 2]}${unite} }= \\ldots \\text{ ${prefixes[k + 2]}${unite}}$`
        } else {
          this.question = `Compléter : <br>
            $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 2]}${unite} }= ${this.interactif ? '' : `\\ldots \\text{ ${prefixes[k]}${unite}}`}$`
          this.reponse = a + b / 100
          this.optionsChampTexte = {
            texteApres: `$\\text{ ${prefixes[k]}${unite}}$`,
          }
          this.correction = `$${b}\\text{ ${prefixes[k + 2]}${unite} }=${texNombre(b / 100, 2)}\\text{ ${prefixes[k]}${unite} }$<br>
            Ainsi, $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 2]}${unite} }
            = ${a}\\text{ ${prefixes[k]}${unite}}+${texNombre(b / 100, 2)}\\text{ ${prefixes[k]}${unite} }
            = ${miseEnEvidence(texNombre(a + b / 100, 2))}\\text{ ${prefixes[k]}${unite}}$.`
          this.canEnonce = 'Compléter. '
          this.canReponseACompleter = `$${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 2]}${unite} }= \\ldots \\text{ ${prefixes[k]}${unite}}$`
        }
        break

      case 3:
        k = randint(0, 3)
        if (choice([true, false])) {
          this.question = `Compléter : <br>
                $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 3]}${unite} }= ${this.interactif ? '' : `\\ldots \\text{ ${prefixes[k + 3]}${unite}}`}$`
          this.reponse = a * 1000 + b
          this.optionsChampTexte = {
            texteApres: `$\\text{ ${prefixes[k + 3]}${unite}}$`,
          }
          this.correction = `$${a}\\text{ ${prefixes[k]}${unite} }=${texNombre(a * 1000)}\\text{ ${prefixes[k + 3]}${unite} }$<br>
                Ainsi, $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 3]}${unite} }
                = ${texNombre(a * 1000)}\\text{ ${prefixes[k + 3]}${unite}}+${b}\\text{ ${prefixes[k + 3]}${unite} }
                = ${miseEnEvidence(texNombre(a * 1000 + b))}\\text{ ${prefixes[k + 3]}${unite}}$.`
          this.canEnonce = 'Compléter. '
          this.canReponseACompleter = `$${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 3]}${unite} }= \\ldots \\text{ ${prefixes[k + 3]}${unite}}$`
        } else {
          this.question = `Compléter : <br>
                $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 3]}${unite} }= ${this.interactif ? '' : `\\ldots \\text{ ${prefixes[k]}${unite}}`}$`
          this.reponse = a + b / 1000
          this.optionsChampTexte = {
            texteApres: `$\\text{ ${prefixes[k]}${unite}}$`,
          }
          this.correction = `$${b}\\text{ ${prefixes[k + 3]}${unite} }=${texNombre(b / 1000, 3)}\\text{ ${prefixes[k]}${unite} }$<br>
                Ainsi, $${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 3]}${unite} }
                = ${a}\\text{ ${prefixes[k]}${unite}}+${texNombre(b / 1000, 3)}\\text{ ${prefixes[k]}${unite} }
                = ${miseEnEvidence(texNombre(a + b / 1000, 3))}\\text{ ${prefixes[k]}${unite}}$.`
          this.canEnonce = 'Compléter. '
          this.canReponseACompleter = `$${a}\\text{ ${prefixes[k]}${unite}}+${b}\\text{ ${prefixes[k + 3]}${unite} }= \\ldots \\text{ ${prefixes[k]}${unite}}$`
        }
        break
    }
  }
}
