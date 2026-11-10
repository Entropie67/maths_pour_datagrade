import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre =
  "Trouver la position d'un lutin grâce à des instructions conditionnelles (scratch)"
export const dateDePublication = '24/11/2020'
export const dateDeModifImportante = '02/01/2025'

/**
 * * Instructions conditionnelles
 * @author Erwan Duplessy
 * (rendu interactif par Éric Elter)(TS et sortie PDF par Olivier Mimeau)
 */
export const uuid = '8cbd6'

export const refs = {
  'fr-fr': ['3I1'],
  'fr-ch': [],
}

const scratchSimulatorButtonAction = '3I1:scratch-simulator-button'

export default class InstructionConditionnelle extends Exercice {
  constructor() {
    super()
    registerScratchSimulatorButton()
    this.besoinFormulaireNumerique = [
      'Variante',
      3,
      '1 : Sans condition imbriquée\n2 : Avec une condition imbriquée\n3 : Avec deux conditions imbriquées',
    ]
    this.sup = 1
    this.nbQuestions = 1
    this.consigne = 'Donner les coordonnées de la position finale du lutin.'

    // this.nbCols = 2
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    let txtintroscratch = ''
    txtintroscratch = `\\begin{scratch}[${context.issortieNB ? 'print,' : ''}fill blocks,scale=0.8]\n`
    txtintroscratch += '\\blockvariable{\\ovalvariable{var}}' // refuse d'afficher si '\\ovalvariable{var}' seul
    // txtintroscratch += '\\blockmoreblocks{\\ovalvariable{var}}'
    txtintroscratch += '\\end{scratch}'
    let texte =
      "La position initiale d'un lutin dans un repère est $(0~;~0)$.<br> Dans le programme, $x$ désigne l'abscisse et $y$ désigne l'ordonnée d'un lutin. <br>" // texte de l'énoncé
    texte += "Une variable a été créée, elle s'appelle"
    texte += scratchblock(txtintroscratch)
    texte += '. <br>'
    let texteCorr = ' ' // texte du corrigé
    let codeTikz = '' // code pour dessiner les blocs en tikz
    let xLutin = 0
    let yLutin = 0

    codeTikz += `\\begin{scratch}[${context.issortieNB ? 'print,' : ''}fill blocks,scale=0.8]\n` // \n est impératif pour l'affichage HTML

    const n1 = randint(1, 10)
    const n2 = randint(1, 10)
    const n3 = randint(1, 10)
    const n4 = randint(1, 10)
    const xLutin1 = randint(1, 10) * 10
    const xLutin2 = randint(1, 10) * 10
    const yLutin1 = randint(1, 10) * 10
    const yLutin2 = randint(1, 10) * 10

    codeTikz += '\\blockinit{quand \\greenflag est cliqué}\n' // \n est impératif pour l'affichage HTML
    codeTikz += '\\blockmove{aller à x: \\ovalnum{0} y: \\ovalnum{0}}\n'
    codeTikz += `\\blockvariable{mettre \\selectmenu{var} à \\ovalnum{${n1}}}\n`
    codeTikz += `\\blockifelse{si \\booloperator{\\ovalvariable{var} < \\ovalnum{${n2}}} alors}\n`
    codeTikz += `{\\blockmove{ajouter \\ovalnum{${xLutin1}} à x}\n`
    if (this.sup > 1) {
      codeTikz += `\\blockif{si \\booloperator{\\ovalvariable{var} > \\ovalnum{${n3}}} alors}\n`
      codeTikz += `{\\blockmove{ajouter \\ovalnum{${xLutin2}} à x}\n}\n` // attention aux /n qui marque la fin des chacun des blocs (blockmove et block si)
    }
    codeTikz += '}\n' // fin du si
    codeTikz += `{\\blockmove{ajouter \\ovalnum{${yLutin1}} à y}\n` // `{sinon \\blockmove{ajouter \\ovalnum{${yLutin1}} à y}\n`
    if (this.sup > 2) {
      codeTikz += `\\blockif{si \\booloperator{\\ovalvariable{var} > \\ovalnum{${n4}}} alors}\n`
      codeTikz += `{\\blockmove{ajouter \\ovalnum{${yLutin2}} à y}\n}\n` // attention aux /n qui marque la fin des chacun des blocs (blockmove et block si)
    }
    codeTikz += '}\n' // fin du sinon ?
    codeTikz += '\\end{scratch}'

    texte += scratchblock(codeTikz)
    if (n1 < n2) {
      texteCorr += `Comme l'inégalité $${n1} < ${n2}$ est vraie, alors on ajoute $${xLutin1}$ à l'abscisse du lutin. <br>`
      xLutin += xLutin1
      if (this.sup > 1) {
        if (n1 > n3) {
          texteCorr += `Comme l'inégalité $${n1} > ${n3}$ est vraie, alors on ajoute $${xLutin2}$ à l'abscisse du lutin. <br>`
          xLutin += xLutin2
        } else {
          texteCorr += `Comme l'inégalité $${n1} > ${n3}$ est fausse, alors on ne change pas l'abscisse du lutin. <br>`
        }
      }
    } else {
      texteCorr += `Comme l'inégalité $${n1} < ${n2}$ est fausse, alors on ajoute $${yLutin1}$ à l'ordonnée du lutin. <br>`
      yLutin += yLutin1
      if (this.sup > 2) {
        if (n1 > n4) {
          texteCorr += `Comme l'inégalité $${n1} > ${n4}$ est vraie, on ajoute $${yLutin2}$ à l'ordonnée du lutin. <br>`
          yLutin += yLutin2
        } else {
          texteCorr += `Comme l'inégalité $${n1} > ${n4}$ est fausse, alors on ne change pas l'ordonnée du lutin. <br>`
        }
      }
    }
    texteCorr += ` La position finale est donc : $(${miseEnEvidence(xLutin)}~;~${miseEnEvidence(yLutin)})$.`
    texteCorr += context.isHtml
      ? '<br>' +
        DomReadyActionElement.create({
          action: scratchSimulatorButtonAction,
          payload: {
            codeScratch: codeTikz,
            delai: 2000,
            insertProgramme: false,
          },
        })
      : ''
    if (this.interactif) {
      texte +=
        '<br>La position finale du lutin est : ' +
        remplisLesBlancs(
          this,
          0,
          ' (~%{champ1}~;~%{champ2}~).',
          KeyboardType.clavierDeBase,
        )
    }
    handleAnswers(
      this,
      0,
      {
        // bareme: (listePoints: number[]) => [Math.min(listePoints[0], listePoints[1]), 1],
        champ1: { value: xLutin },
        champ2: { value: yLutin },
      },
      { formatInteractif: 'fillInTheBlank' },
    )

    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)
    listeQuestionsToContenu(this)
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
