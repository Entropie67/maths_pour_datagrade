import { associerPage } from '../../src/lib/omr/omrPageReview'
import { beforeAll, describe, expect, it } from 'vitest'
import { analyserScan } from '../../src/lib/omr/analyseScan'
import type { OmrDocumentSource } from '../../src/lib/omr/buildOmrDocument'
import { idCase } from '../../src/lib/omr/buildOmrDocument'
import { otsuThreshold } from '../../src/lib/omr/binarize'
import { pageToImage } from '../../src/lib/omr/registration'
import type {
  GrayImage,
  OmrBox,
  OmrEvaluation,
} from '../../src/lib/omr/omrTypes'
import {
  compilerLot,
  copierImage,
  documentDepuisPages,
  noircir,
  retourner,
  typstDisponible,
} from './omrScanFixture'

/**
 * Bout en bout, sur un lot de trois copies : génération, impression simulée,
 * numérisation simulée, puis correction. Le scan est volontairement imparfait —
 * pages mélangées, une feuille à l'envers, une feuille manquante — parce que
 * c'est là que la chaîne doit prouver qu'elle ne se trompe pas en silence.
 */

const decrire = typstDisponible() ? describe : describe.skip

function questions(): OmrDocumentSource['copies'][number]['questions'] {
  return [
    {
      qid: 'q1',
      type: 'qcmMono',
      enonce: 'Combien font $3 times 4$ ?',
      points: 2,
      propositions: [
        { texte: '$12$', correct: true },
        { texte: '$7$', correct: false },
        { texte: '$34$', correct: false },
      ],
    },
    {
      qid: 'q2',
      type: 'AMCNum',
      enonce: 'Donnez le résultat de $57 + 68$.',
      points: 3,
      colonnes: ['centaines', 'dizaines', 'unités'].map((label, index) => ({
        label,
        attendu: ['1', '2', '5'][index],
        valeurs: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      })),
    },
    {
      qid: 'q3',
      type: 'AMCOpen',
      enonce: 'Justifiez votre démarche.',
      points: 3,
    },
  ]
}

const SOURCE: OmrDocumentSource = {
  titre: 'Contrôle de calcul',
  sujetId: 'SUJ7',
  copies: [
    {
      copieId: 'c01',
      eleve: { id: 'e1', nom: 'Alice Martin' },
      exercices: [{ questions: questions() }],
    },
    {
      copieId: 'c02',
      eleve: { id: 'e2', nom: 'Bo Nguyen' },
      exercices: [{ questions: questions() }],
    },
    {
      copieId: 'c03',
      eleve: { id: 'e3', nom: 'Chen Wei' },
      exercices: [{ questions: questions() }],
    },
  ],
}

decrire('analyse d’un lot de copies scannées', () => {
  let evaluation: OmrEvaluation
  let rendus: GrayImage[]

  beforeAll(() => {
    const lot = compilerLot(SOURCE)
    evaluation = lot.evaluation
    rendus = lot.pages
  })

  /** Prépare la page physique `rang`, en y noircissant les cases demandées. */
  function preparer(rang: number, ids: string[]): GrayImage {
    const image = copierImage(rendus[rang - 1])
    if (ids.length === 0) return image
    const projection = pageToImage(
      image,
      otsuThreshold(image),
      evaluation.reperes,
    )
    expect(projection, `recalage de la page ${rang}`).not.toBeNull()
    const boxes = Object.values(evaluation.layouts)[0]
    for (const id of ids) {
      const box = boxes.find((b) => b.id === id)
      expect(box, `case ${id} inconnue`).toBeDefined()
      noircir(image, projection as Float64Array, box as OmrBox)
    }
    return image
  }

  it('relit une page identifiée à la main, même retournée, sans son QR', async () => {
    const image = preparer(1, [idCase('q1', 0)])
    const r = await analyserScan(documentDepuisPages([image]), evaluation)
    r.pages[0] = { rang: 1, statut: 'qrIllisible', mesures: [] }
    r.copies = []
    r.lectures = {}
    r.copiesAbsentes = evaluation.copies.map((c) => c.copieId)
    const corrige = associerPage(evaluation, r, retourner(image), {
      rang: 1,
      copieId: 'c01',
      page: 1,
      retournee: true,
      manuelle: false,
      remplacer: false,
    })
    expect(corrige.pages[0].statut).toBe('ok')
    expect(corrige.copies[0].questions[0]).toMatchObject({
      points: 2,
      reponse: 'A',
    })
    expect(corrige.copiesAbsentes).not.toContain('c01')
  })

  it('écarte un doublon sans mélanger ses mesures à la première page', async () => {
    const premiere = preparer(1, [idCase('q1', 0)])
    const doublon = preparer(1, [idCase('q1', 1)])
    const resultat = await analyserScan(
      documentDepuisPages([premiere, doublon]),
      evaluation,
    )
    expect(resultat.pages.map((p) => p.statut)).toEqual(['ok', 'doublon'])
    expect(resultat.copies[0].questions[0]).toMatchObject({
      points: 2,
      reponse: 'A',
    })
    expect(resultat.lectures?.c01).toBeDefined()
  })

  it('corrige un lot complet et bien rangé', async () => {
    // Alice : tout juste. Bo : QCM faux, nombre juste, pas de note. Chen : rien.
    const pages = [
      preparer(1, [
        idCase('q1', 0),
        idCase('q2', '0_1'),
        idCase('q2', '1_2'),
        idCase('q2', '2_5'),
        idCase('q3', 3),
      ]),
      preparer(2, [
        idCase('q1', 1),
        idCase('q2', '0_1'),
        idCase('q2', '1_2'),
        idCase('q2', '2_5'),
      ]),
      preparer(3, []),
    ]
    const resultat = await analyserScan(documentDepuisPages(pages), evaluation)

    expect(resultat.pages.every((p) => p.statut === 'ok')).toBe(true)
    expect(resultat.copiesAbsentes).toEqual([])

    const alice = resultat.copies.find((c) => c.copieId === 'c01')
    expect(alice?.points).toBe(8)
    expect(alice?.pointsMax).toBe(8)
    expect(alice?.aArbitrer).toBe(0)

    const bo = resultat.copies.find((c) => c.copieId === 'c02')
    expect(bo?.questions.find((q) => q.qid === 'q1')).toMatchObject({
      statut: 'lu',
      points: 0,
      reponse: 'B',
    })
    expect(bo?.questions.find((q) => q.qid === 'q2')).toMatchObject({
      statut: 'lu',
      points: 3,
      reponse: '125',
    })
    expect(bo?.questions.find((q) => q.qid === 'q3')?.statut).toBe(
      'sansReponse',
    )
    expect(bo?.points).toBe(3)

    const chen = resultat.copies.find((c) => c.copieId === 'c03')
    expect(chen?.points).toBe(0)
    expect(chen?.questions.every((q) => q.statut === 'sansReponse')).toBe(true)
  })

  it('retrouve les copies quel que soit l’ordre des feuilles', async () => {
    // le chargeur d'un photocopieur ne garantit rien : c'est le QR qui range
    const pages = [
      preparer(3, [idCase('q1', 2)]),
      preparer(1, [idCase('q1', 0)]),
      preparer(2, [idCase('q1', 1)]),
    ]
    const resultat = await analyserScan(documentDepuisPages(pages), evaluation)
    expect(
      resultat.copies.find((c) => c.copieId === 'c01')?.questions[0].reponse,
    ).toBe('A')
    expect(
      resultat.copies.find((c) => c.copieId === 'c02')?.questions[0].reponse,
    ).toBe('B')
    expect(
      resultat.copies.find((c) => c.copieId === 'c03')?.questions[0].reponse,
    ).toBe('C')
  })

  it('redresse une feuille passée à l’envers plutôt que de la rejeter', async () => {
    const pages = [
      retourner(preparer(1, [idCase('q1', 0), idCase('q3', 2)])),
      preparer(2, []),
      preparer(3, []),
    ]
    const resultat = await analyserScan(documentDepuisPages(pages), evaluation)
    const page = resultat.pages[0]
    expect(page.statut).toBe('ok')
    expect(page.retournee).toBe(true)
    const alice = resultat.copies.find((c) => c.copieId === 'c01')
    expect(alice?.questions.find((q) => q.qid === 'q1')?.reponse).toBe('A')
    expect(alice?.questions.find((q) => q.qid === 'q3')?.points).toBe(2)
  })

  it('signale une copie absente du lot au lieu de lui mettre zéro', async () => {
    const pages = [preparer(1, [idCase('q1', 0)]), preparer(2, [])]
    const resultat = await analyserScan(documentDepuisPages(pages), evaluation)
    expect(resultat.copiesAbsentes).toEqual(['c03'])
    expect(resultat.copies.map((c) => c.copieId)).toEqual(['c01', 'c02'])
  })

  it('signale une page sans QR-code lisible', async () => {
    // une feuille étrangère glissée dans le lot, ou un scan raté
    const blanche: GrayImage = {
      width: rendus[0].width,
      height: rendus[0].height,
      data: new Uint8Array(rendus[0].data.length).fill(255),
    }
    const resultat = await analyserScan(
      documentDepuisPages([blanche, preparer(1, [])]),
      evaluation,
    )
    expect(resultat.pages[0].statut).toBe('qrIllisible')
    expect(resultat.pages[1].statut).toBe('ok')
  })

  it('rend compte de l’avancement et sait s’interrompre', async () => {
    const avancements: number[] = []
    const controle = new AbortController()
    const pages = [preparer(1, []), preparer(2, []), preparer(3, [])]
    await analyserScan(documentDepuisPages(pages), evaluation, {
      signal: controle.signal,
      onProgress: ({ page, total }) => {
        avancements.push(page)
        expect(total).toBe(3)
        if (page === 2) controle.abort()
      },
    })
    expect(avancements).toEqual([1, 2])
  })

  it('calcule un seuil par copie, jamais un seuil global', async () => {
    // une copie plus grise que les autres — scanner mal réglé sur ce passage —
    // ne doit pas déplacer la décision sur les copies voisines
    const grisee = preparer(2, [idCase('q1', 1)])
    for (let i = 0; i < grisee.data.length; i++) {
      grisee.data[i] = Math.max(0, grisee.data[i] - 40)
    }
    const resultat = await analyserScan(
      documentDepuisPages([
        preparer(1, [idCase('q1', 0)]),
        grisee,
        preparer(3, []),
      ]),
      evaluation,
    )
    expect(Object.keys(resultat.seuils).sort()).toEqual(['c01', 'c02', 'c03'])
    expect(
      resultat.copies.find((c) => c.copieId === 'c01')?.questions[0].reponse,
    ).toBe('A')
    expect(
      resultat.copies.find((c) => c.copieId === 'c02')?.questions[0].reponse,
    ).toBe('B')
    expect(
      resultat.copies.find((c) => c.copieId === 'c03')?.questions[0].statut,
    ).toBe('sansReponse')
  })
})
