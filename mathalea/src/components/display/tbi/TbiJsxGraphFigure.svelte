<script lang="ts">
  import { onMount } from 'svelte'
  import {
    jsxGraphSrcdoc,
    type TbiFigureContent,
  } from '../../../lib/tbiTextContent'

  interface Props {
    figure: TbiFigureContent
    /** Déplacement du visualiseur en cours : l'iframe ne capte pas le pointeur */
    isGesturing: boolean
  }

  let { figure, isGesturing }: Props = $props()

  let srcdoc = $state('')
  let errorMessage = $state('')

  onMount(() => {
    let isDestroyed = false
    void (async () => {
      try {
        // bibliothèque auto-hébergée, chargée à la demande. Le chemin passe par
        // `node_modules` car le champ `exports` du paquet n'expose pas `distrib`.
        const [core, css] = await Promise.all([
          import('../../../../node_modules/jsxgraph/distrib/jsxgraphcore.js?url'),
          import('../../../../node_modules/jsxgraph/distrib/jsxgraph.css?raw'),
        ])
        if (isDestroyed) return
        srcdoc = jsxGraphSrcdoc(figure, {
          coreUrl: new URL(core.default, window.location.href).href,
          css: css.default,
        })
      } catch (error) {
        console.error('Chargement de JSXGraph impossible', error)
        errorMessage =
          'JSXGraph ne peut pas être chargé : vérifier la connexion.'
      }
    })()
    return () => {
      isDestroyed = true
    }
  })
</script>

<div class="relative flex-1 min-h-0 bg-white overflow-hidden">
  {#if errorMessage}
    <p
      class="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center text-sm text-coopmaths-warn-dark"
    >
      {errorMessage}
    </p>
  {:else if srcdoc}
    <!-- `allow-scripts` seul : le code de la figure n'a aucun accès à la page -->
    <iframe
      sandbox="allow-scripts"
      {srcdoc}
      title={figure.name}
      referrerpolicy="no-referrer"
      class="block w-full h-full border-0 {isGesturing
        ? 'pointer-events-none'
        : ''}"
    ></iframe>
  {/if}
</div>
