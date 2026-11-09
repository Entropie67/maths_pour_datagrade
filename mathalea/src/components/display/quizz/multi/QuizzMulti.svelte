<script lang="ts">
  import { get } from 'svelte/store'
  import { globalOptions } from '../../../../lib/stores/globalOptions'
  import QuizzMultiManager from './QuizzMultiManager.svelte'
  import QuizzMultiPlayer from './QuizzMultiPlayer.svelte'

  /**
   * Entrée du mode multi-joueurs (V2) : répartit vers le parcours manager
   * (enseignant) ou joueur (élève) selon le rôle porté par l'URL.
   * Un lien multi sans rôle explicite correspond au parcours de création
   * (manager) — le seul accessible depuis l'écran de réglages ; les liens de
   * jointure générés par le lobby portent quizzRole=player.
   */
  const role = get(globalOptions).quizzRole ?? 'manager'
</script>

{#if role === 'player'}
  <QuizzMultiPlayer />
{:else}
  <QuizzMultiManager />
{/if}
