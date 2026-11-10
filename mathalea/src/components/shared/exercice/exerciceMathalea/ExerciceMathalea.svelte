<script lang="ts">
  import type TypeExercice from '../../../../exercices/Exercice'
  import ExerciceMathaleaVueEleve from './exerciceMathaleaVueEleve/ExerciceMathaleaVueEleve.svelte'
  import ExerciceMathaleaVueProf from './exerciceMathaleaVueProf/ExerciceMathaleaVueProf.svelte'

  export let vue: 'prof' | 'eleve'
  export let exercise: TypeExercice
  export let exerciseIndex: number
  export let indiceLastExercice: number
  export let isCorrectionVisible: boolean = false
  export let toggleSidenav: (open: boolean) => void
</script>

{#if vue === 'prof'}
  <ExerciceMathaleaVueProf
    {exercise}
    {exerciseIndex}
    {indiceLastExercice}
    {isCorrectionVisible}
    {toggleSidenav}
    on:exerciseRemoved
  />
{:else if vue === 'eleve'}
  <ExerciceMathaleaVueEleve
    {exercise}
    {exerciseIndex}
    {indiceLastExercice}
    {isCorrectionVisible}
  />
{/if}
