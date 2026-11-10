import type { MathfieldElement } from 'mathlive'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { plot } from '../../../lib/2d/Plot'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import type { IExercice } from '../../../lib/types'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer la proportion de boules blanches dans un sac'
export const interactifReady = true

export const uuid = 'jjs2e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q16 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  enonce(nbBlanches?: number, nbNoires?: number) {
    if (nbBlanches == null || nbNoires == null) {
      const listeCas = [
        [3, 5],
        [5, 4],
        [2, 6],
        [5, 3],
        [3, 6],
        [4, 5],
        [2, 5],
        [3, 4],
        [4, 6],
        [3, 4],
      ]
      const cas = choice(listeCas)
      nbBlanches = cas[0]
      nbNoires = cas[1]
    }

    const total = nbBlanches + nbNoires
    const fraction = new FractionEtendue(nbBlanches, total)
    const fractionSimplifiee = fraction.simplifie()

    const callback = (exercice: IExercice, question: number) => {
      const mfe = document.querySelector(
        `#champTexteEx${exercice.numeroExercice}Q${question}`,
      ) as MathfieldElement
      if (mfe == null)
        return {
          isOk: false,
          feedback: '',
          score: { nbBonnesReponses: 0, nbReponses: 0 },
        }
      const numStr = mfe.getPromptValue('champ1') || ''
      const denStr = mfe.getPromptValue('champ2') || ''
      const num = Number(numStr)
      const den = Number(denStr)
      const isOk =
        num !== 0 &&
        !isNaN(num) &&
        den !== 0 &&
        !isNaN(den) &&
        num * total === nbBlanches * den
      if (isOk) {
        mfe.setPromptState('champ1', 'correct', true)
        mfe.setPromptState('champ2', 'correct', true)
      }
      const spanReponseLigne = document.querySelector(
        `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
      )
      if (spanReponseLigne != null) {
        spanReponseLigne.innerHTML = isOk ? '😎' : '☹️'
      }
      return {
        isOk,
        feedback: '',
        score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
      }
    }
    const objets = []

    // Création du sac (contour)
    const boiteGauche = 0
    const boiteDroite = 2.5
    const boiteBas = 0
    const boiteHaut = 2.5

    const coinBasGauche = pointAbstrait(boiteGauche, boiteBas)
    const coinBasDroit = pointAbstrait(boiteDroite, boiteBas)
    const coinHautGauche = pointAbstrait(boiteGauche, boiteHaut)
    const coinHautDroit = pointAbstrait(boiteDroite, boiteHaut)

    const coteGauche = segment(coinBasGauche, coinHautGauche)
    const coteBas = segment(coinBasGauche, coinBasDroit)
    const coteDroit = segment(coinBasDroit, coinHautDroit)

    objets.push(coteGauche, coteBas, coteDroit)

    // Création des boules avec plot() - POSITIONNÉES EN BAS
    const k = 4 // nombre de boules par ligne maximum

    for (let n = 0; n < total; n++) {
      const x = n % k
      const y = Math.floor(n / k)

      // Position depuis le bas de la boîte
      const posX = x * 0.6 + 0.3
      const posY = y * 0.6 + 0.3

      if (n < nbBlanches) {
        // Boule blanche : contour noir, pas de remplissage
        objets.push(
          plot(posX, posY, {
            rayon: 0.2,
            couleur: 'black',
            couleurDeRemplissage: 'white',
          }),
        )
      } else {
        // Boule noire : contour noir, remplissage noir
        objets.push(
          plot(posX, posY, {
            rayon: 0.2,
            couleur: 'black',
            couleurDeRemplissage: 'black',
          }),
        )
      }
    }

    this.consigne = mathalea2d(
      Object.assign(
        { center: !context.isHtml, scale: 0.5 },
        fixeBordures(objets),
      ),
      objets,
    )
    this.question =
      '\\text{La proportion de boules blanches dans cette boîte est  } \\dfrac{%{champ1}}{%{champ2}}.'

    this.correction = `Il y a $${nbBlanches}$ boules blanches sur un total de $${total}$ boules.<br>
La proportion de boules blanches est donc : $\\dfrac{${miseEnEvidence(nbBlanches)}}{${miseEnEvidence(total)}}${pgcd(nbBlanches, total) !== 1 ? `=${fractionSimplifiee.texFraction}` : ''}$.`

    this.reponse = {
      champ1: { value: nbBlanches.toString() },
      champ2: { value: total.toString() },
      bareme: toutPourUnPoint,
      callback,
    }
    this.canEnonce =
      mathalea2d(
        Object.assign(
          { center: !context.isHtml, scale: 0.5 },
          fixeBordures(objets),
        ),
        objets,
      ) + '<br>La proportion de boules blanches dans cette boîte est :'
    this.canReponseACompleter = '$\\dfrac{\\ldots}{\\ldots}$'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 4)
    else this.enonce()
  }
}
