<script>
  import Exercice from '../exercices/Exercice'
  import HeaderExerciceVueProf from '../components/shared/exercice/shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte'
  import { afterUpdate } from 'svelte'
  import {
    fetchServerVersion,
    checkForServerUpdate,
    getLocalVersion,
    forceLocalVersion,
  } from '../lib/components/version'

  export let indiceExercice
  export let indiceLastExercice

  export const titre = 'Version du serveur'
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
  exercice.id = 'Version'
  exercice.numeroExercice = indiceExercice
  exercice.interactif = false
  let promise = fetchServerVersion()
  let localeVersion = getLocalVersion()
  let compare = checkForServerUpdate()
  function update() {
    forceLocalVersion()
    localeVersion = getLocalVersion()
    compare = checkForServerUpdate()
  }
</script>

<HeaderExerciceVueProf
  {indiceExercice}
  {indiceLastExercice}
  id="Version"
  {...headerExerciceProps}
/>

<br />
La version du serveur est :
<br /><br />
<pre>fetchServerVersion()</pre>
<br /><br />
<p>Version locale du Serveur: {localeVersion}</p>
{#await promise}
  <p>...attendre</p>
{:then version}
  <p>Version du Serveur: {version}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
<br /><br />
{#await compare}
  <p>...attendre</p>
{:then compareValue}
  <p>
    Compare la version locale avec la version du Serveur: {compareValue
      ? 'différent'
      : 'identique'}
  </p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
<br /><br />

<button
  class="inline-flex px-6 py-2.5 ml-6 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas font-medium text-xs leading-tight uppercase rounded shadow-md transform hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest hover:shadow-lg focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:shadow-lg focus:outline-none focus:ring-0 active:bg-coopmaths-action-lightest dark:active:bg-coopmathsdark-action-lightest active:shadow-lg transition duration-150 ease-in-out"
  on:click="{() => {
    promise = fetchServerVersion()
  }}">Rafraîchir</button
>
<br /><br />
<button
  class="inline-flex px-6 py-2.5 ml-6 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas font-medium text-xs leading-tight uppercase rounded shadow-md transform hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest hover:shadow-lg focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:shadow-lg focus:outline-none focus:ring-0 active:bg-coopmaths-action-lightest dark:active:bg-coopmathsdark-action-lightest active:shadow-lg transition duration-150 ease-in-out"
  on:click="{() => {
    update()
  }}">Force la version locale</button
>
