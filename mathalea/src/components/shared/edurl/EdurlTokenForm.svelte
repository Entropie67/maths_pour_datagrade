<script lang="ts">
  import {
    primaryButton,
    quietText,
    textInput,
  } from '../../setup/mesFeuilles/styles'

  /**
   * Saisie du jeton d'accès à edurl.fr. Le jeton se récupère sur
   * portail.apps.education.fr (Mon profil › Jeton d'accès) ; il est gardé dans
   * ce navigateur et dans le fichier `.mathalea` de « Mes sauvegardes ».
   */
  interface Props {
    /** Message d'erreur à afficher (jeton refusé…) */
    error?: string
    /** Libellé du bouton */
    label?: string
    onsave: (token: string) => void
  }

  let {
    error = '',
    label = 'Enregistrer et raccourcir',
    onsave,
  }: Props = $props()

  let value = $state('')

  function submit(event: SubmitEvent) {
    event.preventDefault()
    const token = value.trim()
    if (token === '') return
    value = ''
    onsave(token)
  }
</script>

<form class="flex flex-col gap-3" onsubmit={submit}>
  <p>
    Pour raccourcir un lien, edurl.fr demande votre jeton d’accès personnel.
    Vous le trouverez sur
    <a
      class="underline text-coopmaths-action dark:text-coopmathsdark-action"
      href="https://portail.apps.education.fr"
      target="_blank"
      rel="noopener noreferrer">portail.apps.education.fr</a
    >
    (Mon profil › Jeton d’accès).
  </p>
  <label class="flex flex-col gap-1">
    <span class="font-semibold">Jeton d’accès edurl.fr</span>
    <input
      type="password"
      class={textInput}
      autocomplete="off"
      spellcheck="false"
      bind:value
    />
  </label>
  {#if error !== ''}
    <p class="text-red-600 dark:text-red-400">{error}</p>
  {/if}
  <p class={quietText}>
    Il reste sur cet ordinateur et dans votre fichier de sauvegarde
    <code>.mathalea</code> (ne partagez pas ce fichier).
  </p>
  <div class="flex flex-row justify-end">
    <button type="submit" class={primaryButton} disabled={value.trim() === ''}>
      {label}
    </button>
  </div>
</form>
