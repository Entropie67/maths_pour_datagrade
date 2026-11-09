<script lang="ts">
  import { clearEdurlToken, setEdurlToken } from '../../../lib/edurl/token'
  import type { EdurlToken } from '../../../lib/edurl/token'
  import EdurlTokenForm from '../../shared/edurl/EdurlTokenForm.svelte'
  import SheetDialog from './SheetDialog.svelte'
  import { dangerButton, quietText, secondaryButton } from './styles'

  /**
   * Jeton d'accès à edurl.fr, dans « Mes sauvegardes › Mes réglages ». Un seul
   * jeton sert partout où MathALÉA propose un lien ou un QR code raccourci, et
   * à gérer les liens raccourcis. Il est écrit dans le fichier `.mathalea`
   * (donc repris à l'import).
   */
  interface Props {
    token: EdurlToken
    /** Le jeton a été enregistré ou oublié */
    onchange: () => void
    formatDate: (iso: string) => string
  }

  let { token, onchange, formatDate }: Props = $props()

  let isChanging = $state(false)
  let isForgetting = $state(false)

  const hasToken = $derived(token.value !== null)
  const hasDate = $derived(Date.parse(token.updatedAt) > 0)

  function save(value: string) {
    if (!setEdurlToken(value)) return
    isChanging = false
    onchange()
  }

  function forget() {
    isForgetting = false
    clearEdurlToken()
    onchange()
  }
</script>

<div class="flex flex-row flex-wrap items-center gap-3">
  <h2
    class="text-xl font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
  >
    <i class="bx bx-key" aria-hidden="true"></i> Jeton edurl.fr
  </h2>
</div>
<p class={quietText}>
  edurl.fr est le raccourcisseur de liens de l’éducation nationale. Votre jeton
  d’accès personnel permet à MathALÉA de créer des liens courts (lien pour les
  élèves, QR codes, quizz, diaporamas…) et de gérer ceux que vous avez déjà
  créés.
</p>

<div
  class="flex flex-col gap-4 max-w-2xl rounded-xl px-6 py-5 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
>
  {#if hasToken && !isChanging}
    <p class="font-semibold">
      <i class="bx bx-check-circle" aria-hidden="true"></i> Un jeton est
      enregistré{hasDate ? ` (depuis le ${formatDate(token.updatedAt)})` : ''}.
    </p>
    <div class="flex flex-row flex-wrap gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isChanging = true)}
      >
        <i class="bx bx-edit" aria-hidden="true"></i> Changer de jeton
      </button>
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isForgetting = true)}
      >
        <i class="bx bx-trash" aria-hidden="true"></i> Oublier le jeton
      </button>
    </div>
  {:else}
    {#if !hasToken}
      <p class="font-semibold">Aucun jeton n’est enregistré.</p>
    {/if}
    <EdurlTokenForm label="Enregistrer le jeton" onsave={save} />
    {#if isChanging}
      <div class="flex flex-row justify-end">
        <button
          type="button"
          class={secondaryButton}
          onclick={() => (isChanging = false)}>Annuler</button
        >
      </div>
    {/if}
  {/if}
</div>

<SheetDialog
  open={isForgetting}
  title="Oublier le jeton edurl.fr ?"
  onclose={() => (isForgetting = false)}
>
  <div class="flex flex-col gap-4">
    <p>
      Le jeton sera retiré de ce navigateur et de votre fichier de sauvegarde
      <code>.mathalea</code>. Vos liens courts restent valides sur edurl.fr ;
      vous les retrouverez en saisissant à nouveau le jeton.
    </p>
    <div class="flex flex-row justify-end gap-3">
      <button
        type="button"
        class={secondaryButton}
        onclick={() => (isForgetting = false)}>Annuler</button
      >
      <button type="button" class={dangerButton} onclick={forget}>
        <i class="bx bx-trash" aria-hidden="true"></i> Oublier
      </button>
    </div>
  </div>
</SheetDialog>
