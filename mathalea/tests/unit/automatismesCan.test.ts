import { describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import MetaExercice from '../../src/exercices/MetaExerciceCan'
import AutomatismesPremiere from '../../src/exercices/1e/1a-automatismes'
import AutomatismesSeconde from '../../src/exercices/2e/2a-automatismes'
import AutomatismesTroisieme from '../../src/exercices/3e/3a-automatismes'
import AutomatismesSixieme from '../../src/exercices/6e/6a-automatismes'
import { createAutomatismesCanExercice } from '../../src/exercices/_automatismesCan'
import type { CategoriesForm } from '../../src/exercices/_automatismesCan'

/**
 * Les exercices « Sélection d'automatismes » (1A, 3Auto, …) déduisent leur nombre
 * de questions du formulaire par catégories. Le diaporama lit `nbQuestions` et
 * `besoinFormulaireNombresCategories` pour afficher le total et verrouiller le
 * champ correspondant : ces tests protègent ce contrat.
 */

const cases = [
  { titre: '1A', Exercice: AutomatismesPremiere },
  { titre: '2A', Exercice: AutomatismesSeconde },
  { titre: '3Auto', Exercice: AutomatismesTroisieme },
  { titre: '6A', Exercice: AutomatismesSixieme },
]

describe.each(cases)("$titre - Sélection d'automatismes", ({ Exercice }) => {
  it('interdit de régler le nombre de questions ailleurs que par catégorie', () => {
    expect(new Exercice().nbQuestionsModifiable).toBe(false)
  })

  it('propose une valeur de `sup` par défaut par catégorie', () => {
    const exercice = new Exercice()
    const categories = (
      exercice.besoinFormulaireNombresCategories as CategoriesForm
    ).categories
    expect(String(exercice.sup).split('-')).toHaveLength(categories.length)
  })

  it("ne demande jamais plus de questions qu'il n'y a d'exercices", () => {
    const exercice = new Exercice()
    const form = exercice.besoinFormulaireNombresCategories as CategoriesForm
    form.categories.forEach((categorie, i) => {
      expect(form.defaut[i]).toBeLessThanOrEqual(categorie.max)
    })
  })

  it('annonce un nombre de questions égal à la somme des catégories', async () => {
    const exercice = new Exercice()
    exercice.seed = 'test'
    const total = String(exercice.sup)
      .split('-')
      .reduce((somme, part) => somme + parseInt(part), 0)
    // `nouvelleVersion()` charge les modules sélectionnés en tâche de fond et
    // signale la fin du chargement par un événement `updateAsyncEx`.
    const chargementTermine = new Promise<void>((resolve) => {
      document.addEventListener('updateAsyncEx', () => resolve(), {
        once: true,
      })
    })
    exercice.nouvelleVersion()
    expect(exercice.nbQuestions).toBe(total)
    await chargementTermine
    expect(exercice.Exercices).toHaveLength(total)
    expect(exercice.listeQuestions).toHaveLength(total)
    expect(exercice.listeQuestions).not.toContain('chargement...')
  }, 30000)
})

it('conserve le format clique-figure de 3Auto, graine jYwp, après chargement puis depuis le cache', async () => {
  const exercise = new AutomatismesTroisieme()
  exercise.seed = 'jYwp'
  exercise.numeroExercice = 0
  exercise.interactif = true
  exercise.sup2 = true
  exercise.nouvelleVersion()
  // Le chargement des sous-exercices dépasse le délai par défaut de
  // `vi.waitFor` (1 s) sur les runners lents de la CI.
  await vi.waitFor(() => expect(exercise.generationStatus).toBe('ready'), {
    timeout: 20000,
  })
  const checkQuestion = () => {
    const index = exercise.questionRefs?.indexOf('3AutoI01-1') ?? -1
    expect(index).toBeGreaterThanOrEqual(0)
    expect(exercise.autoCorrection[index].formatInteractif).toBe(
      'clique-figure',
    )
    expect(exercise.listeQuestions[index]).toContain(
      `cliquefigure0Ex0Q${index}`,
    )
    expect(exercise.listeQuestions[index]).not.toContain(
      `champTexteEx0Q${index}`,
    )
  }
  checkQuestion()
  exercise.nouvelleVersion()
  expect(exercise.generationStatus).toBe('ready')
  checkQuestion()
}, 30000)

describe('createAutomatismesCanExercice', () => {
  const categoriesForm: CategoriesForm = {
    titre: 'Nombre de questions par catégorie',
    categories: [
      { label: 'Abondante :', max: 12 },
      { label: 'Rare :', max: 12 },
    ],
    defaut: [2, 2],
  }
  const modules = {
    './XA01.ts': async () => ({ default: class {} }),
    './XA02.ts': async () => ({ default: class {} }),
    './XB01.ts': async () => ({ default: class {} }),
  } as unknown as Parameters<typeof createAutomatismesCanExercice>[0]['modules']

  it('borne le formulaire et le `sup` par défaut sur les exercices existants', () => {
    const Exercice = createAutomatismesCanExercice({
      modules,
      refRegex: /^X([AB])/,
      categories: ['A', 'B'],
      categoriesForm,
      defaultSup: '2-2',
    })
    const exercice = new Exercice()
    const form = exercice.besoinFormulaireNombresCategories as CategoriesForm
    expect(exercice.besoinFormulaireCaseACocher).toBe(false)
    // La catégorie B n'a qu'un seul exercice disponible
    expect(form.categories.map((c) => c.max)).toEqual([2, 1])
    expect(exercice.sup).toBe('2-1')
  })

  it('sépare le cache des catalogues publiés et courants qui partagent une référence', async () => {
    class AncienneVersion extends Exercice {
      nouvelleVersion() {
        this.listeQuestions[0] = 'Ancienne version.'
      }
    }
    class VersionCourante extends Exercice {
      nouvelleVersion() {
        this.listeQuestions[0] = 'Version courante.'
      }
    }
    const config = {
      refRegex: /^X([A])/,
      categories: ['A'],
      categoriesForm: {
        titre: 'Nombre de questions',
        categories: [{ label: 'Questions :', max: 1 }],
        defaut: [1],
      },
      defaultSup: '1',
    }
    const AncienCatalogue = createAutomatismesCanExercice({
      ...config,
      modules: { './XA01.ts': async () => ({ default: AncienneVersion }) },
    })
    const CatalogueCourant = createAutomatismesCanExercice({
      ...config,
      modules: { './XA01.ts': async () => ({ default: VersionCourante }) },
    })
    const ancien = new AncienCatalogue()
    ancien.seed = 'catalogue'
    ancien.nouvelleVersion()
    await vi.waitFor(() => expect(ancien.generationStatus).toBe('ready'))

    const courant = new CatalogueCourant()
    courant.seed = 'catalogue'
    courant.nouvelleVersion()
    await vi.waitFor(() => expect(courant.generationStatus).toBe('ready'))
    expect(ancien.Exercices[0]).toBe(AncienneVersion)
    expect(courant.Exercices[0]).toBe(VersionCourante)
  })
})

describe('MetaExerciceCan', () => {
  class QuestionMultiple extends Exercice {
    constructor() {
      super()
      this.nbQuestions = 3
    }

    nouvelleVersion() {
      const consigne =
        this.nbQuestions === 1
          ? 'Consigne au singulier.'
          : 'Consigne au pluriel.'
      for (let i = 0; i < this.nbQuestions; i++) {
        this.listeQuestions[i] = consigne
        this.listeCorrections[i] = ''
      }
    }
  }

  class QuestionMathlive extends Exercice {
    nouvelleVersion() {
      this.listeQuestions[0] = 'Question simple'
      this.listeCorrections[0] = ''
      this.autoCorrection[0] = {
        formatInteractif: 'mathlive',
        valeur: { reponse: { value: '1' } },
      }
    }
  }

  class QuestionTableauMathlive extends Exercice {
    nouvelleVersion() {
      this.listeQuestions[0] = [
        '<tableau-mathlive id="tableau-mathliveEx0Q0" table-id="tabMathliveEx0Q0">',
        '<table id="tabMathliveEx0Q0">',
        '<tr><td><math-field id="champTexteEx0Q0L1C1"></math-field></td></tr>',
        '</table>',
        '</tableau-mathlive>',
      ].join('')
      this.listeCorrections[0] = ''
      this.autoCorrection[0] = {
        formatInteractif: 'tableau-mathlive',
        valeur: { L1C1: { value: '1' } },
      }
    }
  }

  class QuestionCliqueFigure extends Exercice {
    nouvelleVersion() {
      this.listeQuestions[0] = [
        '<svg>',
        '<rect id="cliquefigure0Ex0Q0"></rect>',
        '<rect id="cliquefigure1Ex0Q0"></rect>',
        '</svg>',
        '<clique-figure id="clique-figureEx0Q0"></clique-figure>',
        '<span id="resultatCheckEx0Q0"></span>',
      ].join('')
      this.listeCorrections[0] = ''
      this.autoCorrection[0] = {
        formatInteractif: 'clique-figure',
      }
      this.cliqueFiguresArray = [
        [
          { id: 'cliquefigure0Ex0Q0', solution: true },
          { id: 'cliquefigure1Ex0Q0', solution: false },
        ],
      ]
    }
  }

  it('demande une seule question au sous-exercice sélectionné', () => {
    const exercice = new MetaExercice([QuestionMultiple])
    exercice.sup2 = '1'
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions).toEqual(['Consigne au singulier.'])
  })

  it('réindexe aussi l’identifiant du tableau tableau-mathlive', () => {
    const exercice = new MetaExercice([
      QuestionMathlive,
      QuestionMathlive,
      QuestionMathlive,
      QuestionTableauMathlive,
    ])
    exercice.numeroExercice = 0
    exercice.sup2 = '1-2-3-4'
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions[3]).toContain('table-id="tabMathliveEx0Q3"')
    expect(exercice.listeQuestions[3]).toContain('id="tabMathliveEx0Q3"')
    expect(exercice.listeQuestions[3]).toContain('id="champTexteEx0Q3L1C1"')
    expect(exercice.listeQuestions[3]).not.toContain('tabMathliveEx0Q0')
  })

  it('réindexe les éléments clique-figure et leurs figures associées', () => {
    const exercice = new MetaExercice([
      QuestionMathlive,
      QuestionMathlive,
      QuestionMathlive,
      QuestionCliqueFigure,
    ])
    exercice.numeroExercice = 0
    exercice.sup2 = '1-2-3-4'
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions[3]).toContain('id="clique-figureEx0Q3"')
    expect(exercice.listeQuestions[3]).toContain('id="cliquefigure0Ex0Q3"')
    expect(exercice.listeQuestions[3]).toContain('id="resultatCheckEx0Q3"')
    expect(exercice.autoCorrection[3].formatInteractif).toBe('clique-figure')
    expect(exercice.cliqueFiguresArray?.[3]).toEqual([
      { id: 'cliquefigure0Ex0Q3', solution: true },
      { id: 'cliquefigure1Ex0Q3', solution: false },
    ])
    expect(exercice.listeQuestions[3]).not.toContain('cliquefigure0Ex0Q0')
  })
})
