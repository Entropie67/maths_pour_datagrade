<script lang="ts">
  /**
   * Gestion des banques d'exercices externes : ajout d'une archive zip locale
   * ou d'un dépôt public de forge.apps.education.fr, et retrait des banques
   * déjà installées.
   * @see documentation/utilisation/banques-externes.md
   */
  import { sourceForgeDepuisUrl } from '../../../../../lib/components/banquesExternes'
  import {
    ajouterBanqueForge,
    ajouterBanqueZip,
    banquesExternes,
    supprimerBanque,
  } from '../../../../../lib/stores/banquesExternesStore'
  import { FORGE_HOST } from '../../../../../lib/types/banquesExternes'
  import BasicClassicModal from '../../../../shared/modal/BasicClassicModal.svelte'
  import ButtonTextAction from '../../../../shared/forms/ButtonTextAction.svelte'
  import ButtonIcon from '../../../../shared/forms/ButtonIcon.svelte'

  export let isDisplayed: boolean

  /** Page d'aide décrivant le format des banques et comment en ajouter une */
  const URL_AIDE = 'https://coopmaths.fr/www/aide/banque-exercices'

  let urlForge = ''
  let inputZip: HTMLInputElement | undefined
  let nomFichierChoisi = ''
  let messageErreur = ''
  let messageSucces = ''
  let enCours = false

  // Une réouverture de la modale repart sans le message de la fois précédente
  // (fermeture automatique à l'ajout : sans ce nettoyage, un ancien message de
  // succès pourrait apparaître furtivement avant toute action de l'utilisateur).
  $: if (isDisplayed) {
    messageErreur = ''
    messageSucces = ''
  }

  /**
   * Déclenche la sélection d'une archive via le sélecteur de fichiers natif.
   */
  function choisirFichier() {
    inputZip?.click()
  }

  /**
   * Installe la banque dès qu'une archive est choisie, sans étape de
   * confirmation supplémentaire, puis ferme la modale.
   */
  async function importerZip(event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const fichier = input.files?.[0]
    // la valeur est réinitialisée immédiatement : sans cela, choisir à nouveau
    // le même fichier (après une erreur, par exemple) ne redéclencherait pas
    // l'évènement `change`
    input.value = ''
    if (fichier === undefined) return
    nomFichierChoisi = fichier.name
    enCours = true
    messageErreur = ''
    messageSucces = ''
    try {
      const banque = await ajouterBanqueZip(fichier)
      messageSucces = `« ${banque.manifest.titre} » ajoutée (${banque.manifest.exercices.length} exercices).`
      isDisplayed = false
    } catch (erreur) {
      messageErreur = erreur instanceof Error ? erreur.message : String(erreur)
    } finally {
      enCours = false
      nomFichierChoisi = ''
    }
  }

  /**
   * Installe la banque hébergée par le dépôt dont l'URL a été saisie, puis
   * ferme la modale.
   */
  async function importerForge() {
    const source = sourceForgeDepuisUrl(urlForge)
    if (source === null) {
      messageErreur = `L'adresse doit être celle d'un dépôt de ${FORGE_HOST}, par exemple https://${FORGE_HOST}/mon-groupe/ma-banque`
      return
    }
    enCours = true
    messageErreur = ''
    messageSucces = ''
    try {
      const banque = await ajouterBanqueForge(source)
      messageSucces = `« ${banque.manifest.titre} » ajoutée (${banque.manifest.exercices.length} exercices).`
      urlForge = ''
      isDisplayed = false
    } catch (erreur) {
      messageErreur = erreur instanceof Error ? erreur.message : String(erreur)
    } finally {
      enCours = false
    }
  }

  /**
   * Retire une banque de la liste.
   * @param {string} cle clé de la banque à retirer
   */
  async function retirer(cle: string) {
    messageErreur = ''
    messageSucces = ''
    await supprimerBanque(cle)
  }
</script>

<BasicClassicModal bind:isDisplayed>
  <span slot="header">Vos banques d'exercices</span>
  <div slot="content" class="text-start text-sm">
    <!-- Symétrique du bouton de fermeture (en haut à droite de la modale) -->
    <ButtonIcon
      icon="bx-help-circle text-2xl"
      title="Aide sur les banques d'exercices externes"
      class="absolute top-3 left-3"
      on:click={() => window.open(URL_AIDE, '_blank', 'noopener')}
    />
    <p class="mb-4">
      Une banque est un ensemble d'exercices au format image (et éventuellement
      Typst) décrit par un fichier <code>manifest.json</code>. Elle peut être
      déposée sous forme d'archive, ou lue directement dans un dépôt public de
      {FORGE_HOST}.
    </p>

    <!-- Banques installées -->
    {#if $banquesExternes.length > 0}
      <h3
        class="font-bold mb-2 text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        Banques installées
      </h3>
      <ul class="mb-6 flex flex-col gap-2">
        {#each $banquesExternes as banque (banque.source.cle)}
          <li
            class="flex flex-row items-center justify-between gap-2 rounded-lg px-3 py-2 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
          >
            <div class="flex flex-col">
              <span class="font-semibold">{banque.manifest.titre}</span>
              <span class="text-xs opacity-70">
                {banque.manifest.exercices.length} exercices
                {#if banque.manifest.auteur}· {banque.manifest.auteur}{/if}
                ·
                {#if banque.source.type === 'forge'}
                  {banque.source.projet} ({banque.source.ref})
                {:else if banque.source.type === 'builtin'}
                  intégrée au site
                {:else}
                  archive locale{banque.source.nomFichier
                    ? ` (${banque.source.nomFichier})`
                    : ''}
                {/if}
              </span>
              {#if banque.source.type === 'zip'}
                <span class="text-xs opacity-70 italic">
                  Banque locale : elle ne suivra pas les liens partagés.
                </span>
              {:else if banque.source.type === 'builtin'}
                <span class="text-xs opacity-70 italic">
                  Banque livrée avec MathALÉA : elle ne peut pas être retirée.
                </span>
              {/if}
            </div>
            {#if banque.source.type !== 'builtin'}
              <ButtonIcon
                icon="bx-trash text-xl"
                title="Retirer cette banque"
                on:click={() => retirer(banque.source.cle)}
              />
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    <!-- Ajout depuis un dépôt de la forge -->
    <h3
      class="font-bold mb-2 text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Ajouter un dépôt de la forge
    </h3>
    <div class="flex flex-row gap-2 mb-6">
      <input
        type="url"
        bind:value={urlForge}
        placeholder="https://{FORGE_HOST}/mon-groupe/ma-banque"
        class="grow rounded-lg px-3 py-2 border border-coopmaths-action dark:border-coopmathsdark-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      />
      <ButtonTextAction
        text="Ajouter"
        icon="bx-cloud-download"
        disabled={enCours || urlForge.trim().length === 0}
        class="rounded-lg py-1 px-3 shrink-0"
        on:click={importerForge}
      />
    </div>

    <!-- Ajout depuis une archive locale : importée dès qu'elle est choisie -->
    <h3
      class="font-bold mb-2 text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      Ajouter une archive
    </h3>
    <div class="flex flex-row items-center gap-2 mb-6">
      <input
        bind:this={inputZip}
        type="file"
        accept=".zip,application/zip"
        class="hidden"
        on:change={importerZip}
      />
      <ButtonTextAction
        text={enCours && nomFichierChoisi
          ? `Import de « ${nomFichierChoisi} »…`
          : 'Choisir un fichier…'}
        icon="bx-folder-open"
        disabled={enCours}
        class="rounded-lg py-2 px-4"
        on:click={choisirFichier}
      />
    </div>

    {#if messageErreur !== ''}
      <p class="mt-4 text-red-600 dark:text-red-400">
        {messageErreur}
      </p>
    {/if}
    {#if messageSucces !== ''}
      <p class="mt-4 text-coopmaths-struct dark:text-coopmathsdark-struct">
        {messageSucces}
      </p>
    {/if}
  </div>
</BasicClassicModal>
