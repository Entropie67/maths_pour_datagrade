/**
 * Styles communs des commandes de la vue TBI. Cibles de 48 px minimum, pensées
 * pour le doigt sur un tableau : le neutre au repos, le bleu pour l'état actif,
 * un seul orange pour l'action principale. L'orange reste ainsi réservé aux
 * réponses dans les corrections.
 */

const base =
  'inline-flex items-center justify-center gap-2 h-12 min-w-12 shrink-0 rounded-xl font-semibold whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-default'

const neutral =
  'text-coopmaths-corpus dark:text-coopmathsdark-corpus hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'

const active =
  'bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas'

/**
 * Bouton de commande, avec libellé ou icône seule. Une taille de texte passée
 * dans `extra` remplace celle par défaut : deux classes de taille sur un même
 * élément se départageraient selon leur ordre dans la feuille de style.
 */
export function tbiButton(isActive = false, extra = 'px-3'): string {
  const size = /(^|\s)text-(xs|sm|base|lg|\d?xl)(\s|$)/.test(extra)
    ? ''
    : 'text-lg'
  return `${base} ${size} ${extra} ${isActive ? active : neutral}`
}

/** Action principale : une seule à la fois à l'écran */
export const tbiPrimaryButton = `${base} text-lg px-4 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas hover:brightness-95`

/** Bouton d'un choix segmenté (colonnes, thème…) */
export function tbiSegmentButton(isActive: boolean): string {
  return `inline-flex items-center justify-center h-12 min-w-12 px-3 rounded-lg text-lg font-bold whitespace-nowrap transition-colors ${
    isActive ? active : neutral
  }`
}

/** Conteneur d'un choix segmenté */
export const tbiSegment =
  'inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'

/** Séparateur entre deux groupes de commandes */
export const tbiSeparator =
  'w-px h-8 mx-1 shrink-0 bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest'

/** Panneau ouvert depuis une commande */
export const tbiPanel =
  'rounded-2xl border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas shadow-2xl text-coopmaths-corpus dark:text-coopmathsdark-corpus'

/** Ligne d'un menu */
export const tbiMenuRow =
  'flex flex-row items-center justify-between gap-3 w-full min-h-12 px-3 rounded-lg text-left text-lg font-semibold hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark'

/** Titre d'un groupe de lignes de menu */
export const tbiMenuLabel =
  'px-3 pt-2 pb-1 text-sm font-semibold text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light'
