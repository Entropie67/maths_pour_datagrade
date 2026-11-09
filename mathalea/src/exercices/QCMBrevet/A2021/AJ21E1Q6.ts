import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '5c0ab'
export const refs = {
  'fr-fr': ['4C2QCM-05'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Ratios (06/2021 Asie)'
export const dateDePublication = '09/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AsieJuin21Ex1Q6 extends ExerciceQcmA {
  private appliquerLesValeurs(l: number, h: number, h0: number): void {
    const l0 = Math.round((l * h0) / h)
    const l1 = (h0 * h) / l
    const l2 = 2 * (h0 - (l - h))
    this.reponses = [
      `$${texNombre(l0, 0)}\\text{ cm}$`,
      `$${texNombre(l1, 4)}\\text{ cm}$`,
      `$${texNombre(l2, 0)}\\text{ cm}$`,
    ]

    this.enonce = `La hauteur et la largeur d'une télévision suivent le ratio $${l}$ : $${h}$.<br> 
    Sachant que la hauteur de cette télévision est de $${String(h0)}\\text{ cm}$, combien mesure sa largeur ?`
    this.correction = `Un ratio de $${l}$ : $${h}$ signifie que pour $${h}\\text{ cm}$ de hauteur, il y a $${l}\\text{ cm}$ de largeur.<br>
    Or l'écran a une hauteur de $${h0}\\text{ cm}$, soit, $${texNombre(h0 / h, 0)}$ fois plus grande, donc sa largeur est : $${texNombre(l, 0)}\\times ${texNombre(h0 / h, 0)}=${miseEnEvidence(texNombre(l0, 0) + '\\text{ cm}')}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(16, 9, 54)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const l = choice([12, 16, 20])
      const h = 9
      const h0 = h * randint(1, 3) * 4
      this.appliquerLesValeurs(l, h, h0)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
