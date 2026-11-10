import type Figure from 'apigeom'

/**
 * JSON d'une figure ApiGeom destiné à être stocké comme réponse d'élève.
 *
 * On retire l'indentation et les options d'interface, mais on conserve les
 * valeurs par défaut utilisées pour alléger les éléments dans `figure.json`.
 * L'élève peut modifier ces valeurs (couleur, épaisseur…) dans la palette :
 * sans elles, `loadJson()` changerait l'apparence de sa construction.
 *
 * Ce poids est critique pour les LMS : SCORM 1.2 plafonne `cmi.suspend_data` à
 * 4 096 caractères, ce qu'une figure atteignait à elle seule.
 */
export function figureAnswerJson(figure: Figure): string {
  const { options, ...figureWithoutOptions } = JSON.parse(figure.json)
  // Suivre les options référencées par createFilter() dans ApiGeom/Figure.ts.
  const savedDefaults = Object.fromEntries(
    [
      'color',
      'fillOpacity',
      'isDashed',
      'labelDxInPixels',
      'labelDyInPixels',
      'labelIsVisible',
      'pointSize',
      'thickness',
    ].map((key) => [key, options[key]]),
  )
  return JSON.stringify({ ...figureWithoutOptions, options: savedDefaults })
}
