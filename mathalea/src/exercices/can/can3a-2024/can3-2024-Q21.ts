import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { personne } from '../../../lib/outils/Personne'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Calculer une distance à partir d'une vitesse"
export const interactifReady = true

export const uuid = '63e03'
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
    this.optionsChampTexte = { texteApres: '$\\text{ km}$' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 30
      this.question = `Sam roule à une vitesse constante de $90\\text{ km/h}$.<br>
      Quelle distance parcourt-il en $20$ minutes ?`
      this.correction = `En $20$ minutes, il parcourt $3$ fois moins de $\\text{km}$ qu'en $1$ heure, soit $\\dfrac{90}{3}=
       ${miseEnEvidence(30)}\\text{ km}$.`
    } else {
      const P = personne()
      const listeHeureVitesse = [
        [90, 20, 3, 30],
        [60, 10, 6, 10],
        [120, 10, 6, 20],
        [60, 15, 4, 15],
        [40, 15, 4, 10],
        [80, 15, 4, 20],
        [100, 15, 4, 25],
        [45, 20, 3, 15],
        [120, 20, 3, 40],
        [120, 15, 4, 30],
      ] // vitesse, temps, fois moins, reponse
      const choix = choice(listeHeureVitesse)
      this.reponse = choix[3]
      this.question = `${P.prenom} roule à une vitesse constante de $${choix[0]}\\text{ km/h}$. <br>
      Quelle distance parcourt-${P.pronom} en  $${choix[1]}$  minutes ?`
      this.correction = `En $${choix[1]}$ minutes, ${P.pronom} parcourt $${choix[2]}$ fois moins de $\\text{km}$ qu'en $1$ heure, 
      soit $\\dfrac{${choix[0]}}{${choix[2]}}=${miseEnEvidence(this.reponse)}\\text{ km}$.`
    }

    this.canReponseACompleter = ' $\\ldots\\text{ km}$'
  }
}
