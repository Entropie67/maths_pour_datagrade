import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une différence de deux carrés'
export const interactifReady = true

export const uuid = 'd6f1f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class diffDeDeuxCarres extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    const choix = this.quotaRandint('choix', 1, 3)
    if (choix === 1) {
      this.question = `Calculer $${texNombre(2025, 0)}^2-${texNombre(2024, 0)}^2$.`
      this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=${texNombre(2025, 0)}$ et $b=${texNombre(2024, 0)}$.<br>
      $${texNombre(2025, 0)}^2-${texNombre(2024, 0)}^2=(${texNombre(2025, 0)}-${texNombre(2024, 0)})(${texNombre(2025, 0)}+${texNombre(2024, 0)})=1\\times ${texNombre(4049, 0)}=${miseEnEvidence(`${texNombre(4049, 0)}`)}$.
           `
      this.reponse = '4049'
      if (this.interactif) {
        this.question += `<br>$${texNombre(2025, 0)}^2-${texNombre(2024, 0)}^2=$`
      }
    } else if (choix === 2) {
      this.question = `Calculer $${texNombre(2025, 0)}^2-${texNombre(2024, 0)}^2$.`
      this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=${texNombre(2025, 0)}$ et $b=${texNombre(2024, 0)}$.<br>
        $${texNombre(2025, 0)}^2-${texNombre(2024, 0)}^2=(${texNombre(2025, 0)}-${texNombre(2024, 0)})(${texNombre(2025, 0)}+${texNombre(2024, 0)})=1\\times ${texNombre(4049, 0)}=${miseEnEvidence(`${texNombre(4049, 0)}`)}$.
             `
      this.reponse = '4049'
      if (this.interactif) {
        this.question += `<br>$${texNombre(2025, 0)}^2-${texNombre(2024, 0)}^2=$`
      }
    } else {
      this.question = `Développer $(x-\\sqrt{${texNombre(2025, 0)}})(x+\\sqrt{${texNombre(2025, 0)}})$.`
      this.correction = `On utilise l'égalité remarquable $(a-b)(a+b)=a^2-b^2$ avec $a=x$ et $b=\\sqrt{${texNombre(2025, 0)}}$.<br>
          $(x-\\sqrt{${texNombre(2025, 0)}})(x+\\sqrt{${texNombre(2025, 0)}})=${miseEnEvidence(`x^2-${texNombre(2025, 0)}`)}$.
               `
      if (this.interactif) {
        this.question += `<br>$(x-\\sqrt{${texNombre(2025, 0)}})(x+\\sqrt{${texNombre(2025, 0)}})=$`
      }
      this.reponse = ['x^2-2025', 'x\\times x-2025']
    }
  }
}
