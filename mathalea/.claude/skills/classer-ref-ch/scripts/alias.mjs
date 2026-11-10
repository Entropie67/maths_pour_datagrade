#!/usr/bin/env node
/**
 * Ajoute ou retire des alias suisses (`'fr-ch'`) à partir d'un plan JSON.
 *
 *   node .claude/skills/classer-ref-ch/scripts/alias.mjs plan.json [--appliquer]
 *
 * Sans `--appliquer`, affiche seulement ce qui changerait.
 *
 * Format du plan : liste d'opérations
 *   [{ "uuid": "1574a", "ajouter": ["9R1NO4A-1"], "retirer": ["9NO3A-1"] }]
 * `retirer` accepte aussi un préfixe terminé par `*` (`"9NO*"`).
 * Ajouter un alias à un exercice `['NR']` ou vide remplace cet état.
 * Retirer le dernier alias laisse `'fr-ch': []` (rangé dans « Non classés »).
 * Les archives (`-old`, `Old`…) sont refusées : classer la version courante.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [fichierPlan, ...options] = process.argv.slice(2)
if (!fichierPlan) {
  console.error('Usage : alias.mjs plan.json [--appliquer]')
  process.exit(1)
}
const appliquer = options.includes('--appliquer')
const plan = JSON.parse(fs.readFileSync(fichierPlan, 'utf8'))
const ARCHIVE = /[-_]?(?:old)+\d*\.(ts|js)$/i

const parUuid = new Map()
for (const chemin of execFileSync('git', ['ls-files', '-z', 'src/exercices'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter((f) => /\.(ts|js)$/.test(f))) {
  const uuid = fs
    .readFileSync(chemin, 'utf8')
    .match(/export const uuid\s*=\s*'([^']*)'/)?.[1]
  if (uuid) parUuid.set(uuid, chemin)
}

const ecrit = (refs) => `'fr-ch': [${refs.map((r) => `'${r}'`).join(', ')}]`
let erreurs = 0
let modifies = 0

for (const op of plan) {
  const chemin = parUuid.get(op.uuid)
  if (!chemin) {
    console.error(`❌ uuid ${op.uuid} introuvable`)
    erreurs++
    continue
  }
  if (ARCHIVE.test(path.basename(chemin))) {
    console.error(`❌ ${chemin} est une archive : classer la version courante`)
    erreurs++
    continue
  }
  const contenu = fs.readFileSync(chemin, 'utf8')
  const bloc = contenu.match(/export const refs\s*=\s*\{[^}]*\}/)?.[0]
  if (!bloc) {
    console.error(`❌ ${chemin} : pas de \`export const refs\``)
    erreurs++
    continue
  }
  const matchCH = bloc.match(/'fr-ch':\s*\[([^\]]*)\]/)
  const avant = matchCH
    ? matchCH[1]
        .split(',')
        .map((r) => r.trim().replace(/^['"]|['"]$/g, ''))
        .filter((r) => r !== '')
    : []
  const retire = (r) =>
    (op.retirer ?? []).some((x) =>
      x.endsWith('*') ? r.startsWith(x.slice(0, -1)) : r === x,
    )
  let apres = avant.filter((r) => r !== 'NR' && !retire(r))
  for (const r of op.ajouter ?? []) if (!apres.includes(r)) apres.push(r)
  if (avant.length === 1 && avant[0] === 'NR' && !(op.ajouter ?? []).length) {
    apres = ['NR']
  }
  if (JSON.stringify(avant) === JSON.stringify(apres)) continue
  let nouveauBloc
  if (matchCH) {
    nouveauBloc = bloc.replace(matchCH[0], ecrit(apres))
  } else {
    // Pas de clé 'fr-ch' : l'ajouter en dernière entrée du bloc
    nouveauBloc = bloc.replace(/,?\s*\}$/, (fin) =>
      bloc.includes('\n') ? `,\n  ${ecrit(apres)},\n}` : `, ${ecrit(apres)} }`,
    )
  }
  console.log(
    `${chemin.replace('src/exercices/', '')}\t[${avant.join(', ')}] → [${apres.join(', ')}]`,
  )
  modifies++
  if (appliquer) fs.writeFileSync(chemin, contenu.replace(bloc, nouveauBloc))
}

console.error(
  `${modifies} fichier(s) ${appliquer ? 'modifié(s)' : 'à modifier (relancer avec --appliquer)'}, ${erreurs} erreur(s)`,
)
if (erreurs) process.exit(1)
