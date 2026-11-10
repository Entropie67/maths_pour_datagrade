import {
  createAutomatismesCanExercice,
  type ExerciceModule,
} from '../_automatismesCan'

export const titre = "Sélection d'automatismes"
export const interactifReady = true

export const dateDeModifImportante = '29/09/2026'
export const uuid = 'ce2ea'
export const refs = { 'fr-fr': ['1A'], 'fr-ch': ['NR'] }
export const dateDePublication = '30/04/2026'

/**
 * @author Rémi Angot
 */

// Chargement lazy : les versions archivées ne participent pas au tirage.
const allModules = import.meta.glob([
  './1A-*.ts',
  '!./1A-*[oO][lL][dD]*.ts',
]) as Record<string, () => Promise<ExerciceModule>>

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
