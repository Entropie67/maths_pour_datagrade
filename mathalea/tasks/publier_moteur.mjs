// Prépare une publication du moteur (dist-moteur) pour les apps :
//   moteur-<version>.tar.gz   archive du moteur
//   mise-a-jour.json          version, api, date, archive, taille, sha256
//   mise-a-jour.json.sig      signature Ed25519 (base64) du fichier ci-dessus
//   node tasks/publier_moteur.mjs <dist-moteur> <sortie> <clé privée .pem>
/* global process, Buffer, console */
import { createHash, createPrivateKey, sign } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const [source, sortie, cle] = process.argv.slice(2).map((a) => a && resolve(a))
if (!source || !sortie || !cle)
  throw new Error(
    'Usage : publier_moteur.mjs <dist-moteur> <sortie> <clé privée>',
  )
const { version, api } = JSON.parse(
  readFileSync(join(source, 'manifest.json'), 'utf8'),
)
mkdirSync(sortie, { recursive: true })
const archive = `moteur-${version.replace(/[^\w.-]/g, '_')}.tar.gz`
execFileSync('tar', ['-czf', join(sortie, archive), '-C', source, '.'])
const octets = readFileSync(join(sortie, archive))
const miseAJour = {
  format: 'moteur-mathalea/1',
  version,
  api,
  publieLe: new Date().toISOString(),
  archive,
  taille: octets.length,
  sha256: createHash('sha256').update(octets).digest('hex'),
}
const texte = JSON.stringify(miseAJour, null, 2)
writeFileSync(join(sortie, 'mise-a-jour.json'), texte)
const signature = sign(
  null,
  Buffer.from(texte),
  createPrivateKey(readFileSync(cle)),
)
writeFileSync(
  join(sortie, 'mise-a-jour.json.sig'),
  signature.toString('base64'),
)
console.log(
  `Publication ${version} (API ${api}, ${(octets.length / 1e6).toFixed(1)} Mo) dans ${sortie}`,
)
