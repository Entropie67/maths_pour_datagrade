import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une équation du type $\\mathrm{e}^{x+a}=1$'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = '8u8my'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ17 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(a?: number): void {
    if (a == null) {
      a = randint(-9, 9, 0)
    }

    this.reponse = String(-a)

    this.question = `$\\mathrm{e}^{x${ecritureAlgebrique(a)}}=1$<br>`
    if (this.interactif) {
      this.question += '$x=$'
    } else {
      this.question += '$x=\\ldots$'
    }

    this.correction = `$\\mathrm{e}^{x${ecritureAlgebrique(a)}}=1$<br>
    $\\mathrm{e}^{x${ecritureAlgebrique(a)}}=\\mathrm{e}^0$<br>
     $x${ecritureAlgebrique(a)}=0$, soit $x=${miseEnEvidence(String(-a))}$.`

    this.canEnonce = `$\\mathrm{e}^{x${ecritureAlgebrique(a)}}=1$`
    this.canReponseACompleter = '$x=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3)
    else this.enonce()
  }
}
