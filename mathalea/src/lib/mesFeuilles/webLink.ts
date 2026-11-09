/** Adresse web absolue autorisée pour une sauvegarde de lien. */
export function readWebUrl(input: string): URL {
  const text = input.trim()
  let url: URL
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`)
  } catch {
    throw new Error('Saisir une adresse web valide.')
  }
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) {
    throw new Error('Utiliser une adresse commençant par https:// ou http://.')
  }
  return url
}

/** Entrée de l’application sur ses deux domaines publics. */
export function isMathaleaUrl(url: URL): boolean {
  return (
    [
      'mathalea.fr',
      'coopmaths.fr',
      'www.mathalea.fr',
      'www.coopmaths.fr',
    ].includes(url.hostname) && /^\/alea\/?$/.test(url.pathname)
  )
}
