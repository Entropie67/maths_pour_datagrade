import { buildNormalUrl } from './statsUrl'

/** Reconnaît les métadonnées, y compris celles d'une sélection sans exercice. */
function hasStatsMetadata(url: URL): boolean {
  for (const [key, value] of url.searchParams) {
    if (!/^_mathaleaStats_*$/.test(key)) continue
    try {
      const metadata: unknown = JSON.parse(value)
      if (
        typeof metadata === 'object' &&
        metadata !== null &&
        'version' in metadata &&
        metadata.version === 1
      ) {
        return true
      }
    } catch {
      // Une clé similaire dans une URL normale peut contenir du texte libre.
    }
  }
  return false
}

/**
 * Rétablit un lien ouvert depuis Matomo avant la lecture des paramètres et
 * l'initialisation des trackers. N'ajoute aucune entrée à l'historique.
 * Les liens statistiques invalides sont rejetés par buildNormalUrl().
 */
export function restoreStatsUrl(): boolean {
  const url = new URL(window.location.href)
  // Une URL normale peut elle-même contenir des clés uuids/_mathaleaStats.
  if (url.searchParams.has('uuid')) return false
  if (!url.searchParams.has('uuids') && !hasStatsMetadata(url)) return false

  const normalUrl = buildNormalUrl(url.href)
  window.history.replaceState(window.history.state, '', normalUrl)
  return true
}
