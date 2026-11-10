import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { crochetD, crochetG, intervalle } from '../../lib/2d/intervalles'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { orangeMathalea } from '../../lib/colors'
import {
  addIntervalleDroite,
  type IntervalleDroiteValue,
} from '../../lib/customElements/IntervalleDroiteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Représenter une inégalité sur une droite graduée'
export const dateDePublication = '30/09/2026'
export const uuid = 'a6e62'
export const interactifReady = true
export const refs = {
  'fr-fr': ['2N12-7'],
  'fr-ch': [],
}

type TypeInegalite = 1 | 2 | 3 | 4

const symboleInegalite = (type: TypeInegalite) => {
  switch (type) {
    case 1:
      return '\\gt'
    case 2:
      return '\\lt'
    case 3:
      return '\\geqslant'
    case 4:
      return '\\leqslant'
  }
}

const inegaliteTex = (type: TypeInegalite, a: number, inversee: boolean) => {
  if (!inversee) return `x${symboleInegalite(type)}${a}`
  switch (type) {
    case 1:
      return `${a}\\lt x`
    case 2:
      return `${a}\\gt x`
    case 3:
      return `${a}\\leqslant x`
    case 4:
      return `${a}\\geqslant x`
  }
}

const intervalleTex = (type: TypeInegalite, a: number) => {
  switch (type) {
    case 1:
      return `]${a}\\,;\\,+\\infty[`
    case 2:
      return `]-\\infty\\,;\\,${a}[`
    case 3:
      return `[${a}\\,;\\,+\\infty[`
    case 4:
      return `]-\\infty\\,;\\,${a}]`
  }
}

const intervalleInteractif = (
  type: TypeInegalite,
  a: number,
): IntervalleDroiteValue => {
  const min = a - 3
  const max = a + 3
  switch (type) {
    case 1:
      return { start: a, end: max, leftBracket: ']', rightBracket: null }
    case 2:
      return { start: min, end: a, leftBracket: null, rightBracket: '[' }
    case 3:
      return { start: a, end: max, leftBracket: '[', rightBracket: null }
    case 4:
      return { start: min, end: a, leftBracket: null, rightBracket: ']' }
  }
}

const justification = (type: TypeInegalite, a: number) => {
  switch (type) {
    case 1:
      return `Les solutions sont les nombres strictement supérieurs à $${a}$ : on colorie donc la demi-droite située à droite de $${a}$.<br>Le nombre $${a}$ n’est pas solution, car l’inégalité est stricte : le crochet est tourné vers l’extérieur de la partie coloriée.`
    case 2:
      return `Les solutions sont les nombres strictement inférieurs à $${a}$ : on colorie donc la demi-droite située à gauche de $${a}$.<br>Le nombre $${a}$ n’est pas solution, car l’inégalité est stricte : le crochet est tourné vers l’extérieur de la partie coloriée.`
    case 3:
      return `Les solutions sont les nombres supérieurs ou égaux à $${a}$ : on colorie donc la demi-droite située à droite de $${a}$.<br>Le nombre $${a}$ est solution, car l’égalité est autorisée : le crochet est tourné vers la partie coloriée.`
    case 4:
      return `Les solutions sont les nombres inférieurs ou égaux à $${a}$ : on colorie donc la demi-droite située à gauche de $${a}$.<br>Le nombre $${a}$ est solution, car l’égalité est autorisée : le crochet est tourné vers la partie coloriée.`
  }
}

function construitDroite(a: number, type?: TypeInegalite) {
  const min = a - 3
  const max = a + 3
  const unite = 1.6
  const xA = (a - min) * unite
  const xMax = (max - min) * unite + 0.5
  const axe = droiteGraduee({
    Min: min,
    Max: max,
    Unite: unite,
    x: 0,
    y: 0,
    axeEpaisseur: 1.5,
    thickDistance: 1,
    thickEpaisseur: 0,
    labelsPrincipaux: false,
    labelListe: type === undefined ? [[a, String(a)]] : [],
  })
  const graduation = segment(xA, -0.15, xA, 0.15)
  const objets: ObjetMathalea2D[] = [axe, graduation]

  if (type !== undefined) {
    const A = pointAbstrait(xA, 0, String(a))
    const gauche = pointAbstrait(-0.2, 0)
    const droite = pointAbstrait(xMax + 0.2, 0)
    const versDroite = type === 1 || type === 3
    const egalite = type === 3 || type === 4
    const partieColoriee = versDroite
      ? intervalle(A, droite, orangeMathalea, 0)
      : intervalle(gauche, A, orangeMathalea, 0)
    partieColoriee.epaisseur = 6

    const crochet = versDroite
      ? egalite
        ? crochetD(A, orangeMathalea)
        : crochetG(A, orangeMathalea)
      : egalite
        ? crochetG(A, orangeMathalea)
        : crochetD(A, orangeMathalea)
    crochet.taille = context.isHtml ? 0.2 : 0.35
    objets.push(partieColoriee, crochet)
  }

  return mathalea2d(
    {
      xmin: -0.7,
      xmax: xMax + 0.7,
      ymin: -1.2,
      ymax: 1.2,
      scale: 0.75,
    },
    objets,
  )
}

/**
 * Représenter l'ensemble des solutions d'une inégalité sur une droite graduée.
 *
 * @author Stéphane Guyon
 */
export default class RepresenterInegaliteSurDroite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.consigne =
      'Représenter sur chaque droite graduée l’ensemble des nombres réels vérifiant l’inégalité donnée.'
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const types = combinaisonListes(
      [1, 2, 3, 4] as TypeInegalite[],
      this.nbQuestions,
    )
    const orientationsInversees = combinaisonListes(
      [false, false, true, true],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = types[i]
      const a = randint(-8, 8)
      const inversee = orientationsInversees[i]
      const inegalite = inegaliteTex(type, a, inversee)
      const texte = `$${inegalite}$<br><br>${
        this.interactif
          ? addIntervalleDroite(this, i, {
              min: a - 3,
              max: a + 3,
              labelValue: a,
              showGraduations: false,
            })
          : construitDroite(a)
      }`
      const texteCorr = `${justification(type, a)}<br><br>${construitDroite(a, type)}<br>L’ensemble des solutions est $${miseEnEvidence(intervalleTex(type, a))}$.`

      if (this.questionJamaisPosee(i, type, a, Number(inversee))) {
        if (this.interactif) {
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: JSON.stringify(intervalleInteractif(type, a)),
              },
            },
            { formatInteractif: 'intervalle-droite' },
          )
        }
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
