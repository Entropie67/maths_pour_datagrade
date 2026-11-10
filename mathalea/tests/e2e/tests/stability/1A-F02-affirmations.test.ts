import type { IExercice } from '../../../../src/lib/types'
import { expect, it } from 'vitest'
import { texteAffiche } from '../../helpers/empreinteExercice'

const modules = {
  ...import.meta.glob('../../../../src/exercices/1e/1A-F02-*.ts'),
  ...import.meta.glob('../../../../src/exercices/2e/2A-F2-5.ts'),
}
for (const [chemin, charger] of Object.entries(modules)) {
  if (chemin.includes('old')) continue
  it.each([false, true])(
    `${chemin} : formulation affirmative en interactif (QCM : %s)`,
    async (qcm) => {
      const module = (await charger()) as { default: new () => IExercice }
      const exercice = new module.default()
      exercice.interactif = true
      exercice.nbQuestions = 1
      exercice.numeroExercice = 0
      exercice.sup3 = qcm
      if (chemin.endsWith('/2A-F2-5.ts')) exercice.sup2 = qcm
      if (exercice.typeExercice === 'simple') exercice.versionQcm = qcm
      exercice.nouvelleVersion()
      const texte = texteAffiche(
        exercice.typeExercice === 'simple'
          ? (exercice.question ?? '')
          : exercice.listeQuestions[0],
      )
      expect(texte).not.toContain('?')
      expect(texte).not.toMatch(
        /\b(Calculer|Déterminer|déterminer|Quelle|Laquelle)\b/,
      )
    },
  )
}
