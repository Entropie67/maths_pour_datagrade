import { expect, it, vi } from 'vitest'
import Facture from '../../../../src/exercices/1e/1A-C15-4'
import * as arrayOutils from '../../../../src/lib/outils/arrayOutils'

it.each([false, true])('adapte toutes les consignes au mode QCM %s', (qcm) => {
  for (const variante of [0, 1, 2, 3]) {
    const exercice = new Facture()
    if (variante === 0) exercice.versionAleatoire = exercice.versionOriginale
    exercice.sup3 = qcm
    exercice.interactif = true
    const tirage = vi.spyOn(arrayOutils, 'choice')
    if (variante !== 0) tirage.mockReturnValueOnce(variante)
    try {
      exercice.nouvelleVersion()
      expect(exercice.listeQuestions).toHaveLength(1)
      const question = exercice.listeQuestions[0]
      if (qcm) {
        expect(question).toContain('Écrire le calcul permettant de déterminer')
        expect(question).not.toContain("qu'on ne demande pas d'effectuer")
        expect(question).not.toContain('$a =$')
        expect(question).not.toContain('On note $a$')
      } else {
        expect(question).toContain(variante < 2
          ? "On note $a$ le prix de l'abonnement annuel, en euros."
          : variante === 2
            ? 'On note $a$ le prix du mètre cube consommé, en euros.'
            : 'On note $a$ le nombre de mètres cubes consommés.')
        expect(question).toContain('Déterminer $a$')
        expect(question).toContain("sous forme d'un calcul qu'on ne demande pas d'effectuer.")
        expect(question).toContain('$a =$')
      }
    } finally {
      tirage.mockRestore()
    }
  }
})
