import { writeFileSync } from 'fs'
import { dirname, relative, resolve } from 'path'
import seedrandom from 'seedrandom'
import { fileURLToPath, pathToFileURL } from 'url'
import { beforeAll, describe, it, vi } from 'vitest'
import { context } from '../../modules/context'
import type { IExercice } from '../types'

declare global {
  interface Window {
    notify: (message: string, objet: unknown) => void
  }
}

const TARGET_FILE = process.env.INTERACTIF_SINGLE_FILE
const OUTPUT_FILE = process.env.INTERACTIF_SINGLE_OUTPUT

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '../..')
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
  ;(globalThis as { APP_VERSION?: string }).APP_VERSION = 'test'
  return real
})

const { mathaleaHandleExerciceSimple } = await import('../mathalea')

function hasAutoCorrection(exercice: IExercice): boolean {
  return (
    Array.isArray(exercice.autoCorrection) && exercice.autoCorrection.length > 0
  )
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

  return {
    notifications,
    restore: () => {
      console.error = originalConsoleError
    },
  }
}

function isClassExport(
  value: unknown,
): value is new (...args: unknown[]) => IExercice {
  if (typeof value !== 'function') return false
  const source = Function.prototype.toString.call(value)
  return source.startsWith('class ')
}

async function loadAndTestExercise(filePath: string): Promise<{
  file: string
  title?: string
  tags: string[]
  error?: string
  notifications?: CapturedNotification[]
} | null> {
  const absolutePath = resolve(filePath)
  const relativePath = relative(rootDir, absolutePath).replaceAll('\\', '/')
  const capture = installNotificationCapture(relativePath)

  try {
    const module = await import(pathToFileURL(absolutePath).href)
    const ExerciceClass = module.default

    if (!isClassExport(ExerciceClass)) return null

    const exercice: IExercice = new ExerciceClass()
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
    if (exercice.interactifReady && !hasAutoCorrection(exercice)) {
      tags.push('autoCorrection-interactive-absente')
    }

    if (tags.length === 0 && capture.notifications.length === 0) return null

    return {
      file: relativePath,
      title: (exercice as IExercice).titre ?? module.titre,
      tags,
      notifications:
        capture.notifications.length > 0 ? capture.notifications : undefined,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      file: relativePath,
      tags: ['erreur-runtime'],
      error: errorMsg.slice(0, 180),
      notifications:
        capture.notifications.length > 0 ? capture.notifications : undefined,
    }
  } finally {
    capture.restore()
  }
}

describe('Single isolated exercise runner', () => {
  it('writes one exercise result into output file', async () => {
    if (!TARGET_FILE || !OUTPUT_FILE) {
      writeFileSync(
        OUTPUT_FILE ?? '.tmp-interactif-single.json',
        'null',
        'utf8',
      )
      return
    }

    const result = await loadAndTestExercise(TARGET_FILE)
    writeFileSync(OUTPUT_FILE, JSON.stringify(result), 'utf8')
  })
})
