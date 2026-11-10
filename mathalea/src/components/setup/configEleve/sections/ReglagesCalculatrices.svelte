<script lang="ts">
  import {
    CALCULATRICES_FORCEES_OPTIONS,
    CALCULATRICES_NON_FORCEES,
    isCalculatricesForcees,
  } from '../../../../lib/calculatrices'
  import type { InterfaceGlobalOptions } from '../../../../lib/types'
  import FormRadio from '../../../shared/forms/FormRadio.svelte'

  export let globalOptions: InterfaceGlobalOptions

  let calculatricesForcees: string =
    globalOptions.calculatricesForcees ?? CALCULATRICES_NON_FORCEES
</script>

<div class="pb-2">
  <div
    class="pl-2 pb-2 font-bold text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Calculatrices
  </div>
  <FormRadio
    title="Calculatrices"
    bind:valueSelected={calculatricesForcees}
    on:newvalue={() => {
      if (isCalculatricesForcees(calculatricesForcees)) {
        globalOptions.calculatricesForcees = calculatricesForcees
      }
    }}
    labelsValues={CALCULATRICES_FORCEES_OPTIONS}
  />
  <div
    class="pl-2 pt-2 text-sm font-light text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
  >
    Un choix autre que « selon les réglages de chaque exercice » s'applique à
    tous les exercices.
  </div>
</div>
