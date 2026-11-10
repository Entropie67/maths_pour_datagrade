/**
 * Met à jour le manifest de la banque d'exercices FFJM livrée avec le site, à
 * partir du dépôt de la forge `coopmaths/ffjm`.
 *
 *   pnpm update:ffjm
 *
 * La banque FFJM est intégrée par défaut à MathALÉA (voir
 * `src/lib/stores/banquesExternesStore.ts`, `chargerBanquesIntegrees`). Ce
 * script récupère `dist/manifest.json` publié par le dépôt et le réécrit dans
 * `src/json/banques/ffjm.manifest.json` (versionné, importé par le store).
 *
 * Il ne touche **pas** aux fichiers d'exercices (images, sources Typst/LaTeX,
 * préambules) : ceux-ci sont servis par le dossier statique du serveur, partagé
 * entre les releases (cf. `tasks/deploy_site.sh` / `tasks/rollback_site.js`,
 * variable `REMOTE_STATIC_PATH`), et mis à jour depuis un autre projet. Ils
 * doivent se trouver sous `static/ffjm/<chemin du manifest>`, c'est-à-dire
 * (en production) `https://coopmaths.fr/alea/static/ffjm/…` — par exemple
 * `https://coopmaths.fr/alea/static/ffjm/png/tirelire.png`,
 * `…/typ/tirelire.typ`, `…/tex/tirelire.tex`, `…/preambule.tex`.
 *
 * Après exécution : `pnpm check`, puis commit de
 * `src/json/banques/ffjm.manifest.json`.
 *
 * @see documentation/utilisation/banques-externes.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Hôte de forge et chemin du projet publiant la banque FFJM. */
const FORGE_HOST = 'forge.apps.education.fr'
const PROJET = 'coopmaths/ffjm'
const REF = 'main'
/** Chemin du manifest dans le dépôt. */
const MANIFEST_DEPOT = 'dist/manifest.json'
/** Schéma de manifest attendu (cf. `src/lib/types/banquesExternes.ts`). */
const SCHEMA_ATTENDU = 'mathalea-banque-v1'

const RACINE = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
/** Manifest versionné, importé par le store. */
const CIBLE_MANIFEST = path.join(RACINE, 'src/json/banques/ffjm.manifest.json')

/**
 * Construit l'URL d'API GitLab donnant le contenu brut d'un fichier d'un dépôt
 * public. On passe par l'API (et non `/-/raw/`) pour rester cohérent avec le
 * chargement des banques externes côté application.
 * @param {string} chemin chemin du fichier relatif à la racine du dépôt
 * @returns {string} URL absolue à télécharger
 */
function urlFichierForge(chemin) {
  const projet = encodeURIComponent(PROJET)
  const fichier = encodeURIComponent(chemin)
  return `https://${FORGE_HOST}/api/v4/projects/${projet}/repository/files/${fichier}/raw?ref=${REF}`
}

/**
 * Valide la forme minimale du manifest téléchargé.
 * @param {unknown} manifest objet issu du `JSON.parse` du manifest
 * @throws {Error} si le manifest est inexploitable
 */
function validerFormeManifest(manifest) {
  if (manifest === null || typeof manifest !== 'object') {
    throw new Error('`manifest.json` : ce n’est pas un objet JSON.')
  }
  if (manifest.schema !== SCHEMA_ATTENDU) {
    throw new Error(
      `\`manifest.json\` : schéma « ${manifest.schema} » (attendu « ${SCHEMA_ATTENDU} »).`,
    )
  }
  if (typeof manifest.id !== 'string' || manifest.id.length === 0) {
    throw new Error('`manifest.json` : champ `id` absent.')
  }
  if (
    typeof manifest.titre !== 'string' ||
    manifest.titre.trim().length === 0
  ) {
    throw new Error('`manifest.json` : champ `titre` absent.')
  }
  if (!Array.isArray(manifest.exercices) || manifest.exercices.length === 0) {
    throw new Error('`manifest.json` : `exercices` vide ou absent.')
  }
}

async function main() {
  console.log(`Téléchargement de ${PROJET}/${MANIFEST_DEPOT} (${REF})…`)
  const reponse = await fetch(urlFichierForge(MANIFEST_DEPOT))
  if (!reponse.ok) {
    throw new Error(
      `La forge a répondu ${reponse.status} pour ${MANIFEST_DEPOT}. Le dépôt doit être public.`,
    )
  }
  const texte = await reponse.text()
  let manifest
  try {
    manifest = JSON.parse(texte)
  } catch {
    throw new Error('`manifest.json` : JSON invalide.')
  }
  validerFormeManifest(manifest)

  fs.mkdirSync(path.dirname(CIBLE_MANIFEST), { recursive: true })
  fs.writeFileSync(CIBLE_MANIFEST, JSON.stringify(manifest, null, 2) + '\n')

  console.log(
    [
      '',
      `Banque « ${manifest.titre} » (id ${manifest.id})`,
      `  version   : ${manifest.version ?? 'non déclarée'}`,
      `  exercices : ${manifest.exercices.length}`,
      `  manifest  : ${path.relative(RACINE, CIBLE_MANIFEST)}`,
      '',
      'Étapes suivantes :',
      '  1. pnpm check',
      `  2. committer ${path.relative(RACINE, CIBLE_MANIFEST)}`,
      '  3. si des exercices ont été ajoutés/renommés : mettre à jour les',
      '     fichiers sous static/ffjm/ du dossier statique du serveur',
      '     (https://coopmaths.fr/alea/static/ffjm/…), depuis l’autre projet',
      '',
    ].join('\n'),
  )
}

main().catch((erreur) => {
  console.error(`\nÉchec de la mise à jour FFJM : ${erreur.message}`)
  process.exit(1)
})
