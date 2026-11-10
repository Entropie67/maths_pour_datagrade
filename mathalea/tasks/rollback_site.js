#!/usr/bin/env node
// Restaure une ancienne release en prod en repointant le lien symbolique distant.
// Lit les infos de connexion dans le fichier .env à la racine du projet
// (mêmes variables que tasks/deploy_site.sh).

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

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

const env = loadEnv()
const { REMOTE_SERVER, REMOTE_BUILDS_PATH, REMOTE_DIST_PATH, REMOTE_STATIC_PATH } = env

for (const [name, value] of Object.entries({ REMOTE_SERVER, REMOTE_BUILDS_PATH, REMOTE_DIST_PATH, REMOTE_STATIC_PATH })) {
  if (!value) {
    console.error(`Variable ${name} manquante dans .env`)
    process.exit(1)
  }
}

function ssh (command) {
  return execFileSync('ssh', [REMOTE_SERVER, command], { encoding: 'utf8' })
}

function selectRelease (items, currentRelease) {
  return new Promise((resolve, reject) => {
    let index = Math.max(0, items.indexOf(currentRelease))
    readline.emitKeypressEvents(process.stdin)
    if (process.stdin.isTTY) process.stdin.setRawMode(true)

    const render = () => {
      console.clear()
      console.log('Sélectionne la release à restaurer en prod (↑/↓ puis Entrée, Échap pour annuler) :\n')
      for (const [i, item] of items.entries()) {
        const marker = i === index ? '❯' : ' '
        const suffix = item === currentRelease ? '  (en prod actuellement)' : ''
        console.log(`${marker} ${item}${suffix}`)
      }
    }

    const cleanup = () => {
      if (process.stdin.isTTY) process.stdin.setRawMode(false)
      process.stdin.removeListener('keypress', onKeypress)
      process.stdin.pause()
    }

    function onKeypress (str, key) {
      if (key.name === 'up') {
        index = (index - 1 + items.length) % items.length
        render()
      } else if (key.name === 'down') {
        index = (index + 1) % items.length
        render()
      } else if (key.name === 'return') {
        cleanup()
        resolve(items[index])
      } else if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        cleanup()
        reject(new Error('Annulé.'))
      }
    }

    process.stdin.on('keypress', onKeypress)
    render()
  })
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

  let currentRelease = ''
  try {
    const current = ssh(`readlink ${REMOTE_DIST_PATH}`).trim()
    currentRelease = current.split('/').filter(Boolean).pop() ?? ''
  } catch {
    // Lien absent ou cassé : pas grave, on continue sans le marquer.
  }

  const selected = await selectRelease(releases, currentRelease)

  if (selected === currentRelease) {
    console.log(`"${selected}" est déjà la release en production. Rien à faire.`)
    process.exit(0)
  }

  console.log(`\nRelease sélectionnée : ${selected}`)
  const ok = await confirm(`Basculer ${REMOTE_DIST_PATH} sur cette release ?`)
  if (!ok) {
    console.log('Annulé.')
    process.exit(0)
  }

  const targetPath = `${REMOTE_BUILDS_PATH.replace(/\/+$/, '')}/${selected}`
  console.log('Bascule en cours...')
  ssh(`rm ${REMOTE_DIST_PATH} && ln -s ${targetPath}/ ${REMOTE_DIST_PATH}`)

  try {
    ssh(`test -e ${REMOTE_DIST_PATH}/static`)
  } catch {
    console.log('Lien "static" manquant dans cette release, recréation...')
    ssh(`ln -s ${REMOTE_STATIC_PATH}/ ${REMOTE_DIST_PATH}/static`)
  }

  console.log(`\n✅ ${REMOTE_DIST_PATH} pointe maintenant vers ${targetPath}`)
} catch (err) {
  console.error(`\n${err.message || err}`)
  process.exit(1)
}
