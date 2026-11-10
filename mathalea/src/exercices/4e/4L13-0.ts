import { afficheCoteSegment } from '../../lib/2d/AfficheCoteSegment'
import { codageCarre } from '../../lib/2d/CodageCarre'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone } from '../../lib/2d/polygones'
import { polygoneRegulierParCentreEtRayon } from '../../lib/2d/polygonesParticuliers'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea } from '../../lib/colors'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Mettre en équation un problème sans objectif de résolution'
export const dateDeModifImportante = '28/03/2025'
export const interactifReady = true

/**
 * Produire une forme littérale en introduisant une lettre pour désigner une valeur inconnue afin de mettre en équation un problème
 * à partir de figure géométriques élémentaires
 * @author Sébastien Lozano (EE : Rajout de paramètres, aléatoirisation des sommets, meilleure colorisation de la correction...)
 */
export const uuid = '5a6f2'

export const refs = {
  'fr-fr': ['4L13-0', 'BP2RES1'],
  'fr-ch': ['10LCFA5A-1', '10LSFA5A-1', '11CTFA4A-1', '11LCFA4A-1', '11LSFA4A-1', 'PRQAL04A-2', 'PRQAL04C-1'],
}

const myPolyName = function (n: number) {
  const sortie = {
    article: '',
    name: '',
    nameParSommets: '',
  }
  switch (n) {
    case 3:
      sortie.article = 'du '
      sortie.name = 'triangle équilatéral'
      break
    case 4:
      sortie.article = 'du '
      sortie.name = 'carré'
      break
    case 5:
      sortie.article = 'du '
      sortie.name = 'pentagone régulier'
      break
    case 6:
      sortie.article = "de l'"
      sortie.name = 'hexagone régulier'
      break
    case 7:
      sortie.article = "de l'"
      sortie.name = 'heptagone régulier'
      break
    case 8:
    default:
      sortie.article = "de l'"
      sortie.name = 'octogone régulier'
      break
  }
  sortie.nameParSommets = creerNomDePolygone(n, ['O', 'Q', 'X'])
  return sortie
}

export default class MettreEnEquationSansResoudre extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de polygones',
      [
        'Nombres séparés par des tirets  :',
        '1 : Triangle',
        '2 : Quadrilatère',
        '3 : Pentagone',
        '4 : Hexagone',
        '5 : Heptagone',
        '6 : Octogone',
        '7 : Mélange',
      ].join('\n'),
    ]

    this.sup = 7
    this.nbQuestions = 2

    this.consigne =
      "Donner une équation qui permet de résoudre le problème.<br>On ne demande pas de résoudre l'équation."
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })

    const variables = ['a', 'b', 'c', 'x', 'y', 'z']
    const unites = [
      '$\\text{mm}$',
      '$\\text{cm}$',
      '$\\text{dm}$',
      '$\\text{m}$',
      '$\\text{dam}$',
      '$\\text{hm}$',
      '$\\text{km}$',
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // une fonction pour dire le nom du polygone

      // on choisit le nombre de côtés su polygone
      const n = Number(typesDeQuestionsDisponibles[i]) + 2
      // on choisit un nom pour la variable
      const inc = variables[randint(0, variables.length - 1)]
      // on choisit une unité
      const unite = unites[randint(0, unites.length - 1)]
      // on prépare le polygone
      const po = polygoneRegulierParCentreEtRayon(pointAbstrait(0, 0), 4, n)
      po.opacite = 0.5
      po.epaisseur = 2
      // on pépare la côte
      const s = segment(po.listePoints[0], po.listePoints[1])
      s.styleExtremites = '<->'
      // on fait un test pour coder les angles droits du carré
      let anglesDroitsIfIsCarre
      if (n === 4) {
        anglesDroitsIfIsCarre = codageCarre(po)
      } else {
        anglesDroitsIfIsCarre = vide2d()
      }
      // on finit les appels
      const mesAppels = [
        po,
        codageSegments('X', bleuMathalea, po.listePoints),
        afficheCoteSegment(s, `${inc}`, 1, 'red', 2, 0.5, 'black'),
        nommePolygone(po, myPolyName(n).nameParSommets),
        anglesDroitsIfIsCarre,
      ]
      // on prépare l'objet polygone
      const polygone = {
        nb_cotes: n,
        unite,
        article: myPolyName(n).article,
        nom: myPolyName(n).name,
        let_cote: inc,
        perimetre: randint(200, 500),
        fig: mathalea2d(
          {
            xmin: -7,
            ymin: -5,
            xmax: 7,
            ymax: 5,
            pixelsParCm: 20,
            scale: 0.5, // 0.7
          },
          mesAppels,
        ),
      }

      const enonces = []
      const equation = `${polygone.nb_cotes}\\times ${polygone.let_cote} = ${polygone.perimetre}`

      enonces.push({
        enonce: `On considère la figure suivante où l'unité est le ${polygone.unite}.<br>${prenom()} se demande pour quelle valeur de $${polygone.let_cote}$, exprimée en ${polygone.unite}, le périmètre ${polygone.article}${polygone.nom} est égal à $${polygone.perimetre}$ ${polygone.unite} .<br> ${polygone.fig}`,
        question: '',
        correction: `La figure est un ${polygone.nom}, il a donc $${polygone.nb_cotes}$ côtés de même longueur.<br>
        Cette longueur est notée $${polygone.let_cote}$, le périmètre de la figure, exprimé en fonction de $${polygone.let_cote}$, vaut donc $${polygone.nb_cotes}\\times ${polygone.let_cote}$.<br>
        D'après l'énoncé, ce périmètre vaut $${polygone.perimetre}$ ${polygone.unite}.<br>
        L'équation suivante permet donc de résoudre le problème : 
        $${miseEnEvidence(equation)}$.`,
      })

      if (this.questionJamaisPosee(i, n, inc)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = `${enonces[0].enonce}`
        if (context.isHtml && this.interactif) {
          this.listeQuestions[i] += ajouteQuestionMathlive({
            exercice: this,
            question: i,
            typeInteractivite: 'mathlive',
            reponseParams: { formatInteractif: 'mathalea-mathfield' },
            objetReponse: {
              reponse: {
                value: equation,
                options: { egaliteExpression: true },
              },
            },
          })
        }
        this.listeCorrections[i] = `${enonces[0].correction}`
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
