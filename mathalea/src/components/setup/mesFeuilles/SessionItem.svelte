<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { SavedSession } from '../../../lib/mesFeuilles/library'
  import { describeSession } from '../../../lib/mesFeuilles/sessionLink'
  import { iconButton, primaryButton, quietText } from './styles'

  /**
   * Une séance de « Mes séances au vidéoprojecteur » : nom, exercices,
   * affichage et actions.
   */
  interface Props {
    session: SavedSession
    /** Dossier de la séance, affiché pendant une recherche */
    location?: string
    date: string
    isDragged: boolean
    isCopied: boolean
    isChecked: boolean
    /** Cases toujours visibles dès qu'un élément est coché */
    isCheckVisible: boolean
    oncheck: () => void
    /** Champ de renommage, à la place du nom */
    renameField?: Snippet
    ondragstart: (event: DragEvent) => void
    onopen: () => void
    oncopy: () => void
    onrename: () => void
    onmove: () => void
    onduplicate: () => void
    ondelete: () => void
  }

  let {
    session,
    location,
    date,
    isDragged,
    isCopied,
    isChecked,
    isCheckVisible,
    oncheck,
    renameField,
    ondragstart,
    onopen,
    oncopy,
    onrename,
    onmove,
    onduplicate,
    ondelete,
  }: Props = $props()

  const summary = $derived(describeSession(session.state))
</script>

<article
  id="session-{session.id}"
  draggable={renameField === undefined}
  {ondragstart}
  class="group flex flex-col lg:flex-row lg:items-center gap-3 rounded-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark px-4 py-3 shadow-sm hover:shadow-md transition-shadow {isDragged
    ? 'opacity-50'
    : ''} {isChecked
    ? 'border-coopmaths-action dark:border-coopmathsdark-action'
    : ''}"
>
  <div class="flex min-w-0 flex-1 flex-row items-start gap-3">
    <input
      type="checkbox"
      class="mt-1.5 size-5 shrink-0 cursor-pointer rounded accent-coopmaths-action {isChecked ||
      isCheckVisible
        ? ''
        : 'md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100'}"
      aria-label="Cocher {session.name}"
      checked={isChecked}
      onchange={oncheck}
    />
    <i
      class="bx bx-chalkboard mt-0.5 text-3xl text-coopmaths-action dark:text-coopmathsdark-action"
      aria-hidden="true"
    ></i>
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      {#if renameField !== undefined}
        <div class="grow">{@render renameField()}</div>
      {:else}
        <h3 class="font-semibold leading-tight" title={session.name}>
          {session.name}
        </h3>
      {/if}
      {#if summary.length > 0}
        <span class={quietText}>{summary.join(' · ')}</span>
      {/if}
      {#if location !== undefined}
        <span class="{quietText} truncate" title={location}>
          <i class="bx bx-folder" aria-hidden="true"></i>
          {location}
        </span>
      {/if}
      <span class="{quietText} truncate" title={session.exercises.join(', ')}>
        {#if session.exercises.length === 0}
          Aucun exercice · {date}
        {:else}
          {session.exercises.length} exercice{session.exercises.length > 1
            ? 's'
            : ''} : {session.exercises.join(', ')} · {date}
        {/if}
      </span>
    </div>
  </div>
  <div class="flex flex-row flex-wrap items-center gap-0.5 lg:shrink-0">
    <button
      type="button"
      class="{primaryButton} px-3 py-1 text-sm"
      title="Rouvrir la séance en vidéoprojection"
      aria-label="Ouvrir {session.name} en vidéoprojection"
      onclick={onopen}
    >
      <i class="bx bx-chalkboard" aria-hidden="true"></i> Ouvrir
    </button>
    <span
      class="mx-1 h-5 w-px bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
      aria-hidden="true"
    ></span>
    <button
      type="button"
      class={iconButton}
      title={isCopied ? 'Lien copié' : 'Copier le lien'}
      aria-label="Copier le lien de {session.name}"
      onclick={oncopy}
    >
      <i class="bx {isCopied ? 'bx-check' : 'bx-link'} text-lg"></i>
    </button>
    <button
      type="button"
      class={iconButton}
      title="Renommer"
      aria-label="Renommer {session.name}"
      onclick={onrename}
    >
      <i class="bx bx-rename text-lg"></i>
    </button>
    <button
      type="button"
      class={iconButton}
      title="Déplacer"
      aria-label="Déplacer {session.name}"
      onclick={onmove}
    >
      <i class="bx bx-move text-lg"></i>
    </button>
    <button
      type="button"
      class={iconButton}
      title="Dupliquer"
      aria-label="Dupliquer {session.name}"
      onclick={onduplicate}
    >
      <i class="bx bx-duplicate text-lg"></i>
    </button>
    <button
      type="button"
      class={iconButton}
      title="Supprimer"
      aria-label="Supprimer {session.name}"
      onclick={ondelete}
    >
      <i class="bx bx-trash text-lg"></i>
    </button>
  </div>
</article>
