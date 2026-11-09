import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { round } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Multiplier astucieusement par $25$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Rémi Angot
 * Multiplier par 25 revient à diviser par 4 puis multiplier par 100,
 * car 25 = 100 / 4.
 */
export const uuid = 'f335c'

export const refs = {
  'fr-fr': ['can5C2-08'],
  'fr-ch': [],
}

export default class MultiplierParVingtCinq extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const n = this.quotaRandint('n', 10, 100)
    const quotient = round(n / 4, 2)
    this.reponse = n * 25

    this.question = `Calculer $${n} \\times 25$.`

    const quotientTex = texNombre(quotient)
    const phraseDecalage = Number.isInteger(quotient)
      ? `le chiffre des unités de $${quotientTex}$ devient le chiffre des centaines`
      : `la virgule de $${quotientTex}$ se décale de $2$ rangs vers la droite`

    this.correction = `$${n} \\times 25 = ${n} \\div 4 \\times 100 = ${quotientTex} \\times 100 = ${miseEnEvidence(texNombre(this.reponse))}$`
    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
Multiplier par $25$ revient à diviser par $4$ puis multiplier par $100$, car $25 = \\dfrac{100}{4}$.<br>
Ici, $${n} \\div 4 = ${quotientTex}$, puis quand on multiplie par $100$, ${phraseDecalage} : on obtient $${texNombre(this.reponse)}$.
  `,
      bleuMathalea,
    )
  }
}
