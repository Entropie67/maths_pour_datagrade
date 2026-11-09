import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs'
import { dirname, join, relative, resolve } from 'path'
import seedrandom from 'seedrandom'
import { fileURLToPath, pathToFileURL } from 'url'
import { afterAll, beforeAll, describe, it, vi } from 'vitest'
import { context } from '../../modules/context'
import type { IExercice } from '../types'

vi.mock('../../src/lib/components/version', () => ({
  fetchServerVersion: vi.fn(() => Promise.resolve('1.0.0')),
  checkForServerUpdate: vi.fn(() => Promise.resolve(false)),
}))

function installDomShims() {
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    configurable: true,
    value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  })

  const matchMediaMock = vi.fn().mockReturnValue({
    matches: false,
    media: '',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    addListener: () => {},
    removeListener: () => {},
  } as MediaQueryList)
  window.matchMedia = matchMediaMock

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => ({
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
    }),
  })
}

installDomShims()

beforeAll(() => {
  installDomShims()
})

const { mathaleaHandleExerciceSimple } = await import('../mathalea')

const SHOULD_RUN_AMCNUM_REPORT = process.env.AMCNUM_REPORT === '1'
const CHANGED_FILES = process.env.CHANGED_FILES

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const exercicesDir = join(__dirname, '../../../src/exercices')
const rootDir = join(__dirname, '../../..')
const reportsDir = join(rootDir, 'reports')
const LOCAL_BUGSNAG_PREFIX =
  "message qui aurait été envoyé à bugsnag s'il avait été configuré"

const amcReadyRegex = /export const amcReady\s*=\s*(?:true|'true'|"true")/m
const amcNumRegex = /export const amcType\s*=\s*(?:'AMCNum'|"AMCNum")/m
const matcher = '' // Permet de limiter le scope du test pendant le développement

function parseChangedFiles(value: string | undefined): string[] {
  if (value == null) return []
  return [
    ...new Set(
      value
        .split('\n')
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ]
}

function isRelevantExerciseFile(filePath: string): boolean {
  return (
    filePath.startsWith('src/exercices/') &&
    !filePath.includes('ressources') &&
    !filePath.includes('apps') &&
    filePath.replace('src/exercices/', '').split('/').length >= 2 &&
    /\.(ts|js)$/.test(filePath)
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
    if (/\.(ts|js)$/.test(entry) && fullPath.includes(matcher)) {
      result.push(fullPath)
    }
  }
  return result
}

function hasValidAutoCorrectionAmc(exercice: IExercice): boolean {
  if (
    !Array.isArray(exercice.autoCorrectionAMC) ||
    exercice.autoCorrectionAMC.length === 0
  ) {
    return false
  }
  const item = exercice.autoCorrectionAMC[0]
  if (
    item &&
    item.reponse &&
    item.reponse.valeur !== undefined &&
    item.reponse.param
  ) {
    return true
  }

  return false
}

function hasAutoCorrection(exercice: IExercice): boolean {
  return (
    Array.isArray(exercice.autoCorrection) && exercice.autoCorrection.length > 0
  )
}

function formatTagList(tags: string[]): string {
  if (tags.length === 0) return ''
  return tags.map((tag) => `[${tag}]`).join(' ')
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
    .replace(/^\s*:?[\s]*(<br>)?\s*/i, '')
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
    globalWindow.notify = (message: unknown) => {
      pushNotification(message)
    }
    restoreWindowNotify = () => {
      if (previousNotify === undefined) {
        const notifyHolder = globalWindow as { notify?: unknown }
        delete notifyHolder.notify
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

async function loadAndTestExercise(filePath: string): Promise<{
  file: string
  tags: string[]
  error?: string
  notifications?: CapturedNotification[]
} | null> {
  const content = readFileSync(filePath, 'utf8')
  if (!amcReadyRegex.test(content) || !amcNumRegex.test(content)) {
    return null
  }

  const tags: string[] = []
  const relativePath = relative(rootDir, filePath).replaceAll('\\', '/')
  const capture = installNotificationCapture(relativePath)

  try {
    // Charger le module dynamiquement depuis le chemin absolu
    const oldRegex = /(old|Old|OLD)/i
    if (oldRegex.test(relativePath)) {
      return null
    }

    const module = await import(pathToFileURL(resolve(filePath)).href)

    const ExerciceClass = module.default
    if (!ExerciceClass) {
      return {
        file: relativePath,
        tags: ['class-export-manquante'],
        error: 'No default export',
        notifications:
          capture.notifications.length > 0 ? capture.notifications : undefined,
      }
    }

    // Instancier l'exercice
    const exercice: IExercice = new ExerciceClass()

    // Configurer seedrandom
    seedrandom('test', { global: true })

    // Générer des questions
    context.isAmc = true
    context.isHtml = false

    if (exercice.typeExercice === 'simple') {
      mathaleaHandleExerciceSimple(exercice, false)
    } else if (typeof exercice.nouvelleVersion === 'function') {
      exercice.nouvelleVersion()
    }

    // Analyser les résultats
    const hasValidAmc = hasValidAutoCorrectionAmc(exercice)
    if (!hasValidAmc) {
      tags.push('autoCorrectionAMC-manquante-ou-incomplete')

      context.isHtml = true
      context.isAmc = false
      exercice.interactif = false
      if (exercice.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercice, false)
      } else if (typeof exercice.nouvelleVersion === 'function') {
        exercice.nouvelleVersion()
      }
      const hasHtmlCorrection = hasAutoCorrection(exercice)
      if (!hasHtmlCorrection) {
        tags.push('autoCorrection-html-absente')
      }

      exercice.interactif = true
      if (exercice.typeExercice === 'simple') {
        mathaleaHandleExerciceSimple(exercice, false)
      } else if (typeof exercice.nouvelleVersion === 'function') {
        exercice.nouvelleVersion()
      }

      const hasHtmlCorrectionInteractif = hasAutoCorrection(exercice)
      if (!hasHtmlCorrectionInteractif) {
        tags.push('autoCorrection-html-absente(interactif true)')
      }
    }
    if (tags.length === 0 && capture.notifications.length === 0) return null

    return {
      file: relativePath,
      tags,
      notifications:
        capture.notifications.length > 0 ? capture.notifications : undefined,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      file: relativePath,
      tags: ['erreur-runtime'],
      error: errorMsg.slice(0, 100),
      notifications:
        capture.notifications.length > 0 ? capture.notifications : undefined,
    }
  } finally {
    capture.restore()
  }
}

if (SHOULD_RUN_AMCNUM_REPORT) {
  describe('Report AMCNum exercises', () => {
    const rows: Array<{
      file: string
      tags: string[]
      error?: string
      notifications?: CapturedNotification[]
    }> = []

    it('should scan and test relevant AMCNum exercises', async () => {
      const files = getExerciseFiles()
      if (CHANGED_FILES != null) {
        console.log(`\n📊 Analyzing ${files.length} changed exercise files...`)
      } else {
        console.log(`\n📊 Analyzing ${files.length} exercise files...`)
      }

      for (const filePath of files) {
        const result = await loadAndTestExercise(filePath)
        if (result) {
          rows.push(result)
          if (result.error) {
            console.warn(`  ⚠️  ${result.file}: ${result.error}`)
          }
        }
      }

      rows.sort((a, b) => a.file.localeCompare(b.file))
      console.log(`✅ Found ${rows.length} exercises with issues`)
    })

    afterAll(async () => {
      if (rows.length === 0) return

      const lines: string[] = []
      lines.push('# Rapport AMCNum - Analyse Runtime')
      lines.push('')
      lines.push(
        'Analyse runtime des exercices qui exportent `amcReady = true` et `amcType = AMCNum`.',
      )
      lines.push('')
      lines.push('**Tags:**')
      lines.push(
        "- `autoCorrectionAMC-manquante-ou-incomplete`: autoCorrectionAMC n'est pas remplie avec la structure attendue {reponse: {valeur, param}}",
      )
      lines.push(
        "- `autoCorrection-html-absente`: autoCorrection HTML n'est pas remplie",
      )
      lines.push(
        "- `erreur-runtime`: erreur lors de l'instanciation ou exécution",
      )
      lines.push("- `class-export-manquante`: pas d'export default")
      lines.push('')
      lines.push('| Numéro | Fichier | Tags | Notifications bugsnag |')
      lines.push('| --- | --- | --- | --- |')
      let numero = 1
      for (const row of rows) {
        const link = `[${row.file}](../${row.file})`
        const tagStr =
          formatTagList(row.tags) + (row.error ? ` (${row.error})` : '')
        const notifStr = row.notifications
          ? [
              ...new Set(
                row.notifications.map((notification) => notification.message),
              ),
            ]
              .map((message) => message.replaceAll('|', '\\|'))
              .join(' / ')
          : ''
        lines.push(`| ${numero++} | ${link} | ${tagStr} | ${notifStr} |`)
      }

      const output = lines.join('\n') + '\n'
      mkdirSync(reportsDir, { recursive: true })
      const outputPath = join(reportsDir, 'amcnum-report.md')
      writeFileSync(outputPath, output, 'utf8')
    })
  })
} else {
  describe('Report AMCNum exercises (disabled)', () => {
    it('is inert by default and can be enabled locally', () => {
      console.info(
        'AMCNum report test is disabled. Set AMCNUM_REPORT=1 to run it locally, or provide CHANGED_FILES in CI.',
      )
    })
  })
}
