import type { ExerciseModule } from './exerciseModules'

// Object.keys(import.meta.glob(...)) est remplacé par Vite par la seule liste
// des chemins : ce module n'importe donc pas tout le catalogue d'exercices.
const modulePaths = new Set(
  Object.keys(
    import.meta.glob([
      '../exercices/*/*.{ts,js}',
      '../exercices/can/**/*.{ts,js}',
      '../exercices/ch/**/*.{ts,js}',
      '../exercices/QCMBrevet/*/*.{ts,js}',
      '../exercices/QCMBac/*/*.{ts,js}',
      '!../exercices/**/*.test.{ts,js}',
    ]),
  ),
)

export function getExerciseModuleLoader(
  path: string,
): (() => Promise<ExerciseModule>) | undefined {
  if (!modulePaths.has(path)) return undefined
  return async () => {
    const { loadExerciseModule } = await import('./exerciseModules')
    return loadExerciseModule(path)
  }
}
