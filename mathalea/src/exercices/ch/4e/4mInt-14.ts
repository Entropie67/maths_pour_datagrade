import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { isEqual, noDecimal, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
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

export const titre = 'Calculer une intégrale en reconnaissant une forme'
export const dateDePublication = '02/11/2026'
export const uuid = '36567'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-14'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'formes',
      label: 'Formes de la fonction',
      items: [
        { nom: 'quotientExp', label: "u'/u avec u = exp(ax) + c" },
        { nom: 'division', label: 'Degré 3 sur degré 1' },
        { nom: 'lnSurX', label: 'Avec ln(x) et 1/x' },
        { nom: 'expCompose', label: "u' exp(u) avec u = √x, 1/x ou x²" },
        { nom: 'trigo', label: 'Avec sinus et cosinus' },
      ],
    },
  ],
}

type Forme = 'quotientExp' | 'division' | 'lnSurX' | 'expCompose' | 'trigo'

type Tirage = {
  integrande: string
  /** Bornes, en \frac (elles sont en indice et en exposant). */
  a: string
  b: string
  /** Phrases avant le calcul. */
  texte: string
  /** Lignes du calcul aligné, après « I&= ». */
  lignes: string[]
  valeur: string
}

const E = '\\mathrm{e}'
const frac = (n: number, d = 1) => new FractionEtendue(n, d).simplifie()

/** Somme de termes signés : « 2-\sqrt{2} ». */
const somme = (termes: string[]) =>
  termes.length === 0 ? '0' : termes.join('+').replaceAll('+-', '-')

/** Fraction affichée en ligne, sans signe + : « 3 », « -\dfrac{1}{2} ». */
const texFrac = (q: FractionEtendue) => q.texFractionSimplifiee

/** \ln d'un rationnel positif : « \ln(3) », « \ln\left(\dfrac{3}{2}\right) ». */
const lnTex = (r: FractionEtendue) =>
  r.den === 1
    ? `\\ln(${r.num})`
    : `\\ln\\left(${r.texFractionSimplifiee}\\right)`

/** c·ln(r), écrit avec le \ln d'un nombre supérieur à 1 : ln(1/2) = -ln(2). */
function coefLn(c: FractionEtendue, r: FractionEtendue): string {
  return r.valeurDecimale > 1
    ? `${rienSi1(c)}${lnTex(r)}`
    : `${rienSi1(c.oppose())}${lnTex(frac(r.den, r.num))}`
}

/** c(contenu), sans parenthèses si c = 1 : « 3\left(\ln(6)-\ln(2)\right) », « \ln(6)-\ln(2) ». */
function facteur(c: number | FractionEtendue, contenu: string): string {
  const q = typeof c === 'number' ? frac(c) : c
  return q.num === q.den ? contenu : `${rienSi1(q)}\\left(${contenu}\\right)`
}

/** Coefficient devant une fraction : « 3 », « \dfrac{3}{2}\cdot », « - ». */
const coefDevantFraction = (c: FractionEtendue) =>
  c.den === 1 ? rienSi1(c) : `${rienSi1(c)}\\cdot`

/** e^L : « 1 », « \mathrm{e} », « \mathrm{e}^{2} », « \mathrm{e}^{1/2} » (exposant en ligne). */
function expTex(L: FractionEtendue): string {
  if (L.num === 0) return '1'
  if (L.num === 1 && L.den === 1) return E
  return `${E}^{${L.den === 1 ? L.num : `${L.num}/${L.den}`}}`
}

/** c(e^P - e^Q), avec un coefficient positif devant la parenthèse. */
function coefDiffExp(
  c: FractionEtendue,
  P: FractionEtendue,
  Q: FractionEtendue,
): string {
  const [haut, bas] = c.valeurDecimale > 0 ? [P, Q] : [Q, P]
  const absolu = c.valeurDecimale > 0 ? c : c.oppose()
  return facteur(absolu, `${expTex(haut)}-${expTex(bas)}`)
}

/** Fraction en borne d'intégrale : \frac (petit) ; en ligne en Typst, qui l'afficherait en grand. */
const borneFrac = (numerateur: string, den: number) =>
  context.isTypst ? `${numerateur}/${den}` : `\\frac{${numerateur}}{${den}}`

/** Multiple de π : « 0 », « \frac{\pi}{6} », « \frac{2\pi}{3} ». */
function piTex(q: FractionEtendue, style = '\\frac'): string {
  if (q.num === 0) return '0'
  const numerateur = `${q.num === 1 ? '' : q.num}\\pi`
  if (q.den === 1) return numerateur
  return style === '\\frac'
    ? borneFrac(numerateur, q.den)
    : `${style}{${numerateur}}{${q.den}}`
}

/** Combinaison q₁ + q₂√2 + q₃√3, indexée par le radicande. */
type Radical = Map<number, FractionEtendue>

function radicalTex(r: Radical): string {
  const termes = [...r.entries()]
    .sort(([p], [q]) => p - q)
    .filter(([, q]) => q.num !== 0)
    .map(([radicande, q]) => {
      if (radicande === 1) return texFrac(q)
      const racine = `\\sqrt{${radicande}}`
      const n = Math.abs(q.num)
      const numerateur = `${n === 1 ? '' : n}${racine}`
      return `${q.num < 0 ? '-' : ''}${q.den === 1 ? numerateur : `\\dfrac{${numerateur}}{${q.den}}`}`
    })
  // Un terme positif en tête : « \dfrac{8\sqrt{3}}{3}-4 » plutôt que « -4+\dfrac{8\sqrt{3}}{3} ».
  return somme([
    ...termes.filter((t) => !t.startsWith('-')),
    ...termes.filter((t) => t.startsWith('-')),
  ])
}

function combinaison(termes: [FractionEtendue, Radical][]): Radical {
  const resultat: Radical = new Map()
  for (const [c, r] of termes) {
    for (const [radicande, q] of r) {
      const avant = resultat.get(radicande) ?? frac(0)
      resultat.set(
        radicande,
        avant.sommeFraction(c.produitFraction(q)).simplifie(),
      )
    }
  }
  return resultat
}

const radical = (q: FractionEtendue, radicande = 1): Radical =>
  new Map([[radicande, q]])

/** k e^(ax)/(e^(ax) ± c) : u'/u, entre 0 et ln(r) ou entre 0 et 1. */
function tirerQuotientExp(): Tirage {
  const a = choice([1, 2, 3])
  const k = randint(1, 6)
  const coef = frac(k, a)
  const ax = `${rienSi1(a)}x`
  const eax = `${E}^{${ax}}`
  const moins = choice([true, false, false])
  const r = a === 1 ? choice([2, 3]) : 2
  const ra = r ** a
  // u < 0 sur [0 ; ln(r)] lorsque c > r^a.
  const c = moins ? randint(ra + 1, ra + 6) : randint(1, 9)
  const versUn = !moins && choice([true, false])
  const u = `${eax}${moins ? '-' : '+'}${c}`
  const integrande = `\\dfrac{${rienSi1(k)}${eax}}{${u}}`
  const b = versUn ? '1' : `\\ln(${r})`
  const preparation = `la fonction à intégrer s'écrit $${coefDevantFraction(coef)}\\dfrac{u'(x)}{u(x)}$`
  // e^(a ln(r)) = r^a
  const eLn = `${E}^{${rienSi1(a)}\\ln(${r})}=${a === 1 ? r : `${r}^{${a}}=${ra}`}`
  const signe = moins
    ? `Sur $[0;${b}]$, $${eax}\\leqslant ${eLn}<${c}$, donc $u(x)<0$ et $|u(x)|=-u(x)=${c}-${eax}$.`
    : `Comme $${eax}>0$, $u(x)>0$ et $|u(x)|=u(x)$.`
  const [uA, uB] = moins ? [c - 1, c - ra] : [1 + c, ra + c]
  const primitive = moins ? `\\ln(${c}-${eax})` : `\\ln(${u})`
  const lignes = [
    `${rienSi1(coef)}\\left[${primitive}\\right]_{0}^{${b}}`,
    versUn
      ? facteur(coef, `\\ln(${expTex(frac(a))}+${c})-\\ln(${uA})`)
      : facteur(coef, `\\ln(${uB})-\\ln(${uA})`),
  ]
  const valeur = versUn
    ? `${rienSi1(coef)}\\ln\\left(\\dfrac{${expTex(frac(a))}+${c}}{${uA}}\\right)`
    : coefLn(coef, frac(uB, uA))
  return {
    integrande,
    a: '0',
    b,
    texte:
      `On pose $u(x)=${u}$ ; alors $u'(x)=${rienSi1(a)}${eax}$ et ${preparation}. Une primitive de $\\dfrac{u'}{u}$ est $\\ln|u|$. ${signe}` +
      (versUn || moins ? '' : ` On utilise $${eLn}$.`),
    lignes: [...lignes, valeur],
    valeur,
  }
}

/** (x + d)Q(x) + R sur x + d : division euclidienne, puis R ln|x + d|. */
function tirerDivision(): Tirage {
  for (;;) {
    const alpha = choice([1, 1, 2, 3])
    const p = randint(-4, 4)
    const q = randint(-5, 5)
    const d = randint(-3, 3, [0])
    const R = randint(-5, 5, [0])
    const coeffs = [q * d + R, q + p * d, p + alpha * d, alpha]
    if (coeffs.some((c) => Math.abs(c) > 12)) continue
    const droite = choice([true, false])
    const pres = randint(1, 2)
    const longueur = randint(1, 2)
    const [u, v] = droite
      ? [-d + pres, -d + pres + longueur]
      : [-d - pres - longueur, -d - pres]
    if (Math.abs(u) > 4 || Math.abs(v) > 4) continue
    const numerateur = new Polynome({ coeffs }).toLatex()
    const den = reduireAxPlusB(1, d)
    const quotient = new Polynome({ coeffs: [q, p, alpha] }).toLatex()
    const partieQ = (x: number) =>
      frac(alpha * x ** 3, 3)
        .sommeFraction(frac(p * x * x, 2))
        .sommeFraction(frac(q * x))
        .simplifie()
    const rationnel = partieQ(v).differenceFraction(partieQ(u)).simplifie()
    const [au, av] = [Math.abs(u + d), Math.abs(v + d)]
    const partieLn = coefLn(frac(R), frac(av, au))
    const valeur =
      rationnel.num === 0 ? partieLn : somme([texFrac(rationnel), partieLn])
    const primitive = somme(
      [
        `${rienSi1(frac(alpha, 3))}x^{3}`,
        p === 0 ? '' : `${rienSi1(frac(p, 2))}x^{2}`,
        q === 0 ? '' : `${rienSi1(q)}x`,
        `${rienSi1(R)}\\ln|${den}|`,
      ].filter((s) => s !== ''),
    )
    const element = `${R < 0 ? '-' : ''}\\dfrac{${Math.abs(R)}}{${den}}`
    return {
      integrande: `\\dfrac{${numerateur}}{${den}}`,
      a: String(u),
      b: String(v),
      texte:
        `La fonction à intégrer est continue sur $[${u};${v}]$, qui ne contient pas $${-d}$. ` +
        `La division euclidienne du numérateur par $${den}$ donne $${numerateur}=(${den})(${quotient})${ecritureAlgebrique(R)}$, ` +
        `donc pour $x\\neq${-d}$ : $\\dfrac{${numerateur}}{${den}}=${quotient}${element.startsWith('-') ? '' : '+'}${element}$.`,
      lignes: [
        `\\int_{${u}}^{${v}}\\left(${quotient}${element.startsWith('-') ? '' : '+'}${element}\\right)\\mathrm{d}x`,
        `\\left[${primitive}\\right]_{${u}}^{${v}}`,
        somme([
          `\\left(${texFrac(partieQ(v))}-${texFrac(partieQ(u)).startsWith('-') ? `\\left(${texFrac(partieQ(u))}\\right)` : texFrac(partieQ(u))}\\right)`,
          facteur(R, `\\ln(${av})-\\ln(${au})`),
        ]),
        valeur,
      ],
      valeur,
    }
  }
}

/** ln(x) aux bornes 1, e et e² : 0, 1 et 2. */
const bornesLn: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
]
const borneLnTex = (L: number) => (L === 0 ? '1' : expTex(frac(L)))

/** (a + b ln x)ⁿ/x ou k/(x(a + b ln x)). */
function tirerLnSurX(): Tirage {
  const [L1, L2] = choice(bornesLn)
  const rappel = `On utilise $\\ln(${borneLnTex(L1)})=${L1}$ et $\\ln(${borneLnTex(L2)})=${L2}$.`
  if (choice([true, false])) {
    const n = randint(1, 3)
    const a = randint(0, 4)
    const b = a === 0 ? 1 : choice([1, 2, 3, -1])
    const u =
      a === 0
        ? '\\ln(x)'
        : `${a}${b > 0 ? '+' : '-'}${rienSi1(Math.abs(b))}\\ln(x)`
    const [uA, uB] = [a + b * L1, a + b * L2]
    const valeurQ = frac(uB ** (n + 1) - uA ** (n + 1), b * (n + 1))
    // Des puissances lisibles : |u| ≤ 5, 4 ou 3 aux bornes selon n.
    const borneU = 6 - n
    if (valeurQ.num === 0 || Math.max(Math.abs(uA), Math.abs(uB)) > borneU)
      return tirerLnSurX()
    const puissance = n === 1 ? u : `\\left(${u}\\right)^{${n}}`
    const coefP = frac(1, b * (n + 1))
    const valeur = texFrac(valeurQ)
    const uN = n === 1 ? 'u' : `u^{${n}}`
    const forme = `${rienSi1(frac(1, b))}u'(x)${n === 1 ? 'u(x)' : `u(x)^{${n}}`}`
    const uPrime = `${b < 0 ? '-' : ''}\\dfrac{${Math.abs(b)}}{x}`
    const parenthese = (t: number) => (t < 0 ? `(${t})` : String(t))
    return {
      integrande: `\\dfrac{${puissance}}{x}`,
      a: borneLnTex(L1),
      b: borneLnTex(L2),
      texte: `On pose $u(x)=${u}$ ; alors $u'(x)=${uPrime}$ et la fonction à intégrer s'écrit $${forme}$. Une primitive de $u'${uN}$ est $\\dfrac{u^{${n + 1}}}{${n + 1}}$. ${rappel}`,
      lignes: [
        `\\left[${rienSi1(coefP)}\\left(${u}\\right)^{${n + 1}}\\right]_{${borneLnTex(L1)}}^{${borneLnTex(L2)}}`,
        facteur(
          coefP,
          `${parenthese(uB)}^{${n + 1}}-${parenthese(uA)}^{${n + 1}}`,
        ),
        valeur,
      ],
      valeur,
    }
  }
  // k/(x(a + b ln x)) : u'/u, avec u de signe constant sur l'intervalle.
  for (;;) {
    const k = randint(1, 3)
    const b = choice([1, 2, 3])
    const a = randint(-6, 4, [0])
    const [uA, uB] = [a + b * L1, a + b * L2]
    if (uA * uB <= 0) continue
    const u = `${a}+${rienSi1(b)}\\ln(x)`
    const coef = frac(k, b)
    const positif = uA > 0
    const valeur = coefLn(coef, frac(Math.abs(uB), Math.abs(uA)))
    const signe = positif
      ? `Sur $[${borneLnTex(L1)};${borneLnTex(L2)}]$, $u(x)\\geqslant${uA}>0$, donc $|u(x)|=u(x)$.`
      : `Sur $[${borneLnTex(L1)};${borneLnTex(L2)}]$, $u(x)\\leqslant${uB}<0$, donc $|u(x)|=-u(x)$.`
    return {
      integrande: `\\dfrac{${k}}{x\\left(${u}\\right)}`,
      a: borneLnTex(L1),
      b: borneLnTex(L2),
      texte: `On pose $u(x)=${u}$ ; alors $u'(x)=\\dfrac{${b}}{x}$ et la fonction à intégrer s'écrit $${coefDevantFraction(coef)}\\dfrac{u'(x)}{u(x)}$. Une primitive de $\\dfrac{u'}{u}$ est $\\ln|u|$. ${signe} ${rappel}`,
      lignes: [
        `${rienSi1(coef)}\\left[\\ln\\left|${u}\\right|\\right]_{${borneLnTex(L1)}}^{${borneLnTex(L2)}}`,
        facteur(coef, `\\ln(${Math.abs(uB)})-\\ln(${Math.abs(uA)})`),
        valeur,
      ],
      valeur,
    }
  }
}

/** k u'(x) e^(u(x)) avec u = √x, 1/x ou ±x². */
function tirerExpCompose(): Tirage {
  const sorte = choice(['racine', 'inverse', 'carre'])
  const k = randint(1, 4)
  if (sorte === 'racine') {
    const [s1, s2] = choice([
      [1, 2],
      [1, 3],
      [2, 3],
    ])
    const coef = frac(2 * k)
    const valeur = coefDiffExp(coef, frac(s2), frac(s1))
    return {
      integrande: `\\dfrac{${rienSi1(k)}${E}^{\\sqrt{x}}}{\\sqrt{x}}`,
      a: String(s1 * s1),
      b: String(s2 * s2),
      texte: `On pose $u(x)=\\sqrt{x}$ ; alors $u'(x)=\\dfrac{1}{2\\sqrt{x}}$ et la fonction à intégrer s'écrit $${2 * k}u'(x)${E}^{u(x)}$. Une primitive de $u'${E}^{u}$ est $${E}^{u}$.`,
      lignes: [
        `\\left[${2 * k}${E}^{\\sqrt{x}}\\right]_{${s1 * s1}}^{${s2 * s2}}`,
        facteur(2 * k, `${E}^{\\sqrt{${s2 * s2}}}-${E}^{\\sqrt{${s1 * s1}}}`),
        valeur,
      ],
      valeur,
    }
  }
  if (sorte === 'inverse') {
    // Bornes 1/2, 1 et 2 : 1/x vaut 2, 1 et 1/2.
    const [b1, b2] = choice([
      [frac(1, 2), frac(1)],
      [frac(1), frac(2)],
      [frac(1, 2), frac(2)],
    ])
    const [i1, i2] = [frac(b1.den, b1.num), frac(b2.den, b2.num)]
    const coef = frac(-k)
    const valeur = coefDiffExp(coef, i2, i1)
    const borne = (q: FractionEtendue) =>
      q.den === 1 ? String(q.num) : borneFrac(String(q.num), q.den)
    return {
      integrande: `\\dfrac{${rienSi1(k)}${E}^{1/x}}{x^2}`,
      a: borne(b1),
      b: borne(b2),
      texte: `On pose $u(x)=\\dfrac{1}{x}$ ; alors $u'(x)=-\\dfrac{1}{x^2}$ et la fonction à intégrer s'écrit $${rienSi1(-k)}u'(x)${E}^{u(x)}$. Une primitive de $u'${E}^{u}$ est $${E}^{u}$.`,
      lignes: [
        `\\left[${rienSi1(-k)}${E}^{1/x}\\right]_{${borne(b1)}}^{${borne(b2)}}`,
        facteur(-k, `${expTex(i2)}-${expTex(i1)}`),
        valeur,
      ],
      valeur,
    }
  }
  const signe = choice([1, -1])
  const [x1, x2] = choice([
    [0, 1],
    [0, 2],
    [1, 2],
  ])
  const coef = frac(signe * k, 2)
  const carre = `${signe < 0 ? '-' : ''}x^{2}`
  const valeur = coefDiffExp(coef, frac(signe * x2 * x2), frac(signe * x1 * x1))
  return {
    integrande: `${rienSi1(k)}x${E}^{${carre}}`,
    a: String(x1),
    b: String(x2),
    texte: `On pose $u(x)=${carre}$ ; alors $u'(x)=${signe * 2}x$ et la fonction à intégrer s'écrit $${rienSi1(coef)}u'(x)${E}^{u(x)}$. Une primitive de $u'${E}^{u}$ est $${E}^{u}$.`,
    lignes: [
      `\\left[${rienSi1(coef)}${E}^{${carre}}\\right]_{${x1}}^{${x2}}`,
      facteur(
        coef,
        `${expTex(frac(signe * x2 * x2))}-${expTex(frac(signe * x1 * x1))}`,
      ),
      valeur,
    ],
    valeur,
  }
}

/** Valeurs remarquables : angle (multiple de π), sinus, cosinus et leurs inverses. */
type Angle = {
  angle: FractionEtendue
  sin: string
  cos: string
  invSin?: Radical
  invSin2?: Radical
  invCos?: Radical
  invCos2?: Radical
  /** cos sous forme rationnelle, pour u = c ± cos. */
  cosQ?: FractionEtendue
}

const angles: Record<string, Angle> = {
  zero: {
    angle: frac(0),
    sin: '0',
    cos: '1',
    invCos: radical(frac(1)),
    invCos2: radical(frac(1)),
    cosQ: frac(1),
  },
  pi6: {
    angle: frac(1, 6),
    sin: '\\dfrac{1}{2}',
    cos: '\\dfrac{\\sqrt{3}}{2}',
    invSin: radical(frac(2)),
    invSin2: radical(frac(4)),
    invCos: radical(frac(2, 3), 3),
    invCos2: radical(frac(4, 3)),
  },
  pi4: {
    angle: frac(1, 4),
    sin: '\\dfrac{\\sqrt{2}}{2}',
    cos: '\\dfrac{\\sqrt{2}}{2}',
    invSin: radical(frac(1), 2),
    invSin2: radical(frac(2)),
    invCos: radical(frac(1), 2),
    invCos2: radical(frac(2)),
  },
  pi3: {
    angle: frac(1, 3),
    sin: '\\dfrac{\\sqrt{3}}{2}',
    cos: '\\dfrac{1}{2}',
    invSin: radical(frac(2, 3), 3),
    invSin2: radical(frac(4, 3)),
    invCos: radical(frac(2)),
    invCos2: radical(frac(4)),
    cosQ: frac(1, 2),
  },
  pi2: {
    angle: frac(1, 2),
    sin: '1',
    cos: '0',
    invSin: radical(frac(1)),
    invSin2: radical(frac(1)),
    cosQ: frac(0),
  },
  deuxPi3: {
    angle: frac(2, 3),
    sin: '\\dfrac{\\sqrt{3}}{2}',
    cos: '-\\dfrac{1}{2}',
    cosQ: frac(-1, 2),
  },
}

/** Argument d'une fonction trigonométrique : « (0) », « \left(\dfrac{\pi}{6}\right) ». */
const argument = (t: Angle) =>
  t.angle.num === 0 ? '(0)' : `\\left(${piTex(t.angle, '\\dfrac')}\\right)`

/** Deux angles distincts, dans l'ordre, tirés dans une liste ordonnée. */
function deuxAngles(noms: string[]): [Angle, Angle] {
  const [i, j] = shuffle(noms.map((_, k) => k))
    .slice(0, 2)
    .sort((p, q) => p - q)
  return [angles[noms[i]], angles[noms[j]]]
}

/** k cos/sinⁿ, k sin/cosⁿ (n = 2 ou 3) ou k sin/(c ± cos). */
function tirerTrigo(): Tirage {
  const sorte = choice(['sinPuissance', 'cosPuissance', 'ln'])
  const k = randint(1, 4)
  if (sorte === 'ln') {
    for (;;) {
      const c = randint(1, 3)
      const eps = choice([1, -1])
      const [A, B] = deuxAngles(['zero', 'pi3', 'pi2', 'deuxPi3'])
      const uQ = (t: Angle) =>
        frac(c).sommeFraction((t.cosQ as FractionEtendue).multiplieEntier(eps))
      const [uA, uB] = [uQ(A), uQ(B)]
      if (uA.num === 0 || uB.num === 0) continue
      const u = `${c}${eps > 0 ? '+' : '-'}\\cos(x)`
      // u' = -ε sin, donc l'intégrande vaut -εk u'/u.
      const coef = frac(-eps * k)
      const [a, b] = [piTex(A.angle), piTex(B.angle)]
      const valeur = coefLn(coef, uB.diviseFraction(uA).simplifie())
      // c ≥ 2 : u ≥ c - 1 > 0. c = 1 : l'intervalle évite le zéro de u, et u ≥ 1/2.
      const positivite =
        c >= 2
          ? `Comme $\\cos(x)${eps > 0 ? '\\geqslant-1' : '\\leqslant1'}$, $u(x)\\geqslant${c - 1}>0$ et $|u(x)|=u(x)$.`
          : `Sur $\\left[${a};${b}\\right]$, $\\cos(x)${eps > 0 ? '\\geqslant-\\dfrac{1}{2}' : '\\leqslant\\dfrac{1}{2}'}$, donc $u(x)\\geqslant\\dfrac{1}{2}>0$ et $|u(x)|=u(x)$.`
      return {
        integrande: `\\dfrac{${rienSi1(k)}\\sin(x)}{${u}}`,
        a,
        b,
        texte:
          `On pose $u(x)=${u}$ ; alors $u'(x)=${eps > 0 ? '-' : ''}\\sin(x)$ et la fonction à intégrer s'écrit $${coefDevantFraction(coef)}\\dfrac{u'(x)}{u(x)}$. Une primitive de $\\dfrac{u'}{u}$ est $\\ln|u|$. ` +
          `${positivite} ` +
          `On utilise $\\cos${argument(A)}=${A.cos}$ et $\\cos${argument(B)}=${B.cos}$.`,
        lignes: [
          `${rienSi1(coef)}\\left[\\ln(${u})\\right]_{${a}}^{${b}}`,
          facteur(coef, `${lnTex(uB)}-${lnTex(uA)}`),
          valeur,
        ],
        valeur,
      }
    }
  }
  const n = choice([2, 3])
  const sinus = sorte === 'sinPuissance'
  const [A, B] = sinus
    ? deuxAngles(['pi6', 'pi4', 'pi3', 'pi2'])
    : deuxAngles(['zero', 'pi6', 'pi4', 'pi3'])
  const [a, b] = [piTex(A.angle), piTex(B.angle)]
  const [fct, autre] = sinus ? ['\\sin', '\\cos'] : ['\\cos', '\\sin']
  const inv = (t: Angle) =>
    (sinus
      ? n === 2
        ? t.invSin
        : t.invSin2
      : n === 2
        ? t.invCos
        : t.invCos2) as Radical
  // cos/sinⁿ : primitive -1/((n-1)sinⁿ⁻¹) ; sin/cosⁿ : primitive 1/((n-1)cosⁿ⁻¹).
  const coef = frac(sinus ? -k : k, n - 1)
  const valeur = radicalTex(
    combinaison([
      [coef, inv(B)],
      [coef.oppose(), inv(A)],
    ]),
  )
  const puissance = n === 2 ? `${fct}(x)` : `${fct}^{2}(x)`
  const valeursTrigo = `On utilise $${fct}${argument(A)}=${sinus ? A.sin : A.cos}$ et $${fct}${argument(B)}=${sinus ? B.sin : B.cos}$.`
  return {
    integrande: `\\dfrac{${rienSi1(k)}${autre}(x)}{${fct}^{${n}}(x)}`,
    a,
    b,
    texte:
      `On pose $u(x)=${fct}(x)$ ; alors $u'(x)=${sinus ? '' : '-'}${autre}(x)$ et la fonction à intégrer s'écrit $${rienSi1(sinus ? k : -k)}u'(x)u(x)^{-${n}}$. ` +
      `Une primitive de $u'u^{-${n}}$ est $${n === 2 ? '-\\dfrac{1}{u}' : '-\\dfrac{1}{2u^{2}}'}$. ${valeursTrigo}`,
    lignes: [
      `\\left[${coef.num < 0 ? '-' : ''}\\dfrac{${Math.abs(coef.num)}}{${coef.den === 1 ? '' : coef.den}${puissance}}\\right]_{${a}}^{${b}}`,
      facteur(
        coef,
        `${radicalTex(inv(B))}-${radicalTex(inv(A)).startsWith('-') ? `(${radicalTex(inv(A))})` : radicalTex(inv(A))}`,
      ),
      valeur,
    ],
    valeur,
  }
}

const tirages: Record<Forme, () => Tirage> = {
  quotientExp: tirerQuotientExp,
  division: tirerDivision,
  lnSurX: tirerLnSurX,
  expCompose: tirerExpCompose,
  trigo: tirerTrigo,
}

/** @author Nathan Scheinmann */
export default class IntegralesFormes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 2
    this.comment =
      "La forme n'est pas annoncée : l'élève doit la reconnaître.<br>" +
      "u'/u avec u = exp(ax) + c : bornes 0 et ln(r) (u peut alors être négative, avec exp(ax) - c) ou 0 et 1.<br>" +
      "Degré 3 sur degré 1 : division euclidienne, puis un logarithme ; l'intervalle est d'un côté ou de l'autre du pôle.<br>" +
      'Avec ln(x) et 1/x : (a + b ln(x))ⁿ/x ou k/(x(a + b ln(x))), entre 1, e et e².<br>' +
      "u' exp(u) : exp(√x)/√x, exp(1/x)/x² ou x exp(±x²).<br>" +
      'Avec sinus et cosinus : cos/sinⁿ, sin/cosⁿ (n = 2 ou 3) ou sin/(c ± cos), aux angles remarquables. ' +
      "L'exercice 4mInt-6 travaille ces puissances plus systématiquement."
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
    ) as Forme[]
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const t = tirages[formes[i]]()
      if (!this.questionJamaisPosee(i, t.integrande, t.a, t.b)) continue
      const integrale = `\\int_{${t.a}}^{${t.b}}${t.integrande}\\,\\mathrm{d}x`
      let texte = `Calculer la valeur exacte de $I=\\displaystyle${integrale}$.`
      if (this.interactif)
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFonctionsTerminales,
            { texteAvant: '$I=$' },
          )
      handleAnswers(this, i, {
        reponse: { value: t.valeur, compare: seq([noDecimal(), isEqual()]) },
      })
      const lignes = t.lignes.map((ligne, k) =>
        k === t.lignes.length - 1 ? `${miseEnEvidence(ligne)}.` : ligne,
      )
      const calcul = `\\begin{aligned}I&=${lignes.join('\\\\&=')}\\end{aligned}`
      this.listeQuestions[i] = texte
      // En Typst, un aligned en ligne n'aligne pas sa première ligne : mode affiché.
      this.listeCorrections[i] =
        t.texte + (context.isTypst ? `$$${calcul}$$` : `<br>$${calcul}$`)
      i++
    }
    listeQuestionsToContenu(this)
  }
}
