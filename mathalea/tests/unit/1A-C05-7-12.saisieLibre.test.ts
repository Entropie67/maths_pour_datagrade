import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import ExerciceSimple from '../../src/exercices/ExerciceSimple'
import { mathaleaHandleExerciceSimple } from '../../src/lib/mathalea'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const modules = import.meta.glob(
  '../../src/exercices/1e/1A-C05-{7,8,9,10,11,12}.ts',
  {
    eager: true,
  },
) as Record<string, { default: new () => Exercice }>

const classe = (code: string) =>
  Object.entries(modules).find(([chemin]) => chemin.endsWith(`${code}.ts`))![1]
    .default

type Reponse = {
  value: string
  compare?: (
    saisie: string,
    reponse: string,
    options?: Record<string, unknown>,
  ) => { isOk: boolean }
  options?: Record<string, unknown>
}

function genere(code: string, graine: string, nbQuestions = 6) {
  seedrandom(graine, { global: true })
  const exercice = new (classe(code))()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = nbQuestions
  if (exercice instanceof ExerciceSimple) {
    exercice.seed = graine
    mathaleaHandleExerciceSimple(exercice, true, 0)
  } else {
    exercice.nouvelleVersion()
  }
  return exercice
}

/** Toutes les réponses attendues d'une question, avec leur comparaison. */
function champs(exercice: Exercice, i: number) {
  const valeur = exercice.autoCorrection[i] as unknown as {
    valeur?: Record<string, Reponse> & { reponse?: Reponse }
    reponse?: { valeur: Record<string, Reponse> }
  }
  const brut = valeur.reponse?.valeur ?? valeur.valeur ?? {}
  const objet = brut.reponse != null ? { reponse: brut.reponse } : brut
  return Object.values(objet as Record<string, Reponse>).filter(
    (r) => r != null && typeof r === 'object' && 'value' in r,
  )
}

const accepte = (r: Reponse, saisie: string) =>
  (r.compare != null
    ? r.compare(saisie, String(r.value), r.options)
    : fonctionComparaison(saisie, String(r.value), r.options)
  ).isOk

describe('1A-C05-7 à 12 : saisie libre', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  for (const code of [
    '1A-C05-7',
    '1A-C05-8',
    '1A-C05-9',
    '1A-C05-10',
    '1A-C05-11',
    '1A-C05-12',
  ]) {
    it(`${code} : génère sans erreur et accepte sa propre réponse`, () => {
      for (let graine = 1; graine <= 150; graine++) {
        const exercice = genere(code, `${code}-${graine}`)
        expect(exercice.listeQuestions).toHaveLength(6)
        expect(window.notify).not.toHaveBeenCalled()
        for (let i = 0; i < 6; i++) {
          const reponses = champs(exercice, i)
          expect(
            reponses.length,
            `${code} graine ${graine} question ${i}`,
          ).toBeGreaterThan(0)
          for (const r of reponses) {
            expect(
              accepte(r, String(r.value)),
              `${code} ${graine} q${i} ${r.value}`,
            ).toBe(true)
          }
        }
      }
    })
  }

  it('1A-C05-7, 8 et 12 : la réponse est une puissance de 10 d’exposant ≠ 0, 1 ; le nombre seul est refusé', () => {
    for (const code of ['1A-C05-7', '1A-C05-8', '1A-C05-12']) {
      for (let graine = 1; graine <= 150; graine++) {
        const exercice = genere(code, `${code}-${graine}`)
        for (let i = 0; i < 6; i++) {
          const [r] = champs(exercice, i)
          const n = Number(/^10\^\{(-?\d+)\}$/.exec(String(r.value))![1])
          expect([0, 1]).not.toContain(n)
          expect(accepte(r, String(10 ** n))).toBe(false)
          expect(accepte(r, `10^{${n + 1}}`)).toBe(false)
        }
      }
    }
  })

  it('1A-C05-7 : aucun nombre ne commence par 3, 4, 5, 6 ou 7', () => {
    for (let graine = 1; graine <= 150; graine++) {
      const exercice = genere('1A-C05-7', `c7-${graine}`)
      for (const q of exercice.listeQuestions) {
        const m = /sous la forme/.exec(q)
        expect(m).not.toBeNull()
        const nombre = /ordre de grandeur de \$([^$]+)\$/.exec(q)![1]
        // premier chiffre significatif du facteur écrit (avant d'éventuels × 10^p)
        const facteur = nombre
          .split('\\times')[0]
          .replace(/[^\d]/g, '')
          .replace(/^0+/, '')
        expect(['3', '4', '5', '6', '7']).not.toContain(facteur[0])
      }
    }
  })

  it('1A-C05-8 : les nombres commencent par 1, 2, 8 ou 9', () => {
    for (let graine = 1; graine <= 150; graine++) {
      const exercice = genere('1A-C05-8', `c8-${graine}`)
      for (const q of exercice.listeQuestions) {
        const nombres = [
          ...q.matchAll(/\$([\d\\,{}]+)\\(?:times|div)([\d\\,{}]+)\$/g),
        ]
        expect(nombres.length).toBeGreaterThan(0)
        for (const [, a, b] of nombres) {
          for (const nb of [a, b]) {
            const premier = nb.replace(/[^\d]/g, '').replace(/^0+/, '')[0]
            expect(['1', '2', '8', '9']).toContain(premier)
          }
        }
      }
    }
  })

  it('1A-C05-12 : les valeurs commencent par 1 ou 9', () => {
    for (let graine = 1; graine <= 150; graine++) {
      const exercice = genere('1A-C05-12', `c12-${graine}`)
      for (let i = 0; i < 6; i++) {
        const valeurs = [
          ...exercice.listeQuestions[i].matchAll(
            /\$(\d[\d\\,{}]*)(?:\\times10\^\{-?\d+\})?\$/g,
          ),
        ]
        expect(valeurs.length).toBeGreaterThanOrEqual(2)
        for (const [, v] of valeurs.slice(0, 2)) {
          expect(['1', '9']).toContain(v[0])
        }
      }
    }
  })

  it('1A-C05-9 : seule l’écriture a×10^n à un chiffre est acceptée', () => {
    for (let graine = 1; graine <= 100; graine++) {
      const exercice = genere('1A-C05-9', `c9-${graine}`)
      for (let i = 0; i < 6; i++) {
        const [r] = champs(exercice, i)
        const [, a, n] = /^(\d)\\times10\^\{(\d+)\}$/.exec(String(r.value))!
        expect(accepte(r, `${Number(a) * 10 ** Number(n)}`)).toBe(false)
        expect(accepte(r, `${a}\\times10^{${Number(n) + 1}}`)).toBe(false)
      }
    }
  })

  it('1A-C05-9 : le produit exact reste à moins de 4 % de la réponse attendue', () => {
    for (let graine = 1; graine <= 200; graine++) {
      const exercice = genere('1A-C05-9', `c9p-${graine}`)
      for (let i = 0; i < 6; i++) {
        const [r] = champs(exercice, i)
        const [, a, n] = /^(\d)\\times10\^\{(\d+)\}$/.exec(String(r.value))!
        // le poids du mur est calculé en grammes mais demandé en kilogrammes
        const facteurUnite = /kilogrammes|litres/.test(
          exercice.listeQuestions[i],
        )
          ? 1000
          : 1
        const attendu = Number(a) * 10 ** Number(n) * facteurUnite
        const nombres = [
          ...exercice.listeQuestions[i].matchAll(/\$(\d[\d\\,]*)\$/g),
        ].map(([, x]) => Number(x.replace(/\\,/g, '')))
        const produit = nombres[0] * nombres[1]
        expect(Math.abs(produit / attendu - 1)).toBeLessThanOrEqual(0.04)
      }
    }
  })

  it('1A-C05-10 : un seul champ par question', () => {
    for (let graine = 1; graine <= 100; graine++) {
      const exercice = genere('1A-C05-10', `c10-${graine}`)
      for (let i = 0; i < 6; i++) {
        expect(champs(exercice, i)).toHaveLength(1)
      }
    }
  })

  it('1A-C05-11 : la bonne réponse est refusée si la virgule est mal placée', () => {
    for (let graine = 1; graine <= 100; graine++) {
      const exercice = genere('1A-C05-11', `c11-${graine}`)
      for (let i = 0; i < 6; i++) {
        const [r] = champs(exercice, i)
        const x = Number(r.value)
        expect(accepte(r, String(x * 10))).toBe(false)
        expect(accepte(r, String(x / 10))).toBe(false)
      }
    }
  })
})
