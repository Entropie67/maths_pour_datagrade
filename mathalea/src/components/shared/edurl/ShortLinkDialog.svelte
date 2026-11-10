<script lang="ts">
  import QRCode from 'qrcode'
  import { untrack } from 'svelte'
  import {
    createShortUrl,
    edurlErrorMessage,
    edurlLinkTitle,
    isTokenInvalid,
    knownShortUrl,
    shortCodeOf,
    slugError,
    updateShortLink,
  } from '../../../lib/edurl/api'
  import {
    clearEdurlToken,
    getEdurlToken,
    setEdurlToken,
  } from '../../../lib/edurl/token'
  import { copyTextToClipboard } from '../../../lib/components/clipboard'
  import BasicInfoModal from '../modal/BasicInfoModal.svelte'
  import SheetDialog from '../../setup/mesFeuilles/SheetDialog.svelte'
  import {
    iconButton,
    primaryButton,
    quietText,
    secondaryButton,
    textInput,
  } from '../../setup/mesFeuilles/styles'
  import EdurlTokenForm from './EdurlTokenForm.svelte'

  /**
   * Fenêtre « Lien raccourci (edurl.fr) » : crée le lien court (avec le code
   * choisi, ou généré par edurl.fr), le propose à la copie et en QR code. Le
   * jeton edurl.fr est demandé une seule fois (voir `lib/edurl/token.ts`) ; les
   * liens créés se gèrent dans « Mes sauvegardes › Liens raccourcis ».
   *
   * Une fois le lien créé, il est copié dans le presse-papier et la fenêtre se
   * ferme (un message le confirme) ; rouvrir la fenêtre montre ce lien, avec son
   * QR code. Si la copie échoue, la fenêtre reste ouverte sur le lien.
   *
   * Avec `existing` (lien déjà créé pour une sélection), elle montre ce lien,
   * et propose de le mettre à jour s'il ne mène plus à `getUrl()`.
   */
  interface Props {
    open: boolean
    /** URL à raccourcir, lue à l'ouverture de la fenêtre */
    getUrl: () => string
    /** Nom du lien dans edurl.fr (titre du document, du quizz…) */
    title?: string
    /** Lien court déjà créé pour ce contenu */
    existing?: { shortUrl: string; longUrl: string }
    /** Ouvre avec le QR code affiché */
    showQr?: boolean
    /**
     * Ouvre sur le formulaire même si un lien court existe déjà pour cette URL
     * (créé automatiquement) : on veut en choisir un autre
     */
    fresh?: boolean
    /** Un lien court vient d'être créé ou mis à jour */
    oncreated?: (shortUrl: string, longUrl: string) => void
    onclose: () => void
  }

  let {
    open,
    getUrl,
    title = '',
    existing,
    showQr = false,
    fresh = false,
    oncreated,
    onclose,
  }: Props = $props()

  type Phase = 'token' | 'form' | 'busy' | 'done'

  let phase = $state<Phase>('busy')
  let shortUrl = $state('')
  let qrSource = $state('')
  let error = $state('')
  let slug = $state('')
  let isCopied = $state(false)
  let isQrShown = $state(false)
  /** Message de copie, affiché après la fermeture de la fenêtre */
  let copyState = $state<'success' | 'error' | 'none'>('none')
  /** Le lien court mène à une ancienne version de ce qu'on partage */
  let isStale = $state(false)
  let longUrl = ''
  let dialogBody: HTMLDivElement | undefined = $state()

  const slugMessage = $derived(slugError(slug))

  async function show(url: string) {
    shortUrl = url
    try {
      qrSource = await QRCode.toDataURL(url, { margin: 1, width: 360 })
    } catch (err) {
      console.error('QR code impossible à générer', err)
    }
    phase = 'done'
  }

  function start() {
    longUrl = getUrl()
    qrSource = ''
    error = ''
    slug = ''
    isCopied = false
    isQrShown = showQr
    isStale = false
    const known =
      existing?.shortUrl ?? (fresh ? undefined : knownShortUrl(longUrl))
    if (known !== undefined) {
      isStale = existing !== undefined && existing.longUrl !== longUrl
      void show(known)
    } else {
      phase = getEdurlToken() === null ? 'token' : 'form'
    }
  }

  // à chaque ouverture, on repart de l'URL courante
  $effect(() => {
    if (!open) return
    untrack(start)
  })

  /** Une erreur d'edurl.fr : un jeton refusé est oublié et redemandé */
  function fail(err: unknown, back: Phase) {
    if (isTokenInvalid(err)) clearEdurlToken()
    error = edurlErrorMessage(err)
    phase = isTokenInvalid(err) ? 'token' : back
  }

  async function create() {
    const token = getEdurlToken()
    if (token === null) {
      phase = 'token'
      return
    }
    if (slugMessage !== null) return
    phase = 'busy'
    error = ''
    try {
      const url = await createShortUrl(
        longUrl,
        edurlLinkTitle(title),
        token,
        slug,
      )
      isStale = false
      oncreated?.(url, longUrl)
      // la copie suit tout de suite la création : le clic de l'enseignant est
      // encore récent, ce que certains navigateurs exigent
      if (await copyTextToClipboard(url)) {
        copyState = 'success'
        onclose()
        return
      }
      await show(url)
      error =
        'Le lien n’a pas pu être copié dans le presse-papier : copiez-le ci-dessous.'
    } catch (err) {
      fail(err, 'form')
    }
  }

  async function refresh() {
    const token = getEdurlToken()
    if (token === null) {
      phase = 'token'
      return
    }
    phase = 'busy'
    error = ''
    try {
      await updateShortLink(
        { shortCode: shortCodeOf(shortUrl) },
        { longUrl },
        token,
      )
      isStale = false
      await show(shortUrl)
      oncreated?.(shortUrl, longUrl)
    } catch (err) {
      fail(err, 'done')
    }
  }

  function saveToken(value: string) {
    if (!setEdurlToken(value)) return
    error = ''
    phase = 'form'
  }

  async function copy() {
    isCopied = await copyTextToClipboard(shortUrl, dialogBody)
    if (isCopied) setTimeout(() => (isCopied = false), 2000)
  }

  function forgetToken() {
    clearEdurlToken()
    phase = 'token'
    error = ''
  }

  function another() {
    error = ''
    slug = ''
    isStale = false
    phase = getEdurlToken() === null ? 'token' : 'form'
  }
</script>

<SheetDialog
  {open}
  title="Lien raccourci (edurl.fr)"
  width="max-w-xl"
  {onclose}
>
  <div class="flex flex-col gap-4" bind:this={dialogBody}>
    {#if phase === 'token'}
      <EdurlTokenForm {error} label="Enregistrer le jeton" onsave={saveToken} />
    {:else if phase === 'form'}
      <form
        class="flex flex-col gap-4"
        onsubmit={(event) => {
          event.preventDefault()
          void create()
        }}
      >
        <label class="flex flex-col gap-1">
          <span class="font-semibold">Lien court souhaité (facultatif)</span>
          <span class="flex flex-row items-center gap-1">
            <span class="font-mono text-sm">edurl.fr/</span>
            <!-- svelte-ignore a11y_autofocus -->
            <input
              type="text"
              class="{textInput} font-mono text-sm"
              placeholder="ex : maths-6e"
              autocomplete="off"
              spellcheck="false"
              autocapitalize="off"
              autofocus
              maxlength="60"
              bind:value={slug}
            />
          </span>
          {#if slugMessage !== null}
            <span class="text-sm text-red-600 dark:text-red-400"
              >{slugMessage}</span
            >
          {:else}
            <span class={quietText}>
              Laissez vide pour un code généré par edurl.fr. Lettres sans
              accent, chiffres, tirets. Le code ne pourra plus être modifié
              ensuite.
            </span>
          {/if}
        </label>
        {#if error !== ''}
          <p class="text-red-600 dark:text-red-400">{error}</p>
        {/if}
        <div class="flex flex-row justify-between gap-3">
          <button
            type="button"
            class="{quietText} underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
            onclick={forgetToken}
          >
            Oublier le jeton edurl.fr
          </button>
          <button
            type="submit"
            class={primaryButton}
            disabled={slugMessage !== null}
          >
            <i class="bx bx-link" aria-hidden="true"></i> Créer le lien raccourci
          </button>
        </div>
      </form>
    {:else if phase === 'busy'}
      <p class="flex items-center gap-2">
        <i class="bx bx-loader-alt bx-spin" aria-hidden="true"></i>
        Un instant…
      </p>
    {:else}
      <div class="flex flex-row items-center gap-2">
        <input
          type="text"
          readonly
          class="{textInput} font-mono text-sm"
          aria-label="Lien raccourci"
          value={shortUrl}
          onfocus={(event) => event.currentTarget.select()}
        />
        <button
          type="button"
          class={iconButton}
          title={isCopied ? 'Lien copié' : 'Copier le lien'}
          aria-label="Copier le lien raccourci"
          onclick={copy}
        >
          <i class="bx {isCopied ? 'bx-check' : 'bx-copy'} text-xl"></i>
        </button>
        <button
          type="button"
          class={iconButton}
          title="QR code"
          aria-label="Afficher le QR code"
          aria-pressed={isQrShown}
          onclick={() => (isQrShown = !isQrShown)}
        >
          <i class="bx bx-qr text-xl"></i>
        </button>
      </div>
      {#if isQrShown && qrSource !== ''}
        <div class="flex flex-col items-center gap-2">
          <img
            src={qrSource}
            alt="QR code du lien raccourci"
            class="w-60 h-60"
          />
          <a
            class={secondaryButton}
            href={qrSource}
            download="qrcode_edurl.png"
          >
            <i class="bx bx-download" aria-hidden="true"></i> Télécharger le QR code
          </a>
        </div>
      {/if}
      {#if isStale}
        <div
          class="flex flex-col gap-2 rounded-lg border px-4 py-3 border-coopmaths-action dark:border-coopmathsdark-action"
          role="status"
        >
          <p>
            <i class="bx bx-error" aria-hidden="true"></i>
            Ce lien court mène encore à une ancienne version (les réglages ont changé
            depuis sa création).
          </p>
          <div>
            <button type="button" class={secondaryButton} onclick={refresh}>
              <i class="bx bx-refresh" aria-hidden="true"></i> Mettre à jour le lien
              court
            </button>
          </div>
        </div>
      {/if}
      {#if error !== ''}
        <p class="text-red-600 dark:text-red-400">{error}</p>
      {/if}
      <p class={quietText}>
        Ce lien est enregistré dans votre compte edurl.fr. Vous pouvez le
        retrouver, le modifier ou le supprimer dans « Mes sauvegardes › Liens
        raccourcis ».
      </p>
      <div class="flex flex-row flex-wrap justify-between gap-3">
        <span class="flex flex-row gap-4">
          <button
            type="button"
            class="{quietText} underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
            onclick={another}
          >
            Créer un autre lien court
          </button>
          <button
            type="button"
            class="{quietText} underline hover:text-coopmaths-action dark:hover:text-coopmathsdark-action"
            onclick={forgetToken}
          >
            Oublier le jeton edurl.fr
          </button>
        </span>
        <button type="button" class={primaryButton} onclick={onclose}>
          Fermer
        </button>
      </div>
    {/if}
  </div>
</SheetDialog>

<BasicInfoModal
  bind:contentDisplayed={copyState}
  successMessage="Le lien raccourci est créé et copié dans le presse-papier !"
  errorMessage="Impossible de copier le lien dans le presse-papier !"
/>
