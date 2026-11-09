import { randint, texConsigne, texIntroduction } from '../../modules/outils'
import { format as formatLatex } from '../Latex'
import { loadPackagesFromContent } from '../latex/preambuleTex'
import type { contentsType } from '../LatexTypes'
import { lettreDepuisChiffre } from '../outils/outilString'
import type { IExercice } from '../types'
import {
  AMCPreambleTemplate,
  renderAMCCopyContent,
  renderAMCDocumentStart,
  renderAMCGroupSection,
  renderAMCHeader,
  renderAMCPreamble,
} from './amcDocumentTemplates'
import { renderAMCHybride, renderElement } from './amcRender'
import type { IExerciceAMC } from './amcTypes'

type ExportQcmAmcResult = [string, string, number, string, boolean]
/**
 * L'ensemble de ce fichier est le fruit du travail de Jean-claude Lhote
 * @author Jean-claude Lhote
 */
export type CreerDocumentAmcOptions = {
  exercices: (IExerciceAMC | IExercice)[]
  nbQuestions?: number[]
  groupLayouts?: Array<{
    pageBreakBefore?: boolean
    multicols?: boolean
  }>
  nbExemplaires?: number
  matiere?: string
  titre?: string
  typeEntete?: string
  format?: string
  fontSize?: '10pt' | '11pt' | '12pt'
  showWarningMessage?: boolean
  warningMessage?: string
  associationRoster?: string
  collectCorrectionsAtEnd?: boolean
  /** @deprecated Utiliser groupTitleOn pour un contrôle par groupe */
  titleOn?: boolean
  /** Visibilité du titre par exercice (index = position dans exercices[]). Prioritaire sur titleOn. */
  groupTitleOn?: boolean[]
  mergeGroupsAndShuffle?: boolean
  /** Titre du groupe total (fusion). Par défaut "Automatismes". */
  mergedGroupTitle?: string
  /**
   * Indices (dans exercices[]) des exercices à fusionner dans le groupe total.
   * null ou undefined = tous les groupes actifs sont fusionnés (comportement par défaut).
   */
  mergedGroupExerciseIndexes?: number[] | null
  assumeAmcPrepared?: boolean
}

export type AMCGroupConsistencyReport = {
  declaredGroups: string[]
  restitutedGroups: string[]
  missingGroupDefinitions: string[]
  unusedGroupDefinitions: string[]
}

const AMC_GROUPS_SECTION_START = '%%% préparation des groupes'
const AMC_GROUPS_SECTION_END = '%%%% -II-b. MISE EN PAGE DU QCM'

/**
 * Extrait les définitions de groupes d'un document LaTeX AMC complet.
 * Le résultat peut être inséré dans un document AMC qui fournit son propre
 * préambule et sa propre mise en page.
 */
export function extractAMCQuestionGroups(latexCode: string): string {
  const markerIndex = latexCode.indexOf(AMC_GROUPS_SECTION_START)
  if (markerIndex === -1) return ''

  const sectionStart = latexCode.lastIndexOf('\n', markerIndex) + 1
  const sectionEnd = latexCode.indexOf(AMC_GROUPS_SECTION_END, markerIndex)
  if (sectionEnd === -1) return ''

  const endMarkerLineStart = latexCode.lastIndexOf('\n', sectionEnd) + 1
  const separatorLineStart =
    latexCode.lastIndexOf('\n', endMarkerLineStart - 2) + 1
  return `${latexCode.slice(sectionStart, separatorLineStart).trim()}\n`
}

const DEFAULT_WARNING_MESSAGE =
  'REMPLIR avec un stylo NOIR la ou les cases pour chaque question. Si vous devez modifier un choix, NE PAS chercher à redessiner la case cochée par erreur, mettez simplement un coup de "blanc" dessus.\\\\\n\nLes questions précédées de \\multiSymbole peuvent avoir plusieurs réponses.\\\\ Les questions qui commencent par \\TT ne doivent pas être faites par les élèves disposant d\'un tiers temps.\\\\\n\nIl est fortement conseillé de faire les calculs dans sa tête ou sur la partie blanche de la feuille sans regarder les solutions proposées avant de remplir la bonne case plutôt que d\'essayer de choisir entre les propositions (ce qui demande de toutes les examiner et prend donc plus de temps).'

function escapeLatexText(value: string): string {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([#%&_$])/g, '\\$1')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
}

function buildAssociationSubjectsFromRoster(roster: string): string {
  const lines = roster
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const rendered: string[] = []
  let index = 1

  for (const line of lines) {
    const parts = line
      .split(/[;\t,]/)
      .map((part) => part.trim())
      .filter(Boolean)
    if (parts.length < 2) continue

    const first = parts[0].toLowerCase()
    const second = parts[1].toLowerCase()
    if (
      (first === 'nom' || first === 'lastname') &&
      (second === 'prenom' || second === 'prénom' || second === 'firstname')
    ) {
      continue
    }

    const nom = escapeLatexText(parts[0])
    const prenom = escapeLatexText(parts[1])
    const id = escapeLatexText(parts[2] ?? String(index))
    rendered.push(
      `\\def\\nom{${nom}}\\def\\prenom{${prenom}}\\def\\id{${id}}\\sujet`,
    )
    index++
  }

  return rendered.join('\n')
}

function findMatchingBrace(content: string, openBraceIndex: number): number {
  let depth = 0
  for (let i = openBraceIndex; i < content.length; i++) {
    const char = content[i]
    if (char === '{') depth++
    if (char === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function rewriteExplainCommandsInQuestionBlock(
  block: string,
  questionId: string,
): string {
  const explainToken = '\\explain{'
  let i = 0
  let rewritten = ''

  while (i < block.length) {
    const explainIndex = block.indexOf(explainToken, i)
    if (explainIndex === -1) {
      rewritten += block.slice(i)
      break
    }

    rewritten += block.slice(i, explainIndex)

    const openBraceIndex = explainIndex + explainToken.length - 1
    const closeBraceIndex = findMatchingBrace(block, openBraceIndex)
    if (closeBraceIndex === -1) {
      rewritten += block.slice(explainIndex)
      break
    }

    const explanation = block.slice(openBraceIndex + 1, closeBraceIndex)
    rewritten += `\\expliqueplustard{${questionId}}{${explanation}}`
    i = closeBraceIndex + 1
  }

  return rewritten
}

function rewriteExplainToDeferred(latexCode: string): string {
  const beginRegex =
    /\\begin\{(question|questionmult|questionmultx)\}\{([^}]*)\}/g
  let match: RegExpExecArray | null
  let currentIndex = 0
  let result = ''

  while ((match = beginRegex.exec(latexCode)) !== null) {
    const fullMatch = match[0]
    const env = match[1]
    const questionId = match[2]
    const blockStart = match.index
    const contentStart = blockStart + fullMatch.length
    const endToken = `\\end{${env}}`
    const blockEnd = latexCode.indexOf(endToken, contentStart)

    if (blockEnd === -1) continue

    result += latexCode.slice(currentIndex, contentStart)
    const blockBody = latexCode.slice(contentStart, blockEnd)
    result += rewriteExplainCommandsInQuestionBlock(blockBody, questionId)
    result += endToken
    currentIndex = blockEnd + endToken.length
    beginRegex.lastIndex = currentIndex
  }

  result += latexCode.slice(currentIndex)
  return result
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasPackageInLatex(latex: string, packageName: string): boolean {
  const escaped = escapeRegExp(packageName)
  const packageRegex = new RegExp(
    String.raw`\\usepackage(?:\[[^\]]*\])?\{[^}]*\b${escaped}\b[^}]*\}`,
  )
  return packageRegex.test(latex)
}

function parseUsepackageLine(line: string): {
  options: string | null
  packages: string[]
} | null {
  const match = line.match(/^\\usepackage(?:\[([^\]]*)\])?\{([^}]+)\}$/)
  if (!match) return null
  const options = match[1]?.trim() ? match[1].trim() : null
  const packages = match[2]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (packages.length === 0) return null
  return { options, packages }
}

function collectStaticAMCPackages(): Set<string> {
  const packages = new Set<string>()
  const regex = /\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(AMCPreambleTemplate)) !== null) {
    const names = match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    for (const name of names) packages.add(name)
  }
  return packages
}

function normalizeDynamicPreambleLines(lines: string[]): string[] {
  const staticPackages = collectStaticAMCPackages()
  const dynamicPackages = new Map<string, string | null>()
  const packageOrder: string[] = []
  const otherLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0 || trimmed.startsWith('%')) continue

    const packageDecl = parseUsepackageLine(trimmed)
    if (!packageDecl) {
      // Ne pas dédupliquer ici : certaines lignes (ex: "}") doivent
      // apparaître plusieurs fois pour conserver des blocs LaTeX valides.
      otherLines.push(trimmed)
      continue
    }

    for (const packageName of packageDecl.packages) {
      if (staticPackages.has(packageName)) continue

      if (!dynamicPackages.has(packageName)) {
        dynamicPackages.set(packageName, packageDecl.options)
        packageOrder.push(packageName)
        continue
      }

      const existingOptions = dynamicPackages.get(packageName)
      if (!existingOptions && packageDecl.options) {
        dynamicPackages.set(packageName, packageDecl.options)
      }
    }
  }

  const packageLines = packageOrder.map((packageName) => {
    const options = dynamicPackages.get(packageName)
    return options
      ? `\\usepackage[${options}]{${packageName}}`
      : `\\usepackage{${packageName}}`
  })

  return [...packageLines, ...otherLines]
}

function buildDynamicAMCPreamble(
  exercises: IExerciceAMC[],
  groupsContent: string,
): string {
  const dynamicContents: contentsType = {
    preamble: '',
    intro: '',
    content: groupsContent,
    contentCorr: '',
  }

  loadPackagesFromContent(dynamicContents)

  const detectedLines = dynamicContents.preamble
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('%'))

  const dynamicRawLines: string[] = [...detectedLines]

  const exercisePackages = new Set<string>()
  const exerciseCommands = new Set<string>()

  for (const exercise of exercises) {
    const maybePackages = (exercise as any).listePackages
    const packageList = Array.isArray(maybePackages)
      ? maybePackages
      : typeof maybePackages === 'string'
        ? [maybePackages]
        : []
    for (const entry of packageList) {
      if (typeof entry !== 'string') continue
      const trimmed = entry.trim()
      if (trimmed === '') continue
      if (trimmed.startsWith('cmd')) {
        exerciseCommands.add(trimmed.replace(/^cmd/, ''))
      } else {
        exercisePackages.add(trimmed)
      }
    }
  }

  for (const packageName of exercisePackages) {
    if (hasPackageInLatex(AMCPreambleTemplate, packageName)) continue
    if (packageName === 'bclogo') {
      dynamicRawLines.push('\\usepackage[tikz]{bclogo}')
    } else {
      dynamicRawLines.push(`\\usepackage{${packageName}}`)
    }
  }

  const additions = normalizeDynamicPreambleLines(dynamicRawLines)
  const seenLines = new Set(additions)

  for (const command of exerciseCommands) {
    const trimmed = command.trim()
    if (trimmed === '' || seenLines.has(trimmed)) continue
    additions.push(trimmed)
    seenLines.add(trimmed)
  }

  return additions.join('\n')
}

export function checkAMCGroupConsistency(
  latexCode: string,
): AMCGroupConsistencyReport {
  const declaredSet = new Set<string>()
  const restitutedSet = new Set<string>()

  const elementRegex = /\\element\{([^}]+)\}\{/g
  const restitueRegex = /\\restituegroupe(?:\[[^\]]*\])?\{([^}]+)\}/g
  const copygroupRegex = /\\copygroup(?:\[[^\]]*\])?\{([^}]+)\}\{([^}]+)\}/g

  let match: RegExpExecArray | null
  while ((match = elementRegex.exec(latexCode)) !== null) {
    declaredSet.add(match[1])
  }

  while ((match = restitueRegex.exec(latexCode)) !== null) {
    restitutedSet.add(match[1])
  }

  while ((match = copygroupRegex.exec(latexCode)) !== null) {
    const sourceGroup = match[1]
    const targetGroup = 'total' // Par convention, les groupes copiés sont destinés au groupe "total" dans le cas de la fusion.
    restitutedSet.add(sourceGroup)
    if (!declaredSet.has(sourceGroup)) {
      restitutedSet.delete(targetGroup)
    }
  }

  const declaredGroups = Array.from(declaredSet)
  const restitutedGroups = Array.from(restitutedSet)

  const missingGroupDefinitions = restitutedGroups.filter(
    (group) => group !== 'total' && !declaredSet.has(group),
  )
  const unusedGroupDefinitions = declaredGroups.filter(
    (group) => !restitutedSet.has(group),
  )

  return {
    declaredGroups,
    restitutedGroups,
    missingGroupDefinitions,
    unusedGroupDefinitions,
  }
}

/**
 * Exporte un exercice au format AMC (LaTeX) avec ses métadonnées de regroupement.
 * @param {IExerciceAMC} exercise Exercice à exporter.
 * @param {number} exerciseIndex Numéro unique pour gérer les noms des éléments d'un groupe de questions.
 * @returns {ExportQcmAmcResult} Tuple: [codeLatex, referenceGroupe, nombreQuestions, titre, melange].
 * @author Jean-claude Lhote
 */

export function exportQcmAmc(
  exercise: IExerciceAMC,
  exerciseIndex: number,
): ExportQcmAmcResult {
  const ref =
    `${exercise.id}${exercise.sup ? 'S' + exercise.sup : ''}${exercise.sup2 ? 'S2' + exercise.sup2 : ''}${exercise.sup3 ? 'S3' + exercise.sup3 : ''}${exercise.sup4 ? 'S4' + exercise.sup4 : ''}${exercise.sup5 ? 'S5' + exercise.sup5 : ''}`
      .replaceAll('-', '')
      .replaceAll('_', '')
  // Compatibilité transitoire : priorité à la structure AMC dédiée quand disponible.
  const exerciseAny = exercise as IExerciceAMC & {
    autoCorrectionAMC?: any[]
  }
  const autoCorrection = Array.isArray(exerciseAny.autoCorrectionAMC)
    ? exerciseAny.autoCorrectionAMC
    : (exercise.autoCorrection as any[])
  const title = exercise.titre
  const type = exercise.amcType
  let texQr = ''
  let isShuffled = true

  const sharedOpenStatementParts: string[] = []
  if (type === 'AMCOpen' && exercise.consigne?.trim()) {
    sharedOpenStatementParts.push(texConsigne(exercise.consigne).trim())
  }
  if (type === 'AMCOpen' && exercise.introduction?.trim()) {
    sharedOpenStatementParts.push(texIntroduction(exercise.introduction).trim())
  }
  const sharedOpenStatement = sharedOpenStatementParts.join('\n\n')

  let id = 0
  for (let j = 0; j < autoCorrection.length; j++) {
    if (autoCorrection[j] === undefined) {
      // Normalement, cela ne devrait jamais arriver.
      autoCorrection[j] = {}
    }
    switch (type) {
      case 'qcmMono': // question QCM à choix unique
      case 'qcmMult':
        texQr += renderElement(
          { type: 'qcm', data: autoCorrection[j] },
          {
            ref,
            id: `${ref}${lettreDepuisChiffre(exerciseIndex + 1)}${id + 10}`,
            exercice: exercise,
            index: j,
            type: type === 'qcmMult' ? 'qcmMult' : 'qcm',
          },
        )
        id++
        break
      case 'AMCOpen': // question ouverte AMCOpen corrigée par l'enseignant
        const openItem =
          sharedOpenStatement === ''
            ? autoCorrection[j]
            : {
                ...autoCorrection[j],
                enonce: [sharedOpenStatement, autoCorrection[j].enonce ?? '']
                  .filter((part) => part.trim() !== '')
                  .join('\n\n'),
              }
        texQr += renderElement(
          { type: 'open', data: openItem },
          {
            ref,
            id: `${ref}${lettreDepuisChiffre(exerciseIndex + 1)}${id + 10}`,
            exercice: exercise,
            index: j,
          },
        )
        id++
        break
      case 'AMCNum':
        texQr += renderElement(
          { type: 'num', data: autoCorrection[j] },
          {
            ref,
            id: `${ref}${lettreDepuisChiffre(exerciseIndex + 1)}${id + 10}`,
            exercice: exercise,
            index: j,
          },
        )
        id++
        break
      default: {
        // Si on arrive ici, c'est que le type est AMCHybride.
        const hybrid = renderAMCHybride({
          type,
          autoCorrectionItem: autoCorrection[j],
          exercice: exercise,
          ref,
          idExo: exerciseIndex,
          questionIndex: j,
          currentId: id,
          melange: isShuffled,
        })
        texQr += hybrid.texQr
        id = hybrid.nextId
        isShuffled = hybrid.melange
        break
      }
    }
  }

  texQr = texQr
    .replaceAll('<br><br>', '\n\n\\medskip\n')
    .replaceAll('<br>', '\n\n')
  return [texQr, ref, exercise.nbQuestions, title, isShuffled]
}

/**
 * @author Jean-claude Lhote
 * Fonction qui crée un document pour AMC (pour le compiler, le package automultiplechoice.sty doit être présent)
 *
 * exercices est un tableau d'exercices TypeExercice[]
 *
 * nbQuestions est un tableau pour préciser le nombre de questions à prendre dans chaque groupe pour constituer une copie.
 * s'il est indéfini, toutes les questions du groupe seront posées.
 * nbExemplaires est le nombre de copies à générer.
 * matiere et titre se passent de commentaires : ils renseignent l'entête du sujet.
 * @param {{
 *   exercices: (IExercice|IExerciceAMC)[],
 *   nbQuestions?: number[],
 *   nbExemplaires?: number,
 *   matiere?: string,
 *   titre?: string,
 *   typeEntete?: string,
 *   format?: string
 * }} options
 */
export function creerDocumentAmc(options: CreerDocumentAmcOptions): string {
  const {
    exercices: exercises,
    nbQuestions = [] as number[],
    groupLayouts = [],
    nbExemplaires: copiesCount = 1,
    matiere: subject = 'Mathématiques',
    titre: title = 'Evaluation',
    typeEntete: headerType = 'AMCcodeGrid',
    format = 'A4',
    fontSize = '10pt',
    showWarningMessage = true,
    warningMessage = DEFAULT_WARNING_MESSAGE,
    associationRoster = '',
    collectCorrectionsAtEnd = false,
    titleOn = true,
    groupTitleOn,
    mergeGroupsAndShuffle = false,
    mergedGroupTitle = 'Automatismes',
    mergedGroupExerciseIndexes,
    assumeAmcPrepared = false,
  } = options
  // Attention exercises est maintenant un tableau de tous les exercices.
  // Dans cette partie, la fonction récupère tous les exercices et les trie pour les rassembler par groupe.
  // Toutes les questions d'un même exercice seront regroupées.
  let exerciseIndex = 0
  let exerciceInputIndex = 0
  const exerciceIndexForGroup: number[] = []
  const areGroupQuestionCountsImplicit: boolean[] = []
  const seed = randint(1, 100000)
  const groupRefs: string[] = []
  const groupTexBlocks: string[] = ['']
  const groupTitles: string[] = []
  const groupShuffleFlags: boolean[] = []
  // En mode setup AMC, les exercices sont déjà préparés (inférence + fallback)
  // dans Amc.svelte. On évite ici toute ré-inférence/régénération pour ne pas
  // réinjecter un état HTML dans le LaTeX final.
  if (!assumeAmcPrepared) {
    // Compatibilité: si l'appelant ne prépare pas en amont, on exporte seulement
    // les exercices explicitement marqués amcReady.
  }
  const amcExerciseCount = exercises.filter((el) => el.amcReady).length
  if (amcExerciseCount === 0) return ''
  for (const exercise of exercises) {
    if (!exercise.amcReady) {
      exerciceInputIndex++
      continue
    }
    if (!exercise.amcReady) {
      exerciceInputIndex++
      continue
    }

    const [
      exerciseTex,
      groupRef,
      exerciseQuestionCount,
      exerciseTitle,
      exerciseIsShuffled,
    ] = exportQcmAmc(exercise as IExerciceAMC, exerciseIndex)
    exerciseIndex++
    const groupIndex = groupRefs.indexOf(groupRef)
    if (groupIndex === -1) {
      // Le groupe n'existe pas encore.
      const newGroupIndex = groupRefs.length
      groupRefs.push(groupRef)
      exerciceIndexForGroup[newGroupIndex] = exerciceInputIndex
      groupTexBlocks[newGroupIndex] = formatLatex(exerciseTex)

      // Si le nombre de questions du groupe n'est pas défini, on prend toutes les questions de l'exercice.
      if (typeof nbQuestions[newGroupIndex] === 'undefined') {
        areGroupQuestionCountsImplicit[newGroupIndex] = true
        nbQuestions[newGroupIndex] = exerciseQuestionCount
      } else {
        // Le nombre de questions à restituer pour ce groupe a été fixé par l'utilisateur.
        areGroupQuestionCountsImplicit[newGroupIndex] = false
        areGroupQuestionCountsImplicit[newGroupIndex] = false
      }
      groupTitles[newGroupIndex] = exerciseTitle
      groupShuffleFlags[newGroupIndex] = exerciseIsShuffled
    } else {
      // Le groupe existe déjà : on ajoute seulement si ce bloc n'est pas déjà présent.
      if (groupTexBlocks[groupIndex].indexOf(exerciseTex) === -1) {
        groupTexBlocks[groupIndex] += exerciseTex
        // Si le nombre de questions était implicite, on cumule avec les questions de l'exercice ajouté.
        if (areGroupQuestionCountsImplicit[groupIndex]) {
          nbQuestions[groupIndex] += exerciseQuestionCount
        }
      }
    }
    exerciceInputIndex++
  }
  // Fin de la préparation des groupes.

  let isDuplexPrinting = false
  const duplexPrintingCheckbox = document.getElementById(
    'impression_recto_verso',
  ) as HTMLInputElement | null
  if (duplexPrintingCheckbox !== null)
    isDuplexPrinting = duplexPrintingCheckbox.checked
  let latexCode = ''

  const documentClassOptions = [
    isDuplexPrinting ? 'twoside' : null,
    fontSize,
    format === 'A3' ? 'a3paper' : 'a4paper',
    format === 'A3' ? 'landscape' : null,
    'french',
    'svgnames',
  ]
    .filter(Boolean)
    .join(',')

  const activeGroupIndexes: number[] = []
  for (let i = 0; i < groupRefs.length; i++) {
    if (groupTexBlocks[i].includes('\\element{')) {
      activeGroupIndexes.push(i)
    }
  }

  let groupsContent = ''
  for (const i of activeGroupIndexes) {
    groupsContent += groupTexBlocks[i]
  }

  const preambule = renderAMCPreamble({
    documentClassOptions,
    dynamicPreamble: buildDynamicAMCPreamble(
      exercises as IExerciceAMC[],
      groupsContent,
    ),
  })

  const documentStart = renderAMCDocumentStart({
    seed,
    groupsContent,
    mergeGroupsAndShuffle,
  })

  const copyHeader = renderAMCHeader({
    isA3: format === 'A3',
    isAssociation: headerType === 'AMCassociation',
    isCodeGrid: headerType === 'AMCcodeGrid',
    matiere: subject,
    titre: title,
    nbExemplaires: copiesCount,
    collectCorrectionsAtEnd,
    showWarningMessage,
    warningMessage,
  })

  let groupsSections = ''
  const mergedGroupCopies: string[] = []
  let mergedTotalQuestions = 0
  let totalGroupSection = ''
  let nonMergedGroupsSections = ''

  const mergedGroupExerciseIndexSet =
    mergedGroupExerciseIndexes != null
      ? new Set(mergedGroupExerciseIndexes)
      : null

  for (const i of activeGroupIndexes) {
    const groupName = groupRefs[i]
    const questionsToRestore = Math.max(0, Number(nbQuestions[i]) || 0)
    const exIdx = exerciceIndexForGroup[i] ?? i
    const groupTitleVisible = groupTitleOn?.[exIdx] ?? titleOn

    if (mergeGroupsAndShuffle) {
      const isMerged =
        mergedGroupExerciseIndexSet === null ||
        mergedGroupExerciseIndexSet.has(exIdx)

      if (isMerged && questionsToRestore > 0) {
        mergedGroupCopies.push(
          `\\copygroup[${questionsToRestore}]{${groupName}}{total}`,
        )
        mergedTotalQuestions += questionsToRestore
      } else if (!isMerged) {
        nonMergedGroupsSections += renderAMCGroupSection({
          groupTitle: groupTitleVisible ? groupTitles[i] : '',
          groupName,
          isMixed: groupShuffleFlags[i],
          questionsToRestore,
          pageBreakBefore: groupLayouts[exIdx]?.pageBreakBefore,
          multicols: groupLayouts[exIdx]?.multicols,
        })
      }
    } else {
      groupsSections += renderAMCGroupSection({
        groupTitle: groupTitleVisible ? groupTitles[i] : '',
        groupName,
        isMixed: groupShuffleFlags[i],
        questionsToRestore,
        pageBreakBefore: groupLayouts[exIdx]?.pageBreakBefore,
        multicols: groupLayouts[exIdx]?.multicols,
      })
    }
  }

  if (mergeGroupsAndShuffle && mergedGroupCopies.length > 0) {
    const totalSectionBody = renderAMCGroupSection({
      groupTitle: mergedGroupTitle,
      groupName: 'total',
      isMixed: true,
      questionsToRestore: mergedTotalQuestions,
    })
    totalGroupSection = `\\cleargroup{total}\n${mergedGroupCopies.join('\n')}\n${totalSectionBody}`
  }

  const copyContent = renderAMCCopyContent({
    isCodeGrid: headerType === 'AMCcodeGrid',
    groupsSections,
    totalGroupSection,
    nonMergedGroupsSections,
    isA3: format === 'A3',
    isAssociation: headerType === 'AMCassociation',
    collectCorrectionsAtEnd,
    mergeGroupsAndShuffle,
  })

  latexCode = preambule + '\n' + documentStart + '\n' + copyHeader + copyContent
  if (headerType === 'AMCassociation') {
    const renderedRoster = buildAssociationSubjectsFromRoster(associationRoster)
    if (renderedRoster.length > 0) {
      latexCode += `\n${renderedRoster}\n`
    } else {
      latexCode +=
        '\n \n \\csvreader[head to column names]{liste.csv}{}{\\sujet}\n'
    }
  }
  latexCode += '\\end{document}\n'

  // AMC 1.5 + bm can choke on nested \boldsymbol{\boldsymbol{...}} patterns
  // produced by some exercise corrections, causing cascading compile errors.
  latexCode = latexCode.replace(
    /\\boldsymbol\{\\boldsymbol\{([^{}]+)\}\}/g,
    '\\boldsymbol{$1}',
  )

  if (collectCorrectionsAtEnd) {
    latexCode = rewriteExplainToDeferred(latexCode)
  }

  const consistencyReport = checkAMCGroupConsistency(latexCode)
  if (consistencyReport.missingGroupDefinitions.length > 0) {
    console.warn(
      '[AMC] Group consistency issue: groups restituted without element definitions',
      consistencyReport,
    )
  }

  return latexCode
}
