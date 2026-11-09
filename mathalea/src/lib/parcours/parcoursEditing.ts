/**
 * Modifications d'un parcours dans l'éditeur : exercices et paliers. Les
 * exercices restent une seule liste ; chaque palier en compte un nombre, dans
 * l'ordre. Fonctions pures : elles renvoient un nouveau parcours.
 */
import {
  DEFAULT_THRESHOLD,
  levelGroups,
  type Level,
  type Parcours,
  type Step,
} from './parcoursTypes'

// Copie en JSON : structuredClone refuse les objets réactifs de Svelte
const copy = (p: Parcours): Parcours => JSON.parse(JSON.stringify(p))
const hasLevels = (p: Parcours) => (p.paliers?.length ?? 0) > 1

/** Palier qui contient l'exercice i (0 sans paliers) */
export const levelOf = (p: Parcours, i: number) =>
  levelGroups(p).findIndex((g) => g.includes(i))

/** Ajoute des exercices à la fin d'un palier */
export function addSteps(p: Parcours, steps: Step[], level = 0): Parcours {
  const r = copy(p)
  if (!hasLevels(r)) {
    r.etapes.push(...steps)
    return r
  }
  const k = Math.min(level, r.paliers!.length - 1)
  const end = r.paliers!.slice(0, k + 1).reduce((a, l) => a + l.nb, 0)
  r.etapes.splice(end, 0, ...steps)
  r.paliers![k].nb += steps.length
  return r
}

export function removeStep(p: Parcours, i: number): Parcours {
  const r = copy(p)
  if (hasLevels(r)) r.paliers![levelOf(r, i)].nb--
  r.etapes.splice(i, 1)
  return r
}

/**
 * Déplace l'exercice `from` dans le palier `level`, à la position `position`
 * de ce palier (glisser-déposer, ou flèches qui franchissent le bord d'un palier).
 */
export function moveStep(
  p: Parcours,
  from: number,
  level: number,
  position: number,
): Parcours {
  const r = copy(p)
  const [step] = r.etapes.splice(from, 1)
  if (!hasLevels(r)) {
    r.etapes.splice(Math.max(0, Math.min(position, r.etapes.length)), 0, step)
    return r
  }
  const levels = r.paliers!
  levels[levelOf(p, from)].nb--
  const start = levels.slice(0, level).reduce((a, l) => a + l.nb, 0)
  const at = start + Math.max(0, Math.min(position, levels[level].nb))
  r.etapes.splice(at, 0, step)
  levels[level].nb++
  return r
}

/** Flèche haut ou bas : au bord d'un palier, l'exercice passe dans le palier voisin */
export function nudgeStep(p: Parcours, i: number, direction: -1 | 1): Parcours {
  if (!hasLevels(p)) {
    const j = i + direction
    return j < 0 || j >= p.etapes.length ? p : moveStep(p, i, 0, j)
  }
  const groups = levelGroups(p)
  const k = levelOf(p, i)
  const position = groups[k].indexOf(i)
  if (direction === -1 && position === 0)
    return k === 0 ? p : moveStep(p, i, k - 1, groups[k - 1].length)
  if (direction === 1 && position === groups[k].length - 1)
    return k === groups.length - 1 ? p : moveStep(p, i, k + 1, 0)
  return moveStep(p, i, k, position + direction)
}

export const canNudge = (p: Parcours, i: number, direction: -1 | 1) =>
  nudgeStep(p, i, direction) !== p

/**
 * Premier découpage proposé : un palier par objectif (exercices consécutifs
 * qui visent le même, titré par lui), sinon deux paliers de taille égale.
 */
export function splitIntoLevels(p: Parcours): Parcours {
  const r = copy(p)
  const byObjective: { titre: string; nb: number }[] = []
  for (const s of r.etapes) {
    const o = s.objectifs?.[0] ?? ''
    const last = byObjective.at(-1)
    if (last && last.titre === o) last.nb++
    else byObjective.push({ titre: o, nb: 1 })
  }
  const half = Math.ceil(r.etapes.length / 2)
  const split =
    byObjective.length > 1 && byObjective.length <= 6
      ? byObjective
      : [
          { titre: '', nb: half },
          { titre: '', nb: r.etapes.length - half },
        ]
  r.paliers = split.map((g, k): Level =>
    k === 0
      ? { titre: g.titre, nb: g.nb }
      : { titre: g.titre, nb: g.nb, acces: 'seuil', seuil: DEFAULT_THRESHOLD },
  )
  return r
}

export function addLevel(p: Parcours): Parcours {
  const r = copy(p)
  r.paliers = hasLevels(r) ? r.paliers : [{ titre: '', nb: r.etapes.length }]
  r.paliers!.push({
    titre: '',
    nb: 0,
    acces: 'seuil',
    seuil: DEFAULT_THRESHOLD,
  })
  return r
}

/** Retire les paliers ; la fiche du premier devient celle du parcours (s'il n'en a pas) */
function dropLevels(r: Parcours) {
  const sheet = r.paliers?.[0]?.fiche
  if (sheet && !r.fiche) r.fiche = sheet
  delete r.paliers
}

/** Liste simple : plus de paliers ni de style */
export function withoutLevels(p: Parcours): Parcours {
  const r = copy(p)
  dropLevels(r)
  delete r.style
  return r
}

/**
 * Supprime un palier : ses exercices rejoignent le précédent (le suivant pour
 * le premier) ; sa fiche va au premier des deux voisins qui n'en a pas.
 */
export function removeLevel(p: Parcours, k: number): Parcours {
  const r = copy(p)
  const levels = r.paliers!
  const neighbour = k === 0 ? 1 : k - 1
  levels[neighbour].nb += levels[k].nb
  const heir = [neighbour, k + 1].find((j) => levels[j] && !levels[j].fiche)
  if (levels[k].fiche && heir !== undefined && heir !== k)
    levels[heir].fiche = levels[k].fiche
  if (k === 0) levels[1] = { ...levels[1], acces: undefined, seuil: undefined }
  levels.splice(k, 1)
  if (levels.length < 2) dropLevels(r)
  return r
}

/** Ce qui manque pour que le parcours parte aux élèves */
export function missing(p: Parcours): string[] {
  return [
    [!p.niveau, 'un niveau'],
    [!p.theme.trim(), 'un chapitre'],
    [!p.titre.trim(), 'un titre'],
    [p.etapes.length === 0, 'un exercice'],
    [
      p.etapes.length > 0 && hasLevels(p) && p.paliers!.some((l) => l.nb === 0),
      'un exercice dans chaque palier',
    ],
  ]
    .filter(([m]) => m)
    .map(([, label]) => label as string)
}

/** Lien MathALÉA pour essayer des exercices comme un élève */
export function studentPreviewUrl(base: string, steps: Step[]) {
  const url = new URL(base)
  url.search = ''
  for (const s of steps) {
    url.searchParams.append('uuid', s.uuid)
    if (s.id) url.searchParams.append('id', s.id)
    if (s.nbQuestions) url.searchParams.append('n', String(s.nbQuestions))
    if (s.sup !== undefined) url.searchParams.append('s', String(s.sup))
    if (s.sup2 !== undefined) url.searchParams.append('s2', String(s.sup2))
    if (s.sup3 !== undefined) url.searchParams.append('s3', String(s.sup3))
    if (s.sup4 !== undefined) url.searchParams.append('s4', String(s.sup4))
    url.searchParams.append('i', '1')
  }
  url.searchParams.append('v', 'eleve')
  return url.toString()
}
