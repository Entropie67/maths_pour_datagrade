import { addCliqueFigure } from '../../lib/customElements/CliqueFigureElement'
import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import {
  avance,
  baisseCrayon,
  creerLutin,
  tournerD,
} from '../../modules/2dLutin'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Dessiner avec scratch'
export const dateDeModifImportante = '08/11/2026'
export const interactifReady = true

/**
 * Dessiner selon un programme scratch
 * @author Sébastien Lozano
 * implémentation fonction scratchblock par Jean-claude Lhote
 * Interactivité, grosse refactorisation par Éric Elter le 10/06/2025
 */

export const uuid = '33c9a'

export const refs = {
  'fr-fr': ['4I1', '3AutoI01-1'],
  'fr-ch': ['autres-16'],
}

const scratchSimulatorButtonAction = '4I1:scratch-simulator-button'

export default class TracerAvecScratch extends Exercice {
  constructor() {
    super()
    registerScratchSimulatorButton()
    this.consigne =
      `Laquelle des $4$ figures ci-dessous va être tracée avec le script fourni${sp()}?`

    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5]

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    this.cliqueFiguresArray = [[], [], [], []]

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // une fonction pour gérer la sortie HTML/LaTeX
      // code est un string contenant le code svg ou tikz

      // une fonction pour dire le nom du polygone
      const myPolyName = (n: number) => {
        const sortie = {
          name: '',
          nameParSommets: '',
          nbPas: 0,
        }
        switch (n) {
          case 2:
            sortie.name = 'segment'
            sortie.nbPas = 40
            break
          case 3:
            sortie.name = 'triangle équilatéral'
            sortie.nbPas = 40
            break
          case 4:
            sortie.name = 'carré'
            sortie.nbPas = 40
            break
          case 5:
            sortie.name = 'pentagone régulier'
            sortie.nbPas = 30
            break
          case 6:
            sortie.name = 'hexagone régulier'
            sortie.nbPas = 25
            break
          case 7:
            sortie.name = 'heptagone régulier'
            sortie.nbPas = 20
            break
          case 8:
            sortie.name = 'octogone régulier'
            sortie.nbPas = 20
            break
          case 9:
            sortie.name = 'ennéagone régulier'
            sortie.nbPas = 20
            break
        }
        return sortie
      }

      // une fonction pour renvoyer une situation
      // n définit le nombre de côtés du polygone régulier
      const mySituation = (n: number) => {
        const situations = [
          {
            // polygones réguliers
            nbCotes: n,
            nom: myPolyName(n).name,
            codeScratch: `\\begin{scratch}
\\blockinit{quand \\greenflag est cliqué}
\\blockpen{stylo en position d'écriture}
\\blockrepeat{répéter \\ovalnum{${n}} fois}
{
\\blockmove{avancer de \\ovalnum{${myPolyName(n).nbPas}} pas}
\\blockmove{tourner \\turnright{} de \\ovaloperator{\\ovalnum{360}/\\ovalnum{${n}}} degrés}
}
\\end{scratch}`,
            fig: '',
            fig_corr: '',
          },
        ]

        const lutinEnonce = []
        const figLutinEnonce = []

        // le lutinEnonce[indiceLutin] fait la bonne figure
        const tabNbCote = [n, n + 1, n - 1, n]
        for (let indiceLutin = 0; indiceLutin < 4; indiceLutin++) {
          lutinEnonce[indiceLutin] = creerLutin()
          lutinEnonce[indiceLutin].stringColor = bleuMathalea
          baisseCrayon(lutinEnonce[indiceLutin])
          for (let k = 1; k < tabNbCote[indiceLutin] + 1; k++) {
            avance(
              myPolyName(tabNbCote[indiceLutin]).nbPas * 3,
              lutinEnonce[indiceLutin],
            )
            tournerD(
              360 / tabNbCote[indiceLutin] - (indiceLutin === 3 ? 10 : 0),
              lutinEnonce[indiceLutin],
            )
          }
          lutinEnonce[indiceLutin].updateBordures()
          figLutinEnonce[indiceLutin] = mathalea2d(
            Object.assign(
              {
                display: 'inline-block',
                xmin: -4,
                ymin: -13.5,
                xmax: 10,
                ymax: 0.5,
                pixelsParCm: 20,
                scale: 0.4,
                id: `cliquefigure${indiceLutin}Ex${this.numeroExercice}Q${i}`,
              } as const,
              fixeBordures([lutinEnonce[indiceLutin]]),
            ),
            lutinEnonce[indiceLutin],
          )
        }
        const ordre = shuffle(range(3))
        situations[0].fig =
          figLutinEnonce[ordre[0]] +
          figLutinEnonce[ordre[1]] +
          figLutinEnonce[ordre[2]] +
          figLutinEnonce[ordre[3]]

        const lutinCorr = creerLutin()
        lutinCorr.stringColor = orangeMathalea
        baisseCrayon(lutinCorr)
        for (let k = 1; k < n + 1; k++) {
          avance(myPolyName(n).nbPas / 6, lutinCorr)
          tournerD(360 / n, lutinCorr)
        }
        lutinCorr.updateBordures()

        const figLutinCorr = mathalea2d(
          Object.assign(
            {
              display: 'inline-block',
              xmin: -4,
              ymin: -13.5,
              xmax: 10,
              ymax: 0.5,
              pixelsParCm: 20,
              scale: 0.4,
            } as const,
            fixeBordures([lutinCorr]),
          ),
          lutinCorr,
        )

        situations[0].fig_corr = figLutinCorr

        const enonces = []
        enonces.push({
          enonce: `
          ${scratchblock(situations[0].codeScratch)}<br>
          ${situations[0].fig}`,
          question: '',
          correction: `
          La figure tracée par le programme a $${situations[0].nbCotes}$ côtés de même longueur et $${situations[0].nbCotes}$ angles de même mesure, c'est un ${texteEnCouleurEtGras(situations[0].nom)}.<br><br>
          ${situations[0].fig_corr}`,
          scratchCorrection: situations[0].codeScratch,
        })

        return enonces
      }
      this.cliqueFiguresArray[i] = [
        { id: `cliquefigure0Ex${this.numeroExercice}Q${i}`, solution: true },
        { id: `cliquefigure1Ex${this.numeroExercice}Q${i}`, solution: false },
        { id: `cliquefigure2Ex${this.numeroExercice}Q${i}`, solution: false },
        { id: `cliquefigure3Ex${this.numeroExercice}Q${i}`, solution: false },
      ]

      const enonces = []
      enonces.push(mySituation(3)[0])
      enonces.push(mySituation(4)[0])
      enonces.push(mySituation(5)[0])
      enonces.push(mySituation(6)[0])
      enonces.push(mySituation(8)[0])
      texte = `${enonces[listeTypeDeQuestions[i] - 1].enonce}`
      texteCorr = `${enonces[listeTypeDeQuestions[i] - 1].correction}`
      if (this.interactif) {
        this.autoCorrection[i] = {}
        this.autoCorrection[i].formatInteractif = 'clique-figure'

        texte += addCliqueFigure(this, i)
        texte += `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>`
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] =
          texteCorr +
          (context.isHtml
            ? DomReadyActionElement.create({
                action: scratchSimulatorButtonAction,
                payload: {
                  codeScratch:
                    enonces[listeTypeDeQuestions[i] - 1].scratchCorrection,
                  delai: 500,
                  insertProgramme: true,
                },
              })
            : '')
        i++
      }
      cpt++
    }
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
