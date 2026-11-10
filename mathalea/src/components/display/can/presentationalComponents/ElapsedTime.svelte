<script lang="ts">
  export let widthFactor: number
  export let displayedTime: string
</script>

<div
  class="w-full bg-coopmaths-canvas dark:bg-coopmathsdark-canvas flex flex-row"
>
  <div
    class="relative h-5 bg-coopmaths-warn-500 dark:bg-coopmathsdark-struct-dark"
    style="width: calc( 100% * {widthFactor} );"
  >
    <div
      id="time-display-1"
      class="{widthFactor <= 0.2
        ? 'hidden'
        : ''} absolute right-2 top-1/2 -translate-y-1/2 text-coopmaths-corpus dark:text-coopmaths-corpus font-extralight dark:font-light text-lg"
    >
      {displayedTime}
    </div>
  </div>
  <div
    class="relative h-5 bg-coopmaths-action/70 dark:bg-coopmathsdark-warn-light/70"
    style="width: calc( 100% * ( 1 - {widthFactor} ) );"
  >
    <div
      id="time-display-2"
      class="{widthFactor > 0.2
        ? 'hidden'
        : ''} absolute left-2 top-1/2 -translate-y-1/2 text-coopmaths-corpus dark:text-coopmaths-corpus font-extralight dark:font-light text-lg"
    >
      {displayedTime}
    </div>
  </div>
</div>
