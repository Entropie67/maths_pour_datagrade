/**
 * Ce script permet de mettre à jour les fichiers :
 * - src/json/exercices.json
 * - src/json/exercicesNonInteractifs.json
 * - src/json/uuidsToUrl.json
 * - src/json/referentiel2022.json
 * - src/json/refToUuid.json
 *
 * Il permet aussi de générer un uuid pour un nouvel exercice
 * Il faut lancer ce script après avoir créé un nouvel exercice
 * Ce script s'appuie sur emptyRef2022.json qui contient les niveaux et les catégories
 * Les titres des niveaux, thèmes et sous-thèmes sont gérés dans src/json/levelsThemesList.json
 *
 * Pour ajouter un nouveau chapitre, il faut donc l'écrire dans emptyRef2022.json puis éventuellement
 * mettre à jour src/levelsThemesList.json ou src/codeToLevelList.json
 *
 * ToDo : arrêter l'utilisation de referentielRessources.json
 *
 * Remarque : nouveau fonctionnement au 13 aout 2023 en remplacement de makJson.js
 */

import { readFileSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import {
  isQcmExercise,
  offersNonQcmFormat,
} from './lib/detect-qcm-capability.js'

const typesSource = readFileSync('src/lib/types.ts', 'utf8')
const levelsThemesListFR = JSON.parse(
  readFileSync('src/json/levelsThemesList.json', 'utf8'),
)
const codeToLevelList = JSON.parse(
  readFileSync('src/json/codeToLevelList.json', 'utf8'),
)
const codeToThemeList = JSON.parse(
  readFileSync('src/json/codeToThemeList.json', 'utf8'),
)

/**
 * Lit les valeurs littérales d'une union TypeScript dans src/lib/types.ts.
 * Le générateur de menu partage ainsi la même liste de formats que le moteur,
 * sans maintenir une seconde liste à la main dans ce script JavaScript.
 */
function extractStringUnion(typeName) {
  const union = typesSource.match(
    new RegExp(`export type ${typeName}\\s*=([\\s\\S]*?)(?=\\nexport )`),
  )?.[1]
  if (union == null) {
    throw new Error(`${typeName} est introuvable dans src/lib/types.ts`)
  }
  return [...union.matchAll(/\|\s*'([^']+)'/g)].map((match) => match[1])
}

const registeredInteractiveFormats = new Set([
  ...extractStringUnion('InteractivityType'),
  ...extractStringUnion('OldFormatInteractifType'),
])

// Une anomalie bloquante (uuid/ref en doublon ou manquant, titre manquant...)
// ne doit pas seulement s'afficher en rouge : elle doit faire échouer le
// script (pnpm dev le lance avant vite, la CI le lance avant ses tests).
let hasBlockingError = false

function logError(message) {
  console.error('\x1b[31m%s\x1b[0m', message)
  hasBlockingError = true
}

/**
 * Le titre est extrait du code source par expression régulière : on obtient le texte
 * tel qu'il est écrit entre les guillemets, échappements compris. Cette fonction
 * restitue la chaîne que JavaScript produirait : `\'` devient `'`, `\\` devient `\`
 * et `\u00a0` (ou `\xa0`) devient le caractère correspondant. Sans cela, le menu
 * afficherait `\u00a0` littéralement autour des « ».
 * Les autres séquences d'échappement sont laissées telles quelles.
 * @param {string} brut titre tel qu'écrit dans le fichier source
 * @returns {string}
 */
function unescapeTitre(brut) {
  return brut.replace(
    /\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|['\\])/g,
    (_, sequence) =>
      sequence[0] === 'u' || sequence[0] === 'x'
        ? String.fromCharCode(parseInt(sequence.slice(1), 16))
        : sequence,
  )
}

/**
 * Retourne le premier format interactif littéral reconnu dans le fichier.
 *
 * Les deux syntaxes utilisées par les exercices sont prises en charge :
 * - objet/options : `formatInteractif: 'mathalea-qcm'` ;
 * - affectation : `autoCorrection[i].formatInteractif = 'clique-figure'`.
 */
function extractInteractiveType(data) {
  const formatPattern = /\bformatInteractif\s*(?::|=(?!=))\s*(['"])([^'"]+)\1/g
  for (const match of data.matchAll(formatPattern)) {
    if (registeredInteractiveFormats.has(match[2])) return match[2]
  }

  return inferInteractiveTypeFromHelpers(data)
}

/**
 * Reconnaît les helpers qui créent un composant spécialisé. Ils ont priorité
 * sur le repli mathlive, car les anciens exercices ne transmettaient pas
 * toujours leur format à handleAnswers.
 */
function inferInteractiveTypeFromHelpers(data) {
  const helperFormats = [
    {
      pattern: /\bremplisLesBlancs\s*\(/,
      format: 'fill-in-the-blank',
    },
    {
      pattern:
        /\b(?:AddTabPropMathlive|AddTabDbleEntryMathlive|creeTableauMathliveElement)\s*\(/,
      format: 'tableau-mathlive',
    },
  ]

  const firstHelper = helperFormats
    .map(({ pattern, format }) => ({ index: data.search(pattern), format }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)[0]

  return firstHelper?.format ?? ''
}

async function readInfos(dirPath, contexts) {
  const files = await fs.readdir(dirPath)
  await Promise.all(
    files.map(async (file) => {
      const filePath = path.posix.join(dirPath, file)
      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        await readInfos(filePath, contexts)
      } else if (stat.isFile()) {
        // Check if it's a .js or .ts file, and exclude certain files
        if (
          file.match(/\.jsx?|\.ts$/) &&
          !file.startsWith('_') &&
          !file.endsWith('.test.ts') &&
          file !== 'deprecatedExercice.js' &&
          file !== 'MetaExerciceCan.ts' &&
          !file.startsWith('Exercice') &&
          file !== 'exerciseMethods.ts'
        ) {
          const data = await fs.readFile(filePath, 'utf8')
          if (data.includes('console.log(')) {
            console.error(
              '\x1b[34m%s\x1b[0m',
              `console.log trouvé dans ${filePath}`,
            )
          }
          for (const context of contexts) {
            extractInfos(data, filePath, context)
          }
        }
      }
    }),
  )
}

/**
 * Analyse le contenu d'un fichier d'exercice (déjà lu) pour un pays donné
 * et alimente les accumulateurs du contexte correspondant.
 */
function extractInfos(
  data,
  filePath,
  {
    uuidMap,
    exercicesNonInteractifs,
    refToUuid,
    exercicesShuffled,
    codePays,
    exercicesNonClasses,
    refMap,
  },
) {
  const infos = {}
  const qcmAvailable = isQcmExercise(filePath, data)
  const pasUniquementQcm = !qcmAvailable || offersNonQcmFormat(filePath, data)
  // const matchUuid = data.match(/export const uuid = '(.*)'/) // EE : Cet ancien code ne gérait pas si un commentaire avec apostrophe suivant uuid.
  const matchUuid = data.match(/export const uuid\s*=\s*'([^']*)'/)
  infos.url = filePath.replace('src/exercices/', '')
  infos.tags = []
  const matchTags = data.match(/export const tags\s*=\s*\[([^\]]*)\]/)
  if (matchTags) {
    infos.tags = matchTags[1]
      .split(',')
      .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter((tag) => tag !== '')
  }
  if (matchUuid) {
    if (uuidMap.has(matchUuid[1])) {
      logError(
        `${codePays}: uuid ${matchUuid[1]} en doublon  dans ${filePath} et ${uuidMap.get(matchUuid[1])}`,
      )
    }
    uuidMap.set(matchUuid[1], filePath.replace('src/exercices/', ''))
    infos.uuid = matchUuid[1]
  } else {
    // Pas d'erreur pour les fichiers beta
    if (!filePath.includes('/beta/')) {
      logError(`${codePays}: uuid non trouvé dans ${filePath}`)
    }
  }
  // const matchRefFR = data.match(/export const ref = '(.*)'/)
  // if (matchRefFR) {
  //   infos.idFR = matchRefFR[1]
  // } else {{2}
  //   if (!filePath.includes('beta') &{2}
  //     !filePath.includes('/apps/' {2}&&
  //     !filePath.includes('/ressources/')
  //   ) {
  //     console.error('\x1b[31m%s\x1b[0m', `ref non trouvé dans ${filePath}`)
  //   }
  // }
  // Extract refs if present
  const matchRef = data.match(
    new RegExp(`export const refs = {[^]*'${codePays}': \\[([^\\]]*)\\]`),
  )
  if (matchRef) {
    const refsArray = matchRef[1]
      .split(',')
      .map((ref) => ref.trim().replace(/'/g, ''))
      .filter((ref) => ref !== '')

    // Skip exercises marked as NR (non relevant) for CH
    if (
      codePays === 'fr-ch' &&
      refsArray.length === 1 &&
      refsArray[0] === 'NR'
    ) {
      // Do nothing - completely ignore this exercise
      return
    }

    if (refsArray.length === 0) {
      // Empty refs array: add to exercicesNonClasses for CH
      // Only add if UUID is non-empty string
      if (codePays === 'fr-ch' && infos.uuid && infos.uuid !== '') {
        // Process the exercise to extract all metadata
        const dataWithoutComments = data.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')
        const matchTitre =
          dataWithoutComments.match(
            /^export\s+(?:const|let)\s*titre\s*=\s*'((?:[^\\]\\'|[^'])*)'\s*$/ims,
          ) ||
          dataWithoutComments.match(
            /^export\s+(?:const|let)\s*titre\s*=\s*"((?:[^\\]\\"|[^"])*)"\s*$/ims,
          ) ||
          dataWithoutComments.match(
            /^export\s+(?:const|let)\s*titre\s*=\s*`((?:[^\\]\\`|[^`])*)`\s*$/ims,
          )
        if (matchTitre) {
          infos.titre = unescapeTitre(matchTitre[1])
        }
        const matchDate = data.match(
          /export const dateDePublication = '([^']*)'/,
        )
        if (matchDate) {
          infos.datePublication = matchDate[1]
        }
        const matchDateModif = data.match(
          /export const dateDeModifImportante = '([^']*)'/,
        )
        if (matchDateModif) {
          infos.dateModification = matchDateModif[1]
        }
        infos.features = {}
        const matchInteractif = data.match(
          /export const interactifReady = (.*)/,
        )
        const interactiveFormat = extractInteractiveType(data)
        if (matchInteractif && matchInteractif[1] === 'true') {
          infos.features.interactif = {
            isActive: true,
            type: interactiveFormat || 'mathlive',
          }
        } else {
          infos.features.interactif = {
            isActive: false,
            type: '',
          }
          exercicesNonInteractifs.push(filePath)
        }
        const matchAleatoire = data.match(
          /this\.pasDeVersionAleatoire\s*=\s*true/,
        )
        infos.features.aleatoire = {
          isActive: !matchAleatoire,
          type: '',
        }
        const matchAmcType = data.match(/export const amcType = '(.*)'/)
        if (matchAmcType) {
          infos.features.amc = {
            isActive: true,
            type: matchAmcType[1] || '',
          }
        } else {
          infos.features.amc = {
            isActive: false,
            type: '',
          }
        }
        if (qcmAvailable) {
          infos.features.qcm = { isActive: true, type: '' }
          infos.features.qcmcam = { isActive: true, type: '' }
        }
        infos.features.pasUniquementQcm = {
          isActive: pasUniquementQcm,
          type: '',
        }
        infos.typeExercice = 'alea'
        infos.id = infos.uuid
        // Add to the non-classified exercises
        exercicesNonClasses[infos.uuid] = { ...infos }
        exercicesShuffled[infos.uuid] = { ...infos }
        refToUuid[infos.uuid] = infos.uuid
      }
    } else {
      refsArray.forEach((ref) => {
        // const newInfos = { ...infos, id: ref }
        if (matchRef) {
          infos.id = ref // matchRef[1]
        }
        /*
          On essaye de trouver le titre par regex.
          Cela ne fonctionnera pas dans les cas suivants :
          - si le titre utilise ` ET ${}
          - si le titre somme des strings (ex : 'Titre' + 'suite')
        */
        // EE : Rajout de la ligne suivante pour permettre de mettre des commentaires sur la ligne de titre sans gêner la gestion du menu.
        const dataWithoutComments = data.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')
        const matchTitre =
          dataWithoutComments.match(
            /^export\s+(?:const|let)\s*titre\s*=\s*'((?:[^\\]\\'|[^'])*)'\s*$/ims,
          ) ||
          dataWithoutComments.match(
            /^export\s+(?:const|let)\s*titre\s*=\s*"((?:[^\\]\\"|[^"])*)"\s*$/ims,
          ) ||
          dataWithoutComments.match(
            /^export\s+(?:const|let)\s*titre\s*=\s*`((?:[^\\]\\`|[^`])*)`\s*$/ims,
          )
        if (matchTitre) {
          infos.titre = unescapeTitre(matchTitre[1])
        } else {
          logError(`${codePays}: titre non trouvé dans ${filePath}`)
        }
        const matchDate = data.match(
          /export const dateDePublication = '([^']*)'/,
        )
        if (matchDate) {
          infos.datePublication = matchDate[1]
        }
        const matchDateModif = data.match(
          /export const dateDeModifImportante = '([^']*)'/,
        )
        if (matchDateModif) {
          infos.dateModification = matchDateModif[1]
        }
        infos.features = {}
        const matchInteractif = data.match(
          /export const interactifReady = (.*)/,
        )
        const interactiveFormat = extractInteractiveType(data)
        if (matchInteractif && matchInteractif[1] === 'true') {
          infos.features.interactif = {
            isActive: true,
            type: interactiveFormat || 'mathlive',
          }
        } else {
          infos.features.interactif = {
            isActive: false,
            type: '',
          }
          exercicesNonInteractifs.push(filePath)
        }
        const matchAleatoire = data.match(
          /this\.pasDeVersionAleatoire\s*=\s*true/,
        )
        infos.features.aleatoire = {
          isActive: !matchAleatoire,
          type: '',
        }
        const matchAmcType = data.match(/export const amcType = '(.*)'/)
        if (matchAmcType) {
          infos.features.amc = {
            isActive: true,
            type: matchAmcType[1] || '',
          }
        } else {
          infos.features.amc = {
            isActive: false,
            type: '',
          }
        }
        if (qcmAvailable) {
          infos.features.qcm = { isActive: true, type: '' }
          infos.features.qcmcam = { isActive: true, type: '' }
        }
        infos.features.pasUniquementQcm = {
          isActive: pasUniquementQcm,
          type: '',
        }
        infos.typeExercice = 'alea'
        if (infos.id !== undefined) {
          if (refMap.has(infos.id)) {
            logError(
              `${codePays}: ref ${infos.id} en doublon dans ${filePath} et ${refMap.get(infos.id)}`,
            )
          }
          refMap.set(infos.id, filePath.replace('src/exercices/', ''))
          exercicesShuffled[infos.id] = { ...infos }
          refToUuid[infos.id] = infos.uuid
        }
      })
    }
  } else {
    if (
      !filePath.includes('beta') &&
      !filePath.includes('/apps/') &&
      !filePath.includes('a-2024') &&
      !filePath.includes('/ressources/')
    ) {
      logError(`${codePays}: ref non trouvé dans ${filePath}`)
    }
  }
}

// ToDo : automatiser la lecture de exercicesInteractifs
function handleExerciceSvelte(uuidToUrl) {
  uuidToUrl.spline = 'OutilSpline.svelte'
  uuidToUrl.clavier = 'ClavierTest.svelte'
  uuidToUrl.version = 'Version.svelte'
  uuidToUrl.equation = 'EquationSolve.svelte'
  uuidToUrl.outilScratch = 'OutilScratch.svelte'
  return uuidToUrl
}

// Trie les clés d'un objet pour rendre le JSON généré déterministe
// (l'ordre d'insertion dépend de l'ordre de fin des lectures concurrentes)
const sortKeys = (obj) =>
  Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = obj[key]
      return sorted
    }, {})

/**
 * Collecte les références des exercices effectivement rattachés au référentiel.
 */
function collectExerciseRefs(referentiel, refs = new Set()) {
  for (const value of Object.values(referentiel)) {
    if (value?.typeExercice === 'alea' && typeof value.id === 'string') {
      refs.add(value.id)
    } else if (value !== null && typeof value === 'object') {
      collectExerciseRefs(value, refs)
    }
  }
  return refs
}

/**
 * Signale les références françaises qui ne seront pas visibles dans le menu et
 * les feuilles utilisées dont le libellé manque. Ce contrôle reste informatif :
 * les fichiers de structure sont corrigés manuellement après examen du rapport.
 */
function reportMissingFrenchMenuEntries(referentiel, exercices, themesPath) {
  const attachedRefs = collectExerciseRefs(referentiel)
  const missingRefs = Object.keys(exercices).filter(
    (ref) => !attachedRefs.has(ref),
  )

  if (missingRefs.length > 0) {
    console.warn(
      `\nFR: ${missingRefs.length} référence(s) sans rattachement dans tasks/emptyRef2022.json. Pour la liste : LIST_MISSING_REFS=1 node tasks/updateMenuInternational.js`,
    )
  } else {
    console.log('\nFR: toutes les références sont rattachées au menu.')
  }

  if (process.env.LIST_MISSING_REFS && missingRefs.length > 0) {
    for (const ref of missingRefs) {
      const exercice = exercices[ref]
      console.warn(`  - ${ref} (${exercice.url}, uuid ${exercice.uuid})`)
    }
  }

  const missingTitles = themesPath
    .map((themePath) => ({
      path: themePath,
      theme: themePath.split('.').pop(),
    }))
    .filter(({ theme }) =>
      Object.keys(exercices).some((ref) => ref.startsWith(theme)),
    )
    .filter(
      ({ theme }) =>
        levelsThemesListFR[theme]?.titre === undefined &&
        codeToLevelList[theme] === undefined &&
        codeToThemeList[theme] === undefined,
    )

  if (missingTitles.length > 0) {
    console.warn(
      `\nFR: ${missingTitles.length} catégorie(s) utilisée(s) sans titre dans src/json/levelsThemesList.json :`,
    )
    for (const { path, theme } of missingTitles) {
      const matchingRefs = Object.keys(exercices).filter((ref) =>
        ref.startsWith(theme),
      )
      console.warn(`  - ${path} (refs : ${matchingRefs.join(', ')})`)
    }
  } else {
    console.log('FR: toutes les catégories utilisées ont un titre.')
  }
}

/**
 * Dans les niveaux indiqués, un sous-thème qui ne contient qu'un seul exercice
 * disparaît du menu : l'exercice est placé directement sous le thème, à la
 * place du sous-thème (les sous-thèmes de `tasks/emptyRef2022.json` et leurs
 * titres sont conservés, seul le référentiel généré est aplati).
 */
function flattenSingleExerciseSubthemes(referentiel, niveaux) {
  for (const niveau of niveaux) {
    for (const [theme, sousThemes] of Object.entries(
      referentiel[niveau] ?? {},
    )) {
      const aplati = {}
      for (const [code, contenu] of Object.entries(sousThemes)) {
        const entrees = Object.entries(contenu)
        if (entrees.length === 1 && entrees[0][1]?.typeExercice === 'alea') {
          aplati[entrees[0][0]] = entrees[0][1]
        } else {
          aplati[code] = contenu
        }
      }
      referentiel[niveau][theme] = aplati
    }
  }
}

const createFiles = (
  referentiel,
  uuidMap,
  exercicesShuffled,
  exercicesNonInteractifs,
  refToUuid,
  codePays,
  exercicesNonClasses = {},
) => {
  function findThemes(obj, path) {
    for (const key in obj) {
      const subObj = obj[key]
      const subPath = path.concat(key)
      categoryPaths.push(subPath.join('.'))
      if (Object.keys(subObj).length === 0) {
        themesPath.push(subPath.join('.'))
      } else {
        findThemes(subObj, subPath)
      }
    }
  }
  const themesPath = []
  const categoryPaths = []
  findThemes(referentiel, [])
  let uuidToUrl = Array.from(uuidMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .reduce((obj, [uuid, filePath]) => {
      obj[uuid] = filePath
      return obj
    }, {})
  // Sort exercices by keys
  const exercices = sortKeys(exercicesShuffled)
  fs.writeFile(
    'src/json/exercices' + codePays + '.json',
    JSON.stringify(exercices, null, 2),
  )
  fs.writeFile(
    'src/json/exercicesNonInteractifs' + codePays + '.json',
    JSON.stringify(exercicesNonInteractifs.sort(), null, 2),
  )
  uuidToUrl = handleExerciceSvelte(uuidToUrl)
  fs.writeFile(
    'src/json/uuidsToUrl' + codePays + '.json',
    JSON.stringify(uuidToUrl, null, 2),
  )
  fs.writeFile(
    'src/json/refToUuid' + codePays + '.json',
    JSON.stringify(sortKeys(refToUuid), null, 2),
  )
  const leafPaths = new Set(themesPath)
  const categoryCodes = categoryPaths.map((p) => p.split('.').pop())
  for (const themePath of categoryPaths) {
    const theme = themePath.split('.').pop()
    for (const key in exercices) {
      if (
        leafPaths.has(themePath)
          ? key.startsWith(theme)
          : (key === theme || key.startsWith(`${theme}-`)) &&
            !categoryCodes.some(
              (code) =>
                code.length > theme.length &&
                code.startsWith(theme) &&
                key.startsWith(code),
            )
      ) {
        const keys = themePath.split('.')
        let currentObj = referentiel
        for (let i = 0; i < keys.length; i++) {
          if (i < keys.length - 1) {
            if (currentObj[keys[i]] === undefined) {
              currentObj[keys[i]] = {}
            }
            currentObj = currentObj[keys[i]]
          } else {
            currentObj[keys[i]][key] = exercices[key]
          }
        }
      }
    }
  }
  // Exercices placés directement sous leur niveau parent (sans conteneur intermédiaire), en premier
  if (codePays === 'FR' && referentiel['1e']?.['1A'] && exercices['1A']) {
    referentiel['1e']['1A'] = {
      '1A': exercices['1A'],
      ...referentiel['1e']['1A'],
    }
  }
  if (codePays === 'FR' && referentiel['2e']?.['2A'] && exercices['2A']) {
    referentiel['2e']['2A'] = {
      '2A': exercices['2A'],
      ...referentiel['2e']['2A'],
    }
  }
  if (codePays === 'FR' && referentiel['3e']?.['3Auto'] && exercices['3Auto']) {
    referentiel['3e']['3Auto'] = {
      '3Auto': exercices['3Auto'],
      ...referentiel['3e']['3Auto'],
    }
  }
  if (codePays === 'FR' && referentiel['6e']?.['6Auto'] && exercices['6A']) {
    referentiel['6e']['6Auto'] = {
      '6A': exercices['6A'],
      ...referentiel['6e']['6Auto'],
    }
  }
  if (codePays === 'FR') {
    reportMissingFrenchMenuEntries(referentiel, exercices, themesPath)
  }
  if (codePays === 'FR') {
    fs.writeFile(
      'src/json/referentielGeometrieDynamique.json',
      JSON.stringify(referentiel['Géométrie dynamique'], null, 2),
    )
    delete referentiel['Géométrie dynamique']
  }
  // Add non-classified exercises for CH
  if (codePays === 'CH' && Object.keys(exercicesNonClasses).length > 0) {
    if (!referentiel['Non classés']) {
      referentiel['Non classés'] = {}
    }
    if (!referentiel['Non classés']['divers']) {
      referentiel['Non classés']['divers'] = {}
    }
    referentiel['Non classés']['divers'] = sortKeys(exercicesNonClasses)
  }
  if (codePays === 'FR') {
    flattenSingleExerciseSubthemes(referentiel, ['cm1', 'cm2'])
  }
  sortQcmInReferentiel(referentiel, codePays)
  fs.writeFile(
    'src/json/referentiel2022' + codePays + '.json',
    JSON.stringify(referentiel, null, 2).replaceAll('"c3"', '"CM1/CM2"'),
  )
}

function sortQcmInReferentiel(referentiel, codePays) {
  /**
   * Seulement pour le référentiel français
   * On suppose que le référentiel est de la forme level > theme > exercice ou levelFamily > level > theme > exercice
   * On ne gère donc pas le référentiel CAN
   * Si un exercice a un id qui contient 'QCM', on le déplace dans le sous-thème QCM
   */
  if (codePays !== 'FR') {
    return
  }
  for (const level in referentiel) {
    if (level === 'CAN') continue
    for (const theme in referentiel[level]) {
      for (const exercice in referentiel[level][theme]) {
        if (
          referentiel[level][theme][exercice]?.id &&
          referentiel[level][theme][exercice]?.id.includes('QCM')
        ) {
          const exerciceQcm = referentiel[level][theme][exercice]
          if (referentiel[level][theme].QCM === undefined) {
            referentiel[level][theme].QCM = {}
          }
          referentiel[level][theme].QCM[exerciceQcm.id] = { ...exerciceQcm }
          delete referentiel[level][theme][exercice]
        }
      }
    }
  }
  for (const levelFamily in referentiel) {
    if (levelFamily !== 'Terminale') continue
    for (const level in referentiel[levelFamily]) {
      for (const theme in referentiel[levelFamily][level]) {
        for (const exercice in referentiel[levelFamily][level][theme]) {
          if (
            referentiel[levelFamily][level][theme][exercice]?.id &&
            referentiel[levelFamily][level][theme][exercice]?.id.includes('QCM')
          ) {
            const exerciceQcm = referentiel[levelFamily][level][theme][exercice]
            if (referentiel[levelFamily][level][theme].QCM === undefined) {
              referentiel[levelFamily][level][theme].QCM = {}
            }
            referentiel[levelFamily][level][theme].QCM[exerciceQcm.id] = {
              ...exerciceQcm,
            }
            delete referentiel[levelFamily][level][theme][exercice]
          }
        }
      }
    }
  }
}

/**
 * Début du programme principal
 */

/**
 * On utilise emptyRef2022 pour initialiser referentiel2022 avec les niveaux et les catégories
 * En cas de création de niveau ou de chapitre, il faudra mettre à jour ce fichier
 */
const emptyRefCH = readFileSync('tasks/emptyRefCH.json')
const referentielCH = JSON.parse(emptyRefCH)

const emptyRef2022 = readFileSync('tasks/emptyRef2022.json')
const referentiel2022 = JSON.parse(emptyRef2022)

const exercicesDir = './src/exercices'

const contextCH = {
  codePays: 'fr-ch',
  uuidMap: new Map(),
  exercicesNonInteractifs: [],
  refToUuid: {},
  exercicesShuffled: {},
  exercicesNonClasses: {},
  refMap: new Map(),
}

const contextFR = {
  codePays: 'fr-fr',
  uuidMap: new Map(),
  exercicesNonInteractifs: [],
  refToUuid: {},
  exercicesShuffled: {},
  exercicesNonClasses: {},
  refMap: new Map(),
}

// Une seule traversée de src/exercices : chaque fichier n'est lu qu'une fois
// puis analysé pour chacun des deux pays
readInfos(exercicesDir, [contextCH, contextFR])
  .then(() => {
    createFiles(
      referentielCH,
      contextCH.uuidMap,
      contextCH.exercicesShuffled,
      contextCH.exercicesNonInteractifs,
      contextCH.refToUuid,
      'CH',
      contextCH.exercicesNonClasses,
    )
    console.log('CH: uuidsToUrl et referentiel ont été mis à jour')
    createFiles(
      referentiel2022,
      contextFR.uuidMap,
      contextFR.exercicesShuffled,
      contextFR.exercicesNonInteractifs,
      contextFR.refToUuid,
      'FR',
    )
    console.log(
      'FR: uuidsToUrl, referentiel et referentielGeometrieDynamique ont été mis à jour',
    )
    // On choisit comme point de comparaison la liste de UUID francais
    // (générée après la traversée pour que le test d'unicité porte sur la liste complète)
    let uuid = createUuid()
    while (contextFR.uuidMap.has(uuid)) {
      uuid = createUuid()
    }
    console.log('Le nouvel uuid généré est :', uuid)
    console.log(
      'Vous pouvez maintenant ajouter la ligne suivante au nouvel exercice :',
    )
    console.log(`export const uuid = '${uuid}'`)

    if (hasBlockingError) {
      console.error(
        '\nERREUR — des anomalies bloquantes ont été détectées ci-dessus (uuid ou référence en doublon/manquant, titre manquant...).',
      )
      process.exitCode = 1
    }
  })
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })

/**
 * Crée une Uuid de 5 caractères hexadécimaux (1M de possibilités)
 * @returns {string}
 */
function createUuid() {
  let dt = new Date().getTime()
  const uuid = 'xxxxx'.replace(/[xy]/g, (c) => {
    const r = ((dt + Math.random() * 16) % 16) | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}
