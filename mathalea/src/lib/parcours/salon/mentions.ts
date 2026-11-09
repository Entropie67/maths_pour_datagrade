/**
 * Mentions « @Nom » dans les commentaires et la discussion d'un salon. Un nom
 * peut contenir des espaces (« Claire B ») : on ne reconnaît que les noms des
 * membres du salon, le plus long d'abord, sans tenir compte de la casse.
 */

export interface TextSegment {
  text: string
  mention?: string // nom du membre mentionné, tel qu'il est écrit dans son compte
}

const isWordChar = (c: string | undefined) =>
  c !== undefined && /[\p{L}\p{N}_-]/u.test(c)

const byLength = (names: string[]) =>
  [...new Set(names.filter(Boolean))].sort((a, b) => b.length - a.length)

/** Membre mentionné juste après le « @ » en position `at`, s'il y en a un */
function nameAt(text: string, at: number, names: string[]): string | null {
  if (text[at] !== '@' || isWordChar(text[at - 1])) return null
  const rest = text.slice(at + 1).toLocaleLowerCase('fr')
  for (const name of names) {
    if (
      rest.startsWith(name.toLocaleLowerCase('fr')) &&
      !isWordChar(text[at + 1 + name.length])
    )
      return name
  }
  return null
}

/** Texte découpé en morceaux simples et en mentions (affichage sans HTML) */
export function splitMentions(text: string, names: string[]): TextSegment[] {
  const sorted = byLength(names)
  const segments: TextSegment[] = []
  let plain = ''
  for (let i = 0; i < text.length; i++) {
    const name = text[i] === '@' ? nameAt(text, i, sorted) : null
    if (name) {
      if (plain) segments.push({ text: plain })
      plain = ''
      segments.push({ text: text.slice(i, i + 1 + name.length), mention: name })
      i += name.length
    } else plain += text[i]
  }
  if (plain) segments.push({ text: plain })
  return segments
}

/** Le texte mentionne-t-il ce membre ? */
export function mentions(text: string, name: string, names: string[]): boolean {
  return splitMentions(text, [...names, name]).some(
    (s) => s.mention?.toLocaleLowerCase('fr') === name.toLocaleLowerCase('fr'),
  )
}

/**
 * Mention en cours de saisie avant le curseur : « @Cla| » donne la position du
 * « @ » et le début de nom tapé. Rien après un retour à la ligne ni au-delà de
 * 40 caractères.
 */
export function mentionQuery(
  text: string,
  caret: number,
): { start: number; query: string } | null {
  const before = text.slice(0, caret)
  const at = before.lastIndexOf('@')
  if (at === -1 || isWordChar(before[at - 1])) return null
  const query = before.slice(at + 1)
  if (query.length > 40 || /[\n@]/.test(query)) return null
  return { start: at, query }
}

/** Membres proposés pour un début de nom (début du nom ou d'un de ses mots) */
export function suggestMembers(query: string, names: string[]): string[] {
  const q = query.toLocaleLowerCase('fr').trim()
  return byLength(names)
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .filter((n) =>
      n
        .toLocaleLowerCase('fr')
        .split(/\s+/)
        .concat(n.toLocaleLowerCase('fr'))
        .some((w) => w.startsWith(q)),
    )
    .slice(0, 6)
}

/** Remplace la mention en cours par « @Nom », suivi d'une espace s'il n'y en a pas */
export function insertMention(
  text: string,
  start: number,
  caret: number,
  name: string,
): { text: string; caret: number } {
  const after = text.slice(caret)
  const spaced = /^\s/.test(after)
  const inserted = `@${name}${spaced ? '' : ' '}`
  return {
    text: text.slice(0, start) + inserted + after,
    caret: start + inserted.length + (spaced ? 1 : 0),
  }
}

/**
 * Ce qu'on a déjà vu, dans ce navigateur : pour chaque salon, la date de la
 * dernière lecture des commentaires d'un parcours ou d'une fiche (clé : son
 * identifiant) et de la discussion (clé « discussion »).
 */
export type SeenMentions = Record<string, Record<string, string>>
const SEEN_KEY = 'mathalea-salons-mentions-vues'
export const DISCUSSION = 'discussion'

export function readSeen(): SeenMentions {
  try {
    const v = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}')
    return v && typeof v === 'object' ? (v as SeenMentions) : {}
  } catch {
    return {}
  }
}

/** Marque comme vus les commentaires d'un parcours (ou la discussion) d'un salon */
export function markSeen(
  seen: SeenMentions,
  salon: string,
  key: string,
  le = new Date().toISOString(),
): SeenMentions {
  if ((seen[salon]?.[key] ?? '') >= le) return seen
  const next = { ...seen, [salon]: { ...seen[salon], [key]: le } }
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(next))
  } catch {
    // Stockage refusé : les pastilles reviennent à la prochaine visite
  }
  return next
}

/** Commentaires ou messages d'autres membres qui me mentionnent, après `since` */
export function unseenMentions<
  T extends { auteur: string; texte: string; le: string },
>(items: T[], me: string, names: string[], since = ''): T[] {
  const lower = me.toLocaleLowerCase('fr')
  return items.filter(
    (x) =>
      x.le > since &&
      x.auteur.toLocaleLowerCase('fr') !== lower &&
      mentions(x.texte, me, names),
  )
}
