import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  listeDesDiviseurs,
  pgcd,
  texFactorisation,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import Exercice from '../Exercice'

export const titre =
  'Decomposer et rechercher le plus grand diviseur commun de deux nombres'
export const interactifReady = true

export const dateDePublication = '13/11/2024'
export const uuid = 'cb844'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * @Author Jean-Claude LHOTE
 * Ajout de this.sup 7 et 8 par Guillaume Valmont le 12/04/2025
 */
export default class LireUnePuissance extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.sup = 6
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      6,
      '1 : Décomposition seulement\n2 : Decomposition et liste des diviseurs\n3 : Decomposition, liste des diviseurs et PGCD\n4 : Liste des diviseurs et PGCD\n5 : Liste des diviseurs, PGCD et conclusion\n6 : Toutes les questions\n7 : Décomposition et PGCD\n8 : Décomposition, PGCD et conclusion',
    ]
  }

  situations = [
    {
      qui: 'professeur',
      faitQuoi: 'organise une sortie scolaire',
      ou: 'au Futuroscope',
      pourQui: 'pour ses élèves de 3e',
      espece1: 'garçon',
      espece2: 'fille',
      especePluriel: 's',
      groupement: 'groupe',
      groupementDet: 'de ',
      premiers: [
        [5, 7],
        [7, 11],
        [3, 5],
      ],
    },
    {
      qui: 'fleuriste',
      faitQuoi: 'assemble des fleurs',
      ou: 'dans son atelier',
      pourQui: 'pour une commande',
      espece1: 'rose',
      espece2: 'tulipe',
      especePluriel: 's',
      groupement: 'bouquet',
      groupementDet: 'de ',
      premiers: [
        [5, 7],
        [7, 11],
        [11, 13],
        [17, 19],
      ],
    },
    {
      qui: 'pâtissier',
      faitQuoi: 'prépare des gâteaux',
      ou: 'dans sa pâtisserie',
      pourQui: 'pour un mariage',
      espece1: 'gateaux au chocolat',
      espece2: 'gâteaux à la vanille',
      especePluriel: '',
      groupement: 'plat',
      groupementDet: 'de ',
      premiers: [
        [5, 7],
        [2, 3],
        [3, 5],
        [5, 6],
        [3, 4],
      ],
    },
    {
      qui: 'boulanger',
      faitQuoi: 'cuit des viennoiseries',
      ou: 'dans sa boulangerie',
      pourQui: 'pour ses clients',
      espece1: 'brioche',
      espece2: 'croissant',
      especePluriel: 's',
      groupement: 'assortiment',
      groupementDet: "d'",
      premiers: [
        [5, 7],
        [5, 6],
        [3, 4],
        [6, 7],
        [7, 8],
      ],
    },
    {
      qui: 'collectionneur',
      faitQuoi: 'organise sa collection',
      ou: 'dans un musée',
      pourQui: 'pour une exposition',
      espece1: 'soldats de plomb',
      espece2: 'figurines en plastique',
      especePluriel: '',
      groupement: 'vitrine',
      groupementDet: 'de ',
      premiers: [
        [9, 8],
        [6, 7],
        [7, 8],
      ],
    },
    {
      qui: 'producteur',
      faitQuoi: 'plante des arbres',
      ou: 'dans son terrain',
      pourQui: 'pour son entreprise',
      espece1: 'pommier',
      espece2: 'poirier',
      especePluriel: 's',
      groupement: 'allée',
      groupementDet: "d'",
      premiers: [
        [5, 7],
        [5, 6],
        [3, 4],
        [6, 7],
        [7, 8],
      ],
    },
    {
      qui: 'maitre-nageur',
      faitQuoi: 'organise des cours de natation',
      ou: 'à la piscine',
      pourQui: 'pour ses élèves',
      espece1: 'garçon',
      espece2: 'fille',
      especePluriel: 's',
      groupement: 'groupe',
      groupementDet: 'de ',
      premiers: [
        [2, 3],
        [5, 6],
        [3, 4],
      ],
    },
    {
      qui: 'cuisinier',
      faitQuoi: 'prépare des plats',
      ou: 'dans sa cuisine',
      pourQui: 'pour un banquet',
      espece1: 'portions de viande',
      espece2: 'portions de légume',
      especePluriel: '',
      groupement: 'plat',
      groupementDet: 'de ',
      premiers: [
        [10, 12],
        [8, 9],
        [5, 6],
        [6, 7],
        [7, 8],
      ],
    },
    {
      qui: 'décorateur',
      faitQuoi: 'fait des compositions florales',
      ou: 'dans son atelier',
      pourQui: 'pour un mariage',
      espece1: 'fleurs rouge',
      espece2: 'fleurs blanche',
      especePluriel: 's',
      groupement: 'bouquet',
      groupementDet: 'de ',
      premiers: [
        [4, 6],
        [5, 7],
        [3, 4],
        [6, 8],
        [2, 4],
      ],
    },
  ]

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const listeQuestParChoix = [
        [1],
        [1, 2],
        [1, 2, 3],
        [2, 3],
        [2, 3, 4],
        [1, 2, 3, 4],
        [1, 3],
        [1, 3, 4],
      ]
      const listeQ = listeQuestParChoix[this.sup - 1]
      const situation = choice(this.situations)
      const [unPremier, unSecond] = shuffle(choice(situation.premiers))
      const facteurs1 = combinaisonListes([2, 3, 2, 3, 5, 2], 5).slice(0, 3)
      const nb1 = facteurs1.reduce((acc, val) => acc * val, unPremier)
      const nb2 = facteurs1.reduce((acc, val) => acc * val, unSecond)
      const listDiv1 = listeDesDiviseurs(nb1)
      const listDiv2 = listeDesDiviseurs(nb2)
      const pgcd12 = pgcd(nb1, nb2)
      const nb1parGroupe = nb1 / pgcd12
      const nb2parGroupe = nb2 / pgcd12
      let texte = `Un ${situation.qui} ${situation.faitQuoi} ${situation.ou} ${situation.pourQui}.<br>
      Il souhaite répartir les ${nb1} ${situation.espece1}${situation.especePluriel} et les ${nb2} ${situation.espece2}${situation.especePluriel} dans des ${situation.groupement}s.<br>
      Il souhaite que chaque ${situation.groupement} comporte le même nombre de ${situation.espece1}${situation.especePluriel} et le même nombre de ${situation.espece2}${situation.especePluriel}.<br>`
      const indiceI = i * listeQ.length
      let indiceII = 0

      const items: string[] = []
      const itemsCorr: string[] = []

      if (listeQ.includes(1)) {
        items.push(
          `Décomposer, en produit de facteurs premiers, les nombres ${nb1} et ${nb2}.${
            this.interactif
              ? `<br> $${texNombre(nb1, 0)} =$ ${ajouteChampTexteMathLive(
                  this,
                  indiceI + indiceII,
                  KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
                )}<br>$${texNombre(nb2, 0)} =$ ${ajouteChampTexteMathLive(this, indiceI + indiceII + 1, KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets)}`
              : ''
          }`,
        )
        itemsCorr.push(`La décomposition en produit de facteurs premiers de $${texNombre(nb1, 0)}$ est $${miseEnEvidence(texFactorisation(nb1, false))}$
et celle de $${texNombre(nb2, 0)}$ est $${miseEnEvidence(texFactorisation(nb2, false))}$, soit respectivement : $${miseEnEvidence(texFactorisation(nb1, true))}$
et $${miseEnEvidence(texFactorisation(nb2, true))}$.`)
        handleAnswers(this, indiceI + indiceII, {
          reponse: {
            value: texFactorisation(nb1, true),
            options: { nbFacteursIdentiquesFactorisation: true },
          },
        })
        handleAnswers(this, indiceI + indiceII + 1, {
          reponse: {
            value: texFactorisation(nb2),
            options: { nbFacteursIdentiquesFactorisation: true },
          },
        })
        indiceII += 2
      }
      if (listeQ.includes(2)) {
        items.push(`Trouver tous les entiers positifs qui divisent ${nb1} et ${nb2}.${this.interactif ? '<br>Écrire la liste des diviseurs en les séparant par des points-virgules.<br>' : ''}
             ${
               this.interactif
                 ? `Pour $${texNombre(nb1, 0)}$ : ${ajouteChampTexteMathLive(this, indiceI + indiceII, KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets)}<br>Pour $${texNombre(nb2, 0)}$ : ${ajouteChampTexteMathLive(this, indiceI + indiceII + 1, KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets)}`
                 : ''
             }`)
        itemsCorr.push(`Les diviseurs de $${texNombre(nb1, 0)}$ sont $${miseEnEvidence(listDiv1.join('~;~'))}$.<br>
        Et ceux de $${texNombre(nb2, 0)}$ sont $${miseEnEvidence(listDiv2.join('~;~'))}$.`)
        handleAnswers(this, indiceI + indiceII, {
          reponse: {
            value: listDiv1.join(';'),
            options: { suiteDeNombres: true },
          },
        })
        handleAnswers(this, indiceI + indiceII + 1, {
          reponse: {
            value: listDiv2.join(';'),
            options: { suiteDeNombres: true },
          },
        })
        indiceII += 2
      }
      if (listeQ.includes(3)) {
        items.push(
          `En déduire le plus grand nombre ${situation.groupementDet}${situation.groupement}s que le ${situation.qui} pourra constituer.` +
            ajouteChampTexteMathLive(
              this,
              indiceI + indiceII,
              KeyboardType.clavierNumbers,
            ),
        )
        itemsCorr.push(
          `Le plus grand diviseur commun à $${texNombre(nb1, 0)}$ et $${texNombre(nb2, 0)}$ est $${miseEnEvidence(texNombre(pgcd12, 0))}$.`,
        )
        handleAnswers(this, indiceI + indiceII, {
          reponse: { value: String(pgcd12) },
        })
        indiceII += 1
      }
      if (listeQ.includes(4)) {
        items.push(
          `Combien de ${situation.espece1}${situation.especePluriel} et de ${situation.espece2}${situation.especePluriel} y aura-t-il dans chaque ${situation.groupement} ? ${this.interactif ? `<br> Il y aura ${ajouteChampTexteMathLive(this, indiceI + indiceII, KeyboardType.clavierNumbers)}  ${situation.espece1}${situation.especePluriel}.<br>Il y aura ${ajouteChampTexteMathLive(this, indiceI + indiceII + 1, KeyboardType.clavierNumbers)} ${situation.espece2}${situation.especePluriel}.` : ''}`,
        )
        itemsCorr.push(`Il y aura $${texNombre(nb1, 0)}\\div ${texNombre(pgcd12, 0)}=${miseEnEvidence(texNombre(nb1parGroupe, 0))}$ ${situation.espece1}${situation.especePluriel}
             et $${texNombre(nb2, 0)}\\div ${texNombre(pgcd12, 0)}=${miseEnEvidence(texNombre(nb2parGroupe, 0))}$ ${situation.espece2}${situation.especePluriel}
              dans chaque ${situation.groupement}.`)
        handleAnswers(this, indiceI + indiceII, {
          reponse: { value: String(nb1parGroupe) },
        })
        handleAnswers(this, indiceI + indiceII + 1, {
          reponse: { value: String(nb2parGroupe) },
        })
      }
      const liste = createList({
        items,
        style: 'alpha',
      })
      texte += liste
      const listeCorr = createList({
        items: itemsCorr,
        style: 'alpha',
      })
      const texteCorr = listeCorr
      if (this.questionJamaisPosee(i, nb1, nb2)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
