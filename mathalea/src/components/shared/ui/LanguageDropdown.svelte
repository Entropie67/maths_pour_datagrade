<script lang="ts">
  import { languages } from '../../../lib/components/languagesUtils'
  import type { Language } from '../../../lib/types/languages'
  import { ALLOWED_LANGUAGES } from '../../../lib/types/languages'
  import LanguageIcon from './LanguageIcon.svelte'
  export let locale: Language
  let isMenuOpen: boolean = false
  export let handleLanguage: (lang: string) => void
</script>

<div class="w-full group inline-block relative">
  <button
    type="button"
    class="flex flex-row justify-start items-center"
    aria-label="Langue du référentiel : {languages[locale].short}"
    aria-haspopup="true"
    aria-expanded={isMenuOpen}
    aria-controls="languageChoiceMenu"
    on:click={() => {
      isMenuOpen = !isMenuOpen
    }}
  >
    <LanguageIcon {locale} />
    <i
      class="bx bx-chevron-down {isMenuOpen
        ? 'rotate-180'
        : 'rotate-0'} transition-transform ease-in-out duration-300 text-coopmaths-action dark:text-coopmathsdark-action"
      aria-hidden="true"
    ></i>
  </button>
  <ul
    id="languageChoiceMenu"
    class="{isMenuOpen ? '' : 'hidden'}
    w-full relative md:absolute md:top-5 md:right-0 min-w-60 flex flex-col justify-start items-end shadow-lg"
  >
    {#each ALLOWED_LANGUAGES as loc}
      {@const lang = languages[loc]}
      <li
        class="w-full space-x-2 py-2 px-4 font-light bg-coopmaths-canvas dark:bg-coopmathsdark-canvas hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark"
      >
        <button
          type="button"
          class="w-full flex flex-row space-x-2 justify-end items-center text-coopmaths-action dark:text-coopmathsdark-action"
          id="languageChoice{lang.short}"
          aria-current={loc === locale ? 'true' : undefined}
          on:click={() => {
            handleLanguage(loc)
            isMenuOpen = false
          }}
        >
          <div class="flex flex-row items-center">
            {#if loc === locale}
              <i class="bx bx-check pr-2" aria-hidden="true"></i>
            {/if}
            <span>Référentiel {lang.long}</span>
          </div>
          <div>
            <LanguageIcon locale={loc} />
          </div>
        </button>
      </li>
    {/each}
  </ul>
</div>
