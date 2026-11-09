import rawReferentielStaticFR from './referentielStaticFR.json'
import { hydrateReferentielTree } from './referentielStaticFRCodec.js'

/**
 * referentielStaticFR.json ne stocke plus annee/lieu/mois/numeroInitial/
 * typeExercice (déductibles de l'uuid, cf. referentielStaticFRCodec.js) afin
 * d'alléger le fichier. Ce module les ré-hydrate une seule fois au chargement
 * pour que le reste de l'application continue de consommer la même forme
 * qu'avant.
 */
const referentielStaticFR = hydrateReferentielTree(rawReferentielStaticFR) as typeof rawReferentielStaticFR

export default referentielStaticFR
