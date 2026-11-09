import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  canvasPixelRatio,
  clampDocumentZoom,
  clampPage,
  clampSelection,
  containsRegion,
  documentKindOf,
  documentKindOfUrl,
  expandRegion,
  fitScale,
  loadTbiDocument,
  loadTbiDocumentFromUrl,
  looksLikePdf,
  nextRotation,
  regionOfPage,
  supportedFiles,
  TBI_DOCUMENT_MAX_ZOOM,
  TBI_DOCUMENT_MIN_ZOOM,
  visibleRegion,
  zoomForRegion,
} from '../../src/lib/tbiDocument'
import { webPageContent } from '../../src/lib/tbiLink'

describe('documentKindOf', () => {
  it('reconnaît un PDF et une image par leur type MIME', () => {
    expect(documentKindOf({ type: 'application/pdf', name: 'a' })).toBe('pdf')
    expect(documentKindOf({ type: 'image/jpeg', name: 'a' })).toBe('image')
  })

  it("se rabat sur l'extension quand le type est absent", () => {
    expect(documentKindOf({ type: '', name: 'Sujet.PDF' })).toBe('pdf')
    expect(documentKindOf({ type: '', name: 'photo.jpeg' })).toBe('image')
  })

  it('refuse les autres fichiers', () => {
    expect(documentKindOf({ type: 'text/plain', name: 'notes.txt' })).toBeNull()
    expect(documentKindOf({ type: '', name: 'sans-extension' })).toBeNull()
  })
})

describe('documentKindOfUrl', () => {
  it("lit l'extension du chemin, sans la requête", () => {
    expect(documentKindOfUrl('https://a.fr/Sujet.PDF?dl=1')).toBe('pdf')
    expect(documentKindOfUrl('https://a.fr/img/photo.webp')).toBe('image')
    expect(documentKindOfUrl('https://a.fr/document/17221/download')).toBeNull()
    expect(documentKindOfUrl('pas un lien')).toBeNull()
  })
})

describe('looksLikePdf', () => {
  it('reconnaît un PDF à ses premiers octets', async () => {
    expect(await looksLikePdf(new Blob(['%PDF-1.7 ...']))).toBe(true)
    expect(await looksLikePdf(new Blob(['<html>']))).toBe(false)
  })
})

describe('supportedFiles', () => {
  it('garde les fichiers pris en charge, dans leur ordre', () => {
    const texte = new File(['x'], 'notes.txt', { type: 'text/plain' })
    const image = new File(['x'], 'photo.png', { type: 'image/png' })
    const pdf = new File(['x'], 'sujet.pdf', { type: 'application/pdf' })
    expect(supportedFiles([image, texte, pdf])).toEqual([image, pdf])
    expect(supportedFiles(null)).toEqual([])
  })

  it('garde aussi les notes et les figures', () => {
    const note = new File(['x'], 'cours.md')
    const apigeom = new File(['{}'], 'figure.json')
    const jsxgraph = new File(['x'], 'figure.jc')
    expect(supportedFiles([note, apigeom, jsxgraph])).toEqual([
      note,
      apigeom,
      jsxgraph,
    ])
  })
})

describe('loadTbiDocument', () => {
  it('remplace un fichier texte par sa note ou sa figure', async () => {
    const note = new File(['# Titre'], 'cours.md')
    expect(await loadTbiDocument(note)).toEqual({
      type: 'markdown',
      text: '# Titre',
      fontSize: 1,
    })
    await expect(
      loadTbiDocument(new File(['{"a":1}'], 'autre.json')),
    ).rejects.toThrow('figure ApiGeom')
  })
})

describe('loadTbiDocumentFromUrl', () => {
  const page = 'https://exemple.fr/page'

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  function stubFetch(body: string, type: string, status = 200) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: status < 400,
        status,
        blob: async () => new Blob([body], { type }),
      })),
    )
  }

  /** Le site refuse le téléchargement et l'adresse n'est pas une image */
  function stubNotAnImage() {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('CORS')))
    // jsdom ne définit pas `decode`
    HTMLImageElement.prototype.decode = () =>
      Promise.reject(new Error('pas une image'))
  }

  it('affiche dans une iframe une page lisible qui n’est pas un document', async () => {
    stubFetch('<html></html>', 'text/html')
    expect(await loadTbiDocumentFromUrl(page)).toEqual(webPageContent(page))
  })

  it('affiche dans une iframe une page qui refuse le téléchargement', async () => {
    stubNotAnImage()
    expect(await loadTbiDocumentFromUrl(page)).toEqual(webPageContent(page))
  })

  it('n’affiche pas une adresse en erreur', async () => {
    stubFetch('', 'text/html', 404)
    await expect(loadTbiDocumentFromUrl(page)).rejects.toThrow('erreur 404')
  })

  it('ouvre une figure ou une note en ligne', async () => {
    stubFetch('{"apiGeomVersion":"1"}', 'application/json')
    expect(await loadTbiDocumentFromUrl('https://a.fr/f.json')).toMatchObject({
      type: 'figure',
      format: 'apigeom',
    })
    stubFetch('# Titre', 'text/markdown')
    expect(await loadTbiDocumentFromUrl('https://a.fr/n.md')).toMatchObject({
      type: 'markdown',
      text: '# Titre',
    })
  })

  it('affiche comme une page un autre fichier `.json` ou un `.html`', async () => {
    stubFetch('{"a":1}', 'application/json')
    const json = 'https://a.fr/data.json'
    expect(await loadTbiDocumentFromUrl(json)).toEqual(webPageContent(json))
    stubFetch('<p>JXG</p>', 'text/html')
    const html = 'https://a.fr/page.html'
    expect(await loadTbiDocumentFromUrl(html)).toEqual(webPageContent(html))
  })

  it('invite à déposer une figure qu’un site ne laisse pas télécharger', async () => {
    stubNotAnImage()
    await expect(loadTbiDocumentFromUrl('https://a.fr/f.json')).rejects.toThrow(
      'déposer',
    )
  })

  it('refuse une page http que le navigateur bloquerait', async () => {
    stubFetch('<html></html>', 'text/html')
    vi.stubGlobal('location', { protocol: 'https:' })
    await expect(loadTbiDocumentFromUrl('http://a.fr/')).rejects.toThrow('http')
  })
})

describe('fitScale', () => {
  it('ajuste à la largeur', () => {
    expect(fitScale(200, 400, 600, 300, 'width')).toBe(3)
  })

  it('ajuste la page entière au côté limitant', () => {
    expect(fitScale(200, 400, 600, 300, 'page')).toBe(0.75)
    expect(fitScale(400, 200, 200, 600, 'page')).toBe(0.5)
  })

  it('renvoie 1 tant que les tailles sont inconnues', () => {
    expect(fitScale(0, 0, 600, 300, 'page')).toBe(1)
    expect(fitScale(200, 400, 0, 0, 'width')).toBe(1)
  })
})

describe('clampDocumentZoom', () => {
  it('borne le zoom', () => {
    expect(clampDocumentZoom(100)).toBe(TBI_DOCUMENT_MAX_ZOOM)
    expect(clampDocumentZoom(0)).toBe(TBI_DOCUMENT_MIN_ZOOM)
    expect(clampDocumentZoom(1.5)).toBe(1.5)
    expect(clampDocumentZoom(Number.NaN)).toBe(1)
  })
})

describe('clampPage', () => {
  it('ramène le numéro dans le document', () => {
    expect(clampPage(0, 5)).toBe(1)
    expect(clampPage(9, 5)).toBe(5)
    expect(clampPage(2.6, 5)).toBe(3)
    expect(clampPage(Number.NaN, 5)).toBe(1)
  })
})

describe('canvasPixelRatio', () => {
  it("garde la densité de l'écran pour une page de taille courante", () => {
    expect(canvasPixelRatio(800, 1100, 2)).toBe(2)
  })

  it('réduit la densité au-delà des limites des navigateurs', () => {
    const ratio = canvasPixelRatio(6000, 8000, 2)
    expect(ratio).toBeLessThan(1)
    expect(6000 * ratio * 8000 * ratio).toBeLessThanOrEqual(16_000_001)
    expect(canvasPixelRatio(20_000, 100, 1) * 20_000).toBeLessThanOrEqual(
      16_000,
    )
  })
})

describe('nextRotation', () => {
  it("tourne d'un quart de tour et revient à 0", () => {
    expect(nextRotation(0)).toBe(90)
    expect(nextRotation(270)).toBe(0)
  })
})

describe('clampSelection', () => {
  const bounds = { left: 100, top: 50, width: 400, height: 300 }

  it('accepte les deux angles opposés dans les deux sens', () => {
    const expected = { left: 150, top: 100, width: 100, height: 80 }
    expect(
      clampSelection({ x: 150, y: 100 }, { x: 250, y: 180 }, bounds),
    ).toEqual(expected)
    expect(
      clampSelection({ x: 250, y: 180 }, { x: 150, y: 100 }, bounds),
    ).toEqual(expected)
    expect(
      clampSelection({ x: 250, y: 100 }, { x: 150, y: 180 }, bounds),
    ).toEqual(expected)
  })

  it('ramène la sélection dans la partie visible de la page', () => {
    expect(
      clampSelection({ x: 300, y: 200 }, { x: 900, y: -40 }, bounds),
    ).toEqual({ left: 300, top: 50, width: 200, height: 150 })
  })

  it('ignore un simple clic ou un tracé trop fin', () => {
    expect(clampSelection({ x: 200, y: 100 }, { x: 203, y: 104 }, bounds)).toBe(
      null,
    )
    expect(clampSelection({ x: 200, y: 100 }, { x: 400, y: 101 }, bounds)).toBe(
      null,
    )
  })
})

describe('regionOfPage', () => {
  it('exprime la sélection en fractions de la page', () => {
    const page = { left: 100, top: 0, width: 400, height: 800 }
    const selection = { left: 200, top: 200, width: 100, height: 400 }
    expect(regionOfPage(selection, page)).toEqual({
      left: 0.25,
      top: 0.25,
      width: 0.25,
      height: 0.5,
    })
  })
})

describe('zoomForRegion', () => {
  const region = { left: 0.1, top: 0.1, width: 0.25, height: 0.2 }

  it('remplit la largeur du cadre avec la zone choisie', () => {
    // page de 600 px à l'échelle 1 (ajustement 1) : zone de 150 px → 4×
    expect(zoomForRegion(region, 600, 600, 1)).toBe(4)
    // l'ajustement de référence est déjà pris en compte
    expect(zoomForRegion(region, 600, 600, 2)).toBe(2)
  })

  it('peut dézoomer pour une zone plus large que le cadre', () => {
    expect(zoomForRegion({ ...region, width: 1 }, 600, 300, 1)).toBe(0.5)
  })

  it('est bornée par le zoom maximal', () => {
    expect(zoomForRegion({ ...region, width: 0.001 }, 600, 600, 1)).toBe(
      TBI_DOCUMENT_MAX_ZOOM,
    )
  })

  it('renvoie 1 tant que les tailles sont inconnues', () => {
    expect(zoomForRegion(region, 0, 600, 1)).toBe(1)
    expect(zoomForRegion(region, 600, 0, 1)).toBe(1)
  })
})

describe('visibleRegion', () => {
  const view = { left: 0, top: 0, width: 400, height: 300 }

  it('exprime la partie visible dans le repère de la page', () => {
    // page de 2000 × 3000 dont l'angle est à (-500, -1000) à l'écran
    const page = { left: -500, top: -1000, width: 2000, height: 3000 }
    expect(visibleRegion(page, view)).toEqual({
      left: 500,
      top: 1000,
      width: 400,
      height: 300,
    })
  })

  it('se limite à la page quand elle est plus petite que le cadre', () => {
    const page = { left: 50, top: 20, width: 200, height: 100 }
    expect(visibleRegion(page, view)).toEqual({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    })
  })

  it('renvoie null pour une page hors du cadre', () => {
    const page = { left: 500, top: 0, width: 200, height: 100 }
    expect(visibleRegion(page, view)).toBe(null)
  })
})

describe('expandRegion', () => {
  it('élargit la zone sans sortir de la page', () => {
    const region = { left: 500, top: 1000, width: 400, height: 300 }
    expect(expandRegion(region, 200, 150, 2000, 3000)).toEqual({
      left: 300,
      top: 850,
      width: 800,
      height: 600,
    })
    expect(
      expandRegion(
        { left: 50, top: 0, width: 400, height: 300 },
        200,
        150,
        500,
        400,
      ),
    ).toEqual({ left: 0, top: 0, width: 500, height: 400 })
  })
})

describe('containsRegion', () => {
  const outer = { left: 100, top: 100, width: 800, height: 600 }

  it('accepte une zone incluse', () => {
    expect(
      containsRegion(outer, { left: 300, top: 250, width: 400, height: 300 }),
    ).toBe(true)
  })

  it('refuse une zone qui dépasse', () => {
    expect(
      containsRegion(outer, { left: 50, top: 250, width: 400, height: 300 }),
    ).toBe(false)
    expect(
      containsRegion(outer, { left: 300, top: 250, width: 400, height: 500 }),
    ).toBe(false)
  })

  it('tolère un pixel de différence', () => {
    expect(
      containsRegion(outer, { left: 99.5, top: 100, width: 400, height: 300 }),
    ).toBe(true)
  })
})
