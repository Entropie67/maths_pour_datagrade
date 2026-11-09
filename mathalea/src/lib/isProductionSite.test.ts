import { describe, expect, it } from 'vitest'
import { isProductionSite } from './isProductionSite'

describe('isProductionSite', () => {
  it('est vrai sur les sites en production', () => {
    expect(isProductionSite('coopmaths.fr')).toBe(true)
    expect(isProductionSite('mathalea.fr')).toBe(true)
    expect(isProductionSite('www.coopmaths.fr')).toBe(true)
  })

  it('est faux en local, sur le staging et sur l’adresse technique du conteneur', () => {
    expect(isProductionSite('localhost')).toBe(false)
    expect(isProductionSite('127.0.0.1')).toBe(false)
    expect(isProductionSite('192.168.1.20')).toBe(false)
    expect(isProductionSite('[::1]')).toBe(false)
    expect(isProductionSite('staging.mathalea.fr')).toBe(false)
    expect(isProductionSite('staging.coopmaths.education-nationale.eu')).toBe(
      false,
    )
    expect(
      isProductionSite('mathaleastaging.functions.fnc.fr-par.scw.cloud'),
    ).toBe(false)
  })
})
