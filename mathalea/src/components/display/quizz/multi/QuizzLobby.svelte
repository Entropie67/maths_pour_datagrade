<script lang="ts">
  import { buildQuizzJoinUrl } from '../../../../lib/quizz/buildQuizzUrl'
  import type { QuizzPlayer } from '../../../../modules/quizz/types'
  import ButtonActionInfo from '../../../shared/forms/ButtonActionInfo.svelte'
  import ButtonQRCode from '../../../shared/forms/ButtonQRCode.svelte'

  /**
   * Lobby du manager (multi-joueurs) : PIN de la room, lien et QR-code de
   * jointure pour les élèves, liste des joueurs entrés (avec exclusion),
   * et bouton de lancement (inactif tant qu'aucun joueur n'est là).
   */
  export let inviteCode: string
  export let players: QuizzPlayer[]
  export let subject: string
  export let onStart: () => void
  export let onKick: (playerId: string) => void

  $: joinUrl = buildQuizzJoinUrl(inviteCode).toString()
  // PIN affiché en deux groupes de trois chiffres pour la dictée au tableau.
  $: pinDisplay =
    inviteCode.length === 6
      ? `${inviteCode.slice(0, 3)} ${inviteCode.slice(3)}`
      : inviteCode
</script>

<div
  class="flex flex-col items-center justify-center gap-8 px-6 w-full max-w-4xl"
>
  <h1
    class="quizz-text-title font-extrabold text-center
    text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    {subject}
  </h1>

  <div
    class="flex flex-col items-center gap-4 shadow-xl px-10 py-6
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <div
      class="text-lg font-semibold
      text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
    >
      Les élèves rejoignent la partie avec le code
    </div>
    <div
      class="text-6xl md:text-7xl font-extrabold tracking-widest
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {pinDisplay}
    </div>
    <div class="flex flex-row items-center gap-6">
      <div class="flex flex-col items-center gap-1">
        <ButtonActionInfo
          action="copy"
          textToCopy={joinUrl}
          tooltip="Lien de jointure pour les élèves"
          icon={'bx-link text-2xl'}
          messageSuccess="Le lien de jointure est copié dans le presse-papier !"
          messageError="Impossible de copier le lien dans le presse-papier !"
        />
        <span
          class="text-xs font-light
          text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
        >
          Lien
        </span>
      </div>
      <div class="flex flex-col items-center gap-1">
        <ButtonQRCode tooltip="QR-code de jointure" customUrl={joinUrl} />
        <span
          class="text-xs font-light
          text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
        >
          QR-code
        </span>
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center gap-3 w-full">
    <div
      class="text-lg font-semibold
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {players.length} joueur{players.length > 1 ? 's' : ''} dans la salle
    </div>
    {#if players.length === 0}
      <div
        class="font-light italic
        text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
      >
        En attente des joueurs…
      </div>
    {:else}
      <div class="flex flex-row flex-wrap justify-center gap-2 max-w-3xl">
        {#each players as player (player.id)}
          <span
            class="flex items-center gap-2 shadow px-4 py-1.5
            text-lg font-semibold
            bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
            text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            {player.username}
            <button
              type="button"
              class="flex items-center justify-center h-6 w-6 rounded-full
              text-coopmaths-corpus/40 hover:text-coopmaths-action
              dark:text-coopmathsdark-corpus/40 dark:hover:text-coopmathsdark-action"
              title="Exclure {player.username}"
              aria-label="Exclure {player.username}"
              on:click={() => onKick(player.id)}
            >
              <i class="bx bx-x text-xl"></i>
            </button>
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <button
    type="button"
    class="px-8 py-4 text-2xl font-extrabold shadow-xl
    text-coopmaths-canvas bg-coopmaths-action
    hover:bg-coopmaths-action-lightest
    dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest
    dark:text-coopmathsdark-canvas
    disabled:opacity-40 disabled:cursor-not-allowed"
    disabled={players.length === 0}
    on:click={onStart}
  >
    Lancer la partie
  </button>
</div>
