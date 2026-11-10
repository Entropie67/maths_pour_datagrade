<script lang="ts">
  import type { KeyCap } from '../../../../types/keycap'
  import {
    KEYCAP_HEIGHT,
    KEYCAP_WIDTH,
    SM_BREAKPOINT,
    MD_BREAKPOINT,
    LG_BREAKPOINT,
    getMode,
  } from '../../../../lib/sizes'
  import type { Keys } from '../../../../types/keyboardContent'
  export let innerWidth: number
  export let keyName: Keys
  export let key: KeyCap
  export let isInLine: boolean
  export let isSpecial: boolean = false
  /** La touche remplit sa cellule au lieu d'avoir une largeur fixe. */
  export let pleineLargeur: boolean = false
  export let clickKeycap: (data: KeyCap, event: MouseEvent) => void
  let button: HTMLButtonElement | undefined
  let content: HTMLDivElement | undefined
  $: keycapwidth = KEYCAP_WIDTH[getMode(innerWidth, isInLine)]

  $: keycapheight =
    innerWidth <= SM_BREAKPOINT ? KEYCAP_HEIGHT.sm : KEYCAP_HEIGHT.md

  // La largeur d'une touche est fixe alors que son contenu ne l'est pas :
  // certaines touches ajoutées par un exercice insèrent un LaTeX large
  // (`\lim_{x \to a}`, `f'(x)`…) qui déborderait sur les touches voisines.
  // On met alors le contenu à l'échelle pour qu'il tienne dans la touche.
  let contentScale = 1
  /** Petite marge intérieure pour ne pas coller le contenu aux bords. */
  const MARGE_TOUCHE = 4
  function ajusteEchelleContenu() {
    if (button == null || content == null) return
    // Le contenu est centré et peut déjà déborder sur le padding de la touche :
    // la place réellement utilisable est toute la largeur visible, moins une
    // petite marge.
    const largeurDisponible = button.clientWidth - MARGE_TOUCHE
    // `scrollWidth` ignore la transformation déjà appliquée : pas de boucle.
    const largeurNaturelle = content.scrollWidth
    contentScale =
      largeurNaturelle > largeurDisponible && largeurNaturelle > 0
        ? Math.max(0.4, largeurDisponible / largeurNaturelle)
        : 1
  }

  // Le rendu KaTeX du contenu arrive après le montage : on réagit à la taille
  // réelle une fois la formule composée. Une action garantit d'avoir l'élément.
  function suitLaTailleDuContenu(noeud: HTMLDivElement) {
    content = noeud
    ajusteEchelleContenu()
    const observer = new ResizeObserver(ajusteEchelleContenu)
    observer.observe(noeud)
    return { destroy: () => observer.disconnect() }
  }
  // Recalcule quand la touche change de gabarit (redimensionnement, mode réduit).
  $: (keycapwidth, ajusteEchelleContenu())
</script>

<button
  bind:this={button}
  class="key--{keyName} customdimensions {pleineLargeur
    ? 'pleine-largeur'
    : ''} h-full flex justify-center items-center text-sm md:text-xl border-b-2 border-r border-r-slate-400 dark:border-r-gray-500 border-b-slate-300 dark:border-b-gray-600 active:border-b-0 active:border-r-0 text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light active:text-coopmaths-canvas active:translate-y-[1.5px] dark:active:text-coopmathsdark-canvas active:bg-coopmaths-action active:shadow-none dark:active:bg-coopmathsdark-action dark:active:shadow-none transition-transform ease-in-out shadow-[2px_2px_4px_rgba(180,180,180,0.5)] {isSpecial
    ? 'bg-coopmaths-canvas-moredark dark:bg-coopmathsdark-canvas-moredark'
    : 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas'}  py-1 px-1 md:py-2 md:px-4 text-center rounded-md font-mono touch-none"
  style="--keycapwidth:{keycapwidth}; --keycapheight:{keycapheight};"
  on:mousedown={(e) => {
    e.preventDefault()
    e.stopPropagation()
  }}
  on:click={(e) => {
    clickKeycap(key, e)
  }}
>
  <div
    use:suitLaTailleDuContenu
    id="key-{key.display}"
    class="relative"
    style="transform: scale({contentScale});"
  >
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <span>{@html key.display}</span>
  </div>
</button>

<style>
  .customdimensions {
    width: calc(var(--keycapwidth) * 1px);
    height: calc(var(--keycapheight) * 1px);
    /* Filet de sécurité : le contenu est mis à l'échelle en JS pour tenir dans
       la touche (voir `ajusteEchelleContenu`), mais on ne laisse jamais un
       contenu large déborder sur les touches voisines le temps du calcul. */
    overflow: hidden;
  }
  .customdimensions.pleine-largeur {
    width: 100%;
  }
  @media (min-width: 768px) {
    button.key--FCT,
    button.key--LIM,
    button.key--BRACKETS,
    button.key--BRACES,
    button.key--VECT,
    button.key--INT,
    button.key--BINOM,
    button.key--SIGMA,
    button.key--COS,
    button.key--SIN,
    button.key--TAN,
    button[class^='key--MASS'],
    button[class^='key--LENGTH'],
    button[class^='key--AREA'],
    button[class^='key--CAPACITY'],
    button[class^='key--VOLUME'] {
      font-size: 1rem /* 16px */;
      line-height: 1.5rem /* 24px */;
    }
    button.key--PROB {
      font-size: 0.75rem /* 12px */;
      line-height: 1rem /* 16px */;
    }
  }
  @media only screen and (max-width: 768px) {
    button.key--FCT,
    button.key--INT,
    button.key--BINOM,
    button.key--BRACKETS,
    button.key--BRACES,
    button.key--VECT,
    button.key--LIM,
    button.key--SIGMA,
    button.key--COS,
    button.key--SIN,
    button.key--TAN,
    button.key--SQRT,
    button[class^='key--MASS'],
    button[class^='key--LENGTH'],
    button[class^='key--AREA'],
    button[class^='key--CAPACITY'],
    button[class^='key--VOLUME'] {
      font-size: 0.5rem /* 16px */;
      line-height: 1.5rem /* 24px */;
    }
    button.key--PROB {
      font-size: 0.4rem /* 12px */;
      line-height: 1rem /* 16px */;
    }
  }

  button.key--DEL,
  button.key--FWD {
    touch-action: none;
  }
</style>
