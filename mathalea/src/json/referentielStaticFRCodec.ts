import referentielStaticFRSessions from './referentielStaticFRSessions.json' with { type: 'json' }

type InfosExerciceStatique = {
  typeExercice: string
  annee: string
  lieu: string
  numeroInitial: string
  mois?: string
  jour?: string
  filiere?: string
}

const sessions: Record<
  string,
  Omit<InfosExerciceStatique, 'numeroInitial'>
> = referentielStaticFRSessions.sessions
const numeroOverrides: Record<string, string> =
  referentielStaticFRSessions.numeroOverrides
const entryOverrides: Record<string, InfosExerciceStatique> =
  referentielStaticFRSessions.entryOverrides

/**
 * Décode le dernier segment de l'uuid (le "code numéro") en numeroInitial.
 * Seul le CRPE encode systématiquement son numéro sous une forme à décoder
 * (exN, ex0N, pb) ; les autres familles utilisent le segment tel quel (et
 * les rares exceptions passent par numeroOverrides).
 */
function decodeNumero(typeExercice: string, numeroCode: string): string {
  if (typeExercice === 'crpe') {
    if (numeroCode === 'pb') return 'Problème'
    const match = /^ex0*(\d+)$/.exec(numeroCode)
    if (match) return match[1]
  }
  return numeroCode
}

/**
 * Reconstruit {typeExercice, annee, mois?, lieu, jour?, numeroInitial, filiere?}
 * à partir de l'uuid d'un exercice statique du référentiel FR (dnb, dnbpro,
 * bac, sti2d, stl, e3c, eam, crpe), en s'appuyant sur la table de sessions
 * générée depuis les dictionnaires (référentielStaticFRSessions.json).
 */
export function deriveInfosExerciceStatique(
  uuid: string,
): InfosExerciceStatique {
  if (uuid in entryOverrides) {
    const override = entryOverrides[uuid]
    const infos: InfosExerciceStatique = {
      typeExercice: override.typeExercice,
      annee: override.annee,
      lieu: override.lieu,
      numeroInitial: override.numeroInitial,
    }
    if (override.mois !== undefined) infos.mois = override.mois
    if (override.jour !== undefined) infos.jour = override.jour
    if (override.filiere !== undefined) infos.filiere = override.filiere
    return infos
  }

  const segments = uuid.split('_')
  const numeroCode = segments[segments.length - 1]
  const sessionKey = segments.slice(0, -1).join('_')
  const session = sessions[sessionKey]
  if (!session) {
    throw new Error(
      `Session inconnue pour l'uuid statique "${uuid}" (clé de session "${sessionKey}"). ` +
        'Ajoutez une entrée dans src/json/referentielStaticFRSessions.json ou vérifiez cet uuid.',
    )
  }

  const numeroInitial =
    uuid in numeroOverrides
      ? numeroOverrides[uuid]
      : decodeNumero(session.typeExercice, numeroCode)

  const infos: InfosExerciceStatique = {
    typeExercice: session.typeExercice,
    annee: session.annee,
    lieu: session.lieu,
    numeroInitial,
  }
  if (session.mois !== undefined) infos.mois = session.mois
  if (session.jour !== undefined) infos.jour = session.jour
  if (session.filiere !== undefined) infos.filiere = session.filiere
  return infos
}

/**
 * Parcourt récursivement un arbre du référentiel statique FR et complète,
 * pour chaque feuille possédant un uuid, les champs annee/lieu/mois/
 * numeroInitial/typeExercice (et jour/filiere le cas échéant) déduits de
 * l'uuid. Mutation en place.
 */
export function hydrateReferentielTree<T>(tree: T): T {
  if (tree && typeof tree === 'object') {
    const entries: Array<[string, unknown]> = Object.entries(tree)
    const record = new Map(entries)
    const uuid = record.get('uuid')
    if (typeof uuid === 'string') {
      Object.assign(tree, deriveInfosExerciceStatique(uuid))
      return tree
    }
    for (const value of record.values()) {
      hydrateReferentielTree(value)
    }
  }
  return tree
}
