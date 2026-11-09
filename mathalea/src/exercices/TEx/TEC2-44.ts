import { figureCercleTrigoArgument } from '../../lib/2d/cercleTrigoArgument'
import { seq, sameTrigonometricForm } from '../../lib/interactif/checks'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Passer de la forme algébrique à la forme trigonométrique d’un nombre complexe'
export const interactifReady = true
export const dateDePublication = '31/10/2026'
export const uuid = 'a1508'
export const refs = {
  'fr-fr': ['TEC2-44'],
  'fr-ch': [],
}

/** Nombre `coef × √radicande` (radicande égal à 1 ou 3). */
type Racine = { coef: number; rad: 1 | 3 }

/** Cosinus de k×π/6 écrit n/2 × √rad : tableau des (n, rad) pour k de 0 à 11. */
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

/** Écriture LaTeX de |coef| × √rad (sans signe). */
function texAbsolu({ coef, rad }: Racine): string {
  const c = Math.abs(coef)
  if (rad === 1) return `${c}`
  return c === 1 ? '\\sqrt{3}' : `${c}\\sqrt{3}`
}

/** Écriture LaTeX signée de coef × √rad. */
const tex = (r: Racine) => `${r.coef < 0 ? '-' : ''}${texAbsolu(r)}`

/** Produit (c × √t) × (n/2 × √rad) : c est pair quand n est impair. */
function produit(c: number, t: 1 | 3, n: number, rad: 1 | 3): Racine {
  const coef = (c * n) / 2
  return t * rad === 9
    ? { coef: coef * 3, rad: 1 }
    : { coef, rad: (t * rad) as 1 | 3 }
}

/** Écriture algébrique a + ib à partir des deux parties. */
function texAlgebrique(re: Racine, im: Racine): string {
  const partieIm =
    im.coef === 0
      ? ''
      : `${im.coef < 0 ? '-' : ''}${
          Math.abs(im.coef) === 1 && im.rad === 1 ? '' : texAbsolu(im)
        }\\mathrm{i}`
  if (im.coef === 0) return tex(re)
  if (re.coef === 0) return partieIm
  return `${tex(re)}${im.coef < 0 ? '' : '+'}${partieIm}`
}

/** Cosinus ou sinus exact (n/2 × √rad) en LaTeX. */
function texValeur(n: number, rad: 1 | 3): string {
  if (n === 0) return '0'
  const signe = n < 0 ? '-' : ''
  if (Math.abs(n) === 2) return `${signe}1`
  return rad === 1 ? `${signe}\\dfrac{1}{2}` : `${signe}\\dfrac{\\sqrt{3}}{2}`
}

/** Argument kπ/6 ramené dans ]-π ; π], en LaTeX. */
function texArgument(k: number): string {
  const kk = k > 6 ? k - 12 : k
  if (kk === 0) return '0'
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
 * Déterminer une forme trigonométrique de quatre nombres complexes dont
 * l'argument est un multiple de π/6.
 * Randomisation de « Déterminer une forme trigonométrique des nombres
 * complexes z₁ = −6i, z₂ = 5 − 5i, z₃ = −√3 + 3i, z₄ = −2 − 2i√3 ».
 * @author Stéphane Guyon
 */
export default class FormeTrigonometriqueMultiplesPiSur6 extends Exercice {
  declare sup: number

  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireNumerique = [
      'Type de formulaire pour la réponse en interactif',
      2,
      '1 : Formulaire pré-rempli\n2 : Formulaire vierge',
    ]
    this.sup = 1
  }

  nouvelleVersion(): void {
    const saisieComplete = Number(this.sup) === 2
    // Les arguments se répètent le plus tard possible d'une question à l'autre.
    const ks = combinaisonListes(
      Array.from({ length: 12 }, (_, k) => k),
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const k = ks[i]
      const axe = k % 3 === 0
      const c = axe ? choice([1, 2, 3, 4, 5, 6]) : choice([2, 4, 6])
      const t: 1 | 3 = axe ? 1 : choice([1, 3])
      const cos = cosK(k)
      const sin = sinK(k)
      const re = produit(c, t, cos.n, cos.rad)
      const im = produit(c, t, sin.n, sin.rad)
      const r: Racine = { coef: c, rad: t }
      if (!this.questionJamaisPosee(i, k, c, t)) continue

      const rTex = tex(r)
      const thetaTex = texArgument(k)
      const carre = r.coef ** 2 * (r.rad === 3 ? 3 : 1)
      const reTex = tex(re)
      const imTex = tex(im)
      const cosTex = texValeur(cos.n, cos.rad)
      const sinTex = texValeur(sin.n, sin.rad)
      // Un terme nul n'est écrit ni dans le module ni dans la factorisation.
      const carreTex = (v: Racine, texV: string) =>
        v.coef < 0 || v.rad === 3 ? `\\left(${texV}\\right)^2` : `${texV}^2`
      const sommeCarres = [
        re.coef !== 0 ? carreTex(re, reTex) : '',
        im.coef !== 0 ? carreTex(im, imTex) : '',
      ]
        .filter(Boolean)
        .join('+')
      const termeSin = sin.n < 0 ? `\\left(${sinTex}\\right)` : sinTex
      const termeCos = cos.n < 0 ? `\\left(${cosTex}\\right)` : cosTex
      // Si a = 0 ou b = 0, la factorisation est immédiate : pas de fraction.
      const factorisation =
        re.coef === 0
          ? `${rTex}\\times${sin.n < 0 ? '\\left(-\\mathrm{i}\\right)' : '\\mathrm{i}'}`
          : im.coef === 0
            ? `${rTex}\\times${termeCos}`
            : `${rTex}\\left(\\dfrac{${reTex}}{${rTex}}+\\mathrm{i}\\,\\dfrac{${imTex}}{${rTex}}\\right)=${rTex}\\left(${cosTex}+\\mathrm{i}\\times${termeSin}\\right)`
      const sinAbs = texValeur(Math.abs(sin.n), sin.rad)
      const partieIm = `${sinAbs === '1' ? '' : sinAbs}\\mathrm{i}`
      const affixeA =
        cos.n === 0
          ? `${sin.n < 0 ? '-' : ''}${partieIm}`
          : sin.n === 0
            ? cosTex
            : `${cosTex}${sin.n < 0 ? '-' : '+'}${partieIm}`
      const forme = `${rTex}\\left(\\cos\\left(${thetaTex}\\right)+\\mathrm{i}\\sin\\left(${thetaTex}\\right)\\right)`
      let texte = `Déterminer la forme trigonométrique du nombre complexe $z=${texAlgebrique(re, im)}$, avec un argument dans $]-\\pi\\,;\\,\\pi]$.`
      const texteCorr = `Pour $z=a+\\mathrm{i}b$, avec $a$ et $b$ réels, le module est $|z|=\\sqrt{a^2+b^2}$.<br>
Ici, $a=${reTex}$ et $b=${imTex}$, donc $|z|=\\sqrt{${sommeCarres}}=\\sqrt{${carre}}=${rTex}$.<br>
On factorise $z$ par son module :<br>
$z=${factorisation}$.<br>
On cherche donc $\\theta$ tel que $\\cos(\\theta)=${cosTex}$ et $\\sin(\\theta)=${sinTex}$.<br>
On place sur le cercle trigonométrique le point d'affixe $${affixeA}$, puis on lit la mesure de $\\theta$ dans $]-\\pi\\,;\\,\\pi]$ :<br>
${figureCercleTrigoArgument(k)}<br>
On obtient $\\theta=${thetaTex}$.<br>
Une forme trigonométrique de $z$ est donc $z=${miseEnEvidence(forme)}$.`

      if (saisieComplete) {
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(this, i, KeyboardType.complexes, {
            texteAvant: '<br>$z=$',
          })
        }
        handleAnswers(this, i, {
          reponse: { value: forme, compare: seq([sameTrigonometricForm()]) },
        })
      } else {
        if (this.interactif) {
          texte += `<br>${remplisLesBlancs(
            this,
            i,
            'z=%{champ1}\\left(\\cos\\left(%{champ2}\\right)+\\mathrm{i}\\sin\\left(%{champ3}\\right)\\right)',
            KeyboardType.complexes,
          )}`
        }
        handleAnswers(
          this,
          i,
          {
            champ1: { value: rTex },
            champ2: { value: thetaTex },
            champ3: { value: thetaTex },
          },
          { formatInteractif: 'fill-in-the-blank' },
        )
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
