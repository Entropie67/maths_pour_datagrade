// Version publiée figée avant la modification du catalogue d'automatismes.
// Les liens avec l'uuid 722e4 conservent leurs sous-exercices et leurs tirages.
import { getExerciseModuleLoader } from '../../lib/exerciseLoader'
import catalogue from '../../lib/automatismesCatalogues/1a-old.json'
import {
  createAutomatismesCanExercice,
  type ExerciceModule,
} from '../_automatismesCan'

export const titre = "Sélection d'automatismes"
export const interactifReady = true

export const uuid = '722e4'
export const refs = { 'fr-fr': [], 'fr-ch': ['NR'] }
export const dateDePublication = '30/04/2026'

// Références de 80af0fc1f4, avant l'archivage des QCM dans 8825e26641.
const allModules: Record<string, () => Promise<ExerciceModule>> = {}
for (const [ref, url] of Object.entries(catalogue)) {
  const loader = getExerciseModuleLoader(`../exercices/${url}`)
  if (!loader) throw new Error(`Module historique introuvable : ${url}`)
  allModules[ref] = loader
}

export default createAutomatismesCanExercice({
  modules: allModules,
  refRegex: /^1A-([CEFPRSG])/,
  categories: ['C', 'E', 'F', 'P', 'R', 'S', 'G'],
  categoriesForm: {
    titre: 'Nombre de questions par catégorie',
    categories: [
      { label: 'Calcul :', max: 12 },
      { label: 'Évolution :', max: 12 },
      { label: 'Fonctions :', max: 12 },
      { label: 'Probabilités :', max: 12 },
      { label: 'Proportions :', max: 12 },
      { label: 'Statistiques :', max: 12 },
      { label: 'Géométrie :', max: 12 },
    ],
    defaut: [2, 2, 2, 2, 2, 1, 1],
  },
  // Une valeur par catégorie, alignée sur `categoriesForm.defaut`
  defaultSup: '2-2-2-2-2-1-1',
})
