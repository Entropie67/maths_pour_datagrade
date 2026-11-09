<script lang="ts">
  import type { QuizzBackgroundParam } from '../../../../modules/quizz/types'
  import backgroundsManifest from '../../../../json/quizzBackgrounds.json'

  /**
   * Fond d'écran du quizz : aucun (fond blanc), image fixe, ou image
   * aléatoire renouvelée à chaque question (suivi de questionIndex).
   */
  export let background: QuizzBackgroundParam
  export let questionIndex: number = 0

  const images: string[] = backgroundsManifest
  let currentRandom: string | undefined

  $: if (background.mode === 'random' && images.length > 0) {
    pickRandom(questionIndex)
  }

  function pickRandom(_index: number) {
    let next: string
    do {
      next = images[Math.floor(Math.random() * images.length)]
    } while (images.length > 1 && next === currentRandom)
    currentRandom = next
  }

  $: currentImage =
    background.mode === 'fixed' &&
    background.image != null &&
    images.includes(background.image)
      ? background.image
      : background.mode === 'random'
        ? currentRandom
        : undefined
  export let onImageChange: (onImage: boolean) => void = () => {}
  $: onImageChange(currentImage !== undefined)
</script>

{#if currentImage !== undefined}
  <div class="fixed inset-0 -z-10 overflow-hidden">
    <img
      src="images/quizz/backgrounds/{currentImage}"
      alt=""
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-black/30"></div>
  </div>
{/if}
