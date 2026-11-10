<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { formattedTimeStamp } from '../../../lib/components/time'
  import {
    buildQuizz,
    freezeSeeds,
    type ExerciseQuizzCompatibility,
  } from '../../../lib/quizz/buildQuizz'
  import { buildQuizzUrl } from '../../../lib/quizz/buildQuizzUrl'
  import {
    decodeQuizzParams,
    encodeQuizzParams,
    QUIZZ_MAX_COOLDOWN,
    QUIZZ_MIN_COOLDOWN,
    timeForExercise,
  } from '../../../lib/quizz/quizzParams'
  import {
    darkMode,
    exercicesParams,
    isReordering,
    moveExercice,
  } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import type {
    QuizzMode,
    QuizzParams,
    QuizzScoring,
    QuizzSeedMode,
  } from '../../../modules/quizz/types'
  import Footer from '../../Footer.svelte'
  import ButtonActionInfo from '../../shared/forms/ButtonActionInfo.svelte'
  import ButtonQRCode from '../../shared/forms/ButtonQRCode.svelte'
  import ButtonShortLink from '../../shared/edurl/ButtonShortLink.svelte'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import ButtonToggleAlt from '../../shared/forms/ButtonToggleAlt.svelte'
  import FormRadio from '../../shared/forms/FormRadio.svelte'
  import InputNumber from '../../shared/forms/InputNumber.svelte'
  import InputText from '../../shared/forms/InputText.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import backgroundsManifest from '../../../json/quizzBackgrounds.json'
  import QuizzBackgroundGalleryModal from './presentationalComponents/QuizzBackgroundGalleryModal.svelte'
  import QuizzExercisesTable from './presentationalComponents/QuizzExercisesTable.svelte'

  let subject: string = $globalOptions.subject ?? ''
  let params: QuizzParams = decodeQuizzParams($globalOptions.quizzParam)
  if (backgroundsManifest.length === 0 && params.background.mode !== 'none') {
    // Lien pointant vers un fond qui n'existe plus : repli sur le fond blanc
    params.background = { mode: 'none' }
  }

  let report: ExerciseQuizzCompatibility[] = []
  let totalQuestions = 0
  let isLoading = true
  let isGalleryDisplayed = false
  let currentLoad = 0
  let unsubscribe: (() => void) | undefined

  // Variables locales pour les FormRadio (typage string | number) :
  // répercutées dans params par les gestionnaires on:newvalue.
  let mode: string | number = params.mode
  let scoring: string | number = params.scoring
  let seedMode: string | number = params.seedMode
  let backgroundMode: string | number = params.background.mode
  let usernameMode: string | number = params.usernameMode

  const hasBackgrounds = backgroundsManifest.length > 0

  $: canLaunch = totalQuestions > 0 && subject.trim().length > 0
  $: shareUrl = buildQuizzUrl(
    $exercicesParams,
    subject.trim(),
    params,
  ).toString()
  $: estimatedSeconds = estimateDuration(report, params)

  // Synchronisation des réglages vers globalOptions (puis l'URL)
  $: if (params != null && typeof subject === 'string') {
    globalOptions.update((options) => {
      options.subject = subject.trim()
      options.quizzParam = encodeQuizzParams(params)
      return options
    })
  }

  async function reload() {
    const token = ++currentLoad
    isLoading = true
    try {
      const result = await buildQuizz(get(exercicesParams), params, subject)
      if (token !== currentLoad) return
      report = result.report
      totalQuestions = result.quizz.questions.length
    } finally {
      if (token === currentLoad) isLoading = false
    }
  }

  onMount(() => {
    if (params.seedMode === 'fixed') {
      exercicesParams.update((list) => {
        freezeSeeds(list)
        return list
      })
    }
    reload()
    let first = true
    unsubscribe = exercicesParams.subscribe(() => {
      if (first) {
        first = false
        return
      }
      reload()
    })
  })

  onDestroy(() => {
    unsubscribe?.()
  })

  function estimateDuration(
    compat: ExerciseQuizzCompatibility[],
    quizzParams: QuizzParams,
  ): number {
    let seconds = 0
    for (const exercise of compat) {
      if (exercise.status === 'incompatible') continue
      seconds +=
        exercise.keptQuestions.length *
        timeForExercise(quizzParams, exercise.index)
    }
    // transitions : 2 s de « préparez-vous » + cooldown + ~8 s de résultat
    seconds += totalQuestions * (quizzParams.cooldown + 10)
    return seconds
  }

  function handleSeedModeChange() {
    params.seedMode = seedMode as QuizzSeedMode
    params = params
    if (params.seedMode === 'fixed') {
      exercicesParams.update((list) => {
        freezeSeeds(list)
        return list
      })
    }
  }

  function handleTimeChange(index: number, value: number) {
    params.times[index] = value
    params = params
  }

  function handleRemove(index: number) {
    exercicesParams.update((list) => {
      list.splice(index, 1)
      return list
    })
    params.times.splice(index, 1)
    params = params
  }

  function handleEnableQcm(index: number) {
    exercicesParams.update((list) => {
      list[index].versionQcm = '1'
      return list
    })
  }

  function handleReorder(oldIndex: number, newIndex: number) {
    isReordering.set(true)
    exercicesParams.update((list) => moveExercice(list, oldIndex, newIndex))
    const times = params.times.slice()
    times.splice(newIndex, 0, times.splice(oldIndex, 1)[0])
    params.times = times
    params = params
    setTimeout(() => isReordering.set(false), 300)
  }

  function handleSelectBackground(image: string) {
    params.background = { mode: 'fixed', image }
    params = params
  }

  function launch() {
    if (!canLaunch) return
    if (params.seedMode === 'fixed') {
      exercicesParams.update((list) => {
        freezeSeeds(list)
        return list
      })
    }
    globalOptions.update((options) => {
      options.subject = subject.trim()
      options.quizzParam = encodeQuizzParams(params)
      options.v = 'quizz'
      // En multi-joueurs, le lancement ouvre le parcours manager (création
      // de la room) ; une éventuelle partie précédente est oubliée.
      options.quizzRole = params.mode === 'multi' ? 'manager' : undefined
      options.pin = undefined
      options.gameId = undefined
      return options
    })
  }

  function goHome() {
    globalOptions.update((options) => {
      options.v = ''
      return options
    })
  }
</script>

<main
  class="{$darkMode.isActive
    ? 'dark'
    : ''} mb-auto flex flex-col min-h-screen justify-start bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
>
  <NavBar
    subtitle="Quizz"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />
  <div
    class="flex flex-col grow h-full w-full bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <div
      class="h-full w-full md:w-2/3 lg:w-3/5 flex flex-col px-4 pb-4 md:py-10 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark mx-auto"
    >
      {#if $exercicesParams.length === 0}
        <div
          class="flex flex-col items-start px-4 py-4 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          <h3
            class="font-bold text-2xl pb-4 text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Quizz
          </h3>
          <p class="font-light">
            Aucun exercice n'est sélectionné. Choisissez d'abord des exercices
            de type QCM depuis la page d'accueil.
          </p>
          <div class="pt-4">
            <ButtonTextAction
              on:click={goHome}
              class="px-2 py-1 rounded-md"
              text="Retour à l'accueil"
            />
          </div>
        </div>
      {:else}
        <div
          class="flex flex-col md:flex-row justify-start px-4 py-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        >
          <h3
            class="font-bold text-2xl text-coopmaths-struct dark:text-coopmathsdark-struct bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
          >
            Réglages du quizz
          </h3>
        </div>

        <!-- Tableau des exercices -->
        <div class="pb-6 pt-2 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
          <div
            class="flex px-6 py-2 font-light text-lg text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >
            {#if isLoading}
              Analyse des exercices…
            {:else}
              {totalQuestions} question{totalQuestions > 1 ? 's' : ''} au quizz —
              durée estimée : {formattedTimeStamp(estimatedSeconds)}
            {/if}
          </div>
          <div class="px-4">
            <QuizzExercisesTable
              {report}
              times={params.times}
              onTimeChange={handleTimeChange}
              onRemove={handleRemove}
              onEnableQcm={handleEnableQcm}
              onReorder={handleReorder}
            />
          </div>
        </div>

        <!-- Paramètres du quizz -->
        <div class="pb-6 pt-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
          <div class="pt-2 px-4 grid grid-flow-row md:grid-cols-3 gap-4">
            <div class="pb-2 w-full flex flex-col">
              <div
                class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
              >
                Quizz
              </div>
              <div class="pl-4 pb-4 w-full flex flex-col">
                <div class="flex flex-row items-center">
                  <div
                    class="shrink-0 whitespace-nowrap text-sm font-light text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
                  >
                    Titre&nbsp;:
                  </div>
                  <InputText
                    inputID="quizz-subject-input"
                    bind:value={subject}
                    showTitle={false}
                    classAddenda="font-light m-2"
                  />
                </div>
                <div
                  class="mt-1 text-coopmaths-corpus font-light italic text-xs {subject.trim()
                    .length === 0
                    ? ''
                    : 'invisible'}"
                >
                  Un titre est nécessaire pour lancer le quizz.
                </div>
              </div>
              <div class="pl-2 pt-2">
                <FormRadio
                  title="Mode de jeu"
                  bind:valueSelected={mode}
                  on:newvalue={() => {
                    params.mode = mode as QuizzMode
                    params = params
                  }}
                  labelsValues={[
                    { label: 'Solo (un élève, un appareil)', value: 'solo' },
                    {
                      label: 'Projection (classe entière)',
                      value: 'projection',
                    },
                    {
                      label:
                        'Multi-joueurs en ligne (chaque élève sur son appareil)',
                      value: 'multi',
                    },
                  ]}
                />
              </div>
              <div class="pl-2 pt-4">
                <FormRadio
                  title="Score"
                  bind:valueSelected={scoring}
                  on:newvalue={() => {
                    params.scoring = scoring as QuizzScoring
                    params = params
                  }}
                  labelsValues={[
                    {
                      label: 'Complet (points dégressifs et séries)',
                      value: 'full',
                    },
                    {
                      label: 'Simplifié (1 point par bonne réponse)',
                      value: 'simple',
                    },
                    { label: 'Aucun', value: 'none' },
                  ]}
                />
              </div>
            </div>

            <div class="pb-2">
              <div
                class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
              >
                Questions
              </div>
              <FormRadio
                title="Données aléatoires"
                bind:valueSelected={seedMode}
                on:newvalue={handleSeedModeChange}
                labelsValues={[
                  {
                    label: 'Questions identiques pour tous',
                    value: 'fixed',
                  },
                  {
                    label: 'Une version différente à chaque ouverture',
                    value: 'random',
                  },
                ]}
              />
              <div
                class="pl-4 pt-1 font-light italic text-xs text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
              >
                {params.seedMode === 'fixed'
                  ? 'Les graines sont figées dans le lien : même quizz partout.'
                  : 'Les graines sont retirées du lien : chaque élève aura un tirage différent.'}
              </div>
              <div class="pl-2 pt-4">
                <div class="flex flex-row items-center">
                  <div
                    class="shrink-0 whitespace-nowrap text-sm font-light text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
                  >
                    Lecture de la question (s)&nbsp;:
                  </div>
                  <InputNumber
                    id="quizz-cooldown-input"
                    min={QUIZZ_MIN_COOLDOWN}
                    max={QUIZZ_MAX_COOLDOWN}
                    bind:value={params.cooldown}
                    on:change={() => (params = params)}
                  />
                </div>
                <div
                  class="mt-1 font-light italic text-xs text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
                >
                  Durée d'affichage de l'énoncé avant l'ouverture des réponses.
                </div>
              </div>
              <div class="pl-4 pt-4">
                <ButtonToggleAlt
                  title="Sons"
                  bind:value={params.sound}
                  on:toggle={() => (params = params)}
                  id="quizz-sound-toggle"
                  explanations={[
                    'Les effets sonores sont activés.',
                    'Les effets sonores sont coupés.',
                  ]}
                />
              </div>
            </div>

            {#if params.mode === 'multi'}
              <div class="pb-2">
                <div
                  class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
                >
                  Pseudo
                </div>
                <FormRadio
                  title="Mode pseudo"
                  bind:valueSelected={usernameMode}
                  on:newvalue={() => {
                    params.usernameMode =
                      usernameMode as QuizzParams['usernameMode']
                    params = params
                  }}
                  labelsValues={[
                    {
                      label: 'Pseudos libres (choisis par les élèves)',
                      value: 'free',
                    },
                    {
                      label: 'Prénoms d’une liste contrôlée',
                      value: 'safe',
                    },
                  ]}
                />
                <div
                  class="pl-4 pt-1 font-light italic text-xs text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
                >
                  {params.usernameMode === 'safe'
                    ? 'Les élèves saisissent leur prénom : il est vérifié par le serveur de jeu, qui enregistre la forme de la liste et ajoute un numéro en cas d’homonymes.'
                    : 'Les élèves saisissent le pseudo de leur choix (unique dans la partie).'}
                </div>
              </div>
            {/if}
            <div class="pb-2">
              <div
                class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
              >
                Fond d'écran
              </div>
              <FormRadio
                title="Fond d'écran"
                bind:valueSelected={backgroundMode}
                on:newvalue={() => {
                  params.background = {
                    mode: backgroundMode as QuizzParams['background']['mode'],
                    image: params.background.image,
                  }
                  params = params
                }}
                labelsValues={[
                  { label: 'Aucun (fond blanc)', value: 'none' },
                  {
                    label: 'Image fixe',
                    value: 'fixed',
                    isDisabled: !hasBackgrounds,
                  },
                  {
                    label: 'Aléatoire à chaque question',
                    value: 'random',
                    isDisabled: !hasBackgrounds,
                  },
                ]}
              />
              {#if !hasBackgrounds}
                <div
                  class="pl-4 pt-1 font-light italic text-xs text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
                >
                  En cours de développement.
                </div>
              {/if}
              {#if params.background.mode === 'fixed'}
                <div class="pl-4 pt-3 flex flex-col items-start">
                  {#if params.background.image != null}
                    <img
                      src="images/quizz/backgrounds/{params.background.image}"
                      alt={params.background.image}
                      class="w-40 h-24 object-cover rounded-lg shadow mb-2"
                    />
                  {/if}
                  <ButtonTextAction
                    on:click={() => (isGalleryDisplayed = true)}
                    class="px-2 py-1 rounded-md"
                    text="Choisir une image…"
                  />
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Lien du quizz -->
        <div
          class="flex flex-row justify-start px-4 pt-4 pb-2 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        >
          <h3
            class="font-bold text-2xl text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Lien du quizz
          </h3>
        </div>
        {#if params.mode === 'multi'}
          <div
            class="py-4 px-4 font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
          >
            En mode multi-joueurs, le quizz est construit sur votre appareil au
            lancement puis hébergé par le serveur de jeu : le lien ci-dessous ne
            sert qu'à retrouver ces réglages. Le code PIN à communiquer aux
            élèves s'affichera après le lancement.
          </div>
        {/if}
        <div class="py-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
          <div
            class="flex flex-row justify-start items-start space-x-10 pt-3 pl-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
          >
            <div class="flex flex-col items-center px-2">
              <div
                class="text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-light font-semibold"
              >
                Lien
              </div>
              <div class="my-1">
                <ButtonActionInfo
                  action="copy"
                  textToCopy={shareUrl}
                  tooltip="Lien vers le quizz"
                  icon={'bx-link text-2xl'}
                  messageSuccess="Le lien du quizz est copié dans le presse-papier !"
                  messageError="Impossible de copier le lien dans le presse-papier !"
                />
              </div>
            </div>
            <div class="flex flex-col justify-center items-center px-2">
              <div
                class="font-semibold text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-lightest"
              >
                QR-Code
              </div>
              <div class="my-1">
                <ButtonQRCode tooltip="QR-code du quizz" customUrl={shareUrl} />
              </div>
            </div>
            <div class="flex flex-col justify-center items-center px-2">
              <div
                class="font-semibold text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-lightest"
              >
                Raccourci
              </div>
              <div class="my-1">
                <ButtonShortLink
                  tooltip="Lien raccourci du quizz (edurl.fr)"
                  title={subject.trim()}
                  getUrl={() => shareUrl}
                />
              </div>
            </div>
            <div class="flex flex-col justify-center items-center px-2">
              <div
                class="text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-light font-semibold"
              >
                Fichier
              </div>
              <div class="my-1">
                <ButtonActionInfo
                  action="download"
                  urlToDownload={shareUrl}
                  fileName={subject.trim().length > 0
                    ? subject.trim()
                    : 'quizz-mathalea'}
                  successMessage="Le téléchargement va débuter dans quelques instants."
                  errorMessage="Impossible de télécharger le fichier."
                  tooltip="Fichier de redirection vers le quizz"
                  icon={'bxs-file-export text-2xl'}
                />
              </div>
            </div>
            <div class="flex flex-col justify-center items-center px-2">
              <div
                class="text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-light font-semibold"
              >
                Quizz
              </div>
              <div class="my-1">
                <ButtonTextAction
                  on:click={launch}
                  disabled={!canLaunch}
                  class="px-2 py-1 rounded-md"
                  text="Lancer le quizz"
                />
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  <Footer />
</main>

<QuizzBackgroundGalleryModal
  bind:isDisplayed={isGalleryDisplayed}
  selected={params.background.image}
  onSelect={handleSelectBackground}
/>
