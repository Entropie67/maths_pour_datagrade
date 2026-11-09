/**
 * Styles partagés par les sélecteurs affichés dans un énoncé
 * (`QuestionsDeCoursSelecteur`, `SerieAleatoireSelecteur`,
 * `ConstructionTriangleSelecteur`).
 *
 * Ils sont repris des formulaires de réglages
 * (`presentationalComponents/FormulaireComplexe.svelte`) pour que ces
 * sélecteurs ne détonnent pas dans le reste du site, en thème clair comme en
 * thème sombre.
 */

export const STYLE_CHAMP =
  'px-2 py-1 h-10 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark ' +
  'text-coopmaths-corpus dark:text-coopmathsdark-corpus ' +
  'border border-coopmaths-action dark:border-coopmathsdark-action ' +
  'focus:outline-0 focus:ring-0'

/** `pr-10` laisse la place à la flèche, qui sinon recouvre le libellé. */
export const STYLE_SELECT = `${STYLE_CHAMP} pr-10 max-w-full`

export const STYLE_CASE =
  'w-4 h-4 rounded shrink-0 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark ' +
  'border-coopmaths-action dark:border-coopmathsdark-action cursor-pointer ' +
  'checked:bg-coopmaths-action dark:checked:bg-coopmathsdark-action ' +
  'focus:ring-3 focus:ring-coopmaths-action dark:focus:ring-coopmathsdark-action'

export const STYLE_BOUTON_TEXTE =
  'text-coopmaths-action hover:text-coopmaths-action-darkest ' +
  'dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-darkest underline'

/**
 * Variante sans fond de couleur, reprise de `SelectUnique.svelte` (réglé sans
 * `darkBackground`) : pour un sélecteur posé directement sur l'énoncé. Les
 * tailles sont en `em` pour suivre le zoom de l'exercice.
 */
export const STYLE_SELECT_SANS_FOND =
  'text-[1em] leading-normal h-[2.85em] w-auto max-w-full pl-[0.6em] pr-[2.85em] py-0 ' +
  'bg-coopmaths-canvas dark:bg-coopmathsdark-canvas ' +
  'text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-dark ' +
  'border border-coopmaths-action dark:border-coopmathsdark-action ' +
  'focus:outline-0 focus:ring-0 ' +
  'focus:border-coopmaths-action-lightest dark:focus:border-coopmathsdark-action-lightest'

/**
 * Champ sans cadre, posé sur une figure : seul un léger fond au survol et à
 * la saisie signale qu'il est modifiable.
 */
export const STYLE_CHAMP_DISCRET =
  'text-[1em] leading-normal h-[1.9em] px-[0.2em] py-0 text-center rounded border-0 bg-transparent ' +
  'text-coopmaths-corpus dark:text-coopmathsdark-corpus ' +
  'hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark ' +
  'focus:bg-coopmaths-canvas-dark dark:focus:bg-coopmathsdark-canvas-dark ' +
  'focus:outline-0 focus:ring-0 cursor-text'
