import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { droite } from '../../lib/2d/droites'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import {
  pointAdistance,
  pointIntersectionDD,
} from '../../lib/2d/utilitairesPoint'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { shuffle } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Utiliser les symboles ∈ et ∉'

export const dateDePublication = '27/02/2023'
export const dateDeModifImportante = '15/09/2026'
// Ajout de l'interactivité par Rémi Angot
export const interactifReady = true

/**
 * Aléatoirisation de https://www.youtube.com/watch?v=s-KelQ875a8
 * @author Guillaume Valmont

*/
export const uuid = 'a8f1f'

export const refs = {
  'fr-fr': ['6G0-8'],
  'fr-2016': ['6G51-2'],
  'fr-ch': ['9R1ES1A-6', '9R2ES1A-6', '9R3ES1A-6'],
}
export default class UtilerAppartientA extends Exercice {
  constructor() {
    super()

    this.consigne = 'Compléter en utilisant les symboles $\\in$ et $\\notin$.'
    this.nbQuestions = 8
    this.nbCols = 4
    this.nbColsCorr = 4
  }

  nouvelleVersion() {
    const objetsEnonce = []
    const lettres = choisitLettresDifferentes(6)
    let rayon = 6
    if (context.isHtml) rayon = 8
    const A = pointAbstrait(0, 0, lettres[0])
    let B = pointAbstrait(0, 0)
    let C = pointAbstrait(0, 0)
    let D = pointAbstrait(0, 0)
    let E = pointAbstrait(0, 0)
    let F: false | PointAbstrait = false
    while (!F) {
      const angle = randint(0, 359)
      B = pointAdistance(A, rayon, angle, lettres[1])
      D = pointAdistance(A, rayon, angle + 60, lettres[3])
      const CentreBD = randint(4, 6) / 10
      C = pointAbstrait(
        B.x * CentreBD + D.x * (1 - CentreBD),
        B.y * CentreBD + D.y * (1 - CentreBD),
        lettres[2],
      )
      const EentreAC = randint(4, 6) / 10
      E = pointAbstrait(
        A.x * EentreAC + C.x * (1 - EentreAC),
        A.y * EentreAC + C.y * (1 - EentreAC),
        lettres[4],
      )
      F = pointIntersectionDD(droite(B, E), droite(A, D), lettres[5])
    }
    const polyABE = polygoneAvecNom(A, B, E)
    const polyCFD = polygoneAvecNom(C, F, D)
    const segmentAB = segment(A, B)
    const segmentBC = segment(B, C)
    const segmentAC = segment(A, C)
    const demiDroiteBE = demiDroite(B, E)
    const demiDroiteAF = demiDroite(A, F)
    const demiDroiteBC = demiDroite(B, C)
    objetsEnonce.push(
      polyCFD[1],
      polyABE[1],
      segmentAB,
      segmentBC,
      segmentAC,
      demiDroiteBE,
      demiDroiteAF,
      demiDroiteBC,
    )
    const lisdeDesPossibilites = [
      {
        point: E,
        extremite1: A,
        extremite2: C,
        borne1: '[',
        borne2: ']',
        reponse: '$\\in$',
      },
      {
        point: D,
        extremite1: A,
        extremite2: F,
        borne1: '[',
        borne2: ']',
        reponse: '$\\notin$',
      },
      {
        point: D,
        extremite1: A,
        extremite2: F,
        borne1: '[',
        borne2: ')',
        reponse: '$\\in$',
      },
      {
        point: F,
        extremite1: B,
        extremite2: E,
        borne1: '(',
        borne2: ')',
        reponse: '$\\in$',
      },
      {
        point: A,
        extremite1: F,
        extremite2: D,
        borne1: '[',
        borne2: ')',
        reponse: '$\\notin$',
      },
      {
        point: E,
        extremite1: E,
        extremite2: C,
        borne1: '[',
        borne2: ']',
        reponse: '$\\in$',
      },
      {
        point: D,
        extremite1: A,
        extremite2: C,
        borne1: '(',
        borne2: ')',
        reponse: '$\\notin$',
      },
      {
        point: E,
        extremite1: B,
        extremite2: F,
        borne1: '[',
        borne2: ']',
        reponse: '$\\in$',
      },
      {
        point: C,
        extremite1: D,
        extremite2: B,
        borne1: '[',
        borne2: ']',
        reponse: '$\\in$',
      },
      {
        point: A,
        extremite1: E,
        extremite2: C,
        borne1: '(',
        borne2: ')',
        reponse: '$\\in$',
      },
      {
        point: C,
        extremite1: F,
        extremite2: E,
        borne1: '(',
        borne2: ')',
        reponse: '$\\notin$',
      },
      {
        point: E,
        extremite1: F,
        extremite2: D,
        borne1: '[',
        borne2: ')',
        reponse: '$\\notin$',
      },
    ]
    const possibilites = shuffle(lisdeDesPossibilites)
    const xmin = Math.min(A.x, B.x, C.x, D.x, E.x, F.x) - 2
    const xmax = Math.max(A.x, B.x, C.x, D.x, E.x, F.x) + 2
    const ymin = Math.min(A.y, B.y, C.y, D.y, E.y, F.y) - 2
    const ymax = Math.max(A.y, B.y, C.y, D.y, E.y, F.y) + 2
    const paramsEnonce = { xmin, ymin, xmax, ymax, pixelsParCm: 20, scale: 1 }
    this.introduction = '' + mathalea2d(paramsEnonce, objetsEnonce)
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (possibilites[i] === undefined) break
      texte = ''
      texteCorr = ''
      const pointNom = possibilites[i].point.nom
      const intervalle = `${possibilites[i].borne1}$${possibilites[i].extremite1.nom + possibilites[i].extremite2.nom}$${possibilites[i].borne2}`
      const reponse = possibilites[i].reponse === '$\\in$' ? 'in' : 'notin'
      if (this.interactif) {
        texte += `$${pointNom}$ ${choixDeroulant(this, i, {
          choices: [
            { label: '?', value: '' },
            { latex: '\\in', value: 'in' },
            { latex: '\\notin', value: 'notin' },
          ],
        })} ${intervalle}`
      } else {
        texte += `$${pointNom}$ $\\ldots{}$ ${intervalle}`
      }
      texteCorr += `$${pointNom}$ ${texteEnCouleurEtGras(possibilites[i].reponse)} ${intervalle}`
      if (
        this.questionJamaisPosee(
          i,
          possibilites[i].point.nom,
          possibilites[i].extremite1.nom,
          possibilites[i].extremite2.nom,
          possibilites[i].borne1,
          possibilites[i].borne2,
        )
      ) {
        handleAnswers(
          this,
          i,
          { reponse: { value: reponse } },
          { formatInteractif: 'liste-deroulante' },
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
