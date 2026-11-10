import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Travailler les racines carrées avec des phrases'
export const interactifReady = true

export const dateDePublication = '19/12/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/

export const uuid = '66201'

export const refs = {
  'fr-fr': ['can2N5-01', '2N50-flash1'],
  'fr-ch': [''],
}
export default class CalculAvecRacineDefphrase extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, choix
    switch (
      this.quotaChoice('cas', [1, 2, 3]) //
    ) {
      case 1:
        a = randint(2, 10)
        choix = choice([true, false])
        this.question = `Donner le nombre ${choix ? 'positif' : 'négatif'} dont le carré est $${a}$.`
        if (a === 4) {
          this.correction = `Par définition, le nombre positif dont le carré est $${a}$ est`
          this.correction += `${choix ? `$\\sqrt{${a}}=${miseEnEvidence(2)}$.<br>` : ` $\\sqrt{${a}}$.<br>Ainsi, le nombre négatif dont le carré est $${a}$ est $-\\sqrt{${a}}=${miseEnEvidence(-2)}$.`}`
        }
        if (a === 9) {
          this.correction = `Par définition, le nombre positif dont le carré est $${a}$ est`
          this.correction += `${choix ? `$\\sqrt{${a}}=${miseEnEvidence(3)}$.<br>` : ` $\\sqrt{${a}}$.<br>Ainsi, le nombre négatif dont le carré est $${a}$ est $-\\sqrt{${a}}=${miseEnEvidence(-3)}$.`}`
        }
        if (a !== 4 && a !== 9) {
          this.correction = `Par définition, le nombre positif dont le carré est $${a}$ est `
          this.correction += `${choix ? `$${miseEnEvidence(`\\sqrt{${a}}`)}$.<br>` : `$\\sqrt{${a}}$.<br>Ainsi, le nombre négatif dont le carré est $${a}$ est $${miseEnEvidence('-')} ${miseEnEvidence(`\\sqrt{${a}}`)}$.`}`
        }
        this.reponse = choix
          ? [`\\sqrt{${a}}`, `${Math.sqrt(a)}`]
          : [`-\\sqrt{${a}}`, `-${Math.sqrt(a)}`]
        break

      case 2:
        a = randint(2, 10)
        choix = choice([true, false])
        if (choice([true, false])) {
          this.question = `Un nombre ${choix ? 'positif' : 'négatif'} a pour carré $${a}$.<br>
                Quel est ce nombre ?`
        } else {
          this.question = `Le carré d'un nombre ${choix ? 'positif' : 'négatif'} est $${a}$.<br>
                Quel est ce nombre ?`
        }

        if (a === 4) {
          this.correction = `Par définition, le nombre positif dont le carré est $${a}$ est `
          this.correction += `${choix ? `$\\sqrt{${a}}=${miseEnEvidence(2)}$.` : `$\\sqrt{${a}}$.<br>Ainsi, le nombre négatif dont le carré est $${a}$ est $-\\sqrt{${a}}=${miseEnEvidence(-2)}$.`}`
        }
        if (a === 9) {
          this.correction = `Par définition, le nombre positif dont le carré est $${a}$ est `
          this.correction += `${choix ? `$\\sqrt{${a}}=${miseEnEvidence(3)}$.` : `$\\sqrt{${a}}$.<br>Ainsi, le nombre négatif dont le carré est $${a}$ est $-\\sqrt{${a}}=${miseEnEvidence(-3)}$.`}`
        }
        if (a !== 4 && a !== 9) {
          this.correction = `Par définition, le nombre positif dont le carré est $${a}$ est `
          this.correction += `${choix ? `$${miseEnEvidence(`\\sqrt{${a}}`)}$.` : `$\\sqrt{${a}}$.<br>Ainsi, le nombre négatif dont le carré est $${a}$ est $${miseEnEvidence('-')} ${miseEnEvidence(`\\sqrt{${a}}`)}$.`}`
        }
        this.reponse = choix
          ? [`\\sqrt{${a}}`, `${Math.sqrt(a)}`]
          : [`-\\sqrt{${a}}`, `-${Math.sqrt(a)}`]
        break

      case 3:
      default:
        a = randint(1, 12)
        this.question = `Quel est le nombre dont la racine carrée vaut $${a}$ ?`
        this.correction = `Comme $\\sqrt{${a ** 2}}=${a}$, le nombre dont la racine carrée est $${a}$ est $${miseEnEvidence(`${a ** 2}`)}$.`

        this.reponse = a * a
        break
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
