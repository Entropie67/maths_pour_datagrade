#!/usr/bin/env node
/**
 * Gère la table des uuid remplacés (`src/json/uuidsRemplaces.json`).
 *
 *   pnpm uuids:rebuild   complète la table pour toutes les archives de l'arbre
 *                        et tous les uuid disparus, d'après l'historique git
 *                        (n'écrase jamais une entrée existante)
 *   pnpm uuids:check     vérifie la table et qu'aucun uuid publié (origin/main
 *                        ou BASE_REF) n'a disparu sans y être renvoyé
 *
 * Voir documentation/tests/stabilite-exercices.md.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FICHIER_REMPLACES,
  avertitSiCloneSuperficiel,
  ecritTable,
  litTable,
  reconstruit,
  verifie,
} from './lib/uuids-remplaces.js'

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'))

const commande = process.argv[2]

if (commande === 'rebuild') avertitSiCloneSuperficiel()

if (commande === 'rebuild') {
  const { ajouts, orphelins } = reconstruit()
  const table = { ...litTable(), ...ajouts }
  ecritTable(table)
  console.log(
    `✅ ${FICHIER_REMPLACES} : ${Object.keys(ajouts).length} entrée(s) ajoutée(s), ${Object.keys(table).length} au total.`,
  )
  if (orphelins.length > 0) {
    console.log(
      `\n⚠️  ${orphelins.length} archive(s) sans successeur retrouvé (nom de fichier et historique git) :\n` +
        `   ${orphelins.join(', ')}\n` +
        '   Elles ne seront pas supprimées par `pnpm archive:purge` tant que leur\n' +
        `   uuid n'a pas d'entrée dans ${FICHIER_REMPLACES} (null = supprimé sans remplaçant).`,
    )
  }
} else if (commande === 'check') {
  const { erreurs, avertissements } = verifie()
  for (const a of avertissements) console.warn(`⚠️  ${a}`)
  if (erreurs.length > 0) {
    console.error(
      `❌ ${FICHIER_REMPLACES} :\n` + erreurs.map((e) => `  - ${e}`).join('\n'),
    )
    process.exit(1)
  }
  console.log(`✅ ${FICHIER_REMPLACES} : aucun uuid publié n'a disparu.`)
} else {
  console.error('Usage : node tasks/uuids-remplaces.js rebuild | check')
  process.exit(1)
}
