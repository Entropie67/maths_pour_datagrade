<script lang="ts">
  export let icon: string
  /** Infobulle native du navigateur (attribut `title`), absente si vide */
  export let title: string = ''
  /**
   * Nom accessible du bouton (lecteurs d'écran), qui décrit l'action.
   * À défaut, `title` est repris. Le texte visible (`floatUnderText`) est
   * ajouté au nom s'il n'y figure pas déjà.
   */
  export let ariaLabel: string = ''
  export let disabled: boolean = false
  export let floatUnderText: string = ''
  export let cornerIcon: string = ''
  export let cornerIconClass: string = ''
  export let dataTour: string | undefined = undefined

  $: baseLabel = ariaLabel || title
  $: accessibleName =
    baseLabel && floatUnderText && !baseLabel.includes(floatUnderText)
      ? `${baseLabel} (${floatUnderText})`
      : baseLabel
</script>

<button
  type="button"
  title={title || undefined}
  aria-label={accessibleName || undefined}
  data-tour={dataTour}
  class="{$$props.class || ''} {disabled
    ? 'text-coopmaths-action/10 dark:text-coopmathsdark-action/10'
    : 'text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest'}"
  {disabled}
  on:click
>
  <i class="relative bx {icon}" aria-hidden="true">
    {#if floatUnderText !== ''}
      <div
        class="absolute left-1/2 -translate-x-1/2 -translate-y-2 text-sm font-extrabold font-sans"
      >
        {floatUnderText}
      </div>
    {/if}
    {#if cornerIcon !== ''}
      <i
        class="absolute -bottom-1 bx {cornerIcon} text-sm -translate-x-3
        {cornerIconClass || 'text-coopmaths-warn dark:text-coopmathsdark-warn'}"
        aria-hidden="true"
      ></i>
    {/if}
  </i>
</button>
