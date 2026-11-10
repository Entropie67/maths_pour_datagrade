import { describe, expect, it } from 'vitest'
import { translateQuizzError } from '../../src/lib/quizz/quizzMultiErrors'

describe('traduction des erreurs multi-joueurs', () => {
  it('traduit les clés connues en messages français', () => {
    expect(translateQuizzError('pin-unknown')).toContain('PIN inconnu')
    expect(translateQuizzError('username-taken')).toContain('pseudo')
    expect(translateQuizzError('email-not-allowed')).toContain('académique')
    expect(translateQuizzError('rooms-full')).toContain('trop de parties')
    expect(translateQuizzError('ticket-expired')).toContain('expiré')
    expect(translateQuizzError('game-started')).toContain('déjà commencé')
  })

  it('couvre toutes les clés du protocole', () => {
    const keys = [
      'create-disabled',
      'quota-exceeded',
      'rooms-full',
      'ticket-invalid',
      'ticket-expired',
      'ticket-quiz-mismatch',
      'invalid-payload',
      'game-not-found',
      'not-manager',
      'player-not-found',
      'bad-phase',
      'email-invalid',
      'email-not-allowed',
      'email-rate-limited',
      'ip-rate-limited',
      'cooldown',
      'send-failed',
      'no-pending-code',
      'code-expired',
      'code-invalid',
      'too-many-attempts',
      'pin-unknown',
      'room-full',
      'game-started',
      'seat-not-found',
      'username-taken',
    ]
    for (const key of keys) {
      const translated = translateQuizzError(key)
      // Une clé traduite ne doit pas ressortir telle quelle.
      expect(translated).not.toBe(key)
      expect(translated.length).toBeGreaterThan(0)
    }
  })

  it('affiche telle quelle une phrase française émise par le moteur', () => {
    const phrase = 'Aucun joueur connecté pour démarrer la partie'
    expect(translateQuizzError(phrase)).toBe(phrase)
  })

  it('a un repli pour les charges vides ou non textuelles', () => {
    expect(translateQuizzError('')).toBe('Une erreur est survenue.')
    expect(translateQuizzError(undefined)).toBe('Une erreur est survenue.')
    expect(translateQuizzError(null)).toBe('Une erreur est survenue.')
    expect(translateQuizzError(42)).toBe('Une erreur est survenue.')
  })
})
