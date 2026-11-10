/**
 * Archive la version publiée d'un exercice avant une modification qui change
 * ses tirages aléatoires.
 *
 *   pnpm archive 6N1E
 *   pnpm archive src/exercices/6e/6N1E.ts
 *
 * Les liens partagés par les utilisateurs (sujets et corrigés) contiennent
 * l'uuid de l'exercice et la graine du tirage. Si une modification décale les
 * tirages, ces liens n'affichent plus le même énoncé et les corrigés déjà
 * distribués deviennent faux.
 *
 * Ce script applique la règle du dépôt :
 *   - la version publiée (celle de HEAD) est recopiée dans `<exercice>-old.ts`
 *     (`-old2.ts`, `-old3.ts`… si une archive existe déjà), avec son uuid
 *     d'origine et sans référence dans les menus : les anciens liens
 *     continuent de fonctionner ;
 *   - le fichier de travail garde ses références et reçoit un uuid tout neuf :
 *     les nouveaux utilisateurs voient la version corrigée.
 *
 * À lancer avant de committer la modification, puis `pnpm makeJson` et
 * `pnpm stability:update`.
 *
 * Quand la modification est DÉJÀ commitée, ce script ne convient plus : la
 * version publiée n'est plus dans HEAD. Utiliser `pnpm archive:retro`.
 */

import fs from 'node:fs'
import {
  contenuALaRevision,
  dereference,
  enTeteArchive,
  litUuid,
  nouvelUuid,
  poseUuidEtDate,
  prochainCheminArchive,
  renommeClasse,
  resoudChemin,
  trouveDescendants,
} from './lib/archive-commun.js'
import { ajouteRemplacement } from './lib/uuids-remplaces.js'

const argument = process.argv[2]

if (!argument) {
  console.error(
    "Usage : pnpm archive <code ou chemin de l'exercice>\n" +
      'Exemples : pnpm archive 6N1E\n' +
      '           pnpm archive src/exercices/6e/6N1E.ts',
  )
  process.exit(1)
}

const chemin = resoudChemin(argument)
const { cheminArchive, suffixeClasse } = prochainCheminArchive(chemin)

/** Contenu du fichier tel qu'il est publié, c'est-à-dire celui de HEAD. */
const contenuPublie = contenuALaRevision('HEAD', chemin)
if (contenuPublie === null) {
  console.error(
    `Impossible de lire ${chemin} dans HEAD : l'exercice n'a jamais été publié, ` +
      "il n'y a donc pas de lien à préserver.",
  )
  process.exit(1)
}

const contenuTravail = fs.readFileSync(chemin, 'utf8')

// Avant d'écrire quoi que ce soit : l'archive qu'on va créer importerait elle
// aussi les parents, et elle n'a pas à figurer dans la liste.
const descendants = trouveDescendants(chemin)

if (contenuTravail === contenuPublie) {
  console.warn(
    `⚠️  ${chemin} est identique à sa version publiée : l'archive en sera une ` +
      'copie conforme. À faire seulement si la modification est encore à venir.',
  )
}

const uuidPublie = litUuid(contenuPublie)
if (!uuidPublie) {
  console.error(`Aucun \`export const uuid\` trouvé dans ${chemin}.`)
  process.exit(1)
}

fs.writeFileSync(
  cheminArchive,
  enTeteArchive(uuidPublie) +
    renommeClasse(dereference(contenuPublie, chemin), suffixeClasse),
)

const uuidNeuf = nouvelUuid()
const aujourdhui = new Date().toLocaleDateString('fr-FR')

fs.writeFileSync(chemin, poseUuidEtDate(contenuTravail, uuidNeuf, aujourdhui))

// Le jour où l'archive sera supprimée (`pnpm archive:purge`), les vieux liens
// iront vers la version courante.
ajouteRemplacement(uuidPublie, uuidNeuf)

console.log(`✅ ${cheminArchive} créé (uuid ${uuidPublie}, déréférencé)`)
console.log(`✅ ${chemin} a désormais l'uuid ${uuidNeuf}`)
console.log(`✅ src/json/uuidsRemplaces.json : ${uuidPublie} → ${uuidNeuf}`)

if (descendants.length > 0) {
  afficheDescendants(chemin, descendants)
}

console.log('')
console.log('Étapes suivantes :')
console.log('  1. pnpm makeJson')
console.log('  2. pnpm stability:update')
console.log('  3. pnpm review:archives (vérifier version courante vs archive)')
console.log('  4. relire le diff avant de committer')
if (descendants.length > 0) {
  console.log("  5. archiver les descendants listés ci-dessus (ils dérivent avec l'exercice)")
}

/**
 * Signale les fichiers qui dépendent de l'exercice archivé : la modification à
 * venir changera aussi leurs tirages, mais `pnpm archive` ne les archive pas.
 */
function afficheDescendants(chemin, descendants) {
  const exercices = descendants.filter((d) => !d.archive && d.avecUuid)
  const intermediaires = descendants.filter((d) => !d.archive && !d.avecUuid)
  const archives = descendants.filter((d) => d.archive)
  const decrit = (d) =>
    d.profondeur === 1
      ? d.herite
        ? 'étend'
        : 'importe'
      : `indirect (niveau ${d.profondeur})`

  console.log('')
  console.warn(
    `⚠️  ${descendants.length} fichier(s) dépendent de ${chemin} : ils dériveront ` +
      "avec la modification et `pnpm archive` ne les a PAS archivés.",
  )
  if (exercices.length > 0) {
    console.log(`\n  Exercices à archiver (${exercices.length}) :`)
    for (const d of exercices) {
      console.log(`    pnpm archive ${d.chemin}   # ${decrit(d)}`)
    }
  }
  if (intermediaires.length > 0) {
    console.log(
      `\n  Classes intermédiaires sans uuid (${intermediaires.length}), ` +
        'à figer si leurs enfants doivent rester stables :',
    )
    for (const d of intermediaires) console.log(`    ${d.chemin}   # ${decrit(d)}`)
  }
  if (archives.length > 0) {
    console.log(
      `\n  Archives -old qui importent le fichier vivant (${archives.length}) : ` +
        "elles dérivent aussi, il faudrait les faire pointer vers une copie figée " +
        '(voir `pnpm archive:retro`) :',
    )
    for (const d of archives) console.log(`    ${d.chemin}   # ${decrit(d)}`)
  }
}
