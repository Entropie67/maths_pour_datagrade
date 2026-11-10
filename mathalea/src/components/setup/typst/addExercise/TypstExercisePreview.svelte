<script lang="ts">
  import seedrandom from 'seedrandom'
  import { onDestroy, tick } from 'svelte'
  import { buildExercise } from '../../../../lib/components/exercisesUtils'
  import { applyExerciceSettings } from '../../../../lib/components/exerciceSettings'
  import { acquireLoadSlot } from '../../../../lib/components/loadQueue'
  import {
    endingLabel,
    endingReference,
  } from '../../../../lib/components/mobileMenu'
  import {
    mathaleaFormatExercice,
    mathaleaGenerateSeed,
    mathaleaHandleExerciceSimple,
    mathaleaRenderDiv,
  } from '../../../../lib/mathalea'
  import type { IExercice, InterfaceParams } from '../../../../lib/types'
  import {
    isExamItemInReferentiel,
    isExerciceItemInReferentiel,
    isGeoDynamic,
    isTool,
    type JSONReferentielEnding,
  } from '../../../../lib/types/referentiels'
  import Settings from '../../../shared/exercice/exerciceMathalea/exerciceMathaleaVueProf/presentationalComponents/Settings.svelte'

  /**
   * Aperçu d'un exercice dans la modale « Ajouter un exercice » de la vue
   * Typst : énoncé généré (comme il le sera dans la fiche), roue dentée pour
   * le paramétrer avant de l'ajouter, et bouton d'ajout.
   *
   * L'exercice vit ici : il n'est pas dans `exercicesParams` tant qu'il n'a
   * pas été ajouté. « Ajouter » transmet une copie de ses paramètres (graine
   * et réglages compris), la vue Typst se charge du reste.
   */
  type Props = {
    ending: JSONReferentielEnding
    /** Nombre de fois où cette ressource est déjà dans la fiche */
    count: number
    onAdd: (params: InterfaceParams) => void
    /** Réglages dépliés dès l'affichage (vue Parcours) */
    settingsOpen?: boolean
    /** Ce qui reçoit l'exercice, pour les libellés (« la fiche » par défaut) */
    target?: string
    /** Réglages à droite de l'aperçu sur grand écran, comme sur le site (modale plein écran) */
    settingsAside?: boolean
  }

  const {
    ending,
    count,
    onAdd,
    settingsOpen = false,
    target = 'la fiche',
    settingsAside = false,
  }: Props = $props()

  /** Paramètres de l'exercice prévisualisé, transmis tels quels à l'ajout */
  const params: InterfaceParams = $state(initialParams())
  let exercise: IExercice | null = $state(null)
  let isLoading = $state(false)
  let errorMessage = $state('')
  // svelte-ignore state_referenced_locally
  let isSettingsOpen = $state(settingsOpen)
  /** Incrémenté à chaque régénération pour ré-injecter le HTML de l'énoncé */
  let version = $state(0)

  /** Paramètres de départ : graine tirée au sort, comme un ajout par le menu */
  function initialParams(): InterfaceParams {
    // Math.random peut être verrouillé sur la graine du dernier exercice
    // généré (seedrandom global) : sans ce réamorçage, toutes les cartes
    // partageraient la même graine « aléatoire »
    seedrandom(undefined, { global: true })
    const newParams: InterfaceParams = {
      uuid: ending.uuid,
      alea: mathaleaGenerateSeed(),
    }
    if (isExerciceItemInReferentiel(ending) || isTool(ending)) {
      newParams.id = ending.id
    }
    return newParams
  }

  /** Génère (ou régénère) le contenu de l'exercice pour l'aperçu HTML */
  async function updateDisplay() {
    if (exercise == null) return
    if (exercise.seed === undefined) exercise.applyNewSeed?.()
    seedrandom(exercise.seed, { global: true })
    exercise.numeroExercice = 0
    exercise.interactif = false
    if (exercise.typeExercice === 'statique') {
      // contenu figé (annale scannée, banque externe) : le régénérer
      // viderait `listeQuestions` sans rien produire à la place
      version += 1
      await tick()
      return
    }
    if (exercise.typeExercice === 'simple') {
      mathaleaHandleExerciceSimple(exercise, false, 0)
    } else if (typeof exercise.nouvelleVersionWrapper === 'function') {
      exercise.nouvelleVersionWrapper(0)
    }
    version += 1
    await tick()
  }

  /** Annule la demande de créneau de chargement si non encore accordée */
  let cancelLoadSlot: (() => void) | null = null

  /**
   * Charge l'exercice à la première apparition à l'écran. Passe par la file
   * d'attente `loadQueue` : au plus 5 exercices se génèrent en même temps,
   * pour ne pas saturer le thread principal quand plusieurs cartes entrent
   * dans la marge de préchargement d'un coup (liste de résultats).
   */
  async function load() {
    if (exercise != null || isLoading) return
    isLoading = true
    const { slot, cancel } = acquireLoadSlot()
    cancelLoadSlot = cancel
    const release = await slot
    cancelLoadSlot = null
    try {
      exercise = await buildExercise($state.snapshot(params))
      await updateDisplay()
    } catch {
      errorMessage = "Cet exercice n'a pas pu être chargé."
    } finally {
      isLoading = false
      release()
    }
  }

  /**
   * Action de chargement paresseux : un thème (ou une recherche) peut
   * afficher des dizaines d'exercices, chacun étant un module chargé à la
   * demande — on ne les génère qu'au moment où leur carte est réellement
   * visible. Pas de marge de préchargement (`rootMargin: '0px'`) : une
   * liste de résultats peut compter plusieurs centaines d'entrées, et
   * précharger au-delà de l'écran viderait la file d'attente `loadQueue`
   * sur des cartes que l'utilisateur n'a pas encore fait défiler.
   */
  let observer: IntersectionObserver | null = null
  function lazyLoad(node: HTMLElement) {
    if (typeof IntersectionObserver === 'undefined') {
      void load()
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect()
          observer = null
          void load()
        }
      },
      { rootMargin: '0px' },
    )
    observer.observe(node)
    return {
      destroy() {
        observer?.disconnect()
        observer = null
      },
    }
  }

  onDestroy(() => {
    cancelLoadSlot?.()
    exercise?.reinit?.()
    exercise?.destroy?.()
  })

  /** Typeset KaTeX et redimensionnement des figures du contenu injecté */
  function renderMath(node: HTMLElement) {
    mathaleaRenderDiv(node, 1)
  }

  /**
   * Met un contenu d'exercice au format HTML affichable : mêmes réécritures
   * que les autres vues, et facteur de zoom des images statiques figé à 1.
   * @param {string} text contenu brut (énoncé, consigne, question)
   * @returns {string} le HTML à injecter
   */
  function format(text: string): string {
    return mathaleaFormatExercice(text).replaceAll('{zoomFactor}', '1')
  }

  function handleNewSettings(event: CustomEvent) {
    if (exercise == null) return
    applyExerciceSettings(exercise, params, event.detail)
    void updateDisplay()
  }

  function add() {
    onAdd({ ...$state.snapshot(params) })
    // la carte reste disponible : une nouvelle graine évite d'ajouter deux
    // fois le même énoncé si l'on reclique
    seedrandom(undefined, { global: true })
    params.alea = mathaleaGenerateSeed()
    if (exercise != null) {
      exercise.seed = params.alea
      void updateDisplay()
    }
  }

  /** Réglages à droite de l'aperçu (grand écran, modale plein écran) */
  const aside = $derived(settingsAside && isSettingsOpen && exercise != null)
  const label = $derived(endingLabel(ending))
  const reference = $derived(endingReference(ending))
  /** Ressource interactive sans énoncé imprimable (géométrie dynamique, outils) */
  const isNotPrintable = $derived(isGeoDynamic(ending) || isTool(ending))
  /**
   * Exercice statique (annale scannée, banque externe) : contenu figé, ni
   * nombre de questions ni graine à régler — comme dans la palette de mise en
   * page, la roue dentée n'a rien à proposer.
   */
  const isConfigurable = $derived.by(
    () => exercise != null && exercise.typeExercice !== 'statique',
  )
</script>

<li
  use:lazyLoad
  data-tour="exercise-preview"
  data-tour-exam={isExamItemInReferentiel(ending)
    ? ending.typeExercice
    : undefined}
  class="flex flex-col gap-2 rounded-xl border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas p-3"
>
  <div class="flex flex-row items-start justify-between gap-3">
    <div class="min-w-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
      {#if reference}
        <span
          class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >{reference}</span
        >
        &nbsp;
      {/if}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html label}
      {#if ending.tags.length > 0}
        <!-- Étiquettes de la ressource, comme dans le menu de sélection des
             exercices (voir ReferentielEnding.svelte) -->
        <div class="mt-1 flex flex-row flex-wrap">
          {#each ending.tags as tag}
            <span
              class="inline-flex flex-wrap items-center justify-center rounded-full bg-coopmaths-struct-light dark:bg-coopmathsdark-struct-light text-coopmaths-canvas dark:text-coopmathsdark-canvas text-[0.6rem] px-2 py-px leading-snug font-semibold mr-1"
            >
              {tag}
            </span>
          {/each}
        </div>
      {/if}
    </div>
    <div class="flex shrink-0 flex-row items-center gap-1">
      {#if count > 0}
        <span
          title="Déjà présent {count} fois dans {target}"
          class="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold
          bg-coopmaths-warn dark:bg-coopmathsdark-warn
          text-coopmaths-canvas dark:text-coopmathsdark-canvas"
        >
          {count}
        </span>
      {/if}
      {#if isConfigurable}
        <button
          type="button"
          title="Paramétrer l'exercice avant de l'ajouter"
          aria-label="Paramétrer l'exercice"
          aria-expanded={isSettingsOpen}
          class="rounded p-1 text-xl text-coopmaths-action hover:bg-coopmaths-canvas-dark
          dark:text-coopmathsdark-action dark:hover:bg-coopmathsdark-canvas-dark"
          onclick={() => (isSettingsOpen = !isSettingsOpen)}
        >
          <i class="bx bx-cog"></i>
        </button>
      {/if}
      <button
        type="button"
        title="Ajouter cet exercice à {target}"
        class="flex flex-row items-center gap-1 rounded-lg px-3 py-1 text-sm font-bold
        bg-coopmaths-action text-coopmaths-canvas hover:bg-coopmaths-action-lightest
        dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas dark:hover:bg-coopmathsdark-action-lightest"
        onclick={add}
      >
        <i class="bx bx-plus text-lg"></i>
        Ajouter
      </button>
    </div>
  </div>
  <div
    class={aside
      ? 'flex flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start lg:gap-4'
      : 'contents'}
  >
    {#if isSettingsOpen && exercise != null}
      <div
        class="rounded-lg bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark {aside
          ? 'lg:order-2'
          : ''}"
      >
        <Settings
          exercice={exercise}
          exerciceIndex={0}
          inModal={true}
          on:settings={handleNewSettings}
          on:clickSettings={() => (isSettingsOpen = false)}
        />
      </div>
    {/if}

    <div class="flex min-w-0 flex-col gap-2 {aside ? 'lg:order-1' : ''}">
      {#if isNotPrintable}
        <p
          class="text-xs italic text-coopmaths-warn dark:text-coopmathsdark-warn"
        >
          Cette ressource est interactive : elle n'a pas d'énoncé imprimable.
        </p>
      {/if}

      {#if errorMessage !== ''}
        <p class="text-sm text-coopmaths-warn dark:text-coopmathsdark-warn">
          {errorMessage}
        </p>
      {:else if exercise == null}
        <p
          class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
        >
          <i class="bx bx-loader-alt bx-spin"></i>
          Chargement de l'aperçu…
        </p>
      {:else}
        {#key version}
          <div
            use:renderMath
            class="{aside
              ? 'max-h-72 lg:max-h-[32rem]'
              : 'max-h-72'} overflow-y-auto text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            {#if exercise.consigne}
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <p class="mb-1">{@html format(exercise.consigne)}</p>
            {/if}
            {#if exercise.introduction}
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <p class="mb-1">{@html format(exercise.introduction)}</p>
            {/if}
            <!-- `list-inside` : le conteneur n'a que overflow-y réglé, ce qui
             force overflow-x à se comporter en `auto` (règle CSS Overflow) et
             rogne tout ce qui déborderait à gauche — dont les numéros en
             `list-style-position: outside` (défaut), qui débordent dans la
             marge sans réserver de place. `list-inside` les remet dans le
             flux normal du contenu, sans dépassement possible. -->
            <ul
              class="{exercise.listeQuestions.length === 1 ||
              exercise.listeAvecNumerotation === false
                ? 'list-none'
                : 'list-decimal list-inside'} space-y-1"
            >
              {#each exercise.listeQuestions as question}
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                <li
                  class="marker:font-bold marker:text-coopmaths-struct dark:marker:text-coopmathsdark-struct"
                >
                  {@html format(question)}
                </li>
              {/each}
            </ul>
          </div>
        {/key}
      {/if}
    </div>
  </div>
</li>
