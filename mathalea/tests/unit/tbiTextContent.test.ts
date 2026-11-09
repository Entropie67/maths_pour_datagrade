import { describe, expect, it } from 'vitest'
import {
  apigeomFigureError,
  apigeomViewport,
  clampNoteFontSize,
  jsxGraphSrcdoc,
  parseTextDocument,
  readSavedTextContent,
  textDocumentKindOf,
  TbiDocumentError,
  withoutApigeomViewport,
  type TbiFigureContent,
} from '../../src/lib/tbiTextContent'

const figure = (extra: object = {}) =>
  JSON.stringify({ apiGeomVersion: '1.8.12', ...extra })

describe('textDocumentKindOf', () => {
  it('reconnaît les notes et les figures par leur extension', () => {
    expect(textDocumentKindOf('cours.MD')).toBe('markdown')
    expect(textDocumentKindOf('figure.json')).toBe('apigeom')
    expect(textDocumentKindOf('figure.apigeom')).toBe('apigeom')
    expect(textDocumentKindOf('figure.js')).toBe('javascript')
    expect(textDocumentKindOf('figure.jc')).toBe('jessiecode')
    expect(textDocumentKindOf('page.html')).toBe('html')
  })

  it('refuse les autres fichiers', () => {
    expect(textDocumentKindOf('notes.txt')).toBeNull()
    expect(textDocumentKindOf('md')).toBeNull()
    expect(textDocumentKindOf('figure.ggb')).toBeNull()
  })
})

describe('apigeomFigureError', () => {
  it('accepte une figure, avec des balises simples et du texte contenant <', () => {
    expect(apigeomFigureError(figure())).toBeNull()
    expect(
      apigeomFigureError(figure({ t: { text: '<b>A</b><br/> a<b' } })),
    ).toBeNull()
    expect(apigeomFigureError(figure({ t: { text: '$x < 3$' } }))).toBeNull()
  })

  it('refuse un autre fichier JSON', () => {
    expect(apigeomFigureError('{ pas du json')).not.toBeNull()
    expect(apigeomFigureError('[1]')).not.toBeNull()
    expect(apigeomFigureError('{"a":1}')).not.toBeNull()
  })

  it('refuse une balise avec attribut, où qu’elle soit', () => {
    for (const extra of [
      { t: { text: '<img src=x onerror=alert(1)>' } },
      { t: { list: [{ label: '<svg onload=alert(1)>' }] } },
      { t: { text: '<script>alert(1)</script>' } },
      { '<img src=x onerror=alert(1)>': 1 },
      { t: { text: '<b onclick="alert(1)">A</b>' } },
    ]) {
      expect(apigeomFigureError(figure(extra))).not.toBeNull()
    }
  })

  it('ne vérifie pas les images, simples sources d’images', () => {
    expect(
      apigeomFigureError(
        figure({ images: { a: 'data:image/svg+xml,<svg width="1"></svg>' } }),
      ),
    ).toBeNull()
  })
})

describe('parseTextDocument', () => {
  it('ouvre une note et une figure', () => {
    expect(parseTextDocument('a.md', '# Titre')).toEqual({
      type: 'markdown',
      text: '# Titre',
      fontSize: 1,
    })
    expect(parseTextDocument('a.json', figure())).toMatchObject({
      type: 'figure',
      format: 'apigeom',
      name: 'a.json',
    })
    expect(
      parseTextDocument('a.js', "JXG.JSXGraph.initBoard('box', {})"),
    ).toMatchObject({ format: 'javascript' })
    expect(parseTextDocument('a.jc', 'A = point(1, 2);')).toMatchObject({
      format: 'jessiecode',
    })
  })

  it('refuse un fichier qui n’est pas une figure, avec un message', () => {
    for (const [name, text] of [
      ['a.json', '{"a":1}'],
      ['a.js', 'console.log(1)'],
      ['a.html', '<p>bonjour</p>'],
      ['a.txt', 'texte'],
    ]) {
      expect(() => parseTextDocument(name, text)).toThrow(TbiDocumentError)
    }
  })
})

describe('readSavedTextContent', () => {
  it('relit une note et borne sa taille', () => {
    expect(
      readSavedTextContent({ type: 'markdown', text: 'a', fontSize: 99 }),
    ).toEqual({ type: 'markdown', text: 'a', fontSize: 5 })
    expect(clampNoteFontSize(Number('grand'))).toBe(1)
  })

  it('relit une figure', () => {
    const saved = {
      type: 'figure',
      format: 'jessiecode',
      name: 'a.jc',
      source: 'A = point(1, 2);',
    }
    expect(readSavedTextContent(saved)).toEqual(saved)
  })

  it('écarte un contenu invalide ou dangereux', () => {
    expect(readSavedTextContent(null)).toBeNull()
    expect(readSavedTextContent({ type: 'markdown' })).toBeNull()
    expect(
      readSavedTextContent({
        type: 'figure',
        format: 'exe',
        name: 'a',
        source: '',
      }),
    ).toBeNull()
    expect(
      readSavedTextContent({
        type: 'figure',
        format: 'apigeom',
        name: 'a.json',
        source: figure({ t: { text: '<img src=x onerror=alert(1)>' } }),
      }),
    ).toBeNull()
  })
})

describe('apigeomViewport', () => {
  it('montre tous les éléments positionnés, avec une marge, centrés', () => {
    const json = {
      xMin: -100,
      scale: 3,
      A: { type: 'Point', x: 0, y: 0 },
      B: { type: 'Point', x: 10, y: 4 },
      C: { type: 'Segment', idPoint1: 'A' },
      options: { x: 999, y: 999 },
    }
    const viewport = apigeomViewport(json, 650, 700)
    // 13 unités de large pour 650 px : 50 px par unité
    expect(viewport?.pixelsPerUnit).toBe(50)
    expect(viewport?.xMin).toBeCloseTo(-1.5)
    expect(viewport?.yMin).toBeCloseTo(2 - 7)
  })

  it('garde l’étendue d’une grille, pour une courbe sans position', () => {
    const viewport = apigeomViewport(
      {
        slider: { type: 'Slider', x: -3, y: 6 },
        courbe: { type: 'GraphTemplate', templateString: '${a}x' },
        grille: { type: 'Grid', xMin: -10, xMax: 10, yMin: -5, yMax: 5 },
      },
      460,
      460,
    )
    // 23 unités de large pour 460 px : 20 px par unité
    expect(viewport?.pixelsPerUnit).toBe(20)
    expect(viewport?.xMin).toBeCloseTo(-11.5)
  })

  it('tient compte des échelles des axes', () => {
    const viewport = apigeomViewport(
      { xScale: 2, A: { x: 0, y: 0 }, B: { x: 7, y: 0 } },
      1000,
      1000,
    )
    expect(viewport?.pixelsPerUnit).toBe(50)
  })

  it('garde le cadrage enregistré sans élément positionné', () => {
    expect(apigeomViewport({ C: { type: 'Segment' } }, 100, 100)).toBeNull()
    expect(apigeomViewport({ A: { x: 0, y: 0 } }, 0, 100)).toBeNull()
  })

  it('retire seulement le cadrage de la figure', () => {
    expect(
      withoutApigeomViewport({
        xMin: 1,
        yMin: 2,
        scale: 3,
        zoomLevel: 4,
        pixelsPerUnit: 5,
        xScale: 6,
        A: {},
      }),
    ).toEqual({ xScale: 6, A: {} })
  })
})

describe('jsxGraphSrcdoc', () => {
  const assets = { coreUrl: 'https://a.fr/core.js', css: '.a{}' }
  const content = (
    format: TbiFigureContent['format'],
    source: string,
  ): TbiFigureContent => ({ type: 'figure', format, name: 'a', source })

  it('charge la bibliothèque puis le code', () => {
    const html = jsxGraphSrcdoc(content('javascript', 'JXG.x()'), assets)
    expect(html.indexOf('core.js')).toBeLessThan(html.indexOf('JXG.x()'))
    expect(html).toContain('.a{}')
  })

  it('ne laisse pas le code refermer sa balise', () => {
    const js = jsxGraphSrcdoc(
      content('javascript', 'a="</script><img onerror=x>"'),
      assets,
    )
    expect(js).not.toContain('</script><img')
    const jc = jsxGraphSrcdoc(
      content('jessiecode', '</script><img onerror=x>'),
      assets,
    )
    expect(jc).not.toContain('</script><img')
    expect(jc).toContain('board.jc.parse(')
  })

  it('complète une page HTML sans la réécrire', () => {
    const html = jsxGraphSrcdoc(
      content('html', '<html><head lang="fr"><title>t</title></head></html>'),
      assets,
    )
    expect(html).toMatch(/^<html><head lang="fr"><script>/)
    expect(html).toContain('core.js')
    expect(html).toContain('<title>t</title>')
    expect(jsxGraphSrcdoc(content('html', '<p>JXG</p>'), assets)).toContain(
      'core.js',
    )
  })
})
