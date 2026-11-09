import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const emojisFile = path.join(
  __dirname,
  '..',
  'src',
  'lib',
  '2d',
  'figures2d',
  'listeEmojis.ts',
)
const svgDir = path.join(__dirname, '..', 'public', 'emojis', 'svg')
const outputFile = path.join(
  __dirname,
  '..',
  'src',
  'lib',
  '2d',
  'figures2d',
  'emojisSvgData.ts',
)
// On extrait les unicodes des emojis définis dans Emojis.ts

const emojisSource = fs.readFileSync(emojisFile, 'utf8')
console.log(emojisSource)

const unicodeRegex = /['"`]([0-9a-fA-F]+)['"`]/g
const unicodes = new Set<string>()
let match
while ((match = unicodeRegex.exec(emojisSource)) !== null) {
  unicodes.add(match[1].toLowerCase())
}
console.log('Unicodes trouvés dans Emojis.ts :', Array.from(unicodes))

const svgData: Record<string, string> = {}

for (const unicode of unicodes) {
  const file = path.join(svgDir, `${unicode}.svg`)
  if (fs.existsSync(file)) {
    const svg = fs.readFileSync(file, 'utf8')
    // Retirer la balise <svg ...>...</svg>
    const inner = svg
      .replace(/^<svg[^>]*>/i, '')
      .replace(/<\/svg>\s*$/i, '')
      .trim()
    svgData[unicode] = inner
  } else {
    console.warn(`SVG manquant pour ${unicode}`)
  }
}

const ts = `// Ce fichier est généré automatiquement
/* eslint-disable @stylistic/quote-props */
export const emojisSvgData: Record<string, string> = ${JSON.stringify(svgData, null, 2).replace(/"/g, "'")}
`
fs.writeFileSync(outputFile, ts, 'utf8')
console.log('Fichier emojisSvgData.ts généré avec succès.')
console.log('Fichier emojisSvgData.ts généré avec succès.')
