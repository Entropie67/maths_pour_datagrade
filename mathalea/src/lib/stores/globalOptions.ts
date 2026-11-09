import { writable } from 'svelte/store'
import type { InterfaceGlobalOptions } from '../types'

/**
 * * `v`: vue
 * * `z`: zoom
 * * `title` : titre pour la vue élève uniquement
 * * `presMode` : type d'affichage pour la vue eleve uniquement (page, exos, liste, questions)
 * * `setInteractive` : uniquement pour la vue eleve (0 : pas d'interactivité, 1 : tout interactif, 2 : au choix exercice par exercice)
 * * `calculatricesForcees` : uniquement pour la vue eleve (`-` : selon le réglage `calc` de chaque exercice, sinon 0 / 1 / 2 / 3 / 9 imposé à tous les exercices)
 * * `isSolutionAccessible` : uniquement pour la vue eleve, pour savoir si les corrections sont disponibles ou pas
 * * `isCorrectionOnlyOnError` : uniquement pour la vue eleve, pour n'afficher la correction que sous les questions dont la réponse est fausse (sous les bonnes réponses, seul le smiley est affiché)
 * * `isCheckPerQuestion` : uniquement pour la vue eleve, pour que chaque question d'un exercice interactif ait son propre bouton « Vérifier » (retour immédiat question par question) au lieu d'un seul bouton pour tout l'exercice ; hors interactivité, dévoiler la correction par question ou sous-question
 * * `isInteractiveFree` : uniquement pour la vue eleve, pour savoir si l'élève peut changer l'interactivité ou pas
 * * `oneShot` : uniquement pour la vue eleve, pour savoir si l'élève peut répondre une ou plusieurs fois en interactif.
 * * `cor` : uniquement en local (`localhost`), affiche l'énoncé et la correction de tous les exercices pour faciliter la relecture (paramètre d'URL `cor`)
 * * `twoColumns` : dans les vues élèves avec tous les exercices/questions sur une même page, on adopte la présentation du texte sur deux colonnes
 *
 * `globalOptions` est utilisé dans `Mathalea.updateUrl()` et dans `Mathalea.loadExercicesFromUrl()`
 * Il permet de sauvegarder le type de vue (`v=...`)
 *
 * Le paramètre `es` est utilisé pour renseigner les réglages de la vue élève :
 * une unique chaîne de caractères contient dans l'ordre : titre + mode présentation + interactivité +  accès solutions + affichage deux colonnes
 */

export const globalOptions = writable<InterfaceGlobalOptions>({
  v: undefined,
  z: '1',
  title: 'Évaluation',
  presMode: 'liste_exos',
  setInteractive: '2',
  calculatricesForcees: '-',
  isSolutionAccessible: true,
  isCorrectionOnlyOnError: false,
  isCheckPerQuestion: false,
  isInteractiveFree: true,
  isTitleDisplayed: true,
  isReferenceDisplayed: true,
  oneShot: false,
  twoColumns: false,
  beta: false,
  cor: false,
  lang: 'fr-FR',
})
