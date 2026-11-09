import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec un ratio'
export const interactifReady = true

export const uuid = 'ffcee'
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
    this.optionsChampTexte = {
      texteApres: 'billes.',
      texteAvant: '<br>Bruno a pris',
    }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const listeRatio = this.canOfficielle
      ? [[3, 5]]
      : [
          [3, 5],
          [3, 7],
          [4, 7],
          [5, 6],
          [5, 7],
          [2, 3],
        ]
    const ratio = choice(listeRatio)
    const k = this.canOfficielle ? 7 : randint(3, 6)
    const nbreA = k * ratio[0]
    const nbreB = k * ratio[1]
    this.reponse = nbreB
    this.question = `Alice et Bruno se partagent un lot de billes dans le ratio $${ratio[0]}$ : $${ratio[1]}$.<br>
      Alice a pris $${nbreA}$ billes.`
    this.correction = `Quand Alice prend $${nbreA}$ billes, Bruno en prend $${nbreB}$.<br>
      Comme Alice en prend $${k}\\times ${ratio[0]}=${nbreA}$, alors Bruno en prend $${k}\\times ${ratio[1]}=${miseEnEvidence(nbreB)}$.`

    this.canReponseACompleter = 'Bruno a pris $\\ldots$ billes.'
    if (!this.interactif) {
      this.question += '<br>Bruno a pris $\\ldots$ billes.'
    }
  }
}
