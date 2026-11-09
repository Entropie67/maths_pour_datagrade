import { addCliqueFigure } from '../../lib/customElements/CliqueFigureElement'
import { miseEnEvidence } from '../../lib/outils/embellissements'
// on importe les fonctions nécessaires.
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
// Ici ce sont les fonctions de la librairie maison 2d.js qui gèrent tout ce qui est graphique (SVG/tikz) et en particulier ce qui est lié à l'objet lutin
import { createScratchSimulatorElement } from '@scratch2latex/scratch-core/ScratchSimulator'
import { bleuMathalea } from '../../lib/colors'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
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
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Programmer la tortue Scratch avec des répétitions'
export const dateDeModifImportante = '08/11/2026'
export const dateDePublication = '29/06/2021'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '8ded2'

export const refs = {
  'fr-fr': ['4I1-2'],
  'fr-ch': [],
}

const scratchSimulatorButtonAction = '4I1-2:scratch-simulator-button'

export default class AlgoTortue extends Exercice {
  // ça c'est la classe qui permet de créer cet exercice
  indiceBonneFigure: number
  constructor() {
    super() // la classe parente qui définit les attributs commun à tous les exercices
    registerScratchSimulatorButton()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = [
      'Type de figure',
      5,
      '1 : Polygone régulier\n2 : Spirale\n3 : Rosace\n4 : Roue dentée\n5 : Frise\n6 : Au hasard',
    ]
    this.sup = 6
    this.besoinFormulaire2Numerique = [
      "Délai de l'animation (en ms)",
      4,
      '1 : 0ms\n2 : 200ms\n3 : 1000ms\n4 : 2000ms',
    ]
    this.sup2 = 2
    this.typeExercice = 'Scratch'
    this.listeAvecNumerotation = false
    this.indiceBonneFigure = 0
  }

  nouvelleVersion(numeroExercice: number) {
    // la méthode qui crée une nouvelle version de l'exercice
    this.cliqueFiguresArray = []
    const objetsCorrection = []
    this.autoCorrection[0] = {}
    const figuresDisponibles = [
      'polygonesReguliers',
      'spirales',
      'rosaces1',
      'roueDentee',
      'frise1',
    ]
    const delay =
      this.sup2 === 1
        ? 0
        : this.sup2 === 2
          ? 200
          : this.sup2 === 3
            ? 1000
            : 2000
    const choix =
      this.sup < 6
        ? figuresDisponibles[this.sup - 1]
        : choice(figuresDisponibles)
    let val1, val2, val3, n, n2
    const sens = choice(['turnright', 'turnleft'])
    let sequenceFrise1
    let sensOppose
    if (sens === 'turnright') {
      sensOppose = 'turnleft'
    } else {
      sensOppose = 'turnright'
    }
    const lutins = []
    const bonneReponse = randint(0, 3)
    const angleDepart = 90 // On choisit l'orientation de départ
    const xDepart = 0 // Le départ est en (0,0) pour avoir la même marge dans toutes les directions
    const yDepart = 0 // Mais on pourrait envisager de changer ça et de recadrer...
    context.unitesLutinParCm = 10 // avancer de 10 pour le lutin lui fait parcourir 1cm (en fait 0,5cm car j'ai ajouté un scale=0.5 pour la sortie latex)
    context.pixelsParCm = 20 // 20 pixels d'écran représentent 1cm (enfin ça dépend du zoom, donc c'est juste un réglage par défaut)

    let texteCorr = '' // la chaine qui va contenir la correction

    for (let i = 0; i < 4; i++) {
      // Ici on crée 4 instance de l'objet Lutin.
      lutins[i] = creerLutin()
      lutins[i].color = colorToLatexOrHTML('green') // la couleur de la trace
      lutins[i].epaisseur = 3 // son epaisseur
      lutins[i].pointilles = 0 // le type de pointillés (on peut mettre false pour avoir un trait plein)
      allerA(xDepart, yDepart, lutins[i]) // ça c'est pour faire bouger le lutin (écrire le programme ne le fait pas exécuter !)
      baisseCrayon(lutins[i]) // à partir de là, le lutin laissera une trace (ses positions successives sont enregistrées dans lutin.listeTraces)
      orienter(angleScratchTo2d(angleDepart), lutins[i]) // l'angle 2d est l'angle trigonométrique... Scratch est décallé de 90°, il faut donc convertir pour utiliser Orienter()
    }
    // On écrit le début du programme dans l'attribut codeScratch du lutin... cet attribut de type chaine contient le code du programme du lutin en Scratch Latex
    // A chaque instruction ajoutée dans le programme correspond une action à effectuée sur l'objet lutin..
    lutins[0].codeScratch =
      '\\begin{scratch}[print,fill,blocks,scale=0.75]\n \\blockinit{quand \\greenflag est cliqué}\n '
    lutins[0].codeScratch += `\\blockmove{aller à x: \\ovalnum{${xDepart}} y: \\ovalnum{${yDepart}}}\n ` // ça c'est pour ajouter la brique scratch
    lutins[0].codeScratch += `\\blockmove{s'orienter à \\ovalnum{${angleDepart}}}\n `
    lutins[0].codeScratch += "\\blockpen{stylo en position d'écriture}\n "
    switch (choix) {
      case 'polygonesReguliers':
        n = choice([3, 5, 6, 7, 8]) // Nombre de côtés
        val1 = arrondi(360 / n, 1)
        val2 = (10 - n) * 20
        if (bonneReponse !== 3) {
          lutins[0].codeScratch += `\\blockrepeat{répéter \\ovalnum{${n}} fois}
{
\\blockmove{avancer de \\ovalnum{${val2}} pas}\n`
        } else {
          lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${val1}} degrés}
\\blockrepeat{répéter \\ovalnum{${n - 1}} fois}
{
\\blockmove{avancer de \\ovalnum{${val2}} pas}
\n`
        }
        if (bonneReponse === 0 || bonneReponse === 3) {
          lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${val1}} degrés}
}\n`
        } else {
          if (bonneReponse === 1) {
            lutins[0].codeScratch += `\\blockmove{tourner \\${sensOppose}{} de \\ovalnum{${val1}} degrés}
}\n`
          } else {
            if (val1 !== 90) {
              lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${180 - val1}} degrés}
}\n`
            } else {
              lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${val1}} degrés}
              \\blockmove{avancer de \\ovalnum{${val2}} pas}\n
              \\blockmove{tourner \\${sens}{} de \\ovalnum{${val1}} degrés}
}\n`
            }
          }
        }
        orienter(-90, lutins[2])
        for (let i = 0; i < n; i++) {
          avance(val2, lutins[0])
          avance(val2, lutins[1])
          avance(val2, lutins[2])
          if (i !== 0) avance(val2, lutins[3])

          if (sens === 'turnright') {
            tournerD(val1, lutins[0])
            tournerD(val1, lutins[3])
            tournerG(val1, lutins[1])
            if (val1 !== 90) {
              tournerD(180 - val1, lutins[2])
            } else {
              tournerD(val1, lutins[2])
              avance(val2, lutins[2])
              tournerD(val1, lutins[2])
            }
          } else {
            tournerG(val1, lutins[0])
            tournerG(val1, lutins[3])
            tournerD(val1, lutins[1])
            if (val1 !== 90) {
              tournerG(180 - val1, lutins[2])
            } else {
              tournerG(val1, lutins[2])
              avance(val2, lutins[2])
              tournerG(val1, lutins[2])
            }
          }
        }
        break
      case 'rosaces1':
        n = choice([3, 4, 5, 6, 8]) // Nombre branches
        n2 = randint(3, 6, 5)
        val1 = 20 + randint(2, 4) * 10
        val2 = (10 - n) * 5
        val3 = (8 - n2) * 4
        lutins[0].codeScratch += `\\blockrepeat{répéter \\ovalnum{${n}} fois} \n{`
        if (bonneReponse < 2) {
          lutins[0].codeScratch +=
            '\\blockmove{aller à x: \\ovalnum{0} y: \\ovalnum{0}}\n'
        }
        if (bonneReponse % 2 === 0) {
          lutins[0].codeScratch += `\\blockmove{avancer de \\ovalnum{${val1}} pas}\n`
        } else {
          if (bonneReponse === 1) {
            lutins[0].codeScratch += `\\blockmove{avancer de \\ovalnum{${val1 / 2}} pas}\n`
          } else {
            lutins[0].codeScratch += `\\blockmove{avancer de \\ovalnum{${val1 + 2}} pas}\n`
          }
        }
        switch (bonneReponse) {
          case 0:
            lutins[0].codeScratch += `\\blockmove{tourner \\turnright{} de \\ovalnum{${90 - 180 / n2}} degrés}\n`
            break
          case 1:
            lutins[0].codeScratch +=
              '\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}\n'
            break
          case 2:
            lutins[0].codeScratch +=
              '\\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}\n'
            break
        }
        lutins[0].codeScratch += `\\blockrepeat{répéter \\ovalnum{${n2}} fois}
        {
          \\blockmove{avancer de \\ovalnum{${val3}} pas}
          \\blockmove{tourner \\turnleft{} de \\ovalnum{${360 / n2}} degrés}
        }\n`
        switch (bonneReponse) {
          case 0:
            lutins[0].codeScratch += `\\blockmove{tourner \\turnleft{} de \\ovalnum{${90 - 180 / n2}} degrés}\n`
            break
          case 1:
            lutins[0].codeScratch +=
              '\\blockmove{tourner \\turnleft{} de \\ovalnum{90} degrés}\n'
            break
          case 2:
            lutins[0].codeScratch +=
              '\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}\n'
            break
          case 3:
            lutins[0].codeScratch +=
              '\\blockmove{tourner \\turnright{} de \\ovalnum{180} degrés}\n'
            break
        }
        lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${360 / n}} degrés}\n}\n`

        for (let i = 0; i < n; i++) {
          allerA(0, 0, lutins[0])
          allerA(0, 0, lutins[1])
          avance(val1, lutins[0])
          avance(val1 / 2, lutins[1])
          avance(val1, lutins[2])
          avance(val1 + 2, lutins[3])
          tournerD(90 - 180 / n2, lutins[0])
          tournerD(90, lutins[1])
          tournerG(90, lutins[2])
          for (let j = 0; j < n2; j++) {
            avance(val3, lutins[0])
            avance(val3, lutins[1])
            avance(val3, lutins[2])
            avance(val3, lutins[3])
            tournerG(360 / n2, lutins[0])
            tournerG(360 / n2, lutins[1])
            tournerG(360 / n2, lutins[2])
            tournerG(360 / n2, lutins[3])
          }
          tournerG(90 - 180 / n2, lutins[0])
          tournerG(90, lutins[1])
          tournerD(90, lutins[2])
          tournerD(180, lutins[3])
          if (sens === 'turnright') {
            tournerD(360 / n, lutins[0])
            tournerD(360 / n, lutins[1])
            tournerD(360 / n, lutins[2])
            tournerD(360 / n, lutins[3])
          } else {
            tournerG(360 / n, lutins[0])
            tournerG(360 / n, lutins[1])
            tournerG(360 / n, lutins[2])
            tournerG(360 / n, lutins[3])
          }
        }
        break
      case 'spirales':
        n = choice([3, 4, 5, 6, 8]) // Nombre de côtés
        n2 = randint(1, 4) + Math.floor((9 - n) / 2)
        val1 = 20 + randint(1, 4) * 5
        val2 = 80 + randint(0, 4) * 5
        val3 = 360 / n

        if (bonneReponse !== 2) {
          lutins[0].codeScratch += `\\blockvariable{mettre \\selectmenu*{longueur} à \\ovalnum{${val1}}}
          \\blockrepeat{répéter jusqu'à ce que \\booloperator{\\ovalvariable{longueur}>\\ovalnum{${val2}}}}
          {
          \\blockmove{avancer de \\ovalvariable{longueur} pas}\n`
        } else {
          lutins[0].codeScratch += `\\blockvariable{mettre \\selectmenu*{longueur} à \\ovalnum{${val2}}}
          \\blockrepeat{répéter jusqu'à ce que \\booloperator{\\ovalvariable{longueur}<\\ovalnum{${val1}}}}
          {
          \\blockmove{avancer de \\ovalvariable{longueur} pas}\n`
        }
        if (bonneReponse % 2 === 0) {
          // les lutins 0 et 2 tournent normalement
          lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${val3}} degrés}\n`
        } else {
          if (bonneReponse === 1) {
            if (sens === 'turnright') {
              // Le lutin 1 tourne dans le mauvais sens
              lutins[0].codeScratch += `\\blockmove{tourner \\turnleft{} de \\ovalnum{${val3}} degrés}\n`
            } else {
              lutins[0].codeScratch += `\\blockmove{tourner \\turnright{} de \\ovalnum{${val3}} degrés}\n`
            }
          } else {
            // le lutin 3 ne tourne pas assez
            lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${val3 - 10}} degrés}\n`
          }
        }
        if (bonneReponse === 2) {
          lutins[0].codeScratch += `\\blockvariable{ajouter \\ovalnum{${-n2}} à \\ovalvariable{longueur}}\n`
          lutins[0].codeScratch += '}\n'
        } else {
          lutins[0].codeScratch += `\\blockvariable{ajouter \\ovalnum{${n2}} à \\ovalvariable{longueur}}\n`
          lutins[0].codeScratch += '}\n'
        }
        for (let i = val1; i < val2; i += n2) {
          avance(i, lutins[0])
          avance(i, lutins[1]) // Le lutin 1 tourne dans le mauvais sens
          avance(i, lutins[3]) // le lutin2 ne tourne pas assez
          if (sens === 'turnright') {
            tournerD(val3, lutins[0])
            tournerG(val3, lutins[1])
            tournerD(val3 - 10, lutins[3])
          } else {
            tournerG(val3, lutins[0])
            tournerD(val3, lutins[1])
            tournerG(val3 - 10, lutins[3])
          }
        }
        for (let i = val2; i > val1; i -= n2) {
          avance(i, lutins[2]) // Le lutin2 diminue la logneur de ses déplacements
          if (sens === 'turnright') {
            tournerD(val3, lutins[2])
          } else {
            tournerG(val3, lutins[2])
          }
        }
        break
      case 'roueDentee':
        n = choice([3, 4, 5, 6, 8]) // Nombre de côtés
        val1 = randint(2, 4) * 10
        val2 = 180 / n
        val3 = 360 / n

        if (bonneReponse < 5) {
          lutins[0].codeScratch += `\\blockrepeat{répéter \\ovalnum{${n}} fois}
                                  {
                                  \\blockmove{avancer de \\ovalnum{${val1}} pas}\n`
          if (bonneReponse < 2) {
            lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${val3}} degrés}\n`
          } else {
            lutins[0].codeScratch += `\\blockmove{tourner \\${sensOppose}{} de \\ovalnum{${val3}} degrés}\n`
          }
          lutins[0].codeScratch += `\\blockmove{avancer de \\ovalnum{${val1 * 2}} pas}\n`
          if (bonneReponse === 0) {
            lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${val2}} degrés}\n`
          } else {
            lutins[0].codeScratch += `\\blockmove{tourner \\${sensOppose}{} de \\ovalnum{${val2}} degrés}\n`
          }
          if (bonneReponse < 3) {
            lutins[0].codeScratch += `\\blockmove{avancer de \\ovalnum{${val1 * 2}} pas}\n`
          } else {
            lutins[0].codeScratch += `\\blockmove{avancer de \\ovalnum{${val1}} pas}\n`
          }
          if (bonneReponse > 0) {
            lutins[0].codeScratch += `\\blockmove{tourner \\${sens}{} de \\ovalnum{${val2}} degrés}\n`
          } else {
            lutins[0].codeScratch += `\\blockmove{tourner \\${sensOppose}{} de \\ovalnum{${val2}} degrés}\n`
          }
          lutins[0].codeScratch += '}\n'
        }
        for (let i = 0; i < n; i++) {
          avance(val1, lutins[0])
          avance(val1, lutins[1])
          avance(val1, lutins[2])
          avance(val1, lutins[3])
          if (sens === 'turnright') {
            tournerD(val3, lutins[0])
            tournerD(val3, lutins[1])
            tournerG(val3, lutins[2])
            tournerG(val3, lutins[3])
          } else {
            tournerG(val3, lutins[0])
            tournerG(val3, lutins[1])
            tournerD(val3, lutins[2])
            tournerD(val3, lutins[3])
          }
          avance(val1 * 2, lutins[0])
          avance(val1 * 2, lutins[1])
          avance(val1 * 2, lutins[2])
          avance(val1 * 2, lutins[3])
          if (sens === 'turnright') {
            tournerD(val2, lutins[0])
            tournerG(val2, lutins[1])
            tournerG(val2, lutins[2])
            tournerG(val2, lutins[3])
          } else {
            tournerG(val2, lutins[0])
            tournerD(val2, lutins[1])
            tournerD(val2, lutins[2])
            tournerD(val2, lutins[3])
          }
          avance(val1 * 2, lutins[0])
          avance(val1 * 2, lutins[1])
          avance(val1 * 2, lutins[2])
          avance(val1, lutins[3])
          if (sens === 'turnright') {
            tournerG(val2, lutins[0])
            tournerD(val2, lutins[1])
            tournerD(val2, lutins[2])
            tournerD(val2, lutins[3])
          } else {
            tournerD(val2, lutins[0])
            tournerG(val2, lutins[1])
            tournerG(val2, lutins[2])
            tournerG(val2, lutins[3])
          }
        }
        break
      case 'frise1':
        n = 4 // Nombre de répétitions
        n2 = choice([45, 60, 90])
        n2 = choice([45, 60, 90])
        val1 = randint(1, 2) * 10
        val2 = randint(1, 3) * 10
        val3 = randint(2, 4) * 10
        sequenceFrise1 = [
          [`\\blockmove{avancer de \\ovalnum{${val2}} pas}\n`, val2],
          [
            `\\blockmove{tourner \\${sens}{} de \\ovalnum{${n2}} degrés}\n`,
            sens,
            n2,
          ],
          [`\\blockmove{avancer de \\ovalnum{${val1}} pas}\n`, val1],
          [
            `\\blockmove{tourner \\${sens}{} de \\ovalnum{${n2}} degrés}\n`,
            sens,
            n2,
          ],
          [`\\blockmove{avancer de \\ovalnum{${val1}} pas}\n`, val1],
          [
            `\\blockmove{tourner \\${sensOppose}{} de \\ovalnum{${n2}} degrés}\n`,
            sensOppose,
            n2,
          ],
          [`\\blockmove{avancer de \\ovalnum{${val1}} pas}\n`, val1],
          [
            `\\blockmove{tourner \\${sensOppose}{} de \\ovalnum{${n2}} degrés}\n`,
            sensOppose,
            n2,
          ],
          [`\\blockmove{avancer de \\ovalnum{${val3}} pas}\n`, val3],
          [
            `\\blockmove{tourner \\${sensOppose}{} de \\ovalnum{${n2}} degrés}\n`,
            sensOppose,
            n2,
          ],
          [`\\blockmove{avancer de \\ovalnum{${val2}} pas}\n`, val2],
          [
            `\\blockmove{tourner \\${sens}{} de \\ovalnum{${n2}} degrés}\n`,
            sens,
            n2,
          ],
        ]
        lutins[0].codeScratch += `\\blockrepeat{répéter \\ovalnum{${n}} fois}
{\n`
        for (let i = 0; i < 6; i++) {
          lutins[0].codeScratch +=
            sequenceFrise1[(2 * (bonneReponse + i)) % 12][0]
          lutins[0].codeScratch +=
            sequenceFrise1[(2 * (bonneReponse + i) + 1) % 12][0]
        }
        lutins[0].codeScratch += '}\n'
        for (let k = 0; k < n; k++) {
          for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
              avance(Number(sequenceFrise1[(2 * (j + i)) % 12][1]), lutins[j])
              if (sequenceFrise1[(2 * (j + i) + 1) % 12][1] === 'turnright') {
                tournerD(
                  Number(sequenceFrise1[(2 * (j + i) + 1) % 12][2]),
                  lutins[j],
                )
              } else {
                tournerG(
                  Number(sequenceFrise1[(2 * (j + i) + 1) % 12][2]),
                  lutins[j],
                )
              }
            }
          }
        }
        break
    }
    lutins[0].codeScratch += '\\blockpen{relever le stylo}\n'
    lutins[0].codeScratch += '\\end{scratch}'
    let texte =
      `Quelle figure est tracée par le stylo à l'exécution du programme ci-dessous${sp()}?<br>Le tracé démarre à la croix bleue.<br>`
    texte +=
      "S'orienter à $90^\\circ$ signifie s'orienter vers la droite de l'écran.<br>"

    let largeur = 1
    let hauteur = 1
    for (let i = 0; i < 4; i++) {
      // on calcule la largeur et la hauteur maximale des parcours.
      leveCrayon(lutins[i])
      largeur = Math.max(largeur, lutins[i].xMax - lutins[i].xMin)
      hauteur = Math.max(hauteur, lutins[i].yMax - lutins[i].yMin)
    }
    largeur = Math.round(largeur + 1.5)

    if (context.isHtml) {
      // On crée 2 colonnes selon le contexte html / Latex
      texte += '<table style="width: 100%"><tr><td>'
    } else {
      texte += '\\begin{minipage}[b]{.25\\textwidth}'
    }
    texte += scratchblock(lutins[0].codeScratch) // la fonction scratchblock va convertir le code Latex en code html si besoin.
    if (context.isHtml) {
      // on change de colonne...
      texte += '</td><td>'
      texte += '    '
      texte += '</td><td style="vertical-align: top; text-align: center">'
    } else {
      texte += '\\end{minipage} '
      texte += '\\hfill \\begin{minipage}[b]{.74\\textwidth}'
    }

    let ordreLutins = [0, 1, 2, 3]
    ordreLutins = shuffle(ordreLutins) // On mélange les emplacements pour éviter d'avoir la bonne réponse au même endroit-

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < lutins[i].listeTraces.length; j++) {
        // On recadre les traces des lutins...
        lutins[i].listeTraces[j][0] -= Math.floor(lutins[i].xMin)
        lutins[i].listeTraces[j][2] -= Math.floor(lutins[i].xMin)
        lutins[i].listeTraces[j][1] -= Math.floor(lutins[i].yMin)
        lutins[i].listeTraces[j][3] -= Math.floor(lutins[i].yMin)
      }
    }
    const depart = []
    for (let i = 0; i < 4; i++) {
      // ajouter le point de départ de chaque tracé
      depart[i] = tracePoint(
        pointAbstrait(lutins[i].listeTraces[0][0], lutins[i].listeTraces[0][1]),
      )
      depart[i].taille = 5
      depart[i].color = colorToLatexOrHTML(bleuMathalea)
      depart[i].epaisseur = 2
      if (i === bonneReponse) {
        objetsCorrection.push(depart[i])
      }
    }
    const echelle = segment(0, hauteur + 0.5, 1, hauteur + 0.5)
    echelle.epaisseur = 2
    echelle.styleExtremites = '|-|'
    objetsCorrection.push(lutins[bonneReponse])
    const paramsEnonces = {
      xmin: -0.5,
      ymin: -1.5,
      xmax: largeur,
      ymax: hauteur + 1,
      pixelsParCm: Math.round(200 / largeur),
      scale: 4 / largeur,
      display: 'inline-block' as const,
    }
    const paramsCorrection = {
      xmin: -0.5,
      ymin: -1.5,
      xmax: largeur,
      ymax: hauteur + 1,
      pixelsParCm: Math.round(200 / largeur),
      scale: 4 / largeur,
      display: 'inline-block' as const,
    }

    // mathalea2d() est la fonction qui ajoute soit une figure SVG (en html), soit une figure tikz en Latex. Ici, juste la grille est le point de départ.
    for (let i = 0; i < 4; i++) {
      const param = {
        ...paramsEnonces,
        id: `cliquefigure${i}Ex${numeroExercice}Q0`,
      }
      texte += mathalea2d(
        param,
        lutins[ordreLutins[i]],
        depart[ordreLutins[i]],
        texteParPoint(
          `figure ${i + 1}`,
          pointAbstrait(
            (lutins[ordreLutins[i]].xMax - lutins[ordreLutins[i]].xMin) / 2,
            -0.8,
          ),
          0,
          'black',
          1,
        ),
      )
      if (i === 1) texte += '<br>'
    }
    if (context.isHtml) {
      texte += '</td></tr></table>'
    } else {
      texte += '\\end{minipage} '
    }
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
      ],
      options: { ordered: true },
    }
    this.autoCorrection[0].propositions![
      ordreLutins.indexOf(bonneReponse)
    ].statut = true
    this.autoCorrection[0].formatInteractif = 'clique-figure'
    this.indiceBonneFigure = ordreLutins.indexOf(bonneReponse)
    // Ici, la figure contient la grille, le point de départ et le lutin qui s'anime sur sa trace...
    texteCorr += `La bonne figure est la figure $${miseEnEvidence(this.indiceBonneFigure + 1)}$.<br>
    ${
      context.isHtml
        ? DomReadyActionElement.create({
            action: scratchSimulatorButtonAction,
            payload: {
              codeScratch: lutins[0].codeScratch,
              delai: delay,
              insertProgramme: false,
            },
          })
        : ''
    }`
    if (this.interactif && context.isHtml) {
      texte += `<span id="resultatCheckEx${this.numeroExercice}Q0"></span>`
    }
    this.cliqueFiguresArray[0] = [
      {
        id: `cliquefigure0Ex${this.numeroExercice}Q0`,
        solution: ordreLutins.indexOf(bonneReponse) === 0,
      },
      {
        id: `cliquefigure1Ex${numeroExercice}Q0`,
        solution: ordreLutins.indexOf(bonneReponse) === 1,
      },
      {
        id: `cliquefigure2Ex${numeroExercice}Q0`,
        solution: ordreLutins.indexOf(bonneReponse) === 2,
      },
      {
        id: `cliquefigure3Ex${numeroExercice}Q0`,
        solution: ordreLutins.indexOf(bonneReponse) === 3,
      },
    ]
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
