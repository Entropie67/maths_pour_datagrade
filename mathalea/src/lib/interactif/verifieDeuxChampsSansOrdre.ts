import type { MathfieldElement } from 'mathlive'
import { fonctionComparaison } from './comparisonFunctions'

/**
 * `callback` de `handleAnswers()` pour un champ à trous `%{champ1}` / `%{champ2}`
 * dont les deux réponses peuvent être saisies dans n'importe quel ordre
 * (par exemple les deux solutions d'une équation).
 *
 * Chaque réponse attendue ne peut être associée qu'à un seul champ : saisir deux
 * fois la même solution ne donne pas le point. La question vaut toujours un point.
 *
 * @example
 * handleAnswers(this, i, {
 *   champ1: { value: s1 },
 *   champ2: { value: s2 },
 *   callback: verifieDeuxChampsSansOrdre([s1, s2]),
 * }, { formatInteractif: 'fill-in-the-blank' })
 */
export function verifieDeuxChampsSansOrdre(attendues: [string, string]) {
  return (exercice: { numeroExercice?: number }, question: number) => {
    const mfe = document.querySelector(
      `#champTexteEx${exercice.numeroExercice}Q${question}`,
    ) as MathfieldElement | null
    if (mfe == null) {
      return {
        isOk: false,
        feedback: '',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    const champs = ['champ1', 'champ2']
    const saisies = champs.map((champ) => mfe.getPromptValue(champ))
    const correspond = (saisie: string, attendue: string) =>
      saisie !== '' && fonctionComparaison(saisie, attendue).isOk
    const ordreDirect = saisies.map((saisie, k) =>
      correspond(saisie, attendues[k]),
    )
    const ordreInverse = saisies.map((saisie, k) =>
      correspond(saisie, attendues[1 - k]),
    )
    const compte = (liste: boolean[]) => liste.filter(Boolean).length
    const meilleur =
      compte(ordreInverse) > compte(ordreDirect) ? ordreInverse : ordreDirect
    champs.forEach((champ, k) => {
      mfe.setPromptState(champ, meilleur[k] ? 'correct' : 'incorrect', true)
    })
    mfe.classList.add('corrected')
    const isOk = compte(meilleur) === champs.length
    const spanReponseLigne = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
    )
    if (spanReponseLigne != null) {
      spanReponseLigne.innerHTML = isOk ? '😎' : '☹️'
    }
    return {
      isOk,
      feedback: '',
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }
}
