import { bleuMathalea } from '../../lib/colors'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabPropMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { premiereLettreEnMajuscule } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Compléter un tableau de proportionnalité avec les propriétés de linéarité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '20/05/2025'
export const uuid = 'f7a15'

export const refs = {
  'fr-fr': ['6P3D-2'],
  'fr-2016': ['6P11-5'],
  'fr-ch': ['9R1FA1B-1', '9R2FA1B-1', '9R3FA1B-1', 'PRQPF03A-2'],
}
/**
 * @author Jean-claude Lhote
 */

// Les fonctions retournent une liste avec dans l'ordre :
// 1. le nom de l'objet
// 2. le nombre d'objets ou la quantité en première ligne (1 par défaut)
// 3. le prix de ce nombe d'objet ou la quantité associée en deuxième ligne (prix unitaire par défaut)
// 4. l'entête de la première ligne
// 5. l'entête de la deuxième ligne
function achat(entier = true): [string, number, number, string, string] {
  const listeDeChoses = [
    [
      'articles',
      'outils',
      'accessoires',
      "pièces d'outillage",
      'pinceaux',
      'ampoules',
      'tournevis',
      'robinets',
      'raccords de tuyaux',
    ],
    [
      'poissons rouges',
      'cannetons',
      'perruches',
      'phasmes',
      'colliers anti-puces',
      'souris',
      'lapereaux',
      'sacs de graines',
    ],
    [
      'sets de tables',
      'verres',
      'assiettes',
      'plats',
      'coquetiers',
      'packs de lait',
      'paquets de pâtes',
    ],
    [
      'mangues',
      'ananas',
      'fruits de la passion',
      'melons',
      'paquets de madeleines de Commercy',
      'bergamottes de Nancy',
      'boite de chocolats',
      'pots de cancoillotte',
    ],
    [
      'cartes de voeux',
      'livres',
      'gravures',
      'puzzles',
      'maquettes',
      'disques',
      'jeux de société',
    ],
  ]
  const listeDePrixUnit: number[][] = [
    [7, 13, 1.25, 9, 0.5, 1.5, 2, 6.5, 0.75],
    [1.5, 7, 21, 3.5, 17, 4.5, 13, 11],
    [1.25, 1.5, 4.25, 14, 7, 4.5, 3.25],
    [2.7, 4.4, 1.25, 1.6, 4, 12, 13, 6],
    [0.7, 5.5, 16, 17, 15, 19, 24],
  ]
  let pu = 0
  let objet = ''
  do {
    const index1 = randint(0, 4)
    const index2 = randint(0, listeDeChoses[index1].length - 1)
    objet = listeDeChoses[index1][index2]
    pu = listeDePrixUnit[index1][index2]
    entier = Boolean(entier)
  } while ((entier && pu % 1 !== 0) || (!entier && pu % 1 === 0))
  return [
    objet,
    1,
    pu,
    `\\text{${premiereLettreEnMajuscule(objet)}}`,
    '\\text{Prix en euros}',
  ]
}
function carrelage(entier = true): [string, number, number, string, string] {
  const listeDeCarreaux: [string, number][] = [
    ['carreaux de 10x10', 92],
    ['carreaux de 20x20', 24],
    ['carreaux de 20x10', 46],
    ['carreaux de 33x33', 9],
    ['carreaux de 40x20', 12],
    ['carreaux de 40x40', 6.5],
    ['carreaux de 50x50', 4],
    ['carreaux de 60x60', 3],
    ['carreaux de 60x20', 7],
    ['carreaux de 30x10', 32],
    ['carreaux de 40x15', 18],
    ['carreaux de 50x25', 8],
    ['carreaux de 33x20', 15],
    ['carreaux de 30x30', 10.5],
    ['carreaux de 30x20', 15.75],
    ['carreaux de 40x33', 7.25],
  ]

  const entete1 = '\\text{Surface en m}^2'
  const entete2 = '\\text{Nombre de carreaux}'
  const carreau = entier
    ? choice(listeDeCarreaux.filter((el) => el[1] % 1 === 0))
    : choice(listeDeCarreaux.filter((el) => el[1] % 1 !== 0))
  return [carreau[0], 1, carreau[1], entete1, entete2]
}

function dillution(entier = true): [string, number, number, string, string] {
  const liste = [
    {
      solute: 'sirop',
      volumeUnitaire: [12, 15, 18],
      unite_solute: 'cL',
      unite_solvant: ['L', 'L'], // liste pour [0] singulier [1] pluriel
    },
    {
      solute: 'nettoyant pour sol',
      volumeUnitaire: [6, 8, 14, 12],
      unite_solute: 'cL',
      unite_solvant: ['L', 'L'],
    },
    {
      solute: 'médicament',
      volumeUnitaire: [3.2, 3.5, 4.25, 4.5, 5.25, 7.5],
      unite_solute: 'mL',
      unite_solvant: ['dL', 'dL'],
    },
    {
      solute: 'produit pour piscine',
      volumeUnitaire: [1.2, 0.8, 1.5],
      unite_solute: 'L',
      unite_solvant: ['dizaine de mètres cubes', 'dizaines de mètres cubes'],
    },
    {
      solute: 'liquide de rinçage concentré',
      volumeUnitaire: [1.25, 0.75, 0.25],
      unite_solute: 'cL',
      unite_solvant: ['L', 'L'],
    },
    {
      solute: 'lessive',
      volumeUnitaire: [8, 13, 9],
      unite_solute: 'g',
      unite_solvant: ['L', 'L'],
    },
    {
      solute: 'peinture',
      volumeUnitaire: [1.2, 1.4, 1.6],
      unite_solute: 'L',
      unite_solvant: ['L', 'L'],
    },

    {
      solute: 'vinaigre',
      volumeUnitaire: [25, 15, 22, 24],
      unite_solute: 'cL',
      unite_solvant: ['L', 'L'],
    },
  ]
  let alea1 = 0
  let alea2 = 0
  do {
    entier = Boolean(entier)
    alea1 = randint(0, liste.length - 1) // pour le choix du soluté
    alea2 = randint(0, liste[alea1].volumeUnitaire.length - 1) // pour le choix du volume pour une unité de solvant
  } while (
    (entier && liste[alea1].volumeUnitaire[alea2] % 1 !== 0) ||
    (!entier && liste[alea1].volumeUnitaire[alea2] % 1 === 0)
  )
  return [
    liste[alea1].solute,
    1,
    liste[alea1].volumeUnitaire[alea2],
    `\\text{Volume de ${liste[alea1].solute} (${liste[alea1].unite_solute})}`,
    `\\text{Volume d'eau (${liste[alea1].unite_solvant[0]})}`,
  ]
}

function combinaisonLineaire(x: number, y: number, a: number, b: number) {
  return a * x + b * y
}
const listeCombinaisons = [
  [
    [1, 1],
    [1, -1],
    [0, 2],
    [0, 10],
    [0, 0.5],
  ],
  [
    [1, 1],
    [1, -1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 10],
    [0, 0.5],
  ],
  [
    [1, 1],
    [1, -1],
    [1, 2],
    [0, 5],
    [-1, 2],
    [1, 4],
    [1, 10],
    [1, 3],
    [0, 0.5],
  ],
]
const couplesPremiersEntreEux = [
  [2, 3],
  [2, 5],
  [2, 7],
  [2, 9],
  [3, 4],
  [3, 5],
  [3, 7],
  [4, 5],
  [4, 7],
  [5, 6],
  [5, 9],
  [6, 7],
]
function redaction(
  x: number,
  y: number,
  a: number,
  b: number,
  pu: number,
): string {
  const nbNew = combinaisonLineaire(x, y, a, b)
  const pNew = combinaisonLineaire(pu * x, pu * y, a, b)
  if (a === 0 || b === 0) {
    return `Comme $${texNombre(nbNew, 2)} = ${
      a === 0
        ? `${
            b % 1 === 0
              ? `${miseEnEvidence(texNombre(b, 2), bleuMathalea)}\\times ${texNombre(y, 2)}`
              : `${texNombre(y, 2)}\\div ${miseEnEvidence(Math.round(1 / b), bleuMathalea)}`
          }`
        : `${
            a % 1 === 0
              ? `${miseEnEvidence(texNombre(a, 2), bleuMathalea)}\\times ${texNombre(x, 2)}`
              : `${texNombre(x, 2)}\\div ${miseEnEvidence(Math.round(1 / a), bleuMathalea)}`
          }`
    }$, on a $${
      a === 0
        ? `${
            b % 1 === 0
              ? `${miseEnEvidence(texNombre(b, 2), bleuMathalea)}\\times ${texNombre(y * pu, 2)}`
              : `${texNombre(y * pu, 2)}\\div ${miseEnEvidence(Math.round(1 / b), bleuMathalea)}`
          }`
        : `${
            a % 1 === 0
              ? `${miseEnEvidence(texNombre(a, 2), bleuMathalea)}\\times ${texNombre(x * pu, 2)}`
              : `${texNombre(x * pu, 2)}\\div ${miseEnEvidence(Math.round(1 / a), bleuMathalea)}`
          }`
    }=${miseEnEvidence(texNombre(pNew, 2))}$.`
  }
  if (a === 1) {
    if (b === 1) {
      return `Comme $${texNombre(nbNew, 2)} = ${miseEnEvidence(texNombre(x, 2), bleuMathalea)} + ${miseEnEvidence(texNombre(y, 2), 'green')}$, on a $${miseEnEvidence(texNombre(x * pu, 2), bleuMathalea)} + ${miseEnEvidence(texNombre(y * pu, 2), 'green')} = ${miseEnEvidence(texNombre(pNew, 2))}$.`
    }
    if (b === -1) {
      return `Comme $${texNombre(nbNew, 2)} = ${miseEnEvidence(texNombre(x, 2), bleuMathalea)} - ${miseEnEvidence(texNombre(y, 2), 'green')}$, on a $${miseEnEvidence(texNombre(x * pu, 2), bleuMathalea)} - ${miseEnEvidence(texNombre(y * pu, 2), 'green')} = ${miseEnEvidence(texNombre(pNew, 2))}$.`
    }
    return `Comme $${texNombre(nbNew, 2)} = ${miseEnEvidence(texNombre(x, 2), 'green')} + ${`${
      b % 1 === 0
        ? `${miseEnEvidence(texNombre(b, 2), bleuMathalea)}\\times ${texNombre(y, 2)}`
        : `${texNombre(y, 2)}\\div ${miseEnEvidence(Math.round(1 / b), bleuMathalea)}`
    }`}$, on a $${miseEnEvidence(texNombre(x * pu, 2), 'green')} + ${`${
      b % 1 === 0
        ? `${miseEnEvidence(texNombre(b, 2), bleuMathalea)}\\times ${texNombre(y * pu, 2)}`
        : `${texNombre(y * pu, 2)}\\div ${miseEnEvidence(Math.round(1 / b), bleuMathalea)}`
    }`} = ${miseEnEvidence(texNombre(pNew, 2))}$.`
  }
  if (a === -1) {
    if (b === 1) {
      return `Comme $${texNombre(nbNew, 2)} = ${miseEnEvidence(texNombre(y, 2), bleuMathalea)}-${miseEnEvidence(texNombre(x, 2), 'green')}$, on a $${miseEnEvidence(texNombre(y * pu, 2), bleuMathalea)}-${miseEnEvidence(texNombre(x * pu, 2), 'green')} = ${miseEnEvidence(texNombre(pNew, 2))}$.`
    }
    return `Comme $${texNombre(nbNew, 2)} = ${`${
      b % 1 === 0
        ? `${miseEnEvidence(texNombre(b, 2), bleuMathalea)}\\times ${texNombre(y, 2)}`
        : `${texNombre(y, 2)}\\div ${miseEnEvidence(Math.round(1 / b), bleuMathalea)}`
    }`}-${texNombre(x, 2)}$, on a $ ${`${
      b % 1 === 0
        ? `${miseEnEvidence(texNombre(b, 2), bleuMathalea)}\\times ${texNombre(y * pu, 2)}`
        : `${texNombre(y * pu, 2)}\\div ${miseEnEvidence(Math.round(1 / b), bleuMathalea)}`
    }`} = ${miseEnEvidence(texNombre((x + b * y) * pu, 2))}-${texNombre(x * pu, 2)} = ${texNombre(pNew, 2)}$.`
  } else {
    // ici a est différent de 1 et -1
    if (b === 1) {
      return `Comme $${texNombre(nbNew, 2)} = ${a % 1 === 0 ? `${miseEnEvidence(texNombre(a, 2), bleuMathalea)}\\times ${texNombre(x, 2)}` : `${texNombre(x, 2)}\\div ${miseEnEvidence(Math.round(1 / a), bleuMathalea)}`} + ${miseEnEvidence(texNombre(y, 2), 'green')}$, on a $${a % 1 === 0 ? `${miseEnEvidence(texNombre(a, 2), bleuMathalea)}\\times ${texNombre(x * pu, 2)}` : `${texNombre(x * pu, 2)}\\div ${miseEnEvidence(Math.round(1 / a), bleuMathalea)}`}  + ${miseEnEvidence(texNombre(y * pu, 2), 'green')} = ${miseEnEvidence(texNombre(pNew, 2))}$.`
    }
    if (b === -1) {
      return `Comme $${texNombre(nbNew, 2)} = ${a % 1 === 0 ? `${miseEnEvidence(texNombre(a, 2), bleuMathalea)}\\times ${texNombre(x, 2)}` : `${texNombre(x, 2)}\\div ${miseEnEvidence(Math.round(1 / a), bleuMathalea)}`} - ${miseEnEvidence(texNombre(y, 2), 'green')}$, on a $${a % 1 === 0 ? `${miseEnEvidence(texNombre(a, 2), bleuMathalea)}\\times ${texNombre(x * pu, 2)}` : `${texNombre(x * pu, 2)}\\div ${miseEnEvidence(Math.round(1 / a), bleuMathalea)}`} - ${miseEnEvidence(texNombre(y * pu, 2), 'green')} = ${miseEnEvidence(texNombre(pNew, 2))}$.`
    }
    // et b différent de 1 et -1
    return `Comme $${texNombre(nbNew, 2)} = ${a % 1 === 0 ? `${miseEnEvidence(texNombre(a, 2), bleuMathalea)}\\times ${texNombre(x, 2)}` : `${texNombre(x, 2)}\\div ${miseEnEvidence(Math.round(1 / a), bleuMathalea)}`} + ${
      b % 1 === 0
        ? `${miseEnEvidence(texNombre(b, 2), 'green')}\\times ${texNombre(y, 2)}`
        : `${texNombre(y, 2)}\\div ${miseEnEvidence(Math.round(1 / b), 'green')}`
    }, on a $${a % 1 === 0 ? `${miseEnEvidence(texNombre(a, 2), bleuMathalea)}\\times ${texNombre(x * pu, 2)}` : `${texNombre(x * pu, 2)}\\div ${miseEnEvidence(Math.round(1 / a), bleuMathalea)}`}
      + ${
        b % 1 === 0
          ? `${miseEnEvidence(texNombre(b, 2), 'green')}\\times ${texNombre(y * pu, 2)}`
          : `${texNombre(y * pu, 2)}\\div ${miseEnEvidence(Math.round(1 / b), 'green')}`
      } = ${miseEnEvidence(texNombre(pNew, 2))}$.`
  }
}
export default class ProportionnaliteParLinearite2 extends Exercice {
  constructor() {
    super()
    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
    this.nbQuestions = 6
    this.besoinFormulaireCaseACocher = ['calculs entiers', true]
    this.sup = true
    this.besoinFormulaire3Texte = [
      'Types de tableaux',
      'Nombres séparés par des tirets :\n1 : Première ligne imposée\n2 : Cases à remplir sur ligne 1 ou 2\n3 : Mélange',
    ]
    this.sup3 = '1'

    this.besoinFormulaire2Texte = [
      'Type de combinaisons',
      'Nombres séparés par des tirets :\n1 : Faciles\n2 : Moyennes\n3 : Difficiles\n4 : Mélange',
    ]
    this.sup2 = '1'
    this.besoinFormulaire4CaseACocher = [
      'Deux premières colonnes imposées',
      true,
    ]
    this.sup4 = true
  }

  nouvelleVersion() {
    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
    const listeTypesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 2,
      nbQuestions: this.nbQuestions,
      melange: 3,
      defaut: 1,
    }).map(Number)
    const difficulté = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      nbQuestions: this.nbQuestions,
      melange: 4,
      defaut: 1,
    }).map(Number)
    this.consigne =
      this.nbQuestions === 1
        ? 'Compléter le tableau de proportionnalité ci dessous.'
        : 'Compléter les tableaux de proportionnalité ci-dessous.'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const fonctionChoisie = choice([achat, achat, dillution, carrelage])
      const nbo: number[] = []
      const prix: number[] = []
      const coefficients = combinaisonListes(
        listeCombinaisons[difficulté[i] - 1],
        12,
      ) // On prévoit 12 combinaisons pour être sûr d'en avoir 3 différentes qui fonctionnent
      const [objet, u, pu, entete1, entete2] = fonctionChoisie(this.sup) // achat(this.sup)
      const ligne1 = [entete1]
      const ligne2 = [entete2]
      const ligne1Corr = [entete1]
      const ligne2Corr = [entete2]
      const couple = choice(couplesPremiersEntreEux) // On choisit les 2 premiers nombres qui sont premiers entre eux
      nbo.push(...couple)
      const corrections: string[] = []
      const A: number[] = []
      const B: number[] = []
      const X: number[] = []
      const Y: number[] = []
      for (let j = 2, index = 0; j < 5;) {
        // On va chercher les 3 autres nombres
        if (index >= coefficients.length) {
          index = 0
        }
        const [a, b] = shuffle(coefficients[index])
        const x = choice(nbo) * u
        const y = choice(nbo, [x / u]) * u
        const nbNew = combinaisonLineaire(x, y, a, b)
        if (!nbo.includes(nbNew) && nbNew > 1 && nbNew % 1 === 0) {
          nbo.push(nbNew)
          j++
          A.push(a)
          B.push(b)
          X.push(x)
          Y.push(y)
        }
        index++
      }
      for (let j = 0; j < nbo.length; j++) {
        prix.push(nbo[j] * pu)
      }
      const hautBas: (1 | 2 | 3)[] = []
      const indexes = this.sup4 ? [0, 1, 2, 3, 4] : shuffle([0, 1, 2, 3, 4])
      const valeursLigne1: string[] = []
      const valeursLigne2: string[] = []
      const valeursLigne1Corr: string[] = []
      const valeursLigne2Corr: string[] = []
      const reponses: string[] = []
      for (let j = 0; j < nbo.length; j++) {
        if (j < 2) {
          hautBas.push(3)
          valeursLigne1.push(texNombre(nbo[j] * u, 0))
          valeursLigne2.push(texNombre(nbo[j] * pu, 2))
          valeursLigne1Corr.push(texNombre(nbo[j] * u, 0))
          valeursLigne2Corr.push(texNombre(nbo[j] * pu, 2))
          reponses.push(String(nbo[j])) // On s'en fiche, ce ne sera pas lu
        } else if (listeTypesDeQuestions[i] === 1) {
          hautBas.push(2)
          corrections.push(
            redaction(X[j - 2], Y[j - 2], A[j - 2], B[j - 2], pu),
          )
          valeursLigne1.push(texNombre(nbo[j] * u, 0))
          valeursLigne2.push('')
          reponses.push(texNombre(nbo[j] * pu, 2))
          valeursLigne1Corr.push(texNombre(nbo[j] * u, 0))
          valeursLigne2Corr.push(miseEnEvidence(texNombre(nbo[j] * pu, 2)))
        } else {
          if (
            Math.random() < 0.4 ||
            valeursLigne1.find((el) => el === '') == null
          ) {
            // On met au moins une case vide en première ligne.
            hautBas.push(1)
            valeursLigne1.push('')
            valeursLigne2.push(texNombre(nbo[j] * pu, 2))
            valeursLigne1Corr.push(miseEnEvidence(texNombre(nbo[j] * u, 0)))
            valeursLigne2Corr.push(texNombre(nbo[j] * pu, 2))
            reponses.push(texNombre(nbo[j] * u, 2))
            corrections.push(
              redaction(
                X[j - 2] * pu,
                Y[j - 2] * pu,
                A[j - 2],
                B[j - 2],
                1 / pu,
              ),
            )
          } else {
            hautBas.push(2)
            valeursLigne1.push(texNombre(nbo[j] * u, 0))
            valeursLigne2.push('')
            valeursLigne1Corr.push(texNombre(nbo[j] * u, 0))
            valeursLigne2Corr.push(miseEnEvidence(texNombre(nbo[j] * pu, 2)))
            reponses.push(texNombre(nbo[j] * pu, 2))
            corrections.push(
              redaction(X[j - 2], Y[j - 2], A[j - 2], B[j - 2], pu),
            )
          }
        }
      }
      const correctionsOrdonnees: string[] = []
      const answers = []
      for (let j = 0; j < indexes.length; j++) {
        const index = indexes[j]
        const indexBack = indexes.findIndex((el) => el === index)
        if (hautBas[index] === 1) {
          answers.push([
            `L0C${j + 1}`,
            { value: reponses[index], bareme: toutAUnPoint },
          ])
        }
        if (hautBas[index] === 2) {
          answers.push([`L1C${j + 1}`, { value: reponses[index] }])
        }
        ligne1.push(valeursLigne1[index])
        ligne2.push(valeursLigne2[index])
        ligne1Corr.push(valeursLigne1Corr[index])
        ligne2Corr.push(valeursLigne2Corr[index])
        if (corrections[indexBack])
          correctionsOrdonnees.push(corrections[indexBack])
      }
      answers.push(['bareme', toutAUnPoint])
      handleAnswers(this, i, Object.fromEntries(answers), {
        formatInteractif: 'tableauMathlive',
      })
      const cells = AddTabPropMathlive.convertTableauToTableauMathlive(
        ligne1,
        ligne2,
      )
      const cellsCorr = AddTabPropMathlive.convertTableauToTableauMathlive(
        ligne1Corr,
        ligne2Corr,
      )
      const tableauCorr = AddTabPropMathlive.create(
        this.numeroExercice ?? 0,
        i,
        cellsCorr,
        'tableauMathlive',
        false,
        {},
      )
      const tableau = AddTabPropMathlive.create(
        this.numeroExercice ?? 0,
        i,
        cells,
        'tableauMathlive',
        this.interactif,
        {},
      )

      if (this.questionJamaisPosee(i, objet)) {
        // Si la question n'a jamais été posée, on la garde.
        this.listeQuestions.push(
          context.isHtml ? tableau.output : tableau.latexOutput,
        )
        this.listeCorrections.push(
          (context.isHtml ? tableauCorr.output : tableauCorr.latexOutput) +
            '<br>' +
            correctionsOrdonnees.join('<br>'),
        )
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
