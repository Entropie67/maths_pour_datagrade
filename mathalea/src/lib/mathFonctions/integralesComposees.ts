import type { FormulaireComplexe } from '../formulaireComplexe'
import { KeyboardType } from '../interactif/claviers/keyboard'
import { choice } from '../outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../outils/ecritures'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { Polynome } from './Polynome'

/**
 * Fonctions de la forme λu'(x)u(x)^r partagées par les exercices d'intégrales
 * et de primitives de fonctions composées (4mInt-2, 4mInt-4, 4mInt-6).
 * @author Nathan Scheinmann
 */

type ChampFormulaire = FormulaireComplexe['champs'][number]

export const champFamillesComposees: ChampFormulaire = {
  type: 'listePonderee',
  nom: 'familles',
  label: 'Fonction intérieure',
  items: [
    { nom: 'affine', label: 'Affine' },
    { nom: 'polynome', label: 'Polynôme de degré 2 à 4' },
    { nom: 'sin', label: 'Sinus' },
    { nom: 'cos', label: 'Cosinus' },
    { nom: 'somme', label: 'Somme sinus-cosinus' },
    { nom: 'racineAffine', label: 'Inverse de racine : affine' },
    { nom: 'racineMonome', label: 'Inverse de racine : xⁿ + c' },
    { nom: 'racineTrinome', label: 'Inverse de racine : trinôme' },
  ],
}

export const champExposantsComposes: ChampFormulaire = {
  type: 'listePonderee',
  nom: 'exposants',
  label: 'Exposants (hors inverses de racines)',
  items: [
    { nom: 'positifs', label: 'Entiers positifs' },
    { nom: 'negatifs', label: 'Entiers négatifs' },
    { nom: 'fractions', label: 'Fractionnaires' },
  ],
}

type Genre = 'affine' | 'monome' | 'trinome'
type Candidat = { coeffs: number[]; a: number; b: number }

const valeurEn = (coeffs: number[], x: number) =>
  coeffs.reduce((somme, c, j) => somme + c * x ** j, 0)

/** Racine den-ième entière de v, ou undefined si v n'est pas une puissance den-ième. */
function racineEntiere(v: number, den: number) {
  const r = Math.round(v ** (1 / den))
  return v >= 1 && r ** den === v ? r : undefined
}

/**
 * Écrit coef·base^p avec des racines plutôt qu'un exposant fractionnaire :
 * √x, √((7x+4)³), ∛(x²), 2/√x, -1/(2(x²+2)²)… `base` est le LaTeX de la base.
 */
export function texPuissanceEnRacine(
  coef: FractionEtendue,
  base: string,
  p: FractionEtendue,
): string {
  const exposant = p.simplifie()
  const n = Math.abs(exposant.num)
  const d = Math.abs(exposant.den)
  const simple = /^[a-z]$/.test(base)
  const entreParentheses = simple ? base : `\\left(${base}\\right)`
  const puissance = n === 1 ? entreParentheses : `${entreParentheses}^{${n}}`
  const facteur =
    d === 1
      ? puissance
      : `${d === 2 ? '\\sqrt' : `\\sqrt[${d}]`}{${n === 1 ? base : puissance}}`
  const c = coef.simplifie()
  if (exposant.valeurDecimale > 0) return `${c.texFractionSaufUn}${facteur}`
  // Exposant négatif : la puissance passe au dénominateur.
  const denominateur = Math.abs(c.den)
  // Seule au dénominateur, la base u n'a pas besoin de parenthèses : 1/(x²+1).
  const facteurDenominateur =
    d === 1 && n === 1 && denominateur === 1 ? base : facteur
  return `${c.valeurDecimale < 0 ? '-' : ''}\\dfrac{${Math.abs(c.num)}}{${denominateur === 1 ? '' : denominateur}${facteurDenominateur}}`
}

/**
 * Liste les polynômes u et les bornes pour lesquels u > 0 sur [a ; b] et u(a),
 * u(b) sont deux valeurs distinctes acceptées par `estValide` : avec des
 * puissances den-ièmes, l'intégrale de u' u^(num/den) reste rationnelle.
 */
function chercherCandidats(
  estValide: (v: number) => boolean,
): Record<Genre, Candidat[]> {
  const bornesValides = (coeffs: number[], a: number, b: number) => {
    const va = valeurEn(coeffs, a)
    const vb = valeurEn(coeffs, b)
    return va !== vb && estValide(va) && estValide(vb)
  }
  const affine: Candidat[] = []
  for (let k = 1; k <= 9; k++)
    for (let a = -3; a <= 3; a++)
      for (let b = a + 2; b <= a + 4; b++)
        for (let c = -30; c <= 30; c++)
          // u(x) = x n'a pas d'intérêt comme fonction intérieure.
          if (!(k === 1 && c === 0) && bornesValides([c, k], a, b))
            affine.push({ coeffs: [c, k], a, b })
  const monome: Candidat[] = []
  for (let n = 2; n <= 4; n++)
    for (let a = 0; a <= 2; a++)
      for (let b = a + 2; b <= a + 4; b++)
        for (let c = 1; c <= 30; c++) {
          const coeffs = [c, ...Array<number>(n - 1).fill(0), 1]
          if (bornesValides(coeffs, a, b)) monome.push({ coeffs, a, b })
        }
  const trinome: Candidat[] = []
  for (let p = -4; p <= 4; p++)
    for (let q = 1; q <= 30; q++) {
      if (p === 0 || p * p >= 4 * q) continue
      for (let a = -3; a <= 2; a++)
        for (let b = a + 2; b <= a + 4; b++)
          if (bornesValides([q, p, 1], a, b))
            trinome.push({ coeffs: [q, p, 1], a, b })
    }
  return { affine, monome, trinome }
}

const CANDIDATS_RACINE = chercherCandidats(
  (v) => v <= 49 && racineEntiere(v, 2) !== undefined,
)
const CANDIDATS_PUISSANCE: Record<number, Record<Genre, Candidat[]>> = {
  1: chercherCandidats((v) => v >= 1 && v <= 6),
  2: chercherCandidats((v) => v <= 25 && racineEntiere(v, 2) !== undefined),
  3: chercherCandidats((v) => v <= 27 && racineEntiere(v, 3) !== undefined),
}

const genreDe = (coeffs: number[]): Genre =>
  coeffs.length === 2 ? 'affine' : coeffs[1] === 0 ? 'monome' : 'trinome'

/** Choisit un numérateur proportionnel à u' : λu'(x), avec λ simple. */
function numerateurDe(coeffs: number[], derivee: string) {
  const genre = genreDe(coeffs)
  if (genre === 'affine') {
    const m = choice([1, coeffs[1]])
    return {
      numerateur: String(m),
      lambda: new FractionEtendue(m, coeffs[1]).simplifie(),
    }
  }
  if (genre === 'monome') {
    const n = coeffs.length - 1
    const m = choice([1, n])
    return {
      numerateur: `${m === 1 ? '' : m}x${n === 2 ? '' : `^{${n - 1}}`}`,
      lambda: new FractionEtendue(m, n).simplifie(),
    }
  }
  const p = coeffs[1]
  const moitie = p % 2 === 0 && choice([false, true])
  return {
    numerateur: moitie ? reduireAxPlusB(1, p / 2) : derivee,
    lambda: new FractionEtendue(1, moitie ? 2 : 1),
  }
}

function positiviteDe(coeffs: number[], a: number, b: number) {
  const genre = genreDe(coeffs)
  if (genre === 'affine')
    return `La fonction $u$ est croissante et $u(${a})=${valeurEn(coeffs, a)}$, d'où $u(x)\\geq ${valeurEn(coeffs, a)}>0$ sur $\\left[${a};${b}\\right]$`
  if (genre === 'monome')
    return `Pour $x\\in[${a};${b}]$, $x^{${coeffs.length - 1}}\\geq 0$, d'où $u(x)\\geq ${coeffs[0]}>0$`
  const p = coeffs[1]
  const reste = new FractionEtendue(4 * coeffs[0] - p * p, 4).simplifie()
  return `Pour tout réel $x$, $u(x)=\\left(${reduireAxPlusB(1, new FractionEtendue(p, 2).simplifie())}\\right)^2+${reste.texFractionSimplifiee}$, d'où $u(x)>0$`
}

/** Fenêtre d'échantillonnage utilisée quand l'intervalle annoncé est ℝ. */
const FENETRE_R: [number, number] = [-3, 3]

/** Fenêtre d'échantillonnage finie incluse dans ]borne ; +∞[, sans l'extrémité ouverte. */
const fenetreApres = (borne: number): [number, number] => [
  borne + 0.01,
  borne + 10,
]

/**
 * Plus grand intervalle usuel sur lequel λu'u^r est définie, avec la phrase
 * justifiant u > 0 (inutile pour un exposant entier positif) et la fenêtre
 * d'échantillonnage correspondante pour la validation des réponses.
 */
function domaineDe(coeffs: number[], uTex: string, num: number, den: number) {
  if (den === 1 && num > 0)
    return {
      domaineTex: '\\mathbb{R}',
      positivite: '',
      echantillonnage: FENETRE_R,
    }
  const genre = genreDe(coeffs)
  if (genre === 'affine') {
    const borne = new FractionEtendue(-coeffs[0], coeffs[1]).simplifie()
      .texFractionSimplifiee
    return {
      domaineTex: `\\left]${borne};+\\infty\\right[`,
      positivite: `Pour $x>${borne}$, $u(x)=${uTex}>0$`,
      echantillonnage: fenetreApres(-coeffs[0] / coeffs[1]),
    }
  }
  if (genre === 'monome') {
    const n = coeffs.length - 1
    const c = coeffs[0]
    if (n % 2 === 0)
      return {
        domaineTex: '\\mathbb{R}',
        positivite: `Pour tout réel $x$, $x^{${n}}\\geq 0$, d'où $u(x)\\geq ${c}>0$`,
        echantillonnage: FENETRE_R,
      }
    const racine = racineEntiere(c, n)
    const borne = racine === undefined ? `-\\sqrt[${n}]{${c}}` : `-${racine}`
    return {
      domaineTex: `\\left]${borne};+\\infty\\right[`,
      positivite: `Pour $x>${borne}$, $x^{${n}}>-${c}$, d'où $u(x)>0$`,
      echantillonnage: fenetreApres(-(c ** (1 / n))),
    }
  }
  return {
    domaineTex: '\\mathbb{R}',
    positivite: positiviteDe(coeffs, 0, 0),
    echantillonnage: FENETRE_R,
  }
}

/** Écrit λu'(x)u(x)^(num/den) sous une forme usuelle (racines, quotients). */
function integrandeDe(
  numerateur: string,
  uTex: string,
  num: number,
  den: number,
) {
  const base = `\\left(${uTex}\\right)`
  const absNum = Math.abs(num)
  const puissance =
    den === 1
      ? absNum === 1
        ? base
        : `${base}^{${absNum}}`
      : `${den === 2 ? '\\sqrt' : `\\sqrt[${den}]`}{${absNum === 1 ? uTex : `${base}^{${absNum}}`}}`
  if (num < 0) return `\\dfrac{${numerateur}}{${puissance}}`
  const facteur =
    numerateur === '1'
      ? ''
      : /.[+-]/.test(numerateur)
        ? `\\left(${numerateur}\\right)`
        : numerateur
  return `${facteur}${puissance}`
}

const FRACTIONS = [
  [1, 2],
  [1, 3],
  [2, 3],
  [-1, 2],
  [-2, 3],
  [-3, 2],
]

export type FonctionComposee = {
  famille: string
  integrande: string
  uTex: string
  derivee: string
  /** Numérateur proportionnel à u', absent pour les familles trigonométriques. */
  numerateur?: string
  lambda: FractionEtendue
  num: number
  den: number
  /** Bornes d'un intervalle où u(a) et u(b) sont des puissances den-ièmes. */
  a: number | string
  b: number | string
  ua: number
  ub: number
  positiviteBornes: string
  /** Intervalle de définition proposé pour les primitives, et justification de u > 0. */
  domaineTex: string
  positiviteDomaine: string
  /** Fenêtre finie incluse dans l'intervalle annoncé, pour valider les primitives saisies. */
  echantillonnage: [number, number]
}

/** Tire une fonction λu'(x)u(x)^r de la famille et du type d'exposant donnés. */
export function tirerFonctionComposee(
  famille: string,
  typeExposant: string,
): FonctionComposee {
  if (
    famille === 'affine' ||
    famille === 'polynome' ||
    famille.startsWith('racine')
  ) {
    let num: number
    let den: number
    let candidats: Candidat[]
    if (famille.startsWith('racine')) {
      num = -1
      den = 2
      const genre = (
        {
          racineAffine: 'affine',
          racineMonome: 'monome',
          racineTrinome: 'trinome',
        } as Record<string, Genre>
      )[famille]
      candidats = CANDIDATS_RACINE[genre]
    } else {
      const genres: Genre[] =
        famille === 'affine' ? ['affine'] : ['monome', 'trinome']
      const disponibles = (d: number) =>
        genres.filter((g) => CANDIDATS_PUISSANCE[d][g].length > 0)
      ;[num, den] =
        typeExposant === 'fractions'
          ? choice(FRACTIONS.filter(([, d]) => disponibles(d).length > 0))
          : // Exposants entiers limités à ±3 : au-delà, les réponses deviennent illisibles.
            [typeExposant === 'negatifs' ? -randint(2, 3) : randint(2, 3), 1]
      candidats = CANDIDATS_PUISSANCE[den][choice(disponibles(den))]
    }
    const candidat = choice(candidats)
    const polynome = new Polynome({ coeffs: candidat.coeffs })
    const uTex = polynome.toLatex()
    const derivee = polynome.derivee().toLatex()
    const { numerateur, lambda } = numerateurDe(candidat.coeffs, derivee)
    const domaine = domaineDe(candidat.coeffs, uTex, num, den)
    return {
      famille,
      integrande: integrandeDe(numerateur, uTex, num, den),
      uTex,
      derivee,
      numerateur,
      lambda,
      num,
      den,
      a: candidat.a,
      b: candidat.b,
      ua: valeurEn(candidat.coeffs, candidat.a),
      ub: valeurEn(candidat.coeffs, candidat.b),
      positiviteBornes: positiviteDe(candidat.coeffs, candidat.a, candidat.b),
      domaineTex: domaine.domaineTex,
      positiviteDomaine: domaine.positivite,
      echantillonnage: domaine.echantillonnage,
    }
  }
  const [num, den] =
    typeExposant === 'fractions'
      ? choice(FRACTIONS)
      : [typeExposant === 'negatifs' ? -randint(2, 3) : randint(2, 3), 1]
  // Facteur ±1 devant u' u^r.
  const k = choice([-1, 1])
  // u varie de 1 à 2^den : ses puissances r + 1 aux bornes restent rationnelles.
  const haut = 2 ** den
  const ecart = haut - 1
  // Argument x ou 2x, sur [0 ; π/2] ou [0 ; π/4] (sin, cos) et [0 ; π] ou [0 ; π/2] (somme).
  const w = choice([1, 2])
  const argument = w === 1 ? 'x' : '2x'
  const a = '0'
  const b =
    famille === 'somme'
      ? w === 1
        ? '\\pi'
        : '\\dfrac{\\pi}{2}'
      : w === 1
        ? '\\dfrac{\\pi}{2}'
        : '\\dfrac{\\pi}{4}'
  const sin = `\\sin\\left(${argument}\\right)`
  const cos = `\\cos\\left(${argument}\\right)`
  const facteurDerivee = new FractionEtendue(
    (famille === 'cos' ? -ecart : ecart) * w,
    famille === 'somme' ? 2 : 1,
  ).simplifie()
  const amplitude = new FractionEtendue(ecart, 2).texFractionSaufUn
  const coefDerivee = new FractionEtendue(
    Math.abs(facteurDerivee.num),
    Math.abs(facteurDerivee.den),
  ).texFractionSaufUn
  let u: string
  let partieDerivee: string
  if (famille === 'sin') {
    u = `1+${ecart === 1 ? '' : ecart}${sin}`
    partieDerivee = cos
  } else if (famille === 'cos') {
    u = `1+${ecart === 1 ? '' : ecart}${cos}`
    partieDerivee = sin
  } else {
    u = `1+${amplitude}\\left(1+${sin}+${cos}\\right)`
    partieDerivee = `${cos}-${sin}`
  }
  // cos - sin n'est parenthésé que s'il est multiplié par un coefficient ou une puissance.
  const produit = (coefficient: string, toujours = false) =>
    famille === 'somme' && (toujours || coefficient !== '')
      ? `${coefficient}\\left(${partieDerivee}\\right)`
      : `${coefficient}${partieDerivee}`
  const derivee = produit(
    `${facteurDerivee.valeurDecimale < 0 ? '-' : ''}${coefDerivee}`,
  )
  const croissante = famille === 'sin'
  const intervalle = `\\left[0;${b}\\right]`
  const positivite =
    famille === 'somme'
      ? `Pour $x\\in${intervalle}$, ${w === 1 ? '' : '$2x\\in[0;\\pi]$, donc '}$1+${sin}+${cos}=1+\\sqrt{2}\\sin\\left(${argument}+\\dfrac{\\pi}{4}\\right)\\geq 1-\\sqrt{2}\\times\\dfrac{\\sqrt{2}}{2}=0$, d'où $u(x)\\geq 1$`
      : `Pour $x\\in${intervalle}$, ${w === 1 ? '' : `$2x\\in\\left[0;\\dfrac{\\pi}{2}\\right]$, donc `}$${famille === 'sin' ? sin : cos}\\geq 0$, d'où $u(x)\\geq 1$`
  const facteur = facteurDerivee.multiplieEntier(k).simplifie()
  const facteurNumerateur = new FractionEtendue(facteur.num, 1)
    .texFractionSaufUn
  // Puissance |num|/den de u, sans facteur devant.
  const puissance = integrandeDe('1', u, Math.abs(num), den)
  const entierPositif = den === 1 && num > 0
  return {
    famille,
    integrande:
      num < 0
        ? `\\dfrac{${produit(facteurNumerateur)}}{${facteur.den === 1 ? '' : facteur.den}${puissance}}`
        : `${produit(facteur.texFractionSaufUn, true)}${puissance}`,
    uTex: u,
    derivee,
    lambda: new FractionEtendue(k, 1),
    num,
    den,
    a,
    b,
    ua: croissante ? 1 : haut,
    ub: croissante ? haut : 1,
    positiviteBornes: positivite,
    domaineTex: entierPositif ? '\\mathbb{R}' : intervalle,
    positiviteDomaine: entierPositif ? '' : positivite,
    echantillonnage: entierPositif
      ? [-2 * Math.PI, 2 * Math.PI]
      : [0, famille === 'somme' ? Math.PI / w : Math.PI / (2 * w)],
  }
}

/**
 * Partie commune des corrections : l'expression vaut λu'(x)u(x)^r, donc
 * F = λ/(r+1)·u^(r+1) en est une primitive sur l'intervalle `sur`.
 * Renvoie aussi les outils pour évaluer F en un point où u est une puissance den-ième.
 */
export function analysePuissance(
  fonction: FonctionComposee,
  {
    sur,
    positivite,
    nom = 'integrande',
  }: { sur: string; positivite: string; nom?: 'integrande' | 'f' },
) {
  const { uTex, derivee, numerateur, lambda, num, den } = fonction
  const r = new FractionEtendue(num, den)
  const suivant = r.sommeFraction(new FractionEtendue(1, 1)).simplifie()
  const alpha = lambda.diviseFraction(suivant).simplifie()
  const racineCarree = suivant.num === 1 && suivant.den === 2
  // Exposants en \frac : un \dfrac en exposant est illisible.
  const exposant = r.toLatex('frac')
  const exposantPrimitive = suivant.toLatex('frac')
  const puissanceTex = (v: string) =>
    racineCarree ? `\\sqrt{${v}}` : `\\left(${v}\\right)^{${exposantPrimitive}}`
  const valeurTex = (v: number) =>
    racineCarree ? `\\sqrt{${v}}` : `${v}^{${exposantPrimitive}}`
  /** u^(r+1) pour une puissance den-ième v. */
  const valeur = (v: number) => {
    const racine = racineEntiere(v, den) ?? 1
    const e = num + den
    return e >= 0
      ? new FractionEtendue(racine ** e, 1)
      : new FractionEtendue(1, racine ** -e)
  }
  const avecAlpha = (expression: string) =>
    alpha.valeurDecimale === 1
      ? expression
      : `${alpha.texFractionSaufUn}\\left(${expression}\\right)`
  // La primitive finale s'écrit avec des racines, comme on la rédige à la main.
  const primitive = texPuissanceEnRacine(alpha, uTex, suivant)
  const deriveeProduit = /.[+-]/.test(derivee)
    ? `\\left(${derivee}\\right)`
    : derivee
  const sujet =
    nom === 'f'
      ? {
          debut: '$f(x)$',
          milieu: '$f(x)$',
          objet: '$f(x)$',
          complement: 'de $f$',
        }
      : {
          debut: "L'intégrande",
          milieu: "l'intégrande",
          objet: "l'intégrande",
          complement: "de l'intégrande",
        }
  const facteurExposant = ecritureParentheseSiNegatif(suivant)
  // Identification de α : α × (r + 1) = λ.
  const quotientAlpha = `\\dfrac{${lambda.texFSD}}{${suivant.toLatex('frac')}}`
  const identification =
    lambda.den !== 1
      ? alpha.texFSD
      : quotientAlpha === alpha.texFSD
        ? quotientAlpha
        : `${quotientAlpha}=${alpha.texFSD}`
  const texte =
    `On pose $u(x)=${uTex}$, donc $u'(x)=${derivee}$.` +
    ((den === 1 && num > 0) || positivite === ''
      ? ''
      : ` ${positivite}${den === 1 ? `, donc $u$ ne s'annule pas sur $${sur}$.` : racineCarree ? `, donc $\\sqrt{u(x)}$ est bien définie et non nulle sur $${sur}$.` : `, donc $u(x)^{${exposant}}$ est bien définie sur $${sur}$.`}`) +
    '<br>' +
    (numerateur !== undefined && lambda.valeurDecimale !== 1
      ? `Comme $${numerateur}=${lambda.texFractionSimplifiee}\\times ${deriveeProduit}$, ${sujet.milieu}`
      : sujet.debut) +
    ` s'écrit $${lambda.texFractionSaufUn}u'(x)u(x)^{${exposant}}$. On cherche une primitive sous la forme $F(x)=\\alpha u(x)^{${exposantPrimitive}}=\\alpha ${puissanceTex(uTex)}$, où $\\alpha$ est une constante à déterminer.<br>` +
    `En dérivant cette fonction composée, on obtient $F'(x)=\\alpha\\times${facteurExposant}\\times u'(x)u(x)^{${exposant}}$.<br>` +
    `Pour retrouver ${sujet.objet}, on identifie les coefficients : $\\alpha\\times${facteurExposant}=${lambda.texFSD}\\iff\\alpha=${identification}$.<br>` +
    `Avec cette valeur de $\\alpha$, $F'(x)$ est bien égal à ${sujet.objet}. La fonction $F(x)=${primitive}$ est donc une primitive ${sujet.complement} sur l'intervalle $${sur}$.`
  return { texte, primitive, alpha, valeur, valeurTex, avecAlpha }
}

/**
 * Clavier adapté à la saisie d'une primitive : racines, puissances et parenthèses,
 * avec les touches sin et cos en plus pour les familles trigonométriques.
 */
export function clavierFonctionComposee(famille: string) {
  return ['sin', 'cos', 'somme'].includes(famille)
    ? KeyboardType.clavierFonctionsTerminalesTrigo
    : KeyboardType.clavierFonctionsTerminales
}
