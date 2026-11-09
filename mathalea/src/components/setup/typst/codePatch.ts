/**
 * Report d'une retouche de code Typst d'un sujet sur les autres sujets de la
 * fiche (modale d'édition de la palette, voir `Typst.svelte`).
 *
 * Une surcharge de code remplace tout l'énoncé (ou toute la correction) d'un
 * exercice, nombres compris : la recopier telle quelle dans un sujet B
 * donnerait à B les valeurs de A. On mémorise donc plutôt la retouche comme
 * une suite de remplacements localisés (« remplacer tel passage par tel
 * autre »), rejouée sur le code de l'autre sujet. Une consigne reformulée est
 * le plus souvent identique d'un sujet à l'autre et se reporte sans peine ;
 * un passage qui touche aux nombres tirés au hasard n'a pas d'équivalent dans
 * l'autre sujet et fait échouer le report (jamais d'approximation qui
 * recopierait les nombres de A).
 */

/** Repères virtuels de début et de fin de texte, pour ancrer une retouche au bord. */
const START = '\u0000début'
const END = '\u0000fin'

/** Nombre maximal de mots (et séparateurs) de contexte autour d'une retouche. */
const MAX_CONTEXT = 8

/**
 * Au-delà de cet écart entre les deux textes (en mots ajoutés ou retirés), la
 * comparaison fine coûterait trop cher : la retouche devient un seul
 * remplacement de toute la partie qui diffère, qui ne se reportera que si
 * l'autre sujet contient ce passage à l'identique.
 */
const MAX_EDIT_DISTANCE = 1000

/**
 * Deux retouches séparées par au plus ce nombre de mots identiques sont
 * fusionnées : un contexte aussi court (une espace entre deux mots modifiés)
 * n'aiderait pas à les situer.
 */
const MERGE_GAP = 2

interface CodePatchHunk {
  /** Mots identiques précédant la retouche (au plus `MAX_CONTEXT`). */
  before: string[]
  /** Mots remplacés. */
  removed: string[]
  /** Mots qui les remplacent. */
  inserted: string[]
  /** Mots identiques suivant la retouche (au plus `MAX_CONTEXT`). */
  after: string[]
}

export interface CodePatch {
  hunks: CodePatchHunk[]
}

/** Mots, nombres, blancs et symboles isolés, entourés des repères de bord. */
function tokenize(text: string): string[] {
  return [
    START,
    ...(text.match(/\p{L}+|\p{N}+|\s+|[^\p{L}\p{N}\s]/gu) ?? []),
    END,
  ]
}

type Op = 'equal' | 'remove' | 'insert'

/**
 * Suite d'opérations transformant `a` en `b` (algorithme de Myers), ou `null`
 * si les textes diffèrent de plus de `MAX_EDIT_DISTANCE` mots.
 */
function diffTokens(a: string[], b: string[]): Op[] | null {
  const n = a.length
  const m = b.length
  const max = Math.min(n + m, MAX_EDIT_DISTANCE)
  const offset = max + 1
  let v = new Int32Array(2 * max + 3)
  const trace: Int32Array[] = []
  for (let d = 0; d <= max; d++) {
    trace.push(v.slice())
    const next = v.slice()
    for (let k = -d; k <= d; k += 2) {
      let x =
        k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])
          ? v[offset + k + 1]
          : v[offset + k - 1] + 1
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      next[offset + k] = x
      if (x >= n && y >= m) {
        trace.push(next)
        return backtrack(trace, a.length, b.length, offset)
      }
    }
    v = next
  }
  return null
}

function backtrack(
  trace: Int32Array[],
  n: number,
  m: number,
  offset: number,
): Op[] {
  const ops: Op[] = []
  let x = n
  let y = m
  // trace[d + 1] contient l'état après d modifications
  for (let d = trace.length - 2; d >= 0; d--) {
    const v = trace[d]
    const k = x - y
    const prevK =
      k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])
        ? k + 1
        : k - 1
    const prevX = d === 0 ? 0 : v[offset + prevK]
    const prevY = prevX - prevK
    while (x > prevX && y > prevY) {
      ops.push('equal')
      x--
      y--
    }
    if (d > 0) ops.push(x === prevX ? 'insert' : 'remove')
    x = prevX
    y = prevY
  }
  return ops.reverse()
}

/**
 * Retouche faisant passer de `original` à `edited`, à rejouer sur un autre
 * texte avec `applyCodePatch`.
 */
export function createCodePatch(original: string, edited: string): CodePatch {
  const a = tokenize(original)
  const b = tokenize(edited)
  const ops = diffTokens(a, b) ?? coarseDiff(a, b)
  // découpe en blocs : [début, fin[ dans a et dans b de chaque retouche
  const blocks: { a0: number; a1: number; b0: number; b1: number }[] = []
  let i = 0
  let j = 0
  for (const op of ops) {
    if (op === 'equal') {
      i++
      j++
      continue
    }
    const last = blocks.at(-1)
    if (last != null && i - last.a1 <= MERGE_GAP && j - last.b1 <= MERGE_GAP) {
      last.a1 = i
      last.b1 = j
    } else {
      blocks.push({ a0: i, a1: i, b0: j, b1: j })
    }
    if (op === 'remove') i++
    else j++
    const current = blocks[blocks.length - 1]
    current.a1 = i
    current.b1 = j
  }
  const hunks = blocks.map((block, index) => {
    const previousEnd = index === 0 ? 0 : blocks[index - 1].a1
    const nextStart =
      index === blocks.length - 1 ? a.length : blocks[index + 1].a0
    return {
      before: a.slice(Math.max(previousEnd, block.a0 - MAX_CONTEXT), block.a0),
      removed: a.slice(block.a0, block.a1),
      inserted: b.slice(block.b0, block.b1),
      after: a.slice(block.a1, Math.min(nextStart, block.a1 + MAX_CONTEXT)),
    }
  })
  return { hunks }
}

/** Un seul remplacement de tout ce qui sépare le début commun de la fin commune. */
function coarseDiff(a: string[], b: string[]): Op[] {
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) {
    prefix++
  }
  let suffix = 0
  while (
    suffix < a.length - prefix &&
    suffix < b.length - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix++
  }
  return [
    ...Array<Op>(prefix).fill('equal'),
    ...Array<Op>(a.length - prefix - suffix).fill('remove'),
    ...Array<Op>(b.length - prefix - suffix).fill('insert'),
    ...Array<Op>(suffix).fill('equal'),
  ]
}

const NUMBER = /^\p{N}+$/u

/**
 * Les nombres du contexte sont tirés au hasard et diffèrent d'un sujet à
 * l'autre : dans le contexte (pas dans le texte remplacé), un nombre
 * correspond à n'importe quel autre nombre.
 */
function sameContextToken(token: string, expected: string): boolean {
  return token === expected || (NUMBER.test(token) && NUMBER.test(expected))
}

/** Positions (à partir de `from`) où `before`, `removed` puis `after` se suivent. */
function occurrences(
  tokens: string[],
  from: number,
  before: string[],
  removed: string[],
  after: string[],
): number[] {
  const length = before.length + removed.length + after.length
  const found: number[] = []
  for (let at = from; at + length <= tokens.length; at++) {
    let ok = true
    for (let k = 0; ok && k < length; k++) {
      const token = tokens[at + k]
      if (k < before.length) ok = sameContextToken(token, before[k])
      else if (k < before.length + removed.length)
        ok = token === removed[k - before.length]
      else
        ok = sameContextToken(token, after[k - before.length - removed.length])
    }
    if (ok) {
      found.push(at + before.length)
      if (found.length > 1) break
    }
  }
  return found
}

/**
 * Position (dans `tokens`, à partir de `from`) des mots remplacés par la
 * retouche, repérés par leur contexte. On essaie les contextes du plus long
 * au plus court (un mot du contexte d'origine peut manquer dans l'autre
 * sujet) : au premier niveau de longueur où un contexte désigne un seul
 * endroit, la retouche s'y applique, à condition que les autres contextes de
 * même longueur ne désignent pas un endroit différent.
 */
function locate(
  tokens: string[],
  hunk: CodePatchHunk,
  from: number,
): number | null {
  const maxTotal = hunk.before.length + hunk.after.length
  for (let total = maxTotal; total >= 0; total--) {
    // sans contexte ni texte remplacé, une insertion n'est rattachée à rien
    if (total + hunk.removed.length === 0) break
    const candidates = new Set<number>()
    for (let l = Math.min(total, hunk.before.length); l >= 0; l--) {
      const r = total - l
      if (r > hunk.after.length) break
      const found = occurrences(
        tokens,
        from,
        hunk.before.slice(hunk.before.length - l),
        hunk.removed,
        hunk.after.slice(0, r),
      )
      if (found.length === 1) candidates.add(found[0])
    }
    if (candidates.size === 1) return [...candidates][0]
    if (candidates.size > 1) return null
  }
  return null
}

/**
 * Rejoue la retouche `patch` sur `target`.
 * @returns le texte retouché, ou `null` si un des passages modifiés n'a pas
 * pu être situé sans ambiguïté dans `target`
 */
export function applyCodePatch(
  target: string,
  patch: CodePatch,
): string | null {
  const tokens = tokenize(target)
  const output: string[] = []
  let cursor = 0
  for (const hunk of patch.hunks) {
    const at = locate(tokens, hunk, cursor)
    if (at == null) return null
    output.push(...tokens.slice(cursor, at), ...hunk.inserted)
    cursor = at + hunk.removed.length
  }
  output.push(...tokens.slice(cursor))
  return output.filter((token) => token !== START && token !== END).join('')
}
