<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { buildQuizz } from '../../../lib/quizz/buildQuizz'
  import { decodeQuizzParams } from '../../../lib/quizz/quizzParams'
  import { darkMode, exercicesParams } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import {
    quizzAnswerCount,
    quizzCooldownTick,
    quizzProgress,
    quizzStatus,
    resetQuizzStores,
  } from '../../../lib/stores/quizzStore'
  import { QuizzEngine } from '../../../modules/quizz/engine/QuizzEngine'
  import { QuizzPlayerManager } from '../../../modules/quizz/engine/QuizzPlayerManager'
  import { LocalTransport } from '../../../modules/quizz/transport/LocalTransport'
  import type { QuizzStatusMessage } from '../../../modules/quizz/transport/QuizzTransport'
  import {
    QUIZZ_EVENTS,
    QUIZZ_STATUS,
    type Quizz,
    type QuizzBackgroundParam,
    type QuizzMode,
    type QuizzParams,
    type QuizzScoring,
    type QuizzStatus,
    type QuizzStatusDataMap,
    type QuizzUpdateQuestion,
  } from '../../../modules/quizz/types'
  import ShowLeaderboard from './layouts/ShowLeaderboard.svelte'
  import ShowPodium from './layouts/ShowPodium.svelte'
  import ShowPrepared from './layouts/ShowPrepared.svelte'
  import ShowQuestion from './layouts/ShowQuestion.svelte'
  import ShowResponses from './layouts/ShowResponses.svelte'
  import ShowResult from './layouts/ShowResult.svelte'
  import ShowStart from './layouts/ShowStart.svelte'
  import SelectAnswer from './layouts/SelectAnswer.svelte'
  import QuizzBackground from './presentationalComponents/QuizzBackground.svelte'
  import QuizzControls from './presentationalComponents/QuizzControls.svelte'
  import { fitQuizzContent } from './quizzRender'
  import { QuizzSounds } from './quizzSounds'

  const LOCAL_PLAYER_ID = 'local-player'

  let engine: QuizzEngine | null = null
  let transport: LocalTransport | null = null
  let sounds: QuizzSounds | null = null
  let unsubscribeStatus: (() => void) | null = null
  let unsubscribeEvent: (() => void) | null = null

  let quizz: Quizz | null = null
  let params: QuizzParams | null = null
  let mode: QuizzMode = 'solo'
  let scoring: QuizzScoring = 'full'
  let background: QuizzBackgroundParam = { mode: 'none' }
  let soundOn = true
  let subject = ''

  let isLoading = true
  let isStarted = false
  let hasError = false
  let onImage = false
  let currentStatus: QuizzStatus | null = null
  let mainEl: HTMLElement
  let cleanupFit: (() => void) | null = null

  $: canGoNext = $quizzProgress.current < $quizzProgress.total

  async function init() {
    cleanup()
    resetQuizzStores()
    isLoading = true
    isStarted = false
    hasError = false
    currentStatus = null
    const options = get(globalOptions)
    subject = options.subject ?? 'Quizz'
    params = decodeQuizzParams(options.quizzParam)
    mode = params.mode
    scoring = params.scoring
    soundOn = params.sound
    background = params.background
    const result = await buildQuizz(get(exercicesParams), params, subject)
    quizz = result.quizz
    if (quizz.questions.length === 0) {
      hasError = true
      isLoading = false
      return
    }
    transport = new LocalTransport()
    const players = new QuizzPlayerManager()
    players.add({
      id: LOCAL_PLAYER_ID,
      username: mode === 'solo' ? 'Moi' : 'La classe',
      points: 0,
      streak: 0,
    })
    sounds = new QuizzSounds(soundOn)
    engine = new QuizzEngine({
      quizz,
      players,
      transport,
      mode,
      scoring,
    })
    unsubscribeStatus = transport.onStatus(handleStatus)
    unsubscribeEvent = transport.onEvent(handleEvent)
    isLoading = false
  }

  function handleStatus(message: QuizzStatusMessage) {
    if (message.target !== 'broadcast' && message.target !== LOCAL_PLAYER_ID) {
      return
    }
    // Filtrage par rôle, comme chez Razzia : en solo on suit le parcours
    // « joueur » (SHOW_RESULT), en projection le parcours « manager »
    // (SHOW_RESPONSES / SHOW_LEADERBOARD).
    if (mode === 'solo' && message.name === 'SHOW_RESPONSES') return
    if (mode === 'solo' && message.name === 'SHOW_LEADERBOARD') return
    if (mode === 'projection' && message.name === 'SHOW_RESULT') return
    playStatusSound(message.name)
    currentStatus = message.name
    quizzStatus.set(message)
  }

  function handleEvent(event: string, payload?: unknown) {
    if (event === QUIZZ_EVENTS.UPDATE_QUESTION) {
      quizzProgress.set(payload as QuizzUpdateQuestion)
    } else if (event === QUIZZ_EVENTS.COOLDOWN) {
      quizzCooldownTick.set(payload as number)
      if (currentStatus === QUIZZ_STATUS.SHOW_START) sounds?.play('boump')
    } else if (event === QUIZZ_EVENTS.START_COOLDOWN) {
      sounds?.play('boump')
    } else if (event === QUIZZ_EVENTS.PLAYER_ANSWER) {
      quizzAnswerCount.set(payload as number)
      sounds?.play('answersSound')
    }
  }

  function playStatusSound(name: QuizzStatus) {
    switch (name) {
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
  }

  function cleanup() {
    unsubscribeStatus?.()
    unsubscribeEvent?.()
    unsubscribeStatus = null
    unsubscribeEvent = null
    engine?.destroy()
    engine = null
    transport?.removeAllListeners()
    transport = null
    sounds?.stopMusic()
    sounds = null
  }

  function startQuizz() {
    if (engine == null || isStarted) return
    isStarted = true
    // Le clic de démarrage est le geste utilisateur qui déverrouille l'audio
    void engine.start()
  }

  const submitAnswer = (answerIds: number[]) => {
    engine?.selectAnswer(LOCAL_PLAYER_ID, answerIds)
  }

  function goNext() {
    if (canGoNext) engine?.nextQuestion()
    else engine?.showLeaderboard()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isStarted) return
    if (currentStatus === 'SELECT_ANSWER') {
      if (event.key === 'r' || event.key === 'R') engine?.abortQuestion()
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
      (currentStatus === 'SHOW_RESULT' && mode === 'solo') ||
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

  function goToConf() {
    globalOptions.update((options) => {
      options.v = 'quizzconf'
      return options
    })
  }

  function quit() {
    globalOptions.update((options) => {
      options.v = ''
      return options
    })
  }

  onMount(() => {
    void init()
    // Ajustement « shrink-to-fit » du contenu (texte + figures) à la fenêtre
    cleanupFit = fitQuizzContent(mainEl)
    window.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    cleanup()
    cleanupFit?.()
    resetQuizzStores()
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

  {#if $quizzProgress.total > 0 && isStarted && currentStatus !== 'FINISHED'}
    <div
      class="fixed top-4 left-4 z-20 px-3 py-1 text-sm font-bold shadow
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Question {$quizzProgress.current} / {$quizzProgress.total}
    </div>
  {/if}

  {#if isLoading}
    <div
      class="text-xl font-semibold
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Préparation du quizz…
    </div>
  {:else if hasError}
    <div class="flex flex-col items-center gap-6 px-6 text-center">
      <p
        class="text-xl font-semibold
        text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        Aucune question compatible QCM n'a pu être construite pour ce quizz.
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
  {:else if !isStarted}
    <div
      class="flex flex-col items-center justify-center gap-10 px-6 text-center"
    >
      <h1
        class="quizz-text-title font-extrabold
        {onImage
          ? 'text-white drop-shadow-lg'
          : 'text-coopmaths-struct dark:text-coopmathsdark-struct'}"
      >
        {subject}
      </h1>
      <div
        class="text-lg
        {onImage
          ? 'text-white drop-shadow'
          : 'text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70'}"
      >
        {quizz?.questions.length} question{(quizz?.questions.length ?? 0) > 1
          ? 's'
          : ''}
      </div>
      <button
        type="button"
        class="px-8 py-4 text-2xl font-extrabold shadow-xl
        text-coopmaths-canvas bg-coopmaths-action
        hover:bg-coopmaths-action-lightest
        dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest
        dark:text-coopmathsdark-canvas"
        on:click={startQuizz}
      >
        Commencer le quizz
      </button>
    </div>
  {:else if $quizzStatus != null}
    {@const status = $quizzStatus}
    {#if status.name === 'SHOW_START'}
      <ShowStart
        data={status.data as QuizzStatusDataMap['SHOW_START']}
        {onImage}
      />
    {:else if status.name === 'SHOW_PREPARED'}
      <ShowPrepared
        data={status.data as QuizzStatusDataMap['SHOW_PREPARED']}
        {onImage}
      />
    {:else if status.name === 'SHOW_QUESTION'}
      {#key $quizzProgress.current}
        <ShowQuestion
          data={status.data as QuizzStatusDataMap['SHOW_QUESTION']}
        />
      {/key}
    {:else if status.name === 'SELECT_ANSWER'}
      {#key $quizzProgress.current}
        <SelectAnswer
          data={status.data as QuizzStatusDataMap['SELECT_ANSWER']}
          onSubmit={submitAnswer}
        />
      {/key}
    {:else if status.name === 'WAIT'}
      <div
        class="flex flex-col items-center gap-4 text-xl font-semibold
        {onImage
          ? 'text-white drop-shadow'
          : 'text-coopmaths-struct dark:text-coopmathsdark-struct'}"
      >
        <span class="quizz-wait-dots">●●●</span>
        {(status.data as QuizzStatusDataMap['WAIT']).text}
      </div>
    {:else if status.name === 'SHOW_RESULT' && mode === 'solo'}
      {#key $quizzProgress.current}
        <ShowResult data={status.data as QuizzStatusDataMap['SHOW_RESULT']} />
      {/key}
    {:else if status.name === 'SHOW_RESPONSES' && mode === 'projection'}
      {#key $quizzProgress.current}
        <ShowResponses
          data={status.data as QuizzStatusDataMap['SHOW_RESPONSES']}
        />
      {/key}
    {:else if status.name === 'SHOW_LEADERBOARD'}
      <ShowLeaderboard
        data={status.data as QuizzStatusDataMap['SHOW_LEADERBOARD']}
      />
    {:else if status.name === 'FINISHED'}
      <ShowPodium data={status.data as QuizzStatusDataMap['FINISHED']} />
    {/if}
  {/if}

  {#if isStarted && !isLoading && !hasError}
    <QuizzControls
      status={currentStatus}
      {mode}
      {scoring}
      sound={soundOn}
      {canGoNext}
      onReveal={() => engine?.abortQuestion()}
      onNext={goNext}
      onLeaderboard={() => engine?.showLeaderboard()}
      onRestart={() => void init()}
      onEdit={goToConf}
      onQuit={quit}
      onToggleSound={toggleSound}
    />
  {/if}
</main>

<style>
  .quizz-wait-dots {
    letter-spacing: 0.5em;
    animation: quizz-wait-anim 1.2s ease-in-out infinite;
  }
  @keyframes quizz-wait-anim {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
</style>
