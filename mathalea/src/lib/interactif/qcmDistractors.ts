import type ExerciceSimple from '../../exercices/ExerciceSimple'
import FractionEtendue from '../../modules/FractionEtendue'
import { shuffle } from '../outils/arrayOutils'
import { isAnswerValueType, type AnswerValueType, type Valeur } from '../types'

export function getDistracteurs(
  exerciceSimple: ExerciceSimple,
): (string | number)[] {
  const distracteursUniques = [...new Set(exerciceSimple.distracteurs)]
  const distracteursNonSolutions = distracteursUniques.filter((distracteur) => {
    const reponse: AnswerValueType | Valeur | undefined = exerciceSimple.reponse
    if (reponse == null) {
      return true // Si pas de réponse, on garde tous les distracteurs
    }
    let value: AnswerValueType | undefined
    if (isAnswerValueType(reponse)) {
      value = reponse
    } else {
      // Si reponse n'est pas un AnswerValueType, alors c'est un Valeur dont on va récupérer le AnswerValueType
      const reponseReponse = reponse.reponse
      if (reponseReponse !== undefined) value = reponseReponse.value
    }
    if (value === undefined) {
      // Si pas de valeur, on garde tous les distracteurs
      return true
    }
    if (Array.isArray(value)) {
      return !value.some((v) => {
        if (v instanceof FractionEtendue) {
          return v.texFraction !== distracteur.toString()
        }
        return distracteur.toString() !== v.toString()
      })
    }
    if (value instanceof FractionEtendue) {
      return value.texFraction !== distracteur.toString()
    }
    return distracteur.toString() !== value.toString()
  })
  return shuffle(distracteursNonSolutions).slice(0, 3)
}

/**
 * Distracteurs d'un QCM sans doublon : aucun ne vaut la bonne réponse ni un autre distracteur,
 * les espaces, `\\,`, `~` et `$` étant ignorés (`2 \\,\\%` et `2\\,\\%` sont la même proposition).
 *
 * Les candidats gardent leur ordre et ne sont retirés que s'ils sont en double : un tirage
 * sans doublon donne donc exactement la même liste qu'avant. Si moins de `max` distracteurs
 * restent, la liste est complétée avec `secours`, sans tirage aléatoire supplémentaire.
 * @param reponse la bonne réponse, telle qu'elle est donnée au QCM
 * @param candidats les distracteurs prévus, dans l'ordre
 * @param secours distracteurs de remplacement, utilisés seulement s'il en manque
 * @param max nombre maximal de distracteurs rendus (3 par défaut)
 */
export function distracteursDistincts(
  reponse: string | number,
  candidats: (string | number)[],
  secours: (string | number)[] = [],
  max = 3,
): string[] {
  const forme = (texte: string | number) =>
    String(texte).replace(/\\,|\\ |\\!|~|\$|\s+/g, '')
  const vus = new Set<string>([forme(reponse)])
  const retenus: string[] = []
  for (const candidat of candidats) {
    if (!vus.has(forme(candidat))) {
      vus.add(forme(candidat))
      retenus.push(String(candidat))
    }
  }
  for (const candidat of secours) {
    if (retenus.length >= Math.min(max, 3)) break
    if (!vus.has(forme(candidat))) {
      vus.add(forme(candidat))
      retenus.push(String(candidat))
    }
  }
  return retenus.slice(0, max)
}
