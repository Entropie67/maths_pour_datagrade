import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Développer et réduire une expression à deux variables'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '22/10/2026'
export const uuid = 'ec297'
export const refs = {
  'fr-fr': ['1A-C08-8'],
  'fr-ch': [],
}

/**
 * Développer et réduire une expression du type a(a+1), 2a(b-3) ou b(a+b).
 * @author Stéphane Guyon
 */
export default class DevelopperMonomeParenthese extends ExerciceSimple {
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
    // Un terme est un coefficient et un monôme (lettres triées, '' pour 1)
    type Terme = { c: number; m: string }
    const ecrireMonome = (m: string) =>
      m.split('').sort().join('').replace(/aa/, 'a^2').replace(/bb/, 'b^2')
    const ecrireTerme = (t: Terme, premier: boolean) => {
      const signe = t.c < 0 ? '-' : premier ? '' : '+'
      const m = ecrireMonome(t.m)
      const valeur = Math.abs(t.c)
      return `${signe}${valeur === 1 && m !== '' ? '' : valeur}${m}`
    }
    const ecrireSomme = (termes: Terme[]) =>
      termes.map((t, i) => ecrireTerme(t, i === 0)).join('')
    const entreParentheses = (t: Terme) =>
      t.c < 0 ? `(${ecrireTerme(t, true)})` : ecrireTerme(t, true)

    const k = randint(1, 4)
    const lettre = choice(['a', 'b'])
    const monomeExterieur: Terme = { c: k, m: lettre }
    // Types de parenthèses : (a+1), (b-3), (a+b), éventuellement dans l'autre ordre
    const monomes = choice([
      ['a', ''],
      ['b', ''],
      ['a', 'b'],
    ])
    if (choice([true, false])) monomes.reverse()
    const interieur: Terme[] = monomes.map((m) => ({
      c: choice([-1, 1]) * randint(1, 6),
      m,
    }))
    const produits: Terme[] = interieur.map((t) => ({
      c: k * t.c,
      m: lettre + t.m,
    }))
    const enonce = `${ecrireTerme(monomeExterieur, true)}(${ecrireSomme(interieur)})`
    const etape1 = interieur
      .map(
        (t, i) =>
          `${i > 0 ? '+' : ''}${ecrireTerme(monomeExterieur, true)}\\times ${entreParentheses(t)}`,
      )
      .join('')
    const etape2 = ecrireSomme(produits)
    this.question = `$${enonce}$`
    this.correction = `$\\begin{aligned}
${enonce}&=${etape1}\\\\
&=${miseEnEvidence(etape2)}
\\end{aligned}$`
    this.optionsChampTexte = { texteAvant: '$=$ ' }
    this.reponse = etape2
  }
}
