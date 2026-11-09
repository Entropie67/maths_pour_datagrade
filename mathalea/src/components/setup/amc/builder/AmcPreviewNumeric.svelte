<script lang="ts">
  /**
   * L'ensemble de ce fichier : code typescript, contenu Html est le fruit du travail exclusif de Jean-claude Lhote.
   * @author Jean-claude Lhote
   */
  import { normalizeAMCNumBlocks } from '../../../../lib/amc/amcNormalize'
  import type { ReponseParams } from '../../../../lib/amc/amcTypes'
  import AmcEnonceHtml from './AmcEnonceHtml.svelte'

  export let enonce = ''
  export let htmlContent = ''
  export let svgScale = 1
  export let value: unknown = undefined
  export let param: ReponseParams = {}

  $: blocks = normalizeAMCNumBlocks({
    valeur: value as any,
    param,
  })
  $: mainBlock = blocks[0]
  $: exponentBlock = blocks.find((block) => block.label === 'Exposant')

  $: digits = Math.max(1, Number(mainBlock?.digits ?? param?.digits ?? 1))
  $: decimals = Math.max(0, Number(mainBlock?.decimals ?? param?.decimals ?? 0))
  $: signe = Boolean(mainBlock?.sign ?? param?.signe)
  $: exposantNbChiffres = Math.max(
    0,
    Number(
      mainBlock?.options?.exponent ??
        exponentBlock?.digits ??
        param?.exposantNbChiffres ??
        0,
    ),
  )
  $: exposantSigne = Boolean(
    mainBlock?.options?.exposign ?? exponentBlock?.sign ?? param?.exposantSigne,
  )
  $: vertical = Boolean(mainBlock?.options?.vertical ?? param?.vertical)
  $: approx = Number(mainBlock?.options?.approx ?? param?.approx ?? 0)
  $: digitChoices = Array.from({ length: 10 }, (_, i) => i)
  $: integerDigits = Math.max(0, digits - decimals)
  $: hasDecimalSeparator = decimals > 0
  $: tpointRaw = String(mainBlock?.options?.Tpoint ?? param?.tpoint ?? ',')
  $: isFractionSeparator = tpointRaw.includes('\\vrule')
</script>

<div
  class="rounded-xl border border-coopmaths-struct-light/40 bg-white/70 p-3 dark:bg-coopmathsdark-canvas-dark/60 dark:border-coopmathsdark-struct-light/30"
>
  <p
    class="text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    AMCnumericChoices
  </p>
  {#if htmlContent || enonce}
    <div class="mt-2">
      <AmcEnonceHtml content={htmlContent || enonce} {svgScale} />
    </div>
  {/if}

  <div class="mt-3 flex items-start gap-3 overflow-auto">
    {#if signe}
      <div class={vertical ? 'pt-6' : 'pt-6'}>
        <p class="mb-1 text-[10px] font-semibold uppercase tracking-wide">
          Signe
        </p>
        <div class={vertical ? 'flex flex-col gap-1' : 'flex flex-col gap-1'}>
          <span
            class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-xs dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
            >+</span
          >
          <span
            class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-xs dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
            >-</span
          >
        </div>
      </div>
    {/if}

    {#if !vertical}
      <div class="space-y-1">
        {#if hasDecimalSeparator}
          {#each Array(integerDigits) as _}
            <div class="flex items-center gap-1">
              {#each digitChoices as digit}
                <span
                  class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-[6px] dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                  >{digit}</span
                >
              {/each}
            </div>
          {/each}

          <div class="flex justify-start py-0.5">
            {#if !isFractionSeparator}
              <span class="text-xs font-semibold">,</span>
            {:else}
              <div
                class="h-px bg-coopmaths-corpus dark:bg-coopmathsdark-corpus"
                style="width: 100%; min-width: 50px"
              ></div>
            {/if}
          </div>

          {#each Array(decimals) as _}
            <div class="flex items-center gap-1">
              {#each digitChoices as digit}
                <span
                  class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-[6px] dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                  >{digit}</span
                >
              {/each}
            </div>
          {/each}
        {:else}
          {#each Array(digits) as _}
            <div class="flex items-center gap-1">
              {#each digitChoices as digit}
                <span
                  class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-[6px] dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                  >{digit}</span
                >
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    {:else}
      <div class="flex items-start gap-2">
        {#if hasDecimalSeparator}
          {#each Array(integerDigits) as _}
            <div class="space-y-1">
              <span
                class="block text-center text-[10px] text-coopmaths-corpus/80 dark:text-coopmathsdark-corpus/80"
              >
              </span>
              {#each digitChoices as digit}
                <span
                  class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-[6px] dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                  >{digit}</span
                >
              {/each}
            </div>
          {/each}

          <div class="flex h-full items-center">
            {#if !isFractionSeparator}
              <span class="text-xs font-semibold">,</span>
            {:else}
              <div
                class="h-px bg-coopmaths-corpus dark:bg-coopmathsdark-corpus"
                style="width: 5.5cm"
              ></div>
            {/if}
          </div>

          {#each Array(decimals) as _}
            <div class="space-y-1">
              <span
                class="block text-center text-[10px] text-coopmaths-corpus/80 dark:text-coopmathsdark-corpus/80"
              >
              </span>
              {#each digitChoices as digit}
                <span
                  class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-[6px] dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                  >{digit}</span
                >
              {/each}
            </div>
          {/each}
        {:else}
          {#each Array(digits) as _}
            <div class="space-y-1">
              <span
                class="block text-center text-[10px] text-coopmaths-corpus/80 dark:text-coopmathsdark-corpus/80"
              >
              </span>
              {#each digitChoices as digit}
                <span
                  class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-[6px] dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                  >{digit}</span
                >
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    {/if}

    {#if exposantNbChiffres > 0}
      <div class="flex items-start gap-2 pl-2">
        <div class={vertical ? 'pt-6' : 'pt-6'}>
          <p class="mb-1 text-[10px] font-semibold uppercase tracking-wide">
            Exposant
          </p>
          <div class="text-xs font-semibold">× 10^</div>
        </div>

        {#if exposantSigne}
          <div class={vertical ? 'pt-6' : 'pt-6'}>
            <p class="mb-1 text-[10px] font-semibold uppercase tracking-wide">
              Signe
            </p>
            <div class="flex flex-col gap-1">
              <span
                class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-xs dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                >+</span
              >
              <span
                class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-xs dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                >-</span
              >
            </div>
          </div>
        {/if}

        {#if !vertical}
          <div class="space-y-1">
            {#each Array(exposantNbChiffres) as _}
              <div class="flex items-center gap-1">
                {#each digitChoices as digit}
                  <span
                    class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-[6px] dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                    >{digit}</span
                  >
                {/each}
              </div>
            {/each}
          </div>
        {:else}
          <div class="flex items-start gap-2">
            {#each Array(exposantNbChiffres) as _}
              <div class="space-y-1">
                <span
                  class="block text-center text-[10px] text-coopmaths-corpus/80 dark:text-coopmathsdark-corpus/80"
                >
                </span>
                {#each digitChoices as digit}
                  <span
                    class="inline-flex h-4 w-4 items-center justify-center rounded border border-coopmaths-struct-light/70 bg-white text-[6px] dark:border-coopmathsdark-struct-light/60 dark:bg-coopmathsdark-canvas"
                    >{digit}</span
                  >
                {/each}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
