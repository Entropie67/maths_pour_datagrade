#!/usr/bin/env node
/**
 * Inventaire du classement suisse (alias `'fr-ch'`) de tous les exercices.
 *
 *   node .claude/skills/classer-ref-ch/scripts/inventaire.mjs            résumé
 *   node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --a-classer
 *       exercices courants sans classement (`'fr-ch': []` ou pas de clé)
 *   node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --archives
 *       archives `-old` encore classées, et version courante à reprendre
 *   node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --prefixe 9ES1
 *       exercices dont un alias commence par ce préfixe
 *   node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --couverture 9NO --vers 9R1,9R2,9R3
 *       exercices qui ont un alias 9NO… mais aucun alias 9R1/9R2/9R3
 *   node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --perdus [réf]
 *       alias présents sur la référence git et disparus depuis (par défaut :
 *       point de départ de la branche, `git merge-base HEAD origin/main`, pour
 *       ne pas compter les changements fusionnés sur main entre-temps)
 *   node .claude/skills/classer-ref-ch/scripts/inventaire.mjs --json fichier.json
 *       tout l'inventaire, une entrée par exercice
 *
 * Option `--depuis AAAA-MM-JJ` (avec --a-classer) : seulement les exercices
 * publiés depuis cette date (`dateDePublication`).
 *
 * États : `classe` (au moins un alias), `NR` (exclu du menu suisse),
 * `vide` (`'fr-ch': []`, rangé dans « Non classés »), `absent` (pas de clé
 * `'fr-ch'` : l'exercice n'apparaît pas du tout côté suisse).
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const option = (nom) => {
  const i = args.indexOf(nom)
  return i >= 0 ? (args[i + 1] ?? true) : undefined
}

const fichiers = execFileSync('git', ['ls-files', '-z', 'src/exercices'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter((f) => {
    const b = path.basename(f)
    return (
      /\.(ts|js)$/.test(b) &&
      !b.startsWith('_') &&
      !b.endsWith('.test.ts') &&
      !b.startsWith('Exercice') &&
      !['MetaExerciceCan.ts', 'exerciseMethods.ts'].includes(b)
    )
  })

const liste = (texte) =>
  texte
    .split(',')
    .map((r) => r.trim().replace(/^['"]|['"]$/g, ''))
    .filter((r) => r !== '')

const remplaces = JSON.parse(
  fs.readFileSync('src/json/uuidsRemplaces.json', 'utf8'),
)

// Archives : `-old`, `-old2`, mais aussi `Old`, `OldOld`, `-OldOld` (archives manuelles)
const ARCHIVE = /[-_]?(?:old)+\d*\.(ts|js)$/i

const inventaire = []
for (const chemin of fichiers) {
  const contenu = fs.readFileSync(chemin, 'utf8')
  const uuid = contenu.match(/export const uuid\s*=\s*'([^']*)'/)?.[1]
  if (!uuid) continue
  const sansCommentaires = contenu.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')
  const titre = (sansCommentaires.match(
    /export\s+(?:const|let)\s+titre\s*=\s*(['"`])((?:\\.|(?!\1).)*)\1/s,
  )?.[2] ?? '').replace(/\\'/g, "'")
  const blocRefs = contenu.match(/export const refs\s*=\s*\{[^}]*\}/)?.[0] ?? ''
  const refsFR = liste(blocRefs.match(/'fr-fr':\s*\[([^\]]*)\]/)?.[1] ?? '')
  const matchCH = blocRefs.match(/'fr-ch':\s*\[([^\]]*)\]/)
  const refsCH = matchCH ? liste(matchCH[1]) : []
  const etat = !matchCH
    ? 'absent'
    : refsCH.length === 1 && refsCH[0] === 'NR'
      ? 'NR'
      : refsCH.length === 0
        ? 'vide'
        : 'classe'
  const archive = ARCHIVE.test(chemin)
  inventaire.push({
    uuid,
    chemin: chemin.replace('src/exercices/', ''),
    titre,
    refsFR,
    refsCH: etat === 'classe' ? refsCH : [],
    etat,
    archive,
    datePublication:
      contenu.match(/export const dateDePublication\s*=\s*'([^']*)'/)?.[1] ??
      '',
    remplacePar: remplaces[uuid] ?? null,
  })
}

const parChemin = new Map(inventaire.map((e) => [e.chemin, e]))
const courant = (archive) =>
  parChemin.get(archive.chemin.replace(ARCHIVE, '.$1'))

const ligne = (e) =>
  [e.uuid, e.chemin, e.etat, e.refsCH.join(' '), e.titre].join('\t')

if (option('--json')) {
  fs.writeFileSync(option('--json'), JSON.stringify(inventaire, null, 1))
  console.log(`${inventaire.length} exercices écrits dans ${option('--json')}`)
} else if (args.includes('--a-classer')) {
  const depuis = option('--depuis')
  const aClasser = inventaire.filter(
    (e) =>
      !e.archive &&
      (e.etat === 'vide' || e.etat === 'absent') &&
      (!depuis || e.datePublication >= depuis),
  )
  aClasser.forEach((e) => console.log(ligne(e)))
  console.error(`${aClasser.length} exercices à classer`)
} else if (args.includes('--archives')) {
  let n = 0
  for (const a of inventaire.filter((e) => e.archive && e.etat === 'classe')) {
    const c = courant(a)
    n++
    console.log(
      `${a.chemin}\t${a.refsCH.join(' ')}\t→ ${c ? `${c.chemin} (${c.etat}${c.etat === 'classe' ? ' ' + c.refsCH.join(' ') : ''})` : 'pas de version courante'}`,
    )
  }
  console.error(
    `${n} archives classées : leurs alias doivent passer sur la version courante, l'archive reçoit ['NR']`,
  )
} else if (option('--couverture')) {
  // Exercices qui ont un alias de l'ancienne structure (préfixe donné) mais
  // aucun alias de la nouvelle : ce qu'on perdrait en retirant l'ancienne.
  const ancien = option('--couverture')
  const nouveau = option('--vers')
  if (!nouveau || nouveau === true) {
    console.error('Usage : --couverture <ancien préfixe> --vers <nouveaux préfixes séparés par des virgules>')
    process.exit(1)
  }
  const nouveaux = nouveau.split(',')
  const restants = inventaire.filter(
    (e) =>
      !e.archive &&
      e.refsCH.some((r) => r.startsWith(ancien)) &&
      !e.refsCH.some((r) => nouveaux.some((n) => r.startsWith(n))),
  )
  restants
    .sort((a, b) => a.refsCH.join().localeCompare(b.refsCH.join()))
    .forEach((e) => console.log(ligne(e)))
  console.error(`${restants.length} exercices de ${ancien} sans alias ${nouveau}`)
} else if (args.includes('--perdus')) {
  // Alias présents sur la référence git (point de départ de la branche par
  // défaut) et absents du répertoire de travail : toute disparition doit être voulue.
  const ref =
    option('--perdus') === true
      ? execFileSync('git', ['merge-base', 'HEAD', 'origin/main'], { encoding: 'utf8' }).trim()
      : option('--perdus')
  const modifies = execFileSync('git', ['diff', '--name-only', '-z', ref, '--', 'src/exercices'], {
    encoding: 'utf8',
  })
    .split('\0')
    .filter((f) => /\.(ts|js)$/.test(f))
  let n = 0
  for (const f of modifies) {
    let avant = ''
    try {
      avant = execFileSync('git', ['show', `${ref}:${f}`], { encoding: 'utf8' })
    } catch {
      continue // fichier nouveau
    }
    const refsAvant = liste(avant.match(/'fr-ch':\s*\[([^\]]*)\]/)?.[1] ?? '')
    const actuel = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''
    const refsApres = liste(actuel.match(/'fr-ch':\s*\[([^\]]*)\]/)?.[1] ?? '')
    const perdus = refsAvant.filter((r) => r !== 'NR' && !refsApres.includes(r))
    if (perdus.length) {
      n++
      console.log(`${f.replace('src/exercices/', '')}\tperdus : ${perdus.join(' ')}`)
    }
  }
  console.error(`${n} fichier(s) ont perdu des alias par rapport à ${ref} (${modifies.length} fichiers modifiés)`)
} else if (option('--prefixe')) {
  const p = option('--prefixe')
  const trouves = inventaire.filter((e) => e.refsCH.some((r) => r.startsWith(p)))
  trouves.forEach((e) => console.log(ligne(e)))
  console.error(`${trouves.length} exercices`)
} else {
  const compte = {}
  for (const e of inventaire) {
    const cle = `${e.etat}${e.archive ? ' (archive)' : ''}`
    compte[cle] = (compte[cle] ?? 0) + 1
  }
  console.table(compte)
}
