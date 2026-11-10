import { describe, expect, it } from 'vitest'
import { joinStudentAnswers } from './canSolutions'

describe('joinStudentAnswers', () => {
  it('réunit les réponses des champs d’une question', () => {
    expect(joinStudentAnswers(['4', '17', '8'])).toBe('4 ; 17 ; 8')
  })

  it('garde visible un champ laissé vide', () => {
    expect(joinStudentAnswers(['4', '', '8'])).toBe('4 ; … ; 8')
  })

  it('reste vide sans aucune réponse pour afficher « aucune »', () => {
    expect(joinStudentAnswers(['', '', ''])).toBe('')
  })
})
