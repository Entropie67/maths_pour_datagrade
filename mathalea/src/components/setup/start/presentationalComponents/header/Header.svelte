<script lang="ts">
  import NavBar from '../../../../../components/shared/header/NavBar.svelte'
  import type { VueType } from '../../../../../lib/VueType'
  import type { Language } from '../../../../../lib/types/languages'
  import NavBarRecorder from '../../capytale/NavBarRecorder.svelte'
  import ModalReorder from './ModalReorder.svelte'
  import SideMenuWrapper from './SideMenuWrapper.svelte'
  import HeaderButtons from './headerButtons/HeaderButtons.svelte'
  import EditedSelectionBar from '../../../mesFeuilles/EditedSelectionBar.svelte'

  export let isExerciseDisplayed: boolean
  export let isNavBarVisible: boolean
  export let zoomUpdate: (plusMinus: '+' | '-') => void
  export let setAllInteractive: (isAllInteractive: boolean) => void
  export let newDataForAll: () => void
  export let trash: () => void
  export let handleExport: (vue: VueType) => void
  export let handleRecorder: () => void
  export let locale: Language
  export let handleLanguage: (lang: string) => void
  export let isCapytale: boolean
  export let isRecorder: boolean
  export let buildUrlAndOpenItInNewTab: (type: 'usual' | 'eleve') => void
  export let showSettingsDialog: () => void
  export let importExercises: (urlFeuilleEleve: string) => void
  export let isExercisesListEmpty: boolean
  export let isSidenavOpened: boolean
  export let toggleSidenav: (test: boolean) => void
  export let exportQcmCam: () => Promise<void>
  export let isMd: boolean
  export let isFlowmath: boolean
  export let openCapytaleViewInNewTab: (
    view: 'typst' | 'diaporama' | 'tbi',
  ) => void

  let reorderModalDisplayed: boolean
</script>

<header
  class="flex flex-col scrollbar-hide w-full
  md:sticky md:top-0 md:z-[1040]
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  {#if isRecorder}
    <div
      id="headerCapytale"
      class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas print-hidden"
    >
      <NavBarRecorder
        {zoomUpdate}
        {newDataForAll}
        {trash}
        {buildUrlAndOpenItInNewTab}
        {showSettingsDialog}
        {importExercises}
        {isExercisesListEmpty}
        {isCapytale}
        {handleRecorder}
        {locale}
        {handleLanguage}
        {isFlowmath}
        {openCapytaleViewInNewTab}
      />
    </div>
  {:else}
    <!-- Entête -->
    {#if isNavBarVisible}
      <div
        id="headerStart"
        class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas print-hidden"
      >
        <NavBar
          subtitle={isExerciseDisplayed ? 'Conception de document' : undefined}
          subtitleType="design"
          {locale}
          {handleLanguage}
          onTbi={isExerciseDisplayed ? undefined : () => handleExport('tbi')}
        />
      </div>
    {/if}
    <!-- modification des exercices d'une sélection de « Mes sélections » -->
    <EditedSelectionBar />
    {#if isExerciseDisplayed}
      <div
        class="relative w-full flex flex-col justify-center items-center pl-100 h-25 lg:h-12.5"
        id="barre-boutons"
      >
        <SideMenuWrapper {isRecorder} {isSidenavOpened} {toggleSidenav} {isMd} />
        <HeaderButtons
          bind:reorderModalDisplayed
          {zoomUpdate}
          {setAllInteractive}
          {newDataForAll}
          {trash}
          {handleExport}
          {exportQcmCam}
        />
      </div>
    {/if}
  {/if}
</header>

<ModalReorder {reorderModalDisplayed} />
