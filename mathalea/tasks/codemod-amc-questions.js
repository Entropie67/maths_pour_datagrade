#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const rootDir = process.cwd()
const sourceRoot = path.join(rootDir, 'src')
const cliArgs = process.argv.slice(2)
const applyChanges = cliArgs.includes('--apply')
const targetArgs = cliArgs.filter((arg) => !arg.startsWith('--'))
const targetRoots =
  targetArgs.length > 0
    ? targetArgs.map((arg) => path.resolve(rootDir, arg))
    : [sourceRoot]

const skippedFiles = []
const changedFiles = []
const insertedStatements = []

async function collectTsFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue

    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectTsFiles(fullPath)))
      continue
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(fullPath)
    }
  }

  return files
}

async function collectTsTargets(targets) {
  const files = []

  for (const target of targets) {
    const stat = await fs.stat(target)
    if (stat.isDirectory()) {
      files.push(...(await collectTsFiles(target)))
      continue
    }

    if (
      stat.isFile() &&
      (target.endsWith('.ts') || target.endsWith('.tsx')) &&
      !target.endsWith('.d.ts')
    ) {
      files.push(target)
    }
  }

  return files
}

function getIndent(sourceText, position) {
  const lineStart = sourceText.lastIndexOf('\n', position - 1) + 1
  const indentationMatch = sourceText.slice(lineStart, position).match(/^\s*/)
  return indentationMatch?.[0] ?? ''
}

function isAutoCorrectionAMCElementAccess(node) {
  return (
    ts.isElementAccessExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'autoCorrectionAMC' &&
    node.argumentExpression != null
  )
}

function isAutoCorrectionAMCPropertyAccess(node) {
  return (
    ts.isPropertyAccessExpression(node) &&
    node.name.text === 'autoCorrectionAMC'
  )
}

function makeIndexedInsertion(sourceText, statement, leftSide) {
  const receiverText = sourceText.slice(
    leftSide.expression.expression.getStart(),
    leftSide.expression.expression.getEnd(),
  )
  const indexText = sourceText.slice(
    leftSide.argumentExpression.getStart(),
    leftSide.argumentExpression.getEnd(),
  )
  const indent = getIndent(sourceText, statement.getStart())

  return `${indent}${receiverText}.questionsAMC[${indexText}] = amcConvert(${receiverText}.autoCorrectionAMC[${indexText}])`
}

function makeArrayInsertion(sourceText, statement, leftSide) {
  const receiverText = sourceText.slice(
    leftSide.expression.getStart(),
    leftSide.expression.getEnd(),
  )
  const indent = getIndent(sourceText, statement.getStart())

  return `${indent}${receiverText}.questionsAMC = ${receiverText}.autoCorrectionAMC.map((questionAMC) => amcConvert(questionAMC))`
}

function hasNearbyQuestionsAssignment(sourceText, statementEnd) {
  const after = sourceText.slice(statementEnd, statementEnd + 250)
  return /questionsAMC\s*(\[|=)/.test(after)
}

function getAutoCorrectionAMCBaseInfo(sourceText, node) {
  if (ts.isPropertyAccessExpression(node)) {
    if (node.name.text === 'autoCorrectionAMC') {
      return {
        kind: 'array',
        receiverText: sourceText.slice(
          node.expression.getStart(),
          node.expression.getEnd(),
        ),
      }
    }

    return getAutoCorrectionAMCBaseInfo(sourceText, node.expression)
  }

  if (ts.isElementAccessExpression(node)) {
    if (
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'autoCorrectionAMC' &&
      node.argumentExpression != null
    ) {
      return {
        kind: 'indexed',
        receiverText: sourceText.slice(
          node.expression.expression.getStart(),
          node.expression.expression.getEnd(),
        ),
        indexText: sourceText.slice(
          node.argumentExpression.getStart(),
          node.argumentExpression.getEnd(),
        ),
      }
    }

    return getAutoCorrectionAMCBaseInfo(sourceText, node.expression)
  }

  return null
}

function getAmcBuildersImportPath(filePath) {
  const relativePath = path.relative(
    path.dirname(filePath),
    path.join(rootDir, 'src/lib/amc/amcBuilders'),
  )
  return relativePath.startsWith('.')
    ? relativePath.replaceAll(path.sep, '/')
    : `./${relativePath.replaceAll(path.sep, '/')}`
}

function findAmcBuildersImport(sourceFile) {
  return sourceFile.statements.find((statement) => {
    if (!ts.isImportDeclaration(statement)) return false
    if (!ts.isStringLiteral(statement.moduleSpecifier)) return false
    return statement.moduleSpecifier.text.endsWith('/lib/amc/amcBuilders')
  })
}

function buildAmcConvertImportLine(filePath, sourceText, sourceFile) {
  const importPath = getAmcBuildersImportPath(filePath)
  const existingImport = findAmcBuildersImport(sourceFile)

  if (existingImport != null) {
    const namedBindings = existingImport.importClause?.namedBindings
    if (namedBindings != null && ts.isNamedImports(namedBindings)) {
      const importNames = namedBindings.elements.map(
        (element) => element.name.text,
      )
      if (importNames.includes('amcConvert')) return null

      const updatedNames = ['amcConvert', ...importNames].sort()
      return {
        kind: 'replace',
        start: existingImport.getStart(),
        end: existingImport.getEnd(),
        text: sourceText
          .slice(existingImport.getStart(), existingImport.getEnd())
          .replace(/\{[^}]*\}/, `{ ${updatedNames.join(', ')} }`),
      }
    }
  }

  const lastImport = sourceFile.statements.filter(ts.isImportDeclaration).at(-1)

  const insertionPoint =
    lastImport?.getEnd() ?? sourceFile.statements[0]?.getStart() ?? 0

  return {
    kind: 'insert',
    start: insertionPoint,
    end: insertionPoint,
    text: `${lastImport != null ? '\n' : ''}import { amcConvert } from '${importPath}'\n`,
  }
}

function insertImportStatement(sourceText, sourceFile, filePath) {
  const importEdit = buildAmcConvertImportLine(filePath, sourceText, sourceFile)
  if (importEdit == null) return sourceText

  const prefix = sourceText.slice(0, importEdit.start)
  const suffix = sourceText.slice(importEdit.end)
  return `${prefix}${importEdit.text}${suffix}`
}

function collectEditsForFile(sourceText, filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

  const edits = []

  const visit = (node) => {
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const leftSide = node.expression.left

      const baseInfo = getAutoCorrectionAMCBaseInfo(sourceText, leftSide)
      if (
        baseInfo != null &&
        !hasNearbyQuestionsAssignment(sourceText, node.getEnd())
      ) {
        const insertionText =
          baseInfo.kind === 'indexed'
            ? `${getIndent(sourceText, node.getStart())}${baseInfo.receiverText}.questionsAMC[${baseInfo.indexText}] = amcConvert(${baseInfo.receiverText}.autoCorrectionAMC[${baseInfo.indexText}])`
            : `${getIndent(sourceText, node.getStart())}${baseInfo.receiverText}.questionsAMC = ${baseInfo.receiverText}.autoCorrectionAMC.map((questionAMC) => amcConvert(questionAMC))`

        edits.push({
          start: node.getEnd(),
          text: '\n' + insertionText,
        })
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return edits.sort((a, b) => b.start - a.start)
}

async function processFile(filePath) {
  const sourceText = await fs.readFile(filePath, 'utf8')
  const edits = collectEditsForFile(sourceText, filePath)

  if (edits.length === 0) {
    skippedFiles.push(filePath)
    return
  }

  let nextText = sourceText
  for (const edit of edits) {
    nextText = `${nextText.slice(0, edit.start)}${edit.text}${nextText.slice(edit.start)}`
  }

  const sourceFile = ts.createSourceFile(
    filePath,
    nextText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  nextText = insertImportStatement(nextText, sourceFile, filePath)

  if (applyChanges) {
    await fs.writeFile(filePath, nextText)
  }

  changedFiles.push(filePath)
  insertedStatements.push({ filePath, count: edits.length })
}

async function main() {
  const files = await collectTsTargets(targetRoots)

  for (const filePath of files) {
    await processFile(filePath)
  }

  const modeLabel = applyChanges ? 'apply' : 'dry-run'
  console.log(`[amc-questions codemod] mode: ${modeLabel}`)
  console.log(`[amc-questions codemod] targets: ${targetRoots.join(', ')}`)
  console.log(`[amc-questions codemod] scanned files: ${files.length}`)
  console.log(`[amc-questions codemod] changed files: ${changedFiles.length}`)
  console.log(
    `[amc-questions codemod] inserted statements: ${insertedStatements.reduce((total, item) => total + item.count, 0)}`,
  )

  if (!applyChanges) {
    for (const entry of insertedStatements.slice(0, 20)) {
      console.log(`  - ${entry.filePath} (+${entry.count})`)
    }
    if (insertedStatements.length > 20) {
      console.log(`  ... ${insertedStatements.length - 20} other files`)
    }
    if (changedFiles.length === 0) {
      console.log('[amc-questions codemod] nothing to do')
    }
    return
  }

  if (changedFiles.length > 0) {
    console.log('[amc-questions codemod] files written successfully')
  } else {
    console.log('[amc-questions codemod] nothing to write')
  }
}

await main()
