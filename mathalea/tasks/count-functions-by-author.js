// Script Node.js pour compter le nombre de fonctions par auteur dans src/
// Usage : node tasks/count-functions-by-author.js

import fs from 'fs'
import path from 'path'

const BASE_DIR = path.dirname(new URL(import.meta.url).pathname)
const SEARCH_DIRS = [
  path.join(BASE_DIR, '../src'),
  path.join(BASE_DIR, '../tasks'),
  path.join(BASE_DIR, '../tests'),
]
const AUTHOR_REGEX = /@author ([^\n*]+)/gi // déjà insensible à la casse grâce au 'i'
const FUNCTION_REGEX =
  /(?:^|\n)\s*(?:export\s+)?(?:async\s+)?function\s+|(?:^|\n)\s*const\s+\w+\s*=\s*(?:async\s*)?function|(?:^|\n)\s*let\s+\w+\s*=\s*(?:async\s*)?function|(?:^|\n)\s*var\s+\w+\s*=\s*(?:async\s*)?function/gi

// Extraction prénom-nom (prénom composé accepté)
const extractNames = (str) => {
  // Exemples : "Jean-claude Lhote", "Rémi Angot", "Stéphane Guyon"
  const names = []
  // Prénom (éventuellement composé avec tiret ou espace), puis nom (un ou plusieurs mots)
  // Ex : "Jean-claude Lhote", "Jean-claude Lhote", "Jean-Claude Van Damme"
  const regex =
    /([A-ZÉÈÀÂÎÔÛÇ][a-zéèàâêîôûç\-]*(?: [A-ZÉÈÀÂÎÔÛÇ][a-zéèàâêîôûç\-]*)*) ([A-Z][a-zéèàâêîôûç\-]+(?: [A-Z][a-zéèàâêîôûç\-]+)*)/g
  let match
  while ((match = regex.exec(str))) {
    names.push(match[1].trim() + ' ' + match[2].trim())
  }
  return names.map((s) => s.toUpperCase())
}

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file)
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist)
    } else if (file.match(/\.(ts|js)$/)) {
      filelist.push(filepath)
    }
  })
  return filelist
}

const files = []
SEARCH_DIRS.forEach((dir) => {
  if (fs.existsSync(dir)) {
    walk(dir, files)
  }
})
const authorBlockCount = {}
const exercicesNoAuthor = []

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8')
  let found = false
  let match
  while ((match = AUTHOR_REGEX.exec(content))) {
    found = true
    const names = extractNames(match[1])
    names.forEach((name) => {
      authorBlockCount[name] = (authorBlockCount[name] || 0) + 1
    })
  }
  // Si fichier d'exercice sans auteur, on l'ajoute à la liste
  if (!found && file.includes('/src/exercices/') && file.match(/\.(ts|js)$/)) {
    if (content.includes('nouvelleVersion')) {
      exercicesNoAuthor.push(file)
    }
  }
})

// Générer le markdown trié
const sorted = Object.entries(authorBlockCount).sort((a, b) => b[1] - a[1])
console.log('| Auteur | Nombre de blocs @author |')
console.log('|--------|-------------------------|')
sorted.forEach(([name, count]) => {
  console.log(`| ${name} | ${count} |`)
})

if (exercicesNoAuthor.length > 0) {
  console.log('\n---')
  console.log("Fichiers d'exercices sans bloc @author :")
  exercicesNoAuthor.forEach((f) => {
    const parts = f.split('/')
    const len = parts.length
    if (len >= 2) {
      console.log('- ' + parts[len - 2] + '/' + parts[len - 1])
    } else {
      console.log('- ' + f)
    }
  })
}
