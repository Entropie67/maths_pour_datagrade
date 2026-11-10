import {
  $typst,
  FetchPackageRegistry,
  MemoryAccessModel,
  initOptions,
  preloadRemoteFonts,
} from '@myriaddreamin/typst.ts'
import compilerWasmUrl from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url'
import rendererWasmUrl from '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url'

/**
 * Polices libres (OFL, Google Fonts) servies par MathALÉA et chargées dans
 * le compilateur pour que le choix de police fonctionne dans l'aperçu et le
 * PDF (le compilateur WASM n'embarque que Libertinus/New Computer Modern).
 * Les fichiers sont dans `public/fonts/typst/`.
 */
const TYPST_FONT_FILES = [
  'NotoSans.ttf',
  'NotoSerif.ttf',
  'Lora.ttf',
  'SourceSans3.ttf',
  'Luciole.ttf',
  'Ubuntu.ttf',
  'OpenDyslexic.otf',
  'NotoSansMath.ttf',
  'STIXTwoMath.ttf',
  'LibertinusMath.otf',
]
const TYPST_FONT_URLS = TYPST_FONT_FILES.map(
  (file) => `${import.meta.env.BASE_URL}fonts/typst/${file}`,
)

/**
 * Familles embarquées par Typst lui-même, téléchargées par typst.ts depuis
 * `typst-assets` : Libertinus Serif et New Computer Modern (les polices par
 * défaut de la fiche) et DejaVu Sans Mono (rendu `raw`). typst.ts les ajoute
 * de toute façon quand `preloadRemoteFonts` est appelé sans options ; les
 * déclarer explicitement permet surtout de leur passer un `fetcher` qui
 * traverse notre cache persistant.
 */
const TYPST_ASSET_PACKS = ['text'] satisfies ('text' | 'cjk' | 'emoji')[]

/**
 * Compilation Typst dans le navigateur via typst.ts (WASM).
 * Le compilateur (~28 Mo) et les polices (5,3 Mio servies par MathALÉA,
 * 8,3 Mio de `typst-assets`) sont chargés à la première compilation puis
 * réutilisés tout au long de la session. Voir « Coût de démarrage » dans
 * `documentation/.../exports/typst.md`.
 */

const MAIN_FILE = '/main.typ'
/**
 * Cache persistant (survit aux rechargements de page) des gros fichiers.
 * Le suffixe de version invalide le cache existant des utilisateurs quand le
 * contenu d'une URL déjà en cache change (ex : polices variables remplacées
 * par des instances statiques, non détecté sinon puisque l'URL est stable).
 */
const ASSET_CACHE = 'typst-assets-v3'

/**
 * Purge les caches des versions précédentes : le WASM du compilateur pèse
 * 28 Mo, en laisser une copie par version consommerait le quota du navigateur
 * pour rien. Lancé une fois par session, sans être attendu.
 */
function purgeOldAssetCaches(): void {
  if (typeof caches === 'undefined') return
  void caches
    .keys()
    .then((noms) =>
      Promise.all(
        noms
          .filter(
            (nom) => nom.startsWith('typst-assets-') && nom !== ASSET_CACHE,
          )
          .map((nom) => caches.delete(nom)),
      ),
    )
    .catch(() => undefined)
}

/** Ouvre le cache persistant, ou `null` s'il est indisponible (mode privé, quota) */
async function openAssetCache(): Promise<Cache | null> {
  try {
    if (typeof caches !== 'undefined') return await caches.open(ASSET_CACHE)
  } catch {
    // Cache API indisponible/pleine : on retombe sur un fetch normal
  }
  return null
}

/**
 * Récupère un fichier depuis le Cache API (téléchargé une seule fois, même
 * après un rechargement de page), avec repli sur un fetch réseau simple.
 * Les URL du WASM sont hashées par Vite : changer de version invalide
 * naturellement l'entrée de cache.
 *
 * La réponse reconstruite peut être passée
 * telle quelle à `WebAssembly.instantiateStreaming` (voir `ensureInitialized`),
 * qui alimente le cache de code
 * compilé du navigateur — un module de 28 Mo n'est alors plus recompilé de
 * zéro à chaque chargement de page.
 */
export async function cachedResponse(url: string): Promise<Response> {
  const cache = await openAssetCache()
  const hit = await cache?.match(url)
  const isWasm = new URL(url, 'https://mathalea.local').pathname.endsWith(
    '.wasm',
  )
  const validateWasm = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer)
    if (
      bytes.length < 8 ||
      bytes[0] !== 0 ||
      bytes[1] !== 0x61 ||
      bytes[2] !== 0x73 ||
      bytes[3] !== 0x6d
    ) {
      throw new Error(
        `Le téléchargement de ${url} ne contient pas un module WebAssembly valide. Réessayer la compilation.`,
      )
    }
  }
  if (hit != null) {
    if (!isWasm) return hit
    try {
      validateWasm(await hit.clone().arrayBuffer())
      return hit
    } catch {
      // Une page HTML servie avec HTTP 200 ne doit pas empoisonner le cache.
      await cache?.delete(url).catch(() => false)
    }
  }
  // un statut d'erreur (404, 429 de limitation de débit, etc.) n'est jamais
  // mis en cache ni renvoyé comme si c'était le fichier : le corps de la
  // réponse d'erreur (souvent du texte/JSON) serait sinon pris pour les
  // octets de l'image ou de la police, échouant plus loin de façon opaque
  // (ex. « Invalid PNG signature » au décodage Typst)
  let derniereErreur: unknown
  for (let tentative = 0; tentative < 2; tentative++) {
    try {
      const response = await fetch(
        url,
        tentative === 0 && hit == null ? undefined : { cache: 'reload' },
      )
      if (!response.ok) {
        throw new Error(
          `Échec du téléchargement de ${url} (HTTP ${response.status})`,
        )
      }
      const buffer = await response.arrayBuffer()
      if (isWasm) validateWasm(buffer)
      // On reconstruit la réponse à partir des octets effectivement reçus :
      // un Content-Length erroné du serveur ne contamine ainsi pas le cache.
      // Le type MIME est conservé (et rétabli pour le WASM, faute de quoi
      // `instantiateStreaming` refuse la réponse et retombe sur le chemin lent).
      const contentType = isWasm
        ? 'application/wasm'
        : response.headers.get('content-type')
      const headers =
        contentType == null ? undefined : { 'content-type': contentType }
      const stored = new Response(buffer.slice(0), { headers })
      if (cache != null) {
        await cache.put(url, stored.clone()).catch(() => undefined)
      }
      return stored
    } catch (error) {
      derniereErreur = error
    }
  }
  throw derniereErreur
}

/** Octets d'un fichier, servis par le même cache persistant que `cachedResponse` */
export async function cachedBytes(url: string): Promise<Uint8Array> {
  const cache = await openAssetCache()
  const hit = await cache?.match(url)
  if (hit != null) {
    try {
      return new Uint8Array(await hit.arrayBuffer())
    } catch {
      // Une réponse interrompue peut avoir été enregistrée avec un
      // Content-Length supérieur à son corps. On l'écarte et on retélécharge.
      await cache?.delete(url).catch(() => false)
    }
  }
  return new Uint8Array(await (await cachedResponse(url)).arrayBuffer())
}

/**
 * Octets des images d'exercices statiques (annales scannées), par chemin
 * virtuel (`mapShadow`). Renseigné par `Typst.svelte` une fois les images
 * récupérées ; appliqué au compilateur juste avant chaque compilation, ce qui
 * couvre aussi bien l'aperçu (SVG) que l'export PDF.
 */
let staticImageBytes: Map<string, Uint8Array> = new Map()

/**
 * Registre déjà chargé dans le compilateur : `mapStaticImages` est appelé
 * avant *chaque* compilation, or recopier plusieurs Mo d'images scannées dans
 * la mémoire WASM à chaque frappe ne sert à rien tant que le registre n'a pas
 * changé (les fichiers virtuels y restent enregistrés).
 */
let mappedImageBytes: Map<string, Uint8Array> | null = null

/** Renseigne le registre des images d'exercices statiques (voir `staticImageBytes`) */
export function setStaticImageBytes(bytes: Map<string, Uint8Array>): void {
  staticImageBytes = bytes
  mappedImageBytes = null
}

/** Charge les images d'exercices statiques dans le système de fichiers virtuel du compilateur */
async function mapStaticImages(): Promise<void> {
  if (staticImageBytes.size === 0) return
  if (mappedImageBytes === staticImageBytes) return
  const compiler = await $typst.getCompiler()
  for (const [path, bytes] of staticImageBytes) {
    compiler.mapShadow(path, bytes)
  }
  mappedImageBytes = staticImageBytes
}

/** Initialisation unique par session (mémorisée par la promesse) */
let initPromise: Promise<void> | null = null

function ensureInitialized(): Promise<void> {
  if (initPromise != null) return initPromise
  initPromise = (async () => {
    purgeOldAssetCaches()
    // polices chargées depuis le cache ; une police manquante est ignorée
    // plutôt que de casser toute la compilation
    const fonts = (
      await Promise.all(
        TYPST_FONT_URLS.map((url) => cachedBytes(url).catch(() => null)),
      )
    ).filter((bytes): bytes is Uint8Array => bytes != null)

    $typst.setCompilerInitOptions({
      // la `Response` (et non les octets) autorise `instantiateStreaming` :
      // voir `cachedResponse`
      getModule: () => cachedResponse(compilerWasmUrl),
      beforeBuild: [
        preloadRemoteFonts(fonts, {
          assets: TYPST_ASSET_PACKS,
          // sans ce `fetcher`, typst.ts télécharge les 8,3 Mio de polices
          // d'assets avec `fetch` nu : elles repartent alors du réseau à
          // chaque session, hors de notre cache persistant
          fetcher: ((input: RequestInfo | URL) =>
            cachedResponse(String(input))) as typeof fetch,
        }),
      ],
    })
    $typst.setRendererInitOptions({
      getModule: () => cachedResponse(rendererWasmUrl),
    })
    // Autorise l'import des paquets `@preview` (ex : taskize pour les QCM)
    // depuis packages.typst.org, mis en cache après le premier téléchargement.
    const accessModel = new MemoryAccessModel()
    $typst.use({
      key: 'package-registry$fetch',
      forRoles: ['compiler'],
      provides: [
        initOptions.withAccessModel(accessModel),
        initOptions.withPackageRegistry(new FetchPackageRegistry(accessModel)),
      ],
    })
  })()
  return initPromise
}

/**
 * Indique si le compilateur est déjà en cache (donc chargé sans nouveau
 * téléchargement). Sert à adapter le message d'attente.
 */
export async function isCompilerCached(): Promise<boolean> {
  try {
    if (typeof caches === 'undefined') return false
    const cache = await caches.open(ASSET_CACHE)
    return (await cache.match(compilerWasmUrl)) != null
  } catch {
    return false
  }
}

/**
 * Repère de la palette de mise en page : position (en pt, depuis le coin
 * haut-gauche de sa page) d'un point d'intérêt du document, publiée par le
 * helper Typst `mathalea-anchor` de `buildTypstDocument`.
 */
export interface TypstAnchor {
  /**
   * `tasks`/`tasks-corr` : liste de questions réglable (énoncé/correction) ;
   * `exo` : début d'un exercice (nombre de questions, suppression) ;
   * `version-exo` : début d'un exercice d'un sujet B, C... (régénération
   * des seules données aléatoires) ;
   * `corr` : début de la correction d'un exercice (édition du code, insertion) ;
   * `gap` : espace après un exercice ; `header` : bloc de titre de la fiche ;
   * `cover` : textes de la page de garde ; `footer` : texte du pied de page
   * (émis sur la première page physique seulement, voir `pageFooter`) ;
   * `qr-code` : QR-code global de la fiche (édition de son URL) ;
   * `version-label` : étiquette « Sujet A/B... » de l'en-tête, sur une fiche
   * à plusieurs versions (masquage/affichage) ;
   * `figure` : figure mathalea2d embarquée (zoom) ;
   * `carte-recto`/`carte-verso` : carte de la vue Flash-cards (taille du texte) ;
   * `diapo-question`/`diapo-correction` : diapositive de la vue Diaporama PDF
   * (taille du texte, alignement, masquage, ordre) ;
   * `diapo-garde` : page de garde de cette même vue (édition de son contenu) ;
   * `can-row` : ligne du tableau « Course aux nombres » (édition de son
   * énoncé/réponse), num = numéro de ligne (1-based, colonne « # »)
   * `subject-start` / `subject-end` : début et fin des énoncés d'un sujet,
   * num = sujet (0-based) ; leur écart donne la hauteur du sujet, qui décide
   * si deux sujets (ou exemplaires) tiennent sur une page ; `subject-corr` :
   * début des corrections d'un sujet quand les sujets sont enchaînés
   */
  kind:
    | 'tasks'
    | 'tasks-corr'
    | 'exo'
    | 'version-exo'
    | 'corr'
    | 'gap'
    | 'header'
    | 'cover'
    | 'footer'
    | 'qr-code'
    | 'version-label'
    | 'figure'
    | 'carte-recto'
    | 'carte-verso'
    | 'diapo-question'
    | 'diapo-correction'
    | 'diapo-garde'
    | 'can-row'
    | 'can-table'
    | 'subject-start'
    | 'subject-end'
    | 'subject-corr'
  /** Numéro de l'exercice concerné (0 = avant le premier exercice), ou de la figure */
  num: number
  page: number
  x: number
  y: number
}

const ANCHOR_KINDS = new Set([
  'tasks',
  'tasks-corr',
  'exo',
  'version-exo',
  'corr',
  'gap',
  'header',
  'cover',
  'footer',
  'qr-code',
  'version-label',
  'figure',
  'carte-recto',
  'carte-verso',
  'diapo-question',
  'diapo-correction',
  'diapo-garde',
  'can-row',
  'can-table',
  'subject-start',
  'subject-end',
  'subject-corr',
])

/** Valide et filtre les métadonnées renvoyées par `query(<mathalea-anchor>)` */
function parseAnchors(values: unknown): TypstAnchor[] {
  if (!Array.isArray(values)) return []
  const anchors: TypstAnchor[] = []
  for (const value of values) {
    if (value == null || typeof value !== 'object') continue
    const { kind, num, page, x, y } = value as Record<string, unknown>
    if (
      typeof kind === 'string' &&
      ANCHOR_KINDS.has(kind) &&
      typeof num === 'number' &&
      typeof page === 'number' &&
      typeof x === 'number' &&
      typeof y === 'number'
    ) {
      anchors.push({ kind: kind as TypstAnchor['kind'], num, page, x, y })
    }
  }
  return anchors
}

export interface TypstCompileResult {
  /** Document rendu (toutes les pages) en SVG, si la compilation a abouti */
  svg?: string
  /** Diagnostics (erreurs et avertissements) au format `fichier:ligne:col: message` */
  diagnostics: string[]
  /** Repères de la palette de mise en page (vide si le code n'en émet pas) */
  anchors?: TypstAnchor[]
  imageGeometries?: import('./imageOverflow').ImageGeometry[]
}

/** Compile la source et rend le document en SVG pour l'aperçu */
export async function compileTypstToSvg(
  source: string,
): Promise<TypstCompileResult> {
  await ensureInitialized()
  await mapStaticImages()
  const compiler = await $typst.getCompiler()
  await compiler.addSource(MAIN_FILE, source)
  // un seul « monde » de compilation : l'artefact SVG et la requête des
  // repères de mise en page partagent le même document compilé
  return await compiler.runWithWorld(
    { mainFilePath: MAIN_FILE },
    async (world) => {
      const compiled = await world.vector({ diagnostics: 'unix' })
      const diagnostics: string[] = (compiled?.diagnostics ?? []).map(
        (diagnostic: unknown) => String(diagnostic),
      )
      if (compiled?.result == null) return { diagnostics }
      const svg = await $typst.svg({ vectorData: compiled.result })
      let anchors: TypstAnchor[] = []
      try {
        anchors = parseAnchors(
          await world.query({ selector: '<mathalea-anchor>', field: 'value' }),
        )
      } catch {
        // document sans repère (code réécrit à la main) : pas de palette
      }
      const { parseImageGeometries } = await import('./imageOverflow')
      const imageGeometries = parseImageGeometries(
        await world.query({
          selector: '<mathalea-image-geometry>',
          field: 'value',
        }),
      )
      return { svg, diagnostics, anchors, imageGeometries }
    },
  )
}

/** Compile la source en PDF (octets du fichier) */
export async function compileTypstToPdf(
  source: string,
): Promise<Uint8Array | undefined> {
  await ensureInitialized()
  await mapStaticImages()
  const compiler = await $typst.getCompiler()
  await compiler.addSource(MAIN_FILE, source)
  // même « monde » de compilation que l'aperçu SVG (`compileTypstToSvg`) :
  // `$typst.pdf()` compile dans un monde séparé qui ne voit pas les fichiers
  // virtuels enregistrés par `mapShadow` (images d'exercices statiques).
  return await compiler.runWithWorld(
    { mainFilePath: MAIN_FILE },
    async (world) => {
      const compiled = await world.pdf({ diagnostics: 'unix' })
      return compiled?.result
    },
  )
}

/** PDF et résultat de requête issus d'une même compilation. */
export interface TypstPdfAndQuery {
  /** Octets du PDF, absents si la compilation a échoué */
  pdf?: Uint8Array
  /** Valeurs des métadonnées correspondant au sélecteur */
  values: unknown[]
  /** Diagnostics au format `fichier:ligne:col: message` */
  diagnostics: string[]
}

/**
 * Compile la source en PDF **et** interroge ses métadonnées dans le même
 * « monde » de compilation.
 *
 * C'est ce qui permet à l'export de lecture optique (`src/lib/omr/`) d'obtenir
 * d'un seul coup la feuille à imprimer et la position exacte de chacune de ses
 * cases à cocher : deux compilations séparées ne garantiraient pas que les
 * positions décrivent bien le PDF remis au professeur.
 *
 * @param selector sélecteur Typst, par exemple `<omr-box>`
 */
export async function compileTypstToPdfAndQuery(
  source: string,
  selector: string,
): Promise<TypstPdfAndQuery> {
  await ensureInitialized()
  await mapStaticImages()
  const compiler = await $typst.getCompiler()
  await compiler.addSource(MAIN_FILE, source)
  return await compiler.runWithWorld(
    { mainFilePath: MAIN_FILE },
    async (world) => {
      const compiled = await world.pdf({ diagnostics: 'unix' })
      const diagnostics: string[] = (compiled?.diagnostics ?? []).map(
        (diagnostic: unknown) => String(diagnostic),
      )
      let values: unknown[] = []
      try {
        const resultat = await world.query({ selector, field: 'value' })
        if (Array.isArray(resultat)) values = resultat
      } catch {
        // document sans métadonnée : la requête échoue, ce n'est pas une erreur
      }
      return { pdf: compiled?.result, values, diagnostics }
    },
  )
}
