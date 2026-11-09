import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une probabilité'
export const interactifReady = true

export const uuid = 'ew9yt'
/**
 * Question 22 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ22 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = '\\dfrac{6}{15}'
    this.question =
      "Un sac contient $15$ jetons identiques numérotés de $1$ à $15$. On tire un jeton au hasard.<br>Quelle est la probabilité qu'il porte un nombre premier ?"
    this.correction =
      'Les nombres premiers inférieurs ou égaux à $15$ sont : $2\\;;\\;3\\;;\\;5\\;;\\;7\\;;\\;11\\;;\\;13$.' +
      `<br>La probabilité de tirer un nombre premier est donc : $${miseEnEvidence('\\dfrac{6}{15}')}$.`
  }
}
