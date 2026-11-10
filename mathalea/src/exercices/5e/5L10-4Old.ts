import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  AddTabPropMathlive,
  type Icell,
} from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Produire une formule à partir d'un tableau"
export const interactifReady = true

export const dateDeModifImportante = '05/05/2026'

/**
 * * Traduire la dépendance entre deux grandeurs par un tableau de valeurs et produire une formule.
 * @author Sébastien Lozano
 * Éric Elter : Refactorisation, passage en TS et en interactif le 05/05/2026
 */

export const uuid = '7aba6'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

// une fonction pour moduler l'affichage d'une étape dans la correction
function etapeCorrective(str: string, sup: number) {
  return sup === 1 ? '' : str
}

export default class TableauxEtFonctionOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Les mêmes unités\n2 : Unités différentes',
    ]

    this.sup = 1
    this.nbQuestions = 1

    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const L1 = randint(3, 7)
      const L2 = L1 + 1
      const L3 = L2 * 2
      const L4 = L2 * 3

      const coteInconnu = choice(['L'])
      let coteInconnuCorr
      let coteInconnuCorrNum
      const coteConnu: number = randint(3, 7)

      let unites
      let grandL: string[] = ['', '', '', '']
      let grandLNum: number[] = [0, 0, 0, 0]
      let petitL = ''
      let petitLNum = 0
      let unitegrandL
      let unitepetitL
      let txtCorr
      if (this.sup === 1) {
        // même unités
        unites = choice([
          ['\\text{cm}', '\\text{cm}'],
          ['\\text{m}', '\\text{m}'],
        ])
        grandL = [`${L1}`, `${L2}`, `${L3}`, `${L4}`]
        grandLNum = [L1, L2, L3, L4]
        petitL = `${coteConnu}`
        petitLNum = coteConnu
        unitegrandL = unites[0]
        unitepetitL = unites[1]
        coteInconnuCorr = coteInconnu
        coteInconnuCorrNum = '2' + coteInconnu
        txtCorr =
          "Les unités sont les mêmes, donc il n'est pas nécessaire de convertir."
      } else {
        // unités différentes
        unites = choice([
          ['\\text{cm}', '\\text{m}'],
          ['\\text{m}', '\\text{cm}'],
        ])
        if (unites[0] === '\\text{cm}') {
          grandL = [`${L1}`, `${L2}`, `${L3}`, `${L4}`]
          grandLNum = [L1, L2, L3, L4]
          petitL = `${coteConnu}\\times 100`
          petitLNum = 100 * coteConnu
          unitegrandL = unites[0]
          unitepetitL = unites[0]
          coteInconnuCorr = coteInconnu
          coteInconnuCorrNum = '2' + coteInconnu
        } else {
          // if (unites[0] === '\\text{m}') {
          grandL = [
            `${L1}\\times 100`,
            `${L2}\\times 100`,
            `${L3}\\times 100`,
            `${L4}\\times 100`,
          ]
          grandLNum = [L1 * 100, L2 * 100, L3 * 100, L4 * 100]
          petitL = `${coteConnu}`
          petitLNum = coteConnu
          unitegrandL = unites[1]
          unitepetitL = unites[1]
          coteInconnuCorr = coteInconnu + '\\times 100'
          coteInconnuCorrNum = '200' + coteInconnu
        }
        txtCorr =
          'Les unités sont différentes. Donc, pour plus de confort, nous pouvons les convertir dans la même unité, ici en cm.'
      }

      // on prépare la fenetre mathalea2d
      const fenetreMathalea2D = {
        xmin: -5,
        ymin: -3,
        xmax: 5,
        ymax: 3,
        pixelsParCm: 20,
        scale: 0.5,
      }
      const A = pointAbstrait(-4, 2)
      const B = pointAbstrait(-4, -2)
      const C = pointAbstrait(4, -2)
      const D = pointAbstrait(4, 2)
      const mesAppels = [polygone(A, B, C, D)]
      const figure = mathalea2d(fenetreMathalea2D, mesAppels)

      const ligne1: Icell[] = [
        {
          texte: `\\text{Longueur $${coteInconnu}$ du côté (en ${unites[0]})}`,
          gras: true,
          color: 'black',
          latex: true,
        },
      ].concat(
        // On affiche les longueurs brutes dans l'unité de l'énoncé (unites[0]),
        // comme le tableau non interactif ; la conversion éventuelle est faite
        // par l'élève et détaillée dans la correction.
        [L1, L2, L3, L4].map((el) =>
          Object.assign(
            {},
            {
              texte: texNombre(el, 1),
              gras: false,
              color: 'black',
              latex: true,
            },
          ),
        ),
      )
      const reponsesAttendues = [
        2 * petitLNum + 2 * grandLNum[0],
        2 * petitLNum + 2 * grandLNum[1],
        2 * petitLNum + 2 * grandLNum[2],
        2 * petitLNum + 2 * grandLNum[3],
      ]
      const ligne2: Icell[] = [
        {
          texte: `\\text{Périmètre du rectangle (en $${unitegrandL}$)}`,
          gras: true,
          color: 'black',
          latex: true,
        },
      ].concat(
        reponsesAttendues.map(() =>
          Object.assign(
            {},
            { texte: '', gras: false, color: 'black', latex: true },
          ),
        ),
      )
      const nbColonnes = 4

      const situations = [
        {
          unites,
          coteConnu,
          coteInconnu,
          tableauInteractif: AddTabPropMathlive.create(
            this.numeroExercice ?? 0,
            2 * i,
            { ligne1, ligne2, nbColonnes },
            'clavierDeBase',
            this.interactif,
            {},
          ),
          tableau: tableauColonneLigne(
            [
              `\\text{Longueur $${coteInconnu}$ du côté (en ${unites[0]})}`,
              `\\phantom{000}${L1}\\phantom{000}`,
              `\\phantom{000}${L2}\\phantom{000}`,
              `\\phantom{000}${L3}\\phantom{000}`,
              `\\phantom{000}${L4}\\phantom{000}`,
            ],
            [`\\text{Périmètre du rectangle (en $${unitegrandL}$)}`],
            ['', '', '', ''],
          ),
          calculL1: `$\\text{Pour } ${L1} \\text{ ${unites[0]} : } 2\\times {\\color{blue}{${coteConnu} \\text{ ${unites[1]}}}} +2\\times {\\color{green}{${L1}\\text{ ${unites[0]}}}} ${etapeCorrective(`=2\\times {\\color{blue}{${petitLNum} \\text{ ${unitepetitL}}}} +2\\times {\\color{green}{${texNombre(grandLNum[0])} \\text{ ${unitegrandL}}}}`, this.sup)} = ${texNombre(2 * petitLNum + 2 * grandLNum[0])} \\text{ ${unitegrandL}}$.`,
          calculL2: `$\\text{Pour } ${L2} \\text{ ${unites[0]} : } 2\\times {\\color{blue}{${coteConnu} \\text{ ${unites[1]}}}} +2\\times {\\color{green}{${L2}\\text{ ${unites[0]}}}} ${etapeCorrective(`=2\\times {\\color{blue}{${petitLNum} \\text{ ${unitepetitL}}}} +2\\times {\\color{green}{${texNombre(grandLNum[1])} \\text{ ${unitegrandL}}}}`, this.sup)} = ${texNombre(2 * petitLNum + 2 * grandLNum[1])} \\text{ ${unitegrandL}}$.`,
          calculL3: `$\\text{Pour } ${L3} \\text{ ${unites[0]} : } 2\\times {\\color{blue}{${coteConnu} \\text{ ${unites[1]}}}} +2\\times {\\color{green}{${L3}\\text{ ${unites[0]}}}} ${etapeCorrective(`=2\\times {\\color{blue}{${petitLNum} \\text{ ${unitepetitL}}}} +2\\times {\\color{green}{${texNombre(grandLNum[2])} \\text{ ${unitegrandL}}}}`, this.sup)} = ${texNombre(2 * petitLNum + 2 * grandLNum[2])} \\text{ ${unitegrandL}}$.`,
          calculL4: `$\\text{Pour } ${L4} \\text{ ${unites[0]} : } 2\\times {\\color{blue}{${coteConnu} \\text{ ${unites[1]}}}} +2\\times {\\color{green}{${L4}\\text{ ${unites[0]}}}} ${etapeCorrective(`=2\\times {\\color{blue}{${petitLNum} \\text{ ${unitepetitL}}}} +2\\times {\\color{green}{${texNombre(grandLNum[3])} \\text{ ${unitegrandL}}}}`, this.sup)} = ${texNombre(2 * petitLNum + 2 * grandLNum[3])} \\text{ ${unitegrandL}}$.`,
          tableau_corr: tableauColonneLigne(
            [
              `\\text{Longueur $${coteInconnuCorr}$ du côté (en ${unitegrandL})}`,
              `\\phantom{0}${grandL[0]}\\phantom{0}`,
              `\\phantom{0}${grandL[1]}\\phantom{0}`,
              `\\phantom{0}${grandL[2]}\\phantom{0}`,
              `\\phantom{0}${grandL[3]}\\phantom{0}`,
            ],
            [`\\text{Périmètre du rectangle (en ${unitepetitL})}`],
            [
              `${miseEnEvidence(texNombre(2 * petitLNum + 2 * grandLNum[0]))}`,
              `${miseEnEvidence(texNombre(2 * petitLNum + 2 * grandLNum[1]))}`,
              `${miseEnEvidence(texNombre(2 * petitLNum + 2 * grandLNum[2]))}`,
              `${miseEnEvidence(texNombre(2 * petitLNum + 2 * grandLNum[3]))}`,
            ],
          ),
          reponseSecondeQ: `${texNombre(2 * petitLNum)} + ${coteInconnuCorrNum}`,
          secondeQ: `2\\times {\\color{blue}{${coteConnu} \\text{ ${unites[1]}}}} +2\\times {\\color{green}{${coteInconnu} \\text{ ${unites[0]}}}} ${etapeCorrective(`=2\\times {\\color{blue}{${petitLNum} \\text{ ${unitepetitL}}}} +2\\times {\\color{green}{${coteInconnuCorr} \\text{ ${unitegrandL}}}}`, this.sup)} = ${miseEnEvidence(`${texNombre(2 * petitLNum)} + ${coteInconnuCorrNum}`)} \\text{ exprimé en ${unitegrandL}.}`,
          intro: txtCorr,
          fig: figure,
        },
      ]

      const enonces = []
      let indexSousQuestion = 0
      let indexSousQuestionCorr = 0

      enonces.push({
        enonce: `
On considère un rectangle, comme ci-dessous, dont l'un des côtés mesure $${situations[0].coteConnu}$ $${unites[1]}$ et l'autre mesure $${situations[0].coteInconnu}$ $${unites[0]}$.<br>
${situations[0].fig}

${numAlpha(indexSousQuestion++)} Compléter le tableau suivant :<br>
${
  this.interactif
    ? `${situations[0].tableauInteractif.output}`
    : `${situations[0].tableau}`
}


${numAlpha(indexSousQuestion++)} Quelle formule${this.interactif ? ', exprimée en $\\text{cm}$,' : ''} permet de calculer le périmètre de ce rectangle en fonction de $${situations[0].coteInconnu}$ ?
${
  this.interactif
    ? `${ajouteChampTexteMathLive(this, 2 * i + 1, KeyboardType.alphanumeric)}`
    : ``
}
`,
        question: '',
        correction: `
${numAlpha(indexSousQuestionCorr++)} ${situations[0].intro}<br>
Il y a plusieurs façons de calculer le périmètre d'un rectangle, par exemple : <br> $2\\times largeur + 2\\times Longueur$.<br>
Ici, l'un des côtés mesure toujours $\\color{blue}{${petitL}} \\text{ ${unitepetitL}}$.<br>
Calculons les périmètres pour chacune des valeurs données :<br>
${situations[0].calculL1}<br>
${situations[0].calculL2}<br>
${situations[0].calculL3}<br>
${situations[0].calculL4}<br>
Nous pouvons alors remplir le tableau.${!context.isHtml ? '\\par\\medskip' : '<br>'}
${situations[0].tableau_corr}${!context.isHtml ? '\\par\\medskip' : '<br>'}
${numAlpha(indexSousQuestionCorr++)} On peut généraliser le raisonnement des calculs du périmètre, et ainsi obtenir une formule.<br>
$${situations[0].secondeQ}$

`,
      })

      const reponsesTableau = []
      for (let i = 0; i < nbColonnes; i++) {
        reponsesTableau.push([
          `L1C${i + 1}`,
          {
            value: reponsesAttendues[i],
            options: { approximatelyCompare: true, tolerance: 0 },
          },
        ])
      }
      reponsesTableau.push(['bareme', toutAUnPoint])
      handleAnswers(this, 2 * i, Object.fromEntries(reponsesTableau))
      handleAnswers(this, 2 * i + 1, {
        reponse: { value: situations[0].reponseSecondeQ },
      })

      texte = `${enonces[0].enonce}`
      texteCorr = `${enonces[0].correction}`

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
