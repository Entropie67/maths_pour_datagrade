import { encodeBase64 } from '../../components/setup/latex/LatexConfig'

/**
 * Exercice listé dans la vue « relecture » : exercice aléatoire du
 * référentiel ayant une date de publication et/ou de modification.
 */
export interface ExerciceARelire {
  uuid: string
  id: string
  titre: string
  datePublication?: string
  dateModification?: string
}

/** Une vue dans laquelle ouvrir l'exercice pour le relire */
export interface VueDeRelecture {
  label: string
  params: [string, string][]
}

/**
 * Réglages de la vue élève (paramètre `es`) :
 * liste des exercices | interactif | correction accessible | interactivité libre
 * | une seule tentative non | deux colonnes non | titre | référence | correction si erreur non
 */
const ES_ELEVE_INTERACTIF = '011100110'

/** Liste des vues ouvertes (dans cet ordre) pour relire un exercice */
export const VUES_DE_RELECTURE: VueDeRelecture[] = [
  { label: 'Vue prof non interactive', params: [['i', '0']] },
  {
    label: 'Vue élève interactive',
    params: [
      ['i', '1'],
      ['v', 'eleve'],
      ['es', ES_ELEVE_INTERACTIF],
    ],
  },
  { label: 'Diaporama', params: [['v', 'diaporama']] },
  {
    label: 'Course aux nombres',
    params: [
      ['v', 'can'],
      ['canI', '1'],
    ],
  },
  { label: 'TBI', params: [['v', 'tbi']] },
  { label: 'Typst', params: [['v', 'typst']] },
  {
    label: 'Typst avec correction minimale',
    params: [
      ['v', 'typst'],
      ['typstParam', encodeBase64({ options: { minimalCorrections: true } })],
    ],
  },
  { label: 'LaTeX', params: [['v', 'tex']] },
]

/** Lien vers l'exercice dans une vue de relecture */
export interface LienDeRelecture {
  label: string
  url: string
}

/**
 * Construit les liens de relecture d'un exercice pour chacune des vues
 * @param exercice l'exercice à relire
 * @param baseUrl adresse de l'application (sans paramètres)
 */
export function buildRelectureUrls(
  exercice: Pick<ExerciceARelire, 'uuid' | 'id'>,
  baseUrl: string,
): LienDeRelecture[] {
  return VUES_DE_RELECTURE.map((vue) => {
    const url = new URL(baseUrl)
    url.search = ''
    url.hash = ''
    url.searchParams.append('uuid', exercice.uuid)
    url.searchParams.append('id', exercice.id)
    for (const [key, value] of vue.params) {
      url.searchParams.append(key, value)
    }
    return { label: vue.label, url: url.toString() }
  })
}

/**
 * Convertit une date au format `JJ/MM/AAAA` en nombre comparable (AAAAMMJJ)
 * @returns 0 si la date est absente ou mal formée
 */
export function frenchDateToNumber(date: string | undefined): number {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date?.trim() ?? '')
  if (match == null) return 0
  const [, jour, mois, annee] = match
  return Number(annee) * 10000 + Number(mois) * 100 + Number(jour)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Récupère tous les exercices datés d'un référentiel (un seul exemplaire par
 * uuid, le même exercice pouvant être rangé à plusieurs endroits)
 * @param referentiel référentiel à parcourir
 */
export function collectExercicesARelire(
  referentiel: unknown,
): ExerciceARelire[] {
  const exercices = new Map<string, ExerciceARelire>()
  const traverse = (tree: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(tree)) {
      if (!isObject(value)) continue
      if (typeof value.uuid !== 'string') {
        traverse(value)
        continue
      }
      const datePublication =
        typeof value.datePublication === 'string'
          ? value.datePublication
          : undefined
      const dateModification =
        typeof value.dateModification === 'string'
          ? value.dateModification
          : undefined
      if (datePublication == null && dateModification == null) continue
      if (exercices.has(value.uuid)) continue
      exercices.set(value.uuid, {
        uuid: value.uuid,
        id: typeof value.id === 'string' ? value.id : key,
        titre: typeof value.titre === 'string' ? value.titre : '',
        datePublication,
        dateModification,
      })
    }
  }
  if (isObject(referentiel)) traverse(referentiel)
  return [...exercices.values()]
}

/**
 * Trie les exercices du plus récent au plus ancien selon la date choisie,
 * en écartant ceux qui n'ont pas cette date
 */
export function sortByDate(
  exercices: ExerciceARelire[],
  dateKey: 'datePublication' | 'dateModification',
): ExerciceARelire[] {
  return exercices
    .filter((exercice) => frenchDateToNumber(exercice[dateKey]) > 0)
    .sort(
      (a, b) =>
        frenchDateToNumber(b[dateKey]) - frenchDateToNumber(a[dateKey]) ||
        a.id.localeCompare(b.id, undefined, { numeric: true }),
    )
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/**
 * Filtre les exercices dont la référence, le titre ou l'uuid contient
 * tous les mots de la recherche (sans tenir compte de la casse ni des accents)
 */
export function filterExercices(
  exercices: ExerciceARelire[],
  search: string,
): ExerciceARelire[] {
  const words = normalize(search)
    .split(/\s+/)
    .filter((word) => word !== '')
  if (words.length === 0) return exercices
  return exercices.filter((exercice) => {
    const haystack = normalize(
      `${exercice.id} ${exercice.titre} ${exercice.uuid}`,
    )
    return words.every((word) => haystack.includes(word))
  })
}

/** Verdict du relecteur sur un exercice */
export type EtatDeRelecture = 'valide' | 'refuse'

/** Verdicts du relecteur, par uuid d'exercice */
export type EtatsDeRelecture = Record<string, EtatDeRelecture>

/** Clé localStorage du suivi de relecture */
export const RELECTURE_STORAGE_KEY = 'relectureEtats'

function isEtatDeRelecture(value: unknown): value is EtatDeRelecture {
  return value === 'valide' || value === 'refuse'
}

/**
 * Lit le suivi de relecture enregistré dans le navigateur
 * @returns un objet vide si rien n'est enregistré ou si le stockage est illisible
 */
export function loadEtatsDeRelecture(
  storage: Pick<Storage, 'getItem'> | undefined,
): EtatsDeRelecture {
  try {
    const parsed: unknown = JSON.parse(
      storage?.getItem(RELECTURE_STORAGE_KEY) ?? '{}',
    )
    if (!isObject(parsed)) return {}
    return Object.fromEntries(
      Object.entries(parsed).filter(([, etat]) => isEtatDeRelecture(etat)),
    ) as EtatsDeRelecture
  } catch {
    return {}
  }
}

/** Enregistre le suivi de relecture dans le navigateur (sans erreur si le stockage est indisponible) */
export function saveEtatsDeRelecture(
  storage: Pick<Storage, 'setItem'> | undefined,
  etats: EtatsDeRelecture,
): void {
  try {
    storage?.setItem(RELECTURE_STORAGE_KEY, JSON.stringify(etats))
  } catch {
    // stockage plein ou désactivé : le suivi reste valable pour la session
  }
}

/**
 * Applique le verdict choisi : cliquer à nouveau sur le verdict déjà posé
 * l'efface
 */
export function toggleEtatDeRelecture(
  etats: EtatsDeRelecture,
  uuid: string,
  etat: EtatDeRelecture,
): EtatsDeRelecture {
  const { [uuid]: actuel, ...autres } = etats
  return actuel === etat ? autres : { ...autres, [uuid]: etat }
}
