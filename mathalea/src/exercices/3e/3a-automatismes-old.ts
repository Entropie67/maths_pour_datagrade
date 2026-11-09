// Version publiée figée avant la modification du catalogue d'automatismes.
// Les liens avec l'uuid c6be6 conservent leurs sous-exercices et leurs tirages.
import { getExerciseModuleLoader } from '../../lib/exerciseLoader'
import catalogue from '../../lib/automatismesCatalogues/3a-old.json'
import {
  createAutomatismesCanExercice,
  type ExerciceModule,
} from '../_automatismesCan'

export const titre = "Sélection d'automatismes"
export const interactifReady = true

export const uuid = 'c6be6'
export const refs = { 'fr-fr': [], 'fr-ch': ['NR'] }
export const dateDePublication = '08/05/2026'

// Références de 80af0fc1f4, avant l'archivage des QCM dans 8825e26641.
const allModules: Record<string, () => Promise<ExerciceModule>> = {}
for (const [ref, url] of Object.entries(catalogue)) {
  const loader = getExerciseModuleLoader(`../exercices/${url}`)
  if (!loader) throw new Error(`Module historique introuvable : ${url}`)
  allModules[ref] = loader
}

export default createAutomatismesCanExercice({
  modules: allModules,
  refRegex: /^3Auto([GIMNPLS])/,
  categories: ['G', 'I', 'M', 'N', 'P', 'L', 'S'],
  categoriesForm: {
    titre: 'Nombre de questions par catégorie',
    categories: [
      { label: 'Espace et géométrie :', max: 12 },
      { label: 'Algorithmique et programmation:', max: 12 },
      { label: 'Mesure :', max: 12 },
      { label: 'Nombres et calculs :', max: 12 },
      { label: 'Statistiques :', max: 12 },
      { label: 'Calcul littéral :', max: 12 },
      { label: 'Proportionnalité et fonctions :', max: 12 },
    ],
    defaut: [2, 1, 1, 2, 2, 1, 1],
  },
  defaultSup: '2-1-1-2-2-1-1',
})
