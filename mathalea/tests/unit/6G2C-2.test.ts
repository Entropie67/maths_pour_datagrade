import { afterEach, describe, expect, it } from 'vitest'
import ReporterPerimetreAuCompas, {
  verifierReportPerimetreAuCompas,
} from '../../src/exercices/6e/6G2C-2'
import AncienReporterPerimetreAuCompas from '../../src/exercices/6e/6G2C-2-old'
import {
  ElementIepEditeur,
  type InstructionIep,
} from '../../src/lib/customElements/ElementIepEditeur'
import { context } from '../../src/modules/context'

const contexteHtmlInitial = context.isHtml
afterEach(() => {
  context.isHtml = contexteHtmlInitial
})

function creerExercice(type: string) {
  context.isHtml = true
  const exercice = new ReporterPerimetreAuCompas()
  exercice.sup = type
  exercice.interactif = true
  exercice.nouvelleVersion()
  const container = document.createElement('div')
  container.innerHTML = exercice.listeQuestions[0]
  const editor = container.querySelector(
    'alea-iep-editeur',
  ) as ElementIepEditeur
  const initial = JSON.parse(
    editor.getAttribute('conditions-initiales')!,
  ) as InstructionIep[]
  const attendu = JSON.parse(
    exercice.autoCorrection[0].valeur!.reponse.value as string,
  ) as InstructionIep[]
  const verifier = (programme: InstructionIep[]) =>
    verifierReportPerimetreAuCompas({
      exercice,
      questionIndex: 0,
      editor,
      studentProgram: [...initial, ...programme],
      expectedRaw: JSON.stringify(attendu),
    })
  return { exercice, editor, initial, attendu, verifier }
}

describe('6G2C-2 report de périmètre', () => {
  it('ne propose pas l’éditeur en mode non interactif', () => {
    context.isHtml = true
    const exercice = new ReporterPerimetreAuCompas()
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions[0]).not.toContain('alea-iep-editeur')
    expect(exercice.listeQuestions[0]).toContain('<svg')
  })

  it.each(['1', '2', '3', '4', '5'])(
    'attribue quatre points pour la figure %s',
    (type) => {
      const { exercice, attendu, verifier } = creerExercice(type)
      expect(ElementIepEditeur.pointsMaxQuestion(exercice, 0)).toBe(4)
      expect(verifier(attendu)).toMatchObject({
        isOk: true,
        score: { nbBonnesReponses: 4, nbReponses: 4 },
      })
      expect(verifier([])).toMatchObject({
        isOk: false,
        score: { nbBonnesReponses: 0, nbReponses: 4 },
      })
      expect(verifier(attendu.slice(0, -1))).toMatchObject({
        isOk: false,
        score: { nbBonnesReponses: 1, nbReponses: 4 },
      })
      const rouge = attendu.map((instruction) =>
        instruction.type === 'segment'
          ? { ...instruction, couleur: 'red' }
          : instruction,
      )
      expect(verifier(rouge)).toMatchObject({
        isOk: false,
        score: { nbBonnesReponses: 3, nbReponses: 4 },
      })
    },
  )

  it('valorise un segment incomplet et refuse un segment de longueur nulle', () => {
    const { attendu, verifier } = creerExercice('3')
    const debut = attendu.slice(0, 2)
    const premierPoint = attendu[1]
    if (premierPoint.type !== 'intersection')
      throw new Error('Intersection attendue.')
    expect(
      verifier([
        ...debut,
        { type: 'segment', p1: 'A', p2: premierPoint.nom, couleur: 'blue' },
      ]).score,
    ).toEqual({ nbBonnesReponses: 1, nbReponses: 4 })
    expect(
      verifier([{ type: 'segment', p1: 'A', p2: 'A', couleur: 'blue' }]).score,
    ).toEqual({ nbBonnesReponses: 0, nbReponses: 4 })
  })

  it('propose une liste pondérable initialisée et masque les indications inutiles', () => {
    const { exercice, editor } = creerExercice('1-1-3')
    expect(new ReporterPerimetreAuCompas().sup).toBe('6')
    expect(exercice.besoinFormulaireTexte?.[0]).toBe('Type de figure')
    expect(editor.getAttribute('masquer-etapes-initiales')).toBe('true')
    expect(editor.getAttribute('sans-outils')).toBe('true')
    expect(editor.getAttribute('direction-report-compas')).toBe('0.5')
  })

  it('ajoute un report sans angle et propose des intersections sans étapes initiales', () => {
    const { editor } = creerExercice('3')
    editor.connectedCallback()
    expect(editor.querySelector('[data-cle="angle"]')).toBeNull()
    const centre = editor.querySelector<HTMLSelectElement>('[data-cle="p3"]')!
    centre.value = 'A'
    const ajouter = [...editor.querySelectorAll('button')].find(
      (button) => button.innerText === 'Ajouter',
    )!
    ajouter.click()
    expect(editor.getProgramme().at(-1)).toMatchObject({
      type: 'reporterLongueurCompas',
      p3: 'A',
      angle: 0.5,
    })
    const type = [...editor.querySelectorAll('select')].find((select) =>
      [...select.options].some((option) => option.value === 'intersection'),
    )!
    type.value = 'intersection'
    type.dispatchEvent(new Event('change'))
    const supports = [
      ...editor.querySelectorAll<HTMLSelectElement>(
        '[data-cle="etape1"] option',
      ),
    ].map((option) => option.innerText)
    expect(supports.some((label) => label.includes('initiale'))).toBe(false)
    expect(
      supports.some((label) => label.includes('demi-droite d’origine A')),
    ).toBe(true)
    const descriptions = [...editor.querySelectorAll('li span')]
      .map((element) => (element as HTMLElement).innerText)
      .join(' ')
    expect(descriptions).toContain('Reporter la longueur')
    expect(descriptions).not.toContain('dans la direction')
  })

  it('conserve le barème et le vérificateur distincts de l’archive', () => {
    const ancien = new AncienReporterPerimetreAuCompas()
    ancien.sup = 3
    ancien.nouvelleVersion()
    expect(ElementIepEditeur.pointsMaxQuestion(ancien, 0)).toBe(1)
    expect(ancien.listeQuestions[0]).toContain(
      'verification-finale-reporter-perimetre-au-compas"',
    )
    expect(creerExercice('3').exercice.listeQuestions[0]).toContain(
      'verification-finale-reporter-perimetre-au-compas-v2"',
    )
  })
})
