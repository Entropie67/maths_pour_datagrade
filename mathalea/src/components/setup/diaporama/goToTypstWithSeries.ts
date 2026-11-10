import { get } from 'svelte/store'
import { defaultTypstDocumentOptions } from '../typst/buildTypstDocument'
import { typstParamStore } from '../../../lib/stores/generalStore'
import { globalOptions } from '../../../lib/stores/globalOptions'
import { encodeBase64 } from '../latex/LatexConfig'

/** Envoie vers la vue Typst avec autant de séries que de vues du diaporama,
 * pour que l'enseignant puisse imprimer sujets et corrigés des différentes
 * vues, en respectant les graines aléatoires déjà tirées par le diaporama. */
export function goToTypstWithSeries() {
  const nbVersions = Math.min(4, Math.max(1, get(globalOptions).nbVues ?? 1))
  const encoded = encodeBase64({
    options: {
      ...defaultTypstDocumentOptions,
      nbVersions,
    },
  })
  const url = new URL(window.location.href)
  url.searchParams.set('typstParam', encoded)
  history.replaceState(null, '', url)
  typstParamStore.set(encoded)
  globalOptions.update((options) => {
    options.v = 'typst'
    return options
  })
}
