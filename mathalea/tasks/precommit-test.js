#!/usr/bin/env node
/* eslint-disable no-undef */

// scripts/wait-for-server.ts
import { spawnSync } from 'node:child_process'

const sourceMode = process.argv[2] ?? 'staged'
const maxCommitsArg = process.argv[3] ?? '1'
const parsedMaxCommits = Number.parseInt(maxCommitsArg, 10)
const maxCommits =
  Number.isFinite(parsedMaxCommits) && parsedMaxCommits > 0
    ? parsedMaxCommits
    : 1

function runGit(args) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return {
    ok: result.status === 0,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
  }
}

function hasHeadCommit() {
  return runGit(['rev-parse', '--verify', 'HEAD']).ok
}

function hasCommand(commandName) {
  const result = spawnSync(commandName, ['--version'], {
    stdio: 'ignore',
  })
  return result.status === 0
}

function getChangedFiles() {
  if (sourceMode === 'staged') {
    const staged = runGit([
      'diff',
      '--cached',
      '--name-only',
      '--diff-filter=AM',
    ])
    if (!staged.ok) {
      throw new Error(
        staged.stderr || 'Impossible de récupérer les fichiers stagés.',
      )
    }
    return staged.stdout
      .split(/\r?\n/)
      .map((f) => f.trim())
      .filter(Boolean)
  }

  if (sourceMode === 'last-commit') {
    if (!hasHeadCommit()) {
      return []
    }

    const baseRef = `HEAD~${maxCommits}`
    const hasBase = runGit(['rev-parse', '--verify', baseRef]).ok

    if (hasBase) {
      const diff = runGit(['diff', '--name-only', `${baseRef}..HEAD`])
      if (diff.ok) {
        return diff.stdout
          .split(/\r?\n/)
          .map((f) => f.trim())
          .filter(Boolean)
      }
    }

    const showHead = runGit(['show', '--name-only', '--pretty=', 'HEAD'])
    if (!showHead.ok) {
      throw new Error(
        showHead.stderr ||
          'Impossible de récupérer les fichiers du dernier commit.',
      )
    }
    return showHead.stdout
      .split(/\r?\n/)
      .map((f) => f.trim())
      .filter(Boolean)
  }

  throw new Error(
    `Mode inconnu: ${sourceMode}. Utiliser staged ou last-commit.`,
  )
}

function isRelevantExerciseFile(filePath) {
  const normalized = filePath.replaceAll('\\\\', '/')
  if (!normalized.startsWith('src/exercices/')) return false
  if (normalized.includes('ressources') || normalized.includes('apps'))
    return false
  const segments = normalized.replace('src/exercices/', '').split('/')
  if (segments.length < 2) return false
  return normalized.endsWith('.ts') || normalized.endsWith('.js')
}

function runTestStep(stepName, command, args, extraEnv = {}) {
  console.log(`[TEST] ${stepName}...`)
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
  })
  return result.status === 0
}

function shouldRunLatexStep() {
  if (process.env.SKIP_EXOMODIFIED_LATEX === '1') {
    return {
      run: false,
      reason: 'SKIP_EXOMODIFIED_LATEX=1',
    }
  }

  if (!hasCommand('lualatex')) {
    return {
      run: false,
      reason: 'lualatex introuvable',
    }
  }

  return {
    run: true,
    reason: null,
  }
}

function main() {
  const changedFiles = getChangedFiles()
  const exerciseFiles = [
    ...new Set(changedFiles.filter(isRelevantExerciseFile)),
  ]

  if (exerciseFiles.length === 0) {
    console.log('Aucun exercice modifie detecte. Tests ExosModified ignores.')
    process.exit(0)
  }

  const changedFilesEnv = exerciseFiles.join('\n')

  console.log('[INFO] Fichiers exos pris en compte pour CHANGED_FILES:')
  console.log(changedFilesEnv)

  const steps = [
    {
      name: 'verification line breaks',
      command: 'pnpm',
      args: ['test:e2e:latex_breaks'],
      env: { CHANGED_FILES: changedFilesEnv },
    },
  ]

  /* const latexDecision = shouldRunLatexStep()
  if (latexDecision.run) {
    steps.push({
      name: 'LaTeX compile (sans UI)',
      command: 'pnpm',
      args: ['test:e2e:latex_compile'],
      env: { CHANGED_FILES: changedFilesEnv },
    })
  } else {
    console.log(`[INFO] Test LaTeX saute (${latexDecision.reason}).`)
    console.log('[INFO] Attendu localement: outils LaTeX (lualatex) installes.')
  }
*/
  const results = steps.map((step) => {
    const ok = runTestStep(step.name, step.command, step.args, step.env)
    return { name: step.name, ok }
  })

  for (const result of results) {
    console.log(`${result.ok ? '✅' : '❌'} ${result.name}`)
  }

  const okCount = results.filter((r) => r.ok).length

  if (okCount !== results.length) {
    process.exit(1)
  }
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[ERROR] ${message}`)
  process.exit(1)
}
