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
import {
    ecritureAlgebrique,
    ecritureAlgebriqueSauf1,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import { context } from '../../../modules/context'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Calculer une limite avec le logarithme'
export const dateDePublication = '27/10/2026'
export const uuid = 'ba864'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mExpLog-6'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Types de fonctions',
      items: [
        { nom: 'composee', label: 'ln(u(x)), u rationnelle' },
        { nom: 'quotient', label: 'quotients avec ln(x)' },
        { nom: 'difference', label: 'différence de deux ln' },
      ],
    },
  ],
}

type Limite = {
  /** Expression de f(x). */
  f: string
  domaine: string
  /** Ce vers quoi tend x, par exemple `-1^{+}` ou `+\infty`. */
  borne: string
  correction: string
  reponse: string
}

const plusInf = '+\\infty'
const moinsInf = '-\\infty'
const infini = (positif: boolean) => (positif ? plusInf : moinsInf)
const zero = (positif: boolean) => (positif ? '0^{+}' : '0^{-}')
const affine = (a: number, p = 1) => new Polynome({ coeffs: [a, p] }).toLatex()
const intervalle = (a: string, b: string) => `\\left]${a};${b}\\right[`
const reunion = (...i: string[]) => i.join('\\cup')
const lim = (borne: string) => `\\lim_{x\\to ${borne}}`

/** Formule sur sa propre ligne. En Typst, une fraction en début de ligne décale la ligne de base. */
const bloc = (tex: string) =>
  context.isTypst ? `$$${tex}$$` : `<br>$${tex}$<br>`

/**
 * Suite d'étapes : une phrase (le théorème utilisé), puis les limites obtenues, alignées.
 * Aucune écriture du type 4/0⁺ : on donne les limites des morceaux, puis on conclut.
 */
const rediger = (...etapes: [string, string[]][]) =>
  etapes
    .map(
      ([texte, lignes]) =>
        `${texte}${bloc(`\\begin{aligned}${lignes.join('\\\\')}\\end{aligned}`)}`,
    )
    .join('')

/** En Typst, \dfrac et \displaystyle sortent la formule de la ligne : on garde la taille courante. */
const enLigne = (tex: string) =>
  context.isTypst
    ? tex.replaceAll('\\dfrac', '\\frac').replaceAll('\\displaystyle', '')
    : tex

const morceaux = 'On calcule les limites du numérateur et du dénominateur :'
const parQuotient = (num: string, den: string) =>
  `Par la règle du quotient, le numérateur tendant vers $${num}$ et le dénominateur vers $${den}$, on obtient :`
/** Conclusion par composition avec ln, à partir de la limite de l'argument. */
const composition = (L: string, versArgument: string, reponse: string) =>
  versArgument === '1'
    ? ([
        'Par continuité de $\\ln$ en $1$, on obtient :',
        [`${L}f(x)&=\\ln(1)=${miseEnEvidence('0')}`],
      ] as [string, string[]])
    : ([
        `Par la règle de composition, comme $\\ln$ tend vers $${reponse}$ en $${versArgument}$, on obtient :`,
        [`${L}f(x)&=${miseEnEvidence(reponse)}`],
      ] as [string, string[]])

/** ln(u(x)) aux bornes de son ensemble de définition. */
function tirerComposee(): Limite {
  if (choice([true, false])) {
    // u(x) = x²/(x + a) : sur l'ensemble de définition, x > -a et x ≠ 0.
    const a = randint(-3, 3, [0])
    const u = `\\dfrac{x^2}{${affine(a)}}`
    const f = `\\ln\\left(${u}\\right)`
    const domaine =
      a > 0
        ? reunion(intervalle(`${-a}`, '0'), intervalle('0', plusInf))
        : intervalle(`${-a}`, plusInf)
    const cas = choice(
      a > 0 ? ['pole', 'zeroG', 'zeroD', 'inf'] : ['pole', 'inf'],
    )
    if (cas === 'pole') {
      const borne = `${-a}^{+}`
      const L = lim(borne)
      return {
        f,
        domaine,
        borne,
        correction: rediger(
          [morceaux, [`${L}x^2&=${a * a}`, `${L}(${affine(a)})&=0^{+}`]],
          [parQuotient(`${a * a}`, '0^{+}'), [`${L}${u}&=${plusInf}`]],
          composition(L, plusInf, plusInf),
        ),
        reponse: plusInf,
      }
    }
    if (cas === 'inf') {
      const L = lim(plusInf)
      const den = `1${ecritureAlgebrique(a)}/x`
      return {
        f,
        domaine,
        borne: plusInf,
        correction: rediger(
          [
            'Pour $x>0$, on divise le numérateur et le dénominateur par $x$ :',
            [
              `${u}&=\\dfrac{x}{${den}}`,
              `${L}x&=${plusInf}`,
              `${L}\\left(${den}\\right)&=1`,
            ],
          ],
          [parQuotient(plusInf, '1'), [`${L}${u}&=${plusInf}`]],
          composition(L, plusInf, plusInf),
        ),
        reponse: plusInf,
      }
    }
    const borne = zero(cas === 'zeroD')
    const L = lim(borne)
    return {
      f,
      domaine,
      borne,
      correction: rediger(
        [morceaux, [`${L}x^2&=0^{+}`, `${L}(${affine(a)})&=${a}`]],
        [parQuotient('0^{+}', `${a}`), [`${L}${u}&=0^{+}`]],
        composition(L, '0^{+}', moinsInf),
      ),
      reponse: moinsInf,
    }
  }
  // u(x) = (x + a)/(x + b) : positive en dehors de l'intervalle entre -a et -b.
  const a = randint(-3, 3)
  const b = randint(-3, 3, [a])
  const u = `\\dfrac{${affine(a)}}{${affine(b)}}`
  const f = `\\ln\\left(${u}\\right)`
  const [m, M] = [Math.min(-a, -b), Math.max(-a, -b)]
  const domaine = reunion(
    intervalle(moinsInf, `${m}`),
    intervalle(`${M}`, plusInf),
  )
  const cas = choice(['m', 'M', 'inf'])
  if (cas === 'inf') {
    const borne = choice([plusInf, moinsInf])
    const L = lim(borne)
    const terme = (c: number) => (c === 0 ? '' : `${ecritureAlgebrique(c)}/x`)
    return {
      f,
      domaine,
      borne,
      correction: rediger(
        [
          'Pour $x\\neq 0$, on divise le numérateur et le dénominateur par $x$ ; les deux tendent alors vers $1$, donc, par la règle du quotient, on obtient :',
          [`${L}${u}&=${L}\\dfrac{1${terme(a)}}{1${terme(b)}}=1`],
        ],
        composition(L, '1', '0'),
      ),
      reponse: '0',
    }
  }
  const c = cas === 'm' ? m : M
  const droite = cas === 'M'
  const borne = `${c}^{${droite ? '+' : '-'}}`
  const L = lim(borne)
  // Le numérateur ou le dénominateur s'annule en c, du signe du côté d'où vient x.
  const zeroNum = c === -a
  const autre = zeroNum ? c + b : c + a
  return {
    f,
    domaine,
    borne,
    correction: zeroNum
      ? rediger(
          [
            morceaux,
            [
              `${L}(${affine(a)})&=${zero(droite)}`,
              `${L}(${affine(b)})&=${autre}`,
            ],
          ],
          [parQuotient(zero(droite), `${autre}`), [`${L}${u}&=0^{+}`]],
          composition(L, '0^{+}', moinsInf),
        )
      : rediger(
          [
            morceaux,
            [
              `${L}(${affine(a)})&=${autre}`,
              `${L}(${affine(b)})&=${zero(droite)}`,
            ],
          ],
          [parQuotient(`${autre}`, zero(droite)), [`${L}${u}&=${plusInf}`]],
          composition(L, plusInf, plusInf),
        ),
    reponse: zeroNum ? moinsInf : plusInf,
  }
}

/** Quotients avec ln(x) au dénominateur, sur ]0;1[ ∪ ]1;+∞[. */
function tirerQuotient(): Limite {
  const domaine = reunion(intervalle('0', '1'), intervalle('1', plusInf))
  const cas = choice(['0', '1-', '1+', 'inf'])
  const borne = { '0': '0^{+}', '1-': '1^{-}', '1+': '1^{+}', inf: plusInf }[
    cas
  ]!
  const L = lim(borne)
  const forme = choice(['xSurLn', 'lnSurLn', 'lnSurLn2'])
  if (forme === 'xSurLn') {
    // f(x) = (cx + k ln x)/ln x = c·x/ln(x) + k
    const c = choice([-2, -1, 1, 2, 3])
    const k = randint(-3, 3, [0])
    const f = `\\dfrac{${rienSi1(c)}x${ecritureAlgebriqueSauf1(k)}\\ln(x)}{\\ln(x)}`
    const separe: [string, string[]] = [
      'On sépare le quotient :',
      [`f(x)&=${rienSi1(c)}\\dfrac{x}{\\ln(x)}${ecritureAlgebrique(k)}`],
    ]
    const xSurLn = cas === '0' ? '0' : infini(cas !== '1-')
    const reponse = cas === '0' ? `${k}` : infini((cas !== '1-') === c > 0)
    const etapeXSurLn: [string, string[]][] =
      cas === 'inf'
        ? [
            [
              'Par croissance comparée, on sait que :',
              [`${L}\\dfrac{\\ln(x)}{x}&=0^{+}`],
            ],
            [
              `Par la règle de l'inverse, comme $\\dfrac{\\ln(x)}{x}$ tend vers $0^{+}$, on obtient :`,
              [`${L}\\dfrac{x}{\\ln(x)}&=${plusInf}`],
            ],
          ]
        : [
            [
              'On calcule les limites de $x$ et de $\\ln(x)$ :',
              [
                `${L}x&=${cas === '0' ? '0' : '1'}`,
                `${L}\\ln(x)&=${cas === '0' ? moinsInf : zero(cas === '1+')}`,
              ],
            ],
            [
              parQuotient(
                cas === '0' ? '0' : '1',
                cas === '0' ? moinsInf : zero(cas === '1+'),
              ),
              [`${L}\\dfrac{x}{\\ln(x)}&=${xSurLn}`],
            ],
          ]
    return {
      f,
      domaine,
      borne,
      correction: rediger(separe, ...etapeXSurLn, [
        c === 1 || cas === '0'
          ? 'Par la règle de la somme, on obtient :'
          : `Par la règle du produit, le facteur $${c}$ étant ${c > 0 ? 'positif' : 'négatif'}, puis par la règle de la somme, on obtient :`,
        [`${L}f(x)&=${miseEnEvidence(reponse)}`],
      ]),
      reponse,
    }
  }
  // f(x) = (a ln x + b)/ln(x) ou (a ln x + b)/ln²(x)
  const a = randint(-3, 3, [0])
  const b = randint(-4, 4, [0])
  const carre = forme === 'lnSurLn2'
  const num = `${rienSi1(a)}\\ln(x)${ecritureAlgebrique(b)}`
  const den = carre ? '\\ln^2(x)' : '\\ln(x)'
  const f = `\\dfrac{${num}}{${den}}`
  const plusB = (d: string) =>
    `${b > 0 ? '+' : '-'}\\dfrac{${Math.abs(b)}}{${d}}`
  if (cas === '0' || cas === 'inf') {
    const versLn = infini(cas === 'inf')
    const reponse = carre ? '0' : `${a}`
    return {
      f,
      domaine,
      borne,
      correction: rediger(
        [
          'On sépare le quotient :',
          [
            carre
              ? `f(x)&=\\dfrac{${a}}{\\ln(x)}${plusB('\\ln^2(x)')}`
              : `f(x)&=${a}${plusB('\\ln(x)')}`,
          ],
        ],
        [
          carre
            ? 'On calcule les limites des dénominateurs :'
            : 'On calcule la limite du dénominateur :',
          carre
            ? [`${L}\\ln(x)&=${versLn}`, `${L}\\ln^2(x)&=${plusInf}`]
            : [`${L}\\ln(x)&=${versLn}`],
        ],
        [
          `Par la règle du quotient, ${carre ? 'les deux fractions tendent' : 'la fraction tend'} vers $0$ ; par la règle de la somme, on obtient :`,
          [`${L}f(x)&=${miseEnEvidence(reponse)}`],
        ],
      ),
      reponse,
    }
  }
  const droite = cas === '1+'
  // Le dénominateur tend vers 0 : 0⁺ pour ln², sinon du signe de ln(x).
  const denPositif = carre || droite
  const reponse = infini(b > 0 === denPositif)
  return {
    f,
    domaine,
    borne,
    correction: rediger(
      [
        morceaux,
        [`${L}\\left(${num}\\right)&=${b}`, `${L}${den}&=${zero(denPositif)}`],
      ],
      [
        parQuotient(`${b}`, zero(denPositif)),
        [`${L}f(x)&=${miseEnEvidence(reponse)}`],
      ],
    ),
    reponse,
  }
}

/** ln(px + a) - ln(qx + b), sur ]max(-a/p ; -b/q) ; +∞[. */
function tirerDifference(): Limite {
  const p = randint(1, 3)
  const q = choice([true, false]) ? p : randint(1, 3, [p])
  const c1 = randint(-3, 3)
  const c2 = randint(-3, 3, [c1])
  const [a, b] = [-p * c1, -q * c2]
  const [g, h] = [affine(a, p), affine(b, q)]
  const f = `\\ln(${g})-\\ln(${h})`
  const m = Math.max(c1, c2)
  const domaine = intervalle(`${m}`, plusInf)
  if (choice([true, false])) {
    const L = lim(plusInf)
    const d = pgcd(p, q)
    const [pp, qq] = [p / d, q / d]
    const quotient =
      pp === qq ? '1' : qq === 1 ? `${pp}` : `\\dfrac{${pp}}{${qq}}`
    const reponse =
      pp === qq
        ? '0'
        : qq === 1
          ? `\\ln(${pp})`
          : `\\ln\\left(\\dfrac{${pp}}{${qq}}\\right)`
    const terme = (c: number) => (c === 0 ? '' : `${ecritureAlgebrique(c)}/x`)
    return {
      f,
      domaine,
      borne: plusInf,
      correction: rediger(
        [
          `Les deux logarithmes tendent vers $${plusInf}$ : c'est une forme indéterminée. On les regroupe :`,
          [`f(x)&=\\ln\\left(\\dfrac{${g}}{${h}}\\right)`],
        ],
        [
          `On divise le numérateur et le dénominateur par $x$ ; ils tendent alors vers $${p}$ et $${q}$, donc, par la règle du quotient, on obtient :`,
          [
            `${L}\\dfrac{${g}}{${h}}&=${L}\\dfrac{${p}${terme(a)}}{${q}${terme(b)}}=${quotient}`,
          ],
        ],
        pp === qq
          ? composition(L, '1', '0')
          : [
              `Par continuité de $\\ln$ en $${quotient}$, on obtient :`,
              [`${L}f(x)&=${miseEnEvidence(reponse)}`],
            ],
      ),
      reponse,
    }
  }
  const borne = `${m}^{+}`
  const L = lim(borne)
  const premier = m === c1
  // L'argument qui s'annule en m tend vers 0⁺ ; l'autre a une limite strictement positive.
  const [nul, fini, valeur] = premier ? [g, h, q * m + b] : [h, g, p * m + a]
  const reponse = premier ? moinsInf : plusInf
  return {
    f,
    domaine,
    borne,
    correction: rediger(
      [
        'On calcule les limites des expressions dans les logarithmes :',
        [`${L}(${nul})&=0^{+}`, `${L}(${fini})&=${valeur}`],
      ],
      [
        `Par la règle de composition, comme $\\ln$ tend vers $${moinsInf}$ en $0^{+}$, et par continuité de $\\ln$ en $${valeur}$, on obtient :`,
        [
          `${L}\\ln(${nul})&=${moinsInf}`,
          `${L}\\ln(${fini})&=${valeur === 1 ? '0' : `\\ln(${valeur})`}`,
        ],
      ],
      [
        'Par la règle de la somme, on obtient :',
        [`${L}f(x)&=${miseEnEvidence(reponse)}`],
      ],
    ),
    reponse,
  }
}

/**
 * Limites de fonctions avec ln, comme dans les études de fonctions : ln(u(x)) aux bornes
 * de l'ensemble de définition, quotients avec ln(x) (dont la croissance comparée x/ln(x)),
 * différence de deux ln regroupée en un seul.
 * @author Nathan Scheinmann
 */
export default class LimitesLogarithme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.spacingCorr = 2
    this.comment =
      "Chaque question demande une limite en une borne de l'ensemble de définition, donné dans l'énoncé. La réponse est un nombre (éventuellement écrit avec $\\ln$), $+\\infty$ ou $-\\infty$."
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    const tirer = { composee: tirerComposee, quotient: tirerQuotient }
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const l = (tirer[familles[i] as keyof typeof tirer] ?? tirerDifference)()
      if (!this.questionJamaisPosee(i, l.f, l.borne)) continue
      const lim = `\\displaystyle\\lim_{x\\to ${l.borne}}f(x)`
      createQuestion(this, i, {
        question: enLigne(
          `Soit $f$ la fonction définie sur $${l.domaine}$ par :${bloc(`f(x)=${l.f}`)}${this.interactif ? '' : `Calculer $${lim}$.`}`,
        ),
        correction: enLigne(l.correction),
        answer: { value: l.reponse, compare: seq([isEqual()]) },
        field: {
          keyboard: KeyboardType.clavierLimites,
          texteAvant: enLigne(`$${lim}=$`),
        },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
