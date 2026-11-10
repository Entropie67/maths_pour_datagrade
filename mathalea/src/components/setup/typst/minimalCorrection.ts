import type { IExercice } from '../../../lib/types'
import { orangeMathalea } from '../../../lib/colors'

/**
 * Réglage « Correction minimale » de la vue Typst : ne garder d'une correction
 * que les réponses mises en évidence en orange, dans leur mise en forme
 * d'origine. Deux façons de mettre en évidence coexistent dans les exercices :
 *
 * - `miseEnEvidence()` — dans une formule, produit `{\color{#F15929}\boldsymbol{…}}` ;
 * - `texteEnCouleurEtGras()` — hors formule, produit en HTML un `<span>` orange
 *   et gras (les exercices à QCM s'en servent pour désigner la bonne réponse).
 *
 * Une correction qui n'en contient aucune — ou dont la mise en évidence utilise
 * une autre couleur, choisie justement pour ne pas désigner la réponse — est
 * renvoyée telle quelle.
 */

/**
 * Motif produit par `miseEnEvidence()` en HTML : `{\color{#F15929}\boldsymbol{…}}`.
 * On accepte aussi la variante LaTeX `\color[HTML]{F15929}` et la casse
 * indifférente du code hexadécimal.
 */
const hexOrange = orangeMathalea.replace('#', '')
const regexpMiseEnEvidence = new RegExp(
  `\\\\color(?:\\[HTML\\])?\\{#?${hexOrange}\\}\\s*\\\\boldsymbol\\s*\\{`,
  'gi',
)

/**
 * Renvoie le contenu de l'accolade ouverte à `indexOuvrante`, en tenant compte
 * des accolades imbriquées et des accolades échappées.
 */
function contenuAccolade(
  texte: string,
  indexOuvrante: number,
): { contenu: string; indexFermante: number } | undefined {
  if (texte[indexOuvrante] !== '{') return undefined
  let profondeur = 0
  for (let i = indexOuvrante; i < texte.length; i++) {
    const caractere = texte[i]
    if (caractere === '\\') {
      i++ // on saute le caractère échappé (\{ , \} , \\ …)
      continue
    }
    if (caractere === '{') profondeur++
    else if (caractere === '}') {
      profondeur--
      if (profondeur === 0) {
        return { contenu: texte.slice(indexOuvrante + 1, i), indexFermante: i }
      }
    }
  }
  return undefined
}

/**
 * Occurrences de `miseEnEvidence()` en orange dans une correction, avec leur
 * position de départ dans le texte (pour pouvoir les remettre dans l'ordre
 * avec les mises en évidence par `texteEnCouleurEtGras()`).
 * Le contenu est renvoyé brut, sans dédoublonnage.
 */
function occurrencesMiseEnEvidence(
  correction: string,
): { index: number; contenu: string }[] {
  const occurrences: { index: number; contenu: string }[] = []
  regexpMiseEnEvidence.lastIndex = 0
  let correspondance: RegExpExecArray | null
  while ((correspondance = regexpMiseEnEvidence.exec(correction)) !== null) {
    const indexOuvrante =
      correspondance.index + correspondance[0].length - 1 /* l'accolade */
    const accolade = contenuAccolade(correction, indexOuvrante)
    if (accolade === undefined) break
    occurrences.push({
      index: correspondance.index,
      contenu: accolade.contenu.trim(),
    })
    regexpMiseEnEvidence.lastIndex = accolade.indexFermante + 1
  }
  return occurrences
}

/** Séparateur entre plusieurs réponses d'une même correction (cadratin) */
const SEPARATEUR = '&emsp;'

/**
 * Repère de sous-question produit par `numAlpha` (`a)`, `b)`, `1)`…) : un span
 * orange et gras lui aussi, mais qui ne désigne aucune réponse.
 */
const REPERE_SOUS_QUESTION = /^\s*(?:[a-z]|\d{1,2})\)(?:&nbsp;|\s)*$/i

/** Balise ouvrante `<span …>`, avec ses attributs */
const OUVERTURE_SPAN = /<span([^>]*)>/gi

/** Une réponse repérée dans la correction, avec sa position de départ */
interface Reponse {
  index: number
  /** Fragment à réémettre tel quel (HTML ou formule LaTeX) */
  extrait: string
}

/** Réponse mise en évidence en orange, dans l'ordre de la correction */
export interface ReponseMiseEnEvidence {
  /** `formule` : `miseEnEvidence()` ; `texte` : `texteEnCouleurEtGras()` */
  nature: 'formule' | 'texte'
  /** Contenu mis en évidence, sans la mise en forme orange */
  contenu: string
  /** Fragment d'origine, mise en forme orange comprise */
  extrait: string
}

/** Balisage produit par `miseEnEvidence()` en orange autour de `contenu` */
function miseEnEvidenceOrange(contenu: string): string {
  return `{\\color{${orangeMathalea}}\\boldsymbol{${contenu}}}`
}

/** Le style de ce span est-il celui de `texteEnCouleurEtGras()` en orange ? */
function estOrangeEtGras(attributs: string): boolean {
  const style = attributs.match(/\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
  const valeur = style?.[1] ?? style?.[2] ?? ''
  if (!/font-weight\s*:\s*(?:bold|[6-9]00)/i.test(valeur)) return false
  const couleur = valeur.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)
  return (
    couleur != null &&
    couleur[1].trim().toLowerCase() === orangeMathalea.toLowerCase()
  )
}

/**
 * Position de la balise `</span>` fermant le span ouvert juste avant
 * `debutContenu`, en tenant compte des spans imbriqués (`texteEnCouleurEtGras`
 * peut envelopper un contenu qui en contient d'autres).
 */
function fermetureDuSpan(
  texte: string,
  debutContenu: number,
): { debutFermeture: number; finFermeture: number } | undefined {
  const balises = /<(\/?)span\b[^>]*>/gi
  balises.lastIndex = debutContenu
  let profondeur = 0
  let balise: RegExpExecArray | null
  while ((balise = balises.exec(texte)) !== null) {
    if (balise[1] === '') {
      profondeur++
      continue
    }
    if (profondeur === 0) {
      return {
        debutFermeture: balise.index,
        finFermeture: balise.index + balise[0].length,
      }
    }
    profondeur--
  }
  return undefined
}

/** Occurrences de `texteEnCouleurEtGras()` en orange, hors repères de sous-question */
function occurrencesTexteEnCouleurEtGras(
  correction: string,
): (Reponse & { contenu: string })[] {
  const occurrences: (Reponse & { contenu: string })[] = []
  OUVERTURE_SPAN.lastIndex = 0
  let ouverture: RegExpExecArray | null
  while ((ouverture = OUVERTURE_SPAN.exec(correction)) !== null) {
    if (!estOrangeEtGras(ouverture[1])) continue
    const debutContenu = OUVERTURE_SPAN.lastIndex
    const fermeture = fermetureDuSpan(correction, debutContenu)
    if (fermeture === undefined) break
    const contenu = correction.slice(debutContenu, fermeture.debutFermeture)
    OUVERTURE_SPAN.lastIndex = fermeture.finFermeture
    if (contenu.trim() === '' || REPERE_SOUS_QUESTION.test(contenu)) continue
    occurrences.push({
      index: ouverture.index,
      contenu: contenu.trim(),
      extrait: correction.slice(ouverture.index, fermeture.finFermeture),
    })
  }
  return occurrences
}

/**
 * Réponses mises en évidence en orange dans une correction, dans leur ordre
 * d'apparition et sans doublon. Tableau vide quand il n'y en a aucune.
 */
export function reponsesMisesEnEvidence(
  correction: string,
): ReponseMiseEnEvidence[] {
  const spans = occurrencesTexteEnCouleurEtGras(correction)
  const reponses: (Reponse & ReponseMiseEnEvidence)[] = [
    ...occurrencesMiseEnEvidence(correction)
      .filter(
        ({ index, contenu }) =>
          contenu !== '' &&
          // une formule mise en évidence à l'intérieur d'un span orange est
          // déjà reprise avec lui : ne pas la compter une seconde fois
          !spans.some(
            (span) =>
              index > span.index && index < span.index + span.extrait.length,
          ),
      )
      .map(({ index, contenu }) => ({
        index,
        nature: 'formule' as const,
        contenu,
        extrait: `$${miseEnEvidenceOrange(contenu)}$`,
      })),
    ...spans.map((span) => ({ ...span, nature: 'texte' as const })),
  ]
  reponses.sort((a, b) => a.index - b.index)
  const vus = new Set<string>()
  const resultat: ReponseMiseEnEvidence[] = []
  for (const { nature, contenu, extrait } of reponses) {
    if (vus.has(extrait)) continue
    vus.add(extrait)
    resultat.push({ nature, contenu, extrait })
  }
  return resultat
}

/** Résout la déclaration de la question avant toute extraction automatique. */
export function getShortAnswer(
  exercise: Partial<
    Pick<IExercice, 'listeReponsesCourtes' | 'reponseCourteDisponible'>
  >,
  index: number,
): string | null | undefined {
  const answer = exercise.listeReponsesCourtes?.[index]
  if (answer === null || (typeof answer === 'string' && answer.trim() !== ''))
    return answer
  return exercise.reponseCourteDisponible === false ? null : undefined
}

/**
 * Réponse explicite en priorité, puis extraction orange séparée par un cadratin.
 * `null` ou l'absence d'orange conserve la correction complète.
 */
export function minimalCorrection(
  correction: string,
  shortAnswer?: string | null,
): string {
  if (shortAnswer === null) return correction
  if (shortAnswer?.trim()) return shortAnswer
  const reponses = reponsesMisesEnEvidence(correction)
  if (reponses.length === 0) return correction
  return reponses.map(({ extrait }) => extrait).join(SEPARATEUR)
}
