import seedrandom from 'seedrandom'
import { describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import ExerciceSimple from '../../src/exercices/ExerciceSimple'
import MetaExercice from '../../src/exercices/MetaExerciceCan'
import Can2025TQ19 from '../../src/exercices/can/canTspea-2025/canTspea-2025-Q19'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { setOutputHtml } from '../../src/modules/context'

class SimpleQuestion extends ExerciceSimple {
  nouvelleVersion() {
    this.consigne = 'Calculer.'
    this.introduction = 'Contexte commun.'
    this.question = 'Énoncé distinct.'
    this.reponse = '1'
    this.correction = 'Correction.'
  }
}
class ClassicQuestion extends Exercice {
  nouvelleVersion() {
    this.consigne = 'Calculer.'
    this.introduction = 'Contexte commun.'
    this.listeQuestions[0] = 'Énoncé distinct.'
    this.listeCorrections[0] = 'Correction.'
  }
}
class MathfieldQuestion extends ClassicQuestion {
  nouvelleVersion() {
    super.nouvelleVersion()
    handleAnswers(this, 0, { reponse: { value: '1' } })
  }
}
class QcmQuestion extends ClassicQuestion {
  nouvelleVersion() {
    super.nouvelleVersion()
    handleAnswers(
      this,
      0,
      {
        qcm: {
          enonce: 'Énoncé distinct.',
          propositions: [
            { texte: 'Un', statut: true },
            { texte: 'Deux', statut: false },
          ],
          options: { ordered: true, radio: true },
        },
      },
      { formatInteractif: 'mathalea-qcm' },
    )
  }
}
class SimpleQcmQuestion extends SimpleQuestion {
  constructor() {
    super()
    this.versionQcm = true
  }
  nouvelleVersion() {
    super.nouvelleVersion()
    this.distracteurs = ['2', '3']
  }
}

function buildMeta(Source: typeof Exercice) {
  setOutputHtml()
  seedrandom('contexte', { global: true })
  const meta = new MetaExercice([Source, Source])
  meta.numeroExercice = 3
  meta.seed = 'contexte'
  meta.interactif = true
  meta.sup2 = '1-2'
  meta.nouvelleVersion()
  return meta
}

describe('contexte des sous-exercices agrégés', () => {
  it.each([
    ['simple', SimpleQuestion],
    ['classique sans custom element', ClassicQuestion],
    ['classique MathLive', MathfieldQuestion],
    ['QCM classique', QcmQuestion],
    ['version QCM simple', SimpleQcmQuestion],
  ] as const)('conserve le contexte une seule fois : %s', (_name, Source) => {
    const meta = buildMeta(Source)
    expect(meta.listeQuestions).toHaveLength(2)
    for (const question of meta.listeQuestions) {
      expect(question).toMatch(/^Calculer\.<br>\nContexte commun\.<br>\n/)
      expect(question.match(/Contexte commun\./g)).toHaveLength(1)
      expect(question.match(/Calculer\./g)).toHaveLength(1)
      expect(question).toContain('Énoncé distinct.')
    }
    if (Source === QcmQuestion || Source === SimpleQcmQuestion) {
      expect(
        meta.autoCorrection.map((entry) => entry.formatInteractif),
      ).toEqual(['mathalea-qcm', 'mathalea-qcm'])
    }
  })

  it('réindexe les figures du contexte vers chaque question hôte', () => {
    class DynamicContextQuestion extends MathfieldQuestion {
      nouvelleVersion() {
        super.nouvelleVersion()
        this.introduction = `<apigeom-figure id="apigeom-figureEx${this.numeroExercice}Q0" numero-exercice="${this.numeroExercice}" index="0" auto-index></apigeom-figure>`
      }
    }
    const meta = buildMeta(DynamicContextQuestion)
    expect(meta.listeQuestions[1]).toContain('id="apigeom-figureEx3Q1"')
    expect(meta.listeQuestions[1]).toContain('index="1"')
    expect(meta.listeQuestions[1]).not.toContain('index="0"')
  })

  it('conserve le graphique de la CAN 2025 Q19 et son barème fixe', () => {
    const meta = buildMeta(Can2025TQ19)
    expect(meta.listeQuestions[0]).toContain('<svg')
    expect(meta.listeQuestions[1]).toContain('<svg')
    expect(meta.listeQuestions[1]).toContain('fill-in-the-blankEx3Q1')
    const answer = meta.autoCorrection[1].valeur
    expect(answer).toHaveProperty('bareme')
    if (answer && 'bareme' in answer) {
      expect(answer.bareme?.([0, 0])).toEqual([0, 1])
      expect(answer.bareme?.([1, 1])).toEqual([1, 1])
    }
  })
})
