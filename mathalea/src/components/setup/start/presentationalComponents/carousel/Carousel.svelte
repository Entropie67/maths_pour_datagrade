<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import legacyCarouselContent from '../../../../../json/carouselContent.json'
  // import carouselContentForCapytale from '../../../../../json/carouselContentForCapytale.json'
  import ButtonTextAction from '../../../../shared/forms/ButtonTextAction.svelte'

  let currentSlideIndex = 0
  let intervalId: number | null = null
  let isPaused = false
  let carouselContainer: HTMLDivElement

  // let carouselContent = $globalOptions.recorder === 'capytale' ? carouselContentForCapytale : legacyCarouselContent
  let carouselContent = legacyCarouselContent

  // Configuration de l'animation
  const SLIDE_DURATION = 5000 // 5 secondes par slide
  const TRANSITION_DURATION = 500 // 500ms pour la transition

  function nextSlide(): void {
    if (carouselContent.slides && carouselContent.slides.length > 0) {
      currentSlideIndex =
        (currentSlideIndex + 1) % carouselContent.slides.length
      scrollToSlide(currentSlideIndex)
    }
  }

  function goToSlide(index: number): void {
    currentSlideIndex = index
    scrollToSlide(index)
  }

  function scrollToSlide(index: number): void {
    if (carouselContainer) {
      const slideWidth = carouselContainer.offsetWidth
      carouselContainer.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth',
      })
    }
  }

  function startAutoPlay(): void {
    if (!intervalId) {
      intervalId = setInterval(nextSlide, SLIDE_DURATION) as unknown as number
    }
  }
  function stopAutoPlay(): void {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function togglePause(): void {
    isPaused = !isPaused
    if (isPaused) {
      stopAutoPlay()
    } else {
      startAutoPlay()
    }
  }
  // Gestionnaires d'événements pour pause au survol
  function handleMouseEnter(): void {
    stopAutoPlay()
  }

  function handleMouseLeave(): void {
    if (!isPaused) {
      startAutoPlay()
    }
  }

  // Gestionnaire de clic sur les indicateurs
  function handleIndicatorClick(index: number): void {
    goToSlide(index)
    // Redémarrer le timer après un clic manuel
    if (!isPaused) {
      stopAutoPlay()
      startAutoPlay()
    }
  }

  onMount(() => {
    // Démarrer l'animation automatique au montage du composant
    startAutoPlay()
  })

  onDestroy(() => {
    // Nettoyer l'intervalle à la destruction du composant
    stopAutoPlay()
  })
</script>

{#if carouselContent.slides && carouselContent.slides.length !== 0}
  <div class="h-full flex flex-col">
    <div
      bind:this={carouselContainer}
      class="carousel w-full flex-1 min-h-0 cursor-pause flex flex-row flex-nowrap overflow-x-scroll snap-x snap-mandatory scroll-smooth scrollbar-hide"
      style="-ms-overflow-style: none; scrollbar-width: none;"
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      role="region"
      aria-label="Caroussel d'images"
    >
      {#each carouselContent.slides as slide, i}
        <div
          id="carousel-item{i}"
          class="carousel-item w-full h-full flex justify-center items-center shrink-0 snap-start"
          style="transition: opacity {TRANSITION_DURATION}ms ease-in-out;"
        >
          <div
            class="flex flex-col justify-center items-center w-full h-full
          bg-cover bg-no-repeat bg-center"
            style="background-image: url('images/carousel/{slide.background}');"
          >
            <div
              class="relative w-full h-full
            {slide.message && slide.message.length !== 0
                ? slide.background && slide.background.length !== 0
                  ? 'bg-coopmaths-canvas/80 dark:bg-coopmathsdark-canvas/80'
                  : 'bg-coopmaths-struct/80 dark:bg-coopmathsdark-struct/80'
                : ''}
            {slide.message &&
              slide.message.length === 0 &&
              slide.background &&
              slide.background.length !== 0
                ? 'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas'
                : slide.message && slide.message.length === 0
                  ? 'bg-coopmaths-struct dark:bg-coopmathsdark-struct'
                  : ''}"
            >
              <div
                class="w-full h-full xl:p-20 lg:p-10 md:p-6 sm:p-4 p-3 flex flex-col gap-4 items-start"
              >
                {#if slide.title && slide.title.length !== 0}
                  <h1
                    class="w-full font-bold
             text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-6xl
             {slide.background && slide.background.length !== 0
                      ? 'text-coopmaths-struct dark:text-coopmathsdark-struct'
                      : 'text-coopmaths-canvas-darkest dark:text-coopmathsdark-canvas-darkest'}"
                  >
                    {slide.title}
                  </h1>
                {/if}
                {#if slide.message && slide.message.length !== 0}
                  {#if slide.image && slide.image.length !== 0}
                    <div class="flex flex-row w-full flex-1 min-h-0 gap-4">
                      <div
                        class="w-full lg:w-1/2 flex justify-start items-center
                        overflow-hidden text-ellipsis
                 px-4 sm:px-6 md:px-8 lg:px-10 font-light
                 text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl 2xl:text-4xl
                 {slide.background && slide.background.length !== 0
                          ? 'text-coopmaths-corpus dark:text-coopmathsdark-corpus'
                          : 'text-coopmaths-canvas dark:text-coopmathsdark-canvas'}"
                      >
                        {slide.message}
                      </div>
                      <div
                        class="hidden lg:flex lg:w-1/2 flex-col flex-1 justify-end items-center gap-4"
                      >
                        <!-- Support for both images and videos -->
                        <div class="carousel-media-wrapper flex-1 min-h-0 flex items-center">
                          {#if slide.image.endsWith('.mp4')}
                            <video
                              class="carousel-media"
                              src="images/carousel/{slide.image}"
                              autoplay
                              loop
                              muted
                              playsinline
                            ></video>
                          {:else}
                            <img
                              class="carousel-media"
                              src="images/carousel/{slide.image}"
                              alt="Image:{slide.image}"
                            />
                          {/if}
                        </div>
                        {#if slide.link && slide.link.length !== 0}
                          <ButtonTextAction
                            text={slide.buttonTitle && slide.buttonTitle.length !== 0
                              ? slide.buttonTitle
                              : 'En savoir plus'}
                            class="inline-flex items-center py-1 px-3 rounded-md font-normal shrink-0"
                            on:click={() => {
                              const w = window.open(
                                slide.link || 'https://coopmaths.fr/alea/',
                                '_blank',
                              )
                              if (w) {
                                w.focus()
                              }
                            }}
                          />
                        {/if}
                      </div>
                    </div>
                  {:else}
                    <div
                      class="w-full flex-1 flex justify-start items-center
                      overflow-hidden text-ellipsis
               px-4 sm:px-6 md:px-8 lg:px-10 font-light
               text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl
               {slide.background && slide.background.length !== 0
                        ? 'text-coopmaths-corpus dark:text-coopmathsdark-corpus'
                        : 'text-coopmaths-canvas dark:text-coopmathsdark-canvas'}"
                    >
                      {slide.message}
                    </div>
                    {#if slide.link && slide.link.length !== 0}
                      <ButtonTextAction
                        text={slide.buttonTitle && slide.buttonTitle.length !== 0
                          ? slide.buttonTitle
                          : 'En savoir plus'}
                        class="inline-flex items-center py-1 px-3 rounded-md font-normal"
                        on:click={() => {
                          const w = window.open(
                            slide.link || 'https://coopmaths.fr/alea/',
                            '_blank',
                          )
                          if (w) {
                            w.focus()
                          }
                        }}
                      />
                    {/if}
                  {/if}
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
    <div class="flex w-full justify-center gap-2 py-2">
      {#each carouselContent.slides as slide, i}
        <button
          class="btn btn-xs border-0 px-2 py-1 rounded-lg text-xs
            {i === currentSlideIndex
            ? 'bg-coopmaths-light text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas-dark'
            : 'bg-coopmaths-canvas-darkest text-coopmaths dark:bg-coopmathsdark-canvas-dark dark:text-coopmathsdark-action'} font-light transition-all duration-200"
          on:click={() => handleIndicatorClick(i)}
          aria-label="Aller au slide {i + 1}"
        >
          {i + 1}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .cursor-pause {
    cursor:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23374151'%3E%3Crect x='6' y='4' width='4' height='16' rx='1'/%3E%3Crect x='14' y='4' width='4' height='16' rx='1'/%3E%3C/svg%3E")
        12 12,
      pointer;
  }

  .carousel-media-wrapper {
    position: relative;
    display: inline-block;
    max-width: 100%;
    max-height: 100%;
  }

  .carousel-media-wrapper::after {
    content: '';
    position: absolute;
    top: 3%;
    left: 3%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.25) 0%,
      rgba(0, 0, 0, 0.1) 100%
    );
    border-radius: 0.5rem;
    z-index: -1;
  }

  .carousel-media {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: scale-down;
    border-radius: 0.5rem;
    border: 2px solid rgba(0, 0, 0, 0.1);
    background: white;
  }

  :global(.dark) .carousel-media-wrapper::after {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
  }

  :global(.dark) .carousel-media {
    border-color: rgba(255, 255, 255, 0.1);
    background: #1f2937;
  }
</style>
