import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { reduireAxPlusByPlusC, rienSi1 } from '../../lib/outils/ecritures'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Développer une expression avec un signe moins devant la parenthèse'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '22/10/2026'
export const uuid = '2dc03'
export const refs = {
  'fr-fr': ['1A-C08-6'],
  'fr-ch': ['10LCFA4E-8', '10LSFA4E-8'],
}

/**
 * Réduire une expression du type -(a+b), -(a-b), 2b-(a+b) ou a-(2b-a)
 * dans laquelle une parenthèse est précédée du signe -.
 * @author Stéphane Guyon
 */
export default class ReduireParenthesesMoins extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.consigne = `Soit $a$ et $b$ deux réels.<br>Réduire l'expression${sp()}:`
    this.optionsDeComparaison = { expressionsForcementReduites: true }
  }

  nouvelleVersion() {
    const [u, v] = ['a', 'b']
    const p = this.quotaRandint('p', 1, 6)
    const q = this.quotaRandint('q', 1, 6)
    const cas = this.quotaChoice('cas', [1, 2, 3, 4])
    const signeQ = cas === 2 ? -1 : 1
    let enonce: string
    let etape: string
    let a: number
    let b: number
    switch (cas) {
      case 1:
      case 2: {
        // -(p u ± q v)
        enonce = `-(${reduireAxPlusByPlusC(p, signeQ * q, 0, u, v)})`
        etape = reduireAxPlusByPlusC(-p, -signeQ * q, 0, u, v)
        a = -p
        b = -signeQ * q
        break
      }
      case 3: {
        // r v - (p u + q v), avec r différent de q pour garder un terme en v
        const r = randint(1, 9, [q])
        enonce = `${rienSi1(r)}${v}-(${reduireAxPlusByPlusC(p, q, 0, u, v)})`
        etape = `${rienSi1(r)}${v}${reduireAxPlusByPlusC(-p, -q, 0, u, v, { ordreInverse: true })}`
        a = -p
        b = r - q
        break
      }
      default: {
        // p u - (r v - s u)
        const r = randint(1, 6)
        const s = randint(1, 6)
        enonce = `${rienSi1(p)}${u}-(${reduireAxPlusByPlusC(-s, r, 0, u, v)})`
        etape = `${rienSi1(p)}${u}${reduireAxPlusByPlusC(s, -r, 0, u, v, { ordreInverse: true })}`
        a = p + s
        b = -r
        break
      }
    }
    const resultat = reduireAxPlusByPlusC(a, b, 0, u, v)
    this.question = `$${enonce}$`
    this.correction =
      etape === resultat
        ? `$${enonce}=${miseEnEvidence(resultat)}$`
        : `$\\begin{aligned}
${enonce}&=${etape}\\\\
&=${miseEnEvidence(resultat)}
\\end{aligned}$`
    this.optionsChampTexte = { texteAvant: '$=$ ' }
    this.reponse = resultat
  }
}
