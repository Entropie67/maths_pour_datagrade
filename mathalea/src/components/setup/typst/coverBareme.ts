/** Données minimales nécessaires au calcul du barème proposé d'un exercice. */
interface CoverBaremeExercise {
  listeQuestions?: unknown[]
  nbQuestions?: number
}

/**
 * Propose un point par item généré. Pendant l'ajout ou la duplication,
 * `listeQuestions` peut être encore vide : le nombre configuré prend alors
 * le relais jusqu'à la première génération de l'exercice.
 */
export function defaultCoverPoints(
  exercise: CoverBaremeExercise | null | undefined,
): number {
  const generatedCount = exercise?.listeQuestions?.length ?? 0
  if (generatedCount > 0) return generatedCount
  const configuredCount = Number(exercise?.nbQuestions)
  return Number.isFinite(configuredCount) && configuredCount > 0
    ? configuredCount
    : 1
}

/** Numéros (1-based) des membres du groupe commençant à `num`. */
function groupMembers(num: number, count: number, merges: number[]): number[] {
  const members = [num]
  while (num < count && merges.includes(num + 1)) members.push(++num)
  return members
}

/** Points affichés et proposés dans la palette : total du groupe fusionné. */
export function groupedExercisePoints(
  points: number[],
  merges: number[],
): Record<number, number> {
  return Object.fromEntries(
    points.map((_, k) => [
      k + 1,
      groupMembers(k + 1, points.length, merges).reduce(
        (sum, num) => sum + points[num - 1],
        0,
      ),
    ]),
  )
}

/**
 * Modifie le total du groupe en conservant les proportions de son barème.
 * Un groupe sans points reçoit une répartition égale. Le dernier membre
 * absorbe l'arrondi pour conserver le total demandé.
 */
export function setGroupedExercisePoints(
  points: number[],
  merges: number[],
  num: number,
  value: number,
): number[] {
  const result = [...points]
  const members = groupMembers(num, points.length, merges)
  const total = members.reduce((sum, member) => sum + points[member - 1], 0)
  let remaining = value
  for (const [index, member] of members.entries()) {
    const share =
      index === members.length - 1
        ? remaining
        : Math.min(
            remaining,
            Math.round(
              value *
                (total > 0 ? points[member - 1] / total : 1 / members.length) *
                1e10,
            ) / 1e10,
          )
    result[member - 1] = share
    remaining -= share
  }
  return result
}
