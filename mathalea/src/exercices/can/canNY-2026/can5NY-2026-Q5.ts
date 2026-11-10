import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
export const titre = 'Trouver un nombre entre deux valeurs'
export const interactifReady = true

export const uuid = '4l5vw'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class nombreEntreDeuxValeurs2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const valInf = new Decimal(annee).div(
      this.canOfficielle ? 100 : this.quotaChoice('diviseur', [100, 1000]),
    )
    const valSup = this.canOfficielle
      ? valInf.add(0.01)
      : choice([valInf.add(0.01), valInf.add(0.001)])
    this.reponse = {
      reponse: {
        value: `]${valInf};${valSup}[`,
        options: { estDansIntervalle: true },
      },
    }

    this.question = 'Complète par un nombre. <br>'
    if (this.interactif) {
      this.optionsChampTexte = {
        texteAvant: `$${texNombre(valInf, 4)} < $`,
        texteApres: `$<${texNombre(valSup, 4)}  $`,
      }
    } else {
      this.question += `$${texNombre(valInf, 4)} < \\ldots < ${texNombre(valSup, 4)}$`
    }
    this.correction = `On complète avec un nombre strictement compris entre $${texNombre(valInf, 4)}$ et $${texNombre(valSup, 4)}$, comme 
     par exemple : $${miseEnEvidence(texNombre(valSup.add(valInf).div(2), 5))}$.`

    this.canEnonce = 'Compléter par un nombre.'
    this.canReponseACompleter = `$${texNombre(valInf, 4)} < \\ldots < ${texNombre(valSup, 4)}$`
  }
}
