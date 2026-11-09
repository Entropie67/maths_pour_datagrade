import { createURL } from '../createURL'
import {
  defaultTbiState,
  encodeTbiParam,
  getTbiSharedState,
} from '../stores/tbiStore'
import {
  parseTbiLink,
  viewerContentTitle,
  type TbiViewerContent,
} from '../tbiLink'
import { readSavedTextContent } from '../tbiTextContent'
import type { InterfaceParams } from '../types'
import {
  isSessionState,
  sessionExercises,
  SESSION_STATE_TYPE,
  SESSION_URL_PARAM,
  type SavedSession,
  type SessionState,
} from './library'

/**
 * Lien qui rouvre une séance de « Mes séances au vidéoprojecteur » dans la vue
 * TBI : exercices (avec leurs graines) dans l'URL, comme la vue TBI les
 * écrit, et le paramètre `seance` qui relie la vue à la séance enregistrée.
 * Les réglages d'affichage (`shared`, `layout`…) ne sont pas dans le lien :
 * la vue TBI les relit dans la séance (voir `Tbi.svelte`).
 * @param session séance enregistrée
 */
export function sessionUrl(session: SavedSession): URL {
  const url = createURL(session.state.exercices as InterfaceParams[])
  url.searchParams.set('v', 'tbi')
  url.searchParams.set(SESSION_URL_PARAM, session.id)
  return url
}

/**
 * Lien à partager qui ouvre la séance dans la vue TBI d'un autre navigateur :
 * exercices (avec leurs graines) et réglages partageables (`tbiParam` : mode de
 * page, colonnes, onglets, zoom, corrections, widgets), sans `seance`, qui
 * n'existe que dans la bibliothèque de ce navigateur. Les positions du mode
 * libre, propres à l'écran, n'y sont pas.
 * @param session séance enregistrée
 */
export function sessionShareUrl(session: SavedSession): URL {
  const url = createURL(session.state.exercices as InterfaceParams[])
  url.searchParams.set('v', 'tbi')
  // un état ancien peut ne pas avoir tous les champs : ceux de la vue par défaut
  const shared = {
    ...getTbiSharedState(defaultTbiState(), []),
    ...(typeof session.state.shared === 'object' ? session.state.shared : {}),
  }
  const tbiParam = encodeTbiParam(shared)
  if (tbiParam !== '') url.searchParams.set('tbiParam', tbiParam)
  return url
}

/**
 * Un fichier JSON est-il un fichier de réglages de la vue TBI (ancien
 * téléchargement du bouton « Sauvegarder » de la vue) ?
 * @param data contenu du fichier, déjà passé par `JSON.parse`
 */
export function isTbiSettingsData(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === SESSION_STATE_TYPE
  )
}

/**
 * Fait d'un fichier de réglages de la vue TBI l'état d'une séance.
 * @returns l'état, ou une explication si le fichier ne peut pas devenir une séance
 */
export function readTbiSettings(
  data: unknown,
): { state: SessionState } | { error: string } {
  if (!isTbiSettingsData(data)) {
    return {
      error: 'Ce fichier n’est pas un fichier de réglages de la vue TBI.',
    }
  }
  if (!isSessionState(data)) {
    return {
      error:
        'Ce fichier ne contient pas la liste des exercices (il a été sauvegardé avec une ancienne version de la vue TBI) : il ne peut pas être importé.',
    }
  }
  return { state: data }
}

/**
 * Nom proposé pour une nouvelle séance : ses premiers exercices, ou à défaut
 * ses premiers documents, vidéos, notes et figures
 */
export function defaultSessionName(state: SessionState): string {
  const exercises = sessionExercises(state)
  const refs =
    exercises.length > 0
      ? exercises
      : sessionViewers(state).map(viewerContentTitle)
  const shown = refs.slice(0, 3).join(', ')
  return refs.length === 0
    ? 'Séance sans titre'
    : `Séance ${shown}${refs.length > 3 ? '…' : ''}`
}

const MODE_LABELS: Record<string, string> = {
  columns: 'colonnes',
  free: 'placement libre',
  tabs: 'onglets',
}

/** Contenus enregistrés d'une séance (visualiseurs : liens, notes, figures) */
function sessionViewers(state: SessionState): TbiViewerContent[] {
  if (!Array.isArray(state.documents)) return []
  return state.documents.flatMap((document: unknown) => {
    const { url, content } = (document ?? {}) as {
      url?: unknown
      content?: unknown
    }
    const viewer =
      content !== undefined
        ? readSavedTextContent(content)
        : typeof url === 'string'
          ? parseTbiLink(url)
          : null
    return viewer === null ? [] : [viewer]
  })
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count > 1 ? 's' : ''}`
}

/**
 * Résumé de l'affichage d'une séance (mode de page, widgets, documents, vidéos,
 * notes et figures), pour la liste
 */
export function describeSession(state: SessionState): string[] {
  const shared = (
    typeof state.shared === 'object' && state.shared !== null
      ? state.shared
      : {}
  ) as Record<string, unknown>
  const parts: string[] = []
  const mode = typeof shared.mode === 'string' ? MODE_LABELS[shared.mode] : ''
  if (mode) parts.push(`Affichage en ${mode}`)
  const toolLabels: Record<string, string> = {
    clock: 'horloge',
    trafficLight: 'feu tricolore',
    studentPicker: 'tirage au sort',
    calculette: 'calculette',
    college: 'calculatrice collège',
    lycee: 'calculatrice lycée',
  }
  const tools = Array.isArray(shared.tools)
    ? (shared.tools as { kind?: string }[]).flatMap((tool) => {
        const label = toolLabels[tool?.kind ?? '']
        return label ? [label] : []
      })
    : []
  const widgets = [
    ['widgetVisible', 'horloge'],
    ['trafficLightVisible', 'feu tricolore'],
    ['studentPickerVisible', 'tirage au sort'],
    ['calculetteVisible', 'calculette'],
    ['collegeCalculatorVisible', 'calculatrice collège'],
    ['lyceeCalculatorVisible', 'calculatrice lycée'],
  ]
    .filter(([key]) => shared[key] === true)
    .map(([, label]) => label)
  const allTools = [...new Set([...widgets, ...tools])]
  if (allTools.length > 0) parts.push(allTools.join(', '))
  const boards = Array.isArray(shared.boards)
    ? shared.boards.filter((board) => board !== null).length
    : 0
  if (boards > 0) parts.push(boards > 1 ? `${boards} tableaux` : '1 tableau')
  const viewers = sessionViewers(state)
  const isGeogebra = (viewer: TbiViewerContent) =>
    viewer.type === 'video' && viewer.video.provider === 'geogebra'
  const count = (test: (viewer: TbiViewerContent) => boolean) =>
    viewers.filter(test).length
  const videos = count((v) => v.type === 'video' && !isGeogebra(v))
  const documents = count((v) => v.type === 'link')
  const notes = count((v) => v.type === 'markdown')
  const figures = count((v) => v.type === 'figure' || isGeogebra(v))
  const media = [
    videos > 0 ? plural(videos, 'vidéo') : '',
    documents > 0 ? plural(documents, 'document') : '',
    notes > 0 ? plural(notes, 'note') : '',
    figures > 0 ? plural(figures, 'figure') : '',
  ].filter(Boolean)
  if (media.length > 0) parts.push(media.join(', '))
  return parts
}
