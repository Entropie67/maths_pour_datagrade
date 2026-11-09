import { dictionnaireMathadata } from '../../json/dictionnaireMathadata'
import type { JSONReferentielObject } from '../types/referentiels'

/** Terminaison : un exercice MathAdata. */
type DictionnaireMathadataExercice = {
  title: string
  tags?: string[]
}
/**
 * Nœud intermédiaire : soit un chapitre (au premier niveau), soit une
 * sous-section (à n'importe quel niveau plus profond). Chaque entrée est
 * elle-même soit un exercice, soit un nouveau nœud imbriqué — la structure
 * accepte donc un nombre arbitraire de niveaux de sous-sections.
 */
interface DictionnaireMathadataNode {
  [key: string]: DictionnaireMathadataExercice | DictionnaireMathadataNode
}

// Utilisé pour les <img> (png) : une URL absolue fonctionne sans CORS pour l'affichage.
const MATHADATA_PNG_BASE = 'https://coopmaths.fr/alea/static/mathadata/tex'
// Utilisé pour récupérer le code LaTeX via `fetch()` : coopmaths.fr n'envoie pas
// d'en-têtes CORS, il faut donc un chemin relatif (même origine en prod, proxifié en dev).
const MATHADATA_TEX_BASE = 'static/mathadata/tex'
export const MATHADATA_TITLE =
  'MathAdata : les maths en résolvant des défis d’IA'

/**
 * Distingue une terminaison (exercice) d'un nœud imbriqué (chapitre ou
 * sous-section) : un exercice est le seul cas où la clé `title` est portée
 * directement par la valeur.
 */
function isMathadataExercice(
  value: DictionnaireMathadataExercice | DictionnaireMathadataNode,
): value is DictionnaireMathadataExercice {
  return typeof (value as DictionnaireMathadataExercice).title === 'string'
}

/**
 * Construit récursivement une branche du référentiel MathAdata à partir d'un
 * nœud de `dictionnaireMathadata.js` : chaque clé devient soit un exercice
 * (terminaison), soit une sous-section (nouvel appel récursif), ce qui
 * permet un nombre quelconque de niveaux d'imbrication (chapitre > sous-
 * chapitre > sous-sous-chapitre > ... > exercice).
 */
function buildNode(node: DictionnaireMathadataNode): JSONReferentielObject {
  const result: JSONReferentielObject = {}
  for (const key in node) {
    const value = node[key]
    if (isMathadataExercice(value)) {
      const uuid = key
      result[uuid] = {
        uuid,
        tags: value.tags ?? [],
        typeExercice: 'static',
        titre: value.title,
        png: `${MATHADATA_PNG_BASE}/png/${uuid}.png`,
        pngCor: `${MATHADATA_PNG_BASE}/png/${uuid}_cor.png`,
        tex: `${MATHADATA_TEX_BASE}/${uuid}.tex`,
        texCor: `${MATHADATA_TEX_BASE}/${uuid}_cor.tex`,
        url: `${MATHADATA_TEX_BASE}/${uuid}.tex`,
        urlcor: `${MATHADATA_TEX_BASE}/${uuid}_cor.tex`,
      }
    } else {
      result[key] = buildNode(value)
    }
  }
  return result
}

/**
 * Construit le référentiel des exercices statiques MathAdata (chapitre >
 * sous-sections éventuelles > exercice) à partir de `dictionnaireMathadata.js`,
 * sur le modèle des référentiels d'annales statiques
 * (`tasks/dictionnaireToReferentiel.js`).
 */
function buildReferentielMathadata(): JSONReferentielObject {
  const dictionnaire = dictionnaireMathadata as DictionnaireMathadataNode
  return { [MATHADATA_TITLE]: buildNode(dictionnaire) }
}

export const referentielMathadata: JSONReferentielObject =
  buildReferentielMathadata()

export function isMathadataUuid(uuid: string | undefined): boolean {
  return uuid !== undefined && uuid.startsWith('md-')
}
