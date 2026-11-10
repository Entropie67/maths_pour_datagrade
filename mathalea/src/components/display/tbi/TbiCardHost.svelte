<script lang="ts">
  import TbiExerciceCard from './TbiExerciceCard.svelte'
  import TbiStaticCard from './TbiStaticCard.svelte'
  import type { TbiItem } from './tbiTypes'

  interface Props {
    item: TbiItem
    /** Onglets vers lesquels déplacer l'exercice */
    moveTargets?: { value: number | string; label: string }[]
    onMoveTo?: (paramsIndex: number, value: number | string) => void
    /** Replier la carte (disposition libre) */
    onCollapse?: (paramsIndex: number) => void
    onDelete?: (paramsIndex: number) => void
  }

  let { item, moveTargets, onMoveTo, onCollapse, onDelete }: Props = $props()
</script>

{#if item.exercise}
  <TbiExerciceCard
    exercise={item.exercise}
    paramsIndex={item.paramsIndex}
    {moveTargets}
    {onMoveTo}
    {onCollapse}
    {onDelete}
  />
{:else if item.staticContent}
  <TbiStaticCard
    content={item.staticContent}
    paramsIndex={item.paramsIndex}
    {moveTargets}
    {onMoveTo}
    {onCollapse}
    {onDelete}
  />
{:else}
  <section
    class="w-full rounded-lg border border-dashed border-coopmaths-struct-light dark:border-coopmathsdark-struct-light p-4 text-center text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
  >
    <i class="bx bx-error-circle text-2xl"></i>
    <p class="text-sm">
      L'exercice <span class="font-bold">{item.id}</span> n'est pas pris en charge
      dans la vue TBI.
    </p>
  </section>
{/if}
