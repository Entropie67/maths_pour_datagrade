import { addCliqueFigure } from '../../lib/customElements/CliqueFigureElement'
import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { choice, shuffle, shuffle4tableaux } from '../../lib/outils/arrayOutils'
import { enumeration } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
// Ici ce sont les fonctions de la librairie maison 2d.js qui gèrent tout ce qui est graphique (SVG/tikz) et en particulier ce qui est lié à l'objet lutin

export const interactifReady = true

export const dateDeModifImportante = '08/11/2026'
export const dateDePublication = '14/02/2026'

export const titre = 'Trouver le bon programme Scratch'
export const uuid = 'e9cad'

export const refs = {
  'fr-fr': ['6I1B-6'],
  'fr-2016': [],
  'fr-ch': [],
}

const scratchSimulatorButtonAction = '6I1B-6:scratch-simulator-button'

/**
 * @author Jean-claude Lhote
 * Cet exercice utilise le simulateur Scratch (ScratchSimulator) couplé à l'interpréteur Scratch (ScratchInterpreter) de la librairie maison.
 * Il propose à l'élève de choisir parmi 5 programmes différents celui ou ceux qui permettent d'obtenir un résultat donné
 *  - faire avancer le lutin d'une certaine distance
 *  - faire tourner le lutin d'un certain angle
 *  - faire afficher un certain nombre
 *  - faire dessiner un polygone régulier à n côtés
 *  - faire dessiner un escalier de n marches
 *  L'exercice génère aléatoirement les programmes et les résultats attendus, ainsi que des programmes faux qui sont proches du programme correct pour rendre l'exercice plus difficile.
 *  L'élève peut exécuter les programmes dans le simulateur pour vérifier leur fonctionnement.
 */
export default class TrouverLeBonProgramme extends Exercice {
  niveau = '6'
  constructor() {
    super()
    this.comment = `En correction, on peut exécuter les programmes dans un simulateur.<br>
    On peut ajuster le délai entre chaque étape du programme pour que ce soit plus facile à suivre ou pour accélérer.<br>`
    this.nbQuestions = 1

    this.sup = '1'
    this.besoinFormulaireTexte = [
      'Types de programmes',
      'Nombres séparés par des tirets\n1 : Avancer\n2 : Tourner\n3 : Ajouter\n4 : Carré\n0 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Pause entre chaque étape du programme pour le simulateur',
      4,
      '1 : 1/2 seconde\n2 : 1 seconde\n3 : 2 secondes\n4 : 4 secondes',
    ]
    this.sup2 = 3
    this.besoinFormulaire3CaseACocher = ['code latex noir et blanc', false]
    this.sup3 = false
  }

  nouvelleVersion(): void {
    registerScratchSimulatorButton()
    let max: number = 4
    if (this.niveau === '6') {
      max = 4
    }
    if (this.niveau === '3') {
      max = 7
      this.besoinFormulaireTexte = [
        'Types de programmes',
        'Nombres séparés par des tirets\n1 : Avancer\n2 : Tourner\n3 : Ajouter\n4 : Carré\n5 : Polygone\n6 : Rebours\n7 : Escalier\n0 : Mélange',
      ]
    }
    this.cliqueFiguresArray = []
    const listeTypeDeProgrammes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max,
      melange: 0,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const delai =
      this.sup2 === 1
        ? 500
        : this.sup2 === 2
          ? 1000
          : this.sup2 === 3
            ? 2000
            : 4000
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const listeDeProgrammes = [
        getProgrammesAvancer,
        getProgrammesTourner,
        getProgrammesAjouter,
        getProgrammesCarre,
        getProgrammesPolygone,
        getProgrammesRebours,
        getProgrammesEscalier,
      ]
      const cas = listeTypeDeProgrammes[i] - 1
      const getProgrammes = listeDeProgrammes[cas]
      let nbPas: number
      switch (cas) {
        case 0: // avancer
          nbPas = randint(3, 8)
          break
        case 1: // tourner
          nbPas = 10 * randint(4, 7)
          break
        case 2: // ajouter
          nbPas = randint(4, 7)
          break
        case 3: // polygone
          nbPas = choice([3, 4, 6])
          break
        case 4: // carré
          nbPas = 40 * randint(3, 8)
          break
        case 5: // rebours
          nbPas = randint(5, 10)
          break
        case 6: // escalier
          nbPas = randint(4, 8)
          break
        default: // par défaut, on fait avancer
          nbPas = randint(3, 8)
      }
      const nbFalse = randint(2, 4)
      const nbTrue = 5 - nbFalse
      const vraisOuFaux = shuffle([
        ...Array(nbTrue).fill(true),
        ...Array(nbFalse).fill(false),
      ])

      const programmes = getProgrammes(nbPas, vraisOuFaux)
      let texte = programmes.enonce
      const ligne1 = [
        'Programme $1$',
        'Programme $2$',
        'Programme $3$',
        'Programme $4$',
        'Programme $5$',
      ]
      const numéros = [1, 2, 3, 4, 5]
      shuffle4tableaux(
        vraisOuFaux,
        programmes.programmesCodeBrut,
        programmes.programmesListe,
        numéros,
      )
      const ligne2 = programmes.programmesListe
      this.autoCorrection[i] = {}
      this.autoCorrection[i].formatInteractif = 'clique-figure'
      this.autoCorrection[i].enonce = programmes.enonce
      this.autoCorrection[i].propositions = [
        {
          texte: programmes.programmesListe[0],
          statut: vraisOuFaux[0],
        },
        {
          texte: programmes.programmesListe[1],
          statut: vraisOuFaux[1],
        },
        {
          texte: programmes.programmesListe[2],
          statut: vraisOuFaux[2],
        },
        {
          texte: programmes.programmesListe[3],
          statut: vraisOuFaux[3],
        },
        {
          texte: programmes.programmesListe[4],
          statut: vraisOuFaux[4],
        },
      ]
      this.cliqueFiguresArray[i] = [
        {
          solution: vraisOuFaux[0],
          id: `cliqueFigure0Ex${this.numeroExercice}Q${i}`,
        },
        {
          solution: vraisOuFaux[1],
          id: `cliqueFigure1Ex${this.numeroExercice}Q${i}`,
        },
        {
          solution: vraisOuFaux[2],
          id: `cliqueFigure2Ex${this.numeroExercice}Q${i}`,
        },
        {
          solution: vraisOuFaux[3],
          id: `cliqueFigure3Ex${this.numeroExercice}Q${i}`,
        },
        {
          solution: vraisOuFaux[4],
          id: `cliqueFigure4Ex${this.numeroExercice}Q${i}`,
        },
      ]

      const ligne2Brut =
        programmes.programmesCodeBrut || programmes.programmesListe
      if (context.isHtml) {
        texte +=
          '<div style="margin: 20px 0; display: flex; flex-wrap: wrap; gap: 12px; width: 100%; align-items: flex-start;">'
        for (let j = 0; j < ligne2.length; j++) {
          const programme = ligne2[j]
          const titre = ligne1[j]
          texte += `<div id="cliqueFigure${j}Ex${this.numeroExercice}Q${i}" style="border: 1px solid #ddd; padding: 10px; flex: 1 1 260px; min-width: 260px;">`
          texte += `<div style="font-weight: 600; margin-bottom: 8px;">${titre}</div>`
          texte += programme // createScratchSimulatorElement(simulatorCode, delai)
          texte += '</div>'
        }
        texte += '</div>'
        if (this.interactif) texte += addCliqueFigure(this, i)
        texte += `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>`
      } else {
        texte += '\\begin{center}\n'
        texte += '\\begin{tabular}{|c|c|c|}\n'
        texte += '\\hline\n'
        for (const titre of ligne1.slice(0, 3)) {
          texte += titre
          if (titre !== ligne1[2]) texte += ' & '
        }
        texte += ' \\\\\n'
        texte += '\\hline\n'
        for (const programme of ligne2Brut.slice(0, 3)) {
          texte += programme.replace(
            'scale=0.6',
            this.sup3 ? 'scale=0.6, print' : 'scale=0.6',
          )
          if (programme !== ligne2Brut[2]) texte += ' & '
        }
        texte += ' \\\\\n'
        texte += '\\hline\n'
        texte += '\\end{tabular}\n'
        texte += '\\end{center}\n'
        texte += '\\begin{center}\n'
        texte += '\\begin{tabular}{|c|c|}\n'
        texte += '\\hline\n'
        for (const titre of ligne1.slice(3, 5)) {
          texte += titre
          if (titre !== ligne1[4]) texte += ' & '
        }
        texte += ' \\\\\n'
        texte += '\\hline\n'
        for (const programme of ligne2Brut.slice(3, 5)) {
          texte += programme.replace(
            'scale=0.6',
            this.sup3 ? 'scale=0.6, print' : 'scale=0.6',
          )
          if (programme !== ligne2Brut[4]) texte += ' & '
        }
        texte += ' \\\\\n'
        texte += '\\hline\n'
        texte += '\\end{tabular}\n'
        texte += '\\end{center}\n'
      }

      if (this.questionJamaisPosee(i, nbPas, i % 2)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(
          `${vraisOuFaux.filter((v) => v).length > 1 ? 'Les programmes' : 'Le programme'} qui ${programmes.objectif} ${vraisOuFaux.filter((v) => v).length > 1 ? 'sont les programmes' : 'est le programme'} ${enumeration(
            vraisOuFaux
              .map((v, i) => (v ? `$${miseEnEvidence(String(i + 1))}$` : ''))
              .filter((n) => n !== ''),
          )}.<br>
          ${programmes.corrections
            .map((c, i) =>
              c.replace(
                /programme (\d+)/,
                (match, num) =>
                  `programme $${numéros.indexOf(parseInt(num)) + 1}$`,
              ),
            )
            .sort((a: string, b: string) => {
              const numA = parseInt(a.match(/programme \$(\d+)\$/)?.[1] || '0')
              const numB = parseInt(b.match(/programme \$(\d+)\$/)?.[1] || '0')
              return numA - numB
            })
            .join('<br>')}
            ${
              context.isHtml
                ? `<div style="margin: 20px 0; display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); width: 100%; align-self: stretch;">
     ${ligne2Brut
       .map(
         (codeScratch, i) =>
           `<div style="border: 1px solid #ddd; padding: 10px;"><div style="font-weight: 600; margin-bottom: 8px;">Programme $${i + 1}$</div>${DomReadyActionElement.create(
             {
               action: scratchSimulatorButtonAction,
               payload: {
                 codeScratch,
                 delai,
                 insertProgramme: context.isTypst,
               },
             },
           )}</div>`,
       )
       .join('')}</div>`
                : ''
            }`,
        )
        i++
      }
      cpt++
    }
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
    element.classList.add('mt-3', 'block')
    const button = document.createElement('button')
    const simulatorContainer = document.createElement('div')
    button.type = 'button'
    button.textContent = 'Lancer le simulateur'
    button.className =
      'inline-flex items-center px-3 py-2 bg-coopmaths-action dark:bg-coopmathsdark-action text-coopmaths-canvas dark:text-coopmathsdark-canvas font-medium text-xs rounded shadow-md hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest focus:bg-coopmaths-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:outline-none transition duration-150 ease-in-out'

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
function programmeAvancerType1(nbPas: number, vraiOuFaux: boolean) {
  let codeScratch = `\\begin{scratch}[blocks, scale=0.6]
   \\blockmove{s'orienter à \\ovalnum{90}}
  \\blockmove{aller à x:\\ovalnum{${randint(-10, -5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
  \\blockpen{stylo en position d'écriture}
  `
  for (let i = 0; i < (vraiOuFaux ? nbPas : nbPas - 1); i++) {
    codeScratch += '\\blockmove{avancer de \\ovalnum{20} pas}\n'
  }
  codeScratch += `\\end{scratch}`
  return codeScratch
}

function programmeAvancerType2(nbPas: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{s'orienter à \\ovalnum{90}}
 \\blockmove{aller à x:\\ovalnum{${randint(-10, -5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
   \\blockpen{stylo en position d'écriture}
\\blockmove{avancer de \\ovalnum{20} pas}
\\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbPas - 1 : nbPas}} fois}{
\\blockmove{avancer de \\ovalnum{20} pas}
}
\\end{scratch}`
  return codeScratch
}

function programmeAvancerType3(nbPas: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
   \\blockmove{s'orienter à \\ovalnum{90}}
  \\blockmove{aller à x:\\ovalnum{${randint(-10, -5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
 \\blockpen{stylo en position d'écriture}
\\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbPas - 1 : nbPas}} fois}{
\\blockmove{avancer de \\ovalnum{20} pas}
}
\\blockmove{avancer de \\ovalnum{20} pas}
\\end{scratch}`
  return codeScratch
}

function programmeAvancerType4(nbPas: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{s'orienter à \\ovalnum{90}}
   \\blockmove{aller à x:\\ovalnum{${randint(-10, -5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
 \\blockpen{stylo en position d'écriture}
\\blockrepeat{répéter \\ovalnum{${Math.floor(nbPas / 2)}} fois}{
\\blockmove{avancer de \\ovalnum{20} pas}
\\blockmove{avancer de \\ovalnum{20} pas}
}
${(nbPas % 2 === 1 && vraiOuFaux) || (nbPas % 2 === 0 && !vraiOuFaux) ? '\\blockmove{avancer de \\ovalnum{20} pas}' : ''}
\\end{scratch}`
  return codeScratch
}

function programmeAvancerType5(nbPas: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{s'orienter à \\ovalnum{0}}
 \\blockmove{aller à x:\\ovalnum{${randint(-10, -5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
   \\blockpen{stylo en position d'écriture}
\\blockrepeat{répéter \\ovalnum{${(nbPas - 1) * 2}} fois}{
\\blockmove{avancer de \\ovalnum{10} pas}
}
${vraiOuFaux ? '\\blockmove{avancer de \\ovalnum{20} pas}' : '\\blockmove{avancer de \\ovalnum{10} pas}'}
\\end{scratch}`
  return codeScratch
}

function getProgrammesAvancer(
  nbPas: number,
  vraisOuFaux: boolean[],
): {
  programmesListe: string[]
  programmesCodeBrut: string[]
  enonce: string
  corrections: string[]
  objectif: string
} {
  const programmesCodeBrut = [
    programmeAvancerType1(nbPas, vraisOuFaux[0]),
    programmeAvancerType2(nbPas, vraisOuFaux[1]),
    programmeAvancerType3(nbPas, vraisOuFaux[2]),
    programmeAvancerType4(nbPas, vraisOuFaux[3]),
    programmeAvancerType5(nbPas, vraisOuFaux[4]),
  ]
  const programmesListe = programmesCodeBrut.map((code) =>
    String(scratchblock(code)),
  )
  return {
    objectif:
      vraisOuFaux.filter((v) => v).length === 1
        ? `trace un segment de $${nbPas * 20}$ pas`
        : `tracent un segment de $${nbPas * 20}$ pas`,
    programmesListe,
    programmesCodeBrut,
    enonce: `On souhaite que le lutin trace un segment de $${nbPas * 20}$ pas.<br>${context.isHtml ? 'Sélectionner' : 'Entourer'} le (ou les) programme(s) correct(s).<br>`,
    corrections: [
      `Le programme 1 exécute $${vraisOuFaux[0] ? nbPas : nbPas - 1}$ fois «${sp()}avancer de $20$ pas${sp()}», donc trace un segment de $${(vraisOuFaux[0] ? nbPas : nbPas - 1) * 20}$ pas.`,
      `Le programme 2 exécute $${vraisOuFaux[1] ? nbPas : nbPas + 1}$ fois «${sp()}avancer de $20$ pas${sp()}», donc trace un segment de $${(vraisOuFaux[1] ? nbPas : nbPas + 1) * 20}$ pas.`,
      `Le programme 3 exécute $${vraisOuFaux[2] ? nbPas : nbPas + 1}$ fois «${sp()}avancer de $20$ pas${sp()}», donc trace un segment de $${(vraisOuFaux[2] ? nbPas : nbPas + 1) * 20}$ pas.`,
      `Le programme 4 exécute $${vraisOuFaux[3] ? nbPas : nbPas + 1}$ fois «${sp()}avancer de $20$ pas${sp()}», donc trace un segment de $${(vraisOuFaux[3] ? nbPas : nbPas + 1) * 20}$ pas.`,
      `Le programme 5 exécute $${vraisOuFaux[4] ? (nbPas - 1) * 2 : (nbPas - 1) * 2 + 1}$ fois «${sp()}avancer de $10$ pas${sp()}»${vraisOuFaux[4] ? ' et une fois «\u00a0avancer de $20$ pas\u00a0»' : ''}, donc trace un segment de $${vraisOuFaux[4] ? nbPas * 20 : ((nbPas - 1) * 2 + 1) * 10}$ pas.`,
    ],
  }
}

function programmeTournerType1(angle: number, vraiOuFaux: boolean) {
  let codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
  \\blockmove{aller à x:\\ovalnum{${randint(0, 5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
 \\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}\n`
  if (angle % 20 === 0) {
    for (let i = 0; i < (vraiOuFaux ? angle / 20 - 1 : angle / 20); i++) {
      codeScratch +=
        '\\blockmove{tourner \\turnright{} de \\ovalnum{20} degrés}\n'
    }
    if (vraiOuFaux)
      codeScratch +=
        '\\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}\n'
  } else {
    for (let i = 0; i < (vraiOuFaux ? angle / 10 - 3 : angle / 10 - 2); i++) {
      codeScratch +=
        '\\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}\n'
    }
    codeScratch +=
      '\\blockmove{tourner \\turnright{} de \\ovalnum{20} degrés}\n'
  }

  codeScratch += `\\end{scratch}`
  return codeScratch
}

function programmeTournerType2(angle: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
  \\blockmove{aller à x:\\ovalnum{${randint(0, 5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
\\blockmove{tourner \\turnleft{} de \\ovalnum{10} degrés}
\\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? angle / 10 + 2 : angle / 10 - 2}} fois}{
\\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}
}
\\blockmove{tourner \\turnleft{} de \\ovalnum{10} degrés}
\\end{scratch}`
  return codeScratch
}

function programmeTournerType3(angle: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
  \\blockmove{aller à x:\\ovalnum{${randint(0, 5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
\\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? angle / 10 - 1 : angle / 10}} fois}{
\\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}
}
\\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}
\\end{scratch}`
  return codeScratch
}

function programmeTournerType4(angle: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
 \\blockmove{aller à x:\\ovalnum{${randint(0, 5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
\\blockrepeat{répéter \\ovalnum{${Math.floor(angle / 20)}} fois}{
\\blockrepeat{répéter \\ovalnum{2} fois}{
\\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}
}
}
${(angle % 20 === 10 && vraiOuFaux) || (angle % 20 === 0 && !vraiOuFaux) ? '\\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}' : ''}
\\end{scratch}`
  return codeScratch
}

function programmeTournerType5(angle: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
 \\blockmove{aller à x:\\ovalnum{${randint(0, 5) * 10}} y:\\ovalnum{${randint(0, 5) * 20}}}
\\blockrepeat{répéter \\ovalnum{${(angle / 10 + 1) * 2}} fois}{
\\blockmove{tourner \\turnright{} de \\ovalnum{5} degrés}
}
${vraiOuFaux ? '\\blockmove{tourner \\turnleft{} de \\ovalnum{10} degrés}' : '\\blockmove{tourner \\turnright{} de \\ovalnum{10} degrés}'}
\\end{scratch}`
  return codeScratch
}

function getProgrammesTourner(
  angle: number,
  vraisOuFaux: boolean[],
): {
  programmesListe: string[]
  programmesCodeBrut: string[]
  enonce: string
  corrections: string[]
  objectif: string
} {
  const programmesCodeBrut = [
    programmeTournerType1(angle, vraisOuFaux[0]),
    programmeTournerType2(angle, vraisOuFaux[1]),
    programmeTournerType3(angle, vraisOuFaux[2]),
    programmeTournerType4(angle, vraisOuFaux[3]),
    programmeTournerType5(angle, vraisOuFaux[4]),
  ]
  const programmesListe = programmesCodeBrut.map((code) =>
    String(scratchblock(code)),
  )
  return {
    programmesListe,
    programmesCodeBrut,
    enonce: `On souhaite faire tourner le lutin de $${angle}$ degrés dans le sens des aiguilles d'une montre.<br>${context.isHtml ? 'Sélectionner' : 'Entourer'} le (ou les) programme(s) correct(s).<br>`,
    corrections: [
      angle % 20 === 0
        ? `Le programme 1 exécute $${vraisOuFaux[0] ? angle / 20 - 1 : angle / 20}$ fois «${sp()}tourner de $20$ degrés${sp()}» et $${vraisOuFaux[0] ? '2' : '1'}$ fois «${sp()}tourner de $10$ degrés${sp()}», donc fait tourner le lutin de $${vraisOuFaux[0] ? angle : angle + 10}$ degrés.`
        : `Le programme 1 exécute $${vraisOuFaux[0] ? angle / 10 - 2 : angle / 10 - 1}$ fois «${sp()}tourner de $10$ degrés${sp()}» et une fois «${sp()}tourner de $20$ degrés${sp()}», donc fait tourner le lutin de $${vraisOuFaux[0] ? angle : angle + 10}$ degrés.`,
      `Le programme 2 exécute $${vraisOuFaux[1] ? angle / 10 + 2 : angle / 10 - 2}$ fois «${sp()}tourner de $10$ degrés${sp()}» dans le bon sens et deux fois «${sp()}tourner de $10$ degrés${sp()}» dans le sens inverse, donc fait tourner le lutin de $${vraisOuFaux[1] ? angle : angle - 40}$ degrés.`,
      `Le programme 3 exécute $${vraisOuFaux[2] ? angle / 10 : angle / 10 + 1}$ fois «${sp()}tourner de $10$ degrés${sp()}», donc fait tourner le lutin de $${vraisOuFaux[2] ? angle : angle + 10}$ degrés.`,
      `Le programme 4 exécute $${vraisOuFaux[3] ? angle / 10 : angle / 10 + 1}$ fois «${sp()}tourner de $10$ degrés${sp()}», donc fait tourner le lutin de $${vraisOuFaux[3] ? angle : angle + 10}$ degrés.`,
      `Le programme 5 exécute $${vraisOuFaux[4] ? (angle / 10 + 1) * 2 : (angle / 10 + 1) * 2 - 1}$ fois «${sp()}tourner de $5$ degrés${sp()}» et une fois «${sp()}tourner de $10$ degrés${sp()}»${vraisOuFaux[4] ? ' dans le sens inverse' : ''}, donc fait tourner le lutin de $${vraisOuFaux[4] ? angle : angle + 10}$ degrés.`,
    ],
    objectif:
      vraisOuFaux.filter((vOf) => vOf).length === 1
        ? `fait tourner le lutin de $${angle}$ degrés dans le sens des aiguilles d'une montre`
        : `font tourner le lutin de $${angle}$ degrés dans le sens des aiguilles d'une montre`,
  }
}

function programmeAjouterType1(nb: number, vraiOuFaux: boolean) {
  let codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}\n`
  for (let i = 0; i < (vraiOuFaux ? nb : nb - 1); i++) {
    codeScratch +=
      '\\blockvariable{ajouter \\ovalnum{1} à \\ovalvariable{compteur}}\n'
  }
  codeScratch += '\\blocklook{dire \\ovalvariable{compteur}}\n'
  codeScratch += `\\end{scratch}`
  return codeScratch
}

function programmeAjouterType2(nb: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nb : nb - 1}} fois}{
    \\blockvariable{ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
  }
  \\blocklook{dire \\ovalvariable{compteur}}
\\end{scratch}`
  return codeScratch
}

function programmeAjouterType3(nb: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nb - 1 : nb}} fois}{
    \\blockvariable{ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
  }
  \\blockvariable{ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
  \\blocklook{dire \\ovalvariable{compteur}}
\\end{scratch}`
  return codeScratch
}

function programmeAjouterType4(nb: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
  \\blockrepeat{répéter \\ovalnum{${Math.floor(nb / 2)}} fois}{
    \\blockvariable{ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
    \\blockvariable{ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
  }${(nb % 2 === 1 && vraiOuFaux) || (nb % 2 === 0 && !vraiOuFaux) ? '\n\\blockvariable{ajouter \\ovalnum{1} à \\ovalvariable{compteur}}' : ''}
  \\blocklook{dire \\ovalvariable{compteur}}
\\end{scratch}`
  return codeScratch
}

function programmeAjouterType5(nb: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]\n
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
  \\blockrepeat{répéter \\ovalnum{${(nb - 1) * 2}} fois}{
    \\blockvariable{ajouter \\ovalnum{0.5} à \\ovalvariable{compteur}}
  }
  ${vraiOuFaux ? '\\blockvariable{ajouter \\ovalnum{1} à \\ovalvariable{compteur}}' : '\\blockvariable{ajouter \\ovalnum{0.5} à \\ovalvariable{compteur}}'}
  \\blocklook{dire \\ovalvariable{compteur}}
\\end{scratch}`
  return codeScratch
}

function getProgrammesAjouter(
  nb: number,
  vraisOuFaux: boolean[],
): {
  programmesListe: string[]
  programmesCodeBrut: string[]
  enonce: string
  corrections: string[]
  objectif: string
} {
  const programmesCodeBrut = [
    programmeAjouterType1(nb, vraisOuFaux[0]),
    programmeAjouterType2(nb, vraisOuFaux[1]),
    programmeAjouterType3(nb, vraisOuFaux[2]),
    programmeAjouterType4(nb, vraisOuFaux[3]),
    programmeAjouterType5(nb, vraisOuFaux[4]),
  ]
  const programmesListe = programmesCodeBrut.map((code) =>
    String(scratchblock(code)),
  )
  return {
    objectif:
      vraisOuFaux.filter((vOf) => vOf).length === 1
        ? `affiche le nombre $${nb}$ à la fin de l'exécution`
        : `affichent le nombre $${nb}$ à la fin de l'exécution`,
    programmesListe,
    programmesCodeBrut,
    enonce: `On souhaite faire afficher le nombre $${nb}$.<br>${context.isHtml ? 'Sélectionner' : 'Entourer'} le (ou les) programme(s) correct(s).<br>`,
    corrections: [
      `Le programme 1 ajoute $1$ à la variable «${sp()}compteur${sp()}» $${vraisOuFaux[0] ? nb : nb - 1}$ fois, donc affiche $${vraisOuFaux[0] ? nb : nb - 1}$.`,
      `Le programme 2 ajoute $1$ à la variable «${sp()}compteur${sp()}» $${vraisOuFaux[1] ? nb : nb - 1}$ fois, donc affiche $${vraisOuFaux[1] ? nb : nb - 1}$.`,
      `Le programme 3 ajoute $1$ à la variable «${sp()}compteur${sp()}» $${vraisOuFaux[2] ? nb : nb + 1}$ fois, donc affiche $${vraisOuFaux[2] ? nb : nb + 1}$.`,
      `Le programme 4 ajoute $1$ à la variable «${sp()}compteur${sp()}» $${vraisOuFaux[3] ? nb : nb + 1}$ fois, donc affiche $${vraisOuFaux[3] ? nb : nb + 1}$.`,
      `Le programme 5 ajoute $${texNombre(0.5)}$ à la variable «${sp()}compteur${sp()}»$${vraisOuFaux[4] ? 2 * nb - 2 : 2 * nb - 1}$ fois${vraisOuFaux[4] ? ' et ajoute $1$ de plus ' : ''}, donc affiche $${vraisOuFaux[4] ? nb : texNombre(nb - 0.5, 1)}$.`,
    ],
  }
}

function programmePolygoneType1(nbCotes: number, vraiOuFaux: boolean) {
  let codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  `
  for (let i = 0; i < (vraiOuFaux ? nbCotes : nbCotes - 1); i++) {
    codeScratch += `\\blockmove{avancer de \\ovalnum{30} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{${Math.round(360 / nbCotes)}} degrés}
    `
  }
  codeScratch += `\\end{scratch}`
  return codeScratch
}

function programmePolygoneType2(nbCotes: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbCotes : nbCotes - 1}} fois}{
  \\blockmove{avancer de \\ovalnum{30} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{${Math.round(360 / nbCotes)}} degrés}
  }
\\end{scratch}`
  return codeScratch
}

function programmePolygoneType3(nbCotes: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbCotes - 1 : nbCotes - 2}} fois}{
    \\blockmove{avancer de \\ovalnum{30} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{${Math.round(360 / nbCotes)}} degrés}
  }
  \\blockmove{avancer de \\ovalnum{30} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{${Math.round(360 / nbCotes)}} degrés}
\\end{scratch}`
  return codeScratch
}

function programmePolygoneType4(nbCotes: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbCotes / 2 : nbCotes}} fois}{
  \\blockmove{avancer de \\ovalnum{30} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{${Math.round(360 / nbCotes)}} degrés}
  \\blockmove{avancer de \\ovalnum{30} pas}
  ${vraiOuFaux ? '' : `\\blockmove{tourner \\turnleft{} de \\ovalnum{${Math.round(360 / nbCotes)}} degrés}\n`}
}
\\end{scratch}`
  return codeScratch
}

// à refaire, on ne peut pas faire un polygone à 2n côtés.
function programmePolygoneType5(nbCotes: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${nbCotes - 1}} fois}{
    \\blockmove{tourner \\turnright{} de \\ovalnum{${vraiOuFaux ? Math.round(360 / nbCotes) : choice([120, 90, 60], Math.round(360 / nbCotes))}} degrés}
    \\blockmove{avancer de \\ovalnum{30} pas}
  }
  ${vraiOuFaux ? `\\blockmove{tourner \\turnright{} de \\ovalnum{${Math.round(360 / nbCotes)}} degrés}\n\\blockmove{avancer de \\ovalnum{30} pas}\n` : `\\blockmove{avancer de \\ovalnum{30} pas}\n\\blockmove{tourner \\turnright{} de \\ovalnum{${Math.round(360 / nbCotes)}} degrés}\n`}
\\end{scratch}`
  return codeScratch
}

function getProgrammesPolygone(
  nbCotes: number,
  vraisOuFaux: boolean[],
): {
  programmesListe: string[]
  programmesCodeBrut: string[]
  enonce: string
  corrections: string[]
  objectif: string
} {
  const programmesCodeBrut = [
    programmePolygoneType1(nbCotes, vraisOuFaux[0]),
    programmePolygoneType2(nbCotes, vraisOuFaux[1]),
    programmePolygoneType3(nbCotes, vraisOuFaux[2]),
    programmePolygoneType4(nbCotes, vraisOuFaux[3]),
    programmePolygoneType5(nbCotes, vraisOuFaux[4]),
  ]
  const programmesListe = programmesCodeBrut.map((code) =>
    String(scratchblock(code)),
  )
  return {
    objectif:
      vraisOuFaux.filter((vOf) => vOf).length === 1
        ? `dessine un polygone régulier à $${nbCotes}$ côtés`
        : `dssinent un polygone régulier à $${nbCotes}$ côtés`,
    programmesListe,
    programmesCodeBrut,
    enonce: `On souhaite faire dessiner un polygone régulier à $${nbCotes}$ côtés.<br>${context.isHtml ? 'Sélectionner' : 'Entourer'} le (ou les) programme(s) correct(s).<br>`,
    corrections: [
      `Le programme 1 fait $${vraisOuFaux[0] ? nbCotes : nbCotes - 1}$ côtés ${vraisOuFaux[0] ? `en tournant de $${Math.round(360 / nbCotes)}$ degrés à chaque fois` : ''}, donc il ${vraisOuFaux[0] ? 'trace' : 'ne trace pas'} un polygone régulier à $${nbCotes}$ côtés.`,
      `Le programme 2 fait $${vraisOuFaux[1] ? nbCotes : nbCotes - 1}$ côtés ${vraisOuFaux[1] ? `en tournant de $${Math.round(360 / nbCotes)}$ degrés à chaque fois` : ''}, donc il ${vraisOuFaux[1] ? 'trace' : 'ne trace pas'} un polygone régulier à $${nbCotes}$ côtés.`,
      `Le programme 3 fait $${vraisOuFaux[2] ? nbCotes : nbCotes - 1}$ côtés ${vraisOuFaux[2] ? `en tournant de $${Math.round(360 / nbCotes)}$ degrés à chaque fois` : ''}, donc il ${vraisOuFaux[2] ? 'trace' : 'ne trace pas'} un polygone régulier à $${nbCotes}$ côtés.`,
      vraisOuFaux[3]
        ? `Le programme 4 fait $${nbCotes}$ côtés de $60$ pas en commençant au milieu d'un côté qu'il complète à la fin en tournant de $${Math.round(360 / nbCotes)}$ degrés à chaque fois, donc il trace un polygone régulier à $${nbCotes}$ côtés.`
        : `Le programme 4 fait $4$ marches d'escalier car il tourne une fois dans un sens et une fois dans l'autre sens, donc il ne trace pas un polygone régulier à $${nbCotes}$ côtés.`,
      vraisOuFaux[4]
        ? `Le programme 5 fait $${nbCotes}$ côtés en tournant de $${Math.round(360 / nbCotes)}$ degrés à chaque fois, donc il trace un polygone régulier à $${nbCotes}$ côtés.`
        : `Le programme 5 fait un côté de $60$ pas, donc il ne trace pas un polygone régulier.`,
    ],
  }
}

function programmeCarreType1(perimetre: number, vraiOuFaux: boolean) {
  const cote = perimetre / 4
  let codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  `
  for (let i = 0; i < (vraiOuFaux ? 4 : choice([2, 3])); i++) {
    codeScratch += `\\blockmove{avancer de \\ovalnum{${cote}} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
    `
  }
  codeScratch += `\\end{scratch}`
  return codeScratch
}

function programmeCarreType2(perimetre: number, vraiOuFaux: boolean) {
  const cote = perimetre / 4
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? 4 : choice([2, 3])}} fois}{
  \\blockmove{avancer de \\ovalnum{${cote}} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
  }
\\end{scratch}`
  return codeScratch
}

function programmeCarreType3(perimetre: number, vraiOuFaux: boolean) {
  const cote = perimetre / 4
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? 3 : 2}} fois}{
    \\blockmove{avancer de \\ovalnum{${cote}} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
  }
  \\blockmove{avancer de \\ovalnum{${cote}} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
\\end{scratch}`
  return codeScratch
}

function programmeCarreType4(perimetre: number, vraiOuFaux: boolean) {
  const cote = perimetre / 4
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{2} fois}{
  \\blockmove{avancer de \\ovalnum{${cote}} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{${vraiOuFaux ? 90 : 180}} degrés}
  \\blockmove{avancer de \\ovalnum{${cote}} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{${vraiOuFaux ? 90 : 180}} degrés}
}
\\end{scratch}`
  return codeScratch
}

function programmeCarreType5(perimetre: number, vraiOuFaux: boolean) {
  const cote = perimetre / 4
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? 4 : 3}} fois}{
    \\blockmove{avancer de \\ovalnum{${cote / 2}} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
    \\blockmove{avancer de \\ovalnum{${cote / 2}} pas}
  }
\\end{scratch}`
  return codeScratch
}

function getProgrammesCarre(
  perimetre: number,
  vraisOuFaux: boolean[],
): {
  programmesListe: string[]
  programmesCodeBrut: string[]
  enonce: string
  corrections: string[]
  objectif: string
} {
  const programmesCodeBrut = [
    programmeCarreType1(perimetre, vraisOuFaux[0]),
    programmeCarreType2(perimetre, vraisOuFaux[1]),
    programmeCarreType3(perimetre, vraisOuFaux[2]),
    programmeCarreType4(perimetre, vraisOuFaux[3]),
    programmeCarreType5(perimetre, vraisOuFaux[4]),
  ]
  const programmesListe = programmesCodeBrut.map((code) =>
    String(scratchblock(code)),
  )
  return {
    objectif:
      vraisOuFaux.filter((vOf) => vOf).length === 1
        ? `dessine un carré de périmètre $${perimetre}$ pas`
        : `dessinent un carré de périmètre $${perimetre}$ pas`,
    programmesListe,
    programmesCodeBrut,
    enonce: `On souhaite faire dessiner un carré de périmètre $${perimetre}$ pas.<br>${context.isHtml ? 'Sélectionner' : 'Entourer'} le (ou les) programme(s) correct(s).<br>`,
    corrections: [
      `Le programme 1 ${vraisOuFaux[0] ? 'trace' : 'ne trace pas'} $4$ côtés de $${perimetre / 4}$ pas, donc il ${vraisOuFaux[0] ? 'dessine' : 'ne dessine pas'} un carré de périmètre $${perimetre}$ pas.`,
      `Le programme 2 ${vraisOuFaux[1] ? 'trace' : 'ne trace pas'} $4$ côtés de $${perimetre / 4}$ pas, donc il ${vraisOuFaux[1] ? 'dessine' : 'ne dessine pas'} un carré de périmètre $${perimetre}$ pas.`,
      `Le programme 3 ${vraisOuFaux[2] ? 'trace $4$' : 'trace $3$'} côtés de $${perimetre / 4}$ pas, donc il ${vraisOuFaux[2] ? 'dessine' : 'ne dessine pas'} un carré de périmètre $${perimetre}$ pas.`,
      vraisOuFaux[3]
        ? `Le programme 4 trace $4$ côtés de $${perimetre / 4}$ pas, donc dessine un carré de périmètre $${perimetre}$ pas.`
        : `Le programme 4 fait faire demi-tour au lutin à chaque extrémite du segment tracé donc il ne dessine pas un carré`,
      `Le programme 5 ${vraisOuFaux[4] ? 'tourne $4$' : 'tourne $3$'} fois de $90$ degrés${vraisOuFaux[4] ? ` et ses côtés mesurent $${perimetre / 4}$ pas` : ''}, donc il ${vraisOuFaux[4] ? 'dessine' : 'ne dessine pas'} un carré de périmètre $${perimetre}$ pas.`,
    ],
  }
}

function programmeReboursType1(nbDepart: number, vraiOuFaux: boolean) {
  let codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{${nbDepart}}}
`
  for (let i = 0; i < (vraiOuFaux ? nbDepart : nbDepart - 1); i++) {
    codeScratch +=
      '  \\blockvariable{ajouter \\ovalnum{-1} à \\ovalvariable{compteur}}\n'
  }
  codeScratch += '  \\blocklook{dire \\ovalvariable{compteur}}\n'
  codeScratch += `\\end{scratch}`
  return codeScratch
}

function programmeReboursType2(nbDepart: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{${nbDepart}}}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbDepart : nbDepart - 1}} fois}{
    \\blockvariable{ajouter \\ovalnum{-1} à \\ovalvariable{compteur}}
  }
  \\blocklook{dire \\ovalvariable{compteur}}
\\end{scratch}`
  return codeScratch
}

function programmeReboursType3(nbDepart: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{${nbDepart}}}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbDepart - 1 : nbDepart - 2}} fois}{
    \\blockvariable{ajouter \\ovalnum{-1} à \\ovalvariable{compteur}}
  }
  \\blockvariable{ajouter \\ovalnum{-1} à \\ovalvariable{compteur}}
  \\blocklook{dire \\ovalvariable{compteur}}
\\end{scratch}`
  return codeScratch
}

function programmeReboursType4(nbDepart: number, vraiOuFaux: boolean) {
  const moitie = Math.floor(nbDepart / 2)
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{${nbDepart}}}
  \\blockrepeat{répéter \\ovalnum{${moitie}} fois}{
    \\blockvariable{ajouter \\ovalnum{-1} à \\ovalvariable{compteur}}
    \\blockvariable{ajouter \\ovalnum{-1} à \\ovalvariable{compteur}}
  }${(nbDepart % 2 === 1 && vraiOuFaux) || (nbDepart % 2 === 0 && !vraiOuFaux) ? '\n  \\blockvariable{ajouter \\ovalnum{-1} à \\ovalvariable{compteur}}' : ''}
  \\blocklook{dire \\ovalvariable{compteur}}
\\end{scratch}`
  return codeScratch
}

function programmeReboursType5(nbDepart: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{${nbDepart}}}
  \\blockrepeat{répéter \\ovalnum{${nbDepart}} fois}{
    \\blockvariable{mettre \\selectmenu{compteur} à \\ovaloperator{${vraiOuFaux ? '\\ovalvariable{compteur} - \\ovalnum{1}' : '\\ovalnum{1} - \\ovalvariable{compteur}'}}}
  }
  \\blocklook{dire \\ovalvariable{compteur}}
\\end{scratch}`
  return codeScratch
}

function getProgrammesRebours(
  nbDepart: number,
  vraisOuFaux: boolean[],
): {
  programmesListe: string[]
  programmesCodeBrut: string[]
  enonce: string
  corrections: string[]
  objectif: string
} {
  const programmesCodeBrut = [
    programmeReboursType1(nbDepart, vraisOuFaux[0]),
    programmeReboursType2(nbDepart, vraisOuFaux[1]),
    programmeReboursType3(nbDepart, vraisOuFaux[2]),
    programmeReboursType4(nbDepart, vraisOuFaux[3]),
    programmeReboursType5(nbDepart, vraisOuFaux[4]),
  ]
  const programmesListe = programmesCodeBrut.map((code) =>
    String(scratchblock(code)),
  )
  return {
    objectif:
      vraisOuFaux.filter((vOf) => vOf).length === 1
        ? `fait afficher le nombre $0$ à la fin de l'exécution`
        : `font afficher le nombre $0$ à la fin de l'exécution`,
    programmesListe,
    programmesCodeBrut,
    enonce: `On souhaite faire afficher le nombre $0$ en partant de $${nbDepart}$ et en faisant un compte à rebours.<br>${context.isHtml ? 'Sélectionner' : 'Entourer'} le (ou les) programme(s) correct(s).<br>`,
    corrections: [
      `Le programme 1 soustrait $1$ à la variable «${sp()}compteur${sp()}» $${vraisOuFaux[0] ? nbDepart : nbDepart - 1}$ fois, donc il affiche $${vraisOuFaux[0] ? 0 : 1}$.`,
      `Le programme 2 soustrait $1$ à la variable «${sp()}compteur${sp()}» $${vraisOuFaux[1] ? nbDepart : nbDepart - 1}$ fois, donc il affiche $${vraisOuFaux[1] ? 0 : 1}$.`,
      `Le programme 3 soustrait $1$ à la variable «${sp()}compteur${sp()}» $${vraisOuFaux[2] ? nbDepart : nbDepart - 1}$ fois, donc il affiche $${vraisOuFaux[2] ? 0 : 1}$.`,
      `Le programme 4 soustrait $1$ à la variable «${sp()}compteur${sp()}» $${vraisOuFaux[3] ? nbDepart : nbDepart + 1}$ fois, donc il affiche $${vraisOuFaux[3] ? 0 : -1}$.`,
      vraisOuFaux[4]
        ? `Le programme 5 soustrait $1$ à la variable «${sp()}compteur${sp()}» $${nbDepart}$ fois, donc il affiche $0$.`
        : `Le programme 5 effectue les soustractions dans le mauvais ordre, il n'affiche pas $0$.`,
    ],
  }
}

function programmeEscalierType1(nbMarches: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
 \\initmoreblocks{définir \\namemoreblocks{marche}}
  \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
    \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner ${vraiOuFaux ? '\\turnleft{}' : '\\turnright{}'} de \\ovalnum{90} degrés}

  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${nbMarches}} fois}{
    \\blockmoreblocks{marche}
}
\\end{scratch}`
  return codeScratch
}

function programmeEscalierType2(nbMarches: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbMarches : choice([nbMarches - 1, nbMarches + 1])}} fois}{
  \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
    \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}
  }
\\end{scratch}`
  return codeScratch
}

function programmeEscalierType3(nbMarches: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbMarches - 1 : nbMarches - 2}} fois}{
    \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
    \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}
  }
  \\blockmove{avancer de \\ovalnum{20} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
  \\blockmove{avancer de \\ovalnum{20} pas}
  \\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}
\\end{scratch}`
  return codeScratch
}

function programmeEscalierType4(nbMarches: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockmove{avancer de \\ovalnum{20} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
  \\blockmove{avancer de \\ovalnum{20} pas}
  \\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbMarches - 1 : nbMarches}} fois}{
    \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
    \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}
  }
\\end{scratch}`
  return codeScratch
}

function programmeEscalierType5(nbMarches: number, vraiOuFaux: boolean) {
  const codeScratch = `\\begin{scratch}[blocks, scale=0.6]
  \\blockmove{aller à x:\\ovalnum{${randint(-5, 5) * 5}} y:\\ovalnum{${randint(-5, 5) * 5}}}
  \\blockpen{stylo en position d'écriture}
  \\blockrepeat{répéter \\ovalnum{${vraiOuFaux ? nbMarches : nbMarches + 1}} fois}{
    \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
    \\blockmove{avancer de \\ovalnum{20} pas}
    \\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}
    \\blockmove{avancer de \\ovalnum{20} pas}
  }
\\end{scratch}`
  return codeScratch
}

function getProgrammesEscalier(
  nbMarches: number,
  vraisOuFaux: boolean[],
): {
  programmesListe: string[]
  programmesCodeBrut: string[]
  enonce: string
  corrections: string[]
  objectif: string
} {
  const programmesCodeBrut = [
    programmeEscalierType1(nbMarches, vraisOuFaux[0]),
    programmeEscalierType2(nbMarches, vraisOuFaux[1]),
    programmeEscalierType3(nbMarches, vraisOuFaux[2]),
    programmeEscalierType4(nbMarches, vraisOuFaux[3]),
    programmeEscalierType5(nbMarches, vraisOuFaux[4]),
  ]
  const programmesListe = programmesCodeBrut.map((code) =>
    String(scratchblock(code)),
  )
  return {
    objectif:
      vraisOuFaux.filter((vOf) => vOf).length === 1
        ? `dessine un escalier de $${nbMarches}$ marches`
        : `dessinent un escalier de $${nbMarches}$ marches`,
    programmesListe,
    programmesCodeBrut,
    enonce: `On souhaite faire dessiner un escalier de $${nbMarches}$ marches.<br>${context.isHtml ? 'Sélectionner' : 'Entourer'} le (ou les) programme(s) correct(s).<br>`,
    corrections: [
      `Le programme 1 fait dessiner $${nbMarches}$ marches,${
        vraisOuFaux[0]
          ? ' et les marches sont correctes'
          : " mais le lutin s'oriente mal après le deuxième segment"
      }, donc il ${vraisOuFaux[0] ? 'dessine' : 'ne dessine pas'} un escalier.`,
      `Le programme 2 fait ${vraisOuFaux[1] ? 'le bon nombre de marches' : 'un mauvais nombre de marches'}.`,
      `Le programme 3 fait ${vraisOuFaux[2] ? `$${nbMarches}$ marches` : `$${nbMarches - 1}$ marches`}.`,
      `Le programme 4 fait ${vraisOuFaux[3] ? `$${nbMarches}$ marches` : `$${nbMarches + 1}$ marches`}.`,
      `Le programme 5 fait ${vraisOuFaux[4] ? `$${nbMarches}$ marches` : `$${nbMarches + 1}$ marches`}.`,
    ],
  }
}
