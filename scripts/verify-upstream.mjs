import { readFileSync, lstatSync, readlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('upstream-manifest.json', root)))
const overrides = JSON.parse(readFileSync(new URL('upstream-overrides.json', root)))
const failures = []
for (const [path, expected] of Object.entries(manifest.files)) {
  try {
    const bytes = readFileSync(fileURLToPath(new URL(`mathalea/${path}`, root)))
    const actual = createHash('sha256').update(bytes).digest('hex')
    if (actual !== (overrides[path]?.sha256 ?? expected.sha256)) failures.push(`Modifié : ${path}`)
  } catch { failures.push(`Absent : ${path}`) }
}
for (const [path, target] of Object.entries(manifest.symlinks ?? {})) {
  try {
    const file = fileURLToPath(new URL(`mathalea/${path}`, root))
    // Git pour Windows peut matérialiser un lien par un fichier contenant sa cible.
    const actual = lstatSync(file).isSymbolicLink() ? readlinkSync(file) : readFileSync(file, 'utf8')
    if (actual !== target) failures.push(`Lien modifié : ${path}`)
  } catch { failures.push(`Lien absent : ${path}`) }
}
console.log(`${Object.keys(manifest.files).length} fichiers et ${Object.keys(manifest.symlinks ?? {}).length} liens vérifiés, ${failures.length} différences non prévues avec ${manifest.commit}, ${Object.keys(overrides).length} adaptation(s) déclarée(s).`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}
