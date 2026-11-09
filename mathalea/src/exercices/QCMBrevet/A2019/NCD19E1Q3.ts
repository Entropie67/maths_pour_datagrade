import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '96444'
export const refs = {
  'fr-fr': ['3C1QCM-07', 'BP2AutoU1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Puissances de $10$ et ordre de grandeur (12/2019 Nouvelle-Calédonie)'
export const dateDePublication = '12/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class NelleCaledoniep19Ex1Q3 extends ExerciceQcmA {
  planetes = [
    { nom: 'Mercure', masse: 3.3e23 },
    { nom: 'Vénus', masse: 4.87e24 },
    { nom: 'Terre', masse: 5.97e24 },
    { nom: 'Mars', masse: 6.42e23 },
    { nom: 'Jupiter', masse: 1.9e27 },
    { nom: 'Saturne', masse: 5.68e26 },
    { nom: 'Uranus', masse: 8.68e25 },
    { nom: 'Neptune', masse: 1.02e26 },
  ]

  private appliquerLesValeurs({
    nom,
    masse,
  }: {
    nom: string
    masse: number
  }): void {
    const ordreDeGrandeur = Math.round(Math.log10(masse))
    const expo1 = ordreDeGrandeur - 22
    const expo2 = ordreDeGrandeur - 41
    this.reponses = [
      `$10^{${ordreDeGrandeur}}$ kg`,
      `$10^{${expo1}}$ kg`,
      `$10^{${expo2}}$ kg`,
    ]
    this.enonce = `La masse de la planète ${nom} est de l'ordre de :`
    this.correction = `$10^{${expo2}}$ kg, c'est beaucoup moins que $1$ kg, c'est donc une réponse incohérente.<br>
    $10^{${expo1}}$ kg soit $10^{${expo1 - 3}}$ tonnes, c'est aussi assez faible au regard de la masse d'une planète.<br>
    La masse de la planète ${nom} est de l'ordre de $${miseEnEvidence(`10^{${ordreDeGrandeur}}`)}$ kg.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(this.planetes[7])
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      this.appliquerLesValeurs(choice(this.planetes))
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
