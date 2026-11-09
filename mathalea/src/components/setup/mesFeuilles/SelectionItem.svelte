<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { SavedSelection, Stars } from '../../../lib/mesFeuilles/library'
  import {
    describeSettings,
    QUICK_VIEWS,
    readSettings,
    selectionView,
    viewLabel,
  } from '../../../lib/mesFeuilles/selectionLink'
  import StarRating from './StarRating.svelte'
  import { iconButton, quietText } from './styles'

  /**
   * Une sélection de « Mes sélections » : nom, étoiles, réglages du lien,
   * commentaire et actions.
   */
  interface Props {
    selection: SavedSelection
    /** Dossier de la sélection, affiché pendant une recherche */
    location?: string
    date: string
    isDragged: boolean
    isCopied: boolean
    isChecked: boolean
    /** Cases toujours visibles dès qu'un élément est coché */
    isCheckVisible: boolean
    oncheck: () => void
    /** Mise en évidence passagère (retour après modification) */
    isHighlighted?: boolean
    /** Champ de renommage, à la place du nom */
    renameField?: Snippet
    ondragstart: (event: DragEvent) => void
    /** Ouvre la sélection dans un nouvel onglet, dans sa vue ou dans `view` */
    onopen: (view?: string) => void
    oncopy: () => void
    /** Crée le lien raccourci, ou ouvre celui de la sélection */
    onshortlink: () => void
    /** Copie le lien raccourci de la sélection */
    oncopyshort: () => void
    /** Affiche le QR code du lien raccourci */
    onshortqr: () => void
    /** Le lien raccourci a été copié (retour visuel) */
    isShortCopied?: boolean
    /** Le lien raccourci mène à une ancienne version de la sélection */
    isShortStale?: boolean
    onsettings: () => void
    onedit: () => void
    onstars: (stars: Stars) => void
    oncomment: () => void
    onrename: () => void
    onmove: () => void
    onduplicate: () => void
    ondelete: () => void
  }

  let {
    selection,
    location,
    date,
    isDragged,
    isCopied,
    isChecked,
    isCheckVisible,
    oncheck,
    isHighlighted = false,
    renameField,
    ondragstart,
    onopen,
    oncopy,
    onshortlink,
    oncopyshort,
    onshortqr,
    isShortCopied = false,
    isShortStale = false,
    onsettings,
    onedit,
    onstars,
    oncomment,
    onrename,
    onmove,
    onduplicate,
    ondelete,
  }: Props = $props()

  const settings = $derived(readSettings(selection.query))
  const isExternal = $derived(selection.externalUrl !== undefined)
  const view = $derived(viewLabel(selectionView(selection)))
</script>

<article
  id="selection-{selection.id}"
  draggable={renameField === undefined}
  {ondragstart}
  class="group flex flex-col lg:flex-row lg:items-center gap-3 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark px-4 py-3 shadow-sm hover:shadow-md transition-shadow {isDragged
    ? 'opacity-50'
    : ''} {isChecked
    ? 'border-coopmaths-action dark:border-coopmathsdark-action'
    : ''} {isHighlighted
    ? 'ring-4 ring-coopmaths-action dark:ring-coopmathsdark-action'
    : ''}"
>
  <div class="flex min-w-0 flex-1 flex-row items-start gap-3">
    <input
      type="checkbox"
      class="mt-1.5 size-5 shrink-0 cursor-pointer rounded accent-coopmaths-action {isChecked ||
      isCheckVisible
        ? ''
        : 'md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100'}"
      aria-label="Cocher {selection.name}"
      checked={isChecked}
      onchange={oncheck}
    />
    <i
      class="bx {view.icon} mt-0.5 text-3xl text-coopmaths-action dark:text-coopmathsdark-action"
      title={isExternal ? view.label : `Vue ${view.label}`}
      aria-hidden="true"
    ></i>
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <div class="flex flex-row flex-wrap items-center gap-x-3">
        {#if renameField !== undefined}
          <div class="grow">{@render renameField()}</div>
        {:else}
          <h3 class="font-semibold leading-tight" title={selection.name}>
            {selection.name}
          </h3>
        {/if}
        <StarRating
          value={selection.stars}
          onchange={onstars}
          label={selection.name}
        />
      </div>
      <span class={quietText}>
        {isExternal
          ? selection.externalUrl
          : describeSettings(settings).join(' · ')}{!isExternal &&
        selection.newDataEachTime
          ? ' · nouveaux énoncés à chaque ouverture'
          : ''}
      </span>
      {#if location !== undefined}
        <span class="{quietText} truncate" title={location}>
          <i class="bx bx-folder" aria-hidden="true"></i>
          {location}
        </span>
      {/if}
      <span class="{quietText} truncate" title={selection.exercises.join(', ')}>
        {#if !isExternal}
          {selection.exercises.length} exercice{selection.exercises.length > 1
            ? 's'
            : ''} : {selection.exercises.join(', ')} ·
        {/if}
        {date}
      </span>
      {#if selection.shortLink !== undefined}
        <span class="flex flex-row flex-wrap items-center gap-1 text-sm">
          <i
            class="bx bx-link text-coopmaths-action dark:text-coopmathsdark-action"
            aria-hidden="true"
          ></i>
          <a
            class="underline text-coopmaths-action dark:text-coopmathsdark-action break-all"
            href={selection.shortLink.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Lien raccourci de la sélection"
            >{selection.shortLink.url.replace(/^https?:\/\//, '')}</a
          >
          {#if isShortStale}
            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
              title="La sélection a changé depuis la création du lien court : le mettre à jour"
              onclick={onshortlink}>Périmé : mettre à jour</button
            >
          {/if}
          <button
            type="button"
            class={iconButton}
            title={isShortCopied ? 'Lien copié' : 'Copier le lien raccourci'}
            aria-label="Copier le lien raccourci de {selection.name}"
            onclick={oncopyshort}
          >
            <i class="bx {isShortCopied ? 'bx-check' : 'bx-copy'}"></i>
          </button>
          <button
            type="button"
            class={iconButton}
            title="QR code du lien raccourci"
            aria-label="QR code du lien raccourci de {selection.name}"
            onclick={onshortqr}
          >
            <i class="bx bx-qr"></i>
          </button>
        </span>
      {/if}
      {#if selection.comment !== ''}
        <button
          type="button"
          class="mt-1 self-start text-left text-sm whitespace-pre-line line-clamp-3 border-l-2 border-coopmaths-action/50 dark:border-coopmathsdark-action/50 pl-2 hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
          title="Modifier le commentaire"
          onclick={oncomment}
        >
          {selection.comment}
        </button>
      {/if}
    </div>
  </div>
  <div class="flex flex-row flex-wrap items-center gap-0.5 lg:shrink-0">
    <button
      type="button"
      class={iconButton}
      title={isExternal
        ? 'Ouvrir dans un nouvel onglet'
        : `Ouvrir dans un nouvel onglet (vue ${view.label})`}
      aria-label="Ouvrir {selection.name} dans un nouvel onglet"
      onclick={() => onopen()}
    >
      <i class="bx bx-link-external text-lg"></i>
    </button>
    {#if !isExternal}
      {#each QUICK_VIEWS as quick (quick.value)}
        <button
          type="button"
          class={iconButton}
          title="{quick.label} (nouvel onglet)"
          aria-label="{quick.label} : {selection.name}"
          onclick={() => onopen(quick.value)}
        >
          <i class="bx {quick.icon} text-lg"></i>
        </button>
      {/each}
    {/if}
    <span
      class="mx-1 h-5 w-px bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
      aria-hidden="true"
    ></span>
    <button
      type="button"
      class={iconButton}
      title={isCopied ? 'Lien copié' : 'Copier le lien'}
      aria-label="Copier le lien de {selection.name}"
      onclick={oncopy}
    >
      <i class="bx {isCopied ? 'bx-check' : 'bx-link'} text-lg"></i>
    </button>
    {#if !isExternal}
      <button
        type="button"
        class={iconButton}
        title={selection.shortLink === undefined
          ? 'Créer un lien raccourci (edurl.fr)'
          : 'Lien raccourci (edurl.fr)'}
        aria-label="Lien raccourci de {selection.name}"
        onclick={onshortlink}
      >
        <i class="bx bx-collapse-horizontal text-lg"></i>
      </button>
      <button
        type="button"
        class={iconButton}
        title="Réglages : vue, interactivité, présentation, énoncés"
        aria-label="Réglages de {selection.name}"
        onclick={onsettings}
      >
        <i class="bx bx-slider-alt text-lg"></i>
      </button>
      <button
        type="button"
        class={iconButton}
        title="Modifier les exercices dans la conception de document"
        aria-label="Modifier les exercices de {selection.name}"
        onclick={onedit}
      >
        <i class="bx bx-edit text-lg"></i>
      </button>
    {/if}
    <button
      type="button"
      class={iconButton}
      title={selection.comment === ''
        ? 'Ajouter un commentaire'
        : 'Modifier le commentaire'}
      aria-label="Commenter {selection.name}"
      onclick={oncomment}
    >
      <i class="bx bx-comment-edit text-lg"></i>
    </button>
    <button
      type="button"
      class={iconButton}
      title="Renommer"
      aria-label="Renommer {selection.name}"
      onclick={onrename}
    >
      <i class="bx bx-rename text-lg"></i>
    </button>
    <button
      type="button"
      class={iconButton}
      title="Déplacer"
      aria-label="Déplacer {selection.name}"
      onclick={onmove}
    >
      <i class="bx bx-move text-lg"></i>
    </button>
    <button
      type="button"
      class={iconButton}
      title="Dupliquer"
      aria-label="Dupliquer {selection.name}"
      onclick={onduplicate}
    >
      <i class="bx bx-duplicate text-lg"></i>
    </button>
    <button
      type="button"
      class={iconButton}
      title="Supprimer"
      aria-label="Supprimer {selection.name}"
      onclick={ondelete}
    >
      <i class="bx bx-trash text-lg"></i>
    </button>
  </div>
</article>
