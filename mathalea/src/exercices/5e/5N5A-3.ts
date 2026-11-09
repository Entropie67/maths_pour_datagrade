import { codageSegments } from '../../lib/2d/CodageSegment'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { rotation } from '../../lib/2d/transformations'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  AddTabPropMathlive,
  type Icell,
} from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Produire une formule à partir d'un tableau"
export const interactifReady = true

export const dateDeModifImportante = '24/06/2026'

/**
 * * Traduire la dépendance entre deux grandeurs par un tableau de valeurs et produire une formule.
 * @author Sébastien Lozano
 * Éric Elter : Refactorisation, passage en TS et en interactif le 05/05/2026
 * @author Olivier Mimeau
 *   ajout de cas, fix le perimetre en cm quoi qu'il arrive
 */

export const uuid = '0024b'

export const refs = {
  'fr-fr': ['5N5A-3', 'BP2AutoJ2'],
  'fr-2016': ['5L10-4', 'BP2AutoJ2'],
  'fr-ch': ['10LCFA4C-4', '10LSFA4C-4', '11CTFA3C-4', '11LCFA3C-4', '11LSFA3C-4', 'PRQAL01B-4'],
}

type Longueur = {
  unite: string
  valeur: number
}

export default class TableauxEtFonction extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      "Type d'unités",
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Les mêmes unités',
        '2 : Unités différentes',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '0 : Mélange',
        '1 : Périmètre d’un rectangle',
        '2 : Aire d’un rectangle',
        '3 : Périmètre d’un triangle isocèle de base fixée',
        '4 : Périmètre d’un triangle isocèle de base variable',
        '5 : Périmètre d’un carré',
        '6 : Aire d’un carré',
        '7 : Périmètre d’un triangle équilatéral',
        '8 : Aire d’un triangle rectangle',
      ].join('\n'),
    ]
    this.sup = '0'
    this.sup2 = '0'
    this.nbQuestions = 1

    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 1.5 : 1
  }

  nouvelleVersion() {
    const typesUnites = ['Meme', 'Differents']
    const typesDUnitesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 0,
      listeOfCase: typesUnites,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDUnites = combinaisonListes(
      typesDUnitesDisponibles,
      this.nbQuestions,
    )
    const typesQuestions = [
      'PeriRect',
      'AireRect',
      'PeriTriBaseFixee',
      'PeriTriBaseVariable',
      'PeriCarre',
      'AireCarre',
      'PeriTriEquilateral',
      'AireTriRectangle',
    ]
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 8,
      melange: 0,
      defaut: 0,
      listeOfCase: typesQuestions,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let memesUnites = listeTypeDUnites[i] === 'Meme'
      let texte = ''
      let texteCorr = ''
      const coteInconnue = 'L' //choice(['L'])
      const uniteConnue = choice(['cm', 'm'])
      const unitecoteInconnue = memesUnites
        ? uniteConnue
        : uniteConnue === 'cm'
          ? 'm'
          : 'cm'
      const uniteCoteInconnueCorr = memesUnites ? uniteConnue : 'cm' // si les unites sont différentes, la correction est en cm
      let uniteCorr = ''
      let formeFigure = ''
      let formule = ''
      let fctFormule: (connueVal: number, inconnueVal: number) => number = () =>
        0
      let ReponsesFormule = ''
      let IntroCorr = ''
      const fenetreMathalea2D = {
        xmin: -5,
        ymin: -3,
        xmax: 5,
        ymax: 3,
        pixelsParCm: 20,
        scale: 0.5,
      }
      let figure = ''
      let texteIntro = ''
      let consigne = ''
      let expliciterFormule = ''
      const InconnuNum: Longueur[] = []
      InconnuNum[0] = { unite: unitecoteInconnue, valeur: randint(3, 7) }
      InconnuNum[1] = {
        unite: unitecoteInconnue,
        valeur: InconnuNum[0].valeur + 1,
      }
      InconnuNum[2] = {
        unite: unitecoteInconnue,
        valeur: InconnuNum[1].valeur * 2,
      }
      InconnuNum[3] = {
        unite: unitecoteInconnue,
        valeur: InconnuNum[1].valeur * 3,
      }

      let coteConnuNum: Longueur = {
        unite: uniteConnue,
        valeur: randint(3, 7),
      }

      switch (listeTypeDeQuestions[i]) {
        case 'PeriRect':
          {
            formeFigure = 'rectangle'
            texteIntro = `dont l'un des côtés mesure $${coteConnuNum.valeur}$ $\\text{${coteConnuNum.unite}}$ et l'autre mesure $${coteInconnue}$ $\\text{${unitecoteInconnue}}$`
            formule = `2\\times ConnueVal + 2\\times InconnueVal`
            fctFormule = (connueVal: number, inconnueVal: number) =>
              2 * connueVal + 2 * inconnueVal

            const A = pointAbstrait(-4, 2)
            const B = pointAbstrait(-4, -2)
            const C = pointAbstrait(4, -2)
            const D = pointAbstrait(4, 2)
            const mesAppels = [polygone(A, B, C, D)]
            figure = mathalea2d(fenetreMathalea2D, mesAppels)
            const multInconnueCorr =
              memesUnites || unitecoteInconnue === 'cm' ? 2 : 200
            ReponsesFormule = `${texNombre(2 * donnevaleur(coteConnuNum, memesUnites))} + ${multInconnueCorr}${coteInconnue}`
            consigne = `périmètre`
            uniteCorr = uniteCoteInconnueCorr
            IntroCorr = memesUnites
              ? `Les unités sont les mêmes, donc il n'est pas nécessaire de convertir.<br>`
              : `Les unités sont différentes. Donc, nous devons les convertir dans la même unité, ici en cm.<br>`
            IntroCorr += `Il y a plusieurs façons de calculer le périmètre d'un rectangle, par exemple : <br> $2\\times\\text{ largeur} + 2\\times\\text{ longueur}$.<br>`
            IntroCorr += `Ici, l'un des côtés mesure toujours `
            IntroCorr += `$ \\color{blue}{${memesUnites || coteConnuNum.unite === 'cm' ? '' : `${coteConnuNum.valeur} \\times 100 \\text{ cm} =`}${memesUnites || coteConnuNum.unite === 'cm' ? coteConnuNum.valeur : coteConnuNum.valeur * 100} \\text{ ${uniteCoteInconnueCorr}}} $.<br>`

            expliciterFormule = `$2\\times {\\color{blue}{${coteConnuNum.valeur} \\text{ ${coteConnuNum.unite}}}} +2\\times {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}}`
            expliciterFormule += ` ${memesUnites ? '' : `=2\\times {\\color{blue}{${coteConnuNum.valeur}${coteConnuNum.unite === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}} +2\\times {\\color{green}{${coteInconnue}${unitecoteInconnue === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}}`}$`
          }
          break
        case 'AireRect':
          {
            formeFigure = 'rectangle'
            texteIntro = `dont l'un des côtés mesure $${coteConnuNum.valeur}$ $\\text{${coteConnuNum.unite}}$ et l'autre mesure $${coteInconnue}$ $\\text{${unitecoteInconnue}}$`

            formule = ` ConnueVal \\times InconnueVal`
            fctFormule = (connueVal: number, inconnueVal: number) =>
              connueVal * inconnueVal
            const A = pointAbstrait(-4, 2)
            const B = pointAbstrait(-4, -2)
            const C = pointAbstrait(4, -2)
            const D = pointAbstrait(4, 2)
            const mesAppels = [polygone(A, B, C, D)]
            figure = mathalea2d(fenetreMathalea2D, mesAppels)
            const multInconnueCorr =
              memesUnites || unitecoteInconnue === 'cm' ? 1 : 100
            ReponsesFormule = `${texNombre(multInconnueCorr * donnevaleur(coteConnuNum, memesUnites))}${coteInconnue}`
            consigne = `aire`
            uniteCorr = `$${uniteCoteInconnueCorr}^2$`
            IntroCorr = memesUnites
              ? `Les unités sont les mêmes, donc il n'est pas nécessaire de convertir.<br>`
              : `Les unités sont différentes. Donc, nous devons les convertir dans la même unité, ici en cm.<br>`
            IntroCorr += `Pour calculer l'aire d'un rectangle, on utilise une formule : <br> $\\text{largeur} \\times \\text{longueur}$.<br>`
            IntroCorr += `Ici, l'un des côtés mesure toujours `
            IntroCorr += `$ \\color{blue}{${memesUnites || coteConnuNum.unite === 'cm' ? '' : `${coteConnuNum.valeur} \\times 100 \\text{ cm} =`}${memesUnites || coteConnuNum.unite === 'cm' ? coteConnuNum.valeur : coteConnuNum.valeur * 100} \\text{ ${uniteCoteInconnueCorr}}} $.<br>`
            expliciterFormule = `$ {\\color{blue}{${coteConnuNum.valeur} \\text{ ${coteConnuNum.unite}}}} \\times {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}}`
            expliciterFormule += ` ${memesUnites ? '' : `= {\\color{blue}{${coteConnuNum.valeur}${coteConnuNum.unite === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}} \\times {\\color{green}{${coteInconnue}${unitecoteInconnue === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}}`}$`
          }
          break
        case 'PeriTriBaseFixee':
          {
            formeFigure = 'triangle isocèle'
            texteIntro = `dont la base mesure $${coteConnuNum.valeur}$ $\\text{${coteConnuNum.unite}}$ et les autres côtés mesurent $${coteInconnue}$ $\\text{${unitecoteInconnue}}$`
            formule = `ConnueVal+ 2\\times InconnueVal `
            fctFormule = (connueVal: number, inconnueVal: number) =>
              connueVal + 2 * inconnueVal

            const A = pointAbstrait(-3, -2)
            const B = pointAbstrait(3, -2)
            const C = pointAbstrait(0, 2)
            const mesAppels: ObjetMathalea2D[] = [polygone(A, B, C)]
            mesAppels.push(codageSegments('||', bleuMathalea, C, A, C, B))
            figure = mathalea2d(fenetreMathalea2D, mesAppels)
            const multInconnueCorr =
              memesUnites || unitecoteInconnue === 'cm' ? 2 : 200
            ReponsesFormule = `${texNombre(donnevaleur(coteConnuNum, memesUnites))} + ${multInconnueCorr}${coteInconnue}`
            consigne = `périmètre`
            uniteCorr = uniteCoteInconnueCorr
            IntroCorr = memesUnites
              ? `Les unités sont les mêmes, donc il n'est pas nécessaire de convertir.<br>`
              : `Les unités sont différentes. Donc, nous devons les convertir dans la même unité, ici en cm.<br>`
            IntroCorr += `Il y a plusieurs façons de calculer le périmètre d'un triangle isocèle, par exemple : <br> $\\text{base }+ 2\\times \\text{côté du sommet principal}$.<br>`
            IntroCorr += `Ici, la base mesure toujours `
            IntroCorr += `$ \\color{blue}{${memesUnites || coteConnuNum.unite === 'cm' ? '' : `${coteConnuNum.valeur} \\times 100 \\text{ cm} =`}${memesUnites || coteConnuNum.unite === 'cm' ? coteConnuNum.valeur : coteConnuNum.valeur * 100} \\text{ ${uniteCoteInconnueCorr}}} $.<br>`

            expliciterFormule = `$ {\\color{blue}{${coteConnuNum.valeur} \\text{ ${coteConnuNum.unite}}}} +2\\times {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}}`
            expliciterFormule += ` ${memesUnites ? '' : `= {\\color{blue}{${coteConnuNum.valeur}${coteConnuNum.unite === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}} +2\\times {\\color{green}{${coteInconnue}${unitecoteInconnue === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}}`}$`
          }
          break
        case 'PeriTriBaseVariable':
          {
            // coteConnuNum doit etre > maxcoteInconnue/2 en tenant compte des unités
            const max =
              arrondi(Math.max(...InconnuNum.map((el) => el.valeur)) / 2, 0) + 1
            const coef = memesUnites || unitecoteInconnue === 'cm' ? 1 : 100
            coteConnuNum = {
              unite: uniteConnue,
              valeur: randint(max, max + 4) * coef,
            }
            formeFigure = 'triangle isocèle'
            texteIntro = `dont la base mesure $${coteInconnue}$ $\\text{${unitecoteInconnue}}$ et les autres côtés mesurent $${texNombre(coteConnuNum.valeur)}$ $\\text{${coteConnuNum.unite}}$`
            formule = `2\\times ConnueVal + InconnueVal `
            fctFormule = (connueVal: number, inconnueVal: number) =>
              2 * connueVal + inconnueVal

            const A = pointAbstrait(-3, -2)
            const B = pointAbstrait(3, -2)
            const C = pointAbstrait(0, 2)
            const mesAppels: ObjetMathalea2D[] = [polygone(A, B, C)]
            mesAppels.push(codageSegments('||', bleuMathalea, C, A, C, B))
            figure = mathalea2d(fenetreMathalea2D, mesAppels)
            const multInconnueCorr =
              memesUnites || unitecoteInconnue === 'cm' ? '' : '100'
            //            ReponsesFormule = `${texNombre(donnevaleur(coteConnuNum, memesUnites))} + ${multInconnueCorr}${coteInconnue}`
            ReponsesFormule = `${donnevaleur(coteConnuNum, memesUnites)} + ${multInconnueCorr}${coteInconnue}`
            consigne = `périmètre`
            uniteCorr = uniteCoteInconnueCorr
            IntroCorr = memesUnites
              ? `Les unités sont les mêmes, donc il n'est pas nécessaire de convertir.<br>`
              : `Les unités sont différentes. Donc, nous devons les convertir dans la même unité, ici en cm.<br>`
            IntroCorr += `Il y a plusieurs façons de calculer le périmètre d'un triangle isocèle, par exemple : <br> $2\\times\\text{ côté du sommet principal} + \\text{base}$.<br>`
            IntroCorr += `Ici, les côtés de sommet principal mesurent toujours `
            IntroCorr += `$ \\color{blue}{${memesUnites || coteConnuNum.unite === 'cm' ? '' : `${coteConnuNum.valeur} \\times 100 \\text{ cm} =`}${texNombre(memesUnites || coteConnuNum.unite === 'cm' ? coteConnuNum.valeur : coteConnuNum.valeur * 100)} \\text{ ${uniteCoteInconnueCorr}}} $.<br>`

            expliciterFormule = `$ 2\\times {\\color{blue}{${texNombre(coteConnuNum.valeur)} \\text{ ${coteConnuNum.unite}}}} + {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}}`
            expliciterFormule += ` ${memesUnites ? '' : `= 2\\times {\\color{blue}{${texNombre(coteConnuNum.valeur)}${coteConnuNum.unite === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}} + {\\color{green}{${coteInconnue}${unitecoteInconnue === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}}`}$`
          }
          break
        case 'PeriCarre':
          {
            memesUnites = true
            formeFigure = 'carré'
            texteIntro = `dont le côté mesure $${coteInconnue}$ $\\text{${unitecoteInconnue}}$`
            formule = `4\\times InconnueVal`
            fctFormule = (connueVal: number, inconnueVal: number) =>
              4 * inconnueVal
            const A = pointAbstrait(-2, 2)
            const B = pointAbstrait(-2, -2)
            const C = pointAbstrait(2, -2)
            const D = pointAbstrait(2, 2)
            const mesAppels = [polygone(A, B, C, D)]
            figure = mathalea2d(fenetreMathalea2D, mesAppels)
            ReponsesFormule = `${texNombre(4)}${coteInconnue}`
            consigne = `périmètre`
            uniteCorr = uniteCoteInconnueCorr
            IntroCorr = `Il y a plusieurs façons de calculer le périmètre d'un carré, par exemple : <br> $4\\times \\text{côté}$.<br>`

            expliciterFormule = `$4\\times {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}}$`
          }
          break
        case 'AireCarre':
          {
            memesUnites = true
            formeFigure = 'carré'
            texteIntro = `dont le côté mesure $${coteInconnue}$ $\\text{${unitecoteInconnue}}$`
            formule = `InconnueVal \\times InconnueVal`
            fctFormule = (connueVal: number, inconnueVal: number) =>
              inconnueVal ** 2
            const A = pointAbstrait(-2, 2)
            const B = pointAbstrait(-2, -2)
            const C = pointAbstrait(2, -2)
            const D = pointAbstrait(2, 2)
            const mesAppels = [polygone(A, B, C, D)]
            figure = mathalea2d(fenetreMathalea2D, mesAppels)
            ReponsesFormule = `${coteInconnue}^2`
            consigne = `aire`
            uniteCorr = `$${uniteCoteInconnueCorr}^2$`
            IntroCorr = `Pour calculer l'aire d'un carré, on utilise la formule : <br> $\\text{côté} \\times \\text{côté}$.<br>`

            expliciterFormule = `$ {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}} \\times {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}}$`
          }
          break
        case 'PeriTriEquilateral':
          {
            memesUnites = true
            formeFigure = 'triangle équilatéral'
            texteIntro = `dont le côté mesure $${coteInconnue}$ $\\text{${unitecoteInconnue}}$`
            formule = `3\\times InconnueVal`
            fctFormule = (connueVal: number, inconnueVal: number) =>
              3 * inconnueVal
            const A = pointAbstrait(-3, -2.5)
            const B = pointAbstrait(3, -2.5)
            const C = rotation(B, A, 60)
            const mesAppels: ObjetMathalea2D[] = [polygone(A, B, C)]
            mesAppels.push(codageSegments('||', bleuMathalea, C, A, C, B, A, B))
            figure = mathalea2d(fenetreMathalea2D, mesAppels)
            ReponsesFormule = `${texNombre(3)}${coteInconnue}`
            consigne = `périmètre`
            uniteCorr = uniteCoteInconnueCorr
            IntroCorr = `Il y a plusieurs façons de calculer le périmètre d'un triangle équilatéral, par exemple : <br> $3\\times \\text{côté}$.<br>`

            expliciterFormule = `$3\\times {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}}$`
          }
          break
        case 'AireTriRectangle':
          {
            formeFigure = 'triangle rectangle'
            texteIntro = `dont l'un des côtés de l'angle droit mesure $${coteConnuNum.valeur}$ $\\text{${coteConnuNum.unite}}$ et l'autre côté de l'angle droit mesure $${coteInconnue}$ $\\text{${unitecoteInconnue}}$`
            formule = ` ConnueVal \\times InconnueVal \\div 2`
            fctFormule = (connueVal: number, inconnueVal: number) =>
              (connueVal * inconnueVal) / 2
            const A = pointAbstrait(-3, -2)
            const B = pointAbstrait(3, -2)
            const C = pointAbstrait(-3, 2)
            const mesAppels = [polygone(A, B, C)]
            figure = mathalea2d(fenetreMathalea2D, mesAppels)
            const multInconnueCorr =
              memesUnites || unitecoteInconnue === 'cm' ? 1 : 100
            ReponsesFormule = `${texNombre((multInconnueCorr * donnevaleur(coteConnuNum, memesUnites)) / 2)}${coteInconnue}`
            consigne = `aire`
            uniteCorr = `$${uniteCoteInconnueCorr}^2$`
            IntroCorr = memesUnites
              ? `Les unités sont les mêmes, donc il n'est pas nécessaire de convertir.<br>`
              : `Les unités sont différentes. Donc, nous devons les convertir dans la même unité, ici en cm.<br>`
            IntroCorr += `Pour calculer l'aire d'un triangle rectangle, onutilise une formule : <br> $\\text{base} \\times \\text{hauteur} \\div 2$.<br>`
            IntroCorr += `Ici, l'un des côtés mesure toujours `
            IntroCorr += `$ \\color{blue}{${memesUnites || coteConnuNum.unite === 'cm' ? '' : `${coteConnuNum.valeur} \\times 100 \\text{ cm} =`}${memesUnites || coteConnuNum.unite === 'cm' ? coteConnuNum.valeur : coteConnuNum.valeur * 100} \\text{ ${uniteCoteInconnueCorr}}} $.<br>`
            expliciterFormule = `$ {\\color{blue}{${coteConnuNum.valeur} \\text{ ${coteConnuNum.unite}}}} \\times {\\color{green}{${coteInconnue} \\text{ ${unitecoteInconnue}}}} \\div 2`
            expliciterFormule += ` ${memesUnites ? '' : `= {\\color{blue}{${coteConnuNum.valeur}${coteConnuNum.unite === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}} \\times {\\color{green}{${coteInconnue}${unitecoteInconnue === 'm' ? ` \\times 100` : ``} \\text{ ${uniteCoteInconnueCorr}}}} \\div 2`}$`
          }
          break
      }

      const ligne1: Icell[] = [
        {
          texte: `\\text{Longueur $${coteInconnue}$ du côté (en \\text{ ${unitecoteInconnue}})}`,
          gras: true,
          color: 'black',
          latex: true,
        },
      ].concat(
        InconnuNum.map((el) =>
          Object.assign(
            {},
            {
              texte: texNombre(el.valeur, 1),
              gras: false,
              color: 'black',
              latex: true,
            },
          ),
        ),
      )
      const reponsesNumAttendues = [
        Evalfct(fctFormule, coteConnuNum, InconnuNum[0], memesUnites),
        Evalfct(fctFormule, coteConnuNum, InconnuNum[1], memesUnites),
        Evalfct(fctFormule, coteConnuNum, InconnuNum[2], memesUnites),
        Evalfct(fctFormule, coteConnuNum, InconnuNum[3], memesUnites),
      ]

      const ligne2: Icell[] = [
        {
          texte: `\\text{${majusculePremiereLettre(singulier(consigne))} du ${formeFigure} (en ${uniteCorr})}`,
          gras: true,
          color: 'black',
          latex: true,
        },
      ].concat(
        reponsesNumAttendues.map(() =>
          Object.assign(
            {},
            { texte: '', gras: false, color: 'black', latex: true },
          ),
        ),
      )
      const nbColonnes = 4

      const tableauInteractif = AddTabPropMathlive.create(
        this.numeroExercice ?? 0,
        2 * i,
        { ligne1, ligne2, nbColonnes },
        'clavierDeBase',
        this.interactif,
        {},
      )
      const tableau = tableauColonneLigne(
        [
          `\\text{Longueur $${coteInconnue}$ du côté (en \\text{${unitecoteInconnue}})}`,
          `\\phantom{000}${InconnuNum[0].valeur}\\phantom{000}`,
          `\\phantom{000}${InconnuNum[1].valeur}\\phantom{000}`,
          `\\phantom{000}${InconnuNum[2].valeur}\\phantom{000}`,
          `\\phantom{000}${InconnuNum[3].valeur}\\phantom{000}`,
        ],
        [
          `\\text{${majusculePremiereLettre(singulier(consigne))} du ${formeFigure} (en \\text{${uniteCorr}})}`,
        ],
        ['', '', '', ''],
      )

      const tableau_corr = tableauColonneLigne(
        [
          `\\text{Longueur $${coteInconnue}$ du côté (en ${uniteCoteInconnueCorr})}`,
          `\\phantom{0}${InconnuNum[0].valeur}${!memesUnites && unitecoteInconnue === 'm' ? ` \\times 100` : ``}\\phantom{0}`,
          `\\phantom{0}${InconnuNum[1].valeur}${!memesUnites && unitecoteInconnue === 'm' ? ` \\times 100` : ``}\\phantom{0}`,
          `\\phantom{0}${InconnuNum[2].valeur}${!memesUnites && unitecoteInconnue === 'm' ? ` \\times 100` : ``}\\phantom{0}`,
          `\\phantom{0}${InconnuNum[3].valeur}${!memesUnites && unitecoteInconnue === 'm' ? ` \\times 100` : ``}\\phantom{0}`,
        ],
        [
          `\\text{${majusculePremiereLettre(singulier(consigne))} du ${formeFigure} (en ${uniteCorr})}`,
        ],
        [
          `${miseEnEvidence(texNombre(reponsesNumAttendues[0]))}`,
          `${miseEnEvidence(texNombre(reponsesNumAttendues[1]))}`,
          `${miseEnEvidence(texNombre(reponsesNumAttendues[2]))}`,
          `${miseEnEvidence(texNombre(reponsesNumAttendues[3]))}`,
        ],
      )
      //fig: figure,

      let indexSousQuestion = 0
      let indexSousQuestionCorr = 0

      texte += `On considère un ${formeFigure}, comme ci-dessous, ${texteIntro}.<br>`
      texte += figure
      texte += `${!context.isHtml ? '\\par' : ''}${numAlpha(indexSousQuestion++)} Compléter le tableau suivant :<br>`
      texte += this.interactif ? tableauInteractif.output : tableau
      texte += `${!context.isHtml ? '\\par\\medskip' : '<br>'}${numAlpha(indexSousQuestion++)} Quelle formule${this.interactif ? ', exprimée en $\\text{cm}$,' : ''} permet de calculer ${singulier(consigne)} de ce ${formeFigure} en fonction de $${coteInconnue}$ ?`
      texte += this.interactif
        ? ajouteChampTexteMathLive(this, 2 * i + 1, KeyboardType.alphanumeric)
        : ``
      const reponsesTableau = []
      for (let i = 0; i < nbColonnes; i++) {
        reponsesTableau.push([
          `L1C${i + 1}`,
          {
            value: reponsesNumAttendues[i],
            options: { approximatelyCompare: true, tolerance: 0 },
          },
        ])
      }
      reponsesTableau.push(['bareme', toutAUnPoint])
      handleAnswers(this, 2 * i, Object.fromEntries(reponsesTableau))
      handleAnswers(this, 2 * i + 1, {
        reponse: { value: ReponsesFormule.replaceAll('$', '') },
      })

      texteCorr += `${numAlpha(indexSousQuestionCorr++)} `
      texteCorr += IntroCorr
      texteCorr += `Calculons ${pluriel(consigne)} pour chacune des valeurs données :<br>`
      for (let j = 0; j < InconnuNum.length; j++) {
        texteCorr += `$\\text{Pour } ${InconnuNum[j].valeur} \\text{ ${InconnuNum[j].unite} : } 
            ${interpreteFormumle(formule, coteConnuNum, InconnuNum[j], !memesUnites)} 
          = \\text{${texNombre(reponsesNumAttendues[j])}  ${uniteCorr}}$.<br>`
      }
      texteCorr += `Nous pouvons alors remplir le tableau.${!context.isHtml ? '\\par\\medskip' : '<br>'}`
      texteCorr += `${tableau_corr}${!context.isHtml ? '\\par\\medskip' : '<br>'}`
      texteCorr += `${numAlpha(indexSousQuestionCorr++)} On peut généraliser le raisonnement des calculs ${preposition(consigne)}, et ainsi obtenir une formule.<br>`
      texteCorr += expliciterFormule
      texteCorr += ` =$${miseEnEvidence(ReponsesFormule)} \\text{ exprimé en ${uniteCorr}}$.<br>`
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

function majusculePremiereLettre(chaine: string): string {
  return chaine.charAt(0).toUpperCase() + chaine.slice(1)
}

function singulier(chaine: string): string {
  let article = 'le '
  if (
    chaine.charAt(0) === 'a' ||
    chaine.charAt(0) === 'e' ||
    chaine.charAt(0) === 'i' ||
    chaine.charAt(0) === 'o' ||
    chaine.charAt(0) === 'u'
  ) {
    article = `l'`
  }
  return article + chaine
}

function pluriel(chaine: string): string {
  return 'les ' + chaine + 's'
}

function preposition(chaine: string): string {
  let article = 'du '
  if (
    chaine.charAt(0) === 'a' ||
    chaine.charAt(0) === 'e' ||
    chaine.charAt(0) === 'i' ||
    chaine.charAt(0) === 'o' ||
    chaine.charAt(0) === 'u'
  ) {
    article = "de l'"
  }
  return article + chaine
}

function interpreteFormumle(
  formule: string,
  connueVal: Longueur,
  inconnueVal: Longueur,
  convertir: boolean = false,
): string {
  const reponse1 = `${formule
    .replace(
      /ConnueVal/g,
      `{\\color{blue}{${texNombre(connueVal.valeur)} \\text{ ${connueVal.unite}}}}`,
    )
    .replace(
      /InconnueVal/g,
      `{\\color{green}{${inconnueVal.valeur} \\text{ ${inconnueVal.unite}}}}`,
    )}`
  const connueValbis =
    connueVal.unite === 'cm'
      ? connueVal
      : { unite: 'cm', valeur: `${connueVal.valeur * 100}` }
  const inconnueValbis =
    inconnueVal.unite === 'cm'
      ? inconnueVal
      : { unite: 'cm', valeur: `${inconnueVal.valeur * 100}` }
  const reponse2 =
    ' = ' +
    `${formule
      .replace(
        /ConnueVal/g,
        `{\\color{blue}{${texNombre(Number(connueValbis.valeur))} \\text{ ${connueValbis.unite}}}}`,
      )
      .replace(
        /InconnueVal/g,
        `{\\color{green}{${texNombre(Number(inconnueValbis.valeur))} \\text{ ${inconnueValbis.unite}}}}`,
      )}`

  let reponse = reponse1
  reponse += convertir ? reponse2 : ''
  return reponse
}

function donnevaleur(L: Longueur, memeUnite: boolean = true): number {
  return memeUnite || L.unite === 'cm' ? L.valeur : L.valeur * 100
}

function Evalfct(
  fct: (connueVal: number, inconnueVal: number) => number,
  connueVal: Longueur,
  inconnueVal: Longueur,
  memeUnite: boolean = true,
): number {
  return fct(
    donnevaleur(connueVal, memeUnite),
    donnevaleur(inconnueVal, memeUnite),
  )
}
