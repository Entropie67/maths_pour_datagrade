import { beforeEach, describe, expect, it, vi } from 'vitest'
import uuidsCH from '../../src/json/uuidsToUrlCH.json'
import uuidsFR from '../../src/json/uuidsToUrlFR.json'
import { getExerciseModuleLoader } from '../../src/lib/exerciseLoader'

const { loadExerciseModule } = vi.hoisted(() => ({
  loadExerciseModule: vi.fn(),
}))

vi.mock('../../src/lib/exerciseModules', () => ({ loadExerciseModule }))

describe('Chargement différé des modules d’exercices', () => {
  beforeEach(() => {
    loadExerciseModule.mockReset()
  })

  it('couvre tous les exercices publiés et archivés des deux référentiels', () => {
    const urls = new Set([...Object.values(uuidsFR), ...Object.values(uuidsCH)])
    for (const url of urls) {
      if (!/\.(?:ts|js)$/.test(url)) continue
      const path = `../exercices/${url.replaceAll('\\', '/')}`
      expect(getExerciseModuleLoader(path), path).toBeTypeOf('function')
    }
    expect(loadExerciseModule).not.toHaveBeenCalled()
  })

  it('ne propose ni les fichiers de test ni un chemin absent du catalogue', () => {
    expect(
      getExerciseModuleLoader('../exercices/6e/inexistant.ts'),
    ).toBeUndefined()
    expect(
      getExerciseModuleLoader('../exercices/6e/inexistant.test.ts'),
    ).toBeUndefined()
    expect(getExerciseModuleLoader('../lib/mathalea.ts')).toBeUndefined()
  })

  it('charge seulement le module demandé, en conservant ses exports', async () => {
    const url = Object.values(uuidsFR).find((url) => url.endsWith('-old.ts'))!
    const path = `../exercices/${url}`
    const module = {
      default: class {},
      titre: 'Exercice archivé',
      amcReady: true,
    }
    loadExerciseModule.mockResolvedValue(module)
    const loader = getExerciseModuleLoader(path)!
    expect(loadExerciseModule).not.toHaveBeenCalled()
    expect(await loader()).toBe(module)
    expect(loadExerciseModule).toHaveBeenCalledExactlyOnceWith(path)
  })

  it('transmet un échec réseau pour permettre les nouvelles tentatives du moteur', async () => {
    const url = Object.values(uuidsFR).find((url) => url.endsWith('.ts'))!
    const path = `../exercices/${url}`
    const error = new TypeError('Failed to fetch dynamically imported module')
    loadExerciseModule.mockRejectedValueOnce(error).mockResolvedValueOnce({})
    const loader = getExerciseModuleLoader(path)!
    await expect(loader()).rejects.toBe(error)
    await expect(loader()).resolves.toEqual({})
    expect(loadExerciseModule).toHaveBeenCalledTimes(2)
  })
})
