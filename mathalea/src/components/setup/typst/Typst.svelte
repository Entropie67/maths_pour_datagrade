<script lang="ts">
  import { EditorState } from '@codemirror/state'
  import { EditorView } from '@codemirror/view'
  import JSZip from 'jszip'
  import seedrandom from 'seedrandom'
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { applyExerciceSettings } from '../../../lib/components/exerciceSettings'
  import {
    buildExercise,
    buildExercisesList,
    getBanquesExternesPreambuleTyp,
    getStaticExerciceCorTypUrl,
    getStaticExerciceTypUrl,
  } from '../../../lib/components/exercisesUtils'
  import { stringWithNoAccent } from '../../../lib/components/textUtils'
  import {
    mathaleaBuildUrlFromExercicesParams,
    mathaleaFormatExercice,
    mathaleaHandleExerciceSimple,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../lib/mathalea'
  import {
    SHEET_URL_PARAM,
    queryFromUrl,
    type SheetContent,
    type SheetPreview,
  } from '../../../lib/mesFeuilles/library'
  import {
    applyTypstModel,
    defaultTypstModel,
    loadPreferences,
    type TypstModelOptions,
  } from '../../../lib/mesFeuilles/preferences'
  import { buildPreview } from '../../../lib/mesFeuilles/preview'
  import {
    hasSeenTypstTour,
    startTypstTour,
  } from '../../../lib/onboarding/typstTour'
  import {
    currentSheetStore,
    darkMode,
    exercicesParams,
    freezeUrl,
    isInIframe,
    previousSheetStore,
    typstParamStore,
    typstShortcutsOpen,
  } from '../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import { isLocalStorageAvailable } from '../../../lib/stores/storage'
  import type { IExercice, InterfaceParams } from '../../../lib/types'
  import { context } from '../../../modules/context'
  import { statsPdfCreatedTracker } from '../../../modules/statsUtils'
  import { SM_BREAKPOINT } from '../../keyboard/lib/sizes'
  import Settings from '../../shared/exercice/exerciceMathalea/exerciceMathaleaVueProf/presentationalComponents/Settings.svelte'
  import BugReportModal from '../../shared/exercice/shared/BugReportModal.svelte'
  import ButtonTextAction from '../../shared/forms/ButtonTextAction.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import { decodeBase64, encodeBase64 } from '../latex/LatexConfig'
  import SaveSheetButton from '../mesFeuilles/SaveSheetButton.svelte'
  import TypstModels from '../mesFeuilles/TypstModels.svelte'
  import {
    codeEditorExtensions,
    revealPosition,
    setEditorMarkers,
    setEditorTheme,
    type EditorMarker,
  } from '../shared/editor/editorSetup'
  import ExportViewLinks from '../shared/ExportViewLinks.svelte'
  import {
    separatePages,
    type PreviewPageGeometry,
  } from '../shared/typstPreview'
  import TypstAddExerciseModal from './addExercise/TypstAddExerciseModal.svelte'
  import {
    BADGE_POSITIONS,
    BADGE_STYLES,
    CAN_ANSWER_WIDTH_DEFAULT,
    COVER_TEMPLATES,
    COVER_TEMPLATE_DEFAULTS,
    FULL_WIDTH_BADGE_STYLES,
    HEADER_STYLES,
    INSERTION_CORRECTION_TAG,
    INSERTION_TAG,
    MATH_FONTS,
    MAX_COPIES_PER_PAGE,
    QUESTION_NUMBERING_STYLES,
    SUBJECT_MARKER_PATTERN,
    TEXT_FONTS,
    WRITING_LINES_POSITIONS,
    WRITING_LINES_STYLES,
    buildStandaloneExerciseCode,
    buildTypstDocument,
    defaultTypstDocumentOptions,
    defaultExerciseTitle,
    exercisePoints,
    exerciseTitleLine,
    ficheUrl,
    getGeneratedCanRowCode,
    getGeneratedCorrectionCode,
    getGeneratedExerciseCode,
    harvestCarryOver,
    normalizeTypstLayoutOptions,
    pageBodySize,
    parseNumberingLiteral,
    questionNumberingLabel,
    subjectEditorCode,
    swapExerciseFigures,
    type ActiveCoverTemplate,
    type CoverTemplate,
    type QuestionNumberingStyle,
    type TypstCarryOver,
    type TypstDocumentOptions,
    type TypstExerciseInput,
    type WritingLinesPosition,
    type WritingLinesSetting,
    type WritingLinesStyle,
  } from './buildTypstDocument'
  import { applyCodePatch, createCodePatch } from './codePatch'
  import {
    defaultCoverPoints,
    groupedExercisePoints,
    setGroupedExercisePoints,
  } from './coverBareme'
  import { formatCoverDate } from './coverDate'
  import CoverDateField from './CoverDateField.svelte'
  import { typstLanguage } from './editor/typstLanguage'
  import type { ExerciseImageCuts } from './imageCuts'
  import {
    overflowingImages,
    withImageGeometry,
    type ImageGeometry,
  } from './imageOverflow'
  import { setStaticImagePaths } from './latexToTypst'
  import { LOGO_CAN_URL, LOGO_CAN_VIRTUAL_PATH } from './mathaleaLogo'
  import { getShortAnswer } from './minimalCorrection'
  import {
    anchorSections,
    locateSectionAnchor,
    pageIndexAt,
    sectionKeyOf,
    type SectionKey,
  } from './overlaySections'
  import { swapCarryOver } from './typstCarryOver'
  import type { TypstAnchor } from './typstCompiler'
  import {
    countErrors,
    parseTypstDiagnostics,
    summarizeDiagnostics,
    type TypstDiagnostic,
  } from './typstDiagnostics'
  import { cleanTypstExport, corrigeCode, enonceCode } from './typstExport'
  import TypstImageCutModal from './TypstImageCutModal.svelte'
  import TypstLayoutOverlay, {
    type OverlayWidget,
    type TasksLayoutValue,
  } from './TypstLayoutOverlay.svelte'
  import {
    buildRedirectHtml,
    buildShareUrl,
    readTypstParam,
    typstParamForAddressBar,
  } from './typstUrlParam'

  /** Libellés des habillages d'en-tête */
  const HEADER_STYLE_LABELS: Record<(typeof HEADER_STYLES)[number], string> = {
    epure: 'Épuré',
    cartouche: 'Cartouche',
    cadre: 'Cadre',
    aucun: 'Aucun',
  }

  /** Libellés des styles de numérotation des questions */
  const QUESTION_NUMBERING_STYLE_LABELS: Record<
    QuestionNumberingStyle,
    string
  > = {
    aucun: 'Aucune',
    '1.': '1.',
    '1)': '1)',
    'a.': 'a.',
    'a)': 'a)',
  }

  /** Libellés des styles de badge du paquet exercise-bank */
  const BADGE_STYLE_LABELS: Record<(typeof BADGE_STYLES)[number], string> = {
    'border-accent': 'Barre latérale',
    underline: 'Souligné',
    'rounded-box': 'Encadré arrondi',
    'header-card': 'Bandeau',
    margin: 'Titre seul',
    box: 'Encadré',
    pill: 'Pastille',
    tag: 'Étiquette',
    circled: 'Numéro cerclé',
    'filled-circle': 'Numéro plein',
    rect: 'Numéro encadré',
    'filled-rect': 'Numéro encadré plein',
  }

  /**
   * Le style place-t-il son titre à côté de l'énoncé ? Les styles pleine
   * largeur ne sont pas concernés par « Position du titre ».
   */
  const badgeStyleHasSideLabel = (style: (typeof BADGE_STYLES)[number]) =>
    !(FULL_WIDTH_BADGE_STYLES as readonly string[]).includes(style)

  /** Libellés des positions de badge du paquet exercise-bank */
  const BADGE_POSITION_LABELS: Record<
    (typeof BADGE_POSITIONS)[number],
    string
  > = {
    margin: 'En marge',
    above: 'Au-dessus',
  }

  /** Libellés des modèles de page de garde */
  const COVER_TEMPLATE_LABELS: Record<CoverTemplate, string> = {
    aucune: 'Aucune',
    evaluation: 'Évaluation',
    recitation: 'Évaluation (bandeau compact)',
    brevet: 'Brevet des collèges',
    bac: 'BAC',
    can: 'Course aux nombres',
  }

  /** Palette de couleurs proposées pour les badges (expression Typst) */
  const BADGE_COLORS: { label: string; value: string; css: string }[] = [
    { label: 'Noir', value: 'black', css: '#000000' },
    { label: 'Orange', value: 'rgb("#f15929")', css: '#f15929' },
    { label: 'Bleu', value: 'rgb("#1d4ed8")', css: '#1d4ed8' },
    { label: 'Vert', value: 'rgb("#4a7c59")', css: '#4a7c59' },
    { label: 'Rouge', value: 'rgb("#dc2626")', css: '#dc2626' },
    { label: 'Violet', value: 'rgb("#7c3aed")', css: '#7c3aed' },
  ]

  type DisplayMode = 'code' | 'split' | 'preview'
  const STORAGE_KEY = 'mathaleaTypstView'
  /**
   * Durée de vie des préférences de la vue Typst (mode d'affichage, palette,
   * réglages du document&nbsp;: titre, orientation, format…). Ce ne sont que
   * le confort d'une session de travail&nbsp;: un prof qui revient sur le site
   * plus tard repart des valeurs par défaut plutôt que de retrouver la fiche
   * précédente.
   */
  const PREFS_MAX_AGE_MS = 15 * 60 * 1000

  // Sur téléphone, l'éditeur de code et l'affichage côte à côte n'ont pas de
  // place : seul l'aperçu est proposé et le volet de réglages reste replié.
  const isMobile = window.innerWidth < SM_BREAKPOINT

  let displayMode: DisplayMode = $state('preview')
  let isSettingsOpen = $state(!isMobile)
  let isBugReportDisplayed = $state(false)
  /** Affiche la palette de mise en page sur l'aperçu */
  let showOverlay = $state(!isMobile)
  /**
   * Valeur initiale de `documentOptions` (calculée ici, hors réactivité, pour
   * n'assigner l'état qu'une seule fois — lire un `$state` en dehors d'un
   * `$derived`/`$effect` ne fait que capturer l'instantané courant).
   */
  let restoredDocumentOptions: TypstDocumentOptions = {
    ...defaultTypstDocumentOptions,
  }
  // nouvelle fiche (pas de `typstParam`) : elle part du modèle par défaut de
  // « Mes sauvegardes », s'il y en a un
  const startingModel = defaultTypstModel(loadPreferences())
  if (
    startingModel !== null &&
    readTypstParam(new URL(window.location.href)) == null
  ) {
    restoredDocumentOptions = sanitizeDocumentOptions(
      applyTypstModel(restoredDocumentOptions, startingModel.options),
    )
  }
  if (isLocalStorageAvailable()) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      const parsed = saved != null ? JSON.parse(saved) : null
      // Préférences périmées (voir PREFS_MAX_AGE_MS) ou écrites par une version
      // antérieure sans horodatage : on les oublie et on repart des valeurs
      // par défaut.
      const prefsExpired =
        parsed != null &&
        (typeof parsed.savedAt !== 'number' ||
          Date.now() - parsed.savedAt > PREFS_MAX_AGE_MS)
      if (prefsExpired) window.localStorage.removeItem(STORAGE_KEY)
      if (parsed != null && !prefsExpired) {
        // sur téléphone on reste sur l'aperçu quel que soit le mode mémorisé
        if (
          !isMobile &&
          ['code', 'split', 'preview'].includes(parsed.displayMode)
        ) {
          const restoredDisplayMode = parsed.displayMode as DisplayMode
          displayMode = restoredDisplayMode
          // le bouton Réglages n'existe qu'en Aperçu : hors de ce mode, le
          // volet doit rester fermé (isSettingsOpen n'est pas persisté)
          if (restoredDisplayMode !== 'preview') isSettingsOpen = false
        }
        if (!isMobile && typeof parsed.showOverlay === 'boolean') {
          showOverlay = parsed.showOverlay
        }
        if (parsed.documentOptions != null) {
          restoredDocumentOptions = sanitizeDocumentOptions(
            parsed.documentOptions,
          )
        }
      }
    } catch {
      // préférences illisibles : on garde les valeurs par défaut
    }
  }
  /**
   * Réglages de la palette de mise en page (colonnes/espacement des
   * questions, textes et sections insérés, sauts de page/colonne, fusions,
   * zoom/alignement des figures) restaurés depuis l'URL. Injectés dans la
   * première génération du code ; les modifications suivantes sont relues
   * dans le code courant.
   */
  let urlCarryOver: TypstCarryOver | null = null
  // Le diaporama (bouton « PDF sujets + corrigés ») transmet ici son nombre
  // de vues via typstParam pour que
  // le nombre de sujets Typst corresponde au nombre de vues jouées. Depuis
  // que la vue Typst réécrit ce paramètre à chaque modification, il porte
  // aussi tous les réglages du document et de la mise en page (rechargeables).
  // Valeur complète du paramètre : l'URL peut n'en porter qu'une référence
  // (voir `typstUrlParam.ts`) quand les réglages sont trop volumineux.
  const typstUrlParam = readTypstParam(new URL(window.location.href))
  // fiche ouverte depuis « Mes feuilles » (ou rechargée) :
  // « Enregistrer » met à jour cette feuille. Sans paramètre, la fiche est
  // nouvelle, même si une feuille était reliée avant de quitter la vue : elle
  // a pu être remplacée par un tout autre document, qu'on ne doit pas
  // enregistrer par-dessus. Cette feuille reste proposée au remplacement.
  const urlSheetId =
    new URL(window.location.href).searchParams.get(SHEET_URL_PARAM) ?? ''
  const sheetLinkedBefore = get(currentSheetStore)
  if (sheetLinkedBefore !== '' && sheetLinkedBefore !== urlSheetId) {
    previousSheetStore.set(sheetLinkedBefore)
  }
  currentSheetStore.set(urlSheetId)
  /**
   * Dernière valeur complète de `typstParam`, base des liens à partager et du
   * fichier de redirection (l'URL de la barre d'adresse peut ne contenir
   * qu'une référence).
   */
  let fullTypstParam = typstUrlParam ?? ''
  /**
   * Un lien partagé fixe déjà ces réglages : la détection automatique de la
   * présentation « Course aux nombres » (voir `loadExercises`) ne doit
   * remplacer que ceux qu'il n'a pas fixés.
   */
  let canModeSetFromUrl = false
  let pageFormatSetFromUrl = false
  let coverTemplateSetFromUrl = false
  let headerStyleSetFromUrl = false
  let titleSetFromUrl = false
  if (typstUrlParam != null) {
    // forme compatible avec la barre d'adresse (lien à fragment ou volumineux)
    const addressBarParam = typstParamForAddressBar(
      typstUrlParam,
      window.location.href,
    )
    typstParamStore.set(addressBarParam)
    if (!get(freezeUrl)) {
      try {
        const url = new URL(window.location.href)
        url.hash = ''
        url.searchParams.set('typstParam', addressBarParam)
        window.history.replaceState(null, '', url)
      } catch {
        // URL non modifiable (iframe sandboxée…) : sans conséquence
      }
    }
    const parsed = decodeBase64(typstUrlParam)
    if (parsed.options != null) {
      restoredDocumentOptions = {
        ...restoredDocumentOptions,
        ...parsed.options,
      }
      canModeSetFromUrl = parsed.options.canMode !== undefined
      pageFormatSetFromUrl = parsed.options.pageFormat !== undefined
      coverTemplateSetFromUrl = parsed.options.coverPage?.template !== undefined
      headerStyleSetFromUrl = parsed.options.headerStyle !== undefined
      titleSetFromUrl = parsed.options.title !== undefined
      restoredDocumentOptions.coverPage = sanitizeCoverPage(
        restoredDocumentOptions.coverPage,
      )
    }
    if (parsed.carryOver != null) {
      urlCarryOver = parsed.carryOver
    }
  }
  let documentOptions: TypstDocumentOptions = $state(
    normalizeTypstLayoutOptions(restoredDocumentOptions),
  )

  /**
   * Réglages du document lus dans les préférences ou dans un modèle de « Mes
   * sauvegardes » : un réglage absent retombe sur sa valeur par défaut, et une
   * valeur qui n'existe plus (ex. style de badge « margin » retiré) aussi.
   */
  function sanitizeDocumentOptions(saved: object): TypstDocumentOptions {
    const sanitized: TypstDocumentOptions = {
      ...defaultTypstDocumentOptions,
      ...saved,
    }
    const has = (list: readonly string[], value: string) => list.includes(value)
    if (!has(BADGE_STYLES, sanitized.badgeStyle)) {
      sanitized.badgeStyle = defaultTypstDocumentOptions.badgeStyle
    }
    if (!has(BADGE_POSITIONS, sanitized.badgePosition)) {
      sanitized.badgePosition = defaultTypstDocumentOptions.badgePosition
    }
    if (!has(HEADER_STYLES, sanitized.headerStyle)) {
      sanitized.headerStyle = defaultTypstDocumentOptions.headerStyle
    }
    if (!has(TEXT_FONTS, sanitized.font)) {
      sanitized.font = defaultTypstDocumentOptions.font
    }
    if (!has(MATH_FONTS, sanitized.mathFont)) {
      sanitized.mathFont = defaultTypstDocumentOptions.mathFont
    }
    if (
      !Number.isInteger(sanitized.nbVersions) ||
      sanitized.nbVersions < 1 ||
      sanitized.nbVersions > 4
    ) {
      sanitized.nbVersions = defaultTypstDocumentOptions.nbVersions
    }
    if (
      !Number.isInteger(sanitized.copiesPerPage) ||
      sanitized.copiesPerPage < 1 ||
      sanitized.copiesPerPage > MAX_COPIES_PER_PAGE
    ) {
      sanitized.copiesPerPage = defaultTypstDocumentOptions.copiesPerPage
    }
    if (typeof sanitized.chainSubjects !== 'boolean') {
      sanitized.chainSubjects = defaultTypstDocumentOptions.chainSubjects
    }
    // graines épinglées par sujet : liste de listes de chaînes (ou null)
    if (
      sanitized.versionSeeds != null &&
      (!Array.isArray(sanitized.versionSeeds) ||
        !sanitized.versionSeeds.every(
          (entry) =>
            entry == null ||
            (Array.isArray(entry) &&
              entry.every((s) => s == null || typeof s === 'string')),
        ))
    ) {
      sanitized.versionSeeds = undefined
    }
    if (
      !Number.isInteger(sanitized.answerLines) ||
      sanitized.answerLines < 0 ||
      sanitized.answerLines > 20
    ) {
      sanitized.answerLines = defaultTypstDocumentOptions.answerLines
    }
    if (!WRITING_LINES_STYLES.includes(sanitized.answerLinesStyle)) {
      sanitized.answerLinesStyle = defaultTypstDocumentOptions.answerLinesStyle
    }
    if (!WRITING_LINES_POSITIONS.includes(sanitized.answerLinesPosition)) {
      sanitized.answerLinesPosition =
        defaultTypstDocumentOptions.answerLinesPosition
    }
    sanitized.coverPage = sanitizeCoverPage(sanitized.coverPage)
    return sanitized
  }

  /**
   * Page de garde restaurée d'un lien partagé ou des préférences : un réglage
   * absent (fiche d'avant la fonctionnalité) ou d'un modèle qui n'existe plus
   * retombe sur les valeurs par défaut.
   */
  function sanitizeCoverPage(
    cover: TypstDocumentOptions['coverPage'] | undefined,
  ): TypstDocumentOptions['coverPage'] {
    const fallback = defaultTypstDocumentOptions.coverPage
    if (cover == null || typeof cover !== 'object') {
      return { ...fallback, consignes: [], bareme: [] }
    }
    const texte = (value: unknown, defaut = ''): string =>
      typeof value === 'string' ? value : defaut
    const consignes = Array.isArray(cover.consignes)
      ? cover.consignes.filter((ligne) => typeof ligne === 'string')
      : []
    const anciennesConsignesRecitation = [
      'Justifie chaque réponse ;',
      'Écris lisiblement au crayon ou au stylo (noir ou bleu) ;',
      'La calculatrice n’est pas autorisée.',
    ]
    const utiliseAnciennesConsignesRecitation =
      cover.template === 'recitation' &&
      consignes.length === anciennesConsignesRecitation.length &&
      anciennesConsignesRecitation.every(
        (ligne, index) => consignes[index] === ligne,
      )
    return {
      template: COVER_TEMPLATES.includes(cover.template)
        ? cover.template
        : fallback.template,
      titre: texte(cover.titre),
      session: texte(cover.session),
      matiere: texte(cover.matiere),
      etablissement: texte(cover.etablissement),
      duree: texte(cover.duree),
      consignes: utiliseAnciennesConsignesRecitation
        ? [...COVER_TEMPLATE_DEFAULTS.recitation.consignes]
        : consignes,
      signatureLabel: texte(
        cover.signatureLabel,
        cover.template === 'recitation'
          ? COVER_TEMPLATE_DEFAULTS.recitation.signatureLabel
          : fallback.signatureLabel,
      ),
      noteFin: texte(cover.noteFin),
      bareme: Array.isArray(cover.bareme)
        ? cover.bareme.map(Number).filter((points) => Number.isFinite(points))
        : [],
      showBareme:
        typeof cover.showBareme === 'boolean'
          ? cover.showBareme
          : fallback.showBareme,
      showSignature:
        typeof cover.showSignature === 'boolean'
          ? cover.showSignature
          : fallback.showSignature,
      showNote:
        typeof cover.showNote === 'boolean'
          ? cover.showNote
          : fallback.showNote,
    }
  }

  /** Page de garde en cours de réglage (raccourci d'écriture) */
  const coverPage = $derived(documentOptions.coverPage)

  /** Total du barème affiché à côté du tableau des points */
  const coverTotalPoints = $derived(
    coverPage.bareme.reduce((total, points) => total + Number(points || 0), 0),
  )

  /** Session courante, au format « Juin 2026 » (comme la vue LaTeX) */
  function currentSession(): string {
    const date = new Date()
    const mois = date.toLocaleDateString('fr-FR', { month: 'long' })
    return `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${date.getFullYear()}`
  }

  /**
   * Un texte est « d'origine » tant qu'il est vide ou qu'il reprend mot pour
   * mot celui d'un modèle : changer de modèle le remplace alors par le texte
   * du nouveau. Un texte réécrit par le professeur, lui, est conservé —
   * sans quoi passer du Brevet à la Course aux nombres garderait « Durée :
   * 2 heures » et « calculatrice autorisée », qui la contredisent.
   */
  function isDefaultCoverText(
    valeur: string,
    champ: 'titre' | 'matiere' | 'duree' | 'signatureLabel' | 'noteFin',
  ): boolean {
    return (
      valeur === '' ||
      Object.values(COVER_TEMPLATE_DEFAULTS).some(
        (defauts) => defauts[champ] === valeur,
      )
    )
  }

  /** Pendant de `isDefaultCoverText` pour la liste des consignes */
  function isDefaultCoverConsignes(consignes: string[]): boolean {
    return (
      consignes.length === 0 ||
      Object.values(COVER_TEMPLATE_DEFAULTS).some(
        (defauts) =>
          defauts.consignes.length === consignes.length &&
          defauts.consignes.every((ligne, i) => ligne === consignes[i]),
      )
    )
  }

  /**
   * Prépare (ou efface) la page de garde au changement de modèle : les textes
   * du nouveau modèle remplacent ceux qui n'ont pas été personnalisés, et le
   * barème est initialisé à partir des exercices de la fiche. Choisir un
   * modèle bascule aussi l'habillage en-tête sur « Aucun » : la page de garde
   * porte déjà le titre de la fiche, un second bloc de titre en page 2 ferait
   * doublon (l'utilisateur peut toujours le rétablir ensuite à la main).
   */
  async function applyCoverTemplate() {
    const template = coverPage.template
    if (template === 'aucune') {
      applyDocumentOptions()
      return
    }
    const defauts = COVER_TEMPLATE_DEFAULTS[template as ActiveCoverTemplate]
    documentOptions.coverPage = {
      ...coverPage,
      titre: isDefaultCoverText(coverPage.titre, 'titre')
        ? defauts.titre
        : coverPage.titre,
      matiere: isDefaultCoverText(coverPage.matiere, 'matiere')
        ? defauts.matiere
        : coverPage.matiere,
      session: coverPage.session === '' ? currentSession() : coverPage.session,
      duree: isDefaultCoverText(coverPage.duree, 'duree')
        ? defauts.duree
        : coverPage.duree,
      consignes: isDefaultCoverConsignes(coverPage.consignes)
        ? defauts.consignes
        : coverPage.consignes,
      signatureLabel: isDefaultCoverText(
        coverPage.signatureLabel,
        'signatureLabel',
      )
        ? defauts.signatureLabel
        : coverPage.signatureLabel,
      noteFin: isDefaultCoverText(coverPage.noteFin, 'noteFin')
        ? defauts.noteFin
        : coverPage.noteFin,
      bareme:
        coverPage.bareme.length > 0 ? coverPage.bareme : defaultCoverBareme(),
    }
    // le bandeau « récitation » date la fiche du jour (le champ Session y
    // tient la date) et ouvre d'office deux lignes de réponse par exercice
    if (template === 'recitation') {
      if (coverPage.session === '' || coverPage.session === currentSession()) {
        documentOptions.coverPage.session = formatCoverDate(new Date())
      }
      documentOptions.answerLines = 2
    } else {
      documentOptions.answerLines = defaultTypstDocumentOptions.answerLines
    }
    documentOptions.headerStyle = 'aucun'
    // le modèle « can » a son propre logo (asset fixe, pas embarqué dans le
    // code) : sans ce prefetch, il resterait absent du registre tant qu'une
    // autre action (ex. « Nouvelles données ») ne le redéclencherait pas.
    if (template === 'can') await prefetchStaticImages()
    regenerateDocument({ dropWritingLines: true })
  }

  /** Titre affiché en page de garde et repris dans le pied de page (`titre`
   * Typst) en présentation « Course aux nombres » — au lieu du titre par
   * défaut d'une fiche classique, sans objet ici (il n'y a pas de « fiche
   * d'exercices », juste l'épreuve du jour).
   */
  const CAN_TITLE = 'La course aux nombres'

  /**
   * (Dé)cocher « Présentation Course aux nombres » : la coche vient souvent
   * du réglage automatique de `loadExercises` (fiche 100% « can » → format
   * A5 + page de garde « can » + en-tête « Aucun » (pas de second titre en
   * page 2, la page de garde en porte déjà un) + titre « La course aux
   * nombres », repris dans le pied de page), donc la (dé)cocher doit
   * (dé)faire ces quatre réglages plutôt que de laisser une fiche normale en
   * A5, sans page de garde ni en-tête, ou une fiche « Course aux nombres »
   * dont le pied de page dit encore « Fiche d'exercices ». Sans effet si
   * l'utilisateur a lui-même choisi un autre format/une autre page de
   * garde/un autre en-tête/un autre titre entre-temps.
   */
  function toggleCanMode() {
    if (documentOptions.canMode) {
      if (documentOptions.title === defaultTypstDocumentOptions.title) {
        documentOptions.title = CAN_TITLE
      }
    } else {
      if (documentOptions.pageFormat === 'a5') {
        documentOptions.pageFormat = 'a4'
      }
      if (documentOptions.coverPage.template === 'can') {
        documentOptions.coverPage = {
          ...documentOptions.coverPage,
          template: 'aucune',
        }
      }
      if (documentOptions.headerStyle === 'aucun') {
        documentOptions.headerStyle = defaultTypstDocumentOptions.headerStyle
      }
      if (documentOptions.title === CAN_TITLE) {
        documentOptions.title = defaultTypstDocumentOptions.title
      }
    }
    applyDocumentOptions()
  }

  /**
   * Barème proposé : un point par question, comme la page de garde de la vue
   * PDF (`buildExamExercices` de `lib/LatexGroup.ts`).
   */
  function defaultCoverBareme(): number[] {
    return exercises.map(defaultCoverPoints)
  }

  /**
   * Réaligne le barème sur les exercices de la fiche : les points déjà saisis
   * sont gardés, les exercices ajoutés depuis prennent le barème par défaut.
   */
  function resizeCoverBareme() {
    const defauts = defaultCoverBareme()
    documentOptions.coverPage.bareme = defauts.map(
      (points, index) => coverPage.bareme[index] ?? points,
    )
    applyDocumentOptions()
  }

  /**
   * Points proposés pour l'exercice d'indice `k` : une question, un point
   * (même règle que `defaultCoverBareme`).
   */
  function defaultCoverPointsFor(k: number): number {
    return defaultCoverPoints(exercises[k])
  }

  /**
   * Suit un ajout (ou une duplication) d'exercice dans le barème de la page
   * de garde : sans cela, l'exercice ajouté manquerait dans la grille des
   * points et dans le total jusqu'à un clic sur « Reprendre les exercices de
   * la fiche ». `exercises` contient déjà le nouvel exercice.
   *
   * Le barème n'est ajusté que s'il suivait la fiche un pour un : réaligner
   * un barème que le professeur a lui-même raccourci (exercices groupés,
   * lignes retirées) reviendrait à défaire son travail.
   */
  function insertCoverBaremeRow(index: number) {
    const bareme = documentOptions.coverPage.bareme
    if (bareme.length !== exercises.length - 1) return
    documentOptions.coverPage.bareme = [
      ...bareme.slice(0, index),
      defaultCoverPointsFor(index),
      ...bareme.slice(index),
    ]
  }

  /** Pendant de `insertCoverBaremeRow` pour la suppression d'un exercice */
  function removeCoverBaremeRowFor(index: number) {
    const bareme = documentOptions.coverPage.bareme
    if (bareme.length !== exercises.length + 1) return
    documentOptions.coverPage.bareme = bareme.filter((_, k) => k !== index)
  }

  /**
   * Retire une ligne du barème (comme `TexSettingsPane.removeExamExercice`) :
   * la page de garde peut compter moins de lignes que d'exercices (groupés,
   * ou dont le barème ne suit pas un-à-un la fiche).
   */
  function removeCoverBaremeRow(index: number) {
    documentOptions.coverPage.bareme = coverPage.bareme.filter(
      (_points, i) => i !== index,
    )
    applyDocumentOptions()
  }

  /** Couleur des badges au format `#rrggbb` pour le sélecteur natif */
  const badgeColorHex = $derived(
    (() => {
      const value = documentOptions.badgeColor
      const hex = value.match(/#([0-9a-fA-F]{6})/)
      if (hex != null) return `#${hex[1]}`
      if (value === 'black') return '#000000'
      return '#000000'
    })(),
  )
  /** La couleur active ne fait pas partie des pastilles prédéfinies */
  const isCustomBadgeColor = $derived(
    !BADGE_COLORS.some((color) => color.value === documentOptions.badgeColor),
  )

  let exercises: (IExercice | null)[] = $state([])
  let isLoading = $state(true)
  /**
   * Le code a été modifié à la main depuis sa génération. Les éditions
   * faites par la palette de mise en page ne comptent pas : elles sont
   * reprises telles quelles à la régénération (carry-over), il n'y a donc
   * rien à perdre — l'avertissement ne concerne que la frappe directe.
   */
  let isEdited = false
  /** Édition en cours déclenchée par la palette (et non par la frappe) */
  let isPaletteEdit = false

  /** Édition du code par la palette : ne marque pas le code comme modifié */
  function dispatchPaletteEdit(changes: {
    from: number
    to?: number
    insert: string
  }) {
    if (editorView == null) return
    isPaletteEdit = true
    try {
      editorView.dispatch({ changes })
    } finally {
      isPaletteEdit = false
    }
  }
  let isCompiling = $state(false)
  /**
   * Aperçu en attente d'une compilation demandée par un bouton (palette de
   * mise en page, sujet affiché, nouvelles données...), de la demande à la
   * fin de la compilation : l'aperçu est voilé et ses boutons inactifs, pour
   * qu'on ne clique pas à nouveau sur un aperçu pas encore à jour (une fiche
   * à plusieurs sujets avec des figures peut mettre plusieurs secondes). La
   * frappe dans l'éditeur ne voile pas l'aperçu.
   */
  let isPreviewBusy = $state(false)
  let isCompilerLoading = $state(false)
  /**
   * Vrai seulement une fois confirmé que le compilateur n'est PAS en cache
   * (téléchargement à prévoir). Par défaut faux : on affiche un message
   * neutre tant qu'on ne sait pas, pour éviter un clignotement « première
   * visite » sur les rechargements où le compilateur est déjà en cache.
   */
  let compilerFirstVisit = $state(false)
  let isGeneratingPdf = $state(false)
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
        [`${MOD_KEY} + Entrée`, 'Compiler tout de suite'],
        [`${MOD_KEY} + Maj + [ / ]`, 'Replier / déplier le bloc'],
      ],
    },
  ]

  /** Diagnostics de la dernière compilation, traduits en français */
  let diagnostics: TypstDiagnostic[] = $state([])
  /** Le panneau d'erreurs est replié (l'utilisateur l'a fermé) */
  let isDiagnosticsCollapsed = $state(false)
  let svgContent = $state('')

  const errorCount = $derived(countErrors(diagnostics))
  const diagnosticsSummary = $derived(summarizeDiagnostics(diagnostics))
  /**
   * L'aperçu affiché ne correspond plus au code : la compilation a échoué et
   * c'est le rendu précédent qui reste à l'écran. Sans rien de visible en
   * mode « Code », la remarque n'a pas lieu d'être.
   */
  const isPreviewStale = $derived(
    errorCount > 0 && svgContent !== '' && displayMode !== 'code',
  )

  /**
   * Dernier code Typst qui a compilé, et son horodatage. Sert au bouton de
   * retour arrière proposé quand la compilation échoue : le professeur
   * récupère une fiche qui s'affiche, sans avoir à retrouver lui-même
   * la modification fautive.
   */
  let lastGoodCode: string | null = null
  let lastGoodAt: Date | null = $state(null)
  /** Vrai quand le code courant diffère de la dernière version qui compilait */
  let canRestoreLastGood = $state(false)

  let editorEl: HTMLDivElement = $state()!
  let editorView: EditorView | null = null

  let previewPages: PreviewPageGeometry[] = $state([])
  let previewViewBox = $state({ width: 0, height: 0 })
  /** Repères publiés par le document compilé (palette de mise en page) */
  let anchors: TypstAnchor[] = $state([])
  /**
   * Mise en page des questions, lue dans le code courant, par préfixe de
   * variables (`ex1` pour l'énoncé, `ex1-corr` pour la correction)
   */
  let tasksLayoutValues: Record<string, TasksLayoutValue> = $state({})
  /** Insertions (texte/section) présentes dans le code, par repère de gap */
  let insertionValues: Record<number, string[]> = $state({})
  /** Insertions (texte/section) présentes juste avant chaque correction, par numéro d'exercice */
  let insertionCorrectionValues: Record<number, string[]> = $state({})
  /**
   * Numéros (1-based) des exercices fusionnés avec le précédent, lus dans
   * le code courant (bouton de la palette de mise en page).
   */
  let mergedExercises: number[] = $state([])
  /**
   * Numéros (1-based) des exercices groupés en colonnes avec le suivant
   * (grid manuelle), lus dans le code courant.
   */
  let multicolGroups: number[] = $state([])

  /** Variables d'en-tête de la fiche, lues dans le code courant */
  let headerValues = $state({ titre: '', 'sous-titre': '', entete: '' })
  /** Variables texte de la page de garde (`couverture-*`), lues dans le code courant */
  let coverValues = $state({
    titre: '',
    session: '',
    matiere: '',
    etablissement: '',
    duree: '',
    signatureLabel: '',
    noteFin: '',
  })
  /** Consignes de la page de garde (`couverture-consignes`), lues dans le code courant */
  let coverConsignesValue: string[] = $state([])
  /** Texte du pied de page (`#let pied-page = "..."`), lu dans le code courant */
  let footerValue = $state('')
  /** URL des QR-codes globaux, par sujet, lues dans le code courant */
  let qrCodeUrlValues = $state<Record<number, string>>({})
  /** Nombre de colonnes du document (`#let colonnes`), lu dans le code */
  let documentColumns = $state(1)
  /** Zoom de chaque figure (`#let fig-N-zoom`), lu dans le code courant */
  let figureZoomValues: Record<number, number> = $state({})
  /** Largeur de la colonne Réponse du tableau « Course aux nombres » (`#let can-reponse`, en %) */
  let canAnswerWidth = $state(CAN_ANSWER_WIDTH_DEFAULT)
  /** Alignement de chaque figure (`#let fig-N-align`), lu dans le code courant */
  let figureAlignValues: Record<number, 'left' | 'center' | 'right'> = $state(
    {},
  )
  /**
   * Zoom de chaque exercice statique sans source .typ (`#let exo-N-zoom`),
   * lu dans le code courant
   */
  let exerciseZoomValues: Record<number, number> = $state({})
  /**
   * Zoom de chaque correction statique sans source _cor.typ
   * (`#let exo-N-corr-zoom`), lu dans le code courant
   */
  let exerciseCorrectionZoomValues: Record<number, number> = $state({})
  /** Exercice dont la modale de réglages (panneau Settings) est ouverte */
  let settingsExerciseIndex: number | null = $state(null)
  let workedExamples: number[] = $state([])
  const settingsExercise = $derived(
    settingsExerciseIndex !== null
      ? (exercises[settingsExerciseIndex] ?? null)
      : null,
  )
  /**
   * Contrôles de mise en page des questions (colonnes, espacement,
   * numérotation) de l'exercice dont la modale de réglages est ouverte,
   * passés en prop à `Settings.svelte` — `undefined` masque la section (pas
   * de liste de questions à régler, ex. exercice à question unique, statique
   * ou mode « Course aux nombres »). Mêmes variables Typst que la palette de
   * mise en page de l'aperçu (`adjustColumns`/`adjustGutter`) : les deux
   * emplacements restent synchronisés.
   */
  const settingsTypstStyle = $derived.by(() => {
    if (settingsExerciseIndex === null) return undefined
    const target = `ex${settingsExerciseIndex + 1}`
    const layout = tasksLayoutValues[target]
    if (layout == null) return undefined
    return {
      columnsLabel:
        layout.columns === '"auto-fit"' ? 'auto' : String(layout.columns),
      gutterLabel:
        layout.gutter === 'interligne-questions' ? 'auto' : layout.gutter,
      numberingOptions: QUESTION_NUMBERING_STYLES.map((style) => ({
        value: style,
        label: QUESTION_NUMBERING_STYLE_LABELS[style],
      })),
      numberingValue: resolveNumberingStyle(target),
      onAdjustColumns: (delta: number) => adjustColumns(target, delta),
      onAdjustGutter: (delta: number) => adjustGutter(target, delta),
      onSetNumbering: (value: string) =>
        setNumberingStyle(target, value as QuestionNumberingStyle),
    }
  })
  /** Surcharges de code Typst par exercice (modale d'édition), lues dans le code */
  let codeOverrideValues: Record<number, string> = $state({})
  /** Surcharges de code Typst de la correction par exercice, lues dans le code */
  let codeOverrideCorrectionValues: Record<number, string> = $state({})
  /** Lignes en pointillés réglées par exercice (palette), lues dans le code */
  let writingLinesValues: Record<number, WritingLinesSetting> = $state({})
  /** Points de chaque exercice affichés sur la fiche (palette de l'aperçu) */
  const exercisePointValues = $derived(
    groupedExercisePoints(
      exercisePoints(exercises.map(defaultCoverPoints), documentOptions) ?? [],
      mergedExercises,
    ),
  )
  /** Titres d'exercice modifiés dans la palette (`TypstCarryOver.exerciseTitles`) */
  let exerciseTitleValues: Record<number, string> = $state({})
  /** Numéro de l'exercice dont la modale d'édition du code Typst est ouverte */
  let codeEditNum: number | null = $state(null)
  /** Partie éditée par la modale : énoncé ou correction de `codeEditNum` */
  let codeEditPart: 'enonce' | 'correction' = $state('enonce')
  /** Brouillon de la modale d'édition du code Typst */
  let codeEditDraft = $state('')
  /**
   * Fiche à plusieurs sujets : la modale reporte aussi la modification sur
   * les autres sujets (voir `propagateExerciseCode`).
   */
  let codeEditApplyToAll = $state(true)
  /** Surcharges d'énoncé par ligne du tableau « Course aux nombres », lues dans le code */
  let codeOverrideCanValues: Record<number, string> = $state({})
  /** Surcharges de réponse par ligne du tableau « Course aux nombres », lues dans le code */
  let codeOverrideCanReponseValues: Record<number, string> = $state({})
  /** Numéro de ligne (1-based) du tableau « Course aux nombres » dont la modale d'édition est ouverte */
  let canRowEditNum: number | null = $state(null)
  /** Brouillons de la modale d'édition d'une ligne « Course aux nombres » */
  let canRowEditEnonceDraft = $state('')
  let canRowEditReponseDraft = $state('')
  /**
   * La ligne en cours d'édition partage l'énoncé de la précédente (questions
   * liées) : elle n'a pas de cellule « Énoncé » propre, la modale n'en
   * propose donc que la réponse.
   */
  let canRowEditSharesEnonce = $state(false)
  /** Message de confirmation affiché après un clic sur un bouton « Copier » de la modale */
  let codeCopyStatus = $state('')
  let codeCopyStatusTimer: ReturnType<typeof setTimeout>

  /** Copie `text` dans le presse-papier et affiche une confirmation temporaire */
  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      codeCopyStatus = `${label} copié dans le presse-papier.`
    } catch {
      codeCopyStatus =
        'Impossible de copier automatiquement : sélectionnez le texte et copiez-le manuellement.'
    }
    clearTimeout(codeCopyStatusTimer)
    codeCopyStatusTimer = setTimeout(() => {
      codeCopyStatus = ''
    }, 3000)
  }

  /** Copie le brouillon de la modale tel quel, sans préambule */
  function copyExerciseCode() {
    void copyToClipboard(codeEditDraft, 'Le code')
  }

  /**
   * Copie le brouillon de la modale précédé d'un préambule minimal (imports,
   * aides et réglages qu'il utilise réellement) : contrairement au code seul,
   * ce texte compile de façon autonome (`typst compile`), utile pour réutiliser
   * l'exercice dans un autre fichier Typst.
   */
  function copyExerciseCodeWithPreamble(num: number) {
    const carryOver =
      editorView != null ? activeCarryOver(harvestCarryOver(currentCode())) : {}
    const standalone = buildStandaloneExerciseCode(
      buildAllVersionInputs()[previewVersion],
      num,
      documentOptions,
      carryOver,
      codeEditDraft,
      codeEditPart,
    )
    void copyToClipboard(standalone, 'Le code avec préambule')
  }

  /** Convertit les repères (pt, par page) en positions % sur l'aperçu */
  function computeOverlayWidgets(
    anchorList: TypstAnchor[],
    pages: PreviewPageGeometry[],
    viewBox: { width: number; height: number },
    columns: number,
    exerciseCount: number,
  ): OverlayWidget[] {
    if (viewBox.width <= 0 || viewBox.height <= 0) return []
    const widgets: OverlayWidget[] = []
    for (const anchor of anchorList) {
      const page = pages[anchor.page - 1]
      if (page == null) continue
      const isTasks = anchor.kind === 'tasks' || anchor.kind === 'tasks-corr'
      widgets.push({
        kind: isTasks
          ? 'tasks'
          : (anchor.kind as
              | 'exo'
              | 'version-exo'
              | 'corr'
              | 'gap'
              | 'header'
              | 'cover'
              | 'footer'
              | 'qr-code'
              | 'version-label'
              | 'figure'
              | 'can-row'
              | 'can-table'),
        num: anchor.num,
        // les variables de la correction sont indépendantes de l'énoncé
        target: isTasks
          ? anchor.kind === 'tasks-corr'
            ? `ex${anchor.num}-corr`
            : `ex${anchor.num}`
          : undefined,
        left: (anchor.x / viewBox.width) * 100,
        top: ((page.y + anchor.y) / viewBox.height) * 100,
        // les contrôles des questions vont dans la marge la plus proche :
        // à gauche pour la colonne de gauche, à droite sinon
        side: anchor.x < page.width / 2 ? 'left' : 'right',
        sections: anchorSections(
          anchor,
          anchorList,
          pages,
          columns,
          exerciseCount,
          multicolGroups,
        ),
      })
    }
    return widgets
  }
  /**
   * Repères utilisés par la palette. Sujets enchaînés : la fiche entière est
   * compilée, chaque sujet porte les mêmes repères ; la palette agit sur des
   * réglages communs aux sujets et ne garde que ceux du premier (énoncés et
   * corrections). Les repères arrivent dans l'ordre du document.
   */
  function paletteAnchors(all: TypstAnchor[]): TypstAnchor[] {
    if (!chainActive) return all
    let skip = false
    return all.filter((anchor) => {
      if (anchor.kind === 'subject-start') skip = anchor.num > 0
      else if (anchor.kind === 'subject-corr') skip = anchor.num > 0
      else if (anchor.kind === 'subject-end' && anchor.num > 0) {
        skip = false
        return false
      }
      return !skip
    })
  }
  const overlayWidgets = $derived(
    computeOverlayWidgets(
      paletteAnchors(anchors),
      previewPages,
      previewViewBox,
      documentColumns,
      exercises.length,
    ),
  )
  /**
   * Section (énoncé ou correction d'un exercice) sous le pointeur : la
   * palette n'affiche que les contrôles de celle-ci, pour que les barres de
   * plusieurs exercices (voisins, ou côte à côte en multicolonne) ne se
   * superposent pas.
   */
  let hoveredSection: SectionKey | null = $state(null)

  /** Convertit la position du pointeur en point de l'aperçu (page 1-based, pt) */
  function previewPointFromEvent(
    event: MouseEvent,
  ): { page: number; x: number; y: number } | null {
    if (previewViewBox.width <= 0 || previewViewBox.height <= 0) return null
    const container = event.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    const x = ((event.clientX - rect.left) / rect.width) * previewViewBox.width
    const y = ((event.clientY - rect.top) / rect.height) * previewViewBox.height
    const pageIndex = pageIndexAt(previewPages, y)
    if (pageIndex === -1) return null
    return { page: pageIndex + 1, x, y: y - previewPages[pageIndex].y }
  }

  function updateHoveredSection(event: PointerEvent) {
    // pointeur sur un contrôle de la palette (barre, panneau ouvert) : on
    // garde la section courante, même si la barre déborde sur la section
    // voisine, sans quoi elle disparaîtrait sous le pointeur
    const target = event.target as HTMLElement
    if (target.closest('.typst-pill, .typst-panel') != null) return
    const point = previewPointFromEvent(event)
    const anchor =
      point == null
        ? null
        : locateSectionAnchor(
            anchors,
            previewPages,
            documentColumns,
            point.page,
            point.x,
            point.y,
            multicolGroups,
          )
    const key = anchor == null ? null : sectionKeyOf(anchor)
    if (key !== hoveredSection) hoveredSection = key
  }

  /**
   * Relit dans le code les données de la palette : valeurs
   * `#let exN-colonnes`/`#let exN-gutter` (et variantes `-corr`), variables
   * d'en-tête et insertions marquées.
   */
  function refreshTasksLayout(code: string) {
    const harvested = activeCarryOver(harvestCarryOver(code))
    code = subjectEditorCode(code, previewVersion)
    const values: Record<string, TasksLayoutValue> = {}
    const defaults = (): TasksLayoutValue => ({
      columns: '"auto-fit"',
      gutter: 'interligne-questions',
    })
    // « colonnes-questions »/« interligne-questions » (défauts du document,
    // voir Réglages > Styles) sont résolus vers la valeur qu'ils désignent
    // réellement : sans ça, un exercice non réglé depuis la palette afficherait
    // le nom de la variable au lieu du nombre de colonnes/espacement courant.
    for (const match of code.matchAll(
      /^#let (ex\d+(?:-corr)?(?:-qcm)?)-colonnes = (.+?)\s*$/gm,
    )) {
      const raw = match[2].trim()
      const value =
        raw === 'colonnes-questions'
          ? documentOptions.questionsColumns === 'auto'
            ? '"auto-fit"'
            : String(documentOptions.questionsColumns)
          : raw
      ;(values[match[1]] ??= defaults()).columns = /^\d+$/.test(value)
        ? Number(value)
        : value
    }
    for (const match of code.matchAll(
      /^#let (ex\d+(?:-corr)?(?:-qcm)?)-gutter = (\S+)/gm,
    )) {
      ;(values[match[1]] ??= defaults()).gutter =
        match[2] === 'interligne-questions'
          ? `${documentOptions.questionsGutter}em`
          : match[2]
    }
    // pas de variante `-qcm` : la numérotation des propositions de QCM n'est
    // pas réglable (voir buildTypstDocument.ts)
    for (const match of code.matchAll(
      /^#let (ex\d+(?:-corr)?)-numerotation = (\S+)/gm,
    )) {
      ;(values[match[1]] ??= defaults()).numbering = match[2]
    }
    tasksLayoutValues = values
    insertionValues = harvested.insertions ?? {}
    insertionCorrectionValues = harvested.insertionsCorrection ?? {}
    mergedExercises = harvested.merges ?? []
    multicolGroups = harvested.multicolGroups ?? []
    workedExamples = harvested.workedExamples ?? []
    codeOverrideValues = harvested.codeOverrides ?? {}
    codeOverrideCorrectionValues = harvested.codeOverridesCorrection ?? {}
    codeOverrideCanValues = harvested.codeOverridesCan ?? {}
    codeOverrideCanReponseValues = harvested.codeOverridesCanReponse ?? {}
    writingLinesValues = harvested.writingLines ?? {}
    exerciseTitleValues = harvested.exerciseTitles ?? {}
    const columns = code.match(/^#let colonnes = (\d+)/m)
    documentColumns = columns != null ? Number(columns[1]) : 1
    const figureZoom: Record<number, number> = {}
    for (const match of code.matchAll(/^#let fig-(\d+)-zoom = ([\d.]+)/gm)) {
      figureZoom[Number(match[1])] = Number(match[2])
    }
    // figure d'un autre sujet qui suit celle du sujet A
    // (`#let fig-5-zoom = fig-1-zoom`, voir `sharedFigureNumber`)
    for (const match of code.matchAll(
      /^#let fig-(\d+)-zoom = fig-(\d+)-zoom$/gm,
    )) {
      figureZoom[Number(match[1])] = figureZoom[Number(match[2])] ?? 1
    }
    figureZoomValues = figureZoom
    const canAnswerWidthMatch = code.match(/^#let can-reponse = ([\d.]+)/m)
    canAnswerWidth =
      canAnswerWidthMatch != null
        ? Number(canAnswerWidthMatch[1])
        : CAN_ANSWER_WIDTH_DEFAULT
    const figureAlign: Record<number, 'left' | 'center' | 'right'> = {}
    for (const match of code.matchAll(
      /^#let fig-(\d+)-align = (left|center|right)/gm,
    )) {
      figureAlign[Number(match[1])] = match[2] as 'left' | 'center' | 'right'
    }
    for (const match of code.matchAll(
      /^#let fig-(\d+)-align = fig-(\d+)-align$/gm,
    )) {
      figureAlign[Number(match[1])] = figureAlign[Number(match[2])] ?? 'center'
    }
    figureAlignValues = figureAlign
    const exerciseZoom: Record<number, number> = {}
    for (const match of code.matchAll(/^#let exo-(\d+)-zoom = ([\d.]+)/gm)) {
      exerciseZoom[Number(match[1])] = Number(match[2])
    }
    exerciseZoomValues = exerciseZoom
    const exerciseCorrectionZoom: Record<number, number> = {}
    for (const match of code.matchAll(
      /^#let exo-(\d+)-corr-zoom = ([\d.]+)/gm,
    )) {
      exerciseCorrectionZoom[Number(match[1])] = Number(match[2])
    }
    exerciseCorrectionZoomValues = exerciseCorrectionZoom
    const header = { titre: '', 'sous-titre': '', entete: '' }
    for (const name of ['titre', 'sous-titre', 'entete'] as const) {
      const match = new RegExp(
        `^#let ${name} = "((?:[^"\\\\]|\\\\.)*)"`,
        'm',
      ).exec(code)
      if (match != null) {
        header[name] = match[1].replace(/\\(.)/g, '$1')
      }
    }
    headerValues = header
    const cover = {
      titre: '',
      session: '',
      matiere: '',
      etablissement: '',
      duree: '',
      signatureLabel: '',
      noteFin: '',
    }
    // `noteFin` (JS) ↔ `note-fin` (variable Typst, voir `coverDeclarationLines`)
    const coverFieldNames: [keyof typeof cover, string][] = [
      ['titre', 'titre'],
      ['session', 'session'],
      ['matiere', 'matiere'],
      ['etablissement', 'etablissement'],
      ['duree', 'duree'],
      ['signatureLabel', 'signature'],
      ['noteFin', 'note-fin'],
    ]
    for (const [jsName, typstName] of coverFieldNames) {
      const match = new RegExp(
        `^#let couverture-${typstName} = "((?:[^"\\\\]|\\\\.)*)"`,
        'm',
      ).exec(code)
      if (match != null) {
        cover[jsName] = match[1].replace(/\\(.)/g, '$1')
      }
    }
    coverValues = cover
    // le tableau tient sur une seule ligne (voir `coverDeclarationLines`) :
    // chaque littéral entre guillemets y est extrait puis déséchappé
    const consignesMatch = /^#let couverture-consignes = \((.*)\)$/m.exec(code)
    coverConsignesValue =
      consignesMatch != null
        ? [...consignesMatch[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) =>
            m[1].replace(/\\(.)/g, '$1'),
          )
        : []
    const footerMatch = /^#let pied-page = "((?:[^"\\]|\\.)*)"/m.exec(code)
    footerValue =
      footerMatch != null ? footerMatch[1].replace(/\\(.)/g, '$1') : ''
    qrCodeUrlValues = Object.fromEntries(
      [
        ...code.matchAll(
          /^#let qr-code-global-url(?:-(\d+))? = "((?:[^"\\]|\\.)*)"/gm,
        ),
      ].map((match) => [
        Number(match[1] ?? 0),
        match[2].replace(/\\(.)/g, '$1'),
      ]),
    )
  }

  /** Modifie la ligne `#let <prefix>-<clef> = ...` (édition ciblée, annulable) */
  function setTasksVariable(
    target: string,
    key: 'colonnes' | 'gutter' | 'numerotation',
    value: string,
  ) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = new RegExp(`^#let ${target}-${key} = .*$`, 'm').exec(doc)
    if (match == null) return
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let ${target}-${key} = ${value}`,
    })
  }

  function adjustColumns(target: string, delta: number) {
    const raw = tasksLayoutValues[target]?.columns ?? '"auto-fit"'
    if (typeof raw !== 'number') {
      if (delta > 0) setTasksVariable(target, 'colonnes', String(1))
      return
    }
    const current = raw
    const next = current + delta
    if (next < 1) {
      setTasksVariable(target, 'colonnes', '"auto-fit"')
      return
    }
    const clamped = Math.min(4, next)
    if (clamped !== current)
      setTasksVariable(target, 'colonnes', String(clamped))
  }

  /** Pas d'ajustement de l'espacement vertical des questions, en em */
  const GUTTER_STEP = 0.1
  function adjustGutter(target: string, delta: number) {
    const raw = tasksLayoutValues[target]?.gutter ?? 'interligne-questions'
    // « interligne-questions » (le défaut global) vaut 1,2 em : le premier
    // clic le remplace par une valeur explicite pour cet exercice
    const current = raw.endsWith('em') ? parseFloat(raw) : 1.2
    const next = Math.max(
      0,
      Math.round((current + delta * GUTTER_STEP) * 100) / 100,
    )
    setTasksVariable(target, 'gutter', `${next}em`)
  }

  /**
   * Style de numérotation actuellement appliqué à la liste `target`
   * (`ex1`, `ex1-corr`…) : celui réglé pour cet exercice précis s'il existe,
   * sinon celui du document (modale Réglages). Un littéral qui ne correspond
   * à aucun style connu (retouche manuelle du code) retombe aussi sur celui
   * du document.
   */
  function resolveNumberingStyle(target: string): QuestionNumberingStyle {
    const raw = tasksLayoutValues[target]?.numbering
    if (raw == null || raw === 'numerotation-questions') {
      return documentOptions.questionNumberingStyle
    }
    return parseNumberingLiteral(raw) ?? documentOptions.questionNumberingStyle
  }

  /** Règle le style de numérotation de la liste `target`, pour cet exercice seul */
  function setNumberingStyle(target: string, style: QuestionNumberingStyle) {
    setTasksVariable(target, 'numerotation', questionNumberingLabel(style))
  }

  /** Pas d'ajustement et bornes (en %) de la largeur de la colonne Réponse du tableau « Course aux nombres » */
  const CAN_ANSWER_WIDTH_STEP = 2
  const CAN_ANSWER_WIDTH_MIN = 10
  const CAN_ANSWER_WIDTH_MAX = 60
  /** Largeur de la colonne « Réponse » : édition ciblée de `#let can-reponse` */
  function adjustCanAnswerWidth(delta: number) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = /^#let can-reponse = [\d.]+/m.exec(doc)
    if (match == null) return
    const next = Math.min(
      CAN_ANSWER_WIDTH_MAX,
      Math.max(
        CAN_ANSWER_WIDTH_MIN,
        canAnswerWidth + delta * CAN_ANSWER_WIDTH_STEP,
      ),
    )
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let can-reponse = ${next}`,
    })
  }

  /** Pas d'ajustement du zoom d'une figure, et bornes (20 % à 300 %) */
  const FIGURE_ZOOM_STEP = 0.1
  /**
   * Zoom d'une figure. Une figure du sujet A entraîne celles des sujets B,
   * C... qui la suivent (`#let fig-5-zoom = fig-1-zoom`) ; régler une figure
   * d'un autre sujet remplace ce renvoi par sa propre valeur : le réglage ne
   * vaut alors que pour ce sujet.
   */
  function adjustFigureZoom(figNum: number, delta: number) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = new RegExp(`^#let fig-${figNum}-zoom = .*$`, 'm').exec(doc)
    if (match == null) return
    const current = figureZoomValues[figNum] ?? 1
    const next = Math.min(
      3,
      Math.max(
        0.2,
        Math.round((current + delta * FIGURE_ZOOM_STEP) * 100) / 100,
      ),
    )
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let fig-${figNum}-zoom = ${next}`,
    })
  }

  /**
   * Zoom d'un exercice statique sans source .typ (image scannée seule),
   * mêmes bornes/pas que `adjustFigureZoom`
   */
  /**
   * Titre de l'exercice `num` saisi dans la palette (`null` : retour au titre
   * par défaut, vide pour un groupe fusionné ; chaîne vide : pas de titre).
   * Édition ciblée de la ligne `#let exo-N-titre = ...`, sans régénération.
   */
  function setExerciseTitle(num: number, value: string | null) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = new RegExp(`^#let exo-${num}-titre = .*$`, 'm').exec(doc)
    if (match == null) return
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: exerciseTitleLine(
        num,
        defaultExerciseTitle(
          num,
          exercises[num - 1]?.titre ?? '',
          mergedExercises,
        ),
        value ?? undefined,
      ),
    })
  }

  /**
   * Points de l'exercice ou du groupe `num` saisis dans la palette : ils vont
   * dans le barème de la page de garde (source unique des points, voir
   * `exercisePoints`), réaligné au besoin sur les exercices de la fiche.
   */
  function setExercisePoints(num: number, value: number) {
    const bareme = exercisePoints(
      exercises.map(defaultCoverPoints),
      documentOptions,
    )
    if (bareme == null || !Number.isFinite(value) || value < 0) return
    documentOptions.coverPage.bareme = setGroupedExercisePoints(
      bareme,
      mergedExercises,
      num,
      value,
    )
    applyDocumentOptions()
  }

  function adjustExerciseZoom(num: number, delta: number) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = new RegExp(`^#let exo-${num}-zoom = .*$`, 'm').exec(doc)
    if (match == null) return
    const current = exerciseZoomValues[num] ?? 1
    const next = Math.min(
      3,
      Math.max(
        0.2,
        Math.round((current + delta * FIGURE_ZOOM_STEP) * 100) / 100,
      ),
    )
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let exo-${num}-zoom = ${next}`,
    })
  }

  /**
   * Zoom d'une correction statique sans source _cor.typ (image scannée
   * seule), même bornes/pas que `adjustExerciseZoom` — indépendant du zoom
   * de l'énoncé (`adjustExerciseZoom`)
   */
  function adjustExerciseCorrectionZoom(num: number, delta: number) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = new RegExp(`^#let exo-${num}-corr-zoom = .*$`, 'm').exec(doc)
    if (match == null) return
    const current = exerciseCorrectionZoomValues[num] ?? 1
    const next = Math.min(
      3,
      Math.max(
        0.2,
        Math.round((current + delta * FIGURE_ZOOM_STEP) * 100) / 100,
      ),
    )
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let exo-${num}-corr-zoom = ${next}`,
    })
  }

  /**
   * Alignement d'une figure : gauche, centré ou à droite (pour les autres
   * sujets, même règle que `adjustFigureZoom`)
   */
  function setFigureAlign(figNum: number, align: 'left' | 'center' | 'right') {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = new RegExp(`^#let fig-${figNum}-align = .*$`, 'm').exec(doc)
    if (match == null) return
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let fig-${figNum}-align = ${align}`,
    })
  }

  /**
   * Exercices statiques (annale scannée, éventuellement convertie en `.typ`),
   * par numéro : contenu figé, aucune régénération possible (voir `regenerate`).
   */
  const staticExercises = $derived(
    Object.fromEntries(
      exercises.map((exercise, k) => [
        k + 1,
        exercise?.typeExercice === 'statique',
      ]),
    ) as Record<number, boolean>,
  )

  /**
   * Exercices dont le code Typst n'est pas éditable : exercices statiques
   * sans fichier source `.typ` (`typ: true` absent du référentiel), qui ne
   * sont donc qu'une image scannée (voir `applyTypSourcesForStaticExercises`)
   * — leur icône crayon (« Éditer le code Typst ») est masquée.
   */
  const nonEditableStaticExercises = $derived(
    Object.fromEntries(
      exercises.map((exercise, k) => [
        k + 1,
        exercise?.typeExercice === 'statique' &&
          (exercise.uuid == null ||
            getStaticExerciceTypUrl(exercise.uuid) == null),
      ]),
    ) as Record<number, boolean>,
  )

  /**
   * Exercices dont la correction n'est pas éditable : exercices statiques
   * sans fichier source `_cor.typ` (`typ: true` sans correction rédigée en
   * Typst), qui n'ont donc qu'une correction scannée (image) — leur icône
   * crayon sur la correction est masquée. Un exercice non statique sans
   * correction n'a de toute façon pas de repère `tasks-corr` où l'afficher.
   */
  const nonEditableCorrections = $derived(
    Object.fromEntries(
      exercises.map((exercise, k) => [
        k + 1,
        exercise?.typeExercice === 'statique' &&
          (exercise.uuid == null ||
            getStaticExerciceCorTypUrl(exercise.uuid) == null),
      ]),
    ) as Record<number, boolean>,
  )

  let imageGeometries: ImageGeometry[] = $state([])
  let isImageCutHintDismissed = $state(false)
  /** Accès à la découpe des seules images qui dépassent réellement la page. */
  const imageCutTargets = $derived(
    overflowingImages(imageGeometries, previewPages).filter(({ num, part }) =>
      part === 'enonce'
        ? nonEditableStaticExercises[num]
        : documentOptions.showCorrections && nonEditableCorrections[num],
    ),
  )

  /**
   * Nombre de questions par exercice (null : non réglable), pour la palette.
   * Toujours `null` pour un exercice statique : son nombre de questions est
   * figé par son contenu (image ou `.typ`), pas de génération possible.
   */
  const questionCounts = $derived(
    Object.fromEntries(
      exercises.map((exercise, k) => [
        k + 1,
        exercise?.typeExercice === 'statique'
          ? null
          : (exercise?.nbQuestions ?? null),
      ]),
    ) as Record<number, number | null>,
  )

  /** Change le nombre de questions de l'exercice num et régénère le code */
  function changeQuestionCount(num: number, delta: number) {
    const exercise = exercises[num - 1]
    if (exercise?.nbQuestions == null) return
    const next = Math.max(1, exercise.nbQuestions + delta)
    if (next === exercise.nbQuestions || !confirmOverwrite()) return
    // fige le contenu courant : les questions déjà affichées gardent leurs
    // valeurs (la régénération avec un autre nbQuestions rebrasse les tirages)
    const current = buildInputs()[num - 1]
    // ne s'applique qu'aux exercices dont `listeQuestions` compte une entrée
    // par question : certains (ex. 5N1J-3) assemblent tout le tableau en une
    // seule chaîne quel que soit `nbQuestions` — geler cette unique entrée
    // écraserait alors intégralement le contenu fraîchement régénéré (plus de
    // nouvelle ligne, valeurs de l'ancien tableau). Pour ceux-là on régénère
    // entièrement, comme documenté ci-dessus pour les sujets dérivés.
    const isParQuestion =
      exercise.listeQuestions?.length === exercise.nbQuestions
    if (current.warning == null && isParQuestion) {
      frozenInputs.set(exercise, {
        intro: current.intro,
        consigne: current.consigne ?? '',
        introduction: current.introduction ?? '',
        introCorrection: current.introCorrection,
        questions: current.questions,
        corrections: current.corrections,
        shortAnswers: current.shortAnswers ?? [],
        canQuestions: current.canQuestions ?? [],
        canAnswers: current.canAnswers ?? [],
      })
    } else {
      frozenInputs.delete(exercise)
    }
    // le barème suit le nombre de questions tant qu'il n'a pas été réglé à la
    // main : la valeur proposée est d'un point par question, une question de
    // plus vaut donc un point de plus
    const bareme = documentOptions.coverPage.bareme
    if (bareme[num - 1] === exercise.nbQuestions) {
      documentOptions.coverPage.bareme = bareme.map((points, k) =>
        k === num - 1 ? next : points,
      )
    }
    exercise.nbQuestions = next
    const params = get(exercicesParams)
    if (params[num - 1] != null) params[num - 1].nbQuestions = next
    exercicesParams.update((list) => list)
    // nouvelle référence de tableau (et pas `exercises = exercises`, sans
    // effet en mode runes) : le compteur « - n q + » de la palette lit
    // `questionCounts`, dérivé de `exercises`, qui ne se recalcule que si la
    // valeur change — les exercices sont des instances de classe, dont les
    // mutations ne sont pas suivies par le proxy de `$state`
    exercises = [...exercises]
    persistPreferences()
    const code = buildCode()
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /**
   * Décale les réglages de la palette après la suppression de l'exercice
   * `removed` : `ex3` devient `ex2`, etc. Les insertions qui suivaient
   * l'exercice supprimé sont rattachées au repère précédent.
   */
  function shiftCarryOver(
    carryOver: ReturnType<typeof harvestCarryOver>,
    removed: number,
  ): ReturnType<typeof harvestCarryOver> {
    const tasksLayout: NonNullable<typeof carryOver.tasksLayout> = {}
    for (const [prefix, layout] of Object.entries(
      carryOver.tasksLayout ?? {},
    )) {
      const match = prefix.match(/^ex(\d+)((?:-corr)?(?:-qcm)?)$/)
      if (match == null) continue
      const n = Number(match[1])
      if (n === removed) continue
      tasksLayout[n > removed ? `ex${n - 1}${match[2] ?? ''}` : prefix] = layout
    }
    const insertions: NonNullable<typeof carryOver.insertions> = {}
    for (const [key, lines] of Object.entries(carryOver.insertions ?? {})) {
      const n = Number(key)
      const target = n >= removed ? Math.max(0, n - 1) : n
      insertions[target] = [...(insertions[target] ?? []), ...lines]
    }
    // l'exercice supprimé ne peut plus être fusionné ; les suivants décalent
    const merges = (carryOver.merges ?? [])
      .filter((n) => n !== removed)
      .map((n) => (n > removed ? n - 1 : n))
    const multicolGroups = (carryOver.multicolGroups ?? [])
      .filter((n) => n !== removed && n + 1 !== removed)
      .map((n) => (n > removed ? n - 1 : n))
    const codeOverrides: NonNullable<typeof carryOver.codeOverrides> = {}
    for (const [key, value] of Object.entries(carryOver.codeOverrides ?? {})) {
      const n = Number(key)
      if (n === removed) continue
      codeOverrides[n > removed ? n - 1 : n] = value
    }
    const codeOverridesCorrection: NonNullable<
      typeof carryOver.codeOverridesCorrection
    > = {}
    for (const [key, value] of Object.entries(
      carryOver.codeOverridesCorrection ?? {},
    )) {
      const n = Number(key)
      if (n === removed) continue
      codeOverridesCorrection[n > removed ? n - 1 : n] = value
    }
    const insertionsCorrection: NonNullable<
      typeof carryOver.insertionsCorrection
    > = {}
    for (const [key, value] of Object.entries(
      carryOver.insertionsCorrection ?? {},
    )) {
      const n = Number(key)
      if (n === removed) continue
      insertionsCorrection[n > removed ? n - 1 : n] = value
    }
    const writingLines: NonNullable<typeof carryOver.writingLines> = {}
    for (const [key, value] of Object.entries(carryOver.writingLines ?? {})) {
      const n = Number(key)
      if (n === removed) continue
      writingLines[n > removed ? n - 1 : n] = value
    }
    const exerciseZoom: NonNullable<typeof carryOver.exerciseZoom> = {}
    for (const [key, value] of Object.entries(carryOver.exerciseZoom ?? {})) {
      const n = Number(key)
      if (n === removed) continue
      exerciseZoom[n > removed ? n - 1 : n] = value
    }
    const exerciseTitles: NonNullable<typeof carryOver.exerciseTitles> = {}
    for (const [key, value] of Object.entries(carryOver.exerciseTitles ?? {})) {
      const n = Number(key)
      if (n === removed) continue
      exerciseTitles[n > removed ? n - 1 : n] = value
    }
    const exerciseCorrectionZoom: NonNullable<
      typeof carryOver.exerciseCorrectionZoom
    > = {}
    for (const [key, value] of Object.entries(
      carryOver.exerciseCorrectionZoom ?? {},
    )) {
      const n = Number(key)
      if (n === removed) continue
      exerciseCorrectionZoom[n > removed ? n - 1 : n] = value
    }
    return {
      versions:
        carryOver.versions == null
          ? undefined
          : Object.fromEntries(
              Object.entries(carryOver.versions).map(([version, carry]) => [
                version,
                shiftCarryOver(carry, removed),
              ]),
            ),
      tasksLayout,
      insertions,
      insertionsCorrection,
      merges,
      workedExamples: (carryOver.workedExamples ?? [])
        .filter((n) => n !== removed)
        .map((n) => (n > removed ? n - 1 : n)),
      codeOverrides,
      codeOverridesCorrection,
      // surcharges de ligne « Course aux nombres » (par numéro de ligne, pas
      // d'exercice) : pas renumérotées ici, faute de connaître le nombre de
      // questions retirées avec l'exercice — conservées telles quelles pour
      // ne pas perdre le travail du professeur, au prix d'un décalage
      // possible si l'exercice supprimé contribuait plusieurs lignes.
      codeOverridesCan: carryOver.codeOverridesCan ?? {},
      codeOverridesCanReponse: carryOver.codeOverridesCanReponse ?? {},
      writingLines,
      exerciseZoom,
      exerciseCorrectionZoom,
      exerciseTitles,
      imageCuts: Object.fromEntries(
        Object.entries(carryOver.imageCuts ?? {})
          .filter(([key]) => Number(key) !== removed)
          .map(([key, value]) => [
            Number(key) > removed ? Number(key) - 1 : Number(key),
            value,
          ]),
      ),
    }
  }

  /**
   * Décale les réglages de la palette après l'insertion d'un exercice en
   * position `inserted` (pendant de `shiftCarryOver`) : `ex3` devient `ex4`,
   * etc. La copie hérite des réglages de l'exercice dupliqué (`original`) :
   * une duplication rend une copie conforme, mise en page comprise.
   */
  function shiftCarryOverForInsert(
    carryOver: ReturnType<typeof harvestCarryOver>,
    inserted: number,
    original: number,
  ): ReturnType<typeof harvestCarryOver> {
    const shift = (n: number) => (n >= inserted ? n + 1 : n)
    /** Renumérote une table indexée par numéro d'exercice, copie comprise */
    const shiftMap = <T,>(map: Record<number, T> | undefined) => {
      const result: Record<number, T> = {}
      for (const [key, value] of Object.entries(map ?? {})) {
        const n = Number(key)
        result[shift(n)] = value
        if (n === original) result[inserted] = value
      }
      return result
    }
    const tasksLayout: NonNullable<typeof carryOver.tasksLayout> = {}
    for (const [prefix, layout] of Object.entries(
      carryOver.tasksLayout ?? {},
    )) {
      const match = prefix.match(/^ex(\d+)((?:-corr)?(?:-qcm)?)$/)
      if (match == null) continue
      const n = Number(match[1])
      const suffix = match[2] ?? ''
      tasksLayout[`ex${shift(n)}${suffix}`] = layout
      if (n === original) tasksLayout[`ex${inserted}${suffix}`] = layout
    }
    const insertions: NonNullable<typeof carryOver.insertions> = {}
    for (const [key, lines] of Object.entries(carryOver.insertions ?? {})) {
      // le repère de gap `g` précède l'exercice `g + 1` : celui qui précédait
      // la copie reste où il est, les suivants décalent
      const g = Number(key)
      const target = g >= inserted ? g + 1 : g
      insertions[target] = [...(insertions[target] ?? []), ...lines]
    }
    return {
      versions:
        carryOver.versions == null
          ? undefined
          : Object.fromEntries(
              Object.entries(carryOver.versions).map(([version, carry]) => [
                version,
                shiftCarryOverForInsert(carry, inserted, original),
              ]),
            ),
      tasksLayout,
      insertions,
      insertionsCorrection: shiftMap(carryOver.insertionsCorrection),
      // la copie n'est pas fusionnée avec ce qui la précède : ce serait
      // fusionner l'original avec son double
      merges: (carryOver.merges ?? []).map(shift),
      // même logique : la copie ne rejoint pas de groupe en colonnes
      multicolGroups: (carryOver.multicolGroups ?? []).map(shift),
      workedExamples: [
        ...(carryOver.workedExamples ?? []).map(shift),
        ...(carryOver.workedExamples?.includes(original) ? [inserted] : []),
      ],
      codeOverrides: shiftMap(carryOver.codeOverrides),
      codeOverridesCorrection: shiftMap(carryOver.codeOverridesCorrection),
      // surcharges « Course aux nombres » : indexées par ligne du tableau, pas
      // par exercice — conservées telles quelles (voir `shiftCarryOver`)
      codeOverridesCan: carryOver.codeOverridesCan ?? {},
      codeOverridesCanReponse: carryOver.codeOverridesCanReponse ?? {},
      writingLines: shiftMap(carryOver.writingLines),
      exerciseZoom: shiftMap(carryOver.exerciseZoom),
      exerciseCorrectionZoom: shiftMap(carryOver.exerciseCorrectionZoom),
      exerciseTitles: shiftMap(carryOver.exerciseTitles),
      imageCuts: shiftMap(carryOver.imageCuts),
    }
  }

  /**
   * Duplique l'exercice `num` : la copie se place juste après lui, avec les
   * mêmes paramètres (donc le même énoncé, graine comprise) et les mêmes
   * réglages de palette. Elle rejoint aussi le barème de la page de garde.
   */
  async function duplicateExercise(num: number) {
    if (!confirmOverwrite()) return
    const params = get(exercicesParams)[num - 1]
    if (params == null) return
    dropVersionSeeds()
    const carryOver =
      editorView != null
        ? shiftCarryOverForInsert(harvestCarryOver(currentCode()), num + 1, num)
        : {}
    const copie: InterfaceParams = structuredClone($state.snapshot(params))
    let exercise: IExercice | null = null
    try {
      exercise = await buildExercise(copie)
      // la vue Typst n'affiche jamais les exercices en mode interactif
      exercise.interactif = false
    } catch {
      // exercice non chargeable : buildInputs signalera l'avertissement
      exercise = null
    }
    exercises = [...exercises.slice(0, num), exercise, ...exercises.slice(num)]
    insertCoverBaremeRow(num)
    persistPreferences()
    exercicesParams.update((list) => [
      ...list.slice(0, num),
      copie,
      ...list.slice(num),
    ])
    await applyTypSourcesForStaticExercises()
    await prefetchStaticImages()
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const code = buildTypstDocument(
      primary,
      documentOptions,
      carryOver,
      extraVersions,
      {
        sourceUrl: currentUrl(),
        extraPreamble: extraPreamble(),
      },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /**
   * Uuid du « vaisseau » générique support de l'insertion « Exercice » de la
   * palette de mise en page (voir `insertFreeExercise` et
   * `src/exercices/apps/EnonceLibre.ts`) : un exercice numéroté normalement
   * dont l'énoncé généré n'est qu'un texte de départ, aussitôt remplacé par
   * une surcharge de code portant ce que le professeur a écrit dans le
   * panneau d'insertion.
   */
  const FREE_EXERCISE_UUID = '58d39'

  /**
   * Insère un nouvel exercice au repère de gap `gapNum` (donc en position
   * `gapNum + 1`, juste avant celui qui suivait ce repère), dont l'énoncé est
   * entièrement écrit par le professeur dans le panneau d'insertion. Comme
   * `duplicateExercise`, décale les réglages de la palette des exercices
   * suivants (`shiftCarryOverForInsert`) ; contrairement à elle, il n'y a pas
   * d'exercice « original » dont copier les réglages (`original: -1`, qui ne
   * correspond à aucun numéro d'exercice réel).
   */
  async function insertFreeExercise(gapNum: number, texte: string) {
    if (!confirmOverwrite()) return
    dropVersionSeeds()
    const inserted = gapNum + 1
    const carryOver =
      editorView != null
        ? shiftCarryOverForInsert(harvestCarryOver(currentCode()), inserted, -1)
        : {}
    // l'énoncé libre ne dépend d'aucune graine : il est le même dans tous
    // les sujets
    for (
      let version = 0;
      version < Math.max(1, documentOptions.nbVersions);
      version++
    ) {
      let subjectCarry = carryOver
      if (version > 0) {
        carryOver.versions ??= {}
        subjectCarry = carryOver.versions[version] ??= {}
      }
      subjectCarry.codeOverrides = {
        ...subjectCarry.codeOverrides,
        [inserted]: texte,
      }
    }
    const params: InterfaceParams = { uuid: FREE_EXERCISE_UUID }
    let exercise: IExercice | null = null
    try {
      exercise = await buildExercise(params)
      // la vue Typst n'affiche jamais les exercices en mode interactif
      exercise.interactif = false
    } catch {
      // exercice non chargeable : buildInputs signalera l'avertissement
      exercise = null
    }
    exercises = [
      ...exercises.slice(0, gapNum),
      exercise,
      ...exercises.slice(gapNum),
    ]
    insertCoverBaremeRow(gapNum)
    persistPreferences()
    exercicesParams.update((list) => [
      ...list.slice(0, gapNum),
      params,
      ...list.slice(gapNum),
    ])
    await applyTypSourcesForStaticExercises()
    await prefetchStaticImages()
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const code = buildTypstDocument(
      primary,
      documentOptions,
      carryOver,
      extraVersions,
      {
        sourceUrl: currentUrl(),
        extraPreamble: extraPreamble(),
      },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /** Retire l'exercice num de la fiche et régénère le code */
  function deleteExercise(num: number) {
    if (!window.confirm(`Supprimer l'exercice ${num} de la fiche ?`)) return
    dropVersionSeeds()
    const carryOver =
      editorView != null
        ? shiftCarryOver(harvestCarryOver(currentCode()), num)
        : {}
    const exercise = exercises[num - 1]
    exercise?.reinit?.()
    exercise?.destroy?.()
    exercises = exercises.filter((_, k) => k !== num - 1)
    removeCoverBaremeRowFor(num - 1)
    persistPreferences()
    exercicesParams.update((list) => list.filter((_, k) => k !== num - 1))
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const code = buildTypstDocument(
      primary,
      documentOptions,
      carryOver,
      extraVersions,
      {
        sourceUrl: currentUrl(),
        extraPreamble: extraPreamble(),
      },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /** Modale « Ajouter un exercice » (navigation dans les référentiels) */
  let isAddExerciseOpen = $state(false)

  /**
   * Ouvre la modale d'ajout. Pas de confirmation ici (contrairement aux
   * autres actions qui régénèrent le code) : comme `deleteExercise`, ajouter
   * un exercice est un geste déjà délibéré (plusieurs clics dans la modale),
   * et le bloquer derrière l'avertissement générique « le code Typst a été
   * modifié » forcerait à choisir entre perdre ses modifications et ne
   * jamais pouvoir ajouter d'exercice tant que le code a été retouché à la
   * main.
   */
  function openAddExercise() {
    isAddExerciseOpen = true
  }

  /**
   * Ajoute une ressource à la fin de la fiche : ses paramètres rejoignent
   * `exercicesParams` (donc l'URL) et son contenu est généré comme les autres.
   * Les réglages de la palette ne bougent pas — le nouvel exercice s'ajoute
   * après le dernier, aucun numéro existant n'est décalé.
   * @param {InterfaceParams} params paramètres de l'exercice choisi
   */
  async function addExerciseToSheet(params: InterfaceParams) {
    dropVersionSeeds()
    exercicesParams.update((list) => [...list, params])
    let exercise: IExercice | null = null
    try {
      exercise = await buildExercise(params)
      // la vue Typst n'affiche jamais les exercices en mode interactif
      exercise.interactif = false
    } catch {
      // exercice non chargeable : buildInputs signalera l'avertissement
      exercise = null
    }
    exercises = [...exercises, exercise]
    insertCoverBaremeRow(exercises.length - 1)
    persistPreferences()
    await applyTypSourcesForStaticExercises()
    await prefetchStaticImages()
    const code = buildCode()
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /** Échange l'exercice num avec son voisin (delta : -1 monter, 1 descendre) */
  function moveExercise(num: number, delta: -1 | 1) {
    const k = num - 1
    const target = k + delta
    if (target < 0 || target >= exercises.length) return
    if (!confirmOverwrite()) return
    dropVersionSeeds()
    const versionInputs = buildAllVersionInputs()
    const carryOver =
      editorView != null
        ? swapCarryOver(
            swapExerciseFigures(
              harvestCarryOver(currentCode()),
              versionInputs,
              documentOptions,
              k + 1,
              target + 1,
            ),
            k + 1,
            target + 1,
          )
        : {}
    const newExercises = [...exercises]
    ;[newExercises[k], newExercises[target]] = [
      newExercises[target],
      newExercises[k],
    ]
    exercises = newExercises
    exercicesParams.update((list) => {
      const copy = [...list]
      ;[copy[k], copy[target]] = [copy[target], copy[k]]
      return copy
    })
    const [primary, ...extraVersions] = versionInputs.map((inputs) => {
      const reordered = [...inputs]
      ;[reordered[k], reordered[target]] = [reordered[target], reordered[k]]
      return reordered
    })
    const code = buildTypstDocument(
      primary,
      documentOptions,
      carryOver,
      extraVersions,
      {
        sourceUrl: currentUrl(),
        extraPreamble: extraPreamble(),
      },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /** Nouvelle graine pour l'exercice d'indice k (sans régénérer le code) */
  function applyNewSeedTo(k: number) {
    const exercise = exercises[k]
    if (exercise == null) return
    // regenerate() (via seedrandom(..., { global: true })) laisse Math.random
    // verrouillé sur la graine du dernier exercice régénéré : sans ce
    // réamorçage sur de l'entropie réelle, le tirage de la nouvelle graine
    // serait déterministe et se figerait au bout de quelques clics.
    seedrandom(undefined, { global: true })
    exercise.seed = undefined
    if (typeof exercise.applyNewSeed === 'function') exercise.applyNewSeed()
    const params = get(exercicesParams)[k]
    if (params != null && exercise.seed !== undefined) {
      params.alea = exercise.seed
    }
    frozenInputs.delete(exercise)
  }

  /** Nouvelles données aléatoires pour l'exercice num */
  function newDataForExercise(num: number) {
    if (!confirmOverwrite()) return
    const exerciseIndex = num - 1
    const subject = overlaySubject
    const before = seedState()
    if (subject > 0) {
      // Les sujets dérivés n'ont pas leur propre instance d'exercice : leur
      // graine est conservée dans `versionSeeds`. On ne touche donc pas à la
      // graine du Sujet A lorsque la pastille d'un Sujet B, C... est cliquée.
      seedrandom(undefined, { global: true })
      const token = Math.random().toString(36).slice(2, 8)
      const pinnedSeeds = (documentOptions.versionSeeds ?? []).map((entry) =>
        entry == null ? entry : [...entry],
      )
      pinnedSeeds[subject] = exercises.map((exercise, index) => {
        const current = pinnedSeeds[subject]?.[index]
        if (index !== exerciseIndex) {
          return (
            current ??
            (exercise?.seed == null ? null : `${exercise.seed}${subject}`)
          )
        }
        return exercise?.seed == null
          ? null
          : `${exercise.seed}${subject}~${token}`
      })
      documentOptions.versionSeeds = pinnedSeeds
      persistPreferences()
    } else {
      // les autres sujets ne suivent pas la nouvelle graine de cet exercice
      pinOtherSubjects()
      applyNewSeedTo(exerciseIndex)
      persistPreferences()
    }
    exercicesParams.update((list) => list)
    recordDraw(
      before,
      documentOptions.nbVersions > 1
        ? `exercice ${num} du Sujet ${subjectLetter(subject)}`
        : `exercice ${num}`,
      [subject],
    )
    const code = buildCode()
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  function openSettings(num: number) {
    settingsExerciseIndex = num - 1
  }

  let imageCutEditor: {
    num: number
    part: keyof ExerciseImageCuts
    urls: string[]
    cuts: number[][]
  } | null = $state(null)

  function openImageCuts(num: number, part: keyof ExerciseImageCuts) {
    const input = buildAllVersionInputs()[previewVersion][num - 1]
    if (input == null) return
    const html =
      part === 'enonce'
        ? [input.intro, ...input.questions].join('')
        : [input.introCorrection, ...input.corrections].join('')
    const urls = [...html.matchAll(/<img[^>]*\ssrc=["']([^"']+)["']/gi)].map(
      (match) => match[1],
    )
    const carry = activeCarryOver(harvestCarryOver(currentCode()))
    imageCutEditor = {
      num,
      part,
      urls,
      cuts: carry.imageCuts?.[num]?.[part] ?? [],
    }
  }

  function updateImageCuts(cuts: number[][]) {
    if (imageCutEditor == null || !confirmOverwrite()) return
    const { num, part } = imageCutEditor
    const allCarry = harvestCarryOver(currentCode())
    const carry = activeCarryOver(allCarry)
    carry.imageCuts = {
      ...carry.imageCuts,
      [num]: { ...carry.imageCuts?.[num], [part]: cuts },
    }
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const code = buildTypstDocument(
      primary,
      documentOptions,
      allCarry,
      extraVersions,
      { sourceUrl: currentUrl(), extraPreamble: extraPreamble() },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
    imageCutEditor = null
  }

  /**
   * Ouvre la modale d'édition du code Typst de l'exercice num, préremplie
   * avec sa surcharge existante ou, à défaut, le code actuellement généré
   * pour cet exercice (voir `getGeneratedExerciseCode`).
   */
  function openCodeEdit(num: number) {
    const carryOver =
      editorView != null ? activeCarryOver(harvestCarryOver(currentCode())) : {}
    codeEditDraft =
      carryOver.codeOverrides?.[num] ??
      getGeneratedExerciseCode(
        buildAllVersionInputs()[previewVersion],
        num,
        documentOptions,
        carryOver,
      )
    codeEditPart = 'enonce'
    codeEditNum = num
  }

  /**
   * Ouvre la modale d'édition du code Typst de la correction de l'exercice
   * num, préremplie avec sa surcharge existante ou, à défaut, le code
   * actuellement généré pour cette correction (voir `getGeneratedCorrectionCode`).
   * Pendant de `openCodeEdit` pour la correction plutôt que l'énoncé.
   */
  function openCorrectionCodeEdit(num: number) {
    const carryOver =
      editorView != null ? activeCarryOver(harvestCarryOver(currentCode())) : {}
    codeEditDraft =
      carryOver.codeOverridesCorrection?.[num] ??
      getGeneratedCorrectionCode(
        buildAllVersionInputs()[previewVersion],
        num,
        documentOptions,
        carryOver,
      )
    codeEditPart = 'correction'
    codeEditNum = num
  }

  /**
   * Retire la surcharge de l'exercice num (énoncé ou correction, selon
   * `codeEditPart`) : son contenu redevient celui généré automatiquement
   * (icône crayon désactivée, « Nouvelles données » de nouveau opérant sur
   * son contenu). Contrairement au brouillon de la modale, une surcharge
   * n'est un texte figé que tant qu'elle existe : la restaurer doit donc
   * réellement la supprimer, pas seulement préremplir le brouillon avec un
   * instantané du texte généré.
   */
  function restoreGeneratedCode(num: number) {
    updateExerciseCode(num, '', codeEditPart)
  }

  /**
   * Applique (ou retire, si `code` est vide) la surcharge de code Typst
   * (énoncé ou correction, selon `part`) de l'exercice num, saisie dans la
   * modale d'édition. Régénère le document (comme suppression/déplacement/
   * fusion) : la surcharge change la structure du code (elle remplace le
   * contenu généré), un simple patch de texte comme pour les insertions ne
   * suffit pas.
   */
  function updateExerciseCode(
    num: number,
    code: string,
    part: 'enonce' | 'correction' = 'enonce',
  ) {
    if (!confirmOverwrite()) return
    const allCarryOver =
      editorView != null ? harvestCarryOver(currentCode()) : {}
    const allInputs = buildAllVersionInputs()
    const failedVersions =
      codeEditApplyToAll && allInputs.length > 1
        ? propagateExerciseCode(allCarryOver, allInputs, num, code, part)
        : []
    const carryOver = activeCarryOver(allCarryOver)
    const trimmed = code.trim()
    if (part === 'correction') {
      const codeOverridesCorrection = {
        ...(carryOver.codeOverridesCorrection ?? {}),
      }
      if (trimmed.length === 0) delete codeOverridesCorrection[num]
      else codeOverridesCorrection[num] = code
      carryOver.codeOverridesCorrection = codeOverridesCorrection
    } else {
      const codeOverrides = { ...(carryOver.codeOverrides ?? {}) }
      if (trimmed.length === 0) delete codeOverrides[num]
      else codeOverrides[num] = code
      carryOver.codeOverrides = codeOverrides
    }
    const [primary, ...extraVersions] = allInputs
    const newCode = buildTypstDocument(
      primary,
      documentOptions,
      allCarryOver,
      extraVersions,
      { sourceUrl: currentUrl(), extraPreamble: extraPreamble() },
    )
    setEditorContent(newCode)
    scheduleCompile(newCode, PALETTE_COMPILE_DELAY)
    codeEditNum = null
    if (failedVersions.length > 0) {
      window.alert(
        `La modification n'a pas pu être reportée sur ${versionNames(failedVersions)} : le passage modifié n'y figure pas à l'identique (nombres différents par exemple). Modifier ce sujet séparément.`,
      )
    }
  }

  /** « le Sujet B », « les Sujets B et C »… */
  function versionNames(versions: number[]): string {
    const letters = versions.map((v) => String.fromCharCode(65 + v))
    return letters.length === 1
      ? `le Sujet ${letters[0]}`
      : `les Sujets ${letters.slice(0, -1).join(', ')} et ${letters.at(-1)}`
  }

  /** Réglages propres au sujet `version`, sans en créer s'il n'en a pas. */
  function versionCarryOver(
    carry: TypstCarryOver,
    version: number,
  ): TypstCarryOver {
    return version === 0 ? carry : (carry.versions?.[version] ?? {})
  }

  /** Code généré (sans surcharge) de l'énoncé ou de la correction d'un exercice. */
  function generatedPartCode(
    inputs: TypstExerciseInput[],
    num: number,
    part: 'enonce' | 'correction',
    carry: TypstCarryOver,
  ): string {
    return part === 'correction'
      ? getGeneratedCorrectionCode(inputs, num, documentOptions, carry)
      : getGeneratedExerciseCode(inputs, num, documentOptions, carry)
  }

  /**
   * Surcharge de l'énoncé ou de la correction d'un exercice dans le sujet
   * `version` : `code` à `undefined` la retire. Une surcharge identique au
   * code généré n'en est pas une (elle figerait inutilement l'exercice).
   */
  function setPartOverride(
    carry: TypstCarryOver,
    version: number,
    num: number,
    part: 'enonce' | 'correction',
    code: string | undefined,
    generated: string,
  ) {
    let target = carry
    if (version > 0) {
      carry.versions ??= {}
      target = carry.versions[version] ??= {}
    }
    const key =
      part === 'correction' ? 'codeOverridesCorrection' : 'codeOverrides'
    const overrides = { ...(target[key] ?? {}) }
    if (code == null || code.trim().length === 0 || code === generated) {
      delete overrides[num]
    } else {
      overrides[num] = code
    }
    target[key] = overrides
  }

  /**
   * Reporte sur les autres sujets la modification du sujet affiché saisie
   * dans la modale d'édition (`code`, vide pour restaurer le code d'origine) :
   * la différence entre le code précédent et `code` est rejouée sur le code
   * de chaque autre sujet (voir `codePatch.ts`), qui garde ainsi ses propres
   * nombres et ses propres retouches. Modifie `allCarry` en place.
   * @returns les sujets sur lesquels la modification n'a pas pu être reportée
   */
  function propagateExerciseCode(
    allCarry: TypstCarryOver,
    allInputs: TypstExerciseInput[][],
    num: number,
    code: string,
    part: 'enonce' | 'correction',
  ): number[] {
    const currentPartCode = (version: number) => {
      const carry = versionCarryOver(allCarry, version)
      const override =
        part === 'correction'
          ? carry.codeOverridesCorrection?.[num]
          : carry.codeOverrides?.[num]
      return override ?? generatedPartCode(allInputs[version], num, part, carry)
    }
    const restore = code.trim().length === 0
    const patch = restore
      ? null
      : createCodePatch(currentPartCode(previewVersion), code)
    const failed: number[] = []
    for (let version = 0; version < allInputs.length; version++) {
      if (version === previewVersion) continue
      const generated = generatedPartCode(
        allInputs[version],
        num,
        part,
        versionCarryOver(allCarry, version),
      )
      if (patch == null) {
        setPartOverride(allCarry, version, num, part, undefined, generated)
        continue
      }
      const patched = applyCodePatch(currentPartCode(version), patch)
      if (patched == null) failed.push(version)
      else setPartOverride(allCarry, version, num, part, patched, generated)
    }
    return failed
  }

  /**
   * Sujets ajoutés (`firstNewVersion` et suivants) : ils reprennent les
   * modifications faites dans la modale d'édition sur le Sujet A, rejouées
   * sur leur propre code généré (voir `codePatch.ts`). Modifie `allCarry` en
   * place.
   * @returns les sujets sur lesquels une modification n'a pas pu être reportée
   */
  function propagateOverridesToNewVersions(
    allCarry: TypstCarryOver,
    firstNewVersion: number,
  ): number[] {
    const allInputs = buildAllVersionInputs()
    const failed = new Set<number>()
    for (const part of ['enonce', 'correction'] as const) {
      const overrides =
        part === 'correction'
          ? allCarry.codeOverridesCorrection
          : allCarry.codeOverrides
      for (const [key, override] of Object.entries(overrides ?? {})) {
        const num = Number(key)
        const patch = createCodePatch(
          generatedPartCode(allInputs[0], num, part, allCarry),
          override,
        )
        for (
          let version = firstNewVersion;
          version < allInputs.length;
          version++
        ) {
          const generated = generatedPartCode(
            allInputs[version],
            num,
            part,
            versionCarryOver(allCarry, version),
          )
          const patched = applyCodePatch(generated, patch)
          if (patched == null) failed.add(version)
          else setPartOverride(allCarry, version, num, part, patched, generated)
        }
      }
    }
    return [...failed].sort()
  }

  /**
   * Ouvre la modale d'édition d'une ligne du tableau « Course aux nombres »
   * (énoncé et réponse), préremplie avec ses surcharges existantes ou, à
   * défaut, le contenu actuellement généré pour cette ligne (voir
   * `getGeneratedCanRowCode`). Pendant de `openCodeEdit`, à l'échelle d'une
   * ligne plutôt que d'un exercice entier.
   */
  function openCanRowCodeEdit(row: number) {
    const carryOver =
      editorView != null ? activeCarryOver(harvestCarryOver(currentCode())) : {}
    const generated =
      carryOver.codeOverridesCan?.[row] == null ||
      carryOver.codeOverridesCanReponse?.[row] == null
        ? getGeneratedCanRowCode(
            buildAllVersionInputs()[previewVersion],
            row,
            documentOptions,
          )
        : null
    canRowEditEnonceDraft =
      carryOver.codeOverridesCan?.[row] ?? generated?.enonce ?? ''
    canRowEditReponseDraft =
      carryOver.codeOverridesCanReponse?.[row] ?? generated?.reponse ?? ''
    canRowEditSharesEnonce = generated?.sharesPreviousEnonce ?? false
    canRowEditNum = row
  }

  /**
   * Retire les surcharges (énoncé et réponse) de la ligne `row` : son contenu
   * redevient celui généré automatiquement. Pendant de `restoreGeneratedCode`.
   */
  function restoreCanRowCode(row: number) {
    updateCanRowCode(row, '', '')
  }

  /**
   * Applique (ou retire, si vide) les surcharges d'énoncé et de réponse de
   * la ligne `row` du tableau « Course aux nombres », saisies dans la
   * modale d'édition. Pendant de `updateExerciseCode`, à l'échelle d'une
   * ligne : les deux moitiés (énoncé/réponse) sont réglées ensemble, chacune
   * indépendamment retirée si son champ a été vidé.
   */
  function updateCanRowCode(row: number, enonce: string, reponse: string) {
    if (!confirmOverwrite()) return
    const allCarryOver =
      editorView != null ? harvestCarryOver(currentCode()) : {}
    const carryOver = activeCarryOver(allCarryOver)
    const codeOverridesCan = { ...(carryOver.codeOverridesCan ?? {}) }
    if (enonce.trim().length === 0) delete codeOverridesCan[row]
    else codeOverridesCan[row] = enonce
    carryOver.codeOverridesCan = codeOverridesCan
    const codeOverridesCanReponse = {
      ...(carryOver.codeOverridesCanReponse ?? {}),
    }
    if (reponse.trim().length === 0) delete codeOverridesCanReponse[row]
    else codeOverridesCanReponse[row] = reponse
    carryOver.codeOverridesCanReponse = codeOverridesCanReponse
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const newCode = buildTypstDocument(
      primary,
      documentOptions,
      allCarryOver,
      extraVersions,
      { sourceUrl: currentUrl(), extraPreamble: extraPreamble() },
    )
    setEditorContent(newCode)
    scheduleCompile(newCode, PALETTE_COMPILE_DELAY)
    canRowEditNum = null
  }

  /**
   * Groupe/dégroupe en colonnes l'exercice num avec celui qui le suit (grid
   * manuelle à 2 colonnes) : `num` est le numéro (1-based) du premier des
   * deux exercices du groupe, comme `merges` mais pour le voisin suivant
   * plutôt que le précédent. Un exercice ne peut appartenir qu'à un seul
   * groupe à la fois : grouper num avec num+1 retire d'abord num-1 s'il
   * était déjà groupé avec num.
   */
  function toggleMulticol(num: number) {
    if (!confirmOverwrite()) return
    const carryOver = editorView != null ? harvestCarryOver(currentCode()) : {}
    const groups = carryOver.multicolGroups ?? []
    carryOver.multicolGroups = groups.includes(num)
      ? groups.filter((n) => n !== num)
      : [...groups, num]
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const code = buildTypstDocument(
      primary,
      documentOptions,
      carryOver,
      extraVersions,
      { sourceUrl: currentUrl(), extraPreamble: extraPreamble() },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /**
   * Fusionne/sépare l'exercice num avec celui qui le précède : ils partagent
   * alors un seul titre (banque exercise-bank) et la numérotation de ses
   * questions continue celle de son prédécesseur. Régénère le code (comme
   * suppression/déplacement) plutôt que d'éditer le texte : la fusion
   * change la structure du document (les deux exercices rejoignent la même
   * définition `exo.with(...)`).
   */
  function toggleMergeBefore(num: number) {
    if (!confirmOverwrite()) return
    const allCarryOver =
      editorView != null ? harvestCarryOver(currentCode()) : {}
    const carryOver = activeCarryOver(allCarryOver)
    const merges = carryOver.merges ?? []
    carryOver.merges = merges.includes(num)
      ? merges.filter((n) => n !== num)
      : [...merges, num]
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const code = buildTypstDocument(
      primary,
      documentOptions,
      allCarryOver,
      extraVersions,
      { sourceUrl: currentUrl(), extraPreamble: extraPreamble() },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /**
   * Règle (ou retire, `value` null) les lignes en pointillés de l'exercice
   * num. Régénère le code (comme la fusion) plutôt que d'éditer le texte :
   * le passage à « après chaque question » change la structure du document
   * (les appels s'intercalent après chaque item de la liste `tasks`).
   */
  function setWritingLines(num: number, value: WritingLinesSetting | null) {
    if (!confirmOverwrite()) return
    const allCarryOver =
      editorView != null ? harvestCarryOver(currentCode()) : {}
    // réglage commun à tous les sujets : porté par le carry-over du sujet A
    const writingLines = { ...(allCarryOver.writingLines ?? {}) }
    if (value == null) delete writingLines[num]
    else writingLines[num] = value
    allCarryOver.writingLines = writingLines
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const code = buildTypstDocument(
      primary,
      documentOptions,
      allCarryOver,
      extraVersions,
      { sourceUrl: currentUrl(), extraPreamble: extraPreamble() },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /** L'exemple corrigé garde sa solution sous l'énoncé, y compris en version élève. */
  function setWorkedExample(num: number, worked: boolean) {
    if (!confirmOverwrite()) return
    const carryOver = harvestCarryOver(currentCode())
    carryOver.workedExamples = (carryOver.workedExamples ?? []).filter(
      (n) => n !== num,
    )
    if (worked) carryOver.workedExamples.push(num)
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const code = buildTypstDocument(
      primary,
      documentOptions,
      carryOver,
      extraVersions,
      { sourceUrl: currentUrl(), extraPreamble: extraPreamble() },
    )
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /** Applique les réglages émis par le panneau Settings de la vue prof */
  function applyNewSettings(k: number, detail: Record<string, unknown>) {
    const exercise = exercises[k]
    const params = get(exercicesParams)[k]
    if (exercise == null || params == null) return
    if (!confirmOverwrite()) return
    applyExerciceSettings(exercise, params, detail)
    exercicesParams.update((list) => list)
    frozenInputs.delete(exercise)
    const code = buildCode()
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /**
   * Modifie une variable d'en-tête (`#let titre = "..."`) dans le code et
   * reporte la valeur dans les réglages persistés (elle survit ainsi à une
   * régénération).
   */
  function updateHeaderValue(
    name: 'titre' | 'sous-titre' | 'entete',
    value: string,
  ) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = new RegExp(`^#let ${name} = ".*"`, 'm').exec(doc)
    if (match == null) return
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let ${name} = "${escaped}"`,
    })
    if (name === 'titre') documentOptions.title = value
    else if (name === 'sous-titre') documentOptions.subtitle = value
    else documentOptions.headerLine = value
    persistPreferences()
  }

  /** Échappe une chaîne pour l'inscrire dans un littéral Typst `"..."` */
  function escapeTypstStringLiteral(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }

  /**
   * Modifie une variable texte de la page de garde (`#let couverture-titre =
   * "..."`…) dans le code et reporte la valeur dans les réglages persistés —
   * même mécanisme que `updateHeaderValue`, édition ciblée sans régénération.
   */
  function updateCoverValue(
    name:
      | 'titre'
      | 'session'
      | 'matiere'
      | 'etablissement'
      | 'duree'
      | 'signatureLabel'
      | 'noteFin',
    value: string,
  ) {
    if (editorView == null) return
    // `noteFin` (JS) ↔ `note-fin` (variable Typst, voir `coverDeclarationLines`)
    const typstName =
      name === 'noteFin'
        ? 'note-fin'
        : name === 'signatureLabel'
          ? 'signature'
          : name
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = new RegExp(`^#let couverture-${typstName} = ".*"`, 'm').exec(
      doc,
    )
    if (match == null) return
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let couverture-${typstName} = "${escapeTypstStringLiteral(value)}"`,
    })
    documentOptions.coverPage[name] = value
    persistPreferences()
  }

  /**
   * Pendant de `updateCoverValue` pour les consignes (`#let
   * couverture-consignes = (...)`) : la liste est réémise sur une seule
   * ligne, comme `coverDeclarationLines` (`buildTypstDocument.ts`) le fait à
   * la génération — un tableau d'un seul élément exige la virgule finale.
   */
  function updateCoverConsignes(consignes: string[]) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = /^#let couverture-consignes = \(.*\)$/m.exec(doc)
    if (match == null) return
    const items = consignes.map(
      (ligne) => `"${escapeTypstStringLiteral(ligne)}"`,
    )
    const literal =
      items.length === 0
        ? '()'
        : items.length === 1
          ? `(${items[0]},)`
          : `(${items.join(', ')})`
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let couverture-consignes = ${literal}`,
    })
    documentOptions.coverPage.consignes = consignes
    persistPreferences()
  }

  /**
   * Modifie le texte du pied de page (`#let pied-page = "..."`) — même
   * mécanisme que `updateHeaderValue`/`updateCoverValue`, édition ciblée
   * sans régénération. Réglé sur l'aperçu (icône sur le pied de page de la
   * première page) plutôt que dans le volet : contrairement au titre et à la
   * page de garde, le pied de page se répète sur chaque page, sans second
   * réglage à synchroniser.
   */
  function updateFooterText(value: string) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const match = /^#let pied-page = ".*"/m.exec(doc)
    if (match == null) return
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let pied-page = "${escapeTypstStringLiteral(value)}"`,
    })
    documentOptions.footerText = value
    persistPreferences()
  }

  /** Modifie l'URL du QR-code global du sujet indiqué dans le source Typst. */
  function updateQrCodeUrl(version: number, value: string) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const variable =
      version === 0 ? 'qr-code-global-url' : `qr-code-global-url-${version}`
    const match = new RegExp(`^#let ${variable} = ".*"`, 'm').exec(doc)
    if (match == null) return
    dispatchPaletteEdit({
      from: match.index,
      to: match.index + match[0].length,
      insert: `#let ${variable} = "${escapeTypstStringLiteral(value)}"`,
    })
  }

  /**
   * Affiche ou masque l'étiquette « Sujet A/B... » de l'en-tête (icône sur
   * l'aperçu, à côté de l'étiquette) : régénère le code, la présence de
   * sa présence dans la ligne d'en-tête étant structurelle (voir `headerBlock`),
   * à la différence des textes édités en place comme le pied de page.
   */
  function toggleVersionLabel() {
    documentOptions.hideVersionLabel = !documentOptions.hideVersionLabel
    applyDocumentOptions()
  }

  /** Repère de gap `num` dans le code (indentation et fin de sa ligne) */
  function findGapAnchor(
    doc: string,
    num: number,
  ): { indent: string; lineEnd: number } | null {
    const match = new RegExp(
      `^([ \\t]*)#mathalea-anchor\\("gap", ${num}\\).*$`,
      'm',
    ).exec(doc)
    if (match == null) return null
    return { indent: match[1], lineEnd: match.index + match[0].length }
  }

  /**
   * Bornes de la ligne de la `index`-ième insertion qui suit le repère de
   * gap `num` (sans son saut de ligne initial). La recherche s'arrête au
   * repère suivant.
   */
  function findInsertionLine(
    doc: string,
    num: number,
    index: number,
  ): { from: number; to: number } | null {
    const anchor = findGapAnchor(doc, num)
    if (anchor == null) return null
    let offset = anchor.lineEnd
    let count = 0
    while (offset < doc.length) {
      const from = offset + 1 // saute le saut de ligne
      let to = doc.indexOf('\n', from)
      if (to === -1) to = doc.length
      const line = doc.slice(from, to)
      if (line.includes('#mathalea-anchor(')) return null
      if (/\/\/ mathalea:insertion\s*$/.test(line)) {
        if (count === index) return { from, to }
        count++
      }
      offset = to
    }
    return null
  }

  /** Insère un fragment (texte, #section[...]) juste après l'exercice num */
  function insertAfterExercise(num: number, snippet: string) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const anchor = findGapAnchor(doc, num)
    if (anchor == null) return
    // la nouvelle ligne s'ajoute après les insertions déjà présentes
    // (leur ordre d'affichage est conservé)
    let insertAt = anchor.lineEnd
    let offset = anchor.lineEnd
    while (offset < doc.length) {
      const from = offset + 1
      let to = doc.indexOf('\n', from)
      if (to === -1) to = doc.length
      const line = doc.slice(from, to)
      if (line.includes('#mathalea-anchor(')) break
      if (/\/\/ mathalea:insertion\s*$/.test(line)) insertAt = to
      else if (line.trim().length > 0) break
      offset = to
    }
    dispatchPaletteEdit({
      from: insertAt,
      insert: `\n${anchor.indent}${snippet} ${INSERTION_TAG}`,
    })
  }

  /** Remplace la `index`-ième insertion qui suit l'exercice num */
  function updateInsertion(num: number, index: number, snippet: string) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const line = findInsertionLine(doc, num, index)
    if (line == null) return
    const indent = doc.slice(line.from, line.to).match(/^[ \t]*/)?.[0] ?? ''
    dispatchPaletteEdit({
      from: line.from,
      to: line.to,
      insert: `${indent}${snippet} ${INSERTION_TAG}`,
    })
  }

  /** Supprime la `index`-ième insertion qui suit l'exercice num */
  function deleteInsertion(num: number, index: number) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const line = findInsertionLine(doc, num, index)
    if (line == null) return
    // la ligne entière disparaît, saut de ligne précédent compris
    dispatchPaletteEdit({ from: line.from - 1, to: line.to, insert: '' })
  }

  /** Repère `corr` de l'exercice num dans le code (indentation et fin de sa ligne) */
  function findCorrAnchor(
    doc: string,
    num: number,
  ): { indent: string; lineEnd: number } | null {
    const match = new RegExp(
      `^([ \\t]*)#mathalea-anchor\\("corr", ${num}\\).*$`,
      'm',
    ).exec(doc)
    if (match == null) return null
    return { indent: match[1], lineEnd: match.index + match[0].length }
  }

  /**
   * Bornes de la ligne de la `index`-ième insertion qui précède la
   * correction de l'exercice num (sans son saut de ligne initial). Pendant
   * de `findInsertionLine` pour le repère `corr`.
   */
  function findInsertionCorrectionLine(
    doc: string,
    num: number,
    index: number,
  ): { from: number; to: number } | null {
    const anchor = findCorrAnchor(doc, num)
    if (anchor == null) return null
    let offset = anchor.lineEnd
    let count = 0
    while (offset < doc.length) {
      const from = offset + 1
      let to = doc.indexOf('\n', from)
      if (to === -1) to = doc.length
      const line = doc.slice(from, to)
      if (line.includes('#mathalea-anchor(')) return null
      if (/\/\/ mathalea:insertion-corr\s*$/.test(line)) {
        if (count === index) return { from, to }
        count++
      }
      offset = to
    }
    return null
  }

  /** Insère un fragment (texte, #section[...]) juste avant la correction de l'exercice num */
  function insertBeforeCorrection(num: number, snippet: string) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const anchor = findCorrAnchor(doc, num)
    if (anchor == null) return
    // la nouvelle ligne s'ajoute après les insertions déjà présentes
    // (leur ordre d'affichage est conservé)
    let insertAt = anchor.lineEnd
    let offset = anchor.lineEnd
    while (offset < doc.length) {
      const from = offset + 1
      let to = doc.indexOf('\n', from)
      if (to === -1) to = doc.length
      const line = doc.slice(from, to)
      if (line.includes('#mathalea-anchor(')) break
      if (/\/\/ mathalea:insertion-corr\s*$/.test(line)) insertAt = to
      else if (line.trim().length > 0) break
      offset = to
    }
    dispatchPaletteEdit({
      from: insertAt,
      insert: `\n${anchor.indent}${snippet} ${INSERTION_CORRECTION_TAG}`,
    })
  }

  /** Remplace la `index`-ième insertion qui précède la correction de l'exercice num */
  function updateInsertionCorrection(
    num: number,
    index: number,
    snippet: string,
  ) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const line = findInsertionCorrectionLine(doc, num, index)
    if (line == null) return
    const indent = doc.slice(line.from, line.to).match(/^[ \t]*/)?.[0] ?? ''
    dispatchPaletteEdit({
      from: line.from,
      to: line.to,
      insert: `${indent}${snippet} ${INSERTION_CORRECTION_TAG}`,
    })
  }

  /** Supprime la `index`-ième insertion qui précède la correction de l'exercice num */
  function deleteInsertionCorrection(num: number, index: number) {
    if (editorView == null) return
    const doc = subjectEditorCode(currentCode(), previewVersion)
    const line = findInsertionCorrectionLine(doc, num, index)
    if (line == null) return
    dispatchPaletteEdit({ from: line.from - 1, to: line.to, insert: '' })
  }

  function persistPreferences() {
    persistToUrl()
    if (!isLocalStorageAvailable()) return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          displayMode,
          documentOptions,
          showOverlay,
        }),
      )
    } catch {
      // stockage plein ou indisponible : sans conséquence
    }
  }

  /** Dernière valeur écrite dans `typstParam` (évite les réécritures inutiles) */
  let lastTypstParam = typstUrlParam ?? ''

  /**
   * Sauvegarde dans l'URL (`typstParam`) tous les réglages du document et de
   * la mise en page (colonnes/espacement des questions, textes et sections
   * insérés, sauts de page/colonne, fusions, zoom/alignement des figures) pour
   * pouvoir recharger la fiche à l'identique. La liste des exercices, leurs
   * graines et leurs réglages sont déjà portés par l'URL (`exercicesParams`).
   */
  function persistToUrl() {
    const carryOver =
      editorView != null
        ? harvestCarryOver(currentCode())
        : (urlCarryOver ?? {})
    const encoded = encodeBase64({ options: documentOptions, carryOver })
    fullTypstParam = encoded
    // des réglages trop volumineux ne passent pas dans l'URL (le serveur
    // refuserait de la recharger) : elle n'en garde alors qu'une référence
    const addressBarParam = typstParamForAddressBar(
      encoded,
      window.location.href,
    )
    // le store est la source de vérité ; on redéclenche ensuite l'écrivain
    // d'URL de l'app pour que sa prochaine écriture (débouncée) reparte de
    // cette valeur et ne réécrive pas l'URL sans typstParam
    typstParamStore.set(addressBarParam)
    mathaleaUpdateUrlFromExercicesParams()
    if (encoded === lastTypstParam) return
    lastTypstParam = encoded
    // l'URL est bloquée dans un iframe (recorder Capytale/Moodle…)
    if (get(freezeUrl)) return
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('typstParam', addressBarParam)
      window.history.replaceState(null, '', url)
    } catch {
      // URL non modifiable (iframe sandboxée…) : sans conséquence
    }
  }

  function setDisplayMode(mode: DisplayMode) {
    displayMode = mode
    // le bouton Réglages n'existe qu'en Aperçu : on y revient toujours avec
    // le volet ouvert, et il reste fermé (masqué) dans les deux autres modes
    isSettingsOpen = mode === 'preview'
    persistPreferences()
  }

  /** Applique un modèle de document de « Mes sauvegardes » */
  function applyModel(modelOptions: TypstModelOptions) {
    documentOptions = sanitizeDocumentOptions(
      applyTypstModel($state.snapshot(documentOptions), modelOptions),
    )
    applyDocumentOptions()
  }

  /** Nombre de tirages mémorisés au-delà duquel les plus anciens sont oubliés (voir `recordDraw`) */
  const MAX_DRAWS = 50

  /** Tirage courant (null : aucun tirage depuis l'ouverture ou depuis un changement de la liste d'exercices) */
  let currentDraw = $state.raw<DrawNode | null>(null)
  /** Nombre de sujets de la fiche lors des tirages mémorisés */
  let drawVersions = 0

  /** Regénère le code à partir des réglages du document (interligne...) */
  function applyDocumentOptions() {
    documentOptions = normalizeTypstLayoutOptions(documentOptions)
    // moins de sujets qu'avant : celui qu'on regardait peut ne plus exister
    if (previewVersion >= Math.max(1, documentOptions.nbVersions)) {
      previewVersion = 0
    }
    // sujets retirés : leurs graines épinglées n'ont plus de cible
    if (documentOptions.versionSeeds != null) {
      documentOptions.versionSeeds = documentOptions.versionSeeds.slice(
        0,
        Math.max(1, documentOptions.nbVersions),
      )
    }
    // les tirages mémorisés nomment des sujets qui n'ont plus le même sens
    if (drawVersions !== documentOptions.nbVersions) currentDraw = null
    // sujets ajoutés : ils reprennent les modifications de code du Sujet A
    const renderedVersions =
      editorView == null
        ? 0
        : Math.max(
            1,
            ...[
              ...currentCode().matchAll(/^\/\/ mathalea:sujet\((\d+)\)/gm),
            ].map((match) => Number(match[1]) + 1),
          )
    if (editorView != null && documentOptions.nbVersions > renderedVersions) {
      const carryOver = harvestCarryOver(currentCode())
      const failed = propagateOverridesToNewVersions(
        carryOver,
        renderedVersions,
      )
      regenerateDocument({ carryOver })
      if (failed.length > 0) {
        window.alert(
          `Certaines modifications du code du Sujet A n'ont pas pu être reportées sur ${versionNames(failed)} : le passage modifié n'y figure pas à l'identique (nombres différents par exemple). Modifier ce sujet séparément.`,
        )
      }
      return
    }
    regenerateDocument()
  }

  /**
   * La liste d'exercices a changé (ajout, suppression, réordonnancement) : les
   * graines épinglées par sujet sont indexées par exercice, elles ne
   * correspondent plus. On repart des graines dérivées pour tous les sujets.
   */
  function dropVersionSeeds() {
    if (documentOptions.versionSeeds != null) {
      documentOptions.versionSeeds = undefined
    }
    // les tirages mémorisés sont indexés de la même façon
    currentDraw = null
  }

  /**
   * Regénère le code. `dropWritingLines` oublie au passage les lignes de
   * réponse réglées exercice par exercice dans la palette : relues dans le
   * code, elles masqueraient le réglage global « Lignes de réponse » qui
   * vient de changer.
   */
  function regenerateDocument(
    options: { dropWritingLines?: boolean; carryOver?: TypstCarryOver } = {},
  ) {
    persistPreferences()
    const code = buildCode(options)
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /**
   * Date de la récitation, réglée dans le volet (le champ Session porte la
   * date sur ce modèle), au calendrier ou à la saisie.
   */
  function applyCoverDate(date: string) {
    documentOptions.coverPage.session = date
    applyDocumentOptions()
  }

  /** Libellés des emplacements proposés pour les lignes de réponse du document */
  const ANSWER_LINES_POSITION_LABELS: Record<WritingLinesPosition, string> = {
    endOfExercise: "Fin d'exercice",
    afterEachQuestion: 'Après chaque question',
  }

  /** Libellés des rendus proposés pour les lignes de réponse du document */
  const ANSWER_LINES_STYLE_LABELS: Record<WritingLinesStyle, string> = {
    pointilles: 'Pointillés',
    points: 'Points',
    plein: 'Trait',
    vide: 'Vide',
  }

  /**
   * Applique le trait ou l'emplacement choisi pour les lignes de réponse du
   * document. Comme `applyAnswerLines`, la régénération doit oublier les
   * réglages par exercice : relus dans le code (les appels `#mathalea-lignes`
   * que le réglage global vient d'y écrire), ils l'emporteraient sur lui et
   * le changement resterait sans effet.
   */
  function applyAnswerLinesStyle() {
    regenerateDocument({ dropWritingLines: true })
  }

  /** Applique le réglage global des lignes de réponse (valeur bornée) */
  function applyAnswerLines() {
    const valeur = Math.round(Number(documentOptions.answerLines))
    documentOptions.answerLines = Number.isFinite(valeur)
      ? Math.min(20, Math.max(0, valeur))
      : defaultTypstDocumentOptions.answerLines
    regenerateDocument({ dropWritingLines: true })
  }

  function resetDocumentOptions() {
    documentOptions = { ...defaultTypstDocumentOptions }
    persistPreferences()
    // réinitialisation complète : les réglages de la palette de mise en page
    // (colonnes/espacement par exercice, insertions) ne sont pas repris
    const code = buildTypstDocument(buildInputs(), documentOptions, {}, [], {
      sourceUrl: currentUrl(),
      extraPreamble: extraPreamble(),
    })
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /** Regénère le contenu (listeQuestions, listeCorrections...) de l'exercice k */
  function regenerate(k: number) {
    const exercise = exercises[k]
    if (exercise == null) return
    exercise.numeroExercice = k
    if (
      exercise.seed === undefined &&
      typeof exercise.applyNewSeed === 'function'
    ) {
      exercise.applyNewSeed()
    }
    seedrandom(exercise.seed, { global: true })
    if (exercise.typeExercice === 'statique') {
      // Contenu figé (images/texte fixes) : rien à régénérer.
      return
    }
    context.isTypst = true
    try {
      if (exercise.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercise, false, k)
      } else if (typeof exercise.nouvelleVersionWrapper === 'function') {
        exercise.nouvelleVersionWrapper(k)
      }
    } finally {
      context.isTypst = false
    }
  }

  /**
   * Contenu figé des exercices dont le nombre de questions a été changé via
   * la palette : régénérer un exercice avec un autre `nbQuestions` rebrasse
   * toutes ses valeurs (mêmes graines, tirages décalés). Les questions déjà
   * affichées sont donc figées ; seules les questions ajoutées prennent le
   * contenu fraîchement généré. Vidé par les nouvelles données du Sujet A
   * (bouton du sujet ou « Tous les sujets ») ; rendu par ↶ ↷.
   */
  type FrozenInput = {
    intro: string
    consigne: string
    introduction: string
    introCorrection: string
    questions: string[]
    corrections: string[]
    shortAnswers: (string | null | undefined)[]
    /** Énoncés et réponses du tableau « Course aux nombres » */
    canQuestions: string[]
    canAnswers: string[]
  }
  const frozenInputs = new Map<IExercice, FrozenInput>()

  /**
   * Lien vers l'exercice seul sur MathALÉA (réglages et graine inclus),
   * encodé dans le QR-code. Mêmes paramètres que la sortie LaTeX.
   */
  function exerciceUrl(exercise: IExercice): string {
    const url = new URL('https://coopmaths.fr/alea')
    url.searchParams.append('uuid', String(exercise.uuid))
    if (exercise.id !== undefined) url.searchParams.append('id', exercise.id)
    if (exercise.nbQuestions !== undefined) {
      url.searchParams.append('n', exercise.nbQuestions.toString())
    }
    if (exercise.duration !== undefined) {
      url.searchParams.append('d', exercise.duration.toString())
    }
    if (exercise.sup !== undefined)
      url.searchParams.append('s', String(exercise.sup))
    if (exercise.sup2 !== undefined)
      url.searchParams.append('s2', String(exercise.sup2))
    if (exercise.sup3 !== undefined)
      url.searchParams.append('s3', String(exercise.sup3))
    if (exercise.sup4 !== undefined)
      url.searchParams.append('s4', String(exercise.sup4))
    if (exercise.sup5 !== undefined)
      url.searchParams.append('s5', String(exercise.sup5))
    if (exercise.seed !== undefined)
      url.searchParams.append('alea', exercise.seed)
    if (exercise.correctionDetaillee !== undefined) {
      url.searchParams.append('cd', exercise.correctionDetaillee ? '1' : '0')
    }
    if (exercise.nbCols !== undefined) {
      url.searchParams.append('cols', exercise.nbCols.toString())
    }
    // vue élève, sans réglages affichés (comme le QR-code de la sortie LaTeX)
    url.searchParams.append('v', 'eleve')
    url.searchParams.append('es', '0211')
    return url.href
  }

  /**
   * Contenu HTML (avec formules `$...$`) de chaque exercice.
   *
   * `skipFrozen` ignore les questions figées par la palette (voir
   * `frozenInputs`) : ce gel ne vaut que pour le sujet affiché (Sujet A), dont
   * on ne veut pas bousculer les questions déjà distribuées ; les sujets
   * dérivés (B, C...) doivent au contraire être régénérés entièrement à partir
   * de leur graine propre, sans quoi ils recopient le contenu figé du Sujet A
   * et tous les sujets deviennent identiques.
   */
  function buildInputs({
    skipFrozen = false,
  }: { skipFrozen?: boolean } = {}): TypstExerciseInput[] {
    const params = get(exercicesParams)
    return exercises.map((exercise, k) => {
      const input: TypstExerciseInput = {
        title: exercise?.titre ?? '',
        // un exercice statique n'a pas d'id de référentiel de compétences :
        // sa référence affichée (réglage « Afficher la référence des
        // exercices ») est alors son titre (ex. « DNB Juin 2026... Ex 1 »)
        ref:
          exercise?.typeExercice === 'statique'
            ? (exercise.titre ?? '')
            : (params[k]?.id ?? ''),
        intro: '',
        questions: [],
        introCorrection: '',
        corrections: [],
        numbered: false,
        // même prédicat que `nonEditableStaticExercises` : exercice statique
        // sans fichier source .typ, donc juste une image scannée
        isStaticImage:
          exercise?.typeExercice === 'statique' &&
          (exercise.uuid == null ||
            getStaticExerciceTypUrl(exercise.uuid) == null),
        // même prédicat que `nonEditableCorrections` : correction statique
        // sans fichier source _cor.typ, donc juste une image scannée —
        // indépendant de `isStaticImage` (l'énoncé peut avoir sa propre
        // source .typ sans que la correction en ait une, ou l'inverse)
        isStaticCorrectionImage:
          exercise?.typeExercice === 'statique' &&
          (exercise.uuid == null ||
            getStaticExerciceCorTypUrl(exercise.uuid) == null),
      }
      if (exercise == null) {
        input.warning =
          "Cet exercice n'a pas pu être chargé : il n'est pas pris en charge par la vue Typst."
        return input
      }
      if (
        exercise.typeExercice != null &&
        exercise.typeExercice.includes('html')
      ) {
        input.warning = `${exercise.titre} : cet exercice n'existe qu'en version interactive, il ne peut pas être exporté.`
        return input
      }
      regenerate(k)
      input.url = exerciceUrl(exercise)
      input.intro = mathaleaFormatExercice(
        [exercise.consigne, exercise.introduction]
          .filter((text) => text != null && text.length > 0)
          .join('<br>'),
      )
      // consigne et introduction gardées séparées : en mode fusionné, la
      // consigne est recopiée en tête de chaque question (voir buildTypstDocument)
      input.consigne = mathaleaFormatExercice(exercise.consigne ?? '')
      input.introduction = mathaleaFormatExercice(exercise.introduction ?? '')
      const format = (text: string) =>
        mathaleaFormatExercice(text).replaceAll('{zoomFactor}', '1')
      input.questions = (exercise.listeQuestions ?? []).map(format)
      input.corrections = (exercise.listeCorrections ?? []).map(format)
      input.shortAnswers = input.questions.map((_, i) => {
        const answer = getShortAnswer(exercise, i)
        return answer == null ? answer : format(answer)
      })
      input.introCorrection = mathaleaFormatExercice(
        exercise.consigneCorrection ?? '',
      )
      // le nombre de questions n'entre pas en jeu ici : un exercice à
      // question unique n'est de toute façon jamais mis dans un
      // environnement `tasks` (donc jamais numéroté), sauf s'il rejoint un
      // groupe fusionné (voir `forceList` dans buildTypstDocument)
      input.numbered = exercise.listeAvecNumerotation !== false
      // mode « Course aux nombres » : énoncés propres au tableau (à défaut,
      // les questions ordinaires précédées de la consigne — le tableau
      // n'affiche jamais `intro`/`consigne` à part, un exercice qui n'a pas
      // été écrit pour ce mode perdrait donc silencieusement sa consigne)
      // et réponses à compléter, comme le style « Can » de la sortie LaTeX
      // (voir `lib/Latex.ts`)
      input.canQuestions = input.questions.map((question, i) => {
        const canEnonce = exercise.listeCanEnonces?.[i]
        if (canEnonce != null && canEnonce.length > 0) return format(canEnonce)
        const consigne = input.consigne ?? ''
        return consigne.length > 0 ? `${consigne}<br>${question}` : question
      })
      input.canAnswers = input.questions.map((_, i) =>
        format(exercise.listeCanReponsesACompleter?.[i] ?? ''),
      )
      // questions liées : celles qui partagent l'énoncé de la précédente
      // (une même courbe lue deux fois, par exemple) n'ont qu'une réponse à
      // compléter, l'énoncé couvrant leurs lignes — comme en LaTeX
      input.canLinkedTo = exercise.listeCanLiees
      input.canLinkNumbers = exercise.listeCanNumerosLies
      // questions figées par la palette (nombre de questions modifié) : les
      // questions déjà affichées gardent leur contenu, seules les questions
      // ajoutées prennent le contenu fraîchement généré
      const frozen = skipFrozen ? undefined : frozenInputs.get(exercise)
      if (frozen != null) {
        input.intro = frozen.intro
        input.consigne = frozen.consigne
        input.introduction = frozen.introduction
        input.introCorrection = frozen.introCorrection
        input.questions = input.questions.map(
          (question, i) => frozen.questions[i] ?? question,
        )
        input.corrections = input.corrections.map(
          (correction, i) => frozen.corrections[i] ?? correction,
        )
        input.shortAnswers = input.shortAnswers?.map((answer, i) =>
          i < frozen.questions.length ? frozen.shortAnswers[i] : answer,
        )
        input.canQuestions = input.canQuestions?.map(
          (question, i) => frozen.canQuestions[i] ?? question,
        )
        input.canAnswers = input.canAnswers?.map(
          (answer, i) => frozen.canAnswers[i] ?? answer,
        )
      }
      return input
    })
  }

  /**
   * Contenu de chaque version du sujet (Sujet A, B...) : la version 0 utilise
   * la graine de base (visible dans les réglages), les suivantes une graine
   * dérivée — même formule que `Diaporama.svelte` (`reroll`), pour
   * que la 2e version corresponde à la 2e vue du diaporama.
   */
  function buildAllVersionInputs(): TypstExerciseInput[][] {
    const baseSeeds = exercises.map((exercise) => exercise?.seed)
    const nbVersions = Math.max(1, documentOptions.nbVersions)
    // graines épinglées par sujet (« Nouvelles données » sur un seul sujet) :
    // ignorées si leur longueur ne colle plus à la liste d'exercices (un ajout
    // ou une suppression a décalé les index — `dropVersionSeeds` les vide dans
    // ce cas, ce test n'est qu'une sécurité)
    const versionSeeds = documentOptions.versionSeeds
    const perVersion: TypstExerciseInput[][] = []
    for (let version = 0; version < nbVersions; version++) {
      const pinned =
        version > 0 && versionSeeds?.[version]?.length === exercises.length
          ? versionSeeds[version]
          : undefined
      for (const [k, exercise] of exercises.entries()) {
        if (exercise == null) continue
        const base = baseSeeds[k]
        exercise.seed =
          version === 0 || base === undefined
            ? base
            : (pinned?.[k] ?? `${base}${version}`)
      }
      // le gel de la palette ne concerne que le Sujet A : les sujets dérivés
      // sont régénérés intégralement à partir de leur graine propre
      perVersion.push(buildInputs({ skipFrozen: version > 0 }))
    }
    // on restaure la graine de base : c'est elle que montrent les réglages
    for (const [k, exercise] of exercises.entries()) {
      if (exercise != null) exercise.seed = baseSeeds[k]
    }
    return perVersion
  }

  /**
   * URL longue de la fiche pour un sujet donné, recalculée à la volée — passée
   * à la palette de mise en page pour le raccourcissement edurl.fr du QR-code
   * global : contrairement à `qrCodeUrlValues` (lu dans le code Typst), elle
   * reste la vraie URL d'origine même après que le QR-code a déjà été
   * raccourci ou personnalisé à la main.
   */
  function ficheUrlForVersion(version: number): string | undefined {
    const [primary, ...extraVersions] = buildAllVersionInputs()
    const inputs = version === 0 ? primary : extraVersions[version - 1]
    return inputs != null ? ficheUrl(inputs) : undefined
  }

  function buildCode(
    options: { dropWritingLines?: boolean; carryOver?: TypstCarryOver } = {},
  ): string {
    // les ajustements faits via la palette de mise en page (colonnes,
    // espacement, insertions) sont repris du code courant pour survivre
    // à la régénération ; au tout premier rendu (éditeur pas encore créé),
    // on repart des réglages restaurés depuis l'URL le cas échéant
    const harvested =
      options.carryOver ??
      (editorView != null
        ? harvestCarryOver(currentCode())
        : (urlCarryOver ?? {}))
    const carryOver = options.dropWritingLines
      ? {
          ...harvested,
          writingLines: undefined,
          versions:
            harvested.versions == null
              ? undefined
              : Object.fromEntries(
                  Object.entries(harvested.versions).map(([version, carry]) => [
                    version,
                    { ...carry, writingLines: undefined },
                  ]),
                ),
        }
      : harvested
    const [primary, ...extraVersions] = buildAllVersionInputs()
    return buildTypstDocument(
      primary,
      documentOptions,
      carryOver,
      extraVersions,
      {
        sourceUrl: currentUrl(),
        extraPreamble: extraPreamble(),
      },
    )
  }

  /**
   * Relecture de la palette et report dans l'URL, débouncés comme la
   * compilation : `refreshTasksLayout` balaie tout le document à coups
   * d'expressions régulières et `persistToUrl` en refait autant (via
   * `harvestCarryOver`) avant d'encoder l'URL en base64. À chaque frappe,
   * c'est deux relectures complètes du document pour un résultat dont
   * personne n'a besoin entre deux caractères.
   */
  let documentSyncTimer: ReturnType<typeof setTimeout>
  function scheduleDocumentSync(code: string, immediate = false) {
    clearTimeout(documentSyncTimer)
    // une édition de la palette doit relire ses valeurs tout de suite : les
    // pas-à-pas calculent la valeur suivante à partir de celle affichée, un
    // clic répété repartirait sinon d'une valeur périmée
    if (immediate) refreshTasksLayout(code)
    documentSyncTimer = setTimeout(() => {
      if (!immediate) refreshTasksLayout(code)
      // toute modification structurée (palette, régénération) est reportée
      // dans l'URL ; le garde-fou sur la valeur encodée évite d'écrire à
      // chaque frappe qui ne change pas les réglages
      persistToUrl()
    }, 500)
  }

  function initEditor(content: string) {
    editorView?.destroy()
    editorView = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          ...codeEditorExtensions({
            dark: $darkMode.isActive,
            language: typstLanguage,
            // Ctrl/Cmd + Entrée : compiler sans attendre le débounce
            onCompileNow: () => scheduleCompile(currentCode(), 0),
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              // les éditions de la palette survivent à la régénération :
              // seule la frappe directe arme l'avertissement d'écrasement
              if (!isPaletteEdit) isEdited = true
              const code = update.state.doc.toString()
              canRestoreLastGood = lastGoodCode != null && lastGoodCode !== code
              scheduleDocumentSync(code, isPaletteEdit)
              scheduleCompile(
                code,
                isPaletteEdit ? PALETTE_COMPILE_DELAY : undefined,
              )
            }
          }),
        ],
      }),
      parent: editorEl,
    })
    refreshTasksLayout(content)
  }

  // l'éditeur suit le thème clair/sombre de l'application
  $effect(() => {
    const dark = $darkMode.isActive
    if (editorView != null) setEditorTheme(editorView, dark)
  })

  /**
   * Rétablit le dernier code qui a compilé. L'opération passe par
   * l'historique de CodeMirror : elle est annulable par Ctrl/Cmd + Z si le
   * professeur veut finalement récupérer sa version en cours.
   */
  function restoreLastGoodCode() {
    if (editorView == null || lastGoodCode == null) return
    const restored = lastGoodCode
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: restored },
      selection: { anchor: 0 },
    })
    editorView.focus()
    scheduleCompile(restored, PALETTE_COMPILE_DELAY)
  }

  /** Place le curseur sur la ligne d'un diagnostic (clic dans le panneau) */
  function goToDiagnostic(diagnostic: TypstDiagnostic) {
    if (editorView == null || diagnostic.line == null) return
    if (displayMode === 'preview') setDisplayMode('split')
    revealPosition(
      editorView,
      diagnostic.line,
      diagnostic.column,
      diagnostic.endLine,
      diagnostic.endColumn,
    )
  }

  /**
   * Repère (1-based) de la ligne de code où éditer un exercice ou sa
   * correction.
   *
   * En mode « banque » (le mode courant), le contenu d'un énoncé est dans sa
   * définition (`// ----- Exercice N -----` puis `#let exN = exo.with(...)`) :
   * le repère `#mathalea-anchor("exo", N)`, lui, ne précède que l'appel
   * `#exN()` de la section « Énoncés », où il n'y a rien à modifier. On vise
   * donc d'abord le titre de la définition, et on ne retombe sur le repère
   * que s'il n'y en a pas — c'est le cas du mode fusionné, où le contenu suit
   * directement le repère.
   *
   * Une correction n'a pas de définition séparée : son contenu suit son
   * repère `#mathalea-anchor("corr", N)`, qui reste donc la bonne cible.
   */
  function findExerciseSourceLine(
    code: string,
    kind: 'exo' | 'corr',
    num: number,
  ): number | null {
    const lines = code.split('\n')
    if (kind === 'exo') {
      const titleLine = lines.findIndex((line) =>
        new RegExp(`^//\\s*-+\\s*Exercice ${num}\\b`).test(line),
      )
      if (titleLine !== -1) return titleLine + 1
    }
    const anchorPattern = new RegExp(
      `#mathalea-anchor\\(\\s*"${kind}"\\s*,\\s*${num}\\s*\\)`,
    )
    const anchorLine = lines.findIndex((line) => anchorPattern.test(line))
    return anchorLine === -1 ? null : anchorLine + 1
  }

  /**
   * Double-clic sur l'aperçu : amène le curseur, dans l'éditeur, sur
   * l'exercice (ou sa correction) affiché au point cliqué. Convertit le
   * clic en coordonnées SVG (mêmes unités que les repères de la palette de
   * mise en page, voir `computeOverlayWidgets`), repère la page puis le
   * dernier repère « exo »/« corr » rencontré au-dessus du point cliqué.
   */
  function jumpToSourceFromClick(event: MouseEvent) {
    if (editorView == null) return
    // ignore un double-clic sur un contrôle de la palette de mise en page
    // (bouton, champ…), qui a déjà son propre comportement
    const target = event.target as HTMLElement
    if (
      target !== event.currentTarget &&
      target.closest('button, input, select')
    )
      return
    const point = previewPointFromEvent(event)
    if (point == null) return
    const sectionAnchors = anchors.filter(
      (anchor) => anchor.kind === 'exo' || anchor.kind === 'corr',
    )
    // dernier repère `exo`/`corr` avant le clic dans l'ordre de lecture
    // (colonnes comprises) ; clic au-dessus du premier repère de la fiche
    // (ex. dans l'en-tête) : on vise plutôt le premier exercice qui suit
    const candidate =
      locateSectionAnchor(
        sectionAnchors,
        previewPages,
        documentColumns,
        point.page,
        point.x,
        point.y,
      ) ??
      sectionAnchors.find((anchor) => anchor.page >= point.page) ??
      sectionAnchors[0] ??
      null
    if (candidate == null) return

    const line = findExerciseSourceLine(
      subjectEditorCode(currentCode(), previewVersion),
      candidate.kind === 'corr' ? 'corr' : 'exo',
      candidate.num,
    )
    if (line == null) return
    if (displayMode === 'preview') setDisplayMode('split')
    revealPosition(editorView, line)
  }

  function setEditorContent(content: string) {
    if (editorView == null) return
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: content,
      },
    })
    isEdited = false
  }

  /** Renvoie les réglages du sujet affiché, en conservant ceux des autres. */
  function activeCarryOver(carry: TypstCarryOver): TypstCarryOver {
    if (previewVersion === 0) return carry
    carry.versions ??= {}
    return (carry.versions[previewVersion] ??= {})
  }

  function currentCode(): string {
    return editorView?.state.doc.toString() ?? ''
  }

  /**
   * URL complète permettant de régénérer cette fiche à l'identique : inscrite
   * en commentaire en tête du code Typst généré, pour un professeur qui en
   * retrouve un exemplaire imprimé ou téléchargé. Elle part des paramètres
   * des exercices et non de la barre d'adresse, mise à jour après la
   * génération du code : après « Nouvelles données », elle porterait encore
   * les graines du tirage précédent.
   */
  function currentUrl(): string {
    return buildShareUrl(
      mathaleaBuildUrlFromExercicesParams().href,
      fullTypstParam,
    )
  }

  /**
   * État de la fiche pour « Mes feuilles » : URL qui la régénère
   * (exercices, graines, `typstParam` complet) et aperçu du sujet affiché,
   * recompilé au besoin pour inclure les dernières retouches.
   */
  async function getSheetContent(): Promise<{
    content: SheetContent
    preview?: SheetPreview
  }> {
    clearTimeout(compileTimer)
    await compile(currentCode())
    persistToUrl()
    const href = buildShareUrl(
      mathaleaBuildUrlFromExercicesParams().href,
      fullTypstParam,
    )
    return {
      content: {
        query: queryFromUrl(href),
        // référence affichée par la fiche (voir `buildInputs`), à défaut le
        // titre de l'exercice
        exercises: get(exercicesParams).map(
          (p, i) => p.id ?? exercises[i]?.titre ?? p.uuid,
        ),
      },
      preview: buildPreview(svgContent, previewPages),
    }
  }

  /**
   * Code Typst du préambule des banques externes dont un exercice figure
   * dans la fiche (voir `manifest.preambule.typ`), à insérer dans le document
   * généré.
   */
  function extraPreamble(): string {
    return getBanquesExternesPreambuleTyp(
      exercises
        .filter((e): e is IExercice => e != null)
        .map((e) => String(e.uuid)),
    )
  }

  /**
   * Compilation en direct : débouncée pendant la frappe et sérialisée
   * (une seule compilation à la fois, la dernière demande gagne).
   */
  let compileTimer: ReturnType<typeof setTimeout>
  let compileToken = 0
  /**
   * Délai des recompilations déclenchées par un contrôle (palette de mise en
   * page, réglages du document, régénération) plutôt que par la frappe. Une
   * compilation n'est pas annulable une fois lancée : sans ce court délai,
   * dix clics rapides sur un pas-à-pas enchaînent dix compilations complètes.
   * Assez court pour rester imperceptible sur un clic isolé.
   */
  const PALETTE_COMPILE_DELAY = 120
  /**
   * Source de la dernière compilation lancée : de nombreuses actions de
   * réglage régénèrent un code au final identique, qu'il est inutile de
   * recompiler. Remis à zéro par « Nouvelles données » (`resetCompileCache`),
   * où les mêmes réglages doivent bien reproduire un document.
   */
  let lastCompiledCode: string | null = null
  function resetCompileCache() {
    lastCompiledCode = null
  }

  /**
   * Sujet montré dans l'aperçu (0 = Sujet A). Sans effet sur le code ni sur
   * les exports, qui portent toujours tous les sujets.
   */
  let previewVersion = $state(0)

  /**
   * Les sujets sont enchaînés : l'aperçu montre la fiche entière. Possible
   * sans page de garde ou avec le bandeau compact (`recitation`), qui tient
   * en tête de page ; les autres modèles occupent une page entière.
   */
  const chainActive = $derived(
    (documentOptions.copiesPerPage > 1 ||
      (documentOptions.chainSubjects && documentOptions.nbVersions > 1)) &&
      ['aucune', 'recitation'].includes(
        documentOptions.coverPage?.template ?? 'aucune',
      ),
  )

  /**
   * Nombre de sujets (ou d'exemplaires) qui tiennent sur une page, d'après la
   * hauteur des sujets mesurée à la dernière compilation (repères
   * `subject-start`/`subject-end`) ; 1 tant qu'elle est inconnue ou qu'un
   * sujet déborde sur une seconde page. Les réglages « Enchaîner les sujets »
   * et « Exemplaires par page » ne sont proposés qu'à partir de 2.
   */
  const subjectsPerPage = $derived.by(() => {
    // le sujet le plus haut décide (tous sont compilés quand ils sont
    // enchaînés ; sinon seul le sujet affiché a ses repères)
    let height = 0
    for (const start of anchors) {
      if (start.kind !== 'subject-start') continue
      const end = anchors.find(
        (anchor) => anchor.kind === 'subject-end' && anchor.num === start.num,
      )
      if (end == null || start.page !== end.page) return 1
      height = Math.max(height, end.y - start.y)
    }
    if (height <= 0) return 1
    const pointsPerMm = 72 / 25.4
    const body = pageBodySize(documentOptions, 10).height * pointsPerMm
    // parts égales de la page, chacune avec 1,2 em sous le trait pointillé
    // (voir MATHALEA_CHAIN_HELPER)
    const gap = 1.2 * documentOptions.fontSize
    return Math.max(
      1,
      Math.min(MAX_COPIES_PER_PAGE, Math.floor((body - 1) / (height + gap))),
    )
  })

  /**
   * Source réellement compilée pour l'aperçu : sur une fiche à plusieurs
   * sujets, seul le sujet affiché est conservé. Compiler les autres coûte
   * leur mise en page entière (l'essentiel du temps d'attente) pour un
   * contenu qu'on ne regarde pas ; ils restent dans l'éditeur et dans les
   * exports : le PDF compile `currentCode()` tel quel et le .typ nettoie
   * uniquement ses repères et marqueurs internes.
   *
   * Les lignes écartées sont remplacées par des lignes vides plutôt que
   * supprimées : les diagnostics du compilateur gardent ainsi les numéros de
   * ligne de l'éditeur.
   */
  function previewCode(code: string): string {
    const lines = code.split('\n')
    const starts: { num: number; line: number }[] = []
    for (const [i, line] of lines.entries()) {
      const match = SUBJECT_MARKER_PATTERN.exec(line)
      if (match != null) starts.push({ num: Number(match[1]), line: i })
    }
    if (starts.length < 2) return code
    const index = starts.findIndex((start) => start.num === previewVersion)
    if (index === -1) return code
    const from = starts[index].line
    const to = index + 1 < starts.length ? starts[index + 1].line : lines.length
    // tout ce qui précède le premier repère est le préambule, commun aux sujets
    const preambleEnd = starts[0].line
    return lines
      .map((line, i) => (i < preambleEnd || (i >= from && i < to) ? line : ''))
      .join('\n')
  }

  /**
   * Sujet dont les pastilles de l'aperçu portent les exercices. Sujets
   * enchaînés : la palette ne garde que les repères du Sujet A (voir
   * `paletteAnchors`), quel que soit le dernier sujet choisi dans « Aperçu ».
   */
  const overlaySubject = $derived(
    chainActive
      ? 0
      : Math.min(previewVersion, Math.max(1, documentOptions.nbVersions) - 1),
  )

  /** Change le sujet affiché et recompile */
  function showVersion(num: number) {
    if (num === previewVersion) return
    previewVersion = num
    refreshTasksLayout(currentCode())
    scheduleCompile(currentCode(), PALETTE_COMPILE_DELAY)
  }
  function scheduleCompile(code: string, delay = 500) {
    clearTimeout(compileTimer)
    if (isPaletteEdit || delay <= PALETTE_COMPILE_DELAY) isPreviewBusy = true
    compileTimer = setTimeout(() => compile(code), delay)
  }

  /**
   * Traduit les diagnostics bruts du compilateur et les reporte dans
   * l'éditeur (surlignage des lignes fautives et pastilles dans la marge).
   * Le panneau se rouvre dès qu'une nouvelle erreur apparaît, même si le
   * professeur l'avait replié.
   */
  function applyDiagnostics(raw: string[]) {
    const previousErrors = countErrors(diagnostics)
    diagnostics = parseTypstDiagnostics(raw)
    if (countErrors(diagnostics) > previousErrors)
      isDiagnosticsCollapsed = false
    if (editorView != null) {
      const markers: EditorMarker[] = diagnostics
        .filter((diagnostic) => diagnostic.line != null)
        .map((diagnostic) => ({
          line: diagnostic.line as number,
          column: diagnostic.column,
          endLine: diagnostic.endLine,
          endColumn: diagnostic.endColumn,
          severity: diagnostic.severity,
          message: diagnostic.message,
        }))
      setEditorMarkers(editorView, markers)
    }
  }

  /** Résolue une fois la prochaine image affichée par le navigateur */
  function nextPaint(): Promise<void> {
    return new Promise((resolve) =>
      requestAnimationFrame(() => setTimeout(resolve, 0)),
    )
  }

  async function compile(code: string) {
    const source = withImageGeometry(previewCode(code))
    if (source === lastCompiledCode) {
      if (!isCompiling) isPreviewBusy = false
      return
    }
    lastCompiledCode = source
    const token = ++compileToken
    isCompiling = true
    if (svgContent === '') isCompilerLoading = true
    try {
      // la compilation occupe le fil principal : on laisse d'abord le
      // navigateur afficher le voile (`isPreviewBusy`)
      if (isPreviewBusy) await nextPaint()
      if (token !== compileToken) return
      const { compileTypstToSvg, isCompilerCached } =
        await import('./typstCompiler')
      // adapte le message d'attente : « première visite » seulement si le
      // compilateur n'est pas déjà en cache (téléchargement à prévoir)
      if (isCompilerLoading) compilerFirstVisit = !(await isCompilerCached())
      const result = await compileTypstToSvg(source)
      if (token !== compileToken) return
      applyDiagnostics(result.diagnostics)
      if (result.svg != null) {
        const separated = separatePages(result.svg)
        svgContent = separated.svg
        previewPages = separated.pages
        previewViewBox = separated.viewBox
        anchors = result.anchors ?? []
        imageGeometries = result.imageGeometries ?? []
        // point de retour : ce code produit bien un document
        lastGoodCode = code
        lastGoodAt = new Date()
        canRestoreLastGood = false
      } else {
        canRestoreLastGood = lastGoodCode != null && lastGoodCode !== code
      }
    } catch (error) {
      // l'échec peut venir d'une ressource momentanément indisponible : la
      // même source doit pouvoir être recompilée
      resetCompileCache()
      if (token !== compileToken) return
      console.error('Erreur lors de la compilation Typst', error)
      applyDiagnostics([
        'error: ' + (error instanceof Error ? error.message : String(error)),
      ])
      canRestoreLastGood = lastGoodCode != null && lastGoodCode !== code
    } finally {
      if (token === compileToken) {
        isCompiling = false
        isCompilerLoading = false
        isPreviewBusy = false
      }
    }
  }

  /**
   * Récupère les images référencées par un `<img>` dans le contenu HTML de
   * n'importe quel exercice (pas seulement les annales scannées) et les
   * charge dans le compilateur Typst (système de fichiers virtuel), pour
   * qu'elles s'affichent dans l'aperçu au lieu d'un encart « non convertie ».
   * Une image dont la récupération échoue (réseau, ou hôte n'autorisant pas
   * le CORS) reste absente du registre : elle s'affiche alors comme un
   * encart, sans bloquer le reste de la fiche.
   */
  /**
   * Récrit une URL `https://coopmaths.fr/alea/...` en URL de même origine
   * que l'application (proxyée vers coopmaths.fr en développement, voir
   * `vite.config.ts`) : coopmaths.fr n'envoie pas d'en-têtes CORS, un fetch
   * direct échouerait sinon dès que l'appli n'est pas servie depuis ce domaine.
   */
  function toSameOriginUrl(url: string): string {
    const prefix = 'https://coopmaths.fr/alea/'
    return url.startsWith(prefix)
      ? `${window.location.origin}${import.meta.env.BASE_URL}${url.slice(prefix.length)}`
      : url
  }

  /**
   * Repère de début d'un item d'énumération Typst de premier niveau (`+ `
   * en tout début de ligne, sans indentation : une sous-liste indentée
   * n'est donc pas prise pour des questions séparées).
   */
  const TYP_QUESTION_ITEM = /^\+[ \t]+/m

  /**
   * Sépare le code Typst d'un exercice statique en énoncé fixe et questions
   * individuelles, à partir de sa numérotation classique (`+ question`) :
   * c'est l'affichage qui repère les questions, l'auteur du `.typ` écrit une
   * énumération Typst ordinaire (toujours compilable seule avec
   * `typst compile`, sans convention MathALÉA à connaître). Sans item de
   * premier niveau, tout le fichier reste une question unique.
   */
  function splitTypQuestions(code: string): {
    intro: string
    questions: string[]
  } {
    const parts = code.split(TYP_QUESTION_ITEM)
    if (parts.length === 1) return { intro: code, questions: [] }
    const [intro, ...questions] = parts
    return { intro, questions }
  }

  /**
   * Remplace, pour chaque exercice statique (annale scannée) disposant d'un
   * fichier source Typst (`typ: true` dans le référentiel), l'énoncé généré
   * par `buildExercisesList` (un `<img>` pointant vers le png) par le code
   * Typst du fichier, inséré tel quel via le marqueur `<mathalea-typst>`
   * (voir `htmlToTypst`). Propre à la vue Typst : les autres vues
   * (A4, QuestionParPage...) continuent d'afficher le png, `buildExercisesList`
   * n'est pas modifiée. Un fichier absent ou vide laisse l'énoncé (png) inchangé.
   *
   * Les questions repérées par `splitTypQuestions` deviennent des entrées
   * séparées de `listeQuestions` : la numérotation passe alors par le même
   * environnement `#tasks(...)` que les autres exercices et respecte le
   * réglage « Numéros des questions en gras ».
   *
   * La correction suit le même principe à partir du fichier `<uuid>_cor.typ`
   * (à côté du `.typ` de l'énoncé), indépendamment de celui-ci : ce fichier
   * est optionnel (pas toujours encore rédigé), son absence laisse la
   * correction (png scanné) inchangée même si l'énoncé a bien son `.typ`.
   */
  async function applyTypSourcesForStaticExercises() {
    for (const exercise of exercises) {
      if (exercise == null || exercise.typeExercice !== 'statique') continue
      const uuid = exercise.uuid
      if (uuid == null) continue
      if (getStaticExerciceTypUrl(uuid) == null) continue

      const typUrl = getStaticExerciceTypUrl(uuid)
      try {
        if (typUrl == null) throw new Error('no typ url')
        const response = await window.fetch(typUrl)
        if (!response.ok) throw new Error('fetch failed')
        const code = await response.text()
        if (code.trim().length === 0) throw new Error('empty file')
        const { intro, questions } = splitTypQuestions(code)
        if (questions.length === 0) {
          exercise.listeQuestions[0] = `<mathalea-typst>${code}</mathalea-typst>`
        } else {
          if (intro.trim().length > 0) {
            exercise.consigne = `<mathalea-typst>${intro}</mathalea-typst>`
          }
          exercise.listeQuestions = questions.map(
            (question) => `<mathalea-typst>${question}</mathalea-typst>`,
          )
          exercise.nbQuestions = questions.length
        }
      } catch {
        // fichier .typ absent ou inaccessible : l'énoncé (png) reste inchangé
      }

      try {
        const corTypUrl = getStaticExerciceCorTypUrl(uuid)
        if (corTypUrl == null) throw new Error('no cor typ url')
        const response = await window.fetch(corTypUrl)
        if (!response.ok) throw new Error('fetch failed')
        const code = await response.text()
        if (code.trim().length === 0) throw new Error('empty file')
        const { intro, questions } = splitTypQuestions(code)
        if (questions.length === 0) {
          exercise.listeCorrections[0] = `<mathalea-typst>${code}</mathalea-typst>`
        } else {
          if (intro.trim().length > 0) {
            exercise.consigneCorrection = `<mathalea-typst>${intro}</mathalea-typst>`
          }
          exercise.listeCorrections = questions.map(
            (question) => `<mathalea-typst>${question}</mathalea-typst>`,
          )
        }
      } catch {
        // fichier _cor.typ absent ou inaccessible (pas encore rédigé) :
        // la correction (png scanné) reste inchangée
      }
    }
  }

  /** Extensions d'image reconnues par Typst pour le chemin virtuel du fichier */
  const KNOWN_IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp'])

  /**
   * Appel `#image("chemin relatif")` dans le code Typst brut d'un exercice
   * statique (`typ: true`), tel qu'écrit par l'auteur du `.typ` (voir
   * `applyTypSourcesForStaticExercises`). Ne capture que les chemins
   * relatifs : une URL absolue (`https://...`) n'est pas prise en charge par
   * `#image`, elle échouerait de toute façon à la compilation d'origine.
   */
  const TYP_IMAGE_CALL = /#image\(\s*"([^"]+)"/g

  /**
   * Octets des images nécessaires à la compilation du code courant, indexés
   * par le chemin virtuel exact référencé par les `image(...)` du document
   * généré (mêmes clés que `setStaticImageBytes`, voir `prefetchStaticImages`).
   * Réutilisés par `downloadTyp` pour empaqueter le `.typ` téléchargé avec
   * ses images : sans elles, le fichier téléchargé seul ne compile pas
   * (chemins relatifs ou virtuels introuvables hors de l'appli).
   */
  let requiredImageAssets: Map<string, Uint8Array> = $state(new Map())

  async function prefetchStaticImages() {
    // régénère chaque exercice (avec context.isTypst, comme le fera buildCode()
    // juste après) : pour un exercice non « statique » (dont son contenu est
    // déjà figé par buildExercisesList), consigne/listeQuestions sont encore
    // vides à ce stade, nouvelleVersion() n'ayant pas encore tourné — sans
    // cette passe, aucun <img> ne serait trouvé. Idempotent (reseed
    // déterministe par exercise.seed) : regenerate() est rappelée par
    // buildCode() juste après sans changer son résultat.
    for (const k of exercises.keys()) regenerate(k)

    const urls = new Set<string>()
    const imgSrc = /<img[^>]*\ssrc=["']([^"']+)["']/gi
    // chemin virtuel (identique au chemin relatif du `#image(...)`, pour que
    // le `.typ` reste utilisable tel quel) -> URL réelle, résolue par rapport
    // au dossier du `.typ` source de l'exercice
    const typImageUrls = new Map<string, string>()
    for (const exercise of exercises) {
      if (exercise == null) continue
      const html = [
        exercise.consigne,
        ...(exercise.listeQuestions ?? []),
        ...(exercise.listeCorrections ?? []),
      ].join('')
      for (const match of html.matchAll(imgSrc)) urls.add(match[1])

      if (exercise.typeExercice === 'statique' && exercise.uuid != null) {
        const typUrl = getStaticExerciceTypUrl(exercise.uuid)
        if (typUrl != null) {
          const typBase = new URL(typUrl, window.location.href)
          for (const match of html.matchAll(TYP_IMAGE_CALL)) {
            const relativePath = match[1]
            if (/^[a-z][a-z0-9+.-]*:/i.test(relativePath)) continue // URL absolue : non gérée par #image
            typImageUrls.set(
              `/${relativePath}`,
              new URL(relativePath, typBase).href,
            )
          }
        }
      }
    }
    // logo de la page de garde « Course aux nombres » (voir `mathaleaLogo.ts`) :
    // un asset fixe de l'appli, pas une image d'exercice, mais chargé et
    // empaqueté (aperçu + .zip téléchargé) par le même mécanisme
    const needsLogoCan = documentOptions.coverPage.template === 'can'
    if (urls.size === 0 && typImageUrls.size === 0 && !needsLogoCan) {
      requiredImageAssets = new Map()
      return
    }
    const { cachedBytes, setStaticImageBytes } = await import('./typstCompiler')
    const paths = new Map<string, string>()
    const bytes = new Map<string, Uint8Array>()
    await Promise.all(
      [...urls].map(async (url, i) => {
        try {
          // le chemin virtuel doit porter la vraie extension : Typst détermine
          // le format d'une image d'après l'extension de son chemin (`format:
          // auto`), une image JPEG enregistrée sous un chemin `.png` échoue au
          // décodage
          const rawExt = /\.([a-z0-9]+)(?:[?#]|$)/i
            .exec(url)?.[1]
            ?.toLowerCase()
          const ext =
            rawExt != null && KNOWN_IMAGE_EXTENSIONS.has(rawExt)
              ? rawExt
              : 'png'
          const path = `/static-img-${i}.${ext}`
          bytes.set(path, await cachedBytes(toSameOriginUrl(url)))
          paths.set(url, path)
        } catch {
          // image indisponible : elle apparaîtra comme un encart
        }
      }),
    )
    await Promise.all(
      [...typImageUrls].map(async ([virtualPath, url]) => {
        try {
          bytes.set(virtualPath, await cachedBytes(toSameOriginUrl(url)))
        } catch {
          // image indisponible : #image() échouera pour cet exercice (diagnostic Typst)
        }
      }),
    )
    if (needsLogoCan) {
      try {
        bytes.set(
          LOGO_CAN_VIRTUAL_PATH,
          await cachedBytes(`${import.meta.env.BASE_URL}${LOGO_CAN_URL}`),
        )
      } catch {
        // logo indisponible : encart « image non convertie » à sa place
      }
    }
    setStaticImagePaths(paths)
    setStaticImageBytes(bytes)
    requiredImageAssets = bytes
    // le registre d'images a changé : le même code doit être recompilé pour
    // que les images fraîchement chargées apparaissent (voir `compile`)
    resetCompileCache()
  }

  async function loadExercises() {
    isLoading = true
    const results = await Promise.allSettled(buildExercisesList())
    exercises = results.map((result) =>
      result.status === 'fulfilled' ? result.value : null,
    )
    for (const exercise of exercises) {
      if (exercise != null) exercise.interactif = false
    }
    await applyTypSourcesForStaticExercises()
    await prefetchStaticImages()
    isLoading = false
  }

  onMount(async () => {
    await loadExercises()
    // Course aux nombres par défaut si la fiche ne contient que des
    // exercices « can » (identifiant commençant par « can », comme
    // `can6M4-07`) : présentation en tableau, format A5 (feuille de passation
    // plus petite) et page de garde assortie — sauf si un lien partagé fixe
    // déjà l'un de ces réglages.
    const loaded = exercises.filter(
      (exercise): exercise is IExercice => exercise != null,
    )
    const allCan =
      loaded.length > 0 &&
      loaded.every((exercise) =>
        (exercise.id ?? '').toLowerCase().includes('can'),
      )
    if (allCan) {
      if (!canModeSetFromUrl) documentOptions.canMode = true
      if (!pageFormatSetFromUrl) documentOptions.pageFormat = 'a5'
      if (
        !titleSetFromUrl &&
        documentOptions.title === defaultTypstDocumentOptions.title
      ) {
        documentOptions.title = CAN_TITLE
      }
      if (!coverTemplateSetFromUrl) {
        documentOptions.coverPage = {
          ...documentOptions.coverPage,
          template: 'can',
          ...COVER_TEMPLATE_DEFAULTS.can,
          bareme: defaultCoverBareme(),
        }
        // la page de garde porte déjà le titre du sujet : pas de second
        // bloc de titre en page 2 (même raison que `applyCoverTemplate`)
        if (!headerStyleSetFromUrl) documentOptions.headerStyle = 'aucun'
      }
      // le passage en page de garde « can » ci-dessus arrive après le
      // premier prefetch (loadExercises) : celui-ci n'a donc pas pu charger
      // le logo, absent du registre à ce moment-là — on le relance.
      await prefetchStaticImages()
    }
    const code = buildCode()
    initEditor(code)
    // normalise l'URL : elle porte désormais l'ensemble des réglages
    // (document + mise en page) tels qu'appliqués au premier rendu
    persistToUrl()
    compile(code)
    maybeStartTypstTour()
  })

  /**
   * Ne se déclenche qu'une fois par poste (localStorage), et seulement sur
   * un vrai premier passage en mode bureau&nbsp;: pas de préférence
   * `mathaleaTypstView` déjà enregistrée (qui changerait le mode
   * d'affichage/l'état des réglages par défaut ciblés par la visite) ni de
   * lien partagé (`typstParam`, même raison). Pas non plus en localhost,
   * pour ne pas se redéclencher à chaque rechargement pendant le
   * développement (voir le même choix dans `Start.svelte`).
   */
  let typstTourTriggered = false
  function maybeStartTypstTour() {
    if (
      typstTourTriggered ||
      hasSeenTypstTour() ||
      isMobile ||
      typstUrlParam != null ||
      window.location.hostname === 'localhost'
    ) {
      return
    }
    if (isLocalStorageAvailable()) {
      try {
        if (window.localStorage.getItem(STORAGE_KEY) != null) return
      } catch {
        return
      }
    }
    typstTourTriggered = true
    setTimeout(startTypstTour, 400)
  }

  onDestroy(() => {
    clearTimeout(compileTimer)
    editorView?.destroy()
    editorView = null
    for (const exercise of exercises) {
      if (exercise == null) continue
      exercise.reinit?.()
      exercise.destroy?.()
    }
  })

  /** Le professeur perd ses modifications manuelles : on le prévient */
  function confirmOverwrite(): boolean {
    if (!isEdited) return true
    return window.confirm(
      'Le code Typst a été modifié : le regénérer écrasera vos modifications. Continuer ?',
    )
  }

  /**
   * « Nouvelles données ». Sur une fiche à plusieurs sujets, ne rebrasse que
   * le sujet choisi (`subject`, 0 = Sujet A) :
   * - Sujet A (ou fiche mono-sujet) : nouvelle graine de base. Les sujets
   *   suivants sont d'abord épinglés à leur tirage courant pour ne pas suivre
   *   la nouvelle graine de A.
   * - Sujet B, C... : nouvelle graine dérivée et distincte pour ce seul sujet,
   *   inscrite dans `documentOptions.versionSeeds` ; base et autres sujets
   *   inchangés.
   */
  function newDataForSubject(subject: number) {
    if (!confirmOverwrite()) return
    const before = seedState()
    // voir applyNewSeedTo : Math.random peut être verrouillé sur la graine
    // du dernier exercice régénéré, il faut le réamorcer avant de tirer
    seedrandom(undefined, { global: true })
    const nbVersions = Math.max(1, documentOptions.nbVersions)
    const target = Math.min(subject, nbVersions - 1)
    // copie modifiable des graines épinglées existantes
    const pinnedSeeds = (documentOptions.versionSeeds ?? []).map((entry) =>
      entry == null ? entry : [...entry],
    )

    if (nbVersions > 1 && target > 0) {
      // un seul sujet concerné : graine dérivée mais distincte pour chacun de
      // ses exercices
      const token = Math.random().toString(36).slice(2, 8)
      pinnedSeeds[target] = exercises.map((exercise) =>
        exercise?.seed == null ? null : `${exercise.seed}${target}~${token}`,
      )
      documentOptions.versionSeeds = pinnedSeeds
    } else {
      // nouvelles graines du Sujet A : ses questions figées par la palette
      // sont libérées (le gel ne vaut que pour lui)
      frozenInputs.clear()
      pinOtherSubjects()
      rerollBaseSeeds()
    }
    exercicesParams.update((list) => list)
    recordDraw(
      before,
      nbVersions > 1
        ? `nouvelles données du Sujet ${subjectLetter(target)}`
        : 'nouvelles données',
      [target],
    )
    // `versionSeeds` vit dans `typstParam`, pas dans `exercicesParams` : à
    // persister explicitement
    persistPreferences()
    const code = buildCode()
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /**
   * « Tous les sujets » : nouvelle graine de base, et les graines épinglées
   * sont oubliées pour que les sujets B, C... suivent leur graine dérivée de
   * la nouvelle base.
   */
  function newDataForAllSubjects() {
    if (!confirmOverwrite()) return
    const before = seedState()
    frozenInputs.clear()
    seedrandom(undefined, { global: true })
    documentOptions.versionSeeds = undefined
    rerollBaseSeeds()
    exercicesParams.update((list) => list)
    recordDraw(
      before,
      'nouvelles données de tous les sujets',
      Array.from({ length: documentOptions.nbVersions }, (_, i) => i),
    )
    persistPreferences()
    const code = buildCode()
    setEditorContent(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
  }

  /**
   * Avant une nouvelle graine de base (Sujet A) : les sujets suivants sont
   * épinglés à leur tirage courant (graine de base encore en place dans
   * exercise.seed) pour qu'ils ne suivent pas la nouvelle graine de A ; un
   * sujet déjà épinglé est laissé tel quel.
   */
  function pinOtherSubjects() {
    const nbVersions = Math.max(1, documentOptions.nbVersions)
    if (nbVersions < 2) return
    const pinnedSeeds = (documentOptions.versionSeeds ?? []).map((entry) =>
      entry == null ? entry : [...entry],
    )
    for (let v = 1; v < nbVersions; v++) {
      if (pinnedSeeds[v]?.length === exercises.length) continue
      pinnedSeeds[v] = exercises.map((exercise) =>
        exercise?.seed == null ? null : `${exercise.seed}${v}`,
      )
    }
    documentOptions.versionSeeds = pinnedSeeds
  }

  /** Nouvelle graine de base pour chaque exercice (Sujet A) */
  function rerollBaseSeeds() {
    const params = get(exercicesParams)
    for (const [k, exercise] of exercises.entries()) {
      if (exercise == null) continue
      exercise.seed = undefined
      if (typeof exercise.applyNewSeed === 'function') exercise.applyNewSeed()
      if (params[k] != null && exercise.seed !== undefined) {
        params[k].alea = exercise.seed
      }
    }
  }

  function subjectLetter(subject: number) {
    return String.fromCharCode(65 + subject)
  }

  /**
   * Graines de toute la fiche : base (Sujet A) et graines épinglées des sujets
   * B, C... ; avec les questions du Sujet A figées par la palette, qu'un
   * tirage libère et qu'une annulation doit rendre.
   */
  type SeedState = {
    base: (string | undefined)[]
    versionSeeds: TypstDocumentOptions['versionSeeds']
    frozen: (FrozenInput | undefined)[]
  }

  /**
   * Un tirage de « Nouvelles données » : l'état des graines qu'il a produit.
   * Les tirages forment un arbre : annuler remonte au parent, et un nouveau
   * tirage fait après une annulation ouvre une branche sans effacer l'autre.
   * `lastChild` est la branche suivie en dernier, celle que reprend
   * « Rétablir ».
   */
  type DrawNode = {
    state: SeedState
    parent: DrawNode | null
    lastChild: DrawNode | null
    /** « nouvelles données du Sujet B », « exercice 2 »... (infobulles) */
    label: string
    /** sujets dont les graines ont changé */
    subjects: number[]
  }

  function seedState(): SeedState {
    return {
      base: exercises.map((exercise) => exercise?.seed),
      versionSeeds: documentOptions.versionSeeds?.map((entry) =>
        entry == null ? entry : [...entry],
      ),
      frozen: exercises.map((exercise) =>
        exercise == null ? undefined : frozenInputs.get(exercise),
      ),
    }
  }

  /** Mémorise le tirage qui vient d'avoir lieu, `before` étant l'état d'avant */
  function recordDraw(before: SeedState, label: string, subjects: number[]) {
    if (currentDraw == null) {
      currentDraw = {
        state: before,
        parent: null,
        lastChild: null,
        label: '',
        subjects: [],
      }
      drawVersions = documentOptions.nbVersions
    }
    const node: DrawNode = {
      state: seedState(),
      parent: currentDraw,
      lastChild: null,
      label,
      subjects,
    }
    currentDraw.lastChild = node
    currentDraw = node
    // seul le chemin du tirage courant reste atteignable (↷ suit la branche
    // la plus récente) : au-delà de MAX_DRAWS tirages sur ce chemin, on
    // oublie la racine et le tirage suivant devient la nouvelle racine
    let first = node
    let length = 1
    while (first.parent != null) {
      first = first.parent
      length++
    }
    if (length > MAX_DRAWS) {
      let second = node
      while (second.parent?.parent != null) second = second.parent
      second.parent = null
      second.label = ''
      second.subjects = []
    }
  }

  function undoDraw() {
    const draw = currentDraw
    if (draw?.parent == null) return
    if (!applySeedState(draw.parent.state, draw.subjects)) return
    currentDraw = draw.parent
  }

  function redoDraw() {
    const next = currentDraw?.lastChild
    if (next == null) return
    if (!applySeedState(next.state, next.subjects)) return
    currentDraw = next
  }

  /**
   * Remet les graines `state`. Les sujets `subjects` sont ceux qui changent :
   * si l'aperçu n'en montre aucun, il passe sur le premier.
   */
  function applySeedState(state: SeedState, subjects: number[]): boolean {
    if (state.base.length !== exercises.length) {
      currentDraw = null
      return false
    }
    if (!confirmOverwrite()) return false
    const params = get(exercicesParams)
    for (const [k, exercise] of exercises.entries()) {
      if (exercise == null) continue
      const frozen = state.frozen[k]
      if (frozen == null) frozenInputs.delete(exercise)
      else frozenInputs.set(exercise, frozen)
      exercise.seed = state.base[k]
      if (params[k] != null && exercise.seed !== undefined) {
        params[k].alea = exercise.seed
      }
    }
    documentOptions.versionSeeds = state.versionSeeds?.map((entry) =>
      entry == null ? entry : [...entry],
    )
    exercicesParams.update((list) => list)
    persistPreferences()
    const nbVersions = Math.max(1, documentOptions.nbVersions)
    const shown = subjects.filter((subject) => subject < nbVersions)
    const showTarget =
      !chainActive && shown.length > 0 && !shown.includes(previewVersion)
    if (showTarget) previewVersion = shown[0]
    const code = buildCode()
    setEditorContent(code)
    if (showTarget) refreshTasksLayout(code)
    scheduleCompile(code, PALETTE_COMPILE_DELAY)
    return true
  }

  function exportFilename() {
    return (
      stringWithNoAccent(documentOptions.title)
        .trim()
        .replace(/[^a-zA-Z0-9 _-]/g, '')
        .replace(/\s+/g, '_') || 'fiche'
    )
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  /** Compile un code Typst en PDF et le télécharge (nom `filename.pdf`) */
  async function compileAndDownload(
    code: string,
    filename: string,
  ): Promise<boolean> {
    const { compileTypstToPdf } = await import('./typstCompiler')
    const pdf = await compileTypstToPdf(code)
    if (pdf == null) return false
    downloadBlob(
      new Blob([pdf as BlobPart], { type: 'application/pdf' }),
      `${filename}.pdf`,
    )
    return true
  }

  async function downloadPdf() {
    if (isGeneratingPdf) return
    isGeneratingPdf = true
    try {
      const ok = await compileAndDownload(currentCode(), exportFilename())
      if (!ok) {
        window.alert(
          'La compilation du PDF a échoué : corrigez les erreurs signalées sous l’aperçu.',
        )
      } else {
        statsPdfCreatedTracker(
          'typst',
          get(exercicesParams).map((p) => p.uuid),
        )
      }
    } catch (error) {
      console.error("Erreur lors de l'export PDF", error)
    } finally {
      isGeneratingPdf = false
    }
  }

  /**
   * Télécharge deux PDF à la suite : `titre_enonce.pdf` puis
   * `titre_corrige.pdf`, à partir du code courant.
   */
  async function downloadPdfSeparate() {
    if (isGeneratingPdf) return
    isGeneratingPdf = true
    try {
      const code = currentCode()
      const base = exportFilename()
      const okEnonce = await compileAndDownload(
        enonceCode(code),
        `${base}_enonce`,
      )
      // court délai : certains navigateurs ignorent deux téléchargements
      // déclenchés dans le même tick
      await new Promise((resolve) => setTimeout(resolve, 400))
      const okCorrige = await compileAndDownload(
        corrigeCode(code),
        `${base}_corrige`,
      )
      if (!okEnonce || !okCorrige) {
        window.alert(
          'La compilation du PDF a échoué : corrigez les erreurs signalées sous l’aperçu.',
        )
      } else {
        statsPdfCreatedTracker(
          'typst',
          get(exercicesParams).map((p) => p.uuid),
        )
      }
    } catch (error) {
      console.error("Erreur lors de l'export PDF séparé", error)
    } finally {
      isGeneratingPdf = false
    }
  }

  /**
   * Code Typst « propre » pour la réutilisation hors de l'appli (fichier
   * .typ téléchargé) : retirer les repères et marqueurs de l’interface du
   * texte actuel de l’éditeur pour conserver toutes les retouches libres.
   */
  function buildExportCode(): string {
    return cleanTypstExport(currentCode())
  }

  /**
   * Télécharge une page HTML qui redirige vers cette fiche : un lien durable
   * (dépôt sur un ENT, dossier de préparation…) sans limite de longueur, car
   * les réglages volumineux voyagent dans le fragment de l'URL.
   */
  function downloadRedirect() {
    downloadBlob(
      new Blob([buildRedirectHtml(currentUrl(), documentOptions.title)], {
        type: 'text/html;charset=utf-8',
      }),
      `${exportFilename()}_mathalea.html`,
    )
  }

  /**
   * Télécharge le `.typ` : seul s'il ne référence aucune image, sinon dans
   * une archive ZIP avec les images nécessaires (mêmes chemins que ceux
   * référencés par le code, voir `requiredImageAssets`) — sans elles, le
   * `.typ` téléchargé seul ne compile pas hors de l'appli.
   */
  async function downloadTyp() {
    const filename = exportFilename()
    if (requiredImageAssets.size === 0) {
      downloadBlob(
        new Blob([buildExportCode()], { type: 'text/plain;charset=utf-8' }),
        `${filename}.typ`,
      )
      return
    }
    const zip = new JSZip()
    zip.file(`${filename}.typ`, buildExportCode())
    for (const [virtualPath, bytes] of requiredImageAssets) {
      zip.file(virtualPath.replace(/^\//, ''), bytes)
    }
    downloadBlob(await zip.generateAsync({ type: 'blob' }), `${filename}.zip`)
  }
</script>

<svelte:head>
  <title>MathALÉA - Impression</title>
</svelte:head>

<main
  class="typst-view {$darkMode.isActive
    ? 'dark'
    : ''} flex flex-col h-screen bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest"
>
  <!-- `relative z-10` : la barre d'outils précède l'aperçu dans le DOM, elle
       doit rester au-dessus de ses pastilles de mise en page (voir `isolate`
       sur le conteneur de l'aperçu) -->
  <div class="relative z-10 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
    <NavBar
      subtitle="Impression"
      subtitleType="export"
      handleLanguage={() => {}}
      locale={$referentielLocale}
      showLanguage={!isMobile}
    />
    <div
      class="flex flex-row flex-wrap items-center gap-x-6 gap-y-3 px-4 md:px-8 py-3 border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <!-- Sur téléphone, seul l'aperçu est disponible : le sélecteur est masqué -->
      <div
        class="{isMobile
          ? 'hidden'
          : 'flex'} flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
        role="group"
        aria-label="Mode d'affichage"
        data-tour="typst-mode-switch"
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

      {#if displayMode === 'preview'}
        <button
          type="button"
          title="Réglages du document"
          data-tour="typst-settings-toggle"
          aria-pressed={isSettingsOpen}
          class="flex items-center gap-1 text-sm {isSettingsOpen
            ? 'text-coopmaths-action font-semibold dark:text-coopmathsdark-action'
            : 'text-coopmaths-action/60 hover:text-coopmaths-action dark:text-coopmathsdark-action/60 dark:hover:text-coopmathsdark-action'}"
          onclick={() => (isSettingsOpen = !isSettingsOpen)}
        >
          <i class="bx bx-cog text-xl"></i>
          Réglages
        </button>
      {/if}

      <div class="flex items-center gap-3">
        {#if documentOptions.nbVersions > 1}
          <!-- le sujet affiché (tous les sujets quand ils sont enchaînés),
               puis « Tous les sujets » -->
          {@const subjects = chainActive
            ? Array.from({ length: documentOptions.nbVersions }, (_, i) => i)
            : [overlaySubject]}
          <div
            class="flex items-center gap-2 text-sm text-coopmaths-action dark:text-coopmathsdark-action"
            role="group"
            aria-label="Nouvelles données"
            data-tour="typst-new-data"
          >
            <span class="flex items-center gap-1">
              <i class="bx bx-refresh text-xl"></i>
              Nouvelles données
            </span>
            <div
              class="flex flex-row rounded-lg overflow-hidden border border-coopmaths-action dark:border-coopmathsdark-action"
            >
              {#each subjects as subject (subject)}
                {@const letter = subjectLetter(subject)}
                <button
                  type="button"
                  title="Nouvelles données pour le Sujet {letter} uniquement (les autres sujets sont conservés)"
                  aria-label="Nouvelles données pour le Sujet {letter}"
                  disabled={isPreviewBusy}
                  class="px-2 py-0.5 text-sm border-r border-coopmaths-action dark:border-coopmathsdark-action disabled:cursor-wait disabled:opacity-50 hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark"
                  onclick={() => newDataForSubject(subject)}
                >
                  {chainActive ? letter : `Sujet ${letter}`}
                </button>
              {/each}
              <button
                type="button"
                title="Nouvelles données pour tous les sujets"
                disabled={isPreviewBusy}
                class="px-2 py-0.5 text-sm disabled:cursor-wait disabled:opacity-50 hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark"
                onclick={newDataForAllSubjects}
              >
                Tous les sujets
              </button>
            </div>
          </div>
        {:else}
          <button
            type="button"
            title="Nouvelles données aléatoires pour tous les exercices"
            data-tour="typst-new-data"
            disabled={isPreviewBusy}
            class="flex items-center gap-1 text-sm disabled:cursor-wait disabled:opacity-50 text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
            onclick={() => newDataForSubject(0)}
          >
            <i class="bx bx-refresh text-xl"></i>
            Nouvelles données
          </button>
        {/if}

        <!-- retour aux données d'avant (et d'après) : seulement les sujets
             touchés par le tirage annulé -->
        {#each [{ icon: 'bx-undo', verb: 'Annuler', target: currentDraw?.parent == null ? null : currentDraw, run: undoDraw }, { icon: 'bx-redo', verb: 'Rétablir', target: currentDraw?.lastChild ?? null, run: redoDraw }] as action (action.icon)}
          <button
            type="button"
            title={action.target == null
              ? `${action.verb} : aucun tirage`
              : `${action.verb} : ${action.target.label}`}
            aria-label={action.verb}
            disabled={action.target == null || isPreviewBusy}
            class="flex items-center text-coopmaths-action/60 hover:text-coopmaths-action dark:text-coopmathsdark-action/60 dark:hover:text-coopmathsdark-action disabled:opacity-30 disabled:hover:text-coopmaths-action/60 dark:disabled:hover:text-coopmathsdark-action/60 {action.target ==
              null || !isPreviewBusy
              ? ''
              : 'disabled:cursor-wait'}"
            onclick={action.run}
          >
            <i class="bx {action.icon} text-xl"></i>
          </button>
        {/each}
      </div>

      <button
        type="button"
        title="Afficher sur l'aperçu les contrôles de mise en page (colonnes et espacement des questions, insertions entre les exercices)"
        data-tour="typst-layout-toggle"
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

      <label class="flex items-center gap-2 text-sm" data-tour="typst-versions">
        <i class="bx bx-copy text-xl"></i>
        Versions
        <select
          class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm disabled:cursor-wait disabled:opacity-50"
          bind:value={documentOptions.nbVersions}
          disabled={isPreviewBusy}
          onchange={applyDocumentOptions}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </label>

      <!-- L'aperçu ne compile qu'un sujet : voir `previewCode`. Les exports
           et le code de l'éditeur portent toujours tous les sujets. Les
           contrôles de mise en page sont disponibles pour chaque sujet, qui peut
           porter les repères de la palette. -->
      {#if documentOptions.nbVersions > 1 && !chainActive}
        <label
          class="flex items-center gap-2 text-sm"
          title="Sujet montré dans l’aperçu — les exports contiennent toujours tous les sujets"
        >
          <i class="bx bx-file text-xl"></i>
          Aperçu
          <select
            class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm disabled:cursor-wait disabled:opacity-50"
            value={previewVersion}
            disabled={isPreviewBusy}
            onchange={(event) => showVersion(Number(event.currentTarget.value))}
          >
            {#each Array(documentOptions.nbVersions) as _, i (i)}
              <option value={i}>Sujet {String.fromCharCode(65 + i)}</option>
            {/each}
          </select>
        </label>
      {/if}

      <div class="grow"></div>

      {#if !$isInIframe}
        <SaveSheetButton
          getContent={getSheetContent}
          defaultName={documentOptions.title}
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

      <button
        type="button"
        title="Télécharger un fichier de redirection : une page HTML qui rouvre cette fiche dans MathALÉA"
        aria-label="Télécharger un fichier de redirection"
        class="flex items-center justify-center rounded-lg border border-coopmaths-action py-1 px-2 text-coopmaths-action hover:bg-coopmaths-action hover:text-coopmaths-canvas dark:border-coopmathsdark-action dark:text-coopmathsdark-action dark:hover:bg-coopmathsdark-action dark:hover:text-coopmathsdark-canvas"
        onclick={downloadRedirect}
      >
        <i class="bx bx-link-external text-xl"></i>
      </button>

      {#if displayMode === 'code' || displayMode === 'split'}
        <ButtonTextAction
          text="Copier le code Typst propre"
          icon="bx-copy"
          inverted={true}
          class="rounded-lg py-1 px-2"
          title="Copier la fiche avec son préambule, sans les repères de l’interface MathALÉA"
          on:click={() =>
            copyToClipboard(buildExportCode(), 'Le code Typst propre')}
        />
        {#if codeCopyStatus !== ''}
          <span class="text-sm" role="status">{codeCopyStatus}</span>
        {/if}
        <ButtonTextAction
          text={requiredImageAssets.size > 0
            ? 'Télécharger le .typ (.zip)'
            : 'Télécharger le .typ'}
          icon="bx-file-blank"
          inverted={true}
          class="rounded-lg py-1 px-2"
          title={requiredImageAssets.size > 0
            ? 'Archive ZIP contenant le .typ et les images dont il a besoin'
            : 'Code Typst propre, sans les repères de l’interface MathALÉA'}
          on:click={downloadTyp}
        />
      {/if}
      {#if displayMode === 'preview' || displayMode === 'split'}
        <ButtonTextAction
          id="typst-download-pdf-button"
          text={isGeneratingPdf ? 'PDF en cours...' : 'Télécharger le PDF'}
          icon={isGeneratingPdf ? 'bx-loader-alt bx-spin' : 'bx-download'}
          inverted={true}
          class="rounded-lg py-1 px-2 min-w-42.5"
          on:click={downloadPdf}
        />
        <ButtonTextAction
          text={isGeneratingPdf
            ? 'PDF en cours...'
            : 'Énoncé + corrigé séparés'}
          icon={isGeneratingPdf ? 'bx-loader-alt bx-spin' : 'bx-copy'}
          inverted={true}
          class="rounded-lg py-1 px-2 min-w-42.5"
          title="Télécharge deux PDF : l'énoncé seul puis le corrigé seul"
          on:click={downloadPdfSeparate}
        />
      {/if}
    </div>
  </div>

  {#if isLoading}
    <div
      class="flex w-full justify-center items-center py-24 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <i class="bx bx-loader-alt bx-spin text-4xl"></i>
    </div>
  {:else}
    <!-- colonne : volets (réglages, éditeur, aperçu) puis panneau d'erreurs -->
    <div class="flex flex-col grow min-h-0">
      <div class="flex flex-row grow min-h-0">
        {#if isSettingsOpen}
          <div
            class="typst-settings-pane relative z-10 w-80 shrink-0 overflow-y-auto border-r border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus p-5 space-y-4"
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

            <ExportViewLinks current="typst" />

            <TypstModels options={documentOptions} onApply={applyModel} />

            <label
              class="flex items-center justify-between gap-4 text-sm"
              data-tour="typst-settings-layout"
            >
              Format
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.pageFormat}
                onchange={applyDocumentOptions}
              >
                <option value="a4">A4</option>
                <option value="a5">A5</option>
              </select>
            </label>

            <label class="flex items-center justify-between gap-4 text-sm">
              Orientation
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.orientation}
                onchange={applyDocumentOptions}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Paysage</option>
              </select>
            </label>

            <div class="flex items-center justify-between gap-4 text-sm">
              <label for="typst-columns-input">Nombre de colonnes</label>
              <input
                id="typst-columns-input"
                type="number"
                min="1"
                max="3"
                step="1"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.columns}
                onchange={applyDocumentOptions}
              />
            </div>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.showCorrections}
                onchange={applyDocumentOptions}
              />
              Afficher la correction
            </label>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.minimalCorrections}
                disabled={!documentOptions.showCorrections}
                onchange={applyDocumentOptions}
              />
              <span
                class:opacity-50={!documentOptions.showCorrections}
                title="Quand une correction met sa réponse en évidence (en orange), n'imprimer que cette réponse"
              >
                Correction minimale
              </span>
            </label>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.oddPageStarts}
                onchange={applyDocumentOptions}
              />
              <span
                title="Le corrigé et chaque sujet supplémentaire commencent sur une page impaire : une page blanche (sans en-tête ni pied de page) est insérée si besoin, pour qu'à l'impression recto-verso en série une partie ne commence jamais au dos de la précédente"
              >
                Impression recto-verso
              </span>
            </label>

            {#if documentOptions.nbVersions > 1}
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={documentOptions.chainSubjects}
                  disabled={subjectsPerPage < 2 &&
                    !documentOptions.chainSubjects}
                  onchange={applyDocumentOptions}
                />
                <span
                  class:opacity-50={subjectsPerPage < 2 &&
                    !documentOptions.chainSubjects}
                  title={subjectsPerPage < 2 && !documentOptions.chainSubjects
                    ? 'Les sujets sont trop longs pour tenir à deux sur une page.'
                    : 'Les sujets se suivent sur une même page, séparés par un trait pointillé, quand ils y tiennent. Les corrections sont regroupées à la fin.'}
                >
                  Plusieurs sujets sur une page
                </span>
              </label>
            {/if}

            <div class="flex items-center justify-between gap-4 text-sm">
              <label
                for="typst-copies-input"
                class:opacity-50={subjectsPerPage < 2 &&
                  documentOptions.copiesPerPage < 2}
                title={subjectsPerPage < 2 && documentOptions.copiesPerPage < 2
                  ? 'Le sujet est trop long pour tenir deux fois sur une page.'
                  : 'Le sujet est répété sur la page, séparé par un trait pointillé, autant de fois qu’il y tient.'}
              >
                Exemplaires par page
              </label>
              <select
                id="typst-copies-input"
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.copiesPerPage}
                disabled={subjectsPerPage < 2 &&
                  documentOptions.copiesPerPage < 2}
                onchange={applyDocumentOptions}
              >
                {#each Array(Math.max(subjectsPerPage, documentOptions.copiesPerPage)) as _, i (i)}
                  <option value={i + 1}>{i + 1}</option>
                {/each}
              </select>
            </div>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.canMode}
                onchange={toggleCanMode}
              />
              Présentation « Course aux nombres »
            </label>

            <div class="space-y-1.5">
              <label
                class="flex items-center justify-between gap-2 text-sm min-w-0"
              >
                <span
                  title="Lignes pour que l'élève réponde, ajoutées à chaque exercice de la fiche. La palette de mise en page peut ensuite régler un exercice à part (nombre, emplacement, trait), auquel cas son réglage l'emporte."
                >
                  Lignes de réponse par exercice
                </span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                  bind:value={documentOptions.answerLines}
                  onchange={applyAnswerLines}
                />
              </label>
              {#if documentOptions.answerLines > 0}
                <label
                  class="flex items-center justify-between gap-2 text-sm min-w-0"
                >
                  Emplacement
                  <select
                    class="max-w-[60%] truncate rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                    bind:value={documentOptions.answerLinesPosition}
                    onchange={applyAnswerLinesStyle}
                  >
                    {#each WRITING_LINES_POSITIONS as position}
                      <option value={position}>
                        {ANSWER_LINES_POSITION_LABELS[position]}
                      </option>
                    {/each}
                  </select>
                </label>
                <label
                  class="flex items-center justify-between gap-2 text-sm min-w-0"
                >
                  Rendu des lignes
                  <select
                    class="max-w-[60%] truncate rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                    bind:value={documentOptions.answerLinesStyle}
                    onchange={applyAnswerLinesStyle}
                  >
                    {#each WRITING_LINES_STYLES as style}
                      <option value={style}>
                        {ANSWER_LINES_STYLE_LABELS[style]}
                      </option>
                    {/each}
                  </select>
                </label>
              {/if}
            </div>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.mergeExercises}
                disabled={documentOptions.canMode}
                onchange={applyDocumentOptions}
              />
              <span class:opacity-50={documentOptions.canMode}>
                Fusionner tous les exercices (questions numérotées à la suite)
              </span>
            </label>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.showExerciseTitles}
                disabled={documentOptions.mergeExercises ||
                  documentOptions.canMode}
                onchange={applyDocumentOptions}
              />
              <span
                class:opacity-50={documentOptions.mergeExercises ||
                  documentOptions.canMode}
              >
                Afficher le titre des exercices
              </span>
            </label>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.showExercisePoints}
                disabled={documentOptions.mergeExercises ||
                  documentOptions.canMode}
                onchange={applyDocumentOptions}
              />
              <span
                class:opacity-50={documentOptions.mergeExercises ||
                  documentOptions.canMode}
              >
                Afficher les points des exercices
              </span>
            </label>

            {#if documentOptions.showExercisePoints && !documentOptions.mergeExercises && !documentOptions.canMode}
              <label class="flex items-center justify-between gap-4 text-sm">
                Position des points
                <select
                  class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                  bind:value={documentOptions.exercisePointsPosition}
                  onchange={applyDocumentOptions}
                >
                  <option value="right">À droite du titre</option>
                  <option value="below">Sous le titre</option>
                </select>
              </label>
            {/if}

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.showExerciseRefs}
                disabled={documentOptions.mergeExercises ||
                  documentOptions.canMode}
                onchange={applyDocumentOptions}
              />
              <span
                class:opacity-50={documentOptions.mergeExercises ||
                  documentOptions.canMode}
              >
                Afficher la référence des exercices
              </span>
            </label>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.showQrCode}
                disabled={documentOptions.mergeExercises ||
                  documentOptions.canMode}
                onchange={applyDocumentOptions}
              />
              <span
                class:opacity-50={documentOptions.mergeExercises ||
                  documentOptions.canMode}
              >
                QR-code vers chaque exercice
              </span>
            </label>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.showQrCodeFiche}
                onchange={applyDocumentOptions}
              />
              <span> QR-code global </span>
            </label>

            <label
              class="flex items-center justify-between gap-4 text-sm"
              data-tour="typst-settings-typography"
            >
              Habillage en-tête
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.headerStyle}
                onchange={applyDocumentOptions}
              >
                {#each HEADER_STYLES as style}
                  <option value={style}>{HEADER_STYLE_LABELS[style]}</option>
                {/each}
              </select>
            </label>

            <p class="text-xs opacity-75">
              Le titre, le sous-titre et la ligne d'en-tête se modifient
              directement sur l'aperçu (bouton
              <i class="bx bx-edit"></i> à gauche du titre).
            </p>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.showFooter}
                onchange={applyDocumentOptions}
              />
              Afficher le pied de page
            </label>

            {#if documentOptions.showFooter}
              <p class="text-xs opacity-75">
                Le texte du pied de page se modifie directement sur l'aperçu
                (bouton <i class="bx bx-edit"></i> sur le pied de la première page).
              </p>
            {/if}

            <label class="flex items-center justify-between gap-4 text-sm">
              Police du texte
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.font}
                onchange={applyDocumentOptions}
              >
                {#each TEXT_FONTS as font}
                  <option value={font}>{font}</option>
                {/each}
              </select>
            </label>

            <label class="flex items-center justify-between gap-4 text-sm">
              Police des maths
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.mathFont}
                onchange={applyDocumentOptions}
              >
                {#each MATH_FONTS as font}
                  <option value={font}>{font}</option>
                {/each}
              </select>
            </label>

            <div class="flex items-center justify-between gap-4 text-sm">
              <label for="typst-font-size-input">Taille du texte (pt)</label>
              <input
                id="typst-font-size-input"
                type="number"
                min="7"
                max="16"
                step="0.5"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.fontSize}
                onchange={applyDocumentOptions}
              />
            </div>

            <div class="flex items-center justify-between gap-4 text-sm">
              <label for="typst-line-spacing-input">Interligne</label>
              <input
                id="typst-line-spacing-input"
                type="number"
                min="0.3"
                max="2"
                step="0.05"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.lineSpacing}
                onchange={applyDocumentOptions}
              />
            </div>

            <div class="flex items-center justify-between gap-4 text-sm">
              <label for="typst-word-spacing-input"
                >Espacement entre les mots (%)</label
              >
              <input
                id="typst-word-spacing-input"
                type="number"
                min="50"
                max="300"
                step="5"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.wordSpacing}
                onchange={applyDocumentOptions}
              />
            </div>

            <div class="flex items-center justify-between gap-4 text-sm">
              <label for="typst-exercise-spacing-input"
                >Espacement entre les exercices</label
              >
              <input
                id="typst-exercise-spacing-input"
                type="number"
                min="0"
                max="6"
                step="0.1"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.exerciseSpacing}
                onchange={applyDocumentOptions}
              />
            </div>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.autoVerticalSpacing}
                onchange={applyDocumentOptions}
              />
              Gestion automatique des espaces verticaux
            </label>

            <!-- ------------------------------------------------- styles -->
            <h4
              class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
            >
              Styles
            </h4>

            <label
              class="flex items-center justify-between gap-4 text-sm"
              title="Nombre de colonnes des listes de questions, sauf réglage propre à un exercice fait depuis la palette de mise en page de l'aperçu"
            >
              Colonnes des questions
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.questionsColumns}
                onchange={applyDocumentOptions}
              >
                <option value="auto">Auto</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </label>

            <div
              class="flex items-center justify-between gap-4 text-sm"
              title="Espacement vertical entre les questions, sauf réglage propre à un exercice fait depuis la palette de mise en page de l'aperçu"
            >
              <label for="typst-questions-gutter-input">
                Espacement entre les questions (em)
              </label>
              <input
                id="typst-questions-gutter-input"
                type="number"
                min="0"
                max="6"
                step="0.25"
                class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.questionsGutter}
                onchange={applyDocumentOptions}
              />
            </div>

            <label class="flex items-center justify-between gap-4 text-sm">
              Numérotation des questions
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.questionNumberingStyle}
                onchange={applyDocumentOptions}
              >
                {#each QUESTION_NUMBERING_STYLES as style}
                  <option value={style}>
                    {QUESTION_NUMBERING_STYLE_LABELS[style]}
                  </option>
                {/each}
              </select>
            </label>

            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                bind:checked={documentOptions.boldQuestionNumbers}
                onchange={applyDocumentOptions}
              />
              Numéros des questions en gras
            </label>

            <label
              class="flex items-center justify-between gap-4 text-sm"
              class:opacity-50={documentOptions.mergeExercises ||
                documentOptions.canMode}
            >
              Style des exercices
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.badgeStyle}
                disabled={documentOptions.mergeExercises ||
                  documentOptions.canMode}
                onchange={applyDocumentOptions}
              >
                <optgroup label="Titre pleine largeur (position figée)">
                  {#each BADGE_STYLES.filter((style) => !badgeStyleHasSideLabel(style)) as style}
                    <option value={style}>{BADGE_STYLE_LABELS[style]}</option>
                  {/each}
                </optgroup>
                <optgroup label="Badge (position réglable)">
                  {#each BADGE_STYLES.filter(badgeStyleHasSideLabel) as style}
                    <option value={style}>{BADGE_STYLE_LABELS[style]}</option>
                  {/each}
                </optgroup>
              </select>
            </label>

            <!-- réglage propre aux styles à titre latéral : les styles pleine
                 largeur n'ont pas de colonne de titre à déplacer -->
            <label
              class="flex items-center justify-between gap-4 text-sm"
              class:opacity-50={!badgeStyleHasSideLabel(
                documentOptions.badgeStyle,
              ) ||
                documentOptions.mergeExercises ||
                documentOptions.canMode}
              title={badgeStyleHasSideLabel(documentOptions.badgeStyle)
                ? '« En marge » réserve une colonne à gauche pour le titre de l’exercice ; « Au-dessus » le place seul sur une ligne d’en-tête et l’énoncé prend toute la largeur (utile en colonnes et pour les énoncés numérotés)'
                : 'Sans objet : ce style écrit déjà son titre sur toute la largeur. Choisissez un style du groupe « Badge » pour pouvoir le déplacer.'}
            >
              Position du titre
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.badgePosition}
                disabled={!badgeStyleHasSideLabel(documentOptions.badgeStyle) ||
                  documentOptions.mergeExercises ||
                  documentOptions.canMode}
                onchange={applyDocumentOptions}
              >
                {#each BADGE_POSITIONS as position}
                  <option value={position}>
                    {BADGE_POSITION_LABELS[position]}
                  </option>
                {/each}
              </select>
            </label>

            <div
              class="flex items-center justify-between gap-4 text-sm"
              class:opacity-50={documentOptions.mergeExercises}
            >
              <span>Couleur des titres</span>
              <div class="flex items-center gap-1.5">
                {#each BADGE_COLORS as color}
                  <button
                    type="button"
                    title={color.label}
                    aria-label={color.label}
                    aria-pressed={documentOptions.badgeColor === color.value}
                    disabled={documentOptions.mergeExercises}
                    class="h-6 w-6 rounded-full border-2 transition {documentOptions.badgeColor ===
                    color.value
                      ? 'border-coopmaths-action dark:border-coopmathsdark-action scale-110'
                      : 'border-transparent'}"
                    style="background-color: {color.css};"
                    onclick={() => {
                      documentOptions.badgeColor = color.value
                      applyDocumentOptions()
                    }}
                  ></button>
                {/each}
                <input
                  type="color"
                  title="Couleur personnalisée"
                  aria-label="Couleur personnalisée"
                  disabled={documentOptions.mergeExercises}
                  class="h-6 w-6 cursor-pointer rounded-full border-2 {isCustomBadgeColor
                    ? 'border-coopmaths-action dark:border-coopmathsdark-action scale-110'
                    : 'border-transparent'} bg-transparent p-0"
                  value={badgeColorHex}
                  oninput={(e) => {
                    documentOptions.badgeColor = `rgb("${e.currentTarget.value}")`
                    applyDocumentOptions()
                  }}
                />
              </div>
            </div>

            <!-- ------------------------------------------ page de garde -->
            <h4
              class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
              data-tour="typst-settings-cover"
            >
              Page de garde
            </h4>

            <label class="flex items-center justify-between gap-4 text-sm">
              Modèle
              <select
                class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                bind:value={documentOptions.coverPage.template}
                onchange={applyCoverTemplate}
              >
                {#each COVER_TEMPLATES as template}
                  <option value={template}>
                    {COVER_TEMPLATE_LABELS[template]}
                  </option>
                {/each}
              </select>
            </label>

            {#if coverPage.template !== 'aucune'}
              <p class="text-xs opacity-75">
                Les textes du modèle et les consignes se modifient directement
                sur l'aperçu (bouton
                <i class="bx bx-edit"></i> en haut de la page de garde).
              </p>

              {#if coverPage.template === 'recitation'}
                <p class="text-xs opacity-75">
                  Le bandeau tient en tête de la première page : les exercices
                  suivent aussitôt, sans page de garde séparée.
                </p>
              {/if}

              {#if coverPage.template === 'can'}
                <p class="text-xs opacity-75">
                  La durée, le nombre de questions et le score sur le total des
                  questions sont ajoutés automatiquement.
                </p>
              {:else}
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    bind:checked={documentOptions.coverPage.showBareme}
                    onchange={applyDocumentOptions}
                  />
                  {coverPage.template === 'recitation'
                    ? 'Afficher la grille des points'
                    : 'Afficher le barème'}
                </label>

                {#if coverPage.template === 'recitation'}
                  <div class="flex items-center justify-between gap-4 text-sm">
                    <span>Date</span>
                    <CoverDateField
                      value={coverPage.session}
                      inputClass="w-24 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                      onChange={applyCoverDate}
                    />
                  </div>

                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={documentOptions.coverPage.showSignature}
                      onchange={applyDocumentOptions}
                    />
                    Signature
                  </label>

                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={documentOptions.coverPage.showNote}
                      onchange={applyDocumentOptions}
                    />
                    Case pour la note
                  </label>
                {/if}

                {#if coverPage.showBareme}
                  <div class="space-y-1.5">
                    <div class="flex items-center justify-between text-sm">
                      <span>Barème</span>
                      <span class="text-xs opacity-70">
                        Total : {coverTotalPoints} pts
                      </span>
                    </div>
                    {#each coverPage.bareme as _points, index (index)}
                      <div class="flex items-center gap-2 text-sm">
                        <label class="grow" for="typst-points-{index}">
                          Exercice {index + 1}
                        </label>
                        <input
                          id="typst-points-{index}"
                          type="number"
                          step="0.5"
                          min="0"
                          class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
                          bind:value={documentOptions.coverPage.bareme[index]}
                          onchange={applyDocumentOptions}
                        />
                        <button
                          type="button"
                          aria-label="Retirer l'exercice {index + 1} du barème"
                          class="text-coopmaths-action dark:text-coopmathsdark-action"
                          onclick={() => removeCoverBaremeRow(index)}
                        >
                          <i class="bx bx-x text-lg"></i>
                        </button>
                      </div>
                    {/each}
                    <button
                      type="button"
                      class="text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action"
                      onclick={resizeCoverBareme}
                    >
                      <i class="bx bx-sync"></i>
                      Reprendre les exercices de la fiche
                    </button>
                  </div>
                {/if}
              {/if}
            {/if}

            <p class="text-xs opacity-75">
              Ces réglages régénèrent le code Typst à partir des exercices : vos
              modifications manuelles du code seront perdues.
            </p>

            <button
              type="button"
              class="flex items-center gap-1 text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
              onclick={resetDocumentOptions}
            >
              <i class="bx bx-reset"></i>
              Réinitialiser les réglages du document
            </button>
          </div>
        {/if}
        <div
          class="typst-editor-pane {isSettingsOpen
            ? 'hidden'
            : displayMode === 'code'
              ? 'w-full'
              : displayMode === 'split'
                ? 'w-1/2'
                : 'hidden'} min-h-0"
          bind:this={editorEl}
        ></div>
        <div
          class="typst-preview-pane {isSettingsOpen
            ? 'grow'
            : displayMode === 'preview'
              ? 'w-full'
              : displayMode === 'split'
                ? 'w-1/2'
                : 'hidden'} relative min-h-0 flex flex-col"
        >
          {#if !isImageCutHintDismissed && !isPreviewBusy && !isCompiling && !documentOptions.canMode && imageCutTargets.length > 0}
            <aside
              aria-label="Découper les images d’annales"
              class="relative shrink-0 border-b border-coopmaths-action/30 bg-coopmaths-action/10 py-3 pl-4 pr-12 text-sm text-coopmaths-corpus dark:border-coopmathsdark-action/30 dark:bg-coopmathsdark-action/10 dark:text-coopmathsdark-corpus"
            >
              <button
                type="button"
                class="absolute right-3 top-3 rounded p-1 hover:bg-coopmaths-action/10 dark:hover:bg-coopmathsdark-action/10"
                aria-label="Fermer le message sur la découpe des images"
                onclick={() => (isImageCutHintDismissed = true)}
              >
                <i class="bx bx-x text-xl" aria-hidden="true"></i>
              </button>
              <p class="flex items-center gap-2 font-semibold">
                <i class="bx bx-cut text-lg" aria-hidden="true"></i>
                Une image d’annale dépasse la page.
              </p>
              <p class="mt-1">
                Découper l’image entre deux questions pour répartir les
                fragments sur plusieurs pages, sans réduire la taille du texte.
              </p>
              <details class="mt-2">
                <summary class="cursor-pointer font-semibold">
                  Choisir une image à découper
                </summary>
                <div class="mt-2 flex flex-wrap gap-2">
                  {#each imageCutTargets as target (`${target.num}-${target.part}`)}
                    <button
                      type="button"
                      class="rounded border border-coopmaths-action px-3 py-1 hover:bg-coopmaths-action/10 disabled:cursor-wait disabled:opacity-50 dark:border-coopmathsdark-action dark:hover:bg-coopmathsdark-action/10"
                      disabled={isPreviewBusy}
                      onclick={() => openImageCuts(target.num, target.part)}
                    >
                      Découper {target.part === 'enonce'
                        ? 'l’énoncé'
                        : 'le corrigé'}
                      de l’exercice {target.num}
                    </button>
                  {/each}
                </div>
                <p class="mt-2 text-xs">
                  Cliquer sur l’image pour placer les coupures, puis sur «
                  Appliquer ». L’outil est aussi accessible par les ciseaux dans
                  les outils de mise en page de l’aperçu.
                </p>
              </details>
            </aside>
          {/if}
          <!-- `isolate` : les pastilles de la palette de mise en page portent
               des z-index (jusqu'à z-30) qui, sans contexte d'empilement ici,
               les placeraient au-dessus des voisins de l'aperçu (panneau de
               diagnostics, volet Réglages). Chrome les rend inoffensives en
               les rognant (overflow), mais Safari leur laisse capter le survol
               et les clics hors du cadre : le bouton « Revenir à la dernière
               version qui compilait » se retrouvait sous une pastille
               invisible. -->
          <div
            class="relative isolate grow overflow-auto p-4"
            aria-busy={isPreviewBusy}
          >
            {#if isCompilerLoading}
              <div
                class="flex flex-col items-center gap-2 py-24 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
              >
                <i class="bx bx-loader-alt bx-spin text-4xl"></i>
                <span class="text-sm">
                  {compilerFirstVisit
                    ? 'Chargement du compilateur Typst (première visite, ~30 Mo)…'
                    : 'Chargement du compilateur Typst…'}
                </span>
              </div>
            {:else if svgContent !== ''}
              {#if isCompiling && !isPreviewBusy}
                <div
                  class="absolute top-2 right-4 z-10 text-coopmaths-action dark:text-coopmathsdark-action"
                >
                  <i class="bx bx-loader-alt bx-spin text-2xl"></i>
                </div>
              {/if}
              <!-- le fond blanc des pages est dessiné dans le SVG (separatePages) -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="typst-svg-container relative mx-auto"
                title="Double-cliquez sur un exercice pour éditer son code"
                ondblclick={jumpToSourceFromClick}
                onpointermove={updateHoveredSection}
                onpointerdown={updateHoveredSection}
                onpointerleave={() => (hoveredSection = null)}
              >
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html svgContent}
                {#if showOverlay && overlayWidgets.length > 0}
                  <TypstLayoutOverlay
                    widgets={overlayWidgets}
                    activeSection={hoveredSection}
                    layoutValues={tasksLayoutValues}
                    insertions={insertionValues}
                    insertionsCorrection={insertionCorrectionValues}
                    header={headerValues}
                    cover={coverValues}
                    coverConsignes={coverConsignesValue}
                    coverTemplate={documentOptions.coverPage.template}
                    footerText={footerValue}
                    qrCodeUrls={qrCodeUrlValues}
                    ficheTitle={documentOptions.title}
                    nbVersions={Math.max(1, documentOptions.nbVersions)}
                    hideVersionLabel={documentOptions.hideVersionLabel}
                    {documentColumns}
                    {questionCounts}
                    {staticExercises}
                    {nonEditableStaticExercises}
                    {nonEditableCorrections}
                    {figureZoomValues}
                    {figureAlignValues}
                    {canAnswerWidth}
                    onAdjustCanAnswerWidth={adjustCanAnswerWidth}
                    {exerciseZoomValues}
                    {exerciseCorrectionZoomValues}
                    codeOverrides={codeOverrideValues}
                    codeOverridesCorrection={codeOverrideCorrectionValues}
                    codeOverridesCan={codeOverrideCanValues}
                    codeOverridesCanReponse={codeOverrideCanReponseValues}
                    exerciseCount={exercises.length}
                    {mergedExercises}
                    {multicolGroups}
                    onToggleMulticol={toggleMulticol}
                    mergeExercisesEnabled={!documentOptions.mergeExercises &&
                      !documentOptions.canMode}
                    canMode={documentOptions.canMode}
                    onAdjustColumns={adjustColumns}
                    onAdjustGutter={adjustGutter}
                    onAdjustFigureZoom={adjustFigureZoom}
                    onAdjustExerciseZoom={adjustExerciseZoom}
                    showExerciseTitles={documentOptions.showExerciseTitles &&
                      !documentOptions.mergeExercises &&
                      !documentOptions.canMode}
                    exerciseTitles={Object.fromEntries(
                      exercises.map((exercise, k) => [
                        k + 1,
                        exerciseTitleValues[k + 1] ??
                          defaultExerciseTitle(
                            k + 1,
                            exercise?.titre ?? '',
                            mergedExercises,
                          ),
                      ]),
                    )}
                    defaultExerciseTitles={Object.fromEntries(
                      exercises.map((exercise, k) => [
                        k + 1,
                        defaultExerciseTitle(
                          k + 1,
                          exercise?.titre ?? '',
                          mergedExercises,
                        ),
                      ]),
                    )}
                    onSetExerciseTitle={setExerciseTitle}
                    exercisePoints={exercisePointValues}
                    onSetExercisePoints={setExercisePoints}
                    onCutImage={openImageCuts}
                    onAdjustExerciseCorrectionZoom={adjustExerciseCorrectionZoom}
                    onSetFigureAlign={setFigureAlign}
                    onInsert={insertAfterExercise}
                    onInsertExercise={insertFreeExercise}
                    onUpdateInsertion={updateInsertion}
                    onDeleteInsertion={deleteInsertion}
                    onInsertCorrection={insertBeforeCorrection}
                    onUpdateInsertionCorrection={updateInsertionCorrection}
                    onDeleteInsertionCorrection={deleteInsertionCorrection}
                    onUpdateHeader={updateHeaderValue}
                    onUpdateCover={updateCoverValue}
                    onUpdateCoverConsignes={updateCoverConsignes}
                    onUpdateFooterText={updateFooterText}
                    onUpdateQrCodeUrl={updateQrCodeUrl}
                    onGetFicheLongUrl={ficheUrlForVersion}
                    onToggleVersionLabel={toggleVersionLabel}
                    onChangeQuestionCount={changeQuestionCount}
                    onDeleteExercise={deleteExercise}
                    onDuplicateExercise={duplicateExercise}
                    onAddExercise={openAddExercise}
                    onMoveExercise={moveExercise}
                    onNewData={newDataForExercise}
                    newDataSubjectLabel={documentOptions.nbVersions > 1
                      ? `Sujet ${String.fromCharCode(65 + overlaySubject)}`
                      : undefined}
                    onOpenSettings={openSettings}
                    onEditCode={openCodeEdit}
                    onEditCorrectionCode={openCorrectionCodeEdit}
                    onEditCanRow={openCanRowCodeEdit}
                    onToggleMergeBefore={toggleMergeBefore}
                    {writingLinesValues}
                    onSetWritingLines={setWritingLines}
                  />
                {/if}
              </div>
            {/if}
          </div>
          {#if isPreviewBusy && svgContent !== '' && !isCompilerLoading}
            <!-- voile pendant la compilation : capte les clics destinés à un
                 aperçu pas encore à jour (voir `isPreviewBusy`) -->
            <div
              class="typst-preview-veil absolute inset-0 z-10 flex items-center justify-center bg-coopmaths-canvas/60 dark:bg-coopmathsdark-canvas/60 cursor-wait"
              role="status"
              aria-live="polite"
            >
              <div
                class="flex flex-col items-center gap-2 rounded-lg bg-coopmaths-canvas px-6 py-4 text-coopmaths-action shadow-lg dark:bg-coopmathsdark-canvas dark:text-coopmathsdark-action"
              >
                <i class="bx bx-loader-alt bx-spin text-4xl"></i>
                <span class="text-sm">Mise à jour de l’aperçu…</span>
              </div>
            </div>
          {/if}
        </div>
      </div>

      {#if diagnostics.length > 0}
        {@const isError = errorCount > 0}
        <div
          data-testid="typst-diagnostics"
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
              <span class="font-normal opacity-80">({diagnosticsSummary})</span>
              <i
                class="bx {isDiagnosticsCollapsed
                  ? 'bx-chevron-up'
                  : 'bx-chevron-down'} text-xl"
              ></i>
            </button>

            <div class="grow"></div>

            {#if isPreviewStale}
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
                data-testid="typst-restore-last-good"
                class="flex items-center gap-1 rounded-lg border border-current px-2 py-1 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/60"
                title="Remplace le code par la dernière version qui compilait. Annulable avec Ctrl/Cmd + Z."
                onclick={restoreLastGoodCode}
              >
                <i class="bx bx-undo text-lg"></i>
                <!-- libellé dans un <span> : un nœud de texte nu dans un
                     conteneur flex forme une boîte anonyme, dont le survol et
                     le clic ne sont pas toujours rattachés au bouton -->
                <span>Revenir à la dernière version qui compilait</span>
              </button>
            {/if}
          </div>

          {#if !isDiagnosticsCollapsed}
            <ul class="max-h-52 overflow-auto px-4 pb-3 space-y-1.5">
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
                    {:else if diagnostic.packageName != null}
                      <span
                        class="shrink-0 rounded bg-black/10 px-1.5 py-0.5 font-mono text-xs dark:bg-white/15"
                      >
                        paquet {diagnostic.packageName}
                      </span>
                    {/if}
                    <span class="text-sm">{diagnostic.message}</span>
                  </div>
                  {#if diagnostic.hint != null}
                    <p class="mt-1 text-xs opacity-90">
                      <i class="bx bx-bulb"></i>
                      {diagnostic.hint}
                    </p>
                  {/if}
                  {#if diagnostic.message !== diagnostic.original}
                    <details class="mt-1 text-xs opacity-70">
                      <summary class="cursor-pointer">Message d’origine</summary
                      >
                      <code class="font-mono break-all">{diagnostic.raw}</code>
                    </details>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if isBugReportDisplayed}
    <BugReportModal
      bind:isDisplayed={isBugReportDisplayed}
      titleOverride="Bug dans la création du PDF (Typst)"
    />
  {/if}

  {#if $typstShortcutsOpen}
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) $typstShortcutsOpen = false
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
            onclick={() => ($typstShortcutsOpen = false)}
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
        <p class="mt-4 text-xs opacity-75">
          L’éditeur reconnaît aussi les raccourcis habituels de déplacement et
          de sélection. Cliquez sur « ligne N » dans le panneau d’erreurs pour
          sauter directement à la ligne concernée.
        </p>
      </div>
    </div>
  {/if}

  {#if isAddExerciseOpen}
    <TypstAddExerciseModal
      onAdd={addExerciseToSheet}
      onClose={() => (isAddExerciseOpen = false)}
    />
  {/if}

  {#if settingsExerciseIndex !== null && settingsExercise != null}
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) settingsExerciseIndex = null
      }}
    >
      <div
        class="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-lg shadow-xl bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
      >
        {#key settingsExerciseIndex}
          <Settings
            exercice={settingsExercise}
            exerciceIndex={settingsExerciseIndex}
            inModal={true}
            typstStyle={settingsTypstStyle}
            on:settings={(event) => {
              if (settingsExerciseIndex !== null) {
                applyNewSettings(settingsExerciseIndex, event.detail)
              }
            }}
            on:clickSettings={() => (settingsExerciseIndex = null)}
          />
          <label
            class="flex items-center gap-2 p-4 text-sm md:text-normal font-light text-coopmaths-struct dark:text-coopmathsdark-struct cursor-pointer"
            title="Afficher la correction sous l'énoncé, même en version élève. En cas de fusion, ce réglage s'applique à tout le groupe."
          >
            <input
              type="checkbox"
              checked={workedExamples.includes(settingsExerciseIndex + 1)}
              disabled={documentOptions.mergeExercises ||
                documentOptions.canMode}
              onchange={(event) => {
                if (settingsExerciseIndex !== null)
                  setWorkedExample(
                    settingsExerciseIndex + 1,
                    event.currentTarget.checked,
                  )
              }}
            />
            Exemple corrigé (correction sous l'énoncé)
          </label>
        {/key}
      </div>
    </div>
  {/if}

  {#if imageCutEditor !== null}
    <TypstImageCutModal
      urls={imageCutEditor.urls}
      initialCuts={imageCutEditor.cuts}
      title={`${imageCutEditor.part === 'correction' ? 'Correction de l’exercice' : 'Exercice'} ${imageCutEditor.num}`}
      onApply={updateImageCuts}
      onClose={() => {
        imageCutEditor = null
      }}
    />
  {/if}

  {#if codeEditNum !== null}
    {@const num = codeEditNum}
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) codeEditNum = null
      }}
    >
      <div
        class="relative flex w-full max-w-2xl flex-col gap-3 rounded-lg bg-coopmaths-canvas-dark p-4 shadow-xl dark:bg-coopmathsdark-canvas-dark"
      >
        <h2 class="text-base font-semibold">
          {codeEditPart === 'correction'
            ? `Code Typst de la correction de l'exercice ${num}`
            : `Code Typst de l'exercice ${num}`}
        </h2>
        <p class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">
          {#if codeEditPart === 'correction'}
            Modifiez le code ci-dessous : il remplacera la correction générée de
            cet exercice. Videz le champ pour revenir à la correction générée
            automatiquement.
          {:else}
            Modifiez le code ci-dessous : il remplacera l'énoncé généré de cet
            exercice (QR-code et numérotation continue des questions désactivés
            pour lui). Videz le champ pour revenir à l'énoncé généré
            automatiquement.
          {/if}
        </p>
        <textarea
          class="h-64 w-full rounded border border-gray-300 bg-coopmaths-canvas p-2 font-mono text-xs text-coopmaths-corpus dark:border-coopmathsdark-corpus-lightest dark:bg-coopmathsdark-canvas dark:text-coopmathsdark-corpus"
          bind:value={codeEditDraft}
          onkeydown={(e) => {
            if (e.key === 'Escape') codeEditNum = null
          }}
        ></textarea>
        {#if documentOptions.nbVersions > 1}
          <label
            class="flex items-start gap-2 text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            <input
              type="checkbox"
              class="mt-0.5"
              bind:checked={codeEditApplyToAll}
            />
            <span>
              Reporter la modification sur les autres sujets. Seuls les passages
              modifiés sont reportés : chaque sujet garde ses propres nombres.
            </span>
          </label>
        {/if}
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded border border-coopmaths-action px-3 py-1 text-coopmaths-action hover:bg-coopmaths-action hover:text-white"
            onclick={copyExerciseCode}
          >
            Copier le code
          </button>
          <button
            type="button"
            class="rounded border border-coopmaths-action px-3 py-1 text-coopmaths-action hover:bg-coopmaths-action hover:text-white"
            onclick={() => copyExerciseCodeWithPreamble(num)}
          >
            Copier avec le préambule
          </button>
          {#if codeCopyStatus !== ''}
            <span
              class="text-xs text-coopmaths-corpus dark:text-coopmathsdark-corpus"
              >{codeCopyStatus}</span
            >
          {/if}
        </div>
        <div class="flex justify-between gap-2">
          {#if exercises[num - 1]?.uuid !== FREE_EXERCISE_UUID}
            <button
              type="button"
              class="px-3 py-1 hover:text-coopmaths-action"
              onclick={() => restoreGeneratedCode(num)}
            >
              Restaurer le code d'origine
            </button>
          {:else}
            <span></span>
          {/if}
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3 py-1 hover:text-coopmaths-action"
              onclick={() => (codeEditNum = null)}
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded bg-coopmaths-action px-3 py-1 text-white"
              onclick={() =>
                updateExerciseCode(num, codeEditDraft, codeEditPart)}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if canRowEditNum !== null}
    {@const row = canRowEditNum}
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onclick={(e) => {
        if (e.target === e.currentTarget) canRowEditNum = null
      }}
    >
      <div
        class="relative flex w-full max-w-2xl flex-col gap-3 rounded-lg bg-coopmaths-canvas-dark p-4 shadow-xl dark:bg-coopmathsdark-canvas-dark"
      >
        <h2 class="text-base font-semibold">
          Code Typst de la ligne {row} du tableau
        </h2>
        <p class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus">
          {#if canRowEditSharesEnonce}
            Cette question partage l'énoncé de la précédente : seule sa réponse
            lui appartient. Videz le champ pour revenir à son contenu généré
            automatiquement.
          {:else}
            Modifiez le code ci-dessous : il remplacera l'énoncé et la réponse
            générés de cette ligne. Videz un champ pour revenir à son contenu
            généré automatiquement.
          {/if}
        </p>
        {#if !canRowEditSharesEnonce}
          <label class="flex flex-col gap-1 text-sm">
            Énoncé
            <textarea
              class="h-32 w-full rounded border border-gray-300 bg-coopmaths-canvas p-2 font-mono text-xs text-coopmaths-corpus dark:border-coopmathsdark-corpus-lightest dark:bg-coopmathsdark-canvas dark:text-coopmathsdark-corpus"
              bind:value={canRowEditEnonceDraft}
              onkeydown={(e) => {
                if (e.key === 'Escape') canRowEditNum = null
              }}
            ></textarea>
          </label>
        {/if}
        <label class="flex flex-col gap-1 text-sm">
          Réponse
          <textarea
            class="h-24 w-full rounded border border-gray-300 bg-coopmaths-canvas p-2 font-mono text-xs text-coopmaths-corpus dark:border-coopmathsdark-corpus-lightest dark:bg-coopmathsdark-canvas dark:text-coopmathsdark-corpus"
            bind:value={canRowEditReponseDraft}
            onkeydown={(e) => {
              if (e.key === 'Escape') canRowEditNum = null
            }}
          ></textarea>
        </label>
        <div class="flex justify-between gap-2">
          <button
            type="button"
            class="px-3 py-1 hover:text-coopmaths-action"
            onclick={() => restoreCanRowCode(row)}
          >
            Restaurer le contenu d'origine
          </button>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3 py-1 hover:text-coopmaths-action"
              onclick={() => (canRowEditNum = null)}
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded bg-coopmaths-action px-3 py-1 text-white"
              onclick={() =>
                updateCanRowCode(
                  row,
                  canRowEditEnonceDraft,
                  canRowEditReponseDraft,
                )}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  .typst-preview-veil {
    animation: typst-preview-veil-in 100ms ease-out both;
  }
  @keyframes typst-preview-veil-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .typst-svg-container {
    max-width: 900px;
  }
  .typst-svg-container :global(svg) {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
