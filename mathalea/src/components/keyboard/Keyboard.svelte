<script lang="ts">
  import { MathfieldElement } from 'mathlive'
  import { get } from 'svelte/store'
  import { tick } from 'svelte'
  import { fly } from 'svelte/transition'
  import {
    appliqueToucheAuChampTexte,
    estChampTexteAvecClavier,
  } from '../../lib/interactif/champTexteClavier'
  import { renderKatex } from '../../lib/latex/renderKatex'
  import { resizeContent } from '../../lib/components/sizeTools'
  import { globalOptions } from '../../lib/stores/globalOptions'
  import { keyboardBlocks, specialKeys } from './layouts/keysBlocks'
  import {
    GAP_BETWEEN_BLOCKS,
    KEYCAP_HEIGHT,
    KEYCAP_WIDTH,
    MD_BREAKPOINT,
    SM_BREAKPOINT,
    estSmartphone,
    getMode,
  } from './lib/sizes'
  import {
    choisitClavierReduit,
    dimensionsClavierAgrandi,
    enregistrePreferenceClavierReduit,
    lisPreferenceClavierReduit,
  } from './lib/modeClavier'
  import { gardeChampVisible } from './lib/champVisible'
  import { latexMatriceAvecPlaceholders } from './lib/matrix'
  import {
    enregistreTouchesPersonnalisees,
    ordonneChiffresEnLigne,
    TITRE_BLOC_PERSONNALISE,
  } from './lib/touchesPersonnalisees'
  import Alphanumeric from './presentationalComponents/alphanumeric/Alphanumeric.svelte'
  import KeyboardPage from './presentationalComponents/keyboardpage/KeyboardPage.svelte'
  import { keyboardState } from './stores/keyboardStore'
  import {
    Keyboard,
    decoupeBlocEnLigne,
    inLineBlockWidth,
    type AlphanumericPages,
    type KeyboardBlock,
    type Keys,
  } from './types/keyboardContent'
  import type { KeyCap } from './types/keycap'
  import { isPageKey } from './types/keycap'

  /**
   * Hauteur réelle du clavier pour réserver sa place dans la vue CAN.
   * Elle n'est pas remise à 0 quand le clavier se masque : s'il réapparaît
   * pendant sa transition de sortie, Svelte réutilise le même nœud, dont la
   * hauteur ne change pas, et `bind:clientHeight` ne la remettrait pas à jour.
   * Le parent teste lui-même `keyboardState.isVisible`.
   */
  export let height: number = 0

  let innerWidth: number = 0
  let innerHeight: number = 0
  let pages: KeyboardBlock[][] = []
  let usualBlocks: KeyboardBlock[] = []
  let unitsBlocks: KeyboardBlock[] = []
  let currentPageIndex = 0
  let divKeyboard: HTMLDivElement
  let alphanumericDisplayed: boolean = false
  let isVisible = false
  let isInLine = false
  let pageType: AlphanumericPages = 'AlphaLow'
  let matrixSelectorVisible = false
  let matrixRows = 2
  let matrixColumns = 2
  const myKeyboard: Keyboard = new Keyboard()

  /** Touches de gestion du clavier (pages, agrandir) : carré plein, icône blanche. */
  const CLASSE_TOUCHE_ACTION =
    'flex justify-center items-center rounded-md border-b-2 border-r border-r-slate-400 dark:border-r-gray-500 border-b-slate-300 dark:border-b-gray-600 bg-coopmaths-action dark:bg-coopmathsdark-action-light hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest text-coopmaths-canvas dark:text-coopmathsdark-canvas shadow-[2px_2px_4px_rgba(180,180,180,0.5)] active:translate-y-[1.5px]'
  /** Smartphone : pas de bouton agrandir / réduire, le clavier agrandi remplit la largeur. */
  $: smartphone = estSmartphone(innerWidth)
  // Conserver la grille aussi en passant d'un écran large au format mobile.
  // Sans bouton de bascule sur smartphone, le mode en ligne serait sans issue.
  $: if (smartphone && isInLine) {
    keyboardState.update((state) => ({ ...state, isInLine: false }))
  }
  $: styleToucheAction = `width: ${
    KEYCAP_WIDTH[getMode(innerWidth, isInLine)]
  }px; height: ${
    innerWidth <= SM_BREAKPOINT ? KEYCAP_HEIGHT.sm : KEYCAP_HEIGHT.md
  }px;`

  function renderKeyboard() {
    if (!divKeyboard) return
    // Le rendu KaTeX sur tout le clavier retire les nœuds de contrôle de
    // Svelte lors du passage entre les claviers alphanumérique et mathématique.
    // Seuls les libellés des touches contiennent des formules à composer.
    divKeyboard
      .querySelectorAll<HTMLElement>('button[class*="key--"]')
      .forEach((button) => {
        if (button.textContent?.includes('$')) renderKatex(button)
      })
    const zoom = Number(get(globalOptions).z)
    if (zoom !== -1) resizeContent(divKeyboard, zoom)
  }

  const computePages = () => {
    pages.length = 0
    const customBlocks = myKeyboard.blocks.filter(
      (block) => block.title === TITRE_BLOC_PERSONNALISE,
    )
    const nbCustomKeys = customBlocks.reduce(
      (total, block) => total + block.keycaps.inline.length,
      0,
    )
    if (isInLine && nbCustomKeys > 12) {
      pages.push([
        ...customBlocks,
        ...myKeyboard.blocks.filter((block) => !customBlocks.includes(block)),
      ])
      return
    }
    const mode = getMode(innerWidth, true)
    // Largeur réellement disponible : le clavier a un padding de 8 px (16 px
    // dès `md`) et le conteneur en ligne 40 px de marge de chaque côté pour
    // les flèches de navigation.
    const largeurDisponible =
      innerWidth - 2 * 40 - (innerWidth >= MD_BREAKPOINT ? 32 : 16)
    const espaceEntreBlocs = GAP_BETWEEN_BLOCKS[mode]
    // Les touches spéciales (effacer, flèches…) et la touche agrandir sont
    // répétées sur chaque page : une page ne doit jamais se réduire à elles.
    const largeurTouchesSpeciales =
      inLineBlockWidth(specialKeys, mode) +
      espaceEntreBlocs +
      KEYCAP_WIDTH[mode]
    let page: KeyboardBlock[] = [specialKeys]
    let pageWidth = largeurTouchesSpeciales
    let pageAUnBloc = false
    // Un bloc plus large que ce qui reste à côté des touches spéciales est
    // découpé : sinon sa page déborde de l'écran et des touches sont coupées.
    const largeurMaxBloc =
      largeurDisponible - largeurTouchesSpeciales - espaceEntreBlocs
    // Les unités suivent le premier bloc de touches (souvent les chiffres) :
    // quand une unité est attendue, elle ne doit pas être reléguée en
    // dernière page derrière les opérations ou les variables.
    const blocsUsuels = usualBlocks.filter((block) => block !== specialKeys)
    const premierBlocStandard = blocsUsuels.findIndex(
      (block) => block.title !== TITRE_BLOC_PERSONNALISE,
    )
    const nbBlocsAvantUnites =
      premierBlocStandard === -1 ? blocsUsuels.length : premierBlocStandard + 1
    const blocsDuClavier = [
      ...blocsUsuels.slice(0, nbBlocsAvantUnites),
      ...unitsBlocks,
      ...blocsUsuels.slice(nbBlocsAvantUnites),
    ].flatMap((block) => decoupeBlocEnLigne(block, mode, largeurMaxBloc))
    for (const block of blocsDuClavier) {
      const blockWidth = espaceEntreBlocs + inLineBlockWidth(block, mode)
      if (pageAUnBloc && pageWidth + blockWidth > largeurDisponible) {
        // plus de places
        pages.push(page.reverse())
        page = [specialKeys]
        pageWidth = largeurTouchesSpeciales
        pageAUnBloc = false
      }
      page.push(block)
      pageWidth += blockWidth
      pageAUnBloc = true
    }
    pages.push(page.reverse())
  }

  let idChampPrecedent = ''
  keyboardState.subscribe(async (value) => {
    // Un nouveau champ repart de la première page du clavier : sinon l'index
    // de page du champ précédent s'applique à un clavier différent.
    const nouveauChamp = value.idMathField !== idChampPrecedent
    if (nouveauChamp) {
      idChampPrecedent = value.idMathField
      currentPageIndex = 0
    }
    isVisible = value.isVisible
    // AxioMaths (DataGrade) : le champ en cours de saisie reste visible
    // au-dessus du clavier (cf. lib/champVisible.ts).
    if (value.isVisible && value.idMathField !== '') {
      gardeChampVisible(value.idMathField)
    }
    isInLine = value.isInLine
    pageType = value.alphanumericLayout
    myKeyboard.empty()
    // Les touches propres à la question sont présentées en premier : ce sont
    // celles dont l'élève a besoin pour cette réponse précise.
    for (const touches of value.customKeys ?? []) {
      const noms = enregistreTouchesPersonnalisees(touches)
      if (noms.length === 0) continue
      myKeyboard.add({
        keycaps: { inline: ordonneChiffresEnLigne(noms), block: noms },
        cols: Math.min(noms.length, noms.length > 12 ? 7 : 3),
        title: TITRE_BLOC_PERSONNALISE,
        isUnits: false,
      })
    }
    for (const block of value.blocks) {
      if (block !== 'alphanumeric') myKeyboard.add(keyboardBlocks[block])
    }
    myKeyboard.checkSmallLayoutAllowed()
    unitsBlocks.length = 0
    usualBlocks.length = 0
    for (const block of myKeyboard.blocks) {
      if (
        block &&
        Object.prototype.hasOwnProperty.call(block, 'isUnits') &&
        block.isUnits
      ) {
        unitsBlocks.push(block)
      } else {
        usualBlocks.push(block)
      }
    }
    unitsBlocks = unitsBlocks
    usualBlocks = usualBlocks
    computePages()
    if (nouveauChamp && value.idMathField !== '' && innerWidth > 0) {
      const reduit = choisitClavierReduit({
        preference: lisPreferenceClavierReduit(),
        nbPagesEnLigne: pages.length,
        agrandi: dimensionsClavierAgrandi(
          usualBlocks,
          unitsBlocks,
          innerWidth,
          !estSmartphone(innerWidth),
        ),
        innerWidth,
        innerHeight,
        tactile: 'ontouchstart' in window,
      })
      if (reduit !== value.isInLine) {
        // Le store relance cet abonnement avec le bon mode.
        keyboardState.update((state) => ({ ...state, isInLine: reduit }))
        return
      }
    }
    pages = pages
    if (currentPageIndex >= pages.length) currentPageIndex = 0
    alphanumericDisplayed = value.blocks.includes('alphanumeric')
    await tick()
    renderKeyboard()
    // document.dispatchEvent(new window.Event('KeyboardUpdated', { bubbles: true }))
    // console.log('message envoyé: ' + 'KeyboardUpdated')
  })

  async function basculeModeClavier(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    computePages()
    $keyboardState.isInLine = !$keyboardState.isInLine
    enregistrePreferenceClavierReduit($keyboardState.isInLine)
    await tick()
    renderKeyboard()
  }

  async function navRight(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (currentPageIndex !== 0) {
      currentPageIndex--
    }
    // console.log('page à afficher n°' + currentPageIndex)
    // console.log(pages[currentPageIndex])
    await tick()
    renderKeyboard()
  }

  async function navLeft(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (currentPageIndex !== pages.length - 1) {
      currentPageIndex++
    }
    // console.log('page à afficher n°' + currentPageIndex)
    // console.log(pages[currentPageIndex])
    await tick()
    renderKeyboard()
  }

  function mathfieldActif(): MathfieldElement | null {
    const selecteur = ('#' + $keyboardState.idMathField).replace('-button', '')
    let mf = document.querySelector(selecteur) as MathfieldElement | null
    if (mf != null) return mf
    const shadowHosts = document.querySelectorAll(
      'multi-mathfield, tableau-signes-variations',
    )
    for (const el of shadowHosts) {
      mf = el.shadowRoot?.querySelector(selecteur) as MathfieldElement | null
      if (mf != null) return mf
    }
    return null
  }

  function insereMatrice() {
    const mf = mathfieldActif()
    if (mf == null) return
    mf.focus()
    mf.executeCommand([
      'insert',
      latexMatriceAvecPlaceholders(matrixRows, matrixColumns),
      { selectionMode: 'placeholder' },
    ])
    matrixSelectorVisible = false
  }

  const clickKeycap = (key: KeyCap, event: MouseEvent, value?: Keys) => {
    if (value && isPageKey(value)) {
      // la touche est une touche du clavier alphanumeric pour changer de page
      switch (value) {
        case 'abc':
          $keyboardState.alphanumericLayout = 'AlphaLow'
          break
        case 'ABC':
          $keyboardState.alphanumericLayout = 'AlphaUp'
          break
        case 'NUM':
          $keyboardState.alphanumericLayout = 'Numeric'
          break
        default:
          $keyboardState.alphanumericLayout = 'AlphaLow'
          break
      }
    } else {
      if (event.currentTarget instanceof HTMLButtonElement) {
        const champTexte = document.getElementById($keyboardState.idMathField)
        if (estChampTexteAvecClavier(champTexte)) {
          champTexte.focus()
          if (key.command === 'closeKeyboard') {
            keyboardState.update((value) => {
              value.isVisible = false
              value.idMathField = ''
              return value
            })
          } else {
            appliqueToucheAuChampTexte(champTexte, key)
          }
          return
        }
        const mf = mathfieldActif()
        if (mf != null) {
          mf.focus()
          if (key.action === 'insertMatrix') {
            matrixSelectorVisible = !matrixSelectorVisible
          } else if (key.command && key.command === 'closeKeyboard') {
            keyboardState.update((value) => {
              value.isVisible = false
              value.idMathField = ''
              return value
            })
          } else if (key.command && key.command[0] !== '') {
            // @ts-expect-error : command doit être compatible avec MathLive
            mf.executeCommand(key.command)
          } else {
            mf.executeCommand(['insert', key.insert || key.display])
          }
        }
      }
    }
  }
</script>

<svelte:window bind:innerWidth bind:innerHeight />
{''}
{#if isVisible}
  <div
    on:mousedown={(e) => {
      e.preventDefault()
      e.stopPropagation()
    }}
    role="none"
    transition:fly|global={{ y: '100%', opacity: 1 }}
    bind:this={divKeyboard}
    bind:clientHeight={height}
    id="mathalea-virtual-keyboard"
    class=" bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark p-2 md:p-4 w-full fixed bottom-0 left-0 right-0 z-[9999] drop-shadow-[0_-3px_5px_rgba(130,130,130,0.25)] dark:drop-shadow-[0_-3px_5px_rgba(250,250,250,0.25)]"
  >
    {#if matrixSelectorVisible}
      <div
        class="absolute bottom-full left-1/2 flex -translate-x-1/2 items-end gap-3 rounded-t-lg bg-coopmaths-canvas-dark p-3 shadow-lg dark:bg-coopmathsdark-canvas-dark"
        role="dialog"
        tabindex="-1"
        aria-label="Choisir les dimensions de la matrice"
        on:mousedown={(e) => e.stopPropagation()}
      >
        <label class="flex flex-col text-sm">
          Lignes
          <input
            class="w-16 rounded p-1 text-black"
            type="number"
            min="1"
            max="10"
            bind:value={matrixRows}
          />
        </label>
        <label class="flex flex-col text-sm">
          Colonnes
          <input
            class="w-16 rounded p-1 text-black"
            type="number"
            min="1"
            max="10"
            bind:value={matrixColumns}
          />
        </label>
        <button
          class="rounded bg-coopmaths-action px-3 py-1 text-white"
          type="button"
          on:click={insereMatrice}
        >
          Insérer
        </button>
        <button
          class="px-2 py-1"
          type="button"
          aria-label="Annuler"
          on:click={() => (matrixSelectorVisible = false)}>×</button
        >
      </div>
    {/if}
    {#if alphanumericDisplayed}
      <Alphanumeric {clickKeycap} {pageType} />
    {:else}
      <div class={isInLine ? 'relative px-10' : 'py-2 md:py-0'}>
        <KeyboardPage
          unitsBlocks={[...unitsBlocks].reverse()}
          usualBlocks={[...usualBlocks].reverse()}
          page={pages[currentPageIndex]}
          {isInLine}
          {innerWidth}
          pleineLargeur={smartphone && !isInLine}
          {clickKeycap}
        >
          <!-- Touche agrandir / réduire, à côté des touches spéciales : une
               touche de taille normale se remarque, contrairement à l'ancien
               petit « + » dans le coin. Agrandi, elle s'aligne sur la touche
               de fermeture, en bas. -->
          {#if !smartphone}
            <button
              id="kb-nav-reduced"
              type="button"
              title={isInLine
                ? 'Afficher toutes les touches'
                : 'Réduire le clavier'}
              aria-label={isInLine
                ? 'Afficher toutes les touches'
                : 'Réduire le clavier'}
              class="{CLASSE_TOUCHE_ACTION} shrink-0 {isInLine
                ? ''
                : 'self-end'}"
              style={styleToucheAction}
              on:click={basculeModeClavier}
              on:mousedown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <i
                class="bx {isInLine
                  ? 'bx-expand-alt'
                  : 'bx-collapse-alt'} text-xl md:text-2xl"
              ></i>
            </button>
          {/if}
        </KeyboardPage>
        <!-- Boutons de navigation entre les pages : vers la DROITE -->
        <button
          id="kb-nav-right"
          aria-label="Page suivante"
          class="{CLASSE_TOUCHE_ACTION} absolute right-0 top-0 bottom-0 m-auto disabled:invisible"
          style={styleToucheAction}
          on:click={navRight}
          on:mousedown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          disabled={pages.length === 1 || currentPageIndex === 0 || !isInLine}
        >
          <i class="bx bx-chevron-right text-2xl md:text-3xl"></i>
        </button>
        <!-- Boutons de navigation entre les pages : vers la GAUCHE -->
        <button
          id="kb-nav-left"
          aria-label="Page précédente"
          class="{CLASSE_TOUCHE_ACTION} absolute left-0 top-0 bottom-0 m-auto disabled:invisible"
          style={styleToucheAction}
          on:click={navLeft}
          on:mousedown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          disabled={pages.length === 1 ||
            currentPageIndex === pages.length - 1 ||
            !isInLine}
        >
          <i class="bx bx-chevron-left text-2xl md:text-3xl"></i>
        </button>
      </div>
    {/if}
    <!-- bouton de passage du clavier alphanumérique au clavier maths-->
    <button
      id="kb-nav-alpha"
      type="button"
      aria-label={alphanumericDisplayed
        ? 'Clavier mathématique'
        : 'Clavier alphanumérique'}
      class="z-[10000] {$keyboardState.blocks.includes('alphanumeric')
        ? 'flex justify-center items-center'
        : 'hidden'} absolute right-0 top-0 h-5 w-5 rounded-sm bg-coopmaths-action hover:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action-light dark:hover:bg-coopmathsdark-action-lightest text-coopmaths-canvas dark:text-coopmaths-canvas"
      on:click={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        alphanumericDisplayed = !alphanumericDisplayed
        await tick()
        renderKeyboard()
      }}
      on:mousedown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <i class="bx {alphanumericDisplayed ? 'bx-math' : 'bx-font-family'}"></i>
    </button>
  </div>
{/if}
