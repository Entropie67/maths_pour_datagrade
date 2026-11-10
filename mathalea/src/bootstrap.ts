import { restoreStatsUrl } from './modules/statsUrlNavigation'

/**
 * Les imports de main lisent l'URL dès leur évaluation (stats, banques...).
 * Ils doivent donc être chargés après la restauration d'un lien statistique.
 */
async function startApp() {
  try {
    restoreStatsUrl()
  } catch {
    const container = document.getElementById('appMathalea')
    if (container) {
      const message = document.createElement('p')
      message.setAttribute('role', 'alert')
      message.textContent =
        'Ce lien statistique est incomplet ou invalide. Utiliser un lien de partage MathALÉA.'
      container.replaceChildren(message)
    }
    return
  }
  return (await import('./main')).default
}

export default startApp()
