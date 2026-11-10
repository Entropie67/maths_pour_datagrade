import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '6a9da'
export const refs = {
  'fr-fr': ['3S2QCM-4', 'BP2FLUC5', 'BP1AUTO005'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Probabilités (Juin 2022 Amérique du nord)'
export const dateDePublication = '07/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class AmeriqueNordJuin22Ex1Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(
    maxInclus: number,
    nbFaces: number,
    adjectif: string,
  ): void {
    const f1 = maxInclus / nbFaces
    const f2 = (nbFaces - maxInclus + 1) / nbFaces

    if (
      adjectif === 'inférieur' &&
      (f1 === 1 / maxInclus || f1 === maxInclus / 6 || f1 === 1 / nbFaces)
    ) {
      maxInclus++
    }
    if (
      adjectif === 'supérieur' &&
      (f2 === 1 / maxInclus || f2 === maxInclus / 6 || f2 === 1 / nbFaces)
    ) {
      maxInclus--
    }

    const resultat =
      adjectif === 'inférieur'
        ? new FractionEtendue(maxInclus, nbFaces)
        : new FractionEtendue(nbFaces - maxInclus + 1, nbFaces)
    this.reponses = [
      `$${resultat.texFractionSimplifiee}$`,
      `$\\dfrac{1}{${maxInclus}}$`,
      `$\\dfrac{${maxInclus}}{6}$`,
      `$\\dfrac{1}{${nbFaces}}$`,
    ]

    this.enonce = `On lance un dé équilibré à $${nbFaces}$ faces numérotées de $1$ à $${nbFaces}$.<br>La probabilité pour que le numéro tiré soit ${adjectif} ou égal à $${maxInclus}$ est :`
    this.correction = `Les issues favorables qui réalisent l'événement "tirer un numéro ${adjectif} ou égal à $${maxInclus}$" sont les numéros $${
      adjectif === 'inférieur'
        ? `1, \\ldots, ${maxInclus}`
        : `${maxInclus}, \\ldots, ${nbFaces}`
    }
$.<br>`
    this.correction += `Il y a donc $${
      adjectif === 'inférieur' ? maxInclus : nbFaces - maxInclus + 1
    }$
     issues favorables et $${nbFaces}$ issues possibles.<br>`
    this.correction += `La probabilité de tirer un numéro ${adjectif} ou égal à $${maxInclus}$ est donc $${miseEnEvidence(resultat.texFraction)}$${
      resultat.estIrreductible
        ? ''
        : ` ${texteEnCouleurEtGras('soit')} $${miseEnEvidence(resultat.texFractionSimplifiee)}$`
    }.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(5, 20, 'inférieur')
  }

  versionAleatoire: () => void = () => {
    const n = 4
    const adjectif = choice(['inférieur', 'supérieur'])
    do {
      const nbFaces = choice([8, 10, 12, 20])
      const maxInclus = randint(3, nbFaces - 3)
      this.appliquerLesValeurs(maxInclus, nbFaces, adjectif)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
