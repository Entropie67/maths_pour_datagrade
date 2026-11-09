<script lang="ts">
  import JSZip from 'jszip'
  import HeaderExerciceVueProf from '../components/shared/exercice/shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte'
  import {
    humanizeScratchOpcode,
    sb3ToLatex,
    SIMULATOR_PARTIALLY_SUPPORTED_OPCODES,
    SIMULATOR_UNSUPPORTED_OPCODES,
  } from '../lib/scratch/sb3ToLatex'
  import '../lib/scratch/ScratchSimulator'

  export const titre = 'Outil Scratch : sb3 vers LaTeX (avec simulateur)'
  export const refs = {
    'fr-fr': ['P024'],
    'fr-ch': [],
  }
  export const uuid = 'outilScratch'

  export let indiceExercice
  export let indiceLastExercice

  const headerExerciceProps = {
    title: '',
    isInteractif: false,
    settingsReady: false,
    interactifReady: false,
    randomReady: false,
    correctionReady: false,
  }

  let isDragging = false
  let fileName = ''
  let latexCode = ''
  let latexHighlighted = ''
  let simulationCode = ''
  let errorMessage = ''
  let unsupportedOpcodesInFile: string[] = []
  let partiallySupportedOpcodesInFile: string[] = []
  let simulatorElement: HTMLElement | null = null

  const unsupportedOpcodeSet = new Set<string>(SIMULATOR_UNSUPPORTED_OPCODES)
  const partiallySupportedOpcodeSet = new Set<string>(
    SIMULATOR_PARTIALLY_SUPPORTED_OPCODES,
  )

  function extractOpcodesFromProject(projectJsonRaw: string): string[] {
    try {
      const project = JSON.parse(projectJsonRaw)
      const opcodes = new Set<string>()

      if (!Array.isArray(project?.targets)) {
        return []
      }

      for (const target of project.targets) {
        if (!target || typeof target !== 'object') continue
        const blocks = target.blocks
        if (!blocks || typeof blocks !== 'object') continue

        for (const block of Object.values(blocks as Record<string, unknown>)) {
          const opcode =
            block && typeof block === 'object'
              ? (block as { opcode?: unknown }).opcode
              : undefined
          if (typeof opcode === 'string' && opcode.length > 0) {
            opcodes.add(opcode)
          }
        }
      }

      return [...opcodes].sort()
    } catch {
      return []
    }
  }

  function formatOpcodeList(opcodes: string[]): string {
    return opcodes
      .map((opcode) => `${humanizeScratchOpcode(opcode)} (${opcode})`)
      .join(', ')
  }

  function escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }

  function highlightLatex(code: string): string {
    let html = escapeHtml(code)
    html = html.replace(
      /(%.*)$/gm,
      '<span class="text-emerald-600 dark:text-emerald-400">$1</span>',
    )
    html = html.replace(
      /(\\[a-zA-Z@*]+(?:\[[^\]]*\])?)/g,
      '<span class="text-violet-700 dark:text-violet-300 font-semibold">$1</span>',
    )
    html = html.replace(
      /([{}])/g,
      '<span class="text-orange-600 dark:text-orange-300">$1</span>',
    )
    return html
  }

  function extractScratchPrograms(latex: string): string[] {
    const matches = latex.match(/\\begin\{scratch\}[\s\S]*?\\end\{scratch\}/g)
    return matches ?? []
  }

  async function readProjectJsonFromSb3(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)
    const projectEntry = zip.file('project.json')
    if (!projectEntry) {
      throw new Error("Le fichier .sb3 ne contient pas d'entrée project.json")
    }
    return await projectEntry.async('string')
  }

  async function processFile(file: File): Promise<void> {
    fileName = file.name
    errorMessage = ''
    unsupportedOpcodesInFile = []
    partiallySupportedOpcodesInFile = []

    try {
      const lowerName = file.name.toLowerCase()
      let projectJsonRaw = ''

      if (lowerName.endsWith('.sb3')) {
        projectJsonRaw = await readProjectJsonFromSb3(file)
      } else if (lowerName.endsWith('.json')) {
        projectJsonRaw = await file.text()
      } else {
        throw new Error(
          'Type de fichier non supporté. Déposez un .json ou un .sb3',
        )
      }

      const latex = sb3ToLatex(projectJsonRaw)
      latexCode = latex
      latexHighlighted = highlightLatex(latex)

      const usedOpcodes = extractOpcodesFromProject(projectJsonRaw)
      unsupportedOpcodesInFile = usedOpcodes.filter((opcode) =>
        unsupportedOpcodeSet.has(opcode),
      )
      partiallySupportedOpcodesInFile = usedOpcodes.filter((opcode) =>
        partiallySupportedOpcodeSet.has(opcode),
      )

      const programs = extractScratchPrograms(latex)
      simulationCode = programs.join('\n\n')

      if (!simulationCode) {
        throw new Error(
          "Conversion réussie, mais aucun bloc \\begin{scratch}...\\end{scratch} n'a été détecté",
        )
      }
    } catch (error) {
      latexCode = ''
      latexHighlighted = ''
      simulationCode = ''
      unsupportedOpcodesInFile = []
      partiallySupportedOpcodesInFile = []
      errorMessage =
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue pendant la conversion'
    }
  }

  async function onInputChange(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    await processFile(file)
  }

  async function onDrop(event: DragEvent): Promise<void> {
    event.preventDefault()
    isDragging = false
    const file = event.dataTransfer?.files?.[0]
    if (!file) return
    await processFile(file)
  }

  function onDragOver(event: DragEvent): void {
    event.preventDefault()
    isDragging = true
  }

  function onDragLeave(): void {
    isDragging = false
  }

  function openStepByStepSimulation(): void {
    const button = simulatorElement?.querySelector('button')
    button?.click()
  }
</script>

<div class="text-coopmaths-corpus dark:text-coopmathsdark-corpus">
  <HeaderExerciceVueProf
    {indiceExercice}
    {indiceLastExercice}
    id="outilScratch"
    {...headerExerciceProps}
  />

  <section class="space-y-4">
    <div
      class="rounded-xl border-2 border-dashed p-6 transition-colors duration-150 {isDragging
        ? 'border-coopmaths-action bg-base-200'
        : 'border-base-300 bg-base-100'}"
      on:drop={onDrop}
      on:dragover={onDragOver}
      on:dragleave={onDragLeave}
      role="button"
      tabindex="0"
      aria-label="Zone de dépôt Scratch"
    >
      <p class="mb-3 text-sm">
        Déposez ici un fichier <strong>project.json</strong> ou un fichier
        <strong>.sb3</strong> exporté depuis Scratch.
      </p>
      <input
        type="file"
        class="file-input file-input-bordered w-full max-w-lg"
        accept=".json,.sb3,application/json"
        on:change={onInputChange}
      />
      {#if fileName}
        <p class="mt-2 text-sm opacity-80">Fichier chargé : {fileName}</p>
      {/if}
    </div>

    <div class="alert alert-warning text-sm">
      <span>
        Le simulateur Scratch est encore expérimental et ne couvre pas 100% des
        programmes Scratch. Si vous rencontrez un script non supporté, vous
        pouvez l'envoyer à
        <a
          class="link link-hover font-semibold"
          href="mailto:contact@coopmaths.fr">contact@coopmaths.fr</a
        >
        ou créer un ticket sur le dépôt du projet en joignant votre fichier
        <strong>.sb3</strong>
        :
        <a
          class="link link-hover font-semibold"
          href="https://forge.apps.education.fr/coopmaths/mathalea/-/issues/new"
          target="_blank"
          rel="noopener noreferrer">Créer un ticket</a
        >.
      </span>
    </div>

    {#if errorMessage}
      <div class="alert alert-error">
        <span>{errorMessage}</span>
      </div>
    {/if}

    {#if latexCode}
      <div class="space-y-3">
        {#if unsupportedOpcodesInFile.length > 0 || partiallySupportedOpcodesInFile.length > 0}
          <div class="alert alert-warning text-sm">
            <div class="space-y-2">
              <p>
                Certains blocs de ce programme ne sont pas encore totalement
                supportés par le simulateur.
              </p>
              {#if unsupportedOpcodesInFile.length > 0}
                <p>
                  <strong>Non supportés :</strong>
                  {formatOpcodeList(unsupportedOpcodesInFile)}
                </p>
              {/if}
              {#if partiallySupportedOpcodesInFile.length > 0}
                <p>
                  <strong>Partiellement supportés :</strong>
                  {formatOpcodeList(partiallySupportedOpcodesInFile)}
                </p>
              {/if}
            </div>
          </div>
        {/if}

        <div class="flex flex-wrap items-center gap-2">
          <button
            class="btn btn-primary btn-sm"
            type="button"
            on:click={openStepByStepSimulation}
            disabled={!simulationCode}
          >
            simulation pas à pas
          </button>
        </div>

        <div class="rounded-lg border border-base-300 bg-base-100 p-3">
          <pre
            class="max-h-128 overflow-auto whitespace-pre-wrap wrap-break-word text-sm leading-6"><code
              ><!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html latexHighlighted}</code
            ></pre>
        </div>

        <div class="hidden">
          <scratch-simulator
            bind:this={simulatorElement}
            delay="600"
            code={simulationCode}
            debug-mapping="false"
          ></scratch-simulator>
        </div>
      </div>
    {/if}
  </section>
</div>
