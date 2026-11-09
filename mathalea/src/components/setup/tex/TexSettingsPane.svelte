<script lang="ts">
  import { buildExamExercices } from '../../../lib/LatexGroup'
  import type {
    ExamConfig,
    ExerciceConfig,
    ExerciceLayoutConfig,
    FontFamily,
    LatexFileInfos,
  } from '../../../lib/LatexTypes'
  import type { IExercice, IExerciceStatique } from '../../../lib/types'
  import TexExerciseSettings from './TexExerciseSettings.svelte'

  /**
   * Volet « Réglages du document » de la vue LaTeX.
   *
   * Les réglages sont ceux de `LatexFileInfos`, partagés avec la vue PDF :
   * une fiche réglée ici peut être rouverte là-bas à l'identique.
   *
   * Chaque modification appelle `onChange`, à charge pour la vue de
   * régénérer le code et de le persister — le volet ne connaît ni l'éditeur
   * ni le compilateur.
   */

  let {
    latexFileInfos = $bindable(),
    compileEngine = $bindable(),
    exercises = [],
    onChange,
    onClose,
    onReset,
    onEngineChange,
  }: {
    latexFileInfos: LatexFileInfos
    /** Moteur de compilation ; réglage de la vue, pas du document (pas de `onChange`) */
    compileEngine: 'coopmaths' | 'texlive'
    exercises?: (IExercice | IExerciceStatique)[]
    onChange: () => void
    onClose: () => void
    onReset: () => void
    onEngineChange: () => void
  } = $props()

  /** Habillages de fiche proposés (`Latex.getContentsForAVersion`) */
  const STYLE_OPTIONS: { value: LatexFileInfos['style']; label: string }[] = [
    { value: 'Coopmaths', label: 'Coopmaths' },
    { value: 'Classique', label: 'Classique' },
    { value: 'ProfMaquette', label: 'ProfMaquette' },
    { value: 'ProfMaquetteQrcode', label: 'ProfMaquette + QR-code' },
    { value: 'Can', label: 'Course aux nombres' },
  ]

  /**
   * Les modèles d'examen (page de garde, barème) sont produits par
   * `ExamTemplateEngine`, que `Latex.getContents` n'appelle que pour les
   * habillages ProfMaquette.
   */
  const isProfMaquette = $derived(
    latexFileInfos.style === 'ProfMaquette' ||
      latexFileInfos.style === 'ProfMaquetteQrcode',
  )
  const isCan = $derived(latexFileInfos.style === 'Can')

  const examConfig = $derived(latexFileInfos.examConfig)

  /** Titre par défaut d'un modèle, proposé à la première sélection */
  const EXAM_DEFAULTS: Record<
    'Brevet' | 'Bac' | 'DS',
    { titre: string; duree: string; matiere: string; autorisation: string }
  > = {
    Brevet: {
      titre: 'Brevet des collèges',
      duree: '2 heures',
      matiere: 'MATHÉMATIQUES',
      autorisation: "L'usage de la calculatrice est autorisé.",
    },
    Bac: {
      titre: 'Baccalauréat',
      duree: '4 heures',
      matiere: 'MATHÉMATIQUES',
      autorisation: "L'usage de la calculatrice est autorisé.",
    },
    DS: {
      titre: 'Devoir surveillé',
      duree: '1 heure',
      matiere: 'MATHÉMATIQUES',
      autorisation: '',
    },
  }

  /** Session courante, au format « Mars 2026 » */
  function currentSession(): string {
    const date = new Date()
    const mois = date.toLocaleDateString('fr-FR', { month: 'long' })
    return `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${date.getFullYear()}`
  }

  /**
   * Prépare (ou efface) la configuration d'examen quand on change de modèle.
   * Les barèmes sont initialisés à partir des groupes d'exercices, comme dans
   * la vue PDF.
   */
  function applyModele() {
    const modele = latexFileInfos.modele
    if (modele === undefined || modele === 'aucun') {
      latexFileInfos.examConfig = undefined
      onChange()
      return
    }
    const defaults = EXAM_DEFAULTS[modele]
    const previous = latexFileInfos.examConfig
    latexFileInfos.examConfig = {
      type: modele,
      titre: previous?.titre || defaults.titre,
      session: previous?.session || currentSession(),
      matiere: previous?.matiere || defaults.matiere,
      duree: previous?.duree || defaults.duree,
      autorisation: previous?.autorisation || defaults.autorisation,
      exercices:
        previous?.exercices ?? buildExamExercices(exercises, latexFileInfos),
    }
    onChange()
  }

  function addExamExercice() {
    if (examConfig == null) return
    examConfig.exercices = [...(examConfig.exercices ?? []), { points: 1 }]
    onChange()
  }

  function removeExamExercice(index: number) {
    if (examConfig == null) return
    examConfig.exercices = (examConfig.exercices ?? []).filter(
      (_: ExerciceConfig, i: number) => i !== index,
    )
    onChange()
  }

  const totalPoints = $derived(
    (examConfig?.exercices ?? []).reduce(
      (sum: number, exo: ExerciceConfig) => sum + Number(exo.points || 0),
      0,
    ),
  )

  const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
    { value: 'Defaut', label: 'Par défaut' },
    { value: 'Fira', label: 'Fira Sans' },
    { value: 'lmodern', label: 'Latin Modern Sans' },
    { value: 'tgheros', label: 'TeX Gyre Heros' },
  ]

  /** Marges par défaut proposées quand on ouvre le réglage */
  const DEFAULT_MARGINS = { left: 1.5, right: 1.5, top: 2, bottom: 2 }

  const hasCustomMargins = $derived(latexFileInfos.margins != null)

  function toggleMargins(enabled: boolean) {
    latexFileInfos.margins = enabled ? { ...DEFAULT_MARGINS } : undefined
    onChange()
  }

  /** Exercice dont on règle la mise en page (index dans la fiche) */
  let selectedExercise = $state(0)

  /** Titres des exercices, pour le sélecteur du panneau par exercice */
  const exerciseChoices = $derived(
    exercises.map((exercise, index) => ({
      titre:
        'titre' in exercise && typeof exercise.titre === 'string'
          ? exercise.titre
          : '',
      index,
    })),
  )

  /** Réglages de l'exercice choisi, en lecture seule */
  const selectedConfig = $derived(
    latexFileInfos.exos?.[String(selectedExercise)] ?? {},
  )

  /**
   * Écrit un réglage de l'exercice choisi. `exos` ne retient que les
   * exercices effectivement réglés : l'entrée est créée à la première
   * valeur, et retirée dès qu'il n'en reste aucune.
   */
  function setExerciseValue<K extends keyof ExerciceLayoutConfig>(
    key: K,
    value: ExerciceLayoutConfig[K] | undefined,
  ) {
    const exoKey = String(selectedExercise)
    const exos = latexFileInfos.exos ?? {}
    const config = { ...exos[exoKey] }
    if (value === undefined) delete config[key]
    else config[key] = value
    if (Object.keys(config).length === 0) delete exos[exoKey]
    else exos[exoKey] = config
    latexFileInfos.exos = exos
    onChange()
  }

  /** Renseigné pour que `examConfig` soit typé même quand il est absent */
  const emptyExam: ExamConfig = {
    type: '',
    titre: '',
    session: '',
    matiere: '',
    duree: '',
    autorisation: '',
  }
</script>

<div
  class="tex-settings-pane relative z-10 w-80 shrink-0 overflow-y-auto border-r border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas text-coopmaths-corpus dark:text-coopmathsdark-corpus p-5 space-y-4"
>
  <div class="flex items-center justify-between">
    <h3 class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">
      Réglages du document
    </h3>
    <button type="button" aria-label="Fermer les réglages" onclick={onClose}>
      <i
        class="bx bx-x text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
      ></i>
    </button>
  </div>

  <!-- ------------------------------------------------------ mise en page -->
  <h4
    class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
  >
    Mise en page
  </h4>

  <label class="flex items-center justify-between gap-4 text-sm">
    Habillage
    <select
      class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      bind:value={latexFileInfos.style}
      onchange={onChange}
    >
      {#each STYLE_OPTIONS as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </label>

  {#if isProfMaquette}
    <label class="flex items-center justify-between gap-4 text-sm">
      Type de fiche
      <select
        class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
        bind:value={latexFileInfos.typeFiche}
        onchange={onChange}
      >
        <option value="Fiche">Fiche</option>
        <option value="Eval">Évaluation</option>
      </select>
    </label>

    <label class="flex items-center justify-between gap-4 text-sm">
      Titres des exercices
      <select
        class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
        bind:value={latexFileInfos.titleOption}
        onchange={onChange}
      >
        <option value="SansTitre">Sans titre</option>
        <option value="AvecTitre">Avec titre</option>
      </select>
    </label>

    <label class="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={latexFileInfos.qrcodeOption === 'AvecQrcode'}
        onchange={(event) => {
          latexFileInfos.qrcodeOption = event.currentTarget.checked
            ? 'AvecQrcode'
            : 'SansQrcode'
          onChange()
        }}
      />
      QR-code vers l'exercice
    </label>
  {/if}

  {#if !isCan}
    <div class="flex items-center justify-between gap-4 text-sm">
      <label for="tex-columns-input">Colonnes de la fiche</label>
      <input
        id="tex-columns-input"
        type="number"
        min="1"
        max="4"
        step="1"
        class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
        value={latexFileInfos.globalColumns ?? 1}
        onchange={(event) => {
          const columns = Number(event.currentTarget.value)
          latexFileInfos.globalColumns = columns > 1 ? columns : undefined
          onChange()
        }}
      />
    </div>
  {/if}

  <label class="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={latexFileInfos.blackAndWhite === true}
      onchange={(event) => {
        latexFileInfos.blackAndWhite = event.currentTarget.checked
        onChange()
      }}
    />
    Forcer le noir et blanc
  </label>

  <label class="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={hasCustomMargins}
      onchange={(event) => toggleMargins(event.currentTarget.checked)}
    />
    Choisir les marges
  </label>

  {#if latexFileInfos.margins != null}
    {@const margins = latexFileInfos.margins}
    <div class="grid grid-cols-2 gap-2 text-sm">
      {#each [{ key: 'left', label: 'Gauche' }, { key: 'right', label: 'Droite' }, { key: 'top', label: 'Haut' }, { key: 'bottom', label: 'Bas' }] as side}
        <div class="flex items-center justify-between gap-1">
          <label for="tex-margin-{side.key}">{side.label}</label>
          <input
            id="tex-margin-{side.key}"
            type="number"
            min="0"
            max="10"
            step="0.25"
            class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
            value={margins[side.key as keyof typeof margins]}
            onchange={(event) => {
              margins[side.key as keyof typeof margins] = Number(
                event.currentTarget.value,
              )
              onChange()
            }}
          />
        </div>
      {/each}
    </div>
    <p class="text-xs opacity-70">En centimètres.</p>
  {/if}

  {#if isCan}
    <label class="flex items-center justify-between gap-4 text-sm">
      Durée de l'épreuve
      <input
        type="text"
        class="w-24 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
        bind:value={latexFileInfos.durationCanOption}
        onchange={onChange}
      />
    </label>
  {/if}

  <!-- ------------------------------------------------------------ en-tête -->
  <h4
    class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
  >
    En-tête
  </h4>

  <label class="flex flex-col gap-1 text-sm">
    Titre
    <input
      type="text"
      class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      bind:value={latexFileInfos.title}
      onchange={onChange}
    />
  </label>

  <label class="flex flex-col gap-1 text-sm">
    Sous-titre
    <input
      type="text"
      class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      bind:value={latexFileInfos.subtitle}
      onchange={onChange}
    />
  </label>

  <label class="flex flex-col gap-1 text-sm">
    Référence (classe, niveau…)
    <input
      type="text"
      class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      bind:value={latexFileInfos.reference}
      onchange={onChange}
    />
  </label>

  <!-- ------------------------------------------------------------ contenu -->
  <h4
    class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
  >
    Contenu
  </h4>

  <label class="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={latexFileInfos.correctionOption === 'AvecCorrection'}
      onchange={(event) => {
        latexFileInfos.correctionOption = event.currentTarget.checked
          ? 'AvecCorrection'
          : 'SansCorrection'
        onChange()
      }}
    />
    Afficher la correction
  </label>

  <label class="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={latexFileInfos.withReferences === true}
      onchange={(event) => {
        latexFileInfos.withReferences = event.currentTarget.checked
        onChange()
      }}
    />
    Afficher l'identifiant des exercices
  </label>

  <div class="flex items-center justify-between gap-4 text-sm">
    <label for="tex-versions-input">Nombre de versions</label>
    <input
      id="tex-versions-input"
      type="number"
      min="1"
      max="8"
      step="1"
      class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      bind:value={latexFileInfos.nbVersions}
      onchange={onChange}
    />
  </div>

  <label class="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={latexFileInfos.showVersionInHeader ??
        latexFileInfos.nbVersions > 1}
      onchange={(event) => {
        latexFileInfos.showVersionInHeader = event.currentTarget.checked
        onChange()
      }}
    />
    Numéro de version dans l'en-tête
  </label>

  <!-- ------------------------------------------------------------- police -->
  <h4
    class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
  >
    Police
  </h4>

  <label class="flex items-center gap-2 text-sm cursor-pointer">
    <input
      type="checkbox"
      checked={latexFileInfos.fontOption === 'DysFont'}
      onchange={(event) => {
        latexFileInfos.fontOption = event.currentTarget.checked
          ? 'DysFont'
          : 'StandardFont'
        onChange()
      }}
    />
    Police adaptée aux dys
  </label>

  <label class="flex items-center justify-between gap-4 text-sm">
    Famille
    <select
      class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      value={latexFileInfos.fontFamily ?? 'Defaut'}
      onchange={(event) => {
        latexFileInfos.fontFamily = event.currentTarget.value as FontFamily
        onChange()
      }}
    >
      {#each FONT_OPTIONS as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </label>

  <div class="flex items-center justify-between gap-4 text-sm">
    <label for="tex-fontsize-input">Taille</label>
    {#if latexFileInfos.fontOption === 'DysFont'}
      <input
        id="tex-fontsize-input"
        type="number"
        min="8"
        max="24"
        step="1"
        class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
        bind:value={latexFileInfos.dysTailleFontOption}
        onchange={onChange}
      />
    {:else}
      <input
        id="tex-fontsize-input"
        type="number"
        min="8"
        max="24"
        step="1"
        class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
        bind:value={latexFileInfos.tailleFontOption}
        onchange={onChange}
      />
    {/if}
  </div>

  <!-- --------------------------------------------------- modèle d'examen -->
  <h4
    class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
  >
    Modèles d'épreuve
  </h4>

  {#if !isProfMaquette}
    <p class="text-xs opacity-70">
      Les modèles d'épreuve (page de garde, barème) demandent un habillage
      ProfMaquette.
    </p>
  {:else}
    <label class="flex items-center justify-between gap-4 text-sm">
      Modèle
      <select
        class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
        bind:value={latexFileInfos.modele}
        onchange={applyModele}
      >
        <option value="aucun">Aucun</option>
        <option value="Brevet">Brevet</option>
        <option value="Bac">Bac</option>
        <option value="DS">Devoir surveillé</option>
      </select>
    </label>

    {#if examConfig != null}
      {@const exam = examConfig ?? emptyExam}
      <label class="flex flex-col gap-1 text-sm">
        Intitulé
        <input
          type="text"
          class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
          bind:value={exam.titre}
          onchange={onChange}
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Session
        <input
          type="text"
          class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
          bind:value={exam.session}
          onchange={onChange}
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Matière
        <input
          type="text"
          class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
          bind:value={exam.matiere}
          onchange={onChange}
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Durée
        <input
          type="text"
          class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
          bind:value={exam.duree}
          onchange={onChange}
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Autorisation
        <textarea
          rows="2"
          class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
          bind:value={exam.autorisation}
          onchange={onChange}
        ></textarea>
      </label>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-sm">
          <span>Barème</span>
          <span class="text-xs opacity-70">Total : {totalPoints} pts</span>
        </div>
        {#each exam.exercices ?? [] as exo, index (index)}
          <div class="flex items-center gap-2 text-sm">
            <label class="grow" for="tex-points-{index}">
              Exercice {index + 1}
            </label>
            <input
              id="tex-points-{index}"
              type="number"
              step="0.5"
              min="0"
              class="w-16 rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
              bind:value={exo.points}
              onchange={onChange}
            />
            <button
              type="button"
              aria-label="Retirer l'exercice {index + 1} du barème"
              class="text-coopmaths-action dark:text-coopmathsdark-action"
              onclick={() => removeExamExercice(index)}
            >
              <i class="bx bx-x text-lg"></i>
            </button>
          </div>
        {/each}
        <button
          type="button"
          class="text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action"
          onclick={addExamExercice}
        >
          <i class="bx bx-plus"></i> Ajouter une ligne au barème
        </button>
      </div>
    {/if}
  {/if}

  <!-- ------------------------------------------------ réglages par exercice -->
  <h4
    class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
  >
    Réglages exercice par exercice
  </h4>

  {#if exerciseChoices.length === 0}
    <p class="text-xs opacity-70">La fiche ne contient aucun exercice.</p>
  {:else}
    <TexExerciseSettings
      exercises={exerciseChoices}
      bind:selected={selectedExercise}
      config={selectedConfig}
      onSet={setExerciseValue}
      supportsFraming={!isProfMaquette}
    />
  {/if}

  <!-- ------------------------------------------------------- compilation -->
  <!-- Réglage de la vue (comment compiler), pas de la fiche elle-même : sans
       effet sur le code ni sur `onChange`. -->
  <h4
    class="pt-2 text-xs font-semibold uppercase tracking-wide opacity-70 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
  >
    Compilation
  </h4>

  <label class="flex items-center justify-between gap-4 text-sm">
    Moteur
    <select
      class="rounded border-coopmaths-action bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark py-0.5 text-sm"
      bind:value={compileEngine}
      title="Coopmaths : PDF et erreurs récupérés directement. texlive.net : comme sur la vue LaTeX, l'aperçu affiche le résultat renvoyé par le service, erreurs comprises."
      onchange={onEngineChange}
    >
      <option value="coopmaths">Coopmaths</option>
      <option value="texlive">texlive.net</option>
    </select>
  </label>

  <div
    class="pt-3 border-t border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
  >
    <button
      type="button"
      class="text-sm text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action"
      onclick={onReset}
    >
      <i class="bx bx-reset"></i> Réinitialiser les réglages
    </button>
  </div>
</div>
