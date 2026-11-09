import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { all, sameFunction, sameInterval } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
    ecritureAlgebrique,
    reduireAxPlusB,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer le domaine de définition et la dérivée d'une fonction avec ln ou exp"
export const dateDePublication = '02/11/2026'
export const uuid = 'eb336'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mExpLog-7'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'expRacine', label: 'e^√u, u affine' },
        { nom: 'expInverse', label: 'e^(k/(x - p))' },
        { nom: 'lnSurX', label: 'ln(u)/x' },
        { nom: 'lnQuotient', label: 'ln(u/v), u et v affines' },
        { nom: 'lnCompose', label: 'ln(ln(x) + k) ou √(ln(x) + k)' },
        { nom: 'produitLn', label: '(ax + b) ln(x + d)' },
        { nom: 'quotientLn', label: '(ax + b ln(x))/xⁿ' },
        { nom: 'lnAbs', label: 'ln|u|' },
      ],
    },
  ],
}

type Famille =
  | 'expRacine'
  | 'expInverse'
  | 'lnSurX'
  | 'lnQuotient'
  | 'lnCompose'
  | 'produitLn'
  | 'quotientLn'
  | 'lnAbs'

type Cas = {
  f: string
  /** Domaine, tel que l'élève l'écrit : `]0;+\infty[`, `\mathbb{R}`… */
  domaine: string
  domaineCorr: string
  /** Lignes du calcul aligné, la première commençant par `f'(x)&=`. */
  calcul: string[]
  derivee: string
  /** Remarque éventuelle sur l'ensemble où f est dérivable. */
  remarque?: string
  /** Intervalle inclus dans le domaine de f', pour comparer la dérivée saisie. */
  echantillon: [number, number]
}

const E = '\\mathrm{e}'
const frac = (n: number, d = 1) => new FractionEtendue(n, d).simplifie()
const plusInf = '+\\infty'
const moinsInf = '-\\infty'
const intervalle = (a: string | number, b: string | number) => `]${a};${b}[`
const reunion = (...intervalles: string[]) => intervalles.join('\\cup')
/** Écriture affichée d'un domaine, avec \left et \right. */
const affiche = (domaine: string) =>
  domaine
    .replaceAll(/(^|\\cup)\]/g, '$1\\left]')
    .replaceAll(/(^|\\cup)\[/g, '$1\\left[')
    .replaceAll(/\[(\\cup|$)/g, '\\right[$1')
    .replaceAll(/\](\\cup|$)/g, '\\right]$1')
/** x - p, écrit x quand p = 0 ; entre parenthèses pour une puissance ou un produit. */
const xMoins = (p: number) => reduireAxPlusB(1, -p)
const par = (t: string) => (/^-?\d*x$/.test(t) ? t : `(${t})`)
/** e^L pour L entier. */
const expEntier = (L: number) => (L === 0 ? '1' : L === 1 ? E : `${E}^{${L}}`)

/** Formule sur sa propre ligne. En Typst, une fraction en début de ligne décale la ligne de base. */
const bloc = (contenu: string) =>
  context.isTypst ? `$$${contenu}$$` : `<br>$${contenu}$<br>`

/** e^√u avec u = a(x - m). */
function tirerExpRacine(): Cas {
  const a = choice([1, 2, 3, -1, -2])
  const m = randint(-4, 4)
  const u = reduireAxPlusB(a, -a * m)
  const expo = `${E}^{\\sqrt{${u}}}`
  const coef = frac(a, 2)
  const derivee = `${coef.num < 0 ? '-' : ''}\\dfrac{${rienSi1(Math.abs(coef.num))}${expo}}{${coef.den === 1 ? '' : coef.den}\\sqrt{${u}}}`
  const signe = a > 0 ? '\\geqslant' : '\\leqslant'
  return {
    f: expo,
    domaine: a > 0 ? `[${m};${plusInf}[` : `]${moinsInf};${m}]`,
    domaineCorr: `La racine carrée n'est définie que pour un argument positif ou nul : $${u}\\geqslant 0\\iff x${signe}${m}$.`,
    calcul: [
      `f'(x)&=\\left(\\sqrt{${u}}\\right)'\\,${expo}`,
      `&=\\dfrac{${a}}{2\\sqrt{${u}}}\\,${expo}`,
      `&=${derivee}`,
    ],
    derivee,
    remarque: `La racine carrée n'est pas dérivable en $0$ : cette dérivée existe pour $x${a > 0 ? '>' : '<'}${m}$.`,
    echantillon: a > 0 ? [m + 0.2, m + 5] : [m - 5, m - 0.2],
  }
}

/** e^(k/(x - p)). */
function tirerExpInverse(): Cas {
  const p = randint(-3, 3)
  const k = choice([1, 2, 3, -1, -2, -3])
  const t = xMoins(p)
  const expo = `${E}^{${k}/${par(t)}}`
  const derivee = `${k > 0 ? '-' : ''}\\dfrac{${rienSi1(Math.abs(k))}${expo}}{${par(t)}^2}`
  return {
    f: expo,
    domaine: reunion(intervalle(moinsInf, p), intervalle(p, plusInf)),
    domaineCorr: `La fraction n'est pas définie ${p === 0 ? 'en $x=0$' : `lorsque $${t}=0$, c'est-à-dire en $x=${p}$`}, et l'exponentielle est définie sur $\\mathbb{R}$.`,
    calcul: [
      `f'(x)&=\\left(\\dfrac{${k}}{${t}}\\right)'\\,${expo}`,
      `&=\\dfrac{${-k}}{${par(t)}^2}\\,${expo}`,
      `&=${derivee}`,
    ],
    derivee,
    echantillon: [p + 0.3, p + 4],
  }
}

/** ln(u)/x, avec u = m² - x², x² - m² ou x + a. */
function tirerLnSurX(): Cas {
  const sorte = choice(['moins', 'plus', 'affine'])
  const m = randint(1, 4)
  const a = randint(-4, 4, [0])
  const u =
    sorte === 'moins'
      ? `${m * m}-x^2`
      : sorte === 'plus'
        ? `x^2-${m * m}`
        : reduireAxPlusB(1, a)
  const up = sorte === 'moins' ? '-2x' : sorte === 'plus' ? '2x' : '1'
  const numerateur = `${sorte === 'moins' ? '-2x^2' : sorte === 'plus' ? '2x^2' : 'x'}-(${u})\\ln(${u})`
  const derivee = `\\dfrac{${numerateur}}{x^2(${u})}`
  const domaine =
    sorte === 'moins'
      ? reunion(intervalle(-m, 0), intervalle(0, m))
      : sorte === 'plus'
        ? reunion(intervalle(moinsInf, -m), intervalle(m, plusInf))
        : a > 0
          ? reunion(intervalle(-a, 0), intervalle(0, plusInf))
          : intervalle(-a, plusInf)
  const domaineCorr =
    sorte === 'moins'
      ? `Il faut $${u}>0\\iff -${m}<x<${m}$ pour le logarithme, et $x\\neq0$ pour le dénominateur.`
      : sorte === 'plus'
        ? `Il faut $${u}>0\\iff x<-${m}$ ou $x>${m}$ pour le logarithme ; le dénominateur $x$ ne s'annule pas sur cet ensemble.`
        : a > 0
          ? `Il faut $${u}>0\\iff x>${-a}$ pour le logarithme, et $x\\neq0$ pour le dénominateur.`
          : `Il faut $${u}>0\\iff x>${-a}$ pour le logarithme ; le dénominateur $x$ ne s'annule pas sur cet intervalle.`
  return {
    f: `\\dfrac{\\ln(${u})}{x}`,
    domaine,
    domaineCorr,
    calcul: [
      `f'(x)&=\\dfrac{\\dfrac{${up}}{${u}}\\cdot x-\\ln(${u})\\cdot 1}{x^2}`,
      `&=${derivee}`,
    ],
    derivee,
    echantillon:
      sorte === 'moins'
        ? [0.2, m - 0.2]
        : sorte === 'plus'
          ? [m + 0.2, m + 4]
          : [Math.max(0, -a) + 0.2, Math.max(0, -a) + 4],
  }
}

/** ln((x + a)/(x + b)) ou ln((a - x)/(x + b)). */
function tirerLnQuotient(): Cas {
  if (choice([true, false])) {
    const [a, b] = shuffle([randint(-4, 4), randint(-4, 4)])
    if (a === b) return tirerLnQuotient()
    const num = reduireAxPlusB(1, a)
    const den = reduireAxPlusB(1, b)
    const [bas, haut] = [-a, -b].sort((p, q) => p - q)
    const derivee = `\\dfrac{${b - a}}{${par(num)}${par(den)}}`
    return {
      f: `\\ln\\left(\\dfrac{${num}}{${den}}\\right)`,
      domaine: reunion(intervalle(moinsInf, bas), intervalle(haut, plusInf)),
      domaineCorr: `Il faut $\\dfrac{${num}}{${den}}>0$ : le quotient est strictement positif lorsque $${num}$ et $${den}$ sont de même signe, c'est-à-dire pour $x<${bas}$ ou $x>${haut}$.`,
      calcul: [
        `f'(x)&=\\dfrac{${den}}{${num}}\\cdot\\dfrac{${par(den)}-${par(num)}}{${par(den)}^2}`,
        `&=${derivee}`,
      ],
      derivee,
      echantillon: [haut + 0.2, haut + 4],
    }
  }
  const b = randint(-3, 3)
  const a = randint(-b + 2, -b + 5)
  const num = `${a}-x`
  const den = reduireAxPlusB(1, b)
  const derivee = `\\dfrac{${-(a + b)}}{(${num})${par(den)}}`
  return {
    f: `\\ln\\left(\\dfrac{${num}}{${den}}\\right)`,
    domaine: intervalle(-b, a),
    domaineCorr: `Il faut $\\dfrac{${num}}{${den}}>0$ : le quotient est strictement positif lorsque $${num}$ et $${den}$ sont de même signe, c'est-à-dire pour $${-b}<x<${a}$.`,
    calcul: [
      `f'(x)&=\\dfrac{${den}}{${num}}\\cdot\\dfrac{-${par(den)}-(${num})}{${par(den)}^2}`,
      `&=${derivee}`,
    ],
    derivee,
    echantillon: [-b + 0.2, a - 0.2],
  }
}

/** ln(ln(x) + k) ou √(ln(x) + k). */
function tirerLnCompose(): Cas {
  const k = randint(-1, 2)
  const v = k === 0 ? '\\ln(x)' : `\\ln(x)${ecritureAlgebrique(k)}`
  const borne = expEntier(-k)
  const seuil = Math.exp(-k)
  const condition =
    k === 0
      ? `$\\ln(x)>0\\iff x>1$`
      : `$${v}>0\\iff \\ln(x)>${-k}\\iff x>${borne}$`
  if (choice([true, false])) {
    const derivee = `\\dfrac{1}{x(${v})}`
    return {
      f: `\\ln(${v})`,
      domaine: intervalle(borne, plusInf),
      domaineCorr: `Il faut $x>0$ et ${condition}.`,
      calcul: [`f'(x)&=\\dfrac{1}{${v}}\\cdot\\dfrac{1}{x}`, `&=${derivee}`],
      derivee,
      echantillon: [seuil + 0.2, seuil + 5],
    }
  }
  const derivee = `\\dfrac{1}{2x\\sqrt{${v}}}`
  return {
    f: `\\sqrt{${v}}`,
    domaine: `[${borne};${plusInf}[`,
    domaineCorr: `Il faut $x>0$ et ${condition.replaceAll('>', '\\geqslant ')}.`,
    calcul: [
      `f'(x)&=\\dfrac{1}{2\\sqrt{${v}}}\\cdot\\dfrac{1}{x}`,
      `&=${derivee}`,
    ],
    derivee,
    remarque: `La racine carrée n'est pas dérivable en $0$ : cette dérivée existe pour $x>${borne}$.`,
    echantillon: [seuil + 0.2, seuil + 5],
  }
}

/** (px + q) ln(x + d). */
function tirerProduitLn(): Cas {
  const p = choice([1, 2, 3, -1, -2])
  const q = randint(-4, 4)
  const d = randint(-3, 3)
  const affine = reduireAxPlusB(p, q)
  const t = reduireAxPlusB(1, d)
  const f = q === 0 ? `${rienSi1(p)}x\\ln(${t})` : `(${affine})\\ln(${t})`
  // Fraction précédée de son signe : -2x/(x-3) s'écrit -\dfrac{2x}{x-3}.
  const fraction =
    p < 0
      ? `-\\dfrac{${reduireAxPlusB(-p, -q)}}{${t}}`
      : `+\\dfrac{${affine}}{${t}}`
  const derivee = `${rienSi1(p)}\\ln(${t})${fraction}`
  return {
    f,
    domaine: intervalle(-d, plusInf),
    domaineCorr: `Il faut $${t}>0\\iff x>${-d}$.`,
    calcul: [
      `f'(x)&=${rienSi1(p)}\\ln(${t})+(${affine})\\cdot\\dfrac{1}{${t}}`,
      `&=${derivee}`,
    ],
    derivee,
    echantillon: [-d + 0.2, -d + 5],
  }
}

/** (ax + b ln(x))/xⁿ : f'(x) = ((1 - n)ax + b - nb ln(x))/x^(n+1). */
function tirerQuotientLn(): Cas {
  const n = choice([2, 3])
  const a = choice([1, 2, 3, -1, -2])
  const b = choice([1, 2, 3, -1, -2, -3])
  const numerateur = `${rienSi1(a)}x${b > 0 ? '+' : '-'}${rienSi1(Math.abs(b))}\\ln(x)`
  const xn = `x^{${n}}`
  const lnTerme = `${-n * b > 0 ? '+' : '-'}${Math.abs(n * b)}\\ln(x)`
  const numDerivee = `${reduireAxPlusB((1 - n) * a, b)}${lnTerme}`
  const derivee = `\\dfrac{${numDerivee}}{x^{${n + 1}}}`
  const deriveeNum = `${a}${b > 0 ? '+' : '-'}\\dfrac{${Math.abs(b)}}{x}`
  return {
    f: `\\dfrac{${numerateur}}{${xn}}`,
    domaine: intervalle(0, plusInf),
    domaineCorr:
      "Il faut $x>0$ pour le logarithme ; le dénominateur ne s'annule pas sur cet intervalle.",
    calcul: [
      `f'(x)&=\\dfrac{\\left(${deriveeNum}\\right)${xn}-(${numerateur})\\cdot ${n}x${n === 2 ? '' : `^{${n - 1}}`}}{x^{${2 * n}}}`,
      `&=\\dfrac{${reduireAxPlusB(a, b)}-${n}(${numerateur})}{x^{${n + 1}}}`,
      `&=${derivee}`,
    ],
    derivee,
    echantillon: [0.2, 5],
  }
}

/** ln|u|, avec u = m² - x², x² - m² ou a(x - r). */
function tirerLnAbs(): Cas {
  const sorte = choice(['moins', 'plus', 'affine'])
  const m = randint(1, 4)
  const a = choice([1, 2, 3])
  const r = randint(-3, 3)
  const u =
    sorte === 'moins'
      ? `${m * m}-x^2`
      : sorte === 'plus'
        ? `x^2-${m * m}`
        : reduireAxPlusB(a, -a * r)
  const up = sorte === 'moins' ? '-2x' : sorte === 'plus' ? '2x' : `${a}`
  const derivee = `\\dfrac{${up}}{${u}}`
  const domaine =
    sorte === 'affine'
      ? reunion(intervalle(moinsInf, r), intervalle(r, plusInf))
      : reunion(
          intervalle(moinsInf, -m),
          intervalle(-m, m),
          intervalle(m, plusInf),
        )
  const zeros = sorte === 'affine' ? `x\\neq${r}` : `x\\neq\\pm${m}`
  return {
    f: `\\ln\\left|${u}\\right|`,
    domaine,
    domaineCorr: `Il faut $\\left|${u}\\right|>0\\iff ${u}\\neq0\\iff ${zeros}$.`,
    calcul: [`f'(x)&=\\dfrac{\\left(${u}\\right)'}{${u}}`, `&=${derivee}`],
    derivee,
    echantillon:
      sorte === 'moins'
        ? [-m + 0.2, m - 0.2]
        : sorte === 'plus'
          ? [m + 0.2, m + 4]
          : [r + 0.2, r + 4],
  }
}

const tirages: Record<Famille, () => Cas> = {
  expRacine: tirerExpRacine,
  expInverse: tirerExpInverse,
  lnSurX: tirerLnSurX,
  lnQuotient: tirerLnQuotient,
  lnCompose: tirerLnCompose,
  produitLn: tirerProduitLn,
  quotientLn: tirerQuotientLn,
  lnAbs: tirerLnAbs,
}

/** @author Nathan Scheinmann */
export default class DomaineEtDeriveeLnExp extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 1
    this.spacingCorr = 2
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
    this.comment =
      'Les familles reprennent les fonctions composées des cours : quotients avec un logarithme, logarithme d’un quotient ou d’une valeur absolue, exponentielle d’une racine ou d’une fraction. ' +
      "En mode interactif, le domaine s'écrit sous forme d'intervalle ou de réunion d'intervalles, et toute écriture de la dérivée est acceptée (simplifiée ou non)."
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    this.consigne = `Donner le domaine de définition puis calculer la dérivée de $f$.${this.interactif ? " Écrire le domaine sous forme d'intervalle ou de réunion d'intervalles." : ''}`
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const c = tirages[familles[i] as Famille]()
      if (!this.questionJamaisPosee(i, c.f)) continue
      let texte = `$f(x)=${c.f}$`
      if (this.interactif)
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            i,
            "\\mathrm{Dom}_f=%{champ1}\\qquad f'(x)=%{champ2}",
            KeyboardType.clavierFonctionsTerminales,
          )
      handleAnswers(this, i, {
        champ1: { value: c.domaine, compare: all([sameInterval()]) },
        champ2: {
          value: c.derivee,
          compare: all([sameFunction({ domaine: c.echantillon })]),
        },
      })
      this.listeQuestions[i] = texte
      this.listeCorrections[i] =
        `${c.domaineCorr} Donc $\\mathrm{Dom}_f=${miseEnEvidence(affiche(c.domaine))}$.<br>` +
        `${c.remarque ?? ''}${bloc(`\\begin{aligned}${c.calcul.join('\\\\')}\\end{aligned}`)}` +
        `Donc $f'(x)=${miseEnEvidence(c.derivee)}$.`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
