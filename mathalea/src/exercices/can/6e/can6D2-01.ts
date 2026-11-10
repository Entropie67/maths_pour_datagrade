import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un reste en minutes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModificationImportante = '21/03/2026'
/**
 * @author Jean-claude Lhote & Gilles Mora
 * Créé pendant l'été 2021

 */
export const uuid = '46e66'

export const refs = {
  'fr-fr': ['can6D2-01', '6M4C-flash2'],
  'fr-ch': ['NR'],
}
export default class ResteEnMinutes extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.typeExercice = 'simple'
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' minutes' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 2)
    const b = this.quotaRandint('b', 10, 59)
    const d = a * 60 + b
    this.question = ` Si on met $${d}$ minutes au format heures-minutes, quel serait le nombre de minutes ?`
    this.correction = `$${d} = ${a} \\times 60 + ${b}$ donc $${d}$ minutes $= ${a}\\text{~h~}${miseEnEvidence(b)}\\text{~min}$.`
    this.reponse = b
    this.canReponseACompleter = `$\\ldots$ minutes `
  }
}
