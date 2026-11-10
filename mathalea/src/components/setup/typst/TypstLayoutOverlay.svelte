<script lang="ts" module>
  import type { SectionKey } from './overlaySections'

  /** Contrôle flottant, positionné en % du conteneur de l'aperçu */
  export interface OverlayWidget {
    /**
     * `tasks` : liste de questions réglable ; `exo` : début d'un exercice ;
     * `version-exo` : exercice d'un sujet B, C... (régénération seule) ;
     * `corr` : début de la correction d'un exercice ;
     * `gap` : espace après un exercice ; `header` : bloc de titre de la fiche ;
     * `cover` : textes de la page de garde ; `footer` : texte du pied de page ;
     * `qr-code` : URL du QR-code global
     * (première page seulement) ; `version-label` : étiquette « Sujet A/B... »
     * de l'en-tête (fiche à plusieurs versions) ; `figure` : figure
     * mathalea2d embarquée (zoom) ; `can-row` : ligne du tableau « Course aux
     * nombres » (édition de son énoncé/réponse) ; `can-table` : tableau
     * entier (largeur de la colonne « Réponse »)
     */
    kind:
      | 'tasks'
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
      | 'can-table'
    /** Numéro de l'exercice concerné (0 = avant le premier exercice), ou de la figure */
    num: number
    /** Préfixe des variables visées par un contrôle `tasks` (`ex1`, `ex1-corr`) */
    target?: string
    left: number
    top: number
    /** Marge de page où placer les contrôles des questions */
    side?: 'left' | 'right'
    /**
     * Sections (énoncé/correction d'un exercice) auxquelles le contrôle se
     * rattache : il n'est affiché que lorsque l'une d'elles est survolée
     * (`activeSection`). Absent : contrôle commun à la fiche, toujours affiché.
     */
    sections?: SectionKey[]
  }

  /** Mise en page courante des questions d'un exercice (lue dans le code) */
  export interface TasksLayoutValue {
    columns: number | string
    /** Expression Typst (`1em`, `interligne-questions`…) */
    gutter: string
    /**
     * Littéral Typst de l'étiquette de numérotation (`"1)"`, `none`…), ou la
     * référence à la variable partagée du document (`numerotation-questions`)
     * quand l'exercice n'a pas son propre réglage — voir `parseNumberingLiteral`
     * pour la convertir en style connu (modale de réglages de l'exercice).
     */
    numbering?: string
  }
</script>

<script lang="ts">
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
    COLUMN_BREAK_SNIPPET,
    PAGE_BREAK_SNIPPET,
    WRITING_LINES_POSITIONS,
    WRITING_LINES_STYLES,
    type CoverTemplate,
    type WritingLinesPosition,
    type WritingLinesSetting,
    type WritingLinesStyle,
  } from './buildTypstDocument'
  import CoverDateField from './CoverDateField.svelte'

  interface Props {
    /**
     * Palette de mise en page de l'aperçu Typst : contrôles dessinés par-dessus
     * le SVG aux positions publiées par les repères `mathalea-anchor` du code.
     * - dans la marge, à hauteur de chaque liste de questions : colonnes et
     *   espacement vertical ;
     * - après chaque exercice (et avant le premier) : insertion, modification
     *   et suppression d'un texte ou d'un titre de section.
     */
    widgets?: OverlayWidget[]
    /** Mise en page des questions par préfixe de variables (`ex1`, `ex1-corr`) */
    layoutValues?: Record<string, TasksLayoutValue>
    /** Insertions présentes dans le code, par repère de gap (code Typst brut) */
    insertions?: Record<number, string[]>
    /** Insertions présentes juste avant chaque correction, par numéro d'exercice */
    insertionsCorrection?: Record<number, string[]>
    /** Variables d'en-tête de la fiche (valeurs lues dans le code) */
    header?: { titre: string; 'sous-titre': string; entete: string }
    /** Variables texte de la page de garde (valeurs lues dans le code) */
    cover?: {
      titre: string
      session: string
      matiere: string
      etablissement: string
      duree: string
      signatureLabel: string
      noteFin: string
    }
    /** Consignes de la page de garde (valeurs lues dans le code) */
    coverConsignes?: string[]
    /**
     * Modèle de page de garde actif : masque les champs Session/Matière
     * (sans objet pour la « Course aux nombres ») et la mention de fin de
     * page (sans objet pour l'« Évaluation », voir `COVER_TEMPLATE_LAYOUT`).
     */
    coverTemplate?: CoverTemplate
    /** Texte du pied de page (valeur lue dans le code), première page seulement */
    footerText?: string
    /** URL des QR-codes globaux, par sujet, lues dans le code Typst */
    qrCodeUrls?: Record<number, string>
    /**
     * Titre courant de la fiche (`documentOptions.title`), utilisé pour
     * composer le titre du raccourci edurl.fr (voir `onGetFicheLongUrl`).
     */
    ficheTitle?: string
    /**
     * Nombre de sujets (Sujet A, B, C...) de la fiche : au-delà de 1, un
     * raccourcissement edurl.fr lancé depuis un sujet raccourcit aussi
     * automatiquement l'URL propre à chacun des autres (voir `shortenViaEdurl`).
     */
    nbVersions?: number
    /**
     * Étiquette « Sujet A/B... » masquée : reste dans le document (`hide()`,
     * voir `headerBlock`), pour que les élèves n'y lisent pas leur version.
     */
    hideVersionLabel?: boolean
    onAdjustColumns: (target: string, delta: number) => void
    onAdjustGutter: (target: string, delta: number) => void
    /** Insère un fragment de code Typst juste après l'exercice `num` */
    onInsert: (num: number, snippet: string) => void
    /**
     * Insère un nouvel exercice numéroté juste après l'exercice `num` (0 :
     * avant le premier), avec `texte` comme énoncé. Choix « Exercice » du
     * panneau d'insertion, espace `exo` seulement (pas de sens avant une
     * correction).
     */
    onInsertExercise: (num: number, texte: string) => void
    onUpdateInsertion: (num: number, index: number, snippet: string) => void
    onDeleteInsertion: (num: number, index: number) => void
    /** Insère un fragment de code Typst juste avant la correction de l'exercice `num` */
    onInsertCorrection: (num: number, snippet: string) => void
    onUpdateInsertionCorrection: (
      num: number,
      index: number,
      snippet: string,
    ) => void
    onDeleteInsertionCorrection: (num: number, index: number) => void
    onUpdateHeader: (
      name: 'titre' | 'sous-titre' | 'entete',
      value: string,
    ) => void
    onUpdateCover: (
      name:
        | 'titre'
        | 'session'
        | 'matiere'
        | 'etablissement'
        | 'duree'
        | 'signatureLabel'
        | 'noteFin',
      value: string,
    ) => void
    onUpdateCoverConsignes: (consignes: string[]) => void
    onUpdateFooterText: (value: string) => void
    onUpdateQrCodeUrl: (version: number, value: string) => void
    /**
     * URL longue de la fiche pour le sujet indiqué, recalculée à la volée
     * (indépendamment de ce que porte déjà le QR-code dans le code Typst,
     * qui peut avoir été raccourcie ou personnalisée) : c'est elle qu'on
     * raccourcit via edurl.fr. `undefined` si aucun exercice imprimable.
     */
    onGetFicheLongUrl: (version: number) => string | undefined
    /** Affiche ou masque l'étiquette « Sujet A/B... » de l'en-tête */
    onToggleVersionLabel: () => void
    /** Nombre de questions par exercice (null : non réglable) */
    questionCounts?: Record<number, number | null>
    /**
     * Exercices statiques (annale scannée, éventuellement convertie en `.typ`),
     * par numéro : contenu figé, sans génération possible de nouvelles données
     * ni de questions supplémentaires, ni de réglages (nbQuestions, durée...)
     * — masque les boutons « Nouvelles données » et « Réglages de l'exercice ».
     */
    staticExercises?: Record<number, boolean>
    /**
     * Exercices statiques sans fichier source Typst (`typ: true` absent du
     * référentiel) : leur énoncé n'est qu'une image scannée, rien à éditer
     * — masque le bouton « Éditer le code Typst de cet exercice ».
     */
    nonEditableStaticExercises?: Record<number, boolean>
    /**
     * Exercices statiques dont la correction n'a pas de fichier source
     * `_cor.typ` : leur correction n'est qu'une image scannée, rien à
     * éditer — masque le bouton d'édition sur le repère `tasks-corr`.
     */
    nonEditableCorrections?: Record<number, boolean>
    /** Nombre de colonnes du document (le saut de colonne n'a de sens qu'à > 1) */
    documentColumns?: number
    /** Zoom de chaque figure, par numéro de figure (`fig-N`) */
    figureZoomValues?: Record<number, number>
    /** Alignement de chaque figure, par numéro de figure (`fig-N`) */
    figureAlignValues?: Record<number, 'left' | 'center' | 'right'>
    /** Largeur de la colonne « Réponse » du tableau « Course aux nombres » (% du tableau) */
    canAnswerWidth?: number
    onAdjustCanAnswerWidth?: (delta: number) => void
    /**
     * Zoom de chaque exercice statique sans source .typ (image scannée
     * seule), par numéro d'exercice (`exo-N`)
     */
    exerciseZoomValues?: Record<number, number>
    /**
     * Zoom de chaque correction statique sans source _cor.typ (image
     * scannée seule), par numéro d'exercice (`exo-N-corr`)
     */
    exerciseCorrectionZoomValues?: Record<number, number>
    /** Nombre total d'exercices (borne les boutons monter/descendre) */
    exerciseCount?: number
    /**
     * Numéros (1-based) des exercices fusionnés avec le précédent : ils
     * partagent le titre de leur prédécesseur et la numérotation de leurs
     * questions continue la sienne.
     */
    mergedExercises?: number[]
    /** Fusion locale désactivée quand tous les exercices sont déjà fusionnés */
    mergeExercisesEnabled?: boolean

    /**
     * Numéros (1-based) des exercices groupés en colonnes avec le suivant
     * (grid manuelle), lus dans le code courant.
     */
    multicolGroups?: number[]
    /** Groupe/dégroupe en colonnes l'exercice num avec celui qui le suit */
    onToggleMulticol: (num: number) => void
    /**
     * Mode « Course aux nombres » : le document est un seul tableau, sans
     * titres d'exercice ni listes de questions. Masque les contrôles qui n'y
     * ont pas de prise (insertion entre deux lignes du tableau, édition du
     * code d'un exercice, lignes pour écrire).
     */
    canMode?: boolean
    /**
     * Section survolée dans l'aperçu (voir `locateSectionAnchor`) : seuls
     * ses contrôles sont affichés, en plus de ceux communs à la fiche.
     */
    activeSection?: SectionKey | null
    onChangeQuestionCount: (num: number, delta: number) => void
    onDeleteExercise: (num: number) => void
    /** Duplique l'exercice : la copie se place juste après lui */
    onDuplicateExercise: (num: number) => void
    /** Ouvre la modale d'ajout d'un exercice à la fin de la fiche */
    onAddExercise: () => void
    onToggleMergeBefore: (num: number) => void
    onAdjustFigureZoom: (num: number, delta: number) => void
    onCutImage: (num: number, part: 'enonce' | 'correction') => void
    onAdjustExerciseZoom: (num: number, delta: number) => void
    onAdjustExerciseCorrectionZoom: (num: number, delta: number) => void
    onSetFigureAlign: (num: number, align: 'left' | 'center' | 'right') => void
    onMoveExercise: (num: number, delta: -1 | 1) => void
    onNewData: (num: number) => void
    /** Sujet rebrassé par les pastilles « Nouvelles données » (« Sujet B »...), absent sur une fiche à un seul sujet */
    newDataSubjectLabel?: string
    onOpenSettings: (num: number) => void
    /** Surcharges de code Typst existantes, par numéro d'exercice (voir onEditCode) */
    codeOverrides?: Record<number, string>
    onEditCode: (num: number) => void
    /** Surcharges de code Typst de la correction, par numéro d'exercice (voir onEditCorrectionCode) */
    codeOverridesCorrection?: Record<number, string>
    onEditCorrectionCode: (num: number) => void
    /**
     * Surcharges de code Typst d'une ligne du tableau « Course aux nombres »
     * (énoncé et réponse), par numéro de ligne (voir onEditCanRow). Une
     * ligne est surchargée dès que l'une de ses deux moitiés l'est.
     */
    codeOverridesCan?: Record<number, string>
    codeOverridesCanReponse?: Record<number, string>
    onEditCanRow: (row: number) => void
    /** Lignes en pointillés réglées par exercice (valeurs lues dans le code) */
    writingLinesValues?: Record<number, WritingLinesSetting>
    /** Règle (`value`) ou retire (`null`) les lignes en pointillés de l'exercice num */
    onSetWritingLines: (num: number, value: WritingLinesSetting | null) => void
    /** Les titres d'exercice sont affichés (réglage « Afficher le titre des exercices ») */
    showExerciseTitles?: boolean
    /** Titre affiché de chaque exercice (modifié dans la palette, sinon titre MathALÉA) */
    exerciseTitles?: Record<number, string>
    /** Titre MathALÉA de chaque exercice, proposé pour revenir au titre d'origine */
    defaultExerciseTitles?: Record<number, string>
    /** Modifie (`value`, vide pour aucun titre) ou rétablit (`null`) le titre de l'exercice num */
    onSetExerciseTitle?: (num: number, value: string | null) => void
    /** Points de chaque exercice, quand la fiche les affiche (vide sinon) */
    exercisePoints?: Record<number, number>
    /** Modifie les points de l'exercice num */
    onSetExercisePoints?: (num: number, value: number) => void
  }

  let {
    widgets = [],
    layoutValues = {},
    insertions = {},
    insertionsCorrection = {},
    header = { titre: '', 'sous-titre': '', entete: '' },
    cover = {
      titre: '',
      session: '',
      matiere: '',
      etablissement: '',
      duree: '',
      signatureLabel: '',
      noteFin: '',
    },
    coverConsignes = [],
    coverTemplate = 'aucune',
    footerText = '',
    qrCodeUrls = {},
    ficheTitle = '',
    nbVersions = 1,
    hideVersionLabel = false,
    onAdjustColumns,
    onAdjustGutter,
    onInsert,
    onInsertExercise,
    onUpdateInsertion,
    onDeleteInsertion,
    onInsertCorrection,
    onUpdateInsertionCorrection,
    onDeleteInsertionCorrection,
    onUpdateHeader,
    onUpdateCover,
    onUpdateCoverConsignes,
    onUpdateFooterText,
    onUpdateQrCodeUrl,
    onGetFicheLongUrl,
    onToggleVersionLabel,
    questionCounts = {},
    staticExercises = {},
    nonEditableStaticExercises = {},
    nonEditableCorrections = {},
    documentColumns = 1,
    figureZoomValues = {},
    figureAlignValues = {},
    canAnswerWidth = 28,
    onAdjustCanAnswerWidth = () => {},
    exerciseZoomValues = {},
    exerciseCorrectionZoomValues = {},
    exerciseCount = 0,
    mergedExercises = [],
    mergeExercisesEnabled = true,
    multicolGroups = [],
    onToggleMulticol,
    canMode = false,
    activeSection = null,
    onChangeQuestionCount,
    onDeleteExercise,
    onDuplicateExercise,
    onAddExercise,
    onToggleMergeBefore,
    onAdjustFigureZoom,
    onCutImage,
    onAdjustExerciseZoom,
    onAdjustExerciseCorrectionZoom,
    onSetFigureAlign,
    onMoveExercise,
    onNewData,
    newDataSubjectLabel,
    onOpenSettings,
    codeOverrides = {},
    onEditCode,
    codeOverridesCorrection = {},
    onEditCorrectionCode,
    codeOverridesCan = {},
    codeOverridesCanReponse = {},
    onEditCanRow,
    writingLinesValues = {},
    onSetWritingLines,
    showExerciseTitles = false,
    exerciseTitles = {},
    defaultExerciseTitles = {},
    onSetExerciseTitle,
    exercisePoints = {},
    onSetExercisePoints,
  }: Props = $props()

  /** Espace des insertions : `exo` (entre les exercices) ou `corr` (avant une correction) */
  type InsertionSpace = 'exo' | 'corr'

  /** Repère (espace + numéro) dont le panneau d'insertion est ouvert */
  let openInsertion: { space: InsertionSpace; num: number } | null =
    $state(null)
  let insertionKind: 'section' | 'texte' | 'exercice' = $state('section')
  let insertionText = $state('')

  /** Liste des insertions existantes au repère `num` de l'espace `space` */
  function insertionsAt(space: InsertionSpace, num: number): string[] {
    return (space === 'corr' ? insertionsCorrection : insertions)[num] ?? []
  }

  /** Panneau d'édition du titre/en-tête ouvert */
  let headerOpen = $state(false)
  let headerDraft = $state({ titre: '', 'sous-titre': '', entete: '' })
  const HEADER_FIELDS = [
    { name: 'titre', label: 'Titre' },
    { name: 'sous-titre', label: 'Sous-titre (niveau, classe…)' },
    { name: 'entete', label: "Ligne d'en-tête" },
  ] as const

  function toggleHeader() {
    headerOpen = !headerOpen
    if (headerOpen) headerDraft = { ...header }
  }

  function submitHeader() {
    for (const field of HEADER_FIELDS) {
      if (headerDraft[field.name] !== header[field.name]) {
        onUpdateHeader(field.name, headerDraft[field.name])
      }
    }
    headerOpen = false
  }

  /** Panneau d'édition des textes de la page de garde ouvert */
  let coverOpen = $state(false)
  let coverDraft = $state({
    titre: '',
    session: '',
    matiere: '',
    etablissement: '',
    duree: '',
    signatureLabel: '',
    noteFin: '',
    consignes: '',
  })
  const COVER_FIELDS = [
    { name: 'titre', label: 'Intitulé' },
    { name: 'session', label: 'Session' },
    { name: 'matiere', label: 'Matière' },
    { name: 'etablissement', label: 'Établissement' },
    { name: 'duree', label: "Durée de l'épreuve" },
    { name: 'signatureLabel', label: 'Signature' },
    { name: 'noteFin', label: 'Mention en bas de page' },
  ] as const
  /**
   * Session/Matière n'existent pas sur la page de garde « Course aux
   * nombres » ; la mention de bas de page n'existe ni là ni sur
   * l'« Évaluation » (voir `COVER_TEMPLATE_LAYOUT` de `buildTypstDocument.ts`).
   * L'établissement n'existe que sur le bandeau « Récitation », où la session
   * tient la date (voir `MATHALEA_COVER_RECITATION_HELPER`).
   */
  const visibleCoverFields = $derived(
    COVER_FIELDS.filter((field) => {
      if (field.name === 'etablissement') return coverTemplate === 'recitation'
      if (field.name === 'signatureLabel') return coverTemplate === 'recitation'
      if (coverTemplate === 'can') {
        return (
          field.name !== 'session' &&
          field.name !== 'matiere' &&
          field.name !== 'noteFin'
        )
      }
      if (coverTemplate === 'evaluation') return field.name !== 'noteFin'
      if (coverTemplate === 'recitation') return field.name !== 'noteFin'
      return true
    }),
  )

  /** Libellé d'un champ, adapté au modèle (la session date la récitation) */
  function coverFieldLabel(name: string, label: string): string {
    return name === 'session' && coverTemplate === 'recitation' ? 'Date' : label
  }

  /**
   * La session tient la date de l'épreuve sur le bandeau « Récitation » :
   * elle s'y règle au sélecteur de date, pas en saisie libre.
   */
  function isCoverDateField(name: string): boolean {
    return name === 'session' && coverTemplate === 'recitation'
  }

  function toggleCover() {
    coverOpen = !coverOpen
    if (coverOpen) {
      coverDraft = { ...cover, consignes: coverConsignes.join('\n') }
    }
  }

  function submitCover() {
    for (const field of visibleCoverFields) {
      if (coverDraft[field.name] !== cover[field.name]) {
        onUpdateCover(field.name, coverDraft[field.name])
      }
    }
    const consignes = coverDraft.consignes
      .split('\n')
      .map((ligne) => ligne.trim())
      .filter((ligne) => ligne !== '')
    const consignesChanged =
      consignes.length !== coverConsignes.length ||
      consignes.some((ligne, i) => ligne !== coverConsignes[i])
    if (consignesChanged) onUpdateCoverConsignes(consignes)
    coverOpen = false
  }

  /** Panneau d'édition du texte du pied de page ouvert */
  let footerOpen = $state(false)
  let footerDraft = $state('')

  function toggleFooter() {
    footerOpen = !footerOpen
    if (footerOpen) footerDraft = footerText
  }

  function submitFooter() {
    if (footerDraft !== footerText) onUpdateFooterText(footerDraft)
    footerOpen = false
  }

  /** Panneau d'édition de l'URL du QR-code global */
  let qrCodeOpen = $state(false)
  let qrCodeDraft = $state('')
  let qrCodeVersion = $state(0)

  function toggleQrCode(version: number) {
    qrCodeOpen = !qrCodeOpen
    if (qrCodeOpen) {
      qrCodeVersion = version
      qrCodeDraft = qrCodeUrls[version] ?? ''
      edurlAskToken = false
      edurlError = ''
      edurlTokenSaved = getEdurlToken() != null
    }
  }

  function submitQrCode() {
    if (qrCodeDraft !== (qrCodeUrls[qrCodeVersion] ?? ''))
      onUpdateQrCodeUrl(qrCodeVersion, qrCodeDraft)
    qrCodeOpen = false
  }

  /**
   * Raccourcissement de l'URL du QR-code global via edurl.fr (`lib/edurl`,
   * jeton partagé avec le reste de MathALÉA et réglé aussi dans « Mes
   * sauvegardes »).
   *
   * L'URL raccourcie est toujours celle recalculée à la volée par
   * `onGetFicheLongUrl` — jamais le contenu actuel de `qrCodeDraft`, qui peut
   * déjà être une URL courte ou collée à la main : on ne raccourcit jamais un
   * raccourci, et un collage manuel reste un choix delibéré de l'utilisateur
   * qu'un clic sur « Raccourcir » n'écrase pas silencieusement.
   */
  let edurlAskToken = $state(false)
  let edurlTokenInput = $state('')
  let edurlTokenSaved = $state(false)
  let edurlBusy = $state(false)
  let edurlError = $state('')

  /** Lance (ou relance après saisie du jeton) le raccourcissement edurl.fr */
  async function shortenViaEdurl() {
    edurlError = ''
    const longUrl = onGetFicheLongUrl(qrCodeVersion)
    if (longUrl == null) {
      edurlError =
        'Aucun exercice imprimable : pas d’URL de fiche à raccourcir.'
      return
    }
    const token = getEdurlToken()
    if (token == null) {
      edurlAskToken = true
      return
    }
    edurlBusy = true
    try {
      qrCodeDraft = await shortenUrl(longUrl, edurlLinkTitle(ficheTitle), token)
      // Fiche à plusieurs sujets : chacun pointe vers son propre contenu
      // (URL longue distincte), donc chacun reçoit son propre raccourci
      // edurl.fr — pas une copie de celui du sujet en cours. Les sujets qui
      // échouent (jeton déjà validé ici, mais une erreur amont éphémère
      // reste possible) gardent leur URL courante plutôt que de bloquer les
      // suivants ; `edurlError` rapporte alors la liste des sujets en échec.
      const failedVersions: string[] = []
      for (let version = 0; version < nbVersions; version += 1) {
        if (version === qrCodeVersion) continue
        const otherLongUrl = onGetFicheLongUrl(version)
        if (otherLongUrl == null) continue
        try {
          const shortUrl = await shortenUrl(
            otherLongUrl,
            edurlLinkTitle(ficheTitle),
            token,
          )
          onUpdateQrCodeUrl(version, shortUrl)
        } catch {
          failedVersions.push(String.fromCharCode(65 + version))
        }
      }
      if (failedVersions.length > 0) {
        edurlError = `Raccourcissement échoué pour le(s) sujet(s) ${failedVersions.join(', ')} : URL conservée telle quelle pour ce(s) sujet(s).`
      }
    } catch (err) {
      if (isTokenInvalid(err)) {
        clearEdurlToken()
        edurlTokenSaved = false
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
    edurlTokenSaved = true
    edurlAskToken = false
    shortenViaEdurl()
  }

  function forgetEdurlToken() {
    clearEdurlToken()
    edurlTokenSaved = false
    edurlAskToken = false
  }

  /** Brouillons d'édition des insertions existantes du panneau ouvert */
  interface InsertionDraft {
    kind: 'section' | 'texte'
    text: string
    /** Position dans la liste complète des insertions du repère */
    index: number
  }
  let drafts: InsertionDraft[] = $state([])

  function parseSnippet(snippet: string, index: number): InsertionDraft {
    const section = snippet.match(/^#section\[(.*)\]$/)
    return section != null
      ? { kind: 'section', text: section[1], index }
      : { kind: 'texte', text: snippet, index }
  }

  function composeSnippet(draft: InsertionDraft): string {
    return draft.kind === 'section'
      ? `#section[${draft.text.trim()}]`
      : draft.text.trim()
  }

  // resynchronise les brouillons quand le code change (après enregistrement
  // ou suppression) ; la frappe dans un brouillon ne repasse pas ici.
  // Les sauts de page/colonne sont pilotés par leurs boutons dédiés (dans
  // les deux espaces), donc exclus du panneau de texte/section.
  $effect(() => {
    if (openInsertion != null) {
      drafts = insertionsAt(openInsertion.space, openInsertion.num)
        .map(parseSnippet)
        .filter(
          (draft) =>
            draft.text !== PAGE_BREAK_SNIPPET &&
            draft.text !== COLUMN_BREAK_SNIPPET,
        )
    }
  })

  /**
   * Ajoute ou retire un saut de page/colonne au repère `num` de l'espace
   * `space` (`exo` : après un exercice ; `corr` : avant une correction).
   */
  function toggleBreak(space: InsertionSpace, num: number, snippet: string) {
    const index = insertionsAt(space, num).indexOf(snippet)
    if (space === 'corr') {
      if (index >= 0) onDeleteInsertionCorrection(num, index)
      else onInsertCorrection(num, snippet)
    } else {
      if (index >= 0) onDeleteInsertion(num, index)
      else onInsert(num, snippet)
    }
  }

  function toggleInsertion(space: InsertionSpace, num: number) {
    openInsertion =
      openInsertion?.space === space && openInsertion.num === num
        ? null
        : { space, num }
    insertionText = ''
    // « Exercice » n'a pas de sens avant une correction (voir onInsertExercise)
    if (space === 'corr' && insertionKind === 'exercice') {
      insertionKind = 'section'
    }
    openWritingLines = null
    openPoints = null
  }

  function submitInsertion() {
    if (openInsertion == null) return
    const text = insertionText.trim()
    if (text.length === 0) return
    if (insertionKind === 'exercice' && openInsertion.space === 'exo') {
      onInsertExercise(openInsertion.num, text)
      insertionText = ''
      openInsertion = null
      return
    }
    const snippet = insertionKind === 'section' ? `#section[${text}]` : text
    if (openInsertion.space === 'corr') {
      onInsertCorrection(openInsertion.num, snippet)
    } else {
      onInsert(openInsertion.num, snippet)
    }
    insertionText = ''
  }

  /** Libellés des emplacements des lignes en pointillés */
  const WRITING_LINES_POSITION_LABELS: Record<WritingLinesPosition, string> = {
    endOfExercise: "Fin d'exercice",
    afterEachQuestion: 'Après chaque question',
  }

  /** Libellés des rendus proposés pour les lignes */
  const WRITING_LINES_STYLE_LABELS: Record<WritingLinesStyle, string> = {
    pointilles: 'Pointillés',
    points: 'Points',
    plein: 'Trait',
    vide: 'Vide',
  }

  /**
   * Réglage par défaut à l'ouverture du panneau d'un exercice sans lignes :
   * 0 ligne, pour qu'aucune n'apparaisse tant que le professeur n'a pas
   * incrémenté le compteur lui-même.
   */
  const WRITING_LINES_DEFAULT: WritingLinesSetting = {
    position: 'endOfExercise',
    count: 0,
    spacing: 2,
    style: 'pointilles',
  }

  /** Numéro de l'exercice dont le panneau de lignes en pointillés est ouvert */
  let openWritingLines: number | null = $state(null)
  let writingLinesDraft = $state({ ...WRITING_LINES_DEFAULT })

  /** Numéro de l'exercice dont le panneau de titre est ouvert */
  let openTitle: number | null = $state(null)
  let titleDraft = $state('')

  /** Numéro de l'exercice dont le panneau des points est ouvert */
  let openPoints: number | null = $state(null)
  let pointsDraft: number | null = $state(null)

  function togglePoints(num: number) {
    openPoints = openPoints === num ? null : num
    openInsertion = null
    openWritingLines = null
    openTitle = null
    if (openPoints != null) pointsDraft = exercisePoints[num] ?? null
  }

  /** Enregistre les points saisis (une seule régénération, à la validation) */
  function submitPoints(num: number) {
    if (
      pointsDraft != null &&
      Number.isFinite(pointsDraft) &&
      pointsDraft >= 0 &&
      pointsDraft !== exercisePoints[num]
    ) {
      onSetExercisePoints?.(num, pointsDraft)
    }
    openPoints = null
  }

  function toggleTitle(num: number) {
    openTitle = openTitle === num ? null : num
    openInsertion = null
    openWritingLines = null
    openPoints = null
    if (openTitle != null) titleDraft = exerciseTitles[num] ?? ''
  }

  /** Enregistre le titre saisi (une seule modification du code, à la validation) */
  function submitTitle(num: number) {
    if (titleDraft !== (exerciseTitles[num] ?? '')) {
      onSetExerciseTitle?.(num, titleDraft.trim())
    }
    openTitle = null
  }

  function toggleWritingLines(num: number) {
    openWritingLines = openWritingLines === num ? null : num
    openInsertion = null
    openTitle = null
    openPoints = null
    if (openWritingLines != null) {
      writingLinesDraft = writingLinesValues[num] ?? {
        ...WRITING_LINES_DEFAULT,
      }
    }
  }

  function setWritingLinesPosition(
    num: number,
    position: WritingLinesPosition,
  ) {
    writingLinesDraft = { ...writingLinesDraft, position }
    onSetWritingLines(num, writingLinesDraft)
  }

  function setWritingLinesStyle(num: number, style: WritingLinesStyle) {
    writingLinesDraft = { ...writingLinesDraft, style }
    onSetWritingLines(num, writingLinesDraft)
  }

  function setWritingLinesCount(num: number, count: number) {
    writingLinesDraft = {
      ...writingLinesDraft,
      count: Math.min(20, Math.max(0, count)),
    }
    onSetWritingLines(num, writingLinesDraft)
  }

  /** Espacement des lignes, réglable par pas de 0,5 em */
  function setWritingLinesSpacing(num: number, spacing: number) {
    writingLinesDraft = {
      ...writingLinesDraft,
      spacing: Math.min(6, Math.max(0.5, Math.round(spacing * 2) / 2)),
    }
    onSetWritingLines(num, writingLinesDraft)
  }

  function clearWritingLines(num: number) {
    onSetWritingLines(num, null)
    openWritingLines = null
  }
</script>

{#snippet insertionPanel(
  space: InsertionSpace,
  gapNum: number,
  positionClass: string,
)}
  <!-- panneau d'insertion/modification d'un texte ou d'un titre de section
       pour le repère `gapNum` de l'espace `space` (`exo` : entre les
       exercices ; `corr` : avant une correction) ; partagé entre le bouton
       du repère (barre d'exercice qui suit, ou barre du dernier repère) -->
  {#if openInsertion?.space === space && openInsertion.num === gapNum}
    <div
      class="absolute top-6 z-20 w-72 space-y-2 typst-panel p-2 {positionClass}"
    >
      {#if drafts.length > 0}
        <!-- insertions existantes : modification et suppression
             (draft.index : position réelle dans le code, les sauts de
             page/colonne étant filtrés de cette liste) -->
        {#each drafts as draft (draft.index)}
          <div class="flex items-center gap-1">
            <span
              class="shrink-0 rounded bg-gray-100 px-1 py-0.5 text-[0.6rem] uppercase text-gray-500"
            >
              {draft.kind}
            </span>
            <input
              type="text"
              class="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
              bind:value={draft.text}
              onkeydown={(e) => {
                if (e.key === 'Enter' && draft.text.trim().length > 0) {
                  if (space === 'corr') {
                    onUpdateInsertionCorrection(
                      gapNum,
                      draft.index,
                      composeSnippet(draft),
                    )
                  } else {
                    onUpdateInsertion(
                      gapNum,
                      draft.index,
                      composeSnippet(draft),
                    )
                  }
                }
                if (e.key === 'Escape') openInsertion = null
              }}
            />
            <button
              type="button"
              title="Enregistrer la modification"
              aria-label="Enregistrer la modification"
              class="hover:text-coopmaths-action disabled:opacity-40"
              disabled={draft.text.trim().length === 0}
              onclick={() =>
                space === 'corr'
                  ? onUpdateInsertionCorrection(
                      gapNum,
                      draft.index,
                      composeSnippet(draft),
                    )
                  : onUpdateInsertion(
                      gapNum,
                      draft.index,
                      composeSnippet(draft),
                    )}
            >
              <i class="bx bx-check text-base"></i>
            </button>
            <button
              type="button"
              title="Supprimer cette insertion"
              aria-label="Supprimer cette insertion"
              class="hover:text-red-600"
              onclick={() =>
                space === 'corr'
                  ? onDeleteInsertionCorrection(gapNum, draft.index)
                  : onDeleteInsertion(gapNum, draft.index)}
            >
              <i class="bx bx-trash text-base"></i>
            </button>
          </div>
        {/each}
        <hr class="border-gray-200" />
      {/if}
      <div class="flex overflow-hidden rounded border border-gray-300">
        {#each space === 'exo' ? [{ kind: 'section', label: 'Section' }, { kind: 'texte', label: 'Texte' }, { kind: 'exercice', label: 'Exercice' }] : [{ kind: 'section', label: 'Section' }, { kind: 'texte', label: 'Texte' }] as choice}
          <button
            type="button"
            class="flex-1 px-2 py-0.5 {insertionKind === choice.kind
              ? 'bg-coopmaths-action text-coopmaths-canvas'
              : 'bg-coopmaths-canvas text-coopmaths-corpus hover:bg-coopmaths-canvas-dark'}"
            aria-pressed={insertionKind === choice.kind}
            onclick={() =>
              (insertionKind = choice.kind as 'section' | 'texte' | 'exercice')}
          >
            {choice.label}
          </button>
        {/each}
      </div>
      {#if insertionKind === 'section'}
        <!-- svelte-ignore a11y_autofocus : le formulaire vient d'être ouvert au clic -->
        <input
          type="text"
          autofocus={drafts.length === 0}
          class="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
          placeholder="Titre de la section (ex : Monômes)"
          bind:value={insertionText}
          onkeydown={(e) => {
            if (e.key === 'Enter') submitInsertion()
            if (e.key === 'Escape') openInsertion = null
          }}
        />
      {:else}
        <!-- texte/exercice : plusieurs lignes de code Typst attendues, la
             touche Entrée doit donc rester un retour à la ligne normal
             (Ctrl/Cmd+Entrée valide, comme dans l'éditeur de code) -->
        <!-- svelte-ignore a11y_autofocus : le formulaire vient d'être ouvert au clic -->
        <textarea
          autofocus={drafts.length === 0}
          rows="10"
          class="w-full resize-y rounded border border-gray-300 px-1.5 py-0.5 font-mono text-xs"
          placeholder={insertionKind === 'exercice'
            ? 'Énoncé de l’exercice (code Typst accepté)'
            : 'Texte (code Typst accepté)'}
          bind:value={insertionText}
          onkeydown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitInsertion()
            if (e.key === 'Escape') openInsertion = null
          }}
        ></textarea>
      {/if}
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="px-2 py-0.5 hover:text-coopmaths-action"
          onclick={() => (openInsertion = null)}
        >
          Fermer
        </button>
        <button
          type="button"
          class="rounded bg-coopmaths-action px-2 py-0.5 text-white disabled:opacity-50"
          disabled={insertionText.trim().length === 0}
          onclick={submitInsertion}
        >
          Insérer
        </button>
      </div>
    </div>
  {/if}
{/snippet}

{#snippet titlePanel(num: number)}
  <!-- panneau du titre de l'exercice `num` : titre MathALÉA par défaut,
       modifiable ; vide, l'exercice n'a pas de titre -->
  {#if openTitle === num}
    <div class="absolute top-6 right-0 z-30 w-72 space-y-2 typst-panel p-2">
      <input
        type="text"
        class="w-full rounded border border-gray-300 px-1 py-0.5 text-xs"
        placeholder="Pas de titre"
        aria-label="Titre de l'exercice {num}"
        bind:value={titleDraft}
        onkeydown={(e) => {
          if (e.key === 'Enter') submitTitle(num)
          if (e.key === 'Escape') openTitle = null
        }}
      />
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="px-2 py-0.5 text-xs hover:text-coopmaths-action"
          title={defaultExerciseTitles[num]}
          onclick={() => {
            onSetExerciseTitle?.(num, null)
            openTitle = null
          }}
        >
          Titre par défaut
        </button>
        <button
          type="button"
          class="px-2 py-0.5 text-xs hover:text-coopmaths-action"
          onclick={() => submitTitle(num)}
        >
          Valider
        </button>
      </div>
    </div>
  {/if}
{/snippet}

{#snippet pointsPanel(num: number)}
  <!-- panneau des points de l'exercice `num` (barème de la fiche) -->
  {#if openPoints === num}
    <div
      class="absolute top-6 right-0 z-30 flex w-44 items-center gap-2 typst-panel p-2"
    >
      <input
        type="number"
        step="0.5"
        min="0"
        class="w-16 rounded border border-gray-300 px-1 py-0.5 text-xs"
        aria-label="Points de l'exercice {num}"
        bind:value={pointsDraft}
        onkeydown={(e) => {
          if (e.key === 'Enter') submitPoints(num)
          if (e.key === 'Escape') openPoints = null
        }}
      />
      <span class="text-xs">pts</span>
      <button
        type="button"
        class="ml-auto px-2 py-0.5 text-xs hover:text-coopmaths-action"
        onclick={() => submitPoints(num)}
      >
        Valider
      </button>
    </div>
  {/if}
{/snippet}

{#snippet writingLinesPanel(num: number)}
  <!-- panneau de réglage des lignes (pour que l'élève y écrive) de
       l'exercice `num` : emplacement, rendu, nombre
       de lignes, espacement. Régénère le code à chaque changement (voir onSetWritingLines). -->
  {#if openWritingLines === num}
    <div class="absolute top-6 right-0 z-30 w-64 space-y-2 typst-panel p-2">
      <div class="flex overflow-hidden rounded border border-gray-300">
        {#each WRITING_LINES_POSITIONS as position}
          <button
            type="button"
            class="flex-1 px-2 py-0.5 text-[0.7rem] {writingLinesDraft.position ===
            position
              ? 'bg-coopmaths-action text-coopmaths-canvas'
              : 'bg-coopmaths-canvas text-coopmaths-corpus hover:bg-coopmaths-canvas-dark'}"
            aria-pressed={writingLinesDraft.position === position}
            onclick={() => setWritingLinesPosition(num, position)}
          >
            {WRITING_LINES_POSITION_LABELS[position]}
          </button>
        {/each}
      </div>
      <div class="flex overflow-hidden rounded border border-gray-300">
        {#each WRITING_LINES_STYLES as style}
          <button
            type="button"
            class="flex-1 px-2 py-0.5 text-[0.7rem] {writingLinesDraft.style ===
            style
              ? 'bg-coopmaths-action text-coopmaths-canvas'
              : 'bg-coopmaths-canvas text-coopmaths-corpus hover:bg-coopmaths-canvas-dark'}"
            aria-pressed={writingLinesDraft.style === style}
            onclick={() => setWritingLinesStyle(num, style)}
          >
            {WRITING_LINES_STYLE_LABELS[style]}
          </button>
        {/each}
      </div>
      <label class="flex items-center justify-between gap-2 text-xs">
        Nombre de lignes
        <input
          type="number"
          min="0"
          max="20"
          step="1"
          class="w-14 rounded border border-gray-300 px-1 py-0.5 text-xs"
          value={writingLinesDraft.count}
          onchange={(e) =>
            setWritingLinesCount(num, Number(e.currentTarget.value))}
        />
      </label>
      <label class="flex items-center justify-between gap-2 text-xs">
        Espacement (em)
        <input
          type="number"
          min="0.5"
          max="6"
          step="0.5"
          class="w-14 rounded border border-gray-300 px-1 py-0.5 text-xs"
          value={writingLinesDraft.spacing}
          onchange={(e) =>
            setWritingLinesSpacing(num, Number(e.currentTarget.value))}
        />
      </label>
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="px-2 py-0.5 text-xs text-red-600 hover:underline"
          onclick={() => clearWritingLines(num)}
        >
          Retirer
        </button>
        <button
          type="button"
          class="px-2 py-0.5 text-xs hover:text-coopmaths-action"
          onclick={() => (openWritingLines = null)}
        >
          Fermer
        </button>
      </div>
    </div>
  {/if}
{/snippet}

<div class="pointer-events-none absolute inset-0 z-10 text-xs text-gray-700">
  {#each widgets as widget, i (i)}
    <!-- contrôle d'un autre exercice que celui survolé : masqué (mais
         toujours atteignable au clavier, voir .typst-pill-idle) ; ceux de
         l'exercice survolé sont pleinement visibles -->
    {@const idle =
      widget.sections != null &&
      (activeSection == null || !widget.sections.includes(activeSection))}
    {#if widget.kind === 'tasks' && widget.target != null}
      {@const target = widget.target}
      <!-- num 0 : la liste des corrections du mode « Course aux nombres »,
           commune à toute la fiche (elle n'appartient à aucun exercice) -->
      {@const label =
        widget.num === 0
          ? 'des corrections de la fiche'
          : `des questions de l'exercice ${widget.num}` +
            (target.endsWith('-corr') ? ' (correction)' : '')}
      <!-- lecture directe de layoutValues dans le gabarit : une lecture via
           une fonction ne serait pas re-rendue quand la prop change -->
      {@const gutter = layoutValues[target]?.gutter}
      {@const gutterLabel =
        gutter == null || gutter === 'interligne-questions' ? 'auto' : gutter}
      <!-- les propositions de QCM ont leurs propres colonnes, déclarées
           seulement quand l'exercice en contient un ; à l'inverse, un exercice
           à question unique avec QCM n'a pas de liste de questions à régler -->
      {@const qcmTarget = `${target}-qcm`}
      {@const qcmColumns = layoutValues[qcmTarget]?.columns}
      {@const hasQuestions = layoutValues[target] != null}
      <!-- contrôles des questions, dans la marge la plus proche -->
      <div
        class="pointer-events-auto absolute flex -translate-y-1/2 flex-col typst-pill typst-pill-box"
        class:typst-pill-idle={idle}
        class:typst-pill-current={widget.sections != null && !idle}
        style="top: {widget.top}%; {widget.side === 'right'
          ? 'right: 0.3%'
          : 'left: 0.3%'}"
        data-testid="typst-overlay-tasks"
      >
        {#if hasQuestions}
          <div
            class="flex items-center justify-between"
            title="Colonnes {label}"
          >
            <button
              type="button"
              aria-label="Moins de colonnes"
              onclick={() => onAdjustColumns(target, -1)}
            >
              <i class="bx bx-chevron-left"></i>
            </button>
            <span class="tabular-nums">
              {layoutValues[target]?.columns === '"auto-fit"'
                ? 'auto'
                : (layoutValues[target]?.columns ?? 'auto')}<i
                class="bx bx-columns text-[0.6rem]"
              ></i>
            </span>
            <button
              type="button"
              aria-label="Plus de colonnes"
              onclick={() => onAdjustColumns(target, 1)}
            >
              <i class="bx bx-chevron-right"></i>
            </button>
          </div>
          <div
            class="flex items-center justify-between typst-pill-divider-top"
            title="Espacement vertical {label}"
          >
            <button
              type="button"
              aria-label="Réduire l'espacement des questions"
              onclick={() => onAdjustGutter(target, -1)}
            >
              <i class="bx bx-minus"></i>
            </button>
            <span class="px-0.5 text-[0.6rem] tabular-nums">
              {gutterLabel}
            </span>
            <button
              type="button"
              aria-label="Augmenter l'espacement des questions"
              onclick={() => onAdjustGutter(target, 1)}
            >
              <i class="bx bx-plus"></i>
            </button>
          </div>
        {/if}
        {#if qcmColumns != null}
          <div
            class="flex items-center justify-between"
            class:typst-pill-divider-top={hasQuestions}
            title="Colonnes des propositions du QCM {label.replace(
              'des questions ',
              '',
            )}"
          >
            <button
              type="button"
              aria-label="Moins de colonnes pour les propositions du QCM"
              onclick={() => onAdjustColumns(qcmTarget, -1)}
            >
              <i class="bx bx-chevron-left"></i>
            </button>
            <span class="tabular-nums">
              {qcmColumns === '"auto-fit"' ? 'auto' : qcmColumns}<i
                class="bx bx-list-check text-[0.6rem]"
              ></i>
            </span>
            <button
              type="button"
              aria-label="Plus de colonnes pour les propositions du QCM"
              onclick={() => onAdjustColumns(qcmTarget, 1)}
            >
              <i class="bx bx-chevron-right"></i>
            </button>
          </div>
        {/if}
      </div>
    {:else if widget.kind === 'can-table'}
      <!-- largeur de la colonne « Réponse » : la réduire laisse plus de place
           à la colonne « Énoncé ». Le repère est au milieu de l'en-tête de la
           colonne : la pastille se pose juste au-dessus du tableau -->
      <div
        class="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-full items-center typst-pill typst-pill-box"
        style="left: {widget.left}%; top: {widget.top}%; margin-top: -0.6rem;"
        title="Largeur de la colonne Réponse"
        data-testid="typst-overlay-can-table"
      >
        <button
          type="button"
          aria-label="Réduire la colonne Réponse"
          onclick={() => onAdjustCanAnswerWidth(-1)}
        >
          <i class="bx bx-chevron-left"></i>
        </button>
        <span class="tabular-nums">
          {canAnswerWidth}%<i class="bx bx-columns text-[0.6rem]"></i>
        </span>
        <button
          type="button"
          aria-label="Élargir la colonne Réponse"
          onclick={() => onAdjustCanAnswerWidth(1)}
        >
          <i class="bx bx-chevron-right"></i>
        </button>
      </div>
    {:else if widget.kind === 'can-row'}
      <!-- édition de l'énoncé/réponse de cette ligne du tableau, dans la
           marge la plus proche (même convention que le widget `tasks`) -->
      {@const isOverridden =
        codeOverridesCan[widget.num] != null ||
        codeOverridesCanReponse[widget.num] != null}
      <div
        class="pointer-events-auto absolute -translate-y-1/2"
        style="top: {widget.top}%; {widget.side === 'right'
          ? 'right: 0.3%'
          : 'left: 0.3%'}"
      >
        <button
          type="button"
          title={isOverridden
            ? `Modifier la ligne ${widget.num} du tableau`
            : `Éditer la ligne ${widget.num} du tableau`}
          aria-label="Éditer la ligne {widget.num} du tableau « Course aux nombres »"
          class="typst-pill typst-pill-round flex h-5 w-5 items-center justify-center"
          class:typst-pill-active={isOverridden}
          data-testid="typst-overlay-edit-can-row"
          onclick={() => onEditCanRow(widget.num)}
        >
          <i class="bx bx-pencil text-xs"></i>
        </button>
      </div>
    {:else if widget.kind === 'qr-code'}
      <div
        class="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
        style="left: {widget.left}%; top: {widget.top}%;"
      >
        <button
          type="button"
          title="Modifier l’URL du QR-code global"
          aria-label="Modifier l’URL du QR-code global"
          aria-expanded={qrCodeOpen}
          class="typst-pill typst-pill-round flex h-6 w-6 items-center justify-center"
          class:typst-pill-force-visible={qrCodeOpen}
          data-testid="typst-overlay-qr-code"
          onclick={() => toggleQrCode(widget.num)}
        >
          <i class="bx bx-pencil"></i>
        </button>
        {#if qrCodeOpen}
          <div
            class="absolute right-4 top-0 z-20 w-80 space-y-2 typst-panel p-2"
          >
            <label class="block space-y-0.5">
              <span class="text-[0.65rem] uppercase text-gray-500"
                >URL du QR-code</span
              >
              <input
                type="url"
                class="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
                bind:value={qrCodeDraft}
                onkeydown={(e) => {
                  if (e.key === 'Enter') submitQrCode()
                  if (e.key === 'Escape') qrCodeOpen = false
                }}
              />
            </label>

            <!-- Raccourcissement automatique via edurl.fr : reste optionnel, le
                 champ ci-dessus accepte toujours une URL collée à la main. -->
            <div class="space-y-1 border-t border-gray-200 pt-2">
              {#if edurlAskToken}
                <label class="block space-y-0.5">
                  <span class="text-[0.65rem] uppercase text-gray-500"
                    >Jeton d’accès edurl.fr</span
                  >
                  <input
                    type="password"
                    class="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
                    autocomplete="off"
                    spellcheck="false"
                    bind:value={edurlTokenInput}
                    onkeydown={(e) => {
                      if (e.key === 'Enter') saveEdurlTokenAndShorten()
                      if (e.key === 'Escape') edurlAskToken = false
                    }}
                  />
                </label>
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="px-2 py-0.5 hover:text-coopmaths-action"
                    onclick={() => (edurlAskToken = false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    class="rounded bg-coopmaths-action px-2 py-0.5 text-white"
                    onclick={saveEdurlTokenAndShorten}
                  >
                    Enregistrer et raccourcir
                  </button>
                </div>
              {:else}
                <div class="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 text-xs text-coopmaths-action disabled:opacity-50"
                    disabled={edurlBusy}
                    onclick={shortenViaEdurl}
                  >
                    {#if edurlBusy}
                      <i class="bx bx-loader-alt bx-spin"></i>
                    {/if}
                    Raccourcir via edurl.fr
                  </button>
                  {#if edurlTokenSaved}
                    <button
                      type="button"
                      class="text-[0.65rem] text-gray-500 hover:text-coopmaths-action"
                      onclick={forgetEdurlToken}
                    >
                      Oublier le jeton
                    </button>
                  {/if}
                </div>
              {/if}
              {#if edurlError}
                <p class="text-[0.65rem] text-red-600">{edurlError}</p>
              {/if}
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-2 py-0.5 hover:text-coopmaths-action"
                onclick={() => (qrCodeOpen = false)}
              >
                Annuler
              </button>
              <button
                type="button"
                class="rounded bg-coopmaths-action px-2 py-0.5 text-white"
                onclick={submitQrCode}
              >
                Enregistrer
              </button>
            </div>
          </div>
        {/if}
      </div>
    {:else if widget.kind === 'header'}
      <!-- édition du titre, du sous-titre et de la ligne d'en-tête -->
      <div
        class="pointer-events-auto absolute -translate-y-1/2"
        style="left: {widget.left}%; top: {widget.top}%;"
      >
        <button
          type="button"
          title="Modifier le titre, le sous-titre et la ligne d'en-tête"
          aria-label="Modifier le titre, le sous-titre et la ligne d'en-tête"
          aria-expanded={headerOpen}
          class="typst-pill typst-pill-round flex h-6 w-6 -translate-x-1/2 items-center justify-center"
          class:typst-pill-force-visible={headerOpen}
          data-testid="typst-overlay-header"
          onclick={toggleHeader}
        >
          <i class="bx bx-edit"></i>
        </button>
        {#if headerOpen}
          <div
            class="absolute left-4 top-0 z-20 w-80 space-y-2 typst-panel p-2"
          >
            {#each HEADER_FIELDS as field}
              <label class="block space-y-0.5">
                <span class="text-[0.65rem] uppercase text-gray-500">
                  {field.label}
                </span>
                <input
                  type="text"
                  class="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
                  bind:value={headerDraft[field.name]}
                  onkeydown={(e) => {
                    if (e.key === 'Enter') submitHeader()
                    if (e.key === 'Escape') headerOpen = false
                  }}
                />
              </label>
            {/each}
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-2 py-0.5 hover:text-coopmaths-action"
                onclick={() => (headerOpen = false)}
              >
                Annuler
              </button>
              <button
                type="button"
                class="rounded bg-coopmaths-action px-2 py-0.5 text-white"
                onclick={submitHeader}
              >
                Enregistrer
              </button>
            </div>
          </div>
        {/if}
      </div>
    {:else if widget.kind === 'cover'}
      <!-- édition des textes de la page de garde (intitulé, session, matière,
           durée, mention de bas de page, consignes) ; champs sans objet
           masqués selon le modèle (Session/Matière/mention pour « Course aux
           nombres », mention pour « Évaluation ») -->
      <div
        class="pointer-events-auto absolute -translate-y-1/2"
        style="left: {widget.left}%; top: {widget.top}%;"
      >
        <button
          type="button"
          title="Modifier les textes de la page de garde"
          aria-label="Modifier les textes de la page de garde"
          aria-expanded={coverOpen}
          class="typst-pill typst-pill-round flex h-6 w-6 -translate-x-1/2 items-center justify-center"
          class:typst-pill-force-visible={coverOpen}
          data-testid="typst-overlay-cover"
          onclick={toggleCover}
        >
          <i class="bx bx-edit"></i>
        </button>
        {#if coverOpen}
          <div
            class="absolute left-4 top-0 z-20 w-80 space-y-2 typst-panel p-2"
          >
            {#each visibleCoverFields as field}
              <label class="block space-y-0.5">
                <span class="text-[0.65rem] uppercase text-gray-500">
                  {coverFieldLabel(field.name, field.label)}
                </span>
                {#if isCoverDateField(field.name)}
                  <!-- la récitation date la fiche : champ jj.mm.aa doublé du
                       calendrier natif (voir CoverDateField) -->
                  <CoverDateField
                    value={coverDraft[field.name]}
                    inputClass="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
                    onChange={(date) => (coverDraft[field.name] = date)}
                  />
                {:else}
                  <input
                    type="text"
                    class="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
                    bind:value={coverDraft[field.name]}
                    onkeydown={(e) => {
                      if (e.key === 'Enter') submitCover()
                      if (e.key === 'Escape') coverOpen = false
                    }}
                  />
                {/if}
              </label>
            {/each}
            <label class="block space-y-0.5">
              <span class="text-[0.65rem] uppercase text-gray-500">
                Consignes (une par ligne)
              </span>
              <textarea
                rows="3"
                class="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
                bind:value={coverDraft.consignes}
                onkeydown={(e) => {
                  if (e.key === 'Escape') coverOpen = false
                }}
              ></textarea>
            </label>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-2 py-0.5 hover:text-coopmaths-action"
                onclick={() => (coverOpen = false)}
              >
                Annuler
              </button>
              <button
                type="button"
                class="rounded bg-coopmaths-action px-2 py-0.5 text-white"
                onclick={submitCover}
              >
                Enregistrer
              </button>
            </div>
          </div>
        {/if}
      </div>
    {:else if widget.kind === 'footer'}
      <!-- édition du texte du pied de page ; émise sur la première page
           physique seulement (voir `pageFooter` de `buildTypstDocument.ts`),
           bien que le pied de page lui-même se répète sur chaque page -->
      <div
        class="pointer-events-auto absolute -translate-y-1/2"
        style="left: {widget.left}%; top: {widget.top}%;"
      >
        <button
          type="button"
          title="Modifier le texte du pied de page"
          aria-label="Modifier le texte du pied de page"
          aria-expanded={footerOpen}
          class="typst-pill typst-pill-round flex h-6 w-6 -translate-x-1/2 items-center justify-center"
          class:typst-pill-force-visible={footerOpen}
          data-testid="typst-overlay-footer"
          onclick={toggleFooter}
        >
          <i class="bx bx-edit"></i>
        </button>
        {#if footerOpen}
          <div
            class="absolute left-4 top-0 z-20 w-80 space-y-2 typst-panel p-2"
          >
            <label class="block space-y-0.5">
              <span class="text-[0.65rem] uppercase text-gray-500">
                Texte du pied de page
              </span>
              <input
                type="text"
                class="w-full rounded border border-gray-300 px-1.5 py-0.5 text-xs"
                bind:value={footerDraft}
                onkeydown={(e) => {
                  if (e.key === 'Enter') submitFooter()
                  if (e.key === 'Escape') footerOpen = false
                }}
              />
            </label>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-2 py-0.5 hover:text-coopmaths-action"
                onclick={() => (footerOpen = false)}
              >
                Annuler
              </button>
              <button
                type="button"
                class="rounded bg-coopmaths-action px-2 py-0.5 text-white"
                onclick={submitFooter}
              >
                Enregistrer
              </button>
            </div>
          </div>
        {/if}
      </div>
    {:else if widget.kind === 'version-label'}
      <!-- masque/affiche l'étiquette « Sujet A/B... » de l'en-tête (fiche à
           plusieurs versions) ; son repère reste dans le titre quand elle
           est masquée, sans réserver de place dans la ligne d'en-tête -->
      <div
        class="pointer-events-auto absolute -translate-y-1/2"
        style="left: {widget.left}%; top: {widget.top}%;"
      >
        <button
          type="button"
          title={hideVersionLabel
            ? "Afficher l'étiquette « Sujet A/B... »"
            : "Masquer l'étiquette « Sujet A/B... » (pour que les élèves ne sachent pas quelle version ils ont)"}
          aria-label={hideVersionLabel
            ? "Afficher l'étiquette de version"
            : "Masquer l'étiquette de version"}
          class="typst-pill typst-pill-round flex h-6 w-6 -translate-x-1/2 items-center justify-center"
          class:typst-pill-active={hideVersionLabel}
          data-testid="typst-overlay-version-label"
          onclick={onToggleVersionLabel}
        >
          <i class="bx {hideVersionLabel ? 'bx-show' : 'bx-hide'}"></i>
        </button>
      </div>
    {:else if widget.kind === 'exo'}
      <!-- insertion avant cet exercice : repère de gap qui précède -->
      {@const insertGapNum = widget.num - 1}
      {@const insertGapInsertions = insertions[insertGapNum] ?? []}
      {@const insertHasText = insertGapInsertions.some(
        (snippet) =>
          snippet !== PAGE_BREAK_SNIPPET && snippet !== COLUMN_BREAK_SNIPPET,
      )}
      <!-- exercice fusionné avec le précédent : le repère de gap qui le
           précède est interne au groupe, l'insertion n'y a pas de sens ;
           en mode « Course aux nombres » non plus, entre deux lignes du
           tableau (seuls les gaps qui l'encadrent existent) -->
      {@const showInsert = !mergedExercises.includes(widget.num) && !canMode}
      <!-- bord droit de la colonne qui contient l'exercice (et non celui de
           la page) : en document multicolonne, la barre doit rester dans la
           même colonne que le titre qu'elle contrôle, sous peine de se
           retrouver au-dessus d'un autre exercice -->
      {@const inMulticol =
        (multicolGroups.includes(widget.num) ||
          multicolGroups.includes(widget.num - 1)) &&
        !canMode}
      {@const columnWidth =
        100 / Math.max(documentColumns + (inMulticol ? 1 : 0), 1)}
      {@const columnRight =
        (Math.floor(widget.left / columnWidth) + 1) * columnWidth}
      <!-- contrôles de l'exercice : insertion avant l'exercice, déplacement,
           réglages, nouvelles données, nombre de questions, suppression -->
      <div
        class="pointer-events-auto absolute flex -translate-x-full -translate-y-1/2 items-center gap-0.5 typst-pill typst-pill-round px-1"
        class:typst-pill-idle={idle}
        class:typst-pill-current={widget.sections != null && !idle}
        class:typst-pill-force-visible={(openInsertion?.space === 'exo' &&
          openInsertion.num === insertGapNum) ||
          openWritingLines === widget.num ||
          openTitle === widget.num ||
          openPoints === widget.num}
        class:z-20={(openInsertion?.space === 'exo' &&
          openInsertion.num === insertGapNum) ||
          openWritingLines === widget.num ||
          openTitle === widget.num ||
          openPoints === widget.num}
        style="top: {widget.top}%; left: {columnRight - 0.3}%;"
        data-testid="typst-overlay-exo"
      >
        <button
          type="button"
          title="Monter l'exercice"
          aria-label="Monter l'exercice {widget.num}"
          disabled={widget.num <= 1}
          onclick={() => onMoveExercise(widget.num, -1)}
        >
          <i class="bx bx-up-arrow-alt"></i>
        </button>
        <button
          type="button"
          title="Descendre l'exercice"
          aria-label="Descendre l'exercice {widget.num}"
          disabled={widget.num >= exerciseCount}
          onclick={() => onMoveExercise(widget.num, 1)}
        >
          <i class="bx bx-down-arrow-alt"></i>
        </button>
        {#if showInsert}
          <button
            type="button"
            title="Insérer ou modifier un texte, un titre de section ou un exercice avant l'exercice"
            aria-label="Insérer ou modifier un texte, un titre de section ou un exercice avant l'exercice {widget.num}"
            aria-expanded={openInsertion?.space === 'exo' &&
              openInsertion.num === insertGapNum}
            data-testid="typst-overlay-insert"
            onclick={() => toggleInsertion('exo', insertGapNum)}
          >
            <i class="bx bx-plus-circle"></i>
          </button>
          <span class="typst-pill-sep"></span>
        {/if}
        {#if nonEditableStaticExercises[widget.num] && !canMode}
          {@const exoZoom = exerciseZoomValues[widget.num] ?? 1}
          <button
            type="button"
            title="Découper l'image"
            aria-label="Découper l'image de l'exercice {widget.num}"
            onclick={() => onCutImage(widget.num, 'enonce')}
            ><i class="bx bx-cut"></i></button
          >
          <button
            type="button"
            title="Réduire l'exercice"
            aria-label="Réduire l'exercice {widget.num}"
            onclick={() => onAdjustExerciseZoom(widget.num, -1)}
          >
            <i class="bx bx-zoom-out"></i>
          </button>
          <span class="tabular-nums px-0.5 text-[0.6rem]">
            {Math.round(exoZoom * 100)}%
          </span>
          <button
            type="button"
            title="Agrandir l'exercice"
            aria-label="Agrandir l'exercice {widget.num}"
            onclick={() => onAdjustExerciseZoom(widget.num, 1)}
          >
            <i class="bx bx-zoom-in"></i>
          </button>
          <span class="typst-pill-sep"></span>
        {/if}
        {#if !staticExercises[widget.num]}
          <button
            type="button"
            title="Réglages de l'exercice {widget.num}"
            aria-label="Réglages de l'exercice {widget.num}"
            onclick={() => onOpenSettings(widget.num)}
          >
            <i class="bx bx-cog"></i>
          </button>
        {/if}
        {#if !nonEditableStaticExercises[widget.num] && !canMode}
          <button
            type="button"
            title={codeOverrides[widget.num] != null
              ? 'Modifier le code Typst de cet exercice'
              : 'Éditer le code Typst de cet exercice'}
            aria-label="Éditer le code Typst de l'exercice {widget.num}"
            class:typst-pill-active={codeOverrides[widget.num] != null}
            data-testid="typst-overlay-edit-code"
            onclick={() => onEditCode(widget.num)}
          >
            <i class="bx bx-pencil"></i>
          </button>
        {/if}
        {#if showExerciseTitles && !mergedExercises.includes(widget.num)}
          <button
            type="button"
            title="Modifier le titre de cet exercice"
            aria-label="Titre de l'exercice {widget.num}"
            aria-expanded={openTitle === widget.num}
            data-testid="typst-overlay-title"
            onclick={() => toggleTitle(widget.num)}
          >
            <i class="bx bx-heading"></i>
          </button>
          {@render titlePanel(widget.num)}
        {/if}
        {#if exercisePoints[widget.num] != null && !mergedExercises.includes(widget.num)}
          <button
            type="button"
            title="Modifier les points de cet exercice"
            aria-label="Points de l'exercice {widget.num}"
            aria-expanded={openPoints === widget.num}
            data-testid="typst-overlay-points"
            onclick={() => togglePoints(widget.num)}
          >
            <i class="bx bx-medal"></i>
          </button>
          {@render pointsPanel(widget.num)}
        {/if}
        {#if !canMode}
          <button
            type="button"
            title={writingLinesValues[widget.num] != null
              ? 'Modifier les lignes pour écrire de cet exercice'
              : 'Ajouter des lignes pour écrire à cet exercice'}
            aria-label="Lignes pour écrire, exercice {widget.num}"
            aria-expanded={openWritingLines === widget.num}
            class:typst-pill-active={writingLinesValues[widget.num] != null}
            data-testid="typst-overlay-writing-lines"
            onclick={() => toggleWritingLines(widget.num)}
          >
            <i class="bx bx-detail"></i>
          </button>
          {@render writingLinesPanel(widget.num)}
        {/if}
        {#if !staticExercises[widget.num]}
          <button
            type="button"
            title="Nouvelles données pour l'exercice {widget.num}{newDataSubjectLabel ==
            null
              ? ''
              : ` du ${newDataSubjectLabel}`}"
            aria-label="Nouvelles données pour l'exercice {widget.num}{newDataSubjectLabel ==
            null
              ? ''
              : ` du ${newDataSubjectLabel}`}"
            onclick={() => onNewData(widget.num)}
          >
            <i class="bx bx-refresh"></i>
          </button>
        {/if}
        {#if questionCounts[widget.num] != null}
          <span class="typst-pill-sep"></span>
          <button
            type="button"
            title="Une question de moins"
            aria-label="Une question de moins dans l'exercice {widget.num}"
            onclick={() => onChangeQuestionCount(widget.num, -1)}
          >
            <i class="bx bx-minus"></i>
          </button>
          <span class="tabular-nums" title="Nombre de questions">
            {questionCounts[widget.num]}<span class="text-[0.6rem]">q</span>
          </span>
          <button
            type="button"
            title="Une question de plus"
            aria-label="Une question de plus dans l'exercice {widget.num}"
            onclick={() => onChangeQuestionCount(widget.num, 1)}
          >
            <i class="bx bx-plus"></i>
          </button>
        {/if}
        <span class="typst-pill-sep"></span>
        <button
          type="button"
          title="Dupliquer l'exercice {widget.num} (la copie se place juste après)"
          aria-label="Dupliquer l'exercice {widget.num}"
          onclick={() => onDuplicateExercise(widget.num)}
        >
          <i class="bx bx-copy"></i>
        </button>
        <button
          type="button"
          title="Supprimer l'exercice {widget.num} de la fiche"
          aria-label="Supprimer l'exercice {widget.num} de la fiche"
          class="typst-danger"
          onclick={() => onDeleteExercise(widget.num)}
        >
          <i class="bx bx-trash"></i>
        </button>
        {@render insertionPanel('exo', insertGapNum, 'right-0')}
      </div>
    {:else if widget.kind === 'version-exo'}
      <!-- Les réglages de structure sont communs à tous les sujets. Dans les
           sujets B, C..., seule la nouvelle graine est locale à la version. -->
      <div
        class="pointer-events-auto absolute flex -translate-x-full -translate-y-1/2 items-center gap-0.5 typst-pill typst-pill-round px-1"
        class:typst-pill-idle={idle}
        class:typst-pill-current={widget.sections != null && !idle}
        style="top: {widget.top}%; left: {widget.left - 0.3}%;"
        data-testid="typst-overlay-version-exo"
      >
        {#if !staticExercises[widget.num]}
          <button
            type="button"
            title="Nouvelles données pour l'exercice {widget.num}{newDataSubjectLabel ==
            null
              ? ''
              : ` du ${newDataSubjectLabel}`}"
            aria-label="Nouvelles données pour l'exercice {widget.num}{newDataSubjectLabel ==
            null
              ? ''
              : ` du ${newDataSubjectLabel}`}"
            onclick={() => onNewData(widget.num)}
          >
            <i class="bx bx-refresh"></i>
          </button>
        {/if}
      </div>
    {:else if widget.kind === 'corr'}
      <!-- barre de la correction (pendant de la barre 'exo' de l'énoncé) :
           insertion d'un texte ou d'un titre de section avant elle, saut de
           page avant elle, et édition de son code Typst. Même position
           (bord droit de la colonne qui la contient) que la barre 'exo'. -->
      {@const columnWidth = 100 / Math.max(documentColumns, 1)}
      {@const columnRight =
        (Math.floor(widget.left / columnWidth) + 1) * columnWidth}
      {@const corrInsertions = insertionsCorrection[widget.num] ?? []}
      {@const hasPageBreak = corrInsertions.includes(PAGE_BREAK_SNIPPET)}
      {@const hasColumnBreak = corrInsertions.includes(COLUMN_BREAK_SNIPPET)}
      <div
        class="pointer-events-auto absolute flex -translate-x-full -translate-y-1/2 items-center gap-0.5 typst-pill typst-pill-round px-1"
        class:typst-pill-idle={idle}
        class:typst-pill-current={widget.sections != null && !idle}
        class:typst-pill-force-visible={openInsertion?.space === 'corr' &&
          openInsertion.num === widget.num}
        class:z-20={openInsertion?.space === 'corr' &&
          openInsertion.num === widget.num}
        style="top: {widget.top}%; left: {columnRight - 0.3}%;"
        data-testid="typst-overlay-corr"
      >
        <button
          type="button"
          title="Insérer ou modifier un texte ou un titre de section avant cette correction"
          aria-label="Insérer ou modifier un texte ou un titre de section avant la correction de l'exercice {widget.num}"
          aria-expanded={openInsertion?.space === 'corr' &&
            openInsertion.num === widget.num}
          data-testid="typst-overlay-insert-corr"
          onclick={() => toggleInsertion('corr', widget.num)}
        >
          <i class="bx bx-plus-circle"></i>
        </button>
        <span class="typst-pill-sep"></span>
        <button
          type="button"
          title={hasPageBreak
            ? 'Retirer le saut de page'
            : 'Insérer un saut de page avant cette correction'}
          aria-label={hasPageBreak
            ? 'Retirer le saut de page avant cette correction'
            : 'Insérer un saut de page avant cette correction'}
          class:typst-pill-active={hasPageBreak}
          data-testid={hasPageBreak
            ? 'typst-overlay-corr-pagebreak-active'
            : 'typst-overlay-corr-pagebreak'}
          onclick={() => toggleBreak('corr', widget.num, PAGE_BREAK_SNIPPET)}
        >
          <i class="bx bx-arrow-to-bottom"></i>
        </button>
        {#if hasColumnBreak || documentColumns > 1}
          <button
            type="button"
            title={hasColumnBreak
              ? 'Retirer le saut de colonne'
              : 'Insérer un saut de colonne avant cette correction'}
            aria-label={hasColumnBreak
              ? 'Retirer le saut de colonne avant cette correction'
              : 'Insérer un saut de colonne avant cette correction'}
            class:typst-pill-active={hasColumnBreak}
            data-testid={hasColumnBreak
              ? 'typst-overlay-corr-colbreak-active'
              : 'typst-overlay-corr-colbreak'}
            onclick={() =>
              toggleBreak('corr', widget.num, COLUMN_BREAK_SNIPPET)}
          >
            <i class="bx bx-arrow-to-right"></i>
          </button>
        {/if}
        {#if nonEditableCorrections[widget.num] && !canMode}
          {@const corrZoom = exerciseCorrectionZoomValues[widget.num] ?? 1}
          <button
            type="button"
            title="Découper l'image"
            aria-label="Découper l'image de la correction de l'exercice {widget.num}"
            onclick={() => onCutImage(widget.num, 'correction')}
            ><i class="bx bx-cut"></i></button
          >
          <span class="typst-pill-sep"></span>
          <button
            type="button"
            title="Réduire la correction"
            aria-label="Réduire la correction de l'exercice {widget.num}"
            onclick={() => onAdjustExerciseCorrectionZoom(widget.num, -1)}
          >
            <i class="bx bx-zoom-out"></i>
          </button>
          <span class="tabular-nums px-0.5 text-[0.6rem]">
            {Math.round(corrZoom * 100)}%
          </span>
          <button
            type="button"
            title="Agrandir la correction"
            aria-label="Agrandir la correction de l'exercice {widget.num}"
            onclick={() => onAdjustExerciseCorrectionZoom(widget.num, 1)}
          >
            <i class="bx bx-zoom-in"></i>
          </button>
        {/if}
        {#if !nonEditableCorrections[widget.num]}
          <span class="typst-pill-sep"></span>
          <button
            type="button"
            title={codeOverridesCorrection[widget.num] != null
              ? 'Modifier le code Typst de cette correction'
              : 'Éditer le code Typst de cette correction'}
            aria-label="Éditer le code Typst de la correction de l'exercice {widget.num}"
            class:typst-pill-active={codeOverridesCorrection[widget.num] !=
              null}
            data-testid="typst-overlay-edit-correction-code"
            onclick={() => onEditCorrectionCode(widget.num)}
          >
            <i class="bx bx-pencil"></i>
          </button>
        {/if}
        {@render insertionPanel('corr', widget.num, 'right-0')}
      </div>
    {:else if widget.kind === 'figure'}
      <!-- zoom et alignement d'une figure mathalea2d embarquée : le repère
           est déjà placé au coin haut-droit de son rendu final (zoom et
           alignement compris, voir mathalea-figure-block) ; on ne décale la
           pastille que vers le haut pour qu'elle ne recouvre pas l'image -->
      {@const zoom = figureZoomValues[widget.num] ?? 1}
      {@const figAlign = figureAlignValues[widget.num] ?? 'center'}
      <div
        class="pointer-events-auto absolute flex -translate-x-full -translate-y-full items-center gap-0.5 typst-pill typst-pill-round px-1"
        class:typst-pill-idle={idle}
        class:typst-pill-current={widget.sections != null && !idle}
        style="left: {widget.left}%; top: {widget.top}%;"
        data-testid="typst-overlay-figure"
      >
        <button
          type="button"
          title="Réduire la figure"
          aria-label="Réduire la figure"
          onclick={() => onAdjustFigureZoom(widget.num, -1)}
        >
          <i class="bx bx-zoom-out"></i>
        </button>
        <span class="tabular-nums px-0.5 text-[0.6rem]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          title="Agrandir la figure"
          aria-label="Agrandir la figure"
          onclick={() => onAdjustFigureZoom(widget.num, 1)}
        >
          <i class="bx bx-zoom-in"></i>
        </button>
        <span class="typst-pill-sep"></span>
        {#each [{ align: 'left', icon: 'bx-align-left', label: 'Aligner à gauche' }, { align: 'center', icon: 'bx-align-middle', label: 'Centrer' }, { align: 'right', icon: 'bx-align-right', label: 'Aligner à droite' }] as choice}
          <button
            type="button"
            title={choice.label}
            aria-label={choice.label}
            aria-pressed={figAlign === choice.align}
            class:typst-pill-active={figAlign === choice.align}
            onclick={() =>
              onSetFigureAlign(
                widget.num,
                choice.align as 'left' | 'center' | 'right',
              )}
          >
            <i class="bx {choice.icon}"></i>
          </button>
        {/each}
      </div>
    {:else}
      {@const gapInsertions = insertions[widget.num] ?? []}
      {@const hasPageBreak = gapInsertions.includes(PAGE_BREAK_SNIPPET)}
      {@const hasColumnBreak = gapInsertions.includes(COLUMN_BREAK_SNIPPET)}
      {@const hasText = gapInsertions.some(
        (snippet) =>
          snippet !== PAGE_BREAK_SNIPPET && snippet !== COLUMN_BREAK_SNIPPET,
      )}
      <!-- l'exercice qui suit ce repère est fusionné avec celui qui le
           précède : le repère est interne au groupe (un saut de page y est
           impossible à compiler, un saut de colonne ou une insertion n'y
           auraient pas de sens) — seul le bouton de séparation reste -->
      {@const isMergeGap = mergedExercises.includes(widget.num + 1)}
      {@const canMerge =
        !isMergeGap &&
        mergeExercisesEnabled &&
        widget.num >= 1 &&
        widget.num < exerciseCount}
      {@const isMulticol = multicolGroups.includes(widget.num - 1)}
      {@const canMulticol =
        !isMulticol &&
        documentColumns <= 1 &&
        widget.num >= 1 &&
        widget.num < exerciseCount &&
        !hasPageBreak &&
        !hasColumnBreak}
      <!-- ce repère précède un exercice : son bouton d'insertion vit dans la
           barre de cet exercice (kind 'exo'), juste avant les réglages ;
           seul le dernier repère (après le dernier exercice) garde le sien
           ici, faute de barre d'exercice suivante où le placer. -->
      {@const hasFollowingExo = widget.num < exerciseCount}
      <!-- un saut actif éloigne l'exercice suivant (page ou colonne d'après) :
           le repère reste au bas de l'exercice courant, donc la barre doit y
           rester aussi plutôt que remonter vers un titre qui n'est plus juste
           en dessous -->
      {@const hasBreak = hasPageBreak || hasColumnBreak}
      <!-- entre deux exercices (et avant le premier) : insertion/modification
           d'un texte ou d'un titre de section, et sauts de page/colonne. Le
           repère est au bord gauche de la page (déjà proche du bord) : on ne
           le décale que légèrement vers la gauche, et nettement vers le haut,
           pour ne pas recouvrir le titre de l'exercice qui suit — sauf
           lorsqu'un saut est actif ou après le dernier exercice (rien ne suit
           qu'on pourrait recouvrir), où la barre reste sous l'exercice. -->
      <div
        class="pointer-events-auto absolute flex -translate-x-2 {hasBreak ||
        !hasFollowingExo
          ? 'translate-y-2'
          : '-translate-y-[135%]'} items-center gap-0.5 typst-pill typst-pill-round px-1"
        class:typst-pill-idle={idle}
        class:typst-pill-current={widget.sections != null && !idle}
        class:typst-pill-force-visible={openInsertion?.space === 'exo' &&
          openInsertion.num === widget.num}
        class:z-20={openInsertion?.space === 'exo' &&
          openInsertion.num === widget.num}
        style="left: {widget.left}%; top: {widget.top}%;"
      >
        {#if !hasFollowingExo}
          <!-- fin de la fiche : ajout d'un exercice choisi dans les
               référentiels (modale de la vue Typst) -->
          <button
            type="button"
            class="typst-pill-wide"
            title="Ajouter un exercice à la fin de la fiche"
            aria-label="Ajouter un exercice à la fin de la fiche"
            data-testid="typst-overlay-add-exercise"
            onclick={onAddExercise}
          >
            <i class="bx bx-plus"></i>
            Ajouter un exercice
          </button>
          <span class="typst-pill-sep"></span>
        {/if}
        {#if !isMergeGap}
          {#if !hasFollowingExo}
            <button
              type="button"
              title="Insérer ou modifier un texte, un titre de section ou un exercice ici"
              aria-label="Insérer ou modifier un texte, un titre de section ou un exercice ici"
              aria-expanded={openInsertion?.space === 'exo' &&
                openInsertion.num === widget.num}
              data-testid="typst-overlay-insert"
              onclick={() => toggleInsertion('exo', widget.num)}
            >
              <i class="bx bx-plus-circle"></i>
            </button>
            <span class="typst-pill-sep"></span>
          {/if}
          <button
            type="button"
            title={hasPageBreak
              ? 'Retirer le saut de page'
              : 'Insérer un saut de page ici'}
            aria-label={hasPageBreak
              ? 'Retirer le saut de page'
              : 'Insérer un saut de page ici'}
            class:typst-pill-active={hasPageBreak}
            data-testid={hasPageBreak
              ? 'typst-overlay-pagebreak-active'
              : 'typst-overlay-pagebreak'}
            onclick={() => toggleBreak('exo', widget.num, PAGE_BREAK_SNIPPET)}
          >
            <i class="bx bx-arrow-to-bottom"></i>
          </button>
          <!-- saut de colonne : seulement en document multicolonne (le bouton
               actif reste visible en 1 colonne pour pouvoir le retirer) -->
          {#if hasColumnBreak || documentColumns > 1}
            <button
              type="button"
              title={hasColumnBreak
                ? 'Retirer le saut de colonne'
                : 'Insérer un saut de colonne ici'}
              aria-label={hasColumnBreak
                ? 'Retirer le saut de colonne'
                : 'Insérer un saut de colonne ici'}
              class:typst-pill-active={hasColumnBreak}
              data-testid={hasColumnBreak
                ? 'typst-overlay-colbreak-active'
                : 'typst-overlay-colbreak'}
              onclick={() =>
                toggleBreak('exo', widget.num, COLUMN_BREAK_SNIPPET)}
            >
              <i class="bx bx-arrow-to-right"></i>
            </button>
          {/if}
        {/if}
        {#if isMergeGap}
          <button
            type="button"
            title="Séparer de l'exercice précédent"
            aria-label="Séparer de l'exercice précédent"
            class="typst-pill-active"
            data-testid="typst-overlay-unmerge"
            onclick={() => onToggleMergeBefore(widget.num + 1)}
          >
            <i class="bx bx-unlink"></i>
          </button>
        {:else if canMerge}
          <span class="typst-pill-sep"></span>
          <button
            type="button"
            title={hasPageBreak || hasColumnBreak || hasText
              ? "Retirez d'abord le saut ou l'insertion pour fusionner"
              : "Fusionner avec l'exercice suivant"}
            aria-label="Fusionner avec l'exercice suivant"
            disabled={hasPageBreak || hasColumnBreak || hasText}
            data-testid="typst-overlay-merge"
            onclick={() => onToggleMergeBefore(widget.num + 1)}
          >
            <i class="bx bx-link"></i>
          </button>
        {/if}
        {#if isMulticol}
          <span class="typst-pill-sep"></span>
          <button
            type="button"
            title="Remettre en pleine largeur"
            aria-label="Séparer les exercices groupés en colonnes"
            class="typst-pill-active"
            data-testid="typst-overlay-multicol-active"
            onclick={() => onToggleMulticol(widget.num - 1)}
          >
            <i class="bx bx-arrow-to-right"></i>
          </button>
        {:else if canMulticol}
          <span class="typst-pill-sep"></span>
          <button
            type="button"
            title="Placer côte à côte avec l'exercice suivant"
            aria-label="Grouper en colonnes avec l'exercice suivant"
            data-testid="typst-overlay-multicol"
            onclick={() => onToggleMulticol(widget.num)}
          >
            <i class="bx bx-arrow-to-right"></i>
          </button>
        {/if}
        {#if !hasFollowingExo}
          {@render insertionPanel(
            'exo',
            widget.num,
            'left-1/2 -translate-x-1/2',
          )}
        {/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  /* Toolbars de la palette de mise en page, visibles par-dessus le document. */
  .typst-pill {
    background: white;
    border: 1px solid #b9d4f1;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    opacity: 0.5;
    transition: opacity 0.15s ease;
  }
  .typst-pill:hover,
  .typst-pill:focus-within,
  .typst-pill-current,
  .typst-pill-force-visible {
    opacity: 1;
  }
  /* Contrôle d'un exercice non survolé : invisible et transparent aux clics
     (on clique l'aperçu dessous), mais reste dans le DOM pour la navigation
     au clavier, qui le fait réapparaître (:focus-within). Un panneau ouvert
     (.typst-pill-force-visible) le garde affiché. */
  .typst-pill-idle:not(:focus-within):not(.typst-pill-force-visible) {
    opacity: 0;
    pointer-events: none;
  }
  .typst-pill-round {
    border-radius: 999px;
  }
  .typst-pill-box {
    border-radius: 6px;
  }
  /* Sélecteur d'enfant direct : ne doit viser que les boutons de la barre
     d'outils, pas ceux du panneau d'insertion (.typst-panel) qu'elle peut
     contenir, qui ont leurs propres couleurs. */
  .typst-pill > :global(button) {
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
  .typst-pill > :global(button:hover) {
    background: #e3eefa;
  }
  .typst-pill > :global(button:disabled) {
    color: #b0b0b0;
    cursor: default;
  }
  .typst-pill > :global(button:disabled:hover) {
    background: transparent;
  }
  /* Bouton à libellé (« Ajouter un exercice ») : les autres boutons de la
     palette sont des icônes carrées de 22 px */
  .typst-pill > :global(button.typst-pill-wide) {
    gap: 2px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }
  .typst-pill > :global(button.typst-pill-wide) > :global(i) {
    font-size: 14px;
  }
  .typst-pill-sep {
    width: 1px;
    height: 12px;
    background: #b9d4f1;
    flex-shrink: 0;
  }
  .typst-pill-divider-top {
    border-top: 1px solid #d7e6f7;
  }
  .typst-pill-active {
    background: #145a9d;
    color: white !important;
  }
  .typst-pill-active:hover {
    background: #1d76cc !important;
  }
  .typst-danger:hover {
    background: #fbe2e2 !important;
    color: #c0392b !important;
  }
  .typst-panel {
    background: white;
    border: 1px solid #b9d4f1;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
</style>
