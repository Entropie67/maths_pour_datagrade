import { orangeMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import SchemaEnBoite from '../../lib/outils/SchemaEnBoite'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = '9d5ef'
export const refs = {
  'fr-fr': ['CM2N6C-4'],
  'fr-2016': ['c3C32-02'],
  'fr-ch': ['9R1NO7G-4', '9R2NO7G-4', '9R3NO7G-4', 'PRQNO15A-14', 'PRQPF04A-6'],
}
export const titre =
  'Au marché (addition et soustraction de masses, conversions)'
export const dateDePublication = '20/11/2024'
export const dateDeModifImportante = '21/04/2025'

export const interactifReady = true
export const prenoms = [
  // Féminins
  'Amina', // Arabe
  'Chloé', // Français
  'Mei', // Chinois
  'Ananya', // Indien
  'Fatou', // Africain (Sénégal)
  'Isabella', // Italien/espagnol
  'Aya', // Japonais
  'Laila', // Perse/arabe
  'Sofia', // Européen
  'Zara', // Turc
  'Emma', // Français
  'Jade', // Français
  'Louise', // Français
  'Alice', // Français
  'Chloé', // Français
  'Lina', // Français
  'Léa', // Français
  'Manon', // Français
  'Camille', // Français
  'Rose', // Français
  'Lucas', // Français
  'Hugo', // Français
  'Louis', // Français
  'Gabriel', // Français
  'Léo', // Français
  'Arthur', // Français
  'Nathan', // Français
  'Jules', // Français
  'Raphaël', // Français
  'Noah', // Français
  'Ali', // Arabe
  'Hugo', // Français
  'Wei', // Chinois
  'Arjun', // Indien
  'Mamadou', // Africain (Sénégal)
  'Luca', // Italien/espagnol
  'Takeshi', // Japonais
  'Omar', // Perse/arabe
  'Mateo', // Européen
  'Emir', // Turc
]

/**
 * @Author Jean-claude Lhote
 * Sources (eduscol) : https://eduscol.education.fr/ressources/numerique/2020/2020-exercices-mathematiques-6e
 * Ces exercices seront proposés systématiquement pour 3 niveaux de difficulté afin de différentier autour d'un même problème
 */
export default class ExerciceProbleme002 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'niveau de difficulté',
      3,
      '1 : Élèves à besoin\n2 : Moyens\n3 : Avancés',
    ]
    this.sup = 1
    this.besoinFormulaire3CaseACocher = [
      'Opération posée dans la correction',
      false,
    ]
    this.sup3 = false

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const prenomsMelanges = shuffle(prenoms)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const listeFruit1 = [
        {
          nomSingulier: 'une fraise',
          nomPluriel: 'fraises',
          pluriel: 'de fraises',
          masseUnitaire: 50,
          color: 'pink',
        },
        {
          nomSingulier: 'un abricot',
          nomPluriel: 'abricots',
          pluriel: "d'abricots",
          masseUnitaire: 100,
          color: 'orange',
        },
        {
          nomSingulier: 'un kiwi',
          nomPluriel: 'kiwis',
          pluriel: 'de kiwis',
          masseUnitaire: 150,
          color: 'olive',
        },
        {
          nomSingulier: 'un citron',
          nomPluriel: 'citrons',
          pluriel: 'de citrons',
          masseUnitaire: 100,
          color: 'yellow',
        },
        {
          nomSingulier: 'une orange',
          nomPluriel: 'oranges',
          pluriel: "d'oranges",
          masseUnitaire: 200,
          color: 'orange',
        },
        {
          nomSingulier: 'une banane',
          nomPluriel: 'bananes',
          pluriel: 'de bananes',
          masseUnitaire: 150,
          color: 'gold',
        },
        {
          nomSingulier: 'une pomme',
          nomPluriel: 'pommes',
          pluriel: 'de pommes',
          masseUnitaire: 200,
          color: 'red',
        },
        {
          nomSingulier: 'une poire',
          nomPluriel: 'poires',
          pluriel: 'de poires',
          masseUnitaire: 200,
          color: 'olive',
        },
        {
          nomSingulier: 'une cerise',
          nomPluriel: 'cerises',
          pluriel: 'de cerises',
          masseUnitaire: 5,
          color: 'purple',
        },
      ]
      const fruit1 = choice(listeFruit1)
      const fruit2 = choice(
        listeFruit1.filter(
          (fruit) => fruit.nomSingulier !== fruit1.nomSingulier,
        ),
      )
      const fruit3 = choice(
        listeFruit1.filter(
          (fruit) =>
            fruit.nomSingulier !== fruit1.nomSingulier &&
            fruit.nomSingulier !== fruit2.nomSingulier,
        ),
      )
      let quantiteFruit2: { litteral: string; nombre: number }
      let quantiteFruit3: { litteral: string; nombre: number }
      let quantiteFruit1: { litteral: string; nombre: number }
      let masseFruit1: number
      let masseFruit2: number
      let masseFruit3: number
      let masseTotale: number
      do {
        switch (this.sup) {
          case 1:
            quantiteFruit1 = {
              litteral: '',
              nombre: Math.round((randint(1, 7) * 500) / fruit1.masseUnitaire),
            }
            quantiteFruit2 = choice([
              {
                litteral: 'un demi-kilogramme',
                nombre: 500 / fruit2.masseUnitaire,
              },
              {
                litteral: 'un kilogramme',
                nombre: 1000 / fruit2.masseUnitaire,
              },
              {
                litteral: 'un quart de kilogramme',
                nombre: 250 / fruit2.masseUnitaire,
              },
            ])
            quantiteFruit3 = {
              litteral: '',
              nombre: (randint(7, 25) * 50) / fruit3.masseUnitaire,
            }
            break
          case 3:
            quantiteFruit1 = {
              litteral: '',
              nombre: Math.round((randint(1, 7) * 500) / fruit1.masseUnitaire),
            }
            quantiteFruit2 = choice([
              {
                litteral: 'un demi-kilogramme',
                nombre: 500 / fruit2.masseUnitaire,
              },
              {
                litteral: 'un kilogramme',
                nombre: 1000 / fruit2.masseUnitaire,
              },
              {
                litteral: 'un quart de kilogramme',
                nombre: 250 / fruit2.masseUnitaire,
              },
            ])
            quantiteFruit3 = {
              litteral: '',
              nombre: (randint(7, 25) * 50) / fruit3.masseUnitaire,
            }
            break
          default:
            quantiteFruit1 = {
              litteral: '',
              nombre: Math.round(randint(1, 7) * 500) / fruit1.masseUnitaire,
            }
            quantiteFruit2 = choice([
              {
                litteral: 'un demi-kilogramme',
                nombre: 500 / fruit2.masseUnitaire,
              },
              {
                litteral: 'un kilogramme',
                nombre: 1000 / fruit2.masseUnitaire,
              },
              {
                litteral: 'un quart de kilogramme',
                nombre: 250 / fruit2.masseUnitaire,
              },
            ])
            quantiteFruit3 = {
              litteral: '',
              nombre: (randint(7, 25) * 50) / fruit3.masseUnitaire,
            }
            break
        }
        masseFruit1 = quantiteFruit1.nombre * fruit1.masseUnitaire
        masseFruit2 = quantiteFruit2.nombre * fruit2.masseUnitaire
        masseFruit3 = quantiteFruit3.nombre * fruit3.masseUnitaire
        masseTotale = (masseFruit1 + masseFruit2 + masseFruit3) / 1000
      } while (masseTotale > 4.7)

      let correction = ''
      const prenom = prenomsMelanges[i % prenoms.length]
      let listeCorrections: string[] = []
      let enonce = `${prenom} revient du marché. Il a acheté $${texNombre(masseFruit1)}$ g ${fruit1.pluriel}, ${quantiteFruit2.litteral} ${fruit2.pluriel} et a oublié la masse ${fruit3.pluriel} ${fruit3.nomSingulier.includes('une') ? 'achetées' : 'achetés'}.<br>
Le contenu de son panier pèse $${texNombre(masseTotale, 3, true)}$ kg.`
      let listeQuestions: string[] = []
      if (this.sup === 1) {
        listeQuestions = [
          'Exprimer la masse totale du panier en grammes.' +
            ajouteQuestionMathlive({
              exercice: this,
              question: 4 * i,
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: {
                reponse: { value: texNombre(masseTotale * 1000, 0) },
              },
              typeInteractivite: 'mathlive',
              texteApres: 'g',
            }),
          `Exprimer la masse des ${fruit2.nomPluriel} en grammes.` +
            ajouteQuestionMathlive({
              exercice: this,
              question: 4 * i + 1,
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: { reponse: { value: texNombre(masseFruit2, 0) } },
              typeInteractivite: 'mathlive',
              texteApres: 'g',
            }),
          `Quelle est la masse totale de ${fruit1.nomPluriel} et ${fruit2.nomPluriel} ${fruit1.nomSingulier.includes('une') && fruit2.nomSingulier.includes('une') ? 'achetées' : 'achetés'} ?` +
            ajouteQuestionMathlive({
              exercice: this,
              question: 4 * i + 2,
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: {
                reponse: { value: texNombre(masseFruit1 + masseFruit2, 0) },
              },
              typeInteractivite: 'mathlive',
              texteApres: 'g',
            }),
          `Quelle est la masse des ${fruit3.nomPluriel} ?` +
            ajouteQuestionMathlive({
              exercice: this,
              question: 4 * i + 3,
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: { reponse: { value: texNombre(masseFruit3, 0) } },
              typeInteractivite: 'mathlive',
              texteApres: 'g',
            }),
        ]
        listeCorrections = [
          `${this.correctionDetaillee ? `Pour exprimer la masse totale du panier en grammes, on multiplie la masse totale en kg par $${texNombre(1000, 0)}$.<br>` : ''}
          $${texNombre(masseTotale, 3, true)}\\times ${texNombre(1000, 0)} = ${texNombre(masseTotale * 1000, 0)}$ g<br>
          ${this.sup3 ? operation({ operande1: masseTotale, operande2: 1000, type: 'multiplication', precision: 0, options: { solution: true, colore: orangeMathalea } }) : ''}
             ${this.sup3 ? '<br><br>' : ''}
    La masse totale de fruits dans le panier est de $${miseEnEvidence(texNombre(masseTotale * 1000, 0))}$ g.`,
          `${this.correctionDetaillee ? `Pour exprimer la masse des ${fruit2.nomPluriel} en grammes, on multiplie la masse en kg par $${texNombre(1000, 0)}$.<br>` : ''}
          $${texNombre(masseFruit2 / 1000, 3, true)}\\times ${texNombre(1000, 0)}=${texNombre(masseFruit2, 0)}\\text{ g}$<br>
          ${this.sup3 ? operation({ operande1: masseFruit2 / 1000, operande2: 1000, type: 'multiplication', precision: 0, options: { solution: true, colore: orangeMathalea } }) : ''}
             ${this.sup3 ? '<br><br>' : ''}
    La masse des ${fruit2.nomPluriel} est de $${miseEnEvidence(texNombre(masseFruit2, 0))}$ g.`,
          `${this.correctionDetaillee ? `Pour exprimer la masse totale ${fruit1.pluriel} et ${fruit2.pluriel} ${fruit1.nomSingulier.includes('une') && fruit2.nomSingulier.includes('une') ? 'achetées' : 'achetés'}, on additionne les masses.<br>` : ''}
         ${
           this.correctionDetaillee
             ? `${new SchemaEnBoite({
                 lignes: [
                   {
                     barres: [
                       {
                         length: 4,
                         color: fruit1.color,
                         content: `$${texNombre(masseFruit1)}$`,
                       },
                       {
                         length: 4,
                         color: fruit2.color,
                         content: `$${texNombre(masseFruit2)}$`,
                       },
                     ],
                   },
                   {
                     barres: [
                       {
                         length: 8,
                         color: 'gray',
                         content: '?',
                       },
                     ],
                   },
                 ],
                 topBraces: [
                   {
                     start: 1,
                     end: 5,
                     text: `${fruit1.nomPluriel}`,
                   },
                   {
                     start: 5,
                     end: 9,
                     text: `${fruit2.nomPluriel}`,
                   },
                 ],
               }).display()}<br><br>`
             : ''
         }
         $${texNombre(masseFruit1, 0)}$ g + $${texNombre(masseFruit2, 0)}$ g = $${texNombre(masseFruit1 + masseFruit2, 0)}$ g<br>
          ${this.sup3 ? operation({ operande1: masseFruit1, operande2: masseFruit2, type: 'addition', precision: 0, options: { solution: true, colore: orangeMathalea } }) : ''}
             ${this.sup3 ? '<br><br>' : ''}
    La masse totale ${fruit1.pluriel} et ${fruit2.pluriel} ${fruit1.nomSingulier.includes('une') && fruit2.nomSingulier.includes('une') ? 'achetées' : 'achetés'} est de $${miseEnEvidence(texNombre(masseFruit1 + masseFruit2, 0))}$ g.`,
          `${this.correctionDetaillee ? `Pour exprimer la masse des ${fruit3.nomPluriel} en grammes, on calcule la différence entre la masse du panier et la masse totale ${fruit1.pluriel} et ${fruit2.pluriel} calculée à la question précédente.<br>` : ''}
         ${
           this.correctionDetaillee
             ? `${new SchemaEnBoite({
                 topBraces: [
                   {
                     start: 1,
                     end: 11,
                     text: `${fruit1.nomPluriel} et ${fruit2.nomPluriel}`,
                   },
                   {
                     start: 11,
                     end: 15,
                     text: `${fruit3.nomPluriel}`,
                   },
                 ],
                 lignes: [
                   {
                     barres: [
                       {
                         length: 10,
                         color: 'cyan',
                         content: `$${texNombre(masseFruit1 + masseFruit2)}$`,
                       },
                       {
                         length: 4,
                         color: 'white',
                         content: '?',
                       },
                     ],
                   },
                   {
                     barres: [
                       {
                         length: 14,
                         color: 'gray',
                         content: `$${texNombre(masseTotale * 1000)}$`,
                       },
                     ],
                   },
                 ],
               }).display()}<br><br>`
             : ''
         }

          $${texNombre(masseTotale * 1000, 0)}-${texNombre(masseFruit1 + masseFruit2, 0)}= ${texNombre(masseFruit3, 0)}$ g<br>
          ${this.sup3 ? operation({ operande1: masseTotale * 1000, operande2: masseFruit1 + masseFruit2, type: 'soustraction', precision: 0, options: { solution: true, colore: orangeMathalea } }) : ''}
             ${this.sup3 ? '<br><br>' : ''}
    ${prenom} a acheté $${miseEnEvidence(texNombre(masseFruit3, 0))}$ g ${fruit3.pluriel}.`,
        ]
      } else if (this.sup === 2) {
        listeQuestions = [
          'Exprimer la masse totale du panier en grammes.' +
            ajouteQuestionMathlive({
              exercice: this,
              question: 3 * i,
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: {
                reponse: { value: texNombre(masseTotale * 1000, 0) },
              },
              typeInteractivite: 'mathlive',
              texteApres: 'g',
            }),
          `Exprimer la masse des ${fruit2.nomPluriel} en grammes.` +
            ajouteQuestionMathlive({
              exercice: this,
              question: 3 * i + 1,
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: { reponse: { value: texNombre(masseFruit2, 0) } },
              typeInteractivite: 'mathlive',
              texteApres: 'g',
            }),
          `Quelle est la masse des ${fruit3.nomPluriel} ?` +
            ajouteQuestionMathlive({
              exercice: this,
              question: 3 * i + 2,
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: { reponse: { value: texNombre(masseFruit3, 0) } },
              typeInteractivite: 'mathlive',
              texteApres: 'g',
            }),
        ]
        listeCorrections = [
          `${this.correctionDetaillee ? `Pour exprimer la masse totale du panier en grammes, on multiplie la masse totale par $${texNombre(1000, 0)}$.<br>` : ''}
          $${texNombre(masseTotale, 3)}\\times ${texNombre(1000, 0)}$ kg = $${texNombre(masseTotale * 1000, 0)}$ g<br>
          ${this.sup3 ? operation({ operande1: masseTotale, operande2: 1000, type: 'multiplication', precision: 0, options: { solution: true, colore: orangeMathalea } }) : ''}
         ${this.sup3 ? '<br><br>' : ''}
     La masse totale de fruits dans le panier est de $${miseEnEvidence(texNombre(masseTotale * 1000, 0))}$ g.`,
          `${this.correctionDetaillee ? `Pour exprimer la masse des ${fruit2.nomPluriel} en grammes, on multiplie la masse par $${texNombre(1000, 0)}$.<br>` : ''}
          $${texNombre(masseFruit2 / 1000, 3, true)}\\text{ kg }\\times ${texNombre(1000, 0)}=${texNombre(masseFruit2, 0)}\\text{ g}$<br>
        ${this.sup3 ? operation({ operande1: masseFruit2 / 1000, operande2: 1000, type: 'multiplication', precision: 0, options: { solution: true, colore: orangeMathalea } }) : ''}
             ${this.sup3 ? '<br><br>' : ''}
     La masse des ${fruit2.nomPluriel} est de $${miseEnEvidence(texNombre(masseFruit2, 0))}$ g.`,
          `${this.correctionDetaillee ? `Pour exprimer la masse des ${fruit3.nomPluriel} en grammes, on calcule la différence entre la masse du panier et la somme des masses de ${fruit1.nomPluriel} et de ${fruit2.nomPluriel}.<br>` : ''}
          $${texNombre(masseTotale * 1000, 0)}-(${texNombre(masseFruit1, 0)} + ${texNombre(masseFruit2, 0)})=${texNombre(masseTotale * 1000, 0)}-${texNombre(masseFruit1 + masseFruit2, 0)}= ${texNombre(masseFruit3, 0)}$ g<br>
            ${this.sup3 ? operation({ operande1: masseFruit1, operande2: masseFruit2, type: 'addition', precision: 0, display: 'inline-block', options: { solution: true, colore: orangeMathalea } }) : ''}
          ${this.sup3 ? operation({ operande1: masseTotale * 1000, operande2: masseFruit1 + masseFruit2, type: 'soustraction', precision: 0, display: 'inline-block', options: { solution: true, colore: orangeMathalea } }) : ''}
           ${this.sup3 ? '<br><br>' : ''}
   ${prenom} a acheté $${miseEnEvidence(texNombre(masseFruit3, 0))}$ g ${fruit3.pluriel}.`,
        ]
      } else {
        listeQuestions = [
          `<br>Quelle est la masse des ${fruit3.nomPluriel} ?` +
            ajouteQuestionMathlive({
              exercice: this,
              question: i,
              reponseParams: { formatInteractif: 'mathalea-mathfield' },
              objetReponse: { reponse: { value: texNombre(masseFruit3, 0) } },
              typeInteractivite: 'mathlive',
              texteApres: 'g',
            }),
        ]
        listeCorrections = [
          `${this.correctionDetaillee ? `Pour exprimer la masse des ${fruit3.nomPluriel} en grammes, on retire la masse totale ${fruit1.pluriel} et ${fruit2.pluriel} ${fruit1.nomSingulier.includes('une') && fruit2.nomSingulier.includes('une') ? 'achetées' : 'achetés'} de la masse du panier après conversion de toutes les donnnées en grammes.<br>` : ''}
            ${this.sup3 ? operation({ operande1: masseTotale, operande2: 1000, type: 'multiplication', precision: 0, display: 'inline-block', options: { solution: true, colore: orangeMathalea } }) : ''}
         ${this.sup3 ? operation({ operande1: masseFruit2 / 1000, operande2: 1000, type: 'multiplication', precision: 0, display: 'inline-block', options: { solution: true, colore: orangeMathalea } }) : ''}
          ${this.sup3 ? operation({ operande1: masseTotale * 1000, operande2: masseFruit1 + masseFruit2, type: 'soustraction', precision: 0, display: 'inline-block', options: { solution: true, colore: orangeMathalea } }) : ''}
          ${this.sup3 ? '<br><br>' : ''}
     - Masse du panier en grammes : $${texNombre(masseTotale, 3, true)}\\times ${texNombre(1000, 0)}\\text{ g }=${texNombre(masseTotale * 1000, 0)}$ g.<br>
          - Masse totale ${fruit1.pluriel} et ${fruit2.pluriel} ${fruit1.nomSingulier.includes('une') && fruit2.nomSingulier.includes('une') ? 'achetées' : 'achetés'} : $${texNombre(masseFruit1, 0)}\\text{ g }+${texNombre(masseFruit2, 0)}\\text{ g }=${texNombre(masseFruit1 + masseFruit2, 0)}$ g.<br>
          - Masse des ${fruit3.nomPluriel} : $${texNombre(masseTotale * 1000, 0)}\\text{ g }-${texNombre(masseFruit1 + masseFruit2, 0)}\\text{ g }=${miseEnEvidence(texNombre(masseFruit3, 0))}$ g.<br>
          `,
        ]
      }
      enonce +=
        listeQuestions.length === 1
          ? listeQuestions[0]
          : createList({
              items: listeQuestions,
              style: 'alpha',
            })
      correction =
        listeCorrections.length === 1
          ? listeCorrections[0]
          : createList({
              items: listeCorrections,
              style: 'alpha',
            })
      if (
        this.questionJamaisPosee(
          i,
          [quantiteFruit1, quantiteFruit2, quantiteFruit3]
            .map((el) => JSON.stringify(el))
            .join(''),
        )
      ) {
        this.listeQuestions[i] = enonce
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
  }
}
