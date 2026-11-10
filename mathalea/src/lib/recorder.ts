import type { Recorder } from './types'

/**
 * Ces recorders partagent le protocole d'activité piloté par la plateforme
 * hôte (chargement, fin de tentative, score et rejeu par postMessage).
 */
export function usesHostActivityProtocol(
  recorder: Recorder | undefined,
): recorder is 'flowmath' | 'sesatheque' {
  return recorder === 'flowmath' || recorder === 'sesatheque'
}
