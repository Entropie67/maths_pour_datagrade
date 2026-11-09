<script lang="ts">
  /** Ligne d'action d'un menu plein écran de la vue mobile. */
  type Props = {
    label: string
    description?: string
    icon: string
    disabled?: boolean
    onclick: () => void
  }

  const {
    label,
    description = '',
    icon,
    disabled = false,
    onclick,
  }: Props = $props()
</script>

<button
  type="button"
  {disabled}
  {onclick}
  class="w-full flex flex-row items-center gap-4 px-4 py-4 text-left rounded-xl
  bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
  active:bg-coopmaths-canvas-darkest dark:active:bg-coopmathsdark-canvas-darkest
  transition-colors duration-150
  disabled:opacity-40"
>
  <i
    class="bx {icon} text-2xl shrink-0 text-coopmaths-action dark:text-coopmathsdark-action"
  ></i>
  <div class="min-w-0">
    <div class="text-coopmaths-struct dark:text-coopmathsdark-struct font-bold">
      {label}
    </div>
    {#if description}
      <div
        class="text-sm font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
      >
        {description}
      </div>
    {/if}
  </div>
</button>
