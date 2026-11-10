<script lang="ts">
  import { onMount } from 'svelte'
  import { buildMathAleaURL } from '../../../lib/components/urls'
  import {
    edurlErrorMessage,
    edurlLinkTitle,
    isTokenInvalid,
    shortenUrl,
  } from '../../../lib/edurl/api'
  import {
    clearEdurlToken,
    getEdurlToken,
    setEdurlToken,
  } from '../../../lib/edurl/token'
  import {
    mathaleaGenerateSeed,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../lib/mathalea.js'
  import { watchAutoSave } from '../../../lib/mesFeuilles/autoSave'
  import {
    loadPreferences,
    sameStudentLink,
    studentLinkPreferences,
    updatePreferences,
  } from '../../../lib/mesFeuilles/preferences'
  import { canOptions } from '../../../lib/stores/canStore'
  import { darkMode, exercicesParams } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import Footer from '../../Footer.svelte'
  import ButtonActionInfo from '../../shared/forms/ButtonActionInfo.svelte'
  import ButtonQRCode from '../../shared/forms/ButtonQRCode.svelte'
  import ShortLinkDialog from '../../shared/edurl/ShortLinkDialog.svelte'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import SaveSelectionButton from '../mesFeuilles/SaveSelectionButton.svelte'
  import FormRadio from '../../shared/forms/FormRadio.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import Tabs from '../../shared/ui/Tabs.svelte'
  import ReglagesCan from './sections/ReglagesCan.svelte'
  import ReglagesClassique from './sections/ReglagesClassique.svelte'
  import ReglagesDonnees from './sections/ReglagesDonnees.svelte'

  $: activeTab = $canOptions.isChoosen ? 'can' : 'classic'

  const tabs = [
    {
      id: 'classic',
      label: 'Présentation classique',
      ariaControls: 'tabs-pres-classic',
    },
    { id: 'can', label: 'Course aux nombres', ariaControls: 'tabs-pres-can' },
  ]

  function handleTabChange(e: CustomEvent<string>) {
    $canOptions.isChoosen = e.detail !== 'classic'
  }

  /**
   * Les réglages mémorisés sont appliqués : les changements suivants sont
   * enregistrés. Lu seulement dans `rememberStudentLink`, pour que son
   * passage à `true` ne relance pas le bloc réactif.
   */
  let preferencesApplied = false

  onMount(() => {
    handleSeed()
    preferencesApplied = true
    if (currentLinkFormat === 'short') handleLinkFormatChange()
    // ces réglages font partie du fichier de « Mes sauvegardes »
    return watchAutoSave()
  })

  /** Reprend les réglages du dernier lien préparé (voir `preferences.ts`) */
  function restoreStudentLink() {
    const saved = loadPreferences().studentLink
    if (saved === null) return
    globalOptions.update((options) => ({
      ...options,
      ...saved.globalOptions,
    }))
    canOptions.update((options) => ({ ...options, ...saved.canOptions }))
    isDataRandom = saved.isDataRandom
    currentLinkFormat = saved.linkFormat
  }

  function rememberStudentLink(
    options: object,
    can: object,
    isRandom: boolean,
    format: LinkFormat,
  ) {
    if (!preferencesApplied) return
    const next = studentLinkPreferences(options, can, isRandom, format)
    if (sameStudentLink(next, loadPreferences().studentLink)) return
    updatePreferences((preferences) => ({
      ...preferences,
      studentLink: next,
    }))
  }

  $: rememberStudentLink(
    $globalOptions,
    $canOptions,
    isDataRandom,
    currentLinkFormat,
  )

  const availableLinkFormats = {
    clear: {
      toolTipsMessage: 'En clair',
      icon: 'bx-glasses-alt',
      isShort: false,
      isEncrypted: false,
    },
    short: {
      toolTipsMessage: 'Raccourci',
      icon: 'bx-move-horizontal',
      isShort: true,
      isEncrypted: false,
    },
    crypt: {
      toolTipsMessage: 'Crypté',
      icon: 'bx-lock',
      isShort: false,
      isEncrypted: true,
    },
  }
  // L'interactivité de la Course aux nombres (`canOptions.isInteractive`) est
  // réglée dans son propre onglet : elle ne doit pas être liée au réglage
  // « Interactivité » de la présentation classique
  // (`globalOptions.setInteractive`), qui ne concerne que la page Élève.
  type LinkFormat = keyof typeof availableLinkFormats
  let currentLinkFormat: LinkFormat = 'clear'

  /**
   * Raccourcissement du lien Élève via edurl.fr (`lib/edurl`), avec le même
   * jeton que le reste de MathALÉA (réglé aussi dans « Mes sauvegardes »).
   */
  let edurlAskToken = false
  let edurlTokenInput = ''
  let edurlBusy = false
  let edurlError = ''
  // Résultat du raccourcissement pour l'URL longue courante (`eleveUrl` hors
  // raccourci) : invalidé (repassé à null) dès que cette URL change, pour ne
  // jamais servir un raccourci périmé correspondant à d'anciens réglages.
  let shortenedUrl: string | null = null
  let shortenedUrlSource: string | null = null
  // Lien court personnalisé (code choisi, voir `ShortLinkDialog`) : il remplace
  // le lien automatique tant qu'il correspond aux réglages, et n'est jamais
  // recréé tout seul (son code est déjà pris) : on propose de le mettre à jour.
  let customShort: { url: string; longUrl: string } | null = null
  let isCustomOpen = false

  async function shortenEleveUrl(longUrl: string) {
    const token = getEdurlToken()
    if (token == null) {
      edurlAskToken = true
      return
    }
    edurlError = ''
    edurlBusy = true
    try {
      shortenedUrl = await shortenUrl(
        longUrl,
        edurlLinkTitle($globalOptions.title ?? ''),
        token,
      )
      shortenedUrlSource = longUrl
    } catch (err) {
      if (isTokenInvalid(err)) {
        clearEdurlToken()
        edurlAskToken = true
      }
      edurlError = edurlErrorMessage(err)
    } finally {
      edurlBusy = false
    }
  }

  function saveEdurlTokenAndShorten() {
    if (!setEdurlToken(edurlTokenInput)) return
    edurlTokenInput = ''
    edurlAskToken = false
    shortenEleveUrl(eleveLongUrl)
  }

  function forgetEdurlToken() {
    clearEdurlToken()
    edurlAskToken = false
  }

  /** Sélection du format « Raccourci » : lance le raccourcissement si le
   *  résultat en cache ne correspond plus à l'URL longue courante. */
  function handleLinkFormatChange() {
    if (
      currentLinkFormat === 'short' &&
      customShort === null &&
      shortenedUrlSource !== eleveLongUrl &&
      !edurlBusy
    ) {
      shortenEleveUrl(eleveLongUrl)
    }
  }

  /**
   * Construit l'URL correspondant aux choix de la page de configuration et bascule sur cette page
   */
  function handleVueSetUp() {
    const nextView = $canOptions.isChoosen ? 'can' : 'eleve'
    const url = buildMathAleaURL({
      view: nextView,
      isEncrypted: availableLinkFormats[currentLinkFormat].isEncrypted,
      removeSeed: isDataRandom,
    })
    window.open(url, '_blank')?.focus()
  }

  // Gestion de la graine
  let isDataRandom: boolean = false
  function handleSeed() {
    for (const param of $exercicesParams) {
      if (!isDataRandom && param.alea === undefined) {
        param.alea = mathaleaGenerateSeed()
      } else if (isDataRandom) {
        param.alea = undefined
      }
    }
    mathaleaUpdateUrlFromExercicesParams($exercicesParams)
  }

  // `buildMathAleaURL` lit `globalOptions` via `get()`, ce qui n'est pas
  // détecté par le compilateur Svelte comme une dépendance réactive : on
  // référence explicitement `$globalOptions.presMode` pour forcer le
  // recalcul à chaque changement des réglages (interactivité, etc.)
  // URL longue, jamais cryptée : c'est elle qu'on raccourcit via edurl.fr
  // (on ne raccourcit jamais un lien déjà crypté/illisible côté Shlink).
  $: eleveLongUrl = buildMathAleaURL({
    view: $canOptions.isChoosen ? 'can' : 'eleve',
    isEncrypted: false,
    removeSeed: isDataRandom,
    mode: $globalOptions.presMode,
  }).toString()

  // Le format actif change l'URL affichée (clair/crypté), toujours calculée
  // pour permettre de raccourcir sans attendre la fin du chargement en cours ;
  // le format « Raccourci » relance lui-même le raccourcissement dès que les
  // réglages changent (voir handleLinkFormatChange).
  $: eleveUrlForCurrentFormat = buildMathAleaURL({
    view: $canOptions.isChoosen ? 'can' : 'eleve',
    isEncrypted: availableLinkFormats[currentLinkFormat].isEncrypted,
    removeSeed: isDataRandom,
    mode: $globalOptions.presMode,
  }).toString()

  // Tant que le raccourci n'est pas prêt pour l'URL longue courante, on
  // affiche l'URL longue en repli plutôt qu'un lien vide ou périmé.
  $: isCustomCurrent =
    customShort !== null && customShort.longUrl === eleveLongUrl
  $: eleveUrl =
    currentLinkFormat === 'short'
      ? customShort !== null
        ? isCustomCurrent
          ? customShort.url
          : eleveLongUrl
        : (shortenedUrlSource === eleveLongUrl && shortenedUrl) || eleveLongUrl
      : eleveUrlForCurrentFormat

  // Relâche un raccourci obsolète dès que les réglages changent l'URL longue,
  // et relance automatiquement le raccourcissement si le format « Raccourci »
  // est déjà sélectionné (jeton déjà connu) pour éviter de laisser affiché
  // un ancien lien correspondant à d'anciens réglages.
  $: if (shortenedUrlSource !== null && shortenedUrlSource !== eleveLongUrl) {
    shortenedUrl = null
    shortenedUrlSource = null
    if (
      currentLinkFormat === 'short' &&
      customShort === null &&
      !edurlBusy &&
      getEdurlToken() != null
    ) {
      shortenEleveUrl(eleveLongUrl)
    }
  }

  // avant la création des sections de réglages, qui lisent leur valeur initiale
  restoreStudentLink()
</script>

<main
  class=" {$darkMode.isActive
    ? 'dark'
    : ''} mb-auto flex flex-col min-h-screen justify-start bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
>
  <NavBar
    subtitle="La page Élève"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />
  <div
    class="flex flex-col h-full w-full bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <div
      class="h-full w-full md:w-2/3 lg:w-3/5 flex flex-col px-4 pb-4 md:py-10 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark mx-auto"
    >
      <div
        class="flex flex-col md:flex-row justify-start px-4 py-4 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      >
        <h3
          class="font-bold text-2xl text-coopmaths-struct dark:text-coopmathsdark-struct bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
        >
          Réglages
        </h3>
        <p
          class="md:ml-4 md:self-end text-sm font-light text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          title="Présentation, correction, Course aux nombres, données et format du lien. L’interactivité suit le choix « Papier » ou « Numérique » de la conception de document. Ces réglages sont repris dans le fichier de « Mes sauvegardes »."
        >
          Ces réglages sont mémorisés pour vos prochains liens.
        </p>
      </div>
      <!-- Tabulations pour la présentation -->
      <Tabs {tabs} {activeTab} on:change={handleTabChange} />
      <!-- Pages des réglages -->
      <div class="pb-6 pt-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
        <div
          class="transition-opacity duration-150 ease-linear {activeTab ===
          'classic'
            ? 'block opacity-100'
            : 'hidden opacity-0'}"
          id="tabs-pres-classic"
          role="tabpanel"
          aria-labelledby="tabs-pres-classic-btn"
        >
          <!-- Présentation classique -->
          <div
            class="flex px-6 py-2 font-light text-lg text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >
            Les exercices seront posés suivant les réglages ci-dessous.
          </div>
          <ReglagesClassique
            bind:globalOptions={$globalOptions}
            canOptions={$canOptions}
            onAffichageToggle={handleSeed}
          />
        </div>
        <div
          class="transition-opacity duration-150 ease-linear
          {activeTab === 'can' ? 'block opacity-100' : 'hidden opacity-0'}"
          id="tabs-pres-can"
          role="tabpanel"
          aria-labelledby="tabs-pres-can-btn"
        >
          <!-- Can -->
          <div
            class="flex px-6 py-2 font-light text-lg text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light"
          >
            Les questions seront posées les unes à la suite des autres en temps
            limité.
          </div>
          <ReglagesCan bind:canOptions={$canOptions} />
        </div>
      </div>

      <div
        class="pt-2 pl-2 grid grid-flow-row md:grid-cols-2 gap-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      >
        <ReglagesDonnees bind:isDataRandom />
      </div>
      <div
        class="pt-4 pb-8 px-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      >
        <ButtonTextAction
          on:click={handleVueSetUp}
          class="px-2 py-1 rounded-md"
          text="Visualiser"
        />
      </div>
      <div
        class="flex flex-row justify-start px-4 pt-4 pb-2 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      >
        <h3
          class="font-bold text-2xl text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          Utilisation
        </h3>
      </div>
      <div class="py-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
        <div
          class="flex flex-col md:flex-row justify-start space-x-10 items-start md:items-center px-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
        >
          <div
            class="text-coopmaths-struct-light dark:text-coopmathsdark-struct-light font-semibold"
          >
            Format de l'URL
          </div>
          <div class="flex">
            <FormRadio
              title="linkFormat"
              bind:valueSelected={currentLinkFormat}
              on:newvalue={handleLinkFormatChange}
              labelsValues={[
                { label: 'En clair', value: 'clear' },
                { label: 'Crypté', value: 'crypt' },
                { label: 'Raccourci (edurl.fr)', value: 'short' },
              ]}
              orientation="row"
            />
          </div>
        </div>
        {#if currentLinkFormat === 'short'}
          <div class="flex flex-col items-start px-4 pt-2 space-y-1">
            {#if edurlAskToken}
              <div class="flex flex-row items-center gap-2">
                <label
                  for="edurl-token"
                  class="text-sm font-light text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
                >
                  Jeton d’accès edurl.fr&nbsp;:
                </label>
                <input
                  id="edurl-token"
                  type="password"
                  class="rounded border border-coopmaths-action/40 px-1.5 py-0.5 text-xs"
                  autocomplete="off"
                  spellcheck="false"
                  bind:value={edurlTokenInput}
                  on:keydown={(e) => {
                    if (e.key === 'Enter') saveEdurlTokenAndShorten()
                    if (e.key === 'Escape') edurlAskToken = false
                  }}
                />
                <ButtonTextAction
                  on:click={saveEdurlTokenAndShorten}
                  class="px-2 py-0.5 text-xs rounded-md"
                  text="Enregistrer et raccourcir"
                />
              </div>
            {:else if edurlBusy}
              <div
                class="flex items-center gap-1 text-xs text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
              >
                <i class="bx bx-loader-alt bx-spin"></i>
                Raccourcissement du lien en cours…
              </div>
            {:else}
              <button
                type="button"
                class="text-xs text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action"
                on:click={forgetEdurlToken}
              >
                Oublier le jeton edurl.fr
              </button>
            {/if}
            {#if edurlError}
              <p class="text-xs text-red-600">{edurlError}</p>
            {/if}
            <div class="flex flex-row flex-wrap items-center gap-x-3 gap-y-1">
              <button
                type="button"
                class="text-xs text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action"
                on:click={() => (isCustomOpen = true)}
              >
                <i class="bx bx-edit-alt"></i>
                {customShort === null
                  ? 'Personnaliser le lien court…'
                  : 'Lien court personnalisé'}
              </button>
              {#if customShort !== null}
                <span
                  class="text-xs text-coopmaths-corpus/70 dark:text-coopmathsdark-corpus/70"
                >
                  {customShort.url.replace(/^https?:\/\//, '')}
                  {#if !isCustomCurrent}
                    — plus à jour : les réglages ont changé (lien long affiché)
                  {/if}
                </span>
                {#if !isCustomCurrent}
                  <button
                    type="button"
                    class="text-xs text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action"
                    on:click={() => (isCustomOpen = true)}
                  >
                    Mettre à jour
                  </button>
                {/if}
                <button
                  type="button"
                  class="text-xs text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action"
                  on:click={() => {
                    customShort = null
                    handleLinkFormatChange()
                  }}
                >
                  Revenir au lien automatique
                </button>
              {/if}
            </div>
          </div>
        {/if}
        <div
          class="flex flex-row justify-start items-start space-x-10 pt-3 pl-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
        >
          <div class="flex flex-col items-center px-2">
            <div
              class="text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-light font-semibold"
            >
              Lien
            </div>
            <div class="my-1">
              <ButtonActionInfo
                action="copy"
                textToCopy={eleveUrl}
                tooltip={'Lien ' +
                  availableLinkFormats[currentLinkFormat].toolTipsMessage}
                icon={'bx-link text-2xl'}
                cornerIcon={availableLinkFormats[currentLinkFormat].icon}
                messageSuccess="Le lien de la fiche élève est copié dans le presse-papier !"
                messageError="Impossible de copier le lien dans le presse-papier !"
              />
            </div>
          </div>
          <div class="flex flex-col justify-center items-center px-2">
            <div
              class="font-semibold
              text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-lightest"
            >
              QR-Code
            </div>
            <div class="my-1">
              <ButtonQRCode
                tooltip={'QR-code (lien ' +
                  availableLinkFormats[currentLinkFormat].toolTipsMessage +
                  ')'}
                customUrl={eleveUrl}
                cornerIcon={availableLinkFormats[currentLinkFormat].icon}
              />
            </div>
          </div>
          <div class="flex flex-col justify-center items-center px-2">
            <div
              class="text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-light font-semibold"
            >
              Embarqué
            </div>
            <div class="my-1">
              <ButtonActionInfo
                action="copy"
                textToCopy={`<iframe src="${eleveUrl}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`}
                tooltip={'Code (lien ' +
                  availableLinkFormats[currentLinkFormat].toolTipsMessage +
                  ')'}
                icon={'bx-code-alt text-2xl'}
                cornerIcon={availableLinkFormats[currentLinkFormat].icon}
                messageSuccess="Le code de la fiche élève est copié dans le presse-papier !"
                messageError="Impossible de copier le code dans le presse-papier !"
              />
            </div>
          </div>
          <div class="flex flex-col justify-center items-center px-2">
            <div
              class="text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-light font-semibold"
            >
              Fichier
            </div>
            <div class="my-1">
              <ButtonActionInfo
                action="download"
                urlToDownload={eleveUrl}
                fileName={$globalOptions.title
                  ? $globalOptions.title
                  : 'mathAlea'}
                successMessage="Le téléchargement va début dans quelques instants."
                errorMessage="Impossible de télécharger le fichier."
                tooltip={'Fichier de redirection (lien ' +
                  availableLinkFormats[currentLinkFormat].toolTipsMessage +
                  ')'}
                icon={'bxs-file-export text-2xl'}
                cornerIcon={availableLinkFormats[currentLinkFormat].icon}
              />
            </div>
          </div>
          <div class="flex flex-col justify-center items-center px-2">
            <div
              class="text-coopmaths-struct-lightest dark:text-coopmathsdark-struct-light font-semibold"
            >
              Mes sélections
            </div>
            <div class="my-1">
              <!-- lien en clair : une sélection garde ses réglages lisibles -->
              <SaveSelectionButton
                variant="config"
                getUrl={() => eleveLongUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ShortLinkDialog
    open={isCustomOpen}
    fresh
    getUrl={() => eleveLongUrl}
    title={$globalOptions.title ?? ''}
    existing={customShort === null
      ? undefined
      : { shortUrl: customShort.url, longUrl: customShort.longUrl }}
    oncreated={(url, longUrl) => (customShort = { url, longUrl })}
    onclose={() => (isCustomOpen = false)}
  />
  <Footer />
</main>
