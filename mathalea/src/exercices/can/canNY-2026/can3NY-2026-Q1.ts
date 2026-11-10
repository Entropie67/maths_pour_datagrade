import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les chiffres'
export const interactifReady = true

export const uuid = 'yat0i'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora

*/
export default class calcAvecChiffresPrio extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const choix = this.canOfficielle
      ? 2
      : this.quotaChoice('choix', [1, 2, 3, 4, 5, 6]) //
    const annee = 2026
    if (choix === 1) {
      this.question = `$2\\times 0+2 \\times ${annee % 10}$`
      this.correction = `$2\\times 0+2 \\times ${annee % 10}=0+${2 * (annee % 10)}=${miseEnEvidence(texNombre(2 * (annee % 10), 0))}$`
      this.reponse = 2 * (annee % 10)
    } else if (choix === 2) {
      this.question = `$20 \\times 2+${annee % 10}$`
      this.correction = `$20 \\times 2+${annee % 10}=40+${annee % 10}=${miseEnEvidence(texNombre(40 + (annee % 10), 0))}$`
      this.reponse = 40 + (annee % 10)
    } else if (choix === 3) {
      this.question = `$20+2\\times ${annee % 10}$`
      this.correction = `$20+2\\times ${annee % 10}=20+${2 * (annee % 10)}=${miseEnEvidence(texNombre(20 + 2 * (annee % 10), 0))}$`
      this.reponse = 20 + 2 * (annee % 10)
    } else if (choix === 4) {
      this.question = `$2+ 0 \\times ${annee % 100}$`
      this.correction = `$2+ 0 \\times ${annee % 100}=2+0=${miseEnEvidence(texNombre(2, 0))}$`
      this.reponse = 2
    } else if (choix === 5) {
      this.question = `$2\\times (0+2+ ${annee % 10})$`
      this.correction = `$2\\times (0+2+ ${annee % 10})=2 \\times ${2 + (annee % 10)}=${miseEnEvidence(texNombre(2 * (2 + (annee % 10)), 0))}$`
      this.reponse = 2 * (2 + (annee % 10))
    } else {
      this.question = `$(20+2)\\times ${annee % 10}$`
      this.correction = `$(20+2)\\times ${annee % 10}=22 \\times ${annee % 10}=${miseEnEvidence(texNombre(22 * (annee % 10), 0))}$`
      this.reponse = 22 * (annee % 10)
    }
  }
}
