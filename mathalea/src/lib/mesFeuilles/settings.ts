import {
  emptyPreferences,
  hasPreferences,
  loadPreferences,
  mergePreferences,
  readPreferences,
  stableStringify,
  updatePreferences,
  type MergeOptions,
  type Preferences,
} from './preferences'
import {
  emptyParcoursSettings,
  hasParcours,
  loadParcoursSettings,
  mergeParcours,
  parcoursContent,
  readParcoursSettings,
  saveParcoursSettings,
  type ParcoursSettings,
} from './parcoursSettings'
import {
  loadSlideshowDeletions,
  loadSlideshowHistory,
  mergeSlideshowHistory,
  readSlideshowEntries,
  saveSlideshowHistory,
  type SlideshowHistoryEntry,
} from './slideshowHistory'
import {
  emptyStudentClasses,
  hasStudentClasses,
  loadStudentClasses,
  mergeStudentClasses,
  readStudentClasses,
  saveStudentClasses,
  studentClassesContent,
  type StudentClasses,
} from './studentClasses'
import { readTombstones, type Tombstone } from './tombstones'
import {
  emptyEdurlToken,
  hasEdurlToken,
  loadEdurlToken,
  mergeEdurlToken,
  readEdurlToken,
  saveEdurlToken,
  type EdurlToken,
} from '../edurl/token'

/**
 * Réglages repris dans le fichier `.mathalea`, à côté des feuilles et des
 * sélections : réglages du lien élève, modèles de la vue Impression,
 * historique des diaporamas, parcours de l'application, jeton edurl.fr et
 * classes du tirage au sort de la vue TBI. Tous sont dans `localStorage`.
 */
export interface LibrarySettings {
  preferences: Preferences
  slideshowHistory: SlideshowHistoryEntry[]
  /** Pierres tombales des diaporamas supprimés (signatures) */
  deletedSlideshows: Tombstone[]
  /** Bibliothèque de la vue Parcours, avec les pierres tombales des parcours supprimés */
  parcours: ParcoursSettings
  /**
   * Jeton d'accès à edurl.fr : dans le fichier, mais jamais envoyé au serveur
   * de synchronisation (c'est un secret, voir `buildSyncFile`)
   */
  edurlToken: EdurlToken
  /** Classes du tirage au sort de la vue TBI */
  classes: StudentClasses
}

export function emptySettings(): LibrarySettings {
  return {
    preferences: emptyPreferences(),
    slideshowHistory: [],
    deletedSlideshows: [],
    parcours: emptyParcoursSettings(),
    edurlToken: emptyEdurlToken(),
    classes: emptyStudentClasses(),
  }
}

export function loadSettings(): LibrarySettings {
  return {
    preferences: loadPreferences(),
    slideshowHistory: loadSlideshowHistory(),
    deletedSlideshows: loadSlideshowDeletions(),
    parcours: loadParcoursSettings(),
    edurlToken: loadEdurlToken(),
    classes: loadStudentClasses(),
  }
}

export function hasSettings(settings: LibrarySettings): boolean {
  return (
    hasPreferences(settings.preferences) ||
    settings.slideshowHistory.length > 0 ||
    hasParcours(settings.parcours) ||
    hasStudentClasses(settings.classes)
  )
}

/**
 * Il y a un jeton edurl.fr à écrire dans le fichier. Il n'entre pas dans
 * `hasSettings` : la synchronisation ne l'emporte pas, et un navigateur qui
 * n'a qu'un jeton n'a rien à synchroniser.
 */
export function hasSecretSettings(settings: LibrarySettings): boolean {
  return hasEdurlToken(settings.edurlToken)
}

/** Les mêmes réglages, sans ce qui ne doit pas quitter l'appareil (jeton edurl.fr) */
export function withoutSecrets(settings: LibrarySettings): LibrarySettings {
  return { ...settings, edurlToken: emptyEdurlToken() }
}

/** Des modèles, des diaporamas ou des parcours ont été supprimés (pierres tombales) */
export function hasSettingsDeletions(settings: LibrarySettings): boolean {
  return (
    settings.preferences.deleted.length > 0 ||
    settings.deletedSlideshows.length > 0 ||
    settings.parcours.deleted.length > 0
  )
}

/** Réglages lus dans un fichier, `null` s'il n'en a pas */
export function readSettings(value: unknown): LibrarySettings | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  const record = value as Record<string, unknown>
  return {
    preferences: readPreferences(record.preferences),
    slideshowHistory: readSlideshowEntries(record.slideshowHistory),
    deletedSlideshows: readTombstones(record.deletedSlideshows),
    parcours: readParcoursSettings(record.parcours),
    edurlToken: readEdurlToken(record.edurlToken),
    classes: readStudentClasses(record.classes),
  }
}

/**
 * Empreinte des réglages, pour l'état de la sauvegarde : elle change quand
 * un réglage change, pas quand un diaporama est seulement relancé
 * (`lastUsedAt`). Vide s'il n'y a aucun réglage, ni réglage supprimé.
 */
export function settingsFingerprint(settings: LibrarySettings): string {
  if (
    !hasSettings(settings) &&
    !hasSettingsDeletions(settings) &&
    !hasSecretSettings(settings)
  ) {
    return ''
  }
  const text = stableStringify({
    preferences: settings.preferences,
    slideshowHistory: settings.slideshowHistory.map((item) => ({
      id: item.id,
      title: item.title,
      signature: item.signature,
    })),
    deletedSlideshows: settings.deletedSlideshows.map((t) => t.id),
    // ajoutés seulement s'il y en a : l'empreinte des autres réglages ne change pas
    ...(hasParcours(settings.parcours)
      ? { parcours: parcoursContent(settings.parcours) }
      : {}),
    ...(settings.parcours.deleted.length > 0
      ? { deletedParcours: settings.parcours.deleted.map((t) => t.id) }
      : {}),
    // ajouté seulement s'il y en a un : l'empreinte des autres réglages ne change pas
    ...(hasSecretSettings(settings) ? { edurlToken: settings.edurlToken } : {}),
    // ajoutées seulement s'il y en a : l'empreinte des autres réglages ne change pas
    ...(hasStudentClasses(settings.classes)
      ? { classes: studentClassesContent(settings.classes) }
      : {}),
  })
  // FNV-1a sur 32 bits : il ne s'agit que de détecter un changement
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return `${text.length}-${(hash >>> 0).toString(36)}`
}

/**
 * Le fichier contient déjà tout ce que ce navigateur a comme réglages. Après
 * un import, les empreintes ne se comparent pas : l'import garde les
 * identifiants locaux et ne reprend pas les suppressions du fichier. Ce qui
 * compte, c'est que ce navigateur n'ait rien à ajouter au fichier.
 */
export function settingsCoveredBy(
  file: LibrarySettings,
  local: LibrarySettings,
): boolean {
  return (
    settingsFingerprint(mergeSettings(file, local).settings) ===
    settingsFingerprint(file)
  )
}

export interface SettingsMergeResult {
  settings: LibrarySettings
  /** Réglages ajoutés, remplacés ou supprimés, diaporamas et parcours compris */
  imported: number
}

/**
 * Fusionne des réglages importés (rien n'est effacé) ou synchronisés (les
 * suppressions s'appliquent), voir `MergeOptions`.
 */
export function mergeSettings(
  local: LibrarySettings,
  imported: LibrarySettings,
  options: MergeOptions = {},
): SettingsMergeResult {
  const preferences = mergePreferences(
    local.preferences,
    imported.preferences,
    options,
  )
  const history = mergeSlideshowHistory(
    local.slideshowHistory,
    imported.slideshowHistory,
    {
      ...options,
      currentDeleted: local.deletedSlideshows,
      importedDeleted: imported.deletedSlideshows,
    },
  )
  const parcours = mergeParcours(local.parcours, imported.parcours, options)
  // en synchronisation, le jeton reste celui de l'appareil
  const edurlToken = options.sync
    ? { token: local.edurlToken, imported: 0 }
    : mergeEdurlToken(local.edurlToken, imported.edurlToken)
  const classes = mergeStudentClasses(local.classes, imported.classes)
  return {
    settings: {
      preferences: preferences.preferences,
      slideshowHistory: history.items,
      deletedSlideshows: history.deleted,
      parcours: parcours.parcours,
      edurlToken: edurlToken.token,
      classes: classes.classes,
    },
    imported:
      preferences.imported +
      history.added +
      history.updated +
      history.removed +
      parcours.imported +
      edurlToken.imported +
      classes.imported,
  }
}

/**
 * Fusionne des réglages importés dans ceux de ce navigateur.
 * @returns le nombre de réglages ajoutés ou remplacés
 */
export function importSettings(imported: LibrarySettings): number {
  const result = mergeSettings(loadSettings(), imported)
  if (result.imported === 0) return 0
  saveLibrarySettings(result.settings)
  return result.imported
}

/** Enregistre des réglages fusionnés, pierres tombales comprises */
export function saveLibrarySettings(settings: LibrarySettings): void {
  updatePreferences(() => settings.preferences)
  saveSlideshowHistory(settings.slideshowHistory, settings.deletedSlideshows)
  saveParcoursSettings(settings.parcours)
  if (settings.edurlToken.updatedAt !== loadEdurlToken().updatedAt) {
    saveEdurlToken(settings.edurlToken)
  }
  saveStudentClasses(settings.classes)
}
