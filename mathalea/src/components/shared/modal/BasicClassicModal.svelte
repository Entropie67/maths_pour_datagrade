<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte'
  import ButtonIcon from '../forms/ButtonIcon.svelte'

  export let isDisplayed: boolean // à bind avec le parent
  export let icon: string = ''
  export let isWithCloseButton: boolean = true

  const dispatch = createEventDispatcher()

  let dialog: HTMLDialogElement

  onMount(async () => {
    await tick() // Attendre que tous les bindings soient appliqués
    if (dialog && isDisplayed) {
      dialog.showModal()
    }
  })

  $: {
    if (dialog && isDisplayed) dialog.showModal()
    else if (dialog && !isDisplayed) dialog.close()
  }
</script>

<div class="flex justify-center">
  <!-- pour que la modale ne soit pas affectée par les modifications de marge de ses parents -->

  <!-- Ceux qui n'ont pas de souris ont le focus sur le bouton de la croix pour fermer donc ce n'est pas grave s'ils ne peuvent pas fermer en interagissant avec le fond de la modale -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <dialog
    bind:this={dialog}
    on:click|self={() => dialog.close()}
    on:close={() => {
      isDisplayed = false
      dispatch('close')
    }}
    class="m-auto rounded-xl
      w-full md:w-2/3 xl:w-1/2
      text-coopmaths-corpus dark:text-coopmathsdark-corpus
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <div class="relative p-6 text-center">
      {#if isWithCloseButton}
        <ButtonIcon
          icon="bx-x text-2xl"
          ariaLabel="Fermer"
          class="absolute top-3 right-3"
          on:click={() => dialog.close()}
        />
      {/if}
      {#if icon !== ''}
        <div
          class="flex items-center justify-center h-12 w-12 mx-auto mt-2 mb-6 rounded-full
          bg-coopmaths-warn-100 text-coopmaths-warn-darkest"
        >
          <i class="bx bx-sm {icon}"></i>
        </div>
      {/if}
      <div
        class="w-full mb-4
        text-2xl font-bold
        text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <slot name="header" />
      </div>
      <div class="w-full">
        <slot name="content" />
      </div>
      <div class="w-full mt-6 mb-3">
        <slot name="footer" />
      </div>
    </div>
  </dialog>
</div>
