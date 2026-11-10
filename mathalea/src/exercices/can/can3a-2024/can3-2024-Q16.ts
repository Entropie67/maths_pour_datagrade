import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Calculer le côté d'un carré à partir de son aire"
export const interactifReady = true

export const uuid = '4a518'
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
    if (this.canOfficielle) {
      this.reponse = 6
      this.question = `Un carré a une aire de $36\\text{ cm}^2$.<br>
      La longueur de l'un de ses côtés est :   `
      this.correction = `L'aire d'un carré est le carré de la longueur d'un côté. <br>
      Ainsi, la longueur $c$ d'un de ses côtés est :   $c=\\sqrt{36}=${miseEnEvidence(texNombre(this.reponse, 0))}\\text{ cm}$.
     `
      this.optionsChampTexte = { texteApres: '$\\text{ cm}$' }

      this.canReponseACompleter = '$\\ldots\\text{ cm}$'
      if (!this.interactif) {
        this.question += '$\\ldots\\text{ cm}$'
      }
    } else {
      if (choice([true, false])) {
        const a = randint(4, 12)
        this.reponse = a
        this.question = `Un carré a une aire de $${a ** 2}\\text{ cm}^2$.<br>
      La longueur d'un de ses côtés est :   `
        this.correction = `L'aire d'un carré est le carré de la longueur d'un côté. <br>
      Ainsi, la longueur $c$ d'un de ses côtés est : $c=\\sqrt{${a ** 2}}=${miseEnEvidence(texNombre(this.reponse, 0))}\\text{ cm}$.
     `
        this.optionsChampTexte = { texteApres: '$\\text{ cm}$' }

        this.canReponseACompleter = '$\\ldots\\text{ cm}$'
        if (!this.interactif) {
          this.question += '$\\ldots\\text{ cm}$'
        }
      } else {
        const a = randint(4, 12)
        this.reponse = a ** 2
        this.question = `Un carré a un périmètre de $${a * 4}\\text{ cm}$.<br>
     Son aire est :   `
        this.correction = `L'aire d'un carré est le carré du côté. <br>
      Le côté du carré est $\\dfrac{${4 * a}}{4}=${a}\\text{ cm}$.<br>
      Ainsi, son aire est : $${a}^2=${miseEnEvidence(texNombre(this.reponse, 0))}\\text{ cm}^2$.
     `
        this.optionsChampTexte = { texteApres: '$\\text{cm}^2$' }

        this.canReponseACompleter = '$\\ldots\\text{ cm}^2$'
        if (!this.interactif) {
          this.question += '$\\ldots\\text{ cm}^2$'
        }
      }
    }
  }
}
