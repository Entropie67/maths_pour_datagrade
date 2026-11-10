import seedrandom from 'seedrandom'
import { describe, expect, it } from 'vitest'
import ExerciceSimple from '../../src/exercices/ExerciceSimple'
import { choice } from '../../src/lib/outils/arrayOutils'
import { randint } from '../../src/modules/outils'

type Niveau = 'facile' | 'difficile'

class ExerciceDeTest extends ExerciceSimple {
  niveauxTires: Niveau[] = []
  constructor() {
    super()
    this.nbQuestions = 10
  }

  nouvelleVersion() {
    const niveau = this.quotaChoice<Niveau>('niveau', ['facile', 'difficile'])
    this.niveauxTires.push(niveau)
    this.question = `Question de niveau ${niveau}`
    this.correction = ''
    this.reponse = '42'
  }
}

/** Reproduit la boucle de mathaleaHandleExerciceSimple : reinit puis un appel
 * de nouvelleVersion par question avec une graine dédiée, la question validée
 * étant poussée dans listeQuestions. */
function genereUneVersion(exercice: ExerciceDeTest, seed: string): Niveau[] {
  exercice.reinit()
  exercice.niveauxTires = []
  for (let i = 0; i < exercice.nbQuestions; i++) {
    seedrandom(seed + i + 0, { global: true })
    exercice.nouvelleVersion()
    exercice.listeQuestions.push(exercice.question ?? '')
    exercice.listeCorrections.push(exercice.correction ?? '')
  }
  return exercice.niveauxTires
}

describe('ExerciceSimple.quotaChoice', () => {
  it('donne exactement la moitié des questions dans chaque niveau', () => {
    const exercice = new ExerciceDeTest()
    const niveaux = genereUneVersion(exercice, 'graine1')
    expect(niveaux).toHaveLength(10)
    expect(niveaux.filter((n) => n === 'facile')).toHaveLength(5)
    expect(niveaux.filter((n) => n === 'difficile')).toHaveLength(5)
  })

  it('est déterministe pour une graine donnée et retiré à chaque version', () => {
    const exercice = new ExerciceDeTest()
    const premiereVersion = genereUneVersion(exercice, 'graine1')
    const deuxiemeVersion = genereUneVersion(exercice, 'graine1')
    expect(deuxiemeVersion).toEqual(premiereVersion)
    // Une autre graine doit donner un plan retiré (après reinit) mais toujours équilibré
    const autreGraine = genereUneVersion(exercice, 'graine2')
    expect(autreGraine.filter((n) => n === 'facile')).toHaveLength(5)
  })

  it("conserve la même valeur planifiée quand une question en doublon est retirée, c'est-à-dire tant que listeQuestions n'avance pas", () => {
    const exercice = new ExerciceDeTest()
    exercice.reinit()
    seedrandom('graine1' + 0 + 0, { global: true })
    exercice.nouvelleVersion()
    // Question refusée (doublon) : nouvelleVersion est rappelée sans push dans listeQuestions
    seedrandom('graine1' + 0 + 1, { global: true })
    exercice.nouvelleVersion()
    expect(exercice.niveauxTires[1]).toBe(exercice.niveauxTires[0])
  })

  it('permet de pondérer en répétant une valeur', () => {
    class ExercicePondere extends ExerciceSimple {
      niveauxTires: Niveau[] = []
      constructor() {
        super()
        this.nbQuestions = 9
      }

      nouvelleVersion() {
        this.niveauxTires.push(
          this.quotaChoice<Niveau>('niveau', [
            'facile',
            'facile',
            'difficile',
          ]),
        )
        this.question = `Question ${this.niveauxTires.length}`
        this.reponse = '42'
      }
    }
    const exercice = new ExercicePondere()
    exercice.reinit()
    for (let i = 0; i < exercice.nbQuestions; i++) {
      seedrandom('graine' + i, { global: true })
      exercice.nouvelleVersion()
      exercice.listeQuestions.push(exercice.question ?? '')
    }
    expect(
      exercice.niveauxTires.filter((n) => n === 'facile'),
    ).toHaveLength(6)
  })

  it('contrôle indépendamment plusieurs variables', () => {
    class ExerciceDeuxVariables extends ExerciceSimple {
      tirages: { niveau: Niveau; operation: string }[] = []
      constructor() {
        super()
        this.nbQuestions = 4
      }

      nouvelleVersion() {
        this.tirages.push({
          niveau: this.quotaChoice<Niveau>('niveau', ['facile', 'difficile']),
          operation: this.quotaChoice('operation', ['+', '-', '×', '÷']),
        })
        this.question = `Question ${this.tirages.length}`
        this.correction = ''
        this.reponse = '42'
      }
    }
    const exercice = new ExerciceDeuxVariables()
    exercice.reinit()
    for (let i = 0; i < exercice.nbQuestions; i++) {
      seedrandom('graine' + i, { global: true })
      exercice.nouvelleVersion()
      exercice.listeQuestions.push(exercice.question ?? '')
    }
    const niveaux = exercice.tirages.map((t) => t.niveau)
    const operations = exercice.tirages.map((t) => t.operation)
    expect(niveaux.filter((n) => n === 'facile')).toHaveLength(2)
    expect([...new Set(operations)].sort()).toEqual(['+', '-', '×', '÷'].sort())
  })
})

describe('ExerciceSimple.quotaRandint', () => {
  it('répartit équitablement chaque valeur de l’intervalle sur les questions', () => {
    class ExerciceEntiers extends ExerciceSimple {
      valeursTirees: number[] = []
      constructor() {
        super()
        this.nbQuestions = 9
      }

      nouvelleVersion() {
        this.valeursTirees.push(this.quotaRandint('n', 1, 3))
        this.question = `Question ${this.valeursTirees.length}`
        this.reponse = '42'
      }
    }
    const exercice = new ExerciceEntiers()
    exercice.reinit()
    for (let i = 0; i < exercice.nbQuestions; i++) {
      seedrandom('graine' + i, { global: true })
      exercice.nouvelleVersion()
      exercice.listeQuestions.push(exercice.question ?? '')
    }
    for (const valeur of [1, 2, 3]) {
      expect(
        exercice.valeursTirees.filter((v) => v === valeur),
      ).toHaveLength(3)
    }
  })

  it('exclut les valeurs de listeAEviter', () => {
    class ExerciceEntiers extends ExerciceSimple {
      valeursTirees: number[] = []
      constructor() {
        super()
        this.nbQuestions = 8
      }

      nouvelleVersion() {
        this.valeursTirees.push(this.quotaRandint('n', 1, 4, [2]))
        this.question = `Question ${this.valeursTirees.length}`
        this.reponse = '42'
      }
    }
    const exercice = new ExerciceEntiers()
    exercice.reinit()
    for (let i = 0; i < exercice.nbQuestions; i++) {
      seedrandom('graine' + i, { global: true })
      exercice.nouvelleVersion()
      exercice.listeQuestions.push(exercice.question ?? '')
    }
    expect(exercice.valeursTirees).not.toContain(2)
    expect([...new Set(exercice.valeursTirees)].sort()).toEqual([1, 3, 4])
  })
})

describe('ExerciceSimple.quotaChoice / quotaRandint sur un exercice à une seule question', () => {
  it("quotaChoice retombe sur choice(), pour ne pas changer les liens déjà générés", () => {
    class ExerciceUneQuestion extends ExerciceSimple {
      constructor() {
        super()
        this.nbQuestions = 1
      }

      nouvelleVersion() {
        // ne consomme rien avant l'appel testé
      }
    }
    const exercice = new ExerciceUneQuestion()
    exercice.reinit()
    seedrandom('graine1', { global: true })
    const valeurQuota = exercice.quotaChoice('a', [6, 7, 8, 9])

    seedrandom('graine1', { global: true })
    const valeurChoice = choice([6, 7, 8, 9])

    expect(valeurQuota).toBe(valeurChoice)
  })

  it("quotaRandint retombe sur randint(), pour ne pas changer les liens déjà générés", () => {
    class ExerciceUneQuestion extends ExerciceSimple {
      constructor() {
        super()
        this.nbQuestions = 1
      }

      nouvelleVersion() {}
    }
    const exercice = new ExerciceUneQuestion()
    exercice.reinit()
    seedrandom('graine1', { global: true })
    const valeurQuota = exercice.quotaRandint('n', 1, 9, [5])

    seedrandom('graine1', { global: true })
    const valeurRandint = randint(1, 9, [5])

    expect(valeurQuota).toBe(valeurRandint)
  })
})
