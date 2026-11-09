// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { seq } from './combinators'
import { sameTopLevelOperation } from './sameTopLevelOperation'

const compare = seq([sameTopLevelOperation()])
const accepted = (saisie: string, answer: string) =>
  expect(compare(saisie, answer).isOk, `${saisie} pour ${answer}`).toBe(true)
const refused = (saisie: string, answer: string, feedback?: string) => {
  const result = compare(saisie, answer)
  expect(result.isOk, `${saisie} pour ${answer}`).toBe(false)
  if (feedback != null) expect(result.feedback).toContain(feedback)
}

describe('sameTopLevelOperation', () => {
  it('accepte une autre écriture de la même addition', () => {
    accepted('1+7', '3+5')
    accepted('2+5+1', '3+5')
    accepted('2+3\\times2', '5+3')
  })

  it('refuse le résultat seul ou une autre opération', () => {
    refused('8', '3+5', 'un calcul est attendu')
    refused('12-4', '3+5', 'une somme')
    refused('4\\times2', '3+5', 'une somme')
  })

  it('accepte la soustraction et la refuse quand une somme est attendue', () => {
    accepted('7-5', '7-3')
    refused('3+4', '7-3', 'une différence')
  })

  it('distingue le produit du quotient', () => {
    accepted('3\\times4', '6\\times2')
    accepted('24\\times0.5', '6\\times2')
    refused('12\\div4', '6\\times2', 'une multiplication')
    accepted('12\\div4', '6\\div2')
    refused('12\\times\\frac{1}{4}', '6\\div2', 'une division')
  })

  it('accepte une expression de quotient écrite sous forme de fraction', () => {
    accepted('\\dfrac{3}{4}', '\\dfrac{6}{8}')
  })

  it('traite 3\\times(a+b)\\div c comme un produit, sans son résultat', () => {
    accepted('3\\times(4+5)\\div 2', '3\\times(4+5)\\div 2')
    accepted('3\\times\\dfrac{4+5}{2}', '3\\times(4+5)\\div 2')
    refused('3', '3\\times(4+5)\\div 2', 'un calcul est attendu')
  })

  it('refuse une somme par 0 et une multiplication par 1', () => {
    refused('3+5+0', '3+5', 'somme par 0')
    refused('3\\times5\\times1', '3\\times5', 'multiplication par 1')
    accepted(
      '\\left((12-9)\\div 3\\right)\\times 2\\times(10+3)',
      '\\left((12-9)\\div 3\\right)\\times 2\\times(10+3)',
    )
  })

  it("ne contraint rien quand la réponse attendue n'est pas une opération", () => {
    accepted('12', '12')
    accepted('7', '12')
  })
})
