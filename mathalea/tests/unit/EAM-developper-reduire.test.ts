import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AGSpeQ1 from '../../src/exercices/EAMPremiere/EAM-AGSpe-2026-Q1'
import AGnonSpeQ6 from '../../src/exercices/EAMPremiere/EAM-AGnonSpe-2026-Q6'
import ANSpeQ7 from '../../src/exercices/EAMPremiere/EAM-ANSpe-2026-Q7'
import ANnonSpeQ5 from '../../src/exercices/EAMPremiere/EAM-ANnonSpe-2026-Q5'
import CENonSpeQ7 from '../../src/exercices/EAMPremiere/EAM-CENonSpe-2026-Q7'
import CESpeQ5 from '../../src/exercices/EAMPremiere/EAM-CESpe-2026-Q5'
import FMSpeQ1 from '../../src/exercices/EAMPremiere/EAM-FMSpe-2026-Q1'
import PolynesieSpecifiqueQ3 from '../../src/exercices/EAMPremiere/EAM-PolynesieSpecifique-2026-Q3'
import PolynesieTechnoQ6 from '../../src/exercices/EAMPremiere/EAM-PolynesieTechno-2026-Q6'
import ExerciceQcmACourt from '../../src/exercices/ExerciceQcmACourt'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Reponse = {
  value: string
  compare?: (
    saisie: string,
    reponse: string,
    options?: object,
  ) => {
    isOk: boolean
  }
  options?: object
}

function genere(
  Classe: new () => ExerciceQcmACourt,
  graine: string,
  qcm: boolean,
) {
  seedrandom(graine, { global: true })
  const exercice = new Classe()
  exercice.nbQuestions = 1
  exercice.interactif = !qcm
  exercice.sup3 = qcm
  exercice.nouvelleVersion()
  return exercice
}

describe('Questions « développer » des annales 1A-A01 : développée et réduite', () => {
  for (const [nom, Classe] of [
    ['EAM-FMSpe-2026-Q1 (1A-A01-6)', FMSpeQ1],
    ['EAM-AGnonSpe-2026-Q6', AGnonSpeQ6],
    ['EAM-ANSpe-2026-Q7', ANSpeQ7],
    ['EAM-ANnonSpe-2026-Q5', ANnonSpeQ5],
    ['EAM-CENonSpe-2026-Q7', CENonSpeQ7],
    ['EAM-CESpe-2026-Q5', CESpeQ5],
    ['EAM-PolynesieTechno-2026-Q6', PolynesieTechnoQ6],
    ['EAM-PolynesieSpecifique-2026-Q3', PolynesieSpecifiqueQ3],
  ] as const) {
    describe(nom, () => {
      beforeEach(() => {
        document.body.innerHTML = ''
        window.notify = vi.fn()
        window.notifyLocal = vi.fn()
      })

      it('QCM : l’énoncé annonce une forme développée et réduite', () => {
        for (let k = 1; k <= 10; k++) {
          const exercice = genere(Classe, `dev${k}`, true)
          expect(exercice.listeQuestions[0]).toMatch(/développée et réduite/)
        }
      })

      it('saisie libre : « Développer et réduire … » et la réduction est exigée', () => {
        for (let k = 1; k <= 10; k++) {
          const exercice = genere(Classe, `dev${k}`, false)
          expect(exercice.listeQuestions[0]).toMatch(/Développer et réduire/)
          const { reponse } = (
            exercice.autoCorrection[0] as unknown as {
              valeur: { reponse: Reponse }
            }
          ).valeur
          const compare = reponse.compare ?? fonctionComparaison
          const valeur = String(reponse.value)
          expect(compare(valeur, valeur, reponse.options ?? {}).isOk).toBe(true)
          // Une écriture non réduite de la même expression n'est pas acceptée
          expect(
            compare(`${valeur}+0`, valeur, reponse.options ?? {}).isOk,
          ).toBe(false)
        }
      })
    })
  }

  it('1A-A01-6 Q1 : un développement non réduit est refusé, le développement réduit accepté', () => {
    const exercice = genere(FMSpeQ1, 'q1', false)
    const { reponse } = (
      exercice.autoCorrection[0] as unknown as { valeur: { reponse: Reponse } }
    ).valeur
    const compare = reponse.compare as NonNullable<Reponse['compare']>
    const valeur = String(reponse.value)
    expect(compare('9x^2-6x-6x+4', '9x^2-12x+4').isOk).toBe(false)
    expect(compare('(3x-2)^2', '9x^2-12x+4').isOk).toBe(false)
    expect(compare('4-12x+9x^2', '9x^2-12x+4').isOk).toBe(true)
    expect(compare(valeur, valeur).isOk).toBe(true)
  })

  it('1A-A01 AGSpe Q1 : seule la variante « développer » exige la réduction', () => {
    let vuDev = false
    let vuFact = false
    for (let k = 1; k <= 40; k++) {
      const qcm = genere(AGSpeQ1, `ag${k}`, true)
      const libre = genere(AGSpeQ1, `ag${k}`, false)
      if (/Développer et réduire/.test(libre.listeQuestions[0])) {
        vuDev = true
        expect(qcm.listeQuestions[0]).toMatch(/développée et réduite/)
      } else {
        vuFact = true
        expect(libre.listeQuestions[0]).toMatch(/Factoriser/)
      }
    }
    expect(vuDev && vuFact).toBe(true)
  })
})
