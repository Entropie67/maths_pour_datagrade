<script lang="ts">
  import type { InterfaceGlobalOptions } from '../../../../lib/types'
  import type { CanOptions } from '../../../../lib/types/can'
  import ReglagesAffichage from './ReglagesAffichage.svelte'
  import ReglagesCalculatrices from './ReglagesCalculatrices.svelte'
  import ReglagesCorrection from './ReglagesCorrection.svelte'
  import ReglagesInteractivite from './ReglagesInteractivite.svelte'
  import ReglagesPresentation from './ReglagesPresentation.svelte'
  import type { ReglagesEleveMode } from './types'

  export let globalOptions: InterfaceGlobalOptions
  export let canOptions: CanOptions
  export let mode: ReglagesEleveMode = 'lien'
  /** Appelé après chaque bascule de l'affichage des titres ou des références */
  export let onAffichageToggle: () => void = () => {}
</script>

<!-- Sous Capytale, la présentation est imposée (une page par exercice) -->
<div
  class="pt-2 px-4 grid grid-flow-row gap-4 {mode === 'lien'
    ? 'md:grid-cols-3'
    : 'md:grid-cols-2'}"
>
  {#if mode === 'lien'}
    <ReglagesPresentation bind:globalOptions />
  {/if}
  <ReglagesInteractivite bind:globalOptions {canOptions} {mode} />
  <ReglagesCalculatrices bind:globalOptions />
  <ReglagesCorrection bind:globalOptions {canOptions} {mode} />
</div>
<div class="pt-2 px-4 grid grid-flow-row md:grid-cols-2 gap-4">
  <ReglagesAffichage bind:globalOptions onToggle={onAffichageToggle} />
</div>
