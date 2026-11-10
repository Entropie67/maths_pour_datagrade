<script lang="ts">
  import carouselContent from '../../../../../json/carouselContent.json'
</script>

{#if carouselContent.slides && carouselContent.slides.length !== 0}
  <div class="flex flex-col gap-3 px-4 pt-3 pb-3">
    {#each carouselContent.slides.filter((s) => s.mobileVisible !== false) as slide}
      {#if slide.link && slide.link.length !== 0}
        <a
          href={slide.link}
          target="_blank"
          rel="noopener noreferrer"
          class="block rounded-lg p-4 bg-coopmaths-action dark:bg-coopmathsdark-action hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest transition-colors duration-150"
        >
          {#if slide.title && slide.title.length !== 0}
            <h2 class="font-bold text-base text-white dark:text-white">
              {slide.title}
            </h2>
          {/if}
          {#if slide.message && slide.message.length !== 0}
            <p class="font-light text-sm mt-1 text-coopmaths-canvas dark:text-coopmathsdark-canvas">
              {slide.message}
            </p>
          {/if}
          <span class="text-xs mt-2 inline-block text-coopmaths-canvas-dark dark:text-coopmathsdark-canvas-dark">
            {slide.buttonTitle && slide.buttonTitle.length !== 0 ? slide.buttonTitle : 'En savoir plus'} →
          </span>
        </a>
      {:else}
        <div class="rounded-lg p-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark">
          {#if slide.title && slide.title.length !== 0}
            <h2 class="font-bold text-base text-coopmaths-struct dark:text-coopmathsdark-struct">
              {slide.title}
            </h2>
          {/if}
          {#if slide.message && slide.message.length !== 0}
            <p class="font-light text-sm mt-1 text-coopmaths-corpus dark:text-coopmathsdark-corpus">
              {slide.message}
            </p>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
{/if}
