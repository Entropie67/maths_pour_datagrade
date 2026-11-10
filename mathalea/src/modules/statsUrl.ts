const METADATA_PARAM = '_mathaleaStats'

interface StatsUrlMetadata {
  version: 1
  keys: string[]
  order: number[]
}

/** Évite les collisions avec des paramètres déjà présents dans l'URL. */
function uniqueKey(key: string, usedKeys: Set<string>): string {
  while (usedKeys.has(key)) key += '_'
  usedKeys.add(key)
  return key
}

function getStatsKeys(keys: string[]): string[] {
  if (!keys.includes('uuid')) return keys
  const usedKeys = new Set([...keys, 'uuids'])
  return keys.map((key) => {
    if (key === 'uuid') return 'uuids'
    if (key === 'uuids') return uniqueKey('uuids_', usedKeys)
    return key
  })
}

function getMetadataKey(keys: string[], statsKeys: string[]): string {
  return uniqueKey(METADATA_PARAM, new Set([...keys, ...statsKeys]))
}

/**
 * Les virgules séparent les occurrences ; celles des valeurs sont échappées.
 * Le % doit l'être aussi pour distinguer une virgule de la chaîne « %2C ».
 */
function encodeValue(value: string): string {
  return value.replace(/%/g, '%25').replace(/,/g, '%2C')
}

function decodeValue(value: string): string {
  return value.replace(/%25|%2C/g, (encoded) => (encoded === '%25' ? '%' : ','))
}

/**
 * Construit une URL pour Matomo, avec une seule occurrence de chaque clé.
 * Les métadonnées conservent l'ordre original, donc l'appartenance de chaque
 * paramètre à son exercice, même lorsque certains exercices l'omettent.
 * Aucun état du navigateur n'est modifié.
 */
export function buildStatsUrl(pageUrl: string): string {
  const url = new URL(pageUrl)
  const keys: string[] = []
  const keyIndexes = new Map<string, number>()
  const values: string[][] = []
  const order: number[] = []
  for (const [key, value] of url.searchParams) {
    let index = keyIndexes.get(key)
    if (index === undefined) {
      index = keys.length
      keyIndexes.set(key, index)
      keys.push(key)
      values.push([])
    }
    values[index].push(encodeValue(value))
    order.push(index)
  }
  if (keys.length === 0) return url.href

  const statsKeys = getStatsKeys(keys)
  url.search = ''
  statsKeys.forEach((key, index) => {
    url.searchParams.set(key, values[index].join(','))
  })
  const metadata: StatsUrlMetadata = { version: 1, keys, order }
  url.searchParams.set(
    getMetadataKey(keys, statsKeys),
    JSON.stringify(metadata),
  )
  return url.href
}

function isMetadata(value: unknown): value is StatsUrlMetadata {
  if (typeof value !== 'object' || value === null) return false
  const metadata = value as Partial<StatsUrlMetadata>
  const { keys, order } = metadata
  if (!Array.isArray(keys) || !Array.isArray(order)) return false
  return (
    metadata.version === 1 &&
    keys.length > 0 &&
    keys.every((key) => typeof key === 'string') &&
    new Set(keys).size === keys.length &&
    order.every(
      (index) => Number.isInteger(index) && index >= 0 && index < keys.length,
    ) &&
    new Set(order).size === keys.length
  )
}

/**
 * Reconstitue l'URL normale, avec l'ordre et toutes les occurrences d'origine.
 * Une URL statistique incomplète ou sans les métadonnées réversibles est
 * rejetée : deviner les positions risquerait de modifier les exercices.
 */
export function buildNormalUrl(statsUrl: string): string {
  const url = new URL(statsUrl)
  const entries = [...url.searchParams]
  if (entries.length === 0) return url.href

  // La conversion ajoute ses métadonnées en dernier. Une clé similaire dans
  // l'URL normale reste donc un paramètre ordinaire, conservé au retour.
  let metadata: StatsUrlMetadata | undefined
  let metadataKey: string | undefined
  for (const [key, value] of [...entries].reverse()) {
    if (!/^_mathaleaStats_*$/.test(key)) continue
    let candidate: unknown
    try {
      candidate = JSON.parse(value)
    } catch {
      continue
    }
    if (
      isMetadata(candidate) &&
      key === getMetadataKey(candidate.keys, getStatsKeys(candidate.keys))
    ) {
      metadata = candidate
      metadataKey = key
      break
    }
  }
  if (!metadata || !metadataKey) {
    throw new Error('Métadonnées de l’URL statistique absentes ou invalides.')
  }

  const { keys, order } = metadata
  const statsKeys = getStatsKeys(keys)
  const expectedKeys = new Set([...statsKeys, metadataKey])
  if (
    entries.length !== expectedKeys.size ||
    entries.some(([key]) => !expectedKeys.has(key)) ||
    new Set(entries.map(([key]) => key)).size !== entries.length
  ) {
    throw new Error('Paramètres de l’URL statistique incomplets ou invalides.')
  }
  const values = statsKeys.map((key) =>
    url.searchParams.get(key)!.split(',').map(decodeValue),
  )
  const counts = new Array<number>(keys.length).fill(0)
  for (const index of order) counts[index]++
  if (values.some((list, index) => list.length !== counts[index])) {
    throw new Error('Nombre de valeurs incohérent dans l’URL statistique.')
  }

  url.search = ''
  const offsets = new Array<number>(keys.length).fill(0)
  for (const index of order) {
    url.searchParams.append(keys[index], values[index][offsets[index]++])
  }
  return url.href
}
