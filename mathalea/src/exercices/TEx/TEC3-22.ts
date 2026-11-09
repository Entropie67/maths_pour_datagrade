import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Écrire sous forme exponentielle des nombres complexes simples'
export const interactifReady = true

export const uuid = '686e3'
export const refs = {
  'fr-fr': ['TEC3-22'],
  'fr-ch': [],
}
export const dateDePublication = '05/11/2026'

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

function opposeArg(a: ArgPi): ArgPi {
  return { n: -a.n, d: a.d }
}

/** LaTeX de |n|π/d, sans signe */
function valeurAbsolue({ n, d }: ArgPi): string {
  const m = Math.abs(n)
  if (m === 0) return '0'
  const num = m === 1 ? '\\pi' : `${m}\\pi`
  return d === 1 ? num : `\\dfrac{${num}}{${d}}`
}

/** LaTeX de nπ/d avec signe (le signe moins est placé devant) */
function argLatex(a: ArgPi): string {
  return `${a.n < 0 ? '-' : ''}${valeurAbsolue(a)}`
}

/** LaTeX de e^{iθ} : le signe moins de θ est placé devant le i */
function expo(a: ArgPi): string {
  if (a.n === 0) return '1'
  return `\\mathrm{e}^{${a.n < 0 ? '-' : ''}\\mathrm{i}${valeurAbsolue(a)}}`
}

/** Somme d'arguments rédigée avec parenthèses pour les termes négatifs */
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

const denominateurs = [3, 4, 6]

/** Argument aléatoire non nul, strictement compris entre -π et π */
function argAleatoire(): ArgPi {
  const d = choice(denominateurs)
  let n = 0
  while (n === 0) n = randint(-(d - 1), d - 1)
  return reduit({ n, d })
}

/** Corrige la somme des arguments : écriture non réduite, puis réduite, puis principale */
function redigeSomme(termes: ArgPi[]): {
  texte: string
  resultat: ArgPi
} {
  const brute = termes.reduce((acc, t) => somme(acc, t))
  const resultat = principal(brute)
  const reduite = reduit(brute)
  let texte = sommeLatex(termes)
  const etapes = [argLatex({ n: brute.n, d: brute.d })]
  if (reduite.n !== brute.n || reduite.d !== brute.d) {
    etapes.push(argLatex(reduite))
  }
  if (resultat.n !== reduite.n || resultat.d !== reduite.d) {
    etapes.push(argLatex(resultat))
  }
  for (const e of etapes) {
    if (e !== texte) texte += `=${e}`
  }
  return { texte, resultat }
}

const moduleLatex = (k: number) => (k === 1 ? '' : `${k}`)

export default class EcrireSousFormeExponentielle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 3
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de nombres',
      "Nombres séparés par des tirets :\n1 : Produit de deux exponentielles\n2 : Opposé d'une exponentielle\n3 : Inverse d'une exponentielle\n4 : Mélange",
    ]
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      shuffle: true,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      let enonce = ''
      let corr = ''
      let resultat: ArgPi
      let k = 1
      switch (Number(types[i])) {
        case 1: {
          const a = argAleatoire()
          const b = argAleatoire()
          const bOppose = choice([true, false])
          const b2 = bOppose ? opposeArg(b) : b
          const { texte, resultat: r } = redigeSomme([a, b2])
          resultat = r
          enonce = `z=${expo(a)}\\times ${expo(b2)}`
          corr = `Pour tous réels $\\theta$ et $\\theta'$, $\\mathrm{e}^{\\mathrm{i}\\theta}\\times\\mathrm{e}^{\\mathrm{i}\\theta'}=\\mathrm{e}^{\\mathrm{i}(\\theta+\\theta')}$.<br>`
          corr += `Ici, $\\theta=${argLatex(a)}$ et $\\theta'=${argLatex(b2)}$, donc $\\theta+\\theta'=${texte}$.<br>`
          if (r.n === 0) continue
          break
        }
        case 2: {
          const a = argAleatoire()
          const aSigne = choice([a, opposeArg(a)])
          const { texte, resultat: r } = redigeSomme([{ n: 1, d: 1 }, aSigne])
          resultat = r
          enonce = `z=-${expo(aSigne)}`
          corr = `On utilise $-1=\\mathrm{e}^{\\mathrm{i}\\pi}$, donc $z=\\mathrm{e}^{\\mathrm{i}\\pi}\\times ${expo(aSigne)}$.<br>`
          corr += `L'argument est $${texte}$.<br>`
          break
        }
        default: {
          k = choice([1, 1, 2, 3, 4, 5])
          const a = argAleatoire()
          resultat = principal(opposeArg(a))
          enonce = `z=\\dfrac{${k}}{${expo(a)}}`
          corr = `Pour tout réel $\\theta$, $\\dfrac{1}{\\mathrm{e}^{\\mathrm{i}\\theta}}=\\mathrm{e}^{-\\mathrm{i}\\theta}$.<br>`
          corr += `Ici, $\\theta=${argLatex(a)}$.<br>`
          break
        }
      }
      const reponse = `${moduleLatex(k)}${expo(resultat)}`
      if (resultat.n === 0) continue
      const texte = `Écrire sous forme exponentielle le nombre complexe $${enonce}$.`
      const texteCorr = corr + `Ainsi, $z=${miseEnEvidence(reponse)}$.`
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
