import Decimal from 'decimal.js'
import { describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import ExerciceSimple from '../../src/exercices/ExerciceSimple'
import { mathaleaEnsureAMCCompatibility } from '../../src/lib/amc/amcInference'
import {
  getDistracteurs,
  mathaleaHandleParamOfOneExercice,
  mathaleaHandleExerciceSimple,
} from '../../src/lib/mathalea'
import FractionEtendue from '../../src/modules/FractionEtendue'
import Grandeur from '../../src/modules/Grandeur'
import Hms from '../../src/modules/Hms'

// Mock avant l'import
vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(() => 'mocked value'),
}))

describe('getDistracteurs', () => {
  it('retourne 3 distracteurs différents de la réponse (cas simple)', () => {
    const exo = new ExerciceSimple()
    exo.distracteurs = [1, 2, 3, 4, 5]
    exo.reponse = 2
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs).toHaveLength(3)
    expect(distracteurs).not.toContain(2)
    distracteurs.forEach((d) => expect([1, 3, 4, 5]).toContain(d))
  })

  it('retourne tous les distracteurs si pas de réponse', () => {
    const exo = new ExerciceSimple()
    exo.distracteurs = ['a', 'b', 'c']
    exo.reponse = undefined
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs.length).toEqual(3)
    distracteurs.forEach((d) => expect(['a', 'b', 'c']).toContain(d))
  })

  it('retourne les distracteurs qui ne sont pas dans un tableau de strings', () => {
    const exo = new ExerciceSimple()
    exo.distracteurs = ['a', 'b', 'c', 'd']
    exo.reponse = ['b', 'c']
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs).not.toContain('b')
    expect(distracteurs).not.toContain('c')
    distracteurs.forEach((d) => expect(['a', 'd']).toContain(d))
  })

  it('retourne les distracteurs qui ne sont pas dans un tableau de nombres', () => {
    const exo = new ExerciceSimple()
    exo.distracteurs = [1, 2, 3, 4]
    exo.reponse = [2, 3]
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs).not.toContain(2)
    expect(distracteurs).not.toContain(3)
    distracteurs.forEach((d) => expect([1, 4]).toContain(d))
  })

  it('retourne les distracteurs qui ne sont pas dans un tableau de FractionEtendues', () => {
    const fraction1 = new FractionEtendue(1, 2)
    const fraction2 = new FractionEtendue(2, 3)
    const fraction3 = new FractionEtendue(3, 4)
    const fraction4 = new FractionEtendue(4, 5)
    const exo = new ExerciceSimple()
    exo.distracteurs = [
      fraction1.texFraction,
      fraction2.texFraction,
      fraction3.texFraction,
      fraction4.texFraction,
    ]
    exo.reponse = [fraction1, fraction2]
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs).not.toContain(fraction1.texFraction)
    expect(distracteurs).not.toContain(fraction2.texFraction)
    distracteurs.forEach((d) =>
      expect([fraction3.texFraction, fraction4.texFraction]).toContain(d),
    )
  })

  it('retourne les distracteurs qui ne sont pas dans un tableau de Decimal sous forme de nombre', () => {
    const decimal1 = new Decimal(1).div(10)
    const decimal2 = new Decimal(2).div(10)
    const decimal3 = new Decimal(3).div(10)
    const decimal4 = new Decimal(4).div(10)
    const exo = new ExerciceSimple()
    exo.distracteurs = [
      decimal1.toNumber(),
      decimal2.toNumber(),
      decimal3.toNumber(),
      decimal4.toNumber(),
    ]
    exo.reponse = [decimal2.toNumber(), decimal3.toNumber()]
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs).not.toContain(decimal2.toNumber())
    expect(distracteurs).not.toContain(decimal3.toNumber())
    distracteurs.forEach((d) =>
      expect([decimal1.toNumber(), decimal4.toNumber()]).toContain(d),
    )
  })

  it('retourne les distracteurs qui ne sont pas dans un tableau de Decimal sous forme de string', () => {
    const decimal1 = new Decimal(1).div(10)
    const decimal2 = new Decimal(2).div(10)
    const decimal3 = new Decimal(3).div(10)
    const decimal4 = new Decimal(4).div(10)
    const exo = new ExerciceSimple()
    exo.distracteurs = [
      decimal1.toString(),
      decimal2.toString(),
      decimal3.toString(),
      decimal4.toString(),
    ]
    exo.reponse = [decimal2.toString(), decimal3.toString()]
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs).not.toContain(decimal2.toString())
    expect(distracteurs).not.toContain(decimal3.toString())
    distracteurs.forEach((d) =>
      expect([decimal1.toString(), decimal4.toString()]).toContain(d),
    )
  })

  it('retourne les distracteurs qui ne sont pas dans un tableau de Grandeurs', () => {
    const grandeur1 = new Grandeur(1, 'm')
    const grandeur2 = new Grandeur(2, 'm')
    const grandeur3 = new Grandeur(3, 'm')
    const grandeur4 = new Grandeur(4, 'm')
    const exo = new ExerciceSimple()
    exo.distracteurs = [
      grandeur1.toTex(),
      grandeur2.toTex(),
      grandeur3.toTex(),
      grandeur4.toTex(),
    ]
    exo.reponse = [grandeur2, grandeur3]
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs).not.toContain(grandeur2.toTex())
    expect(distracteurs).not.toContain(grandeur3.toTex())
    distracteurs.forEach((d) =>
      expect([grandeur1.toTex(), grandeur4.toTex()]).toContain(d),
    )
  })

  it('retourne les distracteurs qui ne sont pas dans un tableau de Hms', () => {
    const hms1 = new Hms({ hour: 1, minute: 30, second: 45 })
    const hms2 = new Hms({ hour: 2, minute: 15, second: 30 })
    const hms3 = new Hms({ hour: 3, minute: 45, second: 15 })
    const hms4 = new Hms({ hour: 4, minute: 0, second: 0 })
    const exo = new ExerciceSimple()
    exo.distracteurs = [
      hms1.toString(),
      hms2.toString(),
      hms3.toString(),
      hms4.toString(),
    ]
    exo.reponse = [hms2, hms3]
    const distracteurs = getDistracteurs(exo)
    expect(distracteurs).not.toContain(hms2.toString())
    expect(distracteurs).not.toContain(hms3.toString())
    distracteurs.forEach((d) =>
      expect([hms1.toString(), hms4.toString()]).toContain(d),
    )
  })
})

describe('mathaleaHandleParamOfOneExercice', () => {
  it("force l'interactivité des exercices obligatoires malgré i=0", () => {
    const exercice = new Exercice()
    exercice.interactifObligatoire = true
    const params = { uuid: 'test', interactif: '0' as const }

    mathaleaHandleParamOfOneExercice(exercice, params)

    expect(exercice.interactif).toBe(true)
    expect(params.interactif).toBe('1')
  })

  it('respecte i=0 pour un exercice sans interactivité obligatoire', () => {
    const exercice = new Exercice()
    const params = { uuid: 'test', interactif: '0' as const }

    mathaleaHandleParamOfOneExercice(exercice, params)

    expect(exercice.interactif).toBe(false)
    expect(params.interactif).toBe('0')
  })

  it("applique le `n` de l'URL quand le nombre de questions est modifiable", () => {
    const exercice = new Exercice()
    exercice.nbQuestionsModifiable = true
    exercice.nbQuestions = 3
    const params = { uuid: 'test', nbQuestions: 7 }

    mathaleaHandleParamOfOneExercice(exercice, params)

    expect(exercice.nbQuestions).toBe(7)
  })

  it("ignore le `n` de l'URL quand l'exercice a verrouillé son nombre de questions", () => {
    // Régression : 3AutoG01-1 / 5G1B-3 (repère apiGeom auto-corrigé) ne sait
    // produire qu'une question ; un `n>1` recopié d'un lien le faisait générer
    // énoncé et correction à partir de tirages différents.
    const exercice = new Exercice()
    exercice.nbQuestionsModifiable = false
    exercice.nbQuestions = 1
    const params = { uuid: 'test', nbQuestions: 4 }

    mathaleaHandleParamOfOneExercice(exercice, params)

    expect(exercice.nbQuestions).toBe(1)
  })
})

describe('mathaleaHandleExerciceSimple', () => {
  it('aligne la correction versionQcm sur le moteur QCM partage', () => {
    class ExerciceSimpleQcm extends ExerciceSimple {
      constructor() {
        super()
        this.nbQuestions = 1
        this.versionQcm = true
      }

      nouvelleVersion() {
        this.question = 'Combien font 2 + 2 ?'
        this.reponse = '$4$'
        this.correction = 'On calcule $2+2=4$.'
        this.distracteurs = ['$2$', '$3$', '$5$']
      }
    }

    const exercice = new ExerciceSimpleQcm()
    mathaleaHandleExerciceSimple(exercice, false, 0, 'seed')

    expect(exercice.listeQuestions[0]).includes('Combien font 2 + 2 ?')
    expect(exercice.listeQuestions[0]).includes('$2$')
    expect(exercice.listeQuestions[0]).includes('$3$')
    expect(exercice.listeQuestions[0]).includes('$4$')
    expect(exercice.listeQuestions[0]).includes('$5$')
    expect(exercice.listeCorrections[0]).toContain(
      'La bonne réponse est la réponse',
    )
  })

  it("genere une valeur exploitable par le moteur d'inference AMCNum", () => {
    class ExerciceSimpleAMCNum extends ExerciceSimple {
      constructor() {
        super()
        this.nbQuestions = 1
        this.formatInteractif = 'mathlive'
      }

      nouvelleVersion() {
        this.question = 'Calculer 7 + 5.'
        this.reponse = 12
        this.correction = '7 + 5 = 12.'
      }
    }

    const exercice = new ExerciceSimpleAMCNum()
    mathaleaHandleExerciceSimple(exercice, false, 0, 'seed')

    expect(exercice.autoCorrection[0]).toBeDefined()
    expect(exercice.autoCorrection[0].valeur?.reponse?.value).toBe('12')
  })

  it("genere une autoCorrection AMCOpen via le moteur d'inference", () => {
    class ExerciceSimpleAMCOpen extends ExerciceSimple {
      constructor() {
        super()
        this.nbQuestions = 1
        this.formatInteractif = 'texte'
      }

      nouvelleVersion() {
        this.question = 'Expliquer pourquoi 2 + 2 = 4.'
        this.reponse = 'Réponse libre'
        this.correction = 'Parce que l’addition de deux et deux donne quatre.'
      }
    }

    const exercice = new ExerciceSimpleAMCOpen()
    mathaleaHandleExerciceSimple(exercice, false, 0, 'seed')
    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.autoCorrectionAMC?.[0]).toBeDefined()
    expect(exercice.autoCorrectionAMC?.[0].propositions?.[0].texte).toContain(
      'deux et deux',
    )
    expect(exercice.amcType).toBe('AMCOpen')
  })
})

describe('mathaleaEnsureAMCCompatibility', () => {
  it('applique un fallback AMCOpen par defaut', () => {
    const exercice = {
      question: 'Question sans parametrage AMC',
      correction: 'Correction par defaut',
      autoCorrection: [],
      listeQuestions: [],
      listeCorrections: [],
      amcType: undefined,
      amcReady: undefined,
    } as any

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcReady).toBe(true)
    expect(exercice.amcType).toBe('AMCOpen')
    expect(exercice.autoCorrection).toHaveLength(0)
    expect(exercice.autoCorrectionAMC[0]).toMatchObject({
      enonce: 'Question sans parametrage AMC',
      propositions: [
        {
          texte: 'Correction par defaut',
          statut: 3,
          pointilles: true,
        },
      ],
    })
  })

  it('alimente AMCOpen pour un interactif non supporte', () => {
    const exercice = {
      formatInteractif: 'texte',
      question: 'Question sans parametrage AMC',
      correction: 'Correction par defaut',
      autoCorrection: [],
      listeQuestions: [],
      listeCorrections: [],
      amcType: undefined,
      amcReady: undefined,
    } as any

    mathaleaEnsureAMCCompatibility(exercice)

    expect(exercice.amcReady).toBe(true)
    expect(exercice.amcType).toBe('AMCOpen')
    expect(exercice.autoCorrection).toHaveLength(0)
    expect(exercice.autoCorrectionAMC[0]).toBeDefined()
    expect(exercice.autoCorrectionAMC[0].propositions?.[0].texte).toContain(
      'Correction par defaut',
    )
  })

  it('inference qcmMono et qcmMult depuis autoCorrection', () => {
    const mono = {
      formatInteractif: 'qcm',
      autoCorrection: [
        {
          propositions: [
            { texte: 'A', statut: false },
            { texte: 'B', statut: true },
          ],
        },
      ],
      listeQuestions: [],
      listeCorrections: [],
      amcType: undefined,
      amcReady: undefined,
    } as any

    mathaleaEnsureAMCCompatibility(mono)
    expect(mono.amcType).toBe('qcmMono')

    const mult = {
      formatInteractif: 'qcm',
      autoCorrection: [
        {
          propositions: [
            { texte: 'A', statut: true },
            { texte: 'B', statut: true },
          ],
        },
      ],
      listeQuestions: [],
      listeCorrections: [],
      amcType: undefined,
      amcReady: undefined,
    } as any

    mathaleaEnsureAMCCompatibility(mult)
    expect(mult.amcType).toBe('qcmMult')
  })
})
