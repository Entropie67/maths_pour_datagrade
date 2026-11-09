import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème concret'
export const interactifReady = true

export const uuid = '5a91c'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteApres: ' bouquets' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const listeValeurs = this.canOfficielle
      ? [[25, 4]]
      : [
          [15, 3],
          [20, 5],
          [30, 4],
          [30, 5],
          [25, 6],
          [30, 3],
          [20, 6],
          [20, 7],
          [25, 5],
          [25, 3],
        ]
    const valeurs = this.quotaChoice('valeurs', listeValeurs)

    this.reponse = valeurs[1]
    this.question = `Un fleuriste a $${valeurs[0] * valeurs[1]}$ roses.<br>
      Combien de bouquets de $${valeurs[0]}$ roses peut-il faire au maximum ?${this.interactif ? '<br>' : ''}
      `
    this.correction = `Comme $${valeurs[0]}\\times${valeurs[1]}=${valeurs[0] * valeurs[1]}$, le fleuriste peut faire 
      au maximum $${miseEnEvidence(valeurs[1])}$ bouquets.`

    this.canReponseACompleter = '$\\ldots$ bouquets'
  }
}
