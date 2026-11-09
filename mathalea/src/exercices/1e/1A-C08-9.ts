import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Développer et réduire une expression à deux variables avec deux parenthèses'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '22/10/2026'
export const uuid = '30e0a'
export const refs = {
  'fr-fr': ['1A-C08-9'],
  'fr-ch': [],
}

/**
 * Développer et réduire une expression du type a(2a+b)-3b(a-1) :
 * deux parenthèses précédées chacune d'un facteur (entier fois une variable)
 * et d'un signe + ou -, avec au moins un signe - .
 * @author Stéphane Guyon
 */
export default class DevelopperDeuxProduits extends ExerciceSimple {
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
    const trier = (m: string) => m.split('').sort().join('')
    const ecrireMonome = (m: string) =>
      trier(m).replace(/aa/, 'a^2').replace(/bb/, 'b^2')
    const ecrireTerme = (t: Terme, premier: boolean) => {
      const signe = t.c < 0 ? '-' : premier ? '' : '+'
      const m = ecrireMonome(t.m)
      const valeur = Math.abs(t.c)
      return `${signe}${valeur === 1 && m !== '' ? '' : valeur}${m}`
    }
    const ecrireSomme = (termes: Terme[]) =>
      termes.map((t, i) => ecrireTerme(t, i === 0)).join('')
    const ordre = ['aa', 'ab', 'bb', 'a', 'b', '']
    const reduire = (termes: Terme[]) => {
      const somme = new Map<string, number>()
      for (const t of termes) {
        const m = trier(t.m)
        somme.set(m, (somme.get(m) ?? 0) + t.c)
      }
      return ordre
        .filter((m) => (somme.get(m) ?? 0) !== 0)
        .map((m) => ({ c: somme.get(m) as number, m }))
    }
    const produit = () => {
      const k = randint(1, 3)
      const lettre = choice(['a', 'b'])
      const monomes = choice([
        ['a', ''],
        ['b', ''],
        ['a', 'b'],
      ])
      if (choice([true, false])) monomes.reverse()
      const interieur: Terme[] = monomes.map((m) => ({
        c: choice([-1, 1]) * randint(1, 5),
        m,
      }))
      return { k, lettre, interieur }
    }

    let p1: ReturnType<typeof produit>
    let p2: ReturnType<typeof produit>
    let s1: number
    let s2: number
    let developpe: Terme[]
    let resultat: Terme[]
    do {
      p1 = produit()
      p2 = produit()
      ;[s1, s2] = choice([
        [1, -1],
        [-1, 1],
        [-1, -1],
      ])
      const distribuer = (p: ReturnType<typeof produit>, s: number) =>
        p.interieur.map((t) => ({ c: s * p.k * t.c, m: p.lettre + t.m }))
      developpe = [...distribuer(p1, s1), ...distribuer(p2, s2)]
      resultat = reduire(developpe)
    } while (resultat.length === 0)

    const facteur = (p: ReturnType<typeof produit>) =>
      ecrireTerme({ c: p.k, m: p.lettre }, true)
    const enonce = `${s1 === 1 ? '' : '-'}${facteur(p1)}(${ecrireSomme(p1.interieur)})${s2 === 1 ? '+' : '-'}${facteur(p2)}(${ecrireSomme(p2.interieur)})`
    const etape = ecrireSomme(developpe)
    const final = ecrireSomme(resultat)
    this.question = `$${enonce}$`
    this.correction =
      etape === final
        ? `$${enonce}=${miseEnEvidence(final)}$`
        : `$\\begin{aligned}
${enonce}&=${etape}\\\\
&=${miseEnEvidence(final)}
\\end{aligned}$`
    this.optionsChampTexte = { texteAvant: '$=$ ' }
    this.reponse = final
  }
}
