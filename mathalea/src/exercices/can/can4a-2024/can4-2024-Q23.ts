import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer un produit astucieusement'
export const interactifReady = true

export const uuid = 'af408'
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
    this.optionsChampTexte = { texteAvant: ' $=$ ' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 5
      this.question = '$10\\times 2,5\\times 2\\times 0,1$ '
      this.correction = `$10\\times 2,5\\times 2\\times 0,1=\\underbrace{2,5\\times 2}_{=5}\\times \\underbrace{10 \\times 0,1}_{=1}=${miseEnEvidence(this.reponse)}$`
    } else {
      const Val1 = randint(2, 5) * choice([10, 100])
      const Val2 = (randint(1, 2) * 2 + 1) / 2
      const Val3 = randint(1, 2) * 2
      const Val4 = choice([1, 10]) / 100
      const Valeurs = shuffle([Val1, Val2, Val3, Val4])

      this.reponse = (Val1 * Val2 * Val3 * Val4).toFixed(2)
      this.question = `$${texNombre(Valeurs[0], 2)}\\times ${texNombre(Valeurs[1], 2)} \\times ${texNombre(Valeurs[2], 2)}\\times ${texNombre(Valeurs[3], 2)}$ `
      this.correction = `$\\begin{aligned}
      ${texNombre(Valeurs[0], 2)}\\times ${texNombre(Valeurs[1], 2)} \\times ${texNombre(Valeurs[2], 2)}\\times ${texNombre(Valeurs[3], 2)}
      &=\\underbrace{${texNombre(Val1, 2)}\\times ${texNombre(Val4, 2)} }_{=${texNombre(Val1 * Val4, 2)}}\\times \\underbrace{${texNombre(Val2, 2)}\\times ${texNombre(Val3, 2)}}_{=${texNombre(Val2 * Val3, 2)}}\\\\
      & =${texNombre(Val1 * Val4, 2)}\\times ${texNombre(Val2 * Val3, 2)}\\\\     
      &=${miseEnEvidence(texNombre(Val1 * Val2 * Val3 * Val4, 1))}
      \\end{aligned}$`
    }
  }
}
