<script lang="ts">
  import { untrack } from 'svelte'
  import {
    coverDatePickerValue,
    coverDateToIso,
    isoToCoverDate,
  } from './coverDate'

  interface Props {
    /** Date telle qu'elle s'inscrit sur la fiche (`jj.mm.aa`) */
    value: string
    /** Classes du champ texte (le volet et la palette n'ont pas la même échelle) */
    inputClass?: string
    /** Appelé avec la nouvelle date (`jj.mm.aa`), au choix dans le calendrier ou à la saisie */
    onChange: (value: string) => void
  }
  const { value, inputClass = '', onChange }: Props = $props()

  /**
   * Le champ affiche la date au format de la fiche (`jj.mm.aa`) quelle que
   * soit la langue du navigateur : un `<input type="date">` visible, lui,
   * l'afficherait dans le format du système (mm/dd/yyyy en anglais). Le
   * sélecteur natif reste accessible par le bouton calendrier, qui ouvre le
   * `<input type="date">` gardé à côté (invisible mais rendu, condition de
   * `showPicker()`).
   */
  let texte = $state(untrack(() => value))
  let dateInput: HTMLInputElement | null = $state(null)
  // la valeur du parent reprend la main quand elle change ailleurs (changement
  // de modèle, édition dans le code)
  $effect(() => {
    texte = value
  })

  /** Normalise la saisie libre en `jj.mm.aa` quand elle est une date */
  function submit() {
    const iso = coverDateToIso(texte)
    const date = iso === '' ? texte : isoToCoverDate(iso)
    texte = date
    if (date !== value) onChange(date)
  }

  function openPicker() {
    if (dateInput == null) return
    // showPicker() : Chrome/Edge 99+, Firefox 101+. À défaut, le clic sur le
    // champ natif ouvre le calendrier sur la plupart des navigateurs.
    try {
      dateInput.showPicker()
    } catch {
      dateInput.click()
    }
  }
</script>

<span class="relative inline-flex items-center gap-1">
  <input
    type="text"
    inputmode="numeric"
    placeholder="jj.mm.aa"
    aria-label="Date (jj.mm.aa)"
    class={inputClass}
    bind:value={texte}
    onchange={submit}
    onblur={submit}
  />
  <button
    type="button"
    class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action"
    aria-label="Ouvrir le calendrier"
    title="Ouvrir le calendrier"
    onclick={openPicker}
  >
    <i class="bx bx-calendar text-lg"></i>
  </button>
  <!-- rendu (le sélecteur natif l'exige) mais invisible : seul son calendrier
       nous intéresse, l'affichage de la date se fait dans le champ texte -->
  <input
    bind:this={dateInput}
    type="date"
    tabindex="-1"
    aria-hidden="true"
    class="pointer-events-none absolute right-0 bottom-0 h-px w-px opacity-0"
    value={coverDatePickerValue(value)}
    onchange={(e) => {
      const date = isoToCoverDate(e.currentTarget.value)
      if (date !== '') {
        texte = date
        onChange(date)
      }
    }}
  />
</span>
