import { cercle } from '../../lib/2d/cercle'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { pointSurCercle } from '../../lib/2d/utilitairesPoint'
import type { AMCQcmChoice } from '../../lib/amc/amcTypes'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Connaitre le vocabulaire de base des polygones'

export const dateDePublication = '21/10/2022'

/**
 * Connaissance du vocabulaire de base des polygones : nom, côté, sommet, diagonale
 * @author Guillaume Valmont
 */
export const uuid = '18672'

export const refs = {
  'fr-fr': ['6G0-6', '6AutoG1-3'],
  'fr-2016': ['6G20-3'],
  'fr-ch': ['PRQES02B-5', '9R1ES1D-1', '9R2ES1D-1', '9R3ES1D-1'],
}
export default class VocabulaireDeBaseDesPolygones extends Exercice {
  constructor() {
    super()
    this.correctionDetailleeDisponible = true
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
    this.besoinFormulaireTexte = [
      'Texte de la 4ème possibilité',
      'Retire la 4ème possibilité si le champ est vide',
    ]
    this.sup = ''
  }

  nouvelleVersion() {
    const propositionsAMC: {
      type: string
      enonce: string
      propositions: AMCQcmChoice[]
    }[] = []
    const typeQuestionsDisponibles = ['nom', 'sommet', 'cote', 'diagonale']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    const objets2d = []
    const O = pointAbstrait(0, 0, 'O')
    const points = []

    const nbSommets = randint(4, 6)
    // On commence par créer les angles à partir desquels les points seront créés
    const anglesPoints: number[] = []
    for (let i = 0; i < nbSommets; i++) {
      anglesPoints.push(randint(1, 12, anglesPoints))
    }
    for (let i = 0; i < anglesPoints.length; i++) {
      anglesPoints[i] = anglesPoints[i] * 30
    }
    anglesPoints.sort((a, b) => a - b)
    // On crée leurs noms
    const numerosNomsPoints: number[] = []
    for (let i = 0; i < nbSommets; i++) {
      numerosNomsPoints.push(randint(1, 26, [22, ...numerosNomsPoints])) // Il y a un espace bizarre après les V en LateX, alors on les zappe
    }
    // On crée les points autour d'un point O à partir des angles précédemment créés
    for (let i = 0; i < nbSommets; i++) {
      points.push(
        pointSurCercle(
          cercle(O, randint(20, 50) / 10),
          anglesPoints[i],
          lettreDepuisChiffre(numerosNomsPoints[i]),
        ),
      )
    }
    const polygon = polygoneAvecNom(...points)
    objets2d.push(polygon[0], polygon[1])
    // On affiche le cadre mathalea2d
    const pointsX = []
    const pointsY = []
    for (const point of points) {
      pointsX.push(point.x)
      pointsY.push(point.y)
    }
    const xmin = Math.min(...pointsX) - 2
    const xmax = Math.max(...pointsX) + 2
    const ymin = Math.min(...pointsY) - 2
    const ymax = Math.max(...pointsY) + 2
    const parametres2d = {
      xmin,
      ymin,
      xmax,
      ymax,
      pixelsParCm: 20,
      scale: context.isAmc ? 0.5 : 1,
    }
    this.introduction = '' + mathalea2d(parametres2d, objets2d)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''
      // On construit les questions
      const indiceA = randint(0, nbSommets - 1)
      const indiceB = (indiceA + 1) % nbSommets
      const indiceC = (indiceA + 2) % nbSommets
      const A = points[indiceA].nom
      const B = points[indiceB].nom
      const C = points[indiceC].nom

      const indiceDepart = randint(0, points.length)
      let nomDirectCorrect = '$'
      for (let i = 0; i < nbSommets; i++) {
        nomDirectCorrect += points[(indiceDepart + i) % nbSommets].nom
      }
      nomDirectCorrect += '$'
      const nomIndirectCorrect = nomDirectCorrect.split('').reverse().join('')
      const inverse2lettres = (str: string) => {
        const arr = str.split('')
        const temp = arr[1]
        arr[1] = arr[2]
        arr[2] = temp
        return arr.join('')
      }
      const nomDirectIncorrect = inverse2lettres(nomDirectCorrect)
      const nomIndirrectIncorrect = inverse2lettres(nomIndirectCorrect)
      let questionReponse
      switch (listeTypeQuestions[i]) {
        case 'nom':
          questionReponse = {
            question:
              'Parmi les noms ci-dessous, lesquels sont les noms possibles de ce polygone ?',
            propositions: [
              nomDirectCorrect,
              nomDirectIncorrect,
              nomIndirectCorrect,
              nomIndirrectIncorrect,
            ],
            reponses: [nomDirectCorrect, nomIndirectCorrect],
            explications: `On peut le nommer de plein de façons différentes.<br>
              Il faut partir d'un point (n'importe lequel) et nommer les points qu'on rencontre lorsqu'on fait le tour de la figure dans un sens ou dans l'autre.`,
          }
          break
        case 'sommet':
          questionReponse = {
            question: `$${A}$ est :`,
            propositions: ['un sommet', 'un côté', 'une diagonale'],
            reponses: ['un sommet'],
            explications: 'Les sommets sont les extrémités des côtés.',
          }

          break
        case 'cote':
          questionReponse = {
            question: `$[${B}${C}]$ est :`,
            propositions: ['un sommet', 'un côté', 'une diagonale'],
            reponses: ['un côté'],
            explications:
              'Les côtés sont les segments qui forment le polygone.',
          }

          break
        case 'diagonale':
        default:
          questionReponse = {
            question: `$[${C}${A}]$ est :`,
            propositions: ['un sommet', 'un côté', 'une diagonale'],
            reponses: ['une diagonale'],
            explications:
              'Une diagonale est un segment qui a pour extrémités deux sommets non consécutifs (deux côtés qui ne se suivent pas).',
          }

          break
      }
      if (
        this.sup !== '' &&
        this.sup !== undefined &&
        this.sup !== 'NaN' &&
        listeTypeQuestions[i] !== 'nom'
      )
        questionReponse.propositions.push(this.sup)
      const propositions: {
        texte: string
        statut: boolean
        feedback: string
      }[] = []
      for (const proposition of questionReponse.propositions) {
        let statut = false
        for (const reponse of questionReponse.reponses) {
          if (proposition === reponse) statut = true
        }
        propositions.push({
          texte: proposition,
          statut,
          feedback: '',
        })
      }
      this.autoCorrection[i] = {
        enonce: questionReponse.question,
        options: { ordered: false },
        propositions,
      }
      const monQcm = propositionsQcm(this, i)
      texte += questionReponse.question + '<br>'
      texte += monQcm.texte
      texteCorr += questionReponse.question + '<br>'
      texteCorr += monQcm.texteCorr
      if (this.correctionDetaillee) texteCorr += questionReponse.explications + '<br><br>'
      else texteCorr += '<br>'

      if (context.isAmc) {
        propositionsAMC[i] = {
          type: 'qcmMult', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
          enonce: questionReponse.question,
          propositions,
        }
      }

      if (
        this.questionJamaisPosee(
          i,
          ...pointsX,
          ...pointsY,
          listeTypeQuestions[i],
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: mathalea2d(parametres2d, objets2d),
            enonceAvant: true, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
            enonceCentre: true, // EE : ce champ est facultatif et permet (si true) de centrer le champ 'enonce' ci-dessus.
            // options: { ordered: false },
            propositions: propositionsAMC,
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
