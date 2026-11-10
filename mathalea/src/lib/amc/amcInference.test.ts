import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js'

import DecimalToScientifique from '../../exercices/3e/3AutoN07-1'
import ExoCompletAffine from '../../exercices/2e/2F21-9'
import OrganiserDonneesDepuisTexte from '../../exercices/CM2/CM2P1A'
import FractionEtendue from '../../modules/FractionEtendue'
import Grandeur from '../../modules/Grandeur'
import Hms from '../../modules/Hms'
import AutoQ9Asiebrevet2026 from '../../exercices/dnbAutomatismes/dnb-2026-06-asie-Q9'
import DeterminerDerniereOperationExpressionLitterale from '../../exercices/5e/5N5D-1'
import { mathaleaHandleExerciceSimple } from '../mathalea'
import { context } from '../../modules/context'
import seedrandom from 'seedrandom'
import { mathaleaEnsureAMCCompatibility } from './amcInference'
import { extractAMCValue } from './amcInferenceHelpers'
import { exportQcmAmc } from './creerDocumentAmc'
import { normalizeAMCNumBlocks } from './amcNormalize'

function exercise(overrides: Record<string, unknown>) {
  return {
    titre: 'Exercice de test',
    nbQuestions: 1,
    autoCorrection: [],
    listeQuestions: ['Énoncé LaTeX'],
    listeCorrections: ['Correction LaTeX'],
    questionJamaisPosee: () => true,
    reinit: () => {},
    nouvelleVersion: () => {},
    ...overrides,
  } as any
}

describe('extractAMCValue', () => {
  it('convertit une réponse Decimal finie en number', () => {
    expect(extractAMCValue(new Decimal('-24.5'))).toBe(-24.5)
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'ignore un Decimal non fini (%s)',
    (value) => {
      expect(extractAMCValue(new Decimal(value))).toBeUndefined()
    },
  )
})

describe('inférence AMC depuis formatInteractif', () => {
  it('infère les enfants de 2F21-9 avec l’index du parent par défaut', () => {
    const previousContext = { isAmc: context.isAmc, isHtml: context.isHtml }
    const exercice = new ExoCompletAffine()
    const seed = '2F21-9-couteau-suisse-amc'
    exercice.seed = seed

    try {
      context.isHtml = false
      context.isAmc = true
      exercice.interactif = false
      seedrandom(seed, { global: true })
      exercice.nouvelleVersionWrapper()

      const elements = (exercice.autoCorrection[0] as any).elements
      expect(exercice.autoCorrection).toHaveLength(1)
      expect(elements).toHaveLength(3)
      expect(
        elements.every((element: any) => element.questionIndex === undefined),
      ).toBe(true)

      mathaleaEnsureAMCCompatibility(exercice)

      expect(exercice.amcType).toBe('AMCHybride')
      expect(exercice.autoCorrectionAMC).toHaveLength(1)
      expect(exercice.autoCorrectionAMC?.[0].propositions).toMatchObject([
        { type: 'AMCNum' },
        { type: 'AMCNum' },
        { type: 'AMCNum' },
        { type: 'AMCNum' },
        { type: 'AMCOpen' },
        { type: 'qcmMono' },
      ])
    } finally {
      context.isAmc = previousContext.isAmc
      context.isHtml = previousContext.isHtml
    }
  })

  it('regroupe toutes les interactions de CM2P1A dans une seule question hybride', () => {
    const previousContext = { isAmc: context.isAmc, isHtml: context.isHtml }
    const exercice = new OrganiserDonneesDepuisTexte()
    const seed = 'CM2P1A-couteau-suisse-amc'
    exercice.seed = seed

    try {
      context.isHtml = true
      context.isAmc = false
      exercice.interactif = true
      seedrandom(seed, { global: true })
      exercice.nouvelleVersionWrapper()
      expect(exercice.nbQuestions).toBe(1)
      expect(exercice.listeQuestions).toHaveLength(1)
      expect(exercice.autoCorrection).toHaveLength(1)
      expect(exercice.autoCorrection[0].formatInteractif).toBe(
        'mathalea-couteau-suisse',
      )
      expect((exercice.autoCorrection[0] as any).elements).toHaveLength(4)
      const interactiveElements = (exercice.autoCorrection[0] as any).elements
      expect(
        interactiveElements.map((element: any) => element.questionIndex),
      ).toEqual([0, 1, 2, 3])
      expect(interactiveElements[0].autoCorrection?.valeur?.L1C1).toBeDefined()
      expect(
        interactiveElements[1].autoCorrection?.valeur?.reponse,
      ).toBeDefined()
      expect(
        interactiveElements[2].autoCorrection?.propositions,
      ).not.toHaveLength(0)
      ;(exercice as any).interactiveAutoCorrectionForAMC =
        exercice.autoCorrection.map((item) => ({ ...item }))

      context.isHtml = false
      context.isAmc = true
      exercice.interactif = false
      ;(exercice as any).lastCallback = ''
      seedrandom(seed, { global: true })
      exercice.nouvelleVersionWrapper()
      expect(
        (exercice as any).interactiveAutoCorrectionForAMC[0].elements[0]
          .autoCorrection?.valeur?.L1C1,
      ).toBeDefined()
      mathaleaEnsureAMCCompatibility(exercice)

      expect(exercice.amcType).toBe('AMCHybride')
      expect(exercice.autoCorrectionAMC).toHaveLength(1)
      const blocks = exercice.autoCorrectionAMC?.[0].propositions ?? []
      expect(blocks).toHaveLength(23)
      expect(
        blocks.slice(0, 21).every((block) => block.type === 'AMCNum'),
      ).toBe(true)
      expect(
        blocks
          .slice(21)
          .every((block) => ['qcmMono', 'qcmMult'].includes(block.type ?? '')),
      ).toBe(true)
      const [latex] = exportQcmAmc(exercice, 0)
      expect(latex.match(/\\AMCnumericChoices/g)).toHaveLength(21)
      expect(latex).not.toContain('mathalea-couteau-suisse')
    } finally {
      context.isAmc = previousContext.isAmc
      context.isHtml = previousContext.isHtml
    }
  })

  it('conserve le QCM natif construit pendant la passe AMC d’une liste déroulante', () => {
    const previousContext = { isAmc: context.isAmc, isHtml: context.isHtml }
    const exercice = new DeterminerDerniereOperationExpressionLitterale()
    const seed = 'liste-deroulante-qcm-amc'
    exercice.seed = seed
    exercice.amcReady = true
    exercice.amcType = 'qcmMono'

    try {
      context.isHtml = true
      context.isAmc = false
      exercice.interactif = true
      seedrandom(seed, { global: true })
      exercice.nouvelleVersionWrapper()
      ;(exercice as any).interactiveAutoCorrectionForAMC =
        exercice.autoCorrection.map((item) => ({ ...item }))

      context.isHtml = true
      context.isAmc = false
      exercice.interactif = false
      ;(exercice as any).lastCallback = ''
      seedrandom(seed, { global: true })
      exercice.nouvelleVersionWrapper()

      context.isHtml = false
      context.isAmc = true
      exercice.interactif = false
      ;(exercice as any).lastCallback = ''
      seedrandom(seed, { global: true })
      exercice.nouvelleVersionWrapper()
      expect(
        exercice.autoCorrection.every(
          (item) => (item.propositions?.length ?? 0) >= 4,
        ),
      ).toBe(true)
      expect(exercice.autoCorrection).toHaveLength(4)
      expect(exercice.listeQuestions).toHaveLength(4)

      mathaleaEnsureAMCCompatibility(exercice)

      expect(exercice.amcType).toBe('qcmMono')
      expect(exercice.autoCorrectionAMC).toHaveLength(exercice.nbQuestions)
      for (const item of exercice.autoCorrectionAMC ?? []) {
        expect(item.propositions).toHaveLength(4)
        expect(
          item.propositions?.filter(({ statut }) => Boolean(statut)),
        ).toHaveLength(1)
      }
    } finally {
      context.isAmc = previousContext.isAmc
      context.isHtml = previousContext.isHtml
    }
  })

  it('infère les deux champs d’un exercice multi-mathfield référencé', () => {
    const exercice = new AutoQ9Asiebrevet2026()
    mathaleaHandleExerciceSimple(exercice, true, 0, 'multi-reference-amc')

    expect(exercice.autoCorrection[0]?.formatInteractif).toBe('multi-mathfield')
    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    expect(exercice.autoCorrectionAMC?.[0].propositions).toHaveLength(2)
    expect(
      exercice.autoCorrectionAMC?.[0].propositions?.map(
        (block) => block.propositions?.[0].reponse?.texte,
      ),
    ).toEqual(['Réponse 1', 'Réponse 2'])

    const [latex] = exportQcmAmc(exercice, 0)
    expect(latex.match(/\\AMCnumericChoices/g)).toHaveLength(2)
    expect(latex).toContain('Réponse 1')
    expect(latex).toContain('Réponse 2')
  })

  it('infère la grille scientifique d’un exercice référencé mathLive', () => {
    let exercice: DecimalToScientifique | undefined

    for (let seed = 0; seed < 20; seed++) {
      const candidat = new DecimalToScientifique()
      mathaleaHandleExerciceSimple(candidat, true, 0, `scientifique-${seed}`)
      const options = candidat.autoCorrection[0]?.valeur?.reponse?.options
      if (options?.ecritureScientifique === true) {
        exercice = candidat
        break
      }
    }

    expect(exercice).toBeDefined()
    expect(exercice?.autoCorrection[0]?.formatInteractif).toBe('mathlive')

    mathaleaEnsureAMCCompatibility(exercice!)

    expect(exercice?.amcType).toBe('AMCNum')
    const blocks = normalizeAMCNumBlocks(
      exercice?.autoCorrectionAMC?.[0].reponse,
    )
    expect(blocks).toHaveLength(1)
    expect(blocks[0].options?.exponent).toBeGreaterThan(0)
    expect(blocks[0].digits).toBeGreaterThan(0)
  })

  it.each(['qcm', 'mathalea-qcm'])(
    'conserve toutes les propositions du format QCM %s',
    (formatInteractif) => {
      const exercice = exercise({
        formatInteractif: formatInteractif,
        autoCorrection: [
          {
            enonce: 'Choisir.',
            formatInteractif,
            propositions: [
              { texte: 'A', statut: true },
              { texte: 'B', statut: false },
              { texte: 'C', statut: true },
            ],
          },
        ],
      })

      mathaleaEnsureAMCCompatibility(exercice)

      expect(exercice.amcReady).toBe(true)
      expect(exercice.amcType).toBe('qcmMult')
      expect(exercice.autoCorrectionAMC[0].propositions).toHaveLength(3)
      expect(
        exercice.autoCorrectionAMC[0].propositions.map(
          (proposition: any) => proposition.statut,
        ),
      ).toEqual([true, false, true])
    },
  )

  it('détecte un QCM moderne même sans formatInteractif au niveau exercice', () => {
    const exercice = exercise({
      autoCorrection: [
        {
          formatInteractif: 'mathalea-qcm',
          propositions: [
            { texte: 'Vrai', statut: true },
            { texte: 'Faux', statut: false },
          ],
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('qcmMono')
    expect(exercice.autoCorrectionAMC[0].enonce).toBe('Énoncé LaTeX')
  })

  it("n'infère pas un champ numérique depuis le seul format global", () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [{ valeur: { reponse: { value: 12 } } }],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
    expect(exercice.autoCorrectionAMC[0].propositions[0].statut).toBe(3)
  })

  it('choisit qcmMult si une question quelconque a plusieurs bonnes réponses', () => {
    const exercice = exercise({
      nbQuestions: 2,
      formatInteractif: 'qcm',
      listeQuestions: ['Q1', 'Q2'],
      listeCorrections: ['C1', 'C2'],
      autoCorrection: [
        {
          formatInteractif: 'qcm',
          propositions: [
            { texte: 'A', statut: true },
            { texte: 'B', statut: false },
          ],
        },
        {
          formatInteractif: 'qcm',
          propositions: [
            { texte: 'A', statut: true },
            { texte: 'B', statut: true },
            { texte: 'C', statut: false },
          ],
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('qcmMult')
    expect(exercice.autoCorrectionAMC).toHaveLength(2)
  })

  it('ne laisse pas disparaître une question QCM sans autoCorrection', () => {
    const exercice = exercise({
      nbQuestions: 2,
      formatInteractif: 'qcm',
      listeQuestions: ['Q1', 'Q2'],
      listeCorrections: ['C1', 'C2'],
      autoCorrection: [
        {
          formatInteractif: 'qcm',
          propositions: [
            { texte: 'A', statut: true },
            { texte: 'B', statut: false },
          ],
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
    expect(exercice.autoCorrectionAMC).toHaveLength(2)
    expect(exercice.autoCorrectionAMC.map((item: any) => item.enonce)).toEqual([
      'Q1',
      'Q2',
    ])
  })

  it.each(['mathlive', 'mathalea-mathfield', 'calcul'])(
    'infère AMCNum pour une réponse numérique au format %s',
    (formatInteractif) => {
      const exercice = exercise({
        formatInteractif: 'mathLive',
        autoCorrection: [
          {
            formatInteractif,
            valeur: { reponse: { value: 12.5 } },
          },
        ],
      })

      mathaleaEnsureAMCCompatibility(exercice)

      expect(exercice.amcType).toBe('AMCNum')
      expect(exercice.autoCorrectionAMC[0].reponse.valeur).toBe(12.5)
    },
  )

  it('réduit une fraction égale entière avant de dimensionner AMCNum', () => {
    const exercice = exercise({
      formatInteractif: 'mathLive',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '\\frac{100}{25}',
              options: { fractionEgale: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC[0].reponse.valeur).toBe(4)
  })

  it('infère les zones base et exposant pour une puissance numérique', () => {
    const exercice = exercise({
      amcReady: true,
      amcType: 'AMCNum',
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '(-4)^{-3}',
              options: { puissance: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC[0].reponse).toMatchObject({
      valeur: -4,
      param: {
        basePuissance: -4,
        exposantPuissance: -3,
        baseNbChiffres: 1,
        exposantNbChiffres: 1,
      },
    })
    expect(
      normalizeAMCNumBlocks(exercice.autoCorrectionAMC[0].reponse).map(
        (block) => [block.label, block.value],
      ),
    ).toEqual([
      ['Base', -4],
      ['Exposant', -3],
    ])
  })

  it('utilise AMCOpen pour une puissance non numérique', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: { value: 'x^2', options: { puissance: true } },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('infère une fraction irréductible AMC pour une fractionEgale non entière', () => {
    const exercice = exercise({
      formatInteractif: 'mathLive',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '\\frac{5}{2}',
              options: { fractionEgale: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC[0].reponse.valeur).toEqual({
      num: 5,
      den: 2,
    })
    expect(exercice.autoCorrectionAMC[0].enonce).toContain(
      'La fraction doit être simplifiée au maximum.',
    )
  })

  it('conserve numérateur et dénominateur pour fractionIdentique', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '\\frac{6}{8}',
              options: { fractionIdentique: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC[0].reponse.valeur).toEqual({
      num: 6,
      den: 8,
    })
    expect(
      normalizeAMCNumBlocks(exercice.autoCorrectionAMC[0].reponse),
    ).toMatchObject([
      {
        value: 6.8,
        digits: 2,
        decimals: 1,
      },
    ])
  })

  it('infère une fraction décimale sans modifier le contrat interactif', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: new FractionEtendue(1, 2),
              options: { fractionDecimale: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC[0].reponse.valeur).toEqual({
      num: 5,
      den: 10,
    })
  })

  it.each(['fractionSimplifiee', 'fractionReduite'])(
    'attend la fraction irréductible pour %s',
    (option) => {
      const exercice = exercise({
        formatInteractif: 'mathalea-mathfield',
        autoCorrection: [
          {
            formatInteractif: 'mathalea-mathfield',
            valeur: {
              reponse: {
                value: '\\frac{12}{18}',
                options: { [option]: true },
              },
            },
          },
        ],
      })

      mathaleaEnsureAMCCompatibility(exercice)

      expect(exercice.amcType).toBe('AMCNum')
      expect(exercice.autoCorrectionAMC[0].reponse.valeur).toEqual({
        num: 2,
        den: 3,
      })
      expect(exercice.autoCorrectionAMC[0].enonce).toContain(
        'La fraction doit être simplifiée au maximum.',
      )
    },
  )

  it('conserve une fraction déjà écrite avec un dénominateur puissance de dix', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '\\frac{50}{100}',
              options: { fractionDecimale: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.autoCorrectionAMC[0].reponse.valeur).toEqual({
      num: 50,
      den: 100,
    })
  })

  it('infère la mesure numérique d’une grandeur et fixe son unité pour AMC', () => {
    const exercice = exercise({
      amcReady: true,
      amcType: 'AMCNum',
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: new Grandeur(12.5, 'cm'),
              options: { unite: true, precisionUnite: 0.1 },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC[0].reponse).toMatchObject({
      valeur: 12.5,
      param: { approx: 0.1 },
      display: {
        label: '$\\text{cm}$',
        labelPosition: 'right',
      },
    })
    expect(exercice.autoCorrectionAMC[0].enonce).toBe('Énoncé LaTeX')
  })

  it('utilise AMCOpen si une réponse avec unité n’est pas une Grandeur', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '30^\\circ',
              options: { unite: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('infère trois grilles numériques avec unités pour une réponse HMS', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: new Hms({ hour: 1, minute: 6 }),
              options: { HMS: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    expect(
      exercice.autoCorrectionAMC[0].propositions.map(
        (block: { propositions: Array<{ reponse: unknown }> }) =>
          block.propositions[0].reponse,
      ),
    ).toMatchObject([
      {
        valeur: 1,
        param: { digits: 2, decimals: 0, signe: false },
        display: { label: '$\\text{h}$', labelPosition: 'right' },
      },
      {
        valeur: 6,
        param: { digits: 2, decimals: 0, signe: false },
        display: { label: '$\\text{min}$', labelPosition: 'right' },
      },
      {
        valeur: 0,
        param: { digits: 2, decimals: 0, signe: false },
        display: { label: '$\\text{s}$', labelPosition: 'right' },
      },
    ])
    const [latex] = exportQcmAmc(exercice, 0)
    expect(latex.match(/\\AMCnumericChoices/g)).toHaveLength(3)
    expect(latex).toContain('$\\text{h}$')
    expect(latex).toContain('$\\text{min}$')
    expect(latex).toContain('$\\text{s}$')
  })

  it('infère seulement les grilles heures et minutes pour une réponse HM stringifiée', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '1 h 06 min',
              options: { HMS: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    expect(exercice.autoCorrectionAMC[0].propositions).toHaveLength(2)
  })

  it('utilise AMCOpen pour une option de comparaison non transposable', () => {
    const exercice = exercise({
      formatInteractif: 'mathLive',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '4',
              options: { expressionNumerique: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('ignore la contrainte de groupement nombreAvecEspace pour la grille AMC', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '12\\,345',
              options: { nombreAvecEspace: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC[0].reponse.valeur).toBe(12345)
  })

  it('infère estDansIntervalle avec trois choix AMC natifs', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: ']2,5;3[',
              options: { estDansIntervalle: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('qcmMono')
    expect(exercice.autoCorrectionAMC[0].propositions).toHaveLength(3)
    expect(
      exercice.autoCorrectionAMC[0].propositions.filter(
        (proposition: { statut?: boolean }) => proposition.statut,
      ),
    ).toHaveLength(1)
    const [latex] = exportQcmAmc(exercice, 0)
    expect(latex).toContain('\\AMCIntervals{2.75}{2}{3.5}{0.5}')
  })

  it('conserve AMCOpen pour un intervalle non borné', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: ']-\\infty;3[',
              options: { estDansIntervalle: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('combine intervalle et valeur numérique dans un AMCHybride', () => {
    const exercice = exercise({
      formatInteractif: 'multi-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'multi-mathfield',
          valeur: {
            champ1: {
              value: '[10;12]',
              options: { estDansIntervalle: true },
            },
            champ2: { value: 7 },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    expect(exercice.autoCorrectionAMC).toHaveLength(1)
    expect(exercice.autoCorrectionAMC[0].propositions).toMatchObject([
      { type: 'qcmMono' },
      { type: 'AMCNum' },
    ])
    const [latex] = exportQcmAmc(exercice, 0)
    expect(latex).toContain('\\AMCIntervals{11}{8}{14}{2}')
    expect(latex).toContain('\\AMCnumericChoices{7}')
  })

  it('décompose les coordonnées en grilles AMC indépendantes et libellées', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: ['(\\frac{3}{5};-2)'],
              options: { coordonnees: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    const responses = exercice.autoCorrectionAMC[0].propositions.map(
      (block: { propositions: Array<{ reponse: unknown }> }) =>
        block.propositions[0].reponse,
    )
    expect(responses).toMatchObject([
      { texte: 'Abscisse', valeur: { num: 3, den: 5 } },
      { texte: 'Ordonnée', valeur: -2 },
    ])
    expect(exercice.autoCorrectionAMC[0].enonce).toContain(
      'La fraction doit être simplifiée au maximum.',
    )
    const [latex] = exportQcmAmc(exercice, 0)
    expect(latex.match(/\\AMCnumericChoices/g)).toHaveLength(2)
    expect(latex).toContain('Abscisse')
    expect(latex).toContain('Ordonnée')
  })

  it('infère AMCNum en notation scientifique avec mantisse et exposant', () => {
    const exercice = exercise({
      formatInteractif: 'mathLive',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '3,14\\times 10^{-2}',
              options: { ecritureScientifique: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC[0].reponse).toMatchObject({
      valeur: 0.0314,
      param: {
        digits: 3,
        decimals: 2,
        exposantNbChiffres: 1,
        exposantSigne: true,
      },
    })
  })

  it('refuse une écriture scientifique dont la mantisse est invalide', () => {
    const exercice = exercise({
      formatInteractif: 'mathLive',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '31e-1',
              options: { ecritureScientifique: true },
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('utilise AMCOpen pour une comparaison spécialisée inconnue', () => {
    const exercice = exercise({
      formatInteractif: 'mathLive',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: {
            reponse: {
              value: '4',
              compare: () => ({ isOk: true }),
            },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('complète un AMCNum explicite depuis autoCorrection sans effacer sa source', () => {
    const source = {
      formatInteractif: 'mathlive',
      valeur: { reponse: { value: 17 } },
    }
    const exercice = exercise({
      amcReady: true,
      amcType: 'AMCNum',
      formatInteractif: 'mathLive',
      autoCorrection: [source],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrection[0]).toBe(source)
    expect(exercice.autoCorrectionAMC[0].reponse.valeur).toBe(17)
  })

  it('replie en AMCOpen un AMCNum explicite dont la réponse est ambiguë', () => {
    const exercice = exercise({
      amcReady: true,
      amcType: 'AMCNum',
      formatInteractif: 'mathLive',
      autoCorrection: [
        {
          formatInteractif: 'mathlive',
          valeur: { reponse: { value: ['1', '2'] } },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
    expect(exercice.autoCorrectionAMC[0].propositions[0].statut).toBe(3)
  })

  it.each(['multi-mathfield', 'fill-in-the-blank', 'tableau-mathlive'])(
    'infère AMCHybride pour plusieurs champs numériques au format %s',
    (formatInteractif) => {
      const exercice = exercise({
        formatInteractif: formatInteractif,
        autoCorrection: [
          {
            formatInteractif,
            valeur: {
              champ1: { value: 4 },
              champ2: { value: -2.5 },
            },
          },
        ],
      })

      mathaleaEnsureAMCCompatibility(exercice)

      expect(exercice.amcType).toBe('AMCHybride')
      expect(exercice.autoCorrectionAMC[0].propositions).toHaveLength(2)
      expect(
        exercice.autoCorrectionAMC[0].propositions.map(
          (block: any) => block.propositions[0].reponse.valeur,
        ),
      ).toEqual([4, -2.5])
    },
  )

  it('nomme les grilles d’un tableau par ligne et colonne', () => {
    const exercice = exercise({
      formatInteractif: 'tableau-mathlive',
      autoCorrection: [
        {
          formatInteractif: 'tableau-mathlive',
          valeur: {
            L1C2: { value: 4 },
            L3C1: { value: -2.5 },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(
      exercice.autoCorrectionAMC[0].propositions.map(
        (block: any) => block.propositions[0].reponse.texte,
      ),
    ).toEqual(['Ligne 1, colonne 2', 'Ligne 3, colonne 1'])
  })

  it('infère les enfants d’un mathalea-couteau-suisse', () => {
    const exercice = exercise({
      formatInteractif: 'mathalea-couteau-suisse',
      autoCorrection: [
        {
          formatInteractif: 'mathalea-couteau-suisse',
          elements: [
            {
              formatInteractif: 'tableau-mathlive',
              autoCorrection: {
                valeur: {
                  L1C1: { value: 4 },
                  L1C2: { value: 7 },
                },
              },
            },
            {
              formatInteractif: 'mathalea-mathfield',
              autoCorrection: {
                valeur: { reponse: { value: 11 } },
              },
            },
            {
              formatInteractif: 'mathalea-qcm',
              autoCorrection: {
                propositions: [
                  { texte: 'A', statut: true },
                  { texte: 'B', statut: false },
                ],
              },
            },
            {
              formatInteractif: 'mathalea-qcm',
              autoCorrection: {
                propositions: [
                  { texte: 'C', statut: true },
                  { texte: 'D', statut: true },
                ],
              },
            },
            {
              formatInteractif: 'tableau-signes-variations',
              autoCorrection: { enonce: 'Compléter le tableau de signes.' },
            },
          ],
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    expect(exercice.autoCorrectionAMC).toHaveLength(1)
    expect(exercice.autoCorrectionAMC[0].propositions).toMatchObject([
      { type: 'AMCNum', propositions: [{ reponse: { valeur: 4 } }] },
      { type: 'AMCNum', propositions: [{ reponse: { valeur: 7 } }] },
      { type: 'AMCNum', propositions: [{ reponse: { valeur: 11 } }] },
      { type: 'qcmMono' },
      { type: 'qcmMult' },
      { type: 'AMCOpen', enonce: 'Compléter le tableau de signes.' },
    ])
  })

  it('conserve les champs inférables dans un multi-mathfield partiellement ouvert', () => {
    const exercice = exercise({
      formatInteractif: 'multi-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'multi-mathfield',
          valeur: {
            champ1: { value: 4 },
            champ2: { value: 'x+1' },
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    expect(exercice.autoCorrectionAMC[0].propositions).toMatchObject([
      {
        type: 'AMCNum',
        propositions: [{ reponse: { texte: 'Réponse 1', valeur: 4 } }],
      },
      {
        type: 'AMCOpen',
        enonce: 'Réponse 2',
        propositions: [{ statut: 3 }],
      },
    ])
    const [latex] = exportQcmAmc(exercice, 0)
    expect(latex).toContain('\\AMCnumericChoices{4}')
    expect(latex).toContain('Réponse 2')
    expect(latex).toContain('\\notation{3}')
  })

  it('conserve un barème multichamp équivalent au barème indépendant', () => {
    const exercice = exercise({
      formatInteractif: 'multi-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'multi-mathfield',
          valeur: {
            champ1: { value: 4 },
            champ2: { value: 7 },
            bareme: (points: number[]) => [
              points.reduce((sum, point) => sum + point, 0),
              points.length,
            ],
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
  })

  it.each([
    {
      label: 'barème couplé',
      extra: {
        bareme: (points: number[]) => [Math.min(...points), 1],
      },
    },
    {
      label: 'callback global',
      extra: { callback: () => ({ isOk: true }) },
    },
  ])('utilise AMCOpen pour un $label multichamp', ({ extra }) => {
    const exercice = exercise({
      formatInteractif: 'multi-mathfield',
      autoCorrection: [
        {
          formatInteractif: 'multi-mathfield',
          valeur: {
            champ1: { value: 4 },
            champ2: { value: 7 },
            ...extra,
          },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('infère un AMCHybride en conservant les blocs QCM et numériques', () => {
    const exercice = exercise({
      nbQuestions: 2,
      amcReady: true,
      amcType: 'qcmMono',
      formatInteractif: 'qcm',
      listeQuestions: ['Énoncé 1', 'Énoncé 2'],
      listeCorrections: ['Correction 1', 'Correction 2'],
      autoCorrection: [
        {
          formatInteractif: 'qcm',
          valeur: { reponse: { value: 4 } },
        },
        {
          formatInteractif: 'qcm',
          propositions: [
            { texte: 'A', statut: false },
            { texte: 'B', statut: true },
          ],
        },
        {
          formatInteractif: 'mathalea-mathfield',
          valeur: { reponse: { value: -2.5 } },
        },
        {
          formatInteractif: 'qcm',
          propositions: [
            { texte: 'C', statut: true },
            { texte: 'D', statut: true },
            { texte: 'E', statut: false },
          ],
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    expect(exercice.autoCorrectionAMC).toHaveLength(2)
    expect(exercice.autoCorrectionAMC[0].propositions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'AMCNum' }),
        expect.objectContaining({
          type: 'qcmMono',
          propositions: [
            expect.objectContaining({ statut: false }),
            expect.objectContaining({ statut: true }),
          ],
        }),
      ]),
    )
    expect(exercice.autoCorrectionAMC[1].propositions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'AMCNum' }),
        expect.objectContaining({ type: 'qcmMult' }),
      ]),
    )
  })

  it('conserve le QCM quand les autres questions nécessitent AMCOpen', () => {
    const exercice = exercise({
      nbQuestions: 2,
      listeQuestions: ['Choisir la réponse', 'Justifier la réponse'],
      listeCorrections: ['La réponse B convient.', 'Justification attendue.'],
      autoCorrection: [
        {
          enonce: 'Choisir la réponse',
          formatInteractif: 'mathalea-qcm',
          propositions: [
            { texte: 'A', statut: false },
            { texte: 'B', statut: true },
          ],
        },
        {
          enonce: 'Justifier la réponse',
          formatInteractif: 'mathalea-textfield',
          valeur: { reponse: { value: 'car B' } },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCHybride')
    expect(exercice.autoCorrectionAMC).toHaveLength(2)
    expect(exercice.autoCorrectionAMC[0].propositions).toEqual([
      expect.objectContaining({
        type: 'qcmMono',
        propositions: [
          expect.objectContaining({ statut: false }),
          expect.objectContaining({ statut: true }),
        ],
      }),
    ])
    expect(exercice.autoCorrectionAMC[1].propositions).toEqual([
      expect.objectContaining({
        type: 'AMCOpen',
        propositions: [
          expect.objectContaining({
            texte: 'Justification attendue.',
            statut: 3,
            enonce: 'Justifier la réponse',
          }),
        ],
      }),
    ])
  })

  it('ne choisit pas arbitrairement une réponse parmi plusieurs valeurs acceptées', () => {
    const exercice = exercise({
      formatInteractif: 'mathLive',
      autoCorrection: [
        {
          formatInteractif: 'mathlive',
          valeur: { reponse: { value: [0.5, '\\frac{1}{2}'] } },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('utilise AMCOpen pour un format non transposable sans altérer autoCorrection', () => {
    const source = {
      formatInteractif: 'svg-selection',
      valeur: { reponse: { value: '[1,2]' } },
    }
    const exercice = exercise({
      formatInteractif: 'svg-selection',
      autoCorrection: [source],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
    expect(exercice.autoCorrection[0]).toBe(source)
    expect(exercice.autoCorrectionAMC[0]).toMatchObject({
      enonce: 'Énoncé LaTeX',
      propositions: [
        {
          texte: 'Correction LaTeX',
          statut: 3,
          pointilles: true,
        },
      ],
    })
  })

  it.each([
    'texte',
    'liste-deroulante',
    'cliqueFigure',
    'clique-figure',
    'points-cliquables',
    'objets-cliquables',
    'fraction-cliquable',
    'mathalea-labyrinthe',
    'echiquier-probleme',
    'dnd',
    'drag-and-drop',
    'custom',
    'meta-custom',
    'my-spreadsheet',
    'MetaInteractif2d',
    'meta-interactif-2d',
    'svg-selection',
    'trigo-circle-selection',
    'interactive-clock',
    'my-calculator',
    'guide-ane',
    'demi-droite-interactive',
    'blockly-editor',
    'scratch-editor',
    'tableau-signes-variations',
    'mathalea-textfield',
    'tableau-hybride',
    'mathalea-branching-qcm',
    'fractionEgale',
    'alea-iep-editeur',
    'relier-etiquettes',
    'diagram-builder',
    'diagram-pie-assessment',
    'diagram-bar-assessment',
    'diagram-histogram-assessment',
    'diagram-cartesian-assessment',
    'format-inconnu',
  ])('conserve le format non transposable %s sous forme AMCOpen', (format) => {
    const exercice = exercise({
      formatInteractif: format,
      autoCorrection: [
        {
          formatInteractif: format,
          valeur: { reponse: { value: 'réponse interactive' } },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcReady).toBe(true)
    expect(exercice.amcType).toBe('AMCOpen')
    expect(exercice.autoCorrectionAMC[0]).toMatchObject({
      enonce: 'Énoncé LaTeX',
      propositions: [
        expect.objectContaining({
          texte: 'Correction LaTeX',
          statut: 3,
        }),
      ],
    })
  })

  it('ne confond pas une ancienne structure AMCOpen avec un QCM', () => {
    const exercice = exercise({
      autoCorrection: [
        {
          enonce: 'Démontrer.',
          propositions: [
            { texte: 'Correction', statut: 3, pointilles: true },
            { texte: 'Barème alternatif', statut: 1, pointilles: false },
          ],
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcType).toBe('AMCOpen')
  })

  it('rend le contrat fallback avec énoncé, zone de travail et cases de notation', () => {
    const exercice = exercise({
      id: 'FALLBACK',
      formatInteractif: 'drag-and-drop',
      autoCorrection: [
        {
          formatInteractif: 'drag-and-drop',
          valeur: { reponse: { value: 'état dynamique' } },
        },
      ],
    })

    mathaleaEnsureAMCCompatibility(exercice)
    const [latex] = exportQcmAmc(exercice, 0)

    expect(latex).toContain('Énoncé LaTeX')
    expect(latex).toContain('Correction LaTeX')
    expect(latex).toContain('\\notation{3}[false][true]')
  })
})
