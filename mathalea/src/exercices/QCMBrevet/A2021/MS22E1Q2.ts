import { createList } from '../../../lib/format/lists'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '530db'
export const refs = {
  'fr-fr': ['3S2QCM-5', 'BP2FLUC6', 'BP1AUTO006'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Probabilités (septembre 2021 Métropole)'
export const dateDePublication = '08/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class MetropoleSep21Ex1Q2 extends ExerciceQcmA {
  private appliquerLesValeurs(
    nbJaunes: number,
    nbBleues: number,
    nbVertes: number,
    couleur: string,
  ): void {
    const nbBoulesAutres =
      couleur === 'verte'
        ? nbJaunes + nbBleues
        : couleur === 'jaune'
          ? nbVertes + nbBleues
          : nbVertes + nbJaunes
    const nbBoules = nbJaunes + nbBleues + nbVertes
    const nbBonneCouleur =
      couleur === 'jaune' ? nbJaunes : couleur === 'bleue' ? nbBleues : nbVertes
    const resultat = new FractionEtendue(nbBonneCouleur, nbBoules)

    this.reponses = [
      `$${resultat.texFraction}$`,
      `$\\dfrac{${nbBonneCouleur}}{${nbBoulesAutres}}$`,
      `$\\dfrac{${nbBoulesAutres}}{${nbBoules}}$`,
    ]
    const listeBoules = createList({
      items: [
        `$${nbJaunes}$ boules jaunes,`,
        `$${nbBleues}$ boules bleues,`,
        `$${nbVertes}$ boules vertes.`,
      ],
      style: 'puces',
    })

    this.enonce = `Une urne contient des boules indiscernables au toucher :<br>${listeBoules}On tire une boule au hasard.<br>
    Quelle est la probabilité d'obtenir une boule ${couleur} ?`
    this.correction = `Il y a $${nbBonneCouleur}$ boules de couleur ${couleur} et $${nbBoules}$ boules au total dans l'urne.<br>`
    this.correction += `La probabilité d'obtenir une boule ${couleur} est donc $${miseEnEvidence(resultat.texFraction)}$.`
    this.correction += resultat.estIrreductible
      ? ''
      : `<br>On aurait pu simplifier cette probabilité en $${resultat.simplifie().texFraction}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 2, 4, 'verte')
  }

  versionAleatoire: () => void = () => {
    const n = 3
    const couleur = choice(['jaune', 'bleue', 'verte'])
    let diff: number
    do {
      const nbJaunes = randint(3, 9)
      const nbBleues = randint(3, 9, [nbJaunes])
      const nbVertes = randint(3, 9, [nbJaunes, nbBleues])
      this.appliquerLesValeurs(nbJaunes, nbBleues, nbVertes, couleur)
      diff =
        couleur === 'jaune'
          ? nbJaunes - (nbBleues + nbVertes)
          : couleur === 'bleue'
            ? nbBleues - (nbJaunes + nbVertes)
            : nbVertes - (nbJaunes + nbBleues)
    } while (diff === 0 || nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
