import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer une fraction d'heures"
export const interactifReady = true

export const uuid = 'az45m'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q2 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '$\\text{ min }$' }
  }

  enonce(numerateur?: number, denominateur?: number, minutes?: number) {
    const listeHeures = [
      [3, 4, 45],
      [1, 3, 20],
      [2, 3, 40],
      [1, 6, 10],
      [1, 10, 6],
      [3, 10, 18],
      [1, 4, 15],
    ]

    if (numerateur == null || denominateur == null || minutes == null) {
      const a = this.quotaChoice('a', listeHeures)
      numerateur = a[0]
      denominateur = a[1]
      minutes = a[2]
    }

    const fracHeures = new FractionEtendue(numerateur, denominateur)

    // Fraction d'heure vers minutes
    this.reponse = minutes
    this.question = `$${fracHeures.texFraction}$ d'heure $=$`
    this.correction = `$\\dfrac{1}{${denominateur}}$ h $=60\\text{ min}\\div ${denominateur}= ${texNombre(minutes / numerateur, 0)}\\text{ min}$<br>
Ainsi, $${fracHeures.texFraction}$ d'heure $=${miseEnEvidence(minutes)} \\text{ min}$.`

    this.canReponseACompleter = '$\\ldots\\text{ min}$'
    if (!this.interactif) {
      this.question += '$\\ldots\\text{ min}$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 4, 15)
    else this.enonce()
  }
}
