import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Le module handleCapytale crée une instance de RPC à l'import : on la remplace
// par un espion pour simuler les réponses (ou l'absence de réponse) de Capytale.
const rpcCall = vi.fn()
vi.mock('@mixer/postmessage-rpc', () => ({
  RPC: class {
    call = rpcCall
    expose = () => {}
  },
}))

const { retryCapytaleSaveNow, sendToCapytaleSaveStudentAssignment } =
  await import('../../src/lib/handleCapytale')
const {
  capytaleConnectionLost,
  capytaleMode,
  exercicesParams,
  pointsMaxParExercice,
  resultsByExercice,
} = await import('../../src/lib/stores/generalStore')

/** Laisse les promesses de sauvegarde se résoudre */
async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('sauvegarde Capytale et perte de connexion', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    rpcCall.mockReset()
    window.notify = vi.fn()
    // jsdom n'implémente pas showModal(), utilisé par les messages temporaires
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    capytaleMode.set('assignment')
    capytaleConnectionLost.set(false)
    resultsByExercice.set([
      {
        uuid: 'uuid',
        indice: 0,
        numberOfPoints: 1,
        numberOfQuestions: 1,
        bestScore: 0,
      },
    ] as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("envoie le score maximal de toute la séance avec l'évaluation", async () => {
    resultsByExercice.set([
      {
        uuid: 'a',
        indice: 0,
        numberOfPoints: 2,
        numberOfQuestions: 3,
        bestScore: 0,
      },
    ] as never)
    // Le deuxième exercice n'est pas encore soumis, avec un coefficient de 2
    exercicesParams.set([{ uuid: 'a' }, { uuid: 'b', coeffBareme: 2 }] as never)
    pointsMaxParExercice.set([3, 4])
    rpcCall.mockResolvedValue(undefined)
    sendToCapytaleSaveStudentAssignment({ indiceExercice: 0 })
    await flushPromises()
    expect(rpcCall).toHaveBeenCalledWith(
      'saveStudentAssignment',
      expect.objectContaining({ evaluation: '2', scoreMax: 11 }),
    )
  })

  it('verrouille la copie quand la sauvegarde échoue', async () => {
    rpcCall.mockRejectedValue(new Error('Network error'))
    sendToCapytaleSaveStudentAssignment({ indiceExercice: 0 })
    await flushPromises()
    expect(get(capytaleConnectionLost)).toBe(true)
  })

  it('verrouille la copie quand Capytale ne répond pas dans le délai imparti', async () => {
    rpcCall.mockReturnValue(new Promise(() => {})) // jamais résolue
    sendToCapytaleSaveStudentAssignment({ indiceExercice: 0 })
    await vi.advanceTimersByTimeAsync(16000)
    expect(get(capytaleConnectionLost)).toBe(true)
  })

  it('ne verrouille pas la copie pour une erreur métier de Capytale', async () => {
    rpcCall.mockRejectedValue(new Error('Copie verrouillée'))
    sendToCapytaleSaveStudentAssignment({ indiceExercice: 0 })
    await flushPromises()
    expect(get(capytaleConnectionLost)).toBe(false)
  })

  it('rejoue la sauvegarde en attente et déverrouille la copie au retour de la connexion', async () => {
    rpcCall.mockRejectedValue(new Error('Network error'))
    sendToCapytaleSaveStudentAssignment({ indiceExercice: 0 })
    await flushPromises()
    expect(get(capytaleConnectionLost)).toBe(true)
    const dataSent = rpcCall.mock.calls[0][1]

    rpcCall.mockResolvedValue(undefined)
    retryCapytaleSaveNow()
    await flushPromises()
    expect(get(capytaleConnectionLost)).toBe(false)
    // la réponse de l'élève qui n'avait pas pu être enregistrée est bien renvoyée
    expect(rpcCall).toHaveBeenLastCalledWith('saveStudentAssignment', dataSent)
  })

  it('réessaie automatiquement après un échec', async () => {
    rpcCall.mockRejectedValue(new Error('Network error'))
    sendToCapytaleSaveStudentAssignment({ indiceExercice: 0 })
    await flushPromises()
    expect(rpcCall).toHaveBeenCalledTimes(1)

    rpcCall.mockResolvedValue(undefined)
    await vi.advanceTimersByTimeAsync(4000)
    expect(rpcCall).toHaveBeenCalledTimes(2)
    expect(get(capytaleConnectionLost)).toBe(false)
  })
})
