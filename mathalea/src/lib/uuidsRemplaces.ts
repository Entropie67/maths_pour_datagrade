import uuidsRemplaces from '../json/uuidsRemplaces.json'
import uuidToUrl from '../json/uuidsToUrlFR.json'

/** Successeur disponible, même si le fichier de l'archive existe encore. */
export function uuidNouvelleVersion(
  uuid: string,
  connus: Record<string, unknown> = uuidToUrl,
  remplaces: Record<string, string | null> = uuidsRemplaces,
): string | undefined {
  const visites = new Set<string>([uuid])
  let courant = uuid
  while (courant in remplaces) {
    const suivant = remplaces[courant]
    if (!suivant || visites.has(suivant)) return undefined
    visites.add(suivant)
    courant = suivant
  }
  return courant !== uuid && courant in connus ? courant : undefined
}

/**
 * Renvoie l'uuid de la version courante d'un exercice.
 *
 * Un uuid qui a encore un fichier (exercice courant ou archive `-old`) est
 * renvoyé tel quel : les anciens liens gardent exactement leur version tant
 * que l'archive existe. Une fois l'archive supprimée (`pnpm archive:purge`),
 * `src/json/uuidsRemplaces.json` renvoie vers la version courante.
 *
 * @param uuid uuid lu dans un lien, une activité Capytale, un QR code…
 * @param connus uuid disposant d'un fichier (par défaut `uuidsToUrlFR.json`)
 * @param remplaces table ancien uuid → uuid courant (`null` : supprimé)
 */
export function uuidCourant(
  uuid: string,
  connus: Record<string, unknown> = uuidToUrl,
  remplaces: Record<string, string | null> = uuidsRemplaces,
): string {
  let courant = uuid
  // la table est aplatie par les scripts ; la boucle protège d'un cycle
  for (let saut = 0; saut < 5; saut++) {
    if (courant in connus) return courant
    const suivant = remplaces[courant]
    if (!suivant) return courant
    courant = suivant
  }
  return courant
}
