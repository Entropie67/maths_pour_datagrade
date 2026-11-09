#!/usr/bin/env node
/**
 * tasks/update-apigeom-snapshots.js
 *
 * Met à jour les snapshots apigeom dans les tests capytale save.
 * À utiliser après une mise à jour du package apigeom pour faire repasser les tests.
 *
 * # 1. Lancer le serveur
 * pnpm dev
 * 
 * # 2. Dans un autre terminal, lancer le script
 * pnpm update:apigeom-snapshots
 *
 * # 3. Contrôler les changements
 * git diff tests/e2e/tests/view/
 *
 # 4. Relancer les tests pour valider
 * pnpm test:e2e:views

 */

import { spawnSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = resolve(__dirname, '..')

// Chemins des fichiers de test à mettre à jour
const TEST_SAVE = 'tests/e2e/tests/view/view.capytale.save.test.ts'
const TEST_SAVE_CAN = 'tests/e2e/tests/view/view.capytale.save.can.test.ts'

// Fichiers temporaires écrits par les tests en mode capture
const SNAPSHOT_SAVE = '/tmp/mathalea-apigeom-save.json'
const SNAPSHOT_SAVE_CAN = '/tmp/mathalea-apigeom-save-can.json'

// ─── 1. Nettoyage des anciens snapshots ───────────────────────────────────────

for (const file of [SNAPSHOT_SAVE, SNAPSHOT_SAVE_CAN]) {
  if (existsSync(file)) {
    unlinkSync(file)
    console.log(`🗑️  Ancien snapshot supprimé : ${file}`)
  }
}

// ─── 2. Vérification du serveur de développement ──────────────────────────────

console.log(
  '\n🔍 Vérification du serveur de développement sur http://localhost:5173 ...',
)
const curlResult = spawnSync(
  'curl',
  ['-s', '--max-time', '3', '-o', '/dev/null', 'http://localhost:5173'],
  {
    stdio: 'pipe',
  },
)
if (curlResult.status !== 0) {
  console.error(
    '❌ Le serveur de développement est inaccessible sur http://localhost:5173',
  )
  console.error("   Lancez-le d'abord avec : pnpm dev")
  process.exit(1)
}
console.log('✅ Serveur de développement actif.')

// ─── 3. Lancement des tests en mode capture ────────────────────────────────────

console.log(
  '\n🚀 Lancement des tests en mode capture (UPDATE_APIGEOM_SNAPSHOTS=1) ...',
)
console.log(
  "   (Les tests peuvent continuer d'échouer sur d'autres clés, c'est normal)\n",
)

const vitestResult = spawnSync(
  'pnpm',
  [
    'vitest',
    '--config',
    'tests/e2e/vitest.config.views.js',
    '--run',
    // Les filtres sont comparés aux chemins relatifs à la racine de la config
    // (tests/e2e), d'où les chemins sans ce préfixe.
    TEST_SAVE.replace('tests/e2e/', ''),
    TEST_SAVE_CAN.replace('tests/e2e/', ''),
  ],
  {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      UPDATE_APIGEOM_SNAPSHOTS: '1',
      AUTOTEST: 'true',
    },
  },
)

if (vitestResult.status !== 0) {
  console.log('\n⚠️  Les tests se sont terminés avec des erreurs.')
  console.log(
    '   Si les snapshots ont quand même été capturés, la mise à jour continue.',
  )
}

// ─── 4. Lecture des snapshots et mise à jour des fichiers ──────────────────────

let anyUpdated = false

// --- view.capytale.save.test.ts ---
if (existsSync(SNAPSHOT_SAVE)) {
  console.log(`\n📂 Lecture : ${SNAPSHOT_SAVE}`)
  try {
    const snapshots = JSON.parse(readFileSync(SNAPSHOT_SAVE, 'utf-8'))
    const testFilePath = resolve(ROOT_DIR, TEST_SAVE)
    const updated = updateTestFile(testFilePath, snapshots)
    if (updated) {
      console.log(`✅ Mis à jour : ${TEST_SAVE}`)
      anyUpdated = true
    }
  } catch (err) {
    console.error(
      `❌ Erreur lors de la lecture de ${SNAPSHOT_SAVE} :`,
      err.message,
    )
  }
} else {
  console.error(`\n❌ Snapshot non généré : ${SNAPSHOT_SAVE}`)
  console.error(
    `   Le test ${TEST_SAVE} n'a peut-être pas atteint la partie apigeom.`,
  )
}

// --- view.capytale.save.can.test.ts ---
if (existsSync(SNAPSHOT_SAVE_CAN)) {
  console.log(`\n📂 Lecture : ${SNAPSHOT_SAVE_CAN}`)
  try {
    const snapshots = JSON.parse(readFileSync(SNAPSHOT_SAVE_CAN, 'utf-8'))
    const testFilePath = resolve(ROOT_DIR, TEST_SAVE_CAN)
    const updated = updateTestFile(testFilePath, snapshots)
    if (updated) {
      console.log(`✅ Mis à jour : ${TEST_SAVE_CAN}`)
      anyUpdated = true
    }
  } catch (err) {
    console.error(
      `❌ Erreur lors de la lecture de ${SNAPSHOT_SAVE_CAN} :`,
      err.message,
    )
  }
} else {
  console.error(`\n❌ Snapshot non généré : ${SNAPSHOT_SAVE_CAN}`)
  console.error(
    `   Le test ${TEST_SAVE_CAN} n'a peut-être pas atteint la partie apigeom.`,
  )
}

// ─── 5. Résumé ────────────────────────────────────────────────────────────────

if (anyUpdated) {
  console.log('\n🎉 Snapshots mis à jour avec succès !')
  console.log('\n👀 Contrôlez les modifications :')
  console.log(`   git diff ${TEST_SAVE}`)
  console.log(`   git diff ${TEST_SAVE_CAN}`)
  console.log(
    "\n▶️  Relancez les tests pour vérifier qu'ils passent maintenant :",
  )
  console.log('   pnpm test:e2e:views')
} else {
  console.error("\n❌ Aucun fichier n'a été mis à jour.")
  process.exit(1)
}

// ─── Fonctions ────────────────────────────────────────────────────────────────

/**
 * Met à jour les valeurs attendues des clés apigeom dans un fichier de test TypeScript.
 *
 * La valeur est stockée comme un littéral de chaîne JS entre guillemets simples,
 * avec des séquences d'échappement (\n, \", \\, etc.).
 * La valeur capturée depuis le navigateur contient des vrais retours à la ligne
 * et des vrais guillemets doubles, qu'il faut correctement échapper.
 *
 * @param {string} filePath - Chemin absolu du fichier de test
 * @param {Record<string, string>} snapshots - Map clé apigeom → valeur réelle capturée
 * @returns {boolean} true si au moins une clé a été mise à jour
 */
function updateTestFile(filePath, snapshots) {
  let content = readFileSync(filePath, 'utf-8')
  let anyChanged = false

  for (const [key, actualValue] of Object.entries(snapshots)) {
    console.log(`  🔑 Clé : ${key}`)

    // Prépare la valeur pour insertion dans un littéral JS entre guillemets simples.
    // Ordre important : traiter les backslashes en premier pour éviter la double-substitution.
    const escapedValue = actualValue
      .replace(/\\/g, '\\\\') // \ → \\ (doit être fait en premier !)
      .replace(/'/g, "\\'") // ' → \'
      .replace(/\n/g, '\\n') // retour à la ligne réel → séquence d'échappement \n
      .replace(/\r/g, '\\r') // retour chariot réel → \r (précaution)

    // Échappe la clé pour utilisation dans une RegExp
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Correspond à :  keyName: 'valeur_ancienne',
    // La valeur peut contenir des séquences d'échappement (\n, \", \\, etc.)
    // Pattern pour un littéral de chaîne JS entre guillemets simples :
    //   (?:[^'\\]|\\[\s\S])*
    //   - [^'\\]     : n'importe quel caractère sauf ' et \
    //   - \\[\s\S]   : un \ suivi de n'importe quel caractère (séquence d'échappement)
    const regex = new RegExp(
      `(${escapedKey}:\\s*')((?:[^'\\\\]|\\\\[\\s\\S])*)(')`,
    )

    if (!regex.test(content)) {
      console.error(
        `  ❌ Impossible de trouver la clé "${key}" dans ${filePath}`,
      )
      console.error(`     La structure du fichier a peut-être changé.`)
      continue
    }

    // Utilise une fonction de remplacement pour éviter l'interprétation des
    // séquences spéciales ($1, $&, etc.) dans la chaîne de remplacement.
    const newContent = content.replace(
      regex,
      (_match, prefix, _oldValue, suffix) =>
        `${prefix}${escapedValue}${suffix}`,
    )

    if (newContent === content) {
      console.log(
        `  ℹ️  Valeur inchangée pour "${key}" (apigeom n'a pas changé cette clé)`,
      )
    } else {
      content = newContent
      anyChanged = true
      console.log(`  ✏️  Valeur mise à jour pour "${key}"`)
    }
  }

  if (anyChanged) {
    writeFileSync(filePath, content, 'utf-8')
  }

  return anyChanged
}
