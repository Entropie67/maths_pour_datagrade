import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Calculer une distance à partir d'une vitesse"
export const interactifReady = true

export const uuid = '5108c'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class DistanceEtVitesse extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '$\\text{ km/h}$' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 13.5
      this.question = `Un sportif court $${texNombre(4500, 0)}\\text{ m}$  en $20$ min.<br>
      Quelle est sa vitesse en $\\text{km/h}$ ?`
      this.correction = `En $1$ heure, il parcourt $3$ fois plus de distance  qu'en $20$ minutes, soit $3\\times ${texNombre(4500, 0)}=
       ${texNombre(13500, 0)}\\text{ m}$.<br>
       Sa vitesse est donc $${miseEnEvidence(texNombre(13.5, 1))}\\text{ km/h}$.`
    } else {
      const listeHeureDistance = [
        [5500, 20, 3, 16.5],
        [6500, 20, 3, 19.5],
        [3500, 15, 4, 14],
        [4500, 15, 4, 18],
      ] // distance, temps, fois plus, reponse
      const choix = choice(listeHeureDistance)
      this.reponse = choix[3]
      this.question = `Un sportif court $${texNombre(choix[0], 0)}\\text{ m}$  en $${choix[1]}$ min.<br>
      Quelle est sa vitesse en $\\text{km/h}$ ?`
      this.correction = `En $1$ heure, il parcourt $${choix[2]}$ fois plus de distance  qu'en $${choix[1]}$ minutes, soit $${choix[2]}\\times ${texNombre(choix[0], 0)}=
      ${texNombre(choix[0] * choix[2], 0)}\\text{ m}$.<br>
      Sa vitesse est donc $${miseEnEvidence(texNombre(choix[3], 1))}\\text{ km/h}$.`
    }

    this.canReponseACompleter = ' $\\ldots\\text{ km/h}$'
  }
}
