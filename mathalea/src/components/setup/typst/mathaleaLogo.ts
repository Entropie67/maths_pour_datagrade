/**
 * Logo « Course aux nombres » (chronomètre + dé) de la page de garde du
 * même nom, repris de `public/images/logoCan.png`.
 *
 * Contrairement au précédent logo « dé » (SVG, embarqué en littéral Typst
 * via `bytes()`), ce PNG n'est pas embarqué en base64 dans le code généré :
 * Typst n'a pas de décodeur base64 natif, et une image de cette taille
 * alourdirait chaque document de ~200 ko de texte. Il est référencé par
 * chemin virtuel (`LOGO_CAN_VIRTUAL_PATH`), chargé dans le système de
 * fichiers du compilateur pour l'aperçu (voir `prefetchStaticImages` dans
 * `Typst.svelte`, même mécanisme que les images d'exercices statiques) et
 * ajouté au `.zip` téléchargé aux côtés du `.typ` (voir `downloadTyp`) :
 * le fichier `.typ` seul ne suffit plus à compiler hors de l'appli, mais le
 * zip, lui, reste autonome.
 */

/** Chemin (relatif à `BASE_URL`) du PNG source, pour le récupérer par fetch. */
// Incrémenter la version quand le fichier change pour invalider le cache persistant.
export const LOGO_CAN_URL = 'images/logoCan.png?v=2'

/**
 * Chemin virtuel sous lequel le PNG est mappé dans le compilateur Typst
 * (et sous lequel il est rangé dans le `.zip` téléchargé) : référencé tel
 * quel par l'appel `image(...)` du code généré (voir `MATHALEA_LOGO_IMAGE`
 * dans `buildTypstDocument.ts`).
 */
export const LOGO_CAN_VIRTUAL_PATH = '/images/logoCan.png'
