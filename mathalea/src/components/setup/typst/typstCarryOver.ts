import type { TypstCarryOver } from './buildTypstDocument'

/**
 * Échange les réglages de la palette (colonnes/espacement des questions,
 * insertions) entre les exercices `numA` et `numB` : ce que le professeur
 * avait réglé « pour cet exercice » le suit quand il change de position.
 */
export function swapCarryOver(
  carryOver: TypstCarryOver,
  numA: number,
  numB: number,
): TypstCarryOver {
  const swapNum = (n: number) => (n === numA ? numB : n === numB ? numA : n)
  const tasksLayout: NonNullable<typeof carryOver.tasksLayout> = {}
  for (const [prefix, layout] of Object.entries(carryOver.tasksLayout ?? {})) {
    const match = prefix.match(/^ex(\d+)((?:-corr)?(?:-qcm)?)$/)
    if (match == null) continue
    tasksLayout[`ex${swapNum(Number(match[1]))}${match[2] ?? ''}`] = layout
  }
  const insertions: NonNullable<typeof carryOver.insertions> = {}
  for (const [key, lines] of Object.entries(carryOver.insertions ?? {})) {
    // le repère de gap `g` précède l'exercice `g + 1`
    const newGap = swapNum(Number(key) + 1) - 1
    insertions[newGap] = [...(insertions[newGap] ?? []), ...lines]
  }
  const merges = (carryOver.merges ?? []).map(swapNum)
  const codeOverrides: NonNullable<typeof carryOver.codeOverrides> = {}
  for (const [key, value] of Object.entries(carryOver.codeOverrides ?? {})) {
    codeOverrides[swapNum(Number(key))] = value
  }
  const codeOverridesCorrection: NonNullable<
    typeof carryOver.codeOverridesCorrection
  > = {}
  for (const [key, value] of Object.entries(
    carryOver.codeOverridesCorrection ?? {},
  )) {
    codeOverridesCorrection[swapNum(Number(key))] = value
  }
  const insertionsCorrection: NonNullable<
    typeof carryOver.insertionsCorrection
  > = {}
  for (const [key, value] of Object.entries(
    carryOver.insertionsCorrection ?? {},
  )) {
    insertionsCorrection[swapNum(Number(key))] = value
  }
  const writingLines: NonNullable<typeof carryOver.writingLines> = {}
  for (const [key, value] of Object.entries(carryOver.writingLines ?? {})) {
    writingLines[swapNum(Number(key))] = value
  }
  const exerciseTitles: NonNullable<typeof carryOver.exerciseTitles> = {}
  for (const [key, value] of Object.entries(carryOver.exerciseTitles ?? {})) {
    exerciseTitles[swapNum(Number(key))] = value
  }
  const exerciseZoom: NonNullable<typeof carryOver.exerciseZoom> = {}
  for (const [key, value] of Object.entries(carryOver.exerciseZoom ?? {})) {
    exerciseZoom[swapNum(Number(key))] = value
  }
  const exerciseCorrectionZoom: NonNullable<
    typeof carryOver.exerciseCorrectionZoom
  > = {}
  for (const [key, value] of Object.entries(
    carryOver.exerciseCorrectionZoom ?? {},
  )) {
    exerciseCorrectionZoom[swapNum(Number(key))] = value
  }
  return {
    ...carryOver,
    versions:
      carryOver.versions == null
        ? undefined
        : Object.fromEntries(
            Object.entries(carryOver.versions).map(([version, carry]) => [
              version,
              swapCarryOver(carry, numA, numB),
            ]),
          ),
    tasksLayout,
    insertions,
    insertionsCorrection,
    merges,
    workedExamples: (carryOver.workedExamples ?? []).map(swapNum),
    codeOverrides,
    codeOverridesCorrection,
    // surcharges de ligne « Course aux nombres » : voir le même
    // commentaire dans `shiftCarryOver` (pas renumérotées, conservées
    // telles quelles).
    codeOverridesCan: carryOver.codeOverridesCan ?? {},
    codeOverridesCanReponse: carryOver.codeOverridesCanReponse ?? {},
    writingLines,
    exerciseZoom,
    exerciseCorrectionZoom,
    exerciseTitles,
    imageCuts: Object.fromEntries(
      Object.entries(carryOver.imageCuts ?? {}).map(([key, value]) => [
        swapNum(Number(key)),
        value,
      ]),
    ),
  }
}
