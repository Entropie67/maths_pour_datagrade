import { describe, expect, it } from 'vitest'
import RepresenterFonctionsAvecTableau from '../../src/exercices/3e/3F10-7'

describe('3F10-7', () => {
  it.each([1, 2, 3, 4, 5, 6, 7])(
    'génère le type de fonction %s avec le traceur de courbe',
    (type) => {
      const exercice = new RepresenterFonctionsAvecTableau()
      exercice.numeroExercice = 0
      exercice.nbQuestions = 1
      exercice.sup = String(type)
      exercice.interactif = true

      exercice.nouvelleVersion()

      expect(exercice.listeQuestions).toHaveLength(1)
      expect(exercice.listeQuestions[0]).toContain('<traceur-de-courbe')
      expect(exercice.listeQuestions[0]).toContain(
        'comprises entre $-5$ et $5$',
      )
      expect(exercice.listeQuestions[0]).toContain(
        'row-labels="[&quot;x&quot;,&quot;f(x)&quot;]"',
      )
      expect(exercice.listeQuestions[0]).toContain('resultatCheckEx0Q0')
      expect(exercice.listeQuestions[0]).toContain('feedbackEx0Q0')
      expect(exercice.listeCorrections[0]).toContain('show-expected="true"')
      expect(exercice.listeCorrections[0]).toContain(
        'animate-correction="true"',
      )
      expect(exercice.listeCorrections[0]).toContain('<mathalea-dom-ready')
      expect(exercice.autoCorrection[0]?.formatInteractif).toBe(
        'traceur-de-courbe',
      )
      expect(typeof exercice.autoCorrection[0]?.valeur?.reponse?.value).toBe(
        'function',
      )
    },
  )

  it('change la lettre de la fonction à chaque question', () => {
    const exercice = new RepresenterFonctionsAvecTableau()
    exercice.numeroExercice = 0
    exercice.nbQuestions = 3
    exercice.sup = '1-2-3'
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions[0]).toContain('$f(x)=')
    expect(exercice.listeQuestions[1]).toContain('$g(x)=')
    expect(exercice.listeQuestions[2]).toContain('$h(x)=')
  })
})
