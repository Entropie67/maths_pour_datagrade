<script lang="ts">
  import { keys } from '../../../lib/keycaps'
  import { GAP_BETWEEN_KEYS, getMode } from '../../../lib/sizes'
  import type { KeyboardBlock } from '../../../types/keyboardContent'
  import { type KeyCap, isSpecialKey } from '../../../types/keycap'
  import Key from './keycap/Keycap.svelte'
  export let innerWidth: number
  export let block: KeyboardBlock
  export let isInLine: boolean = false
  /** Les touches se partagent toute la largeur disponible (smartphone). */
  export let pleineLargeur: boolean = false
  export let clickKeycap: (data: KeyCap, event: MouseEvent) => void

  $: gapsize = GAP_BETWEEN_KEYS[getMode(innerWidth, isInLine)]
</script>

{#if block !== undefined}
  <!-- En ligne, la page défile horizontalement (`overflow-x-auto`) : un bloc ne
       doit pas se comprimer, sinon ses touches se chevauchent. -->
  <div
    class:shrink-0={isInLine}
    style={pleineLargeur && !isInLine
      ? `flex: ${block.cols} 1 0%; min-width: 0;`
      : undefined}
    id="kb-block-{block.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(' ', '-')}"
  >
    {#if isInLine}
      <!-- Pas de clé de contenu sur ce each : le bloc « Pour cette question »
           (voir Keyboard.svelte) est entièrement reconstruit à chaque question
           et partage souvent des touches (+, -, =...) avec la question
           précédente. Une clé du style `key + '_' + index` fait alors
           disparaître ces touches communes au lieu de les réutiliser. -->
      <div
        class="grid customgap h-full"
        style="grid-template-columns: repeat({block.keycaps.inline
          .length}, {block.keycaps.inline.length > 12
          ? 'max-content'
          : 'minmax(0, 1fr)'}); --gapsize:{gapsize};"
      >
        {#each block.keycaps.inline as key, index}
          <Key
            keyName={key}
            key={keys[key]}
            isSpecial={isSpecialKey(key)}
            {isInLine}
            {innerWidth}
            {clickKeycap}
          />
        {/each}
      </div>
    {:else}
      <div
        class="grid customgap h-full"
        style="grid-template-columns: repeat({block.cols}, minmax(0, 1fr)); --gapsize:{gapsize};"
      >
        {#each block.keycaps.block as key, index}
          <Key
            keyName={key}
            key={keys[key]}
            isSpecial={isSpecialKey(key)}
            {isInLine}
            {innerWidth}
            {pleineLargeur}
            {clickKeycap}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .customgap {
    gap: calc(var(--gapsize) * 1px);
  }
</style>
