import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'

export const titre = 'Compléter un bloc personnalisé avec Scratch'
export const dateDePublication = '25/12/2025'
export const interactifReady = true

/**
 * @author Jean-claude Lhote
 */

export const uuid = '33d9b'

export const refs = {
  'fr-fr': ['3AutoI01-2'],
  'fr-ch': [],
}

const scratchSimulatorButtonAction = '3AutoI01-2:scratch-simulator-button'

export default class BlocPersonnaliseScratch2 extends Exercice {
  constructor() {
    super()
    registerScratchSimulatorButton()
    this.typeExercice = 'Scratch'
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const x = this.sup ? 1 : randint(1, 7)
    const a = this.sup ? 8 : randint(1, 5, 4) * 2
    const b = this.sup ? 10 : randint(3, 10, 5) * 2
    const c = this.sup
      ? 2
      : Number.isInteger((x * a + b) / 4)
        ? choice([2, 4])
        : 2

    const blocACompléter = (a: number, b: number, c: number) => {
      return `\\begin{scratch}[blocks]\n
\\blockinit{quand \\greenflag est cliqué}
\\blocksensing{demander \\ovalnum{ Choisir un nombre } et attendre}
\\blockvariable{mettre  \\selectmenu{variable} à \\ovalsensing{réponse}}
\\blockvariable{mettre  \\selectmenu{resultat} à \\ovaloperator{\\ovalnum{${a}} * \\ovalvariable{variable}}}
\\blockvariable{mettre  \\selectmenu{resultat} à \\ovaloperator{\\ovalvariable{resultat} + \\ovalnum{${b}}}}
\\blockvariable{mettre  \\selectmenu{resultat} à \\ovaloperator{\\ovalvariable{resultat} / \\ovalnum{${c}}}}
\\blocklook{dire \\ovaloperator{regrouper \\ovalnum{J'obtiens comme résultat : } et \\ovalvariable{resultat}}}
\\end{scratch}`
    }
    const codeScratch = blocACompléter(a, b, c)
    const correctionCodeScratch = codeScratch
      .replace(
        '\\blocksensing{demander \\ovalnum{ Choisir un nombre } et attendre}\n',
        '',
      )
      .replace('\\ovalsensing{réponse}', `\\ovalnum{${x}}`)
    const codeScratch3 = String(scratchblock(codeScratch))

    const codeVariable = scratchblock(
      context.isHtml
        ? `\\begin{scratch}[blocks]
\\ovalvariable{variable}
\\end{scratch}`
        : `\\ovalvariable{variable}`,
      'inline',
    )
    const codeResultat = scratchblock(
      context.isHtml
        ? `\\begin{scratch}[blocks]
\\ovalvariable{resultat}
\\end{scratch}`
        : `\\ovalvariable{resultat}`,
      'inline',
    )

    this.listeQuestions[0] =
      `On considère l'algorithme suivant :<br><br>
${codeScratch3}<br>
        Qu'obtient-on si on choisit $${x}$ comme nombre de départ ?<br><br>` +
      ajouteQuestionMathlive({
        exercice: this,
        question: 0,
        reponseParams: { formatInteractif: 'mathalea-mathfield' },
        objetReponse: {
          reponse: { value: (x * a + b) / c },
        },
        typeInteractivite: 'mathlive',
      })
    this.listeCorrections[0] = `Si on choisit $${x}$ comme nombre de départ, alors ${codeVariable} prend la valeur $${x}$.<br>
   Ensuite, ${codeResultat} prend la valeur $${a} \\times ${x}=${a * x}$.<br>
   Puis, ${codeResultat} prend la valeur $${a * x} + ${b}=${a * x + b}$.<br>
   Enfin, ${codeResultat} prend la valeur $\\dfrac{${a * x + b}}{${c}}=${(x * a + b) / c}$.<br>
    On obtient donc comme résultat final : $${miseEnEvidence((x * a + b) / c)}$.<br>
    ${
      context.isHtml
        ? '<br>' +
          DomReadyActionElement.create({
            action: scratchSimulatorButtonAction,
            payload: {
              codeScratch: correctionCodeScratch,
              delai: 500,
              insertProgramme: false,
            },
          })
        : ''
    }
     `
  }
}

let scratchSimulatorButtonRegistered = false

function registerScratchSimulatorButton() {
  if (scratchSimulatorButtonRegistered) return
  scratchSimulatorButtonRegistered = true
  DomReadyActionElement.registerCallback<{
    codeScratch: string
    delai: number
    insertProgramme: boolean
  }>(scratchSimulatorButtonAction, ({ element, payload }) => {
    element.innerHTML = ''
    element.classList.add('my-4', 'block')
    const button = document.createElement('button')
    const simulatorContainer = document.createElement('div')
    button.type = 'button'
    button.textContent = 'Lancer le simulateur'
    button.className =
      'inline-flex items-center px-4 py-2 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas font-medium text-sm rounded shadow-md hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:outline-none transition duration-150 ease-in-out'

    const onClick = () => {
      simulatorContainer.innerHTML = createScratchSimulatorElement(
        payload.codeScratch,
        payload.delai,
        payload.insertProgramme,
      )
    }

    button.addEventListener('click', onClick)
    element.append(button, simulatorContainer)

    return () => {
      button.removeEventListener('click', onClick)
      element.innerHTML = ''
    }
  })
}
