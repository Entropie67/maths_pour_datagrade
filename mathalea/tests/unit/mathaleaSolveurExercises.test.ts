import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('mathlive', () => {
  class MockMathfieldElement extends HTMLElement {
    value = ''
    readOnly = false
  }
  if (customElements.get('math-field') == null)
    customElements.define('math-field', MockMathfieldElement)
  return { MathfieldElement: MockMathfieldElement }
})

import EquationsProduitsEnCroix2nde from '../../src/exercices/2e/2L21-3'
import EquationsPremierDegre2nde from '../../src/exercices/2e/2L21-4'
import EquationsAvecDistributivite2nde from '../../src/exercices/2e/2L21-5'
import EquationAvecQuotient from '../../src/exercices/2e/2L21-6'
import InequationsPasAPas from '../../src/exercices/2e/2L30-6'
import EquationsPremierDegre3e from '../../src/exercices/3e/3L13'
import EquationsAvecDistributivite3e from '../../src/exercices/3e/3L13-1'
import EquationsProduitsEnCroix3e from '../../src/exercices/3e/3L13-2'
import EquationsMelees from '../../src/exercices/3e/3L15-3'
import EquationsAvecDistances from '../../src/exercices/4e/4C20-3'
import EquationsProduitsEnCroix4e from '../../src/exercices/4e/4L15-1'
import EquationsPremierDegre from '../../src/exercices/4e/4L20'
import EquationsPasAPas from '../../src/exercices/4e/4L20-1'
import QuatriemeProportionnelle from '../../src/exercices/4e/4P10-2'
import EquationsPremierDegreBP from '../../src/exercices/bp2/bp2autoK1'
import { pointsMaxExercice } from '../../src/lib/interactif/baremeExercice'
import { setOutputHtml, setOutputLatex } from '../../src/modules/context'

describe('exercices modèles de mathalea-solveur', () => {
  beforeEach(() => {
    setOutputHtml()
  })

  it.each([
    ['4L20', EquationsPremierDegre],
    ['2L21-4', EquationsPremierDegre2nde],
    ['3L13', EquationsPremierDegre3e],
    ['bp2autoK1', EquationsPremierDegreBP],
  ])('génère %s avec un solveur par question', (_ref, ExerciseClass) => {
    const exercice = new ExerciseClass()
    exercice.numeroExercice = 1
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions).toHaveLength(exercice.nbQuestions)
    exercice.listeQuestions.forEach((question, index) => {
      expect(question).toContain('<mathalea-solveur')
      expect(question).toContain('mode="evaluation"')
      expect(question).not.toContain(`champTexteEx1Q${index}`)
      expect(exercice.autoCorrection[index].formatInteractif).toBe(
        'mathalea-solveur',
      )
      expect(
        String(exercice.autoCorrection[index].valeur?.reponse?.value),
      ).toContain('=')
    })
  })

  it("n'écrit que l'équation de 4L20 hors interactivité", () => {
    const exercice = new EquationsPremierDegre()
    exercice.numeroExercice = 6
    exercice.interactif = false
    exercice.nouvelleVersion()

    exercice.listeQuestions.forEach((question) => {
      expect(question).not.toContain('<mathalea-solveur')
      expect(question).toMatch(/\$.+=.+\$/)
    })
  })

  it('transpose les identifiants du solveur de 3L13 dans 3L15-3', () => {
    const exercice = new EquationsMelees()
    exercice.numeroExercice = 7
    exercice.interactif = true
    exercice.nouvelleVersion()

    const index = exercice.listeQuestions.findIndex((question) =>
      question.includes('<mathalea-solveur'),
    )
    expect(index).toBeGreaterThanOrEqual(0)
    expect(exercice.listeQuestions[index]).toContain(
      `id="mathalea-solveurEx7Q${index}"`,
    )
    expect(exercice.listeQuestions[index]).toContain(
      `numero-exercice="7" question-index="${index}"`,
    )
    expect(exercice.autoCorrection[index].formatInteractif).toBe(
      'mathalea-solveur',
    )
  })

  it('génère 2L21-6 avec le solveur et une équation finale attendue', () => {
    const exercice = new EquationAvecQuotient()
    exercice.numeroExercice = 10
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.consigne).toBe("Résoudre l'équation suivante.")
    expect(exercice.listeQuestions[0]).toContain('<mathalea-solveur')
    expect(exercice.listeQuestions[0]).toContain('mode="evaluation"')
    expect(exercice.listeQuestions[0]).not.toContain('champTexteEx10Q0')
    expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-solveur')
    expect(String(exercice.autoCorrection[0].valeur?.reponse?.value)).toMatch(
      /^x=/,
    )
  })

  it.each([
    ['3L13-1', EquationsAvecDistributivite3e],
    ['2L21-5', EquationsAvecDistributivite2nde],
  ])('génère %s avec un solveur par question', (_ref, ExerciseClass) => {
    const exercice = new ExerciseClass()
    exercice.numeroExercice = 11
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions).toHaveLength(exercice.nbQuestions)
    exercice.listeQuestions.forEach((question, index) => {
      expect(question).toContain('<mathalea-solveur')
      expect(question).toContain('mode="evaluation"')
      expect(question).not.toContain(`champTexteEx11Q${index}`)
      expect(exercice.autoCorrection[index].formatInteractif).toBe(
        'mathalea-solveur',
      )
      expect(
        String(exercice.autoCorrection[index].valeur?.reponse?.value),
      ).toMatch(/^x=/)
    })
  })

  it.each([
    ['3L13-2', EquationsProduitsEnCroix3e],
    ['2L21-3', EquationsProduitsEnCroix2nde],
    ['4L15-1', EquationsProduitsEnCroix4e],
    ['4C20-3', EquationsAvecDistances],
  ])(
    'génère %s avec un solveur de produit en croix par question',
    (_ref, ExerciseClass) => {
      const exercice = new ExerciseClass()
      exercice.numeroExercice = 12
      exercice.interactif = true
      exercice.nouvelleVersion()

      expect(exercice.listeQuestions).toHaveLength(exercice.nbQuestions)
      exercice.listeQuestions.forEach((question, index) => {
        expect(question).toContain('<mathalea-solveur')
        expect(question).not.toContain(`champTexteEx12Q${index}`)
        expect(exercice.autoCorrection[index].formatInteractif).toBe(
          'mathalea-solveur',
        )
        expect(
          String(exercice.autoCorrection[index].valeur?.reponse?.value),
        ).toContain('=')
      })
    },
  )

  it('conserve le tableau de 4P10-2 avant le solveur', () => {
    const exercice = new QuatriemeProportionnelle()
    exercice.numeroExercice = 13
    exercice.interactif = true
    exercice.nouvelleVersion()

    exercice.listeQuestions.forEach((question, index) => {
      expect(question).toContain('<svg')
      expect(question).toContain('<mathalea-solveur')
      expect(question).toContain('variable="x"')
      expect(question).not.toContain('initial="?')
      expect(exercice.autoCorrection[index].valeur?.reponse?.value).toMatch(
        /^x=/,
      )
    })
  })

  it.each([
    ['2L21-6', EquationAvecQuotient],
    ['3L13-1', EquationsAvecDistributivite3e],
    ['2L21-5', EquationsAvecDistributivite2nde],
    ['3L13-2', EquationsProduitsEnCroix3e],
    ['2L21-3', EquationsProduitsEnCroix2nde],
    ['4L15-1', EquationsProduitsEnCroix4e],
    ['4C20-3', EquationsAvecDistances],
    ['4P10-2', QuatriemeProportionnelle],
  ])(
    "n'écrit que l'équation de %s hors interactivité",
    (_ref, ExerciseClass) => {
      const exercice = new ExerciseClass()
      exercice.numeroExercice = 14
      exercice.interactif = false
      exercice.nouvelleVersion()

      expect(exercice.listeQuestions).toHaveLength(exercice.nbQuestions)
      exercice.listeQuestions.forEach((question) => {
        expect(question).not.toContain('<mathalea-solveur')
        expect(question).toContain('=')
      })
    },
  )

  it.each([
    ['4L20', EquationsPremierDegre, 'sup4'],
    ['2L21-4', EquationsPremierDegre2nde, 'sup4'],
    ['3L13', EquationsPremierDegre3e, 'sup4'],
    ['bp2autoK1', EquationsPremierDegreBP, 'sup4'],
    ['2L21-6', EquationAvecQuotient, 'sup'],
    ['3L13-1', EquationsAvecDistributivite3e, 'sup3'],
    ['2L21-5', EquationsAvecDistributivite2nde, 'sup3'],
    ['3L13-2', EquationsProduitsEnCroix3e, 'sup2'],
    ['2L21-3', EquationsProduitsEnCroix2nde, 'sup2'],
    ['4L15-1', EquationsProduitsEnCroix4e, 'sup2'],
    ['4C20-3', EquationsAvecDistances, 'sup2'],
    ['4P10-2', QuatriemeProportionnelle, 'sup2'],
    ['4L20-1', EquationsPasAPas, 'sup'],
    ['2L30-6', InequationsPasAPas, 'sup2'],
  ])(
    'active le solveur de %s en mode entraînement hors interactivité',
    (_ref, ExerciseClass, option) => {
      const exercice = new ExerciseClass()
      exercice.numeroExercice = 15
      exercice.interactif = false
      Object.assign(exercice, { [option]: true })
      exercice.nouvelleVersion()

      expect(exercice.listeQuestions).toHaveLength(exercice.nbQuestions)
      exercice.listeQuestions.forEach((question) => {
        expect(question).toContain('<mathalea-solveur')
        expect(question).toContain('mode="entrainement"')
        expect(question).toContain('interactivity-on="true"')
      })
    },
  )

  it.each([
    ['4L20', EquationsPremierDegre, 'sup5'],
    ['2L21-4', EquationsPremierDegre2nde, 'sup5'],
    ['3L13', EquationsPremierDegre3e, 'sup5'],
    ['bp2autoK1', EquationsPremierDegreBP, 'sup5'],
    ['2L21-6', EquationAvecQuotient, 'sup2'],
    ['3L13-1', EquationsAvecDistributivite3e, 'sup4'],
    ['2L21-5', EquationsAvecDistributivite2nde, 'sup4'],
    ['3L13-2', EquationsProduitsEnCroix3e, 'sup3'],
    ['2L21-3', EquationsProduitsEnCroix2nde, 'sup3'],
    ['4L15-1', EquationsProduitsEnCroix4e, 'sup3'],
    ['4C20-3', EquationsAvecDistances, 'sup3'],
    ['4P10-2', QuatriemeProportionnelle, 'sup3'],
    ['4L20-1', EquationsPasAPas, 'sup2'],
    ['2L30-6', InequationsPasAPas, 'sup3'],
  ])(
    'propose pour %s un barème sur 1 ou sur 2 points en mode interactif',
    (_ref, ExerciseClass, option) => {
      const genere = (choix: number) => {
        const exercice = new ExerciseClass()
        exercice.numeroExercice = 17
        exercice.interactif = true
        Object.assign(exercice, { [option]: choix })
        exercice.nouvelleVersion()
        return exercice
      }

      const surUnPoint = genere(1)
      surUnPoint.listeQuestions.forEach((question) =>
        expect(question).toContain('mode="evaluation"'),
      )
      expect(pointsMaxExercice(surUnPoint)).toBe(surUnPoint.nbQuestions)

      const surDeuxPoints = genere(2)
      surDeuxPoints.listeQuestions.forEach((question) =>
        expect(question).toContain('mode="entrainement"'),
      )
      expect(pointsMaxExercice(surDeuxPoints)).toBe(
        2 * surDeuxPoints.nbQuestions,
      )
    },
  )

  it('garde 2 points par question dans 3L15-3 avec le barème sur 2 points', () => {
    const exercice = new EquationsMelees()
    exercice.numeroExercice = 18
    exercice.interactif = true
    exercice.sup3 = 2
    exercice.nbQuestions = 6
    exercice.nouvelleVersion()

    expect(
      exercice.autoCorrection.map((_, i) =>
        pointsMaxExercice({
          ...exercice,
          autoCorrection: [exercice.autoCorrection[i]],
        } as never),
      ),
    ).toEqual(new Array(6).fill(2))
  })

  it('active les questions avec solveur de 3L15-3 en mode entraînement hors interactivité', () => {
    const exercice = new EquationsMelees()
    exercice.numeroExercice = 16
    exercice.interactif = false
    exercice.sup2 = true
    exercice.nbQuestions = 6
    exercice.nouvelleVersion()

    const questionsAvecSolveur = exercice.listeQuestions.filter((question) =>
      question.includes('<mathalea-solveur'),
    )
    expect(questionsAvecSolveur.length).toBeGreaterThan(0)
    questionsAvecSolveur.forEach((question) => {
      expect(question).toContain('mode="entrainement"')
      expect(question).toContain('interactivity-on="true"')
    })
  })

  it('génère 4L20-1 avec une équation finale attendue par question', () => {
    const exercice = new EquationsPasAPas()
    exercice.numeroExercice = 2
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions).toHaveLength(4)
    exercice.listeQuestions.forEach((question, index) => {
      expect(question).toContain('<mathalea-solveur')
      expect(question).toContain('mode="evaluation"')
      expect(exercice.autoCorrection[index].formatInteractif).toBe(
        'mathalea-solveur',
      )
      expect(
        String(exercice.autoCorrection[index].valeur?.reponse?.value),
      ).toMatch(/^x=-?\d+$/)
      expect(exercice.listeCorrections[index]).toContain('\\begin{aligned}')
      expect(exercice.listeCorrections[index]).not.toContain('\\iff')
    })
  })

  it("conserve les équations de 4L20-1 dans l'export LaTeX", () => {
    setOutputLatex()
    const exercice = new EquationsPasAPas()
    exercice.interactif = false
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions).toHaveLength(exercice.nbQuestions)
    exercice.listeQuestions.forEach((question) => {
      expect(question).toMatch(/^\$.+=.+\$$/)
      expect(question).not.toContain('<mathalea-solveur')
    })
  })

  it('pilote la droite graduée de 2L30-6 avec la case à cocher', () => {
    const avecDroite = new InequationsPasAPas()
    avecDroite.numeroExercice = 3
    avecDroite.interactif = true
    avecDroite.sup = true
    avecDroite.nouvelleVersion()
    expect(
      avecDroite.listeQuestions.every((question) =>
        question.includes('show-interval="true"'),
      ),
    ).toBe(true)
    expect(
      avecDroite.listeCorrections.every(
        (correction) =>
          correction.includes('\\begin{aligned}') &&
          !correction.includes('\\iff'),
      ),
    ).toBe(true)

    const sansDroite = new InequationsPasAPas()
    sansDroite.numeroExercice = 4
    sansDroite.interactif = true
    sansDroite.sup = false
    sansDroite.nouvelleVersion()
    expect(
      sansDroite.listeQuestions.every((question) =>
        question.includes('show-interval="false"'),
      ),
    ).toBe(true)

    const entrainement = new InequationsPasAPas()
    entrainement.numeroExercice = 5
    entrainement.interactif = false
    entrainement.sup2 = true
    entrainement.nouvelleVersion()
    expect(
      entrainement.listeQuestions.every(
        (question) =>
          question.includes('<mathalea-solveur') &&
          question.includes('mode="entrainement"'),
      ),
    ).toBe(true)
  })
})
