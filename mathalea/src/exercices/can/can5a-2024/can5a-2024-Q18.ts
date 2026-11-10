import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Calculer le volume d'un cube"
export const interactifReady = true

export const uuid = '8b4a4'
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
    this.optionsChampTexte = { texteApres: '.' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: number
    if (this.canOfficielle) {
      reponse = 27
      this.question = "Le volume d'un cube d'arête $3\\text{ cm}$ est : "
      this.correction = `Le volume du cube est : $3^3=${miseEnEvidence(27)}\\text{ cm}^3$`
      this.canEnonce = "Le volume d'un cube d'arête $3\\text{ cm}$ est : "
    } else {
      const a = choice([0.2, 2, 3, 0.3, 4, 20, 30])
      reponse = a ** 3
      this.question = `Le volume d'un cube d'arête $${texNombre(a, 1)}\\text{ cm}$ est : `
      this.correction = `Le volume du cube est : $${texNombre(a, 1)}^3=${miseEnEvidence(texNombre(a ** 3, 3))}\\text{ cm}^3$`
      this.canEnonce = `Le volume d'un cube d'arête $${texNombre(a, 1)}\\text{ cm}$ est : `
    }

    this.canReponseACompleter = '$\\ldots\\text{ cm}^3$'
    this.reponse = reponse.toFixed(3)
    if (!this.interactif) {
      this.question += '$\\ldots\\text{ cm}^3$'
    } else {
      this.optionsChampTexte = { texteApres: '$\\text{ cm}^3$' }
    }
  }
}
