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

export const titre =
  "Représenter l'intersection des solutions de deux inégalités sur une droite graduée"
export const dateDePublication = '29/09/2026'
export const uuid = 'da9600'
export const interactifReady = true
export const refs = {
  'fr-fr': ['2N12-8'],
  'fr-ch': [],
}

type TypeBornes = 1 | 2 | 3 | 4

const bornesIncluses = (type: TypeBornes) => ({
  gauche: type === 2 || type === 4,
  droite: type === 3 || type === 4,
})

const systemeTex = (
  type: TypeBornes,
  a: number,
  b: number,
  inverseGauche: boolean,
  inverseDroite: boolean,
) => {
  const { gauche, droite } = bornesIncluses(type)
  const inegaliteGauche = inverseGauche
    ? `${a}${gauche ? '\\leqslant' : '<'} x`
    : `x${gauche ? '\\geqslant' : '>'}${a}`
  const inegaliteDroite = inverseDroite
    ? `${b}${droite ? '\\geqslant' : '>'} x`
    : `x${droite ? '\\leqslant' : '<'}${b}`
  return `\\begin{cases}${inegaliteGauche}\\\\${inegaliteDroite}\\end{cases}`
}

const intervalleTex = (type: TypeBornes, a: number, b: number) => {
  const { gauche, droite } = bornesIncluses(type)
  return `${gauche ? '[' : ']'}${a}\\,;\\,${b}${droite ? ']' : '['}`
}

const intervalleInteractif = (
  type: TypeBornes,
  a: number,
  b: number,
): IntervalleDroiteValue => {
  const { gauche, droite } = bornesIncluses(type)
  return {
    start: a,
    end: b,
    leftBracket: gauche ? '[' : ']',
    rightBracket: droite ? ']' : '[',
  }
}

function construitDroite(a: number, b: number, type?: TypeBornes) {
  const min = a - 2
  const max = b + 2
  const unite = Math.min(1.6, 9.6 / (max - min))
  const xA = (a - min) * unite
  const xB = (b - min) * unite
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
    labelListe:
      type === undefined
        ? [
            [a, String(a)],
            [b, String(b)],
          ]
        : [],
  })
  const graduationA = segment(xA, -0.15, xA, 0.15)
  const graduationB = segment(xB, -0.15, xB, 0.15)
  const objets: ObjetMathalea2D[] = [axe, graduationA, graduationB]

  if (type !== undefined) {
    const { gauche, droite } = bornesIncluses(type)
    const A = pointAbstrait(xA, 0, String(a))
    const B = pointAbstrait(xB, 0, String(b))
    const partieColoriee = intervalle(A, B, orangeMathalea, 0)
    partieColoriee.epaisseur = 6

    const crochetGauche = gauche
      ? crochetD(A, orangeMathalea)
      : crochetG(A, orangeMathalea)
    const crochetDroite = droite
      ? crochetG(B, orangeMathalea)
      : crochetD(B, orangeMathalea)
    crochetGauche.taille = context.isHtml ? 0.2 : 0.35
    crochetDroite.taille = context.isHtml ? 0.2 : 0.35
    objets.push(partieColoriee, crochetGauche, crochetDroite)
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
 * Représenter l'intersection des solutions d'un système de deux inégalités.
 *
 * @author Stéphane Guyon
 */
export default class RepresenterIntersectionInegalites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.consigne =
      'Représenter sur chaque droite graduée l’intersection des ensembles de solutions des deux inégalités.'
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const types = combinaisonListes(
      [1, 2, 3, 4] as TypeBornes[],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = types[i]
      const a = randint(-8, 3)
      const b = randint(a + 2, Math.min(a + 7, 9))
      const inverseGauche = randint(1, 4) === 1
      const inverseDroite = randint(1, 4) === 1
      const systeme = systemeTex(type, a, b, inverseGauche, inverseDroite)
      const texte = `$${systeme}$<br><br>${
        this.interactif
          ? addIntervalleDroite(this, i, {
              min: a - 2,
              max: b + 2,
              labelValues: [a, b],
              showGraduations: false,
            })
          : construitDroite(a, b)
      }`
      const intervalleSolution = intervalleTex(type, a, b)
      const texteCorr = `La première inégalité impose de colorier à droite de $${a}$ et la seconde à gauche de $${b}$. Leur intersection est donc la partie comprise entre $${a}$ et $${b}$.<br><br>${construitDroite(a, b, type)}<br>L’ensemble des solutions du système est $${miseEnEvidence(intervalleSolution)}$.`

      if (
        this.questionJamaisPosee(
          i,
          type,
          a,
          b,
          Number(inverseGauche),
          Number(inverseDroite),
        )
      ) {
        if (this.interactif) {
          handleAnswers(
            this,
            i,
            {
              reponse: {
                value: JSON.stringify(intervalleInteractif(type, a, b)),
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
