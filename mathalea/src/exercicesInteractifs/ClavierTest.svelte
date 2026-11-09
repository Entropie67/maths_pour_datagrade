<script>
  import { afterUpdate } from 'svelte'
  import HeaderExerciceVueProf from '../components/shared/exercice/shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte'
  import SelectUnique from '../components/shared/forms/SelectUnique.svelte'
  import Exercice from '../exercices/Exercice'
  import {
    KeyboardType,
    convertKeyboardTypeToBlocks,
    convertToKeyboardCategory,
  } from '../lib/interactif/claviers/keyboard'
  import { ajouteChampTexteMathLive } from '../lib/interactif/questionMathLive'
  import { loadMathLive } from '../modules/loaders'

  export let indiceExercice
  export let indiceLastExercice

  export const titre = 'Test du clavier'
  // Cette ressource n'a pas d'uuid ou de ref
  // Son accès est défini dans uuidsRessources.json

  const headerExerciceProps = {
    title: '',
    isInteractif: false,
    settingsReady: false,
    interactifReady: false,
    randomReady: false,
    correctionReady: false,
  }

  const exercice = new Exercice()
  exercice.id = 'clavierTest'
  exercice.numeroExercice = indiceExercice
  exercice.interactif = true
  const claviers = Object.values(KeyboardType)
  const claviersOptions = claviers.map((c) => ({ label: c, value: c }))
  let clavierSelected = KeyboardType.clavierFullOperations

  afterUpdate(() => {
    loadMathLive()
  })
</script>

<div class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">
  <HeaderExerciceVueProf
    {indiceExercice}
    {indiceLastExercice}
    id="clavier"
    {...headerExerciceProps}
  />

  <br />
  Les types de clavier:
  <SelectUnique
    id="clavier-type"
    bind:value={clavierSelected}
    options={claviersOptions}
  />

  <br />Nombre de blocs de touches : {convertKeyboardTypeToBlocks(
    convertToKeyboardCategory(clavierSelected),
  ).length}
  <br />Liste de blocs : {convertKeyboardTypeToBlocks(
    convertToKeyboardCategory(clavierSelected),
  ).join('; ')}

  <br /><br />
  Exemple:
  <br /><br />
  <pre>ajouteChampTexteMathLive(exercice, i, KeyboardType.{clavierSelected}) </pre>
  <br /><br />Et le résultat:
  <div>
    {@html ajouteChampTexteMathLive(
      exercice,
      0,
      convertToKeyboardCategory(clavierSelected),
    )}
  </div>
</div>
