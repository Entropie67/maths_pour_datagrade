import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
export const titre = 'Calculer un rendu de monnaie'
export const interactifReady = true

export const uuid = '4ttgr'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora

*/
export default class calcRenduMonnaie2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' €' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const prix = new Decimal(20.26)
    switch (this.canOfficielle ? 5 : this.quotaRandint('cas', 1, 5)) {
      case 1:
        this.reponse = texNombre(new Decimal(30).sub(prix), 2)
        this.question = `Pour payer $${texNombre(prix, 2)}$ €, je donne $3$ billets de $10$ €.<br>
      Combien me rend-on ?`
        this.correction = `$30-${texNombre(prix, 2)}=${miseEnEvidence(this.reponse)}$<br>
      On doit me rendre $${miseEnEvidence(this.reponse)}$ €.`
        break

      case 2:
        this.reponse = texNombre(new Decimal(40).sub(prix), 2)
        this.question = `Pour payer $${texNombre(prix, 2)}$ €, je donne $2$ billets de $20$ €.<br>
      Combien me rend-on ?`
        this.correction = `$40-${texNombre(prix, 2)}=${miseEnEvidence(this.reponse)}$<br>
      On doit me rendre $${miseEnEvidence(this.reponse)}$ €.`
        break
      case 3:
        this.reponse = texNombre(new Decimal(50).sub(prix), 2)
        this.question = `Pour payer $${texNombre(prix, 2)}$ €, je donne $1$ billet de $50$ €.<br>
      Combien me rend-on ?`
        this.correction = `$50-${texNombre(prix, 2)}=${miseEnEvidence(this.reponse)}$<br>
      On doit me rendre $${miseEnEvidence(this.reponse)}$ €.`
        break

      case 4:
        this.reponse = texNombre(new Decimal(25).sub(prix), 2)
        this.question = `Pour payer $${texNombre(prix, 2)}$ €, je donne ${choice([true, false]) ? '$5$ billets de $5$ €' : '$1$ billet de $20$ € et un billet de $5$ €'}.<br>
          Combien me rend-on ?`
        this.correction = `$25-${texNombre(prix, 2)}=${miseEnEvidence(this.reponse)}$<br>
          On doit me rendre $${miseEnEvidence(this.reponse)}$ €.`
        break

      case 5:
        this.reponse = texNombre(new Decimal(22).sub(prix), 2)
        this.question = `Pour payer $${texNombre(prix, 2)}$ €, je donne $1$ billet de $20$ € et une pièce de $2$ €.<br>
              Combien me rend-on ?`
        this.correction = `$22-${texNombre(prix, 2)}=${miseEnEvidence(this.reponse)}$<br>
              On doit me rendre $${miseEnEvidence(this.reponse)}$ €.`
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
    this.canReponseACompleter = '$\\ldots$ €'
  }
}
