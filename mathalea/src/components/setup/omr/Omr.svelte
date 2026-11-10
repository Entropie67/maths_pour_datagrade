<script lang="ts">
  import OmrReview from './OmrReview.svelte'
  import SaveSheetButton from '../mesFeuilles/SaveSheetButton.svelte'
  import { loadLibrary } from '../../../lib/mesFeuilles/storage'
  import {
    queryFromUrl,
    sheetKind,
    type SheetContent,
  } from '../../../lib/mesFeuilles/library'
  import { buildPreview } from '../../../lib/mesFeuilles/preview'
  import {
    readOmrSavedState,
    saveScan,
    restoreScan,
    type OmrReviewView,
  } from '../../../lib/omr/omrSavedState'
  import { mathaleaBuildUrlFromExercicesParams } from '../../../lib/mathalea'
  import {
    currentSheetStore,
    previousSheetStore,
  } from '../../../lib/stores/generalStore'
  import OmrDocumentTextOverlay from './OmrDocumentTextOverlay.svelte'
  import { EditorState } from '@codemirror/state'
  import { EditorView } from '@codemirror/view'
  import seedrandom from 'seedrandom'
  import { onDestroy, onMount, untrack } from 'svelte'
  import { get } from 'svelte/store'
  import { applyExerciceSettings } from '../../../lib/components/exerciceSettings'
  import { buildExercise } from '../../../lib/components/exercisesUtils'
  import { getExercisesFromExercicesParams } from '../../../lib/mathalea'
  import type { ResultatAnalyse } from '../../../lib/omr/analyseScan'
  import {
    assemblerGabarit,
    defaultOmrDocumentOptions,
    type OmrCarryOver,
    type OmrDocumentOptions,
    type OmrDocumentSource,
    type OmrExerciceSource,
  } from '../../../lib/omr/buildOmrDocument'
  import {
    decalerOmrCarryOver,
    echangerOmrCarryOver,
    harvestOmrCarryOver,
    lireReglage,
    nombreExercicesDeclares,
    omrSnippetTexte,
    OMR_SAUT_DE_PAGE,
    remplacerInsertions,
    remplacerReglage,
  } from '../../../lib/omr/omrCarryOver'
  import {
    compilerApercu,
    compilerEvaluation,
    decrireDocument,
    lireFichierEvaluation,
    lireListeDeClasse,
    telechargerEvaluation,
    type EleveSource,
  } from '../../../lib/omr/genererEvaluation'
  import { telechargerBilan } from '../../../lib/omr/omrExport'
  import { preparerExercices } from '../../../lib/omr/omrPreparation'
  import {
    exercicesDepuisExercices,
    type ExercicePourOmr,
  } from '../../../lib/omr/omrQuestions'
  import type { OmrEvaluation } from '../../../lib/omr/omrTypes'
  import { analyserFichier } from '../../../lib/omr/omrWorkerClient'
  import { darkMode, exercicesParams } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import { isLocalStorageAvailable } from '../../../lib/stores/storage'
  import type { IExercice, InterfaceParams } from '../../../lib/types'
  import NavBar from '../../shared/header/NavBar.svelte'
  import Settings from '../../shared/exercice/exerciceMathalea/exerciceMathaleaVueProf/presentationalComponents/Settings.svelte'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import ExportViewLinks from '../shared/ExportViewLinks.svelte'
  import {
    codeEditorExtensions,
    setEditorTheme,
  } from '../shared/editor/editorSetup'
  import {
    anchorPosition,
    separatePages,
    type PreviewPageGeometry,
  } from '../shared/typstPreview'
  import {
    HEADER_STYLES,
    MATH_FONTS,
    TEXT_FONTS,
  } from '../typst/buildTypstDocument'
  import TypstAddExerciseModal from '../typst/addExercise/TypstAddExerciseModal.svelte'
  import { typstLanguage } from '../typst/editor/typstLanguage'
  import type { TypstAnchor } from '../typst/typstCompiler'

  /**
   * Évaluation papier à lecture optique : produire les sujets, dépouiller les
   * copies scannées, exporter le bilan. Tout se passe dans le navigateur ;
   * ni les copies, ni la liste de classe ne sont transmises où que ce soit.
   *
   * L'étape « Générer » reprend la coque des autres exports Typst — barre
   * d'outils, volet de réglages, palette de mise en page sur l'aperçu. Une
   * seule chose y est délibérément absente : l'édition du code d'un exercice.
   * Les énoncés et leurs cases sont générés, jamais retouchés à la main ;
   * autrement le corrigé ne décrirait plus le sujet imprimé.
   */

  type Onglet = 'generer' | 'analyser' | 'bilan'
  type DisplayMode = 'code' | 'split' | 'preview'
  const STORAGE_KEY = 'mathaleaOmrView'

  const urlSheetId =
    new URL(window.location.href).searchParams.get('feuille') ?? ''
  if (get(currentSheetStore)) previousSheetStore.set(get(currentSheetStore))
  currentSheetStore.set(urlSheetId)
  let review: OmrReviewView = $state({
    selection: '',
    rang: 1,
    seulementAVerifier: false,
    zoom: 100,
  })

  let onglet: Onglet = $state('generer')
  let displayMode: DisplayMode = $state('preview')
  let documentOptions: OmrDocumentOptions = $state({
    ...defaultOmrDocumentOptions,
  })
  let isSettingsOpen = $state(true)
  let isAddExerciseOpen = $state(false)
  /** Affiche sur l'aperçu les pastilles de mise en page */
  let showOverlay = $state(true)

  if (isLocalStorageAvailable()) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved != null) {
        const parsed = JSON.parse(saved)
        if (['code', 'split', 'preview'].includes(parsed.displayMode)) {
          displayMode = parsed.displayMode
        }
        if (typeof parsed.showOverlay === 'boolean') {
          showOverlay = parsed.showOverlay
        }
        if (parsed.documentOptions != null) {
          documentOptions = {
            ...defaultOmrDocumentOptions,
            ...parsed.documentOptions,
          }
        }
      }
    } catch {
      // préférences illisibles : on garde les valeurs par défaut
    }
  }

  function persistPreferences() {
    if (!isLocalStorageAvailable()) return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          displayMode,
          documentOptions: $state.snapshot(documentOptions),
          showOverlay,
        }),
      )
    } catch {
      // stockage plein ou indisponible : sans conséquence
    }
  }

  function setDisplayMode(mode: DisplayMode) {
    displayMode = mode
    persistPreferences()
  }

  // ─── Le sujet ─────────────────────────────────────────────────────────────
  let titre = $state($globalOptions.title || 'Évaluation')
  let listeCollee = $state('')
  let consigne = $state('')
  /** Vrai : toute la classe compose le même sujet. Faux : une graine par élève. */
  let grainePartagee = $state(true)
  /**
   * Graine servant à la fois d'empreinte du sujet et de préfixe des graines
   * par élève : la fixer permet de régénérer exactement les mêmes sujets.
   */
  let graineDeBase = $state(String(Date.now()))

  const eleves = $derived(lireListeDeClasse(listeCollee))
  /** Élève affiché tant que la liste de classe est vide */
  const ELEVE_EXEMPLE: EleveSource = { id: 'e01', nom: 'Élève exemple' }
  const elevesApercu = $derived(eleves.length > 0 ? eleves : [ELEVE_EXEMPLE])
  let indexApercu = $state(0)

  let isLoading = $state(true)
  let messageGeneration = $state('')
  /**
   * Exercices chargés **une seule fois**. Les regénérer par élève ne demande
   * ensuite qu'une passe de `preparerExercices` : recharger le référentiel à
   * chaque graine coûterait trente allers-retours pour une classe entière.
   */
  let exercicesCharges: IExercice[] = []
  let nbQuestions = $state(0)

  function messageDErreur(erreur: unknown): string {
    return erreur instanceof Error ? erreur.message : String(erreur)
  }

  /**
   * Regénère les exercices chargés, éventuellement sur une graine imposée.
   *
   * `figures` recueille les figures SVG rencontrées en convertissant les
   * énoncés : `htmlToTypst` les numérote (`fig-1`, `fig-2`…) et attend qu'on
   * les déclare. Sans ce tableau, elle rendrait un encart « figure non
   * convertie » à leur place.
   */
  function exercicesPour(seedOverride?: string): {
    exercices: OmrExerciceSource[]
    figures: string[]
  } {
    preparerExercices(exercicesCharges, seedOverride)
    const figures: string[] = []
    const exercices = exercicesDepuisExercices(
      exercicesCharges as unknown as ExercicePourOmr[],
      figures,
    )
    return { exercices, figures }
  }

  /** Décrit le document pour les élèves donnés (l'aperçu n'en passe qu'un). */
  function construireSource(cibles: readonly EleveSource[]): OmrDocumentSource {
    const communs = grainePartagee
      ? exercicesPour()
      : { exercices: [] as OmrExerciceSource[], figures: [] as string[] }
    const parEleve = grainePartagee
      ? cibles.map(() => communs)
      : cibles.map((eleve) => exercicesPour(`${graineDeBase}-${eleve.id}`))
    const source = decrireDocument(
      titre,
      graineDeBase,
      cibles,
      communs.exercices,
      consigne,
      grainePartagee ? undefined : parEleve.map((tout) => tout.exercices),
    )
    // chaque copie déclare ses propres figures : le `#let` posé dans son bloc
    // de contenu y reste local, deux copies peuvent donc avoir leur `fig-1`
    for (const [index, copie] of source.copies.entries()) {
      copie.figures = parEleve[index]?.figures ?? communs.figures
    }
    return source
  }

  // ─── Gabarit et aperçu ────────────────────────────────────────────────────
  let sourceApercu = $state<OmrDocumentSource | null>(null)
  /** Code commun à toutes les copies, seul code que le professeur peut éditer */
  let gabarit = $state('')
  let svgContent = $state('')
  let previewPages: PreviewPageGeometry[] = $state([])
  let previewViewBox = $state({ width: 0, height: 0 })
  let anchors: TypstAnchor[] = $state([])
  let diagnostics: string[] = $state([])
  let isCompiling = $state(false)
  let telechargement = $state<'inactif' | 'encours' | 'fait'>('inactif')

  let editeurEl = $state<HTMLDivElement>()
  let editorView: EditorView | null = null
  let compileTimer: ReturnType<typeof setTimeout> | undefined
  let compileToken = 0

  /** Pose le gabarit, dans l'état comme dans l'éditeur s'il est ouvert. */
  function definirGabarit(nouveau: string) {
    gabarit = nouveau
    if (editorView != null && editorView.state.doc.toString() !== nouveau) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: nouveau,
        },
      })
    }
  }

  /**
   * Regénère la copie affichée et son gabarit.
   *
   * @param garderMiseEnPage relit les réglages faits à la palette pour les
   *   réappliquer : un changement de police ne doit pas défaire les colonnes
   */
  function reconstruire(garderMiseEnPage = true) {
    if (elevesApercu.length === 0) return
    const cible = elevesApercu[Math.min(indexApercu, elevesApercu.length - 1)]
    try {
      const source = construireSource([cible])
      sourceApercu = source
      nbQuestions = source.copies[0].exercices.reduce(
        (total, exercice) => total + exercice.questions.length,
        0,
      )
      const carryOver = garderMiseEnPage ? harvestOmrCarryOver(gabarit) : {}
      definirGabarit(
        assemblerGabarit(source, $state.snapshot(documentOptions), carryOver)
          .gabarit,
      )
      messageGeneration = ''
      planifierCompilation(0)
    } catch (erreur) {
      messageGeneration = messageDErreur(erreur)
    }
  }

  /** Regénère après un changement de réglage du volet. */
  function appliquerReglages() {
    persistPreferences()
    reconstruire()
  }

  function planifierCompilation(delai = 400) {
    clearTimeout(compileTimer)
    compileTimer = setTimeout(() => void compiler(), delai)
  }

  async function compiler() {
    if (sourceApercu == null) return
    const token = ++compileToken
    isCompiling = true
    try {
      const resultat = await compilerApercu(
        gabarit,
        sourceApercu,
        sourceApercu.copies[0]?.copieId ?? '',
        $state.snapshot(documentOptions),
      )
      if (token !== compileToken) return
      diagnostics = resultat.diagnostics
      if (resultat.svg != null) {
        // on garde le dernier aperçu qui a compilé : une frappe en cours ne
        // doit pas effacer l'image sous les yeux du professeur
        const separated = separatePages(resultat.svg)
        svgContent = separated.svg
        previewPages = separated.pages
        previewViewBox = separated.viewBox
        anchors = resultat.anchors ?? []
      }
    } catch (erreur) {
      if (token !== compileToken) return
      diagnostics = [`La compilation a échoué : ${messageDErreur(erreur)}`]
    } finally {
      if (token === compileToken) isCompiling = false
    }
  }

  onMount(async () => {
    try {
      const sheet = urlSheetId
        ? (await loadLibrary()).sheets.find(
            (s) => s.id === urlSheetId && sheetKind(s) === 'omr',
          )
        : undefined
      const saved =
        sheet?.omr === undefined ? null : readOmrSavedState(sheet.omr)
      if (saved) {
        // Restaurer avant toute génération : aucune graine ni retouche n'est remplacée.
        titre = saved.titre
        listeCollee = saved.listeCollee
        consigne = saved.consigne
        grainePartagee = saved.grainePartagee
        graineDeBase = saved.graineDeBase
        documentOptions = {
          ...defaultOmrDocumentOptions,
          ...saved.documentOptions,
        }
        indexApercu = saved.indexApercu
        onglet = saved.onglet
        displayMode = saved.displayMode
        showOverlay = saved.showOverlay
        isSettingsOpen = saved.isSettingsOpen
        evaluation =
          saved.evaluation === null
            ? null
            : lireFichierEvaluation(JSON.stringify(saved.evaluation))
        resultat = saved.resultat
        fichierScan = restoreScan(saved.scan)
        review = saved.review
        analyse = resultat ? 'fait' : 'inactif'
      }
      exercicesCharges = await getExercisesFromExercicesParams()
      reconstruire(false)
      if (saved) {
        definirGabarit(saved.gabarit)
        planifierCompilation(0)
      }
    } catch (erreur) {
      messageGeneration = messageDErreur(erreur)
    } finally {
      isLoading = false
    }
  })

  onDestroy(() => {
    clearTimeout(compileTimer)
    editorView?.destroy()
    editorView = null
  })

  /** L'éditeur n'existe que dans les modes qui l'affichent. */
  $effect(() => {
    if (editeurEl != null && editorView == null) {
      const cible = editeurEl
      untrack(() => {
        editorView = new EditorView({
          state: EditorState.create({
            doc: gabarit,
            extensions: [
              ...codeEditorExtensions({
                dark: $darkMode.isActive,
                language: typstLanguage,
                onCompileNow: () => planifierCompilation(0),
              }),
              EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                  gabarit = update.state.doc.toString()
                  planifierCompilation()
                }
              }),
            ],
          }),
          parent: cible,
        })
      })
    } else if (editeurEl == null && editorView != null) {
      editorView.destroy()
      editorView = null
    }
  })

  // l'éditeur suit le thème clair/sombre de l'application
  $effect(() => {
    const dark = $darkMode.isActive
    if (editorView != null) setEditorTheme(editorView, dark)
  })

  // ─── Palette de mise en page ──────────────────────────────────────────────
  const widgetsExercice = $derived(
    anchors.flatMap((anchor) => {
      if (anchor.kind !== 'exo') return []
      const position = anchorPosition(anchor, previewPages, previewViewBox)
      return position == null ? [] : [{ num: anchor.num, ...position }]
    }),
  )

  const widgetsTexteDocument = $derived(
    anchors.flatMap((anchor) => {
      if (
        anchor.page !== 1 ||
        (anchor.kind !== 'header' && anchor.kind !== 'footer')
      )
        return []
      const position = anchorPosition(anchor, previewPages, previewViewBox)
      return position == null ? [] : [{ kind: anchor.kind, ...position }]
    }),
  )

  const widgetsInsertion = $derived(
    anchors.flatMap((anchor) => {
      if (anchor.kind !== 'gap') return []
      const position = anchorPosition(anchor, previewPages, previewViewBox)
      return position == null ? [] : [{ num: anchor.num, ...position }]
    }),
  )

  const insertions = $derived(harvestOmrCarryOver(gabarit).insertions ?? {})

  const LIBELLE_INSERTION: Record<string, string> = {
    [OMR_SAUT_DE_PAGE]: 'saut de page',
  }

  function decrireInsertion(fragment: string): string {
    return (
      LIBELLE_INSERTION[fragment] ??
      fragment.match(/"((?:[^"\\]|\\.)*)"\)\)$/)?.[1] ??
      'insertion'
    )
  }

  function colonnesDe(num: number): number {
    return Number(lireReglage(gabarit, num, 'colonnes') ?? '1') || 1
  }

  function espacementDe(num: number): number {
    const brut = lireReglage(gabarit, num, 'gutter') ?? '1.2em'
    return Number.parseFloat(brut) || 1.2
  }

  function ajusterColonnes(num: number, delta: number) {
    // au-delà de 4 colonnes, une question à cases n'a plus la place de tenir
    const suivant = Math.min(4, Math.max(1, colonnesDe(num) + delta))
    definirGabarit(remplacerReglage(gabarit, num, 'colonnes', String(suivant)))
    planifierCompilation(0)
  }

  function ajusterEspacement(num: number, delta: number) {
    const suivant = Math.min(
      6,
      Math.max(0.4, Math.round((espacementDe(num) + delta * 0.4) * 10) / 10),
    )
    definirGabarit(remplacerReglage(gabarit, num, 'gutter', `${suivant}em`))
    planifierCompilation(0)
  }

  function ajouterInsertion(num: number, fragment: string) {
    const actuelles = insertions[num] ?? []
    definirGabarit(remplacerInsertions(gabarit, num, [...actuelles, fragment]))
    planifierCompilation(0)
  }

  function ajouterTexte(num: number) {
    const saisi = window.prompt('Texte à insérer (titre de partie, consigne…)')
    if (saisi == null || saisi.trim() === '') return
    ajouterInsertion(num, omrSnippetTexte(saisi.trim()))
  }

  function supprimerInsertion(num: number, index: number) {
    const actuelles = [...(insertions[num] ?? [])]
    actuelles.splice(index, 1)
    definirGabarit(remplacerInsertions(gabarit, num, actuelles))
    planifierCompilation(0)
  }

  /** Le saut de page est une bascule, comme dans la vue « Impression ». */
  function basculerSautDePage(num: number) {
    const actuelles = insertions[num] ?? []
    const suivantes = actuelles.includes(OMR_SAUT_DE_PAGE)
      ? actuelles.filter((fragment) => fragment !== OMR_SAUT_DE_PAGE)
      : [...actuelles, OMR_SAUT_DE_PAGE]
    definirGabarit(remplacerInsertions(gabarit, num, suivantes))
    planifierCompilation(0)
  }

  /** Nombre d'exercices du sujet, pour borner les déplacements. */
  const nbExercices = $derived(sourceApercu?.copies[0]?.exercices.length ?? 0)

  /** Nombre de questions réglable d'un exercice, `null` s'il n'en a pas. */
  function nombreDeQuestions(num: number): number | null {
    return exercicesCharges[num - 1]?.nbQuestions ?? null
  }

  /** Nouvelle graine de base : toute la classe change de version */
  function nouvellesDonnees() {
    graineDeBase = String(Date.now())
    reconstruire()
  }

  function reinitialiserMiseEnPage() {
    documentOptions = { ...defaultOmrDocumentOptions }
    persistPreferences()
    reconstruire(false)
  }

  // ─── La liste d'exercices, réglée depuis la palette ───────────────────────
  //
  // Ces actions touchent `exercicesParams`, le store que partagent toutes les
  // vues : ce sont bien les exercices de la fiche qu'on déplace ou supprime,
  // pas une copie locale. Le gabarit est ensuite régénéré avec ses réglages
  // renumérotés (`decalerOmrCarryOver`), sans quoi les colonnes de l'exercice 2
  // se retrouveraient sur l'exercice 3.

  /** Régénère après une modification de la liste, réglages décalés. */
  function reconstruireAvec(carryOver: OmrCarryOver) {
    const cible = elevesApercu[Math.min(indexApercu, elevesApercu.length - 1)]
    const source = construireSource([cible])
    sourceApercu = source
    definirGabarit(
      assemblerGabarit(source, $state.snapshot(documentOptions), carryOver)
        .gabarit,
    )
    planifierCompilation(0)
  }

  function deplacerExercice(num: number, delta: -1 | 1) {
    const k = num - 1
    const cible = k + delta
    if (cible < 0 || cible >= exercicesCharges.length) return
    const carryOver = echangerOmrCarryOver(
      harvestOmrCarryOver(gabarit),
      num,
      cible + 1,
    )
    ;[exercicesCharges[k], exercicesCharges[cible]] = [
      exercicesCharges[cible],
      exercicesCharges[k],
    ]
    exercicesParams.update((liste) => {
      const copie = [...liste]
      ;[copie[k], copie[cible]] = [copie[cible], copie[k]]
      return copie
    })
    reconstruireAvec(carryOver)
  }

  /** Ajouter depuis le même catalogue que la vue « Impression ». */
  async function ajouterExercice(params: InterfaceParams) {
    try {
      const exercice = await buildExercise(params)
      exercicesCharges = [...exercicesCharges, exercice]
      exercicesParams.update((liste) => [...liste, params])
      reconstruire()
    } catch (erreur) {
      messageGeneration = messageDErreur(erreur)
    }
  }

  async function dupliquerExercice(num: number) {
    const params = get(exercicesParams)[num - 1]
    if (params == null) return
    const carryOver = decalerOmrCarryOver(harvestOmrCarryOver(gabarit), {
      insere: num + 1,
    })
    const copie: InterfaceParams = structuredClone($state.snapshot(params))
    try {
      const exercice = await buildExercise(copie)
      exercicesCharges = [
        ...exercicesCharges.slice(0, num),
        exercice,
        ...exercicesCharges.slice(num),
      ]
      exercicesParams.update((liste) => [
        ...liste.slice(0, num),
        copie,
        ...liste.slice(num),
      ])
      reconstruireAvec(carryOver)
    } catch (erreur) {
      messageGeneration = messageDErreur(erreur)
    }
  }

  function supprimerExercice(num: number) {
    if (exercicesCharges.length <= 1) return
    if (!window.confirm(`Supprimer l'exercice ${num} du sujet ?`)) return
    const carryOver = decalerOmrCarryOver(harvestOmrCarryOver(gabarit), {
      retire: num,
    })
    const exercice = exercicesCharges[num - 1]
    exercice?.reinit?.()
    exercice?.destroy?.()
    exercicesCharges = exercicesCharges.filter((_, k) => k !== num - 1)
    exercicesParams.update((liste) => liste.filter((_, k) => k !== num - 1))
    reconstruireAvec(carryOver)
  }

  function changerNombreDeQuestions(num: number, delta: number) {
    const exercice = exercicesCharges[num - 1]
    if (exercice?.nbQuestions == null) return
    const suivant = Math.max(1, exercice.nbQuestions + delta)
    if (suivant === exercice.nbQuestions) return
    exercice.nbQuestions = suivant
    const params = get(exercicesParams)[num - 1]
    if (params != null) params.nbQuestions = suivant
    exercicesParams.update((liste) => liste)
    reconstruire()
  }

  /**
   * Nouvelle graine pour un seul exercice.
   *
   * `preparerExercices` a laissé `Math.random` verrouillé sur la graine du
   * dernier exercice généré : sans ce réamorçage sur de l'entropie réelle, le
   * tirage serait déterministe et se figerait au bout de quelques clics.
   */
  function nouvellesDonneesExercice(num: number) {
    const exercice = exercicesCharges[num - 1]
    if (exercice == null) return
    seedrandom(undefined, { global: true })
    exercice.seed = undefined
    exercice.applyNewSeed?.()
    const params = get(exercicesParams)[num - 1]
    if (params != null && exercice.seed !== undefined) {
      params.alea = exercice.seed
    }
    exercicesParams.update((liste) => liste)
    reconstruire()
  }

  let indexReglages = $state<number | null>(null)
  const exerciceReglages = $derived(
    indexReglages === null ? null : (exercicesCharges[indexReglages] ?? null),
  )

  function appliquerReglagesExercice(
    k: number,
    detail: Record<string, unknown>,
  ) {
    const exercice = exercicesCharges[k]
    const params = get(exercicesParams)[k]
    if (exercice == null || params == null) return
    applyExerciceSettings(exercice, params, detail)
    exercicesParams.update((liste) => liste)
    reconstruire()
  }

  // ─── Téléchargement ───────────────────────────────────────────────────────
  async function telechargerTout() {
    if (eleves.length === 0) return
    messageGeneration = ''
    telechargement = 'encours'
    try {
      const source = construireSource(eleves)
      const nbExercices = Math.max(
        0,
        ...source.copies.map((copie) => copie.exercices.length),
      )
      // le gabarit de l'aperçu ne décrit qu'une copie : si la version d'un
      // élève compte un exercice de plus, ses variables de mise en page y
      // manquent. Plutôt que d'échouer à la compilation, on le regénère en
      // reprenant les réglages faits à la palette.
      const gabaritFinal =
        nombreExercicesDeclares(gabarit) < nbExercices
          ? assemblerGabarit(
              source,
              $state.snapshot(documentOptions),
              harvestOmrCarryOver(gabarit),
            ).gabarit
          : gabarit
      const generee = await compilerEvaluation(
        gabaritFinal,
        source,
        {
          titre,
          checkSum: source.sujetId,
          exercicesParams: $exercicesParams,
        },
        $state.snapshot(documentOptions),
      )
      await telechargerEvaluation(generee)
      resultat = null
      evaluation = generee.evaluation
      telechargement = 'fait'
    } catch (erreur) {
      messageGeneration = messageDErreur(erreur)
      telechargement = 'inactif'
    }
  }

  // ─── Analyse ──────────────────────────────────────────────────────────────
  let evaluation = $state<OmrEvaluation | null>(null)
  let fichierScan = $state<File | null>(null)
  let analyse = $state<'inactif' | 'encours' | 'fait'>('inactif')
  let progression = $state({ page: 0, total: 0 })
  let messageAnalyse = $state('')
  let resultat = $state<ResultatAnalyse | null>(null)

  async function getSavedContent(): Promise<{
    content: SheetContent
    preview?: import('../../../lib/mesFeuilles/library').SheetPreview
  }> {
    // Photographier l'état avant la lecture asynchrone du PDF.
    const state = $state.snapshot({
      version: 1 as const,
      titre,
      listeCollee,
      consigne,
      grainePartagee,
      graineDeBase,
      documentOptions,
      gabarit,
      indexApercu,
      onglet,
      displayMode,
      showOverlay,
      isSettingsOpen,
      evaluation,
      resultat,
      review,
    })
    const url = mathaleaBuildUrlFromExercicesParams()
    url.searchParams.set('v', 'omr')
    url.searchParams.set('beta', '1')
    return {
      content: {
        query: queryFromUrl(url.href),
        exercises: $exercicesParams.map((p) => p.id ?? p.uuid),
        omr: { ...state, scan: await saveScan(fichierScan) },
      },
      preview: buildPreview(svgContent, previewPages),
    }
  }

  async function reprendreCorrection(evenement: Event) {
    const fichier = (evenement.target as HTMLInputElement).files?.[0]
    if (!fichier || !fichierScan || analyse === 'encours') {
      messageAnalyse =
        'Choisir le PDF scanné avant de reprendre une correction.'
      return
    }
    try {
      const { lireSession } = await import('../../../lib/omr/omrSession')
      const session = await lireSession(await fichier.text(), fichierScan)
      evaluation = session.evaluation
      resultat = session.resultat
      messageAnalyse = ''
      onglet = 'bilan'
    } catch (erreur) {
      messageAnalyse = messageDErreur(erreur)
    }
  }

  async function chargerAccompagnement(evenement: Event) {
    const fichier = (evenement.target as HTMLInputElement).files?.[0]
    if (fichier == null) return
    messageAnalyse = ''
    try {
      evaluation = lireFichierEvaluation(await fichier.text())
      resultat = null
    } catch (erreur) {
      messageAnalyse = messageDErreur(erreur)
    }
  }

  function choisirScan(evenement: Event) {
    resultat = null
    fichierScan = (evenement.target as HTMLInputElement).files?.[0] ?? null
  }

  async function lancerAnalyse() {
    if (evaluation == null || fichierScan == null || analyse === 'encours')
      return
    messageAnalyse = ''
    analyse = 'encours'
    const evaluationAnalysee = evaluation
    const scanAnalyse = fichierScan
    try {
      const nouveauResultat = await analyserFichier(
        scanAnalyse,
        evaluationAnalysee,
        {
          onProgress: (page, total) => {
            progression = { page, total }
          },
        },
      )
      if (evaluation !== evaluationAnalysee || fichierScan !== scanAnalyse) {
        analyse = 'inactif'
        return
      }
      resultat = nouveauResultat
      analyse = 'fait'
      onglet = 'bilan'
    } catch (erreur) {
      messageAnalyse = messageDErreur(erreur)
      analyse = 'inactif'
    }
  }

  const anomalies = $derived(
    resultat == null
      ? []
      : resultat.pages.filter((page) => page.statut !== 'ok'),
  )

  const LIBELLE_PAGE: Record<string, string> = {
    doublon: 'page en double (non utilisée)',
    ecartee: 'page écartée de la correction',
    qrIllisible: 'QR-code illisible',
    copieInconnue: 'copie absente du fichier d’accompagnement',
    pageInattendue: 'page inattendue pour cette copie',
    recalageEchoue: 'repères de calage introuvables',
  }

  const LIBELLE_QUESTION: Record<string, string> = {
    lu: '',
    ambigu: 'à vérifier',
    sansReponse: '—',
    multiple: 'plusieurs cases',
    pageManquante: 'page absente',
  }

  const LIBELLE_ENTETE: Record<string, string> = {
    epure: 'Épuré',
    cartouche: 'Cartouche',
    cadre: 'Encadré',
    aucun: 'Sans titre',
  }

  /**
   * Polices servies par MathALÉA qui n'existent qu'en graisse normale.
   *
   * Typst ne synthétise pas le gras : avec l'une d'elles, ni les titres
   * d'exercice ni les numéros de questions ne peuvent l'être, et le réglage
   * « numéros en gras » reste sans effet visible. Le signaler vaut mieux que
   * de laisser croire à une case à cocher cassée.
   */
  const POLICES_SANS_GRAISSE_GRASSE = [
    'Noto Serif',
    'Lora',
    'Noto Sans',
    'Source Sans 3',
    'Ubuntu',
    'OpenDyslexic',
  ]
  const policeSansGras = $derived(
    POLICES_SANS_GRAISSE_GRASSE.includes(documentOptions.font),
  )

  const ONGLETS: { id: Onglet; libelle: string }[] = [
    { id: 'generer', libelle: '1. Générer' },
    { id: 'analyser', libelle: '2. Analyser' },
    { id: 'bilan', libelle: '3. Bilan' },
  ]
</script>

<svelte:head>
  <title>MathALÉA - Évaluation avec scan</title>
</svelte:head>

<main
  class="{$darkMode.isActive
    ? 'dark'
    : ''} flex flex-col h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <div class="relative z-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <NavBar
      subtitle="Évaluation avec scan"
      subtitleType="export"
      handleLanguage={() => {}}
      locale={$referentielLocale}
    />

    <div
      class="flex flex-row gap-2 px-4 md:px-8 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      {#if $globalOptions.beta && !$globalOptions.iframe}
        <SaveSheetButton
          getContent={getSavedContent}
          defaultName={titre.trim() || 'Évaluation avec scan'}
          kind="omr"
          oneClick
          disabled={isLoading ||
            analyse === 'encours' ||
            telechargement === 'encours'}
        />
      {/if}
      {#each ONGLETS as tab (tab.id)}
        <button
          type="button"
          class="px-4 py-2 text-sm font-semibold {onglet === tab.id
            ? 'border-b-2 border-coopmaths-action text-coopmaths-action dark:border-coopmathsdark-action dark:text-coopmathsdark-action'
            : 'text-coopmaths-corpus/60 hover:text-coopmaths-action dark:text-coopmathsdark-corpus/60 dark:hover:text-coopmathsdark-action'}"
          aria-pressed={onglet === tab.id}
          onclick={() => (onglet = tab.id)}
        >
          {tab.libelle}
        </button>
      {/each}
    </div>

    {#if onglet === 'generer'}
      <div
        class="flex flex-row flex-wrap items-center gap-x-6 gap-y-3 px-4 md:px-8 py-3 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        <div
          class="flex flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
          role="group"
          aria-label="Mode d'affichage"
        >
          {#each [{ mode: 'code', icon: 'bx-code-alt', label: 'Code' }, { mode: 'split', icon: 'bx-columns', label: 'Côte à côte' }, { mode: 'preview', icon: 'bx-file-pdf', label: 'Aperçu' }] as choice (choice.mode)}
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
          title="Nouvelles données aléatoires pour tous les exercices"
          class="flex items-center gap-1 text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
          onclick={nouvellesDonnees}
        >
          <i class="bx bx-refresh text-xl"></i>
          Nouvelles données
        </button>

        <button
          type="button"
          title="Afficher sur l'aperçu les contrôles de mise en page (colonnes et espacement des questions, insertions entre les exercices)"
          aria-pressed={showOverlay}
          class="flex items-center gap-1 text-sm {showOverlay
            ? 'text-coopmaths-action font-semibold dark:text-coopmathsdark-action'
            : 'text-coopmaths-action/60 hover:text-coopmaths-action dark:text-coopmathsdark-action/60 dark:hover:text-coopmathsdark-action'}"
          onclick={() => {
            showOverlay = !showOverlay
            persistPreferences()
          }}
        >
          <i class="bx bx-slider text-xl"></i>
          Mise en page
        </button>

        {#if elevesApercu.length > 1}
          <label class="flex items-center gap-2 text-sm">
            <i class="bx bx-user text-xl"></i>
            Copie
            <select
              class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
              bind:value={indexApercu}
              onchange={() => reconstruire()}
            >
              {#each elevesApercu as eleve, index (eleve.id)}
                <option value={index}>{eleve.nom}</option>
              {/each}
            </select>
          </label>
        {/if}

        <button
          type="button"
          class="flex items-center gap-1 text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
          onclick={() => (isAddExerciseOpen = true)}
        >
          <i class="bx bx-plus text-xl"></i>
          Ajouter un exercice
        </button>

        <div class="grow"></div>

        {#if isCompiling}
          <span class="text-xs opacity-70">
            <i class="bx bx-loader-alt bx-spin"></i> compilation…
          </span>
        {/if}

        <ButtonTextAction
          text={telechargement === 'encours'
            ? 'Génération…'
            : 'Télécharger les sujets'}
          icon={telechargement === 'encours'
            ? 'bx-loader-alt bx-spin'
            : 'bx-download'}
          inverted={true}
          class="rounded-lg py-1 px-2 min-w-42.5"
          title={eleves.length === 0
            ? 'Collez d’abord la liste de la classe dans les réglages'
            : 'PDF des sujets et fichier de correction'}
          on:click={telechargerTout}
        />
      </div>
    {/if}
  </div>

  {#if onglet === 'generer'}
    {#if isLoading}
      <div
        class="flex w-full justify-center items-center py-24 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        <i class="bx bx-loader-alt bx-spin text-4xl"></i>
      </div>
    {:else}
      <div class="flex flex-row grow min-h-0">
        {#if isSettingsOpen}
          <div
            class="w-80 shrink-0 overflow-y-auto border-r border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus p-5 space-y-4"
          >
            <div class="flex items-center justify-between">
              <h3
                class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
              >
                Réglages du document
              </h3>
              <button
                type="button"
                aria-label="Fermer les réglages"
                onclick={() => (isSettingsOpen = false)}
              >
                <i
                  class="bx bx-x text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
                ></i>
              </button>
            </div>

            <p class="text-xs opacity-75">
              Les sujets, les copies scannées et la liste de classe restent dans
              ce navigateur : rien n’est envoyé sur un serveur.
            </p>

            <ExportViewLinks current="omr" />

            <label class="flex flex-col gap-1 text-sm">
              Titre de l’évaluation
              <input
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={titre}
                onchange={appliquerReglages}
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              Liste de la classe — un nom par ligne
              <textarea
                class="h-32 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-1 font-mono text-xs"
                bind:value={listeCollee}
                onchange={appliquerReglages}
                placeholder={'Alice Martin\nBo Nguyen\nChen Wei'}
              ></textarea>
              <span class="text-xs opacity-70">
                {eleves.length === 0
                  ? 'Aucun élève : l’aperçu montre une copie d’exemple.'
                  : `${eleves.length} élève${eleves.length > 1 ? 's' : ''} — un sujet nominatif par élève.`}
              </span>
            </label>

            <label class="flex flex-col gap-1 text-sm">
              Consigne (facultative)
              <input
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={consigne}
                onchange={appliquerReglages}
              />
            </label>

            <div
              class="space-y-3 rounded border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest p-3"
            >
              <div
                class="text-sm font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
              >
                Sujets
              </div>
              <label class="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  bind:group={grainePartagee}
                  value={true}
                  onchange={appliquerReglages}
                />
                Même sujet pour toute la classe
              </label>
              <label class="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  bind:group={grainePartagee}
                  value={false}
                  onchange={appliquerReglages}
                />
                Un sujet différent par élève
              </label>
              <label class="flex flex-col gap-1 text-sm">
                Graine de base
                <input
                  class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 font-mono text-xs"
                  bind:value={graineDeBase}
                  onchange={appliquerReglages}
                />
                <span class="text-xs opacity-70">
                  La même graine régénère exactement les mêmes sujets.
                </span>
              </label>
            </div>

            <label class="flex items-center justify-between gap-4 text-sm">
              En-tête
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
                bind:value={documentOptions.headerStyle}
                onchange={appliquerReglages}
              >
                {#each HEADER_STYLES as style (style)}
                  <option value={style}>{LIBELLE_ENTETE[style]}</option>
                {/each}
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Sous-titre (niveau, classe…)
              <input
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.subtitle}
                onchange={appliquerReglages}
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Ligne d’en-tête
              <input
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.headerLine}
                onchange={appliquerReglages}
              />
            </label>
            <p class="text-xs opacity-70 -mt-2">
              Le nom de l’élève et le QR-code restent imprimés sur chaque page,
              quel que soit l’habillage : ils identifient la feuille.
            </p>

            <label class="flex items-center justify-between gap-4 text-sm">
              Police du texte
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
                bind:value={documentOptions.font}
                onchange={appliquerReglages}
              >
                {#each TEXT_FONTS as font (font)}
                  <option value={font}>{font}</option>
                {/each}
              </select>
            </label>

            <label class="flex items-center justify-between gap-4 text-sm">
              Police des maths
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
                bind:value={documentOptions.mathFont}
                onchange={appliquerReglages}
              >
                {#each MATH_FONTS as font (font)}
                  <option value={font}>{font}</option>
                {/each}
              </select>
            </label>

            <label class="flex items-center justify-between gap-4 text-sm">
              Taille du texte
              <input
                type="number"
                min="7"
                max="16"
                step="0.5"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.fontSize}
                onchange={appliquerReglages}
              />
            </label>

            <label class="flex items-center justify-between gap-4 text-sm">
              Interligne
              <input
                type="number"
                min="0.4"
                max="2"
                step="0.05"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.lineSpacing}
                onchange={appliquerReglages}
              />
            </label>

            <label class="flex items-center justify-between gap-4 text-sm">
              Espacement des mots (%)
              <input
                type="number"
                min="50"
                max="200"
                step="5"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.wordSpacing}
                onchange={appliquerReglages}
              />
            </label>

            <label class="flex items-center justify-between gap-4 text-sm">
              Style des exercices
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.exerciseStyle}
                onchange={appliquerReglages}
                disabled={documentOptions.mergeExercises ||
                  !documentOptions.showExerciseTitles}
              >
                <option value="simple">Simple</option>
                <option value="underline">Souligné</option>
                <option value="border-accent">Bordure accentuée</option>
                <option value="rounded-box">Encadré arrondi</option>
                <option value="header-card">Cartouche</option>
              </select>
            </label>
            <label class="flex items-center justify-between gap-4 text-sm">
              Couleur des titres
              <input
                type="color"
                aria-label="Couleur des titres"
                bind:value={documentOptions.titleColor}
                oninput={appliquerReglages}
              />
            </label>

            <label class="flex items-center justify-between gap-4 text-sm">
              Espace avant un exercice
              <input
                type="number"
                min="0"
                max="6"
                step="0.2"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.exerciseSpacing}
                onchange={appliquerReglages}
              />
            </label>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={documentOptions.mergeExercises}
                  onchange={appliquerReglages}
                />
                Fusionner tous les exercices
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={documentOptions.showExerciseTitles}
                  onchange={appliquerReglages}
                />
                Titres des exercices
              </label>

              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={documentOptions.boldQuestionNumbers}
                  onchange={appliquerReglages}
                  disabled={policeSansGras}
                />
                Numéros de questions en gras
              </label>

              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={documentOptions.showQuestionPoints}
                  onchange={appliquerReglages}
                />
                Barème à côté de chaque question
              </label>
            </div>
            {#if policeSansGras}
              <p class="text-xs opacity-70 -mt-2">
                {documentOptions.font} n'est livrée qu'en graisse normale : ni les
                titres ni les numéros ne peuvent être gras avec cette police.
              </p>
            {/if}
            <label class="flex items-center justify-between gap-4 text-sm">
              Corrigé
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm max-w-40"
                bind:value={documentOptions.corrige}
                onchange={appliquerReglages}
              >
                <option value="aucun">Aucun</option>
                <option value="complet">Complet</option>
                <option value="minimal">Réponses seules</option>
              </select>
            </label>
            {#if documentOptions.corrige !== 'aucun'}
              <p class="text-xs opacity-70 -mt-2">
                Le corrigé est groupé après toutes les copies, sans repère de
                calage : imprimez les premières pages pour la classe et gardez
                les dernières. {grainePartagee
                  ? 'Un seul corrigé, valable pour toute la classe.'
                  : 'Un corrigé par version distincte, nommé.'}
              </p>
            {/if}

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.showFooter}
                onchange={appliquerReglages}
              />
              Pied de page
            </label>

            {#if documentOptions.showFooter}
              <label class="flex flex-col gap-1 text-sm">
                Texte du pied de page
                <input
                  class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                  bind:value={documentOptions.footerText}
                  onchange={appliquerReglages}
                />
              </label>
            {/if}

            <p class="text-xs opacity-70">
              Format A4 portrait, marges et repères de calage imposés : c’est la
              géométrie que le dépouillement attend.
            </p>

            <button
              type="button"
              class="text-sm text-coopmaths-action hover:underline dark:text-coopmathsdark-action"
              onclick={reinitialiserMiseEnPage}
            >
              Réinitialiser les réglages
            </button>
          </div>
        {/if}

        <div class="flex flex-col grow min-w-0">
          {#if messageGeneration !== ''}
            <div
              class="px-4 py-2 text-sm bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
            >
              {messageGeneration}
            </div>
          {/if}

          {#if nbQuestions === 0}
            <div
              class="px-4 py-2 text-sm bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
            >
              Aucune question à cases dans les exercices sélectionnés : leurs
              énoncés ont gardé les composants interactifs (tableau à compléter,
              QCM à cliquer) dont la version papier ne sait rien faire.
            </div>
          {/if}

          <div class="flex flex-row grow min-h-0">
            {#if displayMode === 'code' || displayMode === 'split'}
              <div
                class="omr-editeur min-w-0 overflow-hidden {displayMode ===
                'split'
                  ? 'w-1/2 border-r border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest'
                  : 'grow'}"
                bind:this={editeurEl}
              ></div>
            {/if}

            {#if displayMode === 'preview' || displayMode === 'split'}
              <div
                class="grow overflow-auto p-4 relative min-w-0 bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
              >
                {#if svgContent === ''}
                  <div
                    class="flex flex-col items-center gap-3 py-24 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
                  >
                    <i class="bx bx-loader-alt bx-spin text-4xl"></i>
                    <p class="text-sm">Compilation de l'aperçu en cours...</p>
                  </div>
                {:else}
                  <div class="omr-apercu relative mx-auto max-w-3xl">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html svgContent}
                    {#if showOverlay}
                      <OmrDocumentTextOverlay
                        widgets={widgetsTexteDocument}
                        header={{
                          title: titre,
                          subtitle: documentOptions.subtitle,
                          headerLine: documentOptions.headerLine,
                        }}
                        footerText={documentOptions.footerText}
                        onSaveHeader={(value) => {
                          titre = value.title
                          documentOptions.subtitle = value.subtitle
                          documentOptions.headerLine = value.headerLine
                          appliquerReglages()
                        }}
                        onSaveFooter={(value) => {
                          documentOptions.footerText = value
                          appliquerReglages()
                        }}
                      />
                      <!-- barre de l'exercice, au bord droit de la colonne :
                           mêmes icônes et même style que la vue « Impression » -->
                      {#each widgetsExercice as widget, index (index)}
                        <div
                          class="omr-pill omr-pill-round pointer-events-auto absolute flex -translate-x-full -translate-y-1/2 items-center gap-0.5 px-1"
                          style="top: {widget.top}%; left: {widget.left}%;"
                        >
                          <button
                            type="button"
                            title="Monter l'exercice"
                            aria-label="Monter l'exercice {widget.num}"
                            disabled={widget.num <= 1}
                            onclick={() => deplacerExercice(widget.num, -1)}
                          >
                            <i class="bx bx-up-arrow-alt"></i>
                          </button>
                          <button
                            type="button"
                            title="Descendre l'exercice"
                            aria-label="Descendre l'exercice {widget.num}"
                            disabled={widget.num >= nbExercices}
                            onclick={() => deplacerExercice(widget.num, 1)}
                          >
                            <i class="bx bx-down-arrow-alt"></i>
                          </button>
                          <button
                            type="button"
                            title="Insérer un texte ou un titre de section avant l'exercice"
                            aria-label="Insérer un texte avant l'exercice {widget.num}"
                            onclick={() => ajouterTexte(widget.num - 1)}
                          >
                            <i class="bx bx-plus-circle"></i>
                          </button>
                          <span class="omr-pill-sep"></span>
                          <button
                            type="button"
                            title="Réglages de l'exercice {widget.num}"
                            aria-label="Réglages de l'exercice {widget.num}"
                            onclick={() => (indexReglages = widget.num - 1)}
                          >
                            <i class="bx bx-cog"></i>
                          </button>
                          <button
                            type="button"
                            title="Nouvelles données pour l'exercice {widget.num}"
                            aria-label="Nouvelles données pour l'exercice {widget.num}"
                            onclick={() => nouvellesDonneesExercice(widget.num)}
                          >
                            <i class="bx bx-refresh"></i>
                          </button>
                          {#if nombreDeQuestions(widget.num) != null}
                            <span class="omr-pill-sep"></span>
                            <button
                              type="button"
                              title="Une question de moins"
                              aria-label="Une question de moins dans l'exercice {widget.num}"
                              onclick={() =>
                                changerNombreDeQuestions(widget.num, -1)}
                            >
                              <i class="bx bx-minus"></i>
                            </button>
                            <span
                              class="tabular-nums"
                              title="Nombre de questions"
                            >
                              {nombreDeQuestions(widget.num)}<span
                                class="text-[0.6rem]">q</span
                              >
                            </span>
                            <button
                              type="button"
                              title="Une question de plus"
                              aria-label="Une question de plus dans l'exercice {widget.num}"
                              onclick={() =>
                                changerNombreDeQuestions(widget.num, 1)}
                            >
                              <i class="bx bx-plus"></i>
                            </button>
                          {/if}
                          <span class="omr-pill-sep"></span>
                          <button
                            type="button"
                            title="Dupliquer l'exercice {widget.num} (la copie se place juste après)"
                            aria-label="Dupliquer l'exercice {widget.num}"
                            onclick={() => dupliquerExercice(widget.num)}
                          >
                            <i class="bx bx-copy"></i>
                          </button>
                          <button
                            type="button"
                            title="Supprimer l'exercice {widget.num} du sujet"
                            aria-label="Supprimer l'exercice {widget.num} du sujet"
                            class="omr-danger"
                            disabled={nbExercices <= 1}
                            onclick={() => supprimerExercice(widget.num)}
                          >
                            <i class="bx bx-trash"></i>
                          </button>
                        </div>
                      {/each}

                      <!-- colonnes et espacement des questions, dans la marge
                           gauche : même boîte verticale que la vue Typst -->
                      {#each widgetsExercice as widget, index (index)}
                        <div
                          class="omr-pill omr-pill-box pointer-events-auto absolute flex -translate-y-1/2 flex-col"
                          style="top: {widget.top}%; left: 0.3%;"
                        >
                          <div
                            class="flex items-center justify-between"
                            title="Colonnes des questions de l'exercice {widget.num}"
                          >
                            <button
                              type="button"
                              aria-label="Moins de colonnes"
                              onclick={() => ajusterColonnes(widget.num, -1)}
                            >
                              <i class="bx bx-chevron-left"></i>
                            </button>
                            <span class="tabular-nums">
                              {colonnesDe(widget.num)}<i
                                class="bx bx-columns text-[0.6rem]"
                              ></i>
                            </span>
                            <button
                              type="button"
                              aria-label="Plus de colonnes"
                              onclick={() => ajusterColonnes(widget.num, 1)}
                            >
                              <i class="bx bx-chevron-right"></i>
                            </button>
                          </div>
                          <div
                            class="omr-pill-divider-top flex items-center justify-between"
                            title="Espacement vertical des questions de l'exercice {widget.num}"
                          >
                            <button
                              type="button"
                              aria-label="Réduire l'espacement des questions"
                              onclick={() => ajusterEspacement(widget.num, -1)}
                            >
                              <i class="bx bx-minus"></i>
                            </button>
                            <span class="px-0.5 text-[0.6rem] tabular-nums">
                              {espacementDe(widget.num)}em
                            </span>
                            <button
                              type="button"
                              aria-label="Augmenter l'espacement des questions"
                              onclick={() => ajusterEspacement(widget.num, 1)}
                            >
                              <i class="bx bx-plus"></i>
                            </button>
                          </div>
                        </div>
                      {/each}

                      <!-- entre deux exercices : saut de page et insertions -->
                      {#each widgetsInsertion as widget, index (index)}
                        {@const fragments = insertions[widget.num] ?? []}
                        {@const aSautDePage =
                          fragments.includes(OMR_SAUT_DE_PAGE)}
                        <div
                          class="omr-pill omr-pill-round pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 px-1"
                          style="left: {widget.left}%; top: {widget.top}%;"
                        >
                          <button
                            type="button"
                            title="Insérer ou modifier un texte ou un titre de section ici"
                            aria-label="Insérer un texte ici"
                            onclick={() => ajouterTexte(widget.num)}
                          >
                            <i class="bx bx-plus-circle"></i>
                          </button>
                          <span class="omr-pill-sep"></span>
                          <button
                            type="button"
                            title={aSautDePage
                              ? 'Retirer le saut de page'
                              : 'Insérer un saut de page ici'}
                            aria-label={aSautDePage
                              ? 'Retirer le saut de page'
                              : 'Insérer un saut de page ici'}
                            class:omr-pill-active={aSautDePage}
                            onclick={() => basculerSautDePage(widget.num)}
                          >
                            <i class="bx bx-arrow-to-bottom"></i>
                          </button>
                          {#each fragments as fragment, position (position)}
                            {#if fragment !== OMR_SAUT_DE_PAGE}
                              <span class="omr-pill-sep"></span>
                              <button
                                type="button"
                                class="omr-pill-wide omr-danger"
                                title="Retirer : {decrireInsertion(fragment)}"
                                aria-label="Retirer l'insertion"
                                onclick={() =>
                                  supprimerInsertion(widget.num, position)}
                              >
                                {decrireInsertion(fragment)}
                                <i class="bx bx-x"></i>
                              </button>
                            {/if}
                          {/each}
                        </div>
                      {/each}
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          {#if diagnostics.length > 0}
            <div
              class="max-h-32 overflow-y-auto border-t border-coopmaths-canvas-darkest bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-coopmathsdark-canvas-darkest dark:bg-amber-900 dark:text-amber-100"
            >
              <strong>Diagnostics Typst</strong>
              <ul class="mt-1 list-disc pl-5 font-mono">
                {#each diagnostics as ligne, index (index)}
                  <li>{ligne}</li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if telechargement === 'fait'}
            <div
              class="border-t border-coopmaths-canvas-darkest bg-green-100 px-4 py-2 text-sm text-green-900 dark:border-coopmathsdark-canvas-darkest dark:bg-green-900 dark:text-green-100"
            >
              Deux fichiers ont été téléchargés : le PDF à imprimer, et le
              fichier <code>.mathalea-eval.json</code> à conserver — il contient le
              corrigé et sera demandé à l’étape « Analyser ».
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {:else if onglet === 'analyser'}
    <section
      class="grow overflow-auto p-6 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <div class="mx-auto flex max-w-3xl flex-col gap-6">
        <div
          class="border-b border-coopmaths-canvas-darkest pb-4 dark:border-coopmathsdark-canvas-darkest"
        >
          <h1
            class="text-xl font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Analyser les copies
          </h1>
          <p class="mt-2 text-sm">
            Importer les copies scannées et le fichier de correction de
            l’évaluation.
          </p>
        </div>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold">
            Fichier de correction (<code>.mathalea-eval.json</code>)
          </span>
          <input
            type="file"
            accept=".json"
            disabled={analyse === 'encours'}
            onchange={chargerAccompagnement}
          />
          {#if evaluation != null}
            <span class="text-xs opacity-70">
              « {evaluation.sujet.titre} » — {evaluation.copies.length} copie{evaluation
                .copies.length > 1
                ? 's'
                : ''} attendue{evaluation.copies.length > 1 ? 's' : ''}.
            </span>
          {/if}
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold">Copies scannées (PDF)</span>
          <input
            type="file"
            accept="application/pdf"
            disabled={analyse === 'encours'}
            onchange={choisirScan}
          />
          <span class="text-xs opacity-70">
            Numérisation à plat, 200 à 300 points par pouce. Les feuilles
            peuvent être dans le désordre ou à l’envers : le QR-code les remet
            en place.
          </span>
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold"
            >Reprendre une correction enregistrée (.mathalea-omr.json)</span
          >
          <input
            type="file"
            accept=".json"
            disabled={analyse === 'encours'}
            onchange={reprendreCorrection}
          />
          <span class="text-xs opacity-70"
            >Sélectionner d’abord le même PDF scanné. Le fichier de correction
            contient les décisions et les commentaires, sans les images.</span
          >
        </label>

        {#if messageAnalyse !== ''}
          <p class="rounded bg-red-100 p-3 text-sm text-red-900">
            {messageAnalyse}
          </p>
        {/if}

        <ButtonTextAction
          text={analyse === 'encours'
            ? 'Dépouillement…'
            : 'Dépouiller les copies'}
          icon={analyse === 'encours' ? 'bx-loader-alt bx-spin' : 'bx-scan'}
          inverted={true}
          class="self-start rounded-lg py-1 px-2"
          on:click={lancerAnalyse}
        />

        {#if analyse === 'encours' && progression.total > 0}
          <div>
            <progress
              class="w-full"
              value={progression.page}
              max={progression.total}
            ></progress>
            <p class="text-xs opacity-70">
              page {progression.page} sur {progression.total}
            </p>
          </div>
        {/if}
      </div>
    </section>
  {:else}
    <section
      class="grow overflow-auto p-6 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-6">
        <div
          class="border-b border-coopmaths-canvas-darkest pb-4 dark:border-coopmathsdark-canvas-darkest"
        >
          <h1
            class="text-xl font-semibold text-coopmaths-struct dark:text-coopmathsdark-struct"
          >
            Bilan de l’évaluation
          </h1>
          <p class="mt-2 text-sm">
            Relire les réponses, valider les copies et exporter les résultats.
          </p>
        </div>
        {#if resultat == null || evaluation == null}
          <p class="text-sm opacity-80">
            Le bilan apparaîtra ici une fois les copies dépouillées.
          </p>
        {:else}
          <OmrReview
            {evaluation}
            bind:resultat
            {fichierScan}
            bind:viewState={review}
          />
          <div class="flex flex-wrap gap-2">
            {#each ['xlsx', 'ods', 'csv'] as format (format)}
              <button
                class="rounded border border-coopmaths-action px-3 py-1 text-sm font-semibold text-coopmaths-action dark:border-coopmathsdark-action dark:text-coopmathsdark-action"
                onclick={() =>
                  telechargerBilan(
                    evaluation as OmrEvaluation,
                    resultat as ResultatAnalyse,
                    format as 'xlsx' | 'ods' | 'csv',
                  )}
              >
                Exporter en {format.toUpperCase()}
              </button>
            {/each}
          </div>

          {#if anomalies.length > 0 || resultat.copiesAbsentes.length > 0}
            <div
              class="rounded border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900"
            >
              <strong>À vérifier</strong>
              <ul class="mt-1 list-disc pl-5">
                {#each anomalies as anomalie (anomalie.rang)}
                  <li>
                    page {anomalie.rang} du scan : {LIBELLE_PAGE[
                      anomalie.statut
                    ] ?? anomalie.statut}
                  </li>
                {/each}
                {#each resultat.copiesAbsentes as copieId (copieId)}
                  <li>
                    copie de {evaluation.copies.find(
                      (c) => c.copieId === copieId,
                    )?.eleve.nom ?? copieId} : non retrouvée dans le lot
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="border-b">
                  <th class="p-2 text-left">Élève</th>
                  {#each evaluation.questions as question (question.qid)}
                    <th class="p-2 text-center">
                      Ex. {question.exercice + 1} · Q{question.question + 1}
                      <span class="block text-xs font-normal opacity-70">
                        /{question.points}
                      </span>
                    </th>
                  {/each}
                  <th class="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {#each resultat.copies as copie (copie.copieId)}
                  <tr class="border-b">
                    <td class="p-2">{copie.eleve.nom}</td>
                    {#each copie.questions as question (question.qid)}
                      <td
                        class="p-2 text-center {question.statut === 'lu'
                          ? ''
                          : 'bg-amber-100 text-amber-900'}"
                        title={question.reponse ?? ''}
                      >
                        {question.statut === 'lu'
                          ? question.points
                          : LIBELLE_QUESTION[question.statut]}
                      </td>
                    {/each}
                    <td class="p-2 text-right font-semibold">
                      {copie.points} / {copie.pointsMax}
                      {#if !resultat.revision?.validees.includes(copie.copieId)}<span
                          class="block text-xs font-normal">Provisoire</span
                        >{/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </section>
  {/if}

  {#if isAddExerciseOpen}
    <TypstAddExerciseModal
      onAdd={ajouterExercice}
      onClose={() => (isAddExerciseOpen = false)}
      target="l’évaluation"
    />
  {/if}

  {#if indexReglages !== null && exerciceReglages != null}
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) indexReglages = null
      }}
    >
      <div
        class="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-lg bg-coopmaths-canvas-dark shadow-xl dark:bg-coopmathsdark-canvas-dark"
      >
        {#key indexReglages}
          <Settings
            exercice={exerciceReglages}
            exerciceIndex={indexReglages}
            inModal={true}
            on:settings={(event) => {
              if (indexReglages !== null) {
                appliquerReglagesExercice(indexReglages, event.detail)
              }
            }}
            on:clickSettings={() => (indexReglages = null)}
          />
        {/key}
      </div>
    </div>
  {/if}
</main>

<style>
  .omr-editeur :global(.cm-editor) {
    height: 100%;
    font-size: 0.8rem;
  }
  .omr-apercu :global(svg) {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Palette de mise en page : mêmes fond, bordure et ombre que la vue
     « Impression » (`TypstLayoutOverlay`), pour qu'un professeur qui passe
     d'une vue à l'autre retrouve les mêmes boutons au même endroit. */
  .omr-pill {
    background: white;
    border: 1px solid #b9d4f1;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    opacity: 0.5;
    transition: opacity 0.15s ease;
    z-index: 10;
  }
  .omr-pill:hover,
  .omr-pill:focus-within {
    opacity: 1;
  }
  .omr-pill-round {
    border-radius: 999px;
  }
  .omr-pill-box {
    border-radius: 6px;
  }
  .omr-pill > :global(button) {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 3px;
    border-radius: 4px;
    font-size: 15px;
    color: #145a9d;
  }
  .omr-pill > :global(button:hover) {
    background: #e3eefa;
  }
  .omr-pill > :global(button:disabled) {
    color: #b0b0b0;
    cursor: default;
  }
  .omr-pill > :global(button:disabled:hover) {
    background: transparent;
  }
  .omr-pill > :global(button.omr-pill-wide) {
    gap: 2px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
  .omr-pill-sep {
    width: 1px;
    height: 12px;
    background: #b9d4f1;
    flex-shrink: 0;
  }
  .omr-pill-divider-top {
    border-top: 1px solid #d7e6f7;
  }
  .omr-pill-active {
    background: #145a9d;
    color: white !important;
  }
  .omr-pill-active:hover {
    background: #1d76cc !important;
  }
  .omr-danger:hover {
    background: #fbe2e2 !important;
    color: #c0392b !important;
  }
</style>
