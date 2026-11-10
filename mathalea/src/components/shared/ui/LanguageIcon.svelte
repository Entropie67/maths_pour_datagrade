<script lang="ts">
  import {
    buildLangIconPath,
    languages,
  } from '../../../lib/components/languagesUtils'
  import type { Language } from '../../../lib/types/languages'
  export let locale: Language
</script>

<img
  src={buildLangIconPath(languages[locale].short)}
  alt={languages[locale].short}
  class="h-4 w-4"
/>
