import { describe, expect, it } from 'vitest'
import {
  coverDatePickerValue,
  coverDateToIso,
  formatCoverDate,
  isoToCoverDate,
  todayIso,
} from './coverDate'

describe('date de la page de garde « Récitation »', () => {
  it('écrit la date de la fiche en jj.mm.aa', () => {
    expect(formatCoverDate(new Date(2024, 8, 2))).toBe('02.09.24')
    expect(formatCoverDate(new Date(2026, 11, 31))).toBe('31.12.26')
  })

  it('convertit la date de la fiche en valeur ISO du sélecteur', () => {
    expect(coverDateToIso('02.09.24')).toBe('2024-09-02')
    expect(coverDateToIso('2/9/2024')).toBe('2024-09-02')
    expect(coverDateToIso('02-09-2024')).toBe('2024-09-02')
  })

  it('laisse le sélecteur vide pour un texte libre ou une date inexistante', () => {
    expect(coverDateToIso('Juin 2026')).toBe('')
    expect(coverDateToIso('31.02.24')).toBe('')
    expect(coverDateToIso('')).toBe('')
  })

  it('ouvre le sélecteur sur la date du champ, ou sur aujourd’hui', () => {
    expect(coverDatePickerValue('02.09.24')).toBe('2024-09-02')
    // texte libre ou champ vide : le sélecteur s'ouvre sur aujourd'hui
    expect(coverDatePickerValue('Juin 2026')).toBe(todayIso())
    expect(coverDatePickerValue('')).toBe(todayIso())
    expect(coverDateToIso(isoToCoverDate(todayIso()))).toBe(todayIso())
  })

  it('fait l’aller-retour avec le sélecteur', () => {
    expect(isoToCoverDate('2024-09-02')).toBe('02.09.24')
    expect(isoToCoverDate('')).toBe('')
    expect(coverDateToIso(isoToCoverDate('2026-01-05'))).toBe('2026-01-05')
  })
})
