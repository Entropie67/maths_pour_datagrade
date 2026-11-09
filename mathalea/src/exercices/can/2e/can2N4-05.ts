import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer une puissance dans une égalité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '22/03/2026'
/**
 * @author  Gilles Mora
 *
 *
 */

export const uuid = '3625c'

export const refs = {
  'fr-fr': ['can2N4-05', '2N43-flash5'],
  'fr-ch': ['NR'],
}
export default class calculPuissancesAvecn extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    let compteur = 0
    do {
      if (context.isAmc) this.versionQcm = false
      const donnees: [number, number, number][] = []

      for (const k of [5, 7, 9, 11, 13, 15, 17, 19, 21, 101, 121, 221]) {
        donnees.push([4, 2, k])
      }

      for (const k of [7, 10, 13, 16, 19, 22, 25, 31, 61, 121]) {
        donnees.push([8, 3, k])
      }

      for (const k of [9, 13, 17, 21, 25, 29, 41, 81, 101]) {
        donnees.push([16, 4, k])
      }

      const [a, p, k] = choice(donnees)
      const n = (k - 1) / p

      this.question = `Sachant que $${a}^n+${a}^n=2^{${k}}$, combien vaut $n$ ?`

      this.correction = `$${a}^n+${a}^n = 2 \\times ${a}^n = 2 \\times (2^{${p}})^n = 2 \\times 2^{${p}n} = 2^{${p}n+1}$.<br>
On cherche $n$ tel que $2^{${p}n+1} = 2^{${k}}$, soit $${p}n+1=${k}$, d'où $n=\\dfrac{${k}-1}{${p}} = ${miseEnEvidence(n)}$.`

      this.reponse = n

      if (this.versionQcm) {
        this.distracteurs = [`$${k}$`, `$${k - 1}$`, `$${n + 1}$`, `$${n - 1}$`]
      }
      compteur++
    } while (
      this.versionQcm &&
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(this, 5, true)
    )
  }
}
