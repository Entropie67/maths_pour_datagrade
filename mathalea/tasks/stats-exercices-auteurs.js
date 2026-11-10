// Script Node.js pour statistiques sur les auteurs d'exercices
// Usage : node tasks/stats-exercices-auteurs.js

import fs from 'fs'
import path from 'path'

const EXERCICES_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '../src/exercices',
)
const AUTHOR_REGEX = /@author ([^\n*]+)/gi

const extractNames = (str) => {
  const names = []
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

const files = walk(EXERCICES_DIR)
const authorStats = {}

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n').length
  let found = false
  let match
  while ((match = AUTHOR_REGEX.exec(content))) {
    found = true
    const names = extractNames(match[1])
    names.forEach((name) => {
      if (!authorStats[name]) authorStats[name] = { count: 0, lines: 0 }
      authorStats[name].count += 1
      authorStats[name].lines += lines
    })
  }
  // Si pas d'auteur, on ignore le fichier
})

// Calcul de la moyenne
const statsArray = Object.entries(authorStats).map(([name, data]) => ({
  name,
  count: data.count,
  avgLines: data.lines / data.count,
  totalLines: data.lines,
}))

// Tri décroissant par moyenne de lignes
statsArray.sort((a, b) => b.totalLines - a.totalLines)

console.log("| Auteur | Nombre d'exercices | Moyenne de lignes | Total lignes")
console.log(
  '|--------|---------------------|-------------------|-------------------|',
)
statsArray.forEach(({ name, count, avgLines, totalLines }) => {
  console.log(`| ${name} | ${count} | ${avgLines.toFixed(1)} | ${totalLines}|`)
})
