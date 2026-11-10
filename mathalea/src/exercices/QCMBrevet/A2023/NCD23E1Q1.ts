import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { decimalToScientifique, texNombre } from '../../../lib/outils/texNombre'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '6483e'
export const refs = {
  'fr-fr': ['3S2QCM-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Probabilité (12/2023 Nouvelle Calédonie)'
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class NouvelleCaledonieDec23Exo1Q1 extends ExerciceQcmA {
  private appliquerLesValeurs({
    texte,
    p,
  }: {
    texte: string
    p: number
  }): void {
    this.enonce = `Des chercheurs ont trouvé que la probabilité ${texte} est de : `
    const proba = p > 1 ? p / 100 : p
    const nombre = decimalToScientifique(proba)

    this.reponses = [
      `$${texNombre(nombre[0], 1)} \\times 10^{${nombre[1]}}$`,
      `$${texNombre(nombre[0], 1)} \\times 10^0$`,
      `$${texNombre(nombre[0], 1)} \\times 10^{${-nombre[1]}}$`,
    ]
    this.correction = `C'est la seule inférieure à $1$ : $${miseEnEvidence(`${texNombre(nombre[0], 1)} \\times 10^{${nombre[1]}}`)}$.`
  }

  versionAleatoire: () => void = () => {
    const n = 3
    const situations = [
      { texte: 'qu’il pleuve demain à Paris', p: 40 },
      {
        texte:
          'que la température dépasse $30^\\circ$C en été dans cette région',
        p: 25,
      },
      {
        texte:
          'qu’un train arrive en retard de plus de $10$ minutes aux heures de pointe',
        p: 15,
      },
      {
        texte:
          'qu’un passager trouve une place assise dans le métro aux heures de pointe',
        p: 40,
      },
      {
        texte:
          'qu’une équipe de football gagne après avoir marqué le premier but',
        p: 45,
      },
      { texte: 'qu’un joueur de basket réussisse un lancer franc', p: 80 },
      {
        texte: 'qu’une personne adulte dorme plus de $7$ heures par nuit',
        p: 55,
      },
      {
        texte: 'qu’une personne ait une carence en vitamine D en hiver',
        p: 30,
      },
      {
        texte:
          'que la batterie d’un smartphone se décharge en moins d’une journée',
        p: 70,
      },
      {
        texte:
          'qu’un utilisateur rencontre un bug en utilisant une application nouvellement lancée',
        p: 20,
      },
      {
        texte:
          'qu’une femme donne naissance à des quadruplés identiques (quatre jumeaux monozygotes)',
        p: 1 / 13000000,
      },
      {
        texte: 'qu’une femme donne naissance à des quadruplés naturels',
        p: 1 / 750000,
      },
      {
        texte:
          'd’obtenir un royal flush (la meilleure main possible en poker) lors de la première main distribuée',
        p: 1 / 649740,
      },
      {
        texte:
          'qu’une personne soit frappée par la foudre et gagne le gros lot à la loterie le même jour',
        p: 1 / 500000000000,
      },
      {
        texte:
          'de gagner le gros lot dans une loterie nationale avec un tirage de type loto (6 numéros sur 49)',
        p: 1 / 14000000,
      },
      {
        texte:
          'qu’une collision involontaire entre deux satellites se produise dans une orbite spécifique',
        p: 1 / 1000000,
      },
      {
        texte:
          'qu’une personne soit directement frappée par une météorite au cours de sa vie',
        p: 1 / 300000000,
      },
      {
        texte:
          'qu’une personne soit directement frappée par une météorite au cours de sa vie',
        p: 1.5 * 10 ** -9,
      },
      {
        texte:
          'de rencontrer une autre personne qui partage le même génome complet (hors jumeaux identiques) est de',
        p: 3.5 * 10 ** -10,
      },
      {
        texte:
          'qu’un vol commercial subisse une panne technique majeure mais non catastrophique',
        p: 1 / 12000,
      },
      {
        texte:
          'd’obtenir une combinaison spécifique comme un double $1$ suivi d’un double $6$ dans deux lancers de deux dés',
        p: 1 / (36 * 36),
      },
    ]
    do {
      this.appliquerLesValeurs(choice(situations))
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs({
      texte:
        "qu'une personne subisse une attaque mortelle par un requin au cours de sa vie",
      p: 2.7e-7,
    })
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
