import {
    all,
    sameParametricLine,
    singleParameterVariable,
} from '../../../lib/interactif/checks'
import { sameParametricLineFromFieldsCallback } from '../../../lib/interactif/checks/sameParametricLineFromFields'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { ecritureAlgebriqueSauf1, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { columnTex, type Vector3 } from '../../../lib/outils/geometrieVectorielle'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer une représentation paramétrique d'une droite passant par deux points"
export const dateDePublication = '11/05/2026'
export const interactifReady = true

export const uuid = 'af71c'
export const refs = {
  'fr-ch': ['3G98-5'],
  'fr-fr': [],
}

function pointTex(name: string, point: Vector3): string {
  return `${name}(${point[0]}~;~${point[1]}~;~${point[2]})`
}

function affineCoordinateTex(origin: number, direction: number): string {
  if (direction === 0) return `${origin}`
  if (origin === 0) return `${rienSi1(direction)}k`
  return `${origin}${ecritureAlgebriqueSauf1(direction)}k`
}

function parametricSystemTex(point: Vector3, direction: Vector3): string {
  return `\\begin{cases}x=${affineCoordinateTex(point[0], direction[0])}\\\\y=${affineCoordinateTex(point[1], direction[1])}\\\\z=${affineCoordinateTex(point[2], direction[2])}\\end{cases}`
}

function highlightedParametricSystemTex(
  point: Vector3,
  direction: Vector3,
): string {
  return `\\begin{cases}x=${miseEnEvidence(affineCoordinateTex(point[0], direction[0]))}\\\\y=${miseEnEvidence(affineCoordinateTex(point[1], direction[1]))}\\\\z=${miseEnEvidence(affineCoordinateTex(point[2], direction[2]))}\\end{cases}`
}

export default class RepresentationParametriqueDroiteDeuxPoints extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const pointA: Vector3 = [randint(-5, 5), randint(-5, 5), randint(-5, 5)]
      const direction: Vector3 = [
        randint(-5, 5, 0),
        randint(-5, 5),
        randint(-5, 5),
      ]
      const pointB: Vector3 = [
        pointA[0] + direction[0],
        pointA[1] + direction[1],
        pointA[2] + direction[2],
      ]
      const systeme = parametricSystemTex(pointA, direction)
      const expected = JSON.stringify({
        point: pointA,
        direction,
      })

      let texte =
        "Dans un repère orthonormé de l'espace, déterminer une représentation paramétrique de la droite passant par les deux points suivants :<br>"
      texte += `$${pointTex('A', pointA)}$ et $${pointTex('B', pointB)}$.`
      if (this.interactif) {
        texte +=
          '<br>' +
          remplisLesBlancs(
            this,
            i,
            '\\begin{cases}x=%{champ1}\\\\y=%{champ2}\\\\z=%{champ3}\\end{cases}\\quad k\\in\\mathbb{R}',
          )
      }

      const callback = sameParametricLineFromFieldsCallback({
        compare: all([
          singleParameterVariable({
            dimension: 3,
            expectedParameter: 'k',
            feedbackOnSuccess: true,
          }),
          sameParametricLine({ dimension: 3 }),
        ]),
        dimension: 3,
      })
      handleAnswers(this, i, {
        champ1: {
          value: expected,
        },
        champ2: {
          value: expected,
        },
        champ3: {
          value: expected,
        },
        callback,
      })

      let texteCorr = `Le vecteur $\\overrightarrow{AB}$ est un vecteur directeur de la droite $(AB)$ car ses extrémités $A$ et $B$ sont deux points distincts de cette droite : il en donne donc la direction.<br>`
      texteCorr += `$\\overrightarrow{AB}=${columnTex([
        pointB[0] - pointA[0],
        pointB[1] - pointA[1],
        pointB[2] - pointA[2],
      ])}$.<br>`
      texteCorr += `Soit $P(x~;~y~;~z)$ un point de la droite $(AB)$.<br>`
      texteCorr += `$P\\in(AB)\\iff \\overrightarrow{OP}=\\overrightarrow{OA}+k\\overrightarrow{AB}$ avec $k\\in\\mathbb{R}$.<br>`
      texteCorr += `Comme $\\overrightarrow{OA}=${columnTex(pointA)}$ et $\\overrightarrow{AB}=${columnTex(direction)}$, on obtient :<br>`
      texteCorr += `$P\\in(AB)\\iff ${systeme},\\quad k\\in\\mathbb{R}$.<br>`
      texteCorr += `Une représentation paramétrique de la droite $(AB)$ est donc :<br>`
      texteCorr += `$${highlightedParametricSystemTex(pointA, direction)},\\quad k\\in\\mathbb{R}$.<br>`
      texteCorr += `On aurait aussi pu choisir le point $B$ comme point de départ ou utiliser tout vecteur non nul colinéaire à $\\overrightarrow{AB}$.`

      if (this.questionJamaisPosee(i, ...pointA, ...pointB)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
