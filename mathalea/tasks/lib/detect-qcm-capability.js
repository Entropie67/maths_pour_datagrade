import { existsSync, readFileSync } from 'fs'
import path from 'path'
import ts from 'typescript'

const qcmHelpers = new Set([
  'addMathaleaQcm',
  'buildQcmForExercise',
  'buildSimpleVersionQcm',
  'createMultipleChoiceQcm',
  'createQcmFromJson',
  'createSimpleQcm',
  'propositionsQcm',
  'setQcm',
])

// Helpers qui créent un champ de saisie : un exercice qui les appelle propose
// autre chose qu'un QCM (par exemple la saisie courte de `ExerciceQcmACourt`).
const nonQcmInputHelpers = new Set([
  'ajouteChampTexte',
  'ajouteChampTexteMathLive',
  'remplisLesBlancs',
  'AddTabPropMathlive',
  'AddTabDbleEntryMathlive',
  'creeTableauMathliveElement',
])

const qcmFormats = new Set(['qcm', 'mathalea-qcm'])
const qcmCache = new Map()
const nonQcmCache = new Map()

function nodeName(node) {
  if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) return node.text
  if (ts.isStringLiteralLike(node)) return node.text
  if (ts.isPropertyAccessExpression(node)) return node.name.text
  return undefined
}

function isTrue(node) {
  return node?.kind === ts.SyntaxKind.TrueKeyword
}

function isQcmFormat(node) {
  return ts.isStringLiteralLike(node) && qcmFormats.has(node.text)
}

function resolveLocalModule(importerPath, moduleSpecifier) {
  if (!moduleSpecifier.startsWith('.')) return undefined

  const unresolvedPath = path.resolve(
    path.dirname(importerPath),
    moduleSpecifier,
  )
  const withoutExtension = unresolvedPath.replace(/\.(?:js|ts)$/, '')
  const candidates = [
    unresolvedPath,
    `${withoutExtension}.ts`,
    `${withoutExtension}.js`,
    path.join(unresolvedPath, 'index.ts'),
    path.join(unresolvedPath, 'index.js'),
  ]

  return candidates.find((candidate) => existsSync(candidate))
}

function importedBindings(sourceFile) {
  const bindings = new Map()

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.importClause == null
    ) {
      continue
    }

    const moduleSpecifier = statement.moduleSpecifier.text
    const { importClause } = statement
    if (importClause.name != null) {
      bindings.set(importClause.name.text, moduleSpecifier)
    }

    const namedBindings = importClause.namedBindings
    if (namedBindings != null && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements) {
        bindings.set(element.name.text, moduleSpecifier)
      }
    }
  }

  return bindings
}

function hasDirectQcmMarker(sourceFile) {
  let found = false

  function visit(node) {
    if (found) return

    if (
      ts.isCallExpression(node) &&
      qcmHelpers.has(nodeName(node.expression))
    ) {
      found = true
      return
    }

    if (
      ts.isPropertyAssignment(node) &&
      nodeName(node.name) === 'formatInteractif' &&
      isQcmFormat(node.initializer)
    ) {
      found = true
      return
    }

    if (
      ts.isPropertyDeclaration(node) &&
      ['versionQcm', 'versionQcmDisponible'].includes(nodeName(node.name)) &&
      isTrue(node.initializer)
    ) {
      found = true
      return
    }

    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const assignedName = nodeName(node.left)
      if (
        (assignedName === 'formatInteractif' && isQcmFormat(node.right)) ||
        (['versionQcm', 'versionQcmDisponible'].includes(assignedName) &&
          isTrue(node.right))
      ) {
        found = true
        return
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

function hasDirectNonQcmMarker(sourceFile) {
  let found = false

  function visit(node) {
    if (found) return

    if (
      ts.isCallExpression(node) &&
      nonQcmInputHelpers.has(nodeName(node.expression))
    ) {
      found = true
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

function inheritedModules(sourceFile) {
  const bindings = importedBindings(sourceFile)
  const modules = new Set()
  let inheritsExerciceQcm = false

  function visit(node) {
    if (!ts.isClassLike(node) || node.heritageClauses == null) {
      ts.forEachChild(node, visit)
      return
    }

    for (const clause of node.heritageClauses) {
      if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue
      for (const type of clause.types) {
        const parentName = nodeName(type.expression)
        if (parentName === 'ExerciceQcm' || parentName === 'ExerciceQcmA') {
          inheritsExerciceQcm = true
        } else if (parentName != null && bindings.has(parentName)) {
          modules.add(bindings.get(parentName))
        }
      }
    }
  }

  visit(sourceFile)
  return { inheritsExerciceQcm, modules }
}

/**
 * Détermine statiquement si un module d'exercice peut produire un QCM.
 *
 * L'analyse utilise l'AST TypeScript et suit les héritages provenant d'imports
 * locaux. Elle ne génère jamais l'exercice : son coût reste linéaire dans le
 * nombre de fichiers visités, chaque fichier étant mis en cache.
 */
export function isQcmExercise(filePath, source) {
  const absolutePath = path.resolve(filePath)
  if (qcmCache.has(absolutePath)) {
    return qcmCache.get(absolutePath)
  }

  const fileSource = source ?? readFileSync(absolutePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    absolutePath,
    fileSource,
    ts.ScriptTarget.Latest,
    true,
    absolutePath.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS,
  )

  if (hasDirectQcmMarker(sourceFile)) {
    qcmCache.set(absolutePath, true)
    return true
  }

  const { inheritsExerciceQcm, modules } = inheritedModules(sourceFile)
  if (inheritsExerciceQcm) {
    qcmCache.set(absolutePath, true)
    return true
  }

  // Évite les cycles d'import/héritage pendant la résolution récursive.
  qcmCache.set(absolutePath, false)
  for (const moduleSpecifier of modules) {
    const parentPath = resolveLocalModule(absolutePath, moduleSpecifier)
    if (parentPath != null && isQcmExercise(parentPath)) {
      qcmCache.set(absolutePath, true)
      return true
    }
  }

  return false
}

/**
 * Détermine statiquement si un exercice propose, même en option, autre chose
 * qu'un QCM : un champ de saisie (réponse courte, texte à trous, tableau…).
 *
 * La détection cherche les helpers de saisie dans le fichier et dans les
 * classes parentes importées localement (ainsi `ExerciceQcmACourt`, dont la
 * saisie courte est l'affichage par défaut, est reconnue à travers ses
 * héritiers). Un exercice qui n'est pas un QCM propose par définition autre
 * chose qu'un QCM : l'appelant combine ce résultat avec `isQcmExercise`.
 */
export function offersNonQcmFormat(filePath, source) {
  const absolutePath = path.resolve(filePath)
  if (nonQcmCache.has(absolutePath)) {
    return nonQcmCache.get(absolutePath)
  }

  const fileSource = source ?? readFileSync(absolutePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    absolutePath,
    fileSource,
    ts.ScriptTarget.Latest,
    true,
    absolutePath.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS,
  )

  if (hasDirectNonQcmMarker(sourceFile)) {
    nonQcmCache.set(absolutePath, true)
    return true
  }

  // Évite les cycles d'import/héritage pendant la résolution récursive.
  nonQcmCache.set(absolutePath, false)
  const { modules } = inheritedModules(sourceFile)
  for (const moduleSpecifier of modules) {
    const parentPath = resolveLocalModule(absolutePath, moduleSpecifier)
    if (parentPath != null && offersNonQcmFormat(parentPath)) {
      nonQcmCache.set(absolutePath, true)
      return true
    }
  }

  return false
}

export function clearQcmDetectionCache() {
  qcmCache.clear()
  nonQcmCache.clear()
}
