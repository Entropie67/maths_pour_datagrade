import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type ExerciceSimple from '../../src/exercices/ExerciceSimple'
import * as distracteurs from '../../src/lib/interactif/qcmDistractors'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import * as outils from '../../src/modules/outils'
import { mathaleaHandleExerciceSimple } from '../../src/lib/mathalea'
import { empreinteTirage } from '../e2e/helpers/empreinteExercice'
import C02_1 from '../../src/exercices/1e/1A-C02-1'
import C03_2 from '../../src/exercices/1e/1A-C03-2'
import C08_5 from '../../src/exercices/1e/1A-C08-5'
import C09_4 from '../../src/exercices/1e/1A-C09-4'
import C10_1 from '../../src/exercices/1e/1A-C10-1'
import C10_9 from '../../src/exercices/1e/1A-C10-9'
import C13_1 from '../../src/exercices/1e/1A-C13-1'
import E01_1 from '../../src/exercices/1e/1A-E01-1'
import E01_2 from '../../src/exercices/1e/1A-E01-2'
import E04_3 from '../../src/exercices/1e/1A-E04-3'
import F01_1 from '../../src/exercices/1e/1A-F01-1'
import F01_2 from '../../src/exercices/1e/1A-F01-2'
import F02_11 from '../../src/exercices/1e/1A-F02-11'
import F02_2 from '../../src/exercices/1e/1A-F02-2'
import F02_6 from '../../src/exercices/1e/1A-F02-6'
import F02_9 from '../../src/exercices/1e/1A-F02-9'
import F07_1 from '../../src/exercices/1e/1A-F07-1'
import F08_2 from '../../src/exercices/1e/1A-F08-2'
import R01_1 from '../../src/exercices/1e/1A-R01-1'
import R01_2 from '../../src/exercices/1e/1A-R01-2'
import R02_2 from '../../src/exercices/1e/1A-R02-2'
import Can2G30_01 from '../../src/exercices/can/2e/can2G30-01'
import Can2G30_05 from '../../src/exercices/can/2e/can2G30-05'
import Can2G30_06 from '../../src/exercices/can/2e/can2G30-06'
import Can2G30_08 from '../../src/exercices/can/2e/can2G30-08'
import Can2I2_01 from '../../src/exercices/can/2e/can2I2-01'
import Can2I2_02 from '../../src/exercices/can/2e/can2I2-02'
import Can2I2_04 from '../../src/exercices/can/2e/can2I2-04'
import Can2N11_03 from '../../src/exercices/can/2e/can2N11-03'
import Can2N4_03 from '../../src/exercices/can/2e/can2N4-03'
import Can3F1_01 from '../../src/exercices/can/3e/can3F1-01'
import Can3F1_03 from '../../src/exercices/can/3e/can3F1-03'
import Can3F2_02 from '../../src/exercices/can/3e/can3F2-02'
import Can3F2_07 from '../../src/exercices/can/3e/can3F2-07'
import Can3L1_05 from '../../src/exercices/can/3e/can3L1-05'
import Can4L2_02 from '../../src/exercices/can/4e/can4L2-02'
import Can4L2_06 from '../../src/exercices/can/4e/can4L2-06'
import Can4P2_01 from '../../src/exercices/can/4e/can4P2-01'
import Can4P2_02 from '../../src/exercices/can/4e/can4P2-02'
import Can6P2_04 from '../../src/exercices/can/6e/can6P2-04'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const exercices: [string, new () => ExerciceSimple][] = [
  ['1A-C02-1', C02_1],
  ['1A-C03-2', C03_2],
  ['1A-C08-5', C08_5],
  ['1A-C09-4', C09_4],
  ['1A-C10-1', C10_1],
  ['1A-C10-9', C10_9],
  ['1A-C13-1', C13_1],
  ['1A-E01-1', E01_1],
  ['1A-E01-2', E01_2],
  ['1A-E04-3', E04_3],
  ['1A-F01-1', F01_1],
  ['1A-F01-2', F01_2],
  ['1A-F02-11', F02_11],
  ['1A-F02-2', F02_2],
  ['1A-F02-6', F02_6],
  ['1A-F02-9', F02_9],
  ['1A-F07-1', F07_1],
  ['1A-F08-2', F08_2],
  ['1A-R01-1', R01_1],
  ['1A-R01-2', R01_2],
  ['1A-R02-2', R02_2],
  ['can2G30-01', Can2G30_01],
  ['can2G30-05', Can2G30_05],
  ['can2G30-06', Can2G30_06],
  ['can2G30-08', Can2G30_08],
  ['can2I2-01', Can2I2_01],
  ['can2I2-02', Can2I2_02],
  ['can2I2-04', Can2I2_04],
  ['can2N11-03', Can2N11_03],
  ['can2N4-03', Can2N4_03],
  ['can3F1-01', Can3F1_01],
  ['can3F1-03', Can3F1_03],
  ['can3F2-02', Can3F2_02],
  ['can3F2-07', Can3F2_07],
  ['can3L1-05', Can3L1_05],
  ['can4L2-02', Can4L2_02],
  ['can4L2-06', Can4L2_06],
  ['can4P2-01', Can4P2_01],
  ['can4P2-02', Can4P2_02],
  ['can6P2-04', Can6P2_04],
]
const randomInitial = Math.random
afterEach(() => {
  vi.restoreAllMocks()
  Math.random = randomInitial
})
const forme = (s: string | number) =>
  String(s).replace(/\\,|\\ |\\!|~|\$|\s+/g, '')
const valeur = (s: string | number) =>
  String(s)
    .replace(/\$/g, '')
    .replace(/^est /, '')
    .replace(/^[SmpN]=/, '')
    .replace(/\\,\\%$/, '')

describe('Quatre propositions dans les QCM simples avec secours', () => {
  it('1A-C02-1 : compléter le tirage partagé avec le carré de la différence', () => {
    seedrandom('xj7d00', { global: true })
    const e = new C02_1()
    e.versionQcm = true
    e.nouvelleVersion()
    expect(e.reponse).toBe('$1$')
    expect(e.distracteurs).toEqual(['$25$', '$-8$', '$49$'])
  })

  it('1A-F02-6 : compléter aussi un produit nul lorsque l’autre image vaut une unité', () => {
    const e = new F02_6()
    e.versionQcm = true
    vi.spyOn(e, 'quotaChoice').mockReturnValue(1)
    vi.spyOn(e, 'quotaRandint').mockReturnValue(1)
    vi.spyOn(outils, 'randint')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(-1)
      .mockReturnValueOnce(0)
    e.nouvelleVersion()
    expect(e.reponse).toBe('$0$')
    const mauvaises = distracteurs.getDistracteurs(e)
    expect(mauvaises).toHaveLength(3)
    expect(new Set(mauvaises).size).toBe(3)
    expect(mauvaises).not.toContain('$0$')
  })

  it.each(exercices)(
    '%s : conserve trois mauvaises réponses sur 1 000 graines',
    (ref, Exercice) => {
      window.notify = vi.fn()
      for (let i = 0; i < 1000; i++) {
        const graine = i === 0 ? 'xj7d00' : `audit-${i}`
        seedrandom(graine, { global: true })
        const e = new Exercice()
        e.versionQcm = true
        e.nbQuestions = 1
        e.nouvelleVersion()
        const propositions = [
          String(e.reponse),
          ...distracteurs.getDistracteurs(e),
        ]
        expect(propositions, `${ref}, graine ${graine}`).toHaveLength(4)
        expect(
          new Set(propositions.map(forme)).size,
          `${ref}, graine ${graine}`,
        ).toBe(4)
        e.destroy?.()
      }
    },
  )

  it.each(exercices)(
    '%s : les secours ajoutés sont faux et ne consomment aucun tirage',
    (ref, Exercice) => {
      window.notify = vi.fn()
      const original = distracteurs.distracteursDistincts
      let avecSecours = false
      const espion = vi
        .spyOn(distracteurs, 'distracteursDistincts')
        .mockImplementation((r, c, s, max) =>
          avecSecours ? original(r, c, s, max) : c.map(String),
        )
      const genere = (graine: string) => {
        seedrandom(graine, { global: true })
        const e = new Exercice()
        e.versionQcm = true
        e.nbQuestions = 1
        e.nouvelleVersion()
        return { e, suivant: Math.random() }
      }
      for (let i = 0; i < 100; i++) {
        const graine = i === 0 ? 'xj7d00' : `audit-${i}`
        avecSecours = false
        const avant = genere(graine)
        espion.mockClear()
        avecSecours = true
        const apres = genere(graine)
        expect(apres.suivant, `${ref}, ${graine}`).toBe(avant.suivant)
        expect(apres.e.reponse).toEqual(avant.e.reponse)
        expect(
          empreinteTirage([apres.e.question ?? ''], [apres.e.correction ?? '']),
        ).toBe(
          empreinteTirage([avant.e.question ?? ''], [avant.e.correction ?? '']),
        )
        for (let j = 0; j < espion.mock.calls.length; j++) {
          const [reponse, candidats] = espion.mock.calls[j]
          const resultat = espion.mock.results[j].value as string[]
          const ajoutes = resultat.filter(
            (c) => !candidats.map(forme).includes(forme(c)),
          )
          for (const candidat of ajoutes) {
            const attendue = valeur(reponse)
            expect(
              fonctionComparaison(valeur(candidat), attendue, {
                ensembleDeNombres:
                  attendue.startsWith('\\{') || attendue === '\\emptyset',
              }).isOk,
              `${ref}, ${graine} : ${candidat} doit différer de ${reponse}`,
            ).toBe(false)
          }
        }
        avant.e.destroy?.()
        apres.e.destroy?.()
      }
    },
  )

  it.each(exercices)(
    '%s : rend quatre propositions par question dans une série interactive',
    (ref, Exercice) => {
      window.notify = vi.fn()
      window.notifyLocal = vi.fn()
      for (const nbQuestions of [1, 4, 8]) {
        for (let i = 0; i < 5; i++) {
          const e = new Exercice()
          e.seed = i === 0 ? 'xj7d' : `serie-qcm-${i}`
          e.versionQcm = true
          e.nbQuestions = nbQuestions
          mathaleaHandleExerciceSimple(e, true, 0)
          expect(e.listeQuestions, ref).toHaveLength(nbQuestions)
          e.listeQuestions.forEach((q) => {
            const match = q.match(/propositions="([^"]*)"/)
            expect(match, ref).not.toBeNull()
            const props = JSON.parse(match![1].replaceAll('&quot;', '"')) as {
              texte: string
              statut: boolean
            }[]
            expect(props, ref).toHaveLength(4)
            expect(new Set(props.map((p) => forme(p.texte))).size, ref).toBe(4)
            expect(
              props.filter((p) => p.statut),
              ref,
            ).toHaveLength(1)
          })
          e.destroy?.()
        }
      }
    },
  )
})
