import Decimal from 'decimal.js'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { abs } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation $1+\\dfrac{p}{100}=c$'
export const interactifReady = true

export const dateDePublication = '28/01/2026'

/**
 *
 * @author Gilles Mora

*/
export const uuid = 'eed98'

export const refs = {
  'fr-fr': ['can2L2-03', '2L21-flash4'],
  'fr-ch': [],
}
export default class ResoudreEquationCM extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    // Générer k entre 0,01 et 2,99
    const kCentimes = this.quotaRandint('kCentimes', 1, 150)
    const k = new Decimal(kCentimes).div(100)

    // Résoudre : 1 + p/100 = k
    // p/100 = k - 1
    // p = 100(k - 1)
    const p = k.minus(1).times(100)

    const kTexte = texNombre(k, 2)
    const pTexte = texNombre(p, 2)
    this.question = `Donner la solution de l'équation : $1+\\dfrac{p}{100}=${kTexte}$.`

    this.correction = `On remarque que l'expression $1+\\dfrac{p}{100}$ est égal au coefficient multiplicateur associé à une évolution de $p\\,\\%$.<br>
    Le coefficient multiplicateur $${kTexte}$ est associé à une ${k.toNumber() > 1 ? 'hausse' : 'baisse'} de  $${abs(p)}\\,\\%$. 
    Ainsi,  $p=${miseEnEvidence(pTexte)}$.<br><br>
    
    On peut aussi résoudre l'équation :<br>
    $\\begin{aligned}
    1+\\dfrac{p}{100}&=${kTexte}\\\\
    \\dfrac{p}{100}&=${kTexte}-1\\\\
    \\dfrac{p}{100}&=${texNombre(k.minus(1))}\\\\
    p&=100\\times ${ecritureParentheseSiNegatif(k.minus(1).toNumber())}\\\\
    p&=${miseEnEvidence(pTexte)}
    \\end{aligned}$`

    this.reponse = pTexte

    this.canReponseACompleter = ``
  }
}
