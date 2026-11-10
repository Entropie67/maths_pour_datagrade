import fs from 'node:fs'
import path from 'node:path'
import { IExercice } from '../../../src/lib/types'

export interface ExerciseEntry {
  uuid: string
  filePath: string // e.g. "6e/6C30-1.ts"
  modulePath: string // e.g. "../../../src/exercices/6e/6C30-1"
}

/**
 * Discovers all exercises from the UUID-to-URL JSON map.
 * @param filter - Optional prefix filter (e.g. '6e', '6e/6C30')
 */
export function discoverExercises(filter?: string): ExerciseEntry[] {
  const jsonPath = path.resolve(
    __dirname,
    '../../../src/json/uuidsToUrlFR.json',
  )
  const uuidMap: Record<string, string> = JSON.parse(
    fs.readFileSync(jsonPath, 'utf-8'),
  )

  return Object.entries(uuidMap)
    .filter(([_uuid, filePath]) => {
      const lower = filePath.toLowerCase()
      if (lower.includes('test') || lower.includes('beta')) return false
      if (filePath.startsWith('modèlesExos/')) return false
      if (filePath.endsWith('.svelte')) return false
      if (filter && !filePath.startsWith(filter)) return false
      return true
    })
    .map(([uuid, filePath]) => ({
      uuid,
      filePath,
      modulePath: `../../../src/exercices/${filePath.replace(/\\.ts$/, '').replace(/\\.js$/, '')}`,
    }))
}

/**
 * Dynamically imports an exercise module and checks if it supports interactivity.
 * Returns null if the exercise is not interactive.
 */
export async function loadExercise(entry: ExerciseEntry) {
  const mod = await import(entry.modulePath)

  if (!mod.interactifReady) return null

  const ExerciseClass: new () => IExercice = mod.default
  if (!ExerciseClass || typeof ExerciseClass !== 'function') return null

  return {
    ExerciseClass,
    formatInteractif: mod.formatInteractif ?? 'mathLive',
    amcReady: mod.amcReady,
    amcType: mod.amcType,
    titre: String(mod.titre ?? entry.filePath),
  }
}
