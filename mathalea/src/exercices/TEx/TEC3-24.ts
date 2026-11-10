import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Écrire sous forme exponentielle des nombres complexes (produits, quotients et puissances)'
export const interactifReady = true

export const uuid = 'bcc2a'
export const refs = {
  'fr-fr': ['TEC3-24'],
  'fr-ch': [],
}
export const dateDePublication = '06/11/2026'

/**
 * Écrire sous forme exponentielle des nombres complexes (produits, quotients, puissances).
 * Randomisation de l'exercice « Écrire sous forme exponentielle les nombres complexes suivants »
 * (a = 8i/e^{-iπ/4}, b = -5e^{-iπ/3}, c = 4e^{-iπ/6}×e^{iπ/7}, d = 2e^{-i5π/4}/e^{-iπ/6},
 * e = (e^{iπ/4}/e^{iπ/6})^5, f = (e^{-i2π/3})^5/(e^{iπ/6})^7).
 * @author Stéphane Guyon
 */

/** Argument exprimé en multiple de π : n×π/d (d > 0) */
type ArgPi = { n: number; d: number }

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b)
}

function reduit({ n, d }: ArgPi): ArgPi {
  const g = pgcd(n, d) || 1
  return { n: n / g, d: d / g }
}

/** Ramène l'argument dans l'intervalle ]-π ; π] */
function principal(a: ArgPi): ArgPi {
  const { n, d } = reduit(a)
  let m = n % (2 * d)
  if (m > d) m -= 2 * d
  if (m <= -d) m += 2 * d
  return reduit({ n: m, d })
}

function somme(a: ArgPi, b: ArgPi): ArgPi {
  const d = (a.d * b.d) / pgcd(a.d, b.d)
  return { n: (a.n * d) / a.d + (b.n * d) / b.d, d }
}

const oppose = (a: ArgPi): ArgPi => ({ n: -a.n, d: a.d })
const multiplie = (a: ArgPi, k: number): ArgPi => ({ n: a.n * k, d: a.d })

/** LaTeX de |n|π/d, sans signe */
function valeurAbsolue({ n, d }: ArgPi): string {
  const m = Math.abs(n)
  if (m === 0) return '0'
  const num = m === 1 ? '\\pi' : `${m}\\pi`
  return d === 1 ? num : `\\frac{${num}}{${d}}`
}

/** LaTeX de nπ/d avec signe devant */
function argLatex(a: ArgPi): string {
  return `${a.n < 0 ? '-' : ''}${valeurAbsolue(a)}`
}

/** Argument entre parenthèses s'il est négatif (pour un produit) */
const argParenthese = (a: ArgPi) =>
  a.n < 0 ? `\\left(${argLatex(a)}\\right)` : argLatex(a)

/** LaTeX de e^{iθ} : le signe moins de θ est placé devant le i */
function expo(a: ArgPi): string {
  if (a.n === 0) return '1'
  return `\\mathrm{e}^{${a.n < 0 ? '-' : ''}\\mathrm{i}${valeurAbsolue(a)}}`
}

/** Somme d'arguments rédigée sans parenthèses : a-b+c */
function sommeLatex(termes: ArgPi[]): string {
  return termes
    .map((t, i) =>
      i === 0
        ? argLatex(t)
        : t.n < 0
          ? `-${valeurAbsolue(t)}`
          : `+${valeurAbsolue(t)}`,
    )
    .join('')
}

/**
 * Étapes de calcul d'une somme d'arguments : somme brute, puis forme réduite.
 * La valeur finale (dans ]-π ; π]) n'est pas incluse : elle termine la chaîne de calculs.
 */
function redigeSomme(termes: ArgPi[]): { etapes: string[]; resultat: ArgPi } {
  const brute = termes.reduce((acc, t) => somme(acc, t))
  const resultat = principal(brute)
  const final = argLatex(resultat)
  const etapes: string[] = []
  for (const e of [
    sommeLatex(termes),
    argLatex(brute),
    argLatex(reduit(brute)),
  ])
    if (e !== final && e !== etapes[etapes.length - 1]) etapes.push(e)
  return { etapes, resultat }
}

/** k e^{i(θ)} pour chaque étape, reliées par des signes égal */
const chaineExpo = (k: number, etapes: string[]) =>
  etapes
    .map((e) => `${moduleLatex(k)}\\mathrm{e}^{\\mathrm{i}\\left(${e}\\right)}`)
    .join('=')

const denominateurs = [3, 4, 6]

/** Argument aléatoire non nul, strictement compris entre -π et π */
function argAleatoire(): ArgPi {
  const d = choice(denominateurs)
  let n = 0
  while (n === 0) n = randint(-(d - 1), d - 1)
  return reduit({ n, d })
}

const moduleLatex = (k: number) => (k === 1 ? '' : `${k}`)
const puissance = (s: string, p: number) => `\\left(${s}\\right)^{${p}}`

export default class EcrireSousFormeExponentielleComplexe extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.spacingCorr = 3
    this.sup = '7'
    this.besoinFormulaireTexte = [
      'Type de nombres',
      "Nombres séparés par des tirets :\n1 : Quotient de k·i par une exponentielle\n2 : Opposé d'un nombre sous forme exponentielle\n3 : Produit\n4 : Quotient\n5 : Puissance d'un quotient\n6 : Quotient de puissances\n7 : Mélange",
    ]
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 6,
      defaut: 7,
      melange: 7,
      shuffle: true,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 200; cpt++) {
      let enonce = ''
      let corr = ''
      let resultat: ArgPi
      let k = 1
      switch (Number(types[i])) {
        case 1: {
          k = randint(2, 9)
          const a = argAleatoire()
          const { etapes, resultat: r } = redigeSomme([
            { n: 1, d: 2 },
            oppose(a),
          ])
          resultat = r
          enonce = `\\dfrac{${k}\\mathrm{i}}{${expo(a)}}`
          corr = `${enonce}=${k}\\times\\dfrac{\\mathrm{e}^{\\mathrm{i}\\frac{\\pi}{2}}}{${expo(a)}}=${chaineExpo(k, etapes)}`
          break
        }
        case 2: {
          k = randint(2, 9)
          const a = argAleatoire()
          const { etapes, resultat: r } = redigeSomme([{ n: 1, d: 1 }, a])
          resultat = r
          enonce = `-${k}${expo(a)}`
          corr = `${enonce}=${k}\\times\\mathrm{e}^{\\mathrm{i}\\pi}\\times ${expo(a)}=${chaineExpo(k, etapes)}`
          break
        }
        case 3: {
          k = randint(2, 9)
          const a = argAleatoire()
          const b = argAleatoire()
          const { etapes, resultat: r } = redigeSomme([a, b])
          resultat = r
          enonce = `${k}\\times ${expo(a)}\\times ${expo(b)}`
          corr = `${enonce}=${chaineExpo(k, etapes)}`
          break
        }
        case 4: {
          k = randint(2, 9)
          const a = argAleatoire()
          const b = argAleatoire()
          const { etapes, resultat: r } = redigeSomme([a, oppose(b)])
          resultat = r
          enonce = `${k}\\times\\dfrac{${expo(a)}}{${expo(b)}}`
          corr = `${enonce}=${chaineExpo(k, etapes)}`
          break
        }
        case 5: {
          const a = argAleatoire()
          const b = argAleatoire()
          const p = randint(2, 7)
          const diff = reduit(somme(a, oppose(b)))
          const { etapes, resultat: r } = redigeSomme([multiplie(diff, p)])
          resultat = r
          enonce = puissance(`\\dfrac{${expo(a)}}{${expo(b)}}`, p)
          const quotient = `\\mathrm{e}^{\\mathrm{i}\\left(${sommeLatex([a, oppose(b)])}\\right)}`
          corr = `${enonce}=${puissance(quotient, p)}=${puissance(expo(diff), p)}=\\mathrm{e}^{\\mathrm{i}\\left(${p}\\times${argParenthese(diff)}\\right)}=${chaineExpo(1, etapes)}`
          break
        }
        default: {
          const a = argAleatoire()
          const b = argAleatoire()
          const p = randint(2, 7)
          let q = randint(2, 7)
          while (q === p) q = randint(2, 7)
          const { etapes, resultat: r } = redigeSomme([
            multiplie(a, p),
            oppose(multiplie(b, q)),
          ])
          resultat = r
          enonce = `\\dfrac{${puissance(expo(a), p)}}{${puissance(expo(b), q)}}`
          corr = `${enonce}=\\dfrac{\\mathrm{e}^{\\mathrm{i}\\left(${p}\\times${argParenthese(a)}\\right)}}{\\mathrm{e}^{\\mathrm{i}\\left(${q}\\times${argParenthese(b)}\\right)}}=${chaineExpo(1, etapes)}`
          break
        }
      }
      if (resultat.n === 0) continue
      const reponse = `${moduleLatex(k)}${expo(resultat)}`
      const texte = `Écrire sous forme exponentielle le nombre complexe $z=${enonce}$.`
      const proprietes = {
        produit:
          "Pour tous réels $\\theta$ et $\\theta'$, $\\mathrm{e}^{\\mathrm{i}\\theta}\\times\\mathrm{e}^{\\mathrm{i}\\theta'}=\\mathrm{e}^{\\mathrm{i}(\\theta+\\theta')}$.",
        quotient:
          "Pour tous réels $\\theta$ et $\\theta'$, $\\dfrac{\\mathrm{e}^{\\mathrm{i}\\theta}}{\\mathrm{e}^{\\mathrm{i}\\theta'}}=\\mathrm{e}^{\\mathrm{i}(\\theta-\\theta')}$.",
        puissance:
          'Pour tout réel $\\theta$ et tout entier naturel $n$, $\\left(\\mathrm{e}^{\\mathrm{i}\\theta}\\right)^{n}=\\mathrm{e}^{\\mathrm{i}n\\theta}$.',
        i: 'On sait que $\\mathrm{i}=\\mathrm{e}^{\\mathrm{i}\\frac{\\pi}{2}}$.',
        moinsUn: 'On sait que $-1=\\mathrm{e}^{\\mathrm{i}\\pi}$.',
      }
      const utilisees: string[] = {
        1: [proprietes.i, proprietes.quotient],
        2: [proprietes.moinsUn, proprietes.produit],
        3: [proprietes.produit],
        4: [proprietes.quotient],
        5: [proprietes.quotient, proprietes.puissance],
        6: [proprietes.puissance, proprietes.quotient],
      }[Number(types[i])]!
      const texteCorr = `${utilisees.join('<br>')}<br>Ainsi :<br>$z=${corr}=${miseEnEvidence(reponse)}$`
      if (this.questionJamaisPosee(i, enonce)) {
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
            texteAvant: '<br>$z=$',
          })
        this.listeCorrections[i] = texteCorr
        handleAnswers(this, i, {
          reponse: { value: reponse, options: { calculFormel: true } },
        })
        i++
      }
    }
  }
}
