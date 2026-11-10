import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { MetaInteractif2d } from '../../lib/2d/interactif2d'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  ajouteChampTexteMathLive,
  ajouteFeedback,
} from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import type { IExercice } from '../../lib/types'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'

export const titre =
  "Déterminer la racine carrée d'un carré parfait (calcul mental)"
export const dateDeModifImportante = '04/02/2026'
export const amcReady = true
export const amcType = 'AMCNum'

export const interactifReady = true

/**
 * Déterminer la racine carrée d'un carré parfait compris entre 1 et 256
 * @author Stéphane Guyon et Guillaume Valmont
 */
export const uuid = 'f5cbd'

export const refs = {
  'fr-fr': ['4G20-2'],
  'fr-ch': ['10CTNO6A-1', '10LCNO6A-1', '10LSNO6A-1', 'PRQNO03B-8', 'PRQNO07B-2'],
}
const figureCarre = (aire: number, exercice: IExercice, question: number) => {
  const c = Math.sqrt(aire) / 4
  const A = pointAbstrait(0, 0)
  const B = pointAbstrait(4 + c, 0)
  const C = pointAbstrait(4 + c, 4 + c)
  const D = pointAbstrait(0, 4 + c)
  const ang1 = codageAngleDroit(A, B, C)
  const ang2 = codageAngleDroit(B, C, D)
  const ang3 = codageAngleDroit(C, D, A)
  const ang4 = codageAngleDroit(D, A, B)
  const cotesMarques = codageSegments(
    '//',
    bleuMathalea,
    A,
    B,
    B,
    C,
    C,
    D,
    D,
    A,
  )
  const square = carre(A, B)
  square.hachures = true
  square.couleurDesHachures = colorToLatexOrHTML('lightgray')
  const afficheAire = latex2d(
    `\\text{Aire : }${aire} \\text{ cm}^2`,
    2 + c / 2,
    2 + c / 2,
    {
      letterSize: 'small',
    },
  )
  const input = new MetaInteractif2d(
    [
      {
        x: 4 + c + 2,
        y: 2 + c / 2,
        content: `%{champ1} \\text{ cm}`,
        classe: KeyboardType.clavierNumbers,
        blanc: '\\ldots ',
        opacity: 1,
        index: 0,
      },
    ],
    {
      exercice,
      question,
    },
  )
  afficheAire.opacity = 0.5
  const objets: NestedObjetMathalea2dArray = [
    square,
    afficheAire,
    ang1,
    ang2,
    ang3,
    ang4,
    cotesMarques,
    input,
  ]
  return (
    mathalea2d(Object.assign({}, fixeBordures(objets)), objets) +
    `<span id="resultatCheckEx${exercice.numeroExercice}Q${question}"></span>` +
    ajouteFeedback(exercice, question)
  )
}

export default class RacineCareeDeCarresParfaits extends Exercice {
  constructor() {
    super()

    this.amcReady = amcReady
    this.amcType = amcType

    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.besoinFormulaireNumerique = [
      'Formulation de la question',
      3,
      '1 : Calculer la racine de ...\n2 : Trouver le nombre positif dont le carré est ...\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = ['Entier maximum', 2, '1 : 144\n2 : 256']
    this.besoinFormulaire3CaseACocher = [
      'Énoncé géométrique avec un carré',
      false,
    ]
    this.sup = 1
    this.sup2 = 2
    this.sup3 = false
  }

  nouvelleVersion() {
    let listeRacines = []
    let listeQuestions: number[] = []

    this.sup2 = parseInt(this.sup2)
    if (this.sup === 1) {
      listeQuestions = [1]
    } else if (this.sup === 2) {
      listeQuestions = [2]
    } else if (this.sup === 3) {
      listeQuestions = [1, 2]
    }
    listeQuestions = combinaisonListes(listeQuestions, this.nbQuestions) // pour varier les questions
    if (this.sup2 === 1) {
      listeRacines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    } else {
      listeRacines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    }
    listeRacines = combinaisonListes(listeRacines, this.nbQuestions) // pour avoir une meilleure randomisation que randint
    for (
      let i = 0, texte, texteCorr, a, c, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = listeRacines[i]
      c = a * a
      if (!this.sup3) {
        if (listeQuestions[i] === 1) {
          texte = `Calculer de tête $\\sqrt{${c}}$`
          texte += this.interactif
            ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                texteAvant: sp() + ' = ',
                texteApres: '.',
              })
            : '.'
        } else {
          texte =
            `Quel est le nombre positif dont le carré est $${c}$ ?` +
            ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        }
      } else {
        texte =
          figureCarre(c, this, i) +
          `Quelle est la longueur du côté de ce carré ?`
      }

      texteCorr = `$\\sqrt{${c}}${this.sup3 ? '\\text{ cm}' : ''}=${miseEnEvidence(a.toString())}${this.sup3 ? '\\text{ cm}' : ''}$`
      if (this.sup3) {
        handleAnswers(
          this,
          i,
          {
            field0: { value: a, options: { noFeedback: true } },
          },
          { formatInteractif: 'MetaInteractif2d' },
        )
      } else {
        handleAnswers(this, i, { reponse: { value: a.toString() } })
      }
      if (this.questionJamaisPosee(i, a)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
