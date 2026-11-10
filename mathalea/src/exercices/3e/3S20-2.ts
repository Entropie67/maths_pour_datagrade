import { tableauColonneLigne } from '../../lib/2d/tableau'
import { createList } from '../../lib/format/lists'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { premiereLettreEnMajuscule } from '../../lib/outils/outilString'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre =
  "Calcul de probabilités à partir d'un tableau à double entrée"
export const dateDePublication = '03/04/2025'
export const dateDeModifImportante = '20/06/2024'
export const interactifReady = true

/**
 * On doit calculer la probabilité qu'un événement se réalise après une expérience aléatoire à deux épreuves
 * @author Jean-claude Lhote
 */
export const uuid = '76231'

export const refs = {
  'fr-fr': ['3S20-2', '1Tec-P20', 'BP1AUTO049', '2P10-8'],
  'fr-ch': ['11LSNO4C-13'],
}
export default class CalculProbaTab2Entrées extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const typeDeQuestion = combinaisonListes(
      [
        entreprise,
        voliere,
        bouquet,
        panierDeFruits,
        voitures,
        scolaires,
        aliments,
        appareils,
      ],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const { texte, texteCorr, alea } = typeDeQuestion[i](this, i)

      if (this.questionJamaisPosee(i, ...alea)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

// On tire au sort le salarié gagnant d'une entreprise
function entreprise(
  exercice: Exercice,
  question: number,
): { texte: string; texteCorr: string; alea: (string | number)[] } {
  const tailleEntreprise = choice([1, 5, 10, 20])
  const nbPart1A = randint(1 * tailleEntreprise, 3 * tailleEntreprise)
  const nbPart2A = randint(1 * tailleEntreprise, 3 * tailleEntreprise, nbPart1A)
  const nbPart1B = randint(5 * tailleEntreprise, 8 * tailleEntreprise, nbPart1A)
  const nbPart2B = randint(5 * tailleEntreprise, 8 * tailleEntreprise, [
    nbPart1B,
    nbPart2A,
  ])
  const lots = [
    "un séjour à la montagne pour les prochaines vacances d'hiver",
    'un vélo électrique',
    "un bon d'achat de $1\\,000$ euros",
    'une tablette',
    'un ordinateur portable',
  ]
  return moule(
    exercice,
    question,
    'femme(f)',
    'homme',
    'cadre',
    'non cadre',
    'employé',
    `Le comité d'une entreprise décide de faire un tirage au sort pour choisir un salarié qui gagnera ${choice(lots)}.<br>`,
    'le gagnant du tirage au sort',
    [nbPart1A, nbPart2A, nbPart1B, nbPart2B],
  )
}
// On capture au hasard un volatile dans une volière
function voliere(
  exercice: Exercice,
  question: number,
): { texte: string; texteCorr: string; alea: (string | number)[] } {
  const nbPart1A = randint(5, 15)
  const nbPart2A = randint(5, 15, nbPart1A)
  const nbPart1B = randint(5, 15, nbPart1A)
  const nbPart2B = randint(5, 15, [nbPart1B, nbPart2A])
  return moule(
    exercice,
    question,
    'perruche(f)',
    'perroquet',
    'femelle(f)',
    'mâle',
    'volatile',
    'Dans une volière, il y a des perroquets et des perruches. On capture au hasard un volatile.<br>',
    'le volatile capturé',
    [nbPart1A, nbPart2A, nbPart1B, nbPart2B],
  )
}

// On choisit au hasard une fleur dans un bouquet
function bouquet(
  exercice: Exercice,
  question: number,
): { texte: string; texteCorr: string; alea: (string | number)[] } {
  const nbPart1A = randint(3, 10)
  const nbPart2A = randint(3, 10, nbPart1A)
  const nbPart1B = randint(3, 10, nbPart1A)
  const nbPart2B = randint(3, 10, [nbPart1B, nbPart2A])
  return moule(
    exercice,
    question,
    'rose(f)',
    'tulipe(f)',
    'rouge(f)',
    'jaune(f)',
    'fleur',
    'On choisit au hasard une fleur dans un bouquet de roses et de tulipes.<br>',
    'la fleur choisie',
    [nbPart1A, nbPart2A, nbPart1B, nbPart2B],
  )
}

// On choisit au hasard un fruit dans un panier
function panierDeFruits(
  exercice: Exercice,
  question: number,
): { texte: string; texteCorr: string; alea: (string | number)[] } {
  const nbPart1A = randint(3, 7)
  const nbPart2A = randint(3, 7, nbPart1A)
  const nbPart1B = randint(5, 10, nbPart1A)
  const nbPart2B = randint(5, 10, [nbPart1B, nbPart2A])
  return moule(
    exercice,
    question,
    'pomme(f)',
    'poire(f)',
    'verte(f)',
    'mûre(f)',
    'fruit',
    'On choisit au hasard un fruit dans un panier contenant des pommes et des poires.<br>',
    'le fruit choisi',
    [nbPart1A, nbPart2A, nbPart1B, nbPart2B],
  )
}

function voitures(
  exercice: Exercice,
  question: number,
): { texte: string; texteCorr: string; alea: (string | number)[] } {
  const nbPart1A = randint(3, 7)
  const nbPart2A = randint(3, 7, nbPart1A)
  const nbPart1B = randint(5, 10, nbPart1A)
  const nbPart2B = randint(5, 10, [nbPart1B, nbPart2A])
  return moule(
    exercice,
    question,
    'citadine(f)',
    'sportive(f)',
    'thermique(f)',
    'hybride(f)',
    'voiture',
    'On choisit au hasard une voiture dans un garage contenant des citadines et des sportives.<br>',
    'la voiture choisie',
    [nbPart1A, nbPart2A, nbPart1B, nbPart2B],
  )
}

function scolaires(
  exercice: Exercice,
  question: number,
): { texte: string; texteCorr: string; alea: (string | number)[] } {
  const tailleCite = choice([100, 125, 150])
  const nbPart1A = randint(2 * tailleCite, 5 * tailleCite)
  const nbPart2A = randint(2 * tailleCite, 5 * tailleCite, nbPart1A)
  const nbPart1B = randint(1 * tailleCite, 2 * tailleCite, nbPart1A)
  const nbPart2B = randint(1 * tailleCite, 2 * tailleCite, [nbPart1B, nbPart2A])
  return moule(
    exercice,
    question,
    'collégien',
    'lycéen',
    'externe',
    'interne',
    'élève',
    'On choisit au hasard un élève dans une cité scolaire.<br>',
    "l'élève choisi",
    [nbPart1A, nbPart2A, nbPart1B, nbPart2B],
  )
}

function aliments(
  exercice: Exercice,
  question: number,
): { texte: string; texteCorr: string; alea: (string | number)[] } {
  const nbPart1A = randint(3, 7)
  const nbPart2A = randint(3, 7, nbPart1A)
  const nbPart1B = randint(5, 10, nbPart1A)
  const nbPart2B = randint(5, 10, [nbPart1B, nbPart2A])
  return moule(
    exercice,
    question,
    'pizza(f)',
    'tourte(f)',
    'végétarienne(f)',
    'carnée(f)',
    'plat',
    "On choisit au hasard un plat dans la vitrine d'un fast-food.<br>",
    'le plat choisi',
    [nbPart1A, nbPart2A, nbPart1B, nbPart2B],
  )
}

function appareils(
  exercice: Exercice,
  question: number,
): { texte: string; texteCorr: string; alea: (string | number)[] } {
  const nbPart1A = randint(3, 7)
  const nbPart2A = randint(3, 7, nbPart1A)
  const nbPart1B = randint(5, 10, nbPart1A)
  const nbPart2B = randint(5, 10, [nbPart1B, nbPart2A])
  return moule(
    exercice,
    question,
    'smartphone',
    'tablette(f)',
    'Androïd',
    'IOS',
    'appareil',
    "On choisit au hasard un appareil sur le présentoir d'un magasin.<br>",
    "l'appareil choisi",
    [nbPart1A, nbPart2A, nbPart1B, nbPart2B],
  )
}

// On factorise les situations.
function moule(
  exercice: Exercice,
  question: number,
  subst1: string,
  subst2: string,
  adj1: string,
  adj2: string,
  substT: string,
  intro: string,
  choix: string,
  nbParts: [number, number, number, number],
): { texte: string; texteCorr: string; alea: number[] } {
  ;[subst1, subst2] = shuffle([subst1, subst2])
  const Fem1 = subst1.endsWith('(f)') ? 'e' : ''
  const Fem2 = subst2.endsWith('(f)') ? 'e' : ''
  subst1 = subst1.replace(/\(f\)/, '')
  subst2 = subst2.replace(/\(f\)/, '')
  adj1 = adj1.replace(/\(f\)/, '')
  adj2 = adj2.replace(/\(f\)/, '')
  const nbPart1A = nbParts[0]
  const nbPart2A = nbParts[1]
  const nbTotalA = nbPart1A + nbPart2A
  const nbPart1B = nbParts[2]
  const nbPart2B = nbParts[3]
  const nbTotalB = nbPart1B + nbPart2B
  const nbTotal1 = nbPart1A + nbPart1B
  const nbTotal2 = nbPart2A + nbPart2B
  const nbTotal = nbTotal1 + nbTotal2
  const pluriel1A = nbPart1A > 1 ? 's' : ''
  const pluriel2A = nbPart2A > 1 ? 's' : ''
  const pluriel1 = nbTotal1 > 1 ? 's' : ''
  const pluriel2 = nbTotal2 > 1 ? 's' : ''
  const pluriel1B = nbPart1B > 1 ? 's' : ''
  const pluriel2B = nbPart2B > 1 ? 's' : ''
  const plurielT = nbTotal > 1 ? 's' : ''

  const ligneEnt = [
    `\\text{${premiereLettreEnMajuscule(adj1)}s}`,
    `\\text{${premiereLettreEnMajuscule(adj2)}s}`,
    '\\text{Total}',
  ]
  const colonneEnt = [
    '\\text{~}',
    `\\text{${premiereLettreEnMajuscule(subst1)}s}`,
    `\\text{${premiereLettreEnMajuscule(subst2)}s}`,
    '\\text{Total}',
  ]
  const contenu = []
  let correctionDetaillee1 = ''
  let objetReponse1
  switch (randint(0, 2)) {
    case 0:
      contenu.push(nbPart1A, nbPart2A, '', '', '', nbTotalB, nbTotal1, '', '')

      correctionDetaillee1 += `Tout d'abord, on a $${nbPart1A}$ ${subst1}${pluriel1A} ${adj1}${pluriel1A} et $${nbPart2A}$ ${subst2}${pluriel2A} ${adj1}${pluriel2A} soit $${nbPart1A}+${nbPart2A}=${miseEnEvidence(texNombre(nbTotalA))}$ ${substT}s ${adj1}s au total.<br>`
      correctionDetaillee1 += `Il y a $${nbTotal1}$ ${subst1}${pluriel1} en tout et $${nbPart1A}$ ${subst1}${pluriel1A} ${adj1}${pluriel1A} soit $${nbTotal1}-${nbPart1A}=${miseEnEvidence(nbPart1B)}$ ${subst1}${pluriel1B} ${adj2}${pluriel1B}.<br>`
      correctionDetaillee1 += `Il y a $${nbPart1B}$ ${subst1}${pluriel1B} ${adj2}${pluriel1B} et $${nbTotalB}$ ${substT} ${adj2}s au total soit $${nbTotalB}-${nbPart1B}=${miseEnEvidence(nbPart2B)}$ ${subst2}${pluriel2B} ${adj2}${pluriel2B}.<br>`
      correctionDetaillee1 += `Il y a $${nbPart2A}$ ${subst2}${pluriel2A} ${adj1}${pluriel2A} et $${nbPart2B}$ ${subst2}${pluriel2B} ${adj2}${pluriel2B} soit $${nbPart2A}+${nbPart2B}=${miseEnEvidence(nbTotal2)}$ ${subst2}${pluriel2} au total.<br>`
      correctionDetaillee1 += `Enfin, il y a $${nbTotal1}$ ${subst1}${pluriel1} et $${nbTotal2}$ ${subst2}${pluriel2} soit $${nbTotal1}+${nbTotal2}=${miseEnEvidence(texNombre(nbTotal))}$ ${substT}${plurielT} au total.<br>`
      objetReponse1 = {
        L1C3: { value: nbTotalA },
        L2C1: { value: nbPart1B },
        L2C2: { value: nbPart2B },
        L3C2: { value: nbTotal2 },
        L3C3: { value: nbTotal },
      }
      break
    case 1:
      contenu.push('', nbPart2A, nbTotalA, nbPart1B, '', nbTotalB, '', '', '')
      correctionDetaillee1 += `Tout d'abord, on a $${texNombre(nbTotalA)}$ ${substT}s ${adj1}s et $${nbPart2A}$ ${subst2}${pluriel2A} ${adj1}${pluriel2A} soit $${texNombre(nbTotalA)}-${nbPart2A}=${miseEnEvidence(nbPart1A)}$ ${subst1}${pluriel1A} ${adj1}${pluriel1A}.<br>`
      correctionDetaillee1 += `Il y a $${nbPart1A}$ ${subst1}${pluriel1A} ${adj1}${pluriel1A} et $${nbPart1B}$ ${subst1}${pluriel1B} ${adj2}${pluriel1B} soit $${nbPart1A}+${nbPart1B}=${miseEnEvidence(nbTotal1)}$ ${subst1}s au total.<br>`
      correctionDetaillee1 += `Il y a $${nbPart1B}$ ${subst1}${pluriel1B} ${adj2}${pluriel1B} et $${nbTotalB}$ ${substT} ${adj2}s au total soit $${nbTotalB}-${nbPart1B}=${miseEnEvidence(nbPart2B)}$ ${subst2}${pluriel2B} ${adj2}${pluriel2B}.<br>`
      correctionDetaillee1 += `Il y a $${nbPart2A}$ ${subst2}${pluriel2A} ${adj1}${pluriel2A} et $${nbPart2B}$ ${subst2}${pluriel2B} ${adj2}${pluriel2B} soit $${nbPart2A}+${nbPart2B}=${miseEnEvidence(nbTotal2)}$ ${subst2}${pluriel2} au total.<br>`
      correctionDetaillee1 += `Enfin, il y a $${nbTotal1}$ ${subst1}${pluriel1} et $${nbTotal2}$ ${subst2}${pluriel2} soit $${nbTotal1}+${nbTotal2}=${miseEnEvidence(texNombre(nbTotal))}$ ${substT}${plurielT} au total.<br>`
      objetReponse1 = {
        L1C1: { value: nbPart1A },
        L2C2: { value: nbPart2B },
        L3C1: { value: nbTotal1 },
        L3C2: { value: nbTotal2 },
        L3C3: { value: nbTotal },
      }
      break
    case 2:
    default:
      contenu.push(nbPart1A, '', nbTotalA, nbPart1B, '', '', '', nbTotal2, '')
      correctionDetaillee1 += `Tout d'abord, on a $${texNombre(nbTotalA)}$ ${substT}s ${adj1}s et $${nbPart1A}$ ${subst1}${pluriel1A} ${adj1}${pluriel1A} soit $${texNombre(nbTotalA)}-${nbPart1A}=${miseEnEvidence(nbPart2A)}$ ${subst2}${pluriel2A} ${adj1}${pluriel2A}.<br>`
      correctionDetaillee1 += `Il y a $${nbPart1A}$ ${subst1}${pluriel1A} ${adj1}${pluriel1A} et $${nbPart1B}$ ${subst1}${pluriel1B} ${adj2}${pluriel1B} soit $${nbPart1A}+${nbPart1B}=${miseEnEvidence(nbTotal1)}$ ${subst1}s au total.<br>`
      correctionDetaillee1 += `Il y a $${nbTotal1}$ ${subst1}${pluriel1} et $${nbTotal2}$ ${subst2}${pluriel2} soit $${nbTotal1}+${nbTotal2}=${miseEnEvidence(texNombre(nbTotal))}$ ${substT}${plurielT} au total.<br>`
      correctionDetaillee1 += `Il y a $${texNombre(nbTotalA)}$ ${adj1}s et $${texNombre(nbTotal)}$ ${substT}s soit $${texNombre(nbTotal)}-${texNombre(nbTotalA)}=${miseEnEvidence(nbTotalB)}$ ${adj2}s au total.<br>`
      correctionDetaillee1 += `Enfin, il y a $${nbPart1B}$ ${subst1}${pluriel1B} ${adj2}${pluriel1B} et $${nbTotalB}$ ${adj2}s soit $${nbTotalB}-${nbPart1B}=${miseEnEvidence(nbPart2B)}$ ${subst2}${pluriel2B} ${adj2}${pluriel2B}.<br>`
      objetReponse1 = {
        L1C2: { value: nbPart2A },
        L2C2: { value: nbPart2B },
        L2C3: { value: nbTotalB },
        L3C1: { value: nbTotal1 },
        L3C3: { value: nbTotal },
      }
      break
  }
  const contenuCorr = [
    nbPart1A,
    nbPart2A,
    nbTotalA,
    nbPart1B,
    nbPart2B,
    nbTotalB,
    nbTotal1,
    nbTotal2,
    nbTotal,
  ]

  let texte = intro
  let question1 = 'Compléter le tableau des effectifs suivants :<br>'
  const tableau = tableauColonneLigne(
    colonneEnt,
    ligneEnt,
    contenu.map((x) => (typeof x === 'number' ? texNombre(x, 0) : x)),
  )
  const tableauInteractif = AddTabDbleEntryMathlive.create(
    Number(exercice.numeroExercice),
    question * 4,
    AddTabDbleEntryMathlive.convertTclToTableauMathlive(
      colonneEnt,
      ligneEnt,
      contenu,
    ),
    '',
    true,
    {},
  )
  question1 += exercice.interactif ? tableauInteractif.output : tableau
  handleAnswers(exercice, question * 4, objetReponse1, {
    formatInteractif: 'tableau-mathlive',
  })
  const tableauCorr = tableauColonneLigne(
    colonneEnt,
    ligneEnt,
    contenuCorr.map((x) => (typeof x === 'number' ? texNombre(x, 0) : x)),
  )
  const correction1 = `${exercice.correctionDetaillee ? correctionDetaillee1 : ''}Voici le tableau des effectifs :<br>${tableauCorr}`
  const proba2 = fraction(nbTotalA, nbTotal)
  const question2 =
    `Quelle est la probabilité que ${choix} soit un${Fem1} ${subst1} ${adj1} ou un${Fem2} ${subst2} ${adj1} ?` +
    ajouteQuestionMathlive({
      exercice,
      question: question * 4 + 1,
      reponseParams: { formatInteractif: 'mathalea-mathfield' },
      objetReponse: {
        reponse: {
          value: proba2.texFraction,
          options: { fractionEgale: true },
        },
      },
      typeInteractivite: 'mathlive',
    })
  const correction2 = `Il y a $${texNombre(nbTotalA)}$ ${substT}s ${adj1}${pluriel1A} et $${texNombre(nbTotal)}$ ${substT}${plurielT} donc la probabilité que ${choix} soit un${Fem1} ${subst1} ${adj1} ou un${Fem2} ${subst2} ${adj1} est de :  $${miseEnEvidence(proba2.texFraction)}$.`
  const proba3 = fraction(nbTotal2, nbTotal)
  const question3 =
    `Quelle est la probabilité que ${choix} soit un${Fem2} ${subst2} ?` +
    ajouteQuestionMathlive({
      exercice,
      question: question * 4 + 2,
      reponseParams: { formatInteractif: 'mathalea-mathfield' },
      objetReponse: {
        reponse: {
          value: proba3.texFraction,
          options: { fractionEgale: true },
        },
      },
      typeInteractivite: 'mathlive',
    })
  const correction3 = `Il y a $${nbTotal2}$ ${subst2}${pluriel2} et $${texNombre(nbTotal)}$ ${substT}${plurielT} donc la probabilité que ${choix} soit un${Fem2} ${subst2} est de :  $${miseEnEvidence(proba3.texFraction)}$.`
  const proba4 = fraction(nbPart1A, nbTotal1)
  const question4 =
    `On sait que ${choix} est un${Fem1} ${subst1}. Quelle est la probabilité que ce soit un${Fem1} ${subst1} ${adj1} ?` +
    ajouteQuestionMathlive({
      exercice,
      question: question * 4 + 3,
      reponseParams: { formatInteractif: 'mathalea-mathfield' },
      objetReponse: {
        reponse: {
          value: proba4.texFraction,
          options: { fractionEgale: true },
        },
      },
      typeInteractivite: 'mathlive',
    })
  const correction4 = `Il y a $${nbPart1A}$ ${subst1}${pluriel1A} ${adj1}${pluriel1A} et $${nbTotal1}$ ${subst1}${pluriel1} donc la probabilité que ${choix} soit un${Fem1} ${subst1} ${adj1} est de :  $${miseEnEvidence(proba4.texFraction)}$.`

  texte += createList({
    items: [question1, question2, question3, question4],
    style: 'nombres',
  })
  const texteCorr = createList({
    items: [correction1, correction2, correction3, correction4],
    style: 'nombres',
  })
    .replaceAll('fruits vertes', 'fruits verts')
    .replaceAll('Androïds', 'Androïd')
    .replaceAll('IOSs', 'iOS') // Pas trouvé comment régler ça dans le code
  const alea = [nbPart1A, nbPart2A, nbPart1B, nbPart2B]

  return { texte, texteCorr, alea }
}
