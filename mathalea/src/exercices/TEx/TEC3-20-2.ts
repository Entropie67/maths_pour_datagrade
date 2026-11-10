import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Écrire sous forme algébrique des nombres complexes simples en notation exponentielle'
export const interactifReady = true

export const uuid = '56fe5'
export const refs = {
  'fr-fr': ['TEC3-20-2'],
  'fr-ch': [],
}
export const dateDePublication = '05/11/2026'

/**
 * Coefficient exact : signe (-1, 0, 1), dénominateur (1 ou 2), radicande (1, 2 ou 3).
 * Représente signe × √radicande / dénominateur.
 */
type Coef = { s: -1 | 0 | 1; den: 1 | 2; rad: 1 | 2 | 3 }

type Angle = {
  /** Angle positif en LaTeX */
  theta: string
  cos: Coef
  sin: Coef
  /** Le signe négatif est autorisé */
  negatifPossible: boolean
}

const zero: Coef = { s: 0, den: 1, rad: 1 }
const angles: Record<string, Angle[]> = {
  axes: [
    {
      theta: '\\frac{\\pi}{2}',
      cos: zero,
      sin: { s: 1, den: 1, rad: 1 },
      negatifPossible: true,
    },
    {
      theta: '\\pi',
      cos: { s: -1, den: 1, rad: 1 },
      sin: zero,
      negatifPossible: false,
    },
  ],
  quartPi: [
    {
      theta: '\\frac{\\pi}{4}',
      cos: { s: 1, den: 2, rad: 2 },
      sin: { s: 1, den: 2, rad: 2 },
      negatifPossible: true,
    },
    {
      theta: '\\frac{3\\pi}{4}',
      cos: { s: -1, den: 2, rad: 2 },
      sin: { s: 1, den: 2, rad: 2 },
      negatifPossible: true,
    },
  ],
  tiersPi: [
    {
      theta: '\\frac{\\pi}{3}',
      cos: { s: 1, den: 2, rad: 1 },
      sin: { s: 1, den: 2, rad: 3 },
      negatifPossible: true,
    },
    {
      theta: '\\frac{2\\pi}{3}',
      cos: { s: -1, den: 2, rad: 1 },
      sin: { s: 1, den: 2, rad: 3 },
      negatifPossible: true,
    },
  ],
}

/** Écriture de k × coefficient (k entier positif) */
function ecrisProduit(k: number, c: Coef): string {
  if (c.s === 0) return '0'
  let num = k
  let den: number = c.den
  if (den === 2 && num % 2 === 0) {
    num = num / 2
    den = 1
  }
  const signe = c.s === -1 ? '-' : ''
  const radical = c.rad === 1 ? '' : `\\sqrt{${c.rad}}`
  const numerateur = num === 1 && radical !== '' ? '' : `${num}`
  return den === 1
    ? `${signe}${numerateur}${radical}`
    : `${signe}\\dfrac{${numerateur}${radical}}{${den}}`
}

/** Forme a+bi de k(cos + i sin) */
function ecrisAlgebrique(k: number, cos: Coef, sin: Coef): string {
  const re = ecrisProduit(k, cos)
  let im = ecrisProduit(k, sin)
  if (im === '0') return re
  if (im === '1') im = ''
  if (im === '-1') im = '-'
  const partieIm = `${im}\\mathrm{i}`
  if (re === '0') return partieIm
  return `${re}${partieIm.startsWith('-') ? '' : '+'}${partieIm}`
}

export default class FormeAlgebriqueDepuisExponentielle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de nombres',
      'Nombres séparés par des tirets :\n1 : Argument $\\pm\\dfrac{\\pi}{2}$ ou $\\pi$\n2 : Argument multiple de $\\dfrac{\\pi}{4}$\n3 : Argument $\\pm\\dfrac{\\pi}{3}$ ou $\\pm\\dfrac{2\\pi}{3}$\n4 : Mélange',
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
    const familles = ['axes', 'quartPi', 'tiersPi']
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100; cpt++) {
      const angle = choice(angles[familles[Number(types[i]) - 1]])
      const negatif = angle.negatifPossible && choice([true, false])
      const k = randint(2, 9)
      const cos = angle.cos
      const sin: Coef = negatif
        ? { ...angle.sin, s: angle.sin.s === 0 ? 0 : -angle.sin.s as -1 | 1 }
        : angle.sin
      const thetaSigne = `${negatif ? '-' : ''}${angle.theta}`
      const thetaCos = thetaSigne.replaceAll('\\frac', '\\dfrac')
      const exposant = `${negatif ? '-' : ''}\\mathrm{i}${angle.theta}`
      const z = `${k}\\mathrm{e}^{${exposant}}`
      const reponse = ecrisAlgebrique(k, cos, sin)
      const texte = `Écrire sous forme algébrique le nombre complexe $z=${z}$.`
      let texteCorr = `On sait que $\\cos\\left(${thetaCos}\\right)=${ecrisProduit(1, cos)}$ et $\\sin\\left(${thetaCos}\\right)=${ecrisProduit(1, sin)}$.<br>`
      texteCorr += `$\\begin{aligned}z&=${z}\\\\&=${k}\\left(\\cos\\left(${thetaCos}\\right)+\\mathrm{i}\\sin\\left(${thetaCos}\\right)\\right)\\\\&=${k}\\left(${ecrisAlgebrique(1, cos, sin)}\\right)\\\\&=${miseEnEvidence(reponse)}\\end{aligned}$`
      if (this.questionJamaisPosee(i, k, thetaSigne)) {
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
