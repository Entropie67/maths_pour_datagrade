import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer astucieusement une somme de deux décimaux'
export const interactifReady = true

export const uuid = '3e52d'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: number
    if (this.canOfficielle) {
      reponse = 11.8
      this.question = '$1,8+5,3+4,7$ '
      this.correction = `$1,8+\\underbrace{5,3+4,7}_{=10}=${miseEnEvidence(texNombre(reponse, 1))}$`
    } else {
      const choix1 = choice([true, false])
      const choix = this.quotaRandint('choix', 1, 2)
      if (choix === 1) {
        const a = randint(11, 49, [15, 20, 25, 30, 35, 40, 45]) / 10
        const b = 10 - a
        const c = randint(21, 59, [30, 40, 50]) / 10
        reponse = a + b + c
        this.question = `${
          choix1
            ? `$${texNombre(c, 2)}+${texNombre(a, 2)}+${texNombre(b, 2)}=$`
            : `$${texNombre(a, 2)}+${texNombre(c, 2)}+${texNombre(b, 2)}$`
        }`
        this.correction = `${
          choix1
            ? `$${texNombre(c, 2)}+\\underbrace{${texNombre(a, 2)}+${texNombre(b, 2)}}_{=10}=${miseEnEvidence(texNombre(reponse, 2))}$`
            : `$${texNombre(a, 2)}+${texNombre(c, 2)}+${texNombre(b, 2)}=${texNombre(c, 2)}+\\underbrace{${texNombre(a, 2)}+${texNombre(b, 2)}}_{=1}=${miseEnEvidence(texNombre(reponse, 2))}$`
        }`
      } else {
        const a = randint(11, 49, [20, 30, 40]) / 100
        const b = 1 - a
        const c = randint(21, 59, [30, 40, 50]) / 100
        reponse = a + b + c
        this.question = `$${texNombre(c, 2)}+${texNombre(a, 2)}+${texNombre(b, 2)}$`
        this.correction = ` $${texNombre(c, 2)}+\\underbrace{${texNombre(a, 2)}+${texNombre(b, 2)}}_{=1}=${miseEnEvidence(texNombre(reponse, 2))}$`
      }
    }
    this.reponse = reponse.toFixed(2)

    if (this.interactif) {
      this.question += ' $=$'
    }
  }
}
