import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomF } from '../../../lib/outils/Personne'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '67e1d'
export const refs = {
  'fr-fr': ['3L1QCM-01'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Équation (2013 Amérique du nord)'
export const dateDePublication = '30/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AmeriqueJuin13Exo1Q2 extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    lea: string,
  ): void {
    const nbPiedsTotal = a * 3 + b * 4
    const distracteur1 = nbPiedsTotal - (c === 3 ? b : a)
    const distracteur2 = nbPiedsTotal - c
    const bonneReponse = (nbPiedsTotal - (c === 3 ? b * 4 : a * 3)) / c
    const dejaComptes = c === 3 ? 4 * b : 3 * a
    const reste = nbPiedsTotal - dejaComptes
    this.reponses = [
      `$${String(bonneReponse)}$`,
      `$${String(distracteur1)}$`,
      `$${String(distracteur2)}$`,
    ]
    this.enonce = `Dans une salle, il y a des tables à $3$ pieds et à $4$ pieds. ${lea} compte avec les yeux bandés $${nbPiedsTotal}$ pieds.<br>`
    this.enonce +=
      c === 3
        ? `Son frère lui indique qu'il y a $${b}$ tables à $4$ pieds.<br>Sans enlever son bandeau, elle parvient à donner le nombre de tables à $3$ pieds qui est de :`
        : `Son frère lui indique qu'il y a $${a}$ tables à $3$ pieds.<br>Sans enlever son bandeau, elle parvient à donner le nombre de tables à $4$ pieds qui est de :`
    this.correction = `Puisque son frère compte $${c === 3 ? b : a}$ tables à $${c === 3 ? '4' : '3'}$ pieds, ${lea} sait qu'il y a déjà $${c === 3 ? b : a}\\times ${c === 3 ? 4 : 3} = ${c === 3 ? 4 * b : 3 * a}$ pieds de comptés.<br>`
    this.correction += `Elle compte donc : $${nbPiedsTotal}-${dejaComptes}=${reste}$ pieds restants.<br>`
    this.correction += `Elle divise donc ce nombre de pieds restants par $${c}$ pour avoir le nombre de tables de $${c}$ pieds :<br>`
    this.correction += `$\\dfrac{${reste}}{${c}}=${miseEnEvidence(String(bonneReponse))}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(11, 34, 3, 'Léa')
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const lea = prenomF(1)
      const a = randint(9, 16)
      const b = randint(15, 30)
      this.appliquerLesValeurs(
        a,
        b,
        choice([3, 4]),
        Array.isArray(lea) ? lea[0] : lea,
      )
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
