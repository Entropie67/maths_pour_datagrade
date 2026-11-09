import fs from 'fs'

const targetLevel = process.argv[2] || '3Auto'
const levelsThemesList = JSON.parse(
  fs.readFileSync('./src/json/levelsThemesList.json', 'utf8'),
)
const exercicesFR = JSON.parse(
  fs.readFileSync('./src/json/exercicesFR.json', 'utf8'),
)

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getExerciseInfo(ref) {
  const entry = exercicesFR[ref]

  if (!entry) {
    return null
  }

  return {
    reference: ref,
    titre: entry.titre || entry.title || ref,
    url: entry.url || '',
  }
}

function extractLevelExercises(levelKey) {
  if (!levelsThemesList[levelKey]) {
    throw new Error(
      `Le niveau ${levelKey} n'existe pas dans levelsThemesList.json`,
    )
  }

  const groupPattern = new RegExp(`^${escapeRegex(levelKey)}[A-Z]+$`)
  const subThemePattern = new RegExp(`^${escapeRegex(levelKey)}[A-Z]\\d{2}$`)

  const result = {
    [levelKey]: {
      titre: levelsThemesList[levelKey]?.titre || levelKey,
      themes: {},
    },
  }

  const themeGroups = Object.entries(levelsThemesList).filter(
    ([key]) => key !== levelKey && groupPattern.test(key),
  )

  for (const [groupKey, groupMeta] of themeGroups) {
    const group = {
      titre: groupMeta?.titre || groupKey,
      sousThemes: {},
    }

    const subThemes = Object.entries(levelsThemesList).filter(
      ([key]) => subThemePattern.test(key) && key.startsWith(groupKey),
    )

    for (const [subKey, subMeta] of subThemes) {
      const references = Object.keys(exercicesFR)
        .filter((ref) => {
          if (ref === subKey) {
            return true
          }

          return (
            ref.startsWith(subKey) &&
            new RegExp(`^${escapeRegex(subKey)}-\\d+$`).test(ref)
          )
        })
        .sort((a, b) => {
          const aIsBase = a === subKey
          const bIsBase = b === subKey

          if (aIsBase && !bIsBase) return -1
          if (!aIsBase && bIsBase) return 1

          return a.localeCompare(b)
        })
        .map(getExerciseInfo)
        .filter(Boolean)

      group.sousThemes[subKey] = {
        titre: subMeta?.titre || subKey,
        references,
      }
    }

    result[levelKey].themes[groupKey] = group
  }

  return result
}

function csvEscape(value) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function buildCsv(data, levelKey) {
  const rows = [['theme', 'sousTheme', 'referenceTitre', 'reference']]
  const themes = data?.[levelKey]?.themes ?? {}

  for (const [themeKey, themeValue] of Object.entries(themes)) {
    const themeTitre = themeValue?.titre || themeKey
    const sousThemes = themeValue?.sousThemes ?? {}

    for (const [subKey, subValue] of Object.entries(sousThemes)) {
      const sousThemeTitre = subValue?.titre || subKey
      const references = Array.isArray(subValue?.references)
        ? subValue.references
        : []

      if (references.length === 0) {
        rows.push([themeTitre, sousThemeTitre, '', ''])
        continue
      }

      for (const ref of references) {
        rows.push([
          themeTitre,
          sousThemeTitre,
          ref?.titre || '',
          ref?.reference || '',
        ])
      }
    }
  }

  return `${rows.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`
}

const extractedData = extractLevelExercises(targetLevel)
const outputDir = './output'
const outputBase = `${targetLevel.toLowerCase()}-exercises`

fs.mkdirSync(outputDir, { recursive: true })

fs.writeFileSync(
  `${outputDir}/${outputBase}.json`,
  JSON.stringify(extractedData, null, 2),
)

const csvContent = buildCsv(extractedData, targetLevel)
fs.writeFileSync(`${outputDir}/${outputBase}.csv`, csvContent)

console.log(JSON.stringify(extractedData, null, 2))
console.log(`\nJSON sauvegardé dans ${outputDir}/${outputBase}.json`)
console.log(`CSV sauvegardé dans ${outputDir}/${outputBase}.csv`)
