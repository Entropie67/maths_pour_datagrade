<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import {
    estChampListe,
    itemsDeLaValeur,
    LABEL_ORDRE_DEFAUT,
    ordreDeLaValeur,
    parseFormulaireComplexe,
    poidsMaximal,
    serialiseFormulaireComplexe,
    type ChampListeQuelconque,
    type FormulaireComplexe,
    type ItemPondere,
    type ValeursFormulaireComplexe,
  } from '../../../../../../lib/formulaireComplexe'
  import InputNumber from '../../../../forms/InputNumber.svelte'
  import ListePondereeItems from './ListePondereeItems.svelte'

  export let formulaire: FormulaireComplexe
  export let exerciceIndex: number
  /** Valeur sérialisée du formulaire, stockée dans `sup`. */
  export let supValue: any

  const dispatch = createEventDispatcher()

  let valeurs: ValeursFormulaireComplexe = parseFormulaireComplexe(
    formulaire,
    supValue,
  )
  let derniereSerialisation = serialiseFormulaireComplexe(formulaire, valeurs)

  // Recharge les valeurs si `sup` change ailleurs (URL partagée, exercice réinitialisé).
  $: if (String(supValue ?? '') !== derniereSerialisation) {
    valeurs = parseFormulaireComplexe(formulaire, supValue)
    derniereSerialisation = serialiseFormulaireComplexe(formulaire, valeurs)
  }

  function propage() {
    derniereSerialisation = serialiseFormulaireComplexe(formulaire, valeurs)
    supValue = derniereSerialisation
    dispatch('change')
  }

  /**
   * Items de chaque liste, indexés par nom de champ. Ce dérivé explicite garantit que
   * les blocs `{#each}` se redessinent quand `valeurs` change (réordonnancement).
   */
  $: listes = Object.fromEntries(
    formulaire.champs
      .filter(estChampListe)
      .map((champ) => [champ.nom, itemsDeLaValeur(valeurs[champ.nom])]),
  ) as Record<string, ItemPondere[]>

  function metAJour(champ: ChampListeQuelconque, liste: ItemPondere[]) {
    const valeur =
      champ.type === 'listePondereeOrdonnee'
        ? { ordre: ordreDeLaValeur(valeurs[champ.nom]), items: [...liste] }
        : [...liste]
    valeurs = { ...valeurs, [champ.nom]: valeur }
    propage()
  }

  function basculeItem(
    champ: ChampListeQuelconque,
    index: number,
    actif: boolean,
  ) {
    const liste = listes[champ.nom]
    liste[index] = {
      ...liste[index],
      poids: actif ? Math.max(1, liste[index].poids) : 0,
    }
    metAJour(champ, liste)
  }

  function changePoids(
    champ: ChampListeQuelconque,
    index: number,
    poids: number,
  ) {
    const liste = listes[champ.nom]
    liste[index] = { ...liste[index], poids: Math.max(0, poids) }
    metAJour(champ, liste)
  }

  function deplace(champ: ChampListeQuelconque, index: number, sens: -1 | 1) {
    const liste = listes[champ.nom]
    const cible = index + sens
    if (cible < 0 || cible >= liste.length) return
    ;[liste[index], liste[cible]] = [liste[cible], liste[index]]
    metAJour(champ, liste)
  }

  function basculeOrdre(champ: ChampListeQuelconque, ordre: boolean) {
    valeurs = {
      ...valeurs,
      [champ.nom]: { ordre, items: [...listes[champ.nom]] },
    }
    propage()
  }
</script>

<!--
  @component
  Rendu du formulaire de paramétrage « complexe » d'un exercice
  (`besoinFormulaireComplexe`). Il regroupe dans un seul paramètre `sup` des cases
  à cocher, des sélections et des listes que l'enseignant peut activer, pondérer
  et, selon le type de liste, réordonner.
-->

<div class="flex flex-col gap-y-3">
  {#if formulaire.titre}
    <div
      class="text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct font-bold"
    >
      {formulaire.titre}
    </div>
  {/if}

  {#each formulaire.champs as champ (champ.nom)}
    {#if champ.type === 'case'}
      <div class="flex flex-row justify-start items-center p-1">
        <input
          id="settings-complexe-{champ.nom}-{exerciceIndex}"
          type="checkbox"
          class="w-4 h-4 rounded bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
            border-coopmaths-action dark:border-coopmathsdark-action cursor-pointer
            checked:bg-coopmaths-action dark:checked:bg-coopmathsdark-action
            focus:ring-3 focus:ring-coopmaths-action dark:focus:ring-coopmathsdark-action"
          checked={valeurs[champ.nom] === true}
          on:change={(e) => {
            valeurs = {
              ...valeurs,
              [champ.nom]: e.currentTarget.checked,
            }
            propage()
          }}
        />
        <label
          for="settings-complexe-{champ.nom}-{exerciceIndex}"
          class="ml-3 text-sm font-light cursor-pointer">{champ.label}</label
        >
      </div>
    {:else if champ.type === 'selection'}
      <div class="flex flex-col">
        <label
          class="text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct font-light"
          for="settings-complexe-{champ.nom}-{exerciceIndex}"
          >{champ.label} :</label
        >
        <select
          id="settings-complexe-{champ.nom}-{exerciceIndex}"
          class="w-full px-2 py-1 h-10 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
            text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-dark
            border border-coopmaths-action dark:border-coopmathsdark-action
            focus:outline-0 focus:ring-0"
          value={valeurs[champ.nom]}
          on:change={(e) => {
            valeurs = { ...valeurs, [champ.nom]: e.currentTarget.value }
            propage()
          }}
        >
          {#each champ.options as option (option.valeur)}
            <option
              value={option.valeur}
              class="bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
              >{option.label}</option
            >
          {/each}
        </select>
      </div>
    {:else if champ.type === 'nombre'}
      <div class="flex flex-col">
        <label
          class="text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct font-light"
          for="settings-complexe-{champ.nom}-{exerciceIndex}"
          >{champ.label} :</label
        >
        <InputNumber
          id="settings-complexe-{champ.nom}-{exerciceIndex}"
          min={champ.min ?? 0}
          max={champ.max}
          value={valeurs[champ.nom] as number}
          on:change={(e) => {
            valeurs = { ...valeurs, [champ.nom]: e.detail ?? champ.min ?? 0 }
            propage()
          }}
          darkBackground={true}
        />
      </div>
    {:else if estChampListe(champ)}
      <div class="flex flex-col gap-y-1">
        <div
          class="text-sm md:text-normal text-coopmaths-struct dark:text-coopmathsdark-struct font-light"
        >
          {champ.label} :
        </div>
        <ListePondereeItems
          items={listes[champ.nom]}
          idItem={(item) =>
            `settings-complexe-${champ.nom}-${item.nom}-${exerciceIndex}`}
          poidsMax={champ.type === 'liste' ? 0 : poidsMaximal(champ)}
          avecFleches={champ.type === 'listePondereeOrdonnee'}
          on:bascule={(e) => basculeItem(champ, e.detail.index, e.detail.actif)}
          on:poids={(e) => changePoids(champ, e.detail.index, e.detail.poids)}
          on:deplace={(e) => deplace(champ, e.detail.index, e.detail.sens)}
        />
        {#if champ.type === 'listePondereeOrdonnee'}
          <div class="flex flex-row justify-start items-center pl-1 pt-1">
            <input
              id="settings-complexe-{champ.nom}-ordre-{exerciceIndex}"
              type="checkbox"
              class="w-4 h-4 rounded shrink-0 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
                border-coopmaths-action dark:border-coopmathsdark-action cursor-pointer
                checked:bg-coopmaths-action dark:checked:bg-coopmathsdark-action
                focus:ring-3 focus:ring-coopmaths-action dark:focus:ring-coopmathsdark-action"
              checked={ordreDeLaValeur(valeurs[champ.nom])}
              on:change={(e) => basculeOrdre(champ, e.currentTarget.checked)}
            />
            <label
              for="settings-complexe-{champ.nom}-ordre-{exerciceIndex}"
              class="ml-3 text-sm font-light leading-tight cursor-pointer"
              >{champ.labelOrdre ?? LABEL_ORDRE_DEFAUT}</label
            >
          </div>
        {/if}
      </div>
    {/if}
  {/each}
</div>
