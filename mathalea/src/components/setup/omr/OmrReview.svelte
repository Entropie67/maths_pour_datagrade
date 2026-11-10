<script lang="ts">
  import type { OmrReviewView } from '../../../lib/omr/omrSavedState'
  import OmrPageAssignment from './OmrPageAssignment.svelte'
  import type { ResultatAnalyse } from '../../../lib/omr/analyseScan'
  import type { OmrEvaluation, OmrBoxStatus } from '../../../lib/omr/omrTypes'
  import {
    lecturesRevisees,
    reponseAttendue,
    reviserResultat,
    revisionVide,
    validerCopies,
  } from '../../../lib/omr/omrReview'
  import { telechargerCopiesAnnotees } from '../../../lib/omr/omrAnnotatedPdf'
  import { telechargerFeedback } from '../../../lib/omr/omrFeedback'
  import { ouvrirPdf } from '../../../lib/omr/pdfRaster'
  import { pivoter180 } from '../../../lib/omr/qr'
  import { otsuThreshold } from '../../../lib/omr/binarize'
  import { applyHomography, pageToImage } from '../../../lib/omr/registration'
  import { downloadBlob } from '../../../lib/spreadsheet'

  let {
    evaluation,
    resultat = $bindable(),
    fichierScan,
    viewState = $bindable({
      selection: '',
      rang: 1,
      seulementAVerifier: false,
      zoom: 100,
    }),
  }: {
    evaluation: OmrEvaluation
    resultat: ResultatAnalyse
    fichierScan: File | null
    viewState?: OmrReviewView
  } = $props()
  let imageUrl = $state('')
  let chargement = $state(false)
  let erreur = $state('')
  let exportEnCours = $state(false)
  const copiesPretes = $derived(
    resultat.copies.filter(
      (c) =>
        !c.aArbitrer &&
        !c.pagesManquantes.length &&
        !resultat.revision?.validees.includes(c.copieId),
    ).length,
  )
  let geometrie = $state<{ id: string; points: string }[]>([])
  let dimensions = $state({ width: 1, height: 1 })
  const copies = $derived(
    resultat.copies.filter(
      (c) =>
        !viewState.seulementAVerifier ||
        !resultat.revision?.validees.includes(c.copieId),
    ),
  )
  const copie = $derived(
    copies.find((c) => c.copieId === viewState.selection) ?? copies[0],
  )
  const meta = $derived(
    evaluation.copies.find((c) => c.copieId === copie?.copieId),
  )
  const boxes = $derived(meta ? evaluation.layouts[meta.layoutId] : [])
  const lectures = $derived(
    copie ? lecturesRevisees(resultat, copie.copieId) : [],
  )
  const page = $derived(resultat.pages.find((p) => p.rang === viewState.rang))

  function choisirCopie(id: string) {
    viewState.selection = id
    viewState.rang = resultat.pages.find((p) => p.copieId === id)?.rang ?? 1
  }
  $effect(() => {
    if (copies[0] && !copies.some((c) => c.copieId === viewState.selection)) {
      choisirCopie(copies[0].copieId)
    }
  })

  // Une seule page est gardée en mémoire. La fermeture libère le worker PDF.
  $effect(() => {
    const fichier = fichierScan
    const courante = page
    const reperes = evaluation.reperes
    const layout = courante?.copieId
      ? (evaluation.layouts[
          evaluation.copies.find((c) => c.copieId === courante.copieId)
            ?.layoutId ?? ''
        ] ?? [])
      : []
    let annule = false
    imageUrl = ''
    geometrie = []
    if (!fichier || !courante) return
    chargement = true
    void (async () => {
      const document = await ouvrirPdf(await fichier.arrayBuffer())
      try {
        let image = await document.rendrePage(courante.rang)
        if (courante.retournee) image = pivoter180(image)
        if (annule) return
        const canvas = new OffscreenCanvas(image.width, image.height)
        const ctx = canvas.getContext('2d')!
        const rgba = ctx.createImageData(image.width, image.height)
        for (let i = 0; i < image.data.length; i++) {
          rgba.data[i * 4] =
            rgba.data[i * 4 + 1] =
            rgba.data[i * 4 + 2] =
              image.data[i]
          rgba.data[i * 4 + 3] = 255
        }
        ctx.putImageData(rgba, 0, 0)
        const blob = await canvas.convertToBlob()
        if (annule) return
        imageUrl = URL.createObjectURL(blob)
        dimensions = { width: image.width, height: image.height }
        const h = pageToImage(image, otsuThreshold(image), reperes)
        geometrie =
          h && courante.statut === 'ok' && !courante.lectureManuelle
            ? layout
                .filter((b) => b.page === courante.page)
                .map((b) => ({
                  id: b.id,
                  points: [
                    { x: b.x, y: b.y },
                    { x: b.x + b.w, y: b.y },
                    { x: b.x + b.w, y: b.y + b.h },
                    { x: b.x, y: b.y + b.h },
                  ]
                    .map((p) => {
                      const v = applyHomography(h, p)
                      return `${v.x},${v.y}`
                    })
                    .join(' '),
                }))
            : []
      } finally {
        await document.fermer()
      }
    })()
      .catch((e) => {
        if (!annule) erreur = String(e)
      })
      .finally(() => {
        if (!annule) chargement = false
      })
    return () => {
      annule = true
    }
  })
  $effect(() => {
    const url = imageUrl
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  })

  function modifier(
    action: (
      revision: NonNullable<ResultatAnalyse['revision']>,
      id: string,
    ) => void,
  ) {
    if (!copie) return
    const revision = structuredClone(
      $state.snapshot(resultat.revision ?? revisionVide()),
    )
    action(revision, copie.copieId)
    revision.validees = revision.validees.filter((id) => id !== copie.copieId)
    try {
      resultat = reviserResultat(evaluation, { ...resultat, revision })
      erreur = ''
    } catch (e) {
      erreur = String(e)
    }
  }
  function changerCase(id: string, valeur: string) {
    modifier((r, c) => {
      r.cases[c] ??= {}
      if (valeur === '') delete r.cases[c][id]
      else r.cases[c][id] = valeur as OmrBoxStatus
    })
  }
  function changerQuestion(qid: string, valeur: string, note: boolean) {
    modifier((r, c) => {
      r.questions[c] ??= {}
      const actuelle = r.questions[c][qid] ?? { commentaire: '' }
      r.questions[c][qid] = note
        ? { ...actuelle, points: valeur === '' ? undefined : Number(valeur) }
        : { ...actuelle, commentaire: valeur }
    })
  }
  function valider(touteLaClasse = false) {
    if (!touteLaClasse && !copie) return
    resultat = validerCopies(
      $state.snapshot(resultat),
      touteLaClasse ? undefined : copie!.copieId,
    )
  }
  async function exporter(typePdf: 'fiche' | 'annote', id?: string) {
    exportEnCours = true
    erreur = ''
    try {
      if (typePdf === 'annote') {
        if (!fichierScan)
          throw new Error('Sélectionner le PDF scanné pour annoter les copies.')
        await telechargerCopiesAnnotees(evaluation, resultat, fichierScan, id)
      } else {
        await telechargerFeedback(evaluation, resultat, id)
      }
    } catch (e) {
      erreur = String(e)
    } finally {
      exportEnCours = false
    }
  }
  async function sauvegarder() {
    try {
      const empreinte = fichierScan
        ? Array.from(
            new Uint8Array(
              await crypto.subtle.digest(
                'SHA-256',
                await fichierScan.arrayBuffer(),
              ),
            ),
            (x) => x.toString(16).padStart(2, '0'),
          ).join('')
        : null
      downloadBlob(
        new Blob(
          [JSON.stringify({ version: 1, evaluation, resultat, empreinte })],
          { type: 'application/json' },
        ),
        'correction.mathalea-omr.json',
      )
    } catch (e) {
      erreur = String(e)
    }
  }
</script>

<section
  class="flex flex-col gap-4 rounded border p-4"
  aria-label="Relecture des copies"
>
  <h2 class="text-lg font-bold">Revoir et restituer les copies</h2>
  <p class="text-sm">
    Vérifier les cases sur le scan, rectifier la lecture puis valider chaque
    copie. Toute modification retire la validation. Enregistrer la correction
    avant de quitter la page.
  </p>
  <div class="flex flex-wrap items-center gap-3">
    <label
      ><input type="checkbox" bind:checked={viewState.seulementAVerifier} /> Copies
      non validées</label
    >
    <label
      >Copie <select
        value={copie?.copieId ?? ''}
        onchange={(e) => choisirCopie(e.currentTarget.value)}
      >
        {#each copies as c (c.copieId)}<option value={c.copieId}
            >{c.eleve.nom} — {c.points}/{c.pointsMax}{c.aArbitrer
              ? ' — à arbitrer'
              : ''}</option
          >{/each}
      </select></label
    >
    <button onclick={sauvegarder}>Enregistrer la correction</button>
    <button disabled={!copiesPretes} onclick={() => valider(true)}
      >Valider toute la classe ({copiesPretes})</button
    >
    <button
      disabled={exportEnCours || !resultat.copies.length}
      onclick={() => exporter('fiche')}>Fiches compactes — classe (PDF)</button
    >
    <button
      disabled={exportEnCours || !copie}
      onclick={() => exporter('fiche', copie?.copieId)}
      >Fiche compacte — élève (PDF)</button
    >
    <button
      disabled={exportEnCours || !fichierScan || !resultat.copies.length}
      onclick={() => exporter('annote')}>Copies annotées — classe (PDF)</button
    >
    <button
      disabled={exportEnCours || !fichierScan || !copie}
      onclick={() => exporter('annote', copie?.copieId)}
      >Copie annotée — élève (PDF)</button
    >
  </div>
  <p class="text-sm">
    La validation collective s’applique aux copies sans arbitrage ni page
    manquante. Les autres restent à vérifier.
  </p>
  {#if exportEnCours}<p role="status">Compilation du PDF…</p>{/if}
  {#if erreur}<p role="alert" class="text-red-700">{erreur}</p>{/if}
  <div class="grid gap-4 lg:grid-cols-2">
    <div>
      <div class="mb-2 flex flex-wrap gap-3">
        <label
          >Page du scan <select bind:value={viewState.rang}>
            {#each resultat.pages as p (p.rang)}<option value={p.rang}
                >{p.rang} — {evaluation.copies.find(
                  (c) => c.copieId === p.copieId,
                )?.eleve.nom ?? 'Non identifiée'} — {p.statut}</option
              >{/each}
          </select></label
        >
        <label
          >Zoom <input
            type="range"
            min="100"
            max="250"
            step="25"
            bind:value={viewState.zoom}
          /></label
        >
      </div>
      <p class="text-xs">
        Contours : vert = cochée ; orange = ambiguë ; bleu = vide. Les couleurs
        décrivent la lecture, pas la justesse.
      </p>
      {#if page?.statut !== 'ok'}<p class="my-2 text-amber-700">
          Page non utilisée dans la note ({page?.statut}). Identifier la page
          ci-dessous pour l’associer à une copie.
        </p>{/if}
      {#if page}<OmrPageAssignment
          {evaluation}
          bind:resultat
          {fichierScan}
          {page}
          onassigned={(id) => {
            viewState.selection = id
            viewState.seulementAVerifier = false
          }}
        />{/if}
      {#if page?.lectureManuelle}<p class="text-sm text-amber-700">
          Lecture manuelle : renseigner les réponses à partir du scan. Aucun
          contour automatique n’est affiché.
        </p>{/if}
      {#if chargement}<p role="status">Chargement du scan…</p>{/if}
      <div class="max-h-[75vh] overflow-auto border bg-white">
        {#if imageUrl}
          <div class="relative" style:width="{viewState.zoom}%">
            <img
              src={imageUrl}
              alt="Page {viewState.rang} du scan"
              class="block w-full"
            />
            <svg
              class="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 {dimensions.width} {dimensions.height}"
              aria-hidden="true"
            >
              {#each geometrie as g (g.id)}
                {@const status = lecturesRevisees(
                  resultat,
                  page?.copieId ?? '',
                ).find((l) => l.id === g.id)?.status}
                <polygon
                  points={g.points}
                  fill="none"
                  stroke={status === 'cochee'
                    ? '#15803d'
                    : status === 'ambigue'
                      ? '#d97706'
                      : '#2563eb'}
                  stroke-width="3"
                ></polygon>
              {/each}
            </svg>
          </div>
        {/if}
      </div>
    </div>
    <div class="flex max-h-[80vh] flex-col gap-3 overflow-auto">
      {#if copie}
        <h3 class="font-bold">
          {copie.eleve.nom} — {copie.points} / {copie.pointsMax}
          {resultat.revision?.validees.includes(copie.copieId)
            ? '(validée)'
            : '(provisoire)'}
        </h3>
        <button
          disabled={copie.aArbitrer > 0 || copie.pagesManquantes.length > 0}
          onclick={() => valider()}>Valider la relecture de cette copie</button
        >
        {#each copie.questions as q, index (q.qid)}
          <fieldset class="rounded border p-3">
            <legend class="font-semibold"
              >Exercice {(evaluation.questions.find((m) => m.qid === q.qid)
                ?.exercice ?? 0) + 1} · Question {(evaluation.questions.find(
                (m) => m.qid === q.qid,
              )?.question ?? index) + 1} — {q.points} / {q.pointsMax}</legend
            >
            <p>
              Lecture : {q.reponse || 'aucune'} · {q.statut}. Attendu : {reponseAttendue(
                evaluation,
                copie.copieId,
                q.qid,
              )}.
            </p>
            <button
              onclick={() => {
                viewState.rang =
                  resultat.pages.find(
                    (p) =>
                      p.copieId === copie.copieId &&
                      p.page === boxes.find((b) => b.qid === q.qid)?.page,
                  )?.rang ?? viewState.rang
              }}>Voir la page</button
            >
            <div class="my-2 flex flex-wrap gap-2">
              {#each boxes.filter((b) => b.qid === q.qid) as box, i (box.id)}
                {@const lecture = lectures.find((l) => l.id === box.id)}
                <label class="text-xs" title={box.id}
                  >Case {box.valeur ?? String.fromCharCode(65 + i)}
                  <select
                    disabled={!lecture}
                    value={resultat.revision?.cases[copie.copieId]?.[box.id] ??
                      ''}
                    onchange={(e) => changerCase(box.id, e.currentTarget.value)}
                  >
                    <option value=""
                      >Auto ({resultat.lectures?.[copie.copieId]?.find(
                        (l) => l.id === box.id,
                      )?.status ?? 'absente'})</option
                    >
                    <option value="cochee">Cochée</option><option value="vide"
                      >Vide</option
                    ><option value="ambigue">À vérifier</option>
                  </select>
                </label>
              {/each}
            </div>
            <label class="block"
              >Note manuelle (vide = barème automatique)
              <input
                class="w-24"
                type="number"
                min="0"
                max={q.pointsMax}
                step="any"
                value={resultat.revision?.questions[copie.copieId]?.[q.qid]
                  ?.points ?? ''}
                onchange={(e) =>
                  changerQuestion(q.qid, e.currentTarget.value, true)}
              />
            </label>
            <label class="block"
              >Feedback à l’élève
              <textarea
                class="w-full"
                rows="2"
                value={resultat.revision?.questions[copie.copieId]?.[q.qid]
                  ?.commentaire ?? ''}
                onchange={(e) =>
                  changerQuestion(q.qid, e.currentTarget.value, false)}
              ></textarea>
            </label>
          </fieldset>
        {/each}
      {/if}
    </div>
  </div>
</section>

<style>
  button {
    border: 1px solid #64748b;
    border-radius: 0.3rem;
    padding: 0.3rem 0.6rem;
  }
  button:disabled {
    opacity: 0.45;
  }
  select,
  input[type='number'],
  textarea {
    color: #172033;
    background: white;
    border: 1px solid #94a3b8;
    border-radius: 0.2rem;
    padding: 0.2rem;
  }
</style>
