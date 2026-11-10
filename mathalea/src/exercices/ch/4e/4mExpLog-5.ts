import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { isEqual, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../../lib/interactif/createQuestion'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  'Dériver des fonctions exponentielles et logarithmes de base a'
export const dateDePublication = '27/10/2026'
export const uuid = 'c7b5a'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mExpLog-5'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'formes',
      label: 'Fonctions à dériver',
      items: [
        { nom: 'exp', label: 'k · a^x' },
        { nom: 'expCompo', label: 'a^u(x)' },
        { nom: 'log', label: 'k · log_a(x)' },
        { nom: 'logCompo', label: 'log_a(u(x))' },
      ],
    },
  ],
}

/** Calcul en mode affiché : en Typst, un aligned en ligne n'aligne pas sa première ligne. */
const bloc = (tex: string) =>
  context.isTypst ? `$$${tex}$$` : `<br>$${tex}$<br>`

const polynome = (coeffs: number[]) => new Polynome({ coeffs })

/** log en base 10 noté log, comme dans le cours ; log_a sinon. */
const logTex = (a: number) => (a === 10 ? '\\log' : `\\log_{${a}}`)

/** u(x) affine ou du second degré, avec sa dérivée. */
function tirerU() {
  const forme = choice(['affine', 'carre', 'trinome'])
  const coeffs =
    forme === 'affine'
      ? [randint(-5, 5, [0]), choice([-2, -1, 2, 3, 4])]
      : forme === 'carre'
        ? [randint(1, 6), 0, 1]
        : [0, randint(-5, 5, [0]), 1]
  const u = polynome(coeffs)
  return { u: u.toLatex(), du: u.derivee(), affine: forme === 'affine' }
}

type Derivee = { f: string; correction: string; reponse: string }

function tirer(forme: string): Derivee {
  const a = choice([2, 3, 5, 10])
  const lna = `\\ln(${a})`
  switch (forme) {
    case 'exp': {
      const k = choice([1, 2, 3, 5, -1, -2, -4])
      const coef = rienSi1(k)
      const reponse = `${coef}${lna}\\,${a}^{x}`
      return {
        // k × a^x : sans signe, -4 et 2^x se liraient -42^x.
        f: Math.abs(k) === 1 ? `${coef}${a}^{x}` : `${k}\\times ${a}^{x}`,
        correction:
          `On écrit $${a}^x=\\mathrm{e}^{x${lna}}$ :` +
          bloc(
            `\\begin{aligned}f'(x)&=\\left(${coef}\\mathrm{e}^{x${lna}}\\right)'` +
              `\\\\&=${coef}${lna}\\,\\mathrm{e}^{x${lna}}` +
              `\\\\&=${miseEnEvidence(reponse)}\\end{aligned}`,
          ),
        reponse,
      }
    }
    case 'expCompo': {
      const { u, du, affine } = tirerU()
      const duTex = du.toLatex()
      // u' constant ou monôme (2x) : devant, sans parenthèses ; sinon entre parenthèses.
      const unTerme = affine || du.monomes[0] === 0
      const facteur = affine
        ? rienSi1(Number(du.monomes[0]))
        : unTerme
          ? duTex
          : `(${duTex})`
      const reponse = `${facteur}${lna}\\,${a}^{${u}}`
      return {
        f: `${a}^{${u}}`,
        correction:
          `On écrit $${a}^{${u}}=\\mathrm{e}^{(${u})${lna}}$ et on dérive $\\mathrm{e}^{v}$ avec $v(x)=(${u})${lna}$, donc $v'(x)=${unTerme ? duTex : `(${duTex})`}${lna}$ :` +
          bloc(
            `\\begin{aligned}f'(x)&=v'(x)\\,\\mathrm{e}^{v(x)}` +
              `\\\\&=${facteur}${lna}\\,\\mathrm{e}^{(${u})${lna}}` +
              `\\\\&=${miseEnEvidence(reponse)}\\end{aligned}`,
          ),
        reponse,
      }
    }
    case 'log': {
      const k = choice([1, 2, 3, 5, -1, -2])
      const coef = rienSi1(k)
      // -1/ln(5) s'écrit avec le signe devant la fraction.
      const signe = k < 0 ? '-' : ''
      const reponse = `${signe}\\dfrac{${Math.abs(k)}}{x${lna}}`
      return {
        f: `${coef}${logTex(a)}(x)`,
        correction:
          `On écrit $${logTex(a)}(x)=\\frac{\\ln(x)}{${lna}}$ :` +
          bloc(
            `\\begin{aligned}f'(x)&=\\left(${signe}\\dfrac{${Math.abs(k)}}{${lna}}\\ln(x)\\right)'` +
              `\\\\&=${signe}\\dfrac{${Math.abs(k)}}{${lna}}\\cdot\\dfrac{1}{x}` +
              `\\\\&=${miseEnEvidence(reponse)}\\end{aligned}`,
          ),
        reponse,
      }
    }
    default: {
      const { u, du } = tirerU()
      const duTex = du.toLatex()
      const reponse = `\\dfrac{${duTex}}{(${u})${lna}}`
      return {
        f: `${logTex(a)}(${u})`,
        correction:
          `On écrit $${logTex(a)}(${u})=\\frac{\\ln(${u})}{${lna}}$ et on dérive $\\ln(u)$ avec $u(x)=${u}$, donc $u'(x)=${duTex}$ :` +
          bloc(
            `\\begin{aligned}f'(x)&=\\dfrac{1}{${lna}}\\cdot\\dfrac{u'(x)}{u(x)}` +
              `\\\\&=${miseEnEvidence(reponse)}\\end{aligned}`,
          ),
        reponse,
      }
    }
  }
}

/**
 * Dérivées de k·a^x, a^u(x), k·log_a(x) et log_a(u(x)), en se ramenant à exp et ln :
 * a^x = e^(x ln a) et log_a(x) = ln(x)/ln(a).
 * @author Nathan Scheinmann
 */
export default class DeriverBaseA extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 2
    this.comment =
      "La correction se ramène à l'exponentielle et au logarithme népérien : $a^x=\\mathrm{e}^{x\\ln(a)}$ et $\\log_a(x)=\\dfrac{\\ln(x)}{\\ln(a)}$ ; $\\log$ désigne le logarithme en base $10$. La base $a$ est $2$, $3$, $5$ ou $10$ ; $u$ est affine ou du second degré. La réponse est acceptée sous toute forme équivalente, à condition d'écrire $\\ln$ avec ses parenthèses ($\\ln(10)x$ et non $\\ln 10x$)."
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const formes = repartitionPonderee(
      shuffle(params.liste('formes')),
      this.nbQuestions,
      shuffle(params.declares('formes')),
    )
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const d = tirer(formes[i])
      if (!this.questionJamaisPosee(i, d.f)) continue
      createQuestion(this, i, {
        question: `Calculer la dérivée de la fonction $f$ définie par $f(x)=${d.f}$.`,
        correction: d.correction,
        answer: { value: d.reponse, compare: seq([isEqual()]) },
        field: {
          keyboard: KeyboardType.clavierFonctionsTerminales,
          texteAvant: "<br>$f'(x)=$",
        },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
