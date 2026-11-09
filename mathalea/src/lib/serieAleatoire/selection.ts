import { get } from 'svelte/store'
import levelsThemesList from '../../json/levelsThemesList.json'
import levelsThemesListCH from '../../json/levelsThemesListCH.json'
import referentielCH from '../../json/referentiel2022CH.json'
import referentielFR from '../../json/referentiel2022FR.json'
import { renderMathsInLabel } from '../components/mobileMenu'
import { codeToLevelTitle } from '../components/refUtils'
import { presModeId } from '../stores/generalStore'
import { referentielLocale } from '../stores/languagesStore'
import {
  isJSONReferentielEnding,
  type JSONReferentielEnding,
  type JSONReferentielObject,
} from '../types/referentiels'

/**
 * Sélection d'exercices dans l'arborescence des exercices aléatoires, pour
 * l'app « Série aléatoire » (`src/exercices/serieAleatoire/SerieAleatoire.ts`).
 *
 * La sélection est mémorisée dans `sup` sous forme d'une liste d'entrées
 * séparées par des `;`. Une entrée est :
 *
 * - soit un **chemin** dans le référentiel (`6e>6N1>6N11`), qui vaut « tout ce
 *   nœud », niveau, thème ou sous-thème ;
 * - soit l'**uuid** d'un exercice précis.
 *
 * Cocher un niveau tient donc en quelques caractères dans l'URL partagée, et la
 * sélection suit le référentiel : les exercices ajoutés plus tard sous un thème
 * coché en font automatiquement partie.
 *
 * @author Rémi Angot
 */

/** Sépare deux entrées de la sélection. */
export const SEPARATEUR_ENTREES = ';'
/** Sépare deux segments d'un chemin dans le référentiel. */
export const SEPARATEUR_CHEMIN = '>'

/** Ce dont l'app a besoin pour construire le lien vers un exercice. */
export type ExerciceDuReferentiel = {
  uuid: string
  /** Référence pédagogique (`6N11-2`), reprise dans l'URL comme `id`. */
  id: string
  titre: string
}

/** Un enfant direct d'un nœud : un sous-nœud ou un exercice. */
export type EnfantDeNoeud =
  | { type: 'noeud'; cle: string; noeud: JSONReferentielObject }
  | { type: 'exercice'; cle: string; exercice: ExerciceDuReferentiel }

/**
 * Ce que désigne une case à cocher : un nœud (le chemin suffit) ou un exercice
 * (`uuid` renseigné, `chemin` menant jusqu'à lui, sa propre clé comprise).
 */
export type CibleDeSelection = { chemin: string[]; uuid?: string }

/** État d'une case à cocher devant un nœud du référentiel. */
export type EtatCase = 'oui' | 'non' | 'partiel'

/**
 * L'arborescence des exercices aléatoires du pays courant. C'est le référentiel
 * brut (niveau > thème > sous-thème > exercice), pas celui reconstruit pour le
 * menu : la structure y est déjà celle que le sélecteur affiche.
 */
export function referentielDesExercices(): JSONReferentielObject {
  const referentiel =
    get(referentielLocale) === 'fr-CH' ? referentielCH : referentielFR
  return referentiel as unknown as JSONReferentielObject
}

/** Les entrées d'une sélection stockée dans `sup`. */
export function parseSelection(sup: unknown): string[] {
  return String(sup ?? '')
    .split(SEPARATEUR_ENTREES)
    .map((entree) => entree.trim())
    .filter((entree) => entree !== '')
}

/** La sélection telle qu'elle est mémorisée dans `sup`. */
export function formatSelection(entrees: string[]): string {
  return dedoublonne(entrees).join(SEPARATEUR_ENTREES)
}

/**
 * Le nœud atteint en suivant un chemin, `undefined` si le chemin ne mène nulle
 * part (référentiel réorganisé depuis le partage du lien, faute de frappe dans
 * le champ texte des réglages...).
 */
export function noeudDuChemin(
  referentiel: JSONReferentielObject,
  chemin: string[],
): JSONReferentielObject | undefined {
  let noeud = referentiel
  for (const cle of chemin) {
    const enfant = noeud[cle]
    if (
      enfant == null ||
      typeof enfant !== 'object' ||
      Array.isArray(enfant) ||
      isJSONReferentielEnding(enfant)
    ) {
      return undefined
    }
    noeud = enfant as JSONReferentielObject
  }
  return noeud
}

/** Les enfants directs d'un nœud, dans l'ordre du référentiel. */
export function enfantsDuNoeud(noeud: JSONReferentielObject): EnfantDeNoeud[] {
  const enfants: EnfantDeNoeud[] = []
  for (const [cle, valeur] of Object.entries(noeud)) {
    if (valeur == null || typeof valeur !== 'object' || Array.isArray(valeur)) {
      continue
    }
    if (isJSONReferentielEnding(valeur)) {
      const exercice = versExercice(valeur)
      if (exercice !== undefined) {
        enfants.push({ type: 'exercice', cle, exercice })
      }
    } else {
      enfants.push({
        type: 'noeud',
        cle,
        noeud: valeur as JSONReferentielObject,
      })
    }
  }
  return enfants
}

/**
 * Les enfants d'un nœud qui ont quelque chose à proposer. Le référentiel garde
 * des rubriques vides (ainsi `200` en Seconde, qui porte le même libellé
 * « Automatismes » que `2A` et ferait doublon) : les afficher n'apporte rien et
 * les cocher encore moins.
 */
export function enfantsVisibles(noeud: JSONReferentielObject): EnfantDeNoeud[] {
  return enfantsDuNoeud(noeud).filter(
    (enfant) =>
      enfant.type === 'exercice' || exercicesDuNoeud(enfant.noeud).length > 0,
  )
}

/**
 * Tous les exercices d'un nœud, sous-thèmes compris. Le résultat est mémorisé :
 * l'état des cases à cocher le redemande à chaque rendu du sélecteur.
 */
export function exercicesDuNoeud(
  noeud: JSONReferentielObject,
): ExerciceDuReferentiel[] {
  const memorise = exercicesParNoeud.get(noeud)
  if (memorise !== undefined) return memorise
  const exercices: ExerciceDuReferentiel[] = []
  for (const enfant of enfantsDuNoeud(noeud)) {
    if (enfant.type === 'exercice') exercices.push(enfant.exercice)
    else exercices.push(...exercicesDuNoeud(enfant.noeud))
  }
  const uniques = dedoublonneExercices(exercices)
  exercicesParNoeud.set(noeud, uniques)
  return uniques
}

/**
 * Les exercices désignés par une sélection, dans l'ordre des entrées et sans
 * doublon (l'ordre importe peu : le tirage les mélange). Les entrées qui ne correspondent plus à rien sont ignorées plutôt
 * que de casser toute la série.
 */
export function exercicesDeLaSelection(
  referentiel: JSONReferentielObject,
  entrees: string[],
): ExerciceDuReferentiel[] {
  const index = indexParUuid(referentiel)
  const exercices: ExerciceDuReferentiel[] = []
  for (const entree of entrees) {
    const chemin = cheminDeLEntree(referentiel, entree)
    if (chemin === undefined) {
      const exercice = index.get(entree)
      if (exercice !== undefined) exercices.push(exercice)
      continue
    }
    const noeud = noeudDuChemin(referentiel, chemin)
    if (noeud !== undefined) exercices.push(...exercicesDuNoeud(noeud))
  }
  return dedoublonneExercices(exercices)
}

/**
 * Le chemin désigné par une entrée, `undefined` si l'entrée est l'uuid d'un
 * exercice. Un chemin d'un seul segment (un niveau) est reconnu parce qu'il
 * existe à la racine du référentiel, là où un uuid n'existe pas.
 */
export function cheminDeLEntree(
  referentiel: JSONReferentielObject,
  entree: string,
): string[] | undefined {
  if (entree.includes(SEPARATEUR_CHEMIN)) return entree.split(SEPARATEUR_CHEMIN)
  const racine = referentiel[entree]
  if (racine == null || typeof racine !== 'object' || Array.isArray(racine)) {
    return undefined
  }
  return isJSONReferentielEnding(racine) ? undefined : [entree]
}

/** L'entrée qui représente une cible dans `sup`. */
export function entreeDeLaCible(cible: CibleDeSelection): string {
  return cible.uuid ?? cible.chemin.join(SEPARATEUR_CHEMIN)
}

/**
 * L'état de la case à cocher d'une cible : cochée si elle est sélectionnée ou
 * si un de ses ancêtres l'est, indéterminée si seule une partie de son contenu
 * l'est.
 */
export function etatDeLaCible(
  referentiel: JSONReferentielObject,
  entrees: string[],
  cible: CibleDeSelection,
): EtatCase {
  if (entrees.includes(entreeDeLaCible(cible))) return 'oui'
  const prefixe = cible.chemin.join(SEPARATEUR_CHEMIN)
  if (
    entrees.some((entree) => prefixe.startsWith(entree + SEPARATEUR_CHEMIN))
  ) {
    return 'oui'
  }
  if (cible.uuid !== undefined) return 'non'
  const noeud = noeudDuChemin(referentiel, cible.chemin)
  const uuids = new Set(
    noeud === undefined
      ? []
      : exercicesDuNoeud(noeud).map((exercice) => exercice.uuid),
  )
  const partiel = entrees.some(
    (entree) =>
      entree.startsWith(prefixe + SEPARATEUR_CHEMIN) || uuids.has(entree),
  )
  return partiel ? 'partiel' : 'non'
}

/**
 * Coche une cible : son entrée remplace celles de tout ce qu'elle contient,
 * pour que la sélection reste courte dans l'URL partagée.
 */
export function ajouteALaSelection(
  referentiel: JSONReferentielObject,
  entrees: string[],
  cible: CibleDeSelection,
): string[] {
  if (etatDeLaCible(referentiel, entrees, cible) === 'oui') {
    return dedoublonne(entrees)
  }
  return dedoublonne([
    ...sansLeContenu(referentiel, entrees, cible),
    entreeDeLaCible(cible),
  ])
}

/**
 * Décoche une cible. Si elle était couverte par un ancêtre coché (« tout le
 * thème »), cet ancêtre est éclaté en ses enfants : on garde tout ce qu'il
 * contenait, sauf la branche que l'enseignant vient de décocher.
 */
export function retireDeLaSelection(
  referentiel: JSONReferentielObject,
  entrees: string[],
  cible: CibleDeSelection,
): string[] {
  let restantes = sansLeContenu(referentiel, entrees, cible)
  const prefixe = cible.chemin.join(SEPARATEUR_CHEMIN)
  const ancetres = restantes.filter((entree) =>
    prefixe.startsWith(entree + SEPARATEUR_CHEMIN),
  )
  if (ancetres.length === 0) return dedoublonne(restantes)
  restantes = restantes.filter((entree) => !ancetres.includes(entree))
  // On repart de l'ancêtre le plus haut : les ancêtres intermédiaires sont sur
  // le chemin décoché, ils ne doivent pas être réintroduits.
  const profondeurDeDepart = Math.min(
    ...ancetres.map((ancetre) => ancetre.split(SEPARATEUR_CHEMIN).length),
  )
  for (let d = profondeurDeDepart; d < cible.chemin.length; d++) {
    const parent = cible.chemin.slice(0, d)
    const noeudParent = noeudDuChemin(referentiel, parent)
    if (noeudParent === undefined) continue
    for (const enfant of enfantsVisibles(noeudParent)) {
      if (enfant.cle === cible.chemin[d]) continue
      restantes.push(
        enfant.type === 'exercice'
          ? enfant.exercice.uuid
          : [...parent, enfant.cle].join(SEPARATEUR_CHEMIN),
      )
    }
  }
  return dedoublonne(restantes)
}

/**
 * Les N exercices tirés au sort dans la sélection.
 *
 * Le tirage est délibérément **indépendant de la graine de l'exercice** : le
 * bouton doit proposer une série différente à chaque clic, et deux élèves qui
 * ouvrent le même lien partagé ne doivent pas recevoir les mêmes exercices.
 * D'où `crypto.getRandomValues` plutôt que `shuffle()`, dont le `Math.random`
 * est remplacé par le générateur à graine de MathALÉA.
 */
export function tirageDeLaSerie(
  exercices: ExerciceDuReferentiel[],
  nombre: number,
): ExerciceDuReferentiel[] {
  const melange = [...exercices]
  for (let i = melange.length - 1; i > 0; i--) {
    const j = entierAleatoire(i + 1)
    ;[melange[i], melange[j]] = [melange[j], melange[i]]
  }
  const taille = Math.max(0, Math.min(Math.floor(nombre), melange.length))
  return melange.slice(0, taille)
}

/** Un entier de `[0, borne[`, hors du générateur à graine de MathALÉA. */
function entierAleatoire(borne: number): number {
  const tirage = globalThis.crypto?.getRandomValues
    ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32
    : Math.random()
  return Math.floor(tirage * borne)
}

/** L'adresse de la séance publiée par MathALÉA. */
export const BASE_SERIE_ALEATOIRE = 'https://coopmaths.fr/alea/'

/**
 * Les réglages de la vue élève, encodés dans `es` : un caractère par option,
 * dans l'ordre `presMode | setInteractive | isSolutionAccessible |
 * isInteractiveFree | oneShot | twoColumns | isTitleDisplayed |
 * isReferenceDisplayed` (voir `mathaleaUpdateExercicesParamsFromUrl`).
 *
 * Seul `presMode` s'écarte des valeurs par défaut de `globalOptions` : la série
 * s'ouvre avec un exercice par page. `setInteractive` reste à « au choix
 * exercice par exercice » pour que le `i=1` posé sur chaque exercice décide.
 */
const REGLAGES_VUE_ELEVE = [
  presModeId.indexOf('un_exo_par_page'), // presMode
  2, // setInteractive
  1, // isSolutionAccessible
  1, // isInteractiveFree
  0, // oneShot
  0, // twoColumns
  1, // isTitleDisplayed
  1, // isReferenceDisplayed
].join('')

/**
 * Le lien vers la série : un paramètre `uuid` par exercice, suivi de ses
 * propres paramètres (l'analyse des URLs de MathALÉA est positionnelle), puis
 * `v=eleve` et `es`, qui valent pour toute la séance.
 */
export function lienVersLaSerie(
  exercices: ExerciceDuReferentiel[],
  { interactif }: { interactif: boolean },
): string {
  const url = new URL(BASE_SERIE_ALEATOIRE)
  for (const exercice of exercices) {
    url.searchParams.append('uuid', exercice.uuid)
    url.searchParams.append('id', exercice.id)
    if (interactif) url.searchParams.append('i', '1')
  }
  url.searchParams.append('v', 'eleve')
  url.searchParams.append('es', REGLAGES_VUE_ELEVE)
  if (get(referentielLocale) === 'fr-CH')
    url.searchParams.append('lang', 'fr-CH')
  return url.toString()
}

/**
 * Le libellé affichable d'une clé du référentiel : les titres humains des
 * thèmes et sous-thèmes d'abord (France puis Suisse, comme dans le menu), les
 * niveaux ensuite, et à défaut la clé elle-même.
 */
export function libelleDuNoeud(code: string): string {
  const titre =
    titresDeThemes[code]?.titre ??
    titresDeThemesCH[code]?.titre ??
    codeToLevelTitle(code)
  return renderMathsInLabel(titre)
}

/** Le titre d'un exercice, maths comprises. */
export function libelleDeLExercice(exercice: ExerciceDuReferentiel): string {
  return renderMathsInLabel(exercice.titre)
}

const titresDeThemes = levelsThemesList as Record<string, { titre?: string }>
const titresDeThemesCH = levelsThemesListCH as Record<
  string,
  { titre?: string }
>

const exercicesParNoeud = new WeakMap<
  JSONReferentielObject,
  ExerciceDuReferentiel[]
>()
const indexParReferentiel = new WeakMap<
  JSONReferentielObject,
  Map<string, ExerciceDuReferentiel>
>()

/** `uuid -> exercice` pour tout un référentiel, construit une seule fois. */
function indexParUuid(
  referentiel: JSONReferentielObject,
): Map<string, ExerciceDuReferentiel> {
  const memorise = indexParReferentiel.get(referentiel)
  if (memorise !== undefined) return memorise
  const index = new Map<string, ExerciceDuReferentiel>()
  for (const exercice of exercicesDuNoeud(referentiel)) {
    index.set(exercice.uuid, exercice)
  }
  indexParReferentiel.set(referentiel, index)
  return index
}

/** Les entrées privées de la cible et de tout ce qu'elle contient. */
function sansLeContenu(
  referentiel: JSONReferentielObject,
  entrees: string[],
  cible: CibleDeSelection,
): string[] {
  const prefixe = cible.chemin.join(SEPARATEUR_CHEMIN)
  const noeud =
    cible.uuid === undefined
      ? noeudDuChemin(referentiel, cible.chemin)
      : undefined
  const uuids = new Set(
    cible.uuid !== undefined
      ? [cible.uuid]
      : noeud === undefined
        ? []
        : exercicesDuNoeud(noeud).map((exercice) => exercice.uuid),
  )
  return entrees.filter(
    (entree) =>
      entree !== prefixe &&
      !entree.startsWith(prefixe + SEPARATEUR_CHEMIN) &&
      !uuids.has(entree),
  )
}

function versExercice(
  fin: JSONReferentielEnding,
): ExerciceDuReferentiel | undefined {
  const uuid = fin.uuid
  if (typeof uuid !== 'string' || uuid === '') return undefined
  const id = 'id' in fin && typeof fin.id === 'string' ? fin.id : uuid
  const titre = 'titre' in fin && typeof fin.titre === 'string' ? fin.titre : id
  return { uuid, id, titre }
}

function dedoublonne(entrees: string[]): string[] {
  return [...new Set(entrees)]
}

function dedoublonneExercices(
  exercices: ExerciceDuReferentiel[],
): ExerciceDuReferentiel[] {
  const vus = new Set<string>()
  const uniques: ExerciceDuReferentiel[] = []
  for (const exercice of exercices) {
    if (vus.has(exercice.uuid)) continue
    vus.add(exercice.uuid)
    uniques.push(exercice)
  }
  return uniques
}
