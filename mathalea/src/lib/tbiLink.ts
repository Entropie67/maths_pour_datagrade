import type { TbiTextContent } from './tbiTextContent'

/**
 * Liens internet affichés dans un visualiseur de la vue TBI : vidéos
 * (YouTube, PeerTube, PodEduc, fichier vidéo), figures GeoGebra, documents
 * (PDF, image) et pages web.
 *
 * Une vidéo de plateforme est affichée dans le lecteur intégré du site
 * (iframe), avec le moins d'habillage possible : pas de titre, de vidéos
 * suggérées ni de lien vers la plateforme quand le lecteur le permet. Un
 * fichier vidéo (MP4, WebM…) est lu par la balise `<video>` du navigateur.
 * Tout autre lien est d'abord traité comme un document, chargé par
 * `tbiDocument.ts`, puis affiché tel quel dans une iframe si ce n'en est pas un.
 */

export type TbiVideoProvider =
  'youtube' | 'peertube' | 'podeduc' | 'drive' | 'geogebra' | 'web' | 'file'

export interface TbiVideo {
  provider: TbiVideoProvider
  /** Adresse du lecteur intégré (iframe) ou du fichier vidéo (`<video>`) */
  src: string
  /** Lien saisi par le professeur */
  pageUrl: string
}

/** Contenu d'un visualiseur ouvert depuis un lien */
export type TbiLinkContent =
  { type: 'link'; url: string } | { type: 'video'; video: TbiVideo }

/** Contenu d'un visualiseur : fichier de l'ordinateur, lien, note ou figure */
export type TbiViewerContent =
  { type: 'file'; file: File } | TbiLinkContent | TbiTextContent

/**
 * Droits d'une page web quelconque affichée dans une iframe : elle fonctionne
 * normalement mais ne peut pas rediriger la vue TBI (`allow-top-navigation`
 * absent), le lien pouvant venir d'une séance reçue d'un collègue.
 */
export const TBI_WEB_PAGE_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads'

const VIDEO_EXTENSIONS = ['mp4', 'm4v', 'webm', 'ogv', 'mov']

/**
 * Adresse http(s) saisie ou collée par le professeur. Le protocole peut être
 * omis (« youtu.be/… », « www.site.fr/sujet.pdf ») : https est alors ajouté.
 * @returns null si le texte n'est pas une adresse web
 */
export function parseHttpUrl(text: string): URL | null {
  const trimmed = text.trim()
  if (trimmed === '' || /\s/.test(trimmed)) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : // sans protocole, un point dans le nom d'hôte distingue une adresse
      // d'un simple mot
      /^[^/]+\.[^/]+/.test(trimmed)
      ? `https://${trimmed}`
      : null
  if (withScheme === null) return null
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') {
      return null
    }
    return url
  } catch {
    return null
  }
}

/**
 * Instant de départ d'une vidéo, en secondes : « 90 », « 90s », « 1m30s »,
 * « 1h2m3s » ou « 1:30 ».
 * @returns null si la valeur est absente ou illisible
 */
export function parseTimestamp(
  value: string | null | undefined,
): number | null {
  if (value == null) return null
  const text = value.trim().toLowerCase()
  if (/^\d+(\.\d+)?s?$/.test(text)) return Math.floor(parseFloat(text))
  const units = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(text)
  if (units && text !== '') {
    const [, h, m, s] = units
    return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0)
  }
  const clock = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(text)
  if (clock) {
    const [, h, m, s] = clock
    return Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s)
  }
  return null
}

/** Instant de départ porté par le lien (`t`, `start`, ou `#t=`) */
function startOf(url: URL): number | null {
  const fromHash = /(?:^#|&)t=([^&]+)/.exec(url.hash)?.[1]
  const start =
    parseTimestamp(url.searchParams.get('start')) ??
    parseTimestamp(url.searchParams.get('t')) ??
    parseTimestamp(fromHash)
  return start !== null && start > 0 ? start : null
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]

/** Identifiant d'une vidéo YouTube, ou null pour un autre lien */
export function youtubeVideoId(url: URL): string | null {
  const host = url.hostname.toLowerCase()
  let id: string | null = null
  if (host === 'youtu.be' || host === 'www.youtu.be') {
    id = url.pathname.split('/')[1] ?? null
  } else if (YOUTUBE_HOSTS.includes(host)) {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v')
    } else {
      id =
        /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname)?.[1] ?? null
    }
  }
  return id !== null && YOUTUBE_ID.test(id) ? id : null
}

/** Identifiant court (base 58) ou UUID d'une vidéo ou d'une liste PeerTube */
const PEERTUBE_ID =
  '([1-9A-HJ-NP-Za-km-z]{16,26}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'
const PEERTUBE_VIDEO = new RegExp(
  `^/(?:w|videos/watch|videos/embed)/${PEERTUBE_ID}/?$`,
)
const PEERTUBE_PLAYLIST = new RegExp(
  `^/(?:w/p|videos/watch/playlist|video-playlists/embed)/${PEERTUBE_ID}/?$`,
)

/**
 * Lecteur intégré d'une vidéo (ou d'une liste de lecture) PeerTube, quelle
 * que soit l'instance : les chemins des liens PeerTube suffisent à les
 * reconnaître. Le pair à pair est désactivé (souvent bloqué sur les réseaux
 * des établissements), ainsi que le titre, l'avertissement et le lien vers
 * l'instance.
 */
export function peertubeEmbedUrl(url: URL): string | null {
  const video = PEERTUBE_VIDEO.exec(url.pathname)
  const playlist = video ? null : PEERTUBE_PLAYLIST.exec(url.pathname)
  if (!video && !playlist) return null
  const path = video
    ? `/videos/embed/${video[1]}`
    : `/video-playlists/embed/${playlist?.[1]}`
  const params = new URLSearchParams({
    title: '0',
    warningTitle: '0',
    peertubeLink: '0',
    p2p: '0',
  })
  const start = startOf(url)
  if (start !== null) params.set('start', String(start))
  // une liste de lecture passe aussi par `playlistPosition`
  const position = url.searchParams.get('playlistPosition')
  if (playlist && position !== null) params.set('playlistPosition', position)
  return `${url.origin}${path}?${params}`
}

/**
 * Serveur Esup-Pod : PodEduc (apps.education.fr) et les serveurs « pod.* »
 * des universités et académies.
 */
function isPodHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host === 'podeduc.apps.education.fr' || /^pod[a-z0-9-]*\./.test(host)
}

/**
 * Lecteur intégré d'une vidéo PodEduc (Esup-Pod) : la page de la vidéo avec
 * `is_iframe=true`. Les liens privés (`/video/<id>/<clé>/`) sont conservés.
 */
export function podEmbedUrl(url: URL): string | null {
  if (!isPodHost(url.hostname)) return null
  const match = /^\/video\/(\d+-[^/]+)\/(?:([0-9a-f]+)\/)?$/.exec(
    url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`,
  )
  if (!match) return null
  const [, slug, key] = match
  const params = new URLSearchParams({ is_iframe: 'true' })
  const start = startOf(url)
  if (start !== null) params.set('start', String(start))
  return `${url.origin}/video/${slug}/${key ? `${key}/` : ''}?${params}`
}

/**
 * Aperçu intégré d'un fichier partagé sur Google Drive (PDF, image, vidéo…).
 * Drive n'autorise pas le téléchargement depuis une autre page (pas d'en-têtes
 * CORS) : seul son lecteur, prévu pour les iframes, peut afficher le fichier.
 * @returns null si le lien n'est pas celui d'un fichier Drive
 */
export function driveEmbedUrl(url: URL): string | null {
  if (url.hostname.toLowerCase() !== 'drive.google.com') return null
  const id =
    /^\/file\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]+)/.exec(url.pathname)?.[1] ??
    (url.pathname === '/open' || url.pathname === '/uc'
      ? url.searchParams.get('id')
      : null)
  if (id === null || !/^[A-Za-z0-9_-]+$/.test(id)) return null
  return `https://drive.google.com/file/d/${id}/preview`
}

const GEOGEBRA_HOST = /^(?:[a-z0-9-]+\.)?(?:geogebra|geogebratube)\.org$/
/** Applications de geogebra.org, vides ou ouvertes sur une ressource */
const GEOGEBRA_APP =
  /^\/(classic|calculator|graphing|geometry|3d|cas|scientific|notes|suite|probability)(?:\/([A-Za-z0-9]+))?$/
/** Chemins d'une ressource de GeoGebraTube, actuels ou historiques */
const GEOGEBRA_MATERIAL =
  /^\/(?:m|material\/(?:show|simple|iframe)\/id)\/([A-Za-z0-9]+)(?:\/|$)|^\/student\/[mb]([A-Za-z0-9]+)$/

/**
 * Lecteur intégré d'une ressource de GeoGebraTube, seule : sans menu, barre
 * d'outils ni publicité, et à la taille de son cadre (l'appliquette suit ensuite
 * ses redimensionnements). `/m/<id>?embed` affiche au contraire toute la page,
 * publicités comprises. Options : voir « Material Embedding (Iframe) » dans la
 * documentation de GeoGebra. Le serveur répond avec un statut 410, mais envoie
 * bien l'appliquette.
 */
function geogebraMaterialUrl(id: string): string {
  return `https://www.geogebra.org/material/iframe/id/${id}/border/888888/rc/false/ai/false/sdz/true/smb/false/stb/false/stbh/false/ld/false/sri/true`
}

/**
 * Lecteur intégré d'une ressource GeoGebraTube, ou d'une application GeoGebra
 * (`?embed`, sans publicité pour celles-ci). Rien n'est hébergé ni installé ici.
 * @returns null si le lien n'est pas celui d'une ressource GeoGebra
 */
export function geogebraEmbedUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase()
  const path = url.pathname.replace(/\/+$/, '')
  // liens courts : `ggbm.at/<id>` et `ggbtu.be/m<id>`
  if (host === 'ggbm.at') {
    const id = /^\/([A-Za-z0-9]+)$/.exec(path)?.[1]
    return id ? geogebraMaterialUrl(id) : null
  }
  if (host === 'ggbtu.be') {
    const id = /^\/[mb]([A-Za-z0-9]+)$/.exec(path)?.[1]
    return id ? geogebraMaterialUrl(id) : null
  }
  if (!GEOGEBRA_HOST.test(host)) return null
  const app = GEOGEBRA_APP.exec(path)
  if (app) {
    const page = app[2] ? `/${app[1]}/${app[2]}` : `/${app[1]}`
    return `https://www.geogebra.org${page}?embed`
  }
  const material = GEOGEBRA_MATERIAL.exec(path)
  if (!material) return null
  // activité d'un livre : `/m/<livre>#material/<activité>`
  const inBook = /^#material\/([A-Za-z0-9]+)$/.exec(url.hash)?.[1]
  return geogebraMaterialUrl(inBook ?? material[1] ?? material[2])
}

function isDropboxHost(url: URL): boolean {
  const host = url.hostname.toLowerCase()
  return host === 'dropbox.com' || host === 'www.dropbox.com'
}

/**
 * Lien de partage d'un dossier Dropbox (`/scl/fo/…`, ancien `/sh/…`) : Dropbox
 * n'en propose que le téléchargement en ZIP, il ne peut pas être affiché.
 */
export function isDropboxFolderUrl(url: URL): boolean {
  return isDropboxHost(url) && /^\/(?:scl\/fo|sh)\//.test(url.pathname)
}

/**
 * Adresse de téléchargement direct d'un fichier partagé sur Dropbox
 * (`/scl/fi/…` ou ancien `/s/…`) : la page de partage (`dl=0`) est une page
 * web, alors que `raw=1` renvoie le fichier lui-même (avec les en-têtes CORS
 * nécessaires à son chargement par `fetch`).
 * @returns null si le lien n'est pas celui d'un fichier Dropbox
 */
export function dropboxDirectUrl(url: URL): URL | null {
  if (!isDropboxHost(url) || !/^\/(?:scl\/fi|s)\//.test(url.pathname)) {
    return null
  }
  const direct = new URL(url.href)
  direct.searchParams.delete('dl')
  direct.searchParams.set('raw', '1')
  return direct
}

/** Lecteur YouTube sans cookies, sans vidéos suggérées d'autres chaînes */
function youtubeEmbedUrl(id: string, url: URL): string {
  const params = new URLSearchParams({
    rel: '0',
    iv_load_policy: '3',
    playsinline: '1',
  })
  const start = startOf(url)
  if (start !== null) params.set('start', String(start))
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}

function extensionOf(url: URL): string {
  const last = url.pathname.split('/').pop() ?? ''
  return last.includes('.') ? (last.split('.').pop()?.toLowerCase() ?? '') : ''
}

/** Vidéo d'un lien reconnu, ou null pour un autre lien */
export function videoOfUrl(url: URL): TbiVideo | null {
  const pageUrl = url.href
  const youtubeId = youtubeVideoId(url)
  if (youtubeId !== null) {
    return {
      provider: 'youtube',
      src: youtubeEmbedUrl(youtubeId, url),
      pageUrl,
    }
  }
  const drive = driveEmbedUrl(url)
  if (drive !== null) return { provider: 'drive', src: drive, pageUrl }
  const geogebra = geogebraEmbedUrl(url)
  if (geogebra !== null) {
    return { provider: 'geogebra', src: geogebra, pageUrl }
  }
  const pod = podEmbedUrl(url)
  if (pod !== null) return { provider: 'podeduc', src: pod, pageUrl }
  const peertube = peertubeEmbedUrl(url)
  if (peertube !== null) return { provider: 'peertube', src: peertube, pageUrl }
  if (VIDEO_EXTENSIONS.includes(extensionOf(url))) {
    return { provider: 'file', src: pageUrl, pageUrl }
  }
  return null
}

/**
 * Contenu à afficher pour un lien saisi, collé ou déposé : une vidéo si le
 * lien est reconnu, sinon un document (PDF ou image) à télécharger.
 * @returns null si le texte n'est pas une adresse web
 */
export function parseTbiLink(text: string): TbiLinkContent | null {
  const parsed = parseHttpUrl(text)
  if (parsed === null) return null
  const url = dropboxDirectUrl(parsed) ?? parsed
  const video = videoOfUrl(url)
  if (video !== null) return { type: 'video', video }
  return { type: 'link', url: url.href }
}

/**
 * Page web affichée telle quelle dans une iframe : le lien d'un site qui n'est
 * ni une vidéo reconnue, ni un document. Un site refuse parfois d'être affiché
 * ainsi, sans que la vue TBI puisse le savoir : la barre du visualiseur propose
 * donc toujours de l'ouvrir dans un nouvel onglet.
 */
export function webPageContent(href: string): TbiLinkContent {
  return {
    type: 'video',
    video: { provider: 'web', src: href, pageUrl: href },
  }
}

/**
 * Une page https ne peut pas afficher une page http dans une iframe (le
 * navigateur la bloque, sans erreur visible).
 */
export function isBlockedMixedContent(
  href: string,
  pageProtocol: string,
): boolean {
  return pageProtocol === 'https:' && href.startsWith('http:')
}

/** Lien d'origine d'un contenu, à ouvrir dans un nouvel onglet */
export function externalUrlOf(content: TbiViewerContent | null): string | null {
  if (content?.type === 'link') return content.url
  if (content?.type !== 'video' || content.video.provider === 'file') {
    return null
  }
  return content.video.pageUrl
}

/**
 * Liens d'un glisser-déposer (`text/uri-list` : un lien par ligne, les
 * lignes commençant par # sont des commentaires).
 */
export function linksOfUriList(uriList: string): TbiLinkContent[] {
  return uriList
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '' && !line.startsWith('#'))
    .map(parseTbiLink)
    .filter((content): content is TbiLinkContent => content !== null)
}

/** Nom de fichier lisible d'un lien (dernier segment du chemin, ou l'hôte) */
export function fileNameOfUrl(href: string): string {
  try {
    const url = new URL(href)
    const last = url.pathname.split('/').filter(Boolean).pop()
    if (last) {
      try {
        return decodeURIComponent(last)
      } catch {
        return last
      }
    }
    return url.hostname
  } catch {
    return href
  }
}

const PROVIDER_LABELS: Record<
  Exclude<TbiVideoProvider, 'file' | 'web'>,
  string
> = {
  youtube: 'Vidéo YouTube',
  peertube: 'Vidéo PeerTube',
  podeduc: 'Vidéo PodEduc',
  drive: 'Document Google Drive',
  geogebra: 'Figure GeoGebra',
}

/** Titre de la barre du visualiseur */
export function viewerContentTitle(content: TbiViewerContent | null): string {
  if (content === null) return 'Visualiseur de document'
  if (content.type === 'file') return content.file.name || 'Document'
  if (content.type === 'link') return fileNameOfUrl(content.url)
  if (content.type === 'markdown') return 'Note'
  if (content.type === 'figure') return content.name
  if (content.video.provider === 'file') {
    return fileNameOfUrl(content.video.src)
  }
  if (content.video.provider === 'web') {
    return new URL(content.video.src).hostname
  }
  return PROVIDER_LABELS[content.video.provider]
}
