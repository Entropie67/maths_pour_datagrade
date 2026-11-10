import { getExerciseModuleLoader } from '../../lib/exerciseLoader'
import exercices from '../../json/exercicesFR.json'
import refToUuid from '../../json/refToUuidFR.json'
import uuidToUrl from '../../json/uuidsToUrlFR.json'
import {
  createAutomatismesCanExercice,
  type ExerciceModule,
} from '../_automatismesCan'

export const titre = "Sélection d'automatismes"
export const interactifReady = true

export const dateDeModifImportante = '29/09/2026'
export const uuid = 'a531a'
export const refs = { 'fr-fr': ['3Auto'], 'fr-ch': [] }
export const dateDePublication = '08/05/2026'

/**
 * @author Rémi Angot
 */

// Chargement lazy : seuls les modules sélectionnés sont téléchargés.
// Les automatismes de 3e sont recensés par référence dans le référentiel, mais
// certaines références 3Auto... pointent vers des exercices dont le fichier ne
// s'appelle pas 3Auto*.ts. On indexe donc les modules par référence, puis on
// résout le fichier réel via les tables générées ref -> uuid -> url.
const allModules: Record<string, () => Promise<ExerciceModule>> = {}
for (const [ref, uuid] of Object.entries(refToUuid)) {
  if (!/^3Auto[GIMNPLS]/.test(ref)) continue
  const metadata = (
    exercices as Record<
      string,
      { features?: { interactif?: { isActive?: boolean; type?: string } } }
    >
  )[ref]
  if (metadata?.features?.interactif?.isActive !== true) continue
  if (metadata.features.interactif.type === "'custom'") continue

  const url = (uuidToUrl as Record<string, string>)[uuid]
  if (!url || /[^/]*old[^/]*\.ts$/i.test(url)) continue

  const loader = getExerciseModuleLoader(`../exercices/${url}`)
  if (loader) allModules[ref] = loader
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
