/**
 * Vrai sur un site en production (coopmaths.fr, mathalea.fr et leurs
 * miroirs). Faux en développement (localhost, adresse IP), sur le staging
 * (`staging.*`) et sur l'adresse technique du conteneur (`*.scw.cloud`) :
 * ces sites ne doivent pas compter dans les statistiques ni remonter
 * d'erreurs.
 */
export function isProductionSite(
  hostname: string = window.location.hostname,
): boolean {
  return (
    hostname !== 'localhost' &&
    // Adresse IPv4, ou IPv6 entre crochets.
    !/^[\d.]+$|^\[/.test(hostname) &&
    !hostname.startsWith('staging.') &&
    !hostname.endsWith('.scw.cloud')
  )
}
