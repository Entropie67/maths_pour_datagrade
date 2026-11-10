// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid eb844 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  enleveDoublonNum,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  listeDesDiviseurs,
  pgcd,
  texFactorisation,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import type { OptionsComparaisonType } from '../../lib/types'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Decomposer et rechercher le plus grand diviseur commun de deux nombres'
export const interactifReady = true

export const dateDePublication = '13/11/2024'
export const dateDeModifImportante = '12/04/2026'
export const uuid = 'eb844'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * @author Jean-Claude LHOTE
 * Ajout de this.sup 7 et 8 par Guillaume Valmont le 12/04/2025
 * Refactorisation des paramètres et passage en multiMathfield par Éric Elter le 12/04/2026
 */

type OptionsComparaisonAvecClavier = OptionsComparaisonType & {
  keyboard?: string | undefined
}

type Reponse = [string, OptionsComparaisonAvecClavier]

/**
 * Construit la configuration pour un composant multiMathfield à partir
 * d'une liste d'items (énoncés) et de leurs réponses associées.
 *
 * Génère automatiquement :
 * - un `dataTemplate` avec préfixes a), b), c), ...
 * - un objet `dataOptions` contenant les champs %{champX} nécessaires
 *
 * IMPORTANT :
 * L’ordre des champs %{champX} doit correspondre exactement à l’ordre
 * des réponses dans `itemsReponses`.
 *
 * Exemple de correspondance :
 * itemsReponses = [
 *   [rep1, rep2], // → champ1, champ2
 *   [rep3],       // → champ3
 *   [rep4, rep5]  // → champ4, champ5
 * ]
 *
 * @param items Liste des énoncés (chaque item correspond à une ligne a), b), c)...)
 * @param itemsReponses Tableau des réponses associées à chaque item.
 * Chaque item contient une liste de couples [valeur attendue, options de comparaison].
 * @param keyboard Type de clavier à utiliser pour tous les champs (optionnel)
 *
 * @returns Un objet contenant :
 * - `dataTemplate` : string formatée pour multiMathfield
 * - `dataOptions` : configuration des champs (champ1, champ2, ...)
 *
 */
export function buildMultiMathfield(
  items: string[],
  itemsReponses: Reponse[][],
  keyboard: string | undefined = KeyboardType.clavierNumbers,
) {
  const lettres = 'abcdefghijklmnopqrstuvwxyz'

  // 🔹 1. Génération du template (a), b), c)...
  const dataTemplate = items
    .map((item, index) => {
      const prefix = items.length > 1 ? `${lettres[index]}) ` : ''
      return `${prefix}${item}`
    })
    .join('\n\n')

  const dataOptions: Record<string, { keyboard: string | undefined }> = {}

  let compteur = 1

  itemsReponses.forEach((item) => {
    item.forEach(([, options]) => {
      dataOptions[`champ${compteur}`] = {
        keyboard: options.keyboard ?? keyboard,
      }
      compteur++
    })
  })

  return {
    dataTemplate,
    dataOptions,
  }
}

export default class LireUnePuissanceOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Décomposition',
        '2 : Liste des diviseurs',
        '3 : PGCD',
        '4 : Conclusion',
        '5 : Toutes les questions',
      ].join('\n'),
    ]
    this.sup = '5'
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
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: 4,
      shuffle: false,
    }).map(Number)

    const listeTypeDeQuestions = enleveDoublonNum(typesDeQuestionsDisponibles)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
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
      Il souhaite répartir les $${nb1}$ ${situation.espece1}${situation.especePluriel} et les $${nb2}$ ${situation.espece2}${situation.especePluriel} dans des ${situation.groupement}s.<br>
      Il souhaite que chaque ${situation.groupement} comporte le même nombre de ${situation.espece1}${situation.especePluriel} et le même nombre de ${situation.espece2}${situation.especePluriel}.<br><br>`
      let indice = 1
      const items: string[] = []
      const itemsCorr: string[] = []
      const itemsReponses: Reponse[][] = []

      if (listeTypeDeQuestions.includes(1)) {
        items.push(
          `Décomposer, en produit de facteurs premiers, les nombres $${nb1}$ et $${nb2}$.${
            this.interactif
              ? `
          $${texNombre(nb1, 0)}=$%{champ${indice}}
          $${texNombre(nb2, 0)}=$%{champ${indice + 1}}`
              : ''
          }`,
        )
        itemsCorr.push(`La décomposition en produit de facteurs premiers de $${texNombre(nb1, 0)}$ est $${miseEnEvidence(texFactorisation(nb1, false))}$
                        et celle de $${texNombre(nb2, 0)}$ est $${miseEnEvidence(texFactorisation(nb2, false))}$, soit respectivement : $${miseEnEvidence(texFactorisation(nb1, true))}$
                        et $${miseEnEvidence(texFactorisation(nb2, true))}$.`)
        itemsReponses.push([
          [
            texFactorisation(nb1, true),
            {
              nbFacteursIdentiquesFactorisation: true,
              keyboard: KeyboardType.clavierDeBase,
            },
          ],
          [
            texFactorisation(nb2, true),
            {
              nbFacteursIdentiquesFactorisation: true,
              keyboard: KeyboardType.clavierDeBase,
            },
          ],
        ])
        indice = indice + 2
      }

      if (listeTypeDeQuestions.includes(2)) {
        items.push(`Trouver tous les entiers positifs qui divisent $${nb1}$ et $${nb2}$.
                    Écrire la liste des diviseurs en les séparant par des points-virgules.${
                      this.interactif
                        ? `
                    $${texNombre(nb1, 0)}=$%{champ${indice}}
                    $${texNombre(nb2, 0)}=$%{champ${indice + 1}}`
                        : ''
                    }`)

        itemsCorr.push(`Les diviseurs de $${texNombre(nb1, 0)}$ sont $${miseEnEvidence(listDiv1.join('~;~'))}$.<br>
                        Et ceux de $${texNombre(nb2, 0)}$ sont $${miseEnEvidence(listDiv2.join('~;~'))}$.`)

        itemsReponses.push([
          [
            listDiv1.join(';'),
            {
              suiteDeNombres: true,
              keyboard: KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            },
          ],
          [
            listDiv2.join(';'),
            {
              suiteDeNombres: true,
              keyboard: KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
            },
          ],
        ])
        indice = indice + 2
      }

      if (listeTypeDeQuestions.includes(3)) {
        const verbe =
          listeTypeDeQuestions.includes(1) || listeTypeDeQuestions.includes(2)
            ? 'En déduire'
            : 'Trouver'
        items.push(
          `${verbe} le plus grand nombre ${situation.groupementDet}${situation.groupement}s que le ${situation.qui} pourra constituer. ${
            this.interactif ? `%{champ${indice}}` : ''
          }`,
        )

        itemsCorr.push(
          `Le plus grand diviseur commun à $${texNombre(nb1, 0)}$ et $${texNombre(nb2, 0)}$ est $${miseEnEvidence(texNombre(pgcd12, 0))}$.`,
        )

        itemsReponses.push([[String(pgcd12), { nombreDecimalSeulement: true }]])
        indice++
      }

      if (listeTypeDeQuestions.includes(4)) {
        items.push(
          `Combien de ${situation.espece1}${situation.especePluriel} et de ${situation.espece2}${situation.especePluriel} y aura-t-il dans chaque ${situation.groupement} ?${
            this.interactif
              ? `
          Il y aura %{champ${indice}} ${situation.espece1}${situation.especePluriel}.
          Il y aura %{champ${indice + 1}} ${situation.espece2}${situation.especePluriel}.`
              : ''
          }`,
        )
        itemsCorr.push(`Il y aura $${texNombre(nb1, 0)}\\div ${texNombre(pgcd12, 0)}=${miseEnEvidence(texNombre(nb1parGroupe, 0))}$ ${situation.espece1}${situation.especePluriel}
                        et $${texNombre(nb2, 0)}\\div ${texNombre(pgcd12, 0)}=${miseEnEvidence(texNombre(nb2parGroupe, 0))}$ ${situation.espece2}${situation.especePluriel}
                        dans chaque ${situation.groupement}.`)

        itemsReponses.push([
          [String(nb1parGroupe), { nombreDecimalSeulement: true }],
          [String(nb2parGroupe), { nombreDecimalSeulement: true }],
        ])
      }

      const config = buildMultiMathfield(items, itemsReponses)

      texte += addMultiMathfield(this, i, config)

      const champs: Record<
        string,
        { value: string; options: OptionsComparaisonType }
      > = {}

      let compteur = 1

      itemsReponses.forEach((item) => {
        item.forEach(([value, options]) => {
          champs[`champ${compteur}`] = {
            value,
            options,
          }
          compteur++
        })
      })

      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          ...champs,
        },
        { formatInteractif: 'multi-mathfield' },
      )

      const listeCorr =
        items.length > 1
          ? createList({
              items: itemsCorr,
              style: 'alpha',
            })
          : itemsCorr[0]
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
