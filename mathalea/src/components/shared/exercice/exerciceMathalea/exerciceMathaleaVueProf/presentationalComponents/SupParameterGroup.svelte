<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import {
    POIDS_MAX_DEFAUT,
    type FormulaireComplexe as FormulaireComplexeType,
    type ItemPondere,
  } from '../../../../../../lib/formulaireComplexe'
  import {
    itemsFormulaireTexte,
    parseCasFormulaireTexte,
    serialiseItemsFormulaireTexte,
    type CasFormulaireTexte,
  } from '../../../../../../lib/formulaireTexteListe'
  import type { IExercice } from '../../../../../../lib/types'
  import CheckboxWithLabel from '../../../../forms/CheckboxWithLabel.svelte'
  import InputNumber from '../../../../forms/InputNumber.svelte'
  import InputText from '../../../../forms/InputText.svelte'
  import SelectUnique from '../../../../forms/SelectUnique.svelte'
  import FormulaireComplexe from './FormulaireComplexe.svelte'
  import ListePondereeItems from './ListePondereeItems.svelte'

  export let supIndex: 1 | 2 | 3 | 4 | 5
  export let exercice: IExercice
  export let exerciceIndex: number
  export let supValue: any
  export let formNum: { titre: string; champs: string[] | number } | undefined =
    undefined
  export let categoriesForm:
    | {
        titre: string
        categories: { label: string; max: number }[]
        defaut: number[]
      }
    | undefined = undefined
  export let formulaireComplexe: FormulaireComplexeType | undefined = undefined

  const dispatch = createEventDispatcher()

  $: suffix = supIndex === 1 ? '' : supIndex.toString()

  $: caseACocher =
    exercice[`besoinFormulaire${suffix}CaseACocher` as keyof IExercice]
  $: texte = exercice[`besoinFormulaire${suffix}Texte` as keyof IExercice]

  /**
   * Cas énumérés par l'aide du formulaire texte, quand elle s'y prête : ils sont
   * alors présentés comme une liste pondérée plutôt que comme un champ à remplir
   * avec des numéros séparés par des tirets. `null` sinon (champ texte libre).
   */
  $: casTexte = Array.isArray(texte)
    ? parseCasFormulaireTexte((texte as [string, string])[1])
    : null

  let itemsTexte: ItemPondere[] = []
  let listeTexteOuverte = true
  /**
   * Dernière valeur de `supValue` reflétée par `itemsTexte`. `null` tant que rien
   * n'a été lu, pour distinguer l'initialisation d'un `sup` vide.
   */
  let derniereSaisie: string | null = null
  /** Cas dont `itemsTexte` est issu, pour les relire si l'exercice change. */
  let derniersCas: CasFormulaireTexte | null = null

  // Recharge les cases si `sup` change ailleurs (URL partagée, exercice réinitialisé).
  $: if (
    casTexte !== null &&
    (casTexte !== derniersCas || String(supValue ?? '') !== derniereSaisie)
  ) {
    if (casTexte !== derniersCas) listeTexteOuverte = true
    derniersCas = casTexte
    derniereSaisie = String(supValue ?? '')
    itemsTexte = itemsFormulaireTexte(casTexte, supValue)
  }

  $: textOptions = exercice.textFormOptions?.[supIndex]
  $: minimumSelections = textOptions?.minSelections ?? 0
  $: weighted = textOptions?.weighted !== false
  $: nombreCasCoches = itemsTexte.filter((item) => item.poids > 0).length

  /**
   * Range les cases cochées dans `supValue`, sous la forme historique attendue par
   * `gestionnaireFormulaireTexte()` : un numéro répété autant de fois que son poids,
   * ou le numéro de « Mélange » quand tous les cas sont cochés au même poids.
   */
  function propageTexte() {
    if (derniersCas === null) return
    derniereSaisie = serialiseItemsFormulaireTexte(derniersCas, itemsTexte)
    supValue = derniereSaisie
    dispatch('change')
  }

  function basculeCasTexte(index: number, actif: boolean) {
    if (!actif && nombreCasCoches <= minimumSelections) return
    const item = itemsTexte[index]
    itemsTexte[index] = { ...item, poids: actif ? Math.max(1, item.poids) : 0 }
    itemsTexte = [...itemsTexte]
    propageTexte()
  }

  function changePoidsCasTexte(index: number, poids: number) {
    itemsTexte[index] = { ...itemsTexte[index], poids: Math.max(0, poids) }
    itemsTexte = [...itemsTexte]
    propageTexte()
  }

  /**
   * Raccourci « tout cocher » : tous les cas au même poids, c'est-à-dire le
   * « Mélange » que proposait l'aide.
   */
  function cocheTousLesCasTexte() {
    itemsTexte = itemsTexte.map((item) => ({ ...item, poids: 1 }))
    propageTexte()
  }

  // Pour categoriesForm : tableau de counts synchronisé avec supValue
  let counts: number[] = []
  $: if (categoriesForm) {
    const parsed = String(supValue || '')
      .split('-')
      .map((s, i) => {
        const n = parseInt(s)
        return isNaN(n) ? (categoriesForm!.defaut[i] ?? 0) : n
      })
    // Ne mettre à jour que si la sérialisation diffère (évite boucle réactive)
    const serialized = parsed.join('-')
    if (serialized !== counts.join('-')) {
      counts = parsed
    }
  }

  function handleCountsChange() {
    supValue = counts.join('-')
    dispatch('change')
  }

  $: formNumOptions = Array.isArray(formNum?.champs)
    ? formNum.champs.map((entree, i) => ({ label: entree, value: i + 1 }))
    : []

  function handleChange() {
    dispatch('change')
  }
</script>

{#if caseACocher}
  <!-- L'enveloppe évite que Svelte casse les cases voisines quand l'exercice en retire une -->
  <div>
    <CheckboxWithLabel
      id="settings-check{supIndex}-{exerciceIndex}"
      bind:isChecked={supValue}
      label={typeof caseACocher !== 'boolean'
        ? (caseACocher as [string, boolean])[0]
        : ''}
      on:change={handleChange}
      darkBackground={true}
    />
  </div>
{/if}

{#if formNum}
  {#if Array.isArray(formNum.champs)}
    <div class="flex flex-col">
      <form
        id="settings-form-formNum{supIndex}-{exerciceIndex}"
        action=""
        autocomplete="off"
      >
        <label
          class="text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct font-light"
          for="settings-formNum{supIndex}-{exerciceIndex}"
          >{formNum.titre} :</label
        >
        <SelectUnique
          id="settings-formNum{supIndex}-{exerciceIndex}"
          name="formNum{supIndex}"
          bind:value={supValue}
          options={formNumOptions}
          on:change={handleChange}
          darkBackground={true}
          classAddenda="flex flex-auto border-1 focus:border-1"
        />
      </form>
    </div>
  {:else}
    <div>
      <label
        class="text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct font-light"
        for="settings-formNum{supIndex}-{exerciceIndex}"
        >{formNum.titre} :
      </label>
      <InputNumber
        id="settings-formNum{supIndex}-{exerciceIndex}"
        min={1}
        max={formNum.champs}
        bind:value={supValue}
        on:change={handleChange}
        darkBackground={true}
      />
    </div>
  {/if}
{/if}

{#if categoriesForm}
  <div class="flex flex-col gap-1">
    <div
      class="text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct font-light"
    >
      {categoriesForm.titre} :
    </div>
    {#each categoriesForm.categories as cat, i}
      <div class="flex items-center gap-2">
        <label
          class="w-36 text-sm text-coopmaths-struct dark:text-coopmathsdark-struct font-light"
          for="settings-cat{supIndex}-{i}-{exerciceIndex}">{cat.label}</label
        >
        <InputNumber
          id="settings-cat{supIndex}-{i}-{exerciceIndex}"
          min={0}
          max={cat.max}
          bind:value={counts[i]}
          on:change={handleCountsChange}
          darkBackground={true}
        />
      </div>
    {/each}
  </div>
{/if}

{#if formulaireComplexe}
  <FormulaireComplexe
    formulaire={formulaireComplexe}
    {exerciceIndex}
    bind:supValue
    on:change={handleChange}
  />
{/if}

{#if texte && casTexte !== null}
  <div id="settings-formTextListe{supIndex}-{exerciceIndex}">
    <div
      id="settings-formTextTitre{supIndex}-{exerciceIndex}"
      class="flex items-center gap-1
        text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct
        font-light"
    >
      <button
        type="button"
        class="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-coopmaths-action"
        aria-label={listeTexteOuverte
          ? 'Replier les réglages de ' + (texte as [string, string])[0]
          : 'Déplier les réglages de ' + (texte as [string, string])[0]}
        aria-expanded={listeTexteOuverte}
        aria-controls="settings-formTextContenu{supIndex}-{exerciceIndex}"
        on:click={() => (listeTexteOuverte = !listeTexteOuverte)}
      >
        <i
          class="bx bx-chevron-right transition-transform {listeTexteOuverte
            ? 'rotate-90'
            : ''}"
          aria-hidden="true"
        ></i>
      </button>
      <span class="min-w-0 grow">{(texte as [string, string])[0]} :</span>
      <span
        class="shrink-0 text-xs text-coopmaths-struct-light dark:text-coopmathsdark-struct-light"
      >
        <span aria-hidden="true">{nombreCasCoches}/{itemsTexte.length}</span>
        <span class="sr-only"
          >{nombreCasCoches} choix cochés sur {itemsTexte.length}</span
        >
      </span>
    </div>
    <div
      id="settings-formTextContenu{supIndex}-{exerciceIndex}"
      class="{listeTexteOuverte ? 'flex' : 'hidden'} flex-col gap-y-1 pt-1"
    >
      <div
        class="w-full pl-4 pb-1 text-[80%] text-coopmaths-struct-light leading-tight"
      >
        {#if weighted}
          Cochez les cas voulus et réglez leur poids d'apparition.
        {:else}
          Cocher les choix à conserver. Conserver au moins {minimumSelections} choix.
        {/if}
        <button
          id="settings-formTextTout{supIndex}-{exerciceIndex}"
          type="button"
          class="underline text-coopmaths-action dark:text-coopmathsdark-action
            hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
          on:click={cocheTousLesCasTexte}>Tout cocher</button
        >
      </div>
      <ListePondereeItems
        items={itemsTexte}
        idItem={(item) =>
          `settings-formTextListe${supIndex}-${exerciceIndex}-${item.nom}`}
        poidsMax={weighted ? POIDS_MAX_DEFAUT : 0}
        minSelections={minimumSelections}
        on:bascule={(e) => basculeCasTexte(e.detail.index, e.detail.actif)}
        on:poids={(e) => changePoidsCasTexte(e.detail.index, e.detail.poids)}
      />
    </div>
  </div>
{:else if texte}
  <form
    id="settings-form-formText{supIndex}-{exerciceIndex}"
    name="settings-form-formText{supIndex}"
    autocomplete="off"
    on:submit|preventDefault={handleChange}
  >
    {#if typeof texte !== 'boolean'}
      <div
        class="text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct font-light"
      >
        <div>{(texte as [string, string])[0]} :</div>
        <div
          class="w-full pl-4 pb-2 whitespace-pre-wrap text-[80%] text-coopmaths-struct-light leading-tight"
        >
          {(texte as [string, string])[1]}
        </div>
      </div>
      <InputText
        inputID="settings-formText{supIndex}-{exerciceIndex}"
        bind:value={supValue}
        showTitle={false}
        darkBackground={true}
        classAddenda="w-full"
        on:input={handleChange}
      />
    {/if}
  </form>
{/if}
