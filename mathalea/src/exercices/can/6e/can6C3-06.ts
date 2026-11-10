import Decimal from 'decimal.js'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Multiplier deux décimaux compris entre $0$ et $1$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/10/2026'

/**
 * @author Gilles Mora
 */
export const uuid = '5b3e7'

export const refs = {
  'fr-fr': ['can6C3-06', '6N2E-flash1', '5N2autoA-10'],
  'fr-ch': [],
}
export default class MultiplierDeuxDecimauxEntreZeroEtUn extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = randint(2, 9)
    const c = randint(2, 9)
    // Un décimal avec un chiffre après la virgule, l'autre avec un (cas 1) ou deux (cas 2)
    const nbDecimalesB = this.quotaChoice('typeDeQuestions', [1, 2])
    const b = new Decimal(a).div(10 ** nbDecimalesB)
    const d = new Decimal(c).div(10)
    const uniteB = nbDecimalesB === 1 ? '0,1' : '0,01'
    const nbDecimalesReponse = nbDecimalesB + 1
    const unite = nbDecimalesB === 1 ? '0,01' : '0,001'
    this.reponse = b.mul(d)
    const bTex = texNombre(b, nbDecimalesB)
    const dTex = texNombre(d, 1)
    const produit = choice([true, false])
      ? `${bTex}\\times ${dTex}`
      : `${dTex}\\times ${bTex}`
    const resultat = texNombre(Number(this.reponse), nbDecimalesReponse)
    this.question = `Calculer $${produit}$.`
    this.correction = `$${produit}=${miseEnEvidence(resultat)}$<br>`
    this.correction += texteEnCouleur(
      `Mentalement : <br>
   Comme $${bTex}=${a}\\times ${uniteB}$ et $${dTex}=${c}\\times 0,1$,
    alors $${produit}=${a}\\times ${c}\\times ${unite}=${a * c}\\times ${unite}=${resultat}$ `,
      bleuMathalea,
    )
  }
}
