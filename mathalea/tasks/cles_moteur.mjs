// Crée la paire de clés Ed25519 qui signe les mises à jour du moteur, une
// seule fois (voir documentation/developpement/maintenance-moteur/architecture/
// publication-moteur.md). La clé privée reste chez qui publie, jamais dans le
// dépôt ; la clé publique affichée est à transmettre à l'app MathALÉA mobile.
//   node tasks/cles_moteur.mjs ~/.config/mathalea/moteur-ed25519.pem
/* global process, console */
import { generateKeyPairSync } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const sortie = process.argv[2]
if (!sortie) throw new Error('Chemin de la clé privée attendu')
if (existsSync(sortie))
  throw new Error(`${sortie} existe déjà : ne pas l'écraser`)
mkdirSync(dirname(sortie), { recursive: true })
const { privateKey, publicKey } = generateKeyPairSync('ed25519')
writeFileSync(sortie, privateKey.export({ type: 'pkcs8', format: 'pem' }), {
  mode: 0o600,
})
// Les 32 derniers octets du SPKI DER sont la clé publique brute
const brute = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32)
console.log(`Clé privée (à garder, ne jamais partager) : ${sortie}`)
console.log(`Clé publique (à transmettre) : ${brute.toString('base64')}`)
