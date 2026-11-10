import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  assemblerGabarit,
  buildOmrDocument,
  defaultOmrDocumentOptions,
  idCase,
  rendreCorriges,
  type OmrDocumentSource,
} from './buildOmrDocument'
import { buildEvaluation, parseAnchors, type OmrAnchor } from './omrLayout'
import { OMR_QR_VERSION } from './omrTypstTemplate'

const SOURCE: OmrDocumentSource = {
  titre: 'Évaluation de test',
  sujetId: 'SUJ7',
  consigne: 'Une seule réponse par question.',
  copies: [
    {
      copieId: 'c01',
      eleve: { id: 'e1', nom: 'Alice Martin' },
      exercices: [
        {
          titre: 'Tables de multiplication',
          questions: [
            {
              qid: 'q1',
              type: 'qcmMono',
              enonce: 'Combien font $3 times 4$ ?',
              points: 1,
              propositions: [
                { texte: '$12$', correct: true },
                { texte: '$7$', correct: false },
                { texte: '$34$', correct: false },
              ],
            },
          ],
        },
        {
          titre: 'Additions posées',
          questions: [
            {
              qid: 'q2',
              type: 'AMCNum',
              enonce: 'Donnez le résultat de $57 + 68$.',
              points: 2,
              colonnes: [
                { label: 'centaines', attendu: '1', valeurs: ['0', '1', '2'] },
                {
                  label: 'dizaines',
                  attendu: '2',
                  valeurs: ['0', '1', '2', '3'],
                },
                { label: 'unités', attendu: '5', valeurs: ['4', '5', '6'] },
              ],
            },
            {
              qid: 'q3',
              type: 'AMCOpen',
              enonce: 'Justifiez votre démarche.',
              points: 3,
            },
          ],
        },
      ],
    },
  ],
}

describe('buildOmrDocument', () => {
  const code = buildOmrDocument(SOURCE)

  it('émet un préambule complet et le fond de calage', () => {
    expect(code).toContain('#import "@preview/tiaoma:0.3.0": qrcode')
    expect(code).toContain('background: omr-calage')
    expect(code).toContain('#let omr-box(copie, id)')
    expect(code).toContain('<omr-box>')
  })

  it('écrit en dur l’identifiant de copie dans chaque case', () => {
    // le générateur connaît la copie : inutile de la faire porter par un
    // `state` Typst, dont l'ordre de résolution entre corps et en-tête est
    // une source classique d'erreur silencieuse
    expect(code).toContain('omr-box("c01", "q1.0")')
    expect(code).toContain('omr-box("c01", "q2.1_2")')
    expect(code).toContain('omr-box("c01", "q3.0")')
  })

  it('produit une case par proposition, par chiffre et par point de barème', () => {
    const cases = [...code.matchAll(/omr-box\("c01", "([^"]+)"\)/g)].map(
      (m) => m[1],
    )
    // 3 propositions + (3 + 4 + 3) chiffres + 4 cases de barème (0 à 3)
    expect(cases).toHaveLength(3 + 10 + 4)
    expect(new Set(cases).size).toBe(cases.length)
  })

  it('dispose les propositions horizontalement même sans préférence de l’auteur', () => {
    expect(code).toContain('columns: (1fr,) * 3')
    const source = structuredClone(SOURCE)
    const question = source.copies[0].exercices[0].questions[0]
    if (question.type === 'qcmMono') question.horizontal = false
    expect(buildOmrDocument(source)).toContain('columns: (1fr,) * 3')
  })

  it('publie le rang physique de la feuille, pas un compteur de page', () => {
    // dans un en-tête Typst, l'incrément automatique du compteur de page n'est
    // pas encore visible : un compteur y annoncerait une valeur décalée, et le
    // QR renverrait alors vers la mauvaise page du corrigé
    const entete = code.slice(
      code.indexOf('#let omr-entete('),
      code.indexOf('#let omr-consigne'),
    )
    expect(entete).toContain('str(here().position().page)')
    expect(entete).not.toMatch(/counter\(page\)/)
  })

  it('assemble le cadre de copie dans un gabarit réutilisable', () => {
    // le cadre (en-tête nominatif, consigne, espacements) vit dans une fonction
    // `omr-copie`, appelée une fois par élève : le professeur peut le retoucher
    // dans l'aperçu et la retouche vaut alors pour toute la classe
    expect(code).toContain(
      '#let omr-copie(titre, eleve-nom, sujet-id, copie-id, consigne, corps)',
    )
    expect(code).toContain(
      'omr-entete(titre, eleve-nom, sujet-id, copie-id, style: "epure", subtitle: "", header-line: "")',
    )
  })

  it('passe le sujet, l’élève et la copie à l’appel du gabarit', () => {
    expect(code).toContain('#omr-copie(\n  "Évaluation de test",')
    expect(code).toContain('"Alice Martin",')
    expect(code).toContain('"SUJ7",')
    expect(code).toContain(`"${OMR_QR_VERSION}|" + sujet + "|" + copie + "|"`)
  })

  it('sépare les copies par un saut de page', () => {
    const deuxCopies = buildOmrDocument({
      ...SOURCE,
      copies: [
        SOURCE.copies[0],
        {
          ...SOURCE.copies[0],
          copieId: 'c02',
          eleve: { id: 'e2', nom: 'Bo Nguyen' },
        },
      ],
    })
    expect(deuxCopies).toContain('#pagebreak()')
    expect(deuxCopies).toContain('omr-box("c02", "q1.0")')
  })

  it('échappe les guillemets d’un nom d’élève', () => {
    const avecGuillemet = buildOmrDocument({
      ...SOURCE,
      copies: [
        {
          ...SOURCE.copies[0],
          eleve: { id: 'e3', nom: 'Anne "Nane" O\\Brien' },
        },
      ],
    })
    expect(avecGuillemet).toContain('"Anne \\"Nane\\" O\\\\Brien"')
  })
})

describe('assemblerGabarit', () => {
  it('sépare le gabarit commun du corps de chaque copie', () => {
    const source: OmrDocumentSource = {
      ...SOURCE,
      copies: ['c01', 'c02'].map((copieId) => ({
        ...SOURCE.copies[0],
        copieId,
        eleve: { id: copieId, nom: copieId },
      })),
    }
    const { gabarit, corpsParCopie } = assemblerGabarit(source)
    expect(gabarit).toContain('#let omr-copie(')
    // le gabarit ne porte aucune donnée d'élève : elles arrivent à l'appel
    expect(gabarit).not.toContain('omr-box("c01"')
    expect([...corpsParCopie.keys()]).toEqual(['c01', 'c02'])
    expect(corpsParCopie.get('c01')).toContain('omr-box("c01", "q1.0")')
    expect(corpsParCopie.get('c02')).toContain('omr-box("c02", "q1.0")')
  })

  it('expose une variable de mise en page par exercice, et un repère', () => {
    // c'est ce que règlent les pastilles de l'aperçu : les variables vivent
    // dans le gabarit, donc une retouche vaut pour toute la classe
    const { gabarit, corpsParCopie } = assemblerGabarit(SOURCE)
    expect(gabarit).toContain('#let ex1-colonnes = 1')
    expect(gabarit).toContain('#let ex2-gutter = 1.2em')
    expect(gabarit).not.toContain('#let ex3-colonnes')
    const corps = corpsParCopie.get('c01') as string
    expect(corps).toContain('#tasks(columns: ex1-colonnes')
    expect(corps).toContain('row-gutter: ex2-gutter')
    // le repère des réglages est posé au bord droit de la colonne de texte,
    // dans un bloc de hauteur nulle qui ne déplace rien
    expect(corps).toContain('place(top + right, mathalea-anchor("exo", 2))')
    expect(corps).toContain('#mathalea-anchor("gap", 0)')
  })

  it('recommence la numérotation à 1 pour chaque exercice', () => {
    const corps = assemblerGabarit(SOURCE).corpsParCopie.get('c01') as string
    expect(corps.match(/start: 1\)/g)).toHaveLength(2)
    expect(corps).not.toContain('start: 2)')
  })

  it('garde une numérotation continue si tous les exercices sont fusionnés', () => {
    const corps = assemblerGabarit(SOURCE, {
      ...defaultOmrDocumentOptions,
      mergeExercises: true,
    }).corpsParCopie.get('c01') as string
    expect(corps).toContain('start: 1)')
    expect(corps).toContain('start: 2)')
    expect(corps).not.toContain('"Additions posées"')
    expect(corps).not.toContain('"Tables de multiplication"')
    expect(corps).toContain('omr-box("c01", "q2.1_2")')
  })

  it('reporte les réglages du volet dans le gabarit', () => {
    const { gabarit } = assemblerGabarit(SOURCE, {
      ...defaultOmrDocumentOptions,
      headerStyle: 'cadre',
      font: 'Lora',
      fontSize: 12,
      showFooter: false,
      boldQuestionNumbers: false,
    })
    expect(gabarit).toContain('style: "cadre"')
    // les polices passent par les variables du préambule « Impression », que
    // le HTML converti référence lui aussi (`#txt(...)`)
    expect(gabarit).toContain('#let police-texte = "Lora"')
    expect(gabarit).toContain('#let taille-texte = 12pt')
    expect(gabarit).toContain(
      '#set text(font: police-texte, size: taille-texte',
    )
    expect(gabarit).toContain('footer: none,')
    const corps = assemblerGabarit(SOURCE, {
      ...defaultOmrDocumentOptions,
      boldQuestionNumbers: false,
    }).corpsParCopie.get('c01') as string
    expect(corps).toContain('label: "1."')
  })

  it('échappe les textes libres de l’en-tête et du pied et publie leurs repères', () => {
    const { gabarit } = assemblerGabarit(SOURCE, {
      ...defaultOmrDocumentOptions,
      subtitle: 'Classe "A" #panic("sous-titre")',
      headerLine: 'Durée : 1 h [aucun matériel]',
      footerText: 'Pied ] #panic("pied") [',
    })
    expect(gabarit).toContain(
      'subtitle: "Classe \\"A\\" #panic(\\"sous-titre\\")"',
    )
    expect(gabarit).toContain('header-line: "Durée : 1 h [aucun matériel]"')
    expect(gabarit).toContain('align(left, "Pied ] #panic(\\"pied\\") [")')
    expect(gabarit).toContain('mathalea-anchor("header", 0)')
    expect(gabarit).toContain('#mathalea-anchor("footer", 0)')
    expect(gabarit.indexOf('#let mathalea-anchor(')).toBeLessThan(
      gabarit.indexOf('#let omr-entete('),
    )
  })

  it('déclare les aides auxquelles le HTML converti se réfère', () => {
    // `htmlToTypst` produit du code qui suppose le préambule de la vue
    // « Impression » : `#txt(...)` pour le `\\text{}` de LaTeX, `police-texte`
    // pour la police. Sans ces déclarations, la compilation échoue sur un
    // « unknown variable » que rien dans l'énoncé ne laissait prévoir.
    const { gabarit } = assemblerGabarit(SOURCE)
    expect(gabarit).toContain('#let txt(corps) = text(font: police-texte')
    expect(gabarit).toContain('#let police-texte =')
    expect(gabarit).toContain('#let police-maths =')
    expect(gabarit).toContain('#let taille-texte =')
    expect(gabarit).toContain('#let couleur =')
  })

  it('n’importe un paquet que si le contenu s’en sert', () => {
    // le préambule reste au plus court : importer cetz ou vartable sans raison
    // ferait télécharger un paquet à chaque compilation d’aperçu
    const { gabarit } = assemblerGabarit(SOURCE)
    expect(gabarit).not.toContain('vartable')
    expect(gabarit).not.toContain('cetz')

    const avecTableau: OmrDocumentSource = {
      ...SOURCE,
      copies: [
        {
          ...SOURCE.copies[0],
          exercices: [
            {
              questions: [
                {
                  ...SOURCE.copies[0].exercices[0].questions[0],
                  enonce: '#tabvar(...)',
                },
              ],
            },
          ],
        },
      ],
    }
    expect(assemblerGabarit(avecTableau).gabarit).toContain('vartable')
  })

  it('déclare les figures dans le bloc de chaque copie, jamais au gabarit', () => {
    // le `#let` y est local : deux copies peuvent avoir chacune leur `fig-1`,
    // ce qu'une graine par élève rend inévitable
    const source: OmrDocumentSource = {
      ...SOURCE,
      copies: ['c01', 'c02'].map((copieId) => ({
        ...SOURCE.copies[0],
        copieId,
        eleve: { id: copieId, nom: copieId },
        figures: [`image("${copieId}.svg")`],
      })),
    }
    const { gabarit, corpsParCopie } = assemblerGabarit(source)
    expect(gabarit).not.toContain('#let fig-1')
    expect(gabarit).toContain('mathalea-fit')
    expect(corpsParCopie.get('c01')).toContain('#let fig-1 = image("c01.svg")')
    expect(corpsParCopie.get('c02')).toContain('#let fig-1 = image("c02.svg")')
  })

  it('imprime la virgule d’un décimal entre ses colonnes de cases', () => {
    // sans elle, « 12,5 » et « 125 » se noirciraient de la même façon
    const source: OmrDocumentSource = {
      ...SOURCE,
      copies: [
        {
          ...SOURCE.copies[0],
          exercices: [
            {
              titre: 'Décimaux',
              questions: [
                {
                  qid: 'q1',
                  type: 'AMCNum',
                  enonce: 'Le prix ?',
                  points: 1,
                  colonnes: [
                    { attendu: '1', valeurs: ['0', '1'] },
                    { attendu: '2', valeurs: ['0', '2'] },
                    { attendu: '5', valeurs: ['0', '5'], separateurAvant: ',' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
    const code = buildOmrDocument(source)
    expect(code).toContain('grid.cell(align: horizon, text(size: 11pt, ","))')
    // le séparateur n'a pas de case : il ne compte pas dans les colonnes lues
    expect(code).toContain('columns: (auto,) * 4')
    expect(code).not.toContain('omr-box("c01", "q1.3_0")')
  })

  it('donne à chaque figure son zoom et son alignement', () => {
    // `mathalea-figure-block`, posé par `htmlToTypst` à côté de la figure, les
    // lit : sans eux la copie ne compile pas
    const source: OmrDocumentSource = {
      ...SOURCE,
      copies: [{ ...SOURCE.copies[0], figures: ['image("f.svg")'] }],
    }
    const corps = assemblerGabarit(source).corpsParCopie.get(
      SOURCE.copies[0].copieId,
    )
    expect(corps).toContain('#let fig-1-zoom = 1')
    expect(corps).toContain('#let fig-1-align = center')
  })

  it('reprend les réglages de mise en page transmis', () => {
    const { gabarit } = assemblerGabarit(SOURCE, defaultOmrDocumentOptions, {
      layout: { 1: { colonnes: '2' } },
      insertions: { 1: ['#pagebreak(weak: true)'] },
    })
    expect(gabarit).toContain('#let ex1-colonnes = 2')
    expect(gabarit).toContain('  "1": [#pagebreak(weak: true)],')
  })

  it('produit un document identique à buildOmrDocument une fois réassemblé', () => {
    // garantit que l'aperçu et la génération finale compilent le même code
    const { gabarit } = assemblerGabarit(SOURCE)
    expect(buildOmrDocument(SOURCE).startsWith(gabarit)).toBe(true)
  })
})

describe('rendreCorriges', () => {
  const troisCopies = (memeSujet: boolean): OmrDocumentSource => ({
    ...SOURCE,
    copies: ['c01', 'c02', 'c03'].map((copieId, index) => ({
      ...SOURCE.copies[0],
      copieId,
      eleve: { id: copieId, nom: `Élève ${index + 1}` },
      exercices: memeSujet
        ? SOURCE.copies[0].exercices
        : [
            {
              ...SOURCE.copies[0].exercices[0],
              questions: [
                {
                  ...SOURCE.copies[0].exercices[0].questions[0],
                  enonce: `Version ${index}`,
                },
              ],
            },
          ],
    })),
  })

  it('n’imprime rien quand le corrigé n’est pas demandé', () => {
    expect(rendreCorriges(SOURCE, defaultOmrDocumentOptions)).toBe('')
  })

  it('n’imprime qu’un corrigé, sans nom, quand la classe a le même sujet', () => {
    const code = rendreCorriges(troisCopies(true), {
      ...defaultOmrDocumentOptions,
      corrige: 'complet',
    })
    expect(code.match(/Corrigé/g)).toHaveLength(1)
    expect(code).not.toContain('Élève 1')
  })

  it('imprime un corrigé nommé par version quand les sujets diffèrent', () => {
    const code = rendreCorriges(troisCopies(false), {
      ...defaultOmrDocumentOptions,
      corrige: 'complet',
    })
    expect(code.match(/Corrigé —/g)).toHaveLength(3)
    expect(code).toContain('Corrigé — Élève 2')
  })

  it('accorde les numéros du corrigé à ceux du sujet, avec ou sans fusion', () => {
    const options = {
      ...defaultOmrDocumentOptions,
      corrige: 'complet' as const,
    }
    const separes = rendreCorriges(SOURCE, options)
    expect(separes.match(/\*1\.\*/g)).toHaveLength(2)
    expect(separes).toContain('*2.*')
    expect(separes).not.toContain('*3.*')
    const fusionnes = rendreCorriges(SOURCE, {
      ...options,
      mergeExercises: true,
    })
    expect(fusionnes.match(/\*1\.\*/g)).toHaveLength(1)
    expect(fusionnes).toContain('*3.*')
    expect(fusionnes).not.toContain('"Additions posées"')
    expect(fusionnes).not.toContain('"Tables de multiplication"')
  })

  it('sort le corrigé de la géométrie de lecture', () => {
    // ni repères de calage ni en-tête à QR-code : ces pages ne sont pas des
    // copies, rien n'y sera lu optiquement — et le professeur les garde
    const code = rendreCorriges(troisCopies(true), {
      ...defaultOmrDocumentOptions,
      corrige: 'complet',
    })
    expect(code).toContain('#set page(header: none, background: none')
    expect(code).not.toContain('omr-box(')
  })

  it('déduit la réponse des cases quand aucune correction n’est rédigée', () => {
    const code = rendreCorriges(SOURCE, {
      ...defaultOmrDocumentOptions,
      corrige: 'complet',
    })
    // la bonne proposition du QCM, et le nombre attendu de la grille
    expect(code).toContain('$12$')
    expect(code).toContain('125')
  })

  it('préfère la correction minimale quand elle est demandée', () => {
    const avecCorrections: OmrDocumentSource = {
      ...SOURCE,
      copies: [
        {
          ...SOURCE.copies[0],
          exercices: [
            {
              questions: [
                {
                  ...SOURCE.copies[0].exercices[0].questions[0],
                  correction: 'Le raisonnement complet',
                  correctionMinimale: 'Réponse : 12',
                },
              ],
            },
          ],
        },
      ],
    }
    const complet = rendreCorriges(avecCorrections, {
      ...defaultOmrDocumentOptions,
      corrige: 'complet',
    })
    const minimal = rendreCorriges(avecCorrections, {
      ...defaultOmrDocumentOptions,
      corrige: 'minimal',
    })
    expect(complet).toContain('Le raisonnement complet')
    expect(minimal).toContain('Réponse : 12')
    expect(minimal).not.toContain('Le raisonnement complet')
  })
})

describe('buildEvaluation', () => {
  /** Positions factices : une case par identifiant, alignées en colonne. */
  function anchorsFactices(copie: string): OmrAnchor[] {
    const ids = [
      ...buildOmrDocument(SOURCE).matchAll(/omr-box\("c01", "([^"]+)"\)/g),
    ].map((m) => m[1])
    return ids.map((id, index) => ({
      copie,
      id,
      page: 1,
      x: 50 + (index % 5) * 20,
      y: 100 + Math.floor(index / 5) * 20,
      w: 11.34,
      h: 11.34,
    }))
  }

  const meta = {
    titre: 'Évaluation de test',
    checkSum: 'abc123',
    exercicesParams: [],
  }

  it('convertit les points en fractions de page', () => {
    const evaluation = buildEvaluation(SOURCE, anchorsFactices('c01'), meta)
    const boxes = evaluation.layouts[evaluation.copies[0].layoutId]
    expect(evaluation.page.widthPt).toBeCloseTo(595.28, 1)
    for (const box of boxes) {
      expect(box.x).toBeGreaterThan(0)
      expect(box.x).toBeLessThan(1)
      expect(box.y).toBeGreaterThan(0)
      expect(box.y).toBeLessThan(1)
    }
  })

  it('reporte le corrigé sur les cases', () => {
    const evaluation = buildEvaluation(SOURCE, anchorsFactices('c01'), meta)
    const boxes = evaluation.layouts[evaluation.copies[0].layoutId]
    const correctes = boxes.filter((b) => b.correct).map((b) => b.id)
    expect(correctes.sort()).toEqual(
      [
        idCase('q1', 0),
        idCase('q2', '0_1'),
        idCase('q2', '1_2'),
        idCase('q2', '2_1'),
      ].sort(),
    )
  })

  it('donne aux cases de barème la valeur des points qu’elles attribuent', () => {
    const evaluation = buildEvaluation(SOURCE, anchorsFactices('c01'), meta)
    const boxes = evaluation.layouts[evaluation.copies[0].layoutId]
    const bareme = boxes.filter((b) => b.qid === 'q3')
    expect(bareme.map((b) => b.valeur).sort()).toEqual(['0', '1', '2', '3'])
    expect(bareme.every((b) => !b.correct)).toBe(true)
  })

  it('fusionne les mises en page identiques de toute la classe', () => {
    const troisCopies: OmrDocumentSource = {
      ...SOURCE,
      copies: ['c01', 'c02', 'c03'].map((copieId) => ({
        ...SOURCE.copies[0],
        copieId,
        eleve: { id: copieId, nom: `Élève ${copieId}` },
      })),
    }
    const anchors = ['c01', 'c02', 'c03'].flatMap((c) => anchorsFactices(c))
    const evaluation = buildEvaluation(troisCopies, anchors, meta)
    expect(Object.keys(evaluation.layouts)).toHaveLength(1)
    expect(evaluation.copies.map((c) => c.layoutId)).toEqual(['L1', 'L1', 'L1'])
  })

  it('garde des mises en page distinctes quand elles diffèrent', () => {
    const deux: OmrDocumentSource = {
      ...SOURCE,
      copies: ['c01', 'c02'].map((copieId) => ({
        ...SOURCE.copies[0],
        copieId,
        eleve: { id: copieId, nom: copieId },
      })),
    }
    const anchors = [
      ...anchorsFactices('c01'),
      ...anchorsFactices('c02').map((a) => ({ ...a, y: a.y + 7 })),
    ]
    const evaluation = buildEvaluation(deux, anchors, meta)
    expect(Object.keys(evaluation.layouts)).toHaveLength(2)
  })

  it('sépare les mises en page quand le corrigé diffère (graine par élève)', () => {
    // même géométrie, mais la bonne réponse de q1 change d'une copie à l'autre
    const premierExercice = SOURCE.copies[0].exercices[0]
    const autreExercice1 = {
      ...premierExercice,
      questions: [
        {
          ...premierExercice.questions[0],
          propositions: [
            { texte: '$12$', correct: false },
            { texte: '$7$', correct: true },
            { texte: '$34$', correct: false },
          ],
        },
      ],
    }
    const deux: OmrDocumentSource = {
      ...SOURCE,
      copies: [
        { ...SOURCE.copies[0], copieId: 'c01', eleve: { id: 'c01', nom: 'A' } },
        {
          ...SOURCE.copies[0],
          copieId: 'c02',
          eleve: { id: 'c02', nom: 'B' },
          exercices: [autreExercice1, ...SOURCE.copies[0].exercices.slice(1)],
        },
      ],
    }
    const anchors = [...anchorsFactices('c01'), ...anchorsFactices('c02')]
    const evaluation = buildEvaluation(deux, anchors, meta)
    // les deux corrigés ne doivent pas fusionner sous prétexte d'une géométrie
    // identique : ce serait une note fausse pour toute la classe sauf une copie
    expect(Object.keys(evaluation.layouts)).toHaveLength(2)
    const correcteC01 = evaluation.layouts[evaluation.copies[0].layoutId]
      .filter((b) => b.qid === 'q1' && b.correct)
      .map((b) => b.id)
    const correcteC02 = evaluation.layouts[evaluation.copies[1].layoutId]
      .filter((b) => b.qid === 'q1' && b.correct)
      .map((b) => b.id)
    expect(correcteC01).toEqual([idCase('q1', 0)])
    expect(correcteC02).toEqual([idCase('q1', 1)])
  })

  it('ignore une case absente du corrigé plutôt que de produire un trou', () => {
    const anchors = [
      ...anchorsFactices('c01'),
      { copie: 'c01', id: 'inconnue.0', page: 1, x: 10, y: 10, w: 11, h: 11 },
    ]
    const evaluation = buildEvaluation(SOURCE, anchors, meta)
    const boxes = evaluation.layouts[evaluation.copies[0].layoutId]
    expect(boxes.find((b) => b.id === 'inconnue.0')).toBeUndefined()
  })
})

describe('parseAnchors', () => {
  it('écarte les valeurs mal formées', () => {
    expect(
      parseAnchors([
        { copie: 'c01', id: 'q1.0', page: 1, x: 1, y: 2, w: 3, h: 4 },
        { copie: 'c01', id: 'q1.1', page: '1', x: 1, y: 2, w: 3, h: 4 },
        null,
        'bruit',
      ]),
    ).toHaveLength(1)
  })

  it('renvoie une liste vide sur une entrée non tabulaire', () => {
    expect(parseAnchors(undefined)).toEqual([])
  })
})

it.skipIf(spawnSync('typst', ['--version']).status !== 0)(
  'compile les textes libres sans les exécuter et retrouve les repères d’en-tête et de pied',
  () => {
    const dossier = mkdtempSync(join(tmpdir(), 'omr-entete-'))
    try {
      const fichier = join(dossier, 'main.typ')
      writeFileSync(
        fichier,
        buildOmrDocument(SOURCE, {
          ...defaultOmrDocumentOptions,
          subtitle: 'Classe "A" #panic("sous-titre")',
          headerLine: 'Durée : 1 h [aucun matériel]',
          footerText: 'Pied ] #panic("pied") [',
        }),
      )
      const resultat = spawnSync(
        'typst',
        [
          'query',
          '--font-path',
          resolve('public/fonts/typst'),
          fichier,
          '<mathalea-anchor>',
          '--field',
          'value',
        ],
        { encoding: 'utf8' },
      )
      expect(resultat.status, resultat.stderr).toBe(0)
      const reperes = JSON.parse(resultat.stdout) as {
        kind: string
        num: number
      }[]
      expect(reperes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: 'header', num: 0 }),
          expect.objectContaining({ kind: 'footer', num: 0 }),
        ]),
      )
    } finally {
      rmSync(dossier, { recursive: true, force: true })
    }
  },
)
