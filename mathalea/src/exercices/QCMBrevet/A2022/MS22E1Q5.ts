import { createList } from '../../../lib/format/lists'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = 'b07d9'
export const refs = {
  'fr-fr': ['3S2QCM-3', 'BP2FLUC4', 'BP1AUTO004'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Probabilités (septembre 2022 Métropole)'
export const dateDePublication = '07/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class MetropoleSep22Ex1Q5 extends ExerciceQcmA {
  private appliquerLesValeurs(
    nbNoires: number,
    nbBlanches: number,
    nbRouges: number,
    couleur: string,
  ): void {
    const autresCouleurs =
      couleur === 'noire'
        ? 'blanche ou rouge'
        : couleur === 'blanche'
          ? 'noire ou rouge'
          : 'noire ou blanche'
    const nbBoules = nbNoires + nbBlanches + nbRouges
    const nbBonneCouleur =
      couleur === 'noire'
        ? nbNoires
        : couleur === 'blanche'
          ? nbBlanches
          : nbRouges
    const resultat = new FractionEtendue(nbBoules - nbBonneCouleur, nbBoules)

    this.reponses = [
      `$${resultat.texFraction}$`,
      `$\\dfrac{1}{${nbBonneCouleur}}$`,
      `$\\dfrac{${nbBonneCouleur - 1}}{${nbBoules}}$`,
    ]
    const listeBoules = createList({
      items: [
        `$${nbNoires}$ boules noires,`,
        `$${nbBlanches}$ boules blanches,`,
        `$${nbRouges}$ boules rouges.`,
      ],
      style: 'puces',
    })

    this.enonce = `Une urne contient $${nbBoules}$ boules indiscernables au toucher :<br>${listeBoules}Quelle est la probabilité de ne pas tirer de boule ${couleur} ?`
    this.correction = `Ne pas tirer de boule ${couleur} signifie tirer une boule de couleur différente de ${couleur}.<br>`
    this.correction += `La probabilité de ne pas tirer de boule ${couleur} est donc la probabilité de tirer une boule de couleur ${autresCouleurs}.<br>`
    this.correction += `Il y a $${nbBoules - nbBonneCouleur}$ boules de couleur ${autresCouleurs} et $${nbBoules}$ boules au total dans l'urne.<br>`
    this.correction += `La probabilité de ne pas tirer de boule ${couleur} est donc $${miseEnEvidence(resultat.texFraction)}$.`
    this.correction += resultat.estIrreductible
      ? ''
      : `<br>On aurait pu simplifier cette probabilité en $${resultat.simplifie().texFraction}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 4, 2, 'noire')
  }

  versionAleatoire: () => void = () => {
    const n = 3
    const couleur = choice(['noire', 'blanche', 'rouge'])
    do {
      const nbNoires = randint(3, 9)
      const nbBlanches = randint(3, 9, [nbNoires])
      const nbRouges = randint(3, 9, [nbNoires, nbBlanches])
      this.appliquerLesValeurs(nbNoires, nbBlanches, nbRouges, couleur)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
