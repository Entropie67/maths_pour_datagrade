import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { texNombre } from '../../../lib/outils/texNombre'

export const titre = 'Encadrer une racine carrée par deux entiers consécutifs'
export const interactifReady = true

export const uuid = 'fa173'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/

export default class EncadreRacParDeuxEntiers extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatInteractif = 'fillInTheBlank'

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let nbre: number
    if (this.canOfficielle) {
      nbre = 70
    } else {
      nbre = randint(26, 99, [36, 49, 64, 81])
    }
    const entierInf = Math.floor(Math.sqrt(nbre))
    const entierSup = Math.ceil(Math.sqrt(nbre))
    this.consigne = 'Compléter par deux entiers consécutifs : '
    this.question = `%{champ1} < \\sqrt{${texNombre(nbre, 0)}} < %{champ2}`
    this.canEnonce = 'Compléter par deux entiers consécutifs.'
    this.canReponseACompleter = `$\\ldots < \\sqrt{${texNombre(nbre, 1)}} < \\ldots$`
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: entierInf },
      champ2: { value: entierSup },
    }
    this.correction = `Comme $${texNombre(entierInf ** 2, 0)} < ${texNombre(nbre, 0)} < ${texNombre(entierSup ** 2, 0)}$, alors 
    $${miseEnEvidence(texNombre(entierInf, 0))} < \\sqrt{${texNombre(nbre, 0)}} < ${miseEnEvidence(texNombre(entierSup, 0))}$.`
  }
}
