/**
 * Test Playwright pour valider le rendu Typst des exercices MathALÉA.
 *
 * Utilise le même compilateur WASM que le site web pour être dans les mêmes
 * conditions que l'utilisateur final.
 *
 * Usage :
 *   uuid=6N2C-1   pnpm typst:check   # exercice par référence
 *   uuid=10148    pnpm typst:check   # exercice par UUID
 *   ALL=1         pnpm typst:check   # tous les exercices (limité par LIMIT)
 *   FAILING=1     pnpm typst:check   # seulement les exercices en échec
 *   UNTESTED=1    pnpm typst:check   # seulement les exercices non testés
 *   LIMIT=50      pnpm typst:check   # limite le nombre d'exercices traités
 *
 * Nécessite le serveur de développement sur http://localhost:5173 (pnpm dev).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import type { Page } from 'playwright'
import { fileURLToPath } from 'url'
import { describe, it } from 'vitest'
import { getDefaultPage } from '../../helpers/browser.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '../../../..')
const STATUS_FILE = resolve(ROOT, 'reports/typst-status.json')
const SCREENSHOTS_DIR = resolve(ROOT, 'screenshots/typst-check')
const UUID_TO_URL = resolve(ROOT, 'src/json/uuidsToUrlFR.json')
const REF_TO_UUID = resolve(ROOT, 'src/json/refToUuidFR.json')
const BASE_URL = process.env.MATHALEA_URL ?? 'http://localhost:5173'

type ExerciseStatus = 'untested' | 'passing' | 'failing' | 'partial'
type FailureMode =
  | 'compile_error'
  | 'visual_overlap'
  | 'missing_figure'
  | 'unprocessed_math'
  | 'interactive_only'
  | 'missing_package'
  | null

interface ExerciseEntry {
  uuid: string
  ref: string
  lastChecked: string
  status: ExerciseStatus
  failureMode: FailureMode
  notes: string
  variationsTested: string[]
  typstScreenshot: string | null
  htmlScreenshot: string | null
  diagnostics: string[]
}

interface StatusDatabase {
  version: number
  lastRun: string
  exercises: Record<string, ExerciseEntry>
}

function loadStatus(): StatusDatabase {
  if (existsSync(STATUS_FILE)) {
    try {
      return JSON.parse(readFileSync(STATUS_FILE, 'utf8'))
    } catch {
      // fichier corrompu, on repart de zéro
    }
  }
  return { version: 1, lastRun: new Date().toISOString(), exercises: {} }
}

function saveStatus(db: StatusDatabase) {
  db.lastRun = new Date().toISOString()
  writeFileSync(STATUS_FILE, JSON.stringify(db, null, 2), 'utf8')
}

function loadJsonMap(path: string): Record<string, string> {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return {}
  }
}

function resolveUuid(input: string): string | null {
  const uuidToUrl = loadJsonMap(UUID_TO_URL)
  const refToUuid = loadJsonMap(REF_TO_UUID)
  // Déjà un UUID valide dans la base
  if (uuidToUrl[input]) return input
  // Référence d'exercice (ex: "6N2C-1")
  if (refToUuid[input]) return refToUuid[input]
  return null
}

function getUuidRef(uuid: string): string {
  const refToUuid = loadJsonMap(REF_TO_UUID)
  for (const [ref, u] of Object.entries(refToUuid)) {
    if (u === uuid) return ref
  }
  return uuid
}

function classifyDiagnostics(diagnostics: string[]): FailureMode {
  const text = diagnostics.join('\n')
  if (text.includes('package not found')) return 'missing_package'
  if (/undefined variable.*fig-/.test(text)) return 'missing_figure'
  if (text.includes('undefined variable') || text.includes('error:'))
    return 'compile_error'
  return 'compile_error'
}

function detectUnprocessedMath(svgText: string): boolean {
  // Supprime les blocs <style>...</style> (accolades CSS normales)
  const withoutStyle = svgText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  // Extrait le contenu des éléments <text>...</text> (texte visible)
  const textMatches = [...withoutStyle.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi)]
  const visibleText = textMatches.map((m) => m[1]).join(' ')
  // Cherche { ou } dans le texte visible (expressions LaTeX non converties)
  return /\{[^}]{0,80}\}/.test(visibleText)
}

function getExercisesToTest(db: StatusDatabase): string[] {
  const uuidToUrl = loadJsonMap(UUID_TO_URL)
  const allUuids = Object.keys(uuidToUrl)
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : Infinity

  const inputUuid = process.env.uuid
  if (inputUuid) {
    const resolved = resolveUuid(inputUuid)
    if (!resolved) {
      console.error(`UUID ou référence inconnu(e): ${inputUuid}`)
      return []
    }
    return [resolved]
  }

  if (process.env.FAILING === '1') {
    return allUuids
      .filter((u) => db.exercises[u]?.status === 'failing')
      .slice(0, limit)
  }

  if (process.env.UNTESTED === '1') {
    return allUuids
      .filter((u) => !db.exercises[u] || db.exercises[u].status === 'untested')
      .slice(0, limit)
  }

  if (process.env.ALL === '1') {
    return allUuids.slice(0, limit)
  }

  console.error(
    'Précisez uuid=<id>, ALL=1, FAILING=1 ou UNTESTED=1 pour lancer le test.',
  )
  return []
}

async function checkExercise(
  page: Page,
  uuid: string,
  db: StatusDatabase,
): Promise<ExerciseEntry> {
  const ref = getUuidRef(uuid)
  const screenshotDir = resolve(SCREENSHOTS_DIR, uuid)
  mkdirSync(screenshotDir, { recursive: true })

  const typstUrl = `${BASE_URL}/alea/?uuid=${uuid}&v=typst`
  const htmlUrl = `${BASE_URL}/alea/?uuid=${uuid}`

  // Force le mode preview pour que le SVG soit visible
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'mathaleaTypstView',
      JSON.stringify({ displayMode: 'preview' }),
    )
  })

  console.log(`\n→ ${ref} (${uuid}) — ${typstUrl}`)

  // Navigation vers la vue Typst
  await page.goto(typstUrl)

  // Attente de la compilation : soit SVG visible, soit diagnostics visibles
  // Le compilateur WASM (~27 Mo) peut mettre du temps à charger la première fois
  let compilationDone = false
  try {
    await page.waitForFunction(
      () => {
        const svg = document.querySelector('.typst-svg-container svg')
        const diagnostics = document.querySelector(
          '[data-testid="typst-diagnostics"]',
        )
        const compilerLoading = document.querySelector(
          '.bx-spin',
        )
        // La compilation est terminée quand : pas de spinner ET (SVG ou diagnostics)
        const hasResult = svg !== null || diagnostics !== null
        return hasResult && compilerLoading === null
      },
      { timeout: 120_000 },
    )
    compilationDone = true
  } catch {
    console.warn(`  ⚠️ Timeout en attendant la compilation de ${ref}`)
  }

  // Screenshot vue Typst
  const typstScreenshotPath = resolve(screenshotDir, 'typst.png')
  await page.screenshot({ path: typstScreenshotPath, fullPage: false })

  // Extraction des diagnostics
  let diagnostics: string[] = []
  const diagnosticsEl = page.locator('[data-testid="typst-diagnostics"]')
  if ((await diagnosticsEl.count()) > 0) {
    const text = (await diagnosticsEl.textContent()) ?? ''
    diagnostics = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  }

  // Extraction du SVG pour analyse
  let svgContent = ''
  const svgEl = page.locator('.typst-svg-container svg')
  if ((await svgEl.count()) > 0) {
    svgContent = (await svgEl.innerHTML()) ?? ''
  }

  // Phase 2 : tester avec le corrigé (corrige = true)
  let correctionDiagnostics: string[] = []
  let correctionSvgContent = ''
  let correctionDone = false

  // Récupère le code Typst depuis l'éditeur CodeMirror et active le corrigé
  const codeModified = await page.evaluate(() => {
    const contentEl = document.querySelector('.cm-content')
    if (!contentEl) return false
    const view = (contentEl as any).cmView
    if (!view) return false
    const current = view.state.doc.toString()
    if (!current.includes('#let corrige = false')) return false
    const modified = current.replace('#let corrige = false', '#let corrige = true')
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: modified } })
    return true
  })

  if (codeModified) {
    // Attend la recompilation avec corrigé
    try {
      await page.waitForFunction(
        () => {
          const spin = document.querySelector('.bx-spin')
          return spin === null
        },
        { timeout: 60_000 },
      )
      // Pause pour laisser le rendu se stabiliser
      await page.waitForTimeout(1000)
      correctionDone = true
    } catch {
      console.warn(`  ⚠️ Timeout corrigé ${ref}`)
    }

    const corrDiagEl = page.locator('[data-testid="typst-diagnostics"]')
    if ((await corrDiagEl.count()) > 0) {
      const text = (await corrDiagEl.textContent()) ?? ''
      correctionDiagnostics = text.split('\n').map((l) => l.trim()).filter(Boolean)
    }
    const corrSvgEl = page.locator('.typst-svg-container svg')
    if ((await corrSvgEl.count()) > 0) {
      correctionSvgContent = (await corrSvgEl.innerHTML()) ?? ''
    }

    // Screenshot corrigé
    const corrScreenshotPath = resolve(screenshotDir, 'typst-corr.png')
    await page.screenshot({ path: corrScreenshotPath, fullPage: false })
  }

  // Screenshot vue HTML pour comparaison
  const htmlScreenshotPath = resolve(screenshotDir, 'html.png')
  await page.goto(htmlUrl)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: htmlScreenshotPath, fullPage: false })

  // Classification (questions ET corrigé)
  const allDiagnostics = [...diagnostics, ...correctionDiagnostics]
  const allSvg = svgContent + correctionSvgContent

  let status: ExerciseStatus = 'failing'
  let failureMode: FailureMode = null
  let notes = ''

  if (!compilationDone) {
    failureMode = 'compile_error'
    notes = 'Timeout lors de la compilation'
  } else if (allDiagnostics.length > 0) {
    failureMode = classifyDiagnostics(allDiagnostics)
    const src = allDiagnostics.length > diagnostics.length ? '[corrigé] ' : ''
    notes = src + allDiagnostics.slice(0, 3).join(' | ')
  } else if (allSvg && detectUnprocessedMath(allSvg)) {
    failureMode = 'unprocessed_math'
    notes = 'Expressions mathématiques non converties ({...} visibles)'
    status = 'partial'
  } else if (svgContent) {
    status = 'passing'
    failureMode = null
    notes = ''
    console.log(`  ✅ ${ref} — OK`)
  } else {
    failureMode = 'compile_error'
    notes = 'Ni SVG ni diagnostics après compilation'
  }

  if (status === 'failing') {
    console.log(`  ❌ ${ref} — ${failureMode}: ${notes.slice(0, 80)}`)
  } else if (status === 'partial') {
    console.log(`  ⚠️  ${ref} — ${failureMode}`)
  }

  return {
    uuid,
    ref,
    lastChecked: new Date().toISOString(),
    status,
    failureMode,
    notes,
    variationsTested: ['default'],
    typstScreenshot: `screenshots/typst-check/${uuid}/typst.png`,
    htmlScreenshot: `screenshots/typst-check/${uuid}/html.png`,
    diagnostics,
  }
}

describe('Typst check', async () => {
  it('checks exercises in Typst view', async () => {
    const db = loadStatus()
    const uuids = getExercisesToTest(db)

    if (uuids.length === 0) {
      console.log('Aucun exercice à tester.')
      return
    }

    console.log(`\n🔍 Test Typst pour ${uuids.length} exercice(s)`)

    const page = await getDefaultPage({ browserName: 'chromium' })

    let passing = 0
    let failing = 0
    let partial = 0

    for (const uuid of uuids) {
      try {
        const entry = await checkExercise(page, uuid, db)
        db.exercises[entry.ref] = entry
        saveStatus(db)

        if (entry.status === 'passing') passing++
        else if (entry.status === 'partial') partial++
        else failing++
      } catch (err) {
        console.error(`  Erreur inattendue pour ${uuid}:`, err)
        failing++
      }
    }

    console.log(`\n📊 Résultats :`)
    console.log(`  ✅ Passing  : ${passing}`)
    console.log(`  ⚠️  Partial : ${partial}`)
    console.log(`  ❌ Failing  : ${failing}`)
    console.log(`\nRapport sauvegardé : ${STATUS_FILE}`)
  }, 600_000)
})
