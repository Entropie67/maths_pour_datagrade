import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = "Charger d'unités"
export const interactifReady = true

export const uuid = 'ygq20'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ChangerUnites extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle
      ? false
      : this.quotaChoice('choix', [true, false])
    if (choix) {
      this.reponse = texNombre(annee / 100, 2)
      this.question = `$${texNombre(annee)}\\text{ cm}$  `

      this.correction = `
    Comme $1\\text{ m}$ $=100\\text{ cm}$, alors $1\\text{ cm}$ $=0,01\\text{ m}$.<br>
    Ainsi  $${texNombre(annee)}\\text{ cm}=${miseEnEvidence(texNombre(2026 / 100, 2))}\\text{ m}$.  `
      if (!this.interactif) {
        this.question += '$=\\ldots\\text{ m}$'
      }
      this.optionsChampTexte = {
        texteAvant: ' $=$',
        texteApres: '$\\text{ m}$',
      }
      this.canEnonce = 'Compléter.'
      this.canReponseACompleter = `$${texNombre(annee)}\\text{ cm}$  $=$  $~~\\ldots~~\\text{ m}$`
    } else {
      this.reponse = texNombre(annee * 100, 2)
      this.question = `$${texNombre(annee)}\\text{ m}$   `
      this.correction = ` Comme $1\\text{ m}$ $=100\\text{ cm}$,  alors $${texNombre(annee)}\\text{ m}=${miseEnEvidence(texNombre(annee * 100))}\\text{ cm}$.`
      if (!this.interactif) {
        this.question += '$=\\ldots\\text{ cm}$'
      }
      this.optionsChampTexte = {
        texteAvant: ' $=$',
        texteApres: ' $\\text{cm}$',
      }
      this.canEnonce = 'Compléter.'
      this.canReponseACompleter = `$${texNombre(annee)}\\text{ m}$  $=$  $\\ldots\\text{ cm}$`
    }
  }
}
