import { cleanup, render, waitFor } from '@testing-library/svelte'
import { afterEach, expect, it, vi } from 'vitest'
import ExercisePreview from '../../src/components/setup/parcours/ExercisePreview.svelte'

const { preparerExercice } = vi.hoisted(() => ({ preparerExercice: vi.fn() }))
vi.mock('../../src/moteur', () => ({
  initialiser: vi.fn(),
  afficher: vi.fn(),
  preparerExercice,
}))
afterEach(cleanup)

it.each([false, true])(
  'aperçu parcours : respecter listeAvecNumerotation=%s',
  async (numbered) => {
    preparerExercice.mockResolvedValue({
      questions: [
        { enonce: 'a) Première question.' },
        { enonce: 'b) Deuxième question.' },
      ],
      interne: { listeAvecNumerotation: numbered },
    })
    const { container } = render(ExercisePreview, {
      step: { uuid: 'ed0ea', id: '6N0B-1', titre: 'Traduire une expression' },
    })
    await waitFor(() =>
      expect(container.querySelectorAll('li')).toHaveLength(2),
    )
    expect(container.querySelector(numbered ? 'ol' : 'ul')).not.toBeNull()
    expect(container.querySelector(numbered ? 'ul' : 'ol')).toBeNull()
  },
)
