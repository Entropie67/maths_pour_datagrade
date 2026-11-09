import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnBoite,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Appliquer un programme de calcul à un nombre'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '06/10/2026'

/**
 * Appliquer un programme de calcul à un nombre donné (sans lettre) :
 * étape préalable à la traduction d'un programme de calcul par une expression
 * littérale (5N5A-2).
 * Certains programmes s'appuient sur le nombre de départ (« ajouter le double
 * du nombre de départ »), d'autres non. Tous les calculs intermédiaires sont des
 * entiers faciles à effectuer de tête.
 * @author Rémi Angot
 */
export const uuid = 'b1ffb'

export const refs = {
  'fr-fr': ['5N1D-9'],
  'fr-ch': ['9R1NO8C-5', '9R2NO8C-5', '9R3NO8C-5', 'PRQST02B-5'],
}

type Operation = 'ajouter' | 'soustraire' | 'multiplier' | 'diviser'

const signes: Record<Operation, string> = {
  ajouter: '+',
  soustraire: '-',
  multiplier: '\\times ',
  diviser: '\\div ',
}

type Etape = {
  operation: Operation
  /** Nombre affiché dans l'énoncé, ou multiple du nombre de départ (1, 2 ou 3) si `surDepart` */
  nombre: number
  surDepart: boolean
}

type Programme = {
  depart: number
  etapes: Etape[]
  /** `valeurs[j]` est le nombre obtenu après l'étape `j` */
  valeurs: number[]
}

const valeurMax = 60
const multiplicateurs = [2, 3, 4, 5]
const libellesMultiplesDuDepart = [
  '',
  'le nombre de départ',
  'le double du nombre de départ',
  'le triple du nombre de départ',
]

/** Valeur ajoutée ou retranchée par une étape additive (négative si le nombre de départ l'est). */
function operande(etape: Etape, depart: number) {
  return etape.surDepart ? etape.nombre * depart : etape.nombre
}

/**
 * Tire un programme dont tous les calculs sont mentaux et à résultats entiers non nuls.
 * Les étapes additives et multiplicatives alternent. Sans relatifs, tous les nombres
 * sont positifs ; avec relatifs, au moins un nombre rencontré est négatif et les
 * multiplications et divisions ne portent que sur des nombres positifs.
 * Renvoie `null` si le tirage ne convient pas.
 */
function tirerProgramme(
  avecRelatifs: boolean,
  utiliseLeDepart: boolean,
): Programme | null {
  const depart = avecRelatifs ? randint(-9, 9, [0]) : randint(2, 12)
  const nbEtapes = randint(3, 4)
  const commenceParAdditive = choice([true, false])
  const indicesAdditifs = [...Array(nbEtapes).keys()].filter(
    (j) => (j % 2 === 0) === commenceParAdditive,
  )
  // Jamais dès la première opération : « Choisir un nombre, puis ajouter le nombre de départ » serait redondant
  const indiceSurDepart = utiliseLeDepart
    ? choice(indicesAdditifs.filter((j) => j > 0))
    : -1
  const etapes: Etape[] = []
  const valeurs: number[] = []
  let valeur = depart
  for (let j = 0; j < nbEtapes; j++) {
    let etape: Etape
    if (indicesAdditifs.includes(j)) {
      const operation = choice<Operation>(['ajouter', 'soustraire'])
      if (j === indiceSurDepart) {
        // Le double et le triple d'un nombre négatif sont hors programme de 5e
        const multiple = depart > 0 ? choice([1, 2, 3]) : 1
        etape = { operation, nombre: multiple, surDepart: true }
      } else {
        etape = { operation, nombre: randint(2, 12), surDepart: false }
      }
      const variation = operande(etape, depart)
      valeur += operation === 'ajouter' ? variation : -variation
    } else {
      if (valeur <= 0) return null
      const diviseurs = multiplicateurs.filter((d) => valeur % d === 0)
      const facteurs = multiplicateurs.filter((n) => valeur * n <= valeurMax)
      if (
        diviseurs.length > 0 &&
        (facteurs.length === 0 || choice([true, false]))
      ) {
        const nombre = choice(diviseurs)
        etape = { operation: 'diviser', nombre, surDepart: false }
        valeur /= nombre
      } else if (facteurs.length > 0) {
        const nombre = choice(facteurs)
        etape = { operation: 'multiplier', nombre, surDepart: false }
        valeur *= nombre
      } else {
        return null
      }
    }
    if (valeur === 0 || Math.abs(valeur) > valeurMax) return null
    if (!avecRelatifs && valeur < 0) return null
    etapes.push(etape)
    valeurs.push(valeur)
  }
  if (avecRelatifs && [depart, ...valeurs].every((v) => v > 0)) return null
  return { depart, etapes, valeurs }
}

function phraseEtape(etape: Etape) {
  const verbes: Record<Operation, string> = {
    ajouter: 'Ajouter',
    soustraire: 'Soustraire',
    multiplier: 'Multiplier par',
    diviser: 'Diviser par',
  }
  const complement = etape.surDepart
    ? libellesMultiplesDuDepart[etape.nombre]
    : `$${etape.nombre}$`
  return `${verbes[etape.operation]} ${complement}.`
}

/** Écriture de l'opérande dans un calcul : `7`, `(-4)` ou `2\times7`. */
function operandeTex(etape: Etape, depart: number) {
  if (!etape.surDepart) return `${etape.nombre}`
  return etape.nombre === 1
    ? ecritureParentheseSiNegatif(depart)
    : `${etape.nombre}\\times${depart}`
}

/** Calcul d'une étape sur une ligne, avec le calcul intermédiaire du multiple du nombre de départ. */
function calculTex(etape: Etape, avant: number, apres: number, depart: number) {
  const debut = `${avant}${signes[etape.operation]}${operandeTex(etape, depart)}`
  if (etape.surDepart && etape.nombre > 1) {
    return `${debut}=${avant}${signes[etape.operation]}${etape.nombre * depart}=${apres}`
  }
  return `${debut}=${apres}`
}

/** Calcul écrit au-dessus de la flèche. */
function etiquetteFlecheTex(etape: Etape, depart: number) {
  return `${signes[etape.operation]}${operandeTex(etape, depart)}`
}

export default class AppliquerUnProgrammeDeCalcul extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireCaseACocher = ['Avec des nombres relatifs', false]
    this.besoinFormulaire2Numerique = [
      'Présentation de la correction',
      2,
      '1 : Un calcul par ligne\n2 : Des flèches',
    ]
    this.sup = false
    this.sup2 = 1
  }

  nouvelleVersion() {
    // Alternance de programmes qui utilisent le nombre de départ et de programmes qui ne l'utilisent pas
    const utilisationsDuDepart = combinaisonListes(
      [false, true],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let programme: Programme | null = null
      for (let essai = 0; essai < 200 && programme === null; essai++) {
        programme = tirerProgramme(this.sup, utilisationsDuDepart[i])
      }
      if (programme === null) {
        cpt++
        continue
      }
      const { depart, etapes, valeurs } = programme
      const resultat = valeurs[valeurs.length - 1]

      // Plus d'air entre l'introduction et le cadre en HTML uniquement (isHtml reste vrai en Typst)
      const espaceAvantCadre = context.isHtml && !context.isTypst ? '<br>' : ''
      let texte = `Voici un programme de calcul :<br>${espaceAvantCadre}`
      texte += texteEnBoite(
        createList({
          items: ['Choisir un nombre.', ...etapes.map(phraseEtape)],
          style: 'puces',
          classOptions: 'list-disc!',
        }),
      )
      // En Typst, un seul saut de ligne suffit : le cadre est en ligne et a déjà ses marges
      texte += `${context.isTypst ? '<br>' : '<br><br>'}Quel est le résultat de ce programme si on choisit $${depart}$ comme nombre de départ ?`
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
      }

      let texteCorr = texteEnCouleur(
        `On choisit $${depart}$ comme nombre de départ.`,
        bleuMathalea,
      )
      texteCorr += '<br>'
      if (this.sup2 === 2) {
        let chaine = `${depart}`
        etapes.forEach((etape, j) => {
          chaine += `\\xrightarrow{${etiquetteFlecheTex(etape, depart)}}${valeurs[j]}`
        })
        // Espace vertical autour de la ligne de calculs fléchés
        texteCorr += `<br>$${chaine}$<br>`
      } else {
        texteCorr += etapes
          .map(
            (etape, j) =>
              `$${calculTex(etape, j === 0 ? depart : valeurs[j - 1], valeurs[j], depart)}$`,
          )
          .join('<br>')
      }
      texteCorr += `<br>Le résultat du programme est donc $${miseEnEvidence(resultat)}$ si le nombre de départ est $${depart}$.`

      handleAnswers(
        this,
        i,
        { reponse: { value: resultat } },
        { formatInteractif: 'mathalea-mathfield' },
      )

      if (
        this.questionJamaisPosee(
          i,
          depart,
          ...etapes.map((etape) => phraseEtape(etape)),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
