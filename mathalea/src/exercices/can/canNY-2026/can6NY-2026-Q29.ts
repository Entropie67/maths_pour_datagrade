import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = ''
export const interactifReady = true

export const uuid = '61geo'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculAnnee2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: 'heures' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    // Paramètre modifiable : l'année cible
    const annee = 2026
    const anneePrecedente = annee - 1

    const date = this.canOfficielle ? 30 : this.quotaRandint('date', 29, 30)
    const nbre = this.canOfficielle ? 10 : this.quotaRandint('nbre', 1, 23)
    this.question = `Nous sommes le $${date}$ décembre $${anneePrecedente}$. Il est $${nbre}$ h${nbre < 12 ? ' du matin' : ''}.<br>
            Combien d'heures faut-il attendre avant de pouvoir se souhaiter la nouvelle année $${annee}$ (à minuit le $31$ décembre $${anneePrecedente}$) ?`
    this.correction = ` Jusqu'au $${date}$ décembre minuit, il y a $${24 - nbre}$ heures. <br>
        Du $${date + 1}$ ($0$ h) au $31$ décembre (minuit), il y a $${31 - date}$ jour${31 - date > 1 ? 's' : ''}, soit $${24 * (31 - date)}$ heures${31 - date > 1 ? ` car $${31 - date}\\times 24 = ${24 * (31 - date)}$` : ''}. <br>
        Il faudra donc attendre $${24 * (31 - date)}+${24 - nbre}$ heures, soit $${miseEnEvidence(texNombre(24 * (31 - date) + 24 - nbre, 0))}$ heures avant de se souhaiter la bonne année.
       `
    this.reponse = 24 * (31 - date) + 24 - nbre
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
