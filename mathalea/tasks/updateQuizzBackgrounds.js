/**
 * Ce script met à jour src/json/quizzBackgrounds.json avec la liste des
 * images présentes dans public/images/quizz/backgrounds/.
 *
 * Le site étant statique, le dossier ne peut pas être listé à l'exécution :
 * ce manifeste généré au build sert de source de vérité pour la vue quizz
 * (choix d'un fond d'écran fixe ou aléatoire).
 *
 * Exécuté automatiquement par `pnpm makeJson` (donc par dev/start/build).
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import path from 'path'

const backgroundsDir = path.resolve('public/images/quizz/backgrounds')
const outputFile = path.resolve('src/json/quizzBackgrounds.json')
const imageExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.avif',
])

if (!existsSync(backgroundsDir)) {
  mkdirSync(backgroundsDir, { recursive: true })
}

const files = readdirSync(backgroundsDir, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isFile() &&
      imageExtensions.has(path.extname(entry.name).toLowerCase()),
  )
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, 'fr'))

writeFileSync(outputFile, JSON.stringify(files, null, 2) + '\n')
