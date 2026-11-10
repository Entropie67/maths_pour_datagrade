import { describe, expect, it, vi } from 'vitest'
import {
  cribleEratostheneN,
  decompositionFacteursPremiers,
  decompositionFacteursPremiersArray,
  estPremier,
  lignesDecompositionFacteursPremiers,
  factorisation,
  gcd,
  gcdMultiple,
  listeDesDiviseurs,
  listeNombresPremiersStrictJusqua,
  obtenirListeFacteursPremiers,
  obtenirListeNombresPremiers,
  obtenirSemiPremier,
  pgcd,
  texCalculDecomposition,
  ppcm,
  ppcmListe,
  premierAvec,
  premierMultipleInferieur,
  premierMultipleSuperieur,
  premiersEntreBornes,
  texFactorisation,
} from '../../src/lib/outils/primalite'

declare global {
  interface Window {
    notify: (...args: any[]) => void
  }
}

// Mock de window.notify
global.window = {
  notify: vi.fn(),
} as any

describe('Fonctions de base GCD/PGCD', () => {
  describe('gcd', () => {
    it('devrait calculer le PGCD de deux nombres positifs', () => {
      expect(gcd(12, 8)).toBe(4)
      expect(gcd(15, 25)).toBe(5)
      expect(gcd(7, 13)).toBe(1)
    })

    it('devrait gérer les nombres négatifs', () => {
      expect(gcd(-12, 8)).toBe(4)
      expect(gcd(12, -8)).toBe(4)
      expect(gcd(-12, -8)).toBe(4)
    })

    it('devrait gérer les cas avec zéro', () => {
      expect(gcd(0, 5)).toBe(5)
      expect(gcd(5, 0)).toBe(5)
      expect(gcd(0, 0)).toBe(0)
    })
  })

  describe('gcdMultiple', () => {
    it('devrait calculer le PGCD de plusieurs nombres', () => {
      expect(gcdMultiple(12, 18, 24)).toBe(6)
      expect(gcdMultiple(15, 25, 35)).toBe(5)
    })

    it('devrait gérer les cas limites', () => {
      expect(gcdMultiple()).toBe(0)
      expect(gcdMultiple(42)).toBe(42)
      expect(gcdMultiple(-42)).toBe(42)
    })
  })

  describe('pgcd', () => {
    it('devrait être un alias de gcdMultiple', () => {
      expect(pgcd(12, 18, 24)).toBe(6)
      expect(pgcd(15, 25)).toBe(5)
    })
  })
})

describe('Fonctions PPCM', () => {
  describe('ppcm', () => {
    it('devrait calculer le PPCM de deux nombres', () => {
      expect(ppcm(4, 6)).toBe(12)
      expect(ppcm(15, 25)).toBe(75)
      expect(ppcm(7, 13)).toBe(91)
    })

    it('devrait gérer les cas avec zéro', () => {
      expect(ppcm(0, 5)).toBe(0)
      expect(ppcm(5, 0)).toBe(0)
    })

    it('devrait gérer les nombres négatifs', () => {
      expect(ppcm(-4, 6)).toBe(12)
      expect(ppcm(4, -6)).toBe(12)
    })
  })

  describe('ppcmListe', () => {
    it("devrait calculer le PPCM d'une liste de nombres", () => {
      expect(ppcmListe([4, 6, 8])).toBe(24)
      expect(ppcmListe([2, 3, 5])).toBe(30)
    })

    it('devrait gérer les cas limites', () => {
      expect(ppcmListe([])).toBe(0)
      expect(ppcmListe([42])).toBe(42)
      expect(ppcmListe([-42])).toBe(42)
    })
  })
})

describe('Factorisation et nombres premiers', () => {
  describe('obtenirListeFacteursPremiers', () => {
    it('devrait décomposer correctement les nombres en facteurs premiers', () => {
      expect(obtenirListeFacteursPremiers(12)).toEqual([2, 2, 3])
      expect(obtenirListeFacteursPremiers(30)).toEqual([2, 3, 5])
      expect(obtenirListeFacteursPremiers(17)).toEqual([17])
    })

    it('devrait gérer les cas limites', () => {
      expect(obtenirListeFacteursPremiers(0)).toEqual([])
      expect(obtenirListeFacteursPremiers(1)).toEqual([])
    })

    it('devrait gérer les nombres négatifs', () => {
      expect(obtenirListeFacteursPremiers(-12)).toEqual([-2, 2, 3])
    })
  })

  describe('factorisation', () => {
    it('devrait retourner la factorisation avec exposants', () => {
      expect(factorisation(12)).toEqual([
        [2, 2],
        [3, 1],
      ])
      expect(factorisation(72)).toEqual([
        [2, 3],
        [3, 2],
      ])
      expect(factorisation(17)).toEqual([[17, 1]])
    })

    it('devrait gérer le cas n = 1', () => {
      expect(factorisation(1)).toEqual([[1, 1]])
    })
  })

  describe('texFactorisation', () => {
    it('devrait générer le texte LaTeX avec puissances', () => {
      expect(texFactorisation(12)).toBe('2^{2}\\times 3')
      expect(texFactorisation(8)).toBe('2^{3}')
      expect(texFactorisation(17)).toBe('17')
    })

    it('devrait générer le texte LaTeX sans puissances', () => {
      expect(texFactorisation(12, false)).toBe('2\\times 2\\times 3')
      expect(texFactorisation(17, false)).toBe('17')
    })
  })

  describe('estPremier', () => {
    it('devrait identifier correctement les nombres premiers', () => {
      expect(estPremier(2)).toBe(true)
      expect(estPremier(3)).toBe(true)
      expect(estPremier(17)).toBe(true)
      expect(estPremier(97)).toBe(true)
    })

    it('devrait identifier correctement les nombres non premiers', () => {
      expect(estPremier(1)).toBe(false)
      expect(estPremier(4)).toBe(false)
      expect(estPremier(15)).toBe(false)
      expect(estPremier(100)).toBe(false)
    })

    it('devrait gérer les cas limites', () => {
      expect(estPremier(0)).toBe(false)
      expect(estPremier(-5)).toBe(false)
      expect(estPremier(1.5)).toBe(false)
    })
  })
})

describe('Diviseurs', () => {
  describe('listeDesDiviseurs', () => {
    it("devrait lister tous les diviseurs d'un nombre", () => {
      expect(listeDesDiviseurs(12)).toEqual([1, 2, 3, 4, 6, 12])
      expect(listeDesDiviseurs(17)).toEqual([1, 17])
      expect(listeDesDiviseurs(1)).toEqual([1])
    })

    it('devrait gérer les nombres plus grands', () => {
      expect(listeDesDiviseurs(30)).toEqual([1, 2, 3, 5, 6, 10, 15, 30])
    })
  })
})

describe('Multiples', () => {
  describe('premierMultipleSuperieur', () => {
    it('devrait trouver le premier multiple supérieur ou égal', () => {
      expect(premierMultipleSuperieur(5, 12)).toBe(15)
      expect(premierMultipleSuperieur(3, 9)).toBe(9)
      expect(premierMultipleSuperieur(7, 20)).toBe(21)
    })

    it('devrait gérer les nombres décimaux', () => {
      expect(premierMultipleSuperieur(2.5, 7)).toBe(7.5)
      expect(premierMultipleSuperieur(1.5, 4)).toBe(4.5)
    })
  })

  describe('premierMultipleInferieur', () => {
    it('devrait trouver le premier multiple inférieur ou égal', () => {
      expect(premierMultipleInferieur(5, 12)).toBe(10)
      expect(premierMultipleInferieur(3, 9)).toBe(9)
      expect(premierMultipleInferieur(7, 20)).toBe(14)
    })
  })
})

describe('Listes de nombres premiers', () => {
  describe('listeNombresPremiersStrictJusqua', () => {
    it('devrait retourner les premiers inférieurs à la borne', () => {
      const premiers10 = listeNombresPremiersStrictJusqua(10)
      expect(premiers10).toEqual([2, 3, 5, 7])

      const premiers20 = listeNombresPremiersStrictJusqua(20)
      expect(premiers20).toEqual([2, 3, 5, 7, 11, 13, 17, 19])
    })

    it('devrait gérer les petites bornes', () => {
      expect(listeNombresPremiersStrictJusqua(2)).toEqual([])
      expect(listeNombresPremiersStrictJusqua(3)).toEqual([2])
    })
  })

  describe('cribleEratostheneN', () => {
    it('devrait générer les nombres premiers avec le crible', () => {
      expect(cribleEratostheneN(10)).toEqual([2, 3, 5, 7])
      expect(cribleEratostheneN(20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19])
    })

    it('devrait gérer les petites valeurs', () => {
      expect(cribleEratostheneN(1)).toEqual([])
      expect(cribleEratostheneN(2)).toEqual([2])
    })
  })

  describe('premiersEntreBornes', () => {
    it('devrait retourner les premiers entre deux bornes incluses', () => {
      expect(premiersEntreBornes(10, 20)).toEqual([11, 13, 17, 19])
      expect(premiersEntreBornes(2, 10)).toEqual([2, 3, 5, 7])
    })

    it('devrait gérer les bornes égales', () => {
      expect(premiersEntreBornes(7, 7)).toEqual([7])
      expect(premiersEntreBornes(8, 8)).toEqual([])
    })
  })

  describe('obtenirListeNombresPremiers', () => {
    it("devrait retourner les premiers jusqu'à 300 par défaut", () => {
      const premiers = obtenirListeNombresPremiers()
      expect(premiers[0]).toBe(2)
      expect(premiers[1]).toBe(3)
      expect(premiers[2]).toBe(5)
    })

    it('devrait étendre la liste au-delà de 300', () => {
      const premiers = obtenirListeNombresPremiers(310)
      expect(premiers).toContain(307)
    })
  })
})

describe('Semi-premiers', () => {
  describe('obtenirSemiPremier', () => {
    it('devrait retourner un nombre semi-premier valide', () => {
      const semiPremier = obtenirSemiPremier(50)
      expect(semiPremier).toBeGreaterThan(0)
      expect(semiPremier).toBeLessThanOrEqual(50)

      // Vérifier que c'est bien un semi-premier (produit de deux premiers distincts)
      const facteurs = obtenirListeFacteursPremiers(semiPremier)
      expect(facteurs).toHaveLength(2)
      expect(estPremier(facteurs[0])).toBe(true)
      expect(estPremier(facteurs[1])).toBe(true)
      expect(facteurs[0]).not.toBe(facteurs[1])
    })

    it('devrait appeler window.notify si aucun semi-premier trouvé', () => {
      obtenirSemiPremier(5) // Trop petit pour avoir des semi-premiers
      expect(window.notify).toHaveBeenCalled()
    })
  })
})

describe('Décomposition et affichage', () => {
  describe('decompositionFacteursPremiersArray', () => {
    it('devrait retourner la décomposition sous forme de tableau', () => {
      expect(decompositionFacteursPremiersArray(12)).toEqual([2, 2, 3])
      expect(decompositionFacteursPremiersArray(17)).toEqual([17])
    })
  })

  describe('decompositionFacteursPremiers', () => {
    it('devrait générer le code LaTeX de décomposition', () => {
      expect(decompositionFacteursPremiers(12)).toBe('2\\times2\\times3')
      expect(decompositionFacteursPremiers(17)).toBe('17')
    })

    it('devrait gérer les nombres négatifs', () => {
      expect(decompositionFacteursPremiers(-12)).toBe('(-2)\\times2\\times3')
    })

    it('devrait gérer le cas n = 1 et n = -1', () => {
      expect(decompositionFacteursPremiers(1)).toBe(1)
      expect(decompositionFacteursPremiers(-1)).toBe(-1)
    })
  })
})

describe('Recherche de nombres premiers avec contraintes', () => {
  describe('premierAvec', () => {
    it('devrait trouver un nombre premier avec n (PGCD = 1)', () => {
      const resultat = premierAvec(15) // 15 = 3 × 5
      expect(resultat).toBeGreaterThanOrEqual(2)
      expect(pgcd(15, resultat)).toBe(1)
    })

    it('devrait trouver un nombre premier avec n en partant de n+1', () => {
      const resultat = premierAvec(15, [], false)
      expect(resultat).toBeGreaterThan(15)
      expect(pgcd(15, resultat)).toBe(1)
    })

    it('devrait éviter les nombres de la liste à éviter', () => {
      const resultat = premierAvec(15, [2, 7])
      expect(resultat).toBeGreaterThanOrEqual(2)
      expect(resultat).not.toBe(2)
      expect(resultat).not.toBe(7)
      expect(pgcd(15, resultat)).toBe(1)
    })

    it('devrait lever une erreur pour n < 2', () => {
      expect(() => premierAvec(1)).toThrow(
        'Impossible de trouver un nombre premier avec 1',
      )
      expect(() => premierAvec(0)).toThrow(
        'Impossible de trouver un nombre premier avec 0',
      )
      expect(() => premierAvec(-5)).toThrow(
        'Impossible de trouver un nombre premier avec -5',
      )
    })
  })
})

describe('Tests de cohérence entre fonctions', () => {
  it('devrait avoir une cohérence entre factorisation et obtenirListeFacteursPremiers', () => {
    const testNumbers = [12, 30, 72, 100, 17]

    testNumbers.forEach((n) => {
      const facto = factorisation(n)

      // Reconstruire le nombre à partir de la factorisation
      let produit = 1
      facto.forEach(([base, exp]) => {
        produit *= Math.pow(base, exp)
      })

      expect(produit).toBe(n)
    })
  })

  it('devrait avoir une cohérence entre pgcd et ppcm', () => {
    const testPairs = [
      [12, 18],
      [15, 25],
      [7, 13],
    ]

    testPairs.forEach(([a, b]) => {
      const pgcdResult = pgcd(a, b)
      const ppcmResult = ppcm(a, b)

      // Propriété : PGCD(a,b) × PPCM(a,b) = a × b
      expect(pgcdResult * ppcmResult).toBe(a * b)
    })
  })

  it('devrait avoir une cohérence entre les générateurs de nombres premiers', () => {
    const borne = 50
    const liste1 = listeNombresPremiersStrictJusqua(borne)
    const liste2 = cribleEratostheneN(borne - 1)

    expect(liste1).toEqual(liste2)
  })
})

describe('lignesDecompositionFacteursPremiers', () => {
  it('ne met un produit de facteurs premiers que sur la dernière ligne', () => {
    for (const n of [6, 12, 36, 64, 360, 630, 1001, 2310, 5040]) {
      const lignes = lignesDecompositionFacteursPremiers(n)
      for (const ligne of lignes.slice(0, -1)) {
        const facteurs = ligne.split('\\times ').map(Number)
        expect(facteurs.every(estPremier)).toBe(false)
        expect(facteurs.reduce((a, b) => a * b, 1)).toBe(n)
      }
      expect(lignes.at(-1)).toBe(texFactorisation(n))
    }
  })

  it('donne les étapes de 360 et de 12 sans puissances', () => {
    expect(lignesDecompositionFacteursPremiers(360)).toEqual([
      '18\\times 20',
      '3\\times 6\\times 4\\times 5',
      '2^{3}\\times 3^{2}\\times 5',
    ])
    expect(lignesDecompositionFacteursPremiers(12, false)).toEqual([
      '3\\times 4',
      '2\\times 2\\times 3',
    ])
  })

  it('renvoie le nombre lui-même pour un nombre premier ou 1', () => {
    expect(lignesDecompositionFacteursPremiers(13)).toEqual(['13'])
    expect(lignesDecompositionFacteursPremiers(1)).toEqual(['1'])
  })
})

describe('texCalculDecomposition', () => {
  it('écrit une égalité par ligne, avec le nom au début', () => {
    const texte = texCalculDecomposition(1260, { nom: 'A' })
    const lignes = texte.split('<br>')
    expect(lignes[0]).toMatch(/^\$A = 1\\,260 = /)
    expect(lignes.every((l) => l.startsWith('$A = '))).toBe(true)
    expect(lignes.at(-1)).toContain('2^{2}\\times 3^{2}\\times 5\\times 7')
  })
})
