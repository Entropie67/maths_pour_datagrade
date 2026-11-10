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

export const uuid = 'c6cd6'
export const refs = { 'fr-fr': ['6A'], 'fr-ch': [] }
export const dateDePublication = '21/08/2026'

/**
 * @author Jean-Claude Lhote
 */

// Chargement lazy : seuls les modules sélectionnés sont téléchargés.
// Les automatismes de 6e sont recensés par référence dans le référentiel, mais
// certaines références 3Auto... pointent vers des exercices dont le fichier ne
// s'appelle pas 3Auto*.ts. On indexe donc les modules par référence, puis on
// résout le fichier réel via les tables générées ref -> uuid -> url.
const allModules: Record<string, () => Promise<ExerciceModule>> = {}
for (const [ref, uuid] of Object.entries(refToUuid)) {
  if (!/^6Auto[NFLATGESHP]/.test(ref)) continue
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
  refRegex: /^6Auto([NFLATGESHP])/,
  categories: ['N', 'F', 'L', 'A', 'T', 'G', 'E', 'S', 'H', 'P'], // J'ai mis H comme hasard pour Probabilités car le P était déjà pris
  categoriesForm: {
    titre: 'Nombre de questions par catégorie',
    categories: [
      { label: 'Nombres entiers et décimaux', max: 12 },
      { label: 'Fractions', max: 12 },
      { label: 'Longueurs', max: 12 },
      { label: 'Aires', max: 12 },
      { label: 'Temps', max: 12 },
      { label: 'Configurations planes', max: 12 },
      { label: 'Espace', max: 12 },
      { label: 'Gestion de données', max: 12 },
      { label: 'Probabilités', max: 12 },
      { label: 'Proportionnalité', max: 12 },
    ],
    defaut: [2, 1, 1, 2, 2, 1, 1, 1, 1, 1],
  },
  defaultSup: '1-1-1-1-1-1-1-1-1-1',
})
