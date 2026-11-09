#!/usr/bin/env node
import { execSync } from 'child_process'
import path from 'path'

// ---------------------------------------------------
// 1. Récupérer les fichiers modifiés ou ajoutés
// ---------------------------------------------------
let changedFiles = []
try {
  changedFiles = execSync('git diff --cached --name-only --diff-filter=AM', {
    stdio: ['pipe', 'pipe', 'ignore'],
  })
    .toString()
    .split(/\r?\n/)
    .filter(Boolean)
} catch (e) {
  console.error('Erreur lors de la récupération des fichiers modifiés', e)
  process.exit(1)
}

if (!changedFiles.length) {
  console.log('Aucun fichier modifié ou ajouté. Rien à tester.')
  process.exit(0)
}

// ---------------------------------------------------
// 2. Filtrer les fichiers pertinents (exemple : src/exercices/*.ts)
// ---------------------------------------------------
const testFiles = changedFiles.filter(
  (f) => f.startsWith('src/exercices/') && f.endsWith('.ts'),
)

if (!testFiles.length) {
  console.log('Aucun fichier de test modifié.')
  process.exit(0)
}

// ---------------------------------------------------
// 3. Lancer les tests sur ces fichiers
// ---------------------------------------------------
try {
  console.log('Lancer les tests sur :', testFiles.join(', '))

  // cross-platform : on peut passer la variable d'env via process.env
  execSync(
    'pnpm vitest --config tests/e2e/vitest.config.all_exercises.js --run',
    {
      stdio: 'inherit',
      cwd: path.resolve(process.cwd()),
      env: {
        ...process.env,
        CI: 'true',
        CHANGED_FILES: testFiles.join(' '),
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
    },
  )

  console.log('✅ Tous les tests sont passés.')
} catch (err) {
  console.error('❌ Des tests ont échoué. Commit annulé.', err)
  process.exit(1)
}

process.exit(0)
