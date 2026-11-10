import { get } from 'svelte/store'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Activity } from '../../src/lib/types'

// Le module handleCapytale crée une instance de RPC à l'import : on la remplace
// par un espion pour simuler les échanges avec la page parente.
const rpcCall = vi.fn()
const exposedMethods = new Map<string, (...args: unknown[]) => unknown>()
vi.mock('@mixer/postmessage-rpc', () => ({
  RPC: class {
    call = rpcCall
    expose = (name: string, handler: (...args: unknown[]) => unknown) => {
      exposedMethods.set(name, handler)
    }
  },
}))

const handleCapytale = (await import('../../src/lib/handleCapytale')).default
const { globalOptions } = await import('../../src/lib/stores/globalOptions')

/** Les réglages choisis par l'enseignant et enregistrés par Capytale */
const savedGlobalOptions = {
  v: '',
  z: '1',
  title: '',
  presMode: 'un_exo_par_page',
  setInteractive: '2',
  isSolutionAccessible: false,
  isInteractiveFree: true,
  oneShot: false,
  twoColumns: false,
  isTitleDisplayed: false,
  isReferenceDisplayed: false,
  isDataRandom: false,
  recorder: 'capytale',
} as const

function activity(): Activity {
  return structuredClone({
    exercicesParams: [{ uuid: '6225c', id: '6M23', alea: 'ZZZZ' }],
    globalOptions: savedGlobalOptions,
    canOptions: { isChoosen: false },
  }) as unknown as Activity
}

/** Simule le chargement d'une activité par Capytale dans le mode demandé */
async function loadActivity(mode: 'create' | 'view', vueEnregistree?: string) {
  const loadedActivity = activity()
  if (vueEnregistree !== undefined) {
    loadedActivity.globalOptions.v = vueEnregistree as never
  }
  rpcCall.mockResolvedValue({
    mode,
    workflow: 'current',
    activity: loadedActivity,
    studentAssignment: null,
    assignmentData: {},
  })
  await handleCapytale()
  // toolSetActivityParams poursuit son travail de façon asynchrone
  await new Promise((resolve) => setTimeout(resolve, 1200))
}

/** Ce que MathALÉA renverrait à Capytale lors d'un enregistrement ou d'un clonage */
function paramsSentBackToCapytale() {
  const handler = exposedMethods.get('platformGetActivityParams')
  if (handler === undefined) throw new Error('platformGetActivityParams absent')
  return handler() as Activity
}

describe('paramètres de séance échangés avec Capytale', () => {
  beforeEach(() => {
    window.notify = vi.fn()
    rpcCall.mockReset()
  })

  it("restaure les réglages de l'enseignant en mode création", async () => {
    await loadActivity('create')
    const options = get(globalOptions)
    expect(options.isDataRandom).toBe(false)
    expect(options.isTitleDisplayed).toBe(false)
    expect(options.isReferenceDisplayed).toBe(false)
    expect(options.isSolutionAccessible).toBe(false)
  })

  it("ouvre la page de configuration même si la séance a été enregistrée en vue élève", async () => {
    // Cas d'une séance clonée par une version antérieure, qui a enregistré v: 'eleve'
    await loadActivity('create', 'eleve')
    expect(get(globalOptions).v).toBe('')
  })

  it("renvoie à Capytale les réglages restaurés en mode création", async () => {
    await loadActivity('create')
    const sent = paramsSentBackToCapytale()
    expect(sent.globalOptions.isSolutionAccessible).toBe(false)
    expect(sent.globalOptions.isTitleDisplayed).toBe(false)
    expect(sent.globalOptions.isDataRandom).toBe(false)
    // Les pages étant identiques pour tous les élèves, la graine est conservée
    expect(sent.exercicesParams[0].alea).toBe('ZZZZ')
  })

  it("ne renvoie pas les réglages d'affichage imposés hors mode création", async () => {
    // En mode view (consultation avant clonage), MathALÉA bascule en vue élève
    // et ouvre l'accès aux corrections : le clone ne doit pas hériter de cela.
    await loadActivity('view')
    expect(get(globalOptions).v).toBe('eleve')
    expect(get(globalOptions).isSolutionAccessible).toBe(true)
    const sent = paramsSentBackToCapytale()
    expect(sent.globalOptions).toEqual(savedGlobalOptions)
    expect(sent.exercicesParams[0].alea).toBe('ZZZZ')
  })
})
