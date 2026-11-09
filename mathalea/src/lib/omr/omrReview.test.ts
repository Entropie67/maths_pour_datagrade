import { associerPage, ecarterPage } from './omrPageReview'
import { describe, expect, it, vi } from 'vitest'
import { webcrypto } from 'node:crypto'
import { lireSession } from './omrSession'
import type { OmrEvaluation } from './omrTypes'
import type { ResultatAnalyse } from './analyseScan'
import { noterCopie } from './scoring'
import {
  reponseAttendue,
  reviserResultat,
  revisionVide,
  validerCopies,
} from './omrReview'
import { construireFeedback } from './omrFeedback'

const evaluation: OmrEvaluation = {
  version: 1,
  sujet: { titre: 'Test # [texte]', checkSum: 'test', exercicesParams: [] },
  page: { widthPt: 595, heightPt: 842 },
  reperes: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
  copies: [
    {
      copieId: 'c',
      eleve: { id: 'e', nom: 'Élève "A"' },
      layoutId: 'l',
      pages: [1],
    },
  ],
  questions: [
    { qid: 'q', exercice: 0, question: 0, type: 'qcmMono', points: 2 },
  ],
  layouts: {
    l: [true, false].map((correct, i) => ({
      id: `q.${i}`,
      qid: 'q',
      page: 1,
      x: 0.1,
      y: 0.1,
      w: 0.02,
      h: 0.02,
      correct,
    })),
  },
}
function resultat(): ResultatAnalyse {
  const lectures = [
    { id: 'q.0', darkness: 0.12, status: 'ambigue' as const },
    { id: 'q.1', darkness: 0, status: 'vide' as const },
  ]
  return {
    pages: [{ rang: 1, copieId: 'c', page: 1, statut: 'ok', mesures: [] }],
    lectures: { c: lectures },
    copies: [noterCopie(evaluation, 'c', lectures, [1])],
    copiesAbsentes: [],
    seuils: {},
    revision: revisionVide(),
  }
}
describe('révision et restitution OMR', () => {
  it('rectifie une case sans perdre la mesure puis permet de revenir à la lecture automatique', () => {
    const r = resultat()
    r.revision!.cases.c = { 'q.0': 'cochee' }
    expect(reviserResultat(evaluation, r).copies[0]).toMatchObject({
      points: 2,
      aArbitrer: 0,
    })
    expect(r.lectures!.c[0].status).toBe('ambigue')
    delete r.revision!.cases.c['q.0']
    expect(reviserResultat(evaluation, r).copies[0].aArbitrer).toBe(1)
  })
  it('arbitre une réponse multiple par une note explicite et refuse les notes invalides', () => {
    const r = resultat()
    r.revision!.questions.c = {
      q: { points: 1, commentaire: 'Justification partielle.' },
    }
    expect(reviserResultat(evaluation, r).copies[0]).toMatchObject({
      points: 1,
      aArbitrer: 0,
    })
    for (const points of [-1, 3, NaN, Infinity]) {
      r.revision!.questions.c.q.points = points
      expect(() => reviserResultat(evaluation, r)).toThrow()
    }
  })
  it('utilise le corrigé de la version et échappe les données Typst', () => {
    expect(reponseAttendue(evaluation, 'c', 'q')).toBe('A')
    const source = construireFeedback(evaluation, resultat())
    expect(source).toContain('Note provisoire')
    expect(source).toContain(JSON.stringify('Élève "A"'))
    expect(source).toContain('Réponse à vérifier.')
  })
  it('valide toute la classe prête sans valider les arbitrages, absences ou copies incomplètes', () => {
    const r = resultat()
    r.copies = [
      { ...r.copies[0], copieId: 'prete', aArbitrer: 0 },
      {
        ...r.copies[0],
        copieId: 'incomplete',
        aArbitrer: 0,
        pagesManquantes: [2],
      },
      r.copies[0],
    ]
    r.copiesAbsentes = ['absente']
    const valide = validerCopies(r)
    expect(valide.revision!.validees).toEqual(['prete'])
    expect(r.revision!.validees).toEqual([])
    expect(validerCopies(valide).revision!.validees).toEqual(['prete'])
  })
  it('n’imprime aucun commentaire vide et conserve les commentaires échappés', () => {
    const r = resultat()
    r.revision!.questions.c = { q: { commentaire: '  ' } }
    const sans = construireFeedback(evaluation, r)
    expect(sans).not.toContain('text("  ")')
    expect(sans).toContain('Saisie')
    expect(sans).toContain('Exercice 1 —')
    expect(sans).toContain('Q1')
    r.revision!.questions.c.q.commentaire = '#include "secret"'
    expect(construireFeedback(evaluation, r)).toContain(
      JSON.stringify('Q1 : #include "secret"'),
    )
  })
  it('une validation ne masque pas une page manquante', () => {
    const r = resultat()
    r.revision!.validees = ['c']
    r.copies[0].pagesManquantes = [1]
    expect(construireFeedback(evaluation, r)).toContain('Note provisoire')
  })
})

it('reprend les décisions et refuse un scan différent', async () => {
  vi.stubGlobal('crypto', webcrypto)
  try {
    const scan = {
      arrayBuffer: async () => new TextEncoder().encode('scan original').buffer,
    } as Blob
    const empreinte = Buffer.from(
      await webcrypto.subtle.digest('SHA-256', await scan.arrayBuffer()),
    ).toString('hex')
    const r = resultat()
    r.revision!.cases.c = { 'q.0': 'cochee' }
    const fichier = JSON.stringify({
      version: 1,
      evaluation,
      resultat: r,
      empreinte,
    })
    expect((await lireSession(fichier, scan)).resultat.copies[0].points).toBe(2)
    const autre = {
      arrayBuffer: async () => new TextEncoder().encode('autre scan').buffer,
    } as Blob
    await expect(lireSession(fichier, autre)).rejects.toThrow(
      'ne correspond pas',
    )
  } finally {
    vi.unstubAllGlobals()
  }
})

describe('association des pages scannées', () => {
  const image = {
    width: 100,
    height: 140,
    data: new Uint8Array(14000).fill(255),
  }
  const association = {
    rang: 1,
    copieId: 'c',
    page: 1,
    retournee: false,
    manuelle: true,
    remplacer: false,
  }

  it('récupère une copie absente sans inventer de lecture quand les repères sont illisibles', () => {
    const r: ResultatAnalyse = {
      pages: [{ rang: 1, statut: 'qrIllisible', mesures: [] }],
      copies: [],
      copiesAbsentes: ['c'],
      lectures: {},
      seuils: {},
    }
    const corrige = associerPage(evaluation, r, image, association)
    expect(corrige.copiesAbsentes).toEqual([])
    expect(corrige.copies[0]).toMatchObject({
      points: 0,
      aArbitrer: 1,
      pagesManquantes: [],
    })
    expect(corrige.lectures!.c.every((l) => l.status === 'ambigue')).toBe(true)
    expect(r.copies).toEqual([])
  })

  it('refuse une association automatique sans repères et une page inexistante', () => {
    expect(() =>
      associerPage(evaluation, resultat(), image, {
        ...association,
        manuelle: false,
      }),
    ).toThrow('Repères introuvables')
    expect(() =>
      associerPage(evaluation, resultat(), image, { ...association, page: 2 }),
    ).toThrow('valides')
  })

  it('ne remplace un doublon que sur demande explicite', () => {
    const r = resultat()
    r.pages.push({ ...r.pages[0], rang: 2, statut: 'doublon' })
    expect(() =>
      associerPage(evaluation, r, image, { ...association, rang: 2 }),
    ).toThrow('remplacer')
    const corrige = associerPage(evaluation, r, image, {
      ...association,
      rang: 2,
      remplacer: true,
    })
    expect(corrige.pages.map((p) => p.statut)).toEqual(['doublon', 'ok'])
  })

  it('recalcule les seuils, retire les anciennes décisions et conserve les commentaires', () => {
    const r = resultat()
    r.revision!.cases.c = { 'q.0': 'cochee' }
    r.revision!.questions.c = { q: { points: 2, commentaire: 'À conserver.' } }
    r.revision!.validees = ['c']
    const corrige = associerPage(evaluation, r, image, association)
    expect(corrige.revision).toEqual({
      cases: {},
      questions: { c: { q: { commentaire: 'À conserver.' } } },
      validees: [],
    })
    expect(corrige.copies[0].aArbitrer).toBe(1)
  })

  it('écarte une feuille puis permet de la réassocier', () => {
    const r = ecarterPage(evaluation, resultat(), 1)
    expect(r.copiesAbsentes).toEqual(['c'])
    expect(r.pages[0].statut).toBe('ecartee')
    expect(
      associerPage(evaluation, r, image, association).copiesAbsentes,
    ).toEqual([])
  })
})
