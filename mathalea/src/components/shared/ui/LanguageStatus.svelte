<script lang="ts">
  import { languages } from '../../../lib/components/languagesUtils'
  import type { Language } from '../../../lib/types/languages'
  export let locale: Language
</script>

<div
  class={`${$$props.class || ''} relative flex justify-center items-center  text-coopmaths-struct dark:text-coopmathsdark-struct`}
>
  <i class="bx bx-sm bx-world"></i>
  <div class="absolute -bottom-1 -right-1 text-xs font-bold font-mono">
    {languages[locale].short}
  </div>
</div>
