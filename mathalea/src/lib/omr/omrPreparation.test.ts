import { describe, expect, it, vi } from 'vitest'
import { context } from '../../modules/context'
import { preparerExercice, preparerExercices } from './omrPreparation'
import type { IExercice } from '../types'

/**
 * Exercice minimal, dont la génération se contente de remplir une liste.
 *
 * Comme un vrai exercice, il réécrit ses listes à chaque génération plutôt que
 * de les allonger : `preparerExercice` en déclenche deux, une par contexte.
 */
function exerciceFactice(overrides: Record<string, unknown> = {}) {
  const exercice = {
    id: 'X1',
    seed: 'abcd',
    interactif: false,
    listeQuestions: [] as string[],
    listeCorrections: [] as string[],
    autoCorrection: [] as unknown[],
    lastCallback: 'déjà généré',
    nouvelleVersionWrapper: vi.fn(function (this: Record<string, unknown>) {
      this.listeQuestions = ['Q1']
      this.listeCorrections = ['C1']
      this.autoCorrection = [
        {
          formatInteractif: 'mathalea-qcm',
          propositions: [
            { texte: 'a', statut: true },
            { texte: 'b', statut: false },
          ],
        },
      ]
    }),
    ...overrides,
  }
  return exercice as unknown as IExercice
}

describe('preparerExercice', () => {
  it('active les modes QCM pendant les deux passes et restaure les choix', () => {
    const modes: unknown[][] = []
    const exercice = exerciceFactice({
      versionQcmDisponible: true,
      versionQcm: false,
      besoinFormulaire3CaseACocher: ['Version QCM', false],
      sup3: false,
      nouvelleVersionWrapper: vi.fn(function (this: Record<string, unknown>) {
        modes.push([this.versionQcm, this.sup3])
      }),
    })
    preparerExercice(exercice)
    expect(modes).toEqual([
      [true, true],
      [true, true],
    ])
    expect((exercice as IExercice & { versionQcm?: boolean }).versionQcm).toBe(
      false,
    )
    expect(exercice.sup3).toBe(false)
  })

  it('génère l’exercice, qui n’est que chargé sans cela', () => {
    const exercice = exerciceFactice()
    preparerExercice(exercice)
    expect(exercice.listeQuestions).toHaveLength(1)
    expect(exercice.autoCorrection).toHaveLength(1)
  })

  it('vide la mémoïsation, sans quoi la génération serait ignorée', () => {
    // `lastCallback` fait sauter la régénération quand la signature n'a pas
    // changé : l'exercice resterait vide et aucune case ne serait imprimée
    const exercice = exerciceFactice()
    preparerExercice(exercice)
    expect(
      (
        exercice as unknown as {
          nouvelleVersionWrapper: ReturnType<typeof vi.fn>
        }
      ).nouvelleVersionWrapper,
    ).toHaveBeenCalled()
  })

  it('génère une fois en interactif, une fois pour le papier', () => {
    // la passe interactive est la seule où `autoCorrection` se remplit ; la
    // seconde produit l'énoncé sans champ de saisie, celui qu'on imprime
    const passes: boolean[] = []
    let isHtmlPendant: boolean | undefined
    let isAmcPendant: boolean | undefined
    const exercice = exerciceFactice({
      nouvelleVersionWrapper: vi.fn(function (this: { interactif: boolean }) {
        passes.push(this.interactif)
        isHtmlPendant = context.isHtml
        isAmcPendant = context.isAmc
      }),
    })
    preparerExercice(exercice)
    expect(passes).toEqual([true, false])
    expect(isHtmlPendant).toBe(true)
    expect(isAmcPendant).toBe(false)
  })

  it('restaure le contexte global qu’il a modifié', () => {
    const isHtmlAvant = context.isHtml
    const isAmcAvant = context.isAmc
    context.isHtml = false
    context.isAmc = true
    const exercice = exerciceFactice({ interactif: false })
    preparerExercice(exercice)
    expect(context.isHtml).toBe(false)
    expect(context.isAmc).toBe(true)
    expect(exercice.interactif).toBe(false)
    context.isHtml = isHtmlAvant
    context.isAmc = isAmcAvant
  })

  it('restaure le contexte même si la génération échoue', () => {
    // un exercice qui lève laisserait sinon tout MathALÉA en contexte AMC
    const isHtmlAvant = context.isHtml
    const exercice = exerciceFactice({
      nouvelleVersionWrapper: vi.fn(() => {
        throw new Error('exercice cassé')
      }),
    })
    expect(() => preparerExercice(exercice)).toThrow('exercice cassé')
    expect(context.isHtml).toBe(isHtmlAvant)
    expect(exercice.interactif).toBe(false)
  })

  it('ignore un exercice sans générateur plutôt que de lever', () => {
    const exercice = exerciceFactice({ nouvelleVersionWrapper: undefined })
    expect(() => preparerExercice(exercice)).not.toThrow()
  })

  it('génère chaque exercice de la liste', () => {
    const exercices = [exerciceFactice(), exerciceFactice()]
    preparerExercices(exercices)
    for (const exercice of exercices) {
      expect(exercice.listeQuestions).toHaveLength(1)
    }
  })

  it('génère avec la graine imposée, puis restaure celle de l’exercice', () => {
    let grainePendant: unknown
    const exercice = exerciceFactice({
      seed: 'graine-native',
      nouvelleVersionWrapper: vi.fn(function (this: { seed: unknown }) {
        grainePendant = this.seed
      }),
    })
    preparerExercice(exercice, 'graine-eleve-03')
    expect(grainePendant).toBe('graine-eleve-03')
    // l'exercice ne doit pas garder trace de ce détournement
    expect(exercice.seed).toBe('graine-native')
  })

  it('restaure la graine même si la génération échoue', () => {
    const exercice = exerciceFactice({
      seed: 'graine-native',
      nouvelleVersionWrapper: vi.fn(() => {
        throw new Error('exercice cassé')
      }),
    })
    expect(() => preparerExercice(exercice, 'graine-eleve-03')).toThrow()
    expect(exercice.seed).toBe('graine-native')
  })

  it('propage la graine imposée à toute la liste', () => {
    const graines: unknown[] = []
    const faire = () =>
      exerciceFactice({
        nouvelleVersionWrapper: vi.fn(function (this: { seed: unknown }) {
          graines.push(this.seed)
        }),
      })
    preparerExercices([faire(), faire()], 'commune')
    // deux passes par exercice, toutes sur la graine imposée
    expect(graines).toEqual(['commune', 'commune', 'commune', 'commune'])
  })
})

describe('inférence de la structure AMC', () => {
  it('range le verdict de l’inférence dans autoCorrectionAMC', () => {
    // sans elle, la lecture optique ne reconnaîtrait que ce que le moteur
    // interactif laisse voir : ni le type, ni le calibre des cases
    const exercice = exerciceFactice()
    preparerExercice(exercice)
    expect(exercice.amcType).toBe('qcmMono')
    expect(exercice.autoCorrectionAMC?.[0]?.propositions).toHaveLength(2)
  })

  it('déduit une réponse numérique d’un champ de saisie', () => {
    const exercice = exerciceFactice({
      nouvelleVersionWrapper: vi.fn(function (this: Record<string, unknown>) {
        this.listeQuestions = ['57 + 68 = ?']
        this.listeCorrections = ['125']
        this.autoCorrection = [
          {
            formatInteractif: 'fill-in-the-blank',
            valeur: { champ1: { value: '125' } },
          },
        ]
      }),
    })
    preparerExercice(exercice)
    expect(exercice.amcType).toBe('AMCNum')
    expect(exercice.autoCorrectionAMC?.[0]?.reponse?.valeur).toBe(125)
  })

  it('repart de la déclaration de l’exercice à chaque graine', () => {
    // le verdict précédent, laissé en place, ferait relire à l'élève suivant
    // les réponses du précédent
    let valeur = '125'
    const exercice = exerciceFactice({
      nouvelleVersionWrapper: vi.fn(function (this: Record<string, unknown>) {
        this.listeQuestions = ['Une addition']
        this.listeCorrections = [valeur]
        this.autoCorrection = [
          {
            formatInteractif: 'fill-in-the-blank',
            valeur: { champ1: { value: valeur } },
          },
        ]
      }),
    })
    preparerExercice(exercice, 'eleve-01')
    valeur = '76'
    preparerExercice(exercice, 'eleve-02')
    expect(exercice.autoCorrectionAMC?.[0]?.reponse?.valeur).toBe(76)
  })

  it('n’emporte pas toute l’évaluation quand l’inférence échoue', () => {
    // un exercice mal formé doit sortir du document, pas le faire disparaître
    const exercice = exerciceFactice({
      nouvelleVersionWrapper: vi.fn(function (this: Record<string, unknown>) {
        this.listeQuestions = ['Q1']
        this.listeCorrections = undefined
        this.autoCorrection = [{}]
      }),
    })
    expect(() => preparerExercice(exercice)).not.toThrow()
  })
})
