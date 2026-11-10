import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nombresAffiches } from '../e2e/helpers/empreinteExercice'
import { htmlToTypst } from '../../src/components/setup/typst/latexToTypst'
import ReconnaitreDesPointsAlignes from '../../src/exercices/6e/6G0-7'
import AireCarreRectangle from '../../src/exercices/6e/6M2B-1'
import Exercice from '../../src/exercices/Exercice'
import { MetaInteractif2d } from '../../src/lib/2d/interactif2d'
import { pointAbstrait } from '../../src/lib/2d/PointAbstrait'
import { polygone } from '../../src/lib/2d/polygones'
import { latex2d, texteParPosition } from '../../src/lib/2d/textes'
import { sp } from '../../src/lib/outils/outilString'
import type { IExercice } from '../../src/lib/types'
import { context } from '../../src/modules/context'
import { mathalea2d } from '../../src/modules/mathalea2d'

const fenetre = { xmin: 0, ymin: 0, xmax: 4, ymax: 4 }
const trace = () =>
  polygone(pointAbstrait(0, 0), pointAbstrait(2, 0), pointAbstrait(2, 2))
const etiquette = () => latex2d('3\\text{ cm}', 1, 3, { letterSize: 'small' })
const champ = () =>
  new MetaInteractif2d(
    [
      {
        content: '%{champ1}\\text{ cm}^2',
        x: 1,
        y: 1,
        classe: '',
        blanc: '\\ldots ',
        opacity: 1,
        index: 0,
      },
    ],
    {
      exercice: { numeroExercice: 0, interactif: true } as unknown as IExercice,
      question: 0,
    },
  )

const analyse = (html: string) => {
  const zone = document.createElement('div')
  zone.innerHTML = html
  return zone
}
const svgDe = (html: string) =>
  analyse(html).querySelector('svg.mathalea2d') as SVGSVGElement

describe('accessibilité de mathalea2d', () => {
  beforeEach(() => {
    context.isHtml = true
    if (typeof window.notify !== 'function') {
      window.notify = vi.fn() as unknown as typeof window.notify
    }
  })
  afterEach(() => {
    context.isHtml = true
  })

  it('ne change rien sans option', () => {
    const html = mathalea2d(fenetre, trace(), etiquette())
    const svg = svgDe(html)
    expect(svg.hasAttribute('role')).toBe(false)
    expect(svg.hasAttribute('aria-label')).toBe(false)
    expect(svg.hasAttribute('aria-hidden')).toBe(false)
    expect(html).not.toContain('class="divLatex" aria-hidden')
    expect(html).toContain(
      '<svg class="mathalea2d"   data-width-cm="4" data-height-cm="4" width="80" height="80" viewBox="0 -80 80 80" xmlns="http://www.w3.org/2000/svg" >',
    )
  })

  it('traite une description vide comme une option absente', () => {
    const sans = mathalea2d(fenetre)
    expect(mathalea2d({ ...fenetre, description: '' })).toBe(sans)
    expect(mathalea2d({ ...fenetre, description: ' \n ' })).toBe(sans)
  })

  it('annonce la figure comme une image nommée', () => {
    const svg = svgDe(
      mathalea2d({ ...fenetre, description: 'Carré de côté 3 cm.' }, trace()),
    )
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('Carré de côté 3 cm.')
    expect(svg.hasAttribute('aria-hidden')).toBe(false)
  })

  it('masque les textes du SVG quand une description les remplace', () => {
    const objets = [trace(), texteParPosition('//', 1, 1)]
    const texteDe = (html: string) =>
      analyse(html).querySelector('svg text') as SVGTextElement
    expect(
      texteDe(
        mathalea2d({ ...fenetre, description: 'Figure.' }, objets),
      ).getAttribute('aria-hidden'),
    ).toBe('true')
    expect(
      texteDe(mathalea2d(fenetre, objets)).hasAttribute('aria-hidden'),
    ).toBe(false)
  })

  it('échappe la description', () => {
    const description = `"a" <b> & c'est 5 $ > 3 </svg><script>`
    const html = mathalea2d({ ...fenetre, description }, trace())
    expect(svgDe(html).getAttribute('aria-label')).toBe(description)
    expect(analyse(html).querySelector('script')).toBeNull()
    const balise = html.match(/<svg[^>]*>/)?.[0] ?? ''
    expect(balise).toContain('xmlns')
    for (const caractere of ['<b', '$', "'"]) {
      expect(balise).not.toContain(caractere)
    }
  })

  it('lit sp() comme une espace insécable et non comme « &nbsp; »', () => {
    const svg = svgDe(
      mathalea2d({ ...fenetre, description: `3${sp()}cm` }, trace()),
    )
    expect(svg.getAttribute('aria-label')).toBe('3\u00A0cm')
  })

  it('masque une figure décorative, description prioritaire', () => {
    const decorative = svgDe(
      mathalea2d({ ...fenetre, decorative: true }, trace()),
    )
    expect(decorative.getAttribute('aria-hidden')).toBe('true')
    expect(decorative.hasAttribute('role')).toBe(false)
    const lesDeux = svgDe(
      mathalea2d(
        { ...fenetre, decorative: true, description: 'Une figure.' },
        trace(),
      ),
    )
    expect(lesDeux.getAttribute('role')).toBe('img')
    expect(lesDeux.hasAttribute('aria-hidden')).toBe(false)
  })

  it.each([
    ['une description', { description: 'Figure avec un champ.' }],
    ['l’option décorative', { decorative: true }],
  ])(
    'avec %s, masque les étiquettes mais jamais les champs ni le conteneur',
    (_nom, option) => {
      const zone = analyse(
        mathalea2d({ ...fenetre, ...option }, trace(), etiquette(), champ()),
      )
      const [divEtiquette, divChamp] = zone.querySelectorAll('.divLatex')
      expect(divEtiquette.getAttribute('aria-hidden')).toBe('true')
      const mathField = divChamp.querySelector('math-field')
      expect(mathField).not.toBeNull()
      expect(mathField?.closest('[aria-hidden="true"]')).toBeNull()
      expect(
        zone.querySelector('.svgContainer')?.hasAttribute('aria-hidden'),
      ).toBe(false)
    },
  )

  it('laisse les étiquettes accessibles sans option', () => {
    const zone = analyse(mathalea2d(fenetre, trace(), etiquette()))
    expect(zone.querySelector('.divLatex')?.hasAttribute('aria-hidden')).toBe(
      false,
    )
  })

  it('ne change pas la sortie LaTeX', () => {
    context.isHtml = false
    const objets = [trace(), texteParPosition('A', 1, 1)]
    const sans = mathalea2d(fenetre, objets)
    expect(mathalea2d({ ...fenetre, description: 'Un texte.' }, objets)).toBe(
      sans,
    )
    expect(mathalea2d({ ...fenetre, decorative: true }, objets)).toBe(sans)
    expect(sans).not.toContain('Un texte')
  })

  it.each([
    'Carré de côté 3 cm.',
    'Avec < et > et " et $ et & aussi, width="999".',
  ])('ne change pas la sortie Typst (%s)', (description) => {
    // Mêmes objets à chaque appel : un objet neuf changerait de numéro d'`id`.
    const objets = [trace(), etiquette(), texteParPosition('//', 1, 1)]
    const typst = (options: object) => {
      const figures: string[] = []
      const texte = htmlToTypst(
        `Énoncé.<br>${mathalea2d({ ...fenetre, ...options }, objets)}`,
        figures,
      )
      return { texte, figures }
    }
    const sans = typst({})
    expect(sans.figures.join('')).toContain('width')
    expect(typst({ description })).toEqual(sans)
    expect(typst({ decorative: true })).toEqual(sans)
  })

  it('ne change pas les nombres relevés par le contrôle de stabilité', () => {
    const description = 'Longueur 7 cm > 2 cm, soit 12 < 13.'
    const objets = [trace(), etiquette()]
    const avec = mathalea2d({ ...fenetre, description }, objets)
    const sans = mathalea2d(fenetre, objets)
    expect(nombresAffiches(avec)).toEqual(nombresAffiches(sans))
  })
})

describe('exercices de référence', () => {
  const figuresDe = (html: string) =>
    Array.from(analyse(html).querySelectorAll('svg.mathalea2d'))
  const genere = (exercice: Exercice, graine: string) => {
    exercice.seed = graine
    exercice.numeroExercice = 0
    exercice.nouvelleVersionWrapper()
    return exercice
  }

  beforeEach(() => {
    context.isHtml = true
  })

  it('6M2B-1 décrit chaque figure en texte brut, sans donner l’aire', () => {
    for (const graine of ['a', 'b', 'c']) {
      for (const sup2 of [false, true]) {
        for (const sup of ['1', '2', '3', '4']) {
          const exercice = new AireCarreRectangle()
          exercice.sup = sup
          exercice.sup2 = sup2
          exercice.nbQuestions = 3
          genere(exercice, graine)
          exercice.listeQuestions.forEach((question) => {
            const [figure] = figuresDe(question)
            expect(figure.getAttribute('role')).toBe('img')
            const nom = figure.getAttribute('aria-label') ?? ''
            expect(nom).toMatch(/\d/)
            expect(nom).not.toMatch(/[$\\{}]|&nbsp;|\baire\b/)
          })
        }
      }
    }
  })

  it('6M2B-1 ne cite pas la réponse pour un carré ou un rectangle', () => {
    for (const sup of ['1', '2']) {
      const exercice = new AireCarreRectangle()
      exercice.sup = sup
      exercice.nbQuestions = 5
      genere(exercice, 'reponse')
      exercice.listeQuestions.forEach((question, i) => {
        const valeur = exercice.autoCorrection[i].valeur as unknown as {
          field0: { value: string }
        }
        const aire = valeur.field0.value
        const nom =
          figuresDe(question)[0]
            .getAttribute('aria-label')
            ?.split(/[\s\u00A0]/) ?? []
        expect(nom).not.toContain(aire)
      })
    }
  })

  it('6G0-7 déclare son exemption et ne révèle pas l’alignement', () => {
    expect(new Exercice().demandeLaVue).toBe(false)
    const exercice = new ReconnaitreDesPointsAlignes()
    expect(exercice.demandeLaVue).toBe(true)
    exercice.nbQuestions = 6
    genere(exercice, 'alignes')
    const descriptions = exercice.listeQuestions.map((question) =>
      (figuresDe(question)[0].getAttribute('aria-label') ?? '').replace(
        /\b[A-Z]\b/g,
        'X',
      ),
    )
    expect(new Set(descriptions).size).toBe(1)
    expect(descriptions[0]).toContain('X, X et X')
    // La correction, elle, peut donner la réponse.
    exercice.listeCorrections.forEach((correction) => {
      expect(figuresDe(correction)[0].getAttribute('aria-label')).toMatch(
        /passe/,
      )
    })
  })
})
