<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { parseTbiLink, type TbiLinkContent } from '../../../lib/tbiLink'

  interface Props {
    /** Lien valide saisi par le professeur */
    onSubmit: (content: TbiLinkContent) => void
    /** Bouton « Annuler » (formulaire ouvert depuis la barre du visualiseur) */
    onCancel?: () => void
    /** Valeur initiale (lien qui n'a pas pu être affiché) */
    initialValue?: string
    autofocus?: boolean
  }

  let {
    onSubmit,
    onCancel,
    initialValue = '',
    autofocus = false,
  }: Props = $props()

  // valeur de départ seulement : la saisie ne suit plus la prop ensuite
  let value = $state(untrack(() => initialValue))
  let error = $state('')
  let input: HTMLInputElement

  onMount(() => {
    if (autofocus) input.focus({ preventScroll: true })
  })

  function submit(event: SubmitEvent) {
    event.preventDefault()
    const content = parseTbiLink(value)
    if (content === null) {
      error = 'Saisir une adresse internet (https://…).'
      return
    }
    error = ''
    onSubmit(content)
  }
</script>

<form class="flex flex-col gap-1 w-full max-w-md" onsubmit={submit}>
  <div class="flex flex-row items-center gap-2">
    <input
      bind:this={input}
      bind:value
      type="text"
      inputmode="url"
      autocomplete="off"
      spellcheck="false"
      placeholder="Coller un lien : PDF, image, vidéo, GeoGebra, page web…"
      aria-label="Lien du document, de la vidéo ou de la page"
      class="flex-1 min-w-0 h-12 px-3 rounded-xl text-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      oninput={() => (error = '')}
      onkeydown={(event) => {
        if (event.key === 'Escape' && onCancel) {
          event.stopPropagation()
          onCancel()
        }
      }}
    />
    <button
      type="submit"
      class="h-12 px-5 rounded-xl shrink-0 text-lg font-semibold text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-action hover:bg-coopmaths-action-darkest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-darkest"
    >
      Afficher
    </button>
    {#if onCancel}
      <button
        type="button"
        class="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest"
        title="Annuler (Échap)"
        aria-label="Annuler"
        onclick={onCancel}
      >
        <i class="bx bx-x text-xl"></i>
      </button>
    {/if}
  </div>
  {#if error}
    <p
      class="text-xs text-left px-3 text-coopmaths-warn-dark dark:text-coopmathsdark-warn-dark"
    >
      {error}
    </p>
  {/if}
</form>
