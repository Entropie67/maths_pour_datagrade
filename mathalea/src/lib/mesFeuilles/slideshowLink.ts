import { formatDsParams } from '../components/buildDsParams'
import { createURL } from '../createURL'
import type { SlideshowHistoryEntry } from './slideshowHistory'

/**
 * Lien qui rouvre un diaporama de l'historique dans ses réglages : exercices
 * (avec leurs graines) dans l'URL, comme la vue Diaporama l'écrit
 * (`appendGlobalOptionsToURL`).
 * @param entry diaporama de l'historique
 */
export function slideshowUrl(entry: SlideshowHistoryEntry): URL {
  const { options, exercicesParams } = entry
  const url = createURL(exercicesParams)
  url.searchParams.set('v', 'diaporama')
  url.searchParams.set('ds', formatDsParams(options))
  if (options.durationGlobal) {
    url.searchParams.set('dGlobal', options.durationGlobal.toString())
  }
  if (options.durationCorrection) {
    url.searchParams.set('dCorr', options.durationCorrection.toString())
  }
  const select = options.select ?? []
  if (select.length > 0 && select.length < exercicesParams.length) {
    url.searchParams.set('select', select.join('-'))
  }
  if ((options.order ?? []).length > 0 && options.shuffle) {
    url.searchParams.set('order', (options.order ?? []).join('-'))
  }
  return url
}
