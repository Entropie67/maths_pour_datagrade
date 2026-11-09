import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'

import Decimal from 'decimal.js'
import { bleuMathalea } from '../../../lib/colors'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier un nombre entier par un décimal'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '04/03/2022'

/**
 * @author  Éric Elter
 */
export const dateDeModifImportante = '19/10/2026'

export const uuid = 'cb8de'

export const refs = {
  'fr-fr': ['can6C3-09', '6N2E-flash3', '5N2autoA-14'],
  'fr-ch': ['NR'],
}
export default class MultiplierDeuxDecimaux extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const decimalEnPremier = choice([true, false])
    const a = randint(2, 9)
    const c = randint(2, 9)
    // Décimal avec un chiffre après la virgule (cas 1) ou deux (cas 2)
    const nbDecimales = this.quotaChoice('typeDeQuestions', [1, 2])
    const unite = nbDecimales === 1 ? '0,1' : '0,01'
    const b = new Decimal(a).div(nbDecimales === 1 ? 10 : 100)
    this.reponse = b.mul(c)
    const produit = decimalEnPremier
      ? `${texNombre(b, nbDecimales)}\\times ${c}`
      : `${c}\\times ${texNombre(b, nbDecimales)}`
    this.question = `Calculer $${produit}$.`
    this.correction = `$${produit}=${miseEnEvidence(texNombre(Number(this.reponse), nbDecimales))}$<br>`
    this.correction += texteEnCouleur(
      `Mentalement : <br>
   Comme $${texNombre(b, nbDecimales)}=${a}\\times ${unite}$, alors $${produit}=${
     decimalEnPremier
       ? `${a}\\times ${unite}\\times ${c}`
       : `${c}\\times ${a}\\times ${unite}`
   } = ${a * c}\\times ${unite}=${texNombre(Number(this.reponse), nbDecimales)}$ `,
      bleuMathalea,
    )
  }
}
