import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Trouver le nombres d'unités, de dizaines, ..."
export const interactifReady = true

export const uuid = '32037'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class calcAvecChiffres extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [1, 2, 3])
    if (choix === 1) {
      this.question = `Quel est le chiffre des unités dans $${texNombre(2025, 0)}$ ?`
      this.correction = `$${texNombre(2025, 0)}=(2\\times${texNombre(1000, 0)})+(0\\times100)+(2\\times10)+(${miseEnEvidence(texNombre(5, 0))}\\times1)$`
      this.correction += `<br>Le chiffre des unités est $${miseEnEvidence(texNombre(5, 0))}$.`
      this.reponse = 5
    } else if (choix === 2) {
      this.question = `Quel est le chiffre des dizaines dans $${texNombre(2025, 0)}$ ?`
      this.correction = `$${texNombre(2025, 0)}=(2\\times${texNombre(1000, 0)})+(0\\times100)+(${miseEnEvidence(texNombre(2, 0))}\\times10)+(5\\times1)$`
      this.correction += `<br>Le chiffre des dizaines est $${miseEnEvidence(texNombre(2, 0))}$.`
      this.reponse = 2
    } else {
      this.question = `Quel est le chiffre des centaines dans $${texNombre(2025, 0)}$ ?`
      this.correction = `$${texNombre(2025, 0)}=(2\\times${texNombre(1000, 0)})+(${miseEnEvidence(texNombre(0, 0))}\\times100)+(2\\times10)+(5\\times1)$`
      this.correction += `<br>Le chiffre des centaines est $${miseEnEvidence(texNombre(0, 0))}$.`
      this.reponse = 0
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
