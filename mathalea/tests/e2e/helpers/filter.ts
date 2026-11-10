import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type JSONReferentielObject } from '../../../src/lib/types/referentiels'

let cachedStaticReferentiel: JSONReferentielObject | null = null

export function loadStaticRef(): JSONReferentielObject | null {
  // Charger en JSON natif via fs (pas via Vite) => PAS DE FETCH par vitest
  if (cachedStaticReferentiel) return cachedStaticReferentiel

  const __dirname = dirname(fileURLToPath(import.meta.url))
  const referentielStaticFR = JSON.parse(
    readFileSync(
      resolve(__dirname, '../../../src/json/referentielStaticFR.json'),
      'utf8',
    ),
  )
  const referentielStaticCH = JSON.parse(
    readFileSync(
      resolve(__dirname, '../../../src/json/referentielStaticCH.json'),
      'utf8',
    ),
  )

  // Object.keys(referentielStaticFR)
  // [
  //   "Brevet",
  //   "BrevetTags",
  //   "30_Épreuves de Première - Par année",
  //   "40_Épreuves de Première - Par thème",
  //   "50_Baccalauréat - Par année",
  //   "60_Baccalauréat - Par thème",
  //   "crpe",
  //   "crpeTags",
  // ]

  // Object.keys(referentielStaticFR)
  // [
  //   "EVACOM",
  //   "EVACOMTags",
  // ]
  // on supprime les entrées par thème qui entraîne des doublons
  delete referentielStaticFR['BrevetTags']
  delete referentielStaticFR['40_Épreuves de Première - Par thème']
  delete referentielStaticFR['60_Baccalauréat - Par thème']
  delete referentielStaticFR['crpeTags']
  delete referentielStaticCH['EVACOMTags']

  // ➡️ Ça charge directement depuis le disque, pas via vite-node → plus rapide et pas de timeout.
  // add all static referentiels FR and CH
  // Fusion FR + CH
  cachedStaticReferentiel = {
    ...referentielStaticFR,
    ...referentielStaticCH,
  }

  return cachedStaticReferentiel
}

let cachedUuidToUrl: Record<string, string> | null = null

function loadUuid(): Record<string, string> | null {
  if (!cachedUuidToUrl) {
    cachedUuidToUrl = JSON.parse(
      readFileSync(
        resolve(__dirname, '../../../src/json/uuidsToUrlFR.json'),
        'utf8',
      ),
    )
  }
  return cachedUuidToUrl
}

export async function findUuid(filter: string) {
  const v: Record<string, string> | null = loadUuid()
  if (!v) return []
  const uuids = Object.entries(v)
  const filters = filter.split('^')
  const uuidsFilter: [string, string][] = []
  filters.forEach((e) => {
    uuidsFilter.push(
      ...uuids.filter(function (uuid) {
        return uuid[1].startsWith(e)
      }),
    )
  })
  return uuidsFilter
}

export async function findStatic(filter: string) {
  const allStaticReferentiels = loadStaticRef()
  if (!allStaticReferentiels) return []
  const uuids = Object.entries(allStaticReferentiels)
  // les clés de allStaticReferentiels sont les thèmes (types)
  // [
  // 0 = ['Brevet', {…}]
  // 1 = ['BrevetTags', {…}]
  // 2 = ['E3C', {…}]
  // 3 ['E3CTags', {…}]
  // 4 ['crpe', {…}]
  // 5 ['crpeTags', {…}]
  // 6 ['Bac', {…}]
  // 7 ['EVACOM', {…}]
  // 8 ['EVACOMTags', {…}]
  // ]
  function getKey<T = any>(item: unknown, key: string): T | undefined {
    if (
      item &&
      typeof item === 'object' &&
      key in (item as Record<string, unknown>)
    ) {
      return (item as Record<string, unknown>)[key] as T
    }
    return undefined
  }

  const uuidsDNB = uuids[0][1] as Record<string, any>
  // key = e3c
  const uuidsE3CG =
    getKey<Record<string, any>>(uuids[1][1], 'E3C - Général') ?? {}
  // key = eam_speciatite
  const uuidsE3CSPT =
    getKey<Record<string, any>>(uuids[1][1], 'Specialite') ?? {}
  // key = eam_specifique
  const uuidsE3CSPQ =
    getKey<Record<string, any>>(uuids[1][1], 'Specifique') ?? {}
  // key = eam_technologique
  const uuidsE3CT =
    getKey<Record<string, any>>(uuids[1][1], 'Technologique') ?? {}
  const uuidsBACG = getKey<Record<string, any>>(uuids[2][1], '00_Général') ?? {}
  const uuidsBACSTI = getKey<Record<string, any>>(uuids[2][1], '10_STI2D') ?? {}
  const uuidsBACSTL = getKey<Record<string, any>>(uuids[2][1], '20_STL') ?? {}
  const uuidsCRPE = uuids[3][1] as Record<string, any>
  const uuidsEVACOM = uuids[4][1] as Record<string, any>
  const uuidsFound: [string, string][] = []
  const filters = filter.split('^')
  filters.forEach((e) => {
    Object.entries(uuidsDNB).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsCRPE).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsBACG).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsBACSTI).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsBACSTL).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsE3CG).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsE3CSPT).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsE3CSPQ).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsE3CT).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
    Object.entries(uuidsEVACOM).forEach(([, value]) => {
      // les keys sont les années, elles ne nous intéressent pas ici!
      const values = Object.values(value)
      values.forEach((val) => {
        if (
          val !== null &&
          typeof val === 'object' &&
          'uuid' in val &&
          typeof val.uuid === 'string' &&
          val.uuid.startsWith(e)
        ) {
          uuidsFound.push([val.uuid, val.uuid])
        }
      })
    })
  })
  return uuidsFound
}
