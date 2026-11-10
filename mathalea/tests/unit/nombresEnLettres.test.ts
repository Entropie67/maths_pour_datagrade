import { describe, expect, test } from 'vitest'
import { partieEntiereEnLettres } from '../../src/modules/nombreEnLettres'

describe('partieEntiereEnLettres', () => {
  describe('Nombres de base (0-99)', () => {
    test('Nombres simples 0-19', () => {
      expect(partieEntiereEnLettres(0)).toBe('zéro')
      expect(partieEntiereEnLettres(1)).toBe('un')
      expect(partieEntiereEnLettres(2)).toBe('deux')
      expect(partieEntiereEnLettres(10)).toBe('dix')
      expect(partieEntiereEnLettres(11)).toBe('onze')
      expect(partieEntiereEnLettres(16)).toBe('seize')
      expect(partieEntiereEnLettres(17)).toBe('dix-sept')
      expect(partieEntiereEnLettres(19)).toBe('dix-neuf')
    })

    test('Dizaines avec "et"', () => {
      expect(partieEntiereEnLettres(21)).toBe('vingt-et-un')
      expect(partieEntiereEnLettres(31)).toBe('trente-et-un')
      expect(partieEntiereEnLettres(41)).toBe('quarante-et-un')
      expect(partieEntiereEnLettres(51)).toBe('cinquante-et-un')
      expect(partieEntiereEnLettres(61)).toBe('soixante-et-un')
      expect(partieEntiereEnLettres(71)).toBe('soixante-et-onze')
    })

    test('Nombres 70-79 (soixante-dix)', () => {
      expect(partieEntiereEnLettres(70)).toBe('soixante-dix')
      expect(partieEntiereEnLettres(71)).toBe('soixante-et-onze')
      expect(partieEntiereEnLettres(72)).toBe('soixante-douze')
      expect(partieEntiereEnLettres(77)).toBe('soixante-dix-sept')
      expect(partieEntiereEnLettres(79)).toBe('soixante-dix-neuf')
    })

    test('Nombres 80-99 (quatre-vingt)', () => {
      expect(partieEntiereEnLettres(80)).toBe('quatre-vingts')
      expect(partieEntiereEnLettres(81)).toBe('quatre-vingt-un')
      expect(partieEntiereEnLettres(90)).toBe('quatre-vingt-dix')
      expect(partieEntiereEnLettres(91)).toBe('quatre-vingt-onze')
      expect(partieEntiereEnLettres(99)).toBe('quatre-vingt-dix-neuf')
    })
  })

  describe('Centaines', () => {
    test('Cent simple', () => {
      expect(partieEntiereEnLettres(100)).toBe('cent')
      expect(partieEntiereEnLettres(101)).toBe('cent-un')
      expect(partieEntiereEnLettres(180)).toBe('cent-quatre-vingts')
      expect(partieEntiereEnLettres(181)).toBe('cent-quatre-vingt-un')
    })

    test('Cents au pluriel', () => {
      expect(partieEntiereEnLettres(200)).toBe('deux-cents')
      expect(partieEntiereEnLettres(300)).toBe('trois-cents')
      expect(partieEntiereEnLettres(800)).toBe('huit-cents')
      expect(partieEntiereEnLettres(900)).toBe('neuf-cents')
    })

    test('Cent sans "s" quand suivi', () => {
      expect(partieEntiereEnLettres(201)).toBe('deux-cent-un')
      expect(partieEntiereEnLettres(301)).toBe('trois-cent-un')
      expect(partieEntiereEnLettres(821)).toBe('huit-cent-vingt-et-un')
      expect(partieEntiereEnLettres(999)).toBe(
        'neuf-cent-quatre-vingt-dix-neuf',
      )
    })
  })

  describe('Milliers', () => {
    test('Mille simple', () => {
      expect(partieEntiereEnLettres(1000)).toBe('mille')
      expect(partieEntiereEnLettres(1001)).toBe('mille-un')
      expect(partieEntiereEnLettres(1100)).toBe('mille-cent')
      expect(partieEntiereEnLettres(1980)).toBe('mille-neuf-cent-quatre-vingts')
    })

    test('Milliers avec préfixe', () => {
      expect(partieEntiereEnLettres(2000)).toBe('deux-mille')
      expect(partieEntiereEnLettres(3000)).toBe('trois-mille')
      expect(partieEntiereEnLettres(10000)).toBe('dix-mille')
      expect(partieEntiereEnLettres(80000)).toBe('quatre-vingt-mille')
    })

    test('Milliers avec centaines - règle du "cent"', () => {
      expect(partieEntiereEnLettres(200000)).toBe('deux-cent-mille')
      expect(partieEntiereEnLettres(300000)).toBe('trois-cent-mille')
      expect(partieEntiereEnLettres(800000)).toBe('huit-cent-mille')
      expect(partieEntiereEnLettres(900000)).toBe('neuf-cent-mille')
    })

    test('Cas complexes des milliers', () => {
      expect(partieEntiereEnLettres(1234)).toBe('mille-deux-cent-trente-quatre')
      expect(partieEntiereEnLettres(21000)).toBe('vingt-et-un-mille')
      expect(partieEntiereEnLettres(71000)).toBe('soixante-et-onze-mille')
      expect(partieEntiereEnLettres(80001)).toBe('quatre-vingt-mille-un')
      expect(partieEntiereEnLettres(200080)).toBe(
        'deux-cent-mille-quatre-vingts',
      )
    })
  })

  describe('Millions', () => {
    test('Million singulier', () => {
      expect(partieEntiereEnLettres(1000000)).toBe('un-million')
      expect(partieEntiereEnLettres(1000001)).toBe('un-million-un')
      expect(partieEntiereEnLettres(1001000)).toBe('un-million-mille')
    })

    test('Millions pluriel', () => {
      expect(partieEntiereEnLettres(2000000)).toBe('deux-millions')
      expect(partieEntiereEnLettres(3000000)).toBe('trois-millions')
      expect(partieEntiereEnLettres(10000000)).toBe('dix-millions')
    })

    test('Millions avec compléments', () => {
      expect(partieEntiereEnLettres(2500000)).toBe(
        'deux-millions-cinq-cent-mille',
      )
      expect(partieEntiereEnLettres(1234567)).toBe(
        'un-million-deux-cent-trente-quatre-mille-cinq-cent-soixante-sept',
      )
    })
  })

  describe('Milliards', () => {
    test('Milliard singulier', () => {
      expect(partieEntiereEnLettres(1000000000)).toBe('un-milliard')
      expect(partieEntiereEnLettres(1000000001)).toBe('un-milliard-un')
    })

    test('Milliards pluriel', () => {
      expect(partieEntiereEnLettres(2000000000)).toBe('deux-milliards')
      expect(partieEntiereEnLettres(5000000000)).toBe('cinq-milliards')
    })

    test('Milliards avec compléments', () => {
      expect(partieEntiereEnLettres(1234567890)).toBe(
        'un-milliard-deux-cent-trente-quatre-millions-cinq-cent-soixante-sept-mille-huit-cent-quatre-vingt-dix',
      )
    })
  })

  describe('Cas limites et zéros', () => {
    test('Zéros en positions intermédiaires', () => {
      expect(partieEntiereEnLettres(1001)).toBe('mille-un')
      expect(partieEntiereEnLettres(1010)).toBe('mille-dix')
      expect(partieEntiereEnLettres(1100)).toBe('mille-cent')
      expect(partieEntiereEnLettres(10001)).toBe('dix-mille-un')
      expect(partieEntiereEnLettres(100001)).toBe('cent-mille-un')
      expect(partieEntiereEnLettres(1000001)).toBe('un-million-un')
    })

    test('Nombres avec plusieurs classes à zéro', () => {
      expect(partieEntiereEnLettres(1000100)).toBe('un-million-cent')
      expect(partieEntiereEnLettres(2000005)).toBe('deux-millions-cinq')
      expect(partieEntiereEnLettres(1000000001)).toBe('un-milliard-un')
    })
  })

  describe('Règles orthographiques spécifiques', () => {
    test('Quatre-vingt avec et sans "s"', () => {
      expect(partieEntiereEnLettres(80)).toBe('quatre-vingts')
      expect(partieEntiereEnLettres(81)).toBe('quatre-vingt-un')
      expect(partieEntiereEnLettres(180)).toBe('cent-quatre-vingts')
      expect(partieEntiereEnLettres(181)).toBe('cent-quatre-vingt-un')
      expect(partieEntiereEnLettres(280)).toBe('deux-cent-quatre-vingts')
      expect(partieEntiereEnLettres(281)).toBe('deux-cent-quatre-vingt-un')
      expect(partieEntiereEnLettres(80000)).toBe('quatre-vingt-mille')
    })

    test('Utilisation de "et" uniquement pour 21, 31, 41, 51, 61, 71', () => {
      expect(partieEntiereEnLettres(22)).toBe('vingt-deux')
      expect(partieEntiereEnLettres(32)).toBe('trente-deux')
      expect(partieEntiereEnLettres(81)).toBe('quatre-vingt-un')
      expect(partieEntiereEnLettres(91)).toBe('quatre-vingt-onze')
    })

    test('Cents dans les milliers', () => {
      expect(partieEntiereEnLettres(200000)).toBe('deux-cent-mille')
      expect(partieEntiereEnLettres(300000)).toBe('trois-cent-mille')
      expect(partieEntiereEnLettres(400000)).toBe('quatre-cent-mille')
      expect(partieEntiereEnLettres(500000)).toBe('cinq-cent-mille')
      expect(partieEntiereEnLettres(600000)).toBe('six-cent-mille')
      expect(partieEntiereEnLettres(700000)).toBe('sept-cent-mille')
      expect(partieEntiereEnLettres(800000)).toBe('huit-cent-mille')
      expect(partieEntiereEnLettres(900000)).toBe('neuf-cent-mille')
    })
  })

  describe('Nombres très grands', () => {
    test('Grands nombres avec toutes les classes', () => {
      expect(partieEntiereEnLettres(999999999999)).toBe(
        'neuf-cent-quatre-vingt-dix-neuf-milliards-neuf-cent-quatre-vingt-dix-neuf-millions-neuf-cent-quatre-vingt-dix-neuf-mille-neuf-cent-quatre-vingt-dix-neuf',
      )
    })

    test('Nombres avec alternance de classes nulles et non nulles', () => {
      expect(partieEntiereEnLettres(101000000001)).toBe('cent-un-milliards-un')
      expect(partieEntiereEnLettres(1000001000)).toBe('un-milliard-mille')
    })
  })

  describe('Nombres avec centaines dans les grandes unités', () => {
    test('Centaines de millions', () => {
      expect(partieEntiereEnLettres(200000000)).toBe('deux-cents-millions')
      expect(partieEntiereEnLettres(300000000)).toBe('trois-cents-millions')
      expect(partieEntiereEnLettres(400000000)).toBe('quatre-cents-millions')
      expect(partieEntiereEnLettres(500000000)).toBe('cinq-cents-millions')
      expect(partieEntiereEnLettres(600000000)).toBe('six-cents-millions')
      expect(partieEntiereEnLettres(700000000)).toBe('sept-cents-millions')
      expect(partieEntiereEnLettres(800000000)).toBe('huit-cents-millions')
      expect(partieEntiereEnLettres(900000000)).toBe('neuf-cents-millions')
    })

    test('Centaines de millions avec compléments', () => {
      expect(partieEntiereEnLettres(201000000)).toBe('deux-cent-un-millions')
      expect(partieEntiereEnLettres(280000000)).toBe(
        'deux-cent-quatre-vingts-millions',
      )
      expect(partieEntiereEnLettres(321000000)).toBe(
        'trois-cent-vingt-et-un-millions',
      )
      expect(partieEntiereEnLettres(456789000)).toBe(
        'quatre-cent-cinquante-six-millions-sept-cent-quatre-vingt-neuf-mille',
      )
      expect(partieEntiereEnLettres(800001000)).toBe(
        'huit-cents-millions-mille',
      )
      expect(partieEntiereEnLettres(900000001)).toBe('neuf-cents-millions-un')
    })

    test('Centaines de milliards', () => {
      expect(partieEntiereEnLettres(200000000000)).toBe('deux-cents-milliards')
      expect(partieEntiereEnLettres(300000000000)).toBe('trois-cents-milliards')
      expect(partieEntiereEnLettres(400000000000)).toBe(
        'quatre-cents-milliards',
      )
      expect(partieEntiereEnLettres(500000000000)).toBe('cinq-cents-milliards')
      expect(partieEntiereEnLettres(600000000000)).toBe('six-cents-milliards')
      expect(partieEntiereEnLettres(700000000000)).toBe('sept-cents-milliards')
      expect(partieEntiereEnLettres(800000000000)).toBe('huit-cents-milliards')
      expect(partieEntiereEnLettres(900000000000)).toBe('neuf-cents-milliards')
    })

    test('Centaines de milliards avec compléments', () => {
      expect(partieEntiereEnLettres(201000000000)).toBe(
        'deux-cent-un-milliards',
      )
      expect(partieEntiereEnLettres(280000000000)).toBe(
        'deux-cent-quatre-vingts-milliards',
      )
      expect(partieEntiereEnLettres(321000000000)).toBe(
        'trois-cent-vingt-et-un-milliards',
      )
      expect(partieEntiereEnLettres(456000000000)).toBe(
        'quatre-cent-cinquante-six-milliards',
      )
      expect(partieEntiereEnLettres(800001000000)).toBe(
        'huit-cents-milliards-un-million',
      )
      expect(partieEntiereEnLettres(900000001000)).toBe(
        'neuf-cents-milliards-mille',
      )
      expect(partieEntiereEnLettres(700000000001)).toBe(
        'sept-cents-milliards-un',
      )
    })

    test('Combinaisons complexes avec centaines dans différentes unités', () => {
      expect(partieEntiereEnLettres(234567890123)).toBe(
        'deux-cent-trente-quatre-milliards-cinq-cent-soixante-sept-millions-huit-cent-quatre-vingt-dix-mille-cent-vingt-trois',
      )
      expect(partieEntiereEnLettres(800200300400)).toBe(
        'huit-cents-milliards-deux-cents-millions-trois-cent-mille-quatre-cents',
      )
      expect(partieEntiereEnLettres(900800700600)).toBe(
        'neuf-cents-milliards-huit-cents-millions-sept-cent-mille-six-cents',
      )
      expect(partieEntiereEnLettres(500400300200)).toBe(
        'cinq-cents-milliards-quatre-cents-millions-trois-cent-mille-deux-cents',
      )
    })

    test('Règles du "cent" dans les grandes unités', () => {
      // Cent au pluriel quand il termine l'unité
      expect(partieEntiereEnLettres(300000000)).toBe('trois-cents-millions')
      expect(partieEntiereEnLettres(800000000000)).toBe('huit-cents-milliards')

      // Cent sans "s" quand il est suivi
      expect(partieEntiereEnLettres(301000000)).toBe('trois-cent-un-millions')
      expect(partieEntiereEnLettres(801000000000)).toBe(
        'huit-cent-un-milliards',
      )
      expect(partieEntiereEnLettres(321456789000)).toBe(
        'trois-cent-vingt-et-un-milliards-quatre-cent-cinquante-six-millions-sept-cent-quatre-vingt-neuf-mille',
      )
    })

    test('Quatre-vingt dans les grandes unités', () => {
      expect(partieEntiereEnLettres(80000000)).toBe('quatre-vingts-millions')
      expect(partieEntiereEnLettres(180000000)).toBe(
        'cent-quatre-vingts-millions',
      )
      expect(partieEntiereEnLettres(280000000)).toBe(
        'deux-cent-quatre-vingts-millions',
      )
      expect(partieEntiereEnLettres(380000000)).toBe(
        'trois-cent-quatre-vingts-millions',
      )

      expect(partieEntiereEnLettres(80000000000)).toBe(
        'quatre-vingts-milliards',
      )
      expect(partieEntiereEnLettres(180000000000)).toBe(
        'cent-quatre-vingts-milliards',
      )
      expect(partieEntiereEnLettres(280000000000)).toBe(
        'deux-cent-quatre-vingts-milliards',
      )
      expect(partieEntiereEnLettres(480000000000)).toBe(
        'quatre-cent-quatre-vingts-milliards',
      )
    })

    test('Zéros intercalaires avec centaines dans les grandes unités', () => {
      expect(partieEntiereEnLettres(200000000001)).toBe(
        'deux-cents-milliards-un',
      )
      expect(partieEntiereEnLettres(300000001000)).toBe(
        'trois-cents-milliards-mille',
      )
      expect(partieEntiereEnLettres(400001000000)).toBe(
        'quatre-cents-milliards-un-million',
      )
      expect(partieEntiereEnLettres(500000000000)).toBe('cinq-cents-milliards')

      expect(partieEntiereEnLettres(200000001)).toBe('deux-cents-millions-un')
      expect(partieEntiereEnLettres(300001000)).toBe(
        'trois-cents-millions-mille',
      )
      expect(partieEntiereEnLettres(800000000)).toBe('huit-cents-millions')
    })
  })
  describe('Validation contre les erreurs courantes', () => {
    test('Pas de double tirets', () => {
      const result = partieEntiereEnLettres(1234)
      expect(result).not.toMatch(/--/)
    })

    test('Pas de tirets en début ou fin', () => {
      const testNumbers = [1, 10, 100, 1000, 10000, 100000, 1000000]
      testNumbers.forEach((num) => {
        const result = partieEntiereEnLettres(num)
        expect(result).not.toMatch(/^-/)
        expect(result).not.toMatch(/-$/)
      })
    })

    test('Cohérence des espaces et tirets', () => {
      const result = partieEntiereEnLettres(123456)
      expect(result).not.toMatch(/ /)
      expect(result).toMatch(/^[a-zéèêë-]+$/)
    })
  })
})
