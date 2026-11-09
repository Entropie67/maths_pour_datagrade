import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { listeNombresPremiersStrictJusqua } from '../../../lib/outils/primalite'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { texNombre } from '../../../lib/outils/texNombre'
export const uuid = '12ead'
export const refs = {
  'fr-fr': ['5A1QCM-1'],
  'fr-ch': ['9R2QCMNO-7', '9R3QCMNO-8', '10CTQCMNO-12'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Nombres premiers (Juin 2022 Amérique du nord)'
export const dateDePublication = '07/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AmeriqueNordJuin22Ex1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(liste: number[]): void {
    const produit = liste.reduce((acc, cur) => acc * cur, 1)
    const nbCent = Math.floor(produit / 100)
    const nbDiz = Math.floor((produit - 100 * nbCent) / 10)
    const unites = produit - nbDiz * 10 - nbCent * 100
    this.reponses = [
      `$${liste.join('\\times ')}$`,
      `$${nbCent > 0 ? `${nbCent}\\times 100+` : ''}${nbDiz > 0 ? `${nbDiz}\\times 10+` : ''}${unites}$`,
      `$${liste[0]}\\times ${liste[1] * liste[2]}$`,
      `$${liste[1]}\\times ${liste[0] * liste[2]}$`,
    ]

    this.enonce = `La décomposition en produit de facteurs premiers de $${texNombre(produit)}$ est :`
    this.correction = `Les nombres $${liste.join('\\text{ et }')}$ sont des nombres premiers.<br>
    $${liste.join('\\times ')}=${texNombre(produit)}$.<br>
    La décomposition en produit de facteurs premiers de $${texNombre(produit)}$ est $${miseEnEvidence(liste.join('\\times '))}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs([3, 5, 13])
  }

  versionAleatoire: () => void = () => {
    const n = 4
    let rond: boolean = false
    do {
      const decompo = shuffle(listeNombresPremiersStrictJusqua(29))
        .slice(0, 3)
        .sort((a, b) => a - b)
      rond = decompo.includes(2) && decompo.includes(5)
      this.appliquerLesValeurs(decompo)
    } while (rond || nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
