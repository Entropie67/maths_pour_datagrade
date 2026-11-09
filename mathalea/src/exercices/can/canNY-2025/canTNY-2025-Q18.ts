import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer une valeur remarquable'
export const interactifReady = true

export const uuid = 'f0064'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class ValeurRemarquable extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.optionsDeComparaison = { sansTrigo: true }
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    const choix = this.quotaChoice('choix', [1, 2, 3, 4, 5])
    if (choix === 1) {
      this.question = `$\\cos(${texNombre(2025, 0)}\\pi)$ `
      this.correction = `$\\cos(${texNombre(2025, 0)}\\pi)=\\cos(${texNombre(2024, 0)}\\pi+\\pi)=\\cos(2\\times${texNombre(1012, 0)}\\pi+\\pi)=\\cos(\\pi)=${miseEnEvidence('-1')}$`
      this.reponse = -1
      this.canReponseACompleter = `$\\cos(${texNombre(2025, 0)}\\pi)=\\ldots$`
    } else if (choix === 2) {
      this.question = `$\\sin(${texNombre(2025, 0)}\\pi)$ `
      this.correction = `$\\sin(${texNombre(2025, 0)}\\pi)=\\sin(${texNombre(2024, 0)}\\pi+\\pi)=\\sin(2\\times${texNombre(1012, 0)}\\pi+\\pi)=\\sin(\\pi)=${miseEnEvidence('0')}$`
      this.reponse = 0
      this.canReponseACompleter = `$\\sin(${texNombre(2025, 0)}\\pi)=\\ldots$`
    } else if (choix === 3) {
      this.question = `$\\sin\\left(\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)$ `
      this.correction = `$\\sin\\left(\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)=\\sin\\left(\\dfrac{(4\\times 506 + 1)\\pi}{4}\\right)=\\sin\\left(506\\pi+\\dfrac{\\pi}{4}\\right)=\\sin\\left(\\dfrac{\\pi}{4}\\right)=${miseEnEvidence('\\dfrac{\\sqrt{2}}{2}')}$`
      // this.correction = `$\\sin(\\dfrac{${texNombre(2025, 0)}\\pi}{4})=\\sin\\left(\\dfrac{(4\\times 506 + 1)\\pi}{4}\\right)=\\sin(506\\pi+\\dfrac{\\pi}{4})=\\sin(\\dfrac{\\pi}{4})=${miseEnEvidence('\\dfrac{\\sqrt{2}}{2}')}$`
      this.reponse = '\\dfrac{\\sqrt2}{2}'
      this.canReponseACompleter = `$\\sin\\left(\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)=\\ldots$`
    } else if (choix === 4) {
      this.question = `$\\sin\\left(-\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)$ `
      this.correction = `$\\sin\\left(-\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)=\\sin\\left(\\dfrac{(-4\\times 506 - 1)\\pi}{4}\\right)=\\sin\\left(-506\\pi-\\dfrac{\\pi}{4}\\right)=\\sin\\left(-\\dfrac{\\pi}{4}\\right)=${miseEnEvidence('-\\dfrac{\\sqrt{2}}{2}')}$`
      this.reponse = '-\\dfrac{\\sqrt2}{2}'
      this.canReponseACompleter = `$\\sin\\left(-\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)=\\ldots$`
    } else {
      this.question = `$\\cos\\left(\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)$ `
      this.correction = `$\\cos\\left(\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)=\\cos\\left(\\dfrac{(4\\times 506 + 1)\\pi}{4}\\right)=\\cos\\left(506\\pi+\\dfrac{\\pi}{4}\\right)=\\cos\\left(\\dfrac{\\pi}{4}\\right)=${miseEnEvidence('\\dfrac{\\sqrt{2}}{2}')}$`
      this.reponse = '\\dfrac{\\sqrt2}{2}'
      this.canReponseACompleter = `$\\cos\\left(\\dfrac{${texNombre(2025, 0)}\\pi}{4}\\right)=\\ldots$`
    }
    if (!this.interactif) {
      this.question += '$=\\ldots$'
    }

    this.canEnonce = 'Compléter.'
  }
}
