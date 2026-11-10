/**
 * Configuration du service temps réel du quizz (mode multi-joueurs).
 *
 * En développement, le client joint le serveur ws **sur la même machine que
 * la page** (port 3000, dépôt quizz-ws, `node dist/src/index.js`) : viser
 * `localhost` en dur empêcherait le test depuis un autre appareil du réseau
 * local (`pnpm dev --host` + téléphone — pour l'appareil, « localhost »
 * désigne l'appareil lui-même). En production, sous-domaine dédié.
 *
 * Le CORS du serveur n'accepte que https://coopmaths.fr en production ;
 * en debugMode (développement), toute origine locale ou IP privée.
 */
const devWsUrl = (): string => {
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  return `http://${hostname}:3000`
}

export const QUIZZ_WS_URL = import.meta.env.DEV
  ? devWsUrl()
  : 'https://ws.bradype.fr'

/** Chemin sur lequel Socket.IO est servi (long-polling uniquement). */
export const QUIZZ_WS_PATH = '/ws'
