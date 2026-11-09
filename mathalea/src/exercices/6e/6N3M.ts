import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  enleveDoublonNum,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { rangeMinMax } from '../../lib/outils/nombres'
import { deDevant, numAlpha } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { partieEntiereEnLettres } from '../../modules/nombreEnLettres'
export const interactifReady = true

export const dateDePublication = '06/03/2025'

export const titre = 'Résoudre des problèmes contenant des fractions'

/**
 * @author Éric Elter
 * Résoudre des problèmes contenant des fractions
 */
export const uuid = '8e07a'

export const refs = {
  'fr-fr': ['6N3M'],
  'fr-2016': ['6N33-4'],
  'fr-ch': ['9R1NO4I-8', '9R2NO4I-8', '9R3NO4I-8', '10CTNO3D-2', '10LCNO3D-2', '10LSNO3D-2', 'PRQNO15B-9'],
}

function capitalizeFirstLetter(word: string): string {
  if (word.length === 0) return word // Si le mot est vide, on le retourne tel quel
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function suffixeFractionnaire(
  num: number,
  den: number,
  { majuscules = false } = {},
): string {
  let suffixe = ''
  switch (den) {
    case 2:
      suffixe = 'demi'
      break
    case 3:
      suffixe = 'tiers'
      break
    case 4:
      suffixe = 'quart'
      break
    case 5:
      suffixe = 'cinquième'
      break
    case 6:
      suffixe = 'sixième'
      break
    case 7:
      suffixe = 'septième'
      break
    case 8:
      suffixe = 'huitième'
      break
    case 9:
      suffixe = 'neuvième'
      break
    case 10:
      suffixe = 'dixième'
      break
    case 11:
      suffixe = 'onzième'
      break
    case 12:
      suffixe = 'douzième'
      break
  }
  if (num !== 1 && den !== 3) suffixe += 's'
  return suffixe
}

export default class ProblemesFractions6e extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireTexte = [
      'Lieu des questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Libraire',
        '2 : Jardin public',
        '3 : Bibliothèque',
        '4 : Cinéma',
        '5 : Boutique',
        '6 : Collège',
        '7 : Ferme',
        '8 : Usine',
        '9 : Compétition sportive',
        '10 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Réponse directe\n2 : Fraction du reste\n3 : Valeur du reste',
    ]
    this.besoinFormulaire3Numerique = [
      'Dénominateur le plus grand possible (entre 3 et 12)',
      12,
    ]
    this.nbQuestions = 3

    this.sup = 10
    this.sup2 = '1-2-3'
    this.sup3 = 12
    this.spacing = 1.5
    this.spacingCorr = 2
    this.comment =
      'Le premier paramètre permet de choisir un ou plusieurs lieux différents pour les problèmes.<br>'
    this.comment +=
      'Le deuxième paramètre permet de choisir une ou plusieurs questions parmi les 3 possibles.<br>'
    this.comment +=
      'Le troisième paramètre permet de choisir le dénonminateur le plus grand parmi lesquels le hasard choisira pour chaque problème.<br>'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 9,
      melange: 10,
      defaut: 10,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    const nombreDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      shuffle: false,
      defaut: 4,
      nbQuestions: Math.max(this.sup2.toString().slice('-').length, 1),
    })
    const nombreDeQuestionsDispo: number[] = enleveDoublonNum(
      nombreDeQuestionsDisponibles.map((element) => Number(element)),
    )
    nombreDeQuestionsDispo.sort()

    const liste3Questions: string[][] = [[]]
    const liste3Corrections: string[][] = [[]]
    const reponsesPb: string[][] = [[]]
    const elementsCorrection: string[][] = [[]]

    this.sup3 = Math.min(Math.max(this.sup3, 3), 12)
    const listeDen = combinaisonListes(
      rangeMinMax(3, this.sup3),
      this.nbQuestions,
    )
    let den = 0
    let num = 0
    let nbDirect = ''
    let nbInitial = ''
    let nbIndirect = ''
    let nbUnites = 0

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      den = listeDen[i]
      num = randint(2, den - 1, [den / 2]) // On n'aura pas une fraction égale à 1/2.
      nbUnites = randint(5, 20) * 10
      nbDirect = texNombre(num * nbUnites)
      nbInitial = texNombre(den * nbUnites)
      nbIndirect = texNombre((den - num) * nbUnites)
      liste3Questions.push([])
      liste3Corrections.push([])
      reponsesPb.push([])
      elementsCorrection.push([])

      switch (listeTypeDeQuestions[i]) {
        case 1: {
          // librairie
          const age = randint(6, 12)
          const PlusOuMoins = choice(['plus', 'moins'])
          const ContrairePlusOuMoins = choice(['plus', 'moins'], [PlusOuMoins])
          const QuiC = choice([
            [prenomF(), 'une'],
            [prenomM(), 'un'],
          ])
          elementsCorrection[i] = [
            'livres jeunesse',
            `livres jeunesse destinés aux enfants de ${PlusOuMoins} de $${age}$ ans`,
            `livres jeunesse destinés aux enfants de $${age}$ ans et ${ContrairePlusOuMoins}`,
            'de cette librairie',
          ]

          texte = `${QuiC[0]}, ${QuiC[1]} libraire, dispose de $${nbInitial}$ ${elementsCorrection[i][0]}. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces ${elementsCorrection[i][0]} sont destinés aux enfants de ${PlusOuMoins} de $${age}$ ans.`
          liste3Questions[i][0] =
            `Combien de ${elementsCorrection[i][0]} sont des ${elementsCorrection[i][1]} ?`
          liste3Questions[i][1] =
            `Quelle fraction des ${elementsCorrection[i][0]} représente les livres destinés aux enfants de $${age}$ ans et ${ContrairePlusOuMoins} ?`
          liste3Questions[i][2] =
            `Combien de ${elementsCorrection[i][0]} sont destinés aux enfants de $${age}$ ans et ${ContrairePlusOuMoins} ?`
          break
        }
        case 2: {
          // jardin public
          const ville = choice([
            `Sainte-${prenomF()}-La-Marmotte`,
            `Saint-${prenomM()}-Le-Philippin`,
          ])
          const fleurs = choice([
            'roses',
            'jonquilles',
            'tulipes',
            'marguerites',
          ])
          elementsCorrection[i] = [
            'fleurs',
            fleurs,
            `fleurs qui ne sont pas des ${fleurs}`,
            'ce jardin public',
          ]

          texte = `Dans un jardin public de ${ville}, il y a $${nbInitial}$ fleurs. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces fleurs sont des ${fleurs}.`
          liste3Questions[i][0] =
            `Combien de ${fleurs} y a-t-il dans ce jardin public ?`
          liste3Questions[i][1] =
            `Quelle fraction des fleurs de ce jardin public représente les fleurs qui ne sont pas des ${fleurs} ?`
          liste3Questions[i][2] =
            `Combien de fleurs de ce jardin public ne sont pas des ${fleurs} ?`
          break
        }
        case 3: {
          // bibliothèque
          const ville = choice([
            `${prenomF()}-La-Jolie`,
            `Chateau-${prenomM()}-Sur-Mer`,
          ])
          const livres = choice([
            'romans',
            'bandes dessinées',
            'mangas',
            'dictionnaires',
          ])
          elementsCorrection[i] = [
            'livres',
            livres,
            `livres qui ne sont pas des ${livres}`,
            'cette bibliothèque',
          ]

          texte = `Dans la bibliothèque de ${ville}, il y a $${nbInitial}$ livres. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces livres sont des ${livres}.`
          liste3Questions[i][0] =
            `Combien de ${livres} la bibliothèque possède-t-elle ?`
          liste3Questions[i][1] =
            `Quelle fraction des livres de cette bibliothèque représente les livres qui ne sont pas des ${livres} ?`
          liste3Questions[i][2] =
            `Combien de livres de cette bibliothèque ne sont pas des ${livres} ?`
          break
        }
        case 4: {
          // cinéma
          const QuiC = choice([prenomF(), prenomM()])
          const typePlaces = choice([
            'places Grand Luxe',
            'places Or',
            'places VIP',
          ])
          elementsCorrection[i] = [
            'places',
            typePlaces,
            'places qui ne sont pas des ' + typePlaces,
            'cette salle de cinéma',
          ]

          texte = `Dans une salle du cinéma ${deDevant(QuiC)}, il y a $${nbInitial}$ places. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces places sont des ${elementsCorrection[i][1]}.`
          liste3Questions[i][0] =
            `Combien de places de cette salle de cinéma sont des ${elementsCorrection[i][1]} ?`
          liste3Questions[i][1] =
            `Quelle fraction des places de cette salle de cinéma représente les ${elementsCorrection[i][2]} ?`
          liste3Questions[i][2] =
            `Combien de places de cette salle de cinéma sont des ${elementsCorrection[i][2]} ?`
          break
        }
        case 5: {
          // boutique
          const QuiC = choice([prenomF(), prenomM()])
          const typeVetement = choice([
            'Tee-Shirts',
            'pantalons',
            'robes',
            'jupes',
            'chaussettes',
          ])
          const couleur = choice([
            ' jaunes',
            ' rouges',
            ' à paillettes',
            ' à carreaux',
          ])
          elementsCorrection[i] = [
            typeVetement,
            typeVetement + couleur,
            typeVetement + ' qui ne sont pas des ' + typeVetement + couleur,
            'cette boutique',
          ]

          texte = `La boutique ${deDevant(QuiC)} vend $${nbInitial}$ ${typeVetement}. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces ${typeVetement} sont des ${elementsCorrection[i][1]}.`
          liste3Questions[i][0] =
            `Combien de ${typeVetement} de cette boutique sont des ${elementsCorrection[i][1]} ?`
          liste3Questions[i][1] =
            `Quelle fraction des ${typeVetement} de cette boutique représente les ${elementsCorrection[i][2]} ?`
          liste3Questions[i][2] =
            `Combien de ${typeVetement} de cette boutique sont des ${elementsCorrection[i][2]} ?`
          break
        }
        case 6: {
          // collège
          const QuiC = choice([prenomF(), prenomM()])
          const typeEleves = choice([
            ['garçons', ' inscrits'],
            ['filles', ' inscrites'],
          ])
          const club = choice([
            'cours de chant',
            'cours de musique',
            'club de badminton',
            'club de judo',
          ])
          elementsCorrection[i] = [
            typeEleves[0],
            typeEleves[0] + typeEleves[1] + ' à un ' + club,
            typeEleves[0] +
              ' qui ne sont pas' +
              typeEleves[1] +
              ' à un ' +
              club,
            'ce collège',
          ]

          texte = `Il y a $${nbInitial}$ ${elementsCorrection[i][0]} dans le collège ${deDevant(QuiC)}. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces ${elementsCorrection[i][0]} sont des ${elementsCorrection[i][1]}.`
          liste3Questions[i][0] =
            `Combien de ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][1]} ?`
          liste3Questions[i][1] =
            `Quelle fraction des ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} représente les ${elementsCorrection[i][2]} ?`
          liste3Questions[i][2] =
            `Combien de ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][2]} ?`
          break
        }
        case 7: {
          // ferme
          const QuiC = choice([prenomF(), prenomM()])
          const typeAnimal = choice(['chèvres', 'poules'])
          const typeCouleurs = choice([
            ' rousses',
            ' blanches',
            ' noires',
            ' bicolores',
          ])
          elementsCorrection[i] = [
            typeAnimal,
            typeAnimal + typeCouleurs,
            typeAnimal + ' qui ne sont pas' + typeCouleurs,
            'cette ferme',
          ]

          texte = `La ferme ${deDevant(QuiC)} possède $${nbInitial}$ ${elementsCorrection[i][0]}. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces ${elementsCorrection[i][0]} sont des ${elementsCorrection[i][1]}.`
          liste3Questions[i][0] =
            `Combien de ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][1]} ?`
          liste3Questions[i][1] =
            `Quelle fraction des ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} représente les ${elementsCorrection[i][2]} ?`
          liste3Questions[i][2] =
            `Combien de ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][2]} ?`
          break
        }
        case 8: {
          // usine
          const ville = choice([
            `Sainte-${prenomF()}-La-Gourmande`,
            `Saint-${prenomM()}-Le-Cuistot`,
          ])
          const typeAliment = choice(['biscuits', 'sucettes', 'gâteaux'])
          const typeGout = choice([
            ' au chocolat',
            ' au caramel',
            ' à la vanille',
            ' à la fraise',
          ])
          elementsCorrection[i] = [
            typeAliment,
            typeAliment + typeGout,
            typeAliment + ' qui ne sont pas' + typeGout,
            'cette usine',
          ]

          texte = `L'usine de ${ville} produit $${nbInitial}$ ${elementsCorrection[i][0]}. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces ${elementsCorrection[i][0]} sont des ${elementsCorrection[i][1]}.`
          liste3Questions[i][0] =
            `Combien de ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][1]} ?`
          liste3Questions[i][1] =
            `Quelle fraction des ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} représente les ${elementsCorrection[i][2]} ?`
          liste3Questions[i][2] =
            `Combien de ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][2]} ?`
          break
        }
        case 9: {
          // compétition sportive
          const typeAthletes = choice([
            'footballeurs',
            'judokas',
            'nageurs',
            'cyclistes',
          ])
          const typeParticularites = choice([
            ' gauchers',
            ' droitiers',
            ' blonds',
            ' bruns',
            ' chauves',
          ])
          elementsCorrection[i] = [
            typeAthletes,
            typeAthletes + typeParticularites,
            typeAthletes + ' qui ne sont pas' + typeParticularites,
            'cette compétition sportive',
          ]

          texte = `Une compétition sportive réunit $${nbInitial}$ ${elementsCorrection[i][0]}. ${capitalizeFirstLetter(partieEntiereEnLettres(num))} ${suffixeFractionnaire(num, den)} de ces ${elementsCorrection[i][0]} sont des ${elementsCorrection[i][1]}.`
          liste3Questions[i][0] =
            `Combien de ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][1]} ?`
          liste3Questions[i][1] =
            `Quelle fraction des ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} représente les ${elementsCorrection[i][2]} ?`
          liste3Questions[i][2] =
            `Combien de ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][2]} ?`
          break
        }
      }
      liste3Corrections[i][0] =
        `On va chercher combien représente ${partieEntiereEnLettres(num)} ${suffixeFractionnaire(num, den)} de $${nbInitial}$ ${elementsCorrection[i][0]}, soit $${new FractionEtendue(num, den).texFraction}$ de $${nbInitial}$ ${elementsCorrection[i][0]}.<br>`
      liste3Corrections[i][0] +=
        `Partageons $${nbInitial}$ ${elementsCorrection[i][0]} en $${den}$ parts égales afin de trouver $${new FractionEtendue(1, den).texFraction}$ de $${nbInitial}$ ${elementsCorrection[i][0]}. Pour cela, effectuons la division de $${nbInitial}$ par $${den}$.<br>`
      liste3Corrections[i][0] +=
        `Selon vos compétences, ce calcul peut être effectué mentalement ou bien posé. On obtient : $${nbInitial} \\div ${den} = ${nbUnites}$.<br>`
      liste3Corrections[i][0] +=
        `$${new FractionEtendue(1, den).texFraction}$ de $${nbInitial}$ ${elementsCorrection[i][0]} correspond donc à $${nbUnites}$ ${elementsCorrection[i][0]}. Puisqu'on en veut $${new FractionEtendue(num, den).texFraction}$, c'est donc $${num}$ fois plus : $${nbUnites} \\times ${num} = ${miseEnEvidence(nbDirect)}$.<br>`
      liste3Corrections[i][0] +=
        `Ainsi, le nombre de ${elementsCorrection[i][1]} (${partieEntiereEnLettres(num)} ${suffixeFractionnaire(num, den)} de $${nbInitial}$ ${elementsCorrection[i][0]}) est de $${miseEnEvidence(nbDirect)}$ ${elementsCorrection[i][0]}.<br>`

      liste3Corrections[i][1] =
        `Puisque ${partieEntiereEnLettres(num)} ${suffixeFractionnaire(num, den)} de $${nbInitial}$ ${elementsCorrection[i][0]} $\\left(${new FractionEtendue(num, den).texFraction}\\text{ de $${nbInitial}$ ${elementsCorrection[i][0]}}\\right)$ sont des ${elementsCorrection[i][1]}, on peut dire que l'ensemble des ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} représente $${new FractionEtendue(den, den).texFraction}$ de ces ${elementsCorrection[i][0]}.<br>`
      liste3Corrections[i][1] +=
        `Pour trouver la fraction des ${elementsCorrection[i][0]} qui représente les ${elementsCorrection[i][2]}, on va soustraire la fraction représentant les ${elementsCorrection[i][1]} à la fraction représentant l'ensemble des ${elementsCorrection[i][0]}.<br>`
      liste3Corrections[i][1] +=
        `$1-${new FractionEtendue(num, den).texFraction}=${new FractionEtendue(den, den).texFraction}-${new FractionEtendue(num, den).texFraction}=${miseEnEvidence(new FractionEtendue(den - num, den).texFraction)}$<br>`
      liste3Corrections[i][1] +=
        `Ainsi, $${miseEnEvidence(new FractionEtendue(den - num, den).texFraction)}$ des ${elementsCorrection[i][0]} de ${elementsCorrection[i][3]} sont des ${elementsCorrection[i][2]}.<br>`

      if (nombreDeQuestionsDispo.includes(2)) {
        liste3Corrections[i][2] =
          `Puisque ${partieEntiereEnLettres(num)} ${suffixeFractionnaire(num, den)} de $${nbInitial}$ ${elementsCorrection[i][0]} $\\left(${new FractionEtendue(num, den).texFraction}\\text{ de $${nbInitial}$ ${elementsCorrection[i][0]}}\\right)$ sont des ${elementsCorrection[i][1]}, alors $${new FractionEtendue(den - num, den).texFraction}$ de ces ${elementsCorrection[i][0]} sont des ${elementsCorrection[i][2]}.<br>`
        liste3Corrections[i][2] +=
          `Partageons $${nbInitial}$ ${elementsCorrection[i][0]} en $${den}$ parts égales afin de trouver $${new FractionEtendue(1, den).texFraction}$ de $${nbInitial}$ ${elementsCorrection[i][0]}. On obtient : $${nbInitial} \\div ${den} = `
        liste3Corrections[i][2] +=
          (den - num === 1 ? `${miseEnEvidence(nbUnites)}` : `${nbUnites}`) +
          '$.<br>'
        liste3Corrections[i][2] +=
          den - num > 1
            ? `Puisqu'on en veut $${new FractionEtendue(den - num, den).texFraction}$, c'est donc $${den - num}$ fois plus : $${nbUnites} \\times ${den - num} = ${miseEnEvidence(nbIndirect)}$.<br>`
            : ''
      } else {
        liste3Corrections[i][2] =
          `Puisque sur les $${nbInitial}$ ${elementsCorrection[i][0]}, $${nbDirect}$ ${elementsCorrection[i][0]} sont des ${elementsCorrection[i][1]}, alors on va soustraire ces deux nombres pour trouver le nombre de ${elementsCorrection[i][2]} : `
        liste3Corrections[i][2] +=
          `$${nbInitial}-${nbDirect}=${miseEnEvidence(nbIndirect)}$.<br>`
      }
      liste3Corrections[i][2] +=
        `Ainsi, le nombre de ${elementsCorrection[i][1]} est de $${miseEnEvidence(nbIndirect)}$ ${elementsCorrection[i][0]}.`

      reponsesPb[i][0] = nbDirect.toString()
      reponsesPb[i][1] = new FractionEtendue(den - num, den).texFraction
      reponsesPb[i][2] = nbIndirect.toString()

      for (let ee = 0; ee < nombreDeQuestionsDispo.length; ee++) {
        texte +=
          '<br>' +
          (nombreDeQuestionsDispo.length > 1 ? numAlpha(ee) : '') +
          liste3Questions[i][nombreDeQuestionsDispo[ee] - 1]
        texte += ajouteChampTexteMathLive(
          this,
          i * nombreDeQuestionsDispo.length + ee,
          KeyboardType.clavierDeBaseAvecFraction,
        )
        handleAnswers(this, i * nombreDeQuestionsDispo.length + ee, {
          reponse: { value: reponsesPb[i][nombreDeQuestionsDispo[ee] - 1] },
        })
        texteCorr +=
          (nombreDeQuestionsDispo.length > 1 ? numAlpha(ee) : '') +
          liste3Corrections[i][nombreDeQuestionsDispo[ee] - 1] +
          '<br>'
      }
      if (this.questionJamaisPosee(i, nbDirect, nbInitial, nbIndirect)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
