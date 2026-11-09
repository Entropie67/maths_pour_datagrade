<script lang="ts">
  import { onMount } from 'svelte'
  import type { TbiCalculatorKind } from '../../../lib/stores/tbiToolsStore'
  import Calculette from './Calculette.svelte'

  /**
   * Contenu d'une calculatrice, dans le cadre commun des outils.
   *
   * Les émulateurs NumWorks (pages statiques dans public/calculators/) sont
   * des pages autonomes : le gabarit (image, clavier, mise en page) est servi
   * localement et le firmware WASM est chargé depuis le CDN NumWorks
   * (scandium pour le modèle scientifique collège, epsilon pour le modèle
   * graphique lycée). Leur barre d'actions (capture d'écran, plein écran,
   * partage) a été masquée par CSS à la source : ce widget n'expose que
   * l'écran et le clavier de la calculatrice.
   *
   * La « calculette » MathALÉA, très basique, n'a pas de page : elle est
   * rendue directement par le composant Calculette (pas d'`src`).
   */
  interface Props {
    kind: TbiCalculatorKind
    /** Une iframe ne doit pas capter le pointeur pendant un geste */
    isGesturing?: boolean
    /** Signalement statistique de l'ouverture */
    onOpen?: (kind: TbiCalculatorKind) => void
  }

  let { kind, isGesturing = false, onOpen }: Props = $props()

  const sources: Partial<Record<TbiCalculatorKind, string>> = {
    college: `${import.meta.env.BASE_URL}calculators/numworks-scientific.html`,
    lycee: `${import.meta.env.BASE_URL}calculators/numworks-graphing.html`,
  }

  /**
   * L'iframe ne déclenche pas d'événement d'erreur exploitable en cas de
   * 404 : certains serveurs (dont le serveur de dev Vite) répondent 200 en
   * servant index.html à la place du fichier manquant. On vérifie donc le
   * contenu de la réponse plutôt que son seul statut HTTP.
   */
  let fileAvailable: boolean | null = $state(null)

  onMount(async () => {
    onOpen?.(kind)
    const src = sources[kind]
    if (src === undefined) return
    try {
      const response = await fetch(src)
      const text = response.ok ? await response.text() : ''
      fileAvailable = response.ok && !text.includes('id="appMathalea"')
    } catch {
      fileAvailable = false
    }
  })
</script>

<div class="w-full h-full {isGesturing ? 'pointer-events-none' : ''}">
  {#if sources[kind] === undefined}
    <Calculette />
  {:else if fileAvailable === false}
    <div
      class="w-full h-full flex items-center justify-center text-center p-4 text-sm"
    >
      Fichier manquant pour la calculatrice
    </div>
  {:else}
    <iframe
      src={sources[kind]}
      title="Calculatrice"
      class="w-full h-full border-0 block"
    ></iframe>
  {/if}
</div>
