import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  exercicesDir: join(__dirname, '..', 'src', 'exercices'),
  outputPath: join(__dirname, '..', 'variants-report.txt'),
  maxVariantsPerParam: 10,
  topLevelsToShow: 10,
  topExercisesToShow: 10,
}

// ============================================================================
// CLASSES & TYPES
// ============================================================================

class OutputLogger {
  constructor() {
    this.lines = []
  }

  log(message = '') {
    this.lines.push(message)
    console.log(message)
  }

  getOutput() {
    return this.lines.join('\n')
  }

  saveToFile(filepath) {
    writeFileSync(filepath, this.getOutput(), 'utf8')
    this.log(`\n✅ Rapport sauvegardé dans: ${filepath}`)
  }
}

class VariantAnalyzer {
  constructor() {
    this.totalVariants = 0
    this.exercisesWithVariants = 0
    this.exercisesProcessed = 0
    this.exercisesWithErrors = 0
    this.variantDetails = []
    this.exercisesWithMaxOver10 = []
    this.exercisesWithoutNewline = []
    this.variantsByLevel = {}
  }

  addExercise(exerciseData) {
    // eslint-disable-next-line no-unused-vars
    const { variants, level, path, params } = exerciseData

    this.totalVariants += variants
    this.exercisesProcessed++

    if (!this.variantsByLevel[level]) {
      this.variantsByLevel[level] = { total: 0, exercises: 0 }
    }
    this.variantsByLevel[level].total += variants
    this.variantsByLevel[level].exercises++

    if (variants > 1) {
      this.exercisesWithVariants++
      this.variantDetails.push(exerciseData)
    }
  }

  addError() {
    this.exercisesWithErrors++
  }

  addOverMax(data) {
    this.exercisesWithMaxOver10.push(data)
  }

  addWithoutNewline(data) {
    this.exercisesWithoutNewline.push(data)
  }

  getMedian() {
    if (this.variantDetails.length === 0) return 0
    const sorted = [...this.variantDetails].sort(
      (a, b) => a.variants - b.variants,
    )
    return sorted[Math.floor(sorted.length / 2)].variants
  }

  getAverageVariants() {
    return this.exercisesProcessed > 0
      ? (this.totalVariants / this.exercisesProcessed).toFixed(2)
      : 0
  }

  getSortedLevels() {
    return Object.entries(this.variantsByLevel).sort(
      (a, b) => b[1].total - a[1].total,
    )
  }

  getTopExercises(count) {
    return [...this.variantDetails]
      .sort((a, b) => b.variants - a.variants)
      .slice(0, count)
  }
}

// ============================================================================
// UTILITAIRES
// ============================================================================

function findExerciseFiles(dir, fileList = []) {
  const files = readdirSync(dir)

  files.forEach((file) => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      findExerciseFiles(filePath, fileList)
    } else if (
      (file.endsWith('.ts') || file.endsWith('.js')) &&
      !file.startsWith('Exercice')
    ) {
      fileList.push(filePath)
    }
  })

  return fileList
}

function extractNumericParam(content, paramName, paramNumber) {
  const regex = new RegExp(
    `${paramName}\\s*[:=]\\s*\\[\\s*['"]([^'"]+)['"]\\s*,\\s*(\\d+)`,
  )
  const match = content.match(regex)
  if (!match) return null

  const max = parseInt(match[2])
  return { max, name: `sup${paramNumber > 1 ? paramNumber : ''}` }
}

function extractTextParam(content, paramName, paramNumber) {
  const regex = new RegExp(
    `${paramName}\\s*[:=]\\s*\\[\\s*['"]([^'"]+)['"]\\s*,\\s*['"]([^'"]+)['"]`,
  )
  const match = content.match(regex)
  if (!match) return null

  const optionsText = match[2]
  const optionsList = optionsText.split('\\n')
  const hasmelange = optionsList.some((opt) =>
    opt.toLowerCase().includes('mélange'),
  )
  let options = optionsList.length
  if (hasmelange && options > 1) {
    options -= 1
  }

  return {
    max: options,
    name: `sup${paramNumber > 1 ? paramNumber : ''} (text)`,
    hasNewline: optionsText.includes('\\n'),
    text: optionsText,
  }
}

function extractCheckboxParam(content, paramName, paramNumber) {
  const regex = new RegExp(`${paramName}\\s*[:=]\\s*\\[`)
  const match = content.match(regex)
  if (!match) return null

  return {
    max: 2,
    name: `sup${paramNumber > 1 ? paramNumber : ''} (checkbox)`,
  }
}

// ============================================================================
// ANALYSE DES EXERCICES
// ============================================================================

function analyzeExercise(fullPath, exercicesDir, analyzer) {
  try {
    const content = readFileSync(fullPath, 'utf8')
    const relativePath = relative(exercicesDir, fullPath)
    const level = relativePath.split('/')[0]

    let variants = 1
    const params = []
    const numericParams = []
    const textParams = []
    const checkboxParams = []

    // Analyser tous les types de paramètres (1 à 5)
    for (let i = 1; i <= 5; i++) {
      const paramSuffix = i === 1 ? '' : i.toString()

      // Paramètres numériques
      const numParam = extractNumericParam(
        content,
        `besoinFormulaire${paramSuffix}Numerique`,
        i,
      )
      if (numParam) {
        numericParams.push(numParam)
        if (numParam.max > CONFIG.maxVariantsPerParam) {
          analyzer.addOverMax({
            path: relativePath,
            param: numParam.name,
            max: numParam.max,
          })
          variants *= CONFIG.maxVariantsPerParam
          params.push({ ...numParam, capped: true })
        } else {
          variants *= numParam.max
          params.push(numParam)
        }
        continue
      }

      // Paramètres texte
      const textParam = extractTextParam(
        content,
        `besoinFormulaire${paramSuffix}Texte`,
        i,
      )
      if (textParam) {
        textParams.push(textParam)
        if (!textParam.hasNewline) {
          analyzer.addWithoutNewline({
            path: relativePath,
            param: textParam.name,
            text: textParam.text,
          })
        }
        variants *= textParam.max
        params.push(textParam)
        continue
      }

      // Cases à cocher
      const checkParam = extractCheckboxParam(
        content,
        `besoinFormulaire${paramSuffix}CaseACocher`,
        i,
      )
      if (checkParam) {
        checkboxParams.push(checkParam)
        variants *= checkParam.max
        params.push(checkParam)
      }
    }

    analyzer.addExercise({
      path: relativePath,
      level,
      variants,
      params,
    })
  } catch (error) {
    analyzer.addError()
    return { error: error.message, path: relative(exercicesDir, fullPath) }
  }
}

// ============================================================================
// GÉNÉRATION DU RAPPORT
// ============================================================================

function generateReport(analyzer, logger) {
  logger.log(`\n${'='.repeat(80)}`)
  logger.log(`${"RÉSUMÉ DE L'ANALYSE DES VARIANTES D'EXERCICES".padStart(55)}`)
  logger.log(`${'='.repeat(80)}\n`)

  // Résumé global
  logger.log(`📊 RÉSUMÉ GLOBAL`)
  logger.log(`${'─'.repeat(80)}`)
  logger.log(
    `Nombre total de variantes : ${analyzer.totalVariants.toLocaleString('fr-FR')}`,
  )
  logger.log(
    `Fichiers d'exercices analysés : ${analyzer.exercisesProcessed.toLocaleString('fr-FR')}`,
  )
  logger.log(
    `Exercices avec variantes (>1) : ${analyzer.exercisesWithVariants.toLocaleString('fr-FR')}`,
  )
  logger.log(
    `Moyenne de variantes par exercice : ${analyzer.getAverageVariants()}`,
  )
  if (analyzer.exercisesWithErrors > 0) {
    logger.log(`⚠️  Exercices avec erreurs : ${analyzer.exercisesWithErrors}`)
  }
  logger.log()

  // Variantes par niveau
  generateLevelReport(analyzer, logger)

  // Top exercices
  generateTopExercisesReport(analyzer, logger)

  // Statistiques supplémentaires
  generateStatsReport(analyzer, logger)

  // Exercices > max variantes
  generateOverMaxReport(analyzer, logger)

  // Exercices sans \n
  generateWithoutNewlineReport(analyzer, logger)

  logger.log(`${'='.repeat(80)}`)
  logger.log(`FIN DE L'ANALYSE`)
  logger.log(`${'='.repeat(80)}`)
}

function generateLevelReport(analyzer, logger) {
  logger.log(`📚 VARIANTES PAR NIVEAU SCOLAIRE`)
  logger.log(`${'─'.repeat(80)}`)

  const sortedLevels = analyzer.getSortedLevels()
  logger.log(`\nTop ${CONFIG.topLevelsToShow} des niveaux :`)

  sortedLevels.slice(0, CONFIG.topLevelsToShow).forEach(([level, data], i) => {
    const levelPadded = level.padEnd(8)
    const variantsPadded = data.total.toLocaleString('fr-FR').padStart(10)
    const exercisesPadded = data.exercises.toString().padStart(4)
    const avgPadded = (data.total / data.exercises).toFixed(2).padStart(7)
    logger.log(
      `${(i + 1).toString().padStart(2)}. ${levelPadded} : ${variantsPadded} variantes (${exercisesPadded} exercices, moy: ${avgPadded})`,
    )
  })

  if (sortedLevels.length > CONFIG.topLevelsToShow) {
    const othersTotal = sortedLevels
      .slice(CONFIG.topLevelsToShow)
      .reduce((sum, [, data]) => sum + data.total, 0)
    const othersExercises = sortedLevels
      .slice(CONFIG.topLevelsToShow)
      .reduce((sum, [, data]) => sum + data.exercises, 0)
    logger.log(
      `\nAutres (${sortedLevels.length - CONFIG.topLevelsToShow} niveaux) : ${othersTotal.toLocaleString('fr-FR')} variantes (${othersExercises} exercices)`,
    )
  }
  logger.log()
}

function generateTopExercisesReport(analyzer, logger) {
  logger.log(
    `🏆 TOP ${CONFIG.topExercisesToShow} DES EXERCICES AVEC LE PLUS DE VARIANTES`,
  )
  logger.log(`${'─'.repeat(80)}`)

  const topExercises = analyzer.getTopExercises(CONFIG.topExercisesToShow)
  topExercises.forEach((detail, index) => {
    const formula = detail.params.map((p) => p.max).join('×')
    logger.log(`\n${(index + 1).toString().padStart(2)}. ${detail.path}`)
    logger.log(
      `    ${detail.variants.toLocaleString('fr-FR')} variantes (${formula})`,
    )
    detail.params.forEach((param) => {
      logger.log(
        `    • ${param.name}: ${param.max} options${param.capped ? ' (limité à 10)' : ''}`,
      )
    })
  })
  logger.log()
}

function generateStatsReport(analyzer, logger) {
  logger.log(`📈 STATISTIQUES SUPPLÉMENTAIRES`)
  logger.log(`${'─'.repeat(80)}`)
  logger.log(`Médiane des exercices avec >1 variante : ${analyzer.getMedian()}`)
  logger.log(
    `Exercices sans variante (paramètres = 1) : ${analyzer.exercisesProcessed - analyzer.exercisesWithVariants}`,
  )
  logger.log()
}

function generateOverMaxReport(analyzer, logger) {
  logger.log(`⚠️  EXERCICES > max variantes (limités à 10 variantes)`)
  logger.log(`${'─'.repeat(80)}`)
  logger.log(
    `Nombre d'exercices concernés : ${analyzer.exercisesWithMaxOver10.length}`,
  )
  if (analyzer.exercisesWithMaxOver10.length > 0) {
    logger.log(`\nListe complète :`)
    analyzer.exercisesWithMaxOver10.forEach((ex) => {
      logger.log(
        `  • ${ex.path} - ${ex.param}: ${ex.max.toLocaleString('fr-FR')}`,
      )
    })
  }
  logger.log()
}

function generateWithoutNewlineReport(analyzer, logger) {
  logger.log(`📝 EXERCICES SANS \\n DANS FORMULAIRE TEXTE`)
  logger.log(`${'─'.repeat(80)}`)
  logger.log(
    `Nombre d'exercices concernés : ${analyzer.exercisesWithoutNewline.length}`,
  )
  if (analyzer.exercisesWithoutNewline.length > 0) {
    logger.log(
      `\nListe complète (probablement des champs de saisie personnalisés) :`,
    )
    analyzer.exercisesWithoutNewline.forEach((ex) => {
      const truncatedText =
        ex.text.length > 60 ? ex.text.substring(0, 57) + '...' : ex.text
      logger.log(`  • ${ex.path}`)
      logger.log(`    ${ex.param}: "${truncatedText}"`)
    })
  }
  logger.log()
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const logger = new OutputLogger()
  const analyzer = new VariantAnalyzer()

  // Trouver et analyser tous les exercices
  const exercicesList = findExerciseFiles(CONFIG.exercicesDir)
  logger.log(`Nombre total de fichiers d'exercices: ${exercicesList.length}`)

  const errors = []
  for (const fullPath of exercicesList) {
    const result = analyzeExercise(fullPath, CONFIG.exercicesDir, analyzer)
    if (result?.error) {
      errors.push(result)
      logger.log(`Erreur lors de l'analyse de ${result.path}: ${result.error}`)
    }
  }

  // Générer le rapport
  generateReport(analyzer, logger)

  // Sauvegarder
  logger.saveToFile(CONFIG.outputPath)
}

main()
