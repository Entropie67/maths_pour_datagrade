import type {
  CleTexteSchema,
  SchemaEnBarreAttendu,
} from '../customElements/SchemaEnBarreElement'
import type Probleme from './Probleme'
import { nbRectanglesPour } from './problemesSchemasEnBarre'

/** Adapter les données des banques de 6N5-10, sans consommer de tirage. */
export function schemaProblemeVarie(probleme: Probleme, categorie: number) {
  const nombre = (n: number) =>
    n.toLocaleString('fr-FR', { maximumFractionDigits: 10 })
  const nb1 = Number(probleme.data.nb1)
  const nb2 = Number(probleme.data.nb2)
  const n = Number(probleme.data.nbFois)
  let attendu: SchemaEnBarreAttendu
  let inconnue: CleTexteSchema
  let solution: number

  if (categorie <= 5) {
    let a = nb1
    let b = nb2
    let tout = nb1 + nb2
    // Dans « courses5 », nb1 est l'achat et nb2 le solde après l'achat.
    if (categorie === 3) {
      a = nb2 - nb1
      b = nb1
      tout = nb2
    }
    inconnue =
      categorie === 3
        ? 'partieA'
        : categorie === 2 || categorie === 5
          ? 'partieB'
          : 'tout'
    attendu = {
      type: 'additif-parties-tout',
      textes: { partieA: nombre(a), partieB: nombre(b), tout: nombre(tout) },
    }
    solution = inconnue === 'tout' ? tout : inconnue === 'partieA' ? a : b
  } else if (categorie <= 8) {
    const grande = categorie === 8 ? Math.max(nb1, nb2) : nb1 + nb2
    const petite = categorie === 8 ? Math.min(nb1, nb2) : nb1
    const difference = categorie === 8 ? Math.abs(nb1 - nb2) : nb2
    inconnue =
      categorie === 6 ? 'partieA' : categorie === 7 ? 'partieB' : 'difference'
    attendu = {
      type: 'additif-comparaison',
      textes: {
        partieA: nombre(grande),
        partieB: nombre(petite),
        difference: nombre(difference),
      },
    }
    solution = categorie === 6 ? grande : categorie === 7 ? petite : difference
  } else if (categorie <= 11) {
    const part = Number(
      categorie === 9 ? probleme.data.facteur : probleme.data.quotité,
    )
    inconnue =
      categorie === 9 ? 'tout' : categorie === 10 ? 'part' : 'nombreDeParts'
    attendu = {
      type: 'multiplicatif-parties-tout',
      textes: {
        part: nombre(part),
        nombreDeParts: nombre(n),
        tout: nombre(n * part),
      },
      // Ne pas donner le nombre de parts quand il est à chercher.
      ...(categorie !== 11 ? { nbRectangles: nbRectanglesPour(n) } : {}),
    }
    solution = categorie === 9 ? n * part : categorie === 10 ? part : n
  } else {
    const petite = categorie === 13 ? nb2 / n : nb1
    const grande = petite * n
    inconnue =
      categorie === 12
        ? 'etiquetteB'
        : categorie === 13
          ? 'part'
          : categorie === 14
            ? 'tout'
            : 'nFois'
    attendu = {
      type:
        categorie === 14
          ? 'multiplicatif-comparaison-total'
          : 'multiplicatif-comparaison',
      textes: {
        part: nombre(petite),
        nFois: nombre(n),
        // La valeur de la grande quantité accompagne son étiquette de ligne.
        ...(categorie === 14
          ? { tout: nombre(petite + grande) }
          : { etiquetteB: `Boîte\n${nombre(grande)}` }),
      },
      textesIndicatifs: { etiquetteA: 'Sachet', etiquetteB: 'Boîte' },
      ...(categorie !== 15 ? { nbRectangles: nbRectanglesPour(n) } : {}),
    }
    solution =
      categorie === 12
        ? grande
        : categorie === 13
          ? petite
          : categorie === 14
            ? petite + grande
            : n
  }
  const correction = { ...attendu.textes }
  attendu.textes[inconnue] = inconnue === 'etiquetteB' ? 'Boîte\n?' : '?'
  correction[inconnue] =
    inconnue === 'etiquetteB' ? `Boîte\n${nombre(solution)}` : nombre(solution)
  return { attendu, correction }
}
