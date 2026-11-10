import { get } from 'svelte/store'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  bringTbiDocumentViewerToFront,
  closeTbiDocumentViewer,
  exportTbiLinkViewers,
  newViewerGeometry,
  openTbiDocuments,
  openTbiViewers,
  readSavedDocuments,
  replaceTbiDocument,
  restoreTbiLinkViewers,
  setTbiFigureSourceReader,
  tbiDocumentViewers,
  TBI_DOCUMENT_VIEWER_MIN_W,
} from '../../src/lib/stores/tbiDocumentStore'
import { parseTbiLink, webPageContent } from '../../src/lib/tbiLink'
import { newTbiNote, type TbiFigureContent } from '../../src/lib/tbiTextContent'

const pdf = () => new File(['x'], 'sujet.pdf', { type: 'application/pdf' })
const png = () => new File(['x'], 'photo.png', { type: 'image/png' })

describe('visualiseurs de document', () => {
  beforeEach(() => {
    tbiDocumentViewers.set([])
  })

  it('ouvre un visualiseur par fichier, en cascade et au premier plan', () => {
    openTbiDocuments([pdf()])
    openTbiDocuments([png(), pdf()])
    const viewers = get(tbiDocumentViewers)
    expect(viewers).toHaveLength(3)
    expect(new Set(viewers.map((v) => v.id)).size).toBe(3)
    expect(viewers.map((v) => v.z)).toEqual([1, 2, 3])
    expect(viewers[1].x).not.toBe(viewers[0].x)
    expect(viewers[1].y).toBeGreaterThan(viewers[0].y)
  })

  it('passe un visualiseur au premier plan', () => {
    openTbiDocuments([pdf(), png()])
    const [first] = get(tbiDocumentViewers)
    bringTbiDocumentViewerToFront(first.id)
    const viewers = get(tbiDocumentViewers)
    expect(viewers[0].z).toBeGreaterThan(viewers[1].z)
    // déjà au premier plan : rien ne change
    bringTbiDocumentViewerToFront(first.id)
    expect(get(tbiDocumentViewers)[0].z).toBe(viewers[0].z)
  })

  it('remplace le document puis ferme un visualiseur', () => {
    openTbiDocuments([pdf(), png()])
    const [first, second] = get(tbiDocumentViewers)
    const other = png()
    replaceTbiDocument(first.id, { type: 'file', file: other })
    expect(get(tbiDocumentViewers)[0].content).toEqual({
      type: 'file',
      file: other,
    })
    closeTbiDocumentViewer(first.id)
    expect(get(tbiDocumentViewers).map((v) => v.id)).toEqual([second.id])
  })

  it('ouvre un visualiseur vide et une vidéo au format 16/9', () => {
    openTbiViewers([
      null,
      {
        type: 'video',
        video: { provider: 'youtube', src: 'https://a.b/c', pageUrl: '' },
      },
    ])
    const [empty, video] = get(tbiDocumentViewers)
    expect(empty.content).toBeNull()
    expect(video.h - 36).toBeCloseTo((video.w * 9) / 16, 0)
  })

  it('passe au format 16/9 quand une vidéo remplace un document', () => {
    openTbiDocuments([pdf()])
    const [viewer] = get(tbiDocumentViewers)
    replaceTbiDocument(viewer.id, {
      type: 'video',
      video: { provider: 'peertube', src: 'https://a.b/c', pageUrl: '' },
    })
    const [after] = get(tbiDocumentViewers)
    expect(after.w).toBe(viewer.w)
    expect(after.h).toBe(Math.round((viewer.w * 9) / 16) + 36)
  })

  it('ouvre une figure dans un cadre plus grand qu’un document', () => {
    openTbiDocuments([pdf()])
    openTbiViewers([
      { type: 'figure', format: 'jessiecode', name: 'a.jc', source: '' },
    ])
    const [document, figure] = get(tbiDocumentViewers)
    expect(figure.w).toBeGreaterThanOrEqual(document.w)
    expect(figure.h).toBeGreaterThanOrEqual(document.h)
  })

  it('agrandit le cadre quand un fichier se révèle être une figure', () => {
    openTbiDocuments([new File(['{}'], 'figure.json')])
    const [viewer] = get(tbiDocumentViewers)
    replaceTbiDocument(viewer.id, {
      type: 'figure',
      format: 'apigeom',
      name: 'figure.json',
      source: '{}',
    })
    const [after] = get(tbiDocumentViewers)
    expect(after.w).toBeGreaterThanOrEqual(viewer.w)
    expect(after.x + after.w).toBeLessThanOrEqual(
      Math.max(window.innerWidth, viewer.x + viewer.w),
    )
    expect(after.y + after.h).toBeLessThanOrEqual(
      Math.max(window.innerHeight, viewer.y + viewer.h),
    )
  })

  it('ne fait rien sans fichier', () => {
    openTbiDocuments([])
    expect(get(tbiDocumentViewers)).toEqual([])
  })
})

describe('enregistrement dans une séance', () => {
  beforeEach(() => {
    tbiDocumentViewers.set([])
  })

  it('enregistre le lien saisi, dans l’ordre d’empilement', () => {
    openTbiViewers([
      parseTbiLink('https://youtu.be/dQw4w9WgXcQ?t=30'),
      parseTbiLink('https://a.fr/sujet.pdf'),
    ])
    const [video] = get(tbiDocumentViewers)
    bringTbiDocumentViewerToFront(video.id)
    expect(exportTbiLinkViewers().map((d) => d.url)).toEqual([
      'https://a.fr/sujet.pdf',
      'https://youtu.be/dQw4w9WgXcQ?t=30',
    ])
  })

  it('écarte les entrées invalides d’un fichier', () => {
    const valid = { url: 'https://a.fr/a.png', x: 1, y: 2, w: 300, h: 300 }
    expect(
      readSavedDocuments([
        valid,
        { ...valid, url: 'javascript:alert(1)' },
        { ...valid, w: 'grand' },
        null,
      ]),
    ).toEqual([valid])
    expect(readSavedDocuments('rien')).toEqual([])
  })

  it('rouvre les liens à leur place, sans fermer les fichiers', () => {
    openTbiDocuments([pdf()])
    openTbiViewers([parseTbiLink('https://a.fr/ancien.pdf')])
    restoreTbiLinkViewers([
      { url: 'https://youtu.be/dQw4w9WgXcQ', x: 10, y: 20, w: 400, h: 261 },
      // trop petit, hors de la fenêtre : ramené
      { url: 'https://a.fr/a.png', x: 99999, y: -50, w: 10, h: 10 },
    ])
    const viewers = get(tbiDocumentViewers)
    expect(viewers.map((v) => v.content?.type)).toEqual([
      'file',
      'video',
      'link',
    ])
    expect(viewers[1]).toMatchObject({ x: 10, y: 20, w: 400, h: 261 })
    expect(viewers[2].w).toBe(TBI_DOCUMENT_VIEWER_MIN_W)
    expect(viewers[2].x + viewers[2].w).toBeLessThanOrEqual(window.innerWidth)
    expect(viewers[2].y).toBe(0)
    expect(viewers[2].z).toBeGreaterThan(viewers[1].z)
  })

  it('enregistre les notes et les figures avec leur contenu', () => {
    const note = newTbiNote('# Titre')
    const figure: TbiFigureContent = {
      type: 'figure',
      format: 'jessiecode',
      name: 'a.jc',
      source: 'A = point(1, 2);',
    }
    openTbiDocuments([pdf()])
    openTbiViewers([note, figure])
    const saved = exportTbiLinkViewers()
    expect(saved.map((document) => document.content)).toEqual([note, figure])

    tbiDocumentViewers.set([])
    restoreTbiLinkViewers(readSavedDocuments(JSON.parse(JSON.stringify(saved))))
    expect(get(tbiDocumentViewers).map((viewer) => viewer.content)).toEqual([
      note,
      figure,
    ])
  })

  it('enregistre une figure telle qu’elle est à l’écran', () => {
    const source = (x: number, text = 'A') =>
      JSON.stringify({ apiGeomVersion: '1', A: { x, y: 0, text } })
    openTbiViewers([
      { type: 'figure', format: 'apigeom', name: 'a.json', source: source(1) },
    ])
    const [viewer] = get(tbiDocumentViewers)
    const savedSource = () => {
      const [saved] = exportTbiLinkViewers()
      return saved.content?.type === 'figure' ? saved.content.source : ''
    }
    expect(savedSource()).toBe(source(1))
    setTbiFigureSourceReader(viewer.id, () => source(5))
    expect(savedSource()).toBe(source(5))
    // un état que la réouverture refuserait ne fait pas perdre la figure
    setTbiFigureSourceReader(viewer.id, () =>
      source(5, '<img src=x onerror=alert(1)>'),
    )
    expect(savedSource()).toBe(source(1))
    setTbiFigureSourceReader(viewer.id, null)
    expect(savedSource()).toBe(source(1))
  })

  it('écarte une figure dangereuse d’un fichier reçu', () => {
    const geometry = { x: 1, y: 2, w: 300, h: 300 }
    const source = JSON.stringify({
      apiGeomVersion: '1',
      t: { text: '<img src=x onerror=alert(1)>' },
    })
    expect(
      readSavedDocuments([
        {
          ...geometry,
          content: { type: 'figure', format: 'apigeom', name: 'a', source },
        },
      ]),
    ).toEqual([])
  })

  it('garde sa taille à une page web qui remplace un document', () => {
    openTbiDocuments([pdf()])
    const [viewer] = get(tbiDocumentViewers)
    replaceTbiDocument(viewer.id, webPageContent('https://a.fr/'))
    expect(get(tbiDocumentViewers)[0].h).toBe(viewer.h)
  })
})

describe('newViewerGeometry', () => {
  it('reste dans une petite fenêtre', () => {
    const { x, y, w, h } = newViewerGeometry(5, 500, 400)
    expect(w).toBeGreaterThanOrEqual(TBI_DOCUMENT_VIEWER_MIN_W)
    expect(x + w).toBeLessThanOrEqual(500)
    expect(y + h).toBeLessThanOrEqual(400)
  })

  it('revient au point de départ après 8 visualiseurs', () => {
    expect(newViewerGeometry(8, 1920, 1080)).toEqual(
      newViewerGeometry(0, 1920, 1080),
    )
  })
})
