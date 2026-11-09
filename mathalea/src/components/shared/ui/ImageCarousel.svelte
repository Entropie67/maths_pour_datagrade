<script lang="ts">
  import { onDestroy, onMount } from 'svelte'

  export let images: { src: string; alt: string }[] = []
  export let interval: number = 3000

  let currentIndex = 0
  let intervalId: ReturnType<typeof setInterval> | null = null

  function nextSlide() {
    currentIndex = (currentIndex + 1) % images.length
  }

  function startAutoPlay() {
    if (!intervalId && images.length > 1) {
      intervalId = setInterval(nextSlide, interval)
    }
  }

  function stopAutoPlay() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onMount(() => {
    startAutoPlay()
  })

  onDestroy(() => {
    stopAutoPlay()
  })
</script>

<div class="relative w-full overflow-hidden">
  {#each images as image, i}
    <div
      class="w-full transition-opacity duration-300 ease-in-out {i === currentIndex ? 'block opacity-100' : 'hidden opacity-0'}"
    >
      <img
        src={image.src}
        alt={image.alt}
        class="block h-auto w-full rounded-r-lg"
      />
    </div>
  {/each}
</div>
