import { describe, expect, it } from 'vitest'
import {
  insertMention,
  markSeen,
  mentionQuery,
  mentions,
  readSeen,
  splitMentions,
  suggestMembers,
  unseenMentions,
} from './mentions'

const names = ['Claire B', 'Claire', 'Rémi', 'Lhote Jean-claude']

describe('mentions dans un salon', () => {
  it('reconnaît les noms avec espaces, le plus long d’abord, sans casse', () => {
    expect(splitMentions('Vu avec @claire b et @Rémi.', names)).toEqual([
      { text: 'Vu avec ' },
      { text: '@claire b', mention: 'Claire B' },
      { text: ' et ' },
      { text: '@Rémi', mention: 'Rémi' },
      { text: '.' },
    ])
  })

  it('ignore une adresse courriel, un nom inconnu ou un nom tronqué', () => {
    expect(splitMentions('a@Rémi.ch', names)).toEqual([{ text: 'a@Rémi.ch' }])
    expect(splitMentions('@Paul', names)).toEqual([{ text: '@Paul' }])
    expect(splitMentions('@Rémiz', names)).toEqual([{ text: '@Rémiz' }])
  })

  it('dit si un membre est mentionné', () => {
    expect(mentions('Merci @Lhote Jean-claude !', 'Lhote Jean-claude', names)).toBe(true)
    expect(mentions('Merci @Claire B', 'Claire', names)).toBe(false)
    expect(mentions('Merci @Claire', 'Claire', names)).toBe(true)
  })

  it('suit la mention en cours de saisie et la complète', () => {
    expect(mentionQuery('Bonjour @Cla', 12)).toEqual({ start: 8, query: 'Cla' })
    expect(mentionQuery('mail a@b', 8)).toBeNull()
    expect(mentionQuery('@Rémi\nsuite', 11)).toBeNull()
    expect(suggestMembers('jean', names)).toEqual(['Lhote Jean-claude'])
    expect(suggestMembers('cl', names)).toEqual(['Claire', 'Claire B'])
    expect(insertMention('Bonjour @Cla merci', 8, 12, 'Claire B')).toEqual({
      text: 'Bonjour @Claire B merci',
      caret: 18,
    })
    expect(insertMention('@Ré', 0, 3, 'Rémi')).toEqual({ text: '@Rémi ', caret: 6 })
  })
})

describe('mentions pas encore vues', () => {
  it('compte celles des autres, après la dernière lecture', () => {
    const items = [
      { auteur: 'Rémi', texte: '@Claire regarde', le: '2026-11-08T10:00:00Z' },
      { auteur: 'Claire', texte: '@Claire moi-même', le: '2026-11-08T11:00:00Z' },
      { auteur: 'Rémi', texte: 'sans mention', le: '2026-11-08T12:00:00Z' },
      { auteur: 'Rémi', texte: 'encore @claire', le: '2026-11-08T13:00:00Z' },
    ]
    expect(unseenMentions(items, 'Claire', names).length).toBe(2)
    expect(
      unseenMentions(items, 'Claire', names, '2026-11-08T12:00:00Z').length,
    ).toBe(1)
  })

  it('garde la lecture la plus récente', () => {
    localStorage.clear()
    let seen = markSeen({}, 's1', 'p1', '2026-11-08T12:00:00Z')
    seen = markSeen(seen, 's1', 'p1', '2026-11-08T11:00:00Z')
    expect(seen.s1.p1).toBe('2026-11-08T12:00:00Z')
    expect(readSeen()).toEqual(seen)
  })
})
