import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { combinaisonListes } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une somme de puissances de $10$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

*/
export const uuid = '48334'

export const refs = {
  'fr-fr': ['can4C3-01'],
  'fr-ch': ['NR'],
}
export default class SommePuissancesDeDix extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = combinaisonListes([0, 1, 2, 3, 4, 5, 6], 3)
    this.question = `Calculer $10^${a[0]}+10^${a[1]}+10^${a[2]}$.`
    this.correction = `$10^${a[0]}+10^${a[1]}+10^${a[2]}=
    ${texNombre(10 ** a[0])}+${texNombre(10 ** a[1])}+${texNombre(10 ** a[2])}
    =${miseEnEvidence(texNombre(10 ** a[0] + 10 ** a[1] + 10 ** a[2]))}$`
    this.reponse = 10 ** a[0] + 10 ** a[1] + 10 ** a[2]
  }
}
