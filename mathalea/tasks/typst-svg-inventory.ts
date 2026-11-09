/**
 * Inventaire des figures SVG dans les exercices MathALÉA.
 *
 * Pour chaque exercice, détecte les types de figures utilisées (mathalea2d,
 * figureApigeom, cliqueFigure) et génère un rapport pour suivre ce qui
 * doit être converti en Typst natif.
 *
 * Usage : pnpm typst:inventory
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const EXERCICES_DIR = join(ROOT, 'src', 'exercices')
const REPORTS_DIR = join(ROOT, 'reports')
const UUID_MAP_FILE = join(ROOT, 'src', 'json', 'uuidsToUrlFR.json')
const OUTPUT_JSON = join(REPORTS_DIR, 'typst-svg-inventory.json')
const OUTPUT_MD = join(REPORTS_DIR, 'typst-svg-inventory.md')

const EXCLUDED_DIRS = new Set(['ressources', 'apps', 'beta'])
const EXCLUDED_FILES = new Set([
  'Exercice.ts',
  'MetaExerciceCan.ts',
  '_ExternalApp.ts',
])

interface ExerciceInventory {
  uuid: string
  file: string
  level: string
  figureTypes: string[]
  hasMathalea2d: boolean
  hasApigeom: boolean
  hasCliqueFigure: boolean
  hasFigure2d: boolean
  status: 'todo' | 'native' | 'skip'
  notes: string
}

function walk(dir: string, result: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry)) walk(fullPath, result)
      continue
    }
    if (entry.endsWith('.ts') && !EXCLUDED_FILES.has(entry)) {
      result.push(fullPath)
    }
  }
  return result
}

function buildPathToUuidMap(): Map<string, string> {
  const map = new Map<string, string>()
  try {
    const raw = readFileSync(UUID_MAP_FILE, 'utf8')
    const data: Record<string, string> = JSON.parse(raw)
    for (const [uuid, relPath] of Object.entries(data)) {
      // relPath is like "6e/6N2C-1.ts"
      map.set('src/exercices/' + relPath, uuid)
    }
  } catch (e) {
    console.warn('Could not load uuidsToUrlFR.json:', e)
  }
  return map
}

function analyzeFile(
  fullPath: string,
  pathToUuid: Map<string, string>,
): ExerciceInventory | null {
  const relPath = relative(ROOT, fullPath).replaceAll('\\', '/')
  const level = relPath.replace('src/exercices/', '').split('/')[0]

  let source: string
  try {
    source = readFileSync(fullPath, 'utf8')
  } catch {
    return null
  }

  const hasMathalea2d =
    /\bmathalea2d\s*\(/.test(source) ||
    /fixeBordures\s*\(/.test(source) ||
    /\brepere\s*\(/.test(source) ||
    /\bdroite\s*\(/.test(source)
  const hasApigeom =
    /figureApigeom\s*\(/.test(source) ||
    /this\.figuresApiGeom/.test(source) ||
    /new Figure\s*\(/.test(source)
  const hasCliqueFigure =
    /cliqueFigure/.test(source) || /this\.cliqueFiguresArray/.test(source)
  const hasFigure2d =
    /listeFigures2d/.test(source) || /new Figure2D\s*\(/.test(source)

  if (!hasMathalea2d && !hasApigeom && !hasCliqueFigure && !hasFigure2d) {
    return null
  }

  const figureTypes: string[] = []
  if (hasMathalea2d) figureTypes.push('mathalea2d')
  if (hasApigeom) figureTypes.push('apigeom')
  if (hasCliqueFigure) figureTypes.push('cliqueFigure')
  if (hasFigure2d) figureTypes.push('figure2d')

  const uuid = pathToUuid.get(relPath) ?? ''

  const isInteractiveOnly =
    hasApigeom && !hasMathalea2d && !hasCliqueFigure && !hasFigure2d
  const status: ExerciceInventory['status'] = isInteractiveOnly
    ? 'skip'
    : 'todo'
  const notes = isInteractiveOnly
    ? 'Exercice interactif uniquement (apigeom), pas de figure statique'
    : ''

  return {
    uuid,
    file: relPath,
    level,
    figureTypes,
    hasMathalea2d,
    hasApigeom,
    hasCliqueFigure,
    hasFigure2d,
    status,
    notes,
  }
}

function generateMarkdown(
  entries: ExerciceInventory[],
  total: number,
  withFigures: number,
): string {
  const byType = {
    mathalea2d: entries.filter((e) => e.hasMathalea2d).length,
    apigeom: entries.filter((e) => e.hasApigeom).length,
    cliqueFigure: entries.filter((e) => e.hasCliqueFigure).length,
    figure2d: entries.filter((e) => e.hasFigure2d).length,
  }
  const byLevel = new Map<string, number>()
  for (const e of entries) {
    byLevel.set(e.level, (byLevel.get(e.level) ?? 0) + 1)
  }

  const lines: string[] = [
    '# Inventaire des figures SVG — Typst',
    '',
    `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
    '',
    '## Résumé',
    '',
    `- **Total exercices analysés :** ${total}`,
    `- **Exercices avec figures :** ${withFigures} (${Math.round((withFigures / total) * 100)}%)`,
    '',
    '### Par type de figure',
    '',
    `| Type | Exercices | Description |`,
    `|------|-----------|-------------|`,
    `| mathalea2d | ${byType.mathalea2d} | Figures géométriques SVG → à convertir en Typst natif |`,
    `| apigeom | ${byType.apigeom} | Figures interactives — absentes en Typst (à gérer) |`,
    `| cliqueFigure | ${byType.cliqueFigure} | Figures cliquables — nécessite SVG embarqué |`,
    `| figure2d | ${byType.figure2d} | Formes pré-définies (panneaux, lettres…) |`,
    '',
    '### Par niveau',
    '',
    '| Niveau | Exercices avec figures |',
    '|--------|----------------------|',
    ...[...byLevel.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([lvl, n]) => `| ${lvl} | ${n} |`),
    '',
    '## Liste détaillée',
    '',
    '| Exercice | UUID | Types | Statut | Notes |',
    '|----------|------|-------|--------|-------|',
    ...entries
      .sort((a, b) => a.file.localeCompare(b.file))
      .map(
        (e) =>
          `| ${e.file.replace('src/exercices/', '')} | ${e.uuid || '—'} | ${e.figureTypes.join(', ')} | ${e.status} | ${e.notes} |`,
      ),
  ]

  return lines.join('\n') + '\n'
}

function main() {
  console.log('Analyse des figures SVG dans les exercices...')

  const pathToUuid = buildPathToUuidMap()
  const files = walk(EXERCICES_DIR)
  console.log(`${files.length} fichiers d'exercices trouvés`)

  const entries: ExerciceInventory[] = []
  const inventoryMap: Record<string, ExerciceInventory> = {}

  for (const fullPath of files) {
    const result = analyzeFile(fullPath, pathToUuid)
    if (result === null) continue
    entries.push(result)
    const key = result.file.replace('src/exercices/', '').replace(/\.ts$/, '')
    inventoryMap[key] = result
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalExercises: files.length,
    exercisesWithFigures: entries.length,
    exercises: inventoryMap,
  }

  writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), 'utf8')
  console.log(`JSON sauvegardé : ${OUTPUT_JSON}`)

  const md = generateMarkdown(entries, files.length, entries.length)
  writeFileSync(OUTPUT_MD, md, 'utf8')
  console.log(`Markdown sauvegardé : ${OUTPUT_MD}`)

  console.log(`\nRésumé : ${entries.length}/${files.length} exercices ont des figures`)
  console.log(`  - mathalea2d : ${entries.filter((e) => e.hasMathalea2d).length}`)
  console.log(`  - apigeom    : ${entries.filter((e) => e.hasApigeom).length}`)
  console.log(`  - cliqueFigure: ${entries.filter((e) => e.hasCliqueFigure).length}`)
}

main()
