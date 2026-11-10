import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'

export const titre = 'Compléter un bloc personnalisé avec Scratch'
export const dateDePublication = '23/12/2025'
export const interactifReady = true

/**
 * @author Jean-claude Lhote
 */

export const uuid = '33c9b'

export const refs = {
  'fr-fr': ['3AutoI01'],
  'fr-ch': [],
}

const scratchSimulatorButtonAction = '3AutoI01:scratch-simulator-button'

export default class BlocPersonnaliseScratch extends Exercice {
  constructor() {
    super()

    registerScratchSimulatorButton()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const myPolyName = (n: number) => {
      switch (n) {
        case 3:
          return 'triangle équilatéral'

        case 6:
          return 'hexagone régulier'
        case 8:
          return 'octogone régulier'
        case 4:
        default:
          return 'carré'
      }
    }

    const blocACompléter = (figure: {
      nom: string
      nbCotes: number
      longueurCote: number
      angle: number
    }) => {
      return `\\begin{scratch}[num blocks]\n
\\initmoreblocks{définir \\namemoreblocks{${figure.nom}}}
\\blockpen{stylo en position d'écriture}
\\blockrepeat{répéter \\ovalnum{ } fois}
{
\\blockmove{avancer de \\ovalnum{${longueurCote}} pas}
\\blockmove{tourner \\turnright{} de \\ovalnum{ } degrés}
}
\\end{scratch}`
    }
    const blockCompleted = (figure: {
      nom: string
      nbCotes: number
      longueurCote: number
      angle: number
    }) => {
      return `\\begin{scratch}[num blocks]\n
\\initmoreblocks{définir \\namemoreblocks{${figure.nom}}}
\\blockpen{stylo en position d'écriture}
\\blockrepeat{répéter \\ovalnum{${figure.nbCotes}} fois}
{
\\blockmove{avancer de \\ovalnum{${longueurCote}} pas}
\\blockmove{tourner \\turnright{} de \\ovalnum{${figure.angle}} degrés}
}

\\blockevent{quand \\greenflag est cliqué}
\\blockmoreblocks{${figure.nom}}
\\end{scratch}`
    }

    const nbCotes = this.sup ? 4 : choice([3, 4, 6, 8])
    const nom = myPolyName(nbCotes)
    const longueurCote = this.sup ? 50 : choice([30, 40, 50, 60, 70])
    const codeScratch = blocACompléter({
      nom,
      nbCotes,
      longueurCote,
      angle: 360 / nbCotes,
    })
    let codeScratch3 = String(scratchblock(codeScratch, 'block', true))
    if (context.isHtml) {
      let ligne = 1
      const lignes = codeScratch3.split('\n')
      codeScratch3 = lignes
        .map((l, i) => {
          if (
            ['définir', 'stylo', 'répéter', 'avancer', 'tourner'].some((mot) =>
              l.includes(mot),
            )
          ) {
            l += `// ${ligne++}`
          }
          return l
        })
        .join('\n')
    }
    this.listeQuestions[0] =
      deuxColonnesResp(
        `Une élève souhaite réaliser un programme avec un logiciel de
programmation pour dessiner un ${nom}.<br>
Par quelles valeurs doit-il compléter les lignes $3$ et $5$ du bloc personnalisé ci-contre
pour obtenir un ${nom} ?`,
        codeScratch3,
        {
          largeur1: 50,
          widthmincol1: '100px',
          widthmincol2: '100px',
        },
      ) +
      `<br><br>` +
      ajouteQuestionMathlive({
        exercice: this,
        question: 0,
        objetReponse: {
          champ1: { value: String(nbCotes) },
          champ2: { value: String(360 / nbCotes) },
        },
        typeInteractivite: 'fillInTheBlank',
        reponseParams: { formatInteractif: 'fill-in-the-blank' },
        content:
          '\\text{Ligne 3 : }%{champ1}\\quad \\text{Ligne 5 : }%{champ2}',
      })
    this.listeCorrections[0] = `Pour obtenir un ${nom}, il faut répéter $${miseEnEvidence(nbCotes.toString())}$ fois et tourner de $\\dfrac{360}{${nbCotes}}=${miseEnEvidence(texNombre(360 / nbCotes, 0))}$ degrés.
    ${
      context.isHtml
        ? '<br>' +
          DomReadyActionElement.create({
            action: scratchSimulatorButtonAction,
            payload: {
              codeScratch: blockCompleted({
                nom,
                nbCotes,
                longueurCote,
                angle: 360 / nbCotes,
              }),
              delai: 500,
              insertProgramme: false,
            },
          })
        : blockCompleted({
            nom,
            nbCotes,
            longueurCote,
            angle: 360 / nbCotes,
          })
    }`
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
