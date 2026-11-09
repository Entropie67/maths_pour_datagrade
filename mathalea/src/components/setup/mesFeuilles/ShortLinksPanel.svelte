<script lang="ts">
  import QRCode from 'qrcode'
  import { untrack } from 'svelte'
  import {
    deleteShortLink,
    detectOwnerId,
    extendOneYear,
    edurlErrorMessage,
    fetchVisits,
    isExpired,
    isMathaleaUrl,
    isTokenInvalid,
    listMathaleaLinks,
    renameShortLink,
    shortCodeOf,
    updateShortLink,
    type ShortLink,
    type ShortLinkChanges,
  } from '../../../lib/edurl/api'
  import {
    clearEdurlToken,
    loadEdurlOwnerId,
    saveEdurlOwnerId,
    setEdurlToken,
  } from '../../../lib/edurl/token'
  import { copyTextToClipboard } from '../../../lib/components/clipboard'
  import {
    normalize,
    type SavedSelection,
  } from '../../../lib/mesFeuilles/library'
  import EdurlTokenForm from '../../shared/edurl/EdurlTokenForm.svelte'
  import SheetDialog from './SheetDialog.svelte'
  import {
    dangerButton,
    iconButton,
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from './styles'

  /**
   * Liens raccourcis, dans « Mes sauvegardes » : les liens edurl.fr de
   * l'enseignant qui mènent à coopmaths.fr ou mathalea.fr (créés depuis le
   * lien pour les élèves, un quizz, un diaporama, une fiche…). Ouvrir, copier,
   * QR code, renommer, supprimer. La liste est lue sur edurl.fr avec le jeton
   * d'accès ; elle n'est pas gardée dans ce navigateur ni dans le fichier
   * `.mathalea`.
   */
  interface Props {
    /** Jeton edurl.fr, `null` si l'enseignant n'en a pas enregistré */
    token: string | null
    /** Sélections : celles qui ont ce lien court sont indiquées sur sa ligne */
    selections?: SavedSelection[]
    /** Recherche de la vue (titre, lien court, adresse d'origine) */
    search: string
    /** Le jeton a été enregistré, oublié ou refusé */
    ontokenchange: () => void
    onnotice: (text: string, isError: boolean) => void
    formatDate: (iso: string) => string
  }

  let {
    token,
    selections = [],
    search,
    ontokenchange,
    onnotice,
    formatDate,
  }: Props = $props()

  let links = $state<ShortLink[]>([])
  let isLoading = $state(false)
  let loadError = $state('')
  let tokenError = $state('')
  let hasLoaded = $state(false)
  /** Première lecture : on cherche lesquels de ces liens sont les nôtres */
  let isSearchingOwner = $state(false)

  let renamingCode = $state('')
  let renameValue = $state('')
  let deleting = $state<ShortLink | null>(null)
  let isBusy = $state(false)
  let qrLink = $state<ShortLink | null>(null)
  let qrSource = $state('')
  let copiedCode = $state('')

  // sélection multiple
  let checked = $state(new Set<string>())
  /** Suppression groupée : 0 fermée, 1 première question, 2 dernier avertissement */
  let bulkDeleteStep = $state<0 | 1 | 2>(0)
  let isExtendOpen = $state(false)
  let extendExpire = $state(true)
  let extendDelete = $state(true)
  let progress = $state<{ done: number; total: number; label: string } | null>(
    null,
  )

  // fenêtre « Modifier »
  let editing = $state<ShortLink | null>(null)
  let editTitle = $state('')
  let editLongUrl = $state('')
  let editExpireAt = $state('')
  let editDeleteAt = $state('')
  let editError = $state('')

  const shown = $derived.by(() => {
    const words = normalize(search)
      .split(' ')
      .filter((word) => word !== '')
    return links.filter((link) => {
      const text = normalize(
        `${link.title} ${link.shortUrl} ${link.longUrl} ${(selectionsOf.get(link.shortCode) ?? []).join(' ')}`,
      )
      return words.every((word) => text.includes(word))
    })
  })

  const key = (link: ShortLink) => link.shortCode

  /** Noms des sélections qui ont ce lien court, par code */
  const selectionsOf = $derived.by(() => {
    const byCode = new Map<string, string[]>()
    for (const selection of selections) {
      if (selection.shortLink === undefined) continue
      const code = shortCodeOf(selection.shortLink.url)
      byCode.set(code, [...(byCode.get(code) ?? []), selection.name])
    }
    return byCode
  })

  /** Liens cochés et visibles (une recherche masque les autres : ils restent hors de l'action) */
  const checkedLinks = $derived(shown.filter((link) => checked.has(key(link))))
  const allChecked = $derived(
    shown.length > 0 && checkedLinks.length === shown.length,
  )
  /** Liens cochés qui ont une date à repousser, selon les dates choisies */
  const extendable = $derived(
    checkedLinks.filter(
      (link) =>
        (extendExpire && link.expireAt !== null) ||
        (extendDelete && link.deleteAt !== null),
    ),
  )

  /** Une erreur d'edurl.fr : un jeton refusé est oublié, il faut en saisir un autre */
  function handleError(error: unknown): string {
    if (isTokenInvalid(error)) {
      clearEdurlToken()
      tokenError = edurlErrorMessage(error)
      ontokenchange()
    }
    return edurlErrorMessage(error)
  }

  async function load() {
    if (token === null) return
    isLoading = true
    loadError = ''
    try {
      // l'API liste les liens de tous les utilisateurs : on ne garde que les nôtres
      const all = await listMathaleaLinks(token)
      let ownerId = loadEdurlOwnerId(token)
      if (ownerId === null) {
        isSearchingOwner = true
        ownerId = await detectOwnerId(all, token)
        if (ownerId !== null) saveEdurlOwnerId(token, ownerId)
      }
      links = ownerId === null ? [] : all.filter((l) => l.ownerId === ownerId)
      hasLoaded = true
      void loadVisits(token)
    } catch (error) {
      loadError = handleError(error)
    } finally {
      isLoading = false
      isSearchingOwner = false
    }
  }

  let visitsRun = 0

  /** Lit les visites de chaque lien en arrière-plan, quelques requêtes à la fois */
  async function loadVisits(current: string) {
    const run = ++visitsRun
    const queue = [...links]
    async function worker() {
      for (let link = queue.shift(); link !== undefined; link = queue.shift()) {
        try {
          const visits = await fetchVisits(link, current)
          if (run !== visitsRun) return
          const code = key(link)
          links = links.map((item) =>
            key(item) === code ? { ...item, visits } : item,
          )
        } catch {
          // les visites ne sont qu'un détail : un échec n'interrompt rien
        }
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()])
  }

  // charge la liste à l'ouverture, puis à chaque changement de jeton
  let loadedWith: string | null | undefined
  $effect(() => {
    const current = token
    if (current === loadedWith) return
    loadedWith = current
    untrack(() => {
      links = []
      hasLoaded = false
      if (current !== null) void load()
    })
  })

  function saveToken(value: string) {
    if (!setEdurlToken(value)) return
    tokenError = ''
    ontokenchange()
  }

  function open(link: ShortLink) {
    window.open(link.shortUrl, '_blank', 'noopener,noreferrer')
  }

  async function copy(link: ShortLink) {
    if (await copyTextToClipboard(link.shortUrl)) {
      copiedCode = key(link)
      setTimeout(() => {
        if (copiedCode === key(link)) copiedCode = ''
      }, 2000)
    } else {
      onnotice('Impossible de copier le lien dans le presse-papier.', true)
    }
  }

  async function showQr(link: ShortLink) {
    qrLink = link
    qrSource = ''
    try {
      qrSource = await QRCode.toDataURL(link.shortUrl, {
        margin: 1,
        width: 360,
      })
    } catch (error) {
      console.error('QR code impossible à générer', error)
    }
  }

  function startRename(link: ShortLink) {
    renamingCode = key(link)
    renameValue = link.title
  }

  async function commitRename(link: ShortLink) {
    if (renamingCode !== key(link) || token === null) return
    const value = renameValue.trim()
    renamingCode = ''
    if (value === '' || value === link.title) return
    isBusy = true
    try {
      await renameShortLink(link, value, token)
      links = links.map((item) =>
        key(item) === key(link) ? { ...item, title: value } : item,
      )
    } catch (error) {
      onnotice(handleError(error), true)
    } finally {
      isBusy = false
    }
  }

  function toggle(link: ShortLink) {
    const next = new Set(checked)
    if (!next.delete(key(link))) next.add(key(link))
    checked = next
  }

  function toggleAll() {
    checked = allChecked ? new Set() : new Set(shown.map(key))
  }

  /**
   * Applique `action` à chaque lien, trois requêtes à la fois, en suivant la
   * progression. S'arrête si le jeton est refusé.
   * @returns les liens traités et le message d'erreur du premier échec
   */
  async function runBatch(
    targets: ShortLink[],
    label: string,
    action: (link: ShortLink, token: string) => Promise<void>,
  ): Promise<{ done: ShortLink[]; failed: number; firstError: string }> {
    const current = token
    const result = { done: [] as ShortLink[], failed: 0, firstError: '' }
    if (current === null) return result
    const queue = [...targets]
    let stopped = false
    progress = { done: 0, total: targets.length, label }
    isBusy = true
    async function worker() {
      for (let link = queue.shift(); link !== undefined; link = queue.shift()) {
        if (stopped) return
        try {
          await action(link, current as string)
          result.done.push(link)
        } catch (error) {
          result.failed++
          if (result.firstError === '') result.firstError = handleError(error)
          if (isTokenInvalid(error)) stopped = true
        }
        progress = {
          done: result.done.length + result.failed,
          total: targets.length,
          label,
        }
      }
    }
    await Promise.all([worker(), worker(), worker()])
    progress = null
    isBusy = false
    return result
  }

  function summary(done: number, failed: number, firstError: string): string {
    return failed === 0
      ? ''
      : ` ${failed} échec${failed > 1 ? 's' : ''} : ${firstError}`
  }

  async function confirmBulkDelete() {
    bulkDeleteStep = 0
    const targets = [...checkedLinks]
    const { done, failed, firstError } = await runBatch(
      targets,
      'Suppression',
      (link, current) => deleteShortLink(link, current),
    )
    const removed = new Set(done.map(key))
    links = links.filter((link) => !removed.has(key(link)))
    checked = new Set([...checked].filter((code) => !removed.has(code)))
    onnotice(
      `${done.length} lien${done.length > 1 ? 's' : ''} supprimé${done.length > 1 ? 's' : ''}.${summary(done.length, failed, firstError)}`,
      failed > 0,
    )
  }

  async function confirmExtend() {
    isExtendOpen = false
    const targets = [...extendable]
    const now = new Date()
    const changes = new Map<string, ShortLinkChanges>()
    for (const link of targets) {
      const change: ShortLinkChanges = {}
      if (extendExpire && link.expireAt !== null) {
        const date = extendOneYear(link.expireAt, now)
        if (date !== null) change.expireAt = date
      }
      if (extendDelete && link.deleteAt !== null) {
        const date = extendOneYear(link.deleteAt, now)
        if (date !== null) change.deleteAt = date
      }
      if (Object.keys(change).length > 0) changes.set(key(link), change)
    }
    const { done, failed, firstError } = await runBatch(
      targets.filter((link) => changes.has(key(link))),
      'Prolongation',
      (link, current) =>
        updateShortLink(link, changes.get(key(link))!, current),
    )
    const updated = new Set(done.map(key))
    links = links.map((link) => {
      const change = changes.get(key(link))
      if (!updated.has(key(link)) || change === undefined) return link
      return {
        ...link,
        expireAt: change.expireAt ?? link.expireAt,
        deleteAt: change.deleteAt ?? link.deleteAt,
        enabled: change.expireAt === undefined ? link.enabled : true,
      }
    })
    onnotice(
      `${done.length} lien${done.length > 1 ? 's' : ''} prolongé${done.length > 1 ? 's' : ''} d’un an.${summary(done.length, failed, firstError)}`,
      failed > 0,
    )
  }

  function startEdit(link: ShortLink) {
    editing = link
    editTitle = link.title
    editLongUrl = link.longUrl
    editExpireAt = link.expireAt?.slice(0, 10) ?? ''
    editDeleteAt = link.deleteAt?.slice(0, 10) ?? ''
    editError = ''
  }

  async function saveEdit() {
    const link = editing
    if (link === null || token === null) return
    const longUrl = editLongUrl.trim()
    let isUrl = true
    try {
      isUrl = /^https?:$/.test(new URL(longUrl).protocol)
    } catch {
      isUrl = false
    }
    if (!isUrl) {
      editError = 'L’URL de destination doit commencer par http:// ou https://.'
      return
    }
    // seuls les réglages modifiés sont envoyés
    const changes: ShortLinkChanges = {}
    const title = editTitle.trim()
    if (title !== link.title) changes.title = title === '' ? null : title
    if (longUrl !== link.longUrl) changes.longUrl = longUrl
    if (editExpireAt !== (link.expireAt?.slice(0, 10) ?? '')) {
      changes.expireAt = editExpireAt === '' ? null : editExpireAt
    }
    if (editDeleteAt !== (link.deleteAt?.slice(0, 10) ?? '')) {
      changes.deleteAt = editDeleteAt === '' ? null : editDeleteAt
    }
    if (Object.keys(changes).length === 0) {
      editing = null
      return
    }
    isBusy = true
    try {
      await updateShortLink(link, changes, token)
      const updated: ShortLink = {
        ...link,
        title: changes.title === undefined ? link.title : (changes.title ?? ''),
        longUrl: changes.longUrl ?? link.longUrl,
        expireAt:
          changes.expireAt === undefined ? link.expireAt : changes.expireAt,
        deleteAt:
          changes.deleteAt === undefined ? link.deleteAt : changes.deleteAt,
        enabled: changes.expireAt === undefined ? link.enabled : true,
      }
      editing = null
      if (isMathaleaUrl(updated.longUrl)) {
        links = links.map((item) => (key(item) === key(link) ? updated : item))
        onnotice('Le lien est modifié.', false)
      } else {
        // il ne mène plus à MathALÉA : cette liste ne le montre plus
        links = links.filter((item) => key(item) !== key(link))
        onnotice(
          'Le lien est modifié. Il ne mène plus à coopmaths.fr ni à mathalea.fr : il n’apparaît plus ici.',
          false,
        )
      }
    } catch (error) {
      editError = handleError(error)
    } finally {
      isBusy = false
    }
  }

  async function confirmDelete() {
    const link = deleting
    deleting = null
    if (link === null || token === null) return
    isBusy = true
    try {
      await deleteShortLink(link, token)
      links = links.filter((item) => key(item) !== key(link))
      onnotice(`Le lien ${link.shortUrl} est supprimé.`, false)
    } catch (error) {
      onnotice(handleError(error), true)
    } finally {
      isBusy = false
    }
  }

  /** Date seule (`jj/mm/aaaa`), sans l'heure : les dates de fin n'en ont pas */
  function day(iso: string): string {
    const date = new Date(iso)
    return Number.isNaN(date.getTime())
      ? iso
      : date.toLocaleDateString('fr-FR', { timeZone: 'UTC' })
  }

  function shortLabel(url: string): string {
    return url.replace(/^https?:\/\//, '')
  }
</script>

<div class="flex flex-row flex-wrap items-center gap-3">
  <h2
    class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    <i class="bx bx-link-alt" aria-hidden="true"></i> Liens raccourcis
  </h2>
  {#if token !== null && hasLoaded}
    <span class={quietText}>
      {links.length} lien{links.length > 1 ? 's' : ''}
    </span>
  {/if}
  <span class="grow"></span>
  {#if token !== null}
    <button
      type="button"
      class="{secondaryButton} py-1 text-sm"
      disabled={isLoading}
      onclick={load}
    >
      <i class="bx bx-refresh {isLoading ? 'bx-spin' : ''}" aria-hidden="true"
      ></i> Actualiser
    </button>
  {/if}
</div>
<p class={quietText}>
  Vos liens courts <strong>edurl.fr</strong> qui mènent à coopmaths.fr ou mathalea.fr.
  Supprimer un lien le fait cesser de fonctionner : les documents ou QR codes qui
  l’utilisent ne s’ouvriront plus.
</p>

{#if token === null}
  <div
    class="flex flex-col gap-3 max-w-2xl rounded-xl px-6 py-5 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <p class="font-semibold">
      Saisissez votre jeton edurl.fr pour voir vos liens.
    </p>
    <EdurlTokenForm
      error={tokenError}
      label="Enregistrer le jeton"
      onsave={saveToken}
    />
  </div>
{:else if loadError !== ''}
  <div
    class="flex flex-col items-start gap-2 max-w-2xl rounded-xl px-6 py-5 bg-coopmaths-warn-lightest dark:bg-coopmathsdark-warn-lightest text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest"
  >
    <p class="font-semibold">Les liens n’ont pas pu être lus sur edurl.fr.</p>
    <p>{loadError}</p>
  </div>
{:else if isLoading && !hasLoaded}
  <div class="flex flex-col items-center gap-2 py-12">
    <i class="bx bx-loader-alt bx-spin text-4xl" aria-hidden="true"></i>
    {#if isSearchingOwner}
      <p class={quietText}>
        Recherche de vos liens parmi ceux des autres utilisateurs (première
        ouverture seulement)…
      </p>
    {/if}
  </div>
{:else if links.length === 0}
  <div
    class="flex flex-col items-start gap-2 max-w-2xl rounded-xl px-6 py-5 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <p class="font-semibold">Aucun lien raccourci vers MathALÉA.</p>
    <p class={quietText}>
      Un lien est créé quand vous choisissez « Raccourci (edurl.fr) » dans le
      lien pour les élèves, ou avec le bouton « Lien raccourci » d’un quizz,
      d’un diaporama ou d’une sélection.
    </p>
  </div>
{:else if shown.length === 0}
  <p class={quietText}>Aucun lien ne correspond à la recherche.</p>
{:else}
  <div class="flex flex-row flex-wrap items-center gap-3 min-h-9">
    <label class="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        class="rounded"
        checked={allChecked}
        disabled={isBusy}
        onchange={toggleAll}
      />
      {allChecked ? 'Tout décocher' : 'Tout cocher'}
    </label>
    {#if checkedLinks.length > 0}
      <span class="font-semibold">
        {checkedLinks.length} lien{checkedLinks.length > 1 ? 's' : ''} coché{checkedLinks.length >
        1
          ? 's'
          : ''}
      </span>
      <button
        type="button"
        class="{secondaryButton} py-1 text-sm"
        disabled={isBusy}
        title="Repousser d’un an la fin de validité et la suppression prévue"
        onclick={() => (isExtendOpen = true)}
      >
        <i class="bx bx-calendar-plus" aria-hidden="true"></i> Prolonger d’un an
      </button>
      <button
        type="button"
        class="{secondaryButton} py-1 text-sm"
        disabled={isBusy}
        onclick={() => (bulkDeleteStep = 1)}
      >
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer
      </button>
    {/if}
    {#if progress !== null}
      <span class={quietText} role="status">
        <i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i>
        {progress.label} : {progress.done} / {progress.total}
      </span>
    {/if}
  </div>
  <div class="flex flex-col gap-2">
    {#each shown as link (key(link))}
      <article
        class="flex flex-row flex-wrap items-start gap-3 rounded-lg border px-4 py-3 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest {checked.has(
          key(link),
        )
          ? 'bg-coopmaths-action/10 dark:bg-coopmathsdark-action/20'
          : ''}"
      >
        <input
          type="checkbox"
          class="mt-2 rounded"
          aria-label="Cocher {link.title === '' ? link.shortUrl : link.title}"
          checked={checked.has(key(link))}
          disabled={isBusy}
          onchange={() => toggle(link)}
        />
        <i
          class="bx bx-link-alt mt-1 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
          aria-hidden="true"
        ></i>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          {#if renamingCode === key(link)}
            <!-- svelte-ignore a11y_autofocus -->
            <input
              type="text"
              class="{textInput} py-1"
              aria-label="Nouveau titre"
              maxlength="200"
              autofocus
              bind:value={renameValue}
              onkeydown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void commitRename(link)
                } else if (event.key === 'Escape') {
                  event.preventDefault()
                  renamingCode = ''
                }
              }}
              onblur={() => commitRename(link)}
            />
          {:else}
            <h3 class="font-semibold break-words" title={link.title}>
              {link.title === '' ? link.shortUrl : link.title}
              {#if isExpired(link)}
                <span
                  class="ml-2 rounded px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                  >Expiré</span
                >
              {/if}
            </h3>
          {/if}
          <a
            class="text-sm underline text-coopmaths-action dark:text-coopmathsdark-action break-all"
            href={link.shortUrl}
            target="_blank"
            rel="noopener noreferrer">{shortLabel(link.shortUrl)}</a
          >
          <span class="{quietText} truncate" title={link.longUrl}>
            {link.longUrl}
          </span>
          {#if selectionsOf.has(link.shortCode)}
            <span class="text-sm">
              <i class="bx bx-bookmarks" aria-hidden="true"></i>
              Sélection{(selectionsOf.get(link.shortCode) ?? []).length > 1
                ? 's'
                : ''} : {(selectionsOf.get(link.shortCode) ?? []).join(', ')}
            </span>
          {/if}
          <span class={quietText}>
            {#if link.dateCreated !== ''}Créé le {formatDate(
                link.dateCreated,
              )}{/if}
            {#if link.visits !== null}
              · {link.visits} visite{link.visits > 1 ? 's' : ''}{/if}
          </span>
          {#if link.expireAt !== null || link.deleteAt !== null}
            <span class={quietText}>
              {[
                link.expireAt === null
                  ? ''
                  : `Fin de validité le ${day(link.expireAt)}`,
                link.deleteAt === null
                  ? ''
                  : `suppression prévue le ${day(link.deleteAt)}`,
              ]
                .filter((part) => part !== '')
                .join(' · ')}
            </span>
          {/if}
        </div>
        <button
          type="button"
          class="{primaryButton} px-3 py-1 text-sm"
          title="Ouvrir le lien court dans un nouvel onglet"
          onclick={() => open(link)}
        >
          <i class="bx bx-link-external" aria-hidden="true"></i> Ouvrir
        </button>
        <span class="flex flex-row">
          <button
            type="button"
            class={iconButton}
            title={copiedCode === key(link) ? 'Lien copié' : 'Copier le lien'}
            aria-label="Copier le lien {link.shortUrl}"
            onclick={() => copy(link)}
          >
            <i
              class="bx {copiedCode === key(link)
                ? 'bx-check'
                : 'bx-copy'} text-lg"
            ></i>
          </button>
          <button
            type="button"
            class={iconButton}
            title="QR code"
            aria-label="QR code de {link.shortUrl}"
            onclick={() => showQr(link)}
          >
            <i class="bx bx-qr text-lg"></i>
          </button>
          <button
            type="button"
            class={iconButton}
            title="Modifier la destination et les dates"
            aria-label="Modifier {link.shortUrl}"
            disabled={isBusy}
            onclick={() => startEdit(link)}
          >
            <i class="bx bx-edit text-lg"></i>
          </button>
          <button
            type="button"
            class={iconButton}
            title="Renommer"
            aria-label="Renommer {link.shortUrl}"
            disabled={isBusy}
            onclick={() => startRename(link)}
          >
            <i class="bx bx-rename text-lg"></i>
          </button>
          <button
            type="button"
            class={iconButton}
            title="Supprimer"
            aria-label="Supprimer {link.shortUrl}"
            disabled={isBusy}
            onclick={() => (deleting = link)}
          >
            <i class="bx bx-trash text-lg"></i>
          </button>
        </span>
      </article>
    {/each}
  </div>
{/if}

<SheetDialog
  open={editing !== null}
  title="Modifier le lien"
  width="max-w-xl"
  onclose={() => (editing = null)}
>
  <form
    class="flex flex-col gap-4"
    onsubmit={(event) => {
      event.preventDefault()
      void saveEdit()
    }}
  >
    <div class="flex flex-col gap-1">
      <span class="font-semibold">Lien court</span>
      <span class="font-mono text-sm break-all">{editing?.shortUrl ?? ''}</span>
      <span class={quietText}>
        Le lien court ne peut pas être modifié : c’est son identifiant. Pour en
        avoir un autre, créez un nouveau lien.
      </span>
    </div>
    <label class="flex flex-col gap-1">
      <span class="font-semibold">Titre</span>
      <input
        type="text"
        class={textInput}
        maxlength="200"
        bind:value={editTitle}
      />
    </label>
    <label class="flex flex-col gap-1">
      <span class="font-semibold">URL de destination</span>
      <input
        type="url"
        class="{textInput} font-mono text-sm"
        required
        bind:value={editLongUrl}
      />
    </label>
    <div class="flex flex-row flex-wrap gap-4">
      <label class="flex flex-col gap-1">
        <span class="font-semibold">Fin de validité</span>
        <input type="date" class={textInput} bind:value={editExpireAt} />
        <span class={quietText}>Ensuite, le lien court ne redirige plus.</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="font-semibold">Suppression prévue</span>
        <input type="date" class={textInput} bind:value={editDeleteAt} />
        <span class={quietText}>Le lien est alors effacé d’edurl.fr.</span>
      </label>
    </div>
    {#if editError !== ''}
      <p class="text-red-600 dark:text-red-400">{editError}</p>
    {/if}
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (editing = null)}>Annuler</button
      >
      <button type="submit" class={primaryButton} disabled={isBusy}>
        <i class="bx bx-check" aria-hidden="true"></i> Enregistrer
      </button>
    </div>
  </form>
</SheetDialog>

<SheetDialog
  open={bulkDeleteStep === 1}
  title="Supprimer {checkedLinks.length} lien{checkedLinks.length > 1
    ? 's'
    : ''} ?"
  onclose={() => (bulkDeleteStep = 0)}
>
  <div class="flex flex-col gap-4">
    <p>
      Vous allez supprimer <strong
        >{checkedLinks.length} lien{checkedLinks.length > 1 ? 's' : ''} court{checkedLinks.length >
        1
          ? 's'
          : ''}</strong
      > d’edurl.fr. Les documents, QR codes ou pages qui les utilisent ne fonctionneront
      plus.
    </p>
    <ul class="list-disc pl-6 text-sm max-h-40 overflow-y-auto">
      {#each checkedLinks.slice(0, 8) as link (key(link))}
        <li class="break-all">
          {link.title === '' ? link.shortUrl : link.title}
          <span class={quietText}>({shortLabel(link.shortUrl)})</span>
        </li>
      {/each}
      {#if checkedLinks.length > 8}
        <li>… et {checkedLinks.length - 8} autres</li>
      {/if}
    </ul>
    <p class="font-semibold">Êtes-vous sûr de vouloir les supprimer ?</p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (bulkDeleteStep = 0)}>Annuler</button
      >
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (bulkDeleteStep = 2)}
      >
        Oui, continuer
      </button>
    </div>
  </div>
</SheetDialog>

<SheetDialog
  open={bulkDeleteStep === 2}
  title="Dernier avertissement"
  onclose={() => (bulkDeleteStep = 0)}
>
  <div class="flex flex-col gap-4">
    <div
      class="flex flex-col gap-2 rounded-lg border-2 border-red-600 bg-red-50 px-4 py-3 text-red-800 dark:border-red-400 dark:bg-red-950/40 dark:text-red-200"
      role="alert"
    >
      <p class="font-bold">
        <i class="bx bx-error-circle" aria-hidden="true"></i> Cette action est irréversible.
      </p>
      <p>
        {checkedLinks.length} lien{checkedLinks.length > 1 ? 's' : ''} court{checkedLinks.length >
        1
          ? 's seront supprimés définitivement'
          : ' sera supprimé définitivement'} d’edurl.fr. Il{checkedLinks.length >
        1
          ? 's ne pourront'
          : ' ne pourra'} pas être récupéré{checkedLinks.length > 1 ? 's' : ''}
        et {checkedLinks.length > 1 ? 'leurs adresses' : 'son adresse'} cesse{checkedLinks.length >
        1
          ? 'ront'
          : 'ra'} de fonctionner partout où elle est utilisée.
      </p>
    </div>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (bulkDeleteStep = 0)}>Non, annuler</button
      >
      <button type="button" class={dangerButton} onclick={confirmBulkDelete}>
        <i class="bx bx-trash" aria-hidden="true"></i> Supprimer définitivement
      </button>
    </div>
  </div>
</SheetDialog>

<SheetDialog
  open={isExtendOpen}
  title="Prolonger d’un an"
  onclose={() => (isExtendOpen = false)}
>
  <div class="flex flex-col gap-4">
    <p>
      Repousser d’un an, pour les {checkedLinks.length} lien{checkedLinks.length >
      1
        ? 's'
        : ''} coché{checkedLinks.length > 1 ? 's' : ''}&nbsp;:
    </p>
    <label class="flex items-center gap-2">
      <input type="checkbox" class="rounded" bind:checked={extendExpire} />
      la <strong>fin de validité</strong> (le lien court ne redirige plus après)
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" class="rounded" bind:checked={extendDelete} />
      la <strong>suppression prévue</strong> (le lien est alors effacé)
    </label>
    <p class={quietText}>
      Seuls les liens qui ont cette date sont modifiés. Une date déjà passée est
      repoussée d’un an à partir d’aujourd’hui, ce qui réactive le lien.
    </p>
    <p class="font-semibold">
      {extendable.length} lien{extendable.length > 1 ? 's' : ''} concerné{extendable.length >
      1
        ? 's'
        : ''} sur {checkedLinks.length}.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isExtendOpen = false)}>Annuler</button
      >
      <button
        type="button"
        class={primaryButton}
        disabled={extendable.length === 0}
        onclick={confirmExtend}
      >
        <i class="bx bx-calendar-plus" aria-hidden="true"></i> Prolonger
      </button>
    </div>
  </div>
</SheetDialog>

<SheetDialog
  open={deleting !== null}
  title="Supprimer ce lien raccourci ?"
  onclose={() => (deleting = null)}
>
  <div class="flex flex-col gap-4">
    <p>
      Le lien <strong>{deleting?.shortUrl ?? ''}</strong> sera supprimé d’edurl.fr.
      Les documents, QR codes ou pages qui l’utilisent ne fonctionneront plus.
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

<SheetDialog
  open={qrLink !== null}
  title="QR code"
  width="max-w-sm"
  onclose={() => (qrLink = null)}
>
  <div class="flex flex-col items-center gap-3">
    {#if qrSource !== ''}
      <img
        src={qrSource}
        alt="QR code de {qrLink?.shortUrl ?? ''}"
        class="w-60 h-60"
      />
      <a class={secondaryButton} href={qrSource} download="qrcode_edurl.png">
        <i class="bx bx-download" aria-hidden="true"></i> Télécharger
      </a>
    {/if}
    <span class={quietText}>{qrLink?.shortUrl ?? ''}</span>
  </div>
</SheetDialog>
