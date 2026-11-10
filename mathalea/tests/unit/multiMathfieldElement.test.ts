import type { MathfieldElement } from 'mathlive'
import { beforeEach, describe, expect, it, vi } from 'vitest'
// Comme les tests du solveur et des réponses multilignes, tester le contrat
// des champs sans monter le moteur visuel MathLive, non pris en charge par jsdom.
vi.mock('mathlive', () => {
  class MockMathfieldElement extends HTMLElement {
    value = ''
    readOnly = false

    getValue() {
      return this.value
    }

    setValue(value: string) {
      this.value = value
    }
  }
  if (customElements.get('math-field') == null)
    customElements.define('math-field', MockMathfieldElement)
  return {
    MathfieldElement: MockMathfieldElement,
    renderMathInElement: vi.fn(),
  }
})

import Exercice from '../../src/exercices/Exercice'
import Thales from '../../src/exercices/3e/3G20'
import { mathaleaWriteStudentPreviousAnswers } from '../../src/lib/mathaleaUtils'
import { htmlToTypst } from '../../src/components/setup/typst/latexToTypst'
import { MultiMathfieldElement } from '../../src/lib/customElements/MultiMathfield'
import { createList } from '../../src/lib/format/lists'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { toutPourUnPoint } from '../../src/lib/interactif/fonctionsBaremes'
import { setOutputHtml, setOutputLatex } from '../../src/modules/context'

describe('MultiMathfieldElement', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('masque une suite de phrase selon le choix, y compris après restauration', () => {
    document.body.innerHTML = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate:
        '%{field0}<span data-show-when="field0:oui">, d’équation %{field1}</span>.',
      dataOptions: {
        field0: {
          choices: [
            { label: 'Choisir', value: '' },
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ],
        },
        field1: {
          choices: [
            { label: 'Choisir', value: '' },
            { label: 'y=3', value: 'y=3' },
          ],
        },
      },
    })
    const multi = document.querySelector(
      'multi-mathfield',
    ) as MultiMathfieldElement
    const section = multi.shadowRoot?.querySelector(
      '[data-show-when]',
    ) as HTMLElement
    expect(section.hidden).toBe(true)
    multi.value = { field0: 'oui', field1: 'y=3' }
    expect(section.hidden).toBe(false)
    multi.value = { field0: 'non' }
    expect(section.hidden).toBe(true)
    multi.value = { field0: 'oui' }
    expect(section.hidden).toBe(false)
  })

  it('ignore les champs masqués mais vérifie le choix avec un maximum fixe', () => {
    const exercice = new Exercice()
    exercice.numeroExercice = 0
    handleAnswers(
      exercice,
      0,
      {
        bareme: toutPourUnPoint,
        field0: { value: 'non' },
        field1: { value: 'y=3', options: { egaliteExpression: true } },
      },
      { formatInteractif: 'multi-mathfield' },
    )
    document.body.innerHTML = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate:
        '%{field0}<span data-show-when="field0:oui">, d’équation %{field1}</span>.',
      dataOptions: {
        field0: {
          choices: [
            { label: 'Choisir', value: '' },
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ],
        },
        field1: {
          choices: [
            { label: 'Choisir', value: '' },
            { label: 'y=3', value: 'y=3' },
          ],
        },
      },
    })
    const multi = document.querySelector(
      'multi-mathfield',
    ) as MultiMathfieldElement
    multi.value = { field0: 'non' }
    const result = MultiMathfieldElement.verifQuestion(exercice, 0)
    expect(result.isOk).toBe(true)
    expect(result.score).toEqual({ nbBonnesReponses: 1, nbReponses: 1 })
    multi.value = { field0: 'oui', field1: 'y=3' }
    const incorrectChoice = MultiMathfieldElement.verifQuestion(exercice, 0)
    expect(incorrectChoice.isOk).toBe(false)
    expect(incorrectChoice.score).toEqual({
      nbBonnesReponses: 0,
      nbReponses: 1,
    })
  })

  it('hydrate exercice.answers avec la value de l element apres verification', () => {
    const exercice = new Exercice()
    exercice.numeroExercice = 2
    handleAnswers(
      exercice,
      0,
      { champ1: { value: '3' }, champ2: { value: 'x+1' } },
      { formatInteractif: 'multi-mathfield' },
    )
    exercice.answers = undefined

    const multi = document.createElement('div')
    multi.id = 'multi-mathfieldEx2Q0'
    multi.setAttribute('data-template', 'a) %{champ1} b) %{champ2}')
    const shadowRoot = multi.attachShadow({ mode: 'open' })

    for (const [field, value] of Object.entries({
      champ1: '3',
      champ2: 'x+1',
    })) {
      const mathfield = document.createElement(
        'div',
      ) as unknown as MathfieldElement
      mathfield.id = `multi-mathfieldEx2Q0-${field}`
      mathfield.setAttribute('data-name', field)
      mathfield.getValue = () => value
      mathfield.readOnly = false
      shadowRoot.appendChild(mathfield)

      const checkSpan = document.createElement('span')
      checkSpan.id = `check-multi-mathfieldEx2Q0-${field}`
      shadowRoot.appendChild(checkSpan)
    }
    document.body.appendChild(multi)
    const resultSpan = document.createElement('span')
    resultSpan.id = 'resultatCheckEx2Q0'
    document.body.appendChild(resultSpan)

    const result = MultiMathfieldElement.verifQuestion(exercice, 0)

    expect(result.isOk).toBe(true)
    expect(exercice.answers).toEqual({
      'multi-mathfieldEx2Q0': '{"champ1":"3","champ2":"x+1"}',
    })
  })

  it('rehydrate mathfields et listes deroulantes depuis sa value', () => {
    const source = new MultiMathfieldElement()
    const sourceMathfield = document.createElement(
      'math-field',
    ) as MathfieldElement
    sourceMathfield.setAttribute('data-name', 'champ1')
    sourceMathfield.value = '42'
    source.shadowRoot?.appendChild(sourceMathfield)

    const sourceList = document.createElement(
      'liste-deroulante',
    ) as HTMLElement & {
      choices: Array<{ label: string; value: string }>
      value: string
    }
    sourceList.setAttribute('data-name', 'choix')
    sourceList.choices = [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
    ]
    sourceList.value = 'B'
    source.shadowRoot?.appendChild(sourceList)

    const savedValue = source.value

    const target = new MultiMathfieldElement()
    const targetMathfield = document.createElement(
      'math-field',
    ) as MathfieldElement
    targetMathfield.setAttribute('data-name', 'champ1')
    targetMathfield.value = ''
    target.shadowRoot?.appendChild(targetMathfield)

    const targetList = document.createElement(
      'liste-deroulante',
    ) as HTMLElement & {
      choices: Array<{ label: string; value: string }>
      value: string
    }
    targetList.setAttribute('data-name', 'choix')
    targetList.choices = [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
    ]
    targetList.value = ''
    target.shadowRoot?.appendChild(targetList)

    target.value = savedValue

    expect(savedValue).toBe('{"champ1":"42","choix":"B"}')
    expect(target.getValue()).toEqual({ champ1: '42', choix: 'B' })
  })

  it('regroupe chaque bouton QCM avec sa proposition et utilise la couleur Mathalea', () => {
    const multi = document.createElement(
      'multi-mathfield',
    ) as MultiMathfieldElement
    multi.setAttribute('id', 'multi-mathfieldEx0Q0')
    multi.setAttribute('interactivity-on', 'true')
    multi.setAttribute('data-template', '%{champ1}')
    multi.setAttribute(
      'data-options',
      encodeURIComponent(
        JSON.stringify({
          champ1: {
            qcm: [
              { label: 'Oui', value: 'oui' },
              { label: 'Non', value: 'non' },
            ],
          },
        }),
      ),
    )
    document.body.appendChild(multi)

    const qcm = multi.shadowRoot?.querySelector('[data-type="qcm"]')
    const items = Array.from(qcm?.children ?? [])
    const styles = multi.shadowRoot?.querySelector('style')?.textContent ?? ''

    expect(qcm?.getAttribute('data-vertical')).toBe('false')
    expect(items).toHaveLength(2)
    expect(items[0].querySelector('input + label')?.textContent).toBe('Oui')
    expect(items[1].querySelector('input + label')?.textContent).toBe('Non')
    expect(styles).toContain("[data-type='qcm'] > span")
    expect(styles).toContain('display: inline-flex')
    expect(styles).toContain('gap: 0.5rem')
    expect(styles).toContain('var(--color-coopmaths-action, #f15929)')
  })

  it("garde les réponses saisies quand l'interactivité est coupée après coup", () => {
    document.body.innerHTML = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate: 'Léa a %{champ1} billes et Tom a %{champ2} billes.',
      dataOptions: { champ1: {}, champ2: {} },
    })
    const multi = document.querySelector(
      'multi-mathfield',
    ) as MultiMathfieldElement
    const champs = () =>
      [
        ...multi.shadowRoot!.querySelectorAll('math-field'),
      ] as MathfieldElement[]
    const [premier, second] = champs()
    multi.setAnswers({ champ1: '52', champ2: '42' })
    multi.interactivityOn = false
    expect(champs()).toEqual([premier, second])
    expect(premier.value).toBe('52')
    expect(second.value).toBe('42')
    expect(premier.readOnly).toBe(true)
    expect(second.readOnly).toBe(true)
  })

  it('rend un contenu statique en sortie LaTeX', () => {
    setOutputLatex()

    const result = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate:
        'a) Calculer $g(1)=$%{champ1}<br>b) Calculer $g(2)=$%{champ2}',
      dataOptions: {},
    })

    expect(result).not.toContain('<multi-mathfield')
    expect(result).toContain('Calculer $g(1)=$')
    expect(result).toContain('Calculer $g(2)=$')
  })

  it('met en forme tous les items a) b) c) d un gabarit interactif multi-lignes', () => {
    document.body.innerHTML = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate:
        'a) Premier %{champ1}\nb) Deuxième %{champ2}\nc) Troisième %{champ3}',
      dataOptions: {
        champ1: { qcm: ['Oui', 'Non'] },
        champ2: { qcm: ['Oui', 'Non'] },
        champ3: { qcm: ['Oui', 'Non'] },
      },
    })
    const multi = document.querySelector(
      'multi-mathfield',
    ) as MultiMathfieldElement

    const items = Array.from(
      multi.shadowRoot?.querySelectorAll('span[style*="font-weight:bold"]') ??
        [],
    ).map((item) => item.textContent)
    expect(items).toEqual(['a)', 'b)', 'c)'])
  })

  it('n ajoute pas le texteApres apres un champ vide en rendu statique', () => {
    const rendu = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate: 'Quel sera le capital au bout de 3 ans ? %{champ1}',
      dataOptions: {
        champ1: { texteApres: ' euros' },
      },
      interactivityOn: false,
    })

    expect(rendu).not.toContain('<multi-mathfield')
    expect(rendu).not.toContain('euros')
  })

  it('espace et colore les QCM du rendu HTML statique', () => {
    const rendu = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate: 'Choisir : %{champ1}',
      dataOptions: {
        champ1: {
          qcm: [
            { label: 'Oui', value: 'oui' },
            { label: 'Non', value: 'non' },
          ],
        },
      },
      interactivityOn: false,
    })

    const template = document.createElement('template')
    template.innerHTML = rendu
    const qcm = template.content.querySelector('span.mx-2') as HTMLElement
    const items = Array.from(qcm.children) as HTMLElement[]
    const input = items[0].querySelector('input') as HTMLInputElement

    expect(qcm.style.display).toBe('inline-flex')
    expect(qcm.style.gap).toBe('1.5rem')
    expect(items).toHaveLength(2)
    expect(items[0].style.display).toBe('inline-flex')
    expect(items[0].style.gap).toBe('0.5rem')
    expect(input.style.border).toContain(
      'var(--color-coopmaths-action, #f15929)',
    )
    expect(rendu).not.toContain('currentColor')
  })

  it('ajoute le texteApres apres les pointilles en rendu statique', () => {
    const rendu = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate: 'Quel sera le capital au bout de 3 ans ? %{champ1}',
      dataOptions: {
        champ1: { ldots: true, texteApres: ' euros' },
      },
      interactivityOn: false,
    })

    expect(rendu).toContain('...')
    expect(rendu).toContain('euros')
  })

  it('rend des pointilles au lieu des champs quand l interactivite est desactivee', () => {
    const rendu = MultiMathfieldElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      dataTemplate: '$g(1)=$%{champ1}',
      dataOptions: {
        champ1: { ldots: true },
      },
      interactivityOn: false,
    })

    expect(rendu).not.toContain('<multi-mathfield')
    expect(rendu).toContain('...')

    const multi = document.createElement(
      'multi-mathfield',
    ) as MultiMathfieldElement
    multi.setAttribute('id', 'multi-mathfieldEx0Q0')
    multi.setAttribute('numero-exercice', '0')
    multi.setAttribute('question-index', '0')
    multi.setAttribute('interactivity-on', 'false')
    multi.setAttribute('data-template', '$g(1)=$%{champ1}')
    multi.setAttribute(
      'data-options',
      encodeURIComponent(JSON.stringify({ champ1: { ldots: true } })),
    )
    document.body.appendChild(multi)

    expect(multi.shadowRoot?.querySelector('math-field')).toBeNull()
    expect(multi.shadowRoot?.textContent).toContain('...')
  })

  it("ne convertit pas en <br> les retours à la ligne purement decoratifs d'une liste createList (3F10, deux exercices Typst en erreur)", () => {
    // `createList` indente son HTML avec de vrais \n entre ses balises,
    // uniquement pour la lisibilité de la source générée : un navigateur les
    // ignore. `renderStaticTemplate` ne doit donc pas les changer en <br>,
    // sous peine d'en glisser un juste après `<ol class='alpha'>`, ce qui
    // casse le `#tasks(...)` généré par htmlToTypst pour cette liste.
    const dataTemplate = createList({
      items: [
        'Quel nombre $-19$ a-t-il comme image ?',
        'Quelle est l’image de $8$ ?',
      ],
      style: 'alpha',
    })

    const rendered = MultiMathfieldElement.renderStaticTemplate(
      dataTemplate,
      {},
    )

    expect(rendered).not.toContain('<br>')

    const typst = htmlToTypst(rendered)
    expect(typst).toBe(
      '#tasks(columns: 1, label: "a)")[\n' +
        '+ Quel nombre $-19$ a-t-il comme image ?\n' +
        '+ Quelle est l’image de $8$ ?]',
    )
  })

  it('conserve la liste alpha et ses champs dans le rendu interactif de 3F10', () => {
    const multi = document.createElement(
      'multi-mathfield',
    ) as MultiMathfieldElement
    multi.id = 'multi-mathfieldEx0Q0'
    multi.setAttribute('interactivity-on', 'true')
    multi.setAttribute(
      'data-template',
      createList({
        items: [
          'Quelle est l’image de $2$ ? %{champ1}',
          'Quelle est l’image de $3$ ? %{champ2}',
          'Compléter $f(4)=$ %{champ3}',
        ],
        style: 'alpha',
        classOptions: 'alpha-parenthesis',
      }),
    )
    multi.setAttribute(
      'data-options',
      encodeURIComponent(
        JSON.stringify({
          champ1: { qcm: ['Oui', 'Non'] },
          champ2: { qcm: ['Oui', 'Non'] },
          champ3: { qcm: ['Oui', 'Non'] },
        }),
      ),
    )
    document.body.appendChild(multi)

    const list = multi.shadowRoot?.querySelector('ol.alpha')
    expect(list?.children).toHaveLength(3)
    expect(
      Array.from(list?.children ?? []).every((item) => item.tagName === 'LI'),
    ).toBe(true)
    expect(list?.querySelectorAll('[data-type="qcm"]')).toHaveLength(3)
    expect(multi.shadowRoot?.querySelectorAll('ol')).toHaveLength(1)
    expect(multi.shadowRoot?.querySelectorAll('br')).toHaveLength(0)
    expect(multi.shadowRoot?.querySelector('style')?.textContent).toContain(
      'list-style-type: lower-alpha',
    )
    expect(multi.shadowRoot?.querySelector('style')?.textContent).toContain(
      'padding-left: 0',
    )
    expect(multi.shadowRoot?.querySelector('style')?.textContent).toContain(
      'ol.alpha > li::marker',
    )
    expect(multi.shadowRoot?.querySelector('style')?.textContent).toContain(
      'font-weight: bold',
    )
    expect(multi.shadowRoot?.querySelector('style')?.textContent).toContain(
      "content: counter(list-item, lower-alpha) ') '",
    )
  })
})

describe('relecture des anciennes copies de Thalès', () => {
  beforeEach(() => {
    window.notify = vi.fn()
    setOutputHtml()
    document.body.innerHTML = ''
  })

  function generateThales() {
    const exercice = new Thales()
    exercice.numeroExercice = 6
    exercice.interactif = true
    exercice.nbQuestions = 2
    exercice.sup = 3
    exercice.sup2 = 1
    exercice.seed = 'IrjO'
    exercice.nouvelleVersionWrapper(6)
    // Seuls les champs sont nécessaires : aucun moteur graphique dans jsdom.
    const template = document.createElement('template')
    template.innerHTML = exercice.listeQuestions.join('')
    document.body.innerHTML = Array.from(
      template.content.querySelectorAll('multi-mathfield'),
    )
      .map((element) => element.outerHTML)
      .join('')
    expect(document.querySelectorAll('multi-mathfield')).toHaveLength(2)
    return exercice
  }

  it('restaure les quatre anciens champs dans les deux questions et recalcule 4/4', async () => {
    const exercice = generateThales()
    const expected = exercice.autoCorrection.map((question) => ({
      field0: `${parseFloat(String(question.valeur!.field0.value).replace(',', '.'))}\\operatorname{cm}`,
      field1: `${parseFloat(String(question.valeur!.field1.value).replace(',', '.'))}\\operatorname{cm}`,
    }))
    const restored = await Promise.all(
      mathaleaWriteStudentPreviousAnswers({
        Ex6Q0: expected[0].field0,
        Ex6Q1: expected[0].field1,
        Ex6Q2: expected[1].field0,
        Ex6Q3: expected[1].field1,
      }),
    )
    expect(restored).toEqual([true, true, true, true])
    const hosts =
      document.querySelectorAll<MultiMathfieldElement>('multi-mathfield')
    expect(hosts[0].getValue()).toEqual(expected[0])
    expect(hosts[1].getValue()).toEqual(expected[1])
    for (let i = 0; i < 2; i++) {
      expect(MultiMathfieldElement.verifQuestion(exercice, i).score).toEqual({
        nbBonnesReponses: 2,
        nbReponses: 2,
      })
    }
  }, 5000)

  it('conserve la relecture des copies au format actuel', async () => {
    generateThales()
    await Promise.all(
      mathaleaWriteStudentPreviousAnswers({
        'multi-mathfieldEx6Q0': JSON.stringify({ field0: '7,2', field1: '5' }),
      }),
    )
    expect(
      document
        .querySelector<MultiMathfieldElement>('multi-mathfield')
        ?.getValue(),
    ).toEqual({ field0: '7,2', field1: '5' })
  }, 5000)

  it('termine le chargement si seul un conteneur porte un ancien identifiant', async () => {
    document.body.innerHTML = '<div id="feedbackEx6Q0"></div>'
    expect(
      await Promise.all(mathaleaWriteStudentPreviousAnswers({ Ex6Q0: '12' })),
    ).toEqual([false])
  }, 5000)
})
