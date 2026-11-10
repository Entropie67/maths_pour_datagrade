import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Trouver un pourcentage'
export const interactifReady = true

export const uuid = '21a91'
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
    this.optionsChampTexte = { texteApres: '%' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 20
      this.question = ` Un jouet coûtait $50$ €. <br>
      Il est soldé au prix de $40$ €.<br>
      De quel pourcentage le prix a-t-il baissé ? `
      this.correction = `Le prix a baissé de $10$ € sur un prix de départ de $50$ €. <br>
      $10\\,\\%$ de $50$ € est égal à $5$ €, donc $10$ € représente $20\\,\\%$ du prix de départ. <br>
      Le prix a baissé de $${miseEnEvidence(this.reponse)}\\,\\%$.
    
     `
    } else {
      const listeValeurs = [
        [50, 40, 20],
        [50, 45, 10],
        [60, 48, 20],
        [80, 72, 10],
        [50, 35, 30],
        [50, 30, 40],
        [60, 42, 30],
        [60, 54, 10],
        [80, 72, 10],
        [40, 30, 25],
        [60, 45, 25],
        [80, 60, 25],
      ]
      const valeurs = choice(listeValeurs)
      const a = valeurs[0]
      const b = valeurs[1]
      const c = valeurs[2]
      this.reponse = valeurs[2]
      this.question = ` Un jouet coûtait $${a}$ €. <br>
      Il est soldé au prix de $${b}$ €.<br>
      De quel pourcentage le prix a-t-il baissé ? `
      this.correction = `Le prix a baissé de $${a - b}$ € sur un prix de départ de $${a}$ €. <br>`
      if (c === 10 || c === 20 || c === 30 || c === 40) {
        this.correction += `
      $10\\,\\%$ de $${a}$ € est égal à $${texNombre(a / 10, 0)}$ €, donc $${a - b}$ € représente $${c}\\,\\%$ du prix de départ. <br>
      Le prix a baissé de $${miseEnEvidence(this.reponse)}\\,\\%$.`
      }
      if (c === 25) {
        this.correction += `
      $${a - b}$ € représente le quart  du prix de départ $${a}$ €. <br>
      Le prix a baissé de $${miseEnEvidence(this.reponse)}\\,\\%$.`
      }
    }

    this.canReponseACompleter = '$\\ldots\\,\\%$'
  }
}
