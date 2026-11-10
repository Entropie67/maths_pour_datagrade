#!/usr/bin/env node
// Supprime sur le serveur distant les releases de plus de 72 h, en préservant
// toujours la release actuellement en production (cible du lien symbolique) et
// la release la plus récente.
// Lit les infos de connexion dans le fichier .env à la racine du projet
// (mêmes variables que tasks/deploy_site.sh et tasks/rollback_site.js).
//
// Options :
//   --hours=<n>   Seuil d'ancienneté en heures (défaut : 72)
//   --dry-run     Affiche ce qui serait supprimé sans rien effacer
//   --yes         Ne demande pas de confirmation

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Format des dossiers de release produits par deploy_site.sh :
// date +"%Y_%m_%d_%Hh%Mmin%Ss" -> 2026_08_29_14h30min05s
const RELEASE_RE = /^(\d{4})_(\d{2})_(\d{2})_(\d{2})h(\d{2})min(\d{2})s$/

function parseArgs (argv) {
  const opts = { hours: 72, dryRun: false, yes: false }
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true
    else if (arg === '--yes' || arg === '-y') opts.yes = true
    else if (arg.startsWith('--hours=')) {
      const n = Number(arg.slice('--hours='.length))
      if (!Number.isFinite(n) || n <= 0) {
        console.error(`Valeur --hours invalide : ${arg}`)
        process.exit(1)
      }
      opts.hours = n
    } else {
      console.error(`Option inconnue : ${arg}`)
      process.exit(1)
    }
  }
  return opts
}

function loadEnv () {
  const envPath = path.join(projectRoot, '.env')
  if (!existsSync(envPath)) {
    console.error('Fichier .env introuvable à la racine du projet.')
    process.exit(1)
  }
  const env = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    env[key] = value
  }
  return env
}

function releaseDate (name) {
  const m = RELEASE_RE.exec(name)
  if (!m) return null
  const [, y, mo, d, h, mi, s] = m.map(Number)
  const date = new Date(y, mo - 1, d, h, mi, s)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatAge (ms) {
  const hours = ms / 3_600_000
  if (hours < 48) return `${hours.toFixed(1)} h`
  return `${(hours / 24).toFixed(1)} j`
}

function confirm (message) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(`${message} (o/N) `, answer => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'o')
    })
  })
}

const opts = parseArgs(process.argv.slice(2))
const env = loadEnv()
const { REMOTE_SERVER, REMOTE_BUILDS_PATH, REMOTE_DIST_PATH } = env

for (const [name, value] of Object.entries({ REMOTE_SERVER, REMOTE_BUILDS_PATH, REMOTE_DIST_PATH })) {
  if (!value) {
    console.error(`Variable ${name} manquante dans .env`)
    process.exit(1)
  }
}

function ssh (command) {
  return execFileSync('ssh', [REMOTE_SERVER, command], { encoding: 'utf8' })
}

try {
  console.log('Récupération des releases disponibles sur le serveur...')
  const releases = ssh(`ls -1t ${REMOTE_BUILDS_PATH}`)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (releases.length === 0) {
    console.error('Aucune release trouvée sur le serveur.')
    process.exit(1)
  }

  // Release en production : cible du lien symbolique distant. Indispensable pour
  // ne pas y toucher : si on n'arrive pas à la résoudre, on refuse de continuer.
  let currentRelease = ''
  try {
    const current = ssh(`readlink ${REMOTE_DIST_PATH}`).trim()
    currentRelease = current.split('/').filter(Boolean).pop() ?? ''
  } catch {
    // géré juste après
  }
  if (!currentRelease) {
    console.error(`Impossible de déterminer la release en production via ${REMOTE_DIST_PATH}. Abandon par sécurité.`)
    process.exit(1)
  }
  if (!releases.includes(currentRelease)) {
    console.error(`La release en production (${currentRelease}) n'apparaît pas dans ${REMOTE_BUILDS_PATH}. Abandon par sécurité.`)
    process.exit(1)
  }

  // Release la plus récente (ls -1t) : toujours conservée même si > seuil.
  const newestRelease = releases[0]

  const now = Date.now()
  const thresholdMs = opts.hours * 3_600_000
  const kept = []
  const toDelete = []

  for (const name of releases) {
    const date = releaseDate(name)
    let reason = ''
    if (name === currentRelease) reason = 'en prod'
    else if (name === newestRelease) reason = 'la plus récente'
    else if (!date) reason = 'nom non horodaté'
    else if (now - date.getTime() <= thresholdMs) reason = `< ${opts.hours} h`

    if (reason) {
      kept.push({ name, reason, date })
    } else {
      toDelete.push({ name, age: now - date.getTime() })
    }
  }

  console.log(`\nReleases conservées (${kept.length}) :`)
  for (const { name, reason, date } of kept) {
    const age = date ? `  (${formatAge(now - date.getTime())})` : ''
    console.log(`  · ${name}${age}  — ${reason}`)
  }

  if (toDelete.length === 0) {
    console.log(`\nAucune release de plus de ${opts.hours} h à supprimer.`)
    process.exit(0)
  }

  console.log(`\nReleases à supprimer (${toDelete.length}, > ${opts.hours} h) :`)
  for (const { name, age } of toDelete) {
    console.log(`  ✗ ${name}  (${formatAge(age)})`)
  }

  if (opts.dryRun) {
    console.log('\n--dry-run : rien n\'a été supprimé.')
    process.exit(0)
  }

  if (!opts.yes) {
    const ok = await confirm(`\nSupprimer définitivement ces ${toDelete.length} release(s) ?`)
    if (!ok) {
      console.log('Annulé.')
      process.exit(0)
    }
  }

  const buildsBase = REMOTE_BUILDS_PATH.replace(/\/+$/, '')
  for (const { name } of toDelete) {
    // Garde-fou : on ne construit un chemin qu'à partir d'un nom validé.
    if (!RELEASE_RE.test(name)) {
      console.log(`  ~ ${name} ignoré (nom inattendu).`)
      continue
    }
    process.stdout.write(`  Suppression de ${name}... `)
    ssh(`rm -rf ${buildsBase}/${name}`)
    console.log('ok')
  }

  console.log(`\n✅ ${toDelete.length} release(s) supprimée(s). Release en prod conservée : ${currentRelease}`)
} catch (err) {
  console.error(`\n${err.message || err}`)
  process.exit(1)
}
