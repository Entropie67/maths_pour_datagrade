import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver le nombre qui suit'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Publié le 11 / 09 / 2021

 */
export const uuid = 'cc882'

export const refs = {
  'fr-fr': ['can6N21-07', '6N2A-flash8', '6AutoN3-2'],
  'fr-ch': [],
}
export default class PositionDesChiffres extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const f = this.quotaChoice('f', [1, 10, 100])
    const a =
      this.quotaRandint('aDizaines', 1, 9) * 10 +
      this.quotaRandint('aUnites', 1, 9)
    this.question = ` Compléter la suite logique : <br>$${texNombre((a + 0.6) / f)}$ ${sp(1)} ; ${sp(1)}$${texNombre((a + 0.7) / f)}$ ${sp(1)} ; ${sp(1)}$${texNombre((a + 0.8) / f)}$ ${sp(1)} ; ${sp(1)}$${texNombre((a + 0.9) / f)}$ ${sp(1)} ;${this.interactif ? '' : `${sp(1)} $\\ldots\\ldots$`}`
    this.correction = `On passe d'un nombre au suivant en ajoutant $${texNombre(0.1 / f)}$.<br>Donc le prochain nombre est : $${texNombre((a + 0.9) / f)}+${texNombre(0.1 / f)}=${miseEnEvidence(texNombre((a + 1) / f))}$.`
    this.reponse = (a + 1) / f
    this.canEnonce = 'Compléter la suite logique.'
    this.canReponseACompleter = `$${texNombre((a + 0.6) / f)}$ ${sp(1)} ; ${sp(1)}$${texNombre((a + 0.7) / f)}$ ${sp(1)} ; ${sp(1)}$${texNombre((a + 0.8) / f)}$ ${sp(1)} ; ${sp(1)}$${texNombre((a + 0.9) / f)}$${sp(1)} ; ${sp(1)} $\\ldots$`
  }
}
