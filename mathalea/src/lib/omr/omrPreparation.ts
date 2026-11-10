import seedrandom from 'seedrandom'
import { context } from '../../modules/context'
import { mathaleaEnsureAMCCompatibility } from '../amc/amcInference'
import { mathaleaHandleExerciceSimple } from '../mathalea'
import type { IExercice } from '../types'

/**
 * Génération des exercices avant conversion en questions à cases.
 *
 * `getExercisesFromExercicesParams()` charge les exercices et leur applique
 * leurs paramètres, mais ne les *génère* pas : `listeQuestions` et
 * `autoCorrection` restent vides. Or c'est `autoCorrection` qui porte la
 * structure des réponses — propositions d'un QCM, valeur numérique attendue —
 * dont la lecture optique a besoin. Il faut donc déclencher une passe de
 * génération, et une passe **interactive** : c'est `handleAnswers`, appelé
 * seulement quand `interactif` est vrai, qui remplit `autoCorrection`.
 *
 * Cette structure interactive ne dit pourtant pas quel *type* de question AMC
 * elle décrit : une réponse à un champ y ressemble à une réponse à trois, et
 * rien n'y distingue une valeur numérique d'une rédaction. C'est
 * `mathaleaEnsureAMCCompatibility` qui tranche, exactement comme pour la vue
 * AMC, et qui range le résultat dans `autoCorrectionAMC`. On la fait tourner
 * ici, sur les énoncés HTML : l'inférence lit `autoCorrection` et
 * `listeQuestions`, elle n'a pas besoin de la passe LaTeX d'AMC — dont les
 * énoncés seraient de toute façon inutilisables pour Typst.
 *
 * La passe modifie l'état global (`context`, générateur aléatoire) : ce module
 * l'isole et restaure ce qu'il a changé, pour ne pas laisser le reste de
 * MathALÉA dans un contexte inattendu.
 */

/** Ce que l'exercice déclarait avant toute inférence, pour pouvoir y revenir. */
const declarationsAmc = new WeakMap<
  object,
  { amcType?: string; amcReady?: boolean }
>()

/**
 * Génère un exercice en contexte interactif, puis restaure le contexte.
 *
 * @param seedOverride graine à utiliser pour cette génération, à la place de
 *   celle de l'exercice. Sert à produire une version différente par élève ;
 *   la graine d'origine est restaurée ensuite, l'exercice n'étant pas censé
 *   garder trace de ce détournement.
 */
export function preparerExercice(
  exercice: IExercice,
  seedOverride?: string,
): void {
  const ex = exercice as IExercice & {
    versionQcm?: boolean
    versionQcmDisponible?: boolean
    lastCallback?: string
    nouvelleVersionWrapper?: () => void
  }
  const interactifInitial = exercice.interactif
  const isHtmlInitial = context.isHtml
  const isAmcInitial = context.isAmc
  const seedInitial = exercice.seed
  const versionQcmInitiale = ex.versionQcm
  // Plusieurs exercices classiques exposent ce choix via un paramètre de
  // formulaire plutôt que via versionQcmDisponible.
  const parametres = exercice as unknown as Record<string, unknown>
  const casesQcm = ['', '2', '3', '4', '5']
    .filter((numero) => {
      const formulaire = parametres[`besoinFormulaire${numero}CaseACocher`]
      return (
        Array.isArray(formulaire) &&
        [
          'Version QCM',
          'QCM',
          'Interactif avec QCM',
          "QCM pour l'interactif",
        ].includes(formulaire[0])
      )
    })
    .map((numero) => {
      const cle = `sup${numero}`
      return { cle, valeur: parametres[cle] }
    })
  if (!declarationsAmc.has(exercice)) {
    declarationsAmc.set(exercice, {
      amcType: exercice.amcType,
      amcReady: exercice.amcReady,
    })
  }
  const declaration = declarationsAmc.get(exercice) as {
    amcType?: string
    amcReady?: boolean
  }

  /** Une génération HTML, interactive ou non, sur la graine en place. */
  const genererEnHtml = (interactif: boolean) => {
    // `lastCallback` mémoïse la dernière génération : sans le vider, l'appel
    // suivant est ignoré et `autoCorrection` reste vide
    ex.lastCallback = ''
    exercice.interactif = interactif
    context.isHtml = true
    context.isAmc = false
    seedrandom(exercice.seed, { global: true })

    if (exercice.typeExercice === 'simple') {
      mathaleaHandleExerciceSimple(exercice, interactif)
    } else if (typeof ex.nouvelleVersionWrapper === 'function') {
      ex.nouvelleVersionWrapper()
    }
  }

  try {
    // une inférence précédente a posé son verdict sur l'exercice : le laisser
    // en place ferait relire, pour l'élève suivant, les réponses du précédent
    exercice.amcType = declaration.amcType
    exercice.amcReady = declaration.amcReady
    exercice.autoCorrectionAMC = []
    if (seedOverride != null) exercice.seed = seedOverride
    if (ex.versionQcmDisponible) ex.versionQcm = true
    for (const { cle } of casesQcm) parametres[cle] = true

    // 1. passe interactive : c'est `handleAnswers`, appelé seulement quand
    // `interactif` est vrai, qui remplit `autoCorrection`
    genererEnHtml(true)
    const interactive = (exercice.autoCorrection ?? []).map((item) => ({
      ...item,
      valeur: item?.valeur,
    }))

    // 2. passe non interactive : les énoncés de la passe précédente portent
    // les champs de saisie de l'élève, qui n'ont rien à faire sur du papier
    genererEnHtml(false)

    infererStructureAmc(exercice, interactive)
  } finally {
    exercice.interactif = interactifInitial
    context.isHtml = isHtmlInitial
    context.isAmc = isAmcInitial
    exercice.seed = seedInitial
    ex.versionQcm = versionQcmInitiale
    for (const { cle, valeur } of casesQcm) parametres[cle] = valeur
  }
}

/**
 * Déduit la structure de réponse AMC de ce que la passe interactive a produit.
 *
 * Un exercice dont l'inférence échoue n'a pas à emporter toute l'évaluation :
 * il retombe sur la reconnaissance sommaire de `omrQuestions`, ou sort du
 * document, mais les autres restent imprimables.
 */
function infererStructureAmc(
  exercice: IExercice,
  interactive: unknown[],
): void {
  const ex = exercice as IExercice & {
    interactiveAutoCorrectionForAMC?: unknown[]
  }
  try {
    // l'inférence lit ce cliché en priorité : la passe non interactive qui
    // vient de tourner ne rappelle pas toujours `handleAnswers`, et n'a donc
    // pas forcément laissé les réponses derrière elle
    ex.interactiveAutoCorrectionForAMC = interactive
    mathaleaEnsureAMCCompatibility(exercice)
  } catch (erreur) {
    window.notify?.(
      "Lecture optique : l'inférence AMC a échoué pour cet exercice",
      { exercice: exercice.uuid ?? exercice.id, erreur: String(erreur) },
    )
  }
}

/**
 * Génère une liste d'exercices.
 *
 * @param seedOverride si fourni, toutes les générations partent de cette graine
 *   au lieu de celle propre à chaque exercice (un sujet par élève)
 */
export function preparerExercices(
  exercices: readonly IExercice[],
  seedOverride?: string,
): void {
  for (const exercice of exercices) preparerExercice(exercice, seedOverride)
}
