import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Écrire une fraction décimale en écriture décimale'
export const interactifReady = true

export const uuid = 'ehdej'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q20 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(numerateur?: number, denominateur?: number) {
    if (numerateur == null || denominateur == null) {
      // Choix du dénominateur : 10, 100 ou 1000
      denominateur = choice([10, 100])

      numerateur = choice([
        randint(1, 9) * 100 + randint(1, 9),
        randint(1, 9) * 1000 + randint(1, 9),
      ])
    }

    const frac = new FractionEtendue(numerateur, denominateur)
    const resultat = numerateur / denominateur

    this.question = `Écriture décimale de $${frac.texFraction}$`

    const nomDenominateur = denominateur === 10 ? 'dixièmes' : 'centièmes'

    this.correction = `$${frac.texFraction}=${texNombre(numerateur)}\\times \\dfrac{1}{${texNombre(denominateur)}}$, donc $${texNombre(numerateur)}$ ${nomDenominateur}, soit $${miseEnEvidence(texNombre(resultat))}$.`
    this.reponse = resultat
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(207, 10)
    else this.enonce()
  }
}
