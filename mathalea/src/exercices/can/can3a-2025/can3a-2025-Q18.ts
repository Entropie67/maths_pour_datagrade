import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Donner une écriture scientifique'
export const interactifReady = true

export const uuid = 'b7d33'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class EcritureScientifique extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle
      ? new Decimal(224).div(100)
      : new Decimal(randint(101, 299, 200)).div(100)
    const puiss = this.canOfficielle ? 5 : randint(2, 6)
    const truc = new Decimal(10).pow(puiss).mul(a)

    this.question = `Écriture scientifique de $${texNombre(truc, 3)}$`
    this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
               Ici : $${texNombre(truc, 3)}=\\underbrace{${miseEnEvidence(texNombre(a, 3))}}_{1\\leqslant ${texNombre(a, 3)} <10}${miseEnEvidence('\\times')} ${miseEnEvidence(`10^{${puiss}}`)}$. `

    this.reponse = {
      reponse: {
        value: `${stringNombre(a)}\\times 10^{${puiss}}`,
        options: { ecritureScientifique: true },
      },
    }
  }
}
