<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { QuizzMultiPlayerSession } from '../../../../lib/quizz/multiPlayerSession'
  import { darkMode } from '../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../lib/stores/globalOptions'
  import { quizzProgress, quizzStatus } from '../../../../lib/stores/quizzStore'
  import {
    QUIZZ_STATUS,
    type QuizzBackgroundParam,
  } from '../../../../modules/quizz/types'
  import QuizzBackground from '../presentationalComponents/QuizzBackground.svelte'
  import { fitQuizzContent } from '../quizzRender'
  import QuizzControls from '../presentationalComponents/QuizzControls.svelte'
  import { QuizzSounds } from '../quizzSounds'
  import QuizzMultiStage from './QuizzMultiStage.svelte'

  /**
   * Parcours du joueur (élève) en mode multi-joueurs : saisie du PIN (ou
   * jointure automatique via le lien) → saisie du pseudo → écran d'attente →
   * jeu (les layouts existants consomment les statuts du serveur).
   *
   * Le protocole est tenu par {@link QuizzMultiPlayerSession} ; ce composant
   * ne fait que le rendu des étapes et l'habillage sonore.
   */

  const options = get(globalOptions)
  const background: QuizzBackgroundParam = { mode: 'none' }

  const session = new QuizzMultiPlayerSession({
    pin:
      options.pin != null && options.pin.length > 0 ? options.pin : undefined,
    reconnectGameId:
      options.quizzRole === 'player' &&
      options.gameId != null &&
      options.gameId.length > 0
        ? options.gameId
        : undefined,
    onPin: (pin) => {
      globalOptions.update((current) => {
        current.pin = pin ?? undefined
        return current
      })
    },
    onGameId: (gameId) => {
      globalOptions.update((current) => {
        current.gameId = gameId ?? undefined
        return current
      })
    },
  })
  const {
    step,
    lastError,
    endMessage,
    myPlayer,
    usernameMode,
    sound: roomSound,
    connectionLost,
  } = session

  let sounds: QuizzSounds | null = null
  let soundOn = true
  let onImage = false
  let pinInput = ''
  let usernameInput = ''
  let unsubscribeSounds: (() => void) | null = null
  let unsubscribeStatusSounds: (() => void) | null = null
  let mainEl: HTMLElement
  let cleanupFit: (() => void) | null = null

  async function init() {
    sounds = new QuizzSounds(soundOn)
    await session.init()
    wireSounds()
  }

  /** Habillage sonore : même mapping statut → son qu'en V1. */
  function wireSounds() {
    unsubscribeStatusSounds = session.onGameStatus((message) => {
      switch (message.name) {
        case QUIZZ_STATUS.SHOW_QUESTION:
          sounds?.play('show')
          break
        case QUIZZ_STATUS.SELECT_ANSWER:
          sounds?.startMusic()
          break
        case QUIZZ_STATUS.SHOW_RESULT:
          sounds?.stopMusic()
          sounds?.play('results')
          break
        case QUIZZ_STATUS.FINISHED:
          sounds?.stopMusic()
          sounds?.play('first')
          break
      }
    })
    unsubscribeSounds = session.onGameEvent((event) => {
      if (event === 'game:cooldown') {
        if ($quizzStatus?.name === QUIZZ_STATUS.SHOW_START)
          sounds?.play('boump')
      } else if (event === 'game:startCooldown') {
        sounds?.play('boump')
      }
    })
  }

  function toggleSound() {
    soundOn = !soundOn
    sounds?.setEnabled(soundOn)
  }

  // Réglage sonore de la room, reçu à la jointure (game:successRoom) :
  // état initial du bouton son, qui reste ensuite propre à l'appareil.
  $: applyRoomSound($roomSound)
  function applyRoomSound(value: boolean) {
    soundOn = value
    sounds?.setEnabled(value)
  }

  function goHome() {
    globalOptions.update((current) => {
      current.v = ''
      current.quizzRole = undefined
      current.pin = undefined
      current.gameId = undefined
      return current
    })
  }

  function quit() {
    if (get(step) === 'game') {
      if (!window.confirm('Quitter la partie ?')) return
      session.leave()
    }
    goHome()
  }

  function submitPin() {
    session.submitPin(pinInput)
  }

  function submitUsername() {
    if (usernameInput.trim().length === 0) return
    session.submitUsername(usernameInput)
  }

  // Effacement automatique des erreurs transitoires.
  let errorTimer: ReturnType<typeof setTimeout> | null = null
  $: if ($lastError != null) {
    if (errorTimer != null) clearTimeout(errorTimer)
    const message = $lastError
    errorTimer = setTimeout(() => {
      if (get(lastError) === message) lastError.set(null)
    }, 8000)
  }

  onMount(() => {
    void init()
    // Ajustement « shrink-to-fit » du contenu (texte + figures) à la fenêtre
    cleanupFit = fitQuizzContent(mainEl)
  })

  onDestroy(() => {
    cleanupFit?.()
    unsubscribeSounds?.()
    unsubscribeStatusSounds?.()
    session.dispose()
    sounds?.stopMusic()
    sounds = null
    if (errorTimer != null) clearTimeout(errorTimer)
  })
</script>

<main
  bind:this={mainEl}
  class="{$darkMode.isActive
    ? 'dark'
    : ''} quizz-container relative flex flex-col min-h-screen items-center justify-center
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <QuizzBackground
    {background}
    questionIndex={$quizzProgress.current}
    onImageChange={(value) => (onImage = value)}
  />

  {#if $myPlayer != null && $step === 'game' && $quizzStatus?.name !== 'FINISHED'}
    <div
      class="fixed top-4 right-4 z-20 px-3 py-1 text-sm font-bold shadow
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {$myPlayer.username} — {$myPlayer.points} point{$myPlayer.points > 1
        ? 's'
        : ''}
    </div>
  {/if}

  {#if $quizzProgress.total > 0 && $step === 'game' && $quizzStatus?.name !== 'FINISHED'}
    <div
      class="fixed top-4 left-4 z-20 px-3 py-1 text-sm font-bold shadow
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Question {$quizzProgress.current} / {$quizzProgress.total}
    </div>
  {/if}

  {#if $connectionLost}
    <div
      class="fixed top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 text-sm font-bold shadow
      bg-amber-600 text-white"
    >
      Connexion perdue, reconnexion en cours…
    </div>
  {/if}

  {#if $step === 'connecting' || $step === 'joining'}
    <div
      class="text-xl font-semibold
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {$step === 'connecting'
        ? 'Connexion au serveur de jeu…'
        : 'Connexion à la partie…'}
    </div>
  {:else if $step === 'error'}
    <div class="flex flex-col items-center gap-6 px-6 text-center">
      <p
        class="text-xl font-semibold
        text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        {$lastError ?? 'Une erreur est survenue.'}
      </p>
      <button
        type="button"
        class="px-4 py-2 font-bold shadow
        text-coopmaths-canvas bg-coopmaths-action
        hover:bg-coopmaths-action-lightest
        dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
        on:click={goHome}
      >
        Retour à l'accueil
      </button>
    </div>
  {:else if $step === 'pin'}
    <div
      class="flex flex-col items-center gap-6 shadow-xl px-10 py-8 mx-6
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas max-w-xl"
    >
      <h1
        class="text-2xl font-extrabold text-center
        text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        Rejoindre le quizz
      </h1>
      <form
        class="flex flex-col items-center gap-4 w-full"
        on:submit|preventDefault={submitPin}
      >
        <input
          type="text"
          bind:value={pinInput}
          placeholder="Code à 6 chiffres"
          inputmode="numeric"
          maxlength="6"
          autocomplete="off"
          class="w-56 px-4 py-3 border-2 text-3xl text-center tracking-widest
          border-coopmaths-struct/30 focus:border-coopmaths-action
          bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark
          text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        />
        {#if $lastError != null}
          <p
            class="text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action"
          >
            {$lastError}
          </p>
        {/if}
        <button
          type="submit"
          class="px-6 py-3 text-lg font-bold shadow
          text-coopmaths-canvas bg-coopmaths-action
          hover:bg-coopmaths-action-lightest
          dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest
          dark:text-coopmathsdark-canvas
          disabled:opacity-40"
          disabled={!/^\d{6}$/.test(pinInput.trim())}
        >
          Rejoindre
        </button>
      </form>
    </div>
  {:else if $step === 'pseudo'}
    <div
      class="flex flex-col items-center gap-6 shadow-xl px-10 py-8 mx-6
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas max-w-xl"
    >
      <h1
        class="text-2xl font-extrabold text-center
        text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        {$usernameMode === 'safe' ? 'Choisis ton prénom' : 'Choisis ton pseudo'}
      </h1>
      <form
        class="flex flex-col items-center gap-4 w-full"
        on:submit|preventDefault={submitUsername}
      >
        <input
          type="text"
          bind:value={usernameInput}
          placeholder={$usernameMode === 'safe' ? 'Ton prénom' : 'Ton pseudo'}
          maxlength="20"
          autocomplete="off"
          autocapitalize="sentences"
          class="w-64 px-4 py-3 border-2 text-2xl text-center
          border-coopmaths-struct/30 focus:border-coopmaths-action
          bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark
          text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        />
        {#if $lastError != null}
          <p
            class="text-sm font-semibold text-coopmaths-action dark:text-coopmathsdark-action"
          >
            {$lastError}
          </p>
        {/if}
        <button
          type="submit"
          class="px-6 py-3 text-lg font-bold shadow
          text-coopmaths-canvas bg-coopmaths-action
          hover:bg-coopmaths-action-lightest
          dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest
          dark:text-coopmathsdark-canvas
          disabled:opacity-40"
          disabled={usernameInput.trim().length === 0}
        >
          C'est parti !
        </button>
      </form>
      {#if $usernameMode === 'safe'}
        <p
          class="text-sm font-light text-center text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
        >
          Ton prénom est vérifié : il doit figurer dans la liste autorisée par
          ton enseignant. S’il est déjà pris, un numéro te sera attribué (ex. «
          Ada 2 »).
        </p>
      {/if}
    </div>
  {:else if $step === 'game'}
    {#if $quizzStatus != null}
      <QuizzMultiStage
        status={$quizzStatus}
        role="player"
        {onImage}
        onSubmit={(answerIds) => session.answer(answerIds)}
      />
    {:else}
      <div
        class="text-xl font-semibold
        text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        En attente du début de la partie…
      </div>
    {/if}
  {:else if $step === 'ended'}
    <div class="flex flex-col items-center gap-6 px-6 text-center">
      <p
        class="text-xl font-semibold
        text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        {$endMessage ?? 'La partie est terminée.'}
      </p>
      <div class="flex flex-row gap-3">
        <button
          type="button"
          class="px-4 py-2 font-bold shadow
          text-coopmaths-canvas bg-coopmaths-action
          hover:bg-coopmaths-action-lightest
          dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
          on:click={() => session.backToPin()}
        >
          Rejoindre une autre partie
        </button>
        <button
          type="button"
          class="px-4 py-2 font-bold shadow
          text-coopmaths-canvas bg-coopmaths-struct
          hover:bg-coopmaths-struct-light
          dark:bg-coopmathsdark-struct dark:hover:bg-coopmathsdark-struct-light"
          on:click={goHome}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  {/if}

  {#if $step === 'game'}
    <QuizzControls
      status={$quizzStatus?.name ?? null}
      mode="multi"
      scoring="full"
      sound={soundOn}
      canGoNext={false}
      role="player"
      onReveal={() => {}}
      onNext={() => {}}
      onLeaderboard={() => {}}
      onRestart={() => {}}
      onEdit={() => {}}
      onQuit={quit}
      onToggleSound={toggleSound}
    />
  {/if}
</main>
