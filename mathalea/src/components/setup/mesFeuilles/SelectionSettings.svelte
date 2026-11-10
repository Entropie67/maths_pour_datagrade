<script lang="ts">
  import QRCode from 'qrcode'
  import { untrack } from 'svelte'
  import type { SavedSelection } from '../../../lib/mesFeuilles/library'
  import {
    applySettings,
    isInteractiveView,
    PRES_MODES,
    readSettings,
    SELECTION_VIEWS,
    selectionUrl,
    viewLabel,
    type Interactivity,
    type LinkSettings,
  } from '../../../lib/mesFeuilles/selectionLink'
  import {
    iconButton,
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * Réglages d'une sélection : vue d'ouverture, interactivité, présentation
   * de la vue élève, énoncés figés ou renouvelés, avec le lien obtenu.
   */
  interface Props {
    selection: SavedSelection
    /** Adresse de la page de l'application (origine et chemin) */
    base: string
    onsave: (change: { query: string; newDataEachTime: boolean }) => void
    oncancel: () => void
  }

  let { selection, base, onsave, oncancel }: Props = $props()

  const initial = untrack(() => readSettings(selection.query))
  let settings: LinkSettings = $state({ ...initial })
  let newDataEachTime = $state(untrack(() => selection.newDataEachTime))
  let isQrShown = $state(false)
  let qrSource = $state('')
  let isCopied = $state(false)

  const views = $derived(
    SELECTION_VIEWS.some((v) => v.value === initial.view)
      ? SELECTION_VIEWS
      : [
          ...SELECTION_VIEWS,
          { value: initial.view, ...viewLabel(initial.view) },
        ],
  )
  const isEleve = $derived(settings.view === 'eleve')
  const interactivityChoices = $derived<
    { value: Interactivity; label: string }[]
  >([
    { value: 'tous', label: 'Tout interactif' },
    { value: 'aucun', label: 'Pas d’interactivité' },
    ...(settings.view === 'can'
      ? []
      : [
          {
            value: 'mixte' as const,
            label: 'Laisser tel quel (réglage de chaque exercice)',
          },
        ]),
  ])
  const query = $derived(applySettings(selection.query, settings))
  const url = $derived(
    selectionUrl({ ...selection, query, newDataEachTime }, base),
  )

  // la course aux nombres n'a pas de réglage par exercice
  $effect(() => {
    if (settings.view === 'can' && settings.interactivity === 'mixte') {
      settings.interactivity = 'tous'
    }
  })

  $effect(() => {
    if (!isQrShown) return
    const link = url
    QRCode.toDataURL(link, { margin: 1, width: 360 })
      .then((source: string) => {
        if (link === url) qrSource = source
      })
      .catch((error: unknown) =>
        console.error('QR code impossible à générer', error),
      )
  })

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      isCopied = true
      setTimeout(() => (isCopied = false), 2000)
    } catch (error) {
      console.error('Copie impossible', error)
    }
  }

  const radio =
    'flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer has-[:checked]:border-coopmaths-action has-[:checked]:bg-coopmaths-action/10 dark:has-[:checked]:border-coopmathsdark-action dark:has-[:checked]:bg-coopmathsdark-action/20 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'
  const legend =
    'mb-2 font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct'
</script>

<form
  class="flex flex-col gap-5"
  onsubmit={(event) => {
    event.preventDefault()
    onsave({ query, newDataEachTime })
  }}
>
  <fieldset>
    <legend class={legend}>Ouvrir dans la vue</legend>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {#each views as view (view.value)}
        <label class={radio}>
          <input
            type="radio"
            class="sr-only"
            name="vue"
            value={view.value}
            bind:group={settings.view}
          />
          <i
            class="bx {view.icon} text-xl text-coopmaths-action dark:text-coopmathsdark-action"
            aria-hidden="true"
          ></i>
          <span class="text-sm">{view.label}</span>
        </label>
      {/each}
    </div>
    {#if settings.view === ''}
      <p class="{quietText} mt-2">
        La conception de document permet ensuite de choisir une autre vue ou de
        modifier les exercices.
      </p>
    {/if}
  </fieldset>

  {#if isInteractiveView(settings.view)}
    <fieldset>
      <legend class={legend}>Interactivité</legend>
      <div class="flex flex-col gap-1">
        {#each interactivityChoices as choice (choice.value)}
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="interactivite"
              value={choice.value}
              bind:group={settings.interactivity}
            />
            {choice.label}
          </label>
        {/each}
      </div>
    </fieldset>
  {/if}

  {#if isEleve}
    <fieldset class="flex flex-col gap-3">
      <legend class={legend}>Vue élève</legend>
      <label class="flex flex-col gap-1">
        <span class="text-sm">Titre (pas de bandeau si laissé vide)</span>
        <input type="text" class={textInput} bind:value={settings.title} />
      </label>
      <div class="flex flex-col gap-1">
        {#each PRES_MODES as mode (mode.value)}
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="presentation"
              value={mode.value}
              bind:group={settings.presMode}
            />
            {mode.label}
          </label>
        {/each}
      </div>
      <div class="flex flex-col gap-1">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" bind:checked={settings.isSolutionAccessible} />
          Correction disponible
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={settings.oneShot}
            disabled={settings.interactivity === 'aucun'}
          />
          Une seule réponse
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" bind:checked={settings.isInteractiveFree} />
          Les élèves peuvent modifier l’interactivité
        </label>
      </div>
    </fieldset>
  {/if}

  <fieldset>
    <legend class={legend}>Énoncés</legend>
    <div class="flex flex-col gap-1">
      <label class="flex items-start gap-2 cursor-pointer">
        <input
          type="radio"
          class="mt-1"
          name="enonces"
          value={false}
          bind:group={newDataEachTime}
        />
        <span>
          Toujours les mêmes énoncés
          <span class="{quietText} block">
            Le corrigé d’un sujet distribué reste retrouvable.
          </span>
        </span>
      </label>
      <label class="flex items-start gap-2 cursor-pointer">
        <input
          type="radio"
          class="mt-1"
          name="enonces"
          value={true}
          bind:group={newDataEachTime}
        />
        <span>
          Nouveaux énoncés à chaque ouverture
          <span class="{quietText} block">
            Les données changent à chaque fois que le lien est ouvert.
          </span>
        </span>
      </label>
    </div>
  </fieldset>

  <fieldset class="flex flex-col gap-2">
    <legend class={legend}>Lien</legend>
    <div class="flex flex-row items-center gap-1">
      <input
        type="text"
        class="{textInput} text-sm"
        readonly
        value={url}
        aria-label="Lien de la sélection"
        onfocus={(event) => event.currentTarget.select()}
      />
      <button
        type="button"
        class={iconButton}
        title={isCopied ? 'Lien copié' : 'Copier le lien'}
        aria-label="Copier le lien"
        onclick={copy}
      >
        <i class="bx {isCopied ? 'bx-check' : 'bx-copy'} text-xl"></i>
      </button>
      <button
        type="button"
        class={iconButton}
        title="QR code"
        aria-label="Afficher le QR code"
        aria-pressed={isQrShown}
        onclick={() => (isQrShown = !isQrShown)}
      >
        <i class="bx bx-qr text-xl"></i>
      </button>
    </div>
    {#if isQrShown && qrSource !== ''}
      <img
        src={qrSource}
        alt="QR code du lien de la sélection"
        class="self-center w-60 h-60"
      />
    {/if}
  </fieldset>

  <div class="flex flex-row justify-end gap-3">
    <button type="button" class={secondaryButton} onclick={oncancel}>
      Annuler
    </button>
    <button type="submit" class={primaryButton}>
      <i class="bx bx-check" aria-hidden="true"></i> Enregistrer
    </button>
  </div>
</form>
