<script>
  import HeaderExerciceVueProf from '../components/shared/exercice/shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte'
  import CheckboxWithLabel from '../components/shared/forms/CheckboxWithLabel.svelte'
  import InputNumber from '../components/shared/forms/InputNumber.svelte'
  import { fixeBordures } from '../lib/2d/fixeBordures'
  import { repere } from '../lib/2d/reperes'
  import { spline, trieNoeuds } from '../lib/mathFonctions/Spline'
  import { context } from '../modules/context'
  import { mathalea2d } from '../modules/mathalea2d'

  export const titre = 'Interpolation par splines (avec formulaire)'

  export const refs = {
    'fr-fr': ['P022'],
    'fr-ch': [],
  }
  export const uuid = 'spline'

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
  let noeuds = [
    { x: -3, y: -2, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
    { x: -1, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    { x: 1, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
    { x: 3, y: 4, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
  ]

  let contenu = ''

  function refreshCourb() {
    if (trieNoeuds(noeuds)) {
      const f = spline(noeuds)
      const { xMin, xMax, yMin, yMax } = f.trouveMaxes()
      const r = repere({ xMin, xMax, yMin, yMax })
      const c = f.courbe({
        repere: r,
        ajouteNoeuds: true,
        color: 'blue',
        epaisseur: 2,
      })
      const objets = [r, c]
      const fPrime = f.splineDerivee
      const { xMin: xMinPrime, xMax: xMaxPrime } = fPrime.trouveMaxes()
      const { yMin: yMinPrime, yMax: yMaxPrime } = fPrime.amplitude()
      const rPrime = repere({
        xMin: xMinPrime,
        xMax: xMaxPrime,
        yMin: yMinPrime,
        yMax: yMaxPrime,
      })
      const cPrime = fPrime.courbe({
        repere: rPrime,
        color: 'red',
        epaisseur: 2,
      })
      const objetsPrime = [rPrime, cPrime]

      contenu =
        'Fonction<br>' +
        mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
      contenu +=
        'Dérivée<br>' +
        mathalea2d(Object.assign({}, fixeBordures(objetsPrime)), objetsPrime)
    }
  }

  function removeNoeud() {
    if (noeuds.length < 4) return
    noeuds.pop()
    noeuds = noeuds
    refreshCourb()
  }

  function addNoeud() {
    noeuds.push({
      x: noeuds.at(-1).x + 1,
      y: noeuds.at(-1).y,
      deriveeGauche: 0,
      deriveeDroit: 0,
      isVisible: true,
    })
    noeuds = noeuds
    refreshCourb()
  }

  function copy() {
    noeuds = noeuds
    navigator.clipboard.writeText(JSON.stringify(noeuds))
    alert('Noeuds copiés dans le presse-papier')
  }

  function exportLatex() {
    context.isHtml = false
    if (trieNoeuds(noeuds)) {
      const f = spline(noeuds)
      const { xMin, xMax, yMin, yMax } = f.trouveMaxes()
      const r = repere({ xMin, xMax, yMin, yMax })
      const c = f.courbe({
        repere: r,
        ajouteNoeuds: true,
        color: 'blue',
        epaisseur: 2,
      })
      const objets = [r, c]
      const fPrime = f.splineDerivee
      const { xMin: xMinPrime, xMax: xMaxPrime } = fPrime.trouveMaxes()
      const { yMin: yMinPrime, yMax: yMaxPrime } = fPrime.amplitude()
      console.log(yMin, yMax)
      const rPrime = repere({
        xMin: xMinPrime,
        xMax: xMaxPrime,
        yMin: yMinPrime,
        yMax: yMaxPrime,
      })
      const cPrime = fPrime.courbe({
        repere: rPrime,
        color: 'red',
        epaisseur: 2,
      })
      const objetsPrime = [rPrime, cPrime]
      contenu = mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
      contenu += mathalea2d(
        Object.assign({}, fixeBordures(objetsPrime)),
        objetsPrime,
      )
    }
    navigator.clipboard.writeText(contenu)
    alert('LAtex collé dans le presse-papier')
    context.isHtml = true
  }

  async function paste() {
    const jsonNoeuds = (await navigator.clipboard.readText())
      .replaceAll('x', '"x"')
      .replaceAll('y', '"y"')
      .replaceAll('deriveeGauche', '"deriveeGauche"')
      .replaceAll('deriveeDroit', '"deriveeDroit"')
      .replaceAll('isVisible', '"isVisible"')
    try {
      noeuds = JSON.parse(jsonNoeuds)
      alert('Presse-papier importé')
    } catch (e) {
      console.error(e.message)
    }
  }

  refreshCourb()
</script>

<div class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">
  <HeaderExerciceVueProf
    {indiceExercice}
    {indiceLastExercice}
    id="spline"
    {...headerExerciceProps}
  />

  <section>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html contenu}
        <button
          on:click={exportLatex}
          class="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-600 hover:border-blue-700 transition-colors duration-200 shadow-md"
        >
          Export latex
        </button>
      </div>
      <div class="my-10 grid grid-cols-5 gap-4 text-center">
        <div>x</div>
        <div>y</div>
        <div>Dérivée à gauche</div>
        <div>Dérivée à droite</div>
        <div class="text-left">Visible ?</div>
        {#each noeuds as { x, y, deriveeGauche, deriveeDroit, isVisible }, i}
          <InputNumber
            id="spline-x-{i}"
            bind:value={x}
            min={-10}
            max={10}
            step={0.1}
            on:change={refreshCourb}
          />
          <InputNumber
            id="spline-y-{i}"
            bind:value={y}
            min={-10}
            max={10}
            step={0.1}
            on:change={refreshCourb}
          />
          <InputNumber
            id="spline-deriveeGauche-{i}"
            bind:value={deriveeGauche}
            min={-10}
            max={10}
            step={0.1}
            on:change={refreshCourb}
          />
          <InputNumber
            id="spline-deriveeDroit-{i}"
            bind:value={deriveeDroit}
            min={-10}
            max={10}
            step={0.1}
            on:change={refreshCourb}
          />
          <CheckboxWithLabel
            id="spline-visible-{i}"
            bind:isChecked={isVisible}
            on:change={refreshCourb}
          />
        {/each}
        <button on:click={removeNoeud} aria-label="Supprimer un noeud"
          ><i class="bx bx-lg bx-minus-circle"></i></button
        >
        <button on:click={addNoeud} aria-label="Ajouter un noeud"
          ><i class="bx bx-lg bx-plus-circle"></i></button
        >
        <button on:click={copy} aria-label="Copier"
          ><i class="bx bx-lg bx-clipboard"></i></button
        >
        <button on:click={paste} aria-label="Coller"
          ><i class="bx bx-lg bx-download"></i></button
        >
      </div>
    </div>
  </section>
</div>
