import { addCliqueFigure } from '../../lib/customElements/CliqueFigureElement'
// on importe les fonctions nécessaires.
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { texteGras } from '../../lib/format/style'
import {
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
// Ici ce sont les fonctions de la librairie maison 2d.js qui gèrent tout ce qui est graphique (SVG/tikz) et en particulier ce qui est lié à l'objet lutin
import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { grille } from '../../lib/2d/Grille'
import { bleuMathalea } from '../../lib/colors'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import {
  allerA,
  angleScratchTo2d,
  avance,
  baisseCrayon,
  creerLutin,
  leveCrayon,
  orienter,
  tournerD,
  tournerG,
} from '../../modules/2dLutin'
import { scratchblock } from '../../modules/scratchblock'

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

export const titre = 'Trouver le bon tracé avec Scratch'
export const dateDeModifImportante = '08/11/2026'
export const uuid = 'e9cac'

export const refs = {
  'fr-fr': ['6I1B-3'],
  'fr-2016': ['6I12'],
  'fr-ch': [],
}

const scratchSimulatorButtonAction = '6I1B-3:scratch-simulator-button'

/**
 * @author Jean-claude Lhote
 */
export default class AlgoTortue extends Exercice {
  // ça c'est la classe qui permet de créer cet exercice
  indiceBonneFigure!: number
  constructor() {
    super()
    this.exoCustomResultat = false
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup2 = 1 // types d'instructionsde déplacement (ici seulement avancer et tourner)
    this.listeAvecNumerotation = false
    this.besoinFormulaireTexte = [
      "Nombres d'instructions successives (entre 5 et 15) 16 pour le hasard",
      '',
    ]
  }

  nouvelleVersion(numeroExercice: number) {
    registerScratchSimulatorButton()
    // la méthode qui crée une nouvelle version de l'exercice
    this.cliqueFiguresArray = []
    this.autoCorrection[0] = {}
    const nbInstructions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 5,
      max: 15,
      defaut: 7,
      melange: 16,
      nbQuestions: 1,
    }).map(Number)
    const angleDepart = 90 // On choisit l'orientation de départ (On pourrait en faire un paramètre de l'exo)
    // const xDepart = 0 // Le départ est en (0,0) pour avoir la même marge dans toutes les directions
    // const yDepart = 0
    const objetsCorrection = []
    let paramsCorrection
    let paramsEnonces
    const sequences = [
      // séquences d'intruction pré-établies, on en choisit une parmi celles-ci
      [
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
      ],
      [
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
      ],
      [
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerG',
        'avancer',
      ],
      [
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
      ],
      [
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
      ],
      [
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
      ],
      [
        'avancer',
        'tournerG',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
      ],
      [
        'avancer',
        'tournerG',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
      ],
      [
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
      ],
      [
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerG',
        'avancer',
      ],
      [
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerD',
        'avancer',
      ],
      [
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
        'tournerG',
        'avancer',
        'tournerG',
        'avancer',
        'tournerD',
        'avancer',
      ],
    ]
    let erreursDeDeplacement = [0, 1, 0]

    erreursDeDeplacement = combinaisonListesSansChangerOrdre(
      erreursDeDeplacement,
      nbInstructions[0],
    )
    const choix = randint(0, 11) // On va choisir une des 12 sequences
    const commandes = combinaisonListesSansChangerOrdre(
      sequences[choix],
      nbInstructions[0],
    ) // on crée la succession de commandes en répétant la séquence choisie si le nombre d'instructions demandées dépasse la longueur de la séquence
    const val = []
    const lutins = []

    // Ici on crée 5 instances de l'objet Lutin.
    for (let i = 0; i < 5; i++) {
      lutins[i] = creerLutin()
      lutins[i].color = colorToLatexOrHTML('green') // la couleur de la trace
      lutins[i].epaisseur = 3 // son epaisseur
    }
    context.unitesLutinParCm = 40 // avancer de 10 pour le lutin lui fait parcourir 1cm (en fait 0,5cm car j'ai ajouté un scale=0.5 pour la sortie latex)
    context.pixelsParCm = 20 // 20 pixels d'écran représentent 1cm (enfin ça dépend du zoom, donc c'est juste un réglage par défaut)

    let texte = '' // la chaine qui va contenir l'énoncé
    let texteCorr = '' // la chaine qui va contenir la correction
    // On écrit le début du programme dans l'attribut codeScratch du lutins[0][0]... cet attribut de type chaine contient le code du programme du lutin en Scratch Latex
    // A chaque instruction ajoutée dans le programme correspond une action à effectuée sur l'objet lutins[0]..
    lutins[0].codeScratch =
      '\\begin{scratch}[print,fill,blocks,scale=0.75]\n \\blockinit{quand \\greenflag est cliqué}\n '
    lutins[0].codeScratch += `\\blockmove{s'orienter à \\ovalnum{${angleDepart}}}\n`
    lutins[0].codeScratch += "\\blockpen{stylo en position d'écriture}\n"
    for (let i = 0; i < 5; i++) {
      allerA(0, 0, lutins[i]) // ça c'est pour faire bouger le lutin (écrire le programme ne le fait pas exécuter !)
      baisseCrayon(lutins[i])
      orienter(angleScratchTo2d(angleDepart), lutins[i]) // l'angle 2d est l'angle trigonométrique... Scratch est décallé de 90°, il faut donc convertir pour utiliser Orienter()
    }
    for (let i = 0; i < nbInstructions[0]; i++) {
      // On va parcourir la listes des commandes de déplacement mais certains lutins font des erreurs
      switch (commandes[i]) {
        case 'avancer':
          val[i] = randint(1, 4) * 20 // La longueur du déplacement est 10, 20, 30 ou 40
          lutins[0].codeScratch += `\\blockmove{avancer de \\ovalnum{${val[i]}} pas}\n`
          avance(val[i], lutins[0])
          avance(val[i], lutins[1])
          avance(val[i], lutins[2])
          avance(val[i], lutins[3])
          avance(val[i] + 20 * erreursDeDeplacement[i], lutins[4]) // avance trop
          break
        case 'tournerD': // On peut difficilement choisir autre chose que de tourner de 90°...
          lutins[0].codeScratch +=
            '\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}\n'
          tournerD(90, lutins[0])
          tournerD(180, lutins[2])
          orienter(90, lutins[4])
          tournerG(90, lutins[1]) // tournent dans le mauvais sens
          tournerG(90, lutins[3])
          break
        case 'tournerG':
          lutins[0].codeScratch +=
            '\\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}\n'
          tournerG(90, lutins[0])
          tournerG(90, lutins[1])
          tournerG(90, lutins[4])
          tournerD(90, lutins[2]) // tournent dans le mauvais sens
          tournerD(90, lutins[3])
          break
      }
    }
    lutins[0].codeScratch += '\\blockpen{relever le stylo}\n'

    let largeur = 1
    let hauteur = 1
    for (let i = 0; i < 5; i++) {
      // on calcule la largeur et la hauteur maximale des parcours.
      leveCrayon(lutins[i])
      largeur = Math.max(largeur, lutins[i].xMax - lutins[i].xMin)
      hauteur = Math.max(hauteur, lutins[i].yMax - lutins[i].yMin)
    }
    largeur++
    lutins[0].codeScratch += '\\end{scratch}'
    texte =
      "Quelle figure est tracée par le stylo à l'exécution du programme ci-dessous ?<br>Un carreau représente $20$ pas.<br>Le tracé démarre à la croix bleue.<br>"
    texte +=
      "S'orienter à $90^\\circ$ signifie s'orienter vers la droite de l'écran.<br>"

    if (context.isHtml) {
      // On crée 2 colonnes selon le contexte html / Latex
      texte += '<table style="width: 100%"><tr><td>'
    } else {
      texte += '\\begin{minipage}[t]{.25\\textwidth}'
    }
    texte += scratchblock(lutins[0].codeScratch) // la fonction scratchblock va convertir le code Latex en code html si besoin.
    if (context.isHtml) {
      // on change de colonne...
      texte += '</td><td style="vertical-align: top; text-align: center">'
      texte += this.interactif
        ? `${texteGras('Cliquer sur la figure puis vérifier la réponse.')}<br><br>`
        : '<br><br>'
    } else {
      texte += '\\end{minipage} '
      texte += '\\hfill \\begin{minipage}[t]{.70\\textwidth}'
    }

    let ordreLutins = [0, 1, 2, 3, 4]
    ordreLutins = shuffle(ordreLutins) // On mélange les emplacements pour éviter d'avoir la bonne réponse au même endroit
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < lutins[i].listeTraces.length; j++) {
        // On recadre les traces des lutins...
        lutins[i].listeTraces[j][0] -= lutins[i].xMin
        lutins[i].listeTraces[j][2] -= lutins[i].xMin
        lutins[i].listeTraces[j][1] -= lutins[i].yMin
        lutins[i].listeTraces[j][3] -= lutins[i].yMin
      }
    }
    const depart = []
    for (let i = 0; i < 5; i++) {
      // ajouter le point de départ de chaque tracé
      depart[i] = tracePoint(
        pointAbstrait(lutins[i].listeTraces[0][0], lutins[i].listeTraces[0][1]),
      )
      depart[i].taille = 5
      depart[i].color = colorToLatexOrHTML(bleuMathalea)
      depart[i].epaisseur = 2
      if (i === 0) {
        objetsCorrection.push(depart[0])
      }
    }
    const echelle = segment(0, hauteur + 0.5, 1, hauteur + 0.5)
    echelle.epaisseur = 2
    echelle.styleExtremites = '|-|'
    objetsCorrection.push(
      grille(-1, -1, largeur + 1, hauteur + 1, 'gray', 0.5, 0.5),
    )
    objetsCorrection.push(lutins[0])

    // mathalea2d() est la fonction qui ajoute soit une figure SVG (en html), soit une figure tikz en Latex. Ici, juste la grille est le point de départ.
    for (let i = 0; i < 5; i++) {
      paramsEnonces = {
        xmin: -0.5,
        ymin: -1.5,
        xmax: largeur,
        ymax: hauteur + 1,
        pixelsParCm: Math.round(100 / largeur),
        scale: 2.5 / largeur,
        zoom: 1,
        display: 'inline-block' as const,
        id: `cliquefigure${i}Ex${numeroExercice}Q0`,
      }
      paramsCorrection = {
        xmin: -0.5,
        ymin: -0.5,
        xmax: largeur,
        ymax: hauteur + 1,
        pixelsParCm: Math.round(100 / largeur),
        scale: 2.5 / largeur,
      }
      texte += mathalea2d(
        paramsEnonces,
        lutins[ordreLutins[i]],
        depart[ordreLutins[i]],
        grille(-0.5, -0.5, largeur, hauteur + 1, 'gray', 0.5, 0.5),
        texteParPoint(
          '40 pas',
          pointAbstrait(0.5, hauteur + 0.2),
          0,
          'black',
          1,
        ),
        texteParPoint(
          `figure ${i + 1}`,
          pointAbstrait((largeur - 0.5) / 2, -0.8),
          0,
          'black',
          1,
        ),
        echelle,
      )
      if (!context.isHtml) {
        texte += '\\ \\hfill '
      }
    }
    if (context.isHtml) {
      texte += '</td></tr></table>'
      texte += `<div id="resultatCheckEx${this.numeroExercice}Q${0}"></div>`
    } else {
      texte += '\\end{minipage} '
    }
    if (this.interactif) {
      texte += ajouteFeedback(this, 0)
    }

    this.indiceBonneFigure = ordreLutins.indexOf(0)
    this.autoCorrection[0] = {
      enonce: texte,
      propositions: [
        {
          texte: 'figure 1',
          statut: false,
        },
        {
          texte: 'figure 2',
          statut: false,
        },
        {
          texte: 'figure 3',
          statut: false,
        },
        {
          texte: 'figure 4',
          statut: false,
        },
        {
          texte: 'figure 5',
          statut: false,
        },
      ],
      options: { ordered: true },
    }
    if (this.autoCorrection[0]?.propositions?.[this.indiceBonneFigure]) {
      this.autoCorrection[0].propositions[this.indiceBonneFigure].statut = true
    }
    this.autoCorrection[0].formatInteractif = 'clique-figure'

    this.cliqueFiguresArray[0] = [
      {
        id: `cliquefigure0Ex${this.numeroExercice}Q0`,
        solution: ordreLutins.indexOf(0) === 0,
      },
      {
        id: `cliquefigure1Ex${numeroExercice}Q0`,
        solution: ordreLutins.indexOf(0) === 1,
      },
      {
        id: `cliquefigure2Ex${numeroExercice}Q0`,
        solution: ordreLutins.indexOf(0) === 2,
      },
      {
        id: `cliquefigure3Ex${numeroExercice}Q0`,
        solution: ordreLutins.indexOf(0) === 3,
      },
      {
        id: `cliquefigure4Ex${numeroExercice}Q0`,
        solution: ordreLutins.indexOf(0) === 4,
      },
    ]

    // Ici, la figure contient la grille, le point de départ et la trace finale.
    // Le simulateur Scratch s'ouvre automatiquement en modale quand il est inséré :
    // on ne le crée donc qu'au clic sur le bouton ci-dessous.
    texteCorr += `La bonne figure est la figure ${texteEnCouleurEtGras(this.indiceBonneFigure + 1)}.<br>
    ${DomReadyActionElement.create({
      action: scratchSimulatorButtonAction,
      payload: { codeScratch: lutins[0].codeScratch },
    })}`

    texteCorr += mathalea2d(paramsCorrection, objetsCorrection)
    if (this.interactif && context.isHtml) texte += addCliqueFigure(this, 0)
    this.listeQuestions.push(texte) // on met à jour la liste des questions
    this.listeCorrections.push(texteCorr) // et la liste des corrections

    listeQuestionsToContenuSansNumero(this) // on envoie tout à la fonction qui va mettre en forme.
  }
}

let scratchSimulatorButtonRegistered = false

function registerScratchSimulatorButton() {
  if (scratchSimulatorButtonRegistered) return
  scratchSimulatorButtonRegistered = true
  DomReadyActionElement.registerCallback<{
    codeScratch: string
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
        1000,
        false,
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
