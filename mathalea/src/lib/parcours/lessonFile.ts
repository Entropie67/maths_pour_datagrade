/**
 * Fiches de cours : contrôle (le même que celui de l'application, qui refuse
 * un fichier avec une fiche mal formée), messages pour l'éditeur, et fichier
 * d'une fiche seule (`fiche-<titre>.json`) pour la garder ou la partager.
 */
import { compile } from './lessonExpression'
import {
  GRAPH_COLORS,
  LINE_STYLES,
  POINT_SHAPES,
  type Lesson,
  type LessonBlock,
  type LessonBlockType,
  type LessonGraph,
} from './parcoursTypes'

export const LESSON_FORMAT = 'fiche-mathalea/1'

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v)
const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)
const optional = (v: unknown, check: (x: unknown) => boolean) =>
  v === undefined || check(v)
const listOf = (v: unknown, check: (x: unknown) => boolean): v is unknown[] =>
  Array.isArray(v) && v.every(check)

/** Nom d'un curseur : une lettre, ni x ni e */
export const SLIDER_NAME = /^[a-df-wyz]$/
export const IMAGE_SOURCE = /^data:image\/(svg\+xml|png|jpeg|webp)[;,]/
export const LINK = /^https?:\/\//

/**
 * Ce qui empêche un graphique d'être tracé, en mots ; null s'il est correct.
 * Sert au contrôle des fichiers et aux messages de l'éditeur.
 */
export function graphProblem(g: LessonGraph): string | null {
  const sliders = g.curseurs ?? {}
  const names = Object.keys(sliders)
  const bad = names.find((n) => !SLIDER_NAME.test(n))
  if (bad !== undefined)
    return `Curseur « ${bad} » : une seule lettre, ni x ni e.`
  for (const [n, c] of Object.entries(sliders)) {
    if (!listOf(c, isNumber) || ![3, 4].includes(c.length))
      return `Curseur ${n} : min, max et valeur attendus.`
    if (c[0] >= c[1]) return `Curseur ${n} : le min doit être inférieur au max.`
    if (c[3] !== undefined && c[3] <= 0)
      return `Curseur ${n} : le pas doit être positif.`
  }
  if (!g.fonctions.length) return 'Au moins une fonction.'
  for (const [k, f] of g.fonctions.entries()) {
    if (!f.trim()) return `Fonction ${k + 1} vide.`
    if (!compile(f, ['x', ...names]))
      return `Fonction ${k + 1} : « ${f} » ne se calcule pas (variables : x${names.map((n) => `, ${n}`).join('')}).`
  }
  const range = (r: unknown) =>
    listOf(r, isNumber) &&
    r.length === 2 &&
    (r as number[])[0] < (r as number[])[1]
  if (!range(g.x)) return 'Fenêtre : x min doit être inférieur à x max.'
  if (!range(g.y)) return 'Fenêtre : y min doit être inférieur à y max.'
  if (g.aire) {
    const bound = (b: unknown) =>
      isNumber(b) || (isString(b) && names.includes(b))
    if (!bound(g.aire.de) || !bound(g.aire.a))
      return 'Aire : chaque borne est un nombre ou le nom d’un curseur.'
    const curve = (k: unknown) =>
      Number.isInteger(k) &&
      (k as number) >= 0 &&
      (k as number) < g.fonctions.length
    if (!optional(g.aire.fonction, curve) || !optional(g.aire.entre, curve))
      return 'Aire : courbe inexistante.'
  }
  const coordinate = (c: unknown) =>
    isNumber(c) || (isString(c) && names.includes(c))
  const color = (c: unknown) => (GRAPH_COLORS as readonly unknown[]).includes(c)
  if (g.styles !== undefined) {
    if (!Array.isArray(g.styles) || g.styles.length > g.fonctions.length)
      return 'Styles : un par courbe au plus.'
    const bad = g.styles.findIndex(
      (st) =>
        !isObject(st) ||
        !optional(st.trait, (t) =>
          (LINE_STYLES as readonly unknown[]).includes(t),
        ) ||
        !optional(st.couleur, color),
    )
    if (bad >= 0) return `Courbe ${bad + 1} : style inconnu.`
  }
  for (const [k, p] of (g.points ?? []).entries()) {
    const which = `Point ${k + 1}${p?.nom ? ` (${p.nom})` : ''}`
    if (!isObject(p) || !coordinate(p.x))
      return `${which} : x est un nombre ou la lettre d’un curseur.`
    if (p.y === undefined) {
      const onCurve =
        Number.isInteger(p.sur) && p.sur! >= 0 && p.sur! < g.fonctions.length
      if (!onCurve) return `${which} : donnez y, ou la courbe qui le porte.`
    } else if (!coordinate(p.y) || p.sur !== undefined)
      return `${which} : y est un nombre ou la lettre d’un curseur.`
    if (
      !optional(p.forme, (f) =>
        (POINT_SHAPES as readonly unknown[]).includes(f),
      )
    )
      return `${which} : forme inconnue.`
    if (!optional(p.couleur, color)) return `${which} : couleur inconnue.`
    if (
      !optional(p.nom, isString) ||
      !optional(p.coordonnees, (b) => typeof b === 'boolean')
    )
      return `${which} : nom ou coordonnées mal écrits.`
  }
  for (const [k, t] of (g.textes ?? []).entries()) {
    if (!isObject(t) || !coordinate(t.x) || !coordinate(t.y))
      return `Texte ${k + 1} : x et y sont des nombres ou des lettres de curseurs.`
    if (!isString(t.texte)) return `Texte ${k + 1} : texte attendu.`
    if (!optional(t.couleur, color)) return `Texte ${k + 1} : couleur inconnue.`
  }
  return null
}

/** Ce qui manque ou ne va pas dans un bloc, en mots ; null s'il est correct */
export function blockProblem(b: LessonBlock): string | null {
  switch (b.type) {
    case 'texte':
    case 'retenir':
      return b.texte.trim() ? null : 'Texte vide.'
    case 'exemple':
      if (!b.enonce.trim()) return 'Énoncé vide.'
      return b.etapes.some((e) => !e.trim()) ? 'Une étape est vide.' : null
    case 'question':
      if (!b.enonce.trim()) return 'Énoncé vide.'
      if (b.choix) {
        if (b.choix.length < 2) return 'Au moins deux réponses proposées.'
        if (b.choix.some((c) => !c.trim()))
          return 'Une réponse proposée est vide.'
        if (
          !Number.isInteger(b.bonne) ||
          b.bonne! < 0 ||
          b.bonne! >= b.choix.length
        )
          return 'Indiquez la bonne réponse.'
        return null
      }
      return isNumber(b.reponse) ? null : 'Réponse attendue : un nombre.'
    case 'graphique':
      return graphProblem(b)
    case 'image':
      if (!IMAGE_SOURCE.test(b.src))
        return 'Choisissez une image (SVG, PNG, JPEG, WebP).'
      return b.alt.trim()
        ? null
        : 'Décrivez l’image (lu aux élèves malvoyants).'
    case 'lien':
      if (!b.titre.trim()) return 'Titre du lien vide.'
      return LINK.test(b.lien) ? null : 'Le lien doit commencer par https://'
  }
}

/** Forme de chaque champ d'un bloc, avant de lire son contenu */
function hasShape(v: Record<string, unknown>): boolean {
  const s = (k: string) => isString(v[k])
  const os = (k: string) => optional(v[k], isString)
  switch (v.type) {
    case 'texte':
      return s('texte')
    case 'retenir':
      return s('texte') && os('titre')
    case 'exemple':
      return s('enonce') && listOf(v.etapes, isString) && os('titre')
    case 'question':
      return (
        s('enonce') &&
        s('explication') &&
        optional(v.choix, (c) => listOf(c, isString)) &&
        optional(v.bonne, isNumber) &&
        optional(v.reponse, isNumber)
      )
    case 'graphique':
      return (
        listOf(v.fonctions, isString) &&
        Array.isArray(v.x) &&
        Array.isArray(v.y) &&
        optional(v.curseurs, isObject) &&
        optional(v.aire, isObject) &&
        optional(v.styles, Array.isArray) &&
        optional(v.points, Array.isArray) &&
        optional(v.textes, Array.isArray) &&
        optional(v.valeur, (b) => typeof b === 'boolean') &&
        os('legende')
      )
    case 'image':
      return s('src') && s('alt') && os('legende')
    case 'lien':
      return s('titre') && s('lien')
    default:
      return false
  }
}

/**
 * Bloc accepté dans un fichier : mêmes règles que l'application (un texte
 * vide passe ; l'éditeur, lui, le signale).
 */
function isBlock(v: unknown): v is LessonBlock {
  if (!isObject(v) || !hasShape(v)) return false
  const b = v as LessonBlock
  switch (b.type) {
    case 'question':
      return b.choix
        ? b.choix.length >= 2 &&
            Number.isInteger(b.bonne) &&
            b.bonne! >= 0 &&
            b.bonne! < b.choix.length
        : isNumber(b.reponse)
    case 'graphique':
      return graphProblem(b) === null
    case 'image':
      return IMAGE_SOURCE.test(b.src)
    case 'lien':
      return LINK.test(b.lien)
    default:
      return true
  }
}

export const isLesson = (v: unknown): v is Lesson =>
  isObject(v) &&
  isString(v.titre) &&
  optional(v.avant, (b) => typeof b === 'boolean') &&
  listOf(v.blocs, isBlock)

/** Ce qui empêche la fiche de partir aux élèves, bloc par bloc */
export function lessonProblems(l: Lesson): string[] {
  return [
    ...(l.titre.trim() ? [] : ['La fiche n’a pas de titre.']),
    ...(l.blocs.length ? [] : ['La fiche n’a aucun bloc.']),
    ...l.blocs.flatMap((b, k) => {
      const p = blockProblem(b)
      return p ? [`Bloc ${k + 1} (${BLOCK_LABELS[b.type]}) : ${p}`] : []
    }),
  ]
}

export const BLOCK_LABELS: Record<LessonBlockType, string> = {
  texte: 'Texte',
  retenir: 'À retenir',
  exemple: 'Exemple',
  question: 'Question',
  graphique: 'Graphique',
  image: 'Image',
  lien: 'Lien',
}

export const BLOCK_ICONS: Record<LessonBlockType, string> = {
  texte: 'bx-text',
  retenir: 'bx-bookmark',
  exemple: 'bx-list-ol',
  question: 'bx-help-circle',
  graphique: 'bx-line-chart',
  image: 'bx-image',
  lien: 'bx-link-external',
}

/** Bloc neuf, prêt à remplir */
export function emptyBlock(type: LessonBlockType): LessonBlock {
  switch (type) {
    case 'texte':
      return { type, texte: '' }
    case 'retenir':
      return { type, texte: '' }
    case 'exemple':
      return { type, enonce: '', etapes: [''] }
    case 'question':
      return { type, enonce: '', choix: ['', ''], bonne: 0, explication: '' }
    case 'graphique':
      return { type, fonctions: ['x^2'], x: [-3, 3], y: [-1, 5] }
    case 'image':
      return { type, src: '', alt: '' }
    case 'lien':
      return { type, titre: '', lien: '' }
  }
}

export const emptyLesson = (): Lesson => ({ titre: '', avant: true, blocs: [] })

/** Fiche telle qu'elle part (fichier, élèves) : sans les identifiants des salons */
export const withoutKeys = (l: Lesson): Lesson =>
  l.blocs.some((b) => b.cle !== undefined)
    ? { ...l, blocs: l.blocs.map(({ cle: _cle, ...b }) => b as LessonBlock) }
    : l

/** Fichier d'une fiche seule */
export const createLessonFile = (l: Lesson) =>
  JSON.stringify({ format: LESSON_FORMAT, fiche: withoutKeys(l) }, null, 2)

/**
 * Fiche lue d'un fichier : une fiche seule (`fiche-mathalea/1`), ou la fiche
 * collée telle qu'elle figure dans un parcours ; sinon une erreur lisible.
 */
export function readLessonFile(text: string): Lesson {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Ce fichier n’est pas du JSON valide.')
  }
  const lesson = isObject(raw) && raw.format === LESSON_FORMAT ? raw.fiche : raw
  if (!isObject(lesson) || !Array.isArray(lesson.blocs))
    throw new Error('Ce fichier n’est pas une fiche de cours MathALÉA.')
  if (!isLesson(lesson)) {
    const problems = isString(lesson.titre)
      ? lessonProblems(lesson as unknown as Lesson).slice(0, 3)
      : []
    throw new Error(
      `Cette fiche est mal formée${problems.length ? ` : ${problems.join(' ')}` : '.'}`,
    )
  }
  return lesson
}

/** Nom du fichier d'une fiche : « fiche-calculer-une-integrale.json » */
export function lessonFileName(l: Lesson) {
  const base = l.titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  return `fiche-${base || 'sans-titre'}.json`
}
