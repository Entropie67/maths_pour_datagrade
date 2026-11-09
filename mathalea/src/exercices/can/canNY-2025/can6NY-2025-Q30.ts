import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { randint } from '../../../modules/outils'
export const titre = ''
export const interactifReady = true

export const uuid = 'd7fe8'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculDivers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: '€' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    let a
    let b
    switch (this.quotaRandint('typeDeQuestions', 1, 2)) {
      case 1:
        a = randint(8, 12, 10)
        b = 20 - a
        this.question = `Pour un concert, $${texNombre(2025, 0)}$ places ont été vendues à $${a}$ € la place.<br>
       $${texNombre(2025, 0)}$ places supplémentaires ont été vendues à $${b}$ € la place.<br>
       Quelle est la recette totale pour ce concert ?`
        this.reponse = 40500
        this.correction = `$${texNombre(2025, 0)}$ places à $${a}$ € et $${texNombre(2025, 0)}$ places à $${b}$ € rapportent autant que $${texNombre(2025, 0)}$ places à $${a + b}$ €.<br>
         
        $${texNombre(2025, 0)} \\times ${a + b}=${texNombre(this.reponse, 0)}$<br>
        La recette totale est : $${miseEnEvidence(texNombre(this.reponse, 0))}$ €.`
        break
      case 2:
        a = randint(4, 7, 5)
        b = 10 - a
        this.question = `Pour un concert, $${texNombre(2025, 0)}$ places ont été vendues à $${a}$ € la place.<br>
       $${texNombre(2025, 0)}$ places supplémentaires ont été vendues à $${b}$ € la place.<br>
       Quelle est la recette totale pour ce concert ?`
        this.reponse = 20250
        this.correction = `$${texNombre(2025, 0)}$ places à $${a}$ € et $${texNombre(2025, 0)}$ places à $${b}$ € rapportent autant que $${texNombre(2025, 0)}$ places à $${a + b}$ €.<br>
         
        $${texNombre(2025, 0)} \\times ${a + b}=${texNombre(this.reponse, 0)}$<br>
        La recette totale est $${miseEnEvidence(texNombre(this.reponse, 0))}$ €.`
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
