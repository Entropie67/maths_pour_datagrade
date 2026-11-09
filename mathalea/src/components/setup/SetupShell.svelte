<script lang="ts">
  import { darkMode } from '../../lib/stores/generalStore'
  import Footer from '../Footer.svelte'
  import Sidenav from '../shared/sidenav/Sidenav.svelte'
  import { SM_BREAKPOINT } from '../keyboard/lib/sizes'

  /** id for the root wrapper element (e.g. "startComponent", "toolsComponent") */
  export let id: string = ''

  /** Width of the sidenav panel in pixels */
  export let sidenavWidth: number = 400

  /**
   * Left padding applied to the main content area when the sidenav is open.
   * Defaults to `sidenavWidth` when not specified.
   */
  export let paddingLeftOpen: number | undefined = undefined

  /**
   * Left padding applied to the main content area when the sidenav is closed.
   * Use a non-zero value when an element (e.g. a recorder toggle button) still
   * occupies space on the left edge in closed state.
   */
  export let paddingLeftClosed: number = 0

  /** Label shown in the mobile collapsible sidebar header */
  export let mobileSidebarTitle: string = 'Menu'

  /**
   * Bindable: current open/closed state of the sidenav.
   * Exposed so that a parent can read it (e.g. for a message-event listener)
   * without having to call `bind:this`.
   */
  export let isSidenavOpened: boolean = true

  let innerWidth = 0
  $: isMd = innerWidth >= SM_BREAKPOINT
  $: _paddingOpen = paddingLeftOpen ?? sidenavWidth

  /**
   * Toggle or force-open the sidenav.
   * Exposed as a public method (accessible via `bind:this`) so that parents
   * can call it from callbacks such as `trash()` or window message listeners.
   *
   * @param forceOpening – when true the sidenav is always opened;
   *                       when false the state is toggled.
   */
  export function toggleSidenav(forceOpening: boolean): void {
    if (forceOpening) {
      isSidenavOpened = true
    } else {
      isSidenavOpened = !isSidenavOpened
    }
  }
</script>

<svelte:window bind:innerWidth />

<div
  {id}
  class="{$darkMode.isActive
    ? 'dark'
    : ''} relative flex w-screen h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <div class="flex-1 flex flex-col w-full md:overflow-hidden">
    <!--
      Header region — sticky on desktop, scrolls with content on mobile.
      Slot props available: isSidenavOpened, toggleSidenav, isMd
    -->
    <header
      class="flex flex-col scrollbar-hide w-full
             md:sticky md:top-0 md:z-50
             bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      <slot name="header" {isSidenavOpened} {toggleSidenav} {isMd} />
    </header>

    {#if isMd}
      <!-- ================================================================
           DESKTOP LAYOUT
           ================================================================ -->
      <div
        class="relative flex w-full h-full bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      >
        <!--
          Optional slot for elements that live between the sidenav and the
          outer edge in desktop mode (e.g. the recorder-mode toggle button in
          Start.svelte that translates with the sidenav).
          Slot props available: isSidenavOpened, toggleSidenav, isMd
        -->
        <slot name="sidenav-extra" {isSidenavOpened} {toggleSidenav} {isMd} />

        <Sidenav isOpen={isSidenavOpened} width={sidenavWidth}>
          <!--
            Sidebar content.
            Slot props available: isSidenavOpened, toggleSidenav, isMd
          -->
          <slot name="sidebar" {isSidenavOpened} {toggleSidenav} {isMd} />
        </Sidenav>

        <!--
          Main content area — shifts right when the sidenav is open.
          Default slot props available: isSidenavOpened, toggleSidenav, isMd
        -->
        <main
          id="exercisesPart"
          class="absolute right-0 top-0 flex flex-col w-full h-full px-6
                 overflow-x-auto overflow-y-auto
                 transition-[padding-left] duration-300
                 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
          style="padding-left: {isSidenavOpened
            ? _paddingOpen
            : paddingLeftClosed}px"
        >
          <slot {isSidenavOpened} {toggleSidenav} {isMd} />
        </main>
      </div>
    {:else}
      <!-- ================================================================
           MOBILE LAYOUT
           ================================================================ -->
      <div
        class="flex flex-col h-full justify-between bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      >
        <div>
          <!-- Collapsible sidebar -->
          <div
            class="w-full flex flex-col bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
          >
            <button
              type="button"
              class="group w-full flex flex-row justify-between items-center p-4"
              aria-expanded={isSidenavOpened}
              on:click={() => (isSidenavOpened = !isSidenavOpened)}
            >
              <div
                class="text-lg font-bold
                       text-coopmaths-action dark:text-coopmathsdark-action
                       hover:text-coopmaths-action-lightest hover:dark:text-coopmathsdark-action-lightest"
              >
                {mobileSidebarTitle}
              </div>
              <i
                class="bx bxs-up-arrow text-lg
                       text-coopmaths-action dark:text-coopmathsdark-action
                       hover:text-coopmaths-action-lightest hover:dark:text-coopmathsdark-action-lightest
                       transition-transform duration-300
                       {isSidenavOpened ? 'rotate-0' : 'rotate-180'}"
              ></i>
            </button>

            {#if isSidenavOpened}
              <div
                class="w-full overflow-y-visible overscroll-contain
                       bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
              >
                <slot name="sidebar" {isSidenavOpened} {toggleSidenav} {isMd} />
              </div>
            {/if}
          </div>

          <!-- Main content -->
          <main
            id="exercisesPart"
            class="flex w-full px-6 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
          >
            <slot {isSidenavOpened} {toggleSidenav} {isMd} />
          </main>
        </div>

        <Footer />
      </div>
    {/if}
  </div>
</div>

<style>
  :root {
    scrollbar-color: #aaaaaa transparent;
  }
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-thumb {
    background: #cccccc;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #dddddd;
  }
  ::-webkit-scrollbar-track {
    background: #ffffff;
    border-radius: 10px;
    box-shadow: inset 7px 10px 12px #f0f0f0;
  }
</style>
