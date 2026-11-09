<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { buildQuizz } from '../../../../lib/quizz/buildQuizz'
  import { QuizzMultiManagerSession } from '../../../../lib/quizz/multiManagerSession'
  import { decodeQuizzParams } from '../../../../lib/quizz/quizzParams'
  import { downloadQuizzResultsCsv } from '../../../../lib/quizz/quizzResults'
  import { validateQuizzForMulti } from '../../../../lib/quizz/validateQuizzMulti'
  import {
    darkMode,
    exercicesParams,
  } from '../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../lib/stores/globalOptions'
  import { quizzProgress, quizzStatus } from '../../../../lib/stores/quizzStore'
  import {
    QUIZZ_STATUS,
    type QuizzBackgroundParam,
    type QuizzScoring,
  } from '../../../../modules/quizz/types'
  import QuizzBackground from '../presentationalComponents/QuizzBackground.svelte'
  import { fitQuizzContent } from '../quizzRender'
  import QuizzControls from '../presentationalComponents/QuizzControls.svelte'
  import { QuizzSounds } from '../quizzSounds'
  import QuizzLobby from './QuizzLobby.svelte'
  import QuizzMultiStage from './QuizzMultiStage.svelte'

  /**
   * Parcours du manager (enseignant) en mode multi-joueurs :
   * construction du quizz (sauf reconnexion) → identification par code
   * e-mail → création de la room → lobby (PIN + joueurs) → pilotage de la
   * partie → podium et export CSV des résultats.
   *
   * Le protocole est tenu par {@link QuizzMultiManagerSession} ; ce composant
   * ne fait que le rendu des étapes et l'habillage (sons, clavier).
   */

  const options = get(globalOptions)
  const subject = options.subject ?? 'Quizz'
  const params = decodeQuizzParams(options.quizzParam)
  const scoring: QuizzScoring = params.scoring
  const background: QuizzBackgroundParam = params.background
  const reconnectGameId =
    options.quizzRole === 'manager' &&
    options.gameId != null &&
    options.gameId.length > 0
      ? options.gameId
      : undefined

  const session = new QuizzMultiManagerSession({
    scoring,
    // Réglage sonore transmis à la room : il s'applique aux appareils des
    // joueurs à leur jointure (le bouton son local reste un override).
    sound: params.sound,
    reconnectGameId,
    onGameId: (gameId) => {
      globalOptions.update((current) => {
        current.gameId = gameId ?? undefined
        return current
      })
    },
  })
  const {
    step,
    players,
    inviteCode,
    lastError,
    notice,
    endMessage,
    results,
    connectionLost,
  } = session

  let sounds: QuizzSounds | null = null
  let soundOn = params.sound
  let onImage = false
  // Construction du quizz (inutile en reconnexion : le serveur l'a déjà).
  let buildState: 'pending' | 'ok' | 'error' =
    reconnectGameId != null ? 'ok' : 'pending'
  let buildError = ''
  let emailInput = ''
  let codeInput = ''
  let unsubscribeSounds: (() => void) | null = null
  let unsubscribeStatusSounds: (() => void) | null = null
  let mainEl: HTMLElement
  let cleanupFit: (() => void) | null = null

  $: canGoNext = $quizzProgress.current < $quizzProgress.total

  async function init() {
    sounds = new QuizzSounds(soundOn)
    if (buildState === 'pending') {
      const result = await buildQuizz(get(exercicesParams), params, subject)
      if (result.quizz.questions.length === 0) {
        buildError =
          "Aucune question compatible QCM n'a pu être construite pour ce quizz."
        buildState = 'error'
        return
      }
      const validationError = validateQuizzForMulti(result.quizz)
      if (validationError != null) {
        buildError = validationError
        buildState = 'error'
        return
      }
      session.setQuizz(result.quizz, scoring, params.usernameMode)
      buildState = 'ok'
    }
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
        case QUIZZ_STATUS.SHOW_RESPONSES:
        case QUIZZ_STATUS.SHOW_LEADERBOARD:
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
      } else if (event === 'game:playerAnswer') {
        sounds?.play('answersSound')
      }
    })
  }

  function goNext() {
    if (canGoNext) session.nextQuestion()
    else session.showLeaderboard()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (get(step) !== 'game') return
    const currentStatus = $quizzStatus?.name ?? null
    if (currentStatus === 'SELECT_ANSWER') {
      if (event.key === 'r' || event.key === 'R') session.abortQuestion()
      return
    }
    if (
      event.key !== ' ' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Enter'
    ) {
      return
    }
    if (
      currentStatus === 'SHOW_RESPONSES' ||
      currentStatus === 'SHOW_LEADERBOARD'
    ) {
      event.preventDefault()
      goNext()
    }
  }

  function toggleSound() {
    soundOn = !soundOn
    sounds?.setEnabled(soundOn)
  }

  function exportCsv() {
    const current = get(results)
    if (current != null) downloadQuizzResultsCsv(current)
  }

  function clearMultiParams() {
    globalOptions.update((current) => {
      current.quizzRole = undefined
      current.pin = undefined
      current.gameId = undefined
      return current
    })
  }

  function goToConf() {
    clearMultiParams()
    globalOptions.update((current) => {
      current.v = 'quizzconf'
      return current
    })
  }

  function goHome() {
    clearMultiParams()
    globalOptions.update((current) => {
      current.v = ''
      return current
    })
  }

  /** Quitte en fermant la room pour tous (si elle existe déjà). */
  function quit() {
    const currentStep = get(step)
    if (currentStep === 'lobby' || currentStep === 'game') {
      if (!window.confirm('Fermer la partie pour tous les joueurs ?')) return
      session.closeGame()
    }
    goHome()
  }

  function submitEmail() {
    if (emailInput.trim().length === 0) return
    session.requestEmailCode(emailInput)
  }

  function submitCode() {
    if (codeInput.trim().length === 0) return
    session.verifyEmailCode(codeInput)
    codeInput = ''
  }

  // Effacement automatique des messages transitoires.
  let errorTimer: ReturnType<typeof setTimeout> | null = null
  $: if ($lastError != null) {
    if (errorTimer != null) clearTimeout(errorTimer)
    const message = $lastError
    errorTimer = setTimeout(() => {
      if (get(lastError) === message) lastError.set(null)
    }, 8000)
  }
  let noticeTimer: ReturnType<typeof setTimeout> | null = null
  $: if ($notice != null) {
    if (noticeTimer != null) clearTimeout(noticeTimer)
    const message = $notice
    noticeTimer = setTimeout(() => {
      if (get(notice) === message) notice.set(null)
    }, 5000)
  }

  onMount(() => {
    void init()
    // Ajustement « shrink-to-fit » du contenu (texte + figures) à la fenêtre
    cleanupFit = fitQuizzContent(mainEl)
    window.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    cleanupFit?.()
    unsubscribeSounds?.()
    unsubscribeStatusSounds?.()
    session.dispose()
    sounds?.stopMusic()
    sounds = null
    if (errorTimer != null) clearTimeout(errorTimer)
    if (noticeTimer != null) clearTimeout(noticeTimer)
    window.removeEventListener('keydown', handleKeydown)
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

  {#if $lastError != null && $step !== 'error'}
    <button
      type="button"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 text-sm font-bold shadow
      bg-coopmaths-action text-coopmaths-canvas
      dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas"
      title="Fermer"
      on:click={() => lastError.set(null)}
    >
      {$lastError}
    </button>
  {/if}
  {#if $notice != null}
    <button
      type="button"
      class="fixed top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 text-sm font-semibold shadow
      bg-coopmaths-struct text-coopmaths-canvas
      dark:bg-coopmathsdark-struct dark:text-coopmathsdark-canvas"
      title="Fermer"
      on:click={() => notice.set(null)}
    >
      {$notice}
    </button>
  {/if}

  {#if buildState === 'pending'}
    <div
      class="text-xl font-semibold
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Préparation du quizz…
    </div>
  {:else if buildState === 'error'}
    <div class="flex flex-col items-center gap-6 px-6 text-center">
      <p
        class="text-xl font-semibold
        text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        {buildError}
      </p>
      <button
        type="button"
        class="px-4 py-2 font-bold shadow
        text-coopmaths-canvas bg-coopmaths-action
        hover:bg-coopmaths-action-lightest
        dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
        on:click={goToConf}
      >
        Retour aux réglages
      </button>
    </div>
  {:else if $step === 'connecting'}
    <div
      class="text-xl font-semibold
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Connexion au serveur de jeu…
    </div>
  {:else if $step === 'error'}
    <div class="flex flex-col items-center gap-6 px-6 text-center">
      <p
        class="text-xl font-semibold
        text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        {$lastError ?? 'Une erreur est survenue.'}
      </p>
      <div class="flex flex-row gap-3">
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
        <button
          type="button"
          class="px-4 py-2 font-bold shadow
          text-coopmaths-canvas bg-coopmaths-action
          hover:bg-coopmaths-action-lightest
          dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest"
          on:click={goToConf}
        >
          Retour aux réglages
        </button>
      </div>
    </div>
  {:else if $step === 'email' || $step === 'code' || $step === 'creating'}
    <div
      class="flex flex-col items-center gap-6 shadow-xl px-10 py-8 mx-6
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas max-w-xl"
    >
      <h1
        class="text-2xl font-extrabold text-center
        text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        {subject}
      </h1>
      {#if $step === 'email'}
        <p
          class="text-center font-light
          text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          Pour créer une partie en ligne, indiquez votre adresse professionnelle
          (académique) : un code de vérification vous y sera envoyé.
        </p>
        <form
          class="flex flex-col items-center gap-4 w-full"
          on:submit|preventDefault={submitEmail}
        >
          <input
            type="email"
            bind:value={emailInput}
            placeholder="prenom.nom@ac-…fr"
            autocomplete="on"
            class="w-full px-4 py-3 border-2 text-lg text-center
            border-coopmaths-struct/30 focus:border-coopmaths-action
            bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark
            text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          />
          <button
            type="submit"
            class="px-6 py-3 text-lg font-bold shadow
            text-coopmaths-canvas bg-coopmaths-action
            hover:bg-coopmaths-action-lightest
            dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest
            dark:text-coopmathsdark-canvas
            disabled:opacity-40"
            disabled={emailInput.trim().length === 0}
          >
            Recevoir le code
          </button>
        </form>
      {:else if $step === 'code'}
        <p
          class="text-center font-light
          text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          Un code à 6 chiffres vient d'être envoyé à
          <strong>{emailInput.trim()}</strong>. Il est valable une dizaine de
          minutes.
        </p>
        <form
          class="flex flex-col items-center gap-4 w-full"
          on:submit|preventDefault={submitCode}
        >
          <input
            type="text"
            bind:value={codeInput}
            placeholder="123456"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            class="w-48 px-4 py-3 border-2 text-2xl text-center tracking-widest
            border-coopmaths-struct/30 focus:border-coopmaths-action
            bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark
            text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          />
          <button
            type="submit"
            class="px-6 py-3 text-lg font-bold shadow
            text-coopmaths-canvas bg-coopmaths-action
            hover:bg-coopmaths-action-lightest
            dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest
            dark:text-coopmathsdark-canvas
            disabled:opacity-40"
            disabled={!/^\d{6}$/.test(codeInput.trim())}
          >
            Valider le code
          </button>
        </form>
        <div class="flex flex-row gap-4 text-sm">
          <button
            type="button"
            class="font-semibold underline
            text-coopmaths-struct dark:text-coopmathsdark-struct"
            on:click={() => session.requestEmailCode(emailInput)}
          >
            Renvoyer un code
          </button>
          <button
            type="button"
            class="font-semibold underline
            text-coopmaths-struct dark:text-coopmathsdark-struct"
            on:click={() => session.backToEmail()}
          >
            Changer d'adresse
          </button>
        </div>
      {:else}
        <p
          class="text-xl font-semibold
          text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Création de la partie…
        </p>
      {/if}
    </div>
  {:else if $step === 'lobby'}
    <QuizzLobby
      inviteCode={$inviteCode}
      players={$players}
      {subject}
      onStart={() => session.startGame()}
      onKick={(playerId) => session.kickPlayer(playerId)}
    />
  {:else if $step === 'game'}
    {#if $quizzStatus != null}
      <QuizzMultiStage status={$quizzStatus} role="manager" {onImage} />
    {:else}
      <div
        class="text-xl font-semibold
        text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        En attente du serveur…
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
  {/if}

  {#if ($step === 'lobby' || $step === 'game') && buildState === 'ok'}
    <QuizzControls
      status={$quizzStatus?.name ?? null}
      mode="multi"
      {scoring}
      sound={soundOn}
      {canGoNext}
      role="manager"
      onReveal={() => session.abortQuestion()}
      onNext={goNext}
      onLeaderboard={() => session.showLeaderboard()}
      onRestart={() => {}}
      onEdit={() => {}}
      onQuit={quit}
      onToggleSound={toggleSound}
      onExportCsv={$results != null ? exportCsv : undefined}
      onCloseRoom={quit}
    />
  {/if}
</main>
