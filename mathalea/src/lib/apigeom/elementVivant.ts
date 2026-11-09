import type Figure from 'apigeom'
import Element2D from 'apigeom/src/elements/Element2D'

/**
 * Élément de `figure` qui porte le même id que `element`.
 *
 * Une figure élève est rechargée depuis son JSON (`loadJson()`) quand l'élève
 * clique sur « Annuler » ou « Rétablir », et quand Capytale recharge une copie :
 * tous ses éléments sont alors recréés, avec les mêmes id. Un élément gardé par
 * l'exercice pendant `nouvelleVersion()` est détruit (nom vide, coordonnées
 * figées) : la vérification doit lire l'élément recréé, qu'on retrouve ainsi.
 *
 * Renvoie `element` lui-même si la figure n'a pas été rechargée.
 */
export function elementVivant<T extends Element2D>(
  figure: Figure,
  element: T,
): T {
  const vivant = figure.elements.get(element.id)
  return vivant instanceof Element2D ? (vivant as T) : element
}
