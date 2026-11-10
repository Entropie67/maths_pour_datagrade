import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

export const titre = 'Compléter un encadrement'
export const interactifReady = true

export const uuid = 'd8549'
/**
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { estDansIntervalle: true }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const valInf = this.canOfficielle ? 3 : this.quotaRandint('valInf', 1, 10)
    const valSup = this.canOfficielle
      ? new Decimal(3.1)
      : choice([new Decimal(valInf).add(0.1), new Decimal(valInf).add(0.01)])
    this.reponse = `]${valInf};${valSup}[`

    this.question = 'Complète par un nombre. <br>'
    if (this.interactif) {
      this.optionsChampTexte = {
        texteAvant: `$${valInf} < $`,
        texteApres: `$<${texNombre(valSup, 2)}  $`,
      }
    } else {
      this.question += `$${valInf} < \\ldots < ${texNombre(valSup, 2)}$`
    }
    this.correction = `On complète avec un nombre strictement compris entre $${valInf}$ et $${texNombre(valSup, 2)}$, comme 
     par exemple : $${miseEnEvidence(texNombre(valSup.add(valInf).div(2), 3))}$.`

    this.canEnonce = 'Complète par un nombre.'
    this.canReponseACompleter = `$${valInf} < \\ldots < ${texNombre(valSup, 2)}$`
  }
}
