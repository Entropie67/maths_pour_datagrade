/**
 * Traduction des erreurs du service temps réel du quizz (mode multi-joueurs).
 *
 * Le serveur émet `game:errorMessage` avec une **clé kebab-case** (ci-dessous)
 * ou, pour certains refus du moteur, une **phrase française** déjà prête
 * (ex. « Aucun joueur connecté pour démarrer la partie ») : toute charge qui
 * n'est pas une clé connue est affichée telle quelle.
 */

const ERROR_MESSAGES: Record<string, string> = {
  // Création de partie
  'create-disabled':
    'La création de parties est temporairement désactivée, réessayez plus tard.',
  'quota-exceeded': 'Quota dépassé : trop de requêtes, réessayez plus tard.',
  'rooms-full':
    'Le serveur accueille déjà trop de parties, réessayez dans quelques minutes.',
  'ticket-invalid': 'Identification invalide : recommencez la procédure.',
  'ticket-expired': 'Votre identification a expiré : recommencez la procédure.',
  'ticket-quiz-mismatch':
    'Ce code a déjà servi pour un autre quizz : redemandez un code.',
  'invalid-payload': 'Données invalides envoyées au serveur.',
  'game-not-found': 'Partie introuvable (elle a peut-être expiré).',
  'not-manager': "Vous n'êtes pas le créateur de cette partie.",
  'player-not-found': 'Joueur introuvable dans cette partie.',
  'bad-phase': 'Action impossible à cette étape de la partie.',
  // Identification par code e-mail
  'email-invalid': 'Adresse e-mail invalide.',
  'email-not-allowed':
    'Cette adresse n’est pas autorisée : utilisez votre adresse académique.',
  'email-rate-limited':
    'Trop de demandes de code pour cette adresse, patientez un peu.',
  'ip-rate-limited': 'Trop de demandes depuis ce réseau, patientez un peu.',
  cooldown: 'Un code vient d’être envoyé : patientez avant d’en redemander un.',
  'send-failed': 'L’envoi du courriel a échoué, réessayez.',
  'no-pending-code': 'Aucun code en attente pour cette adresse.',
  'code-expired': 'Ce code a expiré : redemandez-en un.',
  'code-invalid': 'Code incorrect.',
  'too-many-attempts': 'Trop d’essais : redemandez un code.',
  // Jointure par PIN (joueurs)
  'pin-unknown': 'PIN inconnu : vérifiez le code auprès de l’enseignant.',
  'room-full': 'Cette partie est complète.',
  'game-started': 'La partie a déjà commencé.',
  'seat-not-found': 'Session introuvable : rejoignez la partie à nouveau.',
  'username-taken': 'Ce pseudo est déjà pris, choisissez-en un autre.',
  'username-not-allowed':
    'Ce prénom n’est pas autorisé pour cette partie : saisis ton prénom (il est vérifié par ton enseignant).',
}

/**
 * Traduit une charge `game:errorMessage` en message affichable :
 * la traduction de la clé si elle est connue, la phrase telle quelle sinon.
 */
export function translateQuizzError(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length === 0) {
    return 'Une erreur est survenue.'
  }
  return ERROR_MESSAGES[raw] ?? raw
}
