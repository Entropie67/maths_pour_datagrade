import {
    lireFormulaireComplexe,
    repartitionPonderee,
    serialiseFormulaireComplexe,
    valeursParDefaut,
    type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { sameSet, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../../lib/interactif/createQuestion'
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

export const titre = 'Résoudre une équation en factorisant'
export const dateDePublication = '26/10/2026'
export const uuid = '6357e'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['1mCL4-6'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: "Forme de l'équation",
      items: [
        { nom: 'facteurX', label: 'Facteur x ou x² à mettre en évidence' },
        { nom: 'produit', label: 'Produit de deux identités remarquables' },
        { nom: 'difference', label: 'Différence de deux carrés (degré 4)' },
        { nom: 'groupement', label: 'Facteur commun par groupement (degré 3)' },
      ],
    },
    {
      type: 'selection',
      nom: 'solutions',
      label: 'Solutions',
      options: [
        { valeur: 'entieres', label: 'Entières' },
        { valeur: 'fractions', label: 'Au moins une fractionnaire' },
        { valeur: 'melange', label: 'Mélange' },
      ],
      defaut: 'melange',
    },
  ],
}

const pgcd = (x: number, y: number): number => (y === 0 ? x : pgcd(y, x % y))

/** Facteur ax - b (a > 0), de racine b/a. */
type Lineaire = { a: number; b: number }

/** Trinôme du second degré déjà factorisable : identité remarquable ou somme et produit. */
type Quadratique = {
  dev: Polynome
  facteurs: string
  lineaires: Lineaire[]
  /** « $x^2-9$ avec … », complément de « on factorise ». */
  phrase: string
}

type Tirage = {
  /** Membre de gauche de l'équation ramenée à 0, puis ses écritures successives jusqu'à la forme factorisée. */
  chaine: string[]
  /** Équation de l'énoncé quand son second membre n'est pas 0 (x³ = 9x). */
  equation?: string
  methode: string
  lineaires: Lineaire[]
  /** Facteurs ax² + c (c > 0), qui ne s'annulent pas. */
  positifs: string[]
}

const lin = (l: Lineaire) => reduireAxPlusB(l.a, -l.b)
const racine = (l: Lineaire) => new FractionEtendue(l.b, l.a).simplifie()
const polynome = (coeffs: number[]) => new Polynome({ coeffs })
/** Coefficient supérieur à 20 en valeur absolue : tirage à refaire. */
const tropGrand = (p: Polynome) =>
  p.monomes.some((c) => Math.abs(Number(c)) > 20)
const monome = (k: number, m: number) =>
  `${rienSi1(k)}x${m === 2 ? '^{2}' : ''}`
const identite1 = 'la première identité $A^2+2AB+B^2=(A+B)^2$'
const identite2 = 'la deuxième identité $A^2-2AB+B^2=(A-B)^2$'
const identite3 = 'la troisième identité $A^2-B^2=(A-B)(A+B)$'

/** Produit de facteurs ax - b, éventuellement au carré, avec le facteur x en tête. */
function produit(facteurs: [Lineaire, number][]): string {
  return [...facteurs]
    .sort(([l1], [l2]) => Number(l2.b === 0) - Number(l1.b === 0))
    .map(([l, n]) => {
      const tex = l.b === 0 && l.a === 1 ? 'x' : `(${lin(l)})`
      return n === 2 ? `${tex}^{2}` : tex
    })
    .join('')
}

/** Coefficient devant une parenthèse : +9, -9, +, -. */
const coefParenthese = (k: number) =>
  k === 1 ? '+' : k === -1 ? '-' : ecritureAlgebrique(k)

function carres(): Quadratique {
  const a = choice([1, 1, 2, 3])
  const b = randint(1, 6, a === 1 ? [] : [a, 2 * a, 3 * a])
  if (pgcd(a, b) !== 1) return carres()
  const dev = polynome([-b * b, 0, a * a])
  return {
    dev,
    facteurs: `(${lin({ a, b })})(${lin({ a, b: -b })})`,
    lineaires: [
      { a, b },
      { a, b: -b },
    ],
    phrase: `$${dev.toLatex()}$ avec ${identite3}`,
  }
}

function carreParfait(): Quadratique {
  const a = choice([1, 1, 2, 3])
  const b = randint(-5, 5, [0])
  if (pgcd(a, Math.abs(b)) !== 1) return carreParfait()
  const dev = polynome([b * b, -2 * a * b, a * a])
  if (tropGrand(dev)) return carreParfait()
  const identite = b > 0 ? identite2 : identite1
  return {
    dev,
    facteurs: `(${lin({ a, b })})^{2}`,
    lineaires: [{ a, b }],
    phrase: `$${dev.toLatex()}$ avec ${identite}`,
  }
}

function trinome(): Quadratique {
  const p = randint(-6, 6, [0])
  const q = randint(-6, 6, [0, p, -p])
  const [r1, r2] = p < q ? [p, q] : [q, p]
  const dev = polynome([p * q, -(p + q), 1])
  if (tropGrand(dev)) return trinome()
  return {
    dev,
    facteurs: `(${lin({ a: 1, b: r1 })})(${lin({ a: 1, b: r2 })})`,
    lineaires: [
      { a: 1, b: r1 },
      { a: 1, b: r2 },
    ],
    phrase: `$${dev.toLatex()}$ en cherchant deux nombres de somme $${-(p + q)}$ et de produit $${p * q}$`,
  }
}

/**
 * kx^m(trinôme), donné développé (2x³ - 18x = 0) ou avec le terme de plus haut degré
 * seul dans le membre de gauche (2x³ = 18x), où diviser par x ferait perdre la solution 0.
 */
function tirerFacteurX(seulAGauche: boolean = choice([true, false])): Tirage {
  const m = choice([1, 2])
  const k = choice([1, 1, 2, 3, 5, 6, -1, -2])
  const q = choice([carres, carreParfait, trinome])()
  const dev = q.dev.multiply(polynome(m === 1 ? [0, k] : [0, 0, k]))
  const coeffs = dev.monomes.map(Number)
  if (tropGrand(dev)) return tirerFacteurX(seulAGauche)
  const deg = coeffs.length - 1
  // Seul à gauche si le second membre commence par un terme positif : x⁴ = 5x³ - 6x².
  if (seulAGauche && !(k > 0 && coeffs[deg - 1] < 0)) {
    return tirerFacteurX(seulAGauche)
  }
  const terme = polynome([...Array(deg).fill(0), coeffs[deg]]).toLatex()
  const reste = polynome(coeffs.slice(0, deg).map((c) => -c)).toLatex()
  return {
    chaine: [
      dev.toLatex(),
      `${monome(k, m)}(${q.dev.toLatex()})`,
      `${monome(k, m)}${q.facteurs}`,
    ],
    equation: seulAGauche ? `${terme}=${reste}` : undefined,
    methode: `On met $${monome(k, m)}$ en évidence, puis on factorise ${q.phrase}.`,
    lineaires: [{ a: 1, b: 0 }, ...q.lineaires],
    positifs: [],
  }
}

/**
 * Produit de deux trinômes développés, chacun une identité remarquable : (x²-9)(4x²-4x+1),
 * ou d'une identité remarquable et d'un facteur x² + c qui ne s'annule pas.
 */
function tirerProduit(): Tirage {
  if (choice([true, false])) {
    const q = choice([carres, carreParfait])()
    const positif = `x^{2}+${choice([1, 4, 9, 16])}`
    const [gauche, droite] = choice([true, false])
      ? [`(${q.dev.toLatex()})`, `(${positif})`]
      : [`(${positif})`, `(${q.dev.toLatex()})`]
    const facteurs =
      gauche === `(${positif})`
        ? `(${positif})${q.facteurs}`
        : `${q.facteurs}(${positif})`
    return {
      chaine: [`${gauche}${droite}`, facteurs],
      methode: `On factorise ${q.phrase}.`,
      lineaires: q.lineaires,
      positifs: [positif],
    }
  }
  const [f1, f2] = choice([
    [carres, carres],
    [carres, carreParfait],
    [carreParfait, carres],
  ])
  const q1 = f1()
  const q2 = f2()
  const racines1 = q1.lineaires.map((l) => racine(l).texFractionSimplifiee)
  const communes = q2.lineaires.some((l) =>
    racines1.includes(racine(l).texFractionSimplifiee),
  )
  if (communes || q1.dev.isEqual(q2.dev)) return tirerProduit()
  return {
    chaine: [
      `(${q1.dev.toLatex()})(${q2.dev.toLatex()})`,
      `${q1.facteurs}${q2.facteurs}`,
    ],
    methode: `On factorise ${q1.phrase}, et ${q2.phrase}.`,
    lineaires: [...q1.lineaires, ...q2.lineaires],
    positifs: [],
  }
}

/** a⁴x⁴-b⁴ et (x²-c)²-k², donnés aussi sous la forme A² = B². */
function tirerBicarreOuDecale(): Tirage {
  const egalite = choice([true, false])
  if (choice([true, false])) {
    const [a, b] = choice([
      [1, 2],
      [1, 3],
      [2, 1],
      [2, 3],
    ])
    const a2 = a * a
    const b2 = b * b
    const positif = `${rienSi1(a2)}x^{2}+${b2}`
    return {
      chaine: [
        `${rienSi1(a2 * a2)}x^{4}-${b2 * b2}`,
        `(${rienSi1(a2)}x^{2})^{2}-${b2}^{2}`,
        `(${rienSi1(a2)}x^{2}-${b2})(${positif})`,
        `(${lin({ a, b })})(${lin({ a, b: -b })})(${positif})`,
      ],
      equation: egalite ? `${rienSi1(a2 * a2)}x^{4}=${b2 * b2}` : undefined,
      methode: `On applique deux fois ${identite3}.`,
      lineaires: [
        { a, b },
        { a, b: -b },
      ],
      positifs: [positif],
    }
  }
  // x² vaut u ou v, deux carrés de même parité pour que c et k soient entiers.
  const [u, v] = choice([
    [1, 9],
    [9, 25],
    [4, 16],
  ])
  const c = (u + v) / 2
  const k = (v - u) / 2
  const ru = Math.sqrt(u)
  const rv = Math.sqrt(v)
  return {
    chaine: [
      `(x^{2}-${c})^{2}-${k * k}`,
      `(x^{2}-${c})^{2}-${k}^{2}`,
      `(x^{2}-${c}-${k})(x^{2}-${c}+${k})`,
      `(x^{2}-${v})(x^{2}-${u})`,
      `(x-${rv})(x+${rv})(x-${ru})(x+${ru})`,
    ],
    equation: egalite ? `(x^{2}-${c})^{2}=${k * k}` : undefined,
    methode: `On applique ${identite3} avec $A=x^2-${c}$ et $B=${k}$, puis à nouveau dans chaque facteur.`,
    lineaires: [
      { a: 1, b: rv },
      { a: 1, b: -rv },
      { a: 1, b: ru },
      { a: 1, b: -ru },
    ],
    positifs: [],
  }
}

/** (x²+pq)²-(p+q)²x², avec des racines doubles quand p = q : (x²+1)²-4x². */
function tirerMixte(): Tirage {
  const [p, q] = choice([
    [1, 1],
    [2, 2],
    [3, 3],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 3],
    [2, 5],
    [3, 4],
  ])
  const s = p + q
  const double = p === q
  const facteurs: [Lineaire, number][] = double
    ? [
        [{ a: 1, b: p }, 2],
        [{ a: 1, b: -p }, 2],
      ]
    : [
        [{ a: 1, b: p }, 1],
        [{ a: 1, b: q }, 1],
        [{ a: 1, b: -p }, 1],
        [{ a: 1, b: -q }, 1],
      ]
  return {
    chaine: [
      `(x^{2}+${p * q})^{2}-${s * s}x^{2}`,
      `(x^{2}+${p * q})^{2}-(${s}x)^{2}`,
      `(x^{2}-${s}x+${p * q})(x^{2}+${s}x+${p * q})`,
      produit(facteurs),
    ],
    methode: double
      ? `On applique ${identite3} avec $A=x^2+${p * q}$ et $B=${s}x$, puis ${identite2} et ${identite1}.`
      : `On applique ${identite3} avec $A=x^2+${p * q}$ et $B=${s}x$, puis on factorise chaque trinôme en cherchant deux nombres de produit $${p * q}$ et de somme $${s}$ ou $${-s}$.`,
    lineaires: facteurs.map(([l]) => l),
    positifs: [],
  }
}

/** (x²-p²)²-(x+p)² : après l'identité, le facteur x + p apparaît dans les deux trinômes. */
function tirerCommun(): Tirage {
  const p = choice([1, 2, 3])
  const p2 = p * p
  const t1 = polynome([-(p2 + p), -1, 1])
  const t2 = polynome([-(p2 - p), 1, 1])
  const facteurs: [Lineaire, number][] = [
    [{ a: 1, b: -p }, 2],
    [{ a: 1, b: p + 1 }, 1],
    [{ a: 1, b: p - 1 }, 1],
  ]
  return {
    chaine: [
      `(x^{2}-${p2})^{2}-(x+${p})^{2}`,
      `(x^{2}-${p2}-(x+${p}))(x^{2}-${p2}+x+${p})`,
      `(${t1.toLatex()})(${t2.toLatex()})`,
      `(x+${p})(x-${p + 1})${p === 1 ? 'x(x+1)' : `(x+${p})(x-${p - 1})`}`,
      produit(facteurs),
    ],
    methode: `On applique ${identite3} avec $A=x^2-${p2}$ et $B=x+${p}$, puis on factorise chaque trinôme en cherchant deux nombres de somme et de produit donnés.`,
    lineaires: facteurs.map(([l]) => l),
    positifs: [],
  }
}

function tirerDifference(): Tirage {
  return choice([
    tirerBicarreOuDecale,
    tirerBicarreOuDecale,
    tirerMixte,
    tirerCommun,
  ])()
}

/**
 * (a²x² ∓ b²)(cx - p) développé, écrit a²x²(cx - p) ∓ b²(cx - p), ou avec le second
 * facteur retourné : a²x²(cx - p) ± b²(p - cx).
 */
function tirerGroupement(
  forme: string = choice(['developpe', 'groupe', 'retourne']),
  irreductible: boolean = choice([true, false]),
  nonUnitaire: boolean = choice([true, false]),
): Tirage {
  // Les variantes sont choisies d'abord, avec la même fréquence ; les nombres sont retirés tant qu'ils ne conviennent pas.
  const encore = () => tirerGroupement(forme, irreductible, nonUnitaire)
  const c = nonUnitaire ? choice([2, 3]) : 1
  const a = c === 1 ? choice([1, 1, 2]) : 1
  const b = randint(1, 5)
  const p = randint(-5, 5, [0])
  if (
    pgcd(a, b) !== 1 ||
    pgcd(c, Math.abs(p)) !== 1 ||
    (!irreductible && a * Math.abs(p) === b * c) ||
    (forme === 'retourne' && p < 0)
  ) {
    return encore()
  }
  const a2 = a * a
  const b2 = irreductible ? b * b : -b * b
  const facteur = { a: c, b: p }
  const xp = lin(facteur)
  const trinomeTex = `${rienSi1(a2)}x^{2}${ecritureAlgebrique(b2)}`
  const groupe = `${rienSi1(a2)}x^{2}(${xp})${coefParenthese(b2)}(${xp})`
  const developpe = polynome([-b2 * p, b2 * c, -a2 * p, a2 * c])
  if (forme === 'developpe' && tropGrand(developpe)) return encore()
  const retourne = `${rienSi1(a2)}x^{2}(${xp})${coefParenthese(-b2)}(${p}-${rienSi1(c)}x)`
  const fin = irreductible
    ? [`(${xp})(${trinomeTex})`]
    : [
        `(${xp})(${trinomeTex})`,
        `(${xp})(${lin({ a, b })})(${lin({ a, b: -b })})`,
      ]
  const debut =
    {
      developpe: [developpe.toLatex(), groupe],
      groupe: [groupe],
      retourne: [retourne, groupe],
    }[forme] ?? []
  const regroupement =
    {
      developpe: `On regroupe les termes deux à deux pour faire apparaître le facteur commun $${xp}$`,
      groupe: `On met $${xp}$ en évidence`,
      retourne: `On écrit $${p}-${rienSi1(c)}x=-(${xp})$ pour faire apparaître le facteur commun $${xp}$`,
    }[forme] ?? ''
  return {
    chaine: [...debut, ...fin],
    methode: irreductible
      ? `${regroupement}.`
      : `${regroupement}, puis on factorise $${trinomeTex}$ avec ${identite3}.`,
    lineaires: irreductible ? [facteur] : [facteur, { a, b }, { a, b: -b }],
    positifs: irreductible ? [trinomeTex] : [],
  }
}

const tirages: Record<string, () => Tirage> = {
  facteurX: tirerFacteurX,
  produit: tirerProduit,
  difference: tirerDifference,
  groupement: tirerGroupement,
}

/** Solutions distinctes, dans l'ordre croissant. */
function solutions(lineaires: Lineaire[]): FractionEtendue[] {
  const parTex = new Map<string, FractionEtendue>()
  for (const l of lineaires)
    parTex.set(racine(l).texFractionSimplifiee, racine(l))
  return [...parTex.values()].sort(
    (x, y) => x.valeurDecimale - y.valeurDecimale,
  )
}

/** Calcul en mode affiché : en Typst, un aligned en ligne n'aligne pas sa première ligne. */
const bloc = (tex: string) =>
  context.isTypst ? `$$${tex}$$` : `<br>$${tex}$<br>`

function corriger(t: Tirage, sol: FractionEtendue[]): string {
  const [equation, ...suite] = t.chaine
  const calcul = `\\begin{aligned}${equation}&=${suite.join('\\\\&=')}\\end{aligned}`
  // Facteurs distincts, chacun une fois même s'il est au carré ; une ligne par facteur.
  const facteurs = [
    ...new Map(t.lineaires.map((l) => [lin(l), l])).values(),
  ].sort((l1, l2) => Number(l2.b === 0) - Number(l1.b === 0))
  const lignes = facteurs.map(
    (l, k) =>
      (k === 0 ? '' : '\\text{ou }') +
      (l.a === 1 && l.b === 0
        ? 'x=0&'
        : `${lin(l)}=0&\\iff x=${racine(l).texFractionSimplifiee}`),
  )
  const positifs = t.positifs
    .map(
      (p) =>
        `Le facteur $${p}$ ne s'annule pas, car $${p}>0$ pour tout réel $x$.<br>`,
    )
    .join('')
  const ensemble = `\\left\\{${sol.map((s) => s.texFractionSimplifiee).join(';')}\\right\\}`
  const ramene = t.equation
    ? `On isole tous les termes dans le membre de gauche : $${t.equation}\\iff ${equation}=0$.<br>`
    : ''
  return (
    ramene +
    `${t.methode}` +
    bloc(calcul) +
    "Un produit est nul si et seulement si l'un de ses facteurs est nul :" +
    bloc(`\\begin{aligned}${lignes.join('\\\\')}\\end{aligned}`) +
    positifs +
    `L'ensemble des solutions est $S=${miseEnEvidence(ensemble)}$.`
  )
}

/**
 * Équations de degré 3 ou 4 que l'on résout en factorisant (mise en évidence, identités
 * remarquables) puis avec la règle du produit nul.
 * @author Nathan Scheinmann
 */
export default class EquationEnFactorisant extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 2
    this.comment =
      "Toutes les équations sont de degré 3 ou 4 : la formule du discriminant ne s'applique pas directement, il faut factoriser puis utiliser la règle du produit nul. Les factorisations n'utilisent que la mise en évidence et les identités remarquables, sauf un trinôme à factoriser dans certaines questions (deux nombres de somme et de produit donnés, ou discriminant).<br>Chaque forme tire au hasard des variantes : équation qui n'est pas « = 0 » (x³ = 9x, où diviser par x ferait perdre la solution 0, ou (x² - 5)² = 16) ; facteur x² + c qui ne s'annule pas ; racines doubles ((x² + 1)² - 4x²) ; facteur commun non unitaire (x²(2x - 3) - 4(2x - 3)) ou à retourner (x²(x - 3) + 4(3 - x)).<br>L'option « Solutions » permet de n'avoir que des solutions entières, ou au moins une solution fractionnaire par équation. Avec des solutions fractionnaires, la différence de deux carrés se limite à $16x^4-1$ et $16x^4-81$ (éventuellement sous la forme $16x^4=81$)."
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
    const mode = params.selection('solutions')
    // Tirage refait tant que les solutions ne sont pas du type demandé ; « mélange » ne refait rien.
    const tirer = (famille: string): Tirage => {
      for (let k = 0; ; k++) {
        const t = tirages[famille]()
        const entieres = solutions(t.lineaires).every((s) => s.den === 1)
        if (mode === 'melange' || k > 500 || (mode === 'entieres') === entieres)
          return t
      }
    }
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const t = tirer(familles[i])
      const equation = t.equation ?? `${t.chaine[0]}=0`
      if (!this.questionJamaisPosee(i, equation)) continue
      const sol = solutions(t.lineaires)
      createQuestion(this, i, {
        question: `Résoudre dans $\\mathbb{R}$ l'équation $${equation}$.`,
        correction: corriger(t, sol),
        answer: {
          value: `\\left\\{${sol.map((s) => s.texFractionSimplifiee).join(';')}\\right\\}`,
          compare: seq([sameSet()]),
        },
        field: {
          keyboard: KeyboardType.clavierEnsemble,
          texteAvant: '<br>$S=$',
        },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
