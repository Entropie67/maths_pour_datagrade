import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Calculer une distance à partir d'une vitesse"
export const interactifReady = true

export const uuid = '63897'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote

*/
export default class AbscisseEnDemis extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: '$\\text{ km}$' }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let vitesse: number
    let duree: number

    if (this.canOfficielle) {
      vitesse = 60
      duree = 2.5
    } else {
      vitesse = choice([60, 70, 80, 100, 120])
      duree = choice([1.5, 2.5, 3.5])
    }
    const distance = Math.round(duree * vitesse)
    const h = Math.floor(duree)
    this.question = `Une voiture roule à $${vitesse} \\text{ km/h}$.<br>`

    this.question += `En $${String(h)}$ h $30$ min elle parcourt `
    if (!this.interactif) {
      this.question += '$\\ldots\\ldots\\text{ km}$'
    }
    this.canEnonce = `Une voiture roule à $${vitesse} \\text{ km/h}$.`
    this.canReponseACompleter = `En $${String(h)}$h$30$min, elle parcourt $\\ldots\\ldots\\text{ km}$.`
    this.reponse = String(distance)
    this.correction = `En $${String(h)}$h, elle parcourt $${String(h)}\\times ${String(vitesse)}\\text{ km}=${texNombre(h * vitesse, 0)}\\text{ km}$.<br>`
    this.correction += `En $30$ min, elle parcourt $${String(vitesse)}\\text{ km}\\div 2=${texNombre(vitesse / 2, 0)}\\text{ km}$.<br>`
    this.correction += `Donc en $${String(h)}$ h $30$ min, elle parcourt $${texNombre(h * vitesse, 0)} \\text{ km}+${texNombre(vitesse / 2, 0)}\\text{ km}=${miseEnEvidence(texNombre(distance, 0))}\\text{ km}$. `
  }
}
