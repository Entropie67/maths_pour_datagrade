import { describe, expect, it } from 'vitest'
import AutoC8d from '../exercices/1e/1A-C08-4-old'
import { bleuMathalea, orangeMathalea } from './colors'
import { mathaleaHandleExerciceSimple } from './mathalea'
import { qcmCamExport, qcmCamExportAll } from './qcmCam'
import type { IExercice } from './types'

describe('qcmCamExport', () => {
  it('ajoute une seule diapo introductive avant les questions sans modifier les réponses', () => {
    const exercice = {
      autoCorrection: [
        {
          formatInteractif: 'qcm',
          propositions: [{ texte: 'Une réponse "citée"', statut: true }],
        },
      ],
      consigne: '',
      introduction: '',
      listeQuestions: ['Question'],
    } as unknown as IExercice

    const exported = JSON.parse(qcmCamExportAll([exercice, exercice]))

    expect(Object.keys(exported)).toEqual(['0', '1', '2'])
    expect(exported['0'].reponse).toBe('')
    expect(exported['0'].question).toContain(
      '<strong>Cette série de questions a été générée par MathALÉA</strong>',
    )
    expect(exported['0'].question).toContain(`border: 3px solid ${bleuMathalea}`)
    expect(exported['0'].question).toContain(`color: ${orangeMathalea}`)
    expect(exported['0'].question).toContain('align-items: center')
    expect(exported['0'].question).toContain('justify-content: center')
    for (const index of ['1', '2']) {
      expect(exported[index].reponse).toBe('A')
      expect(exported[index].question).toContain('Une réponse "citée"')
      expect(exported[index].question.endsWith('</ol>')).toBe(true)
      expect(exported[index].question).not.toContain('MathALÉA')
    }
  })

  it.each(['qcm', 'mathalea-qcm'])(
    'exporte tous les choix et toutes les bonnes réponses au format %s',
    (formatInteractif) => {
      const exercice = {
        autoCorrection: [
          {
            formatInteractif,
            propositions: [
              { texte: 'A', statut: true },
              { texte: 'B', statut: false },
              { texte: 'C', statut: false },
              { texte: 'D', statut: false },
              { texte: 'E', statut: true },
            ],
          },
        ],
        consigne: '',
        introduction: '',
        listeQuestions: ['Question'],
      } as unknown as IExercice

      const [question] = qcmCamExport(exercice)

      expect(question.reponse).toBe('AE')
      expect(question.question.match(/<li/g)).toHaveLength(5)
    },
  )

  it('exporte la version QCM d’un ExerciceSimple', () => {
    const exercice = new AutoC8d()

    mathaleaHandleExerciceSimple(exercice, false, 0, 'qcm-cam-simple')

    expect(exercice.versionQcm).toBe(true)
    expect(qcmCamExport(exercice)).toHaveLength(1)
  })
})
