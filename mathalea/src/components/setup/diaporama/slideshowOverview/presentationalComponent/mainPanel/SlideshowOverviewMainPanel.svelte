<script lang="ts">
  import type { Serie } from '../../../types'
  import SlideshowOverviewSeries from './SlideshowOverviewSerie.svelte'

  export let isQuestionsVisible: boolean | undefined
  export let isCorrectionVisible: boolean | undefined
  export let currentSeriesIndex: number
  export let order: number[]
  export let series: Serie[]
  export let correctionsSteps: number[]
  export let zoom: string
</script>

{#each Array(series.length).keys() as seriesId}
  <div
    class={currentSeriesIndex === 4 || currentSeriesIndex === seriesId
      ? ''
      : 'hidden'}
  >
    <SlideshowOverviewSeries
      {isQuestionsVisible}
      {isCorrectionVisible}
      seriesIndex={seriesId}
      {order}
      {series}
      {correctionsSteps}
      {zoom}
    />
  </div>
{/each}
