<script lang="ts">
  import BasicClassicModal from '../../../shared/modal/BasicClassicModal.svelte'
  import backgroundsManifest from '../../../../json/quizzBackgrounds.json'

  export let isDisplayed: boolean
  export let selected: string | undefined
  export let onSelect: (image: string) => void

  function choose(image: string) {
    onSelect(image)
    isDisplayed = false
  }
</script>

<BasicClassicModal bind:isDisplayed icon="bx-image">
  <h3 slot="header" class="font-bold text-xl">Choisir un fond d'écran</h3>
  <div slot="content">
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
      {#each backgroundsManifest as image}
        <button
          type="button"
          class="relative rounded-lg overflow-hidden shadow
          ring-2 transition
          {selected === image
          ? 'ring-coopmaths-action dark:ring-coopmathsdark-action'
          : 'ring-transparent hover:ring-coopmaths-struct-light'}"
          on:click={() => choose(image)}
        >
          <img
            src="images/quizz/backgrounds/{image}"
            alt={image}
            class="w-full h-24 object-cover"
          />
          {#if selected === image}
            <span
              class="absolute top-1 right-1 flex items-center justify-center
              h-6 w-6 rounded-full
              bg-coopmaths-action text-coopmaths-canvas
              dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas"
            >
              <i class="bx bx-check text-lg"></i>
            </span>
          {/if}
        </button>
      {/each}
    </div>
    {#if backgroundsManifest.length === 0}
      <p
        class="font-light text-sm italic
        text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
      >
        Aucune image disponible : déposez des fichiers dans
        public/images/quizz/backgrounds/.
      </p>
    {/if}
  </div>
</BasicClassicModal>
