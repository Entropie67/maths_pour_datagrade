import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs'
import { spawn } from 'node:child_process'
import { dirname, join, relative, resolve } from 'path'
import seedrandom from 'seedrandom'
import { fileURLToPath, pathToFileURL } from 'url'
import { afterAll, beforeAll, describe, it, vi } from 'vitest'
import { context } from '../../modules/context'

const SHOULD_RUN_INTERACTIF_REPORT = process.env.INTERACTIF_REPORT === '1'
const CHANGED_FILES = process.env.CHANGED_FILES
const EXERCISE_TIMEOUT_MS = Number(process.env.EXERCISE_TIMEOUT_MS ?? 10000)
const INTERACTIF_ISOLATED = process.env.INTERACTIF_ISOLATED === '1'
const EXCLUDED_EXERCISE_FILES = new Set([
  'src/exercices/apps/_ExternalApp.ts',
  'src/exercices/beta/qcmJsonGenerator.test.ts',
  'src/exercices/MetaExerciceCan.ts',
  'src/exercices/1e/1a-automatismes.ts',
])

function isExcludedExerciseFile(filePath: string): boolean {
  return (
    EXCLUDED_EXERCISE_FILES.has(filePath) ||
    /(?:^|\/)Exercice[^/]*\.ts$/.test(filePath)
  )
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const exercicesDir = join(__dirname, '../../../src/exercices')
const rootDir = join(__dirname, '../../../')
const reportsDir = join(rootDir, 'reports')
const isolatedTestFile = './report-interactif.single.test.ts'
const LOCAL_BUGSNAG_PREFIX =
  "message qui aurait été envoyé à bugsnag s'il avait été configuré"

function installDomShims() {
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    configurable: true,
    value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  })

  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    media: '',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    addListener: () => {},
    removeListener: () => {},
  } as MediaQueryList)

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => {
      return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: [] }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
      }
    },
  })
}

installDomShims()

beforeAll(() => {
  installDomShims()
})

vi.mock('../../src/lib/3d/3d_dynamique/Canvas3DElement', () => ({
  ajouteCanvas3d: vi.fn((args) => {
    return 'canvas3DElement-mock:' + args.length
  }),
}))

vi.mock('../../src/lib/3d/3d_dynamique/solidesThreeJs', () => ({
  sphericalToCartesian: vi.fn((args) => {
    return 'sphericalToCartesian-mock:' + args.length
  }),
}))

vi.mock('../../src/lib/components/version', () => ({
  fetchServerVersion: vi.fn(() => Promise.resolve('1.0.0')),
  checkForServerUpdate: vi.fn(() => Promise.resolve(false)),
}))

vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('apigeom', async (original) => {
  const real = await original()

  ;(globalThis as any).APP_VERSION = 'test'

  return real
})

const { mathaleaHandleExerciceSimple } = await import('../mathalea')

const interactifReadyRegex =
  /export const interactifReady\s*=\s*(?:true|'true'|"true")/m

function parseChangedFiles(value: string | undefined): string[] {
  if (!value) return []
  return [
    ...new Set(
      value
        .split('\n')
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ]
}

function normalizeExercisePath(filePath: string): string {
  return filePath.replaceAll('\\', '/').replace(/^\.\//, '')
}

function isRelevantExerciseFile(filePath: string): boolean {
  const normalizedPath = normalizeExercisePath(filePath)
  return (
    normalizedPath.startsWith('src/exercices/') &&
    !isExcludedExerciseFile(normalizedPath) &&
    !normalizedPath.includes('ressources') &&
    !normalizedPath.includes('apps') &&
    normalizedPath.replace('src/exercices/', '').split('/').length >= 2 &&
    /\.(ts|js)$/.test(normalizedPath)
  )
}

function getExerciseFiles(): string[] {
  const changedFiles = parseChangedFiles(CHANGED_FILES)
  if (CHANGED_FILES != null) {
    return changedFiles
      .filter(isRelevantExerciseFile)
      .map((file) => resolve(rootDir, file))
  }
  return walk(exercicesDir)
}

function walk(dir: string, result: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const entryStat = statSync(fullPath)
    if (entryStat.isDirectory()) {
      walk(fullPath, result)
      continue
    }
    if (/\.(ts|js)$/.test(entry)) {
      const relativePath = normalizeExercisePath(relative(rootDir, fullPath))
      if (isExcludedExerciseFile(relativePath)) continue
      result.push(fullPath)
    }
  }
  return result
}

function formatTagList(tags: string[]): string {
  if (tags.length === 0) return ''
  return tags.map((tag) => `[${tag}]`).join(' ')
}

function formatTableCell(value: string): string {
  return value.replace(/\s+/g, ' ').replaceAll('|', '\\|').trim()
}

interface CapturedNotification {
  message: string
  filepath: string
}

function stringifyNotificationValue(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (value == null) return ''
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function extractLocalBugsnagMessage(args: unknown[]): string | null {
  const parts = args.map(stringifyNotificationValue)
  const prefixIndex = parts.findIndex((part) =>
    part.includes(LOCAL_BUGSNAG_PREFIX),
  )

  if (prefixIndex === -1) return null

  const currentPart = parts[prefixIndex]
  const inlineSuffix = currentPart
    .slice(
      currentPart.indexOf(LOCAL_BUGSNAG_PREFIX) + LOCAL_BUGSNAG_PREFIX.length,
    )
    .replace(/^\s*:?\s*(<br>)?\s*/i, '')
    .trim()
  const trailingParts = parts
    .slice(prefixIndex + 1)
    .filter(Boolean)
    .join(' ')
    .trim()
  const message = [inlineSuffix, trailingParts].filter(Boolean).join(' ').trim()

  return message || LOCAL_BUGSNAG_PREFIX
}

function installNotificationCapture(relativePath: string) {
  const notifications: CapturedNotification[] = []
  const pushNotification = (message: unknown) => {
    const normalizedMessage = stringifyNotificationValue(message).trim()
    if (!normalizedMessage) return
    notifications.push({
      message: normalizedMessage,
      filepath: relativePath,
    })
  }

  const originalConsoleError = console.error
  console.error = (...args: unknown[]) => {
    const localBugsnagMessage = extractLocalBugsnagMessage(args)
    if (localBugsnagMessage) {
      pushNotification(localBugsnagMessage)
    }
    originalConsoleError(...args)
  }

  const globalWindow = (
    globalThis as typeof globalThis & {
      window?: Window & { notify?: unknown }
    }
  ).window

  let restoreWindowNotify = () => {}
  if (globalWindow && typeof globalWindow.notify !== 'function') {
    const previousNotify = globalWindow.notify
    globalWindow.notify = (error: unknown) => {
      pushNotification(error)
    }
    restoreWindowNotify = () => {
      if (previousNotify === undefined) {
        Reflect.deleteProperty(
          globalWindow as unknown as Record<string, unknown>,
          'notify',
        )
      } else {
        globalWindow.notify = previousNotify
      }
    }
  }

  return {
    notifications,
    restore: () => {
      console.error = originalConsoleError
      restoreWindowNotify()
    },
  }
}

function isClassExport(value: unknown): value is new (...args: any[]) => any {
  if (typeof value !== 'function') return false
  const source = Function.prototype.toString.call(value)
  return source.startsWith('class ')
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((value) => {
        clearTimeout(timeoutId)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timeoutId)
        reject(err)
      })
  })
}

async function loadAndTestExerciseFast(filePath: string): Promise<{
  file: string
  title?: string
  tags: string[]
  error?: string
  notifications?: CapturedNotification[]
} | null> {
  const absolutePath = resolve(filePath)
  const relativePath = relative(rootDir, absolutePath).replaceAll('\\', '/')

  const sourceContent = readFileSync(absolutePath, 'utf8')
  if (!interactifReadyRegex.test(sourceContent)) return null

  const capture = installNotificationCapture(relativePath)

  try {
    const module = await import(pathToFileURL(absolutePath).href)
    const ExerciceClass = module.default
    const moduleInteractifReady: boolean = module.interactifReady === true

    if (!isClassExport(ExerciceClass)) return null

    const exercice = new ExerciceClass()
    const hasGenerationMethod =
      exercice?.typeExercice === 'simple' ||
      typeof exercice?.nouvelleVersion === 'function'
    if (!hasGenerationMethod) return null

    const exerciseId = relativePath
      .replace(/^src\/exercices\//, '')
      .replace(/\.(ts|js)$/, '')
    exercice.uuid = exerciseId
    exercice.id = exercice.uuid
    exercice.interactif = true

    const previousContext = {
      isHtml: context.isHtml,
      isAmc: context.isAmc,
      isMoodle: context.isMoodle,
    }

    try {
      seedrandom('test', { global: true })
      context.isHtml = true
      context.isAmc = false
      context.isMoodle = false
      exercice.interactif = true

      if (exercice.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercice, false)
      } else if (typeof exercice.nouvelleVersion === 'function') {
        await Promise.resolve(exercice.nouvelleVersion())
      }
    } finally {
      context.isHtml = previousContext.isHtml
      context.isAmc = previousContext.isAmc
      context.isMoodle = previousContext.isMoodle
    }

    const tags: string[] = []
    if (moduleInteractifReady && !Array.isArray(exercice.autoCorrection)) {
      tags.push('autoCorrection-interactive-absente')
    } else if (
      moduleInteractifReady &&
      Array.isArray(exercice.autoCorrection) &&
      exercice.autoCorrection.length === 0
    ) {
      tags.push('autoCorrection-interactive-absente')
    }

    if (tags.length === 0 && capture.notifications.length === 0) return null

    return {
      file: relativePath,
      title: (exercice as any).titre ?? module.titre,
      tags,
      notifications:
        capture.notifications.length > 0 ? capture.notifications : undefined,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      file: relativePath,
      title: extractTitleFromSource(absolutePath),
      tags: ['erreur-runtime'],
      error: errorMsg.slice(0, 180),
      notifications:
        capture.notifications.length > 0 ? capture.notifications : undefined,
    }
  } finally {
    capture.restore()
  }
}

function extractTitleFromSource(filePath: string): string | undefined {
  try {
    const content = readFileSync(filePath, 'utf8')
    const match = content.match(
      /export\s+const\s+titre\s*=\s*['"`]([^'"`]+)['"`]/,
    )
    return match?.[1]?.trim()
  } catch {
    return undefined
  }
}

async function loadAndTestExerciseIsolated(filePath: string): Promise<{
  file: string
  title?: string
  tags: string[]
  error?: string
  notifications?: CapturedNotification[]
} | null> {
  const absolutePath = resolve(filePath)
  const relativePath = relative(rootDir, absolutePath).replaceAll('\\', '/')
  const titleFromSource = extractTitleFromSource(absolutePath)
  const outputDir = join(rootDir, '.tmp', 'interactif-report')
  mkdirSync(outputDir, { recursive: true })
  const outputFile = join(
    outputDir,
    `single-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
  )

  return await new Promise((resolve) => {
    const child = spawn('pnpm', ['vitest', isolatedTestFile, '--run'], {
      cwd: rootDir,
      env: {
        ...process.env,
        INTERACTIF_SINGLE_FILE: absolutePath,
        INTERACTIF_SINGLE_OUTPUT: outputFile,
        INTERACTIF_REPORT: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    const timeoutId = setTimeout(() => {
      child.kill('SIGKILL')
      if (existsSync(outputFile)) rmSync(outputFile, { force: true })
      resolve({
        file: relativePath,
        title: titleFromSource,
        tags: ['timeout-exercice'],
        error: `Timeout after ${EXERCISE_TIMEOUT_MS}ms`,
      })
    }, EXERCISE_TIMEOUT_MS)

    child.on('close', (code) => {
      clearTimeout(timeoutId)
      const outputExists = existsSync(outputFile)
      if (outputExists) {
        try {
          const parsed = JSON.parse(readFileSync(outputFile, 'utf8')) as {
            file: string
            title?: string
            tags: string[]
            error?: string
            notifications?: CapturedNotification[]
          } | null
          rmSync(outputFile, { force: true })
          if (parsed == null) {
            resolve(null)
            return
          }
          resolve({
            ...parsed,
            file: parsed.file || relativePath,
            title: parsed.title ?? titleFromSource,
          })
          return
        } catch {
          rmSync(outputFile, { force: true })
        }
      }

      if (code === null) {
        resolve({
          file: relativePath,
          title: titleFromSource,
          tags: ['erreur-runtime-boucle'],
          error: 'Isolated process terminated unexpectedly',
        })
        return
      }

      const errorMsg =
        stderr.trim() || stdout.trim() || `Worker exited with code ${code}`
      resolve({
        file: relativePath,
        title: titleFromSource,
        tags: ['erreur-runtime-boucle'],
        error: errorMsg.slice(0, 180),
      })
    })
  })
}

if (SHOULD_RUN_INTERACTIF_REPORT) {
  describe('Report interactif exercises', () => {
    const rows: Array<{
      file: string
      title?: string
      tags: string[]
      error?: string
      notifications?: CapturedNotification[]
    }> = []

    it('should scan and test interactive exercises', async () => {
      const files = getExerciseFiles()
      if (CHANGED_FILES != null) {
        console.log(`\n📊 Analyzing ${files.length} changed exercise files...`)
      } else {
        console.log(`\n📊 Analyzing ${files.length} exercise files...`)
      }
      console.log(
        `⚙️  Mode: ${INTERACTIF_ISOLATED ? 'isolated (safe)' : 'fast (default)'}`,
      )
      let index = 1
      for (const filePath of files) {
        const relativePath = relative(rootDir, filePath).replaceAll('\\', '/')
        if (index % 10 === 0 || index === files.length) {
          console.log(`  ▶️  [${index}/${files.length}] ${relativePath}`)
        }
        try {
          const result = INTERACTIF_ISOLATED
            ? await loadAndTestExerciseIsolated(filePath)
            : await withTimeout(
                loadAndTestExerciseFast(filePath),
                EXERCISE_TIMEOUT_MS,
              )
          if (result) {
            rows.push(result)
            if (result.error) {
              const title = result.title ? ` [${result.title}]` : ''
              console.warn(`  ⚠️  ${result.file}${title}: ${result.error}`)
            }
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err)
          const isTimeoutError =
            err instanceof Error && err.message.startsWith('Timeout after')
          rows.push({
            file: relativePath,
            tags: [
              isTimeoutError ? 'timeout-exercice' : 'erreur-runtime-boucle',
            ],
            error: errorMsg.slice(0, 100),
          })
          console.warn(`  ⚠️  ${relativePath}: ${errorMsg.slice(0, 100)}`)
        }
        if (index % 10 === 0 || index === files.length) {
          console.log(`  Processed ${index} / ${files.length} files...`)
        }
        index++
      }

      rows.sort((a, b) => a.file.localeCompare(b.file))
      console.log(`✅ Found ${rows.length} exercises with issues`)
    })

    afterAll(async () => {
      const lines: string[] = []
      lines.push('# Rapport Interactif - Analyse Runtime')
      lines.push('')
      lines.push(
        'Analyse runtime des exercices modifiés qui exportent `interactifReady = true`.',
      )
      lines.push('')
      lines.push('**Tags:**')
      lines.push(
        '- `autoCorrection-interactive-absente`: exercice interactif prêt mais `autoCorrection` reste vide après génération',
      )
      lines.push(
        '- `erreur-runtime`: erreur lors de l’instanciation ou de la génération',
      )
      lines.push(
        '- `timeout-exercice`: génération interrompue après dépassement du timeout',
      )
      lines.push('')
      lines.push('| Numéro | Fichier | Titre | Tags | Notifications Bugsnag |')
      lines.push('| --- | --- | --- | --- | --- |')
      if (rows.length === 0) {
        lines.push('')
        lines.push('_Aucun exercice avec issue._')
      } else {
        let numero = 1
        for (const row of rows) {
          const link = formatTableCell(`[${row.file}](../${row.file})`)
          const title = formatTableCell(row.title ?? '')
          const tagStr = formatTableCell(
            formatTagList(row.tags) + (row.error ? ` (${row.error})` : ''),
          )
          const notifications = row.notifications
            ?.map((notification) => notification.message)
            .map((notification) => formatTableCell(notification))
            .join(' / ')
          lines.push(
            `| ${numero++} | ${link} | ${title} | ${tagStr} | ${notifications ?? ''} |`,
          )
        }
      }

      const output = lines.join('\n') + '\n'
      mkdirSync(reportsDir, { recursive: true })
      const outputPath = join(reportsDir, 'interactif-report.md')
      writeFileSync(outputPath, output, 'utf8')
    })
  })
} else {
  describe('Report interactif exercises (disabled)', () => {
    it('is inert by default and can be enabled locally', () => {
      console.info(
        'Interactif report test is disabled. Set INTERACTIF_REPORT=1 to run it (optionally INTERACTIF_ISOLATED=1).',
      )
    })
  })
}
