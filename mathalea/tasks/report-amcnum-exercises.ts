import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import seedrandom from 'seedrandom';
import { fileURLToPath } from 'url';
import { mathaleaEnsureAMCCompatibility } from '../src/lib/amc/amcInference.ts';
import type { IExercice } from '../src/lib/types.ts';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const exercicesDir = join(__dirname, '..', 'src', 'exercices')
const rootDir = join(__dirname, '..')

const amcReadyRegex = /export const amcReady\s*=\s*(?:true|'true'|"true")/m
const amcNumRegex = /export const amcType\s*=\s*(?:'AMCNum'|"AMCNum")/m

function walk(dir, result = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const entryStat = statSync(fullPath)
    if (entryStat.isDirectory()) {
      walk(fullPath, result)
      continue
    }
    if (/\.(ts|js)$/.test(entry)) {
      result.push(fullPath)
    }
  }
  return result
}

function hasValidAutoCorrectionAmc(exercice: IExercice): boolean {
  if (!Array.isArray(exercice.autoCorrectionAMC) || exercice.autoCorrectionAMC.length === 0) {
    return false
  }
  
  for (const item of exercice.autoCorrectionAMC) {
    if (item && item.reponse && item.reponse.valeur !== undefined && item.reponse.param) {
      return true
    }
  }
  return false
}

function hasAutoCorrection(exercice: IExercice): boolean {
  return Array.isArray(exercice.autoCorrection) && exercice.autoCorrection.length > 0
}

function formatTagList(tags: string[]) {
  if (tags.length === 0) return ''
  return tags.map((tag) => `[${tag}]`).join(' ')
}

async function loadAndTestExercise(filePath: string): Promise<{
  file: string
  tags: string[]
  error?: string
} | null> {
  const content = readFileSync(filePath, 'utf8')
  if (!amcReadyRegex.test(content) || !amcNumRegex.test(content)) {
    return null
  }

  const tags: string[] = []
  const relativePath = relative(rootDir, filePath).replaceAll('\\', '/')

  try {
    // Charger le module dynamiquement
    const moduleUrl = new URL(`file://${filePath}`)
    let module: any
    
    try {
      module = await import(moduleUrl.href)
    } catch (e) {
      // Si le fichier est .ts, essayer une résolution alternative
      if (filePath.endsWith('.ts')) {
        const jsPath = filePath.replace(/\.ts$/, '.js')
        try {
          const jsUrl = new URL(`file://${jsPath}`)
          module = await import(jsUrl.href)
        } catch {
          // Fallback: utiliser le chemin relatif
          const importPath = relativePath.replace(/\.ts$/, '')
          module = await import(`../src/${importPath}.ts`)
        }
      } else {
        throw e
      }
    }

    const ExerciceClass = module.default
    if (!ExerciceClass) {
      return { file: relativePath, tags: ['class-export-manquante'], error: 'No default export' }
    }

    // Instancier l'exercice
    const exercice: IExercice = new ExerciceClass()

    // Configurer seedrandom
    seedrandom('test', { global: true })

    // Générer des questions
    if (typeof exercice.nouvelleVersionWrapper === 'function') {
      exercice.nouvelleVersionWrapper()
    }

    // Appliquer la compatibilité AMC
    mathaleaEnsureAMCCompatibility(exercice)

    // Analyser les résultats
    const hasValidAmc = hasValidAutoCorrectionAmc(exercice)
    const hasHtmlCorrection = hasAutoCorrection(exercice)

    if (!hasValidAmc) {
      tags.push('autoCorrectionAMC-manquante-ou-incomplete')
    }

    if (!hasHtmlCorrection) {
      tags.push('autoCorrection-html-absente')
    }

    if (tags.length === 0) return null

    return {
      file: relativePath,
      tags,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      file: relativePath,
      tags: ['erreur-runtime'],
      error: errorMsg.slice(0, 100),
    }
  }
}

async function main() {
  const files = walk(exercicesDir)
  const rows: Array<{ file: string; tags: string[]; error?: string }> = []

  console.error(`Analyse de ${files.length} fichiers...`)

  for (const filePath of files) {
    const result = await loadAndTestExercise(filePath)
    if (result) {
      rows.push(result)
      if (result.error) {
        console.error(`  ⚠️  ${result.file}: ${result.error}`)
      }
    }
  }

  rows.sort((a, b) => a.file.localeCompare(b.file))

  const lines: string[] = []
  lines.push('# Rapport AMCNum - Analyse Runtime')
  lines.push('')
  lines.push('Analyse runtime des exercices qui exportent `amcReady = true` et `amcType = AMCNum`.')
  lines.push('')
  lines.push('**Tags:**')
  lines.push('- `autoCorrectionAMC-manquante-ou-incomplete`: autoCorrectionAMC n\'est pas remplie avec la structure attendue {reponse: {valeur, param}}')
  lines.push('- `autoCorrection-html-absente`: autoCorrection HTML n\'est pas remplie')
  lines.push('- `erreur-runtime`: erreur lors de l\'instanciation ou exécution')
  lines.push('- `class-export-manquante`: pas d\'export default')
  lines.push('')
  lines.push('| Fichier | Tags |')
  lines.push('| --- | --- |')

  for (const row of rows) {
    const link = `[${row.file}](${row.file})`
    const tagStr = formatTagList(row.tags) + (row.error ? ` (${row.error})` : '')
    lines.push(`| ${link} | ${tagStr} |`)
  }

  const output = lines.join('\n') + '\n'
  const outputPath = process.argv[2]
  if (outputPath) {
    writeFileSync(outputPath, output, 'utf8')
    console.error(`✅ Rapport écrit dans ${outputPath}`)
  } else {
    process.stdout.write(output)
  }
}

main().catch((err) => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
