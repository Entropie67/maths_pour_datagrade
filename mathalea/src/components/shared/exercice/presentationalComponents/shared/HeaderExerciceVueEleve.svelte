<script lang="ts">
  export let isMenuNeededForExercises: boolean
  export let presMode: string | undefined
  export let title: string
  export let indiceExercice: number
  export let showNumber = true
  export let seed: string | undefined
  /** Facteur de zoom appliqué à l'énoncé (option `z` de l'URL) : le titre doit
   *  suivre la même échelle que le corps de l'exercice. */
  export let zoom: number | string = 1

  // `text-xl` = 1.25rem, `text-lg` = 1.125rem : on conserve ce rapport et on le
  // multiplie par le zoom pour que le titre grandisse avec l'énoncé.
  $: isBigTitle = isMenuNeededForExercises && presMode !== 'liste_exos'
  $: titleFontSize = (isBigTitle ? 1.25 : 1.125) * (Number(zoom) || 1)
</script>

<!--
  @component
  Barre de titre et d'actions au-dessus d'un exercice

  __Utilisation__ :

  ```tsx
  const headerExerciceProps = {
    title: exercice.titre,
    indiceExercice: 2
  }
  <HeaderExerciceVueEleve {...headerExerciceProps}/>
  ```
 -->

<div class="z-0 flex-1">
  <h1
    id="headerExoVueEleve-{indiceExercice}"
    class=" text-coopmaths-struct dark:text-coopmathsdark-struct pb-2 flex {isMenuNeededForExercises
      ? 'flex-col items-start'
      : 'flex-row items-center'}"
  >
    <!-- titre -->
    <div
      class="flex flex-row justify-start items-start"
      id="exerciceHeader{indiceExercice}"
    >
      <div class={showNumber ? 'flex' : 'hidden'}>
        <div
          class="{isMenuNeededForExercises && presMode !== 'liste_exos'
            ? 'hidden'
            : 'inline-flex'} items-center justify-center h-6 w-6 bg-coopmaths-struct text-coopmaths-canvas font-light text-lg lg:text-normal translate-y-1"
        >
          {indiceExercice + 1}
        </div>
      </div>
      <div
        class="font-light ml-2"
        style="font-size: {titleFontSize}rem; line-height: 1.3;"
      >
        {title}

        <span class="text-[#FEFEFE] select-none pointer-events-none touch-none"
          >{seed}</span
        >
      </div>
    </div>
  </h1>
</div>
