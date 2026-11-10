import { describe, it, expect, beforeEach } from 'vitest'
import QcmJsonGenerator, { type QcmJsonData } from './QcmJsonGenerator'

const sampleQcmData: QcmJsonData = {
  titre: 'Test QCM',
  consigne: 'Sélectionnez la bonne réponse.',
  options: {
    vertical: true,
    ordered: true,
    lastChoice: 3,
  },
  questions: [
    {
      enonce: 'Quelle couleur est le ciel ?',
      reponses: ['Bleu', 'Vert', 'Rouge'],
      corrections: ['Correct', 'Faux', 'Faux'],
      bonnesReponses: [true, false, false],
    },
    {
      enonce: 'Combien font 1+1 ?',
      reponses: ['2', '3'],
      corrections: ['Correct', 'Faux'],
      bonnesReponses: [true, false],
    },
  ],
}

describe('QcmJsonGenerator', () => {
  let generator: QcmJsonGenerator

  beforeEach(() => {
    generator = new QcmJsonGenerator(sampleQcmData)
  })

  it('should initialize with provided JSON data', () => {
    expect(generator['jsonData']).toEqual(sampleQcmData)
    expect(generator['questionsDisponibles'].length).toBe(2)
    expect(generator.titre).toBe('Test QCM')
    expect(generator.consigne).toBe('Sélectionnez la bonne réponse.')
    expect(generator.options.vertical).toBe(true)
    expect(generator.options.ordered).toBe(true)
    expect(generator.options.lastChoice).toBe(3)
    expect(generator.nbQuestions).toBe(2)
    expect(generator.nbQuestionsModifiable).toBe(true)
  })

  it('should use default data if no data is provided', () => {
    // @ts-expect-error
    const gen = new QcmJsonGenerator(undefined)
    expect(gen['jsonData']).toBeDefined()
    expect(gen['questionsDisponibles'].length).toBeGreaterThan(0)
  })

  it('should set enonce, reponses, corrections and bonnesReponses in versionOriginale', () => {
    generator.versionOriginale()
    expect(generator.enonce).toBe('Quelle couleur est le ciel ?')
    expect(generator.reponses).toEqual(['Bleu', 'Vert', 'Rouge'])
    expect(generator.corrections).toEqual(['Correct', 'Faux', 'Faux'])
    expect(generator.bonnesReponses).toEqual([true, false, false])
  })

  it('should set correction to default if no corrections are provided', () => {
    const data: QcmJsonData = {
      titre: 'Sans correction',
      questions: [
        {
          enonce: 'Test',
          reponses: ['A', 'B'],
        },
      ],
    }
    const gen = new QcmJsonGenerator(data)
    gen.versionOriginale()
    expect(gen.correction).toBe('La bonne réponse est la première de la liste.')
  })

  it('should pick a random question in versionAleatoire', () => {
    generator.versionAleatoire()
    expect(generator.enonce).toMatch(
      /(Quelle couleur est le ciel|Combien font 1\+1)/,
    )
    expect(generator.reponses.length).toBeGreaterThan(1)
  })

  it('should validate correct QcmJsonData', () => {
    expect(QcmJsonGenerator.validateJsonData(sampleQcmData)).toBe(true)
  })

  it.each([
    null,
    42,
    {},
    { ...sampleQcmData, questions: [null] },
    { ...sampleQcmData, questions: [42] },
    { ...sampleQcmData, consigne: false },
    { ...sampleQcmData, options: null },
    { ...sampleQcmData, options: { vertical: 'true' } },
    { ...sampleQcmData, options: { ordered: 1 } },
    { ...sampleQcmData, options: { lastChoice: '3' } },
    {
      ...sampleQcmData,
      questions: [{ enonce: 'Q', reponses: ['A', 'B'], corrections: null }],
    },
    {
      ...sampleQcmData,
      questions: [{ enonce: 'Q', reponses: ['A', 'B'], bonnesReponses: false }],
    },
  ])(
    'rejette les données JSON mal typées sans lever d’exception : %j',
    (data) => {
      expect(QcmJsonGenerator.validateJsonData(data)).toBe(false)
    },
  )

  it('should invalidate QcmJsonData with missing titre', () => {
    const data = { ...sampleQcmData, titre: undefined }
    expect(QcmJsonGenerator.validateJsonData(data)).toBe(false)
  })

  it('should invalidate QcmJsonData with invalid questions', () => {
    const data = { ...sampleQcmData, questions: [] }
    expect(QcmJsonGenerator.validateJsonData(data)).toBe(false)
  })

  it('should invalidate QcmJsonData with invalid reponses', () => {
    const data = {
      ...sampleQcmData,
      questions: [{ enonce: 'Q', reponses: ['A'] }],
    }
    expect(QcmJsonGenerator.validateJsonData(data)).toBe(false)
  })

  it('should invalidate QcmJsonData with non-string reponse', () => {
    const data = {
      ...sampleQcmData,
      questions: [{ enonce: 'Q', reponses: ['A', 2] }],
    }
    expect(QcmJsonGenerator.validateJsonData(data)).toBe(false)
  })

  it('should invalidate QcmJsonData with invalid corrections', () => {
    const data = {
      ...sampleQcmData,
      questions: [
        {
          enonce: 'Q',
          reponses: ['A', 'B'],
          corrections: [1, 2],
        },
      ],
    }
    expect(QcmJsonGenerator.validateJsonData(data)).toBe(false)
  })

  it('should invalidate QcmJsonData with invalid bonnesReponses', () => {
    const data = {
      ...sampleQcmData,
      questions: [
        {
          enonce: 'Q',
          reponses: ['A', 'B'],
          bonnesReponses: [true],
        },
      ],
    }
    expect(QcmJsonGenerator.validateJsonData(data)).toBe(false)
  })

  it('should create instance from static fromJson', () => {
    const gen = QcmJsonGenerator.fromJson(sampleQcmData)
    expect(gen).toBeInstanceOf(QcmJsonGenerator)
    expect(gen['jsonData']).toEqual(sampleQcmData)
  })

  it('should get a random question not in questionsDejaUtilisees', () => {
    const q1 = sampleQcmData.questions[0]
    const q2 = sampleQcmData.questions[1]
    // @ts-ignore
    const result = generator['getQuestionAleatoire']([q1])
    expect([q2, null]).toContain(result)
  })

  it('nouvelleVersion should call versionOriginale and super.nouvelleVersion', () => {
    const spy = vi.spyOn(generator, 'versionOriginale')
    generator.nouvelleVersion()
    expect(spy).toHaveBeenCalled()
  })
})
