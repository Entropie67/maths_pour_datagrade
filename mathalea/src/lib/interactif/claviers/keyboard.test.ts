import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as blocsDeTouches from '../../../components/keyboard/layouts/keysBlocks'
import {
  buildDataKeyboardFromStyle,
  convertKeyboardTypeToBlocks,
  KeyboardType,
} from './keyboard'

describe('clavierEntierementPersonnalisable', () => {
  it('ne demande aucun bloc habituel', () => {
    expect(
      convertKeyboardTypeToBlocks('clavierEntierementPersonnalisable'),
    ).toEqual([])
  })

  it('reste vide plutôt que de retomber sur le clavier par défaut', () => {
    expect(
      buildDataKeyboardFromStyle(
        KeyboardType.clavierEntierementPersonnalisable!,
      ),
    ).toEqual([])
  })

  it('un style vide ou inconnu retombe bien sur le clavier par défaut', () => {
    const clavierParDefaut = ['numbers', 'fullOperations', 'variables']
    expect(buildDataKeyboardFromStyle('')).toEqual(clavierParDefaut)
    expect(buildDataKeyboardFromStyle('unStyleInconnu')).toEqual(
      clavierParDefaut,
    )
  })
})

describe('clavierMatrice', () => {
  it('fournit les coefficients usuels et la touche matrice', () => {
    expect(convertKeyboardTypeToBlocks('clavierMatrice')).toEqual([
      'matrix',
      'numbers',
      'fullOperations',
    ])
  })
})

describe('complexes', () => {
  it('ne contient qu’un seul bloc de chiffres', () => {
    expect(convertKeyboardTypeToBlocks('complexes')).toEqual(['complexes'])
  })

  it('complexesAvecVariable ajoute les lettres sans doubler les chiffres', () => {
    expect(
      buildDataKeyboardFromStyle(KeyboardType.complexesAvecVariable!),
    ).toEqual(['complexes', 'variables'])
  })
})

const fichiersSource = (dossier: string): string[] =>
  readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) return fichiersSource(chemin)
    return /\.(ts|svelte)$/.test(chemin) ? [chemin] : []
  })

describe('combinaisons de claviers', () => {
  it('ne réunissent jamais deux blocs contenant les chiffres', () => {
    const blocsAvecChiffres = Object.entries(blocsDeTouches)
      .filter(([, bloc]) => {
        const touches = (bloc as { keycaps?: { inline?: unknown[] } })?.keycaps
          ?.inline
        return touches?.includes(1)
      })
      .map(([nom]) => nom)
    const types = KeyboardType as Record<string, string>
    const enchainement = /(?:KeyboardType\.\w+[}\s+'"`${]+)+KeyboardType\.\w+/g
    const fautifs: string[] = []
    for (const fichier of fichiersSource('src')) {
      if (fichier.includes('claviers')) continue
      const contenu = readFileSync(fichier, 'utf8')
      for (const [combinaison] of contenu.matchAll(enchainement)) {
        const noms = [...combinaison.matchAll(/KeyboardType\.(\w+)/g)].map(
          (m) => m[1],
        )
        const blocs = buildDataKeyboardFromStyle(
          noms.map((nom) => types[nom!]).join(' '),
        )
        if (blocs.filter((b) => blocsAvecChiffres.includes(b)).length > 1) {
          fautifs.push(`${fichier} : ${noms.join(' + ')}`)
        }
      }
    }
    expect(fautifs).toEqual([])
  })
})
