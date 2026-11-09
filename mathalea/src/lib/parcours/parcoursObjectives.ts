/**
 * Objectifs des parcours : liste de l'enseignant (importée au fil de l'année
 * en CSV, texte collé ou fichier d'un collègue) et objectifs du programme
 * repris du référentiel de MathALÉA.
 */
import type { Objective, Step } from './parcoursTypes'

const OBJECTIVES_FORMAT = 'objectifs-mathalea/1'

/** Cellules d'une ligne CSV (guillemets doublés compris) */
function cells(line: string, separator: string) {
  const result: string[] = []
  let cell = ''
  let quoted = false
  for (let k = 0; k < line.length; k++) {
    const c = line[k]
    if (quoted) {
      if (c === '"' && line[k + 1] === '"') {
        cell += '"'
        k++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === separator) {
      result.push(cell.trim())
      cell = ''
    } else cell += c
  }
  result.push(cell.trim())
  return result
}

const plain = (t: string) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Objectifs d'un tableau CSV (colonnes code, libellé, niveau, chapitre ;
 * en-tête facultatif ; séparateur point-virgule, tabulation, ou virgule avec
 * un en-tête), d'un fichier objectifs-mathalea/1 ou d'un texte collé (un par
 * ligne). Niveau et chapitre absents : ceux donnés.
 */
export function readObjectives(
  text: string,
  level: string,
  theme: string,
): Objective[] {
  const t = text.replace(/^﻿/, '').trim()
  if (t.startsWith('{')) {
    let raw: { format?: string; objectifs?: Partial<Objective>[] }
    try {
      raw = JSON.parse(t)
    } catch {
      throw new Error('Ce fichier n’est pas une liste d’objectifs.')
    }
    if (
      raw.format !== OBJECTIVES_FORMAT ||
      !Array.isArray(raw.objectifs) ||
      !raw.objectifs.every((o) => typeof o?.libelle === 'string')
    ) {
      throw new Error('Ce fichier n’est pas une liste d’objectifs.')
    }
    return raw.objectifs.map((o) => ({
      libelle: o.libelle!.trim(),
      ...(o.code ? { code: o.code } : {}),
      niveau: o.niveau ?? level,
      theme: o.theme ?? theme,
    }))
  }
  const lines = t.split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return []
  const first = plain(lines[0])
  const header =
    /libelle|objectif/.test(first) && /code|niveau|chapitre|theme/.test(first)
  const separator = lines[0].includes(';')
    ? ';'
    : lines[0].includes('\t')
      ? '\t'
      : header && lines[0].includes(',')
        ? ','
        : ''
  if (!separator) {
    return lines
      .map((l) => l.replace(/^\s*[-•*]\s*/, '').trim())
      .map((libelle) => ({ libelle, niveau: level, theme }))
  }
  let column = { code: 0, label: 1, level: 2, theme: 3 }
  let rows = lines
  if (header) {
    const names = cells(first, separator)
    const find = (re: RegExp) => names.findIndex((n) => re.test(n))
    column = {
      code: find(/^code/),
      label: find(/libelle|objectif/),
      level: find(/niveau|classe/),
      theme: find(/chapitre|theme/),
    }
    rows = lines.slice(1)
  }
  return rows.flatMap((line) => {
    const c = cells(line, separator)
    const read = (i: number) => (i >= 0 ? (c[i] ?? '').trim() : '')
    const single = c.length === 1
    const libelle = single ? c[0] : read(column.label)
    if (!libelle) return []
    const code = single ? '' : read(column.code)
    return [
      {
        libelle,
        ...(code ? { code } : {}),
        niveau: read(column.level) || level,
        theme: read(column.theme) || theme,
      },
    ]
  })
}

/** Liste au format CSV (point-virgule, comme les tableurs français) */
export function objectivesToCsv(list: Objective[]) {
  const cell = (t: string) =>
    /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
  return (
    [
      'code;libellé;niveau;chapitre',
      ...list.map((o) =>
        [o.code ?? '', o.libelle, o.niveau, o.theme].map(cell).join(';'),
      ),
    ].join('\n') + '\n'
  )
}

/** Ajoute les objectifs absents (même libellé = même objectif) */
export function mergeObjectives(list: Objective[], added: Objective[]) {
  const result = [...list]
  for (const o of added)
    if (o.libelle && !result.some((x) => x.libelle === o.libelle))
      result.push(o)
  return result
}

/**
 * Un exercice et ses réglages : des paramètres différents peuvent viser un
 * autre objectif, le nombre de questions non.
 */
export const exerciseKey = (
  s: Pick<Step, 'uuid' | 'sup' | 'sup2' | 'sup3' | 'sup4'>,
) =>
  [s.uuid, s.sup, s.sup2, s.sup3, s.sup4]
    .map((x) => (x === undefined ? '' : String(x)))
    .join('|')

/** Objectifs déjà posés sur chaque exercice, d'après toute la bibliothèque */
export function taggedExercises(steps: Step[]) {
  const tags = new Map<string, string[]>()
  for (const s of steps)
    if (s.objectifs?.length) tags.set(exerciseKey(s), s.objectifs)
  return tags
}
