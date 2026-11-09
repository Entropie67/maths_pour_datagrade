import { describe, expect, it } from 'vitest'
import {
  combinaisonsParametres,
  empreinteTirage,
  exercicesAControler,
  grainePourUuid,
  installeGardeDeBoucle,
  nombresAffiches,
  normaliseTexte,
  partieNombres,
  partieTexte,
  selectionComplete,
  texteAffiche,
  valeursParametre,
} from '../e2e/helpers/empreinteExercice'

describe('texteAffiche', () => {
  it('supprime les balises mais garde le contenu des étiquettes de figure', () => {
    const svg =
      '<svg width="300" height="200"><line x1="12.5" y1="3" x2="40" y2="7"/><text x="18.2" y="9">5,4</text></svg>'
    expect(texteAffiche(svg)).toBe('5,4')
  })

  it('supprime les commentaires et normalise les espaces', () => {
    expect(texteAffiche('<!-- 42 -->Calculer   $3+4$')).toBe('Calculer $3+4$')
  })
})

describe('nombresAffiches', () => {
  it("relève les nombres de l'énoncé dans l'ordre", () => {
    expect(nombresAffiches('Calculer $12 \\times 7$ puis $3,5 + 1$')).toEqual([
      '12',
      '7',
      '3.5',
      '1',
    ])
  })

  it('ignore les coordonnées des figures', () => {
    const avant = '<svg><circle cx="17.3" cy="4"/><text>8</text></svg>'
    const apres = '<svg><circle cx="99.9" cy="2"/><text>8</text></svg>'
    expect(nombresAffiches(avant)).toEqual(nombresAffiches(apres))
  })

  it('normalise la virgule décimale et les zéros inutiles', () => {
    expect(nombresAffiches('3,50')).toEqual(nombresAffiches('3.5'))
  })

  it('tient compte du signe', () => {
    expect(nombresAffiches('$-7$')).toEqual(['-7'])
    expect(nombresAffiches('$-7$')).not.toEqual(nombresAffiches('$7$'))
  })

  it("n'est pas sensible aux espaces autour du signe", () => {
    expect(nombresAffiches('$12-4$')).toEqual(nombresAffiches('$12 - 4$'))
  })
})

describe('normaliseTexte', () => {
  it("ignore la casse et les commandes d'espacement LaTeX", () => {
    expect(normaliseTexte('Calculer\\quad $2+2$')).toBe(
      normaliseTexte('calculer $2+2$'),
    )
  })
})

describe('grainePourUuid', () => {
  it('donne une graine reproductible et propre à chaque exercice', () => {
    expect(grainePourUuid('2359a')).toBe(grainePourUuid('2359a'))
    expect(grainePourUuid('2359a')).not.toBe(grainePourUuid('e528e'))
  })
})

describe('empreinteTirage', () => {
  it("change quand les valeurs de l'énoncé changent", () => {
    const a = empreinteTirage(['Calculer $12+7$'], ['$19$'])
    const b = empreinteTirage(['Calculer $13+7$'], ['$20$'])
    expect(partieNombres(a)).not.toBe(partieNombres(b))
  })

  it('ne change pas quand seule une coquille est corrigée', () => {
    const a = empreinteTirage(['Calculer $12+7$'], ['$19$'])
    const b = empreinteTirage(['Calculez $12+7$'], ['$19$'])
    expect(partieNombres(a)).toBe(partieNombres(b))
    expect(partieTexte(a)).not.toBe(partieTexte(b))
  })

  it('ne bloque pas sur une correction reformulée, mais la signale via tx', () => {
    const a = empreinteTirage(['Calculer $12+7$'], ['$19$'])
    const b = empreinteTirage(['Calculer $12+7$'], ['On obtient $19$.'])
    expect(partieNombres(a)).toBe(partieNombres(b))
    expect(partieTexte(a)).not.toBe(partieTexte(b))
  })

  it('distingue un décalage de valeurs entre deux questions', () => {
    const a = empreinteTirage(['$1$', '$2$'], [])
    const b = empreinteTirage(['$2$', '$1$'], [])
    expect(partieNombres(a)).not.toBe(partieNombres(b))
  })
})

describe('valeursParametre', () => {
  it("prend les premières valeurs d'un formulaire numérique", () => {
    expect(valeursParametre({ numerique: ['Difficulté', 5] }, 3)).toEqual([
      1, 2, 3,
    ])
  })

  it("ne dépasse pas le maximum déclaré par l'exercice", () => {
    expect(valeursParametre({ numerique: ['Difficulté', 2] }, 3)).toEqual([
      1, 2,
    ])
  })

  it("lit les numéros d'options d'un formulaire texte", () => {
    const texte: [string, string] = [
      'Choix des questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Dés',
        '2 : Notes',
        '3 : Temp.',
      ].join('\n'),
    ]
    expect(valeursParametre({ texte }, 2)).toEqual(['1', '2'])
  })

  it("donne les deux états d'une case à cocher", () => {
    expect(valeursParametre({ caseACocher: ['Avec figure'] }, 3)).toEqual([
      true,
      false,
    ])
  })

  it("ne renvoie rien quand le paramètre n'est pas déclaré", () => {
    expect(valeursParametre(undefined, 3)).toEqual([])
    expect(valeursParametre({ numerique: false }, 3)).toEqual([])
  })
})

describe('combinaisonsParametres', () => {
  it('fait varier un paramètre à la fois', () => {
    const combinaisons = combinaisonsParametres([
      { numerique: ['Difficulté', 3] },
      { numerique: ['Variante', 2] },
      undefined,
    ])
    expect(combinaisons.map((c) => c.cle)).toEqual([
      '',
      's=1',
      's=2',
      's=3',
      's2=1',
      's2=2',
    ])
    expect(combinaisons[4].valeurs).toEqual([undefined, 1, undefined])
  })

  it("ne rejoue pas la valeur par défaut de l'exercice", () => {
    const combinaisons = combinaisonsParametres(
      [{ numerique: ['Difficulté', 3] }, undefined, undefined],
      [2],
    )
    expect(combinaisons.map((c) => c.cle)).toEqual(['', 's=1', 's=3'])
  })

  it("se limite aux paramètres par défaut quand l'exercice n'en déclare aucun", () => {
    expect(combinaisonsParametres([undefined, undefined, undefined])).toEqual([
      { cle: '', valeurs: [undefined, undefined, undefined] },
    ])
  })

  it('ajouter un niveau ne retire aucune combinaison existante', () => {
    const avant = combinaisonsParametres([
      { numerique: ['Difficulté', 3] },
      undefined,
      undefined,
    ]).map((c) => c.cle)
    const apres = combinaisonsParametres([
      { numerique: ['Difficulté', 4] },
      undefined,
      undefined,
    ]).map((c) => c.cle)
    for (const cle of avant) expect(apres).toContain(cle)
  })
})

describe('exercicesAControler', () => {
  const catalogue: [string, string][] = [
    ['2359a', '6e/6N1E.ts'],
    ['e528e', '6e/6N1G.ts'],
    ['93f13', '2e/2F21-4.ts'],
  ]

  it('contrôle tout le catalogue sans variable', () => {
    expect(exercicesAControler(catalogue, {})).toEqual(catalogue)
    expect(selectionComplete({})).toBe(true)
  })

  it('restreint aux uuid demandés', () => {
    expect(
      exercicesAControler(catalogue, { STABILITY_UUIDS: '2359a, 93f13' }),
    ).toEqual([catalogue[0], catalogue[2]])
  })

  it('restreint aux préfixes de chemin', () => {
    expect(
      exercicesAControler(catalogue, { STABILITY_FILTER: '6e/6N1G^2e/' }),
    ).toEqual([catalogue[1], catalogue[2]])
  })

  it('ne retient que les exercices modifiés', () => {
    expect(
      exercicesAControler(catalogue, {
        CHANGED_FILES: 'src/exercices/6e/6N1E.ts\nREADME.md',
      }),
    ).toEqual([catalogue[0]])
  })

  it('contrôle tout quand un utilitaire partagé est modifié', () => {
    expect(
      exercicesAControler(catalogue, {
        CHANGED_FILES: 'src/lib/outils/nombres.ts',
      }),
    ).toEqual(catalogue)
    expect(
      exercicesAControler(catalogue, {
        CHANGED_FILES: 'src/modules/outils.ts',
      }),
    ).toEqual(catalogue)
  })

  it('contrôle tout quand un parent partagé de src/exercices est modifié', () => {
    expect(
      exercicesAControler(catalogue, {
        CHANGED_FILES: 'src/exercices/MetaExerciceCan.ts',
      }),
    ).toEqual(catalogue)
  })

  it('ignore les tests et les composants Svelte des utilitaires', () => {
    expect(
      exercicesAControler(catalogue, {
        CHANGED_FILES: 'src/lib/outils/nombres.test.ts',
      }),
    ).toEqual([])
  })

  it('ne contrôle rien si aucun fichier concerné', () => {
    expect(
      exercicesAControler(catalogue, { CHANGED_FILES: 'documentation/x.md' }),
    ).toEqual([])
  })
})

describe('installeGardeDeBoucle', () => {
  it('interrompt une boucle de rejet qui ne trouve jamais sa valeur', () => {
    const garde = installeGardeDeBoucle(1000)
    garde.demarre()
    expect(() => {
      // reproduit une boucle d'exercice qui tire jusqu'à une valeur impossible
      while (Math.random() < 2) {
        /* jamais satisfait */
      }
    }).toThrow(/boucle sans issue probable/)
    garde.arrete()
  })

  it('laisse passer une génération ordinaire', () => {
    const garde = installeGardeDeBoucle(1000)
    garde.demarre()
    for (let i = 0; i < 500; i++) Math.random()
    expect(garde.arrete()).toBe(500)
  })

  it('continue de compter après une réinitialisation par seedrandom', () => {
    const garde = installeGardeDeBoucle(1000)
    // seedrandom({ global: true }) réassigne Math.random : le compteur doit
    // survivre à cette réassignation, sinon la garde saute à chaque génération
    Math.random = () => 0.42
    garde.demarre()
    expect(Math.random()).toBe(0.42)
    expect(garde.arrete()).toBe(1)
  })
})
