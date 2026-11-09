import { clesBanquesPartageables } from './stores/banquesExternesStore'
import { estUuidBanqueExterne } from './types/banquesExternes'
import type { InterfaceParams } from './types'

export function createURL(params: InterfaceParams[]) {
  const url = new URL(
    window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname,
  )
  // Banques externes distantes : le lien doit dire d'où viennent les uuid `bq-`,
  // sans quoi le destinataire ne pourrait pas afficher ces exercices. Seules
  // les banques hébergées sur une forge sont référençables (une banque zip
  // n'existe que sur la machine où elle a été déposée).
  const uuidsDeBanque = params
    .map((ex) => ex.uuid)
    .filter((uuid) => estUuidBanqueExterne(uuid))
  if (uuidsDeBanque.length > 0) {
    for (const cle of clesBanquesPartageables(uuidsDeBanque)) {
      url.searchParams.append('bq', cle)
    }
  }
  for (const ex of params) {
    url.searchParams.append('uuid', ex.uuid)
    if (ex.id != null) url.searchParams.append('id', ex.id)
    if (ex.nbQuestions != null)
      url.searchParams.append('n', ex.nbQuestions.toString())
    if (ex.duration != null)
      url.searchParams.append('d', ex.duration.toString())
    if (ex.sup != null) url.searchParams.append('s', ex.sup)
    if (ex.sup2 != null) url.searchParams.append('s2', ex.sup2)
    if (ex.sup3 != null) url.searchParams.append('s3', ex.sup3)
    if (ex.sup4 != null) url.searchParams.append('s4', ex.sup4)
    if (ex.sup5 != null) url.searchParams.append('s5', ex.sup5)
    if (ex.versionQcm != null) url.searchParams.append('qcm', ex.versionQcm)
    // Le coefficient par défaut n'alourdit pas l'URL
    if (ex.coeffBareme != null && ex.coeffBareme !== 1)
      url.searchParams.append('coef', ex.coeffBareme.toString())
    if (ex.interactif === '1') url.searchParams.append('i', '1')
    if (ex.cd != null) url.searchParams.append('cd', ex.cd)
    if (ex.tip != null) url.searchParams.append('tip', String(ex.tip))
    // Calculatrice non autorisée par défaut : seuls `calc=1|2|3|9` alourdissent l'URL
    if (ex.calc != null && ex.calc !== '0')
      url.searchParams.append('calc', ex.calc)
    if (ex.cols != null) url.searchParams.append('cols', ex.cols.toString())
    if (ex.alea != null) url.searchParams.append('alea', ex.alea)
  }
  return url
}
