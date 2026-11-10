<script lang="ts">
  import { languages } from '../../../lib/components/languagesUtils'
  import { ALLOWED_LANGUAGES } from '../../../lib/types/languages'
  import type { Language } from '../../../lib/types/languages'
  import LanguageIcon from '../ui/LanguageIcon.svelte'
  import BasicClassicModal from './BasicClassicModal.svelte'

  export let showLanguageChoiceModal: boolean
  export let handleLanguage: (lang: string) => void
  export let locale: Language
</script>

<BasicClassicModal bind:isDisplayed={showLanguageChoiceModal}>
  <div slot="header" class="text-2xl w-full">Langue du Référentiel</div>
  <div slot="content">
    <ul class="p2 flex flex-col justify-start items-end">
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
              showLanguageChoiceModal = false
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
</BasicClassicModal>
