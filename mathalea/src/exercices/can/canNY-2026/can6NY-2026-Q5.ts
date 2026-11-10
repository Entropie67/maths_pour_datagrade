import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Trouver le nombres d'unités, de dizaines, ..."
export const interactifReady = true

export const uuid = 'k3jyp'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class calcAvecChiffres2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const unite = 6
    const dizaine = 2
    const centaine = 0
    const mille = 2
    const choix = this.canOfficielle
      ? 1
      : this.quotaChoice('choix', [1, 2, 3, 4])
    if (choix === 1) {
      this.question = `Quel est le chiffre des unités dans $${texNombre(annee, 0)}$ ?`
      this.correction = `$${texNombre(annee, 0)}=(${mille}\\times${texNombre(1000, 0)})+(${centaine}\\times100)+(2\\times10)+(${miseEnEvidence(texNombre(unite, 0))}\\times1)$`
      this.correction += `<br>Le chiffre des unités est $${miseEnEvidence(texNombre(6, 0))}$.`
      this.reponse = unite
    } else if (choix === 2) {
      this.question = `Quel est le chiffre des dizaines dans $${texNombre(annee, 0)}$ ?`
      this.correction = `$${texNombre(annee, 0)}=(${mille}\\times${texNombre(1000, 0)})+(${centaine}\\times100)+(${miseEnEvidence(texNombre(dizaine, 0))}\\times10)+(${unite}\\times1)$`
      this.correction += `<br>Le chiffre des dizaines est $${miseEnEvidence(texNombre(2, 0))}$.`
      this.reponse = dizaine
    } else if (choix === 3) {
      this.question = `Quel est le chiffre des centaines dans $${texNombre(annee, 0)}$ ?`
      this.correction = `$${texNombre(annee, 0)}=(${mille}\\times${texNombre(1000, 0)})+(${miseEnEvidence(texNombre(centaine, 0))}\\times100)+(${dizaine}\\times10)+(${unite}\\times1)$`
      this.correction += `<br>Le chiffre des centaines est $${miseEnEvidence(texNombre(centaine, 0))}$.`
      this.reponse = centaine
    } else {
      this.question = `Quel est le chiffre des milliers dans $${texNombre(annee, 0)}$ ?`
      this.correction = `$${texNombre(annee, 0)}=(${miseEnEvidence(texNombre(mille, 0))}\\times${texNombre(1000, 0)})+(${centaine}\\times100)+(${dizaine}\\times10)+(${unite}\\times1)$`
      this.correction += `<br>Le chiffre des milliers est $${miseEnEvidence(texNombre(mille, 0))}$.`
      this.reponse = mille
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
