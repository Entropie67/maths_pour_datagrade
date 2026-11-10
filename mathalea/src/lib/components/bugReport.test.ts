import { describe, expect, it } from 'vitest'
import {
  buildBugReportDescription,
  buildBugReportTitle,
  buildForgeIssueUrl,
  buildMailtoUrl,
  detectBrowser,
  detectOs,
  formatBugReportDate,
} from './bugReport'

const uaSafari =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15'
const uaChrome =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
const uaFirefox =
  'Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0'
const uaEdge =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0'
const uaChromeAndroid =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const uaSafariIpad =
  'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

describe('detectBrowser', () => {
  it('reconnaît Safari via le token Version/', () => {
    expect(detectBrowser(uaSafari)).toBe('Safari 26.5')
  })
  it('reconnaît Chrome', () => {
    expect(detectBrowser(uaChrome)).toBe('Chrome 140.0.0.0')
  })
  it('reconnaît Firefox', () => {
    expect(detectBrowser(uaFirefox)).toBe('Firefox 142.0')
  })
  it('reconnaît Edge avant Chrome', () => {
    expect(detectBrowser(uaEdge)).toBe('Edge 140.0.0.0')
  })
  it('renvoie inconnu pour un user agent vide', () => {
    expect(detectBrowser('')).toBe('inconnu')
  })
})

describe('detectOs', () => {
  it('reconnaît macOS', () => {
    expect(detectOs(uaSafari)).toBe('macOS')
  })
  it('reconnaît Windows', () => {
    expect(detectOs(uaChrome)).toBe('Windows')
  })
  it('reconnaît Linux', () => {
    expect(detectOs(uaFirefox)).toBe('Linux')
  })
  it('reconnaît Android avant Linux', () => {
    expect(detectOs(uaChromeAndroid)).toBe('Android')
  })
  it('reconnaît iPadOS avant macOS', () => {
    expect(detectOs(uaSafariIpad)).toBe('iPadOS')
  })
})

describe('formatBugReportDate', () => {
  it('formate la date en jj/mm/aaaa', () => {
    expect(formatBugReportDate(new Date(2026, 7, 16))).toBe('16/08/2026')
  })
})

describe('buildBugReportTitle', () => {
  it('associe la référence et le titre de l’exercice', () => {
    expect(
      buildBugReportTitle({
        exerciceId: '3L11',
        exerciceTitle: 'Calcul littéral',
      }),
    ).toBe("Bug dans l'exercice 3L11 : Calcul littéral")
  })
  it('se rabat sur le titre si la référence est absente', () => {
    expect(buildBugReportTitle({ exerciceTitle: 'Calcul littéral' })).toBe(
      "Bug dans l'exercice : Calcul littéral",
    )
  })
  it('se rabat sur la référence si le titre est absent', () => {
    expect(buildBugReportTitle({ exerciceId: '3L11' })).toBe(
      "Bug dans l'exercice : 3L11",
    )
  })
  it('reste générique sans référence ni titre', () => {
    expect(buildBugReportTitle({})).toBe('Bug dans un exercice')
  })
  it('ajoute l’indice (1-based) entre parenthèses quand il est fourni', () => {
    expect(
      buildBugReportTitle({
        exerciceId: '3L11',
        exerciceTitle: 'Calcul littéral',
        exerciceIndex: 1,
      }),
    ).toBe("Bug dans l'exercice 3L11 (ex n°2) : Calcul littéral")
  })
  it('ajoute l’indice pour le premier exercice de la série (n°1)', () => {
    expect(
      buildBugReportTitle({ exerciceId: '3L11', exerciceIndex: 0 }),
    ).toBe("Bug dans l'exercice (ex n°1) : 3L11")
  })
})

describe('buildBugReportDescription', () => {
  it('contient le contexte complet', () => {
    const description = buildBugReportDescription({
      exerciceId: '3L11',
      url: 'https://coopmaths.fr/alea/?uuid=abc',
      userAgent: uaSafari,
      date: new Date(2026, 7, 16),
    })
    expect(description).toContain('## Description du problème')
    expect(description).toContain('- URL : https://coopmaths.fr/alea/?uuid=abc')
    expect(description).toContain('- Exercice : 3L11')
    expect(description).toContain('- Navigateur : Safari 26.5')
    expect(description).toContain('- Système : macOS')
    expect(description).toContain('- Date : 16/08/2026')
  })
  it('ajoute l’URL de l’exercice seul quand elle est fournie', () => {
    const description = buildBugReportDescription({
      url: 'https://coopmaths.fr/alea/?uuid=abc&uuid=def',
      exerciseUrl: 'https://coopmaths.fr/alea/?uuid=def',
    })
    expect(description).toContain(
      "- URL de l'exercice seul : https://coopmaths.fr/alea/?uuid=def",
    )
  })
  it('n’ajoute pas de ligne pour l’exercice seul sans URL dédiée', () => {
    expect(buildBugReportDescription({})).not.toContain('exercice seul')
  })
  it('signale les informations manquantes', () => {
    const description = buildBugReportDescription({})
    expect(description).toContain('- URL : inconnue')
    expect(description).toContain('- Exercice : inconnu')
  })
})

describe('buildMailtoUrl', () => {
  it('encode les espaces sans utiliser le signe +', () => {
    const lien = buildMailtoUrl('Bug dans un exercice', 'Ligne 1\nLigne 2')
    expect(lien.startsWith('mailto:contact@coopmaths.fr?')).toBe(true)
    expect(lien).not.toContain('+')
    expect(lien).toContain('subject=Bug%20dans%20un%20exercice')
    expect(lien).toContain('body=Ligne%201%0ALigne%202')
  })
})

describe('buildForgeIssueUrl', () => {
  it('pré-remplit le titre et la description du ticket', () => {
    const lien = new URL(buildForgeIssueUrl('Titre', 'Description'))
    expect(lien.origin + lien.pathname).toBe(
      'https://forge.apps.education.fr/coopmaths/mathalea/-/issues/new',
    )
    expect(lien.searchParams.get('issue[title]')).toBe('Titre')
    expect(lien.searchParams.get('issue[description]')).toBe('Description')
  })
})
