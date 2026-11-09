import { compile, ComputeEngine } from '@cortex-js/compute-engine'
import { generateCleaner } from '../cleaners'
import type { Check, CheckOverrides } from './types'

/**
 * Compare deux expressions littérales en nombres entiers, au choix des
 * lettres près : chaque lettre libre peut être remplacée par $\pm v+k$
 * ($k$ entier) et les lettres libres peuvent être échangées.
 * Ainsi, pour « la somme de trois entiers consécutifs », $n+(n+1)+(n+2)$,
 * $(n-1)+n+(n+1)$ et $3n+6$ sont acceptées.
 * La comparaison est numérique, sur des points fixés à l'avance.
 * @author Nathan Scheinmann
 */

const ce = new ComputeEngine()

const cleanLatex = generateCleaner([
  'virgules',
  'parentheses',
  'fractions',
  'divisions',
])

const RELATIVE_TOLERANCE = 1e-9
const NB_POINTS = 8

type NumericFunction = (vars: Record<string, number>) => number

type Expression = {
  evaluate: NumericFunction
  letters: string[]
}

function analyse(latex: string): Expression | null {
  try {
    const cleaned = cleanLatex(latex)
    const parsed = ce.parse(cleaned)
    if (!parsed.isValid) return null
    const compiled = compile(cleaned)
    if (compiled?.run == null) return null
    return {
      letters: [...parsed.unknowns].sort(),
      evaluate: (vars) => {
        try {
          const value = compiled.run!(vars)
          return typeof value === 'number' ? value : Number.NaN
        } catch {
          return Number.NaN
        }
      },
    }
  } catch {
    return null
  }
}

/** Points d'échantillonnage déterministes, non entiers, dans [-2,5 ; 2,5]. */
function samplePoints(letters: string[]): Record<string, number>[] {
  const points: Record<string, number>[] = []
  let graine = 0.318
  for (let p = 0; p < NB_POINTS; p++) {
    const point: Record<string, number> = {}
    for (const lettre of letters) {
      graine = (graine * 9301 + 0.49297) % 1
      point[lettre] = 5 * graine - 2.5
    }
    points.push(point)
  }
  return points
}

function egaux(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false
  return (
    Math.abs(a - b) <=
    RELATIVE_TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b))
  )
}

/** Toutes les permutations d'un tableau (au plus quelques lettres). */
function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items]
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
      (reste) => [item, ...reste],
    ),
  )
}

/** Plage de décalages essayés un à un quand le calcul ne détermine pas $k$. */
const PLAGE_DE_SECOURS: [number, number] = [-3, 3]

type Remplacements = {
  /** Décalages $k$ autorisés, bornes comprises ; sans bornes, tout entier convient */
  shifts?: [number, number]
  /** Essayer aussi $-v+k$ */
  allowNegation: boolean
}

/** Décalages de $[min;max]$, le décalage nul d'abord (notation de la réponse attendue). */
function decalagesDe([min, max]: [number, number]): number[] {
  const decalages = min <= 0 && max >= 0 ? [0] : []
  for (let k = 1; k <= Math.max(Math.abs(min), Math.abs(max)); k++) {
    if (k >= min && k <= max) decalages.push(k)
    if (-k >= min && -k <= max) decalages.push(-k)
  }
  return decalages
}

/** Produit cartésien : toutes les listes de longueur `longueur` d'éléments de `valeurs`. */
function nUplets<T>(valeurs: T[], longueur: number): T[][] {
  if (longueur === 0) return [[]]
  return nUplets(valeurs, longueur - 1).flatMap((debut) =>
    valeurs.map((valeur) => [...debut, valeur]),
  )
}

/** Résout un système linéaire carré (pivot de Gauss partiel) ; null s'il est singulier. */
function resoudre(matrice: number[][], second: number[]): number[] | null {
  const taille = second.length
  const m = matrice.map((ligne, i) => [...ligne, second[i]])
  const echelle = Math.max(1, ...m.flat().map(Math.abs))
  for (let col = 0; col < taille; col++) {
    let pivot = col
    for (let i = col + 1; i < taille; i++) {
      if (Math.abs(m[i][col]) > Math.abs(m[pivot][col])) pivot = i
    }
    if (Math.abs(m[pivot][col]) < 1e-9 * echelle) return null
    ;[m[col], m[pivot]] = [m[pivot], m[col]]
    for (let i = 0; i < taille; i++) {
      if (i === col) continue
      const facteur = m[i][col] / m[col][col]
      for (let j = col; j <= taille; j++) m[i][j] -= facteur * m[col][j]
    }
  }
  return m.map((ligne, i) => ligne[taille] / ligne[i])
}

const DEGRE_MAX = 10
/** Nœuds de Tchebychev dans $[-2;2]$, pour retrouver les coefficients d'un polynôme en $\lambda$. */
const NOEUDS = Array.from(
  { length: DEGRE_MAX + 1 },
  (_, i) => 2 * Math.cos(((2 * i + 1) * Math.PI) / (2 * (DEGRE_MAX + 1))),
)
const VANDERMONDE = NOEUDS.map((noeud) => NOEUDS.map((_, j) => noeud ** j))

/** Coefficients de $\lambda\mapsto h(\lambda)$, supposé polynomial de degré au plus DEGRE_MAX. */
function coefficients(h: (lambda: number) => number): number[] | null {
  const valeurs = NOEUDS.map(h)
  if (!valeurs.every(Number.isFinite)) return null
  return resoudre(VANDERMONDE, valeurs)
}

type Substitution = {
  saisie: NumericFunction
  /** Lettres libres et lettre de la réponse qui remplace chacune */
  libres: string[]
  ordre: string[]
  signes: number[]
}

function image(
  { libres, ordre, signes }: Substitution,
  point: Record<string, number>,
  decalages: number[],
): Record<string, number> {
  const resultat = { ...point }
  libres.forEach((lettre, j) => {
    resultat[lettre] = signes[j] * point[ordre[j]] + decalages[j]
  })
  return resultat
}

/**
 * Calcule les décalages $k$ (un par lettre libre), sans les essayer un à un.
 * Pour une direction $x$, le coefficient de $\lambda^{d-1}$ dans $S(L\lambda x+k)$,
 * où $d$ est le degré, vaut $S_{d-1}(Lx)+\nabla S_d(Lx)\cdot k$ : il est affine en $k$.
 * On l'égale à celui de $A(\lambda x)$ pour plusieurs directions, puis on résout
 * aux moindres carrés. Renvoie null si $k$ n'est pas déterminé ainsi.
 */
function decalagesCalcules(
  substitution: Substitution,
  answer: NumericFunction,
  directions: Record<string, number>[],
): number[] | null {
  const nb = substitution.libres.length
  const zero = substitution.libres.map(() => 0)
  const lignes: number[][] = []
  const seconds: number[] = []
  for (const x of directions) {
    const fois = (lambda: number) =>
      Object.fromEntries(Object.entries(x).map(([v, c]) => [v, lambda * c]))
    const coeffsReponse = coefficients((lambda) => answer(fois(lambda)))
    const evalSaisie = (decalages: number[]) =>
      coefficients((lambda) =>
        substitution.saisie(image(substitution, fois(lambda), decalages)),
      )
    const base = evalSaisie(zero)
    if (coeffsReponse == null || base == null) return null
    const taille = Math.max(1, ...coeffsReponse.map(Math.abs))
    let degre = DEGRE_MAX
    while (degre > 0 && Math.abs(coeffsReponse[degre]) < 1e-7 * taille) degre--
    if (degre === 0) return null
    const ligne: number[] = []
    for (let j = 0; j < nb; j++) {
      const unite = zero.map((_, i) => (i === j ? 1 : 0))
      const decale = evalSaisie(unite)
      if (decale == null) return null
      ligne.push(decale[degre - 1] - base[degre - 1])
    }
    lignes.push(ligne)
    seconds.push(coeffsReponse[degre - 1] - base[degre - 1])
  }
  // Équations normales : (ᵗM M) k = ᵗM b
  const normale = Array.from({ length: nb }, (_, i) =>
    Array.from({ length: nb }, (_, j) =>
      lignes.reduce((acc, ligne) => acc + ligne[i] * ligne[j], 0),
    ),
  )
  const droite = Array.from({ length: nb }, (_, i) =>
    lignes.reduce((acc, ligne, p) => acc + ligne[i] * seconds[p], 0),
  )
  const decalages = resoudre(normale, droite)
  return decalages?.every(Number.isFinite)
    ? decalages.map((k) => Math.round(k))
    : null
}

/**
 * Cherche une substitution des lettres libres qui rend la saisie égale à la
 * réponse attendue sur tous les points ; les lettres fixées restent inchangées.
 */
function existeSubstitution(
  saisie: NumericFunction,
  answer: NumericFunction,
  libres: string[],
  points: Record<string, number>[],
  { shifts, allowNegation }: Remplacements,
): boolean {
  const attendus = points.map((point) => answer(point))
  if (!attendus.every(Number.isFinite)) return false
  const convient = (substitution: Substitution, decalages: number[]) =>
    points.every((point, p) =>
      egaux(saisie(image(substitution, point, decalages)), attendus[p]),
    )
  const jeuxDeSignes = nUplets(allowNegation ? [1, -1] : [1], libres.length)
  const essais = nUplets(decalagesDe(shifts ?? PLAGE_DE_SECOURS), libres.length)
  for (const ordre of permutations(libres)) {
    for (const signes of jeuxDeSignes) {
      const substitution = { saisie, libres, ordre, signes }
      if (shifts == null && libres.length > 0) {
        const calcules = decalagesCalcules(
          substitution,
          answer,
          points.slice(0, libres.length + 2),
        )
        if (calcules != null && convient(substitution, calcules)) return true
      }
      if (essais.some((decalages) => convient(substitution, decalages))) {
        return true
      }
    }
  }
  return false
}

function listeDeLettres(lettres: string[]): string {
  const formatees = lettres.map((lettre) => `$${lettre}$`)
  if (formatees.length <= 1) return formatees.join('')
  return `${formatees.slice(0, -1).join(', ')} et ${formatees[formatees.length - 1]}`
}

export type SameUpToIntegerShiftOptions = CheckOverrides & {
  /** Lettres autorisées dans la saisie (défaut : celles de la réponse attendue) */
  variables?: string[]
  /** Lettres dont l'énoncé fixe le rôle (« le premier noté $n$ ») : jamais remplacées ni échangées */
  fixed?: string[]
  /**
   * Décalages $k$ autorisés, bornes comprises (défaut : tout entier, $k$ est
   * alors calculé) : la saisie, où l'on remplace $v$ par $v+k$, doit donner la
   * réponse attendue. Avec $[0;2]$
   * et la réponse $n+(n+1)+(n+2)$, le $n$ de l'élève désigne l'un des trois
   * entiers : le plus petit, celui du milieu ou le plus grand.
   */
  shifts?: [number, number]
  /** Accepte aussi $-v+k$ (défaut : true) */
  allowNegation?: boolean
}

/**
 * Accepte toute expression égale à la réponse attendue après un changement
 * de lettre $v\mapsto \pm v+k$ ($k$ entier) et un échange des lettres libres.
 * Utile pour traduire « un nombre pair », « deux entiers consécutifs »… :
 * l'élève peut écrire $2n$ ou $2n+2$, $n$ et $n+1$ ou $n-1$ et $n$, réduire
 * ou non l'expression.
 */
export function sameUpToIntegerShift({
  variables,
  fixed = [],
  shifts,
  allowNegation = true,
  ...overrides
}: SameUpToIntegerShiftOptions = {}): Check {
  return {
    name: overrides.name ?? 'same-up-to-integer-shift',
    weight: overrides.weight,
    feedbackEnabled: overrides.feedbackEnabled,
    feedbackOnSuccess: overrides.feedbackOnSuccess,
    run: (saisie: string, answer: string) => {
      const attendu = analyse(answer)
      const saisi = analyse(saisie)
      if (attendu == null || saisi == null) {
        return {
          passed: false,
          feedbackKo: "L'expression saisie n'a pas pu être interprétée.",
        }
      }
      const autorisees = variables ?? attendu.letters
      const etrangeres = saisi.letters.filter(
        (lettre) => !autorisees.includes(lettre),
      )
      if (etrangeres.length > 0) {
        return {
          passed: false,
          feedbackKo:
            autorisees.length === 1
              ? `Utiliser uniquement la lettre ${listeDeLettres(autorisees)}.`
              : `Utiliser uniquement les lettres ${listeDeLettres(autorisees)}.`,
        }
      }
      const lettres = [...new Set([...autorisees, ...attendu.letters])].sort()
      const points = samplePoints(lettres)
      const libres = lettres.filter((lettre) => !fixed.includes(lettre))
      if (
        existeSubstitution(saisi.evaluate, attendu.evaluate, libres, points, {
          shifts,
          allowNegation,
        })
      ) {
        return {
          passed: true,
          feedbackKo: '',
          feedbackOk: overrides.feedbackOk,
        }
      }
      const fixeesPresentes = fixed.filter((lettre) => lettres.includes(lettre))
      if (
        fixeesPresentes.length > 0 &&
        existeSubstitution(saisi.evaluate, attendu.evaluate, lettres, points, {
          allowNegation: true,
        })
      ) {
        return {
          passed: false,
          feedbackKo: `Respecter le rôle donné à ${listeDeLettres(fixeesPresentes)} dans l'énoncé.`,
        }
      }
      const manquantes = attendu.letters.filter(
        (lettre) => !saisi.letters.includes(lettre),
      )
      return {
        passed: false,
        feedbackKo:
          overrides.feedbackKo ??
          (manquantes.length > 0
            ? `Utiliser aussi ${manquantes.length === 1 ? 'la lettre' : 'les lettres'} ${listeDeLettres(manquantes)}.`
            : "Cette expression ne traduit pas l'énoncé."),
      }
    },
  }
}
