/**
 * Types du système de « banques externes » : des banques d'exercices statiques
 * (png et/ou sources Typst) fournies par l'utilisatrice ou l'utilisateur, hors
 * du dépôt MathALÉA, et ajoutées à la volée dans « Ressources partenaires ».
 *
 * Deux provenances sont gérées :
 * - `zip` : une archive déposée depuis la machine (stockée en IndexedDB) ;
 * - `forge` : un dépôt public de forge.apps.education.fr, lu via l'API GitLab
 *   (seule l'API renvoie les en-têtes CORS nécessaires à `fetch()`, les URLs
 *   `/-/raw/` ne le font pas).
 *
 * @see documentation/utilisation/banques-externes.md
 */

/** Valeur de `schema` attendue dans un manifest reconnu par cette version */
export const BANQUE_EXTERNE_SCHEMA = 'mathalea-banque-v1'

/** Préfixe des uuid fabriqués pour les exercices d'une banque externe */
export const BANQUE_EXTERNE_UUID_PREFIX = 'bq-'

/** Hôte de forge autorisé (une seule instance pour l'instant) */
export const FORGE_HOST = 'forge.apps.education.fr'

/** Nombre maximal d'étoiles affichées pour un exercice */
export const MAX_ETOILES = 5

/**
 * Description d'un exercice dans le manifest d'une banque externe.
 * Tous les chemins de fichiers sont **relatifs à la racine de la banque**
 * (dossier du `manifest.json`), et jamais des URLs absolues : c'est ce qui
 * permet à la même banque d'être servie depuis un zip ou depuis un dépôt.
 * @property {string} id identifiant stable dans la banque (unique) ; il sert à
 * fabriquer l'uuid `bq-<idBanque>-<id>` et donc à figer les liens de partage
 * @property {string} titre intitulé affiché dans le menu
 * @property {string} categorie catégorie de premier niveau (optionnelle)
 * @property {string} sousCategorie catégorie de second niveau (optionnelle)
 * @property {string[]} tags étiquettes affichées sous le titre (optionnelles)
 * @property {number} etoiles niveau de difficulté de 0 à 5 (optionnel)
 * @property {string} png chemin du png de l'énoncé
 * @property {string} pngCor chemin du png de la correction (optionnel)
 * @property {string} typ chemin de la source Typst de l'énoncé (optionnel)
 * @property {string} typCor chemin de la source Typst de la correction (optionnel)
 * @property {string} tex chemin de la source LaTeX de l'énoncé (optionnel)
 * @property {string} texCor chemin de la source LaTeX de la correction (optionnel)
 */
export interface BanqueExterneExercice {
  id: string
  titre: string
  categorie?: string
  sousCategorie?: string
  tags?: string[]
  etoiles?: number
  png?: string
  pngCor?: string
  typ?: string
  typCor?: string
  tex?: string
  texCor?: string
}

/**
 * Personnalisation du document généré (LaTeX et/ou Typst) pour les exercices
 * de la banque : l'équivalent d'un `preambule.tex` que l'auteur de la banque
 * fournirait pour déclarer ses propres commandes/paquets (LaTeX) ou ses
 * propres fonctions/imports (Typst). Chemins relatifs à la racine de la
 * banque, comme les autres fichiers du manifest.
 * @property {string} tex chemin d'un fichier de code LaTeX inséré dans le préambule
 * @property {string} typ chemin d'un fichier de code Typst inséré en tête de document
 */
export interface BanqueExternePreambule {
  tex?: string
  typ?: string
}

/**
 * Contenu du fichier `manifest.json` à la racine d'une banque externe.
 * @property {string} schema doit valoir `mathalea-banque-v1`
 * @property {string} id identifiant court de la banque (slug), utilisé dans les uuid
 * @property {string} titre intitulé du nœud dans « Ressources partenaires »
 * @property {BanqueExternePreambule} preambule personnalisation optionnelle du document généré
 * @property {BanqueExterneExercice[]} exercices liste à plat des exercices
 */
export interface BanqueExterneManifest {
  schema: string
  id: string
  titre: string
  auteur?: string
  licence?: string
  version?: string
  description?: string
  preambule?: BanqueExternePreambule
  exercices: BanqueExterneExercice[]
}

/**
 * Provenance d'une banque : c'est la partie persistée en localStorage, qui
 * permet de recharger la banque au démarrage suivant.
 * @property {'zip'|'forge'|'builtin'} type provenance ; `builtin` désigne une
 * banque livrée avec le site (voir `chargerBanquesIntegrees`), ni persistée ni
 * référençable dans un lien partagé (tout le monde l'a déjà)
 * @property {string} cle identifiant unique de l'entrée installée (voir `cleSource`)
 * @property {string} projet chemin du projet sur la forge (`groupe/projet`), pour `forge`
 * @property {string} ref branche ou tag lu sur la forge, pour `forge`
 * @property {string} racine sous-dossier contenant le `manifest.json` (vide par défaut)
 * @property {string} nomFichier nom de l'archive déposée, pour `zip` (affichage seulement)
 */
export interface BanqueExterneSource {
  type: 'zip' | 'forge' | 'builtin'
  cle: string
  projet?: string
  ref?: string
  racine?: string
  nomFichier?: string
}

/**
 * Une banque chargée en mémoire, prête à être fusionnée dans les référentiels.
 * @property {BanqueExterneSource} source provenance (persistée)
 * @property {BanqueExterneManifest} manifest manifest validé
 * @property {Map<string,string>} assets chemin relatif -> URL utilisable dans le
 * navigateur (`blob:` pour un zip, URL d'API GitLab pour un dépôt de forge)
 * @property {BanqueExternePreambule} preambuleTexte code LaTeX/Typst du
 * préambule (`manifest.preambule`), déjà lu une fois pour toutes au
 * chargement de la banque plutôt que retéléchargé à chaque export
 */
export interface BanqueExterneChargee {
  source: BanqueExterneSource
  manifest: BanqueExterneManifest
  assets: Map<string, string>
  preambuleTexte?: BanqueExternePreambule
}

/**
 * Fabrique la clé unique d'une source, qui sert à la fois d'identifiant en
 * localStorage/IndexedDB et de valeur du paramètre d'URL `bq` pour les banques
 * distantes (les banques zip, locales à la machine, ne sont pas partageables).
 * @param {BanqueExterneSource} source provenance à identifier
 * @returns {string} clé unique
 */
export function cleSource(source: BanqueExterneSource): string {
  if (source.type === 'forge') {
    const racine = source.racine ? `:${source.racine}` : ''
    return `forge:${source.projet}@${source.ref ?? 'main'}${racine}`
  }
  return source.cle
}

/**
 * Analyse une clé de source distante telle qu'elle apparaît dans le paramètre
 * d'URL `bq` (`forge:groupe/projet@main` ou `forge:groupe/projet@main:sousdossier`).
 * @param {string} cle chaîne à analyser
 * @returns {BanqueExterneSource|null} la source, ou `null` si la chaîne est invalide
 */
export function sourceDepuisCle(cle: string): BanqueExterneSource | null {
  if (!cle.startsWith('forge:')) return null
  const reste = cle.slice('forge:'.length)
  const [avantRacine, racine] = reste.split(':')
  const arobase = avantRacine.lastIndexOf('@')
  if (arobase <= 0) return null
  const projet = avantRacine.slice(0, arobase)
  const ref = avantRacine.slice(arobase + 1)
  if (projet.length === 0 || ref.length === 0) return null
  const source: BanqueExterneSource = {
    type: 'forge',
    cle,
    projet,
    ref,
  }
  if (racine != null && racine.length > 0) source.racine = racine
  return source
}

/**
 * Détermine si un uuid désigne un exercice provenant d'une banque externe.
 * @param {string|undefined} uuid uuid à tester
 * @returns {boolean}
 */
export function estUuidBanqueExterne(uuid: string | undefined): boolean {
  return uuid !== undefined && uuid.startsWith(BANQUE_EXTERNE_UUID_PREFIX)
}
