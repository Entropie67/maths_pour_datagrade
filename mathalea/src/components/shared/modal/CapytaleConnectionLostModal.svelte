<script lang="ts">
  import { retryCapytaleSaveNow } from '../../../lib/handleCapytale'
  import { capytaleConnectionLost } from '../../../lib/stores/generalStore'

  let dialog: HTMLDialogElement
  let isRetrying = false

  // La modale est bloquante : tant que la connexion n'est pas revenue,
  // l'élève ne doit pas pouvoir modifier sa copie
  $: if (dialog) {
    if ($capytaleConnectionLost && !dialog.open) {
      dialog.showModal()
    } else if (!$capytaleConnectionLost && dialog.open) {
      dialog.close()
      isRetrying = false
    }
  }

  function handleRetry() {
    isRetrying = true
    retryCapytaleSaveNow()
    // La tentative est asynchrone : on réactive le bouton même si elle échoue
    setTimeout(() => {
      isRetrying = false
    }, 3000)
  }
</script>

<dialog
  bind:this={dialog}
  on:cancel|preventDefault
  class="m-auto rounded-xl
    w-full md:w-2/3 xl:w-1/2
    text-coopmaths-corpus dark:text-coopmathsdark-corpus
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <div class="p-6 text-center">
    <div
      class="flex items-center justify-center h-12 w-12 mx-auto mt-2 mb-6 rounded-full
        bg-coopmaths-warn-100 text-coopmaths-warn-darkest"
    >
      <i class="bx bx-sm bx-wifi-off"></i>
    </div>
    <div
      class="w-full mb-4 text-2xl font-bold
        text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Connexion à Capytale perdue
    </div>
    <div class="w-full">
      <p class="mb-3">
        Vos réponses ne peuvent plus être enregistrées&nbsp;: votre copie est
        donc bloquée le temps que la connexion revienne.
      </p>
      <p class="mb-3">
        Ne fermez pas cette page. Dès le retour de la connexion, votre dernière
        réponse sera enregistrée automatiquement et vous pourrez continuer.
      </p>
      <p class="text-sm italic">
        Si le message persiste, vérifiez votre connexion à internet et que vous
        êtes toujours connecté·e à Capytale.
      </p>
    </div>
    <div class="w-full mt-6 mb-3 flex flex-col items-center gap-3">
      <div class="flex items-center gap-2 text-sm">
        <i class="bx bx-loader-alt bx-spin"></i>
        <span>Tentative de reconnexion en cours…</span>
      </div>
      <button
        class="px-4 py-2 rounded-md font-bold
          bg-coopmaths-action text-coopmaths-canvas
          dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas
          disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isRetrying}
        on:click={handleRetry}
      >
        Réessayer maintenant
      </button>
    </div>
  </div>
</dialog>
