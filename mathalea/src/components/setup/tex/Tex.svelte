<script lang="ts">
  import { EditorState } from '@codemirror/state'
  import { EditorView } from '@codemirror/view'
  import seedrandom from 'seedrandom'
  import { onDestroy, onMount, tick } from 'svelte'
  import { get } from 'svelte/store'
  import { downloadTexWithImagesZip } from '../../../lib/files'
  import Latex, { getLogoCanUrls, makeImageFilesUrls } from '../../../lib/Latex'
  import { type LatexFileInfos } from '../../../lib/LatexTypes'
  import {
    mathaleaBuildUrlFromExercicesParams,
    mathaleaGetExercicesFromParams,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../lib/mathalea'
  import {
    queryFromUrl,
    SHEET_URL_PARAM,
    type SheetContent,
    type SheetPreview,
  } from '../../../lib/mesFeuilles/library'
  import { buildPdfPreview } from '../../../lib/mesFeuilles/pdfPreview'
  import {
    isStorageAvailable,
    loadLibrary,
  } from '../../../lib/mesFeuilles/storage'
  import {
    currentSheetStore,
    darkMode,
    exercicesParams,
    freezeUrl,
    isInIframe,
    previousSheetStore,
    texParamStore,
    texShortcutsOpen,
  } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import { isLocalStorageAvailable } from '../../../lib/stores/storage'
  import {
    isIExercice,
    type IExercice,
    type IExerciceStatique,
  } from '../../../lib/types'
  import SaveSheetButton from '../mesFeuilles/SaveSheetButton.svelte'
  import ButtonOverleaf from '../../shared/forms/ButtonOverleaf.svelte'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import BugReportModal from '../../shared/exercice/shared/BugReportModal.svelte'
  import { decodeBase64, encodeBase64 } from '../latex/LatexConfig'
  import {
    codeEditorExtensions,
    revealPosition,
    setEditorMarkers,
    setEditorTheme,
  } from '../shared/editor/editorSetup'
  import {
    countErrors,
    parseTexLog,
    summarizeDiagnostics,
    type TexDiagnostic,
  } from './texDiagnostics'
  import TexSettingsPane from './TexSettingsPane.svelte'
  import { latexLanguage } from './editor/latexLanguage'
  import {
    compileTexToPdf,
    fetchAuxiliaryFiles,
    isAbortError,
    type TexAuxiliaryFile,
  } from './texCompiler'
  import { statsPdfCreatedTracker } from '../../../modules/statsUtils'

  /**
   * Vue « LaTeX » (`v=tex`) : l'interface de la vue Typst (éditeur de code,
   * modes code / côte à côte / aperçu, réglages du document) appliquée à une
   * fiche LaTeX compilée par le service distant de la vue PDF.
   *
   * La différence de fond avec la vue Typst est la latence : une compilation
   * dure plusieurs secondes, on ne recompile donc pas à la frappe mais à la
   * demande (bouton, Ctrl/Cmd + Entrée).
   */

  type DisplayMode = 'code' | 'split' | 'preview'
  const STORAGE_KEY = 'mathaleaTexView'
  const SM_BREAKPOINT = 640

  const isMobile = window.innerWidth < SM_BREAKPOINT
  let displayMode: DisplayMode = $state(isMobile ? 'preview' : 'split')
  let isBugReportDisplayed = $state(false)

  /** Réglages par défaut du document (aussi utilisés par « Réinitialiser ») */
  function defaultFileInfos(): LatexFileInfos {
    return {
      title: '',
      reference: '',
      withReferences: false,
      subtitle: '',
      style: 'ProfMaquette',
      fontOption: 'StandardFont',
      tailleFontOption: 12,
      dysTailleFontOption: 14,
      correctionOption: 'AvecCorrection',
      qrcodeOption: 'SansQrcode',
      typeFiche: 'Fiche',
      durationCanOption: '9 min',
      titleOption: 'SansTitre',
      modele: 'aucun',
      nbVersions: 1,
      exos: {},
    }
  }

  /**
   * Réglages restaurés depuis l'URL (`texParam`). Le paramètre est le même
   * objet que celui de la vue PDF (`pdfParam`), sous un autre nom : les deux
   * vues n'ont pas les mêmes réglages par défaut et se marcheraient dessus.
   */
  const restored = decodeBase64(
    new URL(window.location.href).searchParams.get('texParam') ?? '',
  ) as Partial<LatexFileInfos>

  // fiche ouverte depuis « Mes feuilles » (ou rechargée) : « Enregistrer »
  // met à jour cette feuille. Sans paramètre, la fiche est nouvelle, même si
  // une feuille était reliée avant de quitter la vue (voir la vue Typst).
  const urlSheetId =
    new URL(window.location.href).searchParams.get(SHEET_URL_PARAM) ?? ''
  const sheetLinkedBefore = get(currentSheetStore)
  if (sheetLinkedBefore !== '' && sheetLinkedBefore !== urlSheetId) {
    previousSheetStore.set(sheetLinkedBefore)
  }
  currentSheetStore.set(urlSheetId)

  /**
   * Habillage proposé par défaut, une fois les exercices chargés : Course
   * aux nombres si la fiche n'en contient que (identifiant commençant par
   * « can », comme `can6M4-07` — les exercices statiques n'en ont pas et
   * excluent donc ce cas), ProfMaquette sinon. Appelé seulement quand
   * l'URL ne fixe pas déjà un habillage (`restored.style` absent) : un lien
   * partagé ne doit pas changer d'habillage selon les exercices qu'on y a
   * ajoutés depuis.
   */
  function detectDefaultStyle(
    exercisesList: (IExercice | IExerciceStatique)[],
  ): LatexFileInfos['style'] {
    if (exercisesList.length === 0) return 'ProfMaquette'
    const allCan = exercisesList.every(
      (exercise) =>
        isIExercice(exercise) &&
        (exercise.id ?? '').toLowerCase().includes('can'),
    )
    return allCan ? 'Can' : 'ProfMaquette'
  }

  /** Réglages du document, partagés avec la vue PDF (`LatexFileInfos`) */
  let latexFileInfos: LatexFileInfos = $state({
    ...defaultFileInfos(),
    ...restored,
  })

  // ouvert par défaut (sauf sur téléphone, où il masquerait l'aperçu), comme
  // la vue Typst
  let isSettingsOpen = $state(!isMobile)

  /**
   * Moteur de compilation :
   * - `coopmaths` — le service distant de la vue PDF (`texCompiler.ts`),
   *   requêté par `fetch` : PDF récupéré en Blob, journal exploitable pour
   *   les diagnostics ;
   * - `texlive` — texlive.net, comme dans la vue LaTeX historique
   *   (`ButtonCompileLatexToPDF.svelte`). Son endpoint ne renvoie pas d'en-tête
   *   CORS sur la réponse de redirection : un `fetch` échoue systématiquement
   *   depuis le navigateur, la seule voie fiable est la soumission d'un
   *   formulaire caché ciblant l'aperçu par son nom (une navigation, pas une
   *   requête script). Le PDF ni le journal ne sont donc récupérables :
   *   l'aperçu affiche directement ce que renvoie texlive.net, erreurs
   *   comprises, sans diagnostics ni bouton de retour à la dernière version.
   */
  type CompileEngine = 'coopmaths' | 'texlive'
  let compileEngine: CompileEngine = $state('coopmaths')
  /** Nom ciblé par le formulaire texlive.net pour naviguer l'aperçu */
  const TEXLIVE_PREVIEW_NAME = 'mathalea-tex-preview'
  let previewIframeEl: HTMLIFrameElement | undefined = $state()
  let hiddenFormEl: HTMLFormElement | undefined = $state()
  /** Un aperçu texlive.net a été demandé (succès ou échec, on ne sait pas) */
  let hasTexliveResult = $state(false)

  const latex = new Latex()
  let exercises: (IExercice | IExerciceStatique)[] = $state([])
  let isLoading = $state(true)

  /** L'utilisateur a modifié le code à la main : la régénération l'écraserait */
  let isEdited = $state(false)
  let editorEl: HTMLDivElement | undefined = $state()
  let editorView: EditorView | null = null

  /** Compilation en cours (le PDF précédent reste affiché) */
  let isCompiling = $state(false)
  /** L'aperçu ne correspond plus au code affiché */
  let isPreviewStale = $state(false)
  let pdfUrl: string | null = $state(null)
  let pdfBlob: Blob | null = null
  /** Message court quand la compilation n'a pas abouti (réseau, délai…) */
  let compileError: string | null = $state(null)
  /** Bascule automatique de moteur signalée à l'utilisateur (service injoignable) */
  let engineSwitchNotice: string | null = $state(null)
  /** Diagnostics de la dernière compilation, traduits en français */
  let diagnostics: TexDiagnostic[] = $state([])
  /** Le panneau d'erreurs est replié (l'utilisateur l'a fermé) */
  let isDiagnosticsCollapsed = $state(false)
  /** Journal brut, consultable quand aucun diagnostic n'a pu en être tiré */
  let compileLog = $state('')
  let compileController: AbortController | null = null

  const errorCount = $derived(countErrors(diagnostics))
  const diagnosticsSummary = $derived(summarizeDiagnostics(diagnostics))

  /** Dernier code ayant produit un PDF, et l'heure de cette compilation */
  let lastGoodCode: string | null = $state(null)
  let lastGoodAt: Date | null = $state(null)
  // `isPreviewStale` dit que le code affiché n'est plus celui du PDF affiché,
  // donc plus celui de `lastGoodCode` — et il est réactif, contrairement au
  // contenu de CodeMirror.
  const canRestoreLastGood = $derived(lastGoodCode != null && isPreviewStale)
  /** Un aperçu (Blob coopmaths ou navigation texlive.net) est affichable */
  const showPreview = $derived(
    compileEngine === 'coopmaths' ? pdfUrl != null : hasTexliveResult,
  )
  /** Secondes écoulées depuis le début de la compilation courante */
  let elapsed = $state(0)
  let elapsedTimer: ReturnType<typeof setInterval> | undefined

  /**
   * Touche de modification affichée dans l'aide, selon l'OS : « ⌘ » sous
   * macOS/iOS, « CTRL » partout ailleurs.
   */
  const MOD_KEY =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
      ? '⌘'
      : 'CTRL'

  /**
   * Raccourcis de l'éditeur, par famille. Ils viennent de CodeMirror
   * (`defaultKeymap`, `searchKeymap`) et de `codeEditorExtensions`.
   */
  const EDITOR_SHORTCUTS: { title: string; keys: [string, string][] }[] = [
    {
      title: 'Rechercher et sélectionner',
      keys: [
        [`${MOD_KEY} + F`, 'Rechercher / remplacer'],
        [`${MOD_KEY} + G`, 'Occurrence suivante'],
        [`${MOD_KEY} + D`, 'Ajouter l’occurrence suivante à la sélection'],
        [`${MOD_KEY} + Maj + L`, 'Sélectionner toutes les occurrences'],
        [`${MOD_KEY} + L`, 'Sélectionner la ligne'],
        ['Alt + G', 'Aller à la ligne…'],
        ['Échap', 'Revenir à un seul curseur'],
      ],
    },
    {
      title: 'Modifier',
      keys: [
        [`${MOD_KEY} + /`, 'Commenter / décommenter'],
        ['Alt + ↑ / ↓', 'Déplacer la ligne'],
        ['Maj + Alt + ↑ / ↓', 'Dupliquer la ligne'],
        [`${MOD_KEY} + Maj + D`, 'Dupliquer la ligne vers le bas'],
        [`${MOD_KEY} + Maj + K`, 'Supprimer la ligne'],
        ['Tab / Maj + Tab', 'Indenter / désindenter'],
        [`${MOD_KEY} + Z`, 'Annuler'],
        [`${MOD_KEY} + Maj + Z`, 'Rétablir'],
      ],
    },
    {
      title: 'Curseurs multiples',
      keys: [
        [
          `${MOD_KEY} + Alt + ↑ / ↓`,
          'Ajouter un curseur au-dessus / en dessous',
        ],
        ['Alt + glisser', 'Sélection rectangulaire'],
      ],
    },
    {
      title: 'Compiler et replier',
      keys: [
        [`${MOD_KEY} + Entrée`, 'Compiler'],
        [`${MOD_KEY} + Maj + [ / ]`, 'Replier / déplier le bloc'],
      ],
    },
  ]

  // ---------------------------------------------------------------- éditeur

  function currentCode(): string {
    return editorView?.state.doc.toString() ?? ''
  }

  /**
   * Copie de `currentCode()` tenue à jour dans un `$state`, pour les usages
   * du template (Overleaf) qui doivent se recalculer quand le code change.
   * CodeMirror gère son propre état, hors de portée de la réactivité de
   * Svelte : un appel direct à `currentCode()` dans le markup ne serait
   * réévalué qu'une fois, au premier rendu (avant même la création de
   * l'éditeur), et resterait figé sur ce résultat — c'est ainsi qu'Overleaf
   * recevait un document vide.
   */
  let editorCode = $state('')

  /**
   * Édition faite par la vue (régénération) et non par l'utilisateur :
   * l'`updateListener` la verrait sinon comme une frappe et marquerait le
   * code comme modifié à la main.
   */
  let isProgrammaticEdit = false

  /** Remplace le contenu de l'éditeur sans marquer le code comme modifié */
  function setEditorContent(code: string) {
    if (editorView == null) return
    isProgrammaticEdit = true
    try {
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: code },
      })
    } finally {
      isProgrammaticEdit = false
    }
    isEdited = false
    isPreviewStale = true
  }

  function initEditor(content: string) {
    if (editorEl == null) return
    editorView?.destroy()
    editorView = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          ...codeEditorExtensions({
            dark: $darkMode.isActive,
            language: latexLanguage,
            // Ctrl/Cmd + Entrée : réflexe d'éditeur (pas Ctrl/Cmd + S,
            // Safari ouvre sa boîte d'enregistrement de page avant même que
            // l'événement clavier n'atteigne la page)
            onCompileNow: () => void compile(),
          }),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) return
            if (!isProgrammaticEdit) isEdited = true
            isPreviewStale = true
            editorCode = update.state.doc.toString()
          }),
        ],
      }),
      parent: editorEl,
    })
    // la création de l'état initial ne passe pas par l'updateListener
    editorCode = content
  }

  $effect(() => {
    const dark = $darkMode.isActive
    if (editorView != null) setEditorTheme(editorView, dark)
  })

  // ------------------------------------------------------------ génération

  /** Régénère le code LaTeX à partir des exercices et des réglages */
  async function buildCode(): Promise<string> {
    const { latexWithPreamble } = await latex.getFile(latexFileInfos)
    return latexWithPreamble
  }

  /**
   * Régénère le code et le pousse dans l'éditeur. Si le code a été modifié à
   * la main, demande confirmation avant de l'écraser.
   */
  async function regenerateCode(): Promise<boolean> {
    if (
      isEdited &&
      !window.confirm(
        'Le code a été modifié à la main. Le régénérer écrasera ces modifications. Continuer ?',
      )
    ) {
      return false
    }
    setEditorContent(await buildCode())
    return true
  }

  // ----------------------------------------------------------- compilation

  function startElapsed() {
    elapsed = 0
    clearInterval(elapsedTimer)
    elapsedTimer = setInterval(() => (elapsed += 1), 1000)
  }

  function stopElapsed() {
    clearInterval(elapsedTimer)
    elapsedTimer = undefined
  }

  /**
   * Fichiers auxiliaires (images d'annales) attendus par le code compilé.
   * Ils sont déduits des exercices chargés, pas du code affiché : un code
   * modifié à la main peut donc en référencer d'autres, qui manqueront.
   */
  async function auxiliaryFiles(
    signal: AbortSignal,
  ): Promise<TexAuxiliaryFile[]> {
    const urls = [
      ...makeImageFilesUrls(exercises),
      ...getLogoCanUrls(currentCode()),
    ]
    if (urls.length === 0) return []
    return fetchAuxiliaryFiles(urls, signal)
  }

  /**
   * Lit le journal renvoyé par le compilateur : panneau de diagnostics et
   * marqueurs dans la marge de l'éditeur.
   */
  function applyDiagnostics(log: string) {
    diagnostics = log === '' ? [] : parseTexLog(log)
    // le journal brut n'est gardé que si on n'a rien su en tirer
    compileLog = diagnostics.length === 0 ? log : ''
    if (diagnostics.length > 0) isDiagnosticsCollapsed = false
    if (editorView == null) return
    setEditorMarkers(
      editorView,
      diagnostics
        .filter((diagnostic) => diagnostic.line != null)
        .map((diagnostic) => ({
          line: diagnostic.line as number,
          severity: diagnostic.severity,
          message: diagnostic.message,
        })),
    )
  }

  /** Amène le curseur sur la ligne d'un diagnostic */
  function goToDiagnostic(diagnostic: TexDiagnostic) {
    if (editorView == null || diagnostic.line == null) return
    if (displayMode === 'preview') setDisplayMode('split')
    revealPosition(editorView, diagnostic.line)
  }

  /**
   * Rétablit le dernier code ayant produit un PDF. L'opération passe par
   * l'historique de CodeMirror : elle est annulable par Ctrl/Cmd + Z.
   */
  function restoreLastGoodCode() {
    if (editorView == null || lastGoodCode == null) return
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: lastGoodCode,
      },
    })
    editorView.focus()
  }

  /**
   * Compile le code affiché avec le moteur choisi. Si le moteur coopmaths
   * signale un service injoignable (panne réseau, pas une erreur LaTeX), on
   * bascule automatiquement sur texlive.net et on relance la compilation.
   */
  async function compile() {
    if (compileEngine === 'texlive') {
      await compileViaTexlive()
      return
    }
    const unreachable = await compileViaCoopmaths()
    if (unreachable) {
      compileEngine = 'texlive'
      persistPreferences()
      engineSwitchNotice =
        'Le service de compilation Coopmaths est injoignable : bascule automatique sur texlive.net.'
      await compileViaTexlive()
    }
  }

  /**
   * Compile via le service distant de la vue PDF (fetch, PDF en Blob).
   * Renvoie `true` si l'échec est dû à un service injoignable (réseau), pour
   * que `compile` puisse basculer sur l'autre moteur.
   */
  async function compileViaCoopmaths(): Promise<boolean> {
    const source = currentCode()
    if (source.trim() === '') return false
    compileController?.abort()
    const controller = new AbortController()
    compileController = controller

    isCompiling = true
    compileError = null
    engineSwitchNotice = null
    startElapsed()
    try {
      const files = await auxiliaryFiles(controller.signal)
      const result = await compileTexToPdf(source, files, controller.signal)
      if (controller.signal.aborted) return false
      compileError = result.error
      applyDiagnostics(result.log)
      if (result.pdf != null) {
        if (pdfUrl != null) URL.revokeObjectURL(pdfUrl)
        pdfBlob = result.pdf
        pdfUrl = URL.createObjectURL(result.pdf)
        isPreviewStale = false
        lastGoodCode = source
        lastGoodAt = new Date()
      }
      return result.unreachable
    } catch (error) {
      if (!isAbortError(error)) {
        compileError = error instanceof Error ? error.message : String(error)
      }
      return false
    } finally {
      if (compileController === controller) {
        compileController = null
        isCompiling = false
        stopElapsed()
      }
    }
  }

  /**
   * Script Lua déposé à côté du `.tex` pour texlive.net : il reconstruit le
   * PNG du logo CAN à partir de `logoCan.b64`.
   */
  const DECODE_LOGO_LUA = `local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
local f = assert(io.open('logoCan.b64', 'r'))
local data = f:read('*a')
f:close()
local map = {}
for i = 1, #b do map[b:byte(i)] = i - 1 end
local out, acc, bits = {}, 0, 0
for i = 1, #data do
  local v = map[data:byte(i)]
  if v then
    acc = (acc << 6) | v
    bits = bits + 6
    if bits >= 8 then
      bits = bits - 8
      out[#out + 1] = string.char((acc >> bits) & 255)
      acc = acc & ((1 << bits) - 1)
    end
  end
end
local o = assert(io.open('logoCan.png', 'wb'))
o:write(table.concat(out))
o:close()
`

  /**
   * texlive.net corrompt les fichiers binaires (voir `fillTexliveForm`) : le
   * logo CAN (version réduite) voyage en base64, dans un fichier texte, et un
   * script Lua le décode en `logoCan.png` avant `\begin{document}`.
   */
  async function addLogoCanAsText(
    code: string,
    addTextarea: (name: string, value: string) => void,
    addHidden: (name: string, value: string) => void,
  ) {
    let base64 = ''
    try {
      const response = await fetch(
        `${import.meta.env.BASE_URL}images/logoCanPetit.png`,
      )
      if (response.ok) {
        const blob = await response.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(blob)
        })
        base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
      }
    } catch {
      // logo non récupéré : la compilation signalera le fichier manquant
    }
    addTextarea(
      'filecontents[]',
      code.replace(
        '\\begin{document}',
        '\\directlua{dofile("decode_logo_can.lua")}\n\\begin{document}',
      ),
    )
    addHidden('filename[]', 'document.tex')
    addTextarea('filecontents[]', base64)
    addHidden('filename[]', 'logoCan.b64')
    addTextarea('filecontents[]', DECODE_LOGO_LUA)
    addHidden('filename[]', 'decode_logo_can.lua')
  }

  /**
   * Remplit le formulaire caché soumis à texlive.net (`return=pdf`, voir
   * `compileViaTexlive`).
   *
   * Les images sont jointes en texte (`filecontents[]`), comme dans la vue
   * LaTeX historique (`ButtonCompileLatexToPDF.svelte`) : une image binaire
   * (png, jpg) y serait corrompue, seuls les formats textuels (svg, eps)
   * passent correctement. C'est une limite propre à ce moteur, pas une
   * régression introduite ici.
   */
  async function fillTexliveForm(form: HTMLFormElement, target: string) {
    form.innerHTML = ''
    form.action = 'https://texlive.net/cgi-bin/latexcgi'
    form.method = 'POST'
    form.enctype = 'multipart/form-data'
    form.target = target

    const addTextarea = (name: string, value: string) => {
      const textarea = document.createElement('textarea')
      textarea.name = name
      textarea.textContent = value
      form.appendChild(textarea)
    }
    const addHidden = (name: string, value: string) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    }

    const code = currentCode()
    if (getLogoCanUrls(code).length > 0) {
      await addLogoCanAsText(code, addTextarea, addHidden)
    } else {
      addTextarea('filecontents[]', code)
      addHidden('filename[]', 'document.tex')
    }
    for (const url of makeImageFilesUrls(exercises)) {
      const sameOrigin = url.replace(
        'https://coopmaths.fr',
        window.location.origin,
      )
      try {
        const response = await fetch(sameOrigin)
        if (!response.ok) continue
        addTextarea('filecontents[]', await response.text())
        addHidden('filename[]', sameOrigin.split('/').slice(-1)[0])
      } catch {
        // image non récupérée : la compilation la signalera elle-même
      }
    }
    addHidden('engine', 'lualatex')
    addHidden('return', 'pdf')
  }

  /**
   * Compile via texlive.net : une navigation du formulaire caché vers
   * l'aperçu, ciblé par son nom. Ni le PDF ni le journal ne sont
   * récupérables (voir la définition de `CompileEngine`) : l'aperçu affiche
   * directement ce que renvoie texlive.net.
   *
   * `return=pdf` plutôt que `pdfjs` : ce dernier charge le visualiseur
   * complet de texlive.net (barre d'outils avec vignettes de pages, outils
   * d'annotation…), hors de propos ici. `pdf` renvoie le fichier brut, rendu
   * par le lecteur natif du navigateur (même présentation que le moteur
   * coopmaths) — et, faute de PDF produit, le journal de compilation en
   * texte brut, lisible directement dans l'aperçu.
   */
  async function compileViaTexlive() {
    const source = currentCode()
    if (source.trim() === '' || hiddenFormEl == null) return
    isCompiling = true
    compileError = null
    diagnostics = []
    compileLog = ''
    startElapsed()
    await fillTexliveForm(hiddenFormEl, TEXLIVE_PREVIEW_NAME)
    const iframe = previewIframeEl
    const finish = () => {
      isCompiling = false
      stopElapsed()
      isPreviewStale = false
      iframe?.removeEventListener('load', finish)
    }
    iframe?.addEventListener('load', finish)
    hasTexliveResult = true
    hiddenFormEl.submit()
  }

  // ---------------------------------------------------------- préférences

  function persistPreferences() {
    if (!isLocalStorageAvailable()) return
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ displayMode, compileEngine }),
    )
  }

  function restorePreferences() {
    if (!isLocalStorageAvailable()) return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw == null) return
      const saved = JSON.parse(raw) as {
        displayMode?: DisplayMode
        compileEngine?: CompileEngine
      }
      if (
        saved.displayMode === 'code' ||
        saved.displayMode === 'split' ||
        saved.displayMode === 'preview'
      ) {
        displayMode = saved.displayMode
      }
      if (
        saved.compileEngine === 'coopmaths' ||
        saved.compileEngine === 'texlive'
      ) {
        compileEngine = saved.compileEngine
      }
    } catch {
      // préférences illisibles : on garde les valeurs par défaut
    }
  }

  function setDisplayMode(mode: DisplayMode) {
    displayMode = mode
    persistPreferences()
  }

  /** Dernière valeur écrite dans l'URL, pour ne pas la réécrire à l'identique */
  let lastTexParam = ''

  /** Enregistre les réglages du document dans l'URL (paramètre `texParam`) */
  function persistToUrl() {
    // `signal` est un AbortSignal transmis par la vue PDF : non sérialisable
    const { signal: _signal, ...serializable } = latexFileInfos
    const encoded = encodeBase64(serializable)
    // le store est la source de vérité ; on redéclenche ensuite l'écrivain
    // d'URL de l'app pour que sa prochaine écriture (débouncée) reparte de
    // cette valeur et ne réécrive pas l'URL sans texParam (comme la vue Typst)
    texParamStore.set(encoded)
    mathaleaUpdateUrlFromExercicesParams()
    if (encoded === lastTexParam) return
    lastTexParam = encoded
    // l'URL est bloquée dans un iframe (recorder Capytale/Moodle…)
    if (get(freezeUrl)) return
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('texParam', encoded)
      window.history.replaceState(null, '', url)
    } catch {
      // URL non modifiable (iframe sandboxée…) : sans conséquence
    }
  }

  /**
   * Un réglage a changé : on régénère le code et on l'enregistre. La
   * compilation reste manuelle, elle est trop longue pour être déclenchée à
   * chaque case cochée.
   */
  async function applyDocumentOptions() {
    persistToUrl()
    await regenerateCode()
  }

  async function resetDocumentOptions() {
    latexFileInfos = {
      ...defaultFileInfos(),
      style: detectDefaultStyle(exercises),
    }
    await applyDocumentOptions()
  }

  // ----------------------------------------------------- Mes feuilles

  /**
   * Code LaTeX retouché à la main et enregistré avec la feuille d'où vient la
   * fiche : l'URL ne régénère que le code d'origine.
   */
  async function savedSheetCode(): Promise<string | undefined> {
    if (urlSheetId === '' || !isStorageAvailable()) return undefined
    try {
      const library = await loadLibrary()
      return library.sheets.find((sheet) => sheet.id === urlSheetId)?.code
    } catch {
      return undefined
    }
  }

  /**
   * État de la fiche pour « Mes feuilles » : URL qui la régénère (exercices,
   * graines, `texParam`), code s'il a été retouché à la main, et aperçu du PDF.
   * Le PDF est recompilé au besoin pour correspondre au code enregistré ; avec
   * texlive.net, qui ne rend pas le PDF, la feuille n'a pas d'aperçu.
   */
  async function getSheetContent(): Promise<{
    content: SheetContent
    preview?: SheetPreview
  }> {
    persistToUrl()
    if (compileEngine === 'coopmaths' && (isPreviewStale || pdfBlob == null)) {
      await compile()
    }
    const href = mathaleaBuildUrlFromExercicesParams().href
    const hasFreshPdf =
      compileEngine === 'coopmaths' && pdfBlob != null && !isPreviewStale
    return {
      content: {
        query: queryFromUrl(href),
        // référence affichée dans « Mes feuilles », à défaut le titre
        exercises: get(exercicesParams).map(
          (p, i) => p.id ?? exercises[i]?.titre ?? p.uuid,
        ),
        code: isEdited ? currentCode() : undefined,
      },
      preview: hasFreshPdf ? await buildPdfPreview(pdfBlob as Blob) : undefined,
    }
  }

  // ------------------------------------------------------------- exports

  /** Nom de fichier daté, comme la vue PDF */
  function exportFilename(extension: string): string {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}`
    return `mathalea_${date}_${time}.${extension}`
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * La fiche a-t-elle besoin d'images ? Le `.tex` seul serait alors
   * incompilable hors du navigateur : on exporte une archive.
   */
  const needsImages = $derived(
    makeImageFilesUrls(exercises).length > 0 ||
      getLogoCanUrls(editorCode).length > 0,
  )

  /**
   * Fiche telle que l'attendent les exports partagés avec la vue PDF
   * (Overleaf, archive ZIP). Le code est celui de l'éditeur, modifications à
   * la main comprises ; `contents` sert seulement à savoir si des images
   * accompagnent la fiche.
   */
  function currentLatexFile() {
    // `editorCode` (réactif) et non `currentCode()` : cette fonction est
    // appelée depuis le markup (voir `editorCode` pour le pourquoi)
    const code = editorCode
    return {
      contents: {
        preamble: '',
        intro: '',
        content: code,
        contentCorr: '',
      },
      latexWithoutPreamble: code,
      latexWithPreamble: code,
    }
  }

  async function downloadTex() {
    if (needsImages) {
      // les images des annales voyagent à côté du .tex
      await downloadTexWithImagesZip(
        exportFilename('zip').replace(/\.zip$/, ''),
        currentLatexFile(),
        exercises,
      )
      return
    }
    downloadBlob(
      new Blob([currentCode()], { type: 'application/x-tex' }),
      exportFilename('tex'),
    )
  }

  /** Nouvelles graines pour tous les exercices, puis régénération du code */
  async function newDataForAll() {
    if (
      isEdited &&
      !window.confirm(
        'Le code a été modifié à la main. Regénérer la fiche écrasera ces modifications. Continuer ?',
      )
    ) {
      return
    }
    // La régénération d'un exercice laisse Math.random verrouillé sur sa
    // graine : sans ce réamorçage sur de l'entropie réelle, le tirage des
    // nouvelles graines serait déterministe et se figerait au bout de
    // quelques clics (voir `applyNewSeedTo` de la vue Typst).
    seedrandom(undefined, { global: true })
    const params = get(exercicesParams)
    for (const [index, exercise] of exercises.entries()) {
      // les exercices statiques (annales) n'ont pas de graine
      if (exercise == null || !isIExercice(exercise)) continue
      exercise.seed = undefined
      if (typeof exercise.applyNewSeed === 'function') exercise.applyNewSeed()
      if (params[index] != null && exercise.seed !== undefined) {
        params[index].alea = exercise.seed
      }
    }
    exercicesParams.update((list) => list)
    setEditorContent(await buildCode())
    persistToUrl()
  }

  /**
   * Télécharge le PDF.
   *
   * Sur coopmaths, si l'aperçu est déjà à jour (`!isPreviewStale`) et qu'un
   * PDF a déjà été compilé, il n'y a pas de nouvelle compilation : c'est le
   * Blob affiché dans l'aperçu qui est directement enregistré. Une
   * compilation n'est déclenchée que si le code a changé depuis le dernier
   * aperçu, ou qu'aucun PDF n'a encore été produit.
   *
   * Sur texlive.net, il n'y a pas de Blob à enregistrer (voir
   * `CompileEngine`) : un nouvel onglet s'ouvre avec le PDF brut, comme le
   * repli de la vue « à la carte » (`Alacarte.svelte`).
   */
  async function downloadPdf() {
    if (compileEngine === 'texlive') {
      if (hiddenFormEl == null) return
      await fillTexliveForm(hiddenFormEl, '_blank')
      hiddenFormEl.submit()
      statsPdfCreatedTracker('tex')
      return
    }
    if (isPreviewStale || pdfBlob == null) await compile()
    if (pdfBlob != null) {
      downloadBlob(pdfBlob, exportFilename('pdf'))
      statsPdfCreatedTracker('tex')
    }
  }

  // ------------------------------------------------------------ chargement

  async function loadExercises() {
    const interfaceParams = get(exercicesParams)
    interfaceParams.forEach((e) => {
      e.interactif = '0'
    })
    exercises = await mathaleaGetExercicesFromParams(interfaceParams)
    latex.addExercices(exercises.filter((ex) => ex.typeExercice !== 'html'))
  }

  onMount(async () => {
    restorePreferences()
    try {
      await loadExercises()
      // un habillage déjà fixé par l'URL (fiche partagée) n'est pas remplacé
      if (restored.style === undefined) {
        latexFileInfos.style = detectDefaultStyle(exercises)
      }
      const generatedCode = await buildCode()
      const retouchedCode = await savedSheetCode()
      isLoading = false
      // l'éditeur n'existe qu'une fois `isLoading` retombé à faux
      await tick()
      initEditor(retouchedCode ?? generatedCode)
      if (retouchedCode !== undefined) isEdited = true
      persistToUrl()
      await compile()
    } catch (error) {
      console.error('Chargement de la vue LaTeX impossible', error)
      isLoading = false
    }
  })

  onDestroy(() => {
    compileController?.abort()
    stopElapsed()
    editorView?.destroy()
    editorView = null
    if (pdfUrl != null) URL.revokeObjectURL(pdfUrl)
  })
</script>

<svelte:head>
  <title>MathALÉA - LaTeX</title>
</svelte:head>

<main
  class="tex-view {$darkMode.isActive
    ? 'dark'
    : ''} flex flex-col h-screen bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
>
  <textarea
    data-testid="tex-source"
    class="hidden"
    aria-hidden="true"
    tabindex="-1"
    value={editorCode}
  ></textarea>
  <div class="relative z-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <NavBar
      subtitle="LaTeX"
      subtitleType="export"
      handleLanguage={() => {}}
      locale={$referentielLocale}
      showLanguage={!isMobile}
    />
    <div
      class="flex flex-col gap-3 px-4 md:px-8 py-3 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <!-- Ligne 1 : mode d'affichage, réglages, compilation -->
      <div class="flex flex-row flex-wrap items-center gap-x-6 gap-y-3">
        <!-- Sur téléphone, seul l'aperçu est disponible : le sélecteur est masqué -->
        <div
          class="{isMobile
            ? 'hidden'
            : 'flex'} flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
          role="group"
          aria-label="Mode d'affichage"
        >
          {#each [{ mode: 'code', icon: 'bx-code-alt', label: 'Code' }, { mode: 'split', icon: 'bx-columns', label: 'Côte à côte' }, { mode: 'preview', icon: 'bx-file-pdf', label: 'Aperçu' }] as choice}
            <button
              type="button"
              class="flex items-center gap-1 px-3 py-1 text-sm {displayMode ===
              choice.mode
                ? 'bg-coopmaths-action text-coopmaths-canvas dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas'
                : 'text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'}"
              aria-pressed={displayMode === choice.mode}
              onclick={() => setDisplayMode(choice.mode as DisplayMode)}
            >
              <i class="bx {choice.icon} text-lg"></i>
              {choice.label}
            </button>
          {/each}
        </div>

        <button
          type="button"
          title="Réglages du document"
          aria-pressed={isSettingsOpen}
          class="flex items-center gap-1 text-sm {isSettingsOpen
            ? 'text-coopmaths-action font-semibold dark:text-coopmathsdark-action'
            : 'text-coopmaths-action/60 hover:text-coopmaths-action dark:text-coopmathsdark-action/60 dark:hover:text-coopmathsdark-action'}"
          onclick={() => (isSettingsOpen = !isSettingsOpen)}
        >
          <i class="bx bx-cog text-xl"></i>
          Réglages
        </button>

        <button
          type="button"
          title="Compiler le code affiché ({MOD_KEY} + Entrée)"
          class="flex items-center gap-1 text-sm font-semibold text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest disabled:opacity-50"
          disabled={isCompiling}
          onclick={() => void compile()}
        >
          <i
            class="bx {isCompiling
              ? 'bx-loader-alt bx-spin'
              : 'bx-play'} text-xl"
          ></i>
          {isCompiling ? `Compilation… ${elapsed}s` : 'Compiler'}
        </button>

        <button
          type="button"
          title="Nouvelles données aléatoires pour tous les exercices"
          class="flex items-center gap-1 text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
          onclick={() => void newDataForAll()}
        >
          <i class="bx bx-refresh text-xl"></i>
          Nouvelles données
        </button>
      </div>

      <!-- Ligne 2 : PDF, .tex, Overleaf, raccourcis -->
      <div class="flex flex-row flex-wrap items-center gap-3">
        <ButtonTextAction
          text={isCompiling ? 'PDF en cours...' : 'Télécharger le PDF'}
          icon={isCompiling ? 'bx-loader-alt bx-spin' : 'bx-download'}
          inverted={true}
          class="rounded-lg py-1 px-2"
          disabled={isCompiling}
          title={compileEngine === 'coopmaths' &&
          !isPreviewStale &&
          pdfUrl != null
            ? 'Aperçu à jour : enregistre directement le PDF déjà compilé, sans recompiler'
            : ''}
          on:click={downloadPdf}
        />
        <ButtonTextAction
          text={needsImages
            ? 'Télécharger le .tex (.zip)'
            : 'Télécharger le .tex'}
          icon="bx-download"
          inverted={true}
          class="rounded-lg py-1 px-2"
          title={needsImages
            ? 'Archive ZIP contenant le .tex et les images dont il a besoin'
            : ''}
          on:click={() => void downloadTex()}
        />
        <ButtonOverleaf
          class="inline-flex"
          disabled={isLoading}
          exercices={exercises}
          latexFile={currentLatexFile()}
          text="Aller sur Overleaf"
          icon="bx-link-external"
          buttonClass="rounded-lg py-1 px-2 border border-coopmaths-action text-coopmaths-action dark:text-coopmathsdark-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas hover:bg-coopmaths-action dark:hover:bg-coopmathsdark-action hover:text-coopmaths-canvas dark:hover:text-coopmathsdark-canvas"
        />
        {#if !$isInIframe}
          <SaveSheetButton
            kind="tex"
            getContent={getSheetContent}
            defaultName={latexFileInfos.title || 'Fiche LaTeX'}
            disabled={isLoading}
          />
        {/if}
        <button
          type="button"
          title="Signaler un problème"
          aria-label="Signaler un problème"
          class="flex items-center justify-center rounded-lg border border-coopmaths-action py-1 px-2 text-coopmaths-action hover:bg-coopmaths-action hover:text-coopmaths-canvas dark:border-coopmathsdark-action dark:text-coopmathsdark-action dark:hover:bg-coopmathsdark-action dark:hover:text-coopmathsdark-canvas"
          onclick={() => (isBugReportDisplayed = true)}
        >
          <i class="bx bx-bug text-xl"></i>
        </button>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div
      class="flex w-full justify-center items-center py-24 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <i class="bx bx-loader-alt bx-spin text-4xl"></i>
    </div>
  {:else}
    <div class="flex flex-col grow min-h-0">
      <div class="flex flex-row grow min-h-0">
        {#if isSettingsOpen}
          <TexSettingsPane
            bind:latexFileInfos
            bind:compileEngine
            {exercises}
            onChange={() => void applyDocumentOptions()}
            onClose={() => (isSettingsOpen = false)}
            onReset={() => void resetDocumentOptions()}
            onEngineChange={() => {
              engineSwitchNotice = null
              persistPreferences()
            }}
          />
        {/if}
        <div
          class="tex-editor-pane {displayMode === 'code'
            ? 'w-full'
            : displayMode === 'split'
              ? 'w-1/2'
              : 'hidden'} min-h-0"
          bind:this={editorEl}
        ></div>
        <div
          class="tex-preview-pane {displayMode === 'preview'
            ? 'w-full'
            : displayMode === 'split'
              ? 'w-1/2'
              : 'hidden'} min-h-0 flex flex-col"
        >
          <div class="relative grow min-h-0">
            <!-- L'iframe existe toujours (le moteur texlive.net y navigue en
                 la ciblant par son nom, via le formulaire caché ci-dessous) ;
                 seul le moteur coopmaths lui donne un `src` (Blob). Sur
                 coopmaths, recharger le document remet le défilement à
                 zéro : la contrepartie d'une compilation à la demande plutôt
                 qu'à la frappe. -->
            <iframe
              bind:this={previewIframeEl}
              name={TEXLIVE_PREVIEW_NAME}
              src={compileEngine === 'coopmaths' ? pdfUrl : null}
              title="Aperçu de la fiche"
              class="w-full h-full border-0 {showPreview
                ? ''
                : 'hidden'} {isPreviewStale ? 'opacity-50' : ''}"
            ></iframe>
            {#if showPreview && isPreviewStale && !isCompiling}
              <button
                type="button"
                class="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-600 px-3 py-1 text-xs text-white shadow hover:bg-amber-700"
                title="Compiler le code affiché ({MOD_KEY} + Entrée)"
                onclick={() => void compile()}
              >
                Aperçu périmé — Cliquer ici pour recompiler
              </button>
            {/if}
            {#if !showPreview && !isCompiling}
              <div
                class="flex h-full items-center justify-center text-coopmaths-corpus dark:text-coopmathsdark-corpus"
              >
                Aucun PDF généré
              </div>
            {/if}
            {#if isCompiling}
              <div
                class="absolute top-3 right-4 flex items-center gap-2 rounded-full bg-coopmaths-canvas px-3 py-1 text-sm shadow dark:bg-coopmathsdark-canvas text-coopmaths-action dark:text-coopmathsdark-action"
              >
                <i class="bx bx-loader-alt bx-spin text-lg"></i>
                {elapsed}s
              </div>
            {/if}
          </div>
          <!-- Formulaire caché soumis à texlive.net (jamais affiché) -->
          <form bind:this={hiddenFormEl} class="hidden"></form>
        </div>
      </div>

      {#if engineSwitchNotice != null}
        <div
          class="shrink-0 flex items-center gap-2 border-t border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-100"
        >
          <i class="bx bx-transfer-alt text-lg"></i>
          {engineSwitchNotice}
        </div>
      {/if}

      {#if diagnostics.length > 0 || compileError != null}
        {@const isError = errorCount > 0 || compileError != null}
        <div
          data-testid="tex-diagnostics"
          class="shrink-0 border-t {isError
            ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100'
            : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-100'}"
        >
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
            <button
              type="button"
              class="flex items-center gap-2 text-sm font-semibold"
              aria-expanded={!isDiagnosticsCollapsed}
              onclick={() => (isDiagnosticsCollapsed = !isDiagnosticsCollapsed)}
            >
              <i class="bx {isError ? 'bx-error-circle' : 'bx-error'} text-xl"
              ></i>
              {isError
                ? 'La fiche ne compile pas'
                : 'La fiche compile avec des remarques'}
              {#if diagnostics.length > 0}
                <span class="font-normal opacity-80">
                  ({diagnosticsSummary})
                </span>
              {/if}
              <i
                class="bx {isDiagnosticsCollapsed
                  ? 'bx-chevron-up'
                  : 'bx-chevron-down'} text-xl"
              ></i>
            </button>

            <div class="grow"></div>

            {#if isPreviewStale && pdfUrl != null}
              <span class="text-xs opacity-80">
                <i class="bx bx-time-five"></i>
                L’aperçu ci-dessus est celui de la dernière compilation réussie{lastGoodAt !=
                null
                  ? ` (${lastGoodAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`
                  : ''}.
              </span>
            {/if}

            {#if isError && canRestoreLastGood}
              <button
                type="button"
                data-testid="tex-restore-last-good"
                class="flex items-center gap-1 rounded-lg border border-current px-2 py-1 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/60"
                title="Remplace le code par la dernière version qui compilait. Annulable avec Ctrl/Cmd + Z."
                onclick={restoreLastGoodCode}
              >
                <i class="bx bx-undo text-lg"></i>
                <span>Revenir à la dernière version qui compilait</span>
              </button>
            {/if}
          </div>

          {#if !isDiagnosticsCollapsed}
            <ul class="max-h-52 overflow-auto px-4 pb-3 space-y-1.5">
              {#if compileError != null}
                <li
                  class="rounded border-l-4 border-red-500 bg-white/60 px-3 py-2 text-sm dark:bg-black/25"
                >
                  {compileError}
                </li>
              {/if}
              {#each diagnostics as diagnostic}
                <li
                  class="rounded border-l-4 {diagnostic.severity === 'error'
                    ? 'border-red-500'
                    : 'border-amber-500'} bg-white/60 px-3 py-2 dark:bg-black/25"
                >
                  <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    {#if diagnostic.line != null}
                      <button
                        type="button"
                        class="shrink-0 rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs hover:bg-black/20 dark:bg-white/15 dark:hover:bg-white/25"
                        title="Aller à cette ligne dans l’éditeur"
                        onclick={() => goToDiagnostic(diagnostic)}
                      >
                        ligne {diagnostic.line}
                      </button>
                    {/if}
                    <span class="text-sm">{diagnostic.message}</span>
                  </div>
                  {#if diagnostic.hint != null}
                    <p class="mt-1 text-xs opacity-90">
                      <i class="bx bx-bulb"></i>
                      {diagnostic.hint}
                    </p>
                  {/if}
                  {#if diagnostic.message !== diagnostic.raw}
                    <details class="mt-1 text-xs opacity-70">
                      <summary class="cursor-pointer">Message d’origine</summary
                      >
                      <code class="font-mono break-all">{diagnostic.raw}</code>
                    </details>
                  {/if}
                </li>
              {/each}
              {#if compileLog !== ''}
                <li class="rounded bg-white/60 px-3 py-2 dark:bg-black/25">
                  <details class="text-xs">
                    <summary class="cursor-pointer">
                      Journal de compilation
                    </summary>
                    <pre
                      class="mt-1 max-h-40 overflow-auto whitespace-pre-wrap font-mono">{compileLog}</pre>
                  </details>
                </li>
              {/if}
            </ul>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if isBugReportDisplayed}
    <BugReportModal
      bind:isDisplayed={isBugReportDisplayed}
      titleOverride="Bug dans la création du PDF (LaTeX)"
    />
  {/if}

  {#if $texShortcutsOpen}
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) $texShortcutsOpen = false
      }}
    >
      <div
        class="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-coopmaths-canvas-dark p-5 shadow-xl dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2
            class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Raccourcis clavier de l’éditeur
          </h2>
          <button
            type="button"
            aria-label="Fermer"
            onclick={() => ($texShortcutsOpen = false)}
          >
            <i
              class="bx bx-x text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
            ></i>
          </button>
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          {#each EDITOR_SHORTCUTS as group}
            <div>
              <h3
                class="mb-1.5 text-sm font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
              >
                {group.title}
              </h3>
              <dl class="space-y-1 text-sm">
                {#each group.keys as [keys, label]}
                  <div class="flex items-baseline justify-between gap-3">
                    <dd class="opacity-90">{label}</dd>
                    <dt
                      class="shrink-0 rounded border border-current/30 bg-black/5 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10"
                    >
                      {keys}
                    </dt>
                  </div>
                {/each}
              </dl>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</main>
