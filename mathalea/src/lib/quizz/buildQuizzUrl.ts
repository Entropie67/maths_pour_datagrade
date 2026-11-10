import { createURL } from '../createURL'
import type { InterfaceParams } from '../types'
import type { QuizzParams } from '../../modules/quizz/types'
import { encodeQuizzParams } from './quizzParams'

/**
 * Construit le lien de partage du quizz :
 * la sélection d'exercices courante + `v=quizz` + `subject` + `quizzParam`.
 *
 * Règle des graines (`seedMode`) :
 * - 'fixed'  : les graines `alea` présentes dans exercicesParams sont
 *              conservées — le lien reproduit exactement le même quizz ;
 * - 'random' : les graines sont retirées du lien — chaque ouverture génère
 *              un tirage différent (une version par élève).
 */
export function buildQuizzUrl(
  exercices: InterfaceParams[],
  subject: string,
  quizzParams: QuizzParams,
): URL {
  const params =
    quizzParams.seedMode === 'random'
      ? exercices.map((ex) => ({ ...ex, alea: undefined }))
      : exercices
  const url = createURL(params)
  url.searchParams.append('v', 'quizz')
  if (subject.length > 0) {
    url.searchParams.append('subject', subject)
  }
  url.searchParams.append('quizzParam', encodeQuizzParams(quizzParams))
  return url
}

/**
 * Construit le lien de jointure d'une partie multi-joueurs (à afficher dans
 * le lobby, sous forme de QR-code) : la vue quizz en rôle joueur avec le PIN
 * de la room. La partie elle-même vit sur le serveur temps réel : le lien ne
 * transporte ni exercices ni réglages.
 */
export function buildQuizzJoinUrl(pin: string): URL {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.append('v', 'quizz')
  url.searchParams.append('quizzRole', 'player')
  url.searchParams.append('pin', pin)
  return url
}
