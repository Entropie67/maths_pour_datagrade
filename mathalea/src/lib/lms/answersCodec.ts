/**
 * Encodage des réponses d'élève échangées avec un LMS (Moodle/SCORM).
 *
 * SCORM 1.2 plafonne `cmi.suspend_data` à 4 096 caractères : une seule figure
 * ApiGeom suffisait à le dépasser. Les réponses sont donc compressées (gzip) puis
 * encodées en base64url, ce qui les rend transportables telles quelles dans une URL
 * (pas d'échappement `%xx`, qui gonflait le JSON brut d'un facteur ~1,9).
 *
 * Le format est préfixé par `z:` pour pouvoir être distingué du JSON brut : les
 * copies déjà enregistrées dans les LMS restent lisibles (voir `decodeAnswers`).
 *
 * L'encodage est également implémenté, à l'identique, dans
 * `public/assets/externalJs/moodle.scorm.js`, qui est un script autonome servi au
 * SCO Moodle et ne peut donc pas importer ce module.
 */

export const COMPRESSED_PREFIX = 'z:'

export type Answers = Record<string, string>

function isCompressionAvailable(): boolean {
  return (
    typeof CompressionStream === 'function' &&
    typeof DecompressionStream === 'function'
  )
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlToBytes(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function pipeThrough(
  bytes: Uint8Array,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const blob = new Blob([bytes as BlobPart])
  const compressed = blob.stream().pipeThrough(stream as ReadableWritablePair)
  const buffer = await new Response(compressed).arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * Compresse les réponses pour les transmettre à un LMS.
 * Si le navigateur ne dispose pas de l'API de compression, le JSON brut est
 * renvoyé : il reste compris par `decodeAnswers`.
 */
export async function encodeAnswers(answers: Answers): Promise<string> {
  const json = JSON.stringify(answers)
  if (!isCompressionAvailable()) return json
  const bytes = new TextEncoder().encode(json)
  const gzipped = await pipeThrough(bytes, new CompressionStream('gzip'))
  return COMPRESSED_PREFIX + bytesToBase64Url(gzipped)
}

/**
 * Décode les réponses reçues d'un LMS, qu'elles soient compressées (`z:…`) ou en
 * JSON brut (copies enregistrées avant la mise en place de la compression).
 */
export async function decodeAnswers(
  payload: string,
): Promise<Answers | undefined> {
  if (!payload) return undefined
  if (!payload.startsWith(COMPRESSED_PREFIX)) return JSON.parse(payload)
  const gzipped = base64UrlToBytes(payload.slice(COMPRESSED_PREFIX.length))
  const bytes = await pipeThrough(gzipped, new DecompressionStream('gzip'))
  return JSON.parse(new TextDecoder().decode(bytes))
}
