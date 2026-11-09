<script>
  import HeaderExerciceVueProf from '../components/shared/exercice/shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte'
  export let indiceExercice
  export let indiceLastExercice
  const headerExerciceProps = {
    title: '',
    isInteractif: false,
    settingsReady: false,
    interactifReady: false,
    randomReady: false,
    correctionReady: false,
  }

  const a = new Date().getSeconds()
</script>

<HeaderExerciceVueProf
  {indiceExercice}
  {indiceLastExercice}
  id="spline"
  {...headerExerciceProps}
/>

<div>{a}</div>
