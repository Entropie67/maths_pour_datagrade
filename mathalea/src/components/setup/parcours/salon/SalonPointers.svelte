<script lang="ts">
  /**
   * Pointeurs des autres personnes au-dessus de l'éditeur, à leur couleur et
   * avec leur nom. Chaque position est relative à l'élément survolé (voir
   * `Pointer`) : elle reste juste quelle que soit la largeur de l'écran.
   */
  import type { Presence } from '../../../../lib/parcours/salon/salonPresence'

  let {
    presences,
    container,
  }: {
    presences: Presence[] // autres personnes sur ce parcours
    container: HTMLElement | undefined // éditeur (position: relative)
  } = $props()

  function position(p: Presence): { left: number; top: number } | null {
    const ptr = p.pointeur
    if (!ptr || !container) return null
    const box = container.getBoundingClientRect()
    const target = ptr.element
      ? container.querySelector<HTMLElement>(
          `[data-element="${CSS.escape(ptr.element)}"]`,
        )
      : container
    if (!target) return null
    const r = target.getBoundingClientRect()
    return {
      left: r.left - box.left + ptr.x * r.width,
      top: r.top - box.top + ptr.y * r.height,
    }
  }
</script>

<div
  class="pointer-events-none absolute inset-0 z-30 overflow-hidden"
  aria-hidden="true"
>
  {#each presences as p (p.clientId)}
    {@const at = position(p)}
    {#if at}
      <div
        class="absolute transition-[left,top] duration-75 ease-linear"
        style="left: {at.left}px; top: {at.top}px"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" class="drop-shadow">
          <path
            d="M1 1 L1 15 L5 11 L8 17 L10.5 16 L7.5 10 L13 10 Z"
            fill={p.couleur}
            stroke="white"
            stroke-width="1.2"
            stroke-linejoin="round"
          ></path>
        </svg>
        <span
          class="absolute left-4 top-4 whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-semibold text-white"
          style="background-color: {p.couleur}">{p.nom}</span
        >
      </div>
    {/if}
  {/each}
</div>
