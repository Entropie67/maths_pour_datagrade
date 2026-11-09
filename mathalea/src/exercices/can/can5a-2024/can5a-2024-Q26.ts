import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une distance'
export const interactifReady = true

export const uuid = '4311e'
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
    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 180
      this.question = `Le TGV Metz-Paris parcourt $270\\text{ km}$ en $1$ h $30$ à vitesse constante.<br>
      La distance parcourue au bout de $1$ h de trajet est :  `
      this.correction = `Il y a $3$ demi-heures dans $1$ h $30$ min. En une demi-heure, le TGV parcourt $90\\text{ km}$ (car $3\\times 90=270$).<br>
      Donc en $1$ h, le TGV parcourt $2\\times 90\\text{ km}$ $= ${miseEnEvidence(180)}\\text{ km}$.`
    } else {
      if (choice([true, false])) {
        const a = choice([70, 80, 90, 100])
        this.reponse = a * 2
        this.question = `Un train parcourt $${3 * a}\\text{ km}$ en $1$ h $30$ à vitesse constante.<br>
        La distance parcourue au bout de $1$ h de trajet est :  `
        this.correction = `Il y a $3$ demi-heures dans $1$ h $30$ min. En une demi-heure, le train parcourt $90\\text{ km}$ (car $3\\times 90=270$).<br>
        Donc  en $1$ h, le train parcourt $2\\times ${a}\\text{ km}$ $= ${miseEnEvidence(2 * a)}\\text{ km}$.`
      } else {
        const a = choice([10, 20, 12, 40, 60])
        this.reponse = a * 4
        this.question = `Un véhicule parcourt $${3 * a}\\text{ km}$ en  $45$ min  à vitesse constante.<br>
        La distance parcourue au bout de $1$ h de trajet est :  `
        this.correction = `Tous les quarts d'heure le véhicule parcourt $${a}\\text{ km}$ .<br>
        Il y a $4$ quarts d'heures dans $1$ h. <br>
        Donc en $1$ h, 
        le véhicule parcourt $4\\times ${a}\\text{ km}$ $= ${miseEnEvidence(4 * a)}\\text{ km}$.`
      }
    }

    this.canReponseACompleter = '$\\ldots\\text{ km}$'
    if (!this.interactif) {
      this.question += '$\\ldots\\text{ km}$'
    } else {
      this.optionsChampTexte = { texteApres: '$\\text{ km}$.' }
    }
  }
}
