import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer un antécédent'
export const interactifReady = true

export const uuid = '2820d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class AntecedentFonction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = true
  }

  nouvelleVersion() {
    const x = this.canOfficielle ? 1 : randint(-5, 5, [0, 1, -1])
    const m = this.canOfficielle ? 3 : randint(2, 5)
    const y = this.canOfficielle ? -1 : randint(-5, 5, [x, 0])
    const nomF = this.canOfficielle
      ? 'f'
      : choice(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'm', 't', 'k'])
    this.question = `Antécédent de $${m * x + y}$ par $${nomF}$ : $x \\longmapsto ${m}x${ecritureAlgebrique(y)}$`
    this.correction = `L'antécédent de $${m * x + y}$ est le nombre $x$ qui a pour image $${m * x + y}$. <br>
       On cherche donc $x$ tel que : $${m}x${ecritureAlgebrique(y)}=${m * x + y}$ <br>Soit $x=\\dfrac{${m * x + y}${ecritureAlgebrique(-y)}}{${m}}=${miseEnEvidence(x)}$.`
    this.reponse = x
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
