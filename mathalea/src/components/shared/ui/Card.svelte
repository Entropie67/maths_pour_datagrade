<script lang="ts">
  import type { AppTierce } from '../../../lib/types/referentiels'
  import StarIcon from '../icons/StarIcon.svelte'
  import { exercicesParams } from '../../../lib/stores/generalStore'

  export let application: AppTierce = {
    title: 'Titre',
    presentation: ' blabla',
    imgPath: 'images/apps/appDefault.png',
    uuid: 'theUuid',
  }
  export let reversed: boolean = false
  export let selected: boolean = false
  export let loadImages: boolean = true // Pour éviter le chargement des images lorsque la carte n'est pas visible à l'écran

  let listeCodes: string[]
  // on compte réactivement le nombre d'occurences
  // de la ressource dans la liste des sélectionnés
  $: {
    listeCodes = []
    for (const entry of $exercicesParams) {
      listeCodes.push(entry.uuid)
    }
    listeCodes = listeCodes
  }

  function addAppToList() {
    exercicesParams.update((list) => [...list, { uuid: application.uuid }])
  }
  const isPresent = (code: string) => {
    return code === application.uuid
  }
  function removeAppFromList() {
    const matchingIndex = listeCodes.findIndex(isPresent)
    exercicesParams.update((list) => [
      ...list.slice(0, matchingIndex),
      ...list.slice(matchingIndex + 1),
    ])
  }
  function handelSelection() {
    selected = !selected
    if (selected) {
      addAppToList()
    } else {
      removeAppFromList()
    }
  }
</script>

<button
  type="button"
  class="relative block w-full rounded-lg bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark shadow-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
  on:click={handelSelection}
>
  <div class="{reversed ? 'hide' : 'block'} ">
    {#if loadImages}
      <img
        src={application.imgPath}
        alt="{application.title} image"
        class="object-fill rounded-t-lg"
      />
    {:else}
      <div
        class="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center"
      >
        <span class="text-gray-500">Image à charger...</span>
      </div>
    {/if}
  </div>
  <div class="p-2 text-left">
    <h5
      class="mb-2 text-lg font-bold leading-tight text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {application.title}
    </h5>
    <p
      class="max-h-24 min-h-24 h-24 text-sm text-ellipsis overflow-hidden mb-4 font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus leading-tight"
    >
      {application.presentation}
    </p>
  </div>
  <div class="absolute -bottom-4 left-1/2 -translate-x-1/2">
    <div
      class="rounded-full h-8 w-8 bg-coopmaths-action text-coopmaths-canvas flex justify-center items-center hover:animate-pulse"
    >
      <i class="bx bx-sm {selected ? 'bx-minus' : 'bx-plus'}"></i>
    </div>
  </div>
  {#if selected}
    <div class="absolute top-3 right-3 rotate-frac">
      <div class="relative">
        <StarIcon
          class="container top-0 left-0 h-12 w-12 text-coopmaths-warn-800 dark:text-coopmathsdark-warn"
        />
        <i
          class="container absolute top-1 left-[0.1rem] bx bx-check bx-md text-coopmaths-canvas dark:text-coopmathsdark-canvas"
        ></i>
      </div>
    </div>
  {/if}
</button>

<style>
  @-webkit-keyframes rotation {
    0%,
    70% {
      -webkit-transform: rotate(0deg);
    }
    80%,
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes rotation {
    0%,
    70% {
      transform: rotate(0deg);
    }
    80%,
    100% {
      transform: rotate(360deg);
    }
  }
  .rotate-frac {
    -webkit-animation: rotation 4s infinite linear;
    animation: rotation 4s infinite linear;
  }
</style>
