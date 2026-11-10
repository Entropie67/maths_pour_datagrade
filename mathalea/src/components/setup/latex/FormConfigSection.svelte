<script lang="ts">
  import type Latex from '../../../lib/Latex'
  import type { LatexFileInfos } from '../../../lib/LatexTypes'
  import ButtonConfig from '../../shared/forms/ButtonConfig.svelte'
  import FormRadio from '../../shared/forms/FormRadio.svelte'
  import InputNumber from '../../shared/forms/InputNumber.svelte'
  import InputText from '../../shared/forms/InputText.svelte'

  export let latexFileInfos: LatexFileInfos
  export let latex: Latex
  export let promise: Promise<any> | null = null

  const modeleOptions = [
    { label: '(aucune)', value: '' },
    { label: 'Brevet', value: 'Brevet' },
    { label: 'Bac', value: 'Bac' },
    { label: 'DS', value: 'DS' },
  ]

  const isExerciceStaticInTheList = latex.isExerciceStaticInTheList()
</script>

<h5
  class="mb-2 text-3xl font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
>
  Mise en page
</h5>
<h6
  class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
>
  Modèle
</h6>
<FormRadio
  title="Style"
  orientation={'col'}
  bind:valueSelected={latexFileInfos.style}
  labelsValues={[
    { label: 'Classique', value: 'Classique' },
    { label: 'ProfMaquette', value: 'ProfMaquette' },
    { label: 'Coopmaths', value: 'Coopmaths' },
    {
      label: 'Course aux nombres',
      value: 'Can',
      isDisabled: isExerciceStaticInTheList,
    },
  ]}
/>
{#if latexFileInfos.style === 'Coopmaths' || latexFileInfos.style === 'Classique' || latexFileInfos.style === 'ProfMaquetteQrcode'}
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Police de caractères
  </h6>
  <FormRadio
    title="fontOption"
    orientation={'col'}
    bind:valueSelected={latexFileInfos.fontOption}
    labelsValues={[
      { label: 'Standard', value: 'StandardFont' },
      { label: 'Dys', value: 'DysFont' },
    ]}
  />
  {#if latexFileInfos.fontOption === 'StandardFont'}
    <span class="flex items-center gap-2 w-30">
      Taille:
      <InputNumber
        id="export-latex-taille-input"
        min={8}
        max={20}
        bind:value={latexFileInfos.tailleFontOption}
      />
    </span>
  {/if}
  {#if latexFileInfos.fontOption === 'DysFont'}
    <span class="flex items-center gap-2 w-30">
      Taille:
      <InputNumber
        id="export-latex-dys-taille-input"
        min={8}
        max={20}
        bind:value={latexFileInfos.dysTailleFontOption}
      />
    </span>
  {/if}
{/if}
{#if latexFileInfos.style === 'Can'}
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Options
  </h6>
  <FormRadio
    title="durationCanOption"
    orientation={'col'}
    bind:valueSelected={latexFileInfos.correctionOption}
    labelsValues={[
      { label: 'Avec correction', value: 'AvecCorrection' },
      { label: 'Sans correction', value: 'SansCorrection' },
    ]}
  />
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Police de caractères
  </h6>
  <FormRadio
    title="fontOption"
    orientation={'col'}
    bind:valueSelected={latexFileInfos.fontOption}
    labelsValues={[
      { label: 'Standard', value: 'StandardFont' },
      { label: 'Dys', value: 'DysFont' },
    ]}
  />
  {#if latexFileInfos.fontOption === 'StandardFont'}
    <span class="flex items-center gap-2 w-30">
      Taille:
      <InputNumber
        id="export-latex-can-taille-input"
        min={8}
        max={20}
        bind:value={latexFileInfos.tailleFontOption}
      />
    </span>
  {/if}
  {#if latexFileInfos.fontOption === 'DysFont'}
    <span class="flex items-center gap-2 w-30">
      Taille :
      <InputNumber
        id="export-latex-can-dys-taille-input"
        min={8}
        max={20}
        bind:value={latexFileInfos.dysTailleFontOption}
      />
    </span>
  {/if}
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Durée :
  </h6>
  <span class="w-30">
    <InputText
      inputID="export-latex-duree-input"
      placeholder="9 min"
      bind:value={latexFileInfos.durationCanOption}
      showTitle={false}
      classAddenda="placeholder:opacity-40"
    />
  </span>
{/if}
{#if latexFileInfos.style === 'ProfMaquette'}
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Options
  </h6>
  <FormRadio
    title="correctionOption"
    orientation={'col'}
    bind:valueSelected={latexFileInfos.correctionOption}
    labelsValues={[
      { label: 'Avec correction', value: 'AvecCorrection' },
      { label: 'Sans correction', value: 'SansCorrection' },
    ]}
  />
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Format
  </h6>
  <FormRadio
    title="typeFiche"
    orientation={'col'}
    bind:valueSelected={latexFileInfos.typeFiche}
    labelsValues={[
      { label: 'Fiche', value: 'Fiche' },
      { label: 'Évaluation', value: 'Eval' },
    ]}
  />
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Configuration
  </h6>
  {#await promise}
    <p>Chargement en cours...</p>
  {:then}
    <ButtonConfig
      class=""
      {latex}
      {latexFileInfos}
      callback={(tex) => {
        latexFileInfos = tex // force la réactivité
      }}
    />
  {/await}
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Exercices
  </h6>
  <FormRadio
    title="titlenOption"
    orientation={'col'}
    bind:valueSelected={latexFileInfos.titleOption}
    labelsValues={[
      { label: 'Avec titre', value: 'AvecTitre' },
      { label: 'Sans titre', value: 'SansTitre' },
    ]}
  />
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Police de caractères
  </h6>
  <FormRadio
    title="fontOption"
    orientation={'col'}
    bind:valueSelected={latexFileInfos.fontOption}
    labelsValues={[
      { label: 'Standard', value: 'StandardFont' },
      { label: 'Dys', value: 'DysFont' },
    ]}
  />
  {#if latexFileInfos.fontOption === 'StandardFont'}
    <span class="flex items-center gap-2 w-30">
      Taille:
      <InputNumber
        id="export-latex-prof-taille-input"
        min={8}
        max={20}
        bind:value={latexFileInfos.tailleFontOption}
      />
    </span>
  {/if}
  {#if latexFileInfos.fontOption === 'DysFont'}
    <span class="flex items-center gap-2 w-30">
      Taille:
      <InputNumber
        id="export-latex-prof-dys-taille-input"
        min={8}
        max={20}
        bind:value={latexFileInfos.dysTailleFontOption}
      />
    </span>
  {/if}
  <h6
    class="mb-2 text-lg font-black leading-tight text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
  >
    Qrcode
  </h6>
  <FormRadio
    title="qrcodeOption"
    orientation={'col'}
    bind:valueSelected={latexFileInfos.qrcodeOption}
    labelsValues={[
      { label: 'Avec', value: 'AvecQrcode' },
      { label: 'Sans', value: 'SansQrcode' },
    ]}
  />
{/if}
