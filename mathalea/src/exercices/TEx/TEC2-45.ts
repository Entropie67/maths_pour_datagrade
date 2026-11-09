import { figureCercleTrigoArgument } from '../../lib/2d/cercleTrigoArgument'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Passer de la forme trigonométrique à la forme algébrique d’un nombre complexe'
export const interactifReady = true
export const dateDePublication = '31/10/2026'
export const uuid = '9b2df'
export const refs = {
  'fr-fr': ['TEC2-45'],
  'fr-ch': [],
}

/** Cosinus de k×π/6 pour k de 0 à 11, écrit n/2 × √rad (rad vaut 1 ou 3). */
const COS: { n: number; rad: 1 | 3 }[] = [
  { n: 2, rad: 1 },
  { n: 1, rad: 3 },
  { n: 1, rad: 1 },
  { n: 0, rad: 1 },
  { n: -1, rad: 1 },
  { n: -1, rad: 3 },
  { n: -2, rad: 1 },
  { n: -1, rad: 3 },
  { n: -1, rad: 1 },
  { n: 0, rad: 1 },
  { n: 1, rad: 1 },
  { n: 1, rad: 3 },
]
const cosK = (k: number) => COS[((k % 12) + 12) % 12]
const sinK = (k: number) => cosK(k - 3)

/** Écriture LaTeX de coef × √rad. */
function texRacine(coef: number, rad: 1 | 3): string {
  const signe = coef < 0 ? '-' : ''
  const c = Math.abs(coef)
  if (rad === 1) return `${signe}${c}`
  return `${signe}${c === 1 ? '' : c}\\sqrt{3}`
}

/** Cosinus ou sinus exact n/2 × √rad en LaTeX. */
function texValeur(n: number, rad: 1 | 3): string {
  const signe = n < 0 ? '-' : ''
  if (Math.abs(n) === 2) return `${signe}1`
  return rad === 1 ? `${signe}\\dfrac{1}{2}` : `${signe}\\dfrac{\\sqrt{3}}{2}`
}

/** Argument kπ/6 ramené dans ]-π ; π], en LaTeX. */
function texArgument(k: number): string {
  const kk = k > 6 ? k - 12 : k
  const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b))
  const g = pgcd(Math.abs(kk), 6)
  const p = kk / g
  const q = 6 / g
  const numerateur = Math.abs(p) === 1 ? '\\pi' : `${Math.abs(p)}\\pi`
  const signe = p < 0 ? '-' : ''
  return q === 1
    ? `${signe}${numerateur}`
    : `${signe}\\dfrac{${numerateur}}{${q}}`
}

/**
 * Passer de la forme trigonométrique r(cos θ + i sin θ), avec θ multiple de
 * π/6, à la forme algébrique.
 * Randomisation de « Soit z un nombre complexe tel que |z| = 2 et
 * arg(z) = 5π/6 (2π). Déterminer la forme algébrique de z et placer le point
 * image M de z dans le plan complexe. »
 * @author Stéphane Guyon
 */
export default class FormeAlgebriqueModuleArgument extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const r = choice([2, 4, 6])
      const k = choice([1, 2, 4, 5, 7, 8, 10, 11])
      if (!this.questionJamaisPosee(i, r, k)) continue
      const cos = cosK(k)
      const sin = sinK(k)
      const a = (r * cos.n) / 2
      const b = (r * sin.n) / 2
      const reTex = texRacine(a, cos.rad)
      const absIm = texRacine(Math.abs(b), sin.rad)
      const imTex = `${b < 0 ? '-' : '+'}${absIm === '1' ? '' : absIm}\\mathrm{i}`
      const forme = `${reTex}${imTex}`
      const theta = texArgument(k)
      const cercle = figureCercleTrigoArgument(k)

      createQuestion(this, i, {
        question: `Soit $z=${r}\\left(\\cos\\left(${theta}\\right)+\\mathrm{i}\\sin\\left(${theta}\\right)\\right)$.<br>
Déterminer la forme algébrique de $z$.<br>`,
        field: { keyboard: KeyboardType.complexes, texteAvant: '$z=$' },
        answer: { value: forme },
        correction: `Pour passer à la forme algébrique, on calcule $\\cos\\left(${theta}\\right)$ et $\\sin\\left(${theta}\\right)$.<br>
${cercle}<br>
Ainsi $\\cos\\left(${theta}\\right)=${texValeur(cos.n, cos.rad)}$ et $\\sin\\left(${theta}\\right)=${texValeur(sin.n, sin.rad)}$.<br>
Donc $z=${r}\\left(${texValeur(cos.n, cos.rad)}${sin.n < 0 ? '' : '+'}${texValeur(sin.n, sin.rad)}\\mathrm{i}\\right)=${miseEnEvidence(forme)}$.`,
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
