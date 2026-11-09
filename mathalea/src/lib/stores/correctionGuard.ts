import { isLocalStorageAvailable } from './storage'

/**
 * Mémorisation des énoncés servis à l'élève via un lien *sans correction
 * visible* (vue `confeleve`, réglage « Accès aux corrections » désactivé,
 * c'est-à-dire `isSolutionAccessible = false`).
 *
 * Le réglage `isSolutionAccessible` est sérialisé en clair dans le paramètre
 * d'URL `es` : un élève peut donc réactiver l'accès aux corrections en
 * modifiant l'URL, puis consulter la correction *exacte* de la copie qu'il
 * vient de rendre. Pour l'en empêcher, on note ici la référence de l'exercice
 * et la graine de chaque énoncé affiché sans correction ; les vues élève et
 * prof rebattent alors une nouvelle graine si l'élève revient sur l'un de ces
 * énoncés avec l'accès aux corrections possible (URL `es` bricolée, ou URL sans
 * `v=eleve` qui bascule sur la vue prof).
 *
 * Ce n'est pas un verrou fort (le stockage est propre à un navigateur : une
 * autre machine, un autre profil ou un effacement des données le contournent),
 * mais un garde-fou cohérent avec la mémorisation des corrections déjà
 * consultées (`localStorage["<id>|<graine>"] = "true"`).
 */
const SANS_CORRECTION_PREFIX = 'mathalea-sans-correction:'

function storageKey(exerciceId: string, seed: string): string {
  return `${SANS_CORRECTION_PREFIX}${exerciceId}|${seed}`
}

/**
 * Mémorise qu'un énoncé (référence d'exercice + graine) a été affiché à l'élève
 * sans accès à la correction. Sans effet si le stockage local est indisponible.
 */
export function rememberSeedServedWithoutCorrection(
  exerciceId: string | undefined,
  seed: string | undefined,
): void {
  if (!exerciceId || !seed || !isLocalStorageAvailable()) return
  try {
    window.localStorage.setItem(storageKey(exerciceId, seed), '1')
  } catch {
    // quota dépassé ou navigation privée stricte : on renonce silencieusement
  }
}

/**
 * Indique si la correction de cet énoncé doit rester inaccessible parce qu'il a
 * déjà été affiché à l'élève via un lien sans correction visible.
 */
export function isSeedBlockedForCorrection(
  exerciceId: string | undefined,
  seed: string | undefined,
): boolean {
  if (!exerciceId || !seed || !isLocalStorageAvailable()) return false
  try {
    return window.localStorage.getItem(storageKey(exerciceId, seed)) !== null
  } catch {
    return false
  }
}

/**
 * Tire une graine (via `generateSeed`) qui n'a pas déjà été servie à l'élève
 * sans correction. Au bout de 20 tentatives infructueuses, on renvoie la
 * dernière graine tirée pour ne pas boucler indéfiniment.
 */
export function pickSeedNotServedWithoutCorrection(
  exerciceId: string | undefined,
  generateSeed: () => string,
): string {
  let seed = generateSeed()
  for (let i = 0; i < 20 && isSeedBlockedForCorrection(exerciceId, seed); i++) {
    seed = generateSeed()
  }
  return seed
}
