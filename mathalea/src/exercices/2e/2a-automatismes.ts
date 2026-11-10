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

export const uuid = '2a1c7'
export const refs = { 'fr-fr': ['2A'], 'fr-ch': [] }
export const dateDePublication = '30/08/2026'

/**
 * @author Rémi Angot
 */

// Chargement lazy : seuls les modules sélectionnés sont téléchargés.
// Les automatismes de seconde sont recensés par référence dans le référentiel,
// mais la plupart des références 2A-... pointent vers des exercices partagés
// avec la première (fichiers `1e/1A-*.ts`). On indexe donc les modules par
// référence, puis on résout le fichier réel via les tables générées
// ref -> uuid -> url.
// La catégorie « A » (2A-A01-… : sujets d'annales complets) est volontairement
// exclue : ce sont des sujets entiers, pas des automatismes isolés.
const allModules: Record<string, () => Promise<ExerciceModule>> = {}
for (const [ref, uuid] of Object.entries(refToUuid)) {
  if (!/^2A-[NCEFGPRS]/.test(ref)) continue
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
  refRegex: /^2A-([NCEFGPRS])/,
  categories: ['N', 'C', 'E', 'F', 'G', 'P', 'R', 'S'],
  categoriesForm: {
    titre: 'Nombre de questions par catégorie',
    categories: [
      { label: 'Nombres et calculs :', max: 12 },
      { label: 'Calcul littéral :', max: 12 },
      { label: 'Évolutions :', max: 12 },
      { label: 'Fonctions :', max: 12 },
      { label: 'Géométrie et repérage :', max: 12 },
      { label: 'Probabilités :', max: 12 },
      { label: 'Proportions et pourcentages :', max: 12 },
      { label: 'Statistiques :', max: 12 },
    ],
    defaut: [2, 2, 1, 1, 1, 1, 1, 1],
  },
  // Une valeur par catégorie, alignée sur `categoriesForm.defaut`
  defaultSup: '2-2-1-1-1-1-1-1',
})
