<script lang="ts">
  import { normalize } from '../../../lib/mesFeuilles/library'
  import { parcoursUrl } from '../../../lib/mesFeuilles/parcoursLink'
  import type { ParcoursSettings } from '../../../lib/mesFeuilles/parcoursSettings'
  import {
    toPublish,
    type LibraryEntry,
  } from '../../../lib/parcours/parcoursLibrary'
  import { studentPreviewUrl } from '../../../lib/parcours/parcoursEditing'
  import { LEVELS, levelGroups } from '../../../lib/parcours/parcoursTypes'
  import SheetDialog from './SheetDialog.svelte'
  import {
    dangerButton,
    iconButton,
    primaryButton,
    quietText,
    secondaryButton,
  } from './styles'

  /**
   * Parcours de l'application, dans « Mes sauvegardes » : ceux de la vue
   * Parcours (`v=parcours`), regroupés par niveau. Ouvrir dans la vue Parcours
   * pour les modifier ou les donner à une classe, supprimer. Les créer,
   * les dupliquer et les publier pour les élèves se fait dans la vue Parcours.
   */
  interface Props {
    parcours: ParcoursSettings
    /** Recherche de la vue (titres, niveaux, chapitres, classes) */
    search: string
    /** Enregistre la bibliothèque sans le parcours supprimé */
    ondelete: (id: string) => void
    formatDate: (iso: string) => string
  }

  let { parcours, search, ondelete, formatDate }: Props = $props()

  const entries = $derived(parcours.library.entries)

  const shown = $derived.by(() => {
    const words = normalize(search)
      .split(' ')
      .filter((word) => word !== '')
    return entries.filter((entry) => {
      const p = entry.parcours
      const text = normalize(
        `${p.titre} ${p.niveau} ${p.theme} ${entry.classes.join(' ')}`,
      )
      return words.every((word) => text.includes(word))
    })
  })

  /** Par niveau (dans l'ordre des classes), puis ceux d'un niveau inconnu */
  const groups = $derived.by(() => {
    const rank = (level: string) =>
      LEVELS.indexOf(level) === -1 ? LEVELS.length : LEVELS.indexOf(level)
    const levels = [...new Set(shown.map((e) => e.parcours.niveau))].sort(
      (a, b) => rank(a) - rank(b),
    )
    return levels.map((level) => ({
      level,
      items: shown.filter((e) => e.parcours.niveau === level),
    }))
  })

  let deleting = $state<LibraryEntry | null>(null)

  function organisation(entry: LibraryEntry): string {
    const p = entry.parcours
    const count = levelGroups(p).length
    if (count > 1) {
      return `${count} ${p.style === 'ceintures' ? 'ceintures' : 'paliers'}`
    }
    const n = p.etapes.length
    return `${n} exercice${n > 1 ? 's' : ''}`
  }

  /** Les exercices du parcours, comme un élève les voit (interactifs, vue élève) */
  const previewUrl = (entry: LibraryEntry) =>
    studentPreviewUrl(window.location.href, entry.parcours.etapes)

  function confirmDelete() {
    const entry = deleting
    deleting = null
    if (entry !== null) ondelete(entry.parcours.id)
  }
</script>

<div class="flex flex-row flex-wrap items-center gap-3">
  <h2
    class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    <i class="bx bx-book-content" aria-hidden="true"></i> Mes parcours
  </h2>
  <span class={quietText}>
    {entries.length} parcours
  </span>
  <span class="grow"></span>
  <a
    href={parcoursUrl().href}
    class="{secondaryButton} py-1 text-sm"
    title="Créer un parcours, le donner à des classes, le publier pour l’application"
  >
    <i class="bx bx-folder-open" aria-hidden="true"></i> Ouvrir la vue Parcours
  </a>
</div>
<div
  class="flex max-w-3xl flex-col gap-2 rounded-xl px-5 py-4 text-sm bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
>
  <p>
    <strong>À quoi servent les parcours ?</strong> Un parcours est une suite d’exercices
    interactifs, rangés en liste, en paliers ou en ceintures, que vos élèves font
    dans l’application MathALÉA. Vous le créez pour un niveau, vous le donnez à une
    ou plusieurs classes, puis vous le publiez : le fichier déposé dans le dossier
    partagé des classes est lu par les élèves au prochain lancement de l’application.
  </p>
  <p>
    Cette page garde les parcours préparés dans ce navigateur, avec leurs
    classes et leurs objectifs, et les met dans le fichier .mathalea. « Modifier
    » ouvre la vue Parcours (création, classes, publication) ; « Essayer » ouvre
    ses exercices dans un nouvel onglet, comme un élève les voit.
  </p>
</div>

{#if entries.length === 0}
  <div
    class="flex flex-col items-start gap-2 max-w-2xl rounded-xl px-6 py-5 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <p class="font-semibold">Aucun parcours enregistré.</p>
    <p class={quietText}>
      Un parcours se crée dans la vue Parcours (« Plus d’exports » de la page
      d’accueil).
    </p>
  </div>
{:else if shown.length === 0}
  <p class={quietText}>Aucun parcours ne correspond à la recherche.</p>
{:else}
  <div class="flex flex-col gap-4">
    {#each groups as group (group.level)}
      <section class="flex flex-col gap-2">
        <h3
          class="text-sm font-bold uppercase tracking-wide text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          {group.level === '' ? 'Sans niveau' : group.level}
        </h3>
        {#each group.items as entry (entry.parcours.id)}
          <article
            class="flex flex-row flex-wrap items-start gap-3 rounded-lg border px-4 py-3 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
          >
            <i
              class="bx {entry.parcours.icone ??
                'bx-book-content'} mt-1 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
              aria-hidden="true"
            ></i>
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <h4 class="font-semibold" title={entry.parcours.titre}>
                {entry.parcours.titre.trim() || 'Sans titre'}
              </h4>
              <span class="text-sm">
                {[
                  entry.parcours.theme.trim(),
                  organisation(entry),
                  entry.classes.length > 0
                    ? entry.classes.join(', ')
                    : 'Aucune classe',
                ]
                  .filter((part) => part !== '')
                  .join(' · ')}
              </span>
              <span class={quietText}>
                {#if entry.updatedAt !== undefined}
                  Modifié le {formatDate(entry.updatedAt)} ·
                {/if}
                {toPublish(entry)
                  ? 'pas encore publié pour les élèves'
                  : 'publié pour les élèves'}
              </span>
            </div>
            {#if entry.parcours.etapes.length > 0}
              <a
                href={previewUrl(entry)}
                target="_blank"
                rel="noopener"
                class="{secondaryButton} px-3 py-1 text-sm"
                title="Essayer les exercices du parcours comme un élève, dans un nouvel onglet"
              >
                <i class="bx bx-show" aria-hidden="true"></i> Essayer
              </a>
            {/if}
            <a
              href={parcoursUrl(entry.parcours.id).href}
              class="{primaryButton} px-3 py-1 text-sm"
              title="Rouvrir dans la vue Parcours pour le modifier"
            >
              <i class="bx bx-edit" aria-hidden="true"></i> Modifier
            </a>
            <button
              type="button"
              class={iconButton}
              title="Supprimer"
              aria-label="Supprimer {entry.parcours.titre}"
              onclick={() => (deleting = entry)}
            >
              <i class="bx bx-trash text-lg"></i>
            </button>
          </article>
        {/each}
      </section>
    {/each}
  </div>
{/if}

<SheetDialog
  open={deleting !== null}
  title="Supprimer ce parcours ?"
  onclose={() => (deleting = null)}
>
  <div class="flex flex-col gap-4">
    <p>
      Le parcours « {deleting?.parcours.titre.trim() || 'Sans titre'} » sera supprimé
      de ce navigateur. Cette action est définitive, sauf si vous avez exporté vos
      sauvegardes. Les élèves gardent la dernière version publiée tant que vous ne
      republiez pas.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (deleting = null)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmDelete}>
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer
      </button>
    </div>
  </div>
</SheetDialog>
