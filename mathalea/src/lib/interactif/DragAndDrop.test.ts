import { afterEach, describe, expect, it } from 'vitest'
import ClasserFractionsDemiUn from '../../exercices/6e/6N3I-5'
import { context } from '../../modules/context'
import { verifDragAndDrop } from './DragAndDrop'

function prepareTable() {
  context.isHtml = true
  const exercice = new ClasserFractionsDemiUn()
  exercice.numeroExercice = 0
  exercice.interactif = true
  exercice.nouvelleVersion()
  document.body.innerHTML = exercice.listeQuestions[0]
  for (const label of document.querySelectorAll<HTMLElement>('.etiquette')) {
    Object.defineProperty(label, 'innerText', {
      value: label.textContent ?? '',
    })
  }
  return exercice
}

function place(id: number, colonne: number) {
  document
    .getElementById(`rectangleEx0Q0R${colonne}`)!
    .appendChild(document.getElementById(`etiquetteEx0Q0I${id}`)!)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Classement de fractions avec plusieurs étiquettes par colonne', () => {
  it('colore chaque étiquette et attribue les points des bonnes étiquettes même dans une colonne incomplète ou contenant une erreur', () => {
    const exercice = prepareTable()
    place(1, 1)
    place(3, 1) // Une bonne étiquette et une erreur dans la même colonne.
    place(5, 3) // Une colonne incomplète conserve le point de sa bonne étiquette.
    const result = verifDragAndDrop(exercice, 0)
    expect(result.score).toEqual({ nbBonnesReponses: 1, nbReponses: 5 })
    expect(
      document
        .getElementById('etiquetteEx0Q0I1')!
        .classList.contains('bg-green-100'),
    ).toBe(true)
    expect(
      document
        .getElementById('etiquetteEx0Q0I3')!
        .classList.contains('bg-red-100'),
    ).toBe(true)
    expect(
      document
        .getElementById('etiquetteEx0Q0I5')!
        .classList.contains('bg-green-100'),
    ).toBe(true)
    expect(
      document
        .getElementById('etiquetteEx0Q0I1')!
        .classList.contains('bg-gray-200'),
    ).toBe(false)
    expect(document.getElementById('feedbackEx0Q0')!.textContent).toBe('')
  })

  it('accepte les étiquettes en ordre inverse dans chaque colonne', () => {
    const exercice = prepareTable()
    for (let colonne = 1; colonne <= 5; colonne++) {
      place(2 * colonne, colonne)
      place(2 * colonne - 1, colonne)
    }
    expect(verifDragAndDrop(exercice, 0).score).toEqual({
      nbBonnesReponses: 5,
      nbReponses: 5,
    })
    expect(document.querySelectorAll('.etiquette.bg-green-100')).toHaveLength(
      10,
    )
  })

  it('arrondit le score proportionnel à l’entier inférieur', () => {
    const exercice = prepareTable()
    place(1, 1)
    place(2, 1)
    place(3, 2)
    expect(verifDragAndDrop(exercice, 0).score).toEqual({
      nbBonnesReponses: 1,
      nbReponses: 5,
    })
  })

  it('conserve un maximum de cinq points pour une réponse vide', () => {
    const exercice = prepareTable()
    expect(verifDragAndDrop(exercice, 0).score).toEqual({
      nbBonnesReponses: 0,
      nbReponses: 5,
    })
  })
})

describe('Correction du classement de fractions', () => {
  it('ne conserve que le tableau sans correction détaillée', () => {
    const exercice = new ClasserFractionsDemiUn()
    exercice.correctionDetaillee = false
    exercice.nouvelleVersion()
    const correction = document.createElement('div')
    correction.innerHTML = exercice.listeCorrections[0]
    expect(correction.children).toHaveLength(1)
    expect(correction.firstElementChild?.tagName).toBe('TABLE')
    expect(correction.querySelectorAll('td span')).toHaveLength(10)
    expect(exercice.listeReponsesCourtes[0]).toBe(exercice.listeCorrections[0])
  })

  it('justifie chaque colonne en correction détaillée', () => {
    const exercice = new ClasserFractionsDemiUn()
    exercice.correctionDetaillee = true
    exercice.nouvelleVersion()
    const texte = exercice.listeCorrections[0]
    expect(exercice.listeReponsesCourtes[0]).toBe(
      texte.slice(0, texte.indexOf('</table>') + '</table>'.length),
    )
    expect(texte).toContain('leur numérateur est inférieur à la moitié')
    expect(texte).toContain('leur numérateur est égal à la moitié')
    expect(texte).toContain('leur numérateur est supérieur à la moitié')
    expect(texte).toContain('leur numérateur est égal à leur dénominateur')
    expect(texte).toContain('leur numérateur est supérieur à leur dénominateur')
  })
})
