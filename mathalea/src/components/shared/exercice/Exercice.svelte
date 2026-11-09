<script lang="ts">
  import { onMount, type Component } from 'svelte'
  import Exercice from '../../../exercices/Exercice'
  import { isStatic, isSvelte } from '../../../lib/components/componentsUtils'
  import {
    getSvelteComponent,
    mathaleaHandleParamOfOneExercice,
    mathaleaLoadExerciceFromUuid,
  } from '../../../lib/mathalea'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import type { IExercice, InterfaceParams } from '../../../lib/types'
  import ExerciceMathalea from './exerciceMathalea/ExerciceMathalea.svelte'
  import ExerciceHtml from './presentationalComponents/exerciceHtml/ExerciceHtml.svelte'
  import ExerciceStatic from './presentationalComponents/exerciceStatic/ExerciceStatic.svelte'

  export let paramsExercice: InterfaceParams
  export let indiceExercice: number
  export let indiceLastExercice: number
  export let isCorrectionVisible = false
  export let toggleSidenav: (open: boolean) => void

  type ExerciseType =
    | 'mathaleaVueProf'
    | 'mathaleaVueEleve'
    | 'static'
    | 'html'
    | 'svelte'

  let exercise: Exercice
  let exerciseType: ExerciseType
  let ComponentExercice: Component<any>

  let debug = false
  function log(str: string, level: number = 3) {
    if (debug || window.logDebug >= level) {
      console.info(str)
    }
  }

  onMount(async () => {
    log(
      `Exercice.svelte mounted with paramsExercice: ` +
        JSON.stringify(paramsExercice),
    )
    if (isStatic(paramsExercice.uuid)) {
      exerciseType = 'static'
      log(
        `Exercice.svelte n° ${indiceExercice}: Loaded exercise of type ${exerciseType}: uuid ${paramsExercice.uuid}`,
      )
    } else if (isSvelte(paramsExercice.uuid)) {
      exerciseType = 'svelte'
      ComponentExercice = await getSvelteComponent(paramsExercice)
    } else {
      exercise = (await getExercise(paramsExercice)) as Exercice
      exerciseType = await getExerciseType(exercise)
      log(
        `Exercice.svelte n° ${indiceExercice}: Loaded exercise of type ${exerciseType}: id ${exercise.id}, uuid ${exercise.uuid}`,
      )
    }
  })

  async function getExercise(
    paramsExercice: InterfaceParams,
  ): Promise<IExercice> {
    const exercise = await mathaleaLoadExerciceFromUuid(paramsExercice.uuid)
    exercise.numeroExercice = indiceExercice
    mathaleaHandleParamOfOneExercice(exercise, paramsExercice)
    if (paramsExercice.duration) exercise.duree = paramsExercice.duration
    return exercise
  }

  async function getExerciseType(exercise: Exercice): Promise<ExerciseType> {
    if (exercise.typeExercice && exercise.typeExercice.includes('html')) {
      return 'html'
    } else {
      if (
        $globalOptions.v === 'eleve' ||
        $globalOptions.v === 'myriade' ||
        $globalOptions.v === 'indices' ||
        $globalOptions.v === 'indice'
      ) {
        return 'mathaleaVueEleve'
      } else {
        return 'mathaleaVueProf'
      }
    }
  }
</script>

{#if exerciseType === 'static'}
  <ExerciceStatic
    {indiceExercice}
    {indiceLastExercice}
    uuid={paramsExercice.uuid}
    zoomFactor={$globalOptions.z ?? '1'}
    isSolutionAccessible={!!$globalOptions.isSolutionAccessible}
    vue={$globalOptions.v}
    on:exerciseRemoved
  />
{:else if exerciseType === 'html'}
  <ExerciceHtml
    vue={$globalOptions.v}
    {exercise}
    {indiceExercice}
    {indiceLastExercice}
    on:exerciseRemoved
  />
{:else if exerciseType === 'svelte'}
  <svelte:component
    this={ComponentExercice}
    {indiceExercice}
    {indiceLastExercice}
  />
{:else if exerciseType === 'mathaleaVueEleve'}
  <ExerciceMathalea
    vue="eleve"
    {exercise}
    exerciseIndex={indiceExercice}
    {indiceLastExercice}
    {isCorrectionVisible}
    {toggleSidenav}
    on:exerciseRemoved
  />
{:else if exerciseType === 'mathaleaVueProf'}
  <ExerciceMathalea
    vue="prof"
    {exercise}
    exerciseIndex={indiceExercice}
    {indiceLastExercice}
    {isCorrectionVisible}
    {toggleSidenav}
    on:exerciseRemoved
  />
{/if}

<style>
</style>
