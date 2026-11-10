/**
 * Fonctions pures du système de banques externes : validation d'un manifest,
 * fabrication des uuid et construction du référentiel affiché dans le menu.
 * Le chargement (zip, forge) et la persistance sont dans
 * `lib/stores/banquesExternesStore.ts`, qui appelle ces fonctions.
 * @see documentation/utilisation/banques-externes.md
 */
import {
  BANQUE_EXTERNE_SCHEMA,
  BANQUE_EXTERNE_UUID_PREFIX,
  FORGE_HOST,
  MAX_ETOILES,
  type BanqueExterneExercice,
  type BanqueExterneManifest,
  type BanqueExternePreambule,
  type BanqueExterneSource,
} from '../types/banquesExternes'
import type {
  BanqueExterneItemInReferentiel,
  JSONReferentielObject,
} from '../types/referentiels'

/** Caractères admis dans un identifiant de banque ou d'exercice */
const ID_VALIDE = /^[a-zA-Z0-9._-]+$/

/** Erreur d'analyse d'un manifest, avec un message affichable tel quel */
export class ManifestInvalideError extends Error {}

/**
 * Vérifie qu'un chemin déclaré dans un manifest reste à l'intérieur de la
 * banque : pas de remontée `..`, pas de chemin absolu, pas d'URL. Sans ce
 * garde-fou, un manifest hostile pourrait faire lire un fichier arbitraire du
 * site (banque zip) ou d'un autre dépôt (banque de forge).
 * @param {string} chemin chemin relatif déclaré dans le manifest
 * @returns {boolean} `true` si le chemin est acceptable
 */
export function estCheminInterne(chemin: string): boolean {
  if (chemin.length === 0) return false
  if (chemin.startsWith('/') || chemin.startsWith('\\')) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(chemin)) return false
  return !chemin
    .split('/')
    .some((segment) => segment === '..' || segment === '.')
}

/**
 * Valide le contenu d'un `manifest.json` et le renvoie typé.
 * @param {unknown} brut objet issu du `JSON.parse` du manifest
 * @returns {BanqueExterneManifest} manifest validé
 * @throws {ManifestInvalideError} si le manifest est inexploitable
 */
export function validerManifest(brut: unknown): BanqueExterneManifest {
  if (brut === null || typeof brut !== 'object' || Array.isArray(brut)) {
    throw new ManifestInvalideError('Le manifest doit être un objet JSON.')
  }
  const manifest = brut as Partial<BanqueExterneManifest>
  if (manifest.schema !== BANQUE_EXTERNE_SCHEMA) {
    throw new ManifestInvalideError(
      `Schéma de manifest inconnu : « ${String(manifest.schema)} » (attendu « ${BANQUE_EXTERNE_SCHEMA} »).`,
    )
  }
  if (typeof manifest.id !== 'string' || !ID_VALIDE.test(manifest.id)) {
    throw new ManifestInvalideError(
      "L'identifiant de la banque (`id`) est absent ou contient des caractères interdits (lettres, chiffres, `.`, `_` et `-` seulement).",
    )
  }
  if (
    typeof manifest.titre !== 'string' ||
    manifest.titre.trim().length === 0
  ) {
    throw new ManifestInvalideError(
      'Le titre de la banque (`titre`) est absent.',
    )
  }
  if (!Array.isArray(manifest.exercices) || manifest.exercices.length === 0) {
    throw new ManifestInvalideError(
      'Le manifest ne déclare aucun exercice (`exercices`).',
    )
  }
  const idsVus = new Set<string>()
  const exercices: BanqueExterneExercice[] = []
  for (const brutExercice of manifest.exercices) {
    exercices.push(validerExercice(brutExercice, idsVus))
  }
  return {
    schema: BANQUE_EXTERNE_SCHEMA,
    id: manifest.id,
    titre: manifest.titre.trim(),
    auteur: typeof manifest.auteur === 'string' ? manifest.auteur : undefined,
    licence:
      typeof manifest.licence === 'string' ? manifest.licence : undefined,
    version:
      typeof manifest.version === 'string' ? manifest.version : undefined,
    description:
      typeof manifest.description === 'string'
        ? manifest.description
        : undefined,
    preambule: validerPreambule(manifest.preambule),
    exercices,
  }
}

/**
 * Valide le champ optionnel `preambule` du manifest (personnalisation du
 * document généré : équivalent d'un `preambule.tex` pour la banque).
 * @param {unknown} brut valeur de `preambule` dans le manifest
 * @returns {BanqueExternePreambule|undefined} préambule validé, `undefined` si absent
 * @throws {ManifestInvalideError} si le champ est mal formé
 */
function validerPreambule(brut: unknown): BanqueExternePreambule | undefined {
  if (brut === undefined) return undefined
  if (brut === null || typeof brut !== 'object' || Array.isArray(brut)) {
    throw new ManifestInvalideError(
      'Le champ `preambule` du manifest doit être un objet JSON.',
    )
  }
  const preambule = brut as Partial<BanqueExternePreambule>
  for (const chemin of [preambule.tex, preambule.typ]) {
    if (chemin === undefined) continue
    if (typeof chemin !== 'string' || !estCheminInterne(chemin)) {
      throw new ManifestInvalideError(
        `Le champ \`preambule\` référence un chemin de fichier invalide : « ${String(chemin)} ».`,
      )
    }
  }
  if (preambule.tex === undefined && preambule.typ === undefined) {
    return undefined
  }
  return { tex: preambule.tex, typ: preambule.typ }
}

/**
 * Valide une entrée `exercices[]` du manifest.
 * @param {unknown} brut entrée à valider
 * @param {Set<string>} idsVus identifiants déjà rencontrés (unicité)
 * @returns {BanqueExterneExercice} entrée validée
 * @throws {ManifestInvalideError} si l'entrée est inexploitable
 */
function validerExercice(
  brut: unknown,
  idsVus: Set<string>,
): BanqueExterneExercice {
  if (brut === null || typeof brut !== 'object') {
    throw new ManifestInvalideError(
      'Chaque exercice du manifest doit être un objet JSON.',
    )
  }
  const exercice = brut as Partial<BanqueExterneExercice>
  if (typeof exercice.id !== 'string' || !ID_VALIDE.test(exercice.id)) {
    throw new ManifestInvalideError(
      `Identifiant d'exercice absent ou invalide : « ${String(exercice.id)} ».`,
    )
  }
  if (idsVus.has(exercice.id)) {
    throw new ManifestInvalideError(
      `L'identifiant d'exercice « ${exercice.id} » apparaît plusieurs fois.`,
    )
  }
  idsVus.add(exercice.id)
  if (
    typeof exercice.titre !== 'string' ||
    exercice.titre.trim().length === 0
  ) {
    throw new ManifestInvalideError(
      `L'exercice « ${exercice.id} » n'a pas de titre.`,
    )
  }
  const chemins = [
    exercice.png,
    exercice.pngCor,
    exercice.typ,
    exercice.typCor,
    exercice.tex,
    exercice.texCor,
  ]
  for (const chemin of chemins) {
    if (chemin === undefined) continue
    if (typeof chemin !== 'string' || !estCheminInterne(chemin)) {
      throw new ManifestInvalideError(
        `L'exercice « ${exercice.id} » référence un chemin de fichier invalide : « ${String(chemin)} ».`,
      )
    }
  }
  if (
    exercice.png === undefined &&
    exercice.typ === undefined &&
    exercice.tex === undefined
  ) {
    throw new ManifestInvalideError(
      `L'exercice « ${exercice.id} » n'a ni image (png) ni source Typst (typ) ni source LaTeX (tex).`,
    )
  }
  const tags = Array.isArray(exercice.tags)
    ? exercice.tags.filter((tag): tag is string => typeof tag === 'string')
    : []
  const etoiles =
    typeof exercice.etoiles === 'number' && Number.isFinite(exercice.etoiles)
      ? Math.max(0, Math.min(MAX_ETOILES, Math.round(exercice.etoiles)))
      : undefined
  return {
    id: exercice.id,
    titre: exercice.titre.trim(),
    categorie:
      typeof exercice.categorie === 'string' && exercice.categorie.length > 0
        ? exercice.categorie
        : undefined,
    sousCategorie:
      typeof exercice.sousCategorie === 'string' &&
      exercice.sousCategorie.length > 0
        ? exercice.sousCategorie
        : undefined,
    tags,
    etoiles,
    png: exercice.png,
    pngCor: exercice.pngCor,
    typ: exercice.typ,
    typCor: exercice.typCor,
    tex: exercice.tex,
    texCor: exercice.texCor,
  }
}

/**
 * Fabrique l'uuid d'un exercice de banque externe. Il est stable tant que
 * l'auteur ne change ni l'id de sa banque ni celui de l'exercice : c'est lui
 * qui figure dans les liens de partage.
 * @param {string} idBanque id de la banque
 * @param {string} idExercice id de l'exercice dans la banque
 * @returns {string} uuid préfixé par `bq-`
 */
export function uuidBanqueExterne(
  idBanque: string,
  idExercice: string,
): string {
  return `${BANQUE_EXTERNE_UUID_PREFIX}${idBanque}-${idExercice}`
}

/**
 * Construit l'URL d'API GitLab donnant le contenu brut d'un fichier d'un dépôt
 * public de la forge. On passe par l'API et non par `/-/raw/` car seule l'API
 * renvoie `Access-Control-Allow-Origin`, indispensable pour `fetch()`.
 * @param {BanqueExterneSource} source source de type `forge`
 * @param {string} chemin chemin du fichier relatif à la racine de la banque
 * @returns {string} URL absolue à télécharger
 */
export function urlFichierForge(
  source: BanqueExterneSource,
  chemin: string,
): string {
  const racine = source.racine ? `${source.racine.replace(/\/$/, '')}/` : ''
  const cheminComplet = encodeURIComponent(`${racine}${chemin}`)
  const projet = encodeURIComponent(source.projet ?? '')
  const ref = encodeURIComponent(source.ref ?? 'main')
  return `https://${FORGE_HOST}/api/v4/projects/${projet}/repository/files/${cheminComplet}/raw?ref=${ref}`
}

/**
 * Extrait le chemin de projet d'une URL de dépôt de la forge collée par
 * l'utilisateur, sous n'importe laquelle de ses formes courantes (page du
 * dépôt, arborescence d'une branche, URL `.git`).
 * @param {string} saisie URL saisie
 * @returns {BanqueExterneSource|null} source `forge`, ou `null` si non reconnue
 */
export function sourceForgeDepuisUrl(
  saisie: string,
): BanqueExterneSource | null {
  let url: URL
  try {
    url = new URL(saisie.trim())
  } catch {
    return null
  }
  if (url.hostname !== FORGE_HOST) return null
  let chemin = url.pathname.replace(/^\//, '').replace(/\.git$/, '')
  let ref = 'main'
  let racine = ''
  // `.../-/tree/<ref>/<sous-dossier>` : on récupère la branche et le sous-dossier
  const separateur = chemin.indexOf('/-/')
  if (separateur !== -1) {
    const apres = chemin.slice(separateur + 3)
    chemin = chemin.slice(0, separateur)
    const morceaux = apres.split('/')
    if (
      (morceaux[0] === 'tree' || morceaux[0] === 'blob') &&
      morceaux.length > 1
    ) {
      ref = morceaux[1]
      racine = morceaux.slice(2).join('/')
    }
  }
  chemin = chemin.replace(/\/$/, '')
  if (chemin.length === 0 || !chemin.includes('/')) return null
  const source: BanqueExterneSource = {
    type: 'forge',
    cle: '',
    projet: chemin,
    ref,
  }
  if (racine.length > 0) source.racine = racine
  return source
}

/**
 * Construit la terminaison de référentiel d'un exercice de banque externe.
 * @param {BanqueExterneManifest} manifest manifest de la banque
 * @param {BanqueExterneExercice} exercice entrée du manifest
 * @param {(chemin: string) => string | undefined} resoudre traduit un chemin
 * relatif de la banque en URL utilisable par le navigateur
 * @returns {BanqueExterneItemInReferentiel} terminaison prête pour le menu
 */
function construireTerminaison(
  manifest: BanqueExterneManifest,
  exercice: BanqueExterneExercice,
  resoudre: (chemin: string) => string | undefined,
): BanqueExterneItemInReferentiel {
  const png = exercice.png !== undefined ? resoudre(exercice.png) : undefined
  const pngCor =
    exercice.pngCor !== undefined ? resoudre(exercice.pngCor) : undefined
  const typUrl = exercice.typ !== undefined ? resoudre(exercice.typ) : undefined
  const typCorUrl =
    exercice.typCor !== undefined ? resoudre(exercice.typCor) : undefined
  const tex = exercice.tex !== undefined ? resoudre(exercice.tex) : undefined
  const texCor =
    exercice.texCor !== undefined ? resoudre(exercice.texCor) : undefined
  const terminaison: BanqueExterneItemInReferentiel = {
    uuid: uuidBanqueExterne(manifest.id, exercice.id),
    banque: manifest.id,
    banqueTitre: manifest.titre,
    titre: exercice.titre,
    tags: exercice.tags ?? [],
    typeExercice: 'static',
    png: png ?? '',
    pngCor: pngCor ?? '',
    // `tex`/`texCor` portent ici des URLs déjà résolues (et non des chemins
    // reconstruits depuis l'uuid comme pour les annales) : c'est ce que lit
    // l'export LaTeX dans `mathaleaGetExercicesFromParams`
    tex: tex ?? '',
    texCor: texCor ?? '',
  }
  if (manifest.auteur !== undefined) terminaison.banqueAuteur = manifest.auteur
  if (exercice.etoiles !== undefined) terminaison.etoiles = exercice.etoiles
  if (typUrl !== undefined) terminaison.typUrl = typUrl
  if (typCorUrl !== undefined) terminaison.typCorUrl = typCorUrl
  return terminaison
}

/**
 * Construit le référentiel d'une banque, sous la forme
 * `titre de la banque > catégorie > sous-catégorie > exercices`. Les niveaux
 * `catégorie` et `sous-catégorie` sont facultatifs : un exercice qui n'en
 * déclare pas est rangé directement sous le titre de la banque.
 * @param {BanqueExterneManifest} manifest manifest validé
 * @param {(chemin: string) => string | undefined} resoudre traduit un chemin
 * relatif de la banque en URL utilisable par le navigateur
 * @returns {JSONReferentielObject} référentiel fusionnable dans le menu
 */
export function construireReferentielBanque(
  manifest: BanqueExterneManifest,
  resoudre: (chemin: string) => string | undefined,
): JSONReferentielObject {
  const contenu: JSONReferentielObject = {}
  for (const exercice of manifest.exercices) {
    const terminaison = construireTerminaison(manifest, exercice, resoudre)
    let noeud = contenu
    for (const niveau of [exercice.categorie, exercice.sousCategorie]) {
      if (niveau === undefined) continue
      if (
        noeud[niveau] === undefined ||
        typeof noeud[niveau] !== 'object' ||
        Array.isArray(noeud[niveau])
      ) {
        noeud[niveau] = {} as JSONReferentielObject
      }
      noeud = noeud[niveau] as JSONReferentielObject
    }
    noeud[terminaison.uuid] = terminaison
  }
  return { [manifest.titre]: contenu }
}
