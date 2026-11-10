import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver le nombre de nombres entiers entre deux valeurs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 * Créé pendant l'été 2021

 * Date de publication
*/
export const uuid = '11f3c'

export const refs = {
  'fr-fr': ['can4C4-01'],
  'fr-ch': ['PR-15'],
}
export default class NombreDeNombresEntiersEntreDeuxValeurs extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 15)
    const b = this.quotaRandint('b', 18, 35)
    this.question = `Donner le nombre d'entiers strictement compris entre $${a}$ et $${b}$.`
    this.correction = `Il y en a $(${b}-${a})-1$ soit $${miseEnEvidence(b - a - 1)}$ entiers strictement compris entre $${a}$ et $${b}$ `
    this.reponse = b - a - 1
  }
}
