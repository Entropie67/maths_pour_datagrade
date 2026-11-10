import type Exercice from '../exercices/Exercice'

export type ExerciseModule = {
  default: new () => Exercice
  titre?: string
  amcReady?: boolean
  amcType?: string
  interactifReady?: boolean
}

// Ce registre doit être importé dynamiquement : les helpers des exercices
// utilisent aussi mathalea.ts. Un import statique rattacherait chaque exercice
// au catalogue complet lors de l'analyse du graphe par Rollup.
const modules = import.meta.glob<ExerciseModule>([
  '../exercices/*/*.{ts,js}',
  '../exercices/can/**/*.{ts,js}',
  '../exercices/ch/**/*.{ts,js}',
  '../exercices/QCMBrevet/*/*.{ts,js}',
  '../exercices/QCMBac/*/*.{ts,js}',
  '!../exercices/**/*.test.{ts,js}',
])

export async function loadExerciseModule(
  path: string,
): Promise<ExerciseModule> {
  const loader = modules[path]
  if (!loader) throw new Error(`Module "${path}" introuvable`)
  return loader()
}
