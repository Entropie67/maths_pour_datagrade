import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = 'Calculer une somme/différence'
export const interactifReady = true

export const uuid = '84a4e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author GM+EE
 */
export default class CalculDivers extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (this.quotaRandint('choix', 1, 7)) {
      case 1:
        this.question = `Combien vaut $${texNombre(2025)} + 20 + 5$ ?`
        this.reponse = 2050
        this.correction = `$${texNombre(2025)} + 20 + 5=${texNombre(2045)} + 5=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 2:
        this.question = `Combien vaut $${texNombre(2025)} + 20 - 5$ ?`
        this.reponse = 2040
        this.correction = `$${texNombre(2025)} + 20 - 5=${texNombre(2045)} - 5=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 3:
        this.question = `Combien vaut $${texNombre(2025)} - 20 - 5$ ?`
        this.reponse = 2000
        this.correction = `$${texNombre(2025)} - 20 - 5=${texNombre(2005)} -5=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 4:
        this.question = `Combien vaut $${texNombre(2025)} - 20 + 5$ ?`
        this.reponse = 2010
        this.correction = `$${texNombre(2025)} - 20 + 5=${texNombre(2005)} + 5=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 5:
        this.question = `Combien vaut $${texNombre(2025)} - (20 + 5)$ ?`
        this.reponse = 2000
        this.correction = `$${texNombre(2025)} - (20 + 5)=${texNombre(2025)} - 25=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 6:
        this.question = `Combien vaut $${texNombre(2025)} - (20 \\times 5)$ ?`
        this.reponse = 1925
        this.correction = `$${texNombre(2025)} - (20 \\times 5)=${texNombre(2025)} - 100=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
      case 7:
        this.question = `Combien vaut $${texNombre(2025)} + (20 \\times 5)$ ?`
        this.reponse = 2125
        this.correction = `$${texNombre(2025)} + (20 \\times 5)=${texNombre(2025)} +100=${miseEnEvidence(texNombre(this.reponse, 4))}$`
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
