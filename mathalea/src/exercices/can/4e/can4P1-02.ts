import { bleuMathalea } from '../../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème de vitesse'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '7374f'

export const refs = {
  'fr-fr': ['can4P1-02'],
  'fr-ch': ['NR'],
}
export default class ProblemesDeVitesse extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', [2, 3, 5, 6, 10]) // diviseur de l'heure
    const b = 60 / a // nombre de minutes de l'énoncé
    const c = this.quotaChoice('c', [30, 60, 90, 120])
    this.reponse = c / a
    this.question = `Une voiture roule à $${c}\\text{ km/h}$. <br>
    
    Combien de kilomètres parcourt-elle en $${b}$ minutes ?`
    this.correction = `La voiture parcourt $${miseEnEvidence(c / a)}\\text{ km}$.`
    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
    On cherche combien de "$${b}$ minutes" il y a dans $1$ heure, soit $60$ minutes. Il y en a $${a}$,
    car $60\\text{ min}\\div${b}\\text{ min}=${a}$.<br>
    Cela signifie qu'en $${b}$ minutes, elle parcourt $${a}$ fois moins de $\\text{km}$ qu'en $1$ heure, soit $${c}\\text{ km}\\div${a}=${c / a}\\text{ km}$.`,
      bleuMathalea,
    )
  }
}
