import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const uuid = '8e13d'
export const refs = {
  'fr-fr': ['1A-C01-12'],
  'fr-ch': [],
}
export const interactifReady = true
export const interactifType = 'mathLive'

export const titre = 'Comparer deux puissances à l’aide de leur quotient'
export const dateDePublication = '31/10/2026'

/** Base décimale p/10 (p entre 2 et 19, différent de 10) */
function texBase(p: number): string {
  return texNombre(p / 10, 1)
}

function texFrac(num: number, den: number): string {
  return den === 1 ? `${num}` : `\\dfrac{${num}}{${den}}`
}

/**
 * Comparer deux puissances de même base ou de même exposant en comparant leur quotient à 1.
 * @author Gilles Mora
 */
export default class ComparerPuissancesQuotient extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 2
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    // Même base ou même exposant, au hasard
    const memeBase = choice([true, false])
    // Les deux bases sont soit entre 0 et 1, soit plus grandes que 1
    const plusPetiteQueUn = choice([true, false])
    const p = plusPetiteQueUn ? randint(2, 9) : randint(11, 19)

    let gauche: string
    let droite: string
    /** true si le nombre de gauche est le plus petit */
    let gaucheInferieur: boolean
    let etapesQuotient: string
    if (memeBase) {
      // a^n et a^(n+k) : le quotient vaut a^k
      const n = randint(5, 15)
      const k = choice([1, 1, 2, 3])
      const a = texBase(p)
      const grand = `${a}^{${n + k}}`
      const petit = `${a}^{${n}}`
      const grandEnPremier = choice([true, false])
      ;[gauche, droite] = grandEnPremier ? [grand, petit] : [petit, grand]
      // a^(n+k) < a^n quand 0 < a < 1
      gaucheInferieur = grandEnPremier === plusPetiteQueUn
      const quotient = k === 1 ? a : `${a}^{${k}}`
      const symboleQuotient = plusPetiteQueUn ? '<' : '>'
      etapesQuotient = `$\\dfrac{${grand}}{${petit}}=${a}^{${n + k}-${n}}=${quotient}$.<br>
      ${k === 1 ? '' : `Comme $${plusPetiteQueUn ? `0<${a}<1` : `${a}>1`}$, $${quotient}$ est le produit de $${k}$ facteurs strictement ${plusPetiteQueUn ? 'inférieurs' : 'supérieurs'} à $1$, donc $${quotient}${symboleQuotient}1$.<br>`}
      Le quotient est ${plusPetiteQueUn ? 'inférieur' : 'supérieur'} à $1$, donc le numérateur est ${plusPetiteQueUn ? 'inférieur' : 'supérieur'} au dénominateur : $${grand}${symboleQuotient}${petit}$.`
    } else {
      // a^n et b^n : le quotient vaut (a/b)^n
      const n = randint(5, 15)
      const q = plusPetiteQueUn ? randint(2, 9, [p]) : randint(11, 19, [p])
      const a = texBase(p)
      const b = texBase(q)
      gauche = `${a}^{${n}}`
      droite = `${b}^{${n}}`
      gaucheInferieur = p < q
      const g = pgcd(p, q)
      const fraction = texFrac(p / g, q / g)
      const symboleQuotient = gaucheInferieur ? '<' : '>'
      etapesQuotient = `$\\dfrac{${gauche}}{${droite}}=\\left(\\dfrac{${a}}{${b}}\\right)^{${n}}=\\left(${fraction}\\right)^{${n}}$.<br>
      Comme $${gaucheInferieur ? `0<${fraction}<1` : `${fraction}>1`}$, $\\left(${fraction}\\right)^{${n}}$ est le produit de $${n}$ facteurs strictement ${gaucheInferieur ? 'inférieurs' : 'supérieurs'} à $1$, donc $\\left(${fraction}\\right)^{${n}}${symboleQuotient}1$.<br>
      Le quotient est ${gaucheInferieur ? 'inférieur' : 'supérieur'} à $1$, donc le numérateur est ${gaucheInferieur ? 'inférieur' : 'supérieur'} au dénominateur : $${gauche}${symboleQuotient}${droite}$.`
    }
    const symbole = gaucheInferieur ? '<' : '>'

    this.correction = `Les deux nombres sont strictement positifs : on peut les comparer en comparant leur quotient à $1$.<br>
    ${etapesQuotient}<br>
    Ainsi, $${gauche}\\;${miseEnEvidence(symbole)}\\;${droite}$.`

    // En interactif, les deux membres entourent le champ de réponse
    this.consigne = this.interactif
      ? 'Compléter avec le symbole $<$, $>$ ou $=$.'
      : ''
    this.question = this.interactif
      ? ''
      : `Comparer les nombres $${gauche}$ et $${droite}$.`
    this.optionsChampTexte = {
      texteAvant: `$${gauche}$`,
      texteApres: `$${droite}$`,
      dataKeys: ['<', '>', '='],
    }
    this.optionsDeComparaison = { texteSansCasse: true }
    this.reponse = symbole
  }
}
