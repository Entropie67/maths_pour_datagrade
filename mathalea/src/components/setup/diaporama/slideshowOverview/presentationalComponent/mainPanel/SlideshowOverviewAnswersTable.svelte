<script lang="ts">
  import { tick } from 'svelte'
  import { mathaleaRenderDiv } from '../../../../../../lib/mathalea'
  import BasicClassicModal from '../../../../../shared/modal/BasicClassicModal.svelte'
  import ZoomButtons from '../../../../start/presentationalComponents/header/headerButtons/setupButtons/ZoomButtons.svelte'
  import {
    calculeNombreDeColonnes,
    doitAfficherFormuleComplete,
    repartisEnColonnes,
  } from '../../../answersTable'
  import type { Slide } from '../../../types'

  const ZOOM_MIN = 0.2
  // Police plus grande par défaut : pensé pour être lisible projeté en classe.
  const ZOOM_PAR_DEFAUT = 1.6

  export let slides: Slide[]
  export let order: number[]
  export let nbVues: number
  export let revealedAnswersCount: number
  export let showAllAnswers: () => void
  export let hideAllAnswers: () => void
  export let setRevealedAnswersCount: (count: number) => void
  export let handleAnswersTableStepsClick: (
    button: 'backward' | 'forward',
  ) => void

  $: toutesReponsesRevelees = revealedAnswersCount >= order.length

  let zoom = ZOOM_PAR_DEFAUT
  let largeurConteneur = 0
  let tableauConteneur: HTMLElement

  $: vuesIndexes = [...Array(nbVues).keys()]
  $: nombreDeColonnes = calculeNombreDeColonnes(largeurConteneur, order.length)
  $: colonnes = repartisEnColonnes(order, nombreDeColonnes)

  // Le nombre de colonnes peut changer après le montage (largeurConteneur
  // n'est connu qu'après le premier rendu, puis évolue avec la fenêtre), ce
  // qui régénère le HTML brut des réponses (`{@html}`) : il faut donc relancer
  // KaTeX à chaque changement de `colonnes`, pas seulement à l'affichage.
  // Idem quand une réponse est révélée par le pas à pas : son `{@html}` vient
  // d'apparaître dans le DOM et n'a jamais été traité par KaTeX.
  $: if (colonnes.length > 0 && revealedAnswersCount >= 0) {
    tick().then(() => mathaleaRenderDiv(tableauConteneur, -1))
  }

  // Correction complète agrandie, pour une question sans réponse courte
  // (figure, tableau, construction…) dont le tableau n'affiche qu'une miniature.
  let correctionAgrandie: { numero: number; correction: string } | undefined
  let isCorrectionAgrandieDisplayed = false
  let correctionAgrandieConteneur: HTMLElement

  async function agrandisCorrection(numero: number, correction: string) {
    correctionAgrandie = { numero, correction }
    isCorrectionAgrandieDisplayed = true
    await tick()
    mathaleaRenderDiv(correctionAgrandieConteneur, -1)
  }

  function zoomUpdate(plusMinus: '+' | '-') {
    const newZoom = Number(
      (plusMinus === '+' ? zoom + 0.1 : zoom - 0.1).toFixed(1),
    )
    zoom = Math.max(newZoom, ZOOM_MIN)
  }
</script>

<div
  class="fixed z-20 rounded-b-full rounded-t-full
  bottom-2 lg:bottom-6
  right-2 lg:right-6
  bg-coopmaths-canvas/80 dark:bg-coopmathsdark-canvas/80"
>
  <div
    class="flex flex-col space-y-2
    scale-75 lg:scale-100"
  >
    <ZoomButtons {zoomUpdate} />
  </div>
</div>

<div class="flex flex-col w-full min-w-0" style="font-size: {zoom}rem">
  <div class="p-6 pb-2 flex flex-row flex-wrap items-center gap-x-6 gap-y-3">
    <span
      class="text-4xl font-black
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Tableau des réponses
    </span>
    <!-- Contrôles de révélation, répétés ici (en plus du panneau latéral) :
    projetés en classe, le regard est sur le tableau, pas sur la bande de
    gauche. -->
    <div class="flex flex-row items-center gap-4 text-base">
      <button
        type="button"
        class="flex flex-row items-center gap-1.5 px-3 py-1.5 rounded
        font-bold cursor-pointer
        bg-coopmaths-action dark:bg-coopmathsdark-action
        text-coopmaths-canvas dark:text-coopmathsdark-canvas
        hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest"
        on:click={() =>
          toutesReponsesRevelees ? hideAllAnswers() : showAllAnswers()}
      >
        <i class="bx {toutesReponsesRevelees ? 'bx-hide' : 'bx-show'}"></i>
        {toutesReponsesRevelees ? 'Tout masquer' : 'Tout afficher'}
      </button>
      <div
        class="flex flex-row items-center gap-2
        text-coopmaths-action dark:text-coopmathsdark-action"
      >
        <button
          type="button"
          aria-label="Masquer la dernière réponse"
          class="cursor-pointer disabled:opacity-30 disabled:cursor-default
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
          disabled={revealedAnswersCount === 0}
          on:click={() => handleAnswersTableStepsClick('backward')}
        >
          <i class="bx bxs-left-arrow"></i>
        </button>
        <span
          class="tabular-nums font-bold text-sm
          text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          {revealedAnswersCount} / {order.length}
        </span>
        <button
          type="button"
          aria-label="Révéler la réponse suivante"
          class="cursor-pointer disabled:opacity-30 disabled:cursor-default
          hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest"
          disabled={toutesReponsesRevelees}
          on:click={() => handleAnswersTableStepsClick('forward')}
        >
          <i class="bx bxs-right-arrow"></i>
        </button>
      </div>
    </div>
  </div>
  <div
    class="mt-2 mx-2 lg:mx-6 overflow-x-auto"
    bind:clientWidth={largeurConteneur}
    bind:this={tableauConteneur}
  >
    <div
      class="grid divide-x
      divide-coopmaths-canvas-darkest dark:divide-coopmathsdark-canvas-darkest"
      style="grid-template-columns: repeat({colonnes.length}, minmax(0, 1fr)); column-gap: 2.5rem;"
    >
      {#each colonnes as colonne (colonne.indexDeDepart)}
        <table
          class="border-collapse text-left
          text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          <thead>
            <tr
              class="border-b-2
              border-coopmaths-struct dark:border-coopmathsdark-struct
              text-coopmaths-struct dark:text-coopmathsdark-struct"
            >
              <th class="px-4 py-3 font-black">N°</th>
              {#each vuesIndexes as vueIndex (vueIndex)}
                <th class="px-4 py-3 font-black">
                  {nbVues > 1 ? `Série ${vueIndex + 1}` : 'Réponse'}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each colonne.lignes as slideIndex, indexLocal (slides[slideIndex].vues[0].key + '-' + slideIndex)}
              {@const numeroQuestion = colonne.indexDeDepart + indexLocal}
              <tr
                class="border-b
                border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
              >
                <td
                  class="px-4 py-3 align-top font-black
                  text-coopmaths-struct dark:text-coopmathsdark-struct"
                >
                  {numeroQuestion + 1}
                </td>
                {#each vuesIndexes as vueIndex (vueIndex)}
                  {@const vue = slides[slideIndex].vues[vueIndex]}
                  <td class="px-4 py-3 align-top">
                    {#if numeroQuestion >= revealedAnswersCount}
                      <button
                        type="button"
                        class="group flex flex-row items-center gap-1.5 cursor-pointer
                        text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light
                        hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
                        aria-label="Révéler les réponses jusqu'à la question {numeroQuestion +
                          1}"
                        title="Cliquer pour révéler"
                        on:click={() =>
                          setRevealedAnswersCount(numeroQuestion + 1)}
                      >
                        <span>···</span>
                        <i
                          class="bx bx-show text-[0.7em]
                          opacity-0 group-hover:opacity-100"
                        ></i>
                      </button>
                    {:else if vue === undefined || vue.correction.trim() === ''}
                      <span
                        class="text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
                      >
                        –
                      </span>
                    {:else if vue.lettresQcm.length === 0 && vue.reponsesCourtes.length === 0}
                      <!-- Pas de réponse courte (figure, tableau, construction…) :
                      miniature de la correction complète, agrandie au clic.
                      Elle est calée sur la fin de la correction, là où se
                      trouve en général la réponse. -->
                      <button
                        type="button"
                        class="relative flex flex-col justify-end w-full max-h-[8em] overflow-hidden
                        text-left cursor-zoom-in rounded
                        hover:ring-2 ring-coopmaths-action dark:ring-coopmathsdark-action"
                        aria-label="Agrandir la correction de la question {numeroQuestion +
                          1}"
                        title="Cliquer pour agrandir"
                        on:click={() =>
                          agrandisCorrection(
                            numeroQuestion + 1,
                            vue.correction,
                          )}
                      >
                        <span class="miniature-correction">
                          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                          {@html vue.correction}
                        </span>
                        <span
                          class="absolute inset-x-0 top-0 h-6 bg-gradient-to-b
                          from-coopmaths-canvas dark:from-coopmathsdark-canvas"
                        ></span>
                      </button>
                    {:else if doitAfficherFormuleComplete(vue.lettresQcm, vue.reponsesCourtes)}
                      <!-- Plusieurs blancs (ex : remplisLesBlancs) : afficher
                      la correction complète est plus compréhensible que les
                      réponses isolées les unes des autres. -->
                      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                      {@html vue.correctionText}
                    {:else}
                      <div
                        class="flex flex-row flex-wrap items-baseline gap-x-3"
                      >
                        {#each vue.lettresQcm as lettre (lettre)}
                          <span
                            class="font-black
                            text-coopmaths-action dark:text-coopmathsdark-action"
                          >
                            {lettre}
                          </span>
                        {/each}
                        {#each vue.reponsesCourtes as reponse, indexReponse (indexReponse)}
                          <span>
                            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                            {@html reponse}
                          </span>
                        {/each}
                      </div>
                    {/if}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      {/each}
    </div>
  </div>
</div>

<BasicClassicModal bind:isDisplayed={isCorrectionAgrandieDisplayed}>
  <div slot="header">
    {#if correctionAgrandie}
      Question {correctionAgrandie.numero}
    {/if}
  </div>
  <div
    slot="content"
    class="text-left overflow-auto max-h-[70vh]"
    bind:this={correctionAgrandieConteneur}
  >
    {#if correctionAgrandie}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html correctionAgrandie.correction}
    {/if}
  </div>
</BasicClassicModal>

<style>
  /* La miniature réduit tout, figures SVG comprises, et reste inerte : le
  clic revient au bouton qui l'agrandit. */
  .miniature-correction {
    display: block;
    flex-shrink: 0;
    zoom: 0.5;
    pointer-events: none;
  }
</style>
