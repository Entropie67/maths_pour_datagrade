/**
 * Stockage des archives des banques externes locales.
 *
 * Le contenu d'un zip (plusieurs Mo d'images) ne tient pas dans le
 * localStorage : on garde donc les octets de l'archive en IndexedDB, et
 * seulement le descripteur de la banque en localStorage
 * (voir `banquesExternesStore.ts`). Au démarrage, l'archive est relue puis
 * redécompressée pour refabriquer les URLs `blob:` (qui, elles, ne survivent
 * pas à un rechargement de page).
 */

const NOM_BASE = 'mathalea-banques-externes'
const NOM_MAGASIN = 'archives'
const VERSION_BASE = 1

/**
 * Ouvre (et crée au besoin) la base IndexedDB des archives.
 * @returns {Promise<IDBDatabase>} la base ouverte
 */
function ouvrirBase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const requete = window.indexedDB.open(NOM_BASE, VERSION_BASE)
    requete.onupgradeneeded = () => {
      const base = requete.result
      if (!base.objectStoreNames.contains(NOM_MAGASIN)) {
        base.createObjectStore(NOM_MAGASIN)
      }
    }
    requete.onsuccess = () => resolve(requete.result)
    requete.onerror = () => reject(requete.error)
  })
}

/**
 * Exécute une transaction sur le magasin des archives.
 * @param {IDBTransactionMode} mode `readonly` ou `readwrite`
 * @param {(magasin: IDBObjectStore) => IDBRequest} action opération à lancer
 * @returns {Promise<T>} résultat de la requête
 */
async function transaction<T>(
  mode: IDBTransactionMode,
  action: (magasin: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const base = await ouvrirBase()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = base.transaction(NOM_MAGASIN, mode)
      const requete = action(tx.objectStore(NOM_MAGASIN))
      requete.onsuccess = () => resolve(requete.result as T)
      requete.onerror = () => reject(requete.error)
    })
  } finally {
    base.close()
  }
}

/**
 * Enregistre les octets d'une archive.
 * @param {string} cle clé de la banque
 * @param {ArrayBuffer} octets contenu du zip
 */
export async function enregistrerArchive(
  cle: string,
  octets: ArrayBuffer,
): Promise<void> {
  await transaction<undefined>('readwrite', (magasin) =>
    magasin.put(octets, cle),
  )
}

/**
 * Relit les octets d'une archive déjà installée.
 * @param {string} cle clé de la banque
 * @returns {Promise<ArrayBuffer|undefined>} le contenu, ou `undefined` s'il a disparu
 */
export async function lireArchive(
  cle: string,
): Promise<ArrayBuffer | undefined> {
  return await transaction<ArrayBuffer | undefined>('readonly', (magasin) =>
    magasin.get(cle),
  )
}

/**
 * Supprime les octets d'une archive désinstallée.
 * @param {string} cle clé de la banque
 */
export async function supprimerArchive(cle: string): Promise<void> {
  await transaction<undefined>('readwrite', (magasin) => magasin.delete(cle))
}
