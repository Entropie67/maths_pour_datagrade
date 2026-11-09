<script lang="ts">
  import { isMathadataUuid } from '../../../../lib/components/mathadataReferentiel'
  import type { InterfaceParams } from '../../../../lib/types'

  export let exercicesParams: InterfaceParams[]

  $: hasMathadataExercise = exercicesParams.some((e) => isMathadataUuid(e.uuid))
</script>

{#if hasMathadataExercise}
  <div
    id="mathadata-banner"
    class="flex flex-col gap-3 w-full rounded-lg border border-coopmaths-struct dark:border-coopmathsdark-struct bg-coopmaths-canvas dark:bg-coopmathsdark-canvas p-4 mb-4 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    <p>
      <strong>MathAdata</strong> développe des exercices pour
      enseigner les notions du programme en résolvant des défis d'intelligence artificielle.
      La séquence proposée comprend un TP numérique, une vidéo et des ressources additionnelles.
    </p>
    <div>
      <a
        href="https://mathadata.fr/fr/lycee/ressources"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block rounded bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas px-4 py-2 font-semibold hover:opacity-90"
      >
        Voir toutes les ressources de MathAdata
      </a>
    </div>
    <p>
      Partagez vos retours d'usage ou vos questions pour contribuer à
      l'évolution de MathAdata : <a
        href="mailto:contact@mathadata.fr"
        class="underline">contact@mathadata.fr</a
      >
    </p>
  </div>
{/if}
