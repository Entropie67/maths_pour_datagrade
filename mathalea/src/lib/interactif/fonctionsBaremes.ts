/*
 * @author Jean-Claude Lhote
 * Ce fichier centralise les fonctions de barèmes pour les exercices interactifs.
 * Il est important de ne pas faire n'importe quoi avec ces fonctions,
 * car elles sont utilisées dans de nombreux exercices et une modification peut avoir des conséquences inattendues.
 * Il est donc recommandé de ne pas toucher à ce fichier sans une bonne raison et de bien comprendre le fonctionnement de chaque fonction avant de la modifier.
 */

// Un barème qui ne met qu'un point si tout est juste
export function toutPourUnPoint(listePoints: number[]): [number, number] {
  return [Math.min(...listePoints), 1]
}
// le barème par défaut un point pour chaque réponse
export function toutAUnPoint(listePoints: number[]) {
  return [
    listePoints.reduce((prev, current) => prev + current),
    listePoints.length,
  ] as [number, number]
}
// Un barème qui met un point à partir du moment où il y a une bonne réponse, même s'il y en a d'autres de fausses
export function maxDesPoints(listePoints: number[]) {
  return [Math.max(...listePoints), 1] as [number, number]
}
// C'est la même chose que toutPourUnPoint, mais c'est moins ambigu avec ce nom.
export function pointSiToutJuste(listePoints: number[]) {
  return toutPourUnPoint(listePoints)
}
// Une erreur emporte tout... Pas très pédagogique !
export function minDesPoints(listePoints: number[]) {
  return [Math.min(...listePoints), 1] as [number, number]
}
// La proportion de cases justes, ramenée sur 3 points et arrondie à l'entier le plus proche
export function troisPointsProportionnels(
  listePoints: number[],
): [number, number] {
  const nbCasesJustes = listePoints.reduce((total, point) => total + point, 0)
  return [Math.round((nbCasesJustes / listePoints.length) * 3), 3]
}
