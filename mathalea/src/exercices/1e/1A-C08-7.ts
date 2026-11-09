import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { reduireAxPlusByPlusC } from '../../lib/outils/ecritures'
import { choice } from '../../lib/outils/arrayOutils'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Développer et réduire une expression à deux variables avec un signe moins devant la parenthèse'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '22/10/2026'
export const uuid = 'ed23e'
export const refs = {
  'fr-fr': ['1A-C08-7'],
  'fr-ch': [],
}

/**
 * Réduire une expression du type (2a+3b)-(a-4b) ou -(a+b)+(3a-2b)
 * composée de deux parenthèses séparées, chacune précédée de + ou de -,
 * avec au moins un signe - et un facteur entier devant l'une des deux.
 * @author Stéphane Guyon
 */
export default class ReduireDeuxParentheses extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.consigne =
      `Soit $a$ et $b$ deux réels.<br>Développer et réduire l'expression${sp()}:`
    this.optionsDeComparaison = { expressionsForcementReduites: true }
  }

  nouvelleVersion() {
    const coef = () => choice([-1, 1]) * randint(1, 6)
    let a1: number, b1: number, a2: number, b2: number
    let s1: number, s2: number
    let k1: number, k2: number
    let A: number, B: number
    // Les deux coefficients du résultat doivent être non nuls
    do {
      a1 = coef()
      b1 = coef()
      a2 = coef()
      b2 = coef()
      ;[s1, s2] = choice([
        [1, -1],
        [-1, 1],
        [-1, -1],
      ])
      // Un facteur entier devant l'une des deux parenthèses
      const k = randint(2, 4)
      ;[k1, k2] = choice([true, false]) ? [k, 1] : [1, k]
      A = s1 * k1 * a1 + s2 * k2 * a2
      B = s1 * k1 * b1 + s2 * k2 * b2
    } while (A === 0 || B === 0)
    const interieur1 = reduireAxPlusByPlusC(a1, b1, 0, 'a', 'b')
    const interieur2 = reduireAxPlusByPlusC(a2, b2, 0, 'a', 'b')
    const facteur = (k: number) => (k === 1 ? '' : String(k))
    const enonce = `${s1 === 1 ? '' : '-'}${facteur(k1)}(${interieur1})${s2 === 1 ? '+' : '-'}${facteur(k2)}(${interieur2})`
    const terme = (k: number, lettre: string) =>
      `${k > 0 ? '+' : '-'}${Math.abs(k) === 1 ? '' : Math.abs(k)}${lettre}`
    const etape =
      reduireAxPlusByPlusC(s1 * k1 * a1, s1 * k1 * b1, 0, 'a', 'b') +
      terme(s2 * k2 * a2, 'a') +
      terme(s2 * k2 * b2, 'b')
    const resultat = reduireAxPlusByPlusC(A, B, 0, 'a', 'b')
    this.question = `$${enonce}$`
    this.correction = `$\\begin{aligned}
${enonce}&=${etape}\\\\
&=${miseEnEvidence(resultat)}
\\end{aligned}$`
    this.optionsChampTexte = { texteAvant: '$=$ ' }
    this.reponse = resultat
  }
}
