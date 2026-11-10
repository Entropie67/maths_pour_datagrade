import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MedianeQCM from '../../src/exercices/1e/1A-S02-1'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

type Compare = (saisie: string, reponse: string) => { isOk: boolean }

/** Questions de la saisie libre : réponse attendue, fonction de comparaison et correction. */
function questions(graine: string, versionQcm = false) {
  seedrandom(graine, { global: true })
  const exercice = new MedianeQCM()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 4
  exercice.sup3 = versionQcm
  exercice.nouvelleVersion()
  return exercice.autoCorrection.map((autoCorrection, i) => {
    // En version QCM, l'autocorrection n'a pas de réponse de saisie libre
    const { value, compare } = (
      autoCorrection as unknown as {
        valeur?: { reponse: { value: string; compare: Compare } }
      }
    ).valeur?.reponse ?? { value: '', compare: undefined as unknown as Compare }
    return {
      value,
      compare,
      enonce: exercice.listeQuestions[i],
      correction: exercice.listeCorrections[i],
    }
  })
}

const virgule = (nombre: number) => String(nombre).replace('.', ',')

describe('1A-S02-1 : médiane en saisie libre', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('effectif impair : seule la médiane est acceptée', () => {
    let impairs = 0
    for (let graine = 1; graine <= 40; graine++) {
      for (const { value, compare } of questions(`impair-${graine}`)) {
        if (value.startsWith(']')) continue
        impairs++
        const mediane = Number(value.replace(',', '.'))
        expect(compare(value, value).isOk, value).toBe(true)
        expect(compare(virgule(mediane + 1), value).isOk, value).toBe(false)
        expect(compare(virgule(mediane - 1), value).isOk, value).toBe(false)
      }
    }
    expect(impairs).toBeGreaterThan(0)
  })

  it('effectif pair : toute valeur strictement comprise entre les deux termes centraux est acceptée', () => {
    let pairs = 0
    for (let graine = 1; graine <= 40; graine++) {
      for (const { value, compare, correction } of questions(`pair-${graine}`)) {
        if (!value.startsWith(']')) continue
        pairs++
        const [a, b] = value.slice(1, -1).split(';').map(Number)
        const acceptees = [(a + b) / 2, a + 0.1, b - 0.1]
        for (const valeur of acceptees) {
          expect(compare(virgule(valeur), value).isOk, `${value} : ${valeur}`).toBe(true)
        }
        for (const valeur of [a, b, a - 1, b + 1]) {
          expect(compare(virgule(valeur), value).isOk, `${value} : ${valeur}`).toBe(false)
        }
        expect(correction).toContain(
          miseEnEvidence(String((a + b) / 2).replace('.', ',')),
        )
        expect(correction).toContain('convient aussi')
      }
    }
    expect(pairs).toBeGreaterThan(0)
  })

  it("l'énoncé n'est plus une question à choix", () => {
    for (const { enonce } of questions('enonce')) {
      expect(enonce).not.toContain('Parmi ces propositions')
      expect(enonce).toMatch(/médiane de cette série\./)
      expect(enonce).toContain('mathalea-mathfield')
    }
  })

  it('la case « Version QCM » rétablit les propositions', () => {
    for (const { enonce } of questions('qcm', true)) {
      expect(enonce).not.toContain('mathalea-mathfield')
    }
  })
})
