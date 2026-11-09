<script lang="ts">
  import type {
    PageAnalysee,
    ResultatAnalyse,
  } from '../../../lib/omr/analyseScan'
  import type { OmrEvaluation } from '../../../lib/omr/omrTypes'
  import { associerPage, ecarterPage } from '../../../lib/omr/omrPageReview'
  import { ouvrirPdf } from '../../../lib/omr/pdfRaster'

  let {
    evaluation,
    resultat = $bindable(),
    fichierScan,
    page,
    onassigned,
  }: {
    evaluation: OmrEvaluation
    resultat: ResultatAnalyse
    fichierScan: File | null
    page: PageAnalysee
    onassigned: (copieId: string) => void
  } = $props()
  let copieId = $state('')
  let numero = $state(1)
  let retournee = $state(false)
  let manuelle = $state(false)
  let occupe = $state(false)
  let erreur = $state('')
  const copie = $derived(evaluation.copies.find((c) => c.copieId === copieId))
  const conflit = $derived(
    resultat.pages.find(
      (p) =>
        p.rang !== page.rang &&
        p.statut === 'ok' &&
        p.copieId === copieId &&
        p.page === numero,
    ),
  )
  $effect(() => {
    copieId = evaluation.copies.some((c) => c.copieId === page.copieId)
      ? page.copieId!
      : ''
    numero = page.page ?? 1
    retournee = page.retournee ?? false
    manuelle = page.lectureManuelle ?? false
    erreur = ''
  })
  async function associer() {
    if (!fichierScan || occupe) return
    occupe = true
    erreur = ''
    // Ne jamais appliquer un résultat au lot suivant pendant une rastérisation.
    const initial = resultat
    const fichier = fichierScan
    const association = {
      rang: page.rang,
      copieId,
      page: numero,
      retournee,
      manuelle,
      remplacer: !!conflit,
    }
    try {
      const document = await ouvrirPdf(await fichier.arrayBuffer())
      try {
        const image = await document.rendrePage(association.rang)
        if (initial !== resultat || fichier !== fichierScan)
          throw new Error('Le lot a changé. Recommencer l’association.')
        resultat = associerPage(evaluation, resultat, image, association)
        onassigned(association.copieId)
      } finally {
        await document.fermer()
      }
    } catch (e) {
      erreur = e instanceof Error ? e.message : String(e)
    } finally {
      occupe = false
    }
  }
</script>

<details class="my-3 rounded border p-3">
  <summary class="cursor-pointer font-semibold"
    >Associer ou écarter la page {page.rang} du scan</summary
  >
  <p class="my-2 text-sm">
    Identifier l’élève et la page sur le scan. Cette opération recalcule les
    lectures des copies concernées et retire leurs corrections manuelles et leur
    validation. Les commentaires sont conservés.
  </p>
  <fieldset disabled={occupe} class="flex flex-col gap-2">
    <label
      >Associer à l’élève
      <select bind:value={copieId} onchange={() => (numero = 1)}>
        <option value="">Choisir un élève</option>
        {#each evaluation.copies as c (c.copieId)}<option value={c.copieId}
            >{c.eleve.nom} ({c.copieId})</option
          >{/each}
      </select>
    </label>
    <label
      >Page dans la copie
      <select bind:value={numero} disabled={!copie}>
        {#each copie?.pages ?? [] as _, i (i)}<option value={i + 1}
            >{i + 1}</option
          >{/each}
      </select>
    </label>
    <label
      ><input type="checkbox" bind:checked={retournee} /> Retourner la page du scan
      de 180° avant lecture</label
    >
    <label
      ><input type="checkbox" bind:checked={manuelle} /> Saisir les réponses manuellement
      (repères illisibles)</label
    >
    {#if manuelle}<p class="text-sm">
        Chaque case sera à vérifier. Renseigner les cases ou attribuer une note
        manuelle à chaque question.
      </p>{/if}
    <button disabled={!copie || !fichierScan} onclick={associer}
      >{occupe
        ? 'Lecture…'
        : conflit
          ? `Utiliser cette page à la place de la page ${conflit.rang} du scan`
          : 'Associer et relire cette page'}</button
    >
    <button
      disabled={page.statut === 'ecartee'}
      onclick={() => (resultat = ecarterPage(evaluation, resultat, page.rang))}
      >Écarter cette page de la correction</button
    >
  </fieldset>
  {#if erreur}<p role="alert" class="text-red-700">{erreur}</p>{/if}
</details>

<style>
  select {
    color: #172033;
    background: white;
    border: 1px solid #94a3b8;
    padding: 0.2rem;
  }
  button {
    border: 1px solid #64748b;
    border-radius: 0.3rem;
    padding: 0.3rem 0.6rem;
  }
  button:disabled {
    opacity: 0.45;
  }
</style>
